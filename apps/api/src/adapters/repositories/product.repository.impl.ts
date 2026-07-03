import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IProductRepository,
  CreateProductDto,
  UpdateProductDto,
} from '@/domain/ports/repositories/product.repository';
import { Product, StockByLocation } from '@/domain/entities/product.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class ProductRepositoryImpl implements IProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async findByIdWithStock(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
    });

    if (!product) return null;

    // Calculate stock by location
    const stockByLocation = await this.calculateStockByLocation(id);
    const totalStock = stockByLocation.reduce((sum, loc) => sum + loc.quantity, 0);

    return {
      ...this.mapToEntity(product),
      totalStock,
      stockByLocation,
    };
  }

  async findBySku(sku: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { sku, deletedAt: null },
    });
    return product ? this.mapToEntity(product) : null;
  }

  async getNextSkuSequence(): Promise<number> {
    const result = await this.prisma.$queryRaw<[{ max_seq: number | null }]>`
      SELECT MAX(
        CASE
          WHEN sku ~ '^PROD-[0-9]+$'
          THEN CAST(SUBSTRING(sku FROM 6) AS INTEGER)
          ELSE 0
        END
      ) as max_seq
      FROM products
    `;
    return (result[0]?.max_seq ?? 0) + 1;
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = await this.prisma.product.create({
      data: data as any,
    });
    return this.mapToEntity(product);
  }

  async update(id: string, data: UpdateProductDto, expectedVersion: number): Promise<Product> {
    try {
      const product = await this.prisma.product.update({
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
      return this.mapToEntity(product);
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.product.update({
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

  async findAll(): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
    });
    return products.map(this.mapToEntity);
  }

  async findAllWithStock(): Promise<Product[]> {
    // Get all products with stock calculation using raw SQL for performance
    const products = await this.prisma.$queryRaw<any[]>`
      SELECT 
        p.*,
        COALESCE(SUM(
          CASE 
            WHEN im.type = 'IN' THEN im.quantity
            WHEN im.type = 'OUT' THEN -im.quantity
            WHEN im.type = 'TRANSFER' AND im."destLocationId" IS NOT NULL THEN im.quantity
            WHEN im.type = 'TRANSFER' AND im."originLocationId" IS NOT NULL THEN -im.quantity
            ELSE 0
          END
        ), 0)::int as "totalStock"
      FROM products p
      LEFT JOIN inventory_movements im ON im."productId" = p.id
      WHERE p."deletedAt" IS NULL
      GROUP BY p.id
      ORDER BY p.name
    `;

    return products.map((product) => ({
      ...this.mapToEntity(product),
      totalStock: parseInt(product.totalStock) || 0,
    }));
  }

  async findAllWithStockPaginated(
    pagination: { skip: number; limit: number },
    filters?: {
      search?: string;
      minStock?: number;
      maxStock?: number;
      supplierId?: string;
      categoryId?: string;
      expiringBefore?: Date;
      sortBy?: 'name' | 'sku' | 'unitPrice' | 'createdAt';
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<{ products: Product[]; total: number }> {
    const { skip, limit } = pagination;
    const { search, minStock, maxStock, supplierId, categoryId, expiringBefore, sortBy = 'name', sortOrder = 'asc' } = filters || {};

    // Build WHERE conditions
    const whereConditions: string[] = ['p."deletedAt" IS NULL'];
    const params: any[] = [];

    if (search) {
      params.push(`%${search}%`, `%${search}%`);
      whereConditions.push(`(p.name ILIKE $${params.length - 1} OR p.sku ILIKE $${params.length})`);
    }

    if (supplierId) {
      params.push(supplierId);
      whereConditions.push(`p."supplierId" = $${params.length}`);
    }

    if (categoryId) {
      params.push(categoryId);
      whereConditions.push(`p."categoryId" = $${params.length}`);
    }

    if (expiringBefore) {
      params.push(expiringBefore);
      whereConditions.push(`p."expirationDate" IS NOT NULL AND p."expirationDate" <= $${params.length}`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT p.id)::int as count
      FROM products p
      WHERE ${whereClause}
    `;
    const countResult = await this.prisma.$queryRawUnsafe<[{ count: number }]>(countQuery, ...params);
    const total = countResult[0]?.count || 0;

    // Build ORDER BY
    const orderByMap = {
      name: 'p.name',
      sku: 'p.sku',
      unitPrice: 'p."unitPrice"',
      createdAt: 'p."createdAt"',
    };
    const orderBy = `${orderByMap[sortBy]} ${sortOrder.toUpperCase()}`;

    // Get paginated products with stock, supplier name, and category name
    params.push(limit, skip);
    const query = `
      SELECT
        p.*,
        s.name as "supplierName",
        c.name as "categoryName",
        COALESCE(SUM(
          CASE
            WHEN im.type = 'IN' THEN im.quantity
            WHEN im.type = 'OUT' THEN -im.quantity
            WHEN im.type = 'TRANSFER' AND im."destLocationId" IS NOT NULL THEN im.quantity
            WHEN im.type = 'TRANSFER' AND im."originLocationId" IS NOT NULL THEN -im.quantity
            ELSE 0
          END
        ), 0)::int as "totalStock"
      FROM products p
      LEFT JOIN suppliers s ON s.id = p."supplierId"
      LEFT JOIN categories c ON c.id = p."categoryId"
      LEFT JOIN inventory_movements im ON im."productId" = p.id
      WHERE ${whereClause}
      GROUP BY p.id, s.name, c.name
      ${minStock !== undefined || maxStock !== undefined ?
        `HAVING COALESCE(SUM(
          CASE
            WHEN im.type = 'IN' THEN im.quantity
            WHEN im.type = 'OUT' THEN -im.quantity
            WHEN im.type = 'TRANSFER' AND im."destLocationId" IS NOT NULL THEN im.quantity
            WHEN im.type = 'TRANSFER' AND im."originLocationId" IS NOT NULL THEN -im.quantity
            ELSE 0
          END
        ), 0) ${minStock !== undefined ? `>= ${minStock}` : ''} ${minStock !== undefined && maxStock !== undefined ? 'AND' : ''} ${maxStock !== undefined ? `<= ${maxStock}` : ''}`
        : ''}
      ORDER BY ${orderBy}
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `;

    const products = await this.prisma.$queryRawUnsafe<any[]>(query, ...params);

    return {
      products: products.map((product) => ({
        ...this.mapToEntity(product),
        supplierName: product.supplierName,
        categoryName: product.categoryName,
        stockThreshold: product.stockThreshold || 10,
        totalStock: parseInt(product.totalStock) || 0,
      })),
      total,
    };
  }

  private async calculateStockByLocation(productId: string): Promise<StockByLocation[]> {
    // Calculate stock per location
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        l.id as "locationId",
        l.name as "locationName",
        l.code as "locationCode",
        COALESCE(
          SUM(
            CASE 
              WHEN im.type = 'IN' AND im."destLocationId" = l.id THEN im.quantity
              WHEN im.type = 'OUT' AND im."originLocationId" = l.id THEN -im.quantity
              WHEN im.type = 'TRANSFER' AND im."destLocationId" = l.id THEN im.quantity
              WHEN im.type = 'TRANSFER' AND im."originLocationId" = l.id THEN -im.quantity
              ELSE 0
            END
          ), 0
        )::int as quantity
      FROM locations l
      LEFT JOIN inventory_movements im ON 
        (im."destLocationId" = l.id OR im."originLocationId" = l.id) 
        AND im."productId" = ${productId}
      WHERE l."deletedAt" IS NULL
      GROUP BY l.id, l.name, l.code
      HAVING COALESCE(
        SUM(
          CASE 
            WHEN im.type = 'IN' AND im."destLocationId" = l.id THEN im.quantity
            WHEN im.type = 'OUT' AND im."originLocationId" = l.id THEN -im.quantity
            WHEN im.type = 'TRANSFER' AND im."destLocationId" = l.id THEN im.quantity
            WHEN im.type = 'TRANSFER' AND im."originLocationId" = l.id THEN -im.quantity
            ELSE 0
          END
        ), 0
      ) > 0
      ORDER BY l.name
    `;

    return result.map((row) => ({
      locationId: row.locationId,
      locationName: row.locationName,
      locationCode: row.locationCode,
      quantity: parseInt(row.quantity) || 0,
    }));
  }

  private mapToEntity(product: any): Product {
    return {
      ...product,
      unitPrice: parseFloat(product.unitPrice.toString()),
      salePrice: product.salePrice ? parseFloat(product.salePrice.toString()) : undefined,
      taxRate: product.taxRate ? parseFloat(product.taxRate.toString()) : undefined,
    };
  }
}

