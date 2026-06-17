import { Router } from 'express';
import { createOrder, getAllOrders, getOrderById, updateOrderStatus, getDashboardSummary } from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = Router();

// Public route: Submit order with payment proof screenshot
router.post('/', upload.single('payment_screenshot'), createOrder);

// Admin routes (Protected)
router.get('/', requireAdmin, getAllOrders);
router.get('/summary', requireAdmin, getDashboardSummary);
router.get('/:id', getOrderById); // Accessible by tracking and admin
router.put('/:id/status', requireAdmin, updateOrderStatus);

export default router;
