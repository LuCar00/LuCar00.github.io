/* ==========================================================================
   APP PERMESSI — logica del prototipo
   Stato in memoria (reset al reload o col bottone Reset).
   Routing leggero via hash: #<personaId>/<personale|approvazione|globale|calendar>
   ========================================================================== */

/* ============================== ICONE (stile Line Awesome, stroke) ======= */
const I = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}${extra}</svg>`;

const ICONS = {
  calendar: I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>'),
  'calendar-plus': I('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18M12 13v6M9 16h6"/>'),
  clock: I('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  check: I('<path d="M4 12.5l5 5L20 6.5"/>'),
  'check-circle': I('<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 5-5.5"/>'),
  x: I('<path d="M6 6l12 12M18 6L6 18"/>'),
  'x-circle': I('<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>'),
  pencil: I('<path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z"/><path d="M14.5 6.5l3 3"/>'),
  upload: I('<path d="M12 16V5M7.5 9.5L12 5l4.5 4.5"/><path d="M4 19h16"/>'),
  users: I('<circle cx="9" cy="8.5" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><circle cx="17" cy="9.5" r="2.4"/><path d="M16.5 14c2.4.2 4 1.7 4.5 4.3"/>'),
  user: I('<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-3.7 3.5-5.5 7-5.5s6.2 1.8 7 5.5"/>'),
  'user-plus': I('<circle cx="10" cy="8" r="3.4"/><path d="M3.5 20c.7-3.5 3.2-5.3 6.5-5.3s5.8 1.8 6.5 5.3"/><path d="M19 8v6M16 11h6"/>'),
  star: I('<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1.1 5.8L12 16.9l-5.3 2.7 1.1-5.8-4.3-4.1 5.9-.8z"/>'),
  search: I('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l5 5"/>'),
  eye: I('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
  'chevron-left': I('<path d="M14.5 5.5L8 12l6.5 6.5"/>'),
  'chevron-right': I('<path d="M9.5 5.5L16 12l-6.5 6.5"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  pin: I('<path d="M9 4h6l-.7 6.2 2.7 2.8H7l2.7-2.8z"/><path d="M12 13v7"/>'),
  gift: I('<rect x="4" y="9" width="16" height="12" rx="1.5"/><path d="M4 13h16M12 9v12M12 9c-4 0-5-2-5-3.2C7 4.6 8 4 9 4c2 0 3 2.5 3 5zm0 0c4 0 5-2 5-3.2C17 4.6 16 4 15 4c-2 0-3 2.5-3 5z"/>'),
  trophy: I('<path d="M8 4h8v5a4 4 0 01-8 0z"/><path d="M8 5H5a3 3 0 003 4M16 5h3a3 3 0 01-3 4M12 13v4M8.5 20h7M10 17h4v3h-4z"/>'),
  handshake: I('<path d="M3 8l4-2 5 2 5-2 4 2v7l-4 2-5-2-5 2-4-2z" transform="scale(.92) translate(1 1.5)"/>'),
  wave: I('<path d="M7 11V6.5a1.5 1.5 0 013 0V11m0-5.5v-1a1.5 1.5 0 013 0V11m0-6a1.5 1.5 0 013 0v7.5M7 11l-1.8-2a1.6 1.6 0 00-2.4 2L7 16a7 7 0 0012 1.5V8a1.5 1.5 0 00-3 0"/>'),
  doc: I('<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>'),
  paperclip: I('<path d="M8 12.5l6.5-6.5a3 3 0 014.3 4.3L10 19a4.5 4.5 0 01-6.4-6.4L11 5"/>'),
  alert: I('<path d="M12 4L2.5 20h19z"/><path d="M12 10v5M12 17.5v.5"/>'),
  bell: I('<path d="M6 9.5a6 6 0 0112 0c0 5 2 6.5 2 6.5H4s2-1.5 2-6.5z"/><path d="M10 19a2 2 0 004 0"/>'),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M12 2.5l1.2 2.6 2.8-.6 1 2.7 2.8.7-.6 2.8 2.1 1.8-2.1 1.8.6 2.8-2.8.7-1 2.7-2.8-.6L12 21.5l-1.2-2.6-2.8.6-1-2.7-2.8-.7.6-2.8L2.7 12l2.1-1.8-.6-2.8 2.8-.7 1-2.7 2.8.6z" stroke-width="1.2"/>'),
  sparkle: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>'),
  inbox: I('<path d="M4 5h16v14H4z"/><path d="M4 13h5l1.5 2.5h3L15 13h5"/>'),
  undo: I('<path d="M8 5L4 9l4 4"/><path d="M4 9h10a6 6 0 016 6v1"/>'),
  sun: I('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'),
  baby: I('<circle cx="12" cy="12" r="9"/><circle cx="9" cy="11" r=".5"/><circle cx="15" cy="11" r=".5"/><path d="M9 15.5c1.8 1.4 4.2 1.4 6 0M12 3v3"/>'),
  thermometer: I('<path d="M10 4a2 2 0 014 0v9.5a4.5 4.5 0 11-4 0z"/><path d="M12 9v7"/>'),
  laptop: I('<rect x="5" y="5" width="14" height="9" rx="1.5"/><path d="M2.5 18.5h19l-2-3H4.5z"/>'),
  shield: I('<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/>'),
  headset: I('<path d="M4 13a8 8 0 0116 0"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a3 3 0 01-3 2h-3"/>'),
  home: I('<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'),
  chart: I('<path d="M4 20V4"/><path d="M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>'),
  briefcase: I('<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>'),
  building: I('<rect x="5" y="3" width="14" height="18"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M11 21v-3h2v3"/>'),
  megaphone: I('<path d="M4 10v4l12 4V6z"/><path d="M16 8.5a3.5 3.5 0 010 7M6 14.5l1 5h2.5l-.8-4.4"/>'),
  globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c-5.5 5.5-5.5 12.5 0 18M12 3c5.5 5.5 5.5 12.5 0 18"/>'),
  download: I('<path d="M12 5v11M7.5 12L12 16.5 16.5 12"/><path d="M4 19h16"/>'),
  newspaper: I('<rect x="3" y="5" width="15" height="15" rx="1.5"/><path d="M18 9h3v9a2 2 0 01-2 2H6"/><path d="M6.5 9.5h8M6.5 13h8M6.5 16.5h5"/>'),
  info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5v.5"/>'),
};
const ic = (name) => ICONS[name] || ICONS.doc;

/* ============================== UTILS ==================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const dt = (iso) => new Date(iso + 'T12:00:00');
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (isoStr, n) => { const d = dt(isoStr); d.setDate(d.getDate() + n); return iso(d); };
const isWeekend = (isoStr) => { const g = dt(isoStr).getDay(); return g === 0 || g === 6; };
const mondayOf = (isoStr) => { const d = dt(isoStr); const off = (d.getDay() + 6) % 7; d.setDate(d.getDate() - off); return iso(d); };
const daysBetween = (a, b) => Math.round((dt(b) - dt(a)) / 86400000);
const workingDays = (start, end) => { let n = 0, c = start; while (c <= end) { if (!isWeekend(c)) n++; c = addDays(c, 1); } return n; };
const fmt = (isoStr) => { const [y, m, d] = isoStr.split('-'); return `${d}/${m}/${y}`; };
const fmtShort = (isoStr) => { const [, m, d] = isoStr.split('-'); return `${d}/${m}`; };
const fmtLong = (isoStr) => dt(isoStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
const fmtDow = (isoStr) => dt(isoStr).toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const typeOf = (id) => TYPES.find((t) => t.id === id);
const personOf = (id) => PEOPLE.find((p) => p.id === id);
const teamOf = (id) => TEAMS.find((t) => t.id === id);
const fullName = (p) => `${p.first} ${p.last}`;
const shortName = (p) => `${p.first[0]}. ${p.last}`;
const initials = (p) => `${p.first[0]}${p.last[0]}`;
const avatarHtml = (p, lg = false) =>
  `<span class="avatar${lg ? ' avatar--lg' : ''}" style="background:hsl(${p.hue} 42% 88%);color:hsl(${p.hue} 45% 32%)">${initials(p)}</span>`;

/* ============================== STATO ==================================== */
const APPROVAL_SLA_WARN = 3;     // giorni: "in scadenza"
const APPROVAL_SLA_EXPIRED = 6;  // giorni: "scaduta"

function freshData() {
  return {
    requests: JSON.parse(JSON.stringify(SEED_REQUESTS)),
    notifications: JSON.parse(JSON.stringify(SEED_NOTIFICATIONS)),
    updates: JSON.parse(JSON.stringify(SEED_UPDATES)),
  };
}

const state = {
  personaId: 'luca',
  view: 'dashboard',           // dashboard | calendar
  tab: 'personale',            // personale | approvazione | globale
  reqTab: 'upcoming',          // upcoming | history | denied
  notifTab: 'active',          // active | archived
  globalTab: 'manage',         // manage (in ritardo / fuori preavviso) | all
  weekStart: mondayOf(DEMO_TODAY),
  selectedDay: DEMO_TODAY,
  calMonth: DEMO_TODAY.slice(0, 7),
  calLayer: 'mine',            // mine | team | company
  selection: [],               // ids selezionati per azioni massive
  data: freshData(),
};

let draft = null;              // form "nuova richiesta" (modale aperta)
let idSeq = 100;
const newId = (p) => `${p}${idSeq++}`;

/* ---- ruoli ---- */
const persona = () => personOf(state.personaId);
const personaDef = () => PERSONAS.find((p) => p.personId === state.personaId);
const managedBy = (pid) => PEOPLE.filter((p) => p.approverId === pid);
const isApprover = () => managedBy(state.personaId).length > 0;
const isGlobal = () => personaDef().key === 'global';
const isHR = () => persona().teamId === 'people'; // competenza HR: verifica/approvazione documenti
const canSeeJustification = (targetPerson) =>
  targetPerson.id === state.personaId || isGlobal() ||
  targetPerson.approverId === state.personaId;

/* ---- richieste ---- */
const reqs = () => state.data.requests;
const reqType = (r) => typeOf(r.typeId);
const isSingleDay = (r) => r.start === r.end;
const amountLabel = (r) => reqType(r).unit === 'hours' ? `${r.hours} ore` : `${workingDays(r.start, r.end)} giorni`;
const whenLabel = (r) => isSingleDay(r) ? fmt(r.start) : `${fmt(r.start)} - ${fmt(r.end)}`;
const coversDay = (r, day) => r.start <= day && day <= r.end;
const preavvisoViolated = (r) => {
  const t = reqType(r);
  return t.preavvisoH != null && daysBetween(r.requestedOn, r.start) * 24 < t.preavvisoH;
};
const slaState = (r) => {
  if (r.status !== 'pending') return null;
  const d = daysBetween(r.requestedOn, DEMO_TODAY);
  if (d >= APPROVAL_SLA_EXPIRED) return 'expired';
  if (d >= APPROVAL_SLA_WARN) return 'warn';
  return null;
};
const overlapCount = (r) => {
  const team = personOf(r.personId).teamId;
  return reqs().filter((o) =>
    o.id !== r.id && o.status !== 'denied' &&
    personOf(o.personId).teamId === team && o.personId !== r.personId &&
    o.start <= r.end && r.start <= o.end
  ).length;
};
/* Residuo per i tipi con contatore (ferie: giorni, rol: ore).
   È un dato INDICATIVO: fa fede solo la busta paga (vedi nota nel form). */
function residuoFor(personId, typeId) {
  const bal = SEED_BALANCES[personId] || { ferieTotal: 26, rolTotalH: 56 };
  const approved = reqs().filter((r) => r.personId === personId && r.status === 'approved' && r.typeId === typeId);
  if (typeId === 'ferie') {
    const used = approved.reduce((s, r) => s + workingDays(r.start, r.end), 0);
    return { left: bal.ferieTotal - used, total: bal.ferieTotal, unit: 'giorni' };
  }
  if (typeId === 'rol') {
    const used = approved.reduce((s, r) => s + (r.hours || 0), 0);
    return { left: bal.rolTotalH - used, total: bal.rolTotalH, unit: 'ore' };
  }
  return null;
}

const pendingQueue = (pid) => reqs().filter((r) => r.status === 'pending' && r.personId !== pid && personOf(r.personId).approverId === pid);
const proposalQueue = (pid) => reqs().filter((r) => r.proposal && r.personId !== pid && personOf(r.personId).approverId === pid);
const companyPending = () => reqs().filter((r) => r.status === 'pending' && r.personId !== state.personaId);
// Coda "da gestire" del global approver — è il DEFAULT della vista Globale:
//  overdue = l'approvatore di competenza ha superato il tempo massimo per decidere
//  late    = il dipendente ha inserito sotto il preavviso minimo del tipo (es. < 48h)
const isOverdue = (r) => slaState(r) === 'expired';
const isLate = (r) => r.status === 'pending' && preavvisoViolated(r);
const globalManageQueue = () => companyPending().filter((r) => isOverdue(r) || isLate(r));
const myNotifs = () => state.data.notifications.filter((n) => n.personId === state.personaId);

/* ---- notifiche & toast ---- */
function notify(personId, icon, title, meta, deadline) {
  state.data.notifications.unshift({ id: newId('nt'), personId, date: DEMO_TODAY, icon, title, meta, deadline, archived: false });
}
function toast(msg, kind = 'green', icon = 'check-circle') {
  const root = $('#toastRoot');
  const el = document.createElement('div');
  el.className = `toast toast--${kind}`;
  el.innerHTML = `${ic(icon)}<span>${msg}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add('is-visible')); // pattern 5
  setTimeout(() => { el.classList.remove('is-visible'); setTimeout(() => el.remove(), 350); }, 3600);
}

