import express from 'express';
import passport from 'passport';
import {
  loginUser, registerUser, verifySignup, resendOTP,
  verifyPassword, setPassword, changePassword, googleAuthCallback
} from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

console.debug('Initializing auth routes...');

const authLimiter = rateLimiter(15 * 60 * 1000, 5);

router.post('/set-password', authenticateToken, setPassword);
router.post('/login', authLimiter, loginUser);
router.post('/register', authLimiter, registerUser);
router.post('/verify-signup', authLimiter, verifySignup);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/verify-password', authenticateToken, verifyPassword);
router.post('/change-password', authenticateToken, changePassword);

router.get('/google',
  (req, res, next) => {
    console.debug('Initiating Google OAuth flow...');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    accessType: 'offline',
    prompt: 'consent'
  })
);

router.get('/google/callback',
  (req, res, next) => {
    console.debug('Google OAuth callback received');
    next();
  },
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (err, req, res, next) => {
    if (err) {
      console.error('Passport authentication error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
    next();
  },
  googleAuthCallback
);

console.debug('Auth routes initialized successfully');

export default router;