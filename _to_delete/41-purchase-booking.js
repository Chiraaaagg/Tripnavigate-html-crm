/* Booking requests and confirmation evidence in the existing Purchase Work tab.
   This static preview has no mail transport or incoming-mail synchronization. */
(function () {
  const TN = window.TN, D = TN.DATA, P = TN.purchase, esc = TN.esc;
  const stamp = () => new Date().toLocaleString('sv-SE');
  const person = () => TN.roleDef().person;
  let seq = 0;
  const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${++seq}`;
  const requests = (id) => P.work(id)?.bookingRequests || [];
  const confirmations = (id) => P.work(id)?.bookingConfirmations || [];
  const sent = (request) => request && request.sentAt && ((request.status === 'manual_sent' && request.manualReference) || (request.status === 'sent' && request.providerMessageId));
  const field = (name, label, input) => `<div class="field"><label for="bk-${name}">${esc(label)}</label>${input}</div>`;
  const input = (name, value = '', type = 'text', attrs = '') => `<input id="bk-${name}" name="${name}" type="${type}" value="${esc(value)}" ${attrs}/>`;
  const button = (act, id, row, text, extra = '') => `<button type="button" class="button secondary" data-act="${act}" data-id="${esc(id)}" data-rate="${esc(row?.id || '')}" ${extra}>${text}</button>`;
  function error(form, message) {
    const target = form.querySelector('[data-booking-error]');
    if (target) { target.textContent = message; target.hidden = false; target.focus(); }
    else TN.toast(message, 'danger');
  }
  function busy(form, value) {
    form.dataset.busy = value ? 'true' : 'false';
    document.querySelectorAll(`button[form="${form.id}"]`).forEach((b) => { b.disabled = value; });
  }
  function transaction(id, mutate) {
    const w = P.work(id), s = TN.service(id);
    const before = JSON.parse(JSON.stringify({ w, s }));
    try { mutate(w, s); P.persist(); }
    catch (e) {
      for (const [target, saved] of [[w, before.w], [s, before.s]]) {
        Object.keys(target).forEach((key) => delete target[key]); Object.assign(target, saved);
      }
      w.offers.forEach((offer) => (offer.rates || []).forEach(Object.freeze));
      throw e;
    }
  }
  function eligibility(id, rateId) {
    const s = TN.service(id), w = P.work(id), cost = P.latestCost(id);
    if (!s || !w) return { reason: 'Purchase task not found.' };
    const row = P.rows(id).find((r) => r.id === rateId || r.rootId === rateId);
    if (!row || !(row.amounts.final > 0)) return { reason: 'Record a final agreed rate first.' };
    const rate = P.rates(id).filter((r) => row.recordIds.includes(r.id) && r.kind === 'final_agreed').at(-1);
    if (!rate || !cost || cost.offer !== row.offer.id || cost.amount !== rate.amount || (cost.rateId && cost.rateId !== rate.id)) return { reason: 'This is not the current agreed cost version.' };
    if (!P.canWork(s)) return { reason: 'Only the assigned Purchase colleague can book an unconfirmed task.' };
    if (P.workCostIssue(id, s)) return { reason: P.workCostIssue(id, s) };
    if (s.budget == null || (cost.amount > s.budget && !w.approvals[cost.v])) return { reason: 'Manager approval is required for this cost version.' };
    if (P.needsGoAhead(s)) return { reason: 'Waiting for Accounts go-ahead.' };
    return { s, w, cost, row, rate, reason: '' };
  }
  function currentRequest(id, row) {
    return requests(id).filter((r) => r.taskId === id && r.rowId === row.rootId && r.supplierId === row.supplier && r.amount === row.amounts.final && r.costVersion === P.latestCost(id)?.v).at(-1);
  }
  function validConfirmation(id, confirmation) {
    const request = requests(id).find((r) => r.id === confirmation.requestId);
    const proof = P.work(id).files.find((f) => f.id === confirmation.proofId);
    const cost = P.latestCost(id);
    return !!(sent(request) && request.taskId === id && confirmation.taskId === id &&
      request.supplierId === confirmation.supplierId && request.hotelId === confirmation.hotelId &&
      confirmation.number && confirmation.confirmedAt && confirmation.confirmedBy && confirmation.contact &&
      (request.rateSource !== 'supplier' || confirmation.supplierNumber) &&
      proof?.dataUrl && proof.state === 'stored' && proof.requestId === request.id && proof.taskId === id &&
      cost && cost.offer === request.offerId && cost.amount === request.amount &&
      (!cost.rateId || cost.rateId === request.rateId));
  }
  function confirmationComplete(id) {
    const w = P.work(id);
    if (!requests(id).length && !confirmations(id).length) {
      // Previously confirmed seed bookings retain their existing evidence checks.
      return !!(w?.confirmedAt && w.confirmedBy && w.files.some((f) => f.kind === 'supplier_confirmation' && f.state === 'stored'));
    }
    return confirmations(id).some((c) => validConfirmation(id, c));
  }
  function cells(id, row) {
    const request = currentRequest(id, row);
    const confirmed = confirmations(id).find((c) => c.rowId === row.rootId && validConfirmation(id, c));
    const eligible = eligibility(id, row.id);
    const history = requests(id).filter((r) => r.rowId === row.rootId);
    let action = '';
    if (confirmed) action = '<span class="text-status-success">Booking confirmed</span>';
    else if (sent(request) && !eligible.reason) action = `<div class="booking-actions">${button('pur-booking-confirm', id, row, 'Record Booking Confirmed', `data-request="${esc(request.id)}"`)}${button('pur-booking-confirm', id, row, 'Upload Proof', `data-request="${esc(request.id)}" data-focus="proof"`)}</div>`;
    else action = button('pur-booking-request', id, row, 'Send Booking Request', eligible.reason ? `disabled title="${esc(eligible.reason)}"` : '');
    const status = confirmed ? `Confirmed<br/><strong>${esc(confirmed.number)}</strong>` : sent(request) ? `Waiting for Booking Confirmation${request.status === 'manual_sent' ? '<br/><small>Sent externally; recorded manually</small>' : ''}` : request ? 'Draft · not sent' : eligible.reason ? esc(eligible.reason) : 'Ready to request';
    let proof = confirmed ? button('pur-booking-view-proof', id, row, 'View Confirmation Proof', `data-proof="${esc(confirmed.proofId)}"`) : '';
    if (!confirmed && request?.proofIds?.length) proof += button('pur-booking-view-proof', id, row, 'View uploaded proof', `data-proof="${esc(request.proofIds.at(-1))}"`);
    if (history.length) proof += `<details class="booking-history"><summary>Request / reply history (${history.length})</summary>${history.map((r) => `<p>${esc(r.status === 'manual_sent' ? 'Sent externally (manual record)' : 'Draft')} · ${esc(r.to)} · ${esc(r.sentAt || r.createdAt)}</p>${button('pur-booking-view-request', id, row, 'View request', `data-request="${esc(r.id)}"`)}${confirmations(id).filter((c) => c.requestId === r.id).map((c) => `<p>Confirmation ${esc(c.number)} · ${esc(c.confirmedAt)} · ${esc(c.confirmedBy)}</p>`).join('')}`).join('')}</details>`;
    return { action, status, proof: proof || 'Not uploaded' };
  }
  function findRequest(id, requestId) { return requests(id).find((r) => r.id === requestId && r.taskId === id); }
  function requestMatches(request, checked) {
    return !checked.reason && checked.cost.v === request.costVersion && checked.rate.id === request.rateId &&
      checked.row.supplier === request.supplierId && checked.rate.hotelId === request.hotelId &&
      checked.cost.offer === request.offerId && checked.cost.amount === request.amount;
  }
  function openRequest(el) {
    const id = el.dataset.id;
    const cost = P.latestCost(id);
    const row = el.dataset.rate ? P.rows(id).find((r) => r.id === el.dataset.rate) : P.rows(id).find((r) => r.offer.id === cost?.offer && r.amounts.final === cost?.amount && (!cost.rateId || r.recordIds.includes(cost.rateId)));
    const eligible = eligibility(id, row?.id);
    if (eligible.reason) return TN.toast(eligible.reason, 'danger');
    const { s, rate } = eligible;
    const last = currentRequest(id, row);
    if (sent(last)) return TN.toast('This request is already recorded as sent. Record its confirmation instead.');
    const template = P.mailTemplate('booking', id, s, row.supplier);
    const draft = last?.status === 'draft' ? last : null;
    const from = draft?.from || 'purchase.jodhpur@holidaychacha.in';
    const body = `<form id="booking-request-form" data-act="pur-booking-save-request" data-id="${esc(id)}" data-rate="${esc(row.id)}" data-cost-version="${eligible.cost.v}" data-request="${esc(draft?.id || '')}" novalidate class="booking-form">
      <p class="message" role="note">${TN.purchaseRecords?.canSend() ? 'Review the booking requirements before sending with the connected mail provider.' : 'No email service is connected. Save or copy this draft, send it from your email app, then record the sent email below. Attach any selected file manually in your email app.'}</p>
      <p><strong>${esc((TN.supplier(row.supplier) || {}).name || s.title)}</strong> · Task ${esc(id)} · Agreed rate ${TN.fmt.inr(rate.amount)}</p>
      <div data-booking-error role="alert" hidden tabindex="-1"></div>
      ${field('to', 'Recipient email', input('to', draft?.to || template.to, 'email', 'required maxlength="254"'))}
      ${field('from', 'Sender email', input('from', from, 'email', 'required maxlength="254"'))}
      ${field('subject', 'Subject', input('subject', draft?.subject || template.subject, 'text', 'required maxlength="200"'))}
      ${field('body', 'Booking email preview', `<textarea id="bk-body" name="body" rows="15" maxlength="12000" required>${esc(draft?.body || template.body)}</textarea>`)}
      ${field('attachment', 'Attach file (optional)', input('attachment', '', 'file', 'accept="application/pdf,image/jpeg,image/png,image/webp"'))}<small>PDF, JPG, PNG or WebP, up to 4 MB. ${draft?.attachments?.length ? 'Previously saved attachment: ' + esc(draft.attachments[0].name) : ''}</small>
      <fieldset><legend>Manual sent-email record</legend>
      ${field('sentAt', 'Date and time sent', input('sentAt', '', 'datetime-local'))}
      ${field('manualReference', 'Sent email reference / mailbox link', input('manualReference', '', 'text', 'maxlength="500"'))}
      ${field('messageId', 'Actual email Message-ID (if available)', input('messageId', '', 'text', 'maxlength="500"'))}
      <label class="choice"><input type="checkbox" name="sentAttested" value="yes"/> I sent this booking request outside the CRM.</label></fieldset>
    </form>`;
    TN.drawer({ title: 'Send Booking Request', description: `${s.title} · ${s.deal}`, body,
      footer: `<div class="booking-actions"><button type="button" class="button secondary" data-act="pur-booking-copy">Copy draft</button><button type="submit" form="booking-request-form" class="button secondary" data-mode="draft">Save draft</button><button type="submit" form="booking-request-form" class="button" data-mode="manual">Record manually sent</button>${TN.purchaseRecords?.canSend() ? '<button type="submit" form="booking-request-form" class="button" data-mode="send">Send email</button>' : ''}</div>` });
  }
  async function readFile(file) {
    const type = ({ pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' })[file.name.split('.').pop().toLowerCase()];
    if (!type || !file.size || file.size > 4 * 1024 * 1024 || (file.type && file.type !== type)) throw Error('Choose a PDF, JPG, PNG or WebP file up to 4 MB.');
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(`data:${type};base64,${String(reader.result).split(',')[1]}`);
      reader.onerror = reader.onabort = () => reject(Error('The file could not be read. Select it again.'));
      reader.readAsDataURL(file);
    });
    return { id: uid('proof'), name: file.name, type, size: file.size, dataUrl };
  }
  const emailValid = (value) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value);
  const dateValid = (value) => value && Number.isFinite(Date.parse(value)) && Date.parse(value) <= Date.now() + 60000;
  TN.act('pur-booking-save-request', async (form, event) => {
    if (form.dataset.busy === 'true' || form.dataset.saved === 'true') return;
    const id = form.dataset.id, f = new FormData(form);
    const manual = event?.submitter?.dataset.mode === 'manual';
    const providerSend = event?.submitter?.dataset.mode === 'send';
    const values = Object.fromEntries(['to', 'from', 'subject', 'body', 'sentAt', 'manualReference', 'messageId'].map((key) => [key, String(f.get(key) || '').trim()]));
    const eligible = eligibility(id, form.dataset.rate);
    if (eligible.reason) return error(form, eligible.reason);
    if (String(eligible.cost.v) !== form.dataset.costVersion) return error(form, 'The agreed cost changed. Reopen the booking preview.');
    if (!emailValid(values.to) || !emailValid(values.from) || !values.subject || !values.body || values.subject.length > 200 || values.body.length > 12000) return error(form, 'Enter valid sender, recipient, subject and booking message.');
    if (manual && (f.get('sentAttested') !== 'yes' || !dateValid(values.sentAt) || !values.manualReference)) return error(form, 'Confirm that you sent the email externally, and enter its sent time and mailbox reference.');
    busy(form, true);
    try {
      const existing = findRequest(id, form.dataset.request);
      const file = form.querySelector('[name="attachment"]')?.files?.[0];
      const attachments = file ? [await readFile(file)] : (existing?.attachments || []);
      const checked = eligibility(id, form.dataset.rate);
      if (checked.reason || checked.cost.v !== eligible.cost.v || checked.rate.id !== eligible.rate.id) throw Error('Booking clearance changed. Reopen the preview.');
      if (sent(currentRequest(id, checked.row))) throw Error('This booking request is already recorded as sent.');
      const delivery = providerSend ? await TN.purchaseRecords.deliver(form, { to: values.to, from: values.from, subject: values.subject, body: values.body, attachments, taskId: id, purpose: 'booking' }) : null;
      const request = { ...existing, id: existing?.id || uid('booking'), taskId: id, hotelId: checked.rate.hotelId,
        supplierId: checked.row.supplier, offerId: checked.cost.offer, rateId: checked.rate.id, rowId: checked.row.rootId,
        rateRequestId: checked.rate.rateRequestId || null, rateSource: checked.rate.source,
        costVersion: checked.cost.v, amount: checked.cost.amount, ...values, attachments,
        createdAt: existing?.createdAt || stamp(), createdBy: existing?.createdBy || person(),
        recordedAt: stamp(), recordedBy: person(), status: delivery ? 'sent' : manual ? 'manual_sent' : 'draft',
        sentAt: delivery ? delivery.sentAt : manual ? values.sentAt : null, providerMessageId: delivery ? delivery.messageId : manual ? values.messageId || null : null,
        sendingMethod: delivery ? 'provider' : manual ? 'external_manual' : null, proofIds: existing?.proofIds || [] };
      transaction(id, (w) => {
        w.bookingRequests ||= [];
        const index = w.bookingRequests.findIndex((r) => r.id === request.id);
        if (index < 0) w.bookingRequests.push(request); else w.bookingRequests[index] = request;
        w.emails.push({ id: uid('mail-record'), requestId: request.id, taskId: id, dir: 'out', kind: 'booking',
          from: request.from, to: request.to, subject: request.subject, body: request.body, attachments,
          at: request.sentAt ? request.sentAt.replace('T', ' ') : request.createdAt, by: person(), supplier: request.supplierId,
          rate: request.amount, status: request.status, messageId: request.providerMessageId,
          notes: delivery ? 'Sent with mail provider.' : manual ? 'Sent outside CRM; recorded manually.' : 'Draft only; not sent.' });
      });
      form.dataset.saved = 'true'; TN.closeOverlay();
      TN.toast(providerSend ? 'Booking request sent. Waiting for Booking Confirmation.' : manual ? 'Manual sent-email record saved. Waiting for Booking Confirmation.' : 'Booking draft saved. No email was sent.'); TN.refresh();
    } catch (e) { error(form, `${form.emailSubmission?.result ? 'Email was sent, but the local record could not be saved. Retry saving without resending. ' : ''}${e.message} If browser storage is full, use a smaller attachment.`); }
    finally { busy(form, false); }
  });
  TN.act('pur-booking-copy', async () => {
    const form = document.getElementById('booking-request-form');
    const f = new FormData(form), message = `To: ${f.get('to')}\nSubject: ${f.get('subject')}\n\n${f.get('body')}`;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(message);
      else {
        const text = document.createElement('textarea'); text.value = message; form.appendChild(text);
        try { text.focus(); text.select(); if (!document.execCommand('copy')) throw Error(); }
        finally { text.remove(); }
      }
      TN.toast('Draft copied. Send it from your email app.');
    } catch (e) { error(form, 'Select the preview text and copy it with Ctrl+C. No email was sent.'); }
  });
  function requestForConfirmation(el) {
    const id = el.dataset.id, cost = P.latestCost(id);
    return el.dataset.request ? findRequest(id, el.dataset.request) : requests(id).filter((r) => sent(r) && r.offerId === cost?.offer && r.amount === cost?.amount).at(-1);
  }
  function openConfirmation(el) {
    const id = el.dataset.id, request = requestForConfirmation(el);
    if (!sent(request)) return TN.toast('Record the externally sent booking request first.', 'danger');
    const eligible = eligibility(id, request.rowId);
    if (!requestMatches(request, eligible)) return TN.toast(eligible.reason || 'The booking request refers to a different supplier or cost version.', 'danger');
    const proofs = P.work(id).files.filter((f) => f.requestId === request.id && f.dataUrl);
    TN.drawer({ title: 'Record Confirmation', description: `${eligible.s.title} · ${request.id}`,
      body: `<form id="booking-confirmation-form" data-act="pur-booking-save-confirmation" data-id="${esc(id)}" data-request="${esc(request.id)}" class="booking-form" novalidate><div data-booking-error hidden role="alert" tabindex="-1"></div>
        <p>Record the hotel/supplier reply and attach its confirmation email as a PDF or screenshot.</p>
        ${field('number', 'Confirmation number', input('number', '', 'text', 'maxlength="120"'))}
        ${field('supplierNumber', 'Supplier confirmation number (required for Supplier/DMC)', input('supplierNumber', '', 'text', 'maxlength="120"'))}
        ${field('confirmedAt', 'Confirmation date and time', input('confirmedAt', '', 'datetime-local'))}
        ${field('confirmedBy', 'Confirmed by (hotel / supplier)', input('confirmedBy', '', 'text', 'maxlength="120"'))}
        ${field('contact', 'Contact email or phone', input('contact', '', 'text', 'maxlength="254"'))}
        ${field('replyMessageId', 'Reply Message-ID (if available)', input('replyMessageId', '', 'text', 'maxlength="500"'))}
        ${field('proof', 'Upload confirmation proof', input('proof', '', 'file', 'accept="application/pdf,image/jpeg,image/png,image/webp"'))}<small>PDF or screenshot (JPG, PNG, WebP), up to 4 MB.</small>
        ${proofs.length ? field('proofId', 'Previously uploaded proof', `<select id="bk-proofId" name="proofId">${proofs.map((p) => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('')}</select>`) : ''}
      </form>`, footer: '<div class="booking-actions"><button type="submit" form="booking-confirmation-form" class="button secondary" data-mode="proof">Save proof only</button><button type="submit" form="booking-confirmation-form" class="button" data-mode="confirm">Save confirmation</button></div>' });
    if (el.dataset.focus === 'proof') document.getElementById('bk-proof').focus();
  }
  TN.act('pur-booking-save-confirmation', async (form, event) => {
    if (form.dataset.busy === 'true' || form.dataset.saved === 'true') return;
    const id = form.dataset.id, request = findRequest(id, form.dataset.request), f = new FormData(form);
    if (!sent(request)) return error(form, 'A sent booking request is required.');
    const proofOnly = event?.submitter?.dataset.mode === 'proof';
    const values = Object.fromEntries(['number', 'supplierNumber', 'confirmedAt', 'confirmedBy', 'contact', 'replyMessageId'].map((key) => [key, String(f.get(key) || '').trim()]));
    if (!proofOnly && request.rateSource === 'supplier' && !values.supplierNumber) return error(form, 'Enter the Supplier / DMC confirmation number.');
    if (!proofOnly && (!values.number || !dateValid(values.confirmedAt) || !values.confirmedBy || !values.contact || (!emailValid(values.contact) && !/^[+\d][\d\s().-]{5,39}$/.test(values.contact)))) return error(form, 'Enter the confirmation number, valid date/time, confirmer name and contact email or phone.');
    if (!proofOnly && Date.parse(values.confirmedAt) < Date.parse(request.sentAt)) return error(form, 'Confirmation cannot be dated before the booking request was sent.');
    busy(form, true);
    try {
      const file = form.querySelector('[name="proof"]')?.files?.[0];
      const uploaded = file ? await readFile(file) : null;
      const existing = P.work(id).files.find((p) => p.id === f.get('proofId') && p.requestId === request.id && p.taskId === id && p.dataUrl);
      if (!uploaded && !existing) throw Error('Upload the confirmation email as a PDF or screenshot.');
      const checked = eligibility(id, request.rowId);
      if (!requestMatches(request, checked)) throw Error(checked.reason || 'The agreed cost or supplier changed. This request needs review.');
      if (confirmations(id).some((c) => c.requestId === request.id)) throw Error('Confirmation was already recorded.');
      transaction(id, (w, s) => {
        const proof = uploaded ? { ...uploaded, bytes: uploaded.size, size: `${Math.ceil(uploaded.size / 1024)} KB`, kind: 'supplier_confirmation', state: 'stored', taskId: id,
          requestId: request.id, supplierId: request.supplierId, at: stamp(), by: person() } : existing;
        if (uploaded) w.files.push(proof);
        const storedRequest = w.bookingRequests.find((r) => r.id === request.id);
        storedRequest.proofIds = [...new Set([...(storedRequest.proofIds || []), proof.id])];
        if (proofOnly) return;
        const confirmation = { id: uid('confirmation'), requestId: request.id, taskId: id, hotelId: request.hotelId,
          supplierId: request.supplierId, rowId: request.rowId, rateId: request.rateId, ...values,
          proofId: proof.id, status: 'confirmed', recordedAt: stamp(), recordedBy: person() };
        (w.bookingConfirmations ||= []).push(confirmation);
        const cost = checked.cost;
        const v = Math.max(...w.costs.map((c) => c.v)) + 1;
        w.costs.push({ ...cost, v, stage: 'committed', requestId: request.id, confirmationId: confirmation.id, at: stamp(), by: person() });
        if (w.approvals[cost.v]) w.approvals[v] = { ...w.approvals[cost.v], carriedFrom: cost.v };
        w.offers.find((o) => o.id === request.offerId).status = 'selected';
        Object.assign(s, { taskStatus: 'supplier_confirmed', confirmationNo: values.supplierNumber || values.number, hotelConfirmationNo: values.number,
          hotelConfirmedBy: values.confirmedBy, hotelConfirmedPhone: values.contact });
        w.confirmedAt = confirmation.recordedAt; w.confirmedBy = person();
        w.history.push({ text: `Booking confirmed: ${values.number}; request ${request.id}`, at: stamp(), by: person() });
        w.emails.push({ id: uid('reply'), taskId: id, requestId: request.id, confirmationId: confirmation.id,
          dir: 'in', kind: 'reply_confirmed', from: values.contact, to: request.from,
          subject: `Confirmation ${values.number}`, body: `Manually recorded confirmation from ${values.confirmedBy}. See attached proof.`,
          messageId: values.replyMessageId || null, inReplyTo: request.providerMessageId, proofId: proof.id,
          at: values.confirmedAt.replace('T', ' '), by: person(), status: 'manually_recorded' });
      });
      form.dataset.saved = 'true'; TN.closeOverlay();
      TN.toast(proofOnly ? 'Proof saved. Booking is not confirmed yet.' : 'Booking confirmation and proof saved.'); TN.refresh();
    } catch (e) { error(form, `${e.message} If browser storage is full, use a smaller proof file.`); }
    finally { busy(form, false); }
  });
  TN.act('pur-booking-view-proof', (el) => {
    const id = el.dataset.id, s = TN.service(id);
    if (!s || !(TN.is('purchase') || TN.is('manager') || TN.is('accounts') || TN.is('checker'))) return;
    const proof = P.work(id)?.files.find((p) => p.id === el.dataset.proof && p.taskId === id);
    if (!proof?.dataUrl) return TN.toast('Proof content is unavailable.', 'danger');
    const download = `<a class="button secondary" href="${esc(proof.dataUrl)}" download="${esc(proof.name)}">Download ${esc(proof.name)}</a>`;
    TN.dialog({ title: proof.kind === 'quote' ? 'Rate reply proof' : 'Confirmation Proof', body: proof.type.startsWith('image/') ? `<img class="booking-proof-image" src="${esc(proof.dataUrl)}" alt="${esc(proof.name)}"/>${download}` : `<object class="booking-proof-pdf" type="application/pdf" data="${esc(proof.dataUrl)}">${download}</object>${download}`, footer: '<button type="button" class="button secondary" data-close>Close</button>' });
  });
  TN.act('pur-booking-view-request', (el) => {
    if (!(TN.is('purchase') || TN.is('manager') || TN.is('accounts') || TN.is('checker'))) return;
    const r = findRequest(el.dataset.id, el.dataset.request); if (!r) return;
    TN.drawer({ title: 'Booking request history', body: `<p>${esc(r.status === 'sent' ? 'Sent with mail provider' : r.status === 'manual_sent' ? 'Sent externally; recorded manually' : 'Draft only; not sent')}</p><p>Request: ${esc(r.id)}<br/>To: ${esc(r.to)}<br/>From: ${esc(r.from)}<br/>Sent: ${esc(r.sentAt || 'Not sent')}<br/>Recorded by: ${esc(r.recordedBy)}<br/>Mailbox reference: ${esc(r.manualReference || '—')}<br/>Message-ID: ${esc(r.providerMessageId || 'Not supplied')}</p><strong>${esc(r.subject)}</strong><pre class="booking-message">${esc(r.body)}</pre>${(r.attachments || []).map((a) => `<a href="${esc(a.dataUrl)}" download="${esc(a.name)}">${esc(a.name)}</a>`).join('')}`, footer: '<button type="button" class="button secondary" data-close>Close</button>' });
  });
  TN.act('pur-booking-request', openRequest);
  TN.act('pur-booking-confirm', openConfirmation);
  TN.purchaseBooking = { eligibility, cells, openRequest, openConfirmation, confirmationComplete, transaction, readFile, validConfirmation };
})();
