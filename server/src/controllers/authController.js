import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import OTP from '../models/OTP.js';
import sendOTPEmail from '../utils/sendOTPEmail.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { AUTH, SERVER } from '../utils/constants.js';

const otpRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 15 * 60,
});

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email }).select('+password +loginAttempts +blockExpires');

    if (user?.blockExpires && user.blockExpires > Date.now()) {
      return res.status(429).json({
        success: false,
        message: `Account temporarily locked. Try again after ${Math.ceil((user.blockExpires - Date.now()) / 60000)} minutes`
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please check details or sign up'
      });
    }

    // Check if email is not verified
    if (!user.isEmailVerified) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid password'
        });
      }

      try {
        await otpRateLimiter.consume(email);
      } catch (rateLimiterRes) {
        return res.status(429).json({
          success: false,
          message: 'Too many OTP requests. Please try again later.'
        });
      }

      const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      await OTP.deleteMany({ email, type: 'signup' });
      
      await OTP.create({ email, otp, type: 'signup', ipAddress });
      await sendOTPEmail(email, otp, 'signup', ipAddress);

      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please verify your email before logging in.',
        requiresVerification: true,
        email: email
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      user.loginAttempts += 1;

      if (user.loginAttempts >= 5) {
        user.blockExpires = Date.now() + 30 * 60 * 1000;
        await user.save();

        return res.status(429).json({
          success: false,
          message: 'Too many failed attempts. Account locked for 30 minutes.'
        });
      }

      await user.save();
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    user.loginAttempts = 0;
    user.blockExpires = undefined;
    await user.save();

    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, AUTH.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        about: user.about
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, age } = req.body;

    if (!email || !password || !firstName || !lastName || !age) {
      return res.status(422).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Check if user exists but email is not verified
      if (!existingUser.isEmailVerified) {
        return res.status(409).json({
          success: false,
          message: 'User already exists but email not verified. Please try logging in to receive a verification email.',
          requiresLogin: true
        });
      }
      
      return res.status(409).json({
        success: false,
        message: 'User already exists. Please login instead.'
      });
    }

    try {
      await otpRateLimiter.consume(email);
    } catch (rateLimiterRes) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.create({ email, otp, type: 'signup', ipAddress });
    await sendOTPEmail(email, otp, 'signup', ipAddress);

    const user = await User.create({
      name: `${firstName} ${lastName}`,
      email,
      password,
      age: parseInt(age),
      isEmailVerified: false
    });

    res.status(201).json({
      success: true,
      message: user + 'OTP sent to your email',
      email
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifySignup = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOneAndDelete({
      email,
      otp,
      type: 'signup',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes expiry
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const token = jwt.sign({
      id: user._id,
      email: user.email
    }, AUTH.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age
      }
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!['signup', 'reset'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP type'
      });
    }

    try {
      await otpRateLimiter.consume(`${email}:${type}`);
    } catch (rateLimiterRes) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please try again later.'
      });
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await OTP.deleteMany({ email, type });
    await OTP.create({ email, otp, type, ipAddress });

    await sendOTPEmail(email, otp, type, ipAddress);

    res.json({
      success: true,
      message: 'OTP resent successfully'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password verified'
    });
  } catch (error) {
    console.error('Password verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const setPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    req.user.password = newPassword;
    await req.user.save();
    res.json({ success: true, message: 'Password set successfully.' });
  } catch (err) {
    console.error('Set-password error:', err);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const googleAuthCallback = (req, res) => {
  console.debug('Google auth callback processing...');

  if (req.query.error) {
    console.error('Google OAuth error:', req.query.error);
    return res.redirect(`${SERVER.CLIENT_URL}/login?error=google_auth_failed`);
  }

  if (!req.user) {
    console.error('No user returned from Google auth');
    return res.redirect(`${SERVER.CLIENT_URL}/login?error=no_user`);
  }

  try {
    const token = jwt.sign({
      id: req.user._id,
      email: req.user.email
    }, AUTH.JWT_SECRET, {
      expiresIn: '7d'
    });

    const userData = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      authMethod: req.user.authMethod
    };

    const redirectUrl = `${SERVER.CLIENT_URL}/google-auth?token=${token}&user=${encodeURIComponent(JSON.stringify(userData))}`;
    console.debug('Redirecting to:', redirectUrl);

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google auth callback error:', error);
    return res.redirect(`${SERVER.CLIENT_URL}/login?error=token_generation_failed`);
  }
};