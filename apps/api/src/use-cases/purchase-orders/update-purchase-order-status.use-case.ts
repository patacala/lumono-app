import { Injectable, Inject } from '@nestjs/common';
import { IPurchaseOrderRepository } from '@/domain/ports/repositories/purchase-order.repository';
import { PurchaseOrder, PurchaseOrderStatus } from '@/domain/entities/purchase-order.entity';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

const VALID_TRANSITIONS: Record<PurchaseOrderStatus, PurchaseOrderStatus[]> = {
  DRAFT: ['PENDING', 'CANCELLED'],
  PENDING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['CANCELLED'],
  PARTIALLY_RECEIVED: ['CANCELLED'],
  RECEIVED: [],
  CANCELLED: [],
};

@Injectable()
export class UpdatePurchaseOrderStatusUseCase {
  constructor(
    @Inject('IPurchaseOrderRepository') private readonly purchaseOrderRepository: IPurchaseOrderRepository,
  ) {}

  async execute(
    id: string,
    newStatus: PurchaseOrderStatus,
    updatedBy: string,
    version: number,
  ): Promise<PurchaseOrder> {
    const order = await this.purchaseOrderRepository.findById(id);
    if (!order) throw new NotFoundError('PurchaseOrder', id);

    const allowed = VALID_TRANSITIONS[order.status];
    if (!allowed.includes(newStatus)) {
      throw new ValidationError(
        `Cannot transition from ${order.status} to ${newStatus}`,
      );
    }

    return this.purchaseOrderRepository.updateStatus(id, newStatus, updatedBy, version);
  }
}
