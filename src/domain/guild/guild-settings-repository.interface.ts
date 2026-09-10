import { GuildSettings } from './guild-settings';

/**
 * Guild Settings Repository Interface
 */
export interface GuildSettingsRepository {
  /**
   * Create new guild settings
   */
  create(settings: GuildSettings): Promise<void>;

  /**
   * Get guild settings by guild ID
   */
  getByGuildId(guildId: string): Promise<GuildSettings | null>;

  /**
   * Update guild settings
   */
  update(settings: GuildSettings): Promise<void>;

  /**
   * Save guild settings (create or update)
   */
  save(settings: GuildSettings): Promise<void>;

  /**
   * Delete guild settings
   */
  delete(guildId: string): Promise<void>;
}
