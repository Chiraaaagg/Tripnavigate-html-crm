# Shell, Home, Notices, My access, shared UI (agent A), 27 Oct 2026

Files: `src/10-core.js` (internals only), `src/11-ui.js`, `src/12-shell.js`, `src/13-home.js`. No `12-shell.css` was needed:
every class used exists in `build/live.css`. Helper reference for other agents: `notes/ui-api.md`. 21st.dev log: `notes/21st-shell.md`.

## What was built

| Part | Live today or pending | Notes |
|---|---|---|
| Staff shell: w-64 sidebar, brand, Work / Accounts / Settings groups, current item highlight (longest match, Settings current on every `/app/admin/*`), account menu (details/summary popover: name, Holiday Chacha Pvt LTD, Your roles, My access, Sign out, More sign-out options), Escape / outside click closes it | **Live today** | Markup copied from `StaffShell.tsx`, `NavLinks.tsx`; class strings checked one by one against the `home-sales`, `home-accounts`, `deals-sales` captures (identical). |
| Phone top bar (under 1024 px) with "Menu" and the wordmark; left sheet with the same groups and the account panel | **Live today** | Open-state markup of the live Radix Drawer (`side="left"`, MobileNav classes). Focus starts on the first menu link, Tab is trapped, Escape / scrim / X close, focus returns to Menu, following a link closes the sheet. |
| "View as" role switcher in the account panel (desktop popover and phone sheet), after "Your roles" | Preview only | Radio group of 8 roles, current one marked with a check icon and `aria-checked="true"`; calls `TN.setRole`. Stays on the page if the new role may open it, else Home. Shows an info toast "Viewing as …". Not part of the CRM build. |
| Menu items per role (BRIEF §4) | Live items **live today**; Notices, Payment requests, Approvals, Reports, Customer dues, Supplier payments, Supplier invoices, Invoices and vouchers, Company funding, Refunds and recoveries, Tally export **pending** | Live labels, order and icons kept (including the live fallback circle icon for "Customers to check"). New icons: Notices bell, Payment requests wallet, Approvals shield-check, Reports chart-column, Customer dues calendar-clock, Supplier payments wallet, Supplier invoices receipt, Invoices and vouchers receipt-text, Company funding piggy-bank, Refunds and recoveries undo-2, Tally export download. Settings appears when `TN.settingsTabs(role)` returns a tab (Agent H); href = first tab. |
| Menu counts | **Pending** | Only on pending items: Notices (unread for the role, read out "N unread") and Approvals (the count Agent H registers for `/app/approvals`, so Home and the menu agree). Markup = the design-system `SidebarNav` count pill. Live items get no count, so the live menu look is unchanged. |
| Home `#/app` | **Live today** + pending rows | Copy of `home-view.tsx`: "Welcome, name", summary line, one primary action per role (Go to deals / Open Purchase tasks / Open Flight tasks / Open Visa and passport tasks / Open To check / Super Admin: "Open <first Settings tab>"), the three deal chips, "What needs you" table (stacked cards on phones), empty state "Nothing needs you right now" when no rows. Live rows are counted from `TN.DATA` with the live labels and live order; rows registered with `TN.homeRow` follow; then the shell's own pending row "Reminders and notices you have not read" (only for roles that receive notices) and, for the Manager, "Requests to approve (your branch)" only if Agent H registered no Approvals row. |
| "What this CRM does not do yet" note on Home | **Changed text (pending)** | The live text says invoices, supplier payments and reports are not in the CRM; that is no longer true once the plan is built. New text: customer e-mails/WhatsApp are not sent from the CRM yet (download or print and send yourself), train bookings are not in the CRM yet, Sales leads/follow-ups/stages stay in Bitrix. |
| Notices `#/app/notices` | **Pending (to build)** | Staff reminders and notices only. Live list pattern: page header (unread count, "Mark all as read"), filter chips All / Reminders / Notices / Escalations (`?filter=`; Escalations chip only when the role has escalations or is the Manager), card table: Notice (bold when unread, sr "Unread:"), Type badge (Reminder warning + alarm-clock, Notice info + bell, Escalation danger + circle-alert), Deal link, Sent (IST), Status badge (Unread / Read), "Mark as read". Opening the Deal link marks the notice read. |
| My access `#/app/access` | **Live today** | Plain legacy markup as live (`MyAccessView`): membership table and "Wider access grants" (Manager: Jodhpur branch; Accounts: whole company; others "You have no wider access grants."). |
| Not allowed / not found | **Live today** (style) | `TN.ui.notAllowed`: page header + card with icon + one sentence + "Back to home", same pattern as the live "Deal not available" page. Role refused: "Page not available" / "This page is not part of your role. Ask your branch Manager if you need it." Unknown address: "Page not found" / "This address does not exist, or it is not visible to you." |
| Sign out / Sign out everywhere | Preview behaviour | Both go to the live sign-in screen (`#/sign-in`, plain auth layout as `sign-in-error` without the error); "Sign in" returns to Home. |
| Overlays (`TN.drawer`, `TN.dialog`, `TN.toast`) | **Live today** | Open-state markup of the live Radix Dialog / Drawer and the live toast regions (`drawer.tsx`, `dialog.tsx`, `toast.tsx`). Core now: background `inert` + `aria-hidden`, focus to the first field (dialogs: the first footer button, so put the safe one first), Tab trap, Escape / scrim / X close, focus return. Toasts: polite region for success/info/neutral (close after 6 s, paused on hover/focus), assertive region for warning/danger (stay until dismissed), at most five. |

## Data and rules the main CRM build will need

- Notices: `notices[].readBy` (role keys in the preview; per person in the build) is added at run time. Read is per person; "Mark all as read" covers only the person's own notices. Notices are staff-only (standing rule 10); no customer sending.
- Home counts follow the live `my_work_counts` meanings: drafts = in progress, ready to submit or returned; missing details = in progress with no price or no services; needing a booking = not started or quotation accepted; department queues = tasks not taken (new, no assignee) plus the person's own in progress, on bookings Accounts approved; receipts to verify = recorded by someone else (the two-person rule).
- Menu counts are a convenience only; each page still decides access.

## Open questions (with recommended answer)

1. Should live items such as "To check" also show a count in the menu? **Recommend no** for now: the live menu has none and Home already shows the counts; add later as one design change for all items.
2. Flight and Visa Home show both the live combined row and Agent E's own rows ("Flight tasks not taken", …), which overlap. **Recommend** keeping only the live combined row plus E's rows that add something new (tickets to mark done, costs returned); lead/Agent E to decide.
3. Notices for the Super Admin: none exist in the data, so Admin Home shows the live empty state. **Recommend** that system problems (Bitrix sync, backups) become Admin notices later.

## Build notes

- `TN.ui.cx` is a small tailwind-merge (same groups the live `cn()` resolves), so helper output equals the server-rendered captures, e.g. the Menu button `… h-10 text-base px-2.5 lg:hidden` and the record header `… mb-3`.
- Icons: 166 lucide icons generated from the live `node_modules/lucide-react` (1.49.0); all 89 icons in the captures were checked byte for byte.
- Browser cache: when retesting `build/out/*.html`, add a throwaway query (`&v=2`) or the old file may be served.
