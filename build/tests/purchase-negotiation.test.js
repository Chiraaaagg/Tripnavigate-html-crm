// Run: node build/tests/purchase-negotiation.test.js   (no dependencies)
// Loads the real data, core, UI helpers and Purchase files in a small fake browser,
// then checks the Purchase task page the owner reviewed on 1 Nov 2026:
// Sales' breakup, the one-step rate negotiation log, simple e-mails marked as sent,
// the go-ahead / budget / own-approval / locked rules, and the money fence.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');

const FILES = ['00-data-base.js', '10-core.js', '11-ui.js', '39-purchase-breakups.js', '40-purchase.js'];
function boot(role = 'purchase', store = new Map()) {
  const pages = new Map(), acts = {}, toasts = [], notes = { drawer: null, dialog: null };
  const c = {
    console, URLSearchParams, URL, Intl, Date, Math, JSON, Object, Array, String, Number, Set, Map, Promise, RegExp, Error,
    setTimeout: () => 1, clearTimeout: () => {},
    location: { search: `?role=${role}`, hash: '#/app/purchase' },
    history: { replaceState: () => {} },
    document: { addEventListener: () => {}, getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], documentElement: { style: {} } },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) },
    FormData: class { constructor(el) { this.d = el.data || {}; } get(k) { return this.d[k] == null ? null : this.d[k]; } },
  };
  c.window = c; c.addEventListener = () => {}; c.scrollTo = () => {};
  vm.createContext(c);
  const load = (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), c, { filename: file });
  load(FILES[0]); load(FILES[1]); load(FILES[2]);
  const TN = c.TN;
  TN.render = () => {}; // no DOM: actions still change data and persist
  const page = TN.page; TN.page = (route, def) => { pages.set(route, def); page(route, def); };
  const act = TN.act; TN.act = (name, fn) => { acts[name] = fn; act(name, fn); };
  TN.toast = (text, tone) => { toasts.push({ text: typeof text === 'object' ? text.title : text, tone }); return toasts.length; };
  TN.drawer = (o) => { notes.drawer = o; }; TN.dialog = (o) => { notes.dialog = o; };
  load(FILES[3]); load(FILES[4]);
  const task = (id, tab) => pages.get('/app/purchase/:taskId').render({ taskId: id }, tab ? { tab } : {});
  return { c, TN, D: TN.DATA, P: TN.purchase, acts, toasts, notes, store, task, pages };
}
/** A fake form: FormData reads .data; a refusal lands in .error. */
function form(dataset, data = {}, file = null) {
  return { dataset, data, error: '', querySelector(sel) { if (sel === 'input[type=file]') return { files: file ? [file] : [] }; return null; }, insertAdjacentHTML(_, html) { this.error = html; }, closest: () => null };
}
const strip = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const inr = (n) => '₹' + new Intl.NumberFormat('en-IN').format(n) + '.00';

/* 1. Sales' breakup: every hotel line adds up to its budget; extra beds; a package without one. */
let t = boot();
const hotels = Object.entries(t.D.services).filter(([, s]) => s.dept === 'purchase' && (s.kind === 'hotel' || s.kind === 'package'));
for (const [id, s] of hotels) {
  const b = t.TN.hotelBreakup(id);
  if (id === 's-301-p') { assert.equal(b, null); continue; }
  assert.ok(b, `breakup for ${id}`);
  assert.equal(b.total, s.budget, `breakup total equals budget for ${id}`);
}
const sg = t.TN.hotelBreakup('s-547-h');
assert.equal(sg.rooms, 9); assert.equal(sg.nights, 2); assert.equal(sg.total, 236000);
assert.ok(t.TN.hotelBreakup('s-198-h1').rows.some((r) => r.kind === 'extra'));
assert.ok(t.TN.hotelBreakup('s-390-h').rows.some((r) => r.kind === 'extra'));
console.log('PASS: every hotel breakup equals its budget (Suryagarh 8 + 1 rooms × 2 nights = ₹2,36,000; extra beds on s-198-h1 and s-390-h; package has none).');

