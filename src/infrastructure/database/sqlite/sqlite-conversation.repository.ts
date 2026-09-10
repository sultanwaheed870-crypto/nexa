import { SQLiteConnection } from './sqlite-connection';
import { Conversation } from '@domain/conversation/conversation';
import { ConversationRepository } from '@domain/conversation/conversation-repository.interface';
import { ConversationNotFoundError } from '@domain/conversation/conversation-errors';

interface ConversationRow {
  id: string;
  guild_id: string;
  user_id: string;
  channel_id: string;
  title?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  token_count?: number;
  created_at: string;
}

/**
 * SQLite Conversation Repository
 * Implements ConversationRepository interface
 */
export class SQLiteConversationRepository implements ConversationRepository {
  constructor(private connection: SQLiteConnection) {}

  async create(conversation: Conversation): Promise<void> {
    const stmt = this.connection.prepare(
      `
      INSERT INTO conversations
      (id, guild_id, user_id, channel_id, title, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    );

    stmt.run(
      conversation.getId(),
      conversation.getGuildId(),
      conversation.getUserId(),
      conversation.getChannelId(),
      conversation.getTitle() ?? null,
      conversation.isConversationActive() ? 1 : 0,
      conversation.getCreatedAt().toISOString(),
      conversation.getUpdatedAt().toISOString(),
    );

    // Add initial messages
    const messages = conversation.getMessages();
    const insertMsg = this.connection.prepare(
      `
      INSERT INTO messages
      (id, conversation_id, guild_id, role, content, token_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    );

    for (const msg of messages) {
      insertMsg.run(
        msg.id,
        conversation.getId(),
        conversation.getGuildId(),
        msg.role,
        msg.content,
        msg.tokenCount ?? null,
        msg.timestamp.toISOString(),
      );
    }
  }

  async getById(id: string, guildId: string): Promise<Conversation | null> {
    const stmt = this.connection.prepare(
      `
      SELECT * FROM conversations
      WHERE id = ? AND guild_id = ?
    `,
    );

    const row = stmt.get(id, guildId) as ConversationRow | undefined;
    if (!row) {
      return null;
    }

    return this.mapRowToConversation(row);
  }

  async getByUserId(
    userId: string,
    guildId: string,
  ): Promise<Conversation[]> {
    const stmt = this.connection.prepare(
      `
      SELECT * FROM conversations
      WHERE user_id = ? AND guild_id = ?
      ORDER BY updated_at DESC
    `,
    );

    const rows = stmt.all(userId, guildId) as ConversationRow[];
    return rows.map((row) => this.mapRowToConversation(row));
  }

  async update(conversation: Conversation): Promise<void> {
    const stmt = this.connection.prepare(
      `
      UPDATE conversations
      SET title = ?, is_active = ?, updated_at = ?
      WHERE id = ? AND guild_id = ?
    `,
    );

    stmt.run(
      conversation.getTitle() ?? null,
      conversation.isConversationActive() ? 1 : 0,
      conversation.getUpdatedAt().toISOString(),
      conversation.getId(),
      conversation.getGuildId(),
    );
  }

  async save(conversation: Conversation): Promise<void> {
    const existing = await this.getById(
      conversation.getId(),
      conversation.getGuildId(),
    );
    if (existing) {
      await this.update(conversation);
    } else {
      await this.create(conversation);
    }
  }

  async delete(id: string, guildId: string): Promise<void> {
    const stmt = this.connection.prepare(
      `DELETE FROM conversations WHERE id = ? AND guild_id = ?`,
    );
    stmt.run(id, guildId);
  }

  async getActiveInGuild(guildId: string): Promise<Conversation[]> {
    const stmt = this.connection.prepare(
      `
      SELECT * FROM conversations
      WHERE guild_id = ? AND is_active = 1
      ORDER BY updated_at DESC
    `,
    );

    const rows = stmt.all(guildId) as ConversationRow[];
    return rows.map((row) => this.mapRowToConversation(row));
  }

  private mapRowToConversation(row: ConversationRow): Conversation {
    const conversation = new Conversation(
      row.id,
      row.user_id,
      row.guild_id,
      row.channel_id,
      new Date(row.created_at),
      new Date(row.updated_at),
    );

    if (row.title) {
      conversation.setTitle(row.title);
    }

    if (!row.is_active) {
      conversation.close();
    }

    // Load messages
    const msgStmt = this.connection.prepare(
      `
      SELECT * FROM messages
      WHERE conversation_id = ?
      ORDER BY created_at ASC
    `,
    );

    const messages = msgStmt.all(row.id) as MessageRow[];
    for (const msg of messages) {
      conversation.addMessage(msg.role, msg.content, msg.token_count);
    }

    return conversation;
  }
}
