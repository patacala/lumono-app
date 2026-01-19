export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message: string = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends DomainError {
  constructor(message: string = 'Forbidden - insufficient permissions') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class OptimisticLockError extends DomainError {
  constructor() {
    super('Optimistic lock failure - entity was modified by another transaction');
    this.name = 'OptimisticLockError';
  }
}

export class InsufficientStockError extends DomainError {
  constructor(productId: string, available: number, requested: number) {
    super(`Insufficient stock for product ${productId}. Available: ${available}, Requested: ${requested}`);
    this.name = 'InsufficientStockError';
  }
}

