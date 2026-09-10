import { AIRequest } from './ai-request';
import { AIResponse } from './ai-response';

/**
 * AIProvider Interface
 * All AI implementations must implement this interface
 * This enables easy swapping between providers
 */
export interface AIProvider {
  /**
   * Generate response from AI Provider
   */
  generateResponse(request: AIRequest): Promise<AIResponse>;

  /**
   * Check if provider supports streaming
   */
  supportsStreaming(): boolean;

  /**
   * Get provider information
   */
  getProviderInfo(): {
    name: string;
    version?: string;
    modelName?: string;
    contextWindow?: number;
  };

  /**
   * Validate request before sending to provider
   */
  validateRequest(request: AIRequest): { isValid: boolean; errors: string[] };

  /**
   * Initialize provider if needed
   */
  initialize(): Promise<void>;

  /**
   * Shutdown provider if needed
   */
  shutdown(): Promise<void>;

  /**
   * Check if provider is ready
   */
  isReady(): boolean;
}
