'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  children?: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  permission?: string;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/dashboard/stock',
      label: 'Gestion de Stock',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      permission: 'product.read',
    },
    {
      href: '/dashboard/inventory',
      label: 'Movimientos',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      permission: 'inventory.read',
    },
    {
      href: '/dashboard/users',
      label: 'Usuarios',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      permission: 'user.manage',
    },
  ];

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  }

  return (
    <aside
      className="
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-64
        bg-white/80 backdrop-blur-xl
        border-r border-surface-200/40
        shadow-glass
      "
    >
      {/* Logo */}
      <div
        className="
          flex items-center gap-3 h-16 px-6
          border-b border-surface-200/40
          bg-gradient-to-r from-surface-50/50 to-transparent
        "
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-info-600 flex items-center justify-center shadow-soft">
          <span className="text-white font-bold text-lg">L</span>
        </div>
        <span className="text-xl font-bold text-surface-900">Lumono</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl
              text-sm font-medium
              transition-all duration-200 ease-out
              ${
                isActive(item.href)
                  ? 'bg-gradient-to-r from-primary-100/80 to-primary-50/60 text-primary-700 shadow-sm backdrop-blur-xs'
                  : 'text-surface-600 hover:bg-surface-100/70 hover:text-surface-900 hover:backdrop-blur-xs'
              }
            `}
          >
            <span
              className={`
                transition-colors duration-200
                ${isActive(item.href) ? 'text-primary-600' : 'text-surface-400'}
              `}
            >
              {item.icon}
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </aside>
  );
}

interface SidebarUserProps {
  user: {
    name: string;
    email: string;
  };
  onLogout: () => void;
}

export function SidebarUser({ user, onLogout }: SidebarUserProps) {
  return (
    <div
      className="
        border-t border-surface-200/40 p-4 space-y-3
        bg-gradient-to-t from-surface-50/50 to-transparent
      "
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-info-600 flex items-center justify-center shadow-soft">
          <span className="text-white font-semibold text-sm">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-surface-900 truncate">{user.name}</p>
          <p className="text-xs text-surface-500 truncate">{user.email}</p>
        </div>
        <Link
          href="/dashboard/settings"
          className="
            p-2 rounded-xl
            text-surface-400 hover:text-primary-600
            hover:bg-surface-100/70
            transition-all duration-200
          "
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
      </div>

      <button
        onClick={onLogout}
        className="
          w-full flex items-center justify-center gap-2
          px-3 py-2.5 rounded-xl
          text-sm font-medium text-surface-600
          bg-white/50 hover:bg-white/80
          border border-surface-200/40
          hover:text-danger-600 hover:border-danger-200/50
          transition-all duration-200
        "
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  );
}

