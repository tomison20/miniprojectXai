import express from 'express';
import { getUserProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Strictly protected
router.get('/profile', protect, getUserProfile);

// Placeholder for getting other users (Public or Protected?)
// For now, let's keep it protected to encourage signup
// router.get('/:id', protect, getUserById); 

export default router;
