/* ==========================================================================
   DATI FINTI — registro presenze / gestione permessi (prototipo)
   Tutto in memoria: un reload (o "Reset demo") riparte da questo seed.
   "Oggi" è fissato per avere una demo deterministica e coerente col mockup.
   ========================================================================== */

const DEMO_TODAY = '2026-06-15'; // lunedì 15 giugno 2026

/* ---- Tipologie di assenza ---------------------------------------------
   Coprono la matrice "tracciamento giustificativi" della board:
   unit: 'days' | 'hours'   — conteggio a giornata / a ore
   approval: true|false     — con / senza approvazione
   doc: 'none' | 'nonblocking' | 'blocking'
   preavvisoH: ore minime di preavviso (null = nessun vincolo)
   hrOnly: inseribile solo da HR (conto terzi)
------------------------------------------------------------------------- */
const TYPES = [
  { id: 'ferie',    label: 'Ferie',                  unit: 'days',  approval: true,  doc: 'none',
    preavvisoH: null, color: 'var(--brass)',       icon: 'sun',
    hint: 'Conteggio a giornata · richiede approvazione' },
  { id: 'rol',      label: 'Permesso ROL',           unit: 'hours', approval: true,  doc: 'none',
    preavvisoH: 48,   color: 'var(--office)',      icon: 'clock',
    hint: 'Conteggio a ore · richiede approvazione · preavviso minimo 48 ore' },
  { id: 'congedo',  label: 'Congedo parentale',      unit: 'days',  approval: true,  doc: 'blocking',
    preavvisoH: null, color: 'var(--living)',      icon: 'baby',
    docLabel: 'ricevuta_domanda_INPS.pdf',
    hint: 'Conteggio a giornata · richiede approvazione · documento obbligatorio (bloccante)' },
  { id: 'malattia', label: 'Malattia',               unit: 'days',  approval: false, doc: 'nonblocking',
    preavvisoH: null, color: 'var(--hospitality)', icon: 'thermometer', hrInsertable: true,
    docLabel: 'protocollo_certificato.pdf',
    hint: 'Senza approvazione · protocollo medico da integrare (non bloccante)' },
  { id: 'smart',    label: 'Smart working',          unit: 'days',  approval: false, doc: 'none',
    preavvisoH: null, color: 'var(--logistics)',   icon: 'laptop',
    hint: 'Senza approvazione · conteggio a giornata' },
  { id: 'hr-spec',  label: 'Permesso speciale (HR)', unit: 'days',  approval: false, doc: 'none',
    preavvisoH: null, color: 'var(--capital)',     icon: 'shield', hrOnly: true,
    hint: 'Inseribile solo da HR, per conto terzi · senza approvazione' },
];

/* ---- Organizzazione ---------------------------------------------------- */
const TEAMS = [
  { id: 'technology', label: 'Technology' },
  { id: 'sales',      label: 'Sales' },
  { id: 'legal',      label: 'Legal' },
  { id: 'marketing',  label: 'Marketing' },
  { id: 'people',     label: 'People & Culture' },
  { id: 'direzione',  label: 'Direzione' },
];

/* approverId = chi approva le richieste della persona.
   observes   = persone osservate (observer: vede le assenze, senza giustificativo). */
