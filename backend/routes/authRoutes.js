import { Router } from 'express';
import { login, logout, getProfile, customerRegister, customerLogin } from '../controllers/authController.js';
import { requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/profile', requireAdmin, getProfile);

// Customer Auth
router.post('/customer/register', customerRegister);
router.post('/customer/login', customerLogin);

export default router;
