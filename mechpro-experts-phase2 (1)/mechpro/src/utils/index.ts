import { LeadStatus, Priority } from '../types';

export const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const timeAgo = (iso: string) => {
  const now = new Date();
  const then = new Date(iso);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

export const getInitials = (name: string) =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export const getStatusClass = (status: LeadStatus): string => {
  const map: Record<LeadStatus, string> = {
    'Lead Created': 'badge-green',
    'Assigned': 'badge-blue',
    'Car Received': 'badge-purple',
    'Inspection Started': 'badge-yellow',
    'Inspection Completed': 'badge-yellow',
    'Quote Shared': 'badge-yellow',
    'Quote Approved': 'badge-green',
    'Work Started': 'badge-purple',
    'Work Completed': 'badge-green',
    'Bill Generated': 'badge-blue',
    'Payment Done': 'badge-green',
    'Vehicle Delivered': 'badge-gray',
  };
  return map[status] || 'badge-gray';
};

export const getPriorityClass = (priority: Priority): string => {
  const map: Record<Priority, string> = {
    Low: 'priority-low',
    Medium: 'priority-medium',
    High: 'priority-high',
    Urgent: 'priority-urgent',
  };
  return map[priority];
};

export const getStatusIndex = (status: LeadStatus): number => {
  const statuses: LeadStatus[] = [
    'Lead Created', 'Assigned', 'Car Received', 'Inspection Started',
    'Inspection Completed', 'Quote Shared', 'Quote Approved',
    'Work Started', 'Work Completed', 'Bill Generated', 'Payment Done', 'Vehicle Delivered'
  ];
  return statuses.indexOf(status);
};

export const generateLeadId = (typeCode: string, seqNo: string, count: number) =>
  `ME${String(count).padStart(4, '0')}${typeCode}${seqNo}`;
