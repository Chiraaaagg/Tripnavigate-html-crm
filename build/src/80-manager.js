/* =====================================================================
   Agent H · Branch Manager approvals inbox, escalations and reports.
   Pages: #/app/approvals, #/app/reports, #/app/reports/:id
   Shared markup helpers for this file and 81-settings.js live in TN.hm
   (class strings copied from the live captures in build/ref/gallery).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const inr = (n) => TN.fmt.inr(n);

  /* ---------------------------------------------------------------
     Markup helpers (exact live class strings)
     --------------------------------------------------------------- */
  const ICONS = {
    'circle-check': '<circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path>',
    'circle-off': '<path d="m2 2 20 20"></path><path d="M8.35 2.69A10 10 0 0 1 21.3 15.65"></path><path d="M19.08 19.08A10 10 0 1 1 4.92 4.92"></path>',
    'circle-question-mark': '<circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><path d="M16 3.128a4 4 0 0 1 0 7.744"></path><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><circle cx="9" cy="7" r="4"></circle>',
    'rotate-ccw-clock': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>',
    info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
    'triangle-alert': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
    'circle-x': '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>',
    'link-2': '<path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line>',
    'building-complex': '<path d="M10 12h4"></path><path d="M10 8h4"></path><path d="M14 21v-3a2 2 0 0 0-4 0v3"></path><path d="M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"></path><path d="M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"></path>',
    'file-text': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>',
    mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"></path><rect x="2" y="4" width="20" height="16" rx="2"></rect>',
    'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path>',
    download: '<path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path>',
    upload: '<path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>',
    'list-checks': '<path d="M13 5h8"></path><path d="M13 12h8"></path><path d="M13 19h8"></path><path d="m3 17 2 2 4-4"></path><path d="m3 7 2 2 4-4"></path>',
    clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
    'hand-coins': '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"></path><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"></path><path d="m2 16 6 6"></path><circle cx="16" cy="9" r="2.9"></circle><circle cx="6" cy="5" r="3"></circle>',
    landmark: '<path d="M10 18v-7"></path><path d="M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"></path><path d="M14 18v-7"></path><path d="M18 18v-7"></path><path d="M3 22h18"></path><path d="M6 18v-7"></path>',
    banknote: '<rect width="20" height="12" x="2" y="6" rx="2"></rect><circle cx="12" cy="12" r="2"></circle><path d="M6 12h.01M18 12h.01"></path>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="m9 12 2 2 4-4"></path>',
    'shield-alert': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>',
    receipt: '<path d="M12 17V7"></path><path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"></path><path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"></path>',
    'file-spreadsheet': '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M8 13h2"></path><path d="M14 13h2"></path><path d="M8 17h2"></path><path d="M14 17h2"></path>',
    'chevron-down': '<path d="m6 9 6 6 6-6"></path>',
    'chevron-right': '<path d="m9 18 6-6-6-6"></path>',
    'arrow-left': '<path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path>',
    hotel: '<path d="M10 22v-6.57"></path><path d="M12 11h.01"></path><path d="M12 7h.01"></path><path d="M14 15.43V22"></path><path d="M15 16a5 5 0 0 0-6 0"></path><path d="M16 11h.01"></path><path d="M16 7h.01"></path><path d="M8 11h.01"></path><path d="M8 7h.01"></path><rect x="4" y="2" width="16" height="20" rx="2"></rect>',
    'undo-2': '<path d="M9 14 4 9l5-5"></path><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11"></path>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path>',
    bell: '<path d="M10.268 21a2 2 0 0 0 3.464 0"></path><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"></path>',
    hourglass: '<path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>',
    'user-round-pen': '<path d="M2 21a8 8 0 0 1 10.821-7.487"></path><path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"></path><circle cx="10" cy="8" r="5"></circle>',
    'key-round': '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle>',
    'circle-alert': '<circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line>',
    'file-check-corner': '<path d="M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m14 20 2 2 4-4"></path>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>',
  };
  const ic = (name, cls = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name}${cls ? ' ' + cls : ''}" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  const BTN_BASE = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const BTN_VAR = {
    primary: 'border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white',
    secondary: 'border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink',
    ghost: 'border-transparent bg-transparent text-copy shadow-none hover:bg-wash hover:text-ink',
    danger: 'border-status-danger bg-status-danger text-white shadow-button hover:border-status-danger-strong hover:bg-status-danger-strong hover:text-white',
  };
  const BTN_SIZE = { md: 'h-10 px-3.5 text-base', sm: 'h-8 px-2.5 text-sm', lg: 'h-11 px-4 text-md min-h-11' };
  /** Live Button. o: { variant, size, act, id, type, icon, attrs, extra, href } */
  const btn = (label, o = {}) => {
    const cls = `${BTN_BASE} ${BTN_VAR[o.variant || 'secondary']} ${BTN_SIZE[o.size || 'md']}${o.extra ? ' ' + o.extra : ''}`;
    const inner = `${o.icon ? ic(o.icon) : ''}${label}`;
    if (o.href) return `<a class="${cls}" data-slot="button" href="${esc(o.href)}"${o.attrs || ''}>${inner}</a>`;
    return `<button type="${o.type || 'button'}" class="${cls}" data-slot="button"${o.act ? ` data-act="${o.act}"` : ''}${o.id ? ` data-id="${esc(o.id)}"` : ''}${o.attrs || ''}>${inner}</button>`;
  };

  const BADGE_TONE = {
    success: 'border-status-success-line bg-status-success-tint text-status-success',
    warning: 'border-status-warning-line bg-status-warning-tint text-status-warning',
    danger: 'border-status-danger-line bg-status-danger-tint text-status-danger',
    info: 'border-status-info-line bg-status-info-tint text-status-info',
    neutral: 'border-status-neutral-line bg-status-neutral-tint text-status-neutral',
    brand: 'border-brand-line bg-brand-tint text-brand-strong',
  };
  const BADGE_ICON = { success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x', info: 'info', neutral: 'clock', brand: 'send' };
  /** Live StatusBadge. o: { wrap, sr, icon, state } */
  const badge = (tone, text, o = {}) => {
    const wrap = o.wrap
      ? `inline-flex max-w-full gap-1.5 border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0 ${BADGE_TONE[tone]} items-start rounded-control whitespace-normal [&_svg]:mt-0.75`
      : `inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0 ${BADGE_TONE[tone]}`;
    return `<span class="${wrap}" data-slot="status-badge" data-tone="${tone}"${o.state ? ` data-state="${o.state}"` : ''}>${ic(o.icon || BADGE_ICON[tone])}<span class="${o.wrap ? 'min-w-0 wrap-anywhere' : 'truncate'}">${o.sr ? `<span class="sr-only">${esc(o.sr)}: </span>` : ''}${esc(text)}</span></span>`;
  };
  /** On / Off / Unknown badge for a setting row. */
  const stateBadge = (state, title, words) => {
    const w = words || { on: 'On', off: 'Off', unknown: 'Unknown' };
    if (state === 'on') return badge('success', w.on, { wrap: true, sr: `${title}, current state`, icon: 'circle-check', state: 'on' });
    if (state === 'off') return badge('neutral', w.off, { wrap: true, sr: `${title}, current state`, icon: 'circle-off', state: 'off' });
    return badge('warning', w.unknown, { wrap: true, sr: `${title}, current state`, icon: 'circle-question-mark', state: 'unknown' });
  };
  /** Accounts-queue status pill (legacy .status-pill). */
  const pill = (tone, glyph, text, sr) => `<span class="status-pill ${tone}"><span class="status-glyph" aria-hidden="true">${glyph}</span>${sr ? `<span class="visually-hidden">${esc(sr)} </span>` : ''}${esc(text)}</span>`;

  const NOTICE = {
    info: ['border-status-info-line bg-status-info-tint', 'text-status-info', 'info'],
    warning: ['border-status-warning-line bg-status-warning-tint', 'text-status-warning', 'triangle-alert'],
    danger: ['border-status-danger-line bg-status-danger-tint', 'text-status-danger', 'circle-x'],
    success: ['border-status-success-line bg-status-success-tint', 'text-status-success', 'circle-check'],
    restricted: ['border-brand-line bg-brand-tint', 'text-brand-strong', 'shield-alert'],
    locked: ['border-line bg-wash', 'text-quiet', 'lock'],
  };
  /** Live Notice. body = inner html (p elements). o: { title, role, icon, extra, id } */
  const notice = (tone, body, o = {}) => {
    const t = NOTICE[tone];
    const role = o.role === 'none' ? '' : ` role="${o.role || 'note'}"`;
    return `<div${o.id ? ` id="${o.id}"` : ''}${role} class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy ${t[0]}${o.extra ? ' ' + o.extra : ''}" data-slot="notice" data-tone="${tone}">${ic(o.icon || t[2], `mt-0.5 size-4 shrink-0 ${t[1]}`)}<div class="min-w-0 flex-1">${o.title ? `<p class="m-0 font-semibold text-ink">${o.title}</p>` : ''}${body ? `<div class="flex flex-col gap-1.5 [&_p]:m-0${o.title ? ' mt-0.75' : ''}">${body}</div>` : ''}</div></div>`;
  };

  /** Live Card with header. o: { title, desc, aside, body, id, level, extra, bodyClass, footer, titleIcon } */
  const card = (o) => {
    const id = o.id || 'c' + Math.random().toString(36).slice(2, 8);
    const h = `h${o.level || 2}`;
    const title = o.titleIcon ? `<span class="inline-flex items-center gap-2">${ic(o.titleIcon, 'size-4.5 text-quiet')}${o.title}</span>` : o.title;
    const head = o.title
      ? `<div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5">${o.desc ? `<div class="min-w-0"><${h} class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="${id}-heading">${title}</${h}><p class="m-0 text-sm text-quiet">${o.desc}</p></div>` : `<${h} class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="${id}-heading">${title}</${h}>`}${o.aside || ''}</div>`
      : '';
    const foot = o.footer ? `<div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 py-3 text-sm text-quiet">${o.footer}</div>` : '';
    return `<div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card${o.extra ? ' ' + o.extra : ''}" data-slot="card"${o.domId ? ` id="${o.domId}"` : ''}><section aria-labelledby="${id}-heading">${head}<div class="${o.bodyClass || 'px-4.5 py-4'}">${o.body || ''}</div>${foot}</section></div>`;
  };

  const SUMMARY_ROW = 'grid grid-cols-1 gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(10rem,40%)_1fr] sm:gap-4';
  /** Live SummaryList. rows: [[label, html]] (html is NOT escaped). */
  const summary = (rows) => `<dl class="m-0 flex flex-col divide-y divide-line font-sans" data-slot="summary-list">${rows.filter(Boolean).map(([k, v]) => `<div class="${SUMMARY_ROW}"><dt class="text-sm font-medium text-quiet">${esc(k)}</dt><dd class="m-0 wrap-break-word text-ink"><span class="wrap-break-word">${v}</span></dd></div>`).join('')}</dl>`;

  const TH = 'border-b border-line bg-canvas px-4.5 py-2.5 text-left align-middle text-xs font-semibold tracking-[0.04em] text-quiet uppercase';
  const TH_NUM = 'border-b border-line bg-canvas px-4.5 py-2.5 align-middle text-xs font-semibold tracking-[0.04em] text-quiet uppercase text-right';
  const TD_STACK = 'group-data-[stack=true]/table:max-sm:flex group-data-[stack=true]/table:max-sm:justify-between group-data-[stack=true]/table:max-sm:gap-3 group-data-[stack=true]/table:max-sm:px-0 group-data-[stack=true]/table:max-sm:py-1 group-data-[stack=true]/table:max-sm:text-right group-data-[stack=true]/table:max-sm:before:text-left group-data-[stack=true]/table:max-sm:before:text-sm group-data-[stack=true]/table:max-sm:before:font-normal group-data-[stack=true]/table:max-sm:before:text-quiet group-data-[stack=true]/table:max-sm:before:content-[attr(data-label)] group-data-[stack=true]/table:max-sm:first:block group-data-[stack=true]/table:max-sm:first:pb-2 group-data-[stack=true]/table:max-sm:first:text-left group-data-[stack=true]/table:max-sm:first:before:content-none';
  const TD = `border-0 bg-transparent px-4.5 py-3 text-left align-middle ${TD_STACK}`;
  const TD_NUM = `border-0 bg-transparent px-4.5 py-3 align-middle text-right font-medium text-ink tabular-nums ${TD_STACK}`;
  const TR = 'border-b border-line last:border-b-0 hover:bg-canvas group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3';
  /** Live Table (stack on mobile). cols: [{label, num}], rows: [[html...]] or {cells, extra}. */
  const table = (o) => `<div class="group/table relative w-full overflow-x-auto outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none" data-stack="true" role="region" aria-label="${esc(o.label)}" tabindex="0"><table role="table" class="w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block">${o.caption ? `<caption class="px-4.5 py-2 text-left text-sm font-normal text-quiet caption-bottom sr-only">${esc(o.caption)}</caption>` : ''}<thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${TR}">${o.cols.map((c) => `<th scope="col" role="columnheader" class="${c.num ? TH_NUM : TH}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${o.rows.map((r) => `<tr role="row" class="${TR}">${r.map((cell, i) => `<td role="cell"${i ? ` data-label="${esc(o.cols[i].label)}"` : ''} class="${o.cols[i].num ? TD_NUM : TD}${o.cols[i].strong ? ' font-semibold text-ink' : ''}">${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;

  const TAB_A = '-mb-px inline-flex min-h-10 items-center gap-2 rounded-t-control border-b-2 border-transparent px-3 py-2 text-base font-medium text-quiet no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:border-brand-strong aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:-outline-offset-3';
  /** Live link tabs. items: [{href, label, current, count}] */
  const tabs = (label, items) => `<nav aria-label="${esc(label)}" class="font-sans" data-slot="tabs"><ul class="m-0 flex list-none flex-wrap gap-1 border-b border-line p-0 sm:flex-nowrap sm:overflow-x-auto">${items.map((t) => `<li class="m-0 shrink-0"><a${t.current ? ' aria-current="page"' : ''} class="${TAB_A}" href="${esc(t.href)}">${esc(t.label)}${t.count != null ? `<span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums">${t.count}</span>` : ''}</a></li>`).join('')}</ul></nav>`;

  const pageHeader = (o) => `<header class="flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between ${o.mb || 'mb-5'}" data-slot="page-header"><div class="min-w-0">${o.eyebrow ? `<p class="m-0 mb-1 text-sm font-medium text-quiet">${esc(o.eyebrow)}</p>` : ''}<h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">${esc(o.title)}</h1>${o.desc ? `<p class="m-0 mt-1.5 text-base text-quiet">${o.desc}</p>` : ''}</div>${o.actions ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&>*]:flex-1">${o.actions}</div>` : ''}</header>`;

  const CONTROL = 'block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-lg text-ink sm:text-base m-0 appearance-none shadow-none transition-[border-color] duration-(--ui-duration-quick) motion-reduce:transition-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-wash disabled:text-quiet aria-invalid:border-2 aria-invalid:border-status-danger aria-invalid:focus:border-status-danger aria-invalid:focus:outline-status-danger';
  const fieldError = (id, text) => `<p class="m-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger" id="${id}-error">${ic('circle-alert', 'mt-0.5 size-3.5 shrink-0')}<span>${esc(text)}</span></p>`;
  /** Live Field wrapper. o: { id, label, hint, error, optional, extra } control = html */
  const field = (o, control) => `<div class="flex flex-col gap-1.5${o.extra ? ' ' + o.extra : ''}" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="${o.id}">${esc(o.label)}${o.optional ? '<span class="font-normal text-quiet"> (optional)</span>' : ''}</label>${control}${o.hint ? `<p class="m-0 font-sans text-sm text-quiet" id="${o.id}-hint">${o.hint}</p>` : ''}${o.error ? fieldError(o.id, o.error) : ''}</div>`;
  const describedBy = (o) => { const ids = [o.hint ? `${o.id}-hint` : '', o.error ? `${o.id}-error` : ''].filter(Boolean).join(' '); return ids ? ` aria-describedby="${ids}"` : ''; };
  const textarea = (o) => field(o, `<textarea rows="${o.rows || 3}" class="${CONTROL} min-h-24 resize-y leading-relaxed" data-slot="textarea" id="${o.id}" name="${o.name || o.id}" maxlength="${o.max || 500}"${describedBy(o)}${o.error ? ' aria-invalid="true"' : ''}>${esc(o.value || '')}</textarea>`);
  const input = (o) => field(o, `<input type="${o.type || 'text'}" class="${CONTROL}" data-slot="input" id="${o.id}" name="${o.name || o.id}" value="${esc(o.value ?? '')}"${o.attrs || ''}${describedBy(o)}${o.error ? ' aria-invalid="true"' : ''}>`);
  const select = (o) => field(o, `<div class="relative" data-slot="select"><select class="${CONTROL} cursor-pointer pr-9" id="${o.id}" name="${o.name || o.id}"${o.change ? ` data-change="${o.change}"` : ''}${describedBy(o)}${o.error ? ' aria-invalid="true"' : ''}>${o.options.map((op) => `<option value="${esc(op.value)}"${String(op.value) === String(o.value ?? '') ? ' selected' : ''}>${esc(op.label)}</option>`).join('')}</select>${ic('chevron-down', 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-quiet')}</div>`);
  const CHOICE = 'm-0 mt-0.5 size-4 min-h-0 shrink-0 cursor-pointer p-0 accent-brand-strong disabled:cursor-not-allowed outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  /** Live Radio / Checkbox. */
  const choice = (type, o) => `<div class="flex items-start gap-2.5 font-sans" data-slot="${type}"><input id="${o.id}" type="${type}" class="${CHOICE}" name="${o.name}" value="${esc(o.value)}"${o.checked ? ' checked' : ''}${o.disabled ? ' disabled' : ''}${o.desc ? ` aria-describedby="${o.id}-description"` : ''}${o.change ? ` data-change="${o.change}"` : ''}><div class="flex flex-col gap-0.5"><label for="${o.id}" class="text-base font-medium ${o.disabled ? 'cursor-not-allowed text-quiet' : 'text-ink cursor-pointer'}">${esc(o.label)}</label>${o.desc ? `<span id="${o.id}-description" class="text-sm text-quiet">${o.desc}</span>` : ''}</div></div>`;
  const choiceGroup = (legend, inner, o = {}) => `<fieldset class="m-0 min-w-0 border-0 p-0 font-sans"${o.error ? ` aria-describedby="${o.id}-error"` : ''}><legend class="mb-2 p-0 text-base font-semibold text-ink">${esc(legend)}</legend>${o.hint ? `<p class="m-0 mb-2 text-sm text-quiet">${o.hint}</p>` : ''}<div class="flex flex-col gap-2.5">${inner}</div>${o.error ? `<p id="${o.id}-error" class="m-0 mt-2.5 flex items-start gap-1.5 text-sm font-medium text-status-danger">${ic('circle-alert', 'mt-0.5 size-3.5 shrink-0')}<span>${esc(o.error)}</span></p>` : ''}</fieldset>`;

  const statCard = (label, value, note, icon) => `<div class="rounded-card border border-line bg-card px-4.5 py-4 font-sans shadow-card" data-slot="stat-card"><div class="flex items-center justify-between gap-2 text-sm font-medium text-quiet"><span>${esc(label)}</span>${icon ? `<span class="grid size-7.5 place-items-center rounded-control bg-brand-tint text-brand-strong">${ic(icon, 'size-4')}</span>` : ''}</div><p class="m-0 mt-1.5 mb-0.5 text-3xl font-display tracking-display text-ink tabular-nums max-sm:text-2xl">${value}</p>${note ? `<p class="m-0 text-sm text-quiet">${note}</p>` : ''}</div>`;
  const statItem = (label, value, note) => `<div class="rounded-card border border-line bg-card px-4.5 py-4 font-sans shadow-card" data-slot="stat-item"><dt class="flex items-center justify-between gap-2 text-sm font-medium text-quiet"><span>${esc(label)}</span></dt><dd class="m-0 mt-1.5 text-3xl font-display tracking-display text-ink tabular-nums max-sm:text-2xl">${value}</dd>${note ? `<dd class="m-0 mt-0.5 text-sm text-quiet">${note}</dd>` : ''}</div>`;
  const LINK = 'rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const link = (href, text) => `<a class="${LINK}" href="${esc(href)}">${text}</a>`;
  const sectionHead = (title, desc, id) => `<div class="flex flex-col gap-1"><h2${id ? ` id="${id}"` : ''} class="m-0 text-xl leading-tight font-display tracking-heading text-ink">${esc(title)}</h2>${desc ? `<p class="m-0 text-copy">${desc}</p>` : ''}</div>`;

  /** Time now in the preview: today's date with the real clock time. */
  const nowStamp = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const roleOfPerson = (k) => { const r = TN.ROLES.find((x) => x.person === k); return r ? r.key : String(k || '').replace(/\d+$/, ''); };
  const personName = (k) => (TN.person(k) ? TN.person(k).name : '—');
  let nId = 0;
  /** Push a staff notice (shared TN.DATA.notices). */
  const notify = (to, text, extra = {}) => {
    TN.DATA.notices.unshift({ id: 'nh' + ++nId + '-' + Date.now(), to: [...new Set(to)], kind: extra.kind || 'notice', text, deal: extra.deal, href: extra.href, at: nowStamp() });
  };
  const reasonOk = (s) => { const t = String(s || '').replace(/\s+/g, ' ').trim(); return t.length >= 10 && t.length <= 500 ? t : null; };

  TN.hm = { ic, btn, badge, stateBadge, pill, notice, card, summary, table, tabs, pageHeader, field, textarea, input, select, choice, choiceGroup, statCard, statItem, link, LINK, sectionHead, nowStamp, notify, roleOfPerson, personName, reasonOk, CONTROL, BTN_BASE };

  /* ---------------------------------------------------------------
     Extra shared data (added at load time; 00 is never edited)
     --------------------------------------------------------------- */
  const D = TN.DATA;
  if (!TN.PEOPLE.purchase2) TN.PEOPLE.purchase2 = { id: 'u-purchase2', name: 'Pankaj Solanki', role: 'Purchase', branch: 'Jodhpur' };

  /** Reminder and escalation rules (edited in Settings · Reminder rules). */
  D.reminderRules = D.reminderRules || {
    dueSoon: { on: true, days: 3 },
    overdue: { on: true, days: 1 },
    escalateOverdue: { on: true, days: 3 },
    accountsWait: { on: true, days: 1 },
    notTaken: { on: true, hours: 4 },
    stuck: { on: true, days: 3 },
    invoiceMissing: { on: true, days: 2 },
  };

  /** Last update on tasks that are in progress (for "stuck task" escalations). */
  D.taskTouched = D.taskTouched || { 's-412-t': '2026-10-21', 's-547-t': '2026-10-22' };
  /** Write-offs (Stage 9). */
  D.writeOffs = D.writeOffs || [
    { id: 'WO-26-002', deal: 'BX-38264', amount: 2400, reason: 'JW Marriott Mussoorie charged a late check-out the group did not take. The hotel will not waive it; we absorb it instead of charging the customer.', requestedBy: 'accounts', at: '2026-10-26 15:10', status: 'waiting_manager' },
    { id: 'WO-26-003', deal: 'BX-38198', amount: 2500, reason: 'Waive our own ₹2,500 cancellation charge for the Tak family: the father is in hospital.', requestedBy: 'manager', at: '2026-10-27 09:30', status: 'waiting_manager' },
  ];
  /** One customer transfer split across branches (Stage 4). */
  D.splits = D.splits || [
    { id: 'SPL-26-003', party: 'Marudhar Agro Foods Pvt Ltd', amount: 160000, ref: 'UTR SBINR52026102771530', date: '2026-10-27', requestedBy: 'accounts', status: 'waiting_manager',
      parts: [ { label: 'BX-38547 · Jaisalmer offsite · Jodhpur branch', deal: 'BX-38547', amount: 100000 }, { label: 'BX-38589 · Udaipur sales meet · Delhi branch', amount: 60000 } ] },
  ];
  /** Decisions taken by the Manager (newest first). */
  D.managerDecisions = D.managerDecisions || [
    { at: '2026-10-25 18:05', kind: 'Supplier payment', ref: 'SP-26-0026', text: 'Approved ₹51,600 to Hotel Grand Mumtaz (BX-38377).', outcome: 'approved' },
    { at: '2026-10-24 12:40', kind: 'Supplier payment', ref: 'SP-26-0023', text: 'Approved ₹55,900 to Span Resort and Spa (BX-38198).', outcome: 'approved' },
    { at: '2026-10-16 11:20', kind: 'Supplier payment', ref: 'SP-26-0025', text: 'Approved ₹1,38,900 to Asia Holidays Pte Ltd (BX-38301).', outcome: 'approved' },
  ];

  const LIMIT = 50000;
  const MANAGER = 'manager';
  const dealLink = (id) => (id && TN.deal(id) ? `<a class="${LINK}" href="#/app/deals/${esc(id)}">${esc(id)}</a>` : esc(id || '—'));
  const custOf = (dealId) => { const d = TN.deal(dealId); return d && TN.customer(d.customer) ? TN.customer(d.customer).name : '—'; };
  const supName = (id) => (TN.supplier(id) ? TN.supplier(id).name : id);
  const countedTotal = (p) => D.supplierPayments.filter((x) => x.deal === p.deal && x.supplier === p.supplier && x.status !== 'returned').reduce((s, x) => s + x.amount, 0);
  const countedN = (p) => D.supplierPayments.filter((x) => x.deal === p.deal && x.supplier === p.supplier && x.status !== 'returned').length;

  /* ---------------------------------------------------------------
     Approval items (one shape for every group)
     --------------------------------------------------------------- */
  const GROUPS = [
    { key: 'pay', title: 'Supplier payments above ₹50,000', desc: 'Counted across the Deal and the supplier. Accounts pays each one and records the bank reference; a different Accounts person verifies it.', icon: 'banknote' },
    { key: 'fund', title: 'Company funding above ₹50,000', desc: 'The supplier must be paid before the customer’s money arrives. It is recovered from the next customer receipt on that Deal.', icon: 'hand-coins' },
    { key: 'cost', title: 'Hotel and service costs above budget', desc: 'Purchase cannot record the supplier’s confirmation until you approve the cost.', icon: 'hotel' },
    { key: 'bank', title: 'Supplier bank details', desc: 'Payments to the supplier stay On hold until you approve the new details.', icon: 'landmark' },
    { key: 'cancel', title: 'Cancellations, refunds and write-offs', desc: 'Sales requests, Purchase enters the supplier charges, you approve, Accounts pays and a different Accounts person verifies.', icon: 'undo-2' },
    { key: 'split', title: 'Money split across branches', desc: 'One customer transfer that pays bookings in more than one branch.', icon: 'receipt' },
  ];

  function approvalItems() {
    const out = [];
    D.supplierPayments.filter((p) => p.status === 'waiting_manager').forEach((p) => {
      const s = TN.service(p.service) || {};
      const total = countedTotal(p);
      const fund = p.funding ? D.funding.find((f) => f.id === p.funding) : null;
      out.push({
        group: 'pay', id: p.id, deal: p.deal, by: p.raisedBy, at: p.raisedAt, amount: p.amount,
        title: `${supName(p.supplier)}`, sub: `${s.title || ''} · ${p.part}`,
        why: total > p.amount ? `Counted ${inr(total)} (${countedN(p)} requests)` : `${inr(p.amount)} is above ₹50,000`,
        details: [
          ['Supplier', esc(supName(p.supplier))],
          ['Service', esc(s.title || '—')],
          ['Deal', `${dealLink(p.deal)} · ${esc(custOf(p.deal))}`],
          ['This request', `${inr(p.amount)} · ${esc(p.part)}`],
          ['Counted for this supplier on this Deal', `${inr(total)} across ${TN.fmt.plural(countedN(p), 'request')}`],
          ['Pay by', TN.fmt.date(p.dueBy)],
          ['Raised by', `${esc(personName(p.raisedBy))} (${esc(TN.person(p.raisedBy) ? TN.person(p.raisedBy).role : '')}), ${TN.fmt.date(p.raisedAt)}`],
          p.invoice ? ['Supplier invoice', esc(p.invoice)] : null,
          fund ? ['Paid from company funding', `${esc(fund.id)} · ${inr(fund.amount)} · ${fund.status === 'waiting_manager' ? 'waiting for you' : esc(fund.status)}`] : null,
        ],
        notes: [p.note ? notice('info', `<p>${esc(p.note)}</p>`) : '', TN.supplier(p.supplier) && TN.supplier(p.supplier).bank !== 'approved' && TN.supplier(p.supplier).bank !== 'not_needed' ? notice('warning', '<p>This supplier’s bank details are not approved yet. The payment stays On hold until you approve them.</p>') : ''].join(''),
        block: () => (fund && fund.status === 'waiting_manager' ? `Approve the company funding ${fund.id} first: this payment is paid from it. Nothing was changed.` : null),
        approve: () => {
          p.status = 'approved'; p.approvedBy = MANAGER; p.approvedAt = nowStamp();
          notify(['accounts', 'checker', roleOfPerson(p.raisedBy)], `Vikram Rathore approved supplier payment ${p.id}: ${inr(p.amount)} to ${supName(p.supplier)}. Accounts can pay it now and record the bank reference.`, { deal: p.deal, href: '#/app/accounts/supplier-payments' });
          return `Approved ${p.id}. Accounts can pay it now.`;
        },
        ret: (r) => {
          p.status = 'returned'; p.returnReason = r; p.returnedBy = MANAGER;
          notify([roleOfPerson(p.raisedBy), 'accounts'], `Vikram Rathore returned supplier payment ${p.id} (${inr(p.amount)} to ${supName(p.supplier)}): “${r}”`, { deal: p.deal });
          return `Returned ${p.id} to ${personName(p.raisedBy)}.`;
        },
        kind: 'Supplier payment',
      });
    });
    D.funding.filter((f) => f.status === 'waiting_manager').forEach((f) => {
      const s = TN.service(f.service) || {};
      out.push({
        group: 'fund', id: f.id, deal: f.deal, by: f.requestedBy, at: f.at, amount: f.amount,
        title: s.title || 'Company funding', sub: f.recoverFrom ? `Recover from: ${f.recoverFrom}` : '',
        why: `${inr(f.amount)} is above ₹50,000`,
        details: [
          ['Deal', `${dealLink(f.deal)} · ${esc(custOf(f.deal))}`],
          ['Service', esc(s.title || '—')],
          ['Amount the company pays first', inr(f.amount)],
          ['Recovered from', esc(f.recoverFrom || '—')],
          ['Requested by', `${esc(personName(f.requestedBy))}, ${TN.fmt.date(f.at)}`],
        ],
        notes: notice('info', `<p>${esc(f.reason)}</p>`),
        approve: () => {
          f.status = 'approved'; f.approvedBy = MANAGER;
          notify(['accounts', 'checker', roleOfPerson(f.requestedBy)], `Vikram Rathore approved company funding ${f.id}: ${inr(f.amount)} for ${s.title || f.deal}. It is recovered from the next customer receipt on ${f.deal}.`, { deal: f.deal, href: '#/app/accounts/funding' });
          return `Approved ${f.id}.`;
        },
        ret: (r) => {
          f.status = 'refused'; f.returnReason = r;
          notify([roleOfPerson(f.requestedBy), 'accounts'], `Vikram Rathore did not approve company funding ${f.id}: “${r}”`, { deal: f.deal });
          return `Returned ${f.id} to ${personName(f.requestedBy)}.`;
        },
        kind: 'Company funding',
      });
    });
    /* Costs above budget: read from the Purchase workspace (40-purchase.js exposes TN.purchase). */
    const P = TN.purchase;
    if (P) Object.entries(D.services).forEach(([sid, s]) => {
      if (s.dept !== 'purchase') return;
      let iss = []; try { iss = P.issues(sid) || []; } catch (e) { iss = []; }
      if (!iss.includes('over_budget')) return;
      const w = P.work(sid); const c = P.latestCost(sid);
      if (!c || (w.costReturned && w.costReturned.v === c.v)) return;
      const offer = (w.offers || []).find((o) => o.id === c.offer);
      const sup = offer && TN.supplier(offer.supplier) ? TN.supplier(offer.supplier).name : (TN.supplier(s.supplier) || {}).name || '—';
      out.push({
        group: 'cost', id: `${sid} v${c.v}`, deal: s.deal, by: c.by, at: String(c.at).slice(0, 10), amount: c.amount,
        title: s.title, sub: `${sup} · budget ${inr(s.budget)}`, why: `${inr(c.amount - s.budget)} above budget`,
        details: [
          ['Service', `${esc(s.title)} · ${link('#/app/purchase/' + sid + '?tab=work', 'Open Purchase task')}`],
          ['Deal', `${dealLink(s.deal)} · ${esc(custOf(s.deal))}`],
          ['Supplier', esc(sup)],
          ['Approved budget', inr(s.budget)],
          ['Proposed cost', `${inr(c.amount)} (${inr(c.amount - s.budget)} above) · version ${c.v}`],
          ['Proposed by', `${esc(personName(c.by))}, ${TN.fmt.dateTime(c.at)}`],
        ],
        notes: c.note ? notice('info', `<p>${esc(c.note)}</p>`) : '',
        approve: () => {
          w.approvals = w.approvals || {}; w.approvals[c.v] = { by: MANAGER, at: nowStamp() };
          if (w.history) w.history.push({ text: `Cost approved above budget (version ${c.v})`, at: nowStamp(), by: MANAGER });
          notify(['purchase'], `Vikram Rathore approved the cost above budget for ${s.title} (${s.deal}), version ${c.v}. You can record the supplier’s confirmation now.`, { deal: s.deal, href: `#/app/purchase/${sid}?tab=work` });
          return `Approved the cost for ${s.title}.`;
        },
        ret: (r) => {
          w.costReturned = { v: c.v, reason: r, at: nowStamp() };
          if (w.history) w.history.push({ text: `Cost above budget returned by the Manager (version ${c.v}): ${r}`, at: nowStamp(), by: MANAGER });
          notify(['purchase'], `Vikram Rathore did not approve the cost ${inr(c.amount)} for ${s.title} (${s.deal}): “${r}”. Propose a new cost or ask Sales to raise the budget.`, { deal: s.deal, href: `#/app/purchase/${sid}?tab=work` });
          return `Returned the cost to ${personName(c.by)}.`;
        },
        kind: 'Cost above budget',
      });
    });
    Object.entries(D.suppliers).filter(([, sp]) => sp.bank === 'changed' || sp.bank === 'waiting').forEach(([id, sp]) => {
      const held = D.supplierPayments.filter((p) => p.supplier === id && p.status === 'on_hold');
      const bank = BANK[id] || {};
      out.push({
        group: 'bank', id, deal: null, by: 'purchase', at: bank.at || TN.TODAY, amount: null,
        title: sp.name, sub: sp.bank === 'changed' ? 'Bank details changed' : 'New supplier: verify and approve bank details',
        why: sp.bank === 'changed' ? `${TN.fmt.plural(held.length, 'payment')} on hold` : 'Not verified yet',
        details: [
          ['Supplier', `${esc(sp.name)}, ${esc(sp.city)} · ${esc(sp.type)}`],
          ['Verified supplier', sp.verified ? 'Yes' : 'Not yet'],
          bank.old ? ['Old account', esc(bank.old)] : null,
          ['New account', esc(bank.acct || '—')],
          ['IFSC', `<span class="font-mono tabular-nums">${esc(bank.ifsc || '—')}</span>`],
          ['Proof', esc(bank.proof || '—')],
          ['Recorded by', `${esc(personName('purchase'))}, ${TN.fmt.date(bank.at)}`],
          held.length ? ['Payments on hold', held.map((p) => `${esc(p.id)} · ${inr(p.amount)}`).join('<br>')] : null,
        ],
        notes: notice('warning', '<p>Call the supplier on a number you already have (not one from the new letter) and confirm the account before you approve.</p>'),
        approve: () => {
          sp.bank = 'approved'; sp.verified = true;
          held.forEach((p) => { p.status = p.approvedBy ? 'approved' : 'requested'; p.note = `Bank details approved by Vikram Rathore on ${TN.fmt.date(TN.TODAY)}. Released from hold.`; });
          notify(['accounts', 'checker', 'purchase'], `Vikram Rathore approved the bank details of ${sp.name}.${held.length ? ` ${held.map((p) => p.id).join(', ')} released from hold.` : ''}`, { href: '#/app/purchase/suppliers/' + id });
          return `Approved the bank details of ${sp.name}.`;
        },
        ret: (r) => {
          sp.bank = 'returned';
          notify(['purchase', 'accounts'], `Vikram Rathore did not approve the bank details of ${sp.name}: “${r}”. Payments stay on hold.`, { href: '#/app/purchase/suppliers/' + id });
          return `Returned the bank details of ${sp.name} to Purchase.`;
        },
        kind: 'Supplier bank details',
      });
    });
    D.cancellations.filter((c) => c.status === 'waiting_manager').forEach((c) => {
      const charges = c.charges.reduce((s, x) => s + x.supplierCharge, 0);
      out.push({
        group: 'cancel', id: c.id.toUpperCase(), ref: c, deal: c.deal, by: c.requestedBy, at: c.at, amount: c.recoveryFromCustomer || c.refundToCustomer,
        title: c.kind, sub: c.recoveryFromCustomer ? `Recover ${inr(c.recoveryFromCustomer)} from the customer` : `Refund ${inr(c.refundToCustomer)} to the customer`,
        why: 'Cancellation',
        details: [
          ['Deal', `${dealLink(c.deal)} · ${esc(custOf(c.deal))}`],
          ['Reason', esc(c.reason)],
          ['Supplier charges', c.charges.map((x) => `${esc((TN.service(x.service) || {}).title || x.service)}: ${inr(x.supplierCharge)} <span class="text-quiet">(${esc(x.note)})</span>`).join('<br>')],
          ['Total supplier charges', inr(charges)],
          ['Our cancellation charge', inr(c.ourCharge)],
          ['Customer has paid', inr(c.customerPaid)],
          c.recoveryFromCustomer ? ['Still to recover from the customer', inr(c.recoveryFromCustomer)] : ['Refund to the customer', inr(c.refundToCustomer)],
          ['Requested by', `${esc(personName(c.requestedBy))}, ${TN.fmt.date(c.at)}`],
        ],
        notes: '',
        approve: () => {
          c.status = 'approved'; c.approvedBy = MANAGER;
          const d = TN.deal(c.deal); if (d) d.cancellationStatus = 'approved';
          notify([roleOfPerson(c.requestedBy), 'accounts', 'checker', 'purchase'], `Vikram Rathore approved the cancellation of ${c.deal}. ${c.recoveryFromCustomer ? `Recover ${inr(c.recoveryFromCustomer)} from the customer.` : `Accounts pays the refund of ${inr(c.refundToCustomer)}.`} Purchase cancels with the suppliers.`, { deal: c.deal });
          return `Approved the cancellation of ${c.deal}.`;
        },
        ret: (r) => {
          c.status = 'requested'; c.returnReason = r;
          notify([roleOfPerson(c.requestedBy), 'purchase'], `Vikram Rathore returned the cancellation of ${c.deal}: “${r}”`, { deal: c.deal });
          return `Returned the cancellation to ${personName(c.requestedBy)}.`;
        },
        kind: 'Cancellation',
      });
    });
    D.writeOffs.filter((w) => w.status === 'waiting_manager').forEach((w) => {
      out.push({
        group: 'cancel', id: w.id, deal: w.deal, by: w.requestedBy, at: w.at.slice(0, 10), amount: w.amount,
        title: 'Write-off', sub: w.reason.length > 70 ? w.reason.slice(0, 68) + '…' : w.reason, why: 'Write-off',
        details: [
          ['Deal', `${dealLink(w.deal)} · ${esc(custOf(w.deal))}`],
          ['Amount written off', inr(w.amount)],
          ['Reason', esc(w.reason)],
          ['Requested by', `${esc(personName(w.requestedBy))}, ${TN.fmt.dateTime(w.at)}`],
        ],
        notes: '',
        approve: () => {
          w.status = 'approved'; w.approvedBy = MANAGER;
          notify(['accounts', 'checker', roleOfPerson(w.requestedBy)], `Vikram Rathore approved write-off ${w.id}: ${inr(w.amount)} on ${w.deal}.`, { deal: w.deal });
          return `Approved write-off ${w.id}.`;
        },
        ret: (r) => {
          w.status = 'returned'; w.returnReason = r;
          notify([roleOfPerson(w.requestedBy)], `Vikram Rathore returned write-off ${w.id}: “${r}”`, { deal: w.deal });
          return `Returned ${w.id} to ${personName(w.requestedBy)}.`;
        },
        kind: 'Write-off',
      });
    });
    D.splits.filter((s) => s.status === 'waiting_manager').forEach((s) => {
      out.push({
        group: 'split', id: s.id, deal: s.parts[0].deal, by: s.requestedBy, at: s.date, amount: s.amount,
        title: s.party, sub: s.parts.map((p) => p.label.split(' · ').pop()).join(' and '), why: 'Two branches',
        details: [
          ['Paid by', esc(s.party)],
          ['Transfer', `${inr(s.amount)} · ${esc(s.ref)} · ${TN.fmt.date(s.date)}`],
          ['Split', s.parts.map((p) => `${p.deal ? dealLink(p.deal) + esc(p.label.slice(p.deal.length)) : esc(p.label)}: ${inr(p.amount)}`).join('<br>')],
          ['Recorded by', `${esc(personName(s.requestedBy))}, ${TN.fmt.date(s.date)}`],
        ],
        notes: notice('info', '<p>Each branch’s Accounts records its own part as a receipt. A different Accounts person verifies each one.</p>'),
        approve: () => {
          s.status = 'approved';
          notify(['accounts', 'checker'], `Vikram Rathore approved split ${s.id}: ${s.parts.map((p) => inr(p.amount)).join(' and ')} from ${s.party}.`, { deal: s.parts[0].deal });
          return `Approved split ${s.id}.`;
        },
        ret: (r) => {
          s.status = 'returned';
          notify(['accounts'], `Vikram Rathore returned split ${s.id}: “${r}”`);
          return `Returned ${s.id} to ${personName(s.requestedBy)}.`;
        },
        kind: 'Split across branches',
      });
    });
    return out;
  }

  /** Bank detail records (invented) for the two suppliers waiting. */
  const BANK = {
    'sp-span': { old: 'HDFC Bank ··2290 · Span Resorts Pvt Ltd', acct: 'Kotak Mahindra Bank ··7714 · Span Resorts Pvt Ltd', ifsc: 'KKBK0000271', proof: 'Span-bank-change-letter.pdf (signed, on letterhead)', at: '2026-10-24' },
    'sp-marwarcoach': { acct: 'State Bank of India ··0388 · Marwar Coach Services', ifsc: 'SBIN0003091', proof: 'Cancelled-cheque-marwar-coach.jpg', at: '2026-10-25' },
  };

  /* ---------------------------------------------------------------
     Escalations
     --------------------------------------------------------------- */
  function escalations() {
    const R = D.reminderRules;
    const out = { overdue: [], accounts: [], notTaken: [], stuck: [] };
    if (R.escalateOverdue.on) D.instalments.forEach((i, idx) => {
      const late = -TN.fmt.daysFrom(i.due);
      if ((i.status === 'overdue' || i.status === 'part_paid' || (i.status === 'due' && late > 0)) && late >= R.escalateOverdue.days) out.overdue.push({ i, idx, late });
    });
    if (R.accountsWait.on) D.deals.filter((d) => d.bookingState === 'waiting_for_accounts' && d.submittedAt && -TN.fmt.daysFrom(d.submittedAt) >= R.accountsWait.days).forEach((d) => out.accounts.push(d));
    if (R.notTaken.on) Object.entries(D.services).forEach(([id, s]) => {
      const d = TN.deal(s.deal);
      if (!s.assignee && s.taskStatus === 'new' && s.goAhead !== 'waiting' && d && d.submittedAt) out.notTaken.push({ id, s, since: d.submittedAt });
    });
    if (R.stuck.on) Object.entries(D.taskTouched).forEach(([id, at]) => {
      const s = TN.service(id);
      if (s && s.taskStatus === 'in_progress' && -TN.fmt.daysFrom(at) >= R.stuck.days) out.stuck.push({ id, s, at });
    });
    return out;
  }
  const escCount = () => { const e = escalations(); return e.overdue.length + e.accounts.length + e.notTaken.length + e.stuck.length; };
  TN.hm.escalationCount = escCount;
  TN.hm.approvalCount = () => approvalItems().filter((i) => i.by !== MANAGER).length;
  /* Same count everywhere (sidebar badge, Home, Approvals tab): requests waiting for this Manager, own requests left out. */
  TN.approvalsWaiting = TN.hm.approvalCount;

  /* ---------------------------------------------------------------
     Approvals page
     --------------------------------------------------------------- */
  const QUEUE_HEAD = (cols) => `<thead><tr>${cols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>`;

  function groupTable(g, list) {
    const cols = ['Request', 'Deal', 'Raised by', 'Amount', 'Why it is with you', 'Decision'];
    const rows = list.map((it) => (it.group === 'bank' || it.group === 'cost' ? `<tr><td data-label="Request"><strong>${esc(it.title)}</strong><span class="fin-sub">${esc(it.sub)}</span></td>` : `<tr><td data-label="Request"><strong>${esc(it.id)}</strong><span class="fin-sub">${esc(it.title)}${it.sub ? ' · ' + esc(it.sub) : ''}</span></td>`)
      + `<td data-label="Deal">${it.deal ? `<a href="#/app/deals/${esc(it.deal)}"><strong>${esc(it.deal)}</strong><span class="visually-hidden"> — open the Deal</span></a><span class="fin-sub">${esc(custOf(it.deal))}</span>` : '<span class="fin-sub">No Deal: supplier record</span>'}</td>`
      + `<td data-label="Raised by">${esc(personName(it.by))}<span class="fin-sub">${TN.fmt.date(it.at)}</span></td>`
      + `<td data-label="Amount" class="fin-num">${it.amount != null ? inr(it.amount) : '—'}</td>`
      + `<td data-label="Why it is with you">${pill(it.by === MANAGER ? 'warn' : 'info', it.by === MANAGER ? '!' : '◐', it.by === MANAGER ? 'Your own request' : it.why, 'Why:')}</td>`
      + `<td data-label="Decision">${btn(`Review<span class="visually-hidden"> ${esc(it.group === 'bank' || it.group === 'cost' ? it.title : it.id)}</span>`, { size: 'sm', act: 'mgr-review', id: it.group + ':' + it.id })}</td></tr>`).join('');
    return `<section class="mb-8" aria-labelledby="grp-${g.key}"><div class="mb-3 flex flex-col gap-1"><h2 id="grp-${g.key}" class="m-0 flex items-center gap-2 text-lg font-semibold text-ink">${ic(g.icon, 'size-4.5 text-quiet')}${esc(g.title)}<span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums">${list.length}</span></h2><p class="m-0 text-sm text-quiet">${esc(g.desc)}</p></div>`
      + (list.length ? `<div class="table-scroll"><table class="stack-table fin-queue"><caption class="visually-hidden">${TN.fmt.plural(list.length, 'request')} · ${esc(g.title)}</caption>${QUEUE_HEAD(cols)}<tbody>${rows}</tbody></table></div>` : `<p class="m-0 rounded-control border border-line bg-card px-4 py-3.5 text-quiet">Nothing waiting.</p>`)
      + `</section>`;
  }

  function escalationView() {
    const e = escalations();
    const R = D.reminderRules;
    const sec = (key, title, desc, icon, list, cols, row) => `<section class="mb-8" aria-labelledby="esc-${key}"><div class="mb-3 flex flex-col gap-1"><h2 id="esc-${key}" class="m-0 flex items-center gap-2 text-lg font-semibold text-ink">${ic(icon, 'size-4.5 text-quiet')}${esc(title)}<span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums">${list.length}</span></h2><p class="m-0 text-sm text-quiet">${desc}</p></div>`
      + (list.length ? `<div class="table-scroll"><table class="stack-table fin-queue"><caption class="visually-hidden">${TN.fmt.plural(list.length, 'item')} · ${esc(title)}</caption>${QUEUE_HEAD(cols)}<tbody>${list.map(row).join('')}</tbody></table></div>` : `<p class="m-0 rounded-control border border-line bg-card px-4 py-3.5 text-quiet">Nothing here.</p>`) + `</section>`;
    const dealCell = (id) => `<td data-label="Deal"><a href="#/app/deals/${esc(id)}"><strong>${esc(id)}</strong><span class="visually-hidden"> — open the Deal</span></a><span class="fin-sub">${esc(custOf(id))}</span></td>`;
    return sec('overdue', 'Instalments overdue', `${R.escalateOverdue.days} or more days overdue. The Deal’s Sales owner chases the customer; Accounts sees the same dues list.`, 'clock', e.overdue, ['Deal', 'Instalment', 'Due', 'Still due', 'Sales owner', 'Next step'],
      ({ i, idx, late }) => `<tr>${dealCell(i.deal)}<td data-label="Instalment">${esc(i.label)}</td><td data-label="Due">${TN.fmt.date(i.due)}<span class="fin-sub">${pill('warn', '!', TN.fmt.plural(late, 'day') + ' overdue', 'Status:')}</span></td><td data-label="Still due" class="fin-num">${inr(i.amount - i.paid)}</td><td data-label="Sales owner">${esc(personName((TN.deal(i.deal) || {}).owner))}</td><td data-label="Next step">${btn('Remind the Sales owner', { size: 'sm', act: 'mgr-remind-due', id: String(idx) })}</td></tr>`)
      + sec('accounts', 'Bookings waiting for Accounts', `Waiting ${TN.fmt.plural(R.accountsWait.days, 'day')} or more for the Accounts review. Hotel work cannot start before the go-ahead.`, 'hourglass', e.accounts, ['Deal', 'Submitted', 'Waiting', 'Sales owner', 'Next step'],
        (d) => `<tr>${dealCell(d.id)}<td data-label="Submitted">${TN.fmt.date(d.submittedAt)}</td><td data-label="Waiting">${pill('warn', '◷', TN.fmt.plural(-TN.fmt.daysFrom(d.submittedAt), 'day'), 'Waiting:')}</td><td data-label="Sales owner">${esc(personName(d.owner))}</td><td data-label="Next step">${btn('Remind Accounts', { size: 'sm', act: 'mgr-remind-acc', id: d.id })}</td></tr>`)
      + sec('nottaken', 'Tasks not taken', `Nobody took these tasks within ${R.notTaken.hours} hours.`, 'inbox', e.notTaken, ['Task', 'Deal', 'Department', 'Waiting since', 'Next step'],
        ({ id, s, since }) => `<tr><td data-label="Task"><strong>${esc(s.title)}</strong><span class="fin-sub">${esc(s.detail || '')}</span></td>${dealCell(s.deal)}<td data-label="Department">${esc(DEPT[s.dept])}</td><td data-label="Waiting since">${TN.fmt.date(since)}</td><td data-label="Next step">${btn('Give to someone', { size: 'sm', act: 'mgr-assign', id })}</td></tr>`)
      + sec('stuck', 'Stuck tasks', `In progress with no update for ${R.stuck.days} or more days. Move a stuck task to someone else.`, 'user-round-pen', e.stuck, ['Task', 'Deal', 'With', 'Last update', 'Next step'],
        ({ id, s, at }) => `<tr><td data-label="Task"><strong>${esc(s.title)}</strong><span class="fin-sub">${esc(s.detail || '')}</span></td>${dealCell(s.deal)}<td data-label="With">${esc(personName(s.assignee))}</td><td data-label="Last update">${TN.fmt.date(at)}<span class="fin-sub">${TN.fmt.plural(-TN.fmt.daysFrom(at), 'day')} ago</span></td><td data-label="Next step">${btn('Reassign task', { size: 'sm', act: 'mgr-move', id })}</td></tr>`);
  }
  const DEPT = { purchase: 'Purchase', flight: 'Flight', visa: 'Visa and passport' };
  const DEPT_PEOPLE = { purchase: ['purchase', 'purchase2'], flight: ['flight'], visa: ['visa'] };

  function decidedView() {
    const list = D.managerDecisions;
    return `<div class="table-scroll"><table class="stack-table fin-queue"><caption>${TN.fmt.plural(list.length, 'decision')} · Decided</caption>${QUEUE_HEAD(['When', 'Request', 'Decision', 'Note'])}<tbody>${list.map((x) => `<tr><td data-label="When">${TN.fmt.dateTime(x.at)}</td><td data-label="Request"><strong>${esc(x.ref)}</strong><span class="fin-sub">${esc(x.kind)}</span></td><td data-label="Decision">${x.outcome === 'approved' ? pill('ok', '✓', 'Approved', 'Decision:') : pill('warn', '↩', 'Returned', 'Decision:')}</td><td data-label="Note">${esc(x.text)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  TN.page('/app/approvals', {
    nav: '/app/approvals', roles: ['manager'], title: 'Approvals',
    render(params, q) {
      const tab = q.tab || 'waiting';
      const items = approvalItems();
      const ec = escCount();
      let body = '';
      if (tab === 'escalations') body = escalationView();
      else if (tab === 'decided') body = decidedView();
      else body = GROUPS.map((g) => groupTable(g, items.filter((i) => i.group === g.key))).join('');
      return pageHeader({ eyebrow: 'Jodhpur branch', title: 'Approvals', mb: 'mb-3' })
        + `<div class="mb-5 flex flex-col gap-2 font-sans text-base text-copy [&_p]:m-0" data-slot="finance-header-lines"><p>Requests that need the branch Manager, and work that is running late.</p><p class="fin-disclaimer" role="note"><span aria-hidden="true">ⓘ </span>You never approve your own request. Every decision is recorded with your name and the people involved get a notice.</p></div>`
        + `<div class="mb-4 flex flex-col gap-2">${tabs('Approvals tabs', [
          { href: '#/app/approvals', label: 'Waiting for you', current: tab === 'waiting', count: items.filter((i) => i.by !== MANAGER).length },
          { href: '#/app/approvals?tab=escalations', label: 'Escalations', current: tab === 'escalations', count: ec },
          { href: '#/app/approvals?tab=decided', label: 'Decided', current: tab === 'decided' },
        ])}</div>`
        + body;
    },
  });

  /* ---------- Approve / return drawer ---------- */
  const findItem = (key) => { const [g, ...rest] = key.split(':'); const id = rest.join(':'); return approvalItems().find((i) => i.group === g && i.id === id); };

  function openReview(key, state = {}) {
    const it = findItem(key);
    if (!it) { TN.toast('This request was already decided.'); TN.refresh(); return; }
    const own = it.by === MANAGER;
    const body = `<div class="flex flex-col gap-4">`
      + `<div class="flex flex-wrap items-center gap-2">${badge(own ? 'warning' : 'info', own ? 'Your own request' : 'Waiting for you', {})}<span class="text-sm text-quiet">${esc(it.kind)}</span></div>`
      + (state.error ? notice('danger', `<p>${esc(state.error)}</p>`, { role: 'alert', id: 'mgr-error' }) : '')
      + (own ? notice('restricted', '<p>You asked for this, so a different person must approve it. Ask the Super Admin to approve it or to name another Manager. It stays waiting.</p>', { title: 'You cannot approve your own request' }) : '')
      + summary(it.details)
      + (it.notes || '')
      + `<form data-act="mgr-noop" class="flex flex-col gap-3" novalidate>${textarea({ id: 'mgr-reason', label: 'Note for the people involved', optional: false, hint: 'Needed to return the request: 10 to 500 characters. Optional when you approve.', value: state.reason || '', error: state.reasonError })}</form>`
      + `</div>`;
    const footer = `<div class="flex flex-wrap gap-2">${own ? '' : btn('Approve', { variant: 'primary', act: 'mgr-approve', id: key })}${btn(`Return to ${esc(personName(it.by))}`, { act: 'mgr-return', id: key, extra: own ? 'hidden' : '' })}${btn('Cancel', { variant: 'ghost', attrs: ' data-close' })}</div>`;
    TN.drawer({ title: it.group === 'bank' ? `Bank details · ${it.title}` : it.group === 'cost' ? `Cost above budget · ${it.title}` : `${it.id} · ${it.title}`, description: it.amount != null ? `${it.kind} · ${inr(it.amount)}` : it.kind, body, footer });
    if (state.focus) { const el = document.getElementById(state.focus); if (el) el.focus(); }
  }
  const decide = (ref, outcome, text) => { D.managerDecisions.unshift({ at: nowStamp(), kind: ref.kind, ref: ref.id, text, outcome }); };
  TN.act('mgr-noop', () => {});
  TN.act('mgr-review', (el) => openReview(el.dataset.id));
  TN.act('mgr-approve', (el) => {
    const key = el.dataset.id; const it = findItem(key);
    const reason = (document.getElementById('mgr-reason') || {}).value || '';
    if (!it) return;
    if (it.by === MANAGER) { openReview(key, { reason, error: 'You asked for this, so a different person must approve it. Nothing was changed.' }); return; }
    const blocked = it.block && it.block();
    if (blocked) { openReview(key, { reason, error: blocked, focus: 'mgr-error' }); return; }
    const ref = { kind: it.kind, id: it.group === 'bank' || it.group === 'cost' ? it.title : it.id };
    const msg = it.approve(reason.trim());
    decide(ref, 'approved', msg + (reason.trim() ? ` Note: “${reason.trim()}”` : ''));
    TN.closeOverlay(); TN.toast(msg, 'success'); TN.refresh();
  });
  TN.act('mgr-return', (el) => {
    const key = el.dataset.id; const it = findItem(key);
    const raw = (document.getElementById('mgr-reason') || {}).value || '';
    if (!it) return;
    const r = reasonOk(raw);
    if (!r) { openReview(key, { reason: raw, reasonError: 'Not returned: say why, in 10 to 500 characters.', focus: 'mgr-reason' }); return; }
    const ref = { kind: it.kind, id: it.group === 'bank' || it.group === 'cost' ? it.title : it.id };
    const msg = it.ret(r);
    decide(ref, 'returned', msg + ` Reason: “${r}”`);
    TN.closeOverlay(); TN.toast(msg); TN.refresh();
  });

  /* ---------- Escalation actions ---------- */
  TN.act('mgr-remind-due', (el) => {
    const i = D.instalments[Number(el.dataset.id)]; const d = TN.deal(i.deal);
    notify([roleOfPerson(d.owner), 'accounts', 'checker'], `Vikram Rathore: please chase ${custOf(i.deal)} today. ${i.label} ${inr(i.amount - i.paid)} on ${i.deal} is ${-TN.fmt.daysFrom(i.due)} days overdue.`, { kind: 'reminder', deal: i.deal });
    TN.toast(`Reminder sent to ${personName(d.owner)} and Accounts.`, 'success');
  });
  TN.act('mgr-remind-acc', (el) => {
    const d = TN.deal(el.dataset.id);
    notify(['accounts', 'checker'], `Vikram Rathore: booking ${d.id} (${custOf(d.id)}) has waited since ${TN.fmt.date(d.submittedAt)} for the Accounts review. Hotel work cannot start.`, { kind: 'reminder', deal: d.id, href: '#/app/accounts' });
    TN.toast('Reminder sent to Accounts.', 'success');
  });
  function personDrawer(id, mode, state = {}) {
    const s = TN.service(id);
    const cands = (DEPT_PEOPLE[s.dept] || []).filter((k) => k !== s.assignee && TN.person(k));
    const body = `<div class="flex flex-col gap-4">${summary([['Task', esc(s.title)], ['Deal', `${dealLink(s.deal)} · ${esc(custOf(s.deal))}`], ['Department', esc(DEPT[s.dept])], ['Now with', s.assignee ? esc(personName(s.assignee)) : 'Nobody']])}`
      + (cands.length
        ? `<form data-act="mgr-move-save" data-id="${esc(id)}" data-mode="${mode}" class="flex flex-col gap-4" novalidate>${select({ id: 'mgr-move-to', label: mode === 'move' ? 'Move to' : 'Give to', hint: mode === 'move' ? 'Moves the task to another colleague. Offers, costs and files stay.' : 'The person gets a notice and the task shows in their queue.', options: cands.map((k) => ({ value: k, label: personName(k) })) })}${textarea({ id: 'mgr-move-reason', label: 'Why are you moving it?', hint: '10 to 500 characters, saved in the task history.', value: state.reason || '', error: state.error })}</form>`
        : `<p class="note info">No other active ${esc(DEPT[s.dept])} colleague can take this task.</p>`) + `</div>`;
    const footer = `<div class="flex flex-wrap gap-2">${cands.length ? btn(mode === 'move' ? 'Reassign task' : 'Give task', { variant: 'primary', act: 'mgr-move-submit', id }) : ''}${btn('Cancel', { variant: 'ghost', attrs: ' data-close' })}</div>`;
    TN.drawer({ title: mode === 'move' ? 'Reassign task' : 'Give the task to someone', description: s.assignee ? `Currently with ${personName(s.assignee)}.` : 'Nobody has taken it yet.', body, footer });
    if (state.error) { const el = document.getElementById('mgr-move-reason'); if (el) el.focus(); }
  }
  TN.act('mgr-assign', (el) => personDrawer(el.dataset.id, 'assign'));
  TN.act('mgr-move', (el) => personDrawer(el.dataset.id, 'move'));
  const doMove = () => {
    const f = document.querySelector('form[data-act="mgr-move-save"]'); if (!f) return;
    const id = f.dataset.id; const mode = f.dataset.mode; const s = TN.service(id);
    const to = f.querySelector('#mgr-move-to').value; const raw = f.querySelector('#mgr-move-reason').value;
    const r = reasonOk(raw);
    if (!r) { personDrawer(id, mode, { reason: raw, error: 'Not moved: say why, in 10 to 500 characters.' }); return; }
    const from = s.assignee;
    s.assignee = to; if (s.taskStatus === 'new' && mode === 'assign') s.taskStatus = 'new';
    D.taskTouched[id] = TN.TODAY;
    notify([roleOfPerson(to)], `Vikram Rathore gave you the task “${s.title}” (${s.deal}). Reason: “${r}”`, { deal: s.deal, href: `#/app/${s.dept}/${id}` });
    D.managerDecisions.unshift({ at: nowStamp(), kind: 'Task', ref: s.title, text: `${mode === 'move' ? 'Moved' : 'Given'} to ${personName(to)}${from ? ' from ' + personName(from) : ''}. Reason: “${r}”`, outcome: 'approved' });
    TN.closeOverlay(); TN.toast(`Task given to ${personName(to)}.`, 'success'); TN.refresh();
  };
  TN.act('mgr-move-save', doMove);
  TN.act('mgr-move-submit', doMove);

  /* ---------------------------------------------------------------
     Reports
     --------------------------------------------------------------- */
  const PERIODS = [
    { value: 'fy', label: 'This financial year (2026-27)', from: '2026-04-01', to: '2027-03-31' },
    { value: 'month', label: 'October 2026', from: '2026-10-01', to: '2026-10-31' },
    { value: 'next', label: 'Next 60 days', from: '2026-10-27', to: '2026-12-26' },
    { value: 'all', label: 'All dates', from: '2000-01-01', to: '2999-12-31' },
  ];
  const BRANCHES = ['Jodhpur', 'Delhi', 'Ahmedabad'];
  const OWNERS = ['sales', 'sales2'];
  const inPeriod = (iso, p) => { const per = PERIODS.find((x) => x.value === p) || PERIODS[0]; return iso && iso >= per.from && iso <= per.to; };
  const BOOKING_WORD = { not_started: 'Not started', quotation_accepted: 'Quotation accepted', in_progress: 'Booking in progress', ready_to_submit: 'Ready to submit', waiting_for_accounts: 'Waiting for Accounts', returned: 'Returned to Sales', being_arranged: 'Being arranged', all_confirmed: 'All confirmed', lost: 'Lost' };
  const TRIP_WORD = { booked: 'Booked', travelled: 'Travelled', closed: 'Closed' };
  const dealCost = (d) => { const ss = TN.servicesOf(d.id); if (!ss.length) return { cost: d.costEstimate, final: false }; const all = ss.every((s) => s.cost != null); return { cost: ss.reduce((t, s) => t + (s.cost != null ? s.cost : s.budget || 0), 0), final: all }; };
  const pct = (a, b) => (b ? (Math.round((a / b) * 1000) / 10).toFixed(1) + '%' : '—');

  /** Horizontal bar list (single series, one hue; values in text ink). */
  const bars = (label, data, fmt) => {
    const max = Math.max(1, ...data.map((d) => d.value));
    return `<figure class="m-0 flex flex-col gap-2.5" aria-label="${esc(label)}">${data.map((d) => `<div class="flex items-center gap-3 text-sm" title="${esc(d.label)}: ${esc(fmt(d.value))}"><span class="w-28 shrink-0 text-copy sm:w-40">${esc(d.label)}</span><span class="h-2 min-w-0 flex-1 rounded-full bg-wash" aria-hidden="true"><span class="block h-2 rounded-full bg-brand-strong" style="width:${d.value ? Math.max(2, (d.value / max) * 100) : 0}%"></span></span><span class="w-24 shrink-0 text-right font-medium text-ink tabular-nums">${esc(fmt(d.value))}</span></div>`).join('')}<figcaption class="sr-only">${esc(label)}. The same numbers are in the table below.</figcaption></figure>`;
  };

  const PAY_WORD = { requested: ['info', '◐', 'Waiting for Accounts'], waiting_manager: ['info', '◐', 'Waiting for the Manager'], approved: ['ok', '✓', 'Approved, to pay'], paid: ['info', '●', 'Paid, to verify'], verified: ['ok', '●', 'Paid and verified'], returned: ['warn', '↩', 'Returned'], on_hold: ['warn', '!', 'On hold'] };
  /** Report definitions. rows(f) returns { cols, rows (display html), raw (export values), stats, chart, total } */
  const REPORTS = [
    {
      id: 'sales-pipeline', title: 'Sales pipeline', icon: 'list-checks', cap: null,
      desc: 'Leads by status and won Deals by booking stage, per salesperson.',
      statuses: [{ value: '', label: 'Every booking stage' }, ...Object.entries(BOOKING_WORD).map(([value, label]) => ({ value, label }))],
      build(f) {
        const money = TN.can('seeSellingPrice');
        const deals = D.deals.filter((d) => inPeriod(d.start, f.period) && (!f.owner || d.owner === f.owner) && (!f.status || d.bookingState === f.status) && (!f.branch || f.branch === 'Jodhpur'));
        const leads = D.leads.filter((l) => (!f.owner || l.owner === f.owner) && (!f.branch || f.branch === 'Jodhpur'));
        const cols = [{ label: 'Deal' }, { label: 'Customer' }, { label: 'Salesperson' }, { label: 'Trip starts' }, { label: 'Booking stage' }, ...(money ? [{ label: 'Selling price', num: true }] : [])];
        const rows = deals.map((d) => [`<p class="m-0 font-semibold text-ink"><a class="${LINK}" href="#/app/deals/${esc(d.id)}">${esc(d.id)}</a></p><p class="m-0 text-sm text-quiet">${esc(d.title)}</p>`, esc(custOf(d.id)), esc(personName(d.owner)), TN.fmt.date(d.start), esc(BOOKING_WORD[d.bookingState]), ...(money ? [inr(d.sellingPrice)] : [])]);
        const raw = deals.map((d) => [d.id, d.title, custOf(d.id), personName(d.owner), d.start, BOOKING_WORD[d.bookingState], ...(money ? [d.sellingPrice ?? ''] : [])]);
        const leadStatus = ['New', 'In progress', 'Follow-up', 'Quotation sent', 'Lost'];
        const booked = deals.filter((d) => d.sellingPrice);
        return {
          cols, rows, raw, rawHead: ['Deal', 'Title', 'Customer', 'Salesperson', 'Trip starts', 'Booking stage', ...(money ? ['Selling price (INR)'] : [])],
          stats: [['Open leads', String(leads.filter((l) => l.status !== 'Lost').length), `${leads.filter((l) => l.status === 'New').length} new`, 'users'], ['Won Deals', String(deals.length), 'in the CRM from Bitrix', 'list-checks'], ['Bookings submitted', String(deals.filter((d) => d.submittedAt).length), `${deals.filter((d) => d.bookingState === 'waiting_for_accounts').length} waiting for Accounts`, 'send'], money ? ['Value booked', inr(booked.reduce((s, d) => s + d.sellingPrice, 0)), `${booked.length} bookings`, 'banknote'] : ['Not started', String(deals.filter((d) => d.bookingState === 'not_started').length), 'won, no booking yet', 'hourglass']],
          chartTitle: 'Leads by status', chart: bars('Leads by status', leadStatus.map((s) => ({ label: s, value: leads.filter((l) => l.status === s).length })), (v) => String(v)),
          total: `${TN.fmt.plural(deals.length, 'Deal')}${money ? ` · ${inr(booked.reduce((s, d) => s + d.sellingPrice, 0))} booked` : ''}`,
        };
      },
    },
    {
      id: 'collections', title: 'Collections and dues', icon: 'receipt', cap: 'seeCustomerPayments',
      desc: 'What each customer has paid and still owes, with overdue instalments first.',
      statuses: [{ value: '', label: 'Every status' }, { value: 'overdue', label: 'Overdue' }, { value: 'due', label: 'Due' }, { value: 'part_paid', label: 'Part paid' }, { value: 'paid', label: 'Paid' }],
      build(f) {
        const list = D.instalments.filter((i) => { const d = TN.deal(i.deal); return inPeriod(i.due, f.period) && (!f.owner || d.owner === f.owner) && (!f.status || i.status === f.status) && (!f.branch || f.branch === 'Jodhpur'); })
          .sort((a, b) => (a.status === 'overdue' ? -1 : 0) - (b.status === 'overdue' ? -1 : 0) || a.due.localeCompare(b.due));
        const word = { paid: ['ok', '●', 'Paid'], due: ['info', '◐', 'Due'], overdue: ['warn', '!', 'Overdue'], part_paid: ['info', '◐', 'Part paid'] };
        const cols = [{ label: 'Deal' }, { label: 'Instalment' }, { label: 'Due' }, { label: 'Status' }, { label: 'Amount', num: true }, { label: 'Paid', num: true }, { label: 'Still due', num: true }];
        const rows = list.map((i) => [`<p class="m-0 font-semibold text-ink"><a class="${LINK}" href="#/app/deals/${esc(i.deal)}">${esc(i.deal)}</a></p><p class="m-0 text-sm text-quiet">${esc(custOf(i.deal))} · ${esc(personName(TN.deal(i.deal).owner))}</p>`, esc(i.label), TN.fmt.date(i.due), pill(...word[i.status], 'Status:'), inr(i.amount), inr(i.paid), inr(i.amount - i.paid)]);
        const raw = list.map((i) => [i.deal, custOf(i.deal), personName(TN.deal(i.deal).owner), i.label, i.due, word[i.status][2], i.amount, i.paid, i.amount - i.paid]);
        const sum = (k) => list.reduce((s, i) => s + k(i), 0);
        const open = list.filter((i) => i.status !== 'paid');
        const age = (lo, hi) => open.filter((i) => { const late = -TN.fmt.daysFrom(i.due); return late >= lo && late <= hi; }).reduce((s, i) => s + i.amount - i.paid, 0);
        return {
          cols, rows, raw, rawHead: ['Deal', 'Customer', 'Salesperson', 'Instalment', 'Due', 'Status', 'Amount (INR)', 'Paid (INR)', 'Still due (INR)'],
          stats: [['Billed to customers', inr(sum((i) => i.amount)), `${TN.fmt.plural(list.length, 'instalment')}`, 'receipt'], ['Collected', inr(sum((i) => i.paid)), 'verified and recorded receipts', 'circle-check'], ['Still due', inr(sum((i) => i.amount - i.paid)), `${open.length} open`, 'clock'], ['Overdue', inr(list.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.amount - i.paid, 0)), `${list.filter((i) => i.status === 'overdue').length} instalments`, 'triangle-alert']],
          chartTitle: 'Still due, by how late', chart: bars('Still due, by how late', [{ label: '8+ days overdue', value: age(8, 9999) }, { label: '1 to 7 days overdue', value: age(1, 7) }, { label: 'Due in the next 7 days', value: age(-7, 0) }, { label: 'Due later', value: age(-9999, -8) }], inr),
          total: `Still due ${inr(sum((i) => i.amount - i.paid))} of ${inr(sum((i) => i.amount))}`,
        };
      },
    },
    {
      id: 'supplier-payables', title: 'Supplier payables', icon: 'banknote', cap: 'seeSupplierCost',
      desc: 'Every supplier payment request, who approves it and whether it is paid and verified.',
      statuses: [{ value: '', label: 'Every status' }, ...['requested', 'waiting_manager', 'approved', 'on_hold', 'paid', 'verified', 'returned'].map((v) => ({ value: v, label: PAY_WORD[v][2] }))],
      build(f) {
        const list = D.supplierPayments.filter((p) => inPeriod(p.dueBy, f.period) && (!f.status || p.status === f.status) && (!f.owner || TN.deal(p.deal).owner === f.owner) && (!f.branch || f.branch === 'Jodhpur'));
        const cols = [{ label: 'Request' }, { label: 'Supplier' }, { label: 'Pay by' }, { label: 'Status' }, { label: 'Approver' }, { label: 'Amount', num: true }];
        const rows = list.map((p) => [`<p class="m-0 font-semibold text-ink">${esc(p.id)}</p><p class="m-0 text-sm text-quiet"><a class="${LINK}" href="#/app/deals/${esc(p.deal)}">${esc(p.deal)}</a> · ${esc(p.part)}</p>`, esc(supName(p.supplier)), TN.fmt.date(p.dueBy), pill(...PAY_WORD[p.status], 'Status:'), countedTotal(p) > LIMIT ? 'Branch Manager' : 'Accounts', inr(p.amount)]);
        const raw = list.map((p) => [p.id, p.deal, supName(p.supplier), p.part, p.dueBy, PAY_WORD[p.status][2], countedTotal(p) > LIMIT ? 'Branch Manager' : 'Accounts', p.bankRef || '', p.amount]);
        const by = (st) => list.filter((p) => st.includes(p.status)).reduce((s, p) => s + p.amount, 0);
        return {
          cols, rows, raw, rawHead: ['Request', 'Deal', 'Supplier', 'Part', 'Pay by', 'Status', 'Approver', 'Bank reference', 'Amount (INR)'],
          stats: [['Waiting for approval', inr(by(['requested', 'waiting_manager'])), `${list.filter((p) => p.status === 'waiting_manager').length} with the Manager`, 'hourglass'], ['Approved, to pay', inr(by(['approved'])), 'Accounts pays and records the bank reference', 'circle-check'], ['On hold', inr(by(['on_hold'])), 'bank details waiting', 'lock'], ['Paid', inr(by(['paid', 'verified'])), `${list.filter((p) => p.status === 'paid').length} not verified yet`, 'banknote']],
          chartTitle: 'Amount by status', chart: bars('Amount by status', ['waiting_manager', 'requested', 'approved', 'on_hold', 'paid', 'verified'].map((s) => ({ label: PAY_WORD[s][2], value: by([s]) })), inr),
          total: `${TN.fmt.plural(list.length, 'request')} · ${inr(list.reduce((s, p) => s + p.amount, 0))}`,
        };
      },
    },
    {
      id: 'booking-profit', title: 'Booking profit', icon: 'hand-coins', cap: 'seeMargin',
      desc: 'Selling price, supplier cost and margin for each booking.',
      statuses: [{ value: '', label: 'Every trip status' }, { value: 'booked', label: 'Booked' }, { value: 'travelled', label: 'Travelled' }, { value: 'closed', label: 'Closed' }, { value: 'none', label: 'Not booked yet' }],
      build(f) {
        const list = D.deals.filter((d) => d.sellingPrice && inPeriod(d.start, f.period) && (!f.owner || d.owner === f.owner) && (!f.branch || f.branch === 'Jodhpur') && (!f.status || (f.status === 'none' ? !d.tripStatus : d.tripStatus === f.status)));
        const cols = [{ label: 'Deal' }, { label: 'Trip status' }, { label: 'Selling price', num: true }, { label: 'Cost', num: true }, { label: 'Margin', num: true }, { label: 'Margin %', num: true }];
        const calc = list.map((d) => { const c = dealCost(d); return { d, cost: c.cost, final: c.final, m: d.sellingPrice - c.cost }; });
        const rows = calc.map(({ d, cost, final, m }) => [`<p class="m-0 font-semibold text-ink"><a class="${LINK}" href="#/app/deals/${esc(d.id)}">${esc(d.id)}</a></p><p class="m-0 text-sm text-quiet">${esc(d.title)} · ${esc(personName(d.owner))}</p>`, d.tripStatus ? esc(TRIP_WORD[d.tripStatus]) : esc(BOOKING_WORD[d.bookingState]), inr(d.sellingPrice), `${inr(cost)}${final ? '' : '<span class="block text-xs font-normal text-quiet">estimate</span>'}`, inr(m), pct(m, d.sellingPrice)]);
        const raw = calc.map(({ d, cost, final, m }) => [d.id, d.title, personName(d.owner), d.tripStatus ? TRIP_WORD[d.tripStatus] : BOOKING_WORD[d.bookingState], d.sellingPrice, cost, final ? 'Final' : 'Estimate', m, pct(m, d.sellingPrice)]);
        const S = calc.reduce((s, x) => s + x.d.sellingPrice, 0); const C = calc.reduce((s, x) => s + x.cost, 0);
        return {
          cols, rows, raw, rawHead: ['Deal', 'Title', 'Salesperson', 'Trip status', 'Selling price (INR)', 'Cost (INR)', 'Cost is', 'Margin (INR)', 'Margin %'],
          stats: [['Selling price', inr(S), TN.fmt.plural(calc.length, 'booking'), 'receipt'], ['Supplier cost', inr(C), `${calc.filter((x) => !x.final).length} still estimates`, 'banknote'], ['Margin', inr(S - C), pct(S - C, S) + ' of selling price', 'hand-coins'], (() => { const low = calc.slice().sort((a, b) => a.m / a.d.sellingPrice - b.m / b.d.sellingPrice)[0]; return ['Lowest margin', low ? pct(low.m, low.d.sellingPrice) : '—', low ? esc(low.d.id) : '', 'triangle-alert']; })()],
          chartTitle: 'Margin per booking', chart: bars('Margin per booking', calc.map((x) => ({ label: x.d.id, value: x.m })), inr),
          total: `Margin ${inr(S - C)} on ${inr(S)} (${pct(S - C, S)})`,
        };
      },
    },
    {
      id: 'purchase-savings', title: 'Purchase savings', icon: 'hotel', cap: 'seeSupplierCost',
      desc: 'The Sales budget for each service minus the cost Purchase, Flight and Visa agreed.',
      statuses: [{ value: '', label: 'Every department' }, { value: 'purchase', label: 'Purchase' }, { value: 'flight', label: 'Flight' }, { value: 'visa', label: 'Visa and passport' }],
      build(f) {
        const list = Object.entries(D.services).map(([id, s]) => ({ id, ...s })).filter((s) => s.cost != null && s.budget && inPeriod(s.start, f.period) && (!f.status || s.dept === f.status) && (!f.owner || s.assignee === f.owner) && (!f.branch || f.branch === 'Jodhpur'));
        const cols = [{ label: 'Service' }, { label: 'Department' }, { label: 'Done by' }, { label: 'Budget', num: true }, { label: 'Agreed cost', num: true }, { label: 'Saved', num: true }];
        const rows = list.map((s) => [`<p class="m-0 font-semibold text-ink">${esc(s.title)}</p><p class="m-0 text-sm text-quiet"><a class="${LINK}" href="#/app/deals/${esc(s.deal)}">${esc(s.deal)}</a></p>`, esc(DEPT[s.dept]), esc(personName(s.assignee)), inr(s.budget), inr(s.cost), `${inr(s.budget - s.cost)}<span class="block text-xs font-normal text-quiet">${pct(s.budget - s.cost, s.budget)}</span>`]);
        const raw = list.map((s) => [s.deal, s.title, DEPT[s.dept], personName(s.assignee), s.budget, s.cost, s.budget - s.cost, pct(s.budget - s.cost, s.budget)]);
        const B = list.reduce((t, s) => t + s.budget, 0); const C = list.reduce((t, s) => t + s.cost, 0);
        const dep = (k) => list.filter((s) => s.dept === k).reduce((t, s) => t + s.budget - s.cost, 0);
        return {
          cols, rows, raw, rawHead: ['Deal', 'Service', 'Department', 'Done by', 'Budget (INR)', 'Agreed cost (INR)', 'Saved (INR)', 'Saved %'],
          stats: [['Budget', inr(B), TN.fmt.plural(list.length, 'service'), 'list-checks'], ['Agreed cost', inr(C), 'what suppliers charge', 'banknote'], ['Saved', inr(B - C), pct(B - C, B) + ' of budget', 'hand-coins']],
          chartTitle: 'Saved by department', chart: bars('Saved by department', ['purchase', 'flight', 'visa'].map((k) => ({ label: DEPT[k], value: dep(k) })), inr),
          total: `Saved ${inr(B - C)} on a budget of ${inr(B)}`, owners: [...new Set(Object.values(D.services).map((s) => s.assignee).filter(Boolean))],
        };
      },
    },
    {
      id: 'bills-documents', title: 'Bills and documents', icon: 'file-text', cap: null,
      desc: 'Customer Invoices, Advance Invoices and vouchers, supplier invoices, and supplier invoices still missing after the trip.',
      statuses: [{ value: '', label: 'Every kind' }, { value: 'customer', label: 'Customer documents' }, { value: 'supplier', label: 'Supplier invoices' }, { value: 'missing', label: 'Missing supplier invoices' }],
      build(f) {
        const custMoney = TN.can('seeSellingPrice'); const supMoney = TN.can('seeSupplierCost');
        const DOC = { draft: ['neutral', '–', 'Draft'], waiting_accounts: ['info', '◐', 'Waiting for Accounts'], approved: ['ok', '✓', 'Approved'], sent: ['ok', '●', 'Sent by staff'] };
        const SI = { uploaded: ['info', '◐', 'To check'], accepted: ['ok', '✓', 'Accepted'], returned: ['warn', '↩', 'Returned'] };
        let rows = []; let raw = [];
        const keep = (deal, date) => { const d = TN.deal(deal); return d && inPeriod(date, f.period) && (!f.owner || d.owner === f.owner) && (!f.branch || f.branch === 'Jodhpur'); };
        if (!f.status || f.status === 'customer') D.documents.filter((x) => keep(x.deal, x.date)).forEach((x) => { rows.push([`<p class="m-0 font-semibold text-ink">${esc(x.id)}</p><p class="m-0 text-sm text-quiet">${esc(x.kind)}</p>`, `<a class="${LINK}" href="#/app/deals/${esc(x.deal)}">${esc(x.deal)}</a>`, esc(custOf(x.deal)), TN.fmt.date(x.date), pill(...DOC[x.status], 'Status:'), x.amount != null && custMoney ? inr(x.amount) : '—']); raw.push([x.kind, x.id, x.deal, custOf(x.deal), x.date, DOC[x.status][2], x.amount != null && custMoney ? x.amount : '']); });
        if (!f.status || f.status === 'supplier') D.supplierInvoices.filter((x) => keep(x.deal, x.date)).forEach((x) => { rows.push([`<p class="m-0 font-semibold text-ink">${esc(x.number)}</p><p class="m-0 text-sm text-quiet">Supplier ${esc(x.kind.toLowerCase())}</p>`, `<a class="${LINK}" href="#/app/deals/${esc(x.deal)}">${esc(x.deal)}</a>`, esc(supName(x.supplier)), TN.fmt.date(x.date), pill(...SI[x.status], 'Status:'), supMoney ? inr(x.amount) : '—']); raw.push(['Supplier ' + x.kind.toLowerCase(), x.number, x.deal, supName(x.supplier), x.date, SI[x.status][2], supMoney ? x.amount : '']); });
        const missing = [];
        D.deals.filter((d) => d.tripStatus === 'travelled' || (d.end && d.end < TN.TODAY && d.tripStatus)).forEach((d) => TN.servicesOf(d.id).filter((s) => s.dept === 'purchase' && !D.supplierInvoices.some((x) => x.service === s.id)).forEach((s) => missing.push({ d, s })));
        if (!f.status || f.status === 'missing') missing.filter(({ d }) => keep(d.id, d.end)).forEach(({ d, s }) => { rows.push([`<p class="m-0 font-semibold text-ink">Not received</p><p class="m-0 text-sm text-quiet">${esc(s.title)}</p>`, `<a class="${LINK}" href="#/app/deals/${esc(d.id)}">${esc(d.id)}</a>`, esc(supName(s.supplier)), `Trip ended ${TN.fmt.date(d.end)}`, pill('warn', '!', 'Invoice missing', 'Status:'), '—']); raw.push(['Missing supplier invoice', '', d.id, supName(s.supplier), d.end, 'Invoice missing', '']); });
        return {
          cols: [{ label: 'Document' }, { label: 'Deal' }, { label: 'Customer or supplier' }, { label: 'Date' }, { label: 'Status' }, { label: 'Amount', num: true }], rows, raw,
          rawHead: ['Kind', 'Number', 'Deal', 'Customer or supplier', 'Date', 'Status', 'Amount (INR)'],
          stats: [['Customer documents', String(D.documents.length), `${D.documents.filter((x) => x.status === 'waiting_accounts').length} waiting for Accounts`, 'file-text'], ['Supplier invoices', String(D.supplierInvoices.length), `${D.supplierInvoices.filter((x) => x.status === 'uploaded').length} to check`, 'file-check-corner'], ['Missing after the trip', String(missing.length), 'Purchase gets a reminder', 'triangle-alert']],
          chartTitle: null, chart: '', total: `${TN.fmt.plural(rows.length, 'row')}`,
          footNote: custMoney ? '' : 'Customer document amounts are hidden for your role.',
        };
      },
    },
  ];

  const capWord = { seeCustomerPayments: 'customer receipts and dues', seeSupplierCost: 'supplier costs', seeMargin: 'selling prices and margin' };
  const reportRoles = ['manager', 'admin', 'accounts', 'checker'];

  TN.page('/app/reports', {
    nav: '/app/reports', roles: reportRoles, title: 'Reports',
    render() {
      const cards = REPORTS.map((r) => {
        const locked = r.cap && !TN.can(r.cap);
        return `<div class="rounded-card border border-line bg-card px-4.5 py-4 font-sans shadow-card flex flex-col gap-2" data-slot="card"><div class="flex items-center justify-between gap-2"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink">${esc(r.title)}</h2><span class="grid size-7.5 place-items-center rounded-control bg-brand-tint text-brand-strong">${ic(r.icon, 'size-4')}</span></div><p class="m-0 text-sm text-quiet">${esc(r.desc)}</p>${locked ? `<p class="m-0 flex items-start gap-1.5 text-sm text-quiet">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}<span>Shows ${capWord[r.cap]}, which your role does not see.</span></p>` : `<p class="m-0 mt-1">${link('#/app/reports/' + r.id, `Open report<span class="visually-hidden">: ${esc(r.title)}</span>`)}</p>`}</div>`;
      }).join('');
      return pageHeader({ title: 'Reports', desc: 'Filter by period, branch, owner and status, and export to Excel. Each report shows only what your role may see.' })
        + `<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">${cards}</div>`;
    },
  });

  const filtersOf = (q) => ({ period: q.period || 'fy', branch: q.branch || '', owner: q.owner || '', status: q.status || '' });
  TN.page('/app/reports/:id', {
    nav: '/app/reports', roles: reportRoles, title: (p) => (REPORTS.find((r) => r.id === p.id) || { title: 'Report' }).title,
    render(p, q) {
      const r = REPORTS.find((x) => x.id === p.id);
      if (!r) return pageHeader({ eyebrow: 'Reports', title: 'Report not found' }) + `<p class="m-0">${link('#/app/reports', 'Back to reports')}</p>`;
      const back = `<p class="m-0 mb-3 text-sm">${link('#/app/reports', 'Reports')}</p>`;
      if (r.cap && !TN.can(r.cap)) {
        return back + pageHeader({ title: r.title, desc: esc(r.desc) }) + notice('restricted', `<p>This report shows ${capWord[r.cap]}. Your role does not see them, so the report is not shown.</p><p>If you need it, ask the Super Admin for extra access with a business reason.</p>`, { title: 'Not shown for your role' });
      }
      const f = filtersOf(q);
      const out = r.build(f);
      const owners = r.id === 'purchase-savings' ? (out.owners || []) : OWNERS;
      const filterBar = `<form data-act="rep-filter" data-id="${r.id}" class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Report filters" novalidate>`
        + select({ id: 'rep-period', name: 'period', label: 'Period', value: f.period, change: 'rep-filter-change', options: PERIODS })
        + select({ id: 'rep-branch', name: 'branch', label: 'Branch', value: f.branch, change: 'rep-filter-change', options: [{ value: '', label: 'Every branch' }, ...BRANCHES.map((b) => ({ value: b, label: b }))] })
        + select({ id: 'rep-owner', name: 'owner', label: r.id === 'purchase-savings' ? 'Done by' : 'Salesperson', value: f.owner, change: 'rep-filter-change', options: [{ value: '', label: 'Everyone' }, ...owners.map((o) => ({ value: o, label: personName(o) }))] })
        + select({ id: 'rep-status', name: 'status', label: r.id === 'purchase-savings' ? 'Department' : r.id === 'bills-documents' ? 'Kind' : 'Status', value: f.status, change: 'rep-filter-change', options: r.statuses })
        + `</form>`;
      const stats = `<div class="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">${out.stats.map((s) => statCard(s[0], esc(s[1]), s[2], s[3])).join('')}</div>`;
      const chart = out.chart && out.rows.length ? card({ title: out.chartTitle, body: out.chart, extra: 'mb-5' }) : '';
      const tbl = out.rows.length
        ? card({ title: 'Rows', aside: `<span class="inline-flex min-w-6 items-center justify-center rounded-full bg-wash px-2 font-sans text-xs leading-5 font-medium text-quiet tabular-nums">${out.rows.length}</span>`, bodyClass: '', body: table({ label: r.title, caption: r.title, cols: out.cols, rows: out.rows }), footer: `<span>${esc(out.total)}</span>${out.footNote ? `<span>${esc(out.footNote)}</span>` : ''}` })
        : card({ title: 'Rows', body: '<p class="m-0 text-quiet">No rows for these filters. Change the period, branch or status.</p>' });
      return back + pageHeader({ title: r.title, desc: esc(r.desc), actions: btn('Export to Excel', { variant: 'primary', icon: 'download', act: 'rep-export', id: r.id }) })
        + filterBar + stats + chart + tbl
        + `<p class="m-0 mt-3 text-sm text-quiet">Export downloads a CSV file that opens in Excel, with the same rows and columns as on screen.</p>`;
    },
  });
  TN.act('rep-filter', () => {});
  TN.act('rep-filter-change', (el) => {
    const f = el.closest('form'); const fd = new FormData(f);
    const qs = new URLSearchParams(); for (const [k, v] of fd.entries()) if (v && !(k === 'period' && v === 'fy')) qs.set(k, v);
    TN._keepScroll = true;
    location.hash = `#/app/reports/${f.dataset.id}${qs.toString() ? '?' + qs : ''}`;
    setTimeout(() => { const again = document.getElementById(el.id); if (again) again.focus(); }, 60);
  });
  const csvCell = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  TN.act('rep-export', (el) => {
    const r = REPORTS.find((x) => x.id === el.dataset.id);
    if (r.cap && !TN.can(r.cap)) { TN.toast('Not exported: this report is not shown for your role.'); return; }
    const out = r.build(filtersOf(TN.query()));
    const lines = [[`${r.title} · Holiday Chacha Pvt LTD · exported ${TN.fmt.date(TN.TODAY)} by ${TN.me().name}`], out.rawHead, ...out.raw].map((row) => row.map(csvCell).join(','));
    const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); const name = `${r.id}_${TN.TODAY}.csv`;
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    TN.toast(`Downloaded ${name} (${TN.fmt.plural(out.raw.length, 'row')}).`, 'success');
  });

  /* ---------------------------------------------------------------
     Home rows
     --------------------------------------------------------------- */
  TN.homeRow({ roles: ['manager'], label: 'Approvals waiting for you', count: () => approvalItems().filter((i) => i.by !== MANAGER).length, href: '#/app/approvals', section: 'What needs you' });
  TN.homeRow({ roles: ['manager'], label: 'Escalations: overdue and stuck work', count: escCount, href: '#/app/approvals?tab=escalations', section: 'What needs you' });
})();
