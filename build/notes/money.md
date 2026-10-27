# Accounts money (Agent G): pages, rules and build notes

Files: `build/src/70-money.js`, `build/src/70-money.css` (two tiny rules: wider document dialog, print-only root).
Everything on these pages is **pending (to build)**. Nothing here is live today. The look copies the live Accounts screens:
the Reported payments tabs, the Department costs review cards (article + summary list + primary Accept + "Return…" toggle
with an inline reason form), the To check queue table (`.fin-queue` / `.stack-table`, status pills with glyphs), the live
"You recorded this … Another Accounts person must do this step." refusal (`.fin-unavailable` / `.fin-blocked`), the live
ProgressChecklist, the live customer document (`.tn-doc`, as the quotation preview), live Drawer / Dialog / Toast via `TN.drawer` / `TN.dialog` / `TN.toast`.

## Pages (all pending)

| Route | Roles | What it does |
|---|---|---|
| `#/app/accounts/dues` | accounts, checker; manager read-only | Every open instalment (from `TN.DATA.instalments`) with ageing pill (due in N days / due today / N days overdue / over 30 days / on hold for cancellation), still due (only verified money counts), follow-up owner = the Deal's Sales owner, "Remind" (staff notice to Sales; no customer message), "Record receipt" link to the Accounts Deal page Receipts tab. Stats: overdue now, due in 7 days, verified in October. "Branch Manager told" once 3 days overdue. Tabs: Overdue, Due in 7 days, All open, Paid, Trip closure. |
| `#/app/accounts/dues` → "Split a customer transfer" (drawer) | accounts, checker | One verified transfer split across instalments of one or several bookings; total cannot exceed the transfer; remainder stays as unallocated money. A **different** Accounts person approves the split (own split refused); only then do dues change. Two invented transfers: RC-26-0116 (Suresh Bhandari ₹2,28,000) and RC-26-0117 (Marudhar Agro ₹1,00,000). |
| `#/app/accounts/dues?tab=closure` | accounts, checker; manager read-only | Travelled trips (BX-38264) with the closure checklist: all receipts verified, nothing still due, every supplier payment verified, every supplier invoice in and checked, no open refund/recovery. Each item links to where to fix it. "Close trip" (dialog) only when 5 of 5 done; sets `deal.tripStatus = 'closed'`, `closedBy`, `closedAt`, notice to Sales and Manager. |
| `#/app/accounts/supplier-payments` | accounts, checker; manager read-only (defaults to Waiting for Manager, links to `#/app/approvals`) | Tabs To approve / Waiting for Manager / To pay / To verify / Verified / Returned / On hold / All. Approve (Accounts only when the total requested to that supplier on that Deal is at or below ₹50,000, else "Waiting for the branch Manager"), Return to the department with reason, Record payment (drawer: paid from, amount must equal the approved amount, date, bank reference unique, proof file; no automatic payouts), Verify by a different Accounts person (own refused with the live wording), "Not in the bank statement" sends it back to To pay. Supplier with changed bank details → On hold. |
| `#/app/accounts/supplier-invoices` | accounts, checker | Originals and credit notes uploaded by Purchase. Check against Purchase cost and payments (pills: matches / above / below / not paid yet); credit note checked against the supplier recovery. Accept, or Return to Purchase with reason. "Missing after the trip" tab: trips ended without an original → Remind Purchase, or "Upload one sent to Accounts" (drawer); the uploader can never accept their own upload. |
| `#/app/accounts/documents` | accounts, checker | Invoice, Advance Invoice, hotel voucher. Tabs To approve / Approved, not sent / Drafts / Sent / All. Create document (drawer: Deal, type, verified receipt for an Advance Invoice, confirmed stay for a voucher; next number shown). Approve (never your own), Return with reason, Send for approval (drafts), Preview, then Download PDF / Print / Mark as sent (drawer: how, to whom, date). Customer messages are postponed: staff send it themselves. |
| `TN.openDocument(id)` | any role that can see the selling price (voucher: anyone) | Dialog with the A4 customer document in the live `.tn-doc` style: TripNavigate brand header, number, date, booking; Bill To (business: GSTIN, contact); trip; per-service lines (Flight lines: route, passengers, PNR; Visa lines: travellers × fee); total in figures and words; payments received; balance due; "Not a tax invoice. The tax invoice is issued from Tally."; legal footer. Voucher: hotel, confirmation number, lead guest, guests, check-in/out, rooms, meal plan, no prices. Print (print root, live `.tn-print-root` rules) and Download PDF (a real A4 PDF built in the browser) once approved. |
| `#/app/accounts/funding` | accounts, checker; manager read-only | Company-funded bookings. Accounts approves at or below ₹50,000 (F-26-008, ₹18,000), above → Waiting for the branch Manager (F-26-007). Refuse with reason. Shows the customer money expected and "Recover from". Approved → "Mark recovered" only once a verified receipt (or a checked transfer split) exists on that Deal after the funding. Hotel go-ahead shown separately and given separately by Accounts. |
| `#/app/accounts/refunds` | accounts, checker; manager read-only | "Cancellations being settled" (BX-38198: customer paid ₹60,000, supplier charges ₹82,800, our charge ₹2,500 → customer still owes ₹25,300; waits for the Manager). After Manager approval: "Add to customer dues" or "Ask the Manager to write it off" (reason). Refunds/recoveries: Record refund paid / money received (drawer), verify by a different person. RF-26-005 (₹4,200 to Nidhi Mathur, Manager-approved) is ready to pay. |
| `#/app/accounts/tally` | accounts, checker | Month picker (October / September 2026). Preview of vouchers with Tally voucher type, date, number, debit/credit ledger, amount, narration; totals per type. Warning list of items left out because not yet verified/accepted (cheque not cleared, receipt not verified, split not checked, bill not checked, payment/refund not verified). "Download Excel" writes `tally-pack-jodhpur-YYYY-MM.csv` (UTF-8 with BOM, formula-escaped cells, opens in Excel). "Mark as exported" records who and when (export history), and exported rows are never exported again. |

