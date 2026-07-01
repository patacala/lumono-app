'use client';

import { useProduct } from '@/modules/products/hooks/use-products';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import Link from 'next/link';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-danger-600">Product not found</p>
            <Link href="/dashboard/products" className="mt-4 inline-block">
              <Button variant="secondary">Back to Products</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  function getStockBadge(stock: number | undefined, threshold: number = 10) {
    if (stock === undefined) return null;

    if (stock === 0) {
      return <Badge variant="danger">Out of Stock</Badge>;
    } else if (stock < threshold) {
      return <Badge variant="warning">Low Stock: {stock}</Badge>;
    } else {
      return <Badge variant="success">{stock} units</Badge>;
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/products"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          ← Back to Products
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <Badge variant="info" className="font-mono">{product.sku}</Badge>
          {product.supplierName && (
            <Badge variant="neutral">{product.supplierName}</Badge>
          )}
        </div>
        {product.description && (
          <p className="text-gray-600 max-w-3xl">{product.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Price</label>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  ${product.unitPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Stock Threshold</label>
                <p className="mt-1 text-lg text-gray-900">{product.stockThreshold} units</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Total Stock</label>
                <div className="mt-2 flex items-center gap-2">
                  {getStockBadge(product.totalStock, product.stockThreshold)}
                  <span className="text-sm text-gray-500">
                    {product.totalStock ?? 0} units on hand
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Supplier</label>
                <p className="mt-1 text-lg text-gray-900">{product.supplierName || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Version</label>
                <p className="mt-1 text-sm text-gray-900">{product.version}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stock Health</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Threshold</span>
              <Badge variant="neutral">{product.stockThreshold} units</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Hand</span>
              <Badge variant={(product.totalStock || 0) >= product.stockThreshold ? 'success' : 'warning'}>
                {product.totalStock ?? 0} units
              </Badge>
            </div>
            <div className="text-sm text-gray-500">
              Keep on hand above the threshold to avoid stock-outs.
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock by Location</CardTitle>
        </CardHeader>
        <CardBody>
          {product.stockByLocation && product.stockByLocation.length > 0 ? (
            <div className="space-y-3">
              {product.stockByLocation.map((stock) => (
                <div key={stock.locationId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{stock.locationName}</p>
                    <p className="text-xs text-gray-500 font-mono">{stock.locationCode}</p>
                  </div>
                  <Badge variant={stock.quantity >= product.stockThreshold ? 'success' : stock.quantity > 0 ? 'warning' : 'danger'}>
                    {stock.quantity} units
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No stock in any location
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

