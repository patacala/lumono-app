import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  ICustomerRepository,
  CreateCustomerDto,
  UpdateCustomerDto,
} from '@/domain/ports/repositories/customer.repository';
import { Customer } from '@/domain/entities/customer.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class CustomerRepositoryImpl implements ICustomerRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { id, deletedAt: null },
    });
    return customer as Customer | null;
  }

  async findByCode(code: string): Promise<Customer | null> {
    const customer = await this.prisma.customer.findUnique({
      where: { code, deletedAt: null },
    });
    return customer as Customer | null;
  }

  async create(data: CreateCustomerDto): Promise<Customer> {
    const customer = await this.prisma.customer.create({ data });
    return customer as Customer;
  }

  async update(id: string, data: UpdateCustomerDto, expectedVersion: number): Promise<Customer> {
    try {
      const customer = await this.prisma.customer.update({
        where: { id, version: expectedVersion, deletedAt: null },
        data: { ...data, version: { increment: 1 } },
      });
      return customer as Customer;
    } catch (error: any) {
      if (error.code === 'P2025') throw new OptimisticLockError();
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.customer.update({
        where: { id, version: expectedVersion, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy, version: { increment: 1 } },
      });
    } catch (error: any) {
      if (error.code === 'P2025') throw new OptimisticLockError();
      throw error;
    }
  }

  async findAll(): Promise<Customer[]> {
    const customers = await this.prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
    return customers as Customer[];
  }
}
