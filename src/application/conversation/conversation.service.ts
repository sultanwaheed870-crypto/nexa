import { Conversation } from '@domain/conversation/conversation';
import { ConversationRepository } from '@domain/conversation/conversation-repository.interface';
import { Logger } from '@infrastructure/logging/logger.interface';

/**
 * Conversation Application Service
 * Handles conversation operations
 */
export class ConversationService {
  constructor(
    private conversationRepository: ConversationRepository,
    private logger: Logger,
  ) {}

  /**
   * Get or create conversation for user in guild
   */
  async getOrCreateConversation(
    userId: string,
    guildId: string,
    channelId: string,
  ): Promise<Conversation> {
    try {
      const existing = await this.conversationRepository.getByUserId(
        userId,
        guildId,
      );

      if (existing && existing.length > 0) {
        // Return the most recent active conversation
        const active = existing.find((c) => c.isConversationActive());
        if (active) {
          return active;
        }
      }

      // Create new conversation
      const conversationId = `conv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const conversation = new Conversation(
        conversationId,
        userId,
        guildId,
        channelId,
      );

      await this.conversationRepository.save(conversation);

      this.logger.info('Created new conversation', {
        conversationId,
        userId,
        guildId,
      });

      return conversation;
    } catch (error) {
      this.logger.error('Error getting or creating conversation', {
        userId,
        guildId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    conversationId: string,
    guildId: string,
    role: 'user' | 'assistant',
    content: string,
    tokenCount?: number,
  ): Promise<void> {
    try {
      const conversation =
        await this.conversationRepository.getById(conversationId, guildId);

      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      conversation.addMessage(role, content, tokenCount);
      await this.conversationRepository.update(conversation);
    } catch (error) {
      this.logger.error('Error adding message', {
        conversationId,
        guildId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get recent messages from conversation
   */
  async getRecentMessages(
    conversationId: string,
    guildId: string,
    count: number = 10,
  ): Promise<Array<{ role: string; content: string }>> {
    try {
      const conversation =
        await this.conversationRepository.getById(conversationId, guildId);

      if (!conversation) {
        throw new Error(`Conversation ${conversationId} not found`);
      }

      return conversation
        .getRecentMessages(count)
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
    } catch (error) {
      this.logger.error('Error getting recent messages', {
        conversationId,
        guildId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
