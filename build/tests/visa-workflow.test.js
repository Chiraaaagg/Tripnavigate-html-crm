// Run: node build/tests/visa-workflow.test.js   (no dependencies)
// Loads the real data, core, UI helpers, Book now and Flight/Visa files in a small
// fake browser, then checks the Visa early workflow from Sales' submission onward.
// A "refresh" is a new boot with the same fake browser storage.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');

const FILES = ['00-data-base.js', '10-core.js', '11-ui.js', '30-booknow.js', '49-visa-workflow.js', '50-flight-visa.js'];
function boot(role = 'visa', store = new Map(), opts = {}) {
  const pages = new Map(), acts = {}, toasts = [], notes = { drawer: null };
  const c = {
    console, URLSearchParams, URL, Intl, Date, Math, JSON, Object, Array, String, Number, Set, Map, Promise, RegExp, Error, structuredClone,
    setTimeout: () => 1, clearTimeout: () => {},
    location: { search: `?role=${role}`, hash: '#/app/visa' },
    history: { replaceState: () => {} },
    document: { addEventListener: () => {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], documentElement: { style: {} } },
    localStorage: {
      getItem: (k) => { if (opts.readFails) throw new Error('blocked'); return store.has(k) ? store.get(k) : null; },
      setItem: (k, v) => { if (opts.writeFails) throw new Error('quota'); store.set(k, String(v)); },
      removeItem: (k) => store.delete(k),
    },
    FormData: class { constructor(el) { this.d = el.data || {}; } get(k) { return this.d[k] ?? null; } *[Symbol.iterator]() { yield* Object.entries(this.d); } },
  };
  c.window = c; c.addEventListener = () => {}; c.scrollTo = () => {};
  vm.createContext(c);
  const load = (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), c, { filename: file });
  FILES.slice(0, 3).forEach(load);
  const TN = c.TN;
  TN.render = () => {}; TN.go = () => {};
  const page = TN.page; TN.page = (route, def) => { pages.set(route, def); page(route, def); };
  const act = TN.act; TN.act = (name, fn) => { acts[name] = fn; act(name, fn); };
  TN.toast = (text, tone, description) => { toasts.push({ text: typeof text === 'object' ? text.title : text, tone, description }); return toasts.length; };
  TN.drawer = (o) => { notes.drawer = o; };
  FILES.slice(3).forEach(load);
  const render = (id, tab) => pages.get('/app/visa/:taskId').render({ taskId: id }, tab ? { tab } : {});
  const queue = (show) => pages.get('/app/visa').render({}, show ? { show } : {});
  return { c, TN, D: TN.DATA, VF: TN.visaFlow, acts, toasts, notes, store, render, queue, pages };
}
const form = (data = {}, files = {}) => ({ data, dataset: {}, closest: () => null, querySelector: (sel) => { const m = /name="([^"]+)"/.exec(sel); const f = m ? files[m[1]] : files.any; return f ? { files: [f] } : { files: [] }; } });
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/\s+/g, ' ');
const pax = (s, name) => s.applicants.find((a) => a.name === name);
const checks = (...people) => Object.fromEntries(people.map((a) => [`pax:${a.paxId}`, '1']));
const take = (t, id) => t.acts['fv-take'](form({ task: id }));
/** Ticks every document of a passenger as received and verified. */
function verifyAll(t, id, a) {
  const data = { task: id, seq: String(a.seq) };
  a.documents.forEach((d) => { data[`rec-${d.code}`] = '1'; data[`ver-${d.code}`] = '1'; });
  t.acts['vw-chk-save'](form(data));
}
/** A Sales booking on a Deal, through the real Book now state and submitBooking(). */
function salesBooking(store = new Map(), dealId = 'BX-38533') {
  const t = boot('sales', store);
  const S = t.TN.bookNow.draft(dealId);
  const [a, b] = S.pax;
  a.name = 'Kunal Choudhary'; a.dob = '1990-02-03'; a.files = ['Kunal-passport.pdf'];
  b.name = 'Ritu Choudhary';
  S.svc.visa = [{ id: 'row-v', name: '', city: '', date: '2026-12-12', country: 'Thailand', vtype: 'Tourism', atype: 'Fresh', fee: 'Customer pays directly', req: 'Express please', pax: [a.id] }];
  S.svc.passport = [{ id: 'row-p', date: '', country: '', vtype: 'Tourism', atype: 'Renewal', city: 'Jodhpur', fee: '', req: '', pax: [b.id] }];
  t.TN.bookNow.submit(dealId);
  const entry = Object.entries(t.D.services).find(([, s]) => s.deal === dealId && s.kind === 'visa');
  return { t, id: entry[0], s: entry[1], a, b, dealId };
}

/* 1 and 2. A new Sales Visa booking reaches the queue; only the selected passengers; details mapped. */
{
  const { t, id, s, a } = salesBooking();
  assert.equal(s.dept, 'visa');
  assert.deepEqual(JSON.parse(JSON.stringify(s.applicants.map((x) => x.paxId))), [a.id], 'only the selected passenger, with the stable id');
  assert.equal(s.visa.country, 'Thailand'); assert.equal(s.visa.purpose, 'Tourism'); assert.equal(s.visa.travelDate, '2026-12-12');
  assert.equal(s.visa.feePaidBy, 'customer', 'the fee dropdown value is saved'); assert.equal(s.visa.requirements, 'Express please');
  assert.equal(s.applicants[0].born, '1990-02-03'); assert.equal(s.applicants[0].idFiles[0], 'Kunal-passport.pdf');
  assert.equal(s.applicants[0].passport, undefined, 'no passport number is invented');
  assert.equal(s.applicants[0].nationality, undefined, 'no nationality is invented');
  const v = boot('visa', t.store);
  const q = strip(v.queue());
  assert.match(q, /Visa · Thailand · Tourism/); assert.match(q, /BX-38533/); assert.match(q, /Passport · Renewal/);
  assert.doesNotMatch(v.render(id), /undefined/);
  console.log('PASS 1, 2: a new Sales booking opens in the Visa queue; only the selected passenger; country, category, travel date, fee payer and details map; nothing invented.');
}

/* Passport: same department, no Visa data, no Visa rules. */
{
  const { t } = salesBooking();
  const v = boot('visa', t.store);
  const pid = Object.keys(v.D.services).find((k) => v.D.services[k].deal === 'BX-38533' && v.D.services[k].kind === 'passport');
  const s = v.D.services[pid];
  assert.equal(s.visa, undefined); assert.equal(s.passport.atype, 'Renewal'); assert.equal(s.applicants.length, 1);
  take(v, pid);
  const work = strip(v.render(pid, 'work'));
  assert.match(work, /do not apply to a passport task/);
  assert.doesNotMatch(work, /Save appointment|Save application plan/);
  ['files', 'history', undefined].forEach((tab) => v.render(pid, tab));
  console.log('PASS: Passport tasks open, take and render with no Visa data and no Visa rules.');
}

