import React, { useState } from 'react';
import { Search, Car, MapPin, Phone, Mail, FileText, CheckCircle2, Clock, Download, Star } from 'lucide-react';
import { Lead } from '../../types';
import { StatusBadge } from '../common/Badges';
import Timeline from '../common/Timeline';
import { formatDate, formatCurrency } from '../../utils';
import { ALL_STATUSES } from '../../data/mockData';
import { getLeadById } from '../../services/api';
import { useLeads } from '../../hooks/useLeads';

export default function CustomerTrackingPortal() {
  const { leads } = useLeads();
  const [searchId, setSearchId] = useState('');
  const [foundLead, setFoundLead] = useState<Lead | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('status');

  const customerLead = leads[0];

  const handleSearch = async () => {
    const query = searchId.trim();
    if (!query) return;
    setLoading(true);
    try {
      const lead = await getLeadById(query);
      setFoundLead(lead);
      setNotFound(false);
    } catch {
      const fallback = leads.find(l => l.leadId.toLowerCase() === query.toLowerCase() || l.id === query);
      if (fallback) { setFoundLead(fallback); setNotFound(false); }
      else { setFoundLead(null); setNotFound(true); }
    } finally {
      setLoading(false);
    }
  };

  const displayLead = foundLead || customerLead;

  const completedCount = displayLead ? ALL_STATUSES.filter((_, i) => i <= ALL_STATUSES.indexOf(displayLead.status)).length : 0;
  const progressPct = displayLead ? Math.round((completedCount / ALL_STATUSES.length) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        background: 'var(--grad-primary)',
        padding: '40px 24px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 50%)' }} />
        <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
            <div className="logo-mark" style={{ width: 36, height: 36, fontSize: 13 }}>ME</div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'rgba(255,255,255,0.9)' }}>MechPro Experts</span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 6, fontFamily: 'var(--font-display)' }}>Track Your Vehicle</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, marginBottom: 28 }}>Real-time updates on your vehicle service status</p>

          <div style={{
            display: 'flex', gap: 10, background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
            padding: '6px 6px 6px 16px', borderRadius: 100, border: '1.5px solid rgba(255,255,255,0.25)',
            maxWidth: 440, margin: '0 auto',
          }}>
            <input
              style={{ flex: 1, background: 'transparent', color: 'white', fontSize: 15, outline: 'none', border: 'none' }}
              placeholder="Enter Lead ID (e.g. ME0001BR01)"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              style={{ padding: '9px 20px', borderRadius: 100, background: 'white', color: 'var(--purple-700)', fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={14} /> {loading ? 'Tracking...' : 'Track'}
            </button>
          </div>
          {notFound && <p style={{ color: 'rgba(255,200,200,1)', fontSize: 13, marginTop: 10 }}>Lead ID not found. Please check and try again.</p>}
        </div>
      </div>

      {/* Content */}
      {displayLead && (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
          {/* Lead Header Card */}
          <div className="tracking-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--navy)', letterSpacing: 0.5 }}>{displayLead.leadId}</span>
                  <StatusBadge status={displayLead.status} />
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Submitted on {formatDate(displayLead.createdAt)}</div>
              </div>
              {displayLead.assignedServicePartner && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Service Partner</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{displayLead.assignedServicePartner.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📍 {displayLead.assignedServicePartner.location}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>⭐ {displayLead.assignedServicePartner.rating} · {displayLead.assignedServicePartner.mobile}</div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Overall Progress</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--purple-600)' }}>{progressPct}%</span>
              </div>
              <div style={{ height: 8, background: 'var(--purple-100)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--grad-primary)',
                  borderRadius: 100,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* Vehicle info strip */}
            <div style={{ display: 'flex', gap: 20, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)', marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Car size={14} color="var(--purple-500)" />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{displayLead.vehicle.brand} {displayLead.vehicle.model}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'monospace', letterSpacing: 1, fontWeight: 600 }}>{displayLead.vehicle.number}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>🛡️ {displayLead.vehicle.insuranceCompany}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {displayLead.services.map(s => <span key={s} className="badge badge-purple" style={{ fontSize: 10 }}>{s}</span>)}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {[
              { id: 'status', label: 'Live Status' },
              { id: 'timeline', label: 'Timeline' },
              { id: 'quote', label: 'Quote & Bill' },
              { id: 'contact', label: 'Contact' },
            ].map(tab => (
              <div key={tab.id} className={`tab ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.label}
              </div>
            ))}
          </div>

          {/* Status Tab: milestone grid */}
          {activeTab === 'status' && (
            <div className="tracking-card">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Service Milestones</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                {ALL_STATUSES.map((status, i) => {
                  const currentIdx = ALL_STATUSES.indexOf(displayLead.status);
                  const isDone = i < currentIdx;
                  const isCurrent = i === currentIdx;
                  const isPending = i > currentIdx;
                  return (
                    <div key={status} style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${isCurrent ? 'var(--purple-400)' : isDone ? 'var(--purple-200)' : 'var(--purple-100)'}`,
                      background: isCurrent ? 'var(--purple-50)' : isDone ? 'rgba(139,92,246,0.04)' : 'white',
                      opacity: isPending ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: isDone ? 'var(--grad-primary)' : isCurrent ? 'var(--purple-100)' : 'var(--purple-50)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {isDone ? (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : isCurrent ? (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--grad-primary)' }} />
                          ) : (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple-200)' }} />
                          )}
                        </div>
                        <span style={{ fontSize: 12, fontWeight: isCurrent ? 700 : 600, color: isCurrent ? 'var(--purple-700)' : isDone ? 'var(--navy)' : 'var(--text-muted)' }}>
                          {status}
                        </span>
                      </div>
                      {isCurrent && (
                        <div style={{ fontSize: 10, color: 'var(--purple-600)', fontWeight: 600, background: 'var(--purple-100)', borderRadius: 100, padding: '2px 8px', display: 'inline-block' }}>
                          Current Stage
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="tracking-card">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Detailed Timeline</h3>
              <Timeline events={displayLead.timeline} />
            </div>
          )}

          {activeTab === 'quote' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {displayLead.quote ? (
                <div className="tracking-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Service Quote</h3>
                    <span className={`badge ${displayLead.quote.status === 'Approved' ? 'badge-green' : displayLead.quote.status === 'Rejected' ? 'badge-red' : 'badge-yellow'}`}>
                      {displayLead.quote.status}
                    </span>
                  </div>
                  {displayLead.quote.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < displayLead.quote!.items.length - 1 ? '1px solid var(--purple-50)' : 'none' }}>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.description}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', marginTop: 8, background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Estimate</span>
                    <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--purple-700)' }}>{formatCurrency(displayLead.quote.amount)}</span>
                  </div>
                  {displayLead.quote.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                      <button className="btn btn-primary" style={{ flex: 1 }}><CheckCircle2 size={15} /> Approve Quote</button>
                      <button className="btn btn-danger" style={{ flex: 1 }}>Reject Quote</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="tracking-card" style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="empty-icon" style={{ margin: '0 auto 12px' }}><FileText size={24} /></div>
                  <div className="empty-title">No Quote Yet</div>
                  <div className="empty-desc">The service partner will share a quote after inspection</div>
                </div>
              )}

              {displayLead.bill && (
                <div className="tracking-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Final Invoice</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span className={`badge ${displayLead.bill.status === 'Paid' ? 'badge-green' : 'badge-red'}`}>{displayLead.bill.status}</span>
                      <button className="btn btn-secondary btn-sm"><Download size={13} /> Download</button>
                    </div>
                  </div>
                  {displayLead.bill.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--purple-50)' }}>
                      <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.description}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy)' }}>{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 8, padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      ['Subtotal', formatCurrency(displayLead.bill.amount)],
                      ['GST (18%)', formatCurrency(displayLead.bill.gst)],
                    ].map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{k}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid var(--purple-100)' }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy)' }}>Total Paid</span>
                      <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--purple-700)' }}>{formatCurrency(displayLead.bill.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="tracking-card">
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 20 }}>Support & Contact</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { title: 'MechPro Support', sub: 'Platform helpdesk', phone: '1800-123-4567', email: 'support@mechpro.in', icon: '🎧' },
                  ...(displayLead.assignedServicePartner ? [{
                    title: displayLead.assignedServicePartner.name,
                    sub: displayLead.assignedServicePartner.type,
                    phone: displayLead.assignedServicePartner.mobile,
                    email: displayLead.assignedServicePartner.email,
                    icon: '🔧',
                  }] : []),
                ].map(contact => (
                  <div key={contact.title} style={{ padding: '18px', border: '1.5px solid var(--purple-100)', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{contact.icon}</div>
                    <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 2 }}>{contact.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{contact.sub}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <a href={`tel:${contact.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--purple-700)', fontWeight: 600 }}>
                        <Phone size={13} /> {contact.phone}
                      </a>
                      <a href={`mailto:${contact.email}`} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--purple-700)', fontWeight: 600 }}>
                        <Mail size={13} /> {contact.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
