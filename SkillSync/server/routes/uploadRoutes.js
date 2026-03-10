import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `avatar-${Date.now()}${path.extname(file.originalname)}`);
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only (jpg, jpeg, png, webp)');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

router.post('/', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    // Return relative path ensuring forward slashes for URLs
    const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
    res.json({ url: filePath });
});

const storageChat = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `chat-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const uploadChat = multer({ storage: storageChat });

router.post('/chat', protect, uploadChat.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
    res.json({ url: filePath, originalName: req.file.originalname });
});

// PDF Resume / Portfolio Global upoads
const storagePdf = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(null, `doc-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const uploadPdf = multer({
    storage: storagePdf,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname).toLowerCase() === '.pdf') {
            return cb(null, true);
        }
        cb('PDFs only for document uploads');
    }
});

router.post('/pdf', protect, uploadPdf.single('portfolioPDF'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }
    const filePath = `/${req.file.path.replace(/\\/g, '/')}`;
    res.json({ url: filePath, originalName: req.file.originalname });
});

export default router;
