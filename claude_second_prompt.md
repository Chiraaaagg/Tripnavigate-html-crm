# TRIPNAVIGATE CRM — FLIGHT MODULE UI REFINEMENT (PROMPT 2)

## ROLE

Act as a Senior Frontend Engineer, UI/UX Architect, and Full-Stack Developer working on the existing TripNavigate CRM.

The Flight module has already been modified based on previous requirements. Your task now is to **refine the existing Flight Task interface**, fix layout problems, and remove one unnecessary fare field.

This is a continuation of the previous implementation, not a new project.

**Important: Carefully inspect the current code before modifying anything. Do not recreate, rebase, restructure, or rewrite the existing implementation.**

---

## 1. STRICT DEVELOPMENT RULES

- Analyze the current Flight Task implementation and its associated styles.
- Make only small, targeted changes.
- Do not rebase, reset, rebuild, or restructure the repository.
- Do not overwrite uncommitted changes.
- Do not modify unrelated CRM sections.
- Do not replace entire components when a small layout adjustment is sufficient.
- Preserve existing functionality, backend APIs, database relationships, and permissions.
- Reuse existing design components and CSS conventions.
- Do not introduce additional features that I have not requested.
- If anything is unclear, **ask me rather than assuming and implementing your own interpretation**.
- If a change outside the Flight module becomes necessary, explain it and request approval first.
- Review the Git diff after implementation.

Use the supplied screenshots as references for the existing layout problems.

---

# TASK 1 — REARRANGE FLIGHT DETAILS PAGE LAYOUT

### Current layout

Inside:

**Flight Tasks → Select Flight Task → Details**

Currently, the following two cards are displayed side by side:

- Flight details
- Travellers and budget

Below those cards is:

- Where this came from

This is causing the Flight details table to become unnecessarily narrow, leading to horizontal scrolling.

### Required new layout

Change the arrangement to:

**ROW 1 — FULL WIDTH**

`Flight details`

This card must occupy the full available content width, excluding the existing sidebar and page margins.

The complete flight segment table should have enough space for its columns.

**ROW 2 — TWO COLUMNS**

| Travellers and budget | Where this came from |
|---|---|
| 50% width | 50% width |

Both cards should be on the same row on desktop with consistent spacing, alignment, and padding.

### Layout illustration

```text
┌─────────────────────────────────────────────────────────────┐
│ FLIGHT DETAILS                                              │
│                                                             │
│ #  FROM  TO  TRAVEL DATE  DEPARTURE  ARRIVAL  AIRLINE ...   │
│ 1  JDH   DEL 02 Dec 2026   —          —        —            │
│ 2  DEL   COK 02 Dec 2026   —          —        —            │
│ 3  COK   DEL 08 Dec 2026   —          —        —            │
│ 4  DEL   JDH 08 Dec 2026   —          —        —            │
│                                                             │
│ Passengers: 2      Cabin: Economy                           │
│ Journey timing requirement: Reach Kochi before 4 PM         │
│ Notes: Honeymoon couple, seats together if possible         │
└─────────────────────────────────────────────────────────────┘

┌───────────────────────────┐ ┌─────────────────────────────┐
│ TRAVELLERS AND BUDGET     │ │ WHERE THIS CAME FROM        │
│                           │ │                             │
│ Travellers: 2             │ │ Deal: BX-38455              │
│ Approved budget: ₹42,000  │ │ Branch: Jodhpur             │
│ Traveller names           │ │ Accepted version: 1         │
│ Quotation document        │ │ Saved by / Saved date       │
│                           │ │ Task created                │
└───────────────────────────┘ └─────────────────────────────┘
```

The illustration represents the intended layout only, not hardcoded data.

### Responsive requirements

Desktop:

- Flight details: 100% content width.
- Travellers and budget: approximately 50%.
- Where this came from: approximately 50%.
- Both lower cards should align neatly.

Tablet and mobile:

- Flight details remains full width.
- Lower cards stack vertically when necessary.
- Tables must remain readable.
- Avoid unnecessary horizontal scrolling.
- Do not reduce fonts excessively to fit columns.

### Important

Preserve all existing information, including:

- Flight sectors
- Passenger count
- Cabin
- Journey timing requirement
- Notes
- Traveller names
- Approved budget
- Quotation document
- Deal information
- Branch
- Accepted booking version
- Saved timestamps
- Task creation information

Do not remove or modify the existing Traveller details and ID proofs section.

Keep that section below the rearranged cards in its existing workflow position.

