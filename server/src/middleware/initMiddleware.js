import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { AUTH, DATABASE, SERVER } from '../utils/constants.js';

export default function initMiddleware(app) {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.29.108:5173',
    'http://192.168.29.108:3000',
    'https://blog-web-app-ngmh.onrender.com',
    SERVER.CLIENT_URL
  ].filter(Boolean);

  const uniqueOrigins = [...new Set(allowedOrigins)];

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);

        // Check if origin is allowed
        if (uniqueOrigins.includes(origin)) {
          return callback(null, true);
        }

        // In production, be more restrictive
        if (SERVER.NODE_ENV === 'PRODUCTION') {
          console.error('CORS blocked origin:', origin);
          return callback(new Error(`Origin ${origin} not allowed by CORS`));
        }

        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
      credentials: true,
    })
  );

  app.use(express.json());

  app.use(
    session({
      secret: AUTH.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: DATABASE.MONGODB_URI,
        ttl: 30 * 24 * 60 * 60,
        touchAfter: 24 * 3600,
      }),
      cookie: {
        secure: SERVER.NODE_ENV === 'PRODUCTION',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: SERVER.NODE_ENV === 'PRODUCTION' ? 'none' : 'lax',
        domain: SERVER.NODE_ENV === 'PRODUCTION' ? SERVER.COOKIE_DOMAIN : undefined,
      },
      name: 'blog-session',
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
}