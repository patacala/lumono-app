import { RegisterInventoryInUseCase } from './register-inventory-in.use-case';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { IProductRepository } from '@/domain/ports/repositories/product.repository';
import { ILocationRepository } from '@/domain/ports/repositories/location.repository';
import { IInventoryMovementRepository } from '@/domain/ports/repositories/inventory-movement.repository';
import { NotFoundError, ValidationError } from '@/domain/errors/domain.error';

describe('RegisterInventoryInUseCase', () => {
  let useCase: RegisterInventoryInUseCase;
  let prisma: jest.Mocked<PrismaService>;
  let productRepository: jest.Mocked<IProductRepository>;
  let locationRepository: jest.Mocked<ILocationRepository>;
  let inventoryMovementRepository: jest.Mocked<IInventoryMovementRepository>;

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(callback => callback()),
    } as any;

    productRepository = {
      findById: jest.fn(),
    } as any;

    locationRepository = {
      findById: jest.fn(),
    } as any;

    inventoryMovementRepository = {
      create: jest.fn(),
    } as any;

    useCase = new RegisterInventoryInUseCase(
      prisma,
      productRepository,
      locationRepository,
      inventoryMovementRepository
    );
  });

  it('should successfully register inventory IN', async () => {
    const mockProduct = { id: '1', sku: 'TEST', name: 'Test Product' };
    const mockLocation = { id: 'loc1', code: 'WH-01', name: 'Warehouse' };
    const mockMovement = {
      id: 'mov1',
      productId: '1',
      type: 'IN',
      quantity: 100,
      destLocationId: 'loc1',
    };

    productRepository.findById.mockResolvedValue(mockProduct as any);
    locationRepository.findById.mockResolvedValue(mockLocation as any);
    inventoryMovementRepository.create.mockResolvedValue(mockMovement as any);

    const result = await useCase.execute({
      productId: '1',
      destLocationId: 'loc1',
      quantity: 100,
      createdBy: 'user1',
    });

    expect(result).toEqual(mockMovement);
    expect(inventoryMovementRepository.create).toHaveBeenCalledWith({
      productId: '1',
      type: 'IN',
      quantity: 100,
      destLocationId: 'loc1',
      referenceDocument: undefined,
      notes: undefined,
      unitPrice: undefined,
      createdBy: 'user1',
    });
  });

  it('should throw ValidationError for negative quantity', async () => {
    await expect(
      useCase.execute({
        productId: '1',
        destLocationId: 'loc1',
        quantity: -10,
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should throw NotFoundError when product not found', async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({
        productId: 'invalid',
        destLocationId: 'loc1',
        quantity: 100,
      })
    ).rejects.toThrow(NotFoundError);
  });
});

