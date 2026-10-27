# Flight tasks and the Visa and passport desk (Agent E)

File: `build/src/50-flight-visa.js` (no CSS file). Test copy: `python3 -I build/assemble.py flightvisa`, then `build/out/flightvisa.html?role=flight#/app/flight` and `?role=visa#/app/visa`.

Markup copied from the live captures `b4-flight-*`, `b11-flight-task-*`, `b4-visa-*`, `b11-visa-*` and from the live code (`views/flight-views.tsx`, `views/department/*`, `views/b11/department-cost.tsx`, `views/b11/visa-desk.tsx`, `components/ui/progress-checklist.tsx`). Money is shown with paise (`₹43,560.00`) as live does on these screens.

## 1. Pages and roles

| Route | Roles | What it shows |
|---|---|---|
| `#/app/flight` | flight (works), manager (follows: Not taken and All tabs only) | Flight tasks list: Not taken · Mine · All tabs with counts, table Route / Segments / Passengers / Approved budget / Status / Taken by / Deal. Stacks on phones. |
| `#/app/flight/:taskId` | flight, manager | Task page with tabs Details · Work · Files · History. |
| `#/app/visa` | visa (works), manager (follows) | Visa and passport tasks list (card list, live look). |
| `#/app/visa/:taskId` | visa, manager | Task page with tabs Details · Work · Files · History. |

Other roles get the shell's "Page not available". An unknown task id shows the live "Task not available" notice.

## 2. Live today vs pending

### Flight

**Live today**
- List with Not taken / Mine / All.
- Take a task ("Take this task"; it does not issue a ticket).
- Details: flight details, travellers and budget, where the task came from, traveller ID proofs (assignee only; private, every view recorded). Traveller names only for the person who took the task.
- Work: Cost card. Record a cost (Fare / Other cost; Paid by Company / Customer directly / Not yet). A company-paid cost needs how, when, an optional reference (the PNR is typed here today) and the direct-payment proof. Company payment above ₹50,000 per purchase is refused with the live error ("Record it as “Not yet”"), typed values kept. Upload the direct-payment proof. "Send to Accounts" makes an expense record that a different Accounts person accepts or returns; a returned cost shows the reason and can be changed and sent again.
- Files and History tabs (History shows no amounts).

**Pending (to build)**
- **Mark flight done (DEC-59)**, Work tab, card "Finish this flight":
  - Ticket details: airline booking reference (PNR) field and "Upload the e-ticket" (new file kind `e_ticket`).
  - "Before you mark it done" checklist (live ProgressChecklist look): PNR recorded; e-ticket uploaded; fare recorded; every company-paid cost sent to Accounts (none returned, none in draft); every "Not yet" cost has a payment request. Each item jumps to the place to fix it.
  - "Mark flight done": refused with the live error summary while anything is missing; otherwise a confirm dialog (route, PNR, passengers, Deal; who will be told; that it locks).
  - After confirm: status "Done · ticket issued", Next line "Nothing waiting.", internal line with the done time, all edit buttons gone (locked), a success notice on the Work tab, History "Flight marked done · ticket issued", and a notice "Flight ticket issued for <family>: <airline> PNR <PNR>." to Sales and Accounts in `TN.DATA.notices`.
  - In-progress status word changes to "In progress · ticket recorded, not marked done" once the PNR and e-ticket are in.
- **Payment request above ₹50,000**: a "Not yet" cost shows "Raise a payment request" (dialog: Pay to airline/portal, Pay by date, routing line). It adds a record to `TN.DATA.supplierPayments` with `raisedBy: 'flight'`. Routing counts every request for that supplier on that Deal: above ₹50,000 `waiting_manager` (notice to the Manager), else `requested` (notice to Accounts). The cost then shows the request number and its status (e.g. SP-26-0024 "Waiting for the branch Manager").
- **Flight lines for the invoice** (Work tab, after the task is taken): one line per segment with route, flight, date and time, passengers, PNR. No selling price.
- Optional automatic ticket reading: LATER, not built.

### Visa and passport

