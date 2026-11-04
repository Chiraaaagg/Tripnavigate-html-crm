# Flight module: change log

Every change made to the project is recorded here, newest at the top: what changed, which file and line, why, and how it was tested.

---

## 4 November 2026 — Session 9b: time drop-down back (24-hour)

Files: `build/src/50-flight-visa.js` (`TIME_LIST`, `fvIn` time branch), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`.
- Every time box in the Alternative section (main table, Add Sector row, passenger tables) has a **drop-down list of 24-hour times every 5 minutes (00:00 … 23:55)**. Picking a time fills the box and the list closes at once (no click elsewhere needed). Typing filters the list ("12" → 12:00 … 12:55), and any time can still be typed ("1035" → 10:35).
- The two time columns are a little wider so the arrow does not cover the time. Remark is still the widest column (about 330 px).

**Tested live in Chrome (s-412-f):** time boxes show the arrow and use the list (288 times, 00:00–23:55); choosing 12:50 stored "12:50"; departure "10:35" fits; no sideways scroll; no console errors ✅.

---

## 4 November 2026 — Session 9a: one date format, 24-hour time, compact Alternative tables

Files: `build/src/50-flight-visa.js` (`dtShort`, `parseDateText`, `parseTimeText`, `fvVal`, `fvIn`, `CLASSES`/`classCell`, `gridCellsB`, `ptypesOf`/`paxCountCells`, `altHeads`, `trashBtn`, `canDeleteSec`, actions `fv-sec-del`, `fv-itin-delrow`, input/change handlers), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
1. **One date format on the Flight screens: "2 Dec 26".** Date boxes are now plain text boxes (the browser's date picker showed "14-11-2026" and could not be changed). Type "2 Dec 26", "2 dec 2026", "2/12/26", "2-12-2026" or "2026-12-02"; it is stored correctly and shown as "2 Dec 26" when you leave the box. Date-and-time stamps are "27 Oct 26 12:39". (The Visa screens keep their own format; the shared History list now uses the short format too.)
2. **24-hour time, no am/pm.** Time boxes are plain text boxes "HH:MM". "1035" → 10:35, "7:05 pm" → 19:05.
3. **No time/date pop-up to click away** any more (it was the browser's picker).
4. **The Passengers box above "Main itinerary" is removed.** Without it: **Alternate** moves all passengers of that flight (passengers with their own table or a confirmed ticket are left out), and **+ Add Sector** in this section applies to every main-table passenger who can move. To change one passenger only, use **Add New Table**.
5. **Adult / Child / Infant columns** (only the types in the booking) show how many passengers of each type are on each row (main table, its Add Sector row, and each passenger table). **Delete icon** (bin) on: rows of a passenger's draft table, and sectors added to the main table that have no confirmed ticket (kept in History as "Deleted"; passengers it took from another flight go back). Booked and alternative flights have no delete. **"Pending" / "Waiting for Sales" / "Confirmed"** are now small compact labels. **Class** shows short forms: Eco, P.Eco, Bus, First (a small list while editing; the full name is stored).
6. **Compact tables, big Remark:** rows 32 px, smaller header text, narrow date/flight/route/time/class/count columns; Remark takes the remaining width (about 370 px on desktop).

**Tested live in Chrome (s-412-f):** headers Select · Date · Flight no. · From · To · Dep time · Arr time · Class · Adult · Child · Remark · Actions; no Passengers box; rows 33 px; Remark 371 px; no sideways scroll ✅. Alternate on 6E 6143: typed "19/11/26", "7:05 pm", "2140", class Business → shown "19 Nov 26", "19:05", "21:40", "Bus"; saved as 2026-11-19 19:05–21:40 Business; counts 2 adults, 1 child ✅. Add New Table → Anita: text boxes, counts 1 adult, bin on each row; Add Sector then bin removed the row ✅; "15 nov 2026" → "15 Nov 26", "1830" → "18:30" ✅; Send → note "Sent to … on 27 Oct 26 12:39" ✅. No Remove buttons; no console errors ✅.

---

## 3 November 2026 — Session 8z: a passenger with their own table leaves the main table; main table collapses

Files: `build/src/50-flight-visa.js` (`hasOwnTable`, `mainPax`, `paxDrop` list, `alternativeCard` main block, action `fv-main-toggle`, create/discard), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
1. **When a new table is made for a passenger, their name is removed from the main (old) table** straight away: the Passengers drop-down (and choosing passengers for an Alternate), the main table's header, and the Sales fare under it. This applies while their table is draft, pending, rejected or approved. **Discard table** puts them back in the main table.
2. **The main table now has its own "Main itinerary" header** (arrow + the names still on it, or "No passengers left"). It **collapses automatically when a new passenger table is made**, and opens from its header. It stays open while one of its rows is being edited. When the last passenger table is discarded it opens again. Add New Table / Add Sector stay visible above it.

**Tested live in Chrome (s-412-f):** before: main lists Rohan, Anita, Vihaan; fare ₹48,000 ✅; Add New Table → Anita: main collapsed, header "Rohan Agarwal, Vihaan Agarwal", drop-down without Anita, main fare Adult ₹16,800 × 1 + Child ₹14,400 × 1 = ₹31,200; Anita's table shows ₹16,800 × 1 ✅; header click opens it; Alternate passenger list without Anita ✅; Discard → Anita back, main open, ₹48,000 ✅; no console errors ✅.

---

## 3 November 2026 — Session 8y: fare = Sales' total only ("price × persons = total"); dates as "14 Nov 26"

Files: `build/src/50-flight-visa.js` (`salesFareParts`, `salesFareBlock`, `dShort`, `fvIn`, dummy Sales fares), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
1. **Fare under each table (Alternative section) = only what Sales gave in the booking.** No input boxes any more. One line per passenger type in the form **₹price × persons = ₹total**, and a **Total**. price = Sales' fare per person added over the flights; persons = passengers of that type on that table. If a flight carries fewer passengers, each flight's part is shown ("₹a × 2 + ₹b × 1 = ₹total"). Under a passenger's new table it shows that passenger's fare from the booking ("₹14,400 × 1"). If Sales gave no per-passenger fare, it says so and shows the approved budget. (The Basic/K/YQ/YR/… boxes are still in the Confirm tickets popup, where the actual fare is entered.)
2. **Dummy Sales fares added** to the flight tasks so this shows (they add up exactly to each approved budget): s-412-f adult ₹8,400 / child ₹7,200 per flight (= ₹48,000); s-390-f adult ₹17,000 / child ₹15,000 per flight (= ₹1,28,000); s-455-f adult ₹5,250 per flight × 4 flights × 2 (= ₹42,000); s-301-f adult ₹19,500 per flight (= ₹78,000). The Details tab's "Sales fare breakup" now shows these too.
3. **Dates on the Flight screens now read "14 Nov 26"** (tables, read-only date cells, Previous Itinerary, Confirmed tickets, popups, Sales' itinerary/alternative lists). Date boxes that are being edited still use the browser's date picker, which shows the computer's date format. Date-and-time stamps ("27 Oct 2026, 7:41 pm IST") and the Visa screens are unchanged.
4. Removed a 1 px vertical scrollbar on the grid tables.

**Tested live in Chrome:** s-412-f main: Adult ₹16,800 × 2 = ₹33,600; Child ₹14,400 × 1 = ₹14,400; Total ₹48,000, no input boxes ✅; Vihaan's new table: Child ₹14,400 × 1 = ₹14,400 ✅; s-390-f: Adult ₹34,000 × 2 = ₹68,000; Child ₹30,000 × 2 = ₹60,000; Total ₹1,28,000 ✅; dates "14 Nov 26", "18 Nov 26", "20 Nov 26 · 04:25 …" ✅; no console errors ✅.

---

## 3 November 2026 — Session 8x: no Remove buttons, fare breakup under every table, new table editable at once

Files: `build/src/50-flight-visa.js` (`breakupBlock`, `bkStore`, `mainCounts`, `itinBlock`, `fv-itin-addrow`, `fv-itin-send`, `openClub`, input handler), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
1. **Remove buttons removed** from the Alternative section (the new passenger table and the passenger lines of the Confirm tickets popup).
2. **Fare breakup under every table** in the Alternative section, under the main table and under each passenger's new table. One row per passenger type on that table: Basic amount · K · YQ · YR · Other charges · Markup · Discount · **Total** (per person) · Count · **Amount**, and a **Total** row. Worked out as you type. The **Confirm tickets** popup (main table) and **Confirm Ticket** popup (passenger table) start with these fares filled in (still changeable there). Sales sees the proposed fare with a passenger's new itinerary. The breakup of a passenger table is locked while it waits for Sales.
3. **A new passenger table opens with every row editable**, filled from the passenger's previous flights. No Alternate click is needed; typed values are kept as you type. **Add Sector** adds a new editable row (cursor goes to its date). On **Send to Sales for Approval** the arrival dates and airlines are worked out (same rules as before) and the flights are put in date order; after sending the rows are read-only.

**Tested live in Chrome (s-412-f):** no Remove buttons ✅; main breakup Adult × 2, Child × 1: Adult 7,000 + 350 − 100 = ₹7,250 × 2 = ₹14,500, Child ₹5,000, total ₹19,500 ✅; Confirm tickets popup opened with adult basic 7,000 and total ₹7,250 ✅; Add New Table for Anita → 2 editable rows filled from 6E 6142 / 6E 6143, no Alternate buttons ✅; typed changes, Add Sector → editable row with focus, filled GOX → BOM ✅; Anita's breakup 15,000 + 1,500 = ₹16,500 ✅; Send → Pending, rows read-only, flights sorted 14 → 16 → 18 Nov, airline "6E"/"AI" from the codes ✅; no sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8w: passenger-specific itinerary ("Add New Table")

Files: `build/src/50-flight-visa.js` (helpers `itinsOf`, `openItin`, `approvedItin`; `itinBlock`; actions `fv-itin-new/create/alt/addrow/save/cancel/remove/discard/send/decide/reject-confirm/sel/confirm`; `decideItin`; `openClub` (shared by both Confirm buttons); Sales `salesItins`; checklist item), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.

**Workflow (Alternative flight sectors section):**
1. **Add New Table** sits directly above **Add Sector**. It opens a small popup to choose the passenger. Passengers who already have an open new itinerary, or a confirmed ticket, cannot be chosen (shown with the reason).
2. **The new table** is for that passenger only and uses the same grid: tick box · Date · Flight no. · From · To · Dep time · Arr time · Class · Remark · **Alternate** on every flight, plus its own **+ Add Sector**. It starts with the passenger's current flights, so you can Alternate them or add flights. Editing is in the row (Save / Cancel / Remove).
3. **Previous Itinerary** (collapsed by default) under the table keeps the passenger's old flights for reference. The other passengers are not changed.
4. **Send to Sales for Approval** (with **Discard table**) under the table. It is refused if a flight is incomplete or the itinerary is the same as before. The Sales notice and the Deal page say clearly: new itinerary **for <passenger> only**; it replaces their previous itinerary; the other passengers keep their flights. Sales sees Previous and Proposed side by side with Approve / Reject (Reject needs a reason).
5. **Pending Sales Approval:** the table is locked (no Alternate, no Add Sector) and that passenger's tickets cannot be confirmed anywhere (they are left out of the main Confirm tickets popup too, and cannot be moved by an alternative or Add Sector).
6. **Approved:** the passenger leaves their old flights (others stay on them), the new flights are created for that passenger only, and the button becomes **Confirm Ticket**. It opens the same confirm popup for the ticked flights of that table (or all of them if none are ticked), for that passenger. Each line then shows Confirmed / Pending. The tickets appear in Confirmed tickets under their own PNR.
   **Rejected:** the reason is shown, the passenger keeps the previous itinerary, and Flight can change the table and send it again (or discard it).
- "Finish this flight" now also checks **No new passenger itinerary open** (a draft, pending or rejected table must be approved or discarded first).
- Everything is recorded in History (made, sent, approved/rejected, discarded, tickets confirmed).

**Tested live in Chrome (s-412-f):** Add New Table above Add Sector ✅; popup listed the 3 passengers → Anita → table with her 2 flights, Previous Itinerary collapsed with 2 flights ✅; Alternate 6E 6142 → AI 470 (arr 12:50, remark) and Add Sector 6E 333 GOX → BOM; 6E 6143 needed an arrival time (dummy data) ✅; Anita left out of the main Confirm tickets popup ✅; Send → "Pending Sales Approval", table locked ✅; Sales (Deal Services tab) saw "New itinerary for Anita Agarwal only … The other passengers keep their flights" with previous vs proposed → Approve ✅; Flight: "Approved by Sales", Confirm Ticket → popup with Anita's 3 flights and only Anita → confirmed with PNR ANI777, ticket 098-5550001 → all 3 lines Confirmed, Confirm Ticket gone, Confirmed tickets shows the new PNR ✅; Rohan and Vihaan still on 6E 6142 / 6E 6143 ✅. Reject path (Vihaan): reason shown, Vihaan keeps his flights, table editable and can be sent again ✅. No console errors ✅.

---

## 3 November 2026 — Session 8v: Flight sector confirmation hidden (code kept)

File: `build/src/50-flight-visa.js`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- The **Flight sector confirmation** section is hidden from the Work tab. **No code was deleted.** It is controlled by one switch, `SHOW_CONFIRMATION_SECTION = false` (just above `flightTask`); set it to `true` to show the section again.
- The Work tab now shows: Alternative flight sectors → Confirmed tickets → Finish this flight. Tickets are confirmed with **Confirm tickets** in the Alternative section.
- The "Finish this flight" checklist links that pointed to the hidden section now point to the Alternative section (`confTarget`).

**Tested live in Chrome:** s-412-f: sections are Alternative, Confirmed tickets, Finish; no confirmation section ✅; confirmed a ticket from the Alternative popup → Confirmed tickets "1 PNR, 1 of 6" ✅; s-390-f (done) opens without it ✅; no console errors ✅.

---

## 3 November 2026 — Session 8u: Confirmed tickets — one row per passenger inside each PNR

File: `build/src/50-flight-visa.js` (`ticketsCard`), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- Still grouped by PNR, but each **passenger now has their own row**. Airline PNR, CRS type, CRS PNR, Flights and Confirmed are written once and span that PNR's passenger rows; a thicker line separates PNRs.
- Passenger rows: **Passenger · Type · Ticket number · Fare**. The ticket number is that passenger's (one number when the flights were confirmed together; both numbers when each flight has its own ticket). The fare is that passenger's total for the PNR; hover shows its breakdown (Basic, K, YQ, YR, Other charges, Markup, Discount, Total).
- Footer: Total actual fare (unchanged).

**Tested live in Chrome:** s-412-f: Rohan and Anita confirmed together on both flights → PNR XYZ789 with 2 rows: "Rohan Agarwal · Adult · 176-2410399909 · ₹14,400" and "Anita Agarwal · Adult · 176-2410399910 · ₹14,400"; total ₹28,800 ✅. s-390-f (done): PNR QX4M8T with 4 passenger rows, each showing its two ticket numbers (one per flight) and fare (₹33,600 adults, ₹27,220 children), total ₹1,21,640 ✅. No sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8t: Alternative grid column order, no Airline column, wide Remark

Files: `build/src/50-flight-visa.js` (`GRID`, new `autoAirline`, `flightNo`, Add Sector prefill), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **Column order:** tick box · **Date · Flight no. · From · To · Dep time · Arr time · Class · Remark** · button.
- **Airline column removed.** The airline is still stored (confirmation and history use it): when the flight number's carrier code changes (e.g. 6E 6142 → AI 470) the airline becomes the new code ("AI"); otherwise the current airline is kept. + Add Sector in this section starts with the journey's airline. Flight labels no longer repeat the code ("AI 470", not "AI AI 470").
- **Class column narrow; Alternate button small** (24 px high, 12 px text); "Waiting for Sales" wraps small inside the button cell.
- **Remark column is the widest** (about 260–280 px) so the reason can be read; hover still shows the full text.

**Tested live in Chrome (s-412-f):** headers in the new order ✅; Alternate on 6E 6142 → flight no. AI 470, arrival 12:50, long remark → saved with airline "AI", toast "Alternative AI 470 sent to …" ✅; Alternate on 6E 6143 (dummy data has no arrival time, so it asked for one) → 19:05–21:40 → saved ✅; time boxes not cut off in edit mode ✅; no sideways scroll in view or edit mode ✅; no console errors ✅.

---

## 3 November 2026 — Session 8s: Confirmed tickets = one line per PNR, with passenger names

File: `build/src/50-flight-visa.js` (`ticketsCard`, new `ticketRange`), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **One line per PNR.** Tickets with the same Airline PNR (and CRS PNR) are one booking, so they are shown together instead of one row per passenger per flight.
- Columns: **Airline PNR** · CRS type · CRS PNR · **Flights** (every flight that PNR covers, in date order: date · time · flight · route) · **Passengers** (names with their type, one per line) · **Ticket numbers** (shown as a range, e.g. "176-2410394501 – 508", when they run in sequence; otherwise listed) · **Fare** (total for that PNR; hover shows the breakdown per passenger type: Basic, K, YQ, YR, Other charges, Markup, Discount) · Confirmed (date; hover for the time).
- Header: number of PNRs and "x of y passenger tickets". Footer: Total actual fare (unchanged).
- Passenger names are back (you asked for them after the per-PNR change). Flight lines wrap so the table never scrolls sideways.

**Tested live in Chrome:** s-412-f: Rohan + Anita confirmed together on both flights (PNR XYZ789) and Vihaan on 6E 6142 only (PNR QWE456) → **2 lines**: "XYZ789 · 2 flights · Rohan, Anita · 176-2410399909 – 910 · ₹28,800" and "QWE456 · 1 flight · Vihaan · 176-2410400001 · ₹6,000"; total ₹34,800; fare hover shows the breakdown ✅. s-390-f (done): **1 line** for PNR QX4M8T: both Emirates flights, 4 names, tickets "176-2410394501 – 508", ₹1,21,640 ✅. No sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8r: no passenger names in Confirmed tickets

File: `build/src/50-flight-visa.js` (`ticketsCard`); rebuilt `full-crm-preview.html`. Not committed or pushed.
- The **Passenger** column is removed from the Confirmed tickets table. Columns now: Date & time · Flight · Route · Type · CRS type · CRS PNR · Airline PNR · Ticket number · Fare · Confirmed. The total row is adjusted.

**Tested live in Chrome (s-390-f):** no passenger names in the table, 10 columns, total ₹1,21,640, no sideways scroll, no console errors ✅.

---

## 3 November 2026 — Session 8q: new "Confirmed tickets" section; Alternative open by default

Files: `build/src/50-flight-visa.js` (`ticketsCard`, order in `flightTask`, `alternativeCard` open state), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **New section "Confirmed tickets"**, right under Alternative flight sectors (before Flight sector confirmation). A read-only table of every confirmed ticket: Date & time · Flight · Route · Passenger · Type · CRS type · CRS PNR · Airline PNR · Ticket number · Fare · Confirmed (date; hover for the time). Footer: **Total actual fare**. Header count: "2 of 6". Empty: "No tickets confirmed yet."
  - A ticket confirmed together with other flights shows its fare on the first flight and "Incl. in …" on the others. Hovering the fare shows the breakdown (Basic, K, YQ, YR, Other charges, Markup, Discount).
  - Shown to everyone who can open the task (also on done tasks and for the Manager).
- **Alternative flight sectors is open by default.** If you close it, it stays closed while you move around the task.

**Tested live in Chrome:** s-412-f: Alternative open on load ✅; order Alternative → Confirmed tickets → Flight sector confirmation → Finish ✅; empty text ✅; confirmed Rohan and Anita on 6E 6142 from the Confirm tickets popup → 2 rows, "2 of 6", total ₹16,900, fare hover shows the breakdown ✅; closed Alternative stays closed after switching tabs ✅. s-390-f (done): 8 of 8, total ₹1,21,640, no sideways scroll ✅. No console errors ✅.

---

## 3 November 2026 — Session 8p: confirm several flights together from the Alternative section

Files: `build/src/50-flight-visa.js` (tick box in `altRows`, footer in `alternativeCard`, popup `clubBody`, actions `fv-alt-sel`, `fv-club-open/add/del/confirm`, `sectorFare`), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.

**What changed:**
1. **Alternative grid:** a **tick box** at the start of each flight line (not shown for a flight waiting for Sales, or one where every passenger is already confirmed). Footer: **Confirm tickets** button.
2. **Confirm tickets popup** (only the ticked flights, "clubbed" as one booking):
   - **Flights confirmed together:** date & time, flight, route, class, and who still needs a ticket.
   - **Passengers:** same as the Confirmation section: one passenger line first, name in a drop-down, CRS type, CRS PNR, Airline PNR, ticket number, and how many of the ticked flights the passenger is on. **+** adds the next passenger with the same details and ticket number + 1; Remove takes off a line you added.
   - Each line is applied to **every ticked flight that passenger is on**, so they get the **same PNR and the same ticket number** on all of them.
   - **Fare per passenger** (one row per passenger type present): **Basic amount, K, YQ, YR, Other charges, Markup, Discount**, then **Total** (= Basic + K + YQ + YR + Other + Markup − Discount), Count, Amount, and the **Total for these tickets**. All worked out as you type. Basic amount is required; the others default to 0.
   - **Confirm tickets** checks everything first (CRS type, CRS PNR unless "Airline direct", Airline PNR, ticket number format and that it belongs to one passenger only, basic amount, numbers only, discount not more than the fare). If anything is wrong nothing is confirmed and the list is shown in the popup. Lines left blank are skipped.
   - On confirm: the tickets are confirmed on every ticked flight, with the fare breakdown kept on each ticket. Because it is one ticket for all the clubbed flights, the fare is counted once, on the first flight; the other flights show "Incl. in <first flight>" in Flight sector confirmation (so the actual fare is not doubled).
3. Flight sector confirmation's **Flight total** now adds confirmed tickets at the fare they were confirmed with (needed for clubbed tickets).
4. The popup is wider than the app's normal popup and has no animation.

**Tested live in Chrome (s-412-f):** tick boxes on both flights, table not wider than its box ✅; Confirm tickets with nothing ticked → no popup ✅; ticked both → popup "Confirm tickets · 2 flights" ✅; Confirm empty → "Fill in at least one passenger’s …" ✅; Rohan (Amadeus, ABC123, XYZ789, 176-2410399909) → + → Anita …910 → + → Vihaan …911, each "2 of 2" ✅; Adult 12,000 + 600 + 1,800 + 200 + 150 + 500 − 250 = ₹15,000 × 2; Child 9,000 + 450 + 1,800 = ₹11,250; total ₹41,250 ✅; Confirm → 6 tickets confirmed, same PNR and ticket number on both flights; Confirmation shows ₹15,000 / ₹15,000 / ₹11,250 on 6E 6142 and "Incl. in IndiGo 6E 6142 JDH → GOX" on 6E 6143; 6 of 6 confirmed, actual fare ₹41,250 ✅; no console errors ✅.

---

## 3 November 2026 — Session 8o: Flight sector confirmation is a drop-down section like Alternative

Only Flight sector confirmation changed. File: `build/src/50-flight-visa.js` (`confirmationCard` header, action `fv-conf-toggle`, `UI.confOpen`); rebuilt `full-crm-preview.html`. Not committed or pushed. Nothing inside the section changed.
- The section now opens and closes from its header, exactly like **Alternative flight sectors**: an arrow, the title, and two counts ("2 flights", "0 of 6 confirmed"; amber while some are pending). **Closed by default.**
- Once opened it stays open while you work (typing, +, Confirm). It opens by itself when there is an error to show.

**Tested live in Chrome (s-412-f):** closed on load ✅; header "Flight sector confirmation, 2 flights, 0 of 6 confirmed" ✅; click opens / closes ✅; stays open after + ✅; Confirm with missing details → section open with the error list ✅; no console errors ✅.

---

## 3 November 2026 — Session 8n: Confirmation lines editable by default (no Edit button)

Only Flight sector confirmation changed. File: `build/src/50-flight-visa.js`; rebuilt `full-crm-preview.html`. Not committed or pushed. Grid design unchanged.
- Removed the **Edit / Save / Cancel** buttons on the flight lines (and their code `fv-csec-*`, `UI.cEdit`).
- **Pending passenger lines are editable straight away** (name drop-down, CRS type, CRS PNR, Airline PNR, ticket number, fare). Confirmed lines stay read-only. **+** is always on the last passenger line while there is a next passenger to add.
- Typed values are kept as you type (as before), so nothing needs saving; confirm with the flight tick box and **Confirm selected**.

**Tested live in Chrome (s-412-f):** no Edit/Save buttons ✅; lines editable on load ✅; filled Rohan + fare 8,450 → + → Anita with the same details and ticket …910 ✅; tick flight → Confirm selected → 2 of 6 confirmed, ₹16,900; + still offers Vihaan ✅; no sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8m: Flight sector confirmation as the same simple grid

Only Flight sector confirmation changed. Files: `build/src/50-flight-visa.js` (`confFlightLine`, `confPaxLine`, `confirmationCard`, actions `fv-csec-edit/save/cancel`, passenger-name change handler, fare sync), `build/src/50-flight.css` (`.fv-cgrid` rules at the end); rebuilt `full-crm-preview.html`. Not committed or pushed.

**Layout (same idea as Alternative):**
- **One line per flight** (grey): tick box · date and times · flight · route · class · "x/y confirmed" · Flight total · **Edit** button.
- Under it, **one line per passenger**: **Passenger (drop-down)** | CRS type | CRS PNR | Airline PNR | Ticket number | Fare | Status | **+**.
- All boxes are **read-only until you click Edit** on the flight line. Edit unlocks that flight's pending passenger lines; the look does not change. **Save** keeps what you typed; **Cancel** puts everything back as it was before Edit. Only one flight is edited at a time.
- A flight starts with **one passenger line**. **+** (on the last line, while editing) adds the next passenger with the same CRS type and PNRs and the **ticket number + 1**. The passenger's name is a drop-down (only passengers on that flight; ones already on another line are disabled).
- **Fare** is typed in the passenger line; it is the fare for that passenger type on that flight, so the other lines of the same type update at once, and the Flight total updates. A type's fare locks once one of its tickets is confirmed. Confirmed lines show the fare they were confirmed with.
- Confirm is unchanged: tick the flight → **Confirm selected**. Filled lines are confirmed; blank lines stay Pending. All checks are the same (CRS, PNRs, ticket number, fare).
- Removed from this section: the per-flight Passengers drop-down button, the separate Fare row, avatars, coloured edges and striping.

**Tested live in Chrome (s-412-f):** view: every box read-only ✅; Edit on 6E 6142 → boxes editable; filled Rohan (Amadeus, ABC123, XYZ789, 176-2410399909, adult fare 8,450) → **+** → Anita with the same details and …910 → **+** → Vihaan with …911, + gone ✅; child fare 6,200 → Flight total ₹23,100 ✅; Save → read-only again, values kept ✅; tick flight → Confirm selected → 3 of 6 confirmed, ₹23,100 ✅; Edit on 6E 6143 shows Save / Cancel and the name drop-down ✅; no sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8l: the passengers row is one multi-select drop-down

Only the Alternative flight sectors section changed. Files: `build/src/50-flight-visa.js` (`altPaxRow`, `paxDrop`, `pdSumHtml`, drop-down open/close handlers), `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- The **Passengers** row above the Alternative table is now **one drop-down with multi-select** (instead of a checkbox card per passenger). Closed, it shows the count and the chosen names. Open, it lists **All** and every passenger with their type and the flights they are on now; locked passengers (confirmed ticket, on another flight of the journey, waiting for Sales) are greyed out with the reason.
- It works as before: choose passengers and then click **Alternate**, or click Alternate first and choose them; + Add Sector from this section uses it too. Ticking updates the summary at once; nothing is saved until Save.
- The list opens as a floating panel; it closes on a click outside, on scroll, or with Esc. Only one is open at a time.
- **No drop-down in the flight rows** (I first added a Passengers column to each row; you asked for only one, so it was removed). Rows stay one line (41 px).

