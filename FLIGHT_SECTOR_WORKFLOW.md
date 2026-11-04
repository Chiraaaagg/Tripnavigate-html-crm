# Flight sector workflow: plan and progress

Date: 3 November 2026
Source request: `flight_changes.md` (Flight invoice, alternative sector and sector confirmation changes).
Scope: Flight module only: `build/src/50-flight-visa.js` and `build/src/50-flight.css`. No other department file is edited.
Status: **DONE.** Built and tested live in Chrome on 3 November 2026. Nothing was committed or pushed (as asked).

Rebuild command (Windows): `cd build` then `PYTHONUTF8=1 python assemble.py`.
Open it: serve the project folder with `python -m http.server 4180 --bind 127.0.0.1`, then go to
`http://127.0.0.1:4180/full-crm-preview.html?role=flight#/app/flight/s-412-f?tab=work`.

---

## 1. Plan

### Corrections from you (3 Nov 2026, second round): plan

| # | Your correction | What I will change |
|---|---|---|
| C1 | Keep Sales approval for alternative flights. | A saved alternative is **Waiting for Sales approval**. It shows in Flight sector confirmation at once but cannot be confirmed until the Sales owner approves it on the Deal page (Services tab: Approve, or Reject with a reason). If it is rejected, its passengers go back to their previous sector. "Mark flight done" is blocked while an alternative waits. The "Sales approval" step comes back on the progress bar. |
| C2 | Only the alternative loses fares; bring fares back. | Each passenger ticket row in Flight sector confirmation gets a **Fare (INR)** box, required to confirm. "+ Add passenger" copies the fare when the passenger type (adult/child/infant) is the same. The total actual fare and the approved budget are shown again. |
| C3 | Keeping a confirmed passenger locked is right. | No change. |
| C4 | Work on dummy data for now. | No backend notes. Everything stays in the preview's dummy data. |

Decisions D1 (no Sales approval), D6 (no fares) and D7 (backend) below are **replaced** by C1, C2 and C4.

### Decisions I made (the request did not say)

| # | Question | What I chose | Why |
|---|---|---|---|
| D1 | Does an alternative still need Sales approval? | **No.** Saving an alternative creates a "Pending confirmation" sector straight away. Sales gets a **notice** and sees the alternatives on the Deal page (read only). | The request's workflow (section 11, steps 1–16) goes straight from "save alternative" to "confirm" with no approval step. The old approval needed fares, and the request removes fares from the alternative. |
| D2 | Where does inline editing happen? | Inside the collapsible **Alternative flight sectors** card. Each original sector row has an **Alternate** button. Clicking it adds an editable row right under that sector, in the same table, with **Save** on the right. | The request says the section is collapsed by default and you "expand the section, select a sector, and edit its alternative details inline" (step 3). |
| D3 | The passenger selection component | The Book now "Passengers flying" chips (All N + one chip per passenger, "x of N chosen") are re-used as a small drop-down. | That is the existing component used when choosing which passengers take a flight. It lives inside the Book now file, so the Flight file uses the same pattern and look. |
| D4 | Which ticket fields are required to confirm a passenger? | CRS type, CRS PNR (not needed when CRS type is "Airline direct"), Airline PNR (5–8 letters/numbers), ticket number (unique on the task). | The request asks for these fields and says "validate required ticket information". |
| D5 | Can a confirmed passenger be moved to a new alternative? | **No.** They are shown as locked ("ticket confirmed") in the passenger choice. | "Do not overwrite previously confirmed ticket records." |
| D6 | Fares | Removed from the alternative and from confirmation. The Costs card still records what was paid. | The request removes the Fare field and lists only CRS / PNR / ticket fields for confirmation. |
| D7 | "Backend" checks | This project is a clickable HTML preview: there is no server or database. Data lives in memory (`TN.DATA`). The "Mark flight done" action checks everything again before it saves (like a backend would), so a click that skips the page's checks still cannot finish an incomplete task. | No server exists in this project. |

### Steps

