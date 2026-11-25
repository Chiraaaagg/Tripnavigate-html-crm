# Redesign: Purchase, Flight and Visa desks (Agent C, 16 Nov 2026)

Files: `src/39-purchase-breakups.js` (new block at the end: `TN.desk` presentation helpers), `src/40-purchase.js`,
`src/40-purchase.css` (three tiny width rules), `src/50-flight-visa.js`. Test copy: `python3 -I build/assemble.py desks`
then `build/out/desks.html?role=<role>#/app/...` on port 4181.

Presentation only. No field, step, label, warning, validation message, status word, money amount, record ID,
address or `?tab=` value of the approved Work-tab forms changed. Every old address still opens the same page.

## 1. What changed, per screen

### Purchase tasks queue `#/app/purchase` (DM-15, DM-16, DM-17, C2)

- One header line ("Each counts as booked only after you record the supplier's confirmation."; the Manager keeps
  "Purchase colleagues take these tasks. You can follow progress here."). The builder line "Customer prices and proof
  files are never shown here." is no longer on the queue (DM-17); it stays true and the task page keeps its own rule line.
- Tabs Not taken · Mine · All with counts (Manager: Not taken · All) **plus Payment requests** (Purchase only; DM-19).
- Toolbar (shared `TN.ui.queueToolbar`): search "Deal, hotel, supplier or place" (words match title, detail, Deal,
  Deal title, destination, kind, supplier, who); chips Waiting for go-ahead · Price above budget · Not booked yet ·
  Confirmed · Invoice missing (first four shown, rest under More; a chip with nothing in it is hidden unless current);
  sort Soonest travel first (default) · Latest travel first · Deal reference. Address: `?show=&q=&chip=&sort=`.
- Rows (shared `TN.ui.table`, stacked cards on phones): What (type pill + name link, detail for non-hotels) ·
  Dates (range that never wraps; nights · rooms · travellers on the second line, so "Rooms and travellers" merged in) ·
  Approved budget (right-aligned) · Status (one badge + the second fact as plain text: go-ahead, above budget,
  invoice missing) · Next step (the task's own "Next:" words + one row button: **Take** for an untaken task,
  **Continue** for my task, **Review** for the Manager on a price above budget; none when someone else must act) ·
  Who · Deal. Columns use `px-3` so seven columns fit 1,280 px without sideways scroll.
- Empty and "Nothing matches" states with "Clear search and filter".

### Purchase task page `#/app/purchase/:taskId` (C4, D6, O5, O6, O7; DM-1 to DM-4)

- Shared record header: back link · "Hotel task · BX-…"; title · type pill · status · go-ahead badge · "Taken by";
  "Next:" in the same words as before with the **one** primary button; read-only line for viewers
  ("You can view this. Imran Qureshi (Purchase) can change it."); the "Internal task — …" line folded into Details.
- D6: the Purchase person holding the task lands on **Work**; anyone else lands on Details. Details now has its own
  address `?tab=details`; `?tab=work|files|history` and the bare address keep working.
- O6: the Next button jumps to and focuses the matching control on Work (Add a rate, Use as final rate, Send booking
  request, Record supplier confirmation, Approve this price above budget, Enter charges / Send charges to the Manager,
  Upload supplier invoice on Files). From another tab it opens Work with `&focus=<id>`, focuses the control once and
  drops `focus` from the address. "Take this task" is the header button for an untaken task.
- O5: "What Sales booked" on Work is one line (dates · nights · rooms · travellers · budget) plus the special-request
  warning; the full Book now entry is behind "Show what Sales booked". Details tab unchanged.
- O7: "Add a rate" folds once a final rate is chosen (opens again if its form shows a refusal); jump links
  Rates · Payments · Files under the tabs; paid, verified and re-sent payment requests are one line each with the
  full card behind the fold.
- Tabs use the shared C5 look. The progress stepper, rate tiles, drawers and the native confirm dialog are unchanged.

### Payment requests `#/app/purchase/payments` (DM-19)

- Same page header and tab strip as Purchase tasks with "Payment requests" current (sidebar shows Purchase tasks as
  current). Open · Returned · Paid · All are chips (`?show=` values kept). Search and sort Due soonest first.
- Rows: Request (ID · supplier link to the task, service · part) · Due by (requested date below) · Amount · Status
  (badge + paid / returned / funding fact) · Next step (what happens next; **Change and send again** on a returned
  request) · Deal. The ₹50,000 rule is said once in the header line.

### Suppliers register `#/app/purchase/suppliers` (DM-20)

- Header with **Add a supplier** (Purchase) opening the same form in a wide drawer (same fields, labels, refusal and
  "A supplier with this name already exists" check); the always-open form under the list is gone. No back link
  (Suppliers has its own menu link).
- Toolbar: search name, city, service, contact; chips Not verified · Bank details to approve · Archived; sort Name / City.
- Rows: Supplier · Services · City · Details (verified badge + "Bank details changed · payments on hold" as text) ·
  Status · Next step (Manager only: Approve bank details → supplier page focused on Bank details, or Verify).
- Supplier page itself unchanged except `?focus=` support (see section 2).

### Flight tasks `#/app/flight` and task page (C2, C4, D6, O9; DM-2, DM-9, DM-15)

- Queue: one header line, Not taken · Mine · All, toolbar (search Deal, route, airline or PNR; chips Ready to mark
  done · Cost returned · Ticket not recorded · Done; sort Soonest travel first), rows What (route link, segment count)
  · Dates (first to last segment, passengers) · Approved budget · Status (+ PNR or "Cost returned by Accounts") ·
  Next step (Take / Continue) · Who · Deal.
