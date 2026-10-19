import { useState } from 'react';
import Modal from '../components/Modal';
import SeverityBadge from '../components/SeverityBadge';
import Timeline from '../components/Timeline';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { AlertApi, IncidentApi, ResourceApi } from '../services/endpoints';
import { SEVERITIES, TEAMS, pretty } from '../utils/format';

function ResourceRow({ r }) {
  const { toast } = useUi();
  const [v, setV] = useState(r.allocated);
  const commit = async () => { if (v === r.allocated) return; try { await ResourceApi.update(r.id, v); r.allocated = v; toast(`${r.name} updated`); } catch (e) { toast(e.message); setV(r.allocated); } };
  return (
    <div style={{ margin: '14px 0' }}>
      <div className="row"><b>{r.name}</b><span className="mu" style={{ textAlign: 'right' }}>{v}/{r.total}</span></div>
      <input type="range" min="0" max={r.total} value={v} onChange={(e) => setV(+e.target.value)} onPointerUp={commit} onKeyUp={commit} aria-label={r.name} />
      <div className="bar"><i style={{ width: `${(v / r.total) * 100}%` }} /></div>
    </div>
  );
}

function IncidentModal({ id, onClose, onChanged }) {
  const { toast } = useUi();
  const { data, reload } = useFetch(() => IncidentApi.get(id), [id]);
  if (!data) return <Modal onClose={onClose}><div className="skeleton" /></Modal>;
  const i = data.incident;
  const run = async (fn, msg) => { try { await fn(); toast(msg); await reload(true); onChanged(); } catch (e) { toast(e.message); } };
  return (
    <Modal title={`${i.code} · ${pretty(i.type)}`} onClose={onClose}>
      <SeverityBadge level={i.severity} /> <span className="mu">{i.city} · {i.peopleAffected} people</span>
      <p>{i.description}</p>
      <Timeline status={i.status} events={data.events} />
      <label>Assign team</label>
      <select value={i.team || ''} onChange={(e) => e.target.value && run(() => IncidentApi.assign(i.id, e.target.value), 'Team assigned')}><option value="">Unassigned</option>{TEAMS.map((t) => <option key={t}>{t}</option>)}</select>
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn p" disabled={i.status === 'RESOLVED'} onClick={() => run(() => IncidentApi.advance(i.id), 'Status advanced')}>{i.status === 'RESOLVED' ? 'Resolved' : 'Advance status'}</button>
        <button className="btn" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

export default function Authority() {
  const { toast } = useUi();
  const incidents = useFetch(() => IncidentApi.list('?size=100'));
  const resources = useFetch(ResourceApi.list);
  const [open, setOpen] = useState(null);
  const [bc, setBc] = useState({ title: '', severity: 'HIGH' });

  const rows = [...(incidents.data?.content || [])].sort((a, b) => SEVERITIES.indexOf(b.severity) - SEVERITIES.indexOf(a.severity));
  async function broadcast(e) {
    e.preventDefault();
    try { await AlertApi.broadcast({ ...bc, type: 'OTHER' }); setBc({ ...bc, title: '' }); toast('Alert broadcast to all citizens'); } catch (x) { toast(x.message); }
  }
  return (
    <div className="page">
      <h2>Command centre</h2>
      <div className="grid g2" style={{ marginTop: 16 }}>
        <div className="card" style={{ gridColumn: '1/-1' }}>
          <h3>Incidents</h3>
          {incidents.loading ? <div className="skeleton" /> : (
            <div className="scroll-x"><table>
              <thead><tr><th>ID</th><th>Type</th><th>Severity</th><th>City</th><th>Status</th><th>Team</th></tr></thead>
              <tbody>{rows.map((i) => <tr className="c" key={i.id} onClick={() => setOpen(i.id)}><td>{i.code}</td><td>{pretty(i.type)}</td><td><SeverityBadge level={i.severity} /></td><td>{i.city}</td><td>{pretty(i.status)}</td><td>{i.team || '—'}</td></tr>)}</tbody>
            </table></div>
          )}
        </div>
        <form className="card" onSubmit={broadcast}>
          <h3>Broadcast alert</h3>
          <label htmlFor="bt">Message</label><input id="bt" required maxLength={200} value={bc.title} onChange={(e) => setBc({ ...bc, title: e.target.value })} placeholder="e.g. Evacuate low-lying areas" />
          <label htmlFor="bs">Severity</label><select id="bs" value={bc.severity} onChange={(e) => setBc({ ...bc, severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{pretty(s)}</option>)}</select>
          <button className="btn p w" style={{ marginTop: 14 }}>Send to citizens</button>
        </form>
        <div className="card"><h3>Resources</h3>{resources.loading ? <div className="skeleton" /> : (resources.data || []).map((r) => <ResourceRow key={r.id} r={r} />)}</div>
      </div>
      {open && <IncidentModal id={open} onClose={() => setOpen(null)} onChanged={() => incidents.reload(true)} />}
    </div>
  );
}
