/* =====================================================================
   Agent H · Settings (all /app/admin/* tabs) and TN.settingsTabs(role).
   Live tabs follow crm/src/modules/settings/contracts.ts settingsTabsFor and
   app/app/shell-permissions.ts. Uses the markup helpers in TN.hm (80-manager.js).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const H = () => TN.hm;
  const D = TN.DATA;

  /* ---------------------------------------------------------------
     Tabs (live rules)
     Super Admin: every tab. Accounts: Imports only (customer list; live
     canImport). Money rules is Super Admin without Accounts in that company;
     Company needs an admin right, which Accounts does not hold. Others: none.
     --------------------------------------------------------------- */
  const TABS = [
    { key: 'people', label: 'People and access', href: '#/app/admin/staff', match: ['/app/admin/staff', '/app/admin/access'], line: 'Staff accounts, sign-in recovery and extra access to deals.' },
    { key: 'company', label: 'Company and branches', href: '#/app/admin/company', match: ['/app/admin/company'], line: 'Company details printed on documents, and the branches. Read only.' },
    { key: 'money', label: 'Money rules', href: '#/app/admin/finance-policy', match: ['/app/admin/finance-policy'], line: 'Receipt and cash limits, and which payment modes are available.' },
    { key: 'bitrix', label: 'Bitrix connection', href: '#/app/admin/integration', match: ['/app/admin/integration'], line: 'How the CRM reads from Bitrix: status, which deals and leads come in, and the Bitrix switches.' },
    { key: 'imports', label: 'Imports', href: '#/app/admin/imports', match: ['/app/admin/imports'], line: 'Hotel and customer lists from a CSV file: check first, then import.' },
    { key: 'features', label: 'Features', href: '#/app/admin/workflow', match: ['/app/admin/workflow'], line: 'Switch CRM features on or off for every branch.' },
    { key: 'emails', label: 'E-mails', href: '#/app/admin/emails', match: ['/app/admin/emails'], line: 'Staff and supplier e-mail templates, and whether e-mails are delivered.' },
    { key: 'reminders', label: 'Reminders', href: '#/app/admin/reminders', match: ['/app/admin/reminders'], line: 'When staff get reminders, and when late work goes to the branch Manager.' },
    { key: 'health', label: 'System health', href: '#/app/admin/bookings', match: ['/app/admin/bookings'], line: 'Bookings, PDFs, email alerts and Bitrix updates at a glance. Read only.' },
  ];
  TN.settingsTabs = (role) => {
    if (role === 'admin') return TABS.map((t) => ({ href: t.href, label: t.label }));
    if (role === 'accounts' || role === 'checker') return [{ href: '#/app/admin/imports?kind=customer', label: 'Imports' }];
    return [];
  };
  const visibleTabs = () => TABS.filter((t) => TN.settingsTabs(TN.role).some((x) => x.label === t.label)).map((t) => (TN.is('accounts', 'checker') && t.key === 'imports' ? { ...t, href: '#/app/admin/imports?kind=customer' } : t));

  /** The live Settings frame around one tab. */
  function frame(key, inner) {
    const h = H();
    const vis = visibleTabs();
    const open = vis.find((t) => t.key === key);
    return `<div class="font-sans text-base text-copy" data-slot="settings-frame"><header class="flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between mb-3" data-slot="page-header"><div class="min-w-0"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">Settings</h1><p class="m-0 mt-1.5 text-base text-quiet">Changes here affect every branch. Live changes need the owner’s APPROVE first; write it in the reason.</p></div></header>`
      + `<div class="mb-6"><div class="flex flex-col gap-2.5">${h.tabs('Settings sections', vis.map((t) => ({ href: t.href, label: t.label, current: t.key === key })))}${open ? `<p class="m-0 text-sm text-quiet" data-slot="settings-tab-line"><span class="font-semibold text-copy">${esc(open.label)}:</span> ${esc(open.line)}</p>` : ''}</div></div>`
      + `<div class="flex flex-col gap-5">${inner}</div></div>`;
  }
  const adminPage = (path, key, title, render) => TN.page(path, { nav: '/app/admin', roles: key === 'imports' ? ['admin', 'accounts', 'checker'] : ['admin'], title, render: (p, q) => frame(key, render(p, q)) });

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
    { key: 'su-nikhil', name: SUPER.nikhil, email: 'nikhil.arora@holidaychacha.in', role: 'Super Admin', branch: 'Jodhpur', status: 'active', mfa: true, lastEmail: 'Password reset email: handed to the mail service at 22 Oct 2026, 11:05 am IST' },
    { key: 'x-rohit', name: 'Rohit Sankhla', email: 'rohit.sankhla@holidaychacha.in', role: 'Super Admin', branch: '', status: 'deactivated', mfa: true, lastEmail: 'No email sent from this CRM yet' },
    { key: 'x-tanvi', name: 'Tanvi Bohra', email: 'tanvi.bohra@holidaychacha.in', role: 'Sales', branch: 'Jodhpur', status: 'invited', mfa: false, lastEmail: 'Invitation (resent) (attempt 2): Handed to the mail service at 26 Oct 2026, 4:15 pm IST' },
  ];
  S.grants = S.grants || [
    { id: 'g1', who: 'Vikram Rathore', perm: 'View deals', scope: 'Jodhpur branch', reason: 'Branch Manager reads every Jodhpur deal, including those owned by Sales on leave.', expires: 'No expiry' },
    { id: 'g2', who: 'Sunil Mehta', perm: 'See prices and margin', scope: 'Whole entity (Holiday Chacha Pvt LTD)', reason: 'Accounts checks selling price against receipts for every branch.', expires: '31 Mar 2027' },
  ];
  S.policy = S.policy || {
    versions: [{ v: 1, status: 'in force', effective: '13 Oct 2026, 12:00 am IST', saved: '12 Oct 2026, 06:40 pm IST', by: SUPER.anjali, receiptMax: 1000000, cashDay: 199999, cashTrip: 199999, depositDays: 1, count: true, reason: 'Owner APPROVE 12 Oct: money rules for the Jodhpur pilot as agreed with the CA.' }],
    ceilings: { cash: 199999, receipt: 10000000 },
  };

  /* Switch registry: live feature switches, Bitrix switches and the big switches. */
  const last = (at, by, to, reason) => ({ at, by, to, reason });
  S.sw = S.sw || {
    service_items_enabled: { title: 'Book now (service list)', detail: 'New bookings list each sold service; submitting creates one task per service.', state: 'on', last: last('2026-10-20 14:45', SUPER.harsh, 'on', 'Owner APPROVE in chat on 20 Oct: Book now with the service list for Jodhpur.') },
    won_deal_count: { title: 'Count of won deals with no booking (on Home)', detail: 'Sales and branch Managers see on Home how many deals reached “Won - Payment Received” in Bitrix but have no booking yet. Count only; nothing is created.', state: 'on', last: last('2026-10-20 16:10', SUPER.anjali, 'on', 'Owner APPROVE 20 Oct: show won deals without a booking on Home.') },
    visa_passport_tasks_enabled: { title: 'Visa and passport tasks', detail: 'On: each sold visa or passport service gets one task for the Visa and passport desk. Off: those services are saved and wait; no task is created or deleted.', state: 'on', last: last('2026-10-24 12:50', SUPER.anjali, 'on', 'Owner APPROVE 24 Oct: Visa and passport desk for the pilot.') },
    prefill_auto_fill: { title: 'Fill new bookings and quotations from Bitrix', detail: 'On: when staff start a booking or create a quotation, empty fields get the Bitrix dates and contact details once, marked “From Bitrix”. Nothing is filled later, on reload, or over what staff typed.', state: 'on', last: last('2026-10-27 13:47', SUPER.nikhil, 'on', 'Owner APPROVE 27 Oct: fill new bookings from Bitrix once.') },
    referral_drafts: { title: 'Referral drafts', detail: 'On: Sales and branch Managers can start quotations and itineraries for customers not in Bitrix yet. Until a draft is linked to a Bitrix lead or deal, only its owner and the branch Manager can open it.', state: 'off', last: null },
    bitrix_trip_facts_read: { title: 'Read trip facts from Bitrix', detail: 'Reads Booking Notes, traveller count, tour dates, Customer Type and the linked contact from Bitrix for bookings and quotations. Read only: nothing is written to Bitrix. “Fill new bookings and quotations from Bitrix” needs this switch on.', state: 'on', last: last('2026-10-14 13:00', SUPER.anjali, 'on', 'Owner APPROVE 14 Oct: read trip facts for bookings and quotations.') },
    lead_intake_unowned: { title: 'Bring in leads whose Bitrix owner is not a CRM salesperson', detail: 'Leads whose Bitrix owner is not a CRM salesperson come into the CRM and wait for an owner. Off: they are skipped.', state: 'on', last: last('2026-10-16 10:20', SUPER.nikhil, 'on', 'Owner APPROVE 16 Oct: bring in unowned leads so the Manager can hand them out.') },
    bitrix_id_proof_copy: { title: 'Copy ID proofs to the Bitrix deal', detail: 'Adds each ID proof stored from now on to the “Aadhar and Passports” field of the linked Bitrix deal. It only adds files; it never deletes or replaces files in Bitrix. Proofs stored earlier are not copied.', state: 'on', last: last('2026-10-22 17:30', SUPER.harsh, 'on', 'Owner APPROVE 22 Oct (DEC-43): copy ID proofs to Bitrix.') },
    bitrix_names: { title: 'Bitrix names', detail: 'Shows Bitrix stage, status and source names. Read-only; nothing is written to Bitrix.', state: 'on', last: last('2026-10-20 11:15', SUPER.anjali, 'on', 'Owner APPROVE 20 Oct: show Bitrix names.') },
    // Big switches (read-only in the live CRM today; buttons here for a Super Admin with two-step sign-in)
    real_booking: { big: true, title: 'Real bookings', detail: 'On: Sales can submit real bookings for Accounts review and the departments get tasks. Off: real Deals stay as drafts.', state: 'on', last: last('2026-10-13 10:05', SUPER.harsh, 'on', 'Owner APPROVE 13 Oct: real bookings for the Jodhpur pilot.'), history: [] },
    supplier_confirmation: { big: true, title: 'Supplier confirmation', detail: 'On: Purchase can add supplier offers, costs and files on real bookings and record the supplier’s confirmation. A confirmed supplier cannot be undone. Off: those steps are refused; tasks can still be taken and suppliers added.', state: 'off', last: null, history: [], checks: true },
    pay_bank: { big: true, pay: true, title: 'Bank transfer', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_upi: { big: true, pay: true, title: 'UPI', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_cash: { big: true, pay: true, title: 'Cash', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
    pay_cheque: { big: true, pay: true, title: 'Cheque', state: 'on', last: last('2026-10-13 11:30', SUPER.anjali, 'on', 'Owner APPROVE 13 Oct: bank transfer, UPI, cash and cheque for Jodhpur.'), history: [] },
  };
  const REVIEW = {
    service_items_enabled: ['New bookings list each sold service; submitting creates one task per service.', 'New bookings go back to the single booking form. Bookings already made keep their services.'],
    won_deal_count: ['Home shows the count of won deals with no booking to Sales and branch Managers.', 'Home stops showing the count. Nothing else changes.'],
    visa_passport_tasks_enabled: ['Switching on now creates 0 Visa and passport tasks: no sold visa or passport service is waiting.', 'Switching off creates and deletes nothing. Tasks already made stay with the desk. New visa and passport services wait without a task.'],
    prefill_auto_fill: ['Empty fields of new bookings and quotations get the Bitrix dates and contact details once.', 'Nothing is filled from Bitrix any more. What staff typed stays.'],
    referral_drafts: ['Sales and branch Managers can start quotations and itineraries for customers not in Bitrix yet.', 'No new referral drafts. Drafts already made stay readable.'],
    bitrix_trip_facts_read: ['Bookings and quotations read trip facts from Bitrix. Nothing is written to Bitrix.', 'Trip facts are not read. “Fill new bookings and quotations from Bitrix” stops filling.'],
    lead_intake_unowned: ['Leads whose Bitrix owner is not a CRM salesperson come in and wait for an owner. This changes which leads are in the CRM for everyone.', 'Those leads are skipped from the next sync. This changes which leads are in the CRM for everyone.'],
    bitrix_id_proof_copy: ['Each ID proof stored from now on is added to the linked Bitrix deal. Nothing is deleted in Bitrix.', 'ID proofs are no longer copied to Bitrix. Copies already made stay in Bitrix.'],
    bitrix_names: ['Lists, Lead and Deal pages show Bitrix stage, status and source names after the next daily read. Nothing is written to Bitrix.', 'Lists show the stage codes again. Nothing is written to Bitrix.'],
    real_booking: ['Sales can submit real bookings. Accounts reviews each one and the departments get their tasks.', 'New real bookings stay as drafts. Bookings already submitted keep going.'],
    supplier_confirmation: ['Purchase can enter offers, costs and the supplier’s confirmation on real bookings. A confirmed supplier cannot be undone: the record and its cost are locked for good. Costs above budget still wait for the branch Manager. Purchase still waits for the Accounts go-ahead.', 'New offers, costs, files and confirmations stop at once. Anything already confirmed stays confirmed and locked, and everything stays readable.'],
    pay: (t) => [`Accounts can record ${t} receipts again.`, `Accounts can no longer record new ${t} receipts. Receipts already recorded, verified or waiting stay as they are.`],
  };

  /* ---------------------------------------------------------------
     Setting rows and the change flow (live DA-256: Change → Review → Confirm)
     --------------------------------------------------------------- */
  let flow = null; // { key, step: 'choose' | 'review', target, reason, error, param }
  const results = {}; // key -> { tone, text }
  let focusTo = null;
  const fmtAt = (s) => { const [d, t] = s.split(' '); return `${TN.fmt.date(d)}, ${t} IST`; };
  const meName = () => TN.me().name;
  const ICN = 'mt-0.5 size-3.5 shrink-0 text-faint';

  function lastLine(sw) {
    const h = H();
    const l = sw.last;
    const txt = !l ? 'No change recorded since change tracking started.' : `Last changed on ${fmtAt(l.at)} by ${l.by === meName() ? 'you' : esc(l.by)}: switched ${l.to}.<span class="block wrap-break-word text-copy">Reason: “${esc(l.reason)}”</span>`;
    return `<p class="m-0 flex items-start gap-1.5" data-slot="setting-last-change">${h.ic('rotate-ccw-clock', ICN)}<span class="min-w-0">${txt}</span></p>`;
  }
  const lockLine = (text) => `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${H().ic('lock', ICN)}<span>${esc(text)}</span></p>`;
  const changeBtnCls = () => H().BTN_BASE.replace('whitespace-nowrap ', '') + ' border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink px-3.5 text-base h-auto min-h-10 max-w-full py-2 text-left whitespace-normal';

  /** Safety checks before supplier confirmation can be switched on. */
  function supplierChecks() {
    const staff = S.staff;
    const active = (role) => staff.filter((p) => p.role === role && p.status === 'active' && p.mfa && (p.branch === 'Jodhpur'));
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
  const checklist = (checks) => `<ul class="checklist" aria-label="Safety checks">${checks.map((c) => `<li class="${c.ok ? 'check-ok' : 'check-missing'}"><span aria-hidden="true" class="status-glyph">${c.ok ? '✓' : '✗'}</span><span><strong>${esc(c.label)}: </strong>${c.ok ? '' : '<span class="visually-hidden">Missing. </span>'}${esc(c.text)}</span></li>`).join('')}</ul>`;

  /** Who may change a switch. Returns a refusal sentence or null. */
  function refusal(key) {
    const sw = S.sw[key] || {};
    if (!TN.is('admin')) return 'Only a Super Admin can change this. Nothing was changed.';
    if (sw.big) { const me = S.staff.find((p) => p.key === 'admin'); if (!me || !me.mfa) return 'Only a Super Admin signed in with two-step sign-in can change this. Nothing was changed.'; }
    return null;
  }

  /** One switch row. o: { key, sw, readOnly, lockText, extra, words, param } */
  function settingRow(key, o = {}) {
    const h = H();
    const sw = o.sw || S.sw[key];
    const res = results[key];
    const canChange = !o.readOnly && TN.is('admin');
    let change = '';
    if (canChange) {
      const open = flow && flow.key === key;
      change = `<div class="flex flex-col gap-3" data-slot="setting-change"><div tabindex="-1" id="set-result-${key}" class="outline-none empty:hidden" data-slot="setting-result">${res ? h.notice(res.tone, `<p>${res.text}</p>`, { role: res.tone === 'success' ? 'status' : 'alert' }) : ''}</div>`
        + (open ? changeForm(key, sw, o) : `<div><button type="button" class="${changeBtnCls()}" data-slot="button" data-act="set-open" data-id="${key}" id="set-trigger-${key}">Change ${esc(sw.title)}</button></div>`) + `</div>`;
    }
    const history = sw.big && sw.history && sw.history.length ? `<details class="font-sans text-sm text-quiet"><summary class="w-fit cursor-pointer rounded-chip text-sm font-medium text-brand-strong outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none">Change history (${sw.history.length})</summary><ul class="m-0 mt-2.5 flex list-none flex-col gap-1 p-0">${sw.history.map((x) => `<li>${fmtAt(x.at)} · ${esc(x.by)} · switched ${x.to} · “${esc(x.reason)}”</li>`).join('')}</ul></details>` : '';
    return `<li class="m-0 flex flex-col gap-3 rounded-control border border-line bg-card px-4 py-3.5" data-slot="setting-row" data-key="${key}"><div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2"><div class="min-w-0 flex-1 basis-64"><h4 id="setting-${key}" class="m-0 text-base font-semibold text-ink">${esc(sw.title)}</h4>${o.detail || sw.detail ? `<p class="m-0 mt-0.5 text-sm text-copy">${o.detail || esc(sw.detail)}</p>` : ''}</div>${h.stateBadge(sw.state, sw.title, o.words)}</div>`
      + `<div class="flex flex-col gap-1 text-sm text-quiet"><p class="m-0 flex items-start gap-1.5">${h.ic('users', ICN)}<span>Affects: ${esc(o.affects || 'every branch')}</span></p>${o.valueLine ? `<p class="m-0 flex items-start gap-1.5">${h.ic('clock', ICN)}<span>${o.valueLine}</span></p>` : ''}${lastLine(sw)}</div>`
      + (o.extra || '') + history + (canChange ? change : lockLine(o.lockText || 'Changed by the CRM team with the owner’s approval, not here.')) + `</li>`;
  }

  function changeForm(key, sw, o) {
    const h = H();
    const target = flow.target;
    const stepH = 'm-0 text-base font-semibold text-ink outline-none';
    const title = sw.title;
    const reviewTexts = sw.pay ? REVIEW.pay(title) : REVIEW[key] || o.review || ['', ''];
    let inner;
    if (flow.step === 'choose') {
      inner = `<h4 tabindex="-1" id="set-step-${key}" class="${stepH}">Change ${esc(title)}</h4>`
        + h.choiceGroup('Set it to', h.choice('radio', { id: `set-${key}-on`, name: 'state-choice', value: 'on', label: 'On', desc: sw.state === 'on' ? 'It is on now.' : '', checked: target === 'on', change: 'set-target' }) + h.choice('radio', { id: `set-${key}-off`, name: 'state-choice', value: 'off', label: 'Off', desc: sw.state === 'off' ? 'It is off now.' : '', checked: target === 'off', change: 'set-target' }))
        + (o.param ? h.input({ id: `set-${key}-param`, type: 'number', label: o.param.label, hint: o.param.hint, value: flow.param ?? o.param.value, attrs: ` min="${o.param.min}" max="${o.param.max}" step="1" inputmode="numeric"`, error: flow.paramError }) : '')
        + h.textarea({ id: `set-${key}-reason`, label: 'Why are you changing it?', hint: sw.big ? 'Write the owner’s APPROVE here. 10 to 500 characters, saved with your name.' : '10 to 500 characters, saved with your name. Write the owner’s APPROVE here.', value: flow.reason, error: flow.error })
        + `<div class="flex flex-wrap gap-2">${h.btn('Review change', { variant: 'primary', act: 'set-review', id: key })}${h.btn('Cancel', { variant: 'ghost', act: 'set-cancel', id: key })}</div>`;
    } else {
      const checks = sw.checks && target === 'on' ? supplierChecks() : null;
      const blocked = checks && checks.some((c) => !c.ok);
      const word = target;
      inner = `<h4 tabindex="-1" id="set-step-${key}" class="${stepH}">Review: turn ${esc(title)} ${word}</h4>`
        + h.notice('info', `<p>${esc(target === 'on' ? reviewTexts[0] : reviewTexts[1])}</p>${o.param ? `<p>${esc(o.param.label)}: <span class="font-semibold text-ink">${esc(flow.param)}</span></p>` : ''}<p>Changing this in the live CRM needs the owner’s APPROVE first. Write it in the reason.</p><p class="wrap-break-word">Reason: “${esc(flow.reason)}”</p>`, { role: 'none' })
        + (sw.big ? `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${h.ic('shield-check', ICN)}<span>You are signed in with two-step sign-in. The change is recorded with your name, the reason and the time.</span></p>` : '')
        + (checks ? `<div class="flex flex-col gap-2"><h5 class="m-0 text-base font-semibold text-ink">Before it can be switched on</h5>${checklist(checks)}${blocked ? h.notice('warning', '<p>A check above is missing, so this cannot be switched on yet. Nothing was changed.</p>', { role: 'status' }) : ''}</div>` : '')
        + `<div class="flex flex-wrap gap-2">${h.btn(`Turn ${esc(title)} ${word}`, { variant: 'primary', act: 'set-confirm', id: key, extra: 'h-auto min-h-10 max-w-full py-2 text-left whitespace-normal', attrs: blocked ? ' disabled' : '' })}${h.btn('Go back', { variant: 'ghost', act: 'set-back', id: key })}</div>`;
    }
    return `<form data-act="set-noop" novalidate aria-label="Change ${esc(title)}" class="flex flex-col gap-4 rounded-control border border-line-strong bg-canvas px-3.5 py-3.5">${inner}</form>`;
  }

  /* Change-flow actions (one shared set for every switch on every tab). */
  const PARAMS = {}; // key -> param def (registered by pages that render a numeric rule)
  const afterRender = () => { if (focusTo) { const el = document.getElementById(focusTo); focusTo = null; if (el) el.focus(); } };
  const rerender = (to) => { focusTo = to; TN.refresh(); setTimeout(afterRender, 0); };
  TN.act('set-noop', () => {});
  TN.act('set-open', (el) => {
    const key = el.dataset.id; const sw = S.sw[key];
    const no = refusal(key); delete results[key];
    if (no) { results[key] = { tone: 'danger', text: esc(no) }; rerender('set-result-' + key); return; }
    flow = { key, step: 'choose', target: sw.state === 'on' ? 'off' : 'on', reason: '', param: PARAMS[key] ? PARAMS[key].value : undefined };
    rerender('set-step-' + key);
  });
  TN.act('set-cancel', (el) => { const key = el.dataset.id; flow = null; rerender('set-trigger-' + key); });
  TN.act('set-target', (el) => { if (flow) flow.target = el.value; });
  const readForm = (key) => {
    const r = document.getElementById(`set-${key}-reason`); if (r) flow.reason = r.value;
    const p = document.getElementById(`set-${key}-param`); if (p) flow.param = p.value;
    const on = document.getElementById(`set-${key}-on`); if (on) flow.target = on.checked ? 'on' : 'off';
  };
  TN.act('set-review', (el) => {
    const key = el.dataset.id; readForm(key);
    const t = H().reasonOk(flow.reason);
    flow.error = t ? null : 'Not saved: say why, in 10 to 500 characters.';
    const P = PARAMS[key];
    if (P) { const n = Number(flow.param); flow.paramError = Number.isInteger(n) && n >= P.min && n <= P.max ? null : `Enter a whole number from ${P.min} to ${P.max}.`; }
    if (flow.paramError) { rerender(`set-${key}-param`); return; }
    if (!t) { rerender(`set-${key}-reason`); return; }
    flow.reason = t; flow.step = 'review'; rerender('set-step-' + key);
  });
  TN.act('set-back', (el) => { const key = el.dataset.id; flow.step = 'choose'; rerender('set-step-' + key); });
  TN.act('set-confirm', (el) => {
    const key = el.dataset.id; const sw = S.sw[key];
    const no = refusal(key);
    if (no) { results[key] = { tone: 'danger', text: esc(no) }; flow = null; rerender('set-result-' + key); return; }
    if (sw.checks && flow.target === 'on' && supplierChecks().some((c) => !c.ok)) { results[key] = { tone: 'danger', text: 'Not changed: a safety check is missing. Nothing was changed.' }; flow = null; rerender('set-result-' + key); return; }
    const at = H().nowStamp();
    const P = PARAMS[key];
    const paramChanged = P && Number(flow.param) !== P.value;
    if (sw.state === flow.target && !paramChanged) { results[key] = { tone: 'success', text: `${esc(sw.title)} was already ${flow.target}. Nothing changed.` }; flow = null; rerender('set-result-' + key); return; }
    if (sw.big) sw.history = [{ at, by: meName(), to: flow.target, reason: flow.reason }, ...(sw.history || [])];
    sw.state = flow.target; sw.last = { at, by: meName(), to: flow.target, reason: flow.reason };
    if (P) P.set(Number(flow.param), flow.target);
    results[key] = { tone: 'success', text: `${esc(sw.title)} is now ${sw.state === 'on' ? 'On' : 'Off'}${P ? ` (${esc(P.label.toLowerCase())}: ${esc(flow.param)})` : ''}. Recorded with your name and reason.` };
    const who = sw.big ? ['admin', 'manager', 'accounts', 'checker', 'purchase', 'sales'] : ['admin'];
    H().notify(who, `${meName()} turned ${sw.title} ${sw.state}. Reason: “${flow.reason}”`, { href: location.hash });
    flow = null; rerender('set-result-' + key);
  });

  const section = (id, title, desc, rows) => `<section aria-labelledby="${id}-heading" class="flex flex-col gap-3" data-slot="settings-section" id="${id}"><div class="flex flex-col gap-1"><h3 id="${id}-heading" class="m-0 text-lg font-semibold text-ink">${esc(title)}</h3>${desc ? `<p class="m-0 text-copy">${desc}</p>` : ''}</div><ul class="m-0 flex list-none flex-col gap-3 p-0" aria-labelledby="${id}-heading">${rows}</ul></section>`;
  const h2 = (title, desc) => H().sectionHead(title, desc);

  /* ---------------------------------------------------------------
     People and access
     --------------------------------------------------------------- */
  let invite = { values: {}, errors: {}, result: null };
  const peopleTabs = (cur) => H().tabs('People and access sections', [{ href: '#/app/admin/staff', label: 'Staff', current: cur === 'staff' }, { href: '#/app/admin/access', label: 'Extra access', current: cur === 'access' }]);
  const BRANCH_OPTS = '<option value="Ahmedabad">Ahmedabad</option><option value="Delhi">Delhi</option><option value="Jodhpur">Jodhpur (head office)</option>';
  const ROLE_LIST = ['Accounts', 'Flight', 'Manager', 'Purchase', 'Sales', 'Super Admin', 'Visa'];
  const opt = (v, l, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(l)}</option>`;
  const fieldErr = (e) => (e ? `<span class="field-issue">${esc(e)}</span>` : '');

  adminPage('/app/admin/staff', 'people', 'Staff', () => {
    const v = invite.values; const e = invite.errors;
    const counts = ROLE_LIST.map((r) => `${r} ${S.staff.filter((p) => p.role === r && p.status === 'active').length}`).join(' · ');
    const rows = S.staff.map((p, i) => {
      const me = p.key === 'admin';
      const badge = p.status === 'active' ? '<span class="badge ok">Active</span>' : p.status === 'invited' ? '<span class="badge warn">Invited, setup not finished</span>' : '<span class="badge danger">Deactivated</span>';
      const actions = me || p.status === 'deactivated' ? '<span class="brand-entity">None available</span>'
        : `<details class="staff-actions"><summary>Actions<span class="visually-hidden"> for ${esc(p.name)}</span></summary>`
          + (p.status === 'invited'
            ? `<div class="action-block"><h3>Invitation email</h3><p id="email-help-${i}" class="hint">Sends a new link to finish setup. The person still has to set up an authenticator app.</p><button type="button" class="button secondary" data-act="staff-email" data-id="${i}" data-kind="invite" aria-describedby="email-help-${i}">Resend invitation</button></div>`
            : `<div class="action-block"><h3>Password reset email</h3><p id="email-help-${i}" class="hint">Sends a link to choose a new password. Their authenticator app is still required to sign in.</p><button type="button" class="button secondary" data-act="staff-email" data-id="${i}" data-kind="reset" aria-describedby="email-help-${i}">Send password reset email</button></div>`)
          + `<form class="action-block danger-zone" data-act="staff-deactivate" data-id="${i}" novalidate><h3>Deactivate</h3><p id="deactivate-help-${i}" class="hint">Ends access at once: open sessions lose access to CRM data at their next request.</p><div class="field"><label for="deactivate-${i}">Reason for deactivation</label><input id="deactivate-${i}" name="reason" minlength="10" aria-describedby="deactivate-help-${i}"></div><button type="submit" class="button danger">Deactivate staff member</button></form></details>`;
      return `<tr><td>${esc(p.name)}${me ? ' (you)' : ''}</td><td>${esc(p.email)}</td><td>${badge}</td><td>${p.status === 'deactivated' ? '' : `${esc(p.role)}, ${esc(p.branch)}`}</td><td class="security-cell"><span>${p.status === 'invited' ? 'Authenticator not set up yet' : p.mfa ? 'Two-step sign-in on · No recovery in progress' : 'No recovery in progress'}</span></td><td class="security-cell"><span>${esc(p.lastEmail)}</span></td><td>${actions}</td></tr>`;
    }).join('');
    return `<div class="flex flex-col gap-5">${peopleTabs('staff')}<div class="flex flex-col gap-1"><h2 class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Staff</h2><p class="m-0 text-copy">Active in Jodhpur: ${esc(counts)}.</p></div>`
      + `<section class="panel" aria-labelledby="invite-heading"><h2 id="invite-heading">Invite a staff member</h2><p>The person receives an email to choose a password and must set up an authenticator before seeing any data. This CRM can invite: <strong>holidaychacha.in</strong>.</p><form data-act="staff-invite" novalidate><div role="status" aria-live="polite">${invite.result ? `<p class="message ${invite.result.tone}">${esc(invite.result.text)}</p>` : ''}</div><div class="panel-grid">`
      + `<div class="field"><label for="invite-name">Full name</label><input id="invite-name" maxlength="120" autocomplete="off" name="displayName" value="${esc(v.displayName || '')}"${e.displayName ? ' aria-invalid="true"' : ''}>${fieldErr(e.displayName)}</div>`
      + `<div class="field"><label for="invite-email">Work email</label><input id="invite-email" type="email" autocomplete="off" name="email" value="${esc(v.email || '')}"${e.email ? ' aria-invalid="true"' : ''}>${fieldErr(e.email)}</div>`
      + `<div class="field"><label for="invite-branch">Branch</label><select id="invite-branch" name="branch"${e.branch ? ' aria-invalid="true"' : ''}><option value="" disabled${v.branch ? '' : ' selected'}>Choose a branch</option>${BRANCH_OPTS.replace(`value="${v.branch}"`, `value="${v.branch}" selected`)}</select>${fieldErr(e.branch)}</div>`
      + `<div class="field"><label for="invite-role">Role</label><select id="invite-role" name="role"${e.role ? ' aria-invalid="true"' : ''}><option value="" disabled${v.role ? '' : ' selected'}>Choose a role</option>${ROLE_LIST.map((r) => opt(r, r, v.role === r)).join('')}</select>${fieldErr(e.role)}</div>`
      + `</div><button type="submit" class="button">Send invitation</button></form></section>`
      + `<div class="table-scroll" role="region" aria-label="Staff in your entities" tabindex="0"><table><caption>Staff in your entities</caption><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Status</th><th scope="col">Branch and role</th><th scope="col">Sign-in security</th><th scope="col">Last email</th><th scope="col">Actions</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  });
  TN.act('staff-invite', (f) => {
    const fd = Object.fromEntries(new FormData(f).entries());
    const errors = {};
    if (!fd.displayName || fd.displayName.trim().length < 2) errors.displayName = 'Enter the full name.';
    if (!/^[^@\s]+@holidaychacha\.in$/i.test(fd.email || '')) errors.email = 'Use a work email ending in @holidaychacha.in.';
    else if (S.staff.some((p) => p.email.toLowerCase() === fd.email.toLowerCase())) errors.email = 'This email already has a staff account.';
    if (!fd.branch) errors.branch = 'Choose a branch.';
    if (!fd.role) errors.role = 'Choose a role.';
    invite = { values: fd, errors, result: Object.keys(errors).length ? { tone: 'error', text: 'Not sent. Fix the fields marked below; what you typed is still here.' } : null };
    if (!Object.keys(errors).length) {
      S.staff.push({ key: 'n-' + Date.now(), name: fd.displayName.trim(), email: fd.email.trim(), role: fd.role, branch: fd.branch, status: 'invited', mfa: false, lastEmail: `Invitation: handed to the mail service at ${TN.fmt.dateTime(H().nowStamp())}` });
      invite = { values: {}, errors: {}, result: { tone: 'success', text: `Invitation sent to ${fd.email.trim()}. They must set up an authenticator before seeing any data.` } };
    }
    TN.refresh();
    setTimeout(() => { const first = document.querySelector('[aria-invalid="true"]'); if (first) first.focus(); }, 0);
  });
  TN.act('staff-email', (el) => {
    const p = S.staff[Number(el.dataset.id)];
    p.lastEmail = `${el.dataset.kind === 'invite' ? 'Invitation (resent)' : 'Password reset email'}: handed to the mail service at ${TN.fmt.dateTime(H().nowStamp())}`;
    TN.toast(`${el.dataset.kind === 'invite' ? 'Invitation resent' : 'Password reset email sent'} to ${p.name}.`, 'success'); TN.refresh();
  });
  TN.act('staff-deactivate', (f) => {
    const p = S.staff[Number(f.dataset.id)];
    const r = H().reasonOk(f.querySelector('input').value);
    if (!r) { TN.toast('Not deactivated: give a reason of at least 10 characters.', 'danger'); f.querySelector('input').focus(); return; }
    p.status = 'deactivated'; TN.toast(`${p.name} is deactivated. Open sessions lose access at their next request.`, 'success'); TN.refresh();
  });

  let grant = { values: {}, result: null };
  adminPage('/app/admin/access', 'people', 'Extra access', () => {
    const v = grant.values;
    const people = S.staff.filter((p) => p.status === 'active');
    const rows = S.grants.map((g, i) => `<tr><td>${esc(g.who)}</td><td>${esc(g.perm)}</td><td>${esc(g.scope)}</td><td>${esc(g.reason)}</td><td>${esc(g.expires)}</td><td><details><summary>Revoke<span class="visually-hidden"> ${esc(g.perm)} for ${esc(g.who)}</span></summary><form data-act="grant-revoke" data-id="${i}" novalidate><div class="field"><label for="revoke-${i}">Reason</label><input id="revoke-${i}" name="reason" minlength="10"></div><button type="submit" class="button danger">Revoke grant</button></form></details></td></tr>`).join('');
    return `<div class="flex flex-col gap-5">${peopleTabs('access')}<div class="flex flex-col gap-1"><h2 class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Extra access</h2><p class="m-0 text-copy">Extra access lets someone see more deals. It needs a reason and cannot be given to yourself. Purchase staff can never get price access.</p></div>`
      + `<section class="panel" aria-labelledby="grant-heading"><h2 id="grant-heading">Give extra access</h2><form data-act="grant-add" novalidate><div role="status" aria-live="polite">${grant.result ? `<p class="message ${grant.result.tone}">${esc(grant.result.text)}</p>` : ''}</div><div class="panel-grid">`
      + `<div class="field"><label for="grant-user">Staff member</label><select id="grant-user" name="who"><option value="" disabled${v.who ? '' : ' selected'}>Choose a staff member</option>${people.map((p) => opt(p.name, `${p.name} (${p.role})`, v.who === p.name)).join('')}</select></div>`
      + `<div class="field"><label for="grant-permission">Access</label><select id="grant-permission" name="perm">${opt('View deals', 'View deals', v.perm !== 'See prices and margin')}${opt('See prices and margin', 'See prices and margin', v.perm === 'See prices and margin')}</select></div>`
      + `<div class="field"><label for="grant-entity">Legal entity</label><select id="grant-entity" name="entity"><option>Holiday Chacha Pvt LTD</option></select></div>`
      + `<div class="field"><label for="grant-branch">Branch</label><span class="hint" id="grant-branch-hint">Leave as “Whole entity” only when the person needs every branch.</span><select id="grant-branch" name="branch" aria-describedby="grant-branch-hint">${opt('', 'Whole entity', !v.branch)}${['Ahmedabad', 'Delhi', 'Jodhpur'].map((b) => opt(b, b, v.branch === b)).join('')}</select></div>`
      + `<div class="field"><label for="grant-expiry">Expires on (optional)</label><input id="grant-expiry" type="date" name="expires" value="${esc(v.expires || '')}"></div></div>`
      + `<div class="field"><label for="grant-reason">Business reason</label><input id="grant-reason" minlength="10" maxlength="500" name="reason" value="${esc(v.reason || '')}"></div><button type="submit" class="button">Record grant</button></form></section>`
      + `<div class="table-scroll" role="region" aria-label="Extra access now" tabindex="0"><table><caption>Extra access now</caption><thead><tr><th scope="col">Staff member</th><th scope="col">Access</th><th scope="col">Scope</th><th scope="col">Reason</th><th scope="col">Expires</th><th scope="col">Actions</th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
  });
  TN.act('grant-add', (f) => {
    const v = Object.fromEntries(new FormData(f).entries());
    const p = S.staff.find((x) => x.name === v.who);
    let err = null;
    if (!p) err = 'Not recorded: choose a staff member.';
    else if (p.key === 'admin') err = 'Not recorded: you cannot give extra access to yourself.';
    else if (p.role === 'Purchase' && v.perm === 'See prices and margin') err = 'Not recorded: Purchase staff can never get price access.';
    else if (!H().reasonOk(v.reason)) err = 'Not recorded: give a business reason of 10 to 500 characters.';
    if (err) { grant = { values: v, result: { tone: 'error', text: err } }; TN.refresh(); return; }
    S.grants.push({ id: 'g' + Date.now(), who: p.name, perm: v.perm, scope: v.branch ? `${v.branch} branch` : 'Whole entity (Holiday Chacha Pvt LTD)', reason: v.reason.trim(), expires: v.expires ? TN.fmt.date(v.expires) : 'No expiry' });
    grant = { values: {}, result: { tone: 'success', text: `Recorded: ${p.name} can ${v.perm.toLowerCase()}.` } };
    TN.refresh();
  });
  TN.act('grant-revoke', (f) => {
    const i = Number(f.dataset.id); const g = S.grants[i];
    if (!H().reasonOk(f.querySelector('input').value)) { TN.toast('Not revoked: give a reason of at least 10 characters.', 'danger'); f.querySelector('input').focus(); return; }
    S.grants.splice(i, 1); TN.toast(`Revoked ${g.perm.toLowerCase()} for ${g.who}.`, 'success'); TN.refresh();
  });

  /* ---------------------------------------------------------------
     Company and branches (read only)
     --------------------------------------------------------------- */
  adminPage('/app/admin/company', 'company', 'Company and branches', () => {
    const h = H();
    const pending = `<span class="inline-flex items-start gap-1.5 text-copy">${h.ic('triangle-alert', 'mt-0.5 size-4 shrink-0 text-status-warning')}<span>Not given yet. Final PDFs for this branch are blocked until it is added.</span></span>`;
    const none = '<span><span aria-hidden="true">—</span><span class="sr-only">Not the pilot branch</span></span>';
    return `<div class="flex flex-col gap-1"><h2 id="company-heading" class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Company and branches</h2><p class="m-0 text-copy">Printed on quotations, itineraries, Invoices and vouchers. Read only: these details change only through a reviewed update by the CRM team, using the details Accounts approved.</p></div>`
      + h.card({ title: 'Company details', level: 3, titleIcon: 'building-complex', id: 'company-details', body: h.summary([['Company', 'Holiday Chacha Pvt LTD'], ['Registered address', '2nd Floor, Shree Tower, Residency Road, Sardarpura, Jodhpur, Rajasthan 342003'], ['PAN', '<span class="font-mono tabular-nums">AAGCH4821K</span>'], ['CIN', '<span class="font-mono tabular-nums">U63040RJ2019PTC064418</span>'], ['Customer Invoice numbers', '<span class="font-mono tabular-nums">HC/JDH/26-27/0001</span> and Advance Invoice <span class="font-mono tabular-nums">HC/JDH/ADV/26-27/0001</span>, per branch and financial year'], ['Printed on every Invoice', 'Not a tax invoice. The tax invoice is issued from Tally.']]) })
      + `<section aria-labelledby="branches-heading" class="flex flex-col gap-3"><h3 id="branches-heading" class="m-0 text-lg font-semibold text-ink">Branches</h3>`
      + h.table({ label: 'Branches', caption: 'Branches, their GSTIN and the Bitrix pilot branch', cols: [{ label: 'Branch' }, { label: 'State' }, { label: 'GSTIN' }, { label: 'Bitrix pilot' }], rows: [['Ahmedabad', 'Gujarat', pending, none], ['Delhi', 'Delhi', pending, none], ['Jodhpur', 'Rajasthan', '<span class="font-mono tabular-nums">08AAGCH4821K1ZQ</span>', h.badge('brand', 'Pilot branch', { icon: 'circle-check' })]] })
      + `</section><p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${h.ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}<span>To change these details, ask the CRM team. Accounts gives the approved details and the owner approves the change.</span></p>`;
  });

  /* ---------------------------------------------------------------
     Money rules
     --------------------------------------------------------------- */
  const rs = (n) => TN.fmt.inr(n);
  let pol = { values: null, result: null };
  adminPage('/app/admin/finance-policy', 'money', 'Money rules', () => {
    const P = S.policy; const cur = P.versions.find((x) => x.status === 'in force');
    const hist = P.versions.slice().reverse();
    const v = pol.values || { receiptMax: cur.receiptMax, cashDay: cur.cashDay, cashTrip: cur.cashTrip, depositDays: cur.depositDays, effective: '', reason: '', count: cur.count };
    const fieldN = (id, name, label, hint, val, extra = '') => `<div class="field"><label for="${id}">${label}</label><span id="${id}-hint" class="hint">${hint}</span><input id="${id}" aria-describedby="${id}-hint" inputmode="decimal" autocomplete="off" name="${name}" value="${esc(val)}"${extra}></div>`;
    const pay = ['pay_bank', 'pay_upi', 'pay_cash', 'pay_cheque'].map((k) => settingRow(k, { detail: S.sw[k].state === 'on' ? 'Available' : 'Not available', lockText: 'Only a Super Admin with two-step sign-in can change this.' })).join('');
    return `<div class="flex flex-col gap-1"><h2 class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Finance policy</h2><p class="m-0 text-copy">Limits for receipts and cash at Holiday Chacha Pvt LTD. Each change is a new version with a reason.</p></div><p class="fin-disclaimer" role="note"><span aria-hidden="true">ⓘ </span>Receipt numbers are internal. They are not tax invoices.</p>`
      + `<div class="fin-grid"><section class="fin-card" aria-labelledby="pol-current"><div class="panel-header m-0"><h3 id="pol-current" class="m-0">Current policy</h3><span class="status-pill ok"><span class="status-glyph" aria-hidden="true">●</span><span class="visually-hidden">Policy: </span>Version ${cur.v} in force</span></div><p class="hint">Since ${esc(cur.effective)}.</p><dl class="facts"><dt>Largest single receipt</dt><dd>${rs(cur.receiptMax)}</dd><dt>Cash per payer per day</dt><dd>${rs(cur.cashDay)}</dd><dt>Cash per trip</dt><dd>${rs(cur.cashTrip)}</dd><dt>Days to deposit cash</dt><dd>${cur.depositDays} working ${cur.depositDays === 1 ? 'day' : 'days'}</dd><dt>Daily cash count</dt><dd>${cur.count ? 'Required' : 'Not required'}</dd></dl></section>`
      + `<section class="fin-card" aria-labelledby="pol-ceilings"><h3 id="pol-ceilings">Legal ceilings</h3><p class="hint">Set by the owner after the CA confirms the law. Read-only here; policy values must stay within them.</p><dl class="facts"><dt>Cash limit ceiling</dt><dd>${rs(P.ceilings.cash)}</dd><dt>Receipt maximum ceiling</dt><dd>${rs(P.ceilings.receipt)}</dd></dl></section></div>`
      + (P.versions.some((x) => x.status === 'scheduled') ? `<section class="fin-card" aria-labelledby="pol-scheduled"><h3 id="pol-scheduled">Scheduled changes</h3><ol class="cost-timeline" aria-label="Scheduled policy versions">${P.versions.filter((x) => x.status === 'scheduled').map((x) => verLi(x, true)).join('')}</ol></section>` : '')
      + `<section class="fin-card" aria-labelledby="pol-edit"><h3 id="pol-edit">Change the policy</h3><form data-act="pol-save" novalidate aria-label="Schedule a new policy version"><div role="status" aria-live="polite">${pol.result ? `<p class="message ${pol.result.tone}">${esc(pol.result.text)}</p>` : ''}</div><p class="hint">Creates a new version; earlier versions and every recorded receipt stay unchanged. Values must stay within the legal ceilings above.</p><div class="form-grid">`
      + fieldN('pol-rmax', 'receiptMax', 'Largest single receipt (₹)', `At most ${rs(P.ceilings.receipt)}.`, v.receiptMax)
      + fieldN('pol-cday', 'cashDay', 'Cash per payer per day (₹)', `0 switches cash off. At most ${rs(P.ceilings.cash)}.`, v.cashDay)
      + fieldN('pol-ctrip', 'cashTrip', 'Cash per trip (₹)', `0 switches cash off. At most ${rs(P.ceilings.cash)}.`, v.cashTrip)
      + `<div class="field"><label for="pol-days">Days to deposit cash</label><span id="pol-days-hint" class="hint">1 to 7 working days (Monday to Saturday).</span><input id="pol-days" aria-describedby="pol-days-hint" type="number" min="1" max="7" step="1" name="depositDays" value="${esc(v.depositDays)}"></div>`
      + `<div class="field"><label for="pol-eff">Takes effect at (IST)</label><span id="pol-eff-hint" class="hint">Now or later, up to 90 days ahead, and not before the latest scheduled version.</span><input id="pol-eff" aria-describedby="pol-eff-hint" type="datetime-local" name="effective" value="${esc(v.effective)}"></div></div>`
      + `<label class="choice"><input type="checkbox" name="count" value="true"${v.count ? ' checked' : ''}> Daily cash count required at each branch</label>`
      + `<div class="field field-wide"><label for="pol-reason">Reason for the change</label><span id="pol-reason-hint" class="hint">10 to 500 characters. Kept in the history.</span><textarea id="pol-reason" aria-describedby="pol-reason-hint" name="reason" maxlength="500" rows="3">${esc(v.reason)}</textarea></div><button type="submit" class="button">Save new policy version</button></form></section>`
      + `<section class="flex flex-col gap-3" aria-labelledby="pay-modes-heading"><h3 id="pay-modes-heading" class="m-0 text-lg font-semibold text-ink">Payment modes</h3>${section('pay-modes-hc', 'Holiday Chacha Pvt LTD', 'Super Admin only, with two-step sign-in. Changing a payment mode in the live CRM needs the owner’s APPROVE first.', pay)}<p class="m-0 text-sm text-copy">Company accounts are managed in <a class="font-semibold text-brand-strong underline underline-offset-4" href="#/app/accounts/destinations">Accounts → Company accounts</a>.</p></section>`
      + `<section class="fin-card" aria-labelledby="pol-history"><h3 id="pol-history">History</h3><ol class="cost-timeline" aria-label="Policy versions, newest first">${hist.filter((x) => x.status !== 'scheduled').map((x, i) => verLi(x, false, i === 0)).join('')}</ol></section>`;
  });
  const verLi = (x, sched, top) => `<li class="cost-step${sched ? ' is-latest' : top ? ' is-committed' : ''}"><span class="cost-dot" aria-hidden="true">${x.v}</span><div><p class="m-0"><strong>Version ${x.v} · ${esc(x.status)}</strong></p><p class="offer-meta">${sched ? 'Takes effect' : 'Effective'} ${esc(x.effective)} · saved ${esc(x.saved)} by ${esc(x.by)}</p><p class="offer-meta">Receipt max ${rs(x.receiptMax)} · cash per payer per day ${rs(x.cashDay)} · cash per trip ${rs(x.cashTrip)} · deposit within ${x.depositDays} ${x.depositDays === 1 ? 'day' : 'days'} · daily count ${x.count ? 'required' : 'not required'}</p><p class="offer-meta prewrap">Reason: ${esc(x.reason)}</p></div></li>`;
  TN.act('pol-save', (f) => {
    const v = Object.fromEntries(new FormData(f).entries()); v.count = !!v.count;
    const P = S.policy; const n = (x) => Number(String(x).replace(/[,₹\s]/g, ''));
    let err = null;
    if (!(n(v.receiptMax) > 0 && n(v.receiptMax) <= P.ceilings.receipt)) err = `Largest single receipt must be above ₹0 and at most ${rs(P.ceilings.receipt)}.`;
    else if (!(n(v.cashDay) >= 0 && n(v.cashDay) <= P.ceilings.cash) || !(n(v.cashTrip) >= 0 && n(v.cashTrip) <= P.ceilings.cash)) err = `Cash limits must be from ₹0 to ${rs(P.ceilings.cash)}.`;
    else if (!(Number.isInteger(n(v.depositDays)) && n(v.depositDays) >= 1 && n(v.depositDays) <= 7)) err = 'Days to deposit cash must be 1 to 7.';
    else if (!v.effective) err = 'Choose when the new version takes effect.';
    else if (!H().reasonOk(v.reason)) err = 'Say why, in 10 to 500 characters.';
    if (err) { pol = { values: v, result: { tone: 'error', text: 'Not saved: ' + err + ' What you typed is still here.' } }; TN.refresh(); return; }
    const now = v.effective.slice(0, 10) <= TN.TODAY;
    if (now) P.versions.forEach((x) => { if (x.status === 'in force') x.status = 'replaced'; });
    const [d, t] = v.effective.split('T');
    P.versions.push({ v: P.versions.length + 1, status: now ? 'in force' : 'scheduled', effective: TN.fmt.dateTime(`${d} ${t}`), saved: TN.fmt.dateTime(H().nowStamp()), by: TN.me().name, receiptMax: n(v.receiptMax), cashDay: n(v.cashDay), cashTrip: n(v.cashTrip), depositDays: n(v.depositDays), count: v.count, reason: v.reason.trim() });
    H().notify(['accounts', 'checker', 'admin'], `${TN.me().name} saved money rules version ${P.versions.length}${now ? ' (in force now)' : ` (from ${TN.fmt.date(d)})`}. Reason: “${v.reason.trim()}”`, { href: '#/app/admin/finance-policy' });
    pol = { values: null, result: { tone: 'success', text: `Version ${P.versions.length} saved${now ? ' and in force now' : `; it takes effect on ${TN.fmt.date(d)}`}.` } };
    TN.refresh();
  });

  /* ---------------------------------------------------------------
     Bitrix connection
     --------------------------------------------------------------- */
  S.bitrix = S.bitrix || {
    lastRun: '2026-10-27 15:04', runs24: 2860, fetched: 3, updated: 3,
    pipelines: [
      { id: '0', name: 'General', on: true, stages: [['NEW', 'New', 1], ['REQ', 'Requirement taken', 1], ['QUOTE', 'Quotation sent', 1], ['FOLLOW', 'Follow-up', 1], ['NEGO', 'Negotiation', 1], ['HOT', 'Ready to book', 1], ['WON', 'Won - Payment Received (won)', 1], ['LOSE', 'Lost (lost)', 1], ['JUNK', 'Not interested (lost)', 1]] },
      { id: '7', name: 'New pipeline', on: true, stages: [['C7:NEW', 'New', 1], ['C7:CONTACT', 'Contacted', 1], ['C7:QUOTE', 'Quotation sent', 1], ['C7:FOLLOW', 'Follow-up', 1], ['C7:WON', 'Won (won)', 1], ['C7:LOSE', 'Lost (lost)', 1]] },
    ],
    cutoff: '2026-09-01', auto: 'on', scopeLast: last('2026-10-09 11:00', SUPER.anjali, 'on', 'Owner APPROVE 9 Oct: both pipelines, start date 1 Sep 2026.'),
  };
  let scope = { step: 'edit', reason: '', error: null, result: null, draft: null };
  adminPage('/app/admin/integration', 'bitrix', 'Bitrix connection', () => {
    const h = H(); const B = S.bitrix;
    const draft = scope.draft || { pipes: B.pipelines.map((p) => ({ on: p.on, stages: p.stages.map((s) => !!s[2]) })), cutoff: B.cutoff, auto: B.auto };
    const stagesTicked = B.pipelines.reduce((n, p) => n + p.stages.filter((s) => s[2]).length, 0);
    const scopeForm = scope.step === 'review'
      ? `<form data-act="set-noop" class="flex flex-col gap-4" novalidate><h3 tabindex="-1" id="scope-step" class="m-0 text-base font-semibold text-ink outline-none">Step 2 of 2: check and confirm</h3>${h.notice('info', `<p>${draft.pipes.filter((p) => p.on).length} pipelines and ${draft.pipes.reduce((n, p, i) => n + (p.on ? p.stages.filter(Boolean).length : 0), 0)} stages come in, created on or after ${TN.fmt.date(draft.cutoff)}. Automatic updates: ${draft.auto === 'on' ? 'On' : 'Off'}.</p><p>This changes which deals are in the CRM for everyone. Hidden deals are kept and come back if you tick them again.</p><p>Changing this in the live CRM needs the owner’s approval first. Write the approval in the reason.</p><p class="wrap-break-word">Reason: ${esc(scope.reason)}</p>`, { role: 'none', title: 'Save these Bitrix settings?' })}<div class="flex flex-wrap gap-2">${h.btn('Save these settings', { variant: 'primary', act: 'scope-confirm' })}${h.btn('Back', { variant: 'ghost', act: 'scope-back' })}</div></form>`
      : `<form data-act="scope-review" novalidate aria-label="Change which deals come in from Bitrix" class="flex flex-col gap-4"><h3 tabindex="-1" class="sr-only">Change which deals come in from Bitrix</h3><div class="flex flex-col gap-3" data-slot="sync-pipelines">${B.pipelines.map((p, pi) => `<fieldset class="m-0 flex min-w-0 flex-col gap-2 rounded-control border border-line px-3.5 py-3"><legend class="px-1">${h.choice('checkbox', { id: `bx-p-${pi}`, name: 'pipe', value: String(pi), label: `Pipeline: ${p.name}`, checked: draft.pipes[pi].on })}</legend><p class="m-0 text-sm text-quiet">New deals are taken from the ticked stages. Deals already in the CRM keep following Bitrix to any stage (won and lost included).</p><ul class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2" aria-label="Stages of ${esc(p.name)}">${p.stages.map((s, si) => `<li class="m-0">${h.choice('checkbox', { id: `bx-s-${pi}-${si}`, name: `stage-${pi}`, value: String(si), label: s[1], checked: draft.pipes[pi].stages[si] })}</li>`).join('')}</ul></fieldset>`).join('')}</div>`
        + `<div class="grid gap-4 sm:grid-cols-2">${h.input({ id: 'bx-cutoff', type: 'date', name: 'cutoff', label: 'Bring in deals created on or after', value: draft.cutoff, hint: 'Uses the Bitrix creation date, from 00:00 India time. Moving this date later hides older deals from everyone; moving it earlier brings them back.' })}${h.choiceGroup('Automatic updates from Bitrix (every 30 seconds)', h.choice('radio', { id: 'bx-auto-on', name: 'auto', value: 'on', label: 'On', checked: draft.auto === 'on' }) + h.choice('radio', { id: 'bx-auto-off', name: 'auto', value: 'off', label: 'Off', checked: draft.auto === 'off' }))}</div>`
        + h.textarea({ id: 'bx-reason', name: 'reason', label: 'Why are you changing it?', hint: '10 to 500 characters, saved with your name. Write the owner’s APPROVE here.', value: scope.reason, error: scope.error })
        + `<div class="flex flex-wrap items-center gap-3">${h.btn('Review changes', { variant: 'primary', type: 'submit' })}<span class="text-sm text-quiet">Nothing is saved until you confirm on the next step.</span></div></form>`;
    const wonRow = settingRow('won_only_intake', { sw: { title: 'Bring in deals only when won', detail: 'New Bitrix deals come into the CRM only when they reach “Won - Payment Received”. Deals already in the CRM stay and keep updating.', state: 'on', last: last('2026-10-18 12:20', SUPER.harsh, 'on', 'Owner APPROVE 18 Oct: only won deals enter the CRM.') }, readOnly: true, lockText: 'Change it in “Bring in deals only when won” below.' });
    return `<div class="flex flex-col gap-1"><h2 class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Bitrix connection</h2><p class="m-0 text-copy">New eligible deals created in Bitrix come into this CRM. Bitrix stays the owner of title, stage and salesperson. Nothing is written back to Bitrix except ID proofs, and no amounts are brought in.</p></div>`
      + `<section class="panel" aria-labelledby="problems-heading"><h2 id="problems-heading">What needs fixing</h2><p class="mb-0" role="status"><span aria-hidden="true" class="status-glyph problem-ok-glyph">✓</span> No sync problems right now. Nobody needs to act.</p></section>`
      + `<section class="panel" aria-labelledby="sync-status-heading"><div class="panel-header"><h2 id="sync-status-heading" class="mb-0">Connection</h2><span class="status-pill ok"><span aria-hidden="true" class="status-glyph">✓</span>Receiving deals</span></div><section class="mt-1" aria-label="Deals in the CRM and in Bitrix"><p class="message success" role="status"><span aria-hidden="true">✓ </span>Auto sync running · last run ${esc(fmtAt(B.lastRun))}</p><p class="hint" role="note">Email alerts are on: a stopped sync e-mails the Super Admins.</p><dl class="stat-grid" aria-label="Automatic sync"><div class="stat"><dt>Available deals</dt><dd>25</dd></div><div class="stat"><dt>Bitrix (current settings)</dt><dd>25 ✓</dd></div><div class="stat"><dt>Waiting to sync</dt><dd>0</dd></div><div class="stat"><dt>Need attention</dt><dd>0</dd></div></dl><p class="hint mb-0" role="status">Deals in the CRM: 25 (same as the Deals page).</p><details><summary>Why?</summary><p class="hint mb-0">Deals in the CRM are the deals here now, after the start date, pipelines and stages. Last run: ${B.fetched} fetched, 0 new, ${B.updated} updated (${esc(TN.fmt.dateTime(B.lastRun))}). ${B.runs24.toLocaleString('en-IN')} runs in the last 24 hours; 0 failed and 0 lost messages in 7 days.</p></details></section>`
      + `<div class="action-block" aria-labelledby="full-check-heading"><h3 id="full-check-heading">Bitrix and CRM counts</h3><p class="mb-0">Last full check: today 06:00 IST. Bitrix and the CRM agree: 25 deals.</p><p class="hint mb-0">About 1,850 Deal updates belong to Bitrix users not linked to a CRM person. They wait until those users are linked.</p></div>`
      + `<ul class="checklist" aria-label="Intake health checks">${[['Bitrix credential', 'Present on the server'], ['Intake configuration', 'Present'], ['Deployment environment', 'Production'], ['Intake switched on', 'Yes'], ['Background update setting', 'Present on the server'], ['Last background update', `${TN.fmt.dateTime(B.lastRun)}, Completed`], ['Backlog', 'Nothing waiting']].map(([a, b]) => `<li class="check-ok"><span aria-hidden="true" class="status-glyph">✓</span><span><strong>${a}: </strong>${esc(b)}</span></li>`).join('')}</ul>`
      + `<dl class="facts mt-1"><dt>Environment</dt><dd>Production</dd><dt>Bitrix portal</dt><dd>Holiday Chacha Bitrix24 (connected)</dd><dt>Pilot branch</dt><dd>Jodhpur</dd><dt>Bring in deals created on or after</dt><dd>${TN.fmt.date(B.cutoff)}, 12:00 am IST (from 00:00 India time)</dd><dt>Last deal processed</dt><dd>${esc(TN.fmt.dateTime(B.lastRun))}</dd><dt>Short Bitrix connection errors (7 days)</dt><dd>12, each cleared on the next run</dd></dl>`
      + `<div class="action-block"><h3>Check Bitrix now</h3><form data-act="bx-check" novalidate><div role="status" aria-live="polite"></div><p id="reconcile-help" class="hint">Reads new and changed deals now. Once every 5 minutes at most. Nothing changes in Bitrix.</p><button type="submit" class="button" aria-describedby="reconcile-help">Check Bitrix now</button></form></div></section>`
      + `<div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card my-5" data-slot="sync-scope"><section aria-labelledby="sync-scope-heading"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5"><div class="min-w-0"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="sync-scope-heading">Which deals come in from Bitrix</h2><p class="m-0 text-sm text-quiet">Unticking a stage or pipeline hides its deals from everyone in the CRM. Hidden deals are kept and come back if you tick it again.</p></div>${h.stateBadge(B.auto, 'Automatic updates from Bitrix', { on: 'Automatic updates: On', off: 'Automatic updates: Off' })}</div><div class="px-4.5 py-4 flex flex-col gap-4"><div class="flex flex-col gap-1 text-sm text-quiet" data-slot="sync-last-change">${lastLine({ last: B.scopeLast })}<p class="m-0 flex items-start gap-1.5">${h.ic('list-checks', ICN)}<span>${B.pipelines.length} pipelines and ${stagesTicked} stages ticked.</span></p></div><div class="flex flex-col gap-4"><div tabindex="-1" id="scope-result" class="outline-none empty:hidden" data-slot="sync-result">${scope.result ? h.notice('success', `<p>${esc(scope.result)}</p>`, { role: 'status' }) : ''}</div>${scopeForm}</div></div></section></div>`
      + section('bitrix-switches', 'Bitrix switches', 'What the CRM reads from Bitrix, and the one setting that writes to it.', ['bitrix_trip_facts_read', 'lead_intake_unowned', 'bitrix_id_proof_copy', 'bitrix_names'].map((k) => settingRow(k)).join('') + wonRow)
      + h.card({ title: 'Bitrix copy stopped', desc: 'ID proofs are copied to the Bitrix deal only while the Super Admin has copying switched on.', aside: h.badge('success', 'Nothing open'), bodyClass: 'px-4.5 py-4 flex flex-col gap-4', body: `<div class="flex flex-col gap-2"><h3 class="m-0 text-base font-semibold text-ink">Automatic stops</h3><p class="m-0 text-copy">No automatic stops.</p></div><div class="flex flex-col gap-2"><h3 class="m-0 text-base font-semibold text-ink">Copies to check by hand</h3><p class="m-0 text-copy">1 copy from 13 Oct 2026 was checked by hand on 14 Oct and is in Bitrix. Nothing to check now.</p></div>` })
      + h.card({ title: 'Bring in deals only when won', desc: 'New Bitrix deals come into the CRM only when they reach “Won - Payment Received”. Deals already in the CRM stay and keep updating.', aside: h.badge('success', 'On', { sr: 'Current state' }), bodyClass: 'px-4.5 py-4 flex flex-col gap-5', body: `${h.summary([['New deals come in at', 'Won - Payment Received · General'], ['New pipeline', 'Won · New pipeline. It has no “payment received” stage, so its Deals do not create tasks automatically.'], ['Deals already in the CRM', 'Stay and keep receiving Bitrix updates, also when they leave Won.']])}${h.notice('warning', '<p>This changes which deals are in the CRM for everyone. Switch this off, or hide deals, only after the owner replies APPROVE. Write it in the reason.</p>', { title: 'Owner’s APPROVE first' })}<section aria-labelledby="won-only-prune-heading" class="flex flex-col gap-3 border-t border-line pt-4"><h3 id="won-only-prune-heading" class="m-0 text-base font-semibold text-ink">Remove deals that are not won</h3><p class="m-0 text-copy">Deals with any CRM work (a booking, task, receipt, reported payment, billing details or document) are never removed.</p><p class="m-0 text-sm text-quiet">Last check on 18 Oct 2026 by ${SUPER.harsh}: 10 deals removed, 0 with CRM work.</p></section>` })
      + `<section class="panel" aria-labelledby="waiting-heading"><h2 id="waiting-heading">Deals waiting for an owner</h2><p role="status" class="mb-0">None. Every stored Bitrix deal has a CRM owner.</p></section>`
      + `<section class="panel" aria-labelledby="counts-heading"><h2 id="counts-heading">Open sync work</h2><dl class="stat-grid"><div class="stat"><dt>Waiting to process</dt><dd>0</dd></div><div class="stat"><dt>Processing now</dt><dd>0</dd></div><div class="stat"><dt>Needs review</dt><dd>0</dd></div><div class="stat"><dt>Failed, will retry automatically</dt><dd>0</dd></div><div class="stat"><dt>Stopped: retries used up</dt><dd>0</dd></div></dl></section>`
      + `<h2 id="attention-heading">Needs attention</h2><p class="panel" role="status">Nothing needs attention. Deals waiting for review, failed deals and deals that ran out of retries appear here.</p>`;
  });
  TN.act('bx-check', (f) => {
    const B = S.bitrix; B.lastRun = H().nowStamp(); B.fetched = 2; B.updated = 2;
    f.querySelector('[role="status"]').innerHTML = '<p class="message success">Checked Bitrix: 2 fetched, 0 new, 2 updated. Nothing changed in Bitrix.</p>';
    TN.toast('Checked Bitrix: 0 new, 2 updated.', 'success');
  });
  TN.act('scope-review', (f) => {
    const B = S.bitrix; const fd = new FormData(f);
    const draft = { pipes: B.pipelines.map((p, pi) => ({ on: fd.getAll('pipe').includes(String(pi)), stages: p.stages.map((s, si) => fd.getAll(`stage-${pi}`).includes(String(si))) })), cutoff: fd.get('cutoff') || B.cutoff, auto: fd.get('auto') || 'on' };
    const r = H().reasonOk(fd.get('reason'));
    scope = { ...scope, draft, reason: fd.get('reason') || '', error: r ? null : 'Not saved: say why, in 10 to 500 characters.', result: null };
    if (!draft.pipes.some((p) => p.on && p.stages.some(Boolean))) { scope.error = 'Not saved: tick at least one pipeline and one stage.'; }
    if (scope.error) { rerender('bx-reason'); return; }
    scope.reason = r; scope.step = 'review'; rerender('scope-step');
  });
  TN.act('scope-back', () => { scope.step = 'edit'; rerender('bx-reason'); });
  TN.act('scope-confirm', () => {
    const B = S.bitrix; const d = scope.draft;
    B.pipelines.forEach((p, pi) => { p.on = d.pipes[pi].on; p.stages.forEach((s, si) => { s[2] = d.pipes[pi].stages[si] ? 1 : 0; }); });
    B.cutoff = d.cutoff; B.auto = d.auto; B.scopeLast = { at: H().nowStamp(), by: TN.me().name, to: d.auto, reason: scope.reason };
    H().notify(['admin'], `${TN.me().name} changed which deals come in from Bitrix. Reason: “${scope.reason}”`, { href: '#/app/admin/integration' });
    scope = { step: 'edit', reason: '', error: null, result: 'Saved. Recorded with your name and reason. Hidden deals are kept.', draft: null };
    rerender('scope-result');
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
  adminPage('/app/admin/imports', 'imports', 'Imports', (p, q) => {
    const h = H();
    const kind = q.kind === 'customer' || (TN.is('accounts', 'checker') && q.kind !== 'hotel') ? 'customer' : 'hotel';
    const w = WORDS[kind];
    const canApply = kind === 'hotel' ? TN.is('admin') : TN.is('accounts', 'checker');
    const s = imp.summary && imp.summary.kind === kind ? imp.summary : null;
    const count = (label, value, note) => `<div class="flex min-w-28 flex-col gap-0.5 rounded-control bg-wash px-3 py-2.5"><span class="text-sm text-quiet">${esc(label)}</span><strong class="text-xl font-semibold text-ink tabular-nums">${Number(value).toLocaleString('en-IN')}</strong>${note ? `<span class="text-xs text-quiet">${esc(note)}</span>` : ''}</div>`;
    const summaryCard = s ? h.card({ title: '2. Check the result, then import', aside: `<span class="inline-flex items-center gap-1.5 wrap-anywhere">${h.ic('file-spreadsheet', 'size-4 shrink-0')}${esc(s.file)}</span>`, bodyClass: 'px-4.5 py-4 flex flex-col gap-5', body:
      (imp.applied ? h.notice('success', `<p>${esc(imp.applied)}</p>`, { role: 'status' }) : '')
      + `<div class="flex flex-wrap gap-2.5" role="group" aria-label="Counts">${count('Rows', s.rows)}${count('Ready', s.ready)}${count('Invalid', s.invalid, 'left out')}${count('Possible duplicates', s.dup, 'never merged')}${count(`New ${w.many}`, s.ready - s.dup)}${count('Updates', 0, 'by ID column only')}</div>`
      + `<details class="group/map"><summary class="w-fit cursor-pointer rounded-chip text-sm font-medium text-brand-strong">How the columns were read (${s.cols.length})</summary><ul class="m-0 mt-2.5 flex list-none flex-col gap-1 p-0 text-sm">${s.cols.map((c, i) => `<li><span class="font-medium text-ink">${esc(c)}</span> ${i < 6 ? `→ ${esc(c.toLowerCase())}` : '<span class="text-quiet">→ not imported</span>'}</li>`).join('')}</ul></details>`
      + (s.invalidRows.length ? `<section class="flex flex-col gap-2"><h3 class="m-0 text-base font-semibold text-ink">Invalid rows (${s.invalid})</h3><ul class="m-0 flex max-h-72 list-none flex-col overflow-auto rounded-control border border-line p-0 text-sm">${s.invalidRows.map((r) => `<li class="flex gap-3 border-b border-line px-3 py-2 last:border-b-0"><span class="w-16 shrink-0 text-quiet tabular-nums">Row ${r}</span><span class="min-w-0 wrap-anywhere">The name column is empty.</span></li>`).join('')}</ul></section>` : '')
      + `<div class="flex flex-col gap-2 border-t border-line pt-4"><p class="m-0 text-sm text-quiet">Applied ${w.many} start Not checked. Invalid rows are left out.</p><div>${h.btn(`Import ${(s.ready - s.dup).toLocaleString('en-IN')} ${w.many}`, { variant: 'primary', size: 'lg', act: 'imp-apply', id: kind, attrs: canApply && !imp.applied && s.ready - s.dup > 0 ? '' : ' disabled' })}</div></div>` }) : '';
    const hist = S.imports[kind];
    return `<div class="flex flex-col gap-5 font-sans text-base text-copy">${h2(`Import ${w.many}`, `Add or update the stored ${w.many} from a CSV file. Nothing is saved until you apply.`)}`
      + h.tabs('What to import', [{ href: '#/app/admin/imports?kind=hotel', label: 'Hotels', current: kind === 'hotel' }, { href: '#/app/admin/imports?kind=customer', label: 'Customers', current: kind === 'customer' }])
      + h.card({ title: '1. Check the file', desc: 'CSV saved from Excel (CSV UTF-8), up to 5,000 rows and 5 MB. The first row holds the column names.', body: `<form data-act="imp-check" data-id="${kind}" novalidate aria-label="Check a ${w.one} file" class="flex flex-col gap-3">${imp.error ? h.notice('danger', `<p>${esc(imp.error)}</p>`, { role: 'alert' }) : ''}`
        + (kind === 'customer' ? h.select({ id: 'import-branch', name: 'branch', label: 'Customers belong to', hint: 'Sales and Managers of this branch can find them. Whole company: every branch can.', value: imp.branch, extra: 'max-w-md', options: [{ value: '', label: 'Choose' }, { value: 'Jodhpur', label: 'Jodhpur' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Ahmedabad', label: 'Ahmedabad' }, { value: 'company', label: 'Whole company (every branch)' }] }) : '')
        + `<div class="flex flex-wrap items-end gap-3"><div class="flex flex-col gap-1.5 min-w-0 flex-1" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="import-file">CSV file</label><input id="import-file" name="file" type="file" accept=".csv,text/csv" class="block w-full rounded-control border border-control bg-card px-3 py-2 font-sans text-base text-ink file:mr-3 file:rounded-control file:border-0 file:bg-wash file:px-3 file:py-1.5 file:font-semibold file:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-strong"></div>${h.btn('Check file', { variant: s ? 'secondary' : 'primary', type: 'submit', icon: 'upload', extra: 'min-h-11' })}</div></form>` })
      + summaryCard
      + h.card({ title: 'Earlier files', titleIcon: 'rotate-ccw-clock', body: hist.length ? h.table({ label: `Earlier ${w.one} files`, caption: 'Latest first', cols: [{ label: 'File' }, { label: 'Status' }, { label: 'Rows', num: true }, { label: 'New', num: true }, { label: 'Updated', num: true }, { label: 'Invalid', num: true }], rows: hist.map((x) => [`<span class="font-medium wrap-anywhere text-ink">${esc(x.file)}</span><span class="block text-sm text-quiet">${esc(TN.fmt.dateTime(x.at))} · ${esc(x.by)}</span>`, h.badge(IMP_LOOK[x.status][0], IMP_LOOK[x.status][1]), x.rows.toLocaleString('en-IN'), x.creates.toLocaleString('en-IN'), x.updates, x.invalid]) }) : `<p class="m-0 text-quiet">No ${w.one} files yet.</p>` })
      + (!canApply ? `<p class="m-0 text-sm text-quiet">Only ${w.owner} can apply a ${w.one} file. You can check files and read the result.</p>` : '') + `</div>`;
  });
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
      S.imports[kind].unshift({ file: file.name, at: H().nowStamp(), by: TN.me().name, status: 'checked', rows: body.length, creates: 0, updates: 0, invalid: invalidRows.length });
      TN.refresh();
    };
    reader.readAsText(file);
  });
  TN.act('imp-apply', (el) => {
    const kind = el.dataset.id; const s = imp.summary;
    TN.dialog({ title: `Import ${s.ready - s.dup} ${WORDS[kind].many}?`, description: s.file, body: `<form data-act="imp-confirm" data-id="${kind}" id="imp-form" class="flex flex-col gap-3" novalidate><p class="m-0">${s.ready - s.dup} new ${WORDS[kind].many} are added and start Not checked. ${s.invalid} invalid rows and ${s.dup} possible duplicates are left out.</p>${H().textarea({ id: 'import-reason', name: 'reason', label: 'Reason', hint: '10 to 500 characters, for the history.' })}</form>`, footer: H().btn('Cancel', { attrs: ' data-close' }) + H().btn('Import', { variant: 'primary', type: 'submit', attrs: ' form="imp-form"' }) });
  });
  TN.act('imp-confirm', (f) => {
    const kind = f.dataset.id; const s = imp.summary;
    if (!H().reasonOk(f.querySelector('#import-reason').value)) { const t = f.querySelector('#import-reason'); t.setAttribute('aria-invalid', 'true'); if (!f.querySelector('.text-status-danger')) t.insertAdjacentHTML('afterend', '<p class="m-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger" id="import-reason-error"><span>Type a reason of 10 to 500 characters.</span></p>'); t.focus(); return; }
    const row = S.imports[kind].find((x) => x.file === s.file && x.status === 'checked'); if (row) { row.status = 'applied'; row.creates = s.ready - s.dup; }
    imp.applied = `Applied: ${s.ready - s.dup} new ${WORDS[kind].many}, 0 updated. They start Not checked.`;
    TN.closeOverlay(); TN.toast(imp.applied, 'success'); TN.refresh();
  });

  /* ---------------------------------------------------------------
     Features (live switches + the big switches with buttons)
     --------------------------------------------------------------- */
  adminPage('/app/admin/workflow', 'features', 'Features', () => {
    const h = H();
    const sc = S.sw.supplier_confirmation;
    const checks = supplierChecks();
    const checksBlock = `<div class="flex flex-col gap-2"><p class="m-0 text-sm font-semibold text-ink">Safety checks before switching on</p>${checklist(checks)}</div>`;
    return `<div class="flex flex-col gap-1"><h2 id="features-heading" class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Features</h2></div>`
      + section('feature-switches', 'Switches for every branch', '', ['service_items_enabled', 'won_deal_count', 'visa_passport_tasks_enabled', 'prefill_auto_fill', 'referral_drafts'].map((k) => settingRow(k)).join(''))
      + section('big-switches', 'Real bookings and supplier confirmation', 'Super Admin only, with two-step sign-in. Each change needs the owner’s APPROVE written in the reason and is recorded with your name, the reason and the time.',
        settingRow('real_booking', { lockText: 'Only a Super Admin with two-step sign-in can change this.' })
        + settingRow('supplier_confirmation', { extra: sc.state === 'off' && !(flow && flow.key === 'supplier_confirmation') ? checksBlock : '', lockText: 'Only a Super Admin with two-step sign-in can change this.' }))
      + h.notice('info', `<p>Payment modes (bank transfer, UPI, cash, cheque) are on the Money rules tab. The Bitrix switches, ID-proof copies and “Bring in deals only when won” are on the Bitrix connection tab.</p><p>${h.link('#/app/admin/finance-policy', 'Open Money rules')} · ${h.link('#/app/admin/integration', 'Open Bitrix connection')}</p>`, { icon: 'link-2' });
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
  adminPage('/app/admin/emails', 'emails', 'E-mails', () => {
    const h = H(); const M = S.mail;
    const groups = ['Staff reminders', 'Suppliers'].map((g) => `<section aria-labelledby="tpl-${g[0]}" class="flex flex-col gap-3" data-slot="settings-section"><div class="flex flex-col gap-1"><h3 id="tpl-${g[0]}" class="m-0 text-lg font-semibold text-ink">${esc(g)}</h3></div><ul class="m-0 flex list-none flex-col gap-3 p-0">${S.templates.filter((t) => t.group === g).map((t) => `<li class="m-0 flex flex-col gap-3 rounded-control border border-line bg-card px-4 py-3.5" data-slot="setting-row"><div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2"><div class="min-w-0 flex-1 basis-64"><h4 class="m-0 text-base font-semibold text-ink">${esc(t.name)}</h4><p class="m-0 mt-0.5 text-sm text-copy wrap-anywhere">Subject: ${esc(t.subject)}</p></div>${h.stateBadge(t.on ? 'on' : 'off', t.name, { on: 'In use', off: 'Not sent' })}</div><div class="flex flex-col gap-1 text-sm text-quiet"><p class="m-0 flex items-start gap-1.5">${h.ic('mail', ICN)}<span>To: ${esc(t.to)}</span></p>${lastLine({ last: t.edited ? { ...t.edited, to: 'on' } : null }).replace(': switched on.', ': edited.')}</div><div class="flex flex-wrap gap-2">${h.btn(`Edit<span class="visually-hidden"> ${esc(t.name)}</span>`, { act: 'tpl-edit', id: t.id })}${h.btn(`Send a test to me<span class="visually-hidden">: ${esc(t.name)}</span>`, { variant: 'ghost', act: 'tpl-test', id: t.id })}</div></li>`).join('')}</ul></section>`).join('');
    const MAIL_LOOK = { delivered: ['success', 'Delivered'], failed: ['danger', 'Failed'], bounced: ['warning', 'Bounced'] };
    return h2('E-mails', 'Templates for staff reminders and supplier requests, and whether e-mails arrive. The CRM does not e-mail customers; staff download documents and send them themselves.')
      + h.card({ title: 'E-mail delivery health', titleIcon: 'mail', aside: h.badge('success', 'Delivering'), bodyClass: 'px-4.5 py-4 flex flex-col gap-4', body:
        `<dl class="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">${h.statItem('Sent in the last 7 days', String(M.sent7))}${h.statItem('Delivered', String(M.delivered7), '100%')}${h.statItem('Bounced or failed', String(M.bounced7 + M.failed7), 'last failure 5 Oct 2026')}</dl>`
        + h.summary([['Sender', esc(M.sender)], ['Sender domain', `Verified on ${esc(M.verified)} (SPF and DKIM pass)`], ['Last e-mail sent', esc(TN.fmt.dateTime(M.recent[0].at))]])
        + h.table({ label: 'Recent e-mails', caption: 'Recent e-mails, newest first', cols: [{ label: 'Sent' }, { label: 'Template' }, { label: 'To' }, { label: 'Result' }], rows: M.recent.map((r) => [esc(TN.fmt.dateTime(r.at)), esc(r.what), esc(r.to) + (r.note ? `<span class="block text-sm text-quiet">${esc(r.note)}</span>` : ''), h.badge(MAIL_LOOK[r.status][0], MAIL_LOOK[r.status][1])]) }) })
      + groups;
  });
  const tplDrawer = (id, st = {}) => {
    const t = S.templates.find((x) => x.id === id); const h = H();
    TN.drawer({ title: `Edit: ${t.name}`, description: `To: ${t.to}`, wide: true, body: `<form data-act="tpl-save" data-id="${id}" id="tpl-form" class="flex flex-col gap-4" novalidate>${h.input({ id: 'tpl-subject', name: 'subject', label: 'Subject', value: st.subject ?? t.subject, error: st.subjectError })}${h.textarea({ id: 'tpl-body', name: 'body', label: 'Message', rows: 10, max: 4000, value: st.body ?? t.body, hint: 'Words in {curly brackets} are filled in by the CRM when it sends. Keep them as they are.' })}${h.choiceGroup('Send this e-mail', h.choice('radio', { id: 'tpl-on', name: 'on', value: 'on', label: 'Yes, send it', checked: (st.on ?? (t.on ? 'on' : 'off')) === 'on' }) + h.choice('radio', { id: 'tpl-off', name: 'on', value: 'off', label: 'No, do not send it', checked: (st.on ?? (t.on ? 'on' : 'off')) === 'off' }))}${h.textarea({ id: 'tpl-reason', name: 'reason', label: 'Why are you changing it?', hint: '10 to 500 characters, saved with your name.', value: st.reason || '', error: st.reasonError })}</form>`,
      footer: h.btn('Cancel', { attrs: ' data-close' }) + h.btn('Save template', { variant: 'primary', type: 'submit', attrs: ' form="tpl-form"' }) });
    if (st.focus) { const el = document.getElementById(st.focus); if (el) el.focus(); }
  };
  TN.act('tpl-edit', (el) => tplDrawer(el.dataset.id));
  TN.act('tpl-save', (f) => {
    const id = f.dataset.id; const t = S.templates.find((x) => x.id === id);
    const v = Object.fromEntries(new FormData(f).entries());
    const r = H().reasonOk(v.reason);
    if (!v.subject.trim()) { tplDrawer(id, { ...v, subjectError: 'Enter a subject.', focus: 'tpl-subject' }); return; }
    if (!r) { tplDrawer(id, { ...v, reasonError: 'Not saved: say why, in 10 to 500 characters.', focus: 'tpl-reason' }); return; }
    t.subject = v.subject.trim(); t.body = v.body; t.on = v.on === 'on'; t.edited = { at: H().nowStamp(), by: TN.me().name, to: 'on', reason: r };
    TN.closeOverlay(); TN.toast(`Template “${t.name}” saved.`, 'success'); TN.refresh();
  });
  TN.act('tpl-test', (el) => { const t = S.templates.find((x) => x.id === el.dataset.id); S.mail.sent7++; S.mail.delivered7++; S.mail.recent.unshift({ at: H().nowStamp(), what: t.name + ' (test)', to: TN.me().name, status: 'delivered' }); TN.toast(`Test of “${t.name}” sent to your work e-mail.`, 'success'); TN.refresh(); });

  /* ---------------------------------------------------------------
     Reminder rules (staff only)
     --------------------------------------------------------------- */
  const R = () => D.reminderRules;
  const RULES = [
    { key: 'rule_dueSoon', r: 'dueSoon', title: 'Instalment due soon', detail: 'Reminds the Deal’s Sales owner and Accounts before an instalment is due.', unit: 'days', label: 'Days before the due date', min: 1, max: 14, line: (n) => `${n} days before the due date, at 9:00 am` },
    { key: 'rule_overdue', r: 'overdue', title: 'Instalment overdue', detail: 'Reminds the Deal’s Sales owner and Accounts every morning while an instalment is unpaid.', unit: 'days', label: 'Days after the due date', min: 1, max: 7, line: (n) => `From ${n} ${n === 1 ? 'day' : 'days'} after the due date, every day at 9:00 am` },
    { key: 'rule_escalateOverdue', r: 'escalateOverdue', title: 'Overdue instalment goes to the Manager', detail: 'The branch Manager sees it in Approvals → Escalations and gets an e-mail.', unit: 'days', label: 'Days overdue', min: 1, max: 30, line: (n) => `${n} or more days overdue` },
    { key: 'rule_accountsWait', r: 'accountsWait', title: 'Booking waiting for Accounts', detail: 'A submitted booking that Accounts has not reviewed goes to the branch Manager.', unit: 'days', label: 'Days waiting', min: 1, max: 7, line: (n) => `After ${n} ${n === 1 ? 'day' : 'days'} waiting` },
    { key: 'rule_notTaken', r: 'notTaken', title: 'Task not taken', detail: 'Reminds the department, with a copy to the branch Manager, when nobody takes a new task.', unit: 'hours', label: 'Hours without an owner', min: 1, max: 48, line: (n) => `After ${n} working hours` },
    { key: 'rule_stuck', r: 'stuck', title: 'Stuck task goes to the Manager', detail: 'A task in progress with no update shows in Approvals → Escalations so the Manager can move it.', unit: 'days', label: 'Days without an update', min: 1, max: 14, line: (n) => `After ${n} days without an update` },
    { key: 'rule_invoiceMissing', r: 'invoiceMissing', title: 'Supplier invoice missing after the trip', detail: 'Reminds the Purchase person on the task to get the supplier’s original invoice.', unit: 'days', label: 'Days after the trip ends', min: 1, max: 30, line: (n) => `${n} days after the trip ends, then weekly` },
  ];
  RULES.forEach((x) => {
    if (!S.sw[x.key]) S.sw[x.key] = { title: x.title, detail: x.detail, state: R()[x.r].on ? 'on' : 'off', last: x.r === 'escalateOverdue' ? last('2026-10-26 18:30', SUPER.anjali, 'on', 'Owner decision 26 Oct: the Manager hears about dues after 3 days.') : null };
    PARAMS[x.key] = { label: x.label, min: x.min, max: x.max, hint: `${x.min} to ${x.max} ${x.unit}.`, get value() { return R()[x.r][x.unit]; }, set: (n, st) => { R()[x.r][x.unit] = n; R()[x.r].on = st === 'on'; } };
  });
  adminPage('/app/admin/reminders', 'reminders', 'Reminder rules', () => {
    const rows = RULES.map((x) => settingRow(x.key, { param: PARAMS[x.key], valueLine: esc(x.line(R()[x.r][x.unit])), review: [`Staff get this reminder: ${x.detail}`, 'This reminder stops. Nothing already sent is changed.'] })).join('');
    return h2('Reminder rules', 'When staff get reminders and when late work goes to the branch Manager. Reminders go to staff only, as a notice in the CRM and an e-mail; customers are not contacted.')
      + section('rules', 'Rules for every branch', '', rows);
  });

  /* ---------------------------------------------------------------
     System health (Booking health)
     --------------------------------------------------------------- */
  adminPage('/app/admin/bookings', 'health', 'System health', () => {
    const h = H();
    const drafts = D.deals.filter((d) => ['in_progress', 'ready_to_submit', 'quotation_accepted'].includes(d.bookingState)).length;
    const submitted = D.deals.filter((d) => d.submittedAt).length;
    const sv = Object.values(D.services);
    const rb = S.sw.real_booking;
    const item = (icon, title, badge, body) => `<li class="m-0 flex flex-col gap-2 rounded-control border border-line bg-card px-4 py-3.5"><div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2"><h4 class="m-0 flex min-w-0 flex-1 basis-56 items-center gap-2 text-base font-semibold text-ink">${h.ic(icon, 'size-4 shrink-0 text-quiet')}${title}</h4>${badge}</div>${body}</li>`;
    return `<div class="flex flex-col gap-1"><h2 id="health-heading" class="m-0 text-xl leading-tight font-display tracking-heading text-ink">Booking health</h2><p class="m-0 text-copy">Read only. Switches are changed on the Features tab.</p></div>`
      + h.card({ title: 'Booking confirmation', desc: rb.state === 'on' ? 'Real bookings are on for the Jodhpur pilot. Accounts reviews every submitted booking.' : 'Real bookings are off: real Deals stay as drafts.', aside: h.badge(rb.state === 'on' ? 'success' : 'neutral', `Real bookings: ${rb.state}`, { wrap: true, sr: 'Booking health', icon: rb.state === 'on' ? 'circle-check' : 'circle-off' }), bodyClass: 'px-4.5 py-4 flex flex-col gap-3', body: `<p class="m-0 text-copy" data-slot="health-next"><span class="font-semibold text-ink">Next:</span> ${D.deals.filter((d) => d.bookingState === 'waiting_for_accounts').length} booking waiting for the Accounts review.</p><p class="m-0 text-sm text-quiet">Environment: <span class="font-semibold text-copy">Production</span></p>` })
      + `<section aria-labelledby="counts-heading" class="flex flex-col gap-3"><h3 id="counts-heading" class="m-0 text-lg font-semibold text-ink">Bookings and tasks</h3><dl class="m-0 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">${h.statItem('Drafts', String(drafts))}${h.statItem('Drafts needing details', '1')}${h.statItem('Submitted bookings', String(submitted))}${h.statItem('Tasks waiting to be taken', String(sv.filter((s) => !s.assignee && s.taskStatus === 'new').length))}${h.statItem('Tasks in progress', String(sv.filter((s) => s.taskStatus === 'in_progress').length))}${h.statItem('Staff notices today', String(D.notices.filter((n) => String(n.at).startsWith(TN.TODAY)).length))}</dl><p class="m-0 text-sm text-quiet">Staff notices go to staff only. Nothing is sent to customers.</p></section>`
      + `<section aria-labelledby="system-facts-heading" class="flex flex-col gap-3"><h3 id="system-facts-heading" class="m-0 text-lg font-semibold text-ink">PDFs, email alerts and Bitrix updates</h3><ul class="m-0 flex list-none flex-col gap-3 p-0" aria-labelledby="system-facts-heading">`
      + item('file-text', 'Online PDF maker', h.badge('success', 'On', { wrap: true, sr: 'Online PDF maker', icon: 'circle-check' }), `<p class="m-0 text-sm text-copy">Quotation, itinerary, Invoice and voucher PDFs are made online.</p>`)
      + item('mail', 'Email alerts', h.badge('success', 'On', { wrap: true, sr: 'Email alerts', icon: 'circle-check' }), `<p class="m-0 text-sm text-copy">A stopped sync e-mails the Super Admins. 2 staff e-mails failed on 5 Oct 2026; none since.</p><p class="m-0 flex items-center gap-1.5 text-sm">${h.ic('link-2', 'size-3.5 shrink-0 text-faint')}${h.link('#/app/admin/emails', 'Open E-mails')}</p>`)
      + item('refresh-cw', 'Bitrix updates', h.badge('success', 'Receiving deals', { wrap: true, sr: 'Bitrix updates', icon: 'circle-check' }), `<p class="m-0 flex items-center gap-1.5 text-sm">${h.ic('link-2', 'size-3.5 shrink-0 text-faint')}${h.link('#/app/admin/integration', 'Open Bitrix connection')}</p>`)
      + item('shield-check', 'Backups', h.badge('success', 'Daily', { wrap: true, sr: 'Backups', icon: 'circle-check' }), `<p class="m-0 text-sm text-copy">${esc(S.backup.kind)}: last ${esc(fmtAt(S.backup.at))}, kept ${esc(S.backup.keep)}.</p>`)
      + `</ul></section>`
      + section('health-switches', 'Big switches', '', ['real_booking', 'supplier_confirmation'].map((k) => settingRow(k, { readOnly: true, lockText: 'Changed on the Features tab by a Super Admin with two-step sign-in.' })).join(''));
  });

  TN.page('/app/admin', { nav: '/app/admin', roles: ['admin', 'accounts', 'checker'], title: 'Settings', render: () => { setTimeout(() => TN.go(TN.settingsTabs(TN.role)[0].href.replace(/^#/, '')), 0); return ''; } });

  /* ---------------------------------------------------------------
     Home rows (Super Admin)
     --------------------------------------------------------------- */
  TN.homeRow({ roles: ['admin'], label: 'Big switches waiting for the owner’s decision', count: () => ['real_booking', 'supplier_confirmation'].filter((k) => S.sw[k].state !== 'on').length, href: '#/app/admin/workflow', action: 'Open Features', icon: 'settings', section: 'What needs you' });
  TN.homeRow({ roles: ['admin'], label: 'Staff invitations not accepted yet', count: () => S.staff.filter((p) => p.status === 'invited').length, href: '#/app/admin/staff', action: 'Open People and access', icon: 'users', section: 'What needs you' });
})();
