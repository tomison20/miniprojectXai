import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { protect } from '../middleware/authMiddleware.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

let useCloudinary = false;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    useCloudinary = true;
    console.log('Cloudinary storage enabled for uploads');
} else {
    console.warn('Cloudinary credentials missing - falling back to local disk storage');
}

// ─── Storage Factories ──────────────────────────────────────────────

const getDiskStorage = (prefix) => multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const getCloudStorage = (prefix) => new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: `skillsync/${prefix}`,
        resource_type: 'auto' // Crucial: 'auto' supports both images and PDFs seamlessly
    }
});

const getStorage = (prefix) => useCloudinary ? getCloudStorage(prefix) : getDiskStorage(prefix);

// ─── File Filters ───────────────────────────────────────────────────

function fileFilterImages(req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb('Images only (jpg, jpeg, png, webp)');
}

function fileFilterPdf(req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') return cb(null, true);
    cb('PDFs only for document uploads');
}

function fileFilterMixed(req, file, cb) {
    const filetypes = /jpg|jpeg|png|webp|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|pdf/.test(file.mimetype);
    if (extname && mimetype) return cb(null, true);
    cb('Documents must be PDF or image files (jpg, jpeg, png, webp)');
}

// ─── Universal Upload Request Handler ────────────────────────────────

const handleUpload = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Cloudinary injects the secure URL directly into req.file.path
    // Local storage requires prefixing with '/' and fixing backslashes
    const filePath = useCloudinary ? req.file.path : `/${req.file.path.replace(/\\/g, '/')}`;
    res.json({ url: filePath, originalName: req.file.originalname });
};

// ─── Routes ─────────────────────────────────────────────────────────

// 1. Profile Avatar Image
const uploadAvatar = multer({ storage: getStorage('avatars'), fileFilter: fileFilterImages });
router.post('/', protect, uploadAvatar.single('image'), handleUpload);

// 2. Chat File Attachments (Unfiltered, or mixed)
const uploadChat = multer({ storage: getStorage('chats') });
router.post('/chat', protect, uploadChat.single('file'), handleUpload);

// 3. Portfolios (PDF Only)
const uploadPdf = multer({ storage: getStorage('resumes'), fileFilter: fileFilterPdf });
router.post('/pdf', protect, uploadPdf.single('portfolioPDF'), handleUpload);

// 4. Certificates (PDF or Images)
const uploadCert = multer({ storage: getStorage('certificates'), fileFilter: fileFilterMixed });
router.post('/certificate', protect, uploadCert.single('certificate'), handleUpload);

// 5. Event Photos (Images Only)
const uploadPhoto = multer({ storage: getStorage('events'), fileFilter: fileFilterImages });
router.post('/event-photo', protect, uploadPhoto.single('eventPhoto'), handleUpload);

export default router;
