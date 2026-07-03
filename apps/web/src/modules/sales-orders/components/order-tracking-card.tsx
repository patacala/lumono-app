'use client';

import { useState } from 'react';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal';
import type { SalesOrder, SalesOrderStatus } from '../hooks/use-sales-orders';
import { Package, Clock } from 'lucide-react';

export const STATUS_LABELS: Record<SalesOrderStatus, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'Preparando',
  SHIPPED: 'Despachada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
};

export const STATUS_VARIANTS: Record<SalesOrderStatus, 'attention' | 'accent' | 'neutral' | 'ok' | 'critical'> = {
  PENDING: 'attention',
  PREPARING: 'accent',
  SHIPPED: 'neutral',
  DELIVERED: 'ok',
  CANCELLED: 'critical',
};

const NEXT_STATUS: Partial<Record<SalesOrderStatus, { status: SalesOrderStatus; label: string }>> = {
  PENDING: { status: 'PREPARING', label: 'Preparar' },
  PREPARING: { status: 'SHIPPED', label: 'Despachar' },
  SHIPPED: { status: 'DELIVERED', label: 'Entregada' },
};

interface OrderTrackingCardProps {
  order: SalesOrder;
  isSelected?: boolean;
  onSelect: (order: SalesOrder) => void;
  onStatusChange: (id: string, status: SalesOrderStatus, version: number) => void;
  isUpdating?: boolean;
}

function getTimeInStatus(order: SalesOrder): { text: string; urgent: boolean } {
  const now = new Date();
  const since = new Date(order.createdAt);
  const diffMinutes = Math.floor((now.getTime() - since.getTime()) / 60000);
  const diffHours = diffMinutes / 60;

  let text: string;
  if (diffMinutes < 60) {
    text = `${diffMinutes}m`;
  } else if (diffHours < 24) {
    const h = Math.floor(diffHours);
    const m = diffMinutes % 60;
    text = m > 0 ? `${h}h ${m}m` : `${h}h`;
  } else {
    text = `${Math.floor(diffHours / 24)}d`;
  }

  return { text, urgent: diffHours >= 1 };
}

export function OrderTrackingCard({
  order,
  isSelected,
  onSelect,
  onStatusChange,
  isUpdating,
}: OrderTrackingCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const timeInfo = getTimeInStatus(order);
  const nextAction = NEXT_STATUS[order.status];
  const itemCount = order.items?.length ?? 0;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(order)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(order);
          }
        }}
        className={`
          block w-full max-w-none text-left border rounded-xl p-4 md:p-3.5 transition-all duration-200 cursor-pointer
          ${isSelected
            ? 'border-[var(--accent)] bg-[var(--accent-dim)] ring-1 ring-[oklch(68%_0.19_55_/_0.25)]'
            : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)] hover:bg-[var(--surface-2)]'
          }
        `}
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono font-semibold text-sm text-[var(--fg)]">
            {order.orderNumber}
          </span>
          <span
            className={`text-[10px] flex items-center gap-1 tabular-nums ${
              timeInfo.urgent ? 'text-[var(--accent)]' : 'text-[var(--muted)]'
            }`}
          >
            <Clock className="w-3 h-3" />
            {timeInfo.text}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-sm text-[var(--fg)] truncate">
            {order.customerName || 'Sin cliente'}
          </span>
          <Badge variant={STATUS_VARIANTS[order.status]} size="sm">
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <span className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5" />
              {itemCount}
            </span>
            <span className="font-semibold text-[var(--fg)] tabular-nums">
              ${(order.totalAmount ?? 0).toFixed(2)}
            </span>
          </div>

          {nextAction && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-[var(--accent)] text-[oklch(12%_0.02_55)] hover:opacity-90 transition-opacity"
            >
              {nextAction.label}
            </button>
          )}
        </div>
      </div>

      {nextAction && (
        <Modal
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirmar cambio de estado"
          size="sm"
        >
          <p className="text-sm text-[var(--muted)] mb-6">
            Cambiar orden <strong className="text-[var(--fg)]">{order.orderNumber}</strong> a{' '}
            <strong className="text-[var(--fg)]">{STATUS_LABELS[nextAction.status]}</strong>?
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              isLoading={isUpdating}
              onClick={() => {
                onStatusChange(order.id, nextAction.status, order.version);
                setConfirmOpen(false);
              }}
            >
              {nextAction.label}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
