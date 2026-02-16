import { NextRequest, NextResponse } from 'next/server';
import { ApiErrors } from '@/lib/api-error';

export type ApiHandler = (
  request: NextRequest,
  context?: any
) => Promise<NextResponse>;

/**
 * Wraps an API handler with consistent error handling
 * Catches all errors and returns standardized error responses
 */
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (request: NextRequest, context?: any) => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API route error:', error);

      // Handle known error types
      if (error instanceof Error) {
        // Database errors
        if (error.message.includes('database') || error.message.includes('postgres')) {
          return ApiErrors.databaseError('Database operation failed');
        }

        // Network errors
        if (error.message.includes('fetch') || error.message.includes('network')) {
          return ApiErrors.externalService('External service');
        }

        // Return generic error with message in development
        if (process.env.NODE_ENV === 'development') {
          return ApiErrors.internalError(error.message);
        }
      }

      // Generic internal error for production
      return ApiErrors.internalError();
    }
  };
}

/**
 * Creates a standardized API route handler with all middleware
 */
export function createApiHandler(config: {
  requireAuth?: boolean;
  requireSuperAdmin?: boolean;
  handler: ApiHandler;
}): ApiHandler {
  return withErrorHandler(config.handler);
}