Home rows (`TN.homeRow`, accounts + checker, "What needs you"): instalments overdue; transfers to split or check;
supplier payments to approve / to pay / to verify (verify counts only other people's); supplier invoices to check (others' uploads);
documents to approve (others'); funding to approve (≤ ₹50,000); refunds and recoveries to record or verify; travelled trips ready to close;
travelled trips with open closure items.

## Data added at load (own file only)

- `TN.DATA.supplierPayments`: SP-26-0011/12/13 (BX-38264, verified in early October; needed for the closure checklist and the Tally pack). Missing `fromAccount`/`proof` filled on paid/verified rows. Supplier with `bank: 'changed'` forces `on_hold`.
- `TN.DATA.supplierInvoices`: SI-0016 (Doon Valley Travels, accepted). Aloha on the Ganges stays missing on purpose (matches notice n6).
- `TN.DATA.documents[].createdBy` (Invoice 0043 by Sales, voucher by Purchase).
- `TN.DATA.funding`: F-26-008. `TN.DATA.refunds`: RF-26-005; RF-26-003 gets paid date/account/proof.
- `TN.DATA.money = { transfers, exports, exported }`. `TN.money = { checklist, counted, nextNumber, docHtml }` for other areas.
- Company identity on documents: Holiday Chacha Pvt Ltd, regd. office 59A, Babu Rajendra Marg, Masuria Colony, Baldev Nagar, Jodhpur 342003, PAN AAFCH9191M, GSTIN 08AAFCH9191M1ZV, the same line the live quotation footer prints (from the live company identity fixtures). Uses `TN.COMPANY` if another area defines it.

## Rules the build must keep

- Money fences: these pages are Accounts only (manager read-only on dues, supplier payments, funding, refunds). Purchase, Flight, Visa get "Page not available". `TN.openDocument` refuses an Invoice/Advance Invoice to anyone without `seeSellingPrice`.
- Two-person rule everywhere: recorder ≠ verifier for supplier payments, refunds, recoveries; proposer ≠ checker for transfer splits; maker/submitter ≠ approver for documents; uploader ≠ checker for supplier originals.
- ₹50,000 routing counts all non-returned requests to the same supplier on the same Deal (DEC-24); exactly ₹50,000 stays with Accounts.
- No automatic payouts: payment, refund and recovery are recorded after the money moved, with bank reference and proof; amount must equal the approved amount (a part payment is its own request).
- Numbering: `HC/JDH/26-27/0001` (Invoice), `HC/JDH/ADV/26-27/0001` (Advance Invoice): per branch and financial year, next = highest existing + 1, given at creation. Voucher `VCH-<deal digits>-NN`.
- An Advance Invoice is made only against a verified receipt. A voucher only for a stay with a confirmation number; it never shows prices.
- Invoice lines: the CRM shares the selling price across services in proportion to Sales' cost estimates (rounded to ₹100, last line takes the rest). Build must use the stored per-service charge instead (see question 4).
- Tally pack: only verified receipts, accepted supplier bills/credit notes, verified supplier payments and verified refunds/recoveries; unverified items listed, never included; repeat export impossible; CSV cells starting with = + - @ are escaped.
- Closure: Travelled → Closed only by Accounts with all 5 checks done. Closing posts nothing.

## Open questions (built with the recommended answer)

1. **Who uploads a supplier original that the supplier e-mails straight to Accounts?** Recommended: Accounts may upload it ("Upload one sent to Accounts"), and a different Accounts person accepts it.
2. **Transfer split checker:** a different Accounts person approves every split; a split that touches another branch's booking also needs the branch Manager (not shown: all invented bookings are Jodhpur). Recommended as built.
3. **Cancellation where the customer owes money (BX-38198):** recommended: after the Manager approves, Accounts adds the shortfall as a new "Cancellation charges" instalment (follow-up by Sales) or asks the Manager for a write-off with a reason.
4. **Invoice lines per service:** the plan stores a price per service? Recommended: yes, Sales enters a customer price per service in Book now (package Deals: one "Land package" line), so the Invoice never apportions.
5. **Download PDF:** the prototype builds a simple PDF in the browser (Helvetica, "Rs" instead of ₹). Recommended: the build renders the same `.tn-doc` HTML to PDF on the server, as the live quotation PDF does.
6. **Tally ledger names** (HDFC Bank CA 4417, UPI Collections - HDFC, Cash - Jodhpur Branch, Tour Purchases - Domestic/International, Airfare Purchases, Visa Fees, party = customer/supplier name) are invented. Needs the real Tally ledger list and a sample import from Accounts; CSV vs Tally XML to be decided with them (recommended: CSV/Excel first, as built).
7. **Funding recovery:** recommended: recovered from the first verified customer money on that Deal after the funding date; Accounts marks it, no automatic offset.
8. **Supplier payment rejected after "paid" ("Not in the bank statement")**: recommended: it goes back to To pay with the note, keeping history.
