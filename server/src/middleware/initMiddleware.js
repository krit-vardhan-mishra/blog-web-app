import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import MongoStore from 'connect-mongo';
import { AUTH, DATABASE, SERVER } from '../utils/constants.js';

export default function initMiddleware(app) {
  app.use(
    cors({
      origin: 'http://localhost:5173',
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
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
}