# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
# Root commands (using Turbo)
npm run dev          # Start all apps in development
npm run build        # Build all apps
npm run lint         # Lint all apps
npm run test         # Run all tests
npm run docker:up    # Start PostgreSQL via Docker
npm run docker:down  # Stop Docker services

# Backend (apps/api)
cd apps/api
npm run dev                    # Start NestJS in watch mode
npm test                       # Run Jest tests
npm run test:watch             # Run tests in watch mode
npm run test:cov               # Run tests with coverage
npm run prisma:generate        # Generate Prisma client
npm run prisma:migrate         # Run database migrations
npm run prisma:seed            # Seed database
npm run prisma:studio          # Open Prisma Studio GUI

# Frontend (apps/web)
cd apps/web
npm run dev                    # Start Next.js dev server
npm test                       # Run Vitest tests
npx playwright test            # Run E2E tests
npx playwright test --ui       # E2E tests in interactive mode
```

## Architecture Overview

### Monorepo Structure
- **Turborepo** manages the monorepo with workspaces in `apps/` and `packages/`
- `apps/api` - NestJS backend with Clean Architecture
- `apps/web` - Next.js frontend with Vertical Slice pattern
- `packages/tsconfig` - Shared TypeScript configurations

### Backend Clean Architecture (apps/api)

The backend follows Clean Architecture with three layers:

1. **Domain Layer** (`src/domain/`)
   - `entities/` - Domain entities with `BaseEntity` interface (audit fields: `createdAt/By`, `updatedAt/By`, `deletedAt/By`, `version`)
   - `ports/` - Repository and service interfaces (e.g., `IUserRepository`, `IProductRepository`)
   - `errors/` - Domain-specific errors (`NotFoundError`, `ValidationError`)

2. **Use Cases Layer** (`src/use-cases/`)
   - Business logic organized by domain (auth, products, inventory)
   - Each use case is a single-purpose injectable class with an `execute()` method
   - Use cases inject repository interfaces via tokens (e.g., `@Inject('IProductRepository')`)

3. **Adapters Layer** (`src/adapters/`)
   - `controllers/` - HTTP endpoints
   - `repositories/` - Prisma-based repository implementations
   - `auth/` - JWT guards, strategies, and decorators (`@Public()`, `@Permissions()`, `@CurrentUser()`)

**Dependency Injection Pattern:**
```typescript
// Repository tokens defined in app.module.ts
const PRODUCT_REPOSITORY = 'IProductRepository';
// Injected in use cases
@Inject('IProductRepository') private readonly productRepository: IProductRepository
```

### Frontend Vertical Slice Architecture (apps/web)

- **Modules** (`src/modules/`) - Feature-based organization (auth, products, inventory, locations, suppliers, reports)
  - Each module contains its own `hooks/` for TanStack Query hooks
  - Auth context in `modules/auth/context/auth-context.tsx` manages JWT tokens and permissions
- **Shared** (`src/shared/`) - Reusable components and utilities
  - `components/ui/` - Base UI components (Button, Input, Modal, Table, etc.)
  - `components/layout/` - Dashboard layout, sidebar
  - `lib/api-client.ts` - Axios wrapper with automatic token refresh

### Permission-Based Authorization

The system uses **permissions only** (no roles). Key permissions follow the pattern `resource.action`:
- `product.create/read/update/delete`
- `inventory.in/out/transfer/adjust/read`
- `location.create/read/update/delete`
- `supplier.create/read/update/delete`
- `user.manage`

Backend: Use `@Permissions('permission.name')` decorator on controller methods.
Frontend: Use `hasPermission('permission.name')` from `useAuth()` hook.

### Business Rules

- **Soft deletes only** - Entities use `deletedAt` field, no hard deletes
- **Optimistic locking** - `version` field on entities prevents concurrent update conflicts
- **Stock cannot be negative** - Inventory OUT operations validate available stock
- **All movements are atomic** - Inventory operations run in Prisma transactions
