import type { PortalRole } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ApiOptions = RequestInit & { token?: string };

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.token) headers.set("Authorization", `Bearer ${options.token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? data.message ?? "API request failed");
  }
  return data as T;
}

export type ApiUser = {
  id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  role: PortalRole | "workshop";
  status: string;
  city: string;
  email_verified: boolean;
  mobile_verified: boolean;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: ApiUser;
};

export const authApi = {
  login(payload: { email: string; password: string; remember_me?: boolean }) {
    return request<AuthResponse>("/login", { method: "POST", body: JSON.stringify(payload) });
  },
  register(payload: Record<string, unknown>) {
    return request<ApiUser>("/register", { method: "POST", body: JSON.stringify(payload) });
  },
  forgotPassword(payload: { email: string }) {
    return request<{ message: string }>("/forgot-password", { method: "POST", body: JSON.stringify(payload) });
  },
  resetPassword(payload: { token: string; password: string; confirm_password: string }) {
    return request<{ message: string }>("/reset-password", { method: "POST", body: JSON.stringify(payload) });
  },
  sendOtp(payload: { destination: string; channel: "email" | "mobile" }) {
    return request<{ message: string }>("/send-otp", { method: "POST", body: JSON.stringify(payload) });
  },
  verifyOtp(payload: { destination: string; otp: string; channel: "email" | "mobile" }) {
    return request<{ message: string }>("/verify-otp", { method: "POST", body: JSON.stringify(payload) });
  },
  me(token: string) {
    return request<ApiUser>("/me", { token });
  },
};

function authToken() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("mechpro_access_token") ?? undefined;
}

export type LeadStatus =
  | "LEAD_CREATED"
  | "ASSIGNED"
  | "CAR_RECEIVED"
  | "INSPECTION_STARTED"
  | "INSPECTION_COMPLETED"
  | "QUOTE_SHARED"
  | "QUOTE_APPROVED"
  | "WORK_STARTED"
  | "WORK_COMPLETED"
  | "BILL_GENERATED"
  | "PAYMENT_DONE"
  | "VEHICLE_DELIVERED";

export const leadApi = {
  list() {
    return request<unknown[]>("/leads", { token: authToken() });
  },
  get(idOrCode: string) {
    return request<unknown>(`/leads/${idOrCode}`, { token: authToken() });
  },
  create(payload: Record<string, unknown>) {
    return request<unknown>("/leads", { method: "POST", token: authToken(), body: JSON.stringify(payload) });
  },
  assign(id: string, payload: { servicePartnerId: string; notes?: string }) {
    return request<unknown>(`/leads/${id}/assign`, { method: "PATCH", token: authToken(), body: JSON.stringify(payload) });
  },
  updateStatus(id: string, payload: { status: LeadStatus; notes?: string }) {
    return request<unknown>(`/leads/${id}/status`, { method: "PATCH", token: authToken(), body: JSON.stringify(payload) });
  },
  createQuote(id: string, payload: { amount: number; items: Array<{ description: string; amount: number }> }) {
    return request<unknown>(`/leads/${id}/quotes`, { method: "POST", token: authToken(), body: JSON.stringify(payload) });
  },
  createInvoice(id: string, payload: { amount: number; gst: number; total: number; items: Array<{ description: string; amount: number }> }) {
    return request<unknown>(`/leads/${id}/invoices`, { method: "POST", token: authToken(), body: JSON.stringify(payload) });
  },
};

export const partnerApi = {
  servicePartners() {
    return request<unknown[]>("/partners/service-partners", { token: authToken() });
  },
  salesPartners() {
    return request<unknown[]>("/partners/sales-partners", { token: authToken() });
  },
};

export function saveAuthSession(auth: AuthResponse) {
  localStorage.setItem("mechpro_access_token", auth.access_token);
  localStorage.setItem("mechpro_refresh_token", auth.refresh_token);
  localStorage.setItem("mechpro_user", JSON.stringify(auth.user));
}
