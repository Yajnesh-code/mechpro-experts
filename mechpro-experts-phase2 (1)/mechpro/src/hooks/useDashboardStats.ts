import { useMemo } from 'react';
import { useLeads } from './useLeads';

export function useDashboardStats(role?: string) {
  const { leads, loading, error, refetch } = useLeads();

  const stats = useMemo(() => {
    const activeStatuses = ['Lead Created', 'Assigned', 'Car Received', 'Inspection Started', 'Inspection Completed', 'Quote Shared', 'Quote Approved', 'Work Started', 'Work Completed', 'Bill Generated'];
    const total = leads.length;
    const pending = leads.filter((lead) => activeStatuses.includes(lead.status)).length;
    const completed = leads.filter((lead) => lead.status === 'Vehicle Delivered').length;
    const revenue = leads.filter((lead) => lead.bill?.status === 'Paid').reduce((sum, lead) => sum + (lead.bill?.total || 0), 0);
    const assigned = leads.filter((lead) => Boolean(lead.assignedServicePartner)).length;
    const urgent = leads.filter((lead) => lead.priority === 'Urgent').length;

    return { total, pending, completed, revenue, assigned, urgent, leads };
  }, [leads, role]);

  return { ...stats, loading, error, refetch };
}
