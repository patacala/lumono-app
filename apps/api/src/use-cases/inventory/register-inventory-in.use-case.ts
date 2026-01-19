import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement } from '@/domain/entities/inventory-movement.entity';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

export interface RegisterInventoryInDto {
  productId: string;
  destLocationId: string;
  quantity: number;
  referenceDocument?: string;
  notes?: string;
  unitPrice?: number;
  createdBy?: string;
}

@Injectable()
export class RegisterInventoryInUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  async execute(dto: RegisterInventoryInDto): Promise<InventoryMovement> {
    if (dto.quantity <= 0) {
      throw new ValidationError('Quantity must be positive');
    }

    const product = await this.productRepository.findById(dto.productId);
    if (!product) {
      throw new NotFoundError('Product', dto.productId);
    }

    const location = await this.locationRepository.findById(dto.destLocationId);
    if (!location) {
      throw new NotFoundError('Location', dto.destLocationId);
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async () => {
      return this.inventoryMovementRepository.create({
        productId: dto.productId,
        type: 'IN',
        quantity: dto.quantity,
        destLocationId: dto.destLocationId,
        referenceDocument: dto.referenceDocument,
        notes: dto.notes,
        unitPrice: dto.unitPrice,
        createdBy: dto.createdBy,
      });
    });
  }
}

