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
import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ISupplierRepository } from '@/domain/ports/repositories/supplier.repository';

class CreateSupplierDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;
}

class UpdateSupplierDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  contact?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNotEmpty()
  version: number;
}

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  @Get()
  @RequirePermissions('supplier.read')
  async findAll() {
    return this.supplierRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('supplier.read')
  async findOne(@Param('id') id: string) {
    return this.supplierRepository.findById(id);
  }

  @Post()
  @RequirePermissions('supplier.create')
  async create(@Body() dto: CreateSupplierDto, @CurrentUser('sub') userId: string) {
    return this.supplierRepository.create({ ...dto, createdBy: userId });
  }

  @Put(':id')
  @RequirePermissions('supplier.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser('sub') userId: string,
  ) {
    const { version, ...updateData } = dto;
    return this.supplierRepository.update(id, { ...updateData, updatedBy: userId }, version);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('supplier.delete')
  async delete(
    @Param('id') id: string,
    @Body('version') version: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.supplierRepository.softDelete(id, userId, version);
  }
}

