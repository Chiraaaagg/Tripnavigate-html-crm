/* =====================================================================
   39-purchase-breakups.js · Purchase data extension (1 Nov 2026)
   What Sales entered in Book now for each hotel, line by line: room type,
   number of rooms × our cost per room per night, extra beds × rate and
   guests without a bed × rate. Nights come from the service dates.
   These rates are Sales' cost estimate (the budget), never the selling
   price, so Purchase may see them. All figures are invented.
   Total = nights × (rooms × room rate + extra beds × rate + no-bed × rate),
   exactly as Book now adds it up; every total below equals the budget.
   Services without an entry (the Singapore package) show
   "Sales did not give a room breakup".
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const line = (room, rooms, roomRate, extra = 0, extraRate = null, nobed = 0, nobedRate = null) => ({ room, rooms, roomRate, extra, extraRate, nobed, nobedRate });
  D.hotelBreakups = D.hotelBreakups || {
    // 2 nights × (8 × ₹13,000 + 1 × ₹14,000) = ₹2,36,000
    's-547-h': [line('Deluxe twin room', 8, 13000), line('Suite, twin sharing', 1, 14000)],
    // 4 nights × (₹16,500 + child without a bed ₹1,500) = ₹72,000
    's-412-h': [line('Deluxe garden view room', 1, 16500, 0, null, 1, 1500)],
    's-455-h1': [line('Premium room', 1, 16000)],
    's-455-h2': [line('Cottage', 1, 18000)],
    's-455-h3': [line('1 bedroom premium houseboat', 1, 15000)],
    // 5 nights × (family room ₹20,600 + extra bed ₹3,000) = ₹1,18,000
    's-390-h': [line('Family room', 1, 20600, 1, 3000)],
    's-377-h1': [line('Deluxe room', 2, 9000)],
    's-377-h2': [line('Deluxe room', 2, 9500)],
    's-264-h1': [line('Ganga view room', 3, 8000)],
    's-264-h2': [line('Deluxe room', 2, 8500), line('Deluxe valley view room', 1, 9000)],
    's-520-h': [line('Lake view room', 1, 19600)],
    // 3 nights × (2 × ₹6,800 + extra bed for the child ₹1,500) = ₹45,300
    's-198-h1': [line('Deluxe room', 2, 6800, 1, 1500)],
    // 3 nights × (2 × ₹9,000 + extra bed for the child ₹1,300) = ₹57,900
    's-198-h2': [line('Cottage', 2, 9000, 1, 1300)],
  };
  // Two budgets were not whole rupees per night; Sales' budget is the breakup total.
  if (D.services['s-198-h1'] && D.services['s-198-h1'].budget === 46000) D.services['s-198-h1'].budget = 45300;
  if (D.services['s-198-h2'] && D.services['s-198-h2'].budget === 58000) D.services['s-198-h2'].budget = 57900;

  const nightsOf = (s) => Math.max(1, Math.round((Date.parse(s.end) - Date.parse(s.start)) / 86400000));
  /** The breakup of a hotel service, with totals; null when Sales gave none. */
  TN.hotelBreakup = (id) => {
    const s = D.services[id];
    const lines = D.hotelBreakups[id];
    if (!s || !lines || !lines.length) return null;
    const nights = nightsOf(s);
    const rows = [];
    lines.forEach((l) => {
      if (l.rooms > 0) rows.push({ kind: 'room', label: l.room, qty: l.rooms, rate: l.roomRate, nights, total: l.rooms * l.roomRate * nights });
      if (l.extra > 0) rows.push({ kind: 'extra', label: `Extra bed (${l.room})`, qty: l.extra, rate: l.extraRate, nights, total: l.extra * l.extraRate * nights });
      if (l.nobed > 0) rows.push({ kind: 'nobed', label: `Guest without a bed (${l.room})`, qty: l.nobed, rate: l.nobedRate, nights, total: l.nobed * l.nobedRate * nights });
    });
    return {
      nights, rows, lines,
      rooms: lines.reduce((n, l) => n + (l.rooms || 0), 0),
      extra: lines.reduce((n, l) => n + (l.extra || 0), 0),
      nobed: lines.reduce((n, l) => n + (l.nobed || 0), 0),
      perNight: rows.reduce((n, r) => n + r.qty * r.rate, 0),
      total: rows.reduce((n, r) => n + r.total, 0),
    };
  };
})();

