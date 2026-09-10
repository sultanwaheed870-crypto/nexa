/**
 * Base class for Value Objects
 * Value objects are immutable and compared by their values, not identity
 */
export abstract class ValueObject {
  abstract equals(other: unknown): boolean;

  protected hashCode(value: unknown): number {
    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash;
    }
    return Number(value);
  }
}
