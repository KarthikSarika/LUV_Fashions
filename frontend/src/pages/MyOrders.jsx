import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Calendar, ShieldAlert, ChevronRight, MapPin, Clipboard, ArrowRight, Eye, Tag } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';

export default function MyOrders() {
  const toast = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerOrders();
  }, []);

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/orders');
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching customer orders:', err);
      toast.error('Failed to retrieve order history.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    toast.success('UTR copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <h1 className="text-3xl font-extrabold text-left font-display">My Orders</h1>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="text-left">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">My Orders</h1>
        <p className="text-xs text-slate-500">History of your orders and live shipping updates</p>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6 text-left">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm overflow-hidden flex flex-col"
            >
              {/* Order Header Summary */}
              <div className="p-4 bg-slate-50 dark:bg-dark-950/20 border-b border-slate-200/40 dark:border-dark-850 flex flex-wrap gap-4 items-center justify-between text-xs">
                <div className="flex gap-6">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Date Placed</span>
                    <p className="font-semibold text-slate-700 dark:text-dark-300">{new Date(ord.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
                    <p className="font-extrabold text-slate-900 dark:text-dark-100">₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 font-bold uppercase tracking-wider">Order ID</span>
                    <p className="font-bold text-slate-700 dark:text-dark-300">{ord.order_id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    ord.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700 dark:bg-amber-955/20 dark:text-amber-450' :
                    ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-955/20 dark:text-rose-455' :
                    ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-955/20 dark:text-emerald-450' :
                    'bg-blue-100 text-blue-700 dark:bg-blue-955/20 dark:text-blue-450'
                  }`}>
                    {ord.status}
                  </span>
                  
                  {/* Link to visual tracker page */}
                  <Link
                    to={`/track-order?orderId=${ord.order_id}&phone=${ord.phone}`}
                    className="inline-flex items-center gap-0.5 font-bold text-primary-500 hover:text-primary-600 transition-colors"
                  >
                    Track <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Items Purchased List */}
                <div className="md:col-span-2 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Items Purchased</span>
                  <div className="divide-y divide-slate-100 dark:divide-dark-850">
                    {ord.order_items?.map((item) => {
                      const itemImg = item.products?.images && item.products.images.length > 0
                        ? item.products.images[0]
                        : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100';

                      return (
                        <div key={item.id} className="py-2.5 flex items-center gap-3">
                          <div className="w-10 h-10 border rounded-lg overflow-hidden flex-shrink-0 bg-slate-50">
                            <img src={itemImg} alt="Thumbnail" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-dark-100 truncate">{item.products?.name || 'Product'}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">Qty: {item.quantity} • Unit Price: ₹{item.price}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping & Payment summary */}
                <div className="space-y-4 text-xs p-3 rounded-xl border border-slate-100 dark:border-dark-850 bg-slate-50/40 dark:bg-dark-950/10">
                  {/* Shipping Address */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-0.5"><MapPin className="w-3 h-3 text-primary-500" /> Shipped To</span>
                    <p className="font-bold text-slate-700 dark:text-dark-300">{ord.customer_name}</p>
                    <p className="text-slate-500 line-clamp-2">{ord.address}, {ord.city}</p>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-1 pt-2 border-t border-slate-200/50 dark:border-dark-850">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-0.5"><Tag className="w-3 h-3 text-primary-500" /> UPI Verification</span>
                    <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
                      <span>UTR: {ord.utr_number}</span>
                      <button type="button" onClick={() => handleCopyUtr(ord.utr_number)} className="p-0.5 text-slate-400 hover:text-slate-600">
                        <Clipboard className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800 max-w-xl mx-auto space-y-4">
          <Package className="w-12 h-12 text-slate-350" />
          <div className="space-y-1">
            <h3 className="font-bold text-lg font-display text-slate-800 dark:text-dark-200">No Orders Logged</h3>
            <p className="text-sm text-slate-500">You have not submitted any orders using this account yet.</p>
          </div>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 flex items-center gap-1.5"
          >
            Start Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
