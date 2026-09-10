import { DomainError } from '@shared/errors/domain-error';

export class AIProviderError extends DomainError {
  constructor(
    message: string,
    public readonly providerName?: string,
    public readonly originalError?: unknown,
  ) {
    super(message);
    Object.setPrototypeOf(this, AIProviderError.prototype);
  }

  getErrorCode(): string {
    return 'AI_PROVIDER_ERROR';
  }

  getStatusCode(): number {
    return 500;
  }
}

export class AIRequestValidationError extends DomainError {
  constructor(
    message: string,
    public readonly validationErrors: string[],
  ) {
    super(message);
    Object.setPrototypeOf(this, AIRequestValidationError.prototype);
  }

  getErrorCode(): string {
    return 'AI_REQUEST_VALIDATION_ERROR';
  }

  getStatusCode(): number {
    return 400;
  }
}

export class AIProviderNotReadyError extends DomainError {
  constructor(message: string, public readonly providerName?: string) {
    super(message);
    Object.setPrototypeOf(this, AIProviderNotReadyError.prototype);
  }

  getErrorCode(): string {
    return 'AI_PROVIDER_NOT_READY';
  }

  getStatusCode(): number {
    return 503;
  }
}
