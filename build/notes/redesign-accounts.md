# Redesign: Accounts (Agent D, 16 Nov 2026)

Files changed: `src/60-accounts.js`, `src/60-accounts.css`, `src/70-money.js`. `src/70-money.css` unchanged.
Tested with `python3 -I build/assemble.py accounts` -> `build/out/accounts.html` (port 4181), roles accounts, checker,
manager (Supplier payments, Company funding, Dues, Refunds) and purchase (refused), at 1280 px, 640 px (200% zoom) and 390 px.
No console errors. No page-level sideways scroll at any width.

## Shared parts used

Agent A's helpers are used when present (they are): `TN.ui.sectionTabs`, `queueToolbar` (built-in `tn-queue`, so
`?q=` / `?sort=` and the page's own `?tab=` / `?filter=` / `?ref=` all stay in the address), `approvalRowActions`,
`status` (C3 tones), `recordHeader`, `state` (empty), `TN.confirmChange` (C7, reason required for Return / Refuse /
Hold / Not in the bank statement / write-off), `TN.jumpTo`. `60-accounts.js` keeps small local fallbacks for each
(exposed as `TN.accUI` for `70-money.js`), so the pages still work if a helper is missing.

- Section tab counts: registered with `TN.setAccCount(href, fn)` (what this person can act on now; "own" items that need a
  second person are not counted). Also kept in `TN.accCount` for the menu if wanted.
- Manager: Agent A's strip lists every tab of a section; the Manager cannot open some (Invoices and vouchers, Supplier
  invoices, Department costs), so for that case the local strip is drawn with only the tabs the role can open.

## Per screen (finding IDs from `audit-nav-settings-accounts.md`)

| Screen | What changed |
|---|---|
| To check `/app/accounts` (A4, N2, N3) | Section tabs (To check · Customers · Reported payments). One search field (`?ref=`, finds reference, customer or trip; an exact reference not in the list still offers "Open BX-…"), six filters as chips (four shown, Returned to Sales and Cheques awaiting clearance under More), sort (Oldest waiting first / Newest / Soonest travel). Rows: Deal (with trip dates) · the three money figures side by side (never added) · Status (review badge + billing as plain text) · Next step with one row button (Verify / Review / Open). Removed: "Find a deal by reference" card, the standing receipt-number note, "Also in Accounts" links. "Why are the amounts separate?" stays folded. |
| To check › Hotel go-ahead | Approval rows: Give go-ahead / Hold on the row (Hold opens the reason dialog); blocked rows show the disabled button with the reason (approve the booking first; company money above ₹50,000 needs the Manager). |
| Accounts view of a Deal `/app/accounts/deals/:id` (A1, A2, A3) | C4 record header (back to To check · ID; title, review status, owner; "Next:" with the one primary button: Verify receipt jumps to the row, Check billing / Review jumps or opens Review, otherwise Record a receipt). Tabs **Receipts · Dues and plan · Documents · Refunds · Review**; `?tab=money` maps to Receipts; unknown tab falls back to the next-action tab. Receipts: the three money figures, the receipt rule said once, "Record a receipt" at the top (opens the existing form in a drawer), receipts as rows (awaiting first) with Verify on the row; recorder sees the disabled Verify with "You recorded this receipt. Another Accounts person must do this step."; every other action (upload proof, reject, reverse, cheque not honoured) and the full facts in the row's Details. "Not possible now" lines removed. Reported payments below. Dues and plan: instalments with still due and ageing, adds-up badge, link to Customer dues (fixes A2: `?tab=dues` now exists). Documents: customer documents (Preview) + ID proofs + proof files. Refunds: cancellations and refunds for the Deal, link to Refunds. Review: unchanged content. |
| Customers `/app/accounts/customers` | Section tabs, toolbar (name, phone, e-mail, GSTIN), chips, sort, "Check" row button. Detail page unchanged. |
| Reported payments `/app/accounts/claims` | Cards became rows (Payment · Paid on · Amount · Status · Next step · Reported by); row opens the Deal's Receipts tab where the claim is recorded or linked. |
| Department costs `/app/accounts/expenses` | Rows with Accept / Return on the row (Return = reason dialog); facts in Details; own costs say another person reviews. |
| Customer dues `/app/accounts/dues` (A9) | Section tabs; Split a customer transfer is the primary action; chips Overdue (default, includes due today) · Due in 7 days · All open · Paid · Trip closure; no "(press to add)" wording; rows with Record receipt + Remind; Deal link goes to the Accounts Deal Dues tab. Trip closure keeps its checklist cards. Manager read-only. |
| Invoices and vouchers `/app/accounts/documents` (A10) | Rows: the document name opens Preview; Approve / Return on the row; Send for approval for drafts; Mark as sent for approved ones (Download PDF / Print in Preview and in Details). |
| Refunds `/app/accounts/refunds` | Cancellations being settled stay as cards (write-off reason now in the dialog); refunds as rows with Record / Verify. |
| Supplier payments, Supplier invoices, Company funding (A7) | Approval rows: Approve / Return (payments), Accept / Return (invoices), Approve / Refuse (funding); Verify / Not in the bank statement on paid payments; Record payment opens the existing drawer. Above ₹50,000 counted together shows "Needs the branch Manager". Manager sees Open Approvals. Details row holds the full facts. |
| Branch cash, Company accounts (A8) | Record deposit (primary, when cash waits) and Record cash count open the existing forms in drawers. Company accounts: table at the top (account, version in use, status, next step jumping to the account) with "Add a company account" in a drawer; the per-account detail list below. One branch only, so no branch tabs. |
| Tally `/app/accounts/tally` (A6, D11) | Only the switched-on method shows (`TN.DATA.money.tallyMethods = { csv: true, file: false }`); method tabs appear only when both are on. Month select moved into a toolbar row. |

## Rules kept

Every route and `?tab=` / `?filter=` value; recorder ≠ verifier everywhere (refusals in the live words); ₹50,000 routing
counted across Deal and supplier; no automatic payouts; Purchase/Flight/Visa get "Page not available"; status words,
amounts and record IDs unchanged.

## Not done / open

1. Records section: the prototype has no "Documents and money" page; the Records link points at Reports (`/app/reports`, Agent E), so A5 (daily check) is not applied here.
2. At 640 px (200% zoom) wide lists scroll inside their table region (keyboard-focusable), as every shared table does; rows stack only below 640 px. No page-level sideways scroll.
3. The Tally file method does not exist in the prototype, so with both switched on its tab would have no content; it stays off.
4. Agent A's toolbar wraps the chips onto two lines when a list has five or more filters (To check, Supplier payments); worth a look in the shared toolbar.
