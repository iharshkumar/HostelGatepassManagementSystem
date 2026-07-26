import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = '#6366f1' }) => {
  return (
    <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}20`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Icon && <Icon size={24} />}
      </div>
      <div>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f8fafc' }}>{value}</h3>
      </div>
    </div>
  );
};
