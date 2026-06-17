import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Admin routes (Protected)
router.post('/', requireAdmin, upload.array('images', 5), createProduct);
router.put('/:id', requireAdmin, upload.array('images', 5), updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
