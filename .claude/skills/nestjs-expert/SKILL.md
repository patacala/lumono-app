# NestJS Expert — Lumono Backend

## Trigger
When working on files inside `apps/api/`

## Instructions

### Clean Architecture Enforcement
- **Domain layer** (`src/domain/`) must NEVER import from `src/adapters/` or `src/use-cases/`
- **Use cases** (`src/use-cases/`) may import from `src/domain/` but NEVER from `src/adapters/`
- **Adapters** (`src/adapters/`) may import from both `src/domain/` and `src/use-cases/`

### Dependency Injection
- Always inject repository interfaces via string tokens (e.g., `@Inject('IProductRepository')`)
- Register new tokens in `app.module.ts` providers array
- New use cases must be `@Injectable()` classes with a single `execute()` method

### DTOs and Validation
- Use `class-validator` decorators on all DTOs (`@IsString()`, `@IsNotEmpty()`, `@IsOptional()`, etc.)
- Use `class-transformer` decorators when needed (`@Type()`, `@Transform()`)
- DTOs go in `src/adapters/controllers/` alongside their controller or in a `dto/` subfolder

### Entity Patterns
- All mutable entities extend `BaseEntity` with audit fields: `createdAt/By`, `updatedAt/By`, `deletedAt/By`, `version`
- `InventoryMovement` is immutable — only creation audit fields, no updates/deletes
- Use domain errors from `src/domain/errors/` (never throw raw `HttpException` from use cases)

### Soft Deletes
- Never hard-delete records. Always set `deletedAt` and `deletedBy`
- All queries must filter `deletedAt: null` unless explicitly searching deleted records
- Return HTTP 204 on successful soft delete

### Optimistic Locking
- On updates, always check `version` matches and increment it
- Throw `OptimisticLockError` on version mismatch

### Prisma Transactions
- Use `prisma.$transaction()` for any operation that modifies multiple records
- Inventory movements (IN/OUT/TRANSFER) must always run in transactions

### Authorization
- Use `@Permissions('resource.action')` decorator on controller methods
- Use `@Public()` only for endpoints that truly require no auth (login, health)
- Use `@CurrentUser()` to get the authenticated user in controller methods

### Testing
- Unit test use cases by mocking repository interfaces
- Use `Test.createTestingModule()` for integration tests
- Follow existing test patterns in `*.spec.ts` files
