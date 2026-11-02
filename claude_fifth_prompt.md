# TRIPNAVIGATE CRM — PROMPT 5: DYNAMIC FARE COLUMNS, CATEGORY-WISE BUDGET & FLIGHT SAVE BUG FIX

## ROLE

Act as a Principal Full-Stack Engineer, Senior Debugging Specialist, and Enterprise CRM Architect.

You are working on the existing **TripNavigate CRM Flight module**.

This is a targeted improvement and bug-fixing task, not a rebuild or refactoring project.

The latest screenshots show the following problems:

1. Adult, Child and Infant fare columns are always displayed even when there are no children or infants.
2. The Travellers and Budget section shows only a total approved budget rather than a passenger-category breakup.
3. The Flight Details table contains an unnecessary Preferred Time column.
4. After entering flight details in the Work section, the expected save or subsequent workflow is not functioning correctly.

Your job is to inspect the existing code, diagnose the problems, and implement the smallest safe changes.

---

## 1. STRICT DEVELOPMENT INSTRUCTIONS

These instructions are mandatory.

- Analyze the current codebase before changing anything.
- Do not rebase, reset, rebuild, or restructure the project.
- Do not replace existing Flight components unnecessarily.
- Do not modify unrelated CRM modules.
- Do not overwrite existing uncommitted work.
- Do not introduce unnecessary dependencies.
- Preserve existing Sales approval, ticketing, notifications, and completion logic.
- Reuse existing data models, components, APIs, and validation functions.
- Do not invent missing data or business rules.
- **If anything is unclear, ask me before implementing that part.**
- If database changes or modifications outside the Flight module are required, present the changes for approval first.

Use the screenshots as references and investigate the live repository to identify the actual causes.

---

# TASK 1 — DYNAMIC PASSENGER-BASED FARE COLUMNS

## Current problem

Inside:

**Flight Tasks → Work → Flight Sectors**

The ticketing table currently displays three fare columns:

- Adult fare
- Child fare
- Infant fare

Even when the accepted booking contains only two adults and no children or infants, all three fare fields remain visible.

This creates unnecessary columns and makes the table cramped.

## Required behavior

**Show fare columns dynamically according to the actual passenger types in the accepted Sales booking.**

| Accepted passengers           | Fare columns displayed   |
| ----------------------------- | ------------------------ |
| 2 Adults                      | Adult fare only          |
| 2 Adults + 1 Child            | Adult fare + Child fare  |
| 2 Adults + 1 Infant           | Adult fare + Infant fare |
| 2 Adults + 1 Child + 1 Infant | All three fare columns   |
| 1 Adult + 2 Children          | Adult fare + Child fare  |

The examples above describe display logic, not hardcoded passenger configurations.

### Implementation requirements

1. Determine adult, child, and infant counts from the actual accepted Sales version.
2. Show a fare column only when the corresponding passenger count is greater than zero.
3. Apply this dynamically to all flight sector rows.
4. Keep the current compact horizontal table layout.
5. Reduce unnecessary table width when fewer fare columns are visible.
6. Ensure header and input columns remain perfectly aligned.
7. Preserve the underlying data model and saved fares.
8. Do not erase previously saved fare values merely because a category is hidden.
9. Do not calculate amounts for passenger categories with zero passengers.
10. Handle existing tasks and legacy records safely.

### Important

The fare entered for a passenger category must represent the actual per-passenger, per-sector fare, unless the existing data contract explicitly defines it differently.

For example:

Adult count: 2

Sector 1 adult fare: ₹4,500 per adult

Sector 1 total adult amount:

2 × ₹4,500 = ₹9,000

Do not confuse per-passenger fare with the total amount for all passengers.

---

# TASK 2 — DYNAMIC FARE BREAKUP IN ALTERNATIVE FLIGHTS

The same passenger-based logic must apply inside the alternative flight proposal workflow.

If a booking has only adults, the Flight Executive should only enter the Adult alternative fare.

If children are included, show Child fare.

If infants are included, show Infant fare.

### Sales approval must display

- Proposed sector
- Proposed airline and timings
- Applicable passenger categories
- Fare per passenger category
- Number of passengers in each category
- Calculated total proposed booking amount

The proposed total should be calculated automatically.

Do not add an unnecessary manually editable Proposed Total Fare input.

**Retain the previously requested removal of the old Proposed Total Fare block.** The new calculated amount should be a read-only summary based on the relevant fare breakup.

Preserve the rule that an unapproved alternative cannot proceed to ticketing.

---

# TASK 3 — CATEGORY-WISE APPROVED BUDGET

## Current problem

Inside:

**Flight Tasks → Details → Travellers and budget**

The system displays:

Adults: 2  
Children: 0  
Infants: 0

Approved budget: ₹42,000

But it does not show how much budget belongs to each passenger category.

## Required change

Show budget breakup according to the accepted Sales booking.

### Suggested layout

**Travellers and budget**

