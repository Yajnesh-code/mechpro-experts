import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Upload, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../common/Badges';
import Modal from '../common/Modal';
import ErrorState from '../common/ErrorState';
import { useLeads } from '../../hooks/useLeads';
import { useToast } from '../common/Toast';
import { generateInvoice, updateLeadStatus, uploadQuote } from '../../services/api';
import { Lead, LeadStatus } from '../../types';
import { formatDate, formatCurrency, timeAgo } from '../../utils';
import { ALL_STATUSES } from '../../data/mockData';

const SERVICE_STATUSES: LeadStatus[] = [
  'Car Received', 'Inspection Started', 'Inspection Completed',
  'Quote Shared', 'Work Started', 'Work Completed', 'Bill Generated'
];

export default function ServiceJobView() {
  const { leads, error, refetch } = useLeads();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>('Car Received');
  const [statusNote, setStatusNote] = useState('');
  const [quoteAmount, setQuoteAmount] = useState('');
  const [quoteNote, setQuoteNote] = useState('');
  const [billAmount, setBillAmount] = useState('');

  // Filter leads assigned to this service partner (sv1 for demo)
  const assignedLeads = leads.filter(l => l.assignedServicePartner?.id === 'sv1');

  const handleUpdateStatus = async () => {
    if (!selectedLead) return;
    try {
      await updateLeadStatus(selectedLead.id, newStatus, statusNote);
      showToast('Status updated successfully', 'success');
      setShowStatusModal(false);
      setStatusNote('');
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Status update failed', 'error');
    }
  };

  const handleUploadQuote = async () => {
    if (!selectedLead || !quoteAmount) return;
    const amt = parseFloat(quoteAmount);
    try {
      await uploadQuote(selectedLead.id, amt, [{ description: quoteNote || 'Service Charges', amount: amt }]);
      showToast('Quote uploaded successfully', 'success');
      setShowQuoteModal(false);
      setQuoteAmount('');
      setQuoteNote('');
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Quote upload failed', 'error');
    }
  };

  const handleUploadBill = async () => {
    if (!selectedLead || !billAmount) return;
    const amt = parseFloat(billAmount);
    const gst = Math.round(amt * 0.18);
    try {
      await generateInvoice(selectedLead.id, amt, gst);
      showToast('Bill generated successfully', 'success');
      setShowBillModal(false);
      setBillAmount('');
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Bill generation failed', 'error');
    }
  };

  const stats = [
    { label: 'Assigned Jobs', value: assignedLeads.length, color: 'var(--purple-500)' },
    { label: 'In Progress', value: assignedLeads.filter(l => ['Car Received', 'Inspection Started', 'Work Started'].includes(l.status)).length, color: 'var(--warning)' },
    { label: 'Completed', value: assignedLeads.filter(l => l.status === 'Vehicle Delivered').length, color: 'var(--success)' },
    { label: 'Pending Quote', value: assignedLeads.filter(l => l.status === 'Inspection Completed').length, color: 'var(--danger)' },
  ];

  return (
    <AppLayout context="Service Partner" title="Assigned Jobs">
      {error && <ErrorState message={error} onRetry={refetch} />}
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">All Assigned Jobs</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Lead ID</th>
                <th>Customer & Vehicle</th>
                <th>Services</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignedLeads.length === 0 ? (
                <tr><td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon"><Clock size={24} /></div>
                    <div className="empty-title">No jobs assigned</div>
                    <div className="empty-desc">Jobs assigned by admin will appear here</div>
                  </div>
                </td></tr>
              ) : assignedLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--purple-700)', fontSize: 13 }}>{lead.leadId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{lead.customer.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{lead.vehicle.brand} {lead.vehicle.model} · {lead.vehicle.number}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {lead.services.slice(0, 2).map(s => <span key={s} className="badge badge-purple" style={{ fontSize: 10 }}>{s}</span>)}
                      {lead.services.length > 2 && <span className="badge badge-gray" style={{ fontSize: 10 }}>+{lead.services.length - 2}</span>}
                    </div>
                  </td>
                  <td><StatusBadge status={lead.status} /></td>
                  <td><PriorityBadge priority={lead.priority} /></td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{timeAgo(lead.updatedAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" title="View Details" onClick={() => navigate(`/service/jobs/${lead.id}`)}>
                        <Eye size={14} />
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedLead(lead); setNewStatus(lead.status); setShowStatusModal(true); }}>
                        <CheckCircle2 size={13} /> Update
                      </button>
                      {lead.status === 'Inspection Completed' && !lead.quote && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedLead(lead); setShowQuoteModal(true); }}>
                          <FileText size={13} /> Quote
                        </button>
                      )}
                      {lead.status === 'Work Completed' && !lead.bill && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSelectedLead(lead); setShowBillModal(true); }}>
                          <FileText size={13} /> Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={`Update Status — ${selectedLead?.leadId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleUpdateStatus}><CheckCircle2 size={14} /> Update Status</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">New Status <span className="required">*</span></label>
          <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value as LeadStatus)}>
            {SERVICE_STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Notes / Remarks</label>
          <textarea className="form-textarea" rows={3} placeholder="Add details about this status update..." value={statusNote} onChange={e => setStatusNote(e.target.value)} />
        </div>
      </Modal>

      {/* Upload Quote Modal */}
      <Modal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title={`Upload Quote — ${selectedLead?.leadId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowQuoteModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!quoteAmount} onClick={handleUploadQuote}><FileText size={14} /> Submit Quote</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Quote Amount (₹) <span className="required">*</span></label>
          <input className="form-input" type="number" placeholder="e.g. 35000" value={quoteAmount} onChange={e => setQuoteAmount(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Description / Breakdown</label>
          <textarea className="form-textarea" rows={3} placeholder="Describe the work to be done and cost breakdown..." value={quoteNote} onChange={e => setQuoteNote(e.target.value)} />
        </div>
        <div className="upload-zone" style={{ marginTop: 4 }}>
          <div className="upload-zone-icon"><Upload size={20} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>Attach Quote PDF (optional)</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF up to 5MB</div>
        </div>
      </Modal>

      {/* Upload Bill Modal */}
      <Modal
        open={showBillModal}
        onClose={() => setShowBillModal(false)}
        title={`Generate Bill — ${selectedLead?.leadId}`}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowBillModal(false)}>Cancel</button>
            <button className="btn btn-primary" disabled={!billAmount} onClick={handleUploadBill}><FileText size={14} /> Generate Bill</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Bill Amount (₹, before GST) <span className="required">*</span></label>
          <input className="form-input" type="number" placeholder="e.g. 35000" value={billAmount} onChange={e => setBillAmount(e.target.value)} />
        </div>
        {billAmount && (
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['Amount', `₹${parseInt(billAmount).toLocaleString('en-IN')}`],
                ['GST (18%)', `₹${Math.round(parseInt(billAmount) * 0.18).toLocaleString('en-IN')}`],
                ['Total Payable', `₹${Math.round(parseInt(billAmount) * 1.18).toLocaleString('en-IN')}`],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: k === 'Total Payable' ? 700 : 500, color: k === 'Total Payable' ? 'var(--purple-700)' : 'var(--navy)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="upload-zone">
          <div className="upload-zone-icon"><Upload size={20} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>Attach Bill PDF (optional)</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>PDF up to 5MB</div>
        </div>
      </Modal>
    </AppLayout>
  );
}
