import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { toast } from 'sonner';

export type MovementSubType =
  | 'PURCHASE'
  | 'POSITIVE_ADJUSTMENT'
  | 'PRODUCTION'
  | 'RETURN'
  | 'SALE'
  | 'NEGATIVE_ADJUSTMENT'
  | 'DAMAGE'
  | 'INTERNAL_CONSUMPTION';

export type AdjustmentReason =
  | 'PHYSICAL_COUNT'
  | 'CORRECTION'
  | 'EXPIRATION'
  | 'INITIAL_LOAD'
  | 'OTHER';

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  subType?: MovementSubType;
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  reason?: AdjustmentReason;
  createdAt: string;
  createdBy?: string;
}

export interface PaginatedMovements {
  data: InventoryMovement[];
  total: number;
  page: number;
  limit: number;
}

export interface RegisterInDto {
  productId: string;
  destLocationId: string;
  quantity: number;
  subType?: MovementSubType;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
}

export interface RegisterOutDto {
  productId: string;
  originLocationId: string;
  quantity: number;
  subType?: MovementSubType;
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

export interface AdjustmentDto {
  productId: string;
  locationId: string;
  quantity: number;
  subType: 'POSITIVE_ADJUSTMENT' | 'NEGATIVE_ADJUSTMENT';
  reason: AdjustmentReason;
  notes?: string;
}

export interface TodayStats {
  IN: number;
  OUT: number;
  TRANSFER: number;
  ADJUSTMENT: number;
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

export function useInventoryMovementsPaginated(params: {
  page?: number;
  limit?: number;
  type?: string;
  productId?: string;
  locationId?: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.append('page', String(params.page || 1));
  searchParams.append('limit', String(params.limit || 20));
  if (params.type && params.type !== 'ALL') searchParams.append('type', params.type);
  if (params.productId) searchParams.append('productId', params.productId);
  if (params.locationId) searchParams.append('locationId', params.locationId);

  return useQuery({
    queryKey: ['inventory-movements', 'paginated', params],
    queryFn: () =>
      apiClient.get<PaginatedMovements>(`/inventory/movements?${searchParams.toString()}`),
  });
}

export function useMovementById(id: string) {
  return useQuery({
    queryKey: ['inventory-movement', id],
    queryFn: () => apiClient.get<InventoryMovement>(`/inventory/movements/${id}`),
    enabled: !!id,
  });
}

export function useTodayStats() {
  return useQuery({
    queryKey: ['today-stats'],
    queryFn: () => apiClient.get<TodayStats>('/inventory/stats/today'),
    refetchInterval: 60000,
  });
}

export function useRegisterIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterInDto) => apiClient.post<InventoryMovement>('/inventory/in', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      toast.success('Entrada registrada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar entrada');
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
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      toast.success('Salida registrada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar salida');
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
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      toast.success('Transferencia registrada exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar transferencia');
    },
  });
}

export function useRegisterAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AdjustmentDto) =>
      apiClient.post<InventoryMovement>('/inventory/adjustment', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      toast.success('Ajuste registrado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al registrar ajuste');
    },
  });
}

export function useStock(productId?: string, locationId?: string) {
  const params = new URLSearchParams();
  if (productId) params.append('productId', productId);
  if (locationId) params.append('locationId', locationId);

  return useQuery({
    queryKey: ['stock', productId, locationId],
    queryFn: () => apiClient.get<{ productId: string; locationId?: string; quantity: number }>(
      `/inventory/stock?${params.toString()}`
    ),
    enabled: !!productId || !!locationId,
  });
}
