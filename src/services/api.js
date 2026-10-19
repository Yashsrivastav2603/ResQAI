const BASE = import.meta.env.VITE_API_URL || '';
let token = localStorage.getItem('rq_token');
export const getToken = () => token;
export const setToken = (t) => { token = t; t ? localStorage.setItem('rq_token', t) : localStorage.removeItem('rq_token'); };
export const apiUrl = (p) => `${BASE}/api${p}`;

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(apiUrl(path), {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 401 && token) { setToken(null); window.dispatchEvent(new Event('rq:logout')); }
  if (!res.ok) {
    const p = await res.json().catch(() => ({}));
    throw new Error(p.detail || p.title || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}
export const api = {
  get: (p) => request(p),
  post: (p, b) => request(p, { method: 'POST', body: b ?? {} }),
  put: (p, b) => request(p, { method: 'PUT', body: b }),
  patch: (p, b) => request(p, { method: 'PATCH', body: b ?? {} }),
  del: (p) => request(p, { method: 'DELETE' }),
};
