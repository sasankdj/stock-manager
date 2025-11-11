import express from 'express';
import { syncProducts } from '../controllers/sheetsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sync', protect, admin, syncProducts);

export default router;