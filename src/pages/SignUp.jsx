import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../utils/geo';
import './Auth.css';

export default function SignUp() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', city: 'Delhi', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await register(f); nav('/home'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <form className="card auth page" onSubmit={submit}>
      <h2>Create your account 🌿</h2><div className="mu">Takes 20 seconds.</div>
      <label htmlFor="n">Name</label><input id="n" required maxLength={100} value={f.name} onChange={set('name')} />
      <label htmlFor="e">Email</label><input id="e" type="email" required value={f.email} onChange={set('email')} />
      <label htmlFor="ph">Phone</label><input id="ph" placeholder="+91 …" value={f.phone} onChange={set('phone')} />
      <label htmlFor="c">City</label><select id="c" value={f.city} onChange={set('city')}>{Object.keys(CITIES).map((c) => <option key={c}>{c}</option>)}</select>
      <label htmlFor="p">Password (min 8 characters)</label><input id="p" type="password" required minLength={8} autoComplete="new-password" value={f.password} onChange={set('password')} />
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn p w" style={{ marginTop: 20 }} disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
      <div className="alt mu">Already registered? <Link to="/signin">Sign in</Link></div>
    </form>
  );
}
