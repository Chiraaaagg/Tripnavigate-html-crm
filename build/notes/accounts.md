# Accounts (live screens) and the Accounts hotel go-ahead: Agent F

Files: `build/src/60-accounts.js`, `build/src/60-accounts.css` (one rule so `[hidden]` beats the live `.field`/`.note` display on parts shown in place).
Roles: `accounts` (Kavita Joshi) and `checker` (Sunil Mehta). Every page here is for these two roles only; anyone else gets the shell's not-allowed page, as live.
Sources: gallery captures `b4-accounts-*`, `b11-accounts-*`, `finance-*`, `b11-home-accounts-claims`, and the live code `views/finance-views.tsx`, `finance-forms.tsx`, `finance-common.tsx`, `views/b11/accounts-claims.tsx`, `accounts-review.tsx`, `department-cost.tsx`, `views/accounts/customer-check.tsx`, `modules/finance/contracts.ts`, `modules/fulfilment/contracts.ts`, Stage 3 owner summary and contract draft (9 Oct).

## Pages

| Route | What it shows | Status |
|---|---|---|
| `#/app/accounts` | To check: Find a deal by reference; tabs Booking reviews / Receipts to verify / **Hotel go-ahead** / All; "More filters" Returned to Sales, Cheques awaiting clearance; deal table with Billing, Review and the three separate money figures; "Also in Accounts" links. | Live today; the Hotel go-ahead tab is **pending (to build)** |
| `#/app/accounts/deals/:id` | Accounts view of a Deal with tabs Money / Review / Receipts / Documents and the live "Next:" line (default tab = tab of the next action). | Live today; Hotel go-ahead card and the go-ahead part of the approve dialog **pending** |
| · Money | Three money figures; Reported payments for the Deal: Record receipt from this claim (prefilled form), Link an existing receipt, Money not found. Links to Customer dues, Supplier payments, Invoices and vouchers (Agent G pages). | Live (links pending) |
| · Review | Readiness checklist (adds a go-ahead line when the booking has hotels), Booking and review (selling total, confirmed, services sold, trip, booking contact, payment plan), Approve booking (native confirm dialog) or Return to Sales with a reason (Sales sees it), **Hotel go-ahead** card, Customer billing details (check, edit, save puts an approved review back to waiting). | Live + pending go-ahead |
| · Receipts | Receipt cards with every live state and action: verify, reject, reverse, upload proof, cheque verify, record cheque cleared, record not honoured (bounced, stopped, cancelled), re-present. Record a receipt: bank transfer, UPI, cash, cheque (all four modes on, as live), company account choice, cash limits, cheque details. | Live today |
| · Documents | Traveller ID proofs and receipt proof files. | Live today |
| `#/app/accounts/customers`, `/customers/:id` | Customers to check: tabs Not checked / Returned / Checked by Accounts; detail with Mark as checked, Edit details (sets back to Not checked), Return with reason (dialog). | Live today (voice-note batch) |
| `#/app/accounts/claims` | Reported payments: To process / Linked to a receipt / Closed / All. | Live today |
| `#/app/accounts/expenses` | Department costs from Flight and Visa (shared `TN.DATA.departmentCosts`, Agent E): To review / Returned / Accepted / All; Accept expense record, Return to the department with a reason. | Live today |
| `#/app/accounts/cash` | Branch cash, Jodhpur: verified cash in hand vs recorded-not-verified, Unresolved list (late deposit, late verification, missing or unverified daily counts), cash waiting for deposit, Record a bank deposit, deposits, daily cash counts, Record a daily cash count. All computed from the receipts. | Live today |
| `#/app/accounts/destinations` | Company accounts: HDFC Bank current account (XXXX4417) and Office UPI (h***@hdfcbank), each approved by the other person; Show full details, Replace with new details, Retire, Version history, Add a company account; approve or return a waiting version. | Live today |
| Home row | "Hotels waiting for the Accounts go-ahead" (pending). The four live Accounts rows are built by 13-home.js. | Pending |

## Two different Accounts people (enforced everywhere, live wording)