1. Remove the "Flight lines for the invoice" card from the Work tab (data is not deleted; Sales documents and the Accounts invoice still read the confirmed sectors).
2. New data per flight task: `flightSectors` (original, alternative and added sectors, each with its passengers and passenger-wise ticket rows).
3. Alternative flight sectors card: collapsed by default, inline editing, passenger choice, number of persons, remark, Save. Saving keeps the original and creates the confirmation sector.
4. Flight sector confirmation card: checkbox per sector, passenger sub-rows, "+" to add a passenger (copies CRS/PNR, ticket number +1), "+ Add Sector", "Confirm Selected Sectors", passenger and sector statuses.
5. Mark flight done: every passenger confirmed on every active sector + e-tickets. Clear list of who is still pending.
6. Update the progress bar, task status words, the Sales Deal card, and what other modules read (`TN.flightUI`).
7. Remove the old Confirm and Alternate popups.
8. Rebuild and test in Chrome.

---

## 2. What changed, how, and why

All code is in `build/src/50-flight-visa.js` (JS) and `build/src/50-flight.css` (styles). `full-crm-preview.html` was rebuilt from them. Line numbers are from 3 Nov 2026.

### 2.1 Flight lines removed from the invoice view (request section 1)

- **What:** the "Flight lines for the invoice" card is no longer on the Flight task's Work tab.
- **How:** `flightTask` (line 1126) no longer adds it; the old `flightInvoiceLines` function is deleted.
- **Why:** the request asks for it to be removed. **No data was deleted.** The Sales Deal documents list and the Accounts invoice line text still read the confirmed sectors through `TN.flightUI.confirmedSegments` (line 548), which now reads the new passenger-wise records.

### 2.2 New data: one record per sector (request sections 2, 4, 10)

- **What:** each flight task now has `flightSectors`. Each sector has a kind (**original** from the booking, **alternative** linked to its original by `parent`, or **added**), its flight details, its passengers, and **passenger-wise ticket rows** (CRS type, CRS PNR, Airline PNR, ticket number, Pending/Confirmed, who and when).
- **How:** `sectorsOf` (line 514) builds the original sectors from the booking the first time a task is opened. `activePax` (line 527) works out who is still on each sector: a passenger moved to a newer alternative leaves the older sector, and everyone else stays.
- **Why:** the request needs sectors, alternatives and passengers kept as connected records, with the original never overwritten. One list with links (`parent`) does that, and each passenger is on exactly one active sector per route.
- The two completed preview tasks (s-390-f, s-301-f) were given confirmed passenger-wise tickets (invented numbers), so their Done view shows real-looking data.

### 2.3 Alternative flight sectors (request section 2)

- **What:** a new card, **collapsed by default**. Clicking its header opens or closes it. Inside, each original sector has an **Alternate** button. Clicking it adds an editable row under that sector in the same table: Airline, Flight no., From, To, Class, Date, Departure, Arrival, **Passengers** (drop-down), **No. of persons** (counts itself), **Remark**, and **Save** on the right. The Fare field is gone.
- **How:** `alternativeCard` (line 1026), `paxPicker` (line 1016), action `fv-alt-save` (line 1483). Typed values are kept in memory as you type, so closing and reopening the card, or a refusal, never loses them.
- **On Save:**
  - It checks: the flight details are complete, at least one detail differs from the original, at least one passenger is chosen, and a remark is written.
  - It creates a new alternative sector (named `02-A`, `02-B`, …). **The original stays** for the passengers not chosen.
  - The chosen passengers move to the alternative. Their *pending* rows on the old sector are removed; *confirmed* rows are never touched.
  - The alternative appears straight away in Flight sector confirmation as **Pending confirmation**.
  - It writes a History entry and sends a notice to the Sales owner.
  - Clicking Save twice cannot make two sectors: the draft is gone after the first save.
- **Why:** this is what request section 2 asks for. A passenger who already has a confirmed ticket cannot be moved; they show as "(ticket confirmed)" and cannot be ticked (decision D5).

### 2.4 Flight sector confirmation (request sections 3, 5, 6, 7, 8)

- **What:** a separate card after the Alternative card. It lists every sector (original, alternative, added), each with:
  - a **checkbox** to select the sector;
  - Type (Original / Alternative of 02 / Added), the flight details, and a status: **Pending**, **Partially confirmed** or **Confirmed** (or "Replaced by alternative" when everyone moved);
  - a button showing "x of y confirmed" that **opens or closes the passenger sub-rows**.
