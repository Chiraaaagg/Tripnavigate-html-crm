# TripNavigate CRM Change Log

This file records the major committed changes and the current uncommitted work in the repository.

## 1 November 2026 — Purchase Work tab, round 2: rate tiles and the booking request on the final rate

Owner’s notes on the Work tab of s-547-h:

1. **Hotel summary card** has no buttons any more. “Ask for rates” is one secondary button at the top of Rate negotiation; “Send booking request” sits on the final-rate tile. Bug fixed: the booking e-mail could carry a different rate from the one shown; it now uses exactly the final tile’s amount (and its per-room-per-night price when given), and Mark as sent is refused if the final rate changed while the drawer was open.
2. **Rate negotiation form** is now just supplier, amount for the whole stay (or per room per night, which fills it), optional note and “Add rate”. The “What happened?” segmented control (We offered / Final agreed) is gone.
3. **“Log, newest first” removed** from the Work tab. Everything is in the History tab instead: each rate added (with amount, per-night price and note), final rate chosen or changed (with the old amount), every e-mail marked as sent (with View e-mail), Manager approvals or returns, and the confirmation. Amounts, notes and e-mails in History are shown only to roles that may see supplier prices; Sales sees History without prices.
4. **One compact tile per rate** (live bordered panel in a grid; one column on phones): supplier, amount, per room per night, note, who and when, under/over budget badge (icon and word), and “Use as final rate”. The chosen tile shows a “Final rate” badge and the primary “Send booking request”. Choosing a final rate creates the agreed cost version (append-only) and keeps the rules: above budget the tile shows the Manager’s approval (Manager: approve form; nobody approves their own price; returned price shown in red), the go-ahead and other blocks show as one short notice under the unavailable button, and a payment request already raised against the final rate stops a new choice. After the booking request is marked as sent, the tile’s next step is “Record supplier confirmation” (same dialog as before) with “Send booking request again”. The Supplier confirmation card now appears only after confirmation, to show the details. The summary line on top shows budget, lowest rate, final rate and under/over budget.

Seed data: Suryagarh shows three tiles (₹2,37,100 first quote, ₹2,31,500 revised after our call, ₹2,28,000 final); every other task shows its first quote and its final rate. No “we offered” entries remain anywhere. Saved browser state moved to key `tripnavigate.purchase.v4`, so older saved states are dropped.

Files: `build/src/40-purchase.js`, `build/tests/purchase-negotiation.test.js` (updated), rebuilt `full-crm-preview.html` with `node build/assemble.js`.

Checks: `node build/tests/purchase-negotiation.test.js` passes (10 groups, now also: no buttons on the summary card, 3 Suryagarh tiles with the last one final, the booking e-mail amount equals the final tile, confirmation only after the booking request, History keeps every event and hides prices from Sales). Browser: Purchase and Manager at 1280 px and 375 px on s-547-h, s-390-h, s-198-h1, s-455-h1, s-455-h2, s-547-a and s-301-p (Details, Work, History); no console errors, no sideways scroll, every class exists in the style sheets. This change is uncommitted.

## 1 November 2026 — Purchase task page: owner review of BX-38547 (Suryagarh)

Changes asked for by the owner:

