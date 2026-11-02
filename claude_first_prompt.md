# TRIPNAVIGATE CRM — MASTER FLIGHT MODULE IMPLEMENTATION PROMPT

## ROLE & RESPONSIBILITY

Act as a **Principal Software Engineer, Senior Full-Stack Architect, Senior Product Designer, Database Architect, and QA Engineer** with extensive experience developing production-grade travel management and CRM applications.

You are working on an existing CRM application called **TripNavigate**.

Your responsibility is to thoroughly understand the existing codebase, identify the exact implementation of the Flight module, and carefully enhance its functionality according to the requirements below.

This is an **existing-code modification task, not a project rebuild, rebase, rewrite, or architectural restructuring task**.

The primary objective is to enhance the existing Flight task workflow while preserving the application's current architecture, database, integrations, UI design, permissions, and existing business functionality.

**You must first understand the codebase, present an implementation plan, obtain my approval, and only then modify code.**

---

# PART 1 — CRITICAL NON-NEGOTIABLE DEVELOPMENT RULES

These rules take priority over every other instruction in this prompt.

## RULE 1 — NEVER ASSUME ANYTHING UNCLEAR

If you encounter an ambiguity, missing requirement, conflicting business rule, unclear database relationship, or uncertain implementation decision, **ask me before implementing that part**.

Do not make assumptions and create functionality based on your own interpretation.

This applies especially to:

- Database structures and relationships
- Flight booking business logic
- Sales approval workflows
- User roles and permissions
- Task ownership and assignment
- Invoice generation and billing rules
- Fare calculations
- Existing status transitions
- Ticketing procedures
- Notifications
- Integration with other departments
- Required changes outside the Flight module

When asking a question:

1. Explain what you discovered in the current code.
2. Identify what is unclear.
3. Explain the available implementation options.
4. Recommend the safest option, if appropriate.
5. Wait for my explicit approval before implementing the uncertain behavior.

You may follow existing project conventions for ordinary technical implementation details that are clearly established and do not change business behavior.

**Never invent fields, statuses, workflows, permission rules, database relationships, or business logic merely to complete the implementation.**

If multiple important questions arise, group them into one clear numbered message rather than repeatedly interrupting the work.

## RULE 2 — DO NOT REBASE OR REBUILD THE PROJECT

We already have an existing functioning codebase.

You must update that existing code.

Do not:

- Run Git rebase.
- Run destructive Git reset operations.
- Force push.
- Rebuild the project from scratch.
- Replace the existing application architecture.
- Rewrite entire modules unnecessarily.
- Change the framework.
- Reorganize the project structure.
- Rename unrelated files or folders.
- Change unrelated dependencies.
- Introduce a second parallel Flight system.
- Delete existing functionality unnecessarily.
- Recreate components that already exist.
- Perform broad code cleanup or unrelated refactoring.
- Commit, merge, push, or change branches without my explicit permission.

Do not overwrite or discard uncommitted work.

**Analyze the existing system and enhance it through carefully targeted code modifications.**

## RULE 3 — MODIFY ONLY THE FLIGHT MODULE

You have permission to inspect the complete repository to understand how the application works.

However, the implementation scope is limited to the existing **Flight module** and its explicitly required workflow integration.

Permitted functional changes:

1. Flight Details segment formatting.
2. Hiding the existing Flight Work Cost section.
3. Improving Flight lines for invoice.
4. Improving Finish this flight.
5. Recording actual flight details, date, PNR, fare, and e-ticket.
6. Proposing alternative flight timings.
7. Sending alternative flight proposals to Sales.
8. Sales approval or rejection of proposed alternatives.
9. Preventing unapproved alternative bookings.
10. Flight status, notifications, history, and invoice integration directly necessary for these changes.

Do not modify unrelated CRM features.

If implementation requires changes to:

- Sales module
- Shared frontend components
- Database schema
- Backend APIs
- Authentication or authorization
- Notification services
- Invoice integration
- Shared utilities

Then:

1. Identify the exact required change.
2. Explain why the Flight module cannot function without it.
3. Identify the affected files.
4. Assess the impact on existing features.
5. Ask for my approval before modifying anything outside the Flight module.

**Inspecting a file does not authorize modifying it.**

## RULE 4 — MINIMAL, SURGICAL CODE CHANGES

