import Blog from '../models/Blog.js';
import mongoose from 'mongoose';
import { calculateEngagementScore } from '../utils/engagementUtils.js';
import { GENRES, READING_LEVELS } from '../constants/enums.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

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

export const getBlogByIdWithAuthor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  const blog = await Blog.findOne({
    _id: id,
    isDeleted: false
  }).populate('author', 'name email username');

  if (!blog) {
    throw new ApiError('Blog not found or has been deleted', 404);
  }

  return res.status(200).json(new ApiResponse(200, blog, 'Blog retrieved successfully'));
});

export const getNonDeletedBlogs = asyncHandler(async (req, res) => {
  const {
    genre,
    tags,
    difficulty,
    page = 1,
    limit = 12,
    search
  } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  let filter = { isDeleted: false };

  // Build filter conditions
  if (genre && genre !== 'All') {
    if (!GENRES.includes(genre)) {
      throw new ApiError(`Invalid genre. Must be one of: ${GENRES.join(', ')}`, 400);
    }
    filter.genre = genre;
  }

  if (tags) {
    const tagArray = Array.isArray(tags) ? tags : tags.split(',').map(tag => tag.trim());
    if (tagArray.some(tag => !tag)) {
      throw new ApiError('Tags cannot be empty', 400);
    }
    filter.tags = { $in: tagArray };
  }

  if (difficulty) {
    if (!READING_LEVELS.includes(difficulty)) {
      throw new ApiError(`Invalid reading difficulty. Must be one of: ${READING_LEVELS.join(', ')}`, 400);
    }
    filter.readingDifficulty = difficulty;
  }

  if (search) {
    const searchTerm = search.trim();
    if (!searchTerm) {
      throw new ApiError('Search term cannot be empty', 400);
    }
    filter.$or = [
      { title: { $regex: searchTerm, $options: 'i' } },
      { content: { $regex: searchTerm, $options: 'i' } },
      { tags: { $in: [new RegExp(searchTerm, 'i')] } }
    ];
  }

  const sortOptions = buildSortCriteria(req);
  const skip = (pageNum - 1) * limitNum;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name email username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Blog.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalBlogs / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    blogs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalBlogs,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Blogs retrieved successfully'));
});

export const getAllDeletedBlogsByUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 12 } = req.query;

  if (!userId) {
    throw new ApiError('User authentication required', 401);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  const skip = (pageNum - 1) * limitNum;

  const [deletedBlogs, totalBlogs] = await Promise.all([
    Blog.find({
      author: userId,
      isDeleted: true
    })
      .populate('author', 'name email username')
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

  const responseData = {
    blogs: deletedBlogs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalBlogs,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Deleted blogs retrieved successfully'));
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, genre = 'All', tags = [], readingDifficulty = 'intermediate' } = req.body;
  const userId = req.user.id;

  if (!title?.trim()) {
    throw new ApiError('Blog title is required', 400);
  }

  if (!content?.trim()) {
    throw new ApiError('Blog content is required', 400);
  }

  if (title.trim().length < 3) {
    throw new ApiError('Blog title must be at least 3 characters long', 400);
  }

  if (title.trim().length > 200) {
    throw new ApiError('Blog title cannot exceed 200 characters', 400);
  }

  if (content.trim().length < 10) {
    throw new ApiError('Blog content must be at least 10 characters long', 400);
  }

  if (!userId) {
    throw new ApiError('User authentication required', 401);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  if (!GENRES.includes(genre)) {
    throw new ApiError(`Invalid genre. Must be one of: ${GENRES.join(', ')}`, 400);
  }

  if (!READING_LEVELS.includes(readingDifficulty)) {
    throw new ApiError(`Invalid reading difficulty. Must be one of: ${READING_LEVELS.join(', ')}`, 400);
  }

  const processedTags = Array.isArray(tags) ? tags :
    (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []);

  if (processedTags.length > 10) {
    throw new ApiError('Maximum 10 tags are allowed per blog', 400);
  }

  // Check for duplicate titles by the same user
  const existingBlog = await Blog.findOne({
    title: title.trim(),
    author: userId,
    isDeleted: false
  });

  if (existingBlog) {
    throw new ApiError('You already have a blog with this title', 409);
  }

  const newBlog = new Blog({
    title: title.trim(),
    content: content.trim(),
    author: userId,
    genre,
    tags: processedTags,
    readingDifficulty
  });

  const savedBlog = await newBlog.save();
  const populatedBlog = await Blog.findById(savedBlog._id).populate('author', 'name email username');

  return res.status(201).json(new ApiResponse(201, populatedBlog, 'Blog created successfully'));
});

export const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, genre, tags, readingDifficulty } = req.body;
  const userId = req.user.id;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  if (!title?.trim()) {
    throw new ApiError('Blog title is required', 400);
  }

  if (!content?.trim()) {
    throw new ApiError('Blog content is required', 400);
  }

  if (title.trim().length < 3) {
    throw new ApiError('Blog title must be at least 3 characters long', 400);
  }

  if (title.trim().length > 200) {
    throw new ApiError('Blog title cannot exceed 200 characters', 400);
  }

  if (content.trim().length < 10) {
    throw new ApiError('Blog content must be at least 10 characters long', 400);
  }

  const blog = await Blog.findOne({ _id: id, isDeleted: false });

  if (!blog) {
    throw new ApiError('Blog not found or has been deleted', 404);
  }

  if (blog.author.toString() !== userId) {
    throw new ApiError('Not authorized to update this blog', 403);
  }

  // Check for duplicate titles by the same user (excluding current blog)
  const existingBlog = await Blog.findOne({
    title: title.trim(),
    author: userId,
    isDeleted: false,
    _id: { $ne: id }
  });

  if (existingBlog) {
    throw new ApiError('You already have another blog with this title', 409);
  }

  const updateData = {
    title: title.trim(),
    content: content.trim()
  };

  if (genre) {
    if (!GENRES.includes(genre)) {
      throw new ApiError(`Invalid genre. Must be one of: ${GENRES.join(', ')}`, 400);
    }
    updateData.genre = genre;
  }

  if (tags !== undefined) {
    const processedTags = Array.isArray(tags) ? tags :
      (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []);

    if (processedTags.length > 10) {
      throw new ApiError('Maximum 10 tags are allowed per blog', 400);
    }

    updateData.tags = processedTags;
  }

  if (readingDifficulty) {
    if (!READING_LEVELS.includes(readingDifficulty)) {
      throw new ApiError(`Invalid reading difficulty. Must be one of: ${READING_LEVELS.join(', ')}`, 400);
    }
    updateData.readingDifficulty = readingDifficulty;
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('author', 'name email username');

  return res.status(200).json(new ApiResponse(200, updatedBlog, 'Blog updated successfully'));
});

export const safeDeleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  const blog = await Blog.findOne({ _id: id, isDeleted: false });

  if (!blog) {
    throw new ApiError('Blog not found or already deleted', 404);
  }

  if (blog.author.toString() !== userId) {
    throw new ApiError('Not authorized to delete this blog', 403);
  }

  blog.isDeleted = true;
  await blog.save();

  return res.status(200).json(new ApiResponse(200, null, 'Blog moved to trash successfully'));
});

export const permanentlyDeleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  const blog = await Blog.findOne({ _id: id, isDeleted: true });

  if (!blog) {
    throw new ApiError('Blog not found in trash', 404);
  }

  if (blog.author.toString() !== userId) {
    throw new ApiError('Not authorized to permanently delete this blog', 403);
  }

  await Blog.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, null, 'Blog permanently deleted successfully'));
});

