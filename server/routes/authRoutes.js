import express from 'express';
import rateLimit from 'express-rate-limit';
import {
  register,
  login,
  logout,
  getMe,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getCsrfTokenHandler } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Strict rate limiter for sensitive authentication actions (mitigates brute-force attacks)
// Note: In test mode, we disable or increase limit to avoid blocking automated tests
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 25, // 25 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// CSRF token retrieval endpoint
router.get('/csrf-token', getCsrfTokenHandler);

// Public authentication routes with rate limiting
router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/logout', logout);

// Protected authentication routes
router.get('/me', protect, getMe);
router.post('/change-password', protect, authRateLimiter, changePassword);

export default router;
