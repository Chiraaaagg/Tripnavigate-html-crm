/* =====================================================================
   Shell: the live StaffShell (crm/src/views/StaffShell.tsx, NavLinks.tsx,
   ui/mobile-nav.tsx): w-64 sidebar with brand, Work / Accounts / Settings
   groups and the account menu (details/summary popover) at the bottom; under
   1024 px the top bar with "Menu" and the wordmark, opening the same groups
   in a left sheet. The only addition is the compact "View as" role switcher
   inside the account panel. Owned by the shell agent (A).
   16 Nov 2026 redesign: grouped foldable menu with counts, Settings and the
   account panel pinned at the bottom, find box and quick search (C1, C9).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const FOCUS0 = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:outline-offset-0';

  /* ---------- Menu items per role (16 Nov 2026 redesign, C1 / D5) ----------
     Groups: top (no heading) · Sales · Desks · Accounts; Settings and the account panel are pinned at the bottom.
     A group shows only when the person has a link in it; a group with one link shows no heading.
     Itineraries is a tab on Quotations and Payment requests a tab on Purchase tasks: their addresses still work
     and mark those links current (prefixes). Accounts has six section links (TN.ACC_SECTIONS in 11-ui.js). */
  const ALL = null;
  const GROUPS = [{ key: 'top', label: '' }, { key: 'sales', label: 'Sales' }, { key: 'desks', label: 'Desks' }, { key: 'accounts', label: 'Accounts' }];
  const me = () => TN.roleDef().person;
  /** Department queue count: tasks not taken yet plus the person's own in progress, on bookings Accounts approved (same as Home). */
  TN.deskQueueCount = (dept) => {
    const D = TN.DATA;
    return Object.values(D.services).filter((s) => s.dept === dept && D.deals.find((d) => d.id === s.deal && d.accountsReview === 'approved') && ((s.assignee == null && s.taskStatus === 'new') || (s.assignee === dept && s.taskStatus === 'in_progress'))).length;
  };
  /** Deals that need the person's booking work (not started, quotation accepted, draft, ready to submit, returned). */
  TN.dealsNeedingBooking = () => TN.DATA.deals.filter((d) => (TN.role === 'manager' || d.owner === me()) && ['not_started', 'quotation_accepted', 'in_progress', 'ready_to_submit', 'returned'].includes(d.bookingState)).length;
  const ITEMS = [
    { href: '/app', label: 'Home', group: 'top', icon: 'house', roles: ALL },
    { href: '/app/notices', label: 'Notices', group: 'top', icon: 'bell', roles: ALL, count: () => TN.unreadNotices().length, countWord: 'unread' },
    { href: '/app/approvals', label: 'Approvals', group: 'top', icon: 'shield-check', roles: ['manager'], count: () => TN.approvalsWaiting() },
    { href: '/app/reports', label: 'Reports', group: 'top', icon: 'chart-column', roles: ['manager', 'admin'] },
    { href: '/app/leads', label: 'Leads', group: 'sales', icon: 'inbox', roles: ['sales', 'manager', 'admin'] },
    { href: '/app/deals', label: 'Deals', group: 'sales', icon: 'briefcase', roles: ALL, count: () => (TN.is('sales', 'manager') ? TN.dealsNeedingBooking() : 0), countWord: 'needing a booking' },
    { href: '/app/quotations', label: 'Quotations', group: 'sales', icon: 'file-text', roles: ['sales', 'manager'], prefixes: ['/app/itineraries'] },
    { href: '/app/purchase', label: 'Purchase tasks', group: 'desks', icon: 'clipboard-list', roles: ['purchase', 'manager', 'sales'], count: () => (TN.is('purchase') ? TN.deskQueueCount('purchase') : 0) },
    { href: '/app/flight', label: 'Flight tasks', group: 'desks', icon: 'plane', roles: ['flight'], count: () => TN.deskQueueCount('flight') },
    { href: '/app/visa', label: 'Visa and passport tasks', group: 'desks', icon: 'stamp', roles: ['visa'], count: () => TN.deskQueueCount('visa') },
    { href: '/app/purchase/suppliers', label: 'Suppliers', group: 'desks', icon: 'building-2', roles: ['purchase', 'manager'] },
  ];
  const ACC_ROLES = ['accounts', 'checker'];

  /** The menu for the current role: [{ href, label, group, icon, count?, prefixes? }] plus the pinned Settings item (group 'settings'). */
  TN.navItems = () => {
    const role = TN.role;
    const items = ITEMS.filter((i) => !i.roles || i.roles.includes(role));
    if (ACC_ROLES.includes(role) && TN.ACC_SECTIONS) {
      TN.ACC_SECTIONS.forEach((s) => items.push({ href: TN.accSectionHref(s), label: s.label, group: 'accounts', icon: s.icon, prefixes: s.tabs.map((t) => t.href), count: () => TN.accSectionCount(s) }));
    }
    let tabs = [];
    try { tabs = (TN.settingsTabs && TN.settingsTabs(role)) || []; } catch (e) { tabs = []; }
    if (tabs.length) {
      const href = String(tabs[0].href || tabs[0].path || '/app/admin').replace(/^#/, '') || '/app/admin';
      items.push({ href, label: 'Settings', group: 'settings', icon: 'settings', prefixes: ['/app/admin'] });
    }
    return items;
  };

  /* ---------- Counts used by the menu and Home ---------- */
  /** Notices addressed to the current role that it has not marked as read. */
  TN.unreadNotices = () => (TN.DATA.notices || []).filter((n) => (n.to || []).includes(TN.role) && !(n.readBy || []).includes(TN.role));
  /** Manager approvals waiting (supplier payments and company funding above ₹50,000, cancellations, supplier bank changes). */
  TN.approvalsWaiting = () => {
    // Prefer the count the Approvals page registers for Home (80-manager.js), so the menu and Home agree.
    const reg = (TN.homeRows || []).find((r) => String(r.href || '').replace(/^#/, '') === '/app/approvals' && (!r.roles || r.roles.includes(TN.role)));
    if (reg) { try { return Number(typeof reg.count === 'function' ? reg.count() : reg.count) || 0; } catch (e) { /* fall back */ } }
    const D = TN.DATA;
    return (D.supplierPayments || []).filter((p) => p.status === 'waiting_manager').length
      + (D.funding || []).filter((f) => f.status === 'waiting_manager').length
      + (D.cancellations || []).filter((c) => c.status === 'waiting_manager').length
      + Object.values(D.suppliers || {}).filter((s) => s.bank === 'changed').length;
  };

  /** Longest matching address marks the current item (live currentNavHref, extended with each item's extra prefixes). */
  function currentNavItem(items, path) {
    if (!path) return undefined;
    const p = String(path).split('?')[0];
    const matches = (prefix) => (prefix === '/app' ? p === '/app' : p === prefix || p.startsWith(prefix + '/'));
    let best;
    for (const item of items) {
      for (const prefix of [item.href.split('?')[0], ...(item.prefixes || [])]) {
        if (matches(prefix) && (!best || prefix.length > best.length)) best = { item, length: prefix.length };
      }
    }
    return best && best.item;
  }

  const wordmark = (cls) => `<span class="${cls ? 'font-sans font-display tracking-display text-ink ' + cls : 'font-sans text-xl leading-none font-display tracking-display text-ink'}">Trip<span class="text-brand-strong">Navigate</span></span>`;
  const initials = (name) => { const p = String(name).trim().split(/\s+/); return ((p[0] || '')[0] + ((p[1] || '')[0] || '')).toUpperCase() || '?'; };

  /* Folded groups are remembered on this device (localStorage, wrapped: storage may be blocked). */
  const FOLD_KEY = 'tn-nav-folded';
  const readFolded = () => { try { const v = JSON.parse(localStorage.getItem(FOLD_KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
  const writeFolded = (list) => { try { localStorage.setItem(FOLD_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked: the fold lasts until the next page */ } };
  let sessionFolded = null; // fallback when storage is blocked
  const folded = () => { const v = readFolded(); return v.length || !sessionFolded ? v : sessionFolded; };

  const countOf = (it) => { if (!it.count) return 0; try { const n = it.count(); return n == null ? null : Number(n) || 0; } catch (e) { return null; } };
  const countPill = (n, word) => (n == null
    ? '<span class="tn-nav-count"><span aria-hidden="true">–</span><span class="sr-only">, count not known</span></span>'
    : n > 0 ? `<span class="tn-nav-count"><span class="sr-only">, </span>${esc(n)}<span class="sr-only"> ${esc(word || 'waiting')}</span></span>` : '');
  const LINK = `flex min-h-9 w-full items-center gap-2.5 overflow-hidden rounded-control px-2.5 py-1.5 text-left text-base font-medium text-copy no-underline transition-[color,background-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:bg-brand-tint aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep ${FOCUS0}`;
  function linkHtml(it, current) {
    const isCur = it === current;
    return `<li class="relative m-0"><a${isCur ? ' aria-current="page"' : ''} class="${LINK}" href="#${esc(it.href)}">${TN.ic(it.icon, 'size-4 shrink-0 ' + (isCur ? 'text-brand' : 'text-quiet'))}<span class="min-w-0 flex-1">${esc(it.label)}</span>${countPill(countOf(it), it.countWord)}</a></li>`;
  }

  let navSeq = 0;
  /** Grouped, foldable menu (shadcn Sidebar pattern). Settings is not part of it (pinned footer). */
  function navLinks(items, nav) {
    const current = currentNavItem(items, nav);
    const base = `tn-nav${++navSeq}`;
    const shut = folded();
    return `<div class="flex flex-col gap-1 font-sans">${GROUPS.map((g) => {
      const list = items.filter((i) => i.group === g.key);
      if (!list.length) return '';
      const ul = (id, hidden) => `<ul${id ? ` id="${id}"` : ''} class="m-0 flex w-full min-w-0 list-none flex-col gap-0.5 p-0"${hidden ? ' hidden=""' : ''}>${list.map((it) => linkHtml(it, current)).join('')}</ul>`;
      if (!g.label || list.length === 1) return `<div class="relative flex w-full min-w-0 flex-col py-1">${ul('', false)}</div>`;
      const open = list.includes(current) || !shut.includes(g.key);
      const id = `${base}-${g.key}`;
      const ns = list.map(countOf);
      const total = ns.some((n) => n == null) && !ns.some((n) => n > 0) ? null : ns.reduce((a, n) => a + (n || 0), 0);
      return `<div role="group" aria-labelledby="${id}-h" class="relative flex w-full min-w-0 flex-col py-1"><button type="button" id="${id}-h" class="tn-group-btn" aria-expanded="${open}" aria-controls="${id}-list" data-act="tn-nav-fold" data-group="${g.key}"><span class="flex items-center gap-1.5">${TN.ic('chevron-right', 'tn-chev size-3.5 shrink-0')}${esc(g.label)}</span><span data-group-count=""${open ? ' hidden=""' : ''}>${countPill(total, 'waiting')}</span></button>${ul(id + '-list', !open)}</div>`;
    }).join('')}</div>`;
  }
  TN.act('tn-nav-fold', (el) => {
    const key = el.dataset.group;
    const open = el.getAttribute('aria-expanded') !== 'true';
    let list = folded().filter((k) => k !== key);
    if (!open) list.push(key);
    writeFolded(list); sessionFolded = list;
    // Flip this group in every open menu (sidebar and phone sheet) without redrawing the page.
    document.querySelectorAll(`[data-act="tn-nav-fold"][data-group="${key}"]`).forEach((b) => {
      b.setAttribute('aria-expanded', String(open));
      const ul = document.getElementById(b.getAttribute('aria-controls')); if (ul) ul.hidden = !open;
      const c = b.querySelector('[data-group-count]'); if (c) c.hidden = open;
    });
  });

  /** Pinned Settings link (outside the scrolling menu). */
  function settingsLink(items, nav) {
    const s = items.find((i) => i.group === 'settings');
    if (!s) return '';
    return `<ul class="m-0 list-none p-0">${linkHtml(s, currentNavItem(items, nav))}</ul>`;
  }
  /** Find box (C9): opens the quick search. */
  const findBox = () => `<button type="button" class="tn-find" data-act="tn-find" aria-keyshortcuts="/" aria-haspopup="dialog">${TN.ic('search', 'size-4 shrink-0')}<span class="min-w-0 flex-1 truncate">Find a Deal or Lead</span><kbd class="tn-kbd" aria-hidden="true">/</kbd></button>`;

  /* ---------- Account panel (live AccountPanel) + "View as" ---------- */
  function viewAs(prefix) {
    const id = `${prefix}-view-as`;
    return `<div class="px-2.5"><p id="${id}" class="m-0 text-xs font-semibold text-quiet">View as</p><ul role="radiogroup" aria-labelledby="${id}" class="m-0 mt-0.5 flex list-none flex-col gap-0.5 p-0">${TN.ROLES.map((r) => {
      const cur = r.key === TN.role;
      return `<li class="m-0"><button type="button" role="radio" aria-checked="${cur}" data-act="tn-view-as" data-role="${esc(r.key)}" class="flex min-h-8 w-full cursor-pointer items-center gap-2 rounded-control border-0 px-2 py-1 text-left font-sans text-sm ${cur ? 'bg-brand-tint font-semibold text-brand-deep' : 'bg-transparent font-medium text-copy hover:bg-wash hover:text-ink'} ${FOCUS0}">${cur ? TN.ic('check', 'size-3.5 shrink-0 text-brand-strong') : '<span aria-hidden="true" class="size-3.5 shrink-0"></span>'}<span class="min-w-0 flex-1 truncate">${esc(r.label)}</span></button></li>`;
    }).join('')}</ul></div>`;
  }
  function accountPanel(prefix, nav) {
    const me = TN.me();
    const onAccess = nav === '/app/access' || String(nav || '').startsWith('/app/access/');
    const helpId = `${prefix}-signout-everywhere-help`;
    return `<div class="flex flex-col gap-3 font-sans text-base text-copy">`
      + `<div class="px-2.5"><p class="m-0 font-semibold text-ink">${esc(me.name)}</p><p class="m-0 text-sm text-quiet">Holiday Chacha Pvt LTD</p></div>`
      + `<div class="px-2.5"><p id="${prefix}-roles" class="m-0 text-xs font-semibold text-quiet">Your roles</p><ul aria-labelledby="${prefix}-roles" class="m-0 mt-0.5 flex list-none flex-col gap-0.5 p-0"><li class="m-0 text-sm text-copy">${esc(me.role)} · ${esc(me.branch)}</li></ul></div>`
      + viewAs(prefix)
      + `<div class="flex flex-col gap-1 border-t border-line pt-2">`
      + `<a${onAccess ? ' aria-current="page"' : ''} class="flex min-h-9 w-full items-center gap-2.5 rounded-control px-2.5 py-1.5 font-sans text-base font-medium text-copy no-underline hover:bg-wash hover:text-ink aria-[current=page]:bg-brand-tint aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep ${FOCUS0}" href="#/app/access">${TN.ic('key-round', 'size-4 shrink-0 text-quiet')}My access</a>`
      + `<form class="m-0" data-act="tn-sign-out"><button type="submit" class="flex min-h-9 w-full cursor-pointer items-center gap-2.5 rounded-control border-0 bg-transparent px-2.5 py-1.5 text-left font-sans text-base font-medium text-copy hover:bg-wash hover:text-ink ${FOCUS0}">${TN.ic('log-out', 'size-4 shrink-0 text-quiet')}Sign out<span class="sr-only"> of this device</span></button></form>`
      + `<details class="group/more m-0"><summary class="flex min-h-9 cursor-pointer list-none items-center gap-2.5 rounded-control px-2.5 text-sm font-medium text-quiet hover:bg-wash hover:text-ink [&::-webkit-details-marker]:hidden ${FOCUS0}">${TN.ic('chevron-right', 'size-4 shrink-0 transition-transform duration-(--ui-duration-quick) group-open/more:rotate-90 motion-reduce:transition-none')}More sign-out options</summary><div class="mt-1.5 rounded-control border border-status-danger-line bg-status-danger-tint p-3"><p id="${helpId}" class="m-0 mb-3 text-sm text-copy">Signs you out on this and every other device. You will need your password and authenticator app to sign in again.</p><form class="m-0" data-act="tn-sign-out"><button type="submit" class="${TN.ui.buttonClass('danger', 'md', 'w-full')}" aria-describedby="${helpId}">Sign out everywhere</button></form></div></details>`
      + `</div></div>`;
  }

  const accountSummary = (me) => `<summary class="flex min-h-12 min-w-0 cursor-pointer list-none items-center gap-2.5 rounded-control px-2 py-1.5 select-none hover:bg-wash group-open:bg-wash [&::-webkit-details-marker]:hidden ${FOCUS0}"><span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint-2 text-xs font-semibold text-brand-deep">${esc(initials(me.name))}</span><span class="flex min-w-0 flex-1 flex-col text-left leading-tight"><span class="truncate text-sm font-semibold text-ink">${esc(me.name)}</span><span class="truncate text-xs text-quiet">${esc(me.role)} · ${esc(me.branch)}</span></span><span class="sr-only">: account menu</span>${TN.ic('chevrons-up-down', 'size-4 shrink-0 text-quiet')}</summary>`;

  /** TN.shell({ html, nav }) -> the whole staff frame around the page body. */
  TN.shell = ({ html, nav }) => {
    if (nav === '__bare') return html;
    const me = TN.me();
    const items = TN.navItems();
    const settings = settingsLink(items, nav);
    return `<div class="staff-shell flex min-h-dvh bg-canvas">`
      + `<div class="hidden w-64 shrink-0 border-r border-line bg-card lg:block"><div class="sticky top-0 flex h-dvh flex-col font-sans">`
      + `<div class="flex shrink-0 items-center gap-2.5 px-4.5 pt-4.5 pb-3"><span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-control bg-brand-strong text-sm font-bold text-white">TN</span><span class="flex min-w-0 flex-col leading-tight">${wordmark('text-lg')}<span class="truncate text-xs text-quiet">${esc(me.branch)} branch</span></span></div>`
      + `<div class="shrink-0 px-2 pb-2">${findBox()}</div>`
      + `<nav aria-label="Main" class="tn-nav-scroll px-2 pb-2">${navLinks(items, nav)}</nav>`
      + `<div class="relative shrink-0 border-t border-line p-2">${settings ? `<nav aria-label="Settings" class="mb-1">${settings}</nav>` : ''}<details id="account-menu" class="group m-0"${TN._menuOpen ? ' open=""' : ''}>${accountSummary(me)}<div class="absolute right-2 bottom-full left-2 z-30 mb-1.5 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-card border border-line bg-card p-2 pt-3 shadow-raised">${accountPanel('sidebar', nav)}</div></details></div>`
      + `</div></div>`
      + `<div class="flex min-w-0 flex-1 flex-col">`
      + `<header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-3 font-sans sm:px-5 lg:hidden"><button type="button" class="${TN.ui.buttonClass('ghost', 'md', 'px-2.5 lg:hidden')}" data-slot="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed" data-act="tn-menu">${TN.ic('menu')}Menu</button>${wordmark('text-lg')}<button type="button" class="${TN.ui.buttonClass('ghost', 'icon', 'ml-auto')}" data-slot="button" aria-haspopup="dialog" aria-label="Find a Deal or Lead" aria-keyshortcuts="/" data-act="tn-find">${TN.ic('search')}</button></header>`
      + `<main id="main" class="w-full min-w-0 max-w-[72rem] p-8 max-md:p-5" tabindex="-1">${html}</main>`
      + `</div></div>`;
  };

  /* ---------- Phone Menu sheet (live MobileNav on the Radix Drawer, side left) ---------- */
  function openSheet() {
    const nav = TN.path().split('?')[0];
    const me = TN.me();
    const items = TN.navItems();
    const settings = settingsLink(items, nav);
    const id = 'radix-menu';
    const cls = TN.ui.cx('fixed inset-y-0 z-50 flex w-[min(24rem,calc(100vw-3rem))] flex-col overflow-y-auto bg-card font-sans text-base text-copy shadow-overlay outline-none', 'left-0 rounded-r-panel data-[state=open]:animate-ui-slide-in-left data-[state=closed]:animate-ui-slide-out-left', 'motion-reduce:animate-none', 'w-[min(20rem,calc(100vw-3rem))] border-r border-line px-3 py-4.5');
    const html = `<div data-state="open" class="fixed inset-0 z-50 bg-[rgb(15_23_42/0.42)] data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out motion-reduce:animate-none" data-close="" aria-hidden="true"></div>`
      + `<div role="dialog" id="${id}" aria-describedby="${id}-description" aria-labelledby="${id}-title" aria-modal="true" data-state="open" class="${cls}" tabindex="-1" data-sheet="menu">`
      + `<h2 id="${id}-title" class="m-0 shrink-0 px-2.5 pt-1 pb-1">${wordmark()}</h2><p id="${id}-description" class="sr-only">Main menu</p>`
      + `<div class="mt-3 shrink-0">${findBox()}</div>`
      + `<nav aria-label="Main" class="tn-nav-scroll mt-3">${navLinks(items, nav)}</nav>`
      + `<div class="mt-2 shrink-0 border-t border-line pt-2">${settings ? `<nav aria-label="Settings" class="mb-1">${settings}</nav>` : ''}<section aria-label="Your account"><details id="account-menu-sheet" class="group m-0">${accountSummary(me)}<div class="mt-2 border-t border-line pt-3">${accountPanel('sheet', nav)}</div></details></section></div>`
      + `<button type="button" class="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-control border-0 bg-transparent p-0 text-quiet hover:bg-wash hover:text-ink outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none" aria-label="Close menu" data-close="" data-corner-close="">${TN.ic('x', 'size-4')}</button></div>`;
    const btn = document.querySelector('[data-act="tn-menu"]');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.dataset.state = 'open'; }
    TN.openOverlay(html, { focus: 'nav[aria-label="Main"] a[href]' });
  }
  TN.act('tn-menu', () => openSheet());
  // Following a link in the sheet closes it (also when it is the page already shown).
  document.addEventListener('click', (ev) => { const a = ev.target.closest('[data-sheet="menu"] a[href]'); if (a) setTimeout(() => TN.closeOverlay(), 0); }, true);
  // Reset the Menu button state whenever the overlay closes.
  const resetMenuBtn = () => { const btn = document.querySelector('[data-act="tn-menu"]'); if (btn && !document.querySelector('#tn-overlay [data-sheet]')) { btn.setAttribute('aria-expanded', 'false'); btn.dataset.state = 'closed'; } };
  new MutationObserver(resetMenuBtn).observe(document.getElementById('tn-overlay') || document.body, { childList: true });


  /* ---------- C9 quick search (existing search box in a dialog) ----------
     Finds Deals by reference (BX-38412), Bitrix number (38412), customer name and trip; Leads by reference, name
     and trip; both by the FULL phone number only (exact, digits compared; +91 / leading 0 ignored), D10.
     Only records the person may open are listed (TN.canOpen), so money fences and desk access hold.
     Opens from the sidebar find box, the phone top bar and the "/" key (not while typing in a field). */
  const digitsOf = (s) => String(s || '').replace(/\D/g, '');
  const phoneKey = (s) => { let d = digitsOf(s); if (d.length === 12 && d.startsWith('91')) d = d.slice(2); else if (d.length === 11 && d.startsWith('0')) d = d.slice(1); return d; };
  function searchAll(raw) {
    const q = String(raw || '').trim().toLowerCase();
    const digits = digitsOf(q);
    // Desk roles (Purchase, Flight, Visa) never search by customer phone, as on the Deals list.
    const phoneMode = !TN.is('purchase', 'flight', 'visa') && /^[+\d][\d\s()-]*$/.test(q) && digits.length >= 10;
    if (!phoneMode && q.length < 2) return { q, deals: [], leads: [], phoneMode, tooShort: true };
    const hit = (...vals) => vals.some((v) => String(v || '').toLowerCase().includes(q));
    const deals = TN.DATA.deals.filter((d) => {
      const c = TN.customer(d.customer) || {};
      if (phoneMode) return phoneKey(c.phone) === phoneKey(q);
      return hit(d.id, d.title, d.destination, c.name, c.contact) || (/^\d+$/.test(q) && digitsOf(d.id).includes(q));
    }).map((d) => {
      const acc = TN.is('accounts', 'checker') && TN.canOpen('/app/accounts/deals/' + d.id);
      return { kind: 'deal', d, href: acc ? '/app/accounts/deals/' + d.id : '/app/deals/' + d.id };
    }).filter((r) => TN.canOpen(r.href)).slice(0, 8);
    const leads = (TN.DATA.leads || []).filter((l) => (phoneMode ? phoneKey(l.phone) === phoneKey(q) : hit(l.id, l.title, l.name) || (/^\d+$/.test(q) && digitsOf(l.id).includes(q))))
      .map((l) => ({ kind: 'lead', l, href: '/app/leads/' + l.id })).filter((r) => TN.canOpen(r.href)).slice(0, 8);
    return { q, deals, leads, phoneMode };
  }
  let qsActive = 0;
  function qsResults(res) {
    if (res.tooShort) return { html: '<p class="m-0 px-1 py-3 text-sm text-quiet">Type at least two letters or numbers, or a full phone number.</p>', n: 0 };
    const n = res.deals.length + res.leads.length;
    if (!n) return { html: `<p class="m-0 px-1 py-3 text-sm text-quiet">${res.phoneMode ? 'No Deal or Lead has this phone number.' : `Nothing matches “${esc(res.q)}”.`} Check the spelling, or search by the Deal reference.</p>`, n: 0 };
    let i = 0;
    const opt = (r) => {
      const idx = i++;
      let title, sub, icon;
      if (r.kind === 'deal') {
        const c = TN.customer(r.d.customer) || {};
        title = `<span class="font-semibold text-ink tabular-nums">${esc(r.d.id)}</span> <span class="text-copy">${esc(r.d.title)}</span>`;
        sub = [c.name, r.d.start ? `${TN.fmt.date(r.d.start)} – ${TN.fmt.date(r.d.end)}` : '', res.phoneMode ? 'Phone number matches' : ''].filter(Boolean).map(esc).join(' · ');
        icon = 'briefcase';
      } else {
        title = `<span class="font-semibold text-ink tabular-nums">${esc(r.l.id)}</span> <span class="text-copy">${esc(r.l.title)}</span>`;
        sub = [r.l.name, r.l.status, res.phoneMode ? 'Phone number matches' : ''].filter(Boolean).map(esc).join(' · ');
        icon = 'inbox';
      }
      return `<div role="option" id="qs-opt-${idx}" aria-selected="${idx === qsActive}" class="tn-qs-opt" data-href="${esc(r.href)}">${TN.ic(icon, 'size-4 shrink-0 text-quiet')}<span class="min-w-0 flex-1"><span class="block truncate">${title}</span><span class="block truncate text-sm text-quiet">${sub}</span></span></div>`;
    };
    const group = (key, label, list) => (list.length ? `<div role="group" aria-labelledby="qs-g-${key}"><div id="qs-g-${key}" role="presentation" class="px-2.5 pt-2 pb-1 text-xs font-semibold text-quiet">${label}</div>${list.map(opt).join('')}</div>` : '');
    return { html: `<div role="listbox" id="qs-list" aria-label="Matches" class="tn-qs-list">${group('deals', 'Deals', res.deals)}${group('leads', 'Leads', res.leads)}</div>`, n };
  }
  function qsUpdate(input) {
    const res = searchAll(input.value);
    qsActive = 0;
    const out = qsResults(res);
    document.getElementById('qs-results').innerHTML = out.html;
    input.setAttribute('aria-expanded', String(out.n > 0));
    if (out.n) input.setAttribute('aria-activedescendant', 'qs-opt-0'); else input.removeAttribute('aria-activedescendant');
    clearTimeout(qsUpdate.t);
    qsUpdate.t = setTimeout(() => { const s = document.getElementById('qs-status'); if (s) s.textContent = res.tooShort ? '' : out.n ? TN.fmt.plural(out.n, 'match', 'matches') : 'No matches'; }, 400);
  }
  function qsMove(delta, abs) {
    const opts = [...document.querySelectorAll('#qs-list [role="option"]')];
    if (!opts.length) return;
    qsActive = abs != null ? abs : (qsActive + delta + opts.length) % opts.length;
    opts.forEach((o, k) => o.setAttribute('aria-selected', String(k === qsActive)));
    const cur = opts[qsActive];
    document.getElementById('qs-input').setAttribute('aria-activedescendant', cur.id);
    cur.scrollIntoView({ block: 'nearest' });
  }
  const qsOpen = (href) => { if (!href) return; TN.closeOverlay(); TN.go(href); };
  TN.quickSearch = () => {
    qsActive = 0;
    const body = `<div class="relative"><label for="qs-input" class="sr-only">Find a Deal or Lead</label>${TN.ic('search', 'pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-quiet')}<input id="qs-input" type="search" role="combobox" aria-expanded="false" aria-controls="qs-list" aria-autocomplete="list" aria-describedby="qs-hint" autocomplete="off" enterkeyhint="go" class="${TN.ui.cx(TN.ui.CONTROL, 'tn-qs-input')}" placeholder="Deal reference, Bitrix number, name or trip"/></div>`
      + `<p id="qs-hint" class="m-0 mt-1.5 text-sm text-quiet">Phone numbers: type the full number. Arrow keys move, Enter opens.</p>`
      + `<div id="qs-status" role="status" aria-live="polite" class="sr-only"></div><div id="qs-results" class="mt-2 pb-3"></div>`;
    const html = TN.ui.dialog({ title: 'Find a Deal or Lead', body, cls: 'tn-qs-dialog max-w-xl', closeLabel: 'Close search' });
    TN.openOverlay(html, { focus: '#qs-input' });
    qsUpdate(document.getElementById('qs-input'));
  };
  TN.act('tn-find', () => TN.quickSearch());
  document.addEventListener('input', (ev) => { if (ev.target.id === 'qs-input') qsUpdate(ev.target); });
  document.addEventListener('keydown', (ev) => {
    if (ev.target.id === 'qs-input') {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); qsMove(1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); qsMove(-1); }
      else if (ev.key === 'Home' && ev.ctrlKey) { ev.preventDefault(); qsMove(0, 0); }
      else if (ev.key === 'End' && ev.ctrlKey) { ev.preventDefault(); const n = document.querySelectorAll('#qs-list [role="option"]').length; if (n) qsMove(0, n - 1); }
      else if (ev.key === 'Enter') { ev.preventDefault(); const o = document.querySelector(`#qs-list [role="option"][aria-selected="true"]`); if (o) qsOpen(o.dataset.href); }
      return;
    }
    // "/" opens the search unless the person is typing somewhere or a dialog is open.
    if (ev.key !== '/' || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    const t = ev.target;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (document.querySelector('#tn-overlay > *')) return;
    if (!document.querySelector('[data-act="tn-find"]')) return; // not on the signed-out screen
    ev.preventDefault();
    TN.quickSearch();
  });
  document.addEventListener('click', (ev) => { const o = ev.target.closest('#qs-list [role="option"]'); if (o) qsOpen(o.dataset.href); });

  /* ---------- Role switcher ---------- */
  TN.act('tn-view-as', (el) => {
    const key = el.dataset.role;
    if (key === TN.role) return;
    const name = (TN.ROLES.find((r) => r.key === key) || {}).label;
    TN.setRole(key);
    // keep ?role= in the address in step, so a reload shows the same view
    try { const u = new URL(location.href); if (u.searchParams.has('role')) { u.searchParams.set('role', key); history.replaceState(null, '', u.toString()); } } catch (e) { /* ignore */ }
    // The page was redrawn: put focus back on what opened the switcher (account menu or phone Menu button).
    const sum = document.querySelector('#account-menu > summary');
    const menuBtn = document.querySelector('[data-act="tn-menu"]');
    if (sum && sum.offsetParent) sum.focus(); else if (menuBtn && menuBtn.offsetParent) menuBtn.focus();
    TN.toast({ title: `Viewing as ${name}`, tone: 'info' });
  });

  /* ---------- Account menu dismiss (live UserMenuDismiss) ---------- */
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    const menu = document.getElementById('account-menu');
    if (!menu || !menu.open) return;
    const inside = menu.contains(document.activeElement);
    menu.open = false;
    if (inside) { const s = menu.querySelector(':scope > summary'); if (s) s.focus(); }
  });
  document.addEventListener('pointerdown', (ev) => {
    const menu = document.getElementById('account-menu');
    if (menu && menu.open && !menu.contains(ev.target)) menu.open = false;
  });

  /* ---------- Sign out: the live signed-out sign-in screen ---------- */
  TN.act('tn-sign-out', () => { TN.closeOverlay(); TN.go('/sign-in'); });
  TN.page('/sign-in', {
    nav: '__bare', title: 'Sign in',
    render: () => '<div class="auth-layout"><main id="main" class="auth-card" tabindex="-1"><div class="brand"><span class="brand-name">TripNavigate CRM</span><span class="brand-entity">Holiday Chacha Pvt LTD · staff access only</span></div><h1>Sign in</h1><form novalidate="" data-act="tn-sign-in"><div class="field"><label for="email">Work email</label><input id="email" type="email" autocomplete="username" required="" name="email"/></div><div class="field"><label for="password">Password</label><input id="password" type="password" autocomplete="current-password" required="" name="password"/></div><button type="submit" class="button" aria-disabled="false">Sign in</button></form></main></div>',
  });
  TN.act('tn-sign-in', () => TN.go('/app'));
})();
