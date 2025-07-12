import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';

export default function initMiddleware(app) {
  app.use(cors());
  app.use(express.json());

  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());
}