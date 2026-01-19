import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { RegisterInventoryInUseCase } from '@/use-cases/inventory/register-inventory-in.use-case';
import { RegisterInventoryOutUseCase } from '@/use-cases/inventory/register-inventory-out.use-case';
import { TransferInventoryUseCase } from '@/use-cases/inventory/transfer-inventory.use-case';
import { GetStockUseCase } from '@/use-cases/inventory/get-stock.use-case';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';

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

@Controller('inventory')
export class InventoryController {
  constructor(
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
    private readonly registerInUseCase: RegisterInventoryInUseCase,
    private readonly registerOutUseCase: RegisterInventoryOutUseCase,
    private readonly transferUseCase: TransferInventoryUseCase,
    private readonly getStockUseCase: GetStockUseCase,
  ) {}

  @Post('in')
  @RequirePermissions('inventory.in')
  async registerIn(@Body() dto: RegisterInventoryInDto, @CurrentUser('sub') userId: string) {
    return this.registerInUseCase.execute({ ...dto, createdBy: userId });
  }

  @Post('out')
  @RequirePermissions('inventory.out')
  async registerOut(@Body() dto: RegisterInventoryOutDto, @CurrentUser('sub') userId: string) {
    return this.registerOutUseCase.execute({ ...dto, createdBy: userId });
  }

  @Post('transfer')
  @RequirePermissions('inventory.transfer')
  async transfer(@Body() dto: TransferInventoryDto, @CurrentUser('sub') userId: string) {
    return this.transferUseCase.execute({ ...dto, createdBy: userId });
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
  ) {
    if (productId) {
      return this.inventoryMovementRepository.findByProductId(productId);
    }
    if (locationId) {
      return this.inventoryMovementRepository.findByLocationId(locationId);
    }
    return this.inventoryMovementRepository.findAll();
  }
}

