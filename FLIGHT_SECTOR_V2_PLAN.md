# Flight sectors, round 2: plan (from `flight_changes_2.md`)

Date: 3 November 2026. Scope: Flight module only (`build/src/50-flight-visa.js`, `build/src/50-flight.css`), dummy data only.
Kept as they are: Sales approval of alternatives, passenger-wise ticket confirmation (CRS type, CRS PNR, Airline PNR, ticket no.), + Add passenger copying, bulk "Confirm Selected Sectors", partial confirmation, Mark flight done checks, e-tickets, progress bar.

## What changes

| # | Spec item | What I will do |
|---|---|---|
| 1 | + Add Sector (both sections) | Opens an inline row at the bottom of the table. You pick the **journey** (e.g. JDH → GOX) or "New journey". Only passengers **not yet on a flight for that journey** are listed. Saving makes a new sector; existing sectors are not touched. It shows in both tables at once. |
| 2 | Alternate inline | Clicking **Alternate** turns that row's own cells into inputs (flight, route, date & times, class, remark) with **Save / Cancel**; its passenger drop-down opens for choosing passengers. No panel or popup. Save sends it to Sales (unchanged rule). The old version moves to **Flight sector history** and only the new (pending/approved) version shows in the table. If Sales rejects, the old version comes back with its passengers. |
| 3 | Fewer columns | Alternative table: Flight, Route, Date & time, Class, Remark, Actions. Sector no., Passengers and Status columns removed (the data and statuses are still kept and used). Important states ("Waiting for Sales") show as a small tag under the flight. |
| 4 | Shared passenger list | A **Booking passengers** drop-down at the top of both sections: every passenger with their type and which flight they are on for each journey (or "not on a flight"). Ticking passengers there pre-chooses them for + Add Sector. Each sector row has a **Passengers (N)** drop-down that shows the same list: assigned / not assigned / on another flight (greyed). Ticking or unticking assigns or removes the passenger on that sector and journey only. A passenger can be on one flight per journey. |
| 5 | Same in Flight sector confirmation | Same columns idea (no sector no./status columns), same toolbar (passenger list, + Add Sector, View history), grouped by journey, each sector expands to show: passenger assignment, the passenger ticket rows (unchanged), and the new Fare section. Superseded versions are not shown here. |
| 6 | Dynamic fares | Per sector: one fare box per passenger type that is on that sector (Adult / Child / Infant). Breakdown: count × fare = amount, plus the sector total, recalculated as you type. The per-row Fare box is removed (the fare is taken from the sector's type fare when a passenger is confirmed, so confirmed tickets keep their fare). A type's fare locks once a passenger of that type is confirmed on that sector. No fares on the alternative. Budget/selling price untouched. |
| 7 | History | "Flight sector history" (expandable, in the Alternative section; "View history" in Confirmation opens it). Shows every replaced or rejected version: flight, passengers, remark, Sales outcome (who, when, reason), created and replaced times, and any confirmed tickets on it. Nothing is deleted. |
| 9 | Data checks | One passenger list (the booking's). Assignment per journey. No passenger on two live sectors of the same journey (checked on assign, Add Sector, Alternate). Alternatives still need Sales approval before confirming. |

## Decisions (spec is silent)

- **D1 – Alternate with only some passengers ticked:** the ticked passengers move to the new version; the others **stay on the current flight**, so that version stays in the table for them. When everyone moves (the default), the old version goes to history.
- **D2 – Passengers on an alternative** can't be changed from its drop-down (that would skip Sales). Use Alternate again.
- **D3 – New Mark-done check:** "Every passenger has a flight on every journey" (needed now that a passenger can be removed from a sector).
- **D4 – Sector numbers** are no longer shown in the tables. Messages now name the flight and route (e.g. "6E 2210 GOX → JDH"). The Sales Deal page still shows its own alternative list as before.
