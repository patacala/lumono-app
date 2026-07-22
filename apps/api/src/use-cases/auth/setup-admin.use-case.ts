import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IUserRepository } from '@/domain/ports/repositories/user.repository';
import { IPermissionRepository } from '@/domain/ports/repositories/permission.repository';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SetupAdminUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute() {
    // Check if any user exists
    const existingUsers = await this.userRepository.findAll();
    if (existingUsers.length > 0) {
      throw new ConflictException('Admin user already exists. This endpoint can only be used for initial setup.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const adminUser = await this.userRepository.create({
      email: 'admin@lumono.com',
      name: 'Admin',
      password: hashedPassword,
    });

    // Get all permissions
    const allPermissions = await this.permissionRepository.findAll();

    // Assign all permissions to admin
    for (const permission of allPermissions) {
      await this.permissionRepository.assignToUser(adminUser.id, permission.id);
    }

    return {
      message: 'Admin user created successfully',
      email: 'admin@lumono.com',
      password: 'admin123',
      note: 'Please change the password after first login',
      permissionsAssigned: allPermissions.length,
    };
  }
}