**Tested live in Chrome (s-412-f):** 1 drop-down in the section, 0 in the rows ✅; Alternate on 6E 6143 → list shows All + 3 passengers with their flights, all ticked → unticked Vihaan → summary "2 Rohan Agarwal, Anita Agarwal" ✅; click outside closes it ✅; Save → 6E 2210 waiting for Sales for Rohan and Anita, 6E 6143 stays for Vihaan ✅; rows 41 px, no sideways scroll, no console errors ✅.

---

## 3 November 2026 — Session 8k: Alternative table as a simple one-line grid

Only the Alternative flight sectors table changed. Files: `build/src/50-flight-visa.js` (`GRID`, `gridCells`, `altRows`, the Alternative branch of `addRows`, `fvIn` tooltip), `build/src/50-flight.css` (`.fv-grid` rules at the end); rebuilt `full-crm-preview.html`. Not committed or pushed.
- **One line per flight, one field per cell**, like a database table: **Dep date | Dep time | Arr time | Airline | Flight no. | From | To | Class | Remark | button**. Cell borders on every cell.
- **View and edit look exactly the same:** same 41 px height, same white background, same column widths, no box borders, no tint and no tag. Clicking **Alternate** only unlocks the cells for typing (a focus outline shows the cell you are in). The button cell changes to **Save / Cancel**.
- A flight waiting for Sales shows "Waiting for Sales" in the button cell instead of a tag under the flight.
- "N passengers" was removed from the row (the passenger row above already shows who is on which flight).
- **+ Add Sector** from this section adds one grid line; the Journey choice is in the Remark cell.
- Hovering a read-only cell shows its full text (useful for long remarks).

