export enum ErrorType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  VALIDATION = 'validation',
  SERVER = 'server',
  CLIENT = 'client',
  DATABASE = 'database',
  EXTERNAL_SERVICE = 'external_service',
  RATE_LIMIT = 'rate_limit',
  NOT_FOUND = 'not_found',
  CONFLICT = 'conflict',
  UNKNOWN = 'unknown',
}

export interface AppError {
  type: ErrorType;
  message: string;
  stack?: string;
  digest?: string;
  code?: string;
  recoverable?: boolean;
}

export function categorizeError(error: Error): AppError {
  const message = error.message.toLowerCase();

  // Authentication errors
  if (
    message.includes('auth') ||
    message.includes('unauthorized') ||
    message.includes('unauthenticated') ||
    message.includes('token') ||
    message.includes('session')
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      message: error.message,
      stack: error.stack,
      recoverable: false,
    };
  }

  // Authorization errors
  if (
    message.includes('forbidden') ||
    message.includes('permission') ||
    message.includes('access denied')
  ) {
    return {
      type: ErrorType.AUTHORIZATION,
      message: error.message,
      stack: error.stack,
      recoverable: false,
    };
  }

  // Network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('connection') ||
    message.includes('timeout') ||
    message.includes('offline')
  ) {
    return {
      type: ErrorType.NETWORK,
      message: error.message,
      stack: error.stack,
      recoverable: true,
    };
  }

  // Validation errors
  if (
    message.includes('validation') ||
    message.includes('invalid') ||
    message.includes('required')
  ) {
    return {
      type: ErrorType.VALIDATION,
      message: error.message,
      stack: error.stack,
      recoverable: false,
    };
  }

  // Database errors
  if (
    message.includes('database') ||
    message.includes('postgres') ||
    message.includes('query') ||
    message.includes('supabase')
  ) {
    return {
      type: ErrorType.DATABASE,
      message: error.message,
      stack: error.stack,
      recoverable: true,
    };
  }

  // Rate limit errors
  if (message.includes('rate limit') || message.includes('too many requests')) {
    return {
      type: ErrorType.RATE_LIMIT,
      message: error.message,
      stack: error.stack,
      recoverable: true,
    };
  }

  // Not found errors
  if (message.includes('not found') || message.includes('404')) {
    return {
      type: ErrorType.NOT_FOUND,
      message: error.message,
      stack: error.stack,
      recoverable: false,
    };
  }

  // Server errors (500+)
  if (
    message.includes('server') ||
    message.includes('500') ||
    message.includes('internal')
  ) {
    return {
      type: ErrorType.SERVER,
      message: error.message,
      stack: error.stack,
      recoverable: true,
    };
  }

  return {
    type: ErrorType.UNKNOWN,
    message: error.message,
    stack: error.stack,
    recoverable: false,
  };
}

export function getUserFriendlyMessage(type: ErrorType): string {
  switch (type) {
    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please log in again.';
    case ErrorType.AUTHORIZATION:
      return "You don't have permission to access this resource.";
    case ErrorType.NETWORK:
      return 'Connection issue detected. Please check your internet and try again.';
    case ErrorType.VALIDATION:
      return 'The information provided is invalid. Please review and try again.';
    case ErrorType.DATABASE:
      return 'Data operation failed. Please try again in a moment.';
    case ErrorType.RATE_LIMIT:
      return "You're doing that too quickly. Please wait a moment and try again.";
    case ErrorType.NOT_FOUND:
      return "We couldn't find what you're looking for.";
    case ErrorType.SERVER:
      return 'Our servers are having trouble. Please try again in a moment.';
    case ErrorType.EXTERNAL_SERVICE:
      return 'External service is temporarily unavailable. Please try again later.';
    default:
      return 'Something unexpected happened. Our team has been notified.';
  }
}
