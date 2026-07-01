import {
  Controller, Get, Post, Patch, Body, Param, Query, Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ISalesOrderRepository } from '@/domain/ports/repositories/sales-order.repository';
import { CreateSalesOrderUseCase } from '@/use-cases/sales-orders/create-sales-order.use-case';
import { UpdateSalesOrderStatusUseCase } from '@/use-cases/sales-orders/update-sales-order-status.use-case';
import { SalesOrderStatus } from '@/domain/entities/sales-order.entity';
import { calculatePagination, createPaginatedResponse } from '@/shared/dto/pagination.dto';

class SalesOrderItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
}

class CreateSalesOrderDto {
  @IsString() @IsNotEmpty() customerId: string;
  @IsString() @IsNotEmpty() locationId: string;
  @IsString() @IsOptional() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => SalesOrderItemDto)
  items: SalesOrderItemDto[];
}

class UpdateStatusDto {
  @IsString() @IsNotEmpty() status: SalesOrderStatus;
  @IsNumber() @IsNotEmpty() version: number;
}

@ApiTags('Sales Orders')
@ApiBearerAuth()
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(
    @Inject('ISalesOrderRepository')
    private readonly salesOrderRepository: ISalesOrderRepository,
    private readonly createSalesOrderUseCase: CreateSalesOrderUseCase,
    private readonly updateSalesOrderStatusUseCase: UpdateSalesOrderStatusUseCase,
  ) {}

  @Get()
  @RequirePermissions('sales-order.read')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: SalesOrderStatus,
    @Query('customerId') customerId?: string,
  ) {
    const pagination = calculatePagination(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
    const { data, total } = await this.salesOrderRepository.findAllPaginated(
      { skip: pagination.skip, limit: pagination.limit },
      { status, customerId },
    );
    return createPaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  @Get('stats/counts')
  @RequirePermissions('sales-order.read')
  async getStatusCounts() {
    const [pending, preparing] = await Promise.all([
      this.salesOrderRepository.countByStatus('PENDING'),
      this.salesOrderRepository.countByStatus('PREPARING'),
    ]);
    return { pending, preparing };
  }

  @Get(':id')
  @RequirePermissions('sales-order.read')
  async findOne(@Param('id') id: string) {
    return this.salesOrderRepository.findById(id);
  }

  @Post()
  @RequirePermissions('sales-order.create')
  async create(@Body() dto: CreateSalesOrderDto, @CurrentUser('sub') userId: string) {
    return this.createSalesOrderUseCase.execute({
      ...dto,
      createdBy: userId,
    });
  }

  @Patch(':id/status')
  @RequirePermissions('sales-order.update')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.updateSalesOrderStatusUseCase.execute(id, dto.status, userId, dto.version);
  }
}
