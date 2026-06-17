import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Import Customer Storefront Pages
import Home from './pages/Home.jsx';
import ProductList from './pages/ProductList.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderTracking from './pages/OrderTracking.jsx';
import CustomerLogin from './pages/CustomerLogin.jsx';
import MyOrders from './pages/MyOrders.jsx';
import Favorites from './pages/Favorites.jsx';

// Import Admin Pages
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminProducts from './pages/AdminProducts.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import AdminInventory from './pages/AdminInventory.jsx';

import { useAuth } from './context/AuthContext.jsx';

// Client-side protected route middleware for Admins
const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-bold text-slate-500">Checking credentials...</span>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

// Client-side protected route middleware for Customers
const CustomerProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center gap-2">
        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm font-bold text-slate-500">Checking credentials...</span>
      </div>
    );
  }

  if (!user) {
    // Redirect to login, passing the current path as target redirect path
    return <Navigate to={`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`} replace />;
  }

  return children;
};

// Main Layout to ensure Navbar and Footer wrap pages
const PageLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Customer & Login Routes (Wrapped in page layout) */}
        <Route path="/" element={<PageLayout><Home /></PageLayout>} />
        <Route path="/products" element={<PageLayout><ProductList /></PageLayout>} />
        <Route path="/products/:id" element={<PageLayout><ProductDetail /></PageLayout>} />
        <Route path="/cart" element={<PageLayout><Cart /></PageLayout>} />
        <Route path="/checkout" element={<PageLayout><Checkout /></PageLayout>} />
        <Route path="/track-order" element={<PageLayout><OrderTracking /></PageLayout>} />
        <Route path="/login" element={<PageLayout><CustomerLogin /></PageLayout>} />
        <Route path="/admin/login" element={<PageLayout><AdminLogin /></PageLayout>} />

        {/* Customer Protected Pages */}
        <Route
          path="/orders"
          element={
            <CustomerProtectedRoute>
              <PageLayout>
                <MyOrders />
              </PageLayout>
            </CustomerProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <CustomerProtectedRoute>
              <PageLayout>
                <Favorites />
              </PageLayout>
            </CustomerProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <PageLayout>
                <AdminDashboard />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <PageLayout>
                <AdminProducts />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute>
              <PageLayout>
                <AdminOrders />
              </PageLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <ProtectedRoute>
              <PageLayout>
                <AdminInventory />
              </PageLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
