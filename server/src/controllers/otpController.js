import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import sendOTPEmail from '../utils/sendOTPEmail.js';
import { SERVER } from '../utils/constants.js';

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email first before resetting password'
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

    const otpRecord = await OTP.create({
      email,
      otp,
      type: 'reset',
      ipAddress
    });

    await sendOTPEmail(email, otp, 'reset', ipAddress);

    res.json({
      success: true,
      message: 'OTP sent successfully to your email address',
      data: {
        email,
        expiresIn: '5 minutes'
      }
    });

  } catch (error) {
    let errorMessage = 'An error occurred while processing your request';
    let statusCode = 500;

    if (error.message.includes('Too many OTP requests')) {
      errorMessage = 'Too many OTP requests. Please wait before trying again.';
      statusCode = 429;
    } else if (error.message.includes('Email authentication failed')) {
      errorMessage = 'Email service temporarily unavailable. Please try again later.';
      statusCode = 503;
    } else if (error.message.includes('Failed to connect to email service')) {
      errorMessage = 'Unable to send email. Please check your connection and try again.';
      statusCode = 503;
    } else if (error.message.includes('Missing email configuration')) {
      errorMessage = 'Email service configuration error. Please contact support.';
      statusCode = 500;
    } else if (error.message.includes('Failed to send OTP email')) {
      errorMessage = 'Failed to send OTP email. Please try again.';
      statusCode = 500;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(SERVER.NODE_ENV === 'DEVELOPMENT' && { debug: error.message })
    });
  }
};

export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit number'
      });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'reset',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new OTP.'
      });
    }

    await OTP.findByIdAndUpdate(otpRecord._id, {
      $inc: { attempts: 1 },
      verified: true
    });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        email,
        verified: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP',
      ...(SERVER.NODE_ENV === 'DEVELOPMENT' && { debug: error.message })
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be a 6-digit number'
      });
    }

    const otpRecord = await OTP.findOne({
      email,
      otp,
      type: 'reset',
      createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP. Please request a new one.'
      });
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'OTP has been used too many times. Please request a new one.'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findOneAndUpdate(
      { email },
      {
        password: hashedPassword,
        loginAttempts: 0,
        blockExpires: null
      }
    );

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
      data: {
        email,
        passwordUpdated: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting password',
      ...(SERVER.NODE_ENV === 'DEVELOPMENT' && { debug: error.message })
    });
  }
};