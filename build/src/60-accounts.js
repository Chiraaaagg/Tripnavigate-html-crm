/* =====================================================================
   Agent F · Accounts (live screens) + the pending Accounts hotel go-ahead.
   Routes: #/app/accounts (To check), #/app/accounts/deals/:id,
   #/app/accounts/customers(/:id), #/app/accounts/claims,
   #/app/accounts/expenses, #/app/accounts/cash, #/app/accounts/destinations.
   Markup copied from build/ref/gallery (b4-accounts-*, b11-accounts-*,
   finance-*) and crm/src/views/finance-*.tsx, views/b11/*, views/accounts/*.
   Roles: accounts (Kavita Joshi) and checker (Sunil Mehta).
   Rule everywhere: the person who recorded / saved / submitted a record
   cannot verify, approve or reverse it (live refusal wording).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const esc = TN.esc;
  const ui = TN.ui;
  const ic = (n, c) => TN.ic(n, c);
  const ROLES = ['accounts', 'checker'];

  /* ---------- Who is signed in ---------- */
  const me = () => TN.roleDef().person; // 'accounts' | 'checker'
  const otherRole = () => (me() === 'accounts' ? 'checker' : 'accounts');
  const pname = (k) => (TN.PEOPLE[k] ? TN.PEOPLE[k].name : k || '');

  /* ---------- Formatting (finance screens show paise, like live formatInr) ---------- */
  const INR2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const inr = (n) => (n == null || n === '' ? '—' : (Number(n) < 0 ? '−₹' : '₹') + INR2.format(Math.abs(Number(n))));
  const fdate = (iso) => TN.fmt.date(iso);
  /** "2026-10-27 09:05" -> "27 Oct 2026, 09:05 am IST" (live finDateTime keeps two-digit hours). */
  const fdt = (s) => {
    if (!s) return '—';
    const [dt, tm = '00:00'] = String(s).split(' ');
    let [h, mi] = tm.split(':').map(Number);
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return `${fdate(dt)}, ${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')} ${ap} IST`;
  };
  const nowStamp = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const DISCLAIMER = '<p class="fin-disclaimer" role="note"><span aria-hidden="true">ⓘ </span>Receipt numbers are internal. They are not tax invoices.</p>';

  /* ---------- Live class strings (copied from the captures) ---------- */
  const LINK = 'rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const LINK_FILTER = 'rounded-chip text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none font-medium aria-[current=page]:font-bold aria-[current=page]:text-ink';
  const LINK_PLAIN = 'rounded-chip text-brand-strong underline underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const LINK_LIST = 'rounded-chip text-brand-strong underline underline-offset-4 hover:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const SUMMARY = 'cursor-pointer rounded-chip font-medium text-copy outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const INPUT = 'block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-lg text-ink sm:text-base m-0 appearance-none shadow-none transition-[border-color] duration-(--ui-duration-quick) motion-reduce:transition-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-wash disabled:text-quiet aria-invalid:border-2 aria-invalid:border-status-danger aria-invalid:focus:border-status-danger aria-invalid:focus:outline-status-danger';
  const TEXTAREA = INPUT.replace('min-h-10 ', '') + ' min-h-24 resize-y leading-relaxed';
  const BTN_LG_PRIMARY_WRAP = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white px-4 text-md h-auto min-h-11 py-2 whitespace-normal';
  const BTN_LG_DANGER_WRAP = BTN_LG_PRIMARY_WRAP.replace('border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white', 'border-status-danger bg-status-danger text-white shadow-button hover:border-status-danger-strong hover:bg-status-danger-strong hover:text-white');
  const BTN_LG_SECONDARY = ui.buttonClass('secondary', 'lg', 'min-h-11');
  const BTN = (v = 'secondary', s = 'md', x) => ui.buttonClass(v, s, x);
  const H_LINES = 'mb-5 flex flex-col gap-2 font-sans text-base text-copy [&_p]:m-0';

  /* ---------- Small live components ---------- */
  /** Legacy finance status pill (finance-common StatusPill). */
  const pill = (tone, glyph, label, text) => `<span class="status-pill ${tone}"><span class="status-glyph" aria-hidden="true">${glyph}</span><span class="visually-hidden">${label} </span>${text}</span>`;
  const REVIEW = { waiting: ['info', '◐', 'Waiting for Accounts review'], approved: ['ok', '●', 'Approved by Accounts'], returned: ['warn', '↩', 'Returned to Sales'] };
  const reviewPill = (d) => (d.accountsReview && REVIEW[d.accountsReview] ? pill(...REVIEW[d.accountsReview].slice(0, 2), 'Review:', REVIEW[d.accountsReview][2]) : pill('neutral', '–', 'Review:', 'No confirmed booking to review'));
  const billingPill = (b) => (!b ? pill('warn', '○', 'Billing details:', 'Not entered yet') : b.status === 'verified' ? pill('ok', '●', 'Billing details:', 'Verified') : pill('info', '◐', 'Billing details:', 'Saved, not verified'));
  const financeHeader = (o) => ui.pageHeader({ eyebrow: o.eyebrow || 'Accounts', title: o.title, status: o.status, actions: o.actions, cls: 'mb-3' }) + `<div class="${H_LINES}" data-slot="finance-header-lines">${o.lines || ''}${DISCLAIMER}</div>`;
  const blocked = (id, text) => `<p id="${id}" class="fin-blocked"><span aria-hidden="true">⊘ </span>${text}</p>`;
  let uid = 0;
  const nid = (p) => `${p}-${++uid}`;
  const unavailable = (label, reason) => { const id = nid('why'); return `<div class="fin-unavailable"><button type="button" class="button secondary small" aria-disabled="true" aria-describedby="${id}">${label}</button>${blocked(id, reason)}</div>`; };
  const stateOnly = (list) => `<p class="fin-state-only"><span class="visually-hidden">Not possible in the current state: </span><span aria-hidden="true">Not possible now: </span>${list}.</p>`;
  const noFurther = (what = 'receipt') => `<p class="fin-state-only">No further action is possible on this ${what} in its current state.</p>`;
  const status = () => '<div role="status" aria-live="polite"></div>';
  /** Legacy .field (finance forms). */
  function lfield(o) {
    const id = o.id || nid('f');
    const hint = o.hint ? `<span id="${id}-hint" class="hint">${o.hint}</span>` : '';
    const desc = o.hint ? ` aria-describedby="${id}-hint"` : '';
    const req = o.required ? ' required=""' : '';
    let control;
    if (o.options) control = `<select id="${id}"${desc} name="${o.name}"${req}>${o.options.map((op) => `<option value="${esc(op.value)}"${op.value === o.value ? ' selected=""' : ''}>${esc(op.label)}</option>`).join('')}</select>`;
    else if (o.textarea) control = `<textarea id="${id}"${desc} name="${o.name}" maxLength="${o.max || 500}" rows="${o.rows || 2}"${req}>${esc(o.value || '')}</textarea>`;
    else control = `<input id="${id}"${desc}${o.type ? ` type="${o.type}"` : ''}${o.inputMode ? ` inputMode="${o.inputMode}"` : ''}${o.max ? ` maxLength="${o.max}"` : ''} autoComplete="off"${o.caps ? ' autoCapitalize="characters" spellCheck="false"' : ''}${req} name="${o.name}" value="${esc(o.value || '')}"/>`;
    return `<div class="field${o.wide ? ' field-wide' : ''}"${o.attrs || ''}><label for="${id}">${o.label}</label>${hint}${control}</div>`;
  }
  /** b11 field (form-kit AreaField): label + textarea + hint. */
  const areaField = (id, name, label, hint, rows = 2) => `<div class="flex flex-col gap-1.5" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="${id}">${label}</label><textarea rows="${rows}" class="${TEXTAREA}" data-slot="textarea" id="${id}" name="${name}" maxLength="500" aria-describedby="${id}-hint"></textarea><p class="m-0 font-sans text-sm text-quiet" id="${id}-hint">${hint}</p></div>`;
  const doneMsg = (text) => `<div class="message success" role="status"><strong>Done: </strong>${text}</div>`;
  const errMsg = (text) => `<div class="message error" role="alert"><strong>Not saved: </strong>${text}</div>`;
  /** Show a refusal inside the form without re-rendering (typed input stays). */
  function refuse(form, text, fields = []) {
    form.querySelectorAll('.field-issue, [data-acct-issue]').forEach((n) => n.remove());
    form.querySelectorAll('[aria-invalid]').forEach((n) => n.removeAttribute('aria-invalid'));
    const box = form.querySelector('[role=status],[role=alert]');
    const html = errMsg(text);
    if (box) box.outerHTML = html; else form.insertAdjacentHTML('afterbegin', html);
    fields.forEach(([name, msg]) => {
      const c = form.querySelector(`[name="${name}"]`);
      if (!c) return;
      c.setAttribute('aria-invalid', 'true');
      if (msg) c.insertAdjacentHTML('afterend', `<span class="field-issue" data-acct-issue>${msg}</span>`);
    });
    const first = fields.length ? form.querySelector(`[name="${fields[0][0]}"]`) : null;
    (first || form.querySelector('[role=alert]')).focus && (first || form.querySelector('[role=alert]')).focus();
    const a = form.querySelector('[role=alert]'); if (a) { a.tabIndex = -1; if (!first) a.focus(); }
  }
  /** b11-style refusal (ResultBox) for the newer screens. */
  function refuseB11(box, text) {
    box.innerHTML = ui.notice(`<p>${text}</p>`, { tone: 'danger', role: 'alert', title: 'Not saved' });
  }
  /* One-shot inline success messages after a re-render. */
  const flashes = {};
  const flash = (key, html) => { flashes[key] = html; };
  const takeFlash = (key) => { const h = flashes[key]; delete flashes[key]; return h || ''; };
  const notify = (to, text, extra = {}) => D.notices.unshift({ id: 'n-acct-' + (++uid), to, kind: 'notice', text, at: nowStamp(), ...extra });
  const text10 = (v) => { const n = String(v || '').trim().length; return n >= 10 && n <= 500; };
  /** Close an open drawer or dialog (forms now open there), then re-render in place. */
  const settle = () => { if (document.querySelector('#tn-overlay > *')) TN.closeOverlay(); TN.refresh(); };

  /* =====================================================================
     Redesign parts shared by every Accounts page (16 Nov 2026, Agent D).
     Agent A's shared helpers (TN.ui.sectionTabs, queueToolbar, approvalRowActions,
     status, recordHeader, state) are used when they exist; otherwise these local
     versions draw the same pattern from existing CRM parts. 70-money.js uses
     them through TN.accUI.
     ===================================================================== */
  TN.accCount = TN.accCount || {};
  const SECTIONS = [
    { key: 'check', label: 'To check', tabs: [['/app/accounts', 'To check'], ['/app/accounts/customers', 'Customers'], ['/app/accounts/claims', 'Reported payments']] },
    { key: 'in', label: 'Money in', tabs: [['/app/accounts/dues', 'Dues'], ['/app/accounts/documents', 'Invoices and vouchers'], ['/app/accounts/refunds', 'Refunds']] },
    { key: 'out', label: 'Money out', tabs: [['/app/accounts/supplier-payments', 'Supplier payments'], ['/app/accounts/supplier-invoices', 'Supplier invoices'], ['/app/accounts/funding', 'Company funding'], ['/app/accounts/expenses', 'Department costs']] },
    { key: 'cash', label: 'Cash and bank', tabs: [['/app/accounts/cash', 'Branch cash'], ['/app/accounts/destinations', 'Company accounts']] },
    { key: 'records', label: 'Records', tabs: [['/app/reports', 'Reports']] },
    { key: 'tally', label: 'Tally', tabs: [['/app/accounts/tally', 'Tally']] },
  ];
  const A_KEY = { check: 'to-check', in: 'money-in', out: 'money-out', cash: 'cash-bank', records: 'records', tally: 'tally' };
  const sectionLabel = (key) => (SECTIONS.find((s) => s.key === key) || {}).label || 'Accounts';
  /** Section tab strip (brief section 3). Only tabs this role may open; no strip for a one-tab section. */
  function sectionTabs(key, href) {
    const shared = TN.accSection ? TN.accSection(A_KEY[key] || key) : null;
    // The shared strip lists every tab; a role that cannot open one of them (the Manager) gets only its own tabs.
    if (ui.sectionTabs && TN.ACC_SECTIONS && (!shared || shared.tabs.every((t) => TN.canOpen(t.href)))) { try { return ui.sectionTabs(A_KEY[key] || key, href); } catch (e) { /* fall back below */ } }
    const s = SECTIONS.find((x) => x.key === key);
    const tabs = shared ? shared.tabs.map((t) => [t.href, t.label, t.count]) : s.tabs.map(([h, l]) => [h, l, TN.accCount[h]]);
    const items = tabs.filter(([h]) => TN.canOpen(h)).map(([h, l, fn]) => {
      let n; try { n = fn ? fn() : undefined; } catch (e) { n = undefined; }
      return { href: h, label: l, current: h === href, count: typeof n === 'number' ? n : undefined };
    });
    return items.length > 1 ? ui.tabs({ label: `${s.label} pages`, cls: 'mb-4', items }) : '';
  }
  /** Status badge from the shared status-to-tone table (C3) when present; tone is the fallback. */
  const STONE = { ok: 'success', info: 'info', warn: 'warning', neutral: 'neutral', danger: 'danger' };
  function st(word, tone, second) {
    if (ui.status) { try { return ui.status(word, { second, wrap: true }); } catch (e) { /* fall back */ } }
    return `<span class="inline-flex flex-wrap items-center gap-x-2 gap-y-1">${ui.badge(word, STONE[tone] || tone || 'neutral', { wrap: true })}${second ? `<span class="text-sm text-quiet">${second}</span>` : ''}</span>`;
  }
  /** Date range that never wraps: "6–8 Nov 2026", "28 Oct – 3 Nov 2026". */
  function range(a, b) {
    if (!a) return '—';
    if (!b || a === b) return `<span class="whitespace-nowrap">${fdate(a)}</span>`;
    const [ya, ma] = a.split('-'); const [yb, mb] = b.split('-');
    const da = fdate(a).split(' '); const db = fdate(b);
    const left = ya !== yb ? fdate(a) : ma !== mb ? `${da[0]} ${da[1]}` : da[0];
    return `<span class="whitespace-nowrap">${left}${ya === yb && ma === mb ? '–' : ' – '}${db}</span>`;
  }
  /**
   * Work-list toolbar (C2): one search field, up to four chips (rest under "More"), a sort select.
   * o = { id, search: { name, value, placeholder, label }, chips: [{ href, label, count, current }], sort: { name, value, options: [{ value, label }] }, extra }
   * Search and sort keep the page's other query values (?tab=, ?filter=).
   */
  function toolbar(o) {
    if (ui.queueToolbar) { try { return ui.queueToolbar({ ...o, act: undefined }); } catch (e) { /* fall back */ } }
    const chips = o.chips || [];
    let shown = chips.slice(0, 4); let more = chips.slice(4);
    const cur = more.find((c) => c.current);
    if (cur) { more = more.filter((c) => c !== cur).concat(shown[3]); shown = shown.slice(0, 3).concat(cur); }
    const chipLinks = chips.length ? ui.filterChips({ label: o.chipsLabel || 'Show', chips: shown.map((c) => ({ ...c, count: c.count === undefined ? undefined : c.count })) }) : '';
    const moreHtml = more.length ? `<details class="relative font-sans text-sm" data-slot="more-chips"><summary class="inline-flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-control border border-line-strong bg-card px-3 py-1 text-sm font-medium text-ink hover:bg-wash [&::-webkit-details-marker]:hidden ${ui.FOCUS}">More<span class="sr-only"> filters</span>${TN.ic('chevron-down', 'size-3.5')}</summary><div class="mt-2">${ui.filterChips({ label: 'More filters', chips: more })}</div></details>` : '';
    const s = o.search; const so = o.sort;
    const form = s || so ? `<form role="search" aria-label="${esc(o.label || 'Find in this list')}" data-act="acc-q" class="flex flex-col gap-2 sm:flex-row sm:items-end">${s ? `<div class="min-w-0 flex-1"><label class="sr-only" for="${o.id}-q">${esc(s.label || 'Search')}</label><div class="relative">${TN.ic('search', 'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-quiet')}<input type="search" id="${o.id}-q" name="${esc(s.name)}" value="${esc(s.value || '')}" placeholder="${esc(s.placeholder)}" autoComplete="off" spellCheck="false" class="${ui.CONTROL} pl-9" data-slot="input"/></div></div>` : ''}${so ? `<div class="flex items-center gap-2"><label class="text-sm whitespace-nowrap text-quiet" for="${o.id}-sort">Sort</label><select id="${o.id}-sort" name="${esc(so.name)}" data-change="acc-q" class="${ui.CONTROL} cursor-pointer">${so.options.map((x) => `<option value="${esc(x.value)}"${x.value === so.value ? ' selected=""' : ''}>${esc(x.label)}</option>`).join('')}</select></div>` : ''}${s ? ui.button('Find', { type: 'submit' }) : ''}</form>` : '';
    return `<div class="mb-4 flex flex-col gap-3 font-sans" data-slot="queue-toolbar">${form}${chipLinks || moreHtml || o.extra ? `<div class="flex flex-wrap items-start gap-2">${chipLinks}${moreHtml}${o.extra || ''}</div>` : ''}</div>`;
  }
  TN.act('acc-q', (el) => {
    const form = el.tagName === 'FORM' ? el : el.form || el.closest('form');
    if (!form) return;
    const path = TN.path().split('?')[0];
    const q = { ...TN.query() };
    new FormData(form).forEach((v, k) => { q[k] = String(v).trim(); });
    Object.keys(q).forEach((k) => { if (!q[k]) delete q[k]; });
    const focusId = el.tagName === 'FORM' ? (form.querySelector('input[type=search]') || {}).id : el.id;
    const qs = new URLSearchParams(q).toString();
    TN.go(path + (qs ? '?' + qs : ''));
    if (focusId) setTimeout(() => { const f = document.getElementById(focusId); if (f) f.focus(); }, 60);
  });
  /** Filter and sort a list by the toolbar's ?q= and ?sort= values. */
  function applyQuery(list, q, o) {
    const needle = String(q[o.searchName || 'q'] || '').trim().toLowerCase();
    let out = needle ? list.filter((x) => o.text(x).toLowerCase().includes(needle)) : list.slice();
    const key = o.sorts[q.sort] ? q.sort : o.def;
    out.sort(o.sorts[key].cmp);
    return { list: out, sort: key, needle };
  }
  const sortOptions = (sorts) => Object.entries(sorts).map(([value, s]) => ({ value, label: s.label }));
  /** Approve / Return on an approval row (C2). Return opens the reason box. */
  function rowActions(o) {
    if (ui.approvalRowActions) { try { return ui.approvalRowActions({ ...o, srFor: o.sr }); } catch (e) { /* fall back */ } }
    return `<div class="flex flex-wrap gap-2">${ui.button(o.approveLabel || 'Approve', { size: 'sm', act: o.approveAct, data: { id: o.id }, srLabel: o.sr ? ' ' + o.sr : '' })}${ui.button(o.returnLabel || 'Return', { size: 'sm', variant: 'ghost', act: o.returnAct, data: { id: o.id }, srLabel: o.sr ? ' ' + o.sr : '', attrs: { 'aria-haspopup': 'dialog' } })}</div>`;
  }
  /** Blocked state on a row (C8): the action stays visible, disabled, with the reason beside it. */
  function blockedBtn(label, reason) {
    const id = nid('why');
    return `<div class="flex flex-col items-start gap-1"><button type="button" class="${ui.buttonClass('secondary', 'sm')}" aria-disabled="true" aria-describedby="${id}" data-slot="button">${label}</button><p id="${id}" class="m-0 max-w-80 text-sm text-quiet">${reason}</p></div>`;
  }
  /** Reason box in the C7 confirm dialog: Cancel first, one button named for the action. */
  function reasonDialog(o) {
    // C7 confirm dialog (Agent A) with the reason required; the confirmed reason is handed to the page's own form action.
    if (TN.confirmChange) {
      TN.confirmChange({ title: o.title, effect: o.effect, affected: o.who, confirmLabel: o.confirmLabel, tone: o.danger ? 'danger' : undefined, reason: 'required', reasonLabel: o.label || 'Reason', reasonHint: o.hint || '10 to 500 characters.',
        onConfirm: (reason) => {
          const f = document.createElement('form'); f.dataset.act = o.act; f.dataset.id = o.id; f.noValidate = true; f.hidden = true;
          f.innerHTML = '<div data-result></div><textarea name="reason"></textarea>'; f.querySelector('textarea').value = reason;
          document.body.appendChild(f); try { f.requestSubmit(); } finally { f.remove(); }
        } });
      return;
    }
    const fid = 'acc-reason-form';
    TN.dialog({ title: o.title, description: o.effect,
      body: `<form id="${fid}" data-act="${o.act}" data-id="${esc(o.id)}" noValidate="" class="flex flex-col gap-3"><div data-result></div>${o.who ? `<p class="m-0 text-sm text-quiet">${o.who}</p>` : ''}${ui.field({ id: 'acc-reason', label: o.label || 'Reason', hint: o.hint || '10 to 500 characters.', textarea: { name: 'reason', rows: 3, attrs: { maxLength: 500 } } })}</form>`,
      footer: ui.button('Cancel', { attrs: { 'data-close': '' } }) + ui.button(o.confirmLabel, { variant: o.danger ? 'danger' : 'primary', type: 'submit', attrs: { form: fid } }) });
  }
  /** Reason from a reason dialog form; null (with an alert and focus) when it is not 10 to 500 characters. */
  function dialogReason(form, msg = 'Write 10 to 500 characters.') {
    const v = String(new FormData(form).get('reason') || '').trim();
    if (text10(v)) return v;
    const t = form.querySelector('textarea'); if (t) t.setAttribute('aria-invalid', 'true');
    const box = form.querySelector('[data-result]'); if (box) refuseB11(box, msg);
    if (t) t.focus();
    return null;
  }
  /** Fold-out detail row under a list row (rows, not cards; details on demand). */
  const openRows = new Set();
  const detailToggle = (id, sr) => `<span class="block"><button type="button" class="mt-1 inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-chip border-0 bg-transparent p-0 text-sm font-medium text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep ${ui.FOCUS}" data-act="acc-row-toggle" data-id="${esc(id)}" aria-expanded="${openRows.has(id) ? 'true' : 'false'}" aria-controls="row-${esc(id)}">Details<span class="sr-only"> ${sr || ''}</span></button></span>`;
  const detailRow = (id, cols, html) => ({ cls: 'bg-canvas', attrs: { id: 'row-' + id, 'data-acc-detail': '', ...(openRows.has(id) ? {} : { hidden: '' }) }, cells: [{ html: `<div class="flex flex-col gap-3 py-1">${html}</div>`, noLabel: true, attrs: { colspan: cols } }] });
  TN.act('acc-row-toggle', (el) => {
    const id = el.dataset.id; const row = document.getElementById('row-' + id);
    const open = el.getAttribute('aria-expanded') !== 'true';
    if (open) openRows.add(id); else openRows.delete(id);
    el.setAttribute('aria-expanded', String(open));
    if (row) row.hidden = !open;
  });
  /** In-page jump that moves focus (hash routing means plain #anchors cannot be used). */
  TN.act('acc-jump', (el) => { if (TN.jumpTo) return TN.jumpTo(el.dataset.target); const t = document.getElementById(el.dataset.target); if (!t) return; if (t.tagName === 'DETAILS') t.open = true; t.scrollIntoView({ block: 'start' }); const f = t.matches('button, a, input, select, textarea, summary, [tabindex]') ? t : t.querySelector('button:not([aria-disabled]), summary, a, input, select, textarea') || t; if (f === t && !t.hasAttribute('tabindex')) t.tabIndex = -1; f.focus(); });
  const emptyCard = (o) => (ui.state ? (() => { try { return ui.state({ kind: 'empty', title: o.title, text: o.text, action: o.action }); } catch (e) { return null; } })() : null) || ui.card(ui.emptyState({ icon: o.icon || 'circle-check', title: o.title, description: o.text, action: o.action, level: 2 })).replace('<div class="px-4.5 py-4">', '<div>');
  const pagerFor = (n, noun, many) => ui.pager({ label: 'List pages', text: n ? `1–${n} of ${TN.fmt.plural(n, noun, many)}` : '' });
  /** List page header: section name as eyebrow, one muted line, one primary action. */
  const listHeader = (key, title, line, actions) => ui.pageHeader({ eyebrow: sectionLabel(key), title, description: line, actions, cls: 'mb-4' });
  TN.accUI = { sectionTabs, st, range, toolbar, applyQuery, sortOptions, rowActions, blockedBtn, reasonDialog, dialogReason, detailToggle, detailRow, emptyCard, pagerFor, listHeader, settle, refuseB11 };

  /* =====================================================================
     Invented Accounts data (own collections; shared records get extra fields)
     ===================================================================== */
  const A = (D.accountsLive = {
    policy: { version: 1, receiptMax: 10000000, cashPayerDay: 199999, cashTrip: 199999 },
    destinations: [
      { id: 'dest-hdfc', label: 'HDFC Bank current account', kind: 'bank', addedAt: '2026-09-22 11:05', addedBy: 'accounts', retired: false,
        versions: [{ no: 1, bankName: 'HDFC Bank', masked: 'XXXX4417', full: '50200041874417', ifsc: 'HDFC0000412', holder: 'Holiday Chacha Pvt LTD', status: 'approved', submittedAt: '2026-09-22 11:05', submittedBy: 'accounts', decidedAt: '2026-09-22 15:40', decidedBy: 'checker' }] },
      { id: 'dest-upi', label: 'Office UPI', kind: 'upi', addedAt: '2026-09-22 11:20', addedBy: 'checker', retired: false,
        versions: [{ no: 1, payee: 'Holiday Chacha Pvt LTD', masked: 'h***@hdfcbank', full: 'holidaychacha@hdfcbank', status: 'approved', submittedAt: '2026-09-22 11:20', submittedBy: 'checker', decidedAt: '2026-09-23 10:15', decidedBy: 'accounts' }] },
    ],
    deposits: [
      { id: 'DEP-0003', on: '2026-10-10', ref: 'HDFC CDM 101026 0418', receipts: ['RC-26-0104'], recordedBy: 'accounts', verifiedBy: 'checker', status: 'verified', file: 'deposit-slip-10-oct.jpg' },
    ],
    counts: [
      { date: '2026-10-10', counted: 0, expected: 0, unverified: 0, recordedBy: 'checker', verifiedBy: 'accounts', status: 'verified' },
      { date: '2026-10-09', counted: 50000, expected: 50000, unverified: 0, recordedBy: 'accounts', verifiedBy: 'checker', status: 'verified' },
    ],
    // Bill To per Deal (Sales proposes in Book now; Accounts checks).
    billing: {
      'BX-38412': { type: 'personal', name: 'Rohan Agarwal', phone: '+91 98290 41736', email: 'rohan.agarwal84@gmail.com', a1: '14, Shastri Nagar, Sector C', city: 'Jodhpur', pin: '342003', state: '08', gstin: null, status: 'verified', savedAt: '2026-10-19 11:20', savedBy: 'sales', verifiedAt: '2026-10-19 15:05', verifiedBy: 'checker' },
      'BX-38455': { type: 'personal', name: 'Meenal Khatri', phone: '+91 94141 28650', email: 'meenal.khatri@outlook.com', a1: 'B-27, Pal Road, Sardarpura', city: 'Jodhpur', pin: '342001', state: '08', gstin: null, status: 'draft', savedAt: '2026-10-26 12:40', savedBy: 'sales' },
      'BX-38390': { type: 'personal', name: 'Suresh Bhandari', phone: '+91 99280 17403', email: 'sbhandari.jdh@gmail.com', a1: '7, Ratanada Main Road', city: 'Jodhpur', pin: '342011', state: '08', gstin: null, status: 'verified', savedAt: '2026-10-14 10:10', savedBy: 'sales', verifiedAt: '2026-10-14 16:20', verifiedBy: 'accounts' },
      'BX-38377': { type: 'personal', name: 'Deepak Purohit', phone: '+91 97842 56019', email: 'deepak.purohit@yahoo.co.in', a1: '22, Mandia Road', city: 'Pali', pin: '306401', state: '08', gstin: null, status: 'verified', savedAt: '2026-10-09 12:00', savedBy: 'sales2', verifiedAt: '2026-10-09 17:30', verifiedBy: 'checker' },
      'BX-38301': { type: 'personal', name: 'Nidhi Mathur', phone: '+91 98877 30254', email: 'nidhi.mathur91@gmail.com', a1: '3/18, Chopasni Housing Board', city: 'Jodhpur', pin: '342008', state: '08', gstin: null, status: 'verified', savedAt: '2026-10-03 10:40', savedBy: 'sales', verifiedAt: '2026-10-03 14:15', verifiedBy: 'accounts' },
      'BX-38264': { type: 'personal', name: 'Rajesh Soni', phone: '+91 94606 72318', email: 'rajeshsoni.jewellers@gmail.com', a1: 'Soni Jewellers, Tripolia Bazar', city: 'Jodhpur', pin: '342002', state: '08', gstin: null, status: 'verified', savedAt: '2026-09-28 11:30', savedBy: 'sales2', verifiedAt: '2026-09-28 16:45', verifiedBy: 'checker' },
      'BX-38198': { type: 'personal', name: 'Harish Tak', phone: '+91 94133 50276', email: 'harishtak1978@gmail.com', a1: '45, Basni Phase II', city: 'Jodhpur', pin: '342005', state: '08', gstin: null, status: 'verified', savedAt: '2026-10-06 09:50', savedBy: 'sales2', verifiedAt: '2026-10-06 15:00', verifiedBy: 'accounts' },
      'BX-38547': { type: 'business', name: 'Marudhar Agro Foods Pvt Ltd', contact: 'Ankit Jain', phone: '+91 291 274 6630', email: 'admin@marudharagrofoods.in', a1: 'E-118, Heavy Industrial Area', city: 'Jodhpur', pin: '342003', state: '08', gstStatus: 'registered', gstin: '08AAJCM4721K1Z6', status: 'verified', savedAt: '2026-10-22 12:15', savedBy: 'sales', verifiedAt: '2026-10-22 17:05', verifiedBy: 'checker' },
      'BX-38520': { type: 'business', name: 'Vyas and Associates, Chartered Accountants', contact: 'Pooja Vyas', phone: '+91 96365 48107', email: 'pooja.vyas.ca@gmail.com', a1: '2nd floor, Sojati Gate Market', city: 'Jodhpur', pin: '342001', state: '08', gstStatus: 'registered', gstin: '24AAKFV3318L1Z2', status: 'draft', savedAt: '2026-10-24 13:05', savedBy: 'sales' },
    },
    // When each booking was confirmed by Sales and last reviewed.
    review: {
      'BX-38412': { confirmedAt: '2026-10-19 10:55', by: 'sales', version: 1, reviewedAt: '2026-10-19 16:10', reviewedBy: 'accounts' },
      'BX-38455': { confirmedAt: '2026-10-26 12:45', by: 'sales', version: 1 },
      'BX-38390': { confirmedAt: '2026-10-14 10:20', by: 'sales', version: 1, reviewedAt: '2026-10-14 17:00', reviewedBy: 'checker' },
      'BX-38377': { confirmedAt: '2026-10-09 12:10', by: 'sales2', version: 1, reviewedAt: '2026-10-09 18:05', reviewedBy: 'accounts' },
      'BX-38301': { confirmedAt: '2026-10-03 10:45', by: 'sales', version: 1, reviewedAt: '2026-10-03 15:00', reviewedBy: 'checker' },
      'BX-38264': { confirmedAt: '2026-09-28 11:40', by: 'sales2', version: 1, reviewedAt: '2026-09-28 17:20', reviewedBy: 'accounts' },
      'BX-38520': { confirmedAt: '2026-10-24 13:10', by: 'sales', version: 1, reviewedAt: '2026-10-25 12:25', reviewedBy: 'checker' },
      'BX-38198': { confirmedAt: '2026-10-06 10:00', by: 'sales2', version: 1, reviewedAt: '2026-10-06 15:30', reviewedBy: 'checker' },
      'BX-38547': { confirmedAt: '2026-10-22 12:20', by: 'sales', version: 1, reviewedAt: '2026-10-22 17:30', reviewedBy: 'accounts' },
    },
    // Customers to check (Bill To parties).
    parties: [
      { id: 'pt-khatri', customer: 'c-khatri', status: 'not_checked', source: 'Added on BX-38455', addedAt: '2026-10-26', addedBy: 'sales' },
      { id: 'pt-vyasca', type: 'business', name: 'Vyas and Associates, Chartered Accountants', contact: 'Pooja Vyas', phone: '+91 96365 48107', email: 'pooja.vyas.ca@gmail.com', a1: '2nd floor, Sojati Gate Market', city: 'Jodhpur', state: '08', pin: '342001', gstStatus: 'registered', gstin: '24AAKFV3318L1Z2', status: 'returned', returnedReason: 'The GSTIN starts with 24 (Gujarat) but the firm is in Jodhpur, Rajasthan (08). Please check the GSTIN with the customer.', source: 'Added on BX-38520', addedAt: '2026-10-24', addedBy: 'sales', usedOn: ['BX-38520'], files: [{ name: 'gst-certificate-vyas.pdf', kind: 'GST certificate', size: '312 KB' }] },
      { id: 'pt-choudhary', customer: 'c-choudhary', status: 'not_checked', source: 'Imported', addedAt: '2026-10-20', addedBy: null },
      { id: 'pt-rathi', customer: 'c-rathi', status: 'not_checked', source: 'Imported', addedAt: '2026-10-20', addedBy: null },
      { id: 'pt-bishnoi', customer: 'c-bishnoi', status: 'not_checked', source: 'Imported', addedAt: '2026-10-20', addedBy: null },
      { id: 'pt-marudhar', customer: 'c-marudhar', status: 'checked', source: 'Added on BX-38547', addedAt: '2026-10-22', addedBy: 'sales', checkedBy: 'checker', checkedAt: '2026-10-22', files: [{ name: 'marudhar-gst-certificate.pdf', kind: 'GST certificate', size: '268 KB' }] },
      { id: 'pt-agarwal', customer: 'c-agarwal', status: 'checked', source: 'Imported', addedAt: '2026-10-12', checkedBy: 'accounts', checkedAt: '2026-10-19' },
      { id: 'pt-bhandari', customer: 'c-bhandari', status: 'checked', source: 'Imported', addedAt: '2026-10-12', checkedBy: 'checker', checkedAt: '2026-10-14' },
      { id: 'pt-purohit', customer: 'c-purohit', status: 'checked', source: 'Imported', addedAt: '2026-10-08', checkedBy: 'accounts', checkedAt: '2026-10-09' },
      { id: 'pt-mathur', customer: 'c-mathur', status: 'checked', source: 'Imported', addedAt: '2026-10-01', checkedBy: 'checker', checkedAt: '2026-10-03' },
      { id: 'pt-soni', customer: 'c-soni', status: 'checked', source: 'Imported', addedAt: '2026-09-25', checkedBy: 'accounts', checkedAt: '2026-09-28' },
      { id: 'pt-tak', customer: 'c-tak', status: 'checked', source: 'Imported', addedAt: '2026-10-05', checkedBy: 'checker', checkedAt: '2026-10-06' },
    ],
    goAheadLog: {},
  });
  // Fill personal parties from the shared customers (same people, one source).
  A.parties.forEach((p) => {
    if (!p.customer) return;
    const c = TN.customer(p.customer);
    const bill = Object.entries(A.billing).find(([dl, b]) => TN.deal(dl) && TN.deal(dl).customer === p.customer);
    Object.assign(p, { type: c.business ? 'business' : 'personal', name: c.name, contact: c.contact || null, phone: c.phone, email: c.email, city: c.city, state: '08', gstStatus: c.business ? 'registered' : null, gstin: c.gstin || null,
      a1: bill ? bill[1].a1 : null, pin: bill ? bill[1].pin : null, usedOn: D.deals.filter((d) => d.customer === p.customer && d.submittedAt).map((d) => d.id), files: p.files || [] });
  });

  /* Department costs are shared with Agent E (TN.DATA.departmentCosts, live department_cost_entries).
     Never reassign: only add rows. One extra Visa courier cost waits for Accounts. */
  D.departmentCosts = D.departmentCosts || [];
  D.departmentFiles = D.departmentFiles || [];
  if (!D.departmentCosts.some((x) => x.id === 'dc-390v-3')) D.departmentCosts.push({ id: 'dc-390v-3', task: 's-390-v', dept: 'visa', deal: 'BX-38390', kind: 'other', note: 'Courier of passports to VFS Ahmedabad', amount: 1200, paidBy: 'company', mode: 'cash', paidOn: '2026-10-24', reference: 'DTDC Z61840227', proof: 'df-390v-5', status: 'submitted', submittedAt: '2026-10-24 12:10', submittedBy: 'visa' });
  if (!D.departmentFiles.some((x) => x.id === 'df-390v-5')) D.departmentFiles.push({ id: 'df-390v-5', task: 's-390-v', kind: 'fee_receipt', name: 'dtdc-courier-receipt-24oct.jpg', size: '154 KB', at: '2026-10-24 12:05' });
  const COSTS = () => D.departmentCosts.filter((c) => c.status && c.status !== 'draft');
  const COST_KIND = { fare: 'Fare', government_fee: 'Government fee', service_fee: 'Service fee', other: 'Other cost' };
  const COST_MODE = { bank_transfer: 'Bank transfer', upi: 'UPI', card: 'Card', cash: 'Cash', other: 'Other' };
  const COST_PAID = { company: 'Company', customer_direct: 'Customer directly', not_yet: 'Not yet' };
  const costFiles = (c) => (c.proof ? D.departmentFiles.filter((f) => f.id === c.proof) : []).concat(D.departmentFiles.filter((f) => c.proofs && c.proofs.includes(f.id)));
  const costHistory = (c, title, detail) => { const H = (D.taskHistory = D.taskHistory || {}); (H[c.task] = H[c.task] || []).push({ title, at: nowStamp(), by: me(), ...(detail ? { detail } : {}) }); };

  /* Extra fields on the shared receipts (payer, times, proof files, cheque details). */
  const RX = {
    'RC-26-0107': { payer: 'Rohan Agarwal', pan: 'XXXXX4821X', recordedAt: '2026-10-19 12:30', verifiedAt: '2026-10-19 15:10', dest: 'dest-hdfc', files: [{ kind: 'bank_proof', name: 'hdfc-statement-19-oct.pdf' }] },
    'RC-26-0109': { payer: 'Suresh Bhandari', mobile: 'XXXXXX7403', recordedAt: '2026-10-14 13:05', verifiedAt: '2026-10-14 16:30', dest: 'dest-upi', files: [{ kind: 'bank_proof', name: 'hdfc-upi-credit-14-oct.pdf' }] },
    'RC-26-0112': { payer: 'Suresh Bhandari', pan: 'XXXXX9036K', recordedAt: '2026-10-24 17:20', dest: 'dest-hdfc', chequeNo: '004182', micr: '342002003', chequeDate: '2026-10-24', files: [{ kind: 'cheque_image', name: 'cheque-004182-sbi.jpg' }] },
    'RC-26-0104': { payer: 'Deepak Purohit', mobile: 'XXXXXX6019', recordedAt: '2026-10-09 13:15', verifiedAt: '2026-10-09 17:40', collector: 'accounts', files: [] },
    'RC-26-0101': { payer: 'Nidhi Mathur', pan: 'XXXXX2210M', recordedAt: '2026-10-03 11:30', verifiedAt: '2026-10-03 14:20', dest: 'dest-hdfc', files: [{ kind: 'bank_proof', name: 'hdfc-statement-03-oct.pdf' }] },
    'RC-26-0098': { payer: 'Rajesh Soni', mobile: 'XXXXXX2318', recordedAt: '2026-09-28 12:00', verifiedAt: '2026-09-28 16:50', dest: 'dest-upi', files: [{ kind: 'bank_proof', name: 'hdfc-upi-credit-28-sep.pdf' }] },
    'RC-26-0103': { payer: 'Rajesh Soni', pan: 'XXXXX7764R', recordedAt: '2026-10-07 11:45', verifiedAt: '2026-10-07 15:30', dest: 'dest-hdfc', files: [{ kind: 'bank_proof', name: 'hdfc-statement-07-oct.pdf' }] },
    'RC-26-0105': { payer: 'Harish Tak', mobile: 'XXXXXX0276', recordedAt: '2026-10-06 12:40', verifiedAt: '2026-10-06 15:20', dest: 'dest-upi', files: [{ kind: 'bank_proof', name: 'hdfc-upi-credit-06-oct.pdf' }] },
    'RC-26-0114': { payer: 'Rohan Agarwal', mobile: 'XXXXXX1736', recordedAt: '2026-10-27 10:15', dest: 'dest-upi', files: [{ kind: 'bank_proof', name: 'hdfc-upi-credit-27-oct.pdf' }], claim: 'PR-0041' },
  };
  D.receipts.forEach((r) => { if (RX[r.id]) Object.keys(RX[r.id]).forEach((k) => { if (r[k] === undefined) r[k] = RX[r.id][k]; }); if (!r.files) r.files = []; });
  const CX = {
    'PR-0042': { payer: 'Meenal Khatri', into: 'dest-hdfc', note: 'Customer sent the NEFT screenshot on WhatsApp. Advance for the Kerala trip.', reportedAt: '2026-10-26' },
    'PR-0041': { payer: 'Rohan Agarwal', into: 'dest-upi', note: 'Balance part payment by Google Pay.', reportedAt: '2026-10-27', linkedBy: 'accounts' },
  };
  D.paymentReports.forEach((c) => { if (CX[c.id]) Object.keys(CX[c.id]).forEach((k) => { if (c[k] === undefined) c[k] = CX[c.id][k]; }); });

  /* =====================================================================
     Money rules and lookups
     ===================================================================== */
  const MODE_KEY = { 'Bank transfer': 'bank_transfer', UPI: 'upi', Cash: 'cash', Cheque: 'cheque' };
  const MODE_LABEL = { bank_transfer: 'Bank transfer', upi: 'UPI', cash: 'Cash', cheque: 'Cheque' };
  const receiptsOf = (dealId) => D.receipts.filter((r) => r.deal === dealId).sort((a, b) => (b.recordedAt || b.date).localeCompare(a.recordedAt || a.date));
  /** Live receipt status key for a shared receipt record. */
  function rstat(r) {
    if (r.status === 'recorded') return 'recorded';
    if (r.status === 'rejected') return 'rejected';
    if (r.status === 'reversed') return 'reversed';
    if (r.mode === 'Cheque') return { waiting_clearance: 'pending_clearance', cleared: 'cleared', bounced: 'bounced', stopped: 'stopped', cancelled: 'cancelled' }[r.cheque] || 'cleared';
    return 'verified';
  }
  function money(dealId) {
    const m = { available: 0, waiting: 0, cheques: 0 };
    receiptsOf(dealId).forEach((r) => { const s = rstat(r); if (s === 'verified' || s === 'cleared') m.available += r.amount; else if (s === 'recorded') m.waiting += r.amount; else if (s === 'pending_clearance') m.cheques += r.amount; });
    return m;
  }
  const destOf = (id) => A.destinations.find((x) => x.id === id);
  const currentVer = (dst) => [...dst.versions].reverse().find((v) => v.status === 'approved' && !v.replaced);
  const maskedDest = (dst, v) => (dst.kind === 'bank' ? `${v.bankName} ${v.masked}` : `${v.payee} ${v.masked}`);
  const destOptions = (kind) => A.destinations.filter((d) => d.kind === kind && !d.retired && currentVer(d)).map((d) => ({ value: d.id, label: `${d.label} · ${maskedDest(d, currentVer(d))} · version ${currentVer(d).no}` }));
  const hotelsOf = (dealId) => TN.servicesOf(dealId).filter((s) => s.kind === 'hotel');
  const hotelCost = (s) => (s.cost != null ? s.cost : s.budget || 0);
  /** Company money needed if these hotels are committed now: committed hotel cost minus available customer funds (Stage 3 definition). */
  function fundingFor(dealId, extraIds = []) {
    const committed = hotelsOf(dealId).filter((s) => s.goAhead === 'given' || extraIds.includes(s.id)).reduce((t, s) => t + hotelCost(s), 0);
    return Math.max(0, committed - money(dealId).available);
  }
  const FUND_LIMIT = 50000;
  const managerFunding = (dealId, sid) => (D.funding || []).find((f) => f.deal === dealId && f.service === sid && f.status === 'approved' && f.approvedBy === 'manager');
  const goAheadWaitingList = () => Object.entries(D.services).map(([id, s]) => ({ id, ...s })).filter((s) => s.kind === 'hotel' && (s.goAhead === 'waiting' || s.goAhead === 'refused') && TN.deal(s.deal) && TN.deal(s.deal).accountsReview !== 'returned');
  const receiptsToVerifyForMe = () => D.receipts.filter((r) => r.status === 'recorded' && r.recordedBy !== me());

  /* ---------- Home row: the four live Accounts rows are built by 13-home.js; only the pending go-ahead row is added here ---------- */
  TN.homeRow({ roles: ROLES, section: 'What needs you', icon: 'hotel', label: 'Hotels waiting for the Accounts go-ahead', count: () => goAheadWaitingList().length, href: '/app/accounts?filter=go_ahead', action: 'Open To check' });

  /* =====================================================================
     To check  ·  #/app/accounts
     ===================================================================== */
  const QF = [
    { value: 'needs_review', label: 'Booking reviews', tab: true },
    { value: 'awaiting_verification', label: 'Receipts to verify', tab: true },
    { value: 'go_ahead', label: 'Hotel go-ahead', tab: true },
    { value: 'all', label: 'All', tab: true },
    { value: 'returned', label: 'Returned to Sales', tab: false },
    { value: 'cheques_pending', label: 'Cheques awaiting clearance', tab: false },
  ];
  const QEMPTY = {
    needs_review: ['No booking reviews waiting', 'A booking appears here when Sales submits it. Receipts to verify are on their own tab.'],
    awaiting_verification: ['No receipts to verify', 'A receipt appears here after an Accounts person records it. Another Accounts person verifies it.'],
    go_ahead: ['No hotels waiting for the go-ahead', 'A hotel appears here when Sales submits a booking with a hotel. Purchase books it with the hotel only after the go-ahead.'],
    all: ['Nothing to check', 'A deal appears here when Sales submits a booking or when a receipt is recorded. To record a receipt for another deal, find it by reference above.'],
    returned: ['No bookings returned to Sales', 'No deal matches this filter right now. Choose “All” to see every deal.'],
    cheques_pending: ['No cheques awaiting clearance', 'No deal matches this filter right now. Choose “All” to see every deal.'],
  };
  const inQueue = (d) => d.submittedAt || D.receipts.some((r) => r.deal === d.id);
  function queueDeals(filter) {
    const all = D.deals.filter(inQueue);
    if (filter === 'needs_review') return all.filter((d) => d.accountsReview === 'waiting');
    if (filter === 'awaiting_verification') return all.filter((d) => money(d.id).waiting > 0);
    if (filter === 'returned') return all.filter((d) => d.accountsReview === 'returned');
    if (filter === 'cheques_pending') return all.filter((d) => money(d.id).cheques > 0);
    return all;
  }
  const cap = (t) => String(t || '').charAt(0).toUpperCase() + String(t || '').slice(1);
  const ownerName = (d) => esc(pname(d.owner));
  /** What the row asks next, with one row button when this person can act. */
  function rowNext(d) {
    const rs = receiptsOf(d.id).filter((r) => r.status === 'recorded');
    const others = rs.filter((r) => r.recordedBy !== me());
    if (others.length) return { text: `${TN.fmt.plural(others.length, 'receipt')} to verify`, btn: ui.button('Verify', { size: 'sm', href: `/app/accounts/deals/${d.id}?tab=receipts`, srLabel: ` receipts on ${esc(d.id)}` }) };
    if (rs.length) return { text: 'Another Accounts person verifies your receipt' };
    const n = nextOf(d);
    if (n.nothing) return { text: 'Nothing waiting' };
    if (!n.tab) return { text: cap(n.text) };
    return { text: cap(n.text), btn: ui.button(n.tab === 'review' ? 'Review' : 'Open', { size: 'sm', href: `/app/accounts/deals/${d.id}?tab=${n.tab}`, srLabel: ` ${esc(d.id)}` }) };
  }
  const nextCell = (n) => `<div class="flex flex-col items-start gap-1.5"><span class="text-sm text-copy">${n.text}</span>${n.btn || ''}</div>`;
  const DEAL_SORTS = {
    oldest: { label: 'Oldest waiting first', cmp: (a, b) => (a.submittedAt || '9').localeCompare(b.submittedAt || '9') || a.id.localeCompare(b.id) },
    newest: { label: 'Newest first', cmp: (a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '') },
    trip: { label: 'Soonest travel first', cmp: (a, b) => (a.start || '').localeCompare(b.start || '') },
  };
  const dealText = (d) => [d.id, d.title, d.destination, (TN.customer(d.customer) || {}).name].join(' ');
  function queueTable(list) {
    return ui.table({
      label: 'Deals to check', top: true,
      columns: [{ label: 'Deal', cellCls: 'min-w-48' }, { label: 'Available', numeric: true }, { label: 'Awaiting verification', numeric: true }, { label: 'Cheques awaiting clearance', numeric: true }, 'Status', { label: 'Next step', cellCls: 'min-w-40' }],
      rows: list.map((d) => {
        const m = money(d.id); const b = A.billing[d.id];
        const bill = !b ? 'Billing not entered yet' : b.status === 'verified' ? 'Billing verified' : 'Billing saved, not verified';
        const rev = !d.submittedAt ? ['No confirmed booking to review', 'neutral'] : REVIEW[d.accountsReview] ? [REVIEW[d.accountsReview][2], REVIEW[d.accountsReview][0]] : ['No confirmed booking to review', 'neutral'];
        return [
          `${ui.rowLink(`/app/accounts/deals/${d.id}`, `${esc(d.id)}<span class="sr-only"> — open in Accounts</span>`)}<span class="block text-sm text-quiet">${esc(d.title)}</span><span class="block text-sm text-quiet">Trip ${range(d.start, d.end)}</span>`,
          inr(m.available), inr(m.waiting), inr(m.cheques),
          st(rev[0], rev[1], bill),
          nextCell(rowNext(d)),
        ];
      }),
      footer: pagerFor(list.length, 'deal'),
    }) + `<details class="mt-4 font-sans text-sm text-quiet"><summary class="${SUMMARY}">Why are the amounts separate?</summary><p class="m-0 mt-3">Available money, receipts awaiting verification and cheques awaiting clearance are different things, so they are shown side by side and never added together.</p></details>`;
  }
  const GA = { waiting: ['info', '◐', 'Waiting for go-ahead'], refused: ['warn', '!', 'On hold'], given: ['ok', '●', 'Go-ahead given'] };
  const gaPill = (s) => pill(...(GA[s.goAhead] || GA.waiting).slice(0, 2), 'Go-ahead:', (GA[s.goAhead] || GA.waiting)[2]);
  const gaWord = (s) => (GA[s.goAhead] || GA.waiting);
  /** Can this hotel get the go-ahead now? { ok } or { why }. */
  function goAheadBlock(s) {
    const d = TN.deal(s.deal);
    if (d.accountsReview !== 'approved') return { why: d.accountsReview === 'returned' ? 'The booking is back with Sales. The go-ahead waits until Sales fixes it and Accounts approves it.' : 'Approve the booking first. Approving gives the go-ahead for its hotels at the same time.' };
    const after = fundingFor(d.id, [s.id]);
    if (after > FUND_LIMIT && !managerFunding(d.id, s.id)) return { why: `Company money for this deal would be ${inr(after)}, above ${inr(FUND_LIMIT)}. The branch Manager must approve the company funding first.` };
    return { ok: true };
  }
  const GA_SORTS = {
    trip: { label: 'Soonest stay first', cmp: (a, b) => (a.start || '').localeCompare(b.start || '') },
    oldest: { label: 'Oldest waiting first', cmp: (a, b) => (TN.deal(a.deal).submittedAt || '').localeCompare(TN.deal(b.deal).submittedAt || '') },
  };
  function goAheadTable(list) {
    return ui.table({
      label: 'Hotels waiting for the go-ahead', top: true,
      columns: ['Hotel', 'Stay', { label: 'Company money', numeric: true }, 'Status', 'Next step', 'Deal'],
      rows: list.map((s) => {
        const d = TN.deal(s.deal);
        const fund = fundingFor(d.id, [s.id]);
        const blk = goAheadBlock(s);
        const act = s.goAhead === 'refused' && blk.ok ? ui.button('Give go-ahead', { size: 'sm', act: 'acct-goahead', data: { id: s.id }, srLabel: ` for ${esc(s.title)}` })
          : blk.ok ? rowActions({ id: s.id, approveAct: 'acct-goahead', returnAct: 'acct-hold-open', approveLabel: 'Give go-ahead', returnLabel: 'Hold', sr: `for ${esc(s.title)}` })
          : blockedBtn(`Give go-ahead<span class="sr-only"> for ${esc(s.title)}</span>`, blk.why);
        return [
          `<span class="font-semibold text-ink">${esc(s.title)}</span><span class="block text-sm text-quiet">${esc(s.detail)}</span>`,
          range(s.start, s.end),
          inr(fund),
          st(gaWord(s)[2], gaWord(s)[0], d.accountsReview && REVIEW[d.accountsReview] ? 'Review: ' + REVIEW[d.accountsReview][2] : ''),
          act,
          ui.rowLink(`/app/accounts/deals/${d.id}?tab=review`, `${esc(d.id)}<span class="sr-only"> — open in Accounts</span>`),
        ];
      }),
      footer: pagerFor(list.length, 'hotel'),
    }) + `<details class="mt-4 font-sans text-sm text-quiet"><summary class="${SUMMARY}">What is the go-ahead?</summary><p class="m-0 mt-3">Purchase may ask hotels for offers as soon as the customer accepts, but books a hotel only after Accounts gives the go-ahead. Approving the booking review gives the go-ahead for its hotels at the same time, unless you hold one. Company money is the part of the hotel cost the company would pay before enough customer money is verified; it also needs the go-ahead.</p></details>`;
  }
  TN.act('acct-hold-open', (el) => {
    const s = D.services[el.dataset.id];
    reasonDialog({ title: `Hold ${esc(s.title)}?`, effect: 'Purchase keeps preparing offers but must not book this hotel. Sales sees your reason; Purchase sees only “on hold”.', act: 'acct-hold', id: el.dataset.id, confirmLabel: 'Hold go-ahead' });
  });

  /* Counts for the section tab strips (and the menu, if the shell wants them). */
  const queueCount = () => D.deals.filter(inQueue).filter((d) => d.accountsReview === 'waiting').length + receiptsToVerifyForMe().length + goAheadWaitingList().filter((s) => s.goAhead === 'waiting').length;
  const accCounts60 = {
    '/app/accounts': queueCount,
    '/app/accounts/customers': () => A.parties.filter((p) => p.status === 'not_checked').length,
    '/app/accounts/claims': () => D.paymentReports.filter((c) => c.status === 'reported' && c.by !== me()).length,
    '/app/accounts/expenses': () => COSTS().filter((e) => e.status === 'submitted' && e.submittedBy !== me()).length,
  };
  Object.assign(TN.accCount, accCounts60);
  if (TN.setAccCount) Object.entries(accCounts60).forEach(([h, f]) => TN.setAccCount(h, f));

  TN.page('/app/accounts', {
    nav: '/app/accounts', roles: ROLES, title: 'To check',
    render(_, q) {
      const filter = QF.some((f) => f.value === q.filter) ? q.filter : 'needs_review';
      const isGa = filter === 'go_ahead';
      const raw = isGa ? goAheadWaitingList() : queueDeals(filter);
      const ref = String(q.ref || '').trim();
      const r = isGa
        ? applyQuery(raw, q, { searchName: 'ref', text: (s) => `${s.title} ${s.detail} ${dealText(TN.deal(s.deal))}`, sorts: GA_SORTS, def: 'trip' })
        : applyQuery(raw, q, { searchName: 'ref', text: dealText, sorts: DEAL_SORTS, def: 'oldest' });
      const keep = (f) => '/app/accounts' + (f === 'needs_review' ? '' : '?filter=' + f);
      const countOf = (f) => (f === 'go_ahead' ? goAheadWaitingList().length : queueDeals(f).length);
      const bar = toolbar({ id: 'tc', label: 'Find a deal to check',
        search: { name: 'ref', value: ref, placeholder: 'Deal reference, customer or trip', label: 'Find a deal' },
        chipsLabel: 'To check filters',
        chips: QF.map((f) => ({ href: keep(f.value), label: f.label, count: countOf(f.value), current: f.value === filter })),
        sort: { name: 'sort', value: r.sort, options: sortOptions(isGa ? GA_SORTS : DEAL_SORTS) } });
      // An exact reference that is not in this list still opens (record a receipt for any deal).
      const exact = ref && !r.list.length ? TN.deal(ref.toUpperCase()) : null;
      const empty = exact
        ? emptyCard({ icon: 'search', title: `${esc(exact.id)} is not in this list`, text: `${esc(exact.title)}. ${exact.submittedAt ? 'Open it to see its receipts and review.' : 'No confirmed booking yet; receipts can still be recorded.'}`, action: ui.button(`Open ${esc(exact.id)}`, { href: `/app/accounts/deals/${exact.id}` }) })
        : ref ? emptyCard({ icon: 'search-x', title: 'No deal matches', text: `Nothing in this list matches “${esc(ref)}”. Check the reference, or choose “All”.` })
          : emptyCard({ title: QEMPTY[filter][0], text: QEMPTY[filter][1] });
      const body = r.list.length ? (isGa ? goAheadTable(r.list) : queueTable(r.list)) : empty;
      return ui.page(listHeader('check', 'To check', 'Bookings, receipts and hotel go-aheads waiting for Accounts.')
        + sectionTabs('check', '/app/accounts') + bar + takeFlash('tocheck') + body);
    },
  });

  /* =====================================================================
     Accounts view of a Deal  ·  #/app/accounts/deals/:id
     ===================================================================== */
  function nextOf(d) {
    const waiting = receiptsOf(d.id).filter((r) => r.status === 'recorded').length;
    const b = A.billing[d.id];
    if (waiting > 0) return { text: 'another Accounts person verifies the receipt', tab: 'receipts', label: waiting === 1 ? 'Open the receipt to verify' : 'Open the receipts to verify' };
    if (d.submittedAt && (!b || b.status !== 'verified')) return { text: 'check the billing details', tab: 'review', label: 'Check billing details' };
    if (d.accountsReview === 'waiting') return { text: 'approve or return the booking', tab: 'review', label: 'Review the booking' };
    if (d.accountsReview === 'returned') return { text: 'Sales fixes the returned booking and sends it again', tab: null, label: null };
    const ga = hotelsOf(d.id).filter((s) => s.goAhead === 'waiting').length;
    if (d.accountsReview === 'approved' && ga > 0) return { text: ga === 1 ? 'give the go-ahead for the hotel' : `give the go-ahead for ${ga} hotels`, tab: 'review', label: 'Give the go-ahead' };
    return { text: 'Nothing waiting.', tab: null, label: null, nothing: true };
  }

  /* ---------- Money tab ---------- */
  function moneyFigures(m) {
    return `<dl class="fin-money" aria-labelledby="fin-money-heading"><div class="fin-money-item is-available"><dt>Available customer funds</dt><dd>${inr(m.available)}</dd><dd class="fin-money-hint">Verified receipts and cleared cheques.</dd></div><div class="fin-money-item is-waiting"><dt>Awaiting verification</dt><dd>${inr(m.waiting)}</dd><dd class="fin-money-hint">Recorded, not checked yet. Not available.</dd></div><div class="fin-money-item is-cheque"><dt>Cheques awaiting clearance</dt><dd>${inr(m.cheques)}</dd><dd class="fin-money-hint">Not available until the bank clears them.</dd></div></dl>`;
  }
  const CLAIM_STATUS = {
    reported: ['warning', 'Reported by Sales: record or link the receipt'], recorded: ['info', 'Receipt recorded, awaiting verification'], verified: ['success', 'Verified'],
    pending_clearance: ['info', 'Cheque awaiting bank clearance'], cleared: ['success', 'Cleared'], bounced: ['danger', 'Cheque not paid'], stopped: ['danger', 'Cheque not paid'], cancelled: ['danger', 'Cheque not paid'],
    rejected: ['danger', 'Receipt rejected'], reversed: ['danger', 'Receipt reversed'], not_received: ['danger', 'Money not found'], withdrawn: ['neutral', 'Withdrawn by Sales'],
  };
  function claimDisplay(c) {
    if (c.status === 'reported') return 'reported';
    if (c.status === 'not_received') return 'not_received';
    const r = D.receipts.find((x) => x.id === c.receipt);
    return r ? rstat(r) : 'recorded';
  }
  const claimBadge = (c) => { const [tone, text] = CLAIM_STATUS[claimDisplay(c)]; return ui.badge(text, tone, { wrap: true, sr: 'Claim status: ' }); };
  const intoLabel = (id) => { const d = destOf(id); if (!d) return null; const v = currentVer(d) || d.versions[0]; return d.kind === 'bank' ? `${v.bankName} •••• ${v.masked.slice(-4)}` : `${v.payee} ${v.masked}`; };
  function claimArticle(c, d) {
    const r = D.receipts.find((x) => x.id === c.receipt);
    const rows = [
      { label: 'Paid on, by', value: `${fdate(c.date)} · ${esc(c.payer || TN.customer(d.customer).name)}` },
      c.ref ? { label: 'Reference', value: esc(c.ref) } : null,
      c.into ? { label: 'Into company account', value: esc(intoLabel(c.into)) } : null,
      { label: 'Reported', value: `${esc(pname(c.by))} · ${fdate(c.reportedAt || c.date)} · booking version ${A.review[d.id] ? A.review[d.id].version : 1}` },
      c.note ? { label: 'Note from Sales', value: esc(c.note) } : null,
      r ? { label: 'Receipt', value: `${esc(r.id)} · ${c.recordedFromClaim ? 'recorded from this claim' : 'existing receipt linked'} by ${esc(pname(c.linkedBy || r.recordedBy))}${c.mismatchReason ? ` · reason: ${esc(c.mismatchReason)}` : ''}` } : null,
      c.status === 'not_received' ? { label: 'Money not found', value: `${esc(c.notFoundReason)} · ${esc(pname(c.notFoundBy))}` } : null,
    ];
    let actions = '';
    if (c.status === 'reported') {
      const own = c.by === me();
      if (own) actions = '<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>You reported this payment or you sell this deal, so another Accounts person must handle it.</li></ul>';
      else {
        const linkable = receiptsOf(d.id).filter((x) => !D.paymentReports.some((o) => o.receipt === x.id) && !['rejected', 'reversed'].includes(x.status));
        actions = `<div class="flex flex-wrap gap-2" role="group" aria-label="What to do with this claim"><button type="button" class="${BTN()}" data-slot="button" aria-expanded="false" data-act="acct-claim-panel" data-panel="record" data-id="${c.id}">Record receipt from this claim</button><button type="button" class="${BTN()}" data-slot="button" aria-expanded="false" data-act="acct-claim-panel" data-panel="link" data-id="${c.id}">Link an existing receipt</button><button type="button" class="${BTN('ghost')}" data-slot="button" aria-expanded="false" data-act="acct-claim-panel" data-panel="notfound" data-id="${c.id}">Money not found</button></div>`
          + `<div class="rounded-control border border-line bg-card px-3.5 py-3" data-claim-panel="record" hidden>${receiptForm(d, { claim: c })}</div>`
          + `<form data-act="acct-claim-link" data-id="${c.id}" noValidate="" aria-label="Link an existing receipt to this claim" class="flex flex-col gap-3 rounded-control border border-line bg-card px-3.5 py-3" data-claim-panel="link" hidden><div data-result></div>${linkable.length ? ui.field({ id: `claim-${c.id}-receipt`, label: 'Receipt on this deal', select: { name: 'receiptId', options: linkable.map((x) => ({ value: x.id, label: `${x.id} · ${inr(x.amount)} · ${x.mode}${x.ref ? ' · ' + x.ref : ''}` })) } }) : '<p class="m-0 text-quiet">No receipt on this deal can be linked. Record the receipt from this claim instead.</p>'}${ui.field({ id: `claim-${c.id}-link-reason`, label: 'Reason for the difference', optional: true, hint: 'Only needed when the receipt differs from the claim.', textarea: { name: 'mismatchReason', rows: 2, attrs: { maxLength: 500 } } })}<div><button type="submit" class="${BTN_LG_PRIMARY_WRAP}" data-slot="button"${linkable.length ? '' : ' disabled=""'}>Link this receipt</button></div></form>`
          + `<form data-act="acct-claim-notfound" data-id="${c.id}" noValidate="" aria-label="Money not found for this claim" class="flex flex-col gap-3 rounded-control border border-line bg-card px-3.5 py-3" data-claim-panel="notfound" hidden><div data-result></div>${areaField(`claim-${c.id}-nf-reason`, 'reason', 'What did you check?', 'Sales will read this reason. 10 to 500 characters.')}<div><button type="submit" class="${BTN_LG_DANGER_WRAP}" data-slot="button">Mark money not found</button></div></form>`;
      }
    }
    return `<li id="claim-${c.id}" class="m-0"><article aria-label="Claim of ${inr(c.amount)} reported ${fdate(c.reportedAt || c.date)}" class="flex flex-col gap-3 rounded-control border border-line bg-canvas px-4 py-3.5"><div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-base font-semibold text-ink tabular-nums">${inr(c.amount)} · ${esc(c.mode)}</p>${claimBadge(c)}</div>${ui.summaryList(rows)}${actions}</article></li>`;
  }
  function claimsSection(d) {
    const list = D.paymentReports.filter((c) => c.deal === d.id);
    const reported = list.filter((c) => c.status === 'reported').reduce((t, c) => t + c.amount, 0);
    return `<section aria-labelledby="fin-claims-heading" class="rounded-card border border-line bg-card px-4.5 py-4 font-sans text-base text-copy shadow-card"><div class="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 id="fin-claims-heading" class="m-0 text-lg font-semibold text-ink">Reported payments</h2><span class="text-sm text-quiet">Reported by Sales (not money): <span class="font-semibold text-ink tabular-nums">${inr(reported)}</span></span></div>${takeFlash('claims-' + d.id)}<p class="m-0 mb-4 text-sm text-quiet">Not money until a receipt is recorded and checked by a second Accounts person. Record the real receipt from it, or link a receipt already recorded.</p>${list.length ? `<ol class="m-0 flex list-none flex-col gap-4 p-0" aria-label="Claims, newest first">${list.map((c) => claimArticle(c, d)).join('')}</ol>` : '<p class="m-0 text-quiet">No payments reported by Sales for this deal.</p>'}</section>`;
  }
  TN.act('acct-claim-panel', (el) => {
    const art = el.closest('article');
    const open = el.getAttribute('aria-expanded') !== 'true';
    art.querySelectorAll('[data-act="acct-claim-panel"]').forEach((b) => { b.setAttribute('aria-expanded', 'false'); if (b.className.includes('bg-brand-strong')) b.className = BTN(b.dataset.panel === 'notfound' ? 'ghost' : 'secondary'); });
    art.querySelectorAll('[data-claim-panel]').forEach((p) => (p.hidden = true));
    if (open) {
      el.setAttribute('aria-expanded', 'true');
      if (el.dataset.panel === 'record') el.className = BTN('primary');
      const p = art.querySelector(`[data-claim-panel="${el.dataset.panel}"]`);
      p.hidden = false;
      const f = p.querySelector('input:not([type=hidden]):not([type=radio]), select, textarea'); if (f) f.focus();
    }
  });
  TN.act('acct-claim-link', (form) => {
    const c = D.paymentReports.find((x) => x.id === form.dataset.id);
    const fd = new FormData(form);
    const r = D.receipts.find((x) => x.id === fd.get('receiptId'));
    if (!r) return refuseB11(form.querySelector('[data-result]'), 'Choose a receipt on this deal that is not linked to another claim.');
    const reason = String(fd.get('mismatchReason') || '').trim();
    if ((r.amount !== c.amount || r.mode !== c.mode) && !text10(reason)) return refuseB11(form.querySelector('[data-result]'), 'The receipt differs from the claim (amount or mode): write 10 to 500 characters about the difference.');
    Object.assign(c, { status: 'linked', receipt: r.id, linkedBy: me(), mismatchReason: reason || null });
    flash('claims-' + c.deal, ui.notice('<p>Linked to the existing receipt. No new money record was created.</p>', { tone: 'success', role: 'status', cls: 'mb-4' }));
    notify(['sales'], `Accounts linked your reported payment of ${inr(c.amount)} on ${c.deal} to receipt ${r.id}.`, { deal: c.deal });
    TN.refresh();
  });
  TN.act('acct-claim-notfound', (form) => {
    const c = D.paymentReports.find((x) => x.id === form.dataset.id);
    const reason = String(new FormData(form).get('reason') || '').trim();
    if (!text10(reason)) { const t = form.querySelector('textarea'); t.setAttribute('aria-invalid', 'true'); t.focus(); return refuseB11(form.querySelector('[data-result]'), 'Write 10 to 500 characters.'); }
    Object.assign(c, { status: 'not_received', notFoundReason: reason, notFoundBy: me() });
    flash('claims-' + c.deal, ui.notice('<p>Claim marked “money not found”. Sales sees this status and your reason.</p>', { tone: 'success', role: 'status', cls: 'mb-4' }));
    notify(['sales'], `Accounts did not find the ${inr(c.amount)} payment you reported on ${c.deal}. Open the Deal to read why.`, { deal: c.deal });
    TN.refresh();
  });

  /* ---------- Review tab ---------- */
  const check = (ok, text, detail) => { const cls = ok === null ? 'check-info' : ok ? 'check-ok' : 'check-missing'; const g = ok === null ? '•' : ok ? '✓' : '✕'; const w = ok === null ? 'Information' : ok ? 'Done' : 'Not done'; return `<li class="${cls}"><span class="status-glyph" aria-hidden="true">${g}</span><span><span class="visually-hidden">${w}: </span>${text}${detail ? `<span class="fin-sub">${detail}</span>` : ''}</span></li>`; };
  function readiness(d) {
    const b = A.billing[d.id];
    const rv = A.review[d.id];
    const hotels = hotelsOf(d.id);
    const waitingGa = hotels.filter((s) => s.goAhead !== 'given').length;
    return `<section class="fin-card" aria-labelledby="fin-ready"><h2 id="fin-ready">Readiness checklist</h2><ul class="checklist fin-checklist">${check(!!d.submittedAt, d.submittedAt ? `Booking confirmed (version ${rv ? rv.version : 1})` : 'No confirmed booking yet', d.submittedAt ? '' : 'Receipts can still be recorded without a booking.')}${check(b && b.status === 'verified', b && b.status === 'verified' ? 'Billing details checked' : b ? 'Billing details saved, not checked yet' : 'Billing details not entered', !b ? 'Enter the customer billing details below.' : b.status === 'draft' ? 'Saved; another Accounts check is needed.' : '')}${check(d.submittedAt ? d.accountsReview === 'approved' : null, d.submittedAt ? `Review: ${REVIEW[d.accountsReview][2]}` : 'Review: nothing to review without a confirmed booking')}${hotels.length ? check(waitingGa === 0, waitingGa === 0 ? `Hotel go-ahead given (${TN.fmt.plural(hotels.length, 'hotel')})` : `Hotel go-ahead: ${waitingGa} of ${TN.fmt.plural(hotels.length, 'hotel')} still waiting`) : ''}${check(null, 'Money: see the three separate figures on the Receipts tab')}</ul></section>`;
  }
  function planSection(d) {
    const plan = D.instalments.filter((i) => i.deal === d.id);
    const total = plan.reduce((t, i) => t + i.amount, 0);
    const matches = d.sellingPrice != null && total === d.sellingPrice;
    return `<section aria-labelledby="fin-plan-heading" class="flex flex-col gap-2"><h3 id="fin-plan-heading" class="m-0 flex flex-wrap items-center gap-2 text-base font-semibold text-ink">Payment plan${plan.length ? (matches ? ui.badge('Adds up to the selling total', 'success') : ui.badge('Does not add up to the selling total', 'danger', { icon: 'triangle-alert' })) : ''}</h3>${plan.length ? ui.summaryList([...plan.map((i, n) => ({ label: `${n + 1}. ${esc(i.label)} · due ${fdate(i.due)}`, value: inr(i.amount), numeric: true })), { label: 'Plan total', value: inr(total), total: true }]) : '<p class="m-0 text-quiet">No payment plan on this version.</p>'}<p class="m-0 text-sm text-quiet">Instalments are a plan, not money received. Approving the booking approves the plan as part of it.</p></section>`;
  }
  const SVC = { hotel: 'Hotel', transfer: 'Transfer', activity: 'Activity', flight: 'Flight', visa: 'Visa', passport: 'Passport', package: 'Package' };
  function approveDialog(d) {
    const rv = A.review[d.id] || { version: 1 };
    const hotels = hotelsOf(d.id).filter((s) => s.goAhead !== 'given');
    // Hotels in list order; the running company money decides which can go ahead on Accounts' word alone.
    let run = [];
    const items = hotels.map((s) => {
      const after = fundingFor(d.id, [...run, s.id]);
      const needsMgr = after > FUND_LIMIT && !managerFunding(d.id, s.id);
      if (!needsMgr) run.push(s.id);
      return `<li><label class="choice"><input type="checkbox" name="goAhead" value="${s.id}"${needsMgr ? ' disabled=""' : ' checked=""'}/> ${esc(s.title)} · ${TN.fmt.day(s.start)} to ${fdate(s.end)}${needsMgr ? ` · company money above ${inr(FUND_LIMIT)} needs the branch Manager first` : after > 0 ? ` · company-funded up to ${inr(after)}` : ''}</label></li>`;
    }).join('');
    const gaBlock = hotels.length ? `<fieldset class="group" aria-describedby="ga-help-${d.id}"><legend>Hotel go-ahead</legend><span id="ga-help-${d.id}" class="hint">Approving also gives Purchase the go-ahead to book these hotels with the supplier. Untick a hotel to hold it; say why below. Company-funded hotels need the go-ahead too.</span><ul class="fin-check-list">${items}</ul></fieldset><div class="field field-wide"><label for="ga-hold-${d.id}">Reason for holding a hotel (only if you untick one)</label><span id="ga-hold-${d.id}-hint" class="hint">10 to 500 characters. Sales sees it; Purchase sees only that the hotel is on hold.</span><textarea id="ga-hold-${d.id}" aria-describedby="ga-hold-${d.id}-hint" name="holdReason" maxLength="500" rows="2"></textarea></div>` : '';
    return `<dialog class="confirm-dialog" id="acct-approve-${d.id}" aria-labelledby="acct-approve-${d.id}-t" aria-describedby="acct-approve-${d.id}-d"><div class="confirm-dialog-body"><h2 id="acct-approve-${d.id}-t">Approve booking version ${rv.version}?</h2><div id="acct-approve-${d.id}-d"><ul><li>Records that you checked this booking version.</li><li>No money is posted and no document is issued.</li><li>The booking itself does not change. Saving billing details later puts the review back to waiting.</li></ul></div><form noValidate="" aria-label="Approve booking review" data-act="acct-approve" data-id="${d.id}">${status()}${gaBlock}<div class="dialog-actions"><button type="button" class="button secondary" data-act="acct-dialog-close">Cancel</button><button type="submit" class="button" aria-disabled="false">Yes, approve booking</button></div></form></div></dialog>`;
  }
  function bookingFacts(d) {
    if (!d.submittedAt) return '<section class="fin-card" aria-labelledby="fin-booking"><h2 id="fin-booking">Booking and review</h2><p class="m-0">This deal has no confirmed booking. There is nothing to review yet. You can still record receipts on the Receipts tab.</p></section>';
    const rv = A.review[d.id] || { version: 1, confirmedAt: d.submittedAt + ' 10:00', by: d.owner };
    const c = TN.customer(d.customer);
    const b = A.billing[d.id];
    const svcs = TN.servicesOf(d.id);
    const rows = [
      svcs.length ? { label: 'Services sold', value: svcs.map((s, i) => `${i + 1}. ${SVC[s.kind]}`).join(' · ') } : null,
      { label: 'Trip', value: `${esc(d.destination)} · ${fdate(d.start)} to ${fdate(d.end)} · ${d.adults} ${d.adults === 1 ? 'adult' : 'adults'}${d.children ? `, ${d.children} ${d.children === 1 ? 'child' : 'children'}` : ''}` },
      { label: 'Booking contact', value: `${esc(c.business ? c.contact : c.name)} · ${esc(c.phone)}<span class="block text-sm text-quiet">${b && b.type === 'business' ? `Business booking · paid by ${esc(b.name)}` : 'Individual booking'}</span>` },
    ];
    let actions;
    const bill = takeFlash('review-' + d.id);
    if (d.accountsReview !== 'approved') {
      const approve = !b || b.status !== 'verified'
        ? unavailable('Approve booking', 'Verify the customer billing details before approving the review.')
        : `<div class="fin-inline-form"><p id="review-approve-help-${d.id}" class="hint mb-0">Records your check. No money, no document, no change to the booking.</p><button type="button" class="button" aria-haspopup="dialog" aria-describedby="review-approve-help-${d.id}" data-act="acct-dialog-open" data-id="acct-approve-${d.id}">Approve booking</button>${approveDialog(d)}</div>`;
      const ret = d.accountsReview === 'returned' ? '' : `<details class="form-section work-form"><summary><span class="form-section-title">Return to Sales with a reason</span></summary><form noValidate="" aria-label="Return booking review" data-act="acct-return" data-id="${d.id}">${status()}<div class="note info" role="note"><p>Sales sees this reason on the booking in Book now. Write it so Sales knows exactly what to fix.</p></div>${lfield({ id: 'ret-' + d.id, label: 'Reason', name: 'reason', textarea: true, rows: 3, hint: '10 to 500 characters. Say what Sales must fix.', required: true, wide: true })}<button type="submit" class="button secondary" aria-disabled="false">Return review</button></form></details>`;
      actions = `<div class="fin-review-actions">${approve}${ret}</div>`;
    } else {
      actions = '<p class="m-0">Approved. Approval posts no money and issues no document. Saving billing details again puts the review back to waiting.</p>';
    }
    const returned = d.accountsReview === 'returned' && d.returnReason ? `<div class="note warn" role="note"><p><strong>Return reason:</strong> <span class="prewrap">${esc(d.returnReason)}</span></p><p>Sales sees return reasons in Book now. Only reasons recorded before Sales could see them stay inside Accounts; if this return is that old, tell Sales outside the CRM.</p></div>` : '';
    const again = d.accountsReview === 'waiting' && rv.reviewedAt && b && b.status !== 'verified' ? ui.notice('<p>The billing details were saved after the last review, so this review is waiting again. Check the billing details, then approve or return the booking.</p>', { tone: 'warning', role: 'status', title: 'Review waiting again', cls: 'mb-3' }) : '';
    return `<section class="fin-card" aria-labelledby="fin-booking"><div class="panel-header m-0"><h2 id="fin-booking" class="m-0">Booking and review</h2>${reviewPill(d)}</div>${bill}<p class="hint">Read-only. Accounts never changes the booking.</p><dl class="facts"><dt>Selling total</dt><dd><strong>${d.sellingPrice ? inr(d.sellingPrice) : 'Not recorded'}</strong><span class="fin-sub">What Sales agreed with the customer. Not an invoice and not money received.</span></dd><dt>Confirmed</dt><dd>${fdt(rv.confirmedAt)} by ${esc(pname(rv.by))} · version ${rv.version}</dd>${rv.reviewedAt ? `<dt>Last review</dt><dd>${REVIEW[d.accountsReview] ? REVIEW[d.accountsReview][2] : ''} · ${fdt(rv.reviewedAt)} by ${esc(pname(rv.reviewedBy))}</dd>` : ''}</dl><div class="mt-3 flex flex-col gap-4 font-sans text-base text-copy">${ui.summaryList(rows)}${planSection(d)}</div>${returned}${again}${actions}</section>`;
  }

  /* ---------- Hotel go-ahead (PENDING, Stage 3) ---------- */
  function goAheadCard(d) {
    const hotels = hotelsOf(d.id);
    if (!hotels.length) return '';
    const m = money(d.id);
    const items = hotels.map((s) => {
      const log = A.goAheadLog[s.id];
      const booked = ['supplier_confirmed', 'done'].includes(s.taskStatus);
      const after = fundingFor(d.id, [s.id]);
      const needsMgr = s.goAhead !== 'given' && after > FUND_LIMIT && !managerFunding(d.id, s.id);
      const facts = `<dt>Stay</dt><dd>${fdate(s.start)} to ${fdate(s.end)}</dd><dt>${s.cost != null ? 'Supplier cost' : 'Budget for Purchase'}</dt><dd>${inr(hotelCost(s))}${s.cost != null ? '' : '<span class="fin-sub">Sales’ estimate. Purchase enters the real cost from the hotel’s offer.</span>'}</dd><dt>Company money</dt><dd>${after > 0 ? `${inr(after)} for this deal if this hotel is booked now<span class="fin-sub">Hotel cost booked above available customer funds (${inr(m.available)}). Accounts approves company funding up to ${inr(FUND_LIMIT)}; above that the branch Manager. See <a class="${LINK}" href="#/app/accounts/funding">Company funding</a>.</span>` : 'None. Available customer funds cover it.'}</dd>${log ? `<dt>${s.goAhead === 'given' ? 'Go-ahead' : 'On hold'}</dt><dd>${fdt(log.at)} by ${esc(pname(log.by))}${log.reason ? `<span class="fin-sub prewrap">Reason: ${esc(log.reason)}</span>` : ''}</dd>` : ''}${booked ? `<dt>Purchase</dt><dd>Booked with the hotel${s.confirmationNo ? ` · confirmation ${esc(s.confirmationNo)}` : ''}</dd>` : ''}`;
      let act;
      if (booked) act = noFurther('hotel');
      else if (d.accountsReview !== 'approved') act = `<div class="fin-actions" role="group" aria-label="Go-ahead for ${esc(s.title)}">${unavailable('Give go-ahead', d.accountsReview === 'returned' ? 'The booking is back with Sales. The go-ahead waits until Sales fixes it and Accounts approves it.' : 'Approve the booking first. Approving gives the go-ahead for its hotels at the same time.')}</div>`;
      else if (s.goAhead === 'given') act = `<div class="fin-actions" role="group" aria-label="Go-ahead for ${esc(s.title)}">${holdForm(s)}</div>`;
      else act = `<div class="fin-actions" role="group" aria-label="Go-ahead for ${esc(s.title)}">${needsMgr ? unavailable('Give go-ahead', `Company money for this deal would be ${inr(after)}, above ${inr(FUND_LIMIT)}. The branch Manager must approve the company funding first.`) : `<form noValidate="" class="fin-inline-form" aria-label="Give go-ahead for ${esc(s.title)}" data-act="acct-goahead" data-id="${s.id}"><p id="ga-give-${s.id}" class="hint mb-0">Purchase may then book this hotel with the supplier. It does not book the hotel, pay the supplier or message anyone.</p><button type="submit" class="button" aria-disabled="false" aria-describedby="ga-give-${s.id}">Give go-ahead<span class="visually-hidden"> for ${esc(s.title)}</span></button></form>`}${s.goAhead === 'refused' ? '' : holdForm(s)}</div>`;
      return `<li class="fin-receipt" aria-labelledby="ga-${s.id}"><div class="fin-receipt-head"><div><h3 id="ga-${s.id}" class="m-0">${esc(s.title)}</h3><p class="offer-meta">${esc(s.detail)}</p></div><p class="fin-receipt-amount m-0">${inr(hotelCost(s))}</p></div><p class="m-0 button-row">${gaPill(s)}</p><dl class="facts fin-receipt-facts">${facts}</dl>${act}</li>`;
    }).join('');
    return `<section class="fin-card" aria-labelledby="fin-goahead"><div class="panel-header m-0"><h2 id="fin-goahead" class="m-0">Hotel go-ahead</h2>${hotels.every((s) => s.goAhead === 'given') ? pill('ok', '●', 'Go-ahead:', 'All hotels') : pill('info', '◐', 'Go-ahead:', `${hotels.filter((s) => s.goAhead !== 'given').length} waiting`)}</div>${takeFlash('ga-' + d.id)}<p class="hint">Purchase books a hotel with the supplier only after Accounts gives the go-ahead, including hotels the company pays for before the customer’s money arrives. Purchase sees only “waiting”, “go-ahead given” or “on hold”, never prices or your notes.</p><ol class="fin-receipt-list" aria-label="Hotels on this booking">${items}</ol></section>`;
  }
  function holdForm(s) {
    return `<details class="form-section work-form fin-action-form"><summary><span class="form-section-title">Hold<span class="visually-hidden"> ${esc(s.title)}</span></span></summary><form noValidate="" aria-label="Hold the go-ahead for ${esc(s.title)}" data-act="acct-hold" data-id="${s.id}">${status()}<p class="hint">Purchase keeps preparing offers but must not book this hotel. Sales sees your reason.</p>${lfield({ id: 'hold-' + s.id, label: 'Reason', name: 'reason', textarea: true, hint: '10 to 500 characters.', required: true, wide: true })}<button type="submit" class="button secondary" aria-disabled="false">Hold go-ahead</button></form></details>`;
  }
  function giveGoAhead(s, d) {
    const before = fundingFor(d.id);
    D.services[s.id].goAhead = 'given';
    A.goAheadLog[s.id] = { at: nowStamp(), by: me() };
    const after = fundingFor(d.id);
    if (after > before && D.funding) D.funding.unshift({ id: 'F-26-0' + (10 + (++uid)), deal: d.id, service: s.id, amount: after - before, reason: 'Hotel go-ahead given before enough customer money was verified.', requestedBy: me(), at: TN.TODAY, status: 'approved', approvedBy: me(), recoverFrom: 'Next customer receipt on this Deal' });
    return after > before ? after - before : 0;
  }
  const onList = () => TN.path().split('?')[0] === '/app/accounts';
  TN.act('acct-goahead', (f) => {
    if (goAheadBlock({ id: f.dataset.id, ...D.services[f.dataset.id] }).why) return TN.toast('Not allowed', 'danger', goAheadBlock({ id: f.dataset.id, ...D.services[f.dataset.id] }).why);
    const s = { id: f.dataset.id, ...D.services[f.dataset.id] };
    const d = TN.deal(s.deal);
    const funded = giveGoAhead(s, d);
    notify(['purchase'], `Accounts gave the go-ahead for ${s.title} (${d.id}). You may book it with the hotel.`, { deal: d.id });
    flash(onList() ? 'tocheck' : 'ga-' + d.id, doneMsg(`Go-ahead given for ${esc(s.title)}. Purchase may now book it with the hotel.${funded ? ` Company funding of ${inr(funded)} recorded with your approval.` : ''}`));
    settle();
  });
  TN.act('acct-hold', (f) => {
    const reason = String(new FormData(f).get('reason') || '').trim();
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    const s = D.services[f.dataset.id];
    const d = TN.deal(s.deal);
    s.goAhead = 'refused';
    A.goAheadLog[f.dataset.id] = { at: nowStamp(), by: me(), reason };
    notify(['purchase'], `Accounts put the go-ahead for ${s.title} (${d.id}) on hold. Keep preparing offers; do not book it with the hotel yet.`, { deal: d.id });
    notify(['sales'], `Accounts put the hotel ${s.title} on ${d.id} on hold: ${reason}`, { deal: d.id });
    flash(onList() ? 'tocheck' : 'ga-' + d.id, doneMsg(`${esc(s.title)} is on hold. Purchase sees “on hold” only; Sales sees your reason.`));
    settle();
  });

  /* ---------- Approve / return the booking review ---------- */
  TN.act('acct-dialog-open', (el) => { const dlg = document.getElementById(el.dataset.id); if (dlg && dlg.showModal) dlg.showModal(); });
  TN.act('acct-dialog-close', (el) => { const dlg = el.closest('dialog'); if (dlg) dlg.close(); });
  TN.act('acct-approve', (f) => {
    const d = TN.deal(f.dataset.id);
    const fd = new FormData(f);
    const ticked = fd.getAll('goAhead');
    const waiting = hotelsOf(d.id).filter((s) => s.goAhead !== 'given');
    const held = waiting.filter((s) => !ticked.includes(s.id) && !f.querySelector(`input[value="${s.id}"]`).disabled);
    const reason = String(fd.get('holdReason') || '').trim();
    if (held.length && !text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['holdReason', 'You unticked a hotel: write why in 10 to 500 characters.']]);
    const rv = A.review[d.id] || (A.review[d.id] = { version: 1, confirmedAt: d.submittedAt + ' 10:00', by: d.owner });
    Object.assign(rv, { reviewedAt: nowStamp(), reviewedBy: me() });
    d.accountsReview = 'approved';
    d.bookingState = 'being_arranged';
    let funded = 0;
    waiting.forEach((s) => {
      if (ticked.includes(s.id)) funded += giveGoAhead(s, d);
      else if (held.includes(s)) { D.services[s.id].goAhead = 'refused'; A.goAheadLog[s.id] = { at: nowStamp(), by: me(), reason }; }
    });
    const given = waiting.filter((s) => ticked.includes(s.id));
    notify(['sales'], `Accounts approved booking ${d.id}.${held.length ? ` On hold: ${held.map((s) => s.title).join(', ')} (${reason}).` : ''}`, { deal: d.id });
    if (given.length) notify(['purchase'], `Accounts approved ${d.id} and gave the go-ahead for ${given.map((s) => s.title).join(', ')}. You may book ${given.length === 1 ? 'it' : 'them'} with the hotel.`, { deal: d.id });
    if (held.length) notify(['purchase'], `On ${d.id}, Accounts put ${held.map((s) => s.title).join(', ')} on hold. Keep preparing offers; do not book ${held.length === 1 ? 'it' : 'them'} yet.`, { deal: d.id });
    f.closest('dialog').close();
    flash('review-' + d.id, doneMsg(`Booking review approved. No money was posted and no document was issued.${given.length ? ` Go-ahead given for ${TN.fmt.plural(given.length, 'hotel')}.` : ''}${held.length ? ` ${TN.fmt.plural(held.length, 'hotel')} on hold.` : ''}${funded ? ` Company funding of ${inr(funded)} recorded with your approval.` : ''}`));
    TN.refresh();
  });
  TN.act('acct-return', (f) => {
    const d = TN.deal(f.dataset.id);
    const reason = String(new FormData(f).get('reason') || '').trim();
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    const rv = A.review[d.id] || (A.review[d.id] = { version: 1, confirmedAt: d.submittedAt + ' 10:00', by: d.owner });
    Object.assign(rv, { reviewedAt: nowStamp(), reviewedBy: me() });
    Object.assign(d, { accountsReview: 'returned', bookingState: 'returned', returnReason: reason });
    notify(['sales', 'manager'], `Accounts returned booking ${d.id}: ${reason}`, { deal: d.id });
    flash('review-' + d.id, doneMsg('Review returned. Sales sees the reason in Book now.'));
    TN.refresh();
  });

  /* ---------- Billing (Bill To) ---------- */
  function billingSection(d) {
    const b = A.billing[d.id];
    const biz = b && b.type === 'business';
    const facts = b ? `<dl class="facts"><dt>Bill To type</dt><dd>${biz ? 'Business' : 'Personal'}</dd><dt>${biz ? 'Company name' : 'Billing name'}</dt><dd>${esc(b.name)}</dd>${biz ? `<dt>Contact name</dt><dd>${esc(b.contact || 'Not given')}</dd>` : ''}<dt>Phone · Email</dt><dd>${esc([b.phone, b.email].filter(Boolean).join(' · ') || 'Not given')}</dd><dt>Address</dt><dd>${esc(b.a1)}, ${esc(b.city)} ${esc(b.pin)} (state code ${esc(b.state)})</dd>${biz ? `<dt>GST registration</dt><dd>${b.gstStatus === 'registered' ? 'GST registered' : 'Not chosen yet'}</dd>` : ''}<dt>GSTIN</dt><dd>${esc(b.gstin || 'None given')}</dd><dt>Last saved</dt><dd>${fdt(b.savedAt)} by ${esc(pname(b.savedBy))}</dd>${b.verifiedAt ? `<dt>Verified</dt><dd>${fdt(b.verifiedAt)} by ${esc(pname(b.verifiedBy))}</dd>` : ''}</dl>` : '<p>No billing details yet.</p>';
    const verify = b && b.status === 'draft'
      ? (b.savedBy === me() ? unavailable('Check billing details', 'Another Accounts person must do this step. You cannot approve or verify your own work or your own deal.') : `<form noValidate="" aria-label="Check billing details" class="fin-inline-form" data-act="acct-billing-verify" data-id="${d.id}"><p id="billing-verify-help-${d.id}" class="hint mb-0">Confirms they match the customer’s documents. Approves no money.</p><button type="submit" class="button" aria-disabled="false" aria-describedby="billing-verify-help-${d.id}">Check billing details</button>${status()}</form>`)
      : '';
    const v = b || {};
    const form = `<details class="form-section work-form"${b ? '' : ' open=""'}><summary><span class="form-section-title">${b ? 'Edit billing details' : 'Enter billing details'}</span></summary><form noValidate="" aria-label="Customer billing details" data-act="acct-billing-save" data-id="${d.id}">${status()}<div class="form-grid">${lfield({ id: 'bn-' + d.id, label: 'Billing name', name: 'billingName', value: v.name, max: 200, required: true, wide: true })}${lfield({ id: 'ba1-' + d.id, label: 'Address line 1', name: 'addressLine1', value: v.a1, max: 200, required: true })}${lfield({ id: 'ba2-' + d.id, label: 'Address line 2 (optional)', name: 'addressLine2', value: '', max: 200 })}${lfield({ id: 'bc-' + d.id, label: 'City', name: 'city', value: v.city, max: 120, required: true })}${lfield({ id: 'bs-' + d.id, label: 'State code', name: 'stateCode', value: v.state, max: 2, inputMode: 'numeric', hint: 'Two digits, 01 to 38, or 97 for other territory.', required: true })}${lfield({ id: 'bp-' + d.id, label: 'PIN code', name: 'postalCode', value: v.pin, max: 6, inputMode: 'numeric', required: true })}${lfield({ id: 'bg-' + d.id, label: 'GSTIN (optional)', name: 'gstin', value: v.gstin || '', max: 15, caps: true, hint: 'Its first two digits must match the state code. The CRM checks the format only.' })}</div><p id="billing-save-help-${d.id}" class="hint">Saving keeps the details as not checked. If Accounts had already approved the booking review, saving puts the review back to waiting.</p><button type="submit" class="button secondary" aria-disabled="false" aria-describedby="billing-save-help-${d.id}">Save billing details</button></form></details>`;
    return `<section class="fin-card" aria-labelledby="fin-billing"><div class="panel-header m-0"><h2 id="fin-billing" class="m-0">Customer billing details</h2>${billingPill(b)}</div>${takeFlash('billing-' + d.id)}<p class="hint">Sales proposes these in Book now from what the customer gave them. Accounts checks them against the customer’s documents, edits them if needed, then verifies them. The CRM never fills them in from Bitrix.</p>${facts}${verify}${form}</section>`;
  }
  TN.act('acct-billing-verify', (f) => {
    const b = A.billing[f.dataset.id];
    if (b.savedBy === me()) return refuse(f, 'Another Accounts person must do this step. You cannot approve or verify your own work or your own deal.');
    Object.assign(b, { status: 'verified', verifiedAt: nowStamp(), verifiedBy: me() });
    flash('billing-' + f.dataset.id, doneMsg('Billing details checked.'));
    TN.refresh();
  });
  TN.act('acct-billing-save', (f) => {
    const fd = new FormData(f);
    const g = (k) => String(fd.get(k) || '').trim();
    const bad = [];
    if (!g('billingName')) bad.push(['billingName', 'Enter the billing name.']);
    if (!g('addressLine1')) bad.push(['addressLine1', 'Enter the address.']);
    if (!g('city')) bad.push(['city', 'Enter the city.']);
    if (!/^(0[1-9]|[12]\d|3[0-8]|97)$/.test(g('stateCode'))) bad.push(['stateCode', 'Two digits, 01 to 38, or 97.']);
    if (!/^\d{6}$/.test(g('postalCode'))) bad.push(['postalCode', 'Six digits.']);
    const gst = g('gstin').toUpperCase();
    if (gst && (!/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gst) || gst.slice(0, 2) !== g('stateCode'))) bad.push(['gstin', 'Check the format. Its first two digits must match the state code.']);
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    const d = TN.deal(f.dataset.id);
    const b = A.billing[d.id] || (A.billing[d.id] = { type: 'personal' });
    Object.assign(b, { name: g('billingName'), a1: g('addressLine1') + (g('addressLine2') ? ', ' + g('addressLine2') : ''), city: g('city'), state: g('stateCode'), pin: g('postalCode'), gstin: gst || null, status: 'draft', savedAt: nowStamp(), savedBy: me(), verifiedAt: null, verifiedBy: null });
    if (d.accountsReview === 'approved') {
      d.accountsReview = 'waiting'; d.bookingState = 'waiting_for_accounts';
      // A billing reset makes any unused go-ahead stale (Stage 3 contract §5.2).
      hotelsOf(d.id).filter((s) => s.goAhead === 'given' && !['supplier_confirmed', 'done'].includes(s.taskStatus)).forEach((s) => { D.services[s.id].goAhead = 'waiting'; delete A.goAheadLog[s.id]; notify(['purchase'], `The go-ahead for ${s.title} (${d.id}) was cancelled because the booking changed. Do not book it until Accounts gives it again.`, { deal: d.id }); });
    }
    flash('billing-' + d.id, doneMsg('Billing details saved, not checked yet. Another Accounts check is needed.'));
    TN.refresh();
  });

  /* ---------- Receipts tab ---------- */
  const RS = {
    recorded: ['info', '◐', 'Awaiting verification'], verified: ['ok', '●', 'Verified'], pending_clearance: ['info', '◔', 'Cheque awaiting bank clearance'], cleared: ['ok', '●', 'Cleared'],
    bounced: ['danger', '✕', 'Cheque bounced'], stopped: ['danger', '✕', 'Cheque stopped'], cancelled: ['neutral', '–', 'Cheque cancelled'], rejected: ['danger', '✕', 'Rejected'], reversed: ['warn', '↺', 'Reversed'],
  };
  const KIND_TEXT = { not_received: 'money not received', data_error: 'details entered wrongly', bank_return: 'returned by the bank' };
  const FILE_KIND = { bank_proof: 'Bank proof (statement line or credit advice)', cheque_image: 'Cheque image' };
  const FILE_HINT = 'PDF, JPG, PNG or WebP, up to 4 MB. Kept private; only Accounts can open it.';
  function receiptPill(r) {
    const s = rstat(r); const t = RS[s];
    const extra = s === 'rejected' || s === 'reversed' ? ` (${KIND_TEXT[r.kindOf] || 'money not received'})` : '';
    return pill(t[0], t[1], 'Receipt status:', t[2] + extra);
  }
  const fileList = (r, label = 'Proof files', described) => (r.files && r.files.length ? `<ul class="file-list fin-files" aria-label="${label}">${r.files.map((x) => `<li class="file-row is-stored"><span class="file-glyph" aria-hidden="true">✓</span><span><a class="file-name" href="#" data-act="acct-open-file"${described ? ` aria-describedby="${described}"` : ''}>${esc(x.name)}</a><span class="file-meta"> · ${FILE_KIND[x.kind] || 'Bank proof (statement line or credit advice)'} · Stored</span></span></li>`).join('')}</ul>` : '<p class="offer-meta">No proof uploaded.</p>');
  TN.act('acct-doc-preview', (el) => (TN.openDocument ? TN.openDocument(el.dataset.id) : TN.toast('The document preview is not available.', 'warning')));
  TN.act('acct-open-file', (el) => TN.toast(`Opening ${el.textContent}. The private link works for 60 seconds; the opening is recorded with your name.`, 'info'));
  function uploadForm(r) {
    const kinds = r.mode === 'Cheque' ? [{ value: 'cheque_image', label: FILE_KIND.cheque_image }, { value: 'bank_proof', label: FILE_KIND.bank_proof }] : [{ value: 'bank_proof', label: FILE_KIND.bank_proof }];
    return `<details class="form-section work-form fin-action-form"><summary><span class="form-section-title">Upload proof<span class="visually-hidden"> for ${r.id}</span></span></summary><form noValidate="" aria-label="Upload proof for ${r.id}" data-act="acct-upload" data-id="${r.id}">${status()}<div class="form-grid">${lfield({ id: 'upk-' + r.id, label: 'What is this file?', name: 'kind', options: kinds, value: r.mode === 'Cheque' && r.status === 'verified' ? 'bank_proof' : kinds[0].value })}<div class="field"><label for="upf-${r.id}">File</label><span id="upf-${r.id}-hint" class="hint">${FILE_HINT}</span><input id="upf-${r.id}" aria-describedby="upf-${r.id}-hint" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required="" name="file"/></div></div><button type="submit" class="button secondary" aria-disabled="false">Upload file</button></form></details>`;
  }
  const reasonDetails = (r, act, title, hint, kinds, button, fieldLabel = 'Reason', extraFields = '') => `<details class="form-section work-form fin-action-form"><summary><span class="form-section-title">${title}<span class="visually-hidden"> for ${r.id}</span></span></summary><form noValidate="" aria-label="${title} ${r.id}" data-act="${act}" data-id="${r.id}">${status()}<p class="hint">${hint}</p><div class="form-grid">${lfield({ id: act + '-k-' + r.id, label: 'What happened', name: 'kind', options: kinds, value: kinds[0].value, required: true })}${extraFields}</div>${lfield({ id: act + '-r-' + r.id, label: fieldLabel, name: 'reason', textarea: true, hint: '10 to 500 characters.', required: act !== 'acct-cheque-outcome', wide: true })}<button type="submit" class="button secondary" aria-disabled="false">${button}</button></form></details>`;
  function receiptActions(r) {
    const s = rstat(r);
    const mine = me();
    const parts = [];
    if (s === 'recorded') {
      if (r.recordedBy === mine) {
        parts.push(unavailable(`Reject receipt<span class="visually-hidden"> ${r.id}</span>`, 'You recorded this receipt. Another Accounts person must do this step.'));
      } else {
        parts.push(reasonDetails(r, 'acct-reject', 'Reject receipt', 'Nothing was posted for this receipt. A receipt rejected as “details entered wrongly” can be corrected with a new receipt.', [{ value: 'not_received', label: 'Money not received' }, { value: 'data_error', label: 'Details entered wrongly' }], 'Reject receipt'));
      }
    } else if (s === 'verified') {
      parts.push(r.verifiedBy === mine ? unavailable('Reverse receipt', 'You verified this receipt. Another Accounts person must reverse it.') : reasonDetails(r, 'acct-reverse', 'Reverse receipt', 'Reverses this receipt. The original stays in history. This is not a refund.', [{ value: 'bank_return', label: 'Returned by the bank' }, { value: 'not_received', label: 'Money not received' }, { value: 'data_error', label: 'Details entered wrongly' }], 'Reverse receipt'));
    } else if (s === 'pending_clearance') {
      parts.push(reasonDetails(r, 'acct-cheque-outcome', 'Record cheque not honoured', 'Bounced or stopped needs bank proof uploaded first. Nothing is posted. A bounced cheque can be re-presented.', [{ value: 'bounced', label: 'Bounced' }, { value: 'stopped', label: 'Payment stopped' }, { value: 'cancelled', label: 'Cancelled' }], 'Record outcome', 'Note (needed for a cancelled cheque)', `<div class="field"><label for="out-d-${r.id}">Date of the outcome</label><input id="out-d-${r.id}" type="date" required="" name="outcomeDate" value=""/></div>`));
    } else if (s === 'cleared') {
      parts.push(r.clearedBy === mine ? unavailable('Reverse receipt', 'You recorded the bank clearance. Another Accounts person must reverse it.') : reasonDetails(r, 'acct-reverse', 'Reverse receipt', 'Reverses this receipt. The original stays in history. This is not a refund.', [{ value: 'bank_return', label: 'Returned by the bank' }, { value: 'not_received', label: 'Money not received' }, { value: 'data_error', label: 'Details entered wrongly' }], 'Reverse receipt'));
    } else if (s === 'bounced') {
    }
    return parts.length ? `<div class="fin-actions" aria-label="More actions for ${r.id}" role="group">${parts.join('')}</div>` : '';
  }
  function receiptFacts(r) {
    const dst = r.dest ? destOf(r.dest) : null;
    const dv = dst ? dst.versions[0] : null;
    return `<dl class="facts fin-receipt-facts"><dt>Received</dt><dd>${fdate(r.date)} at Jodhpur${r.mode === 'Cash' && r.collector ? ` · collected by ${esc(pname(r.collector))}` : ''}</dd><dt>Payer</dt><dd>${esc(r.payer || '')}${r.pan ? ` · PAN ${esc(r.pan)}` : ''}${r.mobile ? ` · mobile ${esc(r.mobile)}` : ''}</dd>${r.mode === 'Bank transfer' || r.mode === 'UPI' ? `<dt>Reference</dt><dd class="fin-mono">${esc(String(r.ref || '').replace(/^(UTR|UPI) /, ''))}</dd>` : ''}${dst ? `<dt>Paid into</dt><dd>${esc(dst.label)} · ${dst.kind === 'bank' ? 'Bank account' : 'UPI ID'} · ${esc(maskedDest(dst, dv))} · version ${dv.no}<span class="fin-sub">As approved when this receipt was recorded. Later changes or retirement do not alter it.</span></dd>` : ''}${r.mode === 'Cheque' ? `<dt>Cheque</dt><dd>No. <span class="fin-mono">${esc(r.chequeNo || '—')}</span> · MICR <span class="fin-mono">${esc(r.micr || '—')}</span> · dated ${fdate(r.chequeDate)}${r.outcomeDate ? ` · outcome on ${fdate(r.outcomeDate)}` : ''}</dd>` : ''}<dt>Recorded</dt><dd>${fdt(r.recordedAt || r.date + ' 12:00')} by ${esc(pname(r.recordedBy))} · policy version ${A.policy.version}</dd>${r.verifiedBy ? `<dt>Verified</dt><dd>${fdt(r.verifiedAt || r.date + ' 16:00')} by ${esc(pname(r.verifiedBy))}</dd>` : ''}${r.reason ? `<dt>Reason</dt><dd class="prewrap">${esc(r.reason)}</dd>` : ''}</dl>`;
  }
  /** The one action on a receipt row (Verify when one waits). Other actions sit in the row's Details. */
  function receiptMain(r, helpId) {
    const s = rstat(r);
    const sr = `<span class="sr-only"> receipt ${r.id}</span>`;
    if (s === 'recorded') {
      if (r.recordedBy === me()) return blockedBtn(`Verify${sr}`, 'You recorded this receipt. Another Accounts person must do this step.');
      return `<form noValidate="" class="flex flex-col items-start gap-1" aria-label="Verify ${r.id}" data-act="acct-verify" data-id="${r.id}">${status()}<button type="submit" id="verify-${r.id}" class="${ui.buttonClass('secondary', 'sm')}" data-slot="button" aria-describedby="${helpId}">Verify${sr}</button></form>`;
    }
    if (s === 'pending_clearance') {
      const hasBank = (r.files || []).some((x) => x.kind === 'bank_proof');
      return hasBank ? `<form noValidate="" class="flex flex-col items-start gap-1" aria-label="Record cheque cleared ${r.id}" data-act="acct-cleared" data-id="${r.id}">${status()}<button type="submit" id="clear-${r.id}" class="${ui.buttonClass('secondary', 'sm')}" data-slot="button">Record cheque cleared${sr}</button></form>` : blockedBtn(`Record cheque cleared${sr}`, 'Upload the required proof first. Open Details to upload it.');
    }
    if (s === 'bounced') return `<form noValidate="" class="flex flex-col items-start gap-1" aria-label="Re-present cheque ${r.id}" data-act="acct-represent" data-id="${r.id}">${status()}<button type="submit" class="${ui.buttonClass('secondary', 'sm')}" data-slot="button">Re-present cheque${sr}</button></form>`;
    return '<span class="text-sm text-quiet">Nothing to do</span>';
  }
  const AWAIT = ['recorded', 'pending_clearance', 'bounced'];
  /** Receipts as rows: awaiting first, then newest. Details open on demand. */
  function receiptTable(d, helpId) {
    const list = receiptsOf(d.id).sort((a, b) => (AWAIT.includes(rstat(b)) ? 1 : 0) - (AWAIT.includes(rstat(a)) ? 1 : 0));
    if (!list.length) return emptyCard({ icon: 'receipt', title: 'No receipts yet', text: 'No receipts recorded for this deal yet.' });
    const rows = [];
    list.forEach((r) => {
      const s = rstat(r); const t = RS[s];
      const extra = s === 'rejected' || s === 'reversed' ? ` (${KIND_TEXT[r.kindOf] || 'money not received'})` : '';
      const who = r.verifiedBy ? `Verified by ${esc(pname(r.verifiedBy))}` : `Recorded by ${esc(pname(r.recordedBy))}`;
      rows.push({ attrs: { id: 'rcpt-' + r.id }, cells: [
        `<span class="font-semibold whitespace-nowrap text-ink">${esc(r.id)}</span> <span class="text-copy">· ${esc(r.mode)}</span>${detailToggle('r-' + r.id, 'for receipt ' + r.id)}`,
        `<span class="whitespace-nowrap">${fdate(r.date)}</span>`,
        inr(r.amount),
        st(t[2] + extra, t[0], who),
        r.files && r.files.length ? TN.fmt.plural(r.files.length, 'file') : '<span class="text-quiet">No proof</span>',
        receiptMain(r, helpId),
      ] });
      const up = AWAIT.includes(s) ? uploadForm(r) : '';
      rows.push(detailRow('r-' + r.id, 6, receiptFacts(r) + fileList(r) + up + receiptActions(r)));
    });
    return ui.table({ label: 'Customer receipts', top: true, columns: ['Receipt', 'Received', { label: 'Amount', numeric: true }, 'Status', 'Proof', 'Next step'], rows, caption: 'Awaiting receipts first, then newest.' });
  }
  TN.act('acct-record-open', (el) => {
    const d = TN.deal(el.dataset.id);
    TN.drawer({ wide: true, title: 'Record a receipt', description: `${esc(d.id)} · ${esc(d.title)}`, body: receiptForm(d) });
  });
  /** Record a receipt (also used from a reported payment). */
  function receiptForm(d, o = {}) {
    const c = o.claim;
    const p = c ? 'cl-' + c.id : 'rc-' + d.id;
    const mode = c ? MODE_KEY[c.mode] || 'bank_transfer' : 'bank_transfer';
    const bank = destOptions('bank'); const upi = destOptions('upi');
    const show = (modes) => ` data-modes="${modes}"${modes.split(' ').includes(mode) ? '' : ' hidden=""'}`;
    const destField = (kind, opts) => { const what = kind === 'bank' ? 'bank account' : 'UPI ID'; const sel = opts.length === 1 ? opts[0].value : ''; const hint = opts.length === 1 ? `Only one approved company ${what} is in use, so it is selected. Check it matches the customer’s payment proof.` : `Choose the approved company ${what} shown on the customer’s payment proof. Masked; only approved versions in use are listed.`; return opts.length ? lfield({ id: `${p}-dest-${kind}`, label: 'Company account the money was paid into', name: 'dest_' + kind, wide: true, hint, required: true, value: (c && c.into && opts.some((x) => x.value === c.into)) ? c.into : sel, options: [{ value: '', label: `Choose a company ${what}` }, ...opts], attrs: show(kind === 'bank' ? 'bank_transfer' : 'upi') }) : `<div class="note warn" role="note"${show(kind === 'bank' ? 'bank_transfer' : 'upi')}><p><strong>Company account the money was paid into: </strong>No approved company account is in use. Another Accounts person must approve one in Company accounts first.</p><p class="mb-0"><a href="#/app/accounts/destinations">Open Company accounts</a></p></div>`; };
    const modes = ['bank_transfer', 'upi', 'cash', 'cheque'].map((m) => `<label class="fin-segment-option${m === mode ? ' is-selected' : ''}"><input type="radio" name="mode" value="${m}"${m === mode ? ' checked=""' : ''} data-change="acct-rc-mode"/><span class="fin-segment-label">${MODE_LABEL[m]}</span><span class="fin-live is-live">Available</span></label>`).join('');
    const btnText = c ? 'Record receipt from this claim' : `Record ${mode === 'upi' ? 'UPI' : MODE_LABEL[mode].toLowerCase()} receipt`;
    return `<form noValidate="" aria-label="${c ? 'Record receipt from this claim' : 'Record a receipt'}" data-act="acct-record" data-deal="${d.id}"${c ? ` data-claim="${c.id}"` : ''}>${status()}<fieldset class="group fin-modes" aria-describedby="${p}-mode-help"><legend id="${p}-mode-legend">How did the customer pay?</legend><span id="${p}-mode-help" class="hint">Payment modes are switched on by the CRM team with the owner’s approval, after the CA confirms the rules.</span><div class="fin-segment">${modes}</div></fieldset><ul class="fin-limits" aria-label="Company limits for this receipt"><li>One receipt can be at most <strong>${inr(A.policy.receiptMax)}</strong>.</li><li${show('cash')}>Cash from one payer on one day, across all branches: at most <strong>${inr(A.policy.cashPayerDay)}</strong>.</li><li${show('cash')}>Cash for this trip in total: at most <strong>${inr(A.policy.cashTrip)}</strong>.</li><li>Policy version ${A.policy.version}.</li></ul><div class="form-grid">${lfield({ id: p + '-amt', label: 'Amount received (₹)', name: 'amountRupees', hint: 'Rupees, up to two decimals.', inputMode: 'decimal', required: true, value: c ? String(c.amount) : '' })}${lfield({ id: p + '-on', label: 'Date received', name: 'receivedOn', type: 'date', hint: 'Within the last 30 days (IST).', required: true, value: c ? c.date : '' })}${lfield({ id: p + '-br', label: 'Collecting branch', name: 'branchId', options: [{ value: 'jodhpur', label: 'Jodhpur' }], value: 'jodhpur', required: true })}${lfield({ id: p + '-col', label: 'Who collected the cash', name: 'collector', options: [{ value: '', label: 'Choose a person' }, ...['accounts', 'checker', 'sales', 'sales2'].map((k) => ({ value: k, label: pname(k) }))], value: '', required: true, attrs: show('cash') })}</div><fieldset class="group"><legend>Who paid</legend><span class="hint">Payer name plus at least one of PAN or mobile number.</span><div class="form-grid">${lfield({ id: p + '-pn', label: 'Payer name', name: 'payerName', max: 200, required: true, value: c ? c.payer : '' })}${lfield({ id: p + '-pan', label: 'Payer PAN', name: 'payerPan', max: 10, caps: true, hint: 'For example ABCDE1234F.' })}${lfield({ id: p + '-mob', label: 'Payer mobile', name: 'payerMobile', type: 'tel', inputMode: 'tel', max: 16, hint: '10 digits; +91 or a leading 0 is fine.' })}</div></fieldset>${lfield({ id: p + '-ref', label: mode === 'upi' ? 'UPI transaction reference' : 'Bank reference (UTR)', name: 'reference', max: 40, hint: '6 to 40 letters, digits, / or -. The same reference cannot be recorded twice.', required: true, value: c && c.ref ? c.ref.replace(/^(UTR|UPI) /, '') : '', attrs: show('bank_transfer upi') })}${destField('bank', bank)}${destField('upi', upi)}<fieldset class="group"${show('cheque')}><legend>Cheque details</legend><div class="form-grid">${lfield({ id: p + '-cq', label: 'Cheque number', name: 'chequeNumber', inputMode: 'numeric', max: 6, hint: '6 digits.', required: true })}${lfield({ id: p + '-micr', label: 'MICR code', name: 'micrCode', inputMode: 'numeric', max: 9, hint: '9 digits printed at the bottom of the cheque.', required: true })}${lfield({ id: p + '-cqd', label: 'Cheque date', name: 'chequeDate', type: 'date', hint: 'Within 90 days before or after today.', required: true })}</div><label class="choice"><input type="checkbox" name="accountPayee" value="true" required=""/> The cheque is crossed “Account payee”</label></fieldset>${d.submittedAt ? lfield({ id: p + '-bv', label: 'Link to booking', name: 'bookingVersionId', options: [{ value: 'v1', label: `Confirmed booking, version ${A.review[d.id] ? A.review[d.id].version : 1}` }, { value: '', label: 'Not linked to a booking' }], value: 'v1' }) : ''}${lfield({ id: p + '-note', label: 'Note (optional)', name: 'note', textarea: true, wide: true })}${c ? `<div class="field field-wide"><label for="${p}-mm">Reason for any difference from the claim (optional)</label><span id="${p}-mm-hint" class="hint">Needed only when the amount, mode, reference or cheque number differs from what Sales reported: 10 to 500 characters.</span><textarea id="${p}-mm" aria-describedby="${p}-mm-hint" name="mismatchReason" maxLength="500" rows="2"></textarea></div>` : ''}<p id="${p}-submit-help" class="hint">Another Accounts person must check it before it counts as money<span data-modes="cheque"${mode === 'cheque' ? '' : ' hidden=""'}>, and the bank must clear the cheque</span>.</p><button type="submit" class="button" aria-disabled="false" aria-describedby="${p}-submit-help" data-claimbtn="${c ? '1' : ''}">${btnText}</button></form>`;
  }
  TN.act('acct-rc-mode', (el) => {
    const f = el.form; const mode = el.value;
    f.querySelectorAll('.fin-segment-option').forEach((l) => l.classList.toggle('is-selected', l.contains(el)));
    f.querySelectorAll('[data-modes]').forEach((n) => { n.hidden = !n.dataset.modes.split(' ').includes(mode); });
    const refLabel = f.querySelector('[name="reference"]'); if (refLabel) { const lab = f.querySelector(`label[for="${refLabel.id}"]`); if (lab) lab.textContent = mode === 'upi' ? 'UPI transaction reference' : 'Bank reference (UTR)'; }
    const b = f.querySelector('button[type=submit]'); if (b && !b.dataset.claimbtn) b.textContent = `Record ${mode === 'upi' ? 'UPI' : MODE_LABEL[mode].toLowerCase()} receipt`;
  });
  const nextReceiptId = () => 'RC-26-' + String(Math.max(...D.receipts.map((r) => Number(r.id.slice(-4)))) + 1).padStart(4, '0');
  TN.act('acct-record', (f) => {
    const fd = new FormData(f);
    const g = (k) => String(fd.get(k) || '').trim();
    const d = TN.deal(f.dataset.deal);
    const mode = g('mode');
    const bad = [];
    const amount = Number(g('amountRupees').replace(/,/g, ''));
    if (!/^\d+(\.\d{1,2})?$/.test(g('amountRupees').replace(/,/g, '')) || amount <= 0) bad.push(['amountRupees', 'Enter the amount in rupees, up to two decimals.']);
    else if (amount > A.policy.receiptMax) bad.push(['amountRupees', `One receipt can be at most ${inr(A.policy.receiptMax)}.`]);
    const on = g('receivedOn'); const days = on ? TN.fmt.daysFrom(on) : null;
    if (!on || days > 0 || days < -30) bad.push(['receivedOn', 'Choose a date within the last 30 days.']);
    if (!g('payerName')) bad.push(['payerName', 'Enter the payer name.']);
    if (g('payerPan') && !/^[A-Z]{5}\d{4}[A-Z]$/i.test(g('payerPan'))) bad.push(['payerPan', 'PAN looks like ABCDE1234F.']);
    const mob = g('payerMobile').replace(/[\s-]/g, '').replace(/^(\+91|0)/, '');
    if (g('payerMobile') && !/^\d{10}$/.test(mob)) bad.push(['payerMobile', 'Enter 10 digits.']);
    if (!g('payerPan') && !g('payerMobile')) bad.push(['payerPan', 'Enter the payer PAN or mobile number.']);
    if (mode === 'bank_transfer' || mode === 'upi') {
      if (!/^[A-Za-z0-9/-]{6,40}$/.test(g('reference'))) bad.push(['reference', '6 to 40 letters, digits, / or -.']);
      if (!g(mode === 'upi' ? 'dest_upi' : 'dest_bank')) bad.push([mode === 'upi' ? 'dest_upi' : 'dest_bank', 'Choose the company account.']);
    }
    if (mode === 'cash' && !g('collector')) bad.push(['collector', 'Choose who collected the cash.']);
    if (mode === 'cheque') {
      if (!/^\d{6}$/.test(g('chequeNumber'))) bad.push(['chequeNumber', '6 digits.']);
      if (!/^\d{9}$/.test(g('micrCode'))) bad.push(['micrCode', '9 digits.']);
      const cd = g('chequeDate'); if (!cd || Math.abs(TN.fmt.daysFrom(cd)) > 90) bad.push(['chequeDate', 'Within 90 days before or after today.']);
      if (!fd.get('accountPayee')) bad.push(['accountPayee', 'The cheque must be crossed “Account payee”.']);
    }
    if (f.dataset.claim) {
      const c = D.paymentReports.find((x) => x.id === f.dataset.claim);
      const differs = amount !== c.amount || MODE_LABEL[mode] !== c.mode || (c.ref && g('reference') && c.ref.replace(/^(UTR|UPI) /, '') !== g('reference'));
      if (differs && !text10(g('mismatchReason'))) bad.push(['mismatchReason', 'The receipt differs from the claim: write 10 to 500 characters.']);
    }
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    const refFull = mode === 'bank_transfer' ? 'UTR ' + g('reference') : mode === 'upi' ? 'UPI ' + g('reference') : mode === 'cheque' ? `Cheque ${g('chequeNumber')}` : 'Cash at Jodhpur branch';
    if ((mode === 'bank_transfer' || mode === 'upi') && D.receipts.some((r) => String(r.ref || '').replace(/^(UTR|UPI) /, '').toUpperCase() === g('reference').toUpperCase())) return refuse(f, 'This bank, UPI or cheque reference is already recorded. Check the existing receipt before recording it again.', [['reference', '']]);
    if (mode === 'cash') {
      const sameDay = D.receipts.filter((r) => r.mode === 'Cash' && r.payer && r.payer.toLowerCase() === g('payerName').toLowerCase() && r.date === on && !['rejected', 'reversed'].includes(r.status)).reduce((t, r) => t + r.amount, 0);
      const trip = D.receipts.filter((r) => r.mode === 'Cash' && r.deal === d.id && !['rejected', 'reversed'].includes(r.status)).reduce((t, r) => t + r.amount, 0);
      if (sameDay + amount > A.policy.cashPayerDay || trip + amount > A.policy.cashTrip) return refuse(f, 'This cash amount is over the company cash limit for this payer or trip. Ask for a bank transfer, UPI or cheque instead.', [['amountRupees', '']]);
    }
    const id = nextReceiptId();
    const rec = { id, deal: d.id, mode: MODE_LABEL[mode], ref: refFull, amount, date: on, status: 'recorded', recordedBy: me(), verifiedBy: null, recordedAt: nowStamp(), payer: g('payerName'), files: [],
      to: mode === 'cash' ? 'Jodhpur branch cash' : mode === 'upi' ? 'holidaychacha@hdfcbank' : 'HDFC Bank current account ··4417' };
    if (g('payerPan')) rec.pan = 'XXXXX' + g('payerPan').toUpperCase().slice(5, 9) + g('payerPan').toUpperCase().slice(-1);
    if (mob) rec.mobile = 'XXXXXX' + mob.slice(-4);
    if (mode === 'bank_transfer') rec.dest = g('dest_bank');
    if (mode === 'upi') rec.dest = g('dest_upi');
    if (mode === 'cash') rec.collector = g('collector');
    if (mode === 'cheque') Object.assign(rec, { chequeNo: g('chequeNumber'), micr: g('micrCode'), chequeDate: g('chequeDate'), cheque: 'waiting_clearance', dest: 'dest-hdfc' });
    D.receipts.push(rec);
    if (f.dataset.claim) { const c = D.paymentReports.find((x) => x.id === f.dataset.claim); Object.assign(c, { status: 'linked', receipt: id, linkedBy: me(), recordedFromClaim: true, mismatchReason: g('mismatchReason') || null }); notify(['sales'], `Accounts recorded a receipt for your reported payment of ${inr(c.amount)} on ${d.id}. A second Accounts person checks it next.`, { deal: d.id }); }
    notify([otherRole()], `Receipt ${id} recorded by ${pname(me())} on ${d.id}: ${inr(amount)} by ${MODE_LABEL[mode].toLowerCase().replace('upi', 'UPI')}. A different person must verify it.`, { href: `#/app/accounts/deals/${d.id}?tab=receipts`, deal: d.id });
    flash('receipts-' + d.id, doneMsg(`Receipt ${id} recorded (internal number). Another Accounts person must verify it.`));
    if (f.dataset.claim) flash('claims-' + d.id, ui.notice(`<p>Receipt ${id} recorded from this claim. Another Accounts person must verify it.</p>`, { tone: 'success', role: 'status', cls: 'mb-4' }));
    settle();
  });
  const rcpt = (id) => D.receipts.find((r) => r.id === id);
  TN.act('acct-verify', (f) => {
    const r = rcpt(f.dataset.id);
    if (r.recordedBy === me()) return refuse(f, 'You recorded this receipt. Another Accounts person must do this step.');
    if (r.mode === 'Cheque' && !(r.files || []).some((x) => x.kind === 'cheque_image')) return refuse(f, 'Upload the required proof first.');
    Object.assign(r, { status: 'verified', verifiedBy: me(), verifiedAt: nowStamp() });
    if (r.mode === 'Cheque' && !r.cheque) r.cheque = 'waiting_clearance';
    notify(['sales'], `Receipt ${r.id} on ${r.deal} verified by Accounts: ${inr(r.amount)}.`, { deal: r.deal });
    flash('receipts-' + r.deal, doneMsg(r.mode === 'Cheque' ? 'Cheque verified. It now waits for bank clearance; nothing counts as received yet.' : 'Receipt verified.'));
    TN.refresh();
  });
  TN.act('acct-reject', (f) => {
    const r = rcpt(f.dataset.id); const fd = new FormData(f); const reason = String(fd.get('reason') || '').trim();
    if (r.recordedBy === me()) return refuse(f, 'You recorded this receipt. Another Accounts person must do this step.');
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    Object.assign(r, { status: 'rejected', kindOf: fd.get('kind'), reason, rejectedBy: me() });
    notify([r.recordedBy], `Receipt ${r.id} on ${r.deal} was rejected by ${pname(me())}: ${reason}`, { deal: r.deal, href: `#/app/accounts/deals/${r.deal}?tab=receipts` });
    flash('receipts-' + r.deal, doneMsg('Receipt rejected. It stays in the history.'));
    TN.refresh();
  });
  TN.act('acct-reverse', (f) => {
    const r = rcpt(f.dataset.id); const fd = new FormData(f); const reason = String(fd.get('reason') || '').trim();
    if (r.verifiedBy === me()) return refuse(f, 'You verified this receipt. Another Accounts person must reverse it.');
    if (r.clearedBy === me()) return refuse(f, 'You recorded the bank clearance. Another Accounts person must reverse it.');
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    Object.assign(r, { status: 'reversed', kindOf: fd.get('kind'), reason, reversedBy: me() });
    notify(['sales', otherRole()], `Receipt ${r.id} on ${r.deal} (${inr(r.amount)}) was reversed: ${reason}`, { deal: r.deal });
    flash('receipts-' + r.deal, doneMsg('Receipt reversed. The original and its reversal both stay in the history. No refund is made here.'));
    TN.refresh();
  });
  TN.act('acct-cleared', (f) => {
    const r = rcpt(f.dataset.id);
    if (!(r.files || []).some((x) => x.kind === 'bank_proof')) return refuse(f, 'Upload the required proof first.');
    Object.assign(r, { cheque: 'cleared', clearedBy: me(), outcomeDate: TN.TODAY });
    flash('receipts-' + r.deal, doneMsg('Cheque cleared. The money now counts as available customer funds.'));
    TN.refresh();
  });
  TN.act('acct-cheque-outcome', (f) => {
    const r = rcpt(f.dataset.id); const fd = new FormData(f); const kind = fd.get('kind'); const note = String(fd.get('reason') || '').trim();
    const bad = [];
    if (!fd.get('outcomeDate')) bad.push(['outcomeDate', 'Choose the date of the outcome.']);
    if (kind === 'cancelled' && !text10(note)) bad.push(['reason', 'Write 10 to 500 characters.']);
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    if (kind !== 'cancelled' && !(r.files || []).some((x) => x.kind === 'bank_proof')) return refuse(f, 'Upload the required proof first.');
    Object.assign(r, { cheque: kind, outcomeDate: fd.get('outcomeDate'), reason: note || r.reason });
    notify(['sales'], `Cheque ${r.chequeNo} on ${r.deal} (${inr(r.amount)}) was not paid: ${kind}.`, { deal: r.deal });
    flash('receipts-' + r.deal, doneMsg(`Cheque ${kind === 'bounced' ? 'bounced' : kind === 'stopped' ? 'stopped' : 'cancelled'}. It never counts as received money.`));
    TN.refresh();
  });
  TN.act('acct-represent', (f) => { const r = rcpt(f.dataset.id); r.cheque = 'waiting_clearance'; flash('receipts-' + r.deal, doneMsg('Cheque presented again. It waits for bank clearance; the amount is not counted twice.')); TN.refresh(); });
  TN.act('acct-upload', (f) => {
    const r = rcpt(f.dataset.id); const fd = new FormData(f); const file = fd.get('file');
    if (!file || !file.name) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['file', 'Choose a file.']]);
    if (file.size > 4 * 1024 * 1024) return refuse(f, 'The file is larger than 4 MB.', [['file', '']]);
    r.files.push({ kind: fd.get('kind'), name: file.name });
    flash('receipts-' + r.deal, doneMsg('File uploaded.'));
    TN.refresh();
  });

  /* ---------- Documents tab ---------- */
  function documentsTab(d) {
    const c = TN.customer(d.customer);
    const n = (d.adults || 0) + (d.children || 0) + (d.infants || 0);
    const lead = c.business ? c.contact : c.name;
    const travellers = d.submittedAt ? [`<li class="m-0 flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3"><p class="m-0 font-semibold text-ink">${esc(lead)} <span class="font-normal text-quiet">· Adult</span></p><ul class="m-0 flex list-none flex-col gap-2 p-0">${['aadhaar-front.jpg', 'aadhaar-back.jpg'].map((fn) => `<li class="m-0 flex flex-wrap items-center gap-3">${ic('file-check-corner', 'size-4 shrink-0 text-status-success')}<span class="min-w-40 flex-1 wrap-anywhere text-copy">${esc(lead.split(' ')[0].toLowerCase())}-${fn} <span class="text-sm text-quiet">· 640 KB · attached ${TN.fmt.date(d.submittedAt)}</span></span><a class="${BTN('secondary', 'sm', 'min-h-11')}" href="#" data-act="acct-open-file" rel="noopener">Open<span class="sr-only"> ID proof of ${esc(lead)}: ${fn}</span></a></li>`).join('')}</ul></li>`]
      .concat(n > 1 ? [`<li class="m-0 flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3"><p class="m-0 font-semibold text-ink">${TN.fmt.plural(n - 1, 'other traveller')}</p><p class="m-0 flex gap-2 text-sm text-copy">${ic('circle-alert', 'mt-0.5 size-4 shrink-0 text-status-danger')}No ID proof attached yet. Ask the salesperson.</p></li>`] : []).join('') : '';
    const idCard = d.submittedAt ? `<div class="mt-5"><div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card" data-slot="card"><section aria-labelledby="id-proofs-heading"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="id-proofs-heading">Traveller ID proofs</h2><p class="m-0 text-sm text-quiet"><span class="inline-flex gap-1.5">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}Private identity documents for this work. Every view is recorded. Do not copy or forward them.</span></p></div><div class="px-4.5 py-4"><ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Travellers and their ID proofs">${travellers}</ul></div></section></div></div>` : '';
    const withFiles = receiptsOf(d.id).filter((r) => r.files && r.files.length);
    const docs = (D.documents || []).filter((x) => x.deal === d.id);
    const M = TN.money || {};
    const custDocs = docs.length ? ui.table({ label: 'Customer documents', top: true, columns: ['Document', 'Dated', { label: 'Amount', numeric: true }, 'Status', 'Next step'],
      rows: docs.map((x) => { const w = (M.docStatus && M.docStatus[x.status]) || ['neutral', x.status]; return [`<span class="font-semibold text-ink">${esc(x.kind)}</span><span class="block text-sm whitespace-nowrap text-quiet">${esc(x.id)}</span>`, `<span class="whitespace-nowrap">${fdate(x.date)}</span>`, x.amount != null ? inr(x.amount) : '<span class="text-quiet">No prices</span>', st(w[1], w[0]), ui.button('Preview', { size: 'sm', act: 'acct-doc-preview', data: { id: x.id }, srLabel: ' ' + esc(x.kind) + ' ' + esc(x.id), attrs: { 'aria-haspopup': 'dialog' } })]; }),
      caption: 'Invoice and Advance Invoice are not tax invoices. The tax invoice is issued from Tally.' })
      : emptyCard({ icon: 'file-text', title: 'No customer documents yet', text: 'Invoice, Advance Invoice and hotel voucher are made on Invoices and vouchers.' });
    const custSection = `<section aria-labelledby="fin-cust-docs" class="mb-5"><div class="mb-3 flex flex-wrap items-end justify-between gap-2"><h2 id="fin-cust-docs" class="m-0 text-lg font-semibold text-ink">Customer documents</h2>${ui.link('/app/accounts/documents?tab=all&q=' + d.id, 'Open Invoices and vouchers')}</div>${custDocs}</section>`;
    return `${custSection}${idCard}<section class="fin-card" aria-labelledby="fin-documents"><h2 id="fin-documents">Receipt proof files</h2><p id="fin-documents-hint" class="hint">Bank proofs and cheque images for this deal’s receipts. Private: only Accounts can open them, and each opening is recorded.</p>${withFiles.length ? `<ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Proof files by receipt">${withFiles.map((r) => `<li class="m-0"><p class="m-0 font-semibold text-ink">${esc(r.id)} · ${esc(r.mode)}</p>${fileList(r, 'Proof files of ' + r.id, 'fin-documents-hint')}</li>`).join('')}</ul>` : '<p class="m-0">No receipt proof files on this deal yet.</p>'}</section>`;
  }

  /* ---------- Dues and plan tab ---------- */
  const openCancel = (dealId) => D.cancellations.some((c) => c.deal === dealId && !['closed', 'refund_paid'].includes(c.status));
  function ageingOf(i) {
    if (i.status === 'paid') return ['Paid', 'success'];
    if (openCancel(i.deal)) return ['On hold: cancellation requested', 'neutral'];
    const late = -TN.fmt.daysFrom(i.due);
    if (late > 30) return [`${late} days overdue`, 'danger'];
    if (late > 0) return [`${TN.fmt.plural(late, 'day')} overdue`, 'warning'];
    if (late === 0) return ['Due today', 'warning'];
    return [`Due in ${TN.fmt.plural(-late, 'day')}`, 'info'];
  }
  function duesTab(d) {
    const plan = D.instalments.filter((i) => i.deal === d.id);
    const total = plan.reduce((t, i) => t + i.amount, 0);
    const still = plan.reduce((t, i) => t + (i.amount - (i.paid || 0)), 0);
    const adds = plan.length ? (d.sellingPrice != null && total === d.sellingPrice ? ui.badge('Adds up to the selling total', 'success') : ui.badge('Does not add up to the selling total', 'danger', { icon: 'triangle-alert' })) : '';
    const table = plan.length ? ui.table({ label: 'Instalments', inCard: false, top: true,
      columns: ['Instalment', 'Due', { label: 'Amount', numeric: true }, { label: 'Still due', numeric: true }, 'Status'],
      rows: plan.map((i, n) => { const a = ageingOf(i); return [`<span class="font-semibold text-ink">${n + 1}. ${esc(i.label)}</span>${i.paid && i.status !== 'paid' ? '<span class="block text-sm text-quiet">Part paid</span>' : ''}`, `<span class="whitespace-nowrap">${fdate(i.due)}</span>`, inr(i.amount), inr(i.amount - (i.paid || 0)), st(a[0], a[1])]; }),
      caption: `Plan total ${inr(total)} · still due ${inr(still)}` }) : `<div class="px-4.5 py-4"><p class="m-0 text-quiet">No payment plan on this version.</p></div>`;
    return ui.card({ title: 'Dues and payment plan', titleId: 'fin-dues', actions: adds, flush: true, body: table })
      + `<p class="m-0 mt-3 font-sans text-sm text-quiet">Instalments are a plan, not money received. Only verified receipts reduce a due; the Deal’s salesperson follows up. ${ui.link('/app/accounts/dues?tab=open', 'Open Customer dues')}</p>`;
  }

  /* ---------- Refunds tab ---------- */
  function refundsTab(d) {
    const cx = D.cancellations.filter((c) => c.deal === d.id);
    const rf = D.refunds.filter((r) => r.deal === d.id);
    const M = TN.money || {};
    if (!cx.length && !rf.length) return emptyCard({ icon: 'undo-2', title: 'No refunds on this deal', text: 'A refund or recovery appears here after the branch Manager approves a cancellation or a change.' });
    const cxRows = cx.map((c) => { const w = (M.cancelStatus && M.cancelStatus[c.status]) || ['neutral', c.status]; const charges = c.charges.reduce((t, x) => t + x.supplierCharge, 0); const owes = charges + c.ourCharge - c.customerPaid; return [`<span class="font-semibold text-ink">Cancellation</span><span class="block text-sm text-quiet">${esc(c.kind)}</span>`, inr(Math.abs(owes)), st(w[1], w[0], owes > 0 ? 'Customer still owes' : 'Refund to the customer'), ui.button('Open', { size: 'sm', href: '/app/accounts/refunds', srLabel: ' cancellations being settled' })]; });
    const rfRows = rf.map((r) => { const w = (M.rfStatus && M.rfStatus[r.kind] && M.rfStatus[r.kind][r.status]) || ['neutral', r.status]; const party = r.kind === 'Customer refund' ? TN.customer(r.party).name : TN.supplier(r.party).name; return [`<span class="font-semibold whitespace-nowrap text-ink">${esc(r.id)}</span><span class="block text-sm text-quiet">${esc(r.kind)} · ${esc(party)}</span>`, inr(r.amount), st(w[1], w[0]), ui.button('Open', { size: 'sm', href: `/app/accounts/refunds?tab=${['approved', 'paid', 'verified'].includes(r.status) ? r.status : 'all'}`, srLabel: ' ' + esc(r.id) })]; });
    return ui.table({ label: 'Refunds and recoveries on this deal', top: true, columns: ['Refund', { label: 'Amount', numeric: true }, 'Status', 'Next step'], rows: cxRows.concat(rfRows) })
      + `<p class="m-0 mt-3 font-sans text-sm text-quiet">Refunds are paid and verified on ${ui.link('/app/accounts/refunds', 'Refunds')}; a different Accounts person verifies each one.</p>`;
  }

  /* ---------- Record header (C4) ---------- */
  const DEAL_TABS = [['receipts', 'Receipts'], ['dues', 'Dues and plan'], ['documents', 'Documents'], ['refunds', 'Refunds'], ['review', 'Review']];
  const TAB_ALIAS = { money: 'receipts' };
  const REVIEW_JUMP = { 'check the billing details': 'fin-billing', 'approve or return the booking': 'fin-booking' };
  function headNext(d, tab) {
    const rs = receiptsOf(d.id).filter((r) => r.status === 'recorded');
    const others = rs.filter((r) => r.recordedBy !== me());
    if (others.length) {
      const r = others[others.length - 1];
      return { text: `verify receipt ${esc(r.id)} (${inr(r.amount)}, ${esc(r.mode)})`, button: tab === 'receipts' ? { label: 'Verify receipt', jump: 'verify-' + r.id } : { label: 'Verify receipt', href: `/app/accounts/deals/${d.id}?tab=receipts` } };
    }
    const n = nextOf(d);
    const cq = receiptsOf(d.id).find((r) => rstat(r) === 'pending_clearance');
    if (!rs.length && n.nothing && cq) return { text: `record the bank clearance of cheque ${esc(cq.id)} when the bank credits it`, button: { label: 'Record a receipt', act: 'acct-record-open' } };
    if (rs.length) return { text: 'another Accounts person verifies the receipt you recorded', button: { label: 'Record a receipt', act: 'acct-record-open' } };
    if (n.nothing || !n.tab) return { text: n.nothing ? 'nothing waiting. Record a receipt when the customer pays.' : esc(n.text), button: { label: 'Record a receipt', act: 'acct-record-open' } };
    const target = REVIEW_JUMP[n.text] || 'fin-goahead';
    return { text: esc(n.text), button: tab === n.tab ? { label: n.label, jump: target } : { label: n.label, href: `/app/accounts/deals/${d.id}?tab=${n.tab}` } };
  }
  function dealHeader(d, tab) {
    const n = headNext(d, tab);
    const b = A.billing[d.id];
    const bill = !b ? 'Billing not entered yet' : b.status === 'verified' ? 'Billing verified' : 'Billing saved, not verified';
    const rev = d.submittedAt && REVIEW[d.accountsReview] ? REVIEW[d.accountsReview] : ['neutral', '–', 'No confirmed booking to review'];
    const rv = A.review[d.id];
    const c = TN.customer(d.customer);
    const details = ui.summaryList([
      { label: 'Branch', value: 'Jodhpur' },
      { label: 'Booking', value: d.submittedAt ? `Confirmed${rv ? ` ${fdt(rv.confirmedAt)} by ${esc(pname(rv.by))} · version ${rv.version}` : ''}` : 'No confirmed booking yet; receipts can still be recorded' },
      { label: 'Customer', value: `${esc(c.name)} · ${esc(c.phone)}` },
      { label: 'Trip', value: `${esc(d.destination)} · ${range(d.start, d.end)}` },
      { label: 'Money out for this deal', value: `${ui.link('/app/accounts/supplier-payments?tab=all&q=' + d.id, 'Supplier payments')} · ${ui.link('/app/accounts/funding?tab=all&q=' + d.id, 'Company funding')}` },
    ]);
    const btnHtml = !n.button ? '' : n.button.jump ? ui.button(n.button.label, { variant: 'primary', act: 'acc-jump', data: { target: n.button.jump } })
      : n.button.act ? ui.button(n.button.label, { variant: 'primary', act: n.button.act, data: { id: d.id }, attrs: { 'aria-haspopup': 'dialog' } }) : ui.button(n.button.label, { variant: 'primary', href: n.button.href });
    if (ui.recordHeader) {
      try {
        return ui.recordHeader({ back: { href: '/app/accounts', label: 'To check' }, recordId: esc(d.id), title: esc(d.title), status: rev[2], owner: esc(pname(d.owner)),
          next: n.button ? { text: n.text, button: n.button.jump ? { label: n.button.label, jump: '#' + n.button.jump } : n.button.act ? { label: n.button.label, act: n.button.act, data: { id: d.id } } : { label: n.button.label, href: n.button.href } } : null,
          nextWho: n.who, details });
      } catch (e) { /* fall back to the local header */ }
    }
    return ui.backLink('/app/accounts', 'To check')
      + `<header class="mb-4 flex flex-col gap-3 font-sans" data-slot="record-header"><p class="m-0 text-sm font-medium text-quiet">Accounts · ${esc(d.id)}</p><div class="flex flex-wrap items-center gap-x-3 gap-y-2"><h1 class="m-0 min-w-0 text-2xl leading-tight font-display tracking-heading wrap-anywhere text-ink max-sm:text-xl">${esc(d.title)}</h1>${st(rev[2], rev[0], bill)}${ui.owner(esc(pname(d.owner)), 'Sales owner')}</div>`
      + `<div class="flex flex-col gap-2 rounded-control border border-line bg-card px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between" data-slot="accounts-deal-next"><p class="m-0"><span class="font-semibold text-ink">Next:</span> ${n.text}${n.who ? `<span class="block text-sm text-quiet">${n.who}</span>` : ''}</p>${btnHtml}</div>`
      + `<details class="font-sans text-sm"><summary class="${SUMMARY}">Details</summary><div class="mt-3 rounded-control border border-line bg-card px-3.5 py-3">${details}</div></details></header>`;
  }

  TN.page('/app/accounts/deals/:id', {
    nav: '/app/accounts', roles: ROLES, title: (p) => p.id + ' · Accounts',
    render(p, q) {
      const d = TN.deal(p.id);
      if (!d) return ui.page(ui.backLink('/app/accounts', 'To check') + ui.pageHeader({ eyebrow: 'Accounts', title: 'Deal not found' }) + emptyCard({ icon: 'search-x', title: 'This record was not found or you cannot see it.', text: 'Look the deal up by its exact reference on To check.', action: ui.button('Back to To check', { href: '/app/accounts' }) }));
      const next = nextOf(d);
      const asked = TAB_ALIAS[q.tab] || q.tab;
      const tab = DEAL_TABS.some(([k]) => k === asked) ? asked : next.tab || 'receipts';
      const hrefOf = (t) => `/app/accounts/deals/${d.id}?tab=${t}`;
      const waiting = receiptsOf(d.id).filter((r) => r.status === 'recorded').length;
      const tabs = ui.tabs({ label: 'Accounts deal sections', cls: 'mb-4', items: DEAL_TABS.map(([k, l]) => ({ href: hrefOf(k), label: l, current: k === tab, count: k === 'receipts' && waiting ? waiting : undefined })) });
      const head = dealHeader(d, tab);
      let body;
      if (tab === 'receipts') {
        const help = 'verify-help-' + d.id;
        const recordBtn = headNext(d, tab).button && headNext(d, tab).button.act === 'acct-record-open' ? '' : ui.button('Record a receipt', { act: 'acct-record-open', data: { id: d.id }, icon: 'plus', attrs: { 'aria-haspopup': 'dialog' } });
        body = `${takeFlash('receipts-' + d.id)}<section aria-labelledby="fin-money-heading" class="mb-4"><h2 id="fin-money-heading" class="sr-only">Money for this deal</h2>${moneyFigures(money(d.id))}</section>`
          + `<div class="mb-3 flex flex-col gap-3 font-sans sm:flex-row sm:items-end sm:justify-between"><div class="min-w-0"><h2 id="fin-receipts" class="m-0 text-lg font-semibold text-ink">Customer receipts</h2><p id="${help}" class="m-0 mt-1 text-sm text-quiet">A second Accounts person verifies each receipt; verifying confirms the money arrived, matching the proof. Receipt numbers are internal. They are not tax invoices.</p></div>${recordBtn}</div>`
          + receiptTable(d, help) + `<div class="mt-6">${claimsSection(d)}</div>`;
      } else if (tab === 'dues') body = duesTab(d);
      else if (tab === 'refunds') body = refundsTab(d);
      else if (tab === 'review') body = `<div class="fin-grid">${readiness(d)}${bookingFacts(d)}</div>${goAheadCard(d)}${billingSection(d)}`;
      else body = documentsTab(d);
      return ui.page(head + tabs + `<div data-slot="accounts-deal-tab" data-tab="${tab}">${body}</div>`);
    },
  });

  /* =====================================================================
     Reported payments  ·  #/app/accounts/claims
     ===================================================================== */
  const CF = [['reported', 'To process'], ['linked', 'Linked to a receipt'], ['closed', 'Closed'], ['all', 'All']];
  const CLAIM_SORTS = {
    oldest: { label: 'Oldest waiting first', cmp: (a, b) => (a.reportedAt || a.date).localeCompare(b.reportedAt || b.date) },
    newest: { label: 'Newest first', cmp: (a, b) => (b.reportedAt || b.date).localeCompare(a.reportedAt || a.date) },
    amount: { label: 'Largest amount first', cmp: (a, b) => b.amount - a.amount },
  };
  const claimIn = (c, f) => f === 'all' || (f === 'closed' ? ['not_received', 'withdrawn'].includes(c.status) : c.status === f);
  TN.page('/app/accounts/claims', {
    nav: '/app/accounts/claims', roles: ROLES, title: 'Reported payments',
    render(_, q) {
      const filter = CF.some(([k]) => k === q.filter) ? q.filter : 'reported';
      const r = applyQuery(D.paymentReports.filter((c) => claimIn(c, filter)), q, { text: (c) => [c.deal, (TN.deal(c.deal) || {}).title, c.payer, c.ref, c.mode].join(' '), sorts: CLAIM_SORTS, def: 'oldest' });
      const bar = toolbar({ id: 'cl', label: 'Find a reported payment', search: { name: 'q', value: q.q, placeholder: 'Deal reference, payer or bank reference', label: 'Find a reported payment' }, chipsLabel: 'Reported payment filters',
        chips: CF.map(([k, l]) => ({ href: '/app/accounts/claims?filter=' + k, label: l, count: D.paymentReports.filter((c) => claimIn(c, k)).length, current: k === filter })),
        sort: { name: 'sort', value: r.sort, options: sortOptions(CLAIM_SORTS) } });
      const body = r.list.length ? ui.table({ label: 'Reported payments', top: true,
        columns: ['Payment', 'Paid on', { label: 'Amount', numeric: true }, 'Status', 'Next step', 'Reported by'],
        rows: r.list.map((c) => {
          const d = TN.deal(c.deal); const ref = c.mode === 'Cheque' ? `cheque ${c.ref}` : String(c.ref || '').replace(/^(UTR|UPI) /, '');
          const [tone, word] = CLAIM_STATUS[claimDisplay(c)];
          const next = c.status === 'reported' ? (c.by === me() ? '<span class="text-sm text-quiet">Another Accounts person handles it.</span>' : `<div class="flex flex-col items-start gap-1.5"><span class="text-sm text-copy">Record or link the receipt</span>${ui.button('Open', { size: 'sm', href: `/app/accounts/deals/${d.id}?tab=receipts`, srLabel: ` ${esc(d.id)} to record or link the receipt` })}</div>`) : '<span class="text-sm text-quiet">Nothing to do</span>';
          return [
            `${ui.rowLink(`/app/accounts/deals/${d.id}?tab=receipts`, esc(d.id))} <span class="text-copy">· ${esc(c.mode)}</span><span class="block text-sm text-quiet">${esc(c.payer)} · ${esc(ref)}</span>`,
            `<span class="whitespace-nowrap">${fdate(c.date)}</span>`,
            inr(c.amount), st(word, tone), next,
            `${esc(pname(c.by))}<span class="block text-sm whitespace-nowrap text-quiet">${fdate(c.reportedAt || c.date)}</span>`,
          ];
        }), footer: pagerFor(r.list.length, 'payment') })
        : emptyCard({ icon: 'inbox', title: filter === 'reported' && !r.needle ? 'No claims to process' : 'Nothing here', text: filter === 'reported' && !r.needle ? 'When Sales reports a payment, it appears here for you to record or link the receipt.' : 'Nothing matches this filter.' });
      return ui.page(listHeader('check', 'Reported payments', 'Reported by Sales. Not money until a receipt is recorded and checked by a second Accounts person.') + sectionTabs('check', '/app/accounts/claims') + bar + body);
    },
  });

  /* =====================================================================
     Department costs  ·  #/app/accounts/expenses
     ===================================================================== */
  const EF = [['submitted', 'To review'], ['returned', 'Returned'], ['accepted', 'Accepted'], ['all', 'All']];
  const DEPT = { purchase: 'Purchase', flight: 'Flight team', visa: 'Visa &amp; Passport desk' };
  const EXP = { submitted: ['info', 'Waiting for Accounts review'], accepted: ['success', 'Accepted (recorded only; not approved for payment)'], returned: ['danger', 'Returned by Accounts'] };
  const EXP_SORTS = {
    oldest: { label: 'Oldest waiting first', cmp: (a, b) => (a.submittedAt || '').localeCompare(b.submittedAt || '') },
    newest: { label: 'Newest first', cmp: (a, b) => (b.submittedAt || '').localeCompare(a.submittedAt || '') },
    amount: { label: 'Largest amount first', cmp: (a, b) => b.amount - a.amount },
  };
  function expenseFacts(e) {
    return ui.summaryList([
      { label: 'Paid by, how, when', value: `${COST_PAID[e.paidBy] || esc(e.paidBy)}${e.mode ? ` · ${COST_MODE[e.mode] || esc(e.mode)}` : ''}${e.paidOn ? ` · ${fdate(e.paidOn)}` : ''}${e.reference ? ` · reference ${esc(e.reference)}` : ''}` },
      { label: 'Sent', value: `${esc(pname(e.submittedBy) || 'Department')}${e.submittedAt ? ` · ${fdate(e.submittedAt)}` : ''}` },
      { label: 'Receipt', value: costFiles(e).length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0">${costFiles(e).map((fl) => `<li><a href="#" data-act="acct-open-file" class="${LINK_PLAIN}" rel="noopener">${esc(fl.name)}</a></li>`).join('')}</ul>` : 'Not stored' },
      e.returnReason ? { label: 'Returned because', value: esc(e.returnReason) } : null,
      e.status === 'accepted' && e.reviewedBy ? { label: 'Accepted', value: `${esc(pname(e.reviewedBy))}${e.reviewedAt ? ' · ' + fdate(e.reviewedAt) : ''}` } : null,
    ]);
  }
  TN.page('/app/accounts/expenses', {
    nav: '/app/accounts/expenses', roles: ROLES, title: 'Department costs',
    render(_, q) {
      const filter = EF.some(([k]) => k === q.filter) ? q.filter : 'submitted';
      const r = applyQuery(COSTS().filter((e) => filter === 'all' || e.status === filter), q, { text: (e) => [e.deal, e.note, DEPT[e.dept], COST_KIND[e.kind], e.reference].join(' '), sorts: EXP_SORTS, def: 'oldest' });
      const bar = toolbar({ id: 'ex', label: 'Find a department cost', search: { name: 'q', value: q.q, placeholder: 'Deal reference, department or note', label: 'Find a department cost' }, chipsLabel: 'Department cost filters',
        chips: EF.map(([k, l]) => ({ href: '/app/accounts/expenses?filter=' + k, label: l, count: COSTS().filter((e) => k === 'all' || e.status === k).length, current: k === filter })),
        sort: { name: 'sort', value: r.sort, options: sortOptions(EXP_SORTS) } });
      const rows = [];
      r.list.forEach((e) => {
        const own = e.submittedBy === me();
        const sr = `the ${COST_KIND[e.kind] || 'cost'} on ${esc(e.deal)}`;
        const next = e.status !== 'submitted' ? '<span class="text-sm text-quiet">Nothing to do</span>'
          : own ? '<span class="text-sm text-quiet">You recorded or sent this cost, so another Accounts person must review it.</span>'
            : rowActions({ id: e.id, approveAct: 'acct-exp-accept', returnAct: 'acct-exp-return-open', approveLabel: 'Accept', returnLabel: 'Return', sr });
        rows.push([
          `<span class="font-semibold text-ink">${DEPT[e.dept]} · ${COST_KIND[e.kind] || esc(e.kind)}</span>${e.note ? `<span class="block text-sm text-quiet">${esc(e.note)}</span>` : ''}<span class="block text-sm text-quiet">Sent by ${esc(pname(e.submittedBy) || 'Department')}</span>${detailToggle('e-' + e.id, sr)}`,
          `<span class="whitespace-nowrap">${e.paidOn ? fdate(e.paidOn) : '—'}</span>`,
          inr(e.amount), st(EXP[e.status][1], EXP[e.status][0]), next,
          ui.rowLink(`/app/accounts/deals/${e.deal}`, esc(e.deal)),
        ]);
        rows.push(detailRow('e-' + e.id, 6, expenseFacts(e)));
      });
      const body = r.list.length ? ui.table({ label: 'Department costs', top: true, columns: ['Cost', 'Paid on', { label: 'Amount', numeric: true }, 'Status', 'Next step', 'Deal'], rows, footer: pagerFor(r.list.length, 'cost') })
        : emptyCard({ icon: 'inbox', title: filter === 'submitted' && !r.needle ? 'No department costs to review' : 'Nothing here', text: filter === 'submitted' && !r.needle ? 'When a department sends a company-paid cost, it appears here.' : 'Nothing matches this filter.' });
      return ui.page(listHeader('out', 'Department costs', 'Accepting a cost records it for Accounts only: it never approves, makes or schedules a payment.')
        + sectionTabs('out', '/app/accounts/expenses') + takeFlash('expenses') + bar + body);
    },
  });
  TN.act('acct-exp-accept', (el) => {
    const e = D.departmentCosts.find((x) => x.id === el.dataset.id);
    if (e.submittedBy === me()) return TN.toast('Not saved', 'danger', 'You recorded or sent this cost, so another Accounts person must review it.');
    if (!costFiles(e).length) return TN.toast('Not saved', 'danger', 'The fee receipt (or, for a flight, the direct-payment proof) must be stored before this expense record can be accepted.');
    Object.assign(e, { status: 'accepted', reviewedBy: me(), reviewedAt: nowStamp() });
    costHistory(e, 'Accounts accepted the cost');
    notify([e.dept], `Accounts accepted your cost of ${inr(e.amount)} on ${e.deal}. Recorded only; no payment was approved or made.`, { deal: e.deal });
    flash('expenses', ui.notice('<p>Accepted. Recorded for Accounts only: no payment was approved or made.</p>', { tone: 'success', role: 'status', cls: 'mb-4' }));
    settle();
  });
  TN.act('acct-exp-return-open', (el) => {
    const e = D.departmentCosts.find((x) => x.id === el.dataset.id);
    reasonDialog({ title: 'Return to the department?', effect: `${DEPT[e.dept]} · ${COST_KIND[e.kind] || esc(e.kind)} · ${inr(e.amount)} on ${esc(e.deal)}. The department reads your reason and sends it again.`, label: 'Why are you returning it?', hint: '10 to 500 characters. The department reads it.', act: 'acct-exp-return', id: e.id, confirmLabel: 'Return with this reason', danger: true });
  });
  TN.act('acct-exp-return', (f) => {
    const e = D.departmentCosts.find((x) => x.id === f.dataset.id);
    const reason = dialogReason(f); if (!reason) return;
    Object.assign(e, { status: 'returned', returnReason: reason, reviewedBy: me(), reviewedAt: nowStamp() });
    costHistory(e, 'Accounts returned the cost', 'Reason: ' + reason);
    notify([e.dept], `Accounts returned your cost of ${inr(e.amount)} on ${e.deal}: ${reason}`, { deal: e.deal });
    flash('expenses', ui.notice('<p>Returned to the department with your reason.</p>', { tone: 'success', role: 'status', cls: 'mb-4' }));
    settle();
  });

  /* =====================================================================
     Branch cash  ·  #/app/accounts/cash   (Jodhpur, the pilot branch)
     ===================================================================== */
  function cashState() {
    const cash = D.receipts.filter((r) => r.mode === 'Cash');
    const deposited = new Set(A.deposits.filter((x) => x.status !== 'rejected').flatMap((x) => x.receipts));
    const verifiedDeposited = new Set(A.deposits.filter((x) => x.status === 'verified').flatMap((x) => x.receipts));
    const inHand = cash.filter((r) => r.status === 'verified' && !verifiedDeposited.has(r.id));
    const waitingDeposit = cash.filter((r) => r.status === 'verified' && !deposited.has(r.id));
    const unverified = cash.filter((r) => r.status === 'recorded');
    const problems = [];
    const late = waitingDeposit.filter((r) => TN.fmt.daysFrom(r.date) < -1);
    if (late.length) problems.push(['danger', '!', 'Verified cash not deposited in time', late, 'Deposit it at the bank and record the deposit with the slip.']);
    const lateV = unverified.filter((r) => TN.fmt.daysFrom(r.date) < -1);
    if (lateV.length) problems.push(['danger', '!', 'Cash recorded but not verified in time', lateV, 'Another Accounts person must verify or reject the receipt.']);
    const days = [...new Set(cash.map((r) => r.date).concat(A.deposits.map((x) => x.on)))].filter((dt) => dt < TN.TODAY);
    const missing = days.filter((dt) => !A.counts.some((c) => c.date === dt && c.status !== 'rejected'));
    if (missing.length) problems.push(['warn', '!', 'Daily cash count missing', missing, 'Record the cash count for this business date. A missing count stays listed until a count is recorded and verified, however old it is.', true]);
    const awaiting = A.counts.filter((c) => c.status === 'recorded');
    if (awaiting.length) problems.push(['warn', '◐', 'Daily cash count awaiting verification', awaiting.map((c) => c.date), 'A count is recorded but not verified, so the date is not cleared yet. Another Accounts person must verify it.', true]);
    return { inHand, waitingDeposit, unverified, problems };
  }
  const sum = (l) => l.reduce((t, r) => t + r.amount, 0);
  function depositForm(s) {
    return `<form noValidate="" aria-label="Record a bank deposit for Jodhpur" data-act="acct-deposit">${status()}<fieldset class="group" aria-describedby="dep-help"><legend>Cash receipts in this deposit</legend><span id="dep-help" class="hint">The deposit total is the exact sum of the receipts you tick. Another Accounts person verifies it against the slip.</span><ul class="fin-check-list">${s.waitingDeposit.map((r) => `<li><label class="choice"><input type="checkbox" name="receiptIds" checked="" value="${r.id}"/> ${r.id} · ${inr(r.amount)} · received ${r.date} · ${r.deal}</label></li>`).join('')}</ul></fieldset><div class="form-grid">${lfield({ id: 'dep-on', label: 'Deposited on', name: 'depositedOn', type: 'date', required: true })}${lfield({ id: 'dep-ref', label: 'Bank reference on the slip', name: 'bankReference', max: 60, required: true })}<div class="field"><label for="dep-file">Deposit slip</label><span id="dep-file-hint" class="hint">${FILE_HINT}</span><input id="dep-file" aria-describedby="dep-file-hint" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" required="" name="file"/></div></div><button type="submit" class="button" aria-disabled="false">Record deposit</button></form>`;
  }
  function countForm() {
    return `<form noValidate="" aria-label="Record a daily cash count for Jodhpur" data-act="acct-count">${status()}<p class="hint">Count the cash physically at the branch. The CRM compares it with verified cash in hand up to that date. Any difference needs a note.</p><div class="form-grid">${lfield({ id: 'cnt-date', label: 'Business date', name: 'businessDate', type: 'date', required: true })}${lfield({ id: 'cnt-amt', label: 'Cash counted (₹)', name: 'countedRupees', inputMode: 'decimal', required: true })}</div>${lfield({ id: 'cnt-note', label: 'Note (needed when the count differs)', name: 'note', textarea: true, hint: '10 to 500 characters.', wide: true })}<button type="submit" class="button secondary" aria-disabled="false">Record cash count</button></form>`;
  }
  TN.act('acct-deposit-open', () => TN.drawer({ wide: true, title: 'Record a bank deposit', description: 'Jodhpur branch cash', body: depositForm(cashState()) }));
  TN.act('acct-count-open', () => TN.drawer({ wide: true, title: 'Record a daily cash count', description: 'Jodhpur branch cash', body: countForm() }));
  TN.page('/app/accounts/cash', {
    nav: '/app/accounts/cash', roles: ROLES, title: 'Branch cash',
    render() {
      const s = cashState();
      const mine = me();
      const prob = s.problems.length
        ? `<ul class="problem-list" aria-label="Unresolved cash work at Jodhpur">${s.problems.map(([tone, g, title, items, text, isDate]) => `<li class="problem problem-${tone}"><span class="problem-glyph" aria-hidden="true">${g}</span><div class="problem-body"><p class="problem-title m-0">${title}</p><p class="problem-sentence m-0">${isDate ? TN.fmt.plural(items.length, 'date') : TN.fmt.plural(items.length, 'receipt')} · oldest ${fdate(isDate ? [...items].sort()[0] : [...items].sort((a, b) => a.date.localeCompare(b.date))[0].date)}</p><p class="m-0">${text}</p><ul class="mt-4 m-0" aria-label="${title}: listed items">${items.map((it) => `<li>${isDate ? fdate(it) : `${it.id} · ${fdate(it.date)} · ${inr(it.amount)}`}</li>`).join('')}</ul></div></li>`).join('')}</ul>`
        : '<p class="fin-all-clear"><span aria-hidden="true">✓ </span>Nothing unresolved at this branch.</p>';
      const waitTbl = s.waitingDeposit.length
        ? `<div class="table-scroll"><table class="stack-table"><caption class="visually-hidden">Verified cash waiting for deposit at Jodhpur</caption><thead><tr><th scope="col">Receipt</th><th scope="col">Deal</th><th scope="col">Received</th><th scope="col">Amount</th></tr></thead><tbody>${s.waitingDeposit.map((r) => `<tr><td data-label="Receipt">${r.id}</td><td data-label="Deal">${r.deal}</td><td data-label="Received">${fdate(r.date)}</td><td data-label="Amount" class="fin-num">${inr(r.amount)}</td></tr>`).join('')}</tbody></table></div>`
        : '<p class="hint">No verified cash is waiting to be deposited at Jodhpur.</p>';
      const deps = A.deposits.length ? `<ul class="fin-plain-list" aria-label="Bank deposits at Jodhpur">${A.deposits.map((x) => {
        const amt = x.receipts.reduce((t, id) => t + (rcpt(id) ? rcpt(id).amount : 0), 0);
        const st = x.status === 'verified' ? pill('ok', '●', 'Deposit:', 'Verified') : x.status === 'rejected' ? pill('danger', '✕', 'Deposit:', 'Rejected') : pill('info', '◐', 'Deposit:', 'Awaiting verification');
        let act = '';
        if (x.status === 'recorded') act = x.recordedBy === mine
          ? `<div class="fin-actions" role="group" aria-label="Actions for deposit ${esc(x.ref)}">${unavailable('Verify deposit', 'You recorded this deposit. Another Accounts person must do this step.')}${unavailable('Reject deposit', 'You recorded this deposit. Another Accounts person must do this step.')}</div>`
          : `<div class="fin-actions" role="group" aria-label="Actions for deposit ${esc(x.ref)}"><form noValidate="" class="fin-inline-form" aria-label="Verify deposit ${esc(x.ref)}" data-act="acct-dep-verify" data-id="${x.id}"><p id="dep-v-${x.id}" class="hint mb-0">Confirms the slip matches. Moves the cash from the branch to the bank; customer funds do not change.</p><button type="submit" class="button" aria-disabled="false" aria-describedby="dep-v-${x.id}">Verify deposit<span class="visually-hidden"> ${esc(x.ref)}</span></button></form><details class="form-section work-form fin-action-form"><summary><span class="form-section-title">Reject deposit<span class="visually-hidden"> ${esc(x.ref)}</span></span></summary><form noValidate="" aria-label="Reject deposit ${esc(x.ref)}" data-act="acct-dep-reject" data-id="${x.id}">${status()}<p class="hint">The receipts become free for a new deposit.</p>${lfield({ id: 'dep-r-' + x.id, label: 'Reason', name: 'reason', textarea: true, hint: '10 to 500 characters.', required: true, wide: true })}<button type="submit" class="button secondary" aria-disabled="false">Reject deposit</button></form></details></div>`;
        return `<li class="fin-row-card"><div class="panel-header m-0"><p class="m-0"><strong>${inr(amt)}</strong> on ${fdate(x.on)} · ref <span class="fin-mono">${esc(x.ref)}</span></p>${st}</div><p class="offer-meta">Receipts ${x.receipts.join(', ')} · recorded by ${esc(pname(x.recordedBy))}${x.verifiedBy ? ` · verified by ${esc(pname(x.verifiedBy))}` : ''}</p><ul class="file-list fin-files" aria-label="Deposit slip for ${esc(x.ref)}"><li class="file-row is-stored"><span class="file-glyph" aria-hidden="true">✓</span><span><a class="file-name" href="#" data-act="acct-open-file" aria-describedby="slip-hint-${x.id}">${esc(x.file)}</a><span class="file-meta"> · Bank proof (statement line or credit advice) · Stored</span></span></li></ul><p class="hint" id="slip-hint-${x.id}">The slip opens through a private link that works for 60 seconds. If it has expired, open it again from here.</p>${act}</li>`;
      }).join('')}</ul>` : '<p class="hint">No deposits recorded.</p>';
      const counts = A.counts.length ? `<ul class="fin-plain-list" aria-label="Daily cash counts at Jodhpur">${[...A.counts].sort((a, b) => b.date.localeCompare(a.date)).map((c) => {
        const diff = c.counted - c.expected;
        const st = c.status === 'verified' ? pill('ok', '●', 'Cash count:', 'Verified') : pill('info', '◐', 'Cash count:', 'Awaiting verification');
        const act = c.status === 'recorded' ? (c.recordedBy === mine ? unavailable(`Verify cash count<span class="visually-hidden"> for ${c.date}</span>`, 'You recorded this cash count. Another Accounts person must do this step.') : `<form noValidate="" class="fin-inline-form" aria-label="Verify cash count for ${c.date}" data-act="acct-count-verify" data-id="${c.date}"><button type="submit" class="button secondary" aria-disabled="false">Verify cash count<span class="visually-hidden"> for ${c.date}</span></button></form>`) : '';
        return `<li class="fin-row-card"><div class="panel-header m-0"><p class="m-0"><strong>${fdate(c.date)}</strong></p>${st}</div><dl class="facts fin-rec-facts"><dt>Counted</dt><dd>${inr(c.counted)}</dd><dt>Expected (verified cash in hand)</dt><dd>${inr(c.expected)}</dd><dt>Difference</dt><dd><strong>${diff === 0 ? 'None' : inr(diff)}</strong></dd><dt>Recorded, unverified cash up to that date</dt><dd>${inr(c.unverified)} (shown so a difference can be explained)</dd>${c.note ? `<dt>Note</dt><dd class="prewrap">${esc(c.note)}</dd>` : ''}</dl><p class="offer-meta">Recorded by ${esc(pname(c.recordedBy))}${c.verifiedBy ? ` · verified by ${esc(pname(c.verifiedBy))}` : ''}</p>${act}</li>`;
      }).join('')}</ul>` : '<p class="hint">No cash counts recorded.</p>';
      const branchPill = s.problems.length ? pill('danger', '!', 'Branch cash:', `${s.problems.reduce((t, p) => t + p[3].length, 0)} unresolved`) : pill('ok', '●', 'Branch cash:', 'Up to date');
      const actions = (s.waitingDeposit.length ? ui.button('Record deposit', { variant: 'primary', act: 'acct-deposit-open', attrs: { 'aria-haspopup': 'dialog' } }) : '') + ui.button('Record cash count', { variant: s.waitingDeposit.length ? 'secondary' : 'primary', act: 'acct-count-open', attrs: { 'aria-haspopup': 'dialog' } });
      return ui.page(listHeader('cash', 'Branch cash', 'Deposit cash within 1 working day (Monday to Saturday); count it every business date with cash activity.', actions) + sectionTabs('cash', '/app/accounts/cash'))
        + `<section class="fin-card" aria-labelledby="cash-jodhpur"><div class="panel-header m-0"><h2 id="cash-jodhpur" class="m-0">Jodhpur</h2>${branchPill}</div>${takeFlash('cash')}<dl class="fin-money is-two"><div class="fin-money-item is-available"><dt>Verified cash in hand</dt><dd>${inr(sum(s.inHand))}</dd><dd class="fin-money-hint">Verified cash receipts not yet in a verified bank deposit. Physical cash held for reversed receipts is not included; it is listed as a custody item under Unresolved.</dd></div><div class="fin-money-item is-waiting"><dt>Cash recorded, not verified</dt><dd>${inr(sum(s.unverified))}</dd><dd class="fin-money-hint">Shown separately; not part of cash in hand.</dd></div></dl><h3>Unresolved</h3>${prob}<h3>Verified cash waiting for deposit</h3>${waitTbl}<h3>Bank deposits</h3>${deps}<h3>Daily cash counts</h3>${counts}</section>`;
    },
  });
  TN.act('acct-deposit', (f) => {
    const fd = new FormData(f); const ids = fd.getAll('receiptIds'); const bad = [];
    if (!ids.length) bad.push(['receiptIds', 'Tick at least one receipt.']);
    if (!fd.get('depositedOn')) bad.push(['depositedOn', 'Choose the deposit date.']);
    if (!String(fd.get('bankReference') || '').trim()) bad.push(['bankReference', 'Enter the reference on the slip.']);
    const file = fd.get('file'); if (!file || !file.name) bad.push(['file', 'Upload the deposit slip.']);
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    A.deposits.unshift({ id: 'DEP-' + String(A.deposits.length + 4).padStart(4, '0'), on: fd.get('depositedOn'), ref: String(fd.get('bankReference')).trim(), receipts: ids, recordedBy: me(), status: 'recorded', file: file.name });
    notify([otherRole()], `Cash deposit recorded by ${pname(me())} at Jodhpur. A different person must verify it against the slip.`, { href: '#/app/accounts/cash' });
    flash('cash', doneMsg('Deposit recorded. Another Accounts person verifies it against the slip.'));
    settle();
  });
  TN.act('acct-dep-verify', (f) => { const x = A.deposits.find((y) => y.id === f.dataset.id); if (x.recordedBy === me()) return refuse(f, 'You recorded this deposit. Another Accounts person must do this step.'); Object.assign(x, { status: 'verified', verifiedBy: me() }); flash('cash', doneMsg('Deposit verified. The cash moved from the branch to the bank; customer funds did not change.')); TN.refresh(); });
  TN.act('acct-dep-reject', (f) => { const x = A.deposits.find((y) => y.id === f.dataset.id); const reason = String(new FormData(f).get('reason') || '').trim(); if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]); Object.assign(x, { status: 'rejected', reason, verifiedBy: null }); flash('cash', doneMsg('Deposit rejected. Its receipts can go into a new deposit.')); TN.refresh(); });
  TN.act('acct-count', (f) => {
    const fd = new FormData(f); const date = fd.get('businessDate'); const amt = Number(String(fd.get('countedRupees') || '').replace(/,/g, '')); const note = String(fd.get('note') || '').trim(); const bad = [];
    if (!date || date > TN.TODAY) bad.push(['businessDate', 'Choose today or an earlier date.']);
    if (!(amt >= 0) || String(fd.get('countedRupees') || '').trim() === '') bad.push(['countedRupees', 'Enter the cash counted in rupees.']);
    const cash = D.receipts.filter((r) => r.mode === 'Cash' && r.date <= (date || TN.TODAY));
    const vDep = new Set(A.deposits.filter((x) => x.status === 'verified' && x.on <= (date || TN.TODAY)).flatMap((x) => x.receipts));
    const expected = sum(cash.filter((r) => r.status === 'verified' && !vDep.has(r.id)));
    const unverified = sum(cash.filter((r) => r.status === 'recorded'));
    if (!bad.length && amt !== expected && !text10(note)) bad.push(['note', 'The count differs from verified cash in hand: write 10 to 500 characters.']);
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    A.counts = A.counts.filter((c) => c.date !== date);
    A.counts.push({ date, counted: amt, expected, unverified, note: note || null, recordedBy: me(), status: 'recorded' });
    notify([otherRole()], `Daily cash count for ${fdate(date)} recorded by ${pname(me())}. A different person must verify it.`, { href: '#/app/accounts/cash' });
    flash('cash', doneMsg('Cash count recorded. Another Accounts person verifies it.'));
    settle();
  });
  TN.act('acct-count-verify', (f) => { const c = A.counts.find((x) => x.date === f.dataset.id); if (c.recordedBy === me()) return refuse(f, 'You recorded this cash count. Another Accounts person must do this step.'); Object.assign(c, { status: 'verified', verifiedBy: me() }); flash('cash', doneMsg('Cash count verified.')); TN.refresh(); });

  /* =====================================================================
     Company accounts  ·  #/app/accounts/destinations
     ===================================================================== */
  const DEST_OWN = 'You submitted this version. Another Accounts person must approve or return it.';
  const APPROVAL_NOTE = 'Approval confirms these company details as entered. It does not check that the bank account belongs to the company, and it is not a payment.';
  const verLine = (dst, v) => (dst.kind === 'bank' ? `${v.bankName} ${v.shown ? v.full : v.masked} · IFSC ${v.ifsc} · holder ${v.holder}` : `${v.payee} ${v.shown ? v.full : v.masked}`);
  function destFields(dst, prefill) {
    return dst.kind === 'bank'
      ? `<fieldset class="group"><legend>Bank account details</legend><div class="form-grid">${lfield({ id: dst.id + '-h', label: 'Account holder name', name: 'holderName', hint: 'Exactly as the bank shows it.', max: 120, required: true, value: prefill && prefill.holder })}${lfield({ id: dst.id + '-b', label: 'Bank name', name: 'bankName', max: 120, required: true, value: prefill && prefill.bankName })}${lfield({ id: dst.id + '-n', label: 'Account number', name: 'accountNumber', hint: '9 to 18 digits. Leading zeros are kept.', inputMode: 'numeric', max: 24, required: true })}${lfield({ id: dst.id + '-i', label: 'IFSC', name: 'ifsc', hint: '11 characters, like ABCD0123456.', max: 11, caps: true, required: true, value: prefill && prefill.ifsc })}</div></fieldset>`
      : `<fieldset class="group"><legend>UPI details</legend><div class="form-grid">${lfield({ id: dst.id + '-p', label: 'Payee name', name: 'payeeName', hint: 'The name the UPI app shows when paying.', max: 120, required: true, value: prefill && prefill.payee })}${lfield({ id: dst.id + '-u', label: 'UPI ID', name: 'upiId', hint: 'Like name@bank.', max: 321, required: true })}</div></fieldset>`;
  }
  function destItem(dst) {
    const mine = me();
    const cur = currentVer(dst);
    const pending = dst.versions.find((v) => v.status === 'waiting');
    const lastReturned = !pending && dst.versions[dst.versions.length - 1].status === 'returned' ? dst.versions[dst.versions.length - 1] : null;
    const st = dst.retired ? pill('neutral', '–', 'Account status:', 'Retired') : pending ? pill('info', '◐', 'Account status:', 'Waiting for approval') : lastReturned ? pill('warn', '↩', 'Account status:', 'Returned for correction') : pill('ok', '●', 'Account status:', 'Approved, in use');
    const facts = `<dt>Used by new receipts</dt><dd>${dst.retired ? 'No. This account is retired.' : cur ? `Version ${cur.no} · ${esc(verLine(dst, cur))}<span class="fin-sub">Approved ${fdt(cur.decidedAt)} by ${esc(pname(cur.decidedBy))}</span>` : 'Not yet. No version has been approved.'}</dd>${pending ? `<dt>Waiting for approval</dt><dd>Version ${pending.no} · ${esc(verLine(dst, pending))}<span class="fin-sub">Submitted ${fdt(pending.submittedAt)} by ${esc(pname(pending.submittedBy))}</span></dd>` : ''}${lastReturned ? `<dt>Returned</dt><dd>Version ${lastReturned.no}, returned ${fdt(lastReturned.decidedAt)} by ${esc(pname(lastReturned.decidedBy))}<span class="fin-sub prewrap">Reason: ${esc(lastReturned.reason)}</span></dd>` : ''}`;
    const show = (v) => `<form class="fin-inline-form" aria-label="Show full details of version ${v.no} of ${esc(dst.label)}" data-act="acct-dest-show" data-id="${dst.id}" data-ver="${v.no}"><p id="dest-show-${dst.id}-${v.no}" class="hint mb-0">Opening the full details is recorded with your name and the time.</p><button type="submit" class="button secondary" aria-disabled="false" aria-describedby="dest-show-${dst.id}-${v.no}">${v.shown ? 'Hide full details' : 'Show full details'}<span class="visually-hidden"> of version ${v.no}</span></button></form>`;
    let decision = '';
    if (pending && !dst.retired) {
      decision = `<div>${show(pending)}</div><div class="fin-actions" role="group" aria-label="Decision on version ${pending.no} of ${esc(dst.label)}">${pending.submittedBy === mine
        ? `${unavailable(`Approve version ${pending.no}`, DEST_OWN)}${unavailable(`Return version ${pending.no}`, DEST_OWN)}`
        : `<form noValidate="" class="fin-inline-form" aria-label="Approve version ${pending.no} of ${esc(dst.label)}" data-act="acct-dest-approve" data-id="${dst.id}"><p id="dest-ap-${dst.id}" class="hint mb-0">Check the full details first. Approving makes this exact version the one new receipts select${cur ? `; version ${cur.no} stays in the history` : ''}. ${APPROVAL_NOTE}</p><button type="submit" class="button" aria-disabled="false" aria-describedby="dest-ap-${dst.id}">Approve version ${pending.no}<span class="visually-hidden"> of ${esc(dst.label)}</span></button></form><details class="form-section work-form fin-action-form"><summary><span class="form-section-title">Return version ${pending.no} with a reason<span class="visually-hidden"> for ${esc(dst.label)}</span></span></summary><form noValidate="" aria-label="Return version ${pending.no} of ${esc(dst.label)}" data-act="acct-dest-return" data-id="${dst.id}">${status()}<p class="hint">The maker then submits a corrected version. Nothing changes for receipts.</p>${lfield({ id: 'dret-' + dst.id, label: 'Reason', name: 'reason', textarea: true, hint: '10 to 500 characters. Say what must be corrected, without typing the account number or UPI ID.', required: true, wide: true })}<button type="submit" class="button secondary" aria-disabled="false">Return version ${pending.no}</button></form></details>`}</div>`;
    }
    const nextNo = dst.versions.length + 1;
    const retire = `<details class="form-section work-form fin-action-form"><summary><span class="form-section-title">Retire this account<span class="visually-hidden"> ${esc(dst.label)}</span></span></summary><form noValidate="" aria-label="Retire ${esc(dst.label)}" data-act="acct-dest-retire" data-id="${dst.id}">${status()}<div class="note warn" role="note"><p class="mb-0">Takes effect now and cannot be undone. New receipts cannot use it. Earlier receipts keep their record of it. To use an account again, add it as a new company account and have it approved.</p></div>${lfield({ id: 'dretire-' + dst.id, label: 'Reason', name: 'reason', textarea: true, hint: '10 to 500 characters. Kept in the history.', required: true, wide: true })}<button type="submit" class="button danger" aria-disabled="false">Retire account</button></form></details>`;
    const changes = dst.retired ? '' : `<div class="fin-actions" role="group" aria-label="Changes to ${esc(dst.label)}">${pending ? blocked(nid('b'), `Version ${pending.no} is waiting for approval. New details can be submitted after it is approved or returned.`) : `<details class="form-section work-form fin-action-form"><summary><span class="form-section-title">${lastReturned ? 'Submit a corrected version' : 'Replace with new details'}<span class="visually-hidden"> for ${esc(dst.label)}</span></span></summary><form noValidate="" aria-label="Submit new details for ${esc(dst.label)}" data-act="acct-dest-new-ver" data-id="${dst.id}">${status()}<p class="hint">Creates version ${nextNo} of this ${dst.kind === 'bank' ? 'bank account' : 'upi id'}. Version ${nextNo - 1} and every earlier version stay in the history.${cur ? ` Receipts keep using version ${cur.no} until another Accounts person approves the new one.` : ''}</p>${destFields(dst, cur || dst.versions[dst.versions.length - 1])}<p id="dest-nv-${dst.id}" class="hint">Submitting sends this exact version for approval by a different Accounts person. ${APPROVAL_NOTE}</p><button type="submit" class="button" aria-disabled="false" aria-describedby="dest-nv-${dst.id}">Submit new details for approval</button></form></details>`}${retire}</div>`;
    const hist = `<details class="form-section work-form"><summary><span class="form-section-title">Version history (${dst.versions.length})<span class="visually-hidden"> for ${esc(dst.label)}</span></span></summary><div><p class="hint">Versions are never changed after they are submitted. Receipts keep the version they were recorded against.</p><ol class="cost-timeline" aria-label="Versions of ${esc(dst.label)}, newest first">${[...dst.versions].reverse().map((v) => { const vs = v.status === 'waiting' ? pill('info', '◐', 'Version status:', 'Waiting for approval') : v.status === 'returned' ? pill('warn', '↩', 'Version status:', 'Returned') : v.replaced ? pill('neutral', '–', 'Version status:', 'Replaced') : pill('ok', '●', 'Version status:', 'Approved, current'); return `<li class="cost-step${v.status === 'waiting' ? ' is-latest' : v.status === 'approved' && !v.replaced ? ' is-committed' : ''}"><span class="cost-dot" aria-hidden="true">${v.no}</span><div><p class="m-0"><strong>Version ${v.no}</strong> ${vs}</p><p class="offer-meta">${esc(verLine(dst, v))}</p><p class="offer-meta">Submitted ${fdt(v.submittedAt)} by ${esc(pname(v.submittedBy))}${v.no > 1 ? ` · follows version ${v.no - 1}` : ''}${v.decidedBy ? ` · ${v.status === 'returned' ? 'returned' : 'approved'} ${fdt(v.decidedAt)} by ${esc(pname(v.decidedBy))}` : ''}</p><div>${show(v)}</div></div></li>`; }).join('')}</ol></div></details>`;
    return `<li class="fin-receipt" aria-labelledby="dest-${dst.id}"><div class="fin-receipt-head"><div><h3 id="dest-${dst.id}" class="m-0">${esc(dst.label)}</h3><p class="offer-meta">${dst.kind === 'bank' ? 'Bank account' : 'UPI ID'} · added ${fdt(dst.addedAt)} by ${esc(pname(dst.addedBy))}</p></div></div><p class="m-0 button-row">${st}</p><dl class="facts fin-receipt-facts">${facts}</dl>${decision}${changes}${hist}</li>`;
  }
  TN.act('acct-dest-add-open', () => TN.drawer({ wide: true, title: 'Add a company account', description: 'Where customers pay the company. A different Accounts person approves it.', body: `<form noValidate="" aria-label="Add a company account" data-act="acct-dest-add">${status()}<fieldset class="group fin-modes" aria-describedby="dest-new-kind-help"><legend>What kind of company account?</legend><span id="dest-new-kind-help" class="hint">Where customers pay the company. Bank transfer receipts select a bank account; UPI receipts select a UPI ID.</span><div class="fin-segment"><label class="fin-segment-option"><input type="radio" name="destinationKind" value="bank" data-change="acct-dest-kind"/><span class="fin-segment-label">Bank account</span></label><label class="fin-segment-option"><input type="radio" name="destinationKind" value="upi" data-change="acct-dest-kind"/><span class="fin-segment-label">UPI ID</span></label></div></fieldset>${lfield({ id: 'dest-new-label', label: 'Internal name', name: 'label', hint: 'A short name staff will recognise, like “Main current account”. Up to 80 characters. Do not type account numbers or UPI IDs here.', max: 80, required: true, wide: true })}<p class="hint" data-kind-none>Choose bank account or UPI ID to see the details to enter.</p><div data-kind="bank" hidden>${destFields({ id: 'new-bank', kind: 'bank' })}</div><div data-kind="upi" hidden>${destFields({ id: 'new-upi', kind: 'upi' })}</div><p id="dest-new-help" class="hint">Submitting sends this exact version for approval by a different Accounts person. ${APPROVAL_NOTE}</p><button type="submit" class="button" aria-disabled="false" aria-describedby="dest-new-help">Submit for approval</button></form>` }));
  TN.page('/app/accounts/destinations', {
    nav: '/app/accounts/destinations', roles: ROLES, title: 'Company accounts',
    render() {
      const inUse = A.destinations.filter((x) => !x.retired && currentVer(x)).length;
      const waiting = A.destinations.filter((x) => !x.retired && x.versions.some((v) => v.status === 'waiting')).length;
      const rows = A.destinations.map((x) => {
        const cur = currentVer(x); const pending = x.versions.find((v) => v.status === 'waiting');
        const last = x.versions[x.versions.length - 1];
        const word = x.retired ? ['Retired', 'neutral'] : pending ? ['Waiting for approval', 'info'] : last.status === 'returned' ? ['Returned for correction', 'warn'] : ['Approved, in use', 'ok'];
        const next = x.retired ? '<span class="text-sm text-quiet">Nothing to do</span>'
          : pending ? (pending.submittedBy === me() ? `<span class="text-sm text-quiet">${DEST_OWN}</span>` : ui.button(`Approve or return version ${pending.no}`, { size: 'sm', act: 'acc-jump', data: { target: 'dest-' + x.id } }))
            : last.status === 'returned' ? ui.button('Submit a corrected version', { size: 'sm', act: 'acc-jump', data: { target: 'dest-' + x.id } }) : '<span class="text-sm text-quiet">Nothing to do</span>';
        return [`<button type="button" class="cursor-pointer rounded-chip border-0 bg-transparent p-0 text-left font-semibold text-brand-strong underline-offset-4 hover:underline ${ui.FOCUS}" data-act="acc-jump" data-target="dest-${x.id}">${esc(x.label)}</button><span class="block text-sm text-quiet">${x.kind === 'bank' ? 'Bank account' : 'UPI ID'}</span>`, cur ? `Version ${cur.no} · ${esc(maskedDest(x, cur))}` : '<span class="text-quiet">Not yet approved</span>', st(word[0], word[1]), next];
      });
      return ui.page(listHeader('cash', 'Company accounts', 'Bank accounts and UPI IDs customers pay into. A second Accounts person approves each one.', ui.button('Add a company account', { variant: 'primary', act: 'acct-dest-add-open', attrs: { 'aria-haspopup': 'dialog' } })) + sectionTabs('cash', '/app/accounts/destinations'))
        + takeFlash('dest')
        + ui.table({ label: 'Company accounts', top: true, columns: ['Account', 'Used by new receipts', 'Status', 'Next step'], rows, caption: `${TN.fmt.plural(A.destinations.length, 'account')} · ${inUse} in use by new receipts · ${waiting} waiting for approval` })
        + `<p class="m-0 mt-3 mb-6 font-sans text-sm text-quiet">Account numbers and UPI IDs are masked. “Show full details” opens one version; each opening is recorded with your name and the time. Approval confirms the company details as entered. It does not check that the bank account belongs to the company, and it is not a payment.</p>`
        + `<section class="fin-card" aria-labelledby="dest-list-heading"><h2 id="dest-list-heading">Account details</h2><ol class="fin-receipt-list" aria-label="Company accounts">${A.destinations.map(destItem).join('')}</ol></section>`;
    },
  });
  TN.act('acct-dest-kind', (el) => { const f = el.form; f.querySelectorAll('.fin-segment-option').forEach((l) => l.classList.toggle('is-selected', l.contains(el))); f.querySelector('[data-kind-none]').hidden = true; f.querySelectorAll('[data-kind]').forEach((n) => (n.hidden = n.dataset.kind !== el.value)); });
  const destVals = (fd, kind, bad) => {
    const g = (k) => String(fd.get(k) || '').trim();
    if (kind === 'bank') {
      if (!g('holderName')) bad.push(['holderName', 'Enter the account holder name.']);
      if (!g('bankName')) bad.push(['bankName', 'Enter the bank name.']);
      if (!/^\d{9,18}$/.test(g('accountNumber'))) bad.push(['accountNumber', '9 to 18 digits.']);
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(g('ifsc'))) bad.push(['ifsc', '11 characters, like ABCD0123456.']);
      return { holder: g('holderName'), bankName: g('bankName'), full: g('accountNumber'), masked: 'XXXX' + g('accountNumber').slice(-4), ifsc: g('ifsc').toUpperCase() };
    }
    if (!g('payeeName')) bad.push(['payeeName', 'Enter the payee name.']);
    if (!/^[\w.-]{2,}@[a-z]{2,}$/i.test(g('upiId'))) bad.push(['upiId', 'Like name@bank.']);
    return { payee: g('payeeName'), full: g('upiId'), masked: g('upiId').charAt(0) + '***@' + g('upiId').split('@')[1] };
  };
  TN.act('acct-dest-add', (f) => {
    const fd = new FormData(f); const kind = fd.get('destinationKind'); const bad = [];
    if (!kind) bad.push(['destinationKind', 'Choose bank account or UPI ID.']);
    const label = String(fd.get('label') || '').trim(); if (!label || label.length > 80 || /\d{6,}|@/.test(label)) bad.push(['label', 'Up to 80 characters, without account numbers or UPI IDs.']);
    const vals = kind ? destVals(fd, kind, bad) : {};
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    A.destinations.push({ id: 'dest-' + (++uid), label, kind, addedAt: nowStamp(), addedBy: me(), retired: false, versions: [{ no: 1, ...vals, status: 'waiting', submittedAt: nowStamp(), submittedBy: me() }] });
    notify([otherRole()], `New company account “${label}” submitted by ${pname(me())}. A different Accounts person must approve it.`, { href: '#/app/accounts/destinations' });
    flash('dest', doneMsg('Details submitted. Another Accounts person must approve this exact version before it can be used.'));
    settle();
  });
  TN.act('acct-dest-new-ver', (f) => {
    const dst = destOf(f.dataset.id); const fd = new FormData(f); const bad = [];
    const vals = destVals(fd, dst.kind, bad);
    if (bad.length) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', bad);
    dst.versions.push({ no: dst.versions.length + 1, ...vals, status: 'waiting', submittedAt: nowStamp(), submittedBy: me() });
    notify([otherRole()], `New details for “${dst.label}” submitted by ${pname(me())}. A different Accounts person must approve them.`, { href: '#/app/accounts/destinations' });
    flash('dest', doneMsg('Details submitted. Another Accounts person must approve this exact version before it can be used.'));
    TN.refresh();
  });
  TN.act('acct-dest-approve', (f) => {
    const dst = destOf(f.dataset.id); const v = dst.versions.find((x) => x.status === 'waiting');
    if (v.submittedBy === me()) return refuse(f, DEST_OWN);
    dst.versions.forEach((x) => { if (x.status === 'approved') x.replaced = true; });
    Object.assign(v, { status: 'approved', decidedAt: nowStamp(), decidedBy: me() });
    flash('dest', doneMsg('Version approved. It is now the account new receipts can select; the previous version stays in history.'));
    TN.refresh();
  });
  TN.act('acct-dest-return', (f) => {
    const dst = destOf(f.dataset.id); const v = dst.versions.find((x) => x.status === 'waiting'); const reason = String(new FormData(f).get('reason') || '').trim();
    if (v.submittedBy === me()) return refuse(f, DEST_OWN);
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    Object.assign(v, { status: 'returned', decidedAt: nowStamp(), decidedBy: me(), reason });
    flash('dest', doneMsg('Version returned with your reason. The maker submits a corrected version.'));
    TN.refresh();
  });
  TN.act('acct-dest-retire', (f) => {
    const dst = destOf(f.dataset.id); const reason = String(new FormData(f).get('reason') || '').trim();
    if (!text10(reason)) return refuse(f, 'Some details are missing or not in the expected format. Check the highlighted fields.', [['reason', 'Write 10 to 500 characters.']]);
    dst.retired = true; dst.retiredReason = reason;
    flash('dest', doneMsg('Account retired. New receipts can no longer select it; earlier receipts keep their record.'));
    TN.refresh();
  });
  TN.act('acct-dest-show', (f) => { const v = destOf(f.dataset.id).versions.find((x) => x.no === Number(f.dataset.ver)); v.shown = !v.shown; if (v.shown) TN.toast(`Full details opened. Recorded with your name at ${fdt(nowStamp()).split(', ')[1]}.`, 'info'); TN.refresh(); });

  /* =====================================================================
     Customers to check  ·  #/app/accounts/customers(/:id)
     ===================================================================== */
  const PS = { not_checked: ['warning', 'Not checked'], checked: ['success', 'Checked by Accounts'], returned: ['danger', 'Returned'] };
  const partyBadge = (p) => ui.badge(PS[p.status][1], PS[p.status][0]);
  const PF = [['not_checked', 'Not checked'], ['returned', 'Returned'], ['checked', 'Checked by Accounts']];
  const PEMPTY = { not_checked: ['No customers to check', 'New and imported customers appear here until Accounts checks them.'], returned: ['No returned customers', 'Customers you return to Sales with a reason appear here until they are fixed.'], checked: ['No checked customers yet', 'Customers you check appear here.'] };
  const STATES = { '08': 'Rajasthan', '24': 'Gujarat', '07': 'Delhi' };
  const PARTY_SORTS = {
    oldest: { label: 'Oldest added first', cmp: (a, b) => (a.addedAt || '').localeCompare(b.addedAt || '') },
    name: { label: 'Name A to Z', cmp: (a, b) => a.name.localeCompare(b.name) },
  };
  TN.page('/app/accounts/customers', {
    nav: '/app/accounts/customers', roles: ROLES, title: 'Customers to check',
    render(_, q) {
      const filter = PF.some(([k]) => k === q.filter) ? q.filter : 'not_checked';
      const r = applyQuery(A.parties.filter((p) => p.status === filter), q, { text: (p) => [p.name, p.contact, p.phone, p.email, p.gstin, p.city].join(' '), sorts: PARTY_SORTS, def: 'oldest' });
      const bar = toolbar({ id: 'pc', label: 'Find a customer', search: { name: 'q', value: q.q, placeholder: 'Name, phone, e-mail or GSTIN', label: 'Find a customer' }, chipsLabel: 'Customer check status',
        chips: PF.map(([k, l]) => ({ href: '/app/accounts/customers?filter=' + k, label: l, count: A.parties.filter((p) => p.status === k).length, current: k === filter })),
        sort: { name: 'sort', value: r.sort, options: sortOptions(PARTY_SORTS) } });
      const body = r.list.length
        ? ui.table({ label: 'Customers', top: true, columns: ['Customer', 'Contact', 'GST', 'Source', 'Status', 'Next step'], footer: pagerFor(r.list.length, 'customer'), rows: r.list.map((p) => [
          `${ui.rowLink(`/app/accounts/customers/${p.id}`, `${esc(p.name)}<span class="sr-only"> (open the customer check)</span>`)}<span class="block text-sm text-quiet">${p.type === 'business' ? 'Business' : 'Personal'}${p.city ? ' · ' + esc(p.city) : ''}</span>`,
          esc([p.phone, p.email].filter(Boolean).join(' · ')) || ui.notEntered(),
          p.gstin ? 'GSTIN ' + esc(p.gstin) : p.type === 'business' ? ui.notEntered() : '—',
          `<span class="block">${esc(p.source || 'Added in the CRM')}</span><span class="block text-sm whitespace-nowrap text-quiet">${fdate(p.addedAt)}${p.addedBy ? ' · ' + esc(pname(p.addedBy)) : ''}</span>`,
          st(PS[p.status][1], PS[p.status][0]),
          p.status === 'checked' ? '<span class="text-sm text-quiet">Nothing to do</span>' : p.status === 'returned' ? '<span class="text-sm text-quiet">Sales fixes the details</span>' : ui.button('Check', { size: 'sm', href: `/app/accounts/customers/${p.id}`, srLabel: ' ' + esc(p.name) }),
        ]) })
        : emptyCard({ icon: 'users-round', title: r.needle ? 'No customer matches' : PEMPTY[filter][0], text: r.needle ? 'Nothing in this list matches your search.' : PEMPTY[filter][1] });
      return ui.page(listHeader('check', 'Customers to check', 'Check new and imported customers before they are used for billing.') + sectionTabs('check', '/app/accounts/customers') + bar + body);
    },
  });
  TN.page('/app/accounts/customers/:id', {
    nav: '/app/accounts/customers', roles: ROLES, title: 'Customer check',
    render(prm, q) {
      const p = A.parties.find((x) => x.id === prm.id);
      if (!p) return ui.notAllowed({ title: 'Customer not found', text: 'This customer was not found or you cannot see it.', back: { href: '/app/accounts/customers', label: 'Customers to check' } });
      const biz = p.type === 'business';
      const checked = p.status === 'checked';
      const editing = q.edit === '1';
      const action = !checked && !editing ? `<form data-act="acct-party-check" data-id="${p.id}">${ui.button('Mark as checked', { variant: 'primary', size: 'lg', type: 'submit', icon: 'circle-check' })}</form>` : '';
      const statusLine = `${partyBadge(p)}<span>${biz ? 'Business' : 'Personal'}</span>${p.source ? `<span>· ${esc(p.source)}</span>` : ''}${checked && p.checkedBy ? `<span>· Checked by ${esc(pname(p.checkedBy))}${p.checkedAt ? ' on ' + fdate(p.checkedAt) : ''}</span>` : ''}`;
      const addr = [p.a1, p.city, STATES[p.state] || p.state, p.pin, 'India'].filter(Boolean).join(', ');
      const details = editing ? partyEditForm(p) : ui.summaryList([
        biz ? { label: 'Contact name', value: p.contact ? esc(p.contact) : null } : null,
        { label: 'Phone · Email', value: esc([p.phone, p.email].filter(Boolean).join(' · ')) || null },
        { label: 'Address', value: p.a1 ? esc(addr) : null },
        biz ? { label: 'GST registration', value: p.gstStatus === 'registered' ? `GST registered · ${esc(p.gstin || '')}` : null } : null,
        { label: 'Files', value: p.files && p.files.length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0">${p.files.map((fl) => `<li><a href="#" data-act="acct-open-file" rel="noopener" class="inline-flex items-center gap-1.5 font-medium text-brand-strong underline underline-offset-4 ${ui.FOCUS}">${ic('file-text', 'size-3.5')}${esc(fl.name)}</a><span class="text-sm text-quiet"> · ${esc(fl.kind)} · ${esc(fl.size)}</span></li>`).join('')}</ul>` : ui.notEntered('No files') },
        p.usedOn && p.usedOn.length ? { label: 'Used on', value: p.usedOn.map((r) => `<a href="#/app/accounts/deals/${r}" class="text-brand-strong underline underline-offset-4 ${ui.FOCUS}">${r}</a>`).join(', ') } : null,
      ]);
      const btns = !editing ? `<div class="flex flex-wrap gap-2">${ui.button('Edit details', { size: 'sm', cls: 'min-h-10', icon: 'pencil', href: `/app/accounts/customers/${p.id}?edit=1` })}${p.status !== 'returned' ? ui.button('Return with reason', { size: 'sm', cls: 'min-h-10', icon: 'undo-2', act: 'acct-party-return-open', data: { id: p.id } }) : ''}</div>` : '';
      const hist = (p.history || []).length ? ui.card(`<section aria-labelledby="pc-history-heading" class="p-5 max-sm:p-4"><h2 id="pc-history-heading" class="m-0 mb-3 text-lg font-semibold text-ink">History</h2><ol class="m-0 flex list-none flex-col gap-2 p-0">${p.history.map((h) => `<li class="text-sm"><span class="text-quiet">${fdate(h.at)} · ${esc(pname(h.by))}:</span> ${esc(h.text)}</li>`).join('')}</ol></section>`).replace('<div class="px-4.5 py-4">', '<div>') : '';
      return ui.page(ui.backLink('/app/accounts/customers', 'Customers to check')
        + ui.pageHeader({ eyebrow: 'Accounts · Customer check', title: esc(p.name), status: statusLine, actions: action })
        + `<div class="flex flex-col gap-4.5">${takeFlash('party-' + p.id)}${p.status === 'returned' && p.returnedReason ? ui.notice(`<p>${esc(p.returnedReason)}</p>`, { tone: 'warning', title: 'Returned to Sales' }) : ''}`
        + ui.card(`<section aria-labelledby="pc-details-heading" class="p-5 max-sm:p-4"><div class="mb-3.5 flex flex-wrap items-center justify-between gap-3"><h2 id="pc-details-heading" class="m-0 text-lg font-semibold text-ink">Details</h2>${btns}</div>${details}${editing ? '' : '<p class="m-0 mt-3.5 text-sm text-quiet">GSTIN: format and state checked only. Bookings keep their own copy of the billing details.</p>'}</section>`).replace('<div class="px-4.5 py-4">', '<div>')
        + hist + '</div>');
    },
  });
  function partyEditForm(p) {
    const f = (id, label, name, value, o = {}) => ui.field({ id: 'ac-' + id, label, optional: o.optional, hint: o.hint, input: { name, value: value || '', attrs: o.attrs } });
    return `<form data-act="acct-party-save" data-id="${p.id}" noValidate="" aria-label="Edit customer details" class="flex flex-col gap-4"><div data-result></div><div class="grid grid-cols-1 gap-4 sm:grid-cols-2">${f('name', p.type === 'business' ? 'Company name' : 'Full name', 'name', p.name)}${p.type === 'business' ? f('contact', 'Contact name', 'contact', p.contact) : ''}${f('phone', 'Phone', 'phone', p.phone)}${f('email', 'Email', 'email', p.email, { optional: true })}${f('a1', 'Address', 'a1', p.a1)}${f('city', 'City', 'city', p.city)}${f('pin', 'PIN code', 'pin', p.pin)}${p.type === 'business' ? f('gstin', 'GSTIN', 'gstin', p.gstin, { hint: 'Its first two digits must match the state.' }) : ''}</div>${ui.notice('Saving changes sets this customer back to Not checked. Check it again after.', { tone: 'info' })}<div class="flex flex-wrap justify-end gap-2">${ui.button('Cancel', { href: `/app/accounts/customers/${p.id}` })}${ui.button('Save details', { variant: 'primary', type: 'submit' })}</div></form>`;
  }
  const partyHist = (p, text) => { (p.history || (p.history = [])).unshift({ at: TN.TODAY, by: me(), text }); };
  TN.act('acct-party-check', (f) => { const p = A.parties.find((x) => x.id === f.dataset.id); Object.assign(p, { status: 'checked', checkedBy: me(), checkedAt: TN.TODAY, returnedReason: null }); partyHist(p, 'Checked by Accounts.'); flash('party-' + p.id, ui.notice('<p>Customer checked.</p>', { tone: 'success', role: 'status' })); TN.refresh(); });
  TN.act('acct-party-save', (f) => {
    const p = A.parties.find((x) => x.id === f.dataset.id); const fd = new FormData(f); const g = (k) => String(fd.get(k) || '').trim();
    const box = f.querySelector('[data-result]');
    if (!g('name') || !g('phone') || !g('city')) return refuseB11(box, 'Enter the name, phone and city.');
    if (g('pin') && !/^\d{6}$/.test(g('pin'))) return refuseB11(box, 'The PIN code has six digits.');
    if (p.type === 'business' && g('gstin') && !/^08[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(g('gstin'))) return refuseB11(box, 'Check the GSTIN: format, and its first two digits must match the state (08 for Rajasthan).');
    Object.assign(p, { name: g('name'), contact: g('contact') || p.contact, phone: g('phone'), email: g('email'), a1: g('a1'), city: g('city'), pin: g('pin'), gstin: g('gstin').toUpperCase() || p.gstin, status: 'not_checked' });
    partyHist(p, 'Details edited. Set back to Not checked.');
    flash('party-' + p.id, ui.notice('<p>Details saved. This customer is Not checked until someone checks it again.</p>', { tone: 'success', role: 'status' }));
    TN.go('/app/accounts/customers/' + p.id);
  });
  TN.act('acct-party-return-open', (el) => {
    const p = A.parties.find((x) => x.id === el.dataset.id);
    TN.dialog({ title: `Return ${esc(p.name)} to Sales?`, description: 'Sales sees the reason and fixes the details. The customer cannot be used for billing until then.',
      body: `<form id="pc-return-form" data-act="acct-party-return" data-id="${p.id}" noValidate="" class="flex flex-col gap-3"><div data-result></div>${ui.field({ id: 'pc-return-reason', label: 'Reason', hint: '10 to 500 characters.', textarea: { name: 'reason', rows: 3, attrs: { maxLength: 500 } } })}</form>`,
      footer: ui.button('Keep it', { attrs: { 'data-close': '' } }) + ui.button('Return to Sales', { variant: 'primary', type: 'submit', attrs: { form: 'pc-return-form' } }) });
  });
  TN.act('acct-party-return', (f) => {
    const p = A.parties.find((x) => x.id === f.dataset.id); const reason = String(new FormData(f).get('reason') || '').trim();
    if (!text10(reason)) { const t = f.querySelector('textarea'); t.setAttribute('aria-invalid', 'true'); t.focus(); return refuseB11(f.querySelector('[data-result]'), 'Write the reason in 10 to 500 characters, so Sales knows what to fix.'); }
    Object.assign(p, { status: 'returned', returnedReason: reason });
    partyHist(p, 'Returned to Sales: ' + reason);
    notify(['sales'], `Accounts returned customer ${p.name}: ${reason}`);
    TN.closeOverlay();
    TN.refresh();
  });
})();
