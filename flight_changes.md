Implement the following changes in the **Flight Invoice, Alternative Flight Sector, and Flight Sector Confirmation** workflow. Maintain the existing UI design and preserve all existing functionality unless explicitly modified below.

## 1. Remove Flight Lines from Invoice

- Remove the **Flight Lines** section and its flight details table from the invoice view.
- Do not delete the underlying flight sector data or affect its usage in other modules.

## 2. Modify Alternative Flight Sector Functionality

### Inline Editing

- Remove the existing popup that opens when clicking **Alternate**.
- When **Alternate** is clicked, allow flight details to be edited directly within the same table.
- Make the relevant fields editable, including airline, flight number, route, class, date, departure, and arrival.
- Display a **Save** button on the right side of the editable row.
- On saving, create a **new alternative flight sector row** while preserving the original flight sector and its details.
- Do not overwrite or delete the original sector.
- Allow multiple alternatives to be created while maintaining their relationship with the original sector.

### Alternative Fields

- Remove the **Fare** field from the alternative functionality.
- Keep the **Remark** field to record the reason for the alternative.
- Add a **Number of Persons** column to specify how many passengers the alternative applies to.
- Add a **Passenger Selection** dropdown using the existing passenger selection functionality.
- Allow selection of one, multiple, or all applicable passengers.
- Automatically synchronize the Number of Persons value with the number of selected passengers.
- Apply alternative changes only to the selected passengers without affecting the remaining passengers.

### Collapsible Alternative Section

- Make the **Alternative Flight Sector** section collapsible and expandable.
- Keep it **collapsed by default**.
- Clicking the section header should toggle its expanded/collapsed state.
- Clicking the expanded section header again should close it.
- Preserve unsaved input values when collapsing and reopening the section.

### Automatically Generate Confirmation Sector

- When a new alternative is saved for selected passengers, automatically create a corresponding sector in the **Flight Sector Confirmation** section.
- Copy the alternative flight details and selected passenger assignments into the newly created confirmation sector.
- Set its initial status to **Pending Confirmation**.
- Maintain a link between the original sector, alternative sector, and confirmation sector.
- Keep the original sector available for passengers who were not included in the alternative.
- Prevent duplicate confirmation sectors from being generated for the same saved alternative.
- Update the confirmation section immediately without requiring a page refresh.

## 3. Separate Flight Sector Confirmation into the Next Step

- Remove the **Confirm** buttons from the existing flight sector table.
- Create a separate **Flight Sector Confirmation** step after the Alternative Flight Sector section.
- Display all applicable flight sectors, including original sectors, alternative sectors, and manually added sectors.
- Add a checkbox for each sector to allow single or multiple sector selection.
- Add a separate **Confirm Selected Sectors** button.
- Allow multiple selected sectors to be confirmed together.
- Only process the selected sectors and their selected passengers.
- Keep confirmation details editable until they are submitted.

### Add Sector Button

- Add a **+ Add Sector** button in the Flight Sector Confirmation section.
- Clicking it should create a new editable flight sector row.
- Allow users to enter airline, flight number, route, class, travel date, departure, arrival, and other required flight details.
- Allow passenger selection for the newly added sector.
- Support the same passenger-wise ticket details, confirmation functionality, and validation as existing sectors.
- Save the newly created sector without modifying existing sectors.

## 4. Passenger Selection in Alternative and Confirmation Sections

- Add a **Passenger Selection** option in both the Alternative Flight Sector and Confirm Ticket sections.
- Reuse the existing passenger selection component already used when assigning flights to selected passengers.
- Support selecting one, multiple, or all applicable passengers.
- Populate the dropdown from the booking's existing passenger list.
- Apply sector changes and ticket confirmation only to selected passengers.
- Maintain accurate passenger-to-sector relationships.
- Prevent duplicate passenger assignments within the same active sector.
- When passengers are reassigned to an alternative sector, update their active sector mapping without affecting passengers remaining on the original sector.

## 5. Passenger-Wise Sub-Rows in Flight Sector Confirmation

- Each flight sector must support expandable passenger-wise sub-rows.
- Add a **+** button to create an additional passenger row.
- Each sub-row must contain a **Passenger** dropdown populated from the booking's passenger list.
- When adding another passenger row, automatically copy all applicable flight, CRS, PNR, and ticket details from the previous passenger row.
- Automatically increment the **Ticket Number by +1** from the previous passenger's ticket number.
- Keep the ticket number manually editable.
- Preserve the ticket number format and increment its numeric sequence correctly.
- Prevent duplicate passenger selection within the same flight sector.
- Store each passenger's ticket details separately against the correct sector.
- Allow multiple passengers to be added and managed before confirmation.

## 6. Add CRS, PNR, and Ticket Details

Add the following fields to the Flight Sector Confirmation table:

