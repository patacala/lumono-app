import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository, CreateCustomerDto } from '@/domain/ports/repositories/customer.repository';
import { Customer } from '@/domain/entities/customer.entity';
import { ConflictError } from '@/domain/errors/domain.error';

@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findByCode(dto.code);
    if (existing) {
      throw new ConflictError(`Customer with code ${dto.code} already exists`);
    }
    return this.customerRepository.create(dto);
  }
}
