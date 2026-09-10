import { RateLimitError } from '@shared/errors/domain-error';
import { QueuedAIRequest, QueueMetrics } from './ai-request-manager.types';

/**
 * AI Request Manager
 * Handles:
 * - Request queuing
 * - Concurrency control
 * - Rate limiting
 * - Priority management
 * - Request timeout
 * - Metrics collection
 */
export class AIRequestManager {
  private queue: QueuedAIRequest[] = [];
  private activeRequests: Map<string, QueuedAIRequest> = new Map();
  private perUserRequests: Map<string, number> = new Map();
  private perGuildRequests: Map<string, number> = new Map();
  private totalProcessed: number = 0;
  private totalErrors: number = 0;
  private latencies: number[] = [];

  private readonly maxConcurrent: number;
  private readonly maxQueueSize: number;
  private readonly requestTimeoutMs: number;
  private readonly maxPerUser: number;
  private readonly maxPerGuild: number;
  private readonly maxLatencyWindow: number = 100; // Keep last 100 latencies

  constructor(
    maxConcurrent: number = 2,
    maxQueueSize: number = 1000,
    requestTimeoutMs: number = 30000,
    maxPerUser: number = 1,
    maxPerGuild: number = 2,
  ) {
    this.maxConcurrent = maxConcurrent;
    this.maxQueueSize = maxQueueSize;
    this.requestTimeoutMs = requestTimeoutMs;
    this.maxPerUser = maxPerUser;
    this.maxPerGuild = maxPerGuild;
  }

  /**
   * Enqueue a new AI request
   * Validates rate limits and queue size
   */
  enqueue(
    requestId: string,
    prompt: string,
    userId: string,
    guildId: string,
    priority: number = 0,
  ): void {
    // Check queue size
    if (this.queue.length + this.activeRequests.size >= this.maxQueueSize) {
      throw new RateLimitError(
        `Queue is full (${this.maxQueueSize} max)`,
        60000,
      );
    }

    // Check per-user limit
    const userRequests = (this.perUserRequests.get(userId) ?? 0) +
      (this.activeRequests.has(`${userId}-${requestId}`) ? 0 : 1);
    if (userRequests > this.maxPerUser) {
      throw new RateLimitError(
        `User has too many active requests (${this.maxPerUser} max)`,
        5000,
      );
    }

    // Check per-guild limit
    const guildRequests = (this.perGuildRequests.get(guildId) ?? 0) +
      (this.activeRequests.has(`${guildId}-${requestId}`) ? 0 : 1);
    if (guildRequests > this.maxPerGuild) {
      throw new RateLimitError(
        `Guild has too many active requests (${this.maxPerGuild} max)`,
        5000,
      );
    }

    const request: QueuedAIRequest = {
      id: requestId,
      prompt,
      userId,
      guildId,
      priority,
      createdAt: new Date(),
      timeout: null,
    };

    // Add to queue (sorted by priority)
    this.queue.push(request);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Update per-user and per-guild counts
    this.perUserRequests.set(userId, userRequests);
    this.perGuildRequests.set(guildId, guildRequests);
  }

  /**
   * Dequeue next request that can be processed
   */
  dequeue(): QueuedAIRequest | null {
    if (this.activeRequests.size >= this.maxConcurrent) {
      return null;
    }

    if (this.queue.length === 0) {
      return null;
    }

    const request = this.queue.shift();
    if (!request) {
      return null;
    }

    this.activeRequests.set(request.id, request);

    // Set timeout
    request.timeout = setTimeout(() => {
      this.markFailed(request.id);
    }, this.requestTimeoutMs);

    return request;
  }

  /**
   * Mark request as completed
   */
  markCompleted(requestId: string, latencyMs: number): void {
    const request = this.activeRequests.get(requestId);
    if (!request) {
      return;
    }

    if (request.timeout) {
      clearTimeout(request.timeout);
    }

    this.activeRequests.delete(requestId);
    this.totalProcessed++;

    // Update per-user and per-guild counts
    this.perUserRequests.set(
      request.userId,
      Math.max(0, (this.perUserRequests.get(request.userId) ?? 0) - 1),
    );
    this.perGuildRequests.set(
      request.guildId,
      Math.max(0, (this.perGuildRequests.get(request.guildId) ?? 0) - 1),
    );

    // Track latency
    this.latencies.push(latencyMs);
    if (this.latencies.length > this.maxLatencyWindow) {
      this.latencies.shift();
    }
  }

  /**
   * Mark request as failed
   */
  markFailed(requestId: string): void {
    const request = this.activeRequests.get(requestId);
    if (!request) {
      return;
    }

    if (request.timeout) {
      clearTimeout(request.timeout);
    }

    this.activeRequests.delete(requestId);
    this.totalErrors++;

    // Update per-user and per-guild counts
    this.perUserRequests.set(
      request.userId,
      Math.max(0, (this.perUserRequests.get(request.userId) ?? 0) - 1),
    );
    this.perGuildRequests.set(
      request.guildId,
      Math.max(0, (this.perGuildRequests.get(request.guildId) ?? 0) - 1),
    );
  }

  /**
   * Cancel request
   */
  cancel(requestId: string): boolean {
    // Try to remove from queue
    const queueIndex = this.queue.findIndex((r) => r.id === requestId);
    if (queueIndex !== -1) {
      this.queue.splice(queueIndex, 1);
      return true;
    }

    // Try to remove from active
    const request = this.activeRequests.get(requestId);
    if (request) {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
      this.activeRequests.delete(requestId);
      this.perUserRequests.set(
        request.userId,
        Math.max(0, (this.perUserRequests.get(request.userId) ?? 0) - 1),
      );
      this.perGuildRequests.set(
        request.guildId,
        Math.max(0, (this.perGuildRequests.get(request.guildId) ?? 0) - 1),
      );
      return true;
    }

    return false;
  }

  /**
   * Get metrics
   */
  getMetrics(): QueueMetrics {
    const averageLatency =
      this.latencies.length > 0
        ? this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length
        : 0;

    const oldestRequest = this.queue[this.queue.length - 1];
    const oldestRequestAge = oldestRequest
      ? Date.now() - oldestRequest.createdAt.getTime()
      : 0;

    return {
      queueSize: this.queue.length,
      activeRequests: this.activeRequests.size,
      totalProcessed: this.totalProcessed,
      totalErrors: this.totalErrors,
      averageLatencyMs: Math.round(averageLatency),
      oldestRequestAgeMs: oldestRequestAge,
    };
  }

  /**
   * Check if can accept new request without queuing
   */
  canAcceptImmediate(): boolean {
    return this.activeRequests.size < this.maxConcurrent;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Get active request count
   */
  getActiveCount(): number {
    return this.activeRequests.size;
  }

  /**
   * Shutdown - cleanup all timeouts
   */
  shutdown(): void {
    for (const request of this.activeRequests.values()) {
      if (request.timeout) {
        clearTimeout(request.timeout);
      }
    }
    this.activeRequests.clear();
    this.queue = [];
  }
}