| Passenger category | Count | Budget per passenger | Total budget |
| ------------------ | ----: | -------------------: | -----------: |
| Adult              |     2 |              ₹21,000 |      ₹42,000 |

**Total approved budget: ₹42,000**

If children or infants are part of the booking, include those categories dynamically.

### Requirements

- Show only categories with passenger count greater than zero.
- Use the actual approved amounts provided by Sales.
- Calculate category totals correctly.
- Show the combined approved budget.
- Preserve traveller names and existing documents.
- Keep the existing two-column page layout with Where this came from.
- Use proper INR formatting with two decimal places where applicable.
- Do not unnecessarily display zero-count categories.

### Critical data-integrity rule

**Do not divide the total approved budget equally among passengers unless the accepted Sales record explicitly supports that calculation.**

For example, if the current CRM only stores a total budget of ₹42,000, you must not automatically assume:

Adult budget = ₹21,000 each.

First inspect the Sales-side data.

If category-wise budget values do not exist, explain the gap and ask me how they should be entered or stored.

Do not fabricate a breakup.

If approved budget is stored as an overall itinerary total, preserve that distinction.

---

# TASK 4 — REMOVE "PREFERRED TIME" FROM FLIGHT DETAILS TABLE

## Current problem

Inside:

**Flight Tasks → Details → Flight Details**

The current table includes:

- #
- From
- To
- Travel Date
- Departure
- Arrival
- Airline / Flight
- Class
- Preferred Time

The Preferred Time column currently displays "Not specified" repeatedly.

## Required change

Remove the entire **Preferred Time** column from this table.

This includes:

- Column header
- All corresponding row cells
- Any unnecessary spacing or column sizing

### Important

Do not remove the actual departure and arrival time information.

Do not delete preferred timing data from the database.

Do not remove customer timing instructions stored in the Comment field.

Keep the existing **Comment** label and content.

### Expected Flight Details columns

| #   | From | To  | Travel Date | Departure | Arrival | Airline / Flight | Class |
| --- | ---- | --- | ----------- | --------- | ------- | ---------------- | ----- |

Preserve the existing Flight Details full-width card layout.

---

# TASK 5 — INVESTIGATE AND FIX FLIGHT DETAILS NOT WORKING AFTER ENTRY

## Current problem

In:

**Flight Tasks → Work → Flight Sectors**

The Flight Executive enters information such as:

- Airline
- Flight number
- Departure date and time
- Arrival date and time
- PNR
- Ticket number
- Adult/Child/Infant fare

However, after entering these details, the expected save or subsequent action is not working correctly.

**This is a functional bug, not merely a UI problem.**

You must identify the actual root cause before changing code.

## 5.1 Trace the complete submission lifecycle

Inspect:

1. Form field bindings
2. Component state
3. Input change handlers
4. Date and time parsing
5. Fare parsing
6. Dynamic sector arrays
7. Client-side validation
8. Save/submit handlers
9. API request payload
10. Backend validation
11. Database persistence
12. API response handling
13. UI refresh and state synchronization
14. Flight completion conditions
15. Existing alternative approval checks

Do not assume the problem is only CSS, a disabled button, or missing form validation.

## 5.2 Verify date handling

The screenshot shows inconsistent arrival dates relative to the requested December journey.

Investigate:

- Whether date inputs are using the correct format.
- Whether displayed dates are being parsed correctly.
- Whether dates are unexpectedly changing.
- Whether native date input values use the expected ISO format.
- Whether timezone conversion is affecting stored dates.
- Whether arrival dates earlier than departure dates are being accepted incorrectly.

For the same sector, arrival datetime must not precede departure datetime unless there is a valid, explicitly supported representation that accounts for date/time differences.

Do not silently replace user-entered dates with today's date.

Do not auto-correct booking dates without user confirmation.

## 5.3 Verify fare handling

Ensure:

- Fare inputs accept valid monetary amounts.
- Blank active-category fare inputs are handled according to current validation rules.
- Hidden categories do not cause false validation errors.
- Currency symbols do not break numeric parsing.
- Totals are calculated without floating-point rounding errors.
- Zero-passenger categories do not influence totals.
- Existing approved budget rules are preserved.

Use the project's existing monetary calculation conventions.

## 5.4 Verify ticket information

Check:

- PNR input validation
- Ticket number validation
- Multiple sectors
- Shared PNRs
- Separate PNRs
- Sector-to-ticket associations
- Multiple passengers
- Saving and reloading entered information

Do not assume every sector has a different PNR or that one ticket number is sufficient for all passengers.

If the existing schema cannot represent the actual ticketing requirements, explain the limitation and ask before changing it.

## 5.5 Fix the actual failure

Once the root cause is identified:

- Correct the relevant event handler, validation, mapping, API call, or persistence logic.
- Keep changes localized.
- Preserve existing business workflows.
- Display actionable error messages when saving fails.
- Prevent silent failures.
- Show appropriate loading and success states.
- Ensure saved data persists after page refresh.

