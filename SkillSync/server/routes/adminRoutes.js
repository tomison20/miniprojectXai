import express from 'express';
import { seedData } from '../controllers/adminController.js';

const router = express.Router();

router.post('/seed', seedData);

export default router;
