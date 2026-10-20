import { emitAlert, getSessionId, hashPassword, load, nextId, save, setSession } from './localStore';

const wait = () => new Promise((r) => setTimeout(r, 60)); // tiny delay so loading skeletons feel natural
const fail = (m) => { throw new Error(m); };
const newest = (a, b) => b.createdAt.localeCompare(a.createdAt);
const pub = ({ pw, ...u }) => u;
const code = (i) => `INC-${1000 + i.id}`;
const pretty = (s) => s.replace(/_/g, ' ').toLowerCase();
const TYPES = ['FLOOD', 'EARTHQUAKE', 'FIRE', 'CYCLONE', 'LANDSLIDE', 'MEDICAL', 'OTHER'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const STATUSES = ['RECEIVED', 'VERIFIED', 'TEAM_DISPATCHED', 'ON_THE_WAY', 'RESOLVED'];
const CHECK_KEYS = ['charge', 'gobag', 'shelter', 'contacts', 'family'];

const who = (d) => d.users.find((u) => u.id === getSessionId()) || fail('Please sign in');
const needAuthority = (u) => { if (u.role !== 'AUTHORITY') fail('You do not have permission to do that'); };
const incDto = (i, u, reveal) => {
  const mine = i.reporterId === u.id;
  return { id: i.id, code: code(i), type: i.type, severity: i.severity, status: i.status, city: i.city, latitude: i.latitude ?? null, longitude: i.longitude ?? null,
    description: mine || reveal ? i.description : 'Details restricted to responders', peopleAffected: i.peopleAffected, team: i.team || null, createdAt: i.createdAt, mine };
};
const addEvent = (d, inc, status, note, actorId) => d.events.push({ id: nextId(d, 'events'), incidentId: inc.id, status, note, actorId, createdAt: new Date().toISOString() });
function addAlert(d, title, type, severity, source) {
  const a = { id: nextId(d, 'alerts'), title, type, severity, source, createdAt: new Date().toISOString() };
  d.alerts.push(a); return a;
}

export const AuthApi = {
  async register({ name, email, password, phone, city }) {
    await wait(); const d = load();
    if (!name?.trim()) fail('Name is required');
    if (!/^\S+@\S+\.\S+$/.test(email || '')) fail('Enter a valid email address');
    if ((password || '').length < 8) fail('Password must be at least 8 characters');
    if (!city) fail('City is required');
    if (d.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) fail('Email already registered');
    const u = { id: nextId(d, 'users'), name: name.trim(), email: email.trim().toLowerCase(), phone: phone || '', city, role: 'CITIZEN', shareLocation: false, pw: hashPassword(password), createdAt: new Date().toISOString() };
    d.users.push(u); save(d); setSession(u.id); return pub(u);
  },
  async login({ email, password }) {
    await wait(); const d = load();
    const u = d.users.find((x) => x.email === (email || '').trim().toLowerCase() && x.pw === hashPassword(password || '')) || fail('Invalid email or password');
    setSession(u.id); return pub(u);
  },
  async logout() { setSession(null); },
};

export const UserApi = {
  async me() { await wait(); return pub(who(load())); },
  async update(b) {
    const d = load(), u = who(d);
    if (b.name?.trim()) u.name = b.name.trim();
    if (b.phone !== undefined && b.phone !== null) u.phone = b.phone;
    if (b.city) u.city = b.city;
    if (typeof b.shareLocation === 'boolean') u.shareLocation = b.shareLocation;
    save(d); return pub(u);
  },
  async contacts() { await wait(); const d = load(), u = who(d); return d.contacts.filter((c) => c.userId === u.id); },
  async addContact({ label, phone }) {
    const d = load(), u = who(d);
    if (!label?.trim() || !phone?.trim()) fail('Name and phone are required');
    if (d.contacts.filter((c) => c.userId === u.id).length >= 10) fail('You can save up to 10 contacts');
    const c = { id: nextId(d, 'contacts'), userId: u.id, label: label.trim(), phone: phone.trim() };
    d.contacts.push(c); save(d); return c;
  },
  async delContact(id) { const d = load(), u = who(d); d.contacts = d.contacts.filter((c) => !(c.id === id && c.userId === u.id)); save(d); return null; },
};

export const IncidentApi = {
  async list(q = '') {
    await wait(); const d = load(), u = who(d);
    const st = new URLSearchParams(q.replace(/^\?/, '')).get('status');
    const content = d.incidents.filter((i) => !st || i.status === st).sort(newest).map((i) => incDto(i, u, u.role === 'AUTHORITY'));
    return { content, page: { size: content.length, number: 0, totalElements: content.length, totalPages: 1 } };
  },
  async mine() { await wait(); const d = load(), u = who(d); return d.incidents.filter((i) => i.reporterId === u.id).sort(newest).map((i) => incDto(i, u, true)); },
  async stats() {
    await wait(); const d = load(), u = who(d), open = d.incidents.filter((i) => i.status !== 'RESOLVED');
    return { active: open.length, critical: open.filter((i) => i.severity === 'CRITICAL').length, resolved: d.incidents.length - open.length, mine: d.incidents.filter((i) => i.reporterId === u.id).length };
  },
  async get(id) {
    await wait(); const d = load(), u = who(d);
    const i = d.incidents.find((x) => x.id === id) || fail('Incident not found');
    const events = d.events.filter((e) => e.incidentId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)).map((e) => ({ status: e.status, note: e.note, at: e.createdAt }));
    return { incident: incDto(i, u, u.role === 'AUTHORITY'), events };
  },
  async create(b) {
    await wait(); const d = load(), u = who(d);
    if (!TYPES.includes(b.type) || !SEVERITIES.includes(b.severity)) fail('Invalid type or severity');
    if (!b.city) fail('City is required');
    if (!b.description?.trim() || b.description.length > 1000) fail('Description is required (max 1000 characters)');
    const n = Number(b.peopleAffected);
    if (!(n >= 1 && n <= 100000)) fail('People affected must be between 1 and 100000');
    const i = { id: nextId(d, 'incidents'), reporterId: u.id, type: b.type, severity: b.severity, status: 'RECEIVED', city: b.city, latitude: b.latitude ?? null, longitude: b.longitude ?? null,
      description: b.description.trim(), peopleAffected: n, team: null, createdAt: new Date().toISOString() };
    d.incidents.push(i); addEvent(d, i, 'RECEIVED', 'Report received', u.id);
    const alert = i.severity === 'CRITICAL' ? addAlert(d, `Critical ${i.type.toLowerCase()} reported in ${i.city}`, i.type, 'CRITICAL', 'INCIDENT') : null;
    save(d); if (alert) emitAlert(alert);
    return incDto(i, u, true);
  },
  async advance(id) {
    await wait(); const d = load(), u = who(d); needAuthority(u);
    const i = d.incidents.find((x) => x.id === id) || fail('Incident not found');
    if (i.status === 'RESOLVED') fail('Incident is already resolved');
    i.status = STATUSES[STATUSES.indexOf(i.status) + 1]; addEvent(d, i, i.status, 'Status updated by responder', u.id); save(d); return incDto(i, u, true);
  },
  async assign(id, team) {
    await wait(); const d = load(), u = who(d); needAuthority(u);
    const i = d.incidents.find((x) => x.id === id) || fail('Incident not found');
    if (!team?.trim()) fail('Team is required');
    i.team = team.trim(); addEvent(d, i, i.status, `Assigned to ${i.team}`, u.id); save(d); return incDto(i, u, true);
  },
  async cancel(id) {
    await wait(); const d = load(), u = who(d);
    const i = d.incidents.find((x) => x.id === id) || fail('Incident not found');
    if (i.reporterId !== u.id) fail('Only the reporter can cancel a request');
    if (i.status !== 'RECEIVED') fail('A team is already responding; it can no longer be cancelled');
    d.incidents = d.incidents.filter((x) => x.id !== id); d.events = d.events.filter((e) => e.incidentId !== id); save(d); return null;
  },
};

