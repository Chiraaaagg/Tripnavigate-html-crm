# Redesign: Settings and Manager (Agent E, 16 Nov 2026)

Files changed: `build/src/80-manager.js`, `build/src/81-settings.js`. No CSS file; every class is in `build/live.css` or Agent A's `12-shell.css` (checked in the browser against the loaded style sheets on every page).
Tested with `python3 -I build/assemble.py settings` (`build/out/settings.html`, port 4181, own tab) as admin, manager, accounts and checker at 1280 px, 640 px (200% zoom) and 390 px: no sideways scroll, no console errors, focus visible, Cancel focused first in every confirm dialog, focus returns to the row's Change button after a change.

Shared helpers used (feature-detected, with a local fallback): `TN.ui.switchRow`, `TN.confirmChange`, `TN.ui.approvalRowActions`, `TN.ui.tabs` (C5 look), `TN.ui.state`, `TN.jumpTo`.

## 1. What changed, per screen

### Settings frame (N7, S1, S2, X1)
- Area list on the left on desktop (`nav aria-label="Settings areas"`, `aria-current`), a "Settings area" select on phones and at 200% zoom. One heading per area (the area name, with a small "Settings" eyebrow) and one muted line. The old "Settings" heading, tab bar and tab line are gone.
- Areas: Overview · People and access · Company and branches · Money rules · Bitrix connection · Features · Customer messages · E-mails · Reminders · Imports · System health. The same name is used in the list, the heading and the page title.
- New Overview landing `#/app/admin`: one row per area with a state badge and one line ("4 of 18 on · pilot list on (2 Deals) · 4 keys not saved yet", "Delhi and Ahmedabad have no GSTIN yet", ...). Accounts and the Accounts checker still go straight to Imports (customer list), without the area list.
- `TN.settingsTabs(role)` still works for the shell: admin gets every area (first entry `#/app/admin`, label "Settings" so Home reads "Open Settings"); accounts/checker get Imports only; others none.

### C6 switch rows and C7 confirm (S3, S4, S6, D9)
- Every switch (Features, staff notices, big switches, Bitrix switches, "Bring in deals only when won", payment modes, reminder rules, customer message cells, pilot list, timer) is one row: name · one-line effect · state in words (On / Off / Not known) · last change (who, date) · "Change". The long text, the reasons and the change history are behind "More". The reason box is never on the page.
- "Change" opens one dialog: title, one sentence of effect, "Who is affected", an optional reason (D9: may be empty; recorded with name and time), Cancel focused first and one button named for the action ("Switch on Referral drafts"). Plain switches use `TN.confirmChange`; dialogs that need extra fields or a blocked confirm (reminder numbers, supplier confirmation safety checks, timer without its secret, WhatsApp text status, roles) use the same layout built locally (`role="alertdialog"`), because `TN.confirmChange` cannot refuse and keep the dialog open.
- Supplier confirmation: the safety checks are in the dialog; if one fails the confirm button is disabled with the reason beside it, and the row's Change is disabled with the missing check named (blocked state, C8).
- Bitrix "Which deals come in": the form stays on the page; "Review and save" opens the C7 dialog (reason now optional).

### Features (S6, D12)
- Switches card: Book now (service list), won-deal count, Visa and passport tasks, Fill from Bitrix, Referral drafts, **Staff notices (the bell)** (moved here, D12). Big switches card: Real bookings, Supplier confirmation. One closing line links Money rules and Bitrix connection. The repeated "Affects: every branch" line is gone.

### Customer messages (own area, S7, D12)
- Route `#/app/admin/customer-messages` (the live address). Sub-tabs Switches · Texts · Pilot list · Set-up (`?tab=texts|pilot|setup`).
- Switches: 9 messages × E-mail / WhatsApp grid; each cell is a state badge with "Change". A WhatsApp cell whose text WhatsApp has not approved has a disabled Change with the reason ("Set its status on Texts"). One summary line (n of 18 on, pilot list, timer) and the "Sending is not fully set up yet" notice when keys are missing.
- Texts: one fold-out per message with the e-mail subject and the text, WhatsApp approval status badge, "Set WhatsApp status" (dialog). Setting a not-approved status switches WhatsApp sending of that message off and says so.
- Pilot list: switch row "Only pilot Deals get messages", pilot Deals table with Remove (dialog), "Add a pilot Deal" (dialog with a Deal select).
- Set-up: Timer switch row (blocked while the timer secret is not saved) and the five sending keys as Saved / Not saved yet (never their value).
- **No message-language choice anywhere**: English texts only, no Hindi column, no language words except "Every message is in English" in the area line.

