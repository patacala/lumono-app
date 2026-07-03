'use client';

import { useState, useMemo } from 'react';
import { useLots, LotCondition } from '@/modules/lots/hooks/use-lots';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Tabs } from '@/shared/components/ui/tabs';
import { DataTable } from '@/shared/components/ui/data-table';
import { Layers } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';
import type { Lot } from '@/modules/lots/hooks/use-lots';

const CONDITION_LABELS: Record<LotCondition, string> = {
  GOOD: 'Bueno',
  DAMAGED: 'Danado',
  EXPIRED: 'Vencido',
};

const CONDITION_VARIANTS: Record<LotCondition, 'ok' | 'attention' | 'critical'> = {
  GOOD: 'ok',
  DAMAGED: 'attention',
  EXPIRED: 'critical',
};

const FILTER_TABS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'GOOD', label: 'Bueno' },
  { id: 'DAMAGED', label: 'Danado' },
  { id: 'EXPIRED', label: 'Vencido' },
];

const METRIC_CARD = {
  icon: Layers,
  title: 'Total Lotes',
  description: 'Lotes registrados en el sistema',
};

export default function LotsPage() {
  const [page, setPage] = useState(1);
  const [conditionFilter, setConditionFilter] = useState('ALL');
  const limit = 20;

  const { data, isLoading, error } = useLots({
    page,
    limit,
    condition: conditionFilter !== 'ALL' ? (conditionFilter as LotCondition) : undefined,
  });

  const lots = data?.data || [];
  const pagination = data?.pagination;
  const totalLots = pagination?.total ?? 0;

  const columns = useMemo<ColumnDef<Lot, any>[]>(
    () => [
      {
        accessorKey: 'lotNumber',
        header: 'Lote #',
        cell: ({ getValue }) => (
          <span className="font-mono font-medium text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'productName',
        header: 'Producto',
        cell: ({ getValue }) => (
          <span className="text-[var(--fg)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'productSku',
        header: 'SKU',
        cell: ({ getValue }) => (
          <span className="font-mono text-[var(--fg-secondary)]">{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'locationName',
        header: 'Ubicacion',
        cell: ({ getValue }) => (getValue() as string) || '-',
      },
      {
        accessorKey: 'quantity',
        header: 'Cantidad',
        cell: ({ getValue }) => (
          <span className="font-semibold tabular-nums text-right block">{getValue() as number}</span>
        ),
      },
      {
        accessorKey: 'condition',
        header: 'Condicion',
        cell: ({ getValue }) => {
          const condition = getValue() as LotCondition;
          return (
            <Badge variant={CONDITION_VARIANTS[condition]}>
              {CONDITION_LABELS[condition]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'expirationDate',
        header: 'Vencimiento',
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
      {
        accessorKey: 'manufacturingDate',
        header: 'Fabricacion',
        cell: ({ getValue }) => {
          const date = getValue() as string | undefined;
          return date ? new Date(date).toLocaleDateString() : '-';
        },
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando lotes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar lotes. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--fg)]">Lotes</h1>
        <p className="text-[var(--muted)]">Trazabilidad de lotes por producto y ubicacion</p>
      </div>

      <div className="max-w-sm">
        <div className="border border-[var(--border)] rounded-xl p-4 transition-all text-left">
          <METRIC_CARD.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
          <p className="text-2xl font-bold text-[var(--fg)] tabular-nums mb-0.5">
            {totalLots}
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{METRIC_CARD.title}</p>
          <p className="text-xs text-[var(--muted)] mt-0.5">{METRIC_CARD.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <Tabs
            tabs={FILTER_TABS}
            activeTab={conditionFilter}
            onChange={(id) => {
              setConditionFilter(id);
              setPage(1);
            }}
          />
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={lots}
            columns={columns}
            searchPlaceholder="Buscar lotes..."
            showSearch={false}
            showPagination={false}
          />

          {pagination && (
            <div className="flex items-center justify-between mt-4 px-2 sm:px-0">
              <div className="text-sm text-[var(--muted)]">
                Mostrando {lots.length} de {pagination.total} resultados
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
    </div>
  );
}
