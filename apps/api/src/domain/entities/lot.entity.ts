import { BaseEntity } from './base.entity';

export type LotCondition = 'GOOD' | 'DAMAGED' | 'EXPIRED';

export interface Lot extends BaseEntity {
  lotNumber: string;
  productId: string;
  productName?: string;
  productSku?: string;
  locationId: string;
  locationName?: string;
  quantity: number;
  condition: LotCondition;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
}
