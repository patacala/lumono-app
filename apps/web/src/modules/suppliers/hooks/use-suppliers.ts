import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => apiClient.get<Supplier[]>('/suppliers'),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSupplierDto) => apiClient.post<Supplier>('/suppliers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}


