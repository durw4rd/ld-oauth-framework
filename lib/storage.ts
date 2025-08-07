import { createClient } from 'redis';

// Storage abstraction for different environments
export interface StorageBackend {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
}

// In-memory storage (fallback)
class InMemoryStorage implements StorageBackend {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async list(prefix: string): Promise<string[]> {
    return Array.from(this.store.keys()).filter(key => key.startsWith(prefix));
  }
}

// Redis storage (production)
class RedisStorage implements StorageBackend {
  private redis: ReturnType<typeof createClient> | null = null;

  constructor() {
    // Try to create Redis client
    try {
      this.redis = createClient({
        url: process.env.REDIS_URL,
      });
      
      // Connect to Redis
      this.redis.connect().then(() => {
        console.log('Redis client connected successfully');
      }).catch((error) => {
        console.warn('Failed to connect to Redis, falling back to in-memory storage:', error);
        this.redis = null;
      });
    } catch (error) {
      console.warn('Redis not available, falling back to in-memory storage:', error);
      this.redis = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.redis) return null;
    try {
      const value = await this.redis.get(key);
      return value ? String(value) : null;
    } catch (error) {
      console.error('Error getting from Redis:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.redis) return;
    try {
      if (ttl) {
        await this.redis.setEx(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
    } catch (error) {
      console.error('Error setting in Redis:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redis) return;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Error deleting from Redis:', error);
    }
  }

  async list(prefix: string): Promise<string[]> {
    if (!this.redis) return [];
    try {
      const keys = await this.redis.keys(`${prefix}*`);
      return keys.map(key => String(key));
    } catch (error) {
      console.error('Error listing from Redis:', error);
      return [];
    }
  }
}

// Storage factory
export function createStorage(): StorageBackend {
  // In production, try to use Redis if available
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    return new RedisStorage();
  }
  
  // Fallback to in-memory storage
  return new InMemoryStorage();
}

// Global storage instance
export const storage = createStorage();
