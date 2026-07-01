import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { toast } from 'sonner';

export type PurchaseOrderStatus = 'DRAFT' | 'PENDING' | 'IN_TRANSIT' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export type LotCondition = 'GOOD' | 'DAMAGED' | 'EXPIRED';

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
  expirationDate?: string;
  manufacturingDate?: string;
  notes?: string;
}

export interface PurchaseOrderReceipt {
  id: string;
  purchaseOrderId: string;
  receivedDate: string;
  receivedBy?: string;
  notes?: string;
  items?: PurchaseOrderReceiptItem[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName?: string;
  status: PurchaseOrderStatus;
  expectedDate?: string;
  receivedDate?: string;
  notes?: string;
  locationId: string;
  locationName?: string;
  totalAmount?: number;
  items?: PurchaseOrderItem[];
  receipts?: PurchaseOrderReceipt[];
  createdAt: string;
  version: number;
}

export interface PaginatedPurchaseOrders {
  data: PurchaseOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePurchaseOrderItemDto {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  locationId: string;
  expectedDate?: string;
  notes?: string;
  items: CreatePurchaseOrderItemDto[];
}

export interface ReceiveItemDto {
  purchaseOrderItemId: string;
  receivedQty: number;
  lotNumber: string;
  condition: LotCondition;
  expirationDate?: string;
  manufacturingDate?: string;
  notes?: string;
}

export interface ReceivePurchaseOrderDto {
  items: ReceiveItemDto[];
  notes?: string;
  version: number;
}

export function usePurchaseOrders(params: {
  page?: number;
  limit?: number;
  status?: PurchaseOrderStatus;
  supplierId?: string;
} = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append('page', String(params.page || 1));
  searchParams.append('limit', String(params.limit || 20));
  if (params.status) searchParams.append('status', params.status);
  if (params.supplierId) searchParams.append('supplierId', params.supplierId);

  return useQuery({
    queryKey: ['purchase-orders', params],
    queryFn: () =>
      apiClient.get<PaginatedPurchaseOrders>(`/purchase-orders?${searchParams.toString()}`),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: ['purchase-order', id],
    queryFn: () => apiClient.get<PurchaseOrder>(`/purchase-orders/${id}`),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchaseOrderDto) =>
      apiClient.post<PurchaseOrder>('/purchase-orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success('Orden de compra creada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al crear orden de compra');
    },
  });
}

export function useUpdatePurchaseOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, version }: { id: string; status: PurchaseOrderStatus; version: number }) =>
      apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}/status`, { status, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      toast.success('Estado de orden actualizado');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar estado');
    },
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReceivePurchaseOrderDto }) =>
      apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/receive`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-order'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      toast.success('Recepcion registrada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar recepcion');
    },
  });
}
