import { InventoryMovement, InventoryMovementType, MovementSubType, AdjustmentReason } from '../../entities/inventory-movement.entity';

export interface CreateInventoryMovementDto {
  productId: string;
  type: InventoryMovementType;
  subType?: MovementSubType;
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  reason?: AdjustmentReason;
  lotId?: string;
  createdBy?: string;
}

export interface StockByLocation {
  productId: string;
  locationId: string;
  quantity: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface FindAllPaginatedParams {
  page?: number;
  limit?: number;
  type?: InventoryMovementType;
  locationId?: string;
  productId?: string;
  search?: string;
}

export interface IInventoryMovementRepository {
  create(data: CreateInventoryMovementDto): Promise<InventoryMovement>;
  findById(id: string): Promise<InventoryMovement | null>;
  findByProductId(productId: string): Promise<InventoryMovement[]>;
  findByLocationId(locationId: string): Promise<InventoryMovement[]>;
  findAllPaginated(params: FindAllPaginatedParams): Promise<PaginatedResult<InventoryMovement>>;
  getStockByProductAndLocation(productId: string, locationId: string): Promise<number>;
  getStockByProduct(productId: string): Promise<number>;
  getAllStockByLocation(locationId: string): Promise<StockByLocation[]>;
  findAll(): Promise<InventoryMovement[]>;
  countByTypeToday(): Promise<Record<string, number>>;
}