Write the smallest amount of correct, maintainable code necessary to implement the requirements.

Follow these principles:

- Reuse existing functions, APIs, models, and components.
- Extend existing functionality rather than replacing it.
- Preserve existing function signatures where possible.
- Avoid unnecessary abstractions.
- Avoid duplicate business logic.
- Preserve backward compatibility.
- Follow existing project naming conventions.
- Follow existing coding style.
- Preserve database records and historical data.
- Preserve existing security checks.
- Keep current integrations working.

Do not replace a complete file when a localized change is sufficient.

Do not create new architecture merely because it appears cleaner.

## RULE 5 — APPROVAL BEFORE EDITING

Before modifying any source code, you must:

1. Inspect the repository.
2. Check Git status.
3. Identify uncommitted changes.
4. Trace relevant functionality.
5. List the exact files expected to change.
6. Explain what will change in each file.
7. Identify database or API impacts.
8. Identify business logic uncertainties.
9. Present your implementation plan.
10. **Wait for my explicit approval to begin editing.**

Once approved, implement only the agreed scope.

If additional files or structural changes become necessary during implementation, explain the requirement and obtain approval before proceeding.

## RULE 6 — PRESERVE ALL EXISTING CRM FUNCTIONALITY

Existing workflows must remain operational.

In particular:

- Do not break Deals.
- Do not break Sales task management.
- Do not break existing Flight tasks.
- Do not break Accounts.
- Do not break invoices.
- Do not break Purchase.
- Do not break notifications.
- Do not change unrelated permissions.
- Do not corrupt completed task records.
- Do not delete financial records.
- Do not lose accepted Sales booking versions.
- Do not alter unrelated reporting calculations.

Any existing functionality affected by the requested changes must be identified and tested.

## RULE 7 — DO NOT CONFUSE APPROVAL WITH BOOKING

These are separate business events:

1. Sales submits flight requirements.
2. Flight Executive checks availability.
3. Flight Executive proposes an alternative if required.
4. Sales approves or rejects that proposal.
5. Flight Executive issues tickets externally.
6. Flight Executive records ticket information.
7. Flight task is completed.

**Sales approval does not mean the flight has been booked or ticketed.**

**Entering a PNR alone does not prove ticket issuance.**

Tickets are currently issued outside the CRM. Do not introduce an airline ticket-issuance integration unless I explicitly request it.

## RULE 8 — PRESERVE THE EXISTING DESIGN SYSTEM

Maintain the current TripNavigate visual identity:

- White background
- Blue primary buttons and links
- Minimal professional cards
- Simple typography
- Existing navigation sidebar
- Existing tab structure
- Consistent spacing
- Existing status styles
- Responsive layout

Do not redesign the entire application.

Improve only the relevant Flight screens and directly required Sales approval interface.

---

# PART 2 — ANALYZE THE COMPLETE CODEBASE FIRST

Before writing code, thoroughly understand the project.

## 2.1 Repository exploration

Inspect:

- Frontend architecture
- Backend architecture
- Database and migrations
- API routes
- Authentication
- Authorization
- User and department roles
- Components
- State management
- Services
- Shared utilities
- File uploads and storage
- Notification handling
- Audit logging
- Invoice generation
- Existing tests
- Project configuration and documentation

Do not modify unrelated components during this inspection.

## 2.2 Understand Flight task lifecycle

Trace the complete journey:

**Sales Deal → Accepted Booking Version → Flight Task Creation → Flight Assignment → Flight Work → Ticket Recording → Flight Completion → Sales/Accounts Notification → Invoice Data**

Determine where each stage is implemented and persisted.

Investigate how Flight tasks receive:

- Deal ID
- Accepted booking version
- Travel segments
- Preferred flight time
- Passenger count
- Cabin
- Approved budget
- Booking notes
- Sales Executive identity
- Branch information

Understand how these fields should be preserved through the new workflow.

## 2.3 Existing preview references

The supplied CRM preview includes functions that may help locate the relevant code:

- `flightDetails()`
- `flightInvoiceLines()`
- `finishCard()`
- `flightTask()`
- `flightChecklist()`
- `readyToFinish()`
- `flightQueue()`

Treat these only as investigation references.

Find their actual counterparts in the live repository.

