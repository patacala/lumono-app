import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { AdjustmentReason } from '@/domain/entities/inventory-movement.entity';
import { RegisterAdjustmentUseCase } from './register-adjustment.use-case';
import { RegisterInventoryInUseCase } from './register-inventory-in.use-case';

export type BulkMovementType = 'ADJUSTMENT' | 'IN';

export interface BulkMovementRow {
  sku: string;
  locationName: string;
  quantity: number;
  type?: BulkMovementType;
  reason?: AdjustmentReason;
  notes?: string;
}

export interface BulkMovementResult {
  created: number;
  errors: { row: number; message: string }[];
}

/**
 * Registers many inventory movements in one shot (initial stock load).
 * Rows reference products by SKU and locations by name or code — both must
 * already exist. Each row is processed independently: a failing row is
 * reported without rolling back the successful ones (partial import).
 */
@Injectable()
export class BulkRegisterMovementsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ILocationRepository')
    private readonly locationRepository: ILocationRepository,
    private readonly registerAdjustmentUseCase: RegisterAdjustmentUseCase,
    private readonly registerInUseCase: RegisterInventoryInUseCase,
  ) {}

  async execute(rows: BulkMovementRow[], createdBy?: string): Promise<BulkMovementResult> {
    const errors: { row: number; message: string }[] = [];
    let created = 0;

    // Load locations once and index by name and code (case-insensitive)
    const locations = await this.locationRepository.findAll();
    const locationByKey = new Map<string, string>();
    for (const loc of locations) {
      locationByKey.set(loc.name.trim().toLowerCase(), loc.id);
      if (loc.code) locationByKey.set(loc.code.trim().toLowerCase(), loc.id);
    }

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const row = rows[i];

      const sku = row.sku?.trim();
      if (!sku) {
        errors.push({ row: rowNum, message: 'El SKU es requerido' });
        continue;
      }

      if (!Number.isFinite(row.quantity) || row.quantity <= 0) {
        errors.push({ row: rowNum, message: 'La cantidad debe ser un numero mayor a 0' });
        continue;
      }

      const product = await this.productRepository.findBySku(sku);
      if (!product) {
        errors.push({ row: rowNum, message: `No existe un producto con SKU ${sku}` });
        continue;
      }

      const locationKey = row.locationName?.trim().toLowerCase();
      const locationId = locationKey ? locationByKey.get(locationKey) : undefined;
      if (!locationId) {
        errors.push({ row: rowNum, message: `No existe la ubicacion "${row.locationName}"` });
        continue;
      }

      try {
        if (row.type === 'IN') {
          await this.registerInUseCase.execute({
            productId: product.id,
            destLocationId: locationId,
            quantity: row.quantity,
            subType: 'PURCHASE' as any,
            notes: row.notes,
            createdBy,
          });
        } else {
          await this.registerAdjustmentUseCase.execute({
            productId: product.id,
            locationId,
            quantity: row.quantity,
            subType: 'POSITIVE_ADJUSTMENT',
            reason: row.reason || 'INITIAL_LOAD',
            notes: row.notes,
            createdBy,
          });
        }
        created++;
      } catch (err: any) {
        errors.push({ row: rowNum, message: err?.message || 'Error al registrar el movimiento' });
      }
    }

    return { created, errors };
  }
}