1. **What Sales booked.** The Details card “Travellers and budget” is now **“What Sales booked for this hotel”**: stay, travellers, meal plan, inclusions, a line-by-line table (room type, rooms × cost per room per night, extra beds × rate, guests without a bed × rate, nights, line total) and the total budget. Without a breakup it shows what exists and “Sales did not give a room breakup” (the Singapore package). Breakups are invented data in a new file `build/src/39-purchase-breakups.js` (`TN.DATA.hotelBreakups`, `TN.hotelBreakup(id)`), and every total equals its budget: Suryagarh 2 nights × (8 Deluxe twin rooms × ₹13,000 + 1 suite × ₹14,000) = ₹2,36,000; Rove Downtown family room + extra bed; Snow Valley and Span with an extra bed for the child; Taj Goa with a child without a bed. Two budgets that were not whole rupees per night were set to their breakup totals (s-198-h1 ₹45,300, s-198-h2 ₹57,900).
2. **Hand-offs card removed** from Details. The separate Stay and Notes from Sales cards were folded into the new card, so nothing is shown twice.
3. **“Before you book” checklist removed** from Work. The rules stay: each blocked button (Ask for rates, Send booking request, Record supplier confirmation, Request payment) is shown as unavailable with one short notice saying why, only when it applies (task not taken, no Accounts go-ahead, price above budget waiting for the Manager, Manager returned the price, no agreed price, supplier bank details on hold).
4. **Work tab summary card** now shows the same full breakup, and the special request is a warning notice with icon and the words “Special request”.
5. **E-mail drawer simplified**: the drafted e-mail (supplier, To, Subject, Message), Copy draft, Open in e-mail app (mailto with subject and body) and Mark as sent, which records the e-mail in the negotiation log and the History with time and person. The manual sent-email block (date sent, mailbox reference, Message-ID, checkbox), CC, remark, attachment and Direct Hotel / Supplier choice are gone. Subjects carry the Deal ID: “Rate request · BX-38547 · Suryagarh Jaisalmer · 6–8 Nov 2026”, “Booking request · BX-38547 · …”. Rate requests list rooms and beds but never Sales’ rates; no e-mail contains the selling price.
6. **“Rates & Booking Records” replaced by “Rate negotiation”**: a summary line (budget, latest hotel price, our last offer, agreed price, under/over budget badge with icon and word), one form (supplier, live segmented control Hotel quoted / We offered / Final agreed, amount for the whole stay or per room per night that fills the total, short note, “Add to log”) and a newest-first log (live timeline) that also lists e-mails marked as sent, Manager approvals or returns and the confirmation. “Final agreed” adds a new cost version (append-only) used by the budget check, Manager approval, booking request, confirmation and payment request. Every entry is written to History (without amounts, because Sales can open History). The Manager approves a price above budget inside this card; nobody approves their own price (live refusal). Removed as duplicates: the per-supplier record cards, Edit rate / View History drawers, the “Supplier offers, cost and confirmation” head card, the Cost history card and its “Negotiate · select supplier and save agreed rate” form. **“Supplier confirmation”** is the single next step after a final price: one dialog with the confirmation number, supplier reference, name, phone and the confirmation e-mail file; it locks the price.
   - Retired files (moved to `_to_delete/`): `41-purchase-booking.js/.css`, `42-purchase-records.js/.css` and their tests `purchase-booking.test.js`, `purchase-records.test.js`. Saved browser state moved to key `tripnavigate.purchase.v3`, so older saved states are dropped.

Extra fixes found walking the Purchase journey (Purchase and Manager, 1280 px and 375 px):

- Queue: the Status column wrapped one letter per line even at 1280 px. The type pill now sits above the service name (7 columns instead of 8), the status badges keep a minimum width and Deal IDs do not break.
- Seed data: Suryagarh’s agreed price and “we offered” rows were hidden while its cost history still used them; the seed is now one consistent story (quoted ₹2,37,100 → offered ₹2,18,900 → agreed ₹2,28,000, ₹8,000 under budget). Cost versions now come only from a final agreed price (no more “proposed cost” equal to the first quote, which was above budget). Seeded tasks show the rate request (and booking request when confirmed) that Purchase marked as sent.
- Sales opening a Purchase task now sees Details and History only (money fence: the Work and Files tabs showed supplier prices and files).
- Services switcher on the Work tab uses the live link tabs (it had non-live colours) and short labels that fit at 375 px.
- Supplier lists in the form and e-mail show suppliers in the task’s city plus any already used, not every hotel in India; the city is not repeated when it is already in the name.
- Unavailable buttons use the live `aria-disabled` pattern, stay focusable, and a click repeats the reason; payment drawer refusals from the Payment requests list show as a toast instead of text inside the button.
- Progress stepper “blocked” icon was missing (unknown icon name); fixed.
- “Next:” line now says “send the booking request, then record the supplier’s confirmation” until a booking request is marked as sent.
- Payment requests list: the status badge no longer wraps beside long rows.
- Dubai special request said the children are 9 and 12; their dates of birth make them 8 and 12. Fixed.
- Removed dead code: the unused “Approved Purchase Budget” and “Modify budget” dialogs and the old rate drawer.

Files: `build/src/39-purchase-breakups.js` (new), `build/src/40-purchase.js`, `build/src/40-purchase.css` (unused rate/summary/checklist styles removed), `build/tests/purchase-negotiation.test.js` (rewritten), rebuilt `full-crm-preview.html` with `node build/assemble.js`.

