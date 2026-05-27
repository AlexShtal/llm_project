import { Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl || 60000);
  }

  async delete(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== undefined;
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
  ): Promise<T> {
    let value = await this.get<T>(key);
    if (value === undefined) {
      value = await factory();
      await this.set(key, value, ttl);
    }
    return value;
  }

  generateKey(...parts: (string | number)[]): string {
    return parts.join(':');
  }
}
