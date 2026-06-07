import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Car, Wrench, Upload, CheckCircle2, ChevronRight, ChevronLeft, X, Plus } from 'lucide-react';
import AppLayout from '../layout/AppLayout';
import { useApp } from '../../hooks/useApp';
import { ServiceType, FuelType, Priority } from '../../types';
import { createLead, uploadDocument } from '../../services/api';
import { useToast } from '../common/Toast';

const STEPS = ['Customer Info', 'Vehicle Info', 'Service Info', 'Documents'];
const SERVICE_TYPES: ServiceType[] = ['Accident Repair', 'Inspection', 'Survey', 'Towing', 'Alpha Go', 'Breakdown Assistance', 'Part Procurement'];
const FUEL_TYPES: FuelType[] = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];
const INSURANCE_COMPANIES = ['HDFC ERGO', 'Bajaj Allianz', 'ICICI Lombard', 'New India Assurance', 'Tata AIG', 'United India Insurance', 'Oriental Insurance', 'Royal Sundaram', 'National Insurance', 'Star Health'];

interface FormData {
  name: string; mobile: string; email: string; address: string;
  vehicleNumber: string; brand: string; model: string; fuelType: FuelType; insuranceCompany: string; year: string; color: string;
  services: ServiceType[]; priority: Priority; location: string; notes: string;
  files: File[];
}

const defaultForm: FormData = {
  name: '', mobile: '', email: '', address: '',
  vehicleNumber: '', brand: '', model: '', fuelType: 'Petrol', insuranceCompany: '', year: '', color: '',
  services: [], priority: 'Medium', location: '', notes: '',
  files: [],
};

