# Full CRM preview: build brief for every agent (lead-owned, 27 Oct 2026)

## 0. What we are building

ONE clickable HTML preview of the whole TripNavigate CRM as it will be once everything planned is built: every live screen, plus every pending feature. A role switcher (in the sidebar account menu) shows the CRM as each department sees it. The owner reviews it, approves it, and a later build session copies it exactly (as was done for the Book now form).

Owner's strict words:
- "make sure the html file is exactly the same looking like the crm that we are building": same look as the live CRM, pixel for pixel.
- "i want no changes in the html prototype that is strict": live screens look and behave exactly as live. Pending features use only the existing design language (same cards, buttons, badges, tables, drawers, notices, spacing). No new styles, no new colours, no new component types unless 21st.dev gives a pattern that you restyle to the CRM tokens.
- "i want not ai bullshit like synthetic data only and what not": NO banners or labels like "synthetic", "design preview", "demo", "nothing is saved", "AI", "pending feature", "mock". Screens look like the real CRM in use. (Exception: the role switcher label "View as" in the account menu.)
- Content is realistic Indian travel CRM content, **invented**. Never real customer data: no real names, phones, e-mails, passports or Deal numbers from the live CRM, its database, screenshots or the gallery fixtures. Use `build/src/00-data-base.js` (all invented). Hotels, airlines and places may be real businesses (they are suppliers, not customers).

## 1. Hard rules

1. Do NOT touch the repository, any git branch, the live CRM, Supabase, Vercel or Bitrix. No commits. No `npm install`. Read the live code read-only.
2. Live code (read-only): `/Users/ASUS/.codex/worktrees/release-voice-notes/crm` (main f354d5b). Read `src/views/**`, `src/components/ui/**`, `src/modules/*/contracts.ts`, `src/modules/settings/*`, `src/app/app/**`.
3. **Exact markup source:** `build/ref/gallery/<state>.html` = the server-rendered body of every live preview-gallery state (466 states, invented gallery fixtures). The full list of state names: `ls build/ref/gallery`. Gallery index with human titles: `/Users/ASUS/.codex/worktrees/release-voice-notes/crm/src/app/preview/page.tsx`. Copy class strings from these captures exactly. The live compiled CSS (`build/live.css`) is already in the page; it contains ONLY classes the live app uses, so **only use class names that exist in `build/live.css`** (grep it). If you truly need something not there, add it to your own `src/<nn>-<area>.css` with a comment, using the CSS variables in live.css (`--color-*`, `--radius-*`, `--shadow-*`); keep it tiny.
   - The live gallery is also running (read-only) at http://localhost:3077/preview/<state> if you want to look at a live state in the browser. Do not change it.
   - Ignore the gallery's yellow "Local development environment" and "Design preview" banners: they are NOT part of the CRM look and must not appear.
   - The gallery fixture names ("Synthetic Sales Delhi A", "Lagoon", etc.) must NOT be copied. Replace with our invented data.
4. Icons: lucide. Copy the exact `<svg ... class="lucide lucide-x ...">` markup from captures or use `TN.ic(name, extraClasses)` once the shell agent adds it (falls back to your own copied SVG).
5. Links: `href="#/app/..."` using the live paths (e.g. `#/app/deals/BX-38412?tab=money`). Actions: `data-act="name"` + `TN.act('name', (el, ev) => {...})`. Forms: `<form data-act="name">` (submit is intercepted). Selects/checkboxes: `data-change="name"`.
6. Every action works in memory: it changes `TN.DATA`, shows the live-style toast or notice, and calls `TN.refresh()`. Refusals show the live refusal pattern (error summary / notice) and keep typed input. Nothing is sent anywhere.
7. Money fences (standing rules 9 and 10) are enforced in every screen with `TN.can(...)` / `TN.is(...)`:
   - Purchase, Flight, Visa never see selling price, margin, customer receipts or customer payment proof (not in any column, tab, drawer, export or message). They see their own supplier costs and the budget.
   - Two different Accounts people: one records a receipt / supplier payment, a different one verifies it. Nobody approves or verifies their own work (show the live "You recorded this, so a different person must verify it" style refusal).
   - Supplier payment approval: Accounts at or below ₹50,000, branch Manager above (counted across the Deal and supplier). No automatic payouts: Accounts records each payment with its bank reference.
   - Accounts approves every hotel commitment (the go-ahead), including company-funded ones.
   - Staff reminders and notices only. Customer messages are later (do not build customer e-mail/WhatsApp sending; staff download/print documents and send them themselves).
   - Postponed: customer messages, trains. Dropped: website enquiries, minimum advance, agent portal. Do not build these.
