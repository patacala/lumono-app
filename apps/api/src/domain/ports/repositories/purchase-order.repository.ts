import { PurchaseOrder, PurchaseOrderStatus, PurchaseOrderReceipt } from '../../entities/purchase-order.entity';
import { LotCondition } from '../../entities/lot.entity';

export interface CreatePurchaseOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  locationId: string;
  expectedDate?: Date;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
  createdBy?: string;
}

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplierId?: string;
}

export interface CreateReceiptItemDto {
  purchaseOrderItemId: string;
  receivedQty: number;
  lotNumber: string;
  condition: LotCondition;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
}

export interface CreateReceiptDto {
  purchaseOrderId: string;
  receivedBy?: string;
  notes?: string;
  items: CreateReceiptItemDto[];
}

export interface IPurchaseOrderRepository {
  findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: PurchaseOrderFilters,
  ): Promise<{ data: PurchaseOrder[]; total: number }>;
  findById(id: string): Promise<PurchaseOrder | null>;
  create(data: CreatePurchaseOrderDto & { orderNumber: string; totalAmount: number }): Promise<PurchaseOrder>;
  updateStatus(id: string, status: PurchaseOrderStatus, updatedBy: string, expectedVersion: number, extra?: { receivedDate?: Date }): Promise<PurchaseOrder>;
  updateReceivedQty(itemId: string, receivedQty: number): Promise<void>;
  incrementReceivedQty(itemId: string, delta: number): Promise<void>;
  createReceipt(data: CreateReceiptDto): Promise<PurchaseOrderReceipt>;
  getNextOrderNumber(): Promise<string>;
}
