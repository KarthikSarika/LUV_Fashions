import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import api from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { ProductGridSkeleton } from '../components/Skeleton.jsx';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/favorites');
      setFavorites(response.data || []);
    } catch (err) {
      console.error('Error fetching favorites wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-left font-display">My Wishlist</h1>
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Title */}
      <div className="text-left flex items-center gap-3">
        <Link to="/" className="p-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-dark-900 transition-colors">
          <ArrowLeft className="w-4.5 h-4.5" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-50">My Wishlist</h1>
          <p className="text-xs text-slate-500">Your favorite products saved in your profile</p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 text-left">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed rounded-3xl border-slate-300 dark:border-dark-800 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-105 dark:bg-dark-900 flex items-center justify-center mx-auto text-slate-450">
            <Heart className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-bold text-lg font-display text-slate-800 dark:text-dark-200">Your Wishlist is Empty</h3>
            <p className="text-sm text-slate-500">Heart items in our collection to save them to your account.</p>
          </div>
          <Link
            to="/products"
            className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-500/10 flex items-center gap-1.5"
          >
            Explore Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

    </div>
  );
}