Do not change its document permissions or viewing controls.

---

# TASK 2 — REDESIGN FLIGHT SEGMENT ENTRY IN WORK TAB

## Current problem

Inside:

**Flight Tasks → Work → Flight details entry**

The current editable flight table contains fields such as:

- From
- To
- Departure date
- Arrival date
- Departure time
- Arrival time
- Airline
- Flight number
- Remove action

The current form looks cramped, with very narrow inputs.

Examples of the problems visible in the screenshots:

- Airport code fields are too narrow.
- Some airport codes are clipped.
- Airline and flight number fields are cramped.
- Too many editable columns are forced into one horizontal row.
- Date and time fields consume excessive horizontal space.
- The form requires awkward horizontal scrolling.
- The Remove action is partially off-screen.
- Input fields do not have enough breathing room.

This needs to look like a professional travel CRM booking interface.

## Required solution

Redesign this entry area with a more spacious, readable, professional layout.

**Do not simply reduce input font sizes or padding to force everything into one table row.**

### Preferred design — Individual flight sector cards

Use one clean, structured card for each flight sector instead of forcing all editable fields into a single overly wide table.

Example:

```text
┌──────────────────────────────────────────────────────────┐
│ SECTOR 01                                JDH → DEL      │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ From                   To                                │
│ [ JDH            ]     [ DEL             ]               │
│                                                          │
│ Departure Date         Arrival Date                      │
│ [ 02-12-2026     ]     [ Select date     ]               │
│                                                          │
│ Departure Time         Arrival Time                      │
│ [ Select time    ]     [ Select time     ]               │
│                                                          │
│ Airline                Flight Number                     │
│ [ Airline        ]     [ Flight no.      ]               │
│                                                          │
│                                     [ Remove sector ]    │
└──────────────────────────────────────────────────────────┘
```

Repeat the card for each sector.

The design should be elegant, compact enough for operational use, but not crowded.

### Suggested desktop structure

Use a responsive grid with two or four columns depending on the available width.

Recommended logical field groups:

**Group 1 — Route**

- From
- To

**Group 2 — Dates**

- Departure date
- Arrival date

**Group 3 — Timings**

- Departure time
- Arrival time

**Group 4 — Flight information**

- Airline
- Flight number

Use clear labels above each input.

Make all fields comfortably readable.

### Input design requirements

- Consistent input height.
- Adequate horizontal padding.
- Clearly visible airport codes.
- Proper minimum input widths.
- Normal-sized readable text.
- Consistent date pickers.
- Consistent time inputs.
- Proper field grouping.
- Consistent border radius.
- Balanced vertical spacing.
- Proper focus states.
- No clipped values.
- No overlapping fields.
- No truncated Remove buttons.

Use the existing TripNavigate blue-and-white design language.

### Sector organization

Display a heading such as:

**Flight sectors — 4**

Then show:

- Sector 1 — JDH → DEL
- Sector 2 — DEL → COK
- Sector 3 — COK → DEL
- Sector 4 — DEL → JDH

Populate headings dynamically from the current saved segments.

Keep the existing Add Sector and Remove Sector actions if they already exist.

Preserve segment ordering.

Do not change how segment data is stored or saved unless absolutely necessary.

### Functional requirements

All existing field functionality must remain working:

- Editing airport codes
- Updating dates
- Updating departure/arrival times
- Updating airline
- Updating flight number
- Adding flight sectors
- Removing flight sectors
- Preserving edited data
- Form validation
- Submission
- Existing Sales approval logic
- Existing alternative flight workflow

The redesign must be primarily presentational.

Do not introduce new data structures or backend endpoints merely to achieve a better layout.

### Responsive behavior

Desktop: organized cards with multi-column inputs.

Tablet: reduce columns gracefully.

Mobile: stack fields vertically in a readable order.

No viewport should display clipped field values or horizontal overflow caused by the entry form.

---

# TASK 3 — REMOVE "PROPOSED TOTAL FARE (INR)" FIELD

## Current issue

The current Flight Work interface contains an input labelled:

**Proposed total fare (INR)**

It is visible in the alternative flight proposal area.

We do not want this block displayed anymore.

### Required change

Remove the entire visible **Proposed total fare (INR)** input block from that form.

This includes:

- Field label
- Input field
- Placeholder/default value
- Field-specific explanatory text
- Unnecessary spacing left after removal

### Important restrictions

Do not remove the actual ticket amount field from the Finish this flight workflow.

Do not remove the approved budget information from Flight Details.

