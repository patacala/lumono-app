'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/context/auth-context';
import { useRouter } from 'next/navigation';
import { Sidebar, SidebarUser } from '@/shared/components/layout/sidebar';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';

function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-[60px] w-full bg-[var(--bg)] border-b border-[var(--border)]">
      <div className="h-full flex items-center justify-between px-4 lg:px-6 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {/* Mobile menu toggle */}
          <button
            onClick={onMenuToggle}
            className="lg:hidden shrink-0 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)] border border-[var(--border)]"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="w-full max-w-md">
            <div className="relative">
              <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-[15px] h-[15px] text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Buscar productos, ordenes..."
                className="w-full py-2 pl-[36px] pr-12 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[oklch(68%_0.19_55_/_0.45)] transition-colors"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--muted)] bg-[var(--bg)] px-[5px] py-[2px] rounded border border-[var(--border)]">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          {/* Notification bell */}
          <button className="relative w-9 h-9 grid place-items-center rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-[4px] bg-[var(--accent)] text-[oklch(12%_0.02_55)] text-[9px] font-mono font-bold rounded-full grid place-items-center">
              3
            </span>
          </button>

          {/* Messages */}
          <button className="w-9 h-9 grid place-items-center rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>

          {/* User avatar */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border-2 border-[oklch(68%_0.19_55_/_0.4)] ring-2 ring-[oklch(68%_0.19_55_/_0.1)] grid place-items-center">
              <span className="text-[var(--fg)] font-semibold text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-[var(--bg)] flex items-center justify-center">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-8 text-center animate-fade-in">
          <div className="w-14 h-14 border-3 border-[var(--surface-2)] border-t-[var(--accent)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--muted)] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      >
        <SidebarUser user={user} onLogout={logout} />
      </Sidebar>

      <div className="lg:pl-[240px] min-h-dvh flex flex-col bg-[var(--bg)]">
        <Topbar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 flex flex-col min-h-0 bg-[var(--bg)]">
          <div className="max-w-7xl mx-auto py-5 px-5 lg:px-6 animate-fade-in-up flex-1 flex flex-col w-full min-h-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
