import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { RedisCacheModule } from './infrastructure/cache/cache.module';
import { QueuesModule } from './infrastructure/queues/queues.module';
import { SchedulersModule } from './infrastructure/schedulers/schedulers.module';
import { AuthModule } from './adapters/auth/auth.module';
import { JwtAuthGuard } from './adapters/auth/jwt-auth.guard';
import { PermissionsGuard } from './adapters/auth/permissions.guard';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { AuthController } from './adapters/controllers/auth.controller';
import { ProductsController } from './adapters/controllers/products.controller';
import { InventoryController } from './adapters/controllers/inventory.controller';
import { LocationsController } from './adapters/controllers/locations.controller';
import { SuppliersController } from './adapters/controllers/suppliers.controller';
import { UsersController } from './adapters/controllers/users.controller';
import { CategoriesController } from './adapters/controllers/categories.controller';
import { HealthController } from './adapters/controllers/health.controller';
import { ReportsController } from './adapters/controllers/reports.controller';
import { BarcodeController } from './adapters/controllers/barcode.controller';
import { CustomersController } from './adapters/controllers/customers.controller';
import { PurchaseOrdersController } from './adapters/controllers/purchase-orders.controller';
import { SalesOrdersController } from './adapters/controllers/sales-orders.controller';
import { LotsController } from './adapters/controllers/lots.controller';

// Repositories
import { UserRepositoryImpl } from './adapters/repositories/user.repository.impl';
import { ProductRepositoryImpl } from './adapters/repositories/product.repository.impl';
import { InventoryMovementRepositoryImpl } from './adapters/repositories/inventory-movement.repository.impl';
import { LocationRepositoryImpl } from './adapters/repositories/location.repository.impl';
import { SupplierRepositoryImpl } from './adapters/repositories/supplier.repository.impl';
import { PermissionRepositoryImpl } from './adapters/repositories/permission.repository.impl';
import { CategoryRepositoryImpl } from './adapters/repositories/category.repository.impl';
import { CustomerRepositoryImpl } from './adapters/repositories/customer.repository.impl';
import { PurchaseOrderRepositoryImpl } from './adapters/repositories/purchase-order.repository.impl';
import { SalesOrderRepositoryImpl } from './adapters/repositories/sales-order.repository.impl';
import { LotRepositoryImpl } from './adapters/repositories/lot.repository.impl';

// Infrastructure providers
import { StockGateway } from './adapters/gateways/stock.gateway';
import { StockSchedulerService } from './infrastructure/schedulers/stock-scheduler.service';
import { StockAlertsProcessor } from './infrastructure/queues/stock-alerts.processor';
import { ReportsProcessor } from './infrastructure/queues/reports.processor';

// Use Cases
import { LoginUseCase } from './use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from './use-cases/auth/refresh-token.use-case';
import { CreateProductUseCase } from './use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from './use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from './use-cases/products/delete-product.use-case';
import { RegisterInventoryInUseCase } from './use-cases/inventory/register-inventory-in.use-case';
import { RegisterInventoryOutUseCase } from './use-cases/inventory/register-inventory-out.use-case';
import { TransferInventoryUseCase } from './use-cases/inventory/transfer-inventory.use-case';
import { GetStockUseCase } from './use-cases/inventory/get-stock.use-case';
import { RegisterAdjustmentUseCase } from './use-cases/inventory/register-adjustment.use-case';
import { GetMovementByIdUseCase } from './use-cases/inventory/get-movement-by-id.use-case';
import { CreateCategoryUseCase } from './use-cases/categories/create-category.use-case';
import { UpdateCategoryUseCase } from './use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from './use-cases/categories/delete-category.use-case';
import { CreateCustomerUseCase } from './use-cases/customers/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/customers/update-customer.use-case';
import { DeleteCustomerUseCase } from './use-cases/customers/delete-customer.use-case';
import { CreatePurchaseOrderUseCase } from './use-cases/purchase-orders/create-purchase-order.use-case';
import { UpdatePurchaseOrderStatusUseCase } from './use-cases/purchase-orders/update-purchase-order-status.use-case';
import { ReceivePurchaseOrderUseCase } from './use-cases/purchase-orders/receive-purchase-order.use-case';
import { CreateSalesOrderUseCase } from './use-cases/sales-orders/create-sales-order.use-case';
import { UpdateSalesOrderStatusUseCase } from './use-cases/sales-orders/update-sales-order-status.use-case';

