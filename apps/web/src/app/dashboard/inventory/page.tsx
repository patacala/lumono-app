'use client';

import { useState } from 'react';
import { useInventoryMovements } from '@/modules/inventory/hooks/use-inventory';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Modal } from '@/shared/components/ui/modal';

export default function InventoryPage() {
  const { data: movements, isLoading, error } = useInventoryMovements();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [showMovementModal, setShowMovementModal] = useState(false);
  const router = useRouter();

  const filteredMovements = movements?.filter(
    m => typeFilter === 'ALL' || m.type === typeFilter
  );

  function handleMovementTypeSelect(type: 'IN' | 'OUT' | 'TRANSFER') {
    setShowMovementModal(false);
    router.push(`/dashboard/inventory/${type.toLowerCase()}`);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading movements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardBody>
          <div className="text-center py-8 text-danger-600">
            Error loading movements. Please try again.
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Movements</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track all inventory movements and transactions
          </p>
        </div>
        <Button onClick={() => setShowMovementModal(true)}>
          + Add Movement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">Filter by type:</span>
            {['ALL', 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  typeFilter === type
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements && filteredMovements.length > 0 ? (
                  filteredMovements.map(movement => (
                    <tr key={movement.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            movement.type === 'IN' ? 'ocean' :
                            movement.type === 'OUT' ? 'coral' :
                            movement.type === 'TRANSFER' ? 'violet' : 'ink'
                          }
                        >
                          {movement.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {movement.referenceDocument || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {movement.notes || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(movement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link href={`/dashboard/inventory/${movement.id}`} className="text-primary-600 hover:text-primary-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        {typeFilter !== 'ALL'
                          ? `No ${typeFilter} movements found`
                          : 'No movements yet'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {filteredMovements && filteredMovements.length > 0 && (
        <div className="text-sm text-gray-500 text-right">
          Showing {filteredMovements.length} movement{filteredMovements.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Movement Type Selection Modal */}
      <Modal
        isOpen={showMovementModal}
        onClose={() => setShowMovementModal(false)}
        title="Select Movement Type"
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleMovementTypeSelect('IN')}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-success-500 hover:bg-success-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600 group-hover:bg-success-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Inventory IN</p>
                <p className="text-sm text-gray-500">Register incoming stock</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMovementTypeSelect('OUT')}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-danger-500 hover:bg-danger-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center text-danger-600 group-hover:bg-danger-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Inventory OUT</p>
                <p className="text-sm text-gray-500">Register outgoing stock</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleMovementTypeSelect('TRANSFER')}
            className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-info-500 hover:bg-info-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info-100 flex items-center justify-center text-info-600 group-hover:bg-info-200">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Transfer</p>
                <p className="text-sm text-gray-500">Move between locations</p>
              </div>
            </div>
          </button>
        </div>
      </Modal>
    </div>
  );
}

