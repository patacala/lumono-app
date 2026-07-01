import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { ILotRepository, LotFilters } from '@/domain/ports/repositories/lot.repository';
import { LotCondition } from '@/domain/entities/lot.entity';
import { calculatePagination, createPaginatedResponse } from '@/shared/dto/pagination.dto';

@ApiTags('Lots')
@ApiBearerAuth()
@Controller('lots')
export class LotsController {
  constructor(
    @Inject('ILotRepository') private readonly lotRepository: ILotRepository,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('locationId') locationId?: string,
    @Query('condition') condition?: LotCondition,
  ) {
    const pagination = calculatePagination(
      page ? parseInt(page) : undefined,
      limit ? parseInt(limit) : undefined,
    );
    const filters: LotFilters = { productId, locationId, condition };
    const { data, total } = await this.lotRepository.findAllPaginated(
      { skip: pagination.skip, limit: pagination.limit },
      filters,
    );
    return createPaginatedResponse(data, total, pagination.page, pagination.limit);
  }

  @Get(':id')
  @RequirePermissions('inventory.read')
  async findOne(@Param('id') id: string) {
    return this.lotRepository.findById(id);
  }
}
