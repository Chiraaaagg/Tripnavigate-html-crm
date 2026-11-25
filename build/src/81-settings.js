/* =====================================================================
   Agent E (redesign 16 Nov 2026) · Settings: every /app/admin/* area and
   TN.settingsTabs(role). Layout from the design plan 1.4: area list on the
   left (desktop), a select on phones, Overview landing, one switch row (C6)
   and one confirm dialog with an optional reason (C7, owner answer D9).
   Uses the markup helpers in TN.hm (80-manager.js) and, when present, the
   shared TN.ui.switchRow / TN.confirmChange from 11-ui.js.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const H = () => TN.hm;
  const D = TN.DATA;
  const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const ICN = 'mt-0.5 size-3.5 shrink-0 text-faint';

  /* ---------------------------------------------------------------
     Areas (one name used in the list, the heading and the address)
     Super Admin: every area. Accounts and the Accounts checker: Imports
     only (live canImport, customer list). Everyone else: none.
     --------------------------------------------------------------- */
  const AREAS = [
    { key: 'overview', label: 'Overview', icon: 'settings', href: '#/app/admin', line: 'Changes here affect every branch. Every change is recorded with the person and the time.' },
    { key: 'people', label: 'People and access', icon: 'users', href: '#/app/admin/staff', line: 'Staff accounts, their roles and branches, and extra access to deals.' },
    { key: 'company', label: 'Company and branches', icon: 'building-2', href: '#/app/admin/company', line: 'Printed on quotations, itineraries, Invoices and vouchers. Read only.' },
    { key: 'money', label: 'Money rules', icon: 'landmark', href: '#/app/admin/finance-policy', line: 'Receipt and cash limits, and the payment modes Accounts can record.' },
    { key: 'bitrix', label: 'Bitrix connection', icon: 'refresh-cw', href: '#/app/admin/integration', line: 'How the CRM reads from Bitrix. Nothing is written back except ID proofs.' },
    { key: 'features', label: 'Features', icon: 'list-checks', href: '#/app/admin/workflow', line: 'Switch CRM features on or off for every branch.' },
    { key: 'messages', label: 'Customer messages', icon: 'message-square', href: '#/app/admin/customer-messages', line: 'The nine booking messages customers get by WhatsApp and e-mail. Every message is in English.' },
    { key: 'emails', label: 'E-mails', icon: 'mail', href: '#/app/admin/emails', line: 'Staff and supplier e-mail templates, and whether e-mails arrive.' },
    { key: 'reminders', label: 'Reminders', icon: 'alarm-clock', href: '#/app/admin/reminders', line: 'When staff get reminders, and when late work goes to the branch Manager.' },
    { key: 'imports', label: 'Imports', icon: 'file-spreadsheet', href: '#/app/admin/imports', line: 'Hotel and customer lists from a CSV file: check first, then import.' },
    { key: 'health', label: 'System health', icon: 'activity', href: '#/app/admin/bookings', line: 'Bookings, PDFs, e-mail alerts, Bitrix updates and backups. Read only.' },
  ];
  TN.settingsTabs = (role) => {
    if (role === 'admin') return AREAS.map((a) => ({ href: a.href, label: a.key === 'overview' ? 'Settings' : a.label }));
    if (role === 'accounts' || role === 'checker') return [{ href: '#/app/admin/imports?kind=customer', label: 'Imports' }];
    return [];
  };
  const isAdmin = () => TN.is('admin');

  const navLink = (a, cur) => `<li class="m-0"><a${cur ? ' aria-current="page"' : ''} class="flex min-h-9 w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 text-base font-medium text-copy no-underline hover:bg-wash hover:text-ink aria-[current=page]:bg-brand-tint aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep ${FOCUS}" href="${a.href}">${TN.ic(a.icon, 'size-4 shrink-0 ' + (cur ? 'text-brand' : 'text-quiet'))}<span class="min-w-0 flex-1">${esc(a.label)}</span></a></li>`;

  /** Settings frame. o: { title, line, actions, sub, body } (strings of html). */
  function frame(key, o) {
    const h = H();
    const area = AREAS.find((a) => a.key === key);
    const header = h.pageHeader({ eyebrow: 'Settings', title: o.title || area.label, desc: esc(o.line || area.line), actions: o.actions, mb: 'mb-0' });
    const content = `${header}${o.sub || ''}<div class="flex min-w-0 flex-col gap-5">${o.body}</div>`;
    if (!isAdmin()) return `<div class="flex flex-col gap-5 font-sans text-base text-copy" data-slot="settings-frame">${content}</div>`;
    const nav = `<nav aria-label="Settings areas" class="hidden lg:block"><ul class="m-0 flex list-none flex-col gap-0.5 p-0">${AREAS.map((a) => navLink(a, a.key === key)).join('')}</ul></nav>`;
    const pick = `<div class="lg:hidden">${h.select({ id: 'settings-area', label: 'Settings area', value: area.href, change: 'settings-area', options: AREAS.map((a) => ({ value: a.href, label: a.label })) })}</div>`;
    return `<div class="grid gap-6 font-sans text-base text-copy lg:grid-cols-[16rem_minmax(0,1fr)]" data-slot="settings-frame">${nav}<div class="flex min-w-0 flex-col gap-5">${pick}${content}</div></div>`;
  }
  TN.act('settings-area', (el) => { if (el.value) location.hash = el.value; });
  const areaPage = (path, key, render, roles) => TN.page(path, { nav: '/app/admin', roles: roles || ['admin'], title: (AREAS.find((a) => a.key === key) || {}).label, render: (p, q) => frame(key, render(p, q)) });
  const subTabs = (label, items) => H().navTabs(label, items);
  const block = (title, body, o = {}) => H().card({ title: esc(title), desc: o.desc, aside: o.aside, bodyClass: o.bodyClass ?? '', body, level: 2, id: o.id });
  const rowsList = (rows, label) => `<ul class="m-0 list-none divide-y divide-line p-0"${label ? ` aria-label="${esc(label)}"` : ''}>${rows}</ul>`;

  /* ---------------------------------------------------------------
     Shared settings data (invented)
     --------------------------------------------------------------- */
  const SUPER = { anjali: 'Anjali Kapoor', harsh: 'Harshvardhan Chouhan', nikhil: 'Nikhil Arora' };
  D.settings = D.settings || {};
  const S = D.settings;
  S.backup = S.backup || { at: '2026-10-27 02:10', kind: 'Supabase daily backup', keep: '7 days' };
  S.staff = S.staff || [
    ...Object.entries(TN.PEOPLE).map(([k, p]) => ({ key: k, name: p.name, email: p.name.toLowerCase().replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '.') + '@holidaychacha.in', role: p.role === 'Branch Manager' ? 'Manager' : p.role === 'Visa and passport' ? 'Visa' : p.role, branch: p.branch, status: 'active', mfa: true, lastEmail: 'Invitation accepted' })),
    { key: 'su-harsh', name: SUPER.harsh, email: 'harshvardhan.chouhan@holidaychacha.in', role: 'Super Admin', branch: 'Jodhpur', status: 'active', mfa: true, lastEmail: 'Invitation accepted' },
    { key: 'su-nikhil', name: SUPER.nikhil, email: 'nikhil.arora@holidaychacha.in', role: 'Super Admin', branch: 'Jodhpur', status: 'active', mfa: true, lastEmail: 'Password reset e-mail handed to the mail service on 22 Oct 2026, 11:05 am IST' },
    { key: 'x-rohit', name: 'Rohit Sankhla', email: 'rohit.sankhla@holidaychacha.in', role: 'Super Admin', branch: '', status: 'deactivated', mfa: true, lastEmail: 'No e-mail sent from this CRM yet' },
    { key: 'x-tanvi', name: 'Tanvi Bohra', email: 'tanvi.bohra@holidaychacha.in', role: 'Sales', branch: 'Jodhpur', status: 'invited', mfa: false, lastEmail: 'Invitation resent (attempt 2): handed to the mail service on 26 Oct 2026, 4:15 pm IST', failure: { text: 'The first invitation was not delivered: the mail service did not answer. The CRM tried again.', code: 'provider_unavailable:503' } },
  ];
  S.grants = S.grants || [
    { id: 'g1', who: 'Vikram Rathore', perm: 'View deals', scope: 'Jodhpur branch', reason: 'Branch Manager reads every Jodhpur deal, including those owned by Sales on leave.', expires: 'No expiry' },
    { id: 'g2', who: 'Sunil Mehta', perm: 'See prices and margin', scope: 'Whole entity (Holiday Chacha Pvt LTD)', reason: 'Accounts checks selling price against receipts for every branch.', expires: '31 Mar 2027' },
  ];
  S.roleHistory = S.roleHistory || [
    { at: '2026-10-22 16:40', by: SUPER.anjali, who: 'Sunil Mehta', text: 'Branch Delhi added (Accounts checks Delhi receipts in the pilot).', reason: 'Owner asked Sunil to cover Delhi until the Delhi Accounts person joins.' },
  ];
  S.policy = S.policy || {
    versions: [{ v: 1, status: 'in force', effective: '13 Oct 2026, 12:00 am IST', saved: '12 Oct 2026, 06:40 pm IST', by: SUPER.anjali, receiptMax: 1000000, cashDay: 199999, cashTrip: 199999, depositDays: 1, count: true, reason: 'Owner APPROVE 12 Oct: money rules for the Jodhpur pilot as agreed with the CA.' }],
    ceilings: { cash: 199999, receipt: 10000000 },
  };
  // Sunil Mehta already covers Delhi (see roleHistory above).
  { const sunil = S.staff.find((p) => p.key === 'checker'); if (sunil && !sunil.branches) sunil.branches = ['Jodhpur', 'Delhi']; }

  /* Switch registry. effect = one line on the row; detail = the longer text behind "More"; who = who is affected. */
  const last = (at, by, to, reason) => ({ at, by, to, reason });
  S.sw = S.sw || {
    service_items_enabled: { title: 'Book now (service list)', effect: 'New bookings list each sold service and make one task per service.', who: 'Sales, Purchase, Flight and Visa in every branch', detail: 'New bookings list each sold service; submitting creates one task per service.', state: 'on', last: last('2026-10-20 14:45', SUPER.harsh, 'on', 'Owner APPROVE in chat on 20 Oct: Book now with the service list for Jodhpur.') },
    won_deal_count: { title: 'Count of won deals with no booking (on Home)', effect: 'Home shows how many won deals have no booking yet.', who: 'Sales and branch Managers', detail: 'Sales and branch Managers see on Home how many deals reached “Won - Payment Received” in Bitrix but have no booking yet. Count only; nothing is created.', state: 'on', last: last('2026-10-20 16:10', SUPER.anjali, 'on', 'Owner APPROVE 20 Oct: show won deals without a booking on Home.') },
    visa_passport_tasks_enabled: { title: 'Visa and passport tasks', effect: 'Each sold visa or passport service gets a task for the Visa and passport desk.', who: 'Sales and the Visa and passport desk', detail: 'On: each sold visa or passport service gets one task for the Visa and passport desk. Off: those services are saved and wait; no task is created or deleted.', state: 'on', last: last('2026-10-24 12:50', SUPER.anjali, 'on', 'Owner APPROVE 24 Oct: Visa and passport desk for the pilot.') },
    prefill_auto_fill: { title: 'Fill new bookings and quotations from Bitrix', effect: 'Empty fields of new bookings and quotations are filled once from Bitrix.', who: 'Sales and branch Managers', detail: 'On: when staff start a booking or create a quotation, empty fields get the Bitrix dates and contact details once, marked “From Bitrix”. Nothing is filled later, on reload, or over what staff typed.', state: 'on', last: last('2026-10-27 13:47', SUPER.nikhil, 'on', 'Owner APPROVE 27 Oct: fill new bookings from Bitrix once.') },
    referral_drafts: { title: 'Referral drafts', effect: 'Sales can start quotations for customers not in Bitrix yet.', who: 'Sales and branch Managers', detail: 'On: Sales and branch Managers can start quotations and itineraries for customers not in Bitrix yet. Until a draft is linked to a Bitrix lead or deal, only its owner and the branch Manager can open it.', state: 'off', last: null },
    bitrix_trip_facts_read: { title: 'Read trip facts from Bitrix', effect: 'Bookings and quotations read trip facts from Bitrix. Nothing is written to Bitrix.', who: 'Sales and branch Managers', detail: 'Reads Booking Notes, traveller count, tour dates, Customer Type and the linked contact from Bitrix for bookings and quotations. Read only: nothing is written to Bitrix. “Fill new bookings and quotations from Bitrix” needs this switch on.', state: 'on', last: last('2026-10-14 13:00', SUPER.anjali, 'on', 'Owner APPROVE 14 Oct: read trip facts for bookings and quotations.') },
    lead_intake_unowned: { title: 'Bring in leads whose Bitrix owner is not a CRM salesperson', effect: 'Those leads come in and wait for an owner.', who: 'Everyone: it changes which leads are in the CRM', detail: 'Leads whose Bitrix owner is not a CRM salesperson come into the CRM and wait for an owner. Off: they are skipped.', state: 'on', last: last('2026-10-16 10:20', SUPER.nikhil, 'on', 'Owner APPROVE 16 Oct: bring in unowned leads so the Manager can hand them out.') },
    bitrix_id_proof_copy: { title: 'Copy ID proofs to the Bitrix deal', effect: 'Each ID proof stored from now on is also added to the linked Bitrix deal.', who: 'Sales, and the linked Bitrix deal', detail: 'Adds each ID proof stored from now on to the “Aadhar and Passports” field of the linked Bitrix deal. It only adds files; it never deletes or replaces files in Bitrix. Proofs stored earlier are not copied.', state: 'on', last: last('2026-10-22 17:30', SUPER.harsh, 'on', 'Owner APPROVE 22 Oct (DEC-43): copy ID proofs to Bitrix.') },
    bitrix_names: { title: 'Bitrix names', effect: 'Lists show Bitrix stage, status and source names.', who: 'Everyone who opens Leads and Deals', detail: 'Shows Bitrix stage, status and source names. Read-only; nothing is written to Bitrix.', state: 'on', last: last('2026-10-20 11:15', SUPER.anjali, 'on', 'Owner APPROVE 20 Oct: show Bitrix names.') },
    // Big switches: Super Admin with two-step sign-in only.
    real_booking: { big: true, title: 'Real bookings', effect: 'Sales can submit real bookings for the Accounts review.', who: 'Sales, Accounts and every desk in the pilot branch', detail: 'On: Sales can submit real bookings for Accounts review and the departments get tasks. Off: real Deals stay as drafts.', state: 'on', last: last('2026-10-13 10:05', SUPER.harsh, 'on', 'Owner APPROVE 13 Oct: real bookings for the Jodhpur pilot.'), history: [] },
    supplier_confirmation: { big: true, title: 'Supplier confirmation', effect: 'Purchase can record supplier offers, costs and confirmations on real bookings.', who: 'Purchase, Accounts and the branch Manager', detail: 'On: Purchase can add supplier offers, costs and files on real bookings and record the supplier’s confirmation. A confirmed supplier cannot be undone. Off: those steps are refused; tasks can still be taken and suppliers added.', state: 'off', last: null, history: [], checks: true },
    pay_bank: { big: true, pay: true, title: 'Bank transfer', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_upi: { big: true, pay: true, title: 'UPI', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_cash: { big: true, pay: true, title: 'Cash', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_cheque: { big: true, pay: true, title: 'Cheque', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
  };
  /* D12: the staff notices (bell) switch lives in Features. */
  S.sw.staff_notices = S.sw.staff_notices || { title: 'Staff notices (the bell)', effect: 'Staff get their reminders and notices in the bell.', who: 'Everyone in every branch', detail: 'On: every person sees the bell with their reminders and notices, urgent ones first. Off: no new notices are shown; nothing already recorded is deleted. Customer messages are separate: see Customer messages.', state: 'on', last: last('2026-10-26 18:05', SUPER.anjali, 'on', 'Owner APPROVE 26 Oct: staff notices for every branch.') };
  ['pay_bank', 'pay_upi', 'pay_cash', 'pay_cheque'].forEach((k) => { const sw = S.sw[k]; sw.effect = sw.effect || `Accounts can record ${sw.title.toLowerCase() === 'upi' ? 'UPI' : sw.title.toLowerCase()} receipts.`; sw.who = sw.who || 'Accounts in every branch'; });
  const REVIEW = {
    service_items_enabled: ['New bookings list each sold service; submitting creates one task per service.', 'New bookings go back to the single booking form. Bookings already made keep their services.'],
    won_deal_count: ['Home shows the count of won deals with no booking to Sales and branch Managers.', 'Home stops showing the count. Nothing else changes.'],
    visa_passport_tasks_enabled: ['Switching on now creates 0 Visa and passport tasks: no sold visa or passport service is waiting.', 'Switching off creates and deletes nothing. Tasks already made stay with the desk. New visa and passport services wait without a task.'],
    prefill_auto_fill: ['Empty fields of new bookings and quotations get the Bitrix dates and contact details once.', 'Nothing is filled from Bitrix any more. What staff typed stays.'],
    referral_drafts: ['Sales and branch Managers can start quotations and itineraries for customers not in Bitrix yet.', 'No new referral drafts. Drafts already made stay readable.'],
    staff_notices: ['Every person sees the bell with their reminders and notices again.', 'No new notices are shown in the bell. Nothing already recorded is deleted.'],
    bitrix_trip_facts_read: ['Bookings and quotations read trip facts from Bitrix. Nothing is written to Bitrix.', 'Trip facts are not read. “Fill new bookings and quotations from Bitrix” stops filling.'],
    lead_intake_unowned: ['Leads whose Bitrix owner is not a CRM salesperson come in and wait for an owner.', 'Those leads are skipped from the next sync.'],
    bitrix_id_proof_copy: ['Each ID proof stored from now on is added to the linked Bitrix deal. Nothing is deleted in Bitrix.', 'ID proofs are no longer copied to Bitrix. Copies already made stay in Bitrix.'],
    bitrix_names: ['Lists, Lead and Deal pages show Bitrix stage, status and source names after the next daily read. Nothing is written to Bitrix.', 'Lists show the stage codes again. Nothing is written to Bitrix.'],
    real_booking: ['Sales can submit real bookings. Accounts reviews each one and the departments get their tasks.', 'New real bookings stay as drafts. Bookings already submitted keep going.'],
    supplier_confirmation: ['Purchase can enter offers, costs and the supplier’s confirmation on real bookings. A confirmed supplier cannot be undone: the record and its cost are locked for good.', 'New offers, costs, files and confirmations stop at once. Anything already confirmed stays confirmed and locked.'],
    pay: (t) => [`Accounts can record ${t} receipts again.`, `Accounts can no longer record new ${t} receipts. Receipts already recorded, verified or waiting stay as they are.`],
  };

  const meName = () => TN.me().name;
  const fmtAt = (s) => TN.fmt.dateTime(s);
  const dayOf = (s) => TN.fmt.date(String(s).slice(0, 10));

  /* ---------------------------------------------------------------
     C7 confirm dialog (one for every change). Uses TN.confirmChange when
     the dialog has nothing but the reason; otherwise the same layout here
     (title, one sentence of effect, who is affected, extra fields,
     optional reason, Cancel focused first, one confirm button).
     o: { title, effect (html), affected (html), confirmLabel, danger,
          extra(st) -> html, blocked (text), reasonRequired, reasonLabel,
          reasonError, onConfirm(reason, formData) -> { error, fieldErrors, focus } | { toast }, returnFocus }
     --------------------------------------------------------------- */
  let pending = null;
  function changeDialog(o, st = {}) {
    const h = H();
    if (!o.extra && !o.blocked && !o.reasonRequired && !st.error && TN.confirmChange) {
      TN.confirmChange({ title: o.title, effect: o.effect, affected: o.affected, confirmLabel: o.confirmLabel, tone: o.danger ? 'danger' : undefined,
        onConfirm: (reason) => { const res = o.onConfirm(String(reason || '').replace(/\s+/g, ' ').trim(), new FormData()) || {}; if (res.error) { TN.toast('Not changed', 'danger', res.error); return; } done(o, res); } });
      return;
    }
    pending = o;
    const body = `<form id="chg-form" data-act="chg-submit" class="flex flex-col gap-4" novalidate>`
      + (st.error ? h.notice('danger', `<p>${esc(st.error)}</p>`, { role: 'alert', id: 'chg-error' }) : '')
      + `<p class="m-0 text-copy">${o.effect}</p>`
      + (o.affected ? `<p class="m-0 text-sm text-quiet"><span class="font-semibold text-ink">Who is affected: </span>${o.affected}</p>` : '')
      + (o.extra ? o.extra(st) : '')
      + h.textarea({ id: 'chg-reason', name: 'reason', label: o.reasonLabel || 'Reason', optional: !o.reasonRequired, rows: 3, hint: o.reasonRequired ? '10 to 500 characters. It is kept with the change.' : 'Kept with the change, with your name and the time.', value: st.values ? st.values.reason : '', error: st.reasonError })
      + `</form>`;
    const footer = `${o.blocked ? `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet sm:mr-auto" id="chg-blocked">${h.ic('lock', ICN)}<span>${esc(o.blocked)}</span></p>` : ''}`
      + h.btn('Cancel', { attrs: ' data-close id="chg-cancel"' })
      + h.btn(esc(o.confirmLabel), { variant: o.danger ? 'danger' : 'primary', type: 'submit', extra: 'h-auto min-h-10 max-w-full py-2 whitespace-normal', attrs: ` form="chg-form"${o.blocked ? ' disabled aria-describedby="chg-blocked"' : ''}` });
    const focus = '#' + (st.focus || 'chg-cancel');
    if (TN.ui && TN.ui.dialog && TN.openOverlay) TN.openOverlay(TN.ui.dialog({ title: o.title, body, footer, tone: o.danger ? 'danger' : undefined }).replace('role="dialog"', 'role="alertdialog"'), { focus });
    else { TN.dialog({ title: o.title, body, footer, tone: o.danger ? 'danger' : undefined }); setTimeout(() => { const el = document.querySelector(focus); if (el) el.focus(); }, 0); }
  }
  function done(o, res) {
    pending = null;
    if (document.querySelector('#tn-overlay > *')) TN.closeOverlay();
    TN.refresh();
    if (res && res.toast) TN.toast(res.toast, res.tone || 'success');
    if (o.returnFocus) setTimeout(() => { const a = document.activeElement; if (a && a !== document.body && a.id !== 'main' && a.isConnected) return; const el = document.getElementById(o.returnFocus) || document.querySelector(`[data-key="${o.returnFocus.replace(/^sw-btn-/, '')}"] [data-act]`); if (el) el.focus(); }, 0);
  }
  TN.act('chg-submit', (f) => {
    const o = pending; if (!o) return;
    const fd = new FormData(f);
    const values = {}; for (const [k, v] of fd.entries()) values[k] = k in values ? [].concat(values[k], v) : v;
    const reason = String(values.reason || '').replace(/\s+/g, ' ').trim();
    if (o.reasonRequired && !H().reasonOk(reason)) { changeDialog(o, { values, reasonError: o.reasonError || 'Say why, in 10 to 500 characters.', focus: 'chg-reason' }); return; }
    const res = o.onConfirm(reason, fd) || {};
    if (res.error || res.fieldErrors) { changeDialog(o, { values, error: res.error, fieldErrors: res.fieldErrors, focus: res.focus || (res.error ? 'chg-error' : undefined) }); return; }
    done(o, res);
  });

  /* ---------------------------------------------------------------
     C6 switch row: name · one-line effect · state in words · last change ·
     "Change". Longer text, the last reason and the history sit behind "More".
     --------------------------------------------------------------- */
  const PARAMS = {}; // key -> numeric rule (Reminders)
  function moreHtml(sw, o) {
    const hist = (sw.history || []).length ? sw.history : (sw.last ? [sw.last] : []);
    const parts = [];
    if (sw.detail) parts.push(`<p>${esc(sw.detail)}</p>`);
    if (o.moreExtra) parts.push(o.moreExtra);
    if (hist.length) parts.push(`<div><p class="font-medium text-ink">Changes</p><ul class="m-0 mt-1 flex list-none flex-col gap-1 p-0">${hist.map((x) => `<li>${fmtAt(x.at)} · ${esc(x.by)} · ${x.param ? esc(x.param) : 'switched ' + esc(x.to)}${x.reason ? ` · “${esc(x.reason)}”` : ' · no reason given'}</li>`).join('')}</ul></div>`);
    return parts.join('');
  }
  function swRow(key, o = {}) {
    const h = H();
    const sw = o.sw || S.sw[key];
    const canChange = !o.readOnly && isAdmin();
    const lastObj = sw.last ? { who: sw.last.by === meName() ? 'you' : sw.last.by, when: dayOf(sw.last.at) } : null;
    const more = moreHtml(sw, o);
    const disabledReason = canChange ? (o.disabledReason || null) : (o.lockText || 'Changed by a Super Admin.');
    if (TN.ui && TN.ui.switchRow) {
      return `<li class="m-0" data-slot="setting-row" data-key="${key}">${TN.ui.switchRow({ id: 'sw-' + key, name: esc(sw.title), effect: esc(o.effect || sw.effect || '') + (o.valueLine ? `<span class="mt-0.5 flex items-start gap-1.5">${h.ic('clock', ICN)}<span>${o.valueLine}</span></span>` : ''), more, state: sw.state, last: lastObj, act: o.act || 'sw-change', data: { key }, disabledReason: disabledReason ? esc(disabledReason) : null })}</li>`;
    }
    const lastLine = lastObj ? `Last change: ${esc(lastObj.who)}, ${esc(lastObj.when)}` : 'No change recorded yet';
    const btnHtml = h.btn(`Change<span class="sr-only"> ${esc(sw.title)}</span>`, { size: 'sm', act: o.act || 'sw-change', id: key, attrs: ` id="sw-btn-${key}"${disabledReason ? ` disabled aria-describedby="sw-why-${key}"` : ''}` });
    const control = canChange ? btnHtml : '';
    return `<li class="m-0 flex flex-col gap-2 px-4.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4" data-slot="setting-row" data-key="${key}">`
      + `<div class="min-w-0 flex-1"><h3 class="m-0 text-base font-semibold text-ink" id="sw-name-${key}">${esc(sw.title)}</h3>`
      + `<p class="m-0 mt-0.5 text-sm text-copy">${esc(o.effect || sw.effect || '')}</p>`
      + (o.valueLine ? `<p class="m-0 mt-0.5 flex items-start gap-1.5 text-sm text-copy">${h.ic('clock', ICN)}<span>${o.valueLine}</span></p>` : '')
      + `<p class="m-0 mt-1 text-sm text-quiet">${lastLine}</p>`
      + (more ? `<details class="mt-1 text-sm"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">More<span class="sr-only"> about ${esc(sw.title)}</span></summary><div class="mt-1.5 flex flex-col gap-2 text-copy [&_p]:m-0">${more}</div></details>` : '')
      + `</div><div class="flex shrink-0 flex-col items-start gap-1.5 sm:items-end"><div class="flex flex-wrap items-center gap-2">${h.stateBadge(sw.state, sw.title, o.words)}${control}</div>`
      + (disabledReason ? `<p class="m-0 flex max-w-xs items-start gap-1.5 text-sm text-quiet" id="sw-why-${key}">${h.ic('lock', ICN)}<span>${esc(disabledReason)}</span></p>` : '')
      + `</div></li>`;
  }

  /** Safety checks before supplier confirmation can be switched on. */
  function supplierChecks() {
    const active = (role) => S.staff.filter((p) => rolesOf(p).includes(role) && p.status === 'active' && p.mfa && branchesOf(p).includes('Jodhpur'));
    const mgr = active('Manager');
    const backupAge = TN.fmt.daysFrom(S.backup.at.slice(0, 10));
    return [
      { ok: true, label: 'Accounts go-ahead before supplier booking', text: 'Built and on: Purchase waits for the Accounts go-ahead on every hotel.' },
      { ok: mgr.length > 0, label: 'Branch Manager in Jodhpur', text: mgr.length ? `${mgr.map((p) => p.name).join(', ')}, with two-step sign-in` : 'None. Above-budget costs and supplier bank details could never be approved.' },
      { ok: active('Purchase').length >= 1, label: 'Purchase staff', text: `${active('Purchase').length} active with two-step sign-in` },
      { ok: active('Accounts').length >= 2, label: 'Accounts approvers', text: `${active('Accounts').length} active: one records, a different one verifies` },
      { ok: backupAge >= -1, label: 'Recent backup', text: `${S.backup.kind}, ${fmtAt(S.backup.at)} (kept ${S.backup.keep})` },
    ];
  }
  const checklist = (checks) => `<ul class="m-0 flex list-none flex-col gap-1.5 p-0 text-sm" aria-label="Safety checks">${checks.map((c) => `<li class="m-0 flex items-start gap-1.5">${H().ic(c.ok ? 'circle-check' : 'circle-x', `mt-0.5 size-3.5 shrink-0 ${c.ok ? 'text-status-success' : 'text-status-danger'}`)}<span><span class="font-semibold text-ink">${esc(c.label)}${c.ok ? '' : ' (missing)'}: </span>${esc(c.text)}</span></li>`).join('')}</ul>`;

  /** Who may change a switch. Returns a refusal sentence or null. */
  function refusal(key) {
    const sw = S.sw[key] || {};
    if (!isAdmin()) return 'Only a Super Admin can change this. Nothing was changed.';
    if (sw.big) { const me = S.staff.find((p) => p.key === 'admin'); if (!me || !me.mfa) return 'Only a Super Admin signed in with two-step sign-in can change this. Nothing was changed.'; }
    return null;
  }

  /** Record a change on a switch. */
  function applySwitch(key, to, reason, paramText) {
    const sw = S.sw[key];
    const no = refusal(key); if (no) return { error: no };
    const at = H().nowStamp();
    const entry = { at, by: meName(), to, reason, param: paramText };
    sw.history = [entry, ...(sw.history || (sw.last ? [sw.last] : []))];
    sw.state = to; sw.last = entry;
    const who = sw.big ? ['admin', 'manager', 'accounts', 'checker', 'purchase', 'sales'] : ['admin'];
    H().notify(who, `${meName()} switched ${sw.title} ${to}${paramText ? ` (${paramText})` : ''}.${reason ? ` Reason: “${reason}”` : ''}`, { href: location.hash });
    return { toast: `${sw.title} is now ${to === 'on' ? 'On' : 'Off'}${paramText ? ` (${paramText})` : ''}. Recorded with your name${reason ? ', the reason' : ''} and the time.` };
  }

  TN.act('sw-change', (el) => {
    const key = el.dataset.key || el.dataset.id; const sw = S.sw[key]; if (!sw) return;
    const P = PARAMS[key];
    const h = H();
    if (P) {
      changeDialog({
        title: `Change ${sw.title}?`, effect: esc(sw.effect || sw.detail || ''), affected: esc(sw.who || 'Staff in every branch'), confirmLabel: `Save ${sw.title}`, returnFocus: 'sw-btn-' + key,
        extra: (st) => { const v = st.values || {}; const fe = st.fieldErrors || {}; const state = v.state || sw.state;
          return h.choiceGroup('Set it to', h.choice('radio', { id: 'chg-on', name: 'state', value: 'on', label: 'On', checked: state === 'on' }) + h.choice('radio', { id: 'chg-off', name: 'state', value: 'off', label: 'Off', checked: state === 'off' }))
            + h.input({ id: 'chg-param', name: 'param', type: 'number', label: P.label, hint: P.hint, value: v.param ?? P.value, attrs: ` min="${P.min}" max="${P.max}" step="1" inputmode="numeric"`, error: fe.param }); },
        onConfirm: (reason, fd) => {
          const n = Number(fd.get('param')); const to = fd.get('state') || sw.state;
          if (!(Number.isInteger(n) && n >= P.min && n <= P.max)) return { fieldErrors: { param: `Enter a whole number from ${P.min} to ${P.max}.` }, focus: 'chg-param' };
          if (to === sw.state && n === P.value) return { toast: `${sw.title} was already ${to} at ${n}. Nothing changed.`, tone: 'info' };
          const no = refusal(key); if (no) return { error: no };
          P.set(n, to);
          return applySwitch(key, to, reason, `${P.label.toLowerCase()}: ${n}`);
        },
      });
      return;
    }
    const to = sw.state === 'on' ? 'off' : 'on';
    const texts = sw.pay ? REVIEW.pay(sw.title === 'UPI' ? 'UPI' : sw.title.toLowerCase()) : REVIEW[key] || [sw.effect, sw.effect];
    const checks = sw.checks && to === 'on' ? supplierChecks() : null;
    const failing = checks && checks.some((c) => !c.ok);
    changeDialog({
      title: `Switch ${to} ${sw.title}?`,
      effect: esc(to === 'on' ? texts[0] : texts[1]),
      affected: esc(sw.who || 'Everyone in every branch'),
      confirmLabel: `Switch ${to} ${sw.title}`,
      danger: !!sw.checks && to === 'on',
      blocked: failing ? 'A safety check is missing, so this cannot be switched on yet.' : null,
      extra: checks || sw.big ? () => (checks ? `<div class="flex flex-col gap-2"><p class="m-0 text-sm font-semibold text-ink">Before it can be switched on</p>${checklist(checks)}</div>` : '') + (sw.big ? `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${h.ic('shield-check', ICN)}<span>You are signed in with two-step sign-in. The change is recorded with your name and the time.</span></p>` : '') : null,
      returnFocus: 'sw-btn-' + key,
      onConfirm: (reason) => {
        if (sw.checks && to === 'on' && supplierChecks().some((c) => !c.ok)) return { error: 'Not changed: a safety check is missing. Nothing was changed.' };
        return applySwitch(key, to, reason);
      },
    });
  });

  /* ---------------------------------------------------------------
     Roles and branches helpers
     --------------------------------------------------------------- */
  const ROLE_LIST = ['Accounts', 'Flight', 'Manager', 'Purchase', 'Sales', 'Super Admin', 'Visa'];
  const BRANCHES = ['Jodhpur', 'Delhi', 'Ahmedabad'];
  const rolesOf = (p) => p.roles || (p.role ? [p.role] : []);
  const branchesOf = (p) => p.branches || (p.branch ? [p.branch] : []);

  /* ---------------------------------------------------------------
     Overview (landing): one row per area with its state
     --------------------------------------------------------------- */
  const msgOnCount = () => S.msg.types.reduce((n, t) => n + (t.email === 'on' ? 1 : 0) + (t.wa === 'on' ? 1 : 0), 0);
  function overviewRows() {
    const h = H();
    const invited = S.staff.filter((p) => p.status === 'invited').length;
    const active = S.staff.filter((p) => p.status === 'active').length;
    const cur = S.policy.versions.find((x) => x.status === 'in force');
    const payOn = ['pay_bank', 'pay_upi', 'pay_cash', 'pay_cheque'].filter((k) => S.sw[k].state === 'on').length;
    const feat = ['service_items_enabled', 'won_deal_count', 'visa_passport_tasks_enabled', 'prefill_auto_fill', 'referral_drafts', 'staff_notices', 'real_booking', 'supplier_confirmation'];
    const featOn = feat.filter((k) => S.sw[k].state === 'on').length;
    const keysMissing = S.msg.keys.filter((k) => !k[1]).length;
    const rulesOn = RULES.filter((x) => D.reminderRules[x.r].on).length;
    const st = (tone, word) => h.badge(tone, word);
    return [
      ['people', invited ? st('warning', 'Needs attention') : st('success', 'All set'), `${active} active staff${invited ? ` · ${TN.fmt.plural(invited, 'invitation')} not accepted yet` : ''}`],
      ['company', st('warning', 'Needs attention'), 'Delhi and Ahmedabad have no GSTIN yet: their final PDFs are blocked.'],
      ['money', st('success', 'In force'), `Version ${cur.v} since ${esc(cur.effective.split(',')[0])} · ${payOn} of 4 payment modes on`],
      ['bitrix', st('success', 'Receiving deals'), `Last run ${fmtAt(S.bitrix.lastRun)} · nothing needs attention`],
      ['features', st('info', `${featOn} of ${feat.length} on`), `Off: ${feat.filter((k) => S.sw[k].state !== 'on').map((k) => esc(S.sw[k].title)).join(', ') || 'nothing'}`],
      ['messages', keysMissing ? st('warning', 'Set-up not finished') : st('success', 'Sending'), `${msgOnCount()} of 18 on · ${S.msg.pilot.on ? `pilot list on (${S.msg.pilot.deals.length} Deals)` : 'every Deal'}${keysMissing ? ` · ${TN.fmt.plural(keysMissing, 'key')} not saved yet` : ''}`],
      ['emails', st('success', 'Delivering'), `${S.mail.sent7} sent in 7 days · ${S.mail.failed7 + S.mail.bounced7} failed`],
      ['reminders', st('info', `${rulesOn} of ${RULES.length} on`), 'Late work goes to the branch Manager after the days set here.'],
      ['imports', st('neutral', 'Nothing running'), `Last: ${esc(S.imports.hotel[0].file)}, ${dayOf(S.imports.hotel[0].at)}`],
      ['health', st(S.sw.real_booking.state === 'on' ? 'success' : 'neutral', `Real bookings ${S.sw.real_booking.state}`), `Backup ${fmtAt(S.backup.at)}`],
    ];
  }
  TN.page('/app/admin', {
    nav: '/app/admin', roles: ['admin', 'accounts', 'checker'], title: 'Settings',
    render: () => {
      if (!isAdmin()) { setTimeout(() => TN.go(TN.settingsTabs(TN.role)[0].href.replace(/^#/, '')), 0); return ''; }
      const h = H();
      const rows = overviewRows().map(([key, badge, text]) => { const a = AREAS.find((x) => x.key === key); return [`<span class="inline-flex items-center gap-2">${TN.ic(a.icon, 'size-4 shrink-0 text-quiet')}${h.link(a.href, esc(a.label))}</span>`, badge, `<span class="text-copy">${text}</span>`]; });
      return frame('overview', { body: block('Every area', h.table({ label: 'Settings areas and their state', caption: 'Settings areas and their state', cols: [{ label: 'Area' }, { label: 'State' }, { label: 'Now' }], rows }), { bodyClass: '' }) });
    },
  });

  /* ---------------------------------------------------------------
     People and access: Staff · Extra access · Roles and branches
     --------------------------------------------------------------- */
  const peopleTabs = (cur) => subTabs('People and access sections', [
    { href: '#/app/admin/staff', label: 'Staff', current: cur === 'staff' },
    { href: '#/app/admin/access', label: 'Extra access', current: cur === 'access' },
    { href: '#/app/admin/roles', label: 'Roles and branches', current: cur === 'roles' },
  ]);

  /* Row menu (details/summary popover like the live account menu). */
  const MENU_ITEM = `flex min-h-10 w-full cursor-pointer items-center gap-2 rounded-control border-0 bg-transparent px-2.5 py-2 text-left font-sans text-base text-copy hover:bg-wash hover:text-ink ${FOCUS}`;
  const rowMenu = (label, items) => `<details class="relative" data-row-menu><summary class="${H().BTN_BASE} border-line-strong bg-card text-ink shadow-none hover:bg-wash h-8 px-2.5 text-sm list-none [&::-webkit-details-marker]:hidden">${TN.ic('ellipsis')}Actions<span class="sr-only"> for ${esc(label)}</span></summary><div class="absolute left-0 sm:left-auto sm:right-0 top-full z-30 mt-1 w-64 rounded-card border border-line bg-card p-2 shadow-raised"><ul class="m-0 flex list-none flex-col gap-0.5 p-0">${items.map((it) => `<li class="m-0"><button type="button" class="${MENU_ITEM}${it.danger ? ' text-status-danger' : ''}" data-act="${it.act}" data-id="${esc(it.id)}"${it.kind ? ` data-kind="${it.kind}"` : ''}>${TN.ic(it.icon, 'size-4 shrink-0')}${esc(it.label)}</button></li>`).join('')}</ul></div></details>`;
  document.addEventListener('toggle', (ev) => {
    const d = ev.target; if (!(d instanceof HTMLDetailsElement) || !d.hasAttribute('data-row-menu') || !d.open) return;
    document.querySelectorAll('details[data-row-menu][open]').forEach((x) => { if (x !== d) x.open = false; });
  }, true);
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    const d = document.activeElement && document.activeElement.closest && document.activeElement.closest('details[data-row-menu][open]');
    if (d) { d.open = false; const s = d.querySelector('summary'); if (s) s.focus(); }
  });
  document.addEventListener('click', (ev) => { document.querySelectorAll('details[data-row-menu][open]').forEach((d) => { if (!d.contains(ev.target)) d.open = false; }); });

  const statusBadge = (p) => (p.status === 'active' ? H().badge('success', 'Active') : p.status === 'invited' ? H().badge('warning', 'Invited, set-up not finished', { icon: 'hourglass' }) : H().badge('neutral', 'Deactivated', { icon: 'circle-off' }));
  let inviteState = null;
  let staffResult = null;
  areaPage('/app/admin/staff', 'people', () => {
    const h = H();
    const counts = ROLE_LIST.map((r) => `${r} ${S.staff.filter((p) => rolesOf(p).includes(r) && p.status === 'active').length}`).join(' · ');
    const rows = S.staff.map((p, i) => {
      const me = p.key === 'admin';
      const items = me || p.status === 'deactivated' ? [] : [
        p.status === 'invited' ? { act: 'staff-email', id: String(i), kind: 'invite', icon: 'send', label: 'Resend invitation' } : { act: 'staff-email', id: String(i), kind: 'reset', icon: 'key-round', label: 'Send password reset e-mail' },
        { act: 'staff-roles', id: p.key, icon: 'user-round-pen', label: 'Change roles and branches' },
        { act: 'staff-deactivate', id: String(i), icon: 'user-x', label: 'Deactivate', danger: true },
      ];
      const security = p.status === 'invited' ? 'Authenticator not set up yet' : p.status === 'deactivated' ? 'No access' : p.mfa ? 'Two-step sign-in on' : 'Password only';
      return `<li class="m-0 flex flex-col gap-2 px-4.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4" data-slot="staff-row">`
        + `<div class="min-w-0 flex-1"><p class="m-0 font-semibold text-ink">${esc(p.name)}${me ? ' <span class="font-normal text-quiet">(you)</span>' : ''}</p><p class="m-0 text-sm wrap-anywhere text-quiet">${esc(p.email)}</p>`
        + `<p class="m-0 mt-1 text-sm text-copy">${p.status === 'deactivated' ? 'No role' : `${esc(rolesOf(p).join(', '))} · ${esc(branchesOf(p).join(', '))}`} · ${esc(security)}</p>`
        + `<p class="m-0 mt-0.5 text-sm text-quiet">${esc(p.lastEmail)}</p>`
        + (p.failure ? `<details class="mt-1 text-sm"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">Details<span class="sr-only"> of the e-mail problem for ${esc(p.name)}</span></summary><p class="m-0 mt-1 text-copy">${esc(p.failure.text)}</p><p class="m-0 text-quiet">Code for the CRM team: <span class="font-mono">${esc(p.failure.code)}</span></p></details>` : '')
        + `</div><div class="flex shrink-0 flex-wrap items-center gap-2">${statusBadge(p)}${items.length ? rowMenu(p.name, items) : '<span class="text-sm text-quiet">No actions</span>'}</div></li>`;
    }).join('');
    return {
      actions: h.btn('Invite staff', { variant: 'primary', act: 'staff-invite-open', icon: 'user-plus', attrs: ' id="staff-invite-open"' }),
      sub: peopleTabs('staff'),
      body: `<div role="status" aria-live="polite" class="empty:hidden">${staffResult ? h.notice(staffResult.tone, `<p>${esc(staffResult.text)}</p>`, { role: 'none' }) : ''}</div>`
        + block('Staff', rowsList(rows, 'Staff in your entities'), { desc: `Active in Jodhpur: ${esc(counts)}.` }),
    };
  });
  function inviteDrawer() {
    const h = H(); const st = inviteState || { values: {}, errors: {} }; const v = st.values; const e = st.errors;
    const body = `<form id="invite-form" data-act="staff-invite" class="flex flex-col gap-4" novalidate>`
      + (Object.keys(e).length ? h.notice('danger', '<p>Not sent. Fix the fields marked below; what you typed is still here.</p>', { role: 'alert' }) : '')
      + `<p class="m-0 text-copy">The person gets an e-mail to choose a password and must set up an authenticator before seeing any data. This CRM can invite: <strong>holidaychacha.in</strong>.</p>`
      + h.input({ id: 'invite-name', name: 'displayName', label: 'Full name', value: v.displayName || '', error: e.displayName, attrs: ' maxlength="120" autocomplete="off"' })
      + h.input({ id: 'invite-email', name: 'email', type: 'email', label: 'Work e-mail', value: v.email || '', error: e.email, attrs: ' autocomplete="off"' })
      + h.select({ id: 'invite-branch', name: 'branch', label: 'Branch', value: v.branch || '', error: e.branch, options: [{ value: '', label: 'Choose a branch' }, { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Jodhpur', label: 'Jodhpur (head office)' }] })
      + h.select({ id: 'invite-role', name: 'role', label: 'Role', value: v.role || '', error: e.role, options: [{ value: '', label: 'Choose a role' }, ...ROLE_LIST.map((r) => ({ value: r, label: r }))] })
      + `</form>`;
    TN.drawer({ title: 'Invite staff', description: 'They must set up an authenticator before seeing any data.', body, footer: h.btn('Cancel', { attrs: ' data-close' }) + h.btn('Send invitation', { variant: 'primary', type: 'submit', attrs: ' form="invite-form"' }) });
    setTimeout(() => { const first = document.querySelector('#invite-form [aria-invalid="true"]'); if (first) first.focus(); }, 0);
  }
  TN.act('staff-invite-open', () => { inviteState = null; inviteDrawer(); });
  TN.act('staff-invite', (f) => {
    const fd = Object.fromEntries(new FormData(f).entries());
    const errors = {};
    if (!fd.displayName || fd.displayName.trim().length < 2) errors.displayName = 'Enter the full name.';
    if (!/^[^@\s]+@holidaychacha\.in$/i.test(fd.email || '')) errors.email = 'Use a work e-mail ending in @holidaychacha.in.';
    else if (S.staff.some((p) => p.email.toLowerCase() === fd.email.toLowerCase())) errors.email = 'This e-mail already has a staff account.';
    if (!fd.branch) errors.branch = 'Choose a branch.';
    if (!fd.role) errors.role = 'Choose a role.';
    if (Object.keys(errors).length) { inviteState = { values: fd, errors }; inviteDrawer(); return; }
    S.staff.push({ key: 'n-' + Date.now(), name: fd.displayName.trim(), email: fd.email.trim(), role: fd.role, branch: fd.branch, status: 'invited', mfa: false, lastEmail: `Invitation handed to the mail service on ${TN.fmt.dateTime(H().nowStamp())}` });
    inviteState = null;
    staffResult = { tone: 'success', text: `Invitation sent to ${fd.email.trim()}. They must set up an authenticator before seeing any data.` };
    TN.closeOverlay(); TN.refresh();
    setTimeout(() => { const b = document.getElementById('staff-invite-open'); if (b) b.focus(); }, 0);
  });
  TN.act('staff-email', (el) => {
    const p = S.staff[Number(el.dataset.id)];
    p.lastEmail = `${el.dataset.kind === 'invite' ? 'Invitation resent' : 'Password reset e-mail'}: handed to the mail service on ${TN.fmt.dateTime(H().nowStamp())}`;
    delete p.failure;
    staffResult = null;
    TN.toast(`${el.dataset.kind === 'invite' ? 'Invitation resent' : 'Password reset e-mail sent'} to ${p.name}.`, 'success'); TN.refresh();
  });
  TN.act('staff-deactivate', (el) => {
    const p = S.staff[Number(el.dataset.id)];
    changeDialog({
      title: `Deactivate ${p.name}?`, danger: true,
      effect: 'Ends access at once: open sessions lose access to CRM data at their next request. Their records and history stay.',
      affected: esc(`${p.name} (${rolesOf(p).join(', ')}, ${branchesOf(p).join(', ')})`),
      confirmLabel: 'Deactivate staff member', reasonRequired: true, reasonLabel: 'Reason for deactivation', reasonError: 'Not deactivated: give a reason of at least 10 characters.',
      onConfirm: (reason) => { p.status = 'deactivated'; H().notify(['admin'], `${meName()} deactivated ${p.name}. Reason: “${reason}”`, { href: '#/app/admin/staff' }); return { toast: `${p.name} is deactivated. Open sessions lose access at their next request.` }; },
    });
  });

  /* Extra access */
  let grantState = null;
  areaPage('/app/admin/access', 'people', () => {
    const h = H();
    const rows = S.grants.map((g, i) => [`<span class="font-semibold text-ink">${esc(g.who)}</span>`, `${esc(g.perm)}<span class="block text-sm text-quiet">${esc(g.scope)}</span>`, `<span class="text-sm">${esc(g.reason)}</span>`, esc(g.expires), h.btn(`Revoke<span class="sr-only"> ${esc(g.perm)} for ${esc(g.who)}</span>`, { size: 'sm', act: 'grant-revoke', id: String(i) })]);
    return {
      actions: h.btn('Give extra access', { variant: 'primary', act: 'grant-open', icon: 'plus', attrs: ' id="grant-open"' }),
      sub: peopleTabs('access'),
      body: block('Extra access now', rows.length ? h.table({ label: 'Extra access now', caption: 'Extra access now', cols: [{ label: 'Staff member' }, { label: 'Access' }, { label: 'Reason' }, { label: 'Expires' }, { label: 'Next step' }], rows }) : '<p class="m-0 px-4.5 py-4 text-quiet">Nobody has extra access.</p>', { desc: 'It needs a reason and cannot be given to yourself. Purchase staff can never get price access.' }),
    };
  });
  function grantDrawer() {
    const h = H(); const st = grantState || { values: {} }; const v = st.values;
    const people = S.staff.filter((p) => p.status === 'active');
    const body = `<form id="grant-form" data-act="grant-add" class="flex flex-col gap-4" novalidate>${st.error ? h.notice('danger', `<p>${esc(st.error)}</p>`, { role: 'alert' }) : ''}`
      + h.select({ id: 'grant-user', name: 'who', label: 'Staff member', value: v.who || '', options: [{ value: '', label: 'Choose a staff member' }, ...people.map((p) => ({ value: p.name, label: `${p.name} (${rolesOf(p).join(', ')})` }))] })
      + h.select({ id: 'grant-permission', name: 'perm', label: 'Access', value: v.perm || 'View deals', options: [{ value: 'View deals', label: 'View deals' }, { value: 'See prices and margin', label: 'See prices and margin' }] })
      + h.select({ id: 'grant-entity', name: 'entity', label: 'Legal entity', value: 'Holiday Chacha Pvt LTD', options: [{ value: 'Holiday Chacha Pvt LTD', label: 'Holiday Chacha Pvt LTD' }] })
      + h.select({ id: 'grant-branch', name: 'branch', label: 'Branch', hint: 'Leave as “Whole entity” only when the person needs every branch.', value: v.branch || '', options: [{ value: '', label: 'Whole entity' }, ...['Ahmedabad', 'Delhi', 'Jodhpur'].map((b) => ({ value: b, label: b }))] })
      + h.input({ id: 'grant-expiry', name: 'expires', type: 'date', label: 'Expires on', optional: true, value: v.expires || '' })
      + h.textarea({ id: 'grant-reason', name: 'reason', label: 'Business reason', hint: '10 to 500 characters.', value: v.reason || '' })
      + `</form>`;
    TN.drawer({ title: 'Give extra access', description: 'Lets someone see more deals.', body, footer: h.btn('Cancel', { attrs: ' data-close' }) + h.btn('Record grant', { variant: 'primary', type: 'submit', attrs: ' form="grant-form"' }) });
  }
  TN.act('grant-open', () => { grantState = null; grantDrawer(); });
  TN.act('grant-add', (f) => {
    const v = Object.fromEntries(new FormData(f).entries());
    const p = S.staff.find((x) => x.name === v.who);
    let err = null;
    if (!p) err = 'Not recorded: choose a staff member.';
    else if (p.key === 'admin') err = 'Not recorded: you cannot give extra access to yourself.';
    else if (rolesOf(p).includes('Purchase') && v.perm === 'See prices and margin') err = 'Not recorded: Purchase staff can never get price access.';
    else if (!H().reasonOk(v.reason)) err = 'Not recorded: give a business reason of 10 to 500 characters.';
    if (err) { grantState = { values: v, error: err }; grantDrawer(); return; }
    S.grants.push({ id: 'g' + Date.now(), who: p.name, perm: v.perm, scope: v.branch ? `${v.branch} branch` : 'Whole entity (Holiday Chacha Pvt LTD)', reason: v.reason.trim(), expires: v.expires ? TN.fmt.date(v.expires) : 'No expiry' });
    grantState = null; TN.closeOverlay(); TN.toast(`Recorded: ${p.name} can ${v.perm.toLowerCase()}.`, 'success'); TN.refresh();
  });
  TN.act('grant-revoke', (el) => {
    const i = Number(el.dataset.id); const g = S.grants[i];
    changeDialog({
      title: `Revoke ${g.perm.toLowerCase()} for ${g.who}?`, danger: true, effect: 'The extra access ends at once. Their own work stays visible to them.', affected: esc(g.who),
      confirmLabel: 'Revoke grant', reasonRequired: true, reasonError: 'Not revoked: give a reason of at least 10 characters.', returnFocus: 'grant-open',
      onConfirm: () => { S.grants.splice(S.grants.indexOf(g), 1); return { toast: `Revoked ${g.perm.toLowerCase()} for ${g.who}.` }; },
    });
  });

  /* Roles and branches (D8) */
  areaPage('/app/admin/roles', 'people', () => {
    const h = H();
    const people = S.staff.filter((p) => p.status !== 'deactivated');
    const rows = people.map((p) => {
      const me = p.key === 'admin';
      const lastCh = S.roleHistory.find((x) => x.who === p.name);
      return [`<span class="font-semibold text-ink">${esc(p.name)}${me ? ' <span class="font-normal text-quiet">(you)</span>' : ''}</span><span class="block text-sm text-quiet">${p.status === 'invited' ? 'Invited, set-up not finished' : 'Active'}</span>`,
        esc(rolesOf(p).join(', ')), esc(branchesOf(p).join(', ')),
        lastCh ? `${dayOf(lastCh.at)}<span class="block text-sm text-quiet">by ${esc(lastCh.by)}</span>` : '<span class="text-quiet">No change yet</span>',
        me ? '<span class="text-sm text-quiet">Another Super Admin changes yours.</span>' : h.btn(`Change<span class="sr-only"> roles and branches of ${esc(p.name)}</span>`, { size: 'sm', act: 'staff-roles', id: p.key, attrs: ` id="roles-btn-${p.key}"` })];
    });
    const hist = S.roleHistory;
    return {
      actions: h.btn('Add a role', { variant: 'primary', act: 'roles-add', icon: 'plus', attrs: ' id="roles-add"' }),
      sub: peopleTabs('roles'),
      body: block('Roles and branches', h.table({ label: 'Roles and branches', caption: 'Roles and branches of each staff member', cols: [{ label: 'Staff member' }, { label: 'Roles' }, { label: 'Branches' }, { label: 'Last change' }, { label: 'Next step' }], rows }), { desc: 'A change applies at the person’s next page and shows in the history below.' })
        + `<details class="rounded-card border border-line bg-card px-4.5 py-3 shadow-card"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">Change history (${hist.length})</summary><ul class="m-0 mt-3 flex list-none flex-col gap-2 p-0 text-sm">${hist.map((x) => `<li class="m-0"><span class="font-semibold text-ink">${esc(x.who)}</span>: ${esc(x.text)} <span class="text-quiet">${fmtAt(x.at)} · ${esc(x.by)}${x.reason ? ` · “${esc(x.reason)}”` : ' · no reason given'}</span></li>`).join('')}</ul></details>`,
    };
  });
  const roleChange = (p, roles, branches, reason) => {
    if (p.key === 'admin') return { error: 'Not changed: you cannot change your own roles. Another Super Admin does it.' };
    if (!roles.length) return { error: 'Not changed: a person needs at least one role. To end their access, deactivate them on Staff.' };
    if (!branches.length) return { error: 'Not changed: choose at least one branch.' };
    const r0 = rolesOf(p); const b0 = branchesOf(p);
    const added = roles.filter((r) => !r0.includes(r)); const removed = r0.filter((r) => !roles.includes(r));
    const bAdded = branches.filter((b) => !b0.includes(b)); const bRemoved = b0.filter((b) => !branches.includes(b));
    if (!added.length && !removed.length && !bAdded.length && !bRemoved.length) return { error: 'Nothing changed: the roles and branches are the same as now.' };
    p.roles = roles; p.branches = branches; p.role = roles[0]; p.branch = branches[0];
    const parts = [added.length && `role ${added.join(', ')} added`, removed.length && `role ${removed.join(', ')} removed`, bAdded.length && `branch ${bAdded.join(', ')} added`, bRemoved.length && `branch ${bRemoved.join(', ')} removed`].filter(Boolean);
    const text = parts.join('; ').replace(/^./, (c) => c.toUpperCase()) + '.';
    S.roleHistory.unshift({ at: H().nowStamp(), by: meName(), who: p.name, text, reason });
    H().notify(['admin'], `${meName()} changed ${p.name}: ${text}${reason ? ` Reason: “${reason}”` : ''}`, { href: '#/app/admin/roles' });
    return { toast: `${p.name}: ${text} Recorded in the history.` };
  };
  const PRICE_ROLES = ['Sales', 'Accounts', 'Manager'];
  const priceNote = '<p class="m-0 text-sm text-quiet">Prices follow the roles: a person who also holds Sales, Accounts or Manager sees selling prices. Purchase, Flight and Visa alone never do.</p>';
  TN.act('staff-roles', (el) => {
    const p = S.staff.find((x) => x.key === el.dataset.id); if (!p) return;
    const h = H();
    changeDialog({
      title: `Change roles and branches of ${p.name}?`, effect: 'They get or lose access at their next page. Their records and history stay.', affected: esc(p.name), confirmLabel: 'Save roles and branches', returnFocus: 'roles-btn-' + p.key,
      extra: (st) => { const v = st.values; const rs = v ? [].concat(v.roles || []) : rolesOf(p); const bs = v ? [].concat(v.branches || []) : branchesOf(p);
        return h.choiceGroup('Roles', ROLE_LIST.map((r) => h.choice('checkbox', { id: `chg-role-${r.replace(/\s/g, '')}`, name: 'roles', value: r, label: r, checked: rs.includes(r) })).join(''))
          + h.choiceGroup('Branches', BRANCHES.map((b) => h.choice('checkbox', { id: `chg-branch-${b}`, name: 'branches', value: b, label: b, checked: bs.includes(b) })).join('')) + priceNote; },
      onConfirm: (reason, fd) => roleChange(p, fd.getAll('roles'), fd.getAll('branches'), reason),
    });
  });
  TN.act('roles-add', () => {
    const h = H();
    const people = S.staff.filter((p) => p.status !== 'deactivated' && p.key !== 'admin');
    changeDialog({
      title: 'Add a role or branch', effect: 'Gives an existing person another role or branch. They get the access at their next page.', affected: 'The person you choose', confirmLabel: 'Add it', returnFocus: 'roles-add',
      extra: (st) => { const v = st.values || {}; const fe = st.fieldErrors || {};
        return h.select({ id: 'chg-person', name: 'person', label: 'Staff member', value: v.person || '', error: fe.person, options: [{ value: '', label: 'Choose a staff member' }, ...people.map((p) => ({ value: p.key, label: `${p.name} (${rolesOf(p).join(', ')} · ${branchesOf(p).join(', ')})` }))] })
          + h.select({ id: 'chg-role', name: 'role', label: 'Role to add', value: v.role || '', options: [{ value: '', label: 'No new role' }, ...ROLE_LIST.map((r) => ({ value: r, label: r }))] })
          + h.select({ id: 'chg-branch', name: 'branch', label: 'Branch to add', value: v.branch || '', options: [{ value: '', label: 'No new branch' }, ...BRANCHES.map((b) => ({ value: b, label: b }))] }) + priceNote; },
      onConfirm: (reason, fd) => {
        const p = S.staff.find((x) => x.key === fd.get('person'));
        if (!p) return { fieldErrors: { person: 'Choose a staff member.' }, focus: 'chg-person' };
        const role = fd.get('role'); const br = fd.get('branch');
        if (!role && !br) return { error: 'Nothing to add: choose a role, a branch or both.' };
        const roles = [...new Set([...rolesOf(p), ...(role ? [role] : [])])]; const branches = [...new Set([...branchesOf(p), ...(br ? [br] : [])])];
        return roleChange(p, roles, branches, reason);
      },
    });
  });

  /* ---------------------------------------------------------------
     Company and branches (read only)
     --------------------------------------------------------------- */
  areaPage('/app/admin/company', 'company', () => {
    const h = H();
    const pending = `<span class="inline-flex items-start gap-1.5 text-copy">${h.ic('triangle-alert', 'mt-0.5 size-4 shrink-0 text-status-warning')}<span>Not given yet. Final PDFs for this branch are blocked until it is added.</span></span>`;
    const none = '<span><span aria-hidden="true">—</span><span class="sr-only">Not the pilot branch</span></span>';
    return {
      body: (TN.ui && TN.ui.state ? TN.ui.state({ kind: 'readOnly', text: 'You can view this. The CRM team changes it with the details Accounts approved and the owner’s yes.' }) : `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${h.ic('lock', ICN)}<span>You can view this. The CRM team changes it with the details Accounts approved and the owner’s yes.</span></p>`)
        + h.card({ title: 'Company details', level: 2, titleIcon: 'building-complex', id: 'company-details', body: h.summary([['Company', 'Holiday Chacha Pvt LTD'], ['Registered address', '2nd Floor, Shree Tower, Residency Road, Sardarpura, Jodhpur, Rajasthan 342003'], ['PAN', '<span class="font-mono tabular-nums">AAGCH4821K</span>'], ['CIN', '<span class="font-mono tabular-nums">U63040RJ2019PTC064418</span>'], ['Customer Invoice numbers', '<span class="font-mono tabular-nums">HC/JDH/26-27/0001</span> and Advance Invoice <span class="font-mono tabular-nums">HC/JDH/ADV/26-27/0001</span>, per branch and financial year'], ['Printed on every Invoice', 'Not a tax invoice. The tax invoice is issued from Tally.']]) })
        + block('Branches', h.table({ label: 'Branches', caption: 'Branches, their GSTIN and the Bitrix pilot branch', cols: [{ label: 'Branch' }, { label: 'State' }, { label: 'GSTIN' }, { label: 'Bitrix pilot' }], rows: [['Ahmedabad', 'Gujarat', pending, none], ['Delhi', 'Delhi', pending, none], ['Jodhpur', 'Rajasthan', '<span class="font-mono tabular-nums">08AAGCH4821K1ZQ</span>', h.badge('brand', 'Pilot branch', { icon: 'circle-check' })]] })),
    };
  });

  /* ---------------------------------------------------------------
     Money rules: current values on top, one "Change", history folded
     --------------------------------------------------------------- */
  const rs = (n) => TN.fmt.inr(n);
  let polState = null;
  areaPage('/app/admin/finance-policy', 'money', () => {
    const h = H();
    const P = S.policy; const cur = P.versions.find((x) => x.status === 'in force');
    const sched = P.versions.filter((x) => x.status === 'scheduled');
    const hist = P.versions.slice().reverse().filter((x) => x.status !== 'scheduled');
    const verLine = (x) => `<li class="m-0 flex flex-col gap-0.5 border-b border-line py-2.5 last:border-b-0"><span class="font-semibold text-ink">Version ${x.v} · ${esc(x.status)}</span><span class="text-sm text-quiet">${x.status === 'scheduled' ? 'Takes effect' : 'Effective'} ${esc(x.effective)} · saved ${esc(x.saved)} by ${esc(x.by)}</span><span class="text-sm text-copy">Receipt max ${rs(x.receiptMax)} · cash per payer per day ${rs(x.cashDay)} · cash per trip ${rs(x.cashTrip)} · deposit within ${x.depositDays} ${x.depositDays === 1 ? 'day' : 'days'} · daily count ${x.count ? 'required' : 'not required'}</span><span class="text-sm text-copy">Reason: ${esc(x.reason || 'none given')}</span></li>`;
    const pay = ['pay_bank', 'pay_upi', 'pay_cash', 'pay_cheque'].map((k) => swRow(k, { effect: S.sw[k].effect })).join('');
    return {
      actions: h.btn('Change the policy', { variant: 'primary', act: 'pol-open', attrs: ' id="pol-open"' }),
      body: h.card({ title: `Version ${cur.v} in force`, desc: `Since ${esc(cur.effective)}. Receipt numbers are internal; they are not tax invoices.`, aside: h.badge('success', 'In force'), body: h.summary([['Largest single receipt', rs(cur.receiptMax)], ['Cash per payer per day', rs(cur.cashDay)], ['Cash per trip', rs(cur.cashTrip)], ['Days to deposit cash', `${cur.depositDays} working ${cur.depositDays === 1 ? 'day' : 'days'}`], ['Daily cash count', cur.count ? 'Required' : 'Not required'], ['Legal ceilings (set by the owner after the CA)', `Cash ${rs(P.ceilings.cash)} · receipt ${rs(P.ceilings.receipt)}`]]) })
        + (sched.length ? block('Scheduled changes', `<ul class="m-0 list-none px-4.5 py-1">${sched.map(verLine).join('')}</ul>`) : '')
        + block('Payment modes', rowsList(pay, 'Payment modes'), { desc: 'Super Admin only, with two-step sign-in. Company accounts are in Accounts › Cash and bank.' })
        + `<details class="rounded-card border border-line bg-card px-4.5 py-3 shadow-card"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">History (${hist.length} ${hist.length === 1 ? 'version' : 'versions'})</summary><ol class="m-0 mt-2 list-none p-0" aria-label="Policy versions, newest first">${hist.map(verLine).join('')}</ol></details>`,
    };
  });
  function polDrawer() {
    const h = H(); const P = S.policy; const cur = P.versions.find((x) => x.status === 'in force');
    const st = polState || {}; const v = st.values || { receiptMax: cur.receiptMax, cashDay: cur.cashDay, cashTrip: cur.cashTrip, depositDays: cur.depositDays, effective: '', reason: '', count: cur.count };
    const body = `<form id="pol-form" data-act="pol-save" class="flex flex-col gap-4" novalidate aria-label="Schedule a new policy version">${st.error ? h.notice('danger', `<p>${esc(st.error)}</p>`, { role: 'alert' }) : ''}<p class="m-0 text-copy">Creates a new version; earlier versions and every recorded receipt stay unchanged. Values must stay within the legal ceilings.</p>`
      + h.input({ id: 'pol-rmax', name: 'receiptMax', label: 'Largest single receipt (₹)', hint: `At most ${rs(P.ceilings.receipt)}.`, value: v.receiptMax, attrs: ' inputmode="decimal" autocomplete="off"' })
      + h.input({ id: 'pol-cday', name: 'cashDay', label: 'Cash per payer per day (₹)', hint: `0 switches cash off. At most ${rs(P.ceilings.cash)}.`, value: v.cashDay, attrs: ' inputmode="decimal" autocomplete="off"' })
      + h.input({ id: 'pol-ctrip', name: 'cashTrip', label: 'Cash per trip (₹)', hint: `0 switches cash off. At most ${rs(P.ceilings.cash)}.`, value: v.cashTrip, attrs: ' inputmode="decimal" autocomplete="off"' })
      + h.input({ id: 'pol-days', name: 'depositDays', type: 'number', label: 'Days to deposit cash', hint: '1 to 7 working days (Monday to Saturday).', value: v.depositDays, attrs: ' min="1" max="7" step="1"' })
      + h.input({ id: 'pol-eff', name: 'effective', type: 'datetime-local', label: 'Takes effect at (IST)', hint: 'Now or later, up to 90 days ahead, and not before the latest scheduled version.', value: v.effective })
      + h.choice('checkbox', { id: 'pol-count', name: 'count', value: 'true', label: 'Daily cash count required at each branch', checked: !!v.count })
      + h.textarea({ id: 'pol-reason', name: 'reason', label: 'Reason for the change', hint: '10 to 500 characters. Kept in the history.', value: v.reason })
      + `</form>`;
    TN.drawer({ title: 'Change the policy', description: 'Holiday Chacha Pvt LTD', body, footer: h.btn('Cancel', { attrs: ' data-close' }) + h.btn('Save new policy version', { variant: 'primary', type: 'submit', attrs: ' form="pol-form"' }) });
  }
  TN.act('pol-open', () => { polState = null; polDrawer(); });
  TN.act('pol-save', (f) => {
    const v = Object.fromEntries(new FormData(f).entries()); v.count = !!v.count;
    const P = S.policy; const n = (x) => Number(String(x).replace(/[,₹\s]/g, ''));
    let err = null;
    if (!(n(v.receiptMax) > 0 && n(v.receiptMax) <= P.ceilings.receipt)) err = `Largest single receipt must be above ₹0 and at most ${rs(P.ceilings.receipt)}.`;
    else if (!(n(v.cashDay) >= 0 && n(v.cashDay) <= P.ceilings.cash) || !(n(v.cashTrip) >= 0 && n(v.cashTrip) <= P.ceilings.cash)) err = `Cash limits must be from ₹0 to ${rs(P.ceilings.cash)}.`;
    else if (!(Number.isInteger(n(v.depositDays)) && n(v.depositDays) >= 1 && n(v.depositDays) <= 7)) err = 'Days to deposit cash must be 1 to 7.';
    else if (!v.effective) err = 'Choose when the new version takes effect.';
    else if (!H().reasonOk(v.reason)) err = 'Say why, in 10 to 500 characters.';
    if (err) { polState = { values: v, error: 'Not saved: ' + err + ' What you typed is still here.' }; polDrawer(); return; }
    const now = v.effective.slice(0, 10) <= TN.TODAY;
    if (now) P.versions.forEach((x) => { if (x.status === 'in force') x.status = 'replaced'; });
    const [d, t] = v.effective.split('T');
    P.versions.push({ v: P.versions.length + 1, status: now ? 'in force' : 'scheduled', effective: TN.fmt.dateTime(`${d} ${t}`), saved: TN.fmt.dateTime(H().nowStamp()), by: meName(), receiptMax: n(v.receiptMax), cashDay: n(v.cashDay), cashTrip: n(v.cashTrip), depositDays: n(v.depositDays), count: v.count, reason: v.reason.trim() });
    H().notify(['accounts', 'checker', 'admin'], `${meName()} saved money rules version ${P.versions.length}${now ? ' (in force now)' : ` (from ${TN.fmt.date(d)})`}. Reason: “${v.reason.trim()}”`, { href: '#/app/admin/finance-policy' });
    polState = null; TN.closeOverlay();
    TN.toast(`Version ${P.versions.length} saved${now ? ' and in force now' : `; it takes effect on ${TN.fmt.date(d)}`}.`, 'success'); TN.refresh();
  });

  /* ---------------------------------------------------------------
     Bitrix connection: Status · Which deals come in · Switches · Clean-up
     --------------------------------------------------------------- */
  S.bitrix = S.bitrix || {
    lastRun: '2026-10-27 15:04', runs24: 2860, fetched: 3, updated: 3,
    pipelines: [
      { id: '0', name: 'General', on: true, stages: [['NEW', 'New', 1], ['REQ', 'Requirement taken', 1], ['QUOTE', 'Quotation sent', 1], ['FOLLOW', 'Follow-up', 1], ['NEGO', 'Negotiation', 1], ['HOT', 'Ready to book', 1], ['WON', 'Won - Payment Received (won)', 1], ['LOSE', 'Lost (lost)', 1], ['JUNK', 'Not interested (lost)', 1]] },
      { id: '7', name: 'New pipeline', on: true, stages: [['C7:NEW', 'New', 1], ['C7:CONTACT', 'Contacted', 1], ['C7:QUOTE', 'Quotation sent', 1], ['C7:FOLLOW', 'Follow-up', 1], ['C7:WON', 'Won (won)', 1], ['C7:LOSE', 'Lost (lost)', 1]] },
    ],
    cutoff: '2026-09-01', auto: 'on', scopeLast: last('2026-10-09 11:00', SUPER.anjali, 'on', 'Owner APPROVE 9 Oct: both pipelines, start date 1 Sep 2026.'),
  };
  S.sw.won_only_intake = S.sw.won_only_intake || { title: 'Bring in deals only when won', effect: 'New Bitrix deals come in only when they reach “Won - Payment Received”.', who: 'Everyone: it changes which deals are in the CRM', detail: 'Deals already in the CRM stay and keep updating. The New pipeline has no “payment received” stage, so its Deals come in at Won and do not create tasks automatically.', state: 'on', last: last('2026-10-18 12:20', SUPER.harsh, 'on', 'Owner APPROVE 18 Oct: only won deals enter the CRM.') };
  REVIEW.won_only_intake = ['New Bitrix deals come into the CRM only when they reach “Won - Payment Received”. Deals already in the CRM stay.', 'New Bitrix deals come in from every ticked stage again, from the next sync.'];
  let bxDraft = null;
  areaPage('/app/admin/integration', 'bitrix', (p, q) => {
    const h = H(); const B = S.bitrix;
    const tab = ['deals', 'switches', 'cleanup'].includes(q.tab) ? q.tab : 'status';
    const sub = subTabs('Bitrix connection sections', [
      { href: '#/app/admin/integration', label: 'Status', current: tab === 'status' },
      { href: '#/app/admin/integration?tab=deals', label: 'Which deals come in', current: tab === 'deals' },
      { href: '#/app/admin/integration?tab=switches', label: 'Switches', current: tab === 'switches' },
      { href: '#/app/admin/integration?tab=cleanup', label: 'Clean-up', current: tab === 'cleanup' },
    ]);
    let body = '';
    if (tab === 'status') {
      body = h.card({ title: 'Connection', aside: h.badge('success', 'Receiving deals'), bodyClass: 'px-4.5 py-4 flex flex-col gap-3', body:
        `<p class="m-0 text-copy"><span class="font-semibold text-ink">What needs fixing:</span> nothing. No sync problems right now.</p>`
        + `<p class="m-0 text-copy">Automatic updates every 30 seconds · last run ${esc(fmtAt(B.lastRun))}.</p>`
        + `<p class="m-0 text-copy">25 deals in the CRM, the same as in Bitrix · 0 waiting to sync · 0 need attention.</p>`
        + `<p class="m-0 text-sm text-quiet">E-mail alerts are on: a stopped sync e-mails the Super Admins.</p>`
        + `<div id="bx-check-result" role="status" aria-live="polite" class="empty:hidden"></div>`
        + `<details class="text-sm"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">Details</summary><div class="mt-2 flex flex-col gap-3">`
        + checklist([['Bitrix credential', 'Present on the server'], ['Intake configuration', 'Present'], ['Deployment environment', 'Production'], ['Intake switched on', 'Yes'], ['Background update setting', 'Present on the server'], ['Last background update', `${TN.fmt.dateTime(B.lastRun)}, Completed`], ['Backlog', 'Nothing waiting']].map(([label, text]) => ({ ok: true, label, text })))
        + h.summary([['Bitrix portal', 'Holiday Chacha Bitrix24 (connected)'], ['Pilot branch', 'Jodhpur'], ['Bring in deals created on or after', `${TN.fmt.date(B.cutoff)}, 12:00 am IST`], ['Last full check', 'Today 06:00 IST: Bitrix and the CRM agree, 25 deals'], ['Runs in the last 24 hours', `${B.runs24.toLocaleString('en-IN')}; 0 failed and 0 lost messages in 7 days`], ['Short Bitrix connection errors (7 days)', '12, each cleared on the next run'], ['Updates for Bitrix users not linked to a CRM person', 'About 1,850; they wait until those users are linked']])
        + `</div></details>` });
    } else if (tab === 'deals') {
      const draft = bxDraft || { pipes: B.pipelines.map((pp) => ({ on: pp.on, stages: pp.stages.map((s) => !!s[2]) })), cutoff: B.cutoff, auto: B.auto };
      const stagesTicked = B.pipelines.reduce((n, pp) => n + pp.stages.filter((s) => s[2]).length, 0);
      body = h.card({ title: 'Which deals come in from Bitrix', desc: 'Unticking a stage or pipeline hides its deals from everyone. Hidden deals are kept and come back if you tick them again.', aside: h.stateBadge(B.auto, 'Automatic updates from Bitrix', { on: 'Automatic updates: On', off: 'Automatic updates: Off' }), bodyClass: 'px-4.5 py-4 flex flex-col gap-4', body:
        `<p class="m-0 text-sm text-quiet">${B.pipelines.length} pipelines and ${stagesTicked} stages ticked · last change ${dayOf(B.scopeLast.at)} by ${esc(B.scopeLast.by)}</p>`
        + `<form data-act="scope-review" novalidate aria-label="Change which deals come in from Bitrix" class="flex flex-col gap-4"><div class="flex flex-col gap-3">${B.pipelines.map((pp, pi) => `<fieldset class="m-0 flex min-w-0 flex-col gap-2 rounded-control border border-line px-3.5 py-3"><legend class="px-1">${h.choice('checkbox', { id: `bx-p-${pi}`, name: 'pipe', value: String(pi), label: `Pipeline: ${pp.name}`, checked: draft.pipes[pi].on })}</legend><ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2" aria-label="Stages of ${esc(pp.name)}">${pp.stages.map((s, si) => `<li class="m-0">${h.choice('checkbox', { id: `bx-s-${pi}-${si}`, name: `stage-${pi}`, value: String(si), label: s[1], checked: draft.pipes[pi].stages[si] })}</li>`).join('')}</ul></fieldset>`).join('')}</div>`
        + `<p class="m-0 text-sm text-quiet">New deals are taken from the ticked stages. Deals already in the CRM keep following Bitrix to any stage, won and lost included.</p>`
        + `<div class="grid gap-4 sm:grid-cols-2">${h.input({ id: 'bx-cutoff', type: 'date', name: 'cutoff', label: 'Bring in deals created on or after', value: draft.cutoff, hint: 'Uses the Bitrix creation date, from 00:00 India time.' })}${h.choiceGroup('Automatic updates from Bitrix (every 30 seconds)', h.choice('radio', { id: 'bx-auto-on', name: 'auto', value: 'on', label: 'On', checked: draft.auto === 'on' }) + h.choice('radio', { id: 'bx-auto-off', name: 'auto', value: 'off', label: 'Off', checked: draft.auto === 'off' }))}</div>`
        + `<div id="bx-scope-error" class="empty:hidden" role="alert"></div><div>${h.btn('Review and save', { variant: 'primary', type: 'submit', attrs: ' id="bx-scope-submit"' })}</div></form>` })
        + `<ul class="m-0 list-none rounded-card border border-line bg-card p-0 shadow-card">${swRow('won_only_intake')}</ul>`;
    } else if (tab === 'switches') {
      body = block('Bitrix switches', rowsList(['bitrix_trip_facts_read', 'lead_intake_unowned', 'bitrix_id_proof_copy', 'bitrix_names'].map((k) => swRow(k)).join(''), 'Bitrix switches'), { desc: 'What the CRM reads from Bitrix, and the one setting that writes to it.' });
    } else {
      body = h.card({ title: 'Bitrix copy stopped', aside: h.badge('success', 'Nothing open'), bodyClass: 'px-4.5 py-4 flex flex-col gap-2', body: '<p class="m-0 text-copy">No automatic stops. 1 copy from 13 Oct 2026 was checked by hand on 14 Oct and is in Bitrix; nothing to check now.</p>' })
        + h.card({ title: 'Remove deals that are not won', bodyClass: 'px-4.5 py-4 flex flex-col gap-2', body: `<p class="m-0 text-copy">Deals with any CRM work (a booking, task, receipt, reported payment, billing details or document) are never removed.</p><p class="m-0 text-sm text-quiet">Last check on 18 Oct 2026 by ${SUPER.harsh}: 10 deals removed, 0 with CRM work.</p>` })
        + h.card({ title: 'Open sync work', bodyClass: 'px-4.5 py-4 flex flex-col gap-2', body: '<p class="m-0 text-copy">Nothing open: 0 waiting, 0 processing, 0 to review, 0 failed, 0 stopped.</p><p class="m-0 text-copy">Deals waiting for an owner: none. Every stored Bitrix deal has a CRM owner.</p><p class="m-0 text-sm text-quiet">Deals waiting for review, failed deals and deals that ran out of retries appear here.</p>' });
    }
    return { actions: tab === 'status' ? h.btn('Check Bitrix now', { variant: 'primary', act: 'bx-check', icon: 'refresh-cw' }) : '', sub, body };
  });
  TN.act('bx-check', () => {
    const B = S.bitrix; B.lastRun = H().nowStamp(); B.fetched = 2; B.updated = 2;
    TN.refresh();
    setTimeout(() => { const r = document.getElementById('bx-check-result'); if (r) r.innerHTML = H().notice('success', '<p>Checked Bitrix: 2 fetched, 0 new, 2 updated. Nothing changed in Bitrix.</p>', { role: 'none' }); }, 0);
  });
  TN.act('scope-review', (f) => {
    const B = S.bitrix; const fd = new FormData(f);
    const draft = { pipes: B.pipelines.map((pp, pi) => ({ on: fd.getAll('pipe').includes(String(pi)), stages: pp.stages.map((s, si) => fd.getAll(`stage-${pi}`).includes(String(si))) })), cutoff: fd.get('cutoff') || B.cutoff, auto: fd.get('auto') || 'on' };
    bxDraft = draft;
    const errBox = document.getElementById('bx-scope-error');
    if (!draft.pipes.some((pp) => pp.on && pp.stages.some(Boolean))) { if (errBox) { errBox.innerHTML = H().notice('danger', '<p>Not saved: tick at least one pipeline and one stage.</p>', { role: 'none' }); } const first = document.getElementById('bx-p-0'); if (first) first.focus(); return; }
    if (errBox) errBox.innerHTML = '';
    const nP = draft.pipes.filter((pp) => pp.on).length; const nS = draft.pipes.reduce((n, pp) => n + (pp.on ? pp.stages.filter(Boolean).length : 0), 0);
    changeDialog({
      title: 'Save these Bitrix settings?', effect: esc(`${TN.fmt.plural(nP, 'pipeline')} and ${TN.fmt.plural(nS, 'stage')} come in, created on or after ${TN.fmt.date(draft.cutoff)}. Automatic updates: ${draft.auto === 'on' ? 'On' : 'Off'}. Hidden deals are kept and come back if you tick them again.`),
      affected: 'Everyone: it changes which deals are in the CRM', confirmLabel: 'Save these Bitrix settings', returnFocus: 'bx-scope-submit',
      onConfirm: (reason) => {
        if (!isAdmin()) return { error: 'Only a Super Admin can change this. Nothing was changed.' };
        B.pipelines.forEach((pp, pi) => { pp.on = draft.pipes[pi].on; pp.stages.forEach((s, si) => { s[2] = draft.pipes[pi].stages[si] ? 1 : 0; }); });
        B.cutoff = draft.cutoff; B.auto = draft.auto; B.scopeLast = { at: H().nowStamp(), by: meName(), to: draft.auto, reason };
        H().notify(['admin'], `${meName()} changed which deals come in from Bitrix.${reason ? ` Reason: “${reason}”` : ''}`, { href: '#/app/admin/integration?tab=deals' });
        bxDraft = null;
        return { toast: 'Bitrix settings saved. Recorded with your name and the time. Hidden deals are kept.' };
      },
    });
  });

  /* ---------------------------------------------------------------
     Imports (hotel list: Super Admin; customer list: Accounts)
     --------------------------------------------------------------- */
  S.imports = S.imports || {
    hotel: [{ file: 'rajasthan-hotels-oct.csv', at: '2026-10-24 16:20', by: SUPER.anjali, status: 'applied', rows: 212, creates: 198, updates: 0, invalid: 14 }],
    customer: [{ file: 'jodhpur-customers-2026.csv', at: '2026-10-25 11:05', by: 'Kavita Joshi', status: 'applied', rows: 1340, creates: 1288, updates: 0, invalid: 52 }, { file: 'jodhpur-customers-test.csv', at: '2026-10-24 18:40', by: 'Kavita Joshi', status: 'checked', rows: 40, creates: 0, updates: 0, invalid: 3 }],
  };
  let imp = { summary: null, error: null, applied: null, branch: '' };
  const WORDS = { hotel: { one: 'hotel', many: 'hotels', owner: 'a Super Admin' }, customer: { one: 'customer', many: 'customers', owner: 'Accounts' } };
  const IMP_LOOK = { applied: ['success', 'Imported'], checked: ['info', 'Checked, not imported'], failed: ['danger', 'Failed'] };
  const rerender = (to) => { TN.refresh(); setTimeout(() => { const el = document.getElementById(to); if (el) el.focus(); }, 0); };
  areaPage('/app/admin/imports', 'imports', (p, q) => {
    const h = H();
    const kind = q.kind === 'customer' || (TN.is('accounts', 'checker') && q.kind !== 'hotel') ? 'customer' : 'hotel';
    const w = WORDS[kind];
    const canApply = kind === 'hotel' ? TN.is('admin') : TN.is('accounts', 'checker');
    const s = imp.summary && imp.summary.kind === kind ? imp.summary : null;
    const count = (label, value, note) => `<div class="flex min-w-28 flex-col gap-0.5 rounded-control bg-wash px-3 py-2.5"><span class="text-sm text-quiet">${esc(label)}</span><strong class="text-xl font-semibold text-ink tabular-nums">${Number(value).toLocaleString('en-IN')}</strong>${note ? `<span class="text-xs text-quiet">${esc(note)}</span>` : ''}</div>`;
    const summaryCard = s ? h.card({ title: '2. Check the result, then import', aside: `<span class="inline-flex items-center gap-1.5 wrap-anywhere">${h.ic('file-spreadsheet', 'size-4 shrink-0')}${esc(s.file)}</span>`, bodyClass: 'px-4.5 py-4 flex flex-col gap-5', body:
      (imp.applied ? h.notice('success', `<p>${esc(imp.applied)}</p>`, { role: 'status' }) : '')
      + `<div class="flex flex-wrap gap-2.5" role="group" aria-label="Counts">${count('Rows', s.rows)}${count('Ready', s.ready)}${count('Invalid', s.invalid, 'left out')}${count('Possible duplicates', s.dup, 'never merged')}${count(`New ${w.many}`, s.ready - s.dup)}${count('Updates', 0, 'by ID column only')}</div>`
      + `<details><summary class="w-fit cursor-pointer rounded-chip text-sm font-medium text-brand-strong ${FOCUS}">How the columns were read (${s.cols.length})</summary><ul class="m-0 mt-2.5 flex list-none flex-col gap-1 p-0 text-sm">${s.cols.map((c, i) => `<li><span class="font-medium text-ink">${esc(c)}</span> ${i < 6 ? `→ ${esc(c.toLowerCase())}` : '<span class="text-quiet">→ not imported</span>'}</li>`).join('')}</ul></details>`
      + (s.invalidRows.length ? `<section class="flex flex-col gap-2"><h3 class="m-0 text-base font-semibold text-ink">Invalid rows (${s.invalid})</h3><ul class="m-0 flex max-h-72 list-none flex-col overflow-auto rounded-control border border-line p-0 text-sm">${s.invalidRows.map((r) => `<li class="flex gap-3 border-b border-line px-3 py-2 last:border-b-0"><span class="w-16 shrink-0 text-quiet tabular-nums">Row ${r}</span><span class="min-w-0 wrap-anywhere">The name column is empty.</span></li>`).join('')}</ul></section>` : '')
      + `<div class="flex flex-col gap-2 border-t border-line pt-4"><p class="m-0 text-sm text-quiet">Applied ${w.many} start Not checked. Invalid rows are left out.</p><div>${h.btn(`Import ${(s.ready - s.dup).toLocaleString('en-IN')} ${w.many}`, { variant: 'primary', size: 'lg', act: 'imp-apply', id: kind, attrs: canApply && !imp.applied && s.ready - s.dup > 0 ? '' : ' disabled' })}</div></div>` }) : '';
    const hist = S.imports[kind];
    return {
      title: isAdmin() ? undefined : 'Imports',
      line: isAdmin() ? undefined : 'Customer lists from a CSV file: check first, then import.',
      sub: isAdmin() ? subTabs('What to import', [{ href: '#/app/admin/imports?kind=hotel', label: 'Hotels', current: kind === 'hotel' }, { href: '#/app/admin/imports?kind=customer', label: 'Customers', current: kind === 'customer' }]) : '',
      body: h.card({ title: `1. Check the ${w.one} file`, desc: 'CSV saved from Excel (CSV UTF-8), up to 5,000 rows and 5 MB. The first row holds the column names. Nothing is saved until you import.', body: `<form data-act="imp-check" data-id="${kind}" novalidate aria-label="Check a ${w.one} file" class="flex flex-col gap-3">${imp.error ? h.notice('danger', `<p>${esc(imp.error)}</p>`, { role: 'alert' }) : ''}`
        + (kind === 'customer' ? h.select({ id: 'import-branch', name: 'branch', label: 'Customers belong to', hint: 'Sales and Managers of this branch can find them. Whole company: every branch can.', value: imp.branch, extra: 'max-w-md', options: [{ value: '', label: 'Choose' }, { value: 'Jodhpur', label: 'Jodhpur' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'company', label: 'Whole company (every branch)' }] }) : '')
        + `<div class="flex flex-wrap items-end gap-3"><div class="flex flex-col gap-1.5 min-w-0 flex-1" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="import-file">CSV file</label><input id="import-file" name="file" type="file" accept=".csv,text/csv" class="block w-full rounded-control border border-control bg-card px-3 py-2 font-sans text-base text-ink file:mr-3 file:rounded-control file:border-0 file:bg-wash file:px-3 file:py-1.5 file:font-semibold file:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-strong"></div>${h.btn('Check file', { variant: s ? 'secondary' : 'primary', type: 'submit', icon: 'upload', extra: 'min-h-11' })}</div></form>` })
        + summaryCard
        + h.card({ title: 'Earlier files', titleIcon: 'rotate-ccw-clock', bodyClass: hist.length ? '' : undefined, body: hist.length ? h.table({ label: `Earlier ${w.one} files`, caption: 'Latest first', cols: [{ label: 'File' }, { label: 'Status' }, { label: 'Rows', num: true }, { label: 'New', num: true }, { label: 'Updated', num: true }, { label: 'Invalid', num: true }], rows: hist.map((x) => [`<span class="font-medium wrap-anywhere text-ink">${esc(x.file)}</span><span class="block text-sm text-quiet">${esc(TN.fmt.dateTime(x.at))} · ${esc(x.by)}</span>`, h.badge(IMP_LOOK[x.status][0], IMP_LOOK[x.status][1]), x.rows.toLocaleString('en-IN'), x.creates.toLocaleString('en-IN'), x.updates, x.invalid]) }) : `<p class="m-0 text-quiet">No ${w.one} files yet.</p>` })
        + (!canApply ? `<p class="m-0 text-sm text-quiet">Only ${w.owner} can apply a ${w.one} file. You can check files and read the result.</p>` : ''),
    };
  }, ['admin', 'accounts', 'checker']);
  TN.act('imp-check', (f) => {
    const kind = f.dataset.id; const file = f.querySelector('#import-file').files[0];
    const br = f.querySelector('#import-branch'); imp.branch = br ? br.value : '';
    imp.applied = null;
    if (kind === 'customer' && !imp.branch) { imp.error = 'Choose the branch the customers belong to, or Whole company.'; imp.summary = null; rerender('import-branch'); return; }
    if (!file) { imp.error = 'Choose a CSV file to check. Nothing was imported.'; imp.summary = null; rerender('import-file'); return; }
    if (!/\.csv$/i.test(file.name)) { imp.error = 'This is not a CSV file. In Excel use Save As → CSV UTF-8. Nothing was imported.'; imp.summary = null; rerender('import-file'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
      const cols = (lines[0] || '').split(',').map((c) => c.replace(/^"|"$/g, '').trim()).filter(Boolean);
      const body = lines.slice(1);
      const invalidRows = []; const seen = new Set(); let dup = 0;
      body.forEach((l, i) => { const first = (l.split(',')[0] || '').replace(/"/g, '').trim(); if (!first) invalidRows.push(i + 2); else if (seen.has(first.toLowerCase())) dup++; else seen.add(first.toLowerCase()); });
      imp.error = null;
      imp.summary = { kind, file: file.name, rows: body.length, invalid: invalidRows.length, ready: body.length - invalidRows.length, dup, cols: cols.length ? cols : ['Name'], invalidRows: invalidRows.slice(0, 20) };
      S.imports[kind].unshift({ file: file.name, at: H().nowStamp(), by: meName(), status: 'checked', rows: body.length, creates: 0, updates: 0, invalid: invalidRows.length });
      TN.refresh();
    };
    reader.readAsText(file);
  });
  TN.act('imp-apply', (el) => {
    const kind = el.dataset.id; const s = imp.summary;
    TN.dialog({ title: `Import ${s.ready - s.dup} ${WORDS[kind].many}?`, description: s.file, body: `<form data-act="imp-confirm" data-id="${kind}" id="imp-form" class="flex flex-col gap-3" novalidate><p class="m-0">${s.ready - s.dup} new ${WORDS[kind].many} are added and start Not checked. ${s.invalid} invalid rows and ${s.dup} possible duplicates are left out.</p>${H().textarea({ id: 'import-reason', name: 'reason', label: 'Reason', hint: '10 to 500 characters, for the history.' })}</form>`, footer: H().btn('Cancel', { attrs: ' data-close autofocus' }) + H().btn('Import', { variant: 'primary', type: 'submit', attrs: ' form="imp-form"' }) });
  });
  TN.act('imp-confirm', (f) => {
    const kind = f.dataset.id; const s = imp.summary;
    if (!H().reasonOk(f.querySelector('#import-reason').value)) { const t = f.querySelector('#import-reason'); t.setAttribute('aria-invalid', 'true'); if (!f.querySelector('#import-reason-error')) { t.insertAdjacentHTML('afterend', '<p class="m-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger" id="import-reason-error"><span>Type a reason of 10 to 500 characters.</span></p>'); t.setAttribute('aria-describedby', 'import-reason-hint import-reason-error'); } t.focus(); return; }
    const row = S.imports[kind].find((x) => x.file === s.file && x.status === 'checked'); if (row) { row.status = 'applied'; row.creates = s.ready - s.dup; }
    imp.applied = `Applied: ${s.ready - s.dup} new ${WORDS[kind].many}, 0 updated. They start Not checked.`;
    TN.closeOverlay(); TN.toast(imp.applied, 'success'); TN.refresh();
  });

  /* ---------------------------------------------------------------
     Features (incl. the staff notices switch, D12)
     --------------------------------------------------------------- */
  areaPage('/app/admin/workflow', 'features', () => {
    const h = H();
    const checks = supplierChecks();
    const failing = checks.filter((c) => !c.ok);
    const sc = S.sw.supplier_confirmation;
    return {
      body: block('Switches for every branch', rowsList(['service_items_enabled', 'won_deal_count', 'visa_passport_tasks_enabled', 'prefill_auto_fill', 'referral_drafts', 'staff_notices'].map((k) => swRow(k)).join(''), 'Switches for every branch'))
        + block('Real bookings and supplier confirmation', rowsList(swRow('real_booking') + swRow('supplier_confirmation', { moreExtra: `<div class="flex flex-col gap-1.5"><p class="font-medium text-ink">Safety checks before switching on</p>${checklist(checks)}</div>`, disabledReason: sc.state === 'off' && failing.length ? `A safety check is missing: ${failing.map((c) => c.label.toLowerCase()).join(', ')}. See More.` : null }), 'Big switches'), { desc: 'Super Admin only, with two-step sign-in.' })
        + `<p class="m-0 text-sm text-quiet">Payment modes are in ${h.link('#/app/admin/finance-policy', 'Money rules')}. The Bitrix switches are in ${h.link('#/app/admin/integration?tab=switches', 'Bitrix connection')}.</p>`,
    };
  });

  /* ---------------------------------------------------------------
     Customer messages (own area, D12): Switches · Texts · Pilot list · Set-up
     Nine messages x two channels; every message in English (no language choice).
     --------------------------------------------------------------- */
  S.msg = S.msg || {
    types: [
      { key: 'booking_confirmed', name: 'Booking confirmed', when: 'Once, when Accounts first approve the booking. Held between 9 pm and 8 am.', email: 'off', wa: 'off', waText: 'approved', subject: 'Your booking {deal} is confirmed', text: 'Hello {customer},\nYour booking {deal} for {trip} ({dates}) is confirmed. Your travel advisor is {staff_name} ({staff_phone}).\nHoliday Chacha' },
      { key: 'payment_received', name: 'Payment received', when: 'When a payment is verified (a cheque: when it clears).', email: 'off', wa: 'off', waText: 'approved', subject: 'We received {amount} for {deal}', text: 'Hello {customer},\nWe received {amount} on {date} for {deal}. Still due: {due}.\nHoliday Chacha' },
      { key: 'hotel_voucher', name: 'Hotel voucher', when: 'When Purchase marks a hotel voucher ready for the customer. Held between 9 pm and 8 am.', email: 'off', wa: 'off', waText: 'approved', subject: 'Your hotel voucher: {hotel}', text: 'Hello {customer},\nYour voucher for {hotel} ({check_in} to {check_out}) is attached.\nHoliday Chacha' },
      { key: 'e_ticket', name: 'E-ticket', when: 'When the e-ticket is stored and the tickets are confirmed.', email: 'off', wa: 'off', waText: 'waiting', subject: 'Your e-ticket for {deal}', text: 'Hello {customer},\nYour e-ticket for {flight} on {date} is attached. Please carry a photo ID.\nHoliday Chacha' },
      { key: 'boarding_pass', name: 'Boarding pass', when: 'When Flight uploads a boarding pass.', email: 'off', wa: 'off', waText: 'not_sent', subject: 'Your boarding pass: {flight}', text: 'Hello {customer},\nYour boarding pass for {flight} on {date} is attached.\nHoliday Chacha' },
      { key: 'visa_status', name: 'Visa status', when: 'When the visa result is recorded. Held between 9 pm and 8 am.', email: 'off', wa: 'off', waText: 'not_sent', subject: 'Visa update for {traveller}', text: 'Hello {customer},\nThe {country} visa for {traveller}: {result}. {staff_name} will call you about the next step.\nHoliday Chacha' },
      { key: 'trip_reminder', name: 'Trip reminder', when: '3 days and 1 day before the trip starts. Held between 9 pm and 8 am.', email: 'off', wa: 'off', waText: 'not_sent', subject: 'Your trip starts on {start_date}', text: 'Hello {customer},\nYour trip {trip} starts on {start_date}. Your documents are with {staff_name}.\nHoliday Chacha' },
      { key: 'refund_paid', name: 'Refund paid', when: 'When a refund payout is recorded.', email: 'off', wa: 'off', waText: 'rejected', subject: 'Refund of {amount} for {deal}', text: 'Hello {customer},\nWe paid a refund of {amount} for {deal} on {date}. Reference: {reference}.\nHoliday Chacha' },
      { key: 'booking_updated', name: 'Booking updated', when: 'When an approved change is applied to the booking. Held between 9 pm and 8 am.', email: 'off', wa: 'off', waText: 'not_sent', subject: 'Your booking {deal} was updated', text: 'Hello {customer},\nYour booking {deal} was updated: {change}. {staff_name} can answer any questions.\nHoliday Chacha' },
    ],
    pilot: { on: true, deals: [{ deal: 'BX-38412', by: SUPER.anjali, at: '2026-10-26 10:30' }, { deal: 'BX-38547', by: SUPER.anjali, at: '2026-10-26 10:32' }], last: last('2026-10-26 10:28', SUPER.anjali, 'on', 'Owner APPROVE 26 Oct: messages only for two pilot Deals first.') },
    timer: { state: 'off', lastRun: null, queue: 0, last: null },
    keys: [['E-mail sending key', true], ['E-mail delivery-report secret', false], ['WhatsApp sending key', false], ['WhatsApp delivery-report secret', false], ['Timer secret', false]],
    last: {},
  };
  const WA_LOOK = { approved: ['success', 'Approved by WhatsApp', 'circle-check'], waiting: ['info', 'Waiting for WhatsApp', 'hourglass'], not_sent: ['neutral', 'Not sent to WhatsApp yet', 'circle-dashed'], rejected: ['danger', 'Rejected by WhatsApp', 'circle-x'] };
  const CH = { email: 'e-mail', wa: 'WhatsApp' };
  areaPage('/app/admin/customer-messages', 'messages', (p, q) => {
    const h = H(); const M = S.msg;
    const tab = ['texts', 'pilot', 'setup'].includes(q.tab) ? q.tab : 'switches';
    const sub = subTabs('Customer messages sections', [
      { href: '#/app/admin/customer-messages', label: 'Switches', current: tab === 'switches' },
      { href: '#/app/admin/customer-messages?tab=texts', label: 'Texts', current: tab === 'texts' },
      { href: '#/app/admin/customer-messages?tab=pilot', label: 'Pilot list', current: tab === 'pilot', count: M.pilot.on ? M.pilot.deals.length : null },
      { href: '#/app/admin/customer-messages?tab=setup', label: 'Set-up', current: tab === 'setup' },
    ]);
    const missing = M.keys.filter((k) => !k[1]).map((k) => k[0]);
    const setupNotice = missing.length ? h.notice('warning', `<p>Messages wait as “Failed: sending is not set up yet” until the owner saves these in Vercel: ${esc(missing.join(', '))}.</p><p>${h.link('#/app/admin/customer-messages?tab=setup', 'Open Set-up')}</p>`, { title: 'Sending is not fully set up yet' }) : '';
    let body = '';
    if (tab === 'switches') {
      const cell = (t, ch) => {
        const state = t[ch];
        const blocked = ch === 'wa' && t.waText !== 'approved' && state !== 'on';
        const id = `msg-${t.key}-${ch}`;
        return `<div class="flex flex-col items-start gap-1.5"><div class="flex flex-wrap items-center gap-2">${h.stateBadge(state, `${t.name} by ${CH[ch]}`)}${h.btn(`Change<span class="sr-only"> ${esc(t.name)} by ${CH[ch]}</span>`, { size: 'sm', act: 'msg-change', id: `${t.key}:${ch}`, attrs: ` id="${id}"${blocked ? ` disabled aria-describedby="${id}-why"` : ''}` })}</div>${blocked ? `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet" id="${id}-why">${h.ic('lock', ICN)}<span>WhatsApp has not approved the text yet. Set its status on Texts.</span></p>` : ''}</div>`;
      };
      body = setupNotice + `<p class="m-0 text-copy">${msgOnCount()} of 18 on · ${M.pilot.on ? `only the ${M.pilot.deals.length} Deals on the pilot list get messages` : 'every Deal gets the switched-on messages'} · timer ${M.timer.state === 'on' ? 'on' : 'switched off'}. Bills, payment-due reminders and marketing never go to customers.</p>`
        + block('Messages and channels', h.table({ label: 'Messages and channels', caption: 'Nine messages, e-mail and WhatsApp switches', cols: [{ label: 'Message' }, { label: 'E-mail' }, { label: 'WhatsApp' }], rows: M.types.map((t) => [`<span class="font-semibold text-ink">${esc(t.name)}</span><span class="block text-sm text-quiet">${esc(t.when)}</span>`, cell(t, 'email'), cell(t, 'wa')]) }), { desc: 'Switched off: nothing is recorded for that message and channel.' });
    } else if (tab === 'texts') {
      body = block('Message texts', rowsList(M.types.map((t) => { const L = WA_LOOK[t.waText]; return `<li class="m-0 px-4.5 py-3"><details><summary class="flex min-h-9 cursor-pointer flex-wrap items-center gap-2 rounded-chip ${FOCUS}"><span class="font-semibold text-ink">${esc(t.name)}</span>${h.badge(L[0], L[1], { icon: L[2] })}</summary><div class="mt-2 flex flex-col gap-2"><p class="m-0 text-sm text-quiet">E-mail subject: ${esc(t.subject)}</p><p class="m-0 whitespace-pre-wrap rounded-control bg-wash px-3 py-2 text-sm text-copy">${esc(t.text)}</p><div>${h.btn(`Set WhatsApp status<span class="sr-only"> of ${esc(t.name)}</span>`, { size: 'sm', act: 'msg-text-status', id: t.key, attrs: ` id="msg-text-${t.key}"` })}</div></div></details></li>`; }).join(''), 'Message texts'), { desc: 'The only texts that can be sent. WhatsApp sends a text only after WhatsApp has approved it; set the status here to match the Interakt dashboard.' });
    } else if (tab === 'pilot') {
      const pilotSw = { title: 'Only pilot Deals get messages', effect: M.pilot.on ? `Only the ${M.pilot.deals.length} Deals below get messages. Every other Deal is skipped with the reason “not on the pilot list”.` : 'Every Deal gets the switched-on messages.', state: M.pilot.on ? 'on' : 'off', last: M.pilot.last, detail: '' };
      const rows = M.pilot.deals.map((x) => [h.link('#/app/deals/' + x.deal, esc(x.deal)) + `<span class="block text-sm text-quiet">${esc(TN.deal(x.deal) && TN.customer(TN.deal(x.deal).customer) ? TN.customer(TN.deal(x.deal).customer).name : '')}</span>`, `${esc(x.by)}<span class="block text-sm text-quiet">${fmtAt(x.at)}</span>`, h.btn(`Remove<span class="sr-only"> ${esc(x.deal)} from the pilot list</span>`, { size: 'sm', act: 'pilot-remove', id: x.deal })]);
      body = `<ul class="m-0 list-none rounded-card border border-line bg-card p-0 shadow-card">${swRow('msg_pilot', { sw: pilotSw, act: 'pilot-toggle' })}</ul>`
        + block('Pilot Deals', (rows.length ? h.table({ label: 'Pilot Deals', caption: 'Deals on the pilot list', cols: [{ label: 'Deal' }, { label: 'Added by' }, { label: 'Next step' }], rows }) : '<p class="m-0 px-4.5 py-4 text-quiet">No Deals on the pilot list yet.</p>') + `<div class="border-t border-line px-4.5 py-3">${h.btn('Add a pilot Deal', { act: 'pilot-add', icon: 'plus', attrs: ' id="pilot-add"' })}</div>`);
    } else {
      const timerSw = { title: 'Timer', effect: 'Runs every minute: trip reminders, retries and held messages. If it stops, nothing is lost; the work waits.', state: M.timer.state, last: M.timer.last };
      body = setupNotice + `<ul class="m-0 list-none rounded-card border border-line bg-card p-0 shadow-card">${swRow('msg_timer', { sw: timerSw, act: 'timer-toggle', valueLine: `Last good run: ${M.timer.lastRun ? fmtAt(M.timer.lastRun) : 'never'} · ${M.timer.queue ? TN.fmt.plural(M.timer.queue, 'message') + ' waiting' : 'no messages waiting'}` })}</ul>`
        + block('Sending set-up', rowsList(M.keys.map(([k, ok]) => `<li class="m-0 flex flex-wrap items-center justify-between gap-2 px-4.5 py-3"><span class="text-copy">${esc(k)}</span>${ok ? h.badge('success', 'Saved') : h.badge('warning', 'Not saved yet')}</li>`).join(''), 'Sending keys'), { desc: 'Saved by the owner in Vercel. This page shows only whether each one is saved, never its value.' });
    }
    return { sub, body };
  });
  const affectedCustomers = () => (S.msg.pilot.on ? `Customers on the ${S.msg.pilot.deals.length} pilot Deals` : 'Customers of every Deal in every branch');
  TN.act('msg-change', (el) => {
    const [key, ch] = el.dataset.id.split(':'); const t = S.msg.types.find((x) => x.key === key); if (!t) return;
    const to = t[ch] === 'on' ? 'off' : 'on';
    changeDialog({
      title: `Switch ${to} ${t.name} by ${CH[ch]}?`,
      effect: esc(to === 'on' ? `Customers get the “${t.name}” message by ${CH[ch]}. When: ${t.when.charAt(0).toLowerCase() + t.when.slice(1)}` : `Customers stop getting the “${t.name}” message by ${CH[ch]}. Nothing is recorded for it while it is off.`),
      affected: esc(affectedCustomers()), confirmLabel: `Switch ${to} ${t.name} by ${CH[ch]}`, returnFocus: `msg-${key}-${ch}`,
      blocked: ch === 'wa' && to === 'on' && t.waText !== 'approved' ? 'WhatsApp has not approved the text yet.' : null,
      onConfirm: (reason) => {
        if (!isAdmin()) return { error: 'Only a Super Admin can change this. Nothing was changed.' };
        t[ch] = to; S.msg.last[`${key}:${ch}`] = { at: H().nowStamp(), by: meName(), to, reason };
        H().notify(['admin'], `${meName()} switched ${t.name} by ${CH[ch]} ${to}.${reason ? ` Reason: “${reason}”` : ''}`, { href: '#/app/admin/customer-messages' });
        return { toast: `${t.name} by ${CH[ch]} is now ${to === 'on' ? 'On' : 'Off'}. Recorded with your name and the time.` };
      },
    });
  });
  TN.act('msg-text-status', (el) => {
    const t = S.msg.types.find((x) => x.key === el.dataset.id); if (!t) return;
    const h = H();
    changeDialog({
      title: `Set the WhatsApp status of ${t.name}?`, effect: 'Set it to match the Interakt dashboard. Only an approved text can be sent on WhatsApp; if it is not approved, WhatsApp sending of this message stops.', affected: esc(affectedCustomers()), confirmLabel: 'Save WhatsApp status', returnFocus: 'msg-text-' + t.key,
      extra: (st) => h.select({ id: 'chg-wa', name: 'wa', label: 'WhatsApp status', value: (st.values && st.values.wa) || t.waText, options: Object.entries(WA_LOOK).map(([v, L]) => ({ value: v, label: L[1] })) }),
      onConfirm: (reason, fd) => {
        const v = fd.get('wa'); if (v === t.waText) return { toast: 'Nothing changed.', tone: 'info' };
        t.waText = v; let stop = '';
        if (v !== 'approved' && t.wa === 'on') { t.wa = 'off'; stop = ' WhatsApp sending of this message is now Off.'; }
        return { toast: `${t.name}: ${WA_LOOK[v][1]}.${stop}` };
      },
    });
  });
  TN.act('pilot-toggle', () => {
    const P = S.msg.pilot; const to = P.on ? 'off' : 'on';
    changeDialog({
      title: to === 'off' ? 'Send to every Deal?' : 'Send to pilot Deals only?',
      effect: esc(to === 'off' ? 'Every Deal in every branch gets the switched-on messages from now on.' : `Only the ${P.deals.length} Deals on the pilot list get messages. Every other Deal is skipped.`),
      affected: 'Customers of every Deal', confirmLabel: to === 'off' ? 'Send to every Deal' : 'Send to pilot Deals only', returnFocus: 'sw-btn-msg_pilot',
      onConfirm: (reason) => { P.on = to === 'on'; P.last = { at: H().nowStamp(), by: meName(), to, reason }; return { toast: to === 'off' ? 'Messages now go to every Deal.' : 'Messages now go to pilot Deals only.' }; },
    });
  });
  TN.act('timer-toggle', () => {
    const T = S.msg.timer; const to = T.state === 'on' ? 'off' : 'on';
    changeDialog({
      title: `Switch the timer ${to}?`, effect: esc(to === 'on' ? 'Trip reminders, retries and held messages go out every minute.' : 'Trip reminders, retries and held messages wait. Nothing is lost.'),
      affected: esc(affectedCustomers()), confirmLabel: `Switch the timer ${to}`, returnFocus: 'sw-btn-msg_timer',
      blocked: to === 'on' && !S.msg.keys.find((k) => k[0] === 'Timer secret')[1] ? 'The timer secret is not saved yet. The owner saves it in Vercel.' : null,
      onConfirm: (reason) => { T.state = to; T.last = { at: H().nowStamp(), by: meName(), to, reason }; return { toast: `The timer is now ${to === 'on' ? 'On' : 'Off'}.` }; },
    });
  });
  TN.act('pilot-add', () => {
    const h = H(); const P = S.msg.pilot;
    const free = D.deals.filter((d) => !P.deals.some((x) => x.deal === d.id));
    changeDialog({
      title: 'Add a pilot Deal', effect: 'The customer of this Deal starts getting the switched-on messages.', affected: 'The customer of the Deal you choose', confirmLabel: 'Add to the pilot list', returnFocus: 'pilot-add',
      extra: (st) => h.select({ id: 'chg-deal', name: 'deal', label: 'Deal', value: (st.values && st.values.deal) || '', error: st.fieldErrors && st.fieldErrors.deal, options: [{ value: '', label: 'Choose a Deal' }, ...free.map((d) => ({ value: d.id, label: `${d.id} · ${TN.customer(d.customer) ? TN.customer(d.customer).name : ''} · ${d.title}` }))] }),
      onConfirm: (reason, fd) => { const id = fd.get('deal'); if (!id) return { fieldErrors: { deal: 'Choose a Deal.' }, focus: 'chg-deal' }; P.deals.push({ deal: id, by: meName(), at: H().nowStamp(), reason }); return { toast: `${id} is on the pilot list.` }; },
    });
  });
  TN.act('pilot-remove', (el) => {
    const P = S.msg.pilot; const id = el.dataset.id;
    changeDialog({
      title: `Remove ${id} from the pilot list?`, effect: P.on ? 'Its customer stops getting messages. Messages already sent stay recorded.' : 'Nothing changes now: every Deal gets messages while the pilot list is off.', affected: esc(`The customer of ${id}`), confirmLabel: 'Remove from the pilot list', returnFocus: 'pilot-add',
      onConfirm: () => { P.deals = P.deals.filter((x) => x.deal !== id); return { toast: `${id} removed from the pilot list.` }; },
    });
  });

  /* ---------------------------------------------------------------
     E-mails: templates (staff and suppliers only) and delivery health
     --------------------------------------------------------------- */
  S.templates = S.templates || [
    { id: 't-due', group: 'Staff reminders', name: 'Instalment due soon', to: 'The Deal’s Sales owner, copy to Accounts', subject: 'Due in {days} days: {instalment} {amount} on {deal}', body: 'Hello {staff_name},\n\n{customer} has {instalment} of {amount} due on {due_date} for {deal} ({trip}).\nPlease remind the customer and report the payment in the CRM when it arrives.\n\nOpen the Deal: {deal_link}', on: true, edited: last('2026-10-26 12:10', SUPER.anjali, 'on', 'Wording agreed with Accounts.') },
    { id: 't-overdue', group: 'Staff reminders', name: 'Instalment overdue', to: 'The Deal’s Sales owner, copy to Accounts; the branch Manager after the escalation days', subject: 'Overdue {days_late} days: {instalment} {amount} on {deal}', body: 'Hello {staff_name},\n\n{instalment} of {amount} for {deal} was due on {due_date} and is still unpaid.\nPlease call {customer} today and write what they said on the Deal.\n\nOpen the Deal: {deal_link}', on: true, edited: last('2026-10-26 12:10', SUPER.anjali, 'on', 'Wording agreed with Accounts.') },
    { id: 't-invoice', group: 'Staff reminders', name: 'Supplier invoice missing after the trip', to: 'The Purchase person on the task', subject: 'Invoice missing: {supplier} for {deal}', body: 'Hello {staff_name},\n\nThe trip for {deal} ended on {trip_end}. The original invoice from {supplier} is not in the CRM yet.\nPlease ask the supplier for it and upload it on the task.\n\nOpen the task: {task_link}', on: true, edited: null },
    { id: 't-nottaken', group: 'Staff reminders', name: 'Task not taken', to: 'Everyone in the department, copy to the branch Manager', subject: 'Not taken for {hours} hours: {task} ({deal})', body: 'Hello,\n\nThe {department} task “{task}” for {deal} has waited {hours} hours without an owner.\nPlease take it in the CRM.\n\nOpen the queue: {queue_link}', on: true, edited: null },
    { id: 't-escalate', group: 'Staff reminders', name: 'Escalation to the branch Manager', to: 'The branch Manager', subject: 'Late work in {branch}: {count} items', body: 'Hello {staff_name},\n\nThese items are late and need you:\n{items}\n\nOpen Approvals: {approvals_link}', on: true, edited: null },
    { id: 't-rate', group: 'Suppliers', name: 'Supplier rate request', to: 'The supplier’s reservations e-mail', subject: 'Rate request: {hotel}, {check_in} to {check_out}, {rooms}', body: 'Dear {supplier_contact},\n\nPlease share your best rate and availability for:\n{hotel} · {check_in} to {check_out} · {rooms} · {meal_plan}\nGuests: {travellers}\n\nRegards,\n{staff_name}\nHoliday Chacha Pvt LTD, Jodhpur', on: true, edited: last('2026-10-25 15:30', SUPER.harsh, 'on', 'Purchase asked for the meal plan line.') },
    { id: 't-booking', group: 'Suppliers', name: 'Booking request to the supplier', to: 'The supplier’s reservations e-mail', subject: 'Booking request: {hotel}, {check_in}, guest {lead_guest}', body: 'Dear {supplier_contact},\n\nPlease confirm the booking below at the agreed rate of {agreed_rate}:\n{hotel} · {check_in} to {check_out} · {rooms} · {meal_plan}\nLead guest: {lead_guest}\n\nPlease reply with your confirmation number.\n\nRegards,\n{staff_name}\nHoliday Chacha Pvt LTD, Jodhpur', on: true, edited: null },
  ];
  S.mail = S.mail || { sender: 'Holiday Chacha CRM <crm@mail.holidaychacha.in>', verified: '20 Oct 2026', sent7: 146, delivered7: 146, bounced7: 0, failed7: 0, recent: [
    { at: '2026-10-27 09:00', what: 'Instalment overdue', to: 'Mohit Gehlot', status: 'delivered' },
    { at: '2026-10-27 09:00', what: 'Instalment overdue', to: 'Ritika Sharma', status: 'delivered' },
    { at: '2026-10-27 09:00', what: 'Supplier invoice missing after the trip', to: 'Imran Qureshi', status: 'delivered' },
    { at: '2026-10-26 16:12', what: 'Supplier rate request', to: 'Thar Desert Camps and Safaris', status: 'delivered' },
    { at: '2026-10-05 10:41', what: 'Staff invitation', to: 'Invited staff member', status: 'failed', note: 'Mailbox did not exist; the address was corrected and the invitation resent.' },
  ] };
  areaPage('/app/admin/emails', 'emails', () => {
    const h = H(); const M = S.mail;
    const tplRow = (t) => `<li class="m-0 flex flex-col gap-2 px-4.5 py-3.5 sm:flex-row sm:justify-between sm:gap-4" data-slot="setting-row"><div class="min-w-0 flex-1"><h3 class="m-0 text-base font-semibold text-ink">${esc(t.name)}</h3><p class="m-0 mt-0.5 text-sm wrap-anywhere text-copy">Subject: ${esc(t.subject)}</p><p class="m-0 mt-0.5 text-sm text-quiet">To: ${esc(t.to)}</p><p class="m-0 mt-0.5 text-sm text-quiet">${t.edited ? `Last edit: ${esc(t.edited.by === meName() ? 'you' : t.edited.by)}, ${dayOf(t.edited.at)}` : 'Not edited yet'}</p></div><div class="flex shrink-0 flex-wrap items-center gap-2">${h.stateBadge(t.on ? 'on' : 'off', t.name, { on: 'In use', off: 'Not sent' })}${h.btn(`Edit<span class="sr-only"> ${esc(t.name)}</span>`, { size: 'sm', act: 'tpl-edit', id: t.id, attrs: ` id="tpl-btn-${t.id}"` })}${h.btn(`Send a test to me<span class="sr-only">: ${esc(t.name)}</span>`, { size: 'sm', variant: 'ghost', act: 'tpl-test', id: t.id })}</div></li>`;
    const MAIL_LOOK = { delivered: ['success', 'Delivered'], failed: ['danger', 'Failed'], bounced: ['warning', 'Bounced'] };
    return {
      line: 'Templates for staff reminders and supplier requests, and whether e-mails arrive. Customer messages are in their own area.',
      body: h.card({ title: 'Delivery', titleIcon: 'mail', aside: h.badge('success', 'Delivering'), bodyClass: 'px-4.5 py-4 flex flex-col gap-3', body:
        `<p class="m-0 text-copy">${M.sent7} sent in the last 7 days · ${M.delivered7} delivered · ${M.bounced7 + M.failed7} bounced or failed (last failure 5 Oct 2026).</p>`
        + `<details class="text-sm"><summary class="w-fit cursor-pointer rounded-chip font-medium text-brand-strong ${FOCUS}">Sender and recent e-mails</summary><div class="mt-2 flex flex-col gap-3">${h.summary([['Sender', esc(M.sender)], ['Sender domain', `Verified on ${esc(M.verified)} (SPF and DKIM pass)`], ['Last e-mail sent', esc(TN.fmt.dateTime(M.recent[0].at))]])}${h.table({ label: 'Recent e-mails', caption: 'Recent e-mails, newest first', cols: [{ label: 'Sent' }, { label: 'Template' }, { label: 'To' }, { label: 'Result' }], rows: M.recent.map((r) => [esc(TN.fmt.dateTime(r.at)), esc(r.what), esc(r.to) + (r.note ? `<span class="block text-sm text-quiet">${esc(r.note)}</span>` : ''), h.badge(MAIL_LOOK[r.status][0], MAIL_LOOK[r.status][1])]) })}</div></details>` })
        + ['Staff reminders', 'Suppliers'].map((g) => block(g, rowsList(S.templates.filter((t) => t.group === g).map(tplRow).join(''), g))).join(''),
    };
  });
  const tplDrawer = (id, st = {}) => {
    const t = S.templates.find((x) => x.id === id); const h = H();
    TN.drawer({ title: `Edit: ${t.name}`, description: `To: ${t.to}`, wide: true, body: `<form data-act="tpl-save" data-id="${id}" id="tpl-form" class="flex flex-col gap-4" novalidate>${h.input({ id: 'tpl-subject', name: 'subject', label: 'Subject', value: st.subject ?? t.subject, error: st.subjectError })}${h.textarea({ id: 'tpl-body', name: 'body', label: 'Message', rows: 10, max: 4000, value: st.body ?? t.body, hint: 'Words in {curly brackets} are filled in by the CRM when it sends. Keep them as they are.' })}${h.choiceGroup('Send this e-mail', h.choice('radio', { id: 'tpl-on', name: 'on', value: 'on', label: 'Yes, send it', checked: (st.on ?? (t.on ? 'on' : 'off')) === 'on' }) + h.choice('radio', { id: 'tpl-off', name: 'on', value: 'off', label: 'No, do not send it', checked: (st.on ?? (t.on ? 'on' : 'off')) === 'off' }))}${h.textarea({ id: 'tpl-reason', name: 'reason', label: 'Reason', optional: true, hint: 'Saved with your name and the time. You may leave it empty.', value: st.reason || '' })}</form>`,
      footer: h.btn('Cancel', { attrs: ' data-close' }) + h.btn('Save template', { variant: 'primary', type: 'submit', attrs: ' form="tpl-form"' }) });
    if (st.focus) { const el = document.getElementById(st.focus); if (el) el.focus(); }
  };
  TN.act('tpl-edit', (el) => tplDrawer(el.dataset.id));
  TN.act('tpl-save', (f) => {
    const id = f.dataset.id; const t = S.templates.find((x) => x.id === id);
    const v = Object.fromEntries(new FormData(f).entries());
    if (!v.subject.trim()) { tplDrawer(id, { ...v, subjectError: 'Enter a subject.', focus: 'tpl-subject' }); return; }
    t.subject = v.subject.trim(); t.body = v.body; t.on = v.on === 'on'; t.edited = { at: H().nowStamp(), by: meName(), to: 'on', reason: String(v.reason || '').trim() };
    TN.closeOverlay(); TN.toast(`Template “${t.name}” saved.`, 'success'); TN.refresh();
    setTimeout(() => { const b = document.getElementById('tpl-btn-' + id); if (b) b.focus(); }, 0);
  });
  TN.act('tpl-test', (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); S.mail.sent7++; S.mail.delivered7++; S.mail.recent.unshift({ at: H().nowStamp(), what: t.name + ' (test)', to: meName(), status: 'delivered' }); TN.toast(`Test of “${t.name}” sent to your work e-mail.`, 'success'); TN.refresh(); });

  /* ---------------------------------------------------------------
     Reminder rules (staff only): switch row + a number in the dialog
     --------------------------------------------------------------- */
  const R = () => D.reminderRules;
  const RULES = [
    { key: 'rule_dueSoon', r: 'dueSoon', title: 'Instalment due soon', detail: 'Reminds the Deal’s Sales owner and Accounts before an instalment is due.', who: 'Sales owners and Accounts', unit: 'days', label: 'Days before the due date', min: 1, max: 14, line: (n) => `${n} days before the due date, at 9:00 am` },
    { key: 'rule_overdue', r: 'overdue', title: 'Instalment overdue', detail: 'Reminds the Deal’s Sales owner and Accounts every morning while an instalment is unpaid.', who: 'Sales owners and Accounts', unit: 'days', label: 'Days after the due date', min: 1, max: 7, line: (n) => `From ${n} ${n === 1 ? 'day' : 'days'} after the due date, every day at 9:00 am` },
    { key: 'rule_escalateOverdue', r: 'escalateOverdue', title: 'Overdue instalment goes to the Manager', detail: 'The branch Manager sees it in Approvals › Escalations and gets an e-mail.', who: 'Branch Managers', unit: 'days', label: 'Days overdue', min: 1, max: 30, line: (n) => `${n} or more days overdue` },
    { key: 'rule_accountsWait', r: 'accountsWait', title: 'Booking waiting for Accounts', detail: 'A submitted booking that Accounts has not reviewed goes to the branch Manager.', who: 'Branch Managers and Accounts', unit: 'days', label: 'Days waiting', min: 1, max: 7, line: (n) => `After ${n} ${n === 1 ? 'day' : 'days'} waiting` },
    { key: 'rule_notTaken', r: 'notTaken', title: 'Task not taken', detail: 'Reminds the department, with a copy to the branch Manager, when nobody takes a new task.', who: 'Purchase, Flight, Visa and branch Managers', unit: 'hours', label: 'Hours without an owner', min: 1, max: 48, line: (n) => `After ${n} working hours` },
    { key: 'rule_stuck', r: 'stuck', title: 'Stuck task goes to the Manager', detail: 'A task in progress with no update shows in Approvals › Escalations so the Manager can move it.', who: 'Branch Managers', unit: 'days', label: 'Days without an update', min: 1, max: 14, line: (n) => `After ${n} days without an update` },
    { key: 'rule_invoiceMissing', r: 'invoiceMissing', title: 'Supplier invoice missing after the trip', detail: 'Reminds the Purchase person on the task to get the supplier’s original invoice.', who: 'Purchase', unit: 'days', label: 'Days after the trip ends', min: 1, max: 30, line: (n) => `${n} days after the trip ends, then weekly` },
  ];
  RULES.forEach((x) => {
    if (!S.sw[x.key]) S.sw[x.key] = { title: x.title, effect: x.detail, who: x.who, state: R()[x.r].on ? 'on' : 'off', last: x.r === 'escalateOverdue' ? last('2026-10-26 18:30', SUPER.anjali, 'on', 'Owner decision 26 Oct: the Manager hears about dues after 3 days.') : null };
    PARAMS[x.key] = { label: x.label, min: x.min, max: x.max, hint: `${x.min} to ${x.max} ${x.unit}.`, get value() { return R()[x.r][x.unit]; }, set: (n, st) => { R()[x.r][x.unit] = n; R()[x.r].on = st === 'on'; } };
  });
  areaPage('/app/admin/reminders', 'reminders', () => ({
    line: 'When staff get reminders and when late work goes to the branch Manager. Reminders go to staff only, as a notice and an e-mail.',
    body: block('Rules for every branch', rowsList(RULES.map((x) => swRow(x.key, { valueLine: esc(x.line(R()[x.r][x.unit])) })).join(''), 'Reminder rules')),
  }));

  /* ---------------------------------------------------------------
     System health (read only)
     --------------------------------------------------------------- */
  areaPage('/app/admin/bookings', 'health', () => {
    const h = H();
    const drafts = D.deals.filter((d) => ['in_progress', 'ready_to_submit', 'quotation_accepted'].includes(d.bookingState)).length;
    const submitted = D.deals.filter((d) => d.submittedAt).length;
    const sv = Object.values(D.services);
    const rb = S.sw.real_booking;
    const item = (icon, title, badge, text) => `<li class="m-0 flex flex-col gap-1 px-4.5 py-3 sm:flex-row sm:justify-between sm:gap-4"><div class="min-w-0 flex-1"><p class="m-0 flex items-center gap-2 font-semibold text-ink">${h.ic(icon, 'size-4 shrink-0 text-quiet')}${title}</p><p class="m-0 mt-0.5 text-sm text-copy">${text}</p></div><div class="shrink-0">${badge}</div></li>`;
    return {
      body: h.card({ title: 'Bookings', aside: h.badge(rb.state === 'on' ? 'success' : 'neutral', `Real bookings: ${rb.state}`, { icon: rb.state === 'on' ? 'circle-check' : 'circle-off' }), bodyClass: 'px-4.5 py-4 flex flex-col gap-2', body:
        `<p class="m-0 text-copy"><span class="font-semibold text-ink">Next:</span> ${D.deals.filter((d) => d.bookingState === 'waiting_for_accounts').length} booking waiting for the Accounts review.</p>`
        + `<p class="m-0 text-copy">${drafts} drafts (1 needs details) · ${submitted} submitted · ${sv.filter((s) => !s.assignee && s.taskStatus === 'new').length} tasks waiting to be taken · ${sv.filter((s) => s.taskStatus === 'in_progress').length} in progress · ${D.notices.filter((n) => String(n.at).startsWith(TN.TODAY)).length} staff notices today.</p>`
        + `<p class="m-0 text-sm text-quiet">Environment: Production. Switches are changed in ${h.link('#/app/admin/workflow', 'Features')}.</p>` })
        + block('PDFs, e-mail alerts, Bitrix and backups', rowsList(
          item('file-text', 'Online PDF maker', h.badge('success', 'On'), 'Quotation, itinerary, Invoice and voucher PDFs are made online.')
          + item('mail', 'E-mail alerts', h.badge('success', 'On'), `A stopped sync e-mails the Super Admins. 2 staff e-mails failed on 5 Oct 2026; none since. ${h.link('#/app/admin/emails', 'Open E-mails')}`)
          + item('refresh-cw', 'Bitrix updates', h.badge('success', 'Receiving deals'), `Last run ${fmtAt(S.bitrix.lastRun)}. ${h.link('#/app/admin/integration', 'Open Bitrix connection')}`)
          + item('shield-check', 'Backups', h.badge('success', 'Daily'), `${esc(S.backup.kind)}: last ${esc(fmtAt(S.backup.at))}, kept ${esc(S.backup.keep)}.`), 'System parts')),
    };
  });

  /* ---------------------------------------------------------------
     Home rows (Super Admin)
     --------------------------------------------------------------- */
  TN.homeRow({ roles: ['admin'], label: 'Big switches waiting for the owner’s decision', count: () => ['real_booking', 'supplier_confirmation'].filter((k) => S.sw[k].state !== 'on').length, href: '#/app/admin/workflow', action: 'Open Features', icon: 'settings', section: 'What needs you' });
  TN.homeRow({ roles: ['admin'], label: 'Staff invitations not accepted yet', count: () => S.staff.filter((p) => p.status === 'invited').length, href: '#/app/admin/staff', action: 'Open People and access', icon: 'users', section: 'What needs you' });
})();
