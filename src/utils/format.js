export const TYPES = ['FLOOD', 'EARTHQUAKE', 'FIRE', 'CYCLONE', 'LANDSLIDE', 'MEDICAL', 'OTHER'];
export const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
export const STATUSES = ['RECEIVED', 'VERIFIED', 'TEAM_DISPATCHED', 'ON_THE_WAY', 'RESOLVED'];
export const TEAMS = ['NDRF Alpha', 'Medical Unit 2', 'Fire Brigade 5', 'Air Rescue'];
export const NUMBERS = [['National Emergency', '112'], ['Fire', '101'], ['Ambulance', '108'], ['Disaster Mgmt (NDMA)', '1078'], ['Women Helpline', '1091']];
export const CHECKLIST = [['charge', 'Charge phone & power bank'], ['gobag', 'Pack a go-bag'], ['shelter', 'Know your nearest shelter'], ['contacts', 'Save emergency contacts'], ['family', 'Share location with family']];
export const pretty = (s = '') => (s ? s[0] + s.slice(1).toLowerCase().replace(/_/g, ' ') : '');
export const ago = (t) => { const m = Math.round((Date.now() - new Date(t).getTime()) / 6e4); return m < 1 ? 'just now' : m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };
export const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; };
