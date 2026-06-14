// ============================================================
// components/Layout.js — App Shell with Sidebar
// ============================================================
// Layout wraps all authenticated pages. It renders the
// sidebar and the main content area.
// <Outlet /> is a React Router concept — it renders whichever
// child route is currently active.
// ============================================================

import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const NAV_ITEMS = [
  { to: '/',            icon: '⬡', label: 'Dashboard'    },
  { to: '/transfer',    icon: '⇄', label: 'Transfer'      },
  { to: '/transactions',icon: '≡', label: 'Transactions'  },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={`app-shell ${collapsed ? 'collapsed' : ''}`}>
      {/* ── Sidebar ───────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">◈</span>
          {!collapsed && <span className="logo-text">NovBank</span>}
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">
              {user?.fullName?.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="user-info">
                <p className="user-name">{user?.fullName}</p>
                <p className="user-account">••• {user?.accountNumber?.slice(-4)}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ⏻
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
