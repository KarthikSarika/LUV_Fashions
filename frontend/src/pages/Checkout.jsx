import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Upload, QrCode, Clipboard, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../components/Toast.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../utils/api.js';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    utr_number: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        customer_name: user.profile?.full_name || '',
        phone: user.profile?.phone || '',
        email: user.email || '',
        address: user.profile?.address || '',
        city: user.profile?.city || '',
        state: user.profile?.state || '',
        pincode: user.profile?.pincode || '',
      }));
    }
  }, [user]);

  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);

  const upiId = 'luvstore@upi';

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, or WEBP).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    toast.success('UPI ID copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!screenshotFile) {
      toast.error('Please upload a payment screenshot proof.');
      return;
    }

    if (!formData.utr_number.trim()) {
      toast.error('Please enter the 12-digit UTR/Reference number.');
      return;
    }

    try {
      setLoading(true);

      const orderData = new FormData();
      orderData.append('customer_name', formData.customer_name);
      orderData.append('phone', formData.phone);
      orderData.append('email', formData.email);
      orderData.append('address', formData.address);
      orderData.append('city', formData.city);
      orderData.append('state', formData.state);
      orderData.append('pincode', formData.pincode);
      orderData.append('total_amount', getCartTotal());
      orderData.append('utr_number', formData.utr_number.trim());
      orderData.append('payment_screenshot', screenshotFile);
      
      // Send cart items as stringified JSON array
      const itemsList = cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.finalPrice,
        quantity: item.quantity
      }));
      orderData.append('cart_items', JSON.stringify(itemsList));

      const response = await api.post('/orders', orderData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Order placed successfully! Pending verification.');
      
      // Clear local storage and state cart
      clearCart();
      
      // Redirect to tracking page, prefilling the order details
      navigate(`/track-order?orderId=${response.data.order_id}&phone=${formData.phone}`);
    } catch (err) {
      console.error('Order submission error:', err);
      toast.error(err.response?.data?.error || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="text-left flex items-center gap-3">
        <button onClick={() => navigate('/cart')} className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors">
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">Checkout</h1>
          <p className="text-xs text-slate-500">Provide details and verify payment to place your order</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Form Panel */}
        <div className="lg:col-span-2 space-y-6 text-left">
          
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 font-display">Shipping Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="customer_name" className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  id="customer_name"
                  type="text"
                  name="customer_name"
                  required
                  placeholder="John Doe"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label htmlFor="address" className="text-xs font-bold text-slate-500 uppercase">Delivery Address</label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  placeholder="House number, Street, Locality"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="city" className="text-xs font-bold text-slate-500 uppercase">City</label>
                <input
                  id="city"
                  type="text"
                  name="city"
                  required
                  placeholder="Hyderabad"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="state" className="text-xs font-bold text-slate-500 uppercase">State</label>
                <input
                  id="state"
                  type="text"
                  name="state"
                  required
                  placeholder="Telangana"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="pincode" className="text-xs font-bold text-slate-500 uppercase">Pincode</label>
                <input
                  id="pincode"
                  type="text"
                  name="pincode"
                  required
                  placeholder="500001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* UPI Pay Guide */}
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 space-y-6 shadow-sm">
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 font-display">UPI Payment Verification</h3>
              <p className="text-xs text-slate-500">Scan QR Code or pay directly to the UPI ID, then submit transaction details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              
              {/* QR Render mockup */}
              <div className="flex flex-col items-center bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-2xl p-5 gap-3.5 justify-center">
                <span className="text-xs font-bold text-slate-650 flex items-center gap-1.5"><QrCode className="w-4 h-4 text-primary-500" /> Store UPI QR Code</span>
                
                {/* SVG mock QR */}
                <div className="bg-white p-3 rounded-xl border border-slate-100 dark:border-dark-800 relative group">
                  <svg className="w-40 h-40" viewBox="0 0 100 100">
                    <rect width="100" height="100" fill="white" />
                    {/* Anchor squares */}
                    <rect x="5" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="9" width="17" height="17" fill="white" />
                    <rect x="13" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="70" y="5" width="25" height="25" fill="#0f172a" />
                    <rect x="74" y="9" width="17" height="17" fill="white" />
                    <rect x="78" y="13" width="9" height="9" fill="#0f172a" />

                    <rect x="5" y="70" width="25" height="25" fill="#0f172a" />
                    <rect x="9" y="74" width="17" height="17" fill="white" />
                    <rect x="13" y="78" width="9" height="9" fill="#0f172a" />

                    {/* Random patterns */}
                    <rect x="35" y="5" width="8" height="8" fill="#e11d48" />
                    <rect x="48" y="12" width="12" height="6" fill="#0f172a" />
                    <rect x="35" y="22" width="15" height="8" fill="#0f172a" />

                    <rect x="5" y="35" width="15" height="8" fill="#e11d48" />
                    <rect x="18" y="48" width="12" height="12" fill="#0f172a" />
                    <rect x="5" y="60" width="8" height="6" fill="#0f172a" />

                    <rect x="40" y="40" width="20" height="20" fill="#0f172a" />
                    <rect x="45" y="45" width="10" height="10" fill="white" />

                    <rect x="70" y="35" width="15" height="15" fill="#0f172a" />
                    <rect x="85" y="42" width="10" height="18" fill="#e11d48" />
                    <rect x="70" y="60" width="8" height="8" fill="#0f172a" />

                    <rect x="35" y="70" width="12" height="12" fill="#0f172a" />
                    <rect x="55" y="78" width="25" height="17" fill="#0f172a" />
                    <rect x="35" y="88" width="18" height="7" fill="#e11d48" />
                  </svg>
                </div>

                <span className="text-[10px] text-slate-400 font-medium">Scan using GPay, PhonePe, Paytm, or any UPI app</span>
              </div>

              {/* UPI ID copy details */}
              <div className="space-y-4 text-center sm:text-left">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">UPI ID</span>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-800 dark:text-dark-100">{upiId}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1.5 rounded-lg border hover:bg-slate-100 dark:hover:bg-dark-800 transition-colors"
                      aria-label="Copy UPI ID"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-bold uppercase">Payable Amount</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-dark-50">₹{getCartTotal().toLocaleString('en-IN')}</p>
                </div>

                <div className="text-xs space-y-1.5 text-slate-500 dark:text-dark-400 max-w-sm">
                  <p className="font-semibold text-slate-700 dark:text-dark-300">How it works:</p>
                  <p>1. Open your choice of UPI App and pay the total amount.</p>
                  <p>2. Take a screenshot of the payment confirmation receipt.</p>
                  <p>3. Enter the UTR / Ref Number below and upload the screenshot proof.</p>
                </div>
              </div>
            </div>

            {/* Proof Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4 border-t border-slate-100 dark:border-dark-850">
              
              {/* UTR Input */}
              <div className="space-y-1.5 text-left">
                <label htmlFor="utr_number" className="text-xs font-bold text-slate-500 uppercase">UTR / UPI Transaction ID</label>
                <input
                  id="utr_number"
                  type="text"
                  name="utr_number"
                  required
                  placeholder="12-digit transaction number"
                  value={formData.utr_number}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
                <span className="text-[10px] text-slate-400">e.g. 214589632514</span>
              </div>

              {/* Upload Screenshot File */}
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-bold text-slate-500 uppercase">Upload Payment Screenshot</span>
                <label className="flex items-center justify-center border-2 border-dashed border-slate-250 dark:border-dark-800 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-dark-950/40 cursor-pointer transition-colors relative h-12">
                  <input
                    id="screenshot-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Upload className="w-4 h-4 text-primary-500" />
                    <span>{screenshotFile ? screenshotFile.name : 'Select screenshot image'}</span>
                  </div>
                </label>
              </div>

              {/* Screenshot Preview */}
              {screenshotPreview && (
                <div className="sm:col-span-2 text-center">
                  <span className="text-xs font-bold text-slate-400 block mb-2 uppercase">Screenshot Preview</span>
                  <div className="inline-block p-1 border rounded-2xl bg-slate-50 max-h-40 overflow-hidden">
                    <img src={screenshotPreview} alt="Screenshot Preview" className="max-h-36 object-contain rounded-xl" />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Order Breakdown Summary Card */}
        <div className="space-y-6 text-left animate-fade-in">
          
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 space-y-4 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 font-display">Items in Order</h3>
            
            <div className="divide-y divide-slate-100 dark:divide-dark-850 max-h-60 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs font-medium gap-3">
                  <span className="text-slate-800 dark:text-dark-200 line-clamp-1">{item.name} <span className="text-slate-400">x{item.quantity}</span></span>
                  <span className="font-bold text-slate-900 dark:text-dark-50">₹{(item.finalPrice * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-dark-850 pt-3 space-y-2 text-sm font-semibold">
              <div className="flex justify-between text-slate-500 text-xs">
                <span>Shipping Fees</span>
                <span className="text-emerald-500 uppercase">Free</span>
              </div>
              <div className="flex justify-between text-slate-900 dark:text-dark-50 text-base font-extrabold">
                <span>Total Payable</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              id="submit-order"
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-primary-500 hover:bg-primary-600 shadow-primary-500/20 hover:scale-[1.01]'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              {loading ? 'Submitting Order...' : 'Submit Order'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border text-slate-500 dark:bg-dark-900/40 dark:border-dark-800 text-[10px] leading-relaxed">
            By clicking Submit Order, you acknowledge that you have made a transfer of the exact Total Payable to the listed merchant UPI address. Orders without valid transaction screenshots and matching UTR will be rejected.
          </div>

        </div>

      </form>
    </div>
  );
}
