export type UiLeadStatus =
  | "Lead Created"
  | "Assigned"
  | "Car Received"
  | "Inspection Started"
  | "Inspection Completed"
  | "Quote Shared"
  | "Quote Approved"
  | "Work Started"
  | "Work Completed"
  | "Bill Generated"
  | "Payment Done"
  | "Vehicle Delivered";

export type UiPriority = "Low" | "Medium" | "High" | "Urgent";

export type UiLead = {
  id: string;
  leadId: string;
  customer: { name: string; email: string; mobile: string; address: string };
  vehicle: { number: string; brand: string; model: string; fuelType: string; insuranceCompany: string; year?: number; color?: string };
  services: string[];
  serviceType: string;
  priority: UiPriority;
  status: UiLeadStatus;
  location: string;
  notes: string;
  salesPartner: { id: string; name: string; company: string; typeName: string };
  assignedServicePartner?: UiServicePartner;
  documents: UiDocument[];
  timeline: UiTimelineEvent[];
  quote?: { id: string; amount: number; status: string; items: Array<{ description: string; amount: number }>; createdAt: string };
  quoteHistory: Array<{ id: string; amount: number; status: string; items: Array<{ description: string; amount: number }>; createdAt: string }>;
  bill?: {
    id: string;
    amount: number;
    gst: number;
    total: number;
    status: string;
    items: Array<{ description: string; amount: number }>;
    createdAt: string;
    paymentMode?: string;
    paymentReference?: string;
    paymentNotes?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type UiServicePartner = {
  id: string;
  name: string;
  type: string;
  email: string;
  mobile: string;
  location: string;
  rating: number;
  specializations: string[];
  totalJobsCompleted: number;
};

export type UiDocument = {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size?: string;
  reviewStatus?: string;
  reviewNotes?: string;
  version?: number;
  isCurrent?: boolean;
  replacesDocumentId?: string;
};
export type UiTimelineEvent = { status: UiLeadStatus; timestamp: string | null; performedBy: string | null; notes?: string; isCompleted: boolean; isCurrent: boolean };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const STATUS_FROM_API: Record<string, UiLeadStatus> = {
  LEAD_CREATED: "Lead Created",
  ASSIGNED: "Assigned",
  CAR_RECEIVED: "Car Received",
  INSPECTION_STARTED: "Inspection Started",
  INSPECTION_COMPLETED: "Inspection Completed",
  QUOTE_SHARED: "Quote Shared",
  QUOTE_APPROVED: "Quote Approved",
  WORK_STARTED: "Work Started",
  WORK_COMPLETED: "Work Completed",
  BILL_GENERATED: "Bill Generated",
  PAYMENT_DONE: "Payment Done",
  VEHICLE_DELIVERED: "Vehicle Delivered",
};

export const STATUS_TO_API = Object.fromEntries(Object.entries(STATUS_FROM_API).map(([api, ui]) => [ui, api])) as Record<UiLeadStatus, string>;
export const ALL_STATUSES = Object.values(STATUS_FROM_API);

const PRIORITY_FROM_API: Record<string, UiPriority> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", URGENT: "Urgent" };
const PRIORITY_TO_API: Record<UiPriority, string> = { Low: "LOW", Medium: "MEDIUM", High: "HIGH", Urgent: "URGENT" };
const FUEL_TO_API: Record<string, string> = { Petrol: "PETROL", Diesel: "DIESEL", CNG: "CNG", Electric: "ELECTRIC", Hybrid: "HYBRID" };
const FUEL_FROM_API: Record<string, string> = { PETROL: "Petrol", DIESEL: "Diesel", CNG: "CNG", ELECTRIC: "Electric", HYBRID: "Hybrid" };

type ApiUser = Record<string, any>;
type ApiLead = Record<string, any>;
type ApiDocument = Record<string, any>;

function token() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("mechpro_access_token") ?? localStorage.getItem("mp_token") ?? undefined;
}

function clearExpiredSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("mechpro_auth_session");
  localStorage.removeItem("mechpro_access_token");
  localStorage.removeItem("mechpro_refresh_token");
  localStorage.removeItem("mechpro_user");
  localStorage.removeItem("mp_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) headers.set("Content-Type", "application/json");
  const authToken = token();
  if (authToken) headers.set("Authorization", `Bearer ${authToken}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => ({})) : await response.text();
  if (!response.ok) {
    const message = (data as any)?.message ?? (data as any)?.detail ?? "API request failed";
    if (response.status === 401 || response.status === 403 || /token|unauthorized|forbidden/i.test(String(message))) {
      clearExpiredSession();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?session=expired");
      }
    }
    throw new Error(message);
  }
  return data as T;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value || 0);
}

function servicePartnerType(value?: string) {
  if (value === "PART_VENDOR") return "Part Vendor";
  if (value === "TOWING_SERVICE") return "Towing";
  if (value === "ALPHA_GO") return "Alpha Go";
  return value ? value.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "Workshop";
}

export function mapServicePartner(user: ApiUser): UiServicePartner {
  return {
    id: user.id,
    name: user.contact_person || user.name || user.company_name || user.companyName || "Service Partner",
    type: servicePartnerType(user.servicePartnerType || user.role),
    email: user.email || "",
    mobile: user.phone || user.mobile || "",
    location: user.city || "",
    rating: 4.7,
    specializations: user.serviceCategories || [servicePartnerType(user.servicePartnerType)],
    totalJobsCompleted: user.totalJobsCompleted || 0,
  };
}

function mapTimeline(rawTimeline: any[] = [], currentStatus: UiLeadStatus): UiTimelineEvent[] {
  const currentIndex = ALL_STATUSES.indexOf(currentStatus);
  if (!rawTimeline.length) {
    return ALL_STATUSES.map((status, index) => ({
      status,
      timestamp: index <= currentIndex ? new Date().toISOString() : null,
      performedBy: index <= currentIndex ? "MechPro Experts" : null,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    }));
  }
  return rawTimeline.map((item) => {
    const status = STATUS_FROM_API[item.status] || item.status || "Lead Created";
    const index = ALL_STATUSES.indexOf(status);
    return {
      status,
      timestamp: item.createdAt || item.timestamp || null,
      performedBy: item.performedBy?.contact_person || item.performedBy?.name || null,
      notes: item.notes || undefined,
      isCompleted: index < currentIndex,
      isCurrent: index === currentIndex,
    };
  });
}

function documentUrl(document: Record<string, any>) {
  const rawUrl = document.url || document.path || "#";
  if (typeof rawUrl !== "string") return "#";
  if (rawUrl.startsWith("http") || rawUrl === "#") return rawUrl;
  return `${API_URL}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`;
}

function mapDocument(document: Record<string, any>): UiDocument {
  return {
    id: document.id,
    name: document.name,
    type: document.type || "Other",
    url: documentUrl(document),
    uploadedAt: document.createdAt || document.uploadedAt || new Date().toISOString(),
    uploadedBy: document.uploadedBy?.contact_person || document.uploadedBy?.name || "MechPro User",
    size: typeof document.size === "number" ? `${Math.round(document.size / 1024)} KB` : document.size,
    reviewStatus: document.reviewStatus || "PENDING_REVIEW",
    reviewNotes: document.reviewNotes || undefined,
    version: document.version || 1,
    isCurrent: document.isCurrent ?? true,
    replacesDocumentId: document.replacesDocumentId || undefined,
  };
}

function mapAdminDocument(document: ApiDocument) {
  return {
    ...document,
    url: documentUrl(document),
    path: documentUrl(document),
  };
}

export function mapLead(raw: ApiLead): UiLead {
  const status = STATUS_FROM_API[raw.status] || raw.status || "Lead Created";
  const quoteHistory = (raw.quotations || (raw.quote ? [raw.quote] : [])).map((quote: Record<string, any>) => ({
    id: quote.id,
    amount: asNumber(quote.amount),
    status: quote.status || "Pending",
    items: quote.items || [],
    createdAt: quote.createdAt,
  }));
  return {
    id: raw.id,
    leadId: raw.leadCode || raw.leadId || raw.id,
    customer: {
      name: raw.customerName || "Customer",
      email: raw.customerEmail || "",
      mobile: raw.customerMobile || "",
      address: raw.customerAddress || "",
    },
    vehicle: {
      number: raw.vehicleNumber || "",
      brand: raw.vehicleBrand || "",
      model: raw.vehicleModel || "",
      fuelType: raw.fuelType ? FUEL_FROM_API[raw.fuelType] || raw.fuelType : "Petrol",
      insuranceCompany: raw.insuranceCompany || "",
      year: raw.vehicleYear || undefined,
      color: raw.vehicleColor || undefined,
    },
    services: raw.services || [raw.serviceType || "Inspection"],
    serviceType: raw.serviceType || raw.services?.[0] || "Inspection",
    priority: raw.priority ? PRIORITY_FROM_API[raw.priority] || raw.priority : "Medium",
    status,
    location: raw.location || "",
    notes: raw.notes || "",
    salesPartner: {
      id: raw.salesPartner?.id || "",
      name: raw.salesPartner?.contact_person || raw.salesPartner?.name || "Sales Partner",
      company: raw.salesPartner?.company_name || raw.salesPartner?.companyName || "MechPro Partner",
      typeName: raw.salesPartner?.salesPartnerType || "Broker",
    },
    assignedServicePartner: raw.assignedServicePartner ? mapServicePartner(raw.assignedServicePartner) : undefined,
    documents: (raw.documents || []).map(mapDocument),
    timeline: mapTimeline(raw.timeline || [], status),
    quote: quoteHistory[0],
    quoteHistory,
    bill: raw.bill || raw.invoices?.[0] ? {
      id: (raw.bill || raw.invoices?.[0]).id,
      amount: asNumber((raw.bill || raw.invoices?.[0]).amount),
      gst: asNumber((raw.bill || raw.invoices?.[0]).gst),
      total: asNumber((raw.bill || raw.invoices?.[0]).total),
      status: (raw.bill || raw.invoices?.[0]).status || "Unpaid",
      items: (raw.bill || raw.invoices?.[0]).items || [],
      createdAt: (raw.bill || raw.invoices?.[0]).createdAt,
      paymentMode: (raw.bill || raw.invoices?.[0]).paymentMode || undefined,
      paymentReference: (raw.bill || raw.invoices?.[0]).paymentReference || undefined,
      paymentNotes: (raw.bill || raw.invoices?.[0]).paymentNotes || undefined,
    } : undefined,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

function leadPayload(data: Record<string, any>) {
  return {
    customerName: data.name,
    customerEmail: data.email,
    customerMobile: data.mobile,
    customerAddress: data.address,
    vehicleNumber: data.vehicleNumber,
    vehicleBrand: data.brand,
    vehicleModel: data.model,
    fuelType: data.fuelType ? FUEL_TO_API[data.fuelType] || data.fuelType : undefined,
    vehicleYear: data.year ? Number(data.year) : undefined,
    vehicleColor: data.color,
    insuranceCompany: data.insuranceCompany,
    serviceType: data.services?.[0] || "Inspection",
    services: data.services || [],
    priority: data.priority ? PRIORITY_TO_API[data.priority as UiPriority] || data.priority : undefined,
    location: data.location,
    notes: data.notes,
  };
}

export const operationsApi = {
  async listLeads() {
    const data = await request<ApiLead[]>("/leads");
    return data.map(mapLead);
  },
  async getLead(idOrCode: string) {
    return mapLead(await request<ApiLead>(`/leads/${idOrCode}`));
  },
  async trackCustomerLead(data: { searchType: "REQUEST_ID" | "VEHICLE_NUMBER"; searchValue: string; mobile: string }) {
    return mapLead(await request<ApiLead>("/leads/customer-track", { method: "POST", body: JSON.stringify(data) }));
  },
  async createLead(data: Record<string, any>) {
    return mapLead(await request<ApiLead>("/leads", { method: "POST", body: JSON.stringify(leadPayload(data)) }));
  },
  async createLeadWithDocuments(data: Record<string, any>, documents: Array<{ file: File; type: string }>) {
    const form = new FormData();
    form.append("payload", JSON.stringify(leadPayload(data)));
    form.append("documentTypes", JSON.stringify(documents.map((document) => document.type)));
    documents.forEach((document) => form.append("documents", document.file));
    return mapLead(await request<ApiLead>("/leads/with-documents", { method: "POST", body: form }));
  },
  async assignLead(id: string, servicePartnerId: string, notes?: string) {
    return mapLead(await request<ApiLead>(`/leads/${id}/assign`, { method: "PATCH", body: JSON.stringify({ servicePartnerId, notes }) }));
  },
  async updateStatus(id: string, status: UiLeadStatus, notes?: string) {
    return mapLead(await request<ApiLead>(`/leads/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: STATUS_TO_API[status], notes }) }));
  },
  async createQuote(id: string, amount: number, description: string) {
    return request(`/leads/${id}/quotes`, { method: "POST", body: JSON.stringify({ amount, items: [{ description, amount }] }) });
  },
  async createInvoice(id: string, amount: number) {
    const gst = Math.round(amount * 0.18);
    return request(`/leads/${id}/invoices`, { method: "POST", body: JSON.stringify({ amount, gst, total: amount + gst, items: [{ description: "Service Charges", amount }] }) });
  },
  async decideQuote(leadId: string, quoteId: string, decision: "APPROVED" | "REJECTED" | "REVISION_REQUESTED", notes?: string) {
    return mapLead(await request<ApiLead>(`/leads/${leadId}/quotes/${quoteId}/decision`, { method: "PATCH", body: JSON.stringify({ decision, notes }) }));
  },
  async markInvoicePaid(leadId: string, invoiceId: string, payment?: { paymentMode?: string; paymentReference?: string; paymentNotes?: string }) {
    return request(`/leads/${leadId}/invoices/${invoiceId}/pay`, { method: "PATCH", body: JSON.stringify(payment || {}) });
  },
  async uploadDocument(leadId: string, file: File, type = "OTHER", replacesDocumentId?: string) {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    if (replacesDocumentId) form.append("replacesDocumentId", replacesDocumentId);
    return request(`/leads/${leadId}/documents`, { method: "POST", body: form });
  },
  async listServicePartners() {
    const data = await request<ApiUser[]>("/partners/service-partners");
    return data.map(mapServicePartner);
  },
};

