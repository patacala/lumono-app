import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  ILocationRepository,
  CreateLocationDto,
  UpdateLocationDto,
} from '@/domain/ports/repositories/location.repository';
import { Location } from '@/domain/entities/location.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class LocationRepositoryImpl implements ILocationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Location | null> {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });
    return location as Location | null;
  }

  async findByCode(code: string): Promise<Location | null> {
    const location = await this.prisma.location.findUnique({
      where: { code },
    });
    return location as Location | null;
  }

  async create(data: CreateLocationDto): Promise<Location> {
    const location = await this.prisma.location.create({
      data,
    });
    return location as Location;
  }

  async update(id: string, data: UpdateLocationDto, expectedVersion: number): Promise<Location> {
    try {
      const location = await this.prisma.location.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
      return location as Location;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.location.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy,
          version: { increment: 1 },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async findAll(): Promise<Location[]> {
    const locations = await this.prisma.location.findMany({
      where: { deletedAt: null },
    });
    return locations as Location[];
  }
}

