/**
 * AI Response - Value Object representing response from AI Provider
 */
export interface AIResponsePayload {
  text: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
  metadata?: Record<string, unknown>;
}

export class AIResponse {
  readonly text: string;
  readonly tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  readonly model?: string;
  readonly finishReason?: string;
  readonly metadata: Record<string, unknown>;
  readonly timestamp: Date;

  constructor(payload: AIResponsePayload) {
    this.text = payload.text;
    this.tokenUsage = payload.tokenUsage ?? {
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
    };
    this.model = payload.model;
    this.finishReason = payload.finishReason;
    this.metadata = payload.metadata ?? {};
    this.timestamp = new Date();
  }

  isEmpty(): boolean {
    return !this.text || this.text.trim().length === 0;
  }

  truncate(maxLength: number): AIResponse {
    if (this.text.length <= maxLength) {
      return this;
    }
    return new AIResponse({
      ...this,
      text: this.text.substring(0, maxLength) + '...',
    });
  }
}