Do not remove the actual fare recorded after ticket issuance.

Do not delete existing financial records.

Do not modify customer selling price calculations.

Do not remove fields from the database simply because this UI field is no longer required.

### Validation and submission

Inspect whether Proposed total fare is currently:

- A required field
- Part of form validation
- Included in alternative proposal submission
- Used by backend calculations
- Used by approval logic
- Used by notifications or proposal comparisons

If removing it from the visible form leaves any validation requiring the user to enter it, identify and correct that dependency **only after determining that doing so will not alter established business rules**.

If the proposal fare is mandatory for business approval or is relied on by an existing API contract, ask me before modifying that behavior.

Never silently hardcode a value of `0`, `1`, or another amount just to satisfy validation.

Never create a fake fare value.

The objective is to remove the unnecessary visible field safely, not break alternative approval or financial logic.

---

# TASK 4 — PRESERVE EXISTING APPROVAL AND TICKETING WORKFLOW

This is a UI refinement task.

Do not rebuild the Sales approval workflow.

Do not change how alternative flights are submitted, approved, or rejected.

Preserve:

1. Flight Executive checks availability.
2. Flight Executive proposes an alternative if required.
3. Alternative is submitted to Sales.
4. Sales reviews the proposal.
5. Sales approves or rejects.
6. Ticketing remains blocked for unapproved alternatives.
7. Approved alternatives proceed to ticketing.
8. Flight Executive records the actual PNR, dates, ticket amount, and e-ticket.
9. The task completes after validation.

Changes to the Flight input layout must not accidentally affect any of these operations.

---

# TASK 5 — REVIEW AND TEST THE UPDATED UI

After implementing the approved changes, verify the following:

### Details tab

- Flight details occupies the full available row.
- Flight sectors are readable.
- Unnecessary horizontal scrolling is eliminated where practical.
- Travellers and budget shares a row with Where this came from.
- Both cards align properly.
- Traveller details and ID proofs remains unchanged.
- All existing displayed data is preserved.

### Work tab

- Flight sector entry is spacious and professional.
- No airport codes are clipped.
- All dates and times are readable.
- Airline and flight number fields are usable.
- Add/remove sector actions still work.
- Existing save and submission actions work.
- Responsive behavior is correct.
- No input overlap or unexpected horizontal scrolling.

### Fare field

- Proposed total fare input is no longer visible.
- No empty block remains.
- No false or hardcoded value is submitted.
- Actual ticket fare is unaffected.
- Existing approval and validation behavior remains correct or any necessary adjustment is approved.

### General regression checks

- No changes to unrelated CRM modules.
- No changed authentication or permissions.
- No deleted records.
- No unintended schema changes.
- No broken existing flight tasks.
- No broken notification workflow.
- No unintended Git modifications.

Run the relevant lint, type-check, tests, and build commands that are available in the repository.

---

# IMPLEMENTATION PROCEDURE

## Phase 1 — Inspect

Analyze the actual current Flight Task code and the attached screenshots.

Find the components and styles responsible for:

- Flight Details card layout
- Travellers and budget
- Where this came from
- Editable Flight sector rows
- Proposed total fare field

Identify the smallest changes necessary.

## Phase 2 — Present plan

Before editing, give me:

- Exact files to modify
- Planned layout changes
- Planned removal of proposed fare UI
- Any validation or backend dependencies
- Any questions requiring clarification

**Wait for my approval before editing.**

## Phase 3 — Implement

After approval, make targeted changes.

Do not rewrite the entire Flight Task page.

Do not perform broad refactoring.

Do not rebase or rebuild the project.

## Phase 4 — Verify

Test both desktop and mobile layouts.

Review the final Git diff.

Confirm that no unrelated files have changed.

## Phase 5 — Report

Provide a concise final summary showing:

1. What was modified.
2. Which files were changed.
3. What was preserved.
4. What was tested.
5. Any unresolved issues.

---

# FINAL INSTRUCTION

**This task consists of exactly three requested UI changes:**

1. **Details tab:** Make Flight details full width, and place Travellers and budget alongside Where this came from in the next row.
2. **Work tab:** Replace the cramped editable flight sector table with a spacious, professional, responsive sector-entry interface.
3. **Alternative proposal:** Remove the Proposed total fare (INR) input block without breaking any existing functionality.

Do not assume unclear requirements.

Do not invent new workflows.

Do not rebase or restructure the code.

Do not modify unrelated functionality.

Analyze first, ask when uncertain, obtain approval, and implement the smallest safe changes to the existing Flight module.