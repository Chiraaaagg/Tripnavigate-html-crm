/* =====================================================================
   Core: role, router, page registry, events, overlays, formatting.
   API frozen by the lead (see build/BRIEF.md). The shell agent may
   improve the internals and the shell markup but must keep every
   name and signature below working.
   ===================================================================== */
(function () {
  const TN = window.TN;

  /* ---------- Escaping and formatting ---------- */
  TN.esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const INR = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  TN.fmt = {
    /** 186500 -> "₹1,86,500" (Indian grouping, no paise). null -> "—". */
    inr: (n) => { if (n == null || n === '') return '—'; const v = Number(n); return (v < 0 ? '−' : '') + '₹' + INR.format(Math.abs(v)) + '.00'; }, // live formatInr: always shows paise
    /** "2026-11-14" -> "14 Nov 2026" (live en-IN medium date). */
    date: (iso) => { if (!iso) return '—'; const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return `${d} ${MON[m - 1]} ${y}`; },
    /** "2026-11-14" -> "14 Nov" */
    day: (iso) => { if (!iso) return '—'; const [, m, d] = String(iso).slice(0, 10).split('-').map(Number); return `${d} ${MON[m - 1]}`; },
    /** "2026-10-27 09:00" -> "27 Oct 2026, 9:00 am IST" */
    dateTime: (s) => { if (!s) return '—'; const [dt, tm = '00:00'] = String(s).split(' '); let [h, mi] = tm.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return `${TN.fmt.date(dt)}, ${h}:${String(mi).padStart(2, '0')} ${ap} IST`; },
    /** whole days from TN.TODAY to iso (negative = past) */
    daysFrom: (iso) => Math.round((Date.parse(iso) - Date.parse(TN.TODAY)) / 86400000),
    plural: (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`,
  };

  /* ---------- Role ---------- */
  let role = 'sales';
  try { const q = new URLSearchParams(location.search).get('role'); const s = q || localStorage.getItem('tn-preview-role'); if (s && TN.ROLES.some((r) => r.key === s)) role = s; } catch (e) { /* storage blocked */ }
  Object.defineProperty(TN, 'role', { get: () => role });
  TN.roleDef = () => TN.ROLES.find((r) => r.key === role);
  /** The signed-in person for the current preview role. */
  TN.me = () => ({ key: TN.roleDef().person, ...TN.PEOPLE[TN.roleDef().person] });
  /** Money fence / ability check. Unknown capability = false. */
  TN.can = (cap) => (TN.CAPS[cap] || []).includes(role);
  /** True when the current role is one of the given keys. */
  TN.is = (...keys) => keys.includes(role);
  TN.setRole = (key) => {
    if (!TN.ROLES.some((r) => r.key === key)) return;
    role = key;
    try { localStorage.setItem('tn-preview-role', key); } catch (e) { /* ignore */ }
    TN.closeOverlay();
    // Stay on the page if the new role may open it, else go Home.
    const m = match(currentPath());
    if (!m || !allowed(m.def)) { location.hash = '#/app'; } else { TN.render(); }
  };

  /* ---------- Page registry and router ----------
     TN.page('/app/deals/:id', { nav: '/app/deals', roles: ['sales', ...] | undefined (all),
              title: 'Deal', render(params, query) -> html, mount?(root, params, query) }) */
  const pages = [];
  TN.page = (pattern, def) => {
    const keys = [];
    const rx = new RegExp('^' + pattern.replace(/\/:([a-zA-Z]+)/g, (_, k) => { keys.push(k); return '/([^/]+)'; }) + '$');
    pages.push({ pattern, rx, keys, def });
  };
  function currentPath() { const h = location.hash.replace(/^#/, '') || '/app'; return h; }
  function match(full) {
    const [path, qs = ''] = full.split('?');
    for (const p of pages) {
      const m = path.match(p.rx);
      if (m) { const params = {}; p.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1]))); return { def: p.def, params, query: Object.fromEntries(new URLSearchParams(qs)), path }; }
    }
    return null;
  }
  function allowed(def) { return !def.roles || def.roles.includes(role); }
  /** Can the current role open this in-app address? (roles, then the page's own canOpen(params)). */
  TN.canOpen = (href) => {
    const m = match(String(href).replace(/^#/, ''));
    if (!m || !allowed(m.def)) return false;
    try { return !m.def.canOpen || m.def.canOpen(m.params, m.query) !== false; } catch (e) { return true; }
  };
  /** A role never sees a link it cannot open: such links become plain text (lead rule, 27 Oct). */
  function unlinkClosed(root) {
    root.querySelectorAll('a[href^="#/app"]').forEach((a) => {
      if (TN.canOpen(a.getAttribute('href'))) return;
      const s = document.createElement('span');
      s.innerHTML = a.innerHTML;
      a.replaceWith(s);
    });
  }
  TN._unlinkClosed = unlinkClosed;
  TN.go = (path) => { if (location.hash === '#' + path) TN.render(); else location.hash = '#' + path; };
  TN.path = () => currentPath();
  TN.query = () => Object.fromEntries(new URLSearchParams(currentPath().split('?')[1] || ''));

  /* ---------- Home rows and nav counts, registered by department files ----------
     TN.homeRow({ roles: [...], label, count: () => n, href, section: 'What needs you' }) */
  TN.homeRows = [];
  TN.homeRow = (row) => TN.homeRows.push(row);

  /* ---------- Actions (event delegation) ----------
     <button data-act="approve-payment" data-id="SP-26-0031">  ->  TN.act('approve-payment', (el, ev) => {...})
     Forms: <form data-act="save-x"> gets the submit event; FormData via new FormData(el). */
  const acts = {};
  TN.act = (name, fn) => { acts[name] = fn; };
  document.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]');
    if (el && el.tagName !== 'FORM' && acts[el.dataset.act]) { ev.preventDefault(); acts[el.dataset.act](el, ev); return; }
    const close = ev.target.closest('[data-close]');
    if (close) { ev.preventDefault(); TN.closeOverlay(); return; }
    const a = ev.target.closest('a[href]');
    if (a) { const href = a.getAttribute('href'); if (href.startsWith('/app')) { ev.preventDefault(); TN.go(href); } else if (href === '#' || href === '') { ev.preventDefault(); } }
  });
  document.addEventListener('submit', (ev) => {
    const f = ev.target.closest('form');
    ev.preventDefault();
    if (f && f.dataset.act && acts[f.dataset.act]) acts[f.dataset.act](f, ev);
  });
  document.addEventListener('change', (ev) => {
    const el = ev.target.closest('[data-change]');
    if (el && acts[el.dataset.change]) acts[el.dataset.change](el, ev);
  });
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape' && document.querySelector('#tn-overlay > *')) TN.closeOverlay(); });

  /* ---------- Overlays ----------
     The shell agent replaces these bodies with the exact live Drawer / Dialog / Toast markup.
     TN.drawer({ title, description?, body, footer?, wide? })
     TN.dialog({ title, body, footer, tone?: 'danger' })
     TN.toast('Saved') */
  let lastFocus = null;
  TN.drawer = (o) => openOverlay(TN.ui && TN.ui.drawer ? TN.ui.drawer(o) : `<div class="fixed inset-0 z-50 bg-black/40" data-close></div><div role="dialog" aria-modal="true" class="fixed inset-y-0 right-0 z-50 w-full max-w-[42.5rem] overflow-y-auto bg-card p-5"><h2>${TN.esc(o.title)}</h2>${o.body || ''}${o.footer || ''}</div>`);
  TN.dialog = (o) => openOverlay(TN.ui && TN.ui.dialog ? TN.ui.dialog(o) : `<div class="fixed inset-0 z-50 bg-black/40" data-close></div><div role="dialog" aria-modal="true" class="fixed top-1/2 left-1/2 z-50 w-[34rem] -translate-1/2 bg-card p-5"><h2>${TN.esc(o.title)}</h2>${o.body || ''}${o.footer || ''}</div>`);
  /* Radix-like behaviour: background inert + hidden from screen readers, focus moves in,
     Tab stays inside, Escape / scrim / data-close closes, focus returns to the trigger. */
  const TABBABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
  function openOverlay(html, opts = {}) {
    if (!document.querySelector('#tn-overlay > *')) lastFocus = document.activeElement;
    const layer = document.getElementById('tn-overlay');
    layer.innerHTML = html;
    unlinkClosed(layer);
    document.documentElement.style.overflow = 'hidden';
    const root = document.getElementById('tn-root');
    if (root) { root.inert = true; root.setAttribute('aria-hidden', 'true'); }
    const box = layer.querySelector('[role="dialog"], [role="alertdialog"]') || layer;
    const pick = opts.focus ? box.querySelector(opts.focus) : null;
    const first = pick || box.querySelector('[autofocus]') || [...box.querySelectorAll(TABBABLE)].find((el) => !el.hasAttribute('data-corner-close') && el.offsetParent !== null) || box;
    if (first && first.focus) first.focus();
  }
  /** Internal: open any overlay markup (the shell's phone Menu sheet uses it). */
  TN.openOverlay = openOverlay;
  TN.closeOverlay = () => {
    const layer = document.getElementById('tn-overlay');
    if (layer && layer.innerHTML) {
      layer.innerHTML = ''; document.documentElement.style.overflow = '';
      const root = document.getElementById('tn-root');
      if (root) { root.inert = false; root.removeAttribute('aria-hidden'); }
      if (lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus();
      else { const m = document.getElementById('main'); if (m) m.focus(); }
      lastFocus = null;
    }
  };
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Tab') return;
    const box = document.querySelector('#tn-overlay [role="dialog"], #tn-overlay [role="alertdialog"]');
    if (!box) return;
    const els = [...box.querySelectorAll(TABBABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
    if (!els.length) { ev.preventDefault(); box.focus(); return; }
    const first = els[0], last = els[els.length - 1];
    if (ev.shiftKey && (document.activeElement === first || !box.contains(document.activeElement))) { ev.preventDefault(); last.focus(); }
    else if (!ev.shiftKey && (document.activeElement === last || !box.contains(document.activeElement))) { ev.preventDefault(); first.focus(); }
  });

  /* Toasts (live ToastProvider): two live regions; success/info/neutral close after 6 s
     (paused while hovered or focused), warning/danger stay until dismissed; at most five.
     TN.toast('Receipt recorded')  ·  TN.toast('Refused', 'danger')  ·  TN.toast({ title, description, tone }) */
  const toasts = []; let toastSeq = 0;
  const URGENT = ['warning', 'danger'];
  function toastLayer() {
    const layer = document.getElementById('tn-toast');
    if (layer && !layer.querySelector('section') && TN.ui && TN.ui.toastRegion) { layer.removeAttribute('aria-live'); layer.innerHTML = TN.ui.toastRegion(); }
    return layer;
  }
  function drawToasts() {
    const layer = toastLayer();
    if (!layer) return;
    if (!(TN.ui && TN.ui.toast)) { layer.innerHTML = toasts.map((t) => `<div role="status" class="fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-control border border-line bg-card px-4 py-3 shadow-raised">${TN.esc(t.title)}</div>`).join(''); return; }
    const urgent = layer.querySelector('[data-toast-urgent]'); const polite = layer.querySelector('[data-toast-polite]');
    const sync = (box, list) => {
      const want = list.map((t) => String(t.id));
      [...box.children].forEach((el) => { if (!want.includes(el.dataset.toast)) el.remove(); });
      list.forEach((t) => { if (!box.querySelector(`[data-toast="${t.id}"]`)) box.insertAdjacentHTML('beforeend', TN.ui.toast(t)); });
    };
    sync(urgent, toasts.filter((t) => URGENT.includes(t.tone)));
    sync(polite, toasts.filter((t) => !URGENT.includes(t.tone)));
  }
  function armToast(t) {
    if (URGENT.includes(t.tone)) return;
    clearTimeout(t.timer);
    t.timer = setTimeout(() => { if (t.paused) return armToast(t); TN.dismissToast(t.id); }, 6000);
  }
  TN.dismissToast = (id) => { const i = toasts.findIndex((t) => t.id === Number(id)); if (i >= 0) { clearTimeout(toasts[i].timer); toasts.splice(i, 1); drawToasts(); } };
  TN.toast = (text, tone, description) => {
    const o = text && typeof text === 'object' ? text : { title: text, tone, description };
    const t = { id: ++toastSeq, title: String(o.title ?? ''), description: o.description, tone: o.tone || 'success' };
    toasts.push(t); while (toasts.length > 5) { clearTimeout(toasts[0].timer); toasts.shift(); }
    drawToasts(); armToast(t);
    return t.id;
  };
  document.addEventListener('click', (ev) => { const b = ev.target.closest('[data-toast-dismiss]'); if (b) TN.dismissToast(b.dataset.toastDismiss); });
  const pauseToast = (ev, on) => { const card = ev.target.closest && ev.target.closest('[data-toast]'); if (!card) return; const t = toasts.find((x) => String(x.id) === card.dataset.toast); if (t) t.paused = on; };
  document.addEventListener('mouseover', (ev) => pauseToast(ev, true));
  document.addEventListener('mouseout', (ev) => pauseToast(ev, false));
  document.addEventListener('focusin', (ev) => pauseToast(ev, true));
  document.addEventListener('focusout', (ev) => pauseToast(ev, false));

  /* ---------- Render ---------- */
  TN.render = () => {
    const full = currentPath();
    const m = match(full);
    const root = document.getElementById('tn-root');
    const def = m && allowed(m.def) ? m.def : null;
    const html = def ? def.render(m.params, m.query) : (TN.ui && TN.ui.notAllowed ? TN.ui.notAllowed(!!m) : '<p>Page not found.</p>');
    root.innerHTML = TN.shell ? TN.shell({ html, nav: def ? def.nav || m.path : '' }) : `<main id="main">${html}</main>`;
    document.title = (def && def.title ? (typeof def.title === 'function' ? def.title(m.params) : def.title) + ' · ' : '') + 'TripNavigate CRM';
    if (def && def.mount) def.mount(root, m.params, m.query);
    if (TN.afterRender) TN.afterRender(root);
    unlinkClosed(root);
    if (!TN._keepScroll) window.scrollTo(0, 0);
    TN._keepScroll = false;
  };
  /** Re-render the same page without jumping to the top (after an in-page action). */
  TN.refresh = () => { TN._keepScroll = true; TN.render(); };
  window.addEventListener('hashchange', () => { TN.closeOverlay(); TN.render(); });
  TN.boot = () => { if (!location.hash) history.replaceState(null, '', '#/app'); toastLayer(); TN.render(); };
})();
