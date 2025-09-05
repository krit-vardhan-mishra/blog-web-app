import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import OTP from '../models/OTP.js';
import sendOTPEmail from '../utils/sendOTPEmail.js';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { AUTH, SERVER } from '../utils/constants.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

const otpRateLimiter = new RateLimiterMemory({
  points: 3,
  duration: 15 * 60,
});

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  // Validate required fields
  if (!identifier?.trim()) {
    throw new ApiError('Email or username is required', 400);
  }

  if (!password?.trim()) {
    throw new ApiError('Password is required', 400);
  }

  // Check if identifier is email or username
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  const query = isEmail ? { email: identifier.toLowerCase().trim() } : { username: identifier.toLowerCase().trim() };

  const user = await User.findOne(query).select('+password +loginAttempts +blockExpires');

  // Check if account is temporarily locked
  if (user?.blockExpires && user.blockExpires > Date.now()) {
    const minutesRemaining = Math.ceil((user.blockExpires - Date.now()) / 60000);
    throw new ApiError(`Account temporarily locked. Try again after ${minutesRemaining} minutes`, 429);
  }

  if (!user) {
    throw new ApiError(`No account found with this ${isEmail ? 'email' : 'username'}. Please check and try again.`, 401);
  }

  // Check if email is not verified
  if (!user.isEmailVerified) {
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid credentials', 401);
    }

    try {
      await otpRateLimiter.consume(user.email);
    } catch (rateLimiterRes) {
      throw new ApiError('Too many OTP requests. Please try again later', 429);
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email: user.email, type: 'signup' });
    await OTP.create({ email: user.email, otp, type: 'signup', ipAddress });
    await sendOTPEmail(user.email, otp, 'signup', ipAddress);

    throw new ApiError('Account not verified. Please verify your email before logging in', 403, [], '', {
      requiresVerification: true,
      email: user.email
    });
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= 5) {
      user.blockExpires = Date.now() + 30 * 60 * 1000;
      await user.save();
      throw new ApiError('Too many failed login attempts. Account locked for 30 minutes', 429);
    }

    await user.save();
    throw new ApiError('Incorrect password. Please try again.', 401);
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.blockExpires = undefined;
  await user.save();

  // Generate JWT token
  const token = jwt.sign({
    id: user._id,
    email: user.email
  }, AUTH.JWT_SECRET, {
    expiresIn: '7d'
  });

  const userData = {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      age: user.age,
      about: user.about
    }
  };

  return res.status(200).json(new ApiResponse(200, userData, 'Login successful'));
});

export const registerUser = asyncHandler(async (req, res) => {
  const { firstName, lastName, username, email, password, age } = req.body;

  // Validate required fields
  if (!firstName?.trim()) {
    throw new ApiError('First name is required', 400);
  }

  if (!lastName?.trim()) {
    throw new ApiError('Last name is required', 400);
  }

  if (!username?.trim()) {
    throw new ApiError('Username is required', 400);
  }

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  if (!password?.trim()) {
    throw new ApiError('Password is required', 400);
  }

  if (!age) {
    throw new ApiError('Age is required', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Please provide a valid email address', 400);
  }

  // Validate password strength
  if (password.length < 8) {
    throw new ApiError('Password must be at least 8 characters long', 400);
  }

  // Validate age
  const parsedAge = parseInt(age);
  if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    throw new ApiError('Please provide a valid age between 13 and 120', 400);
  }

  // Validate username format (alphanumeric and underscore only)
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new ApiError('Username can only contain letters, numbers, and underscores', 400);
  }

  if (username.length < 3 || username.length > 20) {
    throw new ApiError('Username must be between 3 and 20 characters', 400);
  }

  // Check for existing user with email
  const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingUser) {
    if (!existingUser.isEmailVerified) {
      const error = new ApiError('User already exists but email not verified. Please try logging in to receive a verification email', 409);
      error.data = { requiresLogin: true };
      throw error;
    }
    throw new ApiError('An account with this email already exists. Please login instead', 409);
  }

  // Check for existing username
  const existingUsername = await User.findOne({ username: username.toLowerCase().trim() });
  if (existingUsername) {
    throw new ApiError('This username is already taken. Please choose a different username', 409);
  }

  // Rate limiting for OTP
  try {
    await otpRateLimiter.consume(email);
  } catch (rateLimiterRes) {
    throw new ApiError('Too many OTP requests. Please try again later', 429);
  }

  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Create OTP record
  await OTP.create({ email: email.toLowerCase().trim(), otp, type: 'signup', ipAddress });

  // Send OTP email
  await sendOTPEmail(email.toLowerCase().trim(), otp, 'signup', ipAddress);

  // Create user account
  const user = await User.create({
    name: `${firstName.trim()} ${lastName.trim()}`,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    password,
    age: parsedAge,
    isEmailVerified: false
  });

  const responseData = {
    message: 'Registration successful. OTP sent to your email',
    email: user.email
  };

  return res.status(201).json(new ApiResponse(201, responseData, 'User registered successfully'));
});

