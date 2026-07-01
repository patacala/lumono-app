import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';

export interface ReportJobData {
  type: 'inventory-summary' | 'movements-history';
  filters?: Record<string, any>;
  requestedBy: string;
}

@Processor('reports')
export class ReportsProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportsProcessor.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
  ) {
    super();
  }

  async process(job: Job<ReportJobData>): Promise<any> {
    const { type, requestedBy } = job.data;
    this.logger.log(`Generating ${type} report for user: ${requestedBy}`);

    switch (type) {
      case 'inventory-summary':
        return this.generateInventorySummary();
      case 'movements-history':
        return this.generateMovementsHistory(job.data.filters);
      default:
        this.logger.warn(`Unknown report type: ${type}`);
    }
  }

  private async generateInventorySummary() {
    const products = await this.productRepository.findAllWithStock();
    return {
      generatedAt: new Date().toISOString(),
      totalProducts: products.length,
      products: products.map((p) => ({
        id: p.id,
        sku: p.sku,
        name: p.name,
        totalStock: p.totalStock ?? 0,
        stockThreshold: p.stockThreshold,
        isLowStock: (p.totalStock ?? 0) <= p.stockThreshold,
      })),
    };
  }

  private async generateMovementsHistory(_filters?: Record<string, any>) {
    const movements = await this.inventoryMovementRepository.findAll();
    return {
      generatedAt: new Date().toISOString(),
      totalMovements: movements.length,
      movements,
    };
  }
}
