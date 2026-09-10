import { Entity } from '@domain/shared/entity';
import { GuildId } from './guild-id';

/**
 * Guild Settings Entity
 * Represents configuration for a guild
 */
export class GuildSettings extends Entity {
  private guildId: GuildId;
  private prefix: string = '-';
  private aiEnabled: boolean = true;
  private maxConcurrentRequests: number = 2;
  private systemPrompt?: string;
  private customSettings: Map<string, unknown> = new Map();

  constructor(guildId: string, id?: string, createdAt?: Date, updatedAt?: Date) {
    super(id ?? `guild-settings-${guildId}`, createdAt, updatedAt);
    this.guildId = new GuildId(guildId);
  }

  getGuildId(): GuildId {
    return this.guildId;
  }

  getPrefix(): string {
    return this.prefix;
  }

  setPrefix(prefix: string): void {
    if (!prefix || prefix.length > 5) {
      throw new Error('Prefix must be between 1 and 5 characters');
    }
    this.prefix = prefix;
    this.updatedAt = new Date();
  }

  isAIEnabled(): boolean {
    return this.aiEnabled;
  }

  setAIEnabled(enabled: boolean): void {
    this.aiEnabled = enabled;
    this.updatedAt = new Date();
  }

  getMaxConcurrentRequests(): number {
    return this.maxConcurrentRequests;
  }

  setMaxConcurrentRequests(max: number): void {
    if (max < 1 || max > 10) {
      throw new Error('Max concurrent requests must be between 1 and 10');
    }
    this.maxConcurrentRequests = max;
    this.updatedAt = new Date();
  }

  getSystemPrompt(): string | undefined {
    return this.systemPrompt;
  }

  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
    this.updatedAt = new Date();
  }

  setSetting<T>(key: string, value: T): void {
    this.customSettings.set(key, value);
    this.updatedAt = new Date();
  }

  getSetting<T>(key: string): T | undefined {
    return this.customSettings.get(key) as T | undefined;
  }

  getAllCustomSettings(): Map<string, unknown> {
    return new Map(this.customSettings);
  }
}
