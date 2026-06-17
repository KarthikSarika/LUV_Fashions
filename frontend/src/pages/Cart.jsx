import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const toast = useToast();

  const handleRemove = (id, name) => {
    removeFromCart(id);
    toast.success(`Removed "${name}" from cart.`);
  };

  const handleQuantityChange = (id, currentQty, stock, increment) => {
    const nextQty = increment ? currentQty + 1 : currentQty - 1;
    if (increment && nextQty > stock) {
      toast.warning(`Cannot exceed available stock limit (${stock} items).`);
      return;
    }
    updateQuantity(id, nextQty);
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-dark-900 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-dark-100">Your Cart is Empty</h2>
          <p className="text-sm text-slate-500 dark:text-dark-400">Looks like you haven't added anything to your cart yet.</p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white transition-colors shadow-lg shadow-primary-500/15"
        >
          <ArrowLeft className="w-4.5 h-4.5 mr-2" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">Shopping Cart</h1>
        <p className="text-xs text-slate-500">Review your products before checking out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4 text-left">
          
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 border border-slate-200/50 dark:border-dark-850/60 rounded-2xl bg-white dark:bg-dark-900"
            >
              
              {/* Product Thumbnail & Details */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-150 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 flex-shrink-0">
                  <img
                    src={item.images && item.images.length > 0 ? item.images[0] : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150'}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-0.5 max-w-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</span>
                  <Link to={`/products/${item.id}`}>
                    <h3 className="text-sm font-semibold text-slate-850 dark:text-dark-100 hover:text-primary-500 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-xs font-bold text-slate-800 dark:text-dark-100">
                    ₹{item.finalPrice.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Quantity selectors & Subtotal */}
              <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-0 pt-3 sm:pt-0">
                
                {/* Quantity Adjusters */}
                <div className="flex items-center border border-slate-250 dark:border-dark-800 rounded-lg overflow-hidden bg-slate-50 dark:bg-dark-950">
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, false)}
                    className="px-2.5 py-1 text-slate-650 hover:bg-slate-200 dark:hover:bg-dark-800 font-bold transition-colors"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold border-x border-slate-250 dark:border-dark-800">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.id, item.quantity, item.stock, true)}
                    className="px-2.5 py-1 text-slate-650 hover:bg-slate-200 dark:hover:bg-dark-800 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[70px]">
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-50">
                    ₹{(item.finalPrice * item.quantity).toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleRemove(item.id, item.name)}
                  className="text-slate-400 hover:text-rose-500 dark:text-dark-550 dark:hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>

            </div>
          ))}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <Link to="/products" className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-primary-500 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Continue Shopping
            </Link>
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared.'); }}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 hover:underline"
            >
              Clear Shopping Cart
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6 text-left">
          
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-850 dark:text-dark-100 font-display">Order Summary</h3>
            
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-500">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-800 dark:text-dark-100">₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping Fee</span>
                <span className="font-bold text-emerald-500 uppercase text-xs">Free</span>
              </div>
              <div className="border-t border-slate-100 dark:border-dark-850 pt-3 flex justify-between font-bold text-base text-slate-900 dark:text-dark-50">
                <span>Total Amount</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              to="/checkout"
              className="w-full py-3.5 px-4 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-lg shadow-primary-500/15 flex items-center justify-center gap-1.5"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Notice info */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 text-slate-500 dark:bg-dark-900/40 dark:border-dark-800 text-[11px] leading-relaxed">
            Note: We currently verify transactions manually using a UPI QR payment code. You will see payment details and submit your reference UTR on the next page.
          </div>

        </div>

      </div>

    </div>
  );
}