/* 2. Details tab: renamed card with the full breakup, special request highlighted, no Hand-offs. */
let html = t.task('s-547-h');
assert.match(html, /What Sales booked for this hotel/);
for (const text of ['Deluxe twin room', 'Suite, twin sharing', inr(13000), inr(208000), inr(236000), 'Special request', 'All meals', 'Conference hall half day']) assert.ok(strip(html).includes(text), text);
assert.doesNotMatch(html, /Hand-offs|Travellers and budget|Required inclusion/);
assert.match(html, /data-tone="warning"[^>]*>.*Special request/s);
assert.match(strip(t.task('s-301-p')), /Sales did not give a room breakup/);
console.log('PASS: Details shows “What Sales booked for this hotel” with lines, totals and a warning-tone special request; Hand-offs removed; package falls back.');

/* 3. Work tab: breakup + special request in the summary; one negotiation card; no checklist, no old records. */
html = t.task('s-547-h', 'work');
assert.match(html, /Rate negotiation/); assert.match(html, /Add to log/); assert.match(html, /fin-segment/);
assert.match(html, /Hotel quoted/); assert.match(html, /We offered/); assert.match(html, /Final agreed/);
assert.match(html, /Record supplier confirmation/);
assert.ok(strip(html).includes(inr(13000)) && /Special request/.test(html));
for (const gone of [/Before you book/, /Rates &amp; Booking Records/, /Rate Request Status/, /Booking Request Status/, /vs Budget/, /Edit rate/, /View History/, /Manual sent-email/, /Message-ID/, /Cost history/, /Supplier offers, cost and confirmation/]) assert.doesNotMatch(html, gone);
assert.match(strip(html), /₹8,000 under budget/);
console.log('PASS: Work tab has the breakup, the special request, one Rate negotiation card (summary, segmented form, log) and Record supplier confirmation; old cards are gone.');

/* 4. E-mails: Deal ID in the subject, no selling price, Sales' rates never sent to the hotel. */
const s547 = t.D.services['s-547-h'];
const rate = t.P.mailTemplate('rate', 's-547-h', s547, 'sp-suryagarh');
const book = t.P.mailTemplate('booking', 's-547-h', s547, 'sp-suryagarh');
assert.equal(rate.subject, 'Rate request · BX-38547 · Suryagarh Jaisalmer · 6–8 Nov 2026');
assert.equal(book.subject, 'Booking request · BX-38547 · Suryagarh Jaisalmer · 6–8 Nov 2026');
assert.equal(rate.to, 'groups@suryagarh.example');
for (const msg of [rate, book]) { assert.doesNotMatch(msg.body, /3,42,000|342000/); assert.doesNotMatch(msg.body, /13,000|14,000|2,36,000/); }
assert.match(rate.body, /8 × Deluxe twin room, 1 × Suite, twin sharing/);
assert.match(book.body, /agreed price of ₹2,28,000\.00/);
console.log('PASS: rate and booking e-mail subjects carry the Deal ID; no selling price or Sales budget rates in any e-mail.');

/* 5. Mark as sent: one click records the e-mail in the log and in History (time + person). */
const before = t.P.work('s-547-h').emails.length;
let f = form({ id: 's-547-h', kind: 'rate' }, { supplierId: 'sp-suryagarh', to: 'groups@suryagarh.example', subject: rate.subject, body: rate.body });
t.acts['pur-mail-sent'](f);
assert.equal(f.error, '');
assert.equal(t.P.work('s-547-h').emails.length, before + 1);
const last = t.P.work('s-547-h').history.at(-1);
assert.match(last.text, /Rate request e-mailed to Suryagarh Jaisalmer \(marked as sent\)/); assert.equal(last.by, 'purchase'); assert.match(last.at, /^\d{4}-\d\d-\d\d \d\d:\d\d$/);
assert.equal(t.P.log('s-547-h')[0].kind, 'mail');
f = form({ id: 's-547-h', kind: 'rate' }, { supplierId: 'sp-suryagarh', to: 'not-an-email', subject: 'x', body: 'y' });
t.acts['pur-mail-sent'](f); assert.match(f.error, /e-mail address/);
console.log('PASS: Mark as sent adds the e-mail to the log and History with time and person; a bad address is refused in place.');

