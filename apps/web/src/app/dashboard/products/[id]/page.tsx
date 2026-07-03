'use client';

import { useState } from 'react';
import { useProduct } from '@/modules/products/hooks/use-products';
import { useInventoryMovements } from '@/modules/inventory/hooks/use-inventory';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { ProductModal } from '@/modules/products/components/product-modal';
import { useAuth } from '@/modules/auth/context/auth-context';
import Link from 'next/link';

const movementTypeLabels: Record<string, string> = {
  IN: 'Entrada de compra',
  OUT: 'Salida por venta',
  TRANSFER: 'Transferencia interna',
  ADJUSTMENT: 'Ajuste de inventario',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { hasPermission } = useAuth();
  const { data: product, isLoading, error } = useProduct(id);
  const { data: movements } = useInventoryMovements(id);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const canUpdate = hasPermission('product.update');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Cargando producto...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Link href="/dashboard/products" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] inline-flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Productos
        </Link>
        <Card><CardBody className="text-center py-12"><p className="text-[var(--muted)]">Producto no encontrado</p></CardBody></Card>
      </div>
    );
  }

  const totalStock = product.totalStock ?? 0;
  const stockValue = totalStock * product.unitPrice;
  const stockRatio = product.stockThreshold > 0 ? Math.min(totalStock / (product.stockThreshold * 3), 1) : 1;
  const isLowStock = totalStock > 0 && totalStock < product.stockThreshold;
  const recentMovements = (movements || []).slice(0, 10);

  // Estimate reposition days based on recent OUT movements
  const outMovements = (movements || []).filter(m => m.type === 'OUT');
  let reposicionDias: number | null = null;
  if (outMovements.length >= 2 && totalStock > product.stockThreshold) {
    const totalOut = outMovements.reduce((s, m) => s + m.quantity, 0);
    const firstDate = new Date(outMovements[outMovements.length - 1].createdAt).getTime();
    const lastDate = new Date(outMovements[0].createdAt).getTime();
    const daySpan = Math.max((lastDate - firstDate) / (1000 * 60 * 60 * 24), 1);
    const dailyRate = totalOut / daySpan;
    if (dailyRate > 0) {
      reposicionDias = Math.round((totalStock - product.stockThreshold) / dailyRate);
    }
  }

  // Max stock for progress bars in stock by location
  const maxLocationStock = Math.max(...(product.stockByLocation?.map(l => l.quantity) || [1]), 1);

  // Initials from product name
  const initials = product.name.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase()).join('');

  // Main location (highest stock)
  const mainLocation = product.stockByLocation?.length
    ? [...product.stockByLocation].sort((a, b) => b.quantity - a.quantity)[0]
    : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link href="/dashboard/products" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Productos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[var(--surface-2)] border border-[var(--border)] grid place-items-center flex-shrink-0">
            <span className="text-[var(--muted)] font-semibold text-sm">{initials}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--fg)]">{product.name}</h1>
            <p className="text-sm text-[var(--muted)]">
              {product.sku}
              {product.categoryName && <> · {product.categoryName}</>}
              {product.supplierName && <> · Proveedor: {product.supplierName}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canUpdate && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
                Ajustar stock
              </Button>
              <Link href="/dashboard/inventory">
                <Button size="sm">Registrar movimiento</Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ======= LEFT COLUMN ======= */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* 6 Info Cards — 2 columns, 3 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Stock Actual */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Stock Actual</p>
                <p className="text-3xl font-bold text-[var(--accent)]">
                  {totalStock} <span className="text-lg font-normal text-[var(--muted)]">{product.unit || 'uds'}</span>
                </p>
              </CardBody>
            </Card>

            {/* Precio Unitario */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Precio Unitario</p>
                <p className="text-3xl font-bold text-[var(--fg)]">
                  ${product.unitPrice.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </CardBody>
            </Card>

            {/* Valor en Stock */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Valor en Stock</p>
                <p className="text-3xl font-bold text-[var(--fg)]">
                  ${stockValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                </p>
              </CardBody>
            </Card>

            {/* Estado */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Estado</p>
                <div className="mt-1">
                  {totalStock === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-400">
                      <span className="w-2 h-2 rounded-full bg-red-400"></span>
                      Sin stock
                    </span>
                  ) : isLowStock ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-yellow-400">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      Stock bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400"></span>
                      En stock
                    </span>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Stock Mínimo */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Stock Minimo</p>
                <p className="text-3xl font-bold text-[var(--fg)]">
                  {product.stockThreshold} <span className="text-lg font-normal text-[var(--muted)]">{product.unit || 'uds'}</span>
                </p>
              </CardBody>
            </Card>

            {/* Ubicación Principal */}
            <Card>
              <CardBody className="p-5">
                <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-wider mb-2">Ubicacion Principal</p>
                {mainLocation ? (
                  <p className="text-lg font-semibold text-[var(--fg)]">
                    {mainLocation.locationName} · {mainLocation.locationCode}
                  </p>
                ) : (
                  <p className="text-lg text-[var(--muted)]">—</p>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Historial de Movimientos */}
          <Card>
            <CardBody className="p-5">
              <h2 className="text-base font-semibold text-[var(--fg)] mb-4">Historial de movimientos</h2>
              {recentMovements.length > 0 ? (
                <div className="space-y-0 divide-y divide-[var(--border)]">
                  {recentMovements.map((m) => (
                    <div key={m.id} className="flex items-start gap-4 py-4">
                      {/* Date */}
                      <div className="w-16 flex-shrink-0 text-right">
                        <p className="text-sm font-medium text-[var(--muted)] leading-tight">
                          {new Date(m.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-xs text-[var(--muted)]">
                          {new Date(m.createdAt).getFullYear()}
                        </p>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--fg)]">
                          {movementTypeLabels[m.type] || m.type}
                        </p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {m.referenceDocument || ''}
                          {m.notes && <>{m.referenceDocument ? ' · ' : ''}{m.notes}</>}
                        </p>
                      </div>

                      {/* Quantity */}
                      <div className="flex-shrink-0">
                        <span className={`text-base font-semibold ${
                          m.type === 'IN' ? 'text-green-400' : m.type === 'OUT' ? 'text-red-400' : 'text-[var(--fg)]'
                        }`}>
                          {m.type === 'IN' ? '+' : m.type === 'OUT' ? '−' : ''}{m.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-[var(--muted)] text-sm">
                  Sin movimientos registrados
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* ======= RIGHT COLUMN ======= */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-4">
          {/* Nivel de Stock */}
          <Card>
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-[var(--fg)] mb-3">Nivel de stock</h3>
              <div className="flex items-end justify-between mb-3">
                <p className="text-4xl font-bold text-[var(--fg)]">{totalStock}</p>
                <p className="text-sm text-[var(--muted)]">min. {product.stockThreshold} {product.unit || 'uds'}</p>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-[var(--surface-2)] mb-3">
                <div
                  className="h-2 rounded-full bg-[var(--accent)] transition-all duration-500"
                  style={{ width: `${stockRatio * 100}%` }}
                />
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {totalStock === 0
                  ? 'Sin stock disponible. Se recomienda reabastecer.'
                  : isLowStock
                    ? `Stock por debajo del minimo. Reabastecer pronto.`
                    : reposicionDias
                      ? `Por encima del umbral minimo. Proxima reposicion sugerida en ~${reposicionDias} dias.`
                      : 'Por encima del umbral minimo.'}
              </p>
            </CardBody>
          </Card>

          {/* Stock por Ubicación */}
          <Card>
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-[var(--fg)] mb-4">Stock por ubicacion</h3>
              {product.stockByLocation && product.stockByLocation.length > 0 ? (
                <div className="space-y-4">
                  {product.stockByLocation.map((loc) => (
                    <div key={loc.locationId}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-[var(--fg)]">{loc.locationName}</span>
                        <span className="text-sm font-semibold text-[var(--fg)]">{loc.quantity} {product.unit || 'uds'}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--surface-2)]">
                        <div
                          className="h-1.5 rounded-full bg-[var(--accent)] transition-all duration-500"
                          style={{ width: `${(loc.quantity / maxLocationStock) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)] text-center py-4">Sin stock en ubicaciones</p>
              )}
            </CardBody>
          </Card>

          {/* Acciones Rápidas */}
          <Card>
            <CardBody className="p-5">
              <h3 className="text-sm font-semibold text-[var(--fg)] mb-3">Acciones rapidas</h3>
              <div className="space-y-2">
                <Link href="/dashboard/purchase-orders" className="block">
                  <button className="w-full text-left px-3 py-2.5 text-sm text-[var(--fg)] rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                    Crear orden de compra
                  </button>
                </Link>
                <Link href="/dashboard/inventory" className="block">
                  <button className="w-full text-left px-3 py-2.5 text-sm text-[var(--fg)] rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                    Transferir entre almacenes
                  </button>
                </Link>
                <button className="w-full text-left px-3 py-2.5 text-sm text-[var(--fg)] rounded-lg border border-[var(--border)] hover:bg-[var(--surface-2)] transition-colors">
                  Exportar historial
                </button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <ProductModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        product={product}
      />
    </div>
  );
}