8. Accessibility as live: visible focus (live focus ring classes), labels on every field, status never by colour alone (icon + word, as live badges), keyboard works (buttons, not divs), no sideways scroll at 375 px.
9. Write files and notes in normal English. Chat with the lead in caveman style (terse). Load the caveman skill (`caveman:caveman`) for your own chat if available.
10. **21st.dev**: for any NEW pattern a pending feature needs that the live CRM does not have, search the connected 21st.dev tool first (load it with ToolSearch, query `21st` or `select:mcp__b7058f30-ab86-468a-8c0e-d077d3078da1__search`), with short 1 to 3 word queries (e.g. `approval inbox`, `invoice`, `export`), no customer data. Restyle the result to the CRM classes so it looks native. Record every call in `build/notes/21st-<your-area>.md` (query, what came back, adopted or not and why). If the tool is unavailable, write that in the same file and continue with existing CRM patterns.

## 2. Files and the frozen API

- `build/src/00-data-base.js`: shared invented data (lead-owned). Read it fully first. You may change status fields on shared records at run time. If you need extra shared fields, add them in your OWN file at load time (e.g. `TN.DATA.deals.forEach(...)` or `TN.DATA.myArea = {...}`), never edit 00 or another agent's file. Mutate records in place (`TN.DATA.services[id].taskStatus = 'done'`); `TN.servicesOf()` returns copies.
- `build/src/10-core.js`: core API (lead-owned; the shell agent may improve internals). Use:
  - `TN.page(pattern, { nav, roles, title, render(params, query) -> html, mount?(root, params, query) })`. `nav` = the sidebar href that shows as current, e.g. `'/app/deals'`. `roles` = role keys allowed (omit = all). Role keys: `sales, purchase, flight, visa, accounts, checker, manager, admin`.
  - `TN.role`, `TN.is('sales','manager')`, `TN.can('seeSellingPrice')`, `TN.me()` -> `{key, name, role, branch}`.
  - `TN.act(name, fn)`, `TN.go(path)`, `TN.refresh()`, `TN.render()`, `TN.query()`.
  - `TN.drawer({ title, description, body, footer })`, `TN.dialog({ title, body, footer, tone })`, `TN.closeOverlay()` (any element with `data-close` closes), `TN.toast(text, tone)`.
  - `TN.homeRow({ roles, label, count: () => n, href, section })` to put a row in Home's "What needs you" table for those roles.
  - `TN.fmt.inr(n)`, `TN.fmt.date(iso)`, `TN.fmt.day(iso)`, `TN.fmt.dateTime(s)`, `TN.fmt.daysFrom(iso)`, `TN.fmt.plural(n, one, many)`, `TN.esc(v)` (ALWAYS escape data in HTML).
  - Lookups: `TN.deal(id)`, `TN.customer(id)`, `TN.service(id)`, `TN.supplier(id)`, `TN.person(key)`, `TN.servicesOf(dealId)`.
  - `TN.ui.*` shared markup helpers are added by the shell agent (Agent A) in `src/11-ui.js`: `TN.ui.button`, `badge`, `card`, `pageHeader`, `notice`, `table`, `tabs`, `emptyState`, `summaryList`, `field`, `drawer`, `dialog`, `toast`. Prefer them once they exist (check the file); until then copy markup from the captures. Do not wait for them.
