import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { useFetch } from '../hooks/useFetch';
import { UserApi } from '../services/endpoints';
import { CITIES } from '../utils/geo';

export default function Profile() {
  const { user, update, logout } = useAuth();
  const { toast } = useUi();
  const nav = useNavigate();
  const contacts = useFetch(UserApi.contacts);
  const [c, setC] = useState({ label: '', phone: '' });

  const patch = async (p, msg) => { try { await update(p); toast(msg); } catch (e) { toast(e.message); } };
  const add = async (e) => {
    e.preventDefault();
    try { const n = await UserApi.addContact(c); contacts.setData((l) => [...l, n]); setC({ label: '', phone: '' }); } catch (x) { toast(x.message); }
  };
  const remove = async (id) => { try { await UserApi.delContact(id); contacts.setData((l) => l.filter((x) => x.id !== id)); } catch (x) { toast(x.message); } };

  return (
    <div className="card narrow page">
      <h2>{user.name}</h2><div className="mu">{user.role === 'AUTHORITY' ? 'Responder' : 'Citizen'} · {user.email}</div>
      <label htmlFor="city">City</label>
      <select id="city" value={user.city} onChange={(e) => patch({ city: e.target.value }, 'City updated')}>{Object.keys(CITIES).map((x) => <option key={x}>{x}</option>)}</select>
      <label className="inline" style={{ marginTop: 14 }}><input type="checkbox" checked={user.shareLocation} onChange={(e) => patch({ shareLocation: e.target.checked }, e.target.checked ? 'Sharing location with contacts' : 'Location sharing off')} />Share live location with contacts</label>
      <h3 style={{ marginTop: 22 }}>Emergency contacts</h3>
      {contacts.data?.map((x) => <div className="al static" key={x.id}><span style={{ flex: 1 }}>📞 {x.label} · {x.phone}</span><button className="btn sm" onClick={() => remove(x.id)}>Remove</button></div>)}
      {contacts.data?.length === 0 && <div className="mu">None added yet.</div>}
      <form className="row" style={{ marginTop: 10 }} onSubmit={add}>
        <input required placeholder="Name" maxLength={100} value={c.label} onChange={(e) => setC({ ...c, label: e.target.value })} />
        <input required placeholder="Phone" maxLength={30} value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} />
        <button className="btn f0">Add</button>
      </form>
      <div className="row" style={{ marginTop: 22 }}><button className="btn" onClick={() => { logout(); nav('/'); }}>Sign out</button></div>
    </div>
  );
}
