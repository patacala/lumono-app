'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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

const SUB_TYPES: { value: MovementSubType; label: string }[] = [
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtipo</label>
            <select
              value={formData.subType}
              onChange={e => setFormData({ ...formData, subType: e.target.value })}
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar subtipo</option>
              {SUB_TYPES.map(st => (
                <option key={st.value} value={st.value}>{st.label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Producto *</label>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowScanner(true)}>
                Escanear Codigo
              </Button>
            </div>
            <select
              value={formData.productId}
              onChange={e => setFormData({ ...formData, productId: e.target.value })}
              required
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar producto</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion *</label>
            <select
              value={formData.destLocationId}
              onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
              required
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar ubicacion</option>
              {locations?.map(l => (
                <option key={l.id} value={l.id}>
                  {l.code} - {l.name}
                </option>
              ))}
            </select>
          </div>

          {stockData && formData.productId && formData.destLocationId && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stock actual en ubicacion:</span>
              <Badge variant={stockData.quantity > 0 ? 'success' : 'neutral'}>
                {stockData.quantity} unidades
              </Badge>
            </div>
          )}

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

          <Input
            label="Documento de Referencia"
            value={formData.referenceDocument}
            onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
            placeholder="Ej: PO-2024-001"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" variant="success" isLoading={registerIn.isPending}>
              Registrar Entrada
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </div>
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
