# Lumono - Inventory Management System

A modern, permission-based inventory management system built as a monolith with Clean Architecture principles.

## 🏗️ Architecture

- **Backend**: NestJS with Clean Architecture (Domain, Use Cases, Adapters)
- **Frontend**: Next.js 16 with Vertical Slice pattern
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with access/refresh token rotation
- **Authorization**: Permission-based (NO roles)

## 📋 Requirements

- Node.js >= 20
- npm >= 10
- PostgreSQL 16 running on localhost:5432
- Redis on localhost:6379 for stock-alert and report queues (the API still starts if Redis is down; cache is skipped)

## 🚀 Quick Start

1. **Install dependencies**
```bash
npm install
```

2. **Create the local database**
```sql
CREATE USER lumono WITH PASSWORD 'lumono_dev_password';
CREATE DATABASE lumono_inventory OWNER lumono;
```

3. **Configure environment**
```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

4. **Setup database**
```bash
cd apps/api
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. **Start backend**
```bash
cd apps/api
npm run dev
```

6. **Start frontend** (in a new terminal)
```bash
cd apps/web
npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:3001

## 🔐 Default Credentials

```
Email: admin@lumono.com
Password: admin123
```

The admin user has all permissions by default.

## 📚 Project Structure

```
lumono/
├── apps/
│   ├── api/                          # NestJS Backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── seed.ts               # Seed data
│   │   └── src/
│   │       ├── domain/               # Domain layer
│   │       │   ├── entities/         # Domain entities
│   │       │   ├── ports/            # Interfaces (repositories, services)
│   │       │   └── errors/           # Domain errors
│   │       ├── use-cases/            # Business logic
│   │       │   ├── auth/             # Auth use cases
│   │       │   ├── products/         # Product use cases
│   │       │   └── inventory/        # Inventory use cases
│   │       ├── adapters/             # Adapters layer
│   │       │   ├── controllers/      # HTTP controllers
│   │       │   ├── repositories/     # Repository implementations
│   │       │   └── auth/             # Auth guards, strategies
│   │       ├── infrastructure/       # Infrastructure
│   │       │   └── prisma/           # Prisma service
│   │       └── shared/               # Shared utilities
│   │
│   └── web/                          # Next.js Frontend
│       └── src/
│           ├── app/                  # Next.js app directory
│           ├── modules/              # Feature modules (vertical slices)
│           │   ├── auth/             # Auth module
│           │   ├── products/         # Products module
│           │   ├── inventory/        # Inventory module
│           │   └── reports/          # Reports module
│           └── shared/               # Shared components, utils
│
└── packages/
    └── tsconfig/                     # Shared TypeScript configs
```

## 🔑 Permissions System

This system uses **permissions only** (no roles). Each user is assigned specific permissions.

### Available Permissions

#### Product Permissions
- `product.create` - Create products
- `product.read` - View products
- `product.update` - Update products
- `product.delete` - Delete products

#### Inventory Permissions
- `inventory.in` - Register inventory IN
- `inventory.out` - Register inventory OUT
- `inventory.transfer` - Transfer inventory between locations
- `inventory.adjust` - Manual inventory adjustments
- `inventory.read` - View inventory data

#### Supplier Permissions
- `supplier.create` - Create suppliers
- `supplier.read` - View suppliers
- `supplier.update` - Update suppliers
- `supplier.delete` - Delete suppliers

#### Location Permissions
- `location.create` - Create locations
- `location.read` - View locations
- `location.update` - Update locations
- `location.delete` - Delete locations

#### Report Permissions
- `report.read` - View reports

#### User Management
- `user.manage` - Manage users and permissions

## 🔄 API Endpoints

### Authentication
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Products
- `GET /products` - List all products (requires: `product.read`)
- `GET /products/:id` - Get product by ID (requires: `product.read`)
- `POST /products` - Create product (requires: `product.create`)
- `PUT /products/:id` - Update product (requires: `product.update`)
- `DELETE /products/:id` - Delete product (requires: `product.delete`)

### Inventory
- `POST /inventory/in` - Register inventory IN (requires: `inventory.in`)
- `POST /inventory/out` - Register inventory OUT (requires: `inventory.out`)
- `POST /inventory/transfer` - Transfer inventory (requires: `inventory.transfer`)
- `GET /inventory/stock` - Get stock levels (requires: `inventory.read`)
- `GET /inventory/movements` - Get movements history (requires: `inventory.read`)

### Locations
- `GET /locations` - List locations (requires: `location.read`)
- `POST /locations` - Create location (requires: `location.create`)
- `PUT /locations/:id` - Update location (requires: `location.update`)
- `DELETE /locations/:id` - Delete location (requires: `location.delete`)

### Suppliers
- `GET /suppliers` - List suppliers (requires: `supplier.read`)
- `POST /suppliers` - Create supplier (requires: `supplier.create`)
- `PUT /suppliers/:id` - Update supplier (requires: `supplier.update`)
- `DELETE /suppliers/:id` - Delete supplier (requires: `supplier.delete`)

### Users
- `GET /users` - List users (requires: `user.manage`)
- `GET /users/:id` - Get user with permissions (requires: `user.manage`)
- `POST /users` - Create user (requires: `user.manage`)
- `POST /users/:userId/permissions` - Assign permission (requires: `user.manage`)
- `POST /users/:userId/permissions/:permissionId/revoke` - Revoke permission (requires: `user.manage`)

## 🔒 Business Rules

### Stock Management
1. **Stock cannot be negative** - OUT operations validate available stock
2. **All movements are recorded** - Every stock change creates an inventory movement
3. **Movements are atomic** - All operations run in database transactions
4. **Transfers validate origin** - Stock is checked at origin location before transfer
5. **Manual adjustments require permission** - `inventory.adjust` permission required

### Data Management
1. **Soft deletes only** - No hard deletes, uses `deletedAt` field
2. **Optimistic locking** - Version field prevents concurrent update conflicts
3. **Audit trails** - All entities track who/when for create, update, delete

## 🧪 Testing

### Backend Tests (Jest)
```bash
cd apps/api
npm test
npm run test:cov  # with coverage
```

### Frontend Tests (Vitest)
```bash
cd apps/web
npm test
```

### E2E Tests (Playwright)
```bash
cd apps/web
npx playwright test
npx playwright test --ui  # interactive mode
```

## 📦 Available Scripts

### Root
- `npm run dev` - Start all apps in development
- `npm run build` - Build all apps
- `npm run lint` - Lint all apps

### Backend (apps/api)
- `npm run dev` - Start in watch mode
- `npm run build` - Build for production
- `npm run start:prod` - Run production build
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run migrations
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed database

### Frontend (apps/web)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build

## 🛡️ Security

- JWT access tokens: 15 minutes TTL
- JWT refresh tokens: 7 days TTL (with rotation)
- Passwords hashed with bcrypt
- All endpoints protected by default
- Permission validation on server-side
- CORS enabled for frontend origin

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://lumono:password@localhost:5432/lumono_inventory"
JWT_ACCESS_SECRET="your_access_secret"
JWT_REFRESH_SECRET="your_refresh_secret"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
PORT=3001
```

### Frontend (.env)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

## 🚧 Out of Scope

This system explicitly does NOT include:
- Mobile apps
- Offline mode
- Background jobs
- Event-driven architecture
- Microservices
- Third-party ERP integrations
- AI, IoT, forecasting, or RFID

## 📄 License

MIT

## 👥 Contributing

This is a demonstration project following strict architectural guidelines. See the prompt document for complete specifications.

