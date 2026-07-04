import { Product } from '../../entities/product.entity';

export interface CreateProductDto {
  sku?: string;
  name: string;
  description?: string;
  unitPrice: number;
  barcode?: string;
  imageUrl?: string;
  brand?: string;
  salePrice?: number;
  status?: string;
  taxRate?: number;
  supplierId?: string;
  categoryId?: string;
  stockThreshold?: number;
  unit?: string;
  expirationDate?: Date;
  createdBy?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  unitPrice?: number;
  barcode?: string;
  imageUrl?: string;
  brand?: string;
  salePrice?: number;
  status?: string;
  taxRate?: number;
  supplierId?: string;
  categoryId?: string;
  stockThreshold?: number;
  unit?: string;
  expirationDate?: Date;
  updatedBy?: string;
}

export interface ProductFilters {
  search?: string;
  minStock?: number;
  maxStock?: number;
  supplierId?: string;
  categoryId?: string;
  expiringBefore?: Date;
  sortBy?: 'name' | 'sku' | 'unitPrice' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  skip: number;
  limit: number;
}

export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByIdWithStock(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  getNextSkuSequence(): Promise<number>;
  create(data: CreateProductDto): Promise<Product>;
  createMany(data: CreateProductDto[]): Promise<Product[]>;
  update(id: string, data: UpdateProductDto, expectedVersion: number): Promise<Product>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
  findAll(): Promise<Product[]>;
  findAllWithStock(): Promise<Product[]>;
  findAllWithStockPaginated(
    pagination: PaginationParams,
    filters?: ProductFilters
  ): Promise<{ products: Product[]; total: number }>;
}