Do not assume the preview HTML is the authoritative application source.

## 2.4 Initial analysis report

Before any code modification, provide a concise report explaining:

- Existing Flight architecture
- Current workflow
- Relevant frontend components
- Relevant backend APIs
- Current data models
- Existing status handling
- Current permissions
- Existing invoice integration
- Potential implementation risks

Then present a file-by-file modification plan and wait for approval.

---

# PART 3 — FLIGHT DETAILS: CORRECT SEGMENT FORMATTING

## Current issue

In:

**Flight Tasks → Details → Flight Details**

The Segments field displays flight sectors as one continuous line.

Example:

`JDH → DEL · 2 Dec; DEL → COK · 2 Dec; COK → DEL · 8 Dec; DEL → JDH · 8 Dec`

This is difficult to read and unprofessional.

## Required solution

Replace the concatenated segment string with a structured, readable table.

Suggested format:

| #   | From | To  | Travel Date | Preferred Time |
| --- | ---- | --- | ----------- | -------------- |
| 1   | JDH  | DEL | 02 Dec 2026 | As requested   |
| 2   | DEL  | COK | 02 Dec 2026 | As requested   |
| 3   | COK  | DEL | 08 Dec 2026 | As requested   |
| 4   | DEL  | JDH | 08 Dec 2026 | As requested   |

These are examples, not data to hardcode.

### Requirements

- One row per flight sector.
- Preserve original segment order.
- Clearly display origin and destination.
- Use consistent date formatting.
- Display preferred departure or arrival times when available.
- Do not invent missing times.
- Do not merge different sectors travelling on the same date.
- Support return journeys and multi-city bookings.
- Support connecting flights.
- Preserve passenger count.
- Preserve cabin class.
- Preserve customer notes and special requests.
- Preserve Sales-approved requirements.
- Maintain responsive presentation.

If a timing requirement applies to the entire journey, such as "Reach Kochi before 4 PM", display it separately as a journey-level requirement.

Do not incorrectly attach that overall requirement to every segment.

If separate departure and arrival dates or times exist, present them accurately.

Use current components and design patterns where possible.

---

# PART 4 — HIDE THE EXISTING COST SECTION

## Current issue

Under:

**Flight Tasks → Work → Cost**

The application currently displays:

- Cost information
- Company direct-payment guidance
- Payment-related controls
- Upload direct-payment proof
- Record a cost

We do not need this section visible in the Flight task workflow right now.

## Required solution

Hide the entire Cost section from the Flight Work tab.

Also hide:

- Direct-payment information banner
- Record a cost button
- Direct-payment proof upload
- Cost-related empty states
- Cost-related UI instructions

### Important restrictions

Do not:

- Delete existing payment records.
- Delete cost database tables.
- Remove shared Accounts functionality.
- Remove existing Purchase functionality.
- Break historical task records.
- Change payment rules elsewhere in the CRM.

If the old cost-completion checklist blocks Flight completion, safely replace that dependency with the new ticket-completion requirements.

**The actual ticket fare field must still exist in the redesigned Finish this flight workflow.**

The old Cost section and the new ticket fare field are separate features.

Preserve the underlying financial data unless explicitly instructed otherwise.

---

# PART 5 — REDESIGN FLIGHT LINES FOR INVOICE

## Objective

Improve the existing "Flight lines for invoice" section so that it is organized, readable, and suitable for the internal Sales and invoice workflow.

## Proposed table

| #   | Travel Date | Airline / Flight No. | From | To  | Departure | Arrival | PNR    |
| --- | ----------- | -------------------- | ---- | --- | --------- | ------- | ------ |
| 1   | 02 Dec 2026 | 6E XXXX              | JDH  | DEL | 08:00     | 09:10   | ABC123 |
| 2   | 02 Dec 2026 | 6E XXXX              | DEL  | COK | 11:00     | 14:10   | ABC123 |

These values are illustrative only.

Never show invented booking information as real data.

## Required functionality

Display, when available:

- Travel date
- Airline
- Flight number
- Origin
- Destination
- Departure time
- Arrival time
- PNR
- Booking status

Use separate date fields where flights cross midnight.

Support multiple PNRs and multi-airline itineraries.

Provide a clean summary with:

- Passenger count
- Cabin
- Flight Executive
- Booking status
- Actual ticket fare for authorized users

