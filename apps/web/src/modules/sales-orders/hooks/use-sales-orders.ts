import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { toast } from 'sonner';

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

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  status: SalesOrderStatus;
  shippedDate?: string;
  deliveredDate?: string;
  notes?: string;
  locationId: string;
  locationName?: string;
  totalAmount?: number;
  items?: SalesOrderItem[];
  createdAt: string;
  version: number;
}

export interface PaginatedSalesOrders {
  data: SalesOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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
}

export function useSalesOrders(params: {
  page?: number;
  limit?: number;
  status?: SalesOrderStatus;
  customerId?: string;
  refetchInterval?: number;
} = {}) {
  const { refetchInterval, ...queryParams } = params;
  const searchParams = new URLSearchParams();
  searchParams.append('page', String(queryParams.page || 1));
  searchParams.append('limit', String(queryParams.limit || 20));
  if (queryParams.status) searchParams.append('status', queryParams.status);
  if (queryParams.customerId) searchParams.append('customerId', queryParams.customerId);

  return useQuery({
    queryKey: ['sales-orders', queryParams],
    queryFn: () =>
      apiClient.get<PaginatedSalesOrders>(`/sales-orders?${searchParams.toString()}`),
    refetchInterval,
  });
}

export function useSalesOrder(id: string) {
  return useQuery({
    queryKey: ['sales-order', id],
    queryFn: () => apiClient.get<SalesOrder>(`/sales-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateSalesOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalesOrderDto) =>
      apiClient.post<SalesOrder>('/sales-orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      toast.success('Orden de venta creada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al crear orden de venta');
    },
  });
}

export function useUpdateSalesOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, version }: { id: string; status: SalesOrderStatus; version: number }) =>
      apiClient.patch<SalesOrder>(`/sales-orders/${id}/status`, { status, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-orders'] });
      queryClient.invalidateQueries({ queryKey: ['sales-order'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Estado de orden actualizado');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar estado');
    },
  });
}

export function useSalesOrderCounts() {
  return useQuery({
    queryKey: ['sales-order-counts'],
    queryFn: () =>
      apiClient.get<{ pending: number; preparing: number }>('/sales-orders/stats/counts'),
    refetchInterval: 60000,
  });
}
