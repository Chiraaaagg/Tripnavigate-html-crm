/* =====================================================================
   70-money.js · Agent G · Accounts money (all PENDING, to build)
   Pages: #/app/accounts/dues (+ ?tab=closure), /supplier-payments,
          /supplier-invoices, /documents, /funding, /refunds, /tally
   Also defines TN.openDocument(id) (A4 Invoice / Advance Invoice / voucher).
   Look: copied from the live Accounts screens (Reported payments list,
   Department costs review cards, To check queue table, fin-card money,
   tn-doc customer document). Every name and amount is invented.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const E = TN.esc;
  const F = TN.fmt;
  const LIMIT = 50000;

  /* ------------------------------------------------------------------
     Extra data this area needs (added at load, shared records untouched
     except status fields and the rows listed here).
     ------------------------------------------------------------------ */
  const ME = () => TN.roleDef().person; // 'accounts' | 'checker' | ...
  const name = (k) => (TN.person(k) ? TN.person(k).name : k || '—');

  // Supplier payments already settled for the travelled Rishikesh trip (needed by the closure checklist).
  [
    { id: 'SP-26-0013', deal: 'BX-38264', service: 's-264-h1', supplier: 'sp-aloha', amount: 45600, part: 'Full payment', dueBy: '2026-10-03', raisedBy: 'purchase', raisedAt: '2026-09-29', status: 'verified', approvedBy: 'accounts', paidBy: 'accounts', paidAt: '2026-10-02', verifiedBy: 'checker', bankRef: 'HDFC NEFT N275260388104', fromAccount: 'HDFC Bank current account ··4417', proof: 'NEFT-advice-02Oct-Aloha.pdf' },
    { id: 'SP-26-0012', deal: 'BX-38264', service: 's-264-h2', supplier: 'sp-marriott', amount: 49800, part: 'Full payment', dueBy: '2026-10-05', raisedBy: 'purchase', raisedAt: '2026-09-29', status: 'verified', approvedBy: 'checker', paidBy: 'checker', paidAt: '2026-10-04', verifiedBy: 'accounts', bankRef: 'HDFC NEFT N277260391550', fromAccount: 'HDFC Bank current account ··4417', proof: 'NEFT-advice-04Oct-JWM.pdf' },
    { id: 'SP-26-0011', deal: 'BX-38264', service: 's-264-t', supplier: 'sp-doontravels', amount: 21300, part: 'Full payment', dueBy: '2026-10-09', raisedBy: 'purchase', raisedAt: '2026-09-30', status: 'verified', approvedBy: 'accounts', paidBy: 'accounts', paidAt: '2026-10-08', verifiedBy: 'checker', bankRef: 'HDFC IMPS 628107733192', fromAccount: 'HDFC Bank current account ··4417', proof: 'IMPS-08Oct-DoonValley.png' },
  ].forEach((r) => { if (!D.supplierPayments.some((x) => x.id === r.id)) D.supplierPayments.push(r); });
  D.supplierPayments.forEach((p) => {
    if (p.status === 'paid' && !p.fromAccount) { p.fromAccount = 'HDFC Bank current account ··4417'; p.proof = p.proof || 'NEFT-advice-26Oct-GrandMumtaz.pdf'; }
    if (p.status === 'verified' && !p.fromAccount) { p.fromAccount = 'HDFC Bank current account ··4417'; p.proof = p.proof || 'SWIFT-copy-18Oct.pdf'; }
  });
  if (!D.supplierInvoices.some((x) => x.id === 'SI-0016')) {
    D.supplierInvoices.push({ id: 'SI-0016', deal: 'BX-38264', service: 's-264-t', supplier: 'sp-doontravels', kind: 'Invoice', number: 'DVT/26-27/0412', amount: 21300, gst: 1014, date: '2026-10-15', file: 'DVT-0412.pdf', status: 'accepted', by: 'purchase', checkedBy: 'accounts' });
  }

  // Documents: who created each one (nobody approves their own).
  const DOC_CREATORS = { 'HC/JDH/26-27/0043': 'sales', 'VCH-38412-01': 'purchase' };
  D.documents.forEach((d) => { if (!d.createdBy) d.createdBy = DOC_CREATORS[d.id] || (d.kind === 'Hotel voucher' ? 'purchase' : 'sales'); });

  // Funding: one small request Accounts can approve itself.
  if (!D.funding.some((f) => f.id === 'F-26-008')) {
    D.funding.unshift({ id: 'F-26-008', deal: 'BX-38547', service: 's-547-t', amount: 18000, reason: 'Marwar Coach Services wants 50% to block two 20 seater Volvo coaches for 6 Nov. The customer’s money has not arrived yet.', requestedBy: 'purchase', at: '2026-10-27', status: 'requested', recoverFrom: 'Next customer receipt on this Deal' });
  }

  // Refunds: a customer refund the Manager already approved, waiting to be paid.
  if (!D.refunds.some((r) => r.id === 'RF-26-005')) {
    D.refunds.unshift({ id: 'RF-26-005', deal: 'BX-38301', kind: 'Customer refund', party: 'c-mathur', amount: 4200, status: 'approved', approvedBy: 'manager', note: 'Sentosa cable car not operated on 3 Nov plan change; Asia Holidays credits the ticket value. Manager approved on 26 Oct.', payTo: 'Nidhi Mathur · HDFC Bank ··8812 (from her payment)' });
  }
  D.refunds.forEach((r) => {
    if (r.id === 'RF-26-003' && !r.paidAt) { r.paidAt = '2026-10-21'; r.fromAccount = 'HDFC Bank current account ··4417'; r.proof = 'IMPS-21Oct-Soni.png'; r.payTo = 'Rajesh Soni · SBI ··3307'; }
    if (r.id === 'RF-26-004' && !r.creditNote) r.creditNote = 'SI-0022';
  });

  // Own working records (customer transfers to allocate, export history, closure log).
  D.money = D.money || {
    transfers: [
      { id: 'RC-26-0116', payer: 'Suresh Bhandari', mode: 'Bank transfer', ref: 'UTR HDFCN52026102758213', amount: 228000, date: '2026-10-27', to: 'HDFC Bank current account ··4417', recordedBy: 'checker', verifiedBy: 'accounts', status: 'verified', hint: 'BX-38390', allocations: [], allocStatus: 'none' },
      { id: 'RC-26-0117', payer: 'Marudhar Agro Foods Pvt Ltd', mode: 'Bank transfer', ref: 'UTR SBINR52026102719044', amount: 100000, date: '2026-10-27', to: 'HDFC Bank current account ··4417', recordedBy: 'accounts', verifiedBy: 'checker', status: 'verified', hint: 'BX-38547', allocations: [], allocStatus: 'none' },
    ],
    exports: [
      { id: 'TX-2026-09', period: '2026-09', by: 'accounts', at: '2026-10-03 11:20', rows: 4, total: 0, ids: ['RC-26-0098'] },
    ],
    exported: { 'RC-26-0098': 'TX-2026-09' },
  };

  const COMPANY_ACCOUNTS = ['HDFC Bank current account ··4417', 'ICICI Bank current account ··2290', 'holidaychacha@hdfcbank (UPI)'];
  const COMPANY = TN.COMPANY || {
    legal: 'Holiday Chacha Pvt Ltd',
    office: '59A, Babu Rajendra Marg, Masuria Colony, Baldev Nagar, Jodhpur, Rajasthan 342003',
    pan: 'AAFCH9191M', gstin: '08AAFCH9191M1ZV', state: 'Rajasthan',
    branchLine: 'Jodhpur branch · +91 291 264 4417',
  };

  // UI state kept across re-renders: open inline forms, typed values, refusals.
  const S = { open: {}, val: {}, err: {} };

  /* ------------------------------------------------------------------
     Markup helpers (exact live class strings)
     ------------------------------------------------------------------ */
  const FV = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const BTN = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ' + FV;
  const VAR = {
    primary: 'border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white',
    secondary: 'border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink',
    ghost: 'border-transparent bg-transparent text-copy shadow-none hover:bg-wash hover:text-ink',
    danger: 'border-status-danger bg-status-danger text-white shadow-button hover:border-status-danger-strong hover:bg-status-danger-strong hover:text-white',
  };
  const SIZE = { sm: 'h-8 px-2.5 text-sm', md: 'h-10 px-3.5 text-base', lg: 'h-11 px-4 text-md min-h-11' };
  const LINK = 'rounded-chip text-brand-strong underline underline-offset-4 ' + FV;
  const LINK_STRONG = 'rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 ' + FV;
  const CONTROL = 'block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-lg text-ink sm:text-base m-0 appearance-none shadow-none transition-[border-color] duration-(--ui-duration-quick) motion-reduce:transition-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-wash disabled:text-quiet aria-invalid:border-2 aria-invalid:border-status-danger aria-invalid:focus:border-status-danger aria-invalid:focus:outline-status-danger';

  const ICON = {
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
    info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    'circle-check': '<circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path>',
    'circle-x': '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>',
    clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    download: '<path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path>',
    printer: '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"></path><rect x="6" y="14" width="12" height="8" rx="1"></rect>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
    'file-spreadsheet': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M8 13h2"></path><path d="M14 13h2"></path><path d="M8 17h2"></path><path d="M14 17h2"></path>',
    circle: '<circle cx="12" cy="12" r="10"></circle>',
    'circle-alert': '<circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
    'chevron-down': '<path d="m6 9 6 6 6-6"></path>',
    x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
  };
  const ic = (n, cls = '') => (TN.ic && TN.icons && TN.icons().includes(n) ? TN.ic(n, cls) : icOwn(n, cls));
  const icOwn = (n, cls = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${n}${cls ? ' ' + cls : ''}" aria-hidden="true">${ICON[n] || ''}</svg>`;

  const attrs = (o = {}) => Object.entries(o).filter(([, v]) => v != null && v !== false).map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${E(v)}"`)).join('');
  /** Live Button. o: { variant, size, act, href, id, type, icon, extra, attrs, className } */
  function btn(label, o = {}) {
    const cls = `${BTN} ${VAR[o.variant || 'secondary']} ${SIZE[o.size || 'md']}${o.className ? ' ' + o.className : ''}`;
    const inner = (o.icon ? ic(o.icon) : '') + label;
    if (o.href) return `<a class="${cls}" href="${E(o.href)}"${attrs(o.attrs)}>${inner}</a>`;
    return `<button type="${o.type || 'button'}" class="${cls}" data-slot="button"${attrs({ 'data-act': o.act, ...(o.attrs || {}) })}>${inner}</button>`;
  }
  const TONES = {
    success: ['border-status-success-line bg-status-success-tint text-status-success', 'circle-check'],
    warning: ['border-status-warning-line bg-status-warning-tint text-status-warning', 'triangle-alert'],
    danger: ['border-status-danger-line bg-status-danger-tint text-status-danger', 'circle-x'],
    info: ['border-status-info-line bg-status-info-tint text-status-info', 'info'],
    neutral: ['border-status-neutral-line bg-status-neutral-tint text-status-neutral', 'clock'],
    brand: ['border-brand-line bg-brand-tint text-brand-strong', 'send'],
  };
  /** Live StatusBadge with wrap (sentence statuses). */
  function badge(tone, text, sr) {
    const [c, i] = TONES[tone] || TONES.neutral;
    return `<span class="inline-flex max-w-full gap-1.5 border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0 ${c} items-start rounded-control whitespace-normal [&_svg]:mt-0.75" data-slot="status-badge" data-tone="${tone}">${ic(i)}<span class="min-w-0 wrap-anywhere">${sr ? `<span class="sr-only">${E(sr)}: </span>` : ''}${E(text)}</span></span>`;
  }
  /** Legacy Accounts status pill (To check queue). kind: ok | info | warn | neutral | danger */
  const GLYPH = { ok: '●', info: '◐', warn: '↩', neutral: '–', danger: '✕' };
  const pill = (kind, text, sr, glyph) => `<span class="status-pill ${kind}"><span class="status-glyph" aria-hidden="true">${glyph || GLYPH[kind]}</span>${sr ? `<span class="visually-hidden">${E(sr)}: </span>` : ''}${E(text)}</span>`;

  function pageHeader(title, desc, actions, eyebrow = 'Accounts') {
    return `<header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><p class="m-0 mb-1 text-sm font-medium text-quiet">${E(eyebrow)}</p><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">${E(title)}</h1>${desc ? `<p class="m-0 mt-1.5 text-base text-quiet">${desc}</p>` : ''}</div>${actions ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&>*]:flex-1">${actions}</div>` : ''}</header>`;
  }
  const TAB = '-mb-px inline-flex min-h-10 items-center gap-2 rounded-t-control border-b-2 border-transparent px-3 py-2 text-base font-medium text-quiet no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:border-brand-strong aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:-outline-offset-3';
  function tabs(label, items) {
    return `<nav aria-label="${E(label)}" class="font-sans mb-4" data-slot="tabs"><ul class="m-0 flex list-none flex-wrap gap-1 border-b border-line p-0 sm:flex-nowrap sm:overflow-x-auto">${items.map((t) => `<li class="m-0 shrink-0"><a${t.current ? ' aria-current="page"' : ''} class="${TAB}" href="${E(t.href)}">${E(t.label)}${t.count ? `<span class="sr-only">:</span><span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums">${t.count}</span>` : ''}</a></li>`).join('')}</ul></nav>`;
  }
  function summary(rows) {
    return `<dl class="m-0 flex flex-col divide-y divide-line font-sans" data-slot="summary-list">${rows.filter(Boolean).map(([dt, dd, num]) => `<div class="grid grid-cols-1 gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(10rem,40%)_1fr] sm:gap-4"><dt class="text-sm font-medium text-quiet">${E(dt)}</dt><dd class="m-0 wrap-break-word text-ink${num ? ' tabular-nums sm:text-right' : ''}">${dd}</dd></div>`).join('')}</dl>`;
  }
  const NOTICE = {
    info: ['border-status-info-line bg-status-info-tint', 'info', 'text-status-info'],
    warning: ['border-status-warning-line bg-status-warning-tint', 'triangle-alert', 'text-status-warning'],
    danger: ['border-status-danger-line bg-status-danger-tint', 'circle-x', 'text-status-danger'],
    success: ['border-status-success-line bg-status-success-tint', 'circle-check', 'text-status-success'],
    restricted: ['border-brand-line bg-brand-tint', 'shield-alert', 'text-brand-strong'],
    locked: ['border-line bg-wash', 'lock', 'text-quiet'],
  };
  function notice(tone, title, body, o = {}) {
    const [box, i, c] = NOTICE[tone];
    return `<div role="${o.role || 'note'}" class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy ${box}${o.className ? ' ' + o.className : ''}" data-slot="notice" data-tone="${tone}">${ic(i, `mt-0.5 size-4 shrink-0 ${c}`)}<div class="min-w-0 flex-1">${title ? `<p class="m-0 font-semibold text-ink">${title}</p>` : ''}${body ? `<div class="flex flex-col gap-1.5 [&_p]:m-0${title ? ' mt-0.75' : ''}">${body}</div>` : ''}</div></div>`;
  }
  function errorSummary(title, items, desc) {
    return `<div role="alert" tabindex="-1" class="flex gap-2.5 rounded-control border-2 border-status-danger-line bg-status-danger-tint px-3.5 py-3 font-sans text-base text-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-danger" data-slot="error-summary">${ic('circle-alert', 'mt-0.5 size-4.5 shrink-0 text-status-danger')}<div class="min-w-0 flex-1"><p class="m-0 font-semibold text-ink">${E(title)}</p>${desc ? `<p class="m-0 mt-0.75">${E(desc)}</p>` : ''}${items && items.length ? `<ul class="m-0 mt-1.5 flex list-disc flex-col gap-1 pl-5">${items.map(([id, t]) => `<li><a href="#${E(id)}" data-act="money-focus" data-target="${E(id)}" class="rounded-chip font-medium text-status-danger underline underline-offset-4 hover:text-status-danger-strong ${FV}">${E(t)}</a></li>`).join('')}</ul>` : ''}</div></div>`;
  }
  const blocked = (label, reason, id) => `<div class="fin-unavailable"><button type="button" class="button secondary small" aria-disabled="true" aria-describedby="${E(id)}">${E(label)}</button><p id="${E(id)}" class="fin-blocked"><span aria-hidden="true">⊘ </span>${E(reason)}</p></div>`;
  const cardList = (label, items) => `<ol class="m-0 flex list-none flex-col gap-3 p-0" aria-label="${E(label)}">${items.join('')}</ol>`;
  function article(o) {
    return `<li class="m-0" id="${E(o.anchor || '')}"><article class="flex flex-col gap-3 rounded-card border border-line bg-card px-4 py-3.5 shadow-card" aria-label="${E(o.label)}"><div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 font-semibold text-ink">${o.head}</p>${o.badge || ''}</div>${o.body || ''}${o.foot || ''}</article></li>`;
  }
  function empty(title, text, icon = 'inbox') {
    return `<div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card" data-slot="card"><div class="flex flex-col items-center px-6 py-10 text-center font-sans" data-slot="empty-state"><span class="mb-3 grid size-11 place-items-center rounded-card bg-brand-tint text-brand">${ic(icon, 'size-5')}</span><h3 class="m-0 text-lg leading-6 font-semibold text-ink">${E(title)}</h3><p class="m-0 mt-1.5 max-w-[42ch] text-base text-quiet">${E(text)}</p></div></div>`;
  }
  /** Live Field + control (drawer forms). kind: input | select | textarea | file | date */
  function field(o) {
    const id = o.id; const err = o.error;
    const desc = [o.hint ? id + '-hint' : '', err ? id + '-error' : ''].filter(Boolean).join(' ');
    const a = attrs({ id, name: o.name, required: o.required, 'aria-describedby': desc || null, 'aria-invalid': err ? 'true' : null, 'data-change': o.change || null });
    let ctl;
    if (o.kind === 'select') {
      ctl = `<div class="relative" data-slot="select"><select class="${CONTROL} cursor-pointer pr-9"${a}>${o.options.map((op) => { const [v, l] = Array.isArray(op) ? op : [op, op]; return `<option value="${E(v)}"${String(o.value ?? '') === String(v) ? ' selected' : ''}>${E(l)}</option>`; }).join('')}</select>${ic('chevron-down', 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-quiet')}</div>`;
    } else if (o.kind === 'textarea') {
      ctl = `<textarea rows="${o.rows || 2}" class="${CONTROL.replace('min-h-10 ', '')} min-h-24 resize-y leading-relaxed" data-slot="textarea"${a} maxlength="500">${E(o.value || '')}</textarea>`;
    } else {
      ctl = `<input type="${o.kind === 'file' ? 'file' : o.kind === 'date' ? 'date' : 'text'}" class="${CONTROL}" data-slot="input"${a}${o.kind === 'file' ? '' : ` value="${E(o.value ?? '')}"`}${o.inputmode ? ` inputmode="${o.inputmode}"` : ''} autocomplete="off">`;
    }
    return `<div class="flex flex-col gap-1.5${o.wide ? ' sm:col-span-2' : ''}" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="${E(id)}">${E(o.label)}${o.optional ? '<span class="font-normal text-quiet"> (optional)</span>' : ''}</label>${ctl}${o.hint ? `<p class="m-0 font-sans text-sm text-quiet" id="${E(id)}-hint">${E(o.hint)}</p>` : ''}${err ? `<p class="m-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger" id="${E(id)}-error">${ic('circle-alert', 'mt-0.5 size-3.5 shrink-0')}<span>${E(err)}</span></p>` : ''}</div>`;
  }
  const grid2 = (inner) => `<div class="grid gap-4 sm:grid-cols-2">${inner}</div>`;
  /** Accounts queue table (legacy .fin-queue, as the live To check list). cols: [label, numeric?] rows: [[cells...]] */
  function finTable(caption, cols, rows) {
    return `<div class="table-scroll"><table class="stack-table fin-queue"><caption>${caption}</caption><thead><tr>${cols.map(([c]) => `<th scope="col">${E(c)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((cell, i) => `<td data-label="${E(cols[i][0])}"${cols[i][1] ? ' class="fin-num"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function stats(items) {
    return `<dl class="m-0 mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:gap-4">${items.map(([l, v, n]) => `<div class="rounded-card border border-line bg-card px-4.5 py-4 font-sans shadow-card" data-slot="stat-item"><dt class="flex items-center justify-between gap-2 text-sm font-medium text-quiet"><span>${E(l)}</span></dt><dd class="m-0 mt-1.5 text-3xl font-display tracking-display text-ink tabular-nums max-sm:text-2xl">${v}</dd>${n ? `<dd class="m-0 mt-0.5 text-sm text-quiet">${n}</dd>` : ''}</div>`).join('')}</dl>`;
  }
  const dealLink = (id, extra = '') => `<a class="${LINK}" href="#/app/accounts/deals/${E(id)}${extra}">${E(id)}</a>`;
  const crmDealLink = (id) => `<a class="${LINK}" href="#/app/deals/${E(id)}?tab=money">${E(id)}</a>`;
  const fileLink = (f) => (f ? `<a class="${LINK}" href="#" data-act="money-file" data-file="${E(f)}">${E(f)}</a>` : '<span class="text-quiet">Not uploaded</span>');
  const quiet = (t) => `<span class="text-quiet">${t}</span>`;
  const nowStamp = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const isAcc = () => TN.is('accounts', 'checker');
  const hereHref = (q) => `#${TN.path().split('?')[0]}${q ? '?' + q : ''}`;
  function pushNotice(to, text, deal, href) { D.notices.unshift({ id: 'n-m' + Date.now() + Math.random().toString(36).slice(2, 5), to, kind: 'notice', text, deal, href, at: nowStamp() }); }
  const rupees = (v) => { const n = Number(String(v || '').replace(/[₹,\s]/g, '')); return Number.isFinite(n) && n > 0 ? Math.round(n) : null; };
  const toggleBtn = (label, key, variant = 'secondary') => `<button type="button" class="${BTN} ${VAR[variant]} h-11 px-4 text-md min-h-11" data-slot="button" data-act="money-toggle" data-key="${E(key)}" aria-expanded="${S.open[key] ? 'true' : 'false'}">${E(label)}</button>`;
  const primaryBig = (label, act, data = {}) => `<button type="button" class="${BTN.replace(' whitespace-nowrap', '')} ${VAR.primary} px-4 text-md h-auto min-h-11 py-2 whitespace-normal" data-slot="button" data-act="${act}"${attrs(data)}>${E(label)}</button>`;
  /** Inline "return with reason" form, as the live Department costs return form. */
  function reasonForm(key, act, id, title, label, hint, submit) {
    if (!S.open[key]) return '';
    const err = S.err[key]; const v = S.val[key] || '';
    return `<form data-act="${act}" data-id="${E(id)}" data-key="${E(key)}" novalidate aria-label="${E(title)}" class="flex flex-col gap-3">${err ? errorSummary('Check the reason', [[`${key}-reason`, err]]) : ''}${field({ id: `${key}-reason`, name: 'reason', label, hint, kind: 'textarea', value: v, error: err })}<div><button type="submit" class="${BTN} ${VAR.danger} ${SIZE.md}" data-slot="button">${E(submit)}</button></div></form>`;
  }
  function readReason(form) {
    const key = form.dataset.key; const v = String(new FormData(form).get('reason') || '').trim();
    S.val[key] = v;
    if (v.length < 10) { S.err[key] = 'Write 10 to 500 characters.'; TN.refresh(); focusLater(`${key}-reason`); return null; }
    delete S.err[key]; delete S.val[key]; S.open[key] = false; return v;
  }
  function focusLater(id) { setTimeout(() => { const el = document.getElementById(id); if (el) el.focus(); }, 30); }
  TN.act('money-toggle', (el) => { const k = el.dataset.key; S.open[k] = !S.open[k]; TN.refresh(); const b = document.querySelector(`[data-act="money-toggle"][data-key="${k}"]`); if (b) b.focus({ focusVisible: true }); });
  TN.act('money-focus', (el) => { const t = document.getElementById(el.dataset.target); if (t) t.focus(); });
  TN.act('money-file', (el) => TN.toast(`${el.dataset.file} opened in a new tab. Every opening is recorded.`));

  /** Drawer form opener. o: { title, description, formId, act, body(values, errors), submit, data } */
  function drawerForm(o, values = {}, errors = null) {
    const errItems = errors ? Object.entries(errors).map(([k, t]) => [`${o.formId}-${k}`, t]) : null;
    TN.drawer({
      wide: true,
      title: E(o.title),
      description: E(o.description || ''),
      body: `<form id="${o.formId}" data-act="${o.act}"${attrs(o.data || {})} novalidate class="flex flex-col gap-4">${errItems ? errorSummary(o.errTitle || 'Fix these before saving', errItems) : ''}${o.body(values, errors || {})}</form>`,
      footer: `<div class="flex flex-wrap gap-2">${btn(o.submit, { variant: 'primary', type: 'submit', attrs: { form: o.formId } })}${btn('Cancel', { variant: 'ghost', attrs: { 'data-close': '' } })}</div>`,
    });
    if (errItems) setTimeout(() => { const s = document.querySelector('#tn-overlay [data-slot="error-summary"]'); if (s) s.focus(); }, 30);
  }
  const fval = (form) => Object.fromEntries(new FormData(form).entries());

  /* ------------------------------------------------------------------
     Shared money logic
     ------------------------------------------------------------------ */
  const customerOf = (dealId) => { const d = TN.deal(dealId); return d ? TN.customer(d.customer) : null; };
  /** Total requested to this supplier on this Deal (DEC-24: counted across the Deal and supplier), returned excluded. */
  const counted = (p) => D.supplierPayments.filter((x) => x.deal === p.deal && x.supplier === p.supplier && x.status !== 'returned').reduce((s, x) => s + x.amount, 0);
  const needsManager = (p) => counted(p) > LIMIT;
  const bankChanged = (supplierId) => { const s = TN.supplier(supplierId); return s && s.bank === 'changed'; };
  D.supplierPayments.forEach((p) => { if (bankChanged(p.supplier) && ['requested', 'approved', 'waiting_manager'].includes(p.status)) p.status = 'on_hold'; });
  const daysOverdue = (i) => -F.daysFrom(i.due);
  const openInst = () => D.instalments.filter((i) => i.status !== 'paid');
  const onHoldDeal = (dealId) => D.cancellations.some((c) => c.deal === dealId && !['closed', 'refund_paid'].includes(c.status));

  /* ==================================================================
     1. Customer dues and collections (+ trip closure tab)
     ================================================================== */
  function ageing(i) {
    if (i.status === 'paid') return pill('ok', 'Paid', 'Ageing');
    if (onHoldDeal(i.deal)) return pill('neutral', 'On hold: cancellation requested', 'Ageing', '⏸');
    const d = daysOverdue(i);
    if (d > 30) return pill('danger', `${d} days overdue`, 'Ageing');
    if (d > 0) return pill('warn', `${F.plural(d, 'day')} overdue`, 'Ageing', '!');
    if (d === 0) return pill('warn', 'Due today', 'Ageing', '!');
    return pill('info', `Due in ${F.plural(-d, 'day')}`, 'Ageing');
  }
  function duesPage(params, q) {
    const tab = q.tab || 'overdue';
    if (tab === 'closure') return closurePage(q);
    const all = D.instalments.map((i, n) => ({ ...i, n }));
    const overdue = all.filter((i) => i.status !== 'paid' && daysOverdue(i) >= 0 && !onHoldDeal(i.deal));
    const soon = all.filter((i) => i.status !== 'paid' && daysOverdue(i) < 0 && daysOverdue(i) >= -7);
    const open = all.filter((i) => i.status !== 'paid');
    const paid = all.filter((i) => i.status === 'paid');
    const list = { overdue, soon, open, paid }[tab] || overdue;
    const toCheck = D.money.transfers.filter((t) => t.allocStatus === 'proposed').length;
    const unalloc = D.money.transfers.filter((t) => t.allocStatus !== 'approved');
    const sum = (arr) => arr.reduce((s, i) => s + (i.amount - i.paid), 0);
    const octVerified = D.receipts.filter((r) => r.status === 'verified' && r.date.startsWith('2026-10')).reduce((s, r) => s + r.amount, 0);
    const actions = isAcc() ? btn('Split a customer transfer', { variant: 'secondary', act: 'money-alloc-open' }) : '';
    const rows = list.map((i) => {
      const d = TN.deal(i.deal); const c = customerOf(i.deal); const due = i.amount - i.paid;
      const esc = i.status !== 'paid' && daysOverdue(i) >= 3 && !onHoldDeal(i.deal) ? `<span class="fin-sub">Branch Manager told</span>` : '';
      return [
        `${dealLink(i.deal, '?tab=money')}<span class="fin-sub">${E(c ? c.name : '')} · ${E(d ? d.destination : '')}</span>`,
        `${E(i.label)}${i.status === 'part_paid' || (i.paid > 0 && i.status !== 'paid') ? '<span class="fin-sub">Part paid</span>' : ''}`,
        E(F.date(i.due)),
        F.inr(i.amount),
        `<strong>${F.inr(due)}</strong>${i.paid && due ? `<span class="fin-sub">${F.inr(i.paid)} paid</span>` : ''}`,
        ageing(i) + esc,
        `${E(name(d.owner))}${isAcc() && i.status !== 'paid' ? `<span class="fin-sub"><button type="button" class="${LINK} cursor-pointer border-0 bg-transparent p-0 text-sm" data-act="money-remind" data-i="${i.n}">Remind<span class="visually-hidden"> ${E(name(d.owner))} about ${E(i.deal)}</span></button></span>` : '<span class="fin-sub">Sales owner</span>'}`,
        i.status === 'paid' ? quiet('Nothing to do') : `<a class="${LINK_STRONG}" href="#/app/accounts/deals/${E(i.deal)}?tab=receipts">Record receipt<span class="visually-hidden"> for ${E(i.deal)} ${E(i.label)}</span></a>`,
      ];
    });
    return pageHeader('Customer dues', 'What each customer still owes, instalment by instalment. The Deal’s salesperson follows up; the Manager is told when an instalment is 3 days overdue. Only verified receipts reduce a due.', actions)
      + stats([
        ['Overdue now', F.inr(sum(overdue)), F.plural(overdue.length, 'instalment')],
        ['Due in the next 7 days', F.inr(sum(soon)), F.plural(soon.length, 'instalment')],
        ['Verified in October', F.inr(octVerified), 'Customer receipts checked by a second person'],
      ])
      + (unalloc.length && isAcc() ? notice('info', `${F.plural(unalloc.length, 'customer transfer')} to split across bookings`, `<p>${unalloc.map((t) => `${E(t.payer)} · ${F.inr(t.amount)} · ${E(t.ref)} (${t.allocStatus === 'proposed' ? `split proposed by ${E(name(t.proposedBy))}: a different Accounts person checks it` : 'not split yet'})`).join('<br>')}</p><p><button type="button" class="${LINK_STRONG} cursor-pointer border-0 bg-transparent p-0" data-act="money-alloc-open">${toCheck ? 'Check the proposed split' : 'Split a customer transfer'}</button></p>`, { className: 'mb-4' }) : '')
      + tabs('Customer dues filters', [
        { label: 'Overdue', href: '#/app/accounts/dues?tab=overdue', count: overdue.length, current: tab === 'overdue' },
        { label: 'Due in 7 days', href: '#/app/accounts/dues?tab=soon', count: soon.length, current: tab === 'soon' },
        { label: 'All open', href: '#/app/accounts/dues?tab=open', count: open.length, current: tab === 'open' },
        { label: 'Paid', href: '#/app/accounts/dues?tab=paid', current: tab === 'paid' },
        { label: 'Trip closure', href: '#/app/accounts/dues?tab=closure', count: closable().filter((d) => d.tripStatus === 'travelled').length, current: false },
      ])
      + (rows.length ? finTable(`${F.plural(rows.length, 'instalment')} · ${{ overdue: 'Overdue, oldest first', soon: 'Due in the next 7 days', open: 'All open instalments', paid: 'Paid' }[tab]}`,
        [['Deal'], ['Instalment'], ['Due'], ['Amount', 1], ['Still due', 1], ['Ageing'], ['Follow-up'], ['Next step']], rows)
        : empty(tab === 'overdue' ? 'Nothing overdue' : 'No instalments here', 'Instalments appear here from the payment plan Sales entered and Accounts approved.'))
      + `<details class="mt-8 font-sans text-sm text-quiet"><summary class="cursor-pointer rounded-chip font-medium text-copy ${FV}">How is “still due” worked out?</summary><p class="m-0 mt-4">Still due is the instalment amount less verified receipts allocated to it. Payments reported by Sales and receipts waiting for verification do not count, and cheques count only after the bank clears them.</p></details>`;
  }
  TN.act('money-remind', (el) => {
    const i = D.instalments[Number(el.dataset.i)]; const d = TN.deal(i.deal); const c = customerOf(i.deal);
    pushNotice([d.owner === 'sales2' ? 'sales' : d.owner], `Reminder from ${TN.me().name}: ${d.destination} ${i.label.toLowerCase()} ${F.inr(i.amount - i.paid)} for ${c.name} was due ${F.day(i.due)}. Please follow up with the customer.`, i.deal);
    TN.toast(`Reminder sent to ${name(d.owner)}. Customer messages are not sent from the CRM.`);
  });

  /* ---- Allocation drawer: one transfer split across bookings ---- */
  TN.act('money-alloc-open', () => openAlloc());
  function openAlloc(tid, values, errors) {
    const ts = D.money.transfers.filter((t) => t.allocStatus !== 'approved');
    if (!ts.length) { TN.toast('Every customer transfer is already split.'); return; }
    const t = ts.find((x) => x.id === (tid || (values && values.transfer))) || ts.find((x) => x.allocStatus === 'proposed') || ts[0];
    if (t.allocStatus === 'proposed') return openAllocCheck(t);
    const lines = openInst().map((i) => ({ i, k: D.instalments.indexOf(i) }));
    const mine = lines.filter(({ i }) => i.deal === t.hint);
    const others = lines.filter(({ i }) => i.deal !== t.hint && !onHoldDeal(i.deal));
    const prefill = (k, i) => (values ? values['a' + k] ?? '' : i.deal === t.hint ? String(Math.min(i.amount - i.paid, Math.max(0, t.amount - mine.filter((m) => m.k < k).reduce((s, m) => s + (m.i.amount - m.i.paid), 0)))) : '');
    const row = ({ i, k }) => { const d = TN.deal(i.deal); return field({ id: `alloc-form-a${k}`, name: 'a' + k, label: `${i.deal} · ${i.label} · ${F.inr(i.amount - i.paid)} still due`, hint: `${customerOf(i.deal).name} · due ${F.date(i.due)} · ${d.destination}`, value: prefill(k, i), inputmode: 'numeric', optional: true }); };
    drawerForm({
      title: 'Split a customer transfer', formId: 'alloc-form', act: 'money-alloc-save', submit: 'Propose this split',
      description: 'One transfer stays one money event. Put each part against a booking; anything left stays as unallocated money for this customer.',
      body: (v, er) => `${field({ id: 'alloc-form-transfer', name: 'transfer', label: 'Customer transfer', kind: 'select', value: t.id, change: 'money-alloc-pick', options: ts.map((x) => [x.id, `${x.payer} · ${F.inr(x.amount)} · ${F.day(x.date)} · ${x.ref}`]) })}
        ${summary([['Received', `${F.date(t.date)} · ${E(t.mode)} · into ${E(t.to)}`], ['Receipt', `${E(t.id)} · recorded by ${E(name(t.recordedBy))} · verified by ${E(name(t.verifiedBy))}`], ['Amount', `<strong>${F.inr(t.amount)}</strong>`, 1]])}
        <fieldset class="m-0 min-w-0 rounded-card border border-line bg-card px-4 pt-1 pb-4 font-sans" data-slot="fieldset"><legend class="px-1 text-base font-semibold text-ink">Bookings of ${E(t.payer)}</legend><div class="flex flex-col gap-4">${mine.length ? mine.map(row).join('') : '<p class="m-0 text-sm text-quiet">No open instalment on this customer’s bookings.</p>'}</div></fieldset>
        <details class="font-sans text-sm text-quiet"><summary class="cursor-pointer rounded-chip font-medium text-copy ${FV}">Put part of it on another booking</summary><div class="mt-3 flex flex-col gap-4">${others.map(row).join('')}</div><p class="m-0 mt-3">All bookings listed are Jodhpur bookings. A split that touches a booking of another branch needs the branch Manager’s approval.</p></details>
        ${notice('info', null, '<p>A different Accounts person checks the split before the dues change.</p>')}`,
    }, values || {}, errors);
  }
  TN.act('money-alloc-pick', (el) => openAlloc(el.value));
  TN.act('money-alloc-save', (form) => {
    const v = fval(form); const t = D.money.transfers.find((x) => x.id === v.transfer);
    const parts = []; const errs = {};
    Object.entries(v).filter(([k]) => k.startsWith('a')).forEach(([k, raw]) => {
      if (!String(raw).trim()) return;
      const n = rupees(raw); const inst = D.instalments[Number(k.slice(1))];
      if (!n) { errs[k] = `${inst.deal} ${inst.label}: write the amount in whole rupees.`; return; }
      if (n > inst.amount - inst.paid) { errs[k] = `${inst.deal} ${inst.label}: at most ${F.inr(inst.amount - inst.paid)} is still due.`; return; }
      parts.push({ k: Number(k.slice(1)), amount: n });
    });
    const total = parts.reduce((s, p) => s + p.amount, 0);
    if (!parts.length && !Object.keys(errs).length) errs.transfer = 'Put at least one part against a booking.';
    if (total > t.amount) errs.transfer = `The parts add up to ${F.inr(total)}, more than the ${F.inr(t.amount)} received.`;
    if (Object.keys(errs).length) return openAlloc(t.id, v, errs);
    t.allocations = parts; t.allocStatus = 'proposed'; t.proposedBy = ME(); t.proposedAt = nowStamp();
    pushNotice(['accounts', 'checker'].filter((r) => r !== TN.role), `${TN.me().name} proposed a split of ${t.payer}’s transfer ${F.inr(t.amount)}. Please check it.`, null, '#/app/accounts/dues');
    TN.closeOverlay(); TN.toast(`Split proposed: ${F.inr(total)} on ${F.plural(parts.length, 'instalment')}${t.amount - total ? `, ${F.inr(t.amount - total)} kept as unallocated money` : ''}. A different Accounts person checks it.`); TN.refresh();
  });
  function openAllocCheck(t) {
    const total = t.allocations.reduce((s, p) => s + p.amount, 0);
    const own = t.proposedBy === ME();
    TN.drawer({
      wide: true,
      title: 'Check the proposed split',
      description: E(`${t.payer} · ${F.inr(t.amount)} · ${t.ref}`),
      body: `<div class="flex flex-col gap-4">${summary([...t.allocations.map((p) => { const i = D.instalments[p.k]; return [`${i.deal} · ${i.label}`, F.inr(p.amount), 1]; }), ['Kept as unallocated money', F.inr(t.amount - total), 1], ['Proposed', `${E(name(t.proposedBy))} · ${E(F.dateTime(t.proposedAt))}`]])}${own ? notice('restricted', 'You proposed this split', '<p>A different Accounts person must check it.</p>', { role: 'alert' }) : ''}</div>`,
      footer: `<div class="flex flex-wrap gap-2">${own ? blocked('Approve split', 'You proposed this split. Another Accounts person must do this step.', 'alloc-own') : btn('Approve split', { variant: 'primary', act: 'money-alloc-approve', attrs: { 'data-id': t.id } }) + btn('Send back', { variant: 'secondary', act: 'money-alloc-reject', attrs: { 'data-id': t.id } })}</div>`,
    });
  }
  TN.act('money-alloc-approve', (el) => {
    const t = D.money.transfers.find((x) => x.id === el.dataset.id);
    if (t.proposedBy === ME()) return TN.toast('You proposed this split. Another Accounts person must check it.', 'danger');
    t.allocations.forEach((p) => { const i = D.instalments[p.k]; i.paid += p.amount; i.status = i.paid >= i.amount ? 'paid' : 'part_paid'; });
    t.allocStatus = 'approved'; t.checkedBy = ME();
    pushNotice(['sales', 'accounts', 'checker', 'manager'], `${t.payer}’s transfer ${F.inr(t.amount)} is split and checked. Dues updated.`, t.hint);
    TN.closeOverlay(); TN.toast('Split approved. The dues now show this money.'); TN.refresh();
  });
  TN.act('money-alloc-reject', (el) => { const t = D.money.transfers.find((x) => x.id === el.dataset.id); t.allocStatus = 'none'; t.allocations = []; TN.closeOverlay(); TN.toast(`Sent back to ${name(t.proposedBy)} to split again.`); TN.refresh(); });

  /* ---- Trip closure ---- */
  function closable() { return D.deals.filter((d) => d.tripStatus === 'travelled' || d.tripStatus === 'closed'); }
  function checklist(d) {
    const rs = D.receipts.filter((r) => r.deal === d.id);
    const inst = D.instalments.filter((i) => i.deal === d.id);
    const svc = TN.servicesOf(d.id).filter((s) => s.cost);
    const pays = D.supplierPayments.filter((p) => p.deal === d.id && p.status !== 'returned');
    const paidSvc = svc.filter((s) => pays.some((p) => p.service === s.id));
    const invs = D.supplierInvoices.filter((x) => x.deal === d.id && x.kind === 'Invoice');
    const missingInv = svc.filter((s) => s.dept === 'purchase' && !invs.some((x) => x.service === s.id && x.status !== 'returned'));
    const unchecked = invs.filter((x) => x.status === 'uploaded');
    const openRf = D.refunds.filter((r) => r.deal === d.id && r.status !== 'verified');
    return [
      { key: 'rc', label: 'All customer receipts verified', done: rs.length > 0 && rs.every((r) => r.status === 'verified'), why: `${rs.filter((r) => r.status !== 'verified').length} waiting for verification`, href: `#/app/accounts/deals/${d.id}?tab=receipts` },
      { key: 'due', label: 'Nothing still due from the customer', done: inst.every((i) => i.status === 'paid'), why: `${F.inr(inst.reduce((s, i) => s + i.amount - i.paid, 0))} still due`, href: '#/app/accounts/dues?tab=open' },
      { key: 'sp', label: 'Every supplier payment verified', done: paidSvc.length === svc.length && pays.every((p) => p.status === 'verified'), why: `${pays.filter((p) => p.status !== 'verified').length + (svc.length - paidSvc.length)} not verified yet`, href: '#/app/accounts/supplier-payments?tab=paid' },
      { key: 'si', label: 'Every supplier invoice in and checked', done: !missingInv.length && !unchecked.length, why: [missingInv.length ? `${missingInv.length} missing` : '', unchecked.length ? `${unchecked.length} to check` : ''].filter(Boolean).join(', '), href: missingInv.length ? '#/app/accounts/supplier-invoices?tab=missing' : '#/app/accounts/supplier-invoices' },
      { key: 'rf', label: 'No open refund or recovery', done: !openRf.length, why: `${openRf.length} open`, href: '#/app/accounts/refunds' },
    ];
  }
  const WIDTH = ['w-0', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]', 'w-[35%]', 'w-[40%]', 'w-[45%]', 'w-[50%]', 'w-[55%]', 'w-[60%]', 'w-[65%]', 'w-[70%]', 'w-[75%]', 'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-full'];
  function progressChecklist(id, title, items) {
    const done = items.filter((i) => i.done).length; const pct = Math.round((done / items.length) * 100);
    return `<section id="${id}" aria-labelledby="${id}-heading" class="flex flex-col" data-slot="progress-checklist"><div class="flex items-baseline justify-between gap-2.5"><h3 id="${id}-heading" tabindex="-1" class="m-0 text-md font-semibold text-ink outline-none">${E(title)}</h3><span class="text-sm text-quiet">${done} of ${items.length} done</span></div><div role="progressbar" aria-labelledby="${id}-heading" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${done}" aria-valuetext="${done} of ${items.length} done" class="mt-2.5 mb-3.5 h-2 overflow-hidden rounded-full bg-wash"><div class="h-full rounded-full bg-brand transition-[width] duration-(--ui-duration-base) motion-reduce:transition-none ${WIDTH[Math.round(pct / 5)]}"></div></div><ul class="m-0 grid list-none grid-cols-1 gap-x-4.5 gap-y-1.5 p-0 sm:grid-cols-2">${items.map((it) => `<li class="m-0"><a href="${E(it.href)}" class="group flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent py-1.25 text-left text-sm text-copy no-underline ${FV}">${it.done ? ic('circle-check', 'mt-0.5 size-4 shrink-0 text-status-success') : ic('circle', 'mt-0.5 size-4 shrink-0 text-quiet')}<span class="min-w-0"><span class="font-semibold group-hover:underline">${E(it.label)}</span><span class="sr-only">${it.done ? ': done' : ': not done'}</span>${!it.done && it.why ? `<span class="text-quiet"> · ${E(it.why)}</span>` : ''}</span></a></li>`).join('')}</ul></section>`;
  }
  function closurePage() {
    const deals = closable();
    const travelled = deals.filter((d) => d.tripStatus === 'travelled');
    const cards = deals.map((d) => {
      const items = checklist(d); const ready = items.every((i) => i.done); const c = TN.customer(d.customer);
      const closed = d.tripStatus === 'closed';
      const cost = D.supplierPayments.filter((p) => p.deal === d.id && p.status === 'verified').reduce((s, p) => s + p.amount, 0);
      const received = D.receipts.filter((r) => r.deal === d.id && r.status === 'verified').reduce((s, r) => s + r.amount, 0);
      const refunded = D.refunds.filter((r) => r.deal === d.id && r.kind === 'Customer refund').reduce((s, r) => s + r.amount, 0);
      return article({
        label: `Trip ${d.id}`, anchor: 'close-' + d.id,
        head: `${dealLink(d.id)} <span class="font-normal wrap-anywhere text-copy">· ${E(d.title)}</span>`,
        badge: closed ? badge('success', `Closed by ${name(d.closedBy)} on ${F.day(d.closedAt)}`, 'Trip status') : ready ? badge('info', 'Travelled: ready to close', 'Trip status') : badge('warning', 'Travelled: closure checklist open', 'Trip status'),
        body: summary([['Travelled', `${F.date(d.start)} to ${F.date(d.end)} · ${E(c.name)} · ${d.adults} adults`], ['Customer money', `${F.inr(received)} verified${refunded ? ` · ${F.inr(refunded)} refunded` : ''} · price ${F.inr(d.sellingPrice)}`], ['Supplier payments verified', F.inr(cost)], ['Sales owner', E(name(d.owner))]])
          + `<div class="rounded-control border border-line bg-canvas px-4 py-3.5">${progressChecklist('chk-' + d.id, 'Closure checklist', items)}</div>`,
        foot: closed ? '' : !isAcc() ? '' : `<div class="flex flex-wrap gap-2">${ready ? primaryBig('Close trip', 'money-close-trip', { 'data-id': d.id }) : blocked('Close trip', 'Finish the checklist first. Open an item to see what is left.', 'close-why-' + d.id)}</div>`,
      });
    });
    return pageHeader('Customer dues', 'What each customer still owes, instalment by instalment. The Deal’s salesperson follows up; the Manager is told when an instalment is 3 days overdue.', '')
      + tabs('Customer dues filters', [
        { label: 'Overdue', href: '#/app/accounts/dues?tab=overdue', count: D.instalments.filter((i) => i.status !== 'paid' && daysOverdue(i) >= 0 && !onHoldDeal(i.deal)).length },
        { label: 'Due in 7 days', href: '#/app/accounts/dues?tab=soon' },
        { label: 'All open', href: '#/app/accounts/dues?tab=open' },
        { label: 'Paid', href: '#/app/accounts/dues?tab=paid' },
        { label: 'Trip closure', href: '#/app/accounts/dues?tab=closure', count: travelled.length, current: true },
      ])
      + notice('info', null, '<p>A trip becomes Travelled the day after it ends. Accounts closes it when every receipt and supplier payment is verified, every supplier invoice is in and no refund is open. Closing does not post anything to Tally.</p>', { className: 'mb-4' })
      + (cards.length ? cardList('Travelled trips', cards) : empty('No travelled trips', 'A trip appears here the day after it ends.'));
  }
  TN.act('money-close-trip', (el) => {
    const d = TN.deal(el.dataset.id);
    if (!checklist(d).every((i) => i.done)) return TN.toast('The closure checklist is not finished.', 'danger');
    TN.dialog({
      title: E(`Close trip ${d.id}?`),
      body: `<p class="m-0 text-base text-copy">${E(d.title)}. Every receipt, supplier payment, supplier invoice and refund is settled. The trip moves to Closed; money records stay as they are.</p>`,
      footer: `${btn('Cancel', { variant: 'secondary', attrs: { 'data-close': '' } })}${btn('Close trip', { variant: 'primary', act: 'money-close-confirm', attrs: { 'data-id': d.id } })}`,
    });
  });
  TN.act('money-close-confirm', (el) => {
    const d = TN.deal(el.dataset.id); d.tripStatus = 'closed'; d.closedBy = ME(); d.closedAt = TN.TODAY;
    pushNotice(['sales', 'manager'], `Trip ${d.id} (${d.title}) is closed by Accounts.`, d.id);
    TN.closeOverlay(); TN.toast(`Trip ${d.id} closed.`); TN.refresh();
  });

  /* ==================================================================
     2. Supplier payments
     ================================================================== */
  const SP_STATUS = {
    requested: ['info', 'Waiting for Accounts approval'],
    waiting_manager: ['neutral', 'Waiting for the branch Manager'],
    approved: ['warning', 'Approved: record the payment'],
    paid: ['info', 'Paid: a different person verifies'],
    verified: ['success', 'Paid and verified'],
    returned: ['danger', 'Returned to the department'],
    on_hold: ['warning', 'On hold: supplier bank details changed'],
  };
  const SP_TABS = [['requested', 'To approve'], ['waiting_manager', 'Waiting for Manager'], ['approved', 'To pay'], ['paid', 'To verify'], ['verified', 'Verified'], ['returned', 'Returned'], ['on_hold', 'On hold'], ['all', 'All']];
  function spPage(p, q) {
    const tab = q.tab || (TN.is('manager') ? 'waiting_manager' : 'requested');
    const rows = D.supplierPayments.filter((x) => tab === 'all' || x.status === tab).sort((a, b) => a.dueBy.localeCompare(b.dueBy));
    const items = rows.map(spCard);
    return pageHeader('Supplier payments', 'Payment requests from Purchase and Flight. Accounts approves up to ₹50,000, counted across the Deal and supplier; the branch Manager approves above that. Money is paid from the bank outside the CRM; record each payment with its bank reference.')
      + `<div class="mb-4"><p class="m-0 flex gap-2 text-sm text-quiet">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}<span>Approving a request does not move money. There are no automatic payouts.</span></p></div>`
      + tabs('Supplier payment filters', SP_TABS.map(([k, l]) => ({ label: l, href: `#/app/accounts/supplier-payments?tab=${k}`, count: k === 'all' ? 0 : D.supplierPayments.filter((x) => x.status === k).length, current: tab === k })))
      + (items.length ? cardList(`${SP_TABS.find((t) => t[0] === tab)[1]}, earliest due first`, items) : empty('Nothing here', tab === 'requested' ? 'New payment requests from Purchase and Flight appear here.' : 'No supplier payment is in this state.'));
  }
  function spCard(p) {
    const s = TN.service(p.service); const sup = TN.supplier(p.supplier); const d = TN.deal(p.deal);
    const [tone, text] = SP_STATUS[p.status]; const tot = counted(p);
    const dueDays = F.daysFrom(p.dueBy);
    const body = summary([
      ['Amount', `<strong>${F.inr(p.amount)}</strong> · ${E(p.part)}`, 0],
      ['For', `${E(s ? s.title : '')}<span class="block text-sm text-quiet">${E(d.title)}</span>`],
      ['Supplier', `${E(sup.name)}${sup.bank === 'approved' ? ' · bank details approved' : sup.bank === 'not_needed' ? ' · paid through the portal' : sup.bank === 'changed' ? ' · <strong>bank details changed, waiting for the Manager</strong>' : ' · bank details not approved yet'}`],
      ['Pay by', `${F.date(p.dueBy)}${['requested', 'approved', 'waiting_manager'].includes(p.status) ? ` · ${dueDays < 0 ? `${-dueDays} days late` : dueDays === 0 ? 'today' : `in ${F.plural(dueDays, 'day')}`}` : ''}`],
      ['Counted for approval', `${F.inr(tot)} to ${E(sup.name)} on this Deal · ${tot > LIMIT ? 'above ₹50,000: the branch Manager approves' : 'up to ₹50,000: Accounts approves'}`],
      ['Requested', `${E(name(p.raisedBy))} (${p.raisedBy === 'flight' ? 'Flight' : 'Purchase'}) · ${F.date(p.raisedAt)}`],
      ['Supplier bill or proforma', fileLink(p.invoice)],
      p.approvedBy ? ['Approved', `${E(name(p.approvedBy))}${p.approvedBy === 'manager' ? ' (branch Manager)' : ''}`] : null,
      p.paidBy ? ['Paid', `${F.date(p.paidAt)} · ${E(p.fromAccount || '')} · ${E(p.bankRef)}<span class="block text-sm text-quiet">Recorded by ${E(name(p.paidBy))} · proof ${fileLink(p.proof)}</span>`] : null,
      p.verifiedBy ? ['Verified', `${E(name(p.verifiedBy))} against the bank statement`] : null,
      p.funding ? ['Company funding', `<a class="${LINK}" href="#/app/accounts/funding">${E(p.funding)}</a> · paid before the customer’s money arrives`] : null,
      p.returnReason ? ['Returned because', E(p.returnReason)] : null,
    ]);
    let foot = '';
    const notes = [];
    if (p.note) notes.push(E(p.note));
    if (p.status === 'waiting_manager') foot = notice('info', 'Waiting for the branch Manager', `<p>Above ₹50,000 counted across this Deal and supplier, so the branch Manager approves it.${TN.is('manager') ? ` <a class="${LINK_STRONG}" href="#/app/approvals">Open Approvals</a>` : ' Accounts cannot approve it.'}</p>`);
    if (p.status === 'on_hold') foot = notice('warning', 'On hold', `<p>${E(sup.name)} changed its bank details. Payments to this supplier stay on hold until the branch Manager approves the new details. Do not pay the old or the new account meanwhile.</p>`);
    if (isAcc()) {
      if (p.status === 'requested') {
        foot = tot > LIMIT ? notice('info', 'Needs the branch Manager', `<p>Counted together this is ${F.inr(tot)}, above ₹50,000.</p>`)
          : `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${primaryBig('Approve payment', 'money-sp-approve', { 'data-id': p.id })}${toggleBtn('Return to the department', 'sp-ret-' + p.id)}</div>${reasonForm('sp-ret-' + p.id, 'money-sp-return', p.id, 'Return the payment request', 'Why are you returning it?', '10 to 500 characters. The department reads it.', 'Return with this reason')}</div>`;
      }
      if (p.status === 'approved') foot = `<div class="flex flex-wrap gap-2">${primaryBig('Record payment', 'money-sp-pay', { 'data-id': p.id })}</div><p class="m-0 text-sm text-quiet">Pay from the bank first, then record the bank reference and the proof here.</p>`;
      if (p.status === 'paid') {
        foot = p.paidBy === ME()
          ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>You recorded this payment, so another Accounts person must verify it.</li></ul>${blocked('Verify payment', 'You recorded this payment. Another Accounts person must do this step.', 'spv-' + p.id)}`
          : `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${primaryBig('Verify payment', 'money-sp-verify', { 'data-id': p.id })}${toggleBtn('Not in the bank statement', 'sp-rej-' + p.id)}</div>${reasonForm('sp-rej-' + p.id, 'money-sp-reject', p.id, 'Payment not found', 'What did you find?', '10 to 500 characters. The person who recorded it reads it.', 'Send back with this reason')}</div>`;
      }
    }
    return article({
      label: `Supplier payment ${p.id} ${F.inr(p.amount)}`, anchor: p.id,
      head: `${dealLink(p.deal)} <span class="font-normal text-copy">· ${E(p.id)} · ${E(sup.name)}</span>`,
      badge: badge(tone, text, 'Payment'),
      body: body + (notes.length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet">${notes.map((n) => `<li>${n}</li>`).join('')}</ul>` : ''),
      foot,
    });
  }
  TN.act('money-sp-approve', (el) => {
    const p = D.supplierPayments.find((x) => x.id === el.dataset.id);
    if (needsManager(p)) { p.status = 'waiting_manager'; TN.toast('Above ₹50,000 counted together: sent to the branch Manager.'); return TN.refresh(); }
    if (bankChanged(p.supplier)) { p.status = 'on_hold'; return TN.refresh(); }
    p.status = 'approved'; p.approvedBy = ME();
    pushNotice([p.raisedBy], `Payment ${p.id} to ${TN.supplier(p.supplier).name} (${F.inr(p.amount)}) approved by Accounts. Not paid yet.`, p.deal);
    TN.toast(`${p.id} approved. Record the payment after paying from the bank.`); TN.refresh();
  });
  TN.act('money-sp-return', (form) => {
    const r = readReason(form); if (!r) return;
    const p = D.supplierPayments.find((x) => x.id === form.dataset.id); p.status = 'returned'; p.returnReason = r; p.returnedBy = ME();
    pushNotice([p.raisedBy], `Accounts returned payment request ${p.id}: ${r}`, p.deal);
    TN.toast('Returned to the department with your reason.'); TN.refresh();
  });
  TN.act('money-sp-reject', (form) => {
    const r = readReason(form); if (!r) return;
    const p = D.supplierPayments.find((x) => x.id === form.dataset.id); p.status = 'approved'; p.note = `Sent back by ${TN.me().name}: ${r}`; delete p.bankRef; const by = p.paidBy; delete p.paidBy; delete p.paidAt;
    pushNotice([by === 'checker' ? 'checker' : 'accounts'], `Payment ${p.id} was not found in the bank statement: ${r}`, p.deal, '#/app/accounts/supplier-payments?tab=approved');
    TN.toast('Sent back. The payment is To pay again.'); TN.refresh();
  });
  TN.act('money-sp-verify', (el) => {
    const p = D.supplierPayments.find((x) => x.id === el.dataset.id);
    if (p.paidBy === ME()) return TN.toast('You recorded this payment. Another Accounts person must verify it.', 'danger');
    p.status = 'verified'; p.verifiedBy = ME();
    pushNotice([p.raisedBy], `Payment ${p.id} to ${TN.supplier(p.supplier).name} is paid and verified (${p.bankRef}).`, p.deal);
    TN.toast(`${p.id} verified.`); TN.refresh();
  });
  TN.act('money-sp-pay', (el) => openPay(el.dataset.id));
  function openPay(id, values = {}, errors) {
    const p = D.supplierPayments.find((x) => x.id === id); const sup = TN.supplier(p.supplier);
    drawerForm({
      title: 'Record supplier payment', formId: 'sp-pay', act: 'money-sp-pay-save', data: { 'data-id': id }, submit: 'Record payment',
      description: `${p.id} · ${sup.name} · ${F.inr(p.amount)}`,
      body: (v, er) => `${notice('info', null, '<p>Pay from the bank first. The CRM does not send money; it records what you paid.</p>')}
        ${field({ id: 'sp-pay-from', name: 'from', label: 'Paid from', kind: 'select', value: v.from || COMPANY_ACCOUNTS[0], options: COMPANY_ACCOUNTS.slice(0, 2), error: er.from })}
        ${grid2(field({ id: 'sp-pay-amount', name: 'amount', label: 'Amount paid (₹)', hint: `Must equal the approved ${F.inr(p.amount)}.`, value: v.amount ?? String(p.amount), inputmode: 'numeric', error: er.amount }) + field({ id: 'sp-pay-date', name: 'date', label: 'Paid on', kind: 'date', value: v.date || TN.TODAY, error: er.date }))}
        ${field({ id: 'sp-pay-ref', name: 'ref', label: 'Bank reference (UTR)', hint: '6 to 40 letters, digits, / or -. The same reference cannot be recorded twice.', value: v.ref || '', error: er.ref })}
        ${field({ id: 'sp-pay-proof', name: 'proof', label: 'Payment proof', kind: 'file', hint: 'Bank advice or screenshot. PDF, JPG, PNG or WebP, up to 4 MB. Kept private; only Accounts can open it.', error: er.proof })}
        ${summary([['Pay to', `${E(sup.name)} · bank details approved`], ['Approved', `${E(name(p.approvedBy))}`]])}
        <p class="m-0 text-sm text-quiet">A different Accounts person verifies it against the bank statement.</p>`,
    }, values, errors);
  }
  TN.act('money-sp-pay-save', (form) => {
    const p = D.supplierPayments.find((x) => x.id === form.dataset.id); const v = fval(form); const er = {};
    const file = form.querySelector('[name=proof]').files[0];
    if (rupees(v.amount) !== p.amount) er.amount = `Enter exactly ${F.inr(p.amount)}. A part payment needs its own request.`;
    if (!v.date || v.date > TN.TODAY) er.date = 'Enter the date you paid, not a future date.';
    const ref = String(v.ref || '').trim().toUpperCase();
    if (!/^[A-Z0-9/ -]{6,40}$/.test(ref)) er.ref = 'Enter the bank reference: 6 to 40 letters, digits, / or -.';
    else if (D.supplierPayments.some((x) => x.bankRef && x.bankRef.toUpperCase().includes(ref))) er.ref = 'This reference is already recorded on another payment.';
    if (!file) er.proof = 'Upload the payment proof.';
    delete v.proof;
    if (Object.keys(er).length) return openPay(p.id, v, er);
    Object.assign(p, { status: 'paid', paidBy: ME(), paidAt: v.date, bankRef: ref, fromAccount: v.from, proof: file.name });
    pushNotice(['accounts', 'checker'].filter((r) => r !== TN.role), `Supplier payment ${p.id} paid by ${TN.me().name}. A different person must verify it.`, p.deal, '#/app/accounts/supplier-payments?tab=paid');
    pushNotice([p.raisedBy], `${TN.supplier(p.supplier).name} paid ${F.inr(p.amount)} (${ref}) for ${p.id}.`, p.deal);
    TN.closeOverlay(); TN.toast(`Payment recorded for ${p.id}. Another Accounts person verifies it.`); TN.refresh();
  });

  /* ==================================================================
     3. Supplier invoices and credit notes
     ================================================================== */
  const SI_STATUS = { uploaded: ['info', 'Waiting for Accounts check'], accepted: ['success', 'Accepted'], returned: ['danger', 'Returned to Purchase'] };
  function missingInvoices() {
    const out = [];
    D.deals.filter((d) => d.end < TN.TODAY && d.tripStatus !== 'closed').forEach((d) => {
      TN.servicesOf(d.id).filter((s) => s.dept === 'purchase' && s.cost).forEach((s) => {
        if (!D.supplierInvoices.some((x) => x.service === s.id && x.kind === 'Invoice' && x.status !== 'returned')) out.push({ d, s });
      });
    });
    return out;
  }
  function siPage(p, q) {
    const tab = q.tab || 'uploaded';
    const missing = missingInvoices();
    let content;
    if (tab === 'missing') {
      content = missing.length ? finTable(`${F.plural(missing.length, 'invoice')} missing · trips already ended`, [['Deal'], ['Service'], ['Supplier'], ['Trip ended'], ['Cost', 1], ['Next step']], missing.map(({ d, s }) => [
        `${dealLink(d.id)}<span class="fin-sub">${E(d.title)}</span>`, E(s.title), E(TN.supplier(s.supplier).name), `${F.date(d.end)}<span class="fin-sub">${-F.daysFrom(d.end)} days ago</span>`, F.inr(s.cost),
        isAcc() ? `<button type="button" class="${LINK_STRONG} cursor-pointer border-0 bg-transparent p-0" data-act="money-si-remind" data-s="${E(s.id)}">Remind Purchase</button><span class="fin-sub"><button type="button" class="${LINK} cursor-pointer border-0 bg-transparent p-0 text-sm" data-act="money-si-upload" data-s="${E(s.id)}">Upload one sent to Accounts</button></span>` : quiet('Purchase uploads it'),
      ])) : empty('No invoice missing', 'After a trip ends, every hotel, transfer and activity needs the supplier’s original invoice.');
    } else {
      const rows = D.supplierInvoices.filter((x) => tab === 'all' || x.status === tab);
      content = rows.length ? cardList('Supplier invoices', rows.map(siCard)) : empty('Nothing to check', 'Originals uploaded by Purchase appear here.');
    }
    return pageHeader('Supplier invoices', 'Original invoices and credit notes from suppliers, uploaded by Purchase. Check each against the cost and the payment, then accept or return it. Tally keeps the official accounts and GST.')
      + tabs('Supplier invoice filters', [
        { label: 'To check', href: '#/app/accounts/supplier-invoices?tab=uploaded', count: D.supplierInvoices.filter((x) => x.status === 'uploaded').length, current: tab === 'uploaded' },
        { label: 'Missing after the trip', href: '#/app/accounts/supplier-invoices?tab=missing', count: missing.length, current: tab === 'missing' },
        { label: 'Accepted', href: '#/app/accounts/supplier-invoices?tab=accepted', current: tab === 'accepted' },
        { label: 'Returned', href: '#/app/accounts/supplier-invoices?tab=returned', current: tab === 'returned' },
        { label: 'All', href: '#/app/accounts/supplier-invoices?tab=all', current: tab === 'all' },
      ]) + content;
  }
  function siCard(x) {
    const s = TN.service(x.service); const sup = TN.supplier(x.supplier);
    const pays = D.supplierPayments.filter((p) => p.service === x.service && ['paid', 'verified'].includes(p.status));
    const paid = pays.reduce((t, p) => t + p.amount, 0);
    let check;
    if (x.kind === 'Credit note') {
      const rf = D.refunds.find((r) => r.creditNote === x.id || (r.deal === x.deal && r.kind === 'Supplier recovery' && r.amount === x.amount));
      check = rf ? `${pill('ok', 'Matches the supplier recovery', 'Check', '●')}<span class="block text-sm text-quiet">${E(rf.id)} · ${F.inr(rf.amount)} to come back from ${E(sup.name)}</span>` : pill('warn', 'No supplier recovery recorded for it', 'Check', '!');
    } else {
      const diffCost = x.amount - (s.cost || 0); const diffPaid = x.amount - paid;
      check = [
        diffCost === 0 ? pill('ok', `Matches the cost ${F.inr(s.cost)}`, 'Cost check') : pill('warn', `${diffCost > 0 ? 'Above' : 'Below'} the cost ${F.inr(s.cost)} by ${F.inr(Math.abs(diffCost))}`, 'Cost check', '!'),
        paid === 0 ? pill('neutral', 'Not paid yet', 'Payment check') : diffPaid === 0 ? pill('ok', `Matches payments ${F.inr(paid)}`, 'Payment check') : pill('warn', `Payments ${F.inr(paid)} differ by ${F.inr(Math.abs(diffPaid))}`, 'Payment check', '!'),
      ].join(' ');
    }
    let foot = '';
    if (isAcc() && x.status === 'uploaded') {
      foot = x.by === ME() ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>You uploaded this original, so another Accounts person must check it.</li></ul>`
        : `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${primaryBig(x.kind === 'Credit note' ? 'Accept credit note' : 'Accept invoice', 'money-si-accept', { 'data-id': x.id })}${toggleBtn('Return to Purchase', 'si-ret-' + x.id)}</div>${reasonForm('si-ret-' + x.id, 'money-si-return', x.id, 'Return the supplier original', 'Why are you returning it?', '10 to 500 characters. Purchase reads it.', 'Return with this reason')}</div>`;
    }
    return article({
      label: `${x.kind} ${x.number}`, anchor: x.id,
      head: `${dealLink(x.deal)} <span class="font-normal text-copy">· ${E(x.kind)} ${E(x.number)} · ${E(sup.name)}</span>`,
      badge: badge(...SI_STATUS[x.status], x.kind),
      body: summary([
        ['Amount', `<strong>${F.inr(x.amount)}</strong>${x.gst ? ` · GST shown on it ${F.inr(x.gst)}` : ' · no GST shown'}`],
        ['For', `${E(s.title)}<span class="block text-sm text-quiet">${E(s.detail)}</span>`],
        ['Dated', F.date(x.date)],
        ['File', fileLink(x.file)],
        ['Check', check],
        ['Uploaded', `${E(name(x.by))}${x.by === 'purchase' ? ' (Purchase)' : ' (Accounts)'}`],
        x.checkedBy ? ['Checked', E(name(x.checkedBy))] : null,
        x.returnReason ? ['Returned because', E(x.returnReason)] : null,
      ]) + (x.note ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>${E(x.note)}</li></ul>` : ''),
      foot,
    });
  }
  TN.act('money-si-accept', (el) => {
    const x = D.supplierInvoices.find((i) => i.id === el.dataset.id);
    if (x.by === ME()) return TN.toast('You uploaded this original. Another Accounts person must check it.', 'danger');
    x.status = 'accepted'; x.checkedBy = ME();
    TN.toast(`${x.kind} ${x.number} accepted. It goes in the next Tally export.`); TN.refresh();
  });
  TN.act('money-si-return', (form) => {
    const r = readReason(form); if (!r) return;
    const x = D.supplierInvoices.find((i) => i.id === form.dataset.id); x.status = 'returned'; x.returnReason = r; x.checkedBy = ME();
    pushNotice(['purchase'], `Accounts returned ${x.kind.toLowerCase()} ${x.number}: ${r}`, x.deal);
    TN.toast('Returned to Purchase with your reason.'); TN.refresh();
  });
  TN.act('money-si-remind', (el) => {
    const s = TN.service(el.dataset.s); const d = TN.deal(s.deal);
    pushNotice(['purchase'], `Original invoice missing for ${TN.supplier(s.supplier).name} (trip ended ${F.day(d.end)}). Please upload it.`, d.id);
    TN.toast('Reminder sent to Purchase.');
  });
  TN.act('money-si-upload', (el) => openUpload(el.dataset.s));
  function openUpload(sid, values = {}, errors) {
    const s = TN.service(sid); const sup = TN.supplier(s.supplier);
    drawerForm({
      title: 'Upload a supplier original', formId: 'si-up', act: 'money-si-upload-save', data: { 'data-s': sid }, submit: 'Upload original',
      description: `${sup.name} · ${s.title}`,
      body: (v, er) => `${notice('info', null, '<p>For an original the supplier sent straight to Accounts. A different Accounts person checks it.</p>')}
        ${grid2(field({ id: 'si-up-number', name: 'number', label: 'Invoice number', value: v.number || '', error: er.number }) + field({ id: 'si-up-date', name: 'date', label: 'Invoice date', kind: 'date', value: v.date || '', error: er.date }))}
        ${grid2(field({ id: 'si-up-amount', name: 'amount', label: 'Amount on the invoice (₹)', value: v.amount || '', inputmode: 'numeric', hint: `Cost recorded by Purchase: ${F.inr(s.cost)}.`, error: er.amount }) + field({ id: 'si-up-gst', name: 'gst', label: 'GST shown on it (₹)', optional: true, value: v.gst || '', inputmode: 'numeric', hint: 'As printed. The CRM does not work out GST.' }))}
        ${field({ id: 'si-up-file', name: 'file', label: 'File', kind: 'file', hint: 'PDF, JPG, PNG or WebP, up to 4 MB.', error: er.file })}`,
    }, values, errors);
  }
  TN.act('money-si-upload-save', (form) => {
    const s = TN.service(form.dataset.s); const v = fval(form); const er = {}; const file = form.querySelector('[name=file]').files[0];
    if (String(v.number || '').trim().length < 3) er.number = 'Enter the invoice number as printed.';
    if (!v.date || v.date > TN.TODAY) er.date = 'Enter the invoice date.';
    if (!rupees(v.amount)) er.amount = 'Enter the amount in whole rupees.';
    if (!file) er.file = 'Choose the invoice file.';
    delete v.file;
    if (Object.keys(er).length) return openUpload(form.dataset.s, v, er);
    const id = 'SI-00' + (30 + D.supplierInvoices.length);
    D.supplierInvoices.unshift({ id, deal: s.deal, service: form.dataset.s, supplier: s.supplier, kind: 'Invoice', number: v.number.trim(), amount: rupees(v.amount), gst: rupees(v.gst) || 0, date: v.date, file: file.name, status: 'uploaded', by: ME() });
    TN.closeOverlay(); TN.toast('Original uploaded. A different Accounts person checks it.'); TN.go('/app/accounts/supplier-invoices?tab=uploaded');
  });

  /* ==================================================================
     4. Customer documents: Invoice, Advance Invoice, hotel voucher
     ================================================================== */
  const DOC_STATUS = { draft: ['neutral', 'Draft: not sent for approval'], waiting_accounts: ['info', 'Waiting for Accounts approval'], approved: ['warning', 'Approved: download and send it'], sent: ['success', 'Sent by staff'], returned: ['danger', 'Returned with a reason'] };
  function nextNumber(kind) {
    if (kind === 'Hotel voucher') return null;
    const adv = kind === 'Advance Invoice'; const rx = adv ? /^HC\/JDH\/ADV\/26-27\/(\d{4})$/ : /^HC\/JDH\/26-27\/(\d{4})$/;
    const max = D.documents.map((d) => (d.id.match(rx) || [])[1]).filter(Boolean).map(Number).reduce((a, b) => Math.max(a, b), 0);
    return `HC/JDH/${adv ? 'ADV/' : ''}26-27/${String(max + 1).padStart(4, '0')}`;
  }
  function docPage(p, q) {
    const tab = q.tab || 'waiting_accounts';
    const rows = D.documents.filter((d) => tab === 'all' || d.status === tab || (tab === 'draft' && d.status === 'returned'));
    return pageHeader('Invoices and vouchers', 'Invoice, Advance Invoice and hotel voucher for customers. Accounts approves each one; then the salesperson downloads or prints it and sends it to the customer. The tax invoice is issued from Tally.', isAcc() ? btn('Create document', { variant: 'primary', act: 'money-doc-new' }) : '')
      + `<div class="mb-5 flex flex-col gap-2 font-sans text-base text-copy [&_p]:m-0" data-slot="finance-header-lines"><p class="fin-disclaimer" role="note"><span aria-hidden="true">ⓘ </span>Invoice and Advance Invoice are not tax invoices. The tax invoice is issued from Tally.</p></div>`
      + tabs('Document filters', [
        { label: 'To approve', href: '#/app/accounts/documents?tab=waiting_accounts', count: D.documents.filter((d) => d.status === 'waiting_accounts').length, current: tab === 'waiting_accounts' },
        { label: 'Approved, not sent', href: '#/app/accounts/documents?tab=approved', count: D.documents.filter((d) => d.status === 'approved').length, current: tab === 'approved' },
        { label: 'Drafts', href: '#/app/accounts/documents?tab=draft', count: D.documents.filter((d) => d.status === 'draft' || d.status === 'returned').length, current: tab === 'draft' },
        { label: 'Sent', href: '#/app/accounts/documents?tab=sent', current: tab === 'sent' },
        { label: 'All', href: '#/app/accounts/documents?tab=all', current: tab === 'all' },
      ])
      + (rows.length ? cardList('Documents', rows.map(docCard)) : empty('Nothing here', tab === 'waiting_accounts' ? 'Documents sent for approval appear here.' : 'No document is in this state.', 'file-text'));
  }
  function docCard(x) {
    const d = TN.deal(x.deal); const c = TN.customer(d.customer);
    const open = btn('Preview', { variant: 'secondary', size: 'lg', icon: 'file-text', act: 'money-doc-open', attrs: { 'data-id': x.id } });
    let foot = open;
    if (isAcc()) {
      if (x.status === 'waiting_accounts') {
        foot = x.createdBy === ME() || x.submittedBy === ME()
          ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>You made this document, so another Accounts person must approve it.</li></ul><div class="flex flex-wrap gap-2">${open}</div>`
          : `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${primaryBig('Approve document', 'money-doc-approve', { 'data-id': x.id })}${open}${toggleBtn('Return with a reason', 'doc-ret-' + x.id)}</div>${reasonForm('doc-ret-' + x.id, 'money-doc-return', x.id, 'Return the document', 'What needs fixing?', '10 to 500 characters. The person who made it reads it.', 'Return with this reason')}</div>`;
      } else if (x.status === 'draft' || x.status === 'returned') {
        foot = `<div class="flex flex-wrap gap-2">${primaryBig('Send for approval', 'money-doc-submit', { 'data-id': x.id })}${open}</div>`;
      }
    }
    if (x.status === 'approved') {
      foot = `<div class="flex flex-wrap gap-2">${btn('Download PDF', { variant: 'secondary', size: 'lg', icon: 'download', act: 'money-doc-pdf', attrs: { 'data-id': x.id } })}${btn('Print', { variant: 'secondary', size: 'lg', icon: 'printer', act: 'money-doc-print', attrs: { 'data-id': x.id } })}${primaryBig('Mark as sent', 'money-doc-sent', { 'data-id': x.id })}</div><p class="m-0 text-sm text-quiet">The CRM does not message customers yet. Send it yourself, then mark it as sent.</p>`;
    }
    const s = x.service ? TN.service(x.service) : null;
    return article({
      label: `${x.kind} ${x.id}`, anchor: x.id,
      head: `${dealLink(x.deal)} <span class="font-normal text-copy">· ${E(x.kind)} ${E(x.id)}</span>`,
      badge: badge(...DOC_STATUS[x.status], 'Document'),
      body: summary([
        ['For', `${E(c.name)} · ${E(d.title)}`],
        x.amount != null ? ['Amount', `<strong>${F.inr(x.amount)}</strong>${x.kind === 'Advance Invoice' ? ' · against money received' : ' · whole trip'}`] : ['Hotel', `${E(s.title)} · confirmation ${E(s.confirmationNo || 'not recorded')}`],
        ['Dated', F.date(x.date)],
        ['Made by', E(name(x.createdBy))],
        x.approvedBy ? ['Approved', E(name(x.approvedBy))] : null,
        x.sentBy ? ['Sent', `${E(name(x.sentBy))}${x.sentHow ? ` · ${E(x.sentHow)}` : ''}${x.sentAt ? ` · ${F.date(x.sentAt)}` : ''}`] : null,
        x.returnReason ? ['Returned because', E(x.returnReason)] : null,
      ]),
      foot,
    });
  }
  TN.act('money-doc-open', (el) => TN.openDocument(el.dataset.id));
  TN.act('money-doc-approve', (el) => {
    const x = D.documents.find((d) => d.id === el.dataset.id);
    if (x.createdBy === ME() || x.submittedBy === ME()) return TN.toast('You made this document. Another Accounts person must approve it.', 'danger');
    x.status = 'approved'; x.approvedBy = ME();
    pushNotice([TN.deal(x.deal).owner === 'sales2' ? 'sales' : TN.deal(x.deal).owner], `${x.kind} ${x.id} for ${x.deal} is approved. Download it from the Deal’s Documents and send it to the customer.`, x.deal);
    TN.toast(`${x.kind} ${x.id} approved.`); TN.refresh();
  });
  TN.act('money-doc-return', (form) => {
    const r = readReason(form); if (!r) return;
    const x = D.documents.find((d) => d.id === form.dataset.id); x.status = 'returned'; x.returnReason = r;
    pushNotice([x.createdBy === 'sales2' ? 'sales' : x.createdBy], `Accounts returned ${x.kind} ${x.id}: ${r}`, x.deal);
    TN.toast('Returned with your reason.'); TN.refresh();
  });
  TN.act('money-doc-submit', (el) => { const x = D.documents.find((d) => d.id === el.dataset.id); x.status = 'waiting_accounts'; x.submittedBy = ME(); delete x.returnReason; TN.toast(`${x.id} sent for approval. A different Accounts person approves it.`); TN.refresh(); });
  TN.act('money-doc-sent', (el) => openSent(el.dataset.id));
  function openSent(id, values = {}, errors) {
    const x = D.documents.find((d) => d.id === id); const c = TN.customer(TN.deal(x.deal).customer);
    drawerForm({
      title: 'Mark as sent', formId: 'doc-sent', act: 'money-doc-sent-save', data: { 'data-id': id }, submit: 'Mark as sent', description: `${x.kind} ${x.id}`,
      body: (v, er) => `${field({ id: 'doc-sent-how', name: 'how', label: 'How did you send it?', kind: 'select', value: v.how || 'WhatsApp from the office phone', options: ['WhatsApp from the office phone', 'E-mail from my work address', 'Handed over at the branch'] })}
        ${field({ id: 'doc-sent-to', name: 'to', label: 'Sent to', value: v.to ?? c.name, hint: 'The customer or the person they named.', error: er.to })}
        ${field({ id: 'doc-sent-date', name: 'date', label: 'Sent on', kind: 'date', value: v.date || TN.TODAY, error: er.date })}`,
    }, values, errors);
  }
  TN.act('money-doc-sent-save', (form) => {
    const x = D.documents.find((d) => d.id === form.dataset.id); const v = fval(form); const er = {};
    if (String(v.to || '').trim().length < 2) er.to = 'Enter who you sent it to.';
    if (!v.date || v.date > TN.TODAY) er.date = 'Enter the date you sent it.';
    if (Object.keys(er).length) return openSent(x.id, v, er);
    Object.assign(x, { status: 'sent', sentBy: ME(), sentHow: `${v.how} to ${v.to.trim()}`, sentAt: v.date });
    TN.closeOverlay(); TN.toast(`${x.id} marked as sent.`); TN.refresh();
  });
  TN.act('money-doc-new', () => openNewDoc());
  function openNewDoc(values = {}, errors) {
    const deals = D.deals.filter((d) => d.accountsReview === 'approved' && d.tripStatus !== 'closed');
    const dealId = values.deal || deals[0].id; const kind = values.kind || 'Invoice';
    const recs = D.receipts.filter((r) => r.deal === dealId && r.status === 'verified');
    const hotels = TN.servicesOf(dealId).filter((s) => (s.kind === 'hotel' || s.kind === 'package') && s.confirmationNo);
    drawerForm({
      title: 'Create document', formId: 'doc-new', act: 'money-doc-new-save', submit: 'Create and send for approval',
      description: 'Made from the approved booking. Lines and amounts come from the Deal; nothing is typed again.',
      body: (v, er) => `${field({ id: 'doc-new-deal', name: 'deal', label: 'Deal', kind: 'select', value: dealId, change: 'money-doc-new-refresh', options: deals.map((d) => [d.id, `${d.id} · ${d.title}`]) })}
        ${field({ id: 'doc-new-kind', name: 'kind', label: 'Document', kind: 'select', value: kind, change: 'money-doc-new-refresh', options: ['Invoice', 'Advance Invoice', 'Hotel voucher'] })}
        ${kind === 'Advance Invoice' ? field({ id: 'doc-new-receipt', name: 'receipt', label: 'Against which verified receipt?', kind: 'select', value: v.receipt || '', error: er.receipt, options: [['', recs.length ? 'Choose a receipt' : 'No verified receipt on this Deal'], ...recs.map((r) => [r.id, `${r.id} · ${F.inr(r.amount)} · ${F.day(r.date)} · ${r.mode}`])] }) : ''}
        ${kind === 'Hotel voucher' ? field({ id: 'doc-new-service', name: 'service', label: 'Which confirmed stay?', kind: 'select', value: v.service || '', error: er.service, options: [['', hotels.length ? 'Choose a stay' : 'No confirmed stay on this Deal yet'], ...hotels.map((s) => [s.id, `${s.title} · ${s.confirmationNo}`])] }) : ''}
        ${summary([['Number', kind === 'Hotel voucher' ? 'Given when approved' : E(nextNumber(kind))], ['Bill To', E(TN.customer(TN.deal(dealId).customer).name)]])}
        <p class="m-0 text-sm text-quiet">${kind === 'Hotel voucher' ? 'A voucher shows the stay, guests and meal plan. It never shows prices.' : 'Marked “Not a tax invoice. The tax invoice is issued from Tally.”'} A different Accounts person approves it.</p>`,
    }, values, errors);
  }
  TN.act('money-doc-new-refresh', () => { const f = document.getElementById('doc-new'); if (f) openNewDoc(fval(f)); });
  TN.act('money-doc-new-save', (form) => {
    const v = fval(form); const er = {}; const d = TN.deal(v.deal);
    if (v.kind === 'Advance Invoice' && !v.receipt) er.receipt = 'Choose the verified receipt it acknowledges.';
    if (v.kind === 'Hotel voucher' && !v.service) er.service = 'Choose the confirmed stay.';
    if (Object.keys(er).length) return openNewDoc(v, er);
    let doc;
    if (v.kind === 'Hotel voucher') {
      const n = D.documents.filter((x) => x.deal === d.id && x.kind === 'Hotel voucher').length + 1;
      doc = { id: `VCH-${d.id.slice(3)}-${String(n).padStart(2, '0')}`, deal: d.id, kind: 'Hotel voucher', service: v.service, date: TN.TODAY };
    } else if (v.kind === 'Advance Invoice') {
      const r = D.receipts.find((x) => x.id === v.receipt);
      doc = { id: nextNumber('Advance Invoice'), deal: d.id, kind: 'Advance Invoice', amount: r.amount, receipt: r.id, date: TN.TODAY };
    } else doc = { id: nextNumber('Invoice'), deal: d.id, kind: 'Invoice', amount: d.sellingPrice, date: TN.TODAY };
    Object.assign(doc, { status: 'waiting_accounts', createdBy: ME() });
    D.documents.unshift(doc);
    TN.closeOverlay(); TN.toast(`${doc.kind} ${doc.id} created. Another Accounts person approves it.`); TN.go('/app/accounts/documents?tab=waiting_accounts');
  });

  /* ---- A4 document (TN.openDocument) ---- */
  const DOC_LINE_KIND = { hotel: 'Hotel', transfer: 'Transfers', activity: 'Tours and tickets', flight: 'Flights', visa: 'Visa', passport: 'Passport services', package: 'Land package' };
  const nightsBetween = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  function words(n) {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = (x) => (x < 20 ? a[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
    const three = (x) => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x));
    if (!n) return 'Zero';
    const cr = Math.floor(n / 1e7), lk = Math.floor((n % 1e7) / 1e5), th = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
    return [cr ? two(cr) + ' Crore' : '', lk ? two(lk) + ' Lakh' : '', th ? two(th) + ' Thousand' : '', rest ? three(rest) : ''].filter(Boolean).join(' ') + ' Rupees';
  }
  /** Price lines per service, shared out of the Deal's selling price in proportion to each cost estimate. */
  function docLines(deal) {
    const svc = TN.servicesOf(deal.id);
    const basis = svc.map((s) => s.budget || 0); const totB = basis.reduce((a, b) => a + b, 0) || 1;
    let left = deal.sellingPrice;
    return svc.map((s, i) => {
      const amt = i === svc.length - 1 ? left : Math.round((deal.sellingPrice * basis[i]) / totB / 100) * 100;
      left -= amt;
      const pax = deal.adults + deal.children + deal.infants;
      let detail = s.detail;
      if (s.kind === 'flight') detail = `${s.title.replace(' and back', ', return')} · ${F.plural(pax, 'passenger')} · PNR ${s.pnr || 'to follow'}`;
      if (s.kind === 'visa') detail = `${s.title} · ${F.plural(pax, 'traveller')} × ${F.inr(Math.round(amt / pax))}`;
      if (s.kind === 'hotel') detail = `${s.detail} · ${F.day(s.start)} to ${F.day(s.end)}`;
      return { kind: DOC_LINE_KIND[s.kind] || s.kind, title: s.kind === 'flight' || s.kind === 'visa' ? '' : s.title, detail, amount: amt };
    });
  }
  function docModel(id) {
    const x = D.documents.find((d) => d.id === id); if (!x) return null;
    const deal = TN.deal(x.deal); const c = TN.customer(deal.customer);
    const pax = `${deal.adults} adults${deal.children ? `, ${F.plural(deal.children, 'child', 'children')}` : ''}${deal.infants ? `, ${F.plural(deal.infants, 'infant')}` : ''}`;
    const received = D.receipts.filter((r) => r.deal === deal.id && r.status === 'verified');
    return { x, deal, c, pax, received };
  }
  function docHtml(id) {
    const m = docModel(id); if (!m) return '';
    const { x, deal, c, pax, received } = m;
    const head = (label, num, extra) => `<header class="doc-head"><div><p class="doc-brand">Trip<b>Navigate</b></p><p class="doc-tagline">We make travel effortless.</p></div><div class="doc-meta"><p><strong>${E(label)}</strong> ${E(num)}</p><p>Date ${E(F.date(x.date))}</p>${extra || ''}</div></header><div class="doc-bar" aria-hidden="true"></div>`;
    const billTo = `<section class="doc-section doc-cols" aria-label="Bill To and trip"><div><h4 class="doc-label">Bill To</h4><p class="doc-strong">${E(c.name)}</p>${c.business ? `<p class="doc-small">Attn. ${E(c.contact)} · GSTIN ${E(c.gstin)}</p>` : ''}<p class="doc-small">${E(c.city)}, Rajasthan</p><p class="doc-small">${E(c.phone)} · ${E(c.email)}</p></div><div><h4 class="doc-label">Trip</h4><p class="doc-strong">${E(deal.destination)}</p><p class="doc-small">${E(F.date(deal.start))} to ${E(F.date(deal.end))} · ${deal.nights} nights · ${E(pax)}</p><p class="doc-small">Booking ${E(deal.id)}</p></div></section>`;
    const foot = (right) => `<footer class="doc-foot"><p class="doc-legal">${E(COMPANY.legal)} · Regd. office: ${E(COMPANY.office)} · PAN ${E(COMPANY.pan)} · GSTIN ${E(COMPANY.gstin)} (${E(COMPANY.state)})</p><span>Prepared by ${E(name(x.createdBy))}, ${E(COMPANY.branchLine)}</span><span>${E(right)}</span></footer>`;
    if (x.kind === 'Hotel voucher') {
      const s = TN.service(x.service); const sup = TN.supplier(s.supplier);
      const parts = s.detail.split('·').map((z) => z.trim()); const meal = parts.length > 1 ? parts[parts.length - 1] : 'as in the package'; const rooms = parts.length > 2 ? parts[1] : parts[0];
      return `<article class="tn-doc" id="money-document" aria-label="Hotel voucher ${E(x.id)}">${head('Hotel voucher', x.id, `<p>Booking ${E(deal.id)}</p>`)}<h2 class="doc-title">${E(s.title)}</h2><p class="doc-sub">${E(sup ? sup.city : '')} · ${E(F.date(s.start))} to ${E(F.date(s.end))} · ${F.plural(nightsBetween(s.start, s.end), 'night')}</p>
        <table class="doc-table doc-section"><caption class="doc-label">Stay</caption><tbody><tr><th scope="row">Confirmation number</th><td>${E(s.confirmationNo || 'To follow')}</td></tr><tr><th scope="row">Lead guest</th><td>${E(c.business ? c.contact : c.name)}</td></tr><tr><th scope="row">Guests</th><td>${E(pax)}</td></tr><tr><th scope="row">Check-in</th><td>${E(F.date(s.start))}, from 2:00 pm</td></tr><tr><th scope="row">Check-out</th><td>${E(F.date(s.end))}, by 11:00 am</td></tr><tr><th scope="row">Rooms</th><td>${E(rooms)}</td></tr><tr><th scope="row">Meal plan</th><td>${E(meal.charAt(0).toUpperCase() + meal.slice(1))}</td></tr></tbody></table>
        <section class="doc-section doc-note" aria-label="At the hotel"><p>Please show this voucher and a photo ID for every adult at check-in. The stay is paid by ${E(COMPANY.legal)}; extras such as minibar, laundry and room service are paid at the hotel.</p></section>
        <section class="doc-section" aria-label="Help"><h3>Help during the trip</h3><p>${E(name(deal.owner))}, ${E(COMPANY.branchLine)}</p></section>${foot('Voucher · no prices shown')}</article>`;
    }
    const isAdv = x.kind === 'Advance Invoice';
    const lines = docLines(deal);
    const totalRecv = received.reduce((s, r) => s + r.amount, 0);
    const body = isAdv
      ? (() => { const r = D.receipts.find((y) => y.id === x.receipt) || received.find((y) => y.amount === x.amount) || received[0]; return `<table class="doc-table doc-section"><caption class="doc-label">Money received</caption><thead><tr><th scope="col">Received</th><th scope="col">How</th><th scope="col">Reference</th><th scope="col" class="num">Amount</th></tr></thead><tbody><tr><td>${E(F.date(r ? r.date : x.date))}</td><td>${E(r ? r.mode : '')}</td><td>${E(r ? r.ref : '')}</td><td class="num">${F.inr(x.amount)}</td></tr></tbody></table>
        <table class="doc-table doc-section"><tbody><tr><th scope="row">Trip price</th><td class="num">${F.inr(deal.sellingPrice)}</td></tr><tr><th scope="row">Received with this advance</th><td class="num">${F.inr(x.amount)}</td></tr><tr><th scope="row">Balance to pay before travel</th><td class="num doc-strong">${F.inr(Math.max(0, deal.sellingPrice - totalRecv))}</td></tr></tbody></table>
        <p class="doc-small doc-section">${E(words(x.amount))} received with thanks. Advance against the trip above.</p>`; })()
      : `<table class="doc-table doc-section"><caption class="doc-label">What you pay for</caption><thead><tr><th scope="col">Service</th><th scope="col">Details</th><th scope="col" class="num">Amount</th></tr></thead><tbody>${lines.map((l) => `<tr><th scope="row">${E(l.kind)}</th><td>${l.title ? `<span class="doc-strong">${E(l.title)}</span><br>` : ''}<span class="doc-small">${E(l.detail)}</span></td><td class="num">${F.inr(l.amount)}</td></tr>`).join('')}<tr><th scope="row" colspan="2">Total for the trip</th><td class="num doc-strong">${F.inr(deal.sellingPrice)}</td></tr></tbody></table>
        <p class="doc-small doc-section">${E(words(deal.sellingPrice))}. GST as applicable on the tax invoice.</p>
        <table class="doc-table doc-section"><caption class="doc-label">Payments received</caption><tbody>${received.length ? received.map((r) => `<tr><th scope="row">${E(F.date(r.date))}</th><td>${E(r.mode)} · ${E(r.ref)}</td><td class="num">${F.inr(r.amount)}</td></tr>`).join('') : '<tr><td colspan="3">No payment received yet.</td></tr>'}<tr><th scope="row" colspan="2">Balance due</th><td class="num doc-strong">${F.inr(Math.max(0, deal.sellingPrice - totalRecv))}</td></tr></tbody></table>`;
    return `<article class="tn-doc" id="money-document" aria-label="${E(x.kind)} ${E(x.id)}">${head(x.kind, x.id, `<p>Booking ${E(deal.id)}</p>`)}<h2 class="doc-title">${E(deal.title.split('·')[1] ? deal.title.split('·')[1].trim() : deal.destination)} for ${E(c.business ? c.name : c.name.split(' ').slice(-1)[0] + ' family')}</h2><p class="doc-sub">${isAdv ? 'Advance received for your trip' : 'Invoice for your trip'}</p>${billTo}${body}
      <section class="doc-section doc-note" aria-label="Tax invoice"><p><strong>Not a tax invoice.</strong> The tax invoice is issued from Tally.</p></section>${foot('Not a tax invoice')}</article>`;
  }
  TN.openDocument = (id) => {
    const m = docModel(id);
    if (!m) { TN.toast('This document could not be found.', 'danger'); return; }
    const canSee = m.x.kind === 'Hotel voucher' || TN.can('seeSellingPrice');
    if (!canSee) { TN.toast('You do not have access to this document.', 'danger'); return; }
    const ready = ['approved', 'sent'].includes(m.x.status);
    TN.dialog({
      title: E(`${m.x.kind} ${m.x.id}`),
      body: `<p class="m-0 mb-3 text-base text-quiet outline-none" tabindex="-1" data-money-doc-top>${ready ? 'This is what the customer gets.' : 'Not approved yet: download and print come after Accounts approves it.'}</p><div class="money-doc-frame">${docHtml(id)}</div>`,
      footer: `${btn('Close', { variant: 'secondary', attrs: { 'data-close': '' } })}${ready ? btn('Print', { variant: 'secondary', icon: 'printer', act: 'money-doc-print', attrs: { 'data-id': id } }) + btn('Download PDF', { variant: 'primary', icon: 'download', act: 'money-doc-pdf', attrs: { 'data-id': id } }) : ''}`,
    });
    const dlg = document.querySelector('#tn-overlay [role="dialog"]');
    if (dlg) { dlg.classList.add('money-doc-dialog'); const top = dlg.querySelector('[data-money-doc-top]'); if (top) top.focus(); }
  };
  TN.act('money-doc-print', (el) => {
    const root = document.createElement('div'); root.className = 'tn-print-root money-print-root'; root.innerHTML = docHtml(el.dataset.id);
    document.body.appendChild(root); document.body.classList.add('money-printing');
    const done = () => { root.remove(); document.body.classList.remove('money-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { try { window.print(); } catch (e) { /* print blocked */ } setTimeout(done, 1000); }, 50);
  });
  TN.act('money-doc-pdf', (el) => {
    const id = el.dataset.id; const bytes = docPdf(id);
    download(new Blob([bytes], { type: 'application/pdf' }), id.replace(/\//g, '-') + '.pdf');
    TN.toast(`${id.replace(/\//g, '-')}.pdf downloaded.`);
  });
  function download(blob, filename) {
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  /** Small real PDF (A4, Helvetica) built in the browser from the same facts as the preview. */
  function docPdf(id) {
    const m = docModel(id); const { x, deal, c, pax, received } = m;
    const ops = []; const W = 595, H = 842; let y = 790;
    const enc = (s) => String(s).replace(/₹/g, 'Rs ').replace(/[–—]/g, '-').replace(/[’‘]/g, "'").replace(/[^\x20-\x7E]/g, ' ').replace(/([()\\])/g, '\\$1');
    const text = (s, xx, yy, size = 10, bold = false, rgb = '0.18 0.23 0.31') => ops.push(`BT ${rgb} rg /${bold ? 'F2' : 'F1'} ${size} Tf ${xx} ${yy} Td (${enc(s)}) Tj ET`);
    const right = (s, xr, yy, size = 10, bold = false) => text(s, xr - enc(s).length * size * 0.5, yy, size, bold);
    const line = (yy) => ops.push(`0.85 0.87 0.91 RG 0.6 w 48 ${yy} m ${W - 48} ${yy} l S`);
    const inr = (n) => 'Rs ' + new Intl.NumberFormat('en-IN').format(n);
    text('Trip', 48, y, 20, true, '0 0.29 0.68'); text('Navigate', 88, y, 20, true, '0.08 0.13 0.24');
    right(`${x.kind} ${x.id}`, W - 48, y + 4, 10, true); right(`Date ${F.date(x.date)}`, W - 48, y - 10, 9);
    text('We make travel effortless.', 48, y - 16, 9);
    ops.push(`0 0.29 0.68 rg 48 ${y - 30} 350 3 re f 0.95 0.53 0 rg 398 ${y - 30} 149 3 re f`);
    y -= 60;
    const wrap = (s, max) => { const out = []; let cur = ''; String(s).split(' ').forEach((w) => { if ((cur + ' ' + w).trim().length > max) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; }); if (cur.trim()) out.push(cur.trim()); return out; };
    if (x.kind === 'Hotel voucher') {
      const s = TN.service(x.service);
      text(s.title, 48, y, 16, true); y -= 18; text(`${F.date(s.start)} to ${F.date(s.end)} · Booking ${deal.id}`, 48, y, 10); y -= 28;
      [['Confirmation number', s.confirmationNo || 'To follow'], ['Lead guest', c.business ? c.contact : c.name], ['Guests', pax], ['Check-in', `${F.date(s.start)}, from 2:00 pm`], ['Check-out', `${F.date(s.end)}, by 11:00 am`], ['Rooms and meals', s.detail]].forEach(([k, v]) => { text(k, 48, y, 10, true); text(v, 200, y, 10); y -= 8; line(y); y -= 14; });
      y -= 10; wrap(`Please show this voucher and a photo ID for every adult at check-in. Extras such as minibar, laundry and room service are paid at the hotel.`, 95).forEach((l) => { text(l, 48, y, 9); y -= 13; });
    } else {
      text(x.kind === 'Advance Invoice' ? 'Advance received for your trip' : 'Invoice for your trip', 48, y, 16, true); y -= 26;
      text('BILL TO', 48, y, 8, true); text('TRIP', 320, y, 8, true); y -= 14;
      text(c.name, 48, y, 10, true); text(deal.destination, 320, y, 10, true); y -= 13;
      text(c.business ? `GSTIN ${c.gstin}` : `${c.city}, Rajasthan`, 48, y, 9); text(`${F.date(deal.start)} to ${F.date(deal.end)} · ${pax}`, 320, y, 9); y -= 13;
      text(c.phone, 48, y, 9); text(`Booking ${deal.id}`, 320, y, 9); y -= 26;
      if (x.kind === 'Invoice') {
        text('Service', 48, y, 9, true); text('Details', 150, y, 9, true); right('Amount', W - 48, y, 9, true); y -= 6; line(y); y -= 14;
        docLines(deal).forEach((l) => { text(l.kind, 48, y, 9, true); const ls = wrap((l.title ? l.title + ' · ' : '') + l.detail, 62); ls.forEach((t, i) => text(t, 150, y - i * 12, 9)); right(inr(l.amount), W - 48, y, 9); y -= 12 * ls.length + 2; line(y); y -= 14; });
        text('Total for the trip', 48, y, 10, true); right(inr(deal.sellingPrice), W - 48, y, 10, true); y -= 24;
      } else {
        text('Received with this advance', 48, y, 10, true); right(inr(x.amount), W - 48, y, 10, true); y -= 8; line(y); y -= 14;
        text('Trip price', 48, y, 10); right(inr(deal.sellingPrice), W - 48, y, 10); y -= 24;
      }
      text('PAYMENTS RECEIVED', 48, y, 8, true); y -= 14;
      received.forEach((r) => { text(`${F.date(r.date)} · ${r.mode} · ${r.ref}`, 48, y, 9); right(inr(r.amount), W - 48, y, 9); y -= 14; });
      const bal = Math.max(0, deal.sellingPrice - received.reduce((s, r) => s + r.amount, 0));
      line(y + 4); y -= 10; text('Balance due', 48, y, 10, true); right(inr(bal), W - 48, y, 10, true); y -= 28;
      text('Not a tax invoice. The tax invoice is issued from Tally.', 48, y, 10, true);
    }
    line(80);
    wrap(`${COMPANY.legal} · Regd. office: ${COMPANY.office} · PAN ${COMPANY.pan} · GSTIN ${COMPANY.gstin} (${COMPANY.state})`, 110).forEach((l, i) => text(l, 48, 66 - i * 11, 8));
    text(`Prepared by ${name(x.createdBy)}, ${COMPANY.branchLine}`, 48, 40, 8);
    const stream = ops.join('\n');
    const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`, `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
    let out = '%PDF-1.4\n'; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
    const xref = out.length;
    out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    return out;
  }

  /* ==================================================================
     5. Company-funded bookings
     ================================================================== */
  const FU_STATUS = { requested: ['info', 'Waiting for Accounts approval'], waiting_manager: ['neutral', 'Waiting for the branch Manager'], approved: ['warning', 'Approved: recover from the next receipt'], refused: ['danger', 'Refused'], recovered: ['success', 'Recovered from the customer’s money'] };
  function fundPage(p, q) {
    const tab = q.tab || (TN.is('manager') ? 'waiting_manager' : 'requested');
    const rows = D.funding.filter((f) => tab === 'all' || f.status === tab);
    return pageHeader('Company funding', 'When a supplier must be paid before the customer’s money arrives, the company pays first. Accounts approves up to ₹50,000; the branch Manager approves above that. It is recovered from the next customer receipt on that Deal.')
      + tabs('Company funding filters', [['requested', 'To approve'], ['waiting_manager', 'Waiting for Manager'], ['approved', 'To recover'], ['recovered', 'Recovered'], ['refused', 'Refused'], ['all', 'All']].map(([k, l]) => ({ label: l, href: `#/app/accounts/funding?tab=${k}`, count: k === 'all' ? 0 : D.funding.filter((f) => f.status === k).length, current: tab === k })))
      + (rows.length ? cardList('Funding requests', rows.map(fundCard)) : empty('Nothing here', 'Funding requests from Purchase appear here.'));
  }
  /** Verified customer money on the funded Deal since the funding: receipts, or a checked split of a transfer. */
  const recoverable = (f) => [
    ...D.receipts.filter((r) => r.deal === f.deal && r.status === 'verified' && r.date >= f.at),
    ...D.money.transfers.filter((t) => t.allocStatus === 'approved' && t.date >= f.at && t.allocations.some((p) => D.instalments[p.k].deal === f.deal)),
  ];
  function fundCard(f) {
    const s = TN.service(f.service); const d = TN.deal(f.deal);
    const due = D.instalments.filter((i) => i.deal === f.deal && i.status !== 'paid').sort((a, b) => a.due.localeCompare(b.due))[0];
    const ga = s.kind === 'hotel' ? (s.goAhead === 'given' ? pill('ok', 'Go-ahead given', 'Hotel go-ahead') : s.goAhead === 'refused' ? pill('danger', 'Go-ahead refused', 'Hotel go-ahead') : pill('info', 'Waiting for Accounts go-ahead', 'Hotel go-ahead')) : quiet('Not needed for this service');
    let foot = '';
    if (f.status === 'waiting_manager') foot = notice('info', 'Waiting for the branch Manager', `<p>Above ₹50,000, so the branch Manager decides.${TN.is('manager') ? ` <a class="${LINK_STRONG}" href="#/app/approvals">Open Approvals</a>` : ''}</p>`);
    if (isAcc()) {
      if (f.status === 'requested') foot = f.amount > LIMIT ? notice('info', 'Needs the branch Manager', '<p>Above ₹50,000.</p>') : `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${primaryBig('Approve funding', 'money-fu-approve', { 'data-id': f.id })}${toggleBtn('Refuse with a reason', 'fu-ref-' + f.id)}</div>${reasonForm('fu-ref-' + f.id, 'money-fu-refuse', f.id, 'Refuse the funding request', 'Why are you refusing it?', '10 to 500 characters. Purchase reads it.', 'Refuse with this reason')}</div>`;
      if (f.status === 'approved') {
        const rcs = recoverable(f);
        foot = `<div class="flex flex-wrap gap-2">${rcs.length ? primaryBig('Mark recovered', 'money-fu-recover', { 'data-id': f.id }) : blocked('Mark recovered', 'No verified customer receipt on this Deal since the funding. It is recovered from the next one.', 'fu-rec-' + f.id)}${s.kind === 'hotel' && s.goAhead !== 'given' ? btn('Give hotel go-ahead', { variant: 'secondary', size: 'lg', act: 'money-fu-goahead', attrs: { 'data-id': f.id } }) : ''}</div>`;
      }
    }
    return article({
      label: `Funding ${f.id} ${F.inr(f.amount)}`, anchor: f.id,
      head: `${dealLink(f.deal)} <span class="font-normal text-copy">· ${E(f.id)} · ${E(s.title)}</span>`,
      badge: badge(...FU_STATUS[f.status], 'Funding'),
      body: summary([
        ['Amount', `<strong>${F.inr(f.amount)}</strong> · ${f.amount > LIMIT ? 'above ₹50,000: the branch Manager approves' : 'up to ₹50,000: Accounts approves'}`],
        ['Why now', E(f.reason)],
        ['Customer money expected', due ? `${E(due.label)} ${F.inr(due.amount - due.paid)} due ${F.date(due.due)}` : 'Fully paid'],
        ['Recover from', E(f.recoverFrom)],
        ['Requested', `${E(name(f.requestedBy))} · ${F.date(f.at)}`],
        ['Hotel go-ahead', ga],
        f.approvedBy ? ['Approved', E(name(f.approvedBy))] : null,
        f.refuseReason ? ['Refused because', E(f.refuseReason)] : null,
        ['Trip', `${E(d.title)} · starts ${F.date(d.start)}`],
      ]) + `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>Approving funding does not give the hotel go-ahead. Accounts gives it separately.</li></ul>`,
      foot,
    });
  }
  TN.act('money-fu-approve', (el) => {
    const f = D.funding.find((x) => x.id === el.dataset.id);
    if (f.amount > LIMIT) { f.status = 'waiting_manager'; return TN.refresh(); }
    f.status = 'approved'; f.approvedBy = ME();
    pushNotice(['purchase'], `Company funding ${f.id} (${F.inr(f.amount)}) approved by Accounts. Raise the supplier payment request.`, f.deal);
    TN.toast(`${f.id} approved. It is recovered from the next customer receipt.`); TN.refresh();
  });
  TN.act('money-fu-refuse', (form) => {
    const r = readReason(form); if (!r) return;
    const f = D.funding.find((x) => x.id === form.dataset.id); f.status = 'refused'; f.refuseReason = r;
    pushNotice(['purchase'], `Company funding ${f.id} refused: ${r}`, f.deal); TN.toast('Refused with your reason.'); TN.refresh();
  });
  TN.act('money-fu-recover', (el) => {
    const f = D.funding.find((x) => x.id === el.dataset.id);
    const r = recoverable(f)[0]; if (!r) return TN.toast('No verified customer receipt to recover it from yet.', 'warning');
    f.status = 'recovered'; f.recoverFrom = `Receipt ${r.id}`; TN.toast(`${f.id} recovered from ${r.id}.`); TN.refresh();
  });
  TN.act('money-fu-goahead', (el) => {
    const f = D.funding.find((x) => x.id === el.dataset.id); const s = TN.service(f.service); s.goAhead = 'given';
    pushNotice(['purchase'], `Accounts gave the go-ahead for ${s.title}. You may book it.`, f.deal); TN.toast('Hotel go-ahead given.'); TN.refresh();
  });

  /* ==================================================================
     6. Refunds and recoveries
     ================================================================== */
  const RF_STATUS = {
    'Customer refund': { requested: ['neutral', 'Waiting for the branch Manager'], approved: ['warning', 'Approved: pay the refund'], paid: ['info', 'Paid: a different person verifies'], verified: ['success', 'Refund paid and verified'] },
    'Supplier recovery': { requested: ['neutral', 'Waiting for the branch Manager'], approved: ['warning', 'Waiting for the supplier’s money'], paid: ['info', 'Received: a different person verifies'], verified: ['success', 'Recovered and verified'] },
  };
  function rfPage(p, q) {
    const tab = q.tab || 'approved';
    const rows = D.refunds.filter((r) => tab === 'all' || r.status === tab);
    const cancels = D.cancellations.filter((c) => !['closed'].includes(c.status));
    return pageHeader('Refunds and recoveries', 'Money going back to customers after a cancellation the branch Manager approved, and money suppliers return on a credit note. Record what was actually paid or received; a different Accounts person verifies it. Write-offs need the branch Manager.')
      + (cancels.length ? `<section class="mb-5" aria-labelledby="money-cancel-h"><h2 id="money-cancel-h" class="m-0 mb-3 text-lg font-semibold text-ink">Cancellations being settled</h2>${cardList('Cancellations', cancels.map(cancelCard))}</section>` : '')
      + tabs('Refund filters', [['approved', 'To pay or receive'], ['paid', 'To verify'], ['verified', 'Done'], ['all', 'All']].map(([k, l]) => ({ label: l, href: `#/app/accounts/refunds?tab=${k}`, count: k === 'all' || k === 'verified' ? 0 : D.refunds.filter((r) => r.status === k).length, current: tab === k })))
      + (rows.length ? cardList('Refunds and recoveries', rows.map(rfCard)) : empty('Nothing here', 'Refunds appear after the branch Manager approves a cancellation.'));
  }
  function cancelCard(c) {
    const d = TN.deal(c.deal); const cu = TN.customer(d.customer);
    const charges = c.charges.reduce((s, x) => s + x.supplierCharge, 0);
    const owes = charges + c.ourCharge - c.customerPaid;
    const st = { requested: ['neutral', 'Requested by Sales'], charges_entered: ['neutral', 'Supplier charges entered'], waiting_manager: ['neutral', 'Waiting for the branch Manager'], approved: ['warning', 'Approved: settle the money'], refund_paid: ['success', 'Refund paid'], write_off_asked: ['neutral', 'Write-off waiting for the Manager'] }[c.status] || ['neutral', c.status];
    let foot = '';
    if (c.status === 'waiting_manager') foot = notice('info', 'Waiting for the branch Manager', `<p>Nothing is paid or written off until the Manager approves the cancellation.${TN.is('manager') ? ` <a class="${LINK_STRONG}" href="#/app/approvals">Open Approvals</a>` : ''}</p>`);
    if (isAcc() && c.status === 'approved' && owes > 0) {
      foot = `<div class="flex flex-col gap-3"><div class="flex flex-wrap gap-2">${btn('Add to customer dues', { variant: 'primary', size: 'lg', act: 'money-cx-due', attrs: { 'data-id': c.id } })}${toggleBtn('Ask the Manager to write it off', 'cx-wo-' + c.id)}</div>${reasonForm('cx-wo-' + c.id, 'money-cx-writeoff', c.id, 'Ask for a write-off', 'Why should the company write it off?', '10 to 500 characters. The branch Manager decides.', 'Send to the Manager')}</div>`;
    }
    return article({
      label: `Cancellation ${d.id}`, anchor: c.id,
      head: `${dealLink(d.id)} <span class="font-normal text-copy">· ${E(c.kind)} · ${E(cu.name)}</span>`,
      badge: badge(st[0], st[1], 'Cancellation'),
      body: summary([
        ['Reason', E(c.reason)],
        ['Customer paid', F.inr(c.customerPaid), 1],
        ...c.charges.map((x) => [`Kept by ${TN.supplier(TN.service(x.service).supplier).name}`, `${F.inr(x.supplierCharge)}<span class="block text-sm text-quiet">${E(x.note)}</span>`, 1]),
        ['Our cancellation charge', F.inr(c.ourCharge), 1],
        [owes > 0 ? 'Customer still owes' : 'Refund to the customer', `<strong>${F.inr(Math.abs(owes))}</strong>`, 1],
        ['Requested', `${E(name(c.requestedBy))} · ${F.date(c.at)}`],
      ]),
      foot,
    });
  }
  TN.act('money-cx-due', (el) => {
    const c = D.cancellations.find((x) => x.id === el.dataset.id);
    const owes = c.charges.reduce((s, x) => s + x.supplierCharge, 0) + c.ourCharge - c.customerPaid;
    D.instalments.filter((i) => i.deal === c.deal && i.status !== 'paid').forEach((i) => { i.amount = i.paid; i.status = 'paid'; });
    D.instalments.push({ deal: c.deal, label: 'Cancellation charges', due: '2026-11-03', amount: owes, paid: 0, status: 'due' });
    c.status = 'closed';
    pushNotice(['sales'], `Cancellation of ${c.deal}: customer owes ${F.inr(owes)} in charges. Due 3 Nov.`, c.deal);
    TN.toast(`Added to customer dues: ${F.inr(owes)} due 3 Nov.`); TN.refresh();
  });
  TN.act('money-cx-writeoff', (form) => {
    const r = readReason(form); if (!r) return;
    const c = D.cancellations.find((x) => x.id === form.dataset.id); c.status = 'write_off_asked'; c.writeOffReason = r;
    pushNotice(['manager'], `Write-off asked for ${c.deal} by ${TN.me().name}: ${r}`, c.deal, '#/app/approvals');
    TN.toast('Sent to the branch Manager.'); TN.refresh();
  });
  function rfCard(r) {
    const d = TN.deal(r.deal);
    const party = r.kind === 'Customer refund' ? TN.customer(r.party).name : TN.supplier(r.party).name;
    const [tone, text] = RF_STATUS[r.kind][r.status];
    const cust = r.kind === 'Customer refund';
    let foot = '';
    if (isAcc()) {
      if (r.status === 'approved') foot = `<div class="flex flex-wrap gap-2">${primaryBig(cust ? 'Record refund paid' : 'Record money received', 'money-rf-pay', { 'data-id': r.id })}</div><p class="m-0 text-sm text-quiet">${cust ? 'Pay from the bank first, then record the reference here.' : 'Record it when the supplier’s money shows in the bank.'}</p>`;
      if (r.status === 'paid') foot = r.paidBy === ME()
        ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm text-quiet"><li>You recorded this, so another Accounts person must verify it.</li></ul>${blocked('Verify', `You recorded this ${cust ? 'refund' : 'recovery'}. Another Accounts person must do this step.`, 'rfv-' + r.id)}`
        : `<div class="flex flex-wrap gap-2">${primaryBig(cust ? 'Verify refund' : 'Verify recovery', 'money-rf-verify', { 'data-id': r.id })}</div>`;
    }
    return article({
      label: `${r.kind} ${r.id} ${F.inr(r.amount)}`, anchor: r.id,
      head: `${dealLink(r.deal)} <span class="font-normal text-copy">· ${E(r.id)} · ${E(r.kind)} · ${E(party)}</span>`,
      badge: badge(tone, text, r.kind),
      body: summary([
        ['Amount', `<strong>${F.inr(r.amount)}</strong> · ${cust ? 'to the customer' : 'from the supplier'}`],
        ['Why', E(r.note)],
        ['Trip', E(d.title)],
        r.payTo ? ['Pay to', E(r.payTo)] : null,
        r.creditNote ? ['Credit note', `<a class="${LINK}" href="#/app/accounts/supplier-invoices?tab=all">${E(r.creditNote)}</a>`] : null,
        r.approvedBy ? ['Approved', `${E(name(r.approvedBy))} (branch Manager)`] : null,
        r.paidBy ? [cust ? 'Paid' : 'Received', `${r.paidAt ? F.date(r.paidAt) + ' · ' : ''}${E(r.fromAccount || '')} · ${E(r.bankRef)}<span class="block text-sm text-quiet">Recorded by ${E(name(r.paidBy))}${r.proof ? ` · proof ${fileLink(r.proof)}` : ''}</span>`] : null,
        r.verifiedBy ? ['Verified', E(name(r.verifiedBy))] : null,
      ]),
      foot,
    });
  }
  TN.act('money-rf-pay', (el) => openRfPay(el.dataset.id));
  function openRfPay(id, values = {}, errors) {
    const r = D.refunds.find((x) => x.id === id); const cust = r.kind === 'Customer refund';
    drawerForm({
      title: cust ? 'Record refund paid' : 'Record money received', formId: 'rf-pay', act: 'money-rf-pay-save', data: { 'data-id': id }, submit: cust ? 'Record refund' : 'Record money received',
      description: `${r.id} · ${F.inr(r.amount)}`,
      body: (v, er) => `${field({ id: 'rf-pay-acc', name: 'acc', label: cust ? 'Paid from' : 'Received into', kind: 'select', value: v.acc || COMPANY_ACCOUNTS[0], options: COMPANY_ACCOUNTS })}
        ${grid2(field({ id: 'rf-pay-amount', name: 'amount', label: 'Amount (₹)', value: v.amount ?? String(r.amount), inputmode: 'numeric', hint: `Approved: ${F.inr(r.amount)}.`, error: er.amount }) + field({ id: 'rf-pay-date', name: 'date', label: cust ? 'Paid on' : 'Received on', kind: 'date', value: v.date || TN.TODAY, error: er.date }))}
        ${field({ id: 'rf-pay-ref', name: 'ref', label: 'Bank reference (UTR)', value: v.ref || '', hint: '6 to 40 letters, digits, / or -.', error: er.ref })}
        ${field({ id: 'rf-pay-proof', name: 'proof', label: 'Proof', kind: 'file', hint: 'Bank advice or statement line. Kept private; only Accounts can open it.', error: er.proof })}
        <p class="m-0 text-sm text-quiet">A different Accounts person verifies it.</p>`,
    }, values, errors);
  }
  TN.act('money-rf-pay-save', (form) => {
    const r = D.refunds.find((x) => x.id === form.dataset.id); const v = fval(form); const er = {}; const file = form.querySelector('[name=proof]').files[0];
    if (rupees(v.amount) !== r.amount) er.amount = `Enter exactly ${F.inr(r.amount)}, the approved amount.`;
    if (!v.date || v.date > TN.TODAY) er.date = 'Enter the date, not a future date.';
    const ref = String(v.ref || '').trim().toUpperCase();
    if (!/^[A-Z0-9/ -]{6,40}$/.test(ref)) er.ref = 'Enter the bank reference: 6 to 40 letters, digits, / or -.';
    if (!file) er.proof = 'Upload the proof.';
    delete v.proof;
    if (Object.keys(er).length) return openRfPay(r.id, v, er);
    Object.assign(r, { status: 'paid', paidBy: ME(), paidAt: v.date, fromAccount: v.acc, bankRef: ref, proof: file.name });
    pushNotice(['accounts', 'checker'].filter((x) => x !== TN.role), `${r.kind} ${r.id} recorded by ${TN.me().name}. A different person must verify it.`, r.deal, '#/app/accounts/refunds?tab=paid');
    TN.closeOverlay(); TN.toast(`${r.id} recorded. Another Accounts person verifies it.`); TN.refresh();
  });
  TN.act('money-rf-verify', (el) => {
    const r = D.refunds.find((x) => x.id === el.dataset.id);
    if (r.paidBy === ME()) return TN.toast('You recorded this. Another Accounts person must verify it.', 'danger');
    r.status = 'verified'; r.verifiedBy = ME();
    if (r.kind === 'Customer refund') pushNotice(['sales'], `Refund ${F.inr(r.amount)} to ${TN.customer(r.party).name} is paid and verified.`, r.deal);
    TN.toast(`${r.id} verified.`); TN.refresh();
  });

  /* ==================================================================
     7. Tally export pack
     ================================================================== */
  const PERIODS = [['2026-10', 'October 2026'], ['2026-09', 'September 2026']];
  const LEDGER_FOR_ACC = (to) => (/UPI|@/.test(to) ? 'UPI Collections - HDFC' : /cash/i.test(to) ? 'Cash - Jodhpur Branch' : /ICICI/.test(to) ? 'ICICI Bank CA 2290' : 'HDFC Bank CA 4417');
  const PURCHASE_LEDGER = (s, d) => (s.kind === 'flight' ? 'Airfare Purchases' : s.kind === 'visa' ? 'Visa Fees' : d.tripType === 'International' ? 'Tour Purchases - International' : 'Tour Purchases - Domestic');
  function tallyRows(period) {
    const inP = (dt) => dt && dt.startsWith(period);
    const ok = []; const held = [];
    D.receipts.filter((r) => inP(r.date)).forEach((r) => { const c = customerOf(r.deal); const row = { id: r.id, type: 'Receipt', date: r.date, no: r.id, party: c.name, ledgerDr: LEDGER_FOR_ACC(r.to), ledgerCr: c.name, amount: r.amount, narration: `${r.mode} ${r.ref} · ${r.deal}` }; (r.status === 'verified' ? ok : held).push(r.status === 'verified' ? row : { ...row, why: r.cheque === 'waiting_clearance' ? 'Cheque not cleared yet' : 'Receipt not verified yet' }); });
    D.money.transfers.filter((t) => inP(t.date)).forEach((t) => { const row = { id: t.id, type: 'Receipt', date: t.date, no: t.id, party: t.payer, ledgerDr: LEDGER_FOR_ACC(t.to), ledgerCr: t.payer, amount: t.amount, narration: `${t.mode} ${t.ref} · ${t.allocStatus === 'approved' ? 'split across bookings' : 'not split yet'}` }; (t.allocStatus === 'approved' ? ok : held).push(t.allocStatus === 'approved' ? row : { ...row, why: 'Split across bookings not checked yet' }); });
    D.supplierInvoices.filter((x) => inP(x.date)).forEach((x) => { const s = TN.service(x.service); const d = TN.deal(x.deal); const sup = TN.supplier(x.supplier).name; const cn = x.kind === 'Credit note'; const row = { id: x.id, type: cn ? 'Debit Note' : 'Purchase', date: x.date, no: x.number, party: sup, ledgerDr: cn ? sup : PURCHASE_LEDGER(s, d), ledgerCr: cn ? PURCHASE_LEDGER(s, d) : sup, amount: x.amount, narration: `${s.title} · ${x.deal}${x.gst ? ` · GST on bill ${F.inr(x.gst)}` : ''}` }; (x.status === 'accepted' ? ok : held).push(x.status === 'accepted' ? row : { ...row, why: x.status === 'returned' ? 'Returned to Purchase' : 'Not checked by Accounts yet' }); });
    D.supplierPayments.filter((p) => inP(p.paidAt)).forEach((p) => { const sup = TN.supplier(p.supplier).name; const row = { id: p.id, type: 'Payment', date: p.paidAt, no: p.id, party: sup, ledgerDr: sup, ledgerCr: LEDGER_FOR_ACC(p.fromAccount || ''), amount: p.amount, narration: `${p.bankRef} · ${p.deal}` }; (p.status === 'verified' ? ok : held).push(p.status === 'verified' ? row : { ...row, why: 'Payment not verified yet' }); });
    D.refunds.filter((r) => inP(r.paidAt)).forEach((r) => { const cust = r.kind === 'Customer refund'; const party = cust ? TN.customer(r.party).name : TN.supplier(r.party).name; const row = { id: r.id, type: cust ? 'Payment' : 'Receipt', date: r.paidAt, no: r.id, party, ledgerDr: cust ? party : LEDGER_FOR_ACC(r.fromAccount || ''), ledgerCr: cust ? LEDGER_FOR_ACC(r.fromAccount || '') : party, amount: r.amount, narration: `${r.kind} · ${r.bankRef} · ${r.deal}` }; (r.status === 'verified' ? ok : held).push(r.status === 'verified' ? row : { ...row, why: `${cust ? 'Refund' : 'Recovery'} not verified yet` }); });
    ok.sort((a, b) => a.date.localeCompare(b.date));
    const fresh = ok.filter((r) => !D.money.exported[r.id]);
    const done = ok.filter((r) => D.money.exported[r.id]);
    return { fresh, done, held };
  }
  function tallyPage(p, q) {
    const period = q.period || '2026-10';
    const { fresh, done, held } = tallyRows(period);
    const types = ['Receipt', 'Purchase', 'Debit Note', 'Payment'];
    const tot = (t) => fresh.filter((r) => r.type === t).reduce((s, r) => s + r.amount, 0);
    const label = (PERIODS.find((x) => x[0] === period) || [0, period])[1];
    const hist = D.money.exports.filter((x) => x.period === period);
    return pageHeader('Tally export', 'A pack of checked money and supplier bills for the Tally team. Only verified receipts, accepted supplier bills and verified payments go in. The pack is not proof that Tally posted them.', isAcc() ? `${btn('Download Excel', { variant: 'secondary', icon: 'file-spreadsheet', act: 'money-tally-xls', attrs: { 'data-period': period } })}${btn('Mark as exported', { variant: 'primary', act: 'money-tally-mark', attrs: { 'data-period': period } })}` : '')
      + `<section class="mb-4 rounded-card border border-line bg-card px-4.5 py-4 font-sans shadow-card" aria-labelledby="tally-period-h"><h2 id="tally-period-h" class="m-0 mb-2 text-lg font-semibold text-ink">Period</h2><div class="flex flex-col gap-2 sm:flex-row sm:items-end"><div class="min-w-0 flex-1">${field({ id: 'tally-period', name: 'period', label: 'Month', kind: 'select', value: period, change: 'money-tally-period', options: PERIODS })}</div></div><p class="m-0 mt-2 text-sm text-quiet">Holiday Chacha Pvt LTD · Jodhpur branch · ledger names as agreed with the Tally team.</p></section>`
      + stats([['Receipts', F.inr(tot('Receipt')), F.plural(fresh.filter((r) => r.type === 'Receipt').length, 'voucher')], ['Supplier bills', F.inr(tot('Purchase') - tot('Debit Note')), `${F.plural(fresh.filter((r) => r.type === 'Purchase' || r.type === 'Debit Note').length, 'voucher')}, credit notes taken off`], ['Payments', F.inr(tot('Payment')), `${F.plural(fresh.filter((r) => r.type === 'Payment').length, 'voucher')}, supplier payments and refunds`]])
      + (held.length ? notice('warning', `${F.plural(held.length, 'item')} left out: not checked yet`, `<ul class="m-0 flex list-disc flex-col gap-1 pl-5">${held.map((r) => `<li>${E(r.type)} ${E(r.no)} · ${E(r.party)} · ${F.inr(r.amount)}: ${E(r.why)}</li>`).join('')}</ul><p>They go in a later pack once a second Accounts person has checked them.</p>`, { className: 'mb-4' }) : '')
      + (done.length ? notice('locked', `${F.plural(done.length, 'voucher')} already exported`, `<p>${done.map((r) => E(r.no)).join(', ')}. Exported rows are never exported twice.</p>`, { className: 'mb-4' }) : '')
      + (fresh.length ? finTable(`${F.plural(fresh.length, 'voucher')} to export · ${E(label)}`, [['Voucher type'], ['Date'], ['Number'], ['Debit ledger'], ['Credit ledger'], ['Amount', 1], ['Narration']], fresh.map((r) => [`<strong>${E(r.type)}</strong>`, E(F.date(r.date)), `<span class="fin-mono">${E(r.no)}</span>`, E(r.ledgerDr), E(r.ledgerCr), F.inr(r.amount), `<span class="fin-sub">${E(r.narration)}</span>`]))
        + `<p class="m-0 mt-3 text-sm text-quiet">${types.filter((t) => tot(t)).map((t) => `${t} total ${F.inr(tot(t))}`).join(' · ')}</p>`
        : empty('Nothing new to export', `Every checked item for ${label} is already exported.`, 'file-spreadsheet'))
      + `<section class="fin-card mt-8" aria-labelledby="tally-hist-h"><h2 id="tally-hist-h">Exports for ${E(label)}</h2>${hist.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0">${hist.map((h) => `<li class="m-0">${E(h.id)} · ${F.plural(h.rows, 'voucher')} · marked as exported by ${E(name(h.by))} on ${E(F.dateTime(h.at))}</li>`).join('')}</ul>` : '<p class="hint">Not exported yet.</p>'}</section>`;
  }
  TN.act('money-tally-period', (el) => TN.go('/app/accounts/tally?period=' + el.value));
  const cell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  TN.act('money-tally-xls', (el) => {
    const period = el.dataset.period; const { fresh, held } = tallyRows(period);
    if (!fresh.length) return TN.toast('Nothing new to export for this month.');
    const head = ['Voucher Type', 'Date', 'Voucher Number', 'Party Ledger', 'Debit Ledger', 'Credit Ledger', 'Amount (INR)', 'Narration', 'CRM ID'];
    const lines = [head, ...fresh.map((r) => [r.type, r.date.split('-').reverse().join('-'), r.no, r.party, r.ledgerDr, r.ledgerCr, r.amount, r.narration.replace(/₹/g, 'Rs '), r.id])];
    lines.push([], ['Left out (not checked yet)'], ...held.map((r) => [r.type, r.date, r.no, r.party, '', '', r.amount, r.why, r.id]));
    const csv = '﻿' + lines.map((l) => l.map(cell).join(',')).join('\r\n');
    download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), `tally-pack-jodhpur-${period}.csv`);
    TN.toast(`tally-pack-jodhpur-${period}.csv downloaded (${F.plural(fresh.length, 'voucher')}). Opens in Excel.`);
  });
  TN.act('money-tally-mark', (el) => {
    const period = el.dataset.period; const { fresh } = tallyRows(period);
    if (!fresh.length) return TN.toast('Nothing new to mark as exported.');
    const id = `TX-${period}${D.money.exports.some((x) => x.period === period) ? '-' + (D.money.exports.filter((x) => x.period === period).length + 1) : ''}`;
    D.money.exports.unshift({ id, period, by: ME(), at: nowStamp(), rows: fresh.length, ids: fresh.map((r) => r.id) });
    fresh.forEach((r) => (D.money.exported[r.id] = id));
    TN.toast(`${F.plural(fresh.length, 'voucher')} marked as exported (${id}). They will not be exported again.`); TN.refresh();
  });

  /* ------------------------------------------------------------------
     Pages
     ------------------------------------------------------------------ */
  const ACC = ['accounts', 'checker'];
  const ACC_M = ['accounts', 'checker', 'manager'];
  TN.page('/app/accounts/dues', { nav: '/app/accounts/dues', roles: ACC_M, title: 'Customer dues', render: duesPage });
  TN.page('/app/accounts/supplier-payments', { nav: '/app/accounts/supplier-payments', roles: ACC_M, title: 'Supplier payments', render: spPage });
  TN.page('/app/accounts/supplier-invoices', { nav: '/app/accounts/supplier-invoices', roles: ACC, title: 'Supplier invoices', render: siPage });
  TN.page('/app/accounts/documents', { nav: '/app/accounts/documents', roles: ACC, title: 'Invoices and vouchers', render: docPage });
  TN.page('/app/accounts/funding', { nav: '/app/accounts/funding', roles: ACC_M, title: 'Company funding', render: fundPage });
  TN.page('/app/accounts/refunds', { nav: '/app/accounts/refunds', roles: ACC_M, title: 'Refunds and recoveries', render: rfPage });
  TN.page('/app/accounts/tally', { nav: '/app/accounts/tally', roles: ACC, title: 'Tally export', render: tallyPage });

  /* ------------------------------------------------------------------
     Home rows ("What needs you")
     ------------------------------------------------------------------ */
  const sec = 'What needs you';
  const otherPerson = (by) => by && by !== ME();
  TN.homeRow({ roles: ACC, section: sec, label: 'Customer instalments overdue', href: '#/app/accounts/dues?tab=overdue', count: () => D.instalments.filter((i) => i.status !== 'paid' && daysOverdue(i) > 0 && !onHoldDeal(i.deal)).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Customer transfers to split or check', href: '#/app/accounts/dues', count: () => D.money.transfers.filter((t) => t.allocStatus === 'none' || (t.allocStatus === 'proposed' && otherPerson(t.proposedBy))).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Supplier payments to approve', href: '#/app/accounts/supplier-payments?tab=requested', count: () => D.supplierPayments.filter((p) => p.status === 'requested' && !needsManager(p)).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Supplier payments to pay', href: '#/app/accounts/supplier-payments?tab=approved', count: () => D.supplierPayments.filter((p) => p.status === 'approved').length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Supplier payments to verify', href: '#/app/accounts/supplier-payments?tab=paid', count: () => D.supplierPayments.filter((p) => p.status === 'paid' && otherPerson(p.paidBy)).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Supplier invoices to check', href: '#/app/accounts/supplier-invoices', count: () => D.supplierInvoices.filter((x) => x.status === 'uploaded' && otherPerson(x.by)).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Customer documents to approve', href: '#/app/accounts/documents', count: () => D.documents.filter((x) => x.status === 'waiting_accounts' && otherPerson(x.createdBy) && otherPerson(x.submittedBy || 'none')).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Company funding to approve', href: '#/app/accounts/funding', count: () => D.funding.filter((f) => f.status === 'requested' && f.amount <= LIMIT).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Refunds and recoveries to record or verify', href: '#/app/accounts/refunds', count: () => D.refunds.filter((r) => r.status === 'approved' || (r.status === 'paid' && otherPerson(r.paidBy))).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Travelled trips ready to close', href: '#/app/accounts/dues?tab=closure', count: () => D.deals.filter((d) => d.tripStatus === 'travelled' && checklist(d).every((i) => i.done)).length });
  TN.homeRow({ roles: ACC, section: sec, label: 'Travelled trips with open closure items', href: '#/app/accounts/dues?tab=closure', count: () => D.deals.filter((d) => d.tripStatus === 'travelled' && !checklist(d).every((i) => i.done)).length });

  /* Exposed for other areas (read-only helpers). */
  TN.money = { checklist, counted, nextNumber, docHtml };
})();
