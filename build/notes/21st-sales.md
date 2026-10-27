# 21st.dev calls: Sales records (Agent B, 27 Oct 2026)

| Query | What came back | Adopted? | Why |
|---|---|---|---|
| `status stepper` (components) | Stepper (sean0205 3728), Basic Stepper (sean0205 29925), Stepper (kevingirelli 35237: complete / current / upcoming, accessible), originui Stepper 773, corr Stepper 28565 | Idea only, from kevingirelli 35237 | The trip status (Booked → Travelled → Closed) needs "done / now / not yet" per step. Rebuilt as a plain ordered list with live lucide icons (circle-check, circle-dot, circle-dashed), the word next to each icon and `aria-current="step"`. No new styles; every class exists in live.css. |
| `payment schedule` (components) | Receipt Pricing 26309, Appointment Booking Split 29211, Dialog 379, Pricing Table 40206, Invoice History Table (ziegfiroyt 28473) | Idea only, from Invoice History Table 28473 | The customer dues view needs rows with date, amount and a status badge. Rebuilt with the live list table markup (the Deals table classes, stacked on phones) and the live StatusBadge (icon + word). Nothing copied. |

No customer data was sent; queries were one or two generic words.
