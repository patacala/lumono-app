import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
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

// Repositories
import { UserRepositoryImpl } from './adapters/repositories/user.repository.impl';
import { ProductRepositoryImpl } from './adapters/repositories/product.repository.impl';
import { InventoryMovementRepositoryImpl } from './adapters/repositories/inventory-movement.repository.impl';
import { LocationRepositoryImpl } from './adapters/repositories/location.repository.impl';
import { SupplierRepositoryImpl } from './adapters/repositories/supplier.repository.impl';
import { PermissionRepositoryImpl } from './adapters/repositories/permission.repository.impl';
import { CategoryRepositoryImpl } from './adapters/repositories/category.repository.impl';

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
import { CreateCategoryUseCase } from './use-cases/categories/create-category.use-case';
import { UpdateCategoryUseCase } from './use-cases/categories/update-category.use-case';
import { DeleteCategoryUseCase } from './use-cases/categories/delete-category.use-case';

// Repository tokens
const USER_REPOSITORY = 'IUserRepository';
const PRODUCT_REPOSITORY = 'IProductRepository';
const INVENTORY_MOVEMENT_REPOSITORY = 'IInventoryMovementRepository';
const LOCATION_REPOSITORY = 'ILocationRepository';
const SUPPLIER_REPOSITORY = 'ISupplierRepository';
const PERMISSION_REPOSITORY = 'IPermissionRepository';
const CATEGORY_REPOSITORY = 'ICategoryRepository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
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
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    DeleteCategoryUseCase,
  ],
})
export class AppModule {}

