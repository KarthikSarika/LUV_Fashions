import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, PlusCircle, Check, AlertTriangle, AlertOctagon, TrendingDown, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';

export default function AdminInventory() {
  const toast = useToast();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [inventoryFilter, setInventoryFilter] = useState('All'); // 'All', 'Low Stock', 'Out of Stock'
  
  // Quick Edit Stock state
  const [editingId, setEditingId] = useState(null);
  const [editingStockVal, setEditingStockVal] = useState('');
  const [savingStock, setSavingStock] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?all=true'); // fetch all items
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching admin inventory:', err);
      toast.error('Failed to retrieve inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuickEdit = (productId, currentStock) => {
    setEditingId(productId);
    setEditingStockVal(currentStock.toString());
  };

  const handleSaveQuickStock = async (product) => {
    const nextStock = parseInt(editingStockVal);
    if (isNaN(nextStock) || nextStock < 0) {
      toast.error('Stock quantity must be a non-negative number.');
      return;
    }

    try {
      setSavingStock(true);
      // Send a PUT edit request updating just the stock field
      const data = new FormData();
      data.append('stock', nextStock);
      // Keep existing images
      product.images.forEach(url => data.append('existing_images', url));

      await api.put(`/products/${product.id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(`Updated "${product.name}" stock count to ${nextStock}.`);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error('Quick edit stock error:', err);
      toast.error('Failed to update stock quantity.');
    } finally {
      setSavingStock(false);
    }
  };

  const adminTabs = [
    { name: 'Dashboard', path: '/admin/dashboard', active: false },
    { name: 'Products', path: '/admin/products', active: false },
    { name: 'Orders', path: '/admin/orders', active: false },
    { name: 'Inventory', path: '/admin/inventory', active: true },
  ];

  // Filters logic
  const filteredInventory = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (inventoryFilter === 'Low Stock') {
      return p.stock > 0 && p.stock <= 5;
    }
    if (inventoryFilter === 'Out of Stock') {
      return p.stock === 0;
    }
    return true;
  });

  // Count aggregates
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-dark-800 pb-2">
        <h1 className="text-3xl font-extrabold text-left font-display text-slate-800 dark:text-dark-50">Inventory Control</h1>
        
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

      {/* Alert Banners */}
      {(outOfStockCount > 0 || lowStockCount > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {outOfStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/10 text-rose-800 dark:text-rose-455">
              <AlertOctagon className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Critical Out Of Stock:</span> {outOfStockCount} product(s) are at 0 stock. Customers cannot purchase these items.
              </div>
            </div>
          )}
          {lowStockCount > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10 text-amber-850 dark:text-amber-455">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Low Stock Alerts:</span> {lowStockCount} product(s) have 5 or fewer items remaining. Restock soon to prevent outages.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar Options */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            id="admin-inventory-search"
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-sm focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Filter categories */}
        <div className="flex gap-2 w-full sm:w-auto">
          {['All', 'Low Stock', 'Out of Stock'].map((filt) => (
            <button
              key={filt}
              onClick={() => setInventoryFilter(filt)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                inventoryFilter === filt
                  ? 'bg-slate-800 border-slate-800 text-white dark:bg-dark-800 dark:border-dark-700'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50 dark:bg-dark-900 dark:border-dark-800 dark:hover:bg-dark-950'
              }`}
            >
              {filt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredInventory.length > 0 ? (
        <div className="border border-slate-200/60 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-dark-850 text-sm">
              <thead>
                <tr className="text-slate-450 text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-dark-950/20">
                  <th className="py-4 px-4">Image</th>
                  <th className="py-4 px-4">Product Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Current Stock</th>
                  <th className="py-4 px-4">Quick Adjust Controls</th>
                  <th className="py-4 px-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 dark:divide-dark-850 text-slate-700 dark:text-dark-300">
                {filteredInventory.map((p) => {
                  const displayImg = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150';
                  const isEditing = editingId === p.id;
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-950/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950">
                          <img src={displayImg} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-dark-100 max-w-xs truncate">{p.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-400 uppercase text-[10px] tracking-wider">{p.category}</td>
                      
                      {/* Current Stock indicators */}
                      <td className="py-3 px-4 font-bold">
                        {p.stock === 0 ? (
                          <span className="flex items-center gap-1 text-rose-500 font-extrabold text-xs">
                            <AlertOctagon className="w-3.5 h-3.5" /> Out of stock
                          </span>
                        ) : p.stock <= 5 ? (
                          <span className="flex items-center gap-1 text-amber-500 font-extrabold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({p.stock})
                          </span>
                        ) : (
                          <span className="text-slate-800 dark:text-dark-100">{p.stock} units</span>
                        )}
                      </td>
                      
                      {/* Quick Adjust controls */}
                      <td className="py-3 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(e.target.value)}
                              className="w-16 px-2 py-1 border rounded bg-slate-50 dark:bg-dark-950 dark:border-dark-850 text-xs font-bold focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveQuickStock(p)}
                              disabled={savingStock}
                              className="p-1.5 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition-colors disabled:opacity-40"
                              title="Save stock value"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1.5 border hover:bg-slate-100 text-slate-450 dark:border-dark-800 dark:hover:bg-dark-800 text-xs rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartQuickEdit(p.id, p.stock)}
                            className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:border-slate-350 dark:border-dark-800 dark:hover:border-dark-700 text-xs font-bold text-slate-650 hover:bg-slate-50 dark:hover:bg-dark-950 rounded-lg transition-all"
                          >
                            <TrendingDown className="w-3.5 h-3.5 text-primary-500" /> Quick Edit Stock
                          </button>
                        )}
                      </td>

                      {/* Link to catalog pages */}
                      <td className="py-3 px-4 text-right">
                        <Link to={`/products/${p.id}`} className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-dark-200 inline-flex items-center gap-0.5">
                          View details <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800 space-y-4">
          <Package className="w-12 h-12 text-slate-350" />
          <h3 className="font-bold text-lg font-display text-slate-800 dark:text-dark-200">No inventory matches</h3>
          <p className="text-sm text-slate-500">Adjust stock filter categories or search keywords.</p>
        </div>
      )}

    </div>
  );
}
