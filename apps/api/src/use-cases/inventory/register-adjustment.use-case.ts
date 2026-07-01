import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement, AdjustmentReason } from '@/domain/entities/inventory-movement.entity';
import { NotFoundError, ValidationError, InsufficientStockError } from '@/domain/errors/domain.error';

export interface RegisterAdjustmentDto {
  productId: string;
  locationId: string;
  quantity: number;
  subType: 'POSITIVE_ADJUSTMENT' | 'NEGATIVE_ADJUSTMENT';
  reason: AdjustmentReason;
  notes?: string;
  createdBy?: string;
}

@Injectable()
export class RegisterAdjustmentUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  async execute(dto: RegisterAdjustmentDto): Promise<InventoryMovement> {
    if (dto.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundError('Product', dto.productId);
    }

    const location = await this.locationRepository.findById(dto.locationId);
    if (!location) {
      throw new NotFoundError('Location', dto.locationId);
    }

    return this.prisma.$transaction(async () => {
      // For negative adjustments, validate stock
      if (dto.subType === 'NEGATIVE_ADJUSTMENT') {
        const currentStock = await this.inventoryMovementRepository.getStockByProductAndLocation(
          dto.productId,
          dto.locationId,
        );
        if (currentStock < dto.quantity) {
          throw new InsufficientStockError(dto.productId, currentStock, dto.quantity);
        }
      }

      const isPositive = dto.subType === 'POSITIVE_ADJUSTMENT';

      return this.inventoryMovementRepository.create({
        productId: dto.productId,
        type: 'ADJUSTMENT',
        subType: dto.subType,
        quantity: dto.quantity,
        originLocationId: isPositive ? undefined : dto.locationId,
        destLocationId: isPositive ? dto.locationId : undefined,
        reason: dto.reason,
        notes: dto.notes,
        createdBy: dto.createdBy,
      });
    });
  }
}
