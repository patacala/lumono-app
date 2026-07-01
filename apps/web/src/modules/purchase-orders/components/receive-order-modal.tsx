'use client';

import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/ui/modal';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { Button } from '@/shared/components/ui/button';
import {
  PurchaseOrderItem,
  LotCondition,
  useReceivePurchaseOrder,
} from '../hooks/use-purchase-orders';

interface ReceiveRow {
  purchaseOrderItemId: string;
  productName: string;
  productSku: string;
  ordered: number;
  alreadyReceived: number;
  receivedQty: number;
  lotNumber: string;
  condition: LotCondition;
  expirationDate: string;
  manufacturingDate: string;
  notes: string;
}

interface ReceiveOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  version: number;
  items: PurchaseOrderItem[];
}

const CONDITION_OPTIONS = [
  { value: 'GOOD', label: 'Bueno' },
  { value: 'DAMAGED', label: 'Danado' },
  { value: 'EXPIRED', label: 'Vencido' },
];

export function ReceiveOrderModal({ isOpen, onClose, orderId, version, items }: ReceiveOrderModalProps) {
  const receivableItems = items.filter((i) => i.receivedQty < i.quantity);

  const [rows, setRows] = useState<ReceiveRow[]>(() =>
    receivableItems.map((item) => ({
      purchaseOrderItemId: item.id,
      productName: item.productName || '',
      productSku: item.productSku || '',
      ordered: item.quantity,
      alreadyReceived: item.receivedQty,
      receivedQty: item.quantity - item.receivedQty,
      lotNumber: '',
      condition: 'GOOD' as LotCondition,
      expirationDate: '',
      manufacturingDate: '',
      notes: '',
    })),
  );
  const [receiptNotes, setReceiptNotes] = useState('');

  const receiveMutation = useReceivePurchaseOrder();

  function updateRow(index: number, field: keyof ReceiveRow, value: any) {
    const updated = [...rows];
    (updated[index] as any)[field] = value;
    setRows(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validRows = rows.filter((r) => r.receivedQty > 0 && r.lotNumber.trim());
    if (validRows.length === 0) return;

    await receiveMutation.mutateAsync({
      id: orderId,
      data: {
        version,
        notes: receiptNotes || undefined,
        items: validRows.map((r) => ({
          purchaseOrderItemId: r.purchaseOrderItemId,
          receivedQty: r.receivedQty,
          lotNumber: r.lotNumber,
          condition: r.condition,
          expirationDate: r.expirationDate || undefined,
          manufacturingDate: r.manufacturingDate || undefined,
          notes: r.notes || undefined,
        })),
      },
    });

    onClose();
  }

  if (receivableItems.length === 0) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibir Orden de Compra" size="xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {rows.map((row, index) => (
            <div key={row.purchaseOrderItemId} className="border rounded-lg p-3 space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-semibold text-gray-900">{row.productName}</span>
                  <span className="text-xs text-gray-500 ml-2 font-mono">{row.productSku}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Ordenado: {row.ordered} | Recibido: {row.alreadyReceived} | Pendiente: {row.ordered - row.alreadyReceived}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Input
                  label="Cant. a recibir"
                  type="number"
                  min="0"
                  max={row.ordered - row.alreadyReceived}
                  value={row.receivedQty}
                  onChange={(e) => updateRow(index, 'receivedQty', parseInt(e.target.value) || 0)}
                  required
                />
                <Input
                  label="Nro. Lote"
                  value={row.lotNumber}
                  onChange={(e) => updateRow(index, 'lotNumber', e.target.value)}
                  required
                  placeholder="Ej: LOT-2026-001"
                />
                <Select
                  label="Condicion"
                  options={CONDITION_OPTIONS}
                  value={row.condition}
                  onChange={(e) => updateRow(index, 'condition', e.target.value)}
                />
                <Input
                  label="Fecha vencimiento"
                  type="date"
                  value={row.expirationDate}
                  onChange={(e) => updateRow(index, 'expirationDate', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Input
                  label="Fecha fabricacion"
                  type="date"
                  value={row.manufacturingDate}
                  onChange={(e) => updateRow(index, 'manufacturingDate', e.target.value)}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Notas"
                    value={row.notes}
                    onChange={(e) => updateRow(index, 'notes', e.target.value)}
                    placeholder="Observaciones del item..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Input
          label="Notas de recepcion"
          value={receiptNotes}
          onChange={(e) => setReceiptNotes(e.target.value)}
          placeholder="Notas generales de la recepcion..."
        />

        <ModalFooter>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={receiveMutation.isPending}>
            {receiveMutation.isPending ? 'Registrando...' : 'Registrar Recepcion'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
