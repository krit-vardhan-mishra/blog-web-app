import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = (windowMs, max) => {
  const rateLimiter = new RateLimiterMemory({
    points: max,
    duration: windowMs / 1000,
    blockDuration: 60 * 5
  });

  return async (req, res, next) => {
    try {
      const key = req.ip;
      await rateLimiter.consume(key);
      next();
    } catch (error) {
      res.status(429).json({
        success: false,
        message: `Too many requests. Please try again in ${Math.ceil(error.msBeforeNext / 1000)} seconds.`
      });
    }
  };
};

export const otpRateLimiter = new RateLimiterMemory({
  points: 5,
  duration: 10 * 60,
  blockDuration: 30 * 60
});

export const forgotPasswordLimiter = new RateLimiterMemory({
  points: 8, 
  duration: 30 * 60, 
  blockDuration: 30 * 60 
});