'use client';

import { useState, useMemo } from 'react';
import { useInventoryMovementsPaginated, type InventoryMovement } from '@/modules/inventory/hooks/use-inventory';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { DataTable } from '@/shared/components/ui/data-table';
import { InventoryInModal } from '@/modules/inventory/components/inventory-in-modal';
import { InventoryOutModal } from '@/modules/inventory/components/inventory-out-modal';
import { TransferModal } from '@/modules/inventory/components/transfer-modal';
import { AdjustmentModal } from '@/modules/inventory/components/adjustment-modal';
import { downloadExcelReport } from '@/modules/reports/hooks/use-reports';
import Link from 'next/link';
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

export default function InventoryPage() {
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useInventoryMovementsPaginated({
    page,
    limit: 20,
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
  });

  const [showInModal, setShowInModal] = useState(false);
  const [showOutModal, setShowOutModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

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
          <div className="max-w-xs truncate text-gray-500">
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
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            Ver
          </Link>
        ),
      },
    ],
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando movimientos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-danger-600">
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
          <h1 className="text-3xl font-bold text-gray-900">Movimientos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registro de todos los movimientos de inventario
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="success" size="sm" onClick={() => setShowInModal(true)}>
            + Entrada
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowOutModal(true)}>
            - Salida
          </Button>
          <Button variant="info" size="sm" onClick={() => setShowTransferModal(true)}>
            Transferencia
          </Button>
          <Button variant="warning" size="sm" onClick={() => setShowAdjustmentModal(true)}>
            Ajuste
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => downloadExcelReport('movements')}
          >
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filtrar:</span>
            {['ALL', 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].map(type => (
              <button
                key={type}
                onClick={() => { setTypeFilter(type); setPage(1); }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'ALL' ? 'Todos' : TYPE_BADGES[type]?.label || type}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardBody className="p-0 sm:p-4">
          <DataTable
            data={movements}
            columns={columns}
            searchPlaceholder="Buscar movimientos..."
            enableExportCsv
          />
        </CardBody>
      </Card>

      {data && data.total > data.limit && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
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
            <span className="px-3 py-1 text-sm text-gray-700">
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
    </div>
  );
}
