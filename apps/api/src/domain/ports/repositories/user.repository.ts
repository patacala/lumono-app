import { User, UserWithPermissions, UserWithFullPermissions } from '../../entities/user.entity';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  createdBy?: string;
}

export interface UpdateUserDto {
  name?: string;
  active?: boolean;
  updatedBy?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByIdWithPermissions(id: string): Promise<UserWithPermissions | null>;
  create(data: CreateUserDto): Promise<User>;
  update(id: string, data: UpdateUserDto, expectedVersion: number): Promise<User>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
  findAll(): Promise<UserWithFullPermissions[]>;
  assignPermission(userId: string, permissionId: string, assignedBy: string): Promise<void>;
  revokePermission(userId: string, permissionId: string): Promise<void>;
  getUserPermissions(userId: string): Promise<string[]>;
}

