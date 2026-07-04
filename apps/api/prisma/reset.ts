import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Reset script: Deletes all business data but preserves system tables
 * (permissions, users, user_permissions).
 *
 * Usage:
 *   npx ts-node prisma/reset.ts
 *   npm run prisma:reset
 */
async function main() {
  console.log('=== Lumono Data Reset ===');
  console.log('');
  console.log('This will DELETE all business data:');
  console.log('  - Sales orders & items');
  console.log('  - Purchase orders, items & receipts');
  console.log('  - Inventory movements');
  console.log('  - Lots');
  console.log('  - Products & categories');
  console.log('  - Customers');
  console.log('  - Suppliers');
  console.log('  - Locations');
  console.log('  - Refresh tokens');
  console.log('');
  console.log('  - Non-admin users & their permissions');
  console.log('');
  console.log('PRESERVED:');
  console.log('  - Admin user (admin@lumono.com)');
  console.log('  - Permissions catalog');
  console.log('');

  // Delete in order respecting foreign key constraints
  // (children first, parents last)
  console.log('Deleting sales order items...');
  const salesOrderItems = await prisma.salesOrderItem.deleteMany();
  console.log(`  ${salesOrderItems.count} records deleted`);

  console.log('Deleting sales orders...');
  const salesOrders = await prisma.salesOrder.deleteMany();
  console.log(`  ${salesOrders.count} records deleted`);

  console.log('Deleting purchase order receipt items...');
  const receiptItems = await prisma.purchaseOrderReceiptItem.deleteMany();
  console.log(`  ${receiptItems.count} records deleted`);

  console.log('Deleting purchase order receipts...');
  const receipts = await prisma.purchaseOrderReceipt.deleteMany();
  console.log(`  ${receipts.count} records deleted`);

  console.log('Deleting purchase order items...');
  const purchaseOrderItems = await prisma.purchaseOrderItem.deleteMany();
  console.log(`  ${purchaseOrderItems.count} records deleted`);

  console.log('Deleting purchase orders...');
  const purchaseOrders = await prisma.purchaseOrder.deleteMany();
  console.log(`  ${purchaseOrders.count} records deleted`);

  console.log('Deleting lots...');
  const lots = await prisma.lot.deleteMany();
  console.log(`  ${lots.count} records deleted`);

  console.log('Deleting inventory movements...');
  const movements = await prisma.inventoryMovement.deleteMany();
  console.log(`  ${movements.count} records deleted`);

  console.log('Deleting products...');
  const products = await prisma.product.deleteMany();
  console.log(`  ${products.count} records deleted`);

  console.log('Deleting categories...');
  const categories = await prisma.category.deleteMany();
  console.log(`  ${categories.count} records deleted`);

  console.log('Deleting customers...');
  const customers = await prisma.customer.deleteMany();
  console.log(`  ${customers.count} records deleted`);

  console.log('Deleting suppliers...');
  const suppliers = await prisma.supplier.deleteMany();
  console.log(`  ${suppliers.count} records deleted`);

  console.log('Deleting locations...');
  const locations = await prisma.location.deleteMany();
  console.log(`  ${locations.count} records deleted`);

  console.log('Deleting refresh tokens...');
  const tokens = await prisma.refreshToken.deleteMany();
  console.log(`  ${tokens.count} records deleted`);

  // Delete non-admin users (cascade deletes their user_permissions)
  console.log('Deleting non-admin users & their permissions...');
  const nonAdminPermissions = await prisma.userPermission.deleteMany({
    where: { user: { email: { not: 'admin@lumono.com' } } },
  });
  console.log(`  ${nonAdminPermissions.count} user permissions deleted`);

  const nonAdminUsers = await prisma.user.deleteMany({
    where: { email: { not: 'admin@lumono.com' } },
  });
  console.log(`  ${nonAdminUsers.count} users deleted`);

  console.log('');
  console.log('Reset completed. Admin user (admin@lumono.com) and permissions catalog preserved.');
}

main()
  .catch((e) => {
    console.error('Reset failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