export const restoreDeletedBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  const blog = await Blog.findOne({ _id: id, isDeleted: true });

  if (!blog) {
    throw new ApiError('Blog not found in trash', 404);
  }

  if (blog.author.toString() !== userId) {
    throw new ApiError('Not authorized to restore this blog', 403);
  }

  blog.isDeleted = false;
  await blog.save();

  const restoredBlog = await Blog.findById(id).populate('author', 'name email username');

  return res.status(200).json(new ApiResponse(200, restoredBlog, 'Blog restored successfully'));
});

export const incrementBlogView = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  const blog = await Blog.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!blog) {
    throw new ApiError('Blog not found or has been deleted', 404);
  }

  return res.status(200).json(new ApiResponse(200, { views: blog.views }, 'Blog view incremented successfully'));
});

export const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId?.trim()) {
    throw new ApiError('User ID is required', 400);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const [blogs, user] = await Promise.all([
    Blog.find({ author: userId, isDeleted: false }),
    Blog.findOne({ author: userId }).sort({ updatedAt: -1 }).select('updatedAt')
  ]);

  const totalBlogs = blogs.length;
  const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
  const lastUpdated = user ? user.updatedAt : null;

  const statsData = {
    totalBlogs,
    totalViews,
    lastUpdated
  };

  return res.status(200).json(new ApiResponse(200, statsData, 'User stats retrieved successfully'));
});

export const deleteUserAllBlogs = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  if (!isValidObjectId(userId)) {
    throw new Error('Invalid user ID format');
  }

  await Blog.deleteMany({ author: userId });
};

export const getUserBlogs = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { genre, difficulty, page = 1, limit = 5 } = req.query;

  if (!userId?.trim()) {
    throw new ApiError('User ID is required', 400);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  let filter = {
    author: userId,
    isDeleted: false
  };

  if (genre && genre !== 'All') {
    if (!GENRES.includes(genre)) {
      throw new ApiError(`Invalid genre. Must be one of: ${GENRES.join(', ')}`, 400);
    }
    filter.genre = genre;
  }

  if (difficulty) {
    if (!READING_LEVELS.includes(difficulty)) {
      throw new ApiError(`Invalid reading difficulty. Must be one of: ${READING_LEVELS.join(', ')}`, 400);
    }
    filter.readingDifficulty = difficulty;
  }

  const sortOptions = buildSortCriteria({ ...req, query: { ...req.query, sortType: 'userBlogs' } });
  const skip = (pageNum - 1) * limitNum;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find(filter)
      .populate('author', 'name email username')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Blog.countDocuments(filter)
  ]);

  const totalPages = Math.ceil(totalBlogs / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  const responseData = {
    blogs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalBlogs,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'User blogs retrieved successfully'));
});

export const updateBlogEngagement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { metrics, userId, isAnonymous } = req.body;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  if (!metrics || typeof metrics !== 'object') {
    throw new ApiError('Engagement metrics are required', 400);
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    throw new ApiError('Blog not found', 404);
  }

  const timeSpent = metrics.timeSpent || 0;

  if (typeof timeSpent !== 'number' || timeSpent < 0) {
    throw new ApiError('Time spent must be a positive number', 400);
  }

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
      throw new ApiError('Invalid user ID format', 400);
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

  return res.status(200).json(new ApiResponse(200, null, 'Engagement metrics updated successfully'));
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id?.trim()) {
    throw new ApiError('Blog ID is required', 400);
  }

  if (!isValidObjectId(id)) {
    throw new ApiError('Invalid blog ID format', 400);
  }

  if (!userId) {
    throw new ApiError('User authentication required', 401);
  }

  const blog = await Blog.findById(id).populate('author', 'name email username');
  if (!blog) {
    throw new ApiError('Blog not found', 404);
  }

  if (blog.isDeleted) {
    throw new ApiError('Cannot bookmark a deleted blog', 400);
  }

  const bookmarkIndex = blog.interactionMetrics.bookmarks.indexOf(userId);
  let wasBookmarked = bookmarkIndex > -1;

  if (bookmarkIndex > -1) {
    blog.interactionMetrics.bookmarks.splice(bookmarkIndex, 1);
  } else {
    blog.interactionMetrics.bookmarks.push(userId);
  }

  await blog.save();

  const responseData = {
    message: wasBookmarked ? 'Bookmark removed' : 'Blog bookmarked',
    bookmarked: !wasBookmarked,
    blog: blog,
    interactionMetrics: blog.interactionMetrics
  };

  return res.status(200).json(new ApiResponse(200, responseData, wasBookmarked ? 'Bookmark removed successfully' : 'Blog bookmarked successfully'));
});

