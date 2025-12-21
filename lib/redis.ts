import { Redis } from '@upstash/redis';

// Use Upstash Redis REST URL and token (see https://upstash.com/docs/redis/overall/getstarted)
const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

if (!restUrl || !restToken) {
  throw new Error('Upstash Redis environment variables missing. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
}

// Normalize URL to ensure it has https:// prefix
const normalizedUrl = restUrl.startsWith('http') ? restUrl : `https://${restUrl}`;

// Log the URL for debugging purposes (optional, can be removed after verification)
console.log(`[REDIS] Initializing with URL: ${normalizedUrl}`);

// Upstash Redis SDK does not support event listeners like ioredis
export const redis = new Redis({
  url: normalizedUrl,
  token: restToken,
});