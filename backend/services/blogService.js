import Blog from '../models/mongoBlog.js';
import User from '../models/mongoUser.js';

export class BlogService {
  static async createBlog({ title, content, authorId }) {
    const user = await User.findById(authorId);
    if (!user) {
      throw new Error('User not found');
    }
    if (!user.canPostBlog()) {
      throw new Error('User is not old enough to post blogs');
    }
    const blog = await Blog.create({ title, content, author: authorId, isDeleted: false }); // Ensure new blogs are not deleted
    return await blog.populate('author');
  }

  static async getAllBlogs() {
    const blogs = await Blog.find({ isDeleted: false }).populate('author');
    return blogs;
  }

  static async getBlogById(blogId) {
    return await Blog.findOne({ _id: blogId });
  }

  static async getBlogByIdWithAuthor(blogId) {
    return await Blog.findOne({ _id: blogId }).populate('author');
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

  static async softDeleteBlog(blogId) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
    await blog.softDelete();
    return true;
  }

  static async permanentlyDeleteBlog(blogId) {
    const result = await Blog.findByIdAndDelete(blogId);
    return !!result;
  }

  static async restoreBlog(blogId) {
    const blog = await Blog.findById(blogId);
    if (!blog) {
      throw new Error('Blog not found');
    }
    await blog.restore();
    return true;
  }

  static async getBlogsByUser(userId) {
    const blogs = await Blog.find({ author: userId, isDeleted: false }).populate('author');
    return blogs;
  }

  static async getDeletedBlogsByUser(userId) {
    const blogs = await Blog.find({ author: userId, isDeleted: true }).populate('author');
    return blogs;
  }

  static async incrementBlogView(blogId) {
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) {
      throw new Error('Blog not found');
    }
    return blog;
  }
}