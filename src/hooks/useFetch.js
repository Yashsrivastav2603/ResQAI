import { useCallback, useEffect, useState } from 'react';

/** Loads data on mount; `reload(true)` refreshes silently (no skeleton flash). */
export function useFetch(fn, deps = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async (silent) => {
    if (!silent) setLoading(true);
    try { setData(await fn()); setError(null); } catch (e) { setError(e.message); } finally { setLoading(false); }
  }, deps);
  useEffect(() => { load(); }, [load]);
  return { data, setData, error, loading, reload: load };
}