## Data handling

Clearly distinguish between:

**Requested itinerary**

The original accepted Sales flight requirements.

**Proposed itinerary**

The alternative suggested by the Flight Executive.

**Confirmed itinerary**

The actual ticketed flight details.

An unapproved or unticketed proposal must not appear as a confirmed booking.

After ticket issuance, use confirmed flight details for the existing invoice data flow.

### Commercial separation

The Flight Executive records the actual ticket amount.

Sales controls the customer selling price.

Do not automatically copy the ticket purchase amount into the customer invoice selling price.

Preserve existing tax, pricing, and invoice calculation rules.

If the exact invoice data contract or commercial calculation is unclear, ask before changing it.

---

# PART 6 — REDESIGN "FINISH THIS FLIGHT"

## Objective

Transform the current Finish this flight section into a structured ticket-recording workspace.

## Required ticket information

The Flight Executive must be able to record:

1. Travel date
2. Airline
3. Flight number
4. Origin airport
5. Destination airport
6. Departure date and time
7. Arrival date and time
8. Airline PNR
9. Ticket number, where applicable
10. Actual ticket amount in INR
11. E-ticket upload
12. Optional ticketing remarks

### Important

Use the existing accepted itinerary to prepopulate known information.

Do not fabricate data.

Ensure the Flight Executive can update the actual booking information after issuing tickets.

## 6.1 Flight segment table

Display flight segments at the top of the Finish this flight section.

Use a clean table with structured editing.

The interface should support:

- One-way flights
- Round-trip flights
- Multi-city flights
- Connecting flights
- Different airlines
- Multiple PNRs
- Multiple passengers
- Multiple ticket numbers
- Multiple e-ticket uploads

Do not assume the entire itinerary always uses one PNR.

## 6.2 Fare details

Include an actual ticket amount field.

Use INR as the current operating currency unless the existing application already supports multiple currencies.

If currency conversion, fare allocation, taxes, or calculation rules are unclear, inspect the existing implementation and ask before changing them.

The UI must clearly distinguish between:

- Per-passenger amount
- Total ticket amount
- Approved budget
- Customer selling price

Do not mix these amounts.

Prevent double-counting.

## 6.3 E-ticket upload

Provide a clear e-ticket upload interface.

Support multiple files when required by the booking structure.

Reuse existing file storage and permission systems.

Ensure that:

- Files are associated with the correct Flight task.
- Uploads persist after refresh.
- Authorized users can access files.
- Uploaded files are not exposed to unauthorized roles.
- Errors are handled correctly.
- Existing file upload functionality is preserved.

## 6.4 Save ticket details

Provide an appropriate Save action.

Saving ticket details must not automatically mark the task complete.

Maintain the distinction between:

- Draft booking details
- Approved alternative
- Actual issued ticket
- Completed task

## 6.5 Mark flight done

The Flight Executive must only be able to complete the task when required information is valid.

Validation must include:

- Required flight dates
- Required airline and flight details
- Relevant PNRs
- Ticket numbers where required
- Actual ticket amount
- Uploaded e-ticket documents
- Required Sales alternative approval
- Correct relationship between approved and ticketed itinerary

Do not allow completion with missing required data.

Ensure that the validation is enforced server-side, not merely by disabling a frontend button.

After successful completion, preserve the application's existing task-locking behavior unless the new requirements explicitly require otherwise.

---

# PART 7 — ALTERNATIVE FLIGHT TIME WORKFLOW

## THIS IS THE MOST IMPORTANT BUSINESS REQUIREMENT

### Business problem

The Sales Executive provides the customer's required flight timings.

The Flight Executive checks availability.

Sometimes the requested flight option is not available.

In that situation, the Flight Executive must propose an alternative timing or flight itinerary.

The proposal must go back to Sales for approval.

**The Flight Executive cannot book an alternative flight until the Sales Executive approves that exact alternative.**

---

## STEP 1 — SALES SUBMITS FLIGHT REQUIREMENTS

The Sales Executive submits a flight booking request through the existing CRM workflow.

The request may contain:

- Route
- Travel dates
- Passenger count
- Cabin
- Preferred departure time
- Preferred arrival time
- Approved budget
- Special instructions
- Customer requirements

Do not create a duplicate Sales booking form.

