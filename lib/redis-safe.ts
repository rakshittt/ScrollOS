import { redis } from './redis';

/**
 * Safe wrapper for Redis operations to prevent 500 errors when Redis is unreachable (e.g. ENOTFOUND).
 */
export const redisSafe = {
    async get(key: string): Promise<any> {
        try {
            return await redis.get(key);
        } catch (error) {
            console.error(`[REDIS-SAFE] GET error for key ${key}:`, error);
            return null;
        }
    },

    async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
        try {
            await redis.set(key, value, options as any);
        } catch (error) {
            console.error(`[REDIS-SAFE] SET error for key ${key}:`, error);
        }
    },

    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (error) {
            console.error(`[REDIS-SAFE] DEL error for key ${key}:`, error);
        }
    }
};