- **Passenger sub-rows:** a checkbox, a **Passenger** drop-down (passengers already used on that sector are greyed out, so nobody can be added twice), **CRS type** (type or pick: Amadeus, Galileo, Sabre, Airline direct, Other), **CRS PNR**, **Airline PNR**, **Ticket number**, a Pending/Confirmed badge, and Remove (pending rows only).
- **"+ Add passenger":** adds the next passenger on that sector. It copies CRS type, CRS PNR and Airline PNR from the row above, and the **ticket number goes up by 1** with the same format (`176-2410399909` → `176-2410399910`). Everything stays editable. Function `nextTicket` (line 508).
- **"+ Add Sector":** adds an editable row at the bottom (flight details + passenger choice). Saving creates an **Added** sector numbered after the originals (e.g. `03`). Existing sectors are not changed. Action `fv-add-save` (line 1543).
- **"Confirm Selected Sectors":** action `fv-confirm-selected` (line 1555).
  - Only the **ticked passengers** inside the **ticked sectors** are confirmed. Ticking a sector ticks its pending passengers (you can untick any). Ticking a passenger ticks its sector.
  - It checks each ticked passenger: CRS type filled in; CRS PNR of 5–8 letters/numbers (not needed for "Airline direct"); Airline PNR of 5–8 letters/numbers; ticket number in numbers and dashes, not already used by **another** passenger; no passenger twice on one sector.
  - If anything is wrong, **nothing is confirmed**. A red box lists every problem by passenger and sector, and everything typed stays.
  - Confirmed rows lock. Passengers not ticked stay Pending and can be confirmed later. Sector statuses update on their own.
- **Why:** this is request sections 3, 5, 6, 7 and 8. The old "Confirm" buttons and popup were removed from the sector table.

### 2.5 Mark flight done (request section 9)

- **What:** under the e-ticket upload there is now a live list of what is still missing, naming each **passenger and sector**, for example "Rohan Agarwal on sector 02 (GOX → JDH)". **Mark flight done is greyed out** until every passenger is confirmed on every active sector they are on, and an e-ticket is attached.
- **How:** `flightChecklist` (line 661). A passenger moved to an alternative only needs the alternative; passengers left on the original still need the original. The confirm step `fv-done-confirm` (line 1663) checks again before saving, so a click that skips the page's checks still cannot finish an incomplete task (decision D7).
- **Why:** request section 9. Partial confirmations are saved without completing the task.

### 2.6 Other places updated so the module stays consistent

- **Progress bar** (`flightProgress`, line 949): Take task → **Confirm tickets** (shows e.g. "3 of 7") → Attach e-tickets → Flight done. The "Sales approval" step is gone because alternatives no longer wait for Sales (D1).
- **Task status words** (badge and the Sales Deal page): "In progress · 3 of 7 tickets confirmed", "In progress · all tickets confirmed", "Done · ticket issued".
- **Sales Deal page → Services** (`salesReview`, line 625): a read-only "Flight alternatives" table showing old flight → new flight, route, date and time, passengers, remark and status. The old Approve/Reject buttons are not shown any more.
- **Mark-done popup** lists the confirmed sectors, all Airline PNRs, and the number of confirmed passenger tickets.
- **Styles** (`50-flight.css`): new `fv-` classes for the tables, inputs, passenger chips (same look as Book now) and open/close arrows. They use the app's colour variables. They are needed because `live.css` is pre-built and has no classes for these new pieces.

### 2.7 Removed

The Confirm popup, the Alternate popup (with its fares), the old sector table with Confirm buttons, the invoice-lines card, and `alternateBlock`. Older code for the earlier "availability / proposal" design is still in the file but unused, as before.

---

## 3. Tests (live in Chrome, `http://127.0.0.1:4180/full-crm-preview.html`)

Flight role, task s-412-f (3 passengers, 2 sectors):

