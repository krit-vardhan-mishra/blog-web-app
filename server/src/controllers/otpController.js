import User from '../models/User.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import sendOTPEmail from '../utils/sendOTPEmail.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Please enter a valid email address', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError('No account found with this email address', 404);
  }

  if (!user.isEmailVerified) {
    throw new ApiError('Please verify your email first before resetting password', 400);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

  // Delete any existing reset OTPs for this email
  await OTP.deleteMany({ email: email.toLowerCase().trim(), type: 'reset' });

  const otpRecord = await OTP.create({
    email: email.toLowerCase().trim(),
    otp,
    type: 'reset',
    ipAddress
  });

  await sendOTPEmail(email.toLowerCase().trim(), otp, 'reset', ipAddress);

  const responseData = {
    email: email.toLowerCase().trim(),
    expiresIn: '5 minutes'
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'OTP sent successfully to your email address'));
});

export const verifyResetOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  if (!otp?.trim()) {
    throw new ApiError('OTP is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Please provide a valid email address', 400);
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError('OTP must be a 6-digit number', 400);
  }

  const otpRecord = await OTP.findOne({
    email: email.toLowerCase().trim(),
    otp,
    type: 'reset',
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
  });

  if (!otpRecord) {
    throw new ApiError('Invalid or expired OTP. Please request a new one', 400);
  }

  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new ApiError('Too many failed attempts. Please request a new OTP', 400);
  }

  await OTP.findByIdAndUpdate(otpRecord._id, {
    $inc: { attempts: 1 },
    verified: true
  });

  const responseData = {
    email: email.toLowerCase().trim(),
    verified: true
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'OTP verified successfully'));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  if (!otp?.trim()) {
    throw new ApiError('OTP is required', 400);
  }

  if (!newPassword?.trim()) {
    throw new ApiError('New password is required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Please provide a valid email address', 400);
  }

  if (newPassword.length < 8) {
    throw new ApiError('Password must be at least 8 characters long', 400);
  }

  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError('OTP must be a 6-digit number', 400);
  }

  // Password strength validation
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumbers = /\d/.test(newPassword);
  const hasNonalphas = /\W/.test(newPassword);

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    throw new ApiError('Password must contain at least one uppercase letter, one lowercase letter, and one number', 400);
  }

  const otpRecord = await OTP.findOne({
    email: email.toLowerCase().trim(),
    otp,
    type: 'reset',
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) }
  });

  if (!otpRecord) {
    throw new ApiError('Invalid or expired OTP. Please request a new one', 400);
  }

  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw new ApiError('OTP has been used too many times. Please request a new one', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  // Check if new password is same as current password
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    throw new ApiError('New password must be different from your current password', 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      password: hashedPassword,
      loginAttempts: 0,
      blockExpires: null
    }
  );

  // Delete the OTP record after successful password reset
  await OTP.deleteOne({ _id: otpRecord._id });

  const responseData = {
    email: email.toLowerCase().trim(),
    passwordUpdated: true
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Password reset successfully. You can now login with your new password'));
});