# TRIPNAVIGATE CRM — PROMPT 3: COMPACT FLIGHT SECTOR ENTRY UI

## ROLE

Act as a Senior Frontend Engineer and Enterprise CRM UI/UX Architect.

You are working on the existing TripNavigate CRM Flight module.

The previous implementation converted flight sector entries into large individual cards. Although the fields are now readable, the form has become unnecessarily lengthy.

**Your task is to redesign only the Flight Sector entry interface into a compact, professional, horizontal layout inspired by the second reference screenshot.**

This is a UI refinement, not a workflow or architecture change.

## 1. UNDERSTAND THE CURRENT IMPLEMENTATION

Before modifying anything:

- Inspect the existing Flight Work section.
- Identify the current Flight Sector entry component and styles.
- Understand how sector data is saved and validated.
- Identify how PNR, ticket numbers, and date/time fields are handled.
- Review both screenshots provided.
- Check the existing Git diff before editing.

Preserve all existing functionality.

**Do not rebase, rebuild, restructure, or refactor unrelated code.**

If something is unclear, ask me rather than assuming.

## 2. CURRENT PROBLEM

Currently, each sector is displayed in a large form containing five rows of fields:

- From / To
- Departure date / Arrival date
- Departure time / Arrival time
- Airline / Flight number
- PNR / Ticket numbers

For four flight sectors, this produces a very long page requiring excessive vertical scrolling.

The interface looks more like a lengthy questionnaire than an airline ticketing workspace.

We need a compact operational interface where the Flight Executive can view and enter several flight sectors quickly.

## 3. REQUIRED DESIGN — COMPACT HORIZONTAL SECTOR TABLE

Use the second screenshot as the primary design reference.

Each sector should appear as **one horizontal row** inside a clean, structured table.

### Suggested layout

| #   | Airline | Flight No. | From | To  | Departure Date & Time | Arrival Date & Time | PNR   | Ticket No. |
| --- | ------- | ---------- | ---- | --- | --------------------- | ------------------- | ----- | ---------- |
| 01  | Input   | Input      | JDH  | DEL | Date + Time           | Date + Time         | Input | Input      |
| 02  | Input   | Input      | DEL  | COK | Date + Time           | Date + Time         | Input | Input      |
| 03  | Input   | Input      | COK  | DEL | Date + Time           | Date + Time         | Input | Input      |
| 04  | Input   | Input      | DEL  | JDH | Date + Time           | Date + Time         | Input | Input      |

The table above illustrates the desired arrangement. Use actual existing flight data.

### Main design goals

- One flight sector per row.
- All sectors visible in a single compact section.
- Significantly reduce vertical page length.
- Maintain readable field widths.
- Keep column headers consistent.
- Align inputs properly.
- Use compact but comfortable input heights.
- Preserve all existing editable fields.
- Minimize horizontal scrolling on common desktop screens.
- Do not use oversized cards.

**The result should resemble a professional airline booking or travel CRM entry table.**

## 4. DATE AND TIME FIELDS

Currently, departure date and departure time are separate large fields. The same applies to arrival.

For the compact layout, group these visually under:

**Departure Date & Time**

**Arrival Date & Time**

Preferred presentation:

- One date input and one time input grouped within the same table cell.
- Use native or existing project date/time controls.
- Keep the date and time values individually editable.
- Preserve the existing underlying data fields and formats.
- Ensure calendar and time-picker controls remain usable.

Do not change database field structures simply for visual grouping.

Do not use a combined datetime control if it would break existing data binding or timezone handling.

## 5. FIELD SIZING AND ALIGNMENT

Use sensible column sizing rather than giving every field equal width.

Suggested priorities:

- Sector number: very narrow.
- Airline: medium.
- Flight number: narrow.
- From: narrow.
- To: narrow.
- Departure date and time: wider.
- Arrival date and time: wider.
- PNR: medium.
- Ticket numbers: medium.

Maintain consistent alignment and spacing.

