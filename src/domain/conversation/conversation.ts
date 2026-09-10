import { Entity } from '@domain/shared/entity';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokenCount?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Conversation Entity
 * Represents a conversation between user and bot
 */
export class Conversation extends Entity {
  private messages: ConversationMessage[] = [];
  private userId: string;
  private guildId: string;
  private channelId: string;
  private title?: string;
  private isActive: boolean = true;
  private lastMessageAt: Date;

  constructor(
    id: string,
    userId: string,
    guildId: string,
    channelId: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    super(id, createdAt, updatedAt);
    this.userId = userId;
    this.guildId = guildId;
    this.channelId = channelId;
    this.lastMessageAt = new Date();
  }

  addMessage(
    role: 'user' | 'assistant',
    content: string,
    tokenCount?: number,
  ): ConversationMessage {
    const message: ConversationMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role,
      content,
      timestamp: new Date(),
      tokenCount,
    };
    this.messages.push(message);
    this.lastMessageAt = new Date();
    this.updatedAt = new Date();
    return message;
  }

  getMessages(): ConversationMessage[] {
    return [...this.messages];
  }

  getRecentMessages(count: number): ConversationMessage[] {
    return this.messages.slice(-count);
  }

  getMessageCount(): number {
    return this.messages.length;
  }

  getUserId(): string {
    return this.userId;
  }

  getGuildId(): string {
    return this.guildId;
  }

  getChannelId(): string {
    return this.channelId;
  }

  getTitle(): string | undefined {
    return this.title;
  }

  setTitle(title: string): void {
    this.title = title;
    this.updatedAt = new Date();
  }

  isConversationActive(): boolean {
    return this.isActive;
  }

  close(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  getLastMessageAt(): Date {
    return this.lastMessageAt;
  }

  getMessagesSince(timestamp: Date): ConversationMessage[] {
    return this.messages.filter((msg) => msg.timestamp > timestamp);
  }
}
