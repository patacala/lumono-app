'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePurchaseOrders, PurchaseOrderStatus } from '@/modules/purchase-orders/hooks/use-purchase-orders';
import { PurchaseOrderModal } from '@/modules/purchase-orders/components/purchase-order-modal';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs } from '@/shared/components/ui/tabs';
import { DataTable } from '@/shared/components/ui/data-table';
import { useAuth } from '@/modules/auth/context/auth-context';
import { ClipboardList, Plus } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { PurchaseOrder } from '@/modules/purchase-orders/hooks/use-purchase-orders';

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En Transito',
  PARTIALLY_RECEIVED: 'Parcial',
  RECEIVED: 'Recibida',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<PurchaseOrderStatus, 'neutral' | 'attention' | 'accent' | 'ok' | 'critical'> = {
  DRAFT: 'neutral',
  PENDING: 'attention',
  IN_TRANSIT: 'accent',
  PARTIALLY_RECEIVED: 'attention',
  RECEIVED: 'ok',
  CANCELLED: 'critical',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'Todas' },
  { id: 'DRAFT', label: 'Borrador' },
  { id: 'PENDING', label: 'Pendiente' },
  { id: 'IN_TRANSIT', label: 'En Transito' },
  { id: 'PARTIALLY_RECEIVED', label: 'Parcial' },
  { id: 'RECEIVED', label: 'Recibida' },
  { id: 'CANCELLED', label: 'Cancelada' },
];

const METRIC_CARD = {
  icon: ClipboardList,
  title: 'Total Ordenes',
  description: 'Ordenes de compra registradas',
};

export default function PurchaseOrdersPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const canCreate = hasPermission('purchase-order.create');

  const { data, isLoading, error } = usePurchaseOrders({
    page,
    limit,
    status: statusFilter !== 'ALL' ? (statusFilter as PurchaseOrderStatus) : undefined,
  });

  const orders = data?.data || [];
  const pagination = data?.pagination;
  const totalOrders = pagination?.total ?? 0;

  const columns = useMemo<ColumnDef<PurchaseOrder, any>[]>(
    () => [
      {
        accessorKey: 'orderNumber',
        header: 'Orden #',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'supplierName',
        header: 'Proveedor',
        cell: ({ getValue }) => (
          <span className="text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: ({ getValue }) => {
          const status = getValue() as PurchaseOrderStatus;
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
        accessorKey: 'expectedDate',
        header: 'Fecha Esperada',
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/dashboard/purchase-orders/${row.original.id}`}
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
        <div className="text-[var(--muted)]">Cargando ordenes de compra...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar ordenes de compra. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Ordenes de Compra</h1>
          <p className="text-[var(--muted)]">Gestiona tus ordenes de compra a proveedores</p>
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
        <PurchaseOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
