import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
});

export { redis };

export class NewsletterCache {
  private static readonly CACHE_PREFIX = 'newsletter:';
  private static readonly CACHE_TTL = 3600; // 1 hour

  static async get(key: string): Promise<any> {
    try {
      const cached = await redis.get(`${this.CACHE_PREFIX}${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await redis.setex(
        `${this.CACHE_PREFIX}${key}`,
        ttl || this.CACHE_TTL,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(`${this.CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Redis del error:', error);
    }
  }

  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(`${this.CACHE_PREFIX}${pattern}`);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Redis invalidate error:', error);
    }
  }
}
