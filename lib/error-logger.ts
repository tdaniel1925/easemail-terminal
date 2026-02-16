import { AppError, ErrorType, categorizeError } from './error-types';

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  organizationId?: string;
  recentActions?: Array<{ action: string; timestamp: string }>;
  userAgent?: string;
  url?: string;
  digest?: string;
  [key: string]: any;
}

export function captureErrorContext(): ErrorContext {
  const context: ErrorContext = {};

  // Capture user session from localStorage
  if (typeof window !== 'undefined') {
    try {
      const sessionData = localStorage.getItem('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        context.userId = session.userId;
        context.sessionId = session.sessionId;
        context.organizationId = session.organizationId;
      }

      // Capture recent actions (last 5)
      const recentActions = localStorage.getItem('recent_actions');
      if (recentActions) {
        context.recentActions = JSON.parse(recentActions).slice(-5);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  return context;
}

export function logError(error: AppError, context?: ErrorContext) {
  const fullContext = {
    ...captureErrorContext(),
    ...context,
  };

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error Logger]', {
      type: error.type,
      message: error.message,
      stack: error.stack,
      context: fullContext,
    });
  }

  // In production, send to error tracking service (Sentry, etc.)
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with Sentry or error tracking service
    // Example: Sentry.captureException(error, { extra: fullContext });
  }

  // Store in localStorage for debugging (optional)
  if (typeof window !== 'undefined') {
    try {
      const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
      errorLog.push({
        timestamp: new Date().toISOString(),
        error,
        context: fullContext,
      });
      // Keep last 10 errors
      localStorage.setItem('error_log', JSON.stringify(errorLog.slice(-10)));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

export function trackUserAction(action: string) {
  if (typeof window !== 'undefined') {
    try {
      const recentActions = JSON.parse(localStorage.getItem('recent_actions') || '[]');
      recentActions.push({
        action,
        timestamp: new Date().toISOString(),
      });
      // Keep last 20 actions
      localStorage.setItem('recent_actions', JSON.stringify(recentActions.slice(-20)));
    } catch (e) {
      // Ignore localStorage errors
    }
  }
}

export function clearErrorLog() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('error_log');
      localStorage.removeItem('recent_actions');
    } catch (e) {
      // Ignore
    }
  }
}

export { categorizeError };
