import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SeverityBadge from '../components/SeverityBadge';
import Timeline from '../components/Timeline';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { IncidentApi } from '../services/endpoints';
import { STATUSES, ago, pretty } from '../utils/format';

export default function RescueTracking() {
  const { toast } = useUi();
  const mine = useFetch(IncidentApi.mine);
  const [sel, setSel] = useState(null);
  const id = sel ?? mine.data?.[0]?.id;
  const detail = useFetch(() => (id ? IncidentApi.get(id) : Promise.resolve(null)), [id]);
  const { reload: reloadMine } = mine, { reload: reloadDetail } = detail;

  useEffect(() => { const t = setInterval(() => { reloadMine(true); reloadDetail(true); }, 8000); return () => clearInterval(t); }, [reloadMine, reloadDetail]);

  if (mine.loading) return <div className="skeleton" />;
  if (!mine.data?.length) return <div className="card center narrow"><h2>No active request</h2><div className="mu">Report an emergency to start tracking.</div><br /><Link className="btn p" to="/report">Report now</Link></div>;

  const inc = detail.data?.incident, k = inc ? STATUSES.indexOf(inc.status) : 0;
  const cancel = async () => { try { await IncidentApi.cancel(inc.id); setSel(null); mine.reload(true); toast('Request cancelled'); } catch (e) { toast(e.message); } };
  const share = async () => { try { await navigator.clipboard.writeText(`${inc.code} (${pretty(inc.type)}) is ${pretty(inc.status)}`); toast('Status copied'); } catch { toast('Copy not available'); } };

  return (
    <div className="page narrow">
      {mine.data.length > 1 && <div className="tabs">{mine.data.map((m) => <button key={m.id} className={`chip ${m.id === id ? 'on' : ''}`} onClick={() => setSel(m.id)}>{`INC-${1000 + m.id}`}</button>)}</div>}
      {inc && (
        <div className="card">
          <div className="row"><h2 style={{ flex: 3 }}>{inc.code} · {pretty(inc.type)}</h2><SeverityBadge level={inc.severity} /></div>
          <div className="mu">{inc.city} · {ago(inc.createdAt)} · {inc.team || 'Team pending'}</div><br />
          <Timeline status={inc.status} events={detail.data.events} />
          <div className="bar"><i style={{ width: `${((k + 1) / STATUSES.length) * 100}%` }} /></div>
          <p className="mu">{k >= 4 ? '✅ Rescue complete. Take care of yourself.' : `Estimated arrival: ~${(4 - k) * 6 + 6} min · updates automatically`}</p>
          <div className="row"><button className="btn" onClick={share}>Share status</button>{inc.status === 'RECEIVED' && <button className="btn" onClick={cancel}>Cancel request</button>}</div>
        </div>
      )}
    </div>
  );
}
