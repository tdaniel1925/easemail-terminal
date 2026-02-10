import { Redis } from '@upstash/redis';

let redisInstance: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisInstance) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables must be set');
    }

    redisInstance = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    console.log('Upstash Redis client initialized');
  }

  return redisInstance;
}

export const redis = getRedisClient;

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redisClient = getRedisClient();
    const data = await redisClient.get<string>(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

export async function setCache(
  key: string,
  value: any,
  expirationSeconds: number = 3600
): Promise<void> {
  try {
    const redisClient = getRedisClient();
    await redisClient.set(key, JSON.stringify(value), { ex: expirationSeconds });
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    const redisClient = getRedisClient();
    await redisClient.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
}

export async function getCachedOrFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  expirationSeconds: number = 3600
): Promise<T> {
  // Try cache first
  const cached = await getCache<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetchFn();

  // Cache it
  await setCache(key, data, expirationSeconds);

  return data;
}
