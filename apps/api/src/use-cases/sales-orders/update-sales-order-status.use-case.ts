import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { ISalesOrderRepository } from '@/domain/ports/repositories/sales-order.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { ILotRepository } from '@/domain/ports/repositories/lot.repository';
import { SalesOrder, SalesOrderStatus } from '@/domain/entities/sales-order.entity';
import { NotFoundError, ValidationError, InsufficientStockError } from '@/domain/errors/domain.error';

const VALID_TRANSITIONS: Record<SalesOrderStatus, SalesOrderStatus[]> = {
  PENDING: ['PREPARING', 'CANCELLED'],
  PREPARING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class UpdateSalesOrderStatusUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('ISalesOrderRepository') private readonly salesOrderRepository: ISalesOrderRepository,
    @Inject('IInventoryMovementRepository') private readonly inventoryMovementRepository: IInventoryMovementRepository,
    @Inject('ILotRepository') private readonly lotRepository: ILotRepository,
  ) {}

  async execute(
    id: string,
    newStatus: SalesOrderStatus,
    updatedBy: string,
    version: number,
  ): Promise<SalesOrder> {
    const order = await this.salesOrderRepository.findById(id);
    if (!order) throw new NotFoundError('SalesOrder', id);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    switch (newStatus) {
      case 'PREPARING':
        return this.prepareOrder(order, updatedBy, version);
      case 'SHIPPED':
        return this.shipOrder(order, updatedBy, version);
      case 'CANCELLED':
        return this.cancelOrder(order, updatedBy, version);
      case 'DELIVERED':
        return this.salesOrderRepository.updateStatus(id, 'DELIVERED', updatedBy, version, {
          deliveredDate: new Date(),
        });
      default:
        return this.salesOrderRepository.updateStatus(id, newStatus, updatedBy, version);
    }
  }

  private async prepareOrder(
    order: SalesOrder,
    updatedBy: string,
    version: number,
  ): Promise<SalesOrder> {
    return this.prisma.$transaction(async () => {
      // Validate available stock for each item
      for (const item of order.items || []) {
        const totalStock = await this.inventoryMovementRepository.getStockByProductAndLocation(
          item.productId,
          order.locationId,
        );
        const reservedStock = await this.salesOrderRepository.getReservedStockByProduct(
          item.productId,
          order.locationId,
        );
        const availableStock = totalStock - reservedStock;

        if (availableStock < item.quantity) {
          throw new InsufficientStockError(item.productId, availableStock, item.quantity);
        }

        // Reserve stock
        await this.salesOrderRepository.updateItemReservedQty(item.id, item.quantity);
      }

      return this.salesOrderRepository.updateStatus(order.id, 'PREPARING', updatedBy, version);
    });
  }

  private async shipOrder(
    order: SalesOrder,
    updatedBy: string,
    version: number,
  ): Promise<SalesOrder> {
    return this.prisma.$transaction(async () => {
      // FEFO: deduct from lots ordered by expiration date ASC
      for (const item of order.items || []) {
        const lots = await this.lotRepository.findByProductAndLocation(
          item.productId,
          order.locationId,
        );

        // Filter to GOOD condition lots with stock, already sorted by expirationDate ASC
        const availableLots = lots.filter((l) => l.condition === 'GOOD' && l.quantity > 0);

        let remaining = item.quantity;

        for (const lot of availableLots) {
          if (remaining <= 0) break;

          const deduct = Math.min(remaining, lot.quantity);

          await this.inventoryMovementRepository.create({
            productId: item.productId,
            type: 'OUT',
            subType: 'SALE',
            quantity: deduct,
            originLocationId: order.locationId,
            referenceDocument: order.orderNumber,
            lotId: lot.id,
            createdBy: updatedBy,
          });

          await this.lotRepository.updateQuantity(lot.id, -deduct, updatedBy);
          remaining -= deduct;
        }

        // If lots didn't cover full quantity, create a movement without lot (fallback)
        if (remaining > 0) {
          await this.inventoryMovementRepository.create({
            productId: item.productId,
            type: 'OUT',
            subType: 'SALE',
            quantity: remaining,
            originLocationId: order.locationId,
            referenceDocument: order.orderNumber,
            createdBy: updatedBy,
          });
        }
      }

      // Clear reservations
      await this.salesOrderRepository.clearItemsReservedQty(order.id);

      return this.salesOrderRepository.updateStatus(order.id, 'SHIPPED', updatedBy, version, {
        shippedDate: new Date(),
      });
    });
  }

  private async cancelOrder(
    order: SalesOrder,
    updatedBy: string,
    version: number,
  ): Promise<SalesOrder> {
    return this.prisma.$transaction(async () => {
      // Release reservations if order was in PREPARING status
      if (order.status === 'PREPARING') {
        await this.salesOrderRepository.clearItemsReservedQty(order.id);
      }
      return this.salesOrderRepository.updateStatus(order.id, 'CANCELLED', updatedBy, version);
    });
  }
}
