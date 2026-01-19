import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  ISupplierRepository,
  CreateSupplierDto,
  UpdateSupplierDto,
} from '@/domain/ports/repositories/supplier.repository';
import { Supplier } from '@/domain/entities/supplier.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class SupplierRepositoryImpl implements ISupplierRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
    });
    return supplier as Supplier | null;
  }

  async findByCode(code: string): Promise<Supplier | null> {
    const supplier = await this.prisma.supplier.findUnique({
      where: { code },
    });
    return supplier as Supplier | null;
  }

  async create(data: CreateSupplierDto): Promise<Supplier> {
    const supplier = await this.prisma.supplier.create({
      data,
    });
    return supplier as Supplier;
  }

  async update(id: string, data: UpdateSupplierDto, expectedVersion: number): Promise<Supplier> {
    try {
      const supplier = await this.prisma.supplier.update({
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
      return supplier as Supplier;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.supplier.update({
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

  async findAll(): Promise<Supplier[]> {
    const suppliers = await this.prisma.supplier.findMany({
      where: { deletedAt: null },
    });
    return suppliers as Supplier[];
  }
}

