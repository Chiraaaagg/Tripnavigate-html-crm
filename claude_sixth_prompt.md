# TRIPNAVIGATE CRM — PROMPT 6: FARE BREAKUP & SECTOR-WISE ALTERNATIVE APPROVAL

## ROLE

Act as a Principal Full-Stack Engineer, Senior CRM Workflow Architect, and Enterprise UI/UX Designer.

You are working on the existing TripNavigate CRM Flight module.

Your task is to refine the current Flight ticketing workflow using the existing codebase, without rebuilding or restructuring the application.

**This is a targeted enhancement and bug-fixing task. Analyze first, identify affected code, and implement only after presenting your plan and receiving my approval.**

---

# 1. STRICT DEVELOPMENT RULES

- Analyze the current Flight module and trace its existing workflow.
- Preserve existing code, functionality, database records, and integrations.
- Do not rebase, reset, rebuild, or restructure the project.
- Do not modify unrelated CRM modules.
- Do not overwrite existing uncommitted changes.
- Do not introduce unnecessary dependencies.
- Reuse existing components, APIs, validation logic, and permissions.
- Make the smallest possible targeted changes.
- Ask me before implementing anything unclear rather than assuming.
- Obtain approval before schema changes or modifications outside the Flight module.
- Preserve the existing Sales approval, ticketing, and invoice workflows.

---

# TASK 1 — ADD PASSENGER-WISE FARE BREAKUP IN "FINISH THIS FLIGHT"

## Current issue

The Finish this flight section currently displays a compact sector table with passenger-category fare inputs and a single calculated field:

**Total actual ticket amount (INR)**

However, it does not clearly explain how the total amount is calculated across sectors and passenger categories.

## Required change

Add a clean, structured **Actual Ticket Fare Breakup** below the existing Flight Sectors table and above the ticketing remarks and confirmation controls.

### Suggested breakup

For a booking containing:

- 2 adults
- 1 child
- 0 infants

The summary should display:

| Passenger type  | Count | Total fare per passenger | Category total |
| --------------- | ----: | -----------------------: | -------------: |
| Adult           |     2 |                   ₹8,000 |        ₹16,000 |
| Child           |     1 |                   ₹6,000 |         ₹6,000 |
| **Grand total** | **3** |                          |    **₹22,000** |

These values are examples only.

### Calculation logic

For each passenger type:

**Total fare per passenger = Sum of that passenger type's applicable sector fares**

**Category total = Total fare per passenger × Passenger count**

**Grand total = Sum of all category totals**

For example, when a booking has two adults:

Sector 1 adult fare: ₹4,000  
Sector 2 adult fare: ₹4,000

Total adult fare per passenger = ₹8,000

Adult category total = ₹8,000 × 2 = ₹16,000

Use actual saved fare data.

### Dynamic visibility

- Show Adult only when adults are present.
- Show Child only when children are present.
- Show Infant only when infants are present.
- Hide zero-passenger categories.
- Recalculate the breakup immediately when a sector fare changes.
- Keep the existing Total Actual Ticket Amount synchronized with the calculated Grand Total.
- Do not introduce a second manually editable total.
- Do not double-count fares.

### Fare definition

Confirm from the existing data model that fare inputs represent per-passenger, per-sector amounts.

If the existing model uses a different definition or supports tickets covering multiple sectors, investigate and ask before changing the calculation.

### UI requirements

Use a compact table that matches TripNavigate's existing design.

Do not add a large new form.

The user should easily understand:

- What was entered for each sector
- What each passenger category costs
- How the total booking amount was calculated

Preserve the existing approved budget and customer selling price as separate financial concepts.

---

# TASK 2 — REMOVE THE UNNECESSARY "REQUESTED FLIGHT AVAILABLE" STEP

## Current issue

The Flight workflow currently requires the Flight Executive to click:

**Requested flight available**

before continuing to the next ticketing step.

This is unnecessary because the Flight Executive should be able to start entering ticket details immediately.

## Required behavior

**The Flight ticketing process must begin directly with entering flight details.**

The user should not have to click a separate availability-confirmation button.

### Remove the following dependency

Do not require a click on:

"Requested flight available"

to enable:

- Flight detail entry
- PNR entry
- Ticket number entry
- Fare entry
- Draft saving
- Normal ticketing completion, subject to existing validation

### Important

Remove the unnecessary availability gate from both the UI and the relevant workflow validation.

Do not simply hide the button while leaving a backend condition that prevents progression.

However, preserve the separate approval restriction for any sector with a pending or rejected alternative.

### Updated normal workflow

1. Flight Executive opens the assigned Flight task.
2. Sales-entered flight sectors are already displayed.
3. Flight Executive begins entering actual booking details.
4. Flight Executive records PNR, ticket numbers, and sector fares.
5. Flight Executive uploads e-tickets.
6. Flight Executive confirms issuance.
7. Flight Executive completes the Flight task after all required checks pass.

No separate "Flight Available" confirmation step should be necessary.

### Important distinction

Removing the availability gate must **not** remove the requirement for Sales approval when the Flight Executive proposes a changed flight.

---

