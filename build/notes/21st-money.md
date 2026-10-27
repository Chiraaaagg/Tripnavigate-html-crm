# 21st.dev calls: Accounts money (Agent G, 27 Oct 2026)

Tool: connected 21st.dev `search` (type component). No customer data sent; one to three word queries only. No `get_component` call (no code needed; every pattern was rebuilt from live CRM markup).

| # | Query | What came back | Adopted? Why |
|---|---|---|---|
| 1 | `invoice` | Invoice History Table (billing list with status badge and per-row download), Invoice Line Items Table (lines + subtotal/total footer), Invoice Table (caption + footer total), Receipt Pricing, Invoice Form with Line Item Dialog | **Partly.** The line-items-with-total-row idea shaped the A4 Invoice: one row per service, a bold "Total for the trip" row, then a "Payments received" table and "Balance due". Restyled entirely onto the live customer-document classes (`.tn-doc`, `.doc-table`, `.doc-head`, `.doc-bar`, `.doc-foot` from the live quotation preview). Per-row download from Invoice History became the Download PDF / Print buttons on approved documents (live button markup). |
| 2 | `payment queue` | Message Queue, Banner, Notification Stack, Illos Queue Empty State, Pending | **No.** None fits an approval queue; the supplier payment queue copies the live Department costs review cards (article + summary list + Accept / Return toggle) and the live Reported payments tabs. |
| 3 | `ageing` | nothing | **No result.** Ageing is a status pill in the live To check queue table (`status-pill` + glyph + word). |
| 4 | `aging report` | Research Report, Incident Report, Carousel, Alert | **No.** Not relevant. |
| 5 | `export` | Share Menu with Export Submenu, Data Export Checkbox Group | **No.** The Tally page needs one month picker and two buttons; it uses the live lookup-card section, live Select, stat items, notices and the live `.fin-queue` table. |
| 6 | `approval queue` | Access Request Inbox, Message Queue, Approval Card, Tool Approval | **No.** The AI-agent approval cards do not match the CRM. Live Department costs cards used instead. |
| 7 | `checklist` | Sprint Task Checklist, Checkbox Todo List, ChecklistButton, Welcome Checklist Card, Onboarding Checklist | **No new pattern.** The live CRM already has `ProgressChecklist` (itself adapted from 21st.dev "Multi-Step Progress", demo 29469) for Book now; the trip closure checklist reuses its exact markup (bar + "x of N done" + circle / circle-check items that link to the place to fix). |
