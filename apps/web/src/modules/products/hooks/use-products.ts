import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface StockByLocation {
  locationId: string;
  locationName: string;
  locationCode: string;
  quantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  barcode?: string;
  imageUrl?: string;
  brand?: string;
  salePrice?: number;
  status: string;
  taxRate?: number;
  supplierId?: string;
  supplierName?: string;
  categoryId?: string;
  categoryName?: string;
  stockThreshold: number;
  unit: string;
  expirationDate?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
  totalStock?: number;
  stockByLocation?: StockByLocation[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  minStock?: number;
  maxStock?: number;
  supplierId?: string;
  categoryId?: string;
  locationId?: string;
  expiringBefore?: string;
  sortBy?: 'name' | 'sku' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductDto {
  sku?: string;
  name: string;
  description?: string;
  unitPrice: number;
  supplierId?: string;
  categoryId?: string;
  stockThreshold?: number;
  unit?: string;
  expirationDate?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  unitPrice?: number;
  supplierId?: string;
  categoryId?: string;
  stockThreshold?: number;
  unit?: string;
  expirationDate?: string;
  version: number;
}

export function useProducts(filters?: ProductFilters) {
  const queryParams = new URLSearchParams();

  if (filters) {
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.minStock !== undefined) queryParams.append('minStock', filters.minStock.toString());
    if (filters.maxStock !== undefined) queryParams.append('maxStock', filters.maxStock.toString());
    if (filters.supplierId) queryParams.append('supplierId', filters.supplierId);
    if (filters.categoryId) queryParams.append('categoryId', filters.categoryId);
    if (filters.locationId) queryParams.append('locationId', filters.locationId);
    if (filters.expiringBefore) queryParams.append('expiringBefore', filters.expiringBefore);
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters.sortOrder) queryParams.append('sortOrder', filters.sortOrder);
  }

  const queryString = queryParams.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.get<PaginatedResponse<Product>>(endpoint),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.get<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => apiClient.post<Product>('/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProductDto) => apiClient.put<Product>(`/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}

export interface ImportProductsResult {
  created: number;
  errors: { row: number; message: string }[];
}

export function useImportProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (products: Omit<CreateProductDto, 'supplierId' | 'categoryId' | 'expirationDate'>[]) =>
      apiClient.post<ImportProductsResult>('/products/import', { products }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      apiClient.delete(`/products/${id}`, { version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

