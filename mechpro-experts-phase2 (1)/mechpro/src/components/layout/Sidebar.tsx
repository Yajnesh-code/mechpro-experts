import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Briefcase, BarChart3, Receipt, Settings, FileText, Wrench, Car, LogOut } from 'lucide-react';
import { UserRole } from '../../types';
import { getInitials } from '../../utils';
import { useApp } from '../../hooks/useApp';

interface NavItem { label: string; icon: React.ReactNode; path: string; }

const adminNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/admin' },
  { label: 'Leads', icon: <FileText size={16} />, path: '/admin/leads' },
  { label: 'Users', icon: <Users size={16} />, path: '/admin/users' },
  { label: 'Partners', icon: <Briefcase size={16} />, path: '/admin/partners' },
  { label: 'Reports', icon: <BarChart3 size={16} />, path: '/admin/reports' },
  { label: 'Billing', icon: <Receipt size={16} />, path: '/admin/billing' },
  { label: 'Settings', icon: <Settings size={16} />, path: '/admin/settings' },
];

const salesNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/sales' },
  { label: 'My Leads', icon: <FileText size={16} />, path: '/sales/leads' },
  { label: 'Create Lead', icon: <FileText size={16} />, path: '/sales/leads/new' },
  { label: 'Reports', icon: <BarChart3 size={16} />, path: '/sales/reports' },
  { label: 'Settings', icon: <Settings size={16} />, path: '/sales/settings' },
];

const serviceNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard size={16} />, path: '/service' },
  { label: 'Assigned Jobs', icon: <Wrench size={16} />, path: '/service/jobs' },
  { label: 'Reports', icon: <BarChart3 size={16} />, path: '/service/reports' },
  { label: 'Settings', icon: <Settings size={16} />, path: '/service/settings' },
];

const customerNav: NavItem[] = [
  { label: 'My Vehicle', icon: <Car size={16} />, path: '/customer' },
  { label: 'Track Status', icon: <FileText size={16} />, path: '/customer/track' },
  { label: 'Documents', icon: <FileText size={16} />, path: '/customer/docs' },
];

const navMap: Record<UserRole, NavItem[]> = {
  admin: adminNav, sales: salesNav, service: serviceNav, customer: customerNav,
};

export default function Sidebar() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = navMap[currentUser.role];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">ME</div>
        <div className="logo-text">
          <span className="logo-name">MechPro Experts</span>
          <span className="logo-sub">Enterprise Portal</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/admin' && item.path !== '/sales' && item.path !== '/service' && item.path !== '/customer' && location.pathname.startsWith(item.path));
          return (
            <div
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="avatar">{getInitials(currentUser.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{currentUser.role}</div>
        </div>
        <button className="icon-btn" title="Logout" onClick={() => navigate('/')}>
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
}
