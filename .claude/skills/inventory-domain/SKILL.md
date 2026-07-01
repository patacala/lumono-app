# Inventory Domain Rules — Lumono

## Trigger
When working on use cases (`src/use-cases/`) or domain entities (`src/domain/entities/`)

## Instructions

### Stock Rules
- **Stock can NEVER be negative** — validate available stock before OUT and TRANSFER operations
- Throw `InsufficientStockError` when attempting to remove more stock than available
- Stock is calculated from inventory movements, not stored as a denormalized field

### Inventory Movement Types
| Type | Origin Location | Destination Location | Effect |
|------|----------------|---------------------|--------|
| `IN` | — | Required | +quantity at destination |
| `OUT` | Required | — | -quantity at origin |
| `TRANSFER` | Required | Required | -quantity at origin, +quantity at destination |
| `ADJUSTMENT` | Optional | Optional | Corrects stock discrepancies |

### Movement Immutability
- `InventoryMovement` records are **immutable** — never update or delete them
- To correct a mistake, create a compensating movement (e.g., ADJUSTMENT)
- No `updatedAt/By`, `deletedAt/By`, or `version` fields on movements

### Atomicity
- All inventory operations MUST run inside a Prisma transaction
- The transaction must:
  1. Validate current stock levels
  2. Create the `InventoryMovement` record
  3. Any side effects (notifications, alerts)

### Domain Errors
Use the appropriate domain error from `src/domain/errors/`:
- `InsufficientStockError` — not enough stock for OUT/TRANSFER
- `NotFoundError` — product or location doesn't exist
- `ValidationError` — invalid input (negative quantity, missing fields)
- `OptimisticLockError` — concurrent update conflict
- `ConflictError` — duplicate SKU, duplicate location code

### Use Case Pattern
```typescript
@Injectable()
export class SomeUseCase {
  constructor(
    @Inject('IRepository') private readonly repo: IRepository,
  ) {}

  async execute(input: InputDto): Promise<OutputType> {
    // 1. Validate input
    // 2. Check business rules
    // 3. Execute in transaction if needed
    // 4. Return result
  }
}
```

### Product Rules
- SKU must be unique (case-insensitive)
- `stockThreshold` defines the low-stock alert level (default: 10)
- `unit` is the measurement unit (default: "unid")
- Soft delete a product only if no pending movements reference it
