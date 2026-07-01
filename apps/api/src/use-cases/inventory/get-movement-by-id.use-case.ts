import { Injectable, Inject } from '@nestjs/common';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { InventoryMovement } from '@/domain/entities/inventory-movement.entity';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class GetMovementByIdUseCase {
  constructor(
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {}

  async execute(id: string): Promise<InventoryMovement> {
    const movement = await this.inventoryMovementRepository.findById(id);
    if (!movement) {
      throw new NotFoundError('InventoryMovement', id);
    }
    return movement;
  }
}
