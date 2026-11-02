# TRIPNAVIGATE CRM — PROMPT 7: SECTOR-WISE CONFIRMATION & ALTERNATIVE POPUPS

## ROLE

Act as a Principal Full-Stack Engineer, Senior CRM Workflow Architect, and Enterprise UI/UX Designer.

You are working on the existing TripNavigate CRM Flight module.

This is a targeted modification to the current Flight Task → Work interface. Do not rebuild, rebase, restructure, or rewrite the project.

You must understand the current implementation, identify the minimal necessary changes, and preserve existing business logic wherever it does not conflict with the requirements below.

**Do not assume anything unclear. Ask before implementing uncertain behavior.**

---

# 1. CRITICAL DEVELOPMENT RULES

1. Analyze the existing Flight module and its dependencies before editing.
2. Check Git status and preserve all uncommitted changes.
3. Do not run Git rebase, reset, force push, merge, or unauthorized commit.
4. Modify only the required Flight module code and approved Sales approval integration.
5. Do not change unrelated Deals, Accounts, Purchase, or invoice functionality.
6. Reuse existing components, APIs, data structures, permissions, and styling conventions.
7. Do not introduce unnecessary dependencies.
8. Do not create new business rules or invent missing data.
9. If backend, database, or shared-module modifications are necessary, explain them and obtain approval.
10. Present a file-by-file implementation plan and wait for explicit approval before modifying source code.

---

# 2. REMOVE THE ENTIRE "FLIGHT AVAILABILITY AND ALTERNATIVE" SECTION

## Current behavior

The Work tab contains a separate section named:

**Flight availability and alternative**

This section currently manages requested flight availability and alternative proposals.

## Required change

Remove this entire section from the visible Flight Task Work interface.

Remove its associated:

- Section heading
- Description
- Global availability buttons
- Global alternative proposal form
- Unnecessary surrounding layout and spacing

There should no longer be a separate global availability step.

**Do not delete existing saved alternative proposals, approval history, or related database records.**

The alternative workflow must now be accessible from each individual flight sector.

Reuse the existing proposal and approval functionality where possible.

---

# 3. REDESIGN THE FLIGHT SECTORS TABLE

## Required layout

Inside:

**Flight Tasks → Work → Finish this flight**

Display a clean, compact table with one row per flight sector.

The columns must be:

| #   | Airline | Flight No. | From | To  | Class | Date | Departure Time | Arrival Time | Actions |
| --- | ------- | ---------- | ---- | --- | ----- | ---- | -------------- | ------------ | ------- |

### Important requirements

- Show **only one Date column** for each sector.
- Show **two separate time fields**: Departure Time and Arrival Time.
- Do not show separate Departure Date and Arrival Date columns in this interface.
- Show the airline, flight number, route, class, and date already recorded for the sector.
- Preserve actual underlying booking data and dates.
- Do not delete the existing arrival-date value from storage merely because the Work UI displays one date.
- Do not invent missing data.
- Maintain the existing sector order.

### Layout example

| #   | Airline | Flight No. | From | To  | Class   | Date        | Dep.     | Arr.     | Actions             |
| --- | ------- | ---------- | ---- | --- | ------- | ----------- | -------- | -------- | ------------------- |
| 01  | IndiGo  | 6E 6142    | JDH  | GOX | Economy | 14 Nov 2026 | 10:35 AM | 01:59 PM | Confirm / Alternate |
| 02  | IndiGo  | 6E 6143    | GOX  | JDH | Economy | 18 Nov 2026 | 04:20 PM | 01:00 PM | Confirm / Alternate |

The examples are illustrative only. Always display actual saved data.

Do not use these values as hardcoded defaults.

If there are inconsistencies in stored times, preserve the values and report them through existing validation rather than automatically correcting them.

---

# 4. ADD TWO ACTION BUTTONS TO EVERY SECTOR

Each flight sector must have two separate actions:

**Confirm**

**Alternate**

Both actions must be clearly associated with their respective sector.

Place them in the Actions column.

### UI requirements

- Use compact, professional buttons.
- Use the existing TripNavigate blue-and-white design system.
- Keep the table easy to scan.
- Avoid excessive horizontal scrolling.
- Do not introduce large vertical sector cards.
- Use existing modal/dialog components.
- Ensure the modal is accessible and responsive.

Each button must open its own popup.

---

# 5. CONFIRM BUTTON — POPUP

## Required behavior

When the Flight Executive clicks **Confirm** on a sector, open a popup containing the confirmation details for that specific sector.

The popup must show the selected sector information for reference.

### Popup heading

**Confirm Flight — Sector 01**

Display the route, airline, flight number, date, departure time, and arrival time where available.

### Required editable fields

1. Adult Fare (INR)
2. Child Fare (INR)
3. Infant Fare (INR)
4. PNR
5. Ticket Number

**All three fare fields must always be visible**, even if the booking currently has no children or infants.

Do not dynamically hide Adult, Child, or Infant fare inputs.

### Popup action

Provide a button:

**Submit Confirmation**

When clicked:

