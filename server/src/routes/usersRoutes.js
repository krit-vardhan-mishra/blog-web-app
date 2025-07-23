import express from 'express';
import {
    createUser,
    getAllUsers,
    getUserById,
    updateUserProfile,
    getCurrentUserProfile,
    deleteUserById,
    getUsersWithBlogs, 
    getUsersWithoutBlogs 
} from '../controllers/userController.js';
import authenticateToken from '../middleware/authenticateToken.js'; 

const router = express.Router();

router.post('/', createUser);
router.get('/profile', authenticateToken, getCurrentUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/', authenticateToken, getAllUsers);
router.get('/:id', getUserById);
router.get('/with-blogs', authenticateToken, getUsersWithBlogs);
router.get('/without-blogs', authenticateToken, getUsersWithoutBlogs);
router.delete('/delete/:id', authenticateToken, deleteUserById);

export default router;
