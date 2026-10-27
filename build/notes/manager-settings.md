# Agent H: Manager approvals, reports and Settings

Files: `build/src/80-manager.js` (approvals, escalations, reports, shared markup helpers `TN.hm`), `build/src/81-settings.js` (every `/app/admin/*` tab, `TN.settingsTabs`). No CSS file: every class comes from `build/live.css`.
Tested with `python3 -I build/assemble.py manager`, headless Chromium (the shared browser pane had no free tab), roles manager, admin, accounts, checker, at 1280 and 375 px: no console errors, no sideways page scroll.

## 1. Pages

| Route | Roles | Live today or pending |
|---|---|---|
| `#/app/approvals` (tabs: Waiting for you, Escalations, Decided) | manager | **Pending (to build).** Parts are live today elsewhere: above-budget cost approval (Purchase task page), supplier bank-detail approval, moving a stuck task (Purchase task page "Reassign task"). |
| `#/app/reports`, `#/app/reports/:id` (6 reports) | manager, admin, accounts, checker | **Pending (to build).** |
| `#/app/admin/staff`, `/access` (People and access) | admin | **Live today** (invite, password reset, recovery, deactivate, extra access grants). |
| `#/app/admin/company` | admin | **Live today** (read only). |
| `#/app/admin/finance-policy` (Money rules) | admin | **Live today**, plus **pending**: buttons on the four payment-mode switches. |
| `#/app/admin/integration` (Bitrix connection) | admin | **Live today**. |
| `#/app/admin/imports` (Hotels, Customers) | admin (hotels apply), accounts and checker (customers apply) | **Live today**. |
| `#/app/admin/workflow` (Features) | admin | **Live today** (5 switches), plus **pending**: buttons for Real bookings and Supplier confirmation, with safety checks. |
| `#/app/admin/emails` (E-mails) | admin | **Pending (to build)**: staff/supplier templates, delivery health. |
| `#/app/admin/reminders` (Reminders) | admin | **Pending (to build)**: reminder and escalation rules. |
| `#/app/admin/bookings` (System health) | admin | **Live today** (read only), with Backups and E-mail alert lines added. |

`TN.settingsTabs(role)`: Super Admin gets all 9 tabs. Accounts and the Accounts checker get **Imports only** (live `canImport`: customer list; Money rules needs Super Admin *without* Accounts in that company; Company needs an admin right Accounts lacks). Manager, Sales, Purchase, Flight, Visa: none.

## 2. Approvals inbox (pending)

Looks like the live Accounts "To check" queue (`table-scroll`, `stack-table fin-queue`, `status-pill`, `fin-sub`, `fin-num`). One section per request kind; each row has **Review**, which opens a drawer with the facts (summary list), notes, a "Note for the people involved" field and **Approve** / **Return to <name>**. Return needs a reason of 10 to 500 characters (refusal keeps the typed text and moves focus to the field). Every decision pushes a staff notice and is listed under **Decided**.

| Group | Source | Rule shown |
|---|---|---|
| Supplier payments above ₹50,000 | `supplierPayments` status `waiting_manager` | Counted total for that supplier on that Deal (SP-26-0029 ₹13,200 is with the Manager because it counts with SP-26-0030: ₹69,450). A payment paid from company funding cannot be approved before that funding is approved (refusal). Approve → `approved`, Accounts notified. |
| Company funding above ₹50,000 | `funding` status `waiting_manager` | Approve → `approved`; recovered from the next customer receipt. |
| Hotel and service costs above budget | read from the Purchase workspace (`TN.purchase.issues(id)` contains `over_budget`, e.g. Spice Village ₹38,400 vs ₹36,000) | Approve writes the approval on the cost version (`TN.purchase.work(id).approvals[v]`), same as the live button on the Purchase task page; link "Open Purchase task". |
| Supplier bank details | suppliers with `bank` `changed` (Span) or `waiting` (Marwar Coach) | Approve → bank `approved`, supplier verified, On hold payments released (SP-26-0023). Drawer warns to call the supplier on a known number. |
| Cancellations, refunds, write-offs | `cancellations` (c-198) + `TN.DATA.writeOffs` (added here) | WO-26-003 was asked by the Manager himself: shown as "Your own request", no Approve button, refusal text. |
| Money split across branches | `TN.DATA.splits` (added here): one Marudhar Agro transfer for a Jodhpur and a Delhi booking | Approve → each branch's Accounts records its part. |

**Escalations** (rules from Settings → Reminders): instalments 3+ days overdue (Remind the Sales owner), bookings waiting for Accounts 1+ day (Remind Accounts), tasks not taken (Give to someone), tasks in progress with no update for 3+ days (Reassign task, live wording "Moves the task to another colleague. Offers, costs and files stay." plus a required reason).

