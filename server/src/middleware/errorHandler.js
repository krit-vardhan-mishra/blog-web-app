import { ApiError } from '../utils/ApiError.js';
import { SERVER } from '../utils/constants.js';

const errorHandler = (err, req, res, next) => {
  console.error('❌ Global error:', err);

  // Handle known API errors
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: err.data,
      status: err.status
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(val => val.message),
      status: 400
    });
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      status: 409
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      status: 401
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      status: 401
    });
  }

  // Default server error
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: SERVER.NODE_ENV === 'DEVELOPMENT' ? err.message : undefined,
    status: 500
  });
};

export default errorHandler;
