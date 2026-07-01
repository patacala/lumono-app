import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  ISalesOrderRepository,
  CreateSalesOrderDto,
  SalesOrderFilters,
} from '@/domain/ports/repositories/sales-order.repository';
import { SalesOrder, SalesOrderStatus } from '@/domain/entities/sales-order.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class SalesOrderRepositoryImpl implements ISalesOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: SalesOrderFilters,
  ): Promise<{ data: SalesOrder[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;

    const [orders, total] = await Promise.all([
      this.prisma.salesOrder.findMany({
        where,
        include: {
          customer: { select: { name: true } },
          location: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.salesOrder.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
    };
  }

  async findById(id: string): Promise<SalesOrder | null> {
    const order = await this.prisma.salesOrder.findUnique({
      where: { id, deletedAt: null },
      include: {
        customer: { select: { name: true } },
        location: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
      },
    });
    return order ? this.mapToEntity(order) : null;
  }

  async create(
    data: CreateSalesOrderDto & { orderNumber: string; totalAmount: number },
  ): Promise<SalesOrder> {
    const order = await this.prisma.salesOrder.create({
      data: {
        orderNumber: data.orderNumber,
        customerId: data.customerId,
        locationId: data.locationId,
        notes: data.notes,
        totalAmount: data.totalAmount,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: {
        customer: { select: { name: true } },
        location: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
      },
    });
    return this.mapToEntity(order);
  }

  async updateStatus(
    id: string,
    status: SalesOrderStatus,
    updatedBy: string,
    expectedVersion: number,
    extra?: { shippedDate?: Date; deliveredDate?: Date },
  ): Promise<SalesOrder> {
    try {
      const order = await this.prisma.salesOrder.update({
        where: { id, version: expectedVersion, deletedAt: null },
        data: {
          status,
          updatedBy,
          shippedDate: extra?.shippedDate,
          deliveredDate: extra?.deliveredDate,
          version: { increment: 1 },
        },
        include: {
          customer: { select: { name: true } },
          location: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
        },
      });
      return this.mapToEntity(order);
    } catch (error: any) {
      if (error.code === 'P2025') throw new OptimisticLockError();
      throw error;
    }
  }

  async updateItemReservedQty(itemId: string, reservedQty: number): Promise<void> {
    await this.prisma.salesOrderItem.update({
      where: { id: itemId },
      data: { reservedQty },
    });
  }

  async clearItemsReservedQty(salesOrderId: string): Promise<void> {
    await this.prisma.salesOrderItem.updateMany({
      where: { salesOrderId },
      data: { reservedQty: 0 },
    });
  }

  async getNextOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `SO-${year}-`;
    const lastOrder = await this.prisma.salesOrder.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    const nextSeq = lastOrder
      ? parseInt(lastOrder.orderNumber.replace(prefix, ''), 10) + 1
      : 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  async getReservedStockByProduct(productId: string, locationId?: string): Promise<number> {
    const where: any = {
      productId,
      reservedQty: { gt: 0 },
      salesOrder: {
        status: 'PREPARING',
        deletedAt: null,
      },
    };
    if (locationId) {
      where.salesOrder.locationId = locationId;
    }
    const result = await this.prisma.salesOrderItem.aggregate({
      where,
      _sum: { reservedQty: true },
    });
    return result._sum.reservedQty || 0;
  }

  async countByStatus(status: SalesOrderStatus): Promise<number> {
    return this.prisma.salesOrder.count({
      where: { status, deletedAt: null },
    });
  }

  private mapToEntity(order: any): SalesOrder {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customer?.name,
      status: order.status,
      shippedDate: order.shippedDate,
      deliveredDate: order.deliveredDate,
      notes: order.notes,
      locationId: order.locationId,
      locationName: order.location?.name,
      totalAmount: order.totalAmount ? parseFloat(order.totalAmount.toString()) : undefined,
      createdAt: order.createdAt,
      createdBy: order.createdBy,
      updatedAt: order.updatedAt,
      updatedBy: order.updatedBy,
      deletedAt: order.deletedAt,
      deletedBy: order.deletedBy,
      version: order.version,
      items: order.items?.map((item: any) => ({
        id: item.id,
        salesOrderId: item.salesOrderId,
        productId: item.productId,
        productName: item.product?.name,
        productSku: item.product?.sku,
        productUnit: item.product?.unit,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        reservedQty: item.reservedQty,
      })),
    };
  }
}