/* 3. Legacy and incomplete records do not crash. */
{
  const t = boot();
  const S = t.D.services;
  S['old-1'] = { deal: 'BX-38390', kind: 'visa', dept: 'visa', title: 'Old visa task', taskStatus: 'new', assignee: null };
  S['old-2'] = { deal: 'BX-38390', kind: 'visa', dept: 'visa', title: 'Half task', taskStatus: 'in_progress', assignee: 'visa', visa: { country: 'Nowhere' }, applicants: [{ seq: 1, name: '', state: 'docs_pending' }] };
  S['old-3'] = { deal: 'BX-NONE', kind: 'passport', dept: 'visa', taskStatus: 'new', assignee: null };
  ['not_taken', 'mine', 'all'].forEach((x) => t.queue(x));
  for (const id of ['old-1', 'old-2', 'old-3']) ['details', 'work', 'files', 'history'].forEach((tab) => { const h = t.render(id, tab); assert.doesNotMatch(h, /undefined|NaN/, `${id} ${tab}`); });
  take(t, 'old-1');
  assert.match(strip(t.render('old-1', 'work')), /No passengers came with this task/);
  assert.match(strip(t.render('old-2', 'work')), /Passenger 1 \(name missing\)/);
  assert.match(strip(t.render('old-2', 'work')), /Appointment requirement needs confirmation/);
  t.acts['vw-checklist']({ dataset: { id: 'old-2', seq: '1' } });
  assert.match(strip(t.notes.drawer.body), /Document requirements need confirmation/);
  assert.equal(t.VF.docsVerified(S['old-2'].applicants[0]), false, 'an empty checklist is never complete');
  console.log('PASS 3: legacy and incomplete tasks render on every tab; missing rules say so; an empty checklist is not complete.');
}

/* 5 and part of 4. Verified needs Received; identity and audit. */
{
  const t = boot();
  const id = 's-612-v1'; const s = t.D.services[id];
  take(t, id);
  assert.equal(s.assignee, 'visa'); assert.equal(s.takenBy.byName, 'Farhan Ali'); assert.ok(s.takenAt); assert.ok(!s.takenAt.startsWith(t.TN.TODAY), 'real time, not the demo date');
  assert.ok(t.D.taskHistory[id].some((h) => h.title === 'Task taken'));
  const summary = strip(t.render(id));
  ['BX-38612', 'Devendra Sisodia', 'France · Tourism', 'Passengers', 'Jodhpur', 'Farhan Ali'].forEach((w) => assert.ok(summary.includes(w), w));
  const a = pax(s, 'Devendra Sisodia');
  assert.equal(a.documents.length, 5); assert.ok(a.documents.every((d) => d.status === 'missing'));
  const code = a.documents[0].code;
  t.acts['vw-chk-save'](form({ task: id, seq: String(a.seq), [`ver-${code}`]: '1' }));
  assert.equal(a.documents[0].status, 'missing', 'Verified without Received does not stick');
  t.acts['vw-chk-save'](form({ task: id, seq: String(a.seq), [`rec-${code}`]: '1', [`ver-${code}`]: '1', [`rem-${code}`]: 'Clear copy' }));
  assert.equal(a.documents[0].status, 'checked'); assert.equal(a.documents[0].remark, 'Clear copy');
  assert.equal(a.checklistUpdated.byName, 'Farhan Ali');
  t.acts['vw-chk-save'](form({ task: id, seq: String(a.seq), [`ver-${code}`]: '1', [`rem-${code}`]: 'Clear copy' }));
  assert.equal(a.documents[0].status, 'missing', 'unticking Received clears Verified');
  const last = t.D.taskHistory[id].slice(-1)[0];
  assert.match(last.title, /Checklist updated: Devendra Sisodia/); assert.match(last.detail, /missing/);
  t.acts['vw-chk-save'](form({ task: id, seq: String(a.seq), [`ver-${code}`]: '1', [`rem-${code}`]: 'Clear copy' }));
  assert.ok(t.toasts.some((x) => x.text === 'No changes to save.'));
  assert.match(strip(t.notes.drawer.body), /Last updated by Farhan Ali/);
  assert.match(strip(t.notes.drawer.body), /Demo configuration/);
  assert.match(strip(t.notes.drawer.body), /Missing: 5 of 5/);
  console.log('PASS 5: Verified needs Received, unticking clears it; who and when come from the signed-in person and the real clock; History records it.');
}

/* 4. Survives a refresh, and bad storage does not crash. */
{
  const t = boot();
  const id = 's-612-v3'; const s = t.D.services[id];
  take(t, id);
  const a = s.applicants[0];
  verifyAll(t, id, a);
  const flightBefore = JSON.stringify(t.D.services['s-412-f'].taskStatus);
  assert.deepEqual([...t.store.keys()], ['tripnavigate.visa.v1']);
  const saved = JSON.parse(t.store.get('tripnavigate.visa.v1'));
  assert.equal(saved.version, 1); assert.deepEqual(Object.keys(saved.tasks), [id], 'only the changed Visa task is stored');
  const r = boot('visa', t.store);
  const s2 = r.D.services[id];
  assert.equal(s2.assignee, 'visa'); assert.ok(s2.applicants[0].documents.every((d) => d.status === 'checked'));
  assert.equal(s2.applicants[0].checklistUpdated.byName, 'Farhan Ali');
  assert.ok(r.D.taskHistory[id].some((h) => /Checklist updated/.test(h.title)));
  assert.equal(JSON.stringify(r.D.services['s-412-f'].taskStatus), flightBefore);

  const bad = boot('visa', new Map([['tripnavigate.visa.v1', '{not json']]));
  assert.equal(bad.VF.store.problem, 'read'); assert.match(strip(bad.queue()), /could not be read/);
  const old = boot('visa', new Map([['tripnavigate.visa.v1', JSON.stringify({ version: 99, tasks: { 's-612-v1': { dept: 'visa' } } })]]));
  assert.equal(old.D.services['s-612-v1'].assignee, null);
  const wrong = boot('visa', new Map([['tripnavigate.visa.v1', JSON.stringify({ version: 1, tasks: { 's-612-v1': { dept: 'flight', deal: 'BX-38612' }, 'bad': { dept: 'visa', deal: 'BX-NONE' } } })]]));
  assert.equal(wrong.D.services['s-612-v1'].dept, 'visa'); assert.equal(wrong.D.services.bad, undefined);
  const blockedRead = boot('visa', new Map(), { readFails: true });
  assert.equal(blockedRead.D.services['s-612-v1'].assignee, null);
  const full = boot('visa', new Map(), { writeFails: true });
  take(full, 's-612-v1');
  assert.ok(full.toasts.some((x) => x.text === 'Browser storage is unavailable'));
  assert.equal(full.D.services['s-612-v1'].assignee, 'visa', 'the work still happens in the page');
  console.log('PASS 4: checklist, staff and History survive a refresh; versioned key; Visa only; corrupt, old, foreign or blocked storage is handled.');
}