- **CRS Type** — Input/select field.
- **CRS PNR Number** — Text input.
- **Airline PNR** — Text input.
- **Ticket Number** — Text input for each passenger.

Additional behavior:

- Automatically carry forward CRS Type, CRS PNR Number, and Airline PNR when adding passenger sub-rows.
- Automatically increment Ticket Number by +1 for each newly added passenger row.
- Allow manual editing of all applicable fields.
- Save passenger-wise ticket information independently.
- Ensure these fields work for original, alternative, and manually added sectors.

## 7. Partial Passenger Ticket Confirmation

- Allow users to confirm tickets for selected passengers instead of requiring confirmation for every passenger at once.
- Add passenger-wise confirmation controls.
- Each passenger must have an independent ticket confirmation status.
- Allow users to select exactly which passengers have confirmed tickets.
- Confirm selected passengers while keeping the remaining passengers pending.
- Preserve already confirmed passenger ticket details when confirming other passengers later.
- Allow users to return and complete pending passenger confirmations without affecting previously confirmed records.

### Passenger Confirmation Status

- **Pending** — Passenger ticket is not confirmed.
- **Confirmed** — Passenger ticket has been confirmed.

### Flight Sector Confirmation Status

- **Pending** — No applicable passengers are confirmed.
- **Partially Confirmed** — Some applicable passengers are confirmed.
- **Confirmed** — All applicable passengers are confirmed.

- Automatically update the sector status based on its passenger confirmation statuses.
- Display the passenger-wise and overall sector confirmation status clearly in the interface.

## 8. Bulk Flight Sector Confirmation

- Add selection checkboxes to flight sectors.
- Allow users to select multiple sectors for confirmation.
- Provide a single **Confirm Selected Sectors** button.
- Confirm only passengers explicitly selected for confirmation within the selected sectors.
- Validate required ticket information before confirming each selected passenger.
- Do not automatically confirm pending passengers who have not been selected.
- Preserve previously confirmed records when submitting additional sectors or passengers.
- Display clear validation messages for missing required details.

## 9. Mark as Done Validation

- Allow users to save partial confirmations without completing the entire flight task.
- Before enabling **Mark as Done**, validate every required flight sector and its assigned passengers.
- Every passenger must have a confirmed ticket for every active flight sector assigned to them.
- For passengers moved to an alternative, only their active alternative sector should require confirmation, not the superseded original sector.
- Passengers who remain on the original sector must still complete confirmation for that sector.
- If any required passenger-sector confirmation is pending, prevent the task from being marked as done.
- Display a clear message identifying the pending passengers and their respective sectors.
- Enable **Mark as Done** only after all required passenger-wise ticket confirmations are completed.
- Perform the same validation in the backend to prevent incomplete tasks from being marked done through direct API requests.

## 10. Implementation and Data Handling Requirements

- Maintain the existing UI design, styling, and table-based layout.
- Prefer inline editing instead of popups.
- Reuse existing passenger selection components and logic wherever possible.
- Preserve original flight sectors when alternatives are created.
- Maintain proper relationships between original sectors, alternative sectors, manually added sectors, passengers, and ticket confirmation records.
- Ensure alternative creation automatically generates the corresponding confirmation sector.
- Prevent duplicate confirmation sectors, duplicate passenger assignments, and duplicate confirmation records.
- Persist all changes in the backend.
- Update relevant frontend components, backend APIs, database models, and validation logic as required.
- Ensure passenger selection, sector creation, alternatives, and confirmation statuses update immediately without requiring a page refresh.
- Preserve previously confirmed ticket information when other sectors or passengers are modified.
- Do not modify unrelated modules or existing business logic.

## 11. Expected Workflow

1. Display the existing flight sectors.
2. Keep the Alternative Flight Sector section collapsed by default.
3. Allow users to expand the section, select a sector, and edit its alternative details inline.
4. Select the passengers to whom the alternative applies.
5. Save the alternative while preserving the original sector.
6. Automatically generate a new pending confirmation sector for the selected passengers.
7. Move to the separate Flight Sector Confirmation section.
8. Allow users to add new sectors using **+ Add Sector**.
9. Select one or multiple flight sectors for confirmation.
10. Select the applicable passengers for each sector.
11. Add passenger-wise sub-rows using **+**.
12. Automatically populate CRS, PNR, and other applicable details while incrementing ticket numbers.
13. Confirm tickets for selected passengers individually or across multiple sectors.
14. Keep unconfirmed passengers pending and allow their confirmation later.
15. Automatically update passenger-wise and sector-wise confirmation statuses.
16. Allow **Mark as Done** only after all required passengers have confirmed tickets for all their active flight sectors.

**Important:** Implement this as one connected workflow with consistent passenger mapping, automatic alternative-to-confirmation sector creation, independent passenger-wise ticket confirmation, bulk confirmation support, and strict completion validation. Do not overwrite original sectors or previously confirmed ticket records.
