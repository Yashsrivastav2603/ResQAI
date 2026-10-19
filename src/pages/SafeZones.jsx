import { useState } from 'react';
import Modal from '../components/Modal';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { IncidentApi, ZoneApi } from '../services/endpoints';
import { pretty } from '../utils/format';
import { cityPos, project } from '../utils/geo';
import './SafeZones.css';

export default function SafeZones() {
  const { toast } = useUi();
  const zones = useFetch(ZoneApi.list);
  const incidents = useFetch(() => IncidentApi.list('?size=100'));
  const [filter, setFilter] = useState('ALL');
  const [selId, setSelId] = useState(null);

  const list = (zones.data || []).filter((z) => filter === 'ALL' || z.type === filter);
  const sel = zones.data?.find((z) => z.id === selId);
  const replace = (z) => zones.setData((l) => l.map((x) => (x.id === z.id ? z : x)));
  const act = async (fn, ok) => { try { replace(await fn(sel.id)); toast(ok); } catch (e) { toast(e.message); } };

  return (
    <div className="page">
      <div><h2>Safe zones</h2><div className="mu">Dashed areas are active incidents. Tap a pin to reserve a spot.</div></div>
      <div className="tabs" style={{ margin: '14px 0' }}>{['ALL', 'SHELTER', 'HOSPITAL', 'CAMP'].map((t) => <button key={t} className={`chip ${filter === t ? 'on' : ''}`} onClick={() => setFilter(t)}>{pretty(t)}</button>)}</div>
      <div className="map" role="img" aria-label="Map of safe zones and active incidents">
        {(incidents.data?.content || []).filter((i) => i.status !== 'RESOLVED').map((i) => {
          const [x, y] = i.latitude != null ? project(i.latitude, i.longitude) : cityPos(i.city);
          const d = 48 + Math.min(i.peopleAffected, 60);
          return <div key={i.id} className="zone" style={{ left: `${x}%`, top: `${y}%`, width: d, height: d }} />;
        })}
        {list.map((z) => { const [x, y] = project(z.latitude, z.longitude); return <button key={z.id} className={`pin ${z.reserved ? 'mine' : ''}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => setSelId(z.id)}><i />{z.city}</button>; })}
      </div>
      <br />
      {zones.loading ? <div className="skeleton" /> : (
        <div className="grid g3">
          {list.map((z) => (
            <button key={z.id} className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setSelId(z.id)}>
              <b>{z.name}</b> <span className="mu">· {z.city}{z.reserved ? ' · ✅ reserved' : ''}</span>
              <div className="bar" style={{ margin: '10px 0' }}><i style={{ width: `${(z.occupied / z.capacity) * 100}%` }} /></div>
              <div className="mu">{z.capacity - z.occupied} spaces free</div>
            </button>
          ))}
        </div>
      )}
      {sel && (
        <Modal title={sel.name} onClose={() => setSelId(null)}>
          <span className="mu">{pretty(sel.type)} · {sel.city}</span>
          <div className="bar" style={{ margin: '14px 0 6px' }}><i style={{ width: `${(sel.occupied / sel.capacity) * 100}%` }} /></div>
          <p className="mu">{sel.capacity - sel.occupied} of {sel.capacity} spaces free</p>
          <div className="row">
            {sel.reserved
              ? <button className="btn" onClick={() => act(ZoneApi.release, 'Reservation released')}>Release my spot</button>
              : <button className="btn p" disabled={sel.occupied >= sel.capacity} onClick={() => act(ZoneApi.reserve, `Spot reserved at ${sel.name}`)}>{sel.occupied >= sel.capacity ? 'Full' : 'Reserve a spot'}</button>}
            <a className="btn" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${sel.latitude},${sel.longitude}`}>Directions</a>
          </div>
        </Modal>
      )}
    </div>
  );
}