/* ============================== RENDER =================================== */
let lastViewKey = '';
function render() {
  renderSidebar();
  renderTopbar();
  renderSwitcher();
  const app = $('#app');
  app.innerHTML = state.view === 'calendar' ? viewCalendar() : viewDashboard();
  const key = `${state.personaId}/${state.view}/${state.tab}`;
  if (key !== lastViewKey) animateIn(app); // anima solo ai cambi di vista, non a ogni click
  lastViewKey = key;
  writeHash();
}

function animateIn(root) { // pattern 5 + stagger
  const els = root.querySelectorAll('.panel, .kpi, .welcome');
  els.forEach((el, i) => {
    el.classList.add('fade-in');
    setTimeout(() => requestAnimationFrame(() => el.classList.add('is-visible')), i * 45);
  });
}

/* ---- shell ---- */
function renderSidebar() {
  $('#sidebarNav').innerHTML =
    ['home', 'briefcase', 'building', 'users', 'chart', 'doc', 'megaphone', 'gear']
      .map((n, idx) => `<button class="sidebar__btn${idx === 3 ? ' is-active' : ''}" data-action="sidebar" title="Modulo CRM (decorativo)">${ic(n)}</button>`)
      .join('');
  $('#searchIcon').innerHTML = ic('search');
}

function renderTopbar() {
  const p = persona();
  const activeNotifs = myNotifs().filter((n) => !n.archived).length;
  $('#topbarActions').innerHTML = `
    <button class="topbar__iconbtn" data-action="oos" data-msg="Supporto: fuori scope per il prototipo" title="Supporto">${ic('headset')}</button>
    <button class="topbar__iconbtn" data-action="oos" data-msg="Gestione utenti: fuori scope per il prototipo" title="Utenti">${ic('user-plus')}</button>
    <button class="topbar__iconbtn" data-action="goto-calendar" title="Calendario">${ic('calendar')}</button>
    <button class="topbar__iconbtn" data-action="goto-notifiche" title="Notifiche">
      ${ic('bell')}${activeNotifs ? `<span class="topbar__badge">${activeNotifs}</span>` : ''}
    </button>
    <button class="topbar__avatar" style="background:hsl(${p.hue} 42% 78%);color:hsl(${p.hue} 50% 24%)" data-action="oos" data-msg="Profilo utente: fuori scope per il prototipo" title="${esc(fullName(p))}">${initials(p)}</button>`;
}

function renderSwitcher() {
  $('#switcher').innerHTML = `
    <span class="persona-switcher__label">Demo</span>
    ${PERSONAS.map((pd) => {
      const p = personOf(pd.personId);
      return `<button class="persona-btn${pd.personId === state.personaId ? ' is-active' : ''}" data-action="switch-persona" data-id="${pd.personId}" title="${esc(fullName(p))} — ${pd.label}">
        ${avatarHtml(p)}
        <span class="persona-btn__txt"><span class="persona-btn__role">${pd.label}</span><span class="persona-btn__sub">${pd.sub}</span></span>
      </button>`;
    }).join('')}
    <span class="persona-switcher__divider"></span>
    <button class="iconbtn" data-action="reset" title="Reset dati demo">${ic('undo')}</button>`;
}

/* ---- dashboard ---- */
function viewDashboard() {
  return `${welcomeHtml()}${state.tab === 'personale' ? tabPersonale() : state.tab === 'approvazione' ? tabApprovazione() : tabGlobale()}`;
}

/* Chip_expandable (Next DS): main pill = team, al click rivela l'approver.
   Toggle puramente presentazionale — non passa dallo state, così l'animazione
   parte sempre dallo stato chiuso (vedi handler 'toggle-team-chip'). */
function teamChipHtml(p, team) {
  const ap = p.approverId ? personOf(p.approverId) : null;
  const approver = ap ? fullName(ap) : 'Direzione';
  return `<span class="chip-exp" data-action="toggle-team-chip" role="button" tabindex="0" aria-expanded="false" title="Il tuo approvatore: ${esc(approver)}">
    <span class="chip-exp__main">${esc(team.label)}</span>
    <span class="chip-exp__more">${esc(approver)}</span>
  </span>`;
}

function welcomeHtml() {
  const p = persona();
  const team = teamOf(p.teamId);
  const tabs = [
    { id: 'personale', label: 'Personale', icon: 'star', show: true, count: 0 },
    { id: 'approvazione', label: 'Approvazione', icon: 'user', show: isApprover(), count: pendingQueue(state.personaId).length + proposalQueue(state.personaId).length },
    { id: 'globale', label: 'Globale', icon: 'globe', show: isGlobal(), count: globalManageQueue().length },
  ].filter((t) => t.show);
  const inCal = state.view === 'calendar';
  // la barra dei ruoli esiste solo se c'è davvero qualcosa tra cui scegliere
  const showTabs = state.view === 'dashboard' && tabs.length > 1;
  return `
  <section class="welcome${showTabs ? '' : ' welcome--solo'}">
    <div class="welcome__date">${ic('calendar')} ${fmtLong(DEMO_TODAY)}</div>
    <div class="welcome__row">
      <div>
        <h2 class="welcome__greeting">Buongiorno, ${esc(p.first)}</h2>
        <div class="welcome__sub">
          <span class="welcome__role">${esc(p.role)}</span>
          ${teamChipHtml(p, team)}
        </div>
      </div>
      <div class="welcome__actions">
        <button class="btn" data-action="oos" data-msg="Sezione “I miei dati”: non inclusa — lì vivrà anche il ricalcolo dei residui dalla busta paga">${ic('user')} I miei dati</button>
        <button class="btn" data-action="${inCal ? 'goto-dashboard' : 'goto-calendar'}">${ic('calendar')} ${inCal ? 'Dashboard' : 'Calendario'}</button>
        <button class="btn btn--dark" data-action="new-request">${ic('plus')} Inserisci richiesta</button>
        <button class="btn btn--ai" data-action="oos" data-msg="Assistente AI: fuori scope per questo prototipo" title="Assistente AI">${ic('sparkle')}</button>
      </div>
    </div>
    ${showTabs ? `<nav class="role-tabs">
      ${tabs.map((t) => `<button class="role-tab${state.tab === t.id ? ' is-active' : ''}" data-action="set-tab" data-id="${t.id}">
        ${ic(t.icon)} ${t.label}${t.count ? `<span class="role-tab__count">${t.count}</span>` : ''}
      </button>`).join('')}
    </nav>` : ''}
  </section>`;
}

