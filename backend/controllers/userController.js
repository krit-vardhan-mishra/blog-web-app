import { MongoUser, User } from './mongoUser.js'; // Assuming mongoUser.js is in the same directory or adjust path

/**
 * Creates a new user in the database.
 * @param {object} reqBody - The request body containing user details.
 * @param {string} reqBody.name - The name of the user.
 * @param {number} reqBody.age - The age of the user.
 * @returns {Promise<object>} An object indicating success/failure and the user data or error message.
 */
export async function createUser(reqBody) {
  const { name, age } = reqBody;

  if (!name || age === undefined) {
    return { success: false, message: "Name and age are required." };
  }

  try {
    const mongoUser = await User.create({ name, age });
    return {
      success: true,
      user: new MongoUser(mongoUser)
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Retrieves all users from the database.
 * Users' blogs are populated automatically.
 * @returns {Promise<Array<MongoUser>>} An array of MongoUser objects.
 * @throws {Error} If there's a failure to retrieve users.
 */
export async function getAllUsers() {
  try {
    const users = await User.find().populate('blogs');
    return users.map(user => new MongoUser(user));
  } catch (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
}

/**
 * Retrieves a single user by their ID.
 * User's blogs are populated automatically.
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<object>} An object indicating success/failure and the user data or error message.
 */
export async function getUserById(userId) {
  try {
    const user = await User.findById(userId).populate('blogs');
    if (!user) {
      return { success: false, message: "User not found." };
    }
    return { success: true, user: new MongoUser(user) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * Retrieves all users who have associated blogs.
 * @returns {Promise<Array<MongoUser>>} An array of MongoUser objects with blogs.
 * @throws {Error} If there's a failure to retrieve users with blogs.
 */
export async function getUsersWithBlogs() {
  try {
    const users = await User.getUsersWithBlogs();
    return users.map(user => new MongoUser(user));
  } catch (error) {
    throw new Error(`Failed to get users with blogs: ${error.message}`);
  }
}

/**
 * Retrieves all users who do not have associated blogs.
 * @returns {Promise<Array<MongoUser>>} An array of MongoUser objects without blogs.
 * @throws {Error} If there's a failure to retrieve users without blogs.
 */
export async function getUsersWithoutBlogs() {
  try {
    const users = await User.getUsersWithoutBlogs();
    return users.map(user => new MongoUser(user));
  } catch (error) {
    throw new Error(`Failed to get users without blogs: ${error.message}`);
  }
}