'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/modules/auth/context/auth-context';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  MapPin,
  Factory,
  Users,
  ClipboardList,
  ClipboardCheck,
  ShoppingCart,

  UserCog,
  Settings,
  LogOut,
  Layers,
  X,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  children?: ReactNode;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

export function Sidebar({ children, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/products', label: 'Productos', icon: Package, permission: 'product.read' },
    { href: '/dashboard/inventory', label: 'Movimientos', icon: ArrowLeftRight, permission: 'inventory.read' },
    { href: '/dashboard/locations', label: 'Ubicaciones', icon: MapPin, permission: 'location.read' },
    { href: '/dashboard/suppliers', label: 'Proveedores', icon: Factory, permission: 'supplier.read' },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users, permission: 'customer.read' },
    { href: '/dashboard/purchase-orders', label: 'Ordenes de Compra', icon: ClipboardList, permission: 'purchase-order.read' },
    { href: '/dashboard/sales-orders', label: 'Ordenes de Venta', icon: ShoppingCart, permission: 'sales-order.read' },
    { href: '/dashboard/sales-orders/tracking', label: 'Seguimiento', icon: ClipboardCheck, permission: 'sales-order.read' },
    { href: '/dashboard/lots', label: 'Lotes', icon: Layers, permission: 'inventory.read' },

    { href: '/dashboard/users', label: 'Usuarios', icon: UserCog, permission: 'user.manage' },
  ];

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    // For items that are sub-paths of other items (e.g. /sales-orders/tracking vs /sales-orders),
    // check if there's a more specific nav item that matches first
    const exactOrChild = pathname?.startsWith(href);
    if (!exactOrChild) return false;
    // Check if a more specific nav item matches the current path
    const moreSpecific = navItems.some(
      (item) => item.href !== href && item.href.startsWith(href) && pathname?.startsWith(item.href)
    );
    return !moreSpecific;
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="flex items-center gap-3 px-[18px] pt-5 pb-4">
        <div className="w-[34px] h-[34px] rounded-[8px] bg-[var(--accent)] grid place-items-center flex-shrink-0">
          <span className="text-[oklch(12%_0.02_55)] font-bold text-lg leading-none">L</span>
        </div>
        <div>
          <span className="text-[15px] font-semibold text-[var(--fg)] tracking-[-0.01em]">Lumono</span>
          <p className="text-[10px] text-[var(--muted)] mt-[1px] leading-tight">Gestion de inventario</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-[10px] py-1 overflow-y-auto">
        {navItems.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={`
              flex items-center gap-[10px] px-3 py-[9px] rounded-lg mb-[1px]
              text-[13px] font-[450]
              transition-all duration-200
              ${
                isActive(item.href)
                  ? 'bg-[var(--accent-dim)] text-[var(--fg)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--fg)]'
              }
            `}
          >
            <item.icon
              className={`
                w-[17px] h-[17px] flex-shrink-0 transition-colors duration-200
                ${isActive(item.href) ? 'opacity-100 text-[var(--accent)]' : 'opacity-[0.65]'}
              `}
            />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Upgrade Card */}
      <div className="px-[10px] pb-2">
        <div className="rounded-[10px] bg-gradient-to-br from-[var(--accent-dim)] to-[var(--surface)] border border-[oklch(68%_0.19_55_/_0.2)] p-3.5">
          <div className="flex items-center gap-2 mb-1.5">
            <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
            </svg>
            <span className="text-[12px] font-semibold text-[var(--fg)]">Lumono Pro</span>
          </div>
          <p className="text-[10px] text-[var(--muted)] mb-3 leading-relaxed">Desbloquea reportes avanzados y mas</p>
          <button className="w-full py-1.5 px-3 bg-[var(--accent)] text-[oklch(12%_0.02_55)] text-[11px] font-semibold rounded-md hover:opacity-90 transition-opacity">
            Upgrade
          </button>
        </div>
      </div>

      {children}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="
          hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 lg:w-[240px]
          bg-[var(--bg-sidebar)]
          border-r border-[var(--border)]
        "
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={onMobileClose}
          />
          <aside className="fixed inset-y-0 left-0 w-[240px] bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col animate-slide-in">
            <button
              onClick={onMobileClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface)]"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
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
    <div className="border-t border-[var(--border)] p-[12px_14px] space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[var(--surface-2)] border border-[var(--border)] grid place-items-center flex-shrink-0">
          <span className="text-[var(--fg)] font-semibold text-xs">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-[var(--muted)] truncate">{user.email}</p>
        </div>
        <Link
          href="/dashboard/settings"
          className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--surface)] transition-all duration-200"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>
      </div>

      <button
        onClick={onLogout}
        className="
          w-full flex items-center justify-center gap-2
          px-3 py-2 rounded-lg
          text-sm font-medium text-[var(--muted)]
          bg-[var(--surface)] hover:bg-[var(--surface-2)]
          border border-[var(--border)]
          hover:text-[var(--fg)]
          transition-all duration-200
        "
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}
