export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  createdAt: Date;
  createdBy?: string;
  version: number;
}

export type InventoryMovementType = InventoryMovement['type'];

