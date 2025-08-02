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
import { SERVER } from '../utils/constants.js';

const router = express.Router();

router.use((error, req, res, next) => {
  console.error('Blog route error:', error);

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation error',
      details: error.message
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: SERVER.NODE_ENV === 'DEVELOPMENT' ? error.message : undefined
  });
});

router.get('/user/:userId/stats', getUserStats);
router.get('/user/:userId', getUserBlogs);
router.get('/bookmarks', authenticateToken, getUserBookmarks);
router.get('/search', getNonDeletedBlogs);
router.get('/', getNonDeletedBlogs);
router.get('/deleted', authenticateToken, getAllDeletedBlogsByUser);
router.post('/increment-view/:id', incrementBlogView);
router.get('/:id', getBlogByIdWithAuthor);
router.post('/', authenticateToken, createBlog);
router.put('/:id', authenticateToken, updateBlog);
router.delete('/:id', authenticateToken, safeDeleteBlog);
router.delete('/permanent/:id', authenticateToken, permanentlyDeleteBlog);
router.post('/restore/:id', authenticateToken, restoreDeletedBlog);
router.post('/:id/engagement', updateBlogEngagement);
router.post('/:id/bookmark', authenticateToken, toggleBookmark);

export default router;