'use client';

import { useState, useEffect } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { useCreateProduct, useUpdateProduct, Product } from '../hooks/use-products';
import { useCategories } from '@/modules/categories/hooks/use-categories';
import { useSuppliers } from '@/modules/suppliers/hooks/use-suppliers';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product;
  onSuccess?: () => void;
}

const UNIT_OPTIONS = [
  { value: 'unid', label: 'Unidades' },
  { value: 'kg', label: 'Kilogramos (kg)' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'L', label: 'Litros (L)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'gal', label: 'Galones (gal)' },
  { value: 'caj', label: 'Cajas (caj)' },
  { value: 'paq', label: 'Paquetes (paq)' },
  { value: 'lb', label: 'Libras (lb)' },
  { value: 'oz', label: 'Onzas (oz)' },
];

export function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unitPrice: '',
    supplierId: '',
    categoryId: '',
    stockThreshold: '10',
    unit: 'unid',
    expirationDate: '',
  });
  const [error, setError] = useState('');

  const { data: categories } = useCategories();
  const { data: suppliers } = useSuppliers();

  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(product?.id || '');

  const isEditing = !!product;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        unitPrice: product.unitPrice.toString(),
        supplierId: product.supplierId || '',
        categoryId: product.categoryId || '',
        stockThreshold: product.stockThreshold.toString(),
        unit: product.unit || 'unid',
        expirationDate: product.expirationDate
          ? new Date(product.expirationDate).toISOString().split('T')[0]
          : '',
      });
    } else {
      setFormData({
        sku: '',
        name: '',
        description: '',
        unitPrice: '',
        supplierId: '',
        categoryId: '',
        stockThreshold: '10',
        unit: 'unid',
        expirationDate: '',
      });
    }
    setError('');
  }, [product, isOpen]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.sku.trim() || !formData.name.trim() || !formData.unitPrice) {
      setError('SKU, Nombre y Precio son requeridos');
      return;
    }

    const payload = {
      sku: formData.sku.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      unitPrice: parseFloat(formData.unitPrice),
      supplierId: formData.supplierId || undefined,
      categoryId: formData.categoryId || undefined,
      stockThreshold: parseInt(formData.stockThreshold) || 10,
      unit: formData.unit,
      expirationDate: formData.expirationDate || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          ...payload,
          version: product!.version,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el producto');
    }
  };

  const categoryOptions = [
    { value: '', label: 'Sin categoria' },
    ...(categories?.map((c) => ({ value: c.id, label: c.name })) || []),
  ];

  const supplierOptions = [
    { value: '', label: 'Sin proveedor' },
    ...(suppliers?.map((s) => ({ value: s.id, label: s.name })) || []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="SKU"
            value={formData.sku}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Ej: PROD-001"
            required
            disabled={isEditing}
          />

          <Input
            label="Nombre"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Nombre del producto"
            required
          />
        </div>

        <Input
          label="Descripcion (opcional)"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripcion del producto"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Categoria"
            value={formData.categoryId}
            onChange={(e) => handleChange('categoryId', e.target.value)}
            options={categoryOptions}
          />

          <Select
            label="Proveedor"
            value={formData.supplierId}
            onChange={(e) => handleChange('supplierId', e.target.value)}
            options={supplierOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Precio Unitario"
            type="number"
            step="0.01"
            min="0"
            value={formData.unitPrice}
            onChange={(e) => handleChange('unitPrice', e.target.value)}
            placeholder="0.00"
            required
          />

          <Input
            label="Stock Minimo"
            type="number"
            min="1"
            value={formData.stockThreshold}
            onChange={(e) => handleChange('stockThreshold', e.target.value)}
            helperText="Alerta cuando el stock baje"
          />

          <Select
            label="Unidad de Medida"
            value={formData.unit}
            onChange={(e) => handleChange('unit', e.target.value)}
            options={UNIT_OPTIONS}
          />
        </div>

        <Input
          label="Fecha de Caducidad (opcional)"
          type="date"
          value={formData.expirationDate}
          onChange={(e) => handleChange('expirationDate', e.target.value)}
          helperText="Dejar vacio si no aplica"
        />

        <ModalFooter className="-mx-6 -mb-6 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