/* ============================== TAB PERSONALE ============================ */
function tabPersonale() {
  return `
  <section class="panel" style="margin-bottom:var(--sp-300)">
    <div class="panel__head">${ic('newspaper')}<h3 class="panel__title">Ultimi update</h3></div>
    ${tickerHtml()}
  </section>
  <div class="dash-grid">
    <div class="dash-col">${panelNotifiche()}</div>
    <div class="dash-col">${panelRichieste()}</div>
    <div class="dash-col">${panelTeam()}</div>
  </div>`;
}

function tickerHtml() {
  return `<div class="ticker"><div class="ticker__rail">
    ${state.data.updates.map((u) => {
      if (u.pinned) return `<span class="ticker__pill ticker__pill--pinned">${ic('pin')} ${esc(u.text)}</span>`;
      const p = personOf(u.personId);
      return `<span class="ticker__pill">${ic(u.icon)} ${avatarHtml(p)} <strong>${esc(fullName(p))}</strong> ${esc(u.text)}</span>`;
    }).join('')}
  </div></div>`;
}

function panelNotifiche() {
  const list = myNotifs().filter((n) => state.notifTab === 'active' ? !n.archived : n.archived);
  const groups = {};
  list.forEach((n) => { (groups[n.date] = groups[n.date] || []).push(n); });
  const dates = Object.keys(groups).sort().reverse();
  return `
  <section class="panel" id="panel-notifiche">
    <div class="panel__head">${ic('bell')}<h3 class="panel__title">Notifiche</h3></div>
    <div class="seg">
      <button class="seg__btn${state.notifTab === 'active' ? ' is-active' : ''}" data-action="notif-tab" data-id="active">Attive</button>
      <button class="seg__btn${state.notifTab === 'archived' ? ' is-active' : ''}" data-action="notif-tab" data-id="archived">Archiviate</button>
    </div>
    <p class="panel__hint">${state.notifTab === 'active' ? 'Segna le notifiche di cui hai preso visione per archiviarle' : 'Notifiche già archiviate'}</p>
    ${dates.length === 0 ? `<div class="empty">Nessuna notifica ${state.notifTab === 'active' ? 'attiva' : 'archiviata'}</div>` : ''}
    ${dates.map((d) => `
      <div class="notif-group">${fmtLong(d)}</div>
      ${groups[d].map((n) => `
        <div class="notif" data-notif="${n.id}">
          ${state.notifTab === 'active'
            ? `<button class="notif__check" data-action="archive-notif" data-id="${n.id}" title="Archivia">${ic('check')}</button>`
            : `<span class="notif__check" style="border-color:var(--green);color:var(--green)">${ic('check')}</span>`}
          <div class="notif__body">
            <div class="notif__title">${ic(n.icon)} ${esc(n.title)}</div>
            <div class="notif__meta">${n.deadline ? `<span class="notif__deadline">Scadenza: ${fmt(n.deadline)}</span>` : ''}${esc(n.meta)}</div>
          </div>
        </div>`).join('')}
    `).join('')}
  </section>`;
}

function panelRichieste() {
  const pid = state.personaId;
  const mine = reqs().filter((r) => r.personId === pid);
  const upcoming = mine.filter((r) => r.status !== 'denied' && r.end >= DEMO_TODAY).sort((a, b) => a.start < b.start ? -1 : 1);
  const history = mine.filter((r) => r.status !== 'denied' && r.end < DEMO_TODAY).sort((a, b) => a.start < b.start ? 1 : -1);
  const denied = mine.filter((r) => r.status === 'denied').sort((a, b) => a.start < b.start ? 1 : -1);
  const list = state.reqTab === 'upcoming' ? upcoming : state.reqTab === 'history' ? history : denied;
  const hints = {
    upcoming: 'Le tue prossime richieste, a partire dalla più vicina',
    history: 'Le richieste passate, dalla più recente',
    denied: 'Le richieste che non sono state approvate',
  };
  return `
  <section class="panel">
    <div class="panel__head">${ic('calendar-plus')}<h3 class="panel__title">Richieste</h3></div>
    <div class="seg">
      <button class="seg__btn${state.reqTab === 'upcoming' ? ' is-active' : ''}" data-action="req-tab" data-id="upcoming">Prossime richieste</button>
      <button class="seg__btn${state.reqTab === 'history' ? ' is-active' : ''}" data-action="req-tab" data-id="history">Storico richieste</button>
      <button class="seg__btn${state.reqTab === 'denied' ? ' is-active' : ''}" data-action="req-tab" data-id="denied">Richieste negate</button>
    </div>
    <p class="panel__hint">${hints[state.reqTab]}</p>
    ${list.length === 0 ? `<div class="empty">Niente qui — ${state.reqTab === 'upcoming' ? 'inserisci una nuova richiesta col bottone in alto' : 'nessuna voce'}</div>`
      : `<div class="req-list">${list.map((r) => reqCardOwn(r)).join('')}</div>`}
  </section>`;
}

function statusChip(r) {
  if (r.status === 'approved') return `<span class="chip chip--green">${ic('check')} Approvata</span>`;
  if (r.status === 'denied') return `<span class="chip chip--red">${ic('x')} Negata</span>`;
  return `<span class="chip chip--yellow">${ic('clock')} In approvazione</span>`;
}

function reqMetaTop(r, { showOverlap = true } = {}) {
  // rosso quando in ritardo: preavviso non rispettato (lato dipendente) o approvazione scaduta (lato approvatore)
  const flagged = r.status === 'pending' && (preavvisoViolated(r) || isOverdue(r));
  const olap = overlapCount(r);
  return `
  <div class="req__top">
    <div class="req__when">${ic('calendar')}<b>${whenLabel(r)}</b><i>/</i><i>${amountLabel(r)}</i></div>
    <div class="req__asked${flagged ? ' is-flagged' : ''}">
      <span>Richiesta del</span><b>${fmt(r.requestedOn)}</b>
      ${showOverlap ? `<span class="chip ${olap > 0 ? 'chip--brass' : 'chip--neutral'}" title="${olap} colleghi del team assenti in date sovrapposte">${ic('users')} ${olap}</span>` : ''}
    </div>
  </div>`;
}

// Riga allegato. docMode: 'own' (dipendente: può rimuovere) | 'readonly' (approver: sola lettura)
// | 'hr' (competenza HR: approva/rifiuta il documento). Lo stato è sola informazione per l'approver.
function docRowHtml(r, docMode) {
  const label = r.doc || reqType(r).docLabel || 'documento.pdf';
  const s = r.docStatus;
  const chip = s === 'da-integrare'
    ? `<span class="chip chip--red">Da integrare${r.docDeadline ? ` entro ${fmtShort(r.docDeadline)}` : ''}</span>`
    : s === 'ok' ? `<span class="chip chip--soft">${docMode === 'hr' ? 'Verificato' : 'Ricevuto'}</span>`
    : `<span class="chip chip--eval">${docMode === 'hr' ? 'Da valutare' : 'In valutazione'}</span>`;
  let icons = `<button class="req__docbtn" data-action="oos" data-msg="Download documento (demo)" title="Scarica">${ic('download')}</button>`;
  if (docMode === 'hr' && s !== 'ok')
    icons += `<button class="req__docbtn req__docbtn--green" data-action="doc-approve" data-id="${r.id}" title="Approva documento (competenza HR)">${ic('check-circle')}</button>
              <button class="req__docbtn req__docbtn--red" data-action="doc-reject" data-id="${r.id}" title="Rifiuta documento (competenza HR)">${ic('x-circle')}</button>`;
  else if (docMode === 'own' && r.status === 'pending')
    icons += `<button class="req__docbtn req__docbtn--red" data-action="doc-remove" data-id="${r.id}" title="Rimuovi allegato">${ic('x-circle')}</button>`;
  return `<div class="req__doc"><span>${esc(label)}</span>${icons}${chip}</div>`;
}

function reqExtras(r, { docMode = 'own' } = {}) {
  let out = '';
  if (r.status === 'pending' && preavvisoViolated(r))
    out += `<div class="req__warn">${ic('alert')} Non è stato rispettato il preavviso minimo per questo tipo di richieste (${reqType(r).preavvisoH} ore)</div>`;
  if (r.doc || r.docStatus) out += docRowHtml(r, docMode);
  if (r.origin === 'hr') out += `<div class="req__doc"><span class="chip chip--hr">Inserita da HR</span></div>`;
  if (r.motivation) out += `<div class="req__motivation">“${esc(r.motivation)}”</div>`;
  if (r.proposal) out += `<div class="req__proposal">${ic('undo')}<span><b>Proposta di ${r.proposal.action === 'cancel' ? 'eliminazione' : 'modifica'} inviata</b> il ${fmt(r.proposal.proposedOn)} — in attesa dell’approvatore.<br><i>“${esc(r.proposal.note)}”</i></span></div>`;
  return out;
}

