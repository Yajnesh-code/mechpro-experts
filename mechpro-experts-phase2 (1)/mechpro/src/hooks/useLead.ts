import { useCallback, useEffect, useState } from 'react';
import { Lead } from '../types';
import { getLeadById } from '../services/api';

export function useLead(id?: string) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      setLead(await getLeadById(id));
    } catch (err) {
      setLead(null);
      setError(err instanceof Error ? err.message : 'Unable to load lead');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { lead, loading, error, refetch, setLead };
}
