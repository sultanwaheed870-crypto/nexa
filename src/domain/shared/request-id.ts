import { ValueObject } from './value-object';

/**
 * Request ID for tracing requests through the system
 * Format: REQ-{timestamp}-{random}
 */
export class RequestId extends ValueObject {
  private readonly value: string;

  constructor(value?: string) {
    super();
    this.value = value || this.generate();
  }

  private generate(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `REQ-${timestamp}-${random}`;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof RequestId)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
