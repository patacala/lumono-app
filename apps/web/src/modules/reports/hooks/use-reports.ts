import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface InventorySummaryProduct {
  id: string;
  sku: string;
  name: string;
  totalStock: number;
  stockThreshold: number;
  isLowStock: boolean;
  stockValue: number;
  unit: string;
}

export interface InventorySummary {
  totalProducts: number;
  lowStockCount: number;
  totalStockValue: number;
  products: InventorySummaryProduct[];
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ['reports', 'inventory-summary'],
    queryFn: () =>
      apiClient.get<InventorySummary>('/reports/inventory/summary'),
  });
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function downloadExcelReport(type: 'inventory' | 'movements', params?: Record<string, string>) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
  const url = `${API_BASE_URL}/reports/${type}/excel${queryString}`;

  const link = document.createElement('a');
  link.href = url;

  // Use fetch to handle auth
  fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.blob())
    .then((blob) => {
      const objectUrl = URL.createObjectURL(blob);
      link.href = objectUrl;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(objectUrl);
    });
}
