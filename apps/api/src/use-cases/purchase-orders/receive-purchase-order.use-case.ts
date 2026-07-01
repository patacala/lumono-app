import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IPurchaseOrderRepository } from '@/domain/ports/repositories/purchase-order.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { ILotRepository } from '@/domain/ports/repositories/lot.repository';
import { PurchaseOrder } from '@/domain/entities/purchase-order.entity';
import { LotCondition } from '@/domain/entities/lot.entity';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

export interface ReceiveItemDto {
  purchaseOrderItemId: string;
  receivedQty: number;
  lotNumber: string;
  condition: LotCondition;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
}

export interface ReceivePurchaseOrderDto {
  items: ReceiveItemDto[];
  notes?: string;
}

@Injectable()
export class ReceivePurchaseOrderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IPurchaseOrderRepository') private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject('IInventoryMovementRepository') private readonly inventoryMovementRepository: IInventoryMovementRepository,
    @Inject('ILotRepository') private readonly lotRepository: ILotRepository,
  ) {}

  async execute(
    id: string,
    dto: ReceivePurchaseOrderDto,
    userId: string,
    version: number,
  ): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) throw new NotFoundError('PurchaseOrder', id);

    if (order.status !== 'IN_TRANSIT' && order.status !== 'PARTIALLY_RECEIVED') {
      throw new ValidationError(
        `Cannot receive order with status ${order.status}. Must be IN_TRANSIT or PARTIALLY_RECEIVED.`,
      );
    }

    return this.prisma.$transaction(async () => {
      // Build item map for quick lookup
      const itemMap = new Map(order.items?.map((i) => [i.id, i]));

      for (const receiveItem of dto.items) {
        const orderItem = itemMap.get(receiveItem.purchaseOrderItemId);
        if (!orderItem) {
          throw new ValidationError(`Item ${receiveItem.purchaseOrderItemId} not found in order`);
        }

        const newTotal = orderItem.receivedQty + receiveItem.receivedQty;
        if (newTotal > orderItem.quantity) {
          throw new ValidationError(
            `Cannot receive ${receiveItem.receivedQty} of "${orderItem.productName}". Already received ${orderItem.receivedQty} of ${orderItem.quantity} ordered.`,
          );
        }

        // Find or create lot
        let lot = await this.lotRepository.findByLotNumberAndProduct(
          receiveItem.lotNumber,
          orderItem.productId,
        );

        if (lot) {
          // Update existing lot quantity
          await this.lotRepository.updateQuantity(lot.id, receiveItem.receivedQty, userId);
        } else {
          // Create new lot
          lot = await this.lotRepository.create({
            lotNumber: receiveItem.lotNumber,
            productId: orderItem.productId,
            locationId: order.locationId,
            quantity: receiveItem.receivedQty,
            condition: receiveItem.condition,
            expirationDate: receiveItem.expirationDate,
            manufacturingDate: receiveItem.manufacturingDate,
            notes: receiveItem.notes,
            createdBy: userId,
          });
        }

        // Create IN inventory movement with lotId
        await this.inventoryMovementRepository.create({
          productId: orderItem.productId,
          type: 'IN',
          subType: 'PURCHASE',
          quantity: receiveItem.receivedQty,
          destLocationId: order.locationId,
          referenceDocument: order.orderNumber,
          unitPrice: orderItem.unitPrice,
          lotId: lot.id,
          createdBy: userId,
        });

        // Increment receivedQty on the order item
        await this.purchaseOrderRepository.incrementReceivedQty(
          orderItem.id,
          receiveItem.receivedQty,
        );

        // Update local copy for final check
        orderItem.receivedQty = newTotal;
      }

      // Create receipt record
      await this.purchaseOrderRepository.createReceipt({
        purchaseOrderId: order.id,
        receivedBy: userId,
        notes: dto.notes,
        items: dto.items.map((i) => ({
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQty: i.receivedQty,
          lotNumber: i.lotNumber,
          condition: i.condition,
          expirationDate: i.expirationDate,
          manufacturingDate: i.manufacturingDate,
          notes: i.notes,
        })),
      });

      // Determine new status
      const allComplete = order.items?.every((i) => i.receivedQty >= i.quantity) ?? false;
      const newStatus = allComplete ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

      return this.purchaseOrderRepository.updateStatus(
        order.id,
        newStatus,
        userId,
        version,
        allComplete ? { receivedDate: new Date() } : undefined,
      );
    });
  }
}
