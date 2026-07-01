import {
  Controller, Get, Post, Put, Delete, Body, Param,
  HttpCode, HttpStatus, Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ICustomerRepository } from '@/domain/ports/repositories/customer.repository';
import { CreateCustomerUseCase } from '@/use-cases/customers/create-customer.use-case';
import { UpdateCustomerUseCase } from '@/use-cases/customers/update-customer.use-case';
import { DeleteCustomerUseCase } from '@/use-cases/customers/delete-customer.use-case';

class CreateCustomerDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() taxId?: string;
}

class UpdateCustomerDto {
  @IsString() @IsOptional() name?: string;
  @IsEmail() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() taxId?: string;
  @IsNumber() @IsNotEmpty() version: number;
}

@ApiTags('Customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
    private readonly updateCustomerUseCase: UpdateCustomerUseCase,
    private readonly deleteCustomerUseCase: DeleteCustomerUseCase,
  ) {}

  @Get()
  @RequirePermissions('customer.read')
  async findAll() {
    return this.customerRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('customer.read')
  async findOne(@Param('id') id: string) {
    return this.customerRepository.findById(id);
  }

  @Post()
  @RequirePermissions('customer.create')
  async create(@Body() dto: CreateCustomerDto, @CurrentUser('sub') userId: string) {
    return this.createCustomerUseCase.execute({ ...dto, createdBy: userId });
  }

  @Put(':id')
  @RequirePermissions('customer.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser('sub') userId: string,
  ) {
    const { version, ...updateData } = dto;
    return this.updateCustomerUseCase.execute(id, { ...updateData, updatedBy: userId }, version);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('customer.delete')
  async delete(
    @Param('id') id: string,
    @Body('version') version: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.deleteCustomerUseCase.execute(id, userId, version);
  }
}
