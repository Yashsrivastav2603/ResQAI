import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import WaveText from '../components/WaveText';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import './Landing.css';

const FEATURES = [
  ['⚡', 'Live alerts', 'Severity-ranked hazard alerts streamed to you in real time.', '/home'],
  ['🆘', 'One-tap SOS', 'Hold steady for 3 seconds and responders receive your location.', '/home'],
  ['🤖', 'AI assistant', 'Calm, step-by-step guidance for any emergency, any time.', 'chat'],
  ['🧭', 'Rescue tracking', 'Follow your request from received to rescued, live.', '/tracking'],
  ['🗺️', 'Safe zones', 'Shelters and hospitals with live capacity. Reserve a spot.', '/zones'],
  ['🛰️', 'Command centre', 'Responders dispatch teams, broadcast alerts and balance resources.', '/authority'],
];

export default function Landing() {
  const { user } = useAuth();
  const { openChat } = useUi();
  const nav = useNavigate();
  const [f, setF] = useState(null);
  const go = () => { const t = f[3]; setF(null); if (!user) return nav('/signup'); t === 'chat' ? openChat() : nav(t === '/authority' && user.role !== 'AUTHORITY' ? '/home' : t); };

  return (
    <div className="page">
      <section className="hero">
        <h1>Calm in every <WaveText text="crisis." /></h1>
        <p>Alerts, SOS, AI guidance, rescue tracking and safe zones, designed to keep you steady when it matters.</p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn p f0" to={user ? '/home' : '/signup'}>Get started</Link>
          {user ? <button className="btn f0" onClick={() => openChat()}>Talk to ResQ</button> : <Link className="btn f0" to="/signin">Sign in</Link>}
        </div>
      </section>
      <div className="grid g3">
        {FEATURES.map((x) => (
          <button key={x[1]} className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setF(x)}>
            <span className="ico">{x[0]}</span><h3>{x[1]}</h3><div className="mu">{x[2]}</div>
          </button>
        ))}
      </div>
      {f && <Modal title={f[1]} onClose={() => setF(null)}><p className="mu">{f[2]}</p><button className="btn p w" onClick={go}>{user ? 'Open' : 'Create free account'}</button></Modal>}
    </div>
  );
}
