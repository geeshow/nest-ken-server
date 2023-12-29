// redis.service.ts
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  async get(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async getInGroup(key: string, group: string): Promise<string> {
    return this.redisClient.get(`${group}:${key}`);
  }

  setInGroup(
    group: string,
    key: string,
    value: string | number | object,
    expireTime: number = 60 * 60 * 24,
  ) {
    const strVal =
      typeof value === 'object' ? JSON.stringify(value) : String(value);
    this.redisClient.set(`${group}:${key}`, strVal, 'EX', expireTime);
  }

  async set(key: string, value: string, expireTime: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', expireTime);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async deleteGroup(group: string): Promise<void> {
    const keys = await this.redisClient.keys(`${group}:*`);
    await this.redisClient.del(keys);
  }

  async flushall(): Promise<void> {
    await this.redisClient.flushall();
  }

  async exists(key: string): Promise<boolean> {
    return (await this.redisClient.exists(key)) > 0;
  }

  async existsGroup(group: string): Promise<boolean> {
    const keys = await this.redisClient.keys(`${group}:*`);
    return keys.length > 0;
  }

  async keys(group: string): Promise<string[]> {
    return this.redisClient.keys(`${group}:*`);
  }

  async getGroup(group: string): Promise<string[]> {
    const keys = await this.redisClient.keys(`${group}:*`);
    return this.redisClient.mget(keys);
  }

  async getGroupByKeys(keys: string[]): Promise<string[]> {
    return this.redisClient.mget(keys);
  }

  async setGroupByKeys(keys: string[], values: string[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    keys.forEach((key, index) => {
      pipeline.set(key, values[index]);
    });
    await pipeline.exec();
  }

  async deleteGroupByKeys(keys: string[]): Promise<void> {
    const pipeline = this.redisClient.pipeline();
    keys.forEach((key) => {
      pipeline.del(key);
    });
    await pipeline.exec();
  }
}
