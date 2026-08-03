import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateProductUseCase } from '@/use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from '@/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from '@/use-cases/products/delete-product.use-case';
import { BulkCreateProductsUseCase } from '@/use-cases/products/bulk-create-products.use-case';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { calculatePagination, createPaginatedResponse } from '@/shared/dto/pagination.dto';

class CreateProductDto {
  @IsString() @IsOptional() sku?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsString() @IsOptional() barcode?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() brand?: string;
  @IsNumber() @Min(0) @IsOptional() salePrice?: number;
  @IsString() @IsOptional() status?: string;
  @IsNumber() @Min(0) @IsOptional() taxRate?: number;
  @IsString() @IsOptional() supplierId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsNumber() @Min(1) @IsOptional() stockThreshold?: number;
  @IsString() @IsOptional() unit?: string;
  @IsOptional() expirationDate?: string;
}

class ImportProductDto {
  @IsString() @IsOptional() sku?: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() @Min(0) unitPrice: number;
  @IsString() @IsOptional() barcode?: string;
  @IsString() @IsOptional() brand?: string;
  @IsNumber() @Min(0) @IsOptional() salePrice?: number;
  @IsNumber() @Min(1) @IsOptional() stockThreshold?: number;
  @IsString() @IsOptional() unit?: string;
}

class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportProductDto)
  products: ImportProductDto[];
}

class UpdateProductDto {
  @IsString() @IsOptional() name?: string;
  @IsString() @IsOptional() description?: string;
  @IsNumber() @Min(0) @IsOptional() unitPrice?: number;
  @IsString() @IsOptional() barcode?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsString() @IsOptional() brand?: string;
  @IsNumber() @Min(0) @IsOptional() salePrice?: number;
  @IsString() @IsOptional() status?: string;
  @IsNumber() @Min(0) @IsOptional() taxRate?: number;
  @IsString() @IsOptional() supplierId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsNumber() @Min(1) @IsOptional() stockThreshold?: number;
  @IsString() @IsOptional() unit?: string;
  @IsOptional() expirationDate?: string;
  @IsNumber() @Min(1) version: number;
}

@ApiTags('Products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly bulkCreateProductsUseCase: BulkCreateProductsUseCase,
  ) {}

  @Get()
  @RequirePermissions('product.read')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
    @Query('supplierId') supplierId?: string,
    @Query('categoryId') categoryId?: string,
    @Query('locationId') locationId?: string,
    @Query('expiringBefore') expiringBefore?: string,
    @Query('sortBy') sortBy?: 'name' | 'sku' | 'unitPrice' | 'createdAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const pagination = calculatePagination(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined
    );

    const filters = {
      search,
      minStock: minStock ? parseInt(minStock) : undefined,
      maxStock: maxStock ? parseInt(maxStock) : undefined,
      supplierId,
      categoryId,
      locationId,
      expiringBefore: expiringBefore ? new Date(expiringBefore) : undefined,
      sortBy: sortBy || 'name',
      sortOrder: sortOrder || 'asc',
    };

    const { products, total } = await this.productRepository.findAllWithStockPaginated(
      { skip: pagination.skip, limit: pagination.limit },
      filters
    );

    return createPaginatedResponse(products, total, pagination.page, pagination.limit);
  }

  @Post('import')
  @RequirePermissions('product.create')
  async importProducts(@Body() dto: BulkImportDto, @CurrentUser('sub') userId: string) {
    const products = dto.products.map((p) => ({
      ...p,
      createdBy: userId,
    }));
    return this.bulkCreateProductsUseCase.execute(products);
  }

  @Get(':id')
  @RequirePermissions('product.read')
  async findOne(@Param('id') id: string) {
    return this.productRepository.findByIdWithStock(id);
  }

  @Post()
  @RequirePermissions('product.create')
  async create(@Body() dto: CreateProductDto, @CurrentUser('sub') userId: string) {
    return this.createProductUseCase.execute({
      ...dto,
      expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : undefined,
      createdBy: userId,
    });
  }

  @Put(':id')
  @RequirePermissions('product.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @CurrentUser('sub') userId: string,
  ) {
    const { version, expirationDate, ...updateData } = dto;
    return this.updateProductUseCase.execute(
      id,
      {
        ...updateData,
        expirationDate: expirationDate ? new Date(expirationDate) : undefined,
        updatedBy: userId,
      },
      version
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('product.delete')
  async delete(
    @Param('id') id: string,
    @Body('version') version: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.deleteProductUseCase.execute(id, userId, version);
  }
}

