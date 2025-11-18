import express from 'express';
import { syncProducts, getHiddenProducts, addHiddenProduct, removeHiddenProduct } from '../controllers/sheetsController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/sync', protect, admin, syncProducts);
router.get('/hidden', protect, admin, getHiddenProducts);
router.post('/hidden', protect, admin, addHiddenProduct);
router.delete('/hidden', protect, admin, removeHiddenProduct);

export default router;
