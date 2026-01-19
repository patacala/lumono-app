import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    this.enableMiddleware();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  private enableMiddleware() {
    // Models without soft delete
    const modelsWithoutSoftDelete = ['InventoryMovement', 'RefreshToken'];

    // Middleware for soft delete filtering
    this.$use(async (params, next) => {
      // Skip soft delete for models that don't have deletedAt
      if (modelsWithoutSoftDelete.includes(params.model || '')) {
        return next(params);
      }

      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
        params.args.where = { ...params.args.where, deletedAt: null };
      }
      
      if (params.action === 'findMany') {
        if (params.args.where) {
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        } else {
          params.args.where = { deletedAt: null };
        }
      }

      return next(params);
    });

    // Middleware for optimistic locking (version increment on update)
    this.$use(async (params, next) => {
      if (params.action === 'update' || params.action === 'updateMany') {
        if (params.args.data?.version !== undefined) {
          params.args.data.version = { increment: 1 };
        }
      }
      
      return next(params);
    });
  }
}