1. The Alternative card is **closed** when the page opens. ✅
2. Opened it → Alternate on sector 02 → changed the flight to 6E 2210, 19:05–21:40 → Save with no remark → refused with "Enter a remark…", typed values still there. ✅
3. Chose only Anita (unticked All, ticked Anita) → No. of persons changed to 1 at once. ✅
4. Typed a remark, **closed and reopened** the card → remark still there. Saved → row **02-A** "Alternative of 02", Anita, Pending confirmation. Sector 02 kept for Rohan and Vihaan. ✅
5. The Mark-done list then said "Anita Agarwal on sector 02-A", **not** on sector 02. ✅
6. Sector 01: filled Rohan's row → **+ Add passenger** → new row was Anita, with CRS/PNR copied and ticket `176-2410399909` → `…910`. Rohan was greyed out in that row's drop-down. ✅
7. Confirm with nothing ticked → "Tick at least one sector to confirm." ✅
8. Ticked only Rohan → sector 01 **Partially confirmed (1 of 3)**, progress bar "1 of 6". ✅
9. Gave Anita Rohan's ticket number → refused: "ticket number … already belongs to Rohan Agarwal". Nothing confirmed. ✅
10. **+ Add Sector** with nothing filled in → refused with 3 clear messages. Filled Air India AI 512 GOX → BOM for Rohan → sector **03 Added**. ✅
11. Before confirming everything, Mark flight done was **greyed out**. ✅
12. Ticked all 4 sectors → Confirm Selected Sectors → all 6 pending tickets confirmed at once ("Airline direct" row accepted without a CRS PNR). ✅
13. Attached a PDF e-ticket → Mark flight done enabled → popup listed sectors 01, 02, 02-A, 03, the PNRs and "7 confirmed" → task **Done · ticket issued**, every step ticked, no inputs left. ✅

Other checks:

- s-390-f (done): 8 of 8 passenger tickets shown, read only. Invoice-lines card is gone. ✅
- Sales role, Deal BX-38412 → Services: "Flight alternatives" table shows 02-A (6E 6143 → 6E 2210, Anita, remark). ✅
- Manager role: sees both cards read only (no inputs or buttons). ✅
- 375 px phone width: no sideways page scroll (Flight work tab, done task, Manager, Sales Deal). The wide tables scroll inside their own box. ✅
- Desktop: no sideways page scroll. No console errors. ✅

**Fixed during testing:**
- The Alternative card showed open at first, because the layout class `flex` beat the `hidden` attribute. Fixed with a `.fv-body[hidden]` rule.
- The page was 15 px too wide on desktop, because screen-reader-only text escaped the table's scroll box. Fixed with `position: relative` on `.fv-wrap`. This was the same cause as the Session 3 fix.

---

## 4. Things to check with you

1. **D1, Sales approval:** alternatives no longer wait for Sales approval; Sales only gets a notice. If you still want approval, it can be added as a step before the alternative can be confirmed.
2. **Fares:** no fares are collected in the Work tab any more (the request removed them). The Costs card still records what was paid.
3. **Backend:** this project has no server or database. The checks run in the page and again on "Mark flight done". The real CRM build will need the same checks in its API.

---

## 5. Second round (3 Nov 2026): your corrections carried out

You said: (1) keep Sales approval for alternative flights, (2) only the alternative loses fares, so bring fares back, (3) locking a confirmed passenger is right, (4) work on dummy data for now. Sections 2.3, 2.5, 2.6 and 4 above described the first round. **This section replaces them where they differ.** Nothing was committed or pushed.

### 5.1 Sales approval kept for alternatives (C1)

- **What:**
  - Saving an alternative now sends it to the Deal's Sales owner. Its status is **Waiting for Sales approval** (hourglass badge), and the owner gets a notice.
  - It shows in Flight sector confirmation at once. Flight can fill in its ticket rows, but **it cannot be ticked or confirmed until Sales approves**.
  - On the Deal page (Services tab), the owning Sales Executive sees **Approve** and **Reject** on each waiting alternative. Reject needs a reason. Other Sales people see "Only the owning Sales Executive can decide."
  - **Approved:** the status becomes Pending confirmation and Flight confirms it as normal.
  - **Rejected:** the status becomes **Rejected by Sales** and the reason is shown to Flight. The passengers **go back to their sector**, which gets a ticket row again. Flight can send a new alternative (named 02-B, 02-C, …).
  - While an alternative waits for Sales, its passengers cannot be put in another alternative ("waiting for Sales on 02-A").
  - "Mark flight done" stays blocked while any alternative waits. The message names it: "Ritika Sharma (Sales) still has to decide alternative 02-A".
  - The **Sales approval** step is back on the progress bar (shown when an alternative was sent), and the task status says "In progress · alternative waiting for Sales approval".
