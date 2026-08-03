import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IInventoryMovementRepository,
  CreateInventoryMovementDto,
  StockByLocation,
  PaginatedResult,
  FindAllPaginatedParams,
} from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement } from '@/domain/entities/inventory-movement.entity';

const MOVEMENT_DISPLAY_INCLUDE = {
  product: { select: { name: true, sku: true } },
  originLocation: { select: { name: true } },
  destLocation: { select: { name: true } },
  userCreatedBy: { select: { name: true } },
} as const;

@Injectable()
export class InventoryMovementRepositoryImpl implements IInventoryMovementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateInventoryMovementDto): Promise<InventoryMovement> {
    const movement = await this.prisma.inventoryMovement.create({
      data,
    });
    return this.mapToEntity(movement);
  }

  async findById(id: string): Promise<InventoryMovement | null> {
    const movement = await this.prisma.inventoryMovement.findUnique({
      where: { id },
      include: MOVEMENT_DISPLAY_INCLUDE,
    });
    return movement ? this.mapToEntity(movement) : null;
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

  async findAllPaginated(params: FindAllPaginatedParams): Promise<PaginatedResult<InventoryMovement>> {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.type) where.type = params.type;
    if (params.productId) where.productId = params.productId;
    if (params.locationId) {
      where.OR = [
        { originLocationId: params.locationId },
        { destLocationId: params.locationId },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: MOVEMENT_DISPLAY_INCLUDE,
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      data: data.map(this.mapToEntity),
      total,
      page,
      limit,
    };
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
    // IN and ADJUSTMENT with positive subTypes add stock
    const incomingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        OR: [
          { type: 'IN' },
          { type: 'ADJUSTMENT', subType: { in: ['POSITIVE_ADJUSTMENT'] } },
          // Legacy adjustments without subType are treated as positive
          { type: 'ADJUSTMENT', subType: null },
        ],
      },
      _sum: { quantity: true },
    });

    // OUT and negative ADJUSTMENT subtract stock
    const outgoingMovements = await this.prisma.inventoryMovement.aggregate({
      where: {
        productId,
        OR: [
          { type: 'OUT' },
          { type: 'ADJUSTMENT', subType: { in: ['NEGATIVE_ADJUSTMENT'] } },
        ],
      },
      _sum: { quantity: true },
    });

    // TRANSFER is net-zero for total stock (moves between locations)
    // so we don't need to count it for total product stock

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

  async countByTypeToday(): Promise<Record<string, number>> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const movements = await this.prisma.inventoryMovement.groupBy({
      by: ['type'],
      where: {
        createdAt: { gte: startOfDay },
      },
      _count: { id: true },
    });

    const result: Record<string, number> = {
      IN: 0,
      OUT: 0,
      TRANSFER: 0,
      ADJUSTMENT: 0,
    };

    for (const m of movements) {
      result[m.type] = m._count.id;
    }

    return result;
  }

  private mapToEntity(movement: any): InventoryMovement {
    const { product, originLocation, destLocation, userCreatedBy, ...rest } = movement;
    return {
      ...rest,
      unitPrice: movement.unitPrice ? parseFloat(movement.unitPrice.toString()) : undefined,
      productName: product?.name,
      productSku: product?.sku,
      originLocationName: originLocation?.name,
      destLocationName: destLocation?.name,
      createdByName: userCreatedBy?.name,
    };
  }
}
