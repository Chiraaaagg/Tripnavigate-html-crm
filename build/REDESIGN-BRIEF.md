# Usability redesign of the full CRM preview: brief for every agent (lead-owned, 16 Nov 2026)

You are one of five agents updating the HTML prototype `full-crm-preview.html` in place, so the owner can see the approved usability redesign before anything is built in the real CRM. Read this file fully, then `build/BRIEF.md` (the original build rules, still in force except where this file overrides them), then the design plan and the owner's answers:

- Design plan: `/Users/ASUS/Programs/Tripnavigate-docs/implementation/ux-redesign-2026-11-16/design-plan.md` (sections 1 and 2 are the design; section 2.4 the optional form changes).
- Owner answers (they override the plan where they differ): `/Users/ASUS/Programs/Tripnavigate-docs/implementation/ux-redesign-2026-11-16/owner-answers.md`.
- Audits with finding IDs and before screenshots: same folder, `audit-*.md` and `shots/`.

Chat with the lead in caveman style (terse). Files and notes in normal English. Implementation work runs on Opus 5.5.

## 1. Hard rules

1. Work only in `/Users/ASUS/Programs/Tripnavigate-html-crm/build/src/` on the files you own (section 4) plus your notes file `build/notes/redesign-<area>.md`. Do not edit another agent's file, `00-data-base.js`, `live.css`, `assemble.py`, or anything outside this repository. No git commands that change anything (no commit, stash, reset, checkout). No `npm install`.
2. Never run `python3 -I build/assemble.py` without a name. Test with your own copy: `python3 -I build/assemble.py <area>` writes `build/out/<area>.html`. The lead writes the final file.
3. Preview: the static server is the launch configuration `html-crm-github` (port 4181, serves this repository). Start it with `preview_start` name `html-crm-github` if it is not running; reuse it. Open your **own tab** (`tabs_create`) and pass its `tabId` on every browser call; other agents share the browser. URL: `http://localhost:4181/build/out/<area>.html?role=<role>#/app/...`. Roles: `sales, purchase, flight, visa, accounts, checker, manager, admin`.
4. Keep everything the original brief demands: live CRM look (only classes in `build/live.css`, or tiny additions in your own `.css` using live CSS variables), invented data only, no "demo/synthetic/preview/pending" wording, money fences (Purchase, Flight, Visa never see selling price, margin or customer receipts), separate recorder and verifier, ₹50,000 rule, every button does something believable in memory.
5. **No new behaviour, fields, rules or wording changes on the approved forms** (Book now steps; Purchase, Flight, Visa and Passport task Work-tab forms and step flows) except the optional items the owner approved: O1, O5, O6, O7, O9, O10, O14. O2, O3, O4, O8, O11, O12, O13 are "later": do not do them. The approved forms keep their current confirm dialog (owner answer to C7).
6. Presentation only. Keep every address (`#/app/...` path and `?tab=` values), field name, validation message, status word, money amount and record ID. You may move, fold, group and re-order; you may not remove a capability.
7. Accessibility on every screen you touch: keyboard order, visible focus, labels, status never by colour alone, screen-reader flow (polite status, alerts for refusals), reduced motion (no animation on repeated actions; nothing over 240 ms), no sideways scroll at 390 px, usable at 200% zoom (1280 px window zoomed = 640 px CSS width).
8. Do not run new 21st.dev searches unless your area needs a pattern not listed in section 3. If you do, record it in your notes file (query, result, adopted or not).

## 2. Owner decisions that change the screens