**Tested live in Chrome (s-412-f):** headers as above ✅; view vs edit: height 41/41, background white/white, input border 0/0, widths identical, only read-only → editable ✅; Alternate on 6E 6143 → 6E 2210, 19:05–21:40, remark → Save → one line with "Waiting for Sales" ✅; + Add Sector row: one 41 px line with Journey select ✅; table not wider than its box ✅; no console errors ✅.

---

## 3 November 2026 — Session 8j: Alternative rows always show their boxes (read-only until Alternate)

Only the Alternative flight sectors table changed. Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- Every flight row now shows the **same input boxes** as edit mode (Dep date, Dep time, Arr time, Airline, Flight no., From, To, Class, Remark), filled with the flight's details. By default they are **read-only with no border or background**, so they read as plain text and cannot be changed.
- Clicking **Alternate** turns **those same boxes** into normal editable inputs (border, white background, row tinted), with Save / Cancel. The row keeps the same shape and height (97 px in both modes), so nothing jumps.
- Empty read-only fields show "—" instead of an empty date/time picker. Read-only boxes are skipped by the Tab key.
- The "Alternative · waiting for Sales" tag now wraps inside the Flight column so the table never scrolls sideways.
- Code: `fvIn` has a read-only option (`ro`); `draftCells` / `altDraftCells` pass it through; the view row uses `altDraftCells(..., true)`. CSS `.fv-in.fv-ro`.

