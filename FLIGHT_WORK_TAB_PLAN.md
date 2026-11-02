# Flight task "Work" tab: analysis and fix plan

Date: 2 November 2026
Scope: Flight module only (`build/src/50-flight-visa.js`). No other department file is touched.
Status: **DONE.** Approved with the recommended answers (A, B, C), carried out and tested in sessions 2–3. See `FLIGHT_CHANGES_LOG.md`.

---

## 1. How the project is built (short)

- The page you open is `full-crm-preview.html`. It is **generated**; do not edit it by hand.
- The real code is in `build/src/*.js`. The Flight and Visa screens are in `build/src/50-flight-visa.js`.
- After editing a source file, rebuild with: `python build/assemble.py`
- Test copy (does not overwrite the main file): `python build/assemble.py test` → `build/out/test.html`

---

## 2. What I tested live

I served the project at `http://127.0.0.1:4180` and opened it in Chrome as the **Flight** role.

| Flight task | Details tab | Work tab | Files tab | History tab |
|---|---|---|---|---|
| s-412-f (JDH → GOX, in progress, yours) | Opens | **Crashes** | Opens | Opens |
| s-390-f (AMD → DXB, taken) | Opens | **Crashes** | Opens | Opens |
| s-301-f (DEL → SIN, done) | Opens | **Crashes** | Opens | Opens |
| s-455-f (not taken yet) | Opens | Opens | Opens | Opens |

Error in the browser console (exact):

```
ReferenceError: issued is not defined
    at flightInvoiceLines (50-flight-visa.js line 961)
```

So **every flight task that someone has taken** has a broken Work tab. Tasks nobody has taken yet open, because that part of the page is only drawn after the task is taken.

---

## 3. Errors found (in order of importance)

### Bug 1 (the reason the Work tab does not open) — CRITICAL

- **Where:** `build/src/50-flight-visa.js`, function `flightInvoiceLines`, line 961.
- **What:** the text uses `issued.length`, but no variable called `issued` exists in that function. JavaScript stops with an error and the whole page goes blank.
- **Why it happened:** the invoice-lines card was rewritten in the last session (Prompt 7 work) and this leftover was missed.
- **Fix:** replace `issued.length` with `confirmedSegments(s).length` (this function already exists and returns the confirmed sectors).
- **Verified:** I applied this one change to a throwaway test copy. After it, the Work tab opened for all 4 flight tasks with no errors. (Test copy deleted afterwards.)

### Bug 2 — "Mark flight done" can never succeed — HIGH

- **Where:** `flightChecklist` (line 587) and the Confirm popup (`fv-confirm-sector`, line 1238).
- **What:** the "done" check requires each sector to have an **arrival date and arrival time**. The Confirm popup only asks for fares, PNR and ticket number, and the Sales booking data has no arrival date/time. So after confirming every sector, the button still says *"Still to do: complete flight dates, airline, flight number and PNRs"*.
- **Tested:** confirmed both sectors of s-412-f → still blocked.
- **Fix (needs your choice, see section 5, question A):**
  - Option 1 (recommended): for "done", only require what the Confirm popup collects: PNR, ticket number and fares for each sector, plus e-tickets and Sales approval.
  - Option 2: add Arrival date and Arrival time fields to the Confirm popup.

### Bug 3 — after an approved alternative is confirmed, the sector never shows "Confirmed" — HIGH

- **Where:** `sectorStatus` (line 481).
- **What:** if a sector has an approved alternative, the status is always "Approved alternative", even after Flight confirms it with a PNR. That means "all sectors confirmed" is never true for that task, and the invoice lines / Sales view show it as unconfirmed.
- **Tested:** sent alternative for sector 2 → Sales approved → Flight confirmed with PNR → status still "Approved alternative".
- **Fix:** check for a valid PNR first; if the sector has one (and its alternative is approved), show "Confirmed".

### Bug 4 — the Alternate popup does not ask for the alternative flight — HIGH

- **Where:** `fv-alternate` / `fv-alternate-submit` (lines 1293–1323).
- **What:** the popup only has fares, reason and notes. The "proposed" flight saved is an exact copy of the original (tested: proposed `6E 6143 16:20` = original `6E 6143 16:20`). Sales is asked to approve an "alternative" that is identical to what they asked for. Prompt 7 asked for "alternative flight details, fares, reason and notes".
- **Fix:** add Airline, Flight number, Departure date, Departure time, Arrival date, Arrival time (pre-filled from the original sector) to the popup, validate them, and save them as the proposed sector. Reuses the existing `segmentErrors` check.

### Bug 5 — Alternate button silently does nothing — MEDIUM

- **Where:** `canPropose` (line 408) used by `fv-alternate`.
- **What:** the button does nothing (no message) when (a) another sector already has an alternative waiting for Sales, or (b) any sector has been confirmed (the ticket is marked "issued" as soon as all sectors have a PNR).
- **Fix:** show a clear message instead of doing nothing, and only block the sector that is actually pending/confirmed, not the whole task. (See question B.)

