/**
 * Base class for all entities
 * Entities have identity and are mutable
 */
export abstract class Entity {
  protected id: string;
  protected createdAt: Date;
  protected updatedAt: Date;

  constructor(id: string, createdAt?: Date, updatedAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  getId(): string {
    return this.id;
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  setUpdatedAt(date: Date): void {
    this.updatedAt = date;
  }

  equals(other: unknown): boolean {
    if (!(other instanceof Entity)) {
      return false;
    }
    return this.id === other.id;
  }
}