Do not claim the bug is resolved merely because the form renders without errors.

---

# TASK 6 — TOTAL ACTUAL TICKET AMOUNT

The existing Work section contains:

**Total actual ticket amount (INR)**

Ensure this amount is calculated dynamically from the fare breakup.

For each sector:

`Sector Total = (Adult Fare × Adult Count) + (Child Fare × Child Count) + (Infant Fare × Infant Count)`

Then:

`Total Actual Ticket Amount = Sum of all applicable Sector Totals`

### Requirements

- Do not double-count passenger fares.
- Do not include zero-passenger categories.
- Do not accept arbitrary manually entered totals if the total is derived.
- Update the total when the Flight Executive changes an applicable fare.
- Use consistent INR formatting.
- Ensure the calculated total matches the value saved to the backend.
- Do not change the customer selling price.

For multi-sector ticketing, use the existing fare model's meaning and confirm whether entered amounts are sector-specific or cover multiple sectors before changing aggregation.

---

# TASK 7 — PRESERVE FLIGHT APPROVAL LOGIC

These changes must not break the existing approval workflow.

The required operational sequence remains:

**Sales submits accepted booking → Flight receives sectors → Flight checks availability → Alternative proposed per sector where necessary → Sales approves/rejects → Flight records issued ticket details → Flight completes the task.**

Preserve:

- Sector-specific alternative buttons
- Original Sales information
- Alternative proposal history
- Sales approval status
- Rejection handling
- Approval-required booking restrictions
- Existing notifications
- Existing task completion rules

If a bug is caused by the approval state, fix the relevant condition rather than bypassing approval checks.

Never allow an unapproved alternative to be marked as ticketed or completed.

---

# TASK 8 — UI QUALITY

Keep the existing compact horizontal sector-entry table.

Improve it only where needed to support dynamic passenger categories and readable inputs.

Requirements:

- No clipped airport codes.
- No overlapping date picker icons.
- No truncated airline or flight number values.
- No unnecessary fare columns.
- Clearly displayed totals.
- Consistent input heights.
- Clean spacing.
- Responsive table container.
- No page-level horizontal overflow.
- No excessive vertical whitespace.

Do not change the overall TripNavigate design system.

---

# TASK 9 — IMPLEMENTATION AND TESTING PROCESS

## Stage 1 — Analyze

Inspect the current source code and reproduce the reported save failure.

Identify its root cause.

Check whether category-wise approved budgets are currently stored.

Identify the exact files requiring changes.

## Stage 2 — Present findings

Before editing, explain:

- Why the Flight form is not working.
- How current passenger counts are stored.
- Whether category-wise budgets already exist.
- How fare totals are calculated.
- Which files require modification.
- Whether any database or API change is needed.
- Any unresolved business-rule questions.

**Wait for my approval before modifying code.**

## Stage 3 — Implement

After approval:

- Apply dynamic fare-column visibility.
- Apply the same logic in alternative proposals.
- Display actual category-wise approved budgets.
- Remove Preferred Time from Flight Details.
- Fix the identified save/submit issue.
- Correct applicable fare calculations.
- Preserve the existing workflow.

## Stage 4 — Test

Test at least these scenarios:

1. Two adults only.
2. Adults with children.
3. Adults with infants.
4. Adults with both children and infants.
5. Four-sector itinerary.
6. Saving entered PNR and ticket number.
7. Saving fare breakup.
8. Reloading and verifying saved values.
9. Correct calculation of actual total.
10. Invalid or inconsistent flight dates.
11. Approval-pending alternative.
12. Approved alternative.
13. Rejected alternative.
14. Completed and historical Flight tasks.
15. Existing invoice information.

Run available type checks, linting, relevant tests, and build verification.

## Stage 5 — Final report

Provide:

- Root cause of the save failure
- Exact files modified
- Changes implemented
- Data-model or API changes, if approved
- Tests executed and results
- Any remaining limitations

Review the final Git diff to ensure no unrelated files were modified.

---

# FINAL EXPECTED RESULT

The Flight module must work as follows:

**Flight Details:** No Preferred Time column; existing Comment and Class remain correctly displayed.

**Travellers and budget:** Shows only applicable passenger categories, their actual approved per-passenger budgets where available, and the correct combined approved budget.

**Flight Work:** Fare columns dynamically appear only for the passenger types present in the accepted booking.

**Alternative proposals:** Show the applicable adult, child, and infant fare breakdown and calculated booking amount.

**Total actual ticket amount:** Calculates correctly from sector-wise passenger fares.

**Save functionality:** Flight Executive can enter valid booking details, save them successfully, reload the task, and continue the authorized workflow without losing data.

**Most important:** Do not assume anything unclear, do not rebase or rebuild, and do not touch unrelated modules. Identify the actual bug before applying a fix.

Start with code investigation and a concise file-by-file plan. Wait for my approval before editing.
