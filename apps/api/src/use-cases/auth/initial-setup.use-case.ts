import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class InitialSetupUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    // Check if setup was already done
    const existingUsers = await this.prisma.user.count();
    if (existingUsers > 0) {
      throw new ConflictException('Initial setup already completed. Database has existing users.');
    }

    const result = {
      permissionsCreated: 0,
      userCreated: false,
      permissionsAssigned: 0,
    };

    // 1. Create all permissions
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
      await this.prisma.permission.create({ data: permission });
      result.permissionsCreated++;
    }

    // 2. Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await this.prisma.user.create({
      data: {
        email: 'admin@lumono.com',
        name: 'Admin',
        password: hashedPassword,
        active: true,
      },
    });
    result.userCreated = true;

    // 3. Assign all permissions to admin
    const allPermissions = await this.prisma.permission.findMany();
    for (const permission of allPermissions) {
      await this.prisma.userPermission.create({
        data: {
          userId: adminUser.id,
          permissionId: permission.id,
          assignedBy: 'system',
        },
      });
      result.permissionsAssigned++;
    }

    return {
      message: 'Initial setup completed successfully',
      email: 'admin@lumono.com',
      password: 'admin123',
      note: 'IMPORTANT: Change the password after first login!',
      ...result,
    };
  }
}
