import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // Admin state
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem('adminToken'));
  
  // Customer state
  const [user, setUser] = useState(null);
  const [customerToken, setCustomerToken] = useState(() => localStorage.getItem('customerToken'));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySessions = async () => {
      const storedAdminToken = localStorage.getItem('adminToken');
      const storedCustomerToken = localStorage.getItem('customerToken');

      try {
        // 1. Verify Admin Session if token exists
        if (storedAdminToken) {
          try {
            const response = await api.get('/auth/profile', {
              headers: { Authorization: `Bearer ${storedAdminToken}` }
            });
            setAdmin(response.data.user);
            setAdminToken(storedAdminToken);
          } catch (err) {
            console.warn('Admin session expired.');
            localStorage.removeItem('adminToken');
            setAdmin(null);
            setAdminToken(null);
          }
        }

        // 2. Verify Customer Session if token exists
        if (storedCustomerToken) {
          try {
            const response = await api.get('/customer/profile', {
              headers: { Authorization: `Bearer ${storedCustomerToken}` }
            });
            setUser({
              id: response.data.profile.id,
              email: response.data.profile.email,
              role: 'customer',
              profile: response.data.profile
            });
            setCustomerToken(storedCustomerToken);
          } catch (err) {
            console.warn('Customer session expired.');
            localStorage.removeItem('customerToken');
            setUser(null);
            setCustomerToken(null);
          }
        }
      } catch (err) {
        console.error('Session bootstrap error:', err);
      } finally {
        setLoading(false);
      }
    };

    verifySessions();
  }, []);

  // Admin Logins
  const adminLogin = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: adminData } = response.data;

      localStorage.setItem('adminToken', receivedToken);
      setAdminToken(receivedToken);
      setAdmin(adminData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed.' };
    }
  };

  const adminLogout = async () => {
    try {
      await api.post('/auth/logout', {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
    } catch (e) {
      console.warn('Admin logout failed on server.');
    } finally {
      localStorage.removeItem('adminToken');
      setAdminToken(null);
      setAdmin(null);
    }
  };

  // Customer Logins
  const loginCustomer = async (email, password) => {
    try {
      const response = await api.post('/auth/customer/login', { email, password });
      const { token: receivedToken, user: userData } = response.data;

      localStorage.setItem('customerToken', receivedToken);
      setCustomerToken(receivedToken);
      setUser(userData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Login failed.' };
    }
  };

  // Customer Signup
  const registerCustomer = async (email, password, fullName, phone) => {
    try {
      const response = await api.post('/auth/customer/register', {
        email,
        password,
        full_name: fullName,
        phone
      });
      const { token: receivedToken, user: userData } = response.data;

      if (receivedToken) {
        localStorage.setItem('customerToken', receivedToken);
        setCustomerToken(receivedToken);
        setUser(userData);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Registration failed.' };
    }
  };

  // Customer Logouts
  const logoutCustomer = () => {
    localStorage.removeItem('customerToken');
    setCustomerToken(null);
    setUser(null);
  };

  // Update Customer Profile Details
  const updateProfile = async (fields) => {
    try {
      const response = await api.put('/customer/profile', fields);
      setUser((prev) => ({
        ...prev,
        profile: response.data.profile
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token: adminToken,
        user,
        customerToken,
        loading,
        adminLogin,
        adminLogout,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
