const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      localStorage.setItem('access_token', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
    } catch (error) {
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
      throw error;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true,
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(includeAuth),
          ...options.headers,
        },
      });

      // Handle 401 - Unauthorized (token expired)
      if (response.status === 401 && includeAuth && retryCount === 0) {
        // If already refreshing, wait for it
        if (this.refreshPromise) {
          await this.refreshPromise;
        } else {
          // Start refresh process
          this.refreshPromise = this.refreshToken();
          await this.refreshPromise;
          this.refreshPromise = null;
        }

        // Retry the original request with new token
        return this.request<T>(endpoint, options, includeAuth, retryCount + 1);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new ApiError(response.status, error.message || `HTTP ${response.status}`);
      }

      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error');
    }
  }

  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(endpoint: string, data?: unknown, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(endpoint: string, data: unknown, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  }

  async patch<T>(endpoint: string, data: unknown, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, data?: unknown, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'DELETE',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

