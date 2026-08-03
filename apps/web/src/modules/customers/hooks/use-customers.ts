import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import { toast } from 'sonner';

export interface Customer {
  id: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdAt: string;
  version: number;
}

export interface CreateCustomerDto {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  version: number;
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => apiClient.get<Customer[]>('/customers'),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => apiClient.get<Customer>(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) =>
      apiClient.post<Customer>('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente creado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al crear cliente');
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateCustomerDto & { id: string }) =>
      apiClient.put<Customer>(`/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente actualizado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al actualizar cliente');
    },
  });
}

export interface BulkCustomerRow {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface ImportCustomersResult {
  created: number;
  errors: { row: number; message: string }[];
}

export function useImportCustomers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customers: BulkCustomerRow[]) =>
      apiClient.post<ImportCustomersResult>('/customers/import', { customers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      apiClient.delete(`/customers/${id}`, { version }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Cliente eliminado exitosamente');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Error al eliminar cliente');
    },
  });
}
