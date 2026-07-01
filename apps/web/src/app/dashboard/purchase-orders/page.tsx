'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePurchaseOrders, PurchaseOrderStatus } from '@/modules/purchase-orders/hooks/use-purchase-orders';
import { PurchaseOrderModal } from '@/modules/purchase-orders/components/purchase-order-modal';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/ui/pagination';

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En Transito',
  PARTIALLY_RECEIVED: 'Parcial',
  RECEIVED: 'Recibida',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<PurchaseOrderStatus, 'neutral' | 'warning' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  PENDING: 'warning',
  IN_TRANSIT: 'info',
  PARTIALLY_RECEIVED: 'warning',
  RECEIVED: 'success',
  CANCELLED: 'danger',
};

const STATUS_TABS: (PurchaseOrderStatus | undefined)[] = [
  undefined,
  'DRAFT',
  'PENDING',
  'IN_TRANSIT',
  'PARTIALLY_RECEIVED',
  'RECEIVED',
  'CANCELLED',
];

export default function PurchaseOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const { data, isLoading } = usePurchaseOrders({ page, limit, status: statusFilter });
  const orders = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando ordenes de compra...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordenes de Compra</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona tus ordenes de compra a proveedores</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>+ Nueva Orden</Button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_TABS.map((status) => (
          <button
            key={status || 'ALL'}
            onClick={() => { setStatusFilter(status); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {status ? STATUS_LABELS[status] : 'Todas'}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Proveedor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Esperada</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{order.supplierName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={STATUS_VARIANTS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {order.expectedDate
                          ? new Date(order.expectedDate).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/purchase-orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No hay ordenes de compra
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

      <PurchaseOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
