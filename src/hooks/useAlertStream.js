import { useEffect, useRef } from 'react';
import { AlertApi } from '../services/endpoints';
import { subscribeAlerts } from '../services/localStore';

/** Delivers new alerts live (same tab or other tabs) and publishes a simulated alert every ~45 s. */
export function useAlertStream(onAlert) {
  const cb = useRef(onAlert);
  cb.current = onAlert;
  useEffect(() => {
    const off = subscribeAlerts((a) => cb.current(a));
    const t = setInterval(() => { if (!document.hidden) AlertApi.simulate(); }, 45000);
    return () => { off(); clearInterval(t); };
  }, []);
}