/* =====================================================================
   Shared desk presentation (Agent C, usability redesign 16 Nov 2026).
   Purchase, Flight and Visa pages use the shared helpers from 11-ui.js
   (TN.ui.recordHeader, queueToolbar, fold, jumpLinks, state) when they
   exist; until then these local copies draw the same structure with live
   classes. Presentation only: no rule, field or wording of a form changes.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const icon = (n, c) => (TN.ic ? TN.ic(n, c) : '');
  const has = (k) => !!(TN.ui && typeof TN.ui[k] === 'function');
  const BTN = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ' + FOCUS;
  const BTN_PRIMARY = BTN + ' border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white h-11 px-4 text-md min-h-11';
  const BTN_ROW = BTN + ' border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink h-8 px-2.5 text-sm min-h-11';
  const LINK = 'rounded-chip font-medium text-brand-strong underline underline-offset-4 hover:text-brand-deep ' + FOCUS;

  /** Query string from an object, dropping empty values. */
  const qs = (o) => { const u = new URLSearchParams(); Object.entries(o).forEach(([k, v]) => { if (v != null && v !== '') u.set(k, v); }); const s = u.toString(); return s ? '?' + s : ''; };
  /** The current address with some query values changed (null removes one). */
  const withQuery = (base, cur, change) => base + qs({ ...cur, ...change });

  /** In-page links that move focus to a block lower on the page (C11 / O7 / O9). */
  function jumpLinks(items) {
    if (!items || !items.length) return '';
    // 80-manager.js re-registers 'tn-jump' with a different data attribute (data-id), so desk pages route
    // the shared links through their own 'desk-jump' handler (same data-target, same behaviour).
    if (has('jumpLinks')) return TN.ui.jumpLinks(items).replace(/data-act="tn-jump"/g, 'data-act="desk-jump"');
    return `<nav aria-label="On this page" class="flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-sm" data-slot="jump-links"><span class="text-quiet">Jump to:</span>${items.map((i) => `<a class="${LINK}" href="#" data-act="desk-jump" data-target="${esc(String(i.href).replace(/^#/, ''))}">${i.label}</a>`).join('')}</nav>`;
  }
  /** One plain fold-out (<details>), no height animation. */
  function fold(o) {
    if (has('fold')) return TN.ui.fold(o);
    return `<details class="rounded-control border border-line bg-canvas${o.cls ? ' ' + o.cls : ''}"${o.id ? ` id="${esc(o.id)}"` : ''}${o.open ? ' open' : ''} data-slot="fold"><summary class="flex min-h-11 cursor-pointer items-center px-3 font-medium text-brand-strong ${FOCUS}">${o.summary}</summary><div class="border-t border-line bg-card px-3 py-3">${o.body}</div></details>`;
  }
  /** The record's one primary button: a link, an action, or a jump to a control lower on the page. */
  function nextButton(b) {
    if (!b) return '';
    const data = Object.entries(b.data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('');
    if (b.href) return `<a class="${BTN_PRIMARY}" data-slot="button" href="${esc(b.href)}">${b.label}</a>`;
    if (b.jump) return `<button type="button" class="${BTN_PRIMARY}" data-slot="button" data-act="desk-jump" data-target="${esc(String(b.jump).replace(/^#/, ''))}">${b.label}</button>`;
    return `<button type="button" class="${BTN_PRIMARY}" data-slot="button" data-act="${esc(b.act)}"${data}>${b.label}</button>`;
  }
  /** C4 record header: back link and record ID; title, status, owner; "Next:" with one button; read-only line; folded details. */
  function recordHeader(o) {
    // The task pages also have a "Details" tab, so the folded system facts get their own name.
    o = { detailsLabel: 'Task facts', ...o };
    if (has('recordHeader')) {
      // A jump button goes through 'desk-jump' (see jumpLinks above); the label tells screen readers it moves focus.
      const b = o.next && o.next.button;
      if (b && b.jump) o = { ...o, next: { ...o.next, button: { label: `${b.label}<span class="sr-only"> (moves to it below)</span>`, act: 'desk-jump', data: { target: String(b.jump).replace(/^#/, '') }, icon: 'arrow-down' } } };
      return TN.ui.recordHeader(o);
    }
    const line1 = `<p class="m-0 mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"><a class="inline-flex items-center gap-1 rounded-chip text-sm font-medium text-brand-strong no-underline hover:text-brand-deep hover:underline ${FOCUS}" href="${esc(o.back.href)}">${icon('chevron-left', 'size-4')}${o.back.label}</a>${o.recordId ? `<span class="text-quiet" aria-hidden="true">·</span><span class="text-quiet">${o.recordId}</span>` : ''}</p>`;
    const line2 = `<header class="mb-3 flex flex-col gap-2 font-sans" data-slot="page-header"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl"><span class="block wrap-anywhere">${o.title}</span></h1><div class="flex flex-wrap items-center gap-2 text-sm text-quiet">${o.status || ''}${o.owner ? `<span class="text-copy">${o.owner}</span>` : ''}</div></header>`;
    const nextText = o.next ? (o.next.text === 'Nothing waiting.' ? o.next.text : `<span class="font-semibold text-ink">Next:</span> ${o.next.text}`) : o.nextWho ? `<span class="font-semibold text-ink">Next:</span> ${o.nextWho}` : '';
    const line3 = nextText ? `<div class="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><p class="m-0 text-copy" data-slot="task-next">${nextText}</p>${o.next && o.next.button ? `<div class="shrink-0">${nextButton(o.next.button)}</div>` : ''}</div>` : '';
    const ro = o.readOnly ? `<p class="m-0 mb-3 text-sm text-copy" data-slot="read-only">${o.readOnly}</p>` : '';
    const det = o.details ? `<div class="mb-4">${fold({ summary: 'Details', body: o.details })}</div>` : '<div class="mb-4"></div>';
    return line1 + line2 + line3 + ro + det;
  }
  /** C2 toolbar: one search field, status chips (four shown, rest under More), one sort select. */
  function queueToolbar(o) {
    if (has('queueToolbar')) return TN.ui.queueToolbar(o);
    const id = o.id || 'queue';
    const chips = o.chips || [];
    const shown = chips.slice(0, 4); const more = chips.slice(4);
    const chipHtml = shown.length && has('filterChips') ? TN.ui.filterChips({ label: 'Filter by status', chips: shown }) : '';
    const moreHtml = more.length ? fold({ summary: 'More', body: TN.ui.filterChips({ label: 'More status filters', chips: more }), cls: 'inline-block' }) : '';
    const search = o.search ? `<div class="desk-toolbar-search flex flex-col gap-1.5" data-slot="field"><label class="block font-sans text-sm font-semibold text-ink" for="${id}-q">Search</label><input type="search" class="block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-base text-ink m-0 shadow-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong" id="${id}-q" name="${esc(o.search.name || 'q')}" value="${esc(o.search.value || '')}" placeholder="${esc(o.search.placeholder || '')}" autocomplete="off" enterkeyhint="search"></div>` : '';
    const sort = o.sort ? `<div class="flex flex-col gap-1.5" data-slot="field"><label class="block font-sans text-sm font-semibold text-ink" for="${id}-sort">Sort</label><div class="relative" data-slot="select"><select class="block w-full min-h-10 rounded-control border border-control bg-card px-3 py-2 font-sans text-base text-ink m-0 appearance-none shadow-none cursor-pointer pr-9 hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong" id="${id}-sort" name="${esc(o.sort.name || 'sort')}" data-change="${esc(o.act)}">${o.sort.options.map((x) => `<option value="${esc(x.value)}"${x.value === o.sort.value ? ' selected' : ''}>${esc(x.label)}</option>`).join('')}</select>${icon('chevron-down', 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-quiet')}</div></div>` : '';
    return `<div class="mb-4 flex flex-col gap-3 font-sans" data-slot="queue-toolbar"><form role="search" aria-label="Search and sort" novalidate class="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end" data-act="${esc(o.act)}">${search}${sort}<button type="submit" class="sr-only">Search</button></form>${chipHtml || moreHtml ? `<div class="flex flex-wrap items-start gap-2">${chipHtml}${moreHtml}</div>` : ''}</div>`;
  }
  /** C8 screen states, falling back to the live empty state. */
  function state(o) {
    if (has('state')) return TN.ui.state(o);
    return `<div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card" data-slot="card"><div role="status">${TN.ui.emptyState({ icon: o.icon || 'inbox', title: o.title, description: o.text, action: o.action, level: 2 })}</div></div>`;
  }
  /** Row button inside a queue row (C2 "Next step" column). */
  const rowButton = (label, attrs) => `<a class="${BTN_ROW}" data-slot="button" ${attrs}>${label}</a>`;
  const rowAct = (label, act, data) => `<button type="button" class="${BTN_ROW}" data-slot="button" data-act="${esc(act)}"${Object.entries(data || {}).map(([k, v]) => ` data-${k}="${esc(v)}"`).join('')}>${label}</button>`;

  /** Search and sort submit for every desk queue: keeps the tab and chip, changes q and sort. */
  TN.act('desk-queue', (el) => {
    const form = el.closest('form') || el;
    const f = new FormData(form);
    const path = (location.hash.slice(1) || '/app').split('?')[0];
    const cur = TN.query();
    const q = String(f.get('q') || '').trim();
    const sort = f.get('sort') != null ? String(f.get('sort')) : cur.sort;
    TN.go(withQuery(path, cur, { q: q || null, sort: sort && sort !== 'soonest' ? sort : null }));
  });
  /** Move focus to a block or control lower on the page; opens a closed fold around it. */
  TN.desk = TN.desk || {};
  TN.desk.focus = (id) => {
    const t = document.getElementById(id);
    if (!t) return false;
    let p = t.closest('details'); while (p) { p.open = true; p = p.parentElement && p.parentElement.closest('details'); }
    const target = t.matches('a[href],button,input,select,textarea,summary,[tabindex]') ? t : t;
    if (!target.matches('a[href],button,input,select,textarea,summary,[tabindex]')) target.setAttribute('tabindex', '-1');
    target.scrollIntoView({ block: 'center', behavior: 'auto' });
    target.focus({ preventScroll: true });
    return true;
  };
  /** After a link with ?focus=<id> opened the page: focus that control once, then drop the value from the address. */
  TN.desk.focusFromQuery = (q) => {
    if (!q || !q.focus) return;
    const id = q.focus;
    setTimeout(() => {
      TN.desk.focus(id);
      const h = location.hash.replace(/([?&])focus=[^&]*&?/, '$1').replace(/[?&]$/, '');
      try { history.replaceState(null, '', h); } catch (e) { /* address stays as it is */ }
    }, 0);
  };
  TN.act('desk-jump', (el) => { if (!TN.desk.focus(el.dataset.target)) TN.toast('That part is not on this tab.', 'warning'); });

  /** Text search: every word must appear somewhere in the row's text (case-insensitive). */
  const matches = (q, text) => { const words = String(q || '').toLowerCase().split(/\s+/).filter(Boolean); const t = String(text || '').toLowerCase(); return words.every((w) => t.includes(w)); };

  const MON3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /** "6–8 Nov 2026", "28 Nov – 2 Dec 2026", never wrapping. */
  function range(a, b) {
    if (!a) return '';
    if (!b || a === b) return TN.fmt.date(a);
    const [y1, m1, d1] = a.split('-').map(Number); const [y2, m2, d2] = b.split('-').map(Number);
    if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MON3[m1 - 1]} ${y1}`;
    if (y1 === y2) return `${d1} ${MON3[m1 - 1]} – ${d2} ${MON3[m2 - 1]} ${y1}`;
    return `${TN.fmt.date(a)} – ${TN.fmt.date(b)}`;
  }
  const SORTS = [{ value: 'soonest', label: 'Soonest travel first' }, { value: 'latest', label: 'Latest travel first' }, { value: 'deal', label: 'Deal reference' }];
  const sortBy = (list, sort, startOf, dealOf) => list.slice().sort((a, b) => {
    if (sort === 'deal') return String(dealOf(a)).localeCompare(String(dealOf(b))) || String(startOf(a)).localeCompare(String(startOf(b)));
    const d = String(startOf(a) || '9999').localeCompare(String(startOf(b) || '9999'));
    return sort === 'latest' ? -d : d;
  });

  /** Queue columns with tighter side padding so seven columns fit the 1,152 px page without sideways scroll. */
  const cols = (list) => list.map((c) => { const o = typeof c === 'string' ? { label: c } : { ...c }; o.cls = ((o.cls || '') + ' px-3').trim(); o.cellCls = ((o.cellCls || '') + ' px-3').trim(); return o; });
  Object.assign(TN.desk, { cols, has, jumpLinks, fold, recordHeader, queueToolbar, state, rowButton, rowAct, qs, withQuery, matches, range, SORTS, sortBy, LINK, FOCUS });
})();