export const verifySignup = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  if (!otp?.trim()) {
    throw new ApiError('OTP is required', 400);
  }

  // Validate OTP format
  if (!/^\d{6}$/.test(otp)) {
    throw new ApiError('OTP must be a 6-digit number', 400);
  }

  const otpRecord = await OTP.findOneAndDelete({
    email: email.toLowerCase().trim(),
    otp,
    type: 'signup',
    createdAt: { $gt: new Date(Date.now() - 5 * 60 * 1000) } // 5 minutes expiry
  });

  if (!otpRecord) {
    throw new ApiError('Invalid or expired OTP. Please request a new one', 400);
  }

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { isEmailVerified: true },
    { new: true }
  );

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const token = jwt.sign({
    id: user._id,
    email: user.email
  }, AUTH.JWT_SECRET, {
    expiresIn: '7d'
  });

  const userData = {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      age: user.age,
      about: user.about
    }
  };

  return res.status(200).json(new ApiResponse(200, userData, 'Email verified successfully. Welcome!'));
});

export const resendOTP = asyncHandler(async (req, res) => {
  const { email, type } = req.body;

  if (!email?.trim()) {
    throw new ApiError('Email is required', 400);
  }

  if (!type?.trim()) {
    throw new ApiError('OTP type is required', 400);
  }

  if (!['signup', 'reset'].includes(type)) {
    throw new ApiError('Invalid OTP type. Must be either "signup" or "reset"', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Please provide a valid email address', 400);
  }

  try {
    await otpRateLimiter.consume(`${email}:${type}`);
  } catch (rateLimiterRes) {
    throw new ApiError('Too many OTP requests. Please try again later', 429);
  }

  const ipAddress = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress || 'unknown';
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await OTP.deleteMany({ email: email.toLowerCase().trim(), type });
  await OTP.create({ email: email.toLowerCase().trim(), otp, type, ipAddress });

  await sendOTPEmail(email.toLowerCase().trim(), otp, type, ipAddress);

  return res.status(200).json(new ApiResponse(200, null, 'OTP sent successfully to your email'));
});

export const verifyPassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password?.trim()) {
    throw new ApiError('Password is required', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError('Incorrect password', 401);
  }

  return res.status(200).json(new ApiResponse(200, null, 'Password verified successfully'));
});

export const setPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;

  if (!newPassword?.trim()) {
    throw new ApiError('New password is required', 400);
  }

  if (newPassword.length < 8) {
    throw new ApiError('Password must be at least 8 characters long', 400);
  }

  req.user.password = newPassword;
  await req.user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password set successfully'));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword?.trim()) {
    throw new ApiError('Current password is required', 400);
  }

  if (!newPassword?.trim()) {
    throw new ApiError('New password is required', 400);
  }

  if (newPassword.length < 8) {
    throw new ApiError('New password must be at least 8 characters long', 400);
  }

  if (currentPassword === newPassword) {
    throw new ApiError('New password must be different from current password', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError('User not found', 404);
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

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