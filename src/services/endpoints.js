import { api } from './api';
export const AuthApi = { login: (b) => api.post('/auth/login', b), register: (b) => api.post('/auth/register', b) };
export const UserApi = {
  me: () => api.get('/users/me'), update: (b) => api.patch('/users/me', b),
  contacts: () => api.get('/contacts'), addContact: (b) => api.post('/contacts', b), delContact: (id) => api.del(`/contacts/${id}`),
};
export const IncidentApi = {
  list: (q = '?size=100') => api.get(`/incidents${q}`), mine: () => api.get('/incidents/mine'), stats: () => api.get('/incidents/stats'),
  get: (id) => api.get(`/incidents/${id}`), create: (b) => api.post('/incidents', b),
  advance: (id) => api.patch(`/incidents/${id}/advance`), assign: (id, team) => api.patch(`/incidents/${id}/assign`, { team }), cancel: (id) => api.del(`/incidents/${id}`),
};
export const AlertApi = { list: () => api.get('/alerts'), broadcast: (b) => api.post('/alerts', b) };
export const ZoneApi = { list: () => api.get('/zones'), reserve: (id) => api.post(`/zones/${id}/reserve`), release: (id) => api.del(`/zones/${id}/reserve`) };
export const ResourceApi = { list: () => api.get('/resources'), update: (id, allocated) => api.patch(`/resources/${id}`, { allocated }) };
export const ChecklistApi = { get: () => api.get('/checklist'), set: (k, done) => api.put(`/checklist/${k}`, { done }) };
export const GuideApi = { list: () => api.get('/guides') };
export const AssistantApi = { chat: (message) => api.post('/assistant/chat', { message }), history: () => api.get('/assistant/history'), clear: () => api.del('/assistant/history') };