**Live today**
- List with Not taken / Mine / All.
- Take a task: one application per traveller appears.
- Per traveller: documents (Missing / Received / Checked, one Save per document), upload applicant document or authority outcome document, record the submission (reference required, appointment optional; all documents must be checked first), "Mark waiting for the decision", record the outcome Issued / Refused (needs the authority's outcome document: "A fee receipt or reference never proves issue"), record documents returned, record the customer was informed, withdraw. Progress timeline on the right. "This applicant is closed." when done.
- The task completes itself when every traveller is closed (status "Completed").
- Fees and costs card (Government fee / Service fee / Other cost) as expense records for Accounts; Fee receipt upload card.
- Details (service, who pays the government fee, private documents notice, ID proofs), Files, History.
- Passport numbers are masked as live does (`maskPassportNumber`: `••••4821`).

**Pending (to build)**
- **Visa result notice to Sales**: recording Issued or Refused pushes a notice to the Deal's Sales owner ("Visa result: UAE visa issued for Kabir Bhandari. 3 of 4 issued, 1 still with the authority.") and adds "Visa result sent to <name> (Sales)" to the task History.
- **Visa lines for the invoice** (Work tab): one line per traveller with visa, government fee, service fee and result. Costs only, no selling price.

### Money fences (all roles here)
Flight and Visa see only their own costs, the approved budget and their own payment requests. No selling price, margin, customer receipts or customer payment proof anywhere on these pages (Files tab says so, as live).

## 3. Invented data (added at load time in my file)

- Extra fields on shared services: `segments`, `preferredTime`, `cabin`, `notes`, `passengers` (flights); `visa`, `applicants` (visa); `takenAt`, `createdAt`, `savedAt`, `versionNo`, `doneAt`, `doneBy`.
- `s-412-f` Agarwal, Goa: in progress, PNR K7RW2P, fare ₹43,560 sent to Accounts, seats and meals ₹2,400 returned by Accounts, no e-ticket yet. The mark-done demo: upload an e-ticket, fix the returned cost (₹2,040) and send it, then mark done.
- `s-455-f` Khatri, Kerala: not taken.
- `s-390-f` Bhandari, Dubai: done on 26 Oct 17:42 (matches notice n4), fare ₹1,21,640 "Not yet" with SP-26-0024 waiting for the Manager.
- `s-301-f` Mathur, Singapore: done; fare ₹75,400 paid through **new** request SP-26-0019 (verified, raised by Flight), added to `TN.DATA.supplierPayments`.
- `s-390-v` Bhandari UAE visa, 4 travellers: Suresh issued and documents returned (closed), Anita issued 27 Oct (documents not returned), Kabir (12) waiting for decision, Myra (8) submitted. Government fee ₹22,000 accepted; service fee ₹3,200 returned by Accounts.
- **New service** `s-301-v` Singapore visa for the Mathur couple (completed), also pushed to `BX-38301.services`.
- New shared collections (other agents may read them):
  - `TN.DATA.departmentCosts`: `{ id, task, dept, deal, kind: fare|other|government_fee|service_fee, note?, amount, paidBy: company|customer_direct|not_yet, mode, paidOn, reference, proof (file id), status: draft|submitted|accepted|returned|null, submittedAt, submittedBy, reviewedBy, reviewedAt, returnReason, paymentRequest (SP id) }`. **Agent F**: the Accounts "Department costs" list (`#/app/accounts/expenses`) should list `status: 'submitted'` rows from here and set `accepted` / `returned` + `returnReason` + `reviewedBy` (not the submitter); please use `TN.DATA.departmentCosts = TN.DATA.departmentCosts || []`, never `=` a new array.
  - `TN.DATA.departmentFiles`: `{ id, task, kind, applicant?, name, size, at }`.
  - `TN.DATA.taskHistory[serviceId]`: `[{ title, at, by?, detail? }]`.

## 4. Home rows (`TN.homeRow`, section "What needs you")
- Flight: "Tickets to mark done", "Flight costs returned by Accounts".
- Visa: "Travellers waiting for a visa result", "Visa costs returned by Accounts".
- "Not taken" is not added: the shell's Home already has "… not taken yet, or yours in progress" for each department.

## 5. Build notes for the real CRM

- DEC-59 needs: a flight finish command (`flight_task_finish`) that checks the five conditions above in the database, sets the task done with time and person, writes the history event and the staff notice; a `ticket_reference` (PNR) on the flight task; a new department file kind `e_ticket`. Lock cost changes and file removal on a done flight task.
- Flight payment requests reuse the Stage 6 supplier payment request (`raised_by = flight`), routing counted across Deal and supplier, ₹50,000 limit, Manager above.
- Visa result notice is a staff notice (no customer message), sent on the outcome command, to the Deal's Sales owner.
- Invoice lines read: flight segments, passengers, PNR; visa fees per traveller from the cost entries. Never selling values.

## 6. Open questions (recommended answers built)

1. **What must be filled before "Mark flight done"?** Recommended: PNR, e-ticket file, a fare, every company-paid cost sent to Accounts (none returned), every unpaid fare has a payment request. Accounts acceptance and payment are not required (they are Accounts' work).
2. **If Accounts returns a cost after the flight is done?** Recommended: only that cost line reopens for change and re-send; the task stays done and the ticket details stay locked.
3. **Who can reopen a done flight (ticket change, name correction)?** Recommended: the branch Manager, with a reason; it goes back to In progress and Sales and Accounts get a notice.
4. **Status word once the ticket is recorded but not yet done?** Recommended: "In progress · ticket recorded, not marked done" (live today says "ticket not recorded in the CRM").
5. **Can Flight mark done while the payment request still waits for the Manager?** Recommended: yes (the airline is paid through Accounts later); the request status stays visible on the task.
6. **Passport mask style**: live shows `••••4821`; the lead's brief example was `Z••••4821`. Built as live. Recommended: keep live.
7. **Visa per-traveller fees on the invoice when one fee line covers all travellers**: recommended: split equally per traveller unless the desk records per-traveller fees.
