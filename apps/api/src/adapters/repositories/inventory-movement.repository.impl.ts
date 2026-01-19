import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IInventoryMovementRepository,
  CreateInventoryMovementDto,
  StockByLocation,
} from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement } from '@/domain/entities/inventory-movement.entity';

@Injectable()
export class InventoryMovementRepositoryImpl implements IInventoryMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = await this.prisma.inventoryMovement.create({
      data,
    });
    return this.mapToEntity(movement);
  }

  async findByProductId(productId: string): Promise<InventoryMovement[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(this.mapToEntity);
  }

  async findByLocationId(locationId: string): Promise<InventoryMovement[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        OR: [
          { originLocationId: locationId },
          { destLocationId: locationId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(this.mapToEntity);
  }

  async getStockByProductAndLocation(productId: string, locationId: string): Promise<number> {
    const incomingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        destLocationId: locationId,
      },
      _sum: {
        quantity: true,
      },
    });

    const outgoingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        originLocationId: locationId,
      },
      _sum: {
        quantity: true,
      },
    });

    const incoming = incomingMovements._sum.quantity || 0;
    const outgoing = outgoingMovements._sum.quantity || 0;

    return incoming - outgoing;
  }

  async getStockByProduct(productId: string): Promise<number> {
    const incomingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        type: { in: ['IN', 'ADJUSTMENT'] },
      },
      _sum: {
        quantity: true,
      },
    });

    const outgoingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        type: 'OUT',
      },
      _sum: {
        quantity: true,
      },
    });

    const incoming = incomingMovements._sum.quantity || 0;
    const outgoing = outgoingMovements._sum.quantity || 0;

    return incoming - outgoing;
  }

  async getAllStockByLocation(locationId: string): Promise<StockByLocation[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      where: {
        OR: [
          { originLocationId: locationId },
          { destLocationId: locationId },
        ],
      },
      select: {
        productId: true,
        quantity: true,
        originLocationId: true,
        destLocationId: true,
      },
    });

    const stockMap = new Map<string, number>();

    for (const movement of movements) {
      const currentStock = stockMap.get(movement.productId) || 0;
      
      if (movement.destLocationId === locationId) {
        stockMap.set(movement.productId, currentStock + movement.quantity);
      }
      
      if (movement.originLocationId === locationId) {
        stockMap.set(movement.productId, currentStock - movement.quantity);
      }
    }

    return Array.from(stockMap.entries()).map(([productId, quantity]) => ({
      productId,
      locationId,
      quantity,
    }));
  }

  async findAll(): Promise<InventoryMovement[]> {
    const movements = await this.prisma.inventoryMovement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return movements.map(this.mapToEntity);
  }

  private mapToEntity(movement: any): InventoryMovement {
    return {
      ...movement,
      unitPrice: movement.unitPrice ? parseFloat(movement.unitPrice.toString()) : undefined,
    };
  }
}

