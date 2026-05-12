const { createClient } = require('redis');
const config = require('../config');

const redis = createClient({ url: config.redis.url });

redis.on('error', (err) => console.error('Redis client error:', err));
redis.on('connect', () => console.log('✓ Redis connected'));

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
  return redis;
}

module.exports = { redis, connectRedis };
