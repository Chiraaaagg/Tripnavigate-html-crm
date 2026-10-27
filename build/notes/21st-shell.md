# 21st.dev calls: shell (agent A), 27 Oct 2026

| Query | What came back | Adopted? | Why |
|---|---|---|---|
| `notification list` (component) | Notification List (skyleen77, 22228, animated stacked cards), Notification Panel (uvain, 27135, bell popover grouped by day, filter by kind, "seen" vs "dealt with"), Team Invitation, Notification Settings Field, Alert | Idea only from 27135 | The idea of filtering by kind and keeping "read" separate from "dealt with" is used: filter chips All / Reminders / Notices / Escalations and an explicit Read / Unread status word. No code copied. The page is built from the live list pattern (page header, filter chips, card table, list pager) so it looks native; no bell popover, no animation (new component types are not allowed). |
| `role switcher` (component) | Only on/off Switch components (jolbol1 5057, bysages 37312, halaska-studio 34782, lever-switch 5210) | No | A switch is the wrong control for choosing one of eight roles. The "View as" group reuses the live account-panel rows ("Your roles" label style, menu-row buttons) as a radio group with a check icon on the current role. |

No customer data was sent; queries were two-word generic phrases.