export const adminApi = {
  listUsers: () => request<any[]>("/admin/users"),
  updateUser: (id: string, data: Record<string, unknown>) => request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteUser: (id: string) => request(`/admin/users/${id}`, { method: "DELETE" }),
  listPartners: () => request<any[]>("/admin/partners"),
  documents: async () => (await request<ApiDocument[]>("/admin/documents")).map(mapAdminDocument),
  reviewDocument: (id: string, data: { reviewStatus: string; reviewNotes?: string }) =>
    request(`/admin/documents/${id}/review`, { method: "PATCH", body: JSON.stringify({ status: data.reviewStatus, notes: data.reviewNotes }) }),
  auditLogs: () => request<any[]>("/admin/audit-logs"),
  reports: () => request<any>("/admin/reports/summary"),
  async downloadReport(format: "pdf" | "excel") {
    const authToken = token();
    const response = await fetch(`${API_URL}/admin/reports/export/${format}`, {
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    });
    if (!response.ok) throw new Error("Report export failed");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = format === "pdf" ? "mechpro-report.pdf" : "mechpro-report.xls";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  },
  billing: () => request<any>("/admin/billing/summary"),
  settings: () => request<any>("/admin/settings"),
  notifications: () => request<any[]>("/notifications"),
};

export const notificationsApi = {
  list: (status: "all" | "unread" | "read" = "all") => request<any[]>(`/notifications?status=${status}`),
  markRead: (id: string) => request(`/notifications/${id}/read`, { method: "PATCH", body: JSON.stringify({}) }),
  markAllRead: () => request("/notifications/read-all", { method: "PATCH", body: JSON.stringify({}) }),
};

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

