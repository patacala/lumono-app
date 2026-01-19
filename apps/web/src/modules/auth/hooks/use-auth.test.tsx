import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useAuth, AuthProvider } from '../context/auth-context';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock api-client
vi.mock('@/shared/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function Wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should initialize with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    expect(result.current.user).toBeNull();
  });

  it('should check permissions correctly', () => {
    localStorage.setItem(
      'access_token',
      'header.' +
        btoa(
          JSON.stringify({
            sub: '1',
            email: 'test@test.com',
            permissions: ['product.read', 'product.create'],
          })
        ) +
        '.signature'
    );

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    waitFor(() => {
      expect(result.current.hasPermission('product.read')).toBe(true);
      expect(result.current.hasPermission('product.delete')).toBe(false);
    });
  });
});

