import { Router } from 'express';
import {
  getCustomerProfile,
  updateCustomerProfile,
  getFavorites,
  addFavorite,
  removeFavorite,
  getDbCart,
  syncCartWithDb,
  getCustomerOrders
} from '../controllers/customerController.js';
import { requireCustomer } from '../middleware/authMiddleware.js';

const router = Router();

// Customer Profile
router.get('/profile', requireCustomer, getCustomerProfile);
router.put('/profile', requireCustomer, updateCustomerProfile);

// Customer Wishlist (Favorites)
router.get('/favorites', requireCustomer, getFavorites);
router.post('/favorites', requireCustomer, addFavorite);
router.delete('/favorites/:productId', requireCustomer, removeFavorite);

// Customer Cart Syncing
router.get('/cart', requireCustomer, getDbCart);
router.post('/cart', requireCustomer, syncCartWithDb);

// Customer Orders Lookup
router.get('/orders', requireCustomer, getCustomerOrders);

export default router;
