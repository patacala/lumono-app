import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IUserRepository,
  CreateUserDto,
  UpdateUserDto,
} from '@/domain/ports/repositories/user.repository';
import { User, UserWithPermissions, UserWithFullPermissions } from '@/domain/entities/user.entity';
import { OptimisticLockError } from '@/domain/errors/domain.error';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    return user as User | null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    return user as User | null;
  }

  async findByIdWithPermissions(id: string): Promise<UserWithPermissions | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: {
            permission: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const permissions = user.permissions.map(up => up.permission.name);
    const { permissions: _, ...userData } = user as any;
    
    return {
      ...userData,
      permissions,
    } as UserWithPermissions;
  }

  async create(data: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data,
    });
    return user as User;
  }

  async update(id: string, data: UpdateUserDto, expectedVersion: number): Promise<User> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          ...data,
          version: { increment: 1 },
        },
      });
      return user as User;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void> {
    try {
      await this.prisma.user.update({
        where: {
          id,
          version: expectedVersion,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedBy,
          version: { increment: 1 },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new OptimisticLockError();
      }
      throw error;
    }
  }

  async findAll(): Promise<UserWithFullPermissions[]> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: {
            permission: true,
          },
        },
      },
    });

    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        permissions: user.permissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description,
          category: up.permission.category,
        })),
      };
    }) as UserWithFullPermissions[];
  }

  async assignPermission(userId: string, permissionId: string, assignedBy: string): Promise<void> {
    await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        createdBy: assignedBy,
      },
    });
  }

  async revokePermission(userId: string, permissionId: string): Promise<void> {
    await this.prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId,
      },
    });
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const userPermissions = await this.prisma.userPermission.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        permission: true,
      },
    });

    return userPermissions.map(up => up.permission.name);
  }
}

