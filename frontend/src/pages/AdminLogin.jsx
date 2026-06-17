import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function AdminLogin() {
  const { admin, adminLogin, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // If already logged in, redirect directly to dashboard
    if (!loading && admin) {
      navigate('/admin/dashboard');
    }
  }, [admin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast.error('Email and Password are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await adminLogin(email.trim(), password.trim());
      
      if (res.success) {
        toast.success('Access granted. Welcome to LUV Store Console.');
        navigate('/admin/dashboard');
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Authentication request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl border border-slate-200/60 dark:border-dark-800 bg-white dark:bg-dark-900 shadow-xl shadow-slate-100/30 dark:shadow-none animate-slide-up text-left">
        
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="p-3 rounded-full bg-primary-50 dark:bg-dark-800 text-primary-500">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-100">
            Admin Console
          </h2>
          <p className="text-xs text-slate-400">Authenticate to manage storefront data, orders and items.</p>
        </div>

        {/* Info Box */}
        <div className="flex gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-150 text-[11px] text-slate-500 leading-relaxed dark:bg-dark-950 dark:border-dark-850">
          <ShieldAlert className="w-4 h-4 text-primary-500 flex-shrink-0" />
          <span>For security reasons, only registered administrators can log into this console. Contact database owners for access permissions.</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="admin-email" className="text-xs font-bold text-slate-500 uppercase">Admin Email</label>
            <div className="relative">
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@luvstore.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="admin-password" className="text-xs font-bold text-slate-500 uppercase">Password</label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/10 transition-colors flex justify-center items-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
