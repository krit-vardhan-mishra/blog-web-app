import express from 'express';
import {
  getBlogByIdWithAuthor,
  getNonDeletedBlogs,
  getAllDeletedBlogsByUser,
  createBlog,
  updateBlog,
  safeDeleteBlog,
  permanentlyDeleteBlog,
  restoreDeletedBlog,
  incrementBlogView,
  getUserBlogs,
  updateBlogEngagement,
  toggleBookmark,
  getUserBookmarks,
  getUserStats
} from '../controllers/blogController.js';
import authenticateToken from '../middleware/authenticateToken.js';
import searchRouter from './searchRoutes.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/user/:userId/stats', getUserStats);
router.get('/user/:userId', getUserBlogs);
router.get('/bookmarks', authenticateToken, getUserBookmarks);
router.get('/', getNonDeletedBlogs);
router.get('/deleted', authenticateToken, getAllDeletedBlogsByUser);
router.post('/increment-view/:id', incrementBlogView);
router.use('/search', searchRouter);
router.get('/:id', getBlogByIdWithAuthor);
router.post('/', authenticateToken, createBlog);
router.put('/:id', authenticateToken, updateBlog);
router.delete('/:id', authenticateToken, safeDeleteBlog);
router.delete('/permanent/:id', authenticateToken, permanentlyDeleteBlog);
router.post('/restore/:id', authenticateToken, restoreDeletedBlog);
router.post('/:id/engagement', updateBlogEngagement);
router.post('/:id/bookmark', authenticateToken, toggleBookmark);

// Apply error handler middleware
router.use(errorHandler);

export default router;