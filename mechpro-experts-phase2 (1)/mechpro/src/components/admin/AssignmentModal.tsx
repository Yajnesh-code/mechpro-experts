import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import { Lead } from '../../types';
import { useApp } from '../../hooks/useApp';
import { usePartners } from '../../hooks/usePartners';
import { assignLead } from '../../services/api';
import { useToast } from '../common/Toast';

interface AssignmentModalProps {
  lead: Lead;
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

export default function AssignmentModal({ lead, open, onClose, onAssigned }: AssignmentModalProps) {
  const { updateLead } = useApp();
  const { partners, loading, error } = usePartners();
  const { showToast } = useToast();
  const [selectedPartner, setSelectedPartner] = useState<string>(lead.assignedServicePartner?.id || '');
  const [notes, setNotes] = useState('');
  const [assigned, setAssigned] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    const partner = partners.find(p => p.id === selectedPartner);
    if (!partner) return;
    setSaving(true);
    try {
      const updated = await assignLead(lead.id, selectedPartner, notes);
      updateLead(updated);
      setAssigned(true);
      showToast(`Lead assigned to ${partner.name}`, 'success');
      onAssigned?.();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Assignment failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTypeColor = (type: string) => {
    const m: Record<string, string> = { Workshop: 'badge-purple', PartVendor: 'badge-blue', Towing: 'badge-yellow', AlphaGo: 'badge-pink', Battery: 'badge-green', Tyre: 'badge-gray' };
    return m[type] || 'badge-gray';
  };

  if (assigned) {
    const partner = partners.find(p => p.id === selectedPartner)!;
    return (
      <Modal open={open} onClose={() => { setAssigned(false); onClose(); }} title="Assignment Complete"
        footer={<button className="btn btn-primary" onClick={() => { setAssigned(false); onClose(); }}>Done</button>}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 6px 24px rgba(139,92,246,0.35)' }}>
            <CheckCircle2 size={32} color="white" />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Lead Assigned Successfully</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            <strong>{lead.leadId}</strong> has been assigned to <strong>{partner.name}</strong>
          </p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Assign Lead — ${lead.leadId}`}
      size="lg"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAssign} disabled={!selectedPartner || saving}>
            <CheckCircle2 size={15} /> {saving ? 'Assigning...' : 'Assign Partner'}
          </button>
        </>
      }
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Lead Details</div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer</div><div style={{ fontWeight: 600 }}>{lead.customer.name}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Vehicle</div><div style={{ fontWeight: 600 }}>{lead.vehicle.brand} {lead.vehicle.model} · {lead.vehicle.number}</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Services</div><div style={{ fontWeight: 600 }}>{lead.services.join(', ')}</div></div>
          </div>
        </div>

        <label className="form-label">Select Service Partner <span className="required">*</span></label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 340, overflowY: 'auto' }}>
          {loading && <div className="empty-state"><div className="empty-title">Loading service partners...</div></div>}
          {error && <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600 }}>{error}</div>}
          {!loading && !error && partners.map(partner => (
            <div
              key={partner.id}
              onClick={() => setSelectedPartner(partner.id)}
              style={{
                padding: '14px 16px',
                border: `2px solid ${selectedPartner === partner.id ? 'var(--purple-400)' : 'var(--purple-100)'}`,
                borderRadius: 'var(--radius-md)',
                background: selectedPartner === partner.id ? 'var(--purple-50)' : 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: selectedPartner === partner.id ? 'var(--grad-primary)' : 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: selectedPartner === partner.id ? 'white' : 'var(--purple-500)' }}>
                  {partner.name.charAt(0)}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: 'var(--navy)', fontSize: 14 }}>{partner.name}</span>
                  <span className={`badge ${getTypeColor(partner.type)}`} style={{ fontSize: 10 }}>{partner.type}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  📍 {partner.location} · ⭐ {partner.rating} · {partner.totalJobsCompleted} jobs completed
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  {partner.specializations.slice(0, 3).join(' · ')}
                </div>
              </div>
              {selectedPartner === partner.id && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label className="form-label">Assignment Notes (Optional)</label>
        <textarea className="form-textarea" rows={3} placeholder="Add any special instructions or notes for the service partner..." value={notes} onChange={e => setNotes(e.target.value)} />
      </div>
    </Modal>
  );
}
