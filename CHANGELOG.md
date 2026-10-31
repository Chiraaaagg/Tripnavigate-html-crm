# TripNavigate CRM Change Log

This file records the major committed changes and the current uncommitted work in the repository.

## 30 October 2026 — Connected workflow stepper

- Replaced bullet layout with connected circles and centered labels below each circle. Completed steps use white checks; current, pending and blocked states have distinct styling and text. Blocked reasons reuse existing cost, go-ahead and bank-hold helpers; no Purchase action/business-rule changes.
- Existing completion calculations retained. Syntax checked and preview rebuilt; browser appearance not verified. Uncommitted.

## 30 October 2026 — Completed step checkmarks

- Added white checkmark icons inside green circles for completed Purchase progress steps; other steps retain bullet markers (`build/src/40-purchase.js`). Syntax checked and preview rebuilt. Uncommitted; browser appearance not verified.

## 30 October 2026 — Bullet-style Purchase progress

- Replaced numbered step cards with a vertical bullet list and inline Completed / Current step / Upcoming statuses (`build/src/40-purchase.js`).
- Syntax checked and preview rebuilt; browser appearance not verified. Uncommitted.

## 30 October 2026 — Purchase progress and hotel summary UI

- Refined the five-step Purchase progress UI with current/completed/upcoming labels and responsive layout. Rates require an actual quote; Payment requires paid amounts covering the agreed cost.
- Improved hotel summary wrapping and mobile detail rows. Booking action shows Send again only after an outgoing booking request and respects work, confirmation, cost and go-ahead restrictions.
- Files: `build/src/40-purchase.js`, rebuilt `full-crm-preview.html`. Syntax checked; browser appearance not verified. Uncommitted.

## 30 October 2026 — Remove Negotiate rate button

- Removed the Negotiate rate button from the Purchase Work tab e-mail card; Ask for rates and Send booking request remain (`build/src/40-purchase.js`).
- Preview rebuilt and syntax checked. This change is uncommitted.

## 30 October 2026 — Restore original supplier e-mail card

- Restored the simple newest-first e-mail list and standard action buttons instead of the table and summary UI. Retained rate negotiation and the existing Direct Hotel / Supplier / DMC form options (`build/src/40-purchase.js`).
- Syntax check passed and preview rebuilt; browser appearance not verified. This change is uncommitted.

## 30 October 2026 — Fix Work tab rendering

- Removed a reference to the undefined `booking` variable in the Purchase Work tab return markup, which prevented the tab from rendering (`build/src/40-purchase.js`).
- JavaScript syntax check passed and `full-crm-preview.html` was rebuilt. Browser interaction was not verified; Playwright is not installed. This change is uncommitted.

## 30 October 2026 — Inclusions in Travellers and budget

- Added the Sales inclusions (or “Not specified”) to the Travellers and budget card on Purchase task Details (`build/src/40-purchase.js`); rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Cost history placement

- Moved Cost history immediately above Hand the task back in the Purchase Work tab (`build/src/40-purchase.js`); rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Booking request recipient options

