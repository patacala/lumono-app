'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransfer } from '@/modules/inventory/hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';

export default function TransferPage() {
  const router = useRouter();
  const transfer = useTransfer();
  const { data: productsData } = useProducts({ limit: 100 });
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
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (formData.originLocationId === formData.destLocationId) {
      setError('Origin and destination locations must be different');
      return;
    }

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
          router.push('/dashboard/inventory');
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to transfer inventory');
        },
      }
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/dashboard/inventory"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Back to Inventory
        </Link>
      </div>

      <Card>
        <CardHeader className="bg-blue-50">
          <CardTitle className="text-blue-800">Transfer Inventory</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Product *
              </label>
              <select
                value={formData.productId}
                onChange={e => setFormData({ ...formData, productId: e.target.value })}
                required
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a product</option>
                {products?.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  From Location *
                </label>
                <select
                  value={formData.originLocationId}
                  onChange={e => setFormData({ ...formData, originLocationId: e.target.value })}
                  required
                  className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select origin</option>
                  {locations?.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  To Location *
                </label>
                <select
                  value={formData.destLocationId}
                  onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
                  required
                  className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select destination</option>
                  {locations?.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.code} - {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Quantity *"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={e => setFormData({ ...formData, quantity: e.target.value })}
              required
              placeholder="Enter quantity"
            />

            <Input
              label="Reference Document"
              value={formData.referenceDocument}
              onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
              placeholder="e.g., TRF-2024-001"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={transfer.isPending}>
                {transfer.isPending ? 'Transferring...' : 'Transfer Inventory'}
              </Button>
              <Link href="/dashboard/inventory">
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