1. Validate required inputs according to existing business rules.
2. Save the entered values against the selected sector only.
3. Preserve the other sectors without modification.
4. Close the popup after successful saving.
5. Provide a clear success indication.
6. Display the sector's saved state using the existing status conventions.

**Submitting Confirm must save only that sector. It must not automatically complete the entire Flight task.**

Do not automatically issue a ticket through the CRM.

Do not change unrelated sector data.

If the relationship between ticket number and passenger is not clearly supported by the existing schema, explain the issue and ask before changing the storage model.

### Error handling

If saving fails:

- Keep the popup open.
- Preserve the entered values.
- Show an understandable error.
- Do not falsely display confirmation success.
- Do not silently discard data.

---

# 6. ALTERNATE BUTTON — POPUP

## Required behavior

When the Flight Executive clicks **Alternate**, open a popup for that particular sector.

The purpose is to propose a different flight for Sales approval.

### Popup heading

**Propose Alternative — Sector 01**

First display the original sector details for comparison.

### Editable alternative flight details

Include:

1. Airline
2. Flight Number
3. From
4. To
5. Class
6. Travel Date
7. Departure Time
8. Arrival Time
9. Adult Fare (INR)
10. Child Fare (INR)
11. Infant Fare (INR)
12. Reason for Alternative
13. Notes for Sales (optional)

### Fare fields

Always show:

- Adult Fare
- Child Fare
- Infant Fare

Do not conditionally hide these inputs based on passenger types.

Keep the three values separate.

Do not introduce a manually editable Proposed Total Fare field.

If the existing workflow requires a calculated total, calculate it using the accepted passenger counts and existing fare calculation rules.

Do not invent fare values.

### Reason and notes

**Reason for Alternative** must be a required text field.

**Notes for Sales** must remain optional.

### Popup action

Provide:

**Send for Sales Approval**

On submission:

1. Validate the proposed alternative details.
2. Validate the reason.
3. Save the proposal against the correct Flight task and sector.
4. Preserve the original sector information.
5. Record the proposal version.
6. Record submitting user and timestamp.
7. Send the proposal to the responsible Sales Executive using the existing approval system.
8. Set the selected sector's alternative approval status to Pending Sales Approval.
9. Provide success feedback.
10. Close the popup after successful submission.

Do not mark the proposal approved automatically.

Do not create a confirmed ticket or PNR.

---

# 7. PRESERVE SALES APPROVAL WORKFLOW

Removing the global availability section must not remove Sales approval restrictions.

### When an alternative is submitted

Only the selected sector should be affected.

Example:

- Sector 01: Confirmed
- Sector 02: Pending Sales Approval

Sector 01 must remain unchanged.

### When Sales approves

- Approval applies to that exact sector proposal.
- Save the decision and timestamp.
- Notify the Flight Executive.
- Permit the approved alternative to continue through the normal ticket-confirmation process.

### When Sales rejects

- Keep the rejected alternative blocked.
- Notify the Flight Executive.
- Preserve the rejection reason and history.
- Allow a revised proposal through the existing workflow.

### Important

Do not permit a pending or rejected alternative to be treated as confirmed.

Do not allow the Flight Executive to bypass a pending alternative approval by clicking Confirm on the same unapproved alternative.

Preserve existing authorization and budget controls.

---

# 8. REMOVE "TOTAL ACTUAL TICKET AMOUNT (INR)" FIELD

## Current behavior

Below the Flight Sectors table there is a field labelled:

**Total actual ticket amount (INR)**

## Required change

Remove this field from the visible Finish this flight interface.

Remove its:

- Label
- Input box
- Supporting help text
- Unnecessary surrounding spacing

### Important

Do not remove the Adult, Child, or Infant fares in the confirmation and alternative popups.

Do not delete underlying ticket amount records or financial calculations.

If the existing backend requires the total amount for invoice or accounting integration, retain the calculation internally without showing this redundant field.

If changing this UI field introduces a validation conflict, identify the dependency and explain the smallest safe resolution.

Do not hardcode fake amounts to satisfy validation.

Do not change customer selling prices.

---

# 9. REMOVE "BEFORE YOU MARK IT DONE" CHECKLIST ONLY

## Current behavior

The Finish this flight section contains a checklist titled:

**Before you mark it done**

It includes conditions such as:

- Complete flight dates, airline, flight number and PNRs
- Total actual ticket amount
- E-ticket documents
- Requested or exact Sales-approved itinerary

## Required change

Remove the **entire checklist block** from the visible interface.

This includes:

- The checklist heading
- Progress count
- Progress indicators
- Checklist items
- Any unnecessary space left by the checklist

### Critical requirement

**Do not remove the "Mark flight done" button.**

The button must remain accessible.

Removing the checklist does not mean removing mandatory validation.

Preserve existing backend validation for:

- Required issued-ticket details
- E-ticket documents
- Sales approval
- Correct ticketing status
- Other mandatory completion conditions

If the backend still requires an old manually entered Total Actual Ticket Amount, reconcile that requirement with the existing fare-based calculation without introducing fake values.

Do not silently bypass validation.

When completion is blocked, show a clear error describing what is missing rather than requiring the user to consult the removed checklist.

---

