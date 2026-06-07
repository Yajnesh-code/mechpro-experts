"use client";

import { useCallback, useEffect, useState } from "react";
import { operationsApi, type UiLead } from "@/lib/operations";

export function useLeads() {
  const [leads, setLeads] = useState<UiLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLeads(await operationsApi.listLeads());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load leads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { leads, loading, error, refetch };
}

