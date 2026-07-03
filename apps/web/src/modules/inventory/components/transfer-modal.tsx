'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { useTransfer, useStock } from '../hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeScanner } from './barcode-scanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function TransferModal({ isOpen, onClose }: Props) {
  const transfer = useTransfer();
  const { data: productsData } = useProducts({ limit: 200 });
  const { data: locations } = useLocations();
  const products = productsData?.data || [];

  const [formData, setFormData] = useState({
    productId: '',
    originLocationId: '',
    destLocationId: '',
    quantity: '',
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
  const canSubmit = !noStock && !transfer.isPending;

  const productOptions = products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }));
  const allLocationOptions = (locations || []).map(l => ({ value: l.id, label: `${l.code} - ${l.name}` }));
  const destLocationOptions = allLocationOptions.filter(l => l.value !== formData.originLocationId);

  function resetForm() {
    setFormData({
      productId: '',
      originLocationId: '',
      destLocationId: '',
      quantity: '',
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
    transfer.mutate(
      {
        productId: formData.productId,
        originLocationId: formData.originLocationId,
        destLocationId: formData.destLocationId,
        quantity: parseInt(formData.quantity),
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
      <Modal isOpen={isOpen} onClose={onClose} title="Transferencia" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Producto */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Producto</p>
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
          </div>

          <hr className="border-[var(--border)]" />

          {/* Ubicaciones */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Ubicaciones</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                label="Origen *"
                value={formData.originLocationId}
                onChange={e => setFormData({ ...formData, originLocationId: e.target.value })}
                options={allLocationOptions}
                placeholder="Seleccionar origen"
                required
              />
              <Select
                label="Destino *"
                value={formData.destLocationId}
                onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
                options={destLocationOptions}
                placeholder="Seleccionar destino"
                required
              />
            </div>
          </div>

          {availableStock !== null && hasStockSelected && (
            <div className={`p-3 rounded-lg flex items-center justify-between ${
              noStock
                ? 'bg-[var(--status-critical)]/10 border border-[var(--status-critical)]/30'
                : 'bg-[var(--surface-2)] border border-[var(--border)]'
            }`}>
              <span className="text-sm font-medium text-[var(--fg)]">Stock en origen:</span>
              <Badge variant={availableStock > 10 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                {availableStock} unidades
              </Badge>
            </div>
          )}

          {noStock && (
            <p className="text-sm text-[var(--status-critical)]">
              No hay stock disponible en la ubicacion de origen para transferir.
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
            <Button type="submit" isLoading={transfer.isPending} disabled={!canSubmit}>
              Registrar Transferencia
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
