import express from 'express';
import {
    createGig,
    getGigs,
    getGigById,
    placeBid,
    acceptBid,
    submitWork,
    approveWork,
    updateGig,
    deleteGig
} from '../controllers/gigController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, authorize('organizer', 'admin'), createGig)
    .get(getGigs);

router.route('/:id')
    .get(getGigById)
    .put(protect, authorize('organizer', 'admin'), updateGig)
    .delete(protect, authorize('organizer', 'admin'), deleteGig);

router.route('/:id/bids')
    .post(protect, authorize('student'), placeBid);

// Workflow Routes
router.route('/:id/accept/:bidId')
    .put(protect, authorize('organizer', 'admin'), acceptBid);

router.route('/:id/submit')
    .put(protect, authorize('student'), submitWork);

router.route('/:id/approve')
    .put(protect, authorize('organizer', 'admin'), approveWork);

export default router;
