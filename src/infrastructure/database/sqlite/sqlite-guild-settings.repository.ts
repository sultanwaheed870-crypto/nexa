import { SQLiteConnection } from './sqlite-connection';
import { GuildSettings } from '@domain/guild/guild-settings';
import { GuildSettingsRepository } from '@domain/guild/guild-settings-repository.interface';

interface GuildSettingsRow {
  id: string;
  guild_id: string;
  prefix: string;
  ai_enabled: number;
  max_concurrent_requests: number;
  system_prompt?: string;
  custom_settings?: string;
  created_at: string;
  updated_at: string;
}

/**
 * SQLite Guild Settings Repository
 * Implements GuildSettingsRepository interface
 */
export class SQLiteGuildSettingsRepository implements GuildSettingsRepository {
  constructor(private connection: SQLiteConnection) {}

  async create(settings: GuildSettings): Promise<void> {
    const customSettings = Object.fromEntries(
      settings.getAllCustomSettings(),
    );

    const stmt = this.connection.prepare(
      `
      INSERT INTO guilds
      (id, guild_id, prefix, ai_enabled, max_concurrent_requests, system_prompt, custom_settings, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    );

    stmt.run(
      settings.getId(),
      settings.getGuildId().getValue(),
      settings.getPrefix(),
      settings.isAIEnabled() ? 1 : 0,
      settings.getMaxConcurrentRequests(),
      settings.getSystemPrompt() ?? null,
      Object.keys(customSettings).length > 0
        ? JSON.stringify(customSettings)
        : null,
      settings.getCreatedAt().toISOString(),
      settings.getUpdatedAt().toISOString(),
    );
  }

  async getByGuildId(guildId: string): Promise<GuildSettings | null> {
    const stmt = this.connection.prepare(
      `SELECT * FROM guilds WHERE guild_id = ?`,
    );

    const row = stmt.get(guildId) as GuildSettingsRow | undefined;
    if (!row) {
      return null;
    }

    return this.mapRowToSettings(row);
  }

  async update(settings: GuildSettings): Promise<void> {
    const customSettings = Object.fromEntries(
      settings.getAllCustomSettings(),
    );

    const stmt = this.connection.prepare(
      `
      UPDATE guilds
      SET prefix = ?, ai_enabled = ?, max_concurrent_requests = ?, system_prompt = ?, custom_settings = ?, updated_at = ?
      WHERE guild_id = ?
    `,
    );

    stmt.run(
      settings.getPrefix(),
      settings.isAIEnabled() ? 1 : 0,
      settings.getMaxConcurrentRequests(),
      settings.getSystemPrompt() ?? null,
      Object.keys(customSettings).length > 0
        ? JSON.stringify(customSettings)
        : null,
      settings.getUpdatedAt().toISOString(),
      settings.getGuildId().getValue(),
    );
  }

  async save(settings: GuildSettings): Promise<void> {
    const existing = await this.getByGuildId(
      settings.getGuildId().getValue(),
    );
    if (existing) {
      await this.update(settings);
    } else {
      await this.create(settings);
    }
  }

  async delete(guildId: string): Promise<void> {
    const stmt = this.connection.prepare(`DELETE FROM guilds WHERE guild_id = ?`);
    stmt.run(guildId);
  }

  private mapRowToSettings(row: GuildSettingsRow): GuildSettings {
    const settings = new GuildSettings(
      row.guild_id,
      row.id,
      new Date(row.created_at),
      new Date(row.updated_at),
    );

    if (row.prefix) {
      settings.setPrefix(row.prefix);
    }

    settings.setAIEnabled(row.ai_enabled === 1);
    settings.setMaxConcurrentRequests(row.max_concurrent_requests);

    if (row.system_prompt) {
      settings.setSystemPrompt(row.system_prompt);
    }

    if (row.custom_settings) {
      const customSettings = JSON.parse(row.custom_settings) as Record<
        string,
        unknown
      >;
      for (const [key, value] of Object.entries(customSettings)) {
        settings.setSetting(key, value);
      }
    }

    return settings;
  }
}
