/**
 * Application-wide logger with structured logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  userId?: string;
  requestId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context) : '';

    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('info', message, context));
    // TODO: Send to logging service (DataDog, CloudWatch, etc.)
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('warn', message, context));
    // TODO: Send to logging service
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorContext = {
      ...context,
      error: error instanceof Error ? {
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
        name: error.name,
      } : error,
    };

    console.error(this.formatMessage('error', message, errorContext));
    // TODO: Send to error tracking (Sentry, Rollbar, etc.)
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  /**
   * Log API request with timing
   */
  apiRequest(method: string, path: string, duration: number, context?: LogContext) {
    this.info(`API ${method} ${path}`, {
      ...context,
      duration,
      type: 'api-request',
    });
  }

  /**
   * Log database query with timing
   */
  dbQuery(table: string, operation: string, duration: number, context?: LogContext) {
    this.debug(`DB ${operation} on ${table}`, {
      ...context,
      duration,
      type: 'db-query',
    });
  }

  /**
   * Log external API call with timing
   */
  externalCall(service: string, operation: string, duration: number, success: boolean, context?: LogContext) {
    const level = success ? 'info' : 'warn';
    const message = `External API ${service}.${operation} ${success ? 'succeeded' : 'failed'}`;

    this[level](message, {
      ...context,
      duration,
      success,
      type: 'external-api',
    });
  }
}

export const logger = new Logger();

/**
 * Performance monitoring helper
 */
export class PerformanceMonitor {
  private metrics: Map<string, number> = new Map();

  start(label: string) {
    this.metrics.set(label, Date.now());
  }

  end(label: string): number {
    const startTime = this.metrics.get(label);
    if (!startTime) {
      logger.warn(`No start time found for performance metric: ${label}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.metrics.delete(label);

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      logger.warn(`Slow operation detected: ${label}`, {
        duration,
        component: 'performance-monitor',
      });
    }

    return duration;
  }

  async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      const duration = this.end(label);
      logger.debug(`Operation completed: ${label}`, { duration });
      return result;
    } catch (error) {
      this.end(label);
      logger.error(`Operation failed: ${label}`, error);
      throw error;
    }
  }
}

export const perfMonitor = new PerformanceMonitor();
