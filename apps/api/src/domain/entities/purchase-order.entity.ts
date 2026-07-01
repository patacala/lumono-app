import { BaseEntity } from './base.entity';
import { LotCondition } from './lot.entity';

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  receivedQty: number;
  productUnit?: string;
}

export interface PurchaseOrderReceiptItem {
  id: string;
  receiptId: string;
  purchaseOrderItemId: string;
  receivedQty: number;
  lotNumber: string;
  condition: LotCondition;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
}

export interface PurchaseOrderReceipt {
  id: string;
  purchaseOrderId: string;
  receivedDate: Date;
  receivedBy?: string;
  notes?: string;
  items?: PurchaseOrderReceiptItem[];
}

export interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  expectedDate?: Date;
  receivedDate?: Date;
  notes?: string;
  locationId: string;
  locationName?: string;
  totalAmount?: number;
  items?: PurchaseOrderItem[];
  receipts?: PurchaseOrderReceipt[];
}
