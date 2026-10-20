// Browser-only persistence. Everything lives in localStorage; nothing leaves this device.
const DB_KEY = 'resqai.db.v1';
const SESSION_KEY = 'resqai.session.v1';
const iso = () => new Date().toISOString();
const ago = (m) => new Date(Date.now() - m * 60000).toISOString();

/** cyrb53 string hash — fine for a local demo, NOT real security. */
export const hashPassword = (s) => {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
};

function seed() {
  const zones = [
    ['Govt. Relief Camp', 'CAMP', 'Lucknow', 26.85, 80.95, 1200, 420], ['District Hospital', 'HOSPITAL', 'Patna', 25.6, 85.14, 300, 240],
    ['Community Shelter', 'SHELTER', 'Guwahati', 26.14, 91.73, 800, 710], ['Army Base Camp', 'CAMP', 'Delhi', 28.6, 77.2, 2000, 600],
    ['Cyclone Shelter', 'SHELTER', 'Chennai', 13.08, 80.27, 900, 300], ['City Hospital', 'HOSPITAL', 'Kolkata', 22.57, 88.36, 600, 380],
    ['Municipal Shelter', 'SHELTER', 'Mumbai', 19.07, 72.87, 700, 150], ['Relief Camp', 'CAMP', 'Bengaluru', 12.97, 77.59, 500, 90],
  ].map((z, i) => ({ id: i + 1, name: z[0], type: z[1], city: z[2], latitude: z[3], longitude: z[4], capacity: z[5], occupied: z[6] }));
  const inc = (id, type, severity, status, city, latitude, longitude, description, peopleAffected, team, m) =>
    ({ id, reporterId: null, type, severity, status, city, latitude, longitude, description, peopleAffected, team, createdAt: ago(m) });
  return {
    seq: { users: 1, contacts: 0, incidents: 3, events: 3, reservations: 0, alerts: 4, chat: 0 },
    users: [{ id: 1, name: 'Control Room', email: 'authority@resqai.local', phone: '', city: 'Delhi', role: 'AUTHORITY', shareLocation: false, pw: hashPassword('Password123!'), createdAt: iso() }],
    contacts: [], reservations: [], checklist: [], chat: [], zones,
    incidents: [
      inc(1, 'FLOOD', 'CRITICAL', 'TEAM_DISPATCHED', 'Guwahati', 26.14, 91.73, 'Colony submerged, people stranded', 40, 'NDRF Alpha', 60),
      inc(2, 'FIRE', 'HIGH', 'RECEIVED', 'Mumbai', 19.07, 72.87, 'Warehouse fire spreading', 8, null, 30),
      inc(3, 'LANDSLIDE', 'MEDIUM', 'RECEIVED', 'Patna', 25.6, 85.14, 'Road blocked, vehicles trapped', 5, null, 15),
    ],
    events: [1, 2, 3].map((i) => ({ id: i, incidentId: i, status: 'RECEIVED', note: 'Report received', actorId: null, createdAt: ago(60 - (i - 1) * 20) })),
    alerts: [
      { id: 1, title: 'Heavy rain warning for eastern UP', type: 'FLOOD', severity: 'HIGH', source: 'SYSTEM', createdAt: ago(40) },
      { id: 2, title: 'NDRF teams deployed in Assam flood belt', type: 'FLOOD', severity: 'CRITICAL', source: 'SYSTEM', createdAt: ago(25) },
      { id: 3, title: 'Cyclone watch for Bay of Bengal coast', type: 'CYCLONE', severity: 'MEDIUM', source: 'SYSTEM', createdAt: ago(15) },
      { id: 4, title: 'Minor tremors recorded near Himalayan belt', type: 'EARTHQUAKE', severity: 'LOW', source: 'SYSTEM', createdAt: ago(5) },
    ],
    resources: [{ id: 1, name: 'Rescue Boats', total: 40, allocated: 28 }, { id: 2, name: 'Ambulances', total: 60, allocated: 35 }, { id: 3, name: 'Medical Kits', total: 500, allocated: 310 }, { id: 4, name: 'NDRF Teams', total: 20, allocated: 12 }],
    guides: [
      { slug: 'flood', icon: '🌊', title: 'Flood', steps: ['Move to higher ground', 'Avoid walking in floodwater', 'Switch off electricity', 'Carry water, ID and medicines'] },
      { slug: 'earthquake', icon: '🏚️', title: 'Earthquake', steps: ['Drop, cover and hold on', 'Stay away from windows', 'Exit calmly after shaking stops', 'Avoid lifts'] },
      { slug: 'fire', icon: '🔥', title: 'Fire', steps: ['Stay low under smoke', 'Check doors for heat', 'Use stairs, never lifts', 'Call 101'] },
      { slug: 'cyclone', icon: '🌀', title: 'Cyclone', steps: ['Stay indoors', 'Secure loose objects', 'Store 3 days of supplies', 'Follow evacuation orders'] },
      { slug: 'first-aid', icon: '🩹', title: 'First aid', steps: ['Call 112', 'Press firmly on bleeding', 'CPR: 30 compressions, 2 breaths', 'Keep the person warm'] },
      { slug: 'go-bag', icon: '🎒', title: 'Go-bag', steps: ['Water 3L per person per day', 'Torch and power bank', 'Medicines and first-aid', 'ID copies and cash'] },
    ],
  };
}

let mem = null; // fallback if localStorage is unavailable (private mode)
export function load() {
  try { const raw = localStorage.getItem(DB_KEY); if (raw) return JSON.parse(raw); const d = seed(); localStorage.setItem(DB_KEY, JSON.stringify(d)); return d; }
  catch { return (mem ??= seed()); }
}
export function save(d) { mem = d; try { localStorage.setItem(DB_KEY, JSON.stringify(d)); } catch { /* keep in memory */ } }
export const nextId = (d, table) => ++d.seq[table];
export const resetAll = () => { try { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); } catch { /* noop */ } mem = null; };

export const getSessionId = () => { try { return Number(localStorage.getItem(SESSION_KEY)) || null; } catch { return mem?.sessionId ?? null; } };
export const setSession = (id) => { try { id ? localStorage.setItem(SESSION_KEY, String(id)) : localStorage.removeItem(SESSION_KEY); } catch { /* noop */ } };

// In-page + cross-tab alert notifications
const listeners = new Set();
let channel = null;
try { channel = new BroadcastChannel('resqai-alerts'); channel.onmessage = (e) => listeners.forEach((f) => f(e.data)); } catch { /* unsupported */ }
export const subscribeAlerts = (f) => { listeners.add(f); return () => listeners.delete(f); };
export const emitAlert = (a) => { listeners.forEach((f) => f(a)); try { channel?.postMessage(a); } catch { /* noop */ } };
