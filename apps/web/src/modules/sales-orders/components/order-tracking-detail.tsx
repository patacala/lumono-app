'use client';

import { useState, type ReactNode } from 'react';
import {
  useSalesOrder,
  useUpdateSalesOrderStatus,
  type SalesOrderStatus,
} from '../hooks/use-sales-orders';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { MapPin, User, Package, FileText, Clock, DollarSign, type LucideIcon } from 'lucide-react';
import { STATUS_LABELS, STATUS_VARIANTS } from './order-tracking-card';

const STATUS_FLOW: SalesOrderStatus[] = ['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED'];

const STATUS_ACTIONS: Record<SalesOrderStatus, { label: string; status: SalesOrderStatus; variant?: 'danger' }[]> = {
  PENDING: [
    { label: 'Preparar', status: 'PREPARING' },
    { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
  ],
  PREPARING: [
    { label: 'Despachar', status: 'SHIPPED' },
    { label: 'Cancelar', status: 'CANCELLED', variant: 'danger' },
  ],
  SHIPPED: [{ label: 'Marcar entregada', status: 'DELIVERED' }],
  DELIVERED: [],
  CANCELLED: [],
};

const CONFIRM_MESSAGES: Partial<Record<SalesOrderStatus, string>> = {
  PREPARING: 'Al preparar esta orden, se reservara el stock para los items.',
  SHIPPED: 'Al despachar, se crearan los movimientos de salida de inventario.',
  CANCELLED: 'Si hay stock reservado, sera liberado.',
};

function DetailInfoCell({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[16px_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 min-w-0">
      <Icon className="w-4 h-4 text-[var(--muted)] row-span-2 self-center" />
      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider col-start-2">{label}</p>
      <div className="col-start-2 min-w-0">{children}</div>
    </div>
  );
}

interface OrderTrackingDetailProps {
  orderId: string | null;
  onStatusUpdated?: () => void;
}

export function OrderTrackingDetail({ orderId, onStatusUpdated }: OrderTrackingDetailProps) {
  const { data: order, isLoading } = useSalesOrder(orderId || '');
  const updateStatus = useUpdateSalesOrderStatus();
  const [confirmAction, setConfirmAction] = useState<{ status: SalesOrderStatus; message: string } | null>(null);

  if (!orderId) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[320px] border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface)]/50 text-center px-6">
        <Package className="w-10 h-10 text-[var(--muted)] mb-3 opacity-40" />
        <p className="text-sm font-medium text-[var(--fg-secondary)]">Selecciona una orden</p>
        <p className="text-xs text-[var(--muted)] mt-1 max-w-xs">
          Haz click en una orden de la lista para ver sus productos y gestionar el estado
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[320px] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
        <p className="text-sm text-[var(--muted)]">Cargando detalle...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-full min-h-[320px] border border-[var(--border)] rounded-xl bg-[var(--surface)]">
        <p className="text-sm text-[var(--muted)]">Orden no encontrada</p>
      </div>
    );
  }

  const currentOrder = order;
  const actions = STATUS_ACTIONS[currentOrder.status];
  const currentStepIndex = STATUS_FLOW.indexOf(currentOrder.status);

  function executeStatusChange(newStatus: SalesOrderStatus) {
    setConfirmAction(null);
    updateStatus.mutate(
      { id: currentOrder.id, status: newStatus, version: currentOrder.version },
      { onSuccess: () => onStatusUpdated?.() },
    );
  }

  function handleAction(newStatus: SalesOrderStatus) {
    const message = CONFIRM_MESSAGES[newStatus];
    if (message) {
      setConfirmAction({ status: newStatus, message });
    } else {
      executeStatusChange(newStatus);
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border)] shrink-0">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="font-mono text-lg font-bold text-[var(--fg)]">{currentOrder.orderNumber}</p>
            <p className="text-xs text-[var(--muted)] mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(currentOrder.createdAt).toLocaleString('es', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <Badge variant={STATUS_VARIANTS[currentOrder.status]} size="sm">
            {STATUS_LABELS[currentOrder.status]}
          </Badge>
        </div>

        {/* Status pipeline */}
        {currentOrder.status !== 'CANCELLED' && (
          <div className="flex items-center gap-1">
            {STATUS_FLOW.map((step, index) => {
              const isDone = currentStepIndex > index;
              const isCurrent = currentOrder.status === step;
              return (
                <div key={step} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1 min-w-0">
                    <div
                      className={`w-full h-1 rounded-full mb-1.5 ${
                        isDone || isCurrent ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                      }`}
                    />
                    <span
                      className={`text-[9px] uppercase tracking-wide truncate w-full text-center ${
                        isCurrent ? 'text-[var(--accent)] font-semibold' : 'text-[var(--muted)]'
                      }`}
                    >
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {index < STATUS_FLOW.length - 1 && (
                    <div className="w-1 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 py-4 border-b border-[var(--border)] grid grid-cols-2 gap-x-4 gap-y-4 shrink-0">
        <DetailInfoCell icon={User} label="Cliente">
          <p className="text-sm font-medium text-[var(--fg)] truncate">
            {currentOrder.customerName || '-'}
          </p>
        </DetailInfoCell>
        <DetailInfoCell icon={MapPin} label="Ubicacion">
          <p className="text-sm font-medium text-[var(--fg)] truncate">
            {currentOrder.locationName || '-'}
          </p>
        </DetailInfoCell>
        <DetailInfoCell icon={DollarSign} label="Total">
          <p className="text-lg font-bold text-[var(--fg)] tabular-nums">
            ${(currentOrder.totalAmount ?? 0).toFixed(2)}
          </p>
        </DetailInfoCell>
        <DetailInfoCell icon={Package} label="Productos">
          <p className="text-sm font-medium text-[var(--fg)] tabular-nums">
            {currentOrder.items?.length ?? 0}{' '}
            {currentOrder.items?.length === 1 ? 'item' : 'items'}
          </p>
        </DetailInfoCell>
        {currentOrder.notes && (
          <div className="col-span-2">
            <DetailInfoCell icon={FileText} label="Notas">
              <p className="text-sm text-[var(--fg-secondary)]">{currentOrder.notes}</p>
            </DetailInfoCell>
          </div>
        )}
      </div>

      {/* Items table */}
      <div className="flex-1 min-h-0 overflow-auto px-5 pb-4">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col />
            <col className="w-[56px]" />
            <col className="w-[72px]" />
            <col className="w-[88px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="py-2.5 pr-3 text-left text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                Producto
              </th>
              <th className="py-2.5 px-2 text-right text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                Cant.
              </th>
              <th className="py-2.5 px-2 text-right text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                Reserv.
              </th>
              <th className="py-2.5 pl-2 text-right text-[10px] font-semibold text-[var(--muted)] uppercase tracking-wider">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody>
            {currentOrder.items?.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)] last:border-b-0">
                <td className="py-3 pr-3 align-top">
                  <p className="font-medium text-[var(--fg)] text-sm truncate">{item.productName}</p>
                  <p className="text-[10px] font-mono text-[var(--muted)] truncate">{item.productSku}</p>
                </td>
                <td className="py-3 px-2 text-right align-top tabular-nums text-sm text-[var(--fg-secondary)]">
                  {item.quantity}
                </td>
                <td className="py-3 px-2 text-right align-top tabular-nums text-sm">
                  {item.reservedQty > 0 ? (
                    <Badge variant="accent" size="sm">{item.reservedQty}</Badge>
                  ) : (
                    <span className="text-[var(--muted)]">-</span>
                  )}
                </td>
                <td className="py-3 pl-2 text-right align-top font-semibold tabular-nums text-sm text-[var(--fg)]">
                  ${(item.quantity * item.unitPrice).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="px-5 py-4 border-t border-[var(--border)] flex flex-wrap gap-2 shrink-0">
          {actions.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant === 'danger' ? 'ghost' : 'primary'}
              disabled={updateStatus.isPending}
              onClick={() => handleAction(action.status)}
              className={
                action.variant === 'danger'
                  ? 'text-[var(--muted)] hover:text-[var(--fg)] hover:bg-[var(--status-critical)]'
                  : ''
              }
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
          {confirmAction?.message}{' '}
          <span className="text-[var(--fg)]">¿Deseas continuar?</span>
        </p>
        <ModalFooter>
          <Button variant="ghost" onClick={() => setConfirmAction(null)}>
            Volver
          </Button>
          <Button
            variant={confirmAction?.status === 'CANCELLED' ? 'danger' : 'primary'}
            isLoading={updateStatus.isPending}
            onClick={() => confirmAction && executeStatusChange(confirmAction.status)}
          >
            {confirmAction?.status === 'CANCELLED' ? 'Si, cancelar' : 'Confirmar'}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
