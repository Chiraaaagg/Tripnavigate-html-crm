# Redesign: shell and shared parts (Agent A, 16 Nov 2026)

Files: `src/11-ui.js` (helpers, new block at the end of the file, plus the new `TN.ui.tabs` look),
`src/12-shell.js` (menu, quick search), `src/12-shell.css` (new, small: only live CSS variables),
`src/13-home.js` (Home), `src/10-core.js` (internals only).

## 1. Shared helpers: final signatures (ready, tested in build/out/shell.html)

All return HTML strings unless stated. Text and HTML parameters are inserted as HTML: escape data with `TN.esc` first.
Hrefs may be `/app/...` or `#/app/...`.

```js
TN.ui.statusTone(word)            // -> { tone, icon }. Lookup is case-insensitive, tags/entities stripped. Unknown -> { 'neutral', 'clock' }.
TN.ui.statusTone.add(word, tone, icon?)   // add a word to the shared table (rare; one word = one tone everywhere)
TN.ui.status(wordHtml, { second, sr, icon, wrap, cls })   // badge (tone from statusTone) + optional plain small second fact beside it

TN.ui.recordHeader({
  back: { href, label },          // line 1: back link · recordId
  recordId,
  title,                          // line 2: title · status badge · owner
  status,                         // a status word (badge via statusTone) or ready HTML starting with '<'
  owner,                          // a name (escaped) or ready HTML starting with '<'
  next: { text, button: { label, href | act | jump: '#element-id', data, icon, id, disabled } } | null,
                                  // line 3 "Next: …" with the page's ONE primary button; jump scrolls to the id and focuses it
  nextWho,                        // used when next is null: "Purchase confirms the hotel." (viewer cannot act)
  readOnly,                       // "You can view this. Accounts can change it." (true = "You can view this.")
  details, detailsLabel = 'Details',   // folded system facts
  actions,                        // optional quiet buttons right of the title (keep to one or two)
  cls })

TN.ui.queueToolbar({ id = 'queue-toolbar',
  search: { name = 'q', value, placeholder, label },        // submits on Enter (and the arrow button)
  chips: [{ href, label, count, current }],                 // first four visible, the rest under "More" (current chip always visible)
  sort: { name = 'sort', value, label = 'Sort', options: [{ value, label }] },
  act, chipsLabel = 'Filter', label = 'Search and filter', cls })
  // act omitted -> built-in 'tn-queue': rewrites the current address with ?q=…&sort=… (other params kept, 'page' dropped);
  //   your render() just reads query.q / query.sort. "Clear search" link appears while q has a value.
  // act given -> TN.act(act, (el) => …) gets the FORM on Enter and the SELECT on sort change (use el.form || el).

TN.ui.approvalRowActions({ id, approveAct, returnAct, approveLabel = 'Approve', returnLabel = 'Return', data, srFor, disabledReason })
  // Approve (outline, check icon) + Return (text, undo icon); both carry data-id=id (+ data). srFor = screen-reader suffix (default the id).
  // disabledReason: both disabled, reason with a lock icon below them (blocked state).

TN.ui.tabs({ label, items: [{ href, label, current, count }], cls })   // same signature, new C5 look (pill tabs on a grey track)
  // count: number -> badge; 'unknown' -> dash read as "count not known"; anything else -> nothing. Tabs wrap on narrow screens.

TN.ACC_SECTIONS        // [{ key, label, icon, tabs: [{ href, label, count: () => n | null }] }]
  // keys: 'to-check', 'money-in', 'money-out', 'cash-bank', 'records', 'tally'
TN.ui.sectionTabs(sectionKey, currentHref, { label, cls = 'mb-4' })   // Accounts section tab strip; '' for one-tab sections (Records, Tally)
  // key spelling is forgiving: 'money-out', 'Money out', 'moneyout' all work; unknown key -> section found from currentHref.
TN.setAccCount(href, () => n)      // replace one tab's count (default = sum of the Home rows whose address is that list)
TN.accSection(key), TN.accSectionOf(href), TN.accSectionCount(section), TN.accSectionHref(section)   // used by the menu

TN.ui.switchRow({ id, name, effect, more, state: 'on' | 'off' | 'unknown', last: { who, when } | null, act, data, disabledReason, changeLabel = 'Change' })
  // "Change" button: data-act=act, data-id=id (+ data). Not a toggle: act should open TN.confirmChange.
  // Put rows in a card: TN.ui.card({ title, flush: true, body: rows.join('') }). last: null -> "Never changed".

TN.confirmChange({ title, effect, affected, confirmLabel, tone, onConfirm: (reason) => {},
  reason = 'optional' | 'required' | 'none', reasonLabel = 'Reason', reasonHint, body })   // opens the C7 dialog
  // role=alertdialog; Cancel focused first; one confirm button named for the action; tone 'danger' = red button.
  // 'optional' (D9 default): may be empty -> onConfirm(''). 'required' (Return with reason): 10 to 500 characters,
  // a refusal shows an error summary and keeps the typed text. onConfirm runs after the dialog closes; focus goes back
  // to the triggering control (same id, or same data-act + data-id) after your TN.refresh().

TN.ui.state({ kind: 'empty' | 'error' | 'blocked' | 'readOnly' | 'off' | 'unknown', title, text, action, who, icon, saved, card, cls })
  // empty: icon + title + one sentence + at most one action (in a card unless card: false)
  // error: danger notice (role=alert): title = what happened, saved: true|false sentence, who can fix it, action (Try again)
  // blocked: action (pass it disabled yourself) + reason (text) + who, with a lock icon, beside it
  // readOnly: one line "You can view this. <who> can change it." (or text)
  // off: "Switched off" notice + text + who + action (link for a Super Admin)
  // unknown: inline italic "Not known" (never 0)

TN.ui.fold({ id, summary, body, open, cls, flat, meta, bodyCls })   // plain <details>, chevron, no height animation;
  // flat = no card frame (inside a card); meta = small text at the right of the summary line
TN.ui.jumpLinks([{ href: '#rates', label: 'Rates' }], { label, cls })   // "Jump to:" links that scroll to and focus the target
TN.jumpTo(id)                     // same behaviour from your own code; opens closed <details> around the target
TN.quickSearch()                  // opens the C9 quick search dialog (also sidebar find box and the "/" key)
TN.homeAllRows()                  // every Home row for the current role: { label, count, href, action, icon }
```

