# Prisma Conventions — Lumono Database

## Trigger
When editing `*.prisma` files or repository implementations in `src/adapters/repositories/`

## Instructions

### Audit Fields (Required on all mutable models)
Every mutable model MUST include:
```prisma
createdAt   DateTime  @default(now()) @map("created_at")
createdBy   String?   @map("created_by")
updatedAt   DateTime  @updatedAt @map("updated_at")
updatedBy   String?   @map("updated_by")
deletedAt   DateTime? @map("deleted_at")
deletedBy   String?   @map("deleted_by")
version     Int       @default(1)
```

### Immutable Models (e.g., InventoryMovement)
Only creation audit fields — no `updatedAt/By`, `deletedAt/By`, or `version`:
```prisma
createdAt   DateTime  @default(now()) @map("created_at")
createdBy   String?   @map("created_by")
```

### Naming Conventions
- Model names: PascalCase singular (`Product`, `Location`)
- Table mapping: snake_case plural (`@@map("products")`, `@@map("locations")`)
- Column mapping: snake_case (`@map("created_at")`)
- ID fields: `String @id @default(uuid())`

### Relationships
- Use `SetNull` for optional soft-deletable references (e.g., `supplier` on `Product`)
- Use `Restrict` for required references that should prevent deletion (e.g., `product` on `InventoryMovement`)
- Use `Cascade` only for true ownership (e.g., `RefreshToken` → `User`)

### Indexes
- Add `@@index` for frequently queried foreign keys
- Add `@@index` for fields used in filters (e.g., `deletedAt`, `type`)
- Use `@@unique` for compound uniqueness constraints

### Repository Implementations
- Always filter `deletedAt: null` in queries (soft delete pattern)
- Use `prisma.$transaction()` for multi-record operations
- Map Prisma results to domain entities in repository methods
- Handle `version` field for optimistic locking on updates

### Migrations
- After editing `schema.prisma`, run `npx prisma migrate dev --name descriptive_name`
- Always run `npx prisma generate` after schema changes
- Never edit migration files manually after they've been applied
