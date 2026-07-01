import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository, UpdateCustomerDto } from '@/domain/ports/repositories/customer.repository';
import { Customer } from '@/domain/entities/customer.entity';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class UpdateCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, dto: UpdateCustomerDto, version: number): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer', id);
    }
    return this.customerRepository.update(id, dto, version);
  }
}
