import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { StockGateway } from '@/adapters/gateways/stock.gateway';

@Injectable()
export class StockSchedulerService {
  private readonly logger = new Logger(StockSchedulerService.name);

  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    private readonly stockGateway: StockGateway,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStock() {
    this.logger.log('Running hourly low stock check...');

    const products = await this.productRepository.findAllWithStock();

    for (const product of products) {
      const totalStock = product.totalStock ?? 0;
      if (totalStock <= product.stockThreshold) {
        this.logger.warn(
          `Low stock: ${product.name} (${product.sku}) — ${totalStock}/${product.stockThreshold}`,
        );
        this.stockGateway.emitLowStockAlert(
          product.id,
          totalStock,
          product.stockThreshold,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async checkExpiringProducts() {
    this.logger.log('Running daily expiration check...');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const products = await this.productRepository.findAll();
    const expiring = products.filter(
      (p) => p.expirationDate && new Date(p.expirationDate) <= thirtyDaysFromNow,
    );

    if (expiring.length > 0) {
      this.logger.warn(`${expiring.length} products expiring within 30 days`);
      for (const product of expiring) {
        this.logger.warn(
          `Expiring: ${product.name} (${product.sku}) — expires ${product.expirationDate}`,
        );
      }
    }
  }
}
