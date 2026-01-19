import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository
  ) {}

  async execute(id: string, deletedBy: string, version: number): Promise<void> {
    const product = await this.productRepository.findById(id);

    if (!product) {
      throw new NotFoundError('Product', id);
    }

    await this.productRepository.softDelete(id, deletedBy, version);
  }
}

