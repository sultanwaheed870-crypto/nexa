import { AIRequest } from '@domain/ai/ai-request';
import { AIResponse } from '@domain/ai/ai-response';

/**
 * DTO for AI Request from presentation layer
 */
export interface GenerateResponseRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
  userId: string;
  guildId: string;
  conversationId?: string;
}

/**
 * DTO for AI Response to presentation layer
 */
export interface GenerateResponseResponse {
  text: string;
  requestId: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  duration: number;
  timestamp: string;
}

/**
 * Convert domain AIRequest to DTO
 */
export const toGenerateResponseResponse = (
  aiResponse: AIResponse,
  requestId: string,
  duration: number,
): GenerateResponseResponse => {
  return {
    text: aiResponse.text,
    requestId,
    tokenUsage: aiResponse.tokenUsage,
    model: aiResponse.model,
    duration,
    timestamp: aiResponse.timestamp.toISOString(),
  };
};