Home rows: manager "Approvals waiting for you", "Escalations: overdue and stuck work"; admin "Big switches waiting for the owner’s decision", "Staff invitations not accepted yet". `TN.approvalsWaiting` (shell's sidebar count) is replaced at load with the same count as the Approvals tab (own requests left out), so sidebar, Home and tab agree.

## 3. Reports (pending)

Index of 6 cards; each report has filters in one row (period, branch, salesperson or "done by", status/kind), a stat-card row, a single-series bar list (dataviz rules: one hue, values in text ink, table below is the table view), the live Table in a Card with a totals footer, and **Export to Excel**: a real CSV file (UTF-8 with BOM, opens in Excel) built in the browser from the same rows and columns as on screen, first line names the report, company, date and exporter.

| Report | Shows | Fence |
|---|---|---|
| Sales pipeline | Leads by status, won Deals by booking stage | Selling price column only with `seeSellingPrice` (hidden for Super Admin) |
| Collections and dues | Instalments, paid, still due, ageing bars | `seeCustomerPayments` |
| Supplier payables | Payment requests, approver (Accounts ≤ ₹50,000 counted, else Manager), status | `seeSupplierCost` |
| Booking profit | Selling price, cost (sum of service costs; "estimate" until every service has a cost), margin, margin % | `seeMargin`. Purchase, Flight, Visa cannot open reports at all |
| Purchase savings | Budget minus agreed cost per service and department | `seeSupplierCost` |
| Bills and documents | Customer documents, supplier invoices, supplier invoices missing after a travelled trip | Customer amounts need `seeSellingPrice`, supplier amounts `seeSupplierCost` |

A role without the capability sees the card with a lock line and, on the report page, a restricted notice ("Not shown for your role"); export is refused too.

## 4. Settings: build notes

- **Big switches (pending)**: Real bookings, Supplier confirmation (Features tab) and Bank transfer, UPI, Cash, Cheque (Money rules tab) get the same live Change → reason → Review → Confirm flow as the feature switches. Only a Super Admin signed in with two-step sign-in (`refusal()` checks the person's `mfa`). Each change writes the live audit line "Last changed on … by <name>: switched on. Reason: “…”", a "Change history" list and a staff notice to every department.
- **Supplier confirmation safety checks** (shown on the row and in the review step; Confirm is disabled if one fails): Accounts go-ahead built and on; a Jodhpur Branch Manager with two-step sign-in (computed from the staff list: deactivate Vikram in People and the check fails); active Purchase staff; 2 Accounts approvers; Supabase daily backup in the last day. Review text says a confirmed supplier cannot be undone.
- **E-mails (pending)**: 5 staff reminder templates and 2 supplier templates (rate request, booking request); no customer messages. Edit in a drawer (subject, message with {placeholders}, send yes/no, reason), "Send a test to me". Delivery health: sent / delivered / failed in 7 days, sender and domain verification, recent e-mails.
- **Reminders (pending)**: 7 rules (instalment due soon 3 days, overdue from 1 day, escalate overdue after 3 days, booking waiting for Accounts 1 day, task not taken 4 hours, stuck task 3 days, supplier invoice missing 2 days after the trip). Each rule: On/Off + number + reason → review → confirm. Changing "Overdue instalment goes to the Manager" changes the Approvals escalation list at once.
- Invented content: company address, PAN `AAGCH4821K`, CIN, Jodhpur GSTIN `08AAGCH4821K1ZQ`, Delhi and Ahmedabad GSTIN "Not given yet"; money rules version 1 (receipt max ₹10,00,000, cash ₹1,99,999 per payer per day and per trip, deposit in 1 day); Bitrix portal `holidaychacha-crm.bitrix24.in`, pipelines "General" (9 stages) and "New pipeline" (6 stages) = 15, start 1 Sep 2026, 2,860 runs in 24 h, 12 short errors in 7 days; extra Super Admins Harshvardhan Chouhan, Nikhil Arora, deactivated Rohit Sankhla, invited Sales Tanvi Bohra.
- People list = the 9 role people + Purchase's second person (`TN.PEOPLE.purchase2`, Arjun Parihar, defined by 40-purchase.js; my fallback only if missing) + the extras above.
- Live People and Extra access tables overflow the page at 375 px (checked on the live gallery: 1,074 px). The preview wraps them in the live `.table-scroll` region so the page itself never scrolls sideways. Recommend the same fix in the live CRM.
- `TN.fmt.inr` now prints paise (shell change), so all money shows "₹68,400.00" like live.

## 5. Open questions (recommended answers built)

1. **Who approves a Manager's own request** (e.g. WO-26-003)? Recommended: the Super Admin, or another branch's Manager named by the owner. Built: refusal, stays waiting.
2. **Cancellation recovery**: c-198 leaves ₹25,300 to recover from the customer (supplier charges ₹82,800 + our ₹2,500 − paid ₹60,000). Does the Manager approve a write-off of that if the customer refuses? Recommended: yes, as a separate write-off request.
3. **Purchase savings report**: the owner must confirm it is still wanted (budget minus negotiated cost can encourage padded budgets). Built as listed.
4. **Split across branches**: who approves when both branches have Managers? Recommended: the Manager of the branch that received the money.
5. **Report access for Super Admin**: Super Admin has no money capability in `TN.CAPS`, so 4 of 6 reports are locked for them. Recommended: keep (they can get "See prices and margin" extra access with a reason).
6. **Escalation thresholds**: 3 days overdue, 1 day waiting for Accounts, 4 hours not taken, 3 days stuck. Recommended as built; all editable in Reminders.
7. **Big switch audit**: should a payment-mode change also need a second Super Admin's review? Recommended: no for the pilot (owner APPROVE in the reason is enough), revisit for Delhi and Ahmedabad.
