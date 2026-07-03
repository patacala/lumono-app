'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { useRegisterOut, MovementSubType, useStock } from '../hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeScanner } from './barcode-scanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SUB_TYPES = [
  { value: 'SALE', label: 'Venta' },
  { value: 'NEGATIVE_ADJUSTMENT', label: 'Ajuste Negativo' },
  { value: 'DAMAGE', label: 'Dano' },
  { value: 'INTERNAL_CONSUMPTION', label: 'Consumo Interno' },
];

export function InventoryOutModal({ isOpen, onClose }: Props) {
  const registerOut = useRegisterOut();
  const { data: productsData } = useProducts({ limit: 200 });
  const { data: locations } = useLocations();
  const products = productsData?.data || [];

  const [formData, setFormData] = useState({
    productId: '',
    originLocationId: '',
    quantity: '',
    subType: '' as string,
    referenceDocument: '',
    notes: '',
  });
  const [showScanner, setShowScanner] = useState(false);

  const { data: stockData } = useStock(
    formData.productId || undefined,
    formData.originLocationId || undefined
  );
  const availableStock = stockData?.quantity ?? null;
  const hasStockSelected = formData.productId && formData.originLocationId;
  const noStock = hasStockSelected && availableStock !== null && availableStock <= 0;
  const canSubmit = !noStock && !registerOut.isPending;

  const productOptions = products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }));
  const locationOptions = (locations || []).map(l => ({ value: l.id, label: `${l.code} - ${l.name}` }));

  function resetForm() {
    setFormData({
      productId: '',
      originLocationId: '',
      quantity: '',
      subType: '',
      referenceDocument: '',
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
    if (noStock) return;
    registerOut.mutate(
      {
        productId: formData.productId,
        originLocationId: formData.originLocationId,
        quantity: parseInt(formData.quantity),
        subType: (formData.subType || undefined) as MovementSubType | undefined,
        referenceDocument: formData.referenceDocument || undefined,
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
      <Modal isOpen={isOpen} onClose={onClose} title="Registrar Salida" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Movimiento */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Movimiento</p>
            <Select
              label="Subtipo"
              value={formData.subType}
              onChange={e => setFormData({ ...formData, subType: e.target.value })}
              options={SUB_TYPES}
              placeholder="Seleccionar subtipo"
            />
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
              label="Ubicacion Origen *"
              value={formData.originLocationId}
              onChange={e => setFormData({ ...formData, originLocationId: e.target.value })}
              options={locationOptions}
              placeholder="Seleccionar ubicacion"
              required
            />
          </div>

          {availableStock !== null && hasStockSelected && (
            <div className={`p-3 rounded-lg flex items-center justify-between ${
              noStock
                ? 'bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30'
                : 'bg-[var(--surface-2)] border border-[var(--border)]'
            }`}>
              <span className="text-sm font-medium text-[var(--fg)]">Stock disponible:</span>
              <Badge variant={availableStock > 10 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                {availableStock} unidades
              </Badge>
            </div>
          )}

          {noStock && (
            <p className="text-sm text-[var(--status-critical)]">
              No hay stock disponible para este producto en la ubicacion seleccionada.
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
              max={availableStock ?? undefined}
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              required
              helperText={availableStock !== null ? `Maximo: ${availableStock} unidades` : undefined}
            />
          </div>

          <hr className="border-[var(--border)]" />

          {/* Referencia */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Referencia</p>
            <Input
              label="Documento de Referencia"
              value={formData.referenceDocument}
              onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
              placeholder="Ej: SO-2024-001"
            />
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
            <Button type="submit" isLoading={registerOut.isPending} disabled={!canSubmit}>
              Registrar Salida
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