const SIM = [['Heavy rain warning for eastern UP', 'FLOOD', 'HIGH'], ['Cyclone watch for Bay of Bengal coast', 'CYCLONE', 'MEDIUM'], ['Minor tremors recorded near Himalayan belt', 'EARTHQUAKE', 'LOW'], ['Fire safety audit ordered in Mumbai high-rises', 'FIRE', 'MEDIUM'], ['Landslide blocks hill highway', 'LANDSLIDE', 'HIGH']];
export const AlertApi = {
  async list() { await wait(); const d = load(); who(d); return [...d.alerts].sort(newest).slice(0, 30); },
  async broadcast({ title, type, severity }) {
    await wait(); const d = load(), u = who(d); needAuthority(u);
    if (!title?.trim()) fail('Message is required');
    if (!SEVERITIES.includes(severity)) fail('Invalid severity');
    const a = addAlert(d, title.trim(), TYPES.includes(type) ? type : 'OTHER', severity, 'AUTHORITY'); save(d); emitAlert(a); return a;
  },
  /** Demo feed: publishes a plausible system alert so the dashboard feels live. */
  simulate() { const d = load(), s = SIM[Math.floor(Math.random() * SIM.length)], a = addAlert(d, s[0], s[1], s[2], 'SYSTEM'); save(d); emitAlert(a); return a; },
};

