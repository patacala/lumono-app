'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/modules/auth/context/auth-context';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarUser } from '@/shared/components/layout/sidebar';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100 flex items-center justify-center">
        <div className="glass-card rounded-2xl p-8 text-center shadow-elevated animate-fade-in">
          <div className="w-14 h-14 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-surface-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-50 via-white to-surface-100">
      <Sidebar>
        <SidebarUser user={user} onLogout={logout} />
      </Sidebar>

      <main className="lg:pl-64">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-fade-in-up">
          {children}
        </div>
      </main>
    </div>
  );
}
