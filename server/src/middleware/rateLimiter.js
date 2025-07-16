import { RateLimiterMemory } from 'rate-limiter-flexible';

export const rateLimiter = (windowMs, max) => {
  const rateLimiter = new RateLimiterMemory({
    points: max,
    duration: windowMs / 1000,
    blockDuration: 60 * 15
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
  points: 3, 
  duration: 15 * 60,
  blockDuration: 60 * 60
});

export const forgotPasswordLimiter = new RateLimiterMemory({
  points: 5,
  duration: 60 * 60,
  blockDuration: 60 * 60
});