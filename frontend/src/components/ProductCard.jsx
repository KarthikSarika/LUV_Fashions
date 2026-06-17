import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from './Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const { id, name, price, discount_price, stock, images, category } = product;

  // Initialize isHearted to true if on wishlist path
  const [isHearted, setIsHearted] = useState(() => {
    return window.location.pathname === '/favorites';
  });

  const handleHeartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.warning('Please log in to save favorites.');
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    try {
      if (isHearted) {
        await api.delete(`/customer/favorites/${id}`);
        setIsHearted(false);
        toast.success(`Removed "${name}" from wishlist.`);
        // If we are currently on the favorites page, reload the list
        if (window.location.pathname === '/favorites') {
          window.location.reload();
        }
      } else {
        await api.post('/customer/favorites', { product_id: id });
        setIsHearted(true);
        toast.success(`Added "${name}" to wishlist.`);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err.message);
      toast.error('Failed to update wishlist.');
    }
  };

  // Use the first image from the array or a beautiful abstract placeholder if none exist
  const displayImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';

  const hasDiscount = discount_price !== null && discount_price !== undefined;
  const finalPrice = hasDiscount ? discount_price : price;
  
  const discountPercent = hasDiscount 
    ? Math.round(((price - discount_price) / price) * 100)
    : 0;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to detail page when clicking add to cart
    if (isOutOfStock) {
      toast.error("Sorry, this product is currently out of stock.");
      return;
    }
    addToCart(product, 1);
    toast.success(`"${name}" added to shopping cart!`);
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200/60 dark:border-dark-800/60 bg-white dark:bg-dark-900 overflow-hidden hover:shadow-xl hover:shadow-slate-100/50 dark:hover:shadow-none hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
      {/* Product Image and Badges */}
      <Link to={`/products/${id}`} className="relative aspect-square w-full overflow-hidden block bg-slate-100 dark:bg-dark-950">
        <img
          src={displayImage}
          alt={name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Hot / Sale Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {hasDiscount && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-500 text-white shadow-md">
              <Tag className="w-3 h-3" /> {discountPercent}% OFF
            </span>
          )}
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-800 text-white shadow-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-md">
              Only {stock} Left!
            </span>
          ) : null}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleHeartClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/85 dark:bg-dark-900/85 text-slate-500 dark:text-dark-400 hover:text-rose-550 hover:bg-white dark:hover:bg-dark-900 shadow-md transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20"
          aria-label="Add to wishlist"
        >
          <Heart className={`w-4 h-4 transition-colors ${isHearted ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
        </button>
      </Link>

      {/* Description Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Category */}
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 dark:text-dark-500 uppercase">
            {category}
          </span>
          {/* Name */}
          <Link to={`/products/${id}`} className="block">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-dark-100 group-hover:text-primary-500 transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>
        </div>

        {/* Price and Cart Action */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-dark-800">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-slate-400 dark:text-dark-500 line-through">
                  ₹{price.toLocaleString('en-IN')}
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-dark-50">
                  ₹{discount_price.toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-slate-900 dark:text-dark-50">
                ₹{price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center p-2 rounded-xl border transition-all ${
              isOutOfStock
                ? 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-dark-900 dark:border-dark-800 cursor-not-allowed'
                : 'bg-primary-500 border-primary-500 text-white hover:bg-primary-600 hover:border-primary-600 shadow-md shadow-primary-500/20'
            }`}
            aria-label="Add to Cart"
          >
            <ShoppingCart className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

    </div>
  );
}
