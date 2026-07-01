import { Lot, LotCondition } from '../../entities/lot.entity';

export interface CreateLotDto {
  lotNumber: string;
  productId: string;
  locationId: string;
  quantity: number;
  condition: LotCondition;
  expirationDate?: Date;
  manufacturingDate?: Date;
  notes?: string;
  createdBy?: string;
}

export interface LotFilters {
  productId?: string;
  locationId?: string;
  condition?: LotCondition;
}

export interface ILotRepository {
  findById(id: string): Promise<Lot | null>;
  findByLotNumberAndProduct(lotNumber: string, productId: string): Promise<Lot | null>;
  findByProductAndLocation(productId: string, locationId: string): Promise<Lot[]>;
  findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: LotFilters,
  ): Promise<{ data: Lot[]; total: number }>;
  create(data: CreateLotDto): Promise<Lot>;
  updateQuantity(id: string, quantityDelta: number, updatedBy?: string): Promise<Lot>;
  softDelete(id: string, deletedBy?: string): Promise<void>;
}
