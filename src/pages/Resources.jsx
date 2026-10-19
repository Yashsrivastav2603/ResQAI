import { useState } from 'react';
import Modal from '../components/Modal';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { GuideApi } from '../services/endpoints';
import { NUMBERS } from '../utils/format';

export default function Resources() {
  const { openChat } = useUi();
  const guides = useFetch(GuideApi.list);
  const [g, setG] = useState(null);
  return (
    <div className="page">
      <div><h2>Resources</h2><div className="mu">Tap a guide for step-by-step help.</div></div>
      <div className="grid g3" style={{ margin: '16px 0' }}>
        {guides.loading && <div className="skeleton" />}
        {(guides.data || []).map((x) => (
          <button key={x.slug} className="card c" style={{ textAlign: 'left', font: 'inherit', color: 'inherit' }} onClick={() => setG(x)}>
            <span className="ico">{x.icon}</span><h3>{x.title}</h3><div className="mu">{x.steps.length} steps</div>
          </button>
        ))}
      </div>
      <div className="card"><h3>Emergency numbers</h3>{NUMBERS.map(([n, num]) => <a className="al" key={num} href={`tel:${num}`}><b style={{ flex: 1 }}>{n}</b><span className="badge LOW">{num} 📞</span></a>)}</div>
      {g && (
        <Modal title={`${g.icon} ${g.title}`} onClose={() => setG(null)}>
          <div className="tl">{g.steps.map((s) => <div className="d" key={s}><b>{s}</b></div>)}</div>
          <button className="btn p w" onClick={() => { setG(null); openChat(`${g.title} safety`); }}>Ask the assistant</button>
        </Modal>
      )}
    </div>
  );
}
