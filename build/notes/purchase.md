# Purchase: what the preview shows (Agent D, 27 Oct 2026)

File: `build/src/40-purchase.js` (no CSS file; only classes that exist in `live.css`).
Markup copied from the live captures `b4-purchase-queue*`, `b4-purchase-task-*`, `procurement-*`, `suppliers-list`, `supplier-detail*` and, for the new payment list, `b11-accounts-claims-list`.
The preview shows supplier confirmation switched **On**, with the Stage 3 Accounts go-ahead in place.

## Pages per role

| Route | Purchase (Imran Qureshi) | Branch Manager (Vikram Rathore) | Sales |
|---|---|---|---|
| `#/app/purchase` | Queue with tabs Not taken (default) / Mine / All | Queue with tabs Not taken / All (default), "You can follow progress here" | Not allowed |
| `#/app/purchase/:taskId` (task ids = service ids, e.g. `s-455-h1`) | Details, Work, Files, History tabs; works on own task; read-only on a colleague's task | Read-only tabs, approves a cost above budget, reassigns the task | Details only (no tabs), only for own Deals; link back to the Deal |
| `#/app/purchase/suppliers` | List + "Add a supplier" | List | Not allowed |
| `#/app/purchase/suppliers/:id` | Edit details, record new bank details | Facts, "Mark supplier verified", "Approve these bank details" | Not allowed |
| `#/app/purchase/payments` | Own payment requests (Open / Returned / Paid / All) | Not in nav (uses Approvals) | Not allowed |

Flight, Visa, Accounts and Admin get the live "not allowed" page on all Purchase routes.

## Live today (copied as live)

- Queue: columns Service, Service details, Stay, Rooms and travellers, Approved budget, Status, Taken by, Deal. Status words: "Waiting to be taken", "In progress · not booked yet", "Confirmed by supplier". Pill label "Transfer or cab" as live.
- Task page header, "Next:" line, lock line, link tabs; "Take this task" (header primary action); "Hand the task back"; Manager "Reassign task".
- Work tab: supplier offers (open / withdrawn / chosen), "Add a supplier offer", cost history timeline with versions, "Propose a new cost", Manager "Approve this cost above budget" (version-bound; nobody approves their own entry), Purchase files upload/remove, "Before you can record the supplier’s confirmation" list, the native `dialog.confirm-dialog` "Record supplier confirmation" (reference required; refusal keeps the typed reference). Confirmed = locked: offers, costs and files can no longer change.
- Details tab: Stay, Travellers and budget, Notes from Sales, Where this came from, Hand-offs timeline, Traveller ID proofs. Files and History tabs as live.
- Suppliers list and detail, verify supplier, bank detail revisions and Manager approval.
- Inline messages use the live `.message success` / `.message error` ("Done: …" / "Error: …") wording from `modules/procurement/contracts.ts` and `server/actions.ts`.

## Pending (to build), shown in the same design language

1. **Accounts go-ahead gate (Stage 3).** Hotel tasks with `services[].goAhead = 'waiting'` can be taken and prepared (offers, costs, files, rate e-mails), but:
   - header and queue show the badge "Waiting for Accounts go-ahead";
   - the Work tab shows a warning notice and the blocker "Waiting for Accounts go-ahead. Accounts approves every hotel commitment.";
   - "Record supplier confirmation" is refused with exactly that message (named first, other blockers listed under it);
   - "Send booking request" and "Request supplier payment" are refused too (both are commitments);
   - when Agent F's Accounts screen sets `goAhead = 'given'`, confirmation works. `'refused'` shows "Go-ahead refused".
   - Hand-offs timeline gains the step "Accounts gives the go-ahead".
