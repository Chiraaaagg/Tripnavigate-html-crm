# Flight module: change log

Every change made to the project is recorded here, newest at the top: what changed, which file and line, why, and how it was tested.

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
