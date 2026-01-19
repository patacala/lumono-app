import { Category } from '../../entities/category.entity';

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
  createdBy?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
  updatedBy?: string;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByName(name: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findAllWithProductCount(): Promise<Category[]>;
  create(data: CreateCategoryDto): Promise<Category>;
  update(id: string, data: UpdateCategoryDto, expectedVersion: number): Promise<Category>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
}
