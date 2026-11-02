# TRIPNAVIGATE CRM — PROMPT 4: FARE BREAKUP, SECTOR-LEVEL TICKETING, AND ALTERNATIVE FLOW REFINEMENT

## ROLE

Act as a Senior Full-Stack Engineer, Enterprise CRM Product Designer, and Workflow Architect working on the existing **TripNavigate CRM**.

You are continuing work on the existing Flight module.

This is a **targeted refinement task**. You must carefully update the current Flight Task UI and workflow based on the latest requirements.

Do **not** rebuild, rebase, or restructure the project.

Do **not** modify unrelated modules.

Do **not** assume anything unclear. If something is uncertain, inspect the code and ask before implementing that part.

---

# 1. STRICT IMPLEMENTATION RULES

Before editing anything:

- Inspect the current Flight module implementation.
- Understand the existing Sales-to-Flight handoff.
- Understand how passenger counts and traveller types are currently stored.
- Understand how sector data is stored.
- Understand how alternative flight approval currently works.
- Understand how fare values are currently handled in the Flight workflow.
- Check git status and existing uncommitted changes.

Follow these rules:

- Make only targeted changes.
- Reuse current components, handlers, and state structure wherever possible.
- Do not refactor unrelated code.
- Do not rewrite entire pages unless absolutely necessary.
- Do not change database schema unless required and approved.
- Do not invent new business logic where existing logic already exists.
- If a requirement conflicts with the current architecture or is unclear, ask before implementing.

---

# 2. UPDATE “TRAVELLERS AND BUDGET” TO SHOW PASSENGER BREAKUP

## Current issue

The **Travellers and budget** section currently shows:

- total travellers
- approved budget
- traveller names

But it does not show the required **passenger-type breakup**.

## Required change

Update the **Travellers and budget** section so the budget and passenger summary clearly show a breakup like:

- Adults: X
- Children: X
- Infants: X

And the budget/fare breakup must reflect those types.

### Example display idea

```text id="0nb6t0"
Travellers on the accepted version
Adults: 2
Children: 1
Infants: 1

Approved budget
Adult: ₹xx,xxx × 2
Child: ₹xx,xxx × 1
Infant: ₹x,xxx × 1
Total approved budget: ₹xx,xxx
```

This is only an example of structure, not exact hardcoded content.

## Requirements

- Show passenger-type counts clearly.
- Show budget breakup by adult / child / infant where that data exists.
- If only counts exist and fare breakup does not yet exist, inspect the current accepted Sales data structure and determine whether breakup values are available.
- Reuse current accepted Sales version data.
- Do not invent passenger categories or amounts.

### Important

If the Sales-side accepted version does **not** currently store budget breakup by adult / child / infant, inspect how best to derive or store it and **ask me before changing the data model**.

---

# 3. FLIGHT DETAILS — SHOW CLASS PER TICKET / SECTOR AND REMOVE “CABIN” SUMMARY

## Current issue

In **Flight details**, there is currently a generic summary field:

- Cabin

But now the requirement is to show **class per ticket / per sector** and remove the standalone Cabin row.

## Required change

### In Flight details sector table:

Add a **Class** column so every sector shows its class individually.

Example:

| #   | From | To  | Travel Date | Departure | Arrival | Airline / Flight | Class | Preferred Time |
| --- | ---- | --- | ----------- | --------- | ------- | ---------------- | ----- | -------------- |

Use the actual class coming from the accepted Sales booking or sector data.

### Also:

- Remove the old standalone **Cabin** summary row from the bottom summary list.
- Do not display Cabin separately if class is already shown at sector level.
- Preserve all other useful information.

## Important

If class currently exists only once at itinerary level and not per sector:

- Use the same class value for each sector **only if that reflects the accepted Sales booking logic**.
- Do not invent different classes per sector unless the data already supports that.
- If this requires structural clarification, ask before implementing.

---

# 4. CHANGE “JOURNEY TIMING REQUIREMENT” LABEL TO “COMMENT”

## Current issue

The label currently says:

**Journey timing requirement**

## Required change

Rename this field label to:

**Comment**

### Important

- This is a naming and display change.
- Preserve the underlying content.
- Do not delete the stored value.
- Do not remove comments from the workflow.
- If the field is reused elsewhere under the old name, update only where appropriate for the Flight Details UI unless a wider rename is clearly required.

---

# 5. FLIGHT SECTOR ENTRY — SALES AUTO-FILLS MOST DATA