Reuse the existing accepted booking information.

The original request must remain accessible for comparison and audit purposes.

---

## STEP 2 — FLIGHT EXECUTIVE CHECKS AVAILABILITY

When the Flight Executive takes the task, provide a clear way to indicate the availability outcome.

Suggested options:

**Option A — Requested flight available**

Continue through the normal authorized ticketing workflow.

**Option B — Requested flight unavailable**

Enable the alternative proposal form.

Do not introduce live airline availability integrations.

Availability checking remains an operational activity performed by the Flight Executive outside the CRM unless an existing integration is already present.

---

## STEP 3 — PROPOSE ALTERNATIVE FLIGHT

When the required flight time is unavailable, the Flight Executive can propose an alternative.

Collect:

- Affected segments
- Proposed travel date
- Airline
- Flight number
- Origin
- Destination
- Departure time
- Arrival time
- Proposed fare
- Reason for alternative
- Optional notes

Preserve unaffected sectors.

Allow alternative connections and revised segment combinations where the existing data model supports them.

If supporting such itinerary changes would require unclear business logic, ask before implementing.

### Display comparison

Show:

**Original Sales Request vs Proposed Alternative**

Example:

| Field   | Sales Requested  | Flight Proposed  |
| ------- | ---------------- | ---------------- |
| Route   | DEL → COK        | DEL → COK        |
| Date    | 02 Dec           | 02 Dec           |
| Arrival | Before 4 PM      | 6:30 PM          |
| Fare    | Approved budget  | ₹22,500          |
| Status  | Original request | Pending approval |

Clearly highlight relevant differences.

The Flight Executive should easily understand what has changed before submitting.

---

## STEP 4 — SEND ALTERNATIVE TO SALES

Provide a button:

**Send Alternative to Sales for Approval**

When clicked:

1. Validate the proposal.
2. Save it in persistent storage.
3. Associate it with the existing Flight task.
4. Associate it with the originating Deal.
5. Preserve the original request.
6. Record the proposal version.
7. Record submitting Flight Executive.
8. Record submission timestamp.
9. Set the approval state to Pending Sales Approval.
10. Notify the responsible Sales Executive.
11. Display the proposal in the relevant Sales workflow.
12. Prevent ticketing against the unapproved alternative.

Submitting a proposal must not issue a ticket.

Submitting a proposal must not mark a flight done.

---

## STEP 5 — SALES REVIEWS PROPOSAL

The responsible Sales Executive should see an approval request inside the existing Sales workflow.

The approval interface should present:

- Deal reference
- Flight task reference
- Original flight requirements
- Proposed alternative
- Changed dates and times
- Proposed airline
- Flight number
- Proposed fare
- Approved budget
- Flight Executive's explanation
- Relevant customer requirements

Use the existing CRM role and ownership structure.

Do not invent new global approval permissions.

If approval delegation or manager permissions are unclear, ask me.

Provide two actions:

**Approve Alternative**

**Reject Alternative**

Do not allow unauthorized users to approve or reject.

---

## STEP 6 — SALES APPROVES ALTERNATIVE

When Sales approves:

1. Persist the approval decision.
2. Record the approving user.
3. Record the approval timestamp.
4. Associate the approval with the exact proposal version.
5. Set the proposal to Approved by Sales.
6. Notify the assigned Flight Executive.
7. Allow ticketing against the approved proposal.
8. Preserve the original request.
9. Preserve the approved proposal.
10. Preserve the approval audit history.

Approval does not automatically mean the ticket has been issued.

The Flight Executive must still complete the actual ticketing process and enter the issued ticket information.

### Important approval restriction

Sales approval of an alternative flight must not automatically override existing budget-authorization rules.

If the new fare exceeds an existing approval threshold, preserve the current budget approval process.

Do not invent a new threshold.

---

## STEP 7 — SALES REJECTS ALTERNATIVE

When Sales rejects:

1. Persist the rejection.
2. Record the rejecting user.
3. Record the rejection timestamp.
4. Allow a rejection reason.
5. Notify the Flight Executive.
6. Keep booking blocked.
7. Preserve the rejected proposal.
8. Allow a revised proposal to be submitted.
9. Require fresh Sales approval for the revised proposal.

Do not overwrite previous approval history.

