import { Injectable, Inject } from '@nestjs/common';
import { IInventoryMovementRepository, StockByLocation } from '@/domain/ports/repositories/inventory-movement.repository';

export interface StockInfo {
  productId: string;
  locationId?: string;
  quantity: number;
}

@Injectable()
export class GetStockUseCase {
  constructor(
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository
  ) {}

  async getByProductAndLocation(productId: string, locationId: string): Promise<StockInfo> {
    const quantity = await this.inventoryMovementRepository.getStockByProductAndLocation(
      productId,
      locationId,
    );

    return {
      productId,
      locationId,
      quantity,
    };
  }

  async getByProduct(productId: string): Promise<StockInfo> {
    const quantity = await this.inventoryMovementRepository.getStockByProduct(productId);

    return {
      productId,
      quantity,
    };
  }

  async getByLocation(locationId: string): Promise<StockByLocation[]> {
    return this.inventoryMovementRepository.getAllStockByLocation(locationId);
  }
}