export default function LeadCreateForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(defaultForm);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [generatedId, setGeneratedId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const { addLead } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const set = (key: keyof FormData, value: any) => setForm(f => ({ ...f, [key]: value }));

  const toggleService = (s: ServiceType) => {
    set('services', form.services.includes(s) ? form.services.filter(x => x !== s) : [...form.services, s]);
  };

  const validate = (s: number) => {
    const e: any = {};
    if (s === 0) {
      if (!form.name.trim()) e.name = 'Required';
      if (!form.mobile.match(/^\d{10}$/)) e.mobile = 'Enter valid 10-digit mobile';
      if (!form.email.includes('@')) e.email = 'Enter valid email';
      if (!form.address.trim()) e.address = 'Required';
    }
    if (s === 1) {
      if (!form.vehicleNumber.trim()) e.vehicleNumber = 'Required';
      if (!form.brand.trim()) e.brand = 'Required';
      if (!form.model.trim()) e.model = 'Required';
      if (!form.insuranceCompany) e.insuranceCompany = 'Required';
    }
    if (s === 2) {
      if (form.services.length === 0) e.services = 'Select at least one service';
      if (!form.location.trim()) e.location = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!validate(3)) return;
    setSubmitting(true);
    setApiError('');
    try {
      const newLead = await createLead(form);
      for (const file of form.files) {
        await uploadDocument(newLead.id, file, 'VEHICLE_PHOTO');
      }
      addLead(newLead);
      setGeneratedId(newLead.leadId);
      setSubmitted(true);
      showToast('Lead created successfully', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Lead creation failed';
      setApiError(message);
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <AppLayout context="Lead Management" title="Create Lead">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 8px 32px rgba(139,92,246,0.4)' }}>
              <CheckCircle2 size={40} color="white" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>Lead Created Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>Your lead has been submitted for admin review.</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--purple-100)', borderRadius: 12, padding: '12px 24px', marginBottom: 28 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>LEAD ID</span>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--purple-700)', letterSpacing: 1 }}>{generatedId}</span>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setStep(0); setForm(defaultForm); }}>Create Another</button>
              <button className="btn btn-primary" onClick={() => navigate('/sales/leads')}>View All Leads</button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout context="Lead Management" title="Create New Lead">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        {/* Stepper */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <div className="stepper">
              {STEPS.map((s, i) => (
                <div key={s} className={`step ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                  <div className="step-circle">
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className="step-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {step === 0 && <User size={18} color="var(--purple-500)" />}
              {step === 1 && <Car size={18} color="var(--purple-500)" />}
              {step === 2 && <Wrench size={18} color="var(--purple-500)" />}
              {step === 3 && <Upload size={18} color="var(--purple-500)" />}
              <span className="card-title">{STEPS[step]}</span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Step {step + 1} of {STEPS.length}</span>
          </div>
          <div className="card-body">

            {/* Step 0: Customer Info */}
            {step === 0 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span className="required">*</span></label>
                    <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Arjun Kapoor" value={form.name} onChange={e => set('name', e.target.value)} />
                    {errors.name && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Mobile Number <span className="required">*</span></label>
                    <input className={`form-input ${errors.mobile ? 'error' : ''}`} placeholder="10-digit mobile" value={form.mobile} onChange={e => set('mobile', e.target.value)} maxLength={10} />
                    {errors.mobile && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.mobile}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address <span className="required">*</span></label>
                  <input className={`form-input ${errors.email ? 'error' : ''}`} placeholder="customer@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
                  {errors.email && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Address <span className="required">*</span></label>
                  <textarea className={`form-textarea ${errors.address ? 'error' : ''}`} placeholder="Full address with city and pincode" value={form.address} onChange={e => set('address', e.target.value)} rows={3} />
                  {errors.address && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.address}</div>}
                </div>
              </>
            )}

            {/* Step 1: Vehicle Info */}
            {step === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vehicle Number <span className="required">*</span></label>
                    <input className="form-input" placeholder="e.g. MH02AB1234" value={form.vehicleNumber} onChange={e => set('vehicleNumber', e.target.value.toUpperCase())} />
                    {errors.vehicleNumber && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.vehicleNumber}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year of Manufacture</label>
                    <input className="form-input" placeholder="e.g. 2022" value={form.year} onChange={e => set('year', e.target.value)} type="number" min={2000} max={2025} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Brand <span className="required">*</span></label>
                    <input className="form-input" placeholder="e.g. Maruti Suzuki" value={form.brand} onChange={e => set('brand', e.target.value)} />
                    {errors.brand && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.brand}</div>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Model <span className="required">*</span></label>
                    <input className="form-input" placeholder="e.g. Swift" value={form.model} onChange={e => set('model', e.target.value)} />
                    {errors.model && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.model}</div>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fuel Type</label>
                    <select className="form-select" value={form.fuelType} onChange={e => set('fuelType', e.target.value as FuelType)}>
                      {FUEL_TYPES.map(f => <option key={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input className="form-input" placeholder="e.g. Red" value={form.color} onChange={e => set('color', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Insurance Company <span className="required">*</span></label>
                  <select className="form-select" value={form.insuranceCompany} onChange={e => set('insuranceCompany', e.target.value)}>
                    <option value="">Select insurance company</option>
                    {INSURANCE_COMPANIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.insuranceCompany && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.insuranceCompany}</div>}
                </div>
              </>
            )}

            {/* Step 2: Service Info */}
            {step === 2 && (
              <>
                <div className="form-group">
                  <label className="form-label">Services Required <span className="required">*</span></label>
                  <div className="checkbox-group">
                    {SERVICE_TYPES.map(s => (
                      <label key={s} className={`checkbox-item ${form.services.includes(s) ? 'checked' : ''}`}>
                        <input type="checkbox" checked={form.services.includes(s)} onChange={() => toggleService(s)} />
                        {form.services.includes(s) && <CheckCircle2 size={14} color="var(--purple-600)" />}
                        {s}
                      </label>
                    ))}
                  </div>
                  {errors.services && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 6 }}>{errors.services}</div>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={form.priority} onChange={e => set('priority', e.target.value as Priority)}>
                      {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Service Location <span className="required">*</span></label>
                    <input className="form-input" placeholder="e.g. Andheri West, Mumbai" value={form.location} onChange={e => set('location', e.target.value)} />
                    {errors.location && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 4 }}>{errors.location}</div>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes / Additional Information</label>
                  <textarea className="form-textarea" placeholder="Describe the issue, damage, or any special instructions..." value={form.notes} onChange={e => set('notes', e.target.value)} rows={4} />
                </div>
              </>
            )}

            {/* Step 3: Documents */}
            {step === 3 && (
              <>
                <div className="form-group">
                  <label className="form-label">Upload Documents</label>
                  <div className="upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
                    <div className="upload-zone-icon"><Upload size={24} /></div>
                    <div style={{ fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>Click to upload or drag & drop</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>RC Copy, Vehicle Images, Insurance Documents</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PDF, JPG, PNG up to 10MB each</div>
                    <input id="file-upload" type="file" multiple accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => set('files', [...form.files, ...Array.from(e.target.files || [])])} />
                  </div>
                </div>
                {form.files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {form.files.map((file, i) => (
                      <div key={i} className="doc-card">
                        <div className="doc-icon"><Upload size={16} /></div>
                        <div className="doc-info">
                          <div className="doc-name">{file.name}</div>
                          <div className="doc-meta">{(file.size / 1024).toFixed(0)} KB</div>
                        </div>
                        <button className="icon-btn btn-sm" onClick={() => set('files', form.files.filter((_, j) => j !== i))}>
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <div style={{ marginTop: 24, padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--purple-100)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>Lead Summary</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                    {[
                      ['Customer', form.name || '-'],
                      ['Mobile', form.mobile || '-'],
                      ['Vehicle', form.vehicleNumber ? `${form.brand} ${form.model} (${form.vehicleNumber})` : '-'],
                      ['Insurance', form.insuranceCompany || '-'],
                      ['Services', form.services.join(', ') || '-'],
                      ['Priority', form.priority],
                      ['Location', form.location || '-'],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{k}</div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', marginTop: 2 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer" style={{ padding: '16px 24px' }}>
            {apiError && <div style={{ color: 'var(--danger)', fontSize: 13, fontWeight: 600, marginRight: 12 }}>{apiError}</div>}
            {step > 0 && (
              <button className="btn btn-secondary" onClick={back}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {step < STEPS.length - 1 ? (
              <button className="btn btn-primary" onClick={next}>
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                <CheckCircle2 size={16} /> {submitting ? 'Submitting...' : 'Submit Lead'}
              </button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
