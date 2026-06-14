// ============================================================
// context/AuthContext.js — React Context API for Auth State
// ============================================================
// React Context lets us share state (like the logged-in user)
// across ALL components without passing props manually at
// every level (this is called "prop drilling").
//
// HOW IT WORKS:
// 1. We create a Context object
// 2. We wrap the whole app in a Provider
// 3. Any component can call useAuth() to get the user state
// ============================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context object
const AuthContext = createContext();

// Custom hook — makes it easy to use this context anywhere
export const useAuth = () => useContext(AuthContext);

// The Provider component wraps our app and provides the shared state
export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // On app load, check if a token exists and fetch the user
  useEffect(() => {
    const token = localStorage.getItem('novbank_token');
    if (token) {
      // Set the default auth header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await axios.get('/api/auth/me');
      setUser(data);
    } catch {
      localStorage.removeItem('novbank_token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  // Register a new account
  const register = async (fullName, email, password) => {
    setError('');
    const { data } = await axios.post('/api/auth/register', { fullName, email, password });
    localStorage.setItem('novbank_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  // Login with email + password
  const login = async (email, password) => {
    setError('');
    const { data } = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('novbank_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setUser(data);
    return data;
  };

  // Logout — clear token and user state
  const logout = () => {
    localStorage.removeItem('novbank_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Refresh user data from the server
  const refreshUser = async () => {
    await fetchUser();
  };

  // Everything we expose to the rest of the app
  const value = { user, loading, error, setError, login, register, logout, refreshUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
