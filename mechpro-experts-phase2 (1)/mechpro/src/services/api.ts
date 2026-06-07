import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';
import { ActivityLog, Bill, Document, FuelType, Lead, LeadStatus, Priority, Quote, SalesPartner, ServicePartner, ServicePartnerType, ServiceType, TimelineEvent, UserRole } from '../types';

export type LeadFilters = { status?: string; priority?: string; search?: string; page?: number; limit?: number };
export type AmountItem = { description: string; amount: number };

type ApiUser = { id: string; contact_person?: string; name?: string; email: string; phone?: string; mobile?: string; company_name?: string; companyName?: string; role?: string; city?: string; servicePartnerType?: string; serviceCategories?: string[]; salesPartnerType?: string; vendorCode?: string };
type ApiDocument = { id: string; name: string; type: string; path?: string; url?: string; createdAt?: string; uploadedAt?: string; uploadedBy?: ApiUser | string; size?: number | string };
type ApiTimeline = { id?: string; status: string; title?: string; notes?: string | null; performedBy?: ApiUser | null; createdAt?: string; timestamp?: string | null; isCompleted?: boolean; isCurrent?: boolean };
type ApiQuote = { id: string; amount: number | string; items: AmountItem[]; status: string; createdAt: string; approvedAt?: string | null };
type ApiInvoice = { id: string; amount: number | string; gst: number | string; total: number | string; items: AmountItem[]; status: string; createdAt: string; paidAt?: string | null };
type ApiLead = { id: string; leadCode?: string; leadId?: string; customerName?: string; customerEmail?: string; customerMobile?: string; customerAddress?: string; vehicleNumber?: string; vehicleBrand?: string; vehicleModel?: string; fuelType?: string | null; vehicleYear?: number | null; vehicleColor?: string | null; insuranceCompany?: string | null; serviceType?: string; services?: string[]; priority?: string; status?: string; location?: string; notes?: string | null; salesPartner?: ApiUser; assignedServicePartner?: ApiUser | null; documents?: ApiDocument[]; timeline?: ApiTimeline[]; activityLog?: ActivityLog[]; quotations?: ApiQuote[]; quote?: ApiQuote; invoices?: ApiInvoice[]; bill?: ApiInvoice; createdAt: string; updatedAt: string; estimatedCompletion?: string | null };

const statusFromApi: Record<string, LeadStatus> = { LEAD_CREATED: 'Lead Created', ASSIGNED: 'Assigned', CAR_RECEIVED: 'Car Received', INSPECTION_STARTED: 'Inspection Started', INSPECTION_COMPLETED: 'Inspection Completed', QUOTE_SHARED: 'Quote Shared', QUOTE_APPROVED: 'Quote Approved', WORK_STARTED: 'Work Started', WORK_COMPLETED: 'Work Completed', BILL_GENERATED: 'Bill Generated', PAYMENT_DONE: 'Payment Done', VEHICLE_DELIVERED: 'Vehicle Delivered' };
const statusToApi: Record<string, string> = Object.fromEntries(Object.entries(statusFromApi).map(([apiStatus, uiStatus]) => [uiStatus, apiStatus]));
const priorityFromApi: Record<string, Priority> = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', URGENT: 'Urgent' };
const priorityToApi: Record<string, string> = { Low: 'LOW', Medium: 'MEDIUM', High: 'HIGH', Urgent: 'URGENT' };
const fuelFromApi: Record<string, FuelType> = { PETROL: 'Petrol', DIESEL: 'Diesel', CNG: 'CNG', ELECTRIC: 'Electric', HYBRID: 'Hybrid' };
const fuelToApi: Record<string, string> = { Petrol: 'PETROL', Diesel: 'DIESEL', CNG: 'CNG', Electric: 'ELECTRIC', Hybrid: 'HYBRID' };

export const ALL_STATUSES: LeadStatus[] = ['Lead Created', 'Assigned', 'Car Received', 'Inspection Started', 'Inspection Completed', 'Quote Shared', 'Quote Approved', 'Work Started', 'Work Completed', 'Bill Generated', 'Payment Done', 'Vehicle Delivered'];

