import { Location } from '../../entities/location.entity';

export interface CreateLocationDto {
  code: string;
  name: string;
  type: string;
  address?: string;
  description?: string;
  createdBy?: string;
}

export interface UpdateLocationDto {
  name?: string;
  type?: string;
  address?: string;
  description?: string;
  updatedBy?: string;
}

export interface ILocationRepository {
  findById(id: string): Promise<Location | null>;
  findByCode(code: string): Promise<Location | null>;
  create(data: CreateLocationDto): Promise<Location>;
  update(id: string, data: UpdateLocationDto, expectedVersion: number): Promise<Location>;
  softDelete(id: string, deletedBy: string, expectedVersion: number): Promise<void>;
  findAll(): Promise<Location[]>;
}

