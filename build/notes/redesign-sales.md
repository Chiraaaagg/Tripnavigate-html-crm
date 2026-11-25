# Redesign: Sales (Agent B, 16 Nov 2026)

Files changed: `src/20-sales.js`, `src/31-quotes.js`, `src/30-booknow.js` and `src/30-booknow.css` (O1 only).
Tested with `python3 -I build/assemble.py sales` (build/out/sales.html) on port 4181, roles sales, manager, admin,
accounts, purchase, flight, visa; 1280 px, 640 px (200% zoom) and 390 px; no console errors.

Shared helpers from `11-ui.js` are used when present (`TN.ui.recordHeader`, `status`, `queueToolbar`, `tabs`, `fold`,
`jumpLinks`, `pager`, `pageHeader`, `table`); `20-sales.js` keeps same-shape fallbacks (feature-detected) so the file
still works without them.

## 1. What changed per screen

### Deals list `#/app/deals` (SL-2, SL-12, SL-15, SL-20; C2)
- Page header (title, one line). Tabs with counts: All deals you can see · Owned by you · Assigned to you
  (Assigned shows only when the person has assigned Deals or is in a department). Old `?filter=owned|assigned` open the tab.
- Toolbar (shared `queueToolbar`): one search, status chips (four visible, rest under More), sort select.
  - Search finds reference, Bitrix number, customer name, trip and a **full** phone number (exact digits, with or
    without 91; D10). Phone search is not offered to Purchase, Flight or Visa.
  - Chips (`?filter=`): `needs_booking`, `drafts` (in progress, ready to submit, returned = the Home row count),
    `returned`, `arranging`, then under More `missing_details`, `waiting_accounts`, `confirmed`, `overdue`
    (price readers only), `changes`, `lost`. Department roles get no booking-status chips (they see their task word).
  - Sort (`?sort=`): newest Bitrix number (default, as live), `id_asc`, `travel` (soonest travel first).
