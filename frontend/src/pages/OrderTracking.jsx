import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, CheckCircle, Package, Truck, Smile, XCircle, FileText, MapPin, AlertCircle } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [orderIdInput, setOrderIdInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    // Check if Order ID and Phone are passed as URL queries (e.g. from checkout redirect)
    const urlOrderId = searchParams.get('orderId');
    const urlPhone = searchParams.get('phone');

    if (urlOrderId && urlPhone) {
      setOrderIdInput(urlOrderId);
      setPhoneInput(urlPhone);
      triggerTracking(urlOrderId, urlPhone);
    }
  }, [searchParams]);

  const triggerTracking = async (orderId, phone) => {
    try {
      setLoading(true);
      setSearched(true);
      
      const response = await api.post('/track-order', {
        order_id: orderId,
        phone: phone
      });

      setOrder(response.data);
    } catch (err) {
      console.error('Tracking query error:', err);
      setOrder(null);
      toast.error(err.response?.data?.error || 'No matching order found with the provided details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim() || !phoneInput.trim()) {
      toast.error('Please fill in both Order ID and Phone Number.');
      return;
    }
    triggerTracking(orderIdInput.trim(), phoneInput.trim());
  };

  // Status mapping
  const statuses = [
    { label: 'Pending Verification', icon: FileText, desc: 'Payment proof is being reviewed by our finance team' },
    { label: 'Payment Verified', icon: CheckCircle, desc: 'Your payment was successfully matched and verified' },
    { label: 'Processing', icon: Package, desc: 'Your items are being carefully packed and prepped' },
    { label: 'Shipped', icon: Truck, desc: 'Your parcel is dispatched and on its way to your city' },
    { label: 'Delivered', icon: Smile, desc: 'Package successfully delivered. Enjoy your purchase!' }
  ];

  const getStatusIndex = (currentStatus) => {
    return statuses.findIndex(s => s.label === currentStatus);
  };

  const currentStatusIdx = order ? getStatusIndex(order.status) : -1;
  const isCancelled = order ? order.status === 'Cancelled' : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">Track Your Order</h1>
        <p className="text-sm text-slate-500">Enter your order references to see transaction statuses and shipping progress.</p>
      </div>

      {/* Query Search Box */}
      <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm max-w-xl mx-auto">
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1 text-left">
            <label htmlFor="order_id_track" className="text-xs font-bold text-slate-500 uppercase">Order ID</label>
            <input
              id="order_id_track"
              type="text"
              placeholder="e.g. LUV-123456"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1 text-left">
            <label htmlFor="phone_track" className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
            <input
              id="phone_track"
              type="tel"
              placeholder="e.g. 9876543210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
            />
          </div>

          <button
            id="track-btn"
            type="submit"
            disabled={loading}
            className="sm:col-span-2 py-3 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-md shadow-primary-500/10 flex items-center justify-center gap-1.5"
          >
            <Search className="w-4.5 h-4.5" />
            {loading ? 'Searching Record...' : 'Track Status'}
          </button>
        </form>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="py-20 flex justify-center items-center gap-2">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-500">Retrieving tracking records...</span>
        </div>
      )}

      {/* Tracking details */}
      {searched && !loading && order && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left animate-slide-up">
          
          {/* Progress Timeline Tracker */}
          <div className="md:col-span-2 p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b pb-3.5">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 font-display">Tracking Timeline</h3>
                <p className="text-[10px] text-slate-400">Order ID: {order.order_id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                isCancelled ? 'bg-rose-500/10 text-rose-500' :
                order.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' :
                'bg-primary-500/10 text-primary-500'
              }`}>
                {order.status}
              </span>
            </div>

            {/* Timeline structure */}
            {isCancelled ? (
              <div className="flex items-start gap-4 p-4 rounded-xl border border-rose-500/25 bg-rose-50/30 dark:bg-rose-950/10">
                <XCircle className="w-8 h-8 text-rose-500 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-rose-700 dark:text-rose-450 font-display">Order Cancelled</h4>
                  <p className="text-xs text-slate-500">This order has been cancelled. If payment was made, refunds will be issued to your source account. Contact support for details.</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-8 space-y-8 border-l border-slate-200 dark:border-dark-800 ml-4 py-2">
                {statuses.map((step, idx) => {
                  const Icon = step.icon;
                  const isCompleted = idx <= currentStatusIdx;
                  const isCurrent = idx === currentStatusIdx;

                  return (
                    <div key={idx} className="relative text-left">
                      {/* Timeline circle dot */}
                      <span className={`absolute -left-12 top-0 p-1.5 rounded-full border transition-all ${
                        isCompleted 
                          ? 'bg-primary-500 border-primary-500 text-white shadow-md shadow-primary-500/25' 
                          : 'bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-400'
                      }`}>
                        <Icon className="w-4.5 h-4.5" />
                      </span>

                      {/* Content */}
                      <div className="space-y-0.5">
                        <h4 className={`text-sm font-bold font-display ${
                          isCurrent ? 'text-primary-500' : 
                          isCompleted ? 'text-slate-800 dark:text-dark-100' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-dark-400 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Customer & Items Summary column */}
          <div className="space-y-6">
            
            {/* Delivery address info */}
            <div className="p-5 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-200 flex items-center gap-1.5 font-display"><MapPin className="w-4 h-4 text-primary-500" /> Delivery Address</h4>
              <div className="text-xs space-y-1.5 text-slate-650 dark:text-dark-400 leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-dark-100">{order.customer_name}</p>
                <p>{order.phone}</p>
                <p>{order.email}</p>
                <p className="pt-1.5 border-t border-slate-100 dark:border-dark-850">
                  {order.address}, {order.city}, {order.state} - {order.pincode}
                </p>
              </div>
            </div>

            {/* Items invoice summary */}
            <div className="p-5 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm space-y-3.5">
              <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-200 font-display">Invoice Summary</h4>
              
              <div className="divide-y divide-slate-100 dark:divide-dark-850 max-h-48 overflow-y-auto pr-1">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center text-xs text-slate-600 dark:text-dark-300">
                    <span className="line-clamp-1">{item.products?.name || 'Product'} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                    <span className="font-bold text-slate-850 dark:text-dark-100">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 flex justify-between text-sm font-extrabold text-slate-900 dark:text-dark-50">
                <span>Grand Total</span>
                <span>₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</span>
              </div>

              {/* UTR record */}
              <div className="pt-2.5 border-t border-slate-100 dark:border-dark-850 text-[10px] text-slate-400 space-y-0.5">
                <p>UTR Number: <span className="font-bold text-slate-600 dark:text-dark-300">{order.utr_number}</span></p>
                <p>Placed: <span className="font-bold text-slate-600 dark:text-dark-300">{new Date(order.created_at).toLocaleString('en-IN')}</span></p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Empty / Not Searched State */}
      {searched && !loading && !order && (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-350 dark:border-dark-800 max-w-xl mx-auto space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <h3 className="font-bold text-base text-slate-800 dark:text-dark-200 font-display">Order Not Found</h3>
          <p className="text-xs text-slate-500 text-center max-w-xs leading-relaxed">Please double check your Order ID (format: LUV-XXXXXX) and the Phone Number entered.</p>
        </div>
      )}

    </div>
  );
}