### People and access (S9, S10, S11, D8)
- Sub-tabs Staff · Extra access · Roles and branches.
- Staff: list first (rows, not a wide table, so nothing overflows at 1280 or 390). "Invite staff" is the page's primary button and opens the invite form in a drawer (same fields and messages). Each row: name, e-mail, roles · branches · sign-in security in words, last e-mail in plain words, failure code only behind "Details" (Tanvi Bohra: `provider_unavailable:503`), status badge, and an "Actions" row menu (Resend invitation or Send password reset e-mail, Change roles and branches, Deactivate). The menu closes on Escape and outside click. Deactivate opens a danger confirm with a **required** reason (live rule, not a switch).
- Extra access: list first, "Give extra access" opens the form in a drawer; Revoke opens a confirm with a required reason (live rule).
- **Roles and branches (new, D8)** `#/app/admin/roles`: table of staff with roles, branches, last change and "Change" (dialog with role and branch checkboxes). "Add a role" (primary) opens a dialog: staff member, role to add, branch to add. Reason optional. Refusals keep the ticks: no role left, no branch, your own roles, nothing changed. Every change goes into a folded "Change history" and a notice to Super Admins. Staff now carry `roles` and `branches` arrays (fallback to the single `role`/`branch`); safety checks and counts read the arrays.

### Other areas
- Money rules (S13): current version summary on top (values plus legal ceilings), "Change the policy" opens the form in a drawer (same fields, rules and messages), payment modes as switch rows, history folded.
- Bitrix connection (S5): sub-tabs Status · Which deals come in · Switches · Clean-up (`?tab=deals|switches|cleanup`). Status: one card, counts on one line, technical checklist and facts behind "Details", "Check Bitrix now" as the primary button. "Only when won" appears once (Which deals come in).
- Company and branches: read-only line ("You can view this. The CRM team changes it …").
- E-mails, Reminders, Imports, System health: framed in the new layout; rows in one card; template reason now optional (D9); reminder rules are switch rows with the number in the dialog.

### Manager Approvals (DM-5, DM-6, DM-7, DM-8)
- Header: one heading, one muted line. Tabs (C5) Waiting for you · Escalations · Decided, unchanged addresses.
- Waiting for you: sticky (desktop) summary chips, one per section with something waiting and its count; a chip moves focus to that section heading (`TN.jumpTo`, no hash links). Only sections with something waiting are shown; the empty ones are listed in one closing line ("Nothing waiting: …"). Counts leave out the Manager's own requests, so tab, chips, sidebar and Home agree.
- One row template for all six sections (live Table, stacked on phones): Request (ID, title, "Raised by …, date") · Deal · Amount · Why it is with you · Decision. Decision = `approvalRowActions` (Approve / Return) plus "Details" (the existing review drawer, still with Approve / Return to …). Approve acts at once (as live); Return opens a dialog with "Reason for returning", 10 to 500 characters, "Not returned: say why, in 10 to 500 characters." Own request (WO-26-003) and a payment paid from unapproved company funding show disabled actions with the reason beside them.
- Escalations: same section pattern (chips when more than one section, closing line for empty ones), live Table rows, row buttons unchanged.
- Decided: live Table.

### Reports list
- Rows in the queue pattern instead of cards: Report (link + one line) · Next step ("Open", or a lock line "Not shown for your role: it shows supplier costs."). Report pages unchanged.

## 2. Not done, and why

- **Settings › Accounts area** (Accounts switches, Tally mapping sub-tab, S4/S8/S12) is not in the prototype and is not in my scope row; the staff notices switch moved to Features as asked. The Tally method switch (D11) is Agent D's.
- Phone: the Approvals summary chips are sticky on desktop only (the phone top bar is already sticky; two sticky bars would cover the content).
- The first waiting item's Approve is not filled (the shared `approvalRowActions` uses outline buttons; I kept the shared part rather than a page-specific primary).

## 3. Open questions for the lead

1. **Home vs Customer messages**: Home's fold "What this CRM does not do yet" (Agent A, `13-home.js`) still says customer e-mails and WhatsApp messages are not sent. With Customer messages now its own area (4 of 18 on, as live), that line contradicts it. Recommend Agent A drops that sentence or the lead decides the default (all 18 off).
2. **Roles that mix desks and prices**: should a person holding Purchase (or Flight/Visa) also be allowed Sales, Accounts or Manager? Built: allowed, with the note "Prices follow the roles: a person who also holds Sales, Accounts or Manager sees selling prices." Owner decision recommended.
3. Required reasons kept on non-switch actions (deactivate staff, revoke extra access, import a file, Return an approval) because those are live rules, not Settings switches; D9 makes only switch reasons optional.
