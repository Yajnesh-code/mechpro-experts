import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronUp, ChevronDown, Eye, ArrowUpDown } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import SkeletonRow from '../common/SkeletonRow';
import ErrorState from '../common/ErrorState';
import { useLeads } from '../../hooks/useLeads';
import { LeadStatus, Priority } from '../../types';
import { formatDate } from '../../utils';

const STATUSES: LeadStatus[] = ['Lead Created', 'Assigned', 'Car Received', 'Inspection Started', 'Inspection Completed', 'Quote Shared', 'Quote Approved', 'Work Started', 'Work Completed', 'Bill Generated', 'Payment Done', 'Vehicle Delivered'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const PAGE_SIZE = 7;

type SortKey = 'leadId' | 'customer' | 'vehicle' | 'partner' | 'status' | 'priority' | 'createdAt';

export default function LeadListing({ role = 'admin' }: { role?: string }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const { leads, loading, error, refetch } = useLeads();

  const basePath = role === 'admin' ? '/admin' : role === 'sales' ? '/sales' : '/service';

  const filtered = useMemo(() => {
    return leads
      .filter(l => {
        const q = search.toLowerCase();
        const matchSearch = !q ||
          l.leadId.toLowerCase().includes(q) ||
          l.customer.name.toLowerCase().includes(q) ||
          l.vehicle.number.toLowerCase().includes(q) ||
          l.vehicle.brand.toLowerCase().includes(q) ||
          l.salesPartner.name.toLowerCase().includes(q);
        const matchStatus = !filterStatus || l.status === filterStatus;
        const matchPriority = !filterPriority || l.priority === filterPriority;
        return matchSearch && matchStatus && matchPriority;
      })
      .sort((a, b) => {
        let va: string = '', vb: string = '';
        if (sortKey === 'leadId') { va = a.leadId; vb = b.leadId; }
        else if (sortKey === 'customer') { va = a.customer.name; vb = b.customer.name; }
        else if (sortKey === 'vehicle') { va = a.vehicle.number; vb = b.vehicle.number; }
        else if (sortKey === 'partner') { va = a.salesPartner.name; vb = b.salesPartner.name; }
        else if (sortKey === 'status') { va = a.status; vb = b.status; }
        else if (sortKey === 'priority') { va = a.priority; vb = b.priority; }
        else if (sortKey === 'createdAt') { va = a.createdAt; vb = b.createdAt; }
        return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [leads, search, filterStatus, filterPriority, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : <ArrowUpDown size={11} style={{ opacity: 0.4 }} />;

  return (
    <AppLayout
      context="Lead Management"
      title="All Leads"
      actions={
        <button className="btn btn-primary btn-sm" onClick={() => navigate(`${basePath}/leads/new`)}>
          <Plus size={15} /> New Lead
        </button>
      }
    >
      <div className="card">
        {/* Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1.5px solid var(--purple-50)', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ width: 280 }}>
            <Search size={14} color="var(--text-muted)" />
            <input placeholder="Search lead ID, customer, vehicle..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 140 }} value={filterPriority} onChange={e => { setFilterPriority(e.target.value); setPage(1); }}>
            <option value="">All Priorities</option>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{filtered.length} leads found</span>
          {(filterStatus || filterPriority || search) && (
            <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterStatus(''); setFilterPriority(''); }}>
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {([
                  ['leadId', 'Lead ID'],
                  ['customer', 'Customer'],
                  ['vehicle', 'Vehicle'],
                  ['partner', 'Partner'],
                  ['status', 'Status'],
                  ['priority', 'Priority'],
                  ['createdAt', 'Date'],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th key={k} onClick={() => handleSort(k)} style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{label} <SortIcon k={k} /></div>
                  </th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRow columns={8} rows={PAGE_SIZE} />
              ) : error ? (
                <tr>
                  <td colSpan={8}><ErrorState message={error} onRetry={refetch} /></td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-icon"><Search size={24} /></div>
                      <div className="empty-title">No leads found</div>
                      <div className="empty-desc">Try adjusting your search or filters</div>
                    </div>
                  </td>
                </tr>
              ) : paginated.map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`${basePath}/leads/${lead.id}`)}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: 'var(--purple-700)', letterSpacing: 0.5 }}>{lead.leadId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{lead.customer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.customer.mobile}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{lead.vehicle.brand} {lead.vehicle.model}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: 0.5 }}>{lead.vehicle.number}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{lead.salesPartner.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.salesPartner.typeName}</div>
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><PriorityBadge priority={lead.priority} /></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(lead.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`${basePath}/leads/${lead.id}`)}>
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--purple-50)' }}>
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