Do not allow a rejected proposal to authorize ticket issuance.

---

## STEP 8 — FLIGHT EXECUTIVE BOOKS APPROVED OPTION

After the alternative is approved, the Flight Executive may proceed with booking externally.

The Flight Executive then records:

- Confirmed airline
- Confirmed flight number
- Confirmed travel date
- Confirmed departure time
- Confirmed arrival time
- Confirmed PNR
- Relevant ticket numbers
- Actual ticket amount
- E-ticket documents

The confirmed booking information must correspond to the approved proposal.

If the flight option materially changes after approval, require a revised Sales approval before treating the new option as approved.

Do not silently substitute a different flight.

---

## STEP 9 — FLIGHT COMPLETION

After recording ticket details, the Flight Executive can complete the task only when all required validations pass.

On completion:

- Save confirmed ticket information.
- Preserve the relevant approval reference.
- Update task status.
- Notify Sales.
- Notify Accounts using the existing workflow.
- Make confirmed flight information available for invoice generation.
- Preserve the task history.
- Apply the existing completion-locking policy.

Do not automatically issue a customer invoice unless this is already part of the existing CRM business logic.

---

# PART 8 — FLIGHT STATUS MANAGEMENT

Inspect the current Flight task state machine before introducing new statuses.

Suggested logical states:

| Status                 | Meaning                            |
| ---------------------- | ---------------------------------- |
| Waiting to be taken    | Flight task unassigned             |
| In progress            | Flight Executive handling task     |
| Alternative draft      | Proposal being prepared            |
| Pending Sales Approval | Waiting for Sales                  |
| Alternative approved   | Sales approved the proposal        |
| Alternative rejected   | Sales rejected the proposal        |
| Ready for ticketing    | Authorized booking can proceed     |
| Ticket issued          | Actual ticket information recorded |
| Completed              | Flight task finished               |

These are conceptual suggestions.

**Do not automatically create all these statuses.**

Reuse existing statuses wherever possible.

Only add fields or states where necessary.

If the existing status architecture cannot support the workflow without changes, explain the options and request approval.

### State safety

- Persist business-critical transitions.
- Enforce transitions server-side.
- Prevent duplicate submissions.
- Prevent unauthorized approvals.
- Prevent a stale approval from authorizing a newer proposal.
- Prevent rejected proposals from being booked.
- Prevent previously approved proposals from being silently edited.
- Require reapproval when material changes are introduced.
- Preserve complete history.
- Handle concurrent decisions safely.
- Use existing transactional patterns where applicable.

---

# PART 9 — NOTIFICATIONS AND HISTORY

Reuse the current TripNavigate notification infrastructure.

Do not build a separate notification system.

### Required notification events

1. Alternative submitted by Flight Executive.
2. Sales approval requested.
3. Alternative approved.
4. Alternative rejected.
5. Flight Executive informed of Sales decision.
6. Flight task completed.

Notifications should identify the relevant Deal and Flight task and link to the appropriate existing screen where supported.

### Audit history

Preserve:

- Deal ID
- Flight task ID
- Proposal version
- Requested flight details
- Proposed flight details
- Proposed fare
- Submitting user
- Submission timestamp
- Decision status
- Approving or rejecting user
- Decision timestamp
- Rejection reason
- Confirmed flight information
- Ticket details
- Completion timestamp

Follow existing data access rules.

Do not expose private passenger or financial information to unauthorized users.

---

# PART 10 — DATABASE AND API CHANGES

First inspect the current data model.

Understand the existing relationships between:

- Deals
- Accepted booking versions
- Flight tasks
- Flight segments
- Users
- Departments
- Files
- Invoices
- Notifications
- Approval records

Reuse existing models whenever possible.

Do not create duplicate entities that represent information already stored in the system.

### If database modifications are necessary

Before proceeding:

1. Explain the exact fields or tables required.
2. Explain why existing structures are insufficient.
3. Present the migration plan.
4. Explain how existing records will remain compatible.
5. Identify rollback or recovery considerations.
6. Request my approval.

After approval:

- Create versioned migrations.
- Preserve existing data.
- Maintain referential integrity.
- Follow project naming conventions.
- Avoid destructive schema operations.
- Implement proper backend validation.
- Update relevant API contracts.
- Preserve old completed Flight tasks.

