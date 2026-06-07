import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Car, Wrench, FileText, Clock, Edit, CheckCircle2, Download, Plus } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import Timeline from '../common/Timeline';
import AssignmentModal from '../admin/AssignmentModal';
import ErrorState from '../common/ErrorState';
import { useLead } from '../../hooks/useLead';
import { formatDate, formatDateTime, formatCurrency, timeAgo } from '../../utils';

export default function LeadDetail({ role = 'admin' }: { role?: string }) {
  const { id } = useParams<{ id: string }>();
  const { lead, loading, error, refetch } = useLead(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssign, setShowAssign] = useState(false);

  const basePath = role === 'admin' ? '/admin' : role === 'sales' ? '/sales' : '/service';
  const listPath = role === 'service' ? '/service/jobs' : `${basePath}/leads`;

  if (loading) {
    return (
      <AppLayout context="Lead Management" title="Loading Lead">
        <div className="card"><div className="card-body">Loading lead details...</div></div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout context="Lead Management" title="Lead Error">
        <ErrorState message={error} onRetry={refetch} />
      </AppLayout>
    );
  }

  if (!lead) {
    return (
      <AppLayout context="Lead Management" title="Lead Not Found">
        <div className="empty-state">
          <div className="empty-title">Lead not found</div>
          <button className="btn btn-primary" onClick={() => navigate(listPath)}>Back to Leads</button>
        </div>
      </AppLayout>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <User size={14} /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={14} /> },
    { id: 'documents', label: `Documents (${lead.documents.length})`, icon: <FileText size={14} /> },
    { id: 'activity', label: 'Activity Log', icon: <Clock size={14} /> },
    ...(lead.quote ? [{ id: 'billing', label: 'Billing', icon: <CheckCircle2 size={14} /> }] : []),
  ];

  return (
    <AppLayout
      context="Lead Management"
      title={lead.leadId}
      actions={
        role === 'admin' ? (
          <button className="btn btn-primary btn-sm" onClick={() => setShowAssign(true)}>
            <Edit size={14} /> {lead.assignedServicePartner ? 'Reassign' : 'Assign Partner'}
          </button>
        ) : undefined
      }
    >
      {/* Back */}
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => navigate(listPath)}>
        <ArrowLeft size={15} /> Back to Leads
      </button>

      {/* Header card */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--navy)' }}>{lead.leadId}</span>
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                📅 Created {formatDate(lead.createdAt)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                🔄 Updated {timeAgo(lead.updatedAt)}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                📍 {lead.location}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {lead.services.map(s => (
              <span key={s} className="badge badge-purple">{s}</span>
            ))}
          </div>
        </div>
        {/* Mini stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1.5px solid var(--purple-50)' }}>
          {[
            ['Sales Partner', lead.salesPartner.name, lead.salesPartner.typeName],
            ['Service Partner', lead.assignedServicePartner?.name || 'Not Assigned', lead.assignedServicePartner?.type || '—'],
            ['Quote Amount', lead.quote ? formatCurrency(lead.quote.amount) : '—', lead.quote?.status || ''],
            ['Bill Amount', lead.bill ? formatCurrency(lead.bill.total) : '—', lead.bill?.status || ''],
          ].map(([label, value, sub]) => (
            <div key={label as string} style={{ padding: '14px 20px', borderRight: '1px solid var(--purple-50)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{value}</div>
              {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(tab => (
          <div key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>{tab.icon}{tab.label}</span>
          </div>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Customer */}
          <div className="card">
            <div className="card-header"><span className="card-title">Customer Information</span></div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div className="avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                  {lead.customer.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--navy)' }}>{lead.customer.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{lead.customer.email}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Mobile', lead.customer.mobile],
                  ['Email', lead.customer.email],
                  ['Address', lead.customer.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="info-key">{k}</div>
                    <div className="info-val" style={{ fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vehicle */}
          <div className="card">
            <div className="card-header"><span className="card-title">Vehicle Information</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 16, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 700, letterSpacing: 2, color: 'var(--navy)' }}>{lead.vehicle.number}</div>
              </div>
              <div className="info-row">
                {[
                  ['Brand', lead.vehicle.brand],
                  ['Model', lead.vehicle.model],
                  ['Fuel Type', lead.vehicle.fuelType],
                  ['Year', lead.vehicle.year?.toString() || '—'],
                  ['Color', lead.vehicle.color || '—'],
                  ['Insurance', lead.vehicle.insuranceCompany],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="info-key">{k}</div>
                    <div className="info-val" style={{ fontSize: 13 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="card">
            <div className="card-header"><span className="card-title">Service Information</span></div>
            <div className="card-body">
              <div style={{ marginBottom: 12 }}>
                <div className="info-key">Services Requested</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {lead.services.map(s => <span key={s} className="badge badge-purple">{s}</span>)}
                </div>
              </div>
              {[
                ['Priority', lead.priority],
                ['Location', lead.location],
                ...(lead.notes ? [['Notes', lead.notes]] : []),
                ...(lead.estimatedCompletion ? [['Est. Completion', formatDate(lead.estimatedCompletion)]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ marginBottom: 10 }}>
                  <div className="info-key">{k}</div>
                  <div className="info-val" style={{ fontSize: 13 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Assignment</span>
              {role === 'admin' && (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowAssign(true)}>
                  {lead.assignedServicePartner ? 'Reassign' : 'Assign'}
                </button>
              )}
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                <div className="info-key" style={{ marginBottom: 8 }}>Sales Partner</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="avatar" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>
                    {lead.salesPartner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.salesPartner.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.salesPartner.company} · {lead.salesPartner.typeName}</div>
                  </div>
                </div>
              </div>
              <div>
                <div className="info-key" style={{ marginBottom: 8 }}>Service Partner</div>
                {lead.assignedServicePartner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                      {lead.assignedServicePartner.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{lead.assignedServicePartner.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.assignedServicePartner.type} · {lead.assignedServicePartner.location}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {lead.assignedServicePartner.rating}</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '14px', background: 'var(--warning-bg)', borderRadius: 'var(--radius-sm)', color: '#92400e', fontSize: 13 }}>
                    ⚠️ No service partner assigned yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Lead Status Timeline</span></div>
          <div className="card-body">
            <Timeline events={lead.timeline} />
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Documents</span>
            <button className="btn btn-secondary btn-sm"><Plus size={14} /> Upload</button>
          </div>
          <div className="card-body">
            {lead.documents.length === 0 ? (
              <div className="empty-state"><div className="empty-title">No documents</div><div className="empty-desc">No documents uploaded yet</div></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lead.documents.map(doc => (
                  <div key={doc.id} className="doc-card">
                    <div className="doc-icon"><FileText size={16} /></div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.name}</div>
                      <div className="doc-meta">{doc.type} · {doc.size} · Uploaded by {doc.uploadedBy} · {formatDate(doc.uploadedAt)}</div>
                    </div>
                    <button className="btn btn-ghost btn-sm"><Download size={14} /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'activity' && (
        <div className="card">
          <div className="card-header"><span className="card-title">Activity Log</span></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {lead.activityLog.map((item, i) => (
                <div key={item.id} className="activity-item">
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: 20, flexShrink: 0 }}>
                    <div className="activity-dot" />
                    {i < lead.activityLog.length - 1 && (
                      <div style={{ flex: 1, width: 2, background: 'var(--purple-100)', minHeight: 20, margin: '4px 0' }} />
                    )}
                  </div>
                  <div className="activity-content" style={{ paddingBottom: i < lead.activityLog.length - 1 ? 16 : 0 }}>
                    <div className="activity-action">{item.action}</div>
                    <div className="activity-meta">
                      {item.performedBy} · <span className="badge badge-gray" style={{ fontSize: 10, padding: '1px 6px' }}>{item.role}</span> · {formatDateTime(item.timestamp)}
                    </div>
                    {item.notes && <div className="timeline-note" style={{ marginTop: 6 }}>{item.notes}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && lead.quote && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quote</span>
              <span className={`badge ${lead.quote.status === 'Approved' ? 'badge-green' : lead.quote.status === 'Rejected' ? 'badge-red' : 'badge-yellow'}`}>{lead.quote.status}</span>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: 16 }}>
                {lead.quote.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < lead.quote!.items.length - 1 ? '1px solid var(--purple-50)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.description}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--purple-100)' }}>
                <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--purple-700)' }}>{formatCurrency(lead.quote.amount)}</span>
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>Created {formatDate(lead.quote.createdAt)}</div>
            </div>
          </div>
          {lead.bill && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">Bill / Invoice</span>
                <span className={`badge ${lead.bill.status === 'Paid' ? 'badge-green' : 'badge-red'}`}>{lead.bill.status}</span>
              </div>
              <div className="card-body">
                <div style={{ marginBottom: 16 }}>
                  {lead.bill.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < lead.bill!.items.length - 1 ? '1px solid var(--purple-50)' : 'none' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.description}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1.5px solid var(--purple-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Subtotal</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(lead.bill.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>GST (18%)</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(lead.bill.gst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--purple-100)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Payable</span>
                    <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--purple-700)' }}>{formatCurrency(lead.bill.total)}</span>
                  </div>
                </div>
                {lead.bill.paidAt && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--success)' }}>✓ Paid on {formatDate(lead.bill.paidAt)}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      <AssignmentModal lead={lead} open={showAssign} onClose={() => setShowAssign(false)} onAssigned={refetch} />
    </AppLayout>
  );
}
