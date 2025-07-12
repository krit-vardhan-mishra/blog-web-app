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
  incrementBlogView
} from '../controllers/blogController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

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