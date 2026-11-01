// Run: node build/tests/purchase-booking.test.js (no dependencies).
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict'), path = require('node:path');
const { setup, memory, form: rateForm } = require('./purchase-negotiation.test.js');
const source = fs.readFileSync(path.join(__dirname, '../src/41-purchase-booking.js'), 'utf8');
const purchaseSource = fs.readFileSync(path.join(__dirname, '../src/40-purchase.js'), 'utf8');
function attach(c) {
  c.TN.esc = c.esc; c.window = c; c.handlers = {}; c.TN.DATA = c.D; c.TN.act = (name, fn) => c.handlers[name] = fn;
  c.TN.service = (id) => c.D.services[id]; c.TN.roleDef = () => ({ person: 'purchase' });
  c.TN.is = (role) => role === (c.role || 'purchase'); c.TN.fmt = { inr: (n) => `INR ${n}` };
  c.TN.drawer = (value) => c.drawer = value; c.TN.dialog = (value) => c.dialog = value; c.TN.closeOverlay = () => {};
  c.document = { querySelectorAll: () => [], getElementById: () => ({ focus() {} }) };
  c.navigator = { clipboard: { writeText: async (message) => c.copied = message } };
  c.FileReader = class { readAsDataURL() { Promise.resolve().then(() => { this.result = 'data:application/pdf;base64,JVBERi0='; this.onload(); }); } };
  c.TN.deal = () => ({ id: 'd', customer: 'customer', adults: 2 }); c.TN.customer = () => ({ name: 'Lead Guest' }); c.TN.me = () => ({ name: 'Buyer' });
  c.FACTS = { t: [2, 'Deluxe twin room', 'Breakfast', '', 'Late check-in'] };
  c.money = c.TN.fmt.inr; c.date = (v) => v; c.nights = () => 2; c.plural = (n, label) => `${n} ${label}s`; c.travellers = () => '2 adults';
  vm.runInContext(purchaseSource.slice(purchaseSource.indexOf('  function mailTemplate'), purchaseSource.indexOf("  TN.act('pur-mail'")), c);
  c.TN.purchase = {
    work: (id) => c.W[id], rates: c.records, rows: c.rows, latestCost: c.latestCost, persist: c.persist,
    canWork: (s) => c.allowed && c.TN.is('purchase') && s.assignee === 'purchase' && !c.isConfirmed(s),
    workCostIssue: c.workCostIssue, needsGoAhead: (s) => s.goAhead != null && s.goAhead !== 'given',
    mailTemplate: (...args) => vm.runInContext('mailTemplate', c)(...args)
  };
  vm.runInContext(source, c);
  return c;
}
function form(data, dataset, fileName, file) {
  const alert = { textContent: '', focus() {} };
  return { id: 'test-form', data, dataset: { id: 't', ...dataset }, alert,
    querySelector: (selector) => selector === '[data-booking-error]' ? alert : selector === `[name="${fileName}"]` ? { files: file ? [file] : [] } : null };
}
const event = (mode) => ({ submitter: { dataset: { mode } } });
function requestForm(c, status = 'draft', file) {
  const row = c.rows('t')[0];
  return form({ to: 'hotel@example.com', from: 'buyer@example.com', subject: 'Booking', body: 'Please confirm the agreed booking.',
    sentAt: '2026-01-01T12:00', manualReference: 'Sent mailbox / ref-123', messageId: '<mail@example.com>', sentAttested: status === 'manual' ? 'yes' : '' },
  { rate: row.id, costVersion: String(c.latestCost('t').v), request: c.W.t.bookingRequests?.at(-1)?.id || '' }, 'attachment', file);
}
async function main() {
  memory.clear(); let c = attach(setup());
  Object.assign(c.D.services.t, { start: '2026-11-01', end: '2026-11-03', goAhead: 'waiting' });
  c.D.suppliers.h.email = 'hotel@example.com';
  c.action(rateForm('hotel_said', '110'));
  assert.match(c.TN.purchaseBooking.eligibility('t', c.rows('t')[0].id).reason, /final agreed/);
  let edit = rateForm('final_agreed', '105'); edit.dataset.parentRate = c.records('t')[0].id; c.action(edit);
  const root = c.rows('t')[0].rootId;
  assert.match(c.TN.purchaseBooking.eligibility('t', c.rows('t')[0].id).reason, /Manager approval/);
  assert.match(c.TN.purchaseBooking.cells('t', c.rows('t')[0]).action, /disabled/);
  c.W.t.approvals[c.latestCost('t').v] = { by: 'manager' };
  assert.match(c.TN.purchaseBooking.eligibility('t', c.rows('t')[0].id).reason, /Accounts/);
  c.D.services.t.goAhead = 'given';
  assert.equal(c.TN.purchaseBooking.eligibility('t', c.rows('t')[0].id).reason, '');
  c.role = 'accounts'; assert.ok(c.TN.purchaseBooking.eligibility('t', c.rows('t')[0].id).reason); c.role = 'purchase';
  c.handlers['pur-booking-request']({ dataset: { id: 't', rate: c.rows('t')[0].id } });
  assert.match(c.drawer.body, /hotel@example.com/); assert.match(c.drawer.body, /No email service is connected/);
  for (const text of ['Deluxe twin room', 'Breakfast', 'Late check-in', '2 adults', '2026-11-01', 'INR 105', 'Purchase task: t']) assert.ok(c.drawer.body.includes(text), text);
  assert.match(c.drawer.body, /textarea id="bk-body"/);
  // Save draft does not send email or advance confirmation or create a cost.
  const costsBefore = c.W.t.costs.length;
  await c.handlers['pur-booking-save-request'](requestForm(c), event('draft'));
  assert.equal(c.W.t.bookingRequests.length, 1); assert.equal(c.W.t.bookingRequests[0].status, 'draft');
  assert.equal(c.W.t.emails.at(-1).status, 'draft'); assert.equal(c.W.t.costs.length, costsBefore);
  assert.equal(c.progress('t', c.D.services.t, c.W.t)[3].done, false);
  const persist = c.TN.purchase.persist;
  c.TN.purchase.persist = () => { throw Error('Storage quota exceeded'); };
  let failed = requestForm(c); await c.handlers['pur-booking-save-request'](failed, event('manual'));
  // Without attestation, this is rejected before any storage mutation.
  assert.equal(c.W.t.bookingRequests[0].status, 'draft');
  failed = requestForm(c, 'manual'); await c.handlers['pur-booking-save-request'](failed, event('manual'));
  assert.match(failed.alert.textContent, /quota/); assert.equal(c.W.t.bookingRequests[0].status, 'draft'); assert.equal(c.W.t.emails.length, 1);
  c.TN.purchase.persist = persist;
  // Manual sent recording needs an explicit attestation, timestamp and mailbox reference.
  let f = requestForm(c); await c.handlers['pur-booking-save-request'](f, event('manual')); assert.match(f.alert.textContent, /Confirm that you sent/);
  f = requestForm(c, 'manual'); await Promise.all([c.handlers['pur-booking-save-request'](f, event('manual')), c.handlers['pur-booking-save-request'](f, event('manual'))]);
  assert.equal(c.W.t.bookingRequests.length, 1); assert.equal(c.W.t.bookingRequests[0].status, 'manual_sent');
  assert.equal(c.W.t.bookingRequests[0].providerMessageId, '<mail@example.com>');
  assert.equal(c.W.t.costs.length, costsBefore); assert.equal(c.W.t.emails.length, 2);
  assert.match(c.TN.purchaseBooking.cells('t', c.rows('t')[0]).status, /Waiting for Booking Confirmation/);
  assert.ok(c.notifications.every((message) => !/^E-mail sent|^Email sent/.test(message)));
  c.persist(); c = attach(setup());
  assert.equal(c.W.t.bookingRequests[0].status, 'manual_sent');
  const request = c.W.t.bookingRequests[0];
  const confirmationData = { number: 'HOTEL-123', confirmedAt: '2026-01-01T12:30', confirmedBy: 'Reservations Manager', contact: '+91 9876543210', replyMessageId: '<reply@example.com>' };
  f = form(confirmationData, { request: request.id });
  await c.handlers['pur-booking-save-confirmation'](f, event('confirm'));
  assert.match(f.alert.textContent, /Upload the confirmation/); assert.notEqual(c.D.services.t.taskStatus, 'supplier_confirmed');
  // Proof-only upload keeps booking pending; invalid/oversized files are rejected.
  const pdf = { name: 'hotel-confirmation.pdf', type: 'application/pdf', size: 64 };
  f = form({}, { request: request.id }, 'proof', { ...pdf, size: 5 * 1024 * 1024 });
  await c.handlers['pur-booking-save-confirmation'](f, event('proof')); assert.match(f.alert.textContent, /up to 4 MB/);
  f = form({}, { request: request.id }, 'proof', pdf);
  await c.handlers['pur-booking-save-confirmation'](f, event('proof'));
  assert.ok(c.W.t.files.at(-1).dataUrl); assert.equal(c.TN.purchaseBooking.confirmationComplete('t'), false);
  const proof = c.W.t.files.at(-1);
  f = form({ ...confirmationData, proofId: proof.id }, { request: request.id });
  await Promise.all([c.handlers['pur-booking-save-confirmation'](f, event('confirm')), c.handlers['pur-booking-save-confirmation'](f, event('confirm'))]);
  assert.equal(c.W.t.bookingConfirmations.length, 1); assert.equal(c.W.t.costs.length, costsBefore + 1);
  assert.equal(c.D.services.t.taskStatus, 'supplier_confirmed'); assert.equal(c.TN.purchaseBooking.confirmationComplete('t'), true);
  assert.equal(c.progress('t', c.D.services.t, c.W.t)[3].done, true);
  assert.ok(c.W.t.approvals[c.latestCost('t').v]);
  const cells = c.TN.purchaseBooking.cells('t', c.rows('t')[0]); assert.match(cells.status, /HOTEL-123/); assert.match(cells.proof, /View Confirmation Proof/);
  const html = c.render('t', c.D.services.t, c.W.t, false, null, true); assert.match(html, /Booking Action/); assert.match(html, /Confirmation Proof/); assert.match(html, /HOTEL-123/);
  assert.equal(c.rows('t')[0].rootId, root); assert.equal(c.records('t').length, 2);
  c.handlers['pur-booking-view-proof']({ dataset: { id: 't', proof: proof.id } }); assert.match(c.dialog.body, /application\/pdf/);
  c.persist(); c = attach(setup());
  assert.equal(c.TN.purchaseBooking.confirmationComplete('t'), true); assert.equal(c.progress('t', c.D.services.t, c.W.t)[3].done, true);
  assert.equal(c.W.t.emails.length, 3); assert.equal(c.W.t.bookingRequests[0].status, 'manual_sent');
  // Cross-task proof IDs cannot be used as confirmation evidence.
  c.W.t.files.find((p) => p.id === proof.id).taskId = 'other'; assert.equal(c.TN.purchaseBooking.confirmationComplete('t'), false);
  // An amended final rate makes the original request unusable for confirmation.
  memory.clear(); c = attach(setup()); c.D.services.t.goAhead = 'given';
  c.action(rateForm('hotel_said', '100'));
  edit = rateForm('final_agreed', '90'); edit.dataset.parentRate = c.records('t')[0].id; c.action(edit);
  await c.handlers['pur-booking-save-request'](requestForm(c, 'manual'), event('manual'));
  const oldRequest = c.W.t.bookingRequests[0];
  edit = rateForm('final_agreed', '85', 'Supplier amended the final rate'); edit.dataset.parentRate = c.records('t').at(-1).id; c.action(edit);
  f = form(confirmationData, { request: oldRequest.id }, 'proof', pdf);
  await c.handlers['pur-booking-save-confirmation'](f, event('confirm'));
  assert.match(f.alert.textContent, /changed/); assert.equal(c.W.t.files.length, 0); assert.equal(c.W.t.bookingConfirmations?.length || 0, 0);
  assert.match(c.TN.purchaseBooking.cells('t', c.rows('t')[0]).status, /Ready to request/);
  c.D.supplierPayments.push({ service: 't', supplier: 'h', amount: 40, status: 'requested' });
  const paymentsBefore = JSON.stringify(c.D.supplierPayments), versionsBefore = c.W.t.costs.length;
  edit = rateForm('final_agreed', '80', 'Attempt to amend linked cost'); edit.dataset.parentRate = c.records('t').at(-1).id; c.action(edit);
  assert.equal(c.latestCost('t').amount, 85); assert.equal(c.W.t.costs.length, versionsBefore);
  await c.handlers['pur-booking-save-request'](requestForm(c, 'manual'), event('manual'));
  assert.equal(c.W.t.costs.length, versionsBefore); assert.equal(JSON.stringify(c.D.supplierPayments), paymentsBefore);
  console.log('PASS: all 10 rate-to-booking scenarios, approval gates, real template, draft/manual fallback, duplicate protection, proof upload, confirmation, table/workflow update, refresh persistence and task scoping.');
}
if (require.main === module) main().then(smoke).catch((e) => { console.error(e); process.exitCode = 1; });

