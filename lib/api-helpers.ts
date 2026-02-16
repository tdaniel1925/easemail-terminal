import { NextResponse } from 'next/server';

/**
 * Standardized API error response
 */
export function errorResponse(
  message: string,
  status: number = 500,
  details?: any
) {
  return NextResponse.json(
    {
      error: message,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Standardized API success response
 */
export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Safe database query wrapper with automatic error handling
 */
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  resourceName: string = 'Resource'
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const { data, error } = await queryFn();

    if (error) {
      console.error(`Database error for ${resourceName}:`, error);
      return {
        data: null,
        error: `Failed to fetch ${resourceName}: ${error.message}`,
      };
    }

    if (!data) {
      return {
        data: null,
        error: `${resourceName} not found`,
      };
    }

    return { data, error: null };
  } catch (error: any) {
    console.error(`Unexpected error in safeQuery for ${resourceName}:`, error);
    return {
      data: null,
      error: `Unexpected error: ${error.message}`,
    };
  }
}

/**
 * Safe external API call wrapper with error handling
 */
export async function safeExternalCall<T>(
  apiFn: () => Promise<T>,
  apiName: string = 'External API'
): Promise<{ data: T; error: null } | { data: null; error: string }> {
  try {
    const data = await apiFn();
    return { data, error: null };
  } catch (error: any) {
    console.error(`${apiName} error:`, error);

    // Handle common API errors
    if (error.status === 401 || error.status === 403) {
      return {
        data: null,
        error: `${apiName} authentication failed`,
      };
    }

    if (error.status === 429) {
      return {
        data: null,
        error: `${apiName} rate limit exceeded`,
      };
    }

    if (error.status >= 500) {
      return {
        data: null,
        error: `${apiName} is temporarily unavailable`,
      };
    }

    return {
      data: null,
      error: error.message || `${apiName} request failed`,
    };
  }
}

/**
 * P4-API-009: Retry wrapper for transient external API failures
 * Implements exponential backoff for failed requests
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = (error: any) => {
      // Retry on network errors, timeouts, and 5xx server errors
      const status = error?.status || error?.response?.status;
      return !status || status >= 500 || status === 408 || status === 429;
    },
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry if this is the last attempt or if we shouldn't retry this error
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Calculate delay with exponential backoff and jitter
      const exponentialDelay = Math.min(
        initialDelayMs * Math.pow(2, attempt),
        maxDelayMs
      );
      const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
      const delay = exponentialDelay + jitter;

      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Type guard to check if a value is a valid array
 */
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }
  return [];
}

/**
 * Safely access object property with fallback
 */
export function safeGet<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return fallback;
      }
      result = result[key];
    }

    return result !== undefined && result !== null ? result : fallback;
  } catch {
    return fallback;
  }
}
