import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const Ctx = createContext(null);
export const useUi = () => useContext(Ctx);

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [chat, setChat] = useState({ open: false, prompt: null, n: 0 });
  const [mode, setMode] = useState(() => localStorage.getItem('rq_fx') || (matchMedia('(prefers-reduced-motion:reduce)').matches ? 'off' : 'flood'));

  const toast = useCallback((m) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, m }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);
  const openChat = useCallback((prompt = null) => setChat((c) => ({ open: true, prompt, n: c.n + 1 })), []);
  const closeChat = useCallback(() => setChat((c) => ({ ...c, open: false, prompt: null })), []);
  const toggleTheme = useCallback(() => {
    const r = document.documentElement;
    const cur = r.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    r.dataset.theme = cur === 'dark' ? 'light' : 'dark';
  }, []);
  useEffect(() => { document.body.className = `m-${mode}`; localStorage.setItem('rq_fx', mode); }, [mode]);

  const value = useMemo(() => ({ toast, chat, openChat, closeChat, mode, setMode, toggleTheme }), [toast, chat, openChat, closeChat, mode, toggleTheme]);
  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="toasts" aria-live="polite">{toasts.map((t) => <div key={t.id} className="toast">{t.m}</div>)}</div>
    </Ctx.Provider>
  );
}
