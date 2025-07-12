import Blog from '../models/Blog.js';
import mongoose from 'mongoose';

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

export const getBlogByIdWithAuthor = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findOne({ 
      _id: id, 
      isDeleted: false 
    }).populate('author', 'name email');

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json(blog);
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
};

export const getNonDeletedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isDeleted: false })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

export const getAllDeletedBlogsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const deletedBlogs = await Blog.find({ 
      author: userId, 
      isDeleted: true 
    }).populate('author', 'name email').sort({ updatedAt: -1 });

    res.json(deletedBlogs);
  } catch (error) {
    console.error('Error fetching deleted blogs:', error);
    res.status(500).json({ message: 'Server error while fetching deleted blogs' });
  }
};

export const createBlog = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const newBlog = new Blog({
      title: title.trim(),
      content: content.trim(),
      author: userId
    });

    const savedBlog = await newBlog.save();
    const populatedBlog = await Blog.findById(savedBlog._id).populate('author', 'name email');

    res.status(201).json(populatedBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title: title.trim(), content: content.trim() },
      { new: true }
    ).populate('author', 'name email');

    res.json({ 
      success: true, 
      message: 'Blog updated successfully', 
      blog: updatedBlog 
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({ message: 'Server error while updating blog' });
  }
};

export const safeDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: false });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }

    blog.isDeleted = true;
    await blog.save();

    res.json({ message: 'Blog moved to trash successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({ message: 'Server error while deleting blog' });
  }
};

export const permanentlyDeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found in trash' });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to permanently delete this blog' });
    }

    await Blog.findByIdAndDelete(id);

    res.json({ message: 'Blog permanently deleted successfully' });
  } catch (error) {
    console.error('Error permanently deleting blog:', error);
    res.status(500).json({ message: 'Server error while permanently deleting blog' });
  }
};

export const restoreDeletedBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findOne({ _id: id, isDeleted: true });
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found in trash' });
    }

    if (blog.author.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to restore this blog' });
    }

    blog.isDeleted = false;
    await blog.save();

    const restoredBlog = await Blog.findById(id).populate('author', 'name email');

    res.json({ 
      message: 'Blog restored successfully', 
      blog: restoredBlog 
    });
  } catch (error) {
    console.error('Error restoring blog:', error);
    res.status(500).json({ message: 'Server error while restoring blog' });
  }
};

export const incrementBlogView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ views: blog.views });
  } catch (error) {
    console.error('Error incrementing blog view:', error);
    res.status(500).json({ message: 'Server error while incrementing view' });
  }
};