- Receipt recorded by me: Verify and Reject show the disabled button with "You recorded this receipt. Another Accounts person must do this step."
- Receipt verified by me: "You verified this receipt. Another Accounts person must reverse it." Clearance recorded by me: "You recorded the bank clearance. Another Accounts person must reverse it."
- Billing saved by me: "Another Accounts person must do this step. You cannot approve or verify your own work or your own deal."
- Deposit or cash count recorded by me: "You recorded this deposit / cash count. Another Accounts person must do this step."
- Company account version submitted by me: "You submitted this version. Another Accounts person must approve or return it."
- Department cost / reported payment of my own: live block texts.
- Try it: as `accounts`, record a receipt on BX-38455 (or from the reported payment PR-0042); switch to `checker` and verify it. RC-26-0112 (cheque) and RC-26-0114 (UPI) were recorded by Kavita, so only Sunil can verify them. Each record pushes a staff notice to the other person.

## Hotel go-ahead (pending, Stage 3) — how it works in the preview

- Data: `TN.DATA.services[id].goAhead`: `'waiting'` → `'given'` (Give go-ahead) or `'refused'` (shown as "On hold", with a reason). Log in `TN.DATA.accountsLive.goAheadLog[serviceId] = { at, by, reason }`.
- To check, tab "Hotel go-ahead": hotels with goAhead waiting or on hold whose booking is not returned to Sales (the 3 Kerala hotels on BX-38455; Trident on BX-38520 appears once Sales fixes and resends it).
- Approving the booking review gives the go-ahead for its hotels at the same time (all ticked by default); untick one to hold it (reason needed, Sales sees it, Purchase sees only "on hold").
- Before the review is approved the per-hotel button is disabled: "Approve the booking first…". Returned booking: "The booking is back with Sales…".
- Company money: committed hotel cost minus available customer funds (Stage 3 definition). Up to ₹50,000 Accounts approves it with the go-ahead and a funding row is added to `TN.DATA.funding` (status approved, approvedBy Accounts). If a hotel would take company money above ₹50,000, its box is disabled with "company money above ₹50,000 needs the branch Manager first"; it stays waiting until `TN.DATA.funding` has a row for that service approved by `manager` (Agent G/H screens). Example: BX-38455 before any receipt: Munnar goes ahead (₹30,800 funded), the other two wait for the Manager; after Accounts records and the checker verifies the ₹70,000 advance, all three can go ahead.
- Saving billing details after approval puts the review back to waiting and cancels unused go-aheads (Purchase is told).
- Notices: Purchase gets "go-ahead given / on hold" without prices; Sales gets approval and hold reasons.

## Build notes for the real build

- Finance screens show paise (₹70,000.00) as live; times as "27 Oct 2026, 04:03 pm IST".
- Receipt numbers are shown as the shared data ids (`RC-26-0115`) for consistency with the other screens; live uses `R-2026-27-000115`.
- Verifying a receipt does not change `TN.DATA.instalments` (dues are Agent G's; the base data already counts the RC-26-0112 cheque as paid).
- Cash limits used: ₹1,99,999 per payer per day and ₹1,99,999 per trip (policy version 1, invented values).
- "Record a correction" for a receipt rejected as "details entered wrongly" is listed as not possible in the preview (live has the full correction form).
- The go-ahead is given by Accounts here (as the lead's brief says). The 9 Oct contract draft has Purchase press "Give go-ahead" after Accounts approval; this needs the owner's choice (question 1).

## Open questions (recommended answer in bold)

1. Who presses "Give go-ahead": Accounts (this preview, brief) or Purchase after Accounts approves (contract draft §5.3)? **Accounts gives it, per hotel, at approval time; Purchase only sees it and books.**
2. Should approving the booking give the go-ahead for all its hotels by default? **Yes, all ticked; Accounts unticks a hotel to hold it, with a reason.**
3. Company money above ₹50,000: block the hotel until the Manager approves funding (preview), or let Accounts approve and send it to the Manager after? **Block that hotel until the Manager approves; the others still go ahead.**
4. Should "on hold" reasons be visible to Sales? **Yes to Sales and the Manager; never to Purchase.**
5. To check lists reported payments and department costs only through Home and their own pages (as live), not as extra tabs. **Keep as live.**
6. Lead note: 13-home.js counts "Department costs to review" from `D.expenses`; the shared list is `TN.DATA.departmentCosts` (status `submitted`, `submittedBy` ≠ me). **Agent A to switch to departmentCosts.**