- Task page: shared record header ("Flight task · BX-…", status, Taken by, Next with Take this task / Record the fare /
  Finish this flight / Mark flight done as jumps), read-only line for the Manager or a colleague, internal line in
  Details. D6 as Purchase. "Take" (header or row) now opens the Work tab.
- O9: jump links Cost · Finish this flight · Invoice lines on Work; finished cost lines (accepted by Accounts, or paid
  through a checked payment request) fold to one line with the full card behind the fold.
- Fixed a display bug: amounts showed "₹75,400.00.00" because `TN.fmt.inr` now adds paise itself.

### Visa and passport tasks `#/app/visa` and task page (C2, C4, D6; DM-2, DM-15, DM-16)

- Queue is now the same table as the other desks (was a card list): What ("Visa · country · purpose" link, apply-by
  date below; no repeated facts line) · Dates (travel date, applicants) · Status (+ "2 of 4 issued") · Next step ·
  Who · Deal. Chips Waiting for a result · Documents pending · Cost returned · Completed. No "Tasks" sub-heading.
- Task page: shared record header (Next "finish the steps on the Work tab" jumps to the first open applicant),
  read-only line for the Manager, D6 landing on Work for the holder.

### Status words (C3)

Task status badges use `TN.ui.status` (shared tone table). Added once in 50-flight-visa.js:
`statusTone.add('In progress · ticket recorded, not marked done', 'info')` because the shared rules read "done" as
success. With the shared table "Cancelled" becomes danger (live Purchase showed neutral); left to the shared table.

### Home rows

Purchase/Manager Home rows now open filtered lists: go-ahead (`?show=all&chip=goahead`), above budget
(`?chip=budget`), invoices missing (`?show=all&chip=invoice`), bank details (`/suppliers?chip=bank`),
suppliers to verify (`/suppliers?chip=unverified`).

## 2. Approved optional items

| Item | Done | How |
|---|---|---|
| O5 | yes | One-line "What Sales booked" + fold (Work tab) |
| O6 | yes | Header Next button jumps to and focuses the control; `?focus=` from other tabs |
| O7 | yes | Add a rate folds after the final rate; jump links Rates · Payments · Files; finished payments one line |
| O9 | yes, adapted | The prototype's Flight Work tab has no five-step tracker; jump links Cost · Finish this flight · Invoice lines, and finished cost lines fold. The "Before you mark it done" checklist already jumped to each place. |
| O10 | not applicable | The prototype's Flight Work tab has no tick-the-flights / "Confirm tickets" step (that flow is in the unmerged html-crm PR 1). Adding it would be a new step, which the brief forbids. |
| O14 | not applicable | The prototype's Visa Work tab has no pencil or three-dot menu; each document has a select and its own Save. Nothing to relabel. |

O8, O11, O12, O13 not done (not approved).

## 3. Could not do, and why

- **Rate contracts tab on Suppliers** (design plan 2.3): the prototype has no rate contracts. Not built.
- **Supplier page "Bank details" tab** (DM-21): outside this batch's scope line; only `?focus=supplier-bank` was added
  so the Manager's row button lands on the Bank details card.
- **Jump conflict (for the lead):** `80-manager.js` line ~179 re-registers `TN.act('tn-jump')` reading `data-id`, which
  overrides Agent A's `tn-jump` (reads `data-target`). Every `TN.ui.jumpLinks` and `recordHeader` jump button then does
  nothing outside the Manager page. Desk pages route their jumps through their own `desk-jump` handler (same
  `data-target`), so they work either way; other pages need Agent E to rename its handler.
- **Shared table caption on phones:** in stacked mode the caption ("22 tasks") renders inside the first card, wrapped
  over two lines. That is `TN.ui.table` (Agent A); mentioned for the lead.
- At 200% zoom (640 px CSS width) the queue tables are not stacked (stacking starts below 640 px), so the table scrolls
  sideways inside its keyboard-focusable region; the page itself does not scroll sideways.

## 4. Checks run

- Roles purchase, flight, visa, manager, sales; every desk page; 1,280 px (no sideways scroll, table fits), 390 px
  (page width 390, stacked rows), 640 px (page fits, table scrolls in its region). No console errors.
- Flows: row Take → Work tab; add a rate → Next changes → jump focuses "Use as final rate"; final rate → "Add a rate"
  folds; Send booking request (drawer, Mark as sent) → Next jumps to Record supplier confirmation; Manager Details →
  "Approve or return the price" opens Work focused on the approve button; supplier drawer refusal keeps typed values,
  success opens the new supplier; flight row Take → Work, "Record the fare" focuses "Record a cost"; visa Next focuses
  the first open applicant; search, chips and sort keep each other in the address.
- Money fences: no new code reads selling price, margin, receipts or payment proof. Sales still gets only Details and
  History on a Purchase task; Flight, Visa, Suppliers and Payment requests stay closed to Sales.
- Keyboard: tab order header → tabs → search → chips → sort → table region → row links/buttons; focus ring visible
  (2 px brand outline). Folds are native `<details>`; jumps scroll without animation under reduced motion.
- Test state cleared afterwards (`localStorage` key `tripnavigate.purchase.v4` removed).

## 5. Open questions

1. Status word "Cancelled" now takes the shared danger tone (was neutral on the live Purchase screens). Keep shared?
   Recommended: keep shared (one word, one tone).
2. Visa task Next line still says "finish the steps on the Work tab" while on Work (unchanged wording). Recommended:
   leave until the Visa form batch.
