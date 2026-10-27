/* =====================================================================
   Home (#/app, live crm/src/views/home-view.tsx), staff reminders and
   notices (#/app/notices, pending) and My access (#/app/access, live
   staff-views.tsx MyAccessView). Owned by the shell agent (A).
   Department files add their own Home rows with TN.homeRow({...}).
   ===================================================================== */
(function () {
  const TN = window.TN;
  const U = TN.ui;
  const esc = TN.esc;
  const nf = new Intl.NumberFormat('en-IN');
  const me = () => TN.roleDef().person; // the TN.PEOPLE key of the signed-in person

  /* ---------- Which live Home roles apply (shell-permissions.ts homeWorkRoles) ---------- */
  const ROLES = {
    sales:    { bookings: true, quotations: true },
    manager:  { bookings: true, quotations: true, branchManager: true, purchase: true },
    purchase: { purchase: true },
    flight:   { flight: true },
    visa:     { visa: true },
    accounts: { accounts: true },
    checker:  { accounts: true },
    admin:    {},
  };

  /* ---------- Deal scope for the chips ---------- */
  const deptOf = { purchase: 'purchase', flight: 'flight', visa: 'visa' };
  function dealScope() {
    const r = TN.role; const p = me();
    const deals = TN.DATA.deals;
    const services = Object.values(TN.DATA.services);
    const assigned = (d) => services.some((s) => s.deal === d.id && s.assignee === r);
    if (r === 'sales') {
      const owned = deals.filter((d) => d.owner === p);
      const asg = deals.filter((d) => d.owner !== p && assigned(d));
      return { visible: owned.length + asg.length, owned: owned.length, assigned: asg.length };
    }
    if (deptOf[r]) {
      const vis = deals.filter((d) => services.some((s) => s.deal === d.id && s.dept === deptOf[r] && (s.assignee === r || s.assignee == null)) && d.accountsReview === 'approved');
      return { visible: vis.length, owned: 0, assigned: deals.filter(assigned).length };
    }
    if (r === 'manager') return { visible: deals.length, owned: 0, assigned: 0 };
    if (r === 'accounts' || r === 'checker') return { visible: deals.filter((d) => d.submittedAt).length, owned: 0, assigned: 0 };
    return { visible: 0, owned: 0, assigned: 0 };
  }

  /* ---------- Live "What needs you" rows, counted from TN.DATA ---------- */
  function liveRows() {
    const R = ROLES[TN.role] || {};
    const p = me();
    const D = TN.DATA;
    const mine = (d) => (R.branchManager ? true : d.owner === p);
    const deals = D.deals.filter(mine);
    const scope = R.branchManager ? 'your deals and branches' : 'your deals';
    const rows = [];
    const deptQueue = (dept) => Object.values(D.services).filter((s) => s.dept === dept && D.deals.find((d) => d.id === s.deal && d.accountsReview === 'approved') && ((s.assignee == null && s.taskStatus === 'new') || (s.assignee === dept && s.taskStatus === 'in_progress'))).length;
    if (R.bookings) rows.push({ label: 'Booking drafts you can continue', count: deals.filter((d) => ['in_progress', 'ready_to_submit', 'returned'].includes(d.bookingState)).length, href: '/app/deals', action: 'Open deals', icon: 'hourglass' });
    if (R.purchase) rows.push({ label: 'Purchase tasks not taken yet, or yours in progress', count: deptQueue('purchase'), href: '/app/purchase', action: 'Open Purchase tasks', icon: 'clipboard-list' });
    if (R.flight) rows.push({ label: 'Flight tasks not taken yet, or yours in progress', count: deptQueue('flight'), href: '/app/flight', action: 'Open Flight tasks', icon: 'plane' });
    if (R.accounts) rows.push({ label: 'Bookings to review in your companies', count: D.deals.filter((d) => d.bookingState === 'waiting_for_accounts').length, href: '/app/accounts?filter=needs_review', action: 'Open To check', icon: 'clipboard-check' });
    if (R.bookings) {
      rows.push(
        { label: `Returned by Accounts (${scope})`, count: deals.filter((d) => d.bookingState === 'returned').length, href: '/app/deals', action: 'Open deals', icon: 'undo-2' },
        { label: `Booking drafts missing details (${scope})`, count: deals.filter((d) => d.bookingState === 'in_progress' && (d.sellingPrice == null || !d.services.length)).length, href: '/app/deals', action: 'Open deals', icon: 'list-checks' },
        { label: `Confirmed deals needing a booking (${scope})`, count: deals.filter((d) => ['not_started', 'quotation_accepted'].includes(d.bookingState)).length, href: '/app/deals', action: 'Open deals', icon: 'briefcase' },
      );
    }
    if (R.quotations) {
      const qs = (D.quotations || []).filter((q) => R.branchManager || !q.owner || q.owner === p);
      const qscope = R.branchManager ? 'yours and your branches’' : 'yours';
      rows.push(
        { label: `Quotation drafts to finish (${qscope})`, count: qs.filter((q) => q.status === 'draft').length, href: '/app/quotations?filter=drafts&scope=all', action: 'Open quotations', icon: 'file-pen' },
        { label: `Accepted quotations to link to a deal (${qscope})`, count: qs.filter((q) => q.status === 'accepted' && !q.deal).length, href: '/app/quotations?filter=accepted&scope=all', action: 'Open quotations', icon: 'file-check-2' },
      );
    }
    if (R.accounts) {
      rows.push(
        { label: 'Receipts to verify (recorded by someone else)', count: (D.receipts || []).filter((r) => r.status === 'recorded' && r.recordedBy !== p).length, href: '/app/accounts?filter=awaiting_verification', action: 'Open To check', icon: 'receipt' },
        { label: 'Reported payments to check in your companies', count: (D.paymentReports || []).filter((r) => r.status === 'reported').length, href: '/app/accounts/claims', action: 'Open Reported payments', icon: 'hand-coins' },
        { label: 'Department costs to review (submitted by someone else)', count: (D.departmentCosts || []).filter((e) => e.status === 'submitted' && e.submittedBy !== p).length, href: '/app/accounts/expenses', action: 'Open Department costs', icon: 'file-spreadsheet' },
      );
    }
    if (R.visa) rows.push({ label: 'Visa and passport tasks not taken yet, or yours in progress', count: deptQueue('visa'), href: '/app/visa', action: 'Open Visa and passport tasks', icon: 'stamp' });
    return rows;
  }

  /* ---------- Pending rows (registered by department files, plus the shell's own) ---------- */
  function navFor(href) {
    const path = String(href).replace(/^#/, '').split('?')[0];
    return TN.navItems().filter((i) => path === i.href || path.startsWith(i.href + '/')).sort((a, b) => b.href.length - a.href.length)[0];
  }
  function pendingRows() {
    const role = TN.role;
    const rows = TN.homeRows.filter((r) => !r.roles || r.roles.includes(role)).map((r) => {
      let n = 0; try { n = typeof r.count === 'function' ? r.count() : r.count; } catch (e) { n = 0; }
      const nav = navFor(r.href || '/app');
      return { label: r.label, count: Number(n) || 0, href: r.href, action: r.action || (nav ? 'Open ' + nav.label : 'Open'), icon: r.icon || (nav ? nav.icon : 'circle') };
    });
    const has = (prefix) => rows.some((r) => String(r.href || '').replace(/^#/, '').startsWith(prefix));
    if (role === 'manager' && !has('/app/approvals')) rows.push({ label: 'Requests to approve (your branch)', count: TN.approvalsWaiting(), href: '/app/approvals', action: 'Open Approvals', icon: 'shield-check' });
    if ((TN.DATA.notices || []).some((n) => (n.to || []).includes(role))) rows.push({ label: 'Reminders and notices you have not read', count: TN.unreadNotices().length, href: '/app/notices', action: 'Open notices', icon: 'bell' });
    return rows;
  }

  function primaryAction() {
    const R = ROLES[TN.role] || {};
    if (R.bookings) return { href: '/app/deals', label: 'Go to deals' };
    if (R.visa) return { href: '/app/visa', label: 'Open Visa and passport tasks' };
    if (R.purchase) return { href: '/app/purchase', label: 'Open Purchase tasks' };
    if (R.flight) return { href: '/app/flight', label: 'Open Flight tasks' };
    if (R.accounts) return { href: '/app/accounts', label: 'Open To check' };
    let tabs = []; try { tabs = (TN.settingsTabs && TN.settingsTabs(TN.role)) || []; } catch (e) { tabs = []; }
    if (tabs.length) return { href: String(tabs[0].href || '/app/admin').replace(/^#/, ''), label: 'Open ' + (tabs[0].label || 'Settings') };
    return { href: '/app/deals', label: 'Go to deals' };
  }

  const CHIP = 'inline-flex min-h-9 max-w-full items-center gap-2 rounded-control border border-line bg-card px-3 py-1.5 text-base text-copy no-underline hover:border-line-strong hover:bg-wash hover:text-ink ' + U.FOCUS;

  function whatNeedsYou(rows) {
    let body;
    if (!rows.length) {
      body = U.card(U.emptyState({ icon: 'sparkles', title: 'Nothing needs you right now', description: 'New work appears here when it is assigned to you.' }));
    } else {
      body = U.table({
        label: 'What needs you: counts', cardCls: 'overflow-hidden', firstNoLabel: true,
        columns: ['What needs you', { label: 'Waiting', numeric: true }, { label: 'Next step', cls: 'text-right' }],
        rows: rows.map((r) => [
          `<span class="flex items-center gap-2.5 font-medium text-ink">${TN.ic(r.icon, 'size-4 shrink-0 text-brand')}${esc(r.label)}</span>`,
          U.waiting(r.count > 0 ? nf.format(r.count) : 0),
          { html: U.button(esc(r.action), { href: r.href, size: 'sm', srLabel: ': ' + esc(r.label) }), cls: 'text-right' },
        ]),
      });
    }
    return `<section aria-labelledby="needs-heading">${U.sectionTitle('What needs you', 'needs-heading')}${body}</section>`;
  }

  TN.page('/app', {
    nav: '/app', title: 'Home',
    render() {
      const rows = [...liveRows(), ...pendingRows()];
      const primary = primaryAction();
      const c = dealScope();
      const chips = [
        { label: 'Deals you can open', value: c.visible, href: '/app/deals' },
        { label: 'Owned by you', value: c.owned, href: '/app/deals?filter=owned' },
        { label: 'Assigned to you', sr: ', owned by someone else', value: c.assigned, href: '/app/deals?filter=assigned' },
      ];
      return U.page(
        U.pageHeader({
          title: `Welcome, ${esc(TN.me().name)}`,
          description: rows.some((r) => r.count > 0) ? 'Work is waiting for you below.' : 'Nothing needs you right now.',
          actions: U.button(esc(primary.label), { href: primary.href, variant: 'primary' }),
        })
        + `<section aria-labelledby="deals-heading" class="mb-6"><h2 id="deals-heading" class="sr-only">Your deals</h2><ul class="m-0 flex list-none flex-wrap gap-2 p-0">${chips.map((ch) => `<li class="m-0 max-w-full"><a class="${CHIP}" href="#${ch.href}"><span>${ch.label}${ch.sr ? `<span class="sr-only">${ch.sr}</span>` : ''}</span><strong class="font-semibold text-ink tabular-nums">${nf.format(ch.value)}</strong></a></li>`).join('')}</ul></section>`
        + whatNeedsYou(rows)
        + `<details class="group mt-6 rounded-card border border-dashed border-line-strong bg-card"><summary class="flex min-h-11 cursor-pointer list-none items-center gap-2.5 rounded-card px-4.5 py-2.5 text-base font-medium text-copy hover:bg-wash [&::-webkit-details-marker]:hidden ${U.FOCUS}">${TN.ic('info', 'size-4 shrink-0 text-status-info')}What this CRM does not do yet</summary><section aria-label="Not available yet" class="border-t border-line px-4.5 py-3"><p class="m-0 text-base text-copy">Customer e-mails and WhatsApp messages are not sent from the CRM yet: download or print the document and send it yourself. Train bookings are not in the CRM yet. Sales leads, follow-ups and stages stay in Bitrix.</p></section></details>`,
      );
    },
  });

  /* ---------- Staff reminders and notices (PENDING) ---------- */
  const KIND = {
    reminder: { word: 'Reminder', many: 'Reminders', tone: 'warning', icon: 'alarm-clock' },
    notice: { word: 'Notice', many: 'Notices', tone: 'info', icon: 'bell' },
    escalation: { word: 'Escalation', many: 'Escalations', tone: 'danger', icon: 'circle-alert' },
  };
  const isRead = (n) => (n.readBy || []).includes(TN.role);
  const markRead = (n) => { n.readBy = n.readBy || []; if (!n.readBy.includes(TN.role)) n.readBy.push(TN.role); };
  const mineNotices = () => (TN.DATA.notices || []).filter((n) => (n.to || []).includes(TN.role)).slice().sort((a, b) => String(b.at).localeCompare(String(a.at)));

  TN.page('/app/notices', {
    nav: '/app/notices', title: 'Notices',
    render(params, query) {
      const all = mineNotices();
      const filter = KIND[query.filter] ? query.filter : 'all';
      const list = filter === 'all' ? all : all.filter((n) => n.kind === filter);
      const unread = all.filter((n) => !isRead(n)).length;
      const chips = [{ href: '/app/notices', label: 'All', count: all.length, current: filter === 'all' }]
        .concat(Object.entries(KIND).filter(([k]) => k !== 'escalation' || all.some((n) => n.kind === 'escalation') || TN.role === 'manager').map(([k, v]) => ({ href: '/app/notices?filter=' + k, label: v.many, count: all.filter((n) => n.kind === k).length, current: filter === k })));
      const rows = list.map((n) => {
        const k = KIND[n.kind] || KIND.notice;
        const read = isRead(n);
        const deal = n.deal ? TN.deal(n.deal) : null;
        const link = n.deal ? U.rowLink('/app/deals/' + n.deal, esc(n.deal)) : n.href ? U.link(n.href, 'Open') : '<span class="text-quiet">—</span>';
        return {
          attrs: { 'data-notice': n.id },
          cells: [
            `<p class="${read ? 'm-0 text-copy' : 'm-0 font-semibold text-ink'}">${read ? '' : '<span class="sr-only">Unread: </span>'}${esc(n.text)}</p>${deal ? `<p class="m-0 text-sm text-quiet">${esc(deal.title)}</p>` : ''}`,
            U.badge(k.word, k.tone, { icon: k.icon }),
            link,
            `<span class="whitespace-nowrap">${esc(TN.fmt.dateTime(n.at))}</span>`,
            read ? U.badge('Read', 'neutral', { icon: 'check' }) : U.badge('Unread', 'brand', { icon: 'circle-dot' }),
            { html: read ? '' : U.button('Mark as read', { size: 'sm', act: 'tn-notice-read', data: { id: n.id }, srLabel: ': ' + esc(n.text) }), cls: 'text-right', label: '' },
          ],
        };
      });
      const empty = U.card(U.emptyState({ icon: 'bell', title: filter === 'all' ? 'No reminders or notices' : `No ${KIND[filter].many.toLowerCase()}`, description: 'Reminders and notices about your work appear here. Customers never see them.' }));
      return U.page(
        U.pageHeader({
          title: 'Notices',
          description: 'Staff reminders and notices about your work. Customers do not see these.',
          status: unread ? `<span>${TN.fmt.plural(unread, 'unread notice')}</span>` : '<span>Everything is read.</span>',
          actions: unread ? U.button('Mark all as read', { act: 'tn-notice-read-all', icon: 'check-check' }) : '',
        })
        + `<div class="mb-4 flex flex-col gap-4">${U.filterChips({ label: 'Filter notices', chips, scope: 'Newest first.' })}</div>`
        + (list.length ? U.table({
          label: 'Notices', top: true,
          columns: ['Notice', 'Type', 'Deal', 'Sent', 'Status', { label: 'Actions', sr: true }],
          rows,
          footer: U.pager({ label: 'Notice pages', text: `1–${list.length} of ${list.length} notices` }),
        }) : empty),
      );
    },
  });
  TN.act('tn-notice-read', (el) => {
    const n = (TN.DATA.notices || []).find((x) => x.id === el.dataset.id);
    if (!n) return;
    markRead(n);
    TN.refresh();
    TN.toast('Marked as read');
  });
  TN.act('tn-notice-read-all', () => {
    const list = mineNotices().filter((n) => !isRead(n));
    list.forEach(markRead);
    TN.refresh();
    TN.toast(`${TN.fmt.plural(list.length, 'notice')} marked as read`);
  });
  // Opening a Deal from a notice marks that notice as read (as an e-mail client would).
  document.addEventListener('click', (ev) => {
    const row = ev.target.closest('[data-notice]');
    if (!row || !ev.target.closest('a[href]')) return;
    const n = (TN.DATA.notices || []).find((x) => x.id === row.dataset.notice);
    if (n) markRead(n);
  });

  /* ---------- My access (live MyAccessView: plain legacy styles) ---------- */
  const GRANTS = {
    manager: [{ access: 'View deals', scope: 'Jodhpur branch', reason: 'Branch Manager: every Jodhpur deal', expires: 'No expiry' }],
    accounts: [{ access: 'View deals', scope: 'Holiday Chacha Pvt LTD', reason: 'Accounts reviews bookings from every branch', expires: 'No expiry' }],
    checker: [{ access: 'View deals', scope: 'Holiday Chacha Pvt LTD', reason: 'Accounts reviews bookings from every branch', expires: 'No expiry' }],
  };
  TN.page('/app/access', {
    nav: '/app/access', title: 'My access',
    render() {
      const m = TN.me();
      const grants = GRANTS[TN.role] || [];
      return `<h1>My access</h1><p>Your role gives access to deals you own or are assigned to. Anything wider must be granted explicitly.</p>`
        + `<table><caption>Branch memberships</caption><thead><tr><th scope="col">Legal entity</th><th scope="col">Branch</th><th scope="col">Role</th></tr></thead><tbody><tr><td>Holiday Chacha Pvt LTD</td><td>${esc(m.branch)}${TN.role === 'admin' ? ' (head office)' : ''}</td><td>${esc(m.role)}</td></tr></tbody></table>`
        + `<h2 class="mt-2">Wider access grants</h2>`
        + (grants.length ? `<table><caption class="visually-hidden">Wider access grants</caption><thead><tr><th scope="col">Access</th><th scope="col">Scope</th><th scope="col">Reason</th><th scope="col">Expires</th></tr></thead><tbody>${grants.map((g) => `<tr><td>${esc(g.access)}</td><td>${esc(g.scope)}</td><td>${esc(g.reason)}</td><td>${esc(g.expires)}</td></tr>`).join('')}</tbody></table>` : '<p role="status">You have no wider access grants.</p>');
    },
  });
})();
