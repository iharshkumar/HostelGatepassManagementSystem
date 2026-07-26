import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Shield, KeyRound, Building2 } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <nav
      style={{
        background: 'rgba(30, 41, 59, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        sticky: 'top',
        top: 0,
        zIndex: 50,
      }}
    >
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
          }}
        >
          🎓
        </div>
        <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#f8fafc' }}>
          Hostel Gatepass System
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
            }}
          >
            {user.fullName}
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '2px 8px',
              borderRadius: '999px',
              fontWeight: 600,
              background: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.2)' : user.role === 'Warden' ? 'rgba(245, 158, 11, 0.2)' : user.role === 'Security Guard' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
              color: user.role === 'Admin' ? '#f87171' : user.role === 'Warden' ? '#fbbf24' : user.role === 'Security Guard' ? '#34d399' : '#818cf8',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {user.role}
          </span>
        </div>

        <Link
          to="/profile"
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          <User size={16} /> Profile
        </Link>

        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: '#f87171' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};
