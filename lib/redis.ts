import { Redis } from '@upstash/redis';

// Use Upstash Redis REST URL and token (see https://upstash.com/docs/redis/overall/getstarted)
const restUrl = process.env.UPSTASH_REDIS_REST_URL;
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN;

if (!restUrl || !restToken) {
  throw new Error('Upstash Redis environment variables missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
}

// Upstash Redis SDK does not support event listeners like ioredis
export const redis = new Redis({
  url: restUrl,
  token: restToken,
}); 