export const CITIES = { Delhi: [28.6, 77.2], Mumbai: [19.07, 72.87], Lucknow: [26.85, 80.95], Kolkata: [22.57, 88.36], Chennai: [13.08, 80.27], Bengaluru: [12.97, 77.59], Hyderabad: [17.38, 78.48], Guwahati: [26.14, 91.73], Jaipur: [26.91, 75.78], Patna: [25.6, 85.14] };
export const project = (lat, lng) => [((lng - 68) / 29) * 100, ((37 - lat) / 29) * 100];
export const cityPos = (c) => project(...(CITIES[c] || CITIES.Delhi));
export function nearestCity(lat, lng) {
  let best = 'Delhi', d = Infinity;
  for (const [c, [a, o]] of Object.entries(CITIES)) { const x = (a - lat) ** 2 + (o - lng) ** 2; if (x < d) { d = x; best = c; } }
  return best;
}
export const getPosition = (ms = 4000) => new Promise((res, rej) => {
  if (!navigator.geolocation) return rej(new Error('GPS not supported'));
  navigator.geolocation.getCurrentPosition((p) => res(p.coords), () => rej(new Error('GPS unavailable')), { timeout: ms });
});
