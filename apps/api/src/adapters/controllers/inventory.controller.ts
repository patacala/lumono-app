import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { RegisterInventoryInUseCase } from '@/use-cases/inventory/register-inventory-in.use-case';
import { RegisterInventoryOutUseCase } from '@/use-cases/inventory/register-inventory-out.use-case';
import { TransferInventoryUseCase } from '@/use-cases/inventory/transfer-inventory.use-case';
import { GetStockUseCase } from '@/use-cases/inventory/get-stock.use-case';
import { RegisterAdjustmentUseCase } from '@/use-cases/inventory/register-adjustment.use-case';
import { GetMovementByIdUseCase } from '@/use-cases/inventory/get-movement-by-id.use-case';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { StockGateway } from '@/adapters/gateways/stock.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

class RegisterInventoryInDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  destLocationId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  subType?: string;

  @IsString()
  @IsOptional()
  referenceDocument?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitPrice?: number;
}

class RegisterInventoryOutDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  originLocationId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  subType?: string;

  @IsString()
  @IsOptional()
  referenceDocument?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

class TransferInventoryDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  originLocationId: string;

  @IsString()
  @IsNotEmpty()
  destLocationId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  referenceDocument?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

class RegisterAdjustmentDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsNotEmpty()
  locationId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsString()
  @IsNotEmpty()
  subType: 'POSITIVE_ADJUSTMENT' | 'NEGATIVE_ADJUSTMENT';

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
    private readonly registerInUseCase: RegisterInventoryInUseCase,
    private readonly registerOutUseCase: RegisterInventoryOutUseCase,
    private readonly transferUseCase: TransferInventoryUseCase,
    private readonly getStockUseCase: GetStockUseCase,
    private readonly registerAdjustmentUseCase: RegisterAdjustmentUseCase,
    private readonly getMovementByIdUseCase: GetMovementByIdUseCase,
    private readonly stockGateway: StockGateway,
    @InjectQueue('stock-alerts') private readonly stockAlertsQueue: Queue,
  ) {}

  @Post('in')
  @RequirePermissions('inventory.in')
  async registerIn(@Body() dto: RegisterInventoryInDto, @CurrentUser('sub') userId: string) {
    const movement = await this.registerInUseCase.execute({
      ...dto,
      subType: dto.subType as any,
      createdBy: userId,
    });
    this.stockGateway.emitStockUpdate({
      productId: dto.productId,
      locationId: dto.destLocationId,
      type: 'IN',
      quantity: dto.quantity,
      timestamp: new Date().toISOString(),
    });
    await this.stockAlertsQueue.add('check', { productId: dto.productId });
    return movement;
  }

  @Post('out')
  @RequirePermissions('inventory.out')
  async registerOut(@Body() dto: RegisterInventoryOutDto, @CurrentUser('sub') userId: string) {
    const movement = await this.registerOutUseCase.execute({
      ...dto,
      subType: dto.subType as any,
      createdBy: userId,
    });
    this.stockGateway.emitStockUpdate({
      productId: dto.productId,
      locationId: dto.originLocationId,
      type: 'OUT',
      quantity: dto.quantity,
      timestamp: new Date().toISOString(),
    });
    await this.stockAlertsQueue.add('check', { productId: dto.productId });
    return movement;
  }

  @Post('transfer')
  @RequirePermissions('inventory.transfer')
  async transfer(@Body() dto: TransferInventoryDto, @CurrentUser('sub') userId: string) {
    const movement = await this.transferUseCase.execute({ ...dto, createdBy: userId });
    this.stockGateway.emitStockUpdate({
      productId: dto.productId,
      locationId: dto.originLocationId,
      type: 'TRANSFER',
      quantity: dto.quantity,
      timestamp: new Date().toISOString(),
    });
    await this.stockAlertsQueue.add('check', { productId: dto.productId });
    return movement;
  }

  @Post('adjustment')
  @RequirePermissions('inventory.adjust')
  async registerAdjustment(@Body() dto: RegisterAdjustmentDto, @CurrentUser('sub') userId: string) {
    const movement = await this.registerAdjustmentUseCase.execute({
      ...dto,
      subType: dto.subType as any,
      reason: dto.reason as any,
      createdBy: userId,
    });
    this.stockGateway.emitStockUpdate({
      productId: dto.productId,
      locationId: dto.locationId,
      type: 'ADJUSTMENT',
      quantity: dto.quantity,
      timestamp: new Date().toISOString(),
    });
    await this.stockAlertsQueue.add('check', { productId: dto.productId });
    return movement;
  }

  @Get('stock')
  @RequirePermissions('inventory.read')
  async getStock(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
  ) {
    if (productId && locationId) {
      return this.getStockUseCase.getByProductAndLocation(productId, locationId);
    }
    if (productId) {
      return this.getStockUseCase.getByProduct(productId);
    }
    if (locationId) {
      return this.getStockUseCase.getByLocation(locationId);
    }
    return { error: 'Either productId or locationId must be provided' };
  }

  @Get('movements')
  @RequirePermissions('inventory.read')
  async getMovements(
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('type') type?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    // If pagination params provided, use paginated query
    if (page || limit) {
      return this.inventoryMovementRepository.findAllPaginated({
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
        type: type as any,
        productId,
        locationId,
      });
    }

    // Legacy: return all movements
    if (productId) {
      return this.inventoryMovementRepository.findByProductId(productId);
    }
    if (locationId) {
      return this.inventoryMovementRepository.findByLocationId(locationId);
    }
    return this.inventoryMovementRepository.findAll();
  }

  @Get('movements/:id')
  @RequirePermissions('inventory.read')
  async getMovementById(@Param('id') id: string) {
    return this.getMovementByIdUseCase.execute(id);
  }

  @Get('stats/today')
  @RequirePermissions('inventory.read')
  async getTodayStats() {
    return this.inventoryMovementRepository.countByTypeToday();
  }
}
