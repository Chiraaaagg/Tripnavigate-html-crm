# Full CRM preview: what it shows and what changes (27 October 2026)

**Status: DRAFT for owner review (27 October 2026). Not approved yet.**

This file explains the clickable preview of the whole TripNavigate CRM as it will look once everything planned is built: every screen that is live today, plus every feature still to build, seen through the eyes of each department. To open it, double-click `full-crm-preview.html` in this folder; it opens in your web browser. Keep the `fonts` folder next to it, or the lettering will look wrong. To see the CRM as another department, open the account menu at the bottom of the left-hand menu (on a phone: tap "Menu", then the account panel) and pick a role under "View as". Every name, phone number, amount and Deal number in the preview is invented; none comes from the live CRM. "Today" in the preview is Tuesday 27 October 2026, Jodhpur branch. The look is copied from the live CRM (the version released on 27 October 2026). Nothing you do in the preview is saved or sent anywhere: buttons work, but reloading the page puts everything back as it was. The screens themselves carry no "demo" or "preview" labels, so that they look like the real CRM in use; this file is where that is said.

Sections 1 to 4 are for the owner. Sections 5 to 8 are build notes for the later build session.

---

## 1. Roles in the preview

There are 8 roles. Each is one invented person. A second invented Sales person, Mohit Gehlot, owns some Deals, and a second invented Purchase person, Arjun Parihar, works some tasks, so that "someone else's work" can be shown.

| Role | Person | Can see | Cannot see (money fences) |
|---|---|---|---|
| **Sales** | Ritika Sharma | Leads, her own Deals, Book now, quotations, itineraries, the selling price and margin, what the customer has paid and still owes, payments she reported | Supplier payments, Accounts work screens, Purchase, Flight and Visa desks, the uploaded customer payment proof (except her own reports), bank references on receipts |
| **Purchase** | Imran Qureshi | Hotel, car and activity tasks, suppliers, his own supplier costs and the approved budget, his own payment requests | The selling price, margin, customer receipts, customer dues, customer payment proof, Leads, quotations, the reason typed for company funding, the customer side of a cancellation |
| **Flight** | Neha Bhati | Flight tasks, her own costs, the approved budget, her own payment requests | Same fence as Purchase: no selling price, margin, customer receipts or payment proof anywhere |
| **Visa and passport** | Farhan Ali | Visa and passport tasks, fees and costs, the approved budget | Same fence as Purchase |
| **Accounts** | Kavita Joshi | All money: selling price, margin, receipts, payment proof, dues, supplier payments, supplier invoices, documents, funding, refunds, Tally export, reports | Nothing is hidden, but she can never verify, approve or check her own work |
| **Accounts checker** | Sunil Mehta | The same as Accounts. He is the "different Accounts person" who verifies what Kavita records, and the other way round | Same as Accounts |
| **Branch Manager** | Vikram Rathore | All branch Leads and Deals, prices, margin, customer payments, supplier costs, the Purchase desk (to follow and approve), Flight and Visa desks (to follow), approvals, reports, and read-only views of dues, supplier payments, funding and refunds | The uploaded customer payment proof file itself; he can never approve his own request |
| **Super Admin** | Anjali Kapoor | Settings, staff and access, Leads (read only), reports that carry no money | Selling price, margin, customer payments and supplier costs (4 of the 6 reports are locked for this role); Deal pages |

---

## 2. Screens per role

**Live today** = this screen or feature exists in the CRM staff use now. **Pending (to build)** = planned, shown in the same design, not built yet.

Every role has: **Home** (Live today, with new rows marked below), **Notices** (Pending: staff reminders and notices, with filters for reminders, notices and escalations, and "Mark as read"), and **My access** (Live today).

### Sales (Ritika Sharma)

- **Home**
  - Welcome line, "Go to deals", deal counts, and the "What needs you" rows: drafts to continue, returned by Accounts, drafts missing details, Deals needing a booking, quotation drafts, accepted quotations to link. **Live today**
  - New rows: "Customer payments overdue", "Changes waiting for the customer", "Reminders and notices you have not read". **Pending (to build)**
  - New wording in "What this CRM does not do yet" (see section 3). **Changed**
- **Leads list and Lead page** (Overview, Quotations, Bitrix details, "New quotation"). **Live today**
- **Deals list** (All, Owned by you, Assigned to you, order switch). **Live today.** Extra filters for overdue payments and waiting changes. **Pending (to build)**
- **Deal page**
  - Header with booking status, owner, one main button and the "Next" line. **Live today**
  - "Trip booked / Travelled / Trip closed" badge and a "Cancellation requested" notice. **Pending (to build)**
  - Overview tab. **Live today.** Trip status steps (Booked, Travelled, Closed) and the closure checklist (read only). **Pending (to build)**
  - Services and tasks tab. **Live today.** On each Purchase service, a line showing whether Accounts has given the go-ahead; a "Changes after booking" card; "Request a change" and "Cancel booking". **Pending (to build)**
  - Quotations tab (quotations and branded itineraries). **Live today**
  - Documents tab (ID proofs, Bill To proof, itinerary, supplier confirmations, tickets). **Live today.** "Invoices and vouchers" card: ask Accounts for an Invoice or Advance Invoice, ask Accounts to approve a hotel voucher, download or view, "Mark as sent". **Pending (to build)**
  - Money tab (booking total, payment plan, payments the customer told you about, "Report a payment"). **Live today.** Customer dues per instalment (paid, due in N days, overdue), paid so far, still due, who follows up, and the list of receipts Accounts has checked. **Pending (to build)**
  - History tab. **Live today.** "Changes and cancellations" group. **Pending (to build)**
