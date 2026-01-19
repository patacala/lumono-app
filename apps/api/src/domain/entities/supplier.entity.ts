import { BaseEntity } from './base.entity';

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
}

