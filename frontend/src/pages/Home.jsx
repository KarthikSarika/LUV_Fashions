import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, ShieldCheck, RefreshCw, Star } from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Fetch featured products (default sorting)
        const featuredRes = await api.get('/products?limit=4');
        setFeaturedProducts(featuredRes.data.products);

        // Fetch new arrivals (latest first)
        const arrivalsRes = await api.get('/products?limit=4&sortBy=created_at_desc');
        setNewArrivals(arrivalsRes.data.products);
      } catch (err) {
        console.error('Error fetching home page products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const categories = [
    { name: 'Fashion', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600', count: '12+ Items' },
    { name: 'Electronics', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600', count: '8+ Items' },
    { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600', count: '15+ Items' },
    { name: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600', count: '10+ Items' },
  ];

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 dark:from-dark-950 dark:to-dark-900 py-20 sm:py-28 text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-400 via-rose-500 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-center lg:text-left animate-slide-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Introducing Summer Drop 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display leading-tight">
              Express Your Style With <span className="bg-gradient-to-r from-primary-400 to-rose-400 bg-clip-text text-transparent">LUV</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-lg mx-auto lg:mx-0">
              Explore premium apparel, curated accessories, and cutting-edge devices. Designed for the bold.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/products"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white transition-all shadow-lg shadow-primary-500/20 hover:scale-[1.02]"
              >
                Shop Collection <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                to="/track-order"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all hover:scale-[1.02]"
              >
                Track Your Order
              </Link>
            </div>
          </div>

          {/* Banner Graphic (Unsplash Premium Mockup) */}
          <div className="hidden lg:block relative justify-self-center animate-fade-in">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-primary-500 to-rose-500 blur-xl opacity-30"></div>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800"
              alt="Premium lifestyle presentation"
              className="relative rounded-2xl border border-white/10 w-96 shadow-2xl object-cover aspect-[4/5] object-center"
            />
          </div>

        </div>
      </section>

      {/* Trust Badges */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 rounded-2xl border border-slate-200/50 bg-white dark:bg-dark-900 dark:border-dark-800/60 shadow-md">
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-dark-800 text-primary-500 flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-dark-100 font-display">Express Shipping</h4>
              <p className="text-xs text-slate-500 mt-0.5">Delivered to your doorstep in 3-5 days</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-dark-800 text-primary-500 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-dark-100 font-display">UPI Safe Payment</h4>
              <p className="text-xs text-slate-500 mt-0.5">Instant secure manual verification check</p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-left">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-dark-800 text-primary-500 flex-shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 dark:text-dark-100 font-display">Dedicated Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">Friendly customer helpdesk at your disposal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight font-display text-slate-800 dark:text-dark-50">Shop By Category</h2>
          <p className="text-sm text-slate-500 dark:text-dark-400">Discover handpicked styles for your everyday collections</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${cat.name}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] block bg-slate-900 border border-slate-200/20 shadow-md hover:shadow-lg transition-shadow"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent flex flex-col justify-end p-5 text-left">
                <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">{cat.count}</span>
                <h3 className="text-lg font-bold text-white mt-1 group-hover:text-primary-300 transition-colors font-display">{cat.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-bold tracking-tight font-display text-slate-800 dark:text-dark-50">Featured Products</h2>
            <p className="text-sm text-slate-500 dark:text-dark-400">Curated favorites chosen just for you</p>
          </div>
          <Link to="/products" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">No products found.</div>
        )}
      </section>

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-left">
            <h2 className="text-3xl font-bold tracking-tight font-display text-slate-800 dark:text-dark-50">New Arrivals</h2>
            <p className="text-sm text-slate-500 dark:text-dark-400">Fresh styles to elevate your wardrobe</p>
          </div>
          <Link to="/products?sortBy=created_at_desc" className="text-sm font-bold text-primary-500 hover:text-primary-600 flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">No new products found.</div>
        )}
      </section>

      {/* Newsletter signup Mockup */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 py-16 px-8 sm:px-16 text-center text-white border border-slate-800 dark:bg-dark-900/60 dark:border-dark-800">
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-primary-400 to-transparent"></div>
          <div className="relative max-w-xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display">Join the LUV Community</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Subscribe to get special discounts, VIP early access notifications, and customized style drops.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully! (Mock)'); }} className="flex flex-col sm:flex-row gap-3">
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address"
                required
                className="flex-1 px-5 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-white placeholder-slate-500"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/15 text-white flex-shrink-0"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}
