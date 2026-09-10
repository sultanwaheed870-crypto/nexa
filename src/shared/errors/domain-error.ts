/**
 * Base class for all domain errors
 * Domain errors represent business logic failures
 */
export abstract class DomainError extends Error {
  abstract getErrorCode(): string;
  abstract getStatusCode(): number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/**
 * Validation error when input doesn't meet requirements
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  getErrorCode(): string {
    return 'VALIDATION_ERROR';
  }

  getStatusCode(): number {
    return 400;
  }
}

/**
 * Rate limit error when request exceeds limits
 */
export class RateLimitError extends DomainError {
  constructor(
    message: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }

  getErrorCode(): string {
    return 'RATE_LIMIT_EXCEEDED';
  }

  getStatusCode(): number {
    return 429;
  }
}

/**
 * Not found error when resource doesn't exist
 */
export class NotFoundError extends DomainError {
  constructor(
    message: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  getErrorCode(): string {
    return 'NOT_FOUND';
  }

  getStatusCode(): number {
    return 404;
  }
}

/**
 * Permission error when user lacks required permissions
 */
export class PermissionError extends DomainError {
  constructor(
    message: string,
    public readonly requiredPermission?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, PermissionError.prototype);
  }

  getErrorCode(): string {
    return 'PERMISSION_DENIED';
  }

  getStatusCode(): number {
    return 403;
  }
}

/**
 * Conflict error when operation conflicts with current state
 */
export class ConflictError extends DomainError {
  constructor(
    message: string,
    public readonly reason?: string,
  ) {
    super(message);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  getErrorCode(): string {
    return 'CONFLICT';
  }

  getStatusCode(): number {
    return 409;
  }
}
