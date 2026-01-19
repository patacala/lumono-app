import { Injectable, Inject } from '@nestjs/common';
import { ICategoryRepository, CreateCategoryDto } from '@/domain/ports/repositories/category.repository';
import { Category } from '@/domain/entities/category.entity';
import { ConflictError } from '@/domain/errors/domain.error';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository
  ) {}

  async execute(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryRepository.findByName(dto.name);

    if (existing) {
      throw new ConflictError(`Category with name "${dto.name}" already exists`);
    }

    return this.categoryRepository.create(dto);
  }
}