/* 6 and 7 (Required), 8. One appointment per passenger, in the section after the applicants. */
{
  const t = boot();
  const id = 's-612-v1'; const s = t.D.services[id];
  take(t, id);
  const [d, u, ch, inf] = ['Devendra Sisodia', 'Sunita Sisodia', 'Aarav Sisodia', 'Ira Sisodia'].map((n) => pax(s, n));
  assert.equal(t.VF.requirementFor(s).value, 'required');
  assert.equal(inf.documents.length, 0, 'infant checklist is not configured, not guessed');
  assert.equal(t.VF.docStatus(inf).label, 'Document requirements need confirmation');
  assert.equal(ch.documents.some((x) => x.code === 'birth_certificate'), true, 'child list differs from adult list');
  const when = { date: '2026-12-03', time: '10:30', timezone: 'Asia/Kolkata', centre: 'Visa centre, Jaipur', location: 'MI Road, Jaipur' };
  const go = (a, extra = {}) => t.acts['vw-appt-save'](form({ task: id, seq: String(a.seq), ...when, ...extra }));
  go(d);
  assert.equal(s.workflow.appointments.length, 0, 'unverified documents are refused');
  assert.match(strip(t.notes.drawer.body), /Devendra Sisodia: Documents not verified yet/);
  assert.match(t.notes.drawer.body, /value="Visa centre, Jaipur"/, 'typed values stay after a refusal');
  [d, u, ch].forEach((a) => verifyAll(t, id, a));
  go(inf);
  assert.equal(s.workflow.appointments.length, 0, 'a passenger without a checklist cannot be scheduled');
  go(d, { centre: '' });
  assert.equal(s.workflow.appointments.length, 0, 'the centre is required');
  go(d, { location: '' });
  assert.equal(s.workflow.appointments.length, 0, 'the location is required');

  let html = t.render(id, 'work');
  const after = html.indexOf('id="visa-appt-'); const last = html.lastIndexOf('id="app-s-612-v1-'); const fees = html.indexOf('Fees and costs');
  assert.ok(after > last && after < fees, 'the section sits after the last applicant and before Fees and costs');
  let text = strip(html.slice(after, fees));
  ['Passenger name', 'Country', 'Visa type', 'Appointment date & time', 'Status', 'Action', 'Devendra Sisodia', 'Sunita Sisodia', 'Aarav Sisodia', 'Ira Sisodia', 'France', 'Tourism', 'Not set', 'Not scheduled', 'Set appointment'].forEach((w) => assert.ok(text.includes(w), w));
  assert.equal((html.slice(after, fees).match(/<tr role="row"/g) || []).length, 5, 'one row per applicant, children and infants included');
  t.acts['vw-appt-open']({ dataset: { id, seq: String(d.seq) } });
  const open = strip(t.notes.drawer.body);
  ['Devendra Sisodia', 'France', 'Tourism', 'Appointment date', 'Appointment time', 'Timezone', 'Embassy / Visa centre name', 'Location / address', 'Appointment reference (optional)', 'Remarks (optional)'].forEach((w) => assert.ok(open.includes(w), w));
  assert.match(t.notes.drawer.footer, /Cancel/); assert.match(t.notes.drawer.footer, /Save appointment/);

  go(d); go(u, { date: '2026-12-04', time: '09:15' });
  assert.equal(s.workflow.appointments.length, 2, 'each passenger has their own record');
  assert.deepEqual(JSON.parse(JSON.stringify(s.workflow.appointments[0].passengers)), [{ paxId: d.paxId, status: 'scheduled' }], 'saved against the stable id');
  assert.equal(t.VF.appointmentRow(s, d).label, 'Scheduled'); assert.equal(t.VF.appointmentRow(s, ch).label, 'Not scheduled', 'nobody else moved');
  assert.ok(t.D.taskHistory[id].some((h) => h.title === 'Appointment scheduled: Devendra Sisodia'));
  html = t.render(id, 'work');
  text = strip(html.slice(html.indexOf('id="visa-appt-'), html.indexOf('Fees and costs')));
  ['3 Dec 2026, 10:30 am', '4 Dec 2026, 9:15 am', 'Embassy / Centre details', 'Edit appointment', 'Update status'].forEach((w) => assert.ok(text.includes(w), w));
  t.acts['vw-appt-details']({ dataset: { id, seq: String(d.seq) } });
  assert.match(strip(t.notes.drawer.body), /Saved by Farhan Ali · Saved on/); assert.match(strip(t.notes.drawer.body), /MI Road, Jaipur/);

  go(u, { date: '2026-12-06', time: '09:00' });
  assert.equal(t.VF.appointmentRow(s, u).label, 'Rescheduled', 'a new date is a reschedule');
  assert.equal(t.VF.appointmentOf(s, u).at, '2026-12-06T09:00'); assert.equal(t.VF.appointmentOf(s, d).at, '2026-12-03T10:30', 'the other passenger keeps theirs');
  assert.equal(s.workflow.appointments.length, 3, 'the old record is kept');
  go(d, { remarks: 'Carry originals' });
  assert.equal(t.VF.appointmentRow(s, d).label, 'Scheduled', 'same date stays scheduled');
  t.acts['vw-appt-status'](form({ task: id, seq: String(d.seq), status: 'attended' }));
  assert.equal(t.VF.appointmentRow(s, d).label, 'Attended'); assert.equal(t.VF.appointmentRow(s, u).label, 'Rescheduled', 'status is per passenger');
  assert.equal(d.state, 'docs_pending', 'attended is not a visa result'); assert.equal(s.taskStatus, 'in_progress', 'and does not finish the task');
  assert.ok(t.D.taskHistory[id].some((h) => h.title === 'Appointment status: Devendra Sisodia: Attended'));
  t.acts['vw-appt-status'](form({ task: id, seq: String(d.seq), status: 'nonsense' }));
  assert.equal(t.VF.appointmentRow(s, d).label, 'Attended', 'an unknown status is refused');
  t.acts['vw-appt-status'](form({ task: id, seq: String(u.seq), status: 'cancelled' }));
  assert.equal(t.VF.appointmentOf(s, u), null, 'a cancelled appointment does not count');
  html = t.render(id, 'work');
  assert.match(strip(html.slice(html.indexOf('id="visa-appt-'), html.indexOf('Fees and costs'))), /Sunita Sisodia .*Cancelled .*Set appointment/);
  go(u, { date: '2026-12-08' });
  assert.equal(t.VF.appointmentRow(s, u).label, 'Scheduled', 'a new appointment after a cancellation');
  go(ch, { date: '2026-12-05', time: '11:00', timezone: 'Europe/Paris', reference: 'REF-9' });
  assert.match(strip(t.render(id, 'work')), /Appointment: 3 Dec 2026, 10:30 am · Asia\/Kolkata, Visa centre, Jaipur/, 'the submission form shows a summary');
  assert.doesNotMatch(t.render(id, 'work'), /name="appointmentAt"|name="appointmentPlace"/, 'the appointment left the submission form');
  t.acts['vw-plan-save'](form({ task: id, date: '2026-12-10', ...checks(d) }));
  t.acts['vw-plan-save'](form({ task: id, date: '2026-12-11', ...checks(inf) }));
  assert.ok(t.VF.planOf(s, d)); assert.equal(t.VF.planOf(s, inf), null, 'pending passenger is held back, ready one goes on');
  const r = boot('visa', t.store);
  const rs = r.D.services[id];
  assert.equal(r.VF.appointmentOf(rs, pax(rs, 'Aarav Sisodia')).reference, 'REF-9'); assert.equal(r.VF.appointmentRow(rs, pax(rs, 'Devendra Sisodia')).label, 'Attended');
  /* An older shared record: one passenger's change leaves the other alone. */
  const o = boot('visa'); const os = o.D.services[id]; take(o, id);
  const [o1, o2] = os.applicants;
  os.workflow.appointments.push({ id: 'va-old', passengers: [{ paxId: o1.paxId, status: 'scheduled' }, { paxId: o2.paxId, status: 'scheduled' }], at: '2026-12-01T10:00', timezone: 'Asia/Kolkata', centre: 'Old centre', created: { byName: 'Farhan Ali', at: '2026-11-01 10:00' } });
  o.acts['vw-appt-status'](form({ task: id, seq: String(o1.seq), status: 'attended' }));
  assert.equal(o.VF.appointmentRow(os, o2).label, 'Scheduled');
  o.acts['vw-appt-save'](form({ task: id, seq: String(o1.seq), ...when }));
  assert.equal(o.VF.appointmentOf(os, o2).id, 'va-old', 'editing one leaves the shared record for the other');
  /* The sample family: the final card is followed by the section; UAE tourism is not required here. */
  const bh = boot('visa'); const bhtml = bh.render('s-390-v', 'work');
  const bpos = bhtml.indexOf('id="visa-appt-');
  assert.ok(bpos > bhtml.lastIndexOf('Myra Bhandari</h2>') && bpos < bhtml.indexOf('Fees and costs'), 'after Myra Bhandari, before Fees and costs');
  const btext = bhtml.slice(bpos, bhtml.indexOf('Fees and costs'));
  assert.equal((btext.match(/<tr role="row"/g) || []).length, 5); ['Suresh Bhandari', 'Anita Bhandari', 'Kabir Bhandari', 'Myra Bhandari'].forEach((w) => assert.ok(btext.includes(w), w));
  assert.equal((strip(btext).match(/Not required/g) || []).length >= 8, true, 'date and status both say Not required'); assert.doesNotMatch(btext, /Set appointment|Edit appointment|Update status/, 'scheduling actions are hidden');
  const unknown = boot('visa'); take(unknown, 's-612-v2');
  const utext = unknown.render('s-612-v2', 'work');
  const usec = strip(utext.slice(utext.indexOf('id="visa-appt-'), utext.indexOf('Fees and costs')));
  assert.match(usec, /Requirement unconfirmed/); assert.doesNotMatch(usec, /Set appointment|Not required for the configured/, 'unknown stays unconfirmed');
  const blank = boot('visa'); blank.D.services['s-612-v3'].applicants[0].name = ''; blank.D.services['s-612-v3'].visa = { country: 'France', purpose: '' };
  take(blank, 's-612-v3');
  assert.match(strip(blank.render('s-612-v3', 'work')), /Not provided/, 'missing details do not crash');
  const viewer = boot('manager', t.store);
  const vhtml = viewer.render(id, 'work');
  assert.match(vhtml, /Embassy \/ Centre details/); assert.doesNotMatch(vhtml, /Edit appointment|Update status|Set appointment/, 'the Manager reads only');
  viewer.acts['vw-appt-status'](form({ task: id, seq: String(d.seq), status: 'cancelled' }));
  assert.equal(viewer.VF.appointmentRow(viewer.D.services[id], pax(viewer.D.services[id], 'Devendra Sisodia')).label, 'Attended', 'and is refused');
  console.log('PASS 6, 7 (Required), 8: the section follows the last applicant; each passenger has their own row, record and status; Attended changes nothing else; details, History and refresh work.');
}

