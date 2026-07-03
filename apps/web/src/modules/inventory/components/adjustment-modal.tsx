'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { useRegisterAdjustment, AdjustmentReason, useStock } from '../hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeScanner } from './barcode-scanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS = [
  { value: 'PHYSICAL_COUNT', label: 'Conteo Fisico' },
  { value: 'CORRECTION', label: 'Correccion' },
  { value: 'EXPIRATION', label: 'Expiracion' },
  { value: 'INITIAL_LOAD', label: 'Carga Inicial' },
  { value: 'OTHER', label: 'Otro' },
];

export function AdjustmentModal({ isOpen, onClose }: Props) {
  const registerAdjustment = useRegisterAdjustment();
  const { data: productsData } = useProducts({ limit: 200 });
  const { data: locations } = useLocations();
  const products = productsData?.data || [];

  const [formData, setFormData] = useState({
    productId: '',
    locationId: '',
    quantity: '',
    subType: 'POSITIVE_ADJUSTMENT' as 'POSITIVE_ADJUSTMENT' | 'NEGATIVE_ADJUSTMENT',
    reason: '' as string,
    notes: '',
  });
  const [showScanner, setShowScanner] = useState(false);

  const { data: stockData } = useStock(
    formData.productId || undefined,
    formData.locationId || undefined
  );
  const availableStock = stockData?.quantity ?? null;
  const isNegative = formData.subType === 'NEGATIVE_ADJUSTMENT';
  const hasStockSelected = formData.productId && formData.locationId;
  const noStockForNegative = isNegative && hasStockSelected && availableStock !== null && availableStock <= 0;
  const canSubmit = !noStockForNegative && !registerAdjustment.isPending;

  const productOptions = products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }));
  const locationOptions = (locations || []).map(l => ({ value: l.id, label: `${l.code} - ${l.name}` }));

  function resetForm() {
    setFormData({
      productId: '',
      locationId: '',
      quantity: '',
      subType: 'POSITIVE_ADJUSTMENT',
      reason: '',
      notes: '',
    });
  }

  function handleBarcodeScan(code: string) {
    const product = products.find(p => p.sku === code);
    if (product) {
      setFormData(prev => ({ ...prev, productId: product.id }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (noStockForNegative) return;
    registerAdjustment.mutate(
      {
        productId: formData.productId,
        locationId: formData.locationId,
        quantity: parseInt(formData.quantity),
        subType: formData.subType,
        reason: formData.reason as AdjustmentReason,
        notes: formData.notes || undefined,
      },
      {
        onSuccess: () => {
          resetForm();
          onClose();
        },
      }
    );
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Ajuste de Inventario" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Tipo de ajuste */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Tipo de ajuste</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, subType: 'POSITIVE_ADJUSTMENT' })}
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                  formData.subType === 'POSITIVE_ADJUSTMENT'
                    ? 'border-[var(--status-ok)] bg-[var(--status-ok)]/10 text-[var(--status-ok)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]'
                }`}
              >
                Ajuste Positivo (+)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, subType: 'NEGATIVE_ADJUSTMENT' })}
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                  formData.subType === 'NEGATIVE_ADJUSTMENT'
                    ? 'border-[var(--status-critical)] bg-[var(--status-critical)]/10 text-[var(--status-critical)]'
                    : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-hover)]'
                }`}
              >
                Ajuste Negativo (-)
              </button>
            </div>
            <Select
              label="Razon *"
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              options={REASONS}
              placeholder="Seleccionar razon"
              required
            />
          </div>

          <hr className="border-[var(--border)]" />

          {/* Producto y ubicacion */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Producto y ubicacion</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--fg-secondary)]">Producto *</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowScanner(true)}>
                Escanear Codigo
              </Button>
            </div>
            <Combobox
              options={productOptions}
              value={formData.productId}
              onChange={value => setFormData({ ...formData, productId: value })}
              placeholder="Buscar producto por nombre o SKU..."
              required
            />
            <Select
              label="Ubicacion *"
              value={formData.locationId}
              onChange={e => setFormData({ ...formData, locationId: e.target.value })}
              options={locationOptions}
              placeholder="Seleccionar ubicacion"
              required
            />
          </div>

          {availableStock !== null && hasStockSelected && (
            <div className={`p-3 rounded-lg flex items-center justify-between ${
              noStockForNegative
                ? 'bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30'
                : 'bg-[var(--surface-2)] border border-[var(--border)]'
            }`}>
              <span className="text-sm font-medium text-[var(--fg)]">Stock actual:</span>
              <Badge variant={availableStock > 10 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                {availableStock} unidades
              </Badge>
            </div>
          )}

          {noStockForNegative && (
            <p className="text-sm text-[var(--status-critical)]">
              No hay stock disponible para realizar un ajuste negativo.
            </p>
          )}

          <hr className="border-[var(--border)]" />

          {/* Detalle */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Detalle</p>
            <Input
              label="Cantidad *"
              type="number"
              min="1"
              max={formData.subType === 'NEGATIVE_ADJUSTMENT' && availableStock !== null ? availableStock : undefined}
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              required
              helperText={
                formData.subType === 'NEGATIVE_ADJUSTMENT' && availableStock !== null
                  ? `Maximo: ${availableStock} unidades`
                  : undefined
              }
            />
          </div>

          <hr className="border-[var(--border)]" />

          {/* Notas */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Notas</p>
            <Input
              label="Notas"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <ModalFooter className="-mx-6 -mb-6 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={registerAdjustment.isPending} disabled={!canSubmit}>
              Registrar Ajuste
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <BarcodeScanner
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScan={handleBarcodeScan}
      />
    </>
  );
}
