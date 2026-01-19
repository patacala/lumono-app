import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository, CreateProductDto } from '@/domain/ports/repositories/product.repository';
import { Product } from '@/domain/entities/product.entity';
import { ConflictError } from '@/domain/errors/domain.error';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository
  ) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const existing = await this.productRepository.findBySku(dto.sku);

    if (existing) {
      throw new ConflictError(`Product with SKU ${dto.sku} already exists`);
    }

    return this.productRepository.create(dto);
  }
}

