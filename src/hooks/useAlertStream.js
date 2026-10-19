import { useEffect, useRef } from 'react';
import { apiUrl, getToken } from '../services/api';

/** Subscribes to the Server-Sent-Events alert stream; EventSource reconnects automatically. */
export function useAlertStream(onAlert) {
  const cb = useRef(onAlert);
  cb.current = onAlert;
  useEffect(() => {
    const t = getToken();
    if (!t) return;
    const es = new EventSource(`${apiUrl('/alerts/stream')}?access_token=${encodeURIComponent(t)}`);
    es.addEventListener('alert', (e) => { try { cb.current(JSON.parse(e.data)); } catch { /* ignore */ } });
    return () => es.close();
  }, []);
}
