import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    try {
      const storedCart = localStorage.getItem('luv_store_cart');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (e) {
      console.error('Error loading cart from localStorage', e);
      return [];
    }
  });

  // 1. Sync cart from DB on user login / mount
  useEffect(() => {
    const fetchDbCart = async () => {
      if (user) {
        try {
          const response = await api.get('/customer/cart');
          const dbCart = response.data;

          if (dbCart.length > 0) {
            setCart((prevCart) => {
              const merged = [...prevCart];
              
              dbCart.forEach((dbItem) => {
                const idx = merged.findIndex((item) => item.id === dbItem.id);
                if (idx === -1) {
                  merged.push(dbItem);
                } else {
                  // Merge quantities up to product stock
                  const maxStock = dbItem.stock !== undefined ? dbItem.stock : 999;
                  merged[idx].quantity = Math.min(merged[idx].quantity + dbItem.quantity, maxStock);
                }
              });

              return merged;
            });
          }
        } catch (err) {
          console.warn('Silent check: Failed to pull DB cart.', err.message);
        }
      }
    };

    fetchDbCart();
  }, [user]);

  // 2. Persist to localStorage and sync to DB when cart modifies (with 500ms debounce)
  useEffect(() => {
    localStorage.setItem('luv_store_cart', JSON.stringify(cart));

    const syncWithDb = async () => {
      if (user) {
        try {
          await api.post('/customer/cart', {
            cart: cart.map(item => ({ id: item.id, quantity: item.quantity }))
          });
        } catch (err) {
          console.warn('Failed to sync cart updates with database:', err.message);
        }
      }
    };

    const debounceTimer = setTimeout(() => {
      syncWithDb();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex((item) => item.id === product.id);
      
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        const newQty = updatedCart[existingItemIndex].quantity + quantity;
        const maxStock = product.stock !== undefined ? product.stock : 999;
        
        updatedCart[existingItemIndex].quantity = Math.min(newQty, maxStock);
        return updatedCart;
      } else {
        const finalPrice = product.discount_price !== null && product.discount_price !== undefined 
          ? product.discount_price 
          : product.price;

        return [...prevCart, { 
          id: product.id, 
          name: product.name, 
          price: product.price,
          discount_price: product.discount_price,
          finalPrice: parseFloat(finalPrice),
          images: product.images,
          stock: product.stock,
          category: product.category,
          quantity: Math.min(quantity, product.stock || 1)
        }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.id === productId) {
          const maxStock = item.stock !== undefined ? item.stock : 999;
          return { ...item, quantity: Math.min(quantity, maxStock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
