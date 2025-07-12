import express from 'express';
import authenticateToken from '../middleware/authenticateToken.js';
import { loginUser, registerUser, verifyPassword } from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);
router.post('/verify-password', authenticateToken, verifyPassword);

export default router;