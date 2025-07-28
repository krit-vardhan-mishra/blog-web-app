import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { calculateEngagementScore } from '../utils/engagementUtils.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
    const { genre, tags, difficulty, sortBy = 'createdAt', order = 'desc' } = req.query;

    let filter = { isDeleted: false };

    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      filter.tags = { $in: tagArray };
    }

    if (difficulty) {
      filter.readingDifficulty = difficulty;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort(sortOptions);

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
    const { title, content, genre = 'All', tags = [], readingDifficulty = 'intermediate' } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const validGenres = [
      'All',
      'Lifestyle',
      'Business',
      'Entertainment',
      'Science',
      'Art',
      'Sports',
      'Technology',
      'Health',
      'Travel',
      'Food',
      'Education',
      'Love & Relationships',
      'Poetry',
      'Cinema',
      'Film Reviews',
      'Music',
      'Theatre',
      'Photography',
      'Dance',
      'Comics & Graphic Novels',
      'Fiction',
      'Non-Fiction',
      'Short Stories',
      'Book Reviews',
      'Writing Tips',
      'Creative Writing',
      'Culture & Traditions',
      'History',
      'Philosophy',
      'Politics',
      'Feminism',
      'Spirituality',
      'Mindfulness',
      'Minimalism',
      'Motivational',
      'Productivity',
      'Life Lessons',
      'Freelancing',
      'Career Advice',
      'Job Search',
      'Workplace Culture',
      'Remote Work',
      'Startup Life',
      'AI & Machine Learning',
      'Coding & Development',
      'Gadgets & Reviews',
      'Cybersecurity',
      'Blockchain & Crypto',
      'Adventure',
      'Backpacking',
      'Digital Nomad Life',
      'Local Guides',
      'Cultural Exchange',
      'Parenting',
      'Mental Health',
      'Self-Improvement',
      'Personal Journals'
    ];

    if (!validGenres.includes(genre)) {
      return res.status(400).json({ message: 'Invalid genre selected' });
    }

    const processedTags = Array.isArray(tags) ? tags :
      (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []);

    const newBlog = new Blog({
      title: title.trim(),
      content: content.trim(),
      author: userId,
      genre,
      tags: processedTags,
      readingDifficulty
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
    const { title, content, genre, tags, readingDifficulty } = req.body;
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

    const updateData = {
      title: title.trim(),
      content: content.trim()
    };

    if (genre) {
      const validGenres = [
        'All',
        'Lifestyle',
        'Business',
        'Entertainment',
        'Science',
        'Art',
        'Sports',
        'Technology',
        'Health',
        'Travel',
        'Food',
        'Education',
        'Love & Relationships',
        'Poetry',
        'Cinema',
        'Film Reviews',
        'Music',
        'Theatre',
        'Photography',
        'Dance',
        'Comics & Graphic Novels',
        'Fiction',
        'Non-Fiction',
        'Short Stories',
        'Book Reviews',
        'Writing Tips',
        'Creative Writing',
        'Culture & Traditions',
        'History',
        'Philosophy',
        'Politics',
        'Feminism',
        'Spirituality',
        'Mindfulness',
        'Minimalism',
        'Motivational',
        'Productivity',
        'Life Lessons',
        'Freelancing',
        'Career Advice',
        'Job Search',
        'Workplace Culture',
        'Remote Work',
        'Startup Life',
        'AI & Machine Learning',
        'Coding & Development',
        'Gadgets & Reviews',
        'Cybersecurity',
        'Blockchain & Crypto',
        'Adventure',
        'Backpacking',
        'Digital Nomad Life',
        'Local Guides',
        'Cultural Exchange',
        'Parenting',
        'Mental Health',
        'Self-Improvement',
        'Personal Journals'
      ];

      if (validGenres.includes(genre)) {
        updateData.genre = genre;
      }
    }

    // Add tags if provided
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags :
        (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []);
    }

    // Add reading difficulty if provided
    if (readingDifficulty && ['beginner', 'intermediate', 'advanced'].includes(readingDifficulty)) {
      updateData.readingDifficulty = readingDifficulty;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
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

export const deleteUserAllBlogs = async (userId) => {
  await Blog.deleteMany({ author: userId });
};

export const getUserBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { genre, difficulty, sortBy = 'createdAt', order = 'desc' } = req.query;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    let filter = {
      author: userId,
      isDeleted: false
    };

    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    if (difficulty) {
      filter.readingDifficulty = difficulty;
    }

    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const blogs = await Blog.find(filter)
      .populate('author', 'name email')
      .sort(sortOptions);

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Server error while fetching user blogs' });
  }
};

export const updateBlogEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { metrics } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const timeSpent = metrics.timeSpent || 0;
    const existingMetricIndex = blog.interactionMetrics.timeSpent
      .findIndex(m => m.userId.toString() === userId);

    if (existingMetricIndex > -1) {
      blog.interactionMetrics.timeSpent[existingMetricIndex].duration += timeSpent;
      blog.interactionMetrics.timeSpent[existingMetricIndex].lastRead = new Date();
    } else {
      blog.interactionMetrics.timeSpent.push({
        userId,
        duration: timeSpent,
        lastRead: new Date()
      });
    }

    const totalDuration = blog.interactionMetrics.timeSpent
      .reduce((sum, metric) => sum + metric.duration, 0);
    const totalReaders = blog.interactionMetrics.timeSpent.length;
    blog.averageReadTime = totalDuration / totalReaders;

    blog.engagementScore = calculateEngagementScore(blog);

    if (metrics.completedReading) {
      blog.readCount += 1;
    }

    await blog.save();
    res.json({ message: 'Engagement metrics updated successfully' });
  } catch (error) {
    console.error('Error updating engagement:', error);
    res.status(500).json({ message: 'Server error while updating engagement' });
  }
};

export const toggleBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id).populate('author', 'name email');
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const bookmarkIndex = blog.interactionMetrics.bookmarks.indexOf(userId);
    let wasBookmarked = bookmarkIndex > -1;

    if (bookmarkIndex > -1) {
      blog.interactionMetrics.bookmarks.splice(bookmarkIndex, 1);
    } else {
      blog.interactionMetrics.bookmarks.push(userId);
    }

    await blog.save();

    res.json({
      message: wasBookmarked ? 'Bookmark removed' : 'Blog bookmarked',
      bookmarked: !wasBookmarked,
      blog: blog,
      interactionMetrics: blog.interactionMetrics,
      success: true
    });
  } catch (error) {
    console.error('❌ Error toggling bookmark:', error);
    res.status(500).json({ message: 'Server error while toggling bookmark' });
  }
};

// Get user's bookmarked blogs
export const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const blogs = await Blog.find({
      'interactionMetrics.bookmarks': userId,
      isDeleted: false
    }).populate('author', 'name email').sort({ updatedAt: -1 });

    res.json(blogs);
  } catch (error) {
    console.error('Error fetching bookmarked blogs:', error);
    res.status(500).json({ message: 'Server error while fetching bookmarks' });
  }
};