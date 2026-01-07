/**
 * Logger Utility
 *
 * Development-only logging utility with DEBUG flag.
 * All logs are stripped from production builds to reduce bundle size
 * and prevent leaking sensitive information to users.
 *
 * @feature 014-teleprompter-preview-sync
 */

/**
 * Debug mode flag - only true in development environment.
 * In production, all logging is disabled for performance and security.
 */
const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Log levels for categorizing messages
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger class with level-based logging and dev-only output
 */
class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix ? `[${prefix}]` : '';
  }

  /**
   * Log debug messages (only in development)
   */
  debug(...args: unknown[]): void {
    if (DEBUG) {
      console.log(`${this.prefix}`, ...args);
    }
  }

  /**
   * Log informational messages (only in development)
   */
  info(...args: unknown[]): void {
    if (DEBUG) {
      console.info(`${this.prefix}`, ...args);
    }
  }

  /**
   * Log warning messages (only in development)
   */
  warn(...args: unknown[]): void {
    if (DEBUG) {
      console.warn(`${this.prefix}`, ...args);
    }
  }

  /**
   * Log error messages (always logged, even in production)
   */
  error(...args: unknown[]): void {
    console.error(`${this.prefix}`, ...args);
  }

  /**
   * Create a new logger with a different prefix
   */
  withPrefix(prefix: string): Logger {
    return new Logger(`${this.prefix.replace(/^\[|\]$/g, '')}${prefix ? '/' + prefix : ''}`);
  }
}

/**
 * Create a new logger instance with the given prefix
 *
 * @example
 * ```ts
 * const logger = createLogger('usePreviewSync');
 * logger.debug('State changed:', { hasChanged: true });
 * ```
 */
export function createLogger(prefix: string): Logger {
  return new Logger(prefix);
}

/**
 * Default logger export for quick access
 */
export const logger = new Logger();

/**
 * Convenience exports for quick logging without creating an instance
 */
export const log = {
  debug: (...args: unknown[]) => logger.debug(...args),
  info: (...args: unknown[]) => logger.info(...args),
  warn: (...args: unknown[]) => logger.warn(...args),
  error: (...args: unknown[]) => logger.error(...args),
};
