// ============================================================
// src/index.js — React App Entry Point
// ============================================================
// React takes over a single HTML element (root) and renders
// the entire application inside it as a Single Page App (SPA).
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
