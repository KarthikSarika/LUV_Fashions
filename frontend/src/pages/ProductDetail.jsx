import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ChevronRight, Tag, ShieldCheck, Truck, RefreshCw, AlertTriangle, ArrowLeft } from 'lucide-react';
import api from '../utils/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { ProductDetailSkeleton } from '../components/Skeleton.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/${id}`);
        setProduct(response.data);
        setActiveImageIdx(0);
        setQuantity(1);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold font-display">Product Not Found</h2>
        <p className="text-sm text-slate-500">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/products" className="inline-flex items-center gap-1 text-sm font-bold text-primary-500">
          <ArrowLeft className="w-4 h-4" /> Back to Collections
        </Link>
      </div>
    );
  }

  const { name, description, category, price, discount_price, stock, images } = product;

  // Visual image list fallback
  const imgList = images && images.length > 0 
    ? images 
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800'];

  const hasDiscount = discount_price !== null && discount_price !== undefined;
  const finalPrice = hasDiscount ? discount_price : price;
  const discountPercent = hasDiscount ? Math.round(((price - discount_price) / price) * 100) : 0;

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleIncrement = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleAddToCartSubmit = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    toast.success(`Added ${quantity} x "${name}" to your shopping cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-dark-400 text-left">
        <Link to="/" className="hover:text-primary-500 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-500 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?category=${category}`} className="hover:text-primary-500 transition-colors">{category}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 dark:text-dark-200 truncate max-w-xs">{name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
        
        {/* Gallery Panel */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden border border-slate-200/50 dark:border-dark-850/60 bg-white dark:bg-dark-900 shadow-sm relative">
            <img
              src={imgList[activeImageIdx]}
              alt={name}
              className="w-full h-full object-cover object-center"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500 text-white shadow-md">
                <Tag className="w-3.5 h-3.5" /> {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {imgList.length > 1 && (
            <div className="grid grid-cols-5 gap-3">
              {imgList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white dark:bg-dark-900 transition-all ${
                    activeImageIdx === idx 
                      ? 'border-primary-500 scale-[1.03] shadow-md' 
                      : 'border-slate-200/50 hover:border-slate-300 dark:border-dark-800 dark:hover:border-dark-700'
                  }`}
                >
                  <img src={img} alt={`${name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Specs Panel */}
        <div className="flex flex-col justify-between py-2 space-y-6">
          <div className="space-y-4">
            
            {/* Category and Stock Badge */}
            <div className="flex items-center justify-between gap-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-dark-450 uppercase tracking-wider">
                {category}
              </span>
              {isOutOfStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-white">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
                  Only {stock} items left!
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-450">
                  In Stock ({stock} available)
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">
              {name}
            </h1>

            {/* Prices */}
            <div className="flex items-end gap-3.5">
              {hasDiscount ? (
                <>
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-dark-50">
                    ₹{discount_price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-base text-slate-400 line-through mb-0.5">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-rose-500 mb-0.5">
                    Save ₹{(price - discount_price).toLocaleString('en-IN')}
                  </span>
                </>
              ) : (
                <span className="text-2xl font-extrabold text-slate-900 dark:text-dark-50">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-dark-850">
              <h3 className="font-bold text-sm text-slate-800 dark:text-dark-200 uppercase tracking-wider font-display">Product Description</h3>
              <p className="text-sm text-slate-600 dark:text-dark-400 leading-relaxed whitespace-pre-line">
                {description || 'No description available for this product.'}
              </p>
            </div>
          </div>

          <div className="space-y-6 pt-5 border-t border-slate-100 dark:border-dark-850">
            {/* Quantity Adjusters */}
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-slate-700 dark:text-dark-350">Select Quantity:</span>
                <div className="flex items-center border border-slate-200 dark:border-dark-800 rounded-xl overflow-hidden bg-white dark:bg-dark-900">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-dark-950 font-bold transition-colors disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-5 py-1.5 text-sm font-bold border-x border-slate-200 dark:border-dark-800">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= stock}
                    className="px-3.5 py-1.5 hover:bg-slate-50 dark:hover:bg-dark-950 font-bold transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart CTA */}
            <button
              onClick={handleAddToCartSubmit}
              disabled={isOutOfStock}
              className={`w-full py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                isOutOfStock
                  ? 'bg-slate-100 border border-slate-200 text-slate-400 dark:bg-dark-900 dark:border-dark-800 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600 text-white hover:scale-[1.01] shadow-lg shadow-primary-500/20'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isOutOfStock ? 'Out of Stock' : `Add to Cart • ₹${(finalPrice * quantity).toLocaleString('en-IN')}`}
            </button>

            {/* Logistics details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-slate-200/50 dark:border-dark-800 p-4 rounded-xl bg-slate-50 dark:bg-dark-900/40 text-xs">
              <div className="flex flex-col gap-1 items-center text-center">
                <Truck className="w-4.5 h-4.5 text-primary-500" />
                <span className="font-bold text-slate-700 dark:text-dark-300">Fast Shipping</span>
                <span className="text-[10px] text-slate-400">Delivered within 3-5 days</span>
              </div>
              <div className="flex flex-col gap-1 items-center text-center">
                <ShieldCheck className="w-4.5 h-4.5 text-primary-500" />
                <span className="font-bold text-slate-700 dark:text-dark-300">Safe Payments</span>
                <span className="text-[10px] text-slate-400">Screenshot check validation</span>
              </div>
              <div className="flex flex-col gap-1 items-center text-center">
                <RefreshCw className="w-4.5 h-4.5 text-primary-500" />
                <span className="font-bold text-slate-700 dark:text-dark-300">Easy Returns</span>
                <span className="text-[10px] text-slate-400">7-day product return policy</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
