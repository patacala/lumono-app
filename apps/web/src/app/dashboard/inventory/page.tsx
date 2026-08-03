'use client';

import { useState, useMemo } from 'react';
import { useInventoryMovementsPaginated, type InventoryMovement } from '@/modules/inventory/hooks/use-inventory';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable } from '@/shared/components/ui/data-table';
import { Tabs } from '@/shared/components/ui/tabs';
import { InventoryInModal } from '@/modules/inventory/components/inventory-in-modal';
import { InventoryOutModal } from '@/modules/inventory/components/inventory-out-modal';
import { TransferModal } from '@/modules/inventory/components/transfer-modal';
import { AdjustmentModal } from '@/modules/inventory/components/adjustment-modal';
import { MovementCsvImportModal } from '@/modules/inventory/components/movement-csv-import-modal';
import { downloadExcelReport } from '@/modules/reports/hooks/use-reports';
import { useDebounce } from '@/shared/hooks/use-debounce';
import Link from 'next/link';
import { PackagePlus, PackageMinus, ArrowLeftRight, SlidersHorizontal, Upload } from 'lucide-react';
import { type ColumnDef } from '@tanstack/react-table';

const TYPE_BADGES: Record<string, { variant: 'success' | 'danger' | 'info' | 'neutral'; label: string }> = {
  IN: { variant: 'success', label: 'Entrada' },
  OUT: { variant: 'danger', label: 'Salida' },
  TRANSFER: { variant: 'info', label: 'Transferencia' },
  ADJUSTMENT: { variant: 'neutral', label: 'Ajuste' },
};

const SUB_TYPE_LABELS: Record<string, string> = {
  PURCHASE: 'Compra',
  POSITIVE_ADJUSTMENT: 'Ajuste +',
  PRODUCTION: 'Produccion',
  RETURN: 'Devolucion',
  SALE: 'Venta',
  NEGATIVE_ADJUSTMENT: 'Ajuste -',
  DAMAGE: 'Dano',
  INTERNAL_CONSUMPTION: 'Consumo',
};

const ACTION_CARDS = [
  {
    key: 'in',
    icon: PackagePlus,
    title: 'Entrada',
    description: 'Registrar ingreso de productos',
  },
  {
    key: 'out',
    icon: PackageMinus,
    title: 'Salida',
    description: 'Registrar salida de productos',
  },
  {
    key: 'transfer',
    icon: ArrowLeftRight,
    title: 'Transferencia',
    description: 'Mover entre ubicaciones',
  },
  {
    key: 'adjustment',
    icon: SlidersHorizontal,
    title: 'Ajuste',
    description: 'Ajustar cantidades de stock',
  },
] as const;

const FILTER_TABS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'IN', label: 'Entradas' },
  { id: 'OUT', label: 'Salidas' },
  { id: 'TRANSFER', label: 'Transferencias' },
  { id: 'ADJUSTMENT', label: 'Ajustes' },
];

