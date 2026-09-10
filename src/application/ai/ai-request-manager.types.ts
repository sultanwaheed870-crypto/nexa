/**
 * Queued AI Request item
 */
export interface QueuedAIRequest {
  id: string;
  prompt: string;
  userId: string;
  guildId: string;
  priority: number;
  createdAt: Date;
  timeout: NodeJS.Timeout | null;
}

/**
 * Queue metrics
 */
export interface QueueMetrics {
  queueSize: number;
  activeRequests: number;
  totalProcessed: number;
  totalErrors: number;
  averageLatencyMs: number;
  oldestRequestAgeMs: number;
}
