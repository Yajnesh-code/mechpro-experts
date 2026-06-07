import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { UserRole } from '../../types';
import { mockCurrentUser, mockSalesUser, mockServiceUser, mockCustomerUser } from '../../data/mockData';

const ROLES = [
  { role: 'admin' as UserRole, user: mockCurrentUser, label: 'Admin', sub: 'Full platform control', color: '#8b5cf6', bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', path: '/admin', icon: '⚙️' },
  { role: 'sales' as UserRole, user: mockSalesUser, label: 'Sales Partner', sub: 'Broker — Rahul Sharma', color: '#3b82f6', bg: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', path: '/sales', icon: '📊' },
  { role: 'service' as UserRole, user: mockServiceUser, label: 'Service Partner', sub: 'AutoSpark Workshop', color: '#10b981', bg: 'linear-gradient(135deg, #10b981, #3b82f6)', path: '/service', icon: '🔧' },
  { role: 'customer' as UserRole, user: mockCustomerUser, label: 'Customer Portal', sub: 'Track your vehicle', color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', path: '/customer', icon: '🚗' },
];

export default function RoleSwitcher() {
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const enter = (item: typeof ROLES[0]) => {
    setCurrentUser(item.user);
    navigate(item.path);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'white', boxShadow: '0 8px 28px rgba(139,92,246,0.4)' }}>ME</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>MechPro Experts</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Phase 2 — Lead Management System Demo</p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Select a role to enter the platform</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {ROLES.map(item => (
            <div
              key={item.role}
              onClick={() => enter(item)}
              style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1.5px solid var(--purple-100)',
                padding: '28px 24px',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--purple-300)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-sm)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--purple-100)';
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 14, boxShadow: `0 6px 20px ${item.color}40` }}>
                {item.icon}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.sub}</div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: item.color }}>
                Enter <span>→</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'var(--text-muted)' }}>
          Phase 2 · Lead Management System · All data is mock/demo
        </div>
      </div>
    </div>
  );
}