Checks: `node build/tests/purchase-negotiation.test.js` passes (10 groups: breakups equal budgets, Details and Work content, e-mail subjects and money fence, Mark as sent, append-only log, Manager approval and own-approval refusal, go-ahead gate, confirmation lock, no selling price on any tab for Purchase or Manager, reload keeps the log). Browser: Purchase and Manager at 1280 px and 375 px on the queue, s-547-h, s-390-h, s-198-h1, s-301-p, s-547-a, s-547-t, s-520-h, suppliers and payment requests; no console errors, no sideways scroll, focus ring visible, every class on the page exists in the style sheets.

Not done / for the owner: Book now’s returned-booking prefill for BX-38520 (Trident) still shows ₹9,800 a night while the budget is ₹39,200 (₹19,600 a night); that is in `30-booknow.js`, outside Purchase. The lead’s `budgetBreakups` list in `00-data-base.js` is no longer used. This change is uncommitted.

## 30 October 2026 — Connected workflow stepper

- Replaced bullet layout with connected circles and centered labels below each circle. Completed steps use white checks; current, pending and blocked states have distinct styling and text. Blocked reasons reuse existing cost, go-ahead and bank-hold helpers; no Purchase action/business-rule changes.
- Existing completion calculations retained. Syntax checked and preview rebuilt; browser appearance not verified. Uncommitted.

## 30 October 2026 — Completed step checkmarks

- Added white checkmark icons inside green circles for completed Purchase progress steps; other steps retain bullet markers (`build/src/40-purchase.js`). Syntax checked and preview rebuilt. Uncommitted; browser appearance not verified.

## 30 October 2026 — Bullet-style Purchase progress

- Replaced numbered step cards with a vertical bullet list and inline Completed / Current step / Upcoming statuses (`build/src/40-purchase.js`).
- Syntax checked and preview rebuilt; browser appearance not verified. Uncommitted.

## 30 October 2026 — Purchase progress and hotel summary UI

- Refined the five-step Purchase progress UI with current/completed/upcoming labels and responsive layout. Rates require an actual quote; Payment requires paid amounts covering the agreed cost.
- Improved hotel summary wrapping and mobile detail rows. Booking action shows Send again only after an outgoing booking request and respects work, confirmation, cost and go-ahead restrictions.
- Files: `build/src/40-purchase.js`, rebuilt `full-crm-preview.html`. Syntax checked; browser appearance not verified. Uncommitted.

## 30 October 2026 — Remove Negotiate rate button

- Removed the Negotiate rate button from the Purchase Work tab e-mail card; Ask for rates and Send booking request remain (`build/src/40-purchase.js`).
- Preview rebuilt and syntax checked. This change is uncommitted.

## 30 October 2026 — Restore original supplier e-mail card

- Restored the simple newest-first e-mail list and standard action buttons instead of the table and summary UI. Retained rate negotiation and the existing Direct Hotel / Supplier / DMC form options (`build/src/40-purchase.js`).
- Syntax check passed and preview rebuilt; browser appearance not verified. This change is uncommitted.

## 30 October 2026 — Fix Work tab rendering

- Removed a reference to the undefined `booking` variable in the Purchase Work tab return markup, which prevented the tab from rendering (`build/src/40-purchase.js`).
- JavaScript syntax check passed and `full-crm-preview.html` was rebuilt. Browser interaction was not verified; Playwright is not installed. This change is uncommitted.

## 30 October 2026 — Inclusions in Travellers and budget

- Added the Sales inclusions (or “Not specified”) to the Travellers and budget card on Purchase task Details (`build/src/40-purchase.js`); rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Cost history placement

- Moved Cost history immediately above Hand the task back in the Purchase Work tab (`build/src/40-purchase.js`); rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Booking request recipient options

