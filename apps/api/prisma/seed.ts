import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create default permissions
  const permissions = [
    // Product permissions
    { name: 'product.create', description: 'Create products', category: 'product' },
    { name: 'product.read', description: 'View products', category: 'product' },
    { name: 'product.update', description: 'Update products', category: 'product' },
    { name: 'product.delete', description: 'Delete products', category: 'product' },
    
    // Inventory permissions
    { name: 'inventory.in', description: 'Register inventory IN', category: 'inventory' },
    { name: 'inventory.out', description: 'Register inventory OUT', category: 'inventory' },
    { name: 'inventory.transfer', description: 'Transfer inventory', category: 'inventory' },
    { name: 'inventory.adjust', description: 'Adjust inventory', category: 'inventory' },
    { name: 'inventory.read', description: 'View inventory', category: 'inventory' },
    
    // Supplier permissions
    { name: 'supplier.create', description: 'Create suppliers', category: 'supplier' },
    { name: 'supplier.read', description: 'View suppliers', category: 'supplier' },
    { name: 'supplier.update', description: 'Update suppliers', category: 'supplier' },
    { name: 'supplier.delete', description: 'Delete suppliers', category: 'supplier' },
    
    // Location permissions
    { name: 'location.create', description: 'Create locations', category: 'location' },
    { name: 'location.read', description: 'View locations', category: 'location' },
    { name: 'location.update', description: 'Update locations', category: 'location' },
    { name: 'location.delete', description: 'Delete locations', category: 'location' },
    
    // Report permissions
    { name: 'report.read', description: 'View reports', category: 'report' },

    // User management permissions
    { name: 'user.manage', description: 'Manage users and permissions', category: 'user' },

    // Customer permissions
    { name: 'customer.create', description: 'Create customers', category: 'customer' },
    { name: 'customer.read', description: 'View customers', category: 'customer' },
    { name: 'customer.update', description: 'Update customers', category: 'customer' },
    { name: 'customer.delete', description: 'Delete customers', category: 'customer' },

    // Purchase Order permissions
    { name: 'purchase-order.create', description: 'Create purchase orders', category: 'purchase-order' },
    { name: 'purchase-order.read', description: 'View purchase orders', category: 'purchase-order' },
    { name: 'purchase-order.update', description: 'Update purchase orders', category: 'purchase-order' },
    { name: 'purchase-order.receive', description: 'Receive purchase orders', category: 'purchase-order' },

    // Sales Order permissions
    { name: 'sales-order.create', description: 'Create sales orders', category: 'sales-order' },
    { name: 'sales-order.read', description: 'View sales orders', category: 'sales-order' },
    { name: 'sales-order.update', description: 'Update sales orders', category: 'sales-order' },
  ];

  console.log('Creating permissions...');
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: permission,
    });
  }

  // Create admin user with all permissions
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  console.log('Creating admin user...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@lumono.com' },
    update: {},
    create: {
      email: 'admin@lumono.com',
      password: hashedPassword,
      name: 'Admin User',
      active: true,
    },
  });

  // Assign all permissions to admin
  console.log('Assigning permissions to admin...');
  const allPermissions = await prisma.permission.findMany();
  
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        permissionId: permission.id,
        createdBy: adminUser.id,
      },
    });
  }

  // Create sample locations
  console.log('Creating sample locations...');
  const mainWarehouse = await prisma.location.upsert({
    where: { code: 'WH-MAIN' },
    update: {},
    create: {
      code: 'WH-MAIN',
      name: 'Main Warehouse',
      type: 'warehouse',
      address: '123 Storage St.',
      description: 'Primary storage facility',
      createdBy: adminUser.id,
    },
  });

  await prisma.location.upsert({
    where: { code: 'STORE-01' },
    update: {},
    create: {
      code: 'STORE-01',
      name: 'Retail Store 01',
      type: 'store',
      address: '456 Retail Ave.',
      description: 'Main retail location',
      createdBy: adminUser.id,
    },
  });

  // Create sample supplier
  console.log('Creating sample supplier...');
  const supplier = await prisma.supplier.upsert({
    where: { code: 'SUP-001' },
    update: {},
    create: {
      code: 'SUP-001',
      name: 'Global Supplies Inc.',
      contact: 'John Doe',
      email: 'contact@globalsupplies.com',
      phone: '+1-555-0100',
      address: '789 Supplier Blvd.',
      createdBy: adminUser.id,
    },
  });

  // Create sample products
  console.log('Creating sample products...');
  const product1 = await prisma.product.upsert({
    where: { sku: 'PROD-001' },
    update: {},
    create: {
      sku: 'PROD-001',
      name: 'Sample Product 1',
      description: 'This is a sample product for testing',
      unitPrice: 99.99,
      supplierId: supplier.id,
      createdBy: adminUser.id,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: 'PROD-002' },
    update: {},
    create: {
      sku: 'PROD-002',
      name: 'Sample Product 2',
      description: 'Another sample product',
      unitPrice: 149.99,
      supplierId: supplier.id,
      createdBy: adminUser.id,
    },
  });

  // Create sample inventory movements
  console.log('Creating sample inventory movements...');
  await prisma.inventoryMovement.create({
    data: {
      productId: product1.id,
      type: 'IN',
      quantity: 100,
      destLocationId: mainWarehouse.id,
      referenceDocument: 'PO-2024-001',
      notes: 'Initial stock',
      unitPrice: 99.99,
      createdBy: adminUser.id,
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      productId: product2.id,
      type: 'IN',
      quantity: 50,
      destLocationId: mainWarehouse.id,
      referenceDocument: 'PO-2024-002',
      notes: 'Initial stock',
      unitPrice: 149.99,
      createdBy: adminUser.id,
    },
  });

  // Create sample customer
  console.log('Creating sample customer...');
  await prisma.customer.upsert({
    where: { code: 'CLI-001' },
    update: {},
    create: {
      code: 'CLI-001',
      name: 'Acme Corporation',
      email: 'orders@acme.com',
      phone: '+1-555-0200',
      address: '100 Business Rd.',
      taxId: '20-12345678-9',
      createdBy: adminUser.id,
    },
  });

  console.log('Seed completed successfully!');
  console.log('---');
  console.log('Admin credentials:');
  console.log('Email: admin@lumono.com');
  console.log('Password: admin123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