// Repository tokens
const USER_REPOSITORY = 'IUserRepository';
const PRODUCT_REPOSITORY = 'IProductRepository';
const INVENTORY_MOVEMENT_REPOSITORY = 'IInventoryMovementRepository';
const LOCATION_REPOSITORY = 'ILocationRepository';
const SUPPLIER_REPOSITORY = 'ISupplierRepository';
const PERMISSION_REPOSITORY = 'IPermissionRepository';
const CATEGORY_REPOSITORY = 'ICategoryRepository';
const CUSTOMER_REPOSITORY = 'ICustomerRepository';
const PURCHASE_ORDER_REPOSITORY = 'IPurchaseOrderRepository';
const SALES_ORDER_REPOSITORY = 'ISalesOrderRepository';
const LOT_REPOSITORY = 'ILotRepository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
        level: process.env.LOG_LEVEL || 'info',
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    PrismaModule,
    RedisCacheModule,
    QueuesModule,
    SchedulersModule,
    AuthModule,
  ],
  controllers: [
    AuthController,
    ProductsController,
    InventoryController,
    LocationsController,
    SuppliersController,
    UsersController,
    CategoriesController,
    HealthController,
    ReportsController,
    BarcodeController,
    CustomersController,
    PurchaseOrdersController,
    SalesOrdersController,
    LotsController,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // Repositories
    {
      provide: USER_REPOSITORY,
      useClass: UserRepositoryImpl,
    },
    {
      provide: PRODUCT_REPOSITORY,
      useClass: ProductRepositoryImpl,
    },
    {
      provide: INVENTORY_MOVEMENT_REPOSITORY,
      useClass: InventoryMovementRepositoryImpl,
    },
    {
      provide: LOCATION_REPOSITORY,
      useClass: LocationRepositoryImpl,
    },
    {
      provide: SUPPLIER_REPOSITORY,
      useClass: SupplierRepositoryImpl,
    },
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PermissionRepositoryImpl,
    },
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryRepositoryImpl,
    },
    {
      provide: CUSTOMER_REPOSITORY,
      useClass: CustomerRepositoryImpl,
    },
    {
      provide: PURCHASE_ORDER_REPOSITORY,
      useClass: PurchaseOrderRepositoryImpl,
    },
    {
      provide: SALES_ORDER_REPOSITORY,
      useClass: SalesOrderRepositoryImpl,
    },
    {
      provide: LOT_REPOSITORY,
      useClass: LotRepositoryImpl,
    },
    // Infrastructure
    StockGateway,
    StockSchedulerService,
    StockAlertsProcessor,
    ReportsProcessor,
    // Use Cases
    LoginUseCase,
    RefreshTokenUseCase,
    CreateProductUseCase,
    UpdateProductUseCase,
    DeleteProductUseCase,
    RegisterInventoryInUseCase,
    RegisterInventoryOutUseCase,
    TransferInventoryUseCase,
    GetStockUseCase,
    RegisterAdjustmentUseCase,
    GetMovementByIdUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
    CreateCustomerUseCase,
    UpdateCustomerUseCase,
    DeleteCustomerUseCase,
    CreatePurchaseOrderUseCase,
    UpdatePurchaseOrderStatusUseCase,
    ReceivePurchaseOrderUseCase,
    CreateSalesOrderUseCase,
    UpdateSalesOrderStatusUseCase,
  ],
})
export class AppModule {}
