import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import SosButton from './SosButton';

const LINKS = [['/home', 'Home'], ['/report', 'Report'], ['/zones', 'Safe Zones'], ['/tracking', 'Tracking'], ['/resources', 'Resources'], ['/calm', 'Calm Space']];

export default function Navbar() {
  const { user } = useAuth();
  const { toggleTheme } = useUi();
  return (
    <nav className="top">
      <Link className="logo" to="/">🌿 SURVORA-<b>AI</b></Link>
      {user ? (
        <>
          {LINKS.map(([to, label]) => <NavLink key={to} className="l" to={to}>{label}</NavLink>)}
          {user.role === 'AUTHORITY' && <NavLink className="l" to="/authority">Authority</NavLink>}
          <NavLink className="l" to="/profile">Profile</NavLink>
          <SosButton />
        </>
      ) : (
        <><NavLink className="l" to="/signin">Sign in</NavLink><Link className="btn p sm" to="/signup">Get started</Link></>
      )}
      <button className="btn sm" onClick={toggleTheme} aria-label="Toggle theme">◐</button>
    </nav>
  );
}
