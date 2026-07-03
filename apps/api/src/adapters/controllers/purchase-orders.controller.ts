import {
  Controller, Get, Post, Patch, Body, Param, Query, Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { IPurchaseOrderRepository } from '@/domain/ports/repositories/purchase-order.repository';
import { CreatePurchaseOrderUseCase } from '@/use-cases/purchase-orders/create-purchase-order.use-case';
import { UpdatePurchaseOrderStatusUseCase } from '@/use-cases/purchase-orders/update-purchase-order-status.use-case';
import { ReceivePurchaseOrderUseCase } from '@/use-cases/purchase-orders/receive-purchase-order.use-case';
import { PurchaseOrderStatus } from '@/domain/entities/purchase-order.entity';
import { calculatePagination, createPaginatedResponse } from '@/shared/dto/pagination.dto';

class PurchaseOrderItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsNumber() @Min(1) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
}

class CreatePurchaseOrderDto {
  @IsString() @IsNotEmpty() supplierId: string;
  @IsString() @IsNotEmpty() locationId: string;
  @IsDateString() @IsOptional() expectedDate?: string;
  @IsString() @IsOptional() notes?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => PurchaseOrderItemDto)
  items: PurchaseOrderItemDto[];
}

class UpdateStatusDto {
  @IsString() @IsNotEmpty() status: PurchaseOrderStatus;
  @IsNumber() @IsNotEmpty() version: number;
}

class ReceiveItemDto {
  @IsString() @IsNotEmpty() purchaseOrderItemId: string;
  @IsNumber() @Min(1) receivedQty: number;
  @IsString() @IsOptional() lotNumber?: string;
  @IsString() @IsNotEmpty() condition: 'GOOD' | 'DAMAGED' | 'EXPIRED';
  @IsDateString() @IsOptional() expirationDate?: string;
  @IsDateString() @IsOptional() manufacturingDate?: string;
  @IsString() @IsOptional() notes?: string;
}

class ReceivePurchaseOrderDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
  @IsString() @IsOptional() notes?: string;
  @IsNumber() @IsNotEmpty() version: number;
}

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(
    @Inject('IPurchaseOrderRepository')
    private readonly purchaseOrderRepository: IPurchaseOrderRepository,
    private readonly createPurchaseOrderUseCase: CreatePurchaseOrderUseCase,
    private readonly updatePurchaseOrderStatusUseCase: UpdatePurchaseOrderStatusUseCase,
    private readonly receivePurchaseOrderUseCase: ReceivePurchaseOrderUseCase,
  ) {}

  @Get()
  @RequirePermissions('purchase-order.read')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PurchaseOrderStatus,
    @Query('supplierId') supplierId?: string,
  ) {
    const pagination = calculatePagination(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
    const { data, total } = await this.purchaseOrderRepository.findAllPaginated(
      { skip: pagination.skip, limit: pagination.limit },
      { status, supplierId },
    );
    return createPaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  @RequirePermissions('purchase-order.read')
  async findOne(@Param('id') id: string) {
    return this.purchaseOrderRepository.findById(id);
  }

  @Post()
  @RequirePermissions('purchase-order.create')
  async create(@Body() dto: CreatePurchaseOrderDto, @CurrentUser('sub') userId: string) {
    return this.createPurchaseOrderUseCase.execute({
      ...dto,
      expectedDate: dto.expectedDate ? new Date(dto.expectedDate) : undefined,
      createdBy: userId,
    });
  }

  @Patch(':id/status')
  @RequirePermissions('purchase-order.update')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.updatePurchaseOrderStatusUseCase.execute(id, dto.status, userId, dto.version);
  }

  @Post(':id/receive')
  @RequirePermissions('purchase-order.receive')
  async receive(
    @Param('id') id: string,
    @Body() dto: ReceivePurchaseOrderDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.receivePurchaseOrderUseCase.execute(
      id,
      {
        items: dto.items.map((i) => ({
          ...i,
          expirationDate: i.expirationDate ? new Date(i.expirationDate) : undefined,
          manufacturingDate: i.manufacturingDate ? new Date(i.manufacturingDate) : undefined,
        })),
        notes: dto.notes,
      },
      userId,
      dto.version,
    );
  }
}
