export type MovementSubType =
  | 'PURCHASE'
  | 'POSITIVE_ADJUSTMENT'
  | 'PRODUCTION'
  | 'RETURN'
  | 'SALE'
  | 'NEGATIVE_ADJUSTMENT'
  | 'DAMAGE'
  | 'INTERNAL_CONSUMPTION';

export type AdjustmentReason =
  | 'PHYSICAL_COUNT'
  | 'CORRECTION'
  | 'EXPIRATION'
  | 'INITIAL_LOAD'
  | 'THEFT'
  | 'ADMINISTRATIVE_ERROR'
  | 'OTHER';

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  subType?: MovementSubType;
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  reason?: AdjustmentReason;
  lotId?: string;
  createdAt: Date;
  createdBy?: string;
  version: number;

  // Optional denormalized display fields (populated when relations are included)
  productName?: string;
  productSku?: string;
  originLocationName?: string;
  destLocationName?: string;
  createdByName?: string;
}

export type InventoryMovementType = InventoryMovement['type'];
