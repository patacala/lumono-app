'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
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
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion Origen *</label>
            <select
              value={formData.originLocationId}
              onChange={e => setFormData({ ...formData, originLocationId: e.target.value })}
              required
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar origen</option>
              {locations?.map(l => (
                <option key={l.id} value={l.id}>
                  {l.code} - {l.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicacion Destino *</label>
            <select
              value={formData.destLocationId}
              onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
              required
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar destino</option>
              {locations
                ?.filter(l => l.id !== formData.originLocationId)
                .map(l => (
                  <option key={l.id} value={l.id}>
                    {l.code} - {l.name}
                  </option>
                ))}
            </select>
          </div>

          {availableStock !== null && formData.productId && formData.originLocationId && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stock en origen:</span>
              <Badge variant={availableStock > 10 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                {availableStock} unidades
              </Badge>
            </div>
          )}

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

          <Input
            label="Documento de Referencia"
            value={formData.referenceDocument}
            onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
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
            <Button type="submit" variant="info" isLoading={transfer.isPending}>
              Registrar Transferencia
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