- Added Direct Hotel and Supplier / DMC recipient options to the Send booking request form for hotel/package tasks; existing cost and go-ahead checks remain (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Hotel and supplier recipient options

- Added mutually exclusive Direct Hotel and Supplier / DMC options to rate-request and negotiation forms for hotel/package tasks. Direct Hotel uses a manually entered e-mail; Supplier / DMC shows the supplier selector (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Hotel in supplier e-mails

- Added an editable Hotel field to Ask for rates and Negotiate rate for hotel and package tasks; changing it updates the generated subject and message (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Move Cost history

- Moved the Cost history card to the end of the Purchase task Work tab (`build/src/40-purchase.js`) and rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Remove Purchase summary card

- Removed the Purchase summary card from the Purchase task Work tab (`build/src/40-purchase.js`) and rebuilt `full-crm-preview.html`. This change is uncommitted.

## 30 October 2026 — Remove Purchase workflow card

- Removed the Purchase workflow card from the Purchase task Work tab (`build/src/40-purchase.js`); the underlying actions remain unchanged.
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Supplier e-mail layout

- Restored the earlier list-style **E-mails to the supplier** card in the Purchase Work tab, retaining reply details and rate-negotiation access (`build/src/40-purchase.js`). The booking request remains in its separate go-ahead card.
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Notes from Sales heading

- Highlighted the **Notes from Sales** heading on the Purchase task Details tab using the existing brand colors (`build/src/40-purchase.js`).
- Rebuilt `full-crm-preview.html`; this change is uncommitted.

## 30 October 2026 — Current working changes

These changes are present in the working tree and have not been committed yet.

### Purchase data and budget

- Added approved, item-wise Purchase budget breakups for selected hotel services in `build/src/00-data-base.js`.
- Added an `Approved Purchase Budget` action and drawer/modal view for viewing budget line items, quantities, rates, totals, and the approved budget in `build/src/40-purchase.js`.
- Added support for showing Purchase budget information in the Purchase task and queue views.

### Purchase task details and traveller information

- Expanded the Purchase task traveller section to **Traveller details and ID proofs**.
- Added client information, traveller count, missing-ID-proof count, traveller names, adult/child labels, dates of birth, age at travel, and ID-proof status.
- Added traveller ID-proof details to the Purchase Files view.
- Added shared traveller helpers and invented traveller data in `build/src/00-data-base.js`.
- Reordered the Purchase Details tab so **Notes from Sales** appears before stay/service facts and traveller information.

### Purchase supplier work

- Added the supplier e-mail area for rate requests and booking requests.
- Added supplier offer, cost, confirmation, and payment-request flows to the Purchase Work tab.
- Added Purchase file upload and removal controls for supplier quotes, confirmations, and other files.
- Added supplier confirmation handling and the related task locking behavior.
- Added supplier payment-request support, including payment parts, due dates, proformas, approval routing, bank-detail holds, and company-funding prompts.
- Added supplier bank-detail revision and approval states, with payment holds and notices.
- Added task hand-back and Manager reassignment controls.
- Added cancellation-charge and supplier-cost handling for Purchase work.

### Sales and notifications

- Added the **Ask Purchase for an update** action for eligible Sales and Manager users.
- Added the corresponding Purchase notice and update-request display on service rows.
- Updated shell navigation and notification counts for the newer Purchase and notice flows.

### Preview and local server

- Updated `full-crm-preview.html` with the latest source changes.
- Added `build/assemble.js` to assemble CSS and JavaScript source files into the full preview.
- Added `server.js` to serve the preview locally at `http://localhost:3000/`.

## 27 October 2026 — Committed preview baseline

Commit: `58b39ca Add full CRM HTML preview (all roles, live and pending screens)`

- Added the full TripNavigate CRM HTML preview.
- Added role-based screens for Sales, Purchase, Flight, Visa and passport, Accounts, Accounts checker, Branch Manager, and Super Admin.
- Added the source-based preview structure under `build/src/`.
- Added shared live styling, fonts, build notes, area notes, and the initial `CHANGES.md` documentation.
- Added the main preview file `full-crm-preview.html`.
- Added live and pending screen documentation, role permissions, money-fence rules, build notes, open questions, and preview verification notes.

## 27 October 2026 — Purchase UI update

Commit: `61b02b6 Update TripNavigate CRM Purchase UI`

- Expanded the Purchase task UI with supplier work, supplier offers, costs, files, confirmations, and related task history.
- Added Purchase, Flight, and Visa data and workflow updates used by the preview.
- Added additional Sales and booking-preview behavior.
- Updated the full preview with the Purchase UI changes.
- Added supporting Purchase styles in `_to_delete/40-purchase.css`.

## Source of truth

- Source code: `build/src/`
- Generated preview: `full-crm-preview.html`
- Build script: `build/assemble.js`
- Local preview server: `server.js`
- Detailed product and build notes: `CHANGES.md` and `build/notes/`

## Updating this file

Whenever code changes are made, add a dated section near the top. Record:

1. What changed.
2. Which source files were affected.
3. Whether the change is committed or still uncommitted.
4. Any build, test, or preview verification that was performed.