function reqCardOwn(r) {
  const t = reqType(r);
  let actions = '';
  if (r.status === 'pending') {
    actions = `
      <button class="iconbtn" data-action="oos" data-msg="Allega documento: simulato solo in inserimento" title="Allega documento">${ic('upload')}</button>
      <button class="iconbtn" data-action="edit-req" data-id="${r.id}" title="Modifica (diretta: non ancora approvata)">${ic('pencil')}</button>
      <button class="iconbtn iconbtn--red" data-action="cancel-req" data-id="${r.id}" title="Elimina (diretta: non ancora approvata)">${ic('x')}</button>`;
  } else if (r.status === 'approved' && r.end >= DEMO_TODAY && !r.proposal) {
    actions = `
      <button class="iconbtn" data-action="propose" data-id="${r.id}" data-kind="modify" title="Proponi modifica (già approvata)">${ic('pencil')}</button>
      <button class="iconbtn iconbtn--red" data-action="propose" data-id="${r.id}" data-kind="cancel" title="Proponi eliminazione (già approvata)">${ic('x')}</button>`;
  }
  return `
  <article class="req" data-action="req-detail" data-id="${r.id}" role="button" tabindex="0">
    ${reqMetaTop(r)}
    <div class="req__main">
      <div class="req__id">${statusChip(r)}<span class="req__type">${esc(t.label)}</span></div>
      <div class="req__actions">${actions}</div>
    </div>
    ${reqExtras(r, { docMode: 'own' })}
  </article>`;
}

