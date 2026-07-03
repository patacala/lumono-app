'use client';

import { useState, useCallback } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { Button } from '@/shared/components/ui/button';
import { useCreateSalesOrder, type SalesOrder } from '../hooks/use-sales-orders';
import { useCustomers } from '@/modules/customers/hooks/use-customers';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { useProducts, type StockByLocation } from '@/modules/products/hooks/use-products';
import { apiClient } from '@/shared/lib/api-client';

interface ItemRow {
  productId: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface SalesOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (order: SalesOrder) => void;
}

export function SalesOrderModal({ isOpen, onClose, onCreated }: SalesOrderModalProps) {
  const [customerId, setCustomerId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ productId: '', quantity: 1, unitPrice: 0, unit: '' }]);

  // Cache of stockByLocation per productId (fetched on demand)
  const [stockCache, setStockCache] = useState<Record<string, StockByLocation[]>>({});

  const createMutation = useCreateSalesOrder();
  const { data: customers = [] } = useCustomers();
  const { data: locations = [] } = useLocations();
  const { data: productsData } = useProducts({ limit: 200 });
  const products = productsData?.data || [];

  const fetchStockByLocation = useCallback(async (productId: string) => {
    if (stockCache[productId]) return;
    try {
      const product = await apiClient.get<{ stockByLocation?: StockByLocation[] }>(`/products/${productId}`);
      setStockCache((prev) => ({ ...prev, [productId]: product.stockByLocation || [] }));
    } catch {
      // silently fail — validation just won't show
    }
  }, [stockCache]);

  function addItem() {
    setItems([...items, { productId: '', quantity: 1, unitPrice: 0, unit: '' }]);
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  }

  function updateItem(index: number, field: keyof ItemRow, value: string | number) {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].unitPrice = product.salePrice || product.unitPrice;
        updated[index].unit = product.unit || 'unid';
      }
      if (value) fetchStockByLocation(value as string);
    }
    setItems(updated);
  }

  function getTotal() {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  function getProductStockAtLocation(productId: string) {
    if (!locationId || !productId) return null;
    const locations = stockCache[productId];
    if (!locations) return null; // not fetched yet
    const loc = locations.find((l) => l.locationId === locationId);
    return loc?.quantity ?? 0;
  }

  const hasStockErrors = items.some((item) => {
    if (!item.productId || !locationId) return false;
    const stock = getProductStockAtLocation(item.productId);
    return stock !== null && item.quantity > stock;
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (hasStockErrors) return;
    const validItems = items
      .filter((item) => item.productId && item.quantity > 0)
      .map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice }));
    if (validItems.length === 0) return;

    const order = await createMutation.mutateAsync({
      customerId,
      locationId,
      notes: notes || undefined,
      items: validItems,
    });

    setCustomerId('');
    setLocationId('');
    setNotes('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, unit: '' }]);
    setStockCache({});
    onCreated?.(order);
    onClose();
  }

  const customerOptions = [
    { value: '', label: 'Seleccionar cliente...' },
    ...customers.map((c) => ({ value: c.id, label: `${c.code} - ${c.name}` })),
  ];

  const locationOptions = [
    { value: '', label: 'Seleccionar ubicacion...' },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  const productOptions = products.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name}` }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva Orden de Venta" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Cliente"
            options={customerOptions}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          />
          <Select
            label="Ubicacion origen"
            options={locationOptions}
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            required
          />
          <div className="md:col-span-2">
            <Input
              label="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-[var(--fg-secondary)]">Items</h3>
            <Button type="button" variant="ghost" size="sm" onClick={addItem}>
              + Agregar item
            </Button>
          </div>

          <div className="rounded-lg border border-[var(--border)]">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--surface-2)]">
                  <th className="text-left text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider px-3 py-2">Producto</th>
                  <th className="text-left text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider px-3 py-2 w-28">Cant.</th>
                  <th className="text-left text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider px-3 py-2 w-32">Precio</th>
                  <th className="text-right text-xs font-semibold text-[var(--fg-secondary)] uppercase tracking-wider px-3 py-2 w-24">Subtotal</th>
                  <th className="w-10 px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {items.map((item, index) => {
                  const stock = getProductStockAtLocation(item.productId);
                  const exceedsStock = stock !== null && item.quantity > stock;
                  return (
                    <tr key={index} className="group">
                      <td className="px-3 py-2 align-top">
                        <Combobox
                          options={productOptions}
                          value={item.productId}
                          onChange={(val) => updateItem(index, 'productId', val)}
                          placeholder="Buscar producto..."
                          required
                        />
                        {item.productId && locationId && stock !== null && (
                          <span className={`text-xs mt-0.5 inline-block ${exceedsStock ? 'text-[oklch(68%_0.01_260)]' : 'text-[var(--muted)]'}`}>
                            Disponible: {stock} {item.unit || 'uds'}
                            {exceedsStock && ' — stock insuficiente'}
                          </span>
                        )}
                        {item.productId && !locationId && (
                          <span className="text-xs text-[var(--muted)] mt-0.5 inline-block">Selecciona ubicacion</span>
                        )}
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            required
                            className="w-16 px-2 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] focus:border-[oklch(68%_0.19_55_/_0.45)] focus:ring-1 focus:ring-[oklch(68%_0.19_55_/_0.45)] focus:ring-offset-0 hover:border-[var(--border-hover)] transition-all duration-200"
                          />
                          {item.unit && (
                            <span className="text-xs text-[var(--muted)] font-medium shrink-0">{item.unit}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top">
                        <div className="flex items-center gap-0.5">
                          <span className="text-sm text-[var(--muted)]">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            required
                            className="w-full px-2 py-2 text-sm bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--fg)] focus:border-[oklch(68%_0.19_55_/_0.45)] focus:ring-1 focus:ring-[oklch(68%_0.19_55_/_0.45)] focus:ring-offset-0 hover:border-[var(--border-hover)] transition-all duration-200"
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2 align-top text-right">
                        <span className="text-sm font-semibold text-[var(--fg)] leading-[40px]">
                          ${(item.quantity * item.unitPrice).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-2 py-2 align-top">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="mt-2 p-1 rounded-md text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-[oklch(68%_0.01_260)] hover:bg-[var(--status-critical)] transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--surface-2)]">
                  <td colSpan={3} className="px-3 py-2.5 text-right text-sm font-semibold text-[var(--fg-secondary)]">Total</td>
                  <td className="px-3 py-2.5 text-right text-sm font-bold text-[var(--fg)]">${getTotal().toFixed(2)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending || hasStockErrors}>
            {createMutation.isPending ? 'Creando...' : 'Crear Orden'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
