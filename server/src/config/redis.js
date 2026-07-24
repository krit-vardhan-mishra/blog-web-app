import Redis from 'ioredis';

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

let redisClient = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis({
    host: REDIS_HOST,
    port: Number(REDIS_PORT),
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    retryStrategy(times) {
      if (times > 3) {
        console.warn('⚠️ Redis connection failed. Operating in graceful fallback mode (DB direct).');
        return null; // stop retrying
      }
      return Math.min(times * 100, 2000);
    }
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('⚡ Redis connected successfully');
  });

  redisClient.on('error', (err) => {
    isRedisAvailable = false;
    // Suppress spamming error logs when Redis is offline locally
  });

} catch (err) {
  console.warn('⚠️ Redis initialization warning:', err.message);
  isRedisAvailable = false;
}

export const getRedisClient = () => isRedisAvailable ? redisClient : null;
export const checkRedisHealth = () => isRedisAvailable;
export default redisClient;