- **How:** each alternative has `approval: 'pending' | 'approved' | 'rejected'`, plus who decided, when, and the rejection reason. A rejected alternative holds no passengers (`altsOf`, line 530; `sectorState`, line 545). New actions `fv-alt-decide` (line 1536) and `decideAlternative` (line 1547). The Sales card is `salesReview` (line 641), the checklist is `flightChecklist` (line 681), and the progress bar is `flightProgress` (line 971). Save is `fv-alt-save` (line 1507).
- **Why:** you asked to keep the existing Sales approval rule. The alternative still has **no fares** (as the request says), so Sales approves the flight change itself.

### 5.2 Fares back in confirmation (C2)

- **What:**
  - Each passenger ticket row in Flight sector confirmation has a **Fare (INR)** box, between Ticket number and Status. It is **required** to confirm ("Rohan Agarwal on sector 01: enter the adult fare in rupees.").
  - **+ Add passenger** copies the fare from the row above **only when the passenger type is the same** (adult → adult). A child or infant row starts empty.
  - Under the table: **Total actual fare (confirmed tickets)** and the **Approved budget**, with the note that the actual fare does not change the budget, the selling price or payment approvals (as before).
  - The Done view shows **Total actual fare** again.
  - The **Alternative row still has no fare.**
- **How:** ticket rows have `fare` (`newRow`, line 515). The total is `actualFare` (line 567). The fare is checked in `fv-confirm-selected` (line 1605).
- **Dummy data:** the two completed tasks have fares that add up to the fare cost already recorded on them. s-390-f: adults ₹16,800, children ₹13,610 per sector = ₹1,21,640. s-301-f: ₹18,850 per passenger per sector = ₹75,400.

### 5.3 Confirmed passengers stay locked (C3)

No change.

### 5.4 Dummy data only (C4)

No backend notes. All data is the preview's dummy data in memory, so it resets when the page reloads.

### 5.5 Also fixed: "₹48,000.00.00"

Every money figure on the Flight and Visa pages showed ".00" twice. That was an old bug: the file's money helper added ".00" to a formatter that already adds it. Fixed in one place (line 140). Budgets now read "₹48,000.00".

### 5.6 Tests (live in Chrome)

1. The Alternative row has no Fare field (fields: airline, flight no., from, to, class, dates and times, remark). ✅
2. Flight saved alternative 02-A for Anita → **Waiting for Sales approval**; no tick box on it; progress bar "Sales approval · Waiting"; status "alternative waiting for Sales approval". ✅
3. A new alternative on sector 02 → Anita locked (waiting for Sales). ✅
4. Confirm without a fare → "Rohan Agarwal on sector 01: enter the adult fare in rupees." ✅
5. + Add passenger: Anita (adult) got Rohan's fare ₹8,450; Vihaan (child) started empty. ✅
6. Sales role, Deal BX-38412 → "Flight alternatives · 1 waiting for approval" with Approve / Reject. Reject with no reason → refused. With a reason → **Rejected by Sales**. Flight sees "Sales: Too late for the airport transfer", and sector 02 has all 3 passengers again. Both notices sent. ✅
7. Flight sent 02-B for Anita (she could be chosen again) → Sales approved → 02-B Pending confirmation. ✅
8. Filled all rows (adult ₹8,450, child ₹6,200) → Confirm Selected Sectors → 6 of 6 → attached an e-ticket → Mark flight done → **Done**, total actual fare ₹46,200 (4 × 8,450 + 2 × 6,200), all 5 progress steps ticked. ✅
9. s-390-f (done): passenger fares shown, total ₹1,21,640.00, approved budget ₹1,28,000.00, no ".00.00" anywhere. ✅
10. 375 px phone width (Flight, Sales Deal, Manager): no sideways scroll. No console errors. ✅
