import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository } from '@/domain/ports/repositories/customer.repository';
import { NotFoundError } from '@/domain/errors/domain.error';

@Injectable()
export class DeleteCustomerUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(id: string, deletedBy: string, version: number): Promise<void> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundError('Customer', id);
    }
    await this.customerRepository.softDelete(id, deletedBy, version);
  }
}
