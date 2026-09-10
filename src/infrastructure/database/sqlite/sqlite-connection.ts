import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SQLite Database Connection
 * Manages local SQLite database
 */
export class SQLiteConnection {
  private db: Database.Database | null = null;
  private dbPath: string;
  private isInitialized: boolean = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   * Initialize database connection
   */
  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    // Create directory if it doesn't exist
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.isInitialized = true;
    } catch (error) {
      throw new Error(
        `Failed to initialize SQLite database at ${this.dbPath}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Get database instance
   */
  getDatabase(): Database.Database {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /**
   * Execute SQL query
   */
  exec(sql: string): void {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    this.db.exec(sql);
  }

  /**
   * Prepare and execute statement
   */
  prepare<T = unknown>(sql: string) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db.prepare(sql) as Database.Statement<T>;
  }

  /**
   * Execute transaction
   */
  transaction<T>(fn: () => T): T {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if database is initialized
   */
  isReady(): boolean {
    return this.isInitialized && this.db !== null;
  }
}
