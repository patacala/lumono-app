'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSalesOrders, useUpdateSalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';
import { SalesOrderModal } from '@/modules/sales-orders/components/sales-order-modal';
import { OrderTrackingCard } from '@/modules/sales-orders/components/order-tracking-card';
import { OrderTrackingDetail } from '@/modules/sales-orders/components/order-tracking-detail';
import { Tabs } from '@/shared/components/ui/tabs';
import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/modules/auth/context/auth-context';
import { ArrowLeft, ClipboardList, ChevronLeft, Plus } from 'lucide-react';
import type { SalesOrder, SalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';

const ACTIVE_STATUSES: SalesOrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED'];

const STATUS_GROUP_LABELS: Record<string, string> = {
  PENDING: 'Pendientes',
  PREPARING: 'Preparando',
  SHIPPED: 'Despachadas',
};

const METRIC_CARDS = [
  { id: 'PENDING', label: 'Pendientes', description: 'Esperando preparacion' },
  { id: 'PREPARING', label: 'Preparando', description: 'En almacen' },
  { id: 'SHIPPED', label: 'Despachadas', description: 'En transito' },
] as const;

export default function SalesOrdersTrackingPage() {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const updateStatus = useUpdateSalesOrderStatus();

  const canCreate = hasPermission('sales-order.create');

  const { data: pendingData, isLoading: loadingPending } = useSalesOrders({
    status: 'PENDING',
    limit: 100,
    refetchInterval: 30000,
  });
  const { data: preparingData, isLoading: loadingPreparing } = useSalesOrders({
    status: 'PREPARING',
    limit: 100,
    refetchInterval: 30000,
  });
  const { data: shippedData, isLoading: loadingShipped } = useSalesOrders({
    status: 'SHIPPED',
    limit: 100,
    refetchInterval: 30000,
  });

  const isLoading = loadingPending || loadingPreparing || loadingShipped;

  const pendingOrders = pendingData?.data || [];
  const preparingOrders = preparingData?.data || [];
  const shippedOrders = shippedData?.data || [];

  const ordersByStatus: Record<string, SalesOrder[]> = {
    PENDING: pendingOrders,
    PREPARING: preparingOrders,
    SHIPPED: shippedOrders,
  };

  const totalActive = pendingOrders.length + preparingOrders.length + shippedOrders.length;

  const tabs = [
    { id: 'ALL', label: 'Todas', count: totalActive },
    { id: 'PENDING', label: 'Pendientes', count: ordersByStatus.PENDING.length },
    { id: 'PREPARING', label: 'Preparando', count: ordersByStatus.PREPARING.length },
    { id: 'SHIPPED', label: 'Despachadas', count: ordersByStatus.SHIPPED.length },
  ];

  const visibleStatuses =
    activeTab === 'ALL' ? ACTIVE_STATUSES : [activeTab as SalesOrderStatus];

  const flatOrders = useMemo(
    () => visibleStatuses.flatMap((status) => ordersByStatus[status] || []),
    [visibleStatuses, pendingOrders, preparingOrders, shippedOrders],
  );

  useEffect(() => {
    if (flatOrders.length === 0) {
      setSelectedId(null);
      setMobileShowDetail(false);
      return;
    }
    setSelectedId((current) => {
      if (current && flatOrders.some((o) => o.id === current)) return current;
      return flatOrders[0].id;
    });
  }, [flatOrders]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onResize = () => {
      if (mq.matches) setMobileShowDetail(false);
    };
    mq.addEventListener('change', onResize);
    return () => mq.removeEventListener('change', onResize);
  }, []);

  function handleSelect(order: SalesOrder) {
    setSelectedId(order.id);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobileShowDetail(true);
    }
  }

  function handleOrderCreated(order: SalesOrder) {
    setActiveTab('PENDING');
    setSelectedId(order.id);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setMobileShowDetail(true);
    }
  }

  function handleStatusChange(id: string, status: SalesOrderStatus, version: number) {
    updateStatus.mutate({ id, status, version });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando ordenes...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Seguimiento de Ordenes</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {totalActive} {totalActive === 1 ? 'orden activa' : 'ordenes activas'} · actualizacion cada 30s
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {canCreate && (
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Orden</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          )}
          <Link
            href="/dashboard/sales-orders"
            className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--fg)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Administrar</span>
          </Link>
        </div>
      </div>

      <SalesOrderModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleOrderCreated}
      />

      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3 shrink-0">
        {METRIC_CARDS.map((metric) => {
          const count = ordersByStatus[metric.id]?.length ?? 0;
          const isActive = activeTab === metric.id;
          return (
            <button
              key={metric.id}
              type="button"
              onClick={() => setActiveTab(metric.id)}
              className={`
                border rounded-xl p-3 text-left transition-all
                ${isActive
                  ? 'border-[var(--accent)] bg-[var(--accent-dim)]'
                  : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]'
                }
              `}
            >
              <p className={`text-2xl font-bold tabular-nums ${isActive ? 'text-[var(--accent)]' : 'text-[var(--fg)]'}`}>
                {count}
              </p>
              <p className="text-xs font-semibold text-[var(--fg)] mt-0.5">{metric.label}</p>
              <p className="text-[10px] text-[var(--muted)]">{metric.description}</p>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="overflow-x-auto shrink-0">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {totalActive === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 border border-dashed border-[var(--border)] rounded-xl py-16">
          <ClipboardList className="w-10 h-10 text-[var(--muted)] mb-3 opacity-40" />
          <p className="text-sm text-[var(--muted)]">No hay ordenes activas</p>
        </div>
      ) : (
        <>
          {/* Mobile: single full-width panel */}
          <div className="md:hidden flex flex-col flex-1 min-h-0 w-full">
            {mobileShowDetail ? (
              <div className="flex flex-col flex-1 min-h-0 w-full">
                <button
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="flex items-center gap-1 text-sm text-[var(--muted)] hover:text-[var(--fg)] mb-3 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Volver a la lista
                </button>
                <div className="flex-1 min-h-[400px] w-full">
                  <OrderTrackingDetail
                    orderId={selectedId}
                    onStatusUpdated={() => {
                      if (selectedId) {
                        const order = flatOrders.find((o) => o.id === selectedId);
                        if (order && !ACTIVE_STATUSES.includes(order.status)) {
                          setSelectedId(null);
                          setMobileShowDetail(false);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0 w-full">
                <OrderListContent
                  visibleStatuses={visibleStatuses}
                  ordersByStatus={ordersByStatus}
                  activeTab={activeTab}
                  selectedId={selectedId}
                  onSelect={handleSelect}
                  onStatusChange={handleStatusChange}
                  isUpdating={updateStatus.isPending}
                />
              </div>
            )}
          </div>

          {/* Tablet+: split list + detail */}
          <div className="hidden md:grid md:grid-cols-[minmax(260px,34%)_1fr] lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr] flex-1 min-h-0 gap-4 w-full">
            <div className="flex flex-col min-h-0 min-w-0">
              <OrderListContent
                visibleStatuses={visibleStatuses}
                ordersByStatus={ordersByStatus}
                activeTab={activeTab}
                selectedId={selectedId}
                onSelect={handleSelect}
                onStatusChange={handleStatusChange}
                isUpdating={updateStatus.isPending}
              />
            </div>
            <div className="flex flex-col min-h-0 min-w-0">
              <OrderTrackingDetail
                orderId={selectedId}
                onStatusUpdated={() => {
                  if (selectedId) {
                    const order = flatOrders.find((o) => o.id === selectedId);
                    if (order && !ACTIVE_STATUSES.includes(order.status)) {
                      setSelectedId(null);
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface OrderListContentProps {
  visibleStatuses: SalesOrderStatus[];
  ordersByStatus: Record<string, SalesOrder[]>;
  activeTab: string;
  selectedId: string | null;
  onSelect: (order: SalesOrder) => void;
  onStatusChange: (id: string, status: SalesOrderStatus, version: number) => void;
  isUpdating: boolean;
}

function OrderListContent({
  visibleStatuses,
  ordersByStatus,
  activeTab,
  selectedId,
  onSelect,
  onStatusChange,
  isUpdating,
}: OrderListContentProps) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4 w-full">
      {visibleStatuses.map((status) => {
        const orders = ordersByStatus[status] || [];
        if (orders.length === 0) return null;

        return (
          <div key={status} className="w-full">
            {activeTab === 'ALL' && (
              <h2 className="text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">
                {STATUS_GROUP_LABELS[status]} ({orders.length})
              </h2>
            )}
            <div className="space-y-2 w-full">
              {orders.map((order) => (
                <OrderTrackingCard
                  key={order.id}
                  order={order}
                  isSelected={selectedId === order.id}
                  onSelect={onSelect}
                  onStatusChange={onStatusChange}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
