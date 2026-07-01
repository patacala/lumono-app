import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { ILotRepository, CreateLotDto, LotFilters } from '@/domain/ports/repositories/lot.repository';
import { Lot } from '@/domain/entities/lot.entity';

@Injectable()
export class LotRepositoryImpl implements ILotRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Lot | null> {
    const lot = await this.prisma.lot.findUnique({
      where: { id, deletedAt: null },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
    });
    return lot ? this.mapToEntity(lot) : null;
  }

  async findByLotNumberAndProduct(lotNumber: string, productId: string): Promise<Lot | null> {
    const lot = await this.prisma.lot.findFirst({
      where: { lotNumber, productId, deletedAt: null },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
    });
    return lot ? this.mapToEntity(lot) : null;
  }

  async findByProductAndLocation(productId: string, locationId: string): Promise<Lot[]> {
    const lots = await this.prisma.lot.findMany({
      where: { productId, locationId, deletedAt: null },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
      orderBy: { expirationDate: 'asc' },
    });
    return lots.map((l) => this.mapToEntity(l));
  }

  async findAllPaginated(
    pagination: { skip: number; limit: number },
    filters?: LotFilters,
  ): Promise<{ data: Lot[]; total: number }> {
    const where: any = { deletedAt: null };
    if (filters?.productId) where.productId = filters.productId;
    if (filters?.locationId) where.locationId = filters.locationId;
    if (filters?.condition) where.condition = filters.condition;

    const [lots, total] = await Promise.all([
      this.prisma.lot.findMany({
        where,
        include: {
          product: { select: { name: true, sku: true } },
          location: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
      }),
      this.prisma.lot.count({ where }),
    ]);

    return {
      data: lots.map((l) => this.mapToEntity(l)),
      total,
    };
  }

  async create(data: CreateLotDto): Promise<Lot> {
    const lot = await this.prisma.lot.create({
      data: {
        lotNumber: data.lotNumber,
        productId: data.productId,
        locationId: data.locationId,
        quantity: data.quantity,
        condition: data.condition,
        expirationDate: data.expirationDate,
        manufacturingDate: data.manufacturingDate,
        notes: data.notes,
        createdBy: data.createdBy,
      },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
    });
    return this.mapToEntity(lot);
  }

  async updateQuantity(id: string, quantityDelta: number, updatedBy?: string): Promise<Lot> {
    const lot = await this.prisma.lot.update({
      where: { id },
      data: {
        quantity: { increment: quantityDelta },
        updatedBy,
        version: { increment: 1 },
      },
      include: {
        product: { select: { name: true, sku: true } },
        location: { select: { name: true } },
      },
    });
    return this.mapToEntity(lot);
  }

  async softDelete(id: string, deletedBy?: string): Promise<void> {
    await this.prisma.lot.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy },
    });
  }

  private mapToEntity(lot: any): Lot {
    return {
      id: lot.id,
      lotNumber: lot.lotNumber,
      productId: lot.productId,
      productName: lot.product?.name,
      productSku: lot.product?.sku,
      locationId: lot.locationId,
      locationName: lot.location?.name,
      quantity: lot.quantity,
      condition: lot.condition,
      expirationDate: lot.expirationDate,
      manufacturingDate: lot.manufacturingDate,
      notes: lot.notes,
      createdAt: lot.createdAt,
      createdBy: lot.createdBy,
      updatedAt: lot.updatedAt,
      updatedBy: lot.updatedBy,
      deletedAt: lot.deletedAt,
      deletedBy: lot.deletedBy,
      version: lot.version,
    };
  }
}
