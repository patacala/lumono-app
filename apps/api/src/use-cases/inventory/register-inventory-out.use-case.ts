import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement, MovementSubType } from '@/domain/entities/inventory-movement.entity';
import { NotFoundError, ValidationError, InsufficientStockError } from '@/domain/errors/domain.error';

export interface RegisterInventoryOutDto {
  productId: string;
  originLocationId: string;
  quantity: number;
  subType?: MovementSubType;
  referenceDocument?: string;
  notes?: string;
  createdBy?: string;
}

@Injectable()
export class RegisterInventoryOutUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  async execute(dto: RegisterInventoryOutDto): Promise<InventoryMovement> {
    if (dto.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundError('Product', dto.productId);
    }

    const location = await this.locationRepository.findById(dto.originLocationId);
    if (!location) {
      throw new NotFoundError('Location', dto.originLocationId);
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
        type: 'OUT',
        subType: dto.subType,
        quantity: dto.quantity,
        originLocationId: dto.originLocationId,
        referenceDocument: dto.referenceDocument,
        notes: dto.notes,
        createdBy: dto.createdBy,
      });
    });
  }
}

