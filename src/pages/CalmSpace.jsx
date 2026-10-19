import { useEffect, useState } from 'react';
import './CalmSpace.css';

export default function CalmSpace() {
  const [on, setOn] = useState(false);
  const [label, setLabel] = useState('Start');
  useEffect(() => {
    if (!on) { setLabel('Start'); return; }
    const t0 = Date.now();
    const i = setInterval(() => { const s = ((Date.now() - t0) / 1000) % 14; setLabel(s < 4 ? 'Breathe in' : s < 8 ? 'Hold' : 'Breathe out'); }, 200);
    return () => clearInterval(i);
  }, [on]);
  return (
    <div className="card narrow center page">
      <h2>Calm Space</h2><div className="mu">Slow breathing steadies your heart rate. Inhale 4s · hold 4s · exhale 6s.</div>
      <div className={`br ${on ? 'go' : ''}`} aria-live="polite">{label}</div>
      <button className="btn p" onClick={() => setOn(!on)}>{on ? 'Stop' : 'Begin'}</button>
      <div style={{ textAlign: 'left', marginTop: 24 }}><h3>5-4-3-2-1 grounding</h3><div className="mu">Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste.</div></div>
    </div>
  );
}
