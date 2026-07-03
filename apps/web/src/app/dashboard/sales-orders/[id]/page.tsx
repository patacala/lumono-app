'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSalesOrder, useUpdateSalesOrderStatus, SalesOrderStatus } from '@/modules/sales-orders/hooks/use-sales-orders';
import { Card, CardHeader, CardBody } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/shared/components/ui/table';
import { toast } from 'sonner';

const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  SHIPPED: 'Despachada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

const STATUS_VARIANTS: Record<SalesOrderStatus, 'neutral' | 'attention' | 'accent' | 'ok' | 'critical'> = {
  PENDING: 'attention',
  PREPARING: 'accent',
  SHIPPED: 'neutral',
  DELIVERED: 'ok',
  CANCELLED: 'critical',
};

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: order, isLoading } = useSalesOrder(id);
  const updateStatusMutation = useUpdateSalesOrderStatus();
  const [confirmAction, setConfirmAction] = useState<{ status: SalesOrderStatus; message: string } | null>(null);

  const confirmMessages: Partial<Record<SalesOrderStatus, string>> = {
    PREPARING: 'Al preparar esta orden, se reservara el stock para los items.',
    SHIPPED: 'Al despachar esta orden, se crearan automaticamente los movimientos de salida de inventario.',
    CANCELLED: 'Si hay stock reservado, sera liberado.',
  };

  function handleStatusChange(newStatus: SalesOrderStatus) {
    if (!order) return;
    const message = confirmMessages[newStatus];
    if (message) {
      setConfirmAction({ status: newStatus, message });
    } else {
      executeStatusChange(newStatus);
    }
  }

  function executeStatusChange(newStatus: SalesOrderStatus) {
    if (!order) return;
    setConfirmAction(null);
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
        <div className="text-[var(--muted)]">Cargando orden...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--muted)]">Orden no encontrada</div>
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
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--surface-2)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--fg)]">{order.orderNumber}</h1>
          <p className="text-sm text-[var(--muted)]">Orden de Venta</p>
        </div>
        <Badge variant={STATUS_VARIANTS[order.status]} size="lg">
          {STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <Card>
        <CardBody>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Cliente</p>
              <p className="text-sm font-medium text-[var(--fg)]">{order.customerName}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Ubicacion origen</p>
              <p className="text-sm font-medium text-[var(--fg)]">{order.locationName}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Total</p>
              <p className="text-sm font-bold text-[var(--fg)] tabular-nums">${order.totalAmount?.toFixed(2) || '0.00'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Fecha creacion</p>
              <p className="text-sm font-medium text-[var(--fg)]">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            {order.shippedDate && (
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Fecha despacho</p>
                <p className="text-sm font-medium text-[var(--fg)]">{new Date(order.shippedDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.deliveredDate && (
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Fecha entrega</p>
                <p className="text-sm font-medium text-[var(--fg)]">{new Date(order.deliveredDate).toLocaleDateString()}</p>
              </div>
            )}
            {order.notes && (
              <div className="col-span-2">
                <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Notas</p>
                <p className="text-sm text-[var(--fg-secondary)]">{order.notes}</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--fg)]">Items</h2>
        </CardHeader>
        <CardBody className="p-0 sm:p-4">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Producto</TableHeader>
                <TableHeader>SKU</TableHeader>
                <TableHeader>Unidad</TableHeader>
                <TableHeader className="text-right">Cantidad</TableHeader>
                <TableHeader className="text-right">Reservado</TableHeader>
                <TableHeader className="text-right">Precio Unit.</TableHeader>
                <TableHeader className="text-right">Subtotal</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-[var(--fg)]">{item.productName}</TableCell>
                  <TableCell className="font-mono">{item.productSku}</TableCell>
                  <TableCell>{item.productUnit || '-'}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {item.reservedQty > 0 ? (
                      <Badge variant="accent" size="sm">{item.reservedQty}</Badge>
                    ) : (
                      <span className="text-[var(--muted)]">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">${item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-semibold text-[var(--fg)] tabular-nums">
                    ${(item.quantity * item.unitPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {actions.length > 0 && (
        <div className="flex gap-3 justify-end">
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant === 'danger' ? 'ghost' : 'primary'}
              onClick={() => handleStatusChange(action.status)}
              disabled={updateStatusMutation.isPending}
              className={action.variant === 'danger' ? 'text-[oklch(68%_0.01_260)] hover:text-[oklch(68%_0.01_260)] hover:bg-[var(--status-critical)]' : ''}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        title={confirmAction?.status === 'CANCELLED' ? 'Cancelar orden' : 'Confirmar accion'}
        size="sm"
      >
        <p className="text-sm text-[var(--muted)] py-2">
          {confirmAction?.message} <span className="text-[var(--fg)]">¿Deseas continuar?</span>
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConfirmAction(null)}>
            Volver
          </Button>
          <Button
            variant={confirmAction?.status === 'CANCELLED' ? 'danger' : 'primary'}
            onClick={() => confirmAction && executeStatusChange(confirmAction.status)}
          >
            {confirmAction?.status === 'CANCELLED' ? 'Si, cancelar' : 'Confirmar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
