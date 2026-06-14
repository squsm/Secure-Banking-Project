// ============================================================
// pages/TransferPage.js — Money Transfer Page
// ============================================================

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transferFunds } from '../utils/api';
import './TransferPage.css';

export default function TransferPage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    amount: '',
    recipientAccount: '',
    recipientName: '',
    description: '',
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return setError('Enter a valid amount');
    if (!form.recipientAccount) return setError('Enter recipient account number');
    if (form.recipientAccount === user?.accountNumber) return setError("You can't transfer to your own account");

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await transferFunds(
        parseFloat(form.amount),
        form.recipientAccount,
        form.recipientName || 'Unknown',
        form.description
      );
      await refreshUser();
      setSuccess(`✓ Transfer of $${parseFloat(form.amount).toLocaleString()} successful!`);
      setForm({ amount: '', recipientAccount: '', recipientName: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transfer-page page-enter">
      <div className="page-header">
        <h1>Transfer Funds</h1>
        <p className="text-muted">Send money to any account instantly</p>
      </div>

      <div className="transfer-layout">
        {/* ── Transfer Form ─────────────── */}
        <div className="transfer-card">
          <div className="from-account">
            <p className="from-label">From Account</p>
            <div className="from-info">
              <div className="from-avatar">{user?.fullName?.charAt(0)}</div>
              <div>
                <p className="from-name">{user?.fullName}</p>
                <p className="from-number monospace">•••• {user?.accountNumber?.slice(-4)}</p>
              </div>
              <div className="from-balance">
                <p className="from-balance-label">Available</p>
                <p className="from-balance-amount">${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>

          <div className="transfer-arrow">⇣</div>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSubmit} className="transfer-form">
            <div className="form-group">
              <label>Amount (USD)</label>
              <div className="amount-input-wrapper">
                <span className="currency-sign">$</span>
                <input
                  type="number" name="amount" min="1" step="0.01"
                  placeholder="0.00" value={form.amount}
                  onChange={handleChange} required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Recipient Account Number</label>
                <input type="text" name="recipientAccount" placeholder="10-digit account number"
                  value={form.recipientAccount} onChange={handleChange} required maxLength={10} />
              </div>
              <div className="form-group">
                <label>Recipient Name</label>
                <input type="text" name="recipientName" placeholder="Full name (optional)"
                  value={form.recipientName} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Note (optional)</label>
              <input type="text" name="description" placeholder="e.g. Rent, Salary, Loan repayment"
                value={form.description} onChange={handleChange} />
            </div>

            <button type="submit" className="transfer-btn" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : '⇄ Send Transfer'}
            </button>
          </form>
        </div>

        {/* ── Tips Panel ────────────────── */}
        <div className="tips-panel">
          <h3>Transfer Tips</h3>
          <div className="tip-item">
            <span className="tip-icon">🔒</span>
            <div>
              <p className="tip-title">Secure Transfers</p>
              <p className="tip-body">All transfers are encrypted end-to-end and processed instantly.</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">✓</span>
            <div>
              <p className="tip-title">Double Check</p>
              <p className="tip-body">Always verify the recipient account number before sending.</p>
            </div>
          </div>
          <div className="tip-item">
            <span className="tip-icon">⚡</span>
            <div>
              <p className="tip-title">Instant</p>
              <p className="tip-body">Transfers within NovBank are processed immediately with no fees.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
