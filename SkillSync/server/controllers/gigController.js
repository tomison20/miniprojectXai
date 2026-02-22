import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import { lockFunds, releaseFunds } from './walletController.js';

// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Organizer)
export const createGig = async (req, res) => {
    try {
        const { title, description, budget, deadline, skillsRequired, deliverables } = req.body;

        const gig = await Gig.create({
            title,
            description,
            budget,
            deadline,
            skillsRequired,
            deliverables,
            organizer: req.user._id,
            organization: req.user.organization // Multi-tenant scoping
        });

        res.status(201).json(gig);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
export const getGigs = async (req, res) => {
    try {
        // Scoped to organization
        const query = {
            status: 'open',
            organization: req.user.organization
        };

        const gigs = await Gig.find(query)
            .populate('organizer', 'name email avatar headline')
            .sort({ createdAt: -1 });
        res.json(gigs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single gig
// @route   GET /api/gigs/:id
// @access  Public
export const getGigById = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id)
            .populate('organizer', 'name email avatar')
            .populate('assignedTo', 'name email');

        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }
        res.json(gig);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

// @desc    Place a bid
// @route   POST /api/gigs/:id/bids
// @access  Private (Student)
export const placeBid = async (req, res) => {
    try {
        const { amount, proposal } = req.body;
        const gig = await Gig.findById(req.params.id);

        if (!gig || gig.status !== 'open') {
            res.status(400);
            throw new Error('Gig not available for bidding');
        }

        const bid = await Bid.create({
            gig: gig._id,
            freelancer: req.user._id,
            amount: amount,
            proposal: proposal
        });

        res.status(201).json(bid);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Accept a bid & Lock Funds
// @route   PUT /api/gigs/:id/accept/:bidId
// @access  Private (Organizer)
export const acceptBid = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);
        const bid = await Bid.findById(req.params.bidId);

        if (!gig || !bid) {
            res.status(404);
            throw new Error('Gig or Bid not found');
        }

        if (gig.organizer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to accept bids for this gig');
        }

        // 1. Lock Funds
        await lockFunds(req.user._id, bid.amount, gig._id);

        // 2. Update Gig Status
        gig.status = 'assigned';
        gig.assignedTo = bid.freelancer;
        gig.budget = bid.amount; // Final agreed amount
        await gig.save();

        // 3. Update Bid Status
        bid.status = 'accepted';
        await bid.save();

        res.json({ message: 'Bid accepted, funds held in escrow', gig });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


// @desc    Submit Work
// @route   PUT /api/gigs/:id/submit
// @access  Private (Freelancer)
export const submitWork = async (req, res) => {
    try {
        const { link, description } = req.body;
        const gig = await Gig.findById(req.params.id);

        if (gig.assignedTo.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }

        gig.status = 'submitted';
        gig.submission = {
            link,
            description,
            submittedAt: Date.now()
        };
        await gig.save();

        res.json(gig);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Approve Work & Release Funds
// @route   PUT /api/gigs/:id/approve
// @access  Private (Organizer)
export const approveWork = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (gig.organizer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('Not authorized');
        }

        if (gig.status !== 'submitted') {
            res.status(400);
            throw new Error('Work not submitted yet');
        }

        // Release Funds
        await releaseFunds(req.user._id, gig.assignedTo, gig.budget, gig._id);

        gig.status = 'completed';
        await gig.save();

        res.json({ message: 'Work approved, funds released', gig });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update gig
// @route   PUT /api/gigs/:id
// @access  Private (Organizer)
export const updateGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Check ownership
        if (gig.organizer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized');
        }

        const updatedGig = await Gig.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(updatedGig);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete gig
// @route   DELETE /api/gigs/:id
// @access  Private (Organizer)
export const deleteGig = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.id);

        if (!gig) {
            res.status(404);
            throw new Error('Gig not found');
        }

        // Check ownership
        if (gig.organizer.toString() !== req.user._id.toString()) {
            res.status(403);
            throw new Error('User not authorized');
        }

        await gig.deleteOne();

        res.json({ message: 'Gig removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