Do not store important approval or ticketing information only in frontend state.

### API security

Ensure the backend verifies:

- User permissions
- Task ownership
- Approval authority
- Proposal version
- Allowed status transitions
- Required ticket fields
- Appropriate file access

A disabled button is not sufficient security.

---

# PART 11 — USER INTERFACE REQUIREMENTS

Maintain the existing TripNavigate CRM design.

Use:

- Existing component library
- Existing typography
- Existing spacing
- Existing card styles
- Existing color scheme
- Existing buttons
- Existing table conventions
- Existing status indicators
- Existing responsive layout patterns

### Flight Details

Display flight segments neatly.

### Flight Work

Hide the old Cost section.

### Flight lines for invoice

Display a professional table with necessary booking information.

### Finish this flight

Provide a structured ticketing interface.

### Alternative proposal

Display original and proposed flight details side by side or in a clean comparison table.

### Sales approval

Display the proposal with clear Approve and Reject actions.

### Status visibility

Users should always know:

- What was requested.
- What alternative was offered.
- Whether Sales has approved it.
- Whether ticketing is permitted.
- Whether the ticket has actually been issued.
- Whether the task is completed.

Do not clutter the interface with unnecessary controls or duplicate information.

---

# PART 12 — TESTING REQUIREMENTS

Use the repository's existing test framework.

Add or update tests only where relevant to this change.

At minimum, test the following scenarios.

### Flight details

- Multiple segments display separately.
- Segment order remains correct.
- Same-day connections do not disappear.
- Missing times are handled properly.
- Journey-level timing requirements display correctly.

### Cost section

- Cost section is hidden from Flight Work.
- No blank layout remains.
- Existing financial records remain untouched.
- Accounts and Purchase continue working.

### Invoice lines

- Flight lines display properly.
- Multiple PNRs work.
- Overnight flights display correct dates.
- Unconfirmed flights are not shown as issued.
- Selling price remains separate from ticket cost.

### Finish flight

- Flight Executive can enter actual booking information.
- Dates persist correctly.
- PNRs persist correctly.
- Ticket amount persists correctly.
- Multiple ticket documents upload correctly.
- Saved data survives refresh.
- Incomplete tasks cannot be marked done.

### Alternative approval

- Flight Executive can submit an alternative.
- Sales receives the request.
- Unauthorized users cannot approve.
- Pending proposals block ticketing.
- Approval unlocks only the approved option.
- Rejection continues to block booking.
- Revised proposals require fresh approval.
- Stale approval attempts fail.
- Material changes require reapproval.
- Existing budget restrictions remain active.

### Completion

- Confirmed ticket information is saved.
- Sales receives the correct notification.
- Accounts receives the correct notification.
- Flight invoice data becomes available.
- Task completion behaves correctly.
- Existing completed tasks remain accessible.

### General verification

- Run relevant lint checks.
- Run type checking.
- Run unit and integration tests.
- Run the application build.
- Check for permission regressions.
- Check for unintended modifications.
- Inspect the final Git diff.

Do not claim a test passed unless it was actually executed.

If tests cannot run because of missing dependencies or configuration, explain the limitation instead of guessing.

---

# PART 13 — REQUIRED IMPLEMENTATION PROCESS

Follow this exact sequence.

## STAGE 1 — READ AND UNDERSTAND

Analyze the complete repository.

Build a clear understanding of the existing Flight workflow and its dependencies.

Do not edit anything yet.

## STAGE 2 — PRESENT FINDINGS

Provide:

1. Existing Flight architecture.
2. Relevant files.
3. Existing Flight workflow.
4. Existing Sales integration.
5. Existing invoice integration.
6. Required changes.
7. Potential compatibility risks.
8. Questions requiring clarification.

## STAGE 3 — PRESENT FILE-BY-FILE PLAN

Create a table similar to:

| File                              | Proposed change          | Reason                        | Risk   |
| --------------------------------- | ------------------------ | ----------------------------- | ------ |
| Existing Flight component         | Segment table formatting | Better readability            | Low    |
| Existing Flight Work component    | Hide Cost section        | Remove unused UI              | Low    |
| Existing ticket form              | Add booking details      | Support actual ticket records | Medium |
| Existing Sales approval interface | Add alternative decision | Required approval workflow    | Medium |

