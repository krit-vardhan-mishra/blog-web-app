import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { loginUser, registerUser, verifySignup, resendOTP, verifyPassword } from '../controllers/authController.js';
import { rateLimiter } from '../middleware/rateLimiter.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

const authLimiter = rateLimiter(15 * 60 * 1000, 5);

router.post('/login', authLimiter, loginUser);
router.post('/register', authLimiter, registerUser);
router.post('/verify-signup', authLimiter, verifySignup);
router.post('/resend-otp', authLimiter, resendOTP);

router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = jwt.sign({
      id: req.user._id,
      email: req.user.email
    }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.redirect(`${process.env.CLIENT_URL}/google-auth?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

router.post('/verify-password', verifyPassword);

router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verify current password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;