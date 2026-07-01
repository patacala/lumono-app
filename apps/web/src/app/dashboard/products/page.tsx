'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/modules/products/hooks/use-products';
import { useSuppliers } from '@/modules/suppliers/hooks/use-suppliers';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/ui/pagination';
import { Select } from '@/shared/components/ui/select';

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [minStockInput, setMinStockInput] = useState('');
  const [minStock, setMinStock] = useState('');
  const limit = 10;

  const { data: suppliersData } = useSuppliers();
  const suppliers = suppliersData || [];

  const { data, isLoading, error } = useProducts({ 
    page, 
    limit,
    search: searchTerm || undefined,
    supplierId: selectedSupplier || undefined,
    minStock: minStock ? parseInt(minStock) : undefined,
  });

  const products = data?.data || [];
  const pagination = data?.pagination;

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchTerm(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput]);

  useEffect(() => {
    const id = setTimeout(() => {
      setMinStock(minStockInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [minStockInput]);

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

  function handleSupplierChange(value: string) {
    setSelectedSupplier(value);
    setPage(1);
  }

  const supplierOptions = [
    { value: '', label: 'All Suppliers' },
    ...suppliers.map(s => ({ value: s.id, label: s.name })),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-4 sm:mx-0">
        <CardBody>
          <div className="text-center py-8 text-danger-600">
            Error loading products. Please try again.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product inventory
          </p>
        </div>
        <Link href="/dashboard/products/new">
          <Button>
            + Add Product
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:items-end">
            <div className="md:col-span-2">
              <Input
                label="Search"
                type="text"
                placeholder="Name or SKU..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>

            <Select
              label="Supplier"
              options={supplierOptions}
              value={selectedSupplier}
              onChange={(e) => handleSupplierChange(e.target.value)}
            />
            
            <Input
              label="Min Stock"
              type="number"
              min="0"
              placeholder="Min stock..."
              value={minStockInput}
              onChange={e => setMinStockInput(e.target.value)}
            />

            {(searchTerm || selectedSupplier || minStock) && (
              <div className="md:col-span-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput('');
                    setSearchTerm('');
                    setSelectedSupplier('');
                    setMinStockInput('');
                    setMinStock('');
                    setPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length > 0 ? (
                  products.map(product => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-gray-900">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {product.supplierName || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStockBadge(product.totalStock, product.stockThreshold)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${product.unitPrice.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {searchTerm ? 'No products found matching your search' : 'No products yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>

        {pagination && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setPage}
          />
        )}
      </Card>
    </div>
  );
}

