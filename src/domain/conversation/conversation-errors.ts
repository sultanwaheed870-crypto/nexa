import { DomainError } from '@shared/errors/domain-error';

export class ConversationNotFoundError extends DomainError {
  constructor(
    public readonly conversationId: string,
    public readonly guildId: string,
  ) {
    super(
      `Conversation ${conversationId} not found in guild ${guildId}`,
    );
    Object.setPrototypeOf(this, ConversationNotFoundError.prototype);
  }

  getErrorCode(): string {
    return 'CONVERSATION_NOT_FOUND';
  }

  getStatusCode(): number {
    return 404;
  }
}

export class ConversationClosedError extends DomainError {
  constructor(public readonly conversationId: string) {
    super(`Conversation ${conversationId} is closed`);
    Object.setPrototypeOf(this, ConversationClosedError.prototype);
  }

  getErrorCode(): string {
    return 'CONVERSATION_CLOSED';
  }

  getStatusCode(): number {
    return 409;
  }
}

export class InvalidConversationStateError extends DomainError {
  constructor(
    public readonly reason: string,
  ) {
    super(`Invalid conversation state: ${reason}`);
    Object.setPrototypeOf(this, InvalidConversationStateError.prototype);
  }

  getErrorCode(): string {
    return 'INVALID_CONVERSATION_STATE';
  }

  getStatusCode(): number {
    return 400;
  }
}
