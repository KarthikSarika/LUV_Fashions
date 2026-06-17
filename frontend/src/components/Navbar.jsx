import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Moon, Sun, Menu, X, User, Package, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { getCartCount } = useCart();
  const { admin, adminLogout, user, logoutCustomer } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-dark-900/60 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center gap-1.5">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-500 to-rose-600 bg-clip-text text-transparent font-display">
              LUV Store
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md relative">
            <input
              id="desktop-search"
              type="text"
              placeholder="Search products, brands and collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-full border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm transition-all"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400 hover:text-primary-500 transition-colors" aria-label="Search">
              <Search className="w-4.5 h-4.5" />
            </button>
          </form>

          {/* Links & Icons - Desktop */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/products" className="text-sm font-semibold text-slate-600 hover:text-primary-500 dark:text-dark-300 dark:hover:text-primary-400 transition-colors">
              Shop All
            </Link>
            <Link to="/track-order" className="text-sm font-semibold text-slate-600 hover:text-primary-500 dark:text-dark-300 dark:hover:text-primary-400 transition-colors">
              Track Order
            </Link>
            {user && (
              <>
                <Link to="/favorites" className="text-sm font-semibold text-slate-650 hover:text-primary-500 dark:text-dark-300 dark:hover:text-primary-400 transition-colors">
                  Wishlist
                </Link>
                <Link to="/orders" className="text-sm font-semibold text-slate-650 hover:text-primary-500 dark:text-dark-300 dark:hover:text-primary-400 transition-colors">
                  My Orders
                </Link>
              </>
            )}
            {admin && (
              <Link to="/admin/dashboard" className="text-sm font-semibold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 transition-colors">
                <Package className="w-4 h-4" /> Dashboard
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-900 transition-all"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Cart Icon */}
            <Link
              id="cart-nav"
              to="/cart"
              className="p-2 rounded-full text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-900 relative transition-all"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* Profile / Admin Login Link */}
            {admin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={adminLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-900 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:block text-xs font-bold text-slate-600 dark:text-dark-350">
                  Hi, {user.profile?.full_name?.split(' ')[0] || 'User'}
                </span>
                <button
                  onClick={logoutCustomer}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-dark-800 text-slate-700 dark:text-dark-300 hover:bg-slate-50 dark:hover:bg-dark-900 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-900 transition-all"
                aria-label="Customer Login"
              >
                <User className="w-5 h-5" />
              </Link>
            )}

            {/* Mobile Menu Open */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-full text-slate-500 dark:text-dark-400 hover:bg-slate-100 dark:hover:bg-dark-900 transition-all"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 dark:border-dark-900 bg-white dark:bg-dark-950 p-4 space-y-4 animate-fade-in">
          {/* Search bar inside menu */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              id="mobile-search"
              type="text"
              placeholder="Search store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-900 text-sm focus:outline-none"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-slate-400">
              <Search className="w-4.5 h-4.5" />
            </button>
          </form>

          <div className="flex flex-col gap-3">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-dark-300 dark:hover:bg-dark-900 transition-colors"
            >
              Shop All
            </Link>
            <Link
              to="/track-order"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-dark-300 dark:hover:bg-dark-900 transition-colors"
            >
              Track Order
            </Link>
            {user && (
              <>
                <Link
                  to="/favorites"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-dark-300 dark:hover:bg-dark-900 transition-colors"
                >
                  Wishlist
                </Link>
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50 dark:text-dark-300 dark:hover:bg-dark-900 transition-colors"
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    logoutCustomer();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-500 hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors"
                >
                  Log Out
                </button>
              </>
            )}
            {admin && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl text-base font-semibold text-primary-500 hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors"
                >
                  Admin Dashboard
                </Link>
                <button
                  onClick={() => {
                    adminLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-base font-medium text-rose-500 hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors"
                >
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
