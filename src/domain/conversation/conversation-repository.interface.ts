import { Conversation } from './conversation';

/**
 * Conversation Repository Interface
 * All conversation persistence must implement this
 */
export interface ConversationRepository {
  /**
   * Create new conversation
   */
  create(conversation: Conversation): Promise<void>;

  /**
   * Get conversation by ID
   * Must check guild_id to ensure data isolation
   */
  getById(id: string, guildId: string): Promise<Conversation | null>;

  /**
   * Get conversation by user in guild
   */
  getByUserId(userId: string, guildId: string): Promise<Conversation[]>;

  /**
   * Update conversation
   */
  update(conversation: Conversation): Promise<void>;

  /**
   * Save conversation (create or update)
   */
  save(conversation: Conversation): Promise<void>;

  /**
   * Delete conversation
   * Hard delete only for cleanup
   */
  delete(id: string, guildId: string): Promise<void>;

  /**
   * Get active conversations in guild
   */
  getActiveInGuild(guildId: string): Promise<Conversation[]>;
}
