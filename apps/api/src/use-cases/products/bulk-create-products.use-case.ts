import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository, CreateProductDto } from '@/domain/ports/repositories/product.repository';

export interface BulkCreateResult {
  created: number;
  errors: { row: number; message: string }[];
}

@Injectable()
export class BulkCreateProductsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(products: CreateProductDto[]): Promise<BulkCreateResult> {
    const errors: { row: number; message: string }[] = [];
    const validProducts: { index: number; dto: CreateProductDto }[] = [];

    // Pre-validate and generate SKUs
    let nextSeq = await this.productRepository.getNextSkuSequence();

    for (let i = 0; i < products.length; i++) {
      const dto = products[i];

      if (!dto.name || !dto.name.trim()) {
        errors.push({ row: i + 1, message: 'El nombre es requerido' });
        continue;
      }

      if (dto.unitPrice === undefined || dto.unitPrice === null || isNaN(dto.unitPrice) || dto.unitPrice < 0) {
        errors.push({ row: i + 1, message: 'El precio debe ser un numero mayor o igual a 0' });
        continue;
      }

      let sku = dto.sku?.trim();

      if (!sku) {
        sku = `PROD-${nextSeq.toString().padStart(5, '0')}`;
        nextSeq++;
      } else {
        const existing = await this.productRepository.findBySku(sku);
        if (existing) {
          errors.push({ row: i + 1, message: `Ya existe un producto con SKU ${sku}` });
          continue;
        }
      }

      // Check barcode uniqueness if provided
      if (dto.barcode?.trim()) {
        const existingBarcode = await this.productRepository.findByBarcode(dto.barcode.trim());
        if (existingBarcode) {
          errors.push({ row: i + 1, message: `Ya existe un producto con codigo de barras ${dto.barcode}` });
          continue;
        }
      }

      validProducts.push({ index: i, dto: { ...dto, sku } });
    }

    // Check for duplicate SKUs within the batch
    const skusSeen = new Map<string, number>();
    const deduped: typeof validProducts = [];
    for (const item of validProducts) {
      const sku = item.dto.sku!;
      if (skusSeen.has(sku)) {
        errors.push({ row: item.index + 1, message: `SKU ${sku} duplicado en el archivo (ver fila ${skusSeen.get(sku)! + 1})` });
      } else {
        skusSeen.set(sku, item.index);
        deduped.push(item);
      }
    }

    if (deduped.length === 0) {
      return { created: 0, errors };
    }

    // Create all valid products in a transaction
    const created = await this.productRepository.createMany(deduped.map((p) => p.dto));

    return { created: created.length, errors };
  }
}
