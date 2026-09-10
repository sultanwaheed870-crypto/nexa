import { AIProvider } from '@domain/ai/ai-provider.interface';
import { AIRequest } from '@domain/ai/ai-request';
import { AIResponse } from '@domain/ai/ai-response';
import {
  AIProviderError,
  AIRequestValidationError,
  AIProviderNotReadyError,
} from '@domain/ai/ai-errors';
import { Logger } from '@infrastructure/logging/logger.interface';
import { AIRequestManager } from './ai-request-manager';
import {
  GenerateResponseRequest,
  GenerateResponseResponse,
  toGenerateResponseResponse,
} from './ai.dto';

/**
 * AI Application Service
 * Orchestrates AI request handling
 *
 * Responsibilities:
 * - Validate requests
 * - Manage request lifecycle
 * - Coordinate with AIProvider
 * - Handle errors
 * - Track metrics
 */
export class AIService {
  private requestManager: AIRequestManager;

  constructor(
    private aiProvider: AIProvider,
    private logger: Logger,
    maxConcurrentRequests: number = 2,
    maxQueueSize: number = 1000,
    requestTimeoutMs: number = 30000,
  ) {
    this.requestManager = new AIRequestManager(
      maxConcurrentRequests,
      maxQueueSize,
      requestTimeoutMs,
    );
  }

  /**
   * Generate AI response
   * Main entry point for AI requests
   */
  async generateResponse(
    request: GenerateResponseRequest,
    requestId: string,
  ): Promise<GenerateResponseResponse> {
    const startTime = Date.now();

    try {
      // Check if provider is ready
      if (!this.aiProvider.isReady()) {
        throw new AIProviderNotReadyError(
          'AI Provider is not ready',
          this.aiProvider.getProviderInfo().name,
        );
      }

      // Create domain request
      const aiRequest = new AIRequest({
        prompt: request.prompt,
        context: request.context,
        maxTokens: request.maxTokens,
        temperature: request.temperature,
        userId: request.userId,
        guildId: request.guildId,
        conversationId: request.conversationId,
      });

      // Validate request (domain level)
      const validation = aiRequest.validate();
      if (!validation.isValid) {
        throw new AIRequestValidationError(
          'AI request validation failed',
          validation.errors,
        );
      }

      // Validate with provider
      const providerValidation = this.aiProvider.validateRequest(aiRequest);
      if (!providerValidation.isValid) {
        throw new AIRequestValidationError(
          'Provider validation failed',
          providerValidation.errors,
        );
      }

      // Queue request
      this.requestManager.enqueue(
        requestId,
        request.prompt,
        request.userId,
        request.guildId,
        0,
      );

      // Generate response from provider
      const aiResponse = await this.aiProvider.generateResponse(aiRequest);

      if (aiResponse.isEmpty()) {
        throw new AIProviderError(
          'AI Provider returned empty response',
          this.aiProvider.getProviderInfo().name,
        );
      }

      const duration = Date.now() - startTime;

      // Mark as completed
      this.requestManager.markCompleted(requestId, duration);

      // Log success
      this.logger.info('AI response generated', {
        requestId,
        userId: request.userId,
        guildId: request.guildId,
        duration,
        tokenUsage: aiResponse.tokenUsage.totalTokens,
      });

      return toGenerateResponseResponse(aiResponse, requestId, duration);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.requestManager.markFailed(requestId);

      // Log error
      this.logger.error('AI response generation failed', {
        requestId,
        userId: request.userId,
        guildId: request.guildId,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  }

  /**
   * Get AI provider info
   */
  getProviderInfo(): {
    name: string;
    version?: string;
    modelName?: string;
    contextWindow?: number;
  } {
    return this.aiProvider.getProviderInfo();
  }

  /**
   * Get request manager metrics
   */
  getMetrics() {
    return this.requestManager.getMetrics();
  }

  /**
   * Initialize AI service
   */
  async initialize(): Promise<void> {
    this.logger.info('Initializing AI Service');
    await this.aiProvider.initialize();
    this.logger.info('AI Service initialized', {
      provider: this.aiProvider.getProviderInfo().name,
    });
  }

  /**
   * Shutdown AI service
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down AI Service');
    this.requestManager.shutdown();
    await this.aiProvider.shutdown();
    this.logger.info('AI Service shutdown complete');
  }
}
