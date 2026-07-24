import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import { getRedisClient } from '../config/redis.js';

export const rateLimiter = (windowMs, max) => {
  const memoryLimiter = new RateLimiterMemory({
    points: max,
    duration: windowMs / 1000,
    blockDuration: 60 * 5
  });

  return async (req, res, next) => {
    try {
      const redis = getRedisClient();
      const key = req.ip || '127.0.0.1';

      if (redis) {
        const redisLimiter = new RateLimiterRedis({
          storeClient: redis,
          points: max,
          duration: windowMs / 1000,
          blockDuration: 60 * 5,
          keyPrefix: 'rl_global'
        });
        await redisLimiter.consume(key);
      } else {
        await memoryLimiter.consume(key);
      }

      next();
    } catch (error) {
      const secondsToWait = error.msBeforeNext ? Math.ceil(error.msBeforeNext / 1000) : 60;
      res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${secondsToWait} seconds.`
      });
    }
  };
};

export const otpRateLimiter = new RateLimiterMemory({
  points: 10,
  duration: 10 * 60,
  blockDuration: 30 * 60
});

export const forgotPasswordLimiter = new RateLimiterMemory({
  points: 8, 
  duration: 30 * 60, 
  blockDuration: 30 * 60 
});