# TASK 3 — REMOVE THE GLOBAL "REQUESTED FLIGHT UNAVAILABLE" ACTION

## Current issue

The current workflow has a general:

**Requested flight unavailable**

action.

However, a multi-sector itinerary may have only one unavailable flight.

It is unnecessary and potentially confusing to treat the entire itinerary as unavailable.

## Required change

Replace the global unavailable action with a separate **Alternate** button for each flight sector.

### Example

| Sector | Route     | Travel date | Action    |
| ------ | --------- | ----------- | --------- |
| 01     | JDH → DEL | 14 Nov      | Alternate |
| 02     | DEL → COK | 14 Nov      | Alternate |
| 03     | COK → DEL | 18 Nov      | Alternate |
| 04     | DEL → JDH | 18 Nov      | Alternate |

Each Alternate action must belong to its own sector.

Do not affect unrelated sectors when one alternative is requested.

---

# TASK 4 — SECTOR-SPECIFIC ALTERNATIVE PROPOSAL FORM

When the Flight Executive clicks **Alternate** on a sector, open a compact inline proposal section for that specific sector.

Avoid introducing unnecessarily large modals.

### Display the original Sales sector

Show:

- Origin
- Destination
- Travel date
- Airline and flight number, if provided
- Departure date and time
- Arrival date and time
- Class
- Relevant Sales comments

### Allow the Flight Executive to propose

- Alternative airline
- Alternative flight number
- Alternative origin/destination, if supported and explicitly appropriate
- Alternative departure date/time
- Alternative arrival date/time
- Alternative class, if applicable
- Adult fare, where adults are present
- Child fare, where children are present
- Infant fare, where infants are present

### Additional required fields

**Reason for alternative**

A required text field explaining why the original sector is unavailable or unsuitable.

**Notes for Sales**

An optional text field providing additional information for the Sales Executive.

### Calculated proposed amount

Show the total proposed amount calculated from the applicable adult, child, and infant fares.

Do not add an unnecessary manually editable Proposed Total Fare input.

---

# TASK 5 — SEND THE SELECTED SECTOR FOR SALES APPROVAL

Inside the sector-specific alternative form, provide a clear button:

**Send for Sales Approval**

### On submission

1. Validate the proposed sector details.
2. Validate required reason.
3. Validate applicable fare breakup.
4. Calculate the proposed booking amount.
5. Save the alternative proposal.
6. Associate it with the correct Deal.
7. Associate it with the correct Flight task.
8. Associate it with the specific sector.
9. Record the submitting Flight Executive.
10. Record the submission timestamp.
11. Record the proposal version.
12. Notify the responsible Sales Executive.
13. Set the selected sector's alternative status to Pending Sales Approval.

### Important

Submitting an alternative must not:

- Mark the whole itinerary unavailable
- Change unaffected sectors
- Automatically approve the proposal
- Issue a ticket
- Complete the Flight task

---

# TASK 6 — SECTOR-LEVEL APPROVAL BEHAVIOR

The Sales Executive should review the proposed change for the affected sector.

### Sales review should show

- Original sector
- Proposed alternative
- Changed flight details
- Reason for alternative
- Notes
- Applicable passenger counts
- Adult/child/infant fare breakup
- Calculated alternative amount

Provide:

**Approve Alternative**

**Reject Alternative**

### If Sales approves

- Mark the exact sector proposal as approved.
- Save the approver and timestamp.
- Notify the Flight Executive.
- Permit ticketing against the approved alternative.
- Preserve original and approved details.
- Do not mark the ticket as issued automatically.

### If Sales rejects

- Mark the proposal as rejected.
- Notify the Flight Executive.
- Keep ticketing blocked for that rejected option.
- Allow a revised alternative to be proposed.
- Preserve previous proposal history.

### Critical rule

**Approval of Sector 02 must not automatically approve alternatives for Sectors 01, 03, or 04.**

Each sector's alternative approval must be independently tracked.

If the current backend only supports whole-itinerary approvals, identify the data-model changes required and ask me before implementing them.

---

# TASK 7 — DO NOT BLOCK UNAFFECTED SECTORS

This is an important operational requirement.

Example:

A journey has four sectors.

- Sector 01: Original flight available
- Sector 02: Alternative submitted for approval
- Sector 03: Original flight available
- Sector 04: Original flight available

Expected behavior:

- Sector 01 can proceed through normal ticketing.
- Sector 02 must wait for Sales approval before its proposed alternative can be ticketed.
- Sector 03 can proceed through normal ticketing.
- Sector 04 can proceed through normal ticketing.

However, the complete Flight task must not be marked finished until every required sector has valid ticketing details and all mandatory approvals are satisfied.

Preserve any existing itinerary-wide dependencies or constraints; if independent sector processing conflicts with them, ask before changing the business logic.

---

# TASK 8 — CLEAR SECTOR STATUS INDICATORS

Each sector should display a compact status reflecting its current state.

Suggested statuses:

- Not ticketed
- Draft
- Pending Sales Approval
- Approved Alternative
- Rejected Alternative
- Ticketed

Reuse existing status architecture where possible.

Do not create unnecessary duplicate database statuses.

