"use client";

import { useCallback, useEffect, useState } from "react";
import { operationsApi, type UiServicePartner } from "@/lib/operations";

export function useServicePartners() {
  const [partners, setPartners] = useState<UiServicePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setPartners(await operationsApi.listServicePartners());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load service partners");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { partners, loading, error, refetch };
}