- **Book now** (the three-step booking form the owner approved on 26 October). **Live today.** Submit, "Payment already received?" and the Bill To customer search all work in the preview.
- **Quotations**: list, new quotation, version page (edit, share, customer's answer, accept, decline, new version), customer copy. **Live today** (with a new Print button, see section 3)
- **Branded itineraries**: list, new, facts, differences from the quotation, preview PDF and final PDF. **Live today**
- **Referral drafts** (a customer who is not in Bitrix yet): built and live, but switched **Off** today. Shown as they work once switched On.
- **Purchase task page** for her own Deals: details only. **Live today**
- **Viewing an Invoice or Advance Invoice** as the customer will see it. **Pending (to build)**

### Purchase (Imran Qureshi)

- **Home**
  - "Purchase tasks not taken yet, or yours in progress". **Live today**
  - New rows: hotel tasks waiting for the Accounts go-ahead, costs above budget waiting for the Manager, supplier invoices missing after the trip, payment requests returned to you, unread notices. **Pending (to build)**
- **Deals list and Deal page** (only Deals with his tasks; Overview, Services and tasks, Documents, History; no Money tab). **Live today**
- **Purchase tasks list** (Not taken, Mine, All). **Live today.** "Waiting for Accounts go-ahead" badge. **Pending (to build)**
- **Purchase task page** (Details, Work, Files, History)
  - Take the task, hand it back, supplier offers, cost history, propose a new cost, files, record the supplier's confirmation (locks the task). **Live today.** (In the live CRM this work is switched off on real bookings; see section 3.)
  - The Accounts go-ahead: hotels can be prepared, but cannot be confirmed, sent a booking request or paid until Accounts gives the go-ahead. **Pending (to build)**
  - E-mails to the supplier from the task: "Ask for rates" and "Send booking request" (never the selling price). **Pending (to build)**
  - Supplier payment request: amount, deposit, balance or full payment, due date, the supplier's proforma (required); the screen says whether Accounts or the Manager will approve. **Pending (to build)**
  - Ask for company funding when the customer's money has not arrived (no customer amounts shown). **Pending (to build)**
  - Upload the supplier's original invoice or credit note, with Accounts' check status; a warning when the original is missing after the trip. **Pending (to build)**
  - Cancellation: enter what each supplier keeps, upload the credit note, send the charges to the Manager. **Pending (to build)**
- **Suppliers list and supplier page** (add, edit, new bank details). **Live today.** New bank details put that supplier's payments on hold until the Manager approves. **Pending (to build)**
- **Payment requests** (his own: Requested, Waiting for Manager, Approved, Paid, Verified, Returned, On hold; "Change and send again"). **Pending (to build)**

### Flight (Neha Bhati)

- **Home**
  - "Flight tasks not taken yet, or yours in progress". **Live today**
  - New rows: "Tickets to mark done", "Flight costs returned by Accounts", unread notices. **Pending (to build)**
- **Deals list and Deal page** (only Deals with her tasks, no Money tab). **Live today**
- **Flight tasks list** (Not taken, Mine, All). **Live today**
- **Flight task page**
  - Take the task, flight details, travellers and budget, traveller ID proofs (only for the person who took the task). **Live today**
  - Cost card: record a fare or other cost, paid by the company, by the customer directly, or not yet; direct payment up to ₹50,000 with proof; "Send to Accounts"; change and resend a cost Accounts returned. **Live today**
  - Files and History tabs. **Live today**
  - "Finish this flight": PNR (airline booking reference), e-ticket upload, a "Before you mark it done" list, and "Mark flight done", which locks the task and tells Sales and Accounts. **Pending (to build)**
  - Payment request for a ticket above ₹50,000. **Pending (to build)**
  - Flight lines for the customer's invoice (route, flight, date, passengers, PNR; no selling price). **Pending (to build)**

### Visa and passport (Farhan Ali)

- **Home**
  - "Visa and passport tasks not taken yet, or yours in progress". **Live today**
  - New rows: "Travellers waiting for a visa result", "Visa costs returned by Accounts", unread notices. **Pending (to build)**
- **Deals list and Deal page** (only Deals with his tasks, no Money tab). **Live today**
- **Visa and passport tasks list** (Not taken, Mine, All). **Live today**
- **Visa task page**
  - One record per traveller: documents (missing, received, checked), submission, waiting for the decision, issued or refused (needs the authority's document), documents returned, customer informed, withdraw. The task completes itself when every traveller is done. **Live today**
  - Fees and costs for Accounts, fee receipt upload, passport numbers partly hidden. **Live today**
  - Visa result notice to the Deal's Sales person when a visa is issued or refused. **Pending (to build)**
  - Visa lines for the customer's invoice (fees per traveller; no selling price). **Pending (to build)**

### Accounts (Kavita Joshi)

- **Home**
  - Bookings to review, receipts to verify (recorded by someone else), reported payments to check, department costs to review. **Live today**
  - New rows: hotels waiting for the go-ahead, overdue instalments, transfers to split, supplier payments to approve, pay or verify, supplier invoices to check, documents to approve, funding to approve, refunds to record or verify, trips ready to close, trips with open closure items. **Pending (to build)**
- **Deals list**: the live empty page "Your Deal work is in Accounts". **Live today**
- **To check** (booking reviews, receipts to verify, all; returned to Sales; cheques waiting). **Live today.** "Hotel go-ahead" tab. **Pending (to build)**
- **Accounts view of a Deal**
  - Money tab (three money figures, reported payments for the Deal). **Live today.** Links to the new money pages. **Pending (to build)**
  - Review tab: readiness list, booking details, approve or return to Sales, Bill To check. **Live today.** "Hotel go-ahead" card, and giving the go-ahead hotel by hotel while approving. **Pending (to build)**
  - Receipts tab: record by bank transfer, UPI, cash or cheque; verify, reject, reverse; cheque cleared or not honoured. **Live today**
  - Documents tab (ID proofs and receipt proofs). **Live today**
- **Customers to check**. **Live today**
- **Reported payments**. **Live today**
- **Department costs** (Flight and Visa costs: accept or return). **Live today**
- **Branch cash** (cash in hand, bank deposits, daily cash counts). **Live today**
- **Company accounts** (bank account and UPI, each approved by the other Accounts person). **Live today**
- **Settings, Imports** (customer list). **Live today**
- **Customer dues**: every open instalment with how late it is, "Remind" (to Sales), split one customer transfer across instalments or bookings, and the trip closure list with "Close trip". **Pending (to build)**
- **Supplier payments**: approve (up to ₹50,000), return, record the payment with its bank reference and proof, verify, "Not in the bank statement". **Pending (to build)**
- **Supplier invoices**: check originals and credit notes against cost and payments; list of invoices missing after the trip. **Pending (to build)**
- **Invoices and vouchers**: create, approve, return, preview, download PDF, print, mark as sent. **Pending (to build)**
- **Company funding**: approve up to ₹50,000, refuse, mark recovered. **Pending (to build)**
- **Refunds and recoveries**: cancellations being settled, record a refund paid or money received, verify. **Pending (to build)**
- **Tally export**: pick a month, see what goes in and what is left out (not yet checked), download for Excel, mark as exported. **Pending (to build)**
- **Reports**. **Pending (to build)**

### Accounts checker (Sunil Mehta)

- The same screens as Accounts. Use this role to see the two-person rule: what Kavita recorded, Sunil verifies, and the other way round. When either opens their own work, the button is replaced by "You recorded this … Another Accounts person must do this step." **Live today** for receipts, cash, company accounts, billing and department costs; **Pending (to build)** for supplier payments, splits, documents, supplier invoices, refunds and recoveries.

### Branch Manager (Vikram Rathore)

- **Home**
  - The branch booking rows (drafts, returned, missing details, needing a booking, quotations). **Live today**
  - New rows: approvals waiting, escalations (overdue and stuck work), customer payments overdue, changes waiting for the customer, hotel costs above budget, supplier bank details to approve, suppliers to verify. **Pending (to build)**
- **Leads, Deals, Deal page** (all branch work, all tabs), **Book now**, **Quotations**, **Itineraries**. **Live today** (with the same pending parts as Sales)
- **Purchase tasks** (follow progress), task page read only, "Approve this cost above budget", "Reassign task". **Live today**
- **Suppliers**: verify a supplier, approve new bank details. **Live today**
- **Flight tasks** and **Visa and passport tasks** (follow progress). **Live today**
- **Approvals**: one inbox for supplier payments above ₹50,000, company funding above ₹50,000, costs above budget, supplier bank details, cancellations, refunds and write-offs, and money split across branches; plus Escalations and Decided. **Pending (to build).** (Approving costs above budget and bank details already works today on the Purchase screens.)
- **Reports** (6 reports with Excel export). **Pending (to build)**
- **Customer dues, Supplier payments, Company funding, Refunds and recoveries**: read-only views, opened from links. **Pending (to build)**

### Super Admin (Anjali Kapoor)

- **Home**: "Open" the first Settings page; "Nothing needs you right now" when empty. **Live today.** New rows: "Big switches waiting for the owner's decision", "Staff invitations not accepted yet". **Pending (to build)**
- **Leads** (read only) and **Deals list** (live empty page). **Live today**
- **Settings**
  - People and access (invite, password reset, recovery, deactivate, extra access). **Live today** (tables now scroll inside their box on phones, see section 3)
  - Company (read only). **Live today**
  - Money rules. **Live today.** Buttons to change the four payment types (bank transfer, UPI, cash, cheque). **Pending (to build)**
  - Bitrix connection. **Live today**
  - Imports (hotels, customers). **Live today**
  - Features (5 switches with reason, review and confirm). **Live today.** Buttons for "Real bookings" and "Supplier confirmation", with safety checks before Supplier confirmation can be turned on. **Pending (to build)**
  - E-mails (staff reminder templates, supplier templates, delivery health). **Pending (to build)**
  - Reminders (7 reminder and escalation rules). **Pending (to build)**
  - System health. **Live today.** Backup and e-mail alert lines. **Pending (to build)**
- **Reports** (only the ones without money can be opened). **Pending (to build)**

---

## 3. What changed from the live CRM on screens that are already live

These are the deliberate differences on screens staff already use. Everything else on a live screen is meant to look and behave as live.

**Different wording or behaviour**

- **Home, "What this CRM does not do yet":** the live text says invoices, supplier payments and reports are not in the CRM. Once the plan is built that is no longer true, so the new text says: customer e-mails and WhatsApp messages are not sent from the CRM yet (download or print and send it yourself), train bookings are not in the CRM yet, and Sales leads, follow-ups and stages stay in Bitrix.
- **Quotation customer copy:** a new "Print or save as PDF" button. The live page has no button; staff print from the browser. (Question 12.)
- **People and access tables on phones:** on the live CRM these tables run off the right edge of a phone screen. In the preview they scroll sideways inside their own box, so the page itself never does. We recommend the same fix in the live CRM. (Question 12.)
- **Book now, Submit button:** in the approved form, "Submit booking and create tasks" could stay greyed out after the last automatic save. The preview fixes this so the button wakes up as soon as "Before you submit" is complete. Nothing else in the approved form changed.
- **Referral drafts** are shown switched **On**. In the live CRM the switch is Off; turning it on needs your separate approval.
- **Supplier confirmation** is shown switched **On** for Purchase, together with the new Accounts go-ahead. In the live CRM it is Off, so Purchase cannot yet add offers, costs, files or confirmations on real bookings.
- **Money with paise:** amounts show with paise everywhere (for example ₹68,400.00), as the live Accounts, Purchase, Flight and Deal screens do. New screens follow the same rule. Quotations keep whole rupees, as live.
- **Links you cannot open become plain text:** if a role is not allowed to open a page, the name or number shows as ordinary text instead of a link, so nobody clicks into a "Page not available" screen.
- **Receipt numbers** show in the short form used across the preview (for example RC-26-0115). Live uses a longer form (for example R-2026-27-000115).
- **Flight status word:** a flight with its ticket recorded but not yet finished reads "In progress · ticket recorded, not marked done". Live says the ticket is not recorded in the CRM, because live has no ticket field yet.
- **Menu:** new menu items for the new pages. Only the new items Notices and Approvals show a small count; live items stay without counts, as today.
- **"View as"** in the account menu exists only in the preview. It is not part of the CRM to be built.
- **Sign out** leads to the sign-in page; "Sign in" there goes straight back to Home.

**New parts added inside live screens** (listed in full in section 2): new Home rows; on the Deal page the trip status, changes and cancellations, invoices and vouchers, and customer dues; on the Purchase task page the go-ahead, supplier e-mails, payment requests, supplier invoices and cancellation charges; on the Flight task page "Finish this flight"; on To check and the Accounts Review tab the hotel go-ahead; in Settings the switch buttons and the backup and e-mail lines on System health.

**Kept exactly as live, even though it could be better**

- On the Purchase tasks list the Status column wraps word by word on a wide screen, as live does. It can be fixed later.
- Passport numbers are partly hidden in the live style (••••4821).

**Not in the preview at all**

- The Book now card on the Deal page's Services and tasks tab, and the search box on the Deals list.
- Correcting a receipt that was rejected as "entered wrongly" (live has a full correction form).
- Real file uploads (only file names are kept), real e-mails, and real PDFs (the preview makes a simple PDF in the browser).

---

## 4. Questions for the owner

The preview already works the way each recommended answer says. Reply "yes" to keep it, or tell us what to change.

1. **Who chases unpaid instalments?** Recommended: the Deal's Sales person follows up; Accounts sees the same dues list and can send Sales a reminder; the branch Manager is told once an instalment is 3 days overdue. **Yes?**
2. **Can a supplier be paid in parts?** Recommended: yes. Each part (deposit, balance) is its own request. The ₹50,000 limit counts everything already asked for that supplier on that Deal, so a small balance still goes to the Manager when the total passes ₹50,000. Exactly ₹50,000 stays with Accounts. **Yes?**
3. **Who approves cancellations, refunds and write-offs?** Recommended: only the Deal's Sales person or the Manager can ask, and only after Accounts approved the booking. Purchase enters what each supplier keeps (Flight enters airline charges on its own task). The branch Manager approves. Accounts pays the refund, or adds what the customer still owes to their dues; a different Accounts person checks it. A write-off is a separate request the Manager approves with a reason. If the Manager asked for it himself, the Super Admin approves it. **Yes?**
4. **Invoice number format?** Recommended: HC/JDH/26-27/0001 for an Invoice and HC/JDH/ADV/26-27/0001 for an Advance Invoice, counted per branch and starting again each financial year. Each says "Not a tax invoice. The tax invoice is issued from Tally." **Yes?**
5. **Is the Purchase savings report (budget minus the price Purchase got) still wanted?** It is in the preview. Recommended: yes, keep it. Note that it can tempt staff to set budgets high. **Yes?**
6. **Who gives the go-ahead before a hotel is booked?** Recommended: Accounts, hotel by hotel, while approving the booking. All hotels are ticked by default; Accounts can hold one with a reason that Sales and the Manager see (Purchase only sees "on hold"). Before the go-ahead, Purchase can collect rates and offers, but cannot confirm, send a booking request or ask for payment. **Yes?**
7. **Hotels that must be paid before the customer's money arrives (company funding)?** Recommended: Accounts approves up to ₹50,000, the Manager above. A hotel needing more than ₹50,000 of company money waits for the Manager; the other hotels still go ahead. The money is taken back from the next customer payment on that Deal that Accounts has checked, and Accounts marks it recovered. **Yes?**
8. **A supplier changes their bank details?** Recommended: all payments to that supplier go on hold until the Manager approves the new details (after calling the supplier on a known number). Company funding may still be approved, but the payment waits. **Yes?**
9. **Changes after booking (for example adding a tour)?** Recommended: only the Deal's Sales person or the Manager can ask, after Accounts approved the booking. A change the customer will notice makes a new version of the booking and needs the customer's written OK again. **Yes?**
10. **Price per service on the Invoice?** Recommended: yes, Sales types a customer price for each service in Book now (a package trip is one "Land package" line), so the Invoice shows real prices per line. The preview today shares the total across services by their cost estimates. Saying yes adds one field to the approved Book now form. **Yes?**
11. **When can Flight mark a ticket done?** Recommended: once the PNR, the e-ticket and the fare are in, every company-paid cost is sent to Accounts (none returned), and every unpaid fare has a payment request. Flight may mark it done while that payment still waits for approval. Only the branch Manager can reopen a done flight, with a reason. **Yes?**
12. **Keep the two small changes on live screens?** The "Print or save as PDF" button on the quotation customer copy, and the staff tables that scroll inside their box on phones (we would fix the live CRM the same way). **Yes?**

---

## 5. Build notes per area (for the build session)

Build exactly what the preview shows. Where a rule below says "recommended", it is built that way in the preview and waits for the owner's answer in section 4 or in 5.12. Money in the preview data is whole rupees; the build stores paise. Preview ids (SP-26-0031, F-26-007 …) are examples, not agreed formats, except where 5.9 says otherwise. Source notes: `build/notes/<area>.md`.

### 5.1 Roles and access

Capabilities (from `build/src/00-data-base.js` `TN.CAPS`, mirroring standing rules 9 and 10 and `modules/access/policy.ts`):

| Capability | Roles |
|---|---|
| See selling price, see margin, see customer payments (receipts, dues) | sales, accounts, checker, manager |
| See the customer payment proof file itself | accounts, checker (Sales sees its own reported payments) |
| See supplier cost | purchase, flight, visa, accounts, checker, manager |
| See Leads | sales, manager, admin |
| Quotations, Book now | sales, manager |
| Purchase desk | purchase, manager |
| Flight desk / Visa desk | flight / visa (manager follows read-only) |
| Accounts screens | accounts, checker (manager read-only on dues, supplier payments, funding, refunds) |
| Approve as Manager | manager |
| Settings | admin (accounts and checker get the Imports tab only, as live `canImport`) |
| Reports | manager, admin, accounts, checker; each report also checks its money capability |

- "Accounts checker" is a preview role only: both people hold the Accounts role. The difference is the two-person rule.
- Visibility: Sales = Deals they own; Manager = the branch; Purchase, Flight, Visa = Deals where a service is assigned to their department (the services card shows only their rows); Accounts can open a Deal page from its queues and notices, but the Deals list stays the live empty state.
- Purchase, Flight and Visa never get the Money tab, the Lead link, quotations, invoices, receipts or payment reports. A sweep of every role, Deal and tab found none of that text for these roles. They do see supplier charges on a cancellation (that is supplier cost).
- A link to a page the role cannot open is rendered as plain text (`TN.canOpen` + `unlinkClosed` in `10-core.js`; lead rule, 27 Oct).
- Nobody approves, verifies or checks their own work, in every area.
- Menu items per role: BRIEF section 4. Settings appears only when `TN.settingsTabs(role)` returns a tab; its link is the first tab.

### 5.2 Shell, Home and notices (`notes/shell.md`)

- Shell, phone Menu sheet, account menu, overlays (drawer, dialog, toast) are copies of the live components. Toasts: success, info and neutral close after 6 s (paused on hover and focus); warning and danger stay until dismissed; at most five.
- Home counts follow the live `my_work_counts` meanings: drafts = in progress, ready to submit or returned; missing details = in progress with no price or no services; needing a booking = not started or quotation accepted; department queues = tasks not taken plus the person's own in progress, on bookings Accounts approved; receipts to verify = recorded by someone else.
- New Home rows per area are listed in section 2. The Purchase duplicate "Purchase tasks not taken" row was dropped in favour of the live combined row; Flight and Visa add only rows that are new.
- **Notices** (new): record `{ id, to: [roles], kind: reminder | notice | escalation, text, deal?, href?, at }`. Read state is per person in the build (`readBy`, per role in the preview); "Mark all as read" covers only the person's own notices; opening the Deal link marks it read. Staff only; never sent to customers.
- Notices are pushed by: payment reported, invoice asked, voucher to approve, change waiting or accepted, cancellation asked, charges entered, trip closed, go-ahead given or on hold, receipt recorded (to the other Accounts person), flight ticket issued, visa result, supplier payment raised, returned, approved, paid, bank details changed or approved, big switch changed.
- Menu counts only on Notices (unread) and Approvals (same count as the Approvals tab, own requests left out). They are a convenience; each page still checks access.

### 5.3 Sales: Leads, Deals, Deal page (`notes/sales.md`)

- Lead references show as `BXL-` + number.
- **Trip status** is computed, not stored as typed: **Booked** only when the booking state is "All services confirmed" and every service is confirmed; **Travelled** automatically from the day after the trip's end date; **Closed** only when Accounts closes it (5.9). No trip badge while services are still being arranged.
- **Closure checklist:** one list of 5 items, shown the same on the Deal Overview and the Accounts closure page: customer receipts verified, nothing still due from the customer, every supplier payment verified, every supplier invoice in and checked, no open refund or recovery. Supplier payments are counted for every service with a cost, except flights at or below ₹50,000 (Flight pays those directly). Invoices are required for Purchase services with a supplier. A refund counts as open until verified.
- **Customer dues:** "Paid" follows the instalment's paid amount; "Checked by Accounts" follows verified receipts, so a cheque waiting for clearance counts in Paid so far but not in Checked (BX-38390). Statuses: Paid, Due in N days, Due today, Overdue · N days, Part paid (icon + word).
- **Receipts for Sales:** verified receipts only, without bank reference or proof.
- **Documents card:** Invoice, Advance Invoice and hotel voucher with Draft / Waiting for Accounts / Approved by Accounts / Sent to the customer. An Advance Invoice cannot exceed money checked by Accounts; an Invoice cannot exceed the selling total; a second request of the same kind while one waits is refused. Only Accounts approves.
- **Change flow:** record `changes[] { id, deal, kind, detail, requestedBy, at, status: waiting_customer | accepted | done | withdrawn, note }`. Sales asks → Waiting for the customer → Sales records Customer accepted → departments told. In the preview a price change is only a note; the build makes a new booking version with fresh acceptance (question 9).
- **Cancellation flow:** record `cancellations[] { id, deal, kind, reason, requestedBy, at, status: requested | charges_entered | waiting_manager | approved | refund_paid | closed, charges: [{ service, supplierCharge, note }], customerPaid, refundToCustomer, ourCharge, recoveryFromCustomer }`. Sales asks (services + reason) → Purchase enters what each supplier keeps → Manager approves → Accounts refunds or collects → a second Accounts person verifies. Refund or recovery = customer paid (checked) − supplier charges − our charge. Example c-198: paid ₹60,000, supplier charges ₹82,800, our charge ₹2,500 → customer owes ₹25,300.
- "Start booking" sets the Deal to Booking in progress and opens Book now.
- "Report a payment" keeps the live rules: reference 6 to 40 characters, duplicate reference refused with the live wording, typed input kept.
- Not built: the DealBookNowCard on Services and tasks (no live capture), the Deals list search box.

### 5.4 Book now, quotations, itineraries, referral drafts (`notes/booknow-quotes.md`)

- Book now is the owner-approved form of 26 October (`_archive/prototypes/book-now-2026-10-26/CHANGES.md`), unchanged except one fix: `syncSubmit()` keeps "Submit booking and create tasks" in step with "Before you submit" after every auto-save. Build it that way.
- **Submit** creates exactly one task per service row: hotel → Purchase, with the go-ahead waiting; car and activity → Purchase; flight → Flight; visa and passport → Visa. Budget = the cost Sales typed (hotel nightly cost × rooms × nights; car rate × cars; flight fare per person × passengers). The payment plan becomes instalments. Deal → waiting for Accounts; notice to Accounts. A returned booking's resubmit (version 2) keeps the existing tasks and updates their budgets.
- "Payment already received? → Send to Accounts" creates a reported payment (status reported). It is not money.
- Bill To search reads the customer list (name, company contact, phone, GSTIN); a picked customer still waits for the Accounts check.
- "Start booking from this quotation" copies the accepted option's services and the per-person purchase / markup / final into a new draft, once.
- Quotation money is whole rupees, as the live quotation screens.
- Quotation rules kept as live: a shared version never changes; sharing a version replaces the one shared before; accepting needs the customer's written yes as a file and books nothing; the CRM never converts a lead or changes Bitrix; "Mark as shared" only records how and when staff shared it.
- Referral drafts (TD-…) are shown as they work once the `referral_drafts` switch is On; linking to Bitrix is by picking one of your own Deals, never by matching name, mobile or e-mail; nothing changes in Bitrix.
- If question 10 is yes: add a customer price per service to Book now (package: one "Land package" line) and store it per service item.

### 5.5 Purchase (`notes/purchase.md`)

- **Go-ahead gate:** `services[].goAhead: waiting | given | refused | null` (null = not needed). Hotel (and package) tasks with go-ahead waiting can be taken and prepared (offers, costs, files, rate e-mails). Refused while waiting: "Record supplier confirmation" (refusal text "Waiting for Accounts go-ahead. Accounts approves every hotel commitment.", named first, other blockers under it), "Send booking request", "Request supplier payment". Hand-offs timeline gains "Accounts gives the go-ahead". The Stage 3 contract draft of 9 October has Purchase press "Give go-ahead"; the preview has Accounts give it (question 6).
- **Supplier e-mails:** "Ask for rates" and "Send booking request" from templates (stay facts, rooms, meal plan, guests, special requests, our Deal reference; booking request adds the agreed supplier cost, lead guest, and asks for the confirmation number and proforma). Never the selling price. Sender shown as a verified Purchase address on the company domain. Logged on the task and in History. Rate requests do not need the go-ahead; booking requests do.
- **Supplier payment request:** record `supplierPayments[] { id, deal, service, supplier, amount, part, dueBy, raisedBy: purchase | flight, raisedAt, status, invoice (proforma file), note, funding?, approvedBy, paidBy, paidAt, fromAccount, bankRef, proof, verifiedBy, returnReason }`; statuses `requested | waiting_manager | approved | paid | verified | returned | on_hold`. Proforma required. Routing: see 5.8.
- **Funding from the payment drawer:** when verified customer money for the Deal minus non-funded supplier requests is short, the drawer shows "Customer money has not arrived yet" (no amounts), a ticked "Ask for company funding for this payment" and a required reason. Creates a funding record linked from the payment. Purchase screens never show funding reasons, and reasons should be about the supplier (deadline, hold), not customer money.
- **Payment requests page:** statuses with one-line explanations; paid rows show date, payer, bank reference and checker; returned rows show the reason and "Change and send again" (prefilled; the old row shows "Sent again as …").
- **Supplier invoice or credit note:** kind, number, date, total, GST included, file → `supplierInvoices[] { id, deal, service, supplier, kind: Invoice | Credit note, number, amount, gst, date, file, status: uploaded | accepted | returned, by, checkedBy, note }`. "Original invoice missing" when the trip has ended, the task is confirmed and no non-returned Invoice exists. Notice to Accounts on upload.
- **Cancellation charges:** per Purchase task: committed cost, supplier keeps, supplier refunds, note, who entered it, credit note status. "Send charges to the Manager" is refused until every Purchase service of the Deal has a charge. Changing a charge after sending sets the cancellation back to charges_entered. Purchase never sees customerPaid, refundToCustomer, ourCharge or recoveryFromCustomer.
- **Bank details change:** recording new bank details sets the supplier to changed/waiting, moves its open requests to on_hold and notifies the Manager and Accounts; the Manager's approval releases them to their previous status and notifies Purchase and Accounts.
- Confirmation stays as live: one-way, locks the task, copies the latest proposed cost into a committed version. Cost above budget needs the Manager's approval, bound to that cost version; nobody approves their own entry.
- Payment requests on a hotel need the go-ahead. Recommended: a request may be sent before the supplier confirmation (deposits to hold rooms) once the go-ahead is given and a cost is proposed.
- A "Package" service type (land package from a destination company) is used for `s-301-p`; treated like a hotel for the go-ahead. Recommended: keep it.

### 5.6 Flight and Visa (`notes/flight-visa.md`)

- **Mark flight done (DEC-59):** a flight finish command that checks in the database: PNR recorded; e-ticket uploaded (new department file kind `e_ticket`); a fare recorded; every company-paid cost sent to Accounts (none returned, none in draft); every "Not yet" cost has a payment request. Then it sets the task done with time and person, writes the History event "Flight marked done · ticket issued" and the notice "Flight ticket issued for <family>: <airline> PNR <PNR>." to Sales and Accounts. Lock cost changes and file removal on a done task. A `ticket_reference` (PNR) field on the flight task. Accounts acceptance and payment are not required to mark done.
- After done: if Accounts returns a cost, only that cost line reopens; the task stays done. Only the branch Manager can reopen a done flight, with a reason (back to In progress, notice to Sales and Accounts).
- Status word once PNR and e-ticket are in: "In progress · ticket recorded, not marked done".
- **Direct payment:** Flight may pay the airline directly up to ₹50,000 per purchase with proof (live Department costs); above that the live refusal says to record it as "Not yet", and "Raise a payment request" reuses the supplier payment request with `raisedBy = flight` and the same routing.
- **Department costs** (shared with Accounts): `departmentCosts[] { id, task, dept, deal, kind: fare | other | government_fee | service_fee, note, amount, paidBy: company | customer_direct | not_yet, mode, paidOn, reference, proof, status: draft | submitted | accepted | returned, submittedAt, submittedBy, reviewedBy, reviewedAt, returnReason, paymentRequest }`. Reviewer ≠ submitter. Also `departmentFiles[]` and `taskHistory[serviceId]`.
- **Visa result notice:** recording Issued or Refused sends a staff notice to the Deal's Sales owner ("Visa result: … 3 of 4 issued, 1 still with the authority.") and adds "Visa result sent to <name> (Sales)" to History.
- **Invoice lines:** flight = one line per segment (route, flight, date and time, passengers, PNR); visa = one line per traveller (visa, government fee, service fee, result). Costs only, never selling values. When one fee covers all travellers, recommended: split equally per traveller unless the desk records per-traveller fees.
- Passport numbers masked as live (`••••4821`).
- Not built: automatic ticket reading (later, optional).

### 5.7 Accounts, live screens and the hotel go-ahead (`notes/accounts.md`)

- Two-person rule wording kept as live: "You recorded this receipt. Another Accounts person must do this step."; "You verified this receipt. Another Accounts person must reverse it."; "You recorded the bank clearance. Another Accounts person must reverse it."; billing: "Another Accounts person must do this step. You cannot approve or verify your own work or your own deal."; deposits and cash counts; company account versions ("You submitted this version. Another Accounts person must approve or return it."). Each record pushes a notice to the other person.
- **Go-ahead:** To check gets a "Hotel go-ahead" tab (hotels waiting or on hold whose booking is not returned to Sales). Approving the booking review gives the go-ahead for its hotels at the same time (all ticked); unticking holds one and needs a reason (Sales and Manager see it; Purchase sees only "on hold"). Before approval the per-hotel button is disabled ("Approve the booking first…"); on a returned booking: "The booking is back with Sales…". Log `{ serviceId: { at, by, reason } }`.
- **Company money at go-ahead** = committed hotel cost minus available customer funds (Stage 3 definition). Up to ₹50,000 Accounts approves it with the go-ahead and a funding row is created (approved by Accounts). Above ₹50,000 that hotel's box is disabled ("company money above ₹50,000 needs the branch Manager first") until a Manager-approved funding row exists for that service; the other hotels still go ahead.
- Saving billing details after approval puts the review back to waiting and cancels unused go-aheads (Purchase is told).
- Times as "27 Oct 2026, 04:03 pm IST"; money with paise.
- Receipt numbers: the preview shows `RC-26-0115`; live uses `R-2026-27-000115`. Keep the live format in the build.
- Verifying a receipt does not change instalments in the preview; in the build, dues must read verified receipts and checked splits (5.8).
- Cash limits in the preview: ₹1,99,999 per payer per day and per trip (money rules version 1, invented values).
- Not built: "Record a correction" for a receipt rejected as "details entered wrongly" (live has the full form).

### 5.8 Accounts money: dues, supplier payments, invoices, funding, refunds, Tally (`notes/money.md`)

- **Dues:** every open instalment (`instalments[] { deal, label, due, amount, paid, status: paid | due | overdue }`) with ageing (due in N days / due today / N days overdue / over 30 days / on hold for cancellation); still due counts only verified money; follow-up owner = the Deal's Sales owner; "Remind" sends a staff notice to Sales (no customer message); "Branch Manager told" once 3 days overdue. Tabs: Overdue, Due in 7 days, All open, Paid, Trip closure.
- **Splitting a customer transfer:** one verified transfer split across instalments of one or several bookings; total cannot exceed the transfer; the rest stays unallocated. A different Accounts person approves the split; only then do dues change. A split touching another branch's booking also needs the Manager of the branch that received the money (recommended; not shown, all invented bookings are Jodhpur except the Approvals example).
- **Supplier payment routing (DEC-24):** add up every non-returned request to the same supplier on the same Deal, including this one. Total ≤ ₹50,000 → Accounts approves (status requested); above → branch Manager (status waiting_manager), even when this part is small. Exactly ₹50,000 stays with Accounts. Example: SP-26-0029 ₹13,200 goes to the Manager because it counts with SP-26-0030 (₹69,450 in total to Arabian Nights DMC on BX-38390).
- **No automatic payouts:** Accounts records each payment after the money moved: paid from (company account), amount equal to the approved amount (a part payment is its own request), date, unique bank reference, proof file. A different Accounts person verifies. "Not in the bank statement" sends it back to To pay with the note, keeping history. Supplier with changed bank details → On hold.
- A payment paid from company funding cannot be approved before that funding is approved.
- **Supplier invoices:** check originals and credit notes against Purchase cost and payments (matches / above / below / not paid yet); credit notes against the supplier recovery. Accept, or return to Purchase with a reason. Accounts may upload an original the supplier sent straight to Accounts; a different Accounts person accepts it. The uploader never accepts their own upload.
- **Customer documents:** `documents[] { id (= number), deal, kind: Invoice | Advance Invoice | Hotel voucher, amount, service?, date, status: draft | waiting_accounts | approved | sent, createdBy, approvedBy, sentBy }`. Maker ≠ approver. Mark as sent records how, to whom and the date (staff send it themselves). An Advance Invoice only against a verified receipt; a voucher only for a stay with a confirmation number, and it never shows prices. Invoice and Advance Invoice are refused to anyone without the selling-price capability; a voucher can be seen by anyone on the Deal.
- **Document layout:** A4 in the live quotation document style: brand header, number, date, booking; Bill To (business: GSTIN, contact); trip; one line per service (flight and visa lines from 5.6); total in figures and words; payments received; balance due; "Not a tax invoice. The tax invoice is issued from Tally."; legal footer. Company identity line as the live quotation footer (Holiday Chacha Pvt Ltd, Jodhpur; from the live company identity fixtures). In the preview, invoice lines share the selling price across services in proportion to Sales' cost estimates (rounded to ₹100, last line takes the rest); the build should use a stored per-service price instead (question 10). The build should render the same HTML to PDF on the server, as the live quotation PDF does (the preview's browser PDF uses Helvetica and "Rs").
- **Company funding:** `funding[] { id, deal, service, amount, reason, requestedBy, at, status: requested | waiting_manager | approved | refused | recovered, approvedBy, recoverFrom }`. ≤ ₹50,000 Accounts approves, above the Manager. "Mark recovered" only once a verified receipt (or checked split) exists on that Deal after the funding date; no automatic offset.
- **Refunds and recoveries:** `refunds[] { id, deal, kind: Customer refund | Supplier recovery | …, party, amount, status: requested | approved | paid | verified, note, paidBy, bankRef, proof }`. Recorded after the money moved; a different person verifies. A cancellation where the customer owes money: after the Manager approves, Accounts either adds a "Cancellation charges" instalment (Sales follows up) or asks the Manager for a write-off with a reason.
- **Tally export:** month picker. Only verified receipts, accepted supplier bills and credit notes, verified supplier payments and verified refunds and recoveries. Items not yet verified or accepted are listed as left out, never included. Columns: Tally voucher type, date, number, debit ledger, credit ledger, amount, narration; totals per type. Download = `tally-pack-<branch>-YYYY-MM.csv`, UTF-8 with BOM, cells starting with = + - @ escaped. "Mark as exported" records who and when; exported rows are never exported again. Ledger names in the preview are invented; the real Tally ledger list and a sample import are needed from Accounts (CSV first, Tally XML to be decided).
- **Closure:** Travelled → Closed only by Accounts, only with all 5 checks done (all receipts verified, nothing still due, every supplier payment verified, every supplier invoice in and checked, no open refund or recovery). Each item links to where to fix it. Sets closed by and closed at, notice to Sales and Manager. Closing posts nothing.

### 5.9 Numbering

- **Agreed in the preview (question 4):** Invoice `HC/JDH/26-27/0001`, Advance Invoice `HC/JDH/ADV/26-27/0001`: per branch and financial year, next = highest existing + 1, given when the document is created. Hotel voucher `VCH-<Deal digits>-NN` (for example VCH-38412-01).
- **Preview ids only, format not decided:** supplier payment `SP-26-0031`, funding `F-26-007`, refund `RF-26-004`, write-off `WO-26-003`, supplier invoice `SI-0019`, receipt `RC-26-0115` (keep live `R-2026-27-000115`), reported payment `PR-0042`, quotation `Q-2610-014`, itinerary `IT-0031`, referral draft `TD-318`.
- Delhi and Ahmedabad documents need their GSTINs before they can be issued.

### 5.10 Manager: approvals, escalations, reports (`notes/manager-settings.md`)

- **Approvals inbox:** looks like the live To check queue; one section per kind; Review opens a drawer with the facts, notes, "Note for the people involved", Approve and "Return to <name>". Return needs a reason of 10 to 500 characters (refusal keeps the typed text and moves focus to the field). Every decision sends a staff notice and is listed under Decided.
- Groups: supplier payments above ₹50,000 (counted total shown); company funding above ₹50,000; costs above budget (approval written on the cost version, same as the live Purchase button); supplier bank details (approve → bank approved, supplier verified, on-hold payments released; drawer warns to call the supplier on a known number); cancellations, refunds and write-offs (`writeOffs[]`); money split across branches (`splits[]`; each branch's Accounts then records its part).
- A Manager's own request (for example WO-26-003) shows "Your own request" with no Approve button; recommended approver: the Super Admin.
- **Escalations** (rules from Settings, Reminders): instalments 3+ days overdue (Remind the Sales owner); bookings waiting for Accounts 1+ day (Remind Accounts); tasks not taken (Give to someone); tasks in progress with no update for 3+ days ("Reassign task", live wording "Moves the task to another colleague. Offers, costs and files stay.", reason required).
- **Reports (6):** Sales pipeline (selling price column needs seeSellingPrice), Collections and dues (seeCustomerPayments), Supplier payables (seeSupplierCost), Booking profit (seeMargin; cost marked "estimate" until every service has a cost), Purchase savings (seeSupplierCost; question 5), Bills and documents (customer amounts need seeSellingPrice, supplier amounts seeSupplierCost). Filters in one row (period, branch, salesperson or done by, status or kind), stat cards, one-colour bar list with a table below, totals footer. Without the capability: lock line on the card, "Not shown for your role" on the page, export refused. **Export to Excel** = CSV (UTF-8 with BOM) of the same rows and columns as on screen; first line names the report, company, date and exporter. Purchase, Flight and Visa cannot open reports. Super Admin has no money capability, so 4 of 6 are locked (recommended: keep; they can get "See prices and margin" extra access with a reason).

### 5.11 Settings (`notes/manager-settings.md`)

- **Big switches:** Real bookings, Supplier confirmation (Features) and Bank transfer, UPI, Cash, Cheque (Money rules) get the live Change → reason → Review → Confirm flow. Only a Super Admin signed in with two-step sign-in. Each change writes the live audit line ("Last changed on … by <name>: switched on. Reason: "…""), a Change history list and a staff notice to every department. Recommended: no second Super Admin review for the pilot.
- **Supplier confirmation safety checks** (shown on the row and in the review; Confirm disabled if one fails): Accounts go-ahead built and on; a Jodhpur Branch Manager with two-step sign-in (computed from the staff list); active Purchase staff; 2 Accounts approvers; a Supabase daily backup in the last day. The review says a confirmed supplier cannot be undone.
- **E-mails:** 5 staff reminder templates and 2 supplier templates (rate request, booking request); no customer messages. Edit in a drawer (subject, message with placeholders, send yes/no, reason); "Send a test to me". Delivery health: sent, delivered, failed in 7 days; sender and domain verification; recent e-mails. Real sending needs the e-mail sender domain verified by the owner.
- **Reminders:** 7 rules, each On/Off + number + reason → review → confirm: instalment due soon (3 days), overdue (from 1 day), escalate overdue to the Manager (after 3 days), booking waiting for Accounts (1 day), task not taken (4 hours), stuck task (3 days), supplier invoice missing (2 days after the trip). Changing the overdue escalation rule changes the Approvals escalation list at once.
- **System health:** adds Backups and E-mail alert lines.
- **People and access, Extra access tables:** wrap in the live `.table-scroll` region so the page never scrolls sideways at 375 px (live overflows to about 1,074 px). Recommended for the live CRM too.
- Invented content to replace with real values: company PAN, CIN and GSTINs, money rules values, Bitrix portal name and pipeline counts, extra Super Admins and invited staff.

### 5.12 Other undecided details (built with the recommended answer; confirm with the owner or lead)

1. Accounts sees no Deals in the Deals list (live empty state) and opens Deals from its queues and notices. Recommended: keep.
2. Purchase enters hotel, cab and activity cancellation charges; Flight enters airline charges on its own task. The preview lets Purchase enter all.
3. Purchase never sees funding reasons; reasons should name the supplier deadline, not customer money.
4. A payment request always needs the supplier's proforma. Recommended: yes.
5. Purchase tasks list Status column: give it a minimum width later (kept as live now).
6. Flight may mark done while its payment request waits for the Manager. Recommended: yes (question 11).
7. When an accepted quotation's Deal is still waiting in Bitrix, no new reminder; the Home row "Accepted quotations to link to a deal" covers it.
8. Referral drafts: switch On after the owner tries TD-318; this needs a separate owner APPROVE.
9. Menu counts on live items such as To check: recommended no for now.
10. Super Admin notices (Bitrix sync, backups): recommended later.
11. Cross-branch split approver: the Manager of the branch that received the money.
12. Escalation thresholds (3 days overdue, 1 day waiting for Accounts, 4 hours not taken, 3 days stuck): as built, editable in Reminders.
13. Payment-mode switch changes: no second Super Admin review for the pilot; revisit for Delhi and Ahmedabad.
14. Reported payments and department costs stay off the To check tabs (as live); reached from Home and their own pages.

### 5.13 Not built in the preview (gaps the agents listed)

- No real saving, sending, uploading or server checks; every rule above runs in memory only.
- File uploads keep only the file name (ID proofs, flight screenshots, e-tickets, proofs, invoices).
- Book now card on the Deal's Services and tasks tab; Deals list search box.
- New booking version and fresh acceptance for a change after booking (the preview records a note).
- "Record a correction" for a receipt rejected as entered wrongly.
- A split that touches another branch's booking (only shown as one Approvals example).
- Real PDFs (browser-made simple PDF), real Tally ledger names, real e-mail delivery figures.
- Automatic ticket reading (later).

---

## 6. Postponed and dropped

| Item | Decision | What the preview does instead |
|---|---|---|
| **Customer messages** (e-mail, WhatsApp to customers) | Postponed | Staff download or print the quotation, itinerary, Invoice or voucher and send it themselves. "Mark as shared" (quotations) and "Mark as sent" (documents) record how, to whom and when. All reminders and notices are for staff only. The Home note says so. |
| **Trains** | Postponed | Not in the CRM. The Home note says train bookings are not in the CRM yet. |
| **Website enquiries** | Dropped | Bitrix owns Leads and Deals; the CRM only reads them. |
| **Minimum advance** | Dropped | Work starts when the Deal reaches "Won - Payment Received" in Bitrix. Payment plan instalments are tracked as customer dues; when a hotel must be paid before the customer's money arrives, Purchase asks for company funding. |
| **Agent portal** | Dropped | Nothing. |
| Automatic ticket reading | Later, optional | Flight types the PNR and uploads the e-ticket. |

---

## 7. 21st.dev record

The standing rules require 21st.dev for every new pattern. Every call, with short generic queries and no customer data, is recorded in `build/notes/21st-*.md`. In total 22 searches; no component code was copied. Every adopted idea was rebuilt from existing live CRM markup.

| Area | Query | What came back | Adopted? |
|---|---|---|---|
| Shell | `notification list` | Notification List, Notification Panel (filter by kind, "seen" vs "dealt with"), others | Idea only: filter chips by kind and a separate Read / Unread word on Notices |
| Shell | `role switcher` | Only on/off switches | No: "View as" reuses the live account-panel rows |
| Sales | `status stepper` | Several steppers (done / now / not yet) | Idea only: trip status steps as a plain list with live icons and words |
| Sales | `payment schedule` | Pricing, booking, Invoice History Table | Idea only: dues rows built with the live list table and status badge |
| Book now, quotations | none | No new pattern needed (all live) | The approved Book now form keeps its five 21st.dev parts from 26 October |
| Purchase | `email compose` | Sign-up and account forms | No: live drawer and form fields |
| Purchase | `payment request` | Card checkout forms | No: wrong job, and they collect card data |
| Purchase | `approval routing` | AI approval cards | No: live info notice for the routing line |
| Purchase | `invoice upload` | File uploads, Invoice History Table | Idea only: one row per document with a status badge, live file rows |
| Flight and Visa | `mark complete` | Unrelated text and map parts | No |
| Flight and Visa | `completion checklist` | Several checklists | Idea only: uses the live "Before you submit" checklist markup |
| Flight and Visa | `confirm dialog` | Alert and confirm dialogs | Idea only: live dialog |
| Accounts | none | No new pattern needed (all live patterns reused) | Not applicable |
| Accounts money | `invoice` | Invoice tables with line items and totals | Partly: line items with a total row shaped the A4 Invoice, restyled to the live document style |
| Accounts money | `payment queue` | Message queue, banners | No: live Department costs review cards |
| Accounts money | `ageing` | Nothing | No result: ageing is a live status pill |
| Accounts money | `aging report` | Unrelated reports | No |
| Accounts money | `export` | Share menu, export checkboxes | No: live select, notices and table |
| Accounts money | `approval queue` | AI approval cards | No |
| Accounts money | `checklist` | Several checklists | No new pattern: trip closure reuses the live checklist |
| Manager | `approval inbox` | Access Request Inbox and others | Idea only: one section per request kind; live To check queue markup |
| Manager | `report table` | Report and records tables | Idea only: totals footer as a live card footer line |
| Manager | `settings toggle` | Toggle switches | No: live switches always go through reason, review, confirm |
| Manager | `bar list` | Lists | No: plain one-colour bar list from live colours |

---

## 8. How the preview was checked

**Automated crawl (27 October 2026):** every reachable page, for all 8 roles, at 1280 px and 375 px wide:

- 0 script errors;
- 0 sideways scroll;
- 0 links to pages the role cannot open;
- no selling price on any Purchase, Flight or Visa screen;
- no "synthetic", "demo" or "preview" wording on the screens.

**Checks the area agents recorded in their notes:**

- Shell: class strings checked one by one against the live captures; all 89 icons in the captures checked byte for byte against the live icon set.
- Book now: computed styles of every element on steps 1, 2 and 3, the hotel and flight drawers and the "Correct trip details" dialog match the approved form at 1280 px and 375 px; page geometry matches at 1280 px.
- Sales: a sweep of every role, Deal and tab found no selling price, receipt or payment report text for Purchase, Flight and Visa.
- Manager and Settings: tested in a separate headless browser for Manager, Super Admin, Accounts and Accounts checker at 1280 and 375 px: no console errors, no sideways page scroll.

**Not checked:**

- No screen reader test.
- The notes do not record a test at 200% zoom or with reduced motion.
- The visual comparison with the live CRM was done by each agent for its own area, plus spot checks by the lead. Not every screen was compared pixel for pixel.
- Nothing was tested against the real database, Bitrix, e-mail or PDF services; the rules run only inside the page.
