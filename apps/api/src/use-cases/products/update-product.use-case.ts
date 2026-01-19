import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository, UpdateProductDto } from '@/domain/ports/repositories/product.repository';
import { Product } from '@/domain/entities/product.entity';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository
  ) {}

  async execute(id: string, dto: UpdateProductDto, version: number): Promise<Product> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    return this.productRepository.update(id, dto, version);
  }
}

