'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSalesOrders, SalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';
import { SalesOrderModal } from '@/modules/sales-orders/components/sales-order-modal';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs } from '@/shared/components/ui/tabs';
import { DataTable } from '@/shared/components/ui/data-table';
import { useAuth } from '@/modules/auth/context/auth-context';
import { ShoppingCart, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { SalesOrder } from '@/modules/sales-orders/hooks/use-sales-orders';

const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  SHIPPED: 'Despachada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<SalesOrderStatus, 'neutral' | 'attention' | 'accent' | 'ok' | 'critical'> = {
  PENDING: 'attention',
  PREPARING: 'accent',
  SHIPPED: 'neutral',
  DELIVERED: 'ok',
  CANCELLED: 'critical',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'PENDING', label: 'Pendiente' },
  { id: 'PREPARING', label: 'Preparando' },
  { id: 'SHIPPED', label: 'Despachada' },
  { id: 'DELIVERED', label: 'Entregada' },
  { id: 'CANCELLED', label: 'Cancelada' },
];

const METRIC_CARD = {
  icon: ShoppingCart,
  title: 'Total Ordenes',
  description: 'Ordenes de venta registradas',
};

export default function SalesOrdersPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const canCreate = hasPermission('sales-order.create');

  const { data, isLoading, error } = useSalesOrders({
    page,
    limit,
    status: statusFilter !== 'ALL' ? (statusFilter as SalesOrderStatus) : undefined,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const totalOrders = pagination?.total ?? 0;

  const columns = useMemo<ColumnDef<SalesOrder, any>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Orden #',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Cliente',
        cell: ({ getValue }) => (
          <span className="text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ getValue }) => {
          const status = getValue() as SalesOrderStatus;
          return (
            <Badge variant={STATUS_VARIANTS[status]}>
              {STATUS_LABELS[status]}
            </Badge>
          );
        },
      },
      {
        id: 'items',
        header: 'Items',
        cell: ({ row }) => row.original.items?.length || 0,
      },
      {
        accessorKey: 'totalAmount',
        header: 'Total',
        cell: ({ getValue }) => (
          <span className="font-semibold text-[var(--fg)] tabular-nums">
            ${((getValue() as number) ?? 0).toFixed(2)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/dashboard/sales-orders/${row.original.id}`}
            className="text-[var(--accent)] hover:text-[var(--accent-hover)] text-sm font-medium transition-colors"
          >
            Ver
          </Link>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando ordenes de venta...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar ordenes de venta. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Ordenes de Venta</h1>
          <p className="text-[var(--muted)]">Gestiona tus ordenes de venta a clientes</p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nueva Orden
          </Button>
        )}
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalOrders}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs
            tabs={FILTER_TABS}
            activeTab={statusFilter}
            onChange={(id) => {
              setStatusFilter(id);
              setPage(1);
            }}
          />
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={orders}
            columns={columns}
            searchPlaceholder="Buscar ordenes..."
            showSearch={false}
            showPagination={false}
          />

          {pagination && (
            <div className="flex items-center justify-between mt-4 px-2 sm:px-0">
              <div className="text-sm text-[var(--muted)]">
                Mostrando {orders.length} de {pagination.total} resultados
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  Anterior
                </Button>
                <span className="px-3 py-1 text-sm text-[var(--muted)]">
                  Pagina {page} de {Math.max(1, pagination.totalPages)}
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {canCreate && (
        <SalesOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