Airport fields must fully display codes such as JDH, DEL, COK, BOM, and DXB.

Date and time controls must not overlap or clip their icons.

Input text must remain readable.

Avoid excessive padding, oversized fonts, or unnecessary empty space.

Do not shrink text so much that the interface becomes difficult to use.

## 6. RESPONSIVE BEHAVIOR

### Desktop

Display the horizontal table.

Aim to show all important fields clearly at normal desktop widths.

### Smaller laptop and tablet

Allow controlled horizontal scrolling inside the table container if necessary.

Do not force the entire webpage to scroll horizontally.

### Mobile

Use compact stacked sector rows or responsive cards if required.

The mobile layout should not reproduce the previous excessively long desktop cards.

Keep labels clear and all fields accessible.

## 7. PRESERVE FUNCTIONALITY

The following must remain fully functional:

- Existing flight sector data
- From and To editing
- Departure date
- Arrival date
- Departure time
- Arrival time
- Airline
- Flight number
- PNR
- Ticket numbers
- Add Sector
- Remove Sector
- Existing form validation
- Existing Save actions
- Existing alternative flight approval workflow
- Existing ticket completion workflow

Do not remove fields simply to make the UI smaller.

Do not change backend APIs or database schema for this UI task.

If a field cannot reasonably fit without an important usability compromise, explain the trade-off rather than silently hiding it.

## 8. REMOVE EXCESSIVE VERTICAL SPACING

Reduce:

- Large field group gaps
- Excessive card padding
- Unnecessary row height
- Repeated sector headings
- Oversized empty areas
- Unnecessary form borders

Use one clean table container with a clear heading, such as:

**Flight Sectors (4)**

Keep the existing Add Sector action accessible.

Use subtle row dividers or alternating backgrounds for readability.

Keep TripNavigate's existing white background, blue actions, typography, borders, and spacing conventions.

## 9. STRICT CODE SAFETY

This instruction overrides any temptation to redesign other parts of the CRM.

- Modify only the existing Flight Sector entry UI and necessary local styles.
- Do not touch Flight Details layout.
- Do not touch Travellers and Budget.
- Do not touch Where this came from.
- Do not modify the Sales approval workflow.
- Do not change invoice calculations.
- Do not change actual ticket fare logic.
- Do not modify database schema.
- Do not introduce new dependencies.
- Do not rebase or reset the repository.
- Do not overwrite unrelated uncommitted changes.
- Do not change unrelated files.

Reuse the current state management, data structures, handlers, and validation logic.

**If uncertain, ask before making changes. Do not assume.**

## 10. IMPLEMENTATION PROCESS

### Step 1 — Analyze

Inspect the current sector entry component, related styles, and the supplied screenshots.

### Step 2 — Explain

Identify the exact files and localized modifications needed.

Present a concise implementation plan and obtain my approval before editing.

### Step 3 — Implement

After approval, replace the large sector-card layout with the compact horizontal table.

Preserve existing data handling and event handlers.

### Step 4 — Verify

Test:

- Four-sector booking
- One-sector booking
- Multi-city booking
- Input editing
- Date/time picker functionality
- PNR and ticket number entry
- Adding and removing sectors
- Saving and reloading
- Existing validation
- Desktop responsiveness
- Mobile responsiveness

Run available project checks and review the final Git diff.

### Step 5 — Report

Explain:

- Files modified
- UI improvements implemented
- Functionality preserved
- Tests completed
- Any remaining limitations

---

# FINAL EXPECTED RESULT

**Before:** Four large vertical sector forms, occupying excessive page height.

**After:** One compact, professional flight sector table, with each sector displayed horizontally and all required details editable.

The new interface must be:

- Compact
- Professional
- Easy to scan
- Fast for Flight Executives to use
- Readable
- Responsive
- Consistent with TripNavigate's existing design

**Do not sacrifice functionality for compactness. Do not modify anything outside the requested Flight Sector UI.**

Begin by analyzing the existing implementation and presenting the minimal modification plan. Wait for my approval before editing.
