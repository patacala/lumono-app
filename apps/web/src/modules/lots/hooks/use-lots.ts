import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export type LotCondition = 'GOOD' | 'DAMAGED' | 'EXPIRED';

export interface Lot {
  id: string;
  lotNumber: string;
  productId: string;
  productName?: string;
  productSku?: string;
  locationId: string;
  locationName?: string;
  quantity: number;
  condition: LotCondition;
  expirationDate?: string;
  manufacturingDate?: string;
  notes?: string;
  createdAt: string;
  version: number;
}

export interface PaginatedLots {
  data: Lot[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function useLots(params: {
  page?: number;
  limit?: number;
  productId?: string;
  locationId?: string;
  condition?: LotCondition;
} = {}) {
  const searchParams = new URLSearchParams();
  searchParams.append('page', String(params.page || 1));
  searchParams.append('limit', String(params.limit || 20));
  if (params.productId) searchParams.append('productId', params.productId);
  if (params.locationId) searchParams.append('locationId', params.locationId);
  if (params.condition) searchParams.append('condition', params.condition);

  return useQuery({
    queryKey: ['lots', params],
    queryFn: () =>
      apiClient.get<PaginatedLots>(`/lots?${searchParams.toString()}`),
  });
}

export function useLot(id: string) {
  return useQuery({
    queryKey: ['lot', id],
    queryFn: () => apiClient.get<Lot>(`/lots/${id}`),
    enabled: !!id,
  });
}
