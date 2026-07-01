import { SalesOrder, SalesOrderStatus } from '../../entities/sales-order.entity';

export interface CreateSalesOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalesOrderDto {
  customerId: string;
  locationId: string;
  notes?: string;
  items: CreateSalesOrderItemDto[];
  createdBy?: string;
}

export interface SalesOrderFilters {
  status?: SalesOrderStatus;
  customerId?: string;
}

export interface ISalesOrderRepository {
  findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: SalesOrderFilters,
  ): Promise<{ data: SalesOrder[]; total: number }>;
  findById(id: string): Promise<SalesOrder | null>;
  create(data: CreateSalesOrderDto & { orderNumber: string; totalAmount: number }): Promise<SalesOrder>;
  updateStatus(id: string, status: SalesOrderStatus, updatedBy: string, expectedVersion: number, extra?: { shippedDate?: Date; deliveredDate?: Date }): Promise<SalesOrder>;
  updateItemReservedQty(itemId: string, reservedQty: number): Promise<void>;
  clearItemsReservedQty(salesOrderId: string): Promise<void>;
  getNextOrderNumber(): Promise<string>;
  getReservedStockByProduct(productId: string, locationId?: string): Promise<number>;
  countByStatus(status: SalesOrderStatus): Promise<number>;
}
