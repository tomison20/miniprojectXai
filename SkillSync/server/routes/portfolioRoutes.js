import express from 'express';
import {
    getMyPortfolio,
    getOrganizationPortfolios,
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    uploadPDF
} from '../controllers/portfolioController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(protect, authorize('student', 'faculty', 'admin'), getMyPortfolio)
    .post(protect, authorize('student'), uploadPDF.single('portfolioPDF'), createPortfolioItem);

router.route('/organization')
    .get(protect, authorize('organizer'), getOrganizationPortfolios);

router.route('/:id')
    .put(protect, authorize('student'), uploadPDF.single('portfolioPDF'), updatePortfolioItem)
    .delete(protect, authorize('student'), deletePortfolioItem);

export default router;