/* 7 (Not required), 9. */
{
  const t = boot();
  const id = 's-612-v3'; const s = t.D.services[id];
  take(t, id);
  const [a, b] = s.applicants;
  assert.equal(t.VF.requirementFor(s).value, 'not_required');
  assert.match(strip(t.render(id, 'work')), /Appointment not required for the configured application route\./);
  verifyAll(t, id, a);
  assert.equal(t.VF.appointmentStatus(s, a).label, 'Appointment not required');
  t.acts['vw-appt-save'](form({ task: id, seq: String(a.seq), date: '2026-12-03', time: '10:30', timezone: 'Asia/Kolkata', centre: 'X', location: 'Y' }));
  assert.equal(s.workflow.appointments.length, 0);
  t.acts['vw-plan-save'](form({ task: id, date: '', ...checks(a) }));
  assert.equal(t.VF.planOf(s, a), null, 'a date is required');
  t.acts['vw-plan-save'](form({ task: id, date: '2026-12-20', remarks: 'After salary', ...checks(a) }));
  const p = t.VF.planOf(s, a);
  assert.equal(p.plannedDate, '2026-12-20'); assert.equal(p.updated.byName, 'Farhan Ali'); assert.equal(p.updated.byId, 'u-visa'); assert.ok(p.created.iso);
  assert.equal(a.state, 'docs_pending', 'a plan is not a submission'); assert.equal(a.submittedAt, undefined); assert.equal(s.taskStatus, 'in_progress');
  let html = strip(t.render(id, 'work'));
  assert.match(html, /Planned apply date: 20 Dec 2026/); assert.match(html, /Set by: Farhan Ali · Saved on:/);
  assert.ok(t.D.taskHistory[id].some((h) => /Application planned for 20 Dec 2026/.test(h.title)));
  verifyAll(t, id, b);
  t.acts['vw-plan-save'](form({ task: id, date: '2027-03-01', ...checks(b) }));
  assert.equal(t.VF.planOf(s, a).plannedDate, '2026-12-20', 'separate dates per passenger');
  assert.equal(t.VF.planOf(s, b).plannedDate, '2027-03-01', 'a late date saves');
  assert.ok(t.toasts.some((x) => /after the travel date/.test(x.description || '')), 'and it warns');
  assert.match(strip(t.render(id, 'work')), /after the apply-by date/);
  assert.equal(t.VF.stageLabel({ ...s, applicants: [a] }), 'Application planned');
  console.log('PASS 7 (Not required), 9: eligible passengers plan directly; staff and time saved; state stays not submitted; separate dates; late dates warn but save.');
}