export const ZoneApi = {
  async list() { await wait(); const d = load(), u = who(d), mine = new Set(d.reservations.filter((r) => r.userId === u.id).map((r) => r.zoneId)); return [...d.zones].sort((a, b) => a.name.localeCompare(b.name)).map((z) => ({ ...z, reserved: mine.has(z.id) })); },
  async reserve(id) {
    await wait(); const d = load(), u = who(d), z = d.zones.find((x) => x.id === id) || fail('Safe zone not found');
    if (d.reservations.some((r) => r.zoneId === id && r.userId === u.id)) fail('You already reserved a spot here');
    if (z.occupied >= z.capacity) fail('This safe zone is full');
    z.occupied += 1; d.reservations.push({ id: nextId(d, 'reservations'), zoneId: id, userId: u.id }); save(d); return { ...z, reserved: true };
  },
  async release(id) {
    await wait(); const d = load(), u = who(d), z = d.zones.find((x) => x.id === id) || fail('Safe zone not found');
    if (!d.reservations.some((r) => r.zoneId === id && r.userId === u.id)) fail('Reservation not found');
    d.reservations = d.reservations.filter((r) => !(r.zoneId === id && r.userId === u.id)); z.occupied = Math.max(0, z.occupied - 1); save(d); return { ...z, reserved: false };
  },
};

export const ResourceApi = {
  async list() { await wait(); const d = load(); needAuthority(who(d)); return d.resources; },
  async update(id, allocated) {
    await wait(); const d = load(); needAuthority(who(d));
    const r = d.resources.find((x) => x.id === id) || fail('Resource not found');
    if (!(allocated >= 0)) fail('Invalid amount');
    if (allocated > r.total) fail(`Cannot allocate more than the total (${r.total})`);
    r.allocated = allocated; save(d); return r;
  },
};

const checklistOf = (d, u) => Object.fromEntries(CHECK_KEYS.map((k) => [k, !!d.checklist.find((c) => c.userId === u.id && c.key === k)?.done]));
export const ChecklistApi = {
  async get() { await wait(); const d = load(); return checklistOf(d, who(d)); },
  async set(key, done) {
    const d = load(), u = who(d);
    if (!CHECK_KEYS.includes(key)) fail('Unknown checklist item');
    const row = d.checklist.find((c) => c.userId === u.id && c.key === key);
    row ? (row.done = !!done) : d.checklist.push({ userId: u.id, key, done: !!done });
    save(d); return checklistOf(d, u);
  },
};

export const GuideApi = { async list() { await wait(); return load().guides; } };

const ALIAS = { quake: 'earthquake', storm: 'cyclone', medic: 'first aid', bleed: 'first aid', kit: 'go-bag', bag: 'go-bag', wildfire: 'fire', tsunami: 'flood' };
function reply(msg, d, u) {
  let q = msg.toLowerCase();
  for (const [k, v] of Object.entries(ALIAS)) if (q.includes(k)) q += ` ${v}`;
  const g = d.guides.find((x) => q.includes(x.title.toLowerCase()));
  if (g) return `${g.icon} ${g.title}: ${g.steps.join('. ')}. If you are in danger, press SOS or call 112.`;
  if (/calm|panic|anx|scared|afraid|stress/.test(q)) return 'Take a slow breath with me: in for 4, hold 4, out for 6. You are not alone. Open Calm Space for a guided exercise.';
  if (/status|request|rescue|track/.test(q)) { const l = d.incidents.filter((i) => i.reporterId === u.id).sort(newest)[0]; return l ? `Your latest request ${code(l)} is ${pretty(l.status)}.` : 'You have no active request yet. Use Report or SOS.'; }
  if (/shelter|safe|nearest|hospital/.test(q)) {
    const z = d.zones.find((x) => x.city.toLowerCase() === u.city.toLowerCase() && x.capacity > x.occupied) || [...d.zones].sort((a, b) => b.capacity - b.occupied - (a.capacity - a.occupied))[0];
    return z ? `Nearest safe zone: ${z.name}, ${z.city} (${z.capacity - z.occupied} spaces free).` : 'No safe zones are available right now.';
  }
  return 'I can guide you through floods, earthquakes, fires, cyclones, first aid, go-bags, shelters, and staying calm. If you are in danger, tap SOS or call 112.';
}
export const AssistantApi = {
  async chat(message) {
    await wait(); const d = load(), u = who(d);
    if (!message?.trim() || message.length > 500) fail('Message must be 1–500 characters');
    const text = reply(message, d, u), now = new Date().toISOString();
    d.chat.push({ id: nextId(d, 'chat'), userId: u.id, role: 'user', content: message.trim(), createdAt: now }, { id: nextId(d, 'chat'), userId: u.id, role: 'assistant', content: text, createdAt: now });
    save(d); return { role: 'assistant', content: text, createdAt: now };
  },
  async history() { await wait(); const d = load(), u = who(d); return d.chat.filter((m) => m.userId === u.id).slice(-50).map(({ role, content, createdAt }) => ({ role, content, createdAt })); },
  async clear() { const d = load(), u = who(d); d.chat = d.chat.filter((m) => m.userId !== u.id); save(d); return null; },
};
