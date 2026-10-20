import { useEffect, useRef, useState } from 'react';
import { useUi } from '../context/UiContext';
import { AssistantApi } from '../services/endpoints';

const HELLO = { role: 'assistant', content: "Hi, I'm ResQ 🌿 I'm here to help you stay safe and calm. What's happening?" };
const QUICK = ['Flood safety', 'Earthquake', 'Feeling anxious', 'Nearest shelter', 'My request status'];

export default function ChatDrawer() {
  const { chat, closeChat } = useUi();
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const end = useRef();

  useEffect(() => { AssistantApi.history().then((h) => setMsgs(h.length ? h : [HELLO])).catch(() => setMsgs([HELLO])).finally(() => setReady(true)); }, []);
  useEffect(() => { if (ready && chat.open && chat.prompt) send(chat.prompt); /* eslint-disable-next-line */ }, [chat.n, ready]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, busy]);

  async function send(t) {
    t = t.trim(); if (!t || busy) return;
    setMsgs((m) => [...m, { role: 'user', content: t }]); setText(''); setBusy(true);
    try { const r = await AssistantApi.chat(t); setMsgs((m) => [...m, r]); }
    catch { setMsgs((m) => [...m, { role: 'assistant', content: 'Sorry, something went wrong. If you are in danger call 112.' }]); }
    finally { setBusy(false); }
  }

  return (
    <aside className={`dr ${chat.open ? 'on' : ''}`} aria-hidden={!chat.open}>
      <div className="dh"><b>🌿 ResQ Assistant</b><button className="x" onClick={closeChat} aria-label="Close chat">✕</button></div>
      <div className="chat">
        {msgs.map((m, i) => <div key={i} className={`m ${m.role === 'user' ? 'u' : ''}`}>{m.content}</div>)}
        {busy && <div className="m"><span className="dots"><i /><i /><i /></span></div>}
        <div ref={end} />
      </div>
      <div className="tabs">{QUICK.map((q) => <button key={q} className="chip" onClick={() => send(q)}>{q}</button>)}</div>
      <div className="row">
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} placeholder="Ask anything…" maxLength={500} />
        <button className="btn p f0" onClick={() => send(text)} disabled={busy}>Send</button>
      </div>
    </aside>
  );
}
