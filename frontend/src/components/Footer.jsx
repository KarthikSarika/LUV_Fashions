import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Instagram, Facebook, Twitter, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 dark:bg-dark-950 dark:border-dark-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-primary-400 to-rose-500 bg-clip-text text-transparent font-display">
              LUV Store
            </span>
            <p className="text-sm leading-relaxed text-slate-400 dark:text-dark-400">
              Your one-stop destination for premium fashion, accessories, and state-of-the-art collections. Empowering self-expression with modern designs.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-primary-400 transition-colors" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white dark:text-dark-50 font-semibold text-base mb-4 font-display">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Shop All Products</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-white transition-colors">Admin Dashboard Access</Link>
              </li>
            </ul>
          </div>

          {/* Support / Categories */}
          <div>
            <h3 className="text-white dark:text-dark-50 font-semibold text-base mb-4 font-display">Categories</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/products?category=Fashion" className="hover:text-white transition-colors">Apparel & Fashion</Link>
              </li>
              <li>
                <Link to="/products?category=Electronics" className="hover:text-white transition-colors">Electronics & Gadgets</Link>
              </li>
              <li>
                <Link to="/products?category=Accessories" className="hover:text-white transition-colors">Accessories & Details</Link>
              </li>
              <li>
                <Link to="/products?category=Footwear" className="hover:text-white transition-colors">Premium Footwear</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-white dark:text-dark-50 font-semibold text-base mb-4 font-display">Contact Us</h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span>123 LUV Boulevard, Creative Park, Hyderabad, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@luvstore.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 dark:border-dark-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; {currentYear} LUV Store. All Rights Reserved.</p>
          <div className="flex items-center gap-1.5 text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secure SSL Encrypted Transactions</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
