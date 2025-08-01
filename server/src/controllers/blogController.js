import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { calculateEngagementScore } from '../utils/engagementUtils.js';
import { GENRES, READING_LEVELS } from '../constants/enums.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildSortCriteria = (req) => {
  const { 
    sortBy = 'createdAt', 
    order = 'desc',
    prioritizeEngagement,
    prioritizeWatchTime,
    prioritizeDifficulty,
    sortType = 'default'
  } = req.query;

  const sortOrder = order === 'desc' ? -1 : 1;
  let sortOptions = {};

  if (sortType === 'homepage' || sortType === 'explore') {
    sortOptions = {
      views: -1,
      engagementScore: -1,
      readCount: -1,
      averageReadTime: -1,
      createdAt: -1
    };
  } else if (sortType === 'userBlogs') {
    sortOptions = {
      createdAt: -1,
      updatedAt: -1
    };
  } else if (prioritizeEngagement === 'true') {
    sortOptions = {
      engagementScore: -1,
      views: -1,
      readCount: -1,
      [sortBy]: sortOrder
    };
  } else if (prioritizeWatchTime === 'true') {
    sortOptions = {
      averageReadTime: -1,
      engagementScore: -1,
      [sortBy]: sortOrder
    };
  } else if (prioritizeDifficulty === 'true') {
    sortOptions = {
      readingDifficulty: -1,
      engagementScore: -1,
      [sortBy]: sortOrder
    };
  } else {
    sortOptions[sortBy] = sortOrder;
  }

  return sortOptions;
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
    const { 
      genre, 
      tags, 
      difficulty, 
      page = 1, 
      limit = 12,
      search
    } = req.query;

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

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const sortOptions = buildSortCriteria(req);
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalBlogs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

export const getAllDeletedBlogsByUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [deletedBlogs, totalBlogs] = await Promise.all([
      Blog.find({
        author: userId,
        isDeleted: true
      })
        .populate('author', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments({
        author: userId,
        isDeleted: true
      })
    ]);

    const totalPages = Math.ceil(totalBlogs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      blogs: deletedBlogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
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

    if (!GENRES.includes(genre)) {
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
      if (GENRES.includes(genre)) {
        updateData.genre = genre;
      }
    }

    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags) ? tags :
        (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : []);
    }

    if (readingDifficulty && READING_LEVELS.includes(readingDifficulty)) {
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

export const getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const [blogs, user] = await Promise.all([
      Blog.find({ author: userId, isDeleted: false }),
      Blog.findOne({ author: userId }).sort({ updatedAt: -1 }).select('updatedAt')
    ]);

    const totalBlogs = blogs.length;
    const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
    const lastUpdated = user ? user.updatedAt : null;

    res.json({
      totalBlogs,
      totalViews,
      lastUpdated,
      success: true
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Server error while fetching user stats' });
  }
};

export const deleteUserAllBlogs = async (userId) => {
  await Blog.deleteMany({ author: userId });
};

export const getUserBlogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { genre, difficulty, page = 1, limit = 5 } = req.query;

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

    const sortOptions = buildSortCriteria({ ...req, query: { ...req.query, sortType: 'userBlogs' } });
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalBlogs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching user blogs:', error);
    res.status(500).json({ message: 'Server error while fetching user blogs' });
  }
};

export const updateBlogEngagement = async (req, res) => {
  try {
    const { id } = req.params;
    const { metrics, userId, isAnonymous } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid blog ID format' });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const timeSpent = metrics.timeSpent || 0;

    if (isAnonymous || !userId) {
      blog.interactionMetrics.timeSpent.push({
        userId: null, 
        duration: timeSpent,
        lastRead: new Date()
      });

      if (metrics.completedReading) {
        blog.readCount += 1;
      }
    } else {
      if (!isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      const existingMetricIndex = blog.interactionMetrics.timeSpent
        .findIndex(m => m.userId && m.userId.toString() === userId);

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

      if (metrics.completedReading) {
        blog.readCount += 1;
      }
    }

    // Recalculate average read time including all users (authenticated and anonymous)
    const totalDuration = blog.interactionMetrics.timeSpent
      .reduce((sum, metric) => sum + metric.duration, 0);
    const totalReaders = blog.interactionMetrics.timeSpent.length;
    
    if (totalReaders > 0) {
      blog.averageReadTime = totalDuration / totalReaders;
    }

    blog.engagementScore = calculateEngagementScore(blog);

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

export const getUserBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 12 } = req.query;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [blogs, totalBlogs] = await Promise.all([
      Blog.find({
        'interactionMetrics.bookmarks': userId,
        isDeleted: false
      })
        .populate('author', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Blog.countDocuments({
        'interactionMetrics.bookmarks': userId,
        isDeleted: false
      })
    ]);

    const totalPages = Math.ceil(totalBlogs / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    res.json({
      blogs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalBlogs,
        hasNextPage,
        hasPrevPage,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching bookmarked blogs:', error);
    res.status(500).json({ message: 'Server error while fetching bookmarks' });
  }
};