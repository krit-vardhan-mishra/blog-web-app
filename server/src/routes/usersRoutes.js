import express from 'express';
import { getAllUsers, getUserById, updateUserProfile, getCurrentUserProfile } from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);

export default router;