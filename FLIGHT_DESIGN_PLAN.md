# Flight Work tab: design plan (from `flight_design.md`)

Design and layout only. No business rule, check, saved data or workflow changes.
Files: `build/src/50-flight-visa.js` (markup of the Work tab cards only) and `build/src/50-flight.css`.
Every `data-act`, `data-fv-*`, `data-change` hook, input and button stays, with the same meaning.

## What changes

1. **Fewer, clearer columns.** The 8 flight columns (Airline, Flight no., From, To, Class, Date, Departure, Arrival) become 4:
   - **Flight**: airline on top, flight number below.
   - **Route**: big airport codes, `JDH → GOX`.
   - **Date & time**: date, then `10:35 → 12:50` (arrival date shown only when it is a different day).
   - **Class**.
   Editing rows (new alternative, new sector) use the same 4 columns with small grouped boxes and placeholders.
   The tables get narrower (less sideways scrolling).
2. **Sector tags.** Small tags show **Original**, **Alternative** (with "of 01") and **Added** under the sector number. The separate "Type" column goes.
3. **Alternative flight sectors card.** Stays collapsed by default. The header shows a count of saved alternatives and a "waiting for Sales" count. A new **Actions** column on the right holds Alternate, Save alternative and Cancel, so buttons line up. Alternative rows are indented under their original with a coloured rail.
4. **Flight sector confirmation card.** The header holds the title, a sector count and **+ Add Sector**. A summary strip at the top shows total, confirmed and pending passenger tickets, with a thin progress bar. **Confirm Selected Sectors** sits in an action bar under the table.
5. **Passenger rows.** Indented under their sector with a rail and a light background. Confirmed rows get a faint green tint. The column layout is unchanged.
6. **Passenger picker.** The closed picker shows the chosen names as small chips (first 2, then "+N"), plus "2/3". The chips inside are unchanged.
7. **Finish this flight.** Separated with a top border. It shows a progress summary (tickets confirmed and pending, e-tickets attached). The "before you can mark done" messages become a tidy checklist with ticks. **Mark flight done** is bigger, with an icon, and clearly disabled until ready. The rules behind it are unchanged.
8. **Polish.** Row hover, a sticky table header, a fade-in when a section opens (off when reduced motion is on), consistent focus rings and disabled states, and a phone-width check.
