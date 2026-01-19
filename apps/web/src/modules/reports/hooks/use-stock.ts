import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface StockInfo {
  productId: string;
  locationId?: string;
  quantity: number;
}

export function useStockByLocation(locationId?: string) {
  return useQuery({
    queryKey: ['stock', 'location', locationId],
    queryFn: () =>
      apiClient.get<StockInfo[]>(`/inventory/stock?locationId=${locationId}`),
    enabled: !!locationId,
  });
}


