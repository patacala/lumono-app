'use client';

import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/context/auth-context';
import { useProducts, Product } from '@/modules/products/hooks/use-products';
import { useTodayStats } from '@/modules/inventory/hooks/use-inventory';
import { Card, CardBody } from '@/shared/components/ui/card';
import { getDaysUntilExpiration } from '@/shared/lib/stock-utils';
import { StockChart } from '@/modules/reports/components/stock-chart';
import { StockValueChart } from '@/modules/reports/components/stock-value-chart';
import { useStockSocket } from '@/shared/hooks/use-stock-socket';
import { useSalesOrderCounts } from '@/modules/sales-orders/hooks/use-sales-orders';
import Link from 'next/link';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
} from 'recharts';

// Sparkline data generators (fake trend data since no historical API yet)
const sparkUp = [3, 5, 4, 7, 6, 8, 7, 9, 8, 10, 11, 12];
const sparkDown = [10, 9, 11, 8, 7, 9, 6, 5, 7, 4, 3, 4];
const sparkFlat = [6, 7, 5, 6, 8, 7, 6, 7, 5, 6, 7, 6];
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color.replace(/[^a-z0-9]/gi, '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace(/[^a-z0-9]/gi, '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChangeIndicator({ value, suffix = '%' }: { value: number; suffix?: string }) {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
      <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
        <path
          d={isPositive ? 'M6 2.5L10 7.5H2L6 2.5Z' : 'M6 9.5L2 4.5H10L6 9.5Z'}
          fill="currentColor"
        />
      </svg>
      {isPositive ? '+' : ''}{value}{suffix}
    </span>
  );
}

// Icons
const BoxIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M10.362 1.093a.75.75 0 00-.724 0L2.523 5.018 10 9.143l7.477-4.125-7.115-3.925zM18 6.443l-7.25 4v8.25l6.862-3.786A.75.75 0 0018 14.25V6.443zm-8.75 12.25v-8.25l-7.25-4v7.807a.75.75 0 00.388.657l6.862 3.786z" clipRule="evenodd" />
  </svg>
);

const CurrencyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
    <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.160.46.284.736.363v-2.48a3.13 3.13 0 00-1.138.432c-.482.315-.612.648-.612.875 0 .227.13.56.612.875a3.13 3.13 0 00.218.171z" />
    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3a3.78 3.78 0 01-1.653-.713 2.833 2.833 0 01-.925-1.199.75.75 0 011.395-.55c.12.282.296.516.447.563.264.082.551.14.856.165v-2.783a5.032 5.032 0 01-1.959-.696C4.291 9.645 3.787 8.89 3.787 8.03c0-.86.504-1.616 1.29-2.13.576-.376 1.261-.603 1.96-.696V4.75A.75.75 0 019 4v.316c.698.093 1.383.32 1.96.696a2.833 2.833 0 01.924 1.199.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 01-1.5 0v-.3z" clipRule="evenodd" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]">
    <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
  </svg>
);

const EmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
  </svg>
);

const ArrowInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z" clipRule="evenodd" />
  </svg>
);

const ArrowOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-4.75a.75.75 0 01-1.5 0V8.66L7.3 10.76a.75.75 0 01-1.1-1.02l3.25-3.5a.75.75 0 011.1 0l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v4.59z" clipRule="evenodd" />
  </svg>
);

const TransferIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M13.2 2.24a.75.75 0 00.04 1.06l2.1 1.95H6.75a.75.75 0 000 1.5h8.59l-2.1 1.95a.75.75 0 101.02 1.1l3.5-3.25a.75.75 0 000-1.1l-3.5-3.25a.75.75 0 00-1.06.04zm-6.4 8a.75.75 0 00-1.06-.04l-3.5 3.25a.75.75 0 000 1.1l3.5 3.25a.75.75 0 101.02-1.1l-2.1-1.95h8.59a.75.75 0 000-1.5H4.66l2.1-1.95a.75.75 0 00.04-1.06z" clipRule="evenodd" />
  </svg>
);

const AdjustIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
    <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
  </svg>
);

interface AlertSection {
  categoryName: string;
  categoryId: string;
  products: Product[];
}

interface KpiCardProps {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  sparkData: number[];
  sparkColor: string;
}

