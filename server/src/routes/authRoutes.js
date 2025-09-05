import express from 'express';
import passport from 'passport';
import {
  loginUser, registerUser, verifySignup, resendOTP,
  verifyPassword, setPassword, changePassword, googleAuthCallback
} from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import authenticateToken from '../middleware/authenticateToken.js';
import { SERVER } from '../utils/constants.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

console.debug('Initializing auth routes...');

const loginLimiter = rateLimiter(5 * 60 * 1000, 20);
const registerLimiter = rateLimiter(30 * 60 * 1000, 10);
const otpLimiter = rateLimiter(10 * 60 * 1000, 5);

router.post('/set-password', authenticateToken, setPassword);
router.post('/login', loginLimiter, loginUser);
router.post('/register', registerLimiter, registerUser);
router.post('/verify-signup', otpLimiter, verifySignup);
router.post('/resend-otp', otpLimiter, resendOTP);
router.post('/verify-password', authenticateToken, verifyPassword);
router.post('/change-password', authenticateToken, changePassword);

router.get('/validate-token', authenticateToken, (req, res) => {
  res.json({
    success: true,
    valid: true,
    user: req.user
  });
});

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
      return res.redirect(`${SERVER.CLIENT_URL}/login?error=auth_failed`);
    }
    next();
  },
  googleAuthCallback
);

console.debug('Auth routes initialized successfully');

// Apply error handler middleware
router.use(errorHandler);

export default router;