import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getToken, setToken } from '../services/api';
import { AuthApi, UserApi } from '../services/endpoints';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  useEffect(() => {
    if (getToken()) UserApi.me().then(setUser).catch(() => setToken(null)).finally(() => setLoading(false));
    const out = () => setUser(null);
    window.addEventListener('rq:logout', out);
    return () => window.removeEventListener('rq:logout', out);
  }, []);

  const accept = (r) => { setToken(r.token); setUser(r.user); return r.user; };
  const login = useCallback(async (email, password) => accept(await AuthApi.login({ email, password })), []);
  const register = useCallback(async (body) => accept(await AuthApi.register(body)), []);
  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  const update = useCallback(async (patch) => setUser(await UserApi.update(patch)), []);

  const value = useMemo(() => ({ user, loading, login, register, logout, update }), [user, loading, login, register, logout, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