function KpiCard({ label, value, change, icon, sparkData, sparkColor }: KpiCardProps) {
  return (
    <Card variant="stat" hover>
      <div className="p-4 pb-0">
        <div className="flex items-start justify-between mb-1">
          <p className="text-[11px] text-[var(--muted)] font-medium uppercase tracking-wider">{label}</p>
          <div className="p-1.5 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)]">
            {icon}
          </div>
        </div>
        <div className="flex items-end gap-2.5 mt-1">
          <p className="text-[24px] font-semibold text-[var(--fg)] font-mono tabular-nums leading-none">{value}</p>
          <ChangeIndicator value={change} />
        </div>
      </div>
      <div className="mt-2">
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
    </Card>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="pt-2">
      <h2 className="text-[13px] font-semibold text-[var(--fg)]">{title}</h2>
      <p className="text-[11px] text-[var(--muted)]">{subtitle}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: productsData } = useProducts({ limit: 500 });
  const { data: todayStats } = useTodayStats();
  const { data: orderCounts } = useSalesOrderCounts();

  // Wire real-time stock updates
  useStockSocket();

  const products = productsData?.data || [];

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + ((p.totalStock || 0) * p.unitPrice), 0);
    const outOfStock = products.filter(p => (p.totalStock || 0) === 0).length;
    const lowStock = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) < p.stockThreshold).length;
    const stockAlerts = outOfStock + lowStock;
    const expiringSoon = products.filter(p => {
      if (!p.expirationDate) return false;
      const days = getDaysUntilExpiration(p.expirationDate);
      return days >= 0 && days <= 7;
    }).length;

    return { totalItems, totalValue, stockAlerts, expiringSoon };
  }, [products]);

  // Group alerts by category
  const alertGroups = useMemo(() => {
    const lowStockProducts = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) < p.stockThreshold);
    const outOfStockProducts = products.filter(p => (p.totalStock || 0) === 0);
    const expiringProducts = products.filter(p => {
      if (!p.expirationDate) return false;
      const days = getDaysUntilExpiration(p.expirationDate);
      return days >= 0 && days <= 7;
    });

    const groupByCategory = (items: Product[]): AlertSection[] => {
      const groups: Record<string, Product[]> = {};
      items.forEach(p => {
        const key = p.categoryName || 'Sin Categoria';
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      });
      return Object.entries(groups).map(([categoryName, products]) => ({
        categoryName,
        categoryId: products[0]?.categoryId || '',
        products,
      }));
    };

    return {
      lowStock: groupByCategory(lowStockProducts),
      outOfStock: groupByCategory(outOfStockProducts),
      expiring: groupByCategory(expiringProducts),
    };
  }, [products]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="flex flex-col gap-[14px]">
      {/* Header */}
      <div>
        <h1 className="text-[clamp(20px,2.2vw,24px)] font-semibold text-[var(--fg)] tracking-[-0.02em]">
          {getGreeting()}, {user?.name || user?.email}!
        </h1>
        <p className="text-[var(--muted)] text-sm">Aqui esta un resumen de tu stock actual</p>
      </div>

      {/* KPI Cards — 4 horizontal with sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px]">
        <KpiCard
          label="Total Productos"
          value={metrics.totalItems}
          change={8.5}
          icon={<BoxIcon />}
          sparkData={sparkUp}
          sparkColor="oklch(68% 0.19 55)"
        />
        <KpiCard
          label="Valor del Stock"
          value={`$${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          change={12.3}
          icon={<CurrencyIcon />}
          sparkData={sparkUp}
          sparkColor="oklch(72% 0.17 155)"
        />
        <KpiCard
          label="Alertas Stock"
          value={metrics.stockAlerts}
          change={-2.1}
          icon={<WarningIcon />}
          sparkData={sparkDown}
          sparkColor="oklch(68% 0.16 25)"
        />
        <KpiCard
          label="Proximo a Vencer"
          value={metrics.expiringSoon}
          change={0}
          icon={<CalendarIcon />}
          sparkData={sparkFlat}
          sparkColor="oklch(58% 0.012 260)"
        />
      </div>

      {/* Movement section */}
      {todayStats && (
        <>
          <SectionHeader title="Resumen de Movimientos" subtitle="Movimientos registrados hoy" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[14px]">
            <Card hover>
              <CardBody className="p-[18px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-[8px] bg-[var(--status-ok)] text-[var(--muted)]">
                    <ArrowInIcon />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{todayStats.IN}</p>
                    <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">Entradas Hoy</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody className="p-[18px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-[8px] bg-[var(--status-critical)] text-[var(--muted)]">
                    <ArrowOutIcon />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{todayStats.OUT}</p>
                    <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">Salidas Hoy</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody className="p-[18px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-[8px] bg-[var(--status-neutral)] text-[var(--muted)]">
                    <TransferIcon />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{todayStats.TRANSFER}</p>
                    <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">Transferencias Hoy</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card hover>
              <CardBody className="p-[18px]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-[8px] bg-[var(--status-attention)] text-[var(--muted)]">
                    <AdjustIcon />
                  </div>
                  <div>
                    <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{todayStats.ADJUSTMENT}</p>
                    <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">Ajustes Hoy</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </>
      )}

      {/* Orders section */}
      {orderCounts && (
        <>
          <SectionHeader title="Ordenes" subtitle="Estado actual de ordenes de venta" />
          <div className="grid grid-cols-2 lg:grid-cols-2 gap-[14px]">
            <Link href="/dashboard/purchase-orders?status=PENDING">
              <Card hover>
                <CardBody className="p-[18px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-[var(--status-attention)] text-[var(--muted)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{orderCounts.pending}</p>
                      <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">OV Pendientes</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>

            <Link href="/dashboard/sales-orders?status=PREPARING">
              <Card hover>
                <CardBody className="p-[18px]">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-[8px] bg-[var(--accent-dim)] text-[var(--accent)]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xl font-medium text-[var(--fg)] font-mono tabular-nums">{orderCounts.preparing}</p>
                      <p className="text-[10px] text-[var(--muted)] font-medium uppercase tracking-wide">OV en Preparacion</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </>
      )}

      {/* Charts */}
      <SectionHeader title="Tendencias" subtitle="Evolucion del inventario" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[14px]">
        <StockChart />
        <StockValueChart />
      </div>

      {/* Alert Sections */}
      <SectionHeader title="Alertas" subtitle="Items que requieren atencion" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[14px]">
        {/* Low Stock Section */}
        <Card>
          <CardBody className="p-[18px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)]">
                <WarningIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-[var(--fg)]">Stock Bajo</h3>
                <p className="text-[10px] text-[var(--muted)]">Items con stock bajo por categoria</p>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto -mx-[18px] px-[18px]">
              {alertGroups.lowStock.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)] mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Ningun item con stock bajo</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertGroups.lowStock.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5">
                        {group.categoryName}
                      </p>
                      <div>
                        {group.products.slice(0, 3).map((product) => (
                          <div key={product.id} className={`flex items-center justify-between py-2 px-3 hover:bg-[var(--surface-2)] rounded-md transition-colors`}>
                            <span className="text-sm font-medium text-[var(--fg-secondary)] truncate flex-1">{product.name}</span>
                            <span className="ml-3 text-[10px] font-mono font-medium text-[var(--fg)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                              {product.totalStock || 0} {product.unit || 'unid'}
                            </span>
                          </div>
                        ))}
                        {group.products.length > 3 && (
                          <p className="text-[10px] text-[var(--muted)] text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Out of Stock Section */}
        <Card>
          <CardBody className="p-[18px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)]">
                <EmptyIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-[var(--fg)]">Sin Stock</h3>
                <p className="text-[10px] text-[var(--muted)]">Items sin stock por categoria</p>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto -mx-[18px] px-[18px]">
              {alertGroups.outOfStock.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)] mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Ningun item sin stock</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertGroups.outOfStock.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5">
                        {group.categoryName}
                      </p>
                      <div>
                        {group.products.slice(0, 3).map((product) => (
                          <div key={product.id} className={`flex items-center justify-between py-2 px-3 hover:bg-[var(--surface-2)] rounded-md transition-colors`}>
                            <span className="text-sm font-medium text-[var(--fg-secondary)] truncate flex-1">{product.name}</span>
                            <span className="ml-3 text-[10px] font-mono font-semibold text-[oklch(68%_0.01_260)] bg-[var(--status-critical)] px-2 py-0.5 rounded border border-[oklch(22%_0.01_260)]">
                              Sin Stock
                            </span>
                          </div>
                        ))}
                        {group.products.length > 3 && (
                          <p className="text-[10px] text-[var(--muted)] text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Expiring Soon Section */}
        <Card>
          <CardBody className="p-[18px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)]">
                <CalendarIcon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[13px] font-semibold text-[var(--fg)]">Proximo a Vencer</h3>
                <p className="text-[10px] text-[var(--muted)]">Items por vencer en 7 dias</p>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto -mx-[18px] px-[18px]">
              {alertGroups.expiring.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-[8px] bg-[var(--surface-2)] text-[var(--muted)] mb-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-xs text-[var(--muted)]">Ningun item proximo a vencer</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {alertGroups.expiring.map((group) => (
                    <div key={group.categoryName}>
                      <p className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wide mb-1.5">
                        {group.categoryName}
                      </p>
                      <div>
                        {group.products.slice(0, 3).map((product) => {
                          const days = getDaysUntilExpiration(product.expirationDate!);
                          return (
                            <div key={product.id} className={`flex items-center justify-between py-2 px-3 hover:bg-[var(--surface-2)] rounded-md transition-colors`}>
                              <span className="text-sm font-medium text-[var(--fg-secondary)] truncate flex-1">{product.name}</span>
                              <span className="ml-3 text-[10px] font-mono font-medium text-[var(--fg)] bg-[var(--surface-2)] px-2 py-0.5 rounded border border-[var(--border)]">
                                {days <= 0 ? 'Vencido' : `${days} dias`}
                              </span>
                            </div>
                          );
                        })}
                        {group.products.length > 3 && (
                          <p className="text-[10px] text-[var(--muted)] text-center pt-1">
                            +{group.products.length - 3} mas
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
