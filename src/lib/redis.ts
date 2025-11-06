import { Redis } from 'ioredis';

const getRedisUrl = () => {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.error('REDIS_URL environment variable is not defined');
    return 'redis://localhost:6379'; // Fallback to local Redis for development
  }
  return url;
};

let redis: Redis;

try {
  const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
  };

  if (!globalForRedis.redis) {
    globalForRedis.redis = new Redis(getRedisUrl(), {
      maxRetriesPerRequest: 1,
      retryStrategy(times) {
        if (times > 3) {
          console.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });

    // Add error handler
    globalForRedis.redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });
  }

  redis = globalForRedis.redis;
} catch (error) {
  console.error('Failed to initialize Redis:', error);
  throw error;
}

// Helper functions for payment intents
export async function storePaymentIntent(reference: string, data: any) {
  try {
    const key = `payment_intent:${reference}`;
    await redis.setex(key, 3600, JSON.stringify(data)); // Expire in 1 hour
    return true;
  } catch (error) {
    console.error('Failed to store payment intent:', error);
    throw new Error('Failed to store payment intent in Redis');
  }
}

export async function getPaymentIntent(reference: string) {
  try {
    const key = `payment_intent:${reference}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to get payment intent:', error);
    throw new Error('Failed to retrieve payment intent from Redis');
  }
}

export async function deletePaymentIntent(reference: string) {
  try {
    const key = `payment_intent:${reference}`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Failed to delete payment intent:', error);
    throw new Error('Failed to delete payment intent from Redis');
  }
}