/* 6. Add to log: append-only, per-night fills the total, History has no amounts, refusals keep the rules. */
const ratesBefore = t.P.rates('s-547-h').length;
f = form({ id: 's-547-h' }, { kind: 'quoted', supplierId: 'sp-suryagarh', amountRupees: '', perNight: '12,800', note: 'After the call' });
t.acts['pur-log-add'](f);
assert.equal(f.error, '');
const added = t.P.rates('s-547-h').at(-1);
assert.equal(t.P.rates('s-547-h').length, ratesBefore + 1);
assert.equal(added.amount, 12800 * 9 * 2); assert.equal(added.perNight, 12800);
assert.ok(Object.isFrozen(t.P.work('s-547-h').offers.flatMap((o) => o.rates || []).find((r) => r.id === added.id))); // stored entries can't be edited
assert.doesNotMatch(t.P.work('s-547-h').history.at(-1).text, /₹|\d{2},\d{3}/);
f = form({ id: 's-547-h' }, { kind: 'quoted', supplierId: 'sp-suryagarh', amountRupees: '2,40,000', perNight: '12,800' });
t.acts['pur-log-add'](f); assert.match(f.error, /does not match/);
f = form({ id: 's-547-h' }, { kind: 'offered', supplierId: 'sp-suryagarh', amountRupees: '0' });
t.acts['pur-log-add'](f); assert.match(f.error, /Enter the amount/);
f = form({ id: 's-547-h' }, { kind: 'agreed', supplierId: 'sp-suryagarh', amountRupees: '2,20,000', note: 'Lower' });
t.acts['pur-log-add'](f); assert.match(f.error, /SP-26-0022/); // a payment request exists against the agreed price
assert.equal(t.P.latestCost('s-547-h').amount, 228000);
console.log('PASS: log entries are appended and frozen, per-night fills the total, History has no amounts, mismatches and changes after a payment request are refused.');

/* 7. Final agreed sets the cost everywhere; above budget waits for the Manager; nobody approves their own price. */
const w455 = t.P.work('s-455-h1');
const v1 = w455.costs.at(-1);
f = form({ id: 's-455-h1' }, { kind: 'agreed', supplierId: 'sp-blanket', amountRupees: '33,500' });
t.acts['pur-log-add'](f); assert.match(f.error, /why it changed/);
f = form({ id: 's-455-h1' }, { kind: 'agreed', supplierId: 'sp-blanket', amountRupees: '33,500', note: 'Valley view room' });
t.acts['pur-log-add'](f); assert.equal(f.error, '');
assert.equal(w455.costs.length, 2); assert.equal(w455.costs[0], v1); assert.equal(w455.costs[0].amount, 30800);
assert.equal(t.P.latestCost('s-455-h1').amount, 33500); assert.equal(t.D.services['s-455-h1'].cost, 33500);
assert.ok(t.P.issues('s-455-h1').includes('over_budget'));
assert.match(t.P.blockReason('s-455-h1', 'booking'), /go-ahead/); // the Accounts go-ahead is the first gate
t.D.services['s-455-h1'].goAhead = 'given';
assert.match(t.P.blockReason('s-455-h1', 'booking'), /Branch Manager/);
f = form({ id: 's-455-h1', kind: 'booking' }, { supplierId: 'sp-blanket', to: 'a@b.example', subject: 's', body: 'b' });
t.acts['pur-mail-sent'](f); assert.match(f.error, /Branch Manager/);
t.P.persist();
const m = boot('manager', t.store);
const v2 = m.P.latestCost('s-455-h1').v;
m.P.work('s-455-h1').costs.at(-1).by = 'manager';
f = form({ id: 's-455-h1', v: String(v2) }); m.acts['pur-approve-cost'](f); assert.match(f.error, /different person must approve/);
m.P.work('s-455-h1').costs.at(-1).by = 'purchase';
f = form({ id: 's-455-h1', v: String(v2) }); m.acts['pur-approve-cost'](f); assert.equal(f.error, '');
assert.ok(m.P.work('s-455-h1').approvals[v2]);
assert.match(m.P.blockReason('s-455-h1', 'booking'), /works on this task/); // the Manager approves but never books
assert.ok(m.P.log('s-455-h1').some((e) => e.kind === 'approved'));
console.log('PASS: Final agreed adds a new cost version (old one untouched), above budget waits for the Manager, the Manager cannot approve their own price, approval is logged.');