export default function InventoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const { data, isLoading, error } = useInventoryMovementsPaginated({
    page,
    limit: 20,
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
    search: debouncedSearch || undefined,
  });

  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  function handleActionClick(key: string) {
    switch (key) {
      case 'in': setShowInModal(true); break;
      case 'out': setShowOutModal(true); break;
      case 'transfer': setShowTransferModal(true); break;
      case 'adjustment': setShowAdjustmentModal(true); break;
    }
  }

  const columns = useMemo<ColumnDef<InventoryMovement, any>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Fecha',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: ({ getValue }) => {
          const type = getValue() as string;
          const badge = TYPE_BADGES[type] || { variant: 'neutral' as const, label: type };
          return <Badge variant={badge.variant}>{badge.label}</Badge>;
        },
      },
      {
        accessorKey: 'subType',
        header: 'Subtipo',
        cell: ({ getValue }) => {
          const subType = getValue() as string;
          return subType ? SUB_TYPE_LABELS[subType] || subType : '-';
        },
      },
      {
        id: 'product',
        header: 'Producto',
        cell: ({ row }) => {
          const m = row.original;
          return m.productName ? (
            <div className="max-w-[16rem]">
              <p className="truncate text-[var(--fg)]">{m.productName}</p>
              {m.productSku && (
                <p className="text-xs text-[var(--muted)] font-mono">{m.productSku}</p>
              )}
            </div>
          ) : (
            <span className="text-[var(--muted)]">-</span>
          );
        },
      },
      {
        id: 'location',
        header: 'Ubicacion',
        cell: ({ row }) => {
          const m = row.original;
          if (m.type === 'TRANSFER' && m.originLocationName && m.destLocationName) {
            return (
              <span className="text-sm text-[var(--fg)]">
                {m.originLocationName} <span className="text-[var(--muted)]">&rarr;</span> {m.destLocationName}
              </span>
            );
          }
          const loc = m.destLocationName || m.originLocationName;
          return loc ? (
            <span className="text-sm text-[var(--fg)]">{loc}</span>
          ) : (
            <span className="text-[var(--muted)]">-</span>
          );
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Cantidad',
        cell: ({ getValue }) => (
          <span className="font-semibold">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'referenceDocument',
        header: 'Referencia',
        cell: ({ getValue }) => getValue() || '-',
      },
      {
        accessorKey: 'notes',
        header: 'Notas',
        cell: ({ getValue }) => (
          <div className="max-w-xs truncate text-[var(--muted)]">
            {getValue() || '-'}
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Link
            href={`/dashboard/inventory/${row.original.id}`}
            className="text-[var(--accent)] hover:text-[var(--accent)] text-sm font-medium"
          >
            Ver
          </Link>
        ),
      },
    ],
    []
  );

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando movimientos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-[var(--status-critical)]">
            Error al cargar movimientos. Intenta de nuevo.
          </div>
        </CardBody>
      </Card>
    );
  }

  const movements = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">Movimientos</h1>
          <p className="text-[var(--muted)]">Registro de todos los movimientos de inventario</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="w-4 h-4" />
            Carga masiva
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadExcelReport('movements')}
          >
            Exportar Excel
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const table = document.querySelector('table');
              if (!table) return;
              const rows = Array.from(table.querySelectorAll('tr'));
              const csv = rows.map(row =>
                Array.from(row.querySelectorAll('th, td')).map(cell => `"${cell.textContent?.replace(/"/g, '""') || ''}"`).join(',')
              ).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'movimientos.csv';
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {ACTION_CARDS.map(({ key, icon: Icon, title, description }) => (
          <button
            key={key}
            onClick={() => handleActionClick(key)}
            className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--accent)] hover:bg-[var(--surface-2)] cursor-pointer transition-all text-left"
          >
            <Icon className="w-5 h-5 text-[var(--accent)] mb-2" />
            <p className="text-sm font-semibold text-[var(--fg)]">{title}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">{description}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <Tabs
            tabs={FILTER_TABS}
            activeTab={typeFilter}
            onChange={(id) => { setTypeFilter(id); setPage(1); }}
          />
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por producto, SKU, referencia o notas..."
              className="px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--surface)] text-[var(--fg)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] focus:border-[var(--accent)] w-full sm:w-96 text-sm"
            />
          </div>
          <DataTable
            data={movements}
            columns={columns}
            showSearch={false}
            showPagination={false}
          />
        </CardBody>
      </Card>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-[var(--muted)]">
            Mostrando {movements.length} de {data.total} movimientos
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Anterior
            </Button>
            <span className="px-3 py-1 text-sm text-[var(--muted)]">
              Pagina {page} de {Math.ceil(data.total / data.limit)}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(data.total / data.limit)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <InventoryInModal isOpen={showInModal} onClose={() => setShowInModal(false)} />
      <InventoryOutModal isOpen={showOutModal} onClose={() => setShowOutModal(false)} />
      <TransferModal isOpen={showTransferModal} onClose={() => setShowTransferModal(false)} />
      <AdjustmentModal isOpen={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)} />
      <MovementCsvImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
}
