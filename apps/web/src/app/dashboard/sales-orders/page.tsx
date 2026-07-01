'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSalesOrders, SalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';
import { SalesOrderModal } from '@/modules/sales-orders/components/sales-order-modal';
import { Card, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Pagination } from '@/shared/components/ui/pagination';

const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  SHIPPED: 'Despachada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<SalesOrderStatus, 'neutral' | 'warning' | 'info' | 'success' | 'danger'> = {
  PENDING: 'warning',
  PREPARING: 'info',
  SHIPPED: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const STATUS_TABS: (SalesOrderStatus | undefined)[] = [
  undefined,
  'PENDING',
  'PREPARING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function SalesOrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SalesOrderStatus | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const limit = 20;

  const { data, isLoading } = useSalesOrders({ page, limit, status: statusFilter });
  const orders = data?.data || [];
  const pagination = data?.pagination;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando ordenes de venta...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordenes de Venta</h1>
          <p className="mt-1 text-sm text-gray-500">Gestiona tus ordenes de venta a clientes</p>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
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
                      <td className="px-6 py-4 text-sm text-gray-900">{order.customerName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={STATUS_VARIANTS[order.status]}>
                          {STATUS_LABELS[order.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{order.items?.length || 0}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        ${order.totalAmount?.toFixed(2) || '0.00'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/dashboard/sales-orders/${order.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay ordenes de venta
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

      <SalesOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
