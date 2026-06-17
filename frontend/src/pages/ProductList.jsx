import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Read filter values from URL search parameters
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const sortBy = searchParams.get('sortBy') || 'newest';
  const page = searchParams.get('page') || '1';

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = ['All', 'Fashion', 'Electronics', 'Accessories', 'Footwear'];

  useEffect(() => {
    // Sync local search input with URL search param
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: 8,
          sortBy,
          all: 'false' // Customers only see active products
        };

        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        const response = await api.get('/products', { params });
        setProducts(response.data.products);
        setTotalPages(response.data.totalPages || 1);
        setCurrentPage(response.data.currentPage || 1);
        setTotalCount(response.data.totalProducts || 0);
      } catch (err) {
        console.error('Error fetching catalog products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, selectedCategory, sortBy, page]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value && value !== 'All') {
      nextParams.set(key, value);
    } else {
      nextParams.delete(key);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') {
      nextParams.set('page', '1');
    }
    setSearchParams(nextParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateParam('page', newPage.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200/50 dark:border-dark-800 pb-5">
        <div className="text-left space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">Our Collection</h1>
          <p className="text-xs text-slate-500">Showing {products.length} of {totalCount} premium products</p>
        </div>

        {/* Sort and Filters Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-xl bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-sm font-semibold text-slate-700 dark:text-dark-300 w-full sm:w-auto transition-colors"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-900 text-sm font-semibold text-slate-700 dark:text-dark-300 focus:outline-none w-full md:w-auto"
            >
              <option value="newest">Sort By: New Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <div className="hidden lg:block space-y-6">
          
          {/* Search Input Widget */}
          <div className="p-5 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 text-left space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-dark-200 font-display">Search Products</h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="sidebar-search"
                type="text"
                placeholder="Keywords..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border rounded-xl bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-dark-800 text-sm focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-primary-500">
                <Search className="w-4.5 h-4.5" />
              </button>
            </form>
          </div>

          {/* Categories Selector */}
          <div className="p-5 border border-slate-200/60 dark:border-dark-800 rounded-2xl bg-white dark:bg-dark-900 text-left space-y-3">
            <h3 className="font-bold text-sm text-slate-800 dark:text-dark-200 font-display">Filter Category</h3>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => updateParam('category', cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all font-semibold ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                      : 'text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-950 hover:text-slate-800 dark:hover:text-dark-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Mobile Filters Drawer Modal */}
        {showMobileFilters && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-80 bg-white dark:bg-dark-900 h-full p-6 flex flex-col gap-6 shadow-2xl overflow-y-auto animate-fade-in text-left">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="font-extrabold text-lg font-display">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="text-sm font-bold text-slate-500">Close</button>
              </div>

              {/* Search Mobile */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm font-display">Search</h3>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    id="mobile-sidebar-search"
                    type="text"
                    placeholder="Search keywords..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border rounded-xl bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                  <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
                    <Search className="w-4.5 h-4.5" />
                  </button>
                </form>
              </div>

              {/* Categories Mobile */}
              <div className="space-y-2">
                <h3 className="font-bold text-sm font-display">Categories</h3>
                <div className="flex flex-col gap-1">
                  {categories.map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        updateParam('category', cat);
                        setShowMobileFilters(false);
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-sm transition-all font-semibold ${
                        selectedCategory === cat
                          ? 'bg-primary-500 text-white'
                          : 'text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-950'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid & Results */}
        <div className="lg:col-span-3 space-y-8">
          
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-6 border-t border-slate-100 dark:border-dark-800">
                  {/* Prev */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-950 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="w-4.5 h-4.5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-9 w-9 rounded-xl text-sm font-bold transition-all flex items-center justify-center ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/15'
                            : 'border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-dark-400 hover:bg-slate-50 dark:hover:bg-dark-950'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl border border-slate-200 dark:border-dark-800 hover:bg-slate-50 dark:hover:bg-dark-950 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800 space-y-4">
              <SlidersHorizontal className="w-12 h-12 text-slate-300 dark:text-dark-800" />
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-800 dark:text-dark-200 font-display">No products found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters, keywords, or search term query.</p>
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="px-4 py-2 text-xs font-bold text-primary-500 border border-primary-500 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20"
              >
                Clear All Filters
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
