import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Load session from localStorage on initialization
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('civicpulse_token');
      const savedUser = localStorage.getItem('civicpulse_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error('Failed to load session from localStorage:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Helper to trigger a visual toast notification
   * @param {string} type 'success' | 'error' | 'info'
   * @param {string} message 
   */
  const showToast = (type, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto-remove toast after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  /**
   * Logs in a user
   * @param {string} email 
   * @param {string} password 
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);

      // Persist in localStorage
      localStorage.setItem('civicpulse_token', data.token);
      
      const userPayload = {
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role
      };
      
      localStorage.setItem('civicpulse_user', JSON.stringify(userPayload));

      setToken(data.token);
      setUser(userPayload);

      showToast('success', 'Login Successful! Welcome to CivicPulse.');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Server Error. Please try again.';
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registers a user
   * @param {string} name 
   * @param {string} email 
   * @param {string} phoneNumber
   * @param {string} password 
   * @param {string} confirmPassword
   */
  const register = async (name, email, phoneNumber, password, confirmPassword) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, phoneNumber, password, confirmPassword);
      showToast('success', 'Registration Successful. You can now login.');
      return data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Server Error. Please try again.';
      showToast('error', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the user
   */
  const logout = () => {
    localStorage.removeItem('civicpulse_token');
    localStorage.removeItem('civicpulse_user');
    setToken(null);
    setUser(null);
    showToast('info', 'Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, toasts, showToast, removeToast }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
