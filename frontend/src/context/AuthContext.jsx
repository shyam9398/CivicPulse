import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Immediately finish loading session as there is no local persistence
  useEffect(() => {
    setLoading(false);
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

      // Update in-memory authorization header
      setUser({
        id: data.id,
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        role: data.role
      });

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
      showToast('success', 'Registration Successful');
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
    authService.setToken(null);
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

