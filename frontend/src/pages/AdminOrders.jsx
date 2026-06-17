import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Eye, Filter, Edit3, X, User, MapPin, Clipboard, CheckCircle, Image, ExternalLink, Calendar } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';

export default function AdminOrders() {
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [screenshotZoom, setScreenshotZoom] = useState(false);

  useEffect(() => {
    // Check if query searches for a specific order (e.g. from Dashboard click)
    const urlSearch = searchParams.get('search');
    const urlStatus = searchParams.get('status');

    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
    if (urlStatus) {
      setStatusFilter(urlStatus);
    }

    fetchOrders(urlStatus || 'All');
  }, [searchParams]);

  const fetchOrders = async (statusVal = 'All') => {
    try {
      setLoading(true);
      const params = {};
      if (statusVal !== 'All') {
        params.status = statusVal;
      }
      const response = await api.get('/orders', { params });
      setOrders(response.data || []);
    } catch (err) {
      console.error('Error fetching admin orders list:', err);
      toast.error('Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (statusVal) => {
    setStatusFilter(statusVal);
    fetchOrders(statusVal);
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsModalOpen(true);
    } catch (err) {
      toast.error('Failed to retrieve order details.');
    }
  };

  const handleStatusTransition = async (orderUuid, newStatus) => {
    try {
      setUpdatingStatus(true);
      const response = await api.put(`/orders/${orderUuid}/status`, { status: newStatus });
      toast.success(response.data.message || `Order status updated to ${newStatus}`);
      
      // Update local state details if modal is open
      if (selectedOrder && selectedOrder.id === orderUuid) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }

      // Refresh list
      fetchOrders(statusFilter);
    } catch (err) {
      console.error('Status transition failure:', err);
      toast.error(err.response?.data?.error || 'Failed to update order status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyUtr = (utr) => {
    navigator.clipboard.writeText(utr);
    toast.success('UTR number copied to clipboard.');
  };

  const adminTabs = [
    { name: 'Dashboard', path: '/admin/dashboard', active: false },
    { name: 'Products', path: '/admin/products', active: false },
    { name: 'Orders', path: '/admin/orders', active: true },
    { name: 'Inventory', path: '/admin/inventory', active: false },
  ];

  const filteredOrders = orders.filter((o) =>
    o.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.phone.includes(searchQuery) ||
    o.utr_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusDropdown = ['Pending Verification', 'Payment Verified', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-dark-800 pb-2">
        <h1 className="text-3xl font-extrabold text-left font-display text-slate-800 dark:text-dark-50">Manage Orders</h1>
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-transparent">
          {adminTabs.map((tab, idx) => (
            <Link
              key={idx}
              to={tab.path}
              className={`px-4 py-2 text-sm font-bold border-b-2 transition-all ${
                tab.active
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200 dark:hover:text-dark-300'
              }`}
            >
              {tab.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Toolbar Options */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            id="admin-order-search"
            type="text"
            placeholder="Search Order ID, Client, UTR..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-sm focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-450 hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm font-semibold text-slate-750 dark:text-dark-300 focus:outline-none w-full sm:w-auto"
          >
            <option value="All">Filter Status: All</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="Payment Verified">Payment Verified</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredOrders.length > 0 ? (
        <div className="border border-slate-200/60 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-dark-850 text-sm">
              <thead>
                <tr className="text-slate-450 text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-dark-950/20">
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Grand Total</th>
                  <th className="py-4 px-4">UTR Number</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 dark:divide-dark-850 text-slate-700 dark:text-dark-300">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-dark-950/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-dark-100">{o.order_id}</td>
                    <td className="py-3.5 px-4 font-medium">{o.customer_name}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-800 dark:text-dark-50">₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 font-medium font-mono text-xs">{o.utr_number}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        o.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450' :
                        o.status === 'Cancelled' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450' :
                        o.status === 'Delivered' ? 'bg-emerald-105 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-950/20 dark:text-blue-450'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleViewDetails(o.id)}
                        className="flex items-center gap-1 text-xs font-bold text-primary-500 hover:text-primary-600 transition-colors ml-auto py-1 px-2.5 border rounded-lg hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-800"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800 space-y-4">
          <Calendar className="w-12 h-12 text-slate-350" />
          <h3 className="font-bold text-lg font-display text-slate-800 dark:text-dark-200">No orders logged</h3>
          <p className="text-sm text-slate-500">Wait for client submissions or adjust status filters.</p>
        </div>
      )}

      {/* Details Inspector Overlay Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white dark:bg-dark-900 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-fade-in text-left">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h2 className="font-extrabold text-xl font-display text-slate-850 dark:text-dark-50">Order Inspect</h2>
                <p className="text-xs text-slate-400 font-medium">Order ID: {selectedOrder.order_id} • placed {new Date(selectedOrder.created_at).toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Customer details & address */}
              <div className="space-y-4">
                
                {/* Contact Card */}
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-display"><User className="w-4 h-4 text-primary-500" /> Customer Information</h4>
                  <div className="text-xs space-y-1 text-slate-700 dark:text-dark-300">
                    <p className="font-bold text-slate-900 dark:text-dark-50">{selectedOrder.customer_name}</p>
                    <p>Phone: {selectedOrder.phone}</p>
                    <p>Email: {selectedOrder.email}</p>
                  </div>
                </div>

                {/* Shipping Card */}
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-display"><MapPin className="w-4 h-4 text-primary-500" /> Shipping Destination</h4>
                  <p className="text-xs text-slate-700 dark:text-dark-300 leading-relaxed">
                    {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - <span className="font-bold">{selectedOrder.pincode}</span>
                  </p>
                </div>

                {/* Order Status Controller dropdown */}
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display">Manage Order Status</h4>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedOrder.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusTransition(selectedOrder.id, e.target.value)}
                      className="px-3 py-2 text-xs font-bold border rounded-lg bg-white dark:bg-dark-900 border-slate-250 dark:border-dark-850 focus:outline-none w-full disabled:opacity-40"
                    >
                      {statusDropdown.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {updatingStatus && (
                      <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block leading-tight">
                    * Transiting to "Payment Verified" decreases item stock automatically. Transiting to "Cancelled" from verified states restores stock values.
                  </span>
                </div>

              </div>

              {/* Items Breakdown list & UPI receipt proof */}
              <div className="space-y-4">
                
                {/* Items Purchased List */}
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider font-display">Purchased Items</h4>
                  <div className="divide-y divide-slate-100 dark:divide-dark-850 max-h-36 overflow-y-auto pr-1">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="py-2 flex justify-between items-center text-xs text-slate-650 dark:text-dark-300">
                        <span className="font-semibold">{item.products?.name || 'Product'} <span className="text-slate-400 font-bold">x{item.quantity}</span></span>
                        <span className="font-bold text-slate-900 dark:text-dark-50">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2.5 flex justify-between text-xs font-bold text-slate-850 dark:text-dark-100">
                    <span>Grand Total</span>
                    <span>₹{parseFloat(selectedOrder.total_amount).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* UTR Verification and Image check */}
                <div className="p-4 rounded-xl border border-slate-200/60 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-950/20 space-y-3">
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-display"><CheckCircle className="w-4 h-4 text-primary-500" /> UPI Transfer Proof</h4>
                  
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>UTR: <span className="font-bold text-slate-800 dark:text-dark-50 select-all">{selectedOrder.utr_number}</span></span>
                    <button
                      onClick={() => handleCopyUtr(selectedOrder.utr_number)}
                      className="p-1 border hover:bg-slate-100 dark:hover:bg-dark-900 rounded"
                      title="Copy UTR"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  </div>

                  {/* Screenshot Thumbnail */}
                  <div className="relative border rounded-lg bg-white overflow-hidden aspect-video flex items-center justify-center cursor-pointer group" onClick={() => setScreenshotZoom(true)}>
                    <img src={selectedOrder.payment_screenshot} alt="Payment Receipt" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Eye className="w-4 h-4" /> Zoom Image
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* Screenshot full zoom viewer */}
      {screenshotZoom && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-4">
          <button onClick={() => setScreenshotZoom(false)} className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-xs font-semibold">
            <X className="w-5 h-5" /> Close
          </button>
          <img src={selectedOrder.payment_screenshot} alt="Zoom Receipt" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          <a
            href={selectedOrder.payment_screenshot}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-400 hover:text-primary-300"
          >
            Open in new tab <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      )}

    </div>
  );
}