export const api = axios.create({ baseURL: API_URL, timeout: 20000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mp_token') || localStorage.getItem('mechpro_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mp_token');
      localStorage.removeItem('mp_user');
      localStorage.removeItem('mechpro_access_token');
      localStorage.removeItem('mechpro_refresh_token');
      if (!window.location.pathname.includes('/login')) window.location.assign('/login');
    }
    const message = error.response?.data?.message || error.response?.data?.detail || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

function asNumber(value: number | string | undefined | null) { return typeof value === 'number' ? value : Number(value || 0); }
function mapRole(role?: string): UserRole { const r = (role || '').toLowerCase(); if (r.includes('admin')) return 'admin'; if (r.includes('service') || r.includes('workshop')) return 'service'; if (r.includes('customer')) return 'customer'; return 'sales'; }
function mapServiceType(type?: string): ServicePartnerType { if (type === 'PART_VENDOR') return 'PartVendor'; if (type === 'TOWING_SERVICE') return 'Towing'; if (type === 'ALPHA_GO') return 'AlphaGo'; return (type as ServicePartnerType) || 'Workshop'; }

export function mapServicePartner(user: ApiUser): ServicePartner {
  return { id: user.id, name: user.contact_person || user.name || user.company_name || 'Service Partner', type: mapServiceType(user.servicePartnerType || user.role), email: user.email, mobile: user.phone || user.mobile || '', location: user.city || '', rating: 4.7, status: 'Active', specializations: user.serviceCategories || ['Workshop'], joinedAt: new Date().toISOString(), totalJobsCompleted: 0 };
}

function mapSalesPartner(user?: ApiUser): SalesPartner {
  return { id: user?.id || 'sales-partner', code: (user?.salesPartnerType as SalesPartner['code']) || 'BR', sequenceNo: user?.vendorCode?.slice(-2) || '01', name: user?.contact_person || user?.name || 'Sales Partner', company: user?.company_name || user?.companyName || 'MechPro Partner', email: user?.email || '', mobile: user?.phone || user?.mobile || '', type: (user?.salesPartnerType as SalesPartner['type']) || 'BR', typeName: user?.salesPartnerType || 'Broker', region: user?.city || '', status: 'Active', joinedAt: new Date().toISOString(), totalLeads: 0 };
}

function mapDocument(document: ApiDocument): Document {
  const uploadedBy = typeof document.uploadedBy === 'string' ? document.uploadedBy : document.uploadedBy?.contact_person || document.uploadedBy?.name || 'MechPro User';
  return { id: document.id, name: document.name, type: document.type === 'RC_DOCUMENT' ? 'RC Copy' : document.type === 'VEHICLE_PHOTO' ? 'Vehicle Image' : document.type === 'QUOTE_DOCUMENT' ? 'Quote' : document.type === 'INVOICE_DOCUMENT' ? 'Bill' : 'Other', url: document.url || document.path || '#', uploadedAt: document.createdAt || document.uploadedAt || new Date().toISOString(), uploadedBy, size: typeof document.size === 'number' ? `${Math.round(document.size / 1024)} KB` : document.size };
}

function mapTimeline(timeline: ApiTimeline[] = [], currentStatus: LeadStatus): TimelineEvent[] {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);
  if (timeline.length === 0) return ALL_STATUSES.map((status, index) => ({ status, timestamp: index <= currentIndex ? new Date().toISOString() : null, performedBy: index <= currentIndex ? 'MechPro Experts' : null, isCompleted: index < currentIndex, isCurrent: index === currentIndex }));
  return timeline.map((item) => { const status = statusFromApi[item.status] || item.status as LeadStatus; const index = ALL_STATUSES.indexOf(status); return { status, timestamp: item.createdAt || item.timestamp || null, performedBy: item.performedBy?.contact_person || item.performedBy?.name || null, notes: item.notes || undefined, isCompleted: item.isCompleted ?? index < currentIndex, isCurrent: item.isCurrent ?? index === currentIndex }; });
}

function mapQuote(quote?: ApiQuote): Quote | undefined { if (!quote) return undefined; return { id: quote.id, amount: asNumber(quote.amount), items: quote.items || [], createdAt: quote.createdAt, approvedAt: quote.approvedAt || undefined, status: quote.status === 'APPROVED' ? 'Approved' : quote.status === 'REJECTED' ? 'Rejected' : 'Pending' }; }
function mapInvoice(invoice?: ApiInvoice): Bill | undefined { if (!invoice) return undefined; return { id: invoice.id, amount: asNumber(invoice.amount), gst: asNumber(invoice.gst), total: asNumber(invoice.total), items: invoice.items || [], createdAt: invoice.createdAt, paidAt: invoice.paidAt || undefined, status: invoice.status === 'PAID' ? 'Paid' : 'Unpaid' }; }

