import { ApiError } from './ApiError.js';
import { SERVER } from './constants.js';

const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            // Handle ApiError instances
            if (error instanceof ApiError) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message,
                    errors: error.errors,
                    ...(error.data && { data: error.data }),
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
                });
            }

            // Handle other errors
            console.error('Unexpected error:', error);

            // Handle specific error types
            if (error.name === 'ValidationError') {
                const validationErrors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validationErrors
                });
            }

            if (error.name === 'CastError') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ID format',
                    errors: ['Please provide a valid ID']
                });
            }

            if (error.code === 11000) {
                // Handle duplicate key errors
                const field = Object.keys(error.keyValue)[0];
                return res.status(409).json({
                    success: false,
                    message: `Duplicate ${field} value`,
                    errors: [`${field} already exists`]
                });
            }

            // Default error response
            const status = error.status || error.statusCode || 500;
            const message = error.message || 'Internal Server Error';

            res.status(status).json({
                success: false,
                message,
                ...(SERVER.NODE_ENV === 'development' && { stack: error.stack })
            });
        }
    };
};

export default asyncHandler;