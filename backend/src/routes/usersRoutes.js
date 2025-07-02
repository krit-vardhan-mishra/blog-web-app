import express from 'express';
import { getAllUsers, getUserById, updateUserProfile } from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Get all users (protected)
router.get('/', authenticateToken, getAllUsers);

// Get a user by ID (protected)
router.get('/:id', authenticateToken, getUserById);

// Update user profile (protected)
router.put('/api/user/profile', authenticateToken, updateUserProfile); 

// Get user profile (protected)
router.get('/api/user/profile', authenticateToken, getUserById);

export default router;