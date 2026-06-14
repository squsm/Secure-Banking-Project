// ============================================================
// utils/api.js — Axios API Helper Functions
// ============================================================
// Centralizes all API calls so components stay clean.
// axios is a popular HTTP client library for making
// requests from the browser to the backend server.
// ============================================================

import axios from 'axios';

// Account Actions
export const depositFunds = (amount, description) =>
  axios.post('/api/account/deposit', { amount, description });

export const withdrawFunds = (amount, description, category) =>
  axios.post('/api/account/withdraw', { amount, description, category });

export const transferFunds = (amount, recipientAccount, recipientName, description) =>
  axios.post('/api/account/transfer', { amount, recipientAccount, recipientName, description });

export const getBalance = () =>
  axios.get('/api/account/balance');

// Transactions
export const getTransactions = () =>
  axios.get('/api/transactions');

export const getTransactionStats = () =>
  axios.get('/api/transactions/stats');
