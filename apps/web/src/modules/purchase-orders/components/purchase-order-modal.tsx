'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Combobox } from '@/shared/components/ui/combobox';
import { Button } from '@/shared/components/ui/button';
import { useCreatePurchaseOrder } from '../hooks/use-purchase-orders';
import { useSuppliers } from '@/modules/suppliers/hooks/use-suppliers';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { useProducts, Product } from '@/modules/products/hooks/use-products';
import { CreateProductMiniModal } from './create-product-mini-modal';

interface ItemRow {
  productId: string;
  quantity: number;
  unitPrice: number;
  unit: string;
}

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PurchaseOrderModal({ isOpen, onClose }: PurchaseOrderModalProps) {
  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ productId: '', quantity: 1, unitPrice: 0, unit: '' }]);
  const [miniModalOpen, setMiniModalOpen] = useState(false);
  const [miniModalItemIndex, setMiniModalItemIndex] = useState<number | null>(null);

  const createMutation = useCreatePurchaseOrder();
  const { data: suppliers = [] } = useSuppliers();
  const { data: locations = [] } = useLocations();
  const { data: productsData } = useProducts({ limit: 200 });
  const products = productsData?.data || [];

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

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
    // Auto-fill unit price from product
    if (field === 'productId') {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].unitPrice = product.unitPrice;
        updated[index].unit = product.unit || 'unid';
      }
    }
    setItems(updated);
  }

  function openMiniModal(index: number) {
    setMiniModalItemIndex(index);
    setMiniModalOpen(true);
  }

  function handleProductCreated(product: Product) {
    if (miniModalItemIndex !== null) {
      const updated = [...items];
      updated[miniModalItemIndex].productId = product.id;
      updated[miniModalItemIndex].unitPrice = product.unitPrice;
      updated[miniModalItemIndex].unit = product.unit || 'unid';
      setItems(updated);
    }
    setMiniModalItemIndex(null);
  }

  function getTotal() {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validItems = items
      .filter((item) => item.productId && item.quantity > 0)
      .map(({ productId, quantity, unitPrice }) => ({ productId, quantity, unitPrice }));
    if (validItems.length === 0) return;

    await createMutation.mutateAsync({
      supplierId,
      locationId,
      expectedDate: expectedDate || undefined,
      notes: notes || undefined,
      items: validItems,
    });

    // Reset form
    setSupplierId('');
    setLocationId('');
    setExpectedDate('');
    setNotes('');
    setItems([{ productId: '', quantity: 1, unitPrice: 0, unit: '' }]);
    onClose();
  }

  const supplierOptions = [
    { value: '', label: 'Seleccionar proveedor...' },
    ...suppliers.map((s) => ({ value: s.id, label: s.name })),
  ];

  const locationOptions = [
    { value: '', label: 'Seleccionar ubicacion...' },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ];

  const productOptions = products.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name}` }));

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Nueva Orden de Compra" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Proveedor"
              options={supplierOptions}
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              required
            />
            <Select
              label="Ubicacion destino"
              options={locationOptions}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              required
            />
            <Input
              label="Fecha esperada"
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
            />
            <Input
              label="Notas"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-surface-700">Items</h3>
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
                  {items.map((item, index) => (
                    <tr key={index} className="group">
                      <td className="px-3 py-2 align-top">
                        <Combobox
                          options={productOptions}
                          value={item.productId}
                          onChange={(val) => updateItem(index, 'productId', val)}
                          placeholder="Buscar producto..."
                          onCreate={() => openMiniModal(index)}
                          createLabel="Crear producto"
                          required
                        />
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
                            className="mt-2 p-1 rounded-md text-[var(--muted)] opacity-0 group-hover:opacity-100 hover:text-danger-500 hover:bg-danger-500/10 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
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
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creando...' : 'Crear Orden'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      <CreateProductMiniModal
        isOpen={miniModalOpen}
        onClose={() => { setMiniModalOpen(false); setMiniModalItemIndex(null); }}
        onCreated={handleProductCreated}
        supplierName={selectedSupplier?.name}
        supplierId={supplierId || undefined}
      />
    </>
  );
}
