# TN.ui helpers (src/11-ui.js, shell agent A)

Every helper returns an HTML string with the live CRM's exact markup and class strings (copied from
`crm/src/components/ui/*.tsx` and checked against `build/ref/gallery/*.html` and `build/live.css`).

Rules:

- **Text and HTML parameters are inserted as HTML.** Escape data yourself: `TN.ui.badge(TN.esc(word), 'info')`.
- Hrefs may be `/app/...` or `#/app/...` (helpers turn `/app/...` into `#/app/...`).
- Actions: pass `act: 'name'` (adds `data-act`) and `data: { id: 'SP-26-0031' }` (adds `data-id`), then `TN.act('name', (el) => ...)`.
- `cls` on any helper adds classes the live way: `TN.ui.cx(base, cls)` is a small tailwind-merge, so a later class
  replaces an earlier one of the same kind (`px-2.5` removes `px-3.5`, `mb-3` removes `mb-5`, `align-top` removes `align-middle`).
  Only use classes that exist in `build/live.css`.
- Wrap a page body in `TN.ui.page(html)` (= live `<div class="font-sans text-base text-copy">`).

## Icons

| Helper | Example |
|---|---|
| `TN.ic(name, cls?)` | `TN.ic('plane', 'size-4 shrink-0 text-quiet')` |
| `TN.icons()` | list of the 166 available names |

Names are lucide kebab names as imported by the live code (`building-2`, `circle-check`, `file-question-mark`,
`trash-2`, `undo-2`, `hand-coins`, `landmark`, `wallet`, `receipt`, `banknote`, `bell`, `alarm-clock`, `shield-check`,
`chart-column`, `file-spreadsheet`, `ban`, `hotel`, `car`, `ticket`, `stamp`, `printer`, `send`, `list-todo`, `key-round`,
`chevrons-up-down`, `log-out`, `menu`, ...). The SVG body and the `lucide lucide-<name> lucide-<alias>` class list come
from the live lucide-react 1.49.0 package. Unknown name -> `circle`.

## Layout

| Helper | Signature | Example |
|---|---|---|
| page | `page(html)` | `TN.ui.page(header + list)` |
| pageHeader | `pageHeader({ title, description, eyebrow, status, actions, back: { href, label }, cls })` | `TN.ui.pageHeader({ title: 'Supplier payments', description: 'Requests from Purchase and Flight.', actions: TN.ui.button('Export', { icon: 'download' }) })` |
| backLink | `backLink(href, label)` | `TN.ui.backLink('/app/deals', 'Back to deals')` (record pages; with `pageHeader({ back })` add `cls: 'mb-3'` as the Deal page) |
| owner | `owner(nameHtml, label = 'Owner')` | goes in `pageHeader({ status })` |
| meta | `meta(icon, text)` | `TN.ui.meta('list-checks', 'Services: 2 of 4 confirmed')` |
| sectionTitle | `sectionTitle(text, id?, level = 2)` | Home's "What needs you" heading |
| card | `card({ title, level = 2, titleId, description, actions, header, body, bodyCls, flush, footer, cls, attrs })` or `card(bodyHtml)` | `TN.ui.card({ title: 'Receipts', description: 'Two different Accounts people.', body: TN.ui.summaryList(rows) })` |
| statCard | `statCard({ label, value, note, icon, cls })` | wrap in `<div class="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">` |

## Status and messages

| Helper | Signature | Example |
|---|---|---|
| badge (= statusBadge) | `badge(wordsHtml, tone = 'neutral', { icon, wrap, sr, cls })` | `TN.ui.badge('Waiting for the Manager', 'warning')`; tones `success warning danger info neutral brand` (default icons circle-check, triangle-alert, circle-x, info, clock, send) |
| countBadge | `countBadge(n, ariaLabel?)` | next to a card title |
| waiting | `waiting(n)` | Home "Waiting" pill, or "Nothing waiting" when 0 |
| notice | `notice(bodyHtml, { tone, title, role, icon, cls, id })` | `TN.ui.notice('<p>You recorded this, so a different person must verify it.</p>', { tone: 'restricted', title: 'Not allowed', role: 'alert' })`; tones `info warning danger success restricted locked` |
| errorSummary | `errorSummary({ title, text, items: [{ href, text }], cls })` | `TN.ui.errorSummary({ text: 'Nothing was stored; your typed values are still in the form.', items: [{ href: '#pay-ref', text: 'Enter the bank reference.' }] })` |
| emptyState | `emptyState({ icon, title, description, action, level = 3, cls })` | `TN.ui.emptyState({ icon: 'inbox', title: 'Nothing to check', description: 'New receipts appear here.' })` |
| notAllowed | `notAllowed(found)` or `notAllowed({ title, text, icon, back: { href, label } })` | page body for a refused or unknown record |

## Lists

| Helper | Signature | Example |
|---|---|---|
| table | `table({ label, columns, rows, caption, stack = true, inCard = true, cardHeader, footer, top, firstNoLabel, empty, rowCls, id })` | see below |
| rowLink | `rowLink(href, text)` | first cell of a list row (`data-slot="row-link"`) |
| link | `link(href, text, cls?)` | underlined inline link |
| rowDetails | `rowDetails([{ label, value }], srFor)` | Deals-list "Details" disclosure |
| pager | `pager({ label, text, prev: { href, label }, next })` | pass as `table({ footer })` |
| tabs | `tabs({ label, items: [{ href, label, current, count }], cls })` | record tabs: `TN.ui.tabs({ label: 'Deal sections', cls: 'mb-4', items })` |
| filterChips | `filterChips({ label, chips: [{ href, label, count, current, srSuffix }], scope, cls })` | `count: null` shows "(count unavailable)"; omit count for none |
| order | `order({ label, items: [{ href, label, current }] })` | Deals list "Order:" switch |

