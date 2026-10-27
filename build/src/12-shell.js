/* =====================================================================
   Shell: the live StaffShell (crm/src/views/StaffShell.tsx, NavLinks.tsx,
   ui/mobile-nav.tsx): w-64 sidebar with brand, Work / Accounts / Settings
   groups and the account menu (details/summary popover) at the bottom; under
   1024 px the top bar with "Menu" and the wordmark, opening the same groups
   in a left sheet. The only addition is the compact "View as" role switcher
   inside the account panel. Owned by the shell agent (A).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;
  const FOCUS0 = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:outline-offset-0';

  /* ---------- Menu items per role (BRIEF section 4) ----------
     Live items keep live labels, order and icons; pending items slot in as listed. */
  const ALL = null;
  const ITEMS = [
    { href: '/app', label: 'Home', group: 'Work', icon: 'house', roles: ALL },
    { href: '/app/notices', label: 'Notices', group: 'Work', icon: 'bell', roles: ALL, count: () => TN.unreadNotices().length, countWord: 'unread' },
    { href: '/app/leads', label: 'Leads', group: 'Work', icon: 'inbox', roles: ['sales', 'manager', 'admin'] },
    { href: '/app/deals', label: 'Deals', group: 'Work', icon: 'briefcase', roles: ALL },
    { href: '/app/quotations', label: 'Quotations', group: 'Work', icon: 'file-text', roles: ['sales', 'manager'] },
    { href: '/app/itineraries', label: 'Itineraries', group: 'Work', icon: 'map', roles: ['sales', 'manager'] },
    { href: '/app/purchase', label: 'Purchase tasks', group: 'Work', icon: 'clipboard-list', roles: ['purchase', 'manager'] },
    { href: '/app/purchase/suppliers', label: 'Suppliers', group: 'Work', icon: 'building-2', roles: ['purchase', 'manager'] },
    { href: '/app/purchase/payments', label: 'Payment requests', group: 'Work', icon: 'wallet', roles: ['purchase'] },
    { href: '/app/flight', label: 'Flight tasks', group: 'Work', icon: 'plane', roles: ['flight'] },
    { href: '/app/visa', label: 'Visa and passport tasks', group: 'Work', icon: 'stamp', roles: ['visa'] },
    { href: '/app/approvals', label: 'Approvals', group: 'Work', icon: 'shield-check', roles: ['manager'], count: () => TN.approvalsWaiting() },
    { href: '/app/reports', label: 'Reports', group: 'Work', icon: 'chart-column', roles: ['manager', 'admin', 'accounts', 'checker'] },
    { href: '/app/accounts', label: 'To check', group: 'Accounts', icon: 'clipboard-check', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/customers', label: 'Customers to check', group: 'Accounts', icon: 'circle', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/claims', label: 'Reported payments', group: 'Accounts', icon: 'hand-coins', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/dues', label: 'Customer dues', group: 'Accounts', icon: 'calendar-clock', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/supplier-payments', label: 'Supplier payments', group: 'Accounts', icon: 'wallet', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/supplier-invoices', label: 'Supplier invoices', group: 'Accounts', icon: 'receipt', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/documents', label: 'Invoices and vouchers', group: 'Accounts', icon: 'receipt-text', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/funding', label: 'Company funding', group: 'Accounts', icon: 'piggy-bank', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/refunds', label: 'Refunds and recoveries', group: 'Accounts', icon: 'undo-2', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/expenses', label: 'Department costs', group: 'Accounts', icon: 'file-spreadsheet', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/cash', label: 'Branch cash', group: 'Accounts', icon: 'banknote', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/destinations', label: 'Company accounts', group: 'Accounts', icon: 'landmark', roles: ['accounts', 'checker'] },
    { href: '/app/accounts/tally', label: 'Tally export', group: 'Accounts', icon: 'download', roles: ['accounts', 'checker'] },
  ];
  /* Live: "Customers to check" has no icon in NavLinks ICONS, so it renders the fallback Circle. Kept as live. */

  /** The menu for the current role (the Settings item when TN.settingsTabs gives at least one tab). */
  TN.navItems = () => {
    const role = TN.role;
    const items = ITEMS.filter((i) => !i.roles || i.roles.includes(role));
    let tabs = [];
    try { tabs = (TN.settingsTabs && TN.settingsTabs(role)) || []; } catch (e) { tabs = []; }
    if (tabs.length) {
      const first = tabs[0];
      const href = String(first.href || first.path || '/app/admin').replace(/^#/, '').split('?')[0] === '' ? '/app/admin' : String(first.href || first.path || '/app/admin').replace(/^#/, '');
      items.push({ href, label: 'Settings', group: 'Settings', icon: 'settings', activePrefix: '/app/admin' });
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

  /** Longest matching address marks the current item (live currentNavHref). */
  function currentNavHref(items, path) {
    if (!path) return undefined;
    const p = String(path).split('?')[0];
    const matches = (prefix) => (prefix === '/app' ? p === '/app' : p === prefix || p.startsWith(prefix + '/'));
    let best;
    for (const item of items) {
      for (const prefix of item.activePrefix ? [item.href, item.activePrefix] : [item.href]) {
        if (matches(prefix) && (!best || prefix.length > best.length)) best = { href: item.href, length: prefix.length };
      }
    }
    return best && best.href;
  }

  const wordmark = (cls) => `<span class="${cls ? 'font-sans font-display tracking-display text-ink ' + cls : 'font-sans text-xl leading-none font-display tracking-display text-ink'}">Trip<span class="text-brand-strong">Navigate</span></span>`;
  const initials = (name) => { const p = String(name).trim().split(/\s+/); return ((p[0] || '')[0] + ((p[1] || '')[0] || '')).toUpperCase() || '?'; };

  let navSeq = 0;
  function navLinks(items, nav) {
    const current = currentNavHref(items, nav);
    const base = `_tn${++navSeq}_`;
    const groups = [];
    items.forEach((it) => { const last = groups[groups.length - 1]; if (last && last.label === it.group) last.items.push(it); else groups.push({ label: it.group, items: [it] }); });
    return `<div class="flex flex-col gap-1 font-sans">${groups.map((g) => {
      const id = `${base}-${g.label}`;
      return `<div role="group" aria-labelledby="${id}" class="relative flex w-full min-w-0 flex-col py-1"><p id="${id}" class="m-0 flex h-8 shrink-0 items-center px-2.5 text-xs font-semibold text-quiet">${g.label}</p><ul class="m-0 flex w-full min-w-0 list-none flex-col gap-0.5 p-0">${g.items.map((it) => {
        const isCur = it.href === current;
        const n = it.count ? it.count() : null;
        const count = n ? `<span class="rounded-full bg-wash px-1.5 text-xs leading-5 font-medium text-quiet tabular-nums"><span class="sr-only">, </span>${n}<span class="sr-only"> ${it.countWord || 'waiting'}</span></span>` : '';
        return `<li class="relative m-0"><a${isCur ? ' aria-current="page"' : ''} class="flex min-h-9 w-full items-center gap-2.5 overflow-hidden rounded-control px-2.5 py-1.5 text-left text-base font-medium text-copy no-underline transition-[color,background-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:bg-brand-tint aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep ${FOCUS0}" href="#${esc(it.href)}">${TN.ic(it.icon, 'size-4 shrink-0 ' + (isCur ? 'text-brand' : 'text-quiet'))}<span class="min-w-0 flex-1">${esc(it.label)}</span>${count}</a></li>`;
      }).join('')}</ul></div>`;
    }).join('')}</div>`;
  }

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

  /** TN.shell({ html, nav }) -> the whole live staff frame around the page body. */
  TN.shell = ({ html, nav }) => {
    if (nav === '__bare') return html;
    const me = TN.me();
    const items = TN.navItems();
    return `<div class="staff-shell flex min-h-dvh bg-canvas">`
      + `<div class="hidden w-64 shrink-0 border-r border-line bg-card lg:block"><div class="sticky top-0 flex h-dvh flex-col font-sans">`
      + `<div class="flex items-center gap-2.5 px-4.5 pt-4.5 pb-3"><span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-control bg-brand-strong text-sm font-bold text-white">TN</span><span class="flex min-w-0 flex-col leading-tight">${wordmark('text-lg')}<span class="truncate text-xs text-quiet">${esc(me.branch)} branch</span></span></div>`
      + `<nav aria-label="Main" class="min-h-0 flex-1 overflow-y-auto px-2 pb-2">${navLinks(items, nav)}</nav>`
      + `<div class="relative border-t border-line p-2"><details id="account-menu" class="group m-0"${TN._menuOpen ? ' open=""' : ''}><summary class="flex min-h-12 min-w-0 cursor-pointer list-none items-center gap-2.5 rounded-control px-2 py-1.5 select-none hover:bg-wash group-open:bg-wash [&::-webkit-details-marker]:hidden ${FOCUS0}"><span aria-hidden="true" class="grid size-8 shrink-0 place-items-center rounded-full bg-brand-tint-2 text-xs font-semibold text-brand-deep">${esc(initials(me.name))}</span><span class="flex min-w-0 flex-1 flex-col text-left leading-tight"><span class="truncate text-sm font-semibold text-ink">${esc(me.name)}</span><span class="truncate text-xs text-quiet">${esc(me.role)} · ${esc(me.branch)}</span></span><span class="sr-only">: account menu</span>${TN.ic('chevrons-up-down', 'size-4 shrink-0 text-quiet')}</summary><div class="absolute right-2 bottom-full left-2 z-30 mb-1.5 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain rounded-card border border-line bg-card p-2 pt-3 shadow-raised">${accountPanel('sidebar', nav)}</div></details></div>`
      + `</div></div>`
      + `<div class="flex min-w-0 flex-1 flex-col">`
      + `<header class="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-card px-3 font-sans sm:px-5 lg:hidden"><button type="button" class="${TN.ui.buttonClass('ghost', 'md', 'px-2.5 lg:hidden')}" data-slot="button" aria-haspopup="dialog" aria-expanded="false" data-state="closed" data-act="tn-menu">${TN.ic('menu')}Menu</button>${wordmark('text-lg')}</header>`
      + `<main id="main" class="w-full min-w-0 max-w-[72rem] p-8 max-md:p-5" tabindex="-1">${html}</main>`
      + `</div></div>`;
  };

  /* ---------- Phone Menu sheet (live MobileNav on the Radix Drawer, side left) ---------- */
  function openSheet() {
    const nav = TN.path().split('?')[0];
    const id = 'radix-menu';
    const cls = TN.ui.cx('fixed inset-y-0 z-50 flex w-[min(24rem,calc(100vw-3rem))] flex-col overflow-y-auto bg-card font-sans text-base text-copy shadow-overlay outline-none', 'left-0 rounded-r-panel data-[state=open]:animate-ui-slide-in-left data-[state=closed]:animate-ui-slide-out-left', 'motion-reduce:animate-none', 'w-[min(20rem,calc(100vw-3rem))] border-r border-line px-3 py-4.5');
    const html = `<div data-state="open" class="fixed inset-0 z-50 bg-[rgb(15_23_42/0.42)] data-[state=open]:animate-ui-fade-in data-[state=closed]:animate-ui-fade-out motion-reduce:animate-none" data-close="" aria-hidden="true"></div>`
      + `<div role="dialog" id="${id}" aria-describedby="${id}-description" aria-labelledby="${id}-title" aria-modal="true" data-state="open" class="${cls}" tabindex="-1" data-sheet="menu">`
      + `<h2 id="${id}-title" class="m-0 px-2.5 pt-1 pb-1">${wordmark()}</h2><p id="${id}-description" class="sr-only">Main menu</p>`
      + `<div class="mt-3 flex flex-col gap-4"><nav aria-label="Main">${navLinks(TN.navItems(), nav)}</nav><section aria-label="Your account" class="border-t border-line pt-3">${accountPanel('sheet', nav)}</section></div>`
      + `<button type="button" class="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-control border-0 bg-transparent p-0 text-quiet hover:bg-wash hover:text-ink outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none" aria-label="Close menu" data-close="" data-corner-close="">${TN.ic('x', 'size-4')}</button></div>`;
    const btn = document.querySelector('[data-act="tn-menu"]');
    if (btn) { btn.setAttribute('aria-expanded', 'true'); btn.dataset.state = 'open'; }
    TN.openOverlay(html, { focus: 'nav a[href]' });
  }
  TN.act('tn-menu', () => openSheet());
  // Following a link in the sheet closes it (also when it is the page already shown).
  document.addEventListener('click', (ev) => { const a = ev.target.closest('[data-sheet="menu"] a[href]'); if (a) setTimeout(() => TN.closeOverlay(), 0); }, true);
  // Reset the Menu button state whenever the overlay closes.
  const resetMenuBtn = () => { const btn = document.querySelector('[data-act="tn-menu"]'); if (btn && !document.querySelector('#tn-overlay [data-sheet]')) { btn.setAttribute('aria-expanded', 'false'); btn.dataset.state = 'closed'; } };
  new MutationObserver(resetMenuBtn).observe(document.getElementById('tn-overlay') || document.body, { childList: true });

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