- D1 Quotation Customer copy: "Download PDF" and "Print" buttons, with "Mark as shared" beside them. The CRM sends nothing itself.
- D2 Remove the old October Book now step screen (only if the prototype has one; otherwise nothing to do).
- D3 Old intake page: keep as it is.
- D4 One money-typing rule: not part of the prototype (separate fix later). Do not change money inputs.
- D5 Accounts menu: To check, Money in, Money out, Cash and bank, Records, Tally (see section 3, C1).
- D6 Purchase, Flight and Visa task pages open on **Work** for the person holding the task; nobody holding it, or a read-only viewer, opens on Details.
- D7 Optional form items approved: O1, O5, O6, O7, O9, O10, O14.
- D8 New Settings screen "Roles and branches": give an existing person another role or branch (reason box optional, the change shows in history).
- D9 Every Settings switch uses one confirm dialog: one sentence of effect, who is affected, an **optional** reason box, one confirm button named for the action.
- D10 Quick search finds a customer by the **full** phone number only (exact match), plus Deal reference, Bitrix number, customer name and trip.
- D11 Tally page shows only the method that is switched on; tabs only while both are on.
- D12 The staff notices switch moves to Settings › Features; Customer messages becomes its own Settings area; **no message-language choice anywhere** (all customer messages in English).

Security answers (S1–S8) are a separate plan; do not show them in the prototype.

## 3. Shared design and chosen components (all from the design plan, section 1)

Rules on every screen: one primary (filled) button per screen; one heading plus at most one muted line; status, owner and next step at the top; rows not cards for lists of the same thing; fold what is finished or rare; say a rule once per page; dates as "6 Nov 2026", date ranges never wrap.

| Code | Component | Owner choice | How it looks in the prototype |
|---|---|---|---|
| C1 | Left menu | A: shadcn Sidebar (1627, MIT) | Groups with headings: top (Home, Notices, Approvals with count) · Sales (Leads, Deals, Quotations) · Desks (Purchase tasks, Flight tasks, Visa and passport tasks, Suppliers) · Accounts (To check, Money in, Money out, Cash and bank, Records, Tally) · Reports in top group for its roles. Groups show only when the person has a link in them; a group with one link shows no heading. Counts on links with waiting work. Groups fold on click (remembered in `localStorage`, wrapped in try/catch); the group holding the current page is always open. **Settings and the account panel pinned at the bottom**, outside the scroll area. Find box at the top ("Find a Deal or Lead", opens C9). Itineraries becomes a tab on the Quotations page; Payment requests becomes a tab on Purchase tasks; these routes keep working. |
| C2 | Work-list table | A: existing CRM table + toolbar layout of olewandowski1 Search Toolbar Page Header (26793) | Page header (title, one muted line, one primary action right) · tabs with counts · one toolbar row: search field (placeholder says what it finds), up to four status chips (rest under "More"), sort select · rows one line on desktop: What (name is the link) · Dates · Status (one badge + plain text second fact) · Next step (with one row button when the viewer can act) · Who · Deal. Approval lists put **Approve** and **Return** on the row; Return opens the reason box. Pager unchanged (C10). Phones: rows stack as labelled cards (existing `table({ stack: true })`). |
| C3 | Status badges | A: existing CRM badge | One shared status-to-tone table `TN.ui.statusTone(word)` so the same word always has the same tone and icon. |
| C4 | Record header | A: existing page header + layout of olewandowski1 Page Header with Breadcrumbs (18149) | Line 1: back link to the list · record ID. Line 2: title · status badge · owner. Line 3: "Next:" in plain words with the one primary button; if the control is lower on the page the button jumps to it and focuses it; if the viewer cannot act, the line says who can. System facts fold into "Details". |
| C5 | Tabs | C: coss.com Tabs (11646), licence confirmed by owner | Pill-style tabs with an optional count badge (see the 21st.dev preview `https://cdn.21st.dev/coss.com/tabs/with-badge/preview.1774357976645.png`). Still links (`?tab=`), still `aria-current`. Record tabs carry no counts that would leak money facts. |
| C6 | Settings switch row | A: sean0205 Switch With Description (29860), pattern only | Name · one-line effect ("More" for long text) · state badge in words (On / Off / Not known) · last change (who, when) · "Change" button. Not an instant toggle. Bell settings rows (sound, pop-ups) may stay live switches. |
| C7 | Confirm dialog | B: shadcn Alert Dialog (705, MIT) | Title, one sentence of effect, who is affected, optional reason box (D9), Cancel (focused first) and one confirm button named for the action. Approved forms keep their current dialog. |
| C8 | Screen states | A: existing CRM parts | Empty (icon, one sentence why, at most one action), Error (what happened, whether saved, who can fix, Try again), Blocked (action visible but disabled with the reason and who unblocks it, beside it), Read-only (one line under the header: "You can view this. <who> can change it."), Switched off (notice with where it is switched on), Not known (words "not known", never 0). |
| C9 | Quick search | A: existing search box in a dialog | Opens from the sidebar find box or the "/" key (not while typing in a field). Results grouped Deals / Leads, keyboard arrows + Enter, Escape closes. Matches Deal reference, Bitrix number, customer name, trip, and a **full** phone number (exact, digits only compare). Respects money fences and role access (Purchase sees only Deals it may open). |
| C10 | Page controls | existing CRM pager, unchanged | Keep `TN.ui.pager` as is. |
| C11 | Folded sections | A: plain `<details>` fold-out inside pages; shadcn Collapsible (847) behaviour for menu groups | One shared style `TN.ui.fold(...)`. No height animation. |