/* 7 (Not configured). */
{
  const t = boot();
  const id = 's-612-v2'; const s = t.D.services[id];
  take(t, id);
  const a = s.applicants[0];
  verifyAll(t, id, a);
  assert.equal(t.VF.requirementFor(s).value, 'not_configured');
  assert.equal(t.VF.appointmentStatus(s, a).label, 'Appointment requirement pending');
  assert.match(strip(t.render(id, 'work')), /Appointment requirement needs confirmation\./);
  t.acts['vw-plan-save'](form({ task: id, date: '2026-12-20', ...checks(a) }));
  assert.equal(t.VF.planOf(s, a), null, 'blocked');
  t.acts['fv-visa-submit'](form({ task: id, seq: String(a.seq), reference: 'R1', submittedOn: '2026-10-28' }));
  assert.equal(a.state, 'docs_pending', 'submission blocked too');
  t.acts['vw-resolve'](form({ task: id, value: 'not_required', reason: 'I think so' }));
  assert.equal(s.workflow.resolution, null, 'the executive cannot resolve it');
  const m = boot('manager', t.store);
  const ms = m.D.services[id];
  assert.match(strip(m.render(id, 'work')), /Confirm requirement/);
  m.acts['vw-resolve'](form({ task: id, value: 'not_required', reason: '' }));
  assert.equal(ms.workflow.resolution, null, 'a reason is required');
  m.acts['vw-resolve'](form({ task: id, value: 'not_required', reason: 'Confirmed with the visa partner' }));
  assert.equal(ms.workflow.resolution.byName, 'Vikram Rathore');
  const v2 = boot('visa', t.store);
  const s2 = v2.D.services[id];
  v2.acts['vw-plan-save'](form({ task: id, date: '2026-12-20', ...checks(s2.applicants[0]) }));
  assert.ok(v2.VF.planOf(s2, s2.applicants[0]), 'unblocked after the Manager confirms');
  assert.match(strip(v2.render(id, 'work')), /Confirmed by Vikram Rathore/);
  console.log('PASS 7 (Not configured): progress is blocked, never guessed; only the Manager resolves, with a reason on record.');
}

/* 10. Booking resubmission. */
{
  const { t, id, a, b, dealId } = salesBooking();
  const store = t.store;
  /* Visa takes it and works on it, in the same session as Sales. */
  const role = (r) => { t.TN.setRole(r); };
  role('visa');
  const s = t.D.services[id];
  take(t, id);
  const kunal = s.applicants[0];
  verifyAll(t, id, kunal);
  const docsBefore = JSON.stringify(kunal.documents);
  const historyBefore = t.D.taskHistory[id].length;
  /* Accounts returns it, Sales fixes it: the second passenger is added to the visa. */
  const d = t.TN.deal(dealId);
  Object.assign(d, { bookingState: 'returned', accountsReview: 'returned', returnReason: 'Check the GSTIN.' });
  role('sales');
  const draft = t.TN.bookNow.draft(dealId);
  assert.equal(draft.version, 2); assert.equal(draft.returned, 'Check the GSTIN.');
  assert.equal(draft.svc.visa[0].srcId, id, 'the draft came back linked to its task');
  draft.svc.visa[0].pax = [a.id, b.id];
  t.TN.bookNow.submit(dealId);
  assert.equal(Object.values(t.D.services).filter((x) => x.deal === dealId && x.kind === 'visa').length, 1, 'no duplicate task');
  assert.equal(s.assignee, 'visa'); assert.equal(s.taskStatus, 'in_progress'); assert.equal(s.versionNo, 2);
  assert.equal(JSON.stringify(kunal.documents), docsBefore, 'the checklist is untouched');
  assert.equal(s.applicants.length, 2);
  assert.equal(s.applicants[1].paxId, b.id); assert.equal(s.applicants[1].state, 'docs_pending'); assert.ok(s.applicants[1].documents.length, 'the added passenger is ready to work');
  assert.ok(t.D.taskHistory[id].length > historyBefore);
  assert.match(t.D.taskHistory[id].slice(-1)[0].detail, /Passenger added: Ritu Choudhary/);
  assert.ok(t.D.notices.some((n) => n.to.includes('visa') && /Passenger added/.test(n.text)));
  /* Third version: Kunal is removed. His records stay, flagged. */
  Object.assign(d, { bookingState: 'returned', returnReason: 'Again.' });
  const draft3 = t.TN.bookNow.draft(dealId);
  draft3.svc.visa[0].pax = [b.id];
  t.TN.bookNow.submit(dealId);
  assert.equal(kunal.removedFromBooking.version, 3); assert.equal(JSON.stringify(kunal.documents), docsBefore, 'records kept');
  assert.equal(t.VF.activeApplicants(s).length, 1); assert.equal(s.applicants.length, 2);
  role('visa');
  const html = strip(t.render(id, 'work'));
  assert.match(html, /Passenger removed from the booking: Kunal Choudhary \(records kept\)/);
  assert.match(html, /Removed from the booking/);
  t.acts['vw-chk-save'](form({ task: id, seq: String(kunal.seq) }));
  assert.equal(JSON.stringify(kunal.documents), docsBefore, 'a removed passenger is closed for editing');
  /* The whole visa service is removed, then a refresh rebuilds the draft from nothing. */
  Object.assign(d, { bookingState: 'returned' });
  role('sales');
  const draft4 = t.TN.bookNow.draft(dealId);
  draft4.svc.visa = [];
  t.TN.bookNow.submit(dealId);
  assert.ok(s.removedFromBooking); assert.ok(d.services.includes(id), 'still on the Deal');
  assert.match(strip(boot('visa', store).queue('mine')), /Removed from the booking/, 'the desk sees it flagged');
  const after = boot('sales', store);
  const S2 = after.TN.bookNow.draft(dealId);
  S2.pax[0].name = 'Ritu Choudhary'; S2.pax[0].id = 'brand-new-id'; S2.pax[1].name = 'Kunal Choudhary';
  S2.svc.visa = [{ id: 'row-new', date: '2026-12-12', country: 'thailand', vtype: 'Tourism', fee: '', req: '', pax: ['brand-new-id'] }];
  S2.svc.passport = [];
  after.TN.bookNow.submit(dealId);
  const list = Object.values(after.D.services).filter((x) => x.deal === dealId && x.kind === 'visa');
  assert.equal(list.length, 1, 'matched after a refresh, by country, category and name');
  assert.equal(list[0].removedFromBooking, undefined);
  assert.equal(list[0].applicants.filter((x) => x.name === 'Ritu Choudhary').length, 1, 'no duplicate passenger');
  assert.equal(list[0].applicants.find((x) => x.name === 'Ritu Choudhary').paxId, b.id, 'the stable id is kept');
  console.log('PASS 10: resubmission keeps the task, checklist, assignee and History; added and removed passengers and services are explicit; nothing is duplicated, even after a refresh.');
}

