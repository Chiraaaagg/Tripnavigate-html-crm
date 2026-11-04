## Task: Update Alternative Flight Sectors and Flight Confirmation Workflow

Implement the following changes in the existing **Alternative Flight Sectors** and **Flight Sector Confirmation** sections. Keep the current design system and existing business logic unless explicitly modified below.

### 1. Add Sector Button in Alternative Flight Sectors

- Add a **+ Add Sector** button in the Alternative Flight Sectors section.
- This button should allow users to create a new flight sector for passengers who have not yet been assigned to a flight for the relevant journey segment.
- Example: If a booking has 10 passengers and 4 are already assigned to one flight, the user should be able to create another sector for the remaining 6 passengers.
- Automatically identify passengers who are not yet assigned to the relevant journey segment.
- Display only eligible unassigned passengers when creating the additional sector.
- Allow selecting one, multiple, or all remaining passengers.
- Prevent duplicate active flight assignments for the same passenger and journey segment.
- Newly added sectors should be saved and reflected in the Flight Sector Confirmation section.
- Do not overwrite or modify the existing sector assigned to the first 4 passengers.

### 2. Modify Alternative Button Behavior

- Keep the **Alternate** button for each flight sector.
- When clicked, make only the relevant flight details editable directly within that row.
- Do not open a popup or create an additional editing panel.
- Editable fields should include airline, flight number, route, travel date, departure time, arrival time, class, selected passengers, and remark.
- Keep all unrelated fields read-only.
- Display **Save** and **Cancel** actions while editing.
- When the alternative is saved, replace the current active sector display with the newly requested alternative.
- Move the previous sector version into **Flight Sector History** instead of displaying both the old and new versions in the active table.
- Preserve the complete original flight information, passenger assignments, timestamps, and alternative remarks in history.
- Do not delete or overwrite historical records.
- Maintain the existing Sales approval workflow for alternative requests.
- If an alternative is rejected, restore the correct previously approved sector and passenger assignments according to the existing approval rules.
- Show only the current active or pending alternative version in the main table.

### 3. Remove Unnecessary Columns

Remove the following columns from the Alternative Flight Sectors table:

- **Sector Number**
- **Passengers**
- **Status**

Do not remove the underlying data or status tracking from the backend.

Keep the table focused on flight information, including:

- Flight / Airline
- Route
- Date & Time
- Class
- Remark
- Actions

Use a clean, compact table layout.

### 4. Add Shared Passenger Selection Near the Section Heading

- Display the complete booking passenger list near the **Alternative Flight Sectors** heading.
- Use a compact passenger selector with dropdown and multi-select support.
- Allow users to select or deselect passengers.
- This passenger list must be sourced from the booking and remain consistent across all sectors.
- Do not create separate or duplicate passenger lists for each sector.
- Each flight sector should have an expandable dropdown that displays its assigned passengers.
- Inside the sector dropdown, allow selecting and deselecting passengers from the same shared booking passenger list.
- Clearly distinguish assigned, unassigned, and unavailable passengers.
- Changes to passenger assignments must apply only to the relevant sector and journey segment.
- Keep passenger selection synchronized across all sectors.
- When a passenger is assigned to one active sector, prevent conflicting assignments to another active sector for the same journey segment.
- Do not require users to repeatedly enter passenger details.

### 5. Apply the Same Sector and Passenger Management Concept to Flight Confirmation

Update the **Flight Sector Confirmation** section to follow the same structure and passenger selection approach.

- Add or retain the **+ Add Sector** button.
- Allow users to create confirmation sectors for remaining eligible passengers.
- Remove unnecessary sector numbers, passenger columns, and redundant status columns from the main table.
- Display the shared booking passenger selector near the Flight Sector Confirmation heading.
- Make each confirmation sector expandable to show its assigned passengers.
- Allow users to select and deselect passengers from the shared booking passenger list.
- Keep passenger assignments synchronized with the Alternative Flight Sectors section.
- Automatically reflect newly added or approved alternative sectors in Flight Sector Confirmation.
- Keep original and historical sector versions out of the active confirmation table when they have been superseded.
- Preserve passenger-wise ticket confirmation, CRS Type, CRS PNR, Airline PNR, ticket number, and bulk confirmation functionality.
- Do not reset previously confirmed passenger tickets when another passenger or sector is updated.
- Continue supporting partial passenger confirmations and the existing Mark as Done validation.

