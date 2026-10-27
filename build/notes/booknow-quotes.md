# Book now, quotations, itineraries, referral drafts (Agent C)

Files: `src/30-booknow.js`, `src/30-booknow.css`, `src/31-quotes.js`.
Generator for the two Book now files: `notes/agentc-tools/convert.py` + `integration.js` (run `python3 -I convert.py` from that folder after changing `integration.js`; it rewrites both `src/30-booknow.*` files from the approved `book-now-2026-10-26/booking-form-preview.html`).

Roles for every page here: **Sales** and **Branch Manager**. Every other role gets the shell's "Page not available". Both roles may see prices and margin, so there is no money fence to hide inside these pages; Purchase, Flight and Visa never reach them.

## 1. Book now · `#/app/deals/:id/book` · live today

The owner-approved form (26 Oct 2026), copied unchanged:

- Markup, CSS and JS are the approved file's. Removed only: its own sidebar and top bar, the "Design preview · nothing is saved" tag, the "Preview: Bitrix values" panel and button, "Show changes" and every `data-fix` marker and its CSS.
- CSS is scoped under `.bf` (`:root` and `body` became `.bf`). The font-face rules are gone; the form uses the live `inter` / `interExtended` faces. A short leak guard at the top resets the live base rules (`p`, `h1–h3`, `input`, `table`, `th/td`, `details`, `.note`, `.stack`, focus box-shadow) back to browser defaults inside `.bf`, so the form renders as the approved file did.
- The JS is wrapped in an IIFE. Its containers are `#bf-root` > `#bf-app`, `#bf-layer`, `#bf-dlg`, `#bf-toast`; every lookup stays inside `#bf-root`, so nothing clashes with `#tn-overlay` / `#tn-toast` or the shell.
- Checked against the approved file in the browser with the same draft loaded: computed styles of every element on steps 1, 2 and 3, the hotel drawer, the flight drawer and the "Correct trip details" dialog are identical at 1280 px and 375 px, and the page geometry (left edge 288 px, width 960 px, sticky footer from 256 px) matches at 1280 px. Inside the shell the form also keeps the approved file's side padding (14 px under 640 px, 20 px under 1024 px).

Bitrix values come from the Deal in `TN.DATA` (automatic filling is On): contact name, phone and email are filled and marked "From Bitrix"; destination, dates, travellers and trip type are locked in "Trip facts from the Bitrix Deal". "Refresh from Bitrix now" re-reads the Deal.

Prepared Deals:

| Deal | Opens as |
|---|---|
| BX-38533 Choudhary, Thailand | Draft in progress on step 2: customer confirmed, 2 named passengers (one ID proof copied to Bitrix), 2 hotels, 2 flights (return flight still needs number and times), airport pickup, Phi Phi tour. |
| BX-38571 Bishnoi, Jaipur | Not started: only the Bitrix facts (2 adults, 2 children), so the child bed split shows on step 3. First edit turns the Deal to "in progress". |
| BX-38560 Rathi, Bali | "Draft from quotation Q-2610-014": the accepted option's hotels, car, activity and visa, and the per-person price (purchase ₹48,200, markup ₹11,800, final ₹60,000). |
| BX-38520 Vyas, Udaipur | The fix flow: "Fixing version 1 · draft", a red note with Accounts' reason and "Go to Bill To", step 3 open, Bill To marked "Not saved · needs a fix". Change the GSTIN and it saves; submit sends version 2. |

Any other Deal state (waiting for Accounts, being arranged, lost…) goes back to the Deal page with "This booking is submitted. Submitted details are locked…".

What works in memory (these were "not in the preview" in the approved file and now behave as live):

- **Submit booking and create tasks**: Deal → `waiting_for_accounts`, Accounts review waiting, selling price = package total, cost estimate = sum of budgets; one service/task per row in `TN.DATA.services` (hotel: Purchase, go-ahead "waiting"; car, activity: Purchase; flight: Flight; visa and passport: Visa), budget = the cost Sales typed (hotel nightly cost × rooms × nights, car rate × cars, flight fare per person × passengers); payment plan → `TN.DATA.instalments`; notice to Accounts; toast; Deal page. A returned booking keeps its existing tasks and sends version 2.
- **Payment already received? → Send to Accounts**: adds a reported payment (`TN.DATA.paymentReports`, status reported) and an Accounts notice. It is not money.
- **Bill To · Find customer**: searches `TN.DATA.customers` (name, company contact, phone, GSTIN) and fills the Bill To card. Billing addresses for the invented customers are added in this file.
- ID proof upload, all drawers, auto-save, checks and the "Before you submit" list: exactly as approved.

## 2. Quotations · live today

| Page | What it shows |
|---|---|
| `#/app/quotations` | Live list: Mine / All you can open (Manager starts on All), filter chips with counts (Open, Drafts, Ready to share, Shared, Accepted, Ready to book, Accepted not linked, Declined or expired, Closed drafts), Search this page, Open by reference (finds quotations and referral drafts; a miss shows the live refusal), table with the live "Next step" button (Start booking, Continue, Link to deal, Continue booking, Open). |
| `#/app/quotations/new` | For a lead or deal (go to Leads / Deals) and "New referral quotation" (see 4). |
| `#/app/quotations/:id` | The version page. Draft and Ready: six collapsible parts (Trip, Customer, Services, Day plan and terms, Prices, Payment plan) each with its own Save, and the "Ready to share" side card with "Worth checking". Sent: Customer's answer (upload written yes, pick the option, Mark accepted; or Mark declined with a reason). Accepted: Acceptance and booking (linked Deal or "Waiting for the Bitrix deal"), Start booking from this quotation, Our cost estimates (internal). Booking started: Continue booking. Declined / Expired: Make a new version. Every state: What version N offers (price lines, quoted total, internal cost and margin, printed per-person price, payment schedule, the live "components add up to…" check), Versions (older versions open read-only with `?v=1`), Branded itineraries (Make branded itinerary). |
| `#/app/quotations/:id/preview` | Customer copy (`tn-doc` quotation document: price options, amount in words, what the price covers, stays, day by day, included, payment schedule, good to know). |

Invented quotations (`TN.DATA.quotations`, all statuses covered):

| Ref | For | State |
|---|---|---|
| Q-2610-014 Bali honeymoon | Deal BX-38560, Sneha Rathi | Accepted v2 (quoted option), ready to book; v1 replaced |
| Q-2610-021 Andaman Christmas | Lead L-61187, Manish Kalla | Shared v1, waiting for the answer |
| Q-2610-009 Mount Abu school trip | Lead L-61140, St. Anne's | v1 shared, v2 ready to share (one more sightseeing day) |
| Q-2610-025 Europe in May | Lead L-61170, Dr. Swati Lodha | Draft (prices and day plan unfinished; "Check and mark ready" refuses with the reasons) |
| Q-2610-003 Sri Lanka | Lead L-61114, Shalini Bhansali | Declined (Price) |
| Q-2609-118 Kerala honeymoon | Deal BX-38455, Meenal Khatri | Accepted, booking started (total ₹2,14,000 and cost ₹1,76,400 match the Deal) |
| Q-2610-011 Bhutan | Lead L-61126 (Mohit Gehlot's) | Expired; shows for the Manager under All |
| Q-2610-027 Goa long weekend | Referral draft TD-318, Pankaj Lohiya | Draft |

Rules kept as live: a shared version never changes (make a new version); sharing a version replaces the one shared before; accepting needs the customer's written yes as a file and does not book anything; the CRM never converts a lead or changes Bitrix; "Mark as shared" only records how and when staff shared it themselves (customer messages are later).

Exposed for other pages: `TN.quotes.forDeal(id)`, `forLead(id)`, `itinerariesForDeal(id)`, `badge(word)`, `wordOf(q)`; a Lead or Deal page can start a quotation with `<button data-act="q-create" data-subject="lead:L-61208">` (or `deal:BX-…`). `TN.DATA.quotations[].status / owner / deal` are what Agent A's Home rows read.

## 3. Branded itineraries · live today

| Page | What it shows |
|---|---|
| `#/app/itineraries` | Live list (Mine / All, filters, search, reference), Final PDF button on finished ones. |
| `#/app/itineraries/new` | For a quotation or deal (go to Deals) and "New referral itinerary". |
| `#/app/itineraries/:id` | Next card, Existing itinerary (private file), Facts (trip, travellers, stays, day by day, transfers, included, document wording, Save facts), Differences from the quotation or booking (Use the quotation value / Keep / Keep it and add a note; settled list), Documents (Make preview PDF, Make final PDF once ready). |
| `#/app/itineraries/:id/preview` | Customer copy (`tn-doc` itinerary). |
| `#/app/itineraries/:id/print` | The PDF itself: live print layout without the CRM shell (opens in a new tab from Documents and the list). |

Invented: IT-0031 Bali (from Q-2610-014 v2, draft, 1 open difference) and IT-0027 Kashmir (from the BX-38377 booking, final PDF made 24 Oct). "Make branded itinerary" on a quotation makes a new one (IT-0032…) with the facts copied and marked.

## 4. Referral drafts · built and live, switch Off today

Shown **as they work once `referral_drafts` is switched On** (owner decision pending). Today the live New quotation page shows "Switched off" in the referral card instead of the form, and existing drafts keep working.

- `#/app/quotations/drafts/:id` (TD-318): Overview (customer details, edit, Close draft), Quotations (list + Create quotation), Itineraries, Link to Bitrix (pick one of the Deals you work on; never matched by name, mobile or email; nothing changes in Bitrix), History. Closed drafts can be reopened.
- "New referral quotation" / "New referral itinerary" make a TD- draft plus the quotation or itinerary.

## 5. Home rows

None registered. Agent A's Home already has the live rows: "Booking drafts you can continue", "Returned by Accounts", "Booking drafts missing details", "Confirmed deals needing a booking", "Quotation drafts to finish", "Accepted quotations to link to a deal" (the last two read `TN.DATA.quotations`). The live Home has no other quotation or itinerary rows.

## 6. Build notes for the main CRM build

1. Book now in the build is the approved form; nothing here changes its behaviour. One small state fix was needed to make submit usable: the approved file only refreshed "Submit booking and create tasks" on a full re-render, so after the last auto-save the button could stay greyed. `syncSubmit()` keeps it in step with "Before you submit". Build it that way.
2. Submit creates exactly one task per service row; hotel tasks start with the Accounts go-ahead waiting (Stage 3). A returned booking's resubmit (version 2) keeps the existing tasks and updates their budget.
3. Bill To search reads the customer list (name, company contact, phone, GSTIN); a picked customer still waits for the Accounts check.
4. "Start booking from this quotation" copies the accepted option's services (hotels with our nightly cost, car, activities, visa) and the per-person purchase / markup / final into a new booking draft, once.
5. Quotation money is whole rupees (as the live quote views); the rest of the preview prints paise.

## 7. Open questions (recommended answer in bold)

1. The quotation customer copy has a **"Print or save as PDF"** button in this preview (the browser's print dialog), because staff send the quotation themselves. The live customer copy has no button; staff print from the browser. **Keep the button** (it is the only addition to a live screen in this area); otherwise remove it.
2. Switch `referral_drafts` On? **Yes, after the owner tries TD-318 here**; until then the live page shows "Switched off".
3. When an accepted quotation's Deal is waiting in Bitrix, should Sales be reminded? **No new reminder**; the Home row "Accepted quotations to link to a deal" already covers it.
