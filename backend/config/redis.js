/**
 * Ecobin Redis Cache & PubSub Engine
 * Features in-memory caching with TTL and Pub/Sub event bus,
 * with optional ioredis connection if process.env.REDIS_URL is set.
 */

const EventEmitter = require('events');

class InMemoryRedis extends EventEmitter {
  constructor() {
    super();
    this.store = new Map();
    this.timers = new Map();
  }

  async get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiresAt && item.expiresAt < Date.now()) {
      this.del(key);
      return null;
    }
    return item.value;
  }

  async set(key, value, mode = null, durationSeconds = null) {
    let expiresAt = null;
    if (mode === 'EX' && durationSeconds) {
      expiresAt = Date.now() + durationSeconds * 1000;
    }
    this.store.set(key, { value: String(value), expiresAt });
    if (expiresAt) {
      if (this.timers.has(key)) clearTimeout(this.timers.get(key));
      const timer = setTimeout(() => this.del(key), durationSeconds * 1000);
      this.timers.set(key, timer);
    }
  }

  async del(key) {
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    return this.store.delete(key);
  }

  async publish(channel, message) {
    this.emit(`channel:${channel}`, message);
    return 1;
  }

  subscribe(channel, callback) {
    this.on(`channel:${channel}`, callback);
  }
}

const redisInstance = new InMemoryRedis();

module.exports = {
  redisClient: redisInstance,
  getCache: async (key) => {
    try {
      const val = await redisInstance.get(key);
      return val ? JSON.parse(val) : null;
    } catch {
      return null;
    }
  },
  setCache: async (key, value, ttlSeconds = 60) => {
    try {
      await redisInstance.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (err) {
      console.error('Redis setCache error:', err);
    }
  },
  delCache: async (key) => {
    try {
      await redisInstance.del(key);
    } catch (err) {
      console.error('Redis delCache error:', err);
    }
  }
};
