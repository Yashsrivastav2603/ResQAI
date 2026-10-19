import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function SignIn() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.email, f.password); nav('/home'); } catch (x) { setErr(x.message); } finally { setBusy(false); }
  }
  return (
    <form className="card auth page" onSubmit={submit}>
      <h2>Welcome back 🌿</h2><div className="mu">Sign in to continue.</div>
      <label htmlFor="e">Email</label><input id="e" type="email" required autoComplete="email" value={f.email} onChange={set('email')} />
      <label htmlFor="p">Password</label><input id="p" type="password" required autoComplete="current-password" value={f.password} onChange={set('password')} />
      {err && <div className="err" role="alert">{err}</div>}
      <button className="btn p w" style={{ marginTop: 20 }} disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      <div className="alt mu">New here? <Link to="/signup">Create an account</Link></div>
    </form>
  );
}