2. **E-mails to the supplier** (Work tab card + drawer). "Ask for rates" and "Send booking request". To = supplier e-mail from the register (changes with the Supplier select); subject and body from a template with stay facts, rooms, meal plan, guests, special requests, our Deal reference; booking request adds the agreed supplier cost, lead guest and asks for the confirmation number and proforma. Never the selling price. Sender line: "Sent from purchase.jodhpur@holidaychacha.in (verified sender domain)". Sent e-mails are listed on the card and logged in History. Staff-to-supplier only.
3. **Supplier payment request** (Work tab "Supplier payments" card + drawer). Amount, Part (Deposit / Balance / Full payment), Due by, supplier proforma file (required), note. Live routing notice: "Accounts approves" when the total for this supplier on this Deal (all non-returned requests plus this one) is ≤ ₹50,000, else "Branch Manager approves", with the running total. Writes `TN.DATA.supplierPayments` (`requested` or `waiting_manager`) and a notice to Accounts or the Manager. Blocked while the supplier's bank details are not approved (`sp-span` changed, `sp-marwarcoach` waiting): "On hold until the Manager approves the new bank details".
4. **Company funding from the payment drawer.** When an internal check says customer money for the Deal is short (verified receipts minus non-funded supplier requests), the drawer shows "Customer money has not arrived yet" (no amounts), a checked "Ask for company funding for this payment" and a required reason. Writes `TN.DATA.funding` (≤ ₹50,000 `requested` for Accounts, above `waiting_manager`) linked from the payment (`p.funding`). Example: BX-38547 Suryagarh balance creates a new F-26-xxx next to F-26-007.
5. **Payment requests page** `#/app/purchase/payments`, styled like the live Accounts "Reported payments" list. Statuses: Requested, Waiting for Manager, Approved, Paid, Verified, Returned, On hold, each with a one-line explanation; paid rows show date, payer, bank reference and checker. Returned rows show the reason and "Change and send again" (opens the drawer prefilled; the old row shows "Sent again as …").
6. **Supplier invoice / credit note** (Files tab section + drawer): kind, number, date, total, GST included, file. Rows show Accounts' review status from `TN.DATA.supplierInvoices` (Uploaded · Accounts to check / Accepted by Accounts / Returned by Accounts + reason). Warning "Original invoice missing" when the trip has ended, the task is confirmed and no non-returned Invoice exists (e.g. `s-264-h1` Aloha). Notice to Accounts on upload.
7. **Cancellation charges** (BX-38198, `c-198`): a "Trip cancelled: supplier charges" card on each of its Purchase tasks with committed cost, supplier keeps, supplier refunds, note, who entered it, credit note status; "Change charges" (drawer), "Upload credit note", "Send charges to the Manager" (refused until every Purchase service of the Deal has a charge). Changing a charge after sending sets `c-198.status = 'charges_entered'` until sent again. Purchase never sees the customer side (`customerPaid`, `refundToCustomer`, `ourCharge`, `recoveryFromCustomer`).
8. **Bank detail change puts payments on hold.** Recording new bank details marks the supplier `changed`/`waiting`, moves its open requests to `on_hold` and notifies the Manager and Accounts; the Manager's approval releases them (back to their previous status) and notifies Purchase and Accounts.
9. **Home rows** (`TN.homeRow`): Purchase tasks not taken; Hotel tasks waiting for Accounts go-ahead; Costs above budget waiting for the Manager (Purchase) / waiting for your approval (Manager); Supplier invoices missing after the trip; Payment requests returned to you (Purchase); Supplier bank details to approve and Suppliers to verify (Manager).

## Build notes: data and rules

- Data added at load (never edits 00): second Purchase person `TN.PEOPLE.purchase2` (Arjun Parihar); six suppliers (`sp-blanket`, `sp-spicevillage`, `sp-lakeslagoons`, `sp-malabarcabs`, `sp-trident`, `sp-tharcamps`); contact, phone, e-mail, terms, services and bank revisions on every non-airline supplier; `s-455-h1` taken by Imran and `s-455-h2` taken by Arjun (cost ₹38,400 above budget ₹36,000, waiting for the Manager); returned request `SP-26-0021` (Dubai hotel balance, returned by the Manager); `supplierRefund`, `enteredBy/At`, `sentToManagerAt/By` on `c-198`.
- Per-task work records (offers, cost versions, files, e-mails, history, over-budget approvals) live in the file's private `W` map; `TN.purchase.work(id)` exposes them read-only for other agents.
- Money fence: no Purchase screen, drawer, e-mail template or notice reads `sellingPrice`, margin, receipts, dues or payment proof. Customer money is used only inside `customerMoneyShort()` as a yes/no; the amount is never shown. Funding reasons are not displayed on Purchase screens (see question 4).
- Money is shown with paise (₹42,000.00) exactly like the live Purchase screens; `TN.fmt.inr` alone drops the `.00`.
- Supplier payment routing counts every non-returned request for the same supplier on the same Deal (brief §5.2). Requests above the total of ₹50,000 go to the Manager even when this part is small.
- Payment requests on a hotel need the go-ahead; a booking e-mail also needs it. Rate requests do not.
- Confirmation stays as live: one-way, locks the task, copies the latest proposed cost into a committed version.

## Open questions (recommended answer first)

1. Who presses the go-ahead? The Stage 3 contract has Purchase press "Give go-ahead" after Accounts approves the booking; the brief has Accounts give it per hotel. **Recommend: Accounts gives it per hotel (as built), because the owner's rule is "Accounts approves every hotel commitment"; Purchase only sees the result.**
2. Can Purchase send a payment request before the supplier confirmation is recorded (hotel deposits to hold rooms)? **Recommend: yes, once the go-ahead is given and a cost is proposed.**
3. Should a payment request need the supplier's proforma every time? **Recommend: yes (built as required); Accounts pays against a document.**
4. Funding reasons typed by Purchase may mention customer dues (F-26-007 and Agent G's F-26-008 both name the customer advance). **Recommend: Purchase screens never show funding reasons (as built), and the reason stays about the supplier (deadline, hold). Lead: please reword F-26-007/F-26-008 reasons without the customer advance amount.**
5. F-26-008 (Agent G) funds Marwar Coach, whose bank details are not approved. **Recommend: funding may be approved, but the payment stays on hold until the Manager approves the bank details.**
6. The live queue's Status column wraps word by word at 1280 px (same in the live gallery). **Recommend: keep as live in the preview; fix later by giving the Status column a minimum width.**
7. Home shows both Agent A's "Purchase tasks not taken yet, or yours in progress" and this file's "Purchase tasks not taken". **Recommend: lead keeps one (the live one) and drops the Purchase duplicate.**
8. Package services (`s-301-p`) have no live service type; shown as a "Package" pill with the map icon and treated like a hotel for the go-ahead. **Recommend: keep a Package type for land packages from destination companies.**