Table example (the live list pattern: Deals list, Purchase queue):

```js
TN.ui.table({
  label: 'Supplier payments',
  top: true,                       // align-top rows, as the live lists
  columns: ['Request', 'Deal', 'Supplier', { label: 'Amount', numeric: true }, 'Status'],
  rows: list.map((p) => ({ attrs: { 'data-id': p.id }, cells: [
    TN.ui.rowLink('/app/accounts/supplier-payments/' + p.id, TN.esc(p.id)),
    TN.esc(p.deal), TN.esc(TN.supplier(p.supplier).name),
    TN.fmt.inr(p.amount),           // numeric column -> right-aligned tabular
    TN.ui.badge('Waiting for the Manager', 'warning'),
  ] })),
  empty: 'Nothing waiting',
  footer: TN.ui.pager({ label: 'Payment pages', text: `1–${list.length} of ${list.length} requests` }),
})
```

A cell can be `{ html, numeric, cls, label, noLabel, attrs }`. On phones rows become labelled cards (`data-label`
from the column name); the first cell is the card title.

## Forms

All controls take `{ id, name, value, placeholder, invalid, hint, error, describedBy, required, disabled, readonly, change, data, attrs, cls }`.
Pass the SAME `id`, `hint` and `error` to the field and the control (or use the field shortcuts) so `aria-describedby` matches.

| Helper | Signature | Example |
|---|---|---|
| field | `field({ id, label, control, hint, error, optional, aside, extra, cls })` + shortcuts `input`, `select`, `textarea`, `money` | `TN.ui.field({ id: 'pay-ref', label: 'Bank reference', hint: 'UTR or cheque number.', input: { name: 'ref' } })` |
| input | `input({ type = 'text', inputMode, autoComplete, ... })` | `TN.ui.input({ id: 'd', type: 'date', name: 'date' })` |
| money | `money({ ... })` | `TN.ui.field({ id: 'amt', label: 'Amount ₹', money: { name: 'amount', value: 56250 } })` |
| select | `select({ options: [{ value, label, disabled }] or ['a','b'], value, placeholder, change })` | `TN.ui.select({ id: 'mode', name: 'mode', options: ['Bank transfer', 'UPI', 'Cheque', 'Cash'] })` |
| textarea | `textarea({ rows = 4, ... })` | |
| checkbox / radio | `checkbox({ id, name, value, label, description, checked, disabled, invalid, change })` | |
| choices | `choices({ id, legend, name, type, items: [checkbox options], error })` | radio group: `type: 'radio'` |
| chipCheck | `chipCheck({ id, name, value, label, checked, change })` | "Who takes part" pills |
| fieldset | `fieldset({ legend, body, cls })` | grouped card fieldset |
| buttonClass | `buttonClass(variant, size, extra)` | class string for your own `<a>`/`<button>` |
| button | `button(labelHtml, { variant, size, href, act, type, icon, iconRight, cls, id, data, attrs, disabled, loading, srLabel, ariaLabel })` | `TN.ui.button('Record payment', { variant: 'primary', act: 'record-pay', data: { id: p.id } })`; variants `primary secondary ghost danger link`, sizes `sm md lg icon`; `href` gives a link styled as a button; `type: 'submit'` inside `<form data-act>` |

## Overlays (live Radix open-state markup)

Open them with the core API; the helpers only build markup:

```js
TN.drawer({ title: 'Pay supplier', description: 'SP-26-0027 · Pine Spring Resort', body: formHtml,
            footer: TN.ui.button('Record payment', { variant: 'primary', type: 'submit', attrs: { form: 'pay-form' } }) + TN.ui.button('Cancel', { attrs: { 'data-close': '' } }),
            wide: false, side: 'right' });
TN.dialog({ title: 'Approve ₹56,250?', description: 'Arabian Nights DMC · BX-38390', body: '<p class="m-0">…</p>',
            footer: TN.ui.button('Cancel', { attrs: { 'data-close': '' } }) + TN.ui.button('Approve', { variant: 'primary', act: 'approve', data: { id } }) });
TN.toast('Payment approved');                       // success, closes after 6 s
TN.toast('Not allowed', 'danger', 'You recorded this, so a different person must verify it.');   // stays until dismissed
TN.toast({ title: 'Saved', description: 'Sales sees it now.', tone: 'info' });
TN.closeOverlay();                                   // or any element with data-close
```

- `drawer({ title, description, body, footer, side = 'right', wide, closeLabel, cls, bodyCls, footerCls })`: 24rem panel;
  `wide: true` = the live 42.5rem passenger drawer (sticky footer, square on phones).
- `dialog({ title, description, body, footer, tone, hideClose, closeLabel, cls, bodyCls })`: footer buttons in markup
  order safe-first (live footer is `flex-col-reverse` on phones, right-aligned on desktop). `tone: 'danger'` uses `role="alertdialog"`.
- Behaviour (in 10-core.js): background inert, focus moves to the first field/button, Tab is trapped, Escape and the scrim close,
  focus returns to the trigger. Toast tones: `success info neutral` (polite, auto-close, paused on hover/focus), `warning danger` (assertive, stay).
- Forms inside a drawer: `<form data-act="save-x" id="pay-form">…</form>`; put the submit button in the footer with `attrs: { form: 'pay-form' }`.
