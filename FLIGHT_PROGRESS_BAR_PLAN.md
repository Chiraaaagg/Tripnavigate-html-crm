# Flight task: progress bar — plan

Date: 2 November 2026
Scope: Flight module only (`build/src/50-flight-visa.js`). No other department file is touched.
Status: **DONE.** Approved with the recommended answers (A, B), built and tested in session 5. See `FLIGHT_CHANGES_LOG.md`.
Reference: `image (12).png` (5 steps: Take deal → Get rates → Final rate → Booking confirmed → Payment).

---

## 1. What the reference image shows

- One row of numbered circles, joined by a line, with a label under each circle.
- **Finished step:** filled teal circle with a tick, and the line after it is teal.
- **Current step:** white ring with the number, label in **bold**.
- **Later step:** grey ring with the number, grey line.
- It sits in its own rounded card.

## 2. Steps for a Flight task (my proposal)

| # | Step label | Finished when |
|---|---|---|
| 1 | Take task | Someone has taken the task |
| 2 | Sales approval | No alternative is waiting for Sales or rejected. **This step only appears if an alternative was sent.** If not, the bar has 4 steps. |
| 3 | Confirm sectors | Every sector is "Confirmed" (PNR + ticket no. + fares). The label shows the count while working, e.g. "Confirm sectors · 1 of 2". |
| 4 | Attach e-tickets | At least one e-ticket file is attached |
| 5 | Flight done | Task is marked done |

- The **current step** is the first step that is not finished.
- A cancelled task shows the bar greyed out, with "Cancelled" under it.
- The bar uses only data that already exists (`assignee`, `flightProposals`, `sectorStatus`, e-ticket files, `taskStatus`). Nothing new is saved.

## 3. Where it goes

- On the Flight task page, **under the title and status line and above the tabs**, so it shows on every tab (Details, Work, Files, History).
- Visible to every role that can open the Flight task (Flight, Manager). Sales does not see it, because Sales uses the Deal page.

## 4. Look and accessibility

- Uses the app's existing colours (the success/brand colour for finished steps), so it matches the rest of the CRM in light and dark mode. It will not copy the dark background from the image.
- Built as a list (`<ol>`) with `aria-current="step"` on the current step, and hidden text such as "Step 3 of 5, Confirm sectors, current" so screen readers can read it.
- **Phone width (375 px):** the circles stay in one row and the labels wrap onto two short lines. There is no sideways page scroll.

## 5. Steps of the work

1. Add a `flightProgress(s)` function that works out the steps and their state.
2. Add a `progressBar(steps)` function that draws the bar (in the Flight file only).
3. Insert it into the Flight task page, under the header.
4. Rebuild with `PYTHONUTF8=1 python build/assemble.py`.
5. Test in Chrome:
   - s-455-f (not taken): step 1 is current.
   - s-412-f: take it → confirm 1 sector ("1 of 2") → send an alternative (step 2 "Sales approval" appears) → approve → confirm all → attach an e-ticket → done. All steps show a tick.
   - s-301-f (done): all ticks.
   - Manager role, the 375 px phone width, and the console show no errors.
6. Record every change in `FLIGHT_CHANGES_LOG.md`.

## 6. Questions for you

**A. Steps:** are the steps in section 2 right? Or do you want exactly 5 fixed steps, always shown, like the image (Sales approval always shown, and ticked with "Not needed" when no alternative was sent)?

**B. Place:** under the header on every tab (recommended), or only on the Work tab?

Reply "approved" to use the recommended answers, or tell me what to change.
