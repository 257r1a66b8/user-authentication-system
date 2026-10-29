import express from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { csrfProtection } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Protected profile management endpoints
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, csrfProtection, updateProfile);

export default router;