const PEOPLE = [
  // Direzione — apice della catena di approvazione
  { id: 'giuseppe', first: 'Giuseppe', last: 'Amitrano', role: 'Managing Director',    teamId: 'direzione',  approverId: null,     hue: 222 },
  // Technology
  { id: 'luca',     first: 'Luca',     last: 'Moretti',   role: 'UX/UI designer',       teamId: 'technology', approverId: 'giulia', hue: 264,
    observes: ['martino', 'sara'] },
  { id: 'giulia',   first: 'Giulia',   last: 'Ferrari',   role: 'Head of Technology',   teamId: 'technology', approverId: 'giuseppe', hue: 16 },
  { id: 'alberto',  first: 'Alberto',  last: 'Rossi',     role: 'Backend developer',    teamId: 'technology', approverId: 'giulia', hue: 200 },
  { id: 'marcello', first: 'Marcello', last: 'Grigio',    role: 'Frontend developer',   teamId: 'technology', approverId: 'giulia', hue: 120 },
  { id: 'roberta',  first: 'Roberta',  last: 'Verdi',     role: 'Product owner',        teamId: 'technology', approverId: 'giulia', hue: 330 },
  // Sales
  { id: 'davide',   first: 'Davide',   last: 'Colombo',   role: 'Head of Sales',        teamId: 'sales',      approverId: 'giuseppe', hue: 40 },
  { id: 'martino',  first: 'Martino',  last: 'Bianchi',   role: 'Broker',               teamId: 'sales',      approverId: 'davide', hue: 184 },
  { id: 'sara',     first: 'Sara',     last: 'Chiari',    role: 'Broker',               teamId: 'sales',      approverId: 'davide', hue: 288 },
  // Legal
  { id: 'federica', first: 'Federica', last: 'Russo',     role: 'Head of Legal',        teamId: 'legal',      approverId: 'giuseppe', hue: 350 },
  { id: 'marco',    first: 'Marco',    last: 'Marchini',  role: 'Legal counsel',        teamId: 'legal',      approverId: 'federica', hue: 220 },
  { id: 'marina',   first: 'Marina',   last: 'Marinetti', role: 'Junior legal counsel', teamId: 'legal',      approverId: 'federica', hue: 150 },
  // Marketing
  { id: 'andrea',   first: 'Andrea',   last: 'Gallo',     role: 'Head of Marketing',    teamId: 'marketing',  approverId: 'giuseppe', hue: 60 },
  { id: 'fausto',   first: 'Fausto',   last: 'Rossi',     role: 'Content specialist',   teamId: 'marketing',  approverId: 'andrea', hue: 100 },
  { id: 'elisa',    first: 'Elisa',    last: 'Conti',     role: 'Graphic designer',     teamId: 'marketing',  approverId: 'andrea', hue: 312 },
  // People & Culture
  { id: 'elena',    first: 'Elena',    last: 'Marini',    role: 'HR manager',           teamId: 'people',     approverId: 'giuseppe', hue: 8 },
  { id: 'silvia',   first: 'Silvia',   last: 'Greco',     role: 'HR specialist',        teamId: 'people',     approverId: 'elena',  hue: 172 },
  { id: 'tommaso',  first: 'Tommaso',  last: 'Vitale',    role: 'Talent acquisition',   teamId: 'people',     approverId: 'elena',  hue: 248 },
];

/* ---- Le 3 "lenti" della demo (switcher) --------------------------------
   I diritti sono cumulativi (board "Ruoli"):
   employee ⊂ approver ⊂ global approver. Approver/global mai su se stessi. */
const PERSONAS = [
  { personId: 'luca',   key: 'employee', label: 'Employee',        sub: 'Solo richieste' },
  { personId: 'giulia', key: 'approver', label: 'Approver',        sub: 'Team Technology' },
  { personId: 'elena',  key: 'global',   label: 'Global approver', sub: 'HR · tutta l’azienda' },
];

/* ---- Richieste seed -----------------------------------------------------
   status: 'pending' | 'approved' | 'denied'
   origin: 'self' | 'hr' (inserita da HR per conto terzi)
   window: fascia oraria per i permessi a ore
   docStatus: 'in-valutazione' | 'da-integrare' | 'ok'
   proposal: { action:'cancel'|'modify', note } su richieste già approvate  */
const SEED_REQUESTS = [
  // ---- Luca (employee persona) — rispecchia il mockup
  { id: 'rq01', personId: 'luca', typeId: 'rol', start: '2026-06-16', end: '2026-06-16', hours: 4, window: '9:00-13:00',
    requestedOn: '2026-05-24', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-05-26' },
  { id: 'rq02', personId: 'luca', typeId: 'rol', start: '2026-06-16', end: '2026-06-16', hours: 2, window: '15:00-17:00',
    requestedOn: '2026-06-15', status: 'pending' }, // preavviso 48h NON rispettato (calcolato)
  { id: 'rq03', personId: 'luca', typeId: 'ferie', start: '2026-06-22', end: '2026-06-26',
    requestedOn: '2026-03-12', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-03-13' },
  { id: 'rq04', personId: 'luca', typeId: 'congedo', start: '2026-07-06', end: '2026-07-17',
    requestedOn: '2026-05-28', status: 'pending', doc: 'ricevuta_domanda_INPS.pdf', docStatus: 'in-valutazione' },
  { id: 'rq05', personId: 'luca', typeId: 'malattia', start: '2026-06-08', end: '2026-06-08',
    requestedOn: '2026-06-08', status: 'approved', docStatus: 'da-integrare', docDeadline: '2026-06-16' },
  { id: 'rq06', personId: 'luca', typeId: 'ferie', start: '2026-04-14', end: '2026-04-18',
    requestedOn: '2026-02-20', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-02-21' },
  { id: 'rq07', personId: 'luca', typeId: 'rol', start: '2026-05-12', end: '2026-05-12', hours: 2, window: '9:00-11:00',
    requestedOn: '2026-05-02', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-05-03' },
  { id: 'rq08', personId: 'luca', typeId: 'ferie', start: '2026-06-29', end: '2026-07-03',
    requestedOn: '2026-06-01', status: 'denied', decidedBy: 'giulia', decidedOn: '2026-06-05',
    motivation: 'Chiusura trimestre: copertura del team insufficiente in quei giorni. Riproponi dopo il 10/07.' },

  // ---- Technology (coda di Giulia)
  { id: 'rq10', personId: 'alberto', typeId: 'rol', start: '2026-06-15', end: '2026-06-15', hours: 2, window: '14:00-16:00',
    requestedOn: '2026-06-10', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-06-11' },
  { id: 'rq11', personId: 'alberto', typeId: 'rol', start: '2026-06-19', end: '2026-06-19', hours: 3, window: '9:00-12:00',
    requestedOn: '2026-06-13', status: 'pending' },
  { id: 'rq12', personId: 'marcello', typeId: 'ferie', start: '2026-06-15', end: '2026-06-16',
    requestedOn: '2026-05-30', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-05-31' },
  { id: 'rq13', personId: 'marcello', typeId: 'ferie', start: '2026-07-06', end: '2026-07-10',
    requestedOn: '2026-06-10', status: 'pending' }, // tempistiche approvazione in scadenza (>48h)
  { id: 'rq14', personId: 'roberta', typeId: 'ferie', start: '2026-06-15', end: '2026-06-19',
    requestedOn: '2026-04-20', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-04-21' },
  { id: 'rq15', personId: 'roberta', typeId: 'ferie', start: '2026-07-13', end: '2026-07-17',
    requestedOn: '2026-05-05', status: 'approved', decidedBy: 'giulia', decidedOn: '2026-05-06',
    proposal: { action: 'cancel', note: 'Cambio programmi famigliari, vorrei annullarle.', proposedOn: '2026-06-14' } },
  { id: 'rq16', personId: 'giulia', typeId: 'rol', start: '2026-06-18', end: '2026-06-18', hours: 2, window: '11:00-13:00',
    requestedOn: '2026-06-12', status: 'pending' }, // la richiesta dell'approver sale a Elena
  { id: 'rq17', personId: 'giulia', typeId: 'smart', start: '2026-06-17', end: '2026-06-17',
    requestedOn: '2026-06-09', status: 'approved' },

  // ---- Sales (Martino e Sara sono osservati da Luca)
  { id: 'rq20', personId: 'martino', typeId: 'rol', start: '2026-06-15', end: '2026-06-15', hours: 6, window: '9:00-16:00',
    requestedOn: '2026-06-05', status: 'approved', decidedBy: 'davide', decidedOn: '2026-06-06' },
  { id: 'rq21', personId: 'sara', typeId: 'ferie', start: '2026-06-15', end: '2026-06-16',
    requestedOn: '2026-05-18', status: 'approved', decidedBy: 'davide', decidedOn: '2026-05-19' },

  // ---- Legal
  { id: 'rq30', personId: 'marco', typeId: 'smart', start: '2026-06-16', end: '2026-06-16',
    requestedOn: '2026-06-08', status: 'approved' },
  { id: 'rq31', personId: 'marina', typeId: 'malattia', start: '2026-06-11', end: '2026-06-12',
    requestedOn: '2026-06-11', status: 'approved', origin: 'hr', docStatus: 'ok' },

  // ---- Marketing
  { id: 'rq40', personId: 'fausto', typeId: 'ferie', start: '2026-06-15', end: '2026-06-19',
    requestedOn: '2026-05-10', status: 'approved', decidedBy: 'andrea', decidedOn: '2026-05-11' },
  { id: 'rq41', personId: 'elisa', typeId: 'ferie', start: '2026-06-29', end: '2026-07-03',
    requestedOn: '2026-06-09', status: 'pending' }, // tempistiche scadute — visibile nella vista globale
  { id: 'rq42', personId: 'fausto', typeId: 'hr-spec', start: '2026-06-30', end: '2026-06-30',
    requestedOn: '2026-06-12', status: 'approved', origin: 'hr' },

  // ---- People & Culture (coda di Elena come approver)
  { id: 'rq50', personId: 'silvia', typeId: 'rol', start: '2026-06-16', end: '2026-06-16', hours: 4, window: '9:00-13:00',
    requestedOn: '2026-06-15', status: 'pending' }, // preavviso 48h non rispettato
  { id: 'rq51', personId: 'tommaso', typeId: 'ferie', start: '2026-06-18', end: '2026-06-19',
    requestedOn: '2026-06-02', status: 'approved', decidedBy: 'elena', decidedOn: '2026-06-03' },
];

/* ---- Notifiche seed (per persona) -------------------------------------- */
const SEED_NOTIFICATIONS = [
  // Luca — rispecchia il mockup
  { id: 'nt01', personId: 'luca', date: '2026-06-12', icon: 'check-circle',
    title: 'La tua richiesta è stata approvata', meta: 'Permesso ROL  |  16/06/2026  |  4 ore', archived: false },
  { id: 'nt02', personId: 'luca', date: '2026-06-12', icon: 'check-circle',
    title: 'La tua richiesta è stata approvata', meta: 'Ferie  |  22/06 - 26/06/2026  |  5 giorni', archived: false },
  { id: 'nt03', personId: 'luca', date: '2026-06-08', icon: 'doc',
    title: 'Devi integrare la documentazione', meta: 'Malattia  |  08/06/2026  |  1 giorno', deadline: '2026-06-16', archived: false },
  { id: 'nt04', personId: 'luca', date: '2026-06-05', icon: 'x-circle',
    title: 'La tua richiesta è stata negata', meta: 'Ferie  |  29/06 - 03/07/2026  |  5 giorni', archived: true },
  // Giulia (approver)
  { id: 'nt10', personId: 'giulia', date: '2026-06-15', icon: 'inbox',
    title: 'Nuova richiesta da approvare', meta: 'Luca Moretti  |  Permesso ROL  |  16/06/2026  |  2 ore', archived: false },
  { id: 'nt11', personId: 'giulia', date: '2026-06-14', icon: 'undo',
    title: 'Proposta di eliminazione su richiesta approvata', meta: 'Roberta Verdi  |  Ferie  |  13/07 - 17/07/2026', archived: false },
  { id: 'nt12', personId: 'giulia', date: '2026-06-13', icon: 'inbox',
    title: 'Nuova richiesta da approvare', meta: 'Alberto Rossi  |  Permesso ROL  |  19/06/2026  |  3 ore', archived: false },
  { id: 'nt13', personId: 'giulia', date: '2026-06-12', icon: 'alert',
    title: 'Tempistiche di approvazione in scadenza', meta: 'Marcello Grigio  |  Ferie  |  06/07 - 10/07/2026', deadline: '2026-06-16', archived: false },
  // Elena (global)
  { id: 'nt20', personId: 'elena', date: '2026-06-15', icon: 'alert',
    title: 'Preavviso minimo non rispettato', meta: 'Silvia Greco  |  Permesso ROL  |  16/06/2026  |  4 ore', archived: false },
  { id: 'nt21', personId: 'elena', date: '2026-06-12', icon: 'inbox',
    title: 'Nuova richiesta da approvare', meta: 'Giulia Ferrari  |  Permesso ROL  |  18/06/2026  |  2 ore', archived: false },
  { id: 'nt22', personId: 'elena', date: '2026-06-11', icon: 'doc',
    title: 'Malattia inserita per conto terzi', meta: 'Marina Marinetti  |  11/06 - 12/06/2026  |  protocollo ricevuto', archived: false },
  { id: 'nt23', personId: 'elena', date: '2026-06-10', icon: 'alert',
    title: 'Tempistiche di approvazione scadute', meta: 'Elisa Conti  |  Ferie  |  29/06 - 03/07/2026  |  team Marketing', archived: false },
];

/* ---- Ultimi update (ticker aziendale, uguale per tutti) ----------------- */
const SEED_UPDATES = [
  { id: 'up1', icon: 'pin',       pinned: true, text: 'Online la nuova policy “Consegna pacchi”, vai a vederla!' },
  { id: 'up2', icon: 'gift',      personId: 'roberta', text: 'compie gli anni! Auguri!' },
  { id: 'up3', icon: 'trophy',    personId: 'marco',   text: 'festeggia 4 anni in Dils! Complimenti!' },
  { id: 'up4', icon: 'handshake', personId: 'marina',  text: 'si unisce a noi! Il team Legal cresce!' },
  { id: 'up5', icon: 'wave',      personId: 'fausto',  text: 'grazie di tutto! Auguri per le tue future avventure!' },
];

/* ---- Residui (saldo iniziale per persona; il consumato si calcola) ------ */
const SEED_BALANCES = {
  luca:   { ferieTotal: 26, rolTotalH: 56 },
  giulia: { ferieTotal: 28, rolTotalH: 56 },
  elena:  { ferieTotal: 28, rolTotalH: 64 },
};
