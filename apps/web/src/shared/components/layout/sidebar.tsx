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
  ShoppingCart,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  Layers,
  type LucideIcon,
} from 'lucide-react';

interface SidebarProps {
  children?: ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
}

export function Sidebar({ children }: SidebarProps) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/stock', label: 'Productos', icon: Package, permission: 'product.read' },
    { href: '/dashboard/inventory', label: 'Movimientos', icon: ArrowLeftRight, permission: 'inventory.read' },
    { href: '/dashboard/locations', label: 'Ubicaciones', icon: MapPin, permission: 'location.read' },
    { href: '/dashboard/suppliers', label: 'Proveedores', icon: Factory, permission: 'supplier.read' },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users, permission: 'customer.read' },
    { href: '/dashboard/purchase-orders', label: 'Órdenes de Compra', icon: ClipboardList, permission: 'purchase-order.read' },
    { href: '/dashboard/sales-orders', label: 'Órdenes de Venta', icon: ShoppingCart, permission: 'sales-order.read' },
    { href: '/dashboard/lots', label: 'Lotes', icon: Layers, permission: 'inventory.read' },
    { href: '/dashboard/reports', label: 'Reportes', icon: BarChart3, permission: 'report.read' },
    { href: '/dashboard/users', label: 'Usuarios', icon: UserCog, permission: 'user.manage' },
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
        {navItems.filter((item) => !item.permission || hasPermission(item.permission)).map((item) => (
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
            <item.icon
              className={`
                w-5 h-5 transition-colors duration-200
                ${isActive(item.href) ? 'text-primary-600' : 'text-surface-400'}
              `}
            />
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
          <Settings className="w-5 h-5" />
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
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
}

