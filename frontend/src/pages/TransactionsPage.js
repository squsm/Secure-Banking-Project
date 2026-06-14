// ============================================================
// pages/TransactionsPage.js — Full Transaction History
// ============================================================

import React, { useState, useEffect } from 'react';
import { getTransactions } from '../utils/api';
import './TransactionsPage.css';

const TYPE_LABELS = {
  deposit:    { label: 'Deposit',    color: 'green'  },
  withdrawal: { label: 'Withdrawal', color: 'red'    },
  transfer:   { label: 'Transfer',   color: 'blue'   },
  payment:    { label: 'Payment',    color: 'yellow' },
};

const ICONS = {
  deposit: '↓', withdrawal: '↑', transfer: '⇄', payment: '◎',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getTransactions();
        setTransactions(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter whenever filter or search changes
  useEffect(() => {
    let result = [...transactions];
    if (filter !== 'all') result = result.filter(tx => tx.type === filter);
    if (search) result = result.filter(tx =>
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.amount.toString().includes(search)
    );
    setFiltered(result);
  }, [filter, search, transactions]);

  const totalDeposits   = transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type !== 'deposit').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="transactions-page page-enter">
      <div className="page-header">
        <h1>Transaction History</h1>
        <p className="text-muted">All your account activity in one place</p>
      </div>

      {/* ── Summary Row ─────────────── */}
      <div className="summary-row">
        <div className="summary-item">
          <p className="summary-label">Total Transactions</p>
          <p className="summary-value">{transactions.length}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Total Deposited</p>
          <p className="summary-value text-green">+${totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Total Spent</p>
          <p className="summary-value text-red">-${totalWithdrawals.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="summary-item">
          <p className="summary-label">Net Flow</p>
          <p className={`summary-value ${totalDeposits - totalWithdrawals >= 0 ? 'text-green' : 'text-red'}`}>
            {totalDeposits - totalWithdrawals >= 0 ? '+' : ''}
            ${(totalDeposits - totalWithdrawals).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* ── Filters ─────────────────── */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {['all', 'deposit', 'withdrawal', 'transfer'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : TYPE_LABELS[f]?.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search transactions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Transaction List ─────────── */}
      <div className="full-tx-list">
        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>◎</p>
            <p>No transactions found</p>
            <p className="text-muted" style={{ fontSize: '13px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          filtered.map(tx => (
            <div key={tx._id} className="full-tx-row">
              <div className={`tx-icon-lg ${tx.type}`}>{ICONS[tx.type]}</div>
              <div className="full-tx-details">
                <p className="full-tx-desc">{tx.description}</p>
                <div className="full-tx-meta">
                  <span className={`tx-badge ${TYPE_LABELS[tx.type]?.color}`}>
                    {TYPE_LABELS[tx.type]?.label}
                  </span>
                  {tx.category && tx.category !== 'other' && (
                    <span className="tx-category">{tx.category}</span>
                  )}
                  <span className="tx-date-full">
                    {new Date(tx.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
              <div className="full-tx-right">
                <p className={`full-tx-amount ${tx.type === 'deposit' ? 'credit' : 'debit'}`}>
                  {tx.type === 'deposit' ? '+' : '-'}
                  ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
                <p className="full-tx-balance">
                  Balance: ${tx.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