- Added Direct Hotel and Supplier / DMC recipient options to the Send booking request form for hotel/package tasks; existing cost and go-ahead checks remain (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Hotel and supplier recipient options

- Added mutually exclusive Direct Hotel and Supplier / DMC options to rate-request and negotiation forms for hotel/package tasks. Direct Hotel uses a manually entered e-mail; Supplier / DMC shows the supplier selector (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Hotel in supplier e-mails

- Added an editable Hotel field to Ask for rates and Negotiate rate for hotel and package tasks; changing it updates the generated subject and message (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Move Cost history

- Moved the Cost history card to the end of the Purchase task Work tab (`build/src/40-purchase.js`) and rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Remove Purchase summary card

- Removed the Purchase summary card from the Purchase task Work tab (`build/src/40-purchase.js`) and rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Remove Purchase workflow card

- Removed the Purchase workflow card from the Purchase task Work tab (`build/src/40-purchase.js`); the underlying actions remain unchanged.
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Supplier e-mail layout

- Restored the earlier list-style **E-mails to the supplier** card in the Purchase Work tab, retaining reply details and rate-negotiation access (`build/src/40-purchase.js`). The booking request remains in its separate go-ahead card.
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Notes from Sales heading

- Highlighted the **Notes from Sales** heading on the Purchase task Details tab using the existing brand colors (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Current working changes

These changes are present in the working tree and have not been committed yet.

### Purchase data and budget

- Added approved, item-wise Purchase budget breakups for selected hotel services in `build/src/00-data-base.js`.
- Added an `Approved Purchase Budget` action and drawer/modal view for viewing budget line items, quantities, rates, totals, and the approved budget in `build/src/40-purchase.js`.
- Added support for showing Purchase budget information in the Purchase task and queue views.

### Purchase task details and traveller information

- Expanded the Purchase task traveller section to **Traveller details and ID proofs**.
- Added client information, traveller count, missing-ID-proof count, traveller names, adult/child labels, dates of birth, age at travel, and ID-proof status.
- Added traveller ID-proof details to the Purchase Files view.
- Added shared traveller helpers and invented traveller data in `build/src/00-data-base.js`.
- Reordered the Purchase Details tab so **Notes from Sales** appears before stay/service facts and traveller information.

### Purchase supplier work

- Added the supplier e-mail area for rate requests and booking requests.
- Added supplier offer, cost, confirmation, and payment-request flows to the Purchase Work tab.
- Added Purchase file upload and removal controls for supplier quotes, confirmations, and other files.
- Added supplier confirmation handling and the related task locking behavior.
- Added supplier payment-request support, including payment parts, due dates, proformas, approval routing, bank-detail holds, and company-funding prompts.
- Added supplier bank-detail revision and approval states, with payment holds and notices.
- Added task hand-back and Manager reassignment controls.
- Added cancellation-charge and supplier-cost handling for Purchase work.

### Sales and notifications

- Added the **Ask Purchase for an update** action for eligible Sales and Manager users.
- Added the corresponding Purchase notice and update-request display on service rows.
- Updated shell navigation and notification counts for the newer Purchase and notice flows.

### Preview and local server

- Updated `full-crm-preview.html` with the latest source changes.
- Added `build/assemble.js` to assemble CSS and JavaScript source files into the full preview.
- Added `server.js` to serve the preview locally at `http://localhost:3000/`.

## 27 October 2026 — Committed preview baseline

Commit: `58b39ca Add full CRM HTML preview (all roles, live and pending screens)`

- Added the full TripNavigate CRM HTML preview.
- Added role-based screens for Sales, Purchase, Flight, Visa and passport, Accounts, Accounts checker, Branch Manager, and Super Admin.
- Added the source-based preview structure under `build/src/`.
- Added shared live styling, fonts, build notes, area notes, and the initial `CHANGES.md` documentation.
- Added the main preview file `full-crm-preview.html`.
- Added live and pending screen documentation, role permissions, money-fence rules, build notes, open questions, and preview verification notes.

## 27 October 2026 — Purchase UI update

Commit: `61b02b6 Update TripNavigate CRM Purchase UI`

- Expanded the Purchase task UI with supplier work, supplier offers, costs, files, confirmations, and related task history.
- Added Purchase, Flight, and Visa data and workflow updates used by the preview.
- Added additional Sales and booking-preview behavior.
- Updated the full preview with the Purchase UI changes.
- Added supporting Purchase styles in `_to_delete/40-purchase.css`.

## Source of truth

- Source code: `build/src/`
- Generated preview: `full-crm-preview.html`
- Build script: `build/assemble.js`
- Local preview server: `server.js`
- Detailed product and build notes: `CHANGES.md` and `build/notes/`

## Updating this file

Whenever code changes are made, add a dated section near the top. Record:

1. What changed.
2. Which source files were affected.
3. Whether the change is committed or still uncommitted.
4. Any build, test, or preview verification that was performed.