function panelTeam() {
  const p = persona();
  const teammates = PEOPLE.filter((x) => x.teamId === p.teamId && x.id !== p.id);
  const observed = (p.observes || []).map(personOf);
  const roster = [...teammates, ...observed];
  const days = [0, 1, 2, 3, 4].map((i) => addDays(state.weekStart, i));
  const absOn = (day) => roster
    .map((m) => ({ m, r: reqs().find((r) => r.personId === m.id && r.status === 'approved' && coversDay(r, day)) }))
    .filter((x) => x.r);
  const selected = absOn(state.selectedDay);
  return `
  <section class="panel">
    <div class="panel__head">${ic('users')}<h3 class="panel__title">Team</h3></div>
    <div class="week">
      <button class="iconbtn iconbtn--ghost iconbtn--lg" data-action="week-nav" data-dir="-1" title="Settimana precedente">${ic('chevron-left')}</button>
      ${days.map((d) => `
        <button class="daytab${d === state.selectedDay ? ' is-selected' : ''}" data-action="select-day" data-id="${d}">
          <span class="daytab__dow">${fmtDow(d)}</span>
          <span class="daytab__num">${d.slice(8)}</span>
          ${absOn(d).length ? '<span class="daytab__dot"></span>' : ''}
        </button>`).join('')}
      <button class="iconbtn iconbtn--ghost iconbtn--lg" data-action="week-nav" data-dir="1" title="Settimana successiva">${ic('chevron-right')}</button>
    </div>
    <div class="member-list">
      ${selected.length === 0 ? `<div class="empty">Nessuna assenza ${state.selectedDay === DEMO_TODAY ? 'oggi' : `il ${fmt(state.selectedDay)}`}</div>` : ''}
      ${selected.map(({ m, r }) => {
        const t = reqType(r);
        const dur = t.unit === 'hours' ? `${r.hours}h` : `${workingDays(r.start, r.end)}d`;
        const seeType = canSeeJustification(m);
        return `
        <div class="member">
          <div class="member__id">${avatarHtml(m)}
            <div><div class="member__name">${esc(fullName(m))}</div><div class="member__team">${esc(teamOf(m.teamId).label)}</div></div>
          </div>
          <div class="member__right">
            ${(p.observes || []).includes(m.id) ? `<span class="member__eye" title="Osservi le assenze di questa persona (observer)">${ic('eye')}</span>` : ''}
            ${seeType ? `<span class="chip chip--outline"><i style="width:8px;height:8px;border-radius:3px;background:${t.color};display:inline-block"></i>${esc(t.label)}</span>` : ''}
            <span class="assente"><span class="chip chip--dark">Assente <span class="numbadge">${dur}</span></span></span>
            ${r.window ? `<span class="chip chip--outline">${r.window}</span>` : ''}
            ${!isSingleDay(r) ? `<span class="chip chip--outline">fino a: ${fmtShort(r.end)}</span>` : ''}
          </div>
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

/* ============================== TAB APPROVAZIONE ========================= */
function reqCardQueue(r, { withSelect = true, showWaitingApprover = false } = {}) {
  const t = reqType(r);
  const p = personOf(r.personId);
  const sla = slaState(r);
  const checked = state.selection.includes(r.id);
  const docMode = isHR() ? 'hr' : 'readonly'; // i documenti li approva solo HR
  // card cliccabile = apre il dettaglio (come la card standard); i bottoni interni vincono via closest()
  return `
  <article class="req${sla === 'expired' ? ' req--urgent' : ''}" data-action="req-detail" data-id="${r.id}" role="button" tabindex="0">
    ${reqMetaTop(r)}
    <div class="req__reqline"><span class="req__reqname">${esc(fullName(p))}</span> <span class="req__reqteam">(${esc(teamOf(p.teamId).label)})</span></div>
    <div class="req__main">
      <div class="req__id">
        ${withSelect ? `<button class="req__select${checked ? ' is-checked' : ''}" data-action="toggle-select" data-id="${r.id}" title="Seleziona per azioni massive">${ic('check')}</button>` : ''}
        <span class="req__type">${esc(t.label)}</span>
      </div>
      <div class="req__actions">
        <button class="iconbtn iconbtn--green" data-action="approve" data-id="${r.id}" title="Approva">${ic('check')}</button>
        <button class="iconbtn iconbtn--red" data-action="deny" data-id="${r.id}" title="Rifiuta">${ic('x')}</button>
      </div>
    </div>
    ${sla ? `<div class="req__warn">${ic('alert')} Tempistiche di approvazione ${sla === 'expired' ? 'scadute' : 'in scadenza'} — richiesta di ${daysBetween(r.requestedOn, DEMO_TODAY)} giorni fa</div>` : ''}
    ${showWaitingApprover ? (() => {
      const ap = personOf(personOf(r.personId).approverId);
      return `<div class="req__note">${ic('user')} <span>Approvatore di competenza: <b>${ap ? esc(fullName(ap)) : 'Direzione'}</b>${sla === 'expired' ? ' — non ha ancora agito, puoi intervenire tu come global' : ''}</span></div>`;
    })() : ''}
    ${reqExtras(r, { docMode })}
  </article>`;
}

function proposalCard(r) {
  const t = reqType(r);
  const p = personOf(r.personId);
  return `
  <article class="req">
    ${reqMetaTop(r, { showOverlap: false })}
    <div class="req__main">
      <div class="req__id">${avatarHtml(p, true)}
        <div class="req__person"><div><div class="req__person-name">${esc(fullName(p))}</div><div class="req__person-team">${esc(teamOf(p.teamId).label)}</div></div></div>
        <span class="chip chip--hr">${ic('undo')} Proposta di ${r.proposal.action === 'cancel' ? 'eliminazione' : 'modifica'}</span>
        <span class="req__type" style="font-size:14px">${esc(t.label)}</span>
      </div>
      <div class="req__actions">
        <button class="btn btn--sm btn--green" data-action="proposal-accept" data-id="${r.id}">${ic('check')} Accetta</button>
        <button class="btn btn--sm btn--red-outline" data-action="proposal-deny" data-id="${r.id}">${ic('x')} Rifiuta</button>
      </div>
    </div>
    <div class="req__motivation">“${esc(r.proposal.note)}” — proposta del ${fmt(r.proposal.proposedOn)}</div>
  </article>`;
}

function tabApprovazione() {
  const pid = state.personaId;
  const queue = pendingQueue(pid).sort((a, b) => a.requestedOn < b.requestedOn ? -1 : 1);
  const proposals = proposalQueue(pid);
  const decided = reqs().filter((r) => r.decidedBy === pid && r.status !== 'pending').sort((a, b) => (a.decidedOn || '') < (b.decidedOn || '') ? 1 : -1).slice(0, 4);
  const alerts = queue.filter((r) => slaState(r) || preavvisoViolated(r));
  const weekOk = reqs().filter((r) => r.decidedBy === pid && r.status === 'approved' && r.decidedOn >= addDays(DEMO_TODAY, -7)).length;
  return `
  <div class="kpi-row">
    <div class="kpi"><div class="kpi__icon kpi__icon--yellow">${ic('inbox')}</div><div><div class="kpi__num">${queue.length + proposals.length}</div><div class="kpi__label">In attesa di una tua decisione</div></div></div>
    <div class="kpi"><div class="kpi__icon kpi__icon--green">${ic('check-circle')}</div><div><div class="kpi__num">${weekOk}</div><div class="kpi__label">Approvate negli ultimi 7 giorni</div></div></div>
    <div class="kpi"><div class="kpi__icon kpi__icon--red">${ic('alert')}</div><div><div class="kpi__num">${alerts.length}</div><div class="kpi__label">Alert (preavviso / tempistiche)</div></div></div>
  </div>
  <div class="dash-grid--two">
    <div class="dash-col">
      <section class="panel">
        <div class="panel__head">${ic('inbox')}<h3 class="panel__title">Da approvare</h3>
          <div class="panel__head-actions">${queue.length ? `<button class="btn btn--sm" data-action="select-all">Seleziona tutte</button>` : ''}</div>
        </div>
        <p class="panel__hint">Richieste del tuo team in attesa — le azioni possono essere anche massive. Le tue richieste personali vanno al tuo approvatore.</p>
        ${queue.length === 0 ? `<div class="empty">Nessuna richiesta in attesa — ottimo lavoro!</div>`
          : `<div class="req-list">${queue.map((r) => reqCardQueue(r)).join('')}</div>`}
        <div class="massbar-wrap${state.selection.length ? ' is-open' : ''}">
          <div class="massbar">
            <span>${state.selection.length} selezionate</span><span class="grow"></span>
            <button class="btn btn--sm btn--green" data-action="mass-approve">${ic('check')} Approva selezionate</button>
            <button class="btn btn--sm btn--ghost" style="color:#fff" data-action="clear-select">Annulla</button>
          </div>
        </div>
      </section>
      ${proposals.length ? `
      <section class="panel">
        <div class="panel__head">${ic('undo')}<h3 class="panel__title">Proposte su richieste approvate</h3></div>
        <p class="panel__hint">Modifiche o eliminazioni proposte dai membri del team su richieste già approvate</p>
        <div class="req-list">${proposals.map(proposalCard).join('')}</div>
      </section>` : ''}
    </div>
    <div class="dash-col">
      ${panelTeam()}
      <section class="panel">
        <div class="panel__head">${ic('check-circle')}<h3 class="panel__title">Ultime decisioni</h3></div>
        ${decided.length === 0 ? `<div class="empty">Ancora nessuna decisione</div>` : `<div class="req-list">
          ${decided.map((r) => {
            const p = personOf(r.personId);
            return `<article class="req" data-action="req-detail" data-id="${r.id}" role="button" tabindex="0">
              ${reqMetaTop(r, { showOverlap: false })}
              <div class="req__main">
                <div class="req__id">${statusChip(r)}${avatarHtml(p)}<span class="req__type" style="font-size:13px">${esc(fullName(p))} · ${esc(reqType(r).label)}</span></div>
              </div></article>`;
          }).join('')}</div>`}
      </section>
    </div>
  </div>`;
}

/* ============================== TAB GLOBALE ============================== */
function tabGlobale() {
  const absToday = reqs().filter((r) => r.status === 'approved' && coversDay(r, DEMO_TODAY));
  const allPending = companyPending().sort((a, b) => a.requestedOn < b.requestedOn ? -1 : 1);
  const manage = globalManageQueue().sort((a, b) => a.requestedOn < b.requestedOn ? -1 : 1);
  const showingAll = state.globalTab === 'all';
  const list = showingAll ? allPending : manage;
  return `
  <div class="kpi-row">
    <div class="kpi"><div class="kpi__icon">${ic('users')}</div><div><div class="kpi__num">${absToday.length}</div><div class="kpi__label">Assenti oggi in azienda</div></div></div>
    <div class="kpi"><div class="kpi__icon kpi__icon--red">${ic('alert')}</div><div><div class="kpi__num">${manage.length}</div><div class="kpi__label">Da gestire — in ritardo o fuori preavviso</div></div></div>
    <div class="kpi"><div class="kpi__icon kpi__icon--yellow">${ic('inbox')}</div><div><div class="kpi__num">${allPending.length}</div><div class="kpi__label">Totale richieste in attesa in azienda</div></div></div>
  </div>
  <div class="dash-grid--two">
    <div class="dash-col">
      <section class="panel">
        <div class="panel__head">${ic('inbox')}<h3 class="panel__title">Da approvare in azienda</h3></div>
        <div class="seg">
          <button class="seg__btn${!showingAll ? ' is-active' : ''}" data-action="global-tab" data-id="manage">Da gestire${manage.length ? ` · ${manage.length}` : ''}</button>
          <button class="seg__btn${showingAll ? ' is-active' : ''}" data-action="global-tab" data-id="all">Tutte le richieste${allPending.length ? ` · ${allPending.length}` : ''}</button>
        </div>
        <p class="panel__hint">${showingAll
          ? 'Tutte le richieste pendenti in azienda — come global approver puoi approvare chiunque, anche fuori dal tuo team'
          : 'Il cuore del ruolo: intervieni dove l’approvatore di competenza è in ritardo o dove il dipendente non ha rispettato il preavviso minimo. Le altre pendenti restano ai rispettivi approvatori.'}</p>
        ${list.length === 0
          ? (showingAll
              ? `<div class="empty">Nessuna richiesta in attesa in azienda</div>`
              : `<div class="empty">Nessuna richiesta in ritardo o fuori preavviso — tutto sotto controllo.<br>Passa a “Tutte le richieste” per vedere le pendenti dell’azienda.</div>`)
          : `<div class="req-list">${list.map((r) => reqCardQueue(r, { showWaitingApprover: true })).join('')}</div>`}
        <div class="massbar-wrap${state.selection.length ? ' is-open' : ''}">
          <div class="massbar">
            <span>${state.selection.length} selezionate</span><span class="grow"></span>
            <button class="btn btn--sm btn--green" data-action="mass-approve">${ic('check')} Approva selezionate</button>
            <button class="btn btn--sm btn--ghost" style="color:#fff" data-action="clear-select">Annulla</button>
          </div>
        </div>
      </section>
    </div>
    <div class="dash-col">
      <section class="panel">
        <div class="panel__head">${ic('building')}<h3 class="panel__title">Assenze oggi per team</h3>
          <div class="panel__head-actions"><button class="btn btn--sm btn--dark" data-action="new-request-hr">${ic('user-plus')} Inserisci per conto terzi</button></div>
        </div>
        <div class="teamday">
          ${TEAMS.map((t) => {
            const abs = absToday.filter((r) => personOf(r.personId).teamId === t.id);
            return `<div class="teamday__row">
              <span class="teamday__name">${esc(t.label)}</span>
              <span class="teamday__chips">${abs.length === 0 ? '<span class="chip chip--soft">Tutti presenti</span>'
                : abs.map((r) => { const p = personOf(r.personId); const ty = reqType(r);
                    return `<button class="chip chip--outline" data-action="req-detail" data-id="${r.id}" title="${esc(ty.label)}"><i style="width:8px;height:8px;border-radius:3px;background:${ty.color};display:inline-block"></i>${esc(shortName(p))}</button>`;
                  }).join('')}</span>
              <span class="teamday__count numbadge">${abs.length}</span>
            </div>`;
          }).join('')}
        </div>
      </section>
    </div>
  </div>`;
}

/* ============================== CALENDARIO =============================== */
function calendarRequests() {
  const p = persona();
  if (state.calLayer === 'mine') return reqs().filter((r) => r.personId === p.id && r.status !== 'denied');
  if (state.calLayer === 'company') return reqs().filter((r) => r.status !== 'denied');
  const visible = new Set([...PEOPLE.filter((x) => x.teamId === p.teamId).map((x) => x.id), ...(p.observes || [])]);
  return reqs().filter((r) => visible.has(r.personId) && r.status !== 'denied');
}

function viewCalendar() {
  const [y, m] = state.calMonth.split('-').map(Number);
  const first = `${state.calMonth}-01`;
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = (dt(first).getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push({ day: addDays(first, i - lead), out: true });
  for (let i = 0; i < daysInMonth; i++) cells.push({ day: addDays(first, i), out: false });
  let tail = 0;
  while (cells.length % 7) { tail++; cells.push({ day: addDays(first, daysInMonth - 1 + tail), out: true }); }

  const monthReqs = calendarRequests();
  const layers = [
    { id: 'mine', label: 'Le mie richieste', show: true },
    { id: 'team', label: 'Team', show: true },
    { id: 'company', label: 'Azienda', show: isGlobal() },
  ].filter((l) => l.show);
  const monthLabel = cap(dt(first).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' }));

  return `${welcomeHtml()}
  <section class="panel">
    <div class="cal-head">
      <button class="iconbtn iconbtn--lg" data-action="cal-nav" data-dir="-1" title="Mese precedente">${ic('chevron-left')}</button>
      <span class="cal-title">${monthLabel}</span>
      <button class="iconbtn iconbtn--lg" data-action="cal-nav" data-dir="1" title="Mese successivo">${ic('chevron-right')}</button>
      <div class="cal-layers seg" style="margin:0">
        ${layers.map((l) => `<button class="seg__btn${state.calLayer === l.id ? ' is-active' : ''}" data-action="cal-layer" data-id="${l.id}">${l.label}</button>`).join('')}
      </div>
    </div>
    <div class="cal-legend">
      ${TYPES.filter((t) => !t.hrOnly).map((t) => `<span><i style="background:${t.color}"></i>${esc(t.label)}</span>`).join('')}
      <span><i style="background:var(--grey-p2)"></i>Assenza di altri (senza giustificativo)</span>
      <span style="margin-left:auto;font-style:italic">Clicca un giorno per inserire una richiesta · clicca una voce per il dettaglio</span>
    </div>
    <div class="cal-grid">
      ${['lun', 'mar', 'mer', 'gio', 'ven', 'sab', 'dom'].map((d) => `<div class="cal-dow">${d}</div>`).join('')}
      ${cells.map(({ day, out }) => {
        const todays = out ? [] : monthReqs.filter((r) => coversDay(r, day));
        const shown = todays.slice(0, 3);
        return `<div class="cal-cell${out ? ' is-out' : ''}${isWeekend(day) ? ' is-weekend' : ''}${day === DEMO_TODAY ? ' is-today' : ''}"
                  ${out ? '' : `data-action="cal-day" data-id="${day}" role="button" tabindex="0"`}>
          <span class="cal-cell__num">${Number(day.slice(8))}</span>
          ${shown.map((r) => calChip(r)).join('')}
          ${todays.length > 3 ? `<span class="cal-chip cal-chip--more">+${todays.length - 3} altre</span>` : ''}
        </div>`;
      }).join('')}
    </div>
  </section>`;
}

function calChip(r) {
  const p = personOf(r.personId);
  const t = reqType(r);
  const own = r.personId === state.personaId;
  const seeType = canSeeJustification(p);
  const pend = r.status === 'pending' ? ' cal-chip--pending' : '';
  if (own) return `<button class="cal-chip${pend}" style="background:${t.color}" data-action="req-detail" data-id="${r.id}" title="${esc(t.label)}${r.status === 'pending' ? ' (in approvazione)' : ''}">${esc(t.label)}</button>`;
  if (seeType) return `<button class="cal-chip cal-chip--others${pend}" style="border-left-color:${t.color}" data-action="req-detail" data-id="${r.id}">${esc(shortName(p))} · ${esc(t.label)}</button>`;
  return `<button class="cal-chip cal-chip--others${pend}" data-action="req-detail" data-id="${r.id}" title="Assenza — giustificativo non visibile per il tuo ruolo">${esc(shortName(p))} · Assente</button>`;
}

/* ============================== MODALI =================================== */
function openModal(html, wide = false) {
  const existing = $('.modal-overlay');
  if (existing) { // ri-render del contenuto senza ri-animare l'overlay
    const m = existing.querySelector('.modal');
    m.className = `modal${wide ? ' modal--wide' : ''}`;
    m.innerHTML = html;
    return;
  }
  const root = $('#modalRoot');
  root.innerHTML = `<div class="modal-overlay" data-action="modal-backdrop"><div class="modal${wide ? ' modal--wide' : ''}" role="dialog" aria-modal="true">${html}</div></div>`;
  requestAnimationFrame(() => $('.modal-overlay').classList.add('is-visible')); // pattern 5
}
function closeModal() {
  const ov = $('.modal-overlay');
  if (!ov) return;
  ov.classList.remove('is-visible');
  setTimeout(() => { $('#modalRoot').innerHTML = ''; draft = null; }, 260);
}
const modalHead = (title) => `
  <div class="modal__head"><h3 class="modal__title">${title}</h3>
  <button class="iconbtn iconbtn--ghost iconbtn--lg" data-action="modal-close" title="Chiudi">${ic('x')}</button></div>`;

/* ---- nuova richiesta / modifica / conto terzi ---- */
function openRequestModal({ reqId = null, prefillDate = null, hr = false } = {}) {
  const editing = reqId ? reqs().find((r) => r.id === reqId) : null;
  draft = editing ? {
    mode: 'edit', reqId, hr: false,
    forPersonId: editing.personId, typeId: editing.typeId,
    start: editing.start, end: editing.end,
    fromTime: editing.window ? editing.window.split('-')[0] : '9:00',
    toTime: editing.window ? editing.window.split('-')[1] : '13:00',
    docLoaded: !!editing.doc, note: editing.note || '',
  } : {
    mode: 'new', reqId: null, hr,
    forPersonId: hr ? '' : state.personaId, typeId: null,
    start: prefillDate || '', end: prefillDate || '',
    fromTime: '9:00', toTime: '13:00',
    docLoaded: false, note: '',
  };
  renderRequestModal();
}

function renderRequestModal() {
  const d = draft;
  const t = d.typeId ? typeOf(d.typeId) : null;
  const availTypes = TYPES.filter((ty) => d.hr ? true : !ty.hrOnly);
  const targets = PEOPLE.filter((p) => p.id !== state.personaId);
  const c = computeDraft();
  const title = d.mode === 'edit' ? 'Modifica richiesta' : d.hr ? 'Inserisci per conto terzi' : 'Inserisci richiesta';
  openModal(`
    ${modalHead(title)}
    ${d.hr ? `
    <div class="field">
      <label class="field__label">Per conto di</label>
      <select class="select" data-field="forPersonId">
        <option value="">Scegli una persona…</option>
        ${targets.map((p) => `<option value="${p.id}" ${d.forPersonId === p.id ? 'selected' : ''}>${esc(fullName(p))} — ${esc(teamOf(p.teamId).label)}</option>`).join('')}
      </select>
    </div>` : ''}
    <div class="field">
      <label class="field__label">Tipologia <small>— le regole cambiano per tipo (conteggio, approvazione, documenti)</small></label>
      <div class="type-grid">
        ${availTypes.map((ty) => `
          <button class="type-card${d.typeId === ty.id ? ' is-selected' : ''}" data-action="pick-type" data-id="${ty.id}">
            <span class="type-card__dot" style="background:${ty.color}"></span>
            <span><span class="type-card__label">${esc(ty.label)}</span><br><span class="type-card__hint">${esc(ty.hint)}</span></span>
          </button>`).join('')}
      </div>
    </div>
    ${t ? `
    ${(() => {
      const resTarget = d.forPersonId ? personOf(d.forPersonId) : null;
      const res = resTarget ? residuoFor(resTarget.id, t.id) : null;
      if (!res) return '';
      const pct = Math.max(0, Math.round(res.left / res.total * 100));
      return `<div class="field"><div class="resinfo">
        <div class="residuo__row"><span>Residuo ${esc(t.label)}${d.hr ? ` di ${esc(fullName(resTarget))}` : ''}</span>
          <span><b>${res.left}</b> <small>/ ${res.total} ${res.unit} · indicativo</small></span></div>
        <div class="residuo__track"><div class="residuo__fill" style="width:${pct}%;background:${t.color}"></div></div>
        <p class="resinfo__note">${ic('info')} <span>Dato indicativo: per i residui <b>fa fede solo la busta paga</b>. Caricando l’ultima busta paga nella sezione “I miei dati” puoi ricalcolarli.</span></p>
      </div></div>`;
    })()}
    <div class="field-row">
      <div class="field">
        <label class="field__label">${t.unit === 'hours' ? 'Giorno' : 'Dal giorno'}</label>
        <input class="input" type="date" data-field="start" value="${d.start}" min="2026-01-01">
      </div>
      ${t.unit === 'hours' ? `
      <div class="field">
        <label class="field__label">Fascia oraria</label>
        <div style="display:flex;gap:8px">
          <select class="select" data-field="fromTime">${timeOptions(d.fromTime)}</select>
          <select class="select" data-field="toTime">${timeOptions(d.toTime)}</select>
        </div>
      </div>` : `
      <div class="field">
        <label class="field__label">Al giorno</label>
        <input class="input" type="date" data-field="end" value="${d.end}" min="2026-01-01">
      </div>`}
    </div>
    ${t.doc === 'blocking' ? `
    <div class="field">
      <label class="field__label">Documento richiesto <small>— bloccante: senza non puoi inviare</small></label>
      <div class="docbox${d.docLoaded ? ' is-loaded' : ''}">
        ${ic('paperclip')}
        <span class="grow">${d.docLoaded ? esc(t.docLabel) : 'Nessun documento caricato'}</span>
        ${d.docLoaded ? `<span class="chip chip--green">${ic('check')} Caricato</span>` : `<button class="btn btn--sm" data-action="fake-upload">Simula caricamento</button>`}
      </div>
    </div>` : t.doc === 'nonblocking' ? `
    <div class="field"><div class="docbox">${ic('paperclip')}<span class="grow">${esc(t.docLabel)} — potrai integrarlo anche dopo l’invio (non bloccante)</span></div></div>` : ''}
    <div class="field">
      <label class="field__label">Nota <small>(facoltativa)</small></label>
      <textarea class="textarea" data-field="note" placeholder="Aggiungi un contesto per chi approva…">${esc(d.note)}</textarea>
    </div>
    <div class="summary-box" id="draftSummary">${draftSummaryHtml(c)}</div>
    ` : ''}
    <div class="modal__footer">
      <button class="btn btn--ghost" data-action="modal-close">Annulla</button>
      <button class="btn btn--dark" data-action="submit-request" ${c.valid ? '' : 'disabled'}>${d.mode === 'edit' ? 'Salva modifiche' : 'Invia richiesta'}</button>
    </div>
  `);
}

const timeOptions = (sel) =>
  ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']
    .map((h) => `<option ${h === sel ? 'selected' : ''}>${h}</option>`).join('');

function computeDraft() {
  const d = draft;
  if (!d || !d.typeId) return { valid: false, msgs: ['Scegli una tipologia'] };
  const t = typeOf(d.typeId);
  const out = { valid: true, msgs: [], warn: [] };
  const target = d.forPersonId ? personOf(d.forPersonId) : null;
  if (d.hr && !target) { out.valid = false; out.msgs.push('Scegli la persona per cui inserisci'); }
  if (!d.start) { out.valid = false; out.msgs.push('Indica la data'); return out; }
  if (t.unit === 'hours') {
    d.end = d.start;
    out.hours = parseInt(d.toTime) - parseInt(d.fromTime);
    if (out.hours <= 0) { out.valid = false; out.msgs.push('La fascia oraria non è valida'); }
    else out.amount = `${out.hours} ore (${d.fromTime}-${d.toTime})`;
  } else {
    if (!d.end || d.end < d.start) { out.valid = false; out.msgs.push('Il giorno di fine deve seguire quello di inizio'); return out; }
    out.days = workingDays(d.start, d.end);
    if (out.days === 0) { out.valid = false; out.msgs.push('Il periodo cade solo in giorni non lavorativi'); }
    else out.amount = `${out.days} giorni lavorativi`;
  }
  const resPerson = target || persona();
  const res = residuoFor(resPerson.id, t.id);
  if (res && (out.days != null || out.hours != null)) {
    out.after = res.left - (out.days != null ? out.days : out.hours);
    out.afterUnit = res.unit;
    if (out.after < 0) out.warn.push(`Supereresti il residuo indicativo di ${-out.after} ${res.unit} — verifica con l’ultima busta paga`);
  }
  if (t.doc === 'blocking' && !d.docLoaded) { out.valid = false; out.msgs.push('Documento obbligatorio mancante'); }
  if (t.preavvisoH != null && d.start && daysBetween(DEMO_TODAY, d.start) * 24 < t.preavvisoH)
    out.warn.push(`Preavviso minimo di ${t.preavvisoH} ore non rispettato — potrai comunque inviare, l’approvatore vedrà l’avviso`);
  out.flow = d.hr ? 'Inserimento HR per conto terzi: registrata subito come approvata'
    : !t.approval ? 'Senza approvazione: sarà registrata subito'
    : (() => { const ap = personOf((target || persona()).approverId); return ap ? `Andrà in approvazione a ${fullName(ap)}` : 'Andrà in approvazione alla Direzione (fuori demo)'; })();
  return out;
}

function draftSummaryHtml(c) {
  if (!c.msgs.length && !c.amount) return '';
  return `
    ${c.amount ? `<span>Riepilogo: <b>${c.amount}</b></span>` : ''}
    ${c.after != null ? `<span>Residuo dopo questa richiesta: <b>${c.after} ${c.afterUnit}</b> <i>(indicativo)</i></span>` : ''}
    ${c.flow ? `<span>${c.flow}</span>` : ''}
    ${c.warn.map((w) => `<span class="warn">${ic('alert')} ${w}</span>`).join('')}
    ${c.msgs.map((m) => `<span class="warn">${ic('alert')} ${m}</span>`).join('')}`;
}

function submitRequest() {
  const d = draft, c = computeDraft();
  if (!c.valid) return;
  const t = typeOf(d.typeId);
  const targetId = d.hr ? d.forPersonId : (d.mode === 'edit' ? d.forPersonId : state.personaId);
  const target = personOf(targetId);
  const base = {
    typeId: d.typeId, start: d.start, end: t.unit === 'hours' ? d.start : d.end,
    hours: t.unit === 'hours' ? c.hours : undefined,
    window: t.unit === 'hours' ? `${d.fromTime}-${d.toTime}` : undefined,
    note: d.note || undefined,
    doc: t.doc === 'blocking' ? t.docLabel : undefined,
    docStatus: t.doc === 'blocking' ? 'in-valutazione' : (t.doc === 'nonblocking' ? 'da-integrare' : undefined),
    docDeadline: t.doc === 'nonblocking' ? addDays(DEMO_TODAY, 8) : undefined,
  };
  if (d.mode === 'edit') {
    const r = reqs().find((x) => x.id === d.reqId);
    Object.assign(r, base);
    const ap = personOf(target.approverId);
    if (ap) notify(ap.id, 'inbox', 'Richiesta modificata dal richiedente', `${fullName(target)}  |  ${t.label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
    toast('Richiesta aggiornata', 'green', 'check-circle');
  } else if (d.hr) {
    const r = { id: newId('rq'), personId: targetId, requestedOn: DEMO_TODAY, status: 'approved', origin: 'hr',
      decidedBy: state.personaId, decidedOn: DEMO_TODAY, ...base };
    reqs().push(r);
    notify(targetId, 'doc', 'HR ha inserito una richiesta per te', `${t.label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
    toast(`Inserita per ${fullName(target)} (conto terzi)`, 'green', 'check-circle');
  } else {
    const auto = !t.approval;
    const r = { id: newId('rq'), personId: targetId, requestedOn: DEMO_TODAY, status: auto ? 'approved' : 'pending', ...base };
    if (auto) { r.decidedOn = DEMO_TODAY; }
    reqs().push(r);
    const ap = personOf(target.approverId);
    if (!auto && ap) notify(ap.id, 'inbox', 'Nuova richiesta da approvare', `${fullName(target)}  |  ${t.label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
    toast(auto ? 'Registrata — questo tipo non richiede approvazione' : `Inviata — in approvazione a ${ap ? fullName(ap) : 'Direzione'}`, 'green', 'check-circle');
  }
  closeModal();
  render();
}

/* ---- dettaglio ---- */
function openDetail(reqId) {
  const r = reqs().find((x) => x.id === reqId);
  const p = personOf(r.personId);
  const t = reqType(r);
  const seeType = canSeeJustification(p);
  const rows = [
    ['Persona', `${fullName(p)} — ${teamOf(p.teamId).label}`],
    ['Tipologia', seeType ? t.label : 'Assenza (giustificativo non visibile per il tuo ruolo)'],
    ['Periodo', `${whenLabel(r)} · ${amountLabel(r)}${r.window ? ` · ${r.window}` : ''}`],
    ['Richiesta il', fmt(r.requestedOn)],
    ['Stato', r.status === 'approved' ? 'Approvata' : r.status === 'denied' ? 'Negata' : 'In approvazione'],
    r.decidedBy ? ['Decisa da', `${fullName(personOf(r.decidedBy))} il ${fmt(r.decidedOn)}`] : null,
    r.origin === 'hr' ? ['Origine', 'Inserita da HR (conto terzi)'] : null,
    seeType && r.doc ? ['Documento', `${r.doc} (${r.docStatus || 'ricevuto'})`] : null,
    r.motivation ? ['Motivazione', r.motivation] : null,
    r.note ? ['Nota', r.note] : null,
    r.proposal ? ['Proposta', `${r.proposal.action === 'cancel' ? 'Eliminazione' : 'Modifica'} — “${r.proposal.note}”`] : null,
  ].filter(Boolean);
  openModal(`
    ${modalHead('Dettaglio richiesta')}
    <div class="detail-rows">
      ${rows.map(([k, v]) => `<div class="detail-row"><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}
    </div>
    <div class="modal__footer"><button class="btn btn--ghost" data-action="modal-close">Chiudi</button></div>`);
}

/* ---- rifiuto con motivazione ---- */
function openDeny(reqId) {
  const r = reqs().find((x) => x.id === reqId);
  const p = personOf(r.personId);
  openModal(`
    ${modalHead('Nega richiesta')}
    <p style="font-size:13px;margin:0 0 16px">Stai negando <b>${esc(reqType(r).label)}</b> · ${whenLabel(r)} di <b>${esc(fullName(p))}</b>. La motivazione è obbligatoria e sarà visibile al richiedente.</p>
    <div class="field">
      <label class="field__label">Motivazione</label>
      <textarea class="textarea" id="denyReason" placeholder="Es. copertura del team insufficiente in quelle date…"></textarea>
    </div>
    <div class="modal__footer">
      <button class="btn btn--ghost" data-action="modal-close">Annulla</button>
      <button class="btn btn--red" data-action="deny-confirm" data-id="${r.id}">Nega richiesta</button>
    </div>`);
}

/* ---- proposta su richiesta approvata ---- */
function openPropose(reqId, kind) {
  const r = reqs().find((x) => x.id === reqId);
  openModal(`
    ${modalHead(kind === 'cancel' ? 'Proponi eliminazione' : 'Proponi modifica')}
    <p style="font-size:13px;margin:0 0 16px">La richiesta <b>${esc(reqType(r).label)}</b> · ${whenLabel(r)} è già stata approvata: puoi solo <b>proporre</b> la ${kind === 'cancel' ? 'sua eliminazione' : 'modifica'} al tuo approvatore.</p>
    <div class="field">
      <label class="field__label">Spiega la proposta</label>
      <textarea class="textarea" id="proposalNote" placeholder="Es. sono cambiati i piani…"></textarea>
    </div>
    <div class="modal__footer">
      <button class="btn btn--ghost" data-action="modal-close">Annulla</button>
      <button class="btn btn--dark" data-action="propose-confirm" data-id="${r.id}" data-kind="${kind}">Invia proposta</button>
    </div>`);
}

/* ---- conferma eliminazione richiesta pending ---- */
function openCancelConfirm(reqId) {
  const r = reqs().find((x) => x.id === reqId);
  openModal(`
    ${modalHead('Elimina richiesta')}
    <p style="font-size:13px;margin:0 0 8px">La richiesta <b>${esc(reqType(r).label)}</b> · ${whenLabel(r)} non è ancora stata approvata: puoi eliminarla direttamente.</p>
    <div class="modal__footer">
      <button class="btn btn--ghost" data-action="modal-close">Annulla</button>
      <button class="btn btn--red" data-action="cancel-confirm" data-id="${r.id}">Elimina</button>
    </div>`);
}

/* ============================== AZIONI =================================== */
// Se a decidere è il global approver (≠ approvatore di competenza), avvisa anche
// l'approvatore scavalcato — per conoscenza e per non agire due volte.
function notifyBypassedApprover(r, verb) { // verb: 'approvato' | 'negato'
  const ownApproverId = personOf(r.personId).approverId;
  if (ownApproverId && ownApproverId !== state.personaId) {
    notify(ownApproverId, 'globe', `${fullName(persona())} ha ${verb} una richiesta in tua vece`,
      `${fullName(personOf(r.personId))}  |  ${reqType(r).label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
  }
}

function doApprove(r, silent = false) {
  r.status = 'approved';
  r.decidedBy = state.personaId;
  r.decidedOn = DEMO_TODAY;
  notify(r.personId, 'check-circle', 'La tua richiesta è stata approvata', `${reqType(r).label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
  notifyBypassedApprover(r, 'approvato');
  if (!silent) toast(`Approvata la richiesta di ${fullName(personOf(r.personId))}`, 'green', 'check-circle');
}

const ACTIONS = {
  'switch-persona': (el) => {
    closeModal(); // un draft aperto apparterrebbe alla persona precedente
    state.personaId = el.dataset.id;
    state.tab = 'personale'; state.view = 'dashboard';
    state.selection = []; state.reqTab = 'upcoming'; state.notifTab = 'active';
    state.calLayer = 'mine'; state.globalTab = 'manage';
    const pd = personaDef();
    toast(`Ora stai guardando l’app come ${fullName(persona())} (${pd.label})`, 'yellow', 'user');
    render();
  },
  'reset': () => {
    state.data = freshData(); state.selection = [];
    toast('Dati demo ripristinati', 'yellow', 'undo');
    render();
  },
  'set-tab': (el) => { state.tab = el.dataset.id; state.selection = []; state.globalTab = 'manage'; render(); },
  'global-tab': (el) => { state.globalTab = el.dataset.id; state.selection = []; render(); },
  'toggle-team-chip': (el) => { // toggle diretto sull'elemento vivo, niente re-render
    const open = el.classList.toggle('is-open');
    el.setAttribute('aria-expanded', open ? 'true' : 'false');
  },
  'goto-calendar': () => { state.view = 'calendar'; render(); },
  'goto-dashboard': () => { state.view = 'dashboard'; render(); },
  'goto-notifiche': () => {
    state.view = 'dashboard'; state.tab = 'personale'; render();
    setTimeout(() => $('#panel-notifiche')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
  },
  'oos': (el) => toast(el.dataset.msg || 'Fuori scope per il prototipo', 'yellow', 'alert'),
  'sidebar': () => toast('Gli altri moduli del CRM non fanno parte del prototipo', 'yellow', 'alert'),
  'notif-tab': (el) => { state.notifTab = el.dataset.id; render(); },
  'req-tab': (el) => { state.reqTab = el.dataset.id; render(); },
  'archive-notif': (el) => {
    const row = el.closest('.notif');
    row.classList.add('is-archiving'); // pattern 9
    setTimeout(() => {
      const n = state.data.notifications.find((x) => x.id === el.dataset.id);
      if (n) n.archived = true;
      render();
    }, 330);
  },
  'week-nav': (el) => {
    state.weekStart = addDays(state.weekStart, Number(el.dataset.dir) * 7);
    state.selectedDay = state.weekStart;
    render();
  },
  'select-day': (el) => { state.selectedDay = el.dataset.id; render(); },
  'new-request': () => openRequestModal(),
  'new-request-hr': () => openRequestModal({ hr: true }),
  'edit-req': (el) => openRequestModal({ reqId: el.dataset.id }),
  'cancel-req': (el) => openCancelConfirm(el.dataset.id),
  'cancel-confirm': (el) => {
    const r = reqs().find((x) => x.id === el.dataset.id);
    state.data.requests = reqs().filter((x) => x.id !== r.id);
    const ap = personOf(personOf(r.personId).approverId || '');
    if (ap) notify(ap.id, 'x-circle', 'Richiesta annullata dal richiedente', `${fullName(personOf(r.personId))}  |  ${reqType(r).label}  |  ${whenLabel(r)}`);
    toast('Richiesta eliminata', 'red', 'x-circle');
    closeModal(); render();
  },
  'propose': (el) => openPropose(el.dataset.id, el.dataset.kind),
  'propose-confirm': (el) => {
    const note = $('#proposalNote').value.trim();
    if (!note) { toast('Serve una spiegazione per la proposta', 'red', 'alert'); return; }
    const r = reqs().find((x) => x.id === el.dataset.id);
    r.proposal = { action: el.dataset.kind, note, proposedOn: DEMO_TODAY };
    const ap = personOf(personOf(r.personId).approverId || '');
    if (ap) notify(ap.id, 'undo', `Proposta di ${el.dataset.kind === 'cancel' ? 'eliminazione' : 'modifica'} su richiesta approvata`, `${fullName(personOf(r.personId))}  |  ${reqType(r).label}  |  ${whenLabel(r)}`);
    toast('Proposta inviata al tuo approvatore', 'green', 'check-circle');
    closeModal(); render();
  },
  'req-detail': (el) => openDetail(el.dataset.id),
  'doc-approve': (el) => { // solo HR
    const r = reqs().find((x) => x.id === el.dataset.id);
    r.docStatus = 'ok'; r.docDeadline = undefined;
    notify(r.personId, 'check-circle', 'Documento verificato da HR', `${reqType(r).label}  |  ${whenLabel(r)}  |  ${r.doc || reqType(r).docLabel || 'documento'}`);
    toast('Documento approvato (competenza HR)', 'green', 'check-circle');
    render();
  },
  'doc-reject': (el) => { // solo HR
    const r = reqs().find((x) => x.id === el.dataset.id);
    r.docStatus = 'da-integrare'; r.docDeadline = addDays(DEMO_TODAY, 8);
    notify(r.personId, 'doc', 'Documento da reintegrare (richiesto da HR)', `${reqType(r).label}  |  ${whenLabel(r)}  |  reintegra entro ${fmtShort(r.docDeadline)}`);
    toast('Documento rifiutato — il dipendente dovrà reintegrarlo', 'red', 'x-circle');
    render();
  },
  'doc-remove': (el) => { // il dipendente rimuove il proprio allegato
    const r = reqs().find((x) => x.id === el.dataset.id);
    r.doc = undefined; r.docStatus = undefined; r.docDeadline = undefined;
    toast('Allegato rimosso', 'yellow', 'alert');
    render();
  },
  'pick-type': (el) => { draft.typeId = el.dataset.id; renderRequestModal(); },
  'fake-upload': () => { draft.docLoaded = true; renderRequestModal(); },
  'submit-request': () => submitRequest(),
  'modal-close': () => closeModal(),
  'modal-backdrop': (el, ev) => { if (ev.target === el) closeModal(); },
  'approve': (el) => { doApprove(reqs().find((x) => x.id === el.dataset.id)); state.selection = state.selection.filter((id) => id !== el.dataset.id); render(); },
  'deny': (el) => openDeny(el.dataset.id),
  'deny-confirm': (el) => {
    const reason = $('#denyReason').value.trim();
    if (!reason) { toast('La motivazione è obbligatoria per negare', 'red', 'alert'); return; }
    const r = reqs().find((x) => x.id === el.dataset.id);
    r.status = 'denied'; r.decidedBy = state.personaId; r.decidedOn = DEMO_TODAY; r.motivation = reason;
    notify(r.personId, 'x-circle', 'La tua richiesta è stata negata', `${reqType(r).label}  |  ${whenLabel(r)}  |  ${amountLabel(r)}`);
    notifyBypassedApprover(r, 'negato');
    toast(`Negata la richiesta di ${fullName(personOf(r.personId))}`, 'red', 'x-circle');
    state.selection = state.selection.filter((id) => id !== r.id);
    closeModal(); render();
  },
  'toggle-select': (el) => {
    const id = el.dataset.id;
    state.selection = state.selection.includes(id) ? state.selection.filter((x) => x !== id) : [...state.selection, id];
    render();
  },
  'select-all': () => {
    const pool = state.tab === 'globale'
      ? (state.globalTab === 'all' ? companyPending() : globalManageQueue())
      : pendingQueue(state.personaId);
    state.selection = pool.map((r) => r.id);
    render();
  },
  'clear-select': () => { state.selection = []; render(); },
  'mass-approve': () => {
    const n = state.selection.length;
    state.selection.forEach((id) => { const r = reqs().find((x) => x.id === id); if (r && r.status === 'pending') doApprove(r, true); });
    state.selection = [];
    toast(`${n} richieste approvate in blocco`, 'green', 'check-circle');
    render();
  },
  'proposal-accept': (el) => {
    const r = reqs().find((x) => x.id === el.dataset.id);
    if (r.proposal.action === 'cancel') {
      state.data.requests = reqs().filter((x) => x.id !== r.id);
      notify(r.personId, 'check-circle', 'Proposta di eliminazione accettata', `${reqType(r).label}  |  ${whenLabel(r)}  |  la richiesta è stata rimossa`);
      toast('Proposta accettata: richiesta eliminata', 'green', 'check-circle');
    } else {
      notify(r.personId, 'check-circle', 'Proposta di modifica accettata', `${reqType(r).label}  |  ${whenLabel(r)}  |  concorda i dettagli col tuo approver`);
      delete r.proposal;
      toast('Proposta di modifica accettata', 'green', 'check-circle');
    }
    render();
  },
  'proposal-deny': (el) => {
    const r = reqs().find((x) => x.id === el.dataset.id);
    notify(r.personId, 'x-circle', `Proposta di ${r.proposal.action === 'cancel' ? 'eliminazione' : 'modifica'} rifiutata`, `${reqType(r).label}  |  ${whenLabel(r)}  |  la richiesta resta approvata`);
    delete r.proposal;
    toast('Proposta rifiutata: la richiesta resta com’è', 'yellow', 'alert');
    render();
  },
  'cal-nav': (el) => {
    const [y, m] = state.calMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + Number(el.dataset.dir), 1);
    state.calMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    render();
  },
  'cal-layer': (el) => { state.calLayer = el.dataset.id; render(); },
  'cal-day': (el) => {
    if (el.dataset.id < DEMO_TODAY) { toast('Non puoi inserire richieste nel passato (demo)', 'yellow', 'alert'); return; }
    openRequestModal({ prefillDate: el.dataset.id });
  },
};

/* ============================== EVENTI =================================== */
document.addEventListener('click', (ev) => {
  // closest() risolve l'azione più interna: i bottoni dentro una card
  // cliccabile vincono sul "req-detail" della card stessa.
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const fn = ACTIONS[el.dataset.action];
  if (fn) fn(el, ev);
});

document.addEventListener('change', (ev) => {
  const el = ev.target.closest('[data-field]');
  if (!el || !draft) return;
  draft[el.dataset.field] = el.value;
  if (el.dataset.field === 'forPersonId') { renderRequestModal(); return; } // il box residuo dipende dalla persona
  if (['start', 'end', 'fromTime', 'toTime'].includes(el.dataset.field)) {
    const c = computeDraft();
    const sum = $('#draftSummary');
    if (sum) sum.innerHTML = draftSummaryHtml(c);
    const btn = $('[data-action="submit-request"]');
    if (btn) btn.disabled = !c.valid;
  }
});

document.addEventListener('input', (ev) => {
  const el = ev.target.closest('[data-field="note"]');
  if (el && draft) draft.note = el.value;
});

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') { closeModal(); return; }
  if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList?.contains('chip-exp')) {
    ev.preventDefault();
    ACTIONS['toggle-team-chip'](ev.target);
  }
});

$('.topbar__search input')?.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') toast('La ricerca non è inclusa nel prototipo', 'yellow', 'alert');
});

/* ============================== ROUTING ================================== */
const expectedHash = () => `${state.personaId}/${state.view === 'calendar' ? 'calendar' : state.tab}`;
function writeHash() { location.hash = expectedHash(); }
function readHash() {
  const [pid, sect] = (location.hash || '').replace('#', '').split('/');
  if (PERSONAS.some((p) => p.personId === pid)) state.personaId = pid;
  if (sect === 'calendar') { state.view = 'calendar'; }
  else if (['personale', 'approvazione', 'globale'].includes(sect)) {
    state.view = 'dashboard';
    const okApprover = sect !== 'approvazione' || isApprover();
    const okGlobal = sect !== 'globale' || isGlobal();
    state.tab = okApprover && okGlobal ? sect : 'personale';
  }
}
window.addEventListener('hashchange', () => {
  if (location.hash.replace('#', '') === expectedHash()) return; // scritto da noi
  closeModal(); // la navigazione invalida un eventuale draft aperto
  readHash(); render();
});

/* ============================== BOOT ===================================== */
readHash();
render();
