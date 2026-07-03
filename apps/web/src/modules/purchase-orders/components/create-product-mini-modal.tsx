'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import { useCreateProduct, Product } from '@/modules/products/hooks/use-products';
import { toast } from 'sonner';

const UNIT_OPTIONS = [
  { value: 'unid', label: 'Unidades (unid)' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'caj', label: 'Cajas (caj)' },
  { value: 'gal', label: 'Galones (gal)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'g', label: 'Gramos (g)' },
];

interface CreateProductMiniModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: Product) => void;
  supplierName?: string;
  supplierId?: string;
}

export function CreateProductMiniModal({
  isOpen,
  onClose,
  onCreated,
  supplierName,
  supplierId,
}: CreateProductMiniModalProps) {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('unid');
  const [unitPrice, setUnitPrice] = useState(0);

  const createMutation = useCreateProduct();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const product = await createMutation.mutateAsync({
        sku: sku.trim() || undefined,
        name,
        unit,
        unitPrice,
        supplierId: supplierId || undefined,
      });
      toast.success('Producto creado exitosamente');
      onCreated(product);
      resetForm();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al crear producto');
    }
  }

  function resetForm() {
    setSku('');
    setName('');
    setUnit('unid');
    setUnitPrice(0);
  }

  const unitOptions = [
    { value: '', label: 'Seleccionar unidad...' },
    ...UNIT_OPTIONS,
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Producto Rapido" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="SKU"
          value={sku}
          onChange={(e) => setSku(e.target.value)}
          placeholder="Se genera automaticamente"
          helperText="Dejar vacio para generar automaticamente"
        />
        <Input
          label="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Nombre del producto"
        />
        <Select
          label="Unidad de medida"
          options={unitOptions}
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          required
        />
        <Input
          label="Precio unitario"
          type="number"
          min="0"
          step="0.01"
          value={unitPrice}
          onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
          required
        />
        {supplierName && (
          <div>
            <label className="block text-sm font-medium text-surface-800 mb-1">Proveedor</label>
            <div className="px-3 py-2 bg-surface-200 rounded-lg text-sm text-surface-600 border border-[var(--border)]">
              {supplierName}
            </div>
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creando...' : 'Crear Producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
