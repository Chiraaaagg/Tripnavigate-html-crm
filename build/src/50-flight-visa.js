/* =====================================================================
   Flight tasks and the Visa and passport desk (Agent E).
   Pages: #/app/flight, #/app/flight/:taskId, #/app/visa, #/app/visa/:taskId
   Markup copied from the live captures b4-flight-*, b11-flight-task-*,
   b4-visa-*, b11-visa-* (main f354d5b). Pending parts (DEC-59 "mark flight
   done", payment request above ₹50,000, ticket and visa result notices,
   invoice lines) use only existing live patterns: Card, Notice, StatusBadge,
   ProgressChecklist (Book now "Before you submit"), Table, Dialog, Timeline.
   Money fence: Flight and Visa see their own supplier costs and the budget,
   never the selling price, margin, customer receipts or payment proof.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;

  /* ------------------------------------------------------------------
     Class strings (exact, from the captures)
     ------------------------------------------------------------------ */
  const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const BTN = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 ' + FOCUS;
  const BTNW = BTN.replace('gap-2 rounded-control', 'gap-2 whitespace-nowrap rounded-control');
  const V = {
    primary: 'border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white',
    secondary: 'border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink',
    ghost: 'border-transparent bg-transparent text-copy shadow-none hover:bg-wash hover:text-ink',
    danger: 'border-status-danger bg-status-danger text-white shadow-button hover:border-status-danger-strong hover:bg-status-danger-strong hover:text-white',
  };
  const B = {
    takeLg: `${BTNW} ${V.primary} h-11 px-4 text-md min-h-11`,
    linkLg: `${BTNW} ${V.primary} h-11 px-4 text-md`,
    primary: `${BTN} ${V.primary} px-4 text-md h-auto min-h-11 py-2 whitespace-normal`,
    secondary: `${BTN} ${V.secondary} px-4 text-md h-auto min-h-11 py-2 whitespace-normal`,
    danger: `${BTN} ${V.danger} px-4 text-md h-auto min-h-11 py-2 whitespace-normal`,
    ghostWrap: `${BTN} ${V.ghost} px-4 text-md h-auto min-h-11 py-2 whitespace-normal`,
    secondaryMd: `${BTNW} ${V.secondary} h-10 px-3.5 text-base`,
    primaryMd: `${BTNW} ${V.primary} h-10 px-3.5 text-base`,
    ghostMd: `${BTNW} ${V.ghost} h-10 px-3.5 text-base`,
    ghostSm: `${BTNW} ${V.ghost} h-8 px-2.5 text-sm`,
    openSm: `${BTNW} ${V.secondary} h-8 px-2.5 text-sm min-h-11`,
  };
  const C = {
    page: 'font-sans text-base text-copy',
    back: 'inline-flex items-center gap-1 rounded-chip text-sm font-medium text-brand-strong no-underline hover:text-brand-deep hover:underline ' + FOCUS,
    headerTask: 'flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between mb-3',
    headerList: 'mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between',
    eyebrow: 'm-0 mb-1 text-sm font-medium text-quiet',
    h1: 'm-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl',
    headDesc: 'm-0 mt-1.5 text-base text-quiet',
    statusRow: 'mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet',
    actions: 'flex min-w-min flex-wrap items-center gap-2 max-sm:[&amp;&gt;*]:flex-1',
    card: 'rounded-card border border-line bg-card font-sans text-base text-copy shadow-card',
    cardHead: 'flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5',
    cardTitle: 'm-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink',
    body: 'px-4.5 py-4',
    bodyCol4: 'px-4.5 py-4 flex flex-col gap-4',
    bodyCol3: 'px-4.5 py-4 flex flex-col gap-3',
    small: 'm-0 text-sm text-quiet',
    dl: 'm-0 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-[minmax(7rem,10rem)_1fr]',
    dlFacts: 'm-0 grid grid-cols-1 gap-x-4 gap-y-1.5 font-sans text-base sm:grid-cols-[minmax(7rem,10rem)_1fr]',
    dt: 'text-sm font-medium text-quiet',
    ddFacts: 'm-0 min-w-0 wrap-break-word whitespace-pre-wrap text-ink',
    dd: 'm-0 text-ink',
    ddNum: 'm-0 text-ink tabular-nums',
    ddMoney: 'm-0 whitespace-nowrap text-ink tabular-nums',
    tabsNav: 'font-sans mb-5', tabsNavList: 'font-sans mb-4',
    tabsUl: 'm-0 flex list-none flex-wrap gap-1 border-b border-line p-0 sm:flex-nowrap sm:overflow-x-auto',
    tab: '-mb-px inline-flex min-h-10 items-center gap-2 rounded-t-control border-b-2 border-transparent px-3 py-2 text-base font-medium text-quiet no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:border-brand-strong aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:-outline-offset-3',
    tabCount: 'rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums',
    label: 'block font-sans text-base font-semibold text-ink',
    hint: 'm-0 font-sans text-sm text-quiet',
    input: 'block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-lg text-ink sm:text-base m-0 appearance-none shadow-none transition-[border-color] duration-(--ui-duration-quick) motion-reduce:transition-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-wash disabled:text-quiet aria-invalid:border-2 aria-invalid:border-status-danger aria-invalid:focus:border-status-danger aria-invalid:focus:outline-status-danger',
    file: 'block w-full rounded-control border border-control bg-card px-3 py-2 font-sans text-base text-ink file:mr-3 file:rounded-control file:border-0 file:bg-wash file:px-3 file:py-1.5 file:font-semibold file:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-strong',
    fieldErr: 'm-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger',
    errSummary: 'flex gap-2.5 rounded-control border-2 border-status-danger-line bg-status-danger-tint px-3.5 py-3 font-sans text-base text-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-danger',
    details: 'rounded-control border border-line bg-canvas',
    summary: 'flex min-h-11 cursor-pointer items-center px-3 font-medium text-brand-strong',
    summaryF: 'flex min-h-11 cursor-pointer items-center px-3 font-medium text-brand-strong ' + FOCUS,
    detailsBody: 'border-t border-line bg-card px-3 py-3',
    costItem: 'flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3',
    link: 'rounded-chip font-medium wrap-anywhere text-brand-strong underline underline-offset-4',
    linkF: 'rounded-chip font-medium wrap-anywhere text-brand-strong underline underline-offset-4 hover:text-brand-deep ' + FOCUS,
    linkPlain: 'rounded-chip font-medium wrap-anywhere text-brand-strong underline underline-offset-4 ' + FOCUS,
    timeline: 'm-0 flex list-none flex-col p-0 font-sans',
    tlItem: 'relative m-0 flex gap-3 pb-4 last:pb-0',
    tlLine: 'absolute top-6 bottom-0 left-2.25 w-px bg-line-strong',
    caption: 'px-4.5 text-left text-sm caption-top border-b border-line py-3 font-medium text-copy max-sm:block',
    th: 'border-b border-line bg-canvas px-4.5 py-2.5 text-left align-middle text-xs font-semibold tracking-[0.04em] text-quiet uppercase',
    td: 'border-0 bg-transparent px-4.5 py-3 text-left group-data-[stack=true]/table:max-sm:flex group-data-[stack=true]/table:max-sm:justify-between group-data-[stack=true]/table:max-sm:gap-3 group-data-[stack=true]/table:max-sm:px-0 group-data-[stack=true]/table:max-sm:py-1 group-data-[stack=true]/table:max-sm:text-right group-data-[stack=true]/table:max-sm:before:text-left group-data-[stack=true]/table:max-sm:before:text-sm group-data-[stack=true]/table:max-sm:before:font-normal group-data-[stack=true]/table:max-sm:before:text-quiet group-data-[stack=true]/table:max-sm:before:content-[attr(data-label)] group-data-[stack=true]/table:max-sm:first:block group-data-[stack=true]/table:max-sm:first:pb-2 group-data-[stack=true]/table:max-sm:first:text-left group-data-[stack=true]/table:max-sm:first:before:content-none',
    trHead: 'border-b border-line last:border-b-0 group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 hover:bg-transparent',
    trBody: 'border-b border-line last:border-b-0 hover:bg-canvas group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 align-top',
    tableWrap: 'group/table relative w-full overflow-x-auto outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none rounded-card',
    table: 'w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block',
  };
  const TONE = {
    success: 'border-status-success-line bg-status-success-tint text-status-success',
    warning: 'border-status-warning-line bg-status-warning-tint text-status-warning',
    danger: 'border-status-danger-line bg-status-danger-tint text-status-danger',
    info: 'border-status-info-line bg-status-info-tint text-status-info',
    neutral: 'border-status-neutral-line bg-status-neutral-tint text-status-neutral',
    brand: 'border-brand-line bg-brand-tint text-brand-strong',
  };
  const TONE_ICON = { success: 'circle-check', warning: 'triangle-alert', danger: 'circle-x', info: 'info', neutral: 'clock', brand: 'send' };

  /* ------------------------------------------------------------------
     Icons (lucide, paths copied from the captures)
     ------------------------------------------------------------------ */
  const ICONS = {
    info: ['info', '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>'],
    'circle-x': ['circle-x lucide-x-circle', '<circle cx="12" cy="12" r="10"></circle><path d="m15 9-6 6"></path><path d="m9 9 6 6"></path>'],
    'chevron-left': ['chevron-left', '<path d="m15 18-6-6 6-6"></path>'],
    'chevron-down': ['chevron-down', '<path d="m6 9 6 6 6-6"></path>'],
    hourglass: ['hourglass', '<path d="M5 22h14"></path><path d="M5 2h14"></path><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"></path><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"></path>'],
    lock: ['lock', '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>'],
    plane: ['plane', '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"></path>'],
    plus: ['plus', '<path d="M5 12h14"></path><path d="M12 5v14"></path>'],
    clock: ['clock', '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>'],
    'circle-alert': ['circle-alert lucide-alert-circle', '<circle cx="12" cy="12" r="10"></circle><line x1="12" x2="12" y1="8" y2="12"></line><line x1="12" x2="12.01" y1="16" y2="16"></line>'],
    stamp: ['stamp', '<path d="M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"></path><path d="M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z"></path><path d="M5 22h14"></path>'],
    'circle-check': ['circle-check lucide-check-circle-2', '<circle cx="12" cy="12" r="10"></circle><path d="m16 9-5.5 5.5L8 12"></path>'],
    'circle-dot': ['circle-dot', '<circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="12" r="10"></circle>'],
    circle: ['circle', '<circle cx="12" cy="12" r="10"></circle>'],
    send: ['send', '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path>'],
    'triangle-alert': ['triangle-alert lucide-alert-triangle', '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>'],
    'shield-alert': ['shield-alert', '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path><path d="M12 8v4"></path><path d="M12 16h.01"></path>'],
    'pencil-line': ['pencil-line', '<path d="M13 21h8"></path><path d="m15 5 4 4"></path><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>'],
    'file-check': ['file-check-corner lucide-file-check-2', '<path d="M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="m14 20 2 2 4-4"></path>'],
    'check-check': ['check-check', '<path d="M18 6 7 17l-5-5"></path><path d="m22 10-7.5 7.5L13 16"></path>'],
    'folder-open': ['folder-open', '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"></path>'],
    'file-text': ['file-text', '<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"></path><path d="M14 2v5a1 1 0 0 0 1 1h5"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path>'],
    history: ['rotate-ccw-clock lucide-history', '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>'],
  };
  const ic = (name, cls) => {
    const [c, p] = ICONS[name] || ICONS.info;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${c}${cls ? ' ' + cls : ''}" aria-hidden="true">${p}</svg>`;
  };

  /* ------------------------------------------------------------------
     Small markup helpers (live components)
     ------------------------------------------------------------------ */
  const inr = (n) => (n == null || n === '' ? '—' : TN.fmt.inr(n) + '.00'); // live shows paise (".00")
  const badge = (tone, text, { wrap = false, icon, sr } = {}) => {
    const base = wrap
      ? `inline-flex max-w-full gap-1.5 border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold [&amp;_svg]:size-3.5 [&amp;_svg]:shrink-0 ${TONE[tone]} items-start rounded-control whitespace-normal [&amp;_svg]:mt-0.75`
      : `inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap [&amp;_svg]:size-3.5 [&amp;_svg]:shrink-0 ${TONE[tone]}`;
    return `<span class="${base}" data-slot="status-badge" data-tone="${tone}">${ic(icon || TONE_ICON[tone])}<span class="${wrap ? 'min-w-0 wrap-anywhere' : 'truncate'}">${sr ? `<span class="sr-only">${sr}</span>` : ''}${text}</span></span>`;
  };
  const NOTICE = {
    info: ['border-status-info-line bg-status-info-tint', 'info', 'text-status-info'],
    warning: ['border-status-warning-line bg-status-warning-tint', 'triangle-alert', 'text-status-warning'],
    danger: ['border-status-danger-line bg-status-danger-tint', 'circle-x', 'text-status-danger'],
    success: ['border-status-success-line bg-status-success-tint', 'circle-check', 'text-status-success'],
    restricted: ['border-brand-line bg-brand-tint', 'shield-alert', 'text-brand-strong'],
    locked: ['border-line bg-wash', 'lock', 'text-quiet'],
  };
  const notice = (tone, html, { title, role = 'note', icon, cls } = {}) => {
    const [box, i, ic2] = NOTICE[tone];
    return `<div role="${role}" class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy ${box}${cls ? ' ' + cls : ''}" data-slot="notice" data-tone="${tone}">${ic(icon || i, 'mt-0.5 size-4 shrink-0 ' + ic2)}<div class="min-w-0 flex-1">${title ? `<p class="m-0 font-semibold text-ink">${title}</p>` : ''}${html ? `<div class="flex flex-col gap-1.5 [&amp;_p]:m-0${title ? ' mt-0.75' : ''}">${html}</div>` : ''}</div></div>`;
  };
  const errorSummary = (title, desc = 'What you typed is still here.', id) =>
    `<div role="alert" tabindex="-1"${id ? ` id="${id}"` : ''} class="${C.errSummary}" data-slot="error-summary">${ic('circle-alert', 'mt-0.5 size-4.5 shrink-0 text-status-danger')}<div class="min-w-0 flex-1"><p class="m-0 font-semibold text-ink">${title}</p>${desc ? `<p class="m-0 mt-0.75">${desc}</p>` : ''}</div></div>`;
  const fieldError = (id, text) => `<p class="${C.fieldErr}" id="${id}-error">${ic('circle-alert', 'mt-0.5 size-3.5 shrink-0')}<span>${text}</span></p>`;
  const card = ({ id, title, desc, extra = '', body, bodyCls = C.body, cls = '' }) =>
    `<div class="${C.card}${cls ? ' ' + cls : ''}" data-slot="card"><section aria-labelledby="${id}"><div class="${C.cardHead}">${desc ? `<div class="min-w-0"><h2 class="${C.cardTitle}" id="${id}">${title}</h2><p class="${C.small}">${desc}</p></div>` : `<h2 class="${C.cardTitle}" id="${id}">${title}</h2>`}${extra}</div>${bodyCls === null ? body : `<div class="${bodyCls}">${body}</div>`}</section></div>`;
  const select = (id, name, options, value, attrs = '') =>
    `<div class="relative" data-slot="select"><select class="${C.input} cursor-pointer pr-9" id="${id}" name="${name}"${attrs}>${options.map(([v, l]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>${ic('chevron-down', 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-quiet')}</div>`;
  const field = (id, label, control, { optional, hint, error, cls } = {}) =>
    `<div class="flex flex-col gap-1.5${cls ? ' ' + cls : ''}" data-slot="field"><label class="${C.label}" for="${id}">${label}${optional ? '<span class="font-normal text-quiet"> (optional)</span>' : ''}</label>${control}${hint ? `<p class="${C.hint}" id="${id}-hint">${hint}</p>` : ''}${error ? fieldError(id, error) : ''}</div>`;
  const textInput = (id, name, value, { type = 'text', max, invalid, describe } = {}) =>
    `<input type="${type}" class="${C.input}" data-slot="input" id="${id}" autocomplete="off"${max ? ` maxlength="${max}"` : ''} name="${name}" value="${esc(value || '')}"${invalid ? ` aria-invalid="true" aria-describedby="${id}-error"` : describe ? ` aria-describedby="${describe}"` : ''}>`;
  const tabsNav = (label, items, cls) =>
    `<nav aria-label="${label}" class="${cls}" data-slot="tabs"><ul class="${C.tabsUl}">${items.map((t) => `<li class="m-0 shrink-0"><a${t.current ? ' aria-current="page"' : ''} class="${C.tab}" href="${t.href}">${t.label}${t.count != null ? `<span class="sr-only">:</span><span class="${C.tabCount}">${t.count}</span>` : ''}</a></li>`).join('')}</ul></nav>`;
  const timeline = (label, items, showState) =>
    `<ol aria-label="${label}" class="${C.timeline}" data-slot="timeline">${items.map((it, i) => {
      const last = i === items.length - 1;
      const icon = it.state === 'current' ? ic('circle-dot', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-brand-strong') : it.state === 'upcoming' ? ic('circle', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-faint') : ic('circle-check', 'relative mt-0.5 size-4.5 shrink-0 bg-card text-status-success');
      const pre = showState ? `<span class="sr-only">${it.state === 'current' ? 'Now: ' : it.state === 'upcoming' ? 'Later: ' : 'Done: '}</span>` : '';
      return `<li class="${C.tlItem}"${it.state === 'current' ? ' aria-current="step"' : ''}>${last ? '' : `<span aria-hidden="true" class="${C.tlLine}"></span>`}${icon}<div class="min-w-0 flex-1"><p class="m-0 text-base text-ink${it.state === 'current' ? ' font-semibold' : ''}">${pre}${it.title}</p>${it.meta ? `<p class="${C.small}">${it.meta}</p>` : ''}${it.detail ? `<div class="mt-0.75 text-sm text-copy"><span class="wrap-break-word">${it.detail}</span></div>` : ''}</div></li>`;
    }).join('')}</ol>`;
  const table = ({ label, caption, heads, rows }) =>
    `<div class="${C.tableWrap}" data-stack="true" role="region" aria-label="${label}" tabindex="0"><table role="table" class="${C.table}"><caption class="${C.caption}">${caption}</caption><thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${C.trHead}">${heads.map((h) => `<th scope="col" role="columnheader" class="${C.th}">${h}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${rows.map((r) => `<tr role="row" class="${C.trBody}">${r.map((c, i) => `<td role="cell" data-label="${heads[i]}" class="${C.td} align-top${c.cls ? ' ' + c.cls : ''}">${c.html}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const emptyState = (icon, title, desc) =>
    `<div class="flex flex-col items-center px-6 py-10 text-center font-sans" data-slot="empty-state"><span aria-hidden="true" class="mb-3 grid size-11 place-items-center rounded-card bg-brand-tint text-brand">${ic(icon, 'size-5')}</span><h2 class="m-0 text-lg leading-6 font-semibold text-ink">${title}</h2><p class="m-0 mt-1.5 max-w-[42ch] text-base text-quiet">${desc}</p></div>`;
  const internalLine = (text) => `<p class="m-0 flex gap-2 text-sm text-quiet" data-slot="task-internal">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}<span>${text}</span></p>`;
  const fileUpload = (id, label, hidden, kinds) =>
    `<form novalidate aria-label="${esc(label)}" class="flex flex-col gap-3" data-act="fv-upload">${UI.err[id] ? errorSummary(UI.err[id], '') : ''}${hidden}<div class="grid gap-3 sm:grid-cols-2">${kinds.length > 1 ? field(`${id}-kind`, 'What is this file?', select(`${id}-kind`, 'kind', kinds, kinds[0][0])) : `<input type="hidden" name="kind" value="${kinds[0][0]}">`}<div class="flex flex-col gap-1.5" data-slot="field"><label class="${C.label}" for="${id}-file">File</label><input id="${id}-file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-describedby="${id}-file-hint" class="${C.file}" name="file"><p class="${C.hint}" id="${id}-file-hint">PDF, JPG, PNG or WebP, up to 4 MB. Stored privately.</p></div></div><input type="hidden" name="formKey" value="${id}"><div><button type="submit" class="${B.secondary}" data-slot="button">Upload file</button></div></form>`;

  /* ------------------------------------------------------------------
     Data: extra fields on the shared services + own collections
     ------------------------------------------------------------------ */
  const S = TN.DATA.services;
  const NOW = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const uid = (p) => p + Math.random().toString(36).slice(2, 8);

  /* Flight facts (Book now "Flight" block) and traveller names. */
  Object.assign(S['s-412-f'], {
    segments: [{ from: 'JDH', to: 'GOX', date: '2026-11-14', flight: 'IndiGo 6E 6142', time: '10:35' }, { from: 'GOX', to: 'JDH', date: '2026-11-18', flight: 'IndiGo 6E 6143', time: '16:20' }],
    preferredTime: 'Morning departure', cabin: 'Economy', notes: 'Child needs a seat next to a parent.',
    passengers: [{ name: 'Rohan Agarwal', type: 'adult' }, { name: 'Anita Agarwal', type: 'adult' }, { name: 'Vihaan Agarwal', type: 'child', age: 7 }],
    versionNo: 1, savedAt: '2026-10-19 12:10', createdAt: '2026-10-19 16:40', takenAt: '2026-10-20 10:05',
  });
  Object.assign(S['s-455-f'], {
    segments: [{ from: 'JDH', to: 'DEL', date: '2026-12-02' }, { from: 'DEL', to: 'COK', date: '2026-12-02' }, { from: 'COK', to: 'DEL', date: '2026-12-08' }, { from: 'DEL', to: 'JDH', date: '2026-12-08' }],
    preferredTime: 'Reach Kochi before 4 pm', cabin: 'Economy', notes: 'Honeymoon couple. Seats together if possible.',
    passengers: [{ name: 'Meenal Khatri', type: 'adult' }, { name: 'Arjun Khatri', type: 'adult' }],
    versionNo: 1, savedAt: '2026-10-26 11:30', createdAt: '2026-10-26 11:32',
  });
  Object.assign(S['s-390-f'], {
    segments: [{ from: 'AMD', to: 'DXB', date: '2026-11-20', flight: 'Emirates EK 539', time: '04:25' }, { from: 'DXB', to: 'AMD', date: '2026-11-25', flight: 'Emirates EK 538', time: '22:05' }],
    preferredTime: 'Any', cabin: 'Economy', notes: 'Family drives to Ahmedabad. 30 kg baggage each.',
    passengers: [{ name: 'Suresh Bhandari', type: 'adult' }, { name: 'Anita Bhandari', type: 'adult' }, { name: 'Kabir Bhandari', type: 'child', age: 12 }, { name: 'Myra Bhandari', type: 'child', age: 8 }],
    versionNo: 2, savedAt: '2026-10-14 13:50', createdAt: '2026-10-14 15:10', takenAt: '2026-10-15 11:20',
    taskStatus: 'done', doneAt: '2026-10-26 17:42', doneBy: 'flight',
  });
  Object.assign(S['s-301-f'], {
    segments: [{ from: 'DEL', to: 'SIN', date: '2026-11-01', flight: 'Singapore Airlines SQ 403', time: '23:45' }, { from: 'SIN', to: 'DEL', date: '2026-11-05', flight: 'Singapore Airlines SQ 406', time: '20:15' }],
    preferredTime: 'Night flight', cabin: 'Economy', notes: 'None',
    passengers: [{ name: 'Nidhi Mathur', type: 'adult' }, { name: 'Karan Mathur', type: 'adult' }],
    versionNo: 1, savedAt: '2026-10-03 12:40', createdAt: '2026-10-03 16:05', takenAt: '2026-10-04 10:15', doneAt: '2026-10-09 12:30', doneBy: 'flight',
  });

  /* Visa: the Bhandari family (s-390-v) and the Mathur couple (an extra completed task, s-301-v). */
  const DOCS_ADULT = [['passport_copy', 'Passport copy (front and back)'], ['photo', 'Photo, white background'], ['bank_statement', 'Bank statement (6 months)']];
  const DOCS_CHILD = [['passport_copy', 'Passport copy (front and back)'], ['photo', 'Photo, white background'], ['parent_passport', 'Parent’s passport copy']];
  const docs = (list, status) => list.map(([code, label]) => ({ code, label, status }));
  Object.assign(S['s-390-v'], {
    visa: { country: 'United Arab Emirates', purpose: 'Tourism', travelDate: '2026-11-20', applyBy: '2026-11-06', feePaidBy: 'company' },
    versionNo: 2, savedAt: '2026-10-14', createdAt: '2026-10-14 15:10', takenAt: '2026-10-15 10:40',
    applicants: [
      { seq: 1, name: 'Suresh Bhandari', type: 'adult', age: 46, born: '1980-03-03', nationality: 'Indian', passport: '••••4821', state: 'issued', documents: docs(DOCS_ADULT, 'checked'), reference: 'VFS/AMD/2026/118402', submittedAt: '2026-10-20', outcomeAt: '2026-10-25', documentsReturnedAt: '2026-10-26', documentsReturnedBy: 'visa', govFee: 5500, serviceFee: 800 },
      { seq: 2, name: 'Anita Bhandari', type: 'adult', age: 43, born: '1983-08-17', nationality: 'Indian', passport: '••••7390', state: 'issued', documents: docs(DOCS_ADULT, 'checked'), reference: 'VFS/AMD/2026/118403', submittedAt: '2026-10-20', outcomeAt: '2026-10-27', govFee: 5500, serviceFee: 800 },
      { seq: 3, name: 'Kabir Bhandari', type: 'child', age: 12, born: '2014-01-09', nationality: 'Indian', passport: '••••1056', state: 'decision_pending', documents: docs(DOCS_CHILD, 'checked'), reference: 'VFS/AMD/2026/118491', submittedAt: '2026-10-22', govFee: 5500, serviceFee: 800 },
      { seq: 4, name: 'Myra Bhandari', type: 'child', age: 8, born: '2018-06-21', nationality: 'Indian', passport: '••••6634', state: 'submitted', documents: docs(DOCS_CHILD, 'checked'), reference: 'VFS/AMD/2026/118492', submittedAt: '2026-10-22', govFee: 5500, serviceFee: 800 },
    ],
  });
  if (!S['s-301-v']) {
    S['s-301-v'] = { deal: 'BX-38301', kind: 'visa', dept: 'visa', title: 'Singapore · Tourism', detail: '2 travellers', start: '2026-11-01', end: '2026-11-05', assignee: 'visa', taskStatus: 'done', budget: 5800, cost: 5400,
      visa: { country: 'Singapore', purpose: 'Tourism', travelDate: '2026-11-01', applyBy: '2026-10-18', feePaidBy: 'company' }, versionNo: 1, savedAt: '2026-10-03', createdAt: '2026-10-03 16:05', takenAt: '2026-10-04 11:00', doneAt: '2026-10-18 15:20',
      applicants: [
        { seq: 1, name: 'Nidhi Mathur', type: 'adult', age: 34, born: '1992-02-11', nationality: 'Indian', passport: '••••2207', state: 'issued', documents: docs(DOCS_ADULT, 'checked'), reference: 'SG-EV-26-3381904', submittedAt: '2026-10-08', outcomeAt: '2026-10-16', documentsReturnedAt: '2026-10-18', documentsReturnedBy: 'visa', govFee: 2700, serviceFee: 0 },
        { seq: 2, name: 'Karan Mathur', type: 'adult', age: 36, born: '1990-09-27', nationality: 'Indian', passport: '••••5548', state: 'issued', documents: docs(DOCS_ADULT, 'checked'), reference: 'SG-EV-26-3381905', submittedAt: '2026-10-08', outcomeAt: '2026-10-16', documentsReturnedAt: '2026-10-18', documentsReturnedBy: 'visa', govFee: 2700, serviceFee: 0 },
      ] };
    const d301 = TN.deal('BX-38301'); if (d301 && !d301.services.includes('s-301-v')) d301.services.push('s-301-v');
  }

  /* Department costs (live "department_cost_entries"; Accounts reviews them at #/app/accounts/expenses).
     status: draft | submitted | accepted | returned | null (not company-paid). Shared with Agent F. */
  TN.DATA.departmentCosts = TN.DATA.departmentCosts || [];
  const COSTS = TN.DATA.departmentCosts;
  [
    { id: 'dc-412-1', task: 's-412-f', dept: 'flight', deal: 'BX-38412', kind: 'fare', amount: 43560, paidBy: 'company', mode: 'card', paidOn: '2026-10-21', reference: 'PNR K7RW2P', proof: 'df-412-1', status: 'submitted', submittedAt: '2026-10-21 15:30', submittedBy: 'flight' },
    { id: 'dc-412-2', task: 's-412-f', dept: 'flight', deal: 'BX-38412', kind: 'other', note: 'Seats and meals', amount: 2400, paidBy: 'company', mode: 'upi', paidOn: '2026-10-21', reference: 'UPI 629455102318', proof: 'df-412-2', status: 'returned', submittedAt: '2026-10-21 15:34', submittedBy: 'flight', reviewedBy: 'checker', reviewedAt: '2026-10-22 11:05', returnReason: 'The UPI screenshot shows ₹2,040, not ₹2,400. Upload the right screenshot or correct the amount.' },
    { id: 'dc-390-1', task: 's-390-f', dept: 'flight', deal: 'BX-38390', kind: 'fare', amount: 121640, paidBy: 'not_yet', reference: 'PNR QX4M8T', status: null, paymentRequest: 'SP-26-0024' },
    { id: 'dc-301-1', task: 's-301-f', dept: 'flight', deal: 'BX-38301', kind: 'fare', amount: 75400, paidBy: 'not_yet', reference: 'PNR SQ9T4L', status: null, paymentRequest: 'SP-26-0019' },
    { id: 'dc-390v-1', task: 's-390-v', dept: 'visa', deal: 'BX-38390', kind: 'government_fee', amount: 22000, paidBy: 'company', mode: 'bank_transfer', paidOn: '2026-10-20', reference: 'VFS/AMD/2026/118402-05', proof: 'df-390v-1', status: 'accepted', submittedAt: '2026-10-20 16:10', submittedBy: 'visa', reviewedBy: 'checker', reviewedAt: '2026-10-21 10:40' },
    { id: 'dc-390v-2', task: 's-390-v', dept: 'visa', deal: 'BX-38390', kind: 'service_fee', amount: 3200, paidBy: 'company', mode: 'upi', paidOn: '2026-10-20', reference: 'UPI 629302214877', proof: 'df-390v-2', status: 'returned', submittedAt: '2026-10-20 16:12', submittedBy: 'visa', reviewedBy: 'checker', reviewedAt: '2026-10-21 10:44', returnReason: 'The receipt shows ₹2,800. Upload the full VFS receipt or correct the amount.' },
    { id: 'dc-301v-1', task: 's-301-v', dept: 'visa', deal: 'BX-38301', kind: 'government_fee', amount: 5400, paidBy: 'company', mode: 'card', paidOn: '2026-10-08', reference: 'SG e-visa 3381904-05', proof: 'df-301v-1', status: 'accepted', submittedAt: '2026-10-08 14:00', submittedBy: 'visa', reviewedBy: 'accounts', reviewedAt: '2026-10-09 10:15' },
  ].forEach((c) => { if (!COSTS.some((x) => x.id === c.id)) COSTS.push(c); });

  /* The Singapore fare (above ₹50,000) went through a payment request, already paid and checked. */
  if (!TN.DATA.supplierPayments.some((p) => p.id === 'SP-26-0019')) {
    TN.DATA.supplierPayments.push({ id: 'SP-26-0019', deal: 'BX-38301', service: 's-301-f', supplier: 'sp-sia', amount: 75400, part: 'Full payment', dueBy: '2026-10-07', raisedBy: 'flight', raisedAt: '2026-10-05', status: 'verified', approvedBy: 'manager', paidBy: 'accounts', paidAt: '2026-10-06', verifiedBy: 'checker', bankRef: 'HDFC NEFT N279260018842' });
  }

  /* Department files (live "department_evidence"). kind: direct_payment_proof | fee_receipt | e_ticket | applicant_document | authority_outcome */
  TN.DATA.departmentFiles = TN.DATA.departmentFiles || [];
  const FILES = TN.DATA.departmentFiles;
  [
    { id: 'df-412-1', task: 's-412-f', kind: 'direct_payment_proof', name: 'indigo-card-slip-K7RW2P.pdf', size: '186 KB', at: '2026-10-21 15:20' },
    { id: 'df-412-2', task: 's-412-f', kind: 'direct_payment_proof', name: 'upi-seats-meals-21oct.png', size: '242 KB', at: '2026-10-21 15:22' },
    { id: 'df-390-1', task: 's-390-f', kind: 'e_ticket', name: 'EK-QX4M8T-etickets.pdf', size: '412 KB', at: '2026-10-26 17:30' },
    { id: 'df-301-1', task: 's-301-f', kind: 'e_ticket', name: 'SQ-SQ9T4L-etickets.pdf', size: '388 KB', at: '2026-10-09 12:10' },
    { id: 'df-390v-1', task: 's-390-v', kind: 'fee_receipt', name: 'vfs-fee-receipt-118402-05.pdf', size: '164 KB', at: '2026-10-20 16:05' },
    { id: 'df-390v-2', task: 's-390-v', kind: 'fee_receipt', name: 'vfs-service-charge-upi.png', size: '208 KB', at: '2026-10-20 16:06' },
    { id: 'df-390v-3', task: 's-390-v', kind: 'authority_outcome', applicant: 1, name: 'uae-evisa-applicant-1.pdf', size: '296 KB', at: '2026-10-25 12:40' },
    { id: 'df-390v-4', task: 's-390-v', kind: 'authority_outcome', applicant: 2, name: 'uae-evisa-applicant-2.pdf', size: '301 KB', at: '2026-10-27 11:10' },
    { id: 'df-301v-1', task: 's-301-v', kind: 'fee_receipt', name: 'sg-evisa-fee-receipt.pdf', size: '120 KB', at: '2026-10-08 13:55' },
    { id: 'df-301v-2', task: 's-301-v', kind: 'authority_outcome', applicant: 1, name: 'sg-evisa-applicant-1.pdf', size: '210 KB', at: '2026-10-16 10:30' },
    { id: 'df-301v-3', task: 's-301-v', kind: 'authority_outcome', applicant: 2, name: 'sg-evisa-applicant-2.pdf', size: '212 KB', at: '2026-10-16 10:31' },
  ].forEach((f) => { if (!FILES.some((x) => x.id === f.id)) FILES.push(f); });
  const ID_PROOFS = {
    's-412-f': { 'Rohan Agarwal': ['aadhaar-rohan-agarwal.pdf', '220 KB', '2026-10-18'], 'Anita Agarwal': ['aadhaar-anita-agarwal.pdf', '214 KB', '2026-10-18'] },
    's-390-f': { 'Suresh Bhandari': ['passport-suresh-bhandari.pdf', '410 KB', '2026-10-13'], 'Anita Bhandari': ['passport-anita-bhandari.pdf', '398 KB', '2026-10-13'], 'Kabir Bhandari': ['passport-kabir-bhandari.pdf', '402 KB', '2026-10-13'], 'Myra Bhandari': ['passport-myra-bhandari.pdf', '395 KB', '2026-10-13'] },
    's-301-f': { 'Nidhi Mathur': ['passport-nidhi-mathur.pdf', '388 KB', '2026-10-02'], 'Karan Mathur': ['passport-karan-mathur.pdf', '391 KB', '2026-10-02'] },
  };
  ID_PROOFS['s-390-v'] = ID_PROOFS['s-390-f'];
  ID_PROOFS['s-301-v'] = ID_PROOFS['s-301-f'];

  /* Task history (newest first when shown). by: TN.PEOPLE key or null. */
  const H = (TN.DATA.taskHistory = TN.DATA.taskHistory || {});
  const seedH = (id, list) => { if (!H[id]) H[id] = list; };
  seedH('s-412-f', [
    { title: 'Task created from the submitted booking', at: '2026-10-19 16:40' },
    { title: 'Task taken', at: '2026-10-20 10:05', by: 'flight' },
    { title: 'Cost recorded', at: '2026-10-21 15:25', by: 'flight' },
    { title: 'Cost recorded', at: '2026-10-21 15:27', by: 'flight' },
    { title: 'Cost sent to Accounts', at: '2026-10-21 15:30', by: 'flight' },
    { title: 'Cost sent to Accounts', at: '2026-10-21 15:34', by: 'flight' },
    { title: 'Accounts returned the cost', at: '2026-10-22 11:05', by: 'checker', detail: 'Reason: The UPI screenshot shows ₹2,040, not ₹2,400. Upload the right screenshot or correct the amount.' },
  ]);
  seedH('s-455-f', [{ title: 'Task created from the submitted booking', at: '2026-10-26 11:32' }]);
  seedH('s-390-f', [
    { title: 'Task created from the submitted booking', at: '2026-10-14 15:10' },
    { title: 'Task taken', at: '2026-10-15 11:20', by: 'flight' },
    { title: 'Cost recorded', at: '2026-10-26 16:55', by: 'flight' },
    { title: 'Payment request SP-26-0024 raised · waits for the branch Manager', at: '2026-10-26 17:05', by: 'flight' },
    { title: 'Airline booking reference recorded', at: '2026-10-26 17:28', by: 'flight' },
    { title: 'File added', at: '2026-10-26 17:30', by: 'flight' },
    { title: 'Flight marked done · ticket issued', at: '2026-10-26 17:42', by: 'flight', detail: 'Notice sent to Ritika Sharma (Sales) and Accounts.' },
  ]);
  seedH('s-301-f', [
    { title: 'Task created from the submitted booking', at: '2026-10-03 16:05' },
    { title: 'Task taken', at: '2026-10-04 10:15', by: 'flight' },
    { title: 'Cost recorded', at: '2026-10-05 11:40', by: 'flight' },
    { title: 'Payment request SP-26-0019 raised · waits for the branch Manager', at: '2026-10-05 11:45', by: 'flight' },
    { title: 'Flight marked done · ticket issued', at: '2026-10-09 12:30', by: 'flight', detail: 'Notice sent to Ritika Sharma (Sales) and Accounts.' },
  ]);
  seedH('s-390-v', [
    { title: 'Task created from the submitted booking', at: '2026-10-14 15:10' },
    { title: 'Task taken', at: '2026-10-15 10:40', by: 'visa' },
    { title: 'Applicant 1: Submitted (reference recorded)', at: '2026-10-20 15:50', by: 'visa' },
    { title: 'Applicant 2: Submitted (reference recorded)', at: '2026-10-20 15:52', by: 'visa' },
    { title: 'Cost sent to Accounts', at: '2026-10-20 16:10', by: 'visa' },
    { title: 'Cost sent to Accounts', at: '2026-10-20 16:12', by: 'visa' },
    { title: 'Accounts accepted the cost (recorded only; not approved for payment)', at: '2026-10-21 10:40', by: 'checker' },
    { title: 'Accounts returned the cost', at: '2026-10-21 10:44', by: 'checker', detail: 'Reason: The receipt shows ₹2,800. Upload the full VFS receipt or correct the amount.' },
    { title: 'Applicant 3: Submitted (reference recorded)', at: '2026-10-22 12:15', by: 'visa' },
    { title: 'Applicant 4: Submitted (reference recorded)', at: '2026-10-22 12:18', by: 'visa' },
    { title: 'Applicant 3: Waiting for decision', at: '2026-10-24 10:05', by: 'visa' },
    { title: 'Applicant 1: Issued', at: '2026-10-25 12:42', by: 'visa' },
    { title: 'Visa result sent to Ritika Sharma (Sales)', at: '2026-10-25 12:42', detail: 'UAE visa issued for Suresh Bhandari. 1 of 4 issued.' },
    { title: 'Applicant 1: Documents returned to the customer', at: '2026-10-26 18:10', by: 'visa' },
    { title: 'Applicant 2: Issued', at: '2026-10-27 11:12', by: 'visa' },
    { title: 'Visa result sent to Ritika Sharma (Sales)', at: '2026-10-27 11:15', detail: 'UAE visa issued for Anita Bhandari. 2 of 4 issued, 2 still with the authority.' },
  ]);
  seedH('s-301-v', [
    { title: 'Task created from the submitted booking', at: '2026-10-03 16:05' },
    { title: 'Task taken', at: '2026-10-04 11:00', by: 'visa' },
    { title: 'Applicant 1: Submitted (reference recorded)', at: '2026-10-08 13:40', by: 'visa' },
    { title: 'Applicant 2: Submitted (reference recorded)', at: '2026-10-08 13:42', by: 'visa' },
    { title: 'Accounts accepted the cost (recorded only; not approved for payment)', at: '2026-10-09 10:15', by: 'accounts' },
    { title: 'Applicant 1: Issued', at: '2026-10-16 10:32', by: 'visa' },
    { title: 'Applicant 2: Issued', at: '2026-10-16 10:33', by: 'visa' },
    { title: 'Applicant 1: Documents returned to the customer', at: '2026-10-18 15:18', by: 'visa' },
    { title: 'Applicant 2: Documents returned to the customer', at: '2026-10-18 15:20', by: 'visa' },
    { title: 'Task completed', at: '2026-10-18 15:20' },
  ]);
  const addH = (id, title, extra = {}) => (H[id] = H[id] || []).push({ title, at: NOW(), by: TN.me().key, ...extra });

  /* In-page UI state: open forms, typed values, refusals, one-time success lines. */
  const UI = { open: {}, vals: {}, err: {}, ferr: {}, flash: {} };

  /* ------------------------------------------------------------------
     Words (live contracts; pending words marked)
     ------------------------------------------------------------------ */
  const COST_KIND = { government_fee: 'Government fee', service_fee: 'Service fee', fare: 'Fare', other: 'Other cost' };
  const PAID_BY = { company: 'Company', customer_direct: 'Customer directly', not_yet: 'Not yet' };
  const MODE = { bank_transfer: 'Bank transfer', upi: 'UPI', card: 'Card', cash: 'Cash', other: 'Other' };
  const EXPENSE = { draft: ['neutral', 'Draft', 'clock'], submitted: ['info', 'Sent to Accounts', 'info'], accepted: ['success', 'Accepted (recorded only; not approved for payment)', 'circle-check'], returned: ['danger', 'Returned by Accounts', 'circle-x'] };
  const SP_STATUS = { requested: ['info', 'Waiting for Accounts'], waiting_manager: ['warning', 'Waiting for the branch Manager'], approved: ['info', 'Approved · not paid yet'], paid: ['info', 'Paid · waiting for a second check'], verified: ['success', 'Paid and checked'], returned: ['danger', 'Returned'], on_hold: ['warning', 'On hold'] };
  const VISA_STATE = { docs_pending: ['warning', 'Documents pending'], submitted: ['info', 'Submitted (reference recorded)'], decision_pending: ['info', 'Waiting for decision'], issued: ['success', 'Issued'], refused: ['danger', 'Refused'], withdrawn: ['neutral', 'Withdrawn'] };
  const FILE_KIND = { applicant_document: 'Applicant document', fee_receipt: 'Fee receipt', authority_outcome: 'Authority outcome document', direct_payment_proof: 'Direct payment proof', e_ticket: 'E-ticket' };
  const FLIGHT_LIMIT = 50000;
  const OVER_LIMIT = 'Company can pay directly up to ₹50,000 per purchase. Above that, choose “Not yet”: it goes through a supplier payment request.';
  const OUTCOME_NEEDS_DOC = 'A fee receipt or reference never proves issue. Upload the authority’s outcome document.';

  /* ------------------------------------------------------------------
     Lookups
     ------------------------------------------------------------------ */
  const deptTasks = (dept) => Object.entries(S).filter(([, s]) => s.dept === dept).map(([id, s]) => ({ id, s })).sort((a, b) => (a.s.start < b.s.start ? -1 : 1));
  const me = () => TN.me().key;
  const isMine = (s) => s.assignee === me();
  const canWorkDept = (dept) => TN.is(dept);
  const statusKey = (s) => (s.taskStatus === 'new' ? 'not_started' : s.taskStatus === 'done' ? 'completed' : s.taskStatus);
  const personName = (key) => (key === me() ? 'you' : (TN.person(key) || {}).name || 'Another staff member');
  const takenBy = (s) => (isMine(s) ? 'You' : s.assignee ? TN.person(s.assignee).name : 'Not taken yet');
  const costsOf = (id) => COSTS.filter((c) => c.task === id);
  const filesOf = (id) => FILES.filter((f) => f.task === id);
  const routeOf = (s) => { const seg = s.segments || []; if (!seg.length) return s.title; const pts = [seg[0].from]; seg.forEach((g) => pts.push(g.to)); return pts.join(' → '); };
  const segText = (g) => `${g.from} → ${g.to} · ${TN.fmt.day(g.date)}`;
  const visaTitle = (s) => `${s.visa.country} · ${s.visa.purpose}`;
  const visaFactsLine = (s) => { const v = s.visa; return [v.country, v.purpose, `travel ${TN.fmt.date(v.travelDate)}`, v.applyBy ? `apply by ${TN.fmt.date(v.applyBy)}` : null].filter(Boolean).join(' · '); };
  const fileName = (id) => (FILES.find((f) => f.id === id) || {}).name;
  const ownerName = (dealId) => { const d = TN.deal(dealId); return d ? TN.person(d.owner).name : 'Sales'; };
  const familyName = (dealId) => { const d = TN.deal(dealId); return d ? d.title.split(' · ')[0] : dealId; };

  function flightStatus(s) {
    const k = statusKey(s);
    if (k === 'not_started') return badge('neutral', 'Waiting to be taken', { wrap: true, icon: 'hourglass', sr: 'Task status: ' });
    if (k === 'completed') return badge('success', 'Done · ticket issued', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    if (k === 'supplier_confirmed') return badge('success', 'Confirmed by supplier', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    const recorded = s.pnr && filesOf(idOf(s)).some((f) => f.kind === 'e_ticket');
    return badge('info', recorded ? 'In progress · ticket recorded, not marked done' : 'In progress · ticket not recorded in the CRM', { wrap: true, icon: 'pencil-line', sr: 'Task status: ' });
  }
  function visaStatus(s) {
    const k = statusKey(s);
    if (k === 'not_started') return badge('neutral', 'Waiting to be taken', { wrap: true, icon: 'hourglass', sr: 'Task status: ' });
    if (k === 'completed') return badge('success', 'Completed', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    return badge('info', 'In progress', { wrap: true, icon: 'pencil-line', sr: 'Task status: ' });
  }
  const idOf = (s) => Object.keys(S).find((k) => S[k] === s);

  /* Mark-done checklist (DEC-59, pending). */
  function flightChecklist(id) {
    const s = S[id];
    const costs = costsOf(id);
    const company = costs.filter((c) => c.paidBy === 'company');
    const returned = company.filter((c) => c.status === 'returned').length;
    const notSent = company.filter((c) => c.status === 'draft' || c.status == null).length;
    const unpaid = costs.filter((c) => c.paidBy === 'not_yet' && !c.paymentRequest).length;
    return [
      { key: 'pnr', target: `pnr-${id}`, label: 'Airline booking reference (PNR)', done: !!s.pnr, why: 'not recorded yet' },
      { key: 'ticket', target: `eticket-${id}`, label: 'E-ticket file', done: filesOf(id).some((f) => f.kind === 'e_ticket'), why: 'not uploaded yet' },
      { key: 'fare', target: `cost-${id}-heading`, label: 'Fare recorded', done: costs.some((c) => c.kind === 'fare'), why: 'no fare yet' },
      { key: 'sent', target: `cost-${id}-heading`, label: 'Company-paid costs sent to Accounts', done: returned === 0 && notSent === 0, why: returned ? `${TN.fmt.plural(returned, 'cost')} returned by Accounts: fix and send again` : `${TN.fmt.plural(notSent, 'cost')} not sent yet` },
      { key: 'request', target: `cost-${id}-heading`, label: 'Unpaid fares have a payment request', done: unpaid === 0, why: `${unpaid} without a request` },
    ];
  }
  const readyToFinish = (id) => flightChecklist(id).every((i) => i.done);

  /* ------------------------------------------------------------------
     Shared task frame pieces
     ------------------------------------------------------------------ */
  const backLink = (href, text) => `<p class="m-0 mb-3"><a class="${C.back}" href="${href}">${ic('chevron-left', 'size-4')}${text}</a></p>`;
  const flashLine = (id) => { const f = UI.flash[id]; delete UI.flash[id]; return f ? notice('success', esc(f), { role: 'status', cls: 'mb-4' }) : '<div role="status" aria-live="polite" class="mb-4"></div>'; };
  const nextLine = (text, extra = '') => `<div class="mb-4 flex flex-col gap-1.5"><p class="m-0 text-copy" data-slot="task-next">${text === 'Nothing waiting.' ? text : `<span class="font-semibold text-ink">Next:</span> ${text}`}</p>${extra}</div>`;
  const taskTabs = (base, current) => tabsNav('Task sections', [['details', 'Details', base], ['work', 'Work', base + '?tab=work'], ['files', 'Files', base + '?tab=files'], ['history', 'History', base + '?tab=history']].map(([k, l, h]) => ({ label: l, href: '#' + h, current: k === current })), C.tabsNav);

  function historyPanel(id) {
    const items = (H[id] || []).slice().reverse().map((e) => ({ title: esc(e.title), meta: `${TN.fmt.dateTime(e.at)}${e.by ? ` · by ${esc(personName(e.by))}` : ''}`, detail: e.detail ? esc(e.detail) : '', state: 'done' }));
    const body = items.length ? timeline('Task history, newest first', items, false) : emptyState('history', 'No history yet', 'No history you can see on this task yet.');
    return card({ id: 'task-history-heading', title: 'History', desc: 'What happened on this task. No amounts are shown here.', body });
  }

  function filesPanel(id, { idProofs = true } = {}) {
    const s = S[id];
    const dep = filesOf(id).map((f) => ({ name: f.name, meta: `${FILE_KIND[f.kind]} · ${f.size} · ${TN.fmt.dateTime(f.at)}` }));
    const proofs = idProofs && isMine(s) ? Object.entries(ID_PROOFS[id] || {}).map(([who, [n, sz]]) => ({ name: n, meta: `ID proof of ${who} · ${sz}` })) : [];
    const group = (gid, title, lines) => (lines.length ? `<section aria-labelledby="${gid}" class="flex flex-col gap-2"><h3 id="${gid}" class="m-0 text-base font-semibold text-ink">${title}</h3><ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="${title}">${lines.map((f) => `<li class="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">${ic('file-text', 'size-4 shrink-0 text-faint')}<a href="#" data-act="fv-open-file" rel="noopener" class="${C.linkF}">${esc(f.name)}</a><span class="text-quiet">${esc(f.meta)}</span></li>`).join('')}</ul></section>` : '');
    const body = `${!dep.length && !proofs.length ? '<p class="m-0 text-quiet">No files on this task yet.</p>' : ''}${group('task-files-department', 'Department files', dep)}${group('task-files-id', 'Traveller ID proofs', proofs)}${proofs.length ? internalLine('Private identity documents for this work. Every view is recorded.') : ''}`;
    return card({ id: 'task-files-heading', title: 'Files', desc: 'Only files for this task. Customer payment proofs and acceptance messages are never listed here.', extra: ic('folder-open', 'size-4 text-faint'), body, bodyCls: C.bodyCol4 });
  }

  function idProofsCard(id, people) {
    const map = ID_PROOFS[id] || {};
    const items = people.map((p) => {
      const f = map[p.name];
      const kind = p.type === 'child' ? 'Child' : 'Adult';
      return `<li class="m-0 flex flex-col gap-2 rounded-control border border-line bg-canvas px-3.5 py-3"><p class="m-0 font-semibold text-ink">${esc(p.name)} <span class="font-normal text-quiet">· ${kind}</span></p>${f
        ? `<ul class="m-0 flex list-none flex-col gap-2 p-0"><li class="m-0 flex flex-wrap items-center gap-3">${ic('file-check', 'size-4 shrink-0 text-status-success')}<span class="min-w-40 flex-1 wrap-anywhere text-copy">${esc(f[0])} <span class="text-sm text-quiet">· ${f[1]} · attached ${TN.fmt.date(f[2])}</span></span><a class="${B.openSm}" href="#" data-act="fv-open-file" rel="noopener">Open<span class="sr-only"> ID proof of ${esc(p.name)}: ${esc(f[0])}</span></a></li></ul>`
        : `<p class="m-0 flex gap-2 text-sm text-copy">${ic('circle-alert', 'mt-0.5 size-4 shrink-0 text-status-warning')}No ID proof attached yet. Ask the salesperson.</p>`}</li>`;
    }).join('');
    return card({ id: 'id-proofs-heading', title: 'Traveller ID proofs', extra: `<p class="m-0 text-sm text-quiet"><span class="inline-flex gap-1.5">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-faint')}Private identity documents for this work. Every view is recorded. Do not copy or forward them.</span></p>`, body: `<ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Travellers and their ID proofs">${items}</ul>` });
  }

  /* ------------------------------------------------------------------
     Cost card (live DepartmentCostCard) + pending payment request line
     ------------------------------------------------------------------ */
  function costForm(id, dept, cost) {
    const key = cost ? `edit-${cost.id}` : `new-${id}`;
    const v = UI.vals[key] || (cost ? { kind: cost.kind, amount: String(cost.amount), paidBy: cost.paidBy, mode: cost.mode || '', paidOn: cost.paidOn || '', reference: cost.reference || '', proof: cost.proof || '' } : { kind: dept === 'flight' ? 'fare' : 'government_fee', amount: '', paidBy: dept === 'flight' ? 'company' : 'company', mode: '', paidOn: '', reference: '', proof: '' });
    const fe = UI.ferr[key] || {};
    const p = `cost-${key}`;
    const kinds = dept === 'flight' ? ['fare', 'other'] : ['government_fee', 'service_fee', 'other'];
    const proofs = filesOf(id).filter((f) => f.kind === (dept === 'flight' ? 'direct_payment_proof' : 'fee_receipt'));
    const over = dept === 'flight' && v.paidBy === 'company' && Number(String(v.amount).replace(/,/g, '')) > FLIGHT_LIMIT;
    const company = v.paidBy === 'company'
      ? field(`${p}-mode`, 'How it was paid', select(`${p}-mode`, 'mode', [['', 'Choose'], ...Object.entries(MODE)], v.mode, fe.mode ? ` aria-invalid="true" aria-describedby="${p}-mode-error"` : ''), { error: fe.mode })
        + field(`${p}-paid-on`, 'Paid on', textInput(`${p}-paid-on`, 'paidOn', v.paidOn, { type: 'date', invalid: !!fe.paidOn }), { error: fe.paidOn })
        + field(`${p}-reference`, 'Reference', textInput(`${p}-reference`, 'reference', v.reference, { max: 120 }), { optional: true })
        + field(`${p}-proof`, dept === 'flight' ? 'Direct-payment proof' : 'Payment receipt', select(`${p}-proof`, 'proof', [['', proofs.length ? 'Not chosen' : 'None uploaded yet'], ...proofs.map((f) => [f.id, f.name])], v.proof), { hint: proofs.length ? '' : 'Upload it first; a company-paid cost needs it before it goes to Accounts.' })
      : `<p class="m-0 self-end text-sm text-quiet">${v.paidBy === 'not_yet' ? 'Not paid yet: it will go through a supplier payment request.' : 'The customer pays the supplier directly. Nothing goes to Accounts.'}</p>`
        + (v.paidBy === 'not_yet' ? field(`${p}-reference`, 'Reference', textInput(`${p}-reference`, 'reference', v.reference, { max: 120 }), { optional: true }) : '');
    const amountErr = fe.amount || (over ? OVER_LIMIT : '');
    return `<form novalidate aria-label="${cost ? 'Change this cost' : 'Record a cost'}" class="flex flex-col gap-3" data-act="fv-cost-save">
      ${UI.err[key] ? errorSummary(esc(UI.err[key]), UI.err[key].startsWith('Above') ? 'What you typed is still here.' : 'Check the fields marked below. What you typed is still here.', `${p}-summary`) : ''}
      <input type="hidden" name="task" value="${id}"><input type="hidden" name="key" value="${key}"><input type="hidden" name="entry" value="${cost ? cost.id : ''}">
      <fieldset class="m-0 min-w-0 rounded-card border border-line bg-card px-4 pt-1 pb-4 font-sans" data-slot="fieldset"><legend class="px-1 text-base font-semibold text-ink">${cost ? 'Change the cost' : 'New cost'}</legend>
      <div class="grid gap-4 sm:grid-cols-2">
        ${field(`${p}-kind`, 'What was it for', select(`${p}-kind`, 'kind', kinds.map((k) => [k, COST_KIND[k]]), v.kind))}
        <div class="flex flex-col gap-1.5" data-slot="field"><label class="${C.label}" for="${p}-amount">Amount ₹</label><div class="relative" data-slot="money-input"><span aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-3 flex items-center font-sans text-base text-quiet">₹</span><input type="text"${amountErr ? ` aria-invalid="true" aria-describedby="${p}-amount-error"` : ''} class="${C.input} pl-7 tabular-nums" data-slot="input" inputmode="decimal" autocomplete="off" id="${p}-amount" name="amount" value="${esc(v.amount)}"></div>${amountErr ? fieldError(`${p}-amount`, amountErr) : ''}</div>
        ${field(`${p}-paid-by`, 'Paid by', select(`${p}-paid-by`, 'paidBy', Object.entries(PAID_BY), v.paidBy, ' data-change="fv-cost-field"'))}
        ${company}
      </div></fieldset>
      <div class="flex flex-wrap gap-2"><button type="submit" class="${B.primary}" data-slot="button"${over ? ' disabled' : ''}>Save cost</button><button type="button" class="${B.ghostMd}" data-slot="button" data-act="fv-cost-cancel" data-key="${key}">Cancel</button></div>
    </form>`;
  }

  function paymentLine(c) {
    const sp = TN.DATA.supplierPayments.find((p) => p.id === c.paymentRequest);
    if (!sp) return '';
    const [tone, word] = SP_STATUS[sp.status] || ['neutral', sp.status];
    return `<div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-sm text-copy">Payment request ${esc(sp.id)} · ${esc(TN.supplier(sp.supplier).name)} · pay by ${TN.fmt.date(sp.dueBy)}</p>${badge(tone, word, { sr: 'Payment request: ' })}</div>`;
  }

  function costItem(c, id, dept, work) {
    const [tone, word, icon] = c.status ? EXPENSE[c.status] : [];
    const editing = UI.open[`edit-${c.id}`];
    const paid = c.paidBy === 'company' ? `Paid by: Company · ${MODE[c.mode] || 'how not given'} · ${TN.fmt.date(c.paidOn)}${c.reference ? ` · reference ${esc(c.reference)}` : ''}` : `Paid by: ${PAID_BY[c.paidBy]}${c.reference ? ` · reference ${esc(c.reference)}` : ''}`;
    const canEdit = work && (c.status == null || c.status === 'draft' || c.status === 'returned') && !c.paymentRequest;
    const canSend = work && c.paidBy === 'company' && (c.status === 'draft' || c.status === 'returned');
    const canRaise = work && dept === 'flight' && c.paidBy === 'not_yet' && !c.paymentRequest;
    const sendErr = UI.err[`send-${c.id}`];
    return `<li class="m-0"><article class="${C.costItem}" aria-label="${COST_KIND[c.kind]} ${inr(c.amount)}">
      <div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 font-semibold text-ink tabular-nums">${COST_KIND[c.kind]}${c.note ? ` (${esc(c.note)})` : ''} · ${inr(c.amount)}</p>${c.status ? badge(tone, word, { wrap: true, icon, sr: 'Expense record: ' }) : ''}</div>
      <p class="m-0 text-sm text-copy">${paid}</p>
      ${c.status === 'returned' && c.returnReason ? notice('danger', `Accounts returned it: ${esc(c.returnReason)}`) : ''}
      ${c.proof ? `<p class="m-0 text-sm text-quiet">Receipt: ${esc(fileName(c.proof))}</p>` : ''}
      ${c.status === 'submitted' ? '<p class="m-0 text-sm text-quiet">Sent to Accounts. A different Accounts person reviews it. This is not a payment approval.</p>' : ''}
      ${c.paymentRequest ? paymentLine(c) : ''}
      ${canRaise ? `<p class="m-0 text-sm text-quiet">Not paid yet. Raise a supplier payment request so Accounts can pay the airline.</p>` : ''}
      ${sendErr ? `<p class="m-0 flex gap-2 text-sm font-medium text-status-danger">${ic('circle-alert', 'mt-0.5 size-4 shrink-0')}${esc(sendErr)}</p>` : ''}
      ${canEdit || canSend || canRaise ? `<div class="flex flex-wrap gap-2">${canEdit ? `<button type="button" class="${B.ghostSm}" data-slot="button" aria-expanded="${editing ? 'true' : 'false'}" data-act="fv-cost-edit" data-id="${c.id}">${editing ? 'Close' : 'Change this cost'}</button>` : ''}${canSend ? `<button type="button" class="${B.secondary}" data-slot="button" data-act="fv-cost-send" data-id="${c.id}"${c.proof ? '' : ` aria-describedby="cost-${c.id}-receipt-note"`}>Send to Accounts</button>${c.proof ? '' : `<p id="cost-${c.id}-receipt-note" class="m-0 text-sm text-quiet">${dept === 'flight' ? 'Upload the direct-payment proof, then choose it under “Change this cost”.' : 'Upload the fee receipt, then choose it under “Change this cost”.'}</p>`}` : ''}${canRaise ? `<button type="button" class="${B.secondary}" data-slot="button" data-act="fv-raise-sp" data-id="${c.id}">Raise a payment request</button>` : ''}</div>` : ''}
      ${editing ? costForm(id, dept, c) : ''}
      <div role="status" aria-live="polite"></div>
    </article></li>`;
  }

  function costCard(id, dept, work) {
    const costs = costsOf(id);
    const proofs = filesOf(id).filter((f) => f.kind === 'direct_payment_proof' || f.kind === 'fee_receipt');
    const adding = UI.open[`new-${id}`];
    const body = `${notice('info', dept === 'flight' ? OVER_LIMIT : 'This is an expense record for Accounts review. It does not approve or make a payment.')}
      ${costs.length ? `<ol class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Costs recorded">${costs.map((c) => costItem(c, id, dept, work)).join('')}</ol>` : '<p class="m-0 text-quiet">No cost recorded yet.</p>'}
      ${proofs.length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm" aria-label="Company payment proofs stored">${proofs.map((f) => `<li><a href="#" data-act="fv-open-file" rel="noopener" class="${C.link}">${esc(f.name)}</a> <span class="text-quiet">· ${f.kind === 'fee_receipt' ? 'fee receipt' : 'direct-payment proof'}</span></li>`).join('')}</ul>` : ''}
      ${work && dept === 'flight' ? `<details class="${C.details}"${UI.open[`up-${id}-proof`] ? ' open' : ''}><summary class="${C.summary}">Upload the direct-payment proof</summary><div class="${C.detailsBody}">${fileUpload(`up-${id}-proof`, 'Upload the direct-payment proof', `<input type="hidden" name="task" value="${id}">`, [['direct_payment_proof', 'Direct payment proof']])}</div></details>` : ''}
      ${work ? (adding ? costForm(id, dept, null) : `<div><button type="button" class="${B.secondaryMd}" data-slot="button" data-act="fv-cost-new" data-id="${id}">${ic('plus')} Record a cost</button></div>`) : ''}`;
    return card({ id: `cost-${id}-heading`, title: dept === 'visa' ? 'Fees and costs' : 'Cost', desc: 'What the department paid, by whom and how.', body, bodyCls: C.bodyCol4 });
  }

  /* ------------------------------------------------------------------
     FLIGHT
     ------------------------------------------------------------------ */
  const flightRoles = ['flight', 'manager'];
  function flightQueue(params, q) {
    const taker = canWorkDept('flight');
    const show = ['not_taken', 'mine', 'all'].includes(q.show) && (taker || q.show !== 'mine') ? q.show : taker ? 'not_taken' : 'all';
    const all = deptTasks('flight');
    const notTaken = all.filter((t) => !t.s.assignee && t.s.taskStatus === 'new');
    const mine = all.filter((t) => isMine(t.s));
    const list = show === 'mine' ? mine : show === 'not_taken' ? notTaken : all;
    const tabs = (taker ? ['not_taken', 'mine', 'all'] : ['not_taken', 'all']).map((k) => ({ label: { not_taken: 'Not taken', mine: 'Mine', all: 'All' }[k], href: '#/app/flight' + (k === (taker ? 'not_taken' : 'all') ? '' : '?show=' + k), current: k === show, count: { not_taken: notTaken.length, mine: mine.length, all: all.length }[k] }));
    const rows = list.map(({ id, s }) => {
      const d = TN.deal(s.deal);
      return [
        { html: `<a class="rounded-chip font-semibold text-brand-strong underline-offset-4 hover:text-brand-deep ${FOCUS}" href="#/app/flight/${id}">${esc(routeOf(s))}<span class="sr-only"> — open task</span></a>` },
        { cls: 'text-sm', html: `<ul class="m-0 list-none p-0">${(s.segments || []).map((g) => `<li class="m-0 whitespace-nowrap">${esc(segText(g))}</li>`).join('')}</ul>` },
        { cls: 'tabular-nums', html: String((s.passengers || []).length || (d.adults + d.children + d.infants)) },
        { cls: 'whitespace-nowrap tabular-nums', html: s.budget ? inr(s.budget) : 'Budget not set' },
        { html: flightStatus(s) },
        { html: esc(takenBy(s)) },
        { cls: 'text-sm', html: `${esc(s.deal)} · Jodhpur` },
      ];
    });
    const empty = all.length === 0 ? emptyState('plane', 'No tasks here yet', 'Tasks appear after Sales submits a booking with a flight.') : emptyState('plane', show === 'mine' ? 'No tasks taken by you' : 'Nothing waiting to be taken', show === 'mine' ? 'Open the Not taken tab to pick one up.' : 'Open the All tab to see who has each task.');
    return `<div class="${C.page}">
      <header class="${C.headerList}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">Flight team</p><h1 class="${C.h1}">Flight tasks</h1><p class="${C.headDesc}">Flight tasks from submitted bookings. Issue each ticket outside the CRM, then record the fare on the task.</p></div></header>
      <div class="mb-4">${internalLine('Customer prices and proof files are never shown here.')}</div>
      ${tabsNav('Flight task filters', tabs, C.tabsNavList)}
      <div class="${C.card}" data-slot="card">${list.length ? table({ label: 'Flight tasks table', caption: `${list.length} flight ${list.length === 1 ? 'task' : 'tasks'}`, heads: ['Route', 'Segments', 'Passengers', 'Approved budget', 'Status', 'Taken by', 'Deal'], rows }) : `<div role="status">${empty}</div>`}</div>
    </div>`;
  }

  function notAvailable(back, backText) {
    return `<div class="${C.page}"><header class="${C.headerList}" data-slot="page-header"><div class="min-w-0"><h1 class="${C.h1}">Task not available</h1></div></header>${notice('locked', 'This task is not available to you. It may not exist, or you may not have access.', { role: 'status' })}<p class="m-0 mt-4"><a class="${B.secondaryMd}" data-slot="button" href="${back}">${ic('chevron-left')}${backText}</a></p></div>`;
  }

  function flightDetails(id) {
    const s = S[id];
    const d = TN.deal(s.deal);
    const mine = isMine(s);
    const files = filesOf(id).filter((f) => f.kind === 'e_ticket');
    const facts = `<dl class="${C.dlFacts}"><dt class="${C.dt}">Segments</dt><dd class="${C.ddFacts}">${esc((s.segments || []).map(segText).join('; '))}</dd><dt class="${C.dt}">Passengers</dt><dd class="${C.ddFacts}">${(s.passengers || []).length}</dd><dt class="${C.dt}">Preferred time</dt><dd class="${C.ddFacts}">${esc(s.preferredTime || 'Any')}</dd><dt class="${C.dt}">Cabin</dt><dd class="${C.ddFacts}">${esc(s.cabin || 'Economy')}</dd><dt class="${C.dt}">Notes</dt><dd class="${C.ddFacts}">${esc(s.notes || 'None')}</dd></dl>`;
    const people = mine ? `<ul class="m-0 mt-3 flex list-none flex-col gap-1 p-0" aria-label="Travellers on this flight">${s.passengers.map((p) => `<li class="text-copy">${esc(p.name)} <span class="text-sm text-quiet">(${p.type}${p.age ? `, ${p.age}` : ''})</span></li>`).join('')}</ul>` : '<p class="m-0 mt-3 text-sm text-quiet">Traveller names are not shown to the Flight team in this version.</p>';
    const budget = `<dl class="${C.dl}"><dt class="${C.dt}">Travellers on the accepted version</dt><dd class="${C.ddNum}">${d.adults + d.children + d.infants}</dd><dt class="${C.dt}">Approved budget</dt><dd class="${C.ddMoney}">${s.budget ? inr(s.budget) : 'Budget not set'}</dd></dl>${files.length && mine ? `<ul class="m-0 mt-3 flex list-none flex-col gap-1.5 p-0" aria-label="Ticket files">${files.map((f) => `<li class="flex flex-wrap items-center gap-x-2 text-sm wrap-anywhere"><a href="#" data-act="fv-open-file" class="rounded-chip font-medium text-brand-strong underline underline-offset-4 ${FOCUS}">${esc(f.name)}</a><span class="text-quiet">${f.size}</span></li>`).join('')}</ul>` : ''}${people}`;
    const origin = `<dl class="${C.dl}"><dt class="${C.dt}">Deal</dt><dd class="${C.dd}">${esc(s.deal)}</dd><dt class="${C.dt}">Branch</dt><dd class="${C.dd}">Jodhpur</dd><dt class="${C.dt}">Accepted version</dt><dd class="${C.dd}">${s.versionNo || 1}</dd><dt class="${C.dt}">Saved</dt><dd class="${C.dd}">${TN.fmt.dateTime(s.savedAt)} by ${esc(TN.person(d.owner).name)}</dd><dt class="${C.dt}">Task created</dt><dd class="${C.dd}">${TN.fmt.dateTime(s.createdAt)}</dd></dl>`;
    return `<div class="grid items-start gap-5 md:grid-cols-2">
      ${card({ id: 'flight-facts-heading', title: 'Flight details', extra: ic('plane', 'size-4 text-faint'), body: facts })}
      ${card({ id: 'flight-budget-heading', title: 'Travellers and budget', body: budget })}
      ${card({ id: 'flight-origin-heading', title: 'Where this came from', body: origin, cls: 'md:col-span-2' })}
      ${mine ? `<div class="md:col-span-2">${idProofsCard(id, s.passengers)}</div>` : ''}
    </div>`;
  }

  /* PENDING (DEC-59): finish card with ticket details, checklist and "Mark flight done". */
  function finishCard(id, work) {
    const s = S[id];
    if (s.taskStatus === 'done') {
      return card({ id: `finish-${id}-heading`, title: 'Finish this flight', body: notice('success', `<p>Marked done on ${TN.fmt.dateTime(s.doneAt)} by ${esc(personName(s.doneBy || 'flight'))}. Sales and Accounts were told the ticket is issued.</p><p>The ticket details and costs on this task are locked. If the ticket must change, ask the branch Manager to reopen the task.</p>`, { title: 'Flight done', icon: 'check-check' }) });
    }
    if (!work) {
      return card({ id: `finish-${id}-heading`, title: 'Finish this flight', body: `<p class="m-0 text-quiet">The Flight person who takes this task marks it done after the ticket is issued.</p>` });
    }
    const items = flightChecklist(id);
    const done = items.filter((i) => i.done).length;
    const W = ['w-0', 'w-[5%]', 'w-[10%]', 'w-[15%]', 'w-[20%]', 'w-[25%]', 'w-[30%]', 'w-[35%]', 'w-[40%]', 'w-[45%]', 'w-[50%]', 'w-[55%]', 'w-[60%]', 'w-[65%]', 'w-[70%]', 'w-[75%]', 'w-[80%]', 'w-[85%]', 'w-[90%]', 'w-[95%]', 'w-full'];
    const pct = Math.round((done / items.length) * 100);
    const tickets = filesOf(id).filter((f) => f.kind === 'e_ticket');
    const pnrErr = UI.ferr[`pnr-${id}`];
    const doneErr = UI.err[`done-${id}`];
    const body = `
      ${doneErr ? errorSummary('Finish the steps below before you mark the flight done.', esc(doneErr), `done-${id}-summary`) : ''}
      <form novalidate aria-label="Ticket details" class="flex flex-col gap-3 rounded-control border border-line bg-canvas px-3.5 py-3" data-act="fv-save-pnr">
        <input type="hidden" name="task" value="${id}">
        <div class="grid gap-3 sm:grid-cols-2">
          ${field(`pnr-${id}`, 'Airline booking reference (PNR)', textInput(`pnr-${id}`, 'pnr', UI.vals[`pnr-${id}`] ?? s.pnr ?? '', { max: 12, invalid: !!pnrErr, describe: `pnr-${id}-hint` }), { hint: '6 letters and numbers, as on the e-ticket.', error: pnrErr })}
        </div>
        <div><button type="submit" class="${B.secondary}" data-slot="button">Save ticket details</button></div>
      </form>
      ${tickets.length ? `<ul class="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="E-tickets stored">${tickets.map((f) => `<li class="m-0 flex flex-wrap items-center gap-2 text-sm">${ic('file-check', 'size-4 text-status-success')}<a href="#" data-act="fv-open-file" rel="noopener" class="${C.linkPlain}">${esc(f.name)}</a><span class="text-quiet">E-ticket · ${f.size}</span></li>`).join('')}</ul>` : ''}
      <details class="${C.details}" id="eticket-${id}"${UI.open[`up-${id}-ticket`] ? ' open' : ''}><summary class="${C.summaryF}">Upload the e-ticket</summary><div class="${C.detailsBody}">${fileUpload(`up-${id}-ticket`, 'Upload the e-ticket', `<input type="hidden" name="task" value="${id}">`, [['e_ticket', 'E-ticket']])}</div></details>
      <section id="check-${id}" aria-labelledby="check-${id}-heading" class="flex flex-col" data-slot="progress-checklist">
        <div class="flex items-baseline justify-between gap-2.5"><h3 id="check-${id}-heading" tabindex="-1" class="m-0 text-md font-semibold text-ink outline-none">Before you mark it done</h3><span class="text-sm text-quiet">${done} of ${items.length} done</span></div>
        <div role="progressbar" aria-labelledby="check-${id}-heading" aria-valuemin="0" aria-valuemax="${items.length}" aria-valuenow="${done}" aria-valuetext="${done} of ${items.length} done" class="mt-2.5 mb-3.5 h-2 overflow-hidden rounded-full bg-wash"><div class="h-full rounded-full bg-brand transition-[width] duration-(--ui-duration-base) motion-reduce:transition-none ${W[Math.round(pct / 5)]}"></div></div>
        <ul class="m-0 grid list-none grid-cols-1 gap-x-4.5 gap-y-1.5 p-0 sm:grid-cols-2">${items.map((it) => `<li class="m-0"><button type="button" data-act="fv-jump" data-target="${it.target}" class="group flex w-full cursor-pointer items-start gap-2 border-0 bg-transparent py-1.25 text-left text-sm text-copy ${FOCUS}">${it.done ? ic('circle-check', 'mt-0.5 size-4 shrink-0 text-status-success') : ic('circle', 'mt-0.5 size-4 shrink-0 text-quiet')}<span class="min-w-0"><span class="font-semibold group-hover:underline">${it.label}</span><span class="sr-only">${it.done ? ': done' : ': not done'}</span>${!it.done && it.why ? `<span class="text-quiet"> · ${esc(it.why)}</span>` : ''}</span></button></li>`).join('')}</ul>
      </section>
      <div class="flex flex-col gap-2"><div><button type="button" class="${B.primary}" data-slot="button" data-act="fv-done" data-id="${id}">Mark flight done</button></div><p class="m-0 text-sm text-quiet">Sales and Accounts get a notice that the ticket is issued. The task then locks.</p></div>`;
    return card({ id: `finish-${id}-heading`, title: 'Finish this flight', desc: 'Record the ticket, then mark the flight done.', body, bodyCls: C.bodyCol4 });
  }

  /* PENDING: what feeds the customer Invoice (no selling price). */
  function flightInvoiceLines(id) {
    const s = S[id];
    const names = isMine(s) || TN.is('manager') ? s.passengers.map((p) => p.name).join(', ') : `${s.passengers.length} passengers`;
    const rows = (s.segments || []).map((g) => [
      { html: `<span class="font-semibold text-ink">${esc(g.from)} → ${esc(g.to)}</span>` },
      { cls: 'text-sm', html: esc(g.flight || 'Not booked yet') },
      { cls: 'whitespace-nowrap', html: `${TN.fmt.date(g.date)}${g.time ? ` · ${g.time}` : ''}` },
      { cls: 'text-sm', html: esc(names) },
      { cls: 'whitespace-nowrap', html: s.pnr ? esc(s.pnr) : '<span class="text-quiet">Not recorded yet</span>' },
    ]);
    return `<div class="${C.card}" data-slot="card"><section aria-labelledby="inv-${id}-heading"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.cardTitle}" id="inv-${id}-heading">Flight lines for the invoice</h2><p class="${C.small}">These lines go on the customer’s Invoice. Sales sets the price; no price is shown here.</p></div>${ic('file-text', 'size-4 text-faint')}</div>${table({ label: 'Flight lines for the invoice', caption: `${rows.length} flight ${rows.length === 1 ? 'line' : 'lines'}`, heads: ['Route', 'Flight', 'Date', 'Passengers', 'PNR'], rows })}</section></div>`;
  }

  function flightTask(params, q) {
    const id = params.taskId;
    const s = S[id];
    if (!s || s.dept !== 'flight') return notAvailable('#/app/flight', 'Back to Flight tasks');
    const base = `/app/flight/${id}`;
    const tab = ['work', 'files', 'history'].includes(q.tab) ? q.tab : 'details';
    const taker = canWorkDept('flight');
    const mine = isMine(s);
    const done = s.taskStatus === 'done';
    const work = taker && mine && !done;
    const canClaim = taker && !s.assignee && s.taskStatus === 'new';
    const actions = canClaim
      ? `<form novalidate class="flex flex-col items-start gap-2 sm:items-end" data-act="fv-take"><input type="hidden" name="task" value="${id}"><p id="flight-claim-help" class="${C.small}">Shows colleagues you are handling it. It does not issue a ticket.</p><button type="submit" class="${B.takeLg}" data-slot="button" aria-describedby="flight-claim-help">Take this task</button><div role="status" aria-live="polite" class="w-full"></div></form>`
      : work && tab !== 'work' ? `<a class="${B.linkLg}" href="#${base}?tab=work">${s.pnr ? 'Finish this flight' : 'Record the fare'}</a>` : '';
    const next = done ? 'Nothing waiting.' : !s.assignee ? (canClaim ? 'take this task' : 'Flight takes this task') : mine ? (readyToFinish(id) ? 'mark the flight done on the Work tab' : 'issue the ticket, then record the fare on the Work tab') : `${TN.person(s.assignee).name} works on this task`;
    const internal = done
      ? `Internal task. Ticket issued and marked done on ${TN.fmt.dateTime(s.doneAt)}. No payment, bill or invoice was created by the CRM. Nothing has been sent to the airline or the customer by the CRM.`
      : `Internal task. Tickets are issued outside the CRM. ${mine ? 'Taking the task did not book the flight. ' : ''}Nothing has been sent to the airline or the customer by the CRM.`;
    let content;
    if (tab === 'work') content = `<div class="flex flex-col gap-5">${costCard(id, 'flight', work)}${s.assignee ? finishCard(id, work) : ''}${s.assignee ? flightInvoiceLines(id) : ''}</div>`;
    else if (tab === 'files') content = filesPanel(id);
    else if (tab === 'history') content = historyPanel(id);
    else content = flightDetails(id);
    return `<div class="${C.page}">
      ${backLink('#/app/flight', 'Back to Flight tasks')}
      <header class="${C.headerTask}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">Flight task · ${esc(s.deal)}</p><h1 class="${C.h1}"><span class="block wrap-anywhere">${esc(routeOf(s))}</span></h1><div class="${C.statusRow}">${flightStatus(s)}<span class="text-copy">Taken by: ${esc(takenBy(s))}</span></div></div>${actions ? `<div class="${C.actions}">${actions}</div>` : ''}</header>
      ${UI.flash[id] ? flashLine(id) : ''}
      ${nextLine(next, internalLine(internal))}
      ${taskTabs(base, tab)}
      ${content}
    </div>`;
  }

  TN.page('/app/flight', { nav: '/app/flight', roles: flightRoles, title: 'Flight tasks', render: flightQueue });
  TN.page('/app/flight/:taskId', { nav: '/app/flight', roles: flightRoles, title: 'Flight task', render: flightTask });

  /* ------------------------------------------------------------------
     VISA AND PASSPORT
     ------------------------------------------------------------------ */
  const visaRoles = ['visa', 'manager'];
  function visaQueue(params, q) {
    const taker = canWorkDept('visa');
    const show = ['not_taken', 'mine', 'all'].includes(q.show) && (taker || q.show !== 'mine') ? q.show : taker ? 'not_taken' : 'all';
    const all = deptTasks('visa');
    const notTaken = all.filter((t) => !t.s.assignee && t.s.taskStatus === 'new');
    const mine = all.filter((t) => isMine(t.s));
    const list = show === 'mine' ? mine : show === 'not_taken' ? notTaken : all;
    const tabs = (taker ? ['not_taken', 'mine', 'all'] : ['not_taken', 'all']).map((k) => ({ label: { not_taken: 'Not taken', mine: 'Mine', all: 'All' }[k], href: '#/app/visa' + (k === (taker ? 'not_taken' : 'all') ? '' : '?show=' + k), current: k === show, count: { not_taken: notTaken.length, mine: mine.length, all: all.length }[k] }));
    const items = list.map(({ id, s }) => `<li class="m-0 flex flex-col gap-1.5 px-4.5 py-3.5 sm:flex-row sm:items-center sm:justify-between"><div class="min-w-0"><p class="m-0 font-semibold text-ink"><a class="rounded-chip text-brand-strong underline underline-offset-4 hover:text-brand-deep ${FOCUS}" href="#/app/visa/${id}">Visa · ${esc(visaTitle(s))}</a></p><p class="m-0 text-sm text-copy">${esc(visaFactsLine(s))}</p><p class="${C.small}">${esc(s.deal)} · Jodhpur · ${TN.fmt.plural(s.applicants.length, 'applicant')} · Taken by: ${esc(takenBy(s))}</p></div>${visaStatus(s)}</li>`).join('');
    const empty = all.length === 0 ? emptyState('stamp', 'No tasks here yet', 'Tasks appear after Sales submits a booking with a visa or passport service.') : emptyState('stamp', show === 'mine' ? 'No tasks taken by you' : 'Nothing waiting to be taken', show === 'mine' ? 'Open the Not taken tab to pick one up.' : 'Open the All tab to see who has each task.');
    return `<div class="${C.page}">
      <header class="${C.headerList}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">Visa and passport desk</p><h1 class="${C.h1}">Visa and passport tasks</h1><p class="${C.headDesc}">Visa and passport tasks from submitted bookings.</p></div></header>
      ${tabsNav('Visa and passport task filters', tabs, C.tabsNavList)}
      <div class="${C.card}" data-slot="card"><section aria-labelledby="visa-queue-heading"><div class="${C.cardHead}"><h2 class="${C.cardTitle}" id="visa-queue-heading">Tasks</h2><span class="text-sm text-quiet">${list.length} ${list.length === 1 ? 'task' : 'tasks'}</span></div>${list.length ? `<ol class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Visa and passport tasks">${items}</ol>` : `<div role="status">${empty}</div>`}</section></div>
    </div>`;
  }

  const isClosed = (a) => (a.state === 'issued' && a.documentsReturnedAt) || ((a.state === 'refused' || a.state === 'withdrawn') && a.customerInformedAt);
  function applicantTimeline(a) {
    const order = ['docs_pending', 'submitted', 'decision_pending'];
    const final = ['issued', 'refused', 'withdrawn'].includes(a.state);
    const reached = (st) => order.indexOf(a.state) > order.indexOf(st) || final;
    const outcome = a.state === 'issued' ? 'Issued' : a.state === 'refused' ? 'Refused' : a.state === 'withdrawn' ? 'Withdrawn' : 'Authority’s decision';
    return [
      { title: 'Documents checked', state: reached('docs_pending') ? 'done' : a.state === 'docs_pending' ? 'current' : 'upcoming' },
      { title: 'Application submitted', meta: a.reference ? `Reference ${esc(a.reference)}${a.submittedAt ? ` · ${TN.fmt.date(a.submittedAt)}` : ''}` : '', state: reached('submitted') ? 'done' : a.state === 'submitted' ? 'current' : 'upcoming' },
      { title: outcome, meta: a.outcomeAt ? TN.fmt.date(a.outcomeAt) : '', state: final ? 'done' : a.state === 'decision_pending' ? 'current' : 'upcoming' },
      { title: a.state === 'issued' ? 'Documents returned to the customer' : 'Customer informed', meta: a.documentsReturnedAt ? `${TN.fmt.date(a.documentsReturnedAt)}${a.documentsReturnedBy ? ` · ${esc(TN.person(a.documentsReturnedBy).name)}` : ''}` : a.customerInformedAt ? TN.fmt.date(a.customerInformedAt) : '', state: isClosed(a) ? 'done' : final ? 'current' : 'upcoming' },
    ];
  }

  function applicantCard(id, a, canWork) {
    const s = S[id];
    const work = canWork && !isClosed(a);
    const aid = `${id}-${a.seq}`;
    const checked = a.documents.filter((d) => d.status === 'checked').length;
    const ev = filesOf(id).filter((f) => f.applicant === a.seq);
    const outcomeDocs = ev.filter((f) => f.kind === 'authority_outcome');
    const docRows = a.documents.map((d) => {
      const did = `doc-${aid}-${d.code}`;
      const editable = work && a.state === 'docs_pending';
      return `<li class="m-0"><form novalidate class="flex flex-col gap-2 rounded-control border border-line px-3 py-2 sm:flex-row sm:items-end sm:justify-between" data-act="fv-doc-save"><input type="hidden" name="task" value="${id}"><input type="hidden" name="seq" value="${a.seq}"><input type="hidden" name="code" value="${d.code}"><div class="min-w-0 flex-1">${editable
        ? field(did, esc(d.label), select(did, 'status', [['missing', 'Missing'], ['received', 'Received'], ['checked', 'Checked']], d.status, ` data-change="fv-doc-change" data-orig="${d.status}"`))
        : `<p class="m-0 flex flex-wrap items-center justify-between gap-2"><span class="font-medium text-ink">${esc(d.label)}</span>${badge(d.status === 'checked' ? 'success' : d.status === 'received' ? 'info' : 'warning', { checked: 'Checked', received: 'Received', missing: 'Missing' }[d.status])}</p>`}<div role="status" aria-live="polite"></div></div>${editable ? `<button type="submit" class="${B.secondary}" disabled data-slot="button">Save<span class="sr-only"> ${esc(d.label)}</span></button>` : ''}</form></li>`;
    }).join('');
    const upload = work ? `<details class="${C.details}"${UI.open[`up-${aid}`] ? ' open' : ''}><summary class="${C.summaryF}">Upload a document for ${esc(a.name)}</summary><div class="${C.detailsBody}">${fileUpload(`up-${aid}`, `Upload a document for ${a.name}`, `<input type="hidden" name="task" value="${id}"><input type="hidden" name="seq" value="${a.seq}">`, [['applicant_document', 'Applicant document'], ['authority_outcome', 'Authority outcome document']])}</div></details>` : '';
    const evList = ev.length ? `<ul class="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="Stored files">${ev.map((f) => `<li class="m-0 flex flex-wrap items-center gap-2 text-sm">${ic('file-check', 'size-4 text-status-success')}<a href="#" data-act="fv-open-file" rel="noopener" class="${C.linkPlain}">${esc(f.name)}</a><span class="text-quiet">${FILE_KIND[f.kind]} · ${f.size}</span></li>`).join('')}</ul>` : '';
    let steps = '';
    if (work) {
      const k = `sub-${aid}`;
      const allChecked = a.documents.every((d) => d.status === 'checked');
      const v = UI.vals[k] || {};
      const fe = UI.ferr[k] || {};
      const stateBtn = (state, label, cls = B.secondary) => `<form novalidate class="flex flex-col gap-2" data-act="fv-visa-state"><div role="status" aria-live="polite"></div><input type="hidden" name="task" value="${id}"><input type="hidden" name="seq" value="${a.seq}"><input type="hidden" name="state" value="${state}"><div><button type="submit" class="${cls}" data-slot="button">${label}</button></div></form>`;
      if (a.state === 'docs_pending') {
        steps += `<form novalidate aria-label="Record the submission for ${esc(a.name)}" class="flex flex-col gap-3 rounded-control border border-line bg-canvas px-3.5 py-3" data-act="fv-visa-submit">${UI.err[k] ? errorSummary(esc(UI.err[k])) : '<div role="status" aria-live="polite"></div>'}<input type="hidden" name="task" value="${id}"><input type="hidden" name="seq" value="${a.seq}"><div class="grid gap-3 sm:grid-cols-2">${field(`${k}-ref`, 'Application or file reference', textInput(`${k}-ref`, 'reference', v.reference, { max: 120, invalid: !!fe.reference }), { error: fe.reference })}${field(`${k}-at`, 'Appointment (India time)', textInput(`${k}-at`, 'appointmentAt', v.appointmentAt, { type: 'datetime-local', describe: `${k}-at-hint` }), { optional: true, hint: 'If there is one.' })}${field(`${k}-place`, 'Appointment place', textInput(`${k}-place`, 'appointmentPlace', v.appointmentPlace, { max: 200 }), { optional: true, cls: 'sm:col-span-2' })}</div>${allChecked ? '' : `<p id="${k}-note" class="m-0 text-sm text-copy">All documents must be checked before the application is marked submitted.</p>`}<div><button type="submit" class="${allChecked ? B.primary : B.secondary}" data-slot="button"${allChecked ? '' : ` aria-describedby="${k}-note"`}>Record submission</button></div></form>`;
      }
      if (a.state === 'submitted') steps += stateBtn('decision_pending', 'Mark waiting for the decision');
      if (a.state === 'submitted' || a.state === 'decision_pending') {
        const ok = `out-${aid}`;
        const outV = (UI.vals[ok] || {}).state || 'issued';
        steps += `<form novalidate aria-label="Record the outcome for ${esc(a.name)}" class="flex flex-col gap-3 rounded-control border border-line bg-canvas px-3.5 py-3" data-act="fv-visa-outcome">${UI.err[ok] ? errorSummary(esc(UI.err[ok]), '') : '<div role="status" aria-live="polite"></div>'}<input type="hidden" name="task" value="${id}"><input type="hidden" name="seq" value="${a.seq}"><div class="grid gap-3 sm:grid-cols-2">${field(`${ok}-state`, 'Outcome', select(`${ok}-state`, 'state', [['issued', 'Issued'], ['refused', 'Refused']], outV, ' data-change="fv-outcome-change"'))}${field(`${ok}-doc`, 'Authority’s document', select(`${ok}-doc`, 'evidence', outcomeDocs.length ? outcomeDocs.map((f) => [f.id, f.name]) : [['', 'None uploaded yet']], outcomeDocs[0] && outcomeDocs[0].id), { hint: outcomeDocs.length ? '' : 'Upload the approval or refusal letter above first (kind: authority outcome document).' })}</div><div><button type="submit" class="${outV === 'refused' ? B.danger : B.primary}" data-slot="button">${outV === 'refused' ? 'Record refused' : 'Record issued'}</button></div></form>`;
      }
      if (a.state === 'issued' && !a.documentsReturnedAt) steps += stateBtn('documents_returned', 'Record documents returned to the customer');
      if ((a.state === 'refused' || a.state === 'withdrawn') && !a.customerInformedAt) steps += stateBtn('customer_informed', 'Record that the customer was informed');
      if (!['issued', 'refused', 'withdrawn'].includes(a.state)) steps += stateBtn('withdrawn', 'Withdraw this application', B.ghostWrap);
      steps = `<section aria-labelledby="app-${aid}-steps" class="flex flex-col gap-3"><h3 id="app-${aid}-steps" class="m-0 text-base font-semibold text-ink">Next for ${esc(a.name)}</h3>${steps}<p class="${C.small}">${OUTCOME_NEEDS_DOC}</p></section>`;
    }
    const [tone, word] = VISA_STATE[a.state];
    const desc = `Applicant ${a.seq} · ${a.type}${a.age ? `, ${a.age}` : ''}${isMine(s) || TN.is('manager') ? ` · born ${TN.fmt.date(a.born)} · ${a.nationality} · passport ${a.passport}` : ''}`;
    const body = `<div class="flex min-w-0 flex-col gap-5"><section aria-labelledby="app-${aid}-docs" class="flex flex-col gap-2"><h3 id="app-${aid}-docs" class="m-0 text-base font-semibold text-ink">Documents <span class="font-normal text-quiet">(${checked} of ${a.documents.length} checked)</span></h3><ul class="m-0 flex list-none flex-col gap-2 p-0">${docRows}</ul>${upload}${evList}</section>${steps}${isClosed(a) ? notice('success', 'This applicant is closed.', { icon: 'check-check' }) : ''}</div>${timeline(`Progress for ${esc(a.name)}`, applicantTimeline(a), true)}`;
    return card({ id: `app-${aid}-heading`, title: esc(a.name), desc, extra: badge(tone, word, { wrap: true, sr: 'Application: ', icon: tone === 'info' ? 'info' : undefined }), body, bodyCls: 'px-4.5 py-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]' });
  }

  /* PENDING: fees per traveller as cost lines for the customer Invoice (no selling price). */
  function visaInvoiceLines(id) {
    const s = S[id];
    const rows = s.applicants.map((a) => {
      const [tone, word] = VISA_STATE[a.state];
      return [
        { html: `<span class="font-semibold text-ink">${esc(a.name)}</span>` },
        { cls: 'text-sm', html: `${esc(s.visa.country)} · ${esc(s.visa.purpose)}` },
        { cls: 'whitespace-nowrap tabular-nums', html: inr(a.govFee) },
        { cls: 'whitespace-nowrap tabular-nums', html: a.serviceFee ? inr(a.serviceFee) : '—' },
        { html: badge(tone, word, { wrap: true, sr: 'Application: ', icon: tone === 'info' ? 'info' : undefined }) },
      ];
    });
    return `<div class="${C.card}" data-slot="card"><section aria-labelledby="vinv-${id}-heading"><div class="${C.cardHead}"><div class="min-w-0"><h2 class="${C.cardTitle}" id="vinv-${id}-heading">Visa lines for the invoice</h2><p class="${C.small}">Fees per traveller, as recorded for Accounts. These lines go on the customer’s Invoice; Sales sets the price, no price is shown here.</p></div>${ic('file-text', 'size-4 text-faint')}</div>${table({ label: 'Visa lines for the invoice', caption: `${TN.fmt.plural(rows.length, 'traveller')}`, heads: ['Traveller', 'Visa', 'Government fee', 'Service fee', 'Result'], rows })}</section></div>`;
  }

  function visaTask(params, q) {
    const id = params.taskId;
    const s = S[id];
    if (!s || s.dept !== 'visa') return notAvailable('#/app', 'Back to Home');
    const base = `/app/visa/${id}`;
    const tab = ['work', 'files', 'history'].includes(q.tab) ? q.tab : 'details';
    const taker = canWorkDept('visa');
    const mine = isMine(s);
    const done = s.taskStatus === 'done';
    const canWork = taker && mine && !done;
    const canClaim = taker && !s.assignee && s.taskStatus === 'new';
    const actions = canClaim
      ? `<form novalidate data-act="fv-take"><input type="hidden" name="task" value="${id}"><button type="submit" class="${B.primary}" data-slot="button">Take this task</button></form>`
      : canWork && tab !== 'work' ? `<a class="${B.linkLg}" href="#${base}?tab=work">Continue the applications</a>` : '';
    const next = done ? 'Nothing waiting.' : !s.assignee ? (canClaim ? 'take this task' : 'the Visa and passport desk takes this task') : mine ? 'finish the steps on the Work tab' : `${TN.person(s.assignee).name} works on this task`;
    const v = s.visa;
    const details = `<div class="flex flex-col gap-5">${card({ id: 'visa-details-heading', title: 'Service', bodyCls: C.bodyCol3, body: `<dl class="m-0 grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 max-sm:grid-cols-1"><dt class="text-sm font-semibold text-quiet">Service</dt><dd class="m-0">${esc(visaFactsLine(s))}</dd><dt class="text-sm font-semibold text-quiet">Government fee paid by</dt><dd class="m-0">${v.feePaidBy === 'company' ? 'Company pays (expense record for Accounts; no approval bypass)' : v.feePaidBy === 'customer' ? 'Customer pays the government fee directly' : 'Not decided yet'}</dd><dt class="text-sm font-semibold text-quiet">From</dt><dd class="m-0">Accepted version ${s.versionNo || 1} · ${TN.fmt.date(s.savedAt)}</dd><dt class="text-sm font-semibold text-quiet">Applicants</dt><dd class="m-0">${s.applicants.length}</dd></dl>${notice('restricted', 'Private applicant documents: Visa &amp; Passport desk and branch Manager only.')}` })}${mine ? `<div>${idProofsCard(id, s.applicants)}</div>` : ''}</div>`;
    const taken = !!s.assignee;
    const applicants = taken ? s.applicants.map((a) => applicantCard(id, a, canWork)).join('') : notice('info', 'Applicants appear when the task is taken.');
    const work = `<div class="flex flex-col gap-5">${applicants}${costCard(id, 'visa', canWork)}${canWork ? card({ id: `fee-${id}-heading`, title: 'Fee receipt', body: `${fileUpload(`up-${id}-fee`, 'Upload the fee receipt', `<input type="hidden" name="task" value="${id}">`, [['fee_receipt', 'Fee receipt']])}<p class="m-0 mt-2.5 text-sm text-quiet">${OUTCOME_NEEDS_DOC}</p>` }) : ''}${taken ? visaInvoiceLines(id) : ''}</div>`;
    let content = details;
    if (tab === 'work') content = work;
    else if (tab === 'files') content = filesPanel(id);
    else if (tab === 'history') content = historyPanel(id);
    return `<div class="${C.page}">
      ${backLink('#/app/visa', 'Back to Visa and passport tasks')}
      <header class="${C.headerTask}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">Visa task · ${esc(s.deal)}</p><h1 class="${C.h1}"><span class="block wrap-anywhere">${esc(visaTitle(s))}</span></h1><div class="${C.statusRow}">${visaStatus(s)}<span class="text-copy">Taken by: ${esc(takenBy(s))}</span></div></div>${actions ? `<div class="${C.actions}">${actions}</div>` : ''}</header>
      ${flashLine(id)}
      ${nextLine(next)}
      ${taskTabs(base, tab)}
      ${content}
    </div>`;
  }

  TN.page('/app/visa', { nav: '/app/visa', roles: visaRoles, title: 'Visa and passport tasks', render: visaQueue });
  TN.page('/app/visa/:taskId', { nav: '/app/visa', roles: visaRoles, title: 'Visa task', render: visaTask });

  /* ------------------------------------------------------------------
     Actions
     ------------------------------------------------------------------ */
  const fd = (el) => Object.fromEntries(new FormData(el));
  const focusLater = (sel) => setTimeout(() => { const e = document.querySelector(sel); if (e) { e.scrollIntoView({ block: 'center' }); e.focus(); } }, 0);
  const pushNotice = (to, text, deal) => TN.DATA.notices.unshift({ id: uid('n-fv-'), to, kind: 'notice', text, deal, at: NOW() });

  TN.act('fv-open-file', () => TN.toast('The file opens in a new tab. Every view is recorded.'));
  TN.act('fv-jump', (el) => focusLater(`#${el.dataset.target}`));

  TN.act('fv-take', (f) => {
    const id = fd(f).task; const s = S[id];
    if (s.assignee) { TN.toast('Someone at the desk took this task first.', 'danger'); TN.refresh(); return; }
    s.assignee = me(); s.taskStatus = 'in_progress'; s.takenAt = NOW();
    if (s.dept === 'visa') s.applicants.forEach((a) => { if (!a.state) { a.state = 'docs_pending'; a.documents = a.documents || docs(a.type === 'child' ? DOCS_CHILD : DOCS_ADULT, 'missing'); } });
    addH(id, 'Task taken');
    UI.flash[id] = s.dept === 'visa' ? 'The task is yours. Nothing has been filed yet.' : 'The task is yours. Taking it did not book the flight.';
    TN.refresh();
  });

  /* Costs */
  TN.act('fv-cost-new', (el) => { UI.open[`new-${el.dataset.id}`] = true; TN.refresh(); focusLater(`#cost-new-${el.dataset.id}-kind`); });
  TN.act('fv-cost-edit', (el) => { const k = `edit-${el.dataset.id}`; UI.open[k] = !UI.open[k]; delete UI.vals[k]; delete UI.err[k]; delete UI.ferr[k]; TN.refresh(); });
  TN.act('fv-cost-cancel', (el) => { const k = el.dataset.key; delete UI.open[k]; delete UI.vals[k]; delete UI.err[k]; delete UI.ferr[k]; TN.refresh(); });
  TN.act('fv-cost-field', (el) => { const f = el.closest('form'); const v = fd(f); UI.vals[v.key] = { ...UI.vals[v.key], ...v }; TN.refresh(); focusLater(`#${el.id}`); });
  TN.act('fv-cost-save', (f) => {
    const v = fd(f); const s = S[v.task]; const key = v.key;
    UI.vals[key] = v; delete UI.err[key]; UI.ferr[key] = {};
    const amount = Number(String(v.amount || '').replace(/[,\s₹]/g, ''));
    const fe = UI.ferr[key];
    if (!(amount > 0)) fe.amount = 'Enter the amount in rupees, more than ₹0.';
    if (v.paidBy === 'company') {
      if (s.dept === 'flight' && amount > FLIGHT_LIMIT) { UI.err[key] = 'Above ₹50,000 per purchase, a company payment goes through a supplier payment request. Record it as “Not yet”.'; fe.amount = OVER_LIMIT; }
      if (!v.mode) fe.mode = 'Choose how it was paid.';
      if (!v.paidOn || v.paidOn > TN.TODAY) fe.paidOn = 'Enter the payment date (today or earlier).';
    }
    if (Object.keys(fe).length) { UI.err[key] = UI.err[key] || 'Some details are missing or wrong.'; TN.refresh(); focusLater(`#cost-${key}-summary`); return; }
    const rec = { kind: v.kind, amount, paidBy: v.paidBy, mode: v.paidBy === 'company' ? v.mode : null, paidOn: v.paidBy === 'company' ? v.paidOn : null, reference: v.reference || null, proof: v.paidBy === 'company' ? v.proof || null : null, status: v.paidBy === 'company' ? 'draft' : null };
    if (v.entry) { const c = COSTS.find((x) => x.id === v.entry); Object.assign(c, rec); addH(v.task, 'Cost recorded'); }
    else { COSTS.push({ id: uid('dc-'), task: v.task, dept: s.dept, deal: s.deal, ...rec }); addH(v.task, 'Cost recorded'); }
    if (s.dept === 'flight' && rec.reference && !s.pnr && /^PNR\s+/i.test(rec.reference)) s.pnr = rec.reference.replace(/^PNR\s+/i, '');
    delete UI.open[key]; delete UI.vals[key]; delete UI.ferr[key];
    TN.toast(rec.status === 'draft' ? 'Cost saved as a draft. Send it to Accounts when the proof is chosen.' : 'Cost saved.');
    TN.refresh();
  });
  TN.act('fv-cost-send', (el) => {
    const c = COSTS.find((x) => x.id === el.dataset.id);
    if (!c.proof) { UI.err[`send-${c.id}`] = c.dept === 'flight' ? 'Choose the stored direct-payment proof under “Change this cost” first.' : 'Choose the stored fee receipt under “Change this cost” first.'; TN.refresh(); return; }
    delete UI.err[`send-${c.id}`];
    c.status = 'submitted'; c.submittedAt = NOW(); c.submittedBy = me(); c.returnReason = null;
    addH(c.task, 'Cost sent to Accounts');
    TN.toast('Sent to Accounts. A different Accounts person reviews it. This is not a payment approval.');
    TN.refresh();
  });

  /* PENDING: payment request from Flight (above ₹50,000 the branch Manager approves). */
  const airlines = () => Object.entries(TN.DATA.suppliers).filter(([, sp]) => sp.type === 'Airline');
  const routeFor = (deal, supplier, amount) => {
    const before = TN.DATA.supplierPayments.filter((p) => p.deal === deal && p.supplier === supplier && p.status !== 'returned').reduce((n, p) => n + p.amount, 0);
    return { before, total: before + amount, manager: before + amount > FLIGHT_LIMIT };
  };
  TN.act('fv-raise-sp', (el) => {
    const c = COSTS.find((x) => x.id === el.dataset.id); const s = S[c.task];
    const sup = s.supplier || airlines()[0][0];
    const r = routeFor(c.deal, sup, c.amount);
    TN.dialog({
      title: 'Raise a supplier payment request',
      body: `<form novalidate id="fv-sp-form" class="flex flex-col gap-3" data-act="fv-raise-sp-save"><input type="hidden" name="cost" value="${c.id}">
        <dl class="${C.dl}"><dt class="${C.dt}">Deal</dt><dd class="${C.dd}">${esc(c.deal)} · ${esc(familyName(c.deal))}</dd><dt class="${C.dt}">For</dt><dd class="${C.dd}">${COST_KIND[c.kind]} · ${esc(routeOf(s))}</dd><dt class="${C.dt}">Amount</dt><dd class="${C.ddMoney}">${inr(c.amount)}</dd></dl>
        ${field('fv-sp-supplier', 'Pay to', select('fv-sp-supplier', 'supplier', airlines().map(([k, sp]) => [k, sp.name]), sup))}
        ${field('fv-sp-due', 'Pay by', textInput('fv-sp-due', 'dueBy', '', { type: 'date' }), { hint: 'The date the airline or portal needs the money.' })}
        ${notice('info', r.manager ? `Above ₹50,000 for this supplier on this Deal${r.before ? ` (${inr(r.total)} with earlier requests)` : ''}, so the branch Manager approves it. Then Accounts pays it with the bank reference.` : 'At or below ₹50,000, so Accounts approves it and pays it with the bank reference.')}
        <div id="fv-sp-err"></div></form>`,
      footer: `<button type="button" class="${B.ghostMd}" data-slot="button" data-close>Cancel</button><button type="submit" form="fv-sp-form" class="${B.primaryMd}" data-slot="button">Raise the request</button>`,
    });
  });
  TN.act('fv-raise-sp-save', (f) => {
    const v = fd(f); const c = COSTS.find((x) => x.id === v.cost);
    if (!v.dueBy) { const e = f.querySelector('#fv-sp-err'); e.innerHTML = errorSummary('Enter the date the airline needs the money.', ''); e.firstChild.focus(); return; }
    const r = routeFor(c.deal, v.supplier, c.amount);
    const nums = TN.DATA.supplierPayments.map((p) => Number(p.id.split('-')[2]) || 0);
    const spId = `SP-26-${String(Math.max(...nums) + 1).padStart(4, '0')}`;
    TN.DATA.supplierPayments.unshift({ id: spId, deal: c.deal, service: c.task, supplier: v.supplier, amount: c.amount, part: 'Full payment', dueBy: v.dueBy, raisedBy: 'flight', raisedAt: TN.TODAY, status: r.manager ? 'waiting_manager' : 'requested', note: r.manager ? 'Ticket above ₹50,000: Flight cannot pay directly, so it is a payment request.' : undefined });
    c.paymentRequest = spId;
    addH(c.task, `Payment request ${spId} raised · ${r.manager ? 'waits for the branch Manager' : 'waits for Accounts'}`);
    pushNotice(r.manager ? ['manager'] : ['accounts', 'checker'], `Flight payment request ${spId}: ${TN.fmt.inr(c.amount)} to ${TN.supplier(v.supplier).name} for ${c.deal}. ${r.manager ? 'Above ₹50,000, so it waits for your approval.' : 'Waiting for Accounts.'}`, c.deal);
    TN.closeOverlay();
    TN.toast(`Payment request ${spId} raised. ${r.manager ? 'The branch Manager approves it.' : 'Accounts approves it.'}`);
    TN.refresh();
  });

  /* Uploads (one handler for proofs, e-tickets, fee receipts, applicant files). */
  TN.act('fv-upload', (f) => {
    const v = fd(f); const file = f.querySelector('input[type=file]').files[0];
    const key = v.formKey;
    UI.open[key] = true;
    if (!file) { UI.err[key] = 'Choose a file to upload.'; TN.refresh(); return; }
    if (file.size > 4 * 1024 * 1024) { UI.err[key] = 'This file is larger than 4 MB. Choose a smaller file.'; TN.refresh(); return; }
    delete UI.err[key]; delete UI.open[key];
    const size = file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
    FILES.push({ id: uid('df-'), task: v.task, kind: v.kind, applicant: v.seq ? Number(v.seq) : undefined, name: file.name, size, at: NOW() });
    addH(v.task, 'File added');
    TN.toast(`${file.name} stored privately.`);
    TN.refresh();
  });

  /* PENDING (DEC-59): ticket details and mark done. */
  TN.act('fv-save-pnr', (f) => {
    const v = fd(f); const s = S[v.task]; const pnr = String(v.pnr || '').trim().toUpperCase();
    UI.vals[`pnr-${v.task}`] = v.pnr;
    if (!/^[A-Z0-9]{5,8}$/.test(pnr)) { UI.ferr[`pnr-${v.task}`] = 'Enter the 5 to 8 letters and numbers from the e-ticket.'; TN.refresh(); focusLater(`#pnr-${v.task}`); return; }
    delete UI.ferr[`pnr-${v.task}`]; delete UI.vals[`pnr-${v.task}`];
    s.pnr = pnr; addH(v.task, 'Airline booking reference recorded');
    TN.toast('Ticket details saved.'); TN.refresh();
  });
  TN.act('fv-done', (el) => {
    const id = el.dataset.id; const s = S[id];
    const missing = flightChecklist(id).filter((i) => !i.done);
    if (missing.length) { UI.err[`done-${id}`] = `Still to do: ${missing.map((i) => `${i.label.charAt(0).toLowerCase() + i.label.slice(1)} (${i.why})`).join('; ')}.`; TN.refresh(); focusLater(`#done-${id}-summary`); return; }
    delete UI.err[`done-${id}`];
    TN.dialog({
      title: 'Mark this flight done?',
      body: `<div class="flex flex-col gap-3"><dl class="${C.dl}"><dt class="${C.dt}">Route</dt><dd class="${C.dd}">${esc(routeOf(s))}</dd><dt class="${C.dt}">PNR</dt><dd class="${C.dd}">${esc(s.pnr)}</dd><dt class="${C.dt}">Passengers</dt><dd class="${C.ddNum}">${s.passengers.length}</dd><dt class="${C.dt}">Deal</dt><dd class="${C.dd}">${esc(s.deal)}</dd></dl><p class="m-0 text-copy">${esc(ownerName(s.deal))} (Sales) and Accounts get a notice: ticket issued. After this, the ticket details and costs on this task are locked.</p></div>`,
      footer: `<button type="button" class="${B.ghostMd}" data-slot="button" data-close>Cancel</button><button type="button" class="${B.primaryMd}" data-slot="button" data-act="fv-done-confirm" data-id="${id}">Mark flight done</button>`,
    });
  });
  TN.act('fv-done-confirm', (el) => {
    const id = el.dataset.id; const s = S[id];
    s.taskStatus = 'done'; s.doneAt = NOW(); s.doneBy = me();
    const airline = (s.segments[0].flight || '').split(' ')[0] || 'Airline';
    addH(id, 'Flight marked done · ticket issued', { detail: `Notice sent to ${ownerName(s.deal)} (Sales) and Accounts.` });
    pushNotice(['sales', 'accounts', 'checker'], `Flight ticket issued for ${familyName(s.deal)}: ${airline} PNR ${s.pnr}.`, s.deal);
    TN.closeOverlay();
    UI.flash[id] = 'Flight marked done. Sales and Accounts were told the ticket is issued.';
    TN.refresh();
  });

  /* Visa desk */
  const applicant = (id, seq) => S[id].applicants.find((a) => a.seq === Number(seq));
  TN.act('fv-doc-change', (el) => { const b = el.closest('form').querySelector('button[type=submit]'); if (b) b.disabled = el.value === el.dataset.orig; });
  TN.act('fv-outcome-change', (el) => { const f = el.closest('form'); const v = fd(f); UI.vals[`out-${v.task}-${v.seq}`] = { state: v.state }; TN.refresh(); focusLater(`#${el.id}`); });
  TN.act('fv-doc-save', (f) => {
    const v = fd(f); const a = applicant(v.task, v.seq);
    a.documents.find((d) => d.code === v.code).status = v.status;
    addH(v.task, `Applicant ${a.seq}: details updated`);
    TN.toast('Saved.'); TN.refresh();
  });
  TN.act('fv-visa-submit', (f) => {
    const v = fd(f); const a = applicant(v.task, v.seq); const k = `sub-${v.task}-${v.seq}`;
    UI.vals[k] = v; UI.ferr[k] = {}; delete UI.err[k];
    if (!a.documents.every((d) => d.status === 'checked')) { UI.err[k] = 'All required documents must be checked before the application is marked submitted.'; TN.refresh(); return; }
    if (!String(v.reference || '').trim()) { UI.ferr[k].reference = 'Enter the reference the authority gave.'; UI.err[k] = 'Enter the reference the authority gave.'; TN.refresh(); return; }
    Object.assign(a, { state: 'submitted', reference: v.reference.trim(), submittedAt: TN.TODAY, appointmentAt: v.appointmentAt || null, appointmentPlace: v.appointmentPlace || null });
    delete UI.vals[k]; delete UI.ferr[k];
    addH(v.task, `Applicant ${a.seq}: Submitted (reference recorded)`);
    UI.flash[v.task] = 'Submission recorded. Nothing is issued until the authority decides.';
    TN.refresh();
  });
  function closeIfAllDone(id) {
    const s = S[id];
    if (s.applicants.every(isClosed) && s.taskStatus !== 'done') {
      s.taskStatus = 'done'; s.doneAt = NOW(); addH(id, 'Task completed', { by: null });
      UI.flash[id] = 'Every applicant is closed, so the task is complete.';
    }
  }
  TN.act('fv-visa-state', (f) => {
    const v = fd(f); const a = applicant(v.task, v.seq);
    const words = { decision_pending: ['Waiting for decision', 'Marked as waiting for the authority’s decision.'], documents_returned: ['Documents returned to the customer', 'Documents recorded as returned.'], customer_informed: ['Customer informed', 'Recorded that the customer was informed.'], withdrawn: ['application withdrawn', 'Application withdrawn.'] }[v.state];
    if (v.state === 'decision_pending' || v.state === 'withdrawn') a.state = v.state;
    if (v.state === 'withdrawn') a.outcomeAt = TN.TODAY;
    if (v.state === 'documents_returned') { a.documentsReturnedAt = TN.TODAY; a.documentsReturnedBy = me(); }
    if (v.state === 'customer_informed') a.customerInformedAt = TN.TODAY;
    addH(v.task, `Applicant ${a.seq}: ${words[0]}`);
    UI.flash[v.task] = words[1];
    closeIfAllDone(v.task);
    TN.refresh();
  });
  TN.act('fv-visa-outcome', (f) => {
    const v = fd(f); const s = S[v.task]; const a = applicant(v.task, v.seq); const k = `out-${v.task}-${v.seq}`;
    UI.vals[k] = { state: v.state };
    if (!v.evidence) { UI.err[k] = 'Upload the authority’s outcome document first. ' + OUTCOME_NEEDS_DOC.split('. ')[0] + '.'; TN.refresh(); return; }
    delete UI.err[k]; delete UI.vals[k];
    a.state = v.state; a.outcomeAt = TN.TODAY;
    addH(v.task, `Applicant ${a.seq}: ${v.state === 'issued' ? 'Issued' : 'Refused'}`);
    /* PENDING: visa result notice to the Deal's Sales owner. */
    const issued = s.applicants.filter((x) => x.state === 'issued').length;
    const waiting = s.applicants.filter((x) => x.state === 'submitted' || x.state === 'decision_pending').length;
    const text = `Visa result: ${s.visa.country === 'United Arab Emirates' ? 'UAE' : s.visa.country} visa ${v.state === 'issued' ? 'issued' : 'refused'} for ${a.name}. ${issued} of ${s.applicants.length} issued${waiting ? `, ${waiting} still with the authority` : ''}.`;
    pushNotice(['sales'], text, s.deal);
    addH(v.task, `Visa result sent to ${ownerName(s.deal)} (Sales)`, { by: null, detail: text.replace('Visa result: ', '') });
    UI.flash[v.task] = `Outcome recorded with the authority’s document. ${ownerName(s.deal)} (Sales) has a notice.`;
    TN.refresh();
  });

  /* ------------------------------------------------------------------
     Home rows ("What needs you"). "Not taken" is already Agent A's own row
     ("... not taken yet, or yours in progress"), so it is not repeated here.
     ------------------------------------------------------------------ */
  const myFlights = () => deptTasks('flight').filter((t) => isMine(t.s) && t.s.taskStatus !== 'done');
  const myVisas = () => deptTasks('visa').filter((t) => isMine(t.s) && t.s.taskStatus !== 'done');
  const returnedOf = (tasks) => tasks.filter((t) => costsOf(t.id).some((c) => c.status === 'returned'));
  const firstHref = (tasks, base, fallback) => (tasks.length ? `#/app/${base}/${tasks[0].id}?tab=work` : fallback);
  const section = 'What needs you';
  TN.homeRow({ roles: ['flight'], section, label: 'Tickets to mark done', count: () => myFlights().filter((t) => readyToFinish(t.id)).length, get href() { return firstHref(myFlights().filter((t) => readyToFinish(t.id)), 'flight', '#/app/flight?show=mine'); } });
  TN.homeRow({ roles: ['flight'], section, label: 'Flight costs returned by Accounts', count: () => returnedOf(myFlights()).reduce((n, t) => n + costsOf(t.id).filter((c) => c.status === 'returned').length, 0), get href() { return firstHref(returnedOf(myFlights()), 'flight', '#/app/flight?show=mine'); } });
  TN.homeRow({ roles: ['visa'], section, label: 'Travellers waiting for a visa result', count: () => myVisas().reduce((n, t) => n + t.s.applicants.filter((a) => a.state === 'submitted' || a.state === 'decision_pending').length, 0), get href() { return firstHref(myVisas(), 'visa', '#/app/visa?show=mine'); } });
  TN.homeRow({ roles: ['visa'], section, label: 'Visa costs returned by Accounts', count: () => returnedOf(myVisas()).reduce((n, t) => n + costsOf(t.id).filter((c) => c.status === 'returned').length, 0), get href() { return firstHref(returnedOf(myVisas()), 'visa', '#/app/visa?show=mine'); } });
})();
