/**
 * AI Request - Value Object representing a request to AI Provider
 */
export interface AIRequestPayload {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  userId?: string;
  guildId?: string;
  conversationId?: string;
  metadata?: Record<string, unknown>;
}

export class AIRequest {
  readonly prompt: string;
  readonly context?: string;
  readonly maxTokens: number;
  readonly temperature: number;
  readonly systemPrompt: string;
  readonly userId?: string;
  readonly guildId?: string;
  readonly conversationId?: string;
  readonly metadata: Record<string, unknown>;

  constructor(payload: AIRequestPayload) {
    this.prompt = payload.prompt;
    this.context = payload.context;
    this.maxTokens = payload.maxTokens ?? 1024;
    this.temperature = payload.temperature ?? 0.7;
    this.systemPrompt =
      payload.systemPrompt ??
      'You are NEXA, a helpful Discord AI assistant. You are local, self-hosted, and designed to be helpful, harmless, and honest.';
    this.userId = payload.userId;
    this.guildId = payload.guildId;
    this.conversationId = payload.conversationId;
    this.metadata = payload.metadata ?? {};
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.prompt || this.prompt.trim().length === 0) {
      errors.push('Prompt cannot be empty');
    }

    if (this.prompt.length > 10000) {
      errors.push('Prompt exceeds maximum length of 10000 characters');
    }

    if (this.maxTokens < 1 || this.maxTokens > 4096) {
      errors.push('maxTokens must be between 1 and 4096');
    }

    if (this.temperature < 0 || this.temperature > 2) {
      errors.push('temperature must be between 0 and 2');
    }

    if (this.context && this.context.length > 50000) {
      errors.push('Context exceeds maximum length of 50000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
