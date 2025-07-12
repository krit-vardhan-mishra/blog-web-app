import User from '../models/User.js';

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

export async function updateUserProfile(req, res){
  try {
    const userId = req.user.id;
    const { firstName, lastName, email, age, about } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found in token.' });
    }

    const updateData = {};
    if (firstName !== undefined || lastName !== undefined) {
      const currentUser = await UserService.getUserById(userId);
      let currentFirstName = currentUser?.name?.split(' ')[0] || '';
      let currentLastName = currentUser?.name?.split(' ').slice(1).join(' ') || '';

      if (firstName !== undefined) {
        currentFirstName = firstName;
      }
      if (lastName !== undefined) {
        currentLastName = lastName;
      }
      updateData.name = `${currentFirstName} ${currentLastName}`.trim();
    }

    if (email !== undefined) {
      updateData.email = email;
    }
    if (age !== undefined) {
      updateData.age = parseInt(age);
    }
    if (about !== undefined) {
      updateData.about = about;
    }

    const updatedUser = await UserService.updateUser(userId, updateData);

    if (updatedUser) {
      res.json({
        message: 'Profile updated successfully!',
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          age: updatedUser.age,
          about: updatedUser.about,
        },
      });
    } else {
      res.status(404).json({ message: 'User not found or update failed.' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: error.message });
  }
};