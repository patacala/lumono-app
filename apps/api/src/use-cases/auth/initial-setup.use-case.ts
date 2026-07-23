import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

// NOTE: PrismaService applies a global middleware that rewrites every
// findUnique into findFirst (for soft-delete filtering). findFirst does not
// support Prisma's compound-unique object syntax (e.g. `userId_permissionId`),
// so this use case intentionally avoids findUnique/compound keys everywhere
// and only queries by plain scalar fields.
@Injectable()
export class InitialSetupUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const result = {
      permissionsCreated: 0,
      permissionsSkipped: 0,
      userCreated: false,
      userAlreadyExisted: false,
      permissionsAssigned: 0,
    };

    // 1. Create permissions (skip if already exist)
    const permissions = [
      { name: 'product.create', description: 'Create products', category: 'product' },
      { name: 'product.read', description: 'View products', category: 'product' },
      { name: 'product.update', description: 'Update products', category: 'product' },
      { name: 'product.delete', description: 'Delete products', category: 'product' },
      { name: 'inventory.in', description: 'Register inventory IN', category: 'inventory' },
      { name: 'inventory.out', description: 'Register inventory OUT', category: 'inventory' },
      { name: 'inventory.transfer', description: 'Transfer inventory', category: 'inventory' },
      { name: 'inventory.adjust', description: 'Adjust inventory', category: 'inventory' },
      { name: 'inventory.read', description: 'View inventory', category: 'inventory' },
      { name: 'supplier.create', description: 'Create suppliers', category: 'supplier' },
      { name: 'supplier.read', description: 'View suppliers', category: 'supplier' },
      { name: 'supplier.update', description: 'Update suppliers', category: 'supplier' },
      { name: 'supplier.delete', description: 'Delete suppliers', category: 'supplier' },
      { name: 'location.create', description: 'Create locations', category: 'location' },
      { name: 'location.read', description: 'View locations', category: 'location' },
      { name: 'location.update', description: 'Update locations', category: 'location' },
      { name: 'location.delete', description: 'Delete locations', category: 'location' },
      { name: 'report.read', description: 'View reports', category: 'report' },
      { name: 'user.manage', description: 'Manage users and permissions', category: 'user' },
      { name: 'customer.create', description: 'Create customers', category: 'customer' },
      { name: 'customer.read', description: 'View customers', category: 'customer' },
      { name: 'customer.update', description: 'Update customers', category: 'customer' },
      { name: 'customer.delete', description: 'Delete customers', category: 'customer' },
      { name: 'purchase-order.create', description: 'Create purchase orders', category: 'purchase-order' },
      { name: 'purchase-order.read', description: 'View purchase orders', category: 'purchase-order' },
      { name: 'purchase-order.update', description: 'Update purchase orders', category: 'purchase-order' },
      { name: 'purchase-order.receive', description: 'Receive purchase orders', category: 'purchase-order' },
      { name: 'sales-order.create', description: 'Create sales orders', category: 'sales-order' },
      { name: 'sales-order.read', description: 'View sales orders', category: 'sales-order' },
      { name: 'sales-order.update', description: 'Update sales orders', category: 'sales-order' },
      { name: 'category.create', description: 'Create categories', category: 'category' },
      { name: 'category.read', description: 'View categories', category: 'category' },
      { name: 'category.update', description: 'Update categories', category: 'category' },
      { name: 'category.delete', description: 'Delete categories', category: 'category' },
      { name: 'lot.create', description: 'Create lots', category: 'lot' },
      { name: 'lot.read', description: 'View lots', category: 'lot' },
      { name: 'lot.update', description: 'Update lots', category: 'lot' },
    ];

    for (const permission of permissions) {
      const existing = await this.prisma.permission.findFirst({
        where: { name: permission.name },
      });

      if (!existing) {
        await this.prisma.permission.create({ data: permission });
        result.permissionsCreated++;
      } else {
        result.permissionsSkipped++;
      }
    }

    // 2. Find or create admin user
    let adminUser = await this.prisma.user.findFirst({
      where: { email: 'admin@lumono.com' },
    });

    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      adminUser = await this.prisma.user.create({
        data: {
          email: 'admin@lumono.com',
          name: 'Admin',
          password: hashedPassword,
          active: true,
        },
      });
      result.userCreated = true;
    } else {
      result.userAlreadyExisted = true;
    }

    // 3. Assign all permissions to admin (skip if already assigned)
    const allPermissions = await this.prisma.permission.findMany({});
    for (const permission of allPermissions) {
      const existing = await this.prisma.userPermission.findFirst({
        where: {
          userId: adminUser.id,
          permissionId: permission.id,
        },
      });

      if (!existing) {
        await this.prisma.userPermission.create({
          data: {
            userId: adminUser.id,
            permissionId: permission.id,
          },
        });
        result.permissionsAssigned++;
      }
    }

    return {
      message: 'Setup completed successfully',
      email: 'admin@lumono.com',
      password: result.userCreated ? 'admin123' : '(existing user - password unchanged)',
      note: result.userCreated
        ? 'IMPORTANT: Change the password after first login!'
        : 'User already existed. Re-login to refresh permissions.',
      ...result,
    };
  }
}
