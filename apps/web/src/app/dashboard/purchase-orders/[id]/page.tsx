'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePurchaseOrder, useUpdatePurchaseOrderStatus, PurchaseOrderStatus } from '@/modules/purchase-orders/hooks/use-purchase-orders';
import { ReceiveOrderModal } from '@/modules/purchase-orders/components/receive-order-modal';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { toast } from 'sonner';

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  DRAFT: 'Borrador',
  PENDING: 'Pendiente',
  IN_TRANSIT: 'En Transito',
  PARTIALLY_RECEIVED: 'Parcialmente Recibida',
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

const CONDITION_LABELS: Record<string, string> = {
  GOOD: 'Bueno',
  DAMAGED: 'Danado',
  EXPIRED: 'Vencido',
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);

  const { data: order, isLoading } = usePurchaseOrder(id);
  const updateStatusMutation = useUpdatePurchaseOrderStatus();
  const [confirmCancel, setConfirmCancel] = useState(false);

  function handleStatusChange(newStatus: PurchaseOrderStatus) {
    if (!order) return;
    if (newStatus === 'CANCELLED') {
      setConfirmCancel(true);
      return;
    }
    executeStatusChange(newStatus);
  }

  function executeStatusChange(newStatus: PurchaseOrderStatus) {
    if (!order) return;
    setConfirmCancel(false);
    updateStatusMutation.mutate(
      { id: order.id, status: newStatus, version: order.version },
      {
        onSuccess: () => toast.success(`Orden actualizada a ${STATUS_LABELS[newStatus]}`),
        onError: () => toast.error('Error al actualizar la orden'),
      },
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-surface-600">Cargando orden...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-surface-600">Orden no encontrada</div>
      </div>
    );
  }

  const canReceive = order.status === 'IN_TRANSIT' || order.status === 'PARTIALLY_RECEIVED';
  const hasReceivableItems = order.items?.some((i) => i.receivedQty < i.quantity) ?? false;

  const statusActions: Record<PurchaseOrderStatus, { label: string; status?: PurchaseOrderStatus; variant?: 'primary' | 'danger'; action?: 'receive' }[]> = {
    DRAFT: [
      { label: 'Enviar a Proveedor', status: 'PENDING' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    PENDING: [
      { label: 'Marcar En Transito', status: 'IN_TRANSIT' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    IN_TRANSIT: [
      { label: 'Recibir Orden', action: 'receive' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    PARTIALLY_RECEIVED: [
      { label: 'Recibir Mas', action: 'receive' },
      { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
    ],
    RECEIVED: [],
    CANCELLED: [],
  };

  const actions = statusActions[order.status];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-surface-600 hover:text-surface-700">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">{order.orderNumber}</h1>
          <p className="text-sm text-surface-600">Orden de Compra</p>
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
              <p className="text-xs text-surface-600 uppercase">Proveedor</p>
              <p className="text-sm font-medium">{order.supplierName}</p>
            </div>
            <div>
              <p className="text-xs text-surface-600 uppercase">Ubicacion destino</p>
              <p className="text-sm font-medium">{order.locationName}</p>
            </div>
            <div>
              <p className="text-xs text-surface-600 uppercase">Fecha esperada</p>
              <p className="text-sm font-medium">
                {order.expectedDate ? new Date(order.expectedDate).toLocaleDateString() : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-surface-600 uppercase">Total</p>
              <p className="text-sm font-bold">${order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            {order.receivedDate && (
              <div>
                <p className="text-xs text-surface-600 uppercase">Fecha recibida</p>
                <p className="text-sm font-medium">{new Date(order.receivedDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-2">
                <p className="text-xs text-surface-600 uppercase">Notas</p>
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
            <table className="min-w-full divide-y divide-[var(--border)]">
              <thead className="bg-surface-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-600 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-600 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-600 uppercase">Unidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-600 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-600 uppercase">Recibido</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-600 uppercase">Progreso</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-600 uppercase">Precio Unit.</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-surface-600 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-[var(--surface)] divide-y divide-[var(--border)]">
                {order.items?.map((item) => {
                  const pct = item.quantity > 0 ? Math.round((item.receivedQty / item.quantity) * 100) : 0;
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm font-medium text-surface-900">{item.productName}</td>
                      <td className="px-6 py-4 text-sm font-mono text-surface-600">{item.productSku}</td>
                      <td className="px-6 py-4 text-sm text-surface-600">{item.productUnit || '-'}</td>
                      <td className="px-6 py-4 text-sm text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-right">{item.receivedQty}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-surface-200 rounded-full h-2 max-w-[80px]">
                            <div
                              className={`h-2 rounded-full ${pct >= 100 ? 'bg-[#5caa80]' : pct > 0 ? 'bg-[#c89040]' : 'bg-surface-200'}`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-surface-600">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-right">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Receipt History */}
      {order.receipts && order.receipts.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Historial de Recepciones</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {order.receipts.map((receipt) => (
              <div key={receipt.id} className="border border-[var(--border)] rounded-lg p-3 bg-surface-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-surface-900">
                    {new Date(receipt.receivedDate).toLocaleString()}
                  </span>
                  {receipt.notes && (
                    <span className="text-xs text-surface-600">{receipt.notes}</span>
                  )}
                </div>
                <div className="space-y-1">
                  {receipt.items?.map((ri) => {
                    const orderItem = order.items?.find((i) => i.id === ri.purchaseOrderItemId);
                    return (
                      <div key={ri.id} className="flex items-center gap-3 text-xs text-surface-600">
                        <span className="font-medium">{orderItem?.productName}</span>
                        <span>Qty: {ri.receivedQty}</span>
                        <span>Lote: {ri.lotNumber}</span>
                        <Badge
                          variant={ri.condition === 'GOOD' ? 'success' : ri.condition === 'DAMAGED' ? 'warning' : 'danger'}
                          size="sm"
                        >
                          {CONDITION_LABELS[ri.condition] || ri.condition}
                        </Badge>
                        {ri.expirationDate && (
                          <span>Vence: {new Date(ri.expirationDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* Action Buttons */}
      {actions.length > 0 && (
        <div className="flex gap-3 justify-end">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant === 'danger' ? 'ghost' : 'primary'}
              onClick={() => {
                if (action.action === 'receive') {
                  setReceiveModalOpen(true);
                } else if (action.status) {
                  handleStatusChange(action.status);
                }
              }}
              disabled={updateStatusMutation.isPending || (action.action === 'receive' && !hasReceivableItems)}
              className={action.variant === 'danger' ? 'text-[#cc6060] hover:text-[#cc6060]' : ''}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Receive Modal */}
      {canReceive && order.items && (
        <ReceiveOrderModal
          isOpen={receiveModalOpen}
          onClose={() => setReceiveModalOpen(false)}
          orderId={order.id}
          version={order.version}
          items={order.items}
        />
      )}

      {/* Cancel Confirmation Modal */}
      <Modal isOpen={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancelar orden" size="sm">
        <p className="text-sm text-[var(--muted)] py-2">
          ¿Estas seguro de cancelar esta orden de compra?
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConfirmCancel(false)}>Volver</Button>
          <Button variant="danger" onClick={() => executeStatusChange('CANCELLED')}>Si, cancelar</Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
