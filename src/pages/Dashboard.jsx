import { useState } from 'react';
import { Link } from 'react-router-dom';
import CountUp from '../components/CountUp';
import Modal from '../components/Modal';
import Ring from '../components/Ring';
import SeverityBadge from '../components/SeverityBadge';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { useAlertStream } from '../hooks/useAlertStream';
import { useFetch } from '../hooks/useFetch';
import { AlertApi, ChecklistApi, IncidentApi, ZoneApi } from '../services/endpoints';
import { CHECKLIST, ago, greeting, pretty } from '../utils/format';

function IncidentList({ filter }) {
  const { data, loading, error } = useFetch(() => IncidentApi.list('?size=100'));
  if (loading) return <div className="skeleton" />;
  if (error) return <p className="err">{error}</p>;
  const list = data.content.filter((i) => i.status !== 'RESOLVED' && (filter === 'all' || (filter === 'critical' ? i.severity === 'CRITICAL' : i.mine)));
  return list.length ? list.map((i) => (
    <div className="al static" key={i.id}><SeverityBadge level={i.severity} /><div><b>{pretty(i.type)} · {i.city}</b><div className="mu">{pretty(i.status)} · {ago(i.createdAt)} · {i.code}</div></div></div>
  )) : <p className="mu">Nothing here right now. All calm 🌿</p>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { openChat, toast } = useUi();
  const stats = useFetch(IncidentApi.stats);
  const alerts = useFetch(AlertApi.list);
  const check = useFetch(ChecklistApi.get);
  const zones = useFetch(ZoneApi.list);
  const [modal, setModal] = useState(null);

  useAlertStream((a) => { alerts.setData((l) => [a, ...(l || [])].slice(0, 30)); stats.reload(true); toast(`New alert: ${a.title}`); });

  const toggle = async (k, done) => {
    check.setData((c) => ({ ...c, [k]: done }));
    try { await ChecklistApi.set(k, done); } catch (e) { toast(e.message); check.reload(true); }
  };
  const done = CHECKLIST.filter(([k]) => check.data?.[k]).length;
  const pct = Math.round((done / CHECKLIST.length) * 100);
  const nearest = zones.data?.find((z) => z.city === user.city && z.occupied < z.capacity) || zones.data?.[0];
  const s = stats.data || { active: 0, critical: 0, resolved: 0, mine: 0 };

  return (
    <div className="page">
      <div><h2>Good {greeting()}, {user.name.split(' ')[0]}</h2><div className="mu">All is calm. Monitoring {user.city}.</div></div>
      <div className="grid g4" style={{ margin: '18px 0' }}>
        {[[s.active, 'Active incidents', 'all'], [s.critical, 'Critical', 'critical'], [zones.data?.length || 0, 'Safe zones', 'zones'], [s.mine, 'My requests', 'mine']].map(([n, label, k]) => (
          k === 'zones'
            ? <Link key={k} className="card c" to="/zones"><div className="stat"><CountUp to={n} /></div><div className="mu">{label}</div></Link>
            : <button key={k} className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setModal({ kind: 'list', k })}><div className="stat"><CountUp to={n} /></div><div className="mu">{label}</div></button>
        ))}
      </div>
      <div className="grid g2">
        <div className="card">
          <h3>Live alerts</h3>
          {alerts.loading ? <div className="skeleton" /> : (alerts.data || []).slice(0, 6).map((a) => (
            <button key={a.id} className="al" onClick={() => setModal({ kind: 'alert', a })}><SeverityBadge level={a.severity} /><div><b>{a.title}</b><div className="mu">{pretty(a.type)} · {ago(a.createdAt)}</div></div></button>
          ))}
        </div>
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card">
            <div className="row"><Ring value={pct} /><div><h3>Preparedness</h3><div className="mu">Tick off what you have done</div></div></div>
            {CHECKLIST.map(([k, label]) => <label className="inline" key={k}><input type="checkbox" checked={!!check.data?.[k]} onChange={(e) => toggle(k, e.target.checked)} />{label}</label>)}
          </div>
          <div className="grid g2" style={{ gap: 12 }}>
            <Link className="card c" to="/report"><span className="ico">📝</span><b> Report</b></Link>
            <button className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => openChat()}><span className="ico">🤖</span><b> Ask AI</b></button>
            <button className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => nearest && setModal({ kind: 'zone', z: nearest })}><span className="ico">📍</span><b> Nearest zone</b></button>
            <Link className="card c" to="/calm"><span className="ico">🌿</span><b> Breathe</b></Link>
          </div>
        </div>
      </div>
      {modal?.kind === 'list' && <Modal title="Incidents" onClose={() => setModal(null)}><IncidentList filter={modal.k} /></Modal>}
      {modal?.kind === 'alert' && (
        <Modal title={modal.a.title} onClose={() => setModal(null)}>
          <SeverityBadge level={modal.a.severity} /> <span className="mu">{pretty(modal.a.type)} · {ago(modal.a.createdAt)}</span>
          <p>Stay informed and follow local authority advice. Tap below for calm, step-by-step guidance.</p>
          <button className="btn p w" onClick={() => { setModal(null); openChat(`${pretty(modal.a.type)} safety`); }}>Ask AI what to do</button>
        </Modal>
      )}
      {modal?.kind === 'zone' && (
        <Modal title={modal.z.name} onClose={() => setModal(null)}>
          <span className="mu">{pretty(modal.z.type)} · {modal.z.city}</span>
          <div className="bar" style={{ margin: '14px 0 6px' }}><i style={{ width: `${(modal.z.occupied / modal.z.capacity) * 100}%` }} /></div>
          <p className="mu">{modal.z.capacity - modal.z.occupied} of {modal.z.capacity} spaces free</p>
          <Link className="btn p w" to="/zones" onClick={() => setModal(null)}>Open safe zones</Link>
        </Modal>
      )}
    </div>
  );
}