- Your own file(s): `build/src/<nn>-<area>.js` (+ optional `.css`). Wrap your file in an IIFE. Register pages with `TN.page`. Never define pages another agent owns (see section 4).
- Test: `python3 -I build/assemble.py <yourname>` writes `build/out/<yourname>.html` with everyone's current files (one script tag per file, so another agent's broken file does not stop yours). Open it in the built-in browser at `http://localhost:4180/build/out/<yourname>.html#/app/...` (start the static server with `preview_start` name `full-crm-prototype` if it is not running; reuse it). **Open your own browser tab** (`tabs_create`) and always pass its `tabId`; other agents use the same browser. Switch role with `?role=<key>` in the address (e.g. `http://localhost:4180/build/out/sales.html?role=purchase#/app/purchase`) or the account menu. Never run `assemble.py` without a name (that writes the final file; lead only).
- Check every page you own: every role that can open it, desktop (1280 wide) and 375 px (`resize_window`), no sideways scroll, no console errors, keyboard focus visible. Reset the viewport to desktop when done.
- Notes: `build/notes/<area>.md`: what you built, per role, marked **live today** or **pending (to build)**, plus build notes the main CRM build will need (data and rules), plus any open question where the behaviour is undecided (with your recommended answer). The lead merges these into CHANGES.md.

## 3. Layout and look (all from live)

- Shell (Agent A): sidebar w-64 with Work / Accounts / Settings groups, account menu at the bottom (with the role switcher), mobile top bar with "Menu" under 1024 px opening the sheet, `<main id="main" class="w-full min-w-0 max-w-[72rem] p-8 max-md:p-5">`. Your `render()` returns only what goes inside `<main>`.
- Page header: copy `data-slot="page-header"` markup. Lists: copy the Deals list / Purchase queue markup. Record pages: copy the Deal workspace (`ws-deal-*`) and task page (`b4-purchase-task-*`) markup with `data-slot="tabs"` link tabs (`?tab=`).
- Pending features go where the plan puts them and look like the live sibling screen: e.g. a "Supplier payments" list looks like the Accounts "Reported payments" list; an approvals inbox looks like the Accounts "To check" queue; a document list looks like the Deal page Documents tab.

## 4. Who owns what (no two agents edit the same file or page)

