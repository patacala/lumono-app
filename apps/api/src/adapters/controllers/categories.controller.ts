import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateCategoryUseCase } from '@/use-cases/categories/create-category.use-case';
import { UpdateCategoryUseCase } from '@/use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from '@/use-cases/categories/delete-category.use-case';
import { ICategoryRepository } from '@/domain/ports/repositories/category.repository';

class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;
}

class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  color?: string;

  version: number;
}

@Controller('categories')
export class CategoriesController {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
  ) {}

  @Get()
  @RequirePermissions('product.read')
  async findAll() {
    return this.categoryRepository.findAllWithProductCount();
  }

  @Get(':id')
  @RequirePermissions('product.read')
  async findOne(@Param('id') id: string) {
    return this.categoryRepository.findById(id);
  }

  @Post()
  @RequirePermissions('product.create')
  async create(@Body() dto: CreateCategoryDto, @CurrentUser('sub') userId: string) {
    return this.createCategoryUseCase.execute({
      ...dto,
      createdBy: userId,
    });
  }

  @Put(':id')
  @RequirePermissions('product.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser('sub') userId: string,
  ) {
    const { version, ...updateData } = dto;
    return this.updateCategoryUseCase.execute(id, { ...updateData, updatedBy: userId }, version);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('product.delete')
  async delete(
    @Param('id') id: string,
    @Body('version') version: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.deleteCategoryUseCase.execute(id, userId, version);
  }
}
