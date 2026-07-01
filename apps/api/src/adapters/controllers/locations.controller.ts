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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';

class CreateLocationDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class UpdateLocationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  version: number;
}

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
  ) {}

  @Get()
  @RequirePermissions('location.read')
  async findAll() {
    return this.locationRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('location.read')
  async findOne(@Param('id') id: string) {
    return this.locationRepository.findById(id);
  }

  @Post()
  @RequirePermissions('location.create')
  async create(@Body() dto: CreateLocationDto, @CurrentUser('sub') userId: string) {
    return this.locationRepository.create({ ...dto, createdBy: userId });
  }

  @Put(':id')
  @RequirePermissions('location.update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @CurrentUser('sub') userId: string,
  ) {
    const { version, ...updateData } = dto;
    return this.locationRepository.update(id, { ...updateData, updatedBy: userId }, version);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('location.delete')
  async delete(
    @Param('id') id: string,
    @Body('version') version: number,
    @CurrentUser('sub') userId: string,
  ) {
    await this.locationRepository.softDelete(id, userId, version);
  }
}

