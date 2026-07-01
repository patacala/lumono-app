import { Injectable, Inject } from '@nestjs/common';
import { IPurchaseOrderRepository, CreatePurchaseOrderDto } from '@/domain/ports/repositories/purchase-order.repository';
import { ISupplierRepository } from '@/domain/ports/repositories/supplier.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { PurchaseOrder } from '@/domain/entities/purchase-order.entity';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

@Injectable()
export class CreatePurchaseOrderUseCase {
  constructor(
    @Inject('IPurchaseOrderRepository') private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    @Inject('ISupplierRepository') private readonly supplierRepository: ISupplierRepository,
    @Inject('ILocationRepository') private readonly locationRepository: ILocationRepository,
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreatePurchaseOrderDto): Promise<PurchaseOrder> {
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationError('Purchase order must have at least one item');
    }

    const supplier = await this.supplierRepository.findById(dto.supplierId);
    if (!supplier) throw new NotFoundError('Supplier', dto.supplierId);

    const location = await this.locationRepository.findById(dto.locationId);
    if (!location) throw new NotFoundError('Location', dto.locationId);

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new NotFoundError('Product', item.productId);
    }

    const orderNumber = await this.purchaseOrderRepository.getNextOrderNumber();
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return this.purchaseOrderRepository.create({
      ...dto,
      orderNumber,
      totalAmount,
    });
  }
}
