import User from '../models/User.js';
import { deleteUserAllBlogs } from './blogController.js';

const MAX_DB_TIMEOUT = 10000;

export async function createUser(req, res) {
  const { name, age } = req.body;

  if (!name || age === undefined) {
    return res.status(400).json({ success: false, message: "Name and age are required." });
  }

  try {
    const user = await User.create({ name, age });
    res.status(201).json({ success: true, user: user.toJSON() });
  } catch (error) {
    console.error('❌ Create user error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().populate('blogs');
    res.status(200).json({ success: true, users: users.map(user => user.toJSON()) });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({ success: false, message: `Failed to get users: ${error.message}` });
  }
}

export async function getUserById(req, res) {
  const userId = req.params.id;

  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), MAX_DB_TIMEOUT)
    );

    const userPromise = User.findById(userId)
      .select('-password -__v -loginAttempts -blockExpires')
      .lean();

    const user = await Promise.race([userPromise, timeoutPromise]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('❌ Get user by ID error:', error);
    const errorMessage = error.message.includes('timed out') ? 'Database operation timed out' : error.message;
    res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function getUsersWithBlogs(req, res) {
  try {
    const users = await User.getUsersWithBlogs();
    res.status(200).json({ success: true, users: users.map(user => user.toJSON()) });
  } catch (error) {
    console.error('❌ Get users with blogs error:', error);
    res.status(500).json({ success: false, message: `Failed to get users with blogs: ${error.message}` });
  }
}

export async function getUsersWithoutBlogs(req, res) {
  try {
    const users = await User.getUsersWithoutBlogs();
    res.status(200).json({ success: true, users: users.map(user => user.toJSON()) });
  } catch (error) {
    console.error('❌ Get users without blogs error:', error);
    res.status(500).json({ success: false, message: `Failed to get users without blogs: ${error.message}` });
  }
}

export async function getCurrentUserProfile(req, res) {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID not available from token.' });
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), MAX_DB_TIMEOUT)
    );

    const userPromise = User.findById(userId)
      .select('-password -__v -loginAttempts -blockExpires')
      .lean();

    const user = await Promise.race([userPromise, timeoutPromise]);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('❌ Get current user profile error:', error);
    const errorMessage = error.message.includes('timed out') ? 'Database operation timed out' : error.message;
    res.status(500).json({ success: false, message: errorMessage });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, age, about } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID not found in token.' });
    }

    const updateData = {};

    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await User.findById(userId);
      let currentFirstName = currentUser?.name?.split(' ')[0] || '';
      let currentLastName = currentUser?.name?.split(' ').slice(1).join(' ') || '';

      updateData.name = [
        firstName !== undefined ? firstName : currentFirstName,
        lastName !== undefined ? lastName : currentLastName
      ].join(' ').trim();
    }

    if (email !== undefined) updateData.email = email;
    if (age !== undefined) updateData.age = parseInt(age);
    if (about !== undefined) updateData.about = about;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -__v');

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found or update failed.' });
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully!', user: updatedUser.toJSON() });
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteUserById(req, res) {
  try {
    const userId = req.params.id;
    const { deleteBlogs } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (deleteBlogs) {
      await deleteUserAllBlogs(userId);
    }

    await User.findByIdAndDelete(userId);
    res.status(200).json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error('❌ Delete user by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}