/* 11. Unauthorized actions are refused inside the handlers. */
{
  const t = boot();
  const id = 's-612-v3'; const s = t.D.services[id];
  const a = s.applicants[0];
  const m = boot('manager', t.store);
  m.acts['fv-take'](form({ task: id }));
  assert.equal(m.D.services[id].assignee, null, 'the Manager cannot take a Visa task');
  take(t, id);
  verifyAll(t, id, a);
  const before = t.store.get('tripnavigate.visa.v1');
  const attempts = (x) => {
    const tid = id; const seq = String(a.seq); const code = a.documents[0].code;
    x.acts['vw-chk-save'](form({ task: tid, seq, [`rec-${code}`]: '' }));
    x.acts['vw-plan-save'](form({ task: tid, date: '2026-12-01', [`pax:${a.paxId}`]: '1' }));
    x.acts['vw-appt-save'](form({ task: tid, seq, date: '2026-12-01', time: '10:00', timezone: 'Asia/Kolkata', centre: 'X', location: 'Y' }));
    x.acts['fv-visa-submit'](form({ task: tid, seq, reference: 'X', submittedOn: '2026-10-28' }));
    x.acts['fv-visa-state'](form({ task: tid, seq, state: 'withdrawn' }));
    x.acts['fv-visa-outcome'](form({ task: tid, seq, state: 'issued', evidence: 'x' }));
    x.acts['fv-upload'](form({ task: tid, seq, kind: 'applicant_document', formKey: 'k' }, { any: { name: 'a.pdf', size: 10 } }));
  };
  const mgr = boot('manager', t.store); attempts(mgr);
  assert.equal(mgr.store.get('tripnavigate.visa.v1'), before, 'the Manager keeps read access only');
  assert.equal(mgr.toasts.filter((x) => x.text === 'Not allowed').length, 7);
  assert.doesNotMatch(mgr.render(id, 'work'), /Save appointment|Save application plan|Record submission/);
  const flight = boot('flight', t.store); attempts(flight);
  assert.equal(flight.store.get('tripnavigate.visa.v1'), before);
  const other = boot('visa', t.store);
  other.D.services[id].assignee = 'visa2'; other.D.services[id].takenBy = { byName: 'Someone Else' };
  attempts(other);
  assert.ok(other.toasts.every((x) => x.text === 'Not allowed'), 'another executive is refused');
  const money = t.render(id, 'work') + t.render(id) + t.render(id, 'files') + t.render(id, 'history');
  assert.doesNotMatch(money, /Selling price|842,?000|Margin/i, 'selling price stays hidden from Visa staff');
  console.log('PASS 11: Manager, Flight and another executive are refused inside every action; the Manager still reads; no selling price on any tab.');
}

