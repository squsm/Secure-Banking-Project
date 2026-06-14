// ============================================================
// pages/Dashboard.js — Main Dashboard Page
// ============================================================
// This is a React functional component. It uses:
// - useState: local component state (e.g. modal open/closed)
// - useEffect: runs side effects (fetching data when component mounts)
// - useAuth: our custom hook to get the current logged-in user
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getTransactions, depositFunds, withdrawFunds } from '../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts';
import './Dashboard.css';

// ── Transaction Row ──────────────────────────────────────────
const TxRow = ({ tx }) => {
  const isCredit = tx.type === 'deposit';
  const icons = { deposit: '↓', withdrawal: '↑', transfer: '⇄', payment: '◎' };
  return (
    <div className="tx-row">
      <div className={`tx-icon ${tx.type}`}>{icons[tx.type]}</div>
      <div className="tx-details">
        <p className="tx-desc">{tx.description}</p>
        <p className="tx-date">{new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      <p className={`tx-amount ${isCredit ? 'credit' : 'debit'}`}>
        {isCredit ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

// ── Modal for Deposit / Withdraw ─────────────────────────────
const ActionModal = ({ type, onClose, onSuccess }) => {
  const [amount, setAmount]           = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState('other');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return setError('Enter a valid amount');
    setLoading(true);
    setError('');
    try {
      if (type === 'deposit') {
        await depositFunds(parseFloat(amount), description || 'Cash Deposit');
      } else {
        await withdrawFunds(parseFloat(amount), description || 'Cash Withdrawal', category);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{type === 'deposit' ? '↓ Deposit Funds' : '↑ Withdraw Funds'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Amount (USD)</label>
            <input type="number" min="1" step="0.01" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <input type="text" placeholder="What's this for?"
              value={description} onChange={e => setDescription(e.target.value)} />
          </div>
          {type === 'withdrawal' && (
            <div className="form-group">
              <label>Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)}>
                <option value="food">Food & Dining</option>
                <option value="transport">Transport</option>
                <option value="shopping">Shopping</option>
                <option value="bills">Bills & Utilities</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? <span className="btn-spinner" /> : `Confirm ${type === 'deposit' ? 'Deposit' : 'Withdrawal'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Dashboard Component ──────────────────────────────────
export default function Dashboard() {
  const { user, refreshUser }             = useAuth();
  const [transactions, setTransactions]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [modal, setModal]                 = useState(null); // 'deposit' | 'withdraw' | null
  const [chartData, setChartData]         = useState([]);

  // useEffect runs AFTER the component renders
  // The [] dependency array means "only run once when component mounts"
  const loadData = useCallback(async () => {
    try {
      const { data } = await getTransactions();
      setTransactions(data);

      // Build chart data from last 7 transactions
      const reversed = [...data].reverse().slice(-7);
      setChartData(reversed.map((tx, i) => ({
        name: `Tx ${i + 1}`,
        balance: tx.balanceAfter,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSuccess = async () => {
    await refreshUser();
    await loadData();
  };

  return (
    <div className="dashboard page-enter">
      {/* ── Header ──────────────────── */}
      <div className="dash-header">
        <div>
          <p className="dash-greeting">Good day,</p>
          <h1 className="dash-name">{user?.fullName}</h1>
        </div>
        <div className="dash-account-chip">
          <span>Acc:</span>
          <span className="monospace">•••• {user?.accountNumber?.slice(-4)}</span>
        </div>
      </div>

      {/* ── Balance Cards ────────────── */}
      <div className="balance-grid">
        <div className="balance-card primary">
          <p className="balance-label">Checking Balance</p>
          <h2 className="balance-amount">
            ${user?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </h2>
          <div className="balance-actions">
            <button className="action-btn deposit" onClick={() => setModal('deposit')}>↓ Deposit</button>
            <button className="action-btn withdraw" onClick={() => setModal('withdraw')}>↑ Withdraw</button>
          </div>
        </div>

        <div className="stat-cards">
          <div className="stat-card">
            <p className="stat-label">This Month In</p>
            <p className="stat-value text-green">
              +${transactions.filter(t => t.type === 'deposit' && isThisMonth(t.createdAt))
                .reduce((s, t) => s + t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">This Month Out</p>
            <p className="stat-value text-red">
              -${transactions.filter(t => t.type !== 'deposit' && isThisMonth(t.createdAt))
                .reduce((s, t) => s + t.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Total Transactions</p>
            <p className="stat-value">{transactions.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Account Status</p>
            <p className="stat-value text-green">● Active</p>
          </div>
        </div>
      </div>

      {/* ── Chart ───────────────────── */}
      {chartData.length > 1 && (
        <div className="chart-card">
          <h3 className="section-title">Balance History</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" tick={{ fill: '#8899bb', fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: '#8899bb', fontSize: 12 }} axisLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
              <Tooltip
                contentStyle={{ background: '#141c2e', border: '1px solid #2d3748', borderRadius: '10px', color: '#f0f4ff' }}
                formatter={v => [`$${v.toLocaleString()}`, 'Balance']}
              />
              <Area type="monotone" dataKey="balance" stroke="#00d4aa" strokeWidth={2} fill="url(#colorBalance)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Recent Transactions ──────── */}
      <div className="transactions-card">
        <h3 className="section-title">Recent Transactions</h3>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center' }}><div className="spinner" /></div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p>
            <p className="text-muted">Make a deposit to get started!</p>
          </div>
        ) : (
          <div className="tx-list">
            {transactions.slice(0, 8).map(tx => <TxRow key={tx._id} tx={tx} />)}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────── */}
      {modal && (
        <ActionModal
          type={modal}
          onClose={() => setModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}

function isThisMonth(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}
