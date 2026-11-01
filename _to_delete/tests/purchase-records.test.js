// Unified records tests. Provider delivery is a TEST DOUBLE, not live email.
const fs = require('node:fs'), vm = require('node:vm'), path = require('node:path'), assert = require('node:assert/strict');
const { setup, memory, form: rateForm } = require('./purchase-negotiation.test.js');
const { attach, smoke } = require('./purchase-booking.test.js');
const source = fs.readFileSync(path.join(__dirname, '../src/42-purchase-records.js'), 'utf8');
function app() {
  const c = attach(setup());
  c.TN.fmt.dateTime = c.dt;
  c.TN.PEOPLE = { purchase: { name: 'Purchase Staff' } };
  c.TN.is = (...roles) => roles.includes(c.role || 'purchase');
  Object.assign(c.TN.purchase, {
    appendRate: vm.runInContext('appendRate', c), hotelKey: vm.runInContext('hotelKey', c), isConfirmed: c.isConfirmed,
    openRate: (el) => c.openRateArgs = el
  });
  vm.runInContext(source, c);
  return c;
}
function form(data, dataset = {}, field, file) {
  const alert = { textContent: '', focus() {} };
  return { id: 'test-record-form', data, dataset: { id: 't', ...dataset }, alert,
    querySelector: (selector) => ['[data-records-error]', '[data-booking-error]'].includes(selector) ? alert : selector === `[name="${field}"]` ? { files: file ? [file] : [] } : null };
}
const event = (mode) => ({ submitter: { dataset: { mode } } });
const inquiry = (extra = {}) => form({ recipientType: 'hotel', supplierId: 'h', to: 'hotel@example.com', cc: 'cc@example.com', from: 'buyer@example.com', subject: 'Rate inquiry', body: 'Rooms, dates, guests and meals.', sentAt: '2026-01-01T10:00', sentAttested: 'yes', manualReference: 'Sent mailbox 123', ...extra });
const pdf = { name: 'hotel-email.pdf', type: 'application/pdf', size: 100 };
async function run() {
  memory.clear(); let c = app();
  assert.equal(c.TN.purchaseRecords.canSend(), false);
  assert.match(c.TN.purchaseRecords.composerExtra(), /No email service is connected/);
  assert.doesNotMatch(c.TN.purchaseRecords.composerFooter(), /data-mode="send"/);
  // No configured transport must never manufacture a sent record.
  let f = inquiry(); await c.handlers['pur-rate-request-save'](f, event('send'));
  assert.match(f.alert.textContent, /No email provider/); assert.equal(c.W.t.rateRequests?.length || 0, 0);
  // Failed provider submission creates no request or outgoing email.
  c.TN.emailTransport = { send: async () => { throw Error('Provider unavailable'); } };
  f = inquiry(); await c.handlers['pur-rate-request-save'](f, event('send'));
  assert.match(f.alert.textContent, /Provider unavailable/); assert.equal(c.W.t.rateRequests?.length || 0, 0); assert.equal(c.W.t.emails.length, 0);
  let sends = 0;
  c.TN.emailTransport = { send: async (payload, options) => {
    sends++; assert.ok(options.idempotencyKey); assert.ok(payload.taskId);
    return { status: 'sent', messageId: `test-message-${sends}`, sentAt: '2026-01-01T10:00', threadId: 'test-thread' };
  } };
  // 1-3: Successful simulated submission creates exactly one linked waiting record.
  f = inquiry(); await Promise.all([c.handlers['pur-rate-request-save'](f, event('send')), c.handlers['pur-rate-request-save'](f, event('send'))]);
  assert.equal(sends, 1); assert.equal(c.W.t.rateRequests.length, 1); assert.equal(c.W.t.emails.length, 1);
  const requestId = c.W.t.rateRequests[0].id;
  assert.equal(c.W.t.rateRequests[0].messageId, 'test-message-1'); assert.equal(c.W.t.rateRequests[0].taskId, 't');
  assert.match(c.TN.purchaseRecords.render('t'), /Waiting for Hotel Response/);
  assert.equal(c.records('t').length, 0);
  c.handlers['pur-rate-reply-open']({ dataset: { id: 't', request: requestId } }); assert.match(c.drawer.body, /Quotation replies do not confirm/);
  // 4-6: Reply/proof links to the inquiry, creates a quoted rate, preserves ledger.
  f = form({ from: 'hotel@example.com', receivedAt: '2026-01-01T11:00', messageId: 'reply-1', quotedAmount: '110', notes: 'Initial quotation' }, { request: requestId }, 'proof', pdf);
  await c.handlers['pur-rate-reply-save'](f);
  assert.equal(c.W.t.rateReplies[0].requestId, requestId); assert.equal(c.W.t.rateReplies[0].inReplyTo, 'test-message-1');
  assert.equal(c.records('t')[0].amount, 110); assert.equal(c.records('t')[0].rateRequestId, requestId);
  assert.match(c.TN.purchaseRecords.render('t'), /Rate Reply Received/); assert.match(c.TN.purchaseRecords.render('t'), /Record Hotel Rate/);
  assert.equal(c.D.services.t.taskStatus, 'in_progress'); assert.equal(c.W.t.bookingConfirmations?.length || 0, 0);
  c.handlers['pur-record-quoted-rate']({ dataset: { id: 't', request: requestId } }); assert.equal(c.openRateArgs.dataset.rateRequest, requestId);
  const initialId = c.records('t')[0].id;
  let edit = rateForm('we_offered', '95'); edit.dataset.parentRate = initialId; c.action(edit);
  assert.equal(c.records('t').length, 2); assert.equal(c.records('t')[0].amount, 110);
  // 7-8: Final rates populate the same record; all approval gates still apply.
  edit = rateForm('final_agreed', '105'); edit.dataset.parentRate = c.records('t').at(-1).id; c.action(edit);
  assert.equal(c.records('t').at(-1).rateRequestId, requestId); assert.equal(c.TN.purchaseRecords.entries('t').length, 1);
  assert.match(c.TN.purchaseRecords.render('t'), /Manager approval/);
  let row = c.rows('t')[0]; assert.match(c.TN.purchaseBooking.eligibility('t', row.id).reason, /Manager/);
  c.W.t.approvals[c.latestCost('t').v] = { by: 'manager' }; c.D.services.t.goAhead = 'waiting';
  assert.match(c.TN.purchaseBooking.eligibility('t', row.id).reason, /Accounts/);
  c.D.services.t.goAhead = 'given'; assert.equal(c.TN.purchaseBooking.eligibility('t', row.id).reason, '');
  // 9-10: Booking email successfully submitted through test adapter, no new cost.
  const costsBefore = c.W.t.costs.length;
  f = form({ to: 'hotel@example.com', from: 'buyer@example.com', subject: 'Book at agreed rate', body: 'Please confirm.' }, { rate: row.id, costVersion: String(c.latestCost('t').v) });
  await c.handlers['pur-booking-save-request'](f, event('send'));
  const booking = c.W.t.bookingRequests[0]; assert.equal(booking.status, 'sent'); assert.ok(booking.providerMessageId);
  assert.equal(booking.rateRequestId, requestId); assert.equal(c.W.t.costs.length, costsBefore);
  assert.match(c.TN.purchaseRecords.render('t'), /Waiting for Booking Confirmation/); assert.notEqual(c.D.services.t.taskStatus, 'supplier_confirmed');
  // 11-12: Only explicit details plus proof confirm the booking and tracker.
  f = form({ number: 'HOTEL-456', confirmedAt: '2026-01-01T12:00', confirmedBy: 'Hotel Reservations', contact: 'hotel@example.com' }, { request: booking.id }, 'proof', pdf);
  await c.handlers['pur-booking-save-confirmation'](f, event('confirm'));
  assert.equal(c.W.t.bookingConfirmations.length, 1); assert.equal(c.D.services.t.taskStatus, 'supplier_confirmed');
  assert.match(c.TN.purchaseRecords.render('t'), /Confirmed/); assert.match(c.TN.purchaseRecords.render('t'), /View Confirmation Proof/);
  assert.equal(c.progress('t', c.D.services.t, c.W.t)[3].done, true); assert.equal(c.records('t').length, 3);
  const history = c.TN.purchaseRecords.history('t', requestId, row.id);
  for (const label of ['test-message-1', 'reply-1', 'Negotiation Rate History (3)', 'Booking requests (1)', 'Reply / confirmation proof (2)']) assert.ok(history.includes(label), label);
  // 13: Rehydrate the same serialized browser store with the new modules loaded.
  c.persist(); c = app(); assert.equal(c.W.t.rateRequests.length, 1); assert.equal(c.W.t.rateReplies.length, 1);
  assert.equal(c.TN.purchaseBooking.confirmationComplete('t'), true); assert.equal(c.TN.purchaseRecords.entries('t').length, 1);
  assert.equal(c.records('t').length, 3); assert.equal(c.W.t.bookingConfirmations.length, 1);
  assert.equal(c.W.t.costs.length, costsBefore + 1);
  // Independent Supplier/DMC inquiry receives its own waiting status and links.
  memory.clear(); c = app(); f = inquiry({ recipientType: 'supplier', supplierId: 'dmc', to: 'dmc@example.com' });
  await c.handlers['pur-rate-request-save'](f, event('manual'));
  assert.match(c.TN.purchaseRecords.render('t'), /Waiting for Supplier Response/);
  assert.equal(c.W.t.rateRequests[0].supplierId, 'dmc');
  // A sent draft transition uses the same request ID and preserves email snapshots.
  f = inquiry(); await c.handlers['pur-rate-request-save'](f, event('draft')); const draftId = c.W.t.rateRequests.at(-1).id;
  f = inquiry(); f.dataset.requestKey = draftId; await c.handlers['pur-rate-request-save'](f, event('manual'));
  assert.equal(c.W.t.rateRequests.length, 2); assert.equal(c.W.t.rateRequests.at(-1).status, 'manual_sent');
  // Provider success + storage failure is recoverable without sending twice.
  const persist = c.TN.purchase.persist; let deliveryCount = 0;
  c.TN.emailTransport = { send: async () => { deliveryCount++; return { status: 'sent', messageId: 'recoverable-mail', sentAt: '2026-01-01T10:00' }; } };
  c.TN.purchase.persist = () => { throw Error('Storage full'); };
  f = inquiry(); await c.handlers['pur-rate-request-save'](f, event('send')); assert.match(f.alert.textContent, /Email was sent, but/);
  assert.equal(c.W.t.rateRequests.length, 2);
  c.TN.purchase.persist = persist; await c.handlers['pur-rate-request-save'](f, event('send'));
  assert.equal(deliveryCount, 1); assert.equal(c.W.t.rateRequests.length, 3);
  // Cross-task requests and unassigned users cannot record replies.
  f = form({ from: 'hotel@example.com', receivedAt: '2026-01-01T11:00', quotedAmount: '100' }, { id: 'other', request: draftId });
  await c.handlers['pur-rate-reply-save'](f); assert.equal(c.W.other.rateReplies?.length || 0, 0);
  c.allowed = false; f = inquiry(); await c.handlers['pur-rate-request-save'](f, event('manual')); assert.match(f.alert.textContent, /assigned Purchase/);
  console.log('PASS: 13 unified scenarios with simulated provider delivery; manual fallback, reply/rate linkage, history, approvals, proof, confirmation, persistence, provider failures and safe retry.');
  smoke();
}
run().catch((e) => { console.error(e); process.exitCode = 1; });
