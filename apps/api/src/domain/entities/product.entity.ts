import { BaseEntity } from './base.entity';

export interface StockByLocation {
  locationId: string;
  locationName: string;
  locationCode: string;
  quantity: number;
}

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  barcode?: string;
  imageUrl?: string;
  brand?: string;
  salePrice?: number;
  status: string;
  taxRate?: number;
  supplierId?: string;
  supplierName?: string;
  categoryId?: string;
  categoryName?: string;
  stockThreshold: number;
  unit: string;
  expirationDate?: Date;
  totalStock?: number;
  stockByLocation?: StockByLocation[];
}

