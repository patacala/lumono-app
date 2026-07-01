import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { StockGateway } from '@/adapters/gateways/stock.gateway';

export interface StockAlertJobData {
  productId: string;
}

@Processor('stock-alerts')
export class StockAlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(StockAlertsProcessor.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IInventoryMovementRepository')
    private readonly inventoryMovementRepository: IInventoryMovementRepository,
    private readonly stockGateway: StockGateway,
  ) {
    super();
  }

  async process(job: Job<StockAlertJobData>): Promise<void> {
    const { productId } = job.data;
    this.logger.log(`Checking stock alert for product: ${productId}`);

    const product = await this.productRepository.findById(productId);
    if (!product) return;

    const totalStock = await this.inventoryMovementRepository.getStockByProduct(productId);

    if (totalStock <= product.stockThreshold) {
      this.logger.warn(
        `Low stock alert: Product ${product.name} (${product.sku}) has ${totalStock} units (threshold: ${product.stockThreshold})`,
      );
      this.stockGateway.emitLowStockAlert(productId, totalStock, product.stockThreshold);
    }
  }
}
