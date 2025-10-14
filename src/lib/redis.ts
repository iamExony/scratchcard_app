import { Redis } from 'ioredis';

const getRedisUrl = () => {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }
  
  throw new Error('REDIS_URL is not defined');
};

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(getRedisUrl());

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Helper functions for payment intents
export async function storePaymentIntent(reference: string, data: any) {
  const key = `payment_intent:${reference}`;
  await redis.setex(key, 3600, JSON.stringify(data)); // Expire in 1 hour
}

export async function getPaymentIntent(reference: string) {
  const key = `payment_intent:${reference}`;
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function deletePaymentIntent(reference: string) {
  const key = `payment_intent:${reference}`;
  await redis.del(key);
}