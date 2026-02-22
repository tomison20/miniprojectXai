import express from 'express';
import {
    getWallet,
    depositFunds
} from '../controllers/walletController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWallet);
router.post('/deposit', protect, depositFunds);

export default router;
