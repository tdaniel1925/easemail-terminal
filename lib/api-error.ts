import { NextResponse } from 'next/server';

/**
 * Standard API error response format
 * Ensures consistency across all API endpoints
 */
export interface ApiErrorResponse {
  error: string;              // Human-readable error message
  code?: string;              // Error code for programmatic handling
  details?: any;              // Additional details (validation errors, etc.)
  timestamp: string;          // ISO timestamp
}

/**
 * Common error codes
 */
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_FIELD: 'MISSING_FIELD',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  EMAIL_SERVICE_ERROR: 'EMAIL_SERVICE_ERROR',

  // Database
  DATABASE_ERROR: 'DATABASE_ERROR',

  // Generic
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const;

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  error: string,
  status: number = 500,
  code?: string,
  details?: any
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error,
    timestamp: new Date().toISOString(),
  };

  if (code) {
    response.code = code;
  }

  if (details) {
    response.details = details;
  }

  return NextResponse.json(response, { status });
}

/**
 * Pre-configured error responses for common scenarios
 */
export const ApiErrors = {
  unauthorized: (message: string = 'Unauthorized') =>
    createErrorResponse(message, 401, ErrorCodes.UNAUTHORIZED),

  forbidden: (message: string = 'Forbidden') =>
    createErrorResponse(message, 403, ErrorCodes.FORBIDDEN),

  notFound: (resource: string = 'Resource') =>
    createErrorResponse(`${resource} not found`, 404, ErrorCodes.NOT_FOUND),

  badRequest: (message: string = 'Bad request', details?: any) =>
    createErrorResponse(message, 400, ErrorCodes.BAD_REQUEST, details),

  validationError: (details: any) =>
    createErrorResponse('Validation failed', 422, ErrorCodes.VALIDATION_ERROR, details),

  rateLimit: (resetTime: number) =>
    createErrorResponse(
      `Rate limit exceeded. Try again in ${Math.ceil((resetTime - Date.now()) / 1000)}s.`,
      429,
      ErrorCodes.RATE_LIMIT_EXCEEDED,
      { reset: resetTime }
    ),

  internalError: (message: string = 'Internal server error', details?: any) =>
    createErrorResponse(message, 500, ErrorCodes.INTERNAL_ERROR, details),

  externalService: (service: string, details?: any) =>
    createErrorResponse(
      `External service error: ${service}`,
      502,
      ErrorCodes.EXTERNAL_SERVICE_ERROR,
      details
    ),

  databaseError: (message: string = 'Database operation failed', details?: any) =>
    createErrorResponse(message, 500, ErrorCodes.DATABASE_ERROR, details),

  conflict: (resource: string = 'Resource', details?: any) =>
    createErrorResponse(
      `${resource} already exists`,
      409,
      ErrorCodes.ALREADY_EXISTS,
      details
    ),

  unprocessableEntity: (message: string, details?: any) =>
    createErrorResponse(message, 422, ErrorCodes.VALIDATION_ERROR, details),

  methodNotAllowed: (allowedMethods: string[]) =>
    createErrorResponse(
      `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      405,
      ErrorCodes.BAD_REQUEST,
      { allowedMethods }
    ),

  payloadTooLarge: (maxSize: string) =>
    createErrorResponse(
      `Payload too large. Maximum size: ${maxSize}`,
      413,
      ErrorCodes.BAD_REQUEST,
      { maxSize }
    ),

  serviceUnavailable: (message: string = 'Service temporarily unavailable') =>
    createErrorResponse(message, 503, ErrorCodes.EXTERNAL_SERVICE_ERROR),

  gatewayTimeout: (service: string) =>
    createErrorResponse(
      `Request to ${service} timed out`,
      504,
      ErrorCodes.EXTERNAL_SERVICE_ERROR
    ),
};

/**
 * Helper to handle Supabase errors
 */
export function handleSupabaseError(error: any, fallbackMessage: string = 'Database operation failed') {
  console.error('Supabase error:', error);

  // Known Supabase error codes
  if (error.code === 'PGRST116') {
    return ApiErrors.notFound('Resource');
  }
  if (error.code === '23505') {
    return ApiErrors.conflict('Resource');
  }
  if (error.code === '23503') {
    return ApiErrors.badRequest('Referenced resource does not exist');
  }
  if (error.code === '42501') {
    return ApiErrors.forbidden('Insufficient permissions');
  }

  return ApiErrors.databaseError(fallbackMessage);
}
