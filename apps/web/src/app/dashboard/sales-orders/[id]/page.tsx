'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSalesOrder, useUpdateSalesOrderStatus, SalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';

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

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: order, isLoading } = useSalesOrder(id);
  const updateStatusMutation = useUpdateSalesOrderStatus();

  function handleStatusChange(newStatus: SalesOrderStatus) {
    if (!order) return;

    if (newStatus === 'PREPARING') {
      if (!confirm('Al preparar esta orden, se reservara el stock para los items. Continuar?')) {
        return;
      }
    }

    if (newStatus === 'SHIPPED') {
      if (!confirm('Al despachar esta orden, se crearan automaticamente los movimientos de salida de inventario. Continuar?')) {
        return;
      }
    }

    if (newStatus === 'CANCELLED') {
      if (!confirm('Cancelar esta orden de venta? Si hay stock reservado, sera liberado.')) {
        return;
      }
    }

    updateStatusMutation.mutate({ id: order.id, status: newStatus, version: order.version });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Cargando orden...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Orden no encontrada</div>
      </div>
    );
  }

  const statusActions: Record<SalesOrderStatus, { label: string; status: SalesOrderStatus; variant?: 'danger' }[]> = {
    PENDING: [
      { label: 'Preparar Orden', status: 'PREPARING' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    PREPARING: [
      { label: 'Despachar', status: 'SHIPPED' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    SHIPPED: [
      { label: 'Marcar Entregada', status: 'DELIVERED' },
    ],
    DELIVERED: [],
    CANCELLED: [],
  };

  const actions = statusActions[order.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Orden de Venta</p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status]} size="lg">
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      {/* Order Info */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase">Cliente</p>
              <p className="text-sm font-medium">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Ubicacion origen</p>
              <p className="text-sm font-medium">{order.locationName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Total</p>
              <p className="text-sm font-bold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase">Fecha creacion</p>
              <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            {order.shippedDate && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Fecha despacho</p>
                <p className="text-sm font-medium">{new Date(order.shippedDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.deliveredDate && (
              <div>
                <p className="text-xs text-gray-500 uppercase">Fecha entrega</p>
                <p className="text-sm font-medium">{new Date(order.deliveredDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 uppercase">Notas</p>
                <p className="text-sm">{order.notes}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Items</h2>
        </CardHeader>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reservado</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.productName}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{item.productSku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.productUnit || '-'}</td>
                    <td className="px-6 py-4 text-sm text-right">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      {item.reservedQty > 0 ? (
                        <Badge variant="info" size="sm">{item.reservedQty}</Badge>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex gap-3 justify-end">
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant === 'danger' ? 'ghost' : 'primary'}
              onClick={() => handleStatusChange(action.status)}
              disabled={updateStatusMutation.isPending}
              className={action.variant === 'danger' ? 'text-danger-600 hover:text-danger-700' : ''}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
