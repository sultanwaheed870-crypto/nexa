import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger.interface';

interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Local File Logger
 * Writes structured logs to local files
 * Never logs sensitive data (tokens, passwords, etc.)
 */
export class LocalLogger implements Logger {
  private logDir: string;
  private currentDate: string;
  private logLevelThreshold: number;
  private logLevels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

  constructor(
    logDir: string = './data/logs',
    logLevel: string = 'info',
  ) {
    this.logDir = logDir;
    this.currentDate = this.getDateString();
    this.logLevelThreshold =
      this.logLevels[logLevel.toUpperCase() as keyof typeof this.logLevels] ??
      this.logLevels.INFO;

    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  private getLogFilePath(level: string): string {
    const date = this.getDateString();
    if (date !== this.currentDate) {
      this.currentDate = date;
    }
    return path.join(this.logDir, `${level.toLowerCase()}-${date}.log`);
  }

  private sanitizeMetadata(
    metadata?: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!metadata) return {};

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      'token',
      'password',
      'secret',
      'key',
      'auth',
      'api_key',
    ];

    for (const [key, value] of Object.entries(metadata)) {
      const lowerKey = key.toLowerCase();
      if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeMetadata(
          value as Record<string, unknown>,
        );
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  private writeLog(
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    const levelNum =
      this.logLevels[level as keyof typeof this.logLevels] ?? 1;
    if (levelNum < this.logLevelThreshold) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: this.sanitizeMetadata(metadata),
    };

    const logLine = JSON.stringify(entry);
    const filePath = this.getLogFilePath(level);

    try {
      fs.appendFileSync(filePath, logLine + '\n');
    } catch (error) {
      console.error(`Failed to write to log file ${filePath}:`, error);
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('INFO', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('WARN', message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('ERROR', message, metadata);
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('DEBUG', message, metadata);
  }
}
