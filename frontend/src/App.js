// ============================================================
// App.js — Root React Component with Routing
// ============================================================
// React Router DOM lets us create a Single Page App (SPA)
// where different URLs show different components WITHOUT
// reloading the whole page — just like a real mobile app.
//
// <BrowserRouter> — Enables routing using the browser's URL bar
// <Routes>        — Container for all route definitions
// <Route>         — Maps a URL path to a component
// <Navigate>      — Programmatically redirects to another route
// ============================================================

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Page components
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard    from './pages/Dashboard';
import TransferPage from './pages/TransferPage';
import TransactionsPage from './pages/TransactionsPage';
import Layout       from './components/Layout';

// ---------------------------------------------------------------
// PrivateRoute — Protects routes that require login
// If the user isn't logged in, redirect them to /login
// ---------------------------------------------------------------
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    // AuthProvider wraps everything so auth state is available everywhere
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — wrapped in Layout (sidebar + navbar) */}
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="transfer"     element={<TransferPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
          </Route>

          {/* Catch-all: redirect unknown URLs to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
