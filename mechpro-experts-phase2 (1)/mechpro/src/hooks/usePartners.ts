import { useCallback, useEffect, useState } from 'react';
import { ServicePartner } from '../types';
import { getPartners } from '../services/api';

export function usePartners(type?: string) {
  const [partners, setPartners] = useState<ServicePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPartners(await getPartners(type));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load partners');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { partners, loading, error, refetch };
}
