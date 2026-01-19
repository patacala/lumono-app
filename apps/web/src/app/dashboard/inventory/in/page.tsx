'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterIn } from '@/modules/inventory/hooks/use-inventory';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useLocations } from '@/modules/locations/hooks/use-locations';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import Link from 'next/link';

export default function RegisterInPage() {
  const router = useRouter();
  const registerIn = useRegisterIn();
  const { data: productsResponse, isLoading: loadingProducts } = useProducts({ limit: 100 });
  const { data: locations, isLoading: loadingLocations } = useLocations();

  const products = productsResponse?.data ?? [];

  const [formData, setFormData] = useState({
    productId: '',
    destLocationId: '',
    quantity: '',
    referenceDocument: '',
    notes: '',
    unitPrice: '',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    registerIn.mutate(
      {
        productId: formData.productId,
        destLocationId: formData.destLocationId,
        quantity: parseInt(formData.quantity),
        referenceDocument: formData.referenceDocument || undefined,
        notes: formData.notes || undefined,
        unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : undefined,
      },
      {
        onSuccess: () => {
          router.push('/dashboard/inventory');
        },
        onError: (err: any) => {
          setError(err.message || 'Failed to register inventory');
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
        <CardHeader className="bg-green-50">
          <CardTitle className="text-green-800">Register Inventory IN</CardTitle>
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
                disabled={loadingProducts}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.sku} - {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Destination Location *
              </label>
              <select
                value={formData.destLocationId}
                onChange={e => setFormData({ ...formData, destLocationId: e.target.value })}
                required
                disabled={loadingLocations}
                className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">Select a location</option>
                {locations?.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
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
              label="Unit Price"
              type="number"
              step="0.01"
              min="0"
              value={formData.unitPrice}
              onChange={e => setFormData({ ...formData, unitPrice: e.target.value })}
              placeholder="0.00"
            />

            <Input
              label="Reference Document"
              value={formData.referenceDocument}
              onChange={e => setFormData({ ...formData, referenceDocument: e.target.value })}
              placeholder="e.g., PO-2024-001"
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
              <Button type="submit" variant="primary" disabled={registerIn.isPending}>
                {registerIn.isPending ? 'Registering...' : 'Register IN'}
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


