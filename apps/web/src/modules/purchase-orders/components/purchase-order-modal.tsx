'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
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
    const validItems = items.filter((item) => item.productId && item.quantity > 0);
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

  const productOptions = [
    { value: '', label: 'Seleccionar producto...' },
    ...products.map((p) => ({ value: p.id, label: `${p.sku} - ${p.name}` })),
  ];

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
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>
              <Button type="button" variant="ghost" size="sm" onClick={addItem}>
                + Agregar item
              </Button>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <div className="flex gap-1 items-end">
                      <div className="flex-1">
                        <Select
                          label={index === 0 ? 'Producto' : undefined}
                          options={productOptions}
                          value={item.productId}
                          onChange={(e) => updateItem(index, 'productId', e.target.value)}
                          required
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => openMiniModal(index)}
                        className="mb-0.5 p-2 rounded-lg text-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                        title="Crear producto nuevo"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Input
                      label={index === 0 ? 'Cantidad' : undefined}
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      required
                    />
                    {item.unit && (
                      <span className="text-xs text-gray-500">{item.unit}</span>
                    )}
                  </div>
                  <div className="col-span-3">
                    <Input
                      label={index === 0 ? 'Precio unit.' : undefined}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                  <div className="col-span-1 text-right text-sm font-medium text-gray-700 pb-2">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </div>
                  <div className="col-span-1 pb-2">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-danger-500 hover:text-danger-700 text-sm"
                      >
                        X
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-right text-sm font-bold text-gray-900 pt-2 border-t">
              Total: ${getTotal().toFixed(2)}
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
