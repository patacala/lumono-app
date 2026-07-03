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
    let sku = dto.sku?.trim();

    if (!sku) {
      const seq = await this.productRepository.getNextSkuSequence();
      sku = `PROD-${seq.toString().padStart(5, '0')}`;
    }

    const existing = await this.productRepository.findBySku(sku);
    if (existing) {
      throw new ConflictError(`Product with SKU ${sku} already exists`);
    }

    return this.productRepository.create({ ...dto, sku });
  }
}

