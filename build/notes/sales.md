# Sales records: Leads, Deals, Deal page (Agent B, 27 Oct 2026)

File: `build/src/20-sales.js` (no CSS file; every class is from live.css, checked token by token).
Markup copied from the live captures: `p6-leads-*`, `p6-lead-*`, `deals-*`, `ws-deal-*`, `deal-page-*`, `b11-submitted-claim-*`, `intake-created`, `b12-itin-card`. Icons are the exact lucide SVGs from the captures.

## 1. Pages per role

| Page | Sales | Manager | Purchase | Flight | Visa | Accounts / checker | Super Admin |
|---|---|---|---|---|---|---|---|
| `#/app/leads` | own leads | all branch leads | no | no | no | no | all (Bitrix connection) |
| `#/app/leads/:id` (Overview · Quotations · Bitrix details) | own; "New quotation" | all; "New quotation" | no | no | no | no | read-only, no Quotations tab |
| `#/app/deals` | own Deals | all branch Deals | Deals with their tasks | Deals with their tasks | Deals with their tasks | live empty state "Your Deal work is in Accounts" + "Open To check" | live empty state |
| `#/app/deals/:id` tabs | all 6 | all 6 | Overview, Services and tasks, Documents, History | same | same | Overview, Services and tasks, Documents, Money, History | "Deal not available" |

Money fences: Purchase, Flight and Visa never get the Money tab, the Lead link, quotations, invoices, receipts or payment reports. A sweep of every role × every Deal × every tab found no selling price, receipt or payment report text for those roles. They do see supplier charges on a cancellation (supplier cost).

## 2. Live today vs pending

**Live today (copied as live):**
- Leads list (All / Mine chips, Details per row, waiting-for-owner badge, empty filter state), Lead page with Overview, Quotations (list + "Create quotation"), Bitrix details.
- Deals list (All / Owned by you / Assigned to you chips, order switch, Details per row, empty states for Accounts, Super Admin and filters).
- Deal page header: reference, title, booking status word (icon + word), Stage, Owner, From lead, live indicator, ONE primary action and the Next line per state: Start booking, Start booking from quotation, Continue booking, View booking, Fix and send again (with the "Returned by Accounts" notice and reason), See team tasks (Being arranged), View booking (All confirmed). Department roles see their own task word and "See team tasks".
- Overview (Trip, Travellers (hidden for Purchase and Flight), Branch, Team, Created, Details and Bitrix facts).
- Services and tasks: "Services sold" card with type pill, status pill, Department, Owner, Next step + task link, progress pill, "Open the booking"; "No services yet. Use …" line and the empty state.
- Quotations: quotations card + "Create quotation", Branded itineraries card + "Make branded itinerary".
- Documents: the live documents list (ID proofs, Bill To proof, itinerary PDF, supplier confirmations, tickets).
- Money: Booking (final selling total, payment plan), Payments the customer told you about (summary + reported payments with the live claim status words), Selling total by booking version.
- History: booking versions and Accounts reviews, quotations, reported payments (no amounts).
- "Report a payment" uses the live claim form fields and refusals (6 to 40 character reference rule, duplicate reference refusal with the live wording, typed input kept).