- Rows: Customer and trip (the name is the link; card title on phones, so the old mid-word label break is gone) ·
  Dates ("14–18 Nov 2026" + nights, no wrap) · Status (one badge from the shared tone table + "1 of 3 confirmed") ·
  Next step (the Deal header's words, one row button when the viewer can act: Start booking, Continue, Fix) · Owner ·
  Deal (reference + the existing Details disclosure; Bitrix stage moved into Details). Freshness and "Live updates on"
  moved under the list.
- Empty states kept (Accounts "Your Deal work is in Accounts", Super Admin, filter / search).

### Leads list `#/app/leads` (SL-12; C2)
- Tabs All leads you can see · Mine (old `?filter=mine` works). Toolbar: search (name, trip, BXL- reference), chips by
  Bitrix status (New, In progress, Quotation sent, Follow-up; More: Converted, Lost, Waiting for owner), sort.
- Rows: Customer and trip (link) · Created · Status (Bitrix name + source as the second fact) · Next step (with
  "New quotation" row button when the person may quote) · Owner · Deal (converted Deal link + Details; branch moved
  into Details).

### Lead page `#/app/leads/:id`
- C4 record header (back · BXL- ID / title · Bitrix status · owner / Next + "New quotation" / Details: branch, Bitrix lead).
  Tabs use the shared C5 look. Content unchanged.

### Deal page `#/app/deals/:id` (SL-3, SL-5, SL-6, SL-8, SL-14, SL-16; C4, C5)
- Header (C4): back · ID / title · booking status (shared tone) with "Services: n of m confirmed" · trip badge · owner /
  "Next:" + the ONE primary button (Start booking, Continue booking, Fix and send again, View booking, See team tasks,
  Open in Accounts). On Services and tasks, "See team tasks" jumps to the services list instead of reloading.
  Bitrix stage, From lead and "Live updates on" moved into the folded Details. Returned / lost / cancellation notices
  stay right under the header.
- Tabs: **Overview · Services and tasks · Money · Documents · Messages · History** (Money and Messages only for
  price readers: Sales, Manager, Accounts). Old `?tab=quotations` opens Documents; unknown tab falls back to the default.
  Default tab: Services and tasks for the Deal's Sales owner when the Deal has services; Overview for everyone else
  (design plan 1.3). Tab links always carry `?tab=`.
- Overview: one-screen summary: customer and phone (price readers only), trip with dates, travellers (not Purchase,
  Flight), services with status, money (selling total, still to pay, overdue badge; price readers only), open change,
  last thing shared with the customer, team; each links to its tab. Trip status and closure checklist kept.
  "Details and Bitrix facts" folded (branch, created, why visible, Bitrix facts). The repeated "Overview" heading is
  screen-reader only.
- Services and tasks: "Request a change" moved into the Services sold header; hidden while a change waits for the
  customer (one line says why). Earlier changes (done, withdrawn) fold to one line each. "Cancel booking" stays in the
  Changes card as a quiet button, away from the primary.
- Money: "Tell Accounts about a payment" in the card header opens the **existing claim form unchanged** in a dialog
  (same fields, rules, refusals, duplicate-reference message; error summary takes focus). Jump links (Customer dues ·
  Reported payments · Receipts · Refunds). New read-only "Refunds and recoveries" section from existing refund records.
  Order: Booking, Customer dues, reported payments, receipts, refunds, versions.
- Documents: files, Invoices and vouchers, then Quotations and Branded itineraries (moved from the old Quotations tab;
  Sales and Manager only), with jump links.
- Messages (new tab): "Shared with the customer" (quotations marked as shared, documents marked as sent, newest first,
  each linking to the item) and "Staff notices on this deal" (notices addressed to the viewer's role).
- History: unchanged, last tab.
- Fix: Deal-page money printed paise twice (`₹1,86,500.00.00`) after the core `TN.fmt.inr` started adding paise;
  `rs()` now adds `.00` only when missing.

### Quotations and Itineraries `#/app/quotations`, `#/app/itineraries` (SL-10; C2)
- One list page with two tabs: Quotations (count) · Itineraries (count). Both routes kept; itinerary pages now
  highlight Quotations in the menu (`nav: '/app/quotations'`).
- Mine / All switch kept. One search box replaces "Search this page" + "Open by reference": an exact reference
  (Q-…, TD-…, IT-…) opens the record (closed drafts and referral drafts included); an unknown reference shows the
  live refusal; any other text searches every status and page. Chips: Open, Drafts, Shared, Accepted, rest under More.
  Sort: recently updated (default), valid until, reference.

### Quotation Customer copy `#/app/quotations/:id/preview` (D1, SL-4)
- Buttons: **Download PDF** (primary; a real small A4 PDF built in the browser from the same facts, file
  `Q-2610-014-v2.pdf`), **Print** (opens the new bare print view `#/app/quotations/:id/print?v=n&print=1` in a new
  tab, which opens the browser print dialog), **Mark as shared** beside them (the existing dialog). Draft version:
  Mark as shared is disabled with the reason beside it. Shared versions show "Version n shared by WhatsApp on …".
  The CRM sends nothing.

### Book now step 3, O1
- The sticky footer button is now labelled "Submit booking and create tasks" (same as the real submit) and scrolls to
  and focuses the real button (no smooth scroll). `30-booknow.css` adds a focus ring on `#submitBtn` so the focus is
  visible after a mouse click too. Nothing else in Book now changed.
- Note: `30-booknow.*` are generated by `notes/agentc-tools/convert.py`; re-running the generator would drop O1.
  Port the two edits into `integration.js` before regenerating.

## 2. Checks done
- Money fences: every Deal × every tab (including old `?tab=quotations`) for Purchase, Flight, Visa: no selling total,
  customer phone, dues, reported payments, receipts, Money/Messages tabs or quotation text.
- No sideways page scroll at 390 px and 640 px on 97 addresses per role (sales, manager, admin, accounts, purchase).
- Claim dialog: empty submit (error summary focused, typed input kept), future date refusal, valid submit (reported
  payment listed, notice to Accounts). Search, chips, sort, Home filter addresses, PDF structure (xref offsets valid),
  Mark as shared from the customer copy, O1 focus move.
- Every class used on these pages exists in the loaded CSS.

## 3. Not done, and why
- Lead page Overview with contact and trip facts (SL-13), "New quotation creates directly" (SL-11), quotation editor
  autosave (SL-9), itinerary editor (SL-21), read-only booking page (SL-7): not in my scope row.
- Customer message delivery log (sent / delivered / failed, "Send again"): the prototype has no customer message
  records, so Messages shows what staff shared and staff notices only.
- At 640 px (200% zoom) the lists keep the desktop table and scroll inside their focusable table region; the shared
  `TN.ui.table` stacks rows into cards only below 640 px.

## 4. Open questions
1. Deal default tab: Services and tasks for the Sales owner once services exist (plan 1.3). Keep, or always Overview?
2. Messages tab: once customer messages exist (Settings › Customer messages), should their delivery log replace or sit
   above "Shared with the customer"?
3. "Request a change" hidden while a change waits for the customer (SL-8). The Manager can still ask for a change while
   a cancellation is open (as before). Keep?
4. Shared `TN.jumpTo` uses smooth scrolling when reduced motion is off; the brief asks for no animation on repeated
   actions (Agent A's helper, not changed here).
