import Redis from 'ioredis';

let redisInstance: Redis | null = null;

function getRedisClient(): Redis {
  if (!redisInstance) {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redisInstance = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisInstance.on('error', (error) => {
      console.error('Redis error:', error);
    });

    redisInstance.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redisInstance;
}

export const redis = getRedisClient;

// Cache helper functions
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const redisClient = getRedisClient();
    const data = await redisClient.get(key);
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
    await redisClient.setex(key, expirationSeconds, JSON.stringify(value));
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