## Current issue

In the current Flight Work sector entry table, the Flight team is able to fill many fields.

But now the requirement is:

**All core sector information should already come from Sales.**

The Flight Executive should only enter the limited ticketing details needed from the actual booking side.

## Required change

For each flight sector in the Work section:

### Sales should prefill / lock or read-only display:

- From
- To
- Travel date
- Departure date/time if provided by Sales
- Arrival date/time if provided by Sales
- Airline, if provided by Sales
- Flight number, if provided by Sales
- Class
- Traveller-type context if required
- Any other accepted itinerary information already submitted by Sales

### Flight Executive should enter only:

- PNR
- Ticket number
- Fare for that sector

## UI behavior

- Show Sales-entered fields clearly, preferably as read-only or non-editable values in the sector row/card.
- Keep editable only the fields Flight must actually fill.
- Make it visually obvious which values came from Sales and which values Flight must enter.

### Important

Do not remove any required underlying values from the workflow.

Do not break the existing approval logic.

If the current system allows Flight to edit core sector fields because of the alternative workflow, preserve that capability only inside the dedicated alternative flow, not in the normal ticket-entry flow.

---

# 6. FARE SHOULD BE STORED AND SHOWN PER SECTOR

## Current issue

Fare handling is currently not aligned to sector-level ticketing needs.

## Required change

Each sector should have its own **fare** entry.

That fare must reflect the actual booking amount for that specific sector.

### Flight Executive should enter:

- Sector fare

### This fare must support breakup by passenger type:

- Adult fare
- Child fare
- Infant fare

### Example idea

For each sector:

```text id="oo9s5z"
Sector 01
Adult fare: ₹____
Child fare: ₹____
Infant fare: ₹____
```

Or another compact layout that fits the CRM design.

### Requirements

- Fare should be entered per sector.
- Fare should support adult / child / infant breakup.
- Actual amount calculations should be based on these breakups.
- Do not keep only one generic total fare if sector-level fare is now needed.
- Allow calculation of actual total amount from sector-wise breakup values.

## Important

If the backend currently stores only one total fare field, inspect the current structure and identify the smallest safe way to support sector-level fare breakup.

If a schema change is needed, explain it and ask before implementation.

Do not fake totals or hardcode derived values.

---

# 7. ADD SEPARATE ALTERNATIVE BUTTON FOR EACH SECTOR

## Current issue

The alternative flight workflow is currently too broad and not sector-specific enough.

## Required change

Each sector should have its own **Alternate** action/button.

### Example

For every flight sector row/card:

- Alternate sector

When clicked, that sector alone should enter the alternative proposal flow.

## Expected behavior

If one sector is unavailable, Flight should not have to propose alternatives for the whole itinerary unnecessarily.

Instead:

- the specific affected sector gets an Alternate button
- Flight proposes an alternative for that sector
- Sales reviews that sector-specific change
- approval applies to that sector-level alternative

## Important

Preserve multi-sector logic.

If more than one sector needs an alternative, Flight should be able to send alternatives for multiple sectors.

If the current approval model is whole-itinerary-only and sector-wise alternative approval would change the data structure or approval logic significantly, inspect carefully and ask before making broader logic changes.

---

# 8. IN THE ALTERNATIVE FLOW, FLIGHT MUST ALSO SEND THE ACTUAL BOOKING AMOUNT

## Current issue

In the alternative flow, Flight is proposing changes, but now the requirement is that Flight must also send the **actual booking amount** for the alternative.

## Required change

When Flight proposes an alternative for a sector, include:

- proposed alternative flight details
- actual booking amount for that proposed option

And that amount must include breakup by:

- Adult
- Child
- Infant

### Example structure

```text id="bwycdx"
Alternative for sector 02
Adult amount: ₹____
Child amount: ₹____
Infant amount: ₹____
Actual total amount: ₹____
```

## Sales should see in approval

When Sales reviews the alternative, they should see:

- original requested sector
- proposed alternative sector
- actual booking amount
- adult/child/infant breakup
- total amount

This is necessary so Sales can approve or reject with correct financial visibility.

### Important

Do not confuse:

- approved budget
- proposed alternative amount
- actual ticketed amount
- customer selling price

These must remain distinct.

If the approval screen currently lacks fare structure for this, update it carefully using the smallest safe change.

---

# 9. ACTUAL AMOUNT MUST BE CALCULATED FROM ADULT / CHILD / INFANT BREAKUP

