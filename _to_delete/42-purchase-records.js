/* Unified rate inquiries, negotiations and booking records. No mail provider is
   bundled with this static preview. Optional host adapter contract:
   TN.emailTransport.send(payload, {idempotencyKey}) -> {status:'sent',messageId,sentAt}.
   Incoming replies are recorded manually; this module does not poll an inbox. */
(function () {
  const TN = window.TN, D = TN.DATA, P = TN.purchase, B = TN.purchaseBooking, esc = TN.esc;
  let sequence = 0;
  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${++sequence}`;
  const now = () => new Date().toLocaleString('sv-SE');
  const who = () => TN.roleDef().person;
  const list = (id) => P.work(id)?.rateRequests || [];
  const replies = (id) => P.work(id)?.rateReplies || [];
  const getRequest = (id, key) => list(id).find((r) => r.id === key && r.taskId === id);
  const canSend = () => typeof TN.emailTransport?.send === 'function';
  const sent = (r) => r && ((r.status === 'sent' && r.messageId && r.sentAt) || (r.status === 'manual_sent' && r.manualReference && r.sentAt) || r.status === 'legacy_recorded');
  const canView = () => TN.is('purchase', 'manager', 'accounts', 'checker');
  const money = (value) => value == null ? '' : TN.fmt.inr(value);
  const email = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  const validDate = (value) => value && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 60000;
  const amount = (value) => { const n = Number(String(value || '').replace(/[₹,\s]/g, '')); return Number.isFinite(n) && n > 0 ? n : NaN; };
  const badge = (label, tone = 'neutral') => `<span class="records-badge is-${tone}">${esc(label)}</span>`;
  const control = (act, id, req, text, extra = '') => `<button type="button" class="button secondary" data-act="${act}" data-id="${esc(id)}" data-request="${esc(req || '')}" ${extra}>${text}</button>`;
  const field = (key, label, type = 'text', attrs = '') => `<div class="field"><label for="rr-${key}">${esc(label)}</label><input id="rr-${key}" name="${key}" type="${type}" ${attrs}/></div>`;
  function fail(form, text) {
    let box = form.querySelector('[data-records-error]');
    if (!box) { form.insertAdjacentHTML('afterbegin', '<div data-records-error role="alert" tabindex="-1"></div>'); box = form.querySelector('[data-records-error]'); }
    box.textContent = text; box.focus();
  }
  function busy(form, value) {
    form.dataset.busy = value ? 'true' : 'false';
    document.querySelectorAll(`button[form="${form.id}"]`).forEach((button) => button.disabled = value);
  }
  async function deliver(form, payload) {
    if (!canSend()) throw Error('No email provider is connected. Use the draft and manual sent-email options.');
    const fingerprint = JSON.stringify({ ...payload, attachments: payload.attachments?.map(({ name, type, size, dataUrl }) => ({ name, type, size, dataUrl })) });
    if (form.emailSubmission?.result) {
      if (form.emailSubmission.fingerprint !== fingerprint) throw Error('This message was already sent. Restore the original fields to save its record.');
      return form.emailSubmission.result;
    }
    form.dataset.sendKey ||= uid('mail-key');
    const response = await TN.emailTransport.send(payload, { idempotencyKey: form.dataset.sendKey });
    if (response?.status !== 'sent' || !String(response.messageId || '').trim() || !validDate(response.sentAt)) throw Error('The email provider did not confirm a sent message. No sent record was created.');
    const result = { status: 'sent', messageId: String(response.messageId), sentAt: response.sentAt, threadId: response.threadId || null };
    form.emailSubmission = { fingerprint, result };
    return result;
  }
  function composerExtra() {
    return `<p class="records-note">${canSend() ? 'A mail provider is connected. Review the requirements and send.' : 'No email service is connected. Copy or save a draft, send it from your email app, then record the sent email. No inbox synchronization is configured.'}</p>
      ${field('from', 'Sender email', 'email', 'value="purchase.jodhpur@holidaychacha.in" maxlength="254"')}
      <fieldset class="records-manual"><legend>Manual sent-email recording</legend>${field('sentAt', 'Date and time sent', 'datetime-local')}${field('manualReference', 'Sent email reference / mailbox link', 'text', 'maxlength="500"')}${field('messageId', 'Actual Message-ID (if available)', 'text', 'maxlength="500"')}<label class="choice"><input type="checkbox" name="sentAttested" value="yes"/> I sent this request outside the CRM.</label></fieldset>`;
  }
  function composerFooter() {
    return `<div class="booking-actions"><button type="button" class="button secondary" data-act="pur-rate-request-copy">Copy draft</button><button type="submit" form="pur-mail-form" class="button secondary" data-mode="draft">Save draft</button><button type="submit" form="pur-mail-form" class="button" data-mode="manual">Record manually sent</button>${canSend() ? '<button type="submit" form="pur-mail-form" class="button" data-mode="send">Send email</button>' : ''}</div>`;
  }
  function enhanceComposer(id) {
    const form = document.getElementById('pur-mail-form');
    const to = form.querySelector('[name="to"]');
    const supplier = TN.supplier(TN.service(id).supplier);
    const directEmail = supplier?.type === 'Hotel' ? supplier.email || '' : '';
    to.value = directEmail;
    form.querySelectorAll('[name="recipientType"]').forEach((radio) => radio.addEventListener('change', () => {
      if (radio.checked && radio.value === 'hotel') to.value = directEmail;
    }));
  }
  async function saveRequest(form, event) {
    if (form.dataset.busy === 'true' || form.dataset.saved === 'true') return;
    const id = form.dataset.id, s = TN.service(id), w = P.work(id);
    if (!s || !w || !P.canWork(s)) return fail(form, 'Only the assigned Purchase colleague may record a rate request.');
    const f = new FormData(form), mode = event?.submitter?.dataset.mode || 'draft';
    if (!['draft', 'manual', 'send'].includes(mode)) return fail(form, 'Choose a valid email action.');
    const recipientType = f.get('recipientType') || 'supplier';
    if (!['hotel', 'supplier'].includes(recipientType)) return fail(form, 'Choose Direct Hotel or Supplier / DMC.');
    const supplierId = recipientType === 'hotel' ? s.supplier || String(f.get('supplierId') || '') : String(f.get('supplierId') || '');
    const supplier = TN.supplier(supplierId);
    if (!supplier || supplier.status !== 'active' || !(supplier.services || []).includes(s.kind === 'package' ? 'hotel' : s.kind)) return fail(form, 'Choose an active hotel or supplier from this task’s supplier master.');
    const values = Object.fromEntries(['to', 'from', 'subject', 'body', 'sentAt', 'manualReference', 'messageId', 'remark'].map((key) => [key, String(f.get(key) || '').trim()]));
    const ccText = String(f.get('cc') || '').trim();
    const cc = [...new Map(ccText.split(/[,;]/).map((x) => x.trim()).filter(Boolean).map((x) => [x.toLowerCase(), x])).values()];
    if (!email(values.to) || !email(values.from) || !values.subject || !values.body || values.subject.length > 200 || values.body.length > 12000 || ccText.length > 1000 || cc.some((x) => !email(x))) return fail(form, 'Enter valid To, CC, sender, subject and booking requirements.');
    if (mode === 'manual' && (f.get('sentAttested') !== 'yes' || !values.manualReference || !validDate(values.sentAt))) return fail(form, 'Confirm external sending and enter its sent time and mailbox reference.');
    busy(form, true);
    try {
      const delivery = mode === 'send' ? await deliver(form, { taskId: id, purpose: 'rate', to: values.to, cc, from: values.from, subject: values.subject, body: values.body }) : null;
      if (!delivery && !P.canWork(s)) throw Error('Task ownership changed. Reopen the composer.');
      const request = { id: form.dataset.requestKey ||= uid('rate-request'), taskId: id, hotelId: P.hotelKey(id), supplierId,
        hotelName: s.title, party: recipientType === 'hotel' ? s.title : supplier.name, recipientType, ...values, cc,
        status: delivery ? 'sent' : mode === 'manual' ? 'manual_sent' : 'draft',
        sentAt: delivery?.sentAt || (mode === 'manual' ? values.sentAt : null),
        messageId: delivery?.messageId || (mode === 'manual' ? values.messageId || null : null), threadId: delivery?.threadId || null,
        createdAt: now(), createdBy: who(), responseStatus: mode === 'draft' ? 'Draft — not sent' : recipientType === 'supplier' ? 'Waiting for Supplier Response' : 'Waiting for Hotel Response' };
      B.transaction(id, (work) => {
        const index = (work.rateRequests || []).findIndex((r) => r.id === request.id);
        if (index >= 0 && (work.rateRequests[index].status !== 'draft' || work.rateRequests[index].taskId !== id)) throw Error('This request was already recorded.');
        if (index >= 0) {
          request.createdAt = work.rateRequests[index].createdAt; request.createdBy = work.rateRequests[index].createdBy;
          work.rateRequests[index] = request;
        } else (work.rateRequests ||= []).push(request);
        work.emails.push({ id: uid('rate-email'), requestId: request.id, taskId: id, dir: 'out', kind: 'rate',
          from: request.from, to: request.to, cc, subject: request.subject, body: request.body, remark: request.remark,
          at: (request.sentAt || request.createdAt).replace('T', ' '), by: who(), status: request.status,
          supplier: supplierId, hotel: s.title, messageId: request.messageId });
        work.history.push({ text: mode === 'draft' ? 'Rate request draft saved' : 'Rate request recorded', at: now(), by: who() });
      });
      form.dataset.saved = 'true'; TN.closeOverlay();
      TN.toast(delivery ? 'Rate request sent and linked to Rates & Booking Records.' : mode === 'manual' ? 'Manual sent-email record saved. Waiting for a rate reply.' : 'Rate request draft saved. No email was sent.'); TN.refresh();
    } catch (e) { fail(form, `${form.emailSubmission?.result ? 'Email was sent, but its local record could not be saved. Retry saving without resending. ' : ''}${e.message}`); }
    finally { busy(form, false); }
  }
  // Import old inquiry metadata without inventing provider IDs or changing rates.
  for (const [id, s] of Object.entries(D.services)) {
    const w = P.work(id); if (!w || s.dept !== 'purchase') continue;
    (w.emails || []).forEach((mail, index) => {
      if (mail.kind !== 'rate' || mail.dir === 'in' || mail.requestId) return;
      const key = `legacy-rate-${id}-${index}`;
      if (list(id).some((r) => r.id === key)) return;
      const supplierId = mail.supplier || s.supplier;
      (w.rateRequests ||= []).push({ id: key, taskId: id, hotelId: P.hotelKey(id), supplierId,
        hotelName: s.title, party: (TN.supplier(supplierId) || {}).name || s.title,
        recipientType: mail.recipientType || 'hotel', to: mail.to || '', from: mail.from || '', subject: mail.subject || '',
        body: mail.body || '', cc: mail.cc || [], sentAt: mail.at, createdAt: mail.at, createdBy: mail.by,
        messageId: mail.messageId || null, status: 'legacy_recorded', legacyEmailIndex: index,
        responseStatus: 'Legacy request record' });
    });
  }
  function entries(id) {
    const rows = P.rows(id), claimed = new Set(), output = [];
    for (const request of list(id)) {
      const linked = P.rates(id).filter((rate) => rate.rateRequestId === request.id);
      let row = rows.find((r) => linked.some((rate) => r.recordIds.includes(rate.id)));
      // Legacy requests share a party's existing negotiation ledger, never copy it.
      if (!row && request.status === 'legacy_recorded') row = rows.filter((r) => r.supplier === request.supplierId).at(-1);
      if (row) claimed.add(row.rootId);
      output.push({ request, row });
    }
    rows.filter((r) => !claimed.has(r.rootId) && !r.rateRequestId).forEach((row) => output.push({ request: null, row }));
    return output;
  }
  function requestStatus(id, request) {
    if (!request) return badge('No rate request linked');
    if (replies(id).some((r) => r.requestId === request.id)) return badge('Rate Reply Received', 'success');
    if (request.status === 'draft') return badge('Draft — not sent');
    if (request.status === 'legacy_recorded') return badge('Legacy request record');
    return badge(request.recipientType === 'supplier' ? 'Waiting for Supplier Response' : 'Waiting for Hotel Response', 'info') + (request.status === 'manual_sent' ? '<small>Sent externally · recorded manually</small>' : '');
  }
  function render(id) {
    const s = TN.service(id), writable = P.canWork(s);
    const body = entries(id).map(({ request, row }) => {
      const booking = row ? B.cells(id, row) : null;
      const legacyConfirmed = row && P.isConfirmed?.(s) && B.confirmationComplete(id) && P.latestCost(id)?.offer === row.offer.id && !(P.work(id).bookingConfirmations || []).length;
      const party = request?.party || (TN.supplier(row?.supplier) || {}).name || s.title;
      const values = row?.amounts || {};
      const selected = values.final ?? values.counter ?? values.hotel;
      const delta = selected == null || s.budget == null ? '—' : selected > s.budget ? `<span class="text-status-danger">+${money(selected - s.budget)}</span>` : `<span class="text-status-success">${money(s.budget - selected)} savings</span>`;
      let actions = '';
      if (request?.status === 'draft' && writable) actions += control('pur-rate-request-resume', id, request.id, 'Open draft');
      if (request && sent(request) && writable) actions += control('pur-rate-reply-open', id, request.id, 'Record Rate Reply');
      if (request && replies(id).some((reply) => reply.requestId === request.id) && writable) actions += control('pur-record-quoted-rate', id, request.id, 'Record Hotel Rate');
      if (row && writable) actions += `<button type="button" class="button secondary" data-act="pur-open-rate" data-id="${esc(id)}" data-rate="${esc(row.id)}" data-mode="edit">Edit rate</button>`;
      if (booking && !legacyConfirmed) actions += booking.action;
      // Proof and all email/rate histories live in this table's History action.
      const proof = (P.work(id).bookingConfirmations || []).find((c) => c.rowId === row?.rootId && B.validConfirmation(id, c));
      if (proof) actions += control('pur-booking-view-proof', id, '', 'View Confirmation Proof', `data-proof="${esc(proof.proofId)}"`);
      actions += control('pur-record-history', id, request?.id, 'View History', `data-rate="${esc(row?.id || '')}"`);
      const bookingStatus = legacyConfirmed ? `Confirmed (existing record)<br/>${esc(s.hotelConfirmationNo || s.confirmationNo || '')}` : booking?.status || 'Final rate not agreed';
      return `<article class="rate-record-card" aria-label="${esc(party)} rate and booking record">
        <header class="rate-record-header"><div class="rate-record-party"><h4>${esc(party)}</h4>${request ? `<p>${esc(request.to)}</p>` : '<p>Hotel / Supplier</p>'}</div><div class="rate-record-request"><span class="rate-record-label">Rate Request Status</span>${requestStatus(id, request)}</div></header>
        <dl class="rate-record-amounts">${[["Hotel’s Rate", money(values.hotel)], ['Our Offer', money(values.counter)], ['Final Rate', money(values.final)], ['vs Budget', delta]].map(([label, value]) => `<div><dt>${label}</dt><dd>${value || '—'}</dd></div>`).join('')}</dl>
        <div class="rate-record-booking"><span class="rate-record-label">Booking Request Status</span><div>${bookingStatus}</div></div>
        ${request ? `<p class="rate-record-reference">${esc(request.id)}${request.sentAt ? ' · ' + esc(TN.fmt.dateTime(request.sentAt.replace('T', ' '))) : ''}</p>` : ''}
        <footer class="records-actions" aria-label="Record actions">${actions}</footer>
      </article>`;
    }).join('');
    return `<div class="rate-records-grid" role="region" aria-label="Rates & Booking Records">${body || '<p class="rate-records-empty">No records yet. Use Ask for rates from the hotel summary.</p>'}</div>`;
  }
  function openReply(el) {
    const id = el.dataset.id, request = getRequest(id, el.dataset.request);
    if (!request || !sent(request) || !P.canWork(TN.service(id))) return;
    TN.drawer({ title: 'Record rate reply', description: `${request.party} · ${request.id}`,
      body: `<form id="rate-reply-form" data-act="pur-rate-reply-save" data-id="${esc(id)}" data-request="${esc(request.id)}" class="booking-form" novalidate><div data-records-error role="alert" tabindex="-1"></div>
        <p>Quotation replies do not confirm a booking. Attach the hotel/supplier reply or record its details manually.</p>
        ${field('from', 'Reply sender email', 'email', `value="${esc(request.to)}" maxlength="254"`)}${field('receivedAt', 'Reply date and time', 'datetime-local')}
        ${field('messageId', 'Reply Message-ID (if available)', 'text', 'maxlength="500"')}${field('quotedAmount', 'Hotel / supplier quoted amount (optional)', 'text', 'inputmode="decimal"')}
        ${field('proof', 'Email screenshot or PDF (optional)', 'file', 'accept="application/pdf,image/jpeg,image/png,image/webp"')}
        <div class="field"><label for="rr-notes">Reply details</label><textarea id="rr-notes" name="notes" rows="3" maxlength="1000"></textarea></div></form>`,
      footer: '<button type="submit" class="button" form="rate-reply-form">Save rate reply</button>' });
  }
  TN.act('pur-rate-reply-save', async (form) => {
    if (form.dataset.busy === 'true' || form.dataset.saved === 'true') return;
    const id = form.dataset.id, request = getRequest(id, form.dataset.request), s = TN.service(id), f = new FormData(form);
    if (!request || !sent(request) || !P.canWork(s)) return fail(form, 'This request cannot be updated by the current user.');
    const from = String(f.get('from') || '').trim(), receivedAt = String(f.get('receivedAt') || ''), quotedText = String(f.get('quotedAmount') || '').trim();
    if (!email(from) || !validDate(receivedAt) || (request.sentAt && Date.parse(receivedAt) < Date.parse(request.sentAt)) || (quotedText && !amount(quotedText))) return fail(form, 'Enter a valid sender, reply time and positive quoted amount.');
    busy(form, true);
    try {
      const file = form.querySelector('[name="proof"]')?.files?.[0];
      const uploaded = file ? await B.readFile(file) : null;
      if (!P.canWork(s)) throw Error('Task ownership changed.');
      B.transaction(id, (w) => {
        const proof = uploaded ? { ...uploaded, kind: 'quote', taskId: id, requestId: request.id, supplierId: request.supplierId, state: 'stored', at: now(), by: who() } : null;
        if (proof) w.files.push(proof);
        const reply = { id: uid('rate-reply'), taskId: id, requestId: request.id, supplierId: request.supplierId, hotelId: request.hotelId,
          from, receivedAt, messageId: String(f.get('messageId') || '').trim() || null, inReplyTo: request.messageId,
          proofId: proof?.id || null, notes: String(f.get('notes') || '').trim(), recordedAt: now(), recordedBy: who(), source: 'manual' };
        (w.rateReplies ||= []).push(reply);
        const storedRequest = getRequest(id, request.id); storedRequest.responseStatus = 'Rate Reply Received';
        let savedRate;
        if (quotedText) {
          let offer = w.offers.find((o) => o.supplier === request.supplierId && o.hotel === (s.kind === 'hotel' ? s.title.split(',')[0] : s.title) && o.status !== 'withdrawn');
          if (!offer) { offer = { id: uid('offer'), supplier: request.supplierId, hotel: s.kind === 'hotel' ? s.title.split(',')[0] : s.title, source: request.recipientType, price: null, rates: [], status: 'open', at: now(), by: who() }; w.offers.push(offer); }
          const previous = P.rates(id).filter((r) => r.rateRequestId === request.id).at(-1);
          savedRate = P.appendRate(id, offer, { rateRequestId: request.id, parentRateId: previous?.id || null,
            kind: previous ? 'supplier_revised' : 'hotel_said', amount: amount(quotedText), at: now(), by: who(),
            party: offer.hotel, source: request.recipientType, remark: reply.notes, rateReplyId: reply.id });
          offer.price = savedRate.amount; storedRequest.latestRateId = savedRate.id;
        }
        w.emails.push({ id: uid('rate-reply-email'), requestId: request.id, taskId: id, dir: 'in', kind: 'reply_quote', from, to: request.from,
          subject: `Re: ${request.subject}`, body: reply.notes || 'Rate reply recorded manually. See the attached proof.', at: receivedAt.replace('T', ' '),
          by: who(), supplier: request.supplierId, status: 'manually_recorded', messageId: reply.messageId, inReplyTo: request.messageId,
          proofId: reply.proofId, rate: savedRate?.amount || null });
      });
      form.dataset.saved = 'true'; TN.closeOverlay(); TN.toast('Rate Reply Received. Booking remains unconfirmed.'); TN.refresh();
    } catch (e) { fail(form, e.message); } finally { busy(form, false); }
  });
  TN.act('pur-record-quoted-rate', (el) => {
    const id = el.dataset.id, request = getRequest(id, el.dataset.request); if (!request || !P.canWork(TN.service(id))) return;
    const latest = P.rates(id).filter((r) => r.rateRequestId === request.id).at(-1);
    P.openRate({ dataset: { id, rate: latest?.id || '', rateRequest: request.id, mode: 'edit' } });
  });
  TN.act('pur-rate-request-resume', (el) => {
    const request = getRequest(el.dataset.id, el.dataset.request);
    if (!request || request.status !== 'draft' || !P.canWork(TN.service(el.dataset.id))) return;
    P.openMail({ dataset: { id: el.dataset.id, kind: 'rate' } });
    const form = document.getElementById('pur-mail-form');
    form.dataset.requestKey = request.id;
    const supplier = form.querySelector('[name="supplierId"]'); if (supplier) supplier.value = request.supplierId;
    form.querySelectorAll('[name="recipientType"]').forEach((radio) => {
      radio.checked = radio.value === request.recipientType;
      if (radio.checked) radio.dispatchEvent(new Event('change', { bubbles: true }));
    });
    for (const name of ['to', 'from', 'subject', 'body', 'remark']) { const input = form.querySelector(`[name="${name}"]`); if (input) input.value = request[name] || ''; }
    form.querySelector('[name="cc"]').value = (request.cc || []).join(', ');
  });
  TN.act('pur-rate-request-copy', async () => {
    const form = document.getElementById('pur-mail-form'), f = new FormData(form);
    const text = `To: ${f.get('to')}\nCC: ${f.get('cc') || ''}\nSubject: ${f.get('subject')}\n\n${f.get('body')}`;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else { const area = document.createElement('textarea'); area.value = text; form.appendChild(area); try { area.focus(); area.select(); if (!document.execCommand('copy')) throw Error(); } finally { area.remove(); } }
      TN.toast('Rate request draft copied. No email was sent.');
    } catch (e) { fail(form, 'Select the message and copy it with Ctrl+C. No email was sent.'); }
  });
  function history(id, requestId, rateId) {
    const w = P.work(id), request = getRequest(id, requestId), row = P.rows(id).find((r) => r.id === rateId);
    const supplierId = request?.supplierId || row?.supplier;
    const rates = P.rates(id).filter((r) => request && request.status !== 'legacy_recorded' ? r.rateRequestId === request.id : r.supplier === supplierId);
    const bookings = (w.bookingRequests || []).filter((r) => request && request.status !== 'legacy_recorded' ? r.rateRequestId === request.id || (row && r.rowId === row.rootId) : r.supplierId === supplierId);
    const emails = w.emails.map((mail, index) => ({ mail, index })).filter(({ mail, index }) =>
      request ? mail.requestId === request.id || index === request.legacyEmailIndex || bookings.some((b) => b.id === mail.requestId) || (request.status === 'legacy_recorded' && (mail.supplier === supplierId || (!mail.supplier && supplierId === TN.service(id).supplier))) : mail.supplier === supplierId);
    const proofs = w.files.filter((f) => f.requestId === request?.id || bookings.some((b) => b.id === f.requestId));
    return `<div class="records-history"><details open><summary>Email requests and replies (${emails.length})</summary>${emails.map(({ mail, index }) => `<article><strong>${esc(mail.subject)}</strong><p>${esc(mail.status || 'Legacy record')} · ${esc(mail.at)}<br/>From: ${esc(mail.from || '')}<br/>To: ${esc(mail.to || '')}${mail.cc?.length ? '<br/>CC: ' + esc(mail.cc.join(', ')) : ''}<br/>Message-ID: ${esc(mail.messageId || 'Not supplied')}</p><pre class="booking-message">${esc(mail.body || mail.notes || '')}</pre>${control('pur-view-email', id, '', 'Email details', `data-idx="${index}"`)}</article>`).join('') || '<p>No linked email records.</p>'}</details>
      <details open><summary>Negotiation Rate History (${rates.length})</summary>${rates.map((r) => `<p>Round ${r.round} · ${esc(({hotel_said: "Hotel’s Rate", supplier_revised: 'Supplier revised', we_offered: 'Our Offer', final_agreed: 'Final Rate'})[r.kind])} · <strong>${money(r.amount)}</strong><br/>${esc(r.at)} · ${esc((TN.PEOPLE[r.by] || {}).name || r.by)}<br/>${esc(r.remark || '')}</p>`).join('') || '<p>No negotiated rates recorded.</p>'}</details>
      <details><summary>Supplier Offers</summary>${w.offers.filter((o) => o.supplier === supplierId).map((o) => `<p>${esc(o.hotel)} · ${esc(o.status)} · ${money(o.price)}</p>`).join('')}</details>
      <details open><summary>Booking requests (${bookings.length})</summary>${bookings.map((b) => `<p>${esc(b.status)} · ${esc(b.to)} · ${esc(b.sentAt || 'Not sent')}<br/>Message-ID: ${esc(b.providerMessageId || 'Not supplied')}</p>${control('pur-booking-view-request', id, '', 'View booking email', `data-request="${esc(b.id)}"`)}`).join('')}</details>
      <details open><summary>Reply / confirmation proof (${proofs.length})</summary>${proofs.map((f) => control('pur-booking-view-proof', id, '', esc(f.name), `data-proof="${esc(f.id)}"`)).join('')}</details></div>`;
  }
  TN.act('pur-record-history', (el) => {
    if (!canView() || !P.work(el.dataset.id)) return;
    TN.drawer({ title: 'View History', body: history(el.dataset.id, el.dataset.request, el.dataset.rate), footer: '<button type="button" class="button secondary" data-close>Close</button>' });
  });
  TN.act('pur-rate-request-save', saveRequest);
  TN.act('pur-rate-reply-open', openReply);
  TN.purchaseRecords = { render, entries, history, composerExtra, composerFooter, enhanceComposer, saveRequest, canSend, deliver };
})();
