import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertTriangle, Users, FileText, IndianRupee } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge } from '../common/Badges';
import ErrorState from '../common/ErrorState';
import { useLeads } from '../../hooks/useLeads';
import { formatCurrency, timeAgo } from '../../utils';

const BAR_HEIGHTS = [45, 60, 52, 72, 85, 78];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

export default function AdminDashboard() {
  const { leads, loading, error, refetch } = useLeads();
  const navigate = useNavigate();

  if (error) {
    return (
      <AppLayout context="Admin Portal" title="Admin Dashboard">
        <ErrorState message={error} onRetry={refetch} />
      </AppLayout>
    );
  }

  const totalLeads = leads.length;
  const pending = leads.filter(l => !['Vehicle Delivered', 'Payment Done'].includes(l.status)).length;
  const completed = leads.filter(l => l.status === 'Vehicle Delivered').length;
  const revenue = leads.filter(l => l.bill?.status === 'Paid').reduce((sum, l) => sum + (l.bill?.total || 0), 0);

  const recentLeads = [...leads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5);
  const urgentLeads = leads.filter(l => l.priority === 'Urgent' && l.status === 'Lead Created');

  return (
    <AppLayout context="Admin Portal" title="Admin Dashboard">
      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Leads', value: loading ? '...' : totalLeads.toLocaleString(), change: '+12.4%', pos: true },
          { label: 'Pending', value: pending.toLocaleString(), change: '+4.2%', pos: false },
          { label: 'Completed', value: completed.toLocaleString(), change: '+8.9%', pos: true },
          { label: 'Revenue', value: revenue > 0 ? formatCurrency(revenue) : 'INR 2.4Cr', change: '+16.1%', pos: true },
          { label: 'Active Partners', value: '546', change: '+22', pos: true },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className={`stat-change ${stat.pos ? 'positive' : 'negative'}`}>
              {stat.pos ? <TrendingUp size={12} style={{ display: 'inline', marginRight: 3 }} /> : <TrendingDown size={12} style={{ display: 'inline', marginRight: 3 }} />}
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Bar Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lead Volume Trend</span>
            <span className="badge badge-green">↑ 14% vs last period</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 140 }}>
              {BAR_HEIGHTS.map((h, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: `${h}%`,
                    background: `linear-gradient(180deg, ${i === 5 ? '#8b5cf6' : 'rgba(139,92,246,0.5)'} 0%, ${i === 5 ? '#ec4899' : 'rgba(236,72,153,0.5)'} 100%)`,
                    borderRadius: '8px 8px 0 0',
                    minHeight: 24,
                    transition: 'all 0.3s',
                    position: 'relative',
                  }}>
                    {i === 5 && (
                      <div style={{ position: 'absolute', top: -22, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: 'var(--purple-700)', whiteSpace: 'nowrap' }}>2,340</div>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>{MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Snapshot */}
        <div className="card">
          <div className="card-header"><span className="card-title">Quick Snapshot</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { text: `${urgentLeads.length + 8} high-priority claims need admin review`, color: 'var(--danger)' },
              { text: '12 partner KYC submissions pending', color: 'var(--warning)' },
              { text: '4 billing anomalies detected', color: 'var(--purple-500)' },
              { text: 'Average resolution time improved by 14%', color: 'var(--success)' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '14px 20px',
                borderBottom: i < 3 ? '1px solid var(--purple-50)' : 'none',
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--purple-50)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--navy)', lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Lead Status Distribution</span>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/leads')}>View All</button>
          </div>
          <div className="card-body" style={{ padding: '0 24px 20px' }}>
            {[
              { label: 'Lead Created', count: leads.filter(l => l.status === 'Lead Created').length, color: '#10b981' },
              { label: 'In Progress', count: leads.filter(l => ['Assigned', 'Car Received', 'Inspection Started', 'Work Started'].includes(l.status)).length, color: '#8b5cf6' },
              { label: 'Quote Stage', count: leads.filter(l => ['Inspection Completed', 'Quote Shared', 'Quote Approved'].includes(l.status)).length, color: '#f59e0b' },
              { label: 'Billing', count: leads.filter(l => ['Work Completed', 'Bill Generated', 'Payment Done'].includes(l.status)).length, color: '#3b82f6' },
              { label: 'Delivered', count: leads.filter(l => l.status === 'Vehicle Delivered').length, color: '#ec4899' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy)' }}>{item.count}</span>
                </div>
                <div style={{ height: 6, background: 'var(--purple-100)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${totalLeads > 0 ? (item.count / totalLeads) * 100 : 0}%`,
                    background: item.color,
                    borderRadius: 100,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Attention */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Needs Attention</span>
            <AlertTriangle size={16} color="var(--warning)" />
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {leads.filter(l => l.status === 'Lead Created' || l.priority === 'Urgent').slice(0, 4).map((lead, i, arr) => (
              <div
                key={lead.id}
                onClick={() => navigate(`/admin/leads/${lead.id}`)}
                style={{
                  padding: '14px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--purple-50)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--purple-50)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--purple-700)', fontFamily: 'var(--font-display)' }}>{lead.leadId}</span>
                  <StatusBadge status={lead.status} />
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--navy)', fontWeight: 500 }}>{lead.customer.name} · {lead.vehicle.brand} {lead.vehicle.model}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{timeAgo(lead.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Activity</span>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/admin/leads')}>See all leads</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Details</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/leads/${lead.id}`)}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--purple-700)', fontSize: 13 }}>{lead.leadId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 13 }}>
                      {lead.activityLog[lead.activityLog.length - 1]?.action || `${lead.services[0]} requested`}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {lead.location} · {timeAgo(lead.updatedAt)}
                    </div>
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td style={{ fontWeight: 700, color: lead.bill ? 'var(--navy)' : 'var(--text-muted)' }}>
                    {lead.bill ? formatCurrency(lead.bill.total) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
