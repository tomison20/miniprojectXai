import Portfolio from '../models/Portfolio.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PDF upload config (reusing the uploads dir from volunteer system)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `portfolio-${unique}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

export const uploadPDF = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// @desc    Get student portfolio
// @route   GET /api/portfolios
// @access  Private (Student)
export const getMyPortfolio = async (req, res) => {
    try {
        const portfolio = await Portfolio.find({
            student: req.user._id,
            organization: req.user.organization
        });
        res.json(portfolio);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all student portfolios for an organizer's organization
// @route   GET /api/portfolios/organization
// @access  Private (Organizer)
export const getOrganizationPortfolios = async (req, res) => {
    try {
        // Find all portfolios in the same organization as the requesting user
        const portfolios = await Portfolio.find({
            organization: req.user.organization
        })
        .populate('student', 'name avatar headline')
        .sort('-createdAt');
        
        res.json(portfolios);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create portfolio item (with optional PDF)
// @route   POST /api/portfolios
export const createPortfolioItem = async (req, res) => {
    try {
        const { title, description, link, projectLink, image, skills, startDate, endDate, currentlyWorking, contributors } = req.body;
        
        // Parse JSON strings if sent via FormData
        const parsedSkills = typeof skills === 'string' ? JSON.parse(skills || '[]') : (skills || []);
        const parsedContributors = typeof contributors === 'string' ? JSON.parse(contributors || '[]') : (contributors || []);
        
        const item = await Portfolio.create({
            student: req.user._id,
            organization: req.user.organization,
            title,
            description,
            link,
            projectLink,
            image,
            skills: parsedSkills,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            currentlyWorking: currentlyWorking === 'true' || currentlyWorking === true,
            contributors: parsedContributors,
            portfolioPDF: req.file ? `/uploads/${req.file.filename}` : undefined
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update portfolio item (with optional PDF)
// @route   PUT /api/portfolios/:id
export const updatePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findOne({ _id: req.params.id, student: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Parse JSON strings if sent via FormData
        const body = { ...req.body };
        if (typeof body.skills === 'string') body.skills = JSON.parse(body.skills || '[]');
        if (typeof body.contributors === 'string') body.contributors = JSON.parse(body.contributors || '[]');
        if (body.currentlyWorking !== undefined) body.currentlyWorking = body.currentlyWorking === 'true' || body.currentlyWorking === true;

        Object.assign(item, body);
        if (req.file) {
            item.portfolioPDF = `/uploads/${req.file.filename}`;
        }
        await item.save();
        res.json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete portfolio item
// @route   DELETE /api/portfolios/:id
export const deletePortfolioItem = async (req, res) => {
    try {
        const item = await Portfolio.findOneAndDelete({ _id: req.params.id, student: req.user._id });
        if (!item) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
