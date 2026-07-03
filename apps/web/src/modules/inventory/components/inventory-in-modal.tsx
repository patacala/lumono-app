'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { useRegisterIn, MovementSubType } from '../hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { useStock } from '../hooks/use-inventory';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeScanner } from './barcode-scanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const SUB_TYPES = [
  { value: 'PURCHASE', label: 'Compra' },
  { value: 'POSITIVE_ADJUSTMENT', label: 'Ajuste Positivo' },
  { value: 'PRODUCTION', label: 'Produccion' },
  { value: 'RETURN', label: 'Devolucion' },
];

export function InventoryInModal({ isOpen, onClose }: Props) {
  const registerIn = useRegisterIn();
  const { data: productsData } = useProducts({ limit: 200 });
  const { data: locations } = useLocations();
  const products = productsData?.data || [];

  const [formData, setFormData] = useState({
    productId: '',
    destLocationId: '',
    quantity: '',
    subType: '' as string,
    referenceDocument: '',
    notes: '',
    unitPrice: '',
  });
  const [showScanner, setShowScanner] = useState(false);

  const { data: stockData } = useStock(
    formData.productId || undefined,
    formData.destLocationId || undefined
  );

  const productOptions = products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }));
  const locationOptions = (locations || []).map(l => ({ value: l.id, label: `${l.code} - ${l.name}` }));

  function resetForm() {
    setFormData({
      productId: '',
      destLocationId: '',
      quantity: '',
      subType: '',
      referenceDocument: '',
      notes: '',
      unitPrice: '',
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
    registerIn.mutate(
      {
        productId: formData.productId,
        destLocationId: formData.destLocationId,
        quantity: parseInt(formData.quantity),
        subType: (formData.subType || undefined) as MovementSubType | undefined,
        referenceDocument: formData.referenceDocument || undefined,
        notes: formData.notes || undefined,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
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
      <Modal isOpen={isOpen} onClose={onClose} title="Registrar Entrada" size="lg">
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
              label="Ubicacion *"
              value={formData.destLocationId}
              onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
              options={locationOptions}
              placeholder="Seleccionar ubicacion"
              required
            />
          </div>

          {stockData && formData.productId && formData.destLocationId && (
            <div className="p-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-[var(--fg)]">Stock actual en ubicacion:</span>
              <Badge variant={stockData.quantity > 0 ? 'success' : 'neutral'}>
                {stockData.quantity} unidades
              </Badge>
            </div>
          )}

          <hr className="border-[var(--border)]" />

          {/* Detalle */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Detalle</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Cantidad *"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
              <Input
                label="Precio Unitario"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
              />
            </div>
          </div>

          <hr className="border-[var(--border)]" />

          {/* Referencia */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Referencia</p>
            <Input
              label="Documento de Referencia"
              value={formData.referenceDocument}
              onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
              placeholder="Ej: PO-2024-001"
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
            <Button type="submit" isLoading={registerIn.isPending}>
              Registrar Entrada
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
