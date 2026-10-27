# 21st.dev calls: Flight and Visa (Agent E, 27 Oct 2026)

Tool: connected 21st.dev search (`mcp__b7058f30-...__search`, type component). Only generic words were sent; no customer, traveller or passport data.

| # | Query | What came back | Adopted? | Why |
|---|---|---|---|---|
| 1 | `mark complete` | Unrelated text and map parts (Highlight Match, MarkerContent, MarkerLabel, Marker Highlight, Marquee). | No | Nothing about finishing a task. |
| 2 | `completion checklist` | Sprint Task Checklist, Welcome Checklist Card, Onboarding Checklist (ssych, ephraimduncan, ravikatiyar162), Task Steps (ddoemonn). | Idea only | "What must be done first" with done / not done ticks and an "x of N done" count. The live CRM already has this exact pattern: `components/ui/progress-checklist.tsx` (Book now "Before you submit", itself adapted from 21st.dev sean0205 demo 29469). The "Before you mark it done" list on the flight task copies that live markup, so no new component or style was needed. |
| 3 | `confirm dialog` | shadcn Alert Dialog, originui Dialog and Alert Dialog, soralabs Base Alert Dialog, ephraimduncan Dialog Info. | Idea only | A confirm step before an action that locks the task. Built with the live Dialog (`TN.dialog`, Agent A's live Dialog markup): title, a short summary list, Cancel and "Mark flight done". |

No new CSS file. Every class used exists in `build/live.css`.