### UI behavior

The user should be able to tell immediately:

- Which sectors are ready for ticketing.
- Which sectors have pending alternatives.
- Which sectors have been approved.
- Which sectors are rejected.
- Which sectors are already ticketed.

Keep status indicators compact and consistent with the TripNavigate design.

---

# TASK 9 — PRESERVE THE EXISTING FINISH FLIGHT WORKFLOW

The existing Finish this flight section contains:

- Flight sector table
- PNR
- Ticket numbers
- Fare breakup inputs
- Total actual ticket amount
- Ticketing remarks
- Issuance confirmation checkbox
- Save ticket details
- E-ticket documents
- Mark flight done

Preserve these features.

Only modify the necessary elements to support the new workflow.

### Completion validation

The entire Flight task should only be completed when:

- All required sectors have valid ticket details.
- Required PNRs are present.
- Required ticket numbers are recorded.
- Fare breakup is valid.
- Mandatory e-tickets are uploaded.
- Issuance confirmation is completed.
- No required sector is awaiting Sales approval.
- No rejected alternative is being used as the ticketed option.
- Every ticketed alternative matches the approved proposal.

Do not bypass existing financial or permission controls.

---

# TASK 10 — UI DESIGN REQUIREMENTS

Follow the existing TripNavigate design system.

Keep:

- White backgrounds
- Blue primary actions
- Compact tables
- Clean borders
- Readable input text
- Consistent spacing
- Minimal visual clutter

### Specific layout guidance

Place the **Alternate** action within or immediately beside each sector row, where it is clearly associated with that sector.

When clicked, expand a compact alternative editor directly below the selected sector or in another existing sector-specific UI pattern.

Do not make the entire page unnecessarily lengthy.

For the fare summary, use one compact table rather than a series of large cards.

Make sure desktop and mobile layouts remain usable.

---

# TASK 11 — DEBUGGING AND REGRESSION TESTS

Test the following scenarios:

1. Open a Flight task and enter ticket details without clicking any availability button.
2. Save normal ticket details successfully.
3. Open Alternate for only one sector.
4. Submit that sector to Sales.
5. Verify the correct Sales user receives the request.
6. Verify the affected sector shows Pending Approval.
7. Verify unaffected sectors remain editable.
8. Approve the alternative in Sales.
9. Verify only that sector becomes authorized for ticketing.
10. Reject an alternative.
11. Verify the rejected option remains blocked.
12. Revise and resubmit an alternative.
13. Verify the new proposal requires new approval.
14. Verify adult-only fare breakup.
15. Verify adult + child fare breakup.
16. Verify adult + infant fare breakup.
17. Verify all applicable passenger categories.
18. Verify the total actual ticket amount.
19. Verify ticket details persist after refresh.
20. Verify the entire task cannot be completed while an alternative approval is pending.
21. Verify the normal existing invoice and Accounts workflows remain unchanged.

Also check that date and time inputs do not allow invalid itinerary values to be silently accepted.

---

# TASK 12 — IMPLEMENTATION SAFETY AND PROCESS

## Stage 1 — Investigate

Inspect the current codebase and locate:

- Flight availability buttons
- Availability gate validation
- Flight sector table
- Alternative proposal logic
- Sales approval handlers
- Fare calculation
- Task completion checks

Check Git status and existing changes.

## Stage 2 — Present the plan

Before editing, provide:

- Existing behavior found
- Exact files requiring changes
- How the availability gate will be removed
- How sector-level alternatives will work
- How fare breakup will be calculated
- Any required API or database adjustments
- Any unresolved business-rule questions

**Wait for my explicit approval before modifying code.**

## Stage 3 — Implement

After approval, make minimal targeted changes.

Do not rewrite the module unnecessarily.

Do not change unrelated CRM functionality.

## Stage 4 — Verify

Run appropriate tests, type checks, linting, and build verification.

Review the final Git diff.

## Stage 5 — Report

Provide:

1. Files modified
2. Functionality added
3. Functionality removed
4. Approval workflow behavior
5. Fare calculation behavior
6. Tests executed and results
7. Any remaining issues

---

# FINAL EXPECTED WORKFLOW

**Normal flight booking**

Sales-entered sectors → Flight Executive enters actual ticket details and fare breakup → Saves ticket data → Uploads e-tickets → Confirms issuance → Completes task.

No unnecessary availability button.

**Alternative flight booking**

Flight Executive clicks Alternate on the affected sector → Enters revised flight details, applicable fares, reason, and notes → Sends that specific sector to Sales → Sales approves or rejects → Flight Executive tickets the approved option → Completes task after all sectors are finalized.

**Fare summary**

The system automatically calculates the actual total ticket amount from the per-sector adult, child, and infant fares and shows a clear passenger-category breakup.

# FINAL NON-NEGOTIABLE INSTRUCTION

Do not rebase or rebuild.

Do not change unrelated modules.

Do not assume missing business rules.

Do not introduce fake data or hardcoded values.

Do not bypass Sales approval.

Do not break existing invoice or Accounts functionality.

**Analyze the current implementation, present the exact modification plan, ask questions where required, and wait for my approval before editing.**
