import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';

export interface Location {
  id: string;
  code: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLocationDto {
  code: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: () => apiClient.get<Location[]>('/locations'),
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLocationDto) => apiClient.post<Location>('/locations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}


