import express from 'express';
import { getProducts, getProductById, getCategories } from '../controllers/productController.js';

const router = express.Router();

router.route('/').get(getProducts);
router.route('/categories').get(getCategories);
router.route('/:id').get(getProductById);

export default router;
