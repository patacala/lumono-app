import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class CacheService {
  private client: RedisClientType;
  private readonly logger = new Logger(CacheService.name);
  private connected = false;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = createClient({
      url: `redis://${host}:${port}`,
    }) as RedisClientType;

    this.client.on('error', (err) => {
      this.logger.warn(`Redis connection error: ${err.message}`);
      this.connected = false;
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
      this.connected = true;
    });

    this.client.connect().catch((err) => {
      this.logger.warn(`Redis initial connection failed: ${err.message}. Cache will be bypassed.`);
    });
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch {
      // Cache write failure is non-critical
    }
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.del(key);
    } catch {
      // Cache delete failure is non-critical
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch {
      // Cache invalidation failure is non-critical
    }
  }
}
