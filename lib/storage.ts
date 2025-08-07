import { kv } from '@vercel/kv';

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

// Vercel KV storage (recommended for production)
class VercelKVStorage implements StorageBackend {
  private kvClient: typeof kv | null = null;

  constructor() {
    // Try to use Vercel KV
    try {
      this.kvClient = kv;
      console.log('Vercel KV client initialized successfully');
    } catch (error) {
      console.warn('Vercel KV not available, falling back to in-memory storage:', error);
      this.kvClient = null;
    }
  }

  async get(key: string): Promise<string | null> {
    if (!this.kvClient) return null;
    try {
      const value = await this.kvClient.get(key);
      return value ? String(value) : null;
    } catch (error) {
      console.error('Error getting from Vercel KV:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (!this.kvClient) return;
    try {
      if (ttl) {
        await this.kvClient.setex(key, ttl, value);
      } else {
        await this.kvClient.set(key, value);
      }
    } catch (error) {
      console.error('Error setting in Vercel KV:', error);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.kvClient) return;
    try {
      await this.kvClient.del(key);
    } catch (error) {
      console.error('Error deleting from Vercel KV:', error);
    }
  }

  async list(prefix: string): Promise<string[]> {
    if (!this.kvClient) return [];
    try {
      const keys = await this.kvClient.keys(`${prefix}*`);
      return keys;
    } catch (error) {
      console.error('Error listing from Vercel KV:', error);
      return [];
    }
  }
}

// Storage factory
export function createStorage(): StorageBackend {
  // In production, try to use Vercel KV if available
  if (process.env.NODE_ENV === 'production' && process.env.KV_URL) {
    return new VercelKVStorage();
  }
  
  // Fallback to in-memory storage
  return new InMemoryStorage();
}

// Global storage instance
export const storage = createStorage();