**Pending (to build), same parts only:**
- Header: "Trip booked / Travelled / Trip closed" badge; a "Cancellation requested" notice with a link to it.
- Overview: Trip status steps (Booked → Travelled → Closed) and the read-only closure checklist (receipts verified, supplier payments verified, supplier invoices in, no open refund). Accounts gets "Close trip", enabled only after travel and when all four are done.
- Services and tasks: "Accounts go-ahead" line on every Purchase service (Waiting for Accounts go-ahead / Go-ahead given / Not needed) and a note when hotels wait for it; "Changes after booking" card: change rows (Waiting for the customer → Customer accepted → done / Withdrawn), the cancellation with supplier charges, customer paid, our charge, refund or what the customer still owes, and who acts next; "Request a change" and "Cancel booking" (Sales owner or Manager, after Accounts approval); Purchase "Enter supplier charges"; Manager "Open in Approvals"; Accounts "Open Refunds and recoveries". Shown: c-198 on BX-38198 (Manager view; Mohit Gehlot owns it) and ch-412-1 on BX-38412.
- Documents: "Invoices and vouchers" card (Invoice, Advance Invoice, hotel voucher with status: Draft / Waiting for Accounts / Approved by Accounts / Sent to the customer); "Download PDF" or "View" calls `TN.openDocument(id)` when defined (Agent G), else a toast; Sales "Ask Accounts for an invoice", "Ask Accounts to approve" (voucher), "Mark as sent". Only Accounts approves (link to `#/app/accounts/documents`). Not-a-tax-invoice note.
- Money: Customer dues table per instalment (Paid / Due in N days / Due today / Overdue · N days · part paid / Part paid, icon + word), Paid so far, Overdue now, Still due, follow-up owner line; receipts list (Sales sees verified ones only; Accounts sees all with reference and who recorded / verified).
- History: "Changes and cancellations" group.
- Home rows (Sales, Manager): "Customer payments overdue" (`#/app/deals?filter=overdue`), "Changes waiting for the customer" (`?filter=changes`). The Deals list shows the extra chip only while that filter is on. (The shell already has a live "Returned by Accounts" row, so mine was dropped; `?filter=returned` still works.)
- Notices pushed: payment reported (Accounts), invoice asked / voucher to approve (Accounts), change waiting / accepted (Sales, Manager / Purchase, Flight, Visa, Accounts), cancellation asked (Purchase, Manager), charges entered (Manager), trip closed (Sales, Manager).

## 3. Build notes (data and rules)

- Lead references show as `BXL-` + number (route id stays `L-…`). 12 converted Leads were added at load so each Deal has a "From lead" link; Bitrix status shows "Converted to deal".
- Visibility: Sales = Deals they own; Manager = branch; Purchase / Flight / Visa = Deals where a service is assigned to them (the services card shows only their department's rows); Accounts can open a Deal page (notices link there) but the Deals list stays the live empty state.
- Trip status is computed, not read from `deals[].tripStatus`: Booked only when the booking state is All services confirmed and every service is confirmed; Travelled from the day after `end`; Closed when Accounts closes it. So BX-38412, BX-38390, BX-38547 show "Not booked yet" although 00 says `booked` (they are still being arranged). The lead may want to align 00.
- Closure checklist: supplier payments counted for every service with a cost, except flights at or below ₹50,000 (Flight pays those directly); invoices required for Purchase services with a supplier; a refund counts as open until `verified`.
- Live Deal page money is shown with paise (`₹1,20,000.00`), as live `formatPaise`; other screens use `TN.fmt.inr`.
- Customer dues "Paid" follows `instalments[].paid`; "Checked by Accounts" follows verified receipts, so a cheque waiting for clearance shows in Paid so far but not in Checked (BX-38390).
- Invoice numbers: next `HC/JDH/26-27/NNNN` / `HC/JDH/ADV/26-27/NNNN`. Advance Invoice cannot exceed money checked by Accounts; Invoice cannot exceed the selling total; a second request of the same kind while one waits is refused.
- Cancellation flow: Sales request (services + reason) → Purchase enters what each supplier keeps → Manager approves (Agent H) → Accounts refunds or collects (Agent G) → second Accounts person verifies. Refund / recovery = customer paid (checked) − supplier charges − our charge.
- Change flow: Sales request → status "Waiting for the customer" → Sales records "Customer accepted" → departments told. Price change is recorded as a note (no new booking version is made in the preview).
- "Start booking" sets the Deal to Booking in progress and opens `#/app/deals/:id/book` (Agent C).
- Not built here: the DealBookNowCard on Services and tasks (no live capture of it); the Deals list search box.

## 4. Open questions (recommended answers)

1. Should Accounts see Deals in the Deals list? Live shows none. **Recommend: keep the live empty state; Accounts opens Deals from its own queues and notices (Deal page allowed read-only with the Money tab).**
2. Who may ask for a cancellation or change: only the Deal's Sales owner and the branch Manager, and only after Accounts approved the booking? **Recommend: yes.**
3. Which supplier charges does Purchase enter on a cancellation that includes flights? **Recommend: Purchase enters hotel, cab and activity charges; Flight enters airline charges on its own task (preview lets Purchase enter all for now).**
4. Does a change after booking create a new booking version and a new customer acceptance link? **Recommend: yes, a "customer will notice" version 2 with fresh acceptance, as the live History wording already says.**
5. Can Sales see the receipts list? **Recommend: verified receipts only, without bank reference or proof; Accounts sees everything.**
6. Trip status for Deals still being arranged: **Recommend: no trip badge until every service is confirmed (as built).**
