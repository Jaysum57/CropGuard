/**
 * Professional Logger Utility
 * Automatically disables non-error logs in production builds
 * Keeps error logging active for debugging production issues
 */

class Logger {
  /**
   * Log informational messages (disabled in production)
   * Use for: cache hits, general info, flow tracking
   */
  log(...args: any[]) {
    if (__DEV__) {
      console.log(...args);
    }
  }

  /**
   * Log debug messages (disabled in production)
   * Use for: detailed debugging, verbose output
   */
  debug(...args: any[]) {
    if (__DEV__) {
      console.debug(...args);
    }
  }

  /**
   * Log warning messages (disabled in production)
   * Use for: deprecated features, non-critical issues
   */
  warn(...args: any[]) {
    if (__DEV__) {
      console.warn(...args);
    }
  }

  /**
   * Log error messages (ALWAYS active, even in production)
   * Use for: errors, exceptions, critical issues
   * These help debug production issues through crash reporting services
   */
  error(...args: any[]) {
    console.error(...args);
  }

  /**
   * Log info with emoji indicators (disabled in production)
   * Provides visual feedback in development
   */
  info(message: string, emoji: string = 'ℹ️') {
    if (__DEV__) {
      console.log(`${emoji} ${message}`);
    }
  }

  /**
   * Log success messages (disabled in production)
   */
  success(message: string) {
    if (__DEV__) {
      console.log(`✅ ${message}`);
    }
  }

  /**
   * Log cache-related messages (disabled in production)
   */
  cache(message: string, type: 'hit' | 'miss' | 'expired' | 'invalidated') {
    if (__DEV__) {
      const emoji = {
        hit: '✅',
        miss: '❌',
        expired: '⏰',
        invalidated: '🗑️',
      }[type];
      console.log(`${emoji} ${message}`);
    }
  }

  /**
   * Log with custom emoji (disabled in production)
   */
  custom(emoji: string, message: string) {
    if (__DEV__) {
      console.log(`${emoji} ${message}`);
    }
  }

  /**
   * Group logs together (disabled in production)
   */
  group(label: string, callback: () => void) {
    if (__DEV__) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  }

  /**
   * Log execution time of a function (disabled in production)
   */
  time(label: string) {
    if (__DEV__) {
      console.time(label);
    }
  }

  timeEnd(label: string) {
    if (__DEV__) {
      console.timeEnd(label);
    }
  }

  /**
   * Log table data (disabled in production)
   */
  table(data: any) {
    if (__DEV__) {
      console.table(data);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Also export as default for convenience
export default logger;
