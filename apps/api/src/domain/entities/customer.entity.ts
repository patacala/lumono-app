import { BaseEntity } from './base.entity';

export interface Customer extends BaseEntity {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}