| Agent | File(s) | Pages (routes) |
|---|---|---|
| A Shell | `10-core.js` (internals only), `11-ui.js`, `12-shell.js`, `13-home.js`, `12-shell.css` | Shell, sidebar per role, mobile Menu sheet, account menu + "View as" role switcher, `TN.ui` helpers, overlays (live Drawer/Dialog/Toast markup), `#/app` Home (per role, from `TN.homeRows` + its own rows), `#/app/notices` (staff reminders and notices), `#/app/access` (My access), not-allowed page |
| B Sales records | `20-sales.js` | `#/app/leads`, `#/app/leads/:id`, `#/app/deals`, `#/app/deals/:id` (all tabs, every role's view, incl. pending: dues on Money tab, trip status booked/travelled/closed, change after booking, cancel request, documents list with Invoice/Advance Invoice/voucher download) |
| C Book now, quotations, itineraries | `30-booknow.js`, `30-booknow.css`, `31-quotes.js` | `#/app/deals/:id/book` (the approved booking form, unchanged), `#/app/quotations`, `#/app/quotations/:id`, `#/app/quotations/new`, `#/app/itineraries`, `#/app/itineraries/:id`, referral drafts |
| D Purchase | `40-purchase.js` | `#/app/purchase`, `#/app/purchase/:taskId`, `#/app/purchase/suppliers`, `#/app/purchase/suppliers/:id`, `#/app/purchase/payments` (Purchase's own payment requests) |
| E Flight and Visa | `50-flight-visa.js` | `#/app/flight`, `#/app/flight/:taskId`, `#/app/visa`, `#/app/visa/:taskId` |
| F Accounts (live screens) | `60-accounts.js` | `#/app/accounts` (To check, incl. pending hotel go-ahead rows), `#/app/accounts/deals/:id` (booking review, Bill To, receipts per Deal), `#/app/accounts/customers`, `#/app/accounts/claims`, `#/app/accounts/expenses`, `#/app/accounts/cash`, `#/app/accounts/destinations` |
| G Accounts money (pending) | `70-money.js` | `#/app/accounts/dues` (customer dues, collections, allocations), `#/app/accounts/supplier-payments`, `#/app/accounts/supplier-invoices`, `#/app/accounts/documents` (Invoice, Advance Invoice, voucher approval), `#/app/accounts/funding` (company-funded bookings), `#/app/accounts/refunds` (refunds and recoveries), `#/app/accounts/tally` (Tally export pack) |
| H Manager, reports, settings | `80-manager.js`, `81-settings.js` | `#/app/approvals` (Manager approvals inbox + escalations), `#/app/reports`, `#/app/reports/:id` (with Excel export), `#/app/admin/*` (all Settings tabs, incl. pending buttons for the big switches and e-mail templates/reminder settings) |

Sidebar items (Agent A builds them from this table; owners make the pages):

- Work: Home (all) · Notices (all) · Leads (sales, manager, admin) · Deals (all) · Quotations, Itineraries (sales, manager) · Purchase tasks, Suppliers (purchase, manager) · Payment requests (purchase) · Flight tasks (flight) · Visa and passport tasks (visa) · Approvals (manager) · Reports (manager, admin, accounts, checker)
- Accounts (accounts, checker): To check · Customers to check · Reported payments · Customer dues · Supplier payments · Supplier invoices · Invoices and vouchers · Company funding · Refunds and recoveries · Department costs · Branch cash · Company accounts · Tally export
- Settings: shown when `TN.settingsTabs(role)` (defined by Agent H in `81-settings.js`) returns at least one tab; its href is the first tab.

Shared records the cross-department features use (all in 00): `instalments` (dues), `receipts`, `paymentReports`, `supplierPayments`, `supplierInvoices`, `documents`, `funding`, `cancellations`, `changes`, `refunds`, `notices`, `services[].goAhead`, `deals[].tripStatus`. When your action affects another department, update the shared record and push a notice: `TN.DATA.notices.unshift({ id, to: [...roles], kind: 'notice', text, deal, at: '2026-10-27 hh:mm' })`.

## 5. Undecided behaviour (build with the recommended answer; the lead asks the owner)

1. Who chases unpaid instalments: **the Deal's Sales owner; Accounts sees the same dues list; the Manager gets an escalation after 3 days overdue.**
2. Partial supplier payments: **allowed; each part is its own request; the ₹50,000 limit counts everything already requested for that supplier on that Deal.**
3. Supplier bank details change: **payments to that supplier go On hold until the Manager approves the new details.**
4. Cancellations, refunds and write-offs: **Sales requests, Purchase enters supplier charges, the branch Manager approves, Accounts pays the refund and a different Accounts person verifies it.**
5. Invoice numbers: **`HC/JDH/26-27/0001` (Invoice) and `HC/JDH/ADV/26-27/0001` (Advance Invoice), per branch and financial year; marked "Not a tax invoice. The tax invoice is issued from Tally."**
6. Company funding: **Accounts approves up to ₹50,000, the Manager above; it is recovered from the next customer receipt on that Deal.**
7. Trip status: **Booked (all services confirmed) → Travelled (set automatically the day after the trip ends) → Closed (Accounts closes after the closure checklist: all receipts verified, all supplier payments verified, all supplier invoices in, no open refund).**
8. Flight direct payment: **Flight may pay the airline directly up to ₹50,000 per ticket with proof (live "Department costs"); above that it raises a payment request.**

## 6. Done for your part when

Every page you own opens for each allowed role, shows the right money fences, every button does something believable, looks exactly like the live siblings at desktop and 375 px, no console errors, and your notes file is written. Then report to the lead in a few caveman lines: files, pages, anything unfinished, open questions.
