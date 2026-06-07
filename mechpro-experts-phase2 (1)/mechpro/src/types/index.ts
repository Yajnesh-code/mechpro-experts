export type SalesPartnerType = 'BR' | 'CR' | 'FT' | 'AG' | 'IN' | 'GT';
export type ServicePartnerType = 'Workshop' | 'PartVendor' | 'Battery' | 'Tyre' | 'Towing' | 'AlphaGo';

export type LeadStatus =
  | 'Lead Created'
  | 'Assigned'
  | 'Car Received'
  | 'Inspection Started'
  | 'Inspection Completed'
  | 'Quote Shared'
  | 'Quote Approved'
  | 'Work Started'
  | 'Work Completed'
  | 'Bill Generated'
  | 'Payment Done'
  | 'Vehicle Delivered';

export type ServiceType =
  | 'Accident Repair'
  | 'Inspection'
  | 'Survey'
  | 'Towing'
  | 'Alpha Go'
  | 'Breakdown Assistance'
  | 'Part Procurement';

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type FuelType = 'Petrol' | 'Diesel' | 'CNG' | 'Electric' | 'Hybrid';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
}

export interface Vehicle {
  number: string;
  brand: string;
  model: string;
  fuelType: FuelType;
  insuranceCompany: string;
  year?: number;
  color?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'RC Copy' | 'Vehicle Image' | 'Insurance' | 'Quote' | 'Bill' | 'Other';
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  size?: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}

export interface TimelineEvent {
  status: LeadStatus;
  timestamp: string | null;
  performedBy: string | null;
  notes?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface Quote {
  id: string;
  amount: number;
  items: { description: string; amount: number }[];
  createdAt: string;
  approvedAt?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Bill {
  id: string;
  amount: number;
  items: { description: string; amount: number }[];
  gst: number;
  total: number;
  createdAt: string;
  paidAt?: string;
  status: 'Unpaid' | 'Paid';
}

export interface SalesPartner {
  id: string;
  code: SalesPartnerType;
  sequenceNo: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  type: SalesPartnerType;
  typeName: string;
  region: string;
  status: 'Active' | 'Inactive' | 'Pending';
  joinedAt: string;
  totalLeads: number;
}

export interface ServicePartner {
  id: string;
  name: string;
  type: ServicePartnerType;
  email: string;
  mobile: string;
  location: string;
  rating: number;
  status: 'Active' | 'Inactive' | 'Pending';
  specializations: string[];
  joinedAt: string;
  totalJobsCompleted: number;
}

export interface Lead {
  id: string;
  leadId: string;
  customer: Customer;
  vehicle: Vehicle;
  serviceType: ServiceType;
  services: ServiceType[];
  priority: Priority;
  status: LeadStatus;
  location: string;
  notes: string;
  salesPartner: SalesPartner;
  assignedServicePartner?: ServicePartner;
  documents: Document[];
  activityLog: ActivityLog[];
  timeline: TimelineEvent[];
  quote?: Quote;
  bill?: Bill;
  createdAt: string;
  updatedAt: string;
  estimatedCompletion?: string;
}

export type UserRole = 'admin' | 'sales' | 'service' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  partnerId?: string;
}
