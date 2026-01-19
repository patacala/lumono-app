import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IPermissionRepository } from '@/domain/ports/repositories/permission.repository';
import { Permission } from '@/domain/entities/permission.entity';

@Injectable()
export class PermissionRepositoryImpl implements IPermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });
    return permission as Permission | null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.prisma.permission.findUnique({
      where: { name },
    });
    return permission as Permission | null;
  }

  async findAll(): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: { deletedAt: null },
    });
    return permissions as Permission[];
  }

  async findByCategory(category: string): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        category,
        deletedAt: null,
      },
    });
    return permissions as Permission[];
  }
}

