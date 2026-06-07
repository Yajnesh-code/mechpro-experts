import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Wrench, Clock, CheckCircle2 } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import ErrorState from '../common/ErrorState';
import { useLeads } from '../../hooks/useLeads';
import { timeAgo, formatCurrency } from '../../utils';

export default function ServiceDashboard() {
  const { leads, error, refetch } = useLeads();
  const navigate = useNavigate();

  if (error) {
    return (
      <AppLayout context="Service Partner" title="Workshop Dashboard">
        <ErrorState message={error} onRetry={refetch} />
      </AppLayout>
    );
  }
  const assignedLeads = leads.filter(l => l.assignedServicePartner?.id === 'sv1');
  const urgent = assignedLeads.filter(l => l.priority === 'Urgent');
  const pending = assignedLeads.filter(l => !['Vehicle Delivered', 'Payment Done', 'Bill Generated'].includes(l.status));
  const earned = assignedLeads.filter(l => l.bill?.status === 'Paid').reduce((s, l) => s + (l.bill?.total || 0), 0);

  return (
    <AppLayout context="Service Partner" title="Workshop Dashboard">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Assigned', value: assignedLeads.length, icon: <Wrench size={16} />, color: 'var(--purple-500)' },
          { label: 'Active Jobs', value: pending.length, icon: <Clock size={16} />, color: 'var(--warning)' },
          { label: 'Urgent', value: urgent.length, icon: <CheckCircle2 size={16} />, color: 'var(--danger)' },
          { label: 'Earned (MTD)', value: earned > 0 ? formatCurrency(earned) : '₹4.2L', icon: <TrendingUp size={16} />, color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: 22 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Active Jobs</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/service/jobs')}>All Jobs</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Lead ID</th><th>Customer</th><th>Vehicle</th><th>Status</th><th>Priority</th><th>Updated</th></tr>
            </thead>
            <tbody>
              {assignedLeads.slice(0, 5).map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/service/jobs/${lead.id}`)}>
                  <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--purple-700)', fontSize: 13 }}>{lead.leadId}</span></td>
                  <td><div style={{ fontWeight: 600 }}>{lead.customer.name}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.customer.mobile}</div></td>
                  <td><div style={{ fontWeight: 500 }}>{lead.vehicle.brand} {lead.vehicle.model}</div><div style={{ fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)' }}>{lead.vehicle.number}</div></td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><PriorityBadge priority={lead.priority} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(lead.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
