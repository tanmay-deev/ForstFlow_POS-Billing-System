import express from 'express';
import { loginUser, getCurrentUser, logoutUser, registerUser, getAllUsers, updateUser, deleteUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateLogin } from '../validations/authValidation.js';

const router = express.Router();

router.post('/login', validateLogin, loginUser);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);
router.post('/register', protect, authorize('admin', 'manager'), registerUser);
router.get('/users', protect, authorize('admin', 'manager'), getAllUsers);
router.put('/users/:id', protect, authorize('admin', 'manager'), updateUser);
router.delete('/users/:id', protect, authorize('admin', 'manager'), deleteUser);

export default router;