Accounts sections (D5), mapped to the prototype's existing routes (each section is a tab strip of existing pages; the menu link opens the first tab with something waiting, otherwise the first tab):

| Menu link | Tabs (existing routes) |
|---|---|
| To check | To check `/app/accounts` · Customers `/app/accounts/customers` · Reported payments `/app/accounts/claims` |
| Money in | Dues `/app/accounts/dues` · Invoices and vouchers `/app/accounts/documents` · Refunds `/app/accounts/refunds` |
| Money out | Supplier payments `/app/accounts/supplier-payments` · Supplier invoices `/app/accounts/supplier-invoices` · Company funding `/app/accounts/funding` · Department costs `/app/accounts/expenses` |
| Cash and bank | Branch cash `/app/accounts/cash` · Company accounts `/app/accounts/destinations` |
| Records | Reports `/app/reports` for Accounts roles (the prototype has no separate Documents-and-money page; say so in your notes) |
| Tally | Tally `/app/accounts/tally` |

## 4. Who owns what

| Agent | Files | Scope |
|---|---|---|
| A Shell and shared parts | `11-ui.js`, `12-shell.js`, `13-home.js`, new `12-shell.css` (if needed), `10-core.js` internals only | C1 menu, C3 `statusTone`, C4 `recordHeader`, C2 `queueToolbar` + `approvalRowActions`, C5 new look of `TN.ui.tabs` (all pages pick it up), C6 `switchRow`, C7 `TN.confirmChange`, C8 `TN.ui.state`, C9 `TN.quickSearch`, C11 `TN.ui.fold`, `TN.ui.jumpLinks`, `TN.ui.sectionTabs(sectionKey, currentHref)` and `TN.ACC_SECTIONS`; Home per design plan 2.2 (rows open filtered lists; button named for the count; rows with nothing waiting show no button; Purchase/Flight/Visa "What needs you" first). |
| B Sales | `20-sales.js`, `31-quotes.js`, `30-booknow.js` and `30-booknow.css` (O1 only) | Deals and Leads lists (C2), Deal record header (C4), Deal tabs Overview · Services and tasks · Money · Documents · Messages · History (keep every old `?tab=` value working by mapping it to the new tab), "Tell Accounts about a payment" as a button opening the existing claim form in a dialog, Quotations list with an Itineraries tab, D1 on the Customer copy, O1. |
| C Desks | `40-purchase.js`, `40-purchase.css`, `39-purchase-breakups.js`, `50-flight-visa.js` | Purchase, Flight, Visa queues (C2, default sort "Soonest travel first"), task record headers (C4), D6 landing tab, O5, O6, O7, O9, O10, O14; Suppliers register (C2, add form in a drawer); Payment requests as a tab beside Purchase tasks. |
| D Accounts | `60-accounts.js`, `60-accounts.css`, `70-money.js`, `70-money.css` | Section tab strips (table above) on every Accounts page, C2 queue pattern, Approve / Return on approval rows, Accounts view of a Deal (one page, tabs Receipts · Dues and plan · Documents · Refunds · Review; "Record a receipt" at the top; receipts awaiting first with "Verify" on the row), D11 on Tally. |
| E Settings and Manager | `80-manager.js`, `81-settings.js` | Settings frame (area list on the left on desktop, select on phones; Overview landing), C6 switch rows + C7 confirm with optional reason everywhere, Features (with the staff notices switch, D12), Customer messages as its own area (9 messages × WhatsApp / e-mail grid of state cells with "Change"; Texts, Pilot list, Set-up sub-tabs; no language choice), Staff list first with a row menu and "Invite staff" opening the form, D8 Roles and branches, Manager Approvals (sticky summary chips with counts that jump to sections, only sections with something waiting, empty ones listed in one closing line, one row template with Approve / Return), Reports list in the queue pattern. |

