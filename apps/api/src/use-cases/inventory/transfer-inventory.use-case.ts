import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement } from '@/domain/entities/inventory-movement.entity';
import { NotFoundError, ValidationError, InsufficientStockError } from '@/domain/errors/domain.error';

export interface TransferInventoryDto {
  productId: string;
  originLocationId: string;
  destLocationId: string;
  quantity: number;
  referenceDocument?: string;
  notes?: string;
  createdBy?: string;
}

@Injectable()
export class TransferInventoryUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  async execute(dto: TransferInventoryDto): Promise<InventoryMovement> {
    if (dto.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    if (dto.originLocationId === dto.destLocationId) {
      throw new ValidationError('Origin and destination locations must be different');
    }

    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundError('Product', dto.productId);
    }

    const originLocation = await this.locationRepository.findById(dto.originLocationId);
    if (!originLocation) {
      throw new NotFoundError('Origin Location', dto.originLocationId);
    }

    const destLocation = await this.locationRepository.findById(dto.destLocationId);
    if (!destLocation) {
      throw new NotFoundError('Destination Location', dto.destLocationId);
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async () => {
      const currentStock = await this.inventoryMovementRepository.getStockByProductAndLocation(
        dto.productId,
        dto.originLocationId,
      );

      if (currentStock < dto.quantity) {
        throw new InsufficientStockError(dto.productId, currentStock, dto.quantity);
      }

      return this.inventoryMovementRepository.create({
        productId: dto.productId,
        type: 'TRANSFER',
        quantity: dto.quantity,
        originLocationId: dto.originLocationId,
        destLocationId: dto.destLocationId,
        referenceDocument: dto.referenceDocument,
        notes: dto.notes,
        createdBy: dto.createdBy,
      });
    });
  }
}

