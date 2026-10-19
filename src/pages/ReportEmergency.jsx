import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { IncidentApi } from '../services/endpoints';
import { SEVERITIES, TYPES, pretty } from '../utils/format';
import { CITIES, getPosition, nearestCity } from '../utils/geo';

const TEMPLATES = ['Water rising fast', 'Building damaged', 'Person injured', 'Road blocked'];

export default function ReportEmergency() {
  const { user } = useAuth();
  const { toast } = useUi();
  const nav = useNavigate();
  const [f, setF] = useState({ type: 'FLOOD', severity: 'HIGH', peopleAffected: 1, city: user.city, description: '', latitude: null, longitude: null });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const up = (p) => setF((x) => ({ ...x, ...p }));

  async function gps() {
    try { const p = await getPosition(); up({ latitude: p.latitude, longitude: p.longitude, city: nearestCity(p.latitude, p.longitude) }); toast('Location captured 📡'); }
    catch (e) { toast(`${e.message}, pick a city`); }
  }
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await IncidentApi.create(f); toast('Report submitted 🌿'); nav('/tracking'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <form className="card narrow page" onSubmit={submit}>
      <h2>Report an emergency</h2><div className="mu">Responders are notified immediately.</div>
      <label>Type</label><div className="tabs">{TYPES.map((t) => <button type="button" key={t} className={`chip ${f.type === t ? 'on' : ''}`} onClick={() => up({ type: t })}>{pretty(t)}</button>)}</div>
      <label>Severity</label><div className="tabs">{SEVERITIES.map((s) => <button type="button" key={s} className={`chip ${f.severity === s ? 'on' : ''}`} onClick={() => up({ severity: s })}>{pretty(s)}</button>)}</div>
      <label>People affected</label>
      <div className="row"><button type="button" className="btn f0" onClick={() => up({ peopleAffected: Math.max(1, f.peopleAffected - 1) })}>−</button><b className="center">{f.peopleAffected}</b><button type="button" className="btn f0" onClick={() => up({ peopleAffected: f.peopleAffected + 1 })}>+</button></div>
      <label htmlFor="c">Location</label>
      <div className="row"><select id="c" value={f.city} onChange={(e) => up({ city: e.target.value, latitude: null, longitude: null })}>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</select><button type="button" className="btn sm f0" onClick={gps}>📡 Use GPS</button></div>
      <label htmlFor="d">What is happening?</label>
      <div className="tabs">{TEMPLATES.map((t) => <button type="button" key={t} className="chip" onClick={() => up({ description: t })}>{t}</button>)}</div>
      <textarea id="d" rows={3} required maxLength={1000} value={f.description} onChange={(e) => up({ description: e.target.value })} placeholder="Describe the situation…" />
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn p w" style={{ marginTop: 18 }} disabled={busy}>{busy ? 'Submitting…' : 'Submit report'}</button>
    </form>
  );
}
