'use client';

import { useState } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useRegisterAdjustment, AdjustmentReason, useStock } from '../hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Badge } from '@/shared/components/ui/badge';
import { BarcodeScanner } from './barcode-scanner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const REASONS: { value: AdjustmentReason; label: string }[] = [
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Ajuste *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, subType: 'POSITIVE_ADJUSTMENT' })}
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                  formData.subType === 'POSITIVE_ADJUSTMENT'
                    ? 'border-success-500 bg-success-50 text-success-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Ajuste Positivo (+)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, subType: 'NEGATIVE_ADJUSTMENT' })}
                className={`flex-1 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                  formData.subType === 'NEGATIVE_ADJUSTMENT'
                    ? 'border-danger-500 bg-danger-50 text-danger-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                Ajuste Negativo (-)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razon *</label>
            <select
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              required
              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Seleccionar razon</option>
              {REASONS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
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
              value={formData.locationId}
              onChange={e => setFormData({ ...formData, locationId: e.target.value })}
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

          {availableStock !== null && formData.productId && formData.locationId && (
            <div className="p-3 bg-info-50 border border-info-200 rounded-lg flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stock actual:</span>
              <Badge variant={availableStock > 10 ? 'success' : availableStock > 0 ? 'warning' : 'danger'}>
                {availableStock} unidades
              </Badge>
            </div>
          )}

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
            <Button type="submit" variant="warning" isLoading={registerAdjustment.isPending}>
              Registrar Ajuste
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
