import { Supplier } from '../../entities/supplier.entity';

export interface CreateSupplierDto {
  code: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  createdBy?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  updatedBy?: string;
}

export interface ISupplierRepository {
  findById(id: string): Promise<Supplier | null>;
  findByCode(code: string): Promise<Supplier | null>;
  create(data: CreateSupplierDto): Promise<Supplier>;
  update(id: string, data: UpdateSupplierDto, expectedVersion: number): Promise<Supplier>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
  findAll(): Promise<Supplier[]>;
}

