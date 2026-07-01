import { Injectable, Inject } from '@nestjs/common';
import { ISalesOrderRepository, CreateSalesOrderDto } from '@/domain/ports/repositories/sales-order.repository';
import { ICustomerRepository } from '@/domain/ports/repositories/customer.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { SalesOrder } from '@/domain/entities/sales-order.entity';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

@Injectable()
export class CreateSalesOrderUseCase {
  constructor(
    @Inject('ISalesOrderRepository') private readonly salesOrderRepository: ISalesOrderRepository,
    @Inject('ICustomerRepository') private readonly customerRepository: ICustomerRepository,
    @Inject('ILocationRepository') private readonly locationRepository: ILocationRepository,
    @Inject('IProductRepository') private readonly productRepository: IProductRepository,
  ) {}

  async execute(dto: CreateSalesOrderDto): Promise<SalesOrder> {
    if (!dto.items || dto.items.length === 0) {
      throw new ValidationError('Sales order must have at least one item');
    }

    const customer = await this.customerRepository.findById(dto.customerId);
    if (!customer) throw new NotFoundError('Customer', dto.customerId);

    const location = await this.locationRepository.findById(dto.locationId);
    if (!location) throw new NotFoundError('Location', dto.locationId);

    for (const item of dto.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) throw new NotFoundError('Product', item.productId);
    }

    const orderNumber = await this.salesOrderRepository.getNextOrderNumber();
    const totalAmount = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    return this.salesOrderRepository.create({
      ...dto,
      orderNumber,
      totalAmount,
    });
  }
}
