import { useEffect, useState } from 'react';
export default function CountUp({ to = 0 }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf, s;
    const f = (t) => { s ??= t; const p = Math.min(1, (t - s) / 900); setV(Math.round(to * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(f); };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return v.toLocaleString();
}