### Bug 6 — buttons shown when they cannot be used — LOW

- Confirm and Alternate buttons appear on sectors that are "Pending Sales approval"; Confirm then shows a red refusal. Alternate also appears on already-confirmed sectors.
- **Fix:** on a pending sector show only the status; on a confirmed sector show "Edit" (re-open Confirm) and hide Alternate, or keep both (see question B).

### Bug 7 — wrong warning at the top of the Work card — LOW

- **Where:** `finishCard` line 927.
- **What:** `blocked` depends on `s.flightAvailability === 'requested'`, which belonged to the removed "Flight availability" section and is never set any more. So the yellow warning *"Save drafts only. Do not book an alternative…"* always shows, even with no alternative.
- **Fix:** only show the warning when some sector has a pending or rejected alternative.

### Bug 8 — "Ticketing remarks" is never saved — LOW

- The remarks box in the Work tab is not inside any form and no button saves it. Whatever is typed is lost.
- **Fix:** either remove the box (Prompt 7 wanted a simpler Work tab), or save it with a small "Save remarks" button. (See question C.)

### Bug 9 — security check missing on Confirm — LOW

- `fv-confirm-sector-submit` does not check that the person is the assigned Flight executive (other handlers do, via `canEditFlight`). In the preview only the assignee sees the button, so it is not reachable today, but it should match the other handlers.
- **Fix:** add the same `canEditFlight` check.

### Small issues

- The Confirm popup shows the date as `2026-11-14` instead of `14 Nov 2026` (other screens use `TN.fmt.date`).
- The Confirm popup always shows an Infant fare box, even when the booking has 0 infants (the Alternate popup correctly hides it).
- The done-checklist links to `#availability-…`, a section that no longer exists.
- Dead code left from the removed section: `availabilityCard`, `actualFareBreakup`, `fv-save-ticket`, `fv-use-basis`, `fv-proposal-*`, `fv-availability`, unused `labels` in `finishSectorTable`. Harmless; I will **not** delete it unless you ask (Prompt 7 said not to delete proposal history logic).

### Checked and working

- Sales side (Deal → Services tab): the Flight alternative review card shows, and Approve works.
- E-ticket upload form renders and validates file type and size.
- Details, Files and History tabs work for every flight task.
- All 17 JS source files pass a syntax check. `full-crm-preview.html` matches the current source.

---

## 4. Plan (step by step)

All edits in `build/src/50-flight-visa.js` only.

| Step | Change | Bug |
|---|---|---|
| 1 | Fix `issued.length` → `confirmedSegments(s).length`. Rebuild, confirm Work tab opens for every flight task. | 1 |
| 2 | `sectorStatus`: a sector with a valid PNR shows "Confirmed", even if it came from an approved alternative. | 3 |
| 3 | Done-checklist: require PNR + ticket no. + fares per sector (per your answer to A), e-tickets, Sales approval. Fix its link target. | 2 |
| 4 | Alternate popup: add alternative flight detail fields, validate, save as proposed sector. | 4 |
| 5 | Alternate / Confirm rules: block per sector, never silently; show a message. Hide buttons that cannot be used. | 5, 6 |
| 6 | Warning at top of Work card: only when an alternative is pending or rejected. | 7 |
| 7 | Remarks: remove or save (per your answer to C). | 8 |
| 8 | Add `canEditFlight` check to Confirm submit; format date; hide Infant fare when 0 infants. | 9, small |
| 9 | Rebuild `full-crm-preview.html`. | — |

### Testing after the changes (live in Chrome)

1. Flight role: open the Work tab of s-412-f, s-390-f, s-301-f, s-455-f → no console errors.
2. Normal booking: confirm every sector → status "Confirmed" → attach an e-ticket → Mark flight done → task becomes Done.
3. Alternative: Alternate on one sector with a different flight → Sales role approves on the Deal → Flight confirms it → status "Confirmed" → done.
4. Rejection: Sales rejects → sector shows "Rejected alternative", Confirm blocked with a message.
5. Manager and Sales roles: the Flight task / Deal pages open with no errors; no selling price shown to Flight.
6. Phone width (375 px): no sideways page scroll.

Every change will be written to `FLIGHT_CHANGES_LOG.md` (what, where, why, test result).

---

## 5. Questions for you before I start

**A. To mark a flight done, what must each sector have?**
- Recommended: PNR, ticket number and fare(s) (what the Confirm popup asks for). Arrival date/time not required.
- Or: also add Arrival date and Arrival time to the Confirm popup and require them.

**B. While one sector waits for Sales approval, can Flight still confirm or send alternatives for the other sectors?**
- Recommended: yes, each sector is independent.

**C. "Ticketing remarks" box:** remove it (recommended, matches Prompt 7's simpler Work tab) or keep it with a Save button?

If you are happy with the recommended answers, reply "approved" and I will start with step 1.
