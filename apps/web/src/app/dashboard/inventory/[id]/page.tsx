'use client';

import { useMovementById } from '@/modules/inventory/hooks/use-inventory';
import Link from 'next/link';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

const TYPE_BADGES: Record<string, { variant: 'success' | 'danger' | 'info' | 'neutral'; label: string }> = {
  IN: { variant: 'success', label: 'Entrada' },
  OUT: { variant: 'danger', label: 'Salida' },
  TRANSFER: { variant: 'info', label: 'Transferencia' },
  ADJUSTMENT: { variant: 'neutral', label: 'Ajuste' },
};

const SUB_TYPE_LABELS: Record<string, string> = {
  PURCHASE: 'Compra',
  POSITIVE_ADJUSTMENT: 'Ajuste Positivo',
  PRODUCTION: 'Produccion',
  RETURN: 'Devolucion',
  SALE: 'Venta',
  NEGATIVE_ADJUSTMENT: 'Ajuste Negativo',
  DAMAGE: 'Dano',
  INTERNAL_CONSUMPTION: 'Consumo Interno',
};

const REASON_LABELS: Record<string, string> = {
  PHYSICAL_COUNT: 'Conteo Fisico',
  CORRECTION: 'Correccion',
  EXPIRATION: 'Expiracion',
  INITIAL_LOAD: 'Carga Inicial',
  OTHER: 'Otro',
};

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: movement, isLoading, error } = useMovementById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-surface-600">Cargando detalles...</div>
      </div>
    );
  }

  if (error || !movement) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-[#cc6060]">Movimiento no encontrado</p>
            <Link href="/dashboard/inventory" className="mt-4 inline-block">
              <Button variant="secondary">Volver a Movimientos</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  const typeBadge = TYPE_BADGES[movement.type] || { variant: 'neutral' as const, label: movement.type };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/inventory"
            className="text-sm text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            &larr; Volver a Movimientos
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">Detalle del Movimiento</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacion del Movimiento</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-600">Tipo</label>
              <div className="mt-2">
                <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>
              </div>
            </div>

            {movement.subType && (
              <div>
                <label className="text-sm font-medium text-surface-600">Subtipo</label>
                <p className="mt-1 text-white">
                  {SUB_TYPE_LABELS[movement.subType] || movement.subType}
                </p>
              </div>
            )}

            {movement.reason && (
              <div>
                <label className="text-sm font-medium text-surface-600">Razon</label>
                <p className="mt-1 text-white">
                  {REASON_LABELS[movement.reason] || movement.reason}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-surface-600">Cantidad</label>
              <p className="mt-1 text-2xl font-bold text-white">{movement.quantity} unidades</p>
            </div>

            {movement.unitPrice && (
              <div>
                <label className="text-sm font-medium text-surface-600">Precio Unitario</label>
                <p className="mt-1 text-lg font-semibold text-white">
                  ${movement.unitPrice.toFixed(2)}
                </p>
              </div>
            )}

            {movement.referenceDocument && (
              <div>
                <label className="text-sm font-medium text-surface-600">Documento de Referencia</label>
                <p className="mt-1 text-white font-mono">{movement.referenceDocument}</p>
              </div>
            )}

            {movement.notes && (
              <div>
                <label className="text-sm font-medium text-surface-600">Notas</label>
                <p className="mt-1 text-surface-600">{movement.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informacion de Auditoria</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-surface-600">Fecha de Creacion</label>
              <p className="mt-1 text-white">
                {new Date(movement.createdAt).toLocaleString()}
              </p>
            </div>

            {movement.createdBy && (
              <div>
                <label className="text-sm font-medium text-surface-600">Creado Por</label>
                <p className="mt-1 text-white">{movement.createdBy}</p>
              </div>
            )}

            {movement.productId && (
              <div>
                <label className="text-sm font-medium text-surface-600">Producto ID</label>
                <p className="mt-1 text-white font-mono text-sm">{movement.productId}</p>
              </div>
            )}

            {movement.originLocationId && (
              <div>
                <label className="text-sm font-medium text-surface-600">Ubicacion Origen</label>
                <p className="mt-1 text-white font-mono text-sm">{movement.originLocationId}</p>
              </div>
            )}

            {movement.destLocationId && (
              <div>
                <label className="text-sm font-medium text-surface-600">Ubicacion Destino</label>
                <p className="mt-1 text-white font-mono text-sm">{movement.destLocationId}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
