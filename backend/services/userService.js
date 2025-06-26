import User from '../models/mongoUser.js';
import Blog from '../models/mongoBlog.js';

export class UserService {
  static async createUser(name, age) {
    const user = await User.create({ name, age });
    return user;
  }

  static async getUserById(userId) {
    const user = await User.findById(userId).populate('blogs');
    return user;
  }

  static async getAllUsers() {
    const users = await User.find().populate('blogs');
    return users;
  }

  static async getUsersWithBlogs() {
    const users = await User.getUsersWithBlogs();
    return users;
  }

  static async getUsersWithoutBlogs() {
    const users = await User.getUsersWithoutBlogs();
    return users;
  }

  static async updateUser(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
    return user;
  }

  static async deleteUser(userId) {
    const session = await User.startSession();
    session.startTransaction();

    try {
      await Blog.deleteMany({ author: userId}).session(session);
      await User.findByIdAndDelete(userId).session(session);
      await session.commitTransaction();
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}