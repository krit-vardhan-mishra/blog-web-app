import express from 'express';
import { getBlogByIdWithAuthor, getNonDeletedBlogs, getAllDeletedBlogsByUser, createBlog, updateBlog, safeDeleteBlog, permanentlyDeleteBlog, restoreDeletedBlog, incrementBlogView} from '../controllers/blogController.js'
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/', authenticateToken, getNonDeletedBlogs);
router.get('/deleted', authenticateToken, getAllDeletedBlogsByUser);
router.get('/:id', authenticateToken, getBlogByIdWithAuthor);
router.post('/', authenticateToken, createBlog);
router.put('/:id', authenticateToken, updateBlog); 

// Soft delete a blog (marks isDeleted to true)
router.delete('/:id', authenticateToken, safeDeleteBlog);

// Permanently delete a blog
router.delete('/permanent/:id', authenticateToken, permanentlyDeleteBlog);

// Restore a deleted blog
router.post('/restore/:id', authenticateToken, restoreDeletedBlog); 

// Increment Blog View (Moved to be a dedicated endpoint)
router.post('/api/blogs/increment-view/:id', authenticateToken, incrementBlogView); 

export default router;