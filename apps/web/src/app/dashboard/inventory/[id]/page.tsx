'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/api-client';
import Link from 'next/link';
import { Card, CardHeader, CardBody, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

interface InventoryMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  createdAt: string;
  createdBy?: string;
}

export default function InventoryDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  const { data: movement, isLoading, error } = useQuery({
    queryKey: ['inventory-movement', id],
    queryFn: () => apiClient.get<InventoryMovement>(`/inventory/movements/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading movement details...</div>
      </div>
    );
  }

  if (error || !movement) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8">
            <p className="text-danger-600">Movement not found</p>
            <Link href="/dashboard/inventory" className="mt-4 inline-block">
              <Button variant="secondary">Back to Inventory</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    );
  }

  function getTypeBadge(type: string) {
    const variants: Record<string, 'ocean' | 'coral' | 'violet' | 'ink' | 'glacial' | 'gradient'> = {
      IN: 'ocean',
      OUT: 'coral',
      TRANSFER: 'violet',
      ADJUSTMENT: 'ink',
    };
    return <Badge variant={variants[type] || 'glacial'}>{type}</Badge>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Link
            href="/dashboard/inventory"
            className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
          >
            ← Back to Inventory
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Movement Details</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Movement Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <div className="mt-2">
                {getTypeBadge(movement.type)}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Quantity</label>
              <p className="mt-1 text-2xl font-bold text-gray-900">{movement.quantity} units</p>
            </div>
            
            {movement.unitPrice && (
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Price</label>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  ${movement.unitPrice.toFixed(2)}
                </p>
              </div>
            )}

            {movement.referenceDocument && (
              <div>
                <label className="text-sm font-medium text-gray-500">Reference Document</label>
                <p className="mt-1 text-gray-900 font-mono">{movement.referenceDocument}</p>
              </div>
            )}

            {movement.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="mt-1 text-gray-700">{movement.notes}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Information</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <p className="mt-1 text-gray-900">
                {new Date(movement.createdAt).toLocaleString()}
              </p>
            </div>
            
            {movement.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <p className="mt-1 text-gray-900">{movement.createdBy}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

