import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, AlertCircle, DollarSign, Calendar, ArrowRight, User } from 'lucide-react';
import api from '../utils/api.js';
import { DashboardSkeleton } from '../components/Skeleton.jsx';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/orders/summary');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const adminTabs = [
    { name: 'Dashboard', path: '/admin/dashboard', active: true },
    { name: 'Products', path: '/admin/products', active: false },
    { name: 'Orders', path: '/admin/orders', active: false },
    { name: 'Inventory', path: '/admin/inventory', active: false },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-left font-display">Console</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-dark-800 pb-2">
        <h1 className="text-3xl font-extrabold text-left font-display text-slate-800 dark:text-dark-50">Console Dashboard</h1>
        
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

      {/* Metrics Cards Grid */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          
          {/* Card 1: Revenue */}
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <p className="text-2xl font-black text-slate-900 dark:text-dark-50">₹{stats.totalRevenue.toLocaleString('en-IN')}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Orders */}
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <p className="text-2xl font-black text-slate-900 dark:text-dark-50">{stats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Pending verification */}
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
              <p className="text-2xl font-black text-slate-900 dark:text-dark-50">{stats.pendingOrders}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Products */}
          <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
              <p className="text-2xl font-black text-slate-900 dark:text-dark-50">{stats.totalProducts}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-500">
              <Package className="w-6 h-6" />
            </div>
          </div>

        </div>
      )}

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-dark-850">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 font-display">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs font-bold text-primary-500 hover:text-primary-600 flex items-center gap-0.5">
              All Orders <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats && stats.recentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 dark:divide-dark-850 text-sm">
                <thead>
                  <tr className="text-slate-400 text-xs font-bold text-left uppercase">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Total Amount</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-850 text-slate-650 dark:text-dark-300">
                  {stats.recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-dark-950/30 transition-colors">
                      <td className="py-3 px-2 font-bold text-primary-500">
                        <Link to={`/admin/orders?search=${ord.order_id}`}>{ord.order_id}</Link>
                      </td>
                      <td className="py-3 px-2 font-medium">{ord.customer_name}</td>
                      <td className="py-3 px-2 font-bold text-slate-800 dark:text-dark-100">₹{parseFloat(ord.total_amount).toLocaleString('en-IN')}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.status === 'Pending Verification' ? 'bg-amber-100 text-amber-700' :
                          ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">No orders received yet.</div>
          )}
        </div>

        {/* Shortcuts / Quick Actions Card */}
        <div className="p-6 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-800 dark:text-dark-100 border-b pb-2 border-slate-100 dark:border-dark-850 font-display">Quick Actions</h3>
          
          <div className="flex flex-col gap-3">
            <Link
              to="/admin/products?action=add"
              className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-950 text-sm font-semibold hover:border-slate-350 dark:hover:border-dark-700 transition-colors"
            >
              <Package className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-slate-800 dark:text-dark-150">Add New Product</p>
                <p className="text-[10px] text-slate-400 font-medium">Create items listing with photos</p>
              </div>
            </Link>

            <Link
              to="/admin/orders?status=Pending%20Verification"
              className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-950 text-sm font-semibold hover:border-slate-350 dark:hover:border-dark-700 transition-colors"
            >
              <AlertCircle className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-slate-800 dark:text-dark-150">Review Pending Orders</p>
                <p className="text-[10px] text-slate-400 font-medium">Match screenshot proofs & UTR</p>
              </div>
            </Link>

            <Link
              to="/admin/inventory"
              className="flex items-center gap-3 p-3.5 border rounded-xl hover:bg-slate-50 dark:border-dark-800 dark:hover:bg-dark-950 text-sm font-semibold hover:border-slate-350 dark:hover:border-dark-700 transition-colors"
            >
              <Calendar className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-slate-800 dark:text-dark-150">Check Stock Shortages</p>
                <p className="text-[10px] text-slate-400 font-medium">Inspect low stock and out-of-stock indicators</p>
              </div>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