## Required logic

Any “actual amount” shown in the Flight workflow must be based on the breakup:

- Adult amount × adult count
- Child amount × child count
- Infant amount × infant count

Or on the equivalent existing project logic if already implemented differently.

### Requirements

- The actual total amount should be derived clearly from the breakup.
- Sales should be able to see this breakup when reviewing alternatives.
- Flight should be able to enter the breakup values cleanly.
- The UI should present the total clearly.
- Do not manually enter one total number if the new breakup inputs are used, unless existing business logic specifically requires both.

If automatic calculation introduces architectural uncertainty, ask before changing validation or persistence logic.

---

# 10. SEPARATE NORMAL TICKETING FLOW VS ALTERNATIVE FLOW

The updated logic should be clear:

## Normal flow

Sales has already entered sector information.

Flight only enters:

- PNR
- Ticket number
- sector fare breakup (adult/child/infant)

No unnecessary editing of base sector details.

## Alternative flow

When a sector is unavailable:

- Flight clicks Alternate for that sector
- enters alternate sector details
- enters actual amount breakup
- submits to Sales
- Sales reviews and approves/rejects
- only after approval can Flight proceed accordingly

Keep these two flows distinct in both UI and logic.

---

# 11. UI / UX REQUIREMENTS

Use the existing TripNavigate design system.

Keep the UI:

- clean
- professional
- minimal
- readable
- operationally efficient

### For Flight details table

Add the new **Class** column cleanly.

### For Travellers and budget

Add clean adult/child/infant breakup.

### For sector ticketing area

Clearly separate:

- read-only Sales data
- editable Flight fields

### For fare entry

Show adult / child / infant amounts clearly without clutter.

### For alternate action

Place a clear **Alternate** button per sector.

### For labels

Change:

- Journey timing requirement → Comment
- Remove Cabin summary row
- Use Class per sector instead

Do not make the interface crowded.

If additional layout adjustments are needed to keep the page readable, make only minimal relevant improvements.

---

# 12. DATA AND LOGIC SAFETY

Before implementing, inspect carefully whether the following currently exist:

- passenger type counts
- class at sector or itinerary level
- per-sector fare storage
- adult/child/infant fare breakup storage
- sector-level alternative workflow
- actual amount fields in the proposal flow

If any of these do not exist and require data-model changes:

1. identify the exact gap
2. identify the minimal required change
3. explain the impacted files/tables/APIs
4. ask me before implementing schema or structural changes

Do not silently change the data model.

Do not break existing saved tasks.

Do not destroy existing alternative proposal history.

Do not mix internal booking fare with customer invoice amount.

---

# 13. REQUIRED IMPLEMENTATION PROCESS

## Phase 1 — Analyze

Inspect the current implementation and identify:

- relevant components
- relevant styles
- relevant data structures
- relevant approval logic
- relevant validation rules

## Phase 2 — Present plan

Before editing, provide:

- files to modify
- what changes will be made in each file
- whether current data model already supports the new breakup logic
- whether schema/API changes are required
- any business logic questions

**Wait for my approval before editing.**

## Phase 3 — Implement

After approval:

- make the smallest safe changes
- preserve the current architecture
- reuse existing patterns
- update only necessary files

## Phase 4 — Verify

Test:

- flight details table
- class column display
- comment label rename
- travellers and budget breakup
- normal sector ticketing flow
- per-sector fare entry
- adult/child/infant fare breakup
- per-sector alternate button
- alternative proposal with actual amount breakup
- Sales approval visibility
- existing task completion flow
- regression on existing data

## Phase 5 — Report

Provide:

1. files modified
2. logic changes made
3. UI changes made
4. what was preserved
5. tests completed
6. unresolved issues, if any

---

# FINAL OBJECTIVE

Update the Flight module so that:

- **Travellers and budget** shows breakup for adult / child / infant
- **Flight details** shows **Class** per sector and removes **Cabin**
- **Journey timing requirement** becomes **Comment**
- **Sales** pre-fills sector details
- **Flight** enters only **PNR, ticket number, and fare**
- **Fare** is handled **per sector**
- **Actual amount** is based on **adult/child/infant breakup**
- Each sector has its own **Alternate** button
- In the alternative flow, Flight sends the **actual booking amount breakup**
- Sales can review alternative changes with correct financial details

Do not assume unclear rules.

Do not rebase or rebuild.

Do not modify unrelated modules.

Begin with analysis and planning only, then wait for approval before editing.
