# 21st.dev calls: Purchase (Agent D), 27 Oct 2026

Tool: `mcp__b7058f30-...__search`, type `component`, limit 5. Only short generic queries were sent; no customer or supplier data.

| # | Query | What came back | Adopted? | Why |
|---|---|---|---|---|
| 1 | `email compose` | Auth Email Change, Illos Email Signup, Email Signup Form, Email Verification Alert, Envelope Thank You Footer | No | All are sign-up or account forms, not a staff-to-supplier compose pattern. The e-mail drawer reuses the live Drawer plus the live `.field` / `.form-grid` form classes (To, Subject, Message) and a live info notice for the sender line. |
| 2 | `payment request` | Payment Card Form, Payment Form Card, Payment (card selector), Payment Error Toast, Dialog | No | Card-checkout patterns (card number, CVC). Wrong job and they would collect card data. The payment request drawer uses the live Drawer, live summary list (`data-slot="summary-list"`), live form fields and a live info notice that updates the approval route as the amount is typed. |
| 3 | `approval routing` | Approval Card (x2), Tool Approval, AI Approval, AI Tool Approval | No | Human-in-the-loop AI approval cards; new visual language. The routing line ("Accounts approves" / "Branch Manager approves" with the running total) is a live `data-slot="notice" data-tone="info"` block instead. |
| 4 | `invoice upload` | File Upload (x3), Invoice Form with Line Item Dialog, Invoice History Table | Idea only | The Invoice History Table's idea (one row per document with a status badge) matches the live Files list already; rows reuse the live Purchase file row markup plus a live status badge. No 21st.dev code or styles were copied. |

Result: no new component types. Every pending Purchase feature is built from existing live markup (cards, drawer, notice, status badge, summary list, file rows, claims-style list).
