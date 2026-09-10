import { ValueObject } from '@domain/shared/value-object';

/**
 * GuildId - Value Object representing Discord Guild ID
 */
export class GuildId extends ValueObject {
  private readonly value: string;

  constructor(value: string) {
    super();
    if (!value || value.trim().length === 0) {
      throw new Error('Guild ID cannot be empty');
    }
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof GuildId)) {
      return false;
    }
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
