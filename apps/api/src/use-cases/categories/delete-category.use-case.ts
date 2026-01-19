import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository } from '@/domain/ports/repositories/category.repository';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    const existing = await this.categoryRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Category', id);
    }

    await this.categoryRepository.softDelete(id, deletedBy, expectedVersion);
  }
}