# 10. KEEP E-TICKET DOCUMENTS SECTION

The existing **E-ticket documents** section must remain.

Do not remove:

- E-ticket upload
- Existing uploaded files
- File preview/download controls
- File validation
- Existing upload permissions
- Required document checks

Keep the ticket document section in the existing task workflow.

The existing Mark flight done button must remain below the appropriate ticketing and document controls.

---

# 11. PRESERVE REMAINING EXISTING FUNCTIONALITY

Do not unintentionally remove or modify:

- Ticketing remarks
- Passenger counts
- Approved budgets
- Original Sales requirements
- Flight details in the Details tab
- Traveller information
- Identity documents
- Deal references
- Invoice integration
- Accounts notifications
- Flight history
- Assignment and ownership
- Existing ticket data
- Existing completed tasks

Do not create new financial calculations without confirming the current data contract.

---

# 12. UI/UX EXPECTATIONS

The final Work interface should be significantly simpler than the current version.

### Desired structure

**Finish this flight**

Flight Sectors — 2

| Sector | Airline | Flight  | Route     | Class   | Date   | Departure | Arrival  | Actions             |
| ------ | ------- | ------- | --------- | ------- | ------ | --------- | -------- | ------------------- |
| 01     | IndiGo  | 6E 6142 | JDH → GOX | Economy | 14 Nov | 10:35 AM  | 01:59 PM | Confirm / Alternate |
| 02     | IndiGo  | 6E 6143 | GOX → JDH | Economy | 18 Nov | 04:20 PM  | 01:00 PM | Confirm / Alternate |

Below the table:

- Existing ticketing remarks, if applicable
- E-ticket documents
- Mark flight done

There should be:

- No separate global Flight availability and alternative section.
- No fare inputs directly inside the sector table.
- No PNR or ticket number inputs directly inside the sector table.
- No Total Actual Ticket Amount field.
- No Before you mark it done checklist.

All per-sector fare and ticket information should be entered using the respective Confirm or Alternate popup.

---

# 13. REQUIRED TESTING

Test the following scenarios:

1. Opening the Flight Task Work tab.
2. Global Flight availability section is no longer displayed.
3. Sector table shows one date and two times.
4. Confirm button opens the correct sector popup.
5. All three fare fields appear.
6. PNR and Ticket Number fields appear.
7. Submit Confirmation saves only the selected sector.
8. Other sectors remain unchanged.
9. Saved confirmation details persist after refresh.
10. Alternate button opens the correct sector popup.
11. Alternative flight details can be entered.
12. All three alternative fare fields appear.
13. Reason is required.
14. Notes are optional.
15. Sending the proposal creates a Sales approval request.
16. Only the selected sector is marked Pending Sales Approval.
17. Sales approval works.
18. Sales rejection works.
19. Unapproved alternative ticketing remains blocked.
20. The Total Actual Ticket Amount field is no longer displayed.
21. The Before you mark it done checklist is removed.
22. Mark flight done remains present and functional.
23. E-ticket documents remain functional.
24. Existing completed Flight tasks remain readable.
25. Existing invoice and Accounts functionality remains unchanged.

Run existing automated tests and appropriate build checks.

Do not claim success without verifying the behavior.

---

# 14. IMPLEMENTATION PROCESS

## Phase 1 — Analyze

Inspect the actual repository, focusing on:

- Flight Work UI
- Flight sector data
- Ticket confirmation handlers
- Alternative proposal handlers
- Sales approval integration
- Ticket amount calculation
- Completion validation
- E-ticket uploads

Do not edit any source code during this phase.

## Phase 2 — Present implementation plan

Provide:

- Exact files to modify
- Current logic being replaced
- Proposed Confirm popup behavior
- Proposed Alternate popup behavior
- Existing Sales approval integration
- Required validation changes
- Any unresolved questions
- Any API or database changes required

**Wait for my explicit approval before editing.**

## Phase 3 — Implement

After approval:

- Make minimal, targeted changes.
- Reuse existing code and components.
- Preserve functionality.
- Do not touch unrelated modules.

## Phase 4 — Verify

Test popup forms, persistence, approval, e-ticket uploads, and task completion.

Inspect the final Git diff.

## Phase 5 — Final report

Report:

1. Exact files modified.
2. UI elements removed.
3. New Confirm popup functionality.
4. New Alternate popup functionality.
5. Sales approval behavior.
6. Validation behavior.
7. Testing results.
8. Remaining limitations.

---

# FINAL OBJECTIVE

Transform the existing Flight Task Work interface into a simple sector-based workflow:

**Normal booking:** Open Flight Task → Select sector → Click Confirm → Enter Adult/Child/Infant Fare, PNR and Ticket Number → Submit → Save that sector.

**Alternative booking:** Open Flight Task → Select affected sector → Click Alternate → Enter alternative flight details, fares, reason and notes → Send for Sales Approval → Await approval before confirming the changed flight.

**Completion:** Keep E-ticket documents and Mark flight done, but remove the unnecessary availability section, total amount input, and checklist.

**Do not rebase, rebuild, assume unclear rules, or modify unrelated functionality. Analyze the existing code first and obtain approval before editing.**