### 6. Add Dynamic Passenger-Type-Based Fare Fields

Add a **Fare** section in Flight Sector Confirmation with dynamic fare inputs based on passenger type.

Support the following passenger categories:

- **Adult**
- **Child**
- **Infant**

Requirements:

- Automatically identify the number of adults, children, and infants from the passengers assigned to each sector.
- Display fare inputs only for passenger types present in the selected sector.
- Example: If a sector contains 3 adults, 2 children, and 1 infant, display separate Adult Fare, Child Fare, and Infant Fare fields.
- If no infants are assigned, do not display the Infant Fare field.
- Allow users to enter a different per-passenger fare for each category.
- Automatically calculate the total fare using the assigned passenger counts.

**Calculation:**

Total Sector Fare = (Adult Count × Adult Fare) + (Child Count × Child Fare) + (Infant Count × Infant Fare)

- Recalculate the total immediately when passenger assignments or fare values change.
- Display a clear fare breakdown with passenger count, fare per passenger, and total amount for each category.
- Keep fare information linked to the correct sector and applicable passengers.
- Preserve existing fare values when editing unrelated flight details.
- Do not add fare inputs to the Alternative Flight Sectors section.
- Keep existing budget, customer selling price, and payment approval calculations unchanged unless they already depend on the actual confirmed fare.

### 7. Sector History Management

- Maintain a complete history of original and alternative flight sector versions.
- When an alternative replaces the active displayed sector, move the previous version to history.
- Keep historical records accessible through a **View History** action or expandable history section.
- History should include previous flight details, affected passengers, remarks, approval outcomes, and modification timestamps.
- Historical sectors must not appear as active confirmation sectors.
- Preserve existing ticket and approval records for auditing.
- Ensure restoring a previous sector after rejection does not create duplicate active passenger assignments.

### 8. UI/UX Requirements

- Maintain a clean, compact, professional CRM design.
- Use expandable sector rows rather than displaying all passenger details permanently.
- Keep passenger selection accessible near the section headings.
- Use consistent dropdowns, checkboxes, buttons, and input styles.
- Avoid unnecessary columns and excessive horizontal scrolling.
- Keep Add Sector, Alternate, Save, Cancel, and View History actions clearly accessible.
- Use inline editing wherever possible.
- Ensure changes are reflected immediately across both sections without requiring a page refresh.
- Maintain responsive behavior for desktop and smaller screens.

### 9. Data Integrity and Validation

- Use the existing booking passenger list as the single source of truth.
- Ensure passenger assignments are tracked per journey segment, not globally across the entire booking.
- A passenger may be assigned to different sectors for different journey segments, but must not have conflicting active assignments for the same journey segment.
- Prevent duplicate active sectors and duplicate passenger-sector assignments.
- Preserve alternative approval requirements and historical records.
- Ensure all ticket confirmation records remain linked to the correct passenger and active sector.
- Prevent confirmation of alternatives that have not received required Sales approval.
- Keep all existing backend validation and completion requirements intact.
- Update frontend and backend components only where necessary to implement these changes.

### 10. Expected Workflow

1. Open Alternative Flight Sectors and view the shared booking passenger selector.
2. Expand a flight sector to view or modify its assigned passengers.
3. Click **Alternate** to edit the flight details inline.
4. Save the alternative and move the previous sector version into history.
5. Use **+ Add Sector** to create another flight for passengers not assigned to that journey segment.
6. Automatically synchronize the new sector and its passengers with Flight Sector Confirmation.
7. Open Flight Sector Confirmation and expand the required sector.
8. Select applicable passengers from the same shared passenger list.
9. Enter CRS, PNR, and passenger-wise ticket details.
10. Enter dynamic Adult, Child, and Infant fares based on the assigned passenger types.
11. Review the automatically calculated sector fare.
12. Confirm selected passengers and sectors.
13. Complete remaining pending ticket confirmations before marking the flight task as done.

**Final Instruction:** Implement these changes directly in the existing application. Keep the interface compact and consistent, use one shared booking passenger source across both sections, maintain accurate passenger-to-sector assignments, preserve full sector history, and ensure the dynamic fare calculation works correctly without breaking existing alternative approval or ticket confirmation workflows.
