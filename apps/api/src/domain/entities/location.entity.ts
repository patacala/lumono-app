import { BaseEntity } from './base.entity';

export interface Location extends BaseEntity {
  code: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
  managerId?: string;
  managerName?: string;
}

