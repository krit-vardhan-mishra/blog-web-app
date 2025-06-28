import Blog from '../models/mongoBlog.js';
import User from '../models/mongoUser.js';

export class BlogService {
  static async createBlog({ title, content, authorId }) {
    console.log("Looking up user with ID:", authorId);
    const user = await User.findById(authorId);
    if (!user) {
      console.error("User not found for ID:", authorId);
      throw new Error('User not found');
    }
    if (!user.canPostBlog()) {
      throw new Error('User is not old enough to post blogs');
    }
    const blog = await Blog.create({ title, content, author: authorId });
    return await blog.populate('author');
  }

  static async getAllBlogs() {
    const blogs = await Blog.find().populate('author');
    return blogs;
  }

  static async getBlogById(blogId) {
    return await Blog.findById(blogId)
  }

  static async getBlogByIdWithAuthor(blogId) {
    return await Blog.findById(blogId).populate('author');
  }

  static async updateBlogTitle(blogId, newTitle) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
    blog.title = newTitle;
    return await blog.save();
  }

  static async updateBlogContent(blogId, newContent) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }

    if (newContent && newContent.trim() !== '') {
      blog.content = newContent;
      await blog.save();
      return true;
    }
    return false;
  }

  static async deleteBlog(blogId) {
    const result = await Blog.findByIdAndDelete(blogId);
    return !!result;
  }

  static async getBlogsByUser(userId) {
    const blogs = await Blog.find({ author: userId }).populate('author');
    return blogs;
  }
  static async incrementBlogView(blogId) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
    blog.views = (blog.views || 0) + 1;
    await blog.save();
    return blog;
  }
}