function smoke() {
  const pages = new Map(), store = new Map();
  const c = { console, URLSearchParams, URL, Intl, Date, setTimeout: () => 1, clearTimeout: () => {},
    location: { search: '?role=purchase', hash: '#/app/purchase/s-547-h?tab=work' }, document: { addEventListener: () => {} },
    localStorage: { getItem: (k) => store.get(k) || null, setItem: (k, v) => store.set(k, v) } };
  c.window = c; c.addEventListener = () => {}; vm.createContext(c);
  const load = (file) => vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), c, { filename: file });
  ['00-data-base.js', '10-core.js', '11-ui.js'].forEach(load);
  const register = c.TN.page; c.TN.page = (route, def) => { pages.set(route, def); register(route, def); };
  ['40-purchase.js', '41-purchase-booking.js', '42-purchase-records.js'].forEach(load);
  let count = 0;
  for (const [id, service] of Object.entries(c.TN.DATA.services)) {
    if (service.dept !== 'purchase' || service.kind !== 'hotel') continue;
    const html = pages.get('/app/purchase/:taskId').render({ taskId: id }, { tab: 'work' });
    assert.match(html, /Rates &amp; Booking Records/); assert.match(html, /rate-records-grid/); if (c.TN.purchaseRecords.entries(id).length) { assert.match(html, /Rate Request Status/); assert.match(html, /Booking Request Status/); assert.match(html, /vs Budget/); } else assert.match(html, /No records yet/); assert.doesNotMatch(html, /id="work-mails"/); count++;
  }
  console.log('PASS: actual core/data/Purchase modules rendered ' + count + ' hotel Work tabs without runtime errors.');
}

module.exports = { attach, smoke };