export const getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 12 } = req.query;

  if (!userId) {
    throw new ApiError('User authentication required', 401);
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError('Invalid user ID format', 400);
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ApiError('Page number must be a positive integer', 400);
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
    throw new ApiError('Limit must be between 1 and 50', 400);
  }

  const skip = (pageNum - 1) * limitNum;

  const [blogs, totalBlogs] = await Promise.all([
    Blog.find({
      'interactionMetrics.bookmarks': userId,
      isDeleted: false
    })
      .populate('author', 'name email username')
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

  const responseData = {
    blogs,
    pagination: {
      currentPage: pageNum,
      totalPages,
      totalBlogs,
      hasNextPage,
      hasPrevPage,
      limit: limitNum
    }
  };

  return res.status(200).json(new ApiResponse(200, responseData, 'Bookmarked blogs retrieved successfully'));
});

export const getBlogByTitle = asyncHandler(async (req, res) => {
  const { title } = req.params;

  if (!title?.trim()) {
    throw new ApiError('Title parameter is required', 400);
  }

  const decodedTitle = decodeURIComponent(title);
  if (!decodedTitle || decodedTitle.trim() === '') {
    throw new ApiError('Title parameter cannot be empty', 400);
  }

  const blogs = await Blog.find({
    title: { $regex: decodedTitle.trim(), $options: 'i' },
    isDeleted: false
  }).populate('author', 'name email username');

  if (!blogs || blogs.length === 0) {
    throw new ApiError('No blogs found with the specified title', 404);
  }

  return res.status(200).json(new ApiResponse(200, blogs, 'Blogs fetched successfully'));
});

export const getBlogByContent = asyncHandler(async (req, res) => {
  const { content } = req.params;

  if (!content?.trim()) {
    throw new ApiError('Content parameter is required', 400);
  }

  const decodedContent = decodeURIComponent(content);
  if (!decodedContent || decodedContent.trim() === '') {
    throw new ApiError('Content parameter cannot be empty', 400);
  }

  const blogs = await Blog.find({
    content: { $regex: decodedContent.trim(), $options: 'i' },
    isDeleted: false
  }).populate('author', 'name email username');

  if (!blogs || blogs.length === 0) {
    throw new ApiError('No blogs found with the specified content', 404);
  }

  return res.status(200).json(new ApiResponse(200, blogs, 'Blogs fetched successfully'));
});

export const getBlogByTags = asyncHandler(async (req, res) => {
  const { tags } = req.params;

  if (!tags?.trim()) {
    throw new ApiError('Tags parameter is required', 400);
  }

  const decodedTags = decodeURIComponent(tags);
  if (!decodedTags || decodedTags.trim() === '') {
    throw new ApiError('Tags parameter cannot be empty', 400);
  }

  const tagArray = decodedTags.split(',').map(tag => tag.trim()).filter(tag => tag);
  if (tagArray.length === 0) {
    throw new ApiError('At least one valid tag is required', 400);
  }

  const blogs = await Blog.find({
    tags: { $in: tagArray },
    isDeleted: false
  }).populate('author', 'name email username');

  if (!blogs || blogs.length === 0) {
    throw new ApiError('No blogs found with the specified tags', 404);
  }

  return res.status(200).json(new ApiResponse(200, blogs, 'Blogs fetched successfully'));
});