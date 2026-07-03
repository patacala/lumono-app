'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateProduct } from '@/modules/products/hooks/use-products';
import { useSuppliers } from '@/modules/suppliers/hooks/use-suppliers';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const { data: suppliers } = useSuppliers();

  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unitPrice: '',
    supplierId: '',
    stockThreshold: '10',
  });

  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    createProduct.mutate(
      {
        sku: formData.sku,
        name: formData.name,
        description: formData.description || undefined,
        unitPrice: parseFloat(formData.unitPrice),
        supplierId: formData.supplierId || undefined,
        stockThreshold: parseInt(formData.stockThreshold) || 10,
      },
      {
        onSuccess: () => {
          router.push('/dashboard/products');
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to create product');
        },
      }
    );
  }

  const supplierOptions = [
    { value: '', label: 'No supplier' },
    ...(suppliers?.map(s => ({ value: s.id, label: `${s.code} - ${s.name}` })) || []),
  ];

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/products"
          className="text-sm text-[var(--accent)] hover:text-[var(--accent)] transition-colors"
        >
          ← Back to Products
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Product</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-[var(--status-critical)] border border-[var(--border)] text-[#cc6060] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="SKU *"
              type="text"
              value={formData.sku}
              onChange={e => setFormData({ ...formData, sku: e.target.value })}
              required
              placeholder="e.g., PROD-001"
            />

            <Input
              label="Name *"
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Product name"
            />

            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="block w-full px-4 py-2.5 text-sm border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors"
                placeholder="Product description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Unit Price *"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
                required
                placeholder="0.00"
              />

              <Input
                label="Stock Threshold *"
                type="number"
                min="1"
                value={formData.stockThreshold}
                onChange={e => setFormData({ ...formData, stockThreshold: e.target.value })}
                required
                helperText="Alert when stock falls below this value"
              />
            </div>

            <Select
              label="Supplier"
              options={supplierOptions}
              value={formData.supplierId}
              onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
              helperText="Select the supplier for this product"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={createProduct.isPending}
              >
                Create Product
              </Button>
              <Link href="/dashboard/products">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
