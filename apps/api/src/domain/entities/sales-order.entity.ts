import { BaseEntity } from './base.entity';

export type SalesOrderStatus = 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface SalesOrderItem {
  id: string;
  salesOrderId: string;
  productId: string;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  reservedQty: number;
  productUnit?: string;
}

export interface SalesOrder extends BaseEntity {
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: SalesOrderStatus;
  shippedDate?: Date;
  deliveredDate?: Date;
  notes?: string;
  locationId: string;
  locationName?: string;
  totalAmount?: number;
  items?: SalesOrderItem[];
}