export function mapLead(raw: ApiLead): Lead {
  const status = statusFromApi[raw.status || ''] || raw.status as LeadStatus || 'Lead Created';
  return { id: raw.id, leadId: raw.leadCode || raw.leadId || raw.id, customer: { id: raw.id, name: raw.customerName || 'Customer', mobile: raw.customerMobile || '', email: raw.customerEmail || '', address: raw.customerAddress || '' }, vehicle: { number: raw.vehicleNumber || '', brand: raw.vehicleBrand || '', model: raw.vehicleModel || '', fuelType: raw.fuelType ? fuelFromApi[raw.fuelType] || raw.fuelType as FuelType : 'Petrol', insuranceCompany: raw.insuranceCompany || '', year: raw.vehicleYear || undefined, color: raw.vehicleColor || undefined }, serviceType: (raw.serviceType || raw.services?.[0] || 'Inspection') as ServiceType, services: (raw.services || [raw.serviceType || 'Inspection']) as ServiceType[], priority: raw.priority ? priorityFromApi[raw.priority] || raw.priority as Priority : 'Medium', status, location: raw.location || '', notes: raw.notes || '', salesPartner: mapSalesPartner(raw.salesPartner), assignedServicePartner: raw.assignedServicePartner ? mapServicePartner(raw.assignedServicePartner) : undefined, documents: (raw.documents || []).map(mapDocument), activityLog: raw.activityLog || (raw.timeline || []).map((item, index) => ({ id: item.id || `${raw.id}-activity-${index}`, action: item.title || statusFromApi[item.status] || item.status, performedBy: item.performedBy?.contact_person || item.performedBy?.name || 'MechPro Experts', role: mapRole(item.performedBy?.role), timestamp: item.createdAt || new Date().toISOString(), notes: item.notes || undefined })), timeline: mapTimeline(raw.timeline || [], status), quote: mapQuote(raw.quote || raw.quotations?.[0]), bill: mapInvoice(raw.bill || raw.invoices?.[0]), createdAt: raw.createdAt, updatedAt: raw.updatedAt, estimatedCompletion: raw.estimatedCompletion || undefined };
}

function leadPayload(data: any) {
  return { customerName: data.customerName || data.name, customerEmail: data.customerEmail || data.email, customerMobile: data.customerMobile || data.mobile, customerAddress: data.customerAddress || data.address, vehicleNumber: data.vehicleNumber, vehicleBrand: data.vehicleBrand || data.brand, vehicleModel: data.vehicleModel || data.model, fuelType: data.fuelType ? fuelToApi[data.fuelType] || data.fuelType : undefined, vehicleYear: data.vehicleYear || (data.year ? Number(data.year) : undefined), vehicleColor: data.vehicleColor || data.color, insuranceCompany: data.insuranceCompany, serviceType: data.serviceType || data.services?.[0], services: data.services || [], priority: data.priority ? priorityToApi[data.priority] || data.priority : undefined, location: data.location, notes: data.notes };
}

export async function createLead(data: any): Promise<Lead> { const response = await api.post<ApiLead>('/leads', leadPayload(data)); return mapLead(response.data); }
export async function getLeads(filters: LeadFilters = {}): Promise<{ leads: Lead[]; total: number }> { const response = await api.get<ApiLead[] | { leads: ApiLead[]; total: number }>('/leads', { params: filters }); const rows = Array.isArray(response.data) ? response.data : response.data.leads; let leads = rows.map(mapLead); if (filters.search) { const q = filters.search.toLowerCase(); leads = leads.filter((lead) => lead.leadId.toLowerCase().includes(q) || lead.customer.name.toLowerCase().includes(q) || lead.vehicle.number.toLowerCase().includes(q) || lead.vehicle.brand.toLowerCase().includes(q)); } if (filters.status) leads = leads.filter((lead) => lead.status === filters.status); if (filters.priority) leads = leads.filter((lead) => lead.priority === filters.priority); return { leads, total: Array.isArray(response.data) ? leads.length : response.data.total || leads.length }; }
export async function getLeadById(id: string): Promise<Lead> { const response = await api.get<ApiLead>(`/leads/${id}`); return mapLead(response.data); }
export async function assignLead(id: string, partnerId: string, notes?: string): Promise<Lead> { const response = await api.patch<ApiLead>(`/leads/${id}/assign`, { servicePartnerId: partnerId, notes }); return mapLead(response.data); }
export async function updateLeadStatus(id: string, status: LeadStatus, notes?: string): Promise<Lead> { const response = await api.patch<ApiLead>(`/leads/${id}/status`, { status: statusToApi[status], notes }); return mapLead(response.data); }
export async function uploadQuote(id: string, amount: number, items: AmountItem[], file?: File): Promise<Quote> { const response = await api.post<ApiQuote>(`/leads/${id}/quotes`, { amount, items }); if (file) await uploadDocument(id, file, 'QUOTE_DOCUMENT'); return mapQuote(response.data)!; }
export async function generateInvoice(id: string, amount: number, gst: number): Promise<Bill> { const total = amount + gst; const response = await api.post<ApiInvoice>(`/leads/${id}/invoices`, { amount, gst, total, items: [{ description: 'Service Charges', amount }] }); return mapInvoice(response.data)!; }
export async function uploadDocument(id: string, file: File, type: string): Promise<Document> { const body = new FormData(); body.append('file', file); body.append('type', type); const response = await api.post<ApiDocument>(`/leads/${id}/documents`, body, { headers: { 'Content-Type': 'multipart/form-data' } }); return mapDocument(response.data); }
export async function getPartners(type?: string): Promise<ServicePartner[]> { const response = await api.get<ApiUser[]>('/partners/service-partners', { params: type ? { type } : undefined }); let partners = response.data.map(mapServicePartner); if (type) partners = partners.filter((partner) => partner.type === type); return partners; }
export async function getLeadTimeline(id: string): Promise<TimelineEvent[]> { const lead = await getLeadById(id); return lead.timeline; }
