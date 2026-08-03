import { Injectable, Inject } from '@nestjs/common';
import { ICustomerRepository, CreateCustomerDto } from '@/domain/ports/repositories/customer.repository';

export interface BulkCustomerRow {
  code?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
}

export interface BulkCreateCustomersResult {
  created: number;
  errors: { row: number; message: string }[];
}

/**
 * Creates many customers in one shot. `code` is optional in the file: when
 * missing a sequential `CLI-00001` code is generated. Each row is processed
 * independently so a failing row is reported without blocking the rest.
 */
@Injectable()
export class BulkCreateCustomersUseCase {
  constructor(
    @Inject('ICustomerRepository')
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(rows: BulkCustomerRow[], createdBy?: string): Promise<BulkCreateCustomersResult> {
    const errors: { row: number; message: string }[] = [];
    let created = 0;

    // Seed the auto-code sequence from existing CLI-##### codes
    const existing = await this.customerRepository.findAll();
    const usedCodes = new Set(existing.map((c) => c.code.trim().toLowerCase()));
    let nextSeq = 1;
    for (const c of existing) {
      const match = /^CLI-(\d+)$/i.exec(c.code.trim());
      if (match) nextSeq = Math.max(nextSeq, parseInt(match[1], 10) + 1);
    }

    for (let i = 0; i < rows.length; i++) {
      const rowNum = i + 1;
      const row = rows[i];

      const name = row.name?.trim();
      if (!name) {
        errors.push({ row: rowNum, message: 'El nombre es requerido' });
        continue;
      }

      let code = row.code?.trim();
      if (code) {
        if (usedCodes.has(code.toLowerCase())) {
          errors.push({ row: rowNum, message: `Ya existe un cliente con codigo ${code}` });
          continue;
        }
      } else {
        do {
          code = `CLI-${nextSeq.toString().padStart(5, '0')}`;
          nextSeq++;
        } while (usedCodes.has(code.toLowerCase()));
      }

      const dto: CreateCustomerDto = { code, name, createdBy };
      if (row.email?.trim()) dto.email = row.email.trim();
      if (row.phone?.trim()) dto.phone = row.phone.trim();
      if (row.address?.trim()) dto.address = row.address.trim();
      if (row.taxId?.trim()) dto.taxId = row.taxId.trim();

      try {
        await this.customerRepository.create(dto);
        usedCodes.add(code.toLowerCase());
        created++;
      } catch (err: any) {
        errors.push({ row: rowNum, message: err?.message || 'Error al crear el cliente' });
      }
    }

    return { created, errors };
  }
}
