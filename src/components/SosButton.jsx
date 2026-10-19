import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { IncidentApi } from '../services/endpoints';
import { getPosition, nearestCity } from '../utils/geo';

export default function SosButton() {
  const { user } = useAuth();
  const { toast } = useUi();
  const nav = useNavigate();
  const [n, setN] = useState(null);

  useEffect(() => {
    if (n === null) return;
    if (n === 0) { fire(); return; }
    const t = setTimeout(() => setN(n - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  async function fire() {
    setN(null);
    let body = { type: 'OTHER', severity: 'CRITICAL', city: user.city, description: 'SOS emergency alert', peopleAffected: 1 };
    try { const p = await getPosition(2500); body = { ...body, latitude: p.latitude, longitude: p.longitude, city: nearestCity(p.latitude, p.longitude) }; } catch { /* use profile city */ }
    try { await IncidentApi.create(body); toast('SOS sent. Help is on the way 🌿'); nav('/tracking'); } catch (e) { toast(e.message); }
  }

  return (
    <>
      <button className="btn sm sos" onClick={() => setN(3)}>🚨 SOS</button>
      {n !== null && (
        <Modal title="Sending SOS" onClose={() => setN(null)}>
          <div className="big">{n}</div>
          <p className="mu center">Your location is shared with responders.</p>
          <button className="btn w" onClick={() => setN(null)}>Cancel</button>
        </Modal>
      )}
    </>
  );
}
