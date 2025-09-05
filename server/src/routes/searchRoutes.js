import express from 'express';
import { getUserByEmail, getUserByUsername } from '../controllers/userController.js';
import { getBlogByContent, getBlogByTags, getBlogByTitle } from '../controllers/blogController.js';
import errorHandler from '../middleware/errorHandler.js';

const router = express.Router();

router.get('/email/:email', getUserByEmail);
router.get('/username/:username', getUserByUsername);
router.get('/title/:title', getBlogByTitle);
router.get('/content/:content', getBlogByContent);
router.get('/tags/:tags', getBlogByTags);

// Apply error handler middleware
router.use(errorHandler);

export default router;