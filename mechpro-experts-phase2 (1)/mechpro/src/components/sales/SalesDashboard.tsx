import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, FileText, Clock } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import ErrorState from '../common/ErrorState';
import { useLeads } from '../../hooks/useLeads';
import { formatDate, timeAgo } from '../../utils';

export default function SalesDashboard() {
  const { leads, error, refetch } = useLeads();
  const navigate = useNavigate();

  if (error) {
    return (
      <AppLayout context="Sales Partner" title="Sales Dashboard">
        <ErrorState message={error} onRetry={refetch} />
      </AppLayout>
    );
  }

  // Demo: show leads from BR partner
  const myLeads = leads.filter(l => l.salesPartner.id === 'sp1');
  const active = myLeads.filter(l => !['Vehicle Delivered', 'Payment Done'].includes(l.status));
  const completed = myLeads.filter(l => l.status === 'Vehicle Delivered').length;

  return (
    <AppLayout
      context="Sales Partner"
      title="Sales Dashboard"
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/sales/leads/new')}>
          <Plus size={15} /> Create Lead
        </button>
      }
    >
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'My Total Leads', value: myLeads.length, change: '+8.2%', pos: true },
          { label: 'Active', value: active.length, change: '+2', pos: true },
          { label: 'Completed', value: completed, change: '+5', pos: true },
          { label: 'Commission (Est.)', value: '₹18,400', change: '+12%', pos: true },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ fontSize: 26 }}>{s.value}</div>
            <div className={`stat-change ${s.pos ? 'positive' : 'negative'}`}><TrendingUp size={11} style={{ display: 'inline', marginRight: 3 }} />{s.change}</div>
          </div>
        ))}
      </div>

      {/* Partner Code Info */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)', boxShadow: '0 6px 20px rgba(139,92,246,0.35)' }}>BR</div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>Your Partner Code</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--navy)', letterSpacing: 1 }}>BR01</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Leads generated: <span style={{ color: 'var(--purple-600)', fontWeight: 600 }}>ME****BR01</span></div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Partner Type</div>
              <span className="badge badge-purple">Broker</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">My Recent Leads</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/sales/leads')}>View All</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th><th>Customer</th><th>Vehicle</th><th>Service</th><th>Status</th><th>Priority</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {myLeads.slice(0, 6).map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/sales/leads/${lead.id}`)}>
                  <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--purple-700)', fontSize: 13 }}>{lead.leadId}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{lead.customer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.customer.mobile}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.vehicle.brand} {lead.vehicle.model}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{lead.vehicle.number}</div>
                  </td>
                  <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{lead.serviceType}</span></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><PriorityBadge priority={lead.priority} /></td>
                  <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{formatDate(lead.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
