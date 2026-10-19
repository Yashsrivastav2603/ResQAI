import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import ChatDrawer from './ChatDrawer';
import Ambience from './Ambience';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';

export default function Layout() {
  const { user } = useAuth();
  const { openChat } = useUi();
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  // Water-ripple on every button / chip click
  useEffect(() => {
    const h = (e) => {
      const b = e.target.closest('.btn,.chip'); if (!b) return;
      const r = b.getBoundingClientRect(), s = document.createElement('span'), d = Math.max(r.width, r.height) * 2;
      s.className = 'rp'; s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      b.append(s); setTimeout(() => s.remove(), 700);
    };
    addEventListener('click', h); return () => removeEventListener('click', h);
  }, []);

  return (
    <>
      <div className="bg"><i /><i /></div>
      <Ambience />
      <Navbar />
      <main id="app-root" key={pathname}><Outlet /></main>
      {user && <><button className="fab" onClick={() => openChat()} aria-label="Open AI assistant">💬</button><ChatDrawer /></>}
    </>
  );
}
