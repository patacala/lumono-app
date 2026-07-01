import { Customer } from '../../entities/customer.entity';

export interface CreateCustomerDto {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  createdBy?: string;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  updatedBy?: string;
}

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>;
  findByCode(code: string): Promise<Customer | null>;
  create(data: CreateCustomerDto): Promise<Customer>;
  update(id: string, data: UpdateCustomerDto, expectedVersion: number): Promise<Customer>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
  findAll(): Promise<Customer[]>;
}
