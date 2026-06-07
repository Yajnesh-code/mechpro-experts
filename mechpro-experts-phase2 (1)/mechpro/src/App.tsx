import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './hooks/useApp';
import { ToastProvider } from './components/common/Toast';
import './styles/globals.css';

// Common
import RoleSwitcher from './components/common/RoleSwitcher';

// Admin
import AdminDashboard from './components/admin/AdminDashboard';

// Sales
import SalesDashboard from './components/sales/SalesDashboard';

// Service
import ServiceDashboard from './components/service/ServiceDashboard';
import ServiceJobView from './components/service/ServiceJobView';

// Leads (shared)
import LeadListing from './components/leads/LeadListing';
import LeadDetail from './components/leads/LeadDetail';
import LeadCreateForm from './components/leads/LeadCreateForm';

// Customer
import CustomerTrackingPortal from './components/customer/CustomerTrackingPortal';

// Placeholder for pages not yet built
const Placeholder = ({ title }: { title: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🚧</div>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--navy)', marginBottom: 6 }}>{title}</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Coming in the next phase</p>
    </div>
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <BrowserRouter>
          <Routes>
          {/* Landing / Role Switcher */}
          <Route path="/" element={<RoleSwitcher />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/leads" element={<LeadListing role="admin" />} />
          <Route path="/admin/leads/new" element={<LeadCreateForm />} />
          <Route path="/admin/leads/:id" element={<LeadDetail role="admin" />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/partners" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<AdminDashboard />} />
          <Route path="/admin/billing" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />

          {/* Sales Routes */}
          <Route path="/sales" element={<SalesDashboard />} />
          <Route path="/sales/leads" element={<LeadListing role="sales" />} />
          <Route path="/sales/leads/new" element={<LeadCreateForm />} />
          <Route path="/sales/leads/:id" element={<LeadDetail role="sales" />} />
          <Route path="/sales/reports" element={<SalesDashboard />} />
          <Route path="/sales/settings" element={<SalesDashboard />} />

          {/* Service Routes */}
          <Route path="/service" element={<ServiceDashboard />} />
          <Route path="/service/jobs" element={<ServiceJobView />} />
          <Route path="/service/jobs/:id" element={<LeadDetail role="service" />} />
          <Route path="/service/reports" element={<ServiceDashboard />} />
          <Route path="/service/settings" element={<ServiceDashboard />} />

          {/* Customer Routes */}
          <Route path="/customer" element={<CustomerTrackingPortal />} />
          <Route path="/customer/track" element={<CustomerTrackingPortal />} />
          <Route path="/customer/docs" element={<CustomerTrackingPortal />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ToastProvider>
  );
}