/* 8. Go-ahead gate and the confirmation lock. */
t = boot('purchase', m.store);
assert.equal(t.P.blockReason('s-455-h1', 'booking'), '');
t.D.services['s-455-h1'].goAhead = 'waiting';
f = form({ id: 's-455-h1' }, { hotelReference: 'BH-1', hotelConfirmedBy: 'Front desk', hotelPhone: '+91 4865 231 071' }, { name: 'c.pdf', size: 1000 });
t.acts['pur-confirm'](f); assert.match(f.error, /go-ahead/);
t.D.services['s-455-h1'].goAhead = 'given';
f = form({ id: 's-455-h1' }, { hotelReference: 'BH-1', hotelConfirmedBy: 'Front desk', hotelPhone: '+91 4865 231 071' });
t.acts['pur-confirm'](f); assert.match(f.error, /Attach the confirmation e-mail/);
f = form({ id: 's-455-h1' }, { hotelReference: 'BH-1', hotelConfirmedBy: 'Front desk', hotelPhone: '+91 4865 231 071' }, { name: 'blanket-confirmation.pdf', size: 2048 });
t.acts['pur-confirm'](f); assert.equal(f.error, '');
assert.equal(t.D.services['s-455-h1'].taskStatus, 'supplier_confirmed');
assert.deepEqual(Array.from(t.P.work('s-455-h1').costs, (x) => x.stage), ['proposed', 'proposed', 'committed']);
assert.ok(t.P.work('s-455-h1').approvals[t.P.latestCost('s-455-h1').v]); // the approval carries to the locked version
f = form({ id: 's-455-h1' }, { kind: 'quoted', supplierId: 'sp-blanket', amountRupees: '30,000' });
t.acts['pur-log-add'](f); assert.match(f.error, /already confirmed/);
assert.match(t.P.log('s-455-h1')[0].title, /price locked/);
console.log('PASS: no booking or confirmation without the Accounts go-ahead; confirmation needs the e-mail; confirming locks the price and the log.');

/* 9. Money fence: no selling price on any Purchase task tab, for Purchase or the Manager; Sales sees Details and History only. */
for (const role of ['purchase', 'manager']) {
  const b = boot(role);
  for (const [id, s] of Object.entries(b.D.services)) {
    if (s.dept !== 'purchase') continue;
    const deal = b.TN.deal(s.deal);
    const all = ['details', 'work', 'files', 'history'].map((tab) => b.task(id, tab)).join('');
    if (deal.sellingPrice) assert.ok(!strip(all).includes(inr(deal.sellingPrice)), `${role} ${id} shows no selling price`);
  }
}
const sales = boot('sales');
html = sales.task('s-547-h', 'work');
assert.doesNotMatch(html, /Rate negotiation|Purchase files|tab=work"/); assert.match(html, /What Sales booked/);
console.log('PASS: no selling price on any Purchase task tab for Purchase or the Manager; Sales gets Details and History only.');

/* 10. Saved in this browser: a reload keeps the log. */
const kept = boot('purchase', t.store);
assert.equal(kept.D.services['s-455-h1'].taskStatus, 'supplier_confirmed');
assert.ok(kept.P.log('s-547-h').some((e) => e.kind === 'mail' && /e-mailed/.test(e.title)));
console.log('PASS: a reload keeps the negotiation log, e-mails and the confirmation.');
