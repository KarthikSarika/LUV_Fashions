import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Package, Plus, Pencil, Trash2, Search, X, Upload, Save, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import api from '../utils/api.js';
import { useToast } from '../components/Toast.jsx';
import { TableSkeleton } from '../components/Skeleton.jsx';

export default function AdminProducts() {
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState('add'); // 'add' or 'edit'
  const [currentProductId, setCurrentProductId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Fashion',
    price: '',
    discount_price: '',
    stock: '',
    is_active: true
  });
  
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
    
    // Check if redirect query asks to immediately open add drawer
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'add') {
      openAddForm();
      // Remove query from URL
      navigate('/admin/products', { replace: true });
    }
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products?all=true'); // Gets active AND inactive products
      setProducts(response.data.products || []);
    } catch (err) {
      console.error('Error fetching admin products list:', err);
      toast.error('Failed to retrieve products.');
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Fashion',
      price: '',
      discount_price: '',
      stock: '',
      is_active: true
    });
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setFormType('add');
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category,
      price: product.price,
      discount_price: product.discount_price || '',
      stock: product.stock,
      is_active: product.is_active
    });
    setExistingImages(product.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setCurrentProductId(product.id);
    setFormType('edit');
    setIsFormOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const previews = [];

    if (files.length + newImageFiles.length + existingImages.length > 5) {
      toast.warning('A product can have a maximum of 5 images.');
      return;
    }

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        validFiles.push(file);
        previews.push(URL.createObjectURL(file));
      }
    });

    setNewImageFiles((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (idx) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete product "${name}"?`)) {
      try {
        await api.delete(`/products/${id}`);
        toast.success(`"${name}" was deleted successfully.`);
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category || formData.price === '' || formData.stock === '') {
      toast.error('Name, Category, Price, and Stock are required.');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('stock', formData.stock);
      data.append('is_active', formData.is_active);
      
      if (formData.discount_price !== '') {
        data.append('discount_price', formData.discount_price);
      } else {
        data.append('discount_price', 'null');
      }

      // Add existing images to preserve
      existingImages.forEach((url) => {
        data.append('existing_images', url);
      });

      // Add new file uploads
      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      if (formType === 'add') {
        await api.post('/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully.');
      } else {
        await api.put(`/products/${currentProductId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully.');
      }

      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Submit failed:', err);
      toast.error(err.response?.data?.error || 'Operation failed. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const adminTabs = [
    { name: 'Dashboard', path: '/admin/dashboard', active: false },
    { name: 'Products', path: '/admin/products', active: true },
    { name: 'Orders', path: '/admin/orders', active: false },
    { name: 'Inventory', path: '/admin/inventory', active: false },
  ];

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 dark:border-dark-800 pb-2">
        <h1 className="text-3xl font-extrabold text-left font-display text-slate-800 dark:text-dark-50">Manage Products</h1>
        
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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <input
            id="admin-product-search"
            type="text"
            placeholder="Search products/categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border rounded-xl bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-sm focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Add Product Trigger */}
        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 transition-colors w-full sm:w-auto"
        >
          <Plus className="w-4.5 h-4.5" /> Add Product
        </button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : filteredProducts.length > 0 ? (
        <div className="border border-slate-200/60 dark:border-dark-800 rounded-2xl overflow-hidden bg-white dark:bg-dark-900 shadow-sm text-left">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-dark-850 text-sm">
              <thead>
                <tr className="text-slate-450 text-xs font-bold uppercase tracking-wider bg-slate-50 dark:bg-dark-950/20">
                  <th className="py-4 px-4">Image</th>
                  <th className="py-4 px-4">Product Name</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Stock</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-105 dark:divide-dark-850 text-slate-700 dark:text-dark-300">
                {filteredProducts.map((p) => {
                  const displayImg = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150';
                  
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-dark-950/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-950">
                          <img src={displayImg} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-850 dark:text-dark-100 max-w-xs truncate">{p.name}</td>
                      <td className="py-3 px-4 font-semibold text-slate-500 uppercase text-[10px] tracking-wider">{p.category}</td>
                      <td className="py-3 px-4 font-bold">
                        {p.discount_price ? (
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-400 line-through">₹{p.price}</span>
                            <span>₹{p.discount_price}</span>
                          </div>
                        ) : `₹${p.price}`}
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {p.stock === 0 ? (
                          <span className="text-rose-500">Out of Stock</span>
                        ) : p.stock <= 5 ? (
                          <span className="text-amber-500">Low Stock ({p.stock})</span>
                        ) : `${p.stock}`}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <Eye className="w-3.5 h-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-500 bg-slate-100 dark:bg-dark-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            <EyeOff className="w-3.5 h-3.5" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => openEditForm(p)}
                          className="p-1.5 rounded-lg border hover:bg-slate-150 text-slate-500 hover:text-primary-500 dark:border-dark-800 dark:hover:bg-dark-800 transition-colors"
                          aria-label="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-1.5 rounded-lg border hover:bg-rose-50 text-slate-400 hover:text-rose-600 dark:border-dark-800 dark:hover:bg-rose-950/30 transition-colors"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <h3 className="font-bold text-lg font-display text-slate-800 dark:text-dark-200">No products listed</h3>
          <p className="text-sm text-slate-500">Create product catalogs by tapping the Add Product button above.</p>
        </div>
      )}

      {/* Add / Edit Slideout Drawer Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-white dark:bg-dark-900 h-full p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto animate-fade-in text-left">
            <div className="flex justify-between items-center border-b pb-3.5">
              <h2 className="font-extrabold text-xl font-display flex items-center gap-1.5 text-slate-850 dark:text-dark-100">
                {formType === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-dark-800">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Product Name */}
              <div className="space-y-1">
                <label htmlFor="product_name" className="text-xs font-bold text-slate-500 uppercase">Product Name *</label>
                <input
                  id="product_name"
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Vintage Leather Jacket"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label htmlFor="product_desc" className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <textarea
                  id="product_desc"
                  name="description"
                  rows="3"
                  placeholder="Tell clients about product features..."
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none resize-none"
                />
              </div>

              {/* Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product_cat" className="text-xs font-bold text-slate-500 uppercase">Category *</label>
                  <select
                    id="product_cat"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm font-semibold text-slate-700 dark:text-dark-350 focus:outline-none"
                  >
                    <option value="Fashion">Fashion</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>

                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label htmlFor="product_stock" className="text-xs font-bold text-slate-500 uppercase">Stock Quantity *</label>
                  <input
                    id="product_stock"
                    type="number"
                    name="stock"
                    required
                    min="0"
                    placeholder="100"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Price and Discount Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="product_price" className="text-xs font-bold text-slate-500 uppercase">Base Price (₹) *</label>
                  <input
                    id="product_price"
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    placeholder="1999"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="product_discount" className="text-xs font-bold text-slate-500 uppercase">Discount Price (₹)</label>
                  <input
                    id="product_discount"
                    type="number"
                    name="discount_price"
                    min="0"
                    step="0.01"
                    placeholder="1499"
                    value={formData.discount_price}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Manager */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 uppercase block">Product Images (Max 5)</span>
                
                {/* Image upload widget label */}
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-250 dark:border-dark-800 rounded-xl p-5 hover:bg-slate-50 dark:hover:bg-dark-950/40 cursor-pointer transition-colors relative">
                  <input
                    id="images-upload-drawer"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="w-8 h-8 text-primary-500 mb-1.5" />
                  <span className="text-xs font-bold text-slate-700 dark:text-dark-350">Select product images to attach</span>
                  <span className="text-[10px] text-slate-450 mt-0.5">JPEG, PNG, or WEBP (Max 5MB)</span>
                </label>

                {/* Previews grids */}
                {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                  <div className="grid grid-cols-5 gap-3 mt-3.5">
                    {/* Existing Images */}
                    {existingImages.map((url, idx) => (
                      <div key={`exist-${idx}`} className="aspect-square relative rounded-xl border overflow-hidden bg-slate-50 dark:bg-dark-950">
                        <img src={url} alt="Existing Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white"
                          aria-label="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    
                    {/* New Images Previews */}
                    {newImagePreviews.map((url, idx) => (
                      <div key={`new-${idx}`} className="aspect-square relative rounded-xl border-2 border-primary-500/50 overflow-hidden bg-slate-50 dark:bg-dark-950">
                        <img src={url} alt="New Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white"
                          aria-label="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Status checkbox */}
              <div className="flex items-center gap-2 pt-2 text-sm text-left">
                <input
                  id="is_active_box"
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="rounded border-slate-300 dark:border-dark-800 text-primary-500 focus:ring-primary-500 h-4 w-4"
                />
                <label htmlFor="is_active_box" className="font-semibold text-slate-700 dark:text-dark-250 select-none">Mark product active (visible to storefront)</label>
              </div>

              {/* Drawer actions */}
              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-dark-850">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 py-3 border border-slate-200 dark:border-dark-800 rounded-xl text-sm font-bold text-slate-650 hover:bg-slate-50 dark:hover:bg-dark-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
