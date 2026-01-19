import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  ICategoryRepository,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/domain/ports/repositories/category.repository';
import { Category } from '@/domain/entities/category.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class CategoryRepositoryImpl implements ICategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });
    return category ? this.mapToEntity(category) : null;
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name, deletedAt: null },
    });
    return category ? this.mapToEntity(category) : null;
  }

  async findAll(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return categories.map(this.mapToEntity);
  }

  async findAllWithProductCount(): Promise<Category[]> {
    const categories = await this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        _count: {
          select: {
            products: {
              where: { deletedAt: null },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return categories.map((category) => ({
      ...this.mapToEntity(category),
      productCount: category._count.products,
    }));
  }

  async create(data: CreateCategoryDto): Promise<Category> {
    const category = await this.prisma.category.create({
      data,
    });
    return this.mapToEntity(category);
  }

  async update(id: string, data: UpdateCategoryDto, expectedVersion: number): Promise<Category> {
    try {
      const category = await this.prisma.category.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
      return this.mapToEntity(category);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.category.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy,
          version: { increment: 1 },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  private mapToEntity(category: any): Category {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      createdAt: category.createdAt,
      createdBy: category.createdBy,
      updatedAt: category.updatedAt,
      updatedBy: category.updatedBy,
      deletedAt: category.deletedAt,
      deletedBy: category.deletedBy,
      version: category.version,
    };
  }
}
