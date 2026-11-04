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
    users: ['users', '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'],
    trash: ['trash-2', '<path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>'],
    history: ['rotate-ccw-clock lucide-history', '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path><path d="M12 7v5l4 2"></path>'],
  };
  const ic = (name, cls) => {
    const [c, p] = ICONS[name] || ICONS.info;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${c}${cls ? ' ' + cls : ''}" aria-hidden="true">${p}</svg>`;
  };

  /* ------------------------------------------------------------------
     Small markup helpers (live components)
     ------------------------------------------------------------------ */
  const inr = (n) => (n == null || n === '' ? '—' : TN.fmt.inr(n));
  /* Date-time on the Flight screens: "27 Oct 26 19:41" (24-hour, user request 4 Nov 2026). */
  const dtShort = (v) => { if (!v) return '—'; const [d, tm = ''] = String(v).split(' '); return `${dShort(d)}${tm ? ` ${tm.slice(0, 5)}` : ''}`; };
  /* Typed dates: "2 Dec 26", "2 dec 2026", "2/12/26", "2-12-2026" or "2026-12-02" -> "2026-12-02". */
  function parseDateText(v) {
    const x = String(v || '').trim().toLowerCase(); if (!x) return '';
    const MON3 = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']; let m; let y; let mo; let d;
    if ((m = x.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) [y, mo, d] = [+m[1], +m[2], +m[3]];
    else if ((m = x.match(/^(\d{1,2})[\s\-\/.]+([a-z]{3,})[\s\-\/.,]+(\d{2}|\d{4})$/))) { d = +m[1]; mo = MON3.indexOf(m[2].slice(0, 3)) + 1; y = +m[3]; }
    else if ((m = x.match(/^(\d{1,2})[\-\/.](\d{1,2})[\-\/.](\d{2}|\d{4})$/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }
    else return '';
    if (y < 100) y += 2000; if (!(mo >= 1 && mo <= 12 && d >= 1 && d <= 31)) return '';
    const dt = new Date(y, mo - 1, d); if (dt.getMonth() !== mo - 1) return '';
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }
  /* Typed times, always 24-hour: "1035", "10:35", "7:05 pm" -> "10:35", "19:05". */
  function parseTimeText(v) {
    const x = String(v || '').trim().toLowerCase().replace(/\s+/g, ''); if (!x) return '';
    const m = x.match(/^(\d{1,2}):?(\d{2})(am|pm)?$/); if (!m) return '';
    let h = +m[1]; const mi = +m[2]; if (m[3] === 'pm' && h < 12) h += 12; if (m[3] === 'am' && h === 12) h = 0;
    return h > 23 || mi > 59 ? '' : `${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
  }
  const TIME_LIST = `<datalist id="fv-time-list">${Array.from({ length: 288 }, (_, i) => `<option value="${String(Math.floor(i / 12)).padStart(2, '0')}:${String((i % 12) * 5).padStart(2, '0')}"></option>`).join('')}</datalist>`;
  const fvVal = (el) => ('fvDate' in el.dataset ? parseDateText(el.value) || el.value : 'fvTime' in el.dataset ? parseTimeText(el.value) || el.value : el.value);
  /* Short date for the Flight screens (user request 3 Nov 2026): "14 Nov 26". */
  const dShort = (iso) => { if (!iso) return '—'; const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return String(iso); return `${Number(m[3])} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(m[2]) - 1]} ${m[1].slice(2)}`; }; // TN.fmt.inr already shows paise (".00"); adding it again showed "₹48,000.00.00"
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
  const textInput = (id, name, value, { type = 'text', max, invalid, describe, readonly } = {}) =>
    `<input type="${type}" class="${C.input}" data-slot="input" id="${id}" autocomplete="off"${max ? ` maxlength="${max}"` : ''} name="${name}" value="${esc(value || '')}"${readonly ? ' readonly' : ''}${invalid ? ` aria-invalid="true" aria-describedby="${id}-error"` : describe ? ` aria-describedby="${describe}"` : ''}>`;
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
    segments: [{ from: 'JDH', to: 'GOX', date: '2026-11-14', flight: 'IndiGo 6E 6142', time: '10:35', fareBreakup: { adult: 8400, child: 7200 } }, { from: 'GOX', to: 'JDH', date: '2026-11-18', flight: 'IndiGo 6E 6143', time: '16:20', fareBreakup: { adult: 8400, child: 7200 } }],
    preferredTime: 'Morning departure', cabin: 'Economy', notes: 'Child needs a seat next to a parent.',
    passengers: [{ name: 'Rohan Agarwal', type: 'adult' }, { name: 'Anita Agarwal', type: 'adult' }, { name: 'Vihaan Agarwal', type: 'child', age: 7 }],
    versionNo: 1, savedAt: '2026-10-19 12:10', createdAt: '2026-10-19 16:40', takenAt: '2026-10-20 10:05',
  });
  Object.assign(S['s-455-f'], {
    segments: [{ from: 'JDH', to: 'DEL', date: '2026-12-02', fareBreakup: { adult: 5250 } }, { from: 'DEL', to: 'COK', date: '2026-12-02', fareBreakup: { adult: 5250 } }, { from: 'COK', to: 'DEL', date: '2026-12-08', fareBreakup: { adult: 5250 } }, { from: 'DEL', to: 'JDH', date: '2026-12-08', fareBreakup: { adult: 5250 } }],
    preferredTime: 'Reach Kochi before 4 pm', cabin: 'Economy', notes: 'Honeymoon couple. Seats together if possible.',
    passengers: [{ name: 'Meenal Khatri', type: 'adult' }, { name: 'Arjun Khatri', type: 'adult' }],
    versionNo: 1, savedAt: '2026-10-26 11:30', createdAt: '2026-10-26 11:32',
  });
  Object.assign(S['s-390-f'], {
    segments: [{ from: 'AMD', to: 'DXB', date: '2026-11-20', flight: 'Emirates EK 539', time: '04:25', fareBreakup: { adult: 17000, child: 15000 } }, { from: 'DXB', to: 'AMD', date: '2026-11-25', flight: 'Emirates EK 538', time: '22:05', fareBreakup: { adult: 17000, child: 15000 } }],
    preferredTime: 'Any', cabin: 'Economy', notes: 'Family drives to Ahmedabad. 30 kg baggage each.',
    passengers: [{ name: 'Suresh Bhandari', type: 'adult' }, { name: 'Anita Bhandari', type: 'adult' }, { name: 'Kabir Bhandari', type: 'child', age: 12 }, { name: 'Myra Bhandari', type: 'child', age: 8 }],
    versionNo: 2, savedAt: '2026-10-14 13:50', createdAt: '2026-10-14 15:10', takenAt: '2026-10-15 11:20',
    taskStatus: 'done', doneAt: '2026-10-26 17:42', doneBy: 'flight',
  });
  Object.assign(S['s-301-f'], {
    segments: [{ from: 'DEL', to: 'SIN', date: '2026-11-01', flight: 'Singapore Airlines SQ 403', time: '23:45', fareBreakup: { adult: 19500 } }, { from: 'SIN', to: 'DEL', date: '2026-11-05', flight: 'Singapore Airlines SQ 406', time: '20:15', fareBreakup: { adult: 19500 } }],
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

  /* Preview seed task metadata only fills gaps on existing booking records. */
  Object.values(S).filter((s) => s.dept === 'flight').forEach((s) => {
    s.flightRequest = s.flightRequest || { segments: (s.segments || []).map((g) => ({ ...g })), preferredTime: s.preferredTime || '', cabin: s.cabin || '', notes: s.notes || '', passengers: (s.passengers || []).map((p) => ({ ...p })), versionNo: s.versionNo || 1 };
    s.flightAvailability = s.flightAvailability || (s.taskStatus === 'done' ? 'requested' : 'unchecked');
    s.flightProposals = s.flightProposals || [];
  });

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
  const visaFactsLine = (s) => { const v = s.visa; return [v.country, v.purpose, `travel ${dShort(v.travelDate)}`, v.applyBy ? `apply by ${dShort(v.applyBy)}` : null].filter(Boolean).join(' · '); };
  const fileName = (id) => (FILES.find((f) => f.id === id) || {}).name;
  const ownerName = (dealId) => { const d = TN.deal(dealId); return d ? TN.person(d.owner).name : 'Sales'; };
  const familyName = (dealId) => { const d = TN.deal(dealId); return d ? d.title.split(' · ')[0] : dealId; };

  function flightStatus(s) {
    const k = statusKey(s);
    if (k === 'not_started') return badge('neutral', 'Waiting to be taken', { wrap: true, icon: 'hourglass', sr: 'Task status: ' });
    if (k === 'completed') return badge('success', 'Done · ticket issued', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    if (k === 'supplier_confirmed') return badge('success', 'Confirmed by supplier', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    return badge('info', flightWord(s), { wrap: true, icon: 'pencil-line', sr: 'Task status: ' });
  }
  function visaStatus(s) {
    const k = statusKey(s);
    if (k === 'not_started') return badge('neutral', 'Waiting to be taken', { wrap: true, icon: 'hourglass', sr: 'Task status: ' });
    if (k === 'completed') return badge('success', 'Completed', { wrap: true, icon: 'circle-check', sr: 'Task status: ' });
    return badge('info', 'In progress', { wrap: true, icon: 'pencil-line', sr: 'Task status: ' });
  }
  const idOf = (s) => s.id || Object.keys(S).find((k) => S[k] === s);
  const canEditFlight = (s) => !!s && s.dept === 'flight' && TN.is('flight') && isMine(s) && s.taskStatus === 'in_progress';
  const canPropose = (s) => canEditFlight(s) && !s.flightTicket?.issued && latestProposal(s)?.status !== 'pending';
  const requestOf = (s) => s.flightRequest || { segments: s.segments || [], preferredTime: s.preferredTime || '', cabin: s.cabin || '', notes: s.notes || '', passengers: s.passengers || [], versionNo: s.versionNo || 1 };
  const passengerCounts = (s) => {
    const deal = TN.deal(s.deal) || {};
    const people = requestOf(s).passengers || s.passengers || [];
    const count = (type) => people.filter((p) => String(p.type || '').toLowerCase() === type).length;
    return { adult: Number(deal.adults ?? count('adult') ?? 0), child: Number(deal.children ?? count('child') ?? 0), infant: Number(deal.infants ?? count('infant') ?? 0) };
  };
  const fareTypes = (s) => Object.entries(passengerCounts(s)).filter(([, count]) => count > 0).map(([type]) => type);
  const fareTotal = (s, rows) => {
    const counts = passengerCounts(s);
    return (rows || []).reduce((total, raw) => {
      const fareBreakup = normalizeSegment(raw).fareBreakup || {};
      return total + fareTypes(s).reduce((sum, type) => sum + (Number(fareBreakup[type]) || 0) * counts[type], 0);
    }, 0);
  };
  const latestProposal = (s) => (s.flightProposals || []).at(-1);
  /* Latest proposal for one sector (null = whole-trip proposal). Each sector is decided on its own. */
  const latestFor = (s, sectorIndex) => (s.flightProposals || []).filter((p) => (p.sectorIndex ?? null) === (sectorIndex ?? null)).at(-1);
  const validPnr = (value) => /^[A-Z0-9]{5,8}$/.test(norm(value));
  const norm = (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, ' ');
  const segmentKey = (g) => [g.from, g.to, g.departureDate || g.date, g.arrivalDate || g.departureDate || g.date, g.departure || g.time, g.arrival, g.airline, g.flightNumber, g.class || g.cabin].map(norm).join('|');
  const itineraryEqual = (a, b) => a.length === b.length && a.every((g, i) => segmentKey(g) === segmentKey(b[i]));
  const bookingBasis = (s) => {
    const rows = cloneSegments(requestOf(s).segments);
    (s.flightProposals || []).filter((p) => p.status === 'approved' && p.sectorIndex != null).forEach((p) => {
      if (rows[p.sectorIndex]) rows[p.sectorIndex] = { ...p.proposedSegment, fareBreakup: p.proposedSegment?.fareBreakup || {} };
    });
    const whole = latestProposal(s);
    return whole?.status === 'approved' && whole.sectorIndex == null ? cloneSegments(whole.segments) : rows;
  };
  const cloneSegments = (rows) => rows.map((g) => ({ ...g }));
  const workSegments = (s) => {
    const basis = cloneSegments(bookingBasis(s));
    (s.flightTicket?.segments || []).forEach((ticket, index) => {
      if (basis[index] && validPnr(ticket.pnr)) basis[index] = { ...basis[index], ...ticket };
    });
    return basis;
  };
  const blankSegment = () => ({ from: '', to: '', departureDate: '', arrivalDate: '', departure: '', arrival: '', airline: '', flightNumber: '', pnr: '', ticketNumbers: '' });
  function normalizeSegment(g) {
    const flight = String(g.flight || '').trim().match(/^(.*?)\s+([A-Z0-9]{2})\s*(\d+\w?)$/i);
    return { from: norm(g.from), to: norm(g.to), departureDate: g.departureDate || g.date || '', arrivalDate: g.arrivalDate || '', departure: g.departure || g.time || '', arrival: g.arrival || '', airline: g.airline || flight?.[1] || '', flightNumber: g.flightNumber || (flight ? `${flight[2]} ${flight[3]}` : ''), class: g.class || g.cabin || '', pnr: norm(g.pnr), ticketNumbers: String(g.ticketNumbers || '').trim(), fareBreakup: g.fareBreakup || { adult: '', child: '', infant: '' } };
  }
  function segmentErrors(rows, ticketing) {
    if (!rows?.length) return ['Add at least one flight sector.'];
    const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    return rows.flatMap((raw, i) => {
      const g = normalizeSegment(raw); const n = i + 1; const out = [];
      if (!g.from || !g.to || g.from === g.to || !validDate(g.departureDate)) out.push(`Sector ${n} needs different origin and destination and a valid travel date.`);
      if (!validDate(g.arrivalDate) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(g.departure) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(g.arrival) || !g.airline || !g.flightNumber) out.push(`Sector ${n} needs airline, flight number, departure time, arrival time and arrival date.`);
      if (ticketing && !/^[A-Z0-9]{5,8}$/.test(g.pnr)) out.push(`Sector ${n} needs a 5–8 character PNR.`);
      return out;
    });
  }
  function matchesRequest(rows, request) {
    const keys = ['from', 'to', 'departureDate', 'arrivalDate', 'departure', 'arrival', 'airline', 'flightNumber'];
    return request.length > 0 && rows.length === request.length && request.every((raw, i) => {
      const expected = normalizeSegment(raw); const actual = normalizeSegment(rows[i]);
      return keys.every((key) => !expected[key] || norm(expected[key]) === norm(actual[key]));
    });
  }
  function authorizedItinerary(s, rows, version) {
    const proposals = s.flightProposals || [];
    const pending = proposals.some((p) => p.status === 'pending');
    if (pending) return false;
    const approved = proposals.filter((p) => p.status === 'approved');
    const rejected = proposals.filter((p) => p.status === 'rejected');
    if (approved.length) {
      return approved.every((p) => p.sectorIndex == null
        ? version === p.version && itineraryEqual(rows, p.segments)
        : !!rows[p.sectorIndex] && itineraryEqual([rows[p.sectorIndex]], [p.proposedSegment || p.segments[p.sectorIndex]]));
    }
    if (rejected.length && rejected.some((p) => p.sectorIndex == null)) return false;
    return version == null && matchesRequest(rows, requestOf(s).segments);
  }
  function sectorStatus(s, index) {
    const proposal = latestFor(s, index);
    if (proposal?.status === 'pending') return 'Pending Sales approval';
    if (proposal?.status === 'rejected') return 'Rejected alternative';
    const segment = s.flightTicket?.segments?.[index];
    if (segment && validPnr(segment.pnr)) return 'Confirmed';
    if (proposal?.status === 'approved') return 'Approved alternative';
    return 'Not confirmed';
  }
  /* ------------------------------------------------------------------
     Sector workflow (flight_changes.md, FLIGHT_SECTOR_WORKFLOW.md)
     s.flightSectors: one record per sector.
       kind: 'original' (from the booking) | 'alternative' (parent = original id) | 'added' (made in Confirmation)
       pax: passenger numbers (index in the booking's passenger list) the sector applies to.
       tickets: passenger-wise rows { id, pax, crsType, crsPnr, airlinePnr, ticketNumber, status: 'pending' | 'confirmed', confirmedAt, confirmedBy }.
     A passenger's active sector on a route = the newest alternative that includes them, otherwise the original.
     ------------------------------------------------------------------ */
  const CRS_TYPES = ['Amadeus', 'Galileo', 'Sabre', 'Airline direct', 'Other'];
  const SECTOR_FIELDS = ['airline', 'flightNumber', 'from', 'to', 'class', 'departureDate', 'departure', 'arrivalDate', 'arrival'];
  const paxList = (s) => (requestOf(s).passengers?.length ? requestOf(s).passengers : s.passengers || []);
  const paxName = (s, p) => paxList(s)[p]?.name || `Passenger ${Number(p) + 1}`;
  const allPax = (s) => paxList(s).map((_, i) => i);
  const pickFields = (g) => Object.fromEntries(SECTOR_FIELDS.map((k) => [k, g[k] || '']));
  /* Ticket number +1, keeping the format and leading zeros ("176-2410394509" -> "176-2410394510"). */
  function nextTicket(t) {
    const m = String(t || '').trim().match(/^(.*?)(\d+)(\D*)$/);
    if (!m) return '';
    return m[1] + String(BigInt(m[2]) + 1n).padStart(m[2].length, '0') + m[3];
  }
  const paxType = (s, p) => String(paxList(s)[p]?.type || 'adult').toLowerCase();
  /* New passenger row. Copies CRS / PNR from the row above, ticket number +1, and the fare when the passenger type is the same. */
  /* New passenger row. Copies CRS / PNR from the row above and the ticket number +1. The fare is no longer typed per row:
     it comes from the sector's Adult / Child / Infant fare when the passenger is confirmed (flight_changes_2.md 6). */
  const newRow = (pax, from) => ({ id: uid('ft-'), pax, crsType: from?.crsType || '', crsPnr: from?.crsPnr || '', airlinePnr: from?.airlinePnr || '', ticketNumber: from?.ticketNumber ? nextTicket(from.ticketNumber) : '', fare: '', status: 'pending' });
  function sectorsOf(s) {
    if (!s.flightSectors) {
      const all = allPax(s);
      s.flightSectors = requestOf(s).segments.map((raw, i) => {
        const g = normalizeSegment(raw);
        /* One Flight task can hold several flights from Book now; each keeps the passengers Sales chose for it. */
        const ids = raw.passengerIds; const pax = Array.isArray(ids) ? all.filter((p) => ids.includes(paxList(s)[p]?.id)) : all.slice();
        return { id: `fs-${i + 1}`, kind: 'original', no: String(i + 1).padStart(2, '0'), ...pickFields({ ...g, arrivalDate: g.arrivalDate || g.departureDate, class: g.class || requestOf(s).cabin || '' }), pax, booked: pax.slice(), fares: {}, createdAt: s.createdAt, tickets: pax.length ? [newRow(pax[0])] : [] };
      });
    }
    return s.flightSectors;
  }
  /* A "line" is an original or added sector plus its alternatives (each alternative's parent is the line's first sector). */
  const rootOf = (sec) => (sec.kind === 'alternative' ? sec.parent : sec.id);
  /* Every alternative of a line, in the order saved (rejected ones too, for history). */
  const allAltsOf = (s, rootId) => sectorsOf(s).filter((x) => x.kind === 'alternative' && x.parent === rootId);
  /* Alternatives that hold passengers: waiting for Sales or approved. A rejected one gives its passengers back. */
  const altsOf = (s, rootId) => allAltsOf(s, rootId).filter((x) => x.approval !== 'rejected');
  const isRejected = (sec) => sec.kind === 'alternative' && sec.approval === 'rejected';
  const waitsForSales = (sec) => sec.kind === 'alternative' && sec.approval === 'pending';
  /* Passengers this sector still applies to (passengers moved to a later alternative of the same line are left out). */
  function activePax(s, sec) {
    if (isRejected(sec) || sec.deleted) return [];
    const alts = altsOf(s, rootOf(sec));
    const later = sec.kind === 'alternative' ? alts.slice(alts.indexOf(sec) + 1) : alts;
    /* line.out: passengers moved from this flight to another sector with + Add Sector. Only the new sector counts for them. */
    const out = sectorsOf(s).find((x) => x.id === rootOf(sec))?.out || [];
    return sec.pax.filter((p) => !later.some((a) => a.pax.includes(p)) && !out.includes(p));
  }
  const activeRows = (s, sec) => { const act = activePax(s, sec); return sec.tickets.filter((t) => act.includes(Number(t.pax))); };
  const confirmedRow = (s, sec, p) => sec.tickets.find((t) => Number(t.pax) === p && t.status === 'confirmed');
  function sectorState(s, sec) {
    if (sec.deleted) return { key: 'replaced', label: 'Deleted', req: [], done: 0 };
    if (isRejected(sec)) return { key: 'rejected', label: 'Rejected by Sales', req: [], done: 0 };
    const req = activePax(s, sec);
    if (req.length && waitsForSales(sec)) return { key: 'approval', label: 'Waiting for Sales approval', req, done: 0 };
    /* No passengers left: replaced (they moved to an alternative → history), or simply nobody assigned yet (still shown). */
    if (!req.length) return sec.pax.length || sec.kind === 'alternative' ? { key: 'replaced', label: 'Replaced by alternative', req, done: 0 } : { key: 'empty', label: 'No passengers assigned', req, done: 0 };
    const done = req.filter((p) => confirmedRow(s, sec, p)).length;
    const key = done === 0 ? 'pending' : done === req.length ? 'confirmed' : 'partial';
    return { key, label: { pending: sec.kind === 'alternative' ? 'Pending confirmation' : 'Pending', partial: 'Partially confirmed', confirmed: 'Confirmed' }[key], req, done };
  }
  /* Journey segment (flight_changes_2.md 9): passengers are assigned per journey, not across the whole booking.
     An original sector is a journey; an added sector belongs to the journey chosen for it (or starts a new one). */
  function segOf(s, sec) {
    if (sec.kind === 'alternative') { const root = sectorsOf(s).find((x) => x.id === sec.parent); return root ? segOf(s, root) : sec.parent; }
    return sec.kind === 'added' && sec.seg ? sec.seg : sec.id;
  }
  /* Sectors made for one passenger's own itinerary (approved "Add New Table") are not shared journeys. */
  const journeys = (s) => sectorsOf(s).filter((x) => !x.itin && (x.kind === 'original' || (x.kind === 'added' && !x.seg)));
  /* Passenger itineraries ("Add New Table", user request 3 Nov 2026). s.paxItins: { id, pax, status: draft | pending |
     approved | rejected | discarded | replaced, rows (proposed flights), prev (snapshot of the old flights), secIds }. */
  const itinsOf = (s) => (s.paxItins = s.paxItins || []);
  const OPEN_ITIN = ['draft', 'pending', 'rejected'];
  const openItin = (s, p) => itinsOf(s).find((x) => x.pax === p && OPEN_ITIN.includes(x.status));
  const approvedItin = (s, p) => itinsOf(s).find((x) => x.pax === p && x.status === 'approved');
  /* A passenger with their own table (draft, pending, rejected or approved) is no longer listed in the main table
     (user request 3 Nov 2026). Discarding the table brings them back. */
  const hasOwnTable = (s, p) => itinsOf(s).some((x) => x.pax === p && ['draft', 'pending', 'rejected', 'approved'].includes(x.status));
  const mainPax = (s) => allPax(s).filter((p) => !hasOwnTable(s, p));
  const isLive = (s, sec) => !['replaced', 'rejected'].includes(sectorState(s, sec).key);
  const liveIn = (s, seg) => sectorsOf(s).filter((x) => segOf(s, x) === seg && isLive(s, x));
  /* The one live sector a passenger is on for a journey (or none). */
  const holderOf = (s, seg, p) => sectorsOf(s).find((x) => segOf(s, x) === seg && activePax(s, x).includes(p));
  const unassignedIn = (s, seg) => allPax(s).filter((p) => !holderOf(s, seg, p));
  /* Journeys every passenger must fly: the booked ones. An extra journey added later only counts for its own passengers. */
  const neededJourneys = (s) => sectorsOf(s).filter((x) => x.kind === 'original');
  /* A booked flight needs only the passengers Sales booked on it (booked), not everyone in the booking. */
  const gapsIn = (s, j) => (j.kind === 'original' ? unassignedIn(s, j.id).filter((p) => (j.booked || allPax(s)).includes(p) && !approvedItin(s, p)) : []);
  /* Can a passenger be moved to a new sector on this journey? Not if their ticket there is confirmed or Sales is deciding. */
  const moveLock = (s, seg, p) => { if (openItin(s, p)) return 'has its own new itinerary'; const h = holderOf(s, seg, p); if (!h) return ''; if (confirmedRow(s, h, p)) return `ticket confirmed on ${flightNo(h)}`; if (waitsForSales(h)) return `waiting for Sales on ${flightNo(h)}`; return ''; };
  /* "AI 470", not "AI AI 470", when the airline is only the carrier code. */
  const flightNo = (g) => (g.airline && String(g.flightNumber || '').startsWith(`${g.airline} `) ? g.flightNumber : [g.airline, g.flightNumber].filter(Boolean).join(' ')) || '—';
  /* Sector numbers are no longer shown (flight_changes_2.md 3), so messages name the flight and route instead. */
  const secName = (sec) => `${flightNo(sec)} ${sec.from || '—'} → ${sec.to || '—'}`;
  const secLabel = secName;
  const journeyName = (s, j) => `${j.from || '—'} → ${j.to || '—'}${j.departureDate ? ` · ${dShort(j.departureDate)}` : ''}`;
  /* Fares per passenger type, per sector (flight_changes_2.md 6). */
  const FARE_TYPES = ['adult', 'child', 'infant'];
  const FARE_LABEL = { adult: 'Adult', child: 'Child', infant: 'Infant' };
  const fareType = (s, p) => { const t = paxType(s, p); return FARE_TYPES.includes(t) ? t : 'adult'; };
  const fareNum = (v) => { const t = String(v ?? '').replace(/[,\s₹]/g, ''); return t === '' || !(Number(t) >= 0) ? null : Number(t); };
  const fareRows = (s, sec) => { const req = activePax(s, sec); return FARE_TYPES.map((type) => ({ type, count: req.filter((p) => fareType(s, p) === type).length, fare: fareNum(sec.fares?.[type]) })).filter((r) => r.count); };
  const sectorFare = (s, sec) => activePax(s, sec).reduce((n, p) => { const c = confirmedRow(s, sec, p); return n + (c ? Number(c.fare) || 0 : fareNum(sec.fares?.[fareType(s, p)]) || 0); }, 0);
  /* A type's fare locks once a passenger of that type is confirmed on the sector, so confirmed tickets never change. */
  const fareLocked = (s, sec, type) => activeRows(s, sec).some((t) => t.status === 'confirmed' && fareType(s, Number(t.pax)) === type);
  const pendingPairs = (s) => sectorsOf(s).flatMap((sec) => activePax(s, sec).filter((p) => !confirmedRow(s, sec, p)).map((p) => ({ sec, p })));
  const requiredCount = (s) => sectorsOf(s).reduce((n, sec) => n + activePax(s, sec).length, 0);
  /* Read by Sales (Deal documents) and Accounts (invoice line text): sectors with at least one confirmed ticket. */
  function confirmedSegments(s) {
    return sectorsOf(s).map((sec) => {
      const rows = activePax(s, sec).map((p) => confirmedRow(s, sec, p)).filter(Boolean);
      return rows.length ? { ...pickFields(sec), no: sec.no, kind: sec.kind, pnr: rows[0].airlinePnr, ticketNumbers: rows.map((r) => r.ticketNumber).join(', '), passengers: rows.map((r) => paxName(s, Number(r.pax))) } : null;
    }).filter(Boolean);
  }
  const waitingAlts = (s) => sectorsOf(s).filter(waitsForSales);
  function allSectorsConfirmed(s) { return requiredCount(s) > 0 && pendingPairs(s).length === 0 && !waitingAlts(s).length; }
  /* Total of the fares on confirmed tickets (Flight sees its own supplier cost, never the selling price). */
  const actualFare = (s) => sectorsOf(s).reduce((n, sec) => n + activePax(s, sec).reduce((m, p) => m + (Number(confirmedRow(s, sec, p)?.fare) || 0), 0), 0);
  function flightWord(s) {
    if (s.taskStatus === 'cancelled') return 'Cancelled';
    if (s.taskStatus === 'new') return 'Waiting to be taken';
    if (s.taskStatus === 'done') return 'Done · ticket issued';
    const total = requiredCount(s); const left = pendingPairs(s).length;
    if (waitingAlts(s).length) return 'In progress · alternative waiting for Sales approval';
    if (total && !left) return 'In progress · all tickets confirmed';
    if (total && left < total) return `In progress · ${total - left} of ${total} tickets confirmed`;
    return 'In progress · tickets not confirmed yet';
  }
  /* The two completed preview tasks get their confirmed passenger-wise tickets (invented numbers). */
  /* Fares per passenger per sector (dummy). They add up to the fare cost already recorded on each task. */
  [['s-390-f', 'QX4M8T', '6HD3KQ', '176-2410394501', { adult: 16800, child: 13610 }], ['s-301-f', 'SQ9T4L', '7PL4ZA', '618-2410301201', { adult: 18850 }]].forEach(([id, pnr, crs, first, fares]) => {
    const s = S[id]; if (!s || s.flightSectors) return;
    let t = first;
    sectorsOf(s).forEach((sec) => { sec.fares = Object.fromEntries(Object.entries(fares).map(([k, v]) => [k, String(v)])); sec.tickets = sec.pax.map((p) => { const row = { id: uid('ft-'), pax: p, crsType: 'Amadeus', crsPnr: crs, airlinePnr: pnr, ticketNumber: t, fare: fares[paxType(s, p)] ?? fares.adult, status: 'confirmed', confirmedAt: s.doneAt, confirmedBy: 'flight' }; t = nextTicket(t); return row; }); });
  });
  const itineraryTable = (rows, label, fallbackClass = '') => table({ label, caption: `${rows.length} flight sectors`, heads: ['#', 'From', 'To', 'Travel date', 'Departure', 'Arrival', 'Airline / flight', 'Class'], rows: rows.map((raw, i) => { const g = normalizeSegment(raw); return [{ html: String(i + 1) }, { html: esc(g.from || '—') }, { html: esc(g.to || '—') }, { html: esc(dShort(g.departureDate)) }, { html: esc(g.departure || '—') }, { html: esc([g.arrivalDate ? dShort(g.arrivalDate) : '', g.arrival].filter(Boolean).join(' · ') || '—') }, { html: esc([g.airline, g.flightNumber].filter(Boolean).join(' ') || raw.flight || '—') }, { html: esc(g.class || fallbackClass || '—') }]; }) });
  const ticketLink = (f) => f.url ? `<a href="${esc(f.url)}" target="_blank" rel="noopener" class="${C.linkPlain}">${esc(f.name)}</a>` : `<span>${esc(f.name)}</span>`;
  function segmentEditor(taskId, rows, mode) {
    const labels = { from: 'From', to: 'To', departureDate: 'Departure date', arrivalDate: 'Arrival date', departure: 'Departure time', arrival: 'Arrival time', airline: 'Airline', flightNumber: 'Flight number', class: 'Class', pnr: 'PNR', ticketNumbers: 'Ticket number', adultFare: 'Adult fare', childFare: 'Child fare', infantFare: 'Infant fare' };
    const input = (name, key, value, extra = '') => `<label class="block min-w-0"><span class="sr-only">Sector ${Number(name.split('.')[1]) + 1} ${labels[key]}</span><input class="${C.input} h-9 min-w-0 w-full px-2 text-sm" aria-label="Sector ${Number(name.split('.')[1]) + 1} ${labels[key]}" name="${name}" value="${esc(value || '')}" type="${key.endsWith('Date') ? 'date' : key === 'departure' || key === 'arrival' ? 'time' : 'text'}" autocomplete="off"${extra}></label>`;
    const dateTime = (i, prefix, date, time) => `<div class="flex min-w-[13rem] flex-col gap-1"><div class="grid grid-cols-[minmax(0,1fr)_5.5rem] gap-1">${input(`segments.${i}.${prefix}Date`, `${prefix}Date`, date)}${input(`segments.${i}.${prefix}`, prefix, time)}</div></div>`;
    const activeFareTypes = mode === 'ticket' || mode === 'proposal' ? fareTypes(S[taskId]) : [];
    const fareLabels = { adult: 'Adult fare', child: 'Child fare', infant: 'Infant fare' };
    const heads = ['#', 'Airline', 'Flight no.', 'From', 'To', 'Class', 'Departure date & time', 'Arrival date & time', ...(mode === 'ticket' ? ['PNR', 'Ticket no.', ...activeFareTypes.map((type) => fareLabels[type])] : []), ...(mode === 'proposal' ? activeFareTypes.map((type) => fareLabels[type]) : []), ...(mode === 'proposal' ? [''] : [])];
    const body = rows.map((raw, i) => {
      const g = normalizeSegment(raw); const route = [g.from || '—', g.to || '—'].join(' → ');
      const cells = [
        `<span class="font-semibold tabular-nums text-quiet">${String(i + 1).padStart(2, '0')}</span>`,
        input(`segments.${i}.airline`, 'airline', g.airline || raw.flight?.replace(/\s+[A-Z0-9]{2}\s*\d+\w?$/i, '')),
        input(`segments.${i}.flightNumber`, 'flightNumber', g.flightNumber),
        input(`segments.${i}.from`, 'from', g.from),
        input(`segments.${i}.to`, 'to', g.to),
        input(`segments.${i}.class`, 'class', g.class || requestOf(S[taskId]).cabin),
        dateTime(i, 'departure', g.departureDate || raw.date, g.departure),
        dateTime(i, 'arrival', g.arrivalDate, g.arrival),
        ...(mode === 'ticket' ? [input(`segments.${i}.pnr`, 'pnr', g.pnr), input(`segments.${i}.ticketNumbers`, 'ticketNumbers', g.ticketNumbers), ...activeFareTypes.map((type) => input(`segments.${i}.${type}Fare`, `${type}Fare`, g.fareBreakup?.[type], ' inputmode="decimal"'))] : []),
        ...(mode === 'proposal' ? activeFareTypes.map((type) => input(`segments.${i}.${type}Fare`, `${type}Fare`, g.fareBreakup?.[type], ' inputmode="decimal"')) : []),
        ...(mode === 'proposal' ? [`<button type="button" class="${B.ghostSm} whitespace-nowrap" data-act="fv-proposal-remove" data-id="${taskId}" data-index="${i}">Remove</button>`] : []),
      ];
      return `<tr class="border-t border-line align-middle"><td class="px-2 py-2 text-center">${cells[0]}</td>${cells.slice(1).map((cell) => `<td class="min-w-0 px-1.5 py-2">${cell}</td>`).join('')}</tr>`;
    }).join('');
    return `<section class="flex min-w-0 flex-col gap-3" aria-label="Flight sectors"><div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="m-0 text-base font-semibold text-ink">Flight sectors — ${rows.length}</h3><span class="text-xs text-quiet">${mode === 'ticket' ? 'Enter one issued sector per row.' : 'Edit the proposed sectors below.'}</span></div><div class="max-w-full overflow-x-auto rounded-card border border-line bg-card"><table class="w-full min-w-[${mode === 'ticket' ? '1180' : '900'}px] border-collapse text-sm"><caption class="sr-only">${mode === 'ticket' ? 'Issued flight sectors' : 'Proposed flight sectors'}</caption><thead><tr class="bg-wash text-left text-xs font-semibold text-quiet">${heads.map((head) => `<th scope="col" class="whitespace-nowrap px-2 py-2">${head}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>${mode === 'proposal' ? `<div><button type="button" class="${B.secondaryMd}" data-act="fv-proposal-add" data-id="${taskId}">Add sector</button></div>` : ''}</section>`;
  }
  function parseEditor(form, mode) {
    const values = fd(form); const count = Math.max(...Object.keys(values).filter((k) => k.startsWith('segments.')).map((k) => Number(k.split('.')[1])), -1) + 1;
    const segments = Array.from({ length: count }, (_, i) => normalizeSegment({ ...Object.fromEntries(['from', 'to', 'departureDate', 'arrivalDate', 'departure', 'arrival', 'airline', 'flightNumber', 'class', 'pnr', 'ticketNumbers'].map((k) => [k, values[`segments.${i}.${k}`] || ''])), fareBreakup: { adult: values[`segments.${i}.adultFare`] || '', child: values[`segments.${i}.childFare`] || '', infant: values[`segments.${i}.infantFare`] || '' } }));
    return { segments, errors: segmentErrors(segments, mode === 'ticket') };
  }
  function availabilityCard(id, work) {
    const s = S[id]; const proposal = latestProposal(s); const activeDraft = UI.vals[`proposal-${id}`]; const draft = activeDraft || { segments: cloneSegments(proposal?.segments || requestOf(s).segments), reason: '', notes: '', sectorIndex: proposal?.sectorIndex ?? 0 };
    if (!draft.segments.length) draft.segments = [blankSegment()];
    work = work && canPropose(s);
    const baseSegments = requestOf(s).segments;
    const statusFor = (index) => {
      const current = (s.flightProposals || []).filter((p) => p.sectorIndex === index).at(-1);
      if (!current) return 'Ready for ticketing';
      return current.status === 'pending' ? 'Pending Sales approval' : current.status === 'approved' ? 'Approved alternative' : 'Rejected alternative';
    };
    const sectorRows = baseSegments.map((raw, index) => { const g = normalizeSegment(raw); const route = `${g.from || '—'} → ${g.to || '—'}`; return `<tr class="border-t border-line"><td class="px-2 py-2 text-center tabular-nums">${String(index + 1).padStart(2, '0')}</td><td class="px-2 py-2">${esc(route)}</td><td class="px-2 py-2">${esc(dShort(g.departureDate) || '—')}</td><td class="px-2 py-2">${esc([g.airline, g.flightNumber].filter(Boolean).join(' ') || '—')}</td><td class="px-2 py-2">${esc(statusFor(index))}</td><td class="px-2 py-2 text-right">${work ? `<button type="button" class="${B.ghostSm} whitespace-nowrap" data-act="fv-alternate" data-id="${id}" data-index="${index}">Alternate rate request · ${esc(route)}</button>` : '—'}</td></tr>`; }).join('');
    const sectorTable = `<div class="max-w-full overflow-x-auto rounded-card border border-line bg-card"><table class="w-full min-w-[760px] border-collapse text-sm"><caption class="sr-only">Flight availability by sector</caption><thead><tr class="bg-wash text-left text-xs font-semibold text-quiet"><th class="px-2 py-2">Sector</th><th class="px-2 py-2">Route</th><th class="px-2 py-2">Travel date</th><th class="px-2 py-2">Sales flight</th><th class="px-2 py-2">Status</th><th class="px-2 py-2 text-right">Action</th></tr></thead><tbody>${sectorRows}</tbody></table></div>`;
    const comparison = proposal ? table({ label: 'Original request and proposed alternative', caption: `Proposal ${proposal.version}`, heads: ['Field', 'Sales requested', 'Flight proposed'], rows: [['Route', requestOf(s).segments.map((g) => `${g.from} → ${g.to}`).join('; '), proposal.segments.map((g) => `${g.from} → ${g.to}`).join('; ')], ['Travel dates', requestOf(s).segments.map((g) => g.date || g.departureDate).join(', '), proposal.segments.map((g) => g.departureDate).join('; ')], ['Timing', requestOf(s).preferredTime || 'Not specified', proposal.segments.map((g) => `${g.departure || '—'}–${g.arrival || '—'}`).join('; ')], ['Status', 'Original request', proposal.status === 'pending' ? 'Pending Sales approval' : proposal.status === 'approved' ? 'Approved by Sales' : 'Rejected by Sales']].map((r) => r.map((c) => ({ html: esc(c) }))) }) : '';
    const form = work && activeDraft && proposal?.status !== 'pending' ? `<form novalidate data-act="fv-proposal-save" class="flex flex-col gap-3">${UI.err[`proposal-${id}`] ? errorSummary('Check the proposal', esc(UI.err[`proposal-${id}`])) : ''}<input type="hidden" name="task" value="${id}"><input type="hidden" name="sectorIndex" value="${draft.sectorIndex ?? 0}">${segmentEditor(id, draft.segments, 'proposal')}<div class="grid gap-3 sm:grid-cols-2">${field(`reason-${id}`, 'Reason for alternative', textInput(`reason-${id}`, 'reason', draft.reason))}</div>${field(`notes-${id}`, 'Notes for Sales', textInput(`notes-${id}`, 'notes', draft.notes), { optional: true })}<div class="flex flex-wrap gap-2"><button class="${B.secondary}" type="button" data-act="fv-proposal-draft" data-id="${id}">Save proposal draft</button><button class="${B.primary}" type="submit">Send alternative to Sales for approval</button></div></form>` : '';
    return `<details class="rounded-card border border-line bg-card" id="availability-${id}"><summary class="cursor-pointer px-4 py-3 text-base font-semibold text-ink">Flight availability and alternative</summary><div class="flex min-w-0 flex-col gap-3 p-4">${sectorTable}${comparison}${proposal ? `<p class="${C.small}">Version ${proposal.version}: ${esc(proposal.reason)}${proposal.rejectionReason ? ` Rejection: ${esc(proposal.rejectionReason)}` : ''}</p>` : ''}${form}${proposalHistory(s)}</div></details>`;
  }
  function proposalHistory(s) {
    const proposals = s.flightProposals || [];
    if (!proposals.length) return '';
    return `<details><summary class="${C.linkPlain}">Proposal history (${proposals.length})</summary>${proposals.slice().reverse().map((p) => `<section class="${C.bodyCol4}"><h3 class="m-0 text-base font-semibold">Version ${p.version} · ${esc(p.status)}</h3>${itineraryTable(p.segments, `Proposal ${p.version}`)}<p class="${C.small}">${esc(p.reason)}${p.notes ? ` · ${esc(p.notes)}` : ''}</p><p class="${C.small}">Submitted ${dtShort(p.submittedAt)} by ${esc(personName(p.submittedBy))}${p.decidedAt ? ` · ${esc(p.status)} ${dtShort(p.decidedAt)} by ${esc(personName(p.decidedBy))}` : ''}${p.rejectionReason ? ` · Rejection reason: ${esc(p.rejectionReason)}` : ''}</p></section>`).join('')}</details>`;
  }
  /* Sales Deal page (Services tab): alternatives Flight saved. The owning Sales Executive approves or rejects each one
     (Sales approval kept, FLIGHT_SECTOR_WORKFLOW.md C1). No fares are shown: the alternative has none. */
  function salesReview(id) {
    const s = S[id]; if (!TN.is('sales', 'manager')) return '';
    const alts = sectorsOf(s).filter((x) => x.kind === 'alternative');
    const its = itinsOf(s).filter((x) => ['pending', 'approved', 'rejected'].includes(x.status) && x.submittedAt);
    if (!alts.length) return its.length ? salesItins(id, its) : '';
    const owner = TN.deal(s.deal)?.owner === me() && TN.is('sales') && s.taskStatus === 'in_progress';
    const waiting = alts.filter(waitsForSales).length;
    const rows = alts.map((a) => { const o = sectorsOf(s).find((x) => x.id === a.parent) || {}; const act = waitsForSales(a) || a.approval === 'approved' ? activePax(s, a) : a.pax; const st = sectorState(s, a);
      const decide = waitsForSales(a) ? (owner ? `<div class="flex flex-wrap gap-2"><button type="button" class="${B.primaryMd}" data-act="fv-alt-decide" data-id="${id}" data-sec="${a.id}" data-decision="approve">Approve<span class="sr-only"> alternative ${esc(a.no)}</span></button><button type="button" class="${B.secondaryMd}" data-act="fv-alt-decide" data-id="${id}" data-sec="${a.id}" data-decision="reject">Reject<span class="sr-only"> alternative ${esc(a.no)}</span></button></div>` : '<span class="text-sm text-quiet">Only the owning Sales Executive can decide.</span>') : '';
      return [
        { cls: 'whitespace-nowrap', html: esc(a.no) },
        { html: `${esc([o.airline, o.flightNumber].filter(Boolean).join(' ') || '—')} → <span class="font-semibold text-ink">${esc([a.airline, a.flightNumber].filter(Boolean).join(' '))}</span>` },
        { html: esc(`${a.from} → ${a.to}`) },
        { cls: 'whitespace-nowrap', html: esc(`${dShort(a.departureDate)} · ${a.departure}–${a.arrival}`) },
        { html: esc(act.length ? act.map((p) => paxName(s, p)).join(', ') : 'Moved to a newer alternative') },
        { html: esc(a.remark || '—') },
        { html: `${esc(st.label)}${a.rejectionReason ? `<br><span class="text-sm text-quiet">Reason: ${esc(a.rejectionReason)}</span>` : ''}${decide ? `<div class="mt-2">${decide}</div>` : ''}` },
      ]; });
    return card({ id: `sales-flight-${id}`, title: `Flight alternatives${waiting ? ` · ${waiting} waiting for approval` : ''}`, desc: `Flight wants to change these sectors for the passengers shown. The original sector stays for everyone else. Approved budget ${s.budget ? TN.fmt.inr(s.budget) : 'not set'}.`, body: table({ label: 'Flight alternatives', caption: `${alts.length} alternative ${alts.length === 1 ? 'sector' : 'sectors'}`, heads: ['Sector', 'Flight', 'Route', 'Date and time', 'Passengers', 'Remark', 'Status'], rows }), bodyCls: null }) + (its.length ? salesItins(id, its) : '');
  }
  /* Sales: approve or reject a passenger's new itinerary. It is clearly for ONE passenger and replaces only their
     previous itinerary. */
  function salesItins(id, its) {
    const s = S[id]; const owner = TN.deal(s.deal)?.owner === me() && TN.is('sales') && s.taskStatus === 'in_progress';
    const list = (rows) => rows.length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0">${rows.map((g) => `<li>${esc(dShort(g.departureDate))} · ${esc(flightNo(g))} · ${esc(g.from)} → ${esc(g.to)} · ${esc(g.departure || '—')}–${esc(g.arrival || '—')}${g.remark ? ` <span class="text-quiet">(${esc(g.remark)})</span>` : ''}</li>`).join('')}</ul>` : '<span class="text-quiet">No flights</span>';
    const blocks = its.map((it) => {
      const name = paxName(s, it.pax); const [tone, label] = ITIN_STATUS[it.status];
      const decide = it.status === 'pending' ? (owner ? `<div class="flex flex-wrap gap-2"><button type="button" class="${B.primaryMd}" data-act="fv-itin-decide" data-id="${id}" data-itin="${it.id}" data-decision="approve">Approve<span class="sr-only"> new itinerary for ${esc(name)}</span></button><button type="button" class="${B.secondaryMd}" data-act="fv-itin-decide" data-id="${id}" data-itin="${it.id}" data-decision="reject">Reject<span class="sr-only"> new itinerary for ${esc(name)}</span></button></div>` : '<span class="text-sm text-quiet">Only the owning Sales Executive can decide.</span>') : '';
      return `<section class="flex flex-col gap-2 border-b border-line pb-4"><h3 class="m-0 text-base font-semibold text-ink">New itinerary for ${esc(name)} only ${badge(tone, label)}</h3><p class="m-0 text-copy">This replaces the previous itinerary <b>for ${esc(name)} only</b>. The other passengers keep their flights.</p><div class="grid gap-3 md:grid-cols-2"><div><p class="m-0 text-sm font-semibold text-quiet">Previous itinerary</p>${list(it.prev)}</div><div><p class="m-0 text-sm font-semibold text-quiet">Proposed itinerary</p>${list(it.rows)}${it.fares && fbTotal(it.fares[fareType(s, it.pax)]) ? `<p class="m-0 mt-1 text-sm">Proposed fare: <b>${inr(fbTotal(it.fares[fareType(s, it.pax)]))}</b></p>` : ''}</div></div>${it.rejectionReason ? `<p class="m-0 text-sm text-quiet">Reason: ${esc(it.rejectionReason)}</p>` : ''}${decide}</section>`;
    }).join('');
    const waiting = its.filter((x) => x.status === 'pending').length;
    return card({ id: `sales-itin-${id}`, title: `Passenger itineraries${waiting ? ` · ${waiting} waiting for approval` : ''}`, desc: 'Flight proposes a separate itinerary for one passenger. Approval replaces that passenger’s flights only.', body: blocks, bodyCls: C.bodyCol4 });
  }
  function salesProposalBlock(s, id, proposal) {
    const owner = TN.deal(s.deal)?.owner === me();
    const counts = passengerCounts(s);
    const applicable = fareTypes(s);
    const fareLabels = { adult: 'Adult', child: 'Child', infant: 'Infant' };
    const sector = proposal.sectorIndex != null;
    const original = sector ? [proposal.originalSegment || requestOf(s).segments[proposal.sectorIndex]].filter(Boolean) : requestOf(s).segments;
    const heading = sector ? `Sector ${String(proposal.sectorIndex + 1).padStart(2, '0')} · proposal ${proposal.version}` : `Whole trip · proposal ${proposal.version}`;
    const fareRows = applicable.map((type) => {
      const fares = proposal.segments.map((g) => Number(normalizeSegment(g).fareBreakup?.[type]) || 0);
      const total = fares.reduce((sum, fare) => sum + fare, 0) * counts[type];
      return `<tr><td class="px-2 py-1.5">${fareLabels[type]}</td><td class="px-2 py-1.5 text-right tabular-nums">${counts[type]}</td><td class="px-2 py-1.5 text-right tabular-nums">${fares.map((fare) => inr(fare)).join(' · ')}</td><td class="px-2 py-1.5 text-right tabular-nums">${inr(total)}</td></tr>`;
    }).join('');
    const proposedTotal = fareTotal(s, proposal.segments);
    const fareSummary = `<section class="rounded-card border border-line bg-wash p-3"><h3 class="m-0 text-sm font-semibold text-ink">Proposed booking amount</h3>${fareRows ? `<div class="mt-2 overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-left text-xs text-quiet"><th class="px-2 py-1.5">Passenger</th><th class="px-2 py-1.5 text-right">Count</th><th class="px-2 py-1.5 text-right">Fare per sector</th><th class="px-2 py-1.5 text-right">Calculated total</th></tr></thead><tbody>${fareRows}</tbody></table></div><p class="m-0 mt-3 text-right font-semibold tabular-nums">Total proposed booking amount: ${inr(proposedTotal)}</p>` : '<p class="m-0 mt-2 text-sm text-quiet">No passenger fare breakup was recorded for this proposal.</p>'}</section>`;
    const decision = proposal.status === 'pending' && owner ? `<div class="flex flex-wrap gap-2"><button class="${B.primary}" type="button" data-act="fv-decision" data-id="${id}" data-version="${proposal.version}" data-decision="approve">Approve alternative</button><button class="${B.danger}" type="button" data-act="fv-decision" data-id="${id}" data-version="${proposal.version}" data-decision="reject">Reject alternative</button></div>` : proposal.status === 'pending' ? '<p class="m-0 text-sm text-quiet">Only the owning Sales Executive can decide this proposal.</p>' : '';
    return `<section class="flex min-w-0 flex-col gap-3 border-b border-line pb-4" aria-label="${esc(heading)}"><h3 class="m-0 text-base font-semibold text-ink">${esc(heading)}</h3>${notice(proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'danger' : 'warning', esc(proposal.status === 'pending' ? 'Pending Sales approval. Approval does not issue a ticket.' : proposal.status === 'approved' ? 'Approved by Sales. Flight still records the issued ticket separately.' : 'Rejected. Ticketing for this sector remains blocked.'))}${itineraryTable(original, 'Original request')}${itineraryTable(proposal.segments, 'Proposed alternative')}${fareSummary}<p class="${C.small}">Reason: ${esc(proposal.reason)}${proposal.notes ? ` · Notes: ${esc(proposal.notes)}` : ''}</p>${decision}</section>`;
  }
  TN.flightUI = { salesReview, status: flightWord, confirmedSegments };

  /* Mark-done checklist (DEC-59, pending). */
  function flightChecklist(id) {
    const s = S[id];
    /* Every passenger needs a confirmed ticket on every active sector they are on. A passenger moved to an
       alternative only needs the alternative; passengers left on the original still need the original. */
    const waiting = waitingAlts(s);
    const left = pendingPairs(s).filter(({ sec }) => !waitsForSales(sec));
    /* A passenger can now be taken off a sector, so check nobody is left without a flight on a journey (D3). */
    const gaps = neededJourneys(s).flatMap((j) => gapsIn(s, j).map((p) => `${paxName(s, p)} (${journeyName(s, j)})`));
    return [
      { key: 'assigned', target: confTarget(id), label: 'Every passenger has a flight on every journey', done: !gaps.length, why: `not on a flight yet: ${gaps.join(', ')}. Use + Add Sector or a sector's Passengers list` },
      { key: 'approval', target: `alt-${id}-heading`, label: 'No alternative waiting for Sales approval', done: !waiting.length, why: `${ownerName(s.deal)} (Sales) still has to decide alternative ${waiting.map(secName).join(', ')}` },
      { key: 'tickets', target: confTarget(id), label: 'Confirm the ticket and fare of every passenger on every active sector', done: requiredCount(s) > 0 && !pendingPairs(s).length, why: left.length ? `still pending: ${left.map(({ sec, p }) => `${paxName(s, p)} on sector ${secLabel(sec)}`).join(', ')}` : waiting.length ? 'passengers on an alternative are confirmed after Sales approves it' : 'add the passengers to the sectors' },
      { key: 'itin', target: `alt-${id}-heading`, label: 'No new passenger itinerary open', done: !itinsOf(s).some((x) => OPEN_ITIN.includes(x.status)), why: `finish the new itinerary for ${itinsOf(s).filter((x) => OPEN_ITIN.includes(x.status)).map((x) => `${paxName(s, x.pax)} (${(ITIN_STATUS[x.status] || [])[1] || x.status})`).join(', ')}: send it and get Sales approval, or discard it` },
      { key: 'ticket', target: `eticket-${id}`, label: 'E-ticket documents', done: filesOf(id).some((f) => f.kind === 'e_ticket'), why: 'attach the issued tickets' },
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
    const items = (H[id] || []).slice().reverse().map((e) => ({ title: esc(e.title), meta: `${dtShort(e.at)}${e.by ? ` · by ${esc(personName(e.by))}` : ''}`, detail: e.detail ? esc(e.detail) : '', state: 'done' }));
    const body = items.length ? timeline('Task history, newest first', items, false) : emptyState('history', 'No history yet', 'No history you can see on this task yet.');
    const main = card({ id: 'task-history-heading', title: 'History', desc: 'What happened on this task. No amounts are shown here.', body });
    /* Flight tasks: earlier flight sector versions are shown here, on the global History tab (user correction, 3 Nov 2026). */
    return S[id]?.dept === 'flight' && S[id].assignee ? `<div class="flex flex-col gap-5">${sectorHistoryCard(id)}${main}</div>` : main;
  }

  function filesPanel(id, { idProofs = true } = {}) {
    const s = S[id];
    const dep = filesOf(id).map((f) => ({ name: f.name, url: f.url, meta: `${FILE_KIND[f.kind]} · ${f.size} · ${dtShort(f.at)}` }));
    const proofs = idProofs && isMine(s) ? Object.entries(ID_PROOFS[id] || {}).map(([who, [n, sz]]) => ({ name: n, meta: `ID proof of ${who} · ${sz}` })) : [];
    const group = (gid, title, lines) => (lines.length ? `<section aria-labelledby="${gid}" class="flex flex-col gap-2"><h3 id="${gid}" class="m-0 text-base font-semibold text-ink">${title}</h3><ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="${title}">${lines.map((f) => `<li class="m-0 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm">${ic('file-text', 'size-4 shrink-0 text-faint')}${f.url ? ticketLink(f) : `<a href="#" data-act="fv-open-file" rel="noopener" class="${C.linkF}">${esc(f.name)}</a>`}<span class="text-quiet">${esc(f.meta)}</span></li>`).join('')}</ul></section>` : '');
    const body = `${!dep.length && !proofs.length ? '<p class="m-0 text-quiet">No files on this task yet.</p>' : ''}${group('task-files-department', 'Department files', dep)}${group('task-files-id', 'Traveller ID proofs', proofs)}${proofs.length ? internalLine('Private identity documents for this work. Every view is recorded.') : ''}`;
    return card({ id: 'task-files-heading', title: 'Files', desc: 'Only files for this task. Customer payment proofs and acceptance messages are never listed here.', extra: ic('folder-open', 'size-4 text-faint'), body, bodyCls: C.bodyCol4 });
  }

  function idProofsCard(id, people) {
    const map = ID_PROOFS[id] || {};
    const deal = TN.deal(S[id].deal);
    const missing = people.filter((p) => !map[p.name]).length;
    const attached = people.length - missing;

    const summaryBadge = missing
      ? `<span class="inline-flex items-center gap-1 rounded-full border border-status-warning-line bg-status-warning-tint px-2.5 py-0.5 text-xs font-semibold text-status-warning">${ic('circle-alert', 'size-3 shrink-0')}${missing} missing</span>`
      : `<span class="inline-flex items-center gap-1 rounded-full border border-status-success-line bg-status-success-tint px-2.5 py-0.5 text-xs font-semibold text-status-success">${ic('circle-check', 'size-3 shrink-0')}All ID proofs attached</span>`;

    const headActions = people.length
      ? `<button type="button" class="button secondary sm inline-flex items-center gap-2 font-semibold shrink-0 cursor-pointer" data-act="fv-view-id-proofs" data-id="${id}">${ic('file-text', 'size-4 shrink-0 text-brand-strong')}View all ID proofs (${attached}/${people.length})</button>`
      : '';

    const cust = TN.customer(deal.customer);

    return `<div class="${C.card}" data-slot="card">
      <section aria-labelledby="id-proofs-heading">
        <div class="p-4 flex flex-wrap items-center justify-between gap-4">
          <div class="min-w-0 flex-1 flex flex-col gap-1">
            <div class="flex items-center gap-2.5 flex-wrap">
              <h2 class="${C.cardTitle}" id="id-proofs-heading">Traveller details and ID proofs</h2>
              ${summaryBadge}
            </div>
            <p class="m-0 text-sm text-copy">
              <strong class="font-semibold text-ink">Client:</strong> ${esc(TN.clientName(cust))}
              <span class="text-quiet"> · ${people.length} travellers on this flight</span>
            </p>
            <p class="m-0 text-xs text-quiet">
              <span class="inline-flex items-center gap-1.5">${ic('lock', 'size-3.5 shrink-0 text-faint')}Private identity documents for this work. Every view is recorded. Do not copy or forward them.</span>
            </p>
          </div>
          ${headActions}
        </div>
      </section>
    </div>`;
  }

  TN.act('fv-view-id-proofs', (el) => {
    const id = el.dataset.id;
    const focusName = el.dataset.focus;
    const s = S[id];
    if (!s) return;
    const deal = TN.deal(s.deal);
    const people = s.passengers || [];
    const map = ID_PROOFS[id] || {};
    const cust = deal ? TN.customer(deal.customer) : null;
    const missing = people.filter((p) => !map[p.name]).length;
    const attached = people.length - missing;

    const listHtml = people.map((p, idx) => {
      const f = map[p.name];
      const kind = p.type === 'child' ? 'Child' : 'Adult';
      const t = deal ? TN.travellersOf(deal.id).find((x) => x.name === p.name) : null;
      const age = t && deal ? TN.ageOn(t.dob, deal.start) : null;
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
            DOB: <strong class="font-medium text-ink">${t ? esc(dShort(t.dob)) : '—'}</strong>${age != null ? ` (${age} yrs at travel)` : ''}
          </div>
        </div>

        ${f ? `
          <div class="flex flex-wrap items-center justify-between gap-3 rounded-control border border-line bg-wash/60 px-3 py-2 text-xs">
            <div class="inline-flex items-center gap-2.5 min-w-0">
              <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-status-success-tint text-status-success">
                ${ic('file-check', 'size-4.5')}
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="font-semibold text-ink">${esc(f[1] || 'ID proof')}</span>
                  <span class="text-quiet">·</span>
                  <span class="font-mono text-copy font-medium truncate">${esc(f[0])}</span>
                </div>
                <div class="text-[11px] text-quiet">
                  Attached on ${esc(dShort(f[2]))}
                </div>
              </div>
            </div>
            <div class="shrink-0 flex items-center gap-2">
              <button type="button" class="button secondary sm" data-act="fv-open-file">Open file</button>
            </div>
          </div>
        ` : `
          <div class="flex items-center gap-2.5 rounded-control border border-status-warning-line/60 bg-status-warning-tint/30 px-3 py-2 text-xs text-status-warning">
            ${ic('circle-alert', 'size-4 shrink-0 text-status-warning')}
            <span class="font-medium">No ID proof attached yet. Ask the salesperson.</span>
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
            <strong class="font-medium text-ink">Client:</strong> ${esc(cust ? TN.clientName(cust) : '—')}
          </div>
        </div>

        <div class="flex items-center justify-between text-xs px-1">
          <span class="text-quiet">${people.length} Travellers on this flight</span>
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
      description: deal ? esc(deal.title) : `Deal ${s.deal}`,
      body: bodyHtml,
      footer: `<div class="flex w-full items-center justify-between">
        <span class="text-xs text-quiet">${attached} attached · ${missing} missing</span>
        <button type="button" class="button secondary" data-close>Close</button>
      </div>`,
      cls: 'max-w-2xl'
    });
  });

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
    return `<div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-sm text-copy">Payment request ${esc(sp.id)} · ${esc(TN.supplier(sp.supplier).name)} · pay by ${dShort(sp.dueBy)}</p>${badge(tone, word, { sr: 'Payment request: ' })}</div>`;
  }

  function costItem(c, id, dept, work) {
    const [tone, word, icon] = c.status ? EXPENSE[c.status] : [];
    const editing = UI.open[`edit-${c.id}`];
    const paid = c.paidBy === 'company' ? `Paid by: Company · ${MODE[c.mode] || 'how not given'} · ${dShort(c.paidOn)}${c.reference ? ` · reference ${esc(c.reference)}` : ''}` : `Paid by: ${PAID_BY[c.paidBy]}${c.reference ? ` · reference ${esc(c.reference)}` : ''}`;
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
    if (dept === 'flight') return '';
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
      const segments = requestOf(s).segments;
      return [
        { html: `<a class="rounded-chip font-semibold text-brand-strong underline-offset-4 hover:text-brand-deep ${FOCUS}" href="#/app/flight/${id}">${esc(routeOf(s))}<span class="sr-only"> — open task</span></a>` },
        { cls: 'text-sm', html: `<ul class="m-0 list-none p-0">${segments.map((g, i) => `<li class="m-0 whitespace-nowrap">${i + 1}. ${esc(segText(g))}</li>`).join('')}</ul>` },
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

  /* Progress bar steps for a Flight task (FLIGHT_PROGRESS_BAR_PLAN.md). Uses existing data only; saves nothing.
     "Sales approval" only appears when an alternative was sent. Current step = first step not finished. */
  function flightProgress(id) {
    const s = S[id]; const done = s.taskStatus === 'done';
    /* Counts passenger tickets on active sectors (flight_changes.md: confirmation is passenger-wise). */
    const total = requiredCount(s); const confirmed = total - pendingPairs(s).length;
    const steps = [
      { label: 'Take task', done: !!s.assignee && s.taskStatus !== 'new' },
      ...(sectorsOf(s).some((x) => x.kind === 'alternative') ? [{ label: 'Sales approval', done: done || !waitingAlts(s).length, sub: !done && waitingAlts(s).length ? 'Waiting' : '' }] : []),
      { label: 'Confirm tickets', done: done || allSectorsConfirmed(s), sub: !done && s.assignee && total ? `${confirmed} of ${total}` : '' },
      { label: 'Attach e-tickets', done: done || filesOf(id).some((f) => f.kind === 'e_ticket') },
      { label: 'Flight done', done },
    ];
    const current = s.taskStatus === 'cancelled' ? -1 : steps.findIndex((st) => !st.done);
    return steps.map((st, i) => ({ ...st, state: s.taskStatus === 'cancelled' ? 'todo' : st.done ? 'done' : i === current ? 'current' : 'todo' }));
  }
  function progressBar(id) {
    const s = S[id]; const steps = flightProgress(id); const n = steps.length;
    const tick = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
    const words = { done: 'done', current: 'current step', todo: 'not started' };
    const items = steps.map((st, i) => `<li data-state="${st.state}"${st.state === 'current' ? ' aria-current="step"' : ''}><span class="fv-dot" aria-hidden="true">${st.state === 'done' ? tick : i + 1}</span><span class="fv-lbl"><span class="sr-only">Step ${i + 1} of ${n}: </span>${esc(st.label)}${st.sub ? `<span class="fv-sub">${esc(st.sub)}</span>` : ''}<span class="sr-only">, ${words[st.state]}</span></span></li>`).join('');
    return `<nav class="fv-prog" aria-label="Flight task progress"${s.taskStatus === 'cancelled' ? ' data-cancelled' : ''}><ol style="--fv-steps:${n}">${items}</ol>${s.taskStatus === 'cancelled' ? '<p class="fv-note">Cancelled</p>' : ''}</nav>`;
  }
  function flightDetails(id) {
    const s = S[id];
    const d = TN.deal(s.deal);
    const mine = isMine(s);
    const files = filesOf(id).filter((f) => f.kind === 'e_ticket');
    const request = requestOf(s);
    const facts = `${itineraryTable(request.segments, 'Requested flight sectors', request.cabin)}<dl class="${C.dlFacts}"><dt class="${C.dt}">Passengers</dt><dd class="${C.ddFacts}">${(s.passengers || []).length}</dd><dt class="${C.dt}">Comment</dt><dd class="${C.ddFacts}">${esc(request.preferredTime || 'Not specified')}</dd><dt class="${C.dt}">Notes</dt><dd class="${C.ddFacts}">${esc(request.notes || 'None')}</dd></dl>`;
    const people = mine ? `<ul class="m-0 mt-3 flex list-none flex-col gap-1 p-0" aria-label="Travellers on this flight">${s.passengers.map((p) => `<li class="text-copy">${esc(p.name)} <span class="text-sm text-quiet">(${p.type}${p.age ? `, ${p.age}` : ''})</span></li>`).join('')}</ul>` : '<p class="m-0 mt-3 text-sm text-quiet">Traveller names are not shown to the Flight team in this version.</p>';
    const counts = passengerCounts(s);
    const fareLines = request.segments.flatMap((g) => { const f = g.fareBreakup || {}; return [['Adult', f.adult, counts.adult], ['Child', f.child, counts.child], ['Infant', f.infant, counts.infant]].filter(([, amount, count]) => amount !== '' && amount != null && count > 0).map(([type, amount, count]) => `${type}: ${inr(Number(amount))} × ${count}`); });
    const categoryBudget = fareLines.length ? `<dt class="${C.dt}">Sales fare breakup</dt><dd class="${C.dd}">${fareLines.map(esc).join('<br>')}</dd>` : '';
    const budget = `<dl class="${C.dl}"><dt class="${C.dt}">Travellers on the accepted version</dt><dd class="${C.dd}">Adults: ${counts.adult}<br>Children: ${counts.child}<br>Infants: ${counts.infant}</dd><dt class="${C.dt}">Approved budget</dt><dd class="${C.ddMoney}">${s.budget ? inr(s.budget) : 'Budget not set'}</dd>${categoryBudget}</dl>${files.length && mine ? `<ul class="m-0 mt-3 flex list-none flex-col gap-1.5 p-0" aria-label="Ticket files">${files.map((f) => `<li class="flex flex-wrap items-center gap-x-2 text-sm wrap-anywhere">${ticketLink(f)}<span class="text-quiet">${f.size}</span></li>`).join('')}</ul>` : ''}${people}`;
    const origin = `<dl class="${C.dl}"><dt class="${C.dt}">Deal</dt><dd class="${C.dd}">${esc(s.deal)}</dd><dt class="${C.dt}">Branch</dt><dd class="${C.dd}">Jodhpur</dd><dt class="${C.dt}">Accepted version</dt><dd class="${C.dd}">${s.versionNo || 1}</dd><dt class="${C.dt}">Saved</dt><dd class="${C.dd}">${dtShort(s.savedAt)} by ${esc(TN.person(d.owner).name)}</dd><dt class="${C.dt}">Task created</dt><dd class="${C.dd}">${dtShort(s.createdAt)}</dd></dl>`;
    return `<div class="flex min-w-0 flex-col gap-5">
      ${card({ id: 'flight-facts-heading', title: 'Flight details', extra: ic('plane', 'size-4 text-faint'), body: facts })}
      <div class="grid min-w-0 items-start gap-5 md:grid-cols-2">
        ${card({ id: 'flight-budget-heading', title: 'Travellers and budget', body: budget })}
        ${card({ id: 'flight-origin-heading', title: 'Where this came from', body: origin })}
      </div>
      ${mine ? idProofsCard(id, s.passengers) : ''}
    </div>`;
  }

  /* ------------------------------------------------------------------
     Work tab (flight_changes.md): 1. Alternative flight sectors (collapsible),
     2. Flight sector confirmation, 3. Finish this flight.
     Typed values live in UI.alt / UI.add (drafts) or straight on the pending
     ticket rows, so nothing typed is lost on a re-draw or when a section is closed.
     ------------------------------------------------------------------ */
  /* flight_changes_2.md: both tables show only live sectors, grouped by journey, with the columns
     Flight, Route, Date & time, Class (+ Remark in Alternatives) and Actions. Sector no., Passengers and Status columns
     are gone (the data and statuses are still kept). One shared booking passenger list feeds every sector. */
  Object.assign(UI, { alt: {}, add: {}, altOpen: {}, sel: {}, secOpen: {}, pickOpen: {}, board: {}, confOpen: {}, altSel: {}, club: {}, itinEdit: {}, itinSel: {}, mainOpen: {} });
  const selOf = (id) => (UI.sel[id] = UI.sel[id] || { sec: {}, row: {} });
  const FIELD_LABEL = { airline: 'Airline', flightNumber: 'Flight number', from: 'From', to: 'To', class: 'Class', departureDate: 'Departure date', departure: 'Departure time', arrivalDate: 'Arrival date', arrival: 'Arrival time' };
  const rowBadge = (r) => (r.status === 'confirmed' ? badge('success', 'Confirmed', { icon: 'circle-check' }) : badge('warning', 'Pending', { icon: 'clock' }));
  const paxNames = (s, list) => (list.length ? list.map((p) => esc(paxName(s, p))).join(', ') : '—');
  const draftGet = (scope, id, key) => (scope === 'alt' ? UI.alt[id]?.[key] : scope === 'itin' ? UI.itinEdit[id]?.d : scope === 'board' ? (UI.board[id] = UI.board[id] || { pax: [] }) : UI.add[id]);
  const errBox = (e, boxId) => (e ? errorSummary(esc(e.title), e.items.map(esc).join('<br>'), boxId) : '');
  /* Read-only and empty: show a dash instead of an empty date/time picker. */
  const fvIn = (bind, value, label, o = {}) => {
    if (o.type === 'date') { const v = /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? dShort(value) : value || ''; return o.ro ? fvIn0(bind, v || '—', label, { ...o, type: 'text' }) : fvIn0(`${bind} data-fv-date`, v, label, { ...o, type: 'text', ph: o.ph || '2 Dec 26' }); }
    /* Time: a text box with a drop-down list of 24-hour times (every 5 minutes). Picking one closes the list at once. */
    if (o.type === 'time') return o.ro ? fvIn0(bind, value || '—', label, { ...o, type: 'text' }) : fvIn0(`${bind} data-fv-time maxlength="7"`, value, label, { ...o, type: 'text', ph: o.ph || 'HH:MM', list: 'fv-time-list' });
    return o.ro && !value ? fvIn0(bind, '—', label, { ...o, type: 'text' }) : fvIn0(bind, value, label, o);
  };
  const fvIn0 = (bind, value, label, { type = 'text', cls = '', list, ph, ro } = {}) => `<input class="fv-in${cls ? ' ' + cls : ''}${ro ? ' fv-ro' : ''}" type="${type}" value="${esc(value || '')}" aria-label="${esc(label)}" autocomplete="off" ${ro ? `readonly tabindex="-1"${value && value !== '—' ? ` title="${esc(value)}"` : ''}` : bind}${list && !ro ? ` list="${list}"` : ''}${ph && !ro ? ` placeholder="${esc(ph)}"` : ''}>`;
  const FLIGHT_HEADS = ['Flight', 'Route', 'Date &amp; time', 'Class'];
  const viewCells = (g) => {
    const nextDay = g.arrivalDate && g.arrivalDate !== g.departureDate ? ` <span class="fv-meta fv-inline">arr. ${esc(dShort(g.arrivalDate))}</span>` : '';
    return [
      `<span class="fv-air">${esc(g.airline || '—')}</span><span class="fv-fno">${esc(g.flightNumber || '—')}</span>`,
      `<span class="fv-route"><span class="fv-iata">${esc(g.from || '—')}</span><span class="fv-arrow" aria-label="to">→</span><span class="fv-iata">${esc(g.to || '—')}</span></span>`,
      `<span class="fv-date">${esc(dShort(g.departureDate))}</span><span class="fv-time">${esc(g.departure || '—')}<span class="fv-arrow" aria-label="to">→</span>${esc(g.arrival || '—')}${nextDay}</span>`,
      `<span class="fv-class">${esc(g.class || '—')}</span>`,
    ];
  };
  /* Alternative table (user correction 3 Nov 2026): date & time first, and no arrival date (only the arrival time). */
  const ALT_HEADS = ['Date &amp; time', 'Flight', 'Route', 'Class'];
  /* Alternative table as a simple grid (user correction 3 Nov 2026): one line per flight, one field per cell, like a
     database table. The cells look the same in view and edit; Alternate only unlocks them for typing. */
  /* Column order (user request 3 Nov 2026): Date, Flight no., From, To, Dep time, Arr time, Class. No Airline column. */
  const GRID = [['departureDate', 'Date', 'date'], ['flightNumber', 'Flight no.', 'text'], ['from', 'From', 'text'], ['to', 'To', 'text'], ['departure', 'Dep time', 'time'], ['arrival', 'Arr time', 'time'], ['class', 'Class', 'text']];
  /* No Airline box in the Alternative table: keep the current airline, but when the flight number's carrier code changes
     (e.g. 6E -> AI) use the new code as the airline. */
  const autoAirline = (d, base) => { const code = String(d.flightNumber || '').trim().split(/\s+/)[0]; const old = String(base?.flightNumber || '').trim().split(/\s+/)[0]; if (code && (code !== old || !d.airline)) d.airline = code === old && base?.airline ? base.airline : code; };
  /* Class: short form in the table (Eco, P.Eco, Bus, First); a small list while editing (full name is stored). */
  const CLASSES = [['Economy', 'Eco'], ['Premium Economy', 'P.Eco'], ['Business', 'Bus'], ['First', 'First']];
  const classShort = (v) => (CLASSES.find(([full]) => full.toLowerCase() === String(v || '').trim().toLowerCase()) || [null, v || ''])[1];
  const classCell = (bind, value, label, ro) => (ro
    ? fvIn0('', classShort(value) || '—', label, { cls: 'fv-g fv-g-class', ro: true, type: 'text' }).replace('readonly', `readonly title="${esc(value || '')}"`)
    : `<select class="fv-in fv-g fv-g-class" ${bind} aria-label="${esc(label)}">${[...CLASSES, ...(value && !CLASSES.some(([f]) => f.toLowerCase() === String(value).toLowerCase()) ? [[value, value]] : [])].map(([full, sh]) => `<option value="${esc(full)}"${String(value || '').toLowerCase() === full.toLowerCase() ? ' selected' : ''}>${esc(sh)}</option>`).join('')}</select>`);
  const gridCellsB = (bindFn, d, lbl, ro) => GRID.map(([f, , type]) => (f === 'class' ? classCell(bindFn(f), d[f], `${lbl}: Class`, ro) : fvIn(bindFn(f), d[f], `${lbl}: ${FIELD_LABEL[f]}`, { type, cls: `fv-g fv-g-${f}`, ro })));
  const gridCells = (scope, id, key, d, lbl, ro) => gridCellsB((f) => `data-fv-draft="${scope}|${id}|${key}|${f}"`, d, lbl, ro);
  /* Adult / Child / Infant columns: only the types in this booking; each cell = passengers of that type on the row. */
  const ptypesOf = (s) => FARE_TYPES.filter((ty) => allPax(s).some((p) => fareType(s, p) === ty));
  const paxCountCells = (s, list) => ptypesOf(s).map((ty) => { const n = list.filter((p) => fareType(s, p) === ty).length; return `<span class="fv-gnum">${n || '–'}</span>`; });
  const altHeads = (s) => [['<span class="sr-only">Select</span>', 'c-tick'], ...GRID.map(([f, h]) => [h, `c-${f}`]), ...ptypesOf(s).map((ty) => [FARE_LABEL[ty], 'c-pax']), ['Remark', 'c-remark'], ['<span class="sr-only">Actions</span>', 'c-act']].map(([h, c]) => `<th scope="col" class="${c}">${h}</th>`).join('');
  const trashBtn = (act, attrs, label) => `<button type="button" class="fv-gicon" data-act="${act}" ${attrs} title="Delete" aria-label="${esc(label)}">${ic('trash', 'size-3.5')}</button>`;
  /* A sector added to the main table, with no confirmed ticket, can be deleted (its passengers go back where they were). */
  const canDeleteSec = (s, sec) => sec.kind === 'added' && !sec.itin && !sec.tickets.some((x) => x.status === 'confirmed');
  const altDateCell = (g) => `<span class="fv-date">${esc(dShort(g.departureDate))}</span><span class="fv-time">${esc(g.departure || '—')}<span class="fv-arrow" aria-label="to">→</span>${esc(g.arrival || '—')}</span>`;
  function altDraftCells(scope, id, key, d, lbl, ro) {
    const inp = (f, type, cls, ph) => fvIn(`data-fv-draft="${scope}|${id}|${key}|${f}"`, d[f], `${lbl}: ${FIELD_LABEL[f]}`, { type, cls, ph, ro });
    const [flight, route, , cls] = draftCells(scope, id, key, d, lbl, ro);
    const sched = `<div class="fv-sched"><div class="fv-sched-row">${`<span class="fv-mini" aria-hidden="true">Dep</span>`}${inp('departureDate', 'date')}${inp('departure', 'time', 'fv-in-sm')}</div><div class="fv-sched-row fv-sched-arr">${`<span class="fv-mini" aria-hidden="true">Arr</span>`}${inp('arrival', 'time', 'fv-in-sm')}</div></div>`;
    return [sched, flight, route, cls];
  }
  /* No arrival date is typed in the Alternative table: same day as departure, or the next day when it lands earlier
     than it took off (overnight flight). */
  const autoArrival = (d) => { if (!d.departureDate) return; const next = d.arrival && d.departure && d.arrival < d.departure; const dt = new Date(`${d.departureDate}T00:00:00`); if (next) dt.setDate(dt.getDate() + 1); d.arrivalDate = next ? `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}` : d.departureDate; };
  /* The row's own cells become inputs while editing (no popup, no extra panel). */
  function draftCells(scope, id, key, d, lbl, ro) {
    const inp = (f, type, cls, ph) => fvIn(`data-fv-draft="${scope}|${id}|${key}|${f}"`, d[f], `${lbl}: ${FIELD_LABEL[f]}`, { type, cls, ph, ro });
    const lab = (t) => `<span class="fv-mini" aria-hidden="true">${t}</span>`;
    return [
      `<div class="fv-stack">${inp('airline', 'text', '', 'Airline')}${inp('flightNumber', 'text', 'fv-in-sm', 'Flight no.')}</div>`,
      `<div class="fv-pair">${inp('from', 'text', 'fv-in-xs fv-in-code', 'From')}<span class="fv-arrow" aria-hidden="true">→</span>${inp('to', 'text', 'fv-in-xs fv-in-code', 'To')}</div>`,
      `<div class="fv-sched"><div class="fv-sched-row">${lab('Dep')}${inp('departureDate', 'date')}${inp('departure', 'time', 'fv-in-sm')}</div><div class="fv-sched-row">${lab('Arr')}${inp('arrivalDate', 'date')}${inp('arrival', 'time', 'fv-in-sm')}</div></div>`,
      inp('class', 'text', 'fv-in-sm', 'Class'),
    ];
  }
  /* Small tag under the flight: only where it matters (the Status column is gone). */
  function tagFor(s, sec) {
    const st = sectorState(s, sec);
    if (sec.kind === 'alternative') return `<span class="fv-tag" data-kind="alternative"${st.key === 'approval' ? ' data-tone="warning"' : ''}>${st.key === 'approval' ? 'Alternative · waiting for Sales' : 'Alternative · approved'}</span>`;
    if (st.key === 'empty') return '<span class="fv-tag" data-tone="warning">No passengers</span>';
    return sec.kind === 'added' ? '<span class="fv-tag" data-kind="added">Added</span>' : '';
  }
  const flightCell = (s, sec) => `${viewCells(sec)[0]}${tagFor(s, sec)}`;
  const td = (cells) => cells.map((c) => `<td>${c}</td>`).join('');
  const typeTag = (s, p) => `<span class="fv-ptype">${FARE_LABEL[fareType(s, p)]}</span>`;
  /* Closed passenger list: chosen names as chips (first 2, then +N) and a count. */
  function pickSumHtml(names, total) {
    const chips = names.slice(0, 2).map((n) => `<span class="fv-sumchip">${esc(n)}</span>`).join('') + (names.length > 2 ? `<span class="fv-sumchip fv-sumchip-more">+${names.length - 2}</span>` : '');
    return `<span class="fv-sumchips">${names.length ? chips : '<span class="text-quiet">None selected</span>'}</span><span class="fv-sumcount">${names.length}/${total}<span class="sr-only"> selected</span></span>`;
  }
  /* Who can go on an alternative of this sector: its own passengers (unless their ticket is confirmed) and passengers
     not on any flight for this journey. Passengers on another flight of the same journey are unavailable. */
  const altLock = (s, sec) => (p) => {
    if (openItin(s, p)) return 'has its own new itinerary';
    if (activePax(s, sec).includes(p)) return confirmedRow(s, sec, p) ? 'ticket confirmed' : '';
    const h = holderOf(s, segOf(s, sec), p); return h ? `on ${flightNo(h)}${waitsForSales(h) ? ', waiting for Sales' : ''}` : '';
  };
  const addEligible = (s, seg) => (seg === 'new' ? allPax(s) : allPax(s).filter((p) => !moveLock(s, seg, p)));
  const addPaxDefault = (s, id, seg) => { const el = addEligible(s, seg); const pick = draftGet('board', id).pax.filter((p) => el.includes(p)); return pick.length ? pick : seg === 'new' ? [] : unassignedIn(s, seg).filter((p) => el.includes(p)); };
  /* Note under a passenger in the Add Sector choice: where they are now, and that ticking moves them. */
  const addNote = (s, seg, p) => { if (seg === 'new') return ''; const l = moveLock(s, seg, p); if (l) return l; const h = holderOf(s, seg, p); return h ? `moves from ${flightNo(h)}` : 'no flight yet'; };
  function journeyRow(s, j, cols) {
    const gaps = gapsIn(s, j); const on = allPax(s).filter((p) => holderOf(s, j.id, p));
    const meta = gaps.length ? `${gaps.length} not on a flight: ${paxNames(s, gaps)}` : j.kind === 'original' ? `${on.length} ${on.length === 1 ? 'passenger' : 'passengers'} on a flight` : `Extra journey for ${paxNames(s, on)}`;
    return `<tr class="fv-seg"><th scope="rowgroup" colspan="${cols}"><span class="fv-seg-name">${ic('plane', 'size-4 shrink-0')}${esc(journeyName(s, j))}</span><span class="fv-seg-meta"${gaps.length ? ' data-tone="warning"' : ''}>${meta}</span></th></tr>`;
  }

  /* + Add Sector draft: an inline row at the bottom of the table where it was started.
     Alternatives table: the journey choice sits in the row (Remark column) and the passengers come from the global
     passenger row above the table, so no extra row is added. Confirmation table: one full-width row with labelled inputs;
     passengers come from the Confirmation passenger row. */
  function addRows(s, id, d, where, cols) {
    const elig = addEligible(s, d.seg); const k = `add|${id}|_`;
    const opts = journeys(s).map((j) => { const g = gapsIn(s, j).length; return `<option value="${j.id}"${d.seg === j.id ? ' selected' : ''}>Instead of ${esc(journeyName(s, j))}${g ? ` · ${g} not on a flight` : ''}</option>`; }).join('') + `<option value="new"${d.seg === 'new' ? ' selected' : ''}>Extra journey (in addition)</option>`;
    const segSel = `<select class="fv-in" data-fv-addseg="${id}" aria-label="Journey for the new sector">${opts}</select>`;
    const cells = draftCells('add', id, '_', d, 'New sector');
    const actions = `<div class="fv-rowact fv-rowact-col"><button type="button" class="${B.primaryMd} fv-btn-sm" data-act="fv-add-save" data-id="${id}">${ic('check-check', 'size-4')}Save</button><button type="button" class="${B.ghostSm}" data-act="fv-add-cancel" data-id="${id}">Cancel</button></div>`;
    if (where === 'alt') { return `<tr class="fv-grow-row">${td(['', ...gridCells('add', id, '_', d, 'New sector', false), ...paxCountCells(s, d.pax), segSel.replace('class="fv-in"', 'class="fv-in fv-g fv-g-remark"'), `<div class="fv-gact"><button type="button" class="fv-gbtn" data-act="fv-add-save" data-id="${id}">Save</button><button type="button" class="fv-gbtn fv-gbtn-q" data-act="fv-add-cancel" data-id="${id}">Cancel</button></div>`])}</tr>`; }
    const grp = (label, html) => `<div class="fv-ed-grp">${label ? `<span class="fv-ed-lbl">${label}</span>` : ''}${html}</div>`;
    /* Confirmation: the passengers are ticked inside this same row. On an existing journey, ticking a passenger who is
       already on a flight moves them to this new sector (that flight then no longer counts for them). */
    const chips = allPax(s).map((p) => { const lock = !elig.includes(p); const note = addNote(s, d.seg, p); return `<label class="fv-gchip"><input type="checkbox" class="fv-check" data-fv-pick="${k}" data-name="${esc(paxName(s, p))}" value="${p}"${d.pax.includes(p) ? ' checked' : ''}${lock ? ' disabled' : ''}><span class="fv-gchip-txt"><span class="fv-gname">${esc(paxName(s, p))}${typeTag(s, p)}</span>${note ? `<span class="fv-chip-note">${esc(note)}</span>` : ''}</span></label>`; }).join('');
    return `<tr data-draft data-kind="added"><td></td><td colspan="${cols - 1}"><div class="fv-hedit">${grp('Journey', segSel)}${FLIGHT_HEADS.map((h, i) => grp(h, cells[i])).join('')}</div><div class="fv-hedit fv-hedit-pax">${grp(`Passengers · <output data-fv-persons="${k}">${d.pax.length}</output> chosen`, `<div class="fv-gpax-row" data-fv-pickgrp="${k}" role="group" aria-label="Passengers for the new sector">${chips}</div>`)}<div class="fv-hedit-act">${actions}</div></div></td></tr>`;
  }

  /* ---------- Alternative flight sectors ---------- */
  /* What the Alternatives section is editing right now: one alternative or one new sector at a time. */
  function altEditing(s, id) {
    const e = Object.entries(UI.alt[id] || {}).find(([, d]) => d);
    if (e && secOf(s, e[0])) return { kind: 'alt', sec: secOf(s, e[0]), d: e[1] };
    if (UI.add[id]?.where === 'alt') return { kind: 'add', d: UI.add[id] };
    return null;
  }
  /* One global passenger row (user correction, 3 Nov 2026): every booking passenger with a checkbox, in a single row
     above the table. Click Alternate on a flight, then tick who moves here. Same row for + Add Sector. */
  function altPaxRow(s, id, work) {
    const ed = work ? altEditing(s, id) : null; const js = journeys(s);
    let k = `board|${id}|_`; let chosen = draftGet('board', id).pax; let lock = () => ''; let label = 'Passengers';
    let hint = !work ? '' : 'Choose passengers in the list, then click <b>Alternate</b> on a flight (or click Alternate first and choose them here).';
    if (ed?.kind === 'alt') {
      k = `alt|${id}|${ed.sec.id}`; chosen = ed.d.pax; lock = altLock(s, ed.sec); label = `Passengers for the alternative of ${secName(ed.sec)}`;
      hint = `Choosing passengers for the alternative of <b>${esc(secName(ed.sec))}</b>. Saving sends it to ${esc(ownerName(s.deal))} (Sales) for approval.`;
    } else if (ed?.kind === 'add') {
      k = `add|${id}|_`; chosen = ed.d.pax; lock = (p) => (ed.d.seg === 'new' ? '' : moveLock(s, ed.d.seg, p)); label = 'Passengers for the new sector';
      hint = ed.d.seg === 'new' ? 'Choosing passengers for the extra journey. Only they need a ticket on it.' : 'Choosing passengers for the new sector. A passenger already on a flight for this journey <b>moves</b> to the new sector; only the new one counts for them.';
    }
    const where = (p) => js.map((j) => { const h = holderOf(s, j.id, p); return h ? flightNo(h) : `no flight ${j.from}→${j.to}`; }).join(' · ');
    /* The passengers row is ONE multi-select drop-down (user correction 3 Nov 2026), not a checkbox per passenger. */
    return `<div class="fv-gpax"${ed ? ' data-editing' : ''}><div class="fv-gpax-head"><span class="fv-ed-lbl">Passengers</span>${hint ? `<span class="fv-meta fv-hint">${hint}</span>` : ''}</div><div class="fv-gpax-drop">${paxDrop(s, k, chosen, work, label, lock, where, mainPax(s))}</div></div>`;
  }
  /* Passenger multi-select drop-down used in the Alternative passengers row. The list opens as a floating panel. */
  const pdSumHtml = (s, list) => `<span class="fv-pd-n">${list.length}</span><span class="fv-pd-names">${esc(list.map((p) => paxName(s, p)).join(', ') || 'None')}</span>`;
  function paxDrop(s, k, chosen, editable, label, lockFn = () => '', noteFn = () => '', list = allPax(s)) {
    chosen = chosen.filter((p) => list.includes(p));
    const free = list.filter((p) => !lockFn(p)); const allOn = free.length > 0 && free.every((p) => chosen.includes(p));
    const items = list.map((p) => { const l = lockFn(p); return `<label class="fv-pd-item"><input type="checkbox" class="fv-check"${editable ? ` data-fv-pick="${k}"` : ''} data-name="${esc(paxName(s, p))}" value="${p}"${chosen.includes(p) ? ' checked' : ''}${!editable || l ? ' disabled' : ''}><span>${esc(paxName(s, p))}${typeTag(s, p)}${l || noteFn(p) ? `<span class="fv-chip-note">${esc(l || noteFn(p))}</span>` : ''}</span></label>`; }).join('');
    const all = editable ? `<label class="fv-pd-item fv-pd-all"><input type="checkbox" class="fv-check" data-fv-pick="${k}" value="all"${allOn ? ' checked' : ''}${free.length ? '' : ' disabled'}><span>All</span></label>` : '';
    return `<details class="fv-pd" data-fv-pd><summary class="fv-pd-sum"><span class="sr-only">${esc(label)}: </span><span class="fv-pd-txt" data-fv-pdsum="${k}">${pdSumHtml(s, chosen)}</span>${ic('chevron-down', 'size-4 fv-pd-chev')}</summary><div class="fv-pd-list"${editable ? ` data-fv-pickgrp="${k}"` : ''} role="group" aria-label="${esc(label)}">${all}${items}</div></details>`;
  }
  function altRows(s, id, sec, work, busy) {
    const d = UI.alt[id]?.[sec.id]; const lbl = secName(sec);
    const cells = gridCells('alt', id, sec.id, d || sec, d ? `Alternative for ${lbl}` : lbl, !d);
    const remark = fvIn(`data-fv-draft="alt|${id}|${sec.id}|remark"`, d ? d.remark : sec.kind === 'alternative' ? sec.remark || '' : '', d ? `Remark (reason) for the alternative of ${lbl}` : `Remark for ${lbl}`, { cls: 'fv-g fv-g-remark', ph: 'Reason', ro: !d });
    const act = d
      ? `<button type="button" class="fv-gbtn" data-act="fv-alt-save" data-id="${id}" data-sec="${sec.id}">Save<span class="sr-only"> alternative for ${esc(lbl)}</span></button><button type="button" class="fv-gbtn fv-gbtn-q" data-act="fv-alt-cancel" data-id="${id}" data-sec="${sec.id}">Cancel</button>`
      : waitsForSales(sec) ? '<span class="fv-gnote">Waiting for Sales</span>'
      : work ? `<button type="button" class="fv-gbtn" data-act="fv-alt-start" data-id="${id}" data-sec="${sec.id}"${busy ? ' disabled title="Save or cancel the flight you are editing first"' : ''}>Alternate<span class="sr-only"> ${esc(lbl)}</span></button>` : '';
    /* Tick box: choose the flights to confirm together (Confirm tickets in the footer). Not for a flight waiting for
       Sales or one whose passengers are all confirmed. */
    const canTick = work && !d && !waitsForSales(sec) && activePax(s, sec).some((x) => !confirmedRow(s, sec, x));
    const tick = canTick ? `<input type="checkbox" class="fv-check" data-change="fv-alt-sel" data-id="${id}" data-sec="${sec.id}"${UI.altSel[id]?.[sec.id] ? ' checked' : ''} aria-label="Select ${esc(lbl)} to confirm tickets">` : '';
    const counts = paxCountCells(s, d ? d.pax : activePax(s, sec).filter((x) => !hasOwnTable(s, x)));
    const del = work && !d && canDeleteSec(s, sec) ? trashBtn('fv-sec-del', `data-id="${id}" data-sec="${sec.id}"`, `Delete ${lbl}`) : '';
    return `<tr class="fv-grow-row">${td([`<div class="fv-gtick">${tick}</div>`, ...cells, ...counts, remark, `<div class="fv-gact">${act}${del}</div>`])}</tr>`;
  }
  /* Fare breakup under every table in the Alternative section (user request 3 Nov 2026): per passenger type,
     Basic + K + YQ + YR + Other charges + Markup − Discount = Total per person, × count = Amount. These fares fill the
     Confirm tickets popup. scope: 'main' (shared table, saved in s.altFares) or an itinerary id (saved in it.fares). */
  const bkStore = (s, scope) => (scope === 'main' ? (s.altFares = s.altFares || {}) : (itinsOf(s).find((x) => x.id === scope)?.fares || {}));
  const mainCounts = (s) => { const ps = [...new Set(sectorsOf(s).filter((x) => !x.itin && isLive(s, x)).flatMap((x) => activePax(s, x)))]; return Object.fromEntries(FARE_TYPES.map((ty) => [ty, ps.filter((p) => fareType(s, p) === ty).length])); };
  const bkGrand = (fares, counts) => FARE_TYPES.reduce((n, ty) => n + (counts[ty] ? fbTotal(fares[ty]) * counts[ty] : 0), 0);
  function breakupBlock(s, id, scope, counts, fares, editable, label) {
    const types = FARE_TYPES.filter((ty) => counts[ty]); if (!types.length) return '';
    const rows = types.map((ty) => {
      const f = fares[ty] = fares[ty] || {};
      const cell = (k, lab) => (editable ? fvIn(`data-fv-bk="${id}|${scope}|${ty}|${k}" inputmode="decimal"`, f[k], `${label}: ${FARE_LABEL[ty]} ${lab}`, { cls: 'fv-mg fv-mg-num', ph: k === 'basic' ? '₹' : '0' }) : `<span class="tabular-nums">${f[k] !== '' && f[k] != null ? inr(fbNum(f[k])) : '—'}</span>`);
      return `<tr><th scope="row">${FARE_LABEL[ty]}</th>${FB.map(([k, lab]) => `<td class="fv-mnum">${cell(k, lab)}</td>`).join('')}<td class="fv-mnum"><b data-fv-bktot="${id}|${scope}|${ty}">${inr(fbTotal(f))}</b></td><td class="fv-mnum">× ${counts[ty]}</td><td class="fv-mnum" data-fv-bkamt="${id}|${scope}|${ty}">${inr(fbTotal(f) * counts[ty])}</td></tr>`;
    }).join('');
    return `<div class="fv-bk"><p class="fv-mcap">Fare breakup <span class="fv-meta fv-inline">Total = Basic + K + YQ + YR + Other charges + Markup − Discount. Used when the tickets are confirmed.</span></p><div class="fv-mwrap"><table class="fv-mtable fv-mtable-in"><caption class="sr-only">Fare breakup, ${esc(label)}</caption><thead><tr><th>Type</th>${FB.map(([, lab]) => `<th class="fv-mnum">${lab}</th>`).join('')}<th class="fv-mnum">Total</th><th class="fv-mnum">Count</th><th class="fv-mnum">Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" colspan="${FB.length + 3}" class="fv-mnum">Total</th><td class="fv-mnum"><b data-fv-bkgrand="${id}|${scope}">${inr(bkGrand(fares, counts))}</b></td></tr></tfoot></table></div></div>`;
  }
  /* Fare under every table (user request 3 Nov 2026): only the fare Sales gave in the booking, per passenger type, as
     "price × persons = total". price = Sales' fare per person over the flights; persons = passengers of that type.
     When some flights carry fewer passengers, each flight's part is shown ("₹a × 2 + ₹b × 1 = ₹total"). */
  function salesFareParts(s, paxSet) {
    const segs = requestOf(s).segments || []; const list = paxList(s);
    return FARE_TYPES.map((ty) => {
      const ps = paxSet.filter((p) => fareType(s, p) === ty); if (!ps.length) return null;
      const parts = segs.map((raw) => {
        const fare = fareNum(normalizeSegment(raw).fareBreakup?.[ty] ?? raw.fareBreakup?.[ty]); if (fare == null) return null;
        const on = Array.isArray(raw.passengerIds) ? ps.filter((p) => raw.passengerIds.includes(list[p]?.id)).length : ps.length;
        return on ? { fare, on } : null;
      }).filter(Boolean);
      if (!parts.length) return null;
      const total = parts.reduce((n, x) => n + x.fare * x.on, 0);
      const same = parts.every((x) => x.on === ps.length);
      const price = parts.reduce((n, x) => n + x.fare, 0);
      return { ty, n: ps.length, text: same ? `${inr(price)} × ${ps.length}` : parts.map((x) => `${inr(x.fare)} × ${x.on}`).join(' + '), total };
    }).filter(Boolean);
  }
  function salesFareBlock(s, paxSet, label) {
    const rows = salesFareParts(s, paxSet);
    if (!rows.length) return `<div class="fv-bk"><p class="fv-mcap">Fare given by Sales</p><p class="m-0 text-sm text-quiet">Sales did not give a fare per passenger for ${esc(label)}. Approved budget ${s.budget ? inr(s.budget) : 'not set'}.</p></div>`;
    const total = rows.reduce((n, r) => n + r.total, 0);
    return `<div class="fv-bk"><p class="fv-mcap">Fare given by Sales <span class="fv-meta fv-inline">${esc(label)}</span></p><div class="fv-mwrap fv-bk-wrap"><table class="fv-mtable"><caption class="sr-only">Fare given by Sales, ${esc(label)}</caption><tbody>${rows.map((r) => `<tr><th scope="row">${FARE_LABEL[r.ty]}</th><td class="fv-mnum">${r.text} = <b>${inr(r.total)}</b></td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th><td class="fv-mnum"><b>${inr(total)}</b></td></tr></tfoot></table></div></div>`;
  }
  /* ---------- Passenger itinerary ("Add New Table", user request 3 Nov 2026) ----------
     A separate table for ONE passenger: same grid and controls as the main table. Sent to Sales for approval; it replaces
     that passenger's previous itinerary only. Tickets for that passenger can be confirmed after Sales approves. */
  const ITIN_STATUS = { draft: ['brand', 'Draft · not sent'], pending: ['warning', 'Pending Sales Approval'], approved: ['success', 'Approved by Sales'], rejected: ['danger', 'Rejected by Sales'] };
  const flightsOfPax = (s, p) => sectorsOf(s).filter((x) => isLive(s, x) && activePax(s, x).includes(p)).sort((a, b) => String(a.departureDate + a.departure).localeCompare(String(b.departureDate + b.departure)));
  const itinRowOf = (g) => ({ id: uid('ir-'), ...pickFields(g), remark: '', base: { airline: g.airline, flightNumber: g.flightNumber } });
  const itinSecs = (s, it) => (it.secIds || []).map((x) => secOf(s, x)).filter(Boolean);
  function itinBlock(s, id, it, work) {
    const p = it.pax; const name = paxName(s, p); const editable = work && ['draft', 'rejected'].includes(it.status);
    const ed = UI.itinEdit[id]?.itin === it.id ? UI.itinEdit[id] : null; const busy = !!UI.itinEdit[id];
    const [tone, label] = ITIN_STATUS[it.status] || ['neutral', it.status];
    const approved = it.status === 'approved'; const secs = approved ? itinSecs(s, it) : [];
    const rows = approved ? secs.map((sec) => ({ ...pickFields(sec), id: sec.id, remark: sec.remark || '', sec })) : it.rows;
    const lineHtml = (row) => {
      const lbl = `${name}: ${row.from || '—'} → ${row.to || '—'}`;
      /* Draft / rejected: every row is editable straight away (user request 3 Nov 2026), typed values save as you type. */
      if (editable) {
        const cells = gridCellsB((f) => `data-fv-itrow="${id}|${it.id}|${row.id}|${f}"`, row, lbl, false);
        const remark = fvIn(`data-fv-itrow="${id}|${it.id}|${row.id}|remark"`, row.remark, `Remark for ${lbl}`, { cls: 'fv-g fv-g-remark', ph: 'Reason' });
        return `<tr class="fv-grow-row">${td(['<div class="fv-gtick"></div>', ...cells, ...paxCountCells(s, [p]), remark, `<div class="fv-gact">${trashBtn('fv-itin-delrow', `data-id="${id}" data-itin="${it.id}" data-row="${row.id}"`, `Delete ${lbl}`)}</div>`])}</tr>`;
      }
      if (ed && ed.row === row.id) {
        const cells = gridCells('itin', id, row.id, ed.d, `New itinerary for ${name}`, false);
        const remark = fvIn(`data-fv-draft="itin|${id}|${row.id}|remark"`, ed.d.remark, `Remark for ${lbl}`, { cls: 'fv-g fv-g-remark', ph: 'Reason' });
        return `<tr class="fv-grow-row">${td(['', ...cells, ...paxCountCells(s, [p]), remark, `<div class="fv-gact"><button type="button" class="fv-gbtn" data-act="fv-itin-save" data-id="${id}">Save</button><button type="button" class="fv-gbtn fv-gbtn-q" data-act="fv-itin-cancel" data-id="${id}">Cancel</button></div>`])}</tr>`;
      }
      const cells = gridCells('itinv', id, row.id, row, lbl, true);
      const remark = fvIn('', row.remark || '', `Remark for ${lbl}`, { cls: 'fv-g fv-g-remark', ro: true });
      let act = ''; let tick = '';
      if (approved) {
        const done = confirmedRow(s, row.sec, p);
        act = done ? '<span class="fv-cst" data-s="ok">Confirmed</span>' : '<span class="fv-cst">Pending</span>';
        if (work && !done) tick = `<input type="checkbox" class="fv-check" data-change="fv-itin-sel" data-id="${id}" data-sec="${row.sec.id}"${UI.itinSel[id]?.[row.sec.id] ? ' checked' : ''} aria-label="Select ${esc(lbl)} to confirm">`;
      }
      return `<tr class="fv-grow-row">${td([`<div class="fv-gtick">${tick}</div>`, ...cells, ...paxCountCells(s, [p]), remark, `<div class="fv-gact">${act}</div>`])}</tr>`;
    };
    const newRow = ed && ed.row === '_new' ? lineHtml({ id: '_new' }) : '';
    const nCols = 10 + ptypesOf(s).length - 1;
    const table = `<div class="fv-wrap" role="region" aria-label="New itinerary for ${esc(name)}" tabindex="0"><table class="fv-table fv-table-alt fv-grid"><caption class="sr-only">New itinerary for ${esc(name)}</caption><thead><tr>${altHeads(s)}</tr></thead><tbody>${rows.map(lineHtml).join('')}${newRow}${!rows.length && !newRow ? '<tr><td></td><td colspan="${nCols}"><span class="fv-cempty">No flights yet. Use Add Sector.</span></td></tr>' : ''}</tbody></table></div>`;
    const addSec = editable ? `<button type="button" class="${B.secondaryMd} fv-btn-sm" data-act="fv-itin-addrow" data-id="${id}" data-itin="${it.id}">${ic('plus', 'size-4')}Add Sector</button>` : '';
    const bk = salesFareBlock(s, [p], `${name} (from the booking)`);
    const note = it.status === 'rejected' ? `<p class="fv-subnote" data-tone="warning">${ic('circle-x', 'size-3.5 shrink-0')}<span>Rejected by ${esc(personName(it.decidedBy))}: ${esc(it.rejectionReason || '—')}. ${esc(name)} keeps the previous itinerary. Change the flights and send again.</span></p>`
      : it.status === 'pending' ? `<p class="fv-subnote" data-tone="warning">${ic('hourglass', 'size-3.5 shrink-0')}<span>Sent to ${esc(ownerName(s.deal))} (Sales) on ${esc(dtShort(it.submittedAt))}. Ticket confirmation for ${esc(name)} opens after Sales approves.</span></p>` : '';
    let foot = '';
    if (work && editable) foot = `<div class="fv-bar"><p class="m-0 text-sm text-quiet">This itinerary replaces the previous itinerary <b>for ${esc(name)} only</b>. The other passengers keep their flights.</p><div class="flex flex-wrap gap-2"><button type="button" class="${B.ghostMd}" data-act="fv-itin-discard" data-id="${id}" data-itin="${it.id}">Discard table</button><button type="button" class="${B.primaryMd}" data-act="fv-itin-send" data-id="${id}" data-itin="${it.id}"${busy ? ' disabled' : ''}>${ic('send', 'size-4')}Send to Sales for Approval</button></div></div>`;
    else if (work && approved && secs.some((sec) => !confirmedRow(s, sec, p))) foot = `<div class="fv-bar"><p class="m-0 text-sm text-quiet">Approved by ${esc(personName(it.decidedBy))}. Tick flights (or none for all) and confirm ${esc(name)}'s tickets.</p><button type="button" class="${B.primaryMd}" data-act="fv-itin-confirm" data-id="${id}" data-itin="${it.id}">${ic('check-check', 'size-4')}Confirm Ticket</button></div>`;
    const prev = `<details class="fv-hist fv-prev"><summary class="fv-hist-sum">${ic('history', 'size-4 shrink-0')}<span>Previous Itinerary</span><span class="fv-hcount">${it.prev.length} ${it.prev.length === 1 ? 'flight' : 'flights'}</span>${ic('chevron-down', 'size-4 fv-chev-dd')}</summary>${it.prev.length ? `<div class="fv-mwrap fv-prev-wrap"><table class="fv-mtable"><caption class="sr-only">Previous itinerary of ${esc(name)}</caption><thead><tr><th>Date</th><th>Flight no.</th><th>From</th><th>To</th><th>Dep time</th><th>Arr time</th><th>Class</th></tr></thead><tbody>${it.prev.map((g) => `<tr><td>${esc(dShort(g.departureDate))}</td><td>${esc(flightNo(g))}</td><td>${esc(g.from)}</td><td>${esc(g.to)}</td><td>${esc(g.departure || '—')}</td><td>${esc(g.arrival || '—')}</td><td>${esc(g.class || '—')}</td></tr>`).join('')}</tbody></table></div>` : '<p class="fv-meta fv-hint" style="margin:0 12px 12px">No flights before this table.</p>'}</details>`;
    return `<section class="fv-itin" aria-label="New itinerary for ${esc(name)}"><div class="fv-itin-head"><div class="min-w-0"><h3 class="fv-itin-title">${esc(name)} <span class="fv-meta fv-inline">${FARE_LABEL[fareType(s, p)]} · separate itinerary</span></h3>${badge(tone, label)}</div>${addSec}</div>${errBox(UI.err[`itin-${it.id}`], `itin-${it.id}-summary`)}${note}${table}${bk}${foot}${prev}</section>`;
  }
  /* "Confirm tickets" popup (user request 3 Nov 2026): the ticked flights are confirmed together. Each passenger line
     (CRS type, CRS PNR, Airline PNR, ticket number) applies to every ticked flight that passenger is on, so they get the
     same PNR and ticket number. Fare is a breakdown per passenger type. */
  const FB = [['basic', 'Basic amount'], ['k', 'K'], ['yq', 'YQ'], ['yr', 'YR'], ['other', 'Other charges'], ['markup', 'Markup'], ['discount', 'Discount']];
  const fbNum = (v) => { const x = fareNum(v); return x == null ? 0 : x; };
  const fbTotal = (f = {}) => FB.reduce((n, [k]) => n + (k === 'discount' ? -fbNum(f[k]) : fbNum(f[k])), 0);
  const clubSecs = (s, c) => c.secs.map((x) => secOf(s, x)).filter(Boolean);
  /* Passengers who still need a ticket on at least one ticked flight. */
  /* A passenger with a new itinerary that Sales has not approved yet cannot have tickets confirmed. */
  const clubElig = (s, secs) => allPax(s).filter((p) => !openItin(s, p) && secs.some((sec) => activePax(s, sec).includes(p) && !confirmedRow(s, sec, p)));
  const clubOn = (s, secs, p) => secs.filter((sec) => activePax(s, sec).includes(p) && !confirmedRow(s, sec, p));
  const clubFilled = (l) => ['crsType', 'crsPnr', 'airlinePnr', 'ticketNumber'].some((f) => String(l[f] || '').trim());
  const clubTypes = (s, c) => FARE_TYPES.filter((ty) => c.lines.some((l) => fareType(s, l.pax) === ty));
  function clubBody(s, id) {
    const c = UI.club[id]; const secs = clubSecs(s, c); const elig = clubElig(s, secs); const used = c.lines.map((l) => l.pax);
    const flights = secs.map((sec) => `<tr><td>${esc(dShort(sec.departureDate))} · ${esc(sec.departure || '—')} → ${esc(sec.arrival || '—')}</td><td><b>${esc(flightNo(sec))}</b></td><td><b>${esc(sec.from)} → ${esc(sec.to)}</b></td><td>${esc(sec.class || '—')}</td><td>${paxNames(s, activePax(s, sec).filter((p) => !confirmedRow(s, sec, p)))}</td></tr>`).join('');
    const box = (i, f, label, list) => fvIn(`data-fv-club="${id}|${i}|${f}"`, c.lines[i][f], `${paxName(s, c.lines[i].pax)}: ${label}`, { cls: 'fv-mg', list });
    const lines = c.lines.map((l, i) => {
      const sel = `<select class="fv-in fv-mg" data-fv-clubpax="${id}|${i}" aria-label="Passenger, line ${i + 1}">${elig.map((p) => `<option value="${p}"${p === l.pax ? ' selected' : ''}${p !== l.pax && used.includes(p) ? ' disabled' : ''}>${esc(paxName(s, p))} (${FARE_LABEL[fareType(s, p)]})</option>`).join('')}</select>`;
      const on = clubOn(s, secs, l.pax).length;
      const last = i === c.lines.length - 1; const more = elig.filter((p) => !used.includes(p));
      const plus = last && more.length ? `<button type="button" class="fv-gbtn fv-gplus" data-act="fv-club-add" data-id="${id}" title="Add next passenger: ${esc(paxName(s, more[0]))} (same details, ticket number + 1)">+<span class="sr-only"> Add next passenger</span></button>` : '';
      const del = '';
      return `<tr><td>${sel}</td><td>${box(i, 'crsType', 'CRS type', 'fv-crs-list')}</td><td>${box(i, 'crsPnr', 'CRS PNR')}</td><td>${box(i, 'airlinePnr', 'Airline PNR')}</td><td>${box(i, 'ticketNumber', 'Ticket number')}</td><td class="fv-mnum">${on} of ${secs.length}</td><td><div class="fv-gact">${plus}${del}</div></td></tr>`;
    }).join('');
    const types = clubTypes(s, c);
    const fareRowsHtml = types.map((ty) => {
      const f = c.fares[ty] = c.fares[ty] || {}; const n = c.lines.filter((l) => fareType(s, l.pax) === ty).length;
      return `<tr><th scope="row">${FARE_LABEL[ty]}</th>${FB.map(([k, lab]) => `<td>${fvIn(`data-fv-clubfare="${id}|${ty}|${k}" inputmode="decimal"`, f[k], `${FARE_LABEL[ty]} ${lab}`, { cls: 'fv-mg fv-mg-num', ph: k === 'basic' ? '₹' : '0' })}</td>`).join('')}<td class="fv-mnum"><b data-fv-clubtot="${id}|${ty}">${inr(fbTotal(f))}</b></td><td class="fv-mnum">× ${n}</td><td class="fv-mnum" data-fv-clubsum="${id}|${ty}">${inr(fbTotal(f) * n)}</td></tr>`;
    }).join('');
    const grand = types.reduce((n, ty) => n + fbTotal(c.fares[ty]) * c.lines.filter((l) => fareType(s, l.pax) === ty).length, 0);
    return `${c.err ? errorSummary('Nothing was confirmed', c.err.map(esc).join('<br>'), `fv-club-err-${id}`) : ''}
      <p class="fv-mcap">Flights confirmed together</p>
      <div class="fv-mwrap"><table class="fv-mtable"><thead><tr><th>Date &amp; time</th><th>Flight</th><th>Route</th><th>Class</th><th>Passengers to confirm</th></tr></thead><tbody>${flights}</tbody></table></div>
      <p class="fv-mcap">Passengers <span class="fv-meta fv-inline">Same CRS type, PNRs and ticket number on every ticked flight the passenger is on. Use + for the next passenger.</span></p>
      <datalist id="fv-crs-list">${CRS_TYPES.map((x) => `<option value="${x}"></option>`).join('')}</datalist>
      <div class="fv-mwrap"><table class="fv-mtable fv-mtable-in"><thead><tr><th>Passenger</th><th>CRS type</th><th>CRS PNR</th><th>Airline PNR</th><th>Ticket number</th><th class="fv-mnum">Flights</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${lines}</tbody></table></div>
      <p class="fv-mcap">Fare per passenger <span class="fv-meta fv-inline">Total = Basic + K + YQ + YR + Other charges + Markup − Discount. It covers all the ticked flights.</span></p>
      <div class="fv-mwrap"><table class="fv-mtable fv-mtable-in"><thead><tr><th>Type</th>${FB.map(([, lab]) => `<th>${lab}</th>`).join('')}<th class="fv-mnum">Total</th><th class="fv-mnum">Count</th><th class="fv-mnum">Amount</th></tr></thead><tbody>${fareRowsHtml}</tbody><tfoot><tr><th scope="row" colspan="${FB.length + 3}" class="fv-mnum">Total for these tickets</th><td class="fv-mnum"><b data-fv-clubgrand="${id}">${inr(grand)}</b></td></tr></tfoot></table></div>`;
  }
  function clubRefresh(id, focusSel) {
    const box = document.getElementById(`fv-club-body-${id}`); if (!box) return;
    box.innerHTML = clubBody(S[id], id); if (focusSel) { const el = box.querySelector(focusSel); if (el) el.focus(); }
  }
  /* Confirmed tickets (user request 3 Nov 2026): every completed ticket in one read-only table, under Alternative. */
  /* Confirmed tickets (user request 3 Nov 2026): ONE LINE PER PNR. Tickets that share the same Airline PNR (and CRS PNR)
     are one booking, so they are shown together: the flights it covers, how many passengers of each type, the ticket
     numbers (as a range when they run in sequence), the fare and when it was confirmed. No passenger names. */
  function ticketRange(nums) {
    const u = [...new Set(nums.filter(Boolean))].sort();
    if (u.length < 2) return u.join('');
    const seq = u.every((n, i) => i === 0 || nextTicket(u[i - 1]) === n);
    return seq ? `${u[0]} – ${u[u.length - 1].slice(-3)}` : u.join(', ');
  }
  function ticketsCard(id) {
    const s = S[id];
    const list = [...journeys(s).flatMap((j) => liveIn(s, j.id)), ...sectorsOf(s).filter((x) => x.itin && isLive(s, x))].flatMap((sec) => activePax(s, sec).map((p) => ({ sec, p, r: confirmedRow(s, sec, p) })).filter((x) => x.r));
    const groups = [];
    list.forEach((x) => {
      const key = `${norm(x.r.airlinePnr)}|${norm(x.r.crsPnr)}`;
      let g = groups.find((y) => y.key === key);
      if (!g) groups.push((g = { key, crsType: x.r.crsType, crsPnr: x.r.crsPnr, airlinePnr: x.r.airlinePnr, secs: [], pax: [], items: [] }));
      if (!g.secs.includes(x.sec)) g.secs.push(x.sec);
      if (!g.pax.includes(x.p)) g.pax.push(x.p);
      g.items.push(x);
    });
    const rows = groups.map((g) => {
      const secs = g.secs.slice().sort((x, y) => String(x.departureDate + x.departure).localeCompare(String(y.departureDate + y.departure)));
      const flights = secs.map((sec) => `<span class="fv-tline fv-tline-f">${esc(dShort(sec.departureDate))} · ${esc(sec.departure || '—')} · <b>${esc(flightNo(sec))}</b> · <b>${esc(sec.from)} → ${esc(sec.to)}</b></span>`).join('');
      const when = g.items.map((x) => x.r.confirmedAt).filter(Boolean).sort().at(-1);
      /* One row per passenger (user request 3 Nov 2026); the PNR, CRS, flights and date span that PNR's rows. */
      const pax = g.pax.slice().sort((x, y) => x - y); const n = pax.length;
      return pax.map((p, i) => {
        const mine = g.items.filter((x) => x.p === p);
        const fare = mine.reduce((m, { r }) => m + (Number(r.fare) || 0), 0);
        const fb = mine.find((x) => x.r.fareBreakup)?.r.fareBreakup;
        const tip = fb ? FB.map(([k, lab]) => `${lab} ${inr(fb[k])}`).join(' · ') + ` · Total ${inr(fb.total)}` : '';
        const span = (html, cls = '') => (i === 0 ? `<td rowspan="${n}"${cls ? ` class="${cls}"` : ''}>${html}</td>` : '');
        return `<tr${i === 0 ? ' class="fv-pnr-first"' : ''}>${span(`<b>${esc(g.airlinePnr || '—')}</b>`, 'tabular-nums')}${span(esc(g.crsType || '—'))}${span(esc(g.crsPnr || '—'), 'tabular-nums')}${span(flights)}<td>${esc(paxName(s, p))}</td><td>${FARE_LABEL[fareType(s, p)]}</td><td class="tabular-nums">${esc(ticketRange(mine.map((x) => x.r.ticketNumber)))}</td><td class="fv-mnum"${tip ? ` title="${esc(tip)}"` : ''}>${inr(fare)}</td>${span(when ? esc(dShort(String(when).slice(0, 10))) : '—')}</tr>`;
      }).join('');
    }).join('');
    const total = list.reduce((n, { r }) => n + (Number(r.fare) || 0), 0);
    const all = requiredCount(s);
    const head = `<div class="${C.cardHead} fv-card-head"><div class="min-w-0"><h2 class="${C.cardTitle}" id="tickets-${id}-heading"><span class="fv-collapse fv-static"><span>Confirmed tickets</span><span class="fv-hcount">${groups.length} ${groups.length === 1 ? 'PNR' : 'PNRs'}</span><span class="fv-hcount">${list.length} of ${all} passenger tickets</span></span></h2><p class="${C.small} fv-head-desc">Grouped by PNR: the flights it covers, then one row per passenger with their ticket number and fare.</p></div></div>`;
    const body = groups.length
      ? `<div class="fv-mwrap"><table class="fv-mtable fv-mtable-t"><caption class="sr-only">Confirmed tickets, one line per PNR</caption><thead><tr><th scope="col">Airline PNR</th><th scope="col">CRS type</th><th scope="col">CRS PNR</th><th scope="col">Flights</th><th scope="col">Passenger</th><th scope="col">Type</th><th scope="col">Ticket number</th><th scope="col" class="fv-mnum">Fare</th><th scope="col">Confirmed</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><th scope="row" colspan="7" class="fv-mnum">Total actual fare</th><td class="fv-mnum">${inr(total)}</td><td></td></tr></tfoot></table></div>`
      : '<p class="m-0 text-quiet">No tickets confirmed yet.</p>';
    return `<div class="${C.card} fv-card" data-slot="card"><section aria-labelledby="tickets-${id}-heading">${head}<div class="${C.bodyCol4}">${body}</div></section></div>`;
  }
  /* Flight sector history (flight_changes_2.md 7), shown on the task's History tab (user correction, 3 Nov 2026).
     Replaced and rejected versions; nothing is deleted and these never appear as live sectors. */
  function sectorHistoryCard(id) {
    const s = S[id]; const old = sectorsOf(s).filter((x) => !isLive(s, x));
    const replacer = (sec) => { const line = altsOf(s, rootOf(sec)); const after = sec.kind === 'alternative' ? line.slice(line.indexOf(sec) + 1) : line; return after.filter((a) => a.pax.some((p) => sec.pax.includes(p))).at(-1); };
    const dt = (v) => (v ? dtShort(v) : '—');
    const rows = old.map((sec) => {
      const outcome = sec.kind !== 'alternative' ? (sec.kind === 'original' ? 'Original booking' : 'Added sector')
        : isRejected(sec) ? `Rejected by ${personName(sec.decidedBy)} on ${dt(sec.decidedAt)}. Reason: ${sec.rejectionReason || '—'}. Passengers went back to the earlier flight.`
        : sec.approval === 'approved' ? `Approved by ${personName(sec.decidedBy)} on ${dt(sec.decidedAt)}` : 'Waiting for Sales';
      const rep = isRejected(sec) ? null : replacer(sec);
      const tickets = sec.tickets.filter((t) => t.status === 'confirmed');
      const movedTo = sectorsOf(s).filter((x) => (x.movedFrom || []).some((m) => m.from === sec.id));
      const changed = [`Created ${dt(sec.createdAt)}${sec.createdBy ? ` by ${personName(sec.createdBy)}` : ''}`, rep ? `Replaced ${dt(rep.createdAt)} by ${secName(rep)}` : '', ...movedTo.map((x) => `Passengers moved ${dt(x.createdAt)} to ${secName(x)}`), tickets.length ? `${tickets.length} confirmed ticket${tickets.length === 1 ? '' : 's'} kept` : ''].filter(Boolean);
      return `<tr data-replaced>${td([viewCells(sec)[0], viewCells(sec)[1], viewCells(sec)[2], `<span class="fv-names">${paxNames(s, sec.pax)}</span>`, `<span class="fv-remark">${esc(sec.remark || '—')}</span>`, `<span class="fv-remark">${esc(outcome)}</span>`, changed.map((c) => `<span class="fv-meta fv-wrap-text">${esc(c)}</span>`).join('')])}</tr>`;
    }).join('');
    const body = old.length ? `<div class="fv-wrap" role="region" aria-label="Flight sector history table" tabindex="0"><table class="fv-table fv-table-hist"><caption class="sr-only">Earlier versions of flight sectors</caption><thead><tr>${['Flight', 'Route', 'Date &amp; time', 'Passengers', 'Remark', 'Sales outcome', 'Changed'].map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div>` : '<p class="m-0 text-quiet">No earlier versions yet. When an alternative replaces a flight, or Sales rejects one, it is kept here.</p>';
    return card({ id: `sector-history-${id}`, title: 'Flight sector history', desc: 'Earlier versions of flights: replaced by an alternative, or alternatives Sales rejected.', body, bodyCls: C.bodyCol4, cls: 'fv-card' });
  }
  function alternativeCard(id, work) {
    const s = S[id]; const err = UI.err[`alt-${id}`];
    const open = UI.altOpen[id] !== false || !!err; /* open by default (user request 3 Nov 2026) */
    const alts = sectorsOf(s).filter((x) => x.kind === 'alternative');
    const busy = !!(work && altEditing(s, id));
    /* One row per flight (no journey rows), in journey order. */
    const body = journeys(s).flatMap((j) => liveIn(s, j.id)).filter((x) => !x.itin).map((sec) => altRows(s, id, sec, work, busy)).join('') + (work && UI.add[id]?.where === 'alt' ? addRows(s, id, UI.add[id], 'alt', 6) : '');
    const waitN = alts.filter(waitsForSales).length;
    const counts = alts.length ? `<span class="fv-hcount"><span class="sr-only">, </span>${alts.length} saved</span>${waitN ? `<span class="fv-hcount" data-tone="warning"><span class="sr-only">, </span>${waitN} waiting for Sales</span>` : ''}` : '';
    const head = `<div class="${C.cardHead} fv-card-head"><div class="min-w-0"><h2 class="${C.cardTitle}" id="alt-${id}-heading"><button type="button" class="fv-collapse" aria-expanded="${open}" aria-controls="alt-${id}-body" data-act="fv-alt-toggle" data-id="${id}">${ic('chevron-down', 'size-4 fv-chev')}<span>Alternative flight sectors</span>${counts}</button></h2><p class="${C.small} fv-head-desc">Change a flight for some or all passengers. Earlier versions are kept on the History tab.</p></div></div>`;
    const add = work ? `<div class="fv-toolbar-act fv-toolbar-stack"><button type="button" class="${B.secondaryMd} fv-btn-sm" data-act="fv-itin-new" data-id="${id}"${busy || UI.itinEdit[id] ? ' disabled' : ''}>${ic('plus', 'size-4')}Add New Table</button><button type="button" class="${B.secondaryMd} fv-btn-sm" data-act="fv-add-sector" data-id="${id}" data-where="alt"${UI.add[id] || busy ? ' disabled' : ''}>${ic('plus', 'size-4')}Add Sector</button></div>` : '';
    /* The main (old) table collapses when a passenger gets their own table (user request 3 Nov 2026); it opens again
       from its header. It stays open while one of its rows is being edited. */
    const ownTables = itinsOf(s).some((x) => ['draft', 'pending', 'rejected', 'approved'].includes(x.status));
    const mainOpen = busy || (UI.mainOpen[id] ?? !ownTables);
    const mp = mainPax(s);
    const mainHead = `<h3 class="fv-mainh"><button type="button" class="fv-collapse" aria-expanded="${mainOpen}" aria-controls="main-${id}-body" data-act="fv-main-toggle" data-id="${id}">${ic('chevron-down', 'size-4 fv-chev')}<span>Main itinerary</span><span class="fv-hcount">${mp.length ? esc(mp.map((p) => paxName(s, p)).join(', ')) : 'No passengers left'}</span></button></h3>`;
    const inner = `<div class="${C.bodyCol4} fv-body" id="alt-${id}-body"${open ? '' : ' hidden'}>${TIME_LIST}${errBox(err, `alt-${id}-summary`)}<div class="fv-toolbar fv-toolbar-alt fv-toolbar-right">${add}</div>${mainHead}<div class="fv-main-body" id="main-${id}-body"${mainOpen ? '' : ' hidden'}><div class="fv-wrap" role="region" aria-label="Alternative flight sectors table" tabindex="0"><table class="fv-table fv-table-alt fv-grid"><caption class="sr-only">Live flight sectors by journey</caption><thead><tr>${altHeads(s)}</tr></thead><tbody>${body}</tbody></table></div>${salesFareBlock(s, [...new Set(sectorsOf(s).filter((x) => !x.itin && isLive(s, x)).flatMap((x) => activePax(s, x)))].filter((p) => !hasOwnTable(s, p)), 'main itinerary')}${work ? `<div class="fv-bar"><p class="m-0 text-sm text-quiet">Tick the flights booked together on one ticket, then <b>Confirm tickets</b>. They get the same PNR and ticket number for each passenger.</p><button type="button" class="${B.primaryMd}" data-act="fv-club-open" data-id="${id}">${ic('check-check', 'size-4')}Confirm tickets</button></div>` : ''}</div>${itinsOf(s).filter((x) => !['discarded', 'replaced'].includes(x.status)).map((it) => itinBlock(s, id, it, work)).join('')}</div>`;
    return `<div class="${C.card} fv-card" data-slot="card"><section aria-labelledby="alt-${id}-heading">${head}${inner}</section></div>`;
  }

  /* ---------- Flight sector confirmation (simplified, user correction 3 Nov 2026) ----------
     One global passenger row on top (same idea as Alternatives), one summary line, and one flat table:
     a header row per flight (flight details, progress, fares inline, buttons) followed by one row per passenger
     with the ticket details. No drop-downs, no extra panels. */
  /* A flight starts with one passenger row; "+" adds the next one (user correction 3 Nov 2026).
     At most one row per passenger (a confirmed row is kept; extra pending rows are dropped). */
  function ensureRows(s, sec) {
    const act = activePax(s, sec);
    act.forEach((p) => {
      const mine = sec.tickets.filter((t) => Number(t.pax) === p);
      const keep = mine.find((t) => t.status === 'confirmed') || mine[0];
      if (keep && mine.length > 1) sec.tickets = sec.tickets.filter((t) => Number(t.pax) !== p || t === keep);
    });
    if (act.length && !activeRows(s, sec).length) sec.tickets.push(newRow(act[0]));
  }
  /* Passengers on the flight who have no row yet, in booking order. */
  const notAdded = (s, sec) => { const have = activeRows(s, sec).map((r) => Number(r.pax)); return activePax(s, sec).filter((p) => !have.includes(p)); };
  const rowFor = (s, sec, p) => sec.tickets.find((t) => Number(t.pax) === p && t.status === 'confirmed') || sec.tickets.find((t) => Number(t.pax) === p);
  /* Flight sector confirmation as a plain grid (user correction 3 Nov 2026): one line per flight, then one line per
     passenger under it (name in a drop-down). Boxes are read-only until Edit on the flight line; "+" adds the next
     passenger with the same details and ticket number + 1. View and edit look the same; only the boxes unlock. */
  /* Pending passenger lines are editable by default (user correction 3 Nov 2026: no Edit button). */
  const cEditing = () => true;
  function confFlightLine(s, id, sec, work, sel) {
    const st = sectorState(s, sec);
    const pend = activePax(s, sec).filter((p) => rowFor(s, sec, p)?.status === 'pending').length;
    const check = work && pend && !waitsForSales(sec) ? `<input type="checkbox" class="fv-check" data-change="fv-sel-sec" data-id="${id}" data-sec="${sec.id}"${sel.sec[sec.id] ? ' checked' : ''} aria-label="Select ${esc(secName(sec))} to confirm">` : '';
    const nextDay = sec.arrivalDate && sec.arrivalDate !== sec.departureDate ? ` (arr. ${dShort(sec.arrivalDate)})` : '';
    const info = `<div class="fv-cf"><span class="fv-cf-date">${esc(dShort(sec.departureDate))} · ${esc(sec.departure || '—')} → ${esc(sec.arrival || '—')}${esc(nextDay)}</span><span class="fv-cf-flight">${esc(flightNo(sec))}</span><span class="fv-cf-route">${esc(sec.from || '—')} → ${esc(sec.to || '—')}</span><span class="fv-cf-meta">${esc(sec.class || '—')}</span><span class="fv-cf-meta">${st.done}/${st.req.length} confirmed</span><span class="fv-cf-total">Flight total <b data-fv-faretotal="${id}|${sec.id}">${inr(sectorFare(s, sec))}</b></span>${waitsForSales(sec) ? '<span class="fv-gnote">Waiting for Sales</span>' : ''}</div>`;
    return `<tr class="fv-cflight"><td>${check}</td><td colspan="7"><div class="fv-cf-wrap">${info}</div></td><td></td></tr>`;
  }
  function confPaxLine(s, id, sec, r, work, used, last) {
    const p = Number(r.pax); const name = paxName(s, p); const type = fareType(s, p);
    const edit = work && cEditing(id, sec) && r.status === 'pending';
    const lbl = `${name}, ${secName(sec)}`;
    const box = (f, label, list) => fvIn(`data-fv-tk="${id}|${sec.id}|${r.id}|${f}"`, r[f], `${lbl}: ${label}`, { cls: 'fv-g', list, ro: !edit });
    /* Passenger name in a drop-down (only the passengers on this flight; ones already on another line are disabled). */
    const who = edit
      ? `<select class="fv-in fv-g" data-fv-tkpax="${id}|${sec.id}|${r.id}" aria-label="Passenger, ${esc(secName(sec))}">${activePax(s, sec).map((x) => `<option value="${x}"${x === p ? ' selected' : ''}${x !== p && used.includes(x) ? ' disabled' : ''}>${esc(paxName(s, x))} (${FARE_LABEL[fareType(s, x)]})</option>`).join('')}</select>`
      : fvIn('', `${name} (${FARE_LABEL[type]})`, `Passenger, ${secName(sec)}`, { cls: 'fv-g', ro: true });
    /* Fare: the fare for this passenger type on this flight (typing it here sets it for every passenger of that type). */
    const fare = r.status === 'confirmed'
      ? fvIn('', r.inclWith ? `Incl. in ${r.inclWith}` : r.fare != null && r.fare !== '' ? inr(Number(r.fare)) : '', `${lbl}: Fare`, { cls: 'fv-g', ro: true })
      : fvIn(`data-fv-fare="${id}|${sec.id}|${type}" inputmode="decimal"`, sec.fares?.[type], `${lbl}: ${FARE_LABEL[type]} fare per passenger`, { cls: 'fv-g', ph: '₹', ro: !(work && cEditing(id, sec)) || fareLocked(s, sec, type) });
    const status = r.status === 'confirmed' ? '<span class="fv-cst" data-s="ok">Confirmed</span>' : '<span class="fv-cst">Pending</span>';
    const plus = last && work && cEditing(id, sec) && notAdded(s, sec).length ? `<button type="button" class="fv-gbtn fv-gplus" data-act="fv-row-add" data-id="${id}" data-sec="${sec.id}" title="Add next passenger: ${esc(paxName(s, notAdded(s, sec)[0]))} (same details, ticket number + 1)">+<span class="sr-only"> Add next passenger to ${esc(secName(sec))}</span></button>` : '';
    return `<tr class="fv-cpax">${td(['', who, box('crsType', 'CRS type', 'fv-crs-list'), box('crsPnr', 'CRS PNR'), box('airlinePnr', 'Airline PNR'), box('ticketNumber', 'Ticket number'), fare, status, `<div class="fv-gact">${plus}</div>`])}</tr>`;
  }
  function confirmationCard(id, work) {
    const s = S[id]; const sel = selOf(id); const err = UI.err[`conf-${id}`];
    if (work) sectorsOf(s).filter((x) => isLive(s, x)).forEach((x) => ensureRows(s, x));
    const secs = journeys(s).flatMap((j) => liveIn(s, j.id));
    const rows = secs.map((sec) => {
      const lines = activeRows(s, sec).filter((r, i, a) => a.findIndex((x) => Number(x.pax) === Number(r.pax)) === i);
      const used = lines.map((r) => Number(r.pax));
      return confFlightLine(s, id, sec, work, sel) + (lines.length ? lines.map((r, i) => confPaxLine(s, id, sec, r, work, used, i === lines.length - 1)).join('') : '<tr class="fv-cpax"><td></td><td colspan="8"><span class="fv-cempty">No passengers on this flight.</span></td></tr>');
    }).join('');
    const add = work && UI.add[id] && UI.add[id].where !== 'alt' ? addRows(s, id, UI.add[id], 'conf', 9) : '';
    const total = requiredCount(s); const conf = total - pendingPairs(s).length; const pct = total ? Math.round((conf / total) * 100) : 0;
    const gaps = neededJourneys(s).flatMap((j) => gapsIn(s, j).map((p) => `${paxName(s, p)} (${j.from} → ${j.to})`));
    const histN = sectorsOf(s).filter((x) => !isLive(s, x)).length;
    const tools = `<div class="fv-toolbar-act"><a class="${B.ghostSm} fv-btn-sm" href="#/app/flight/${id}?tab=history">${ic('history', 'size-4')}View history${histN ? ` (${histN})` : ''}</a>${work ? `<button type="button" class="${B.secondaryMd} fv-btn-sm" data-act="fv-add-sector" data-id="${id}" data-where="conf"${UI.add[id] ? ' disabled' : ''}>${ic('plus', 'size-4')}Add Sector</button>` : ''}</div>`;
    const summary = `<div class="fv-csum"><div class="fv-csum-line"><span><b>${conf} of ${total}</b> passenger tickets confirmed</span><span>Actual fare <b>${inr(actualFare(s))}</b> · Budget ${s.budget ? inr(s.budget) : 'not set'}</span></div><div class="fv-meter" role="img" aria-label="${conf} of ${total} passenger tickets confirmed"><span style="width:${pct}%"></span></div></div>`;
    const heads = ['<span class="sr-only">Select</span>', 'Passenger', 'CRS type', 'CRS PNR', 'Airline PNR', 'Ticket number', 'Fare', 'Status', '<span class="sr-only">Actions</span>'];
    const body = `${errBox(err, `conf-${id}-summary`)}
      <div class="fv-toolbar fv-toolbar-conf">${tools}</div>
      ${summary}
      ${gaps.length ? `<p class="fv-subnote" data-tone="warning">${ic('triangle-alert', 'size-3.5 shrink-0')}<span>Not on a flight yet: ${esc(gaps.join(', '))}. Use + Add Sector to give them a flight.</span></p>` : ''}
      <datalist id="fv-crs-list">${CRS_TYPES.map((t) => `<option value="${t}"></option>`).join('')}</datalist>
      <div class="fv-wrap" role="region" aria-label="Flight sector confirmation table" tabindex="0"><table class="fv-table fv-grid fv-cgrid"><caption class="sr-only">One line per flight, then one line per passenger ticket</caption><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows}${add}</tbody></table></div>
      ${work ? `<div class="fv-bar"><p class="m-0 text-sm text-quiet">Fill in each passenger (use <b>+</b> for the next one). Tick the flights and press Confirm selected. Passengers left blank stay Pending.</p><button type="button" class="${B.primaryMd}" data-act="fv-confirm-selected" data-id="${id}">${ic('check-check', 'size-4')}Confirm selected</button></div>` : ''}`;
    /* Collapsible like Alternative flight sectors (user request 3 Nov 2026): closed by default, opens on its header;
       it opens by itself when there is an error to show. */
    const open = !!UI.confOpen[id] || !!err;
    const counts = `<span class="fv-hcount"><span class="sr-only">, </span>${secs.length} ${secs.length === 1 ? 'flight' : 'flights'}</span><span class="fv-hcount"${conf < total ? ' data-tone="warning"' : ''}><span class="sr-only">, </span>${conf} of ${total} confirmed</span>`;
    const head = `<div class="${C.cardHead} fv-card-head"><div class="min-w-0"><h2 class="${C.cardTitle}" id="confirm-${id}-heading"><button type="button" class="fv-collapse" aria-expanded="${open}" aria-controls="confirm-${id}-body" data-act="fv-conf-toggle" data-id="${id}">${ic('chevron-down', 'size-4 fv-chev')}<span>Flight sector confirmation</span>${counts}</button></h2><p class="${C.small} fv-head-desc">Confirm each passenger’s ticket on every flight. The actual fare does not change the budget, selling price or payment approvals.</p></div></div>`;
    return `<div class="${C.card} fv-card" data-slot="card"><section aria-labelledby="confirm-${id}-heading">${head}<div class="${C.bodyCol4} fv-body" id="confirm-${id}-body"${open ? '' : ' hidden'}>${body}</div></section></div>`;
  }

  /* PENDING (DEC-59): e-tickets and "Mark flight done". */
  function finishCard(id, work) {
    const s = S[id];
    const tickets = filesOf(id).filter((f) => f.kind === 'e_ticket');
    const ticketList = tickets.length ? `<ul class="m-0 flex list-none flex-col gap-1.5 p-0" aria-label="E-tickets stored">${tickets.map((f) => `<li class="m-0 flex flex-wrap items-center gap-2 text-sm">${ic('file-check', 'size-4 text-status-success')}${ticketLink(f)}<span class="text-quiet">E-ticket · ${esc(f.size)}</span></li>`).join('')}</ul>` : '';
    if (s.taskStatus === 'done') {
      return card({ id: `finish-${id}-heading`, title: 'Finish this flight', body: `${notice('success', `<p>Marked done on ${dtShort(s.doneAt)} by ${esc(personName(s.doneBy || 'flight'))}. Sales and Accounts were notified.</p><p>The ticket details are locked. Existing financial records are unchanged.</p>`, { title: 'Flight done' })}<dl class="${C.dl}"><dt class="${C.dt}">Total actual fare</dt><dd class="${C.ddMoney}">${inr(actualFare(s))}</dd></dl>${ticketList}`, bodyCls: C.bodyCol4, cls: 'fv-card fv-finish' });
    }
    if (!work) return card({ id: `finish-${id}-heading`, title: 'Finish this flight', body: `<p class="m-0 text-quiet">The Flight person who takes this task marks it done after every ticket is confirmed.</p>${ticketList}`, bodyCls: C.bodyCol4, cls: 'fv-card fv-finish' });
    const list = flightChecklist(id); const left = list.filter((i) => !i.done);
    const doneErr = UI.err[`done-${id}`];
    const total = requiredCount(s); const conf = total - pendingPairs(s).length;
    /* Progress summary + the same checklist messages, shown as a tidy list (flight_design.md 9). Rules unchanged. */
    const progress = `<div class="fv-summary fv-summary-finish" role="group" aria-label="Finish progress"><div class="fv-stat" data-tone="success"><span class="fv-stat-n">${conf}</span><span class="fv-stat-l">Tickets confirmed</span></div><div class="fv-stat" data-tone="${total - conf ? 'warning' : 'neutral'}"><span class="fv-stat-n">${total - conf}</span><span class="fv-stat-l">Tickets pending</span></div><div class="fv-stat" data-tone="${tickets.length ? 'success' : 'neutral'}"><span class="fv-stat-n">${tickets.length}</span><span class="fv-stat-l">E-tickets attached</span></div><div class="fv-meter" role="img" aria-label="${list.length - left.length} of ${list.length} finish steps done"><span style="width:${Math.round(((list.length - left.length) / list.length) * 100)}%"></span></div></div>`;
    const checklist = `<div role="status" class="fv-checklist-box" data-ready="${!left.length}"><p class="m-0 font-semibold text-ink">${left.length ? 'Before you can mark the flight done' : 'Ready to mark the flight done'}</p><ul class="fv-checklist">${list.map((i) => `<li data-done="${i.done}">${ic(i.done ? 'circle-check' : 'circle', 'size-4 shrink-0')}<div class="min-w-0"><span class="fv-cl-label">${esc(i.label)}</span>${i.done ? '<span class="sr-only"> (done)</span>' : `<span class="fv-cl-why">${esc(i.why.charAt(0).toUpperCase() + i.why.slice(1))}.</span>`}</div></li>`).join('')}</ul></div>`;
    const body = `
      ${doneErr ? errorSummary('Finish the steps below before you mark the flight done.', esc(doneErr), `done-${id}-summary`) : ''}
      ${progress}
      <section id="eticket-${id}" class="fv-eticket" tabindex="-1"><h3 class="m-0 text-md font-semibold text-ink">E-ticket documents</h3>${ticketList}<form novalidate data-act="fv-ticket-upload" class="flex flex-col gap-3">${UI.err[`upload-${id}`] ? errorSummary('Could not attach files', esc(UI.err[`upload-${id}`])) : ''}<input type="hidden" name="task" value="${id}">${field(`tickets-${id}`, 'Attach e-tickets', `<input id="tickets-${id}" name="files" type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" class="${C.file}">`, { hint: 'Select one or more PDF, JPG, PNG or WebP files. Maximum 4 MB per file.' })}<div><button class="${B.secondaryMd} fv-btn-sm" type="submit">${ic('file-check', 'size-4')}Attach selected files</button></div></form></section>
      ${checklist}
      <div class="fv-done-row"><button type="button" class="${B.primary} fv-done-btn" data-slot="button" data-act="fv-done" data-id="${id}"${left.length ? ' disabled aria-describedby="fv-done-why-' + id + '"' : ''}>${ic('check-check', 'size-4.5')}Mark flight done</button><p class="m-0 text-sm text-quiet" id="fv-done-why-${id}">${left.length ? `${left.length} ${left.length === 1 ? 'step' : 'steps'} still open (see the list above). ` : ''}Sales and Accounts get a notice that the ticket is issued. The task then locks.</p></div>`;
    return card({ id: `finish-${id}-heading`, title: 'Finish this flight', desc: 'Attach the e-tickets, then mark the flight done.', body, bodyCls: C.bodyCol4, cls: 'fv-card fv-finish' });
  }

  /* Flight sector confirmation is hidden for now (user request 3 Nov 2026). The code is kept; set to true to show it again.
     Tickets are confirmed with "Confirm tickets" in the Alternative section. */
  const SHOW_CONFIRMATION_SECTION = false;
  const confTarget = (id) => (SHOW_CONFIRMATION_SECTION ? `confirm-${id}-heading` : `alt-${id}-heading`);
  function flightTask(params, q) {
    const id = params.taskId;
    const s = S[id];
    if (!s || s.dept !== 'flight') return notAvailable('#/app/flight', 'Back to Flight tasks');
    const base = `/app/flight/${id}`;
    const tab = ['work', 'files', 'history'].includes(String(q.tab || '').toLowerCase()) ? String(q.tab).toLowerCase() : 'details';
    const taker = canWorkDept('flight');
    const mine = isMine(s);
    const done = s.taskStatus === 'done';
    const work = taker && mine && !done;
    const canClaim = taker && !s.assignee && s.taskStatus === 'new';
    const actions = canClaim
      ? `<form novalidate class="flex flex-col items-start gap-2 sm:items-end" data-act="fv-take"><input type="hidden" name="task" value="${id}"><p id="flight-claim-help" class="${C.small}">Shows colleagues you are handling it. It does not issue a ticket.</p><button type="submit" class="${B.takeLg}" data-slot="button" aria-describedby="flight-claim-help">Take this task</button><div role="status" aria-live="polite" class="w-full"></div></form>`
      : work && tab !== 'work' ? `<a class="${B.linkLg}" href="#${base}?tab=work">${allSectorsConfirmed(s) ? 'Finish this flight' : 'Confirm tickets'}</a>` : '';
    const next = done ? 'Nothing waiting.' : !s.assignee ? (canClaim ? 'take this task' : 'Flight takes this task') : mine ? (readyToFinish(id) ? 'mark the flight done on the Work tab' : 'confirm each passenger’s ticket on the Work tab') : `${TN.person(s.assignee).name} works on this task`;
    const internal = done
      ? `Internal task. Ticket issued and marked done on ${dtShort(s.doneAt)}. No payment, bill or invoice was created by the CRM. Nothing has been sent to the airline or the customer by the CRM.`
      : `Internal task. Tickets are issued outside the CRM. ${mine ? 'Taking the task did not book the flight. ' : ''}Nothing has been sent to the airline or the customer by the CRM.`;
    let content;
    /* The "Flight lines for the invoice" card is removed from the Work tab (flight_changes.md 1); the data stays. */
    if (tab === 'work') content = `<div class="flex flex-col gap-5">${s.assignee ? alternativeCard(id, work) + ticketsCard(id) + (SHOW_CONFIRMATION_SECTION ? confirmationCard(id, work) : '') : ''}${finishCard(id, work)}</div>`;
    else if (tab === 'files') content = filesPanel(id);
    else if (tab === 'history') content = historyPanel(id);
    else content = flightDetails(id);
    return `<div class="${C.page}">
      ${backLink('#/app/flight', 'Back to Flight tasks')}
      <header class="${C.headerTask}" data-slot="page-header"><div class="min-w-0"><p class="${C.eyebrow}">Flight task · ${esc(s.deal)}</p><h1 class="${C.h1}"><span class="block wrap-anywhere">${esc(routeOf(s))}</span></h1><div class="${C.statusRow}">${flightStatus(s)}<span class="text-copy">Taken by: ${esc(takenBy(s))}</span></div></div>${actions ? `<div class="${C.actions}">${actions}</div>` : ''}</header>
      ${progressBar(id)}
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
  const pushNotice = (to, text, deal, extra = {}) => TN.DATA.notices.unshift({ id: uid('n-fv-'), to, kind: 'notice', text, deal, at: NOW(), ...extra });
  const personNotice = (personKey, text, deal, href) => pushNotice([], text, deal, { recipients: [personKey], href });

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

  TN.act('fv-save-ticket', (f) => {
    const id = fd(f).task; const s = S[id]; const form = fd(f);
    const parsed = parseEditor(f, 'ticket', true);
    const fare = Number(String(form.actualFare || '').replace(/[,\s₹]/g, ''));
    const sectorFareTotal = fareTotal(s, parsed.segments);
    const effectiveFare = sectorFareTotal > 0 ? sectorFareTotal : fare;
    if (!canEditFlight(s)) return TN.toast('Only the assigned Flight Executive can edit an active task.', 'danger');
    rememberEditors();
    const issues = form.issued ? [...parsed.errors] : [];
    if (s.flightTicket?.issued && !form.issued) issues.push('Recorded issuance cannot be removed by saving a draft. Keep the issuance confirmation checked.');
    if (form.issued && !(sectorFareTotal > 0) && (!Number.isFinite(fare) || fare <= 0)) issues.push('Enter adult, child or infant fare breakup for at least one passenger type.');
    if (form.issued && sectorFareTotal > 0 && Number.isFinite(fare) && fare > 0 && Math.abs(fare - sectorFareTotal) > 0.01) issues.push(`Total actual fare must equal the sector fare breakup (${inr(sectorFareTotal)}).`);
    if (form.issued && !filesOf(id).some((file) => file.kind === 'e_ticket')) issues.push('Attach at least one e-ticket document before recording ticket issuance.');
    if (form.issued && !authorizedItinerary(s, parsed.segments, form.proposalVersion ? Number(form.proposalVersion) : null)) issues.push('This itinerary includes a pending, rejected or unapproved alternative. Send the changed sector for Sales approval.');
    if (issues.length) { UI.vals[`ticket-${id}`] = { ...parsed, actualFare: sectorFareTotal > 0 ? sectorFareTotal : (form.actualFare || ''), remarks: form.remarks, issued: !!form.issued, proposalVersion: form.proposalVersion ? Number(form.proposalVersion) : null }; UI.err[`ticket-${id}`] = issues.join(' '); TN.refresh(); return; }
    s.flightTicket = { segments: parsed.segments, actualFare: Number.isFinite(effectiveFare) && effectiveFare > 0 ? effectiveFare : null, remarks: String(form.remarks || '').trim(), issued: !!form.issued, proposalVersion: form.proposalVersion ? Number(form.proposalVersion) : null, savedAt: NOW(), savedBy: me() };
    delete UI.vals[`ticket-${id}`]; delete UI.err[`ticket-${id}`];
    addH(id, s.flightTicket.issued ? 'Issued ticket details saved' : 'Ticket draft saved');
    TN.toast(s.flightTicket.issued ? 'Issued ticket details saved. The task is not yet complete.' : 'Ticket draft saved.');
    TN.refresh();
  });
  TN.act('fv-ticket-upload', (f) => {
    const id = fd(f).task; const files = Array.from(f.querySelector('input[type=file]').files || []);
    if (!canEditFlight(S[id])) return TN.toast('Only the assigned Flight Executive can attach tickets to an active task.', 'danger');
    rememberEditors();
    if (!files.length) { UI.err[`upload-${id}`] = 'Choose one or more e-ticket files.'; TN.refresh(); return; }
    const bad = files.find((file) => file.size > 4 * 1024 * 1024 || !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(file.type));
    if (bad) { UI.err[`upload-${id}`] = `${bad.name} must be a PDF, JPG, PNG or WebP file of 4 MB or less.`; TN.refresh(); return; }
    files.forEach((file) => FILES.push({ id: uid('df-'), task: id, kind: 'e_ticket', name: file.name, size: file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`, at: NOW(), url: URL.createObjectURL(file) }));
    delete UI.err[`upload-${id}`]; delete UI.err[`done-${id}`]; addH(id, 'E-ticket attached'); TN.toast(`${files.length} e-ticket ${files.length === 1 ? 'file' : 'files'} attached.`); TN.refresh();
  });
  function rememberEditors() {
    document.querySelectorAll('form[data-act="fv-save-ticket"], form[data-act="fv-proposal-save"]').forEach((form) => {
      const v = fd(form); const mode = form.dataset.act === 'fv-save-ticket' ? 'ticket' : 'proposal';
      UI.vals[`${mode}-${v.task}`] = { ...v, segments: parseEditor(form, mode).segments, issued: !!v.issued, proposalVersion: v.proposalVersion ? Number(v.proposalVersion) : null };
    });
  }
  /* ---------- Sector workflow actions (flight_changes.md). Replace the old Confirm and Alternate popups. ---------- */
  const secOf = (s, secId) => sectorsOf(s).find((x) => x.id === secId);
  const guard = (s) => { if (canEditFlight(s)) return true; TN.toast('Only the assigned Flight Executive can change an active flight task.', 'danger'); return false; };
  const fieldIssues = (g, what) => segmentErrors([g], false).map((m) => m.replace(/^Sector 1 /, `${what} `));
  const PNR_RE = /^[A-Z0-9]{5,8}$/;
  const TICKET_RE = /^\d[\d-]{4,}\d$/;
  const allPnrs = (s) => [...new Set(sectorsOf(s).flatMap((sec) => activeRows(s, sec).filter((r) => r.status === 'confirmed').map((r) => r.airlinePnr)))];
  /* A sector that still has passengers but no row gets one row, so it never looks empty. */
  const ensureRow = (s, sec) => { const act = activePax(s, sec); if (act.length && !activeRows(s, sec).length) sec.tickets.push(newRow(act[0])); };

  /* Typed values: drafts (alternative / new sector) and pending ticket rows. No re-draw while typing. */
  document.addEventListener('input', (ev) => {
    const el = ev.target; if (!el || !el.dataset) return;
    if (el.dataset.fvDraft) { const [scope, id, key, f] = el.dataset.fvDraft.split('|'); const d = draftGet(scope, id, key); if (d) d[f] = fvVal(el); }
    if (el.dataset.fvTk) { const [id, secId, rowId, f] = el.dataset.fvTk.split('|'); const s = S[id]; const r = s && secOf(s, secId)?.tickets.find((t) => t.id === rowId); if (r && r.status === 'pending' && canEditFlight(s)) r[f] = el.value; }
    if (el.dataset.fvItrow) {
      const [id, itinId, rowId, f] = el.dataset.fvItrow.split('|'); const s = S[id]; const it = s && itinsOf(s).find((x) => x.id === itinId); const r = it?.rows.find((x) => x.id === rowId);
      if (r && ['draft', 'rejected'].includes(it.status) && canEditFlight(s)) r[f] = fvVal(el);
    }
    if (el.dataset.fvBk) {
      const [id, scope, ty, k] = el.dataset.fvBk.split('|'); const s = S[id]; if (!s || !canEditFlight(s)) return;
      const store = bkStore(s, scope); (store[ty] = store[ty] || {})[k] = el.value;
      const counts = scope === 'main' ? mainCounts(s) : { [fareType(s, itinsOf(s).find((x) => x.id === scope)?.pax)]: 1 };
      const set = (sel, text) => document.querySelectorAll(sel).forEach((o) => { o.textContent = text; });
      set(`[data-fv-bktot="${id}|${scope}|${ty}"]`, inr(fbTotal(store[ty]))); set(`[data-fv-bkamt="${id}|${scope}|${ty}"]`, inr(fbTotal(store[ty]) * (counts[ty] || 0)));
      set(`[data-fv-bkgrand="${id}|${scope}"]`, inr(bkGrand(store, counts)));
    }
    if (el.dataset.fvClub) { const [id, i, f] = el.dataset.fvClub.split('|'); const l = UI.club[id]?.lines[Number(i)]; if (l) l[f] = el.value; }
    if (el.dataset.fvClubfare) {
      const [id, ty, k] = el.dataset.fvClubfare.split('|'); const c = UI.club[id]; const s = S[id]; if (!c || !s) return;
      (c.fares[ty] = c.fares[ty] || {})[k] = el.value;
      const tot = fbTotal(c.fares[ty]); const n = c.lines.filter((l) => fareType(s, l.pax) === ty).length;
      const set = (sel, text) => document.querySelectorAll(sel).forEach((o) => { o.textContent = text; });
      set(`[data-fv-clubtot="${id}|${ty}"]`, inr(tot)); set(`[data-fv-clubsum="${id}|${ty}"]`, inr(tot * n));
      set(`[data-fv-clubgrand="${id}"]`, inr(clubTypes(s, c).reduce((m, x) => m + fbTotal(c.fares[x]) * c.lines.filter((l) => fareType(s, l.pax) === x).length, 0)));
    }
    /* Fare per passenger type: saved on the sector and the breakdown recalculated at once (no re-draw, focus stays). */
    if (el.dataset.fvFare) {
      const [id, secId, type] = el.dataset.fvFare.split('|'); const s = S[id]; const sec = s && secOf(s, secId);
      if (!sec || !canEditFlight(s) || fareLocked(s, sec, type)) return;
      (sec.fares = sec.fares || {})[type] = el.value;
      const r = fareRows(s, sec).find((x) => x.type === type);
      const set = (sel, text) => document.querySelectorAll(sel).forEach((o) => { o.textContent = text; });
      set(`[data-fv-fareamt="${id}|${secId}|${type}"]`, r && r.fare != null ? inr(r.fare * r.count) : '—');
      set(`[data-fv-rowfare="${id}|${secId}|${type}"]`, r && r.fare != null ? inr(r.fare) : '—');
      set(`[data-fv-faretotal="${id}|${secId}"]`, inr(sectorFare(s, sec)));
      document.querySelectorAll(`[data-fv-fare="${id}|${secId}|${type}"]`).forEach((o) => { if (o !== el) o.value = el.value; });
    }
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target; if (!el || !el.dataset) return;
    /* On leaving a date / time box, show what was understood: "2 Dec 26", "19:05". */
    if ('fvDate' in el.dataset) { const iso = parseDateText(el.value); if (iso) el.value = dShort(iso); }
    if ('fvTime' in el.dataset) { const tm = parseTimeText(el.value); if (tm) el.value = tm; }
    if (el.dataset.fvClubpax) { const [id, i] = el.dataset.fvClubpax.split('|'); const c = UI.club[id]; if (!c) return; c.lines[Number(i)].pax = Number(el.value); clubRefresh(id, `[data-fv-clubpax="${id}|${i}"]`); return; }
    if (el.dataset.fvTkpax) {
      const [id, secId, rowId] = el.dataset.fvTkpax.split('|'); const s = S[id]; const sec = s && secOf(s, secId); const r = sec?.tickets.find((x) => x.id === rowId);
      if (!r || r.status !== 'pending' || !canEditFlight(s)) return;
      const np = Number(el.value);
      if (activeRows(s, sec).some((x) => x !== r && Number(x.pax) === np)) { TN.toast(`${paxName(s, np)} already has a line on this flight.`, 'danger'); TN.refresh(); return; }
      r.pax = np; TN.refresh(); focusLater(`[data-fv-tkpax="${id}|${secId}|${rowId}"]`);
      return;
    }
    /* Passenger choice (shared booking list, Alternate draft, + Add Sector draft). Every copy of the same list on the
       page is kept in step (the booking list shows in both sections). */
    if (el.dataset.fvPick) {
      const k = el.dataset.fvPick; const [scope, id, key] = k.split('|'); const d = draftGet(scope, id, key); const grp = el.closest('[data-fv-pickgrp]'); if (!d || !grp) return;
      const boxes = [...grp.querySelectorAll('input[data-fv-pick]')].filter((b) => b.value !== 'all');
      const free = boxes.filter((b) => !b.disabled);
      const kept = boxes.filter((b) => b.disabled && b.checked).map((b) => Number(b.value));
      d.pax = el.value === 'all' ? [...new Set([...kept, ...(el.checked ? free.map((b) => Number(b.value)) : [])])] : boxes.filter((b) => b.checked).map((b) => Number(b.value));
      d.pax.sort((a, b) => a - b);
      document.querySelectorAll(`[data-fv-pickgrp="${k}"]`).forEach((g) => {
        const bs = [...g.querySelectorAll('input[data-fv-pick]')]; const items = bs.filter((b) => b.value !== 'all');
        items.forEach((b) => { b.checked = d.pax.includes(Number(b.value)); });
        const allBox = bs.find((b) => b.value === 'all'); const fr = items.filter((b) => !b.disabled); if (allBox) allBox.checked = fr.length > 0 && fr.every((b) => b.checked);
      });
      const s = S[id]; const names = d.pax.map((p) => paxName(s, p));
      document.querySelectorAll(`[data-fv-picksum="${k}"]`).forEach((o) => { o.innerHTML = pickSumHtml(names, Number(o.dataset.total)); });
      document.querySelectorAll(`[data-fv-persons="${k}"]`).forEach((o) => { o.textContent = String(d.pax.length); });
      document.querySelectorAll(`[data-fv-pdsum="${k}"]`).forEach((o) => { o.innerHTML = pdSumHtml(s, d.pax); });
    }
    /* + Add Sector: changing the journey re-lists the passengers not on a flight for it and fills in its route. */
    if (el.dataset.fvAddseg) {
      const id = el.dataset.fvAddseg; const s = S[id]; const d = UI.add[id]; if (!s || !d) return;
      const was = journeys(s).find((j) => j.id === d.seg); const now = journeys(s).find((j) => j.id === el.value);
      ['from', 'to', 'departureDate', 'arrivalDate', 'class'].forEach((f) => { if (!d[f] || (was && d[f] === was[f])) d[f] = now ? now[f] || '' : f === 'class' ? d[f] : ''; });
      d.seg = el.value; d.pax = d.where === 'alt' ? addEligible(s, d.seg).filter((x) => mainPax(s).includes(x)) : addPaxDefault(s, id, d.seg);
      TN.refresh(); focusLater(`[data-fv-addseg="${id}"]`);
    }
  });
  const closePaxDrops = (ev) => document.querySelectorAll('details[data-fv-pd][open]').forEach((o) => { if (!ev || !o.contains(ev.target)) o.open = false; });
  window.addEventListener('scroll', (ev) => { if (!(ev.target instanceof Element && ev.target.closest('.fv-pd-list'))) closePaxDrops(); }, true);
  document.addEventListener('click', (ev) => { if (!ev.target.closest('details[data-fv-pd]')) closePaxDrops(); });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { const o = document.querySelector('details[data-fv-pd][open]'); if (o) { o.open = false; o.querySelector('summary').focus(); } } });
  document.addEventListener('toggle', (ev) => {
    const el = ev.target; if (!el || !el.dataset) return;
    if (el.dataset.fvPickbox) UI.pickOpen[el.dataset.fvPickbox] = el.open;
    if (el.hasAttribute('data-fv-pd') && el.open) {
      document.querySelectorAll('details[data-fv-pd][open]').forEach((o) => { if (o !== el) o.open = false; });
      const r = el.querySelector('summary').getBoundingClientRect(); const list = el.querySelector('.fv-pd-list');
      const w = Math.max(r.width, 240); const left = Math.min(r.left, window.innerWidth - w - 8);
      Object.assign(list.style, { top: `${r.bottom + 2}px`, left: `${Math.max(8, left)}px`, minWidth: `${w}px` });
    }
  }, true);

  /* Open / close sections without a re-draw (typed values stay). */
  TN.act('fv-alt-sel', (el) => { (UI.altSel[el.dataset.id] = UI.altSel[el.dataset.id] || {})[el.dataset.sec] = el.checked; });
  TN.act('fv-club-open', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return;
    openClub(id, sectorsOf(s).filter((x) => UI.altSel[id]?.[x.id] && isLive(s, x) && !waitsForSales(x)), bkStore(s, 'main'));
  });
  function openClub(id, secs, fares = {}) {
    const s = S[id];
    if (!secs.length) return TN.toast('Tick the flights to confirm first.', 'danger');
    const elig = clubElig(s, secs);
    if (!elig.length) return TN.toast('Every passenger on the ticked flights is already confirmed.', 'danger');
    UI.club[id] = { secs: secs.map((x) => x.id), lines: [{ pax: elig[0], crsType: '', crsPnr: '', airlinePnr: '', ticketNumber: '' }], fares: JSON.parse(JSON.stringify(fares || {})), err: null };
    TN.dialog({ title: `Confirm tickets · ${secs.length} ${secs.length === 1 ? 'flight' : 'flights'}`, body: `<div id="fv-club-body-${id}" class="fv-club">${clubBody(s, id)}</div>`, footer: `<button type="button" class="${B.ghostMd}" data-close>Cancel</button><button type="button" class="${B.primaryMd}" data-act="fv-club-confirm" data-id="${id}">${ic('check-check', 'size-4')}Confirm tickets</button>` });
    /* Wider popup for the tables, and no animation. */
    const dlg = document.querySelector('#tn-overlay [role="dialog"], #tn-overlay [role="alertdialog"]'); if (dlg) { dlg.classList.add('fv-modal'); dlg.style.maxWidth = 'min(76rem, calc(100vw - 2rem))'; }
    focusLater(`[data-fv-club="${id}|0|crsType"]`);
  }
  /* ---------- Passenger itinerary actions ---------- */
  const itinOf = (s, itinId) => itinsOf(s).find((x) => x.id === itinId);
  const fdlg = () => { const dlg = document.querySelector('#tn-overlay [role="dialog"], #tn-overlay [role="alertdialog"]'); if (dlg) dlg.classList.add('fv-modal'); };
  TN.act('fv-itin-new', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return;
    const why = (p) => (openItin(s, p) ? 'already has a new itinerary' : flightsOfPax(s, p).some((sec) => confirmedRow(s, sec, p)) ? 'has a confirmed ticket' : '');
    const opts = allPax(s).map((p) => `<option value="${p}"${why(p) ? ' disabled' : ''}>${esc(paxName(s, p))} (${FARE_LABEL[fareType(s, p)]})${why(p) ? ` — ${why(p)}` : ''}</option>`).join('');
    const first = allPax(s).find((p) => !why(p));
    if (first == null) return TN.toast('Every passenger already has a new itinerary or a confirmed ticket.', 'danger');
    TN.dialog({ title: 'Add New Table', body: `<div class="flex flex-col gap-3"><p class="m-0 text-copy">Choose the passenger. A separate itinerary table is made for them, starting with their current flights. Their current flights move to <b>Previous Itinerary</b>. The other passengers are not changed.</p>${field(`fv-itin-pax-${id}`, 'Passenger', `<select id="fv-itin-pax-${id}" class="${C.input} h-10 w-full px-2">${opts.replace(`value="${first}"`, `value="${first}" selected`)}</select>`)}</div>`, footer: `<button type="button" class="${B.ghostMd}" data-close>Cancel</button><button type="button" class="${B.primaryMd}" data-act="fv-itin-create" data-id="${id}">Create table</button>` });
    fdlg(); focusLater(`#fv-itin-pax-${id}`);
  });
  TN.act('fv-itin-create', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return;
    const p = Number(document.querySelector(`#fv-itin-pax-${id}`)?.value);
    if (!allPax(s).includes(p) || openItin(s, p)) { TN.closeOverlay(); return TN.toast('That passenger already has a new itinerary.', 'danger'); }
    const cur = flightsOfPax(s, p);
    const it = { id: uid('it-'), pax: p, status: 'draft', rows: cur.map(itinRowOf), prev: cur.map((g) => ({ ...pickFields(g) })), createdAt: NOW(), createdBy: me() };
    itinsOf(s).push(it); UI.altOpen[id] = true; UI.mainOpen[id] = false;
    addH(id, `New itinerary table made for ${paxName(s, p)}`, { detail: `Previous itinerary kept for reference: ${cur.map(secName).join(', ') || 'no flights'}.` });
    TN.closeOverlay(); TN.toast(`New itinerary table made for ${paxName(s, p)}. Change the flights, then send it to Sales.`); TN.refresh();
  });
  TN.act('fv-itin-alt', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinOf(s, el.dataset.itin); const row = it?.rows.find((r) => r.id === el.dataset.row); if (!row) return;
    UI.itinEdit[id] = { itin: it.id, row: row.id, d: { ...row } }; TN.refresh(); focusLater(`[data-fv-draft="itin|${id}|${row.id}|departureDate"]`);
  });
  TN.act('fv-itin-addrow', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinOf(s, el.dataset.itin); if (!it) return;
    const last = it.rows.at(-1) || it.prev.at(-1) || {};
    const row = { id: uid('ir-'), ...pickFields({ class: last.class || requestOf(s).cabin || '', airline: last.airline || '' }), remark: '' };
    it.rows.push(row); if (it.status === 'rejected') it.status = 'draft';
    TN.refresh(); focusLater(`[data-fv-itrow="${id}|${it.id}|${row.id}|departureDate"]`);
  });
  TN.act('fv-itin-cancel', (el) => { const id = el.dataset.id; delete UI.itinEdit[id]; TN.refresh(); });
  TN.act('fv-itin-remove', (el) => {
    const id = el.dataset.id; const s = S[id]; const e = UI.itinEdit[id]; const it = e && itinOf(s, e.itin); if (!it) return;
    it.rows = it.rows.filter((r) => r.id !== e.row); if (it.status === 'rejected') it.status = 'draft'; delete UI.itinEdit[id]; TN.refresh();
  });
  TN.act('fv-itin-save', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const e = UI.itinEdit[id]; const it = e && itinOf(s, e.itin); if (!it) return;
    const d = e.d; const base = it.rows.find((r) => r.id === e.row) || {};
    autoArrival(d); autoAirline(d, base);
    const g = pickFields(normalizeSegment(d)); const issues = fieldIssues(g, `The flight for ${paxName(s, it.pax)}`);
    if (issues.length) { UI.err[`itin-${it.id}`] = { title: 'The flight was not saved', items: issues }; TN.refresh(); focusLater(`#itin-${it.id}-summary`); return; }
    if (e.row === '_new') it.rows.push({ id: uid('ir-'), ...g, remark: String(d.remark || '').trim() });
    else Object.assign(base, g, { remark: String(d.remark || '').trim() });
    it.rows.sort((a, b) => String(a.departureDate + a.departure).localeCompare(String(b.departureDate + b.departure)));
    if (it.status === 'rejected') it.status = 'draft';
    delete UI.itinEdit[id]; delete UI.err[`itin-${it.id}`]; TN.refresh();
  });
  TN.act('fv-itin-discard', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinOf(s, el.dataset.itin); if (!it || !['draft', 'rejected'].includes(it.status)) return;
    it.status = 'discarded'; delete UI.itinEdit[id]; delete UI.err[`itin-${it.id}`]; if (!itinsOf(s).some((x) => ['draft', 'pending', 'rejected', 'approved'].includes(x.status))) UI.mainOpen[id] = true;
    addH(id, `New itinerary for ${paxName(s, it.pax)} discarded`, { detail: 'The passenger keeps the previous itinerary.' });
    TN.toast(`Table discarded. ${paxName(s, it.pax)} keeps the previous itinerary.`); TN.refresh();
  });
  TN.act('fv-itin-send', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinOf(s, el.dataset.itin); if (!it || !['draft', 'rejected'].includes(it.status)) return;
    const name = paxName(s, it.pax); const issues = [];
    it.rows.forEach((r) => { autoArrival(r); autoAirline(r, r.base || { airline: r.airline }); });
    it.rows.sort((a, b) => String((a.departureDate || '9') + a.departure).localeCompare(String((b.departureDate || '9') + b.departure)));
    if (!it.rows.length) issues.push('Add at least one flight to the new itinerary.');
    it.rows.forEach((r) => issues.push(...fieldIssues(pickFields(r), `${r.from || '—'} → ${r.to || '—'}`)));
    const key = (list) => list.map((g) => segmentKey(g)).sort().join('#');
    if (it.rows.length && key(it.rows) === key(it.prev)) issues.push('The new itinerary is the same as the previous one. Change at least one flight.');
    if (issues.length) { UI.err[`itin-${it.id}`] = { title: 'Not sent to Sales', items: issues }; TN.refresh(); focusLater(`#itin-${it.id}-summary`); return; }
    Object.assign(it, { status: 'pending', submittedAt: NOW(), submittedBy: me(), rejectionReason: '' }); delete UI.err[`itin-${it.id}`];
    const flights = it.rows.map((r) => `${flightNo(r)} ${r.from} → ${r.to} ${TN.fmt.date(r.departureDate)}`).join('; ');
    addH(id, `New itinerary for ${name} sent to Sales for approval`, { detail: `For ${name} only. Replaces their previous itinerary (${it.prev.map((g) => `${flightNo(g)} ${g.from} → ${g.to}`).join('; ') || 'none'}) with: ${flights}. Other passengers unchanged.` });
    personNotice(TN.deal(s.deal).owner, `Flight asks you to approve a new itinerary for ${name} only (${s.deal}). It replaces ${name}'s previous itinerary; the other passengers keep their flights. New flights: ${flights}.`, s.deal, `#/app/deals/${s.deal}?tab=services`);
    TN.toast(`Sent to ${ownerName(s.deal)} (Sales) for approval: new itinerary for ${name} only.`); TN.refresh();
  });
  TN.act('fv-itin-decide', (el) => {
    const id = el.dataset.id; const s = S[id]; const it = s && itinOf(s, el.dataset.itin);
    if (!it || it.status !== 'pending' || me() !== TN.deal(s.deal)?.owner) return TN.toast('This itinerary is no longer waiting for your decision.', 'danger');
    if (el.dataset.decision === 'approve') return decideItin(id, it.id, 'approve', '');
    TN.dialog({ title: `Reject the new itinerary for ${esc(paxName(s, it.pax))}?`, body: `<div id="fv-itinrej-err-${id}"></div>${field(`fv-itinrej-${id}`, 'Reason for rejection', textInput(`fv-itinrej-${id}`, 'reason', ''), { hint: `Required. ${esc(paxName(s, it.pax))} keeps the previous itinerary.` })}`, footer: `<button type="button" class="${B.ghostMd}" data-close>Cancel</button><button type="button" class="${B.danger}" data-act="fv-itin-reject-confirm" data-id="${id}" data-itin="${it.id}">Reject itinerary</button>` });
    fdlg();
  });
  TN.act('fv-itin-reject-confirm', (el) => {
    const id = el.dataset.id; const reason = String(document.querySelector(`#fv-itinrej-${id}`)?.value || '').trim();
    if (!reason) { const box = document.querySelector(`#fv-itinrej-err-${id}`); if (box) box.innerHTML = errorSummary('Rejection reason required', 'Enter the reason for rejecting this itinerary.'); return; }
    decideItin(id, el.dataset.itin, 'reject', reason);
  });
  function decideItin(id, itinId, decision, reason) {
    const s = S[id]; const it = s && itinOf(s, itinId);
    if (!it || it.status !== 'pending' || !TN.is('sales') || me() !== TN.deal(s.deal)?.owner || s.taskStatus !== 'in_progress') { TN.closeOverlay(); return TN.toast('This itinerary is no longer available to decide.', 'danger'); }
    const p = it.pax; const name = paxName(s, p);
    Object.assign(it, { status: decision === 'approve' ? 'approved' : 'rejected', decidedBy: me(), decidedAt: NOW(), rejectionReason: reason });
    if (decision === 'approve') {
      /* The passenger leaves their current flights (other passengers stay) and gets the new flights. Nothing is deleted. */
      flightsOfPax(s, p).forEach((sec) => { const root = secOf(s, rootOf(sec)) || sec; root.out = [...new Set([...(root.out || []), p])]; sec.tickets = sec.tickets.filter((x) => !(x.status === 'pending' && Number(x.pax) === p)); });
      itinsOf(s).filter((x) => x !== it && x.pax === p && x.status === 'approved').forEach((x) => { x.status = 'replaced'; });
      it.secIds = it.rows.map((r) => {
        const no = String(sectorsOf(s).filter((x) => x.kind !== 'alternative').length + 1).padStart(2, '0');
        const sec = { id: uid('fs-'), kind: 'added', no, seg: null, itin: it.id, ...pickFields(r), remark: r.remark || '', pax: [p], fares: {}, createdAt: NOW(), createdBy: it.createdBy, tickets: [newRow(p)] };
        sectorsOf(s).push(sec); return sec.id;
      });
    }
    addH(id, `New itinerary for ${name} ${decision === 'approve' ? 'approved' : 'rejected'} by Sales`, reason ? { detail: `Reason: ${reason}` } : { detail: `${name} now flies: ${it.rows.map((r) => `${flightNo(r)} ${r.from} → ${r.to}`).join('; ')}. Other passengers unchanged.` });
    if (s.assignee) personNotice(s.assignee, `Sales ${decision === 'approve' ? 'approved' : 'rejected'} the new itinerary for ${name} (${s.deal}).${reason ? ` Reason: ${reason}` : ' You can confirm the tickets now.'}`, s.deal, `#/app/flight/${id}?tab=work`);
    TN.closeOverlay(); TN.toast(decision === 'approve' ? `Approved. ${name} moves to the new itinerary; Flight can confirm the tickets.` : `Rejected. ${name} keeps the previous itinerary.`); TN.refresh();
  }
  TN.act('fv-itin-sel', (el) => { (UI.itinSel[el.dataset.id] = UI.itinSel[el.dataset.id] || {})[el.dataset.sec] = el.checked; });
  TN.act('fv-itin-confirm', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinOf(s, el.dataset.itin); if (!it || it.status !== 'approved') return;
    const pend = itinSecs(s, it).filter((sec) => isLive(s, sec) && !confirmedRow(s, sec, it.pax));
    const ticked = pend.filter((sec) => UI.itinSel[id]?.[sec.id]);
    openClub(id, ticked.length ? ticked : pend, it.fares || {});
  });
  TN.act('fv-club-add', (el) => {
    const id = el.dataset.id; const s = S[id]; const c = UI.club[id]; if (!c) return;
    const used = c.lines.map((l) => l.pax); const next = clubElig(s, clubSecs(s, c)).find((p) => !used.includes(p)); if (next == null) return;
    const prev = c.lines.at(-1);
    c.lines.push({ pax: next, crsType: prev.crsType, crsPnr: prev.crsPnr, airlinePnr: prev.airlinePnr, ticketNumber: prev.ticketNumber ? nextTicket(prev.ticketNumber) : '' });
    clubRefresh(id, `[data-fv-club="${id}|${c.lines.length - 1}|ticketNumber"]`);
  });
  TN.act('fv-club-del', (el) => { const id = el.dataset.id; const c = UI.club[id]; if (!c) return; c.lines.splice(Number(el.dataset.i), 1); clubRefresh(id, '[data-act="fv-club-add"]'); });
  TN.act('fv-club-confirm', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const c = UI.club[id]; if (!c) return;
    const secs = clubSecs(s, c).filter((x) => isLive(s, x) && !waitsForSales(x));
    const issues = [];
    const lines = c.lines.filter(clubFilled);
    if (!secs.length) issues.push('The ticked flights changed. Close this and tick them again.');
    if (!lines.length) issues.push('Fill in at least one passenger\u2019s CRS type, PNRs and ticket number.');
    /* Ticket numbers: one passenger per number (the same passenger keeps it on every clubbed flight). */
    const owner = new Map(); sectorsOf(s).forEach((sec) => sec.tickets.filter((x) => x.status === 'confirmed').forEach((x) => owner.set(norm(x.ticketNumber), Number(x.pax))));
    lines.forEach((l) => {
      const who = paxName(s, l.pax); const crs = String(l.crsType || '').trim(); const tn = norm(l.ticketNumber);
      if (!clubOn(s, secs, l.pax).length) issues.push(`${who}: already confirmed on the ticked flights.`);
      if (!crs) issues.push(`${who}: enter the CRS type.`);
      if (crs.toLowerCase() !== 'airline direct' && !PNR_RE.test(norm(l.crsPnr))) issues.push(`${who}: enter the CRS PNR (5–8 letters or numbers).`);
      if (!PNR_RE.test(norm(l.airlinePnr))) issues.push(`${who}: enter the Airline PNR (5–8 letters or numbers).`);
      if (!TICKET_RE.test(tn)) issues.push(`${who}: enter the ticket number (numbers; dashes are allowed).`);
      else if (owner.has(tn) && owner.get(tn) !== l.pax) issues.push(`${who}: ticket number ${tn} already belongs to ${paxName(s, owner.get(tn))}.`);
      else owner.set(tn, l.pax);
    });
    FARE_TYPES.filter((ty) => lines.some((l) => fareType(s, l.pax) === ty)).forEach((ty) => {
      const f = c.fares[ty] || {};
      if (fareNum(f.basic) == null) issues.push(`${FARE_LABEL[ty]}: enter the basic amount.`);
      FB.forEach(([k, lab]) => { if (String(f[k] ?? '').trim() !== '' && fareNum(f[k]) == null) issues.push(`${FARE_LABEL[ty]}: ${lab} must be a number.`); });
      if (fbTotal(f) < 0) issues.push(`${FARE_LABEL[ty]}: the discount is more than the fare.`);
    });
    if (issues.length) { c.err = issues; clubRefresh(id, `#fv-club-err-${id}`); return; }
    /* Confirm: every ticked flight each passenger is on gets the same details. The fare (one ticket for all the
       clubbed flights) is kept on the first flight; the others say it is included. */
    const gid = uid('tg-'); const at = NOW(); let n = 0;
    lines.forEach((l) => {
      const ty = fareType(s, l.pax); const f = c.fares[ty] || {}; const total = fbTotal(f);
      const breakdown = Object.fromEntries([...FB.map(([k]) => [k, fbNum(f[k])]), ['total', total]]);
      clubOn(s, secs, l.pax).forEach((sec, i, arr) => {
        let r = sec.tickets.find((x) => Number(x.pax) === l.pax && x.status === 'pending');
        if (!r) { r = newRow(l.pax); sec.tickets.push(r); }
        Object.assign(r, { crsType: String(l.crsType).trim(), crsPnr: norm(l.crsPnr), airlinePnr: norm(l.airlinePnr), ticketNumber: norm(l.ticketNumber), fare: i === 0 ? total : 0, fareBreakup: breakdown, group: gid, inclWith: i === 0 ? null : secName(arr[0]), status: 'confirmed', confirmedAt: at, confirmedBy: me() });
        n++;
      });
    });
    addH(id, `${TN.fmt.plural(n, 'passenger ticket')} confirmed together on ${secs.map(secName).join(' + ')}`, { detail: lines.map((l) => `${paxName(s, l.pax)} · PNR ${norm(l.airlinePnr)} · ticket ${norm(l.ticketNumber)} · fare ${TN.fmt.inr(fbTotal(c.fares[fareType(s, l.pax)]))}`).join('; ') });
    delete UI.club[id]; UI.altSel[id] = {}; delete UI.err[`done-${id}`];
    TN.closeOverlay();
    const left = pendingPairs(s).length;
    TN.toast(`${TN.fmt.plural(n, 'ticket')} confirmed with the same PNR and ticket numbers.${left ? ` ${left} still pending.` : ' Every passenger is confirmed.'}`);
    TN.refresh();
  });
  TN.act('fv-itin-delrow', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const it = itinsOf(s).find((x) => x.id === el.dataset.itin); if (!it || !['draft', 'rejected'].includes(it.status)) return;
    it.rows = it.rows.filter((r) => r.id !== el.dataset.row); if (it.status === 'rejected') it.status = 'draft';
    TN.toast('Flight deleted from the new itinerary.'); TN.refresh();
  });
  /* Delete a sector added to the main table (no confirmed ticket). It is kept in History as deleted, and any passengers
     it took from another flight go back to that flight. */
  TN.act('fv-sec-del', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const sec = secOf(s, el.dataset.sec); if (!sec || !canDeleteSec(s, sec)) return;
    (sec.movedFrom || []).forEach(({ p, from }) => { const f = secOf(s, from); const root = f && (secOf(s, rootOf(f)) || f); if (root) root.out = (root.out || []).filter((x) => x !== p); if (f) ensureRow(s, f); });
    Object.assign(sec, { deleted: true, deletedAt: NOW(), deletedBy: me() });
    addH(id, `Sector deleted: ${secName(sec)}`, { detail: (sec.movedFrom || []).length ? 'Its passengers went back to their earlier flight.' : '' });
    TN.toast(`${secName(sec)} deleted.`); TN.refresh();
  });
  TN.act('fv-main-toggle', (el) => {
    const id = el.dataset.id; const open = el.getAttribute('aria-expanded') !== 'true';
    UI.mainOpen[id] = open; el.setAttribute('aria-expanded', String(open));
    const body = document.getElementById(`main-${id}-body`); if (body) body.hidden = !open;
  });
  TN.act('fv-conf-toggle', (el) => {
    const id = el.dataset.id; const open = el.getAttribute('aria-expanded') !== 'true';
    UI.confOpen[id] = open; if (!open) delete UI.err[`conf-${id}`];
    el.setAttribute('aria-expanded', String(open));
    const body = document.getElementById(`confirm-${id}-body`); if (body) body.hidden = !open;
  });
  TN.act('fv-alt-toggle', (el) => {
    const id = el.dataset.id; const open = el.getAttribute('aria-expanded') !== 'true';
    UI.altOpen[id] = open; if (!open) delete UI.err[`alt-${id}`];
    el.setAttribute('aria-expanded', String(open));
    const body = document.getElementById(`alt-${id}-body`); if (body) body.hidden = !open;
  });
  /* Alternate: the sector's own row becomes editable (flight_changes_2.md 2). Works on any live sector that is not waiting for Sales. */
  TN.act('fv-alt-start', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return;
    const sec = secOf(s, el.dataset.sec); if (!sec || !isLive(s, sec) || waitsForSales(sec)) return;
    if (altEditing(s, id)) { TN.toast('Save or cancel the flight you are editing first.', 'danger'); return; }
    /* Passengers already ticked in the global row are used (if they can move); otherwise this flight's passengers. */
    const lock = altLock(s, sec); const ticked = draftGet('board', id).pax.filter((p) => !lock(p));
    (UI.alt[id] = UI.alt[id] || {})[sec.id] = { ...pickFields(sec), pax: ticked.length ? ticked : activePax(s, sec).filter((p) => !lock(p)), remark: '' };
    UI.altOpen[id] = true; delete UI.err[`alt-${id}`];
    TN.refresh(); focusLater(`[data-fv-draft="alt|${id}|${sec.id}|airline"]`);
  });
  TN.act('fv-alt-cancel', (el) => { const id = el.dataset.id; if (UI.alt[id]) delete UI.alt[id][el.dataset.sec]; delete UI.err[`alt-${id}`]; TN.refresh(); focusLater(`[data-act="fv-alt-start"][data-sec="${el.dataset.sec}"]`); });
  TN.act('fv-alt-save', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return;
    const sec = secOf(s, el.dataset.sec); const d = UI.alt[id]?.[el.dataset.sec];
    if (!sec || !d) return; /* already saved (double click): never makes a second sector */
    if (!isLive(s, sec) || waitsForSales(sec)) { delete UI.alt[id][sec.id]; TN.toast('This flight changed meanwhile. Start the alternative again.', 'danger'); TN.refresh(); return; }
    autoArrival(d); autoAirline(d, sec);
    const g = pickFields(normalizeSegment(d));
    const issues = fieldIssues(g, `The alternative for ${secName(sec)}`);
    if (segmentKey(g) === segmentKey(sec)) issues.push('Change at least one flight detail. The alternative is the same as the current flight.');
    const lock = altLock(s, sec);
    const pax = [...new Set(d.pax.map(Number))].filter((p) => allPax(s).includes(p)).sort((a, b) => a - b);
    if (!pax.length) issues.push('Choose at least one passenger for the alternative.');
    pax.filter(lock).forEach((p) => issues.push(`${paxName(s, p)} cannot be moved (${lock(p)}).`));
    if (!String(d.remark || '').trim()) issues.push('Enter a remark with the reason for the alternative.');
    if (issues.length) { UI.err[`alt-${id}`] = { title: 'The alternative was not saved', items: issues }; UI.altOpen[id] = true; TN.refresh(); focusLater(`#alt-${id}-summary`); return; }
    const line = rootOf(sec); const root = secOf(s, line) || sec;
    /* Fares are not typed on the alternative; the current flight's fares are carried over for Confirmation (still editable there). */
    const alt = { id: uid('fs-'), kind: 'alternative', parent: line, replaces: sec.id, no: `${root.no}-${String.fromCharCode(65 + allAltsOf(s, line).length)}`, ...g, pax, remark: d.remark.trim(), approval: 'pending', fares: { ...(sec.fares || {}) }, createdAt: NOW(), createdBy: me(), tickets: [] };
    /* The chosen passengers move to the alternative: their pending rows on this line's other versions go.
       Confirmed rows are never touched, and passengers not chosen stay on the current flight. */
    sectorsOf(s).filter((x) => rootOf(x) === line).forEach((x) => { x.tickets = x.tickets.filter((t) => t.status !== 'pending' || !pax.includes(Number(t.pax))); });
    sectorsOf(s).push(alt);
    alt.tickets.push(newRow(pax[0]));
    sectorsOf(s).filter((x) => rootOf(x) === line).forEach((x) => ensureRow(s, x));
    delete UI.alt[id][sec.id]; delete UI.err[`alt-${id}`];
    const names = pax.map((p) => paxName(s, p)).join(', '); const replaced = !isLive(s, sec);
    addH(id, `Alternative sent to Sales for approval: ${secName(sec)} → ${flightNo(alt)}`, { detail: `${flightNo(alt)} ${alt.from} → ${alt.to} on ${TN.fmt.date(alt.departureDate)} ${alt.departure}–${alt.arrival} for ${names}. Remark: ${alt.remark}. ${replaced ? `${secName(sec)} moved to Flight sector history.` : `${secName(sec)} stays for the other passengers.`}` });
    personNotice(TN.deal(s.deal).owner, `Flight alternative for ${s.deal} needs your approval: ${secName(sec)} to ${flightNo(alt)} for ${names}. Reason: ${alt.remark}`, s.deal, `#/app/deals/${s.deal}?tab=services`);
    TN.toast(`Alternative ${flightNo(alt)} sent to ${ownerName(s.deal)} (Sales) for approval.${replaced ? ' The earlier flight is in Flight sector history.' : ''}`);
    TN.refresh();
  });

  /* Sales approves or rejects an alternative (Sales approval kept, C1). Reject needs a reason. */
  TN.act('fv-alt-decide', (el) => {
    const id = el.dataset.id; const s = S[id]; const a = s && secOf(s, el.dataset.sec);
    if (!a || !waitsForSales(a) || me() !== TN.deal(s.deal)?.owner) return TN.toast('This alternative is no longer waiting for your decision.', 'danger');
    if (el.dataset.decision === 'approve') return decideAlternative(id, a.id, 'approve', '');
    TN.dialog({ title: `Reject alternative ${esc(a.no)}?`, body: `<div id="fv-altrej-err-${id}"></div>${field(`fv-altrej-${id}`, 'Reason for rejection', textInput(`fv-altrej-${id}`, 'reason', ''), { hint: 'Required. The passengers go back to their sector, and Flight can send another alternative.' })}`, footer: `<button type="button" class="${B.ghostMd}" data-close>Cancel</button><button type="button" class="${B.danger}" data-act="fv-alt-reject-confirm" data-id="${id}" data-sec="${a.id}">Reject alternative</button>` });
  });
  TN.act('fv-alt-reject-confirm', (el) => {
    const id = el.dataset.id; const reason = String(document.querySelector(`#fv-altrej-${id}`)?.value || '').trim();
    if (!reason) { const box = document.querySelector(`#fv-altrej-err-${id}`); if (box) box.innerHTML = errorSummary('Rejection reason required', 'Enter the reason for rejecting this alternative.'); return; }
    decideAlternative(id, el.dataset.sec, 'reject', reason);
  });
  function decideAlternative(id, secId, decision, reason) {
    const s = S[id]; const a = s && secOf(s, secId);
    if (!a || !TN.is('sales') || me() !== TN.deal(s.deal)?.owner || s.taskStatus !== 'in_progress' || !waitsForSales(a) || (decision === 'reject' && !reason)) { TN.closeOverlay(); return TN.toast('This alternative is no longer available to decide.', 'danger'); }
    Object.assign(a, { approval: decision === 'approve' ? 'approved' : 'rejected', decidedBy: me(), decidedAt: NOW(), rejectionReason: reason });
    /* Rejected: its passengers go back to the sector they were on; that sector gets a ticket row again. */
    if (decision === 'reject') sectorsOf(s).filter((x) => rootOf(x) === a.parent).forEach((x) => ensureRow(s, x));
    addH(id, `Alternative ${a.no} ${decision === 'approve' ? 'approved' : 'rejected'} by Sales`, reason ? { detail: `Reason: ${reason}` } : {});
    if (s.assignee) personNotice(s.assignee, `Sales ${decision === 'approve' ? 'approved' : 'rejected'} flight alternative ${a.no} for ${s.deal}.${reason ? ` Reason: ${reason}` : ''}`, s.deal, `#/app/flight/${id}?tab=work`);
    TN.closeOverlay();
    TN.toast(decision === 'approve' ? `Alternative ${flightNo(a)} approved. Flight can now confirm its tickets.` : `Alternative ${flightNo(a)} rejected. The passengers go back to their earlier flight.`);
    TN.refresh();
  }

  /* Confirmation: selection, passenger rows, added sectors, confirm. */
  TN.act('fv-sel-sec', (el) => { selOf(el.dataset.id).sec[el.dataset.sec] = el.checked; });
  /* Open / close a flight's passenger drop-down without a re-draw (typed values stay). */
  TN.act('fv-sec-toggle', (el) => {
    const k = `${el.dataset.id}|${el.dataset.sec}`; const open = el.getAttribute('aria-expanded') !== 'true';
    UI.secOpen[k] = open; el.setAttribute('aria-expanded', String(open));
    document.querySelectorAll(`tr[data-sub="${el.dataset.sec}"]`).forEach((r) => { r.hidden = !open; });
  });
  TN.act('fv-row-add', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const sec = secOf(s, el.dataset.sec); if (!sec) return;
    const next = notAdded(s, sec)[0];
    if (next == null) return TN.toast('Every passenger on this flight already has a row.', 'danger');
    const row = newRow(next, activeRows(s, sec).at(-1)); sec.tickets.push(row);
    UI.secOpen[`${id}|${sec.id}`] = true;
    TN.refresh(); focusLater(`[data-fv-tk="${id}|${sec.id}|${row.id}|ticketNumber"]`);
  });
  /* + Add Sector (flight_changes_2.md 1): a new flight for passengers not yet on a flight for a journey. Started from
     either section; the draft row shows in that section. Existing sectors are never changed. */
  const addErrKey = (id) => (UI.add[id]?.where === 'alt' ? `alt-${id}` : `conf-${id}`);
  TN.act('fv-add-sector', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const where = el.dataset.where === 'alt' ? 'alt' : 'conf';
    if ((where === 'alt' && Object.values(UI.alt[id] || {}).some(Boolean))) { TN.toast('Save or cancel the flight you are editing first.', 'danger'); return; }
    if (!UI.add[id]) {
      const j = journeys(s).find((x) => gapsIn(s, x).length) || journeys(s)[0]; const seg = j ? j.id : 'new';
      UI.add[id] = { ...pickFields(j ? { from: j.from, to: j.to, departureDate: j.departureDate, arrivalDate: j.arrivalDate, class: j.class, airline: j.airline } : { class: requestOf(s).cabin || '' }), seg, pax: where === 'alt' ? addEligible(s, seg).filter((x) => mainPax(s).includes(x)) : addPaxDefault(s, id, seg), where };
    } else UI.add[id].where = where;
    if (where === 'alt') UI.altOpen[id] = true;
    delete UI.err[`conf-${id}`]; delete UI.err[`alt-${id}`]; TN.refresh(); focusLater(`[data-fv-draft="add|${id}|_|airline"]`);
  });
  TN.act('fv-add-cancel', (el) => { const id = el.dataset.id; delete UI.err[addErrKey(id)]; const where = UI.add[id]?.where; delete UI.add[id]; TN.refresh(); focusLater(`[data-act="fv-add-sector"][data-where="${where}"]`); });
  TN.act('fv-add-save', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const d = UI.add[id]; if (!d) return;
    if (d.where === 'alt') { autoArrival(d); const j = journeys(s).find((x) => x.id === d.seg); autoAirline(d, j); }
    const g = pickFields(normalizeSegment(d)); const issues = fieldIssues(g, 'The new sector');
    const seg = journeys(s).some((j) => j.id === d.seg) ? d.seg : 'new';
    const elig = addEligible(s, seg);
    const pax = [...new Set(d.pax.map(Number))].filter((p) => allPax(s).includes(p)).sort((a, b) => a - b);
    if (!pax.length) issues.push('Choose at least one passenger for the new sector.');
    /* No passenger on two live flights of the same journey; no second copy of a live flight on the journey. */
    pax.filter((p) => !elig.includes(p)).forEach((p) => issues.push(`${paxName(s, p)} cannot be moved (${moveLock(s, seg, p)}).`));
    if (seg !== 'new' && liveIn(s, seg).some((x) => segmentKey(x) === segmentKey(g))) issues.push('This journey already has this exact flight. Tick the passengers in that flight’s Passengers list instead.');
    if (issues.length) { UI.err[addErrKey(id)] = { title: 'The new sector was not saved', items: issues }; TN.refresh(); focusLater(`#${addErrKey(id)}-summary`); return; }
    const no = String(sectorsOf(s).filter((x) => x.kind !== 'alternative').length + 1).padStart(2, '0');
    const sec = { id: uid('fs-'), kind: 'added', no, seg: seg === 'new' ? null : seg, ...g, pax, fares: {}, createdAt: NOW(), createdBy: me(), tickets: [newRow(pax[0])] };
    delete UI.err[addErrKey(id)]; delete UI.add[id]; delete UI.err[`done-${id}`];
    /* Passengers already on a flight for this journey leave it: that flight (and its line) no longer counts for them.
       Their pending rows there go; nothing is deleted from history. */
    const moved = seg === 'new' ? [] : pax.map((p) => ({ p, h: holderOf(s, seg, p) })).filter((m) => m.h);
    moved.forEach(({ p, h }) => { const root = secOf(s, rootOf(h)) || h; root.out = [...new Set([...(root.out || []), p])]; h.tickets = h.tickets.filter((t) => !(t.status === 'pending' && Number(t.pax) === p)); });
    sec.movedFrom = moved.map(({ p, h }) => ({ p, from: h.id }));
    sectorsOf(s).push(sec);
    addH(id, `Sector added: ${secName(sec)}`, { detail: `${seg === 'new' ? 'New journey' : `Journey ${journeyName(s, secOf(s, seg))}`}. ${TN.fmt.date(sec.departureDate)} ${sec.departure}–${sec.arrival} for ${pax.map((p) => paxName(s, p)).join(', ')}.${moved.length ? ` Moved here: ${moved.map(({ p, h }) => `${paxName(s, p)} from ${secName(h)}`).join(', ')}.` : ''}` });
    TN.toast(`${secName(sec)} added for ${TN.fmt.plural(pax.length, 'passenger')}. It is in Flight sector confirmation.`); TN.refresh();
  });
  TN.act('fv-confirm-selected', (el) => {
    const id = el.dataset.id; const s = S[id]; if (!guard(s)) return; const sel = selOf(id);
    const fail = (items) => { UI.err[`conf-${id}`] = { title: 'Nothing was confirmed', items }; TN.refresh(); focusLater(`#conf-${id}-summary`); };
    const secs = sectorsOf(s).filter((x) => !['replaced', 'confirmed', 'approval', 'rejected', 'empty'].includes(sectorState(s, x).key));
    const ticked = secs.filter((x) => sel.sec[x.id] && !waitsForSales(x));
    if (!ticked.length) return fail(['Tick at least one flight to confirm. An alternative can be confirmed only after Sales approves it.']);
    ticked.forEach((x) => { UI.secOpen[`${id}|${x.id}`] = true; }); /* show the passengers of the flights being confirmed */
    /* Passengers whose ticket fields are all blank are skipped and stay Pending (partial confirmation). */
    const blank = (r) => !['crsType', 'crsPnr', 'airlinePnr', 'ticketNumber'].some((f) => String(r[f] || '').trim());
    const picked = ticked.flatMap((sec) => activePax(s, sec).map((p) => rowFor(s, sec, p)).filter((r) => r && r.status === 'pending' && !blank(r)).map((r) => ({ sec, r })));
    if (!picked.length) { ticked.forEach((x) => { UI.secOpen[`${id}|${x.id}`] = true; }); return fail(['Open Passengers on the ticked flights and fill in at least one passenger’s ticket details.']); }
    /* A ticket number belongs to one passenger only (the same passenger may use it on more than one sector). */
    const owner = new Map();
    sectorsOf(s).forEach((sec) => sec.tickets.filter((t) => t.status === 'confirmed').forEach((t) => owner.set(norm(t.ticketNumber), Number(t.pax))));
    const issues = []; const fareAsked = new Set();
    picked.forEach(({ sec, r }) => {
      const p = Number(r.pax); const who = `${paxName(s, p)} on ${secName(sec)}`; const crs = String(r.crsType || '').trim();
      /* Fare: the sector's fare for this passenger's type (flight_changes_2.md 6). One message per sector and type. */
      const ft = fareType(s, p);
      if (fareNum(sec.fares?.[ft]) == null && !fareAsked.has(sec.id + ft)) { fareAsked.add(sec.id + ft); issues.push(`${secName(sec)}: enter the ${FARE_LABEL[ft].toLowerCase()} fare in its Fare section.`); }
      if (activeRows(s, sec).filter((x) => Number(x.pax) === p).length > 1) issues.push(`${who}: this passenger has two rows on the same sector. Remove one.`);
      if (!crs) issues.push(`${who}: enter the CRS type.`);
      if (crs.toLowerCase() !== 'airline direct' && !PNR_RE.test(norm(r.crsPnr))) issues.push(`${who}: enter the CRS PNR (5–8 letters or numbers).`);
      if (!PNR_RE.test(norm(r.airlinePnr))) issues.push(`${who}: enter the Airline PNR (5–8 letters or numbers).`);
      const tn = norm(r.ticketNumber);
      if (!TICKET_RE.test(tn)) issues.push(`${who}: enter the ticket number (numbers; dashes are allowed).`);
      else if (owner.has(tn) && owner.get(tn) !== p) issues.push(`${who}: ticket number ${tn} already belongs to ${paxName(s, owner.get(tn))}.`);
      else owner.set(tn, p);
    });
    if (issues.length) return fail(issues);
    picked.forEach(({ sec, r }) => { Object.assign(r, { crsType: String(r.crsType).trim(), crsPnr: norm(r.crsPnr), airlinePnr: norm(r.airlinePnr), ticketNumber: norm(r.ticketNumber), fare: fareNum(sec.fares[fareType(s, Number(r.pax))]), status: 'confirmed', confirmedAt: NOW(), confirmedBy: me() }); delete sel.row[r.id]; });
    secs.forEach((sec) => { delete sel.sec[sec.id]; });
    delete UI.err[`conf-${id}`]; delete UI.err[`done-${id}`];
    addH(id, `${TN.fmt.plural(picked.length, 'passenger ticket')} confirmed`, { detail: picked.map(({ sec, r }) => `${paxName(s, Number(r.pax))} · ${secName(sec)} · PNR ${r.airlinePnr} · ticket ${r.ticketNumber} · fare ${TN.fmt.inr(r.fare)}`).join('; ') });
    const left = pendingPairs(s).length;
    TN.toast(`${TN.fmt.plural(picked.length, 'ticket')} confirmed.${left ? ` ${left} still pending.` : ' Every passenger is confirmed.'}`);
    TN.refresh();
  });
  TN.act('fv-availability', () => {});
  TN.act('fv-proposal-add', (el) => {
    if (!canPropose(S[el.dataset.id])) return;
    rememberEditors(); const key = `proposal-${el.dataset.id}`; const draft = UI.vals[key];
    if (!draft) return;
    draft.segments.push(blankSegment()); TN.refresh();
  });
  TN.act('fv-proposal-remove', (el) => {
    if (!canPropose(S[el.dataset.id])) return;
    rememberEditors(); const draft = UI.vals[`proposal-${el.dataset.id}`];
    if (!draft) return;
    draft.segments.splice(Number(el.dataset.index), 1);
    if (!draft.segments.length) draft.segments.push(blankSegment());
    TN.refresh();
  });
  TN.act('fv-use-basis', (el) => {
    const id = el.dataset.id; const s = S[id];
    if (!canEditFlight(s) || s.flightTicket?.issued) return;
    rememberEditors(); const key = `ticket-${id}`; const p = latestProposal(s);
    UI.vals[key] = { ...(UI.vals[key] || {}), segments: workSegments(s), issued: false, proposalVersion: p?.status === 'approved' && p.sectorIndex == null ? p.version : null };
    delete UI.err[key]; TN.refresh();
  });
  TN.act('fv-proposal-draft', (el) => {
    if (!canPropose(S[el.dataset.id])) return;
    rememberEditors(); TN.toast('Proposal draft kept in this preview session. It has not been sent to Sales.');
  });
  TN.act('fv-proposal-save', (f) => {
    const form = fd(f); const id = form.task; const s = S[id];
    if (!canPropose(s)) return TN.toast('This task cannot accept another proposal right now.', 'danger');
    rememberEditors(); const parsed = parseEditor(f, 'proposal');
    const sectorIndex = Number.isInteger(Number(form.sectorIndex)) ? Number(form.sectorIndex) : 0;
    const issues = [...parsed.errors];
    if (!String(form.reason || '').trim()) issues.push('Enter the reason this alternative is required.');
    if (!latestProposal(s) && itineraryEqual(parsed.segments, requestOf(s).segments)) issues.push('Change at least one itinerary detail before proposing an alternative.');
    if (issues.length) { UI.vals[`proposal-${id}`] = { ...parsed, reason: form.reason, notes: form.notes }; UI.err[`proposal-${id}`] = issues.join(' '); TN.refresh(); return; }
    const version = (s.flightProposals || []).reduce((n, p) => Math.max(n, p.version), 0) + 1;
    (s.flightProposals = s.flightProposals || []).push({ version, sectorIndex, originalSegment: normalizeSegment(requestOf(s).segments[sectorIndex]), proposedSegment: parsed.segments[0], segments: parsed.segments, reason: form.reason.trim(), notes: String(form.notes || '').trim(), status: 'pending', submittedBy: me(), submittedAt: NOW() });
    delete UI.vals[`proposal-${id}`]; delete UI.err[`proposal-${id}`];
    addH(id, `Alternative proposal ${version} sent to Sales`);
    personNotice(TN.deal(s.deal).owner, `Flight alternative proposal ${version} for ${s.deal} needs your approval.`, s.deal, `#/app/deals/${s.deal}?tab=services`);
    TN.toast(`Proposal ${version} sent to Sales. Ticketing remains blocked.`); TN.refresh();
  });
  TN.act('fv-decision', (el) => {
    const id = el.dataset.id; const s = S[id]; const proposal = (s.flightProposals || []).find((p) => p.version === Number(el.dataset.version));
    if (me() !== TN.deal(s.deal)?.owner) return TN.toast('Only the owning Sales Executive can decide this proposal.', 'danger');
    if (!proposal || proposal.status !== 'pending' || latestFor(s, proposal.sectorIndex)?.version !== proposal.version) return TN.toast('This proposal is no longer the current pending version.', 'danger');
    if (el.dataset.decision === 'approve') { decideProposal(id, proposal, 'approve', ''); return; }
    TN.dialog({ title: 'Reject this alternative?', body: `<div id="fv-reject-error-${id}">${UI.err[`decision-${id}`] ? errorSummary('Rejection reason required', esc(UI.err[`decision-${id}`])) : ''}</div>${field(`reason-reject-${id}`, 'Reason for rejection', textInput(`reason-reject-${id}`, 'rejectionReason', ''), { hint: 'Required. Flight will need a revised proposal before ticketing.' })}`, footer: `<button type="button" class="${B.ghostMd}" data-close>Cancel</button><button type="button" data-act="fv-reject-confirm" data-id="${id}" data-version="${proposal.version}" class="${B.danger}">Reject alternative</button>` });
  });
  TN.act('fv-reject-confirm', (el) => {
    const id = el.dataset.id; const s = S[id]; const proposal = (s.flightProposals || []).find((p) => p.version === Number(el.dataset.version));
    const reason = String(document.querySelector(`#reason-reject-${id}`)?.value || '').trim();
    if (!reason) { UI.err[`decision-${id}`] = 'Enter the rejection reason.'; const box = document.querySelector(`#fv-reject-error-${id}`); if (box) box.innerHTML = errorSummary('Rejection reason required', UI.err[`decision-${id}`]); return; }
    if (me() !== TN.deal(s.deal)?.owner || !proposal || latestFor(s, proposal.sectorIndex)?.version !== proposal.version || proposal.status !== 'pending') return TN.toast('This proposal is no longer available to decide.', 'danger');
    decideProposal(id, proposal, 'reject', reason);
  });
  function decideProposal(id, proposal, decision, reason) {
    const s = S[id];
    if (!TN.is('sales') || me() !== TN.deal(s.deal)?.owner || s.taskStatus !== 'in_progress' || latestFor(s, proposal.sectorIndex) !== proposal || proposal.status !== 'pending' || !['approve', 'reject'].includes(decision) || (decision === 'reject' && !reason)) return TN.toast('This proposal is no longer available to decide.', 'danger');
    Object.assign(proposal, { status: decision === 'approve' ? 'approved' : 'rejected', decidedBy: me(), decidedAt: NOW(), rejectionReason: reason });
    delete UI.err[`decision-${id}`]; addH(id, decision === 'approve' ? `Alternative proposal ${proposal.version} approved by Sales` : `Alternative proposal ${proposal.version} rejected by Sales`);
    if (s.assignee) personNotice(s.assignee, `Sales ${proposal.status} flight alternative proposal ${proposal.version} for ${s.deal}.`, s.deal, `#/app/flight/${id}?tab=work`);
    TN.closeOverlay(); TN.toast(decision === 'approve' ? 'Alternative approved. Flight can ticket this exact itinerary.' : 'Alternative rejected. Ticketing remains blocked.'); TN.refresh();
  }
  TN.act('fv-done', (el) => {
    const id = el.dataset.id; const s = S[id];
    if (!canEditFlight(s)) return TN.toast('Only the assigned Flight Executive can complete an active task.', 'danger');
    const missing = flightChecklist(id).filter((i) => !i.done);
    if (missing.length) { UI.err[`done-${id}`] = `Still to do: ${missing.map((i) => `${i.label.charAt(0).toLowerCase() + i.label.slice(1)} (${i.why})`).join('; ')}.`; TN.refresh(); focusLater(`#finish-${id}-heading`); return; }
    if (s.taskStatus === 'done') { TN.toast('This flight is already complete.', 'danger'); return; }
    delete UI.err[`done-${id}`];
    TN.dialog({
      title: 'Mark this flight done?',
      body: `<div class="flex flex-col gap-3"><dl class="${C.dl}"><dt class="${C.dt}">Route</dt><dd class="${C.dd}">${esc(confirmedSegments(s).map((g) => `${g.no ? g.no + ' ' : ''}${g.from} → ${g.to}`).join('; '))}</dd><dt class="${C.dt}">PNRs</dt><dd class="${C.dd}">${esc(allPnrs(s).join(', '))}</dd><dt class="${C.dt}">Passenger tickets</dt><dd class="${C.ddNum}">${requiredCount(s)} confirmed</dd><dt class="${C.dt}">Deal</dt><dd class="${C.dd}">${esc(s.deal)}</dd></dl><p class="m-0 text-copy">${esc(ownerName(s.deal))} (Sales) and Accounts get a notice: ticket issued. After this, the ticket details and costs on this task are locked.</p></div>`,
      footer: `<button type="button" class="${B.ghostMd}" data-slot="button" data-close>Cancel</button><button type="button" class="${B.primaryMd}" data-slot="button" data-act="fv-done-confirm" data-id="${id}">Mark flight done</button>`,
    });
  });
  TN.act('fv-done-confirm', (el) => {
    const id = el.dataset.id; const s = S[id];
    if (!canEditFlight(s)) return TN.toast('This task is already completed or is not assigned to you.', 'danger');
    if (!readyToFinish(id)) { TN.closeOverlay(); UI.err[`done-${id}`] = 'Required ticket details changed. Review the checklist and save again.'; TN.refresh(); return; }
    s.taskStatus = 'done'; s.doneAt = NOW(); s.doneBy = me();
    const airline = confirmedSegments(s)[0]?.airline || 'Airline';
    const pnrs = allPnrs(s).join(', ');
    addH(id, 'Flight completed after ticket validation');
    personNotice(TN.deal(s.deal).owner, `Flight ticket recorded for ${familyName(s.deal)}: ${airline}, PNR ${pnrs}.`, s.deal, `#/app/deals/${s.deal}?tab=services`);
    pushNotice(['accounts', 'checker'], `Flight ticket recorded for ${familyName(s.deal)}: ${airline}, PNR ${pnrs}.`, s.deal, { href: '#/app/accounts/documents' });
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