**Tested live in Chrome (s-412-f):** view rows: 9 read-only boxes each, no border ✅; Alternate on 6E 6142 → the same 9 boxes editable, same row height ✅; changed to 6E 5310, arrival 12:55, remark → Save → new row shows the new values in read-only boxes with the waiting tag ✅; no sideways scroll in view, edit or after save ✅; no console errors ✅.

---

## 3 November 2026 — Session 8i: Sales flight total fixed, Alternative table tidied, no more blink

Files: `build/src/30-booknow.js` (`fareLine`), `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.

1. **Sales total was wrong (Book now → Trip & services → flight fare total, "All flights").** It added the fares of all flights and multiplied by every passenger of that type in the booking. When a flight carried only some passengers, the total was too high. Now each flight's fare is multiplied by the passengers of that type **on that flight**, and the line shows the working, e.g. "Adult: ₹16,800 × 2 + ₹17,400 × 2 + ₹3,200 × 1 + ₹4,100 × 2 = ₹79,800" (before: ₹83,000). It now matches the Flight task's budget. When every flight has the same passengers it still shows the short form "₹34,200 × 2".
2. **Alternative flight sectors:**
   - The journey rows (e.g. "JDH → GOX · 14 Nov 2026 · 3 passengers on a flight") are removed. **One row per flight.**
   - **Date & time is now the first column:** Date & time | Flight | Route | Class | Remark | buttons.
   - **No arrival date in the row** (view and edit). The edit row has Dep date + time and Arr time only. On Save the arrival date is worked out: same day, or the next day when the arrival time is earlier than the departure time (overnight). The same applies to + Add Sector started from this section.
3. **Blink removed permanently:** the fade-in on sections and passenger rows (it replayed on every redraw, so it looked like a blink) is deleted, and every animation and transition in the Flight module is switched off (`.fv-card *` rule at the end of `50-flight.css`).

**Tested live in Chrome:** Book now BX-38533 with 4 flights (one for Kunal only): total ₹79,800 with the per-flight working ✅. s-412-f Alternative table: headers Date & time, Flight, Route, Class, Remark; 2 rows (no journey rows) ✅; edit row inputs: departure date, departure, arrival time, airline, flight no., from, to, class, remark (no arrival date) ✅; saved 6E 2210 at 23:10 → 01:40 → arrival date stored as the next day (19 Nov) ✅; no animation (animation none, transition 0s) ✅; no sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8h: all flights of a booking go into ONE Flight task

Your request: the dummy data has several flights in one task, but a new Sales booking (Book now → Submit) made one task per flight. All flights should be combined into one task for the Flight department.
Files: `build/src/30-booknow.js` (`submitBooking`, the flight part only), `build/src/50-flight-visa.js` (`sectorsOf`, `gapsIn`); rebuilt `full-crm-preview.html`. Not committed or pushed.

**What changed:**
1. **Book now → Submit** now makes **one Flight task** for all the flight rows of the booking (before: one task per flight row).
   - Every flight becomes a **sector** inside that task, **in date order**, and keeps its own **passengers** (`passengerIds`) and Sales' fare breakup.
   - **Title:** "DEL to HKT · HKT to KBV · KBV to BKK · KBV to DEL" (or "A to B and back" for a simple return). **Detail:** the flight numbers · number of flights · number of passengers.
   - **Budget** = the total of all the flights' budgets (same rule as before, added up).
   - Notes, preferences and screenshot files of all the flight rows are kept together on the task.
   - When a returned booking is sent again, the existing Flight task is kept and updated (not duplicated).
2. **Flight task:** each sector starts with only the passengers Sales booked on that flight. A booked flight only requires those passengers ("Every passenger has a flight on every journey" and the "Not on a flight yet" warning now use that). The confirmation Fare boxes still start empty (Sales' numbers are the budget, not the actual fare).
3. The old dummy tasks (s-412-f, s-390-f, s-301-f, s-455-f) are unchanged: their sectors still have all passengers.

**Not changed (asked you):** Purchase (hotel, transfer, activity) and Visa (visa, passport) still make one task per item, because those screens are built for one hotel / one visa per task.

**Tested live in Chrome:** Book now for BX-38533 (Thailand) with 4 flights (DEL→HKT, KBV→DEL, HKT→KBV for Kunal only, KBV→BKK) → Submit → **1 Flight task s-533-f4** (plus the hotel, transfer and activity tasks as before), budget ₹79,800 (= 2×16,800 + 2×17,400 + 3,200 + 2×4,100). As Flight: took the task → 4 sectors in date order, HKT → KBV has 1 passenger, the others 2; 7 passenger tickets; no "not on a flight" warning; checklist item done ✅. s-412-f unchanged (3 + 3) ✅. No console errors ✅.

---

## 3 November 2026 — Session 8g: passengers going to different cities (move with + Add Sector)

Your question: if 2 passengers of one booking go to a different city, how do we record it, so that only their new flight counts and not the old one?
Files: `build/src/50-flight-visa.js`; rebuilt `full-crm-preview.html`. Not committed or pushed.

**How it works now (+ Add Sector, in either section):**
- The **Journey** choice now reads **"Instead of JDH → GOX · 14 Nov 2026"**, **"Instead of GOX → JDH · 18 Nov 2026"** or **"Extra journey (in addition)"**. It starts on the first journey.
- **Instead of …:** every passenger is listed. Under each name it says where they are now: "moves from IndiGo 6E 6142", "no flight yet", or why they can't move ("ticket confirmed on …", "waiting for Sales on …"; those are greyed out). Tick the passengers, type the new flight (for example AI 470 **JDH → BOM**) and Save. The ticked passengers **move**: the old flight no longer counts for them (their pending ticket row there is removed), and only the new sector needs their ticket. The other passengers stay on the old flight. If everyone leaves the old flight, it goes to Flight sector history ("Passengers moved … to …").
- **Extra journey (in addition):** a new leg only for the passengers you tick (e.g. GOX → HYD for Vihaan). The others are **not** flagged as "not on a flight" for it any more (before, they were, and Mark flight done was blocked).
- The checklist item "Every passenger has a flight on every journey" now checks only the booked journeys.
- How it is stored: the old flight's line gets an `out` list of moved passengers (`activePax` leaves them out of every version of that flight), and the new sector records `movedFrom`. Nothing is deleted. Helpers: `neededJourneys`, `gapsIn`, `moveLock`, `addNote`.
- Note: moving passengers this way does **not** go to Sales for approval (adding a sector never did). If the change should be approved by Sales, use **Alternate** instead: it can also change the destination (e.g. JDH → BOM) for the passengers you tick.

**Tested live in Chrome (s-412-f):** confirmed Rohan on 6E 6142 → + Add Sector defaulted to "Instead of JDH → GOX"; Rohan greyed out (ticket confirmed), Anita and Vihaan "moves from IndiGo 6E 6142" → ticked both, AI 470 JDH → BOM → saved. 6E 6142 now 1/1 (Rohan), AI 470 0/2, total still 6 tickets, no warning ✅. Extra journey GOX → HYD for Vihaan only: total 7, no "not on a flight" warning, checklist item done ✅. No console errors ✅.

---

## 3 November 2026 — Session 8f: one passenger first, "+" adds the next (your correction)

Only Flight sector confirmation changed. Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- When you open a flight's **Passengers** drop-down, only the **first passenger** is shown (`ensureRows` now makes just one row).
- Under it is a **+ Add next passenger: <name>** button (action `fv-row-add`). It adds the next passenger in booking order with the **same CRS type, CRS PNR and Airline PNR** as the row above, and the **ticket number + 1** (e.g. 176-2410399909 → …910). The cursor goes to the new ticket number so you can change it if needed. The button says how many are left and disappears when everyone has a row.
- Confirm is unchanged: tick the flight → Confirm selected; filled rows are confirmed, blank rows stay Pending. Passengers not added yet still count as pending for Mark flight done.

**Tested live in Chrome (s-412-f):** opened IndiGo 6E 6142 → only Rohan shown with "+ Add next passenger: Anita Agarwal" ✅; filled Rohan (Amadeus, ABC123, XYZ789, 176-2410399909) → + → Anita with the same details and ticket …910 ✅ → + → Vihaan with …911, button gone ✅; fares 8,450 / 6,200 → tick flight → Confirm selected → 3 of 6 confirmed, ₹23,100 ✅; IndiGo 6E 6143 starts with only Rohan ✅; no console errors ✅.

---

## 3 November 2026 — Session 8e: passengers in a drop-down, no passenger tick boxes (your correction)

Only Flight sector confirmation changed. Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **Passengers drop-down:** each flight row has a **Passengers (3) · 2/3 confirmed** button. The passenger rows are hidden until you open it (closed by default; it stays open while you work). Action `fv-sec-toggle`, state `UI.secOpen`.
- **No tick box on passenger rows.** You tick the **flight** and press **Confirm selected**. Every pending passenger on that flight whose ticket details are filled in is confirmed; passengers whose ticket fields are all blank are skipped and stay **Pending** (so partial confirmation still works). The usual checks still run (CRS, PNRs, ticket number, fare for the passenger type). The ticked flights open automatically so you can see the result or the problems.
- **Passenger rows look better:** a round avatar with initials (blue = adult, teal = child, amber = infant), name with type underneath, a thin line joining the rows to their flight, a coloured left edge (amber pending, green confirmed), light striping, and ticket numbers on one line.

**Tested live in Chrome:** s-412-f: passenger rows hidden until opened ✅; no passenger tick boxes ✅; flight ticked with nothing filled → "Open Passengers on the ticked flights and fill in at least one passenger’s ticket details." ✅; filled Rohan and Vihaan, no child fare → asked for the child fare ✅; with fares → Rohan and Vihaan Confirmed, Anita (blank) Pending, "2 of 6 confirmed", ₹14,650 ✅. s-390-f (done): read only, 4 passengers shown in the drop-down ✅. No sideways scroll, no console errors ✅.

---

## 3 November 2026 — Session 8d: Flight sector confirmation simplified again (your correction)

Only Flight sector confirmation changed. Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **Removed:** the passenger row at the top of Confirmation, the **Copy details down** button and the **Edit passengers** button (and their code: `fv-fill-down`, `fv-conf-pax-*`).
- The section is now: **View history** and **+ Add Sector** buttons → summary line → the table (grey flight row with fares inline, then one row per passenger) → **Confirm selected**.
- **+ Add Sector** in Confirmation: the passenger tick boxes are now inside that same Add Sector row (only passengers with no flight on the chosen journey are shown).
- Changing who is on an existing flight is now done from the Alternative section (Alternate, approved by Sales), or by + Add Sector for passengers with no flight. The "Not on a flight yet" warning now says "Use + Add Sector to give them a flight."

**Tested live in Chrome (s-412-f):** passenger row, Copy and Edit passengers are gone ✅; confirmed Rohan with Adult fare ₹8,450 → "1 of 6 confirmed", actual fare ₹8,450 ✅; + Add Sector → New journey, unticked Vihaan → "2 chosen" → Air India AI 512 GOX → BOM added, warning "Not on a flight yet: Vihaan (GOX → BOM)" shown ✅; no sideways scroll; no console errors ✅.

---

## 3 November 2026 — Session 8c: Flight sector confirmation made simpler (your correction)

Only the **Flight sector confirmation** section changed, following your Alternative idea (one passenger row, edit in place, no drop-downs or extra panels). Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed. All rules are the same as before (Sales approval, passenger-wise tickets, fares by passenger type, partial confirmation, Mark done checks).

**New layout, top to bottom:**
1. **One passenger row** (names with type and the flights they are on), plus **View history** and **+ Add Sector**. The row is for viewing only until you press **Edit passengers** on a flight or **+ Add Sector**; then it turns blue and you tick passengers there.
2. **One summary line:** "2 of 6 passenger tickets confirmed · Actual fare · Budget" and a progress bar (the 4 boxes are gone).
3. A short warning line only when someone has no flight on a journey.
4. **One flat table.** For each flight there is a grey **header row**: flight, route, date and time, class, tag, "x of y confirmed", and buttons **Copy details down** and **Edit passengers**. The **fares** sit inline in the header: Adult ₹[ ] × 2 = …, Child ₹[ ] × 1 = …, Flight total. Under it there is **one row per passenger**: tick box, name + type, CRS type, CRS PNR, Airline PNR, Ticket number, Fare, Status.
5. **Confirm selected** at the bottom.

**What was removed:** the Booking passengers drop-down, the per-flight open/close lists, the passenger chips + legend inside each flight, the separate Fare table, the passenger pick-list and Remove on each ticket row, "+ Add passenger", the journey group rows and the 4-box summary.

**How things work now:**
- Every passenger on a flight automatically has one ticket row (`ensureRows`).
- **Copy details down** (`fv-fill-down`) replaces "+ Add passenger" copying: it copies CRS type, CRS PNR and Airline PNR from the first filled row into the empty rows below, and each empty ticket number becomes the row above + 1.
- **Edit passengers** (`fv-conf-pax-start/save/cancel`): the flight's header shows Save passengers / Cancel; confirmed passengers stay ticked and locked; passengers on another flight of the same journey are greyed out. Alternatives have no Edit passengers button (use Alternate; Sales approves).
- **+ Add Sector** here is one full-width row with labelled inputs (Journey, Flight, Route, Date & time, Class, Save/Cancel); passengers are ticked in the passenger row.
- **Confirm selected:** tick passengers (or the flight's box to tick all its pending passengers). You no longer have to tick the flight as well.
- Only one thing is edited at a time; the other buttons are disabled until you Save or Cancel.

**Tested live in Chrome (s-412-f):** Copy details down filled 2 rows (ticket numbers …909 → …910 → …911) ✅; fares updated as typed (Adult 8,450 × 2 = 16,900; total 23,100) ✅; ticked Rohan and Vihaan only → 2 confirmed, Anita pending, actual fare ₹14,650 ✅; Edit passengers: Rohan/Vihaan locked (confirmed), unticked Anita → warning "Not on a flight yet: Anita" ✅; + Add Sector: only Anita tickable → Air India AI 470 added, warning gone ✅; an alternative waiting for Sales has no tick boxes and no Edit passengers ✅; s-390-f (done) read only, totals ₹60,820 × 2 ✅; Manager read only ✅; no sideways scroll on desktop or at 375 px ✅; no console errors ✅.

---

## 3 November 2026 — Session 8b: your corrections to the Alternative section

Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **Booking passengers drop-down removed from Alternative flight sectors.** In its place there is **one row of passenger names with checkboxes** above the table (`altPaxRow`). Each name shows its type and the flight it is on for each journey.
- **Alternate:** click Alternate on a flight → that same row turns into inputs (flight, route, date & time, class, remark) with Save / Cancel. **No new row appears.** The passenger row above turns blue and its checkboxes now choose who moves to the alternative. Passengers already ticked there before clicking Alternate are used; otherwise the flight's own passengers are pre-ticked. Passengers who can't move (confirmed ticket, or on another flight of the same journey) are greyed out. Only one flight is edited at a time (the other Alternate buttons are disabled until you Save or Cancel).
- The per-flight "Passengers (N)" drop-down was removed from the Alternative table; each flight shows "N passengers" instead. Passengers can still be put on or taken off a flight from the Confirmation section's per-flight list.
- **+ Add Sector in the Alternative section** works the same way: one inline row, the Journey choice is in the Remark column, and passengers are ticked in the same passenger row (only those without a flight on that journey can be ticked). No extra row.
- **Flight sector history drop-down removed.** Earlier versions now show on the task's **History tab**, in a "Flight sector history" card above the event list (`sectorHistoryCard`). "View history" in Flight sector confirmation now opens the History tab.
- Edit row inputs made narrower so the Save button fits without sideways scrolling.

**Tested live in Chrome (s-412-f):** passenger row present, no drop-down or history in the Alternative section ✅; Alternate on 6E 6143 kept 4 table rows (no extra row), untick Vihaan in the passenger row → "2 chosen" → Save → 6E 2210 waiting for Sales for Rohan and Anita, 6E 6143 stays for Vihaan ✅; other Alternate buttons disabled while editing ✅; table not wider than its box while editing ✅; + Add Sector in the Alternative section: one row, only Anita (no flight on the journey) tickable ✅; History tab shows the Flight sector history card ✅; no console errors ✅.

---

## 3 November 2026 — Session 8: sectors and passengers, round 2 (`flight_changes_2.md`)

Plan and decisions: `FLIGHT_SECTOR_V2_PLAN.md`. Files: `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html` with `python -X utf8 -I build/assemble.py`. Not committed or pushed.
**Kept as before:** Sales approval of alternatives, passenger-wise ticket rows (CRS type, CRS PNR, Airline PNR, ticket no.), + Add passenger copying, Confirm Selected Sectors, partial confirmation, e-tickets, Mark flight done checks, progress bar, Sales Deal page.

**What changed (Flight → task → Work tab):**
1. **Journeys:** passengers are now assigned per journey (e.g. JDH → GOX). Both tables are grouped by journey with a header line saying "All 3 passengers on a flight" or "1 not on a flight: Anita Agarwal". Helpers `segOf`, `journeys`, `holderOf`, `unassignedIn` (line 558).
2. **Fewer columns:** both tables show Flight, Route, Date & time, Class (+ Remark in Alternatives) and the actions. Sector no., Passengers and Status columns are gone (the data is kept). "Alternative · waiting for Sales", "Added" and "No passengers" show as small tags under the flight.
3. **Booking passengers list** (`paxBoard`, line 1100) at the top of both sections: every passenger with Adult/Child/Infant and which flight they are on for each journey. Ticked passengers are pre-chosen for + Add Sector. Both copies stay in step.
4. **Passenger drop-down per flight** (`assignChips`, line 1111; action `fv-assign`, line 1691): the same booking list, marked On this flight / Not on a flight / On another flight (greyed). Tick or untick to put a passenger on or take them off that flight, for that journey only. Confirmed passengers can't be taken off. Alternatives are changed with Alternate only (Sales approves).
5. **+ Add Sector** in both sections (`addRows`, line 1145; `fv-add-save`, line 1821): inline row at the bottom, choose the journey (or "New journey"), and only passengers not on a flight for it are listed. Blocks a passenger already on a flight for that journey and a second copy of the same flight.
6. **Alternate edits the row itself** (`altRows`, line 1156; `fv-alt-save`, line 1725): the cells become inputs with Save / Cancel; the passenger list opens under the row. Works on any live flight not waiting for Sales. When everyone moves, the old version leaves the table and goes to history. If some passengers stay, the old flight stays for them.
7. **Flight sector history** (`historyBlock`, line 1177): in the Alternative section; **View history** in Confirmation opens it. Shows replaced and rejected versions with passengers, remark, Sales outcome (who, when, reason), created / replaced times and any confirmed tickets kept.
8. **Fares by passenger type** (`fareBlock`, line 1223): each flight in Confirmation has a Fare section with one box per type present (no Infant box when there are no infants). Count × fare = amount, plus Total sector fare, all updated as you type. The per-row Fare box is gone: a confirmed ticket takes its type's fare, and that type's fare then locks. Confirm asks for a missing fare once per flight and type. Fares from the old flight are carried into an alternative (still editable in Confirmation). No fare on the Alternative section.
9. **New Mark-done check:** "Every passenger has a flight on every journey" (line 717).
10. Messages now name the flight and route (e.g. "IndiGo 6E 6142 JDH → GOX") instead of sector numbers.
11. Dummy data: the two completed tasks got sector fares matching their ticket fares.

**Tested live in Chrome (s-412-f):**
- Took Anita off 6E 6142 → journey line and Mark-done list say "Anita Agarwal not on a flight". Her tick on 6E 6142 then shows "on Air India AI 470" and is disabled after the next step. ✅
- + Add Sector (journey JDH → GOX picked automatically, only Anita listed) → Air India AI 470 saved, appears in both tables. ✅
- Alternate on 6E 6143: 6 inline cells, no panel. Save without remark → refused. With remark → 6E 2210 "waiting for Sales"; 6E 6143 moved to history ("Replaced … by IndiGo 6E 2210"). ✅
- Sales rejected it with a reason → 6E 6143 back in both tables with all 3 passengers and a ticket row; the rejected version is in history with the reason. ✅
- Confirm without fares → "IndiGo 6E 6142 JDH → GOX: enter the adult fare in its Fare section." Fare section showed Adult and Child only. Typed 8,450 / 6,200 → amounts and total ₹14,650 updated at once. Confirmed Rohan only → Confirmed with ₹8,450, adult fare locked, child still editable, Vihaan Pending, Rohan can't be taken off. ✅
- s-390-f (done): read only, sector totals ₹60,820 each, total ₹1,21,640. Manager view: no edit buttons, passenger ticks disabled. ✅
- No console errors. Desktop: no sideways scroll (fixed an 18 px overflow by narrowing ticket inputs). 375 px (tested in a 375 px frame, the window would not resize): no sideways page scroll. ✅

---

## 3 November 2026 — Session 7: design update from `flight_design.md`

Plan: `FLIGHT_DESIGN_PLAN.md`. **Design and layout only.** No rule, check, saved data or workflow changed. Every button, input and action is still there and does the same thing.
Files: `build/src/50-flight-visa.js` (Work tab card markup only), `build/src/50-flight.css`; rebuilt `full-crm-preview.html` with `python -X utf8 -I build/assemble.py`. Not committed or pushed.

**What changed (Flight → task → Work tab):**
1. **Flight details in 4 columns instead of 8:** Flight (airline + flight no.), Route (big codes, `JDH → GOX`), Date & time (`10:35 → 12:50`, arrival date only if it's a different day), and Class. Helpers `viewCells`, `draftCells`, `FLIGHT_HEADS` (around line 1033).
2. **Sector tags:** small **Original / Alternative of 01 / Added** tags under the sector number (`kindTag`, `secCell`). The separate "Type" column is gone (the unused `kindLabel` helper was removed).
3. **Alternative flight sectors** (`alternativeCard`): still collapsed by default. The header shows "N saved" and "N waiting for Sales". Alternate sits in its own right-hand column. Alternatives have a coloured rail and tint. Passengers and number of persons are shown together. **New alternative editing** is now a full-width panel under the sector, with labelled groups (Flight, Route, Date & time, Class / Passengers, Remark) and Cancel + **Save alternative** on the right (`editorPanel`). Same inputs as before.
4. **Flight sector confirmation** (`confirmationCard`): the header shows the sector count and **+ Add Sector**. A summary strip shows passenger tickets, confirmed, pending and total actual fare with the budget, plus a progress bar. **Confirm Selected Sectors** sits in an action bar under the table. The "Add Sector" draft uses the same editing panel.
5. **Passenger rows** (`sectorRows`, `subRow`): indented under their sector with a rail. Pending rows have an amber edge; confirmed rows are green-tinted. Each sector's toggle has a small progress bar ("1 of 3 confirmed"). **+ Add passenger** is a compact dashed button. The "waiting for Sales" and "no row yet" notes have icons.
6. **Passenger picker** (`paxPicker` + its change handler, display only): when closed it shows the chosen names as chips (first 2, then "+N") and "2/3".
7. **Finish this flight** (`finishCard`): separated with a blue top border. It shows a progress summary (tickets confirmed, pending, e-tickets attached). The "before you can mark done" messages are now a checklist with ticks (same text). **Mark flight done** has an icon and a clear disabled look, and says how many steps are still open.
8. **Polish:** uppercase table headers, row hover, a fade-in when sections open (off with reduced motion), focus rings, and compact 36 px inputs on desktop (44 px kept on touch screens).

**Tested live in Chrome (`http://localhost:4180/full-crm-preview.html?role=flight#/app/flight/s-412-f?tab=work`):**
- Opened Alternative sectors → Alternate on sector 02 → unticked one passenger (picker shows 2 chips, "2/3", persons = 2) → changed flight to 6E 2210 19:05–21:40 with a remark → **Save alternative** → row 02-A "Waiting for Sales approval" appears. ✅
- Filled sector 01, passenger 1 (Amadeus, ABC123, XYZ789, ticket, ₹7,800) → ticked → Confirm Selected → summary 1 confirmed / 5 pending / ₹7,800, row green, sector "Partially confirmed". ✅
- Finish card: checklist lists the 3 open steps with the original messages; Mark flight done is disabled. ✅
- Alternative table at 1440 px: no sideways scroll, even with the editor open. At 375 px: no page-level sideways scroll (tables scroll inside their own box). ✅
- Done tasks s-390-f and s-301-f, not-taken s-455-f, Manager view, and Sales Deal Services tab all open. No console errors. ✅