The file names above are illustrative only.

Use actual discovered repository paths.

Clearly distinguish Flight module files from shared or cross-module files.

## STAGE 4 — WAIT FOR MY APPROVAL

**STOP HERE.**

Do not modify source files until I explicitly approve the implementation plan.

If there are unresolved business questions, ask them before editing.

Do not treat the original task description as permission to bypass this approval checkpoint.

## STAGE 5 — IMPLEMENT CAREFULLY

After approval:

- Make minimal changes.
- Work incrementally.
- Preserve existing architecture.
- Reuse existing code.
- Avoid unrelated modifications.
- Review diffs frequently.
- Request approval before expanding scope.

## STAGE 6 — VERIFY

Run all relevant checks.

Verify the complete Flight workflow.

Inspect changes for regressions and data-security issues.

## STAGE 7 — FINAL REPORT

Provide:

### A. Codebase understanding

Explain the existing architecture and implementation approach.

### B. Changes completed

List the features actually implemented.

### C. Files modified

Provide exact file paths and reasons.

### D. Database and API changes

Describe approved schema or API changes, if any.

### E. Workflow explanation

Explain the full Sales → Flight → Alternative Approval → Ticketing → Completion flow.

### F. Test results

Report tests executed and their outcomes.

### G. Unresolved issues

Identify anything requiring additional decisions or verification.

### H. Manual testing guide

Explain how to test the new workflow in the CRM.

---

# FINAL NON-NEGOTIABLE CHECKLIST

Before considering the work complete, verify:

- [ ] Complete codebase was inspected sufficiently to understand the relevant architecture.
- [ ] Existing Flight workflow was traced.
- [ ] Existing changes and Git status were checked.
- [ ] Implementation plan was presented and approved.
- [ ] No Git rebase, reset, force push, or unauthorized commit occurred.
- [ ] Only approved functionality was modified.
- [ ] No unrelated modules were changed without approval.
- [ ] Existing CRM architecture was preserved.
- [ ] Flight segments display correctly.
- [ ] Old Cost section is hidden.
- [ ] Flight invoice lines are improved.
- [ ] Finish this flight contains required ticket information.
- [ ] Multiple sectors and PNRs are supported.
- [ ] Ticket amount is distinct from customer selling price.
- [ ] Alternative flight proposal works.
- [ ] Sales receives approval requests.
- [ ] Sales can approve or reject.
- [ ] Pending and rejected proposals cannot authorize ticketing.
- [ ] Approved alternatives can proceed through the ticket-recording workflow.
- [ ] Material changes require fresh approval.
- [ ] Ticket completion requires mandatory information.
- [ ] Notifications and history work.
- [ ] Existing financial and invoice functions are preserved.
- [ ] Tests and build checks have been executed where possible.
- [ ] Final Git diff contains no unintended modifications.

---

# OVERALL BUSINESS OBJECTIVE

Enhance the existing TripNavigate Flight module to support this operational journey:

**Sales submits flight requirements**

↓

**Flight Executive accepts task and checks availability**

↓

**If requested flight is available, continue the normal authorized ticketing process**

↓

**If unavailable, Flight Executive proposes an alternative date, time, flight, or connection**

↓

**The alternative is sent to Sales for approval**

↓

**Sales approves or rejects the exact proposal**

↓

**Only an approved alternative can proceed to ticketing**

↓

**Flight Executive issues the ticket outside the CRM**

↓

**Flight Executive records actual flight dates, timings, airline, flight numbers, PNRs, ticket numbers, amounts, and e-tickets**

↓

**Flight task is completed after required validations**

↓

**Confirmed booking details become available to Sales, Accounts, and the existing invoice workflow according to permissions**

---

# FINAL INSTRUCTION TO CLAUDE

**Your first action must be repository analysis, not code modification.**

Understand the existing application thoroughly.

Identify the smallest changes needed.

Do not assume missing requirements.

Do not invent business logic.

Do not rebase or rebuild anything.

Do not touch unrelated functionality.

Ask questions when decisions are unclear.

Present your file-by-file implementation plan and wait for my approval.

After approval, implement carefully using the existing codebase and architecture.

**We are upgrading one existing module, not creating a new system.**

Begin with STAGE 1 and STAGE 2 only. Do not write or modify source code yet.
