import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists in database
    const foundUser = await User.findById(decoded.id);
    if (!foundUser) {
      console.error('❌ Auth middleware: User not found in DB for ID:', decoded.id);
      return res.status(401).json({ 
        message: 'User not found',
        expired: false 
      });
    }

    if (!foundUser.isEmailVerified) {
      console.warn('⚠️ Auth middleware: User account not verified:', decoded.id);
      return res.status(403).json({ 
        message: 'Account not verified',
        expired: false 
      });
    }

    // Attach user to request object
    req.user = {
      id: foundUser._id.toString(),
      email: foundUser.email,
      name: foundUser.name,
      isEmailVerified: foundUser.isEmailVerified
    };

    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);

    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      console.warn('⏰ Auth middleware: Token expired');
      return res.status(401).json({ 
        message: 'Token expired',
        expired: true 
      });
    }

    if (error.name === 'JsonWebTokenError') {
      console.warn('🔐 Auth middleware: Invalid token');
      return res.status(401).json({ 
        message: 'Invalid token',
        expired: false 
      });
    }

    if (error.name === 'NotBeforeError') {
      console.warn('⏰ Auth middleware: Token not active');
      return res.status(401).json({ 
        message: 'Token not active',
        expired: false 
      });
    }

    // Database or other errors
    console.error('💥 Auth middleware: Database error:', error.message);
    return res.status(500).json({ 
      message: 'Internal server error during authentication',
      expired: false 
    });
  }
};

export default authenticateToken;