---

## 3 November 2026 — Session 6b: your corrections

Full details: `FLIGHT_SECTOR_WORKFLOW.md`, section 5. Files: `build/src/50-flight-visa.js`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- **Sales approval kept:** a saved alternative waits for the Sales owner (Approve, or Reject with a reason, on the Deal's Services tab). It can't be confirmed until approved. If rejected, its passengers go back to their sector. Mark done is blocked while one waits. The "Sales approval" step is back on the progress bar.
- **Fares back:** each passenger ticket row has a required Fare (INR) box; + Add passenger copies it for the same passenger type. The total actual fare and approved budget are shown again (also on the Done view). The alternative still has no fare.
- **Fixed:** money showed "₹48,000.00.00" on the Flight/Visa pages (".00" added twice). It now shows "₹48,000.00".
- **Tested live in Chrome:** reject → passengers return; new alternative → approve → confirm all with fares → Done (₹46,200). Phone width and console are clean.

---

## 3 November 2026 — Session 6: sector workflow from `flight_changes.md`

Full write-up (what, how, why, tests): **`FLIGHT_SECTOR_WORKFLOW.md`**.

**Changed:** `build/src/50-flight-visa.js`, `build/src/50-flight.css`; rebuilt `full-crm-preview.html`. Not committed or pushed.
- Removed the "Flight lines for the invoice" card from the Work tab (data kept).
- New collapsible **Alternative flight sectors** card with inline editing, passenger choice, number of persons and remark. Saving keeps the original and creates a Pending confirmation sector.
- New **Flight sector confirmation** card: checkboxes, passenger sub-rows, + Add passenger (copies CRS/PNR, ticket number +1), + Add Sector, Confirm Selected Sectors, passenger and sector statuses.
- Mark flight done needs every passenger confirmed on every active sector and an e-ticket, and lists who is pending.
- The old Confirm and Alternate popups were removed. Alternatives no longer wait for Sales approval (Sales gets a notice; see decision D1).

**Tested live in Chrome:** the full flow on s-412-f to Done, plus Sales, Manager, done tasks and 375 px. No console errors.

---

## 2 November 2026 — Session 5: progress bar added

Approved with the recommended answers: "Sales approval" step only when an alternative was sent; bar shown on every tab.
Rebuilt with `PYTHONUTF8=1 python build/assemble.py`. Syntax check passes.

**Changed:**
1. **New file `build/src/50-flight.css`**: styles for the bar only (all classes start with `fv-prog`). Needed because the main style sheet (`live.css`) is pre-built and does not contain new Tailwind classes. Uses the app's own colour variables (green `--color-status-success` for finished steps). The build adds it automatically.
2. **`build/src/50-flight-visa.js` line 897, new `flightProgress(id)`**: works out the steps from data that already exists. Nothing new is saved.
   - Take task: done when someone has taken it.
   - Sales approval (only if an alternative was ever sent): done when no sector is waiting for Sales or rejected. While open it shows "Waiting" or "Rejected · revise".
   - Confirm sectors: done when every sector is Confirmed. Shows "1 of 2" etc.
   - Attach e-tickets: done when an e-ticket file is attached.
   - Flight done: done when the task is done. A done task shows every step ticked.
   - The current step is the first one not finished. A cancelled task shows all steps greyed out, with "Cancelled".
3. **Line 913, new `progressBar(id)`**: draws the bar as a list with ticks, numbers, `aria-current="step"`, and hidden text for screen readers ("Step 3 of 5: Confirm sectors, current step").
4. **Line 1051**: the bar is placed under the task title and status line, above the tabs, so it shows on Details, Work, Files and History.

**Tested live in Chrome. No console errors.**
- s-455-f (not taken): step 1 "Take task" is current. ✅
- s-390-f and s-301-f (done): all steps ticked. ✅
- s-412-f full flow:
  1. Confirmed sector 1 → "Confirm sectors 1 of 2" is current.
  2. Sent an alternative on sector 2 → a 5th step "Sales approval · Waiting" appears and is current.
  3. Sales approved → that step is ticked.
  4. Confirmed sector 2 → "Attach e-tickets" is current.
  5. Attached an e-ticket → "Flight done" is current.
  6. Marked done → all 5 ticked. ✅
- Manager role sees the bar. ✅
- 375 px phone width: the bar fits in one row, with no sideways scroll. ✅

---

## 2 November 2026 — Session 4: progress bar plan (no code changed)

**Files added:** `FLIGHT_PROGRESS_BAR_PLAN.md`, the plan for a step progress bar on the Flight task page, based on `image (12).png`.
**Source code changed:** none. Waiting for approval.

---

## 2 November 2026 — Session 3: plan finished and tested in the browser

All edits are in `build/src/50-flight-visa.js`. Rebuilt with `PYTHONUTF8=1 python build/assemble.py`. Syntax check passes.

**Changed:**
1. **Bug 4: Alternate popup** (`fv-alternate`, `fv-alternate-submit`, new `ALT_FIELDS` list). The popup now asks for the alternative flight: Airline, Flight number, From, To, Class, Departure date and time, Arrival date and time, plus Adult/Child/Infant fares (all three always shown; only the ones with passengers are required), Reason and Notes. It is pre-filled from the current sector. After a rejection, "Revise alternate" pre-fills the rejected proposal and shows Sales' reason. On submit it checks: the flight details are complete (`segmentErrors`), at least one detail is different from the current flight, fares are entered, and a reason is given. The saved `proposedSegment` is now what Flight typed, not a copy of the original.
2. **Bug 5:** `fv-alternate` and its submit use `alternateBlock` in place of `canPropose`. Only a sector that is pending or confirmed is blocked, and a message explains why. Other sectors can still be confirmed or sent as alternatives (answer B).
3. **Sales decides each sector on its own:** `fv-decision`, `fv-reject-confirm` and `decideProposal` now use `latestFor(s, proposal.sectorIndex)` instead of "latest proposal on the whole task". Removed the `flightTicket.issued` check from `decideProposal`, which blocked decisions for no reason.
4. **Bug 9:** `fv-confirm-sector-submit` now checks `canEditFlight`, and uses `latestFor`.
5. **Small fix:** the Confirm popup shows the date as `18 Nov 2026` (`TN.fmt.date`).
6. **Small fix:** Alternate error messages said "Sector 1" for every sector. They now name the right sector.
7. **Small fix:** the old "Still to do: …" message stayed on screen after the missing items were done. It is now cleared when a sector is confirmed or an e-ticket is attached.
8. **Phone width fix:** at 375 px the in-progress Work tab was 580 px wide. The cause was the hidden screen-reader text ("sector 1") inside the Confirm/Alternate buttons, which sat outside the table's scroll box. Added `relative` to those two buttons (lines 922–923).

**Not changed (as planned):** dead code from the removed "Flight availability" section is still there; `canPropose` is still used only by that dead code. The Infant fare box is kept visible (Prompt 7).

**Tested live in Chrome at `http://127.0.0.1:4180/full-crm-preview.html`. No console errors in any step.**
1. Work tab opens for s-412-f, s-390-f, s-301-f, s-455-f. ✅
2. Alternate on s-412-f sector 2 with nothing changed → refused with a clear message. With a new flight (6E 2210, 19:05–21:40) → saved as pending. Sector 2 then shows only "Pending Sales approval", with no buttons; sector 1 still has Confirm and Alternate. ✅
3. Sent a second alternative on sector 1 while sector 2 was pending (sectors are independent). ✅
4. Sales role, Deal BX-38412 → Services: two separate review blocks. Approved sector 2 and rejected sector 1 with a reason. Both saved correctly. ✅
5. Flight: sector 1 shows "Rejected alternative" with only "Revise alternate". Sector 2 shows the new flight as "Approved alternative" → Confirm (popup date `18 Nov 2026`) → "Confirmed" with an Edit button. (Bug 3 fixed.) ✅
6. "Mark flight done" too early → lists what is missing. Revised sector 1 → Sales approved → confirmed → attached a PDF e-ticket → Mark flight done → confirm popup (PNRs XYZ789, ABC123) → task is **Done · ticket issued**. ✅
7. Manager role (Flight task pages) and Sales role (Deal Services tab) open with no errors. Flight pages show no selling price. ✅
8. 375 px width: no sideways scroll on the Flight Work tab (in progress and done), the Sales Deal Services tab, or the Manager view. ✅

---

## 2 November 2026 — Session 2: plan executed (PARTLY DONE, stopped at usage limit)

Answers used: A = PNR + ticket no. + fares (recommended), B = sectors independent, C = remove remarks.
All edits are in `build/src/50-flight-visa.js` (Flight part only). Rebuilt with `PYTHONUTF8=1 python build/assemble.py` (plain `python build/assemble.py` fails on this Windows PC with a UnicodeDecodeError; the `PYTHONUTF8=1` setting fixes it).
**Checked:** syntax check passes, rebuild OK. **Not yet tested in the browser.**

**Done:**
1. Bug 1: `issued.length` changed to `confirmedSegments(s).length` in `flightInvoiceLines`, so the Work tab should open again.
2. Bug 3: `sectorStatus` now shows "Confirmed" when a sector has a valid PNR, even if it came from an approved alternative. New helpers: `latestFor` (latest proposal for one sector), `validPnr`, `alternateBlock` (says why Alternate can't be used).
3. Bug 2: the "Mark flight done" checklist now needs: every sector confirmed with PNR and ticket no., fares for every sector, e-tickets, and no alternative pending or rejected. The broken `#availability-…` link is gone.
4. `workSegments` now only uses saved ticket rows that have a valid PNR, so an old unconfirmed row can't hide a newly approved alternative.
5. Bug 6: sector buttons now match the status. Pending: no buttons. Confirmed: "Edit". Rejected: "Revise alternate". Otherwise: Confirm + Alternate.
6. Bug 7: the yellow warning only appears when a sector is pending or rejected.
7. Bug 8: removed the "Ticketing remarks" box. The Done view only shows remarks if some were saved earlier.
8. Sales side (`salesReview`): shows one block per sector (its latest proposal), each with its own Approve/Reject.

**Plan change:** Prompt 7 says all three fare boxes (Adult/Child/Infant) must always be visible, so I'm **not** hiding the Infant box. The Alternate popup will be changed to show all three as well.

**Still to do (next session):**
- Bug 4: add the flight detail fields to the Alternate popup (Airline, Flight no., From, To, Class, Travel date, Departure/Arrival time, all 3 fares), check them, and save them as the proposed sector.
- Bug 5: make `fv-alternate` use `alternateBlock` (show a message, block only that sector) in place of `canPropose`.
- `fv-decision`, `fv-reject-confirm`, `decideProposal`: replace the `latestProposal(s)` check with `latestFor(s, proposal.sectorIndex)` so Sales can decide each sector on its own. Until this is done, only one alternative can be pending at a time. That still works, because `fv-alternate` still uses `canPropose`.
- Bug 9 and small fixes: add the `canEditFlight` check to Confirm submit, and show the Confirm popup date as `14 Nov 2026`.
- Live browser tests 1–6 from the plan.

---

## 2 November 2026 — Session 1: analysis only

**Source code changed:** none.

**Files added:**
- `FLIGHT_WORK_TAB_PLAN.md`: the analysis, the 9 bugs found, the fix plan and 3 questions.
- `FLIGHT_CHANGES_LOG.md`: this file.

**What was done:**
- Read the build setup (`build/assemble.py`, `build/BRIEF.md`) and the Flight code in `build/src/50-flight-visa.js`.
- Syntax-checked all JS source files: all pass.
- Served the project locally (`http://127.0.0.1:4180`) and opened it in Chrome as the Flight role.
- Reproduced the problem: the Work tab crashes with `ReferenceError: issued is not defined` (line 961) on every flight task that has been taken.
- In a temporary test copy (since deleted), checked that a one-line fix opens the Work tab, then tested Confirm, Alternate, Sales approval and "Mark flight done" to find the other bugs listed in the plan.

**Next:** waiting for approval of `FLIGHT_WORK_TAB_PLAN.md`.