Notes for page owners:

- Do not use `<a href="#some-id">` for in-page links: the address is the router. Use `TN.ui.jumpLinks`, `next.button.jump`
  or `TN.jumpTo(id)`.
- A record page passes `TN.ui.tabs({ …, cls: 'mb-4' })` as before; no change needed to get the new look.
- Status words: if your word gets the wrong tone, tell the lead (or use `statusTone.add` in your own file, once).

## 2. Home row addresses (for Agent B, Sales lists)

Home rows open filtered lists. The Deals list should accept these `?filter=` values (Agent B's chips):

| Home row | Address |
|---|---|
| Booking drafts you can continue | `/app/deals?filter=drafts` (in progress, ready to submit, returned) |
| Returned by Accounts | `/app/deals?filter=returned` (already exists) |
| Booking drafts missing details | `/app/deals?filter=missing_details` |
| Confirmed deals needing a booking | `/app/deals?filter=needs_booking` (not started, quotation accepted) |

## 3. What changed per screen

| Screen | Findings | Change |
|---|---|---|
| Left menu, all roles (C1, D5) | N1, N2, N3, N4, N5, DM-19, CQ-6, CQ-7 | Groups: top (Home, Notices, Approvals with count for the Manager, Reports for Manager and Super Admin) · Sales (Leads, Deals, Quotations) · Desks (Purchase tasks, Flight tasks, Visa and passport tasks, Suppliers) · Accounts (To check, Money in, Money out, Cash and bank, Records, Tally). A group shows only when the person has a link in it; a one-link group has no heading. Group headings are buttons that fold the group (remembered in `localStorage` key `tn-nav-folded`, wrapped in try/catch; a folded group shows its total count on the heading); the group holding the current page always opens. No fold animation. **Settings and the account panel are pinned** below the scrolling menu. Find box at the top. Accounts went from 13 links to 6; each section link opens its first tab with something waiting, otherwise the first tab. Itineraries and Payment requests left the menu; their addresses still work and mark Quotations / Purchase tasks as current. |
| Menu counts | N3 | Notices (unread), Approvals (Manager), Deals (Sales, Manager: deals needing booking work = not started, quotation accepted, draft, ready to submit, returned), Purchase / Flight / Visa tasks (desk person: not taken + own in progress, same number as Home), each Accounts section (sum of its tabs). A count that cannot be read shows a dash read out as "count not known", never 0. |
| Phone Menu sheet | N1 | Same groups, counts, find box; Settings and the account panel at the bottom of the sheet (account panel folds behind the name, so the menu keeps its room). Top bar gained a search button ("Find a Deal or Lead"). |
| Quick search (C9, D10) | SL-12, N2 | Dialog from the find box, the phone top bar search button or the "/" key (not while typing in a field or with a dialog open). Results grouped Deals / Leads, arrow keys + Enter, Escape closes, polite "N matches" announcement. Matches Deal reference (BX-38412), Bitrix number (38412, also part of it), customer name, contact, trip title and destination; Leads by reference, name and trip; **phone only as the full number** (digits compared; +91 and a leading 0 ignored, so 98290 41736, +91 98290 41736 and 09829041736 all match; 98290 does not). Only records the person may open are listed (`TN.canOpen`): Purchase sees only its Deals, Super Admin sees Leads only, Accounts results open the Accounts view of the Deal. The phone number itself is never shown in results ("Phone number matches"). |
| Tabs everywhere (C5) | CQ-10 | `TN.ui.tabs` has the coss.com look: pill tabs on a grey track, count badge, current tab white with a shadow and bold text (not colour alone) and `aria-current="page"`. Tabs wrap on narrow screens instead of scrolling sideways. Pages that build their own tab markup (some Accounts filters) keep the old underline look until their owner switches to `TN.ui.tabs`. |
| Home (design plan 2.2) | SL-1, SL-19, DM-18 | "What needs you" comes first for every role; the Deal ownership chips and the repeated visible heading are gone. Rows with work waiting come first; each button is named for the count ("Verify 2 receipts", "Open 5 tasks", "Start 2 bookings") and opens the filtered list; rows with nothing waiting have no button and fold into "Nothing waiting in N other lists". The page's one primary button is the top waiting row's button (when nothing waits, the old role action: Go to deals, Open Purchase tasks, …). Department files can name their own button with `TN.homeRow({ …, button: (n) => 'Approve ' + n + ' payments' })`. |

Every role was opened at 1280 px and 390 px (and 640 px, the 200% zoom width): no sideways scroll, no console errors, all 74 menu addresses open for the roles that see them. Keyboard: find box, menu links, group buttons, Settings and the account menu are in order with the live focus ring; the quick search and confirm dialogs trap focus and return it. Reduced motion: no new animation; transitions use the live duration variables that drop to 0 ms; jumps scroll without smoothing under reduced motion.

## 4. Could not do, and why

- **Bell in the header row and "All branches" in the header (design plan 1.1, B1, N6)**: not in the brief's C1 list, so Notices stays a menu link and the header keeps "Jodhpur branch" (every invented person works in one branch).
- **Records** opens Reports for Accounts roles: the prototype has no separate "Documents and money" page with the Daily check.
- **Sales group "Dues" link** for people without the Accounts group (design plan 1.1): not in the brief's C1 list; not added.
- **Group fold animation (180 ms)**: left out on purpose (C11 says no height animation; nothing over 240 ms).
- No new 21st.dev searches: every pattern was in the brief's section 3.

## 5. Open questions (with recommended answer)

1. Deals menu count for Sales and Manager adds "drafts" and "needing a booking". **Recommend** keeping it (it equals the first two Home rows), or drop it if the owner wants counts only on queues.
2. A Sales person sees "Purchase tasks" alone (no Desks heading) under Sales. **Recommend** keeping it: the rule "one link, no heading" applies.
3. Should the Accounts section count include everything on Home for that list (for example Dues adds overdue instalments, transfers to split and trips to close)? **Recommend** yes, so the menu and Home agree; Agent D can narrow it with `TN.setAccCount`.
