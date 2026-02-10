import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client for rate limiting
let redis: Redis | null = null;

function getRedisClient(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('Redis not configured - rate limiting disabled');
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redis;
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the time window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Custom identifier key (defaults to IP address) */
  identifier?: string;
}

/**
 * Rate limiting utility using Redis
 * Uses sliding window algorithm
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  // Disable rate limiting in test/development environment
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_RATE_LIMIT === 'true') {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  const client = getRedisClient();

  // If Redis is not available, allow the request but log warning
  if (!client) {
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: Date.now() + config.windowSeconds * 1000,
    };
  }

  // Get identifier (IP address or custom key)
  const identifier =
    config.identifier ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';

  const key = `ratelimit:${identifier}:${config.windowSeconds}`;
  const now = Date.now();
  const windowStart = now - config.windowSeconds * 1000;

  try {
    // Remove old entries outside the current window
    await client.zremrangebyscore(key, 0, windowStart);

    // Count requests in current window
    const requestCount = await client.zcard(key);

    if (requestCount >= config.maxRequests) {
      // Rate limit exceeded
      const oldestRequest = await client.zrange(key, 0, 0, { withScores: true });
      const resetTime = oldestRequest.length > 1
        ? parseInt(String(oldestRequest[1])) + config.windowSeconds * 1000
        : now + config.windowSeconds * 1000;

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        reset: resetTime,
      };
    }

    // Add current request
    await client.zadd(key, { score: now, member: `${now}:${Math.random()}` });
    await client.expire(key, config.windowSeconds);

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - requestCount - 1,
      reset: now + config.windowSeconds * 1000,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // On error, allow the request but log
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      reset: now + config.windowSeconds * 1000,
    };
  }
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const result = await rateLimit(request, config);

    // Add rate limit headers
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toString());

    if (!result.success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many requests. Please try again in ${Math.ceil((result.reset - Date.now()) / 1000)} seconds.`,
          retryAfter: result.reset,
        },
        {
          status: 429,
          headers,
        }
      );
    }

    // Call the original handler
    const response = await handler(request);

    // Add rate limit headers to successful response
    result.remaining >= 0 && response.headers.set('X-RateLimit-Limit', result.limit.toString());
    result.remaining >= 0 && response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    result.remaining >= 0 && response.headers.set('X-RateLimit-Reset', result.reset.toString());

    return response;
  };
}

/**
 * Predefined rate limit configurations
 */
export const RateLimitPresets = {
  // Strict limits for expensive operations
  AI: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
  },
  // Authentication endpoints
  AUTH: {
    maxRequests: 5,
    windowSeconds: 60, // 5 attempts per minute
  },
  // Email sending
  EMAIL_SEND: {
    maxRequests: 30,
    windowSeconds: 60, // 30 emails per minute
  },
  // General API endpoints
  API: {
    maxRequests: 100,
    windowSeconds: 60, // 100 requests per minute
  },
  // Read-only operations
  READ: {
    maxRequests: 300,
    windowSeconds: 60, // 300 requests per minute
  },
  // Webhooks
  WEBHOOK: {
    maxRequests: 1000,
    windowSeconds: 60, // 1000 webhooks per minute
  },
};

/**
 * Get user-specific rate limit identifier
 */
export function getUserIdentifier(userId: string, endpoint: string): string {
  return `user:${userId}:${endpoint}`;
}
