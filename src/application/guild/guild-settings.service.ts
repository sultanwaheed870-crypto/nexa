import { GuildSettings } from '@domain/guild/guild-settings';
import { GuildSettingsRepository } from '@domain/guild/guild-settings-repository.interface';
import { Logger } from '@infrastructure/logging/logger.interface';

/**
 * Guild Settings Application Service
 * Handles guild configuration
 */
export class GuildSettingsService {
  constructor(
    private guildSettingsRepository: GuildSettingsRepository,
    private logger: Logger,
  ) {}

  /**
   * Get or create guild settings
   */
  async getOrCreateSettings(guildId: string): Promise<GuildSettings> {
    try {
      const existing =
        await this.guildSettingsRepository.getByGuildId(guildId);

      if (existing) {
        return existing;
      }

      const settings = new GuildSettings(guildId);
      await this.guildSettingsRepository.save(settings);

      this.logger.info('Created new guild settings', { guildId });

      return settings;
    } catch (error) {
      this.logger.error('Error getting or creating guild settings', {
        guildId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get guild settings
   */
  async getSettings(guildId: string): Promise<GuildSettings> {
    try {
      const settings =
        await this.guildSettingsRepository.getByGuildId(guildId);

      if (!settings) {
        return this.getOrCreateSettings(guildId);
      }

      return settings;
    } catch (error) {
      this.logger.error('Error getting guild settings', {
        guildId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Update guild settings
   */
  async updateSettings(settings: GuildSettings): Promise<void> {
    try {
      await this.guildSettingsRepository.update(settings);
      this.logger.info('Guild settings updated', {
        guildId: settings.getGuildId().getValue(),
      });
    } catch (error) {
      this.logger.error('Error updating guild settings', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
