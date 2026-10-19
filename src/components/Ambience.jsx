import { useEffect, useRef } from 'react';
import { useUi } from '../context/UiContext';

const R = Math.random;
const seed = (W, H, mode) => mode === 'off' ? [] : Array.from({ length: mode === 'cyclone' ? 90 : 85 }, () => ({ x: R() * W, y: R() * H, a: R() * 6.28, r: R() * Math.min(W, H) * 0.45 + 30, s: 0.5 + R() * 1.5, l: 8 + R() * 14 }));
const MODES = [['flood', '🌊', 'Flood'], ['quake', '🏚️', 'Earthquake'], ['fire', '🔥', 'Wildfire'], ['cyclone', '🌀', 'Cyclone'], ['off', '⏻', 'Off']];

/** Canvas particle engine: rain + waves, dust, embers, leaf vortex. Pauses when the tab is hidden. */
export default function Ambience() {
  const cv = useRef();
  const s = useRef({ mode: 'flood', P: [], W: 0, H: 0, t: 0 });
  const { mode, setMode, toast } = useUi();

  useEffect(() => { s.current.mode = mode; s.current.P = seed(s.current.W, s.current.H, mode); }, [mode]);

  useEffect(() => {
    const c = cv.current, cx = c.getContext('2d'), S = s.current; let raf;
    const rs = () => { S.W = c.width = innerWidth; S.H = c.height = innerHeight; S.P = seed(S.W, S.H, S.mode); };
    rs(); addEventListener('resize', rs);
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (document.hidden) return;
      const { W, H, mode: m } = S; S.t += 0.016; const t = S.t;
      cx.clearRect(0, 0, W, H); cx.lineWidth = 1.2;
      for (const p of S.P) {
        if (m === 'flood') { p.y += 6 + p.s * 5; p.x -= 1; if (p.y > H) { p.y = -20; p.x = R() * W; } cx.strokeStyle = 'rgba(94,140,136,.4)'; cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(p.x + 2, p.y + p.l); cx.stroke(); }
        else if (m === 'fire') { p.y -= p.s; p.x += Math.sin(t * 2 + p.a) * 0.6; if (p.y < -10) { p.y = H + 10; p.x = R() * W; } cx.fillStyle = `rgba(${220 + R() * 30 | 0},${120 + R() * 40 | 0},60,${Math.max(0, p.y / H) * 0.5})`; cx.beginPath(); cx.arc(p.x, p.y, 1 + p.s * 1.5, 0, 6.28); cx.fill(); }
        else if (m === 'cyclone') { p.a += 0.012 * p.s * (300 / p.r + 0.5); cx.fillStyle = 'rgba(111,145,80,.45)'; cx.beginPath(); cx.ellipse(W / 2 + Math.cos(p.a) * p.r * 1.5, H / 2 + Math.sin(p.a) * p.r * 0.55, 5, 2, p.a, 0, 6.28); cx.fill(); }
        else if (m === 'quake') { p.y += p.s * 0.8; p.x += Math.sin(t * 20 + p.a) * 0.8; if (p.y > H) { p.y = -5; p.x = R() * W; } cx.fillStyle = 'rgba(150,125,90,.35)'; cx.fillRect(p.x, p.y, 2 + p.s, 2 + p.s); }
      }
      if (m === 'flood') for (let k = 0; k < 3; k++) { cx.fillStyle = `rgba(94,140,136,${0.1 + k * 0.05})`; cx.beginPath(); cx.moveTo(0, H); for (let x = 0; x <= W; x += 20) cx.lineTo(x, H - 34 - k * 10 + Math.sin(x / 90 + t * (1.2 + k * 0.5) + k) * 12); cx.lineTo(W, H); cx.fill(); }
    };
    loop();
    const qk = setInterval(() => {
      if (S.mode !== 'quake' || document.hidden) return;
      document.getElementById('app-root')?.animate([{ transform: 'none' }, { transform: 'translate(-5px,2px)' }, { transform: 'translate(5px,-2px)' }, { transform: 'translate(-4px,2px)' }, { transform: 'translate(3px,-1px)' }, { transform: 'none' }], { duration: 700 });
      try { navigator.vibrate?.(150); } catch { /* unsupported */ }
    }, 7000);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', rs); clearInterval(qk); };
  }, []);

  return (
    <>
      <canvas id="fx" ref={cv} aria-hidden="true" />
      <div className="fxb" role="group" aria-label="Ambience">
        {MODES.map(([k, icon, label]) => <button key={k} className={mode === k ? 'on' : ''} title={label} onClick={() => { setMode(k); toast(`Ambience: ${label}`); }}>{icon}</button>)}
      </div>
    </>
  );
}
