## Task: Redesign the Flight Management UI — Design and UX Improvements Only

The complete functionality and workflow for **Alternative Flight Sectors, Passenger Selection, Flight Sector Confirmation, Ticket Management, and Mark as Done** have already been implemented.

Your task is to **redesign and improve the existing frontend UI/UX** to make it modern, professional, clean, intuitive, and efficient for a travel CRM system.

**Important: Focus strictly on design, layout, styling, responsiveness, and user experience. Do not change any existing functionality, business logic, backend APIs, database structures, validation rules, or workflows.**

### 1. Overall Design Direction

- Create a modern, premium, enterprise-grade CRM interface.
- Use a clean, minimal design with proper spacing, alignment, typography, and visual hierarchy.
- Follow the application's existing design system, colors, and component library.
- Avoid unnecessary borders, oversized buttons, excessive padding, and cluttered tables.
- Make the interface compact but readable, especially for managing multiple flight sectors and passengers.
- Use consistent button styles, input heights, dropdowns, icons, badges, and spacing throughout.
- Ensure the interface looks polished and production-ready, not like a basic HTML form.

### 2. Flight Sector Layout

- Redesign the flight sector table to improve readability and reduce horizontal clutter.
- Organize flight information logically: airline, flight number, route, date, time, class, and status.
- Make the departure and destination airport codes visually prominent.
- Use a clear route presentation such as **JDH → DEL**.
- Use compact status badges instead of plain status text.
- Keep row actions properly aligned and easy to identify.
- Avoid excessive row heights and unnecessary empty spaces.
- Ensure long flight details do not break the table layout.
- Use horizontal scrolling only when genuinely necessary.

### 3. Alternative Flight Sector Section

- Design the Alternative Flight Sector section as a clean, collapsible panel.
- Keep it collapsed by default, as already implemented.
- Use a clear section header with an expand/collapse chevron and an optional alternative count.
- Make expanded and collapsed states visually distinguishable.
- Improve the inline editing layout so fields are properly aligned and easy to modify.
- Organize passenger selection, number of persons, remarks, and flight details logically.
- Make the **Save Alternative** action visually clear without overwhelming the interface.
- Display original and alternative sectors with clear visual relationships.
- Use subtle labels or badges to distinguish **Original** and **Alternative** sectors.
- Keep the section compact when multiple alternatives exist.

### 4. Flight Sector Confirmation Section

- Redesign the confirmation section for efficient handling of multiple flight sectors.
- Place the section title, sector count, and **+ Add Sector** button in a clean header.
- Position sector selection checkboxes consistently.
- Visually separate each flight sector while maintaining a unified table or grouped layout.
- Clearly distinguish original, alternative, and manually added sectors.
- Organize CRS Type, CRS PNR, Airline PNR, and Ticket Number inputs without making the interface overcrowded.
- Keep the **Confirm Selected Sectors** button in a logical and easily accessible location.
- Improve the appearance of bulk selection controls.
- Make the confirmation process visually straightforward for users managing many sectors.

### 5. Passenger-Wise Sub-Row Design

- Redesign passenger sub-rows with a clear parent-child hierarchy.
- Make it immediately obvious which passengers belong to which flight sector.
- Use subtle background differences, indentation, or separators to distinguish passenger rows.
- Keep passenger dropdowns, ticket numbers, and confirmation controls aligned.
- Make the **+ Add Passenger** action compact and easy to discover.
- Avoid repeating unnecessary flight information in every passenger sub-row.
- Use consistent spacing and input widths.
- Ensure multiple passenger rows remain readable without creating excessive vertical scrolling.
- Clearly highlight individual passenger confirmation statuses.

### 6. Passenger Selection UX

- Improve the existing passenger selection dropdown visually.
- Display selected passengers clearly, using compact chips, counts, or another appropriate design.
- Make multiple passenger selection easy to understand.
- Clearly show how many passengers are selected.
- Prevent long passenger lists from stretching or breaking the layout.
- Keep passenger selection consistent across Alternative and Confirmation sections.
- Do not change the existing passenger selection behavior or logic.

