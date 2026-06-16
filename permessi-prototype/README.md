# App Permessi — prototipo esplorativo (HTML)

Interactive HTML prototype for the leave-management app ("Gestione permessi"), built from the FigJam
boards and the Next Design mockup. **All data is fake and lives in memory** — reloading the page (or
the ↩ button in the demo switcher) restores the starting scenario. "Today" is pinned to **15/06/2026**
so the demo is deterministic.

## How to run
- Double-click `index.html` (works offline, no build, no dependencies), **or**
- serve the folder with any static server.

## Demo controls
- **Persona switcher** (bottom right): Employee (Luca) → Approver (Giulia, team Technology) → Global
  approver (Elena, HR). Rights are cumulative; tabs appear accordingly.
- **Deep links**: `#luca/personale`, `#giulia/approvazione`, `#elena/globale`, `#luca/calendar`, …
- Buttons that are out of scope (AI assistant, profile, search, CRM sidebar) show a yellow toast.

## What's implemented
Insert request (rules per type: hours/days counting, blocking/non-blocking documents, 48h notice
check), edit/delete pending requests, propose modify/delete on approved ones, approve/reject with
mandatory motivation, mass approval, HR insert-on-behalf (conto terzi), live notifications + archive,
team day view with observer markers, month calendar with role-based layers, residui with fake AI
projection, SLA alerts (notice not respected / approval window expiring–expired).

## Structure
- `css/tokens.css` — Figma variables (Next Design Library) as CSS custom properties + brand fonts
- `css/app.css` — components mapped from the library (Card permessi, chips, pills, day tabs…)
- `js/data.js` — fake org, absence types, seeded requests/notifications — **edit this to change the demo**
- `js/app.js` — state, rendering, flows
