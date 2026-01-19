import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  createdAt: string;
}

export interface RegisterInDto {
  productId: string;
  destLocationId: string;
  quantity: number;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
}

export interface RegisterOutDto {
  productId: string;
  originLocationId: string;
  quantity: number;
  referenceDocument?: string;
  notes?: string;
}

export interface TransferDto {
  productId: string;
  originLocationId: string;
  destLocationId: string;
  quantity: number;
  referenceDocument?: string;
  notes?: string;
}

export function useInventoryMovements(productId?: string, locationId?: string) {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId);
  if (locationId) params.append('locationId', locationId);

  return useQuery({
    queryKey: ['inventory-movements', productId, locationId],
    queryFn: () =>
      apiClient.get<InventoryMovement[]>(`/inventory/movements?${params.toString()}`),
  });
}

export function useRegisterIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInDto) => apiClient.post<InventoryMovement>('/inventory/in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

export function useRegisterOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterOutDto) =>
      apiClient.post<InventoryMovement>('/inventory/out', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

export function useTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TransferDto) =>
      apiClient.post<InventoryMovement>('/inventory/transfer', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
    },
  });
}

