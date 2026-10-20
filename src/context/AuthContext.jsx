import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthApi, UserApi } from '../services/endpoints';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { UserApi.me().then(setUser).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);

  const login = useCallback(async (email, password) => { const u = await AuthApi.login({ email, password }); setUser(u); return u; }, []);
  const register = useCallback(async (body) => { const u = await AuthApi.register(body); setUser(u); return u; }, []);
  const logout = useCallback(() => { AuthApi.logout(); setUser(null); }, []);
  const update = useCallback(async (patch) => setUser(await UserApi.update(patch)), []);

  const value = useMemo(() => ({ user, loading, login, register, logout, update }), [user, loading, login, register, logout, update]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
