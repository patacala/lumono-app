# Setup Guide - Lumono Inventory System

## Initial Setup (First Time)

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL locally

PostgreSQL 16 must be running on `localhost:5432` before the API starts. Create the dev role and database:

```sql
CREATE USER lumono WITH PASSWORD 'lumono_dev_password';
CREATE DATABASE lumono_inventory OWNER lumono;
```

Redis on `localhost:6379` is used by the stock-alert and report queues. The API still boots without it; cache calls are skipped.

### 3. Create Environment Files

#### Backend: `apps/api/.env`

```bash
cp apps/api/.env.example apps/api/.env
```

#### Frontend: `apps/web/.env.local`

```bash
cp apps/web/.env.example apps/web/.env.local
```

### 4. Setup Backend Database

```bash
cd apps/api

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with sample data
npm run prisma:seed
```

### 5. Start Development Servers

#### Terminal 1 - Backend
```bash
cd apps/api
npm run dev
```

Backend will run on: http://localhost:3001

You should see: `🚀 API server running on http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd apps/web
npm run dev
```

Frontend will run on: http://localhost:3000

## Access the Application

1. Open browser: http://localhost:3000
2. Login with default credentials:
   - Email: `admin@lumono.com`
   - Password: `admin123`

## Project Architecture Verification

### Backend Structure (Clean Architecture)
```
apps/api/src/
├── domain/           ✓ Entities, Ports, Errors
├── use-cases/        ✓ Business Logic
├── adapters/         ✓ Controllers, Repositories, Auth
├── infrastructure/   ✓ Prisma Service
└── shared/          ✓ Filters, Utils
```

### Frontend Structure (Vertical Slices)
```
apps/web/src/
├── modules/         ✓ Auth, Products, Inventory
├── shared/          ✓ API Client, Components
└── app/            ✓ Next.js Pages
```

## Key Features Implemented

### ✅ Core Features
- [x] JWT Authentication with refresh token rotation
- [x] Permission-based authorization (NO roles)
- [x] Products CRUD with permissions
- [x] Inventory movements (IN, OUT, TRANSFER)
- [x] Stock validation (never negative)
- [x] Locations and Suppliers management
- [x] User and permission management

### ✅ Technical Requirements
- [x] Clean Architecture (Backend)
- [x] Repository Pattern
- [x] Optimistic Locking (version field)
- [x] Soft Deletes
- [x] Audit Fields (createdBy, updatedAt, etc.)
- [x] Database Transactions
- [x] TypeScript throughout
- [x] Monorepo with Turbo

### ✅ Testing
- [x] Backend: Jest unit tests
- [x] Frontend: Vitest tests
- [x] E2E: Playwright tests

## Common Commands

### Database
```bash
# Open Prisma Studio (Database GUI)
cd apps/api
npm run prisma:studio

# Reset database (WARNING: deletes all data)
npm run prisma:migrate reset

# Create new migration
npm run prisma:migrate dev --name migration_name
```

### Testing
```bash
# Backend tests
cd apps/api
npm test
npm run test:cov

# Frontend tests
cd apps/web
npm test

# E2E tests
cd apps/web
npx playwright test
npx playwright test --ui
```

## Troubleshooting

### Database Connection Issues
1. Confirm PostgreSQL is running on `localhost:5432`
2. Confirm the role `lumono` and database `lumono_inventory` exist
3. Verify `DATABASE_URL` in `apps/api/.env`

### Port Already in Use
- Backend (3001): Kill process or change PORT in `.env`
- Frontend (3000): Kill process or change port in `next.config.js`

### Prisma Issues
```bash
cd apps/api
npm run prisma:generate  # Regenerate client
rm -rf node_modules/.prisma  # Clear cache
npm install
```

### Frontend Build Errors
```bash
cd apps/web
rm -rf .next node_modules
npm install
npm run dev
```

## Production Build

```bash
# Build all apps
npm run build

# Start backend in production
cd apps/api
npm run start:prod

# Start frontend in production
cd apps/web
npm run start
```

## Next Steps

1. Test the login flow
2. Create a product
3. Register inventory IN
4. Check stock levels
5. Transfer inventory between locations
6. Review audit trails

## Support

For issues or questions, refer to:
- Main README.md
- Backend: apps/api/README.md (if exists)
- Frontend: apps/web/README.md (if exists)

