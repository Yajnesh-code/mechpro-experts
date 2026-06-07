import { useCallback, useEffect, useState } from 'react';
import { Lead } from '../types';
import { getLeads, LeadFilters } from '../services/api';

export function useLeads(filters: LeadFilters = {}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const key = JSON.stringify(filters);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeads(filters);
      setLeads(result.leads);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load leads');
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { leads, total, loading, error, refetch, setLeads };
}
