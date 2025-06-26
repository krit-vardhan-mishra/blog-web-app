import { User } from '../models/mongoUser.js';
import { MongoUser } from '../models/mongoUser.js';
import { BlogApp } from '../models/models.js';

let appInstance = new BlogApp();

export async function createUser(reqBody) {
  const { name, age } = reqBody;
  
  if (!name || age === undefined) {
    return { success: false, message: "Name and age are required." };
  }

  try {
    const mongoUser = await User.create({ name, age });
    
    const user = appInstance.createUser(name, age);
    user.id = mongoUser._id.toString();
    
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

export async function getAllUsers() {
  try {
    const users = await User.find().populate('blogs');
    return users.map(user => new MongoUser(user));
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
    return { success: true, user: new MongoUser(user) };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export async function getUsersWithBlogs() {
  try {
    const users = await User.getUsersWithBlogs();
    return users.map(user => new MongoUser(user));
  } catch (error) {
    throw new Error(`Failed to get users with blogs: ${error.message}`);
  }
}

export async function getUsersWithoutBlogs() {
  try {
    const users = await User.getUsersWithoutBlogs();
    return users.map(user => new MongoUser(user));
  } catch (error) {
    throw new Error(`Failed to get users without blogs: ${error.message}`);
  }
}

export function setApp(newApp) {
  appInstance = newApp;
}

export function getApp() {
  return appInstance;
}