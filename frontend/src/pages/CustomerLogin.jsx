import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Phone, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/Toast.jsx';

export default function CustomerLogin() {
  const { user, loginCustomer, registerCustomer, loading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSignUp, setIsSignUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const redirectPath = searchParams.get('redirect') || '/';

  useEffect(() => {
    // If user is already logged in, redirect them immediately
    if (!loading && user) {
      navigate(redirectPath);
    }
  }, [user, loading, navigate, redirectPath]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error('Email and Password are required.');
      return;
    }

    if (isSignUp && (!formData.fullName.trim() || !formData.phone.trim())) {
      toast.error('Please fill in your Full Name and Phone Number.');
      return;
    }

    try {
      setSubmitting(true);
      if (isSignUp) {
        // Sign Up
        const res = await registerCustomer(
          formData.email.trim(),
          formData.password.trim(),
          formData.fullName.trim(),
          formData.phone.trim()
        );

        if (res.success) {
          toast.success('Registration successful. Welcome to LUV Store!');
          navigate(redirectPath);
        } else {
          toast.error(res.error);
        }
      } else {
        // Sign In
        const res = await loginCustomer(formData.email.trim(), formData.password.trim());

        if (res.success) {
          toast.success('Signed in successfully.');
          navigate(redirectPath);
        } else {
          toast.error(res.error);
        }
      }
    } catch (err) {
      toast.error('Authentication request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 bg-slate-50 dark:bg-dark-950/20">
      <div className="max-w-md w-full space-y-6 p-8 rounded-2xl border border-slate-205 dark:border-dark-800 bg-white dark:bg-dark-900 shadow-xl shadow-slate-100/40 dark:shadow-none animate-slide-up text-left">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-slate-100 dark:border-dark-800 mb-6">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              !isSignUp
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-dark-300'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              isSignUp
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-dark-300'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold tracking-tight font-display text-slate-800 dark:text-dark-100">
            {isSignUp ? 'Join LUV Store' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp ? 'Register to manage orders and save products.' : 'Sign in to access order logs, checkout faster and heart items.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sign Up Fields */}
          {isSignUp && (
            <>
              {/* Full Name */}
              <div className="space-y-1">
                <label htmlFor="fullName" className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <div className="relative">
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    required
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    required
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1">
            <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase">Password</label>
            <div className="relative">
              <input
                id="password"
                type="password"
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 text-sm focus:outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Submit CTA */}
          <button
            id="auth-submit-btn"
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl text-sm font-bold bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/10 transition-colors flex justify-center items-center"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
}
