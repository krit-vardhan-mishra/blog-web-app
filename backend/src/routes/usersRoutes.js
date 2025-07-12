import express from 'express';
import { getAllUsers, getUserById, updateUserProfile } from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/api/user/profile', authenticateToken, updateUserProfile); 
router.get('/api/user/profile', authenticateToken, getUserById);

export default router;