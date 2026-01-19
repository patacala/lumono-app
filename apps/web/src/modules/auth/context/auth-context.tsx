'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/shared/lib/api-client';

interface User {
  id: string;
  email: string;
  name: string;
  permissions: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string): any {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  
  // Check if token expires in the next 5 minutes
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const bufferTime = 5 * 60 * 1000; // 5 minutes
  
  return expirationTime - currentTime < bufferTime;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (token && refreshToken) {
          const payload = decodeToken(token);
          
          if (payload && payload.exp) {
            // Check if token is completely expired (not just near expiration)
            const isCompletelyExpired = payload.exp * 1000 < Date.now();
            
            if (isCompletelyExpired) {
              localStorage.removeItem('access_token');
              localStorage.removeItem('refresh_token');
            } else {
              setUser({
                id: payload.sub,
                email: payload.email,
                name: payload.name || payload.email,
                permissions: payload.permissions || [],
              });
            }
          } else {
            // Invalid token payload
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        }
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Check token expiration periodically
    const interval = setInterval(() => {
      const token = localStorage.getItem('access_token');
      if (token && isTokenExpired(token)) {
        // Token expiring soon, will be refreshed on next request
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', { email, password }, false);

    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('refresh_token', response.refreshToken);

    const payload = decodeToken(response.accessToken);
    setUser({
      id: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      permissions: payload.permissions || [],
    });

    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    router.push('/auth/login');
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

