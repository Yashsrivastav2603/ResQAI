# ResQAI – Frontend only (React + Vite)

The complete ResQAI interface (matcha theme, disaster ambience animations, SOS, AI assistant, safe zones,
rescue tracking, resources, calm space, authority centre, profile) running **entirely in the browser**.
There is no server, no API URL, and no network call. Data is stored in your browser's localStorage.

## Run
```bash
npm install
npm run dev        # http://localhost:5173
```
Production build: `npm run build` → static files in `dist/` (preview with `npm run preview`).
To host `dist/` on any static host, enable an SPA fallback (all routes → `index.html`).

## Demo accounts
- Citizen: create one on the Sign-up page.
- Responder (Authority page): `authority@resqai.local` / `Password123!`

## How data works
`src/services/localStore.js` holds the seed data and persistence; `src/services/endpoints.js` implements the
same functions the pages call (AuthApi, IncidentApi, ZoneApi, …) on top of it. Pages are unchanged.
- Alerts are delivered live between open tabs; a simulated alert is published about every 45 s.
- Reset everything: DevTools → Application → Local Storage → delete the `resqai.*` keys (or clear site data).

## Limits (by design)
- Data and logins exist only in this browser; nothing is shared between devices or users.
- Passwords are hashed with a simple non-cryptographic hash and roles are enforced client-side only,
  so this is a demo/prototype layer, not real security.

## Structure
```
src/pages        one file (+ CSS) per page
src/components   Layout, Navbar, SosButton, ChatDrawer, Ambience, Modal, Timeline, ...
src/context      AuthContext, UiContext
src/services     localStore.js (storage + seed), endpoints.js (feature logic)
src/hooks        useFetch (async loader), useAlertStream (live alerts)
src/styles       tokens, base, components, animations
```
