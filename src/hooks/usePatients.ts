// src/hooks/usePatients.ts
import { useEffect, useState } from 'react';

import type { Patient, PatientQuery } from '../services/PatientService';
import { PatientService } from '../services/PatientService';

export function usePatients(query?: PatientQuery) {
  const [data, setData] = useState<Patient[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(query?.page ?? 1);
  const [pageSize, setPageSize] = useState(query?.pageSize ?? 10);

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      try {
        const res = await PatientService.list({
          ...(query ?? {}),
          page,
          pageSize,
        });

        if (!active) return;

        setData(res.data || []);
        setTotal(res.total ?? res.data?.length ?? 0);
      } catch (err) {
        console.error('usePatients error:', err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [page, pageSize, JSON.stringify(query)]);

  return {
    data,
    total,
    loading,
    page,
    pageSize,
    setPage,
    setPageSize,
    reload: () => setPage(1),
  };
}