### 7. Confirmation Status Design

Use consistent, subtle status indicators throughout the interface:

- **Pending** — Neutral or amber badge.
- **Partially Confirmed** — Blue or amber badge.
- **Confirmed** — Green badge.
- **Alternative** — Distinct but subtle badge.

Additional improvements:

- Show passenger-wise confirmation status clearly.
- Display overall sector status prominently without adding visual clutter.
- Add a compact confirmation summary showing total, confirmed, and pending passenger-sector confirmations using existing data.
- Make pending confirmations easy to identify.
- Avoid excessive colors or distracting visual effects.

### 8. Action Buttons and Controls

- Establish a consistent visual hierarchy for primary, secondary, and destructive actions.
- Use clear button labels such as **Add Sector**, **Add Passenger**, **Save Alternative**, **Confirm Selected**, and **Mark as Done**.
- Use appropriate icons where they improve clarity.
- Maintain consistent button sizes and alignment.
- Improve hover, focus, disabled, loading, and selected states.
- Keep frequently used actions accessible without overcrowding the screen.
- Ensure disabled actions have clear visual feedback.

### 9. Mark as Done Section

- Visually separate the final completion action from sector editing and confirmation.
- Display a compact progress summary showing confirmed and pending passenger-sector tickets.
- Make **Mark as Done** visually prominent when enabled.
- Clearly show its disabled state when confirmations are incomplete.
- Present existing validation messages in a clean, readable format.
- Do not change any completion validation or confirmation logic.

### 10. Responsive Design

- Optimize the interface primarily for desktop CRM usage.
- Ensure it works correctly on laptops and smaller screens.
- Prevent overlapping fields, broken columns, and misaligned buttons.
- Use responsive grouping or horizontal scrolling for complex tables where necessary.
- Maintain usable input sizes and readable text.
- Ensure dropdowns, expandable sections, and passenger rows remain accessible on smaller screens.

### 11. Interaction and Visual Polish

- Add subtle transitions for expanding and collapsing sections.
- Improve visual feedback for inline editing, saving, selection, and confirmation.
- Use consistent border radii, shadows, backgrounds, and spacing.
- Improve empty states and loading states.
- Ensure keyboard focus indicators and accessible contrast.
- Avoid unnecessary animations, large cards, or decorative elements that reduce information density.
- Maintain a consistent visual experience across the entire flight management workflow.

### 12. Strict Implementation Rules

- **Do not rebuild the workflow.**
- **Do not change existing functionality.**
- **Do not modify backend logic, APIs, or database structures.**
- **Do not change passenger assignment or ticket confirmation behavior.**
- **Do not modify alternative creation or sector generation logic.**
- **Do not change the Mark as Done validation.**
- **Do not remove any existing fields, controls, or actions.**
- **Do not introduce unnecessary new features.**
- Reuse existing frontend components and design tokens wherever possible.
- Focus on improving the existing frontend components, layout, CSS, styling, and visual interactions.
- Preserve all existing data bindings, event handlers, and functional states.
- Ensure the redesign does not introduce regressions.

### Expected Result

Deliver a **modern, polished, compact, and professional travel CRM flight management interface** where users can easily:

1. View and understand flight sectors.
2. Manage alternatives without visual clutter.
3. Select passengers efficiently.
4. Add and manage flight sectors.
5. Enter passenger-wise ticket information.
6. Confirm multiple sectors and passengers.
7. Identify pending and confirmed tickets.
8. Complete the flight task confidently.

**Final instruction:** The functionality is already complete. Implement the UI/UX redesign directly in the existing frontend code. Prioritize usability, clarity, consistency, and efficient use of screen space. Preserve every existing workflow and interaction exactly as implemented. Do not stop at design suggestions or mockups; apply the design improvements to the actual interface.
