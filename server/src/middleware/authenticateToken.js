import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AUTH } from '../utils/constants.js';
import { getRedisClient } from '../config/redis.js';

const SESSION_CACHE_TTL = 900; // 15 minutes in seconds

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Access token required',
        expired: false 
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, AUTH.JWT_SECRET);
    const redis = getRedisClient();
    let foundUser = null;

    // Check Redis cache first to avoid DB query bottlenecks under high load
    if (redis) {
      try {
        const cachedUserStr = await redis.get(`user:session:${decoded.id}`);
        if (cachedUserStr) {
          foundUser = JSON.parse(cachedUserStr);
        }
      } catch (err) {
        // Fall back to database query silently if Redis get fails
      }
    }

    if (!foundUser) {
      const dbUser = await User.findById(decoded.id).lean();
      if (!dbUser) {
        console.error('❌ Auth middleware: User not found in DB for ID:', decoded.id);
        return res.status(401).json({ 
          message: 'User not found',
          expired: false 
        });
      }

      foundUser = {
        id: dbUser._id.toString(),
        email: dbUser.email,
        name: dbUser.name,
        isEmailVerified: dbUser.isEmailVerified
      };

      // Populate Redis cache asynchronously
      if (redis) {
        redis.setex(`user:session:${decoded.id}`, SESSION_CACHE_TTL, JSON.stringify(foundUser)).catch(() => {});
      }
    }

    if (!foundUser.isEmailVerified) {
      console.warn('⚠️ Auth middleware: User account not verified:', decoded.id);
      return res.status(403).json({ 
        message: 'Account not verified',
        expired: false 
      });
    }

    // Attach user to request object
    req.user = foundUser;

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        expired: true 
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        expired: false 
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({ 
        message: 'Token not active',
        expired: false 
      });
    }

    return res.status(500).json({ 
      message: 'Internal server error during authentication',
      expired: false 
    });
  }
};

export default authenticateToken;