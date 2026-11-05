/* =====================================================================
   Visa early workflow: business rules (no screens, no DOM).
   Loaded before 50-flight-visa.js, which draws the screens.

   Covers: the demo country + category configuration, the Sales-to-Visa
   mapping, booking resubmission, per-passenger checklists, appointment
   requirement and scheduling, application plans, status words and the
   browser storage of the Visa workflow.

   The four concepts stay separate:
     documents  : a.documents[].status (missing | received | checked)
     appointment: requirementFor(s) + s.workflow.appointments[]
     plan       : s.workflow.plans[paxId]
     application: a.state (docs_pending | submitted | decision_pending | ...)
   Saving a plan never touches a.state.

   Passport tasks share dept 'visa' but have no s.visa: every function
   here accepts them, and the visa-only rules simply do not apply.
   ===================================================================== */
(function () {
  const TN = window.TN;

  /* Narrow permission: only the branch Manager may settle a route the
     configuration does not cover. The assigned executive cannot. */
  TN.CAPS.resolveVisaRoute = ['manager'];

  /* ------------------------------------------------------------------
     Demo configuration. Example values for this prototype only: they are
     NOT immigration requirements and must be confirmed before real use.
     appointment: 'required' | 'not_required'; left out = not configured.
     checklist: per passenger type; a type left out needs confirmation.
     ------------------------------------------------------------------ */
  const doc = (code, label) => ({ code, label });
  const D = {
    passport: doc('passport_copy', 'Passport copy (front and back)'),
    photo: doc('photo', 'Photo, white background'),
    bank: doc('bank_statement', 'Bank statement (6 months)'),
    parent: doc('parent_passport', 'Parent’s passport copy'),
    insurance: doc('travel_insurance', 'Travel insurance'),
    stay: doc('stay_proof', 'Hotel booking'),
    birth: doc('birth_certificate', 'Birth certificate'),
    consent: doc('parent_consent', 'Parents’ consent letter'),
    onward: doc('onward_ticket', 'Onward flight ticket'),
  };
  const CONFIG = {
    label: 'Demo configuration: example rules for this prototype, not immigration advice.',
    timezones: [['Asia/Kolkata', 'India (Asia/Kolkata)'], ['Asia/Dubai', 'UAE (Asia/Dubai)'], ['Asia/Singapore', 'Singapore (Asia/Singapore)'], ['Asia/Bangkok', 'Thailand (Asia/Bangkok)'], ['Europe/Paris', 'France (Europe/Paris)']],
    routes: [
      { country: 'France', purpose: 'Tourism', aliases: ['schengen'], route: 'Application at a visa centre', appointment: 'required', timezone: 'Asia/Kolkata', centres: ['Visa centre, Jaipur', 'Visa centre, New Delhi'], applyByDays: 21,
        checklist: { adult: [D.passport, D.photo, D.bank, D.insurance, D.stay], child: [D.passport, D.photo, D.parent, D.birth, D.consent] } },
      { country: 'United Arab Emirates', purpose: 'Tourism', aliases: ['uae', 'dubai'], route: 'Online application through the visa partner', appointment: 'not_required',
        checklist: { adult: [D.passport, D.photo, D.bank], child: [D.passport, D.photo, D.parent] } },
      { country: 'United Arab Emirates', purpose: 'Transit', aliases: ['uae', 'dubai'], route: 'Online transit application', appointment: 'not_required', applyByDays: 7,
        checklist: { adult: [D.passport, D.photo, D.onward], child: [D.passport, D.photo, D.onward, D.parent] } },
      { country: 'Singapore', purpose: 'Tourism', aliases: [], route: 'Online application through the visa partner', appointment: 'not_required',
        checklist: { adult: [D.passport, D.photo, D.bank] } },
      /* Checklist known, appointment rule deliberately left out (the "Not configured" path). */
      { country: 'Thailand', purpose: 'Tourism', aliases: [], route: '',
        checklist: { adult: [D.passport, D.photo, D.stay], child: [D.passport, D.photo, D.parent] } },
    ],
  };

  /* How the visa or passport comes back from the embassy or visa centre. Staff record it;
     nothing reaches the CRM from an embassy automatically. */
  const RETURN_MODES = [['courier', 'By courier'], ['collect', 'Collect from the visa centre'], ['email', 'By e-mail'], ['portal', 'Download from the online portal'], ['unknown', 'Not known yet']];
  const returnWord = (a) => { const m = RETURN_MODES.find(([k]) => k === a.returnMode); return m ? m[1] : 'Not recorded'; };

  const norm = (v) => String(v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  /** The configured route for a country + category, or null. */
  function routeFor(country, purpose) {
    const c = norm(country); const p = norm(purpose);
    if (!c || !p) return null;
    return CONFIG.routes.find((r) => norm(r.purpose) === p && (norm(r.country) === c || r.aliases.includes(c))) || null;
  }
  const routeOf = (s) => (s && s.visa ? routeFor(s.visa.country, s.visa.purpose) : null);
  /** The checklist for one passenger type, or null when nobody configured it. */
  function checklistFor(s, type) {
    const r = routeOf(s);
    const list = r && r.checklist[norm(type) || 'adult'];
    return list && list.length ? list.map((d) => ({ ...d, status: 'missing', remark: '' })) : null;
  }

  /* ------------------------------------------------------------------
     Time and who did it. Audit records use the real clock in India time;
     TN.TODAY stays the fixed reference for the sample data.
     ------------------------------------------------------------------ */
  function nowIST() {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return `${p.year}-${p.month}-${p.day} ${p.hour}:${p.minute}`;
  }
  const todayIST = () => nowIST().slice(0, 10);
  /** Identity always comes from the signed-in person, never from a field. */
  const actor = () => { const m = TN.me(); return { byId: m.id, by: m.key, byName: m.name, at: nowIST(), iso: new Date().toISOString() }; };
  const validDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(String(v || '')) && !Number.isNaN(Date.parse(v));
  const validDateTime = (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(v || '')) && !Number.isNaN(Date.parse(v));
  const history = (id) => { const H = (TN.DATA.taskHistory = TN.DATA.taskHistory || {}); return (H[id] = H[id] || []); };
  const addHistory = (id, title, who, extra = {}) => history(id).push({ title, at: who.at, by: who.by, ...extra });

  /* ------------------------------------------------------------------
     Reading a task safely (older and incomplete tasks included)
     ------------------------------------------------------------------ */
  const emptyWorkflow = () => ({ appointments: [], plans: {}, resolution: null, changes: [] });
  const applicants = (s) => (s && Array.isArray(s.applicants) ? s.applicants : []);
  const isActive = (a) => !a.removedFromBooking;
  const activeApplicants = (s) => applicants(s).filter(isActive);
  const displayName = (a) => (a.name && a.name.trim()) || `Passenger ${a.seq} (name missing)`;
  /** Fills what older tasks lack. Never invents passenger details. */
  function normalizeTask(id, s) {
    if (!s || s.dept !== 'visa') return s;
    s.workflow = { ...emptyWorkflow(), ...(s.workflow || {}) };
    s.applicants = applicants(s);
    s.applicants.forEach((a, i) => { a.seq = a.seq || i + 1; a.paxId = a.paxId || `${id}-p${a.seq}`; });
    return s;
  }

  /* ------------------------------------------------------------------
     Documents
     ------------------------------------------------------------------ */
  const docList = (a) => (Array.isArray(a.documents) ? a.documents : []);
  function docSummary(a) {
    const list = docList(a);
    const received = list.filter((d) => d.status !== 'missing').length;
    const verified = list.filter((d) => d.status === 'checked').length;
    const state = !list.length ? 'unconfirmed' : verified === list.length ? 'verified' : 'pending';
    return { total: list.length, received, verified, missing: list.filter((d) => d.status === 'missing').map((d) => d.label), state };
  }
  /** An empty checklist is never complete. */
  const docsVerified = (a) => docSummary(a).state === 'verified';
  const DOC_LABEL = { unconfirmed: ['warning', 'Document requirements need confirmation'], pending: ['warning', 'Documents pending'], verified: ['success', 'Documents verified'] };
  const docStatus = (a) => { const [tone, label] = DOC_LABEL[docSummary(a).state]; return { tone, label }; };
  /** Gives a passenger their checklist when none exists yet. Existing rows are kept. */
  function hydrateChecklist(s, a) {
    if (docList(a).length) return;
    a.documents = checklistFor(s, a.type) || [];
  }
  /**
   * Applies one checklist save. rows: { code: { received, verified, remark } }.
   * Verified needs Received, whatever the form sent. Returns the changes.
   */
  function applyChecklist(a, rows) {
    const changes = [];
    docList(a).forEach((d) => {
      const r = rows[d.code]; if (!r) return;
      const status = !r.received ? 'missing' : r.verified ? 'checked' : 'received';
      const remark = String(r.remark ?? '').trim();
      if (status !== d.status) changes.push(`${d.label}: ${{ missing: 'missing', received: 'received', checked: 'received and verified' }[status]}`);
      if (remark !== (d.remark || '')) changes.push(`${d.label}: remark updated`);
      d.status = status; d.remark = remark;
    });
    return changes;
  }

  /** Staff can add a document to one passenger's list. Who added it is kept on the row. */
  function addDocument(a, { label, received }, who) {
    const name = String(label || '').trim();
    if (!name) return { ok: false, error: 'Enter the document name.' };
    a.documents = docList(a);
    if (a.documents.some((d) => norm(d.label) === norm(name))) return { ok: false, error: 'This document is already on the list.' };
    const row = { code: `custom-${Math.random().toString(36).slice(2, 8)}`, label: name, status: received ? 'received' : 'missing', remark: '', custom: true, added: who };
    a.documents.push(row);
    return { ok: true, row };
  }

  /* ------------------------------------------------------------------
     Appointment requirement and scheduling
     ------------------------------------------------------------------ */
  /** value: required | not_required | not_configured. Unknown is never treated as not required. */
  function requirementFor(s) {
    const res = s.workflow && s.workflow.resolution;
    if (res) return { value: res.value, source: 'resolved', resolution: res, route: routeOf(s) };
    const r = routeOf(s);
    return { value: r && r.appointment ? r.appointment : 'not_configured', source: 'config', route: r };
  }
  /* Each passenger's status lives on their own line of the record, so a change for one never moves another. */
  const LIVE_APPT = ['scheduled', 'attended', 'rescheduled'];
  const APPT_STATUSES = [['scheduled', 'Scheduled'], ['attended', 'Attended'], ['rescheduled', 'Rescheduled'], ['cancelled', 'Cancelled']];
  const apptWord = (status) => (APPT_STATUSES.find(([k]) => k === status) || [])[1];
  /** The passenger's latest appointment, cancelled included; a replaced one is history. */
  function passengerAppointment(s, a) {
    const list = (s.workflow && s.workflow.appointments) || [];
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i].passengers.find((x) => x.paxId === a.paxId && x.status !== 'replaced');
      if (p) return { record: list[i], status: p.status, line: p };
    }
    return null;
  }
  function appointmentOf(s, a) { const pa = passengerAppointment(s, a); return pa && LIVE_APPT.includes(pa.status) ? pa.record : null; }
  /** One row of the Appointment table. An unknown rule stays unconfirmed, never "not required". */
  function appointmentRow(s, a) {
    const v = requirementFor(s).value;
    if (v === 'not_required') return { status: 'not_required', label: 'Not required' };
    if (v === 'not_configured') return { status: 'unconfirmed', label: 'Requirement unconfirmed' };
    const pa = passengerAppointment(s, a);
    return pa ? { status: pa.status, label: apptWord(pa.status), record: pa.record } : { status: 'not_scheduled', label: 'Not scheduled' };
  }
  function appointmentStatus(s, a) {
    const v = requirementFor(s).value;
    if (v === 'not_configured') return { key: 'requirement_pending', tone: 'warning', label: 'Appointment requirement pending' };
    if (v === 'not_required') return { key: 'not_required', tone: 'neutral', label: 'Appointment not required' };
    const pa = passengerAppointment(s, a);
    if (pa && LIVE_APPT.includes(pa.status)) return { key: 'scheduled', tone: 'success', label: `Appointment ${apptWord(pa.status).toLowerCase()}` };
    return pa ? { key: 'pending', tone: 'warning', label: 'Appointment cancelled' } : { key: 'pending', tone: 'warning', label: 'Appointment pending' };
  }
  const notStarted = (a) => !a.state || a.state === 'docs_pending';
  function canHaveAppointment(s, a) {
    if (!isActive(a)) return { ok: false, why: 'Removed from the booking' };
    if (!notStarted(a)) return { ok: false, why: 'Application already submitted' };
    if (!docsVerified(a)) return { ok: false, why: 'Documents not verified yet' };
    return { ok: true };
  }
  function canPlan(s, a) {
    if (!isActive(a)) return { ok: false, why: 'Removed from the booking' };
    if (!notStarted(a)) return { ok: false, why: 'Application already submitted' };
    const v = requirementFor(s).value;
    if (v === 'not_configured') return { ok: false, why: 'Appointment requirement needs confirmation' };
    if (!docsVerified(a)) return { ok: false, why: 'Documents not verified yet' };
    if (v === 'required' && !appointmentOf(s, a)) return { ok: false, why: 'Appointment not scheduled yet' };
    return { ok: true };
  }
  /** Saves one passenger's appointment. Their earlier one is kept, marked replaced; nobody else is touched. */
  function saveAppointment(s, a, data, who) {
    const errors = {};
    const pa = passengerAppointment(s, a);
    const live = pa && LIVE_APPT.includes(pa.status) ? pa : null;
    if (requirementFor(s).value !== 'required') errors.form = 'An appointment is not needed on this application route.';
    else if (!live && !canHaveAppointment(s, a).ok) errors.form = `${displayName(a)}: ${canHaveAppointment(s, a).why}.`;
    if (!validDate(data.date)) errors.date = 'Choose the appointment date.';
    if (!/^\d{2}:\d{2}$/.test(String(data.time || ''))) errors.time = 'Choose the appointment time.';
    if (!CONFIG.timezones.some(([z]) => z === data.timezone)) errors.timezone = 'Choose the appointment timezone.';
    if (!String(data.centre || '').trim()) errors.centre = 'Enter the embassy or visa centre name.';
    if (!String(data.location || '').trim()) errors.location = 'Enter the location or address.';
    if (Object.keys(errors).length) return { ok: false, errors };
    const at = `${data.date}T${data.time}`;
    const changed = !!live && (live.record.at !== at || live.record.timezone !== data.timezone);
    if (pa) pa.line.status = 'replaced';
    const record = { id: `va-${Math.random().toString(36).slice(2, 8)}`, passengers: [{ paxId: a.paxId, status: changed ? 'rescheduled' : live ? live.status : 'scheduled' }], at, timezone: data.timezone, centre: data.centre.trim(), location: data.location.trim(), reference: String(data.reference || '').trim(), remarks: String(data.remarks || '').trim(), created: who };
    s.workflow.appointments.push(record);
    return { ok: true, record, changed };
  }
  /** The appointment's own status. It never changes a.state or the task. */
  function setAppointmentStatus(s, a, status, who) {
    const pa = passengerAppointment(s, a);
    if (!pa) return { ok: false, error: 'This passenger has no appointment yet.' };
    if (!apptWord(status)) return { ok: false, error: 'Choose a status.' };
    pa.line.status = status;
    pa.record.statusSet = { ...(pa.record.statusSet || {}), [a.paxId]: who };
    return { ok: true, label: apptWord(status) };
  }
  /** The apply-by date: stated on the task, else the configured days before travel. */
  function applyByOf(s) {
    if (s.visa && s.visa.applyBy) return s.visa.applyBy;
    const r = routeOf(s); const t = s.visa && (s.visa.travelDate || s.start);
    if (!r || !r.applyByDays || !validDate(t)) return null;
    return new Date(Date.parse(t) - r.applyByDays * 86400000).toISOString().slice(0, 10);
  }
  /** Warnings never block saving. No appointment-versus-application order is imposed. */
  function planWarnings(s, date) {
    const out = []; const travel = s.visa && (s.visa.travelDate || s.start); const by = applyByOf(s);
    if (validDate(travel) && date > travel) out.push(`This date is after the travel date (${TN.fmt.date(travel)}).`);
    if (by && date > by) out.push(`This date is after the apply-by date (${TN.fmt.date(by)}).`);
    return out;
  }
  /** Saves a planned date per passenger. a.state is left alone: planned is not submitted. */
  function savePlan(s, data, who) {
    const errors = {};
    const chosen = applicants(s).filter((a) => (data.paxIds || []).includes(a.paxId));
    if (!chosen.length) errors.pax = 'Choose at least one passenger.';
    const blocked = chosen.filter((a) => !canPlan(s, a).ok);
    if (blocked.length) errors.pax = blocked.map((a) => `${displayName(a)}: ${canPlan(s, a).why}.`).join(' ');
    if (!validDate(data.date)) errors.date = 'Choose the planned application date.';
    if (Object.keys(errors).length) return { ok: false, errors };
    chosen.forEach((a) => {
      const old = s.workflow.plans[a.paxId];
      s.workflow.plans[a.paxId] = { plannedDate: data.date, remarks: String(data.remarks || '').trim(), created: old ? old.created : who, updated: who };
    });
    return { ok: true, chosen, warnings: planWarnings(s, data.date) };
  }
  const planOf = (s, a) => (s.workflow && s.workflow.plans[a.paxId]) || null;
  const planStatus = (s, a) => (planOf(s, a) ? { tone: 'success', label: 'Application planned' } : { tone: 'neutral', label: 'Not planned yet' });
  function resolveRequirement(s, { value, reason }, who) {
    if (!['required', 'not_required'].includes(value)) return { ok: false, errors: { value: 'Choose whether an appointment is needed.' } };
    if (!String(reason || '').trim()) return { ok: false, errors: { reason: 'Say how this was confirmed.' } };
    s.workflow.resolution = { value, reason: reason.trim(), ...who };
    return { ok: true };
  }

  /* ------------------------------------------------------------------
     Progress: Documents → Appointment → Application plan
     ------------------------------------------------------------------ */
  function progress(s) {
    const list = activeApplicants(s); const n = list.length;
    const count = (fn) => list.filter(fn).length;
    const verified = count(docsVerified);
    const req = requirementFor(s).value;
    const booked = count((a) => appointmentStatus(s, a).key === 'scheduled');
    const planned = count((a) => planOf(s, a) || !notStarted(a));
    const state = (done, started) => (n && done === n ? 'done' : started ? 'current' : 'upcoming');
    const apptText = req === 'not_configured' ? 'Appointment requirement pending' : req === 'not_required' ? 'Appointment not required' : `${booked} of ${n} scheduled`;
    return [
      { key: 'documents', title: 'Documents', text: `${verified} of ${n} verified`, state: state(verified, true) },
      { key: 'appointment', title: 'Appointment', text: apptText, state: req === 'not_required' ? (verified ? 'done' : 'upcoming') : req === 'not_configured' ? 'current' : state(booked, verified > 0) },
      { key: 'plan', title: 'Application plan', text: `${planned} of ${n} planned`, state: state(planned, list.some((a) => canPlan(s, a).ok)) },
    ];
  }
  /** One short word for the task as a whole: the earliest stage anyone is still at. */
  function stageLabel(s) {
    if (s.kind === 'passport' || !s.assignee) return '';
    const list = activeApplicants(s).filter((a) => notStarted(a));
    if (!list.length) return '';
    if (list.some((a) => docSummary(a).total && !docsVerified(a))) return 'Documents pending';
    /* A passenger with no checklist yet does not hold back those who are ready. */
    const ready = list.filter(docsVerified);
    if (!ready.length) return 'Document requirements need confirmation';
    const v = requirementFor(s).value;
    if (v === 'not_configured') return 'Appointment requirement pending';
    if (v === 'required' && ready.some((a) => !appointmentOf(s, a))) return 'Appointment pending';
    if (ready.some((a) => !planOf(s, a))) return v === 'required' ? 'Appointment scheduled' : 'Appointment not required';
    return 'Application planned';
  }

  /* ------------------------------------------------------------------
     Sales to Visa: mapping one Book now row to its task
     ------------------------------------------------------------------ */
  const mapFee = (text) => (/customer/i.test(text || '') ? 'customer' : /company/i.test(text || '') ? 'company' : 'undecided');
  const FEE_WORD = { customer: 'Customer pays directly', company: 'Company pays', undecided: 'Not decided yet' };
  /** Only what Sales entered. A blank stays blank. */
  function mapPassenger(p, seq) {
    const a = { seq, paxId: p.id, name: String(p.name || '').trim(), type: norm(p.type) || 'adult', state: null };
    if (p.age !== '' && p.age != null && Number(p.age) >= 0) a.age = Number(p.age);
    if (p.dob) a.born = p.dob;
    if (Array.isArray(p.files) && p.files.length) a.idFiles = p.files.slice();
    return a;
  }
  const bookedPax = (row, pax) => (row.pax || []).map((id) => pax.find((p) => p.id === id)).filter(Boolean);
  function facts(kind, row) {
    return kind === 'visa'
      ? { country: String(row.country || '').trim(), purpose: row.vtype || '', travelDate: row.date || '', feePaidBy: mapFee(row.fee), requirements: String(row.req || '').trim() }
      : { atype: row.atype || '', city: String(row.city || '').trim(), requirements: String(row.req || '').trim() };
  }
  const sameKey = (s, kind, f) => (kind === 'visa'
    ? s.visa && norm(s.visa.country) === norm(f.country) && norm(s.visa.purpose) === norm(f.purpose)
    : s.passport && norm(s.passport.atype) === norm(f.atype) && norm(s.passport.city) === norm(f.city));
  function findTask(services, dealId, kind, row, f, used) {
    const open = Object.entries(services).filter(([id, s]) => s.deal === dealId && s.dept === 'visa' && s.kind === kind && !used.has(id));
    const hit = open.find(([id]) => id === row.srcId) || open.find(([, s]) => row.id && s.srcRow === row.id) || open.find(([, s]) => sameKey(s, kind, f));
    return hit ? hit[0] : null;
  }
  /* Matches by stable passenger ID, then by name and type (a rebuilt draft has new IDs).
     Nobody's records are deleted: a passenger taken off the booking is flagged. */
  function reconcile(id, s, selected, version, who) {
    const lines = []; const seen = new Set();
    selected.forEach((p) => {
      const list = s.applicants.filter((a) => !seen.has(a));
      const a = list.find((x) => x.paxId === p.id) || list.find((x) => norm(x.name) && norm(x.name) === norm(p.name) && x.type === norm(p.type));
      if (!a) {
        const n = mapPassenger(p, s.applicants.reduce((m, x) => Math.max(m, x.seq), 0) + 1);
        if (s.assignee) { n.state = 'docs_pending'; hydrateChecklist(s, n); }
        s.applicants.push(n); seen.add(n);
        lines.push(`Passenger added: ${displayName(n)}`);
        return;
      }
      seen.add(a);
      if (a.removedFromBooking) { delete a.removedFromBooking; lines.push(`Passenger back on the booking: ${displayName(a)}`); }
      const name = String(p.name || '').trim();
      if (name && name !== a.name) { lines.push(`Passenger name changed: ${displayName(a)} to ${name}`); a.name = name; }
      const m = mapPassenger(p, a.seq);
      ['age', 'born', 'idFiles'].forEach((k) => { if (m[k] != null) a[k] = m[k]; });
    });
    s.applicants.filter((a) => isActive(a) && !seen.has(a)).forEach((a) => {
      a.removedFromBooking = { version, ...who };
      lines.push(`Passenger removed from the booking: ${displayName(a)} (records kept)`);
    });
    return lines;
  }
  /**
   * Creates or updates the task for one Book now row. Existing checklists,
   * appointments, plans and history are never overwritten. Returns the task id.
   */
  function applyBookingRow({ deal, row, kind, svc, pax, version, who, newId, used }) {
    const services = TN.DATA.services;
    const f = facts(kind, row);
    const selected = bookedPax(row, pax);
    const found = findTask(services, deal.id, kind, row, f, used);
    const id = found || newId();
    used.add(id); row.srcId = id;
    if (!found) {
      const s = services[id] = { deal: deal.id, assignee: null, taskStatus: 'new', ...svc, [kind]: f, applicants: selected.map((p, i) => mapPassenger(p, i + 1)), srcRow: row.id, versionNo: version, savedAt: who.at, createdAt: who.at, workflow: emptyWorkflow() };
      s.detail = TN.fmt.plural(selected.length, 'traveller');
      addHistory(id, 'Task created from the submitted booking', who);
      commit(id);
      return id;
    }
    const s = normalizeTask(id, services[id]);
    const lines = [];
    if (s.removedFromBooking) { delete s.removedFromBooking; lines.push('Service back on the booking'); }
    const old = s[kind] || {};
    const label = { country: 'Country', purpose: 'Visa category', travelDate: 'Travel date', feePaidBy: 'Government fee paid by', atype: 'Application type', city: 'Office city', requirements: 'Requirements' };
    Object.keys(f).forEach((k) => { if (found && (old[k] ?? '') !== f[k]) { if (old[k] != null && old[k] !== '') lines.push(`${label[k]} changed: ${k === 'feePaidBy' ? FEE_WORD[old[k]] : old[k] || 'blank'} to ${k === 'feePaidBy' ? FEE_WORD[f[k]] : f[k] || 'blank'}`); } });
    s[kind] = { ...old, ...f };
    const { budget, ...rest } = svc;
    Object.assign(s, rest, budget != null ? { budget } : {});
    lines.push(...reconcile(id, s, selected, version, who));
    s.detail = TN.fmt.plural(activeApplicants(s).length, 'traveller');
    s.srcRow = row.id; s.versionNo = version; s.savedAt = who.at;
    if (s.assignee && kind === 'visa') activeApplicants(s).filter(notStarted).forEach((a) => addNewDocs(s, a));
    addHistory(id, `Booking version ${version} received`, who, lines.length ? { detail: lines.join(' · ') } : {});
    if (lines.length) {
      s.workflow.changes.push({ version, lines, ...who });
      if (s.assignee) TN.DATA.notices.unshift({ id: `n-vf-${id}-${version}`, to: ['visa'], kind: 'notice', text: `Booking changed for ${deal.id}: ${lines.join('; ')}.`, deal: deal.id, at: who.at });
    }
    commit(id);
    return id;
  }
  /** A changed route may ask for more documents. Existing rows and their records stay. */
  function addNewDocs(s, a) {
    const want = checklistFor(s, a.type) || [];
    a.documents = docList(a);
    want.forEach((d) => { if (!a.documents.some((x) => x.code === d.code)) a.documents.push(d); });
  }
  /** Visa-desk tasks whose service left the booking stay on record, flagged. Returns their ids. */
  function flagDropped(deal, keep, version, who) {
    const out = [];
    (deal.services || []).forEach((id) => {
      const s = TN.DATA.services[id];
      if (!s || s.dept !== 'visa' || keep.includes(id)) return;
      out.push(id);
      if (s.removedFromBooking) return;
      s.removedFromBooking = { version, ...who };
      addHistory(id, 'Service removed from the booking (records kept)', who);
      commit(id);
    });
    return out;
  }

  /* ------------------------------------------------------------------
     Browser storage: versioned and namespaced. Only Visa desk tasks that
     changed, their history and their file names. Other departments and
     the costs are not stored here.
     ------------------------------------------------------------------ */
  const STORE_KEY = 'tripnavigate.visa.v1';
  const STORE_VERSION = 1;
  const KEEP = ['deal', 'kind', 'dept', 'title', 'detail', 'start', 'end', 'budget', 'assignee', 'taskStatus', 'takenAt', 'takenBy', 'doneAt', 'versionNo', 'savedAt', 'createdAt', 'srcRow', 'visa', 'passport', 'applicants', 'workflow', 'removedFromBooking'];
  const touched = new Set();
  const store = { problem: '' };
  function persist() {
    const services = TN.DATA.services; const tasks = {}; const hist = {};
    touched.forEach((id) => {
      const s = services[id]; if (!s) return;
      tasks[id] = Object.fromEntries(KEEP.filter((k) => s[k] !== undefined).map((k) => [k, s[k]]));
      hist[id] = history(id);
    });
    const files = (TN.DATA.departmentFiles || []).filter((f) => touched.has(f.task));
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ version: STORE_VERSION, tasks, history: hist, files }));
      store.problem = '';
      return true;
    } catch (e) {
      store.problem = 'write';
      return false;
    }
  }
  /** Marks a task changed and saves. False means the browser refused. */
  function commit(id) { touched.add(id); return persist(); }
  const usableTask = (t) => t && typeof t === 'object' && t.dept === 'visa' && TN.deal(t.deal) && (t.applicants === undefined || (Array.isArray(t.applicants) && t.applicants.every((a) => a && Number.isFinite(a.seq)))) && (t.workflow === undefined || (typeof t.workflow === 'object' && t.workflow !== null));
  /** Puts saved Visa records back. Corrupt or foreign data is ignored, never fatal. */
  function restore() {
    let saved;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (!raw) return 0;
      saved = JSON.parse(raw);
    } catch (e) { store.problem = 'read'; return 0; }
    if (!saved || saved.version !== STORE_VERSION || typeof saved.tasks !== 'object' || !saved.tasks) { store.problem = 'read'; return 0; }
    const services = TN.DATA.services; const H = (TN.DATA.taskHistory = TN.DATA.taskHistory || {}); let n = 0;
    Object.entries(saved.tasks).forEach(([id, t]) => {
      if (!usableTask(t) || (services[id] && services[id].deal !== t.deal)) { store.problem = 'read'; return; }
      services[id] = Object.assign(services[id] || {}, t);
      const d = TN.deal(t.deal); if (!d.services.includes(id)) d.services.push(id);
      if (saved.history && Array.isArray(saved.history[id])) H[id] = saved.history[id];
      touched.add(id); n++;
    });
    const files = (TN.DATA.departmentFiles = TN.DATA.departmentFiles || []);
    if (Array.isArray(saved.files)) saved.files.forEach((f) => { if (f && f.id && touched.has(f.task) && !files.some((x) => x.id === f.id)) files.push(f); });
    return n;
  }

  TN.visaFlow = {
    CONFIG, RETURN_MODES, returnWord, STORE_KEY, store, routeFor, routeOf, checklistFor, nowIST, todayIST, actor, validDate, addHistory, emptyWorkflow,
    applicants, activeApplicants, isActive, displayName, normalizeTask, docList, docSummary, docsVerified, docStatus, hydrateChecklist, applyChecklist, addDocument,
    requirementFor, APPT_STATUSES, appointmentOf, appointmentRow, setAppointmentStatus, appointmentStatus, notStarted, canHaveAppointment, canPlan, saveAppointment, applyByOf, planWarnings, savePlan, planOf, planStatus, resolveRequirement,
    progress, stageLabel, mapFee, FEE_WORD, mapPassenger, applyBookingRow, flagDropped, commit, persist, restore,
  };
})();