## 5. Shared helper contract (Agent A builds these first; everyone else uses them)

All return HTML strings unless stated. Escape data with `TN.esc` before passing it in.

```js
TN.ui.statusTone(word)                       // -> { tone, icon } for a status word; unknown words -> neutral
TN.ui.status(word, { second })               // badge from statusTone + optional plain-text second fact beside it
TN.ui.recordHeader({ back: { href, label }, recordId, title, status, owner,
  next: { text, button: { label, href | act | jump: '#element-id', data } } | null,
  nextWho,                                   // when the viewer cannot act: "Purchase confirms the hotel."
  readOnly,                                  // "You can view this. Accounts can change it."
  details })                                 // folded "Details" html (system facts)
TN.ui.queueToolbar({ id, search: { name, value, placeholder }, chips: [{ href, label, count, current }],
  sort: { name, value, options: [{ value, label }] }, act })   // act: data-act name the page handles (search submit / sort change)
TN.ui.approvalRowActions({ id, approveAct, returnAct, approveLabel = 'Approve', returnLabel = 'Return' })
TN.ui.tabs({ label, items: [{ href, label, current, count }], cls })   // same signature, new C5 look
TN.ui.sectionTabs(sectionKey, currentHref)   // Accounts section tab strip; counts from TN.ACC_SECTIONS
TN.ACC_SECTIONS                              // [{ key, label, icon, tabs: [{ href, label, count: () => n }] }]
TN.ui.switchRow({ id, name, effect, more, state: 'on' | 'off' | 'unknown', last: { who, when }, act, data, disabledReason })
TN.confirmChange({ title, effect, affected, confirmLabel, tone, onConfirm: (reason) => {} })   // opens the C7 dialog; reason may be ''
TN.ui.state({ kind: 'empty' | 'error' | 'blocked' | 'readOnly' | 'off' | 'unknown', title, text, action, who })
TN.ui.fold({ id, summary, body, open, cls })
TN.ui.jumpLinks([{ href: '#rates', label: 'Rates' }])   // in-page links that move focus to the target
TN.quickSearch()                             // opens the C9 dialog
```

Until Agent A's helpers exist in `11-ui.js`, feature-detect (`TN.ui.recordHeader ? ... : TN.ui.pageHeader(...)`) or wait; check the file before testing. Agent A: finish and announce the helpers first (write `build/notes/redesign-shell.md` with the final signatures as soon as they work), then do the menu and Home.

## 6. Done when

Every page you own opens for each allowed role, uses the shared parts, keeps money fences, every action still works, no console errors, desktop 1280 and 390 px checked, keyboard focus visible, reduced motion respected, and `build/notes/redesign-<area>.md` lists: what changed per screen (with finding IDs), what you could not do and why, any open question. Then report to the lead in at most 10 caveman lines.