/* 12. Later Visa processing and Flight still work. */
{
  const t = boot();
  const id = 's-612-v3'; const s = t.D.services[id];
  take(t, id);
  const [a, b, c] = s.applicants;
  [a, b, c].forEach((x) => verifyAll(t, id, x));
  t.acts['fv-visa-submit'](form({ task: id, seq: String(a.seq), reference: '', submittedOn: '2026-10-28' }));
  assert.equal(a.state, 'docs_pending', 'a reference is required');
  t.acts['fv-visa-submit'](form({ task: id, seq: String(a.seq), reference: 'R-1', submittedOn: '2099-01-01' }));
  assert.equal(a.state, 'docs_pending', 'no future date');
  t.acts['fv-visa-submit'](form({ task: id, seq: String(a.seq), reference: 'R-1', submittedOn: '2026-10-28' }));
  assert.equal(a.state, 'docs_pending', 'how it comes back must be chosen');
  assert.match(t.render(id, 'work'), /value="R-1"/, 'typed values stay after a refusal');
  t.acts['fv-visa-submit'](form({ task: id, seq: String(a.seq), reference: 'R-1', submittedOn: '2026-10-28', returnMode: 'unknown' }));
  assert.equal(a.state, 'submitted'); assert.equal(a.submittedAt, '2026-10-28'); assert.equal(a.reference, 'R-1'); assert.equal(a.returnMode, 'unknown');
  assert.match(strip(t.render(id, 'work')), /Applied date.*28 Oct 2026.*Not known yet/, 'the applied date shows in the passenger table');
  t.acts['vw-return-save'](form({ task: id, seq: String(a.seq), returnMode: 'courier', returnNote: 'Blue Dart 8841' }));
  assert.equal(a.returnMode, 'courier'); assert.equal(a.returnNote, 'Blue Dart 8841');
  assert.match(strip(t.render(id, 'work')), /Comes back: By courier \(Blue Dart 8841\)/);
  assert.ok(t.D.taskHistory[id].some((h) => /Return details updated/.test(h.title)));
  t.acts['vw-return-save'](form({ task: id, seq: String(a.seq), returnMode: 'pigeon' }));
  assert.equal(a.returnMode, 'courier', 'an unknown method is refused');
  assert.equal(boot('visa', t.store).D.services[id].applicants[0].returnNote, 'Blue Dart 8841', 'it survives a refresh');
  const mgrR = boot('manager', t.store); mgrR.acts['vw-return-save'](form({ task: id, seq: String(a.seq), returnMode: 'email' }));
  assert.equal(mgrR.D.services[id].applicants[0].returnMode, 'courier', 'the Manager stays read-only');
  assert.equal(t.VF.planOf(s, a), null, 'plan and actual are separate fields');
  t.acts['fv-visa-state'](form({ task: id, seq: String(a.seq), state: 'decision_pending' }));
  t.acts['fv-upload'](form({ task: id, seq: String(a.seq), kind: 'authority_outcome', formKey: 'k' }, { any: { name: 'visa.pdf', size: 2048 } }));
  const file = t.D.departmentFiles.find((f) => f.task === id && f.kind === 'authority_outcome');
  assert.equal(file.metaOnly, true); assert.ok(t.toasts.some((x) => /Only the file name and size/.test(x.text)));
  t.acts['fv-visa-outcome'](form({ task: id, seq: String(a.seq), state: 'issued' }));
  assert.equal(a.state, 'decision_pending', 'needs the authority document');
  t.acts['fv-visa-outcome'](form({ task: id, seq: String(a.seq), state: 'issued', evidence: file.id }));
  t.acts['fv-visa-state'](form({ task: id, seq: String(a.seq), state: 'documents_returned' }));
  assert.equal(a.state, 'issued'); assert.ok(a.documentsReturnedAt);
  assert.equal(s.taskStatus, 'in_progress', 'one closed passenger does not finish the task');
  [b, c].forEach((x) => { t.acts['fv-visa-state'](form({ task: id, seq: String(x.seq), state: 'withdrawn' })); t.acts['fv-visa-state'](form({ task: id, seq: String(x.seq), state: 'customer_informed' })); });
  assert.equal(s.taskStatus, 'done');
  assert.doesNotMatch(t.render(id, 'work'), /Save application plan/);
  const seeded = t.D.services['s-390-v'];
  const page = strip(t.render('s-390-v', 'work'));
  ['Suresh Bhandari', 'Issued', 'Waiting for decision', 'Visa lines for the invoice'].forEach((w) => assert.ok(page.includes(w), w));
  assert.equal(seeded.applicants[0].state, 'issued');
  const closedCard = strip(t.render('s-301-v', 'work'));
  assert.match(closedCard, /Documents \(3 of 3 checked\) Received \(3\) Not received \(0\) 3 of 3 received Document Received Passport copy \(front and back\) Received: Passport copy \(front and back\) Photo, white background Received: Photo, white background Bank statement \(6 months\) Received: Bank statement \(6 months\)/, 'the document rows show on the card');
  assert.match(closedCard, /Reference SG-EV-26-3381904 · 8 Oct 2026/);
  assert.match(closedCard, /Applied date: 8 Oct 2026 Documents/, 'the applied date has its own line on the card');
  assert.match(strip(t.render('s-390-v', 'work')), /Applied date: 20 Oct 2026/);
  assert.match(closedCard, /This applicant is closed\./);
  ['>Progress<', 'Passengers and documents', 'Planned application date', 'Task summary', 'Application, decision and handover'].forEach((w) => assert.ok(!t.render('s-301-v', 'work').includes(w), `no ${w} once everyone has applied`));
  assert.match(closedCard, /Fees and costs.*Visa lines for the invoice/);
  assert.equal((t.render('s-301-v', 'work').match(/type="checkbox"[^>]*checked=""[^>]*disabled=""/g) || []).length, 6, 'each received document on the card is a ticked box');
  take(t, 's-612-v2');
  const pending = t.D.services['s-612-v2'].applicants[0];
  const firstDoc = pending.documents[0].code;
  assert.doesNotMatch(t.render('s-612-v2', 'work'), /id="doc-s-612-v2-1-/, 'no box until a document is received');
  assert.match(strip(t.render('s-612-v2', 'work')), /Applied date: Not applied yet/);
  assert.match(strip(t.render('s-612-v2', 'work')), /Received \(0\) Not received \(3\) Upload document for [A-Za-z ]+ Add document View checklist for [A-Za-z ]+ 0 of 3 received Document Not received Action Passport copy \(front and back\) Not received Mark received/);
  t.acts['vw-chk-save'](form({ task: 's-612-v2', seq: String(pending.seq), [`rec-${firstDoc}`]: '1' }));
  assert.doesNotMatch(t.render('s-612-v2', 'work'), /id="doc-s-612-v2-1-/, 'the Not received list has no boxes');
  t.acts['vw-doc-tab']({ dataset: { id: 's-612-v2-1', tab: 'received' } });
  assert.equal((t.render('s-612-v2', 'work').match(/id="doc-s-612-v2-1-/g) || []).length, 1, 'the Received list shows the received document with its box');
  t.acts['vw-doc-tab']({ dataset: { id: 's-612-v2-1', tab: 'missing' } });
  const second = pending.documents[1];
  t.acts['vw-doc-received']({ dataset: { id: 's-612-v2', seq: String(pending.seq), code: second.code } });
  assert.equal(second.status, 'received', 'Mark received moves it across');
  assert.match(strip(t.render('s-612-v2', 'work')), /Received \(2\) Not received \(1\)/);
  const before = pending.documents.length;
  t.acts['vw-doc-add'](form({ task: 's-612-v2', seq: String(pending.seq), label: '  ' }));
  assert.equal(pending.documents.length, before, 'a name is required');
  t.acts['vw-doc-add'](form({ task: 's-612-v2', seq: String(pending.seq), label: 'Marriage certificate' }));
  const added = pending.documents[before];
  assert.equal(added.label, 'Marriage certificate'); assert.equal(added.status, 'missing'); assert.equal(added.added.byName, 'Farhan Ali');
  assert.ok(t.D.taskHistory['s-612-v2'].some((h) => /Document added for/.test(h.title)));
  t.acts['vw-doc-add'](form({ task: 's-612-v2', seq: String(pending.seq), label: 'marriage  CERTIFICATE' }));
  assert.equal(pending.documents.length, before + 1, 'no duplicate document');
  t.acts['vw-doc-add'](form({ task: 's-612-v2', seq: String(pending.seq), label: 'Old passport', received: '1' }));
  assert.equal(pending.documents[before + 1].status, 'received');
  assert.equal(boot('visa', t.store).D.services['s-612-v2'].applicants[0].documents.length, before + 2, 'added documents survive a refresh');
  const viewer = boot('manager', t.store); const vDocs = viewer.D.services['s-612-v2'].applicants[0];
  viewer.acts['vw-doc-add'](form({ task: 's-612-v2', seq: String(vDocs.seq), label: 'Blocked' }));
  viewer.acts['vw-doc-received']({ dataset: { id: 's-612-v2', seq: String(vDocs.seq), code: added.code } });
  assert.equal(vDocs.documents.length, before + 2); assert.equal(vDocs.documents[before].status, 'missing', 'the Manager cannot add or mark');
  assert.doesNotMatch(viewer.render('s-612-v2', 'work'), /Add document|Mark received/);
  assert.doesNotMatch(closedCard, /View checklist/, 'the closed card matches the owner\'s screenshot');
  take(t, 's-612-v1');
  assert.match(strip(t.render('s-612-v1', 'work')), /Progress.*Passengers and documents/, 'a task with someone still to apply keeps the workflow');
  assert.doesNotMatch(t.render('s-301-v', 'work'), /<details class="[^"]*" data-slot="card"/, 'the applicant card is not collapsed');
  t.acts['vw-checklist']({ dataset: { id: 's-301-v', seq: '1' } });
  const locked = t.notes.drawer.body;
  assert.equal((locked.match(/type="checkbox"/g) || []).length, 6, 'a locked checklist still shows Received and Verified boxes');
  assert.equal((locked.match(/checked="" disabled=""/g) || []).length, 6, 'ticked and locked');
  assert.match(strip(locked), /already submitted, so the checklist is locked/);
  assert.doesNotMatch(t.notes.drawer.footer, /Save checklist/);
  const f = boot('flight');
  f.acts['fv-take'](form({ task: 's-455-f' }));
  assert.equal(f.D.services['s-455-f'].assignee, 'flight');
  assert.ok(!f.store.size, 'Flight stores nothing in the Visa namespace');
  ['details', 'work', 'files', 'history'].forEach((tab) => f.pages.get('/app/flight/:taskId').render({ taskId: 's-412-f' }, { tab }));
  f.pages.get('/app/flight').render({}, {});
  console.log('PASS 12: reference, actual date, outcome document, handover and task completion still work; the sample tasks and Flight are unchanged.');
}
/* 13. Embassy status: one passenger at a time, separate from the appointment, the visa result and the task. */
{
  const t = boot(); take(t, 's-612-v1');
  const s = t.D.services['s-612-v1']; const [a, b] = s.applicants;
  const stateBefore = a.state; const taskBefore = s.taskStatus;
  assert.match(strip(t.render('s-612-v1', 'work')), /Embassy submission Action/, 'the Appointment table has the Embassy column');
  assert.match(strip(t.render('s-612-v1', 'work')), /Edit embassy status for/);
  t.acts['vw-emb-open']({ dataset: { id: 's-612-v1', seq: String(a.seq) } });
  assert.match(t.notes.drawer.body, /data-act="vw-emb-save"/);
  t.acts['vw-emb-save'](form({ task: 's-612-v1', seq: String(a.seq), status: 'submitted', date: '', reference: 'REF-1' }));
  assert.equal(((s.workflow || {}).embassy || {})[a.paxId], undefined, 'a submission needs a date');
  assert.match(strip(t.notes.drawer.body), /Enter the date the application was submitted/);
  assert.match(t.notes.drawer.body, /value="REF-1"/, 'typed values stay after a refusal');
  t.acts['vw-emb-save'](form({ task: 's-612-v1', seq: String(a.seq), status: 'submitted', date: '2099-01-01' }));
  assert.equal(((s.workflow || {}).embassy || {})[a.paxId], undefined, 'no future date');
  const day = t.VF.todayIST();
  t.acts['vw-emb-save'](form({ task: 's-612-v1', seq: String(a.seq), status: 'submitted', date: day, reference: 'REF-1' }));
  assert.equal(s.workflow.embassy[a.paxId].status, 'submitted');
  assert.equal(s.workflow.embassy[b.paxId], undefined, 'the other passenger is untouched');
  assert.equal(a.state, stateBefore, 'the application state does not move'); assert.equal(s.taskStatus, taskBefore, 'the task does not move');
  assert.ok(t.D.taskHistory['s-612-v1'].some((h) => /Embassy submission/.test(h.title)), 'History has the entry');
  const later = boot('visa', t.store);
  assert.equal(later.D.services['s-612-v1'].workflow.embassy[a.paxId].reference, 'REF-1', 'embassy status survives a refresh');
  const mgr = boot('manager', t.store);
  assert.match(strip(mgr.render('s-612-v1', 'work')), /View embassy status for/);
  assert.doesNotMatch(strip(mgr.render('s-612-v1', 'work')), /Edit embassy status/);
  mgr.acts['vw-emb-open']({ dataset: { id: 's-612-v1', seq: String(b.seq) } });
  assert.doesNotMatch(mgr.notes.drawer.body, /data-act="vw-emb-save"/, 'the Manager only reads');
  mgr.acts['vw-emb-save'](form({ task: 's-612-v1', seq: String(b.seq), status: 'submitted', date: day }));
  assert.equal(mgr.D.services['s-612-v1'].workflow.embassy[b.paxId], undefined, 'the action itself refuses the Manager');
  console.log('PASS 13: embassy status saves per passenger, needs a past date, keeps typed values, leaves the visa and task alone, survives a refresh and refuses the Manager.');
}

/* 14. Upload document: names the file, marks a not-received document received, never verified. */
{
  const t = boot(); take(t, 's-612-v1');
  const s = t.D.services['s-612-v1']; const a = s.applicants[0];
  const d = a.documents.find((x) => x.status === 'missing') || a.documents[0];
  d.status = 'missing';
  const files = () => t.D.departmentFiles.filter((f) => f.task === 's-612-v1' && f.kind === 'applicant_document');
  const count = files().length;
  const pdf = { any: { name: 'scan.pdf', size: 2048 } };
  t.acts['vw-doc-upload-open']({ dataset: { id: 's-612-v1', seq: String(a.seq), code: d.code } });
  assert.match(t.notes.drawer.body, /Other document \(not on the list\)/);
  t.acts['vw-doc-upload'](form({ task: 's-612-v1', seq: String(a.seq), code: d.code, title: 'Passport Devendra' }));
  assert.equal(files().length, count, 'no file, nothing saved'); assert.equal(d.status, 'missing');
  assert.match(t.notes.drawer.body, /value="Passport Devendra"/, 'the typed name stays after a refusal');
  t.acts['vw-doc-upload'](form({ task: 's-612-v1', seq: String(a.seq), code: d.code, title: 'Passport Devendra' }, { any: { name: 'scan.exe', size: 10 } }));
  assert.equal(files().length, count, 'a wrong file type is refused');
  t.acts['vw-doc-upload'](form({ task: 's-612-v1', seq: String(a.seq), code: d.code, title: 'Passport Devendra' }, pdf));
  assert.equal(files().length, count + 1); assert.equal(d.status, 'received', 'uploading marks it received, not verified');
  assert.equal(files().at(-1).title, 'Passport Devendra'); assert.equal(files().at(-1).doc, d.code);
  assert.equal(files().at(-1).metaOnly, true, 'only the file details are kept');
  assert.match(strip(t.render('s-612-v1', 'files')), /Passport Devendra \(scan\.pdf\)/, 'the Files tab shows the name given');
  const docs = a.documents.length;
  t.acts['vw-doc-upload'](form({ task: 's-612-v1', seq: String(a.seq), code: '__new', title: 'Marriage certificate' }, pdf));
  assert.equal(a.documents.length, docs + 1, 'Other document joins the list'); assert.equal(a.documents[docs].status, 'received');
  const later = boot('visa', t.store);
  assert.equal(later.D.departmentFiles.filter((f) => f.task === 's-612-v1' && f.title === 'Passport Devendra').length, 1, 'the name survives a refresh');
  assert.doesNotMatch(boot('manager', t.store).render('s-612-v1', 'work'), /vw-doc-upload-open/, 'the Manager has no upload button');
  const closed = boot(); closed.acts['vw-doc-upload'](form({ task: 's-301-v', seq: '1', code: closed.D.services['s-301-v'].applicants[0].documents[0].code, title: 'Late' }, pdf));
  assert.ok(!closed.D.departmentFiles.some((f) => f.title === 'Late'), 'a closed passenger takes no upload');
  console.log('PASS 14: upload needs a name and a PDF, JPG or PNG, marks received but not verified, can add an Other document, survives a refresh and is refused for the Manager and closed passengers.');
}
console.log('\nAll Visa workflow checks passed.');
