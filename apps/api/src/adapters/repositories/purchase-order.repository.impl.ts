import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IPurchaseOrderRepository,
  CreatePurchaseOrderDto,
  CreateReceiptDto,
  PurchaseOrderFilters,
} from '@/domain/ports/repositories/purchase-order.repository';
import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderReceipt } from '@/domain/entities/purchase-order.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class PurchaseOrderRepositoryImpl implements IPurchaseOrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: PurchaseOrderFilters,
  ): Promise<{ data: PurchaseOrder[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filters?.status) where.status = filters.status;
    if (filters?.supplierId) where.supplierId = filters.supplierId;

    const [orders, total] = await Promise.all([
      this.prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { name: true } },
          location: { select: { name: true } },
          items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.purchaseOrder.count({ where }),
    ]);

    return {
      data: orders.map((o) => this.mapToEntity(o)),
      total,
    };
  }

  async findById(id: string): Promise<PurchaseOrder | null> {
    const order = await this.prisma.purchaseOrder.findUnique({
      where: { id, deletedAt: null },
      include: {
        supplier: { select: { name: true } },
        location: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
        receipts: {
          include: { items: true },
          orderBy: { receivedDate: 'desc' },
        },
      },
    });
    return order ? this.mapToEntity(order) : null;
  }

  async create(
    data: CreatePurchaseOrderDto & { orderNumber: string; totalAmount: number },
  ): Promise<PurchaseOrder> {
    const order = await this.prisma.purchaseOrder.create({
      data: {
        orderNumber: data.orderNumber,
        supplierId: data.supplierId,
        locationId: data.locationId,
        expectedDate: data.expectedDate,
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
        supplier: { select: { name: true } },
        location: { select: { name: true } },
        items: { include: { product: { select: { name: true, sku: true, unit: true } } } },
      },
    });
    return this.mapToEntity(order);
  }

  async updateStatus(
    id: string,
    status: PurchaseOrderStatus,
    updatedBy: string,
    expectedVersion: number,
    extra?: { receivedDate?: Date },
  ): Promise<PurchaseOrder> {
    try {
      const order = await this.prisma.purchaseOrder.update({
        where: { id, version: expectedVersion, deletedAt: null },
        data: {
          status,
          updatedBy,
          receivedDate: extra?.receivedDate,
          version: { increment: 1 },
        },
        include: {
          supplier: { select: { name: true } },
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

  async updateReceivedQty(itemId: string, receivedQty: number): Promise<void> {
    await this.prisma.purchaseOrderItem.update({
      where: { id: itemId },
      data: { receivedQty },
    });
  }

  async incrementReceivedQty(itemId: string, delta: number): Promise<void> {
    await this.prisma.purchaseOrderItem.update({
      where: { id: itemId },
      data: { receivedQty: { increment: delta } },
    });
  }

  async createReceipt(data: CreateReceiptDto): Promise<PurchaseOrderReceipt> {
    const receipt = await this.prisma.purchaseOrderReceipt.create({
      data: {
        purchaseOrderId: data.purchaseOrderId,
        receivedBy: data.receivedBy,
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            purchaseOrderItemId: item.purchaseOrderItemId,
            receivedQty: item.receivedQty,
            lotNumber: item.lotNumber,
            condition: item.condition,
            expirationDate: item.expirationDate,
            manufacturingDate: item.manufacturingDate,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    });
    return {
      id: receipt.id,
      purchaseOrderId: receipt.purchaseOrderId,
      receivedDate: receipt.receivedDate,
      receivedBy: receipt.receivedBy ?? undefined,
      notes: receipt.notes ?? undefined,
      items: receipt.items.map((i) => ({
        id: i.id,
        receiptId: i.receiptId,
        purchaseOrderItemId: i.purchaseOrderItemId,
        receivedQty: i.receivedQty,
        lotNumber: i.lotNumber,
        condition: i.condition as any,
        expirationDate: i.expirationDate ?? undefined,
        manufacturingDate: i.manufacturingDate ?? undefined,
        notes: i.notes ?? undefined,
      })),
    };
  }

  async getNextOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `PO-${year}-`;
    const lastOrder = await this.prisma.purchaseOrder.findFirst({
      where: { orderNumber: { startsWith: prefix } },
      orderBy: { orderNumber: 'desc' },
      select: { orderNumber: true },
    });
    const nextSeq = lastOrder
      ? parseInt(lastOrder.orderNumber.replace(prefix, ''), 10) + 1
      : 1;
    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
  }

  private mapToEntity(order: any): PurchaseOrder {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      supplierId: order.supplierId,
      supplierName: order.supplier?.name,
      status: order.status,
      expectedDate: order.expectedDate,
      receivedDate: order.receivedDate,
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
        purchaseOrderId: item.purchaseOrderId,
        productId: item.productId,
        productName: item.product?.name,
        productSku: item.product?.sku,
        productUnit: item.product?.unit,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        receivedQty: item.receivedQty,
      })),
      receipts: order.receipts?.map((r: any) => ({
        id: r.id,
        purchaseOrderId: r.purchaseOrderId,
        receivedDate: r.receivedDate,
        receivedBy: r.receivedBy,
        notes: r.notes,
        items: r.items?.map((i: any) => ({
          id: i.id,
          receiptId: i.receiptId,
          purchaseOrderItemId: i.purchaseOrderItemId,
          receivedQty: i.receivedQty,
          lotNumber: i.lotNumber,
          condition: i.condition,
          expirationDate: i.expirationDate,
          manufacturingDate: i.manufacturingDate,
          notes: i.notes,
        })),
      })),
    };
  }
}
