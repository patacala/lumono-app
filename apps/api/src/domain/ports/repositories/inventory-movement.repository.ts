import { InventoryMovement, InventoryMovementType } from '../../entities/inventory-movement.entity';

export interface CreateInventoryMovementDto {
  productId: string;
  type: InventoryMovementType;
  quantity: number;
  originLocationId?: string;
  destLocationId?: string;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  createdBy?: string;
}

export interface StockByLocation {
  productId: string;
  locationId: string;
  quantity: number;
}

export interface IInventoryMovementRepository {
  create(data: CreateInventoryMovementDto): Promise<InventoryMovement>;
  findByProductId(productId: string): Promise<InventoryMovement[]>;
  findByLocationId(locationId: string): Promise<InventoryMovement[]>;
  getStockByProductAndLocation(productId: string, locationId: string): Promise<number>;
  getStockByProduct(productId: string): Promise<number>;
  getAllStockByLocation(locationId: string): Promise<StockByLocation[]>;
  findAll(): Promise<InventoryMovement[]>;
}

