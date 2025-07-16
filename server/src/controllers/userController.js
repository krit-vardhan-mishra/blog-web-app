import User from '../models/User.js';
import { deleteUserAllBlogs } from './blogController.js';

export async function createUser(reqBody) {
  const { name, age } = reqBody;

  if (!name || age === undefined) {
    return { success: false, message: "Name and age are required." };
  }

  try {
    const user = await User.create({ name, age });
    return {
      success: true,
      user: user.toJSON()
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

export async function getAllUsers() {
  try {
    const users = await User.find().populate('blogs');
    return users.map(user => user.toJSON());
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
}

export async function getUserById(userId) {
  try {
    const user = await User.findById(userId).populate('blogs');
    if (!user) {
      return { success: false, message: "User not found." };
    }
    return { success: true, user: user.toJSON() };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getUsersWithBlogs() {
  try {
    const users = await User.getUsersWithBlogs();
    return users.map(user => user.toJSON());
  } catch (error) {
    throw new Error(`Failed to get users with blogs: ${error.message}`);
  }
}

export async function getUsersWithoutBlogs() {
  try {
    const users = await User.getUsersWithoutBlogs();
    return users.map(user => user.toJSON());
  } catch (error) {
    throw new Error(`Failed to get users without blogs: ${error.message}`);
  }
}

const MAX_DB_TIMEOUT = 10000;

export async function getCurrentUserProfile(req, res) {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not available from token.'
      });
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database operation timed out')), MAX_DB_TIMEOUT)
    );

    const userPromise = User.findById(userId)
      .select('-password -__v -loginAttempts -blockExpires')
      .lean();

    const user = await Promise.race([userPromise, timeoutPromise]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Get current user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message.includes('timed out')
        ? 'Database operation timed out'
        : error.message
    });
  }
}

export async function updateUserProfile(req, res) {
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, age, about } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: 'User ID not found in token.'
      });
    }

    const updateData = {};
    if (firstName || lastName) {
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
      return res.status(404).json({
        message: 'User not found or update failed.'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

export async function deleteUserById(userId) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    await User.findByIdAndDelete(userId);
    await deleteUserAllBlogs(userId);

    return { success: true, user: user.toJSON() };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
