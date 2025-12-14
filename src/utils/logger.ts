/**
 * Simple logging utility with structured logging support
 * Can be easily replaced with Winston, Pino, or other logging libraries
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: {
    message: string;
    stack?: string;
    code?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamps: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m', // Green
  warn: '\x1b[33m', // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',
};

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    // biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for process.env
    const logLevel = process.env['LOG_LEVEL'];
    // biome-ignore lint/complexity/useLiteralKeys: TypeScript requires bracket notation for process.env
    const nodeEnv = process.env['NODE_ENV'];
    this.config = {
      level: (logLevel as LogLevel) || 'info',
      enableColors: nodeEnv !== 'production',
      enableTimestamps: true,
      ...config,
    };
  }

  /**
   * Set log level
   */
  public setLevel(level: LogLevel): void {
    this.config.level = level;
  }

  /**
   * Check if a log level is enabled
   */
  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  /**
   * Format log entry
   */
  private format(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta && { context: meta }),
    };

    if (this.config.enableColors && process.stdout.isTTY) {
      const color = COLORS[level];
      const timestamp = this.config.enableTimestamps ? `[${entry.timestamp}]` : '';
      const levelStr = `[${level.toUpperCase()}]`;
      const contextStr = meta ? ` ${JSON.stringify(meta)}` : '';
      return `${color}${timestamp} ${levelStr}${COLORS.reset} ${message}${contextStr}`;
    }

    return JSON.stringify(entry);
  }

  /**
   * Debug level logging
   */
  public debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.format('debug', message, meta));
    }
  }

  /**
   * Info level logging
   */
  public info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('info')) {
      console.info(this.format('info', message, meta));
    }
  }

  /**
   * Warning level logging
   */
  public warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('warn', message, meta));
    }
  }

  /**
   * Error level logging
   */
  public error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    if (this.shouldLog('error')) {
      const errorMeta = error
        ? {
            ...meta,
            error: {
              message: error.message,
              stack: error.stack,
              ...((error as Error & { code?: string }).code && {
                code: (error as Error & { code?: string }).code,
              }),
            },
          }
        : meta;

      console.error(this.format('error', message, errorMeta));
    }
  }

  /**
   * Create child logger with additional context
   */
  public child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.config);
    const originalMethods = {
      debug: childLogger.debug.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      error: childLogger.error.bind(childLogger),
    };

    childLogger.debug = (message: string, meta?: Record<string, unknown>) =>
      originalMethods.debug(message, { ...context, ...meta });
    childLogger.info = (message: string, meta?: Record<string, unknown>) =>
      originalMethods.info(message, { ...context, ...meta });
    childLogger.warn = (message: string, meta?: Record<string, unknown>) =>
      originalMethods.warn(message, { ...context, ...meta });
    childLogger.error = (message: string, error?: Error, meta?: Record<string, unknown>) =>
      originalMethods.error(message, error, { ...context, ...meta });

    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating custom loggers
export { Logger };
