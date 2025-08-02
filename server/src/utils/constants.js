import dotenv from 'dotenv';

dotenv.config();

// Server Configuration
export const SERVER = {
    PORT: process.env.PORT || 5000,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
    NODE_ENV: process.env.NODE_ENV || 'DEVELOPMENT',
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN || 'localhost',
};

// Database Configuration
export const DATABASE = {
    MONGODB_URI: process.env.MONGODB_URI,
};

// Authentication and Security
export const AUTH = {
    JWT_SECRET: process.env.JWT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    CSRF_SECRET: process.env.CSRF_SECRET,
};

// Google OAuth Configuration
export const GOOGLE_AUTH = {
    CLIENT_URL: process.env.CLIENT_URL,
    CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
};

// Email Configuration
export const EMAIL = {
    GMAIL: {
        REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
        ACCESS_TOKEN: process.env.GMAIL_ACCESS_TOKEN,
    },
    SENDER: {
        EMAIL: process.env.SENDER_EMAIL,
        PASSWORD: process.env.SENDER_PASSWORD,
    },
};

// Validation and Error Messages
export const MESSAGES = {
    ERRORS: {
        ENV_NOT_LOADED: 'Environment variables not loaded correctly',
        REQUIRED_ENV_MISSING: (envVar) => `Required environment variable ${envVar} is missing`,
    },
};

// Validate required environment variables
const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'SESSION_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'SENDER_EMAIL',
    'SENDER_PASSWORD',
];

// Check for missing required environment variables
const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
}
