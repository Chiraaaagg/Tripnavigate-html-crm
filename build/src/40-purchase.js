/* =====================================================================
   40-purchase.js · Agent D (Purchase), 27 Oct 2026
   Pages: #/app/purchase (queue), #/app/purchase/:taskId (task page and
   tabs), #/app/purchase/suppliers, #/app/purchase/suppliers/:id,
   #/app/purchase/payments (Purchase's own supplier payment requests).
   Markup is copied from the live captures (b4-purchase-*, procurement-*,
   suppliers-*, supplier-detail-*, b11-accounts-claims-list).
   Money fence: nothing in this file reads sellingPrice, margin, receipts
   amounts or payment proof for display. The only use of customer money is
   an internal yes/no "is customer money short" check for company funding,
   and the amount is never shown to Purchase.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const esc = TN.esc;

  /* ---------- Icons (exact lucide markup from the captures) ---------- */
  const ICONS = {
    'badge-check': ["lucide-badge-check lucide-verified", "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"></path><path d=\"m16 9-5.5 5.5L8 12\"></path>"],
    'banknote': ["lucide-banknote", "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M6 12h.01M18 12h.01\"></path>"],
    'bed-double': ["lucide-bed-double", "<path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\"></path><path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\"></path><path d=\"M12 4v6\"></path><path d=\"M2 18h20\"></path>"],
    'briefcase': ["lucide-briefcase", "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"></path><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\"></rect>"],
    'car-front': ["lucide-car-front", "<path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\"></path><path d=\"M7 14h.01\"></path><path d=\"M17 14h.01\"></path><rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\"></rect><path d=\"M5 18v2\"></path><path d=\"M19 18v2\"></path>"],
    'chevron-left': ["lucide-chevron-left", "<path d=\"m15 18-6-6 6-6\"></path>"],
    'circle': ["lucide-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"],
    'circle-alert': ["lucide-circle-alert lucide-alert-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>"],
    'circle-check': ["lucide-circle-check lucide-check-circle-2", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m16 9-5.5 5.5L8 12\"></path>"],
    'circle-dot': ["lucide-circle-dot", "<circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"],
    'circle-minus': ["lucide-circle-minus lucide-minus-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 12h8\"></path>"],
    'circle-play': ["lucide-circle-play lucide-play-circle", "<path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\"></path><circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"],
    'circle-question-mark': ["lucide-circle-question-mark lucide-help-circle lucide-circle-help", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><path d=\"M12 17h.01\"></path>"],
    'circle-x': ["lucide-circle-x lucide-x-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m15 9-6 6\"></path><path d=\"m9 9 6 6\"></path>"],
    'clock': ["lucide-clock", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 6v6l4 2\"></path>"],
    'compass': ["lucide-compass", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"></path>"],
    'file-check-corner': ["lucide-file-check-corner lucide-file-check-2", "<path d=\"M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"m14 20 2 2 4-4\"></path>"],
    'file-text': ["lucide-file-text", "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>"],
    'folder-open': ["lucide-folder-open", "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"></path>"],
    'hand-coins': ["lucide-hand-coins", "<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17\"></path><path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\"></path><path d=\"m2 16 6 6\"></path><circle cx=\"16\" cy=\"9\" r=\"2.9\"></circle><circle cx=\"6\" cy=\"5\" r=\"3\"></circle>"],
    'hourglass': ["lucide-hourglass", "<path d=\"M5 22h14\"></path><path d=\"M5 2h14\"></path><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\"></path><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\"></path>"],
    'inbox': ["lucide-inbox", "<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"></polyline><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path>"],
    'info': ["lucide-info", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>"],
    'landmark': ["lucide-landmark", "<path d=\"M10 18v-7\"></path><path d=\"M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z\"></path><path d=\"M14 18v-7\"></path><path d=\"M18 18v-7\"></path><path d=\"M3 22h18\"></path><path d=\"M6 18v-7\"></path>"],
    'lock': ["lucide-lock", "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>"],
    'mail': ["lucide-mail", "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"></path><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"></rect>"],
    'map': ["lucide-map", "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"></path><path d=\"M15 5.764v15\"></path><path d=\"M9 3.236v15\"></path>"],
    'pencil-line': ["lucide-pencil-line", "<path d=\"M13 21h8\"></path><path d=\"m15 5 4 4\"></path><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path>"],
    'receipt': ["lucide-receipt", "<path d=\"M12 17V7\"></path><path d=\"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8\"></path><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\"></path>"],
    'search-x': ["lucide-search-x", "<path d=\"m13.5 8.5-5 5\"></path><path d=\"m8.5 8.5 5 5\"></path><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.3-4.3\"></path>"],
    'send': ["lucide-send", "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"></path><path d=\"m21.854 2.147-10.94 10.939\"></path>"],
    'triangle-alert': ["lucide-triangle-alert lucide-alert-triangle", "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>"],
    'undo-2': ["lucide-undo-2", "<path d=\"M9 14 4 9l5-5\"></path><path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"></path>"],
    'upload': ["lucide-upload", "<path d=\"M12 3v12\"></path><path d=\"m17 8-5-5-5 5\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path>"],
  };
  const ic = (name, cls) => {
    const i = ICONS[name];
    if (!i) return TN.ic ? TN.ic(name, cls) : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide ${i[0]}${cls ? ' ' + cls : ''}" aria-hidden="true">${i[1]}</svg>`;
  };

  /* ---------- Formatting ---------- */
  // Live Purchase screens always show paise (₹42,000.00); TN.fmt.inr adds them.
  const money = (n) => (n == null || n === '' ? '—' : TN.fmt.inr(Math.round(Number(n))));
  const pad = (n) => String(n).padStart(2, '0');
  const now = () => { const d = new Date(); return `${TN.TODAY} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };
  const dt = (s) => TN.fmt.dateTime(s);
  const date = (s) => TN.fmt.date(s);
  const nights = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
  const plural = (n, one, many) => TN.fmt.plural(n, one, many);
  const name = (key) => (key && TN.PEOPLE[key] ? TN.PEOPLE[key].name : '—');
  const travellers = (deal) => [deal.adults ? plural(deal.adults, 'adult') : '', deal.children ? plural(deal.children, 'child', 'children') : '', deal.infants ? plural(deal.infants, 'infant') : ''].filter(Boolean).join(', ');
  const meKey = () => TN.roleDef().person;
  const byWho = (key) => (key === meKey() ? 'you' : name(key));
  let seq = 0;
  const uid = (p) => `${p}-${Date.now().toString(36)}${++seq}`;

  /* ---------- Live class strings ---------- */
  const C = {
    card: 'rounded-card border border-line bg-card font-sans text-base text-copy shadow-card',
    cardHead: 'flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5',
    h2: 'm-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink',
    eyebrow: 'm-0 mb-1 text-sm font-medium text-quiet',
    h1: 'm-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl',
    focus: 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none',
    tab: '-mb-px inline-flex min-h-10 items-center gap-2 rounded-t-control border-b-2 border-transparent px-3 py-2 text-base font-medium text-quiet no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:border-brand-strong aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:-outline-offset-3',
    th: 'border-b border-line bg-canvas px-4.5 py-2.5 text-left align-middle text-xs font-semibold tracking-[0.04em] text-quiet uppercase',
    td: 'border-0 bg-transparent px-4.5 py-3 text-left group-data-[stack=true]/table:max-sm:flex group-data-[stack=true]/table:max-sm:justify-between group-data-[stack=true]/table:max-sm:gap-3 group-data-[stack=true]/table:max-sm:px-0 group-data-[stack=true]/table:max-sm:py-1 group-data-[stack=true]/table:max-sm:text-right group-data-[stack=true]/table:max-sm:before:text-left group-data-[stack=true]/table:max-sm:before:text-sm group-data-[stack=true]/table:max-sm:before:font-normal group-data-[stack=true]/table:max-sm:before:text-quiet group-data-[stack=true]/table:max-sm:before:content-[attr(data-label)] group-data-[stack=true]/table:max-sm:first:block group-data-[stack=true]/table:max-sm:first:pb-2 group-data-[stack=true]/table:max-sm:first:text-left group-data-[stack=true]/table:max-sm:first:before:content-none',
    trHead: 'border-b border-line last:border-b-0 group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 hover:bg-transparent',
    tr: 'border-b border-line last:border-b-0 hover:bg-canvas group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 align-top',
    rowLink: 'rounded-chip font-semibold text-brand-strong underline-offset-4 hover:text-brand-deep hover:underline outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none',
    fileLink: 'rounded-chip text-brand-strong underline underline-offset-4 hover:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none',
    back: 'inline-flex items-center gap-1 rounded-chip text-sm font-medium text-brand-strong no-underline hover:text-brand-deep hover:underline outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none',
    dl: 'm-0 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(7rem,11rem)_1fr]',
    btnBase: 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none',
  };
  C.btnPrimary = C.btnBase + ' border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white h-11 px-4 text-md min-h-11';
  C.btnSecondary = C.btnBase + ' border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink h-11 px-4 text-md min-h-11';
  C.btnSmall = C.btnBase + ' border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink h-8 px-2.5 text-sm min-h-11';

  /* ---------- Small markup helpers (live markup) ---------- */
  const TONE = {
    neutral: 'border-status-neutral-line bg-status-neutral-tint text-status-neutral',
    info: 'border-status-info-line bg-status-info-tint text-status-info',
    success: 'border-status-success-line bg-status-success-tint text-status-success',
    warning: 'border-status-warning-line bg-status-warning-tint text-status-warning',
    danger: 'border-status-danger-line bg-status-danger-tint text-status-danger',
  };
  /** Wrapping status badge (rounded-control), as in the Purchase queue and task header. */
  const badge = (tone, icon, label, sr) => `<span class="inline-flex max-w-full gap-1.5 border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold [&amp;_svg]:size-3.5 [&amp;_svg]:shrink-0 ${TONE[tone]} items-start rounded-control whitespace-normal [&amp;_svg]:mt-0.75" data-slot="status-badge" data-tone="${tone}">${ic(icon)}<span class="min-w-0 wrap-anywhere">${sr ? `<span class="sr-only">${esc(sr)}: </span>` : ''}${esc(label)}</span></span>`;
  /** Pill status badge (rounded-full), as on offer cards. */
  const pill = (tone, icon, label, sr) => `<span class="inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap [&amp;_svg]:size-3.5 [&amp;_svg]:shrink-0 ${TONE[tone]} self-start" data-slot="status-badge" data-tone="${tone}">${ic(icon)}<span class="truncate">${sr ? `<span class="sr-only">${esc(sr)}: </span>` : ''}${esc(label)}</span></span>`;
  const KIND = { hotel: ['Hotel', 'bed-double'], transfer: ['Transfer or cab', 'car-front'], activity: ['Activity', 'compass'], package: ['Package', 'map'] };
  const BOOKS = { hotel: 'the hotel', transfer: 'the cab', activity: 'the activity', package: 'the package' };
  const books = (s) => BOOKS[s.kind] || BOOKS.hotel;
  const typePill = (kind) => { const [l, i] = KIND[kind] || KIND.hotel; return `<span class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-line bg-brand-tint py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap text-brand-strong" data-slot="service-type-pill" data-type="${kind}">${ic(i, 'size-3.5 shrink-0')}<span class="sr-only">Service type: </span><span class="truncate">${l}</span></span>`; };
  const NOTICE = {
    info: ['border-status-info-line bg-status-info-tint', 'info', 'text-status-info'],
    warning: ['border-status-warning-line bg-status-warning-tint', 'triangle-alert', 'text-status-warning'],
    success: ['border-status-success-line bg-status-success-tint', 'circle-check', 'text-status-success'],
    danger: ['border-status-danger-line bg-status-danger-tint', 'circle-x', 'text-status-danger'],
    locked: ['border-line bg-wash', 'lock', 'text-quiet'],
  };
  const notice = (tone, body, title, extra, role) => { const [c, i, t] = NOTICE[tone]; return `<div role="${role || 'note'}" class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy ${c}${extra ? ' ' + extra : ''}" data-slot="notice" data-tone="${tone}">${ic(i, 'mt-0.5 size-4 shrink-0 ' + t)}<div class="min-w-0 flex-1">${title ? `<p class="m-0 font-semibold text-ink">${esc(title)}</p>` : ''}<div class="flex flex-col gap-1.5 [&amp;_p]:m-0${title ? ' mt-0.75' : ''}">${body}</div></div></div>`; };
  const internal = (text) => `<p class="m-0 flex gap-2 text-sm text-quiet" data-slot="task-internal">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}<span>${text}</span></p>`;
  const card = (id, title, sub, body, opts = {}) => `<div class="${C.card}${opts.extra ? ' ' + opts.extra : ''}" data-slot="card"><section aria-labelledby="${id}"><div class="${C.cardHead}"><div class="min-w-0"><${opts.h || 'h3'} class="${C.h2}" id="${id}">${esc(title)}</${opts.h || 'h3'}>${sub ? `<p class="m-0 text-sm text-quiet">${sub}</p>` : ''}</div>${opts.right || ''}</div><div class="px-4.5 py-4 flex flex-col gap-4">${body}</div></section></div>`;
  const dlist = (rows) => `<dl class="${C.dl}">${rows.filter(Boolean).map(([k, v, cls]) => `<dt class="text-sm font-medium text-quiet">${esc(k)}</dt><dd class="m-0 text-ink${cls ? ' ' + cls : ''}">${v}</dd>`).join('')}</dl>`;
  const summary = (rows) => `<dl class="m-0 flex flex-col divide-y divide-line font-sans" data-slot="summary-list">${rows.filter(Boolean).map(([k, v]) => `<div class="grid grid-cols-1 gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(10rem,40%)_1fr] sm:gap-4"><dt class="text-sm font-medium text-quiet">${esc(k)}</dt><dd class="m-0 wrap-break-word text-ink">${v}</dd></div>`).join('')}</dl>`;
  const tabsNav = (label, items, cur, extra) => `<nav aria-label="${esc(label)}" class="font-sans ${extra || 'mb-5'}" data-slot="tabs"><ul class="m-0 flex list-none flex-wrap gap-1 border-b border-line p-0 sm:flex-nowrap sm:overflow-x-auto">${items.map((t) => `<li class="m-0 shrink-0"><a${t.key === cur ? ' aria-current="page"' : ''} class="${C.tab}" href="${t.href}">${esc(t.label)}${t.count != null ? `<span class="sr-only">:</span><span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums">${t.count}</span>` : ''}</a></li>`).join('')}</ul></nav>`;
  const table = (label, caption, cols, rows) => `<div class="${C.card}" data-slot="card"><div class="group/table relative w-full overflow-x-auto ${C.focus} rounded-card" data-stack="true" role="region" aria-label="${esc(label)}" tabindex="0"><table role="table" class="w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block"><caption class="px-4.5 text-left text-sm caption-top border-b border-line py-3 font-medium text-copy max-sm:block">${caption}</caption><thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${C.trHead}">${cols.map((c) => `<th scope="col" role="columnheader" class="${C.th}">${esc(c)}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${rows.map((r) => `<tr role="row" class="${C.tr}">${r.map((cell, i) => `<td role="cell" data-label="${esc(cols[i])}" class="${C.td} align-top${cell.cls ? ' ' + cell.cls : ''}">${cell.html != null ? cell.html : cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div>`;
  const empty = (icon, title, text) => `<div class="${C.card}" data-slot="card"><div role="status"><div class="flex flex-col items-center px-6 py-10 text-center font-sans" data-slot="empty-state"><span class="mb-3 grid size-11 place-items-center rounded-card bg-brand-tint text-brand">${ic(icon, 'size-5')}</span><h2 class="m-0 text-lg leading-6 font-semibold text-ink">${esc(title)}</h2><p class="m-0 mt-1.5 max-w-[42ch] text-base text-quiet">${esc(text)}</p></div></div></div>`;
  const header = ({ eyebrow, title, desc, meta, actions, mb }) => `<header class="${mb === 3 ? '' : 'mb-5 '}flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between${mb === 3 ? ' mb-3' : ''}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">${eyebrow}</p><h1 class="${C.h1}">${meta != null ? `<span class="block wrap-anywhere">${esc(title)}</span>` : esc(title)}</h1>${desc ? `<p class="m-0 mt-1.5 text-base text-quiet">${desc}</p>` : ''}${meta ? `<div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${meta}</div>` : ''}</div>${actions ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&amp;&gt;*]:flex-1">${actions}</div>` : ''}</header>`;
  const backLink = (href, label) => `<p class="m-0 mb-3"><a class="${C.back}" href="${href}">${ic('chevron-left', 'size-4')}${esc(label)}</a></p>`;
  const tl = (items, label) => `<ol aria-label="${esc(label)}" class="m-0 flex list-none flex-col p-0 font-sans" data-slot="timeline">${items.map((it, i) => {
    const last = i === items.length - 1;
    const icon = it.state === 'now' ? ic('circle-dot', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-brand-strong') : it.state === 'later' ? ic('circle', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-faint') : ic('circle-check', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-status-success');
    return `<li class="relative m-0 flex gap-3 pb-4 last:pb-0"${it.state === 'now' ? ' aria-current="step"' : ''}>${last ? '' : '<span aria-hidden="true" class="absolute top-6 bottom-0 left-2.25 w-px bg-line-strong"></span>'}${icon}<div class="min-w-0 flex-1"><p class="m-0 text-base ${it.state === 'later' ? 'text-quiet' : 'text-ink'}${it.state === 'now' ? ' font-semibold' : ''}">${it.sr ? `<span class="sr-only">${it.sr}: </span>` : ''}${it.title}</p>${it.sub ? `<p class="m-0 text-sm text-quiet">${it.sub}</p>` : ''}${it.extra || ''}</div></li>`;
  }).join('')}</ol>`;
  const field = (id, label, input, hint) => `<div class="field"><label for="${id}">${esc(label)}</label>${hint ? `<span id="${id}-hint" class="hint">${hint}</span>` : ''}${input}</div>`;
  const statusSlot = () => '<div role="status" aria-live="polite" data-msg></div>';
  const fileInput = (id, nameAttr) => `<input id="${id}" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby="${id}-hint" required name="${nameAttr}"/>`;
  const FILE_HINT = 'PDF, JPG, PNG or WebP, up to 4 MB. Up to 10 files. Save a supplier’s email as PDF or take a screenshot; .eml files aren’t accepted.';

  /* Inline form messages exactly as live ProcResultMessage. */
  let flash = null; // { key, ok, text, items }
  const msgHtml = (ok, text, items) => ok
    ? `<div class="message success" role="status" data-msg><strong>Done: </strong>${esc(text)}</div>`
    : `<div class="message error" role="alert" data-msg tabindex="-1"><strong>Error: </strong>${esc(text)}${items && items.length ? `<ul class="mt-1 mb-0">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}</div>`;
  const slot = (key) => (flash && flash.key === key ? msgHtml(flash.ok, flash.text, flash.items) : statusSlot());
  /** Refuse in place: keeps everything the person typed. */
  function refuse(form, text, items) {
    const s = form.querySelector('[data-msg]');
    const html = msgHtml(false, text, items);
    if (s) s.outerHTML = html; else form.insertAdjacentHTML('afterbegin', html);
    const n = form.querySelector('[data-msg]'); if (n && n.focus) n.focus();
  }
  function done(key, text) { flash = { key, ok: true, text }; TN.refresh(); }
  const ERR = {
    forbidden: 'You can’t do this. Only the Purchase colleague who took this task works on it, managers approve, and nobody approves their own entry.',
    invalid: 'Some details aren’t valid. Check the fields and try again.',
    file: 'This file can’t be used. Upload a PDF, JPG, PNG or WebP up to 4 MB (at most 10 files). Save emails as PDF or a screenshot; .eml files aren’t accepted.',
    notReady: 'Some things are missing. Nothing was confirmed. Fix the items listed and try again.',
    confirmed: 'The supplier already confirmed this hotel. Changes after confirmation aren’t supported yet.',
    goAhead: 'Waiting for Accounts go-ahead. Accounts approves every hotel commitment.',
    bankHold: 'On hold until the Manager approves the new bank details.',
  };
  const ISSUE = {
    missing_quote: 'Add at least one open supplier offer.',
    missing_cost: 'Propose the cost you agreed with the supplier.',
    cost_not_for_quote: 'The latest cost belongs to an offer that is no longer open. Propose the cost again for an open offer.',
    over_budget: 'The cost is above the approved Purchase budget. The manager of the deal’s branch must approve this cost version before the supplier confirmation can be recorded.',
    missing_confirmation: 'Upload the supplier’s confirmation email, saved as a PDF or a screenshot (JPG, PNG or WebP).',
    go_ahead: ERR.goAhead,
    go_ahead_refused: 'Accounts did not give the go-ahead for this booking. Do not book with the supplier; ask Accounts for the reason.',
  };
  const NUM = (v) => { const n = Number(String(v || '').replace(/[₹,\s]/g, '')); return Number.isFinite(n) ? n : NaN; };

  /* =====================================================================
     Data added by Purchase at load time (never edits 00-data-base.js).
     ===================================================================== */
  // A second Purchase colleague, so "Reassign" and "taken by a colleague" can be shown.
  if (!TN.PEOPLE.purchase2) TN.PEOPLE.purchase2 = { id: 'u-purchase2', name: 'Arjun Parihar', role: 'Purchase', branch: 'Jodhpur' };
  const PURCHASE_STAFF = ['purchase', 'purchase2'];

  // Suppliers the Purchase register needs that 00 does not have yet.
  const addSup = (id, s) => { if (!D.suppliers[id]) D.suppliers[id] = s; };
  addSup('sp-blanket', { name: 'Blanket Hotel and Spa', city: 'Munnar', type: 'Hotel', verified: true, bank: 'approved' });
  addSup('sp-spicevillage', { name: 'Spice Village (CGH Earth)', city: 'Thekkady', type: 'Hotel', verified: true, bank: 'approved' });
  addSup('sp-lakeslagoons', { name: 'Lakes and Lagoons Houseboats', city: 'Alleppey', type: 'Hotel', verified: true, bank: 'approved' });
  addSup('sp-malabarcabs', { name: 'Malabar Coast Cabs', city: 'Kochi', type: 'Transfers', verified: true, bank: 'approved' });
  addSup('sp-trident', { name: 'Trident Udaipur', city: 'Udaipur', type: 'Hotel', verified: true, bank: 'approved' });
  addSup('sp-tharcamps', { name: 'Thar Desert Camps and Safaris', city: 'Jaisalmer', type: 'Activity', verified: true, bank: 'approved' });

  const SUP_EXTRA = {
    'sp-taj': ['Front office reservations', '+91 832 664 5858', 'reservations.goa@tajhotels.example', '30% at booking, balance 15 days before arrival.'],
    'sp-goacabs': ['Savio Fernandes', '+91 98221 40673', 'bookings@goacoastalcabs.example', 'Full payment on booking.'],
    'sp-arabian': ['Reservations desk', '+971 4 337 2210', 'ops@arabiannightsdmc.example', '50% deposit on confirmation, balance 7 days before arrival.'],
    'sp-mumtaz': ['Bilal Ahmad', '+91 194 245 1182', 'stay@grandmumtaz.example', 'Full payment 10 days before arrival.'],
    'sp-pinespring': ['Front office', '+91 1936 243 115', 'reservations@pinespring.example', 'Full payment 7 days before arrival.'],
    'sp-kashmircabs': ['Javed Mir', '+91 94190 21348', 'dalviewtours@gmail.example', 'Full payment on arrival in Srinagar, or by bank transfer before.'],
    'sp-asiaholidays': ['Ms. Cheryl Tan', '+65 6223 4471', 'india.desk@asiaholidays.example', 'Full payment 14 days before arrival, by SWIFT.'],
    'sp-aloha': ['Reservations', '+91 135 243 5100', 'reservations@alohaganges.example', '50% at booking, balance at check-in.'],
    'sp-marriott': ['Sales office', '+91 135 263 5700', 'jwmussoorie.res@marriott.example', 'Full payment 7 days before arrival.'],
    'sp-doontravels': ['Rakesh Negi', '+91 98370 55214', 'doonvalleytravels@gmail.example', 'Full payment after the trip.'],
    'sp-snowvalley': ['Reservations', '+91 177 265 8812', 'booking@snowvalleyresorts.example', '50% at booking, balance 7 days before arrival.'],
    'sp-span': ['Front office', '+91 1902 240 538', 'reservations@spanresort.example', 'Full payment 15 days before arrival. Non-refundable inside 15 days.'],
    'sp-himcabs': ['Gurpreet Singh', '+91 98150 37742', 'himachalhillcabs@gmail.example', '₹5,000 advance, balance after the trip.'],
    'sp-suryagarh': ['Group reservations', '+91 2992 269 269', 'groups@suryagarh.example', '50% advance to hold rooms, balance 7 days before arrival.'],
    'sp-marwarcoach': ['Mahendra Singh Bhati', '+91 94141 77260', 'marwarcoach@gmail.example', '₹10,000 advance, balance on the day of travel.'],
    'sp-blanket': ['Reservations', '+91 4865 231 071', 'reservations@blankethotel.example', 'Full payment 10 days before arrival.'],
    'sp-spicevillage': ['CGH Earth reservations', '+91 484 426 1711', 'reservations@cghearth.example', '50% at booking, balance 21 days before arrival.'],
    'sp-lakeslagoons': ['Thomas Kurian', '+91 94470 31206', 'bookings@lakeslagoons.example', 'Full payment 7 days before arrival.'],
    'sp-malabarcabs': ['Anil Menon', '+91 98470 66132', 'malabarcoastcabs@gmail.example', 'Full payment after the trip.'],
    'sp-trident': ['Reservations', '+91 294 243 2200', 'reservations.udaipur@tridenthotels.example', 'Full payment 7 days before arrival.'],
    'sp-tharcamps': ['Sawai Singh', '+91 94142 90318', 'tharcamps@gmail.example', '₹5,000 advance, balance on the day.'],
  };
  const SERVICE_TYPES = { Hotel: ['hotel'], Transfers: ['transfer'], Activity: ['activity'], 'Destination company': ['hotel', 'transfer', 'activity'] };
  const BANKS = ['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Federal Bank', 'Punjab National Bank', 'Bank of Baroda'];
  const IFSC = { 'HDFC Bank': 'HDFC000', 'State Bank of India': 'SBIN000', 'ICICI Bank': 'ICIC000', 'Axis Bank': 'UTIB000', 'Kotak Mahindra Bank': 'KKBK000', 'Federal Bank': 'FDRL000', 'Punjab National Bank': 'PUNB000', 'Bank of Baroda': 'BARB0' };
  Object.entries(D.suppliers).forEach(([id, s], i) => {
    if (s.type === 'Airline') return;
    const ex = SUP_EXTRA[id] || ['Reservations', '', '', ''];
    s.contact = s.contact || ex[0]; s.phone = s.phone || ex[1]; s.email = s.email || ex[2]; s.terms = s.terms || ex[3];
    s.services = s.services || SERVICE_TYPES[s.type] || ['hotel'];
    s.status = s.status || 'active';
    s.changedAt = s.changedAt || '2026-09-18 11:20';
    if (!s.bankRevisions) {
      const bank = BANKS[i % BANKS.length];
      const rev = (no, b, last4, at, approved) => ({ no, holder: s.name.replace(/ \(.*\)$/, ''), bank: b, ifsc: IFSC[b] + String(1000 + ((i * 37 + no * 11) % 8999)).padStart(4, '0'), last4, at, by: 'purchase', approved, approvedBy: approved ? 'manager' : null, approvedAt: approved ? '2026-09-19 10:05' : null });
      s.bankRevisions = [];
      if (s.bank === 'approved') s.bankRevisions.push(rev(1, bank, String(2000 + i * 413).slice(-4), '2026-09-18 11:40', true));
      if (s.bank === 'changed') { s.bankRevisions.push(rev(1, 'Kotak Mahindra Bank', '3381', '2026-08-02 12:15', true)); s.bankRevisions.push(rev(2, 'HDFC Bank', '7704', '2026-10-24 16:05', false)); }
      if (s.bank === 'waiting') s.bankRevisions.push(rev(1, 'Bank of Baroda', '5126', '2026-10-21 15:30', false));
    }
  });
  D.suppliers['sp-marwarcoach'].changedAt = '2026-10-21 15:10';
  D.suppliers['sp-span'].changedAt = '2026-10-24 16:05';

  // Two Kerala hotel tasks are already being prepared while Accounts reviews the booking.
  Object.assign(D.services['s-455-h1'], { assignee: 'purchase', taskStatus: 'in_progress', supplier: 'sp-blanket', cost: 30800 });
  Object.assign(D.services['s-455-h2'], { assignee: 'purchase2', taskStatus: 'in_progress', supplier: 'sp-spicevillage', cost: 38400 });

  // A returned supplier payment request (Accounts sent it back).
  if (!D.supplierPayments.some((p) => p.id === 'SP-26-0021')) {
    D.supplierPayments.push({ id: 'SP-26-0021', deal: 'BX-38390', service: 's-390-h', supplier: 'sp-arabian', amount: 56250, part: 'Balance', dueBy: '2026-11-13', raisedBy: 'purchase', raisedAt: '2026-10-25', status: 'returned', invoice: 'AND-PI-2026-1188.pdf', returnedBy: 'manager', returnedAt: '2026-10-26', returnReason: 'The balance is due on 13 Nov. Send it again in the week before, after the deposit SP-26-0030 is paid.' });
  }

  // Cancellation charges: the supplier refund Purchase entered with each charge.
  const C198 = (D.cancellations || []).find((c) => c.id === 'c-198');
  if (C198) C198.charges.forEach((ch) => {
    if (ch.supplierRefund == null) ch.supplierRefund = ch.service === 's-198-h1' ? 21900 : 0;
    if (!ch.enteredBy) { ch.enteredBy = 'purchase'; ch.enteredAt = '2026-10-26 12:40'; }
  });
  if (C198 && !C198.sentToManagerAt) { C198.sentToManagerAt = '2026-10-26 13:05'; C198.sentBy = 'purchase'; }

  /* Hotel facts per task (rooms, room type, meal plan, Sales notes). */
  const FACTS = {
    's-412-h': [1, 'Deluxe garden view', 'Breakfast', 'Airport pick-up arranged separately.', 'Ground floor room near the pool. Child is 7 years old.'],
    's-455-h1': [1, 'Premium room', 'Breakfast', 'Honeymoon cake and flower bed decoration.', 'Valley view room on a high floor if possible.'],
    's-455-h2': [1, 'Cottage', 'Breakfast and dinner', 'Plantation walk included.', ''],
    's-455-h3': [1, '1 bedroom premium houseboat', 'All meals', 'Sunset cruise on day 1.', 'Vegetarian meals only.'],
    's-390-h': [1, 'Family room', 'Breakfast', '', 'Two children aged 8 and 12. Early check-in requested.'],
    's-377-h1': [2, 'Deluxe room', 'Breakfast and dinner', '', 'Rooms next to each other.'],
    's-377-h2': [2, 'Deluxe room', 'Breakfast and dinner', 'Bonfire on one evening.', ''],
    's-301-p': [1, 'Superior room (Hotel Boss)', 'Breakfast', 'Sentosa with cable car, city tour, Gardens by the Bay.', ''],
    's-264-h1': [3, 'Ganga view room', 'Breakfast', '', 'Group of six friends. Rooms on the same floor.'],
    's-264-h2': [3, 'Deluxe room', 'Breakfast', '', ''],
    's-520-h': [1, 'Lake view room', 'Breakfast', 'Anniversary: room decoration.', ''],
    's-198-h1': [2, 'Deluxe room', 'Breakfast and dinner', '', 'Child is 10 years old; extra bed.'],
    's-198-h2': [2, 'Cottage', 'Breakfast and dinner', '', ''],
    's-547-h': [9, 'Twin sharing room', 'All meals', 'Conference hall half day on 7 Nov. Gala dinner on 7 Nov.', 'Company offsite: one bill to Marudhar Agro Foods.'],
  };

  /* Work records per task: offers, costs, files, history, e-mails. */
  const W = {};
  const work = (id) => W[id];
  const shortHotel = (t) => t.split(',')[0];
  function seed(id, s) {
    const deal = TN.deal(s.deal);
    const base = deal.submittedAt || '2026-10-20';
    const nextDay = (iso, n) => { const d = new Date(Date.parse(iso) + n * 86400000); return d.toISOString().slice(0, 10); };
    const w = { offers: [], costs: [], files: [], history: [], emails: [], approvals: {}, confirmedAt: null, confirmedBy: null };
    W[id] = w;
    w.history.push({ text: 'Task created from the submitted booking', at: `${base} 12:35` });
    if (!s.assignee && s.taskStatus === 'new') return;
    const who = s.assignee || 'purchase';
    w.history.push({ text: 'Task taken', at: `${base} 14:20`, by: who });
    if (!s.supplier || s.cost == null) return;
    const sup = TN.supplier(s.supplier);
    const d1 = nextDay(base, 1);
    const quoted = Math.round((s.cost * 1.04) / 100) * 100;
    const oid = `o-${id}-1`;
    const f = FACTS[id];
    const cust = TN.customer(deal.customer);
    const hotelish = s.kind === 'hotel' || s.kind === 'package';
    const lines = hotelish
      ? [`Hotel: ${s.title}`, `Check-in: ${date(s.start)}`, `Check-out: ${date(s.end)} (${plural(nights(s.start, s.end), 'night')})`, `Rooms: ${f ? `${f[0]} × ${f[1]}` : s.detail}`, `Meal plan: ${f ? f[2] : '—'}`, `Guests: ${travellers(deal)}`]
      : [`Service: ${s.title}`, `Dates: ${s.start === s.end ? date(s.start) : `${date(s.start)} to ${date(s.end)}`}`, `Details: ${s.detail}`, `Guests: ${travellers(deal)}`];
    if (f && f[4]) lines.push(`Special requests: ${f[4]}`);
    const leadGuest = cust.business ? `${cust.contact} (${cust.name})` : cust.name;
    const senderTitle = `${name(who)}\nPurchase, Holiday Chacha Pvt Ltd, Jodhpur`;

    const source = (sup && sup.type === 'Destination company') ? 'supplier' : ((s.kind === 'hotel' || s.kind === 'package') ? 'hotel' : 'supplier');
    const ourOfferAmt = quoted !== s.cost ? Math.round((s.cost * 0.96) / 100) * 100 : null;
    const isDone = s.taskStatus === 'supplier_confirmed' || s.taskStatus === 'done';
    const finalAmt = (isDone || quoted !== s.cost) ? s.cost : null;
    const partyName = s.kind === 'hotel' ? shortHotel(s.title) : (sup ? sup.name : s.title);
    const rates = [{ kind: 'hotel_said', amount: quoted, at: `${d1} 10:40`, by: who, party: partyName }];
    if (ourOfferAmt) rates.push({ kind: 'we_offered', amount: ourOfferAmt, at: `${d1} 11:05`, by: who, party: partyName });
    const finalAt = isDone ? `${nextDay(d1, 1)} 10:00` : `${d1} 11:30`;
    if (finalAmt) rates.push({ kind: 'final_agreed', amount: finalAmt, at: finalAt, by: who, party: partyName, remark: ourOfferAmt ? 'Came down after our offer.' : '' });
    w.offers.push({ id: oid, supplier: s.supplier, hotel: s.kind === 'hotel' ? shortHotel(s.title) : s.title, room: f ? f[1] : '', meal: f ? f[2] : '', price: quoted, ourOffer: ourOfferAmt, finalRate: finalAmt, source, rates, hold: s.kind === 'hotel' ? nextDay(d1, 5) : null, cancel: s.kind === 'hotel' ? 'Free cancellation until 15 days before arrival. 50% charge after that; no refund inside 3 days.' : 'Free cancellation until 48 hours before pick-up.', status: 'open', at: `${d1} 10:40`, by: who });
    w.history.push({ text: `${hotelish ? 'Hotel' : 'Supplier'} quoted a price (${sup.name})`, at: `${d1} 10:40`, by: who });
    if (ourOfferAmt) w.history.push({ text: `We made an offer to ${sup.name}`, at: `${d1} 11:05`, by: who });

    // Cost versions come only from a final agreed price (append-only).
    if (finalAmt) {
      w.costs.push({ v: 1, stage: 'proposed', amount: finalAmt, offer: oid, due: s.start ? nextDay(s.start, -7) : null, note: ourOfferAmt ? 'Came down after our offer.' : 'Final agreed price', at: finalAt, by: who });
      w.history.push({ text: `Final price agreed with ${sup.name}`, at: finalAt, by: who });
    }
    w.files.push({ id: `f-${id}-q`, kind: 'quote', name: `${s.supplier.replace('sp-', '')}-quote.pdf`, size: '182 KB', at: `${d1} 10:42`, by: who, state: 'stored' });
    w.history.push({ text: 'File added', at: `${d1} 10:42`, by: who });
    if (s.taskStatus === 'supplier_confirmed' || s.taskStatus === 'done') {
      const d2 = nextDay(d1, 1);
      w.files.push({ id: `f-${id}-c`, kind: 'supplier_confirmation', name: `${s.supplier.replace('sp-', '')}-confirmation.pdf`, size: '96 KB', at: `${d2} 11:55`, by: who, state: 'stored' });
      w.history.push({ text: 'File added', at: `${d2} 11:55`, by: who });
      w.costs.push({ v: w.costs.length + 1, stage: 'committed', amount: s.cost, offer: oid, due: s.start ? nextDay(s.start, -7) : null, note: '', at: `${d2} 12:00`, by: who });
      w.offers[0].status = 'selected';
      w.confirmedAt = `${d2} 12:00`; w.confirmedBy = who;
      if (!s.hotelConfirmationNo) s.hotelConfirmationNo = s.confirmationNo;
      const ex = SUP_EXTRA[s.supplier] || [];
      if (!s.hotelConfirmedBy) s.hotelConfirmedBy = ex[0] || 'Reservations';
      if (!s.hotelConfirmedPhone) s.hotelConfirmedPhone = ex[1] || '';
      if (!s.supplierConfirmedBy) s.supplierConfirmedBy = ex[0] || '';
      if (!s.supplierConfirmedPhone) s.supplierConfirmedPhone = ex[1] || '';
      w.history.push({ text: 'Supplier confirmation recorded; the agreed price is locked', at: `${d2} 12:00`, by: who });
    }
  }
  Object.entries(D.services).forEach(([id, s]) => { if (s.dept === 'purchase') seed(id, s); });
  // Spice Village: Arjun proposed above the budget; waiting for the Manager.
  (function () {
    const w = W['s-455-h2'];
    if (!w) return;
    const why = 'Cottages are in peak season; the hotel will not go lower. Breakfast and dinner included.';
    Object.assign(w.costs[0], { due: '2026-11-13', note: why });
    w.offers[0].rates.filter((r) => r.kind === 'final_agreed').forEach((r) => { r.remark = why; });
  })();
  // Kashmir cab and Goa cab: Purchase added a second, withdrawn offer, as in live use.
  if (W['s-412-t']) W['s-412-t'].offers.push({ id: 'o-s-412-t-2', supplier: 'sp-goacabs', hotel: 'Airport transfers, Goa', room: 'Tempo Traveller', meal: '', price: 8200, hold: null, cancel: '', status: 'withdrawn', note: 'Above the approved budget.', at: '2026-10-20 11:05', by: 'purchase' });

  // One canonical rate ledger: offer.rates. Views only project these records.
  const RATE_TYPES = ['hotel_said', 'we_offered', 'supplier_revised', 'final_agreed'];
  const rateRecords = (id) => (W[id]?.offers || []).flatMap((offer) =>
    (offer.rates || []).map((rate) => ({ ...rate, offer })))
    .filter((r) => r.task === id && Number.isFinite(r.amount) && r.amount > 0 && RATE_TYPES.includes(r.kind))
    .sort((a, b) => a.round - b.round);
  const hotelKey = (id) => D.services[id].hotelId || `task-hotel:${id}`;
  function appendRate(id, offer, entry) {
    const round = rateRecords(id).reduce((n, r) => Math.max(n, r.round), 0) + 1;
    const rate = Object.freeze({ ...entry, id: entry.id || uid('rate'), task: id,
      hotelId: hotelKey(id), supplier: offer.supplier,
      supplierId: (entry.source || offer.source) === 'supplier' ? offer.supplier : null,
      source: entry.source || offer.source || 'hotel', round, remark: entry.remark || '',
      finalStatus: entry.kind === 'final_agreed' ? 'agreed' : null });
    (offer.rates ||= []).push(rate);
    return rate;
  }

  // Static preview persistence, local to this browser/origin; not a database.
  const PURCHASE_STORE = 'tripnavigate.purchase.v3'; // v3: one negotiation log (1 Nov 2026); older saved states are dropped
  function persistPurchase() {
    const services = Object.fromEntries(Object.keys(W).map((id) => [id, D.services[id]]));
    localStorage.setItem(PURCHASE_STORE, JSON.stringify({ version: 3, work: W, services,
      suppliers: D.suppliers, payments: D.supplierPayments }));
  }
  try {
    const saved = JSON.parse(localStorage.getItem(PURCHASE_STORE) || 'null');
    if (saved?.version === 3 && saved.work && saved.services) {
      for (const [id, w] of Object.entries(saved.work)) {
        if (!W[id] || !Array.isArray(w.offers) || !Array.isArray(w.costs) || !Array.isArray(w.files) || !Array.isArray(w.history) || !w.approvals || saved.services[id]?.deal !== D.services[id].deal) continue;
        if (w.offers.some((o) => (o.rates || []).some((r) => r.task && r.task !== id))) continue;
        W[id] = w;
        Object.assign(D.services[id], saved.services[id]);
      }
      if (saved.suppliers) Object.assign(D.suppliers, saved.suppliers);
      if (Array.isArray(saved.payments)) D.supplierPayments = saved.payments;
    }
  } catch (error) {
    console.warn('Purchase preview storage could not be restored.', error);
  }
  // Migrate seed/Step 1 records once; preserve their amounts, creators and dates.
  for (const [id, w] of Object.entries(W)) {
    const entries = w.offers.flatMap((offer) => (offer.rates || []).map((rate) => ({ offer, rate })))
      .sort((a, b) => String(a.rate.at).localeCompare(String(b.rate.at)));
    let round = entries.reduce((n, x) => Math.max(n, x.rate.round || 0), 0);
    entries.forEach(({ offer, rate }, i) => {
      const migrated = Object.freeze({ ...rate, id: rate.id || `rate-${id}-${offer.id}-${i + 1}`,
        task: id, hotelId: rate.hotelId || hotelKey(id), supplier: offer.supplier,
        supplierId: (rate.source || offer.source) === 'supplier' ? offer.supplier : null,
        source: rate.source || offer.source || 'hotel', round: rate.round || ++round,
        remark: rate.remark || '', finalStatus: rate.kind === 'final_agreed' ? 'agreed' : null });
      offer.rates[offer.rates.indexOf(rate)] = migrated;
    });
  }
  const refreshPurchase = TN.refresh;
  TN.refresh = (...args) => {
    try { persistPurchase(); } catch (error) { TN.toast('Browser storage is unavailable. Changes may not survive a refresh.', 'danger'); }
    return refreshPurchase(...args);
  };
  const goPurchase = TN.go;
  TN.go = (...args) => {
    try { persistPurchase(); } catch (error) { TN.toast('Browser storage is unavailable. Changes may not survive a refresh.', 'danger'); }
    return goPurchase(...args);
  };

  // Sort history newest first when shown.
  const historyOf = (id) => (W[id] ? W[id].history.slice().sort((a, b) => (a.at < b.at ? 1 : -1)) : []);
  const log = (id, text) => { if (W[id]) W[id].history.push({ text, at: now(), by: meKey() }); };
  const pushNotice = (to, text, deal, href) => { D.notices.unshift({ id: uid('n'), to, kind: 'notice', text, deal, href, at: now() }); };

  /* ---------- Task-level derived state ---------- */
  const isPurchaseTask = (s) => s && s.dept === 'purchase';
  const tasks = () => Object.entries(D.services).filter(([, s]) => s.dept === 'purchase').map(([id, s]) => ({ id, ...s }));
  const isConfirmed = (s) => s.taskStatus === 'supplier_confirmed' || s.taskStatus === 'done';
  const latestCost = (id) => { const c = W[id] ? W[id].costs : []; return c.length ? c[c.length - 1] : null; };
  const rupees = (n) => {
    if (n == null || n === '') return '—';
    const v = Math.round(Number(n));
    return (v < 0 ? '−' : '') + '₹' + Math.abs(v).toLocaleString('en-IN');
  };
  const needsGoAhead = (s) => s.goAhead != null && s.goAhead !== 'given';
  const overBudgetWaiting = (id, s) => { const c = latestCost(id); return !!(c && c.stage === 'proposed' && s.budget != null && c.amount > s.budget && !W[id].approvals[c.v]); };
  function issues(id, s) {
    const w = W[id]; const out = [];
    const open = w.offers.filter((o) => o.status === 'open');
    if (!open.length) out.push('missing_quote');
    const c = latestCost(id);
    if (!c) out.push('missing_cost');
    else if (!open.some((o) => o.id === c.offer)) out.push('cost_not_for_quote');
    if (overBudgetWaiting(id, s)) out.push('over_budget');
    if (!w.files.some((f) => f.kind === 'supplier_confirmation' && f.state === 'stored')) out.push('missing_confirmation');
    if (s.goAhead === 'refused') out.push('go_ahead_refused');
    else if (needsGoAhead(s)) out.push('go_ahead');
    return out;
  }
  const canWork = (s) => TN.is('purchase') && s.assignee === meKey() && !isConfirmed(s) && s.taskStatus !== 'cancelled';
  function taskStatusBadge(s) {
    if (s.taskStatus === 'cancelled') return badge('neutral', 'circle-minus', 'Cancelled', 'Task status');
    if (isConfirmed(s)) return badge('success', 'circle-check', 'Confirmed by supplier', 'Task status');
    if (!s.assignee) return badge('neutral', 'hourglass', 'Waiting to be taken', 'Task status');
    return badge('info', 'pencil-line', 'In progress · not booked yet', 'Task status');
  }
  const goAheadBadge = (s) => {
    if (!s.goAhead || isConfirmed(s)) return '';
    if (s.goAhead === 'given') return badge('success', 'circle-check', 'Accounts go-ahead given', 'Accounts');
    if (s.goAhead === 'refused') return badge('danger', 'circle-x', 'Go-ahead refused by Accounts', 'Accounts');
    return badge('warning', 'hourglass', 'Waiting for Accounts go-ahead', 'Accounts');
  };
  const takenBy = (s) => (!s.assignee ? 'Not taken yet' : s.assignee === meKey() ? 'You' : name(s.assignee));
  const supplierPays = (sid, dealId) => D.supplierPayments.filter((p) => p.supplier === sid && p.deal === dealId && p.status !== 'returned');
  const dealTripEnded = (deal) => deal && deal.end && deal.end < TN.TODAY;
  const invoicesOf = (id) => D.supplierInvoices.filter((i) => i.service === id);
  const invoiceMissing = (id, s) => isConfirmed(s) && dealTripEnded(TN.deal(s.deal)) && !invoicesOf(id).some((i) => i.kind === 'Invoice' && i.status !== 'returned');
  const bankBlocked = (sid) => { const sp = TN.supplier(sid); return !!sp && (sp.bank === 'changed' || sp.bank === 'waiting'); };
  /** Internal yes/no only: has enough verified customer money arrived to pay this supplier now? The amount never reaches Purchase screens. */
  function customerMoneyShort(dealId, amount) {
    const verified = D.receipts.filter((r) => r.deal === dealId && r.status === 'verified').reduce((a, r) => a + r.amount, 0);
    const out = D.supplierPayments.filter((p) => p.deal === dealId && p.status !== 'returned' && !p.funding).reduce((a, p) => a + p.amount, 0);
    return amount > verified - out;
  }

  /* =====================================================================
     #/app/purchase · Purchase tasks queue (LIVE)
     ===================================================================== */
  function stayCell(s) {
    if (s.kind !== 'hotel' && s.kind !== 'package') return { html: '<span class="text-quiet">Not a hotel</span>', cls: 'text-sm' };
    return { html: `<span class="whitespace-nowrap">${date(s.start)}</span> → <span class="whitespace-nowrap">${date(s.end)}</span> · ${plural(nights(s.start, s.end), 'night')}`, cls: 'text-sm' };
  }
  function roomsCell(id, s) {
    const deal = TN.deal(s.deal);
    const f = FACTS[id];
    return { html: esc((f && (s.kind === 'hotel' || s.kind === 'package') ? plural(f[0], 'room') + ' · ' : '') + travellers(deal)), cls: 'text-sm' };
  }
  function detailsCell(t) {
    const sub = t.kind === 'hotel' || t.kind === 'package' ? '' : `<span class="block text-sm text-quiet">${esc(t.detail)}</span>`;
    return `<span class="flex flex-col items-start gap-1.5 max-sm:items-end">${typePill(t.kind)}<a class="${C.rowLink}" href="#/app/purchase/${t.id}">${esc(t.title)}<span class="sr-only"> — open task</span></a>${sub}</span>`;
  }
  function renderQueue(params, q) {
    const mgr = TN.is('manager');
    const all = tasks().filter((t) => t.taskStatus !== 'cancelled');
    const notTaken = all.filter((t) => !t.assignee);
    const mine = all.filter((t) => t.assignee === meKey());
    const show = q.show || (mgr ? 'all' : 'not_taken');
    const list = show === 'mine' ? mine : show === 'not_taken' ? notTaken : all;
    list.sort((a, b) => (a.start < b.start ? -1 : 1));
    const tabs = mgr
      ? [{ key: 'not_taken', label: 'Not taken', href: '#/app/purchase?show=not_taken', count: notTaken.length }, { key: 'all', label: 'All', href: '#/app/purchase', count: all.length }]
      : [{ key: 'not_taken', label: 'Not taken', href: '#/app/purchase', count: notTaken.length }, { key: 'mine', label: 'Mine', href: '#/app/purchase?show=mine', count: mine.length }, { key: 'all', label: 'All', href: '#/app/purchase?show=all', count: all.length }];
    // The type pill sits above the service name: eight columns made Status wrap one letter per line.
    const rows = list.map((t) => [
      detailsCell(t),
      stayCell(t),
      roomsCell(t.id, t),
      { html: t.budget != null ? money(t.budget) : 'Budget not set', cls: 'whitespace-nowrap tabular-nums' },
      { html: `<span class="flex min-w-48 flex-col items-start gap-1.5 max-sm:items-end">${taskStatusBadge(t)}${needsGoAhead(t) && !isConfirmed(t) ? goAheadBadge(t) : ''}${overBudgetWaiting(t.id, t) ? badge('warning', 'hourglass', mgr ? 'Price above budget · your approval' : 'Price above budget · waiting for Manager', 'Cost') : ''}</span>` },
      takenBy(t),
      { html: `<span class="whitespace-nowrap">${esc(t.deal)}</span> · Jodhpur`, cls: 'text-sm' },
    ]);
    const emptyText = show === 'mine' ? ['No tasks taken by you', 'Open the Not taken tab to pick one up.'] : show === 'not_taken' ? ['Every task is taken', 'New hotel, transfer and activity tasks appear here when Sales submits a booking.'] : ['No Purchase tasks yet', 'Tasks appear here when Sales submits a booking with hotels, transfers or activities.'];
    return `<div class="font-sans text-base text-copy">
      ${header({ eyebrow: 'Purchase', title: 'Purchase tasks', desc: 'Hotels, transfers and activities from submitted bookings. Each counts as booked only after you record the supplier’s confirmation.' })}
      <div class="mb-4">${internal('Customer prices and proof files are never shown here.')}${mgr ? '<p class="m-0 mt-1.5 text-copy">Purchase colleagues take these tasks. You can follow progress here.</p>' : ''}</div>
      ${tabsNav('Purchase task filters', tabs, show, 'mb-4')}
      ${list.length ? table('Purchase tasks table', `${list.length} ${list.length === 1 ? 'task' : 'tasks'}`, ['Service', 'Stay', 'Rooms and travellers', 'Approved budget', 'Status', 'Taken by', 'Deal'], rows) : empty(show === 'mine' ? 'briefcase' : 'inbox', emptyText[0], emptyText[1])}
    </div>`;
  }

  /* =====================================================================
     #/app/purchase/:taskId · task page (LIVE tabs + PENDING cards)
     ===================================================================== */
  function nextLine(id, s) {
    const dl = TN.deal(s.deal);
    const cx = dl && dl.cancellation ? (D.cancellations || []).find((x) => x.id === dl.cancellation) : null;
    if (cx && cx.status === 'waiting_manager') return '<span class="font-semibold text-ink">Next:</span> the Branch Manager approves the cancellation charges';
    if (cx && (cx.status === 'requested' || cx.status === 'charges_entered')) return `<span class="font-semibold text-ink">Next:</span> ${cx.status === 'requested' ? 'enter the supplier’s cancellation charges' : 'send the cancellation charges to the Manager'}`;
    if (isConfirmed(s)) {
      if (invoiceMissing(id, s)) return '<span class="font-semibold text-ink">Next:</span> upload the supplier’s original invoice';
      return 'Nothing waiting.';
    }
    if (!s.assignee) return '<span class="font-semibold text-ink">Next:</span> take this task';
    if (overBudgetWaiting(id, s)) return `<span class="font-semibold text-ink">Next:</span> ${TN.is('manager') ? 'you approve or return the price above budget on the Work tab' : 'the Branch Manager approves the price above budget'}`;
    if (s.assignee !== meKey()) return `<span class="font-semibold text-ink">Next:</span> ${esc(name(s.assignee))} works on this task`;
    const is = issues(id, s);
    if (is.includes('missing_quote')) return `<span class="font-semibold text-ink">Next:</span> ask ${isHotelish(s) ? 'the hotel' : 'the supplier'} for rates and add the price to the negotiation log`;
    if (is.includes('missing_cost')) return '<span class="font-semibold text-ink">Next:</span> record the final agreed price in Rate negotiation';
    if (is.includes('go_ahead')) return '<span class="font-semibold text-ink">Next:</span> wait for the Accounts go-ahead, then send the booking request';
    if (!W[id].emails.some((e) => e.kind === 'booking')) return '<span class="font-semibold text-ink">Next:</span> send the booking request, then record the supplier’s confirmation';
    return '<span class="font-semibold text-ink">Next:</span> record the supplier’s confirmation';
  }
  function internalLine(id, s) {
    const w = W[id];
    if (isConfirmed(s)) return internal(`Internal task — supplier confirmed on ${esc(dt(w.confirmedAt))}. The CRM sent nothing to the customer. No payment, bill or invoice was created.`);
    const who = s.kind === 'hotel' ? 'the hotel' : 'the supplier';
    if (!s.assignee) return internal(`Internal task — ${books(s)} is not booked yet. Nothing has been sent to ${who} or the customer by the CRM.`);
    return internal(`Internal task — ${books(s)} is not booked yet. Taking the task did not book ${books(s)}. Nothing has been sent to ${w.emails.length ? '' : `${who} or `}the customer by the CRM.`);
  }

  function renderTask(params, q) {
    const id = params.taskId;
    const s = TN.service(id);
    if (!isPurchaseTask(s) || !W[id]) return `${backLink('#/app/purchase', 'Back to Purchase tasks')}${empty('search-x', 'Task not found', 'We couldn’t find this. It may have been removed, or you may not have access.')}`;
    const deal = TN.deal(s.deal);
    const sales = TN.is('sales');
    let tab = q.tab || 'details';
    const kindLabel = (KIND[s.kind] || KIND.hotel)[0];
    let actions = '';
    if (TN.is('purchase') && !s.assignee && s.taskStatus !== 'cancelled') {
      actions = `<form class="flex flex-col items-start gap-2 sm:items-end" data-act="pur-take" data-id="${id}"><p id="claim-help" class="m-0 text-sm text-quiet">Shows colleagues you are handling it. It does not book ${books(s)}.</p><button type="submit" class="${C.btnPrimary}" data-slot="button" aria-describedby="claim-help">Take this task</button><div role="status" aria-live="polite" class="w-full"></div></form>`;
    }
    const viewOnly = !sales && s.assignee && s.assignee !== meKey() ? `<p class="m-0 text-sm text-copy">You can view this but not change it. Purchase in Jodhpur works on it.</p>` : '';
    // Money fence: Sales never sees supplier prices or Purchase files, so Sales gets Details and History only.
    const tabs = [
      { key: 'details', label: 'Details', href: `#/app/purchase/${id}` },
      sales ? null : { key: 'work', label: 'Work', href: `#/app/purchase/${id}?tab=work` },
      sales ? null : { key: 'files', label: 'Files', href: `#/app/purchase/${id}?tab=files` },
      { key: 'history', label: 'History', href: `#/app/purchase/${id}?tab=history` },
    ].filter(Boolean);
    if (sales && (tab === 'work' || tab === 'files')) tab = 'details';
    const body = tab === 'work' ? workTab(id, s, deal) : tab === 'files' ? filesTab(id, s, deal) : tab === 'history' ? historyTab(id) : detailsTab(id, s, deal);
    return `<div class="font-sans text-base text-copy">
      ${backLink(sales ? `#/app/deals/${esc(s.deal)}` : '#/app/purchase', sales ? 'Back to the Deal' : 'Back to Purchase tasks')}
      ${header({ eyebrow: `${kindLabel} task · ${esc(s.deal)}`, title: s.title, meta: `${typePill(s.kind)}${taskStatusBadge(s)}${sales ? '' : goAheadBadge(s)}<span class="text-copy">Taken by: ${esc(takenBy(s))}</span>`, actions, mb: 3 })}
      <div class="mb-4 flex flex-col gap-1.5"><p class="m-0 text-copy" data-slot="task-next">${nextLine(id, s)}</p>${viewOnly}${internalLine(id, s)}</div>
      ${tabsNav('Task sections', tabs, tab)}
      ${body}
    </div>`;
  }

  /* Traveller details and ID proofs: compact card with "View all ID proofs" button opening the popup modal */
  function travellerCard(id, deal, cust) {
    const people = TN.travellersOf(deal.id);
    const missing = people.filter((p) => !p.id).length;
    const attached = people.length - missing;

    const summaryBadge = missing
      ? `<span class="inline-flex items-center gap-1 rounded-full border border-status-warning-line bg-status-warning-tint px-2.5 py-0.5 text-xs font-semibold text-status-warning">${ic('circle-alert', 'size-3 shrink-0')}${missing} missing</span>`
      : `<span class="inline-flex items-center gap-1 rounded-full border border-status-success-line bg-status-success-tint px-2.5 py-0.5 text-xs font-semibold text-status-success">${ic('circle-check', 'size-3 shrink-0')}All ID proofs attached</span>`;

    const headActions = people.length
      ? `<button type="button" class="button secondary sm inline-flex items-center gap-2 font-semibold shrink-0 cursor-pointer" data-act="pur-view-id-proofs" data-id="${id}" data-deal="${deal.id}">${ic('file-text', 'size-4 shrink-0 text-brand-strong')}View all ID proofs (${attached}/${people.length})</button>`
      : '';

    return `<div class="${C.card}" data-slot="card">
      <section aria-labelledby="id-proofs-heading">
        <div class="p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="min-w-0 flex-1 flex flex-col gap-1">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h2 class="${C.h2}" id="id-proofs-heading">Traveller details and ID proofs</h2>
              ${summaryBadge}
            </div>
            <p class="m-0 text-sm text-copy">
              <strong class="font-semibold text-ink">Client:</strong> ${esc(TN.clientName(cust))}
              <span class="text-quiet"> · ${people.length} travellers in booking</span>
            </p>
            <p class="m-0 text-xs text-quiet">
              <span class="inline-flex items-center gap-1.5">${ic('lock', 'size-3.5 shrink-0 text-faint')}Private identity details for this work. Every view is recorded. Do not copy or forward them.</span>
            </p>
          </div>
          ${headActions}
        </div>
      </section>
    </div>`;
  }

  /* Action: Show all passenger ID proofs in a modal popup */
  TN.act('pur-view-id-proofs', (el) => {
    const dealId = el.dataset.deal;
    const serviceId = el.dataset.id;
    const focusName = el.dataset.focus;
    const deal = TN.deal(dealId);
    if (!deal) return;
    const cust = TN.customer(deal.customer);
    const people = TN.travellersOf(deal.id);
    const missing = people.filter((p) => !p.id).length;
    const attached = people.length - missing;

    const listHtml = people.map((p, idx) => {
      const kind = p.type === 'child' ? 'Child' : 'Adult';
      const age = TN.ageOn(p.dob, deal.start);
      const isFocused = focusName && p.name === focusName;

      return `<li class="m-0 flex flex-col gap-2 rounded-control border ${isFocused ? 'border-brand-strong bg-brand-tint/30 ring-1 ring-brand-strong' : 'border-line bg-canvas'} p-3.5 transition-all">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="inline-flex items-center gap-2 min-w-0">
            <span class="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand-tint text-[11px] font-bold text-brand-strong">${idx + 1}</span>
            <span class="font-semibold text-ink text-base truncate">${esc(p.name)}</span>
            <span class="rounded bg-page border border-line px-1.5 py-0.5 text-xs text-quiet">${kind}</span>
            ${isFocused ? '<span class="rounded bg-brand-tint px-1.5 py-0.5 text-[10px] font-bold text-brand-strong uppercase">Selected</span>' : ''}
          </div>
          <div class="text-xs text-quiet tabular-nums shrink-0">
            DOB: <strong class="font-medium text-ink">${esc(date(p.dob))}</strong>${age != null ? ` (${plural(age, 'year')} old at travel)` : ''}
          </div>
        </div>

        ${p.id ? `
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-wash/60 px-3 py-2 text-xs">
            <div class="inline-flex items-center gap-2.5 min-w-0">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-status-success-tint text-status-success">
                ${ic('file-check-corner', 'size-4.5')}
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-semibold text-ink">${esc(p.id.kind)}</span>
                  <span class="text-quiet">·</span>
                  <span class="font-mono text-copy font-medium truncate">${esc(p.id.file)}</span>
                </div>
                <div class="text-[11px] text-quiet">
                  Size: ${esc(p.id.size)} · Attached: ${esc(date(p.id.at))}
                </div>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <a class="button secondary sm inline-flex items-center gap-1" href="#/app/purchase/${serviceId}?tab=files" data-close rel="noopener">
                ${ic('folder-open', 'size-3.5 shrink-0')}Open in Files
              </a>
            </div>
          </div>
        ` : `
          <div class="flex items-center gap-2.5 rounded-control border border-status-danger-line/60 bg-status-danger-tint/30 px-3 py-2 text-xs text-status-danger">
            ${ic('circle-alert', 'size-4 shrink-0 text-status-danger')}
            <span class="font-medium">No ID proof attached yet. Ask the salesperson to collect and attach it.</span>
          </div>
        `}
      </li>`;
    }).join('');

    const bodyHtml = `
      <div class="flex flex-col gap-3 font-sans">
        <div class="rounded-control border border-line bg-wash p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div class="inline-flex items-center gap-1.5 text-quiet">
            ${ic('lock', 'size-3.5 text-faint shrink-0')}
            <span>Private identity documents. Views are recorded. Do not forward.</span>
          </div>
          <div class="text-copy">
            <strong class="font-medium text-ink">Client:</strong> ${esc(TN.clientName(cust))}
          </div>
        </div>

        <div class="flex items-center justify-between text-xs px-1">
          <span class="text-quiet">${people.length} Travellers in this booking</span>
          <span class="${missing ? 'text-status-warning font-semibold' : 'text-status-success font-semibold'}">
            ${attached} of ${people.length} ID proofs attached${missing ? ` (${missing} missing)` : ''}
          </span>
        </div>

        <ul class="m-0 flex list-none flex-col gap-2.5 p-0 max-h-[55vh] overflow-y-auto pr-1" aria-label="Passenger ID proofs list">
          ${listHtml || '<li class="p-4 text-center text-quiet">No traveller details found.</li>'}
        </ul>
      </div>
    `;

    TN.dialog({
      title: 'Traveller ID Proofs',
      description: deal.title || `Deal ${deal.id}`,
      body: bodyHtml,
      footer: `<div class="flex w-full items-center justify-between">
        <span class="text-xs text-quiet">${attached} attached · ${missing} missing</span>
        <button type="button" class="button secondary" data-close>Close</button>
      </div>`,
      cls: 'max-w-2xl'
    });
  });

  /* ---------- What Sales booked (Book now breakup, Sales' cost estimate) ---------- */
  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /** "6–8 Nov 2026", "28 Nov – 2 Dec 2026", "30 Dec 2026 – 2 Jan 2027". */
  function dateRange(a, b) {
    if (!b || a === b) return date(a);
    const [y1, m1, d1] = a.split('-').map(Number); const [y2, m2, d2] = b.split('-').map(Number);
    if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MON3[m1 - 1]} ${y1}`;
    if (y1 === y2) return `${d1} ${MON3[m1 - 1]} – ${d2} ${MON3[m2 - 1]} ${y1}`;
    return `${date(a)} – ${date(b)}`;
  }
  const isHotelish = (s) => s.kind === 'hotel' || s.kind === 'package';
  const supName = (sid) => (TN.supplier(sid) || {}).name || '—';
  const qtyLabel = (r) => r.kind === 'room' ? plural(r.qty, 'room') : r.kind === 'extra' ? plural(r.qty, 'extra bed') : plural(r.qty, 'guest');
  /** Sales' line-by-line breakup as a live stacked table (no card around it). */
  function breakupTable(id, b) {
    const cols = ['Room or bed', 'Quantity', 'Cost per night', 'Nights', 'Line total'];
    const rows = b.rows.map((r) => [esc(r.label), esc(qtyLabel(r)), { html: `${money(r.rate)}<span class="block text-sm text-quiet">${r.kind === 'room' ? 'per room' : r.kind === 'extra' ? 'per extra bed' : 'per guest'}</span>`, cls: 'tabular-nums' }, String(r.nights), { html: money(r.total), cls: 'whitespace-nowrap font-semibold text-ink tabular-nums' }]);
    return `<div class="group/table relative w-full overflow-x-auto rounded-control border border-line ${C.focus}" data-stack="true" role="region" aria-label="Room breakup from Sales" tabindex="0"><table role="table" class="w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block"><thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${C.trHead}">${cols.map((c) => `<th scope="col" role="columnheader" class="${C.th}">${esc(c)}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${rows.map((r) => `<tr role="row" class="${C.tr}">${r.map((cell, i) => `<td role="cell" data-label="${esc(cols[i])}" class="${C.td} align-top${cell.cls ? ' ' + cell.cls : ''}">${cell.html != null ? cell.html : cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  const specialRequest = (id) => { const f = FACTS[id]; return f && f[4] ? notice('warning', `<p>${esc(f[4])}</p>`, 'Special request') : ''; };
  /** Everything Sales entered for this service. compact = the Work tab version (no travellers/stay rows repeated twice). */
  function bookedBody(id, s, deal) {
    const f = FACTS[id];
    const b = isHotelish(s) ? TN.hotelBreakup(id) : null;
    const facts = isHotelish(s)
      ? [['Stay', `${esc(date(s.start))} → ${esc(date(s.end))} · ${plural(nights(s.start, s.end), 'night')}`], ['Travellers', esc(travellers(deal))], ['Meal plan', esc(f && f[2] ? f[2] : 'Not given')], ['Inclusions', esc(f && f[3] ? f[3] : 'None')]]
      : [['Dates', esc(dateRange(s.start, s.end))], ['Details', esc(s.detail)], ['Place', esc(deal.destination)], ['Travellers', esc(travellers(deal))]];
    if (isHotelish(s) && !b) facts.splice(2, 0, ['Rooms', esc(f ? `${f[0]} × ${f[1]}` : s.detail)]);
    let money2 = '';
    if (b) {
      const rows = [['Total budget', `<span class="font-semibold text-ink tabular-nums">${money(b.total)}</span> <span class="text-quiet">(${money(b.perNight)} a night × ${plural(b.nights, 'night')})</span>`]];
      if (s.budget != null && s.budget !== b.total) rows.push(['Approved budget', `<span class="tabular-nums">${money(s.budget)}</span>`]);
      money2 = `${breakupTable(id, b)}${summary(rows)}`;
    } else {
      money2 = `${isHotelish(s) ? notice('info', TN.is('sales') ? '<p>No room breakup was entered in Book now for this service.</p>' : '<p>Sales did not give a room breakup. Ask Sales if you need the rate per room.</p>') : ''}${summary([['Total budget', s.budget != null ? `<span class="font-semibold text-ink tabular-nums">${money(s.budget)}</span>` : 'Budget not set']])}`;
    }
    return `${dlist(facts)}${money2}${specialRequest(id)}`;
  }
  function bookedCard(id, s, deal) {
    const title = s.kind === 'hotel' ? 'What Sales booked for this hotel' : s.kind === 'package' ? 'What Sales booked for this package' : 'What Sales booked';
    const sub = TN.is('sales') ? `Entered by ${esc(name(deal.owner))} in Book now. The rates are your cost estimate, the budget Purchase works to.` : `Entered by ${esc(name(deal.owner))} in Book now. The rates are Sales’ cost estimate, which is your budget.`;
    return card('task-booked', title, sub, bookedBody(id, s, deal), { h: 'h2' });
  }

  function detailsTab(id, s, deal) {
    const cust = TN.customer(deal.customer);
    const origin = card('task-origin', 'Where this came from', '', dlist([['Deal', esc(deal.id)], ['Branch', 'Jodhpur'], ['Task created', esc(dt((deal.submittedAt || TN.TODAY) + ' 12:35'))]]), { h: 'h2' });
    const ids = TN.is('sales') ? '' : travellerCard(id, deal, cust);
    return `<div class="flex flex-col gap-5">${bookedCard(id, s, deal)}${ids}${origin}</div>`;
  }

  function historyTab(id) {
    const h = historyOf(id);
    const items = h.map((e) => ({ state: 'done', title: esc(e.text), sub: `${esc(dt(e.at))}${e.by ? ` · by ${esc(byWho(e.by))}` : ''}` }));
    return card('task-history-heading', 'History', 'What happened on this task. No amounts are shown here.', h.length ? tl(items, 'Task history, newest first') : '<p class="m-0 text-quiet">Nothing has happened on this task yet.</p>', { h: 'h2' }).replace('px-4.5 py-4 flex flex-col gap-4', 'px-4.5 py-4');
  }

  /* ---------- Work tab ---------- */
  const PART_LABEL = { deposit: 'Deposit', balance: 'Balance', full: 'Full payment' };
  const PAY = {
    requested: ['info', 'send', 'Requested', 'Accounts approves.'],
    waiting_manager: ['warning', 'hourglass', 'Waiting for Manager', 'Above ₹50,000 for this supplier on this Deal, so the Branch Manager approves.'],
    approved: ['info', 'circle-check', 'Approved', 'Accounts pays it and records the bank reference.'],
    paid: ['success', 'circle-check', 'Paid', 'A second Accounts person checks the payment.'],
    verified: ['success', 'badge-check', 'Verified', 'Paid and checked by a second Accounts person.'],
    returned: ['danger', 'circle-x', 'Returned', ''],
    on_hold: ['neutral', 'clock', 'On hold', ERR.bankHold],
  };
  const payBadge = (p) => { const [t, i, l] = PAY[p.status] || PAY.requested; return badge(t, i, l, 'Payment request'); };

  // Shared by Work-tab booking and payment actions; confirmation evidence is not needed for an advance.
  function workCostIssue(id, s) {
    const c = latestCost(id);
    const o = c && W[id].offers.find((x) => x.id === c.offer && x.status !== 'withdrawn');
    if (!c || !o || o.supplier !== s.supplier) return 'Record the final agreed price in Rate negotiation first.';
    if (s.budget == null) return 'The budget must be set before booking or asking for a payment.';
    if (overBudgetWaiting(id, s)) return ISSUE.over_budget;
    return '';
  }
  /** Why an action is blocked right now, in one short sentence ('' = allowed).
      action: 'rate' | 'booking' | 'confirm' | 'pay'. */
  function blockReason(id, s, action) {
    if (s.taskStatus === 'cancelled') return 'This task is cancelled.';
    if (isConfirmed(s) && action !== 'pay') return 'The supplier already confirmed. The agreed price is locked.';
    if (!s.assignee) return 'Take this task first (button at the top of the page).';
    if (s.assignee !== meKey()) return `${name(s.assignee)} works on this task, so only they can do this.`;
    if (action === 'rate') return '';
    if (s.goAhead === 'refused') return ISSUE.go_ahead_refused;
    if (needsGoAhead(s)) return 'Waiting for the Accounts go-ahead. Accounts approves every hotel commitment before you book.';
    const c = latestCost(id);
    if (!c) return 'Record the final agreed price in Rate negotiation first.';
    const w = W[id];
    if (w.costReturned && w.costReturned.v === c.v && !w.approvals[c.v]) return `The Branch Manager did not approve this price: “${w.costReturned.reason}”. Agree a new price with the supplier.`;
    if (overBudgetWaiting(id, s)) return 'The agreed price is above the budget. Waiting for the Branch Manager to approve it.';
    const cost = workCostIssue(id, s);
    if (cost) return cost;
    if (action === 'pay' && s.supplier && bankBlocked(s.supplier)) return ERR.bankHold;
    return '';
  }
  const blockNotice = (key, reason) => (reason ? `<div id="block-${key}">${notice(/^Take this task/.test(reason) ? 'info' : 'warning', `<p>${esc(reason)}</p>`)}</div>` : '');
  // Live "unavailable" button: stays focusable, looks disabled, and is described by the notice that says why.
  const btnState = (key, reason) => (reason ? ` aria-disabled="true" aria-describedby="block-${key}"` : '');
  /** A click on an unavailable button repeats the reason instead of acting. */
  const blockedClick = (el) => {
    if (!el || !el.getAttribute || el.getAttribute('aria-disabled') !== 'true') return false;
    const why = document.getElementById(el.getAttribute('aria-describedby') || '');
    TN.toast(why ? why.textContent.trim() : 'Not available yet.', 'warning');
    return true;
  };

  /* Other Purchase services of the same Deal, as live link tabs. */
  function dealServicesSwitcher(deal, curId) {
    const svcs = TN.servicesOf(deal.id).filter((x) => x.dept === 'purchase');
    if (svcs.length < 2) return '';
    const items = svcs.map((svc) => ({ key: svc.id, href: `#/app/purchase/${svc.id}?tab=work`, label: `${(KIND[svc.kind] || KIND.hotel)[0]} · ${svc.title.split(/,| and /)[0]}${isConfirmed(svc) ? ' · confirmed' : ''}` }));
    return tabsNav(`Purchase services in ${deal.id}`, items, curId, 'mb-0');
  }

  /* Workflow progress tracker stepper (Take task -> Get rates -> Final rate -> Booking confirmed -> Payment) */
  function purchaseProgress(id, s, w) {
    const records = rateRecords(id);
    const agreedCost = latestCost(id);
    const final = agreedCost && records.filter((r) => r.kind === 'final_agreed' && r.offer.id === agreedCost.offer && r.amount === agreedCost.amount && (!agreedCost.rateId || r.id === agreedCost.rateId)).slice(-1)[0];
    const payments = D.supplierPayments.filter((p) => p.service === id && p.supplier === s.supplier && (p.status === 'paid' || p.status === 'verified'));
    const paidTotal = payments.reduce((total, p) => total + p.amount, 0);
    const step1Done = !!s.assignee;
    const step2Done = step1Done && records.some((r) => r.kind === 'hotel_said' || r.kind === 'supplier_revised');
    const step3Done = step2Done && !!final && !workCostIssue(id, s) &&
      (agreedCost.amount <= s.budget || !!w.approvals[agreedCost.v]);
    const step4Done = step3Done && isConfirmed(s) && !!w.confirmedAt && !!w.confirmedBy &&
      w.files.some((f) => f.kind === 'supplier_confirmation' && f.state === 'stored');
    const step5Done = step4Done && paidTotal > 0 && paidTotal >= agreedCost.amount;
    return [
      { key: 'take', label: 'Take task', done: step1Done },
      { key: 'rates', label: 'Get rates', done: step2Done },
      { key: 'final', label: 'Final rate', done: step3Done },
      { key: 'confirm', label: 'Booking confirmed', done: step4Done },
      { key: 'pay', label: 'Payment', done: step5Done },
    ];
  }
  function workflowStepperCard(id, s, w) {
    const steps = purchaseProgress(id, s, w);
    const current = steps.findIndex((step) => !step.done);
    const costBlock = workCostIssue(id, s);
    const bookingBlock = needsGoAhead(s) ? 'Waiting for Accounts go-ahead' : costBlock;
    const paymentBlock = s.supplier && bankBlocked(s.supplier) ? 'Supplier bank details on hold' : bookingBlock;
    return `<div class="${C.card}" data-slot="card"><ol aria-label="Purchase progress" class="purchase-progress">${steps.map((step, i) => {
      const reason = step.done ? '' : s.taskStatus === 'cancelled' ? 'Task cancelled' : step.key === 'confirm' ? bookingBlock : step.key === 'pay' ? paymentBlock : '';
      const blocked = !!reason;
      const active = i === current && !blocked;
      const status = step.done ? 'Completed' : blocked ? 'Blocked' : active ? 'Current step' : 'Pending';
      const circle = step.done ? 'is-complete' : blocked ? 'is-blocked' : active ? 'is-current' : 'is-pending';
      return `<li${active ? ' aria-current="step"' : ''} class="purchase-progress-step">${i < steps.length - 1 ? `<span aria-hidden="true" class="purchase-progress-line${step.done && steps[i + 1].done ? ' is-complete' : ''}"></span>` : ''}<span aria-hidden="true" class="purchase-progress-circle ${circle}">${step.done ? ic('check', 'size-4') : blocked ? ic('lock', 'size-4') : i + 1}</span><span class="purchase-progress-label">${step.label}</span><span class="purchase-progress-status">${status}</span>${blocked ? `<span class="purchase-progress-reason">${esc(reason)}</span>` : ''}</li>`;
    }).join('')}</ol></div>`;
  }

  /* Hotel (or service) summary: the full Sales breakup, the special request, and the two e-mails. */
  function bookingSummaryCard(id, s, deal, w) {
    const purchaseSide = TN.is('purchase');
    const title = isHotelish(s) ? `${shortHotel(s.title)} · ${(s.title.split(',')[1] || deal.destination).trim()}` : s.title;
    const rateBlock = blockReason(id, s, 'rate');
    const bookBlock = blockReason(id, s, 'booking');
    const sentBooking = w.emails.some((e) => e.kind === 'booking' && e.dir !== 'in');
    let actions = '';
    if (purchaseSide && !isConfirmed(s) && s.taskStatus !== 'cancelled') {
      const shared = rateBlock && rateBlock === bookBlock;
      actions = `<div class="flex flex-col gap-2"><div class="flex flex-wrap gap-2">
        <button type="button" class="button secondary" data-act="pur-mail" data-id="${id}" data-kind="rate"${btnState(shared ? 'mail' : 'rate', rateBlock)}>${ic('mail', 'size-4')}Ask for rates</button>
        <button type="button" class="button" data-act="pur-mail" data-id="${id}" data-kind="booking"${btnState(shared ? 'mail' : 'booking', bookBlock)}>${ic('send', 'size-4')}${sentBooking ? 'Send booking request again' : 'Send booking request'}</button>
      </div>${shared ? blockNotice('mail', rateBlock) : `${blockNotice('rate', rateBlock)}${bookBlock ? blockNotice('booking', `Send booking request: ${bookBlock}`) : ''}`}</div>`;
    }
    const right = isConfirmed(s) ? badge('success', 'circle-check', 'Booked and confirmed', 'Booking') : badge('info', 'circle-play', 'Not booked yet', 'Booking');
    return card('work-summary', title, `${typeLabel(s)} for ${esc(s.deal)}. Exactly what Sales entered in Book now.`, `${bookedBody(id, s, deal)}${actions}`, { right });
  }
  const typeLabel = (s) => (KIND[s.kind] || KIND.hotel)[0];

  /* ---------- Rate negotiation: one summary line, one form, one log ---------- */
  const LOG_KIND = { quoted: 'hotel_said', offered: 'we_offered', agreed: 'final_agreed' };
  const quotedWord = (s) => (isHotelish(s) ? 'Hotel quoted' : 'Supplier quoted');
  const rateWord = (s, kind) => ({ hotel_said: quotedWord(s), supplier_revised: quotedWord(s), we_offered: 'We offered', final_agreed: 'Final agreed' }[kind] || kind);
  const offerSuppliers = (s) => Object.entries(D.suppliers).filter(([, x]) => x.type !== 'Airline' && x.status === 'active' && (x.services || []).includes(s.kind === 'package' ? 'hotel' : s.kind));
  /** Suppliers worth listing for this task: those in its city or destination, plus any already used. */
  const nearSuppliers = (id, s) => {
    const all = offerSuppliers(s);
    const used = new Set([s.supplier, ...(W[id] ? W[id].offers.map((o) => o.supplier) : [])]);
    const where = `${(TN.deal(s.deal) || {}).destination || ''} ${s.title}`.toLowerCase();
    const near = all.filter(([k, x]) => used.has(k) || (x.city && where.includes(x.city.toLowerCase())));
    return near.length ? near : all;
  };
  const cap = (text) => String(text).charAt(0).toUpperCase() + String(text).slice(1);
  /** Newest-first log: prices, e-mails marked as sent, Manager decisions, confirmation. */
  function negotiationLog(id, s) {
    const w = W[id];
    const out = rateRecords(id).map((r) => ({ at: r.at, by: r.by, kind: r.kind, title: `<strong>${esc(rateWord(s, r.kind))}</strong> · <span class="tabular-nums">${money(r.amount)}</span>`, sub: supName(r.offer.supplier), note: r.remark, perNight: r.perNight }));
    w.emails.forEach((e, idx) => {
      if (e.dir === 'in' || (e.kind !== 'rate' && e.kind !== 'booking')) return;
      out.push({ at: e.at, by: e.by, kind: 'mail', title: `<strong>${e.kind === 'booking' ? 'Booking request e-mailed' : 'Rate request e-mailed'}</strong>`, sub: `to ${esc(e.to || supName(e.supplier))}`, extra: `<button type="button" class="${C.btnSmall} mt-1.5" data-act="pur-view-email" data-id="${id}" data-idx="${idx}">${ic('mail', 'size-4')}View e-mail</button>` });
    });
    Object.entries(w.approvals || {}).forEach(([v, a]) => {
      if (a.carriedFrom) return;
      const c = w.costs.find((x) => String(x.v) === String(v));
      if (c && c.stage === 'proposed') out.push({ at: a.at, by: a.by, kind: 'approved', title: `<strong>Branch Manager approved the price above budget</strong> · <span class="tabular-nums">${money(c.amount)}</span>` });
    });
    if (w.costReturned) { const c = w.costs.find((x) => x.v === w.costReturned.v); out.push({ at: w.costReturned.at, by: 'manager', kind: 'returned', title: `<strong>Branch Manager did not approve the price</strong>${c ? ` · <span class="tabular-nums">${money(c.amount)}</span>` : ''}`, note: w.costReturned.reason }); }
    const committed = w.costs.filter((c) => c.stage === 'committed').slice(-1)[0];
    if (isConfirmed(s) && committed) out.push({ at: w.confirmedAt || committed.at, by: w.confirmedBy || committed.by, kind: 'locked', title: `<strong>Supplier confirmed · price locked</strong> · <span class="tabular-nums">${money(committed.amount)}</span>` });
    // Newest first; within the same minute the later step (approval, confirmation) comes first.
    return out.map((e, i) => ({ ...e, i })).sort((a, b) => String(b.at).localeCompare(String(a.at)) || b.i - a.i);
  }
  function negotiationCard(id, s, w) {
    const mine = canWork(s);
    const mgr = TN.is('manager');
    const records = rateRecords(id);
    const lastOf = (kinds) => records.filter((r) => kinds.includes(r.kind) && (!s.supplier || r.offer.supplier === s.supplier)).slice(-1)[0] || records.filter((r) => kinds.includes(r.kind)).slice(-1)[0];
    const quoted = lastOf(['hotel_said', 'supplier_revised']);
    const offered = lastOf(['we_offered']);
    const lc = latestCost(id);
    const compare = lc ? lc.amount : quoted ? quoted.amount : null;
    let gap = '';
    if (compare != null && s.budget != null) {
      const d = compare - s.budget;
      const what = lc ? '' : ' (latest quote)';
      gap = d > 0 && lc && w.approvals[lc.v] ? badge('info', 'circle-check', `${rupees(d)} over budget · approved by the Branch Manager`, 'Budget') : d > 0 ? badge('warning', 'triangle-alert', `${rupees(d)} over budget${what}`, 'Budget') : d < 0 ? badge('success', 'circle-check', `${rupees(-d)} under budget${what}`, 'Budget') : badge('success', 'circle-check', `At budget${what}`, 'Budget');
    }
    const cell = (k, v, sub) => `<div class="min-w-0"><dt class="text-sm font-medium text-quiet">${k}</dt><dd class="m-0 font-semibold text-ink tabular-nums">${v}</dd>${sub ? `<dd class="m-0 text-sm text-quiet">${sub}</dd>` : ''}</div>`;
    const sumLine = `<div class="flex flex-col gap-2.5"><dl class="m-0 grid grid-cols-2 gap-x-4 gap-y-3 lg:grid-cols-4">${cell('Budget', s.budget != null ? money(s.budget) : 'Not set')}${cell(`Latest ${isHotelish(s) ? 'hotel' : 'supplier'} price`, quoted ? money(quoted.amount) : '—', quoted ? esc(supName(quoted.offer.supplier)) : '')}${cell('Our last offer', offered ? money(offered.amount) : '—')}${cell('Agreed price', lc ? money(lc.amount) : 'Not agreed yet', lc ? (lc.stage === 'committed' ? 'Locked by the supplier’s confirmation' : esc(supName((w.offers.find((o) => o.id === lc.offer) || {}).supplier))) : '')}</dl>${gap ? `<div>${gap}</div>` : ''}</div>`;

    // Manager approval above budget (live refusal: nobody approves their own price).
    let approval = '';
    if (!isConfirmed(s) && lc && overBudgetWaiting(id, s)) {
      const returned = w.costReturned && w.costReturned.v === lc.v;
      if (returned) approval = notice('danger', `<p>The Branch Manager did not approve ${money(lc.amount)}: “${esc(w.costReturned.reason)}”. Agree a new price with the supplier, or ask Sales to raise the budget.</p>`, 'Price not approved');
      else if (mgr) approval = notice('warning', `<p>The agreed price ${money(lc.amount)} is ${rupees(lc.amount - s.budget)} above the budget of ${money(s.budget)}. Approve it if you agree.</p><form novalidate aria-label="Approve the price above budget" data-act="pur-approve-cost" data-id="${id}" data-v="${lc.v}">${slot('approve')}<p id="approve-cost-help" class="hint mb-0">Approves only this price. A newer price needs a new approval. Nothing is paid.</p><button type="submit" class="button" aria-describedby="approve-cost-help">Approve this price above budget</button></form><p class="m-0 text-sm">To return it with a reason, use <a class="${C.rowLink}" href="#/app/approvals">Approvals</a>.</p>`, 'Above the budget');
      else approval = notice('warning', `<p>The agreed price ${money(lc.amount)} is ${rupees(lc.amount - s.budget)} above the budget. The Branch Manager must approve it before you book.</p>`, 'Waiting for the Branch Manager');
    } else if (mgr && flash && flash.key === 'approve') approval = msgHtml(true, flash.text);

    let form = '';
    if (mine) {
      const sups = nearSuppliers(id, s);
      const def = s.supplier || (sups[0] && sups[0][0]);
      const b = isHotelish(s) ? TN.hotelBreakup(id) : null;
      const kinds = [['quoted', quotedWord(s)], ['offered', 'We offered'], ['agreed', 'Final agreed']];
      form = `<form novalidate aria-label="Add to the negotiation log" data-act="pur-log-add" data-id="${id}" class="flex flex-col gap-1 border-t border-line pt-4">${slot('log')}
        <fieldset class="group fin-modes"><legend>What happened?</legend><div class="fin-segment">${kinds.map(([k, l], i) => `<label class="fin-segment-option${i === 0 ? ' is-selected' : ''}"><input type="radio" name="kind" value="${k}"${i === 0 ? ' checked' : ''} data-change="pur-log-kind"/><span class="fin-segment-label">${esc(l)}</span></label>`).join('')}</div></fieldset>
        <div class="form-grid">
          ${field('log-supplier', 'Supplier', `<select id="log-supplier" name="supplierId" required>${sups.map(([k, x]) => `<option value="${k}"${k === def ? ' selected' : ''}>${esc(x.name)}${x.city && !x.name.includes(x.city) ? ` · ${esc(x.city)}` : ''}</option>`).join('')}</select>`)}
          ${field('log-amount', isHotelish(s) ? 'Amount for the whole stay (₹)' : 'Total amount (₹)', '<input id="log-amount" name="amountRupees" inputmode="decimal" autocomplete="off" required aria-describedby="log-amount-hint"/>', isHotelish(s) ? 'All rooms, all nights.' : 'The full price for this service.')}
          ${b ? field('log-pernight', 'Or per room per night (₹)', `<input id="log-pernight" name="perNight" inputmode="decimal" autocomplete="off" aria-describedby="log-pernight-hint" data-pernight data-units="${b.rooms * b.nights}"/>`, `Optional. Fills the total for ${plural(b.rooms, 'room')} × ${plural(b.nights, 'night')}.`) : ''}
        </div>
        ${field('log-note', 'Note (optional)', '<input id="log-note" name="note" maxlength="200" autocomplete="off" aria-describedby="log-note-hint"/>', isHotelish(s) ? 'For example: “Includes the gala dinner” or “Hotel will not go lower”.' : 'For example: “Includes pick-up and drop”.')}
        <div><button type="submit" class="button">Add to log</button></div>
      </form>`;
    }
    const items = negotiationLog(id, s).map((e) => ({ state: 'done', title: e.title, sub: `${e.sub ? `${e.sub} · ` : ''}${esc(dt(e.at))} · by ${esc(byWho(e.by))}`, extra: `${e.perNight ? `<p class="m-0 text-sm text-copy tabular-nums">${money(e.perNight)} per room per night</p>` : ''}${e.note ? `<p class="m-0 text-sm text-copy whitespace-pre-wrap wrap-break-word">${esc(e.note)}</p>` : ''}${e.extra || ''}` }));
    const logHtml = `<section aria-labelledby="neg-log-heading" class="flex flex-col gap-3 border-t border-line pt-4"><h4 id="neg-log-heading" class="m-0 text-base font-semibold text-ink">Log, newest first</h4>${items.length ? tl(items, 'Negotiation log, newest first') : `<p class="m-0 text-quiet">Nothing recorded yet. Ask the ${isHotelish(s) ? 'hotel' : 'supplier'} for rates, then add what they quote.</p>`}</section>`;
    const sub = mine ? `Record every price the ${isHotelish(s) ? 'hotel' : 'supplier'} gives and every offer you make. “Final agreed” sets the price you book at.` : isConfirmed(s) ? 'The agreed price is locked by the supplier’s confirmation.' : 'Prices recorded by Purchase while agreeing the price.';
    return card('work-negotiation', 'Rate negotiation', sub, `${sumLine}${approval}${form}${logHtml}`);
  }

  /* ---------- Supplier confirmation: the single next step after a final price ---------- */
  function confirmationCard(id, s, w) {
    const confirmed = isConfirmed(s);
    const proof = w.files.filter((f) => f.kind === 'supplier_confirmation' && f.state === 'stored').slice(-1)[0];
    if (confirmed) {
      const committed = w.costs.filter((c) => c.stage === 'committed').slice(-1)[0];
      const body = summary([
        ['Confirmation number', `<strong>${esc(s.hotelConfirmationNo || s.confirmationNo || '—')}</strong>`],
        s.confirmationNo && s.hotelConfirmationNo && s.confirmationNo !== s.hotelConfirmationNo ? ['Supplier’s reference', esc(s.confirmationNo)] : null,
        ['Confirmed by', `${esc(s.hotelConfirmedBy || '—')}${s.hotelConfirmedPhone ? ` · ${esc(s.hotelConfirmedPhone)}` : ''}`],
        ['Agreed price', committed ? `<span class="font-semibold tabular-nums">${money(committed.amount)}</span> · locked` : '—'],
        ['Confirmation e-mail', proof ? `<a class="${C.fileLink}" href="#/app/purchase/${id}?tab=files">${esc(proof.name)}</a>` : 'Not attached'],
        ['Recorded', `${esc(cap(byWho(w.confirmedBy)))} · ${esc(dt(w.confirmedAt))}`],
      ]);
      return card('work-confirm', 'Supplier confirmation', 'Nothing was paid and nothing was sent to the customer.', `${flash && flash.key === 'confirm' ? msgHtml(true, flash.text) : ''}${body}`, { right: badge('success', 'circle-check', 'Confirmed by supplier', 'Supplier') });
    }
    const purchaseSide = TN.is('purchase');
    const reason = blockReason(id, s, 'confirm');
    let body = `<p class="m-0 text-copy">When the ${isHotelish(s) ? 'hotel' : 'supplier'} confirms the booking, record its confirmation number and attach its confirmation e-mail. This locks the agreed price.</p>`;
    if (purchaseSide && s.taskStatus !== 'cancelled') {
      body += `<div class="flex flex-col gap-2"><div><button type="button" class="button" aria-haspopup="dialog" data-act="pur-open-confirm"${btnState('confirm', reason)}>Record supplier confirmation</button></div>${blockNotice('confirm', reason)}</div>`;
      if (!reason) body += confirmDialog(id, s, proof);
    } else if (!purchaseSide) body += `<p class="m-0 text-sm text-quiet">${s.assignee ? `${esc(name(s.assignee))} records the confirmation.` : 'The Purchase colleague who takes this task records the confirmation.'}</p>`;
    return card('work-confirm', 'Supplier confirmation', '', body, { right: badge('info', 'circle-play', 'Not confirmed yet', 'Supplier') });
  }
  function confirmDialog(id, s, proof) {
    const lc = latestCost(id);
    return `<dialog class="confirm-dialog" id="pur-confirm-dialog" aria-labelledby="pur-confirm-title" aria-describedby="pur-confirm-desc"><div class="confirm-dialog-body"><h2 id="pur-confirm-title">Record the supplier’s confirmation</h2><div id="pur-confirm-desc"><ul><li>Locks the agreed price${lc ? ` of ${money(lc.amount)}` : ''} with ${esc(supName(s.supplier))}. It can’t be changed afterwards.</li><li>It does not pay the supplier or message the customer.</li></ul></div>
      <form novalidate data-act="pur-confirm" data-id="${id}">${statusSlot()}
      ${field('dlg-hotel-ref', isHotelish(s) ? 'Hotel confirmation number' : 'Confirmation number', '<input id="dlg-hotel-ref" maxlength="120" required autocomplete="off" name="hotelReference"/>')}
      ${field('dlg-supplier-ref', 'Supplier’s own reference (optional)', '<input id="dlg-supplier-ref" maxlength="120" autocomplete="off" name="reference" aria-describedby="dlg-supplier-ref-hint"/>', 'Only when a supplier or DMC gave a separate number.')}
      ${field('dlg-hotel-by', 'Confirmed by (name)', '<input id="dlg-hotel-by" maxlength="120" required autocomplete="off" name="hotelConfirmedBy"/>')}
      ${field('dlg-hotel-phone', 'Their phone', '<input id="dlg-hotel-phone" type="tel" inputmode="tel" maxlength="40" required autocomplete="off" name="hotelPhone"/>')}
      ${field('dlg-proof', proof ? 'Confirmation e-mail (optional)' : 'Confirmation e-mail', `<input id="dlg-proof" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby="dlg-proof-hint" name="proof"${proof ? '' : ' required'}/>`, proof ? `Already attached: ${esc(proof.name)}. Add another file only if needed.` : 'Save the e-mail as a PDF or take a screenshot (JPG, PNG or WebP), up to 4 MB.')}
      <div class="dialog-actions"><button type="button" class="button secondary" data-act="pur-close-dialog">Go back</button><button type="submit" class="button">Record confirmation</button></div></form></div></dialog>`;
  }

  function workTab(id, s, deal) {
    const w = W[id];
    const mine = canWork(s);
    const mgr = TN.is('manager');
    const purchaseSide = TN.is('purchase');
    const confirmed = isConfirmed(s);
    const sup = s.supplier ? TN.supplier(s.supplier) : null;
    const lc = latestCost(id);

    // Purchase files.
    const fileLi = (fl) => `<li class="m-0 flex flex-wrap items-start gap-3 rounded-control border px-3.5 py-2.5 border-line bg-canvas">${ic('file-check-corner', 'mt-0.5 size-4 shrink-0 text-status-success')}<div class="min-w-40 flex-1"><p class="m-0 font-medium wrap-anywhere text-ink"><a href="#/app/purchase/${id}?tab=files" class="${C.fileLink}">${esc(fl.name)}</a></p><p class="m-0 text-sm text-quiet">${esc({ quote: 'Supplier quote', supplier_confirmation: 'Supplier confirmation e-mail', other: 'Other Purchase file' }[fl.kind] || 'Purchase file')} · ${esc(fl.size)}</p></div>${mine ? `<div class="shrink-0"><form novalidate data-act="pur-remove-file" data-id="${id}" data-file="${fl.id}"><button type="submit" class="button secondary">Remove<span class="visually-hidden"> ${esc(fl.name)}</span></button></form></div>` : ''}</li>`;
    const upload = mine ? `<form novalidate aria-label="Upload a Purchase file" data-act="pur-upload" data-id="${id}">${slot('file')}<div class="form-grid">${field('pfile-kind', 'What is this file?', '<select id="pfile-kind" name="kind"><option value="quote">Supplier quote</option><option value="supplier_confirmation">Supplier confirmation e-mail</option><option value="other">Other Purchase file</option></select>')}${field('pfile-file', 'File', fileInput('pfile-file', 'file'), FILE_HINT)}</div><button type="submit" class="button secondary">Upload file</button></form>` : '';
    const files = card('work-files', 'Purchase files', 'Supplier quotes and confirmations. Only the Purchase team sees them.', `${w.files.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Purchase files">${w.files.map(fileLi).join('')}</ul>` : '<p class="m-0 text-quiet">No files yet.</p>'}${upload}`);

    // Supplier payments.
    const pays = D.supplierPayments.filter((p) => p.service === id);
    const payLi = (p) => { const sp = TN.supplier(p.supplier); const fund = p.funding ? D.funding.find((x) => x.id === p.funding) : null; return `<li class="m-0 flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3"><div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-base font-semibold text-ink tabular-nums">${esc(p.id)} · ${money(p.amount)} · ${p.advance ? 'Advance before confirmation' : esc(p.part)}</p>${payBadge(p)}</div><p class="m-0 text-sm text-quiet">${esc(sp.name)} · due ${esc(date(p.dueBy))} · requested by ${esc(byWho(p.raisedBy))} on ${esc(date(p.raisedAt))}${p.invoice ? ` · ${esc(p.invoice)}` : ''}</p>${p.status === 'paid' || p.status === 'verified' ? `<p class="m-0 text-sm text-copy">Paid on ${esc(date(p.paidAt))} · ${esc(p.bankRef)}</p>` : ''}${p.status === 'returned' ? `<p class="m-0 text-sm text-copy">Returned by ${esc(name(p.returnedBy))}: ${esc(p.returnReason)}</p>` : ''}${p.status === 'on_hold' ? `<p class="m-0 text-sm text-copy">${esc(ERR.bankHold)}</p>` : ''}${fund ? `<p class="m-0 text-sm text-copy">Company funding ${esc(fund.id)}: ${esc(FUND_LABEL[fund.status] || fund.status)}</p>` : ''}${mgr && p.status === 'waiting_manager' ? `<p class="m-0 text-sm"><a class="${C.rowLink}" href="#/app/approvals">Open in Approvals</a></p>` : ''}</li>`; };
    let payFoot = '';
    if (purchaseSide && s.assignee === meKey() && s.taskStatus !== 'cancelled' && sup && lc) {
      const reason = blockReason(id, s, 'pay');
      payFoot = `<p class="m-0 text-sm text-copy">${confirmed ? 'Ask for the remaining supplier payment against the agreed price.' : 'You can ask for an advance before the supplier confirms. It does not mark the booking as confirmed.'}</p><div class="flex flex-col gap-2"><div><button type="button" class="button secondary" data-act="pur-pay" data-id="${id}"${btnState('pay', reason)}>${confirmed ? 'Request supplier payment' : 'Request advance payment'}</button></div>${blockNotice('pay', reason)}</div>`;
    }
    const payCard = card('work-pay', 'Supplier payments', 'Accounts approves up to ₹50,000 for a supplier on a Deal; above that, the Branch Manager. Accounts pays and records the bank reference.', `${pays.length ? `<ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Payment requests for this service">${pays.map(payLi).join('')}</ul>` : '<p class="m-0 text-quiet">No payment requested yet.</p>'}${payFoot}`);

    // LIVE: hand back (assignee) / reassign (Manager).
    const release = mine ? card('work-release', 'Hand the task back', '', `<form novalidate aria-label="Hand the task back" data-act="pur-release" data-id="${id}"><p id="release-help" class="hint mb-0">The task goes back to the queue. Prices, e-mails and files stay for the next person.</p><button type="submit" class="button secondary" aria-describedby="release-help">Hand the task back</button></form>`) : '';
    const others = PURCHASE_STAFF.filter((k) => k !== s.assignee);
    const reassign = mgr && s.assignee && !confirmed ? card('work-reassign', 'Reassign task', `Currently with ${esc(name(s.assignee))}.`, `<form novalidate aria-label="Reassign task" data-act="pur-reassign" data-id="${id}">${slot('reassign')}${field('reassign-to', 'Move to', `<select id="reassign-to" name="toUserId" required aria-describedby="reassign-to-hint">${others.map((k) => `<option value="${k}">${esc(name(k))}</option>`).join('')}</select>`, 'Moves the task to another Purchase colleague. Prices, e-mails and files stay.')}<button type="submit" class="button secondary">Reassign task</button></form>`) : '';

    const goNotice = !confirmed && s.assignee && s.goAhead === 'refused' ? notice('danger', `<p>${esc(ISSUE.go_ahead_refused)}</p>`, 'Go-ahead refused') : '';
    const showPending = s.assignee || confirmed;
    return `<div class="flex flex-col gap-5"><section class="flex flex-col gap-5" aria-label="Work on this task">${cancellationCard(id, s, deal)}${dealServicesSwitcher(deal, id)}${workflowStepperCard(id, s, w)}${goNotice}${bookingSummaryCard(id, s, deal, w)}${negotiationCard(id, s, w)}${confirmationCard(id, s, w)}${showPending ? payCard : ''}${files}${release}${reassign}</section></div>`;
  }

  /* ---------- PENDING: cancellation charges (BX-38198, c-198) ---------- */
  const CANCEL_LABEL = {
    requested: ['warning', 'hourglass', 'Enter supplier charges'],
    charges_entered: ['info', 'pencil-line', 'Charges entered · send to the Manager'],
    waiting_manager: ['warning', 'hourglass', 'Waiting for the Branch Manager'],
    approved: ['success', 'circle-check', 'Approved by the Branch Manager'],
    refund_paid: ['success', 'circle-check', 'Closed'],
    closed: ['success', 'circle-check', 'Closed'],
  };
  function cancellationCard(id, s, deal) {
    const c = deal.cancellation ? (D.cancellations || []).find((x) => x.id === deal.cancellation) : null;
    if (!c) return '';
    let ch = c.charges.find((x) => x.service === id);
    const mine = TN.is('purchase') && s.assignee === meKey();
    const editable = mine && ['requested', 'charges_entered', 'waiting_manager'].includes(c.status);
    const lab = CANCEL_LABEL[c.status] || CANCEL_LABEL.requested;
    const lc = latestCost(id);
    const cn = invoicesOf(id).filter((i) => i.kind === 'Credit note');
    const entered = c.charges.filter((x) => x.supplierCharge != null).length;
    const allSvc = TN.servicesOf(c.deal).filter((x) => x.dept === 'purchase').length;
    const rows = ch && ch.supplierCharge != null
      ? summary([['Committed cost', lc ? money(lc.amount) : '—'], ['Supplier keeps', `<span class="tabular-nums">${money(ch.supplierCharge)}</span>`], ['Supplier refunds', `<span class="tabular-nums">${money(ch.supplierRefund)}</span>`], ch.note ? ['Note', esc(ch.note)] : null, ['Entered', `${esc(name(ch.enteredBy))} · ${esc(dt(ch.enteredAt))}`], ['Credit note', cn.length ? cn.map((i) => `${esc(i.number)} · ${invBadge(i)}`).join('<br/>') : 'Not uploaded yet']])
      : '<p class="m-0 text-copy">The supplier’s charge for this service is not entered yet.</p>';
    const btns = editable ? `<div class="flex flex-wrap gap-2"><button type="button" class="button secondary" data-act="pur-charges" data-id="${id}">${ch && ch.supplierCharge != null ? 'Change charges' : 'Enter charges'}</button>${!cn.length ? `<button type="button" class="button secondary" data-act="pur-invoice" data-id="${id}" data-kind="Credit note">Upload credit note</button>` : ''}${c.status !== 'waiting_manager' ? `<button type="button" class="button" data-act="pur-send-charges" data-cancel="${c.id}" data-id="${id}">Send charges to the Manager</button>` : ''}</div>` : '';
    const sentLine = c.status === 'waiting_manager' && c.sentToManagerAt ? `<p class="m-0 text-sm text-quiet">Sent to the Branch Manager by ${esc(name(c.sentBy))} on ${esc(dt(c.sentToManagerAt))}. Changing a charge takes it back until you send it again.</p>` : '';
    return `<div class="${C.card}" data-slot="card"><section aria-labelledby="work-cancel"><div class="${C.cardHead} max-sm:flex-col max-sm:items-start"><div class="flex min-w-0 flex-col gap-2"><h3 class="${C.h2}" id="work-cancel">Trip cancelled: supplier charges</h3>${badge(lab[0], lab[1], lab[2], 'Cancellation')}<p class="m-0 text-copy">Sales asked to cancel the whole trip on ${esc(date(c.at))}. Enter what this supplier keeps and refunds, and upload its credit note. The Branch Manager approves the charges; Accounts handles the money.</p></div></div><div class="px-4.5 py-4 flex flex-col gap-4">${slot('cancel')}${rows}<p class="m-0 text-sm text-quiet">${entered} of ${allSvc} services of this Deal have their charges entered.</p>${sentLine}${btns}</div></section></div>`;
  }

  /* ---------- Files tab (LIVE + PENDING supplier invoices) ---------- */
  const INV = { uploaded: ['info', 'info', 'Uploaded · Accounts to check'], accepted: ['success', 'circle-check', 'Accepted by Accounts'], returned: ['danger', 'circle-x', 'Returned by Accounts'] };
  const invBadge = (i) => { const [t, ic2, l] = INV[i.status] || INV.uploaded; return badge(t, ic2, l, 'Accounts check'); };
  function filesTab(id, s, deal) {
    const w = W[id];
    const purch = w.files.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Purchase files">${w.files.map((f) => `<li class="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">${ic('file-text', 'size-4 shrink-0 text-faint')}<a href="#/app/purchase/${id}?tab=files" rel="noopener" class="rounded-chip font-medium wrap-anywhere text-brand-strong underline underline-offset-4 hover:text-brand-deep ${C.focus}">${esc(f.name)}</a><span class="text-quiet">${esc({ quote: 'Supplier quote', supplier_confirmation: 'Supplier confirmation email', other: 'Other Purchase file' }[f.kind])} · ${esc(f.size)} · ${esc(dt(f.at))}</span></li>`).join('')}</ul>` : '<p class="m-0 text-sm text-quiet">No Purchase files yet.</p>';
    const invs = invoicesOf(id);
    const mineSide = TN.is('purchase') && s.assignee === meKey();
    const missing = invoiceMissing(id, s);
    const invList = invs.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Supplier invoices and credit notes">${invs.map((i) => `<li class="m-0 flex flex-wrap items-start gap-3 rounded-control border px-3.5 py-2.5 border-line bg-canvas">${ic('receipt', 'mt-0.5 size-4 shrink-0 text-quiet')}<div class="min-w-40 flex-1"><p class="m-0 font-medium wrap-anywhere text-ink"><a href="#/app/purchase/${id}?tab=files" class="${C.fileLink}">${esc(i.file)}</a></p><p class="m-0 text-sm text-quiet">${esc(i.kind)} ${esc(i.number)} · ${esc(date(i.date))} · ${money(i.amount)} · GST ${money(i.gst)} · uploaded by ${esc(byWho(i.by))}</p>${i.status === 'returned' && i.returnReason ? `<p class="m-0 text-sm text-copy">Reason: ${esc(i.returnReason)}</p>` : ''}</div><div class="shrink-0">${invBadge(i)}</div></li>`).join('')}</ul>` : '<p class="m-0 text-sm text-quiet">No supplier invoice or credit note yet.</p>';
    const remind = missing ? notice('warning', `<p>The trip ended on ${esc(date(deal.end))}. Upload the supplier’s original invoice so Accounts can check it and close this booking.</p>`, 'Original invoice missing') : '';
    const invBtns = mineSide && s.supplier ? `<div class="flex flex-wrap gap-2"><button type="button" class="button secondary" data-act="pur-invoice" data-id="${id}" data-kind="Invoice">Upload supplier invoice</button><button type="button" class="button secondary" data-act="pur-invoice" data-id="${id}" data-kind="Credit note">Upload credit note</button></div>` : '';
    return `<div class="${C.card}" data-slot="card"><section aria-labelledby="task-files-heading"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.h2}" id="task-files-heading">Files</h2><p class="m-0 text-sm text-quiet">Only files for this task. Customer payment proofs and acceptance messages are never listed here.</p></div>${ic('folder-open', 'size-4 text-faint')}</div><div class="px-4.5 py-4 flex flex-col gap-4">
      ${flash && flash.key === 'invoice' ? msgHtml(true, flash.text) : ''}
      <section aria-labelledby="task-files-purchase" class="flex flex-col gap-2"><h3 id="task-files-purchase" class="m-0 text-base font-semibold text-ink">Purchase files</h3>${purch}</section>
      <section aria-labelledby="task-files-invoices" class="flex flex-col gap-2"><h3 id="task-files-invoices" class="m-0 text-base font-semibold text-ink">Supplier invoices and credit notes</h3><p class="m-0 text-sm text-quiet">The supplier’s original bill. Accounts checks each one against the payments.</p>${remind}${invList}${invBtns}</section>
      <section aria-labelledby="task-files-id" class="flex flex-col gap-2"><h3 id="task-files-id" class="m-0 text-base font-semibold text-ink">Traveller ID proofs</h3><ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Traveller ID proofs">${TN.travellersOf(deal.id).filter((p) => p.id).map((p) => `<li class="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">${ic('file-text', 'size-4 shrink-0 text-faint')}<a href="#/app/purchase/${id}?tab=files" rel="noopener" class="rounded-chip font-medium wrap-anywhere text-brand-strong underline underline-offset-4 hover:text-brand-deep ${C.focus}">${esc(p.id.file)}</a><span class="text-quiet">${esc(p.id.kind)} of ${esc(p.name)} · born ${esc(date(p.dob))} · ${esc(p.id.size)}</span></li>`).join('') || '<li class="m-0 text-sm text-quiet">No ID proof attached yet.</li>'}</ul></section>
      ${internal('Private identity documents for this work. Every view is recorded.')}
    </div></section></div>`;
  }

  /* =====================================================================
     Task actions (LIVE behaviour, in memory)
     ===================================================================== */
  const FUND_LABEL = { requested: 'Requested · Accounts approves', waiting_manager: 'Waiting for Manager', approved: 'Approved', refused: 'Refused', recovered: 'Recovered from customer money' };
  const getTask = (el) => { const id = el.dataset.id; return [id, TN.service(id)]; };

  TN.act('pur-take', (el) => {
    const [id, s] = getTask(el);
    if (s.assignee) { const st = el.querySelector('[role="status"]'); if (st) st.innerHTML = '<div class="message error" role="alert"><strong>Error: </strong>This task was already handled differently by someone else. Reload to see the latest state.</div>'; return; }
    s.assignee = meKey(); s.taskStatus = 'in_progress';
    log(id, 'Task taken');
    TN.toast('Task taken. Colleagues can see you are handling it.');
    TN.go(`/app/purchase/${id}?tab=work`);
  });
  TN.act('pur-release', (el) => {
    const [id, s] = getTask(el);
    if (!canWork(s)) return refuse(el, ERR.forbidden);
    s.assignee = null; s.taskStatus = 'new';
    log(id, 'Task handed back');
    TN.toast('Task handed back. A Purchase colleague can take it now.');
    TN.go('/app/purchase');
  });
  TN.act('pur-reassign', (el) => {
    const [id, s] = getTask(el);
    if (!TN.is('manager')) return refuse(el, ERR.forbidden);
    const to = new FormData(el).get('toUserId');
    if (to === s.assignee) return refuse(el, 'The task is already with this person. Nothing changed.');
    s.assignee = to;
    log(id, `Task moved to ${name(to)}`);
    pushNotice(['purchase'], `${name(meKey())} moved the task “${s.title}” to ${name(to)}.`, s.deal);
    done('reassign', 'Task reassigned.');
  });
  /* ----- Rate negotiation: add one line to the log ----- */
  TN.act('pur-log-kind', (el) => { const f = el.form; f.querySelectorAll('.fin-segment-option').forEach((l) => l.classList.toggle('is-selected', l.contains(el))); });
  // "Per room per night" fills the total for the whole stay as you type.
  document.addEventListener('input', (event) => {
    const t = event.target;
    if (!t || !t.matches || !t.matches('[data-pernight]')) return;
    const n = NUM(t.value);
    const amount = t.form && t.form.querySelector('[name="amountRupees"]');
    if (amount && n > 0) amount.value = Math.round(n * Number(t.dataset.units)).toLocaleString('en-IN');
  });
  TN.act('pur-log-add', (el) => {
    const [id, s] = getTask(el);
    if (!s || !W[id] || !canWork(s)) return refuse(el, s && isConfirmed(s) ? ERR.confirmed : ERR.forbidden);
    const f = new FormData(el);
    const kind = LOG_KIND[f.get('kind')];
    const sid = String(f.get('supplierId') || '');
    const sup = offerSuppliers(s).some(([k]) => k === sid) ? TN.supplier(sid) : null;
    const perText = String(f.get('perNight') || '').trim();
    const perNight = perText ? NUM(perText) : null;
    const b = isHotelish(s) ? TN.hotelBreakup(id) : null;
    let amount = NUM(f.get('amountRupees'));
    if (!(amount > 0) && perNight > 0 && b) amount = Math.round(perNight * b.rooms * b.nights);
    const note = String(f.get('note') || '').trim();
    const items = [];
    if (!kind) items.push('Choose what happened.');
    if (!sup) items.push('Choose a supplier from the list.');
    if (perText && !(perNight > 0)) items.push('Enter the price per room per night as a number, or leave it empty.');
    if (!(amount > 0)) items.push(`Enter the ${isHotelish(s) ? 'amount for the whole stay' : 'total amount'} in rupees.`);
    else if (perNight > 0 && b && Math.round(perNight * b.rooms * b.nights) !== amount) items.push(`The total does not match ${money(perNight)} per room per night (that makes ${money(perNight * b.rooms * b.nights)}). Clear one of the two.`);
    if (note.length > 200) items.push('Keep the note under 200 characters.');
    if (items.length) return refuse(el, ERR.invalid, items);
    const w = W[id];
    if (kind === 'final_agreed') {
      const paid = D.supplierPayments.filter((p) => p.service === id && p.status !== 'returned');
      if (paid.length) return refuse(el, `Payment request ${paid.map((p) => p.id).join(', ')} was already raised against the agreed price, so the price can’t change now. Ask Accounts to return that request first.`);
      if (latestCost(id) && !note) return refuse(el, 'A price was already agreed. Add a short note saying why it changed.');
    }
    const hotel = s.kind === 'hotel' ? shortHotel(s.title) : s.title;
    const source = sup.type === 'Hotel' ? 'hotel' : 'supplier';
    let o = w.offers.find((x) => x.supplier === sid && x.status === 'open');
    if (!o) { o = { id: uid('o'), supplier: sid, hotel, room: '', meal: '', price: null, ourOffer: null, finalRate: null, source, rates: [], hold: null, cancel: '', status: 'open', at: now(), by: meKey() }; w.offers.push(o); }
    const rate = appendRate(id, o, { kind, amount, perNight: perNight > 0 ? perNight : null, at: now(), by: meKey(), party: hotel, source, remark: note });
    if (kind === 'hotel_said') o.price = amount;
    if (kind === 'we_offered') o.ourOffer = amount;
    let msg = `${rateWord(s, kind)} added to the log.`;
    if (kind === 'final_agreed') {
      o.finalRate = amount;
      const v = w.costs.reduce((n, c) => Math.max(n, c.v), 0) + 1;
      w.costs.push({ v, stage: 'proposed', amount, offer: o.id, rateId: rate.id, due: null, note: note || 'Final agreed price', at: now(), by: meKey() });
      s.supplier = sid; s.cost = amount;
      if (s.budget != null && amount > s.budget) {
        pushNotice(['manager'], `Price above budget for ${s.title} (${s.deal}): ${money(amount)} against a budget of ${money(s.budget)}. Please approve or return it.`, s.deal, `#/app/purchase/${id}?tab=work`);
        msg = 'Final agreed price added. It is above the budget, so the Branch Manager must approve it before you book.';
      } else { const next = blockReason(id, s, 'booking'); msg = `Final agreed price added. ${next || 'Next: send the booking request.'}`; }
    }
    log(id, { hotel_said: `${quotedWord(s)} a price (${sup.name})`, we_offered: `We made an offer to ${sup.name}`, final_agreed: `Final price agreed with ${sup.name}` }[kind]);
    done('log', msg);
  });
  TN.act('pur-upload', (el) => {
    const [id, s] = getTask(el);
    if (!canWork(s)) return refuse(el, ERR.forbidden);
    const input = el.querySelector('input[type=file]');
    const file = input && input.files && input.files[0];
    if (!file || !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)) return refuse(el, ERR.file);
    const kind = new FormData(el).get('kind');
    W[id].files.push({ id: uid('f'), kind, name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, at: now(), by: meKey(), state: 'stored' });
    log(id, 'File added');
    done('file', 'File uploaded.');
  });
  TN.act('pur-remove-file', (el) => {
    const [id, s] = getTask(el);
    if (!canWork(s)) return;
    W[id].files = W[id].files.filter((f) => f.id !== el.dataset.file);
    log(id, 'File removed');
    done('file', 'File removed.');
  });
  TN.act('pur-approve-cost', (el) => {
    const [id, s] = getTask(el);
    const v = Number(el.dataset.v);
    const c = W[id].costs.find((x) => x.v === v);
    if (!TN.is('manager') || !c) return refuse(el, ERR.forbidden);
    if (c.by === meKey()) return refuse(el, 'You agreed this price yourself, so a different person must approve it.'); // nobody approves their own price
    if (W[id].approvals[v]) return refuse(el, 'This price was already approved. Nothing changed.');
    W[id].approvals[v] = { by: meKey(), at: now() };
    log(id, 'Price above budget approved by the Branch Manager');
    pushNotice(['purchase'], `${name(meKey())} approved the price above budget for ${s.title} (${s.deal}). You can book now.`, s.deal, `#/app/purchase/${id}?tab=work`);
    done('approve', 'Price approved above budget. Only this price is approved; a newer price needs a new approval.');
  });
  TN.act('pur-open-confirm', (el) => { if (blockedClick(el)) return; const d = document.getElementById('pur-confirm-dialog'); if (d && d.showModal) { d.showModal(); const i = d.querySelector('input[name=hotelReference]'); if (i) i.focus(); } });
  TN.act('pur-close-dialog', (el) => { const d = el.closest('dialog'); if (d) d.close(); });
  TN.act('pur-confirm', (el) => {
    const [id, s] = getTask(el);
    if (!canWork(s)) return refuse(el, isConfirmed(s) ? ERR.confirmed : ERR.forbidden);
    const reason = blockReason(id, s, 'confirm');
    if (reason) return refuse(el, reason);
    const fd = new FormData(el);
    const ref = String(fd.get('reference') || '').trim();
    const hotelRef = String(fd.get('hotelReference') || '').trim();
    const hotelBy = String(fd.get('hotelConfirmedBy') || '').trim();
    const hotelPhone = String(fd.get('hotelPhone') || '').trim();
    const input = el.querySelector('input[type=file]');
    const file = input && input.files && input.files[0];
    const w = W[id];
    const stored = w.files.some((f) => f.kind === 'supplier_confirmation' && f.state === 'stored');
    const items = [];
    if (!hotelRef) items.push('Enter the confirmation number.');
    if (!hotelBy) items.push('Enter the name of the person who confirmed.');
    if (!/^[+\d][\d\s().-]{5,39}$/.test(hotelPhone)) items.push('Enter their phone number.');
    if (file && (!/\.(pdf|jpe?g|png|webp)$/i.test(file.name) || file.size > 4 * 1024 * 1024)) items.push('Attach a PDF, JPG, PNG or WebP file up to 4 MB.');
    else if (!file && !stored) items.push('Attach the confirmation e-mail, saved as a PDF or a screenshot.');
    if (items.length) return refuse(el, ERR.notReady, items);
    const lc = latestCost(id);
    if (file) { w.files.push({ id: uid('f'), kind: 'supplier_confirmation', name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, at: now(), by: meKey(), state: 'stored' }); log(id, 'File added'); }
    w.costs.push({ v: lc.v + 1, stage: 'committed', amount: lc.amount, offer: lc.offer, rateId: lc.rateId, due: lc.due, note: lc.note, at: now(), by: meKey() });
    if (w.approvals[lc.v]) w.approvals[lc.v + 1] = { ...w.approvals[lc.v], carriedFrom: lc.v };
    w.offers.forEach((o) => { if (o.id === lc.offer) { o.status = 'selected'; if (o.finalRate == null) o.finalRate = lc.amount; } });
    Object.assign(s, { taskStatus: 'supplier_confirmed', confirmationNo: ref || hotelRef, hotelConfirmationNo: hotelRef, hotelConfirmedBy: hotelBy, hotelConfirmedPhone: hotelPhone, cost: lc.amount });
    w.confirmedAt = now(); w.confirmedBy = meKey();
    log(id, 'Supplier confirmation recorded; the agreed price is locked');
    pushNotice(['sales', 'manager'], `Supplier confirmed: ${s.title} for ${s.deal} (confirmation ${hotelRef}).`, s.deal);
    const d = el.closest('dialog'); if (d) d.close();
    flash = { key: 'confirm', ok: true, text: 'Supplier confirmation recorded. The agreed price is locked. Nothing was paid.' };
    TN.refresh();
  });

  /* =====================================================================
     PENDING drawers: e-mail, payment request (+ company funding),
     supplier invoice / credit note, cancellation charges.
     ===================================================================== */
  const drawerForm = (formId, act, id, inner, extraData) => `<form id="${formId}" novalidate data-act="${act}" data-id="${id}"${extraData || ''} class="flex flex-col gap-4">${statusSlot()}${inner}</form>`;
  const footer = (formId, label) => `<div class="flex flex-wrap justify-end gap-2"><button type="button" class="button secondary" data-close>Cancel</button><button type="submit" form="${formId}" class="button">${esc(label)}</button></div>`;
  const overlay = () => document.getElementById('tn-overlay');

  /* ----- E-mail to the supplier (rate request / booking request) -----
     The CRM sends nothing: Purchase copies the draft or opens it in the e-mail app,
     sends it, then marks it as sent. That records it in the log and History. */
  const SENDER_SIGN = 'Purchase, Holiday Chacha Pvt Ltd, Jodhpur';
  function mailTemplate(kind, id, s, sid, sender) {
    const deal = TN.deal(s.deal);
    const cust = TN.customer(deal.customer);
    const f = FACTS[id];
    const lc = latestCost(id);
    const b = isHotelish(s) ? TN.hotelBreakup(id) : null;
    const who = sender || TN.me().name;
    const subject = `${kind === 'booking' ? 'Booking request' : 'Rate request'} · ${s.deal} · ${s.title.replace(/,\s*/g, ' ')} · ${dateRange(s.start, s.end)}`;
    const lines = isHotelish(s)
      ? [`${s.kind === 'package' ? 'Package' : 'Hotel'}: ${s.title}`, `Check-in: ${date(s.start)}`, `Check-out: ${date(s.end)} (${plural(nights(s.start, s.end), 'night')})`,
        `Rooms: ${b ? b.lines.filter((l) => l.rooms > 0).map((l) => `${l.rooms} × ${l.room}`).join(', ') : f ? `${f[0]} × ${f[1]}` : s.detail}`]
      : [`Service: ${s.title}`, `Dates: ${dateRange(s.start, s.end)}`, `Details: ${s.detail}`];
    if (b && b.extra) lines.push(`Extra beds: ${b.extra}`);
    if (b && b.nobed) lines.push(`Guests without a bed: ${b.nobed}`);
    if (isHotelish(s)) lines.push(`Meal plan: ${f && f[2] ? f[2] : 'To be confirmed'}`);
    lines.push(`Guests: ${travellers(deal)}`);
    if (f && f[3]) lines.push(`Inclusions: ${f[3]}`);
    if (f && f[4]) lines.push(`Special requests: ${f[4]}`);
    const body = kind === 'booking'
      ? `Dear Reservations team,\n\nPlease confirm the booking below${lc ? ` at the agreed price of ${money(lc.amount)} for the whole ${isHotelish(s) ? 'stay' : 'service'}` : ''}.\n\n${lines.join('\n')}\nLead guest: ${cust.business ? `${cust.contact} (${cust.name})` : cust.name}\n\nOur reference: ${s.deal}\n\nPlease reply with your confirmation number, and send your proforma invoice with your bank details.\n\nRegards,\n${who}\n${SENDER_SIGN}`
      : `Dear Reservations team,\n\nPlease share your best rate and availability for:\n\n${lines.join('\n')}\n\nOur reference: ${s.deal}\n\nPlease include your cancellation terms and how long you can hold ${isHotelish(s) ? 'the rooms' : 'the booking'}.\n\nRegards,\n${who}\n${SENDER_SIGN}`;
    return { to: (TN.supplier(sid) || {}).email || '', subject, body };
  }
  const mailtoHref = (to, subject, body) => `mailto:${encodeURIComponent(to || '').replace(/%40/g, '@')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  function openMail(el) {
    if (blockedClick(el)) return;
    const [id, s] = getTask(el);
    const kind = el.dataset.kind === 'booking' ? 'booking' : 'rate';
    const reason = blockReason(id, s, kind);
    if (reason) return TN.toast(reason, 'danger');
    const sups = kind === 'booking' ? offerSuppliers(s).filter(([k]) => k === s.supplier) : nearSuppliers(id, s);
    const sid = s.supplier && sups.some(([k]) => k === s.supplier) ? s.supplier : (sups[0] && sups[0][0]);
    const t = mailTemplate(kind, id, s, sid);
    const supplierField = kind === 'booking'
      ? `<input type="hidden" name="supplierId" value="${esc(sid)}"/>${summary([['Supplier', esc(supName(sid))], ['Agreed price', latestCost(id) ? `<span class="tabular-nums">${money(latestCost(id).amount)}</span>` : '—']])}`
      : field('mail-supplier', 'Supplier', `<select id="mail-supplier" name="supplierId">${sups.map(([k, x]) => `<option value="${k}"${k === sid ? ' selected' : ''}>${esc(x.name)}${x.city && !x.name.includes(x.city) ? ` · ${esc(x.city)}` : ''}</option>`).join('')}</select>`);
    const inner = `${notice('info', '<p>The CRM does not send e-mails. Copy the draft or open it in your e-mail app, send it, then press Mark as sent.</p>')}
      ${supplierField}
      ${field('mail-to', 'To', `<input id="mail-to" type="email" inputmode="email" maxlength="254" required name="to" value="${esc(t.to)}" autocomplete="off"/>`)}
      ${field('mail-subject', 'Subject', `<input id="mail-subject" maxlength="200" required name="subject" value="${esc(t.subject)}"/>`)}
      ${field('mail-body', 'Message', `<textarea id="mail-body" name="body" rows="14" maxlength="6000" required>${esc(t.body)}</textarea>`)}`;
    const foot = `<div class="flex flex-wrap justify-end gap-2"><button type="button" class="button secondary" data-act="pur-mail-copy">${ic('copy', 'size-4')}Copy draft</button><a class="button secondary" id="pur-mailto" href="${esc(mailtoHref(t.to, t.subject, t.body))}">${ic('external-link', 'size-4')}Open in e-mail app</a><button type="submit" form="pur-mail-form" class="button">${ic('check', 'size-4')}Mark as sent</button></div>`;
    TN.drawer({ title: kind === 'booking' ? 'Send booking request' : 'Ask for rates', description: `${s.title} · ${s.deal}`, body: drawerForm('pur-mail-form', 'pur-mail-sent', id, inner, ` data-kind="${kind}"`), footer: foot, wide: true });
    const form = document.getElementById('pur-mail-form');
    const sync = () => { const fd = new FormData(form); const a = document.getElementById('pur-mailto'); if (a) a.href = mailtoHref(String(fd.get('to') || ''), String(fd.get('subject') || ''), String(fd.get('body') || '')); };
    form.addEventListener('input', sync);
    const sel = form.querySelector('#mail-supplier');
    if (sel) sel.addEventListener('change', () => { form.querySelector('#mail-to').value = (TN.supplier(sel.value) || {}).email || ''; sync(); });
  }
  TN.act('pur-mail', openMail);
  TN.act('pur-mail-copy', async () => {
    const form = document.getElementById('pur-mail-form');
    if (!form) return;
    const fd = new FormData(form);
    const text = `To: ${fd.get('to')}\nSubject: ${fd.get('subject')}\n\n${fd.get('body')}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
      else { const area = document.createElement('textarea'); area.value = text; form.appendChild(area); area.select(); const ok = document.execCommand('copy'); area.remove(); if (!ok) throw Error('copy'); }
      TN.toast('Draft copied. Paste it into your e-mail.');
    } catch (e) { refuse(form, 'The draft could not be copied. Select the message and copy it yourself.'); }
  });
  TN.act('pur-mail-sent', (el) => {
    const [id, s] = getTask(el);
    const kind = el.dataset.kind === 'booking' ? 'booking' : 'rate';
    if (!canWork(s)) return refuse(el, ERR.forbidden);
    const reason = blockReason(id, s, kind);
    if (reason) return refuse(el, reason);
    const f = new FormData(el);
    const sid = String(f.get('supplierId') || '');
    const to = String(f.get('to') || '').trim();
    const subject = String(f.get('subject') || '').trim();
    const body = String(f.get('body') || '').trim();
    const items = [];
    if (!offerSuppliers(s).some(([k]) => k === sid) || (kind === 'booking' && sid !== s.supplier)) items.push('Choose the supplier.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) items.push('Enter the supplier’s e-mail address.');
    if (!subject) items.push('Enter a subject.');
    if (!body) items.push('Enter the message.');
    if (items.length) return refuse(el, ERR.invalid, items);
    W[id].emails.push({ dir: 'out', kind, to, subject, body, supplier: sid, at: now(), by: meKey(), status: 'sent' });
    const what = kind === 'booking' ? 'Booking request' : 'Rate request';
    log(id, `${what} e-mailed to ${supName(sid)} (marked as sent)`);
    TN.closeOverlay();
    TN.toast(`${what} marked as sent. It is in the log and History.`);
    TN.refresh();
  });
  TN.act('pur-view-email', (el) => {
    const id = el.dataset.id;
    const w = W[id];
    const e = w && w.emails[Number(el.dataset.idx)];
    if (!e || !TN.is('purchase', 'manager')) return;
    TN.dialog({ title: e.subject || 'E-mail', description: `${e.kind === 'booking' ? 'Booking request' : 'Rate request'} · marked as sent`, body: `<div class="flex flex-col gap-3">${summary([['To', esc(e.to || '—')], ['Sent', `${esc(dt(e.at))} · ${esc(byWho(e.by))}`]])}<p class="m-0 whitespace-pre-wrap wrap-break-word rounded-control border border-line bg-canvas px-3.5 py-3 text-sm text-copy">${esc(e.body || '')}</p></div>`, footer: '<div class="flex justify-end"><button type="button" class="button secondary" data-close>Close</button></div>' });
  });

  // Seeded tasks: the rate request (and, once confirmed, the booking request) Purchase marked as sent.
  Object.entries(W).forEach(([id, w]) => {
    const s = D.services[id];
    if (w.seededMail || !s.supplier || !w.offers.length) return;
    w.seededMail = true;
    const first = rateRecords(id)[0];
    if (!first) return;
    const who = first.by;
    const t1 = mailTemplate('rate', id, s, s.supplier, name(who));
    w.emails.push({ dir: 'out', kind: 'rate', to: t1.to, subject: t1.subject, body: t1.body, supplier: s.supplier, at: `${String(first.at).slice(0, 10)} 09:30`, by: who, status: 'sent' });
    w.history.push({ text: `Rate request e-mailed to ${supName(s.supplier)} (marked as sent)`, at: `${String(first.at).slice(0, 10)} 09:30`, by: who });
    if (isConfirmed(s) && w.confirmedAt) {
      const t2 = mailTemplate('booking', id, s, s.supplier, name(who));
      const at = `${String(w.confirmedAt).slice(0, 10)} 10:30`;
      w.emails.push({ dir: 'out', kind: 'booking', to: t2.to, subject: t2.subject, body: t2.body, supplier: s.supplier, at, by: who, status: 'sent' });
      w.history.push({ text: `Booking request e-mailed to ${supName(s.supplier)} (marked as sent)`, at, by: who });
    }
  });

  /* ----- Supplier payment request (₹50,000 routing, bank hold, company funding) ----- */
  function routeHtml(sid, dealId, amount) {
    const before = supplierPays(sid, dealId).reduce((a, p) => a + p.amount, 0);
    const total = before + (amount > 0 ? amount : 0);
    const mgr = total > 50000;
    return notice('info', `<p><strong>${mgr ? 'Branch Manager approves' : 'Accounts approves'}</strong></p><p>Total requested for ${esc(TN.supplier(sid).name)} on this Deal, including this request: <span class="font-semibold text-ink tabular-nums">${money(total)}</span>${before ? ` (already requested ${money(before)})` : ''}. Accounts approves up to ₹50,000; above that, the Branch Manager.</p>`);
  }
  function fundingHtml(dealId, amount, checked) {
    if (!(amount > 0) || !customerMoneyShort(dealId, amount)) return '';
    return `<div data-funding>${notice('warning', `<p>Not enough customer money has arrived for this Deal to pay the supplier now. The company would pay first. Ask for company funding with this request. Accounts approves company funding up to ₹50,000; above that, the Branch Manager. It is recovered from the next customer payment on this Deal.</p>`, 'Customer money has not arrived yet')}
      <label class="choice mt-3"><input type="checkbox" name="askFunding" value="yes"${checked ? ' checked' : ''}/> Ask for company funding for this payment</label>
      ${field('pay-fund-reason', 'Why the supplier must be paid now', '<textarea id="pay-fund-reason" name="fundReason" rows="2" maxlength="500" aria-describedby="pay-fund-reason-hint"></textarea>', 'For example: the hotel releases the rooms if the advance is not paid by the due date.')}</div>`;
  }
  const openPay = (el, ev, prefill) => {
    if (blockedClick(el)) return;
    const [id, s] = getTask(el);
    // The trigger is a button (Work tab or Payment requests list): say why in a toast.
    if (!TN.is('purchase') || s.assignee !== meKey() || s.taskStatus === 'cancelled') return TN.toast(ERR.forbidden, 'danger');
    if (workCostIssue(id, s)) return TN.toast(workCostIssue(id, s), 'danger');
    const sup = TN.supplier(s.supplier);
    const lc = latestCost(id);
    const advance = !isConfirmed(s);
    const title = advance ? 'Request advance payment' : 'Request supplier payment';
    if (bankBlocked(s.supplier)) {
      TN.drawer({ title, description: `${sup.name} · ${s.deal}`, body: notice('warning', `<p>${esc(ERR.bankHold)} ${esc(sup.name)}’s bank details ${sup.bank === 'waiting' ? 'are not approved yet' : 'changed and are not approved yet'}. Ask the Branch Manager to check them on the supplier page.</p><p><a class="${C.rowLink}" href="#/app/purchase/suppliers/${s.supplier}">Open ${esc(sup.name)}</a></p>`, 'Payment requests are on hold'), footer: '<div class="flex justify-end"><button type="button" class="button secondary" data-close>Close</button></div>' });
      return;
    }
    if (needsGoAhead(s)) {
      TN.drawer({ title, description: `${sup.name} · ${s.deal}`, body: notice('warning', `<p>${esc(ERR.goAhead)} A payment to the hotel is a commitment, so it waits for the go-ahead too.</p>`, 'Waiting for Accounts go-ahead'), footer: '<div class="flex justify-end"><button type="button" class="button secondary" data-close>Close</button></div>' });
      return;
    }
    const already = supplierPays(s.supplier, s.deal).filter((p) => p.service === id).reduce((a, p) => a + p.amount, 0);
    const amt0 = prefill && prefill.amount != null ? prefill.amount : Math.max(0, (lc ? lc.amount : 0) - already);
    const inner = `${summary([['Supplier', esc(sup.name)], ['Service', esc(s.title)], ['Committed or agreed cost', lc ? money(lc.amount) : '—'], ['Already requested for this service', money(already)]])}
      <div class="form-grid">
      ${field('pay-amount', 'Amount (₹)', `<input id="pay-amount" inputmode="decimal" required name="amount" value="${amt0 ? amt0 + '.00' : ''}"/>`)}
      ${field('pay-part', 'Part', `<select id="pay-part" name="part">${advance ? '<option value="deposit">Advance / deposit before confirmation</option>' : `<option value="deposit">Deposit</option><option value="balance"${already ? ' selected' : ''}>Balance</option><option value="full"${!already ? ' selected' : ''}>Full payment</option>`}</select>`)}
      ${field('pay-due', 'Due by', `<input id="pay-due" type="date" required name="dueBy" value="${esc(prefill && prefill.dueBy ? prefill.dueBy : (lc && lc.due) || '')}"/>`)}
      ${field('pay-file', 'Supplier’s proforma or bill', fileInput('pay-file', 'file'), 'PDF, JPG, PNG or WebP, up to 4 MB. Accounts pays against this document.')}
      </div>
      ${field('pay-note', advance ? 'Why an advance is required before confirmation' : 'Note for Accounts', `<textarea id="pay-note" name="note" rows="2" maxlength="500"${advance ? ' required' : ''}></textarea>`)}
      <div data-route>${routeHtml(s.supplier, s.deal, amt0)}</div>
      <div data-fund-wrap>${fundingHtml(s.deal, amt0, true)}</div>
      ${notice('locked', 'Nothing is paid automatically. Accounts pays from the company bank account and records the bank reference; a second Accounts person checks it.')}`;
    TN.drawer({ title, description: `${s.title} · ${s.deal}`, body: drawerForm('pur-pay-form', 'pur-pay-send', id, inner, prefill && prefill.replaces ? ` data-replaces="${prefill.replaces}"` : ''), footer: footer('pur-pay-form', 'Send payment request') });
    const amt = overlay().querySelector('#pay-amount');
    if (amt) amt.addEventListener('input', () => {
      const n = NUM(amt.value);
      overlay().querySelector('[data-route]').innerHTML = routeHtml(s.supplier, s.deal, n);
      const wrap = overlay().querySelector('[data-fund-wrap]');
      const cb = wrap.querySelector('input[name=askFunding]');
      const keep = cb ? cb.checked : true;
      const reason = wrap.querySelector('textarea') ? wrap.querySelector('textarea').value : '';
      wrap.innerHTML = fundingHtml(s.deal, n, keep);
      const ta = wrap.querySelector('textarea'); if (ta) ta.value = reason;
    });
  };
  TN.act('pur-pay', openPay);
  TN.act('pur-pay-send', (el) => {
    const [id, s] = getTask(el);
    if (!TN.is('purchase') || s.assignee !== meKey() || s.taskStatus === 'cancelled') return refuse(el, ERR.forbidden);
    if (workCostIssue(id, s)) return refuse(el, workCostIssue(id, s));
    if (needsGoAhead(s)) return refuse(el, ERR.goAhead);
    const f = new FormData(el);
    const advance = !isConfirmed(s);
    if (advance && (f.get('part') !== 'deposit' || !String(f.get('note') || '').trim())) return refuse(el, 'Choose an advance / deposit and explain why payment is required before confirmation.');
    const amount = NUM(f.get('amount'));
    const input = el.querySelector('input[type=file]');
    const file = input && input.files && input.files[0];
    if (!(amount > 0) || !f.get('dueBy')) return refuse(el, ERR.invalid);
    const requested = D.supplierPayments.filter((p) => p.service === id && p.status !== 'returned').reduce((a, p) => a + p.amount, 0);
    if (requested + amount > latestCost(id).amount) return refuse(el, 'Total payment requests cannot exceed the agreed cost. Check existing requests and the remaining balance.');
    if (!file || !/\.(pdf|jpe?g|png|webp)$/i.test(file.name) || file.size > 4 * 1024 * 1024) return refuse(el, 'Attach the supplier’s proforma or bill (PDF, JPG, PNG or WebP, up to 4 MB). Accounts pays against this document.');
    if (bankBlocked(s.supplier)) return refuse(el, ERR.bankHold);
    const short = customerMoneyShort(s.deal, amount);
    const ask = f.get('askFunding') === 'yes';
    if (short && !ask) return refuse(el, 'The company would have to pay this supplier before enough customer money has arrived. Ask for company funding, or wait for the customer’s payment.');
    if (short && !String(f.get('fundReason') || '').trim()) return refuse(el, 'Say why the supplier must be paid now. Accounts and the Manager read this before approving company funding.');
    const before = supplierPays(s.supplier, s.deal).reduce((a, p) => a + p.amount, 0);
    const total = before + amount;
    const mgr = total > 50000;
    const n = Math.max(...D.supplierPayments.map((p) => Number(p.id.split('-')[2]))) + 1;
    const pid = `SP-26-${String(n).padStart(4, '0')}`;
    const p = { id: pid, deal: s.deal, service: id, supplier: s.supplier, amount, part: PART_LABEL[f.get('part')] || 'Full payment', dueBy: f.get('dueBy'), raisedBy: meKey(), raisedAt: TN.TODAY, status: mgr ? 'waiting_manager' : 'requested', invoice: file.name, note: String(f.get('note') || '').trim() || undefined };
    p.advance = advance;
    p.costVersion = latestCost(id).v;
    if (mgr && before) p.note = [p.note, `Counted with earlier requests: ${money(total)} to ${TN.supplier(s.supplier).name} on this Deal, so the Manager approves.`].filter(Boolean).join(' ');
    if (short) {
      const fn = Math.max(...D.funding.map((x) => Number(x.id.split('-')[2]))) + 1;
      const fid = `F-26-${String(fn).padStart(3, '0')}`;
      D.funding.unshift({ id: fid, deal: s.deal, service: id, amount, reason: String(f.get('fundReason')).trim(), requestedBy: meKey(), at: TN.TODAY, status: amount > 50000 ? 'waiting_manager' : 'requested', recoverFrom: 'Next customer payment on this Deal' });
      p.funding = fid;
      pushNotice(amount > 50000 ? ['manager', 'accounts', 'checker'] : ['accounts', 'checker'], `Company funding ${fid} asked for ${s.deal}: ${money(amount)} to ${TN.supplier(s.supplier).name}. ${amount > 50000 ? 'Needs the Branch Manager’s approval.' : 'Accounts approves.'}`, s.deal, '#/app/accounts/funding');
    }
    if (el.dataset.replaces) { const old = D.supplierPayments.find((x) => x.id === el.dataset.replaces); if (old) old.resentAs = pid; }
    D.supplierPayments.unshift(p);
    W[id] && log(id, `Supplier payment requested (${pid})`);
    pushNotice(mgr ? ['manager'] : ['accounts', 'checker'], `Payment request ${pid}: ${money(amount)} to ${TN.supplier(s.supplier).name} for ${s.deal}. ${mgr ? 'Above ₹50,000 for this supplier on this Deal: needs your approval.' : 'Accounts approves.'}`, s.deal, mgr ? '#/app/approvals' : '#/app/accounts/supplier-payments');
    TN.closeOverlay();
    TN.toast(`Payment request ${pid} sent. ${mgr ? 'The Branch Manager approves it.' : 'Accounts approves it.'}`);
    TN.refresh();
  });

  /* ----- Supplier original invoice / credit note ----- */
  TN.act('pur-invoice', (el) => {
    const [id, s] = getTask(el);
    const kind = el.dataset.kind || 'Invoice';
    const sup = TN.supplier(s.supplier);
    const inner = `${field('inv-kind', 'What is this?', `<select id="inv-kind" name="kind"><option${kind === 'Invoice' ? ' selected' : ''}>Invoice</option><option${kind === 'Credit note' ? ' selected' : ''}>Credit note</option></select>`)}
      <div class="form-grid">
      ${field('inv-number', 'Number on the document', '<input id="inv-number" maxlength="60" required name="number" autocomplete="off"/>')}
      ${field('inv-date', 'Date on the document', '<input id="inv-date" type="date" required name="date"/>')}
      ${field('inv-amount', 'Total amount (₹)', '<input id="inv-amount" inputmode="decimal" required name="amount"/>')}
      ${field('inv-gst', 'GST included (₹)', '<input id="inv-gst" inputmode="decimal" name="gst" aria-describedby="inv-gst-hint" value="0.00"/>', 'Enter 0 if the supplier charged no GST.')}
      </div>
      ${field('inv-file', 'File', fileInput('inv-file', 'file'), 'The supplier’s original, as a PDF or a clear photo (JPG, PNG or WebP), up to 4 MB.')}
      ${notice('info', '<p>Accounts checks it against the payments and accepts it, or returns it with a reason.</p>')}`;
    TN.drawer({ title: kind === 'Credit note' ? 'Upload credit note' : 'Upload supplier invoice', description: `${sup ? sup.name : s.title} · ${s.deal}`, body: drawerForm('pur-inv-form', 'pur-invoice-save', id, inner), footer: footer('pur-inv-form', 'Upload') });
  });
  TN.act('pur-invoice-save', (el) => {
    const [id, s] = getTask(el);
    const f = new FormData(el);
    const amount = NUM(f.get('amount'));
    const gst = NUM(f.get('gst') || 0);
    const input = el.querySelector('input[type=file]');
    const file = input && input.files && input.files[0];
    if (!String(f.get('number') || '').trim() || !f.get('date') || !(amount > 0) || !(gst >= 0) || gst > amount) return refuse(el, ERR.invalid);
    if (!file || !/\.(pdf|jpe?g|png|webp)$/i.test(file.name)) return refuse(el, ERR.file);
    const n = Math.max(...D.supplierInvoices.map((i) => Number(i.id.split('-')[1]))) + 1;
    D.supplierInvoices.push({ id: `SI-${String(n).padStart(4, '0')}`, deal: s.deal, service: id, supplier: s.supplier, kind: f.get('kind'), number: String(f.get('number')).trim(), amount, gst, date: f.get('date'), file: file.name, status: 'uploaded', by: meKey() });
    log(id, `${f.get('kind')} uploaded for Accounts`);
    pushNotice(['accounts', 'checker'], `${f.get('kind')} ${String(f.get('number')).trim()} from ${TN.supplier(s.supplier).name} uploaded for ${s.deal}. Please check it.`, s.deal, '#/app/accounts/supplier-invoices');
    TN.closeOverlay();
    flash = { key: 'invoice', ok: true, text: `${f.get('kind')} uploaded. Accounts checks it.` };
    if (TN.query().tab !== 'files' && f.get('kind') === 'Credit note') flash.key = 'cancel';
    TN.refresh();
  });

  /* ----- Cancellation charges ----- */
  TN.act('pur-charges', (el) => {
    const [id, s] = getTask(el);
    const deal = TN.deal(s.deal);
    const c = D.cancellations.find((x) => x.id === deal.cancellation);
    const ch = c.charges.find((x) => x.service === id) || {};
    const lc = latestCost(id);
    const inner = `${summary([['Supplier', esc(TN.supplier(s.supplier).name)], ['Committed cost', lc ? money(lc.amount) : '—'], ['Supplier’s cancellation terms', esc((W[id].offers.find((o) => o.status === 'selected') || {}).cancel || '—')]])}
      <div class="form-grid">
      ${field('ch-charge', 'Supplier keeps (₹)', `<input id="ch-charge" inputmode="decimal" required name="charge" value="${ch.supplierCharge != null ? ch.supplierCharge + '.00' : ''}"/>`)}
      ${field('ch-refund', 'Supplier refunds to us (₹)', `<input id="ch-refund" inputmode="decimal" required name="refund" aria-describedby="ch-refund-hint" value="${ch.supplierRefund != null ? ch.supplierRefund + '.00' : ''}"/>`, 'Only money we already paid the supplier. Enter 0 if nothing was paid or nothing comes back.')}
      </div>
      ${field('ch-note', 'Note', `<textarea id="ch-note" name="note" rows="2" maxlength="500">${esc(ch.note || '')}</textarea>`)}`;
    TN.drawer({ title: 'Supplier cancellation charges', description: `${s.title} · ${s.deal}`, body: drawerForm('pur-ch-form', 'pur-charges-save', id, inner), footer: footer('pur-ch-form', 'Save charges') });
  });
  TN.act('pur-charges-save', (el) => {
    const [id, s] = getTask(el);
    const deal = TN.deal(s.deal);
    const c = D.cancellations.find((x) => x.id === deal.cancellation);
    const f = new FormData(el);
    const charge = NUM(f.get('charge')); const refund = NUM(f.get('refund'));
    const lc = latestCost(id);
    if (!(charge >= 0) || !(refund >= 0) || (lc && charge > lc.amount)) return refuse(el, ERR.invalid);
    let ch = c.charges.find((x) => x.service === id);
    if (!ch) { ch = { service: id }; c.charges.push(ch); }
    Object.assign(ch, { supplierCharge: charge, supplierRefund: refund, note: String(f.get('note') || '').trim(), enteredBy: meKey(), enteredAt: now() });
    const wasWaiting = c.status === 'waiting_manager';
    c.status = 'charges_entered';
    log(id, 'Cancellation charges entered');
    TN.closeOverlay();
    flash = { key: 'cancel', ok: true, text: wasWaiting ? 'Charges saved. Send them to the Manager again.' : 'Charges saved.' };
    TN.refresh();
  });
  TN.act('pur-send-charges', (el) => {
    const c = D.cancellations.find((x) => x.id === el.dataset.cancel);
    const svc = TN.servicesOf(c.deal).filter((x) => x.dept === 'purchase');
    const missing = svc.filter((x) => !c.charges.some((ch) => ch.service === x.id && ch.supplierCharge != null));
    const form = el.closest('section');
    if (missing.length) {
      const s = form.querySelector('[data-msg]');
      if (s) s.outerHTML = msgHtml(false, 'Enter the charges for every service of this Deal first.', missing.map((x) => x.title));
      return;
    }
    c.status = 'waiting_manager'; c.sentToManagerAt = now(); c.sentBy = meKey();
    svc.forEach((x) => log(x.id, 'Cancellation charges sent to the Branch Manager'));
    pushNotice(['manager'], `Cancellation charges for ${c.deal} are ready for your approval.`, c.deal, '#/app/approvals');
    flash = { key: 'cancel', ok: true, text: 'Charges sent to the Branch Manager.' };
    TN.refresh();
  });

  /* =====================================================================
     #/app/purchase/suppliers and /suppliers/:id (LIVE + PENDING payments card)
     ===================================================================== */
  const purchaseSuppliers = () => Object.entries(D.suppliers).filter(([, s]) => s.type !== 'Airline').map(([id, s]) => ({ id, ...s }));
  const SVC = { hotel: 'Hotel', transfer: 'Transfer', activity: 'Activity' };
  const svcLabel = (arr) => (arr || []).map((k) => SVC[k] || k).join(', ');
  const verBadge = (s) => (s.verified ? badge('success', 'badge-check', 'Verified', 'Verification') : badge('warning', 'circle-question-mark', 'Details not verified', 'Verification'));
  const notRecorded = '<span class="absent not-recorded"><span aria-hidden="true">– </span>Not recorded yet</span>';
  const supplierFormFields = (p, s) => `<div class="form-grid">${field(`${p}-supplier-name`, 'Supplier name', `<input id="${p}-supplier-name" maxlength="200" required autocomplete="organization" name="name" value="${esc(s.name || '')}"/>`)}${field(`${p}-supplier-city`, 'City', `<input id="${p}-supplier-city" maxlength="120" autocomplete="off" name="city" value="${esc(s.city || '')}"/>`)}</div>
    <fieldset class="group"><legend>Services they supply</legend><div class="choice-row">${['hotel', 'transfer', 'activity'].map((k) => `<label class="choice"><input type="checkbox" name="serviceTypes" value="${k}"${(s.services || ['hotel']).includes(k) ? ' checked' : ''}/> ${SVC[k]}</label>`).join('')}</div></fieldset>
    <div class="form-grid">${field(`${p}-supplier-contact`, 'Contact person', `<input id="${p}-supplier-contact" maxlength="120" autocomplete="off" name="contactName" value="${esc(s.contact || '')}"/>`)}${field(`${p}-supplier-phone`, 'Phone', `<input id="${p}-supplier-phone" type="tel" inputmode="tel" maxlength="40" autocomplete="off" name="contactPhone" value="${esc(s.phone || '')}"/>`)}${field(`${p}-supplier-email`, 'Email', `<input id="${p}-supplier-email" type="email" inputmode="email" maxlength="254" autocomplete="off" name="contactEmail" value="${esc(s.email || '')}"/>`)}</div>
    ${field(`${p}-supplier-terms`, 'Payment terms', `<textarea id="${p}-supplier-terms" name="paymentTerms" maxlength="1000" rows="3" aria-describedby="${p}-supplier-terms-hint">${esc(s.terms || '')}</textarea>`, 'What the supplier told you, in your words. Recording terms does not schedule any payment.')}`;

  function renderSuppliers() {
    const list = purchaseSuppliers().sort((a, b) => a.name.localeCompare(b.name));
    const rows = list.map((s) => [`<a class="${C.rowLink}" href="#/app/purchase/suppliers/${s.id}">${esc(s.name)}</a>`, esc(svcLabel(s.services)), s.city ? esc(s.city) : notRecorded, verBadge(s), s.status === 'archived' ? 'Archived' : 'Active']);
    const add = TN.is('purchase') ? `<div class="${C.card} mt-5" data-slot="card"><section aria-labelledby="supplier-add"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.h2}" id="supplier-add">Add a supplier</h2></div></div><div class="px-4.5 py-4"><form novalidate aria-label="Add a supplier" data-act="pur-sup-add">${statusSlot()}${supplierFormFields('new', { services: ['hotel'] })}<button type="submit" class="button" aria-disabled="false">Add supplier</button></form></div></section></div>` : '';
    return `<div class="font-sans text-base text-copy">${backLink('#/app/purchase', 'Back to Purchase tasks')}${header({ eyebrow: 'Purchase', title: 'Suppliers', desc: 'Supplier details are recorded by Purchase and stay marked “not verified” until a manager verifies them; any later change by Purchase marks them not verified again.' })}${table('Suppliers table', `${list.length} suppliers`, ['Supplier', 'Services', 'City', 'Details', 'Status'], rows)}${add}</div>`;
  }

  function renderSupplier(params) {
    const id = params.id;
    const s = TN.supplier(id);
    if (!s || s.type === 'Airline') return `${backLink('#/app/purchase/suppliers', 'Back to Suppliers')}${empty('search-x', 'Supplier not found', 'We couldn’t find this. It may have been removed, or you may not have access.')}`;
    const mgr = TN.is('manager');
    const actions = mgr && !s.verified ? `<form novalidate aria-label="Verify supplier" class="primary-slot" data-act="pur-sup-verify" data-id="${id}"><p id="verify-help" class="hint mb-0">You checked these supplier details. Any later change by Purchase marks them not verified again.</p><button type="submit" class="button" aria-disabled="false" aria-describedby="verify-help">Mark supplier verified</button></form>` : '';
    const flashNotice = flash && flash.key === 'supplier' ? `<div role="status" class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy border-status-success-line bg-status-success-tint" data-slot="notice" data-tone="success">${ic('circle-check', 'mt-0.5 size-4 shrink-0 text-status-success')}<div class="min-w-0 flex-1"><div class="flex flex-col gap-1.5 [&amp;_p]:m-0"><strong>Done: </strong>${esc(flash.text)}</div></div></div>` : '';
    const details = mgr
      ? `<dl class="facts m-0"><dt>Services</dt><dd>${esc(svcLabel(s.services))}</dd><dt>City</dt><dd>${esc(s.city || '—')}</dd><dt>Contact person</dt><dd>${esc(s.contact || '—')}</dd><dt>Phone</dt><dd>${esc(s.phone || '—')}</dd><dt>Email</dt><dd>${esc(s.email || '—')}</dd><dt>Payment terms</dt><dd class="prewrap">${esc(s.terms || '—')}</dd><dt>Status</dt><dd>${s.status === 'archived' ? 'Archived' : 'Active'}</dd></dl>`
      : `<form novalidate aria-label="Edit supplier" data-act="pur-sup-save" data-id="${id}">${slot('sup-edit')}${supplierFormFields('edit', s)}${field('edit-supplier-status', 'Status', `<select id="edit-supplier-status" name="status"><option value="active"${s.status !== 'archived' ? ' selected' : ''}>Active · can be chosen for new offers</option><option value="archived"${s.status === 'archived' ? ' selected' : ''}>Archived · kept for history only</option></select>`)}<button type="submit" class="button" aria-disabled="false">Save supplier</button></form>`;
    const revs = (s.bankRevisions || []).slice().reverse();
    const revLi = (r, i) => `<li class="m-0 flex gap-3 rounded-control border border-line bg-canvas px-3.5 py-3"><div class="min-w-0 flex-1"><p class="m-0 text-ink"><strong>Revision ${r.no}</strong> · ${i === 0 ? 'latest' : 'earlier'} · ${r.approved ? `approved by ${esc(name(r.approvedBy))} on ${esc(date(r.approvedAt))}` : 'not approved'}</p><p class="m-0 wrap-anywhere">${esc(r.holder)} · ${esc(r.bank)} · ${esc(r.ifsc)} · <span class="whitespace-nowrap tabular-nums"><span aria-hidden="true">•••• </span><span class="sr-only">account ending </span>${esc(r.last4)}</span></p><p class="m-0 text-sm text-quiet">Recorded ${esc(dt(r.at))} by ${esc(name(r.by))}</p>${mgr && i === 0 && !r.approved ? `<form novalidate data-act="pur-bank-approve" data-id="${id}" data-rev="${r.no}">${slot('bank')}<button type="submit" class="button secondary" aria-disabled="false">Approve these bank details<span class="visually-hidden"> (revision ${r.no})</span></button></form>` : ''}</div></li>`;
    const held = D.supplierPayments.filter((p) => p.supplier === id && p.status === 'on_hold');
    const holdNotice = s.bank === 'changed' || s.bank === 'waiting' ? notice('warning', `<p>Payments to this supplier are on hold until the Manager approves the new bank details.${held.length ? ` On hold now: ${held.map((p) => esc(p.id)).join(', ')}.` : ''}</p>`, s.bank === 'changed' ? 'Bank details changed' : 'Bank details not approved yet') : '';
    const recordForm = TN.is('purchase') ? `<details class="form-section work-form"><summary><span class="form-section-title">Record new bank details</span></summary><form novalidate aria-label="Record bank details" autocomplete="off" data-act="pur-bank-add" data-id="${id}">${statusSlot()}<div class="form-grid">${field('ben-holder', 'Account holder', '<input id="ben-holder" maxlength="120" required name="accountHolder"/>')}${field('ben-bank', 'Bank', '<input id="ben-bank" maxlength="120" required name="bankName"/>')}${field('ben-ifsc', 'IFSC', '<input id="ben-ifsc" maxlength="11" required autocapitalize="characters" spellcheck="false" name="ifsc"/>')}${field('ben-account', 'Account number', '<input id="ben-account" inputmode="numeric" maxlength="18" required aria-describedby="ben-account-hint" spellcheck="false" name="accountNumber"/>', 'Only the last 4 digits are shown afterwards.')}</div>${notice('info', '<p>New bank details put payments to this supplier on hold until the Branch Manager approves them.</p>')}<button type="submit" class="button secondary mt-3" aria-disabled="false">Record bank details</button></form></details>` : '';
    const bank = `<div class="${C.card} mt-5" data-slot="card"><section aria-labelledby="supplier-bank"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.h2}" id="supplier-bank">Bank details</h2></div></div><div class="px-4.5 py-4"><div class="flex flex-col gap-4">${notice('warning', 'Bank details are recorded for reference only. A manager approves the latest revision. Accounts pays suppliers only to approved bank details; nothing is paid automatically.')}${holdNotice}${flash && flash.key === 'bank' && flash.ok ? msgHtml(true, flash.text) : ''}${revs.length ? `<ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Bank detail revisions, newest first">${revs.map(revLi).join('')}</ul>` : '<p class="m-0 text-quiet">No bank details recorded yet.</p>'}${recordForm}</div></div></section></div>`;
    const pays = D.supplierPayments.filter((p) => p.supplier === id && p.raisedBy === 'purchase');
    const payCard = `<div class="${C.card} mt-5" data-slot="card"><section aria-labelledby="supplier-pays"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.h2}" id="supplier-pays">Payment requests</h2><p class="m-0 text-sm text-quiet">Requests raised by Purchase for this supplier.</p></div></div><div class="px-4.5 py-4">${pays.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Payment requests to this supplier">${pays.map((p) => `<li class="m-0 flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-canvas px-3.5 py-2.5"><span class="min-w-0"><a class="${C.rowLink}" href="#/app/purchase/${p.service}?tab=work">${esc(p.id)}</a> <span class="text-sm text-copy tabular-nums">· ${money(p.amount)} · ${esc(p.part)} · ${esc(p.deal)}</span></span>${payBadge(p)}</li>`).join('')}</ul>` : '<p class="m-0 text-quiet">No payment requests to this supplier yet.</p>'}</div></section></div>`;
    return `<div class="font-sans text-base text-copy">${backLink('#/app/purchase/suppliers', 'Back to Suppliers')}${header({ eyebrow: 'Supplier', title: s.name, meta: verBadge(s), actions })}${flashNotice}<div class="${C.card} mt-5" data-slot="card"><section aria-labelledby="supplier-edit"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.h2}" id="supplier-edit">Details</h2><p class="m-0 text-sm text-quiet">Last changed ${esc(dt(s.changedAt))}.</p></div></div><div class="px-4.5 py-4">${details}</div></section></div>${bank}${payCard}</div>`;
  }

  const readSupplierForm = (el) => {
    const f = new FormData(el);
    return { name: String(f.get('name') || '').trim(), city: String(f.get('city') || '').trim(), services: f.getAll('serviceTypes'), contact: String(f.get('contactName') || '').trim(), phone: String(f.get('contactPhone') || '').trim(), email: String(f.get('contactEmail') || '').trim(), terms: String(f.get('paymentTerms') || '').trim(), status: f.get('status') || 'active' };
  };
  TN.act('pur-sup-add', (el) => {
    if (!TN.is('purchase')) return refuse(el, ERR.forbidden);
    const v = readSupplierForm(el);
    if (!v.name || !v.services.length || (v.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email))) return refuse(el, ERR.invalid);
    if (purchaseSuppliers().some((s) => s.name.toLowerCase() === v.name.toLowerCase())) return refuse(el, 'A supplier with this name already exists in this company.');
    const id = 'sp-' + v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) + '-' + (++seq);
    D.suppliers[id] = { ...v, type: v.services.includes('hotel') ? 'Hotel' : v.services.includes('transfer') ? 'Transfers' : 'Activity', verified: false, bank: 'none', bankRevisions: [], changedAt: now() };
    flash = { key: 'supplier', ok: true, text: 'Supplier added. Details are marked not verified.' };
    TN.go(`/app/purchase/suppliers/${id}`);
  });
  TN.act('pur-sup-save', (el) => {
    const id = el.dataset.id; const s = TN.supplier(id);
    if (!TN.is('purchase')) return refuse(el, ERR.forbidden);
    const v = readSupplierForm(el);
    if (!v.name || !v.services.length) return refuse(el, ERR.invalid);
    Object.assign(s, v, { verified: false, changedAt: now() });
    done('sup-edit', 'Supplier saved. Details are still marked not verified.');
  });
  TN.act('pur-sup-verify', (el) => {
    const s = TN.supplier(el.dataset.id);
    if (!TN.is('manager')) return;
    if (s.verified) { flash = { key: 'supplier', ok: true, text: 'This supplier was already verified. Nothing changed.' }; return TN.refresh(); }
    s.verified = true;
    pushNotice(['purchase'], `${name(meKey())} verified the supplier ${s.name}.`, null, `#/app/purchase/suppliers/${el.dataset.id}`);
    flash = { key: 'supplier', ok: true, text: 'Supplier marked verified.' };
    TN.refresh();
  });
  TN.act('pur-bank-add', (el) => {
    const id = el.dataset.id; const s = TN.supplier(id);
    const f = new FormData(el);
    const acct = String(f.get('accountNumber') || '').replace(/\s/g, '');
    const ifsc = String(f.get('ifsc') || '').trim().toUpperCase();
    if (!String(f.get('accountHolder') || '').trim() || !String(f.get('bankName') || '').trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc) || !/^\d{6,18}$/.test(acct)) return refuse(el, ERR.invalid);
    const no = (s.bankRevisions || []).length + 1;
    s.bankRevisions = s.bankRevisions || [];
    s.bankRevisions.push({ no, holder: String(f.get('accountHolder')).trim(), bank: String(f.get('bankName')).trim(), ifsc, last4: acct.slice(-4), at: now(), by: meKey(), approved: false });
    const hadApproved = s.bank === 'approved';
    s.bank = hadApproved || s.bank === 'changed' ? 'changed' : 'waiting';
    // Rule (brief §5.3): payments to this supplier go on hold until the Manager approves.
    D.supplierPayments.forEach((p) => { if (p.supplier === id && ['requested', 'waiting_manager', 'approved'].includes(p.status)) { p.heldFrom = p.status; p.status = 'on_hold'; } });
    pushNotice(['manager'], `New bank details for ${s.name}: please check and approve. Payments to this supplier are on hold.`, null, `#/app/purchase/suppliers/${id}`);
    pushNotice(['accounts', 'checker'], `Bank details of ${s.name} changed. Its payments are on hold until the Manager approves them.`, null, '#/app/accounts/supplier-payments');
    flash = { key: 'bank', ok: true, text: `Bank details recorded as revision ${no}. They are not verified.` };
    TN.refresh();
  });
  TN.act('pur-bank-approve', (el) => {
    const id = el.dataset.id; const s = TN.supplier(id);
    if (!TN.is('manager')) return refuse(el, ERR.forbidden);
    const r = s.bankRevisions.find((x) => x.no === Number(el.dataset.rev));
    if (r.by === meKey()) return refuse(el, ERR.forbidden);
    r.approved = true; r.approvedBy = meKey(); r.approvedAt = TN.TODAY;
    s.bank = 'approved';
    const released = [];
    D.supplierPayments.forEach((p) => { if (p.supplier === id && p.status === 'on_hold') { p.status = p.heldFrom || (p.approvedBy ? 'approved' : supplierPays(p.supplier, p.deal).reduce((a, x) => a + x.amount, 0) > 50000 ? 'waiting_manager' : 'requested'); delete p.heldFrom; released.push(p.id); } });
    pushNotice(['purchase', 'accounts', 'checker'], `${name(meKey())} approved the new bank details of ${s.name}.${released.length ? ` Released from hold: ${released.join(', ')}.` : ''}`, null, `#/app/purchase/suppliers/${id}`);
    flash = { key: 'bank', ok: true, text: 'Bank details approved. Accounts can pay to them now.' };
    TN.refresh();
  });

  /* =====================================================================
     #/app/purchase/payments · Purchase's own payment requests (PENDING)
     Looks like the live Accounts "Reported payments" list.
     ===================================================================== */
  function renderPayments(params, q) {
    const own = D.supplierPayments.filter((p) => p.raisedBy === 'purchase');
    const groups = {
      open: own.filter((p) => ['requested', 'waiting_manager', 'approved', 'on_hold'].includes(p.status)),
      returned: own.filter((p) => p.status === 'returned' && !p.resentAs),
      paid: own.filter((p) => p.status === 'paid' || p.status === 'verified'),
      all: own,
    };
    const show = groups[q.show] ? q.show : 'open';
    const list = groups[show].slice().sort((a, b) => (a.dueBy < b.dueBy ? -1 : 1));
    const tabs = [
      { key: 'open', label: 'Open', href: '#/app/purchase/payments', count: groups.open.length },
      { key: 'returned', label: 'Returned', href: '#/app/purchase/payments?show=returned', count: groups.returned.length },
      { key: 'paid', label: 'Paid', href: '#/app/purchase/payments?show=paid' },
      { key: 'all', label: 'All', href: '#/app/purchase/payments?show=all' },
    ];
    const li = (p) => {
      const s = TN.service(p.service); const sp = TN.supplier(p.supplier); const st = PAY[p.status] || PAY.requested;
      const fund = p.funding ? D.funding.find((x) => x.id === p.funding) : null;
      const extra = p.status === 'returned' ? `<p class="m-0 text-sm text-copy">Returned by ${esc(name(p.returnedBy))} on ${esc(date(p.returnedAt))}: ${esc(p.returnReason)}</p>${p.resentAs ? `<p class="m-0 text-sm text-quiet">Sent again as ${esc(p.resentAs)}.</p>` : `<div class="mt-1"><button type="button" class="button secondary" data-act="pur-pay-again" data-id="${p.service}" data-pay="${p.id}">Change and send again</button></div>`}`
        : p.status === 'paid' || p.status === 'verified' ? `<p class="m-0 text-sm text-quiet">Paid on ${esc(date(p.paidAt))} by ${esc(name(p.paidBy))} · ${esc(p.bankRef)}${p.verifiedBy ? ` · checked by ${esc(name(p.verifiedBy))}` : ''}</p>`
        : `<p class="m-0 text-sm text-quiet">${esc(st[3])}${fund ? ` Company funding ${esc(fund.id)}: ${esc(FUND_LABEL[fund.status] || fund.status)}.` : ''}</p>`;
      return `<li class="m-0 flex flex-col gap-2 rounded-card border border-line bg-card px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between"><div class="min-w-0"><p class="m-0 font-semibold text-ink"><a class="${C.fileLink}" href="#/app/purchase/${p.service}?tab=work">${esc(p.id)} · ${esc(sp.name)}</a></p><p class="m-0 text-sm text-copy tabular-nums">${money(p.amount)} · ${esc(p.part)} · due ${esc(date(p.dueBy))} · ${esc(p.deal)}</p><p class="m-0 text-sm text-quiet">${esc(s ? s.title : '')} · requested by ${esc(byWho(p.raisedBy))} on ${esc(date(p.raisedAt))}</p>${extra}</div><div class="shrink-0">${payBadge(p)}</div></li>`;
    };
    const emptyTxt = { open: ['No open payment requests', 'Request a supplier payment from the Work tab of a Purchase task.'], returned: ['Nothing returned', 'Requests Accounts or the Manager send back appear here.'], paid: ['Nothing paid yet', 'Paid requests appear here with the bank reference.'], all: ['No payment requests yet', 'Request a supplier payment from the Work tab of a Purchase task.'] }[show];
    return `<div class="font-sans text-base text-copy">${header({ eyebrow: 'Purchase', title: 'Payment requests', desc: 'Supplier payments you asked for. Accounts approves up to ₹50,000 for a supplier on a Deal; above that, the Branch Manager. Accounts pays each one and records the bank reference.' })}${tabsNav('Payment request filters', tabs, show, 'mb-4')}${list.length ? `<ol class="m-0 flex list-none flex-col gap-3 p-0" aria-label="${esc(tabs.find((t) => t.key === show).label)}, by due date">${list.map(li).join('')}</ol>` : empty('inbox', emptyTxt[0], emptyTxt[1])}</div>`;
  }
  TN.act('pur-pay-again', (el) => {
    const old = D.supplierPayments.find((p) => p.id === el.dataset.pay);
    openPay(el, null, { amount: old.amount, dueBy: old.dueBy > TN.TODAY ? old.dueBy : '', replaces: old.id });
  });

  /* =====================================================================
     Page registration and Home rows
     ===================================================================== */
  TN.page('/app/purchase', { nav: '/app/purchase', roles: ['purchase', 'manager', 'sales'], title: 'Purchase tasks', render: renderQueue });
  TN.page('/app/purchase/suppliers', { nav: '/app/purchase/suppliers', roles: ['purchase', 'manager'], title: 'Suppliers', render: renderSuppliers, mount: () => { flash = null; } });
  TN.page('/app/purchase/suppliers/:id', { nav: '/app/purchase/suppliers', roles: ['purchase', 'manager'], title: (p) => (TN.supplier(p.id) || {}).name || 'Supplier', render: renderSupplier, mount: () => { flash = null; } });
  TN.page('/app/purchase/payments', { nav: '/app/purchase/payments', roles: ['purchase'], title: 'Payment requests', render: renderPayments });
  TN.page('/app/purchase/:taskId', {
    nav: '/app/purchase', roles: ['purchase', 'manager', 'sales'],
    title: (p) => (TN.service(p.taskId) || {}).title || 'Purchase task',
    render: (p, q) => { if (TN.is('sales')) { const s = TN.service(p.taskId); if (!s || s.dept !== 'purchase') return empty('lock', 'You can’t open this task', 'Task not found or not in Purchase.'); } return renderTask(p, q); },
    mount: (root) => { const m = root.querySelector('.message.error[data-msg]'); if (m) m.focus(); flash = null; },
  });

  const R = ['purchase', 'manager'];
  const open = () => tasks().filter((t) => t.taskStatus !== 'cancelled');
  // Lead: 'not taken' row dropped; the live Home row 'Purchase tasks not taken yet, or yours in progress' covers it.
  if (0) TN.homeRow({ roles: R, section: 'What needs you', label: 'Purchase tasks not taken', href: '#/app/purchase?show=not_taken', count: () => open().filter((t) => !t.assignee).length });
  TN.homeRow({ roles: R, section: 'What needs you', label: 'Hotel tasks waiting for Accounts go-ahead', href: '#/app/purchase?show=all', count: () => open().filter((t) => !isConfirmed(t) && needsGoAhead(t)).length });
  TN.homeRow({ roles: ['manager'], section: 'What needs you', label: 'Hotel costs above budget waiting for your approval', href: '#/app/purchase', count: () => open().filter((t) => !isConfirmed(t) && overBudgetWaiting(t.id, t)).length });
  TN.homeRow({ roles: ['purchase'], section: 'What needs you', label: 'Costs above budget waiting for the Manager', href: '#/app/purchase?show=all', count: () => open().filter((t) => !isConfirmed(t) && overBudgetWaiting(t.id, t)).length });
  TN.homeRow({ roles: R, section: 'What needs you', label: 'Supplier invoices missing after the trip', href: '#/app/purchase?show=all', count: () => open().filter((t) => invoiceMissing(t.id, t)).length });
  TN.homeRow({ roles: ['purchase'], section: 'What needs you', label: 'Payment requests returned to you', href: '#/app/purchase/payments?show=returned', count: () => D.supplierPayments.filter((p) => p.raisedBy === 'purchase' && p.status === 'returned' && !p.resentAs).length });
  TN.homeRow({ roles: ['manager'], section: 'What needs you', label: 'Supplier bank details to approve', href: '#/app/purchase/suppliers', count: () => purchaseSuppliers().filter((s) => s.bank === 'changed' || s.bank === 'waiting').length });
  TN.homeRow({ roles: ['manager'], section: 'What needs you', label: 'Suppliers to verify', href: '#/app/purchase/suppliers', count: () => purchaseSuppliers().filter((s) => !s.verified).length });

  // For other department files (read-only helpers; no money beyond supplier cost).
  TN.purchase = { work: (id) => W[id], rates: rateRecords, log: (id) => negotiationLog(id, TN.service(id)), breakup: (id) => TN.hotelBreakup(id), blockReason: (id, action) => blockReason(id, TN.service(id), action), appendRate, openMail, hotelKey, canWork, workCostIssue, needsGoAhead, mailTemplate, persist: persistPurchase, facts: (id) => FACTS[id], progress: (id) => purchaseProgress(id, TN.service(id), W[id]), issues: (id) => issues(id, TN.service(id)), latestCost, isConfirmed };
})();
