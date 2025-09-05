import User from '../models/User.js';
import { deleteUserAllBlogs } from './blogController.js';
import ApiResponse from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

const MAX_DB_TIMEOUT = 10000;
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const createUser = asyncHandler(async (req, res) => {
  const { name, age } = req.body;

  if (!name?.trim()) {
    throw new ApiError('Name is required', 400);
  }

  if (age === undefined || age === null) {
    throw new ApiError('Age is required', 400);
  }

  const parsedAge = parseInt(age);
  if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    throw new ApiError('Age must be between 13 and 120', 400);
  }

  if (name.trim().length < 2) {
    throw new ApiError('Name must be at least 2 characters long', 400);
  }

  if (name.trim().length > 50) {
    throw new ApiError('Name cannot exceed 50 characters', 400);
  }

  const user = await User.create({ name: name.trim(), age: parsedAge });

  return res.status(201).json(new ApiResponse(201, user.toJSON(), 'User created successfully'));
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  const skip = (pageNum - 1) * limitNum;

  const [users, totalUsers] = await Promise.all([
    User.find()
      .select('-password -__v -loginAttempts -blockExpires')
      .populate('blogs')
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments()
  ]);

  const totalPages = Math.ceil(totalUsers / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    users: users.map(user => ({ ...user, id: user._id })),
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Users retrieved successfully'));
});

export const getUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  if (!userId?.trim()) {
    throw new ApiError('User ID is required', 400);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database operation timed out')), MAX_DB_TIMEOUT)
  );

  const userPromise = User.findById(userId)
    .select('-password -__v -loginAttempts -blockExpires')
    .lean();

  const user = await Promise.race([userPromise, timeoutPromise]);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  return res.status(200).json(new ApiResponse(200, { ...user, id: user._id }, 'User retrieved successfully'));
});

export const getUserByEmail = asyncHandler(async (req, res) => {
  const email = req.params.email;

  if (!email?.trim()) {
    throw new ApiError('Email parameter is required', 400);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError('Invalid email format', 400);
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() })
    .select('-password -__v -loginAttempts -blockExpires')
    .lean();

  if (!user) {
    throw new ApiError('User not found with the specified email', 404);
  }

  return res.status(200).json(new ApiResponse(200, { ...user, id: user._id }, 'User retrieved successfully'));
});

export const getUserByUsername = asyncHandler(async (req, res) => {
  const username = req.params.username;

  if (!username?.trim()) {
    throw new ApiError('Username parameter is required', 400);
  }

  if (username.trim().length < 3) {
    throw new ApiError('Username must be at least 3 characters long', 400);
  }

  const user = await User.findOne({ username: username.toLowerCase().trim() })
    .select('-password -__v -loginAttempts -blockExpires')
    .lean();

  if (!user) {
    throw new ApiError('User not found with the specified username', 404);
  }

  return res.status(200).json(new ApiResponse(200, { ...user, id: user._id }, 'User retrieved successfully'));
});

export const getUsersWithBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  const skip = (pageNum - 1) * limitNum;

  const users = await User.getUsersWithBlogs();
  const totalUsers = users.length;
  const paginatedUsers = users.slice(skip, skip + limitNum);

  const totalPages = Math.ceil(totalUsers / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    users: paginatedUsers.map(user => user.toJSON()),
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Users with blogs retrieved successfully'));
});

export const getUsersWithoutBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  const skip = (pageNum - 1) * limitNum;

  const users = await User.getUsersWithoutBlogs();
  const totalUsers = users.length;
  const paginatedUsers = users.slice(skip, skip + limitNum);

  const totalPages = Math.ceil(totalUsers / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    users: paginatedUsers.map(user => user.toJSON()),
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalUsers,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Users without blogs retrieved successfully'));
});

export const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new ApiError('User ID not available from token', 401);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Database operation timed out')), MAX_DB_TIMEOUT)
  );

  const userPromise = User.findById(userId)
    .select('-password -__v -loginAttempts -blockExpires')
    .lean();

  const user = await Promise.race([userPromise, timeoutPromise]);

  if (!user) {
    throw new ApiError('User profile not found', 404);
  }

  return res.status(200).json(new ApiResponse(200, { ...user, id: user._id }, 'User profile retrieved successfully'));
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { firstName, lastName, email, age, about } = req.body;

  if (!userId) {
    throw new ApiError('User ID not found in token', 401);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const updateData = {};

  // Handle name updates
  if (firstName !== undefined || lastName !== undefined) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new ApiError('User not found', 404);
    }

    let currentFirstName = currentUser?.name?.split(' ')[0] || '';
    let currentLastName = currentUser?.name?.split(' ').slice(1).join(' ') || '';

    const newFirstName = firstName !== undefined ? firstName.trim() : currentFirstName;
    const newLastName = lastName !== undefined ? lastName.trim() : currentLastName;

    if (newFirstName && newFirstName.length < 2) {
      throw new ApiError('First name must be at least 2 characters long', 400);
    }

    if (newFirstName && newFirstName.length > 25) {
      throw new ApiError('First name cannot exceed 25 characters', 400);
    }

    if (newLastName && newLastName.length > 25) {
      throw new ApiError('Last name cannot exceed 25 characters', 400);
    }

    updateData.name = [newFirstName, newLastName].join(' ').trim();
  }

  if (email !== undefined) {
    if (!email.trim()) {
      throw new ApiError('Email cannot be empty', 400);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError('Please provide a valid email address', 400);
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
      _id: { $ne: userId }
    });

    if (existingUser) {
      throw new ApiError('This email is already registered to another account', 409);
    }

    updateData.email = email.toLowerCase().trim();
  }

  // Handle age update
  if (age !== undefined) {
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
      throw new ApiError('Age must be between 13 and 120', 400);
    }
    updateData.age = parsedAge;
  }

  // Handle about update
  if (about !== undefined) {
    if (about.trim().length > 500) {
      throw new ApiError('About section cannot exceed 500 characters', 400);
    }
    updateData.about = about.trim();
  }

  if (Object.keys(updateData).length === 0) {
    throw new ApiError('No valid fields provided for update', 400);
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -__v -loginAttempts -blockExpires');

  if (!updatedUser) {
    throw new ApiError('Failed to update user profile', 500);
  }

  return res.status(200).json(new ApiResponse(200, updatedUser.toJSON(), 'Profile updated successfully'));
});

export const deleteUserById = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  const { deleteBlogs } = req.body;

  if (!userId?.trim()) {
    throw new ApiError('User ID is required', 400);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError('User not found', 404);
  }

  if (req.user && req.user.id !== userId) {
    throw new ApiError('Not authorized to delete this account', 403);
  }

  if (deleteBlogs) {
    await deleteUserAllBlogs(userId);
  }

  await User.findByIdAndDelete(userId);

  return res.status(200).json(new ApiResponse(200, null, 'Account deleted successfully'));
});