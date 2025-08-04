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
    'https://blog-web-app-ngmh.onrender.com',
    SERVER.CLIENT_URL
  ].filter(Boolean);

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        if (SERVER.NODE_ENV === 'PRODUCTION') {
          return callback(new Error('Not allowed by CORS'));
        }
        
        return callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
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
        ttl: 14 * 24 * 60 * 60,
      }),
      cookie: {
        secure: SERVER.NODE_ENV === 'PRODUCTION',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: SERVER.NODE_ENV === 'PRODUCTION' ? 'none' : 'lax',
        domain: SERVER.NODE_ENV === 'PRODUCTION' ? SERVER.COOKIE_DOMAIN : undefined,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
}