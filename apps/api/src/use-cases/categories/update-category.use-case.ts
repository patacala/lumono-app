import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository, UpdateCategoryDto } from '@/domain/ports/repositories/category.repository';
import { Category } from '@/domain/entities/category.entity';
import { NotFoundError, ConflictError } from '@/domain/errors/domain.error';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(id: string, dto: UpdateCategoryDto, expectedVersion: number): Promise<Category> {
    const existing = await this.categoryRepository.findById(id);

    if (!existing) {
      throw new NotFoundError('Category', id);
    }

    // Check for duplicate name if name is being changed
    if (dto.name && dto.name !== existing.name) {
      const duplicate = await this.categoryRepository.findByName(dto.name);
      if (duplicate) {
        throw new ConflictError(`Category with name "${dto.name}" already exists`);
      }
    }

    return this.categoryRepository.update(id, dto, expectedVersion);
  }
}
