import { BaseEntity } from './base.entity';

export interface User extends BaseEntity {
  email: string;
  password: string;
  name: string;
  active: boolean;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category: string;
}

export interface UserWithPermissions extends User {
  permissions: string[];
}

export interface UserWithFullPermissions extends Omit<User, 'password'> {
  permissions: Permission[];
}

