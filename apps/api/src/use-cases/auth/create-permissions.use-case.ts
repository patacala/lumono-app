import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class CreatePermissionsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
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

      // Category permissions
      { name: 'category.create', description: 'Create categories', category: 'category' },
      { name: 'category.read', description: 'View categories', category: 'category' },
      { name: 'category.update', description: 'Update categories', category: 'category' },
      { name: 'category.delete', description: 'Delete categories', category: 'category' },

      // Lot permissions
      { name: 'lot.create', description: 'Create lots', category: 'lot' },
      { name: 'lot.read', description: 'View lots', category: 'lot' },
      { name: 'lot.update', description: 'Update lots', category: 'lot' },
    ];

    let created = 0;
    let skipped = 0;

    for (const permission of permissions) {
      const existing = await this.prisma.permission.findUnique({
        where: { name: permission.name },
      });

      if (!existing) {
        await this.prisma.permission.create({
          data: permission,
        });
        created++;
      } else {
        skipped++;
      }
    }

    return {
      message: 'Permissions created successfully',
      created,
      skipped,
      total: permissions.length,
    };
  }
}
