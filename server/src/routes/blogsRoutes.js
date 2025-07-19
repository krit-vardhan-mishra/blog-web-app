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
  getUserBlogs
} from '../controllers/blogController.js';
import authenticateToken from '../middleware/authenticateToken.js';

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
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

router.get('/user/:userId', authenticateToken, getUserBlogs);
router.get('/', authenticateToken, getNonDeletedBlogs);
router.get('/deleted', authenticateToken, getAllDeletedBlogsByUser);
router.post('/increment-view/:id', authenticateToken, incrementBlogView);
router.get('/:id', authenticateToken, getBlogByIdWithAuthor);
router.post('/', authenticateToken, createBlog);
router.put('/:id', authenticateToken, updateBlog);
router.delete('/:id', authenticateToken, safeDeleteBlog);
router.delete('/permanent/:id', authenticateToken, permanentlyDeleteBlog);
router.post('/restore/:id', authenticateToken, restoreDeletedBlog);

export default router;