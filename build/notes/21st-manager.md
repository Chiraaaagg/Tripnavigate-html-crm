# 21st.dev calls: Agent H (Manager approvals, reports, Settings)

27 Oct 2026. Tool: `mcp__b7058f30-...__search`, type `component`, limit 5. No customer data was sent.

| Query | What came back | Adopted? Why |
|---|---|---|
| `approval inbox` | Access Request Inbox (uvain), Notification Panel, Notification Inbox Popover, Email Inbox Skeleton, Background Inbox | Idea only: "group requests by what they ask for" became one section per request kind. Markup not adopted: the brief says the inbox must look like the live Accounts "To check" queue, so it uses the live `table-scroll` / `stack-table fin-queue` / `status-pill` markup. |
| `report table` | Incident Report Large/Middle, Research Report, Records Table (sticky first column, calculations footer), Radar chart | Idea only: the totals footer of Records Table became the live Card footer line ("Still due ₹… of ₹…"). Table markup is the live `Table` component (stack on mobile). No sticky column (live has none). |
| `settings toggle` | Theme Toggle, Styled Toggle Switches, Server Settings Toggle, useToggle, Switch | Not adopted. Live switches never flip in one click: every change is Change → reason → Review → Confirm (DA-256). The big switches reuse that live flow and the live `setting-row` markup. |
| `bar list` | Tag List, Stacked List, Sortable List, List Item, Grid List | Not adopted. The report bars are a plain single-series horizontal bar list built from live tokens (`bg-wash` track, `bg-brand-strong` bar, text in ink), following the dataviz rules (one hue, values in text colour, table view below, native hover title). |
