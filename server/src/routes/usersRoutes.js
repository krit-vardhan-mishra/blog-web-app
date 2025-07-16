import express from 'express';
import { getAllUsers, getUserById, updateUserProfile, getCurrentUserProfile, deleteUserById } from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/delete/:id', authenticateToken, deleteUserById)

export default router;