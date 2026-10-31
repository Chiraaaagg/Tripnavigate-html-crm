/* =====================================================================
   20-sales.js · Agent B (Sales records)
   Pages: #/app/leads, #/app/leads/:id, #/app/deals, #/app/deals/:id (all tabs).
   Markup copied from the live captures (ws-deal-*, deals-*, p6-lead*,
   b11-submitted-claim-*), class strings unchanged. Pending additions use the
   same parts: dues table (live table), trip status steps (timeline/badge
   parts), change and cancellation requests (cards, drawers, notices),
   Invoices and vouchers rows (Documents list rows).
   Money fences: TN.can('seeSellingPrice' | 'seeCustomerPayments').
   ===================================================================== */
(function () {
  const TN = window.TN;
  const esc = TN.esc;

  /* ---------- Icons (exact lucide markup from the captures) ---------- */
  const ICONS = {
    "chevron-left": ["lucide-chevron-left", "<path d=\"m15 18-6-6 6-6\"></path>"],
    "chevron-right": ["lucide-chevron-right", "<path d=\"m9 18 6-6-6-6\"></path>"],
    "chevron-down": ["lucide-chevron-down", "<path d=\"m6 9 6 6 6-6\"></path>"],
    "check": ["lucide-check", "<path d=\"M20 6 9 17l-5-5\"></path>"],
    "circle-check": ["lucide-circle-check lucide-check-circle-2", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m16 9-5.5 5.5L8 12\"></path>"],
    "circle-dashed": ["lucide-circle-dashed", "<path d=\"M10.1 2.182a10 10 0 0 1 3.8 0\"></path><path d=\"M13.9 21.818a10 10 0 0 1-3.8 0\"></path><path d=\"M17.609 3.721a10 10 0 0 1 2.69 2.7\"></path><path d=\"M2.182 13.9a10 10 0 0 1 0-3.8\"></path><path d=\"M20.279 17.609a10 10 0 0 1-2.7 2.69\"></path><path d=\"M21.818 10.1a10 10 0 0 1 0 3.8\"></path><path d=\"M3.721 6.391a10 10 0 0 1 2.7-2.69\"></path><path d=\"M6.391 20.279a10 10 0 0 1-2.69-2.7\"></path>"],
    "circle-dot": ["lucide-circle-dot", "<circle cx=\"12\" cy=\"12\" r=\"1\"></circle><circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"],
    "circle-x": ["lucide-circle-x lucide-x-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m15 9-6 6\"></path><path d=\"m9 9 6 6\"></path>"],
    "circle-alert": ["lucide-circle-alert lucide-alert-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"></line><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"></line>"],
    "circle-question-mark": ["lucide-circle-question-mark lucide-help-circle lucide-circle-help", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"></path><path d=\"M12 17h.01\"></path>"],
    "circle-play": ["lucide-circle-play lucide-play-circle", "<path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\"></path><circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"],
    "clock": ["lucide-clock", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 6v6l4 2\"></path>"],
    "hourglass": ["lucide-hourglass", "<path d=\"M5 22h14\"></path><path d=\"M5 2h14\"></path><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\"></path><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\"></path>"],
    "pencil-line": ["lucide-pencil-line", "<path d=\"M13 21h8\"></path><path d=\"m15 5 4 4\"></path><path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"></path>"],
    "clipboard-check": ["lucide-clipboard-check", "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"></rect><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"></path><path d=\"m9 14 2 2 4-4\"></path>"],
    "send": ["lucide-send", "<path d=\"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z\"></path><path d=\"m21.854 2.147-10.94 10.939\"></path>"],
    "undo-2": ["lucide-undo-2", "<path d=\"M9 14 4 9l5-5\"></path><path d=\"M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11\"></path>"],
    "truck": ["lucide-truck", "<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"></path><path d=\"M15 18H9\"></path><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"></path><circle cx=\"17\" cy=\"18\" r=\"2\"></circle><circle cx=\"7\" cy=\"18\" r=\"2\"></circle>"],
    "refresh-cw": ["lucide-refresh-cw", "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"></path><path d=\"M21 3v5h-5\"></path><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"></path><path d=\"M8 16H3v5\"></path>"],
    "list-checks": ["lucide-list-checks", "<path d=\"M13 5h8\"></path><path d=\"M13 12h8\"></path><path d=\"M13 19h8\"></path><path d=\"m3 17 2 2 4-4\"></path><path d=\"m3 7 2 2 4-4\"></path>"],
    "user-round": ["lucide-user-round lucide-user-2", "<circle cx=\"12\" cy=\"8\" r=\"5\"></circle><path d=\"M20 21a8 8 0 0 0-16 0\"></path>"],
    "lock": ["lucide-lock", "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path>"],
    "file-text": ["lucide-file-text", "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10 9H8\"></path><path d=\"M16 13H8\"></path><path d=\"M16 17H8\"></path>"],
    "folder-open": ["lucide-folder-open", "<path d=\"m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2\"></path>"],
    "flask-conical": ["lucide-flask-conical", "<path d=\"M14 2v6a2 2 0 0 0 .245.96l5.51 10.08A2 2 0 0 1 18 22H6a2 2 0 0 1-1.755-2.96l5.51-10.08A2 2 0 0 0 10 8V2\"></path><path d=\"M6.453 15h11.094\"></path><path d=\"M8.5 2h7\"></path>"],
    "info": ["lucide-info", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M12 16v-4\"></path><path d=\"M12 8h.01\"></path>"],
    "triangle-alert": ["lucide-triangle-alert lucide-alert-triangle", "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"></path><path d=\"M12 9v4\"></path><path d=\"M12 17h.01\"></path>"],
    "shield-alert": ["lucide-shield-alert", "<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"></path><path d=\"M12 8v4\"></path><path d=\"M12 16h.01\"></path>"],
    "banknote": ["lucide-banknote", "<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"></rect><circle cx=\"12\" cy=\"12\" r=\"2\"></circle><path d=\"M6 12h.01M18 12h.01\"></path>"],
    "receipt": ["lucide-receipt", "<path d=\"M12 17V7\"></path><path d=\"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8\"></path><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\"></path>"],
    "download": ["lucide-download", "<path d=\"M12 15V3\"></path><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"></path><path d=\"m7 10 5 5 5-5\"></path>"],
    "bed-double": ["lucide-bed-double", "<path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\"></path><path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\"></path><path d=\"M12 4v6\"></path><path d=\"M2 18h20\"></path>"],
    "car-front": ["lucide-car-front", "<path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\"></path><path d=\"M7 14h.01\"></path><path d=\"M17 14h.01\"></path><rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\"></rect><path d=\"M5 18v2\"></path><path d=\"M19 18v2\"></path>"],
    "compass": ["lucide-compass", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z\"></path>"],
    "plane": ["lucide-plane", "<path d=\"M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z\"></path>"],
    "stamp": ["lucide-stamp", "<path d=\"M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13\"></path><path d=\"M20 15.5a2.5 2.5 0 0 0-2.5-2.5h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1z\"></path><path d=\"M5 22h14\"></path>"],
    "file-check-corner": ["lucide-file-check-corner lucide-file-check-2", "<path d=\"M10.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v6\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"m14 20 2 2 4-4\"></path>"],
    "file-pen": ["lucide-file-pen lucide-file-edit", "<path d=\"M12.659 22H18a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v9.34\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M10.378 12.622a1 1 0 0 1 3 3.003L8.36 20.637a2 2 0 0 1-.854.506l-2.867.837a.5.5 0 0 1-.62-.62l.836-2.869a2 2 0 0 1 .506-.853z\"></path>"],
    "rotate-ccw-clock": ["lucide-rotate-ccw-clock lucide-history", "<path d=\"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8\"></path><path d=\"M3 3v5h5\"></path><path d=\"M12 7v5l4 2\"></path>"],
    "hand-coins": ["lucide-hand-coins", "<path d=\"M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17\"></path><path d=\"m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9\"></path><path d=\"m2 16 6 6\"></path><circle cx=\"16\" cy=\"9\" r=\"2.9\"></circle><circle cx=\"6\" cy=\"5\" r=\"3\"></circle>"],
    "calendar-clock": ["lucide-calendar-clock", "<path d=\"M16 14v2.2l1.6 1\"></path><path d=\"M16 2v3\"></path><path d=\"M21 7.338V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h2.338\"></path><path d=\"M3 9h5.859\"></path><path d=\"M8 2v3\"></path><circle cx=\"16\" cy=\"16\" r=\"6\"></circle>"],
    "search-x": ["lucide-search-x", "<path d=\"m13.5 8.5-5 5\"></path><path d=\"m8.5 8.5 5 5\"></path><circle cx=\"11\" cy=\"11\" r=\"8\"></circle><path d=\"m21 21-4.3-4.3\"></path>"],
    "hotel": ["lucide-hotel", "<path d=\"M10 22v-6.57\"></path><path d=\"M12 11h.01\"></path><path d=\"M12 7h.01\"></path><path d=\"M14 15.43V22\"></path><path d=\"M15 16a5 5 0 0 0-6 0\"></path><path d=\"M16 11h.01\"></path><path d=\"M16 7h.01\"></path><path d=\"M8 11h.01\"></path><path d=\"M8 7h.01\"></path><rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\"></rect>"],
    "circle-minus": ["lucide-circle-minus lucide-minus-circle", "<circle cx=\"12\" cy=\"12\" r=\"10\"></circle><path d=\"M8 12h8\"></path>"],
    "file-plus-corner": ["lucide-file-plus-corner lucide-file-plus-2", "<path d=\"M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35\"></path><path d=\"M14 2v5a1 1 0 0 0 1 1h5\"></path><path d=\"M14 19h6\"></path><path d=\"M17 16v6\"></path>"],
    "badge-check": ["lucide-badge-check lucide-verified", "<path d=\"M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z\"></path><path d=\"m16 9-5.5 5.5L8 12\"></path>"],
    "map": ["lucide-map", "<path d=\"M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z\"></path><path d=\"M15 5.764v15\"></path><path d=\"M9 3.236v15\"></path>"],
    "briefcase": ["lucide-briefcase", "<path d=\"M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16\"></path><rect width=\"20\" height=\"14\" x=\"2\" y=\"6\" rx=\"2\"></rect>"],
    "tag": ["lucide-tag", "<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"></path><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"></circle>"],
    "building-complex": ["lucide-building-complex lucide-building-2", "<path d=\"M10 12h4\"></path><path d=\"M10 8h4\"></path><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\"></path><path d=\"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2\"></path><path d=\"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16\"></path>"],
    "file-question-mark": ["lucide-file-question-mark lucide-file-question", "<path d=\"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z\"></path><path d=\"M12 17h.01\"></path><path d=\"M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3\"></path>"],
    "inbox": ["lucide-inbox", "<polyline points=\"22 12 16 12 14 15 10 15 8 12 2 12\"></polyline><path d=\"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z\"></path>"],
  };
  function ic(name, extra) {
    const i = ICONS[name];
    if (!i) return TN.ic ? TN.ic(name, extra) : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide ${i[0]}${extra ? ' ' + extra : ''}" aria-hidden="true">${i[1]}</svg>`;
  }

  /* ---------- Live class strings ---------- */
  const FOCUS = 'outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-brand-strong focus-visible:shadow-none';
  const BTN = 'inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-control border font-sans font-semibold no-underline select-none transition-[color,background-color,border-color] duration-(--ui-duration-quick) ease-calm motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:cursor-not-allowed aria-disabled:opacity-55 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ' + FOCUS;
  const VARIANT = {
    primary: 'border-brand-strong bg-brand-strong text-white shadow-button hover:border-brand-deep hover:bg-brand-deep hover:text-white',
    secondary: 'border-line-strong bg-card text-ink shadow-none hover:border-line-strong hover:bg-wash hover:text-ink',
    ghost: 'border-transparent bg-transparent text-copy shadow-none hover:bg-wash hover:text-ink',
    danger: 'border-status-danger bg-status-danger text-white shadow-button hover:border-status-danger-strong hover:bg-status-danger-strong hover:text-white',
  };
  const SIZE = { sm: 'h-8 px-2.5 text-sm', md: 'h-10 px-3.5 text-base' };
  const btnClass = (variant = 'secondary', size = 'md') => `${BTN} ${VARIANT[variant]} ${SIZE[size]}`;
  const TAB = '-mb-px inline-flex min-h-10 items-center gap-2 rounded-t-control border-b-2 border-transparent px-3 py-2 text-base font-medium text-quiet no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none hover:bg-wash hover:text-ink aria-[current=page]:border-brand-strong aria-[current=page]:font-semibold aria-[current=page]:text-brand-deep outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-brand-strong focus-visible:shadow-none focus-visible:-outline-offset-3';
  const LINK = 'rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep ' + FOCUS;
  const LINK_SOFT = 'rounded-chip font-medium text-brand-strong underline underline-offset-4 hover:text-brand-deep ' + FOCUS;
  const ROW_LINK = 'rounded-chip font-semibold whitespace-nowrap text-brand-strong underline-offset-4 hover:text-brand-deep ' + FOCUS;
  const ROW_LINK_WRAP = 'rounded-chip font-semibold wrap-anywhere text-brand-strong underline-offset-4 hover:text-brand-deep ' + FOCUS;
  const BACK = 'inline-flex items-center gap-1 rounded-chip text-sm font-medium text-brand-strong no-underline hover:text-brand-deep hover:underline ' + FOCUS;
  const SUM_ROW = 'grid grid-cols-1 gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[minmax(10rem,40%)_1fr] sm:gap-4';
  const TR = 'border-b border-line last:border-b-0 hover:bg-canvas group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 align-top';
  const TR_HEAD = 'border-b border-line last:border-b-0 group-data-[stack=true]/table:max-sm:block group-data-[stack=true]/table:max-sm:px-4 group-data-[stack=true]/table:max-sm:py-3 hover:bg-transparent';
  const TH = 'border-b border-line bg-canvas px-4.5 py-2.5 text-left align-middle text-xs font-semibold tracking-[0.04em] text-quiet uppercase';
  const TD = 'border-0 bg-transparent px-4.5 py-3 text-left group-data-[stack=true]/table:max-sm:flex group-data-[stack=true]/table:max-sm:justify-between group-data-[stack=true]/table:max-sm:gap-3 group-data-[stack=true]/table:max-sm:px-0 group-data-[stack=true]/table:max-sm:py-1 group-data-[stack=true]/table:max-sm:text-right group-data-[stack=true]/table:max-sm:before:text-left group-data-[stack=true]/table:max-sm:before:text-sm group-data-[stack=true]/table:max-sm:before:font-normal group-data-[stack=true]/table:max-sm:before:text-quiet group-data-[stack=true]/table:max-sm:before:content-[attr(data-label)] group-data-[stack=true]/table:max-sm:first:block group-data-[stack=true]/table:max-sm:first:pb-2 group-data-[stack=true]/table:max-sm:first:text-left group-data-[stack=true]/table:max-sm:first:before:content-none align-top';
  const CHIP_ON = 'inline-flex min-h-9 items-center gap-1.5 rounded-control border px-3 py-1 text-sm font-medium no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none border-brand-strong bg-brand-strong text-white hover:bg-brand-deep hover:text-white ' + FOCUS;
  const CHIP_OFF = 'inline-flex min-h-9 items-center gap-1.5 rounded-control border px-3 py-1 text-sm font-medium no-underline transition-[color,background-color,border-color] duration-(--ui-duration-quick) motion-reduce:transition-none border-line-strong bg-card text-ink hover:bg-wash hover:text-ink ' + FOCUS;
  const CONTROL = 'border border-control bg-card px-3 py-2 font-sans text-lg text-ink sm:text-base m-0 appearance-none shadow-none transition-[border-color] duration-(--ui-duration-quick) motion-reduce:transition-none placeholder:text-faint hover:border-quiet outline-none focus:border-brand-strong focus:outline-2 focus:outline-offset-1 focus:outline-solid focus:outline-brand-strong disabled:cursor-not-allowed disabled:border-line-strong disabled:bg-wash disabled:text-quiet aria-invalid:border-2 aria-invalid:border-status-danger aria-invalid:focus:border-status-danger aria-invalid:focus:outline-status-danger';
  const INPUT = 'block w-full min-h-10 rounded-control ' + CONTROL;
  const TEXTAREA = 'block w-full rounded-control ' + CONTROL + ' min-h-24 resize-y leading-relaxed';
  const CHIP_CHECK = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 font-sans text-sm text-copy has-[:checked]:border-brand-strong has-[:checked]:bg-brand-tint has-[:checked]:font-semibold has-[:checked]:text-brand-deep border-control bg-card hover:border-quiet has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70';
  const CHECKBOX = 'm-0 size-4 min-h-0 shrink-0 cursor-pointer accent-brand-strong ' + FOCUS;

  /* ---------- Small markup helpers (same output as the live components) ---------- */
  const TONE = {
    success: 'border-status-success-line bg-status-success-tint text-status-success',
    warning: 'border-status-warning-line bg-status-warning-tint text-status-warning',
    danger: 'border-status-danger-line bg-status-danger-tint text-status-danger',
    info: 'border-status-info-line bg-status-info-tint text-status-info',
    neutral: 'border-status-neutral-line bg-status-neutral-tint text-status-neutral',
    brand: 'border-brand-line bg-brand-tint text-brand-strong',
  };
  /** StatusBadge: icon + word, never colour alone. wrap = the live wrapping variant. */
  function badge(tone, icon, text, sr, wrap) {
    const base = wrap
      ? `inline-flex max-w-full gap-1.5 border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold [&_svg]:size-3.5 [&_svg]:shrink-0 ${TONE[tone]} items-start rounded-control whitespace-normal [&_svg]:mt-0.75`
      : `inline-flex max-w-full items-center gap-1.5 rounded-full border py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap [&_svg]:size-3.5 [&_svg]:shrink-0 ${TONE[tone]}`;
    return `<span class="${base}" data-slot="status-badge" data-tone="${tone}">${ic(icon)}<span class="${wrap ? 'min-w-0 wrap-anywhere' : 'truncate'}">${sr ? `<span class="sr-only">${esc(sr)} </span>` : ''}${esc(text)}</span></span>`;
  }
  function btn(label, o = {}) {
    const cls = btnClass(o.variant, o.size) + (o.extra ? ' ' + o.extra : '');
    const data = o.act ? ` data-act="${o.act}"` : '';
    const attrs = o.attrs || '';
    const inner = (o.icon ? ic(o.icon) : '') + esc(label) + (o.sr ? `<span class="sr-only"> ${esc(o.sr)}</span>` : '');
    if (o.href) return `<a class="${cls}" href="${o.href}"${data}${attrs}>${inner}</a>`;
    return `<button type="${o.type || 'button'}" class="${cls}" data-slot="button"${data}${attrs}>${inner}</button>`;
  }
  function card(inner, o = {}) {
    return `<div class="rounded-card border border-line bg-card font-sans text-base text-copy shadow-card${o.cls ? ' ' + o.cls : ''}" data-slot="card"${o.role ? ` role="${o.role}"` : ''}${o.id ? ` id="${o.id}"` : ''}>${inner}</div>`;
  }
  function cardHead(id, title, o = {}) {
    const titleHtml = `<h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="${id}">${esc(title)}</h2>`;
    const left = o.desc ? `<div class="min-w-0">${titleHtml}<p class="m-0 text-sm text-quiet">${esc(o.desc)}</p></div>` : titleHtml;
    return `<div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5">${left}${o.aside || ''}</div>`;
  }
  /** Card with a section, header and body (CardBody px-4.5 py-4). */
  function sectionCard(id, title, body, o = {}) {
    return card(`<section aria-labelledby="${id}"${o.sectionId ? ` id="${o.sectionId}"` : ''}>${cardHead(id, title, o)}${o.raw ? body : `<div class="px-4.5 py-4${o.bodyCls ? ' ' + o.bodyCls : ''}">${body}</div>`}</section>`, o);
  }
  function summaryList(rows) {
    return `<dl class="m-0 flex flex-col divide-y divide-line font-sans" data-slot="summary-list">${rows.filter(Boolean).map((r) => {
      const [label, value, opt = {}] = r;
      return `<div class="${SUM_ROW}${opt.total ? ' border-t-2 border-line-strong' : ''}"><dt class="text-sm ${opt.total ? 'font-semibold text-ink' : 'font-medium text-quiet'}">${esc(label)}</dt><dd class="m-0 wrap-break-word text-ink${opt.numeric ? ' tabular-nums sm:text-right' : ''}${opt.total ? ' text-lg font-semibold' : ''}">${value}</dd></div>`;
    }).join('')}</dl>`;
  }
  const NOTICE = {
    info: ['info', 'border-status-info-line bg-status-info-tint', 'text-status-info'],
    warning: ['triangle-alert', 'border-status-warning-line bg-status-warning-tint', 'text-status-warning'],
    danger: ['circle-x', 'border-status-danger-line bg-status-danger-tint', 'text-status-danger'],
    success: ['circle-check', 'border-status-success-line bg-status-success-tint', 'text-status-success'],
    restricted: ['shield-alert', 'border-brand-line bg-brand-tint', 'text-brand-strong'],
    locked: ['lock', 'border-line bg-wash', 'text-quiet'],
  };
  function notice(tone, bodyHtml, o = {}) {
    const [defIcon, box, iconCls] = NOTICE[tone];
    return `<div role="${o.role || 'note'}" class="flex gap-2.5 rounded-control border px-3.5 py-3 font-sans text-base text-copy ${box}" data-slot="notice" data-tone="${tone}"${o.id ? ` id="${o.id}"` : ''}>${ic(o.icon || defIcon, 'mt-0.5 size-4 shrink-0 ' + iconCls)}<div class="min-w-0 flex-1">${o.title ? `<p class="m-0 font-semibold text-ink">${esc(o.title)}</p>` : ''}${bodyHtml ? `<div class="flex flex-col gap-1.5 [&_p]:m-0${o.title ? ' mt-0.75' : ''}">${bodyHtml}</div>` : ''}</div></div>`;
  }
  function emptyState(icon, title, desc, action, level = 2) {
    return `<div class="flex flex-col items-center px-6 py-10 text-center font-sans" data-slot="empty-state"><span class="mb-3 grid size-11 place-items-center rounded-card bg-brand-tint text-brand">${ic(icon, 'size-5')}</span><h${level} class="m-0 text-lg leading-6 font-semibold text-ink">${esc(title)}</h${level}><p class="m-0 mt-1.5 max-w-[42ch] text-base text-quiet">${esc(desc)}</p>${action ? `<div class="mt-4">${action}</div>` : ''}</div>`;
  }
  const amount = (v) => `<span class="font-semibold whitespace-nowrap tabular-nums">${v}</span>`;
  /** Live Deal page money is shown in rupees and paise (formatPaise). */
  const rs = (n) => (n == null ? '—' : TN.fmt.inr(n) + '.00');
  const notEntered = (t = 'Not entered yet') => `<span class="font-normal text-quiet italic">${esc(t)}</span>`;
  const subHeading = (id, t) => `<h3 id="${id}" class="m-0 text-base font-semibold text-ink">${esc(t)}</h3>`;
  const quietNote = (icon, text, iconCls = 'text-faint') => `<p class="m-0 flex gap-2 text-sm text-quiet">${ic(icon, 'mt-0.5 size-3.5 shrink-0 ' + iconCls)}<span>${text}</span></p>`;
  const bitrixName = (name) => `<span class="inline-flex max-w-full items-start gap-1.5 text-ink">${ic('tag', 'mt-1.5 size-3.5 shrink-0 text-faint')}<span class="min-w-0 wrap-break-word">${esc(name)}</span></span>`;
  const liveIndicator = '<p class="live-indicator live" role="status" aria-live="polite"><span aria-hidden="true" class="status-glyph">●</span>Live updates on</p>';
  const freshness = (text) => `<p class="m-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-quiet" data-slot="freshness">${ic('refresh-cw', 'size-3.5 shrink-0 text-faint')}<span>${esc(text)}</span></p>`;
  const backLink = (href, text) => `<p class="m-0 mb-3"><a class="${BACK}" href="${href}">${ic('chevron-left', 'size-4')}${esc(text)}</a></p>`;
  function tabsNav(label, items) {
    return `<nav aria-label="${esc(label)}" class="font-sans mb-4" data-slot="tabs"><ul class="m-0 flex list-none flex-wrap gap-1 border-b border-line p-0 sm:flex-nowrap sm:overflow-x-auto">${items.map((t) => `<li class="m-0 shrink-0"><a${t.current ? ' aria-current="page"' : ''} class="${TAB}" href="${t.href}">${esc(t.label)}</a></li>`).join('')}</ul></nav>`;
  }
  function rowDetails(ref, pairs) {
    return `<details class="group/details max-w-80 text-sm" data-slot="row-details"><summary class="inline-flex min-h-8 cursor-pointer list-none items-center rounded-chip px-1 font-medium text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep [&::-webkit-details-marker]:hidden ${FOCUS}">Details<span class="sr-only"> for ${esc(ref)}</span></summary><div class="mt-2.5 rounded-control border border-line bg-canvas px-3 py-2.5 text-left text-copy"><dl class="m-0 flex flex-col gap-1.5">${pairs.map(([k, v]) => `<div class="flex flex-col"><dt class="text-xs font-semibold text-quiet">${esc(k)}</dt><dd class="m-0 wrap-anywhere text-copy">${esc(v)}</dd></div>`).join('')}</dl></div></details>`;
  }
  function chips(label, items) {
    return `<nav aria-label="${esc(label)}"><ul class="m-0 flex list-none flex-wrap gap-2 p-0">${items.map((c) => `<li class="m-0"><a${c.on ? ' aria-current="page"' : ''} class="${c.on ? CHIP_ON : CHIP_OFF}" href="${c.href}">${c.on ? ic('check', 'size-3.5 shrink-0') : ''}<span>${esc(c.label)}${c.sr ? `<span class="sr-only">${esc(c.sr)}</span>` : ''}</span><span class="font-semibold tabular-nums ${c.on ? 'text-white' : 'text-brand-strong'}">(${c.count})</span></a></li>`).join('')}</ul></nav>`;
  }
  function tableCard(label, id, caption, heads, rowsHtml, pager) {
    return card(`<div class="group/table relative w-full overflow-x-auto ${FOCUS} rounded-card" data-stack="true" role="region" aria-label="${esc(label)}" tabindex="0"><table role="table" class="w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block" id="${id}"><caption class="px-4.5 py-2 text-left text-sm font-normal text-quiet caption-bottom sr-only">${esc(caption)}</caption><thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${TR_HEAD}">${heads.map((h) => `<th scope="col" role="columnheader" class="${TH}">${h}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${rowsHtml}</tbody></table></div>${pager || ''}`);
  }
  const td = (label, html, extra) => `<td role="cell" data-label="${esc(label)}" class="${TD}${extra ? ' ' + extra : ''}">${html}</td>`;
  const pagerNav = (label, text) => `<nav aria-label="${esc(label)}" class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 py-3 font-sans" data-slot="list-pager"><span aria-hidden="true"></span><span class="text-sm text-quiet tabular-nums">${esc(text)}</span><span aria-hidden="true"></span></nav>`;
  function timeline(label, events) {
    return `<ol aria-label="${esc(label)}, newest first" class="m-0 flex list-none flex-col p-0 font-sans" data-slot="timeline">${events.map((e, i) => `<li class="relative m-0 flex gap-3 pb-4 last:pb-0">${i < events.length - 1 ? '<span aria-hidden="true" class="absolute top-6 bottom-0 left-2.25 w-px bg-line-strong"></span>' : ''}${ic(e.icon, 'relative mt-0.5 size-4.5 shrink-0 bg-card text-status-success')}<div class="min-w-0 flex-1"><p class="m-0 text-base text-ink">${e.title}</p><p class="m-0 text-sm text-quiet">${esc(e.when)}</p>${e.note ? `<div class="mt-0.75 text-sm text-copy">${e.note}</div>` : ''}</div></li>`).join('')}</ol>`;
  }

  /* ---------- Form parts (live Field / Input / Select / Textarea / ErrorSummary) ---------- */
  function fieldErr(msg) { return msg ? `<p class="m-0 flex items-start gap-1.5 font-sans text-sm font-medium text-status-danger" id="%ID%-error">${ic('circle-alert', 'lucide-alert-circle mt-0.5 size-3.5 shrink-0')}${esc(msg)}</p>` : ''; }
  function field(id, label, control, o = {}) {
    const err = o.error ? fieldErr(o.error).replace('%ID%', id) : '';
    return `<div class="flex flex-col gap-1.5${o.span ? ' sm:col-span-2' : ''}" data-slot="field"><label class="block font-sans text-base font-semibold text-ink" for="${id}">${esc(label)}${o.optional ? '<span class="font-normal text-quiet"> (optional)</span>' : ''}</label>${control}${o.hint ? `<p class="m-0 font-sans text-sm text-quiet" id="${id}-hint">${esc(o.hint)}</p>` : ''}${err}</div>`;
  }
  const described = (id, o) => { const d = [o.hint ? id + '-hint' : '', o.error ? id + '-error' : ''].filter(Boolean).join(' '); return d ? ` aria-describedby="${d}"` : ''; };
  function inputF(id, name, label, value, o = {}) {
    const ctl = `<input type="${o.type || 'text'}" class="${INPUT}${o.money ? ' pl-7 tabular-nums' : ''}" data-slot="input" id="${id}" name="${name}" value="${esc(value ?? '')}" autocomplete="off"${o.inputmode ? ` inputmode="${o.inputmode}"` : ''}${o.max ? ` maxlength="${o.max}"` : ''}${o.error ? ' aria-invalid="true"' : ''}${described(id, o)}>`;
    const wrapped = o.money ? `<div class="relative" data-slot="money-input"><span aria-hidden="true" class="pointer-events-none absolute inset-y-0 left-3 flex items-center font-sans text-base text-quiet">₹</span>${ctl}</div>` : ctl;
    return field(id, label, wrapped, o);
  }
  function selectF(id, name, label, value, options, o = {}) {
    const ctl = `<div class="relative" data-slot="select"><select class="${INPUT} cursor-pointer pr-9" id="${id}" name="${name}"${o.error ? ' aria-invalid="true"' : ''}${described(id, o)}>${options.map(([v, t]) => `<option value="${esc(v)}"${String(v) === String(value ?? '') ? ' selected' : ''}>${esc(t)}</option>`).join('')}</select>${ic('chevron-down', 'pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-quiet')}</div>`;
    return field(id, label, ctl, o);
  }
  function textareaF(id, name, label, value, o = {}) {
    const ctl = `<textarea rows="${o.rows || 3}" class="${TEXTAREA}" data-slot="textarea" id="${id}" name="${name}" maxlength="${o.max || 500}"${o.error ? ' aria-invalid="true"' : ''}${described(id, o)}>${esc(value ?? '')}</textarea>`;
    return field(id, label, ctl, o);
  }
  function fieldset(legend, inner) {
    return `<fieldset class="m-0 min-w-0 rounded-card border border-line bg-card px-4 pt-1 pb-4 font-sans" data-slot="fieldset"><legend class="px-1 text-base font-semibold text-ink">${esc(legend)}</legend>${inner}</fieldset>`;
  }
  /** Live ErrorSummary; the links focus the field (no hash navigation). */
  function errorSummary(title, errors) {
    return `<div role="alert" tabindex="-1" class="flex gap-2.5 rounded-control border-2 border-status-danger-line bg-status-danger-tint px-3.5 py-3 font-sans text-base text-copy outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-status-danger" data-slot="error-summary">${ic('circle-alert', 'lucide-alert-circle mt-0.5 size-4.5 shrink-0 text-status-danger')}<div class="min-w-0 flex-1"><p class="m-0 font-semibold text-ink">${esc(title)}</p><p class="m-0 mt-0.75">Check the fields marked below. What you typed is still here.</p>${errors.length ? `<ul class="m-0 mt-1.5 flex list-disc flex-col gap-1 pl-5">${errors.map(([id, t]) => `<li><a href="#${id}" data-act="sales-focus" data-target="${id}" class="rounded-chip font-medium text-status-danger underline underline-offset-4 hover:text-status-danger-strong ${FOCUS}">${esc(t)}</a></li>`).join('')}</ul>` : ''}</div></div>`;
  }
  TN.act('sales-focus', (el) => { const t = document.getElementById(el.dataset.target); if (t) t.focus(); });
  function openDrawer(o) {
    TN.drawer(o);
    const s = document.querySelector('#tn-overlay [data-slot="error-summary"]');
    if (s) s.focus();
  }
  const formVals = (f) => Object.fromEntries(new FormData(f).entries());
  const nowStamp = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const pushNotice = (to, text, deal, href) => TN.DATA.notices.unshift({ id: 'n-s' + Date.now(), to, kind: 'notice', text, deal, href, at: nowStamp() });
  const toNum = (v) => { const n = Number(String(v ?? '').replace(/[₹,\s]/g, '')); return Number.isFinite(n) ? n : NaN; };

  /* =====================================================================
     Data added at load (own fields only; shared records are not rewritten)
     ===================================================================== */
  const D = TN.DATA;
  // Leads that became the Deals above (Bitrix converts the Lead into the Deal).
  const CONVERTED = [
    ['L-60512', 'BX-38198', 'Shimla Manali family trip, November', 'Harish Tak', 'sales2', '2026-10-01', 'Walk-in'],
    ['L-60588', 'BX-38264', 'Rishikesh Mussoorie group, October', 'Rajesh Soni', 'sales2', '2026-09-22', 'Referral'],
    ['L-60641', 'BX-38301', 'Singapore 4N couple', 'Nidhi Mathur', 'sales', '2026-09-27', 'Instagram'],
    ['L-60702', 'BX-38377', 'Kashmir friends trip, November', 'Deepak Purohit', 'sales2', '2026-10-03', 'Facebook'],
    ['L-60755', 'BX-38390', 'Dubai family 5N', 'Suresh Bhandari', 'sales', '2026-10-08', 'Referral'],
    ['L-60811', 'BX-38412', 'Goa family holiday 4N', 'Rohan Agarwal', 'sales', '2026-10-13', 'Instagram'],
    ['L-60846', 'BX-38455', 'Kerala honeymoon, December', 'Meenal Khatri', 'sales', '2026-10-17', 'Google'],
    ['L-60890', 'BX-38520', 'Udaipur 2N couple', 'Pooja Vyas', 'sales', '2026-10-19', 'Phone'],
    ['L-60917', 'BX-38533', 'Thailand Phuket Krabi', 'Kunal Choudhary', 'sales', '2026-10-20', 'Website chat'],
    ['L-60934', 'BX-38547', 'Company offsite, Jaisalmer', 'Marudhar Agro Foods Pvt Ltd', 'sales', '2026-10-15', 'Phone'],
    ['L-60968', 'BX-38560', 'Bali honeymoon, January', 'Sneha Rathi', 'sales', '2026-10-21', 'Instagram'],
    ['L-60991', 'BX-38571', 'Jaipur weekend with kids', 'Prakash Bishnoi', 'sales', '2026-10-24', 'Walk-in'],
  ];
  CONVERTED.forEach(([id, deal, title, name, owner, created, source]) => {
    if (!D.leads.some((l) => l.id === id)) D.leads.push({ id, title, name, status: 'Converted', source, owner, created, deal });
  });
  const LEAD_OF = Object.fromEntries(CONVERTED.map((c) => [c[1], c[0]]));
  const STATUS_CODE = { New: 'NEW', 'In progress': 'IN_PROCESS', 'Quotation sent': 'UC_QUOTE', 'Follow-up': 'UC_FOLLOW', Lost: 'JUNK', Converted: 'CONVERTED' };
  const SOURCE_CODE = { Instagram: 'UC_INSTA', 'Walk-in': 'UC_WALKIN', 'Website chat': 'UC_CHAT', Referral: 'RECOMMENDATION', Facebook: 'UC_FB', Phone: 'CALL', Google: 'UC_GOOGLE' };
  const leadRef = (l) => 'BXL-' + l.id.replace(/^L-/, '');
  const leadTitle = (l) => `${l.name} · ${l.title}`;
  const leadTime = (l) => { const n = Number(l.id.slice(-2)); return `${l.created} ${String(9 + (n % 9)).padStart(2, '0')}:${String((n * 7) % 60).padStart(2, '0')}`; };

  const dealCreated = (d) => { const l = D.leads.find((x) => x.id === LEAD_OF[d.id]); return l ? l.created : '2026-10-01'; };
  const BITRIX_STAGE_CODE = 'C1:WON';
  const lastChecked = '2026-10-27 10:42';
  const lastChange = (d) => (d.submittedAt ? d.submittedAt + ' 16:05' : '2026-10-26 18:20');

  /* ---------- People and relations ---------- */
  const me = () => TN.me();
  const isMe = (key) => key && key === me().key;
  const who = (key) => (isMe(key) ? 'You' : key ? TN.person(key).name : '');
  const DEPT_OF_ROLE = { purchase: 'purchase', flight: 'flight', visa: 'visa' };
  const fullServices = (d) => TN.servicesOf(d.id);
  /** owner | assigned | scope | null (not visible). Accounts and Super Admin: live Deals list shows none. */
  function relation(d, forList) {
    const r = TN.role;
    if (r === 'sales') return d.owner === me().key ? 'owner' : null;
    if (r === 'manager') return 'scope';
    if (DEPT_OF_ROLE[r]) return fullServices(d).some((s) => s.assignee === r) ? 'assigned' : null;
    if (r === 'accounts' || r === 'checker') return forList ? null : 'scope';
    return null;
  }
  const SEEN = { owner: 'You own this deal.', assigned: 'You are assigned to this deal.', scope: 'Your role or an access grant covers this deal’s branch or company.' };
  const visibleDeals = () => D.deals.filter((d) => relation(d, true));
  const canEditBooking = (d) => TN.can('bookNow') && (TN.is('manager') || d.owner === me().key);

  /* ---------- Booking state words (modules/deals/workspace.ts) ---------- */
  const STATE = {
    not_started: ['Not started', 'neutral', 'circle-dashed'],
    quotation_accepted: ['Quotation accepted', 'brand', 'file-check-corner'],
    in_progress: ['Booking in progress', 'info', 'pencil-line'],
    ready_to_submit: ['Ready to submit', 'info', 'clipboard-check'],
    waiting_for_accounts: ['Waiting for Accounts', 'neutral', 'send'],
    returned: ['Returned by Accounts', 'warning', 'undo-2'],
    being_arranged: ['Being arranged', 'info', 'truck'],
    all_confirmed: ['All services confirmed', 'success', 'circle-check'],
    lost: ['Lost in Bitrix', 'danger', 'circle-x'],
  };
  const TASK_WORD = { new: ['Waiting to be taken', 'neutral', 'hourglass'], in_progress: ['In progress', 'info', 'pencil-line'], supplier_confirmed: ['Confirmed by supplier', 'success', 'circle-check'], done: ['Completed', 'success', 'circle-check'] };
  const RANK = { new: 0, in_progress: 1, supplier_confirmed: 2, done: 2, cancelled: 9 };
  const isDone = (s) => s.taskStatus === 'supplier_confirmed' || s.taskStatus === 'done';
  const submitted = (d) => ['waiting_for_accounts', 'returned', 'being_arranged', 'all_confirmed'].includes(d.bookingState);
  const booked = (d) => ['being_arranged', 'all_confirmed'].includes(d.bookingState);

  /** Trip status (pending, brief §5.7): Booked when every service is confirmed, Travelled the day after the trip ends, Closed by Accounts. */
  function tripStatus(d) {
    if (d.tripStatus === 'closed') return 'closed';
    const svcs = fullServices(d).filter((s) => s.taskStatus !== 'cancelled');
    if (d.bookingState !== 'all_confirmed' || !svcs.length || !svcs.every(isDone)) return null;
    return TN.fmt.daysFrom(d.end) < 0 ? 'travelled' : 'booked';
  }
  const addDays = (iso, n) => { const t = new Date(Date.parse(iso + 'T00:00:00Z') + n * 86400000); return t.toISOString().slice(0, 10); };

  /* ---------- Money derived per Deal (only read where TN.can allows) ---------- */
  const instOf = (id) => D.instalments.filter((i) => i.deal === id);
  const receiptsOf = (id) => D.receipts.filter((r) => r.deal === id);
  const verifiedSum = (id) => receiptsOf(id).filter((r) => r.status === 'verified').reduce((a, r) => a + r.amount, 0);
  const overdueOf = (id) => instOf(id).filter((i) => i.status === 'overdue');

  /* =====================================================================
     LEADS  (#/app/leads, #/app/leads/:id) · live, Bitrix owns them
     ===================================================================== */
  function leadVisible(l) {
    if (TN.is('manager')) return 'branch_manager';
    if (TN.is('admin')) return 'integration_admin';
    if (TN.is('sales')) return l.owner === me().key ? 'owner' : null;
    return null;
  }
  const LEAD_SEEN = { owner: 'you own it', branch_manager: 'you manage this branch', integration_admin: 'you manage the Bitrix connection' };
  const ownerCell = (key) => (key ? `<span class="wrap-break-word">${esc(who(key))}</span>` : badge('warning', 'hourglass', 'Waiting for owner'));

  TN.page('/app/leads', {
    nav: '/app/leads', roles: ['sales', 'manager', 'admin'], title: 'Leads',
    render(_, q) {
      const all = D.leads.filter(leadVisible).sort((a, b) => b.id.localeCompare(a.id));
      const mine = all.filter((l) => l.owner === me().key);
      const filter = q.filter === 'mine' ? 'mine' : 'all';
      const rows = filter === 'mine' ? mine : all;
      const head = `<header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">Leads</h1><p class="m-0 mt-1.5 text-base text-quiet">Leads from Bitrix. Follow them up in Bitrix; make quotations here.</p><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${freshness('Bitrix data updated 12 minutes ago.')}</div></div></header>`;
      const filters = `<div class="mb-4 flex flex-col gap-4"><div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans" data-slot="filter-chips">${chips('Filter leads', [
        { label: 'All leads you can see', count: all.length, href: '#/app/leads', on: filter === 'all' },
        { label: 'Mine', count: mine.length, href: '#/app/leads?filter=mine', on: filter === 'mine' },
      ])}<p class="m-0 text-xs text-quiet">Counts include all pages.</p></div></div>`;
      let body;
      if (!rows.length) {
        body = card(emptyState('inbox', 'Nothing matches this filter', 'No lead you own is in the CRM yet.', btn('Clear filters', { href: '#/app/leads' })), { role: 'status' });
      } else {
        const tr = rows.map((l) => {
          const rel = leadVisible(l);
          return `<tr role="row" class="${TR}" data-search="${esc((leadRef(l) + ' ' + leadTitle(l)).toLowerCase())}">${
            td('Customer and trip', `<a class="${ROW_LINK_WRAP}" data-slot="row-link" href="#/app/leads/${l.id}">${esc(leadTitle(l))}</a><span class="block text-sm text-quiet">${leadRef(l)}</span>`)}${
            td('Status', bitrixName(l.status === 'Converted' ? 'Converted to deal' : l.status))}${
            td('Source', bitrixName(l.source))}${
            td('Owner', ownerCell(l.owner))}${
            td('Branch', 'Jodhpur')}${
            td('Created', TN.fmt.date(l.created), 'whitespace-nowrap')}${
            td('', rowDetails(leadRef(l), [['Bitrix lead', '#' + l.id.slice(2)], ['Status', `Bitrix code: ${STATUS_CODE[l.status] || 'NEW'}.`], ['Source', `Bitrix code: ${SOURCE_CODE[l.source] || 'OTHER'}.`], ['Created in Bitrix', TN.fmt.dateTime(leadTime(l))], ['Last checked with Bitrix', TN.fmt.dateTime(lastChecked)], ['Why you see it', `You see this lead because ${LEAD_SEEN[rel]}.`]]))}</tr>`;
        }).join('');
        const range = `1–${rows.length} of ${rows.length} leads`;
        body = tableCard('Leads table', 'leads-table', range, ['Customer and trip', 'Status', 'Source', 'Owner', 'Branch', 'Created', '<span class="sr-only">Details</span>'], tr, pagerNav('Lead pages', range));
      }
      return `<div class="font-sans text-base text-copy">${head}${filters}${body}<p class="m-0 mt-3 text-sm text-quiet">Sorted by Bitrix lead number, newest first.</p></div>`;
    },
  });

  const quotationsFor = (kind, id) => {
    const list = Array.isArray(D.quotations) ? D.quotations : Object.values(D.quotations || {});
    return list.filter((q) => (kind === 'lead' ? q.lead === id : q.deal === id));
  };
  function quotationRows(list, fallback) {
    const rows = list.length ? list.map((q) => ({ id: q.id, ref: q.reference || q.id, title: q.title || '', version: q.version || 1, valid: q.validUntil || q.valid, status: q.status })) : fallback;
    if (!rows.length) return '<p class="m-0 text-quiet">No quotation on this record yet.</p>';
    const look = (s) => (/accept/i.test(s || '') ? ['success', 'circle-check', 'Accepted by customer'] : /draft/i.test(s || '') ? ['neutral', 'clock', 'Draft'] : ['info', 'info', 'Shared with customer']);
    return `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Quotations of this record">${rows.map((q) => {
      const [tone, icon, word] = look(q.status);
      return `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-3">${ic('file-text', 'size-4 shrink-0 text-brand-strong')}<span class="min-w-40 flex-1"><a class="rounded-chip text-brand-strong underline underline-offset-4 hover:text-brand-deep ${FOCUS} font-semibold" href="#/app/quotations/${esc(q.id)}">${esc(q.ref)}${q.title ? ' · ' + esc(q.title) : ''}</a><span class="block text-sm text-quiet">Version ${esc(q.version)}${q.valid ? ' · Valid until ' + TN.fmt.date(q.valid) : ''}</span></span>${badge(tone, icon, word, 'Quotation status:', true)}</li>`;
    }).join('')}</ul>`;
  }
  function createQuotationForm(kind, id, title) {
    return `<div class="flex flex-wrap items-center gap-3"><form novalidate class="flex w-full flex-col gap-3" data-act="sales-new-quotation" data-kind="${kind}" data-id="${esc(id)}"><div role="status" aria-live="polite"></div>${inputF(`quote-create-title`, 'title', 'Quotation title', title, { hint: 'Shown at the top of the quotation. You cannot change it later.', max: 200 })}<div>${btn('Create quotation', { type: 'submit' })}</div></form></div>`;
  }
  TN.act('sales-new-quotation', (f) => {
    const v = formVals(f);
    if (!String(v.title || '').trim()) { TN.toast('Add a quotation title first.', 'danger'); return; }
    TN.go(`/app/quotations/new?${f.dataset.kind}=${encodeURIComponent(f.dataset.id)}&title=${encodeURIComponent(v.title.trim())}`);
  });

  TN.page('/app/leads/:id', {
    nav: '/app/leads', roles: ['sales', 'manager', 'admin'], title: (p) => p.id.replace(/^L-/, 'BXL-'),
    canOpen: (p) => { const l = D.leads.find((x) => x.id === p.id); return !!(l && leadVisible(l)); },
    render(p, q) {
      const l = D.leads.find((x) => x.id === p.id);
      const rel = l && leadVisible(l);
      if (!l || !rel) {
        return `<div class="font-sans text-base text-copy"><header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">Lead not available</h1></div></header>${card(`<div class="flex items-start gap-3 px-4.5 py-4"><span aria-hidden="true" class="grid size-9 shrink-0 place-items-center rounded-control bg-brand-tint text-brand">${ic('file-question-mark', 'size-4.5')}</span><p class="m-0 self-center text-copy">This lead does not exist, or it is not visible to you.</p></div>`, { role: 'status' })}<p class="m-0 mt-4">${btn('Back to leads', { href: '#/app/leads', icon: 'chevron-left' })}</p></div>`;
      }
      const quotesOk = TN.can('seeQuotations');
      const tabsAll = [['overview', 'Overview'], ...(quotesOk ? [['quotations', 'Quotations']] : []), ['bitrix', 'Bitrix details']];
      const tab = tabsAll.some((t) => t[0] === q.tab) ? q.tab : 'overview';
      const canQuote = quotesOk && (l.owner === me().key || TN.is('manager')) && l.status !== 'Converted' && l.status !== 'Lost';
      const statusText = l.status === 'Converted' ? 'Converted to deal' : l.status;
      const next = l.status === 'Converted' ? `work on deal <a class="${LINK}" href="#/app/deals/${l.deal}">${l.deal}</a>` : l.status === 'Lost' ? 'nothing while the lead is lost in Bitrix' : 'follow up in Bitrix';
      const head = `${backLink('#/app/leads', 'Back to leads')}<header class="flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between mb-3" data-slot="page-header"><div class="min-w-0"><p class="m-0 mb-1 text-sm font-medium text-quiet">${leadRef(l)}</p><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl"><span class="block wrap-anywhere">${esc(leadTitle(l))}</span></h1><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${bitrixName(statusText)}${l.owner ? `<span class="inline-flex max-w-full min-w-0 items-center gap-1.5 wrap-break-word text-copy">${ic('user-round', 'lucide-user-2 size-4 shrink-0 text-faint')}<span class="min-w-0">Owner: <span class="font-semibold text-ink">${esc(who(l.owner))}</span></span></span>` : badge('warning', 'hourglass', 'Waiting for owner')}<span class="inline-flex items-center gap-1.5 text-copy">${ic('building-complex', 'lucide-building-2 size-4 shrink-0 text-faint')}Jodhpur</span></div></div>${canQuote ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&>*]:flex-1"><a class="${btnClass('primary')}" data-slot="lead-primary" href="#/app/leads/${l.id}?tab=quotations">${ic('file-plus-corner', 'lucide-file-plus-2')}New quotation</a></div>` : ''}</header><div class="mb-4 flex flex-col gap-2"><p class="m-0 text-copy"><span class="font-semibold text-ink">Next:</span> ${next}${l.owner && l.status !== 'Converted' ? `<span class="text-quiet"> · ${esc(who(l.owner))}</span>` : ''}</p></div>`;
      const tabs = tabsNav('Lead sections', tabsAll.map(([k, label]) => ({ label, href: `#/app/leads/${l.id}${k === 'overview' ? '' : '?tab=' + k}`, current: k === tab })));
      let body;
      if (tab === 'bitrix') {
        body = sectionCard('lead-bitrix-heading', 'Bitrix details', summaryList([
          ['Bitrix lead', '#' + l.id.slice(2)],
          ['Status', `${bitrixName(statusText)}<span class="block text-sm text-quiet">Bitrix code: ${STATUS_CODE[l.status] || 'NEW'}.</span>`],
          ['Source', `${bitrixName(l.source)}<span class="block text-sm text-quiet">Bitrix code: ${SOURCE_CODE[l.source] || 'OTHER'}.</span><span class="block text-sm text-quiet">Source is the label staff set in Bitrix. It does not prove which form the customer used.</span>`],
          ['Created in Bitrix', TN.fmt.dateTime(leadTime(l))],
          ['Last checked with Bitrix', TN.fmt.dateTime(lastChecked)],
          ['Last change received from Bitrix', TN.fmt.dateTime('2026-10-27 10:18')],
          ['Why you see it', `You see this lead because ${LEAD_SEEN[rel]}.`],
        ]) + quietNote('lock', 'Title, status, source and owner come from Bitrix. Change them in Bitrix.'), { bodyCls: 'flex flex-col gap-4' });
      } else if (tab === 'quotations') {
        body = sectionCard('quotations-heading', 'Quotations', quotationRows(quotationsFor('lead', l.id), l.status === 'Quotation sent' ? [{ id: 'Q-' + l.id.slice(2), ref: 'Q-2610-' + l.id.slice(-3), title: l.title, version: 1, valid: '2026-11-10', status: 'shared' }] : []) + (canQuote ? createQuotationForm('lead', l.id, leadTitle(l)) : ''), { bodyCls: 'flex flex-col gap-4' });
      } else {
        body = sectionCard('lead-overview-heading', 'Overview', summaryList([
          ['Source', bitrixName(l.source)],
          ['Created in Bitrix', TN.fmt.dateTime(leadTime(l))],
          ['Branch', 'Jodhpur'],
          ['Owner', ownerCell(l.owner)],
        ]));
      }
      return `<div class="font-sans text-base text-copy">${head}${tabs}${body}</div>`;
    },
  });

  /* =====================================================================
     DEALS LIST  (#/app/deals) · live (DL-01..DL-05), every role
     ===================================================================== */
  const DEAL_FILTERS = {
    overdue: ['Customer payment overdue', (d) => TN.can('seeCustomerPayments') && overdueOf(d.id).length > 0],
    returned: ['Returned by Accounts', (d) => d.bookingState === 'returned'],
    changes: ['Change waiting for the customer', (d) => D.changes.some((c) => c.deal === d.id && c.status === 'waiting_customer')],
  };
  TN.page('/app/deals', {
    nav: '/app/deals', title: 'Deals',
    render(_, q) {
      const all = visibleDeals();
      const owned = all.filter((d) => relation(d, true) === 'owner');
      const assigned = all.filter((d) => relation(d, true) === 'assigned');
      const extra = DEAL_FILTERS[q.filter];
      const filter = extra ? q.filter : ['owned', 'assigned'].includes(q.filter) ? q.filter : 'all';
      let rows = filter === 'owned' ? owned : filter === 'assigned' ? assigned : extra ? all.filter(extra[1]) : all;
      const asc = q.sort === 'id_asc';
      rows = [...rows].sort((a, b) => (asc ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)));
      const head = `<header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">Deals</h1><p class="m-0 mt-1.5 text-base text-quiet">Deals from Bitrix that you can open.</p><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${freshness('Bitrix data updated 12 minutes ago.')}<span class="[&_.live-indicator]:m-0">${liveIndicator}</span></div></div></header>`;
      const chipItems = [
        { label: 'All deals you can see', count: all.length, href: '#/app/deals', on: filter === 'all' },
        { label: 'Owned by you', count: owned.length, href: '#/app/deals?filter=owned', on: filter === 'owned' },
        { label: 'Assigned to you', sr: ', owned by someone else', count: assigned.length, href: '#/app/deals?filter=assigned', on: filter === 'assigned' },
      ];
      // Home "What needs you" links open the list with one of these filters; the chip shows while it is on.
      if (extra) chipItems.push({ label: extra[0], count: rows.length, href: `#/app/deals?filter=${filter}`, on: true });
      const sortQs = (s) => `#/app/deals?${filter !== 'all' ? 'filter=' + filter + '&' : ''}${s ? 'sort=' + s : ''}`.replace(/[?&]$/, '');
      const order = `<div class="flex flex-wrap items-end justify-between gap-3"><div role="group" aria-label="Order of deals" class="flex flex-wrap items-center gap-2"><span class="text-sm text-quiet">Order:</span><span class="inline-flex gap-0.5 rounded-control border border-line bg-wash p-0.5">${[['', 'Newest first'], ['id_asc', 'Oldest first']].map(([s, t]) => ((asc ? s === 'id_asc' : s === '') ? `<strong aria-current="true" class="inline-flex items-center gap-1.5 rounded-chip bg-card px-2.5 py-1 text-sm font-semibold text-ink shadow-button">${ic('check', 'size-3.5 text-brand-strong')}${t}</strong>` : `<a class="inline-flex items-center rounded-chip px-2.5 py-1 text-sm font-medium text-brand-strong no-underline hover:bg-card hover:text-brand-deep ${FOCUS}" href="${sortQs(s)}">${t}</a>`)).join('')}</span></div></div>`;
      const filters = `<div class="mb-4 flex flex-col gap-4"><div class="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-sans" data-slot="filter-chips">${chips('Filter deals', chipItems)}<p class="m-0 text-xs text-quiet">Counts include all pages.</p></div>${all.length && rows.length ? order : ''}</div>`;
      let body;
      if (!all.length) {
        body = TN.is('accounts', 'checker')
          ? card(emptyState('briefcase', 'No deals to show', 'No deal is visible to you here. Your Deal work is in Accounts.', btn('Open To check', { href: '#/app/accounts' })), { role: 'status' })
          : TN.is('admin')
            ? card(emptyState('briefcase', 'No deals to show', 'No deal is visible to you. Deals show here only when you are given access to them.'), { role: 'status' })
            : card(emptyState('briefcase', 'No deals to show', 'No deal is visible to you. Ask your manager if you expected to see one.'), { role: 'status' });
      } else if (!rows.length) {
        body = card(emptyState('briefcase', 'Nothing matches this filter', 'Other deals you can see are under All deals.', btn('Clear filters', { href: '#/app/deals' })), { role: 'status' });
      } else {
        const tr = rows.map((d) => {
          const rel = relation(d, true);
          return `<tr role="row" class="${TR}" data-search="${esc((d.id + ' ' + d.title).toLowerCase())}">${
            td('Reference', `<a class="${ROW_LINK}" data-slot="row-link" href="#/app/deals/${d.id}">${d.id}</a>`)}${
            td('Customer and trip', esc(d.title))}${
            td('Stage', bitrixName(d.stage))}${
            td('Owner', ownerCell(d.owner))}${
            td('', rowDetails(d.id, [['Bitrix deal', '#' + d.id.slice(3)], ['Stage', `Bitrix code: ${BITRIX_STAGE_CODE}.`], ['Branch', 'Jodhpur'], ['Created', TN.fmt.date(dealCreated(d))], ['Last checked with Bitrix', TN.fmt.dateTime(lastChecked)], ['Last change received', TN.fmt.dateTime(lastChange(d))], ['Why you can see this deal', SEEN[rel]]]))}</tr>`;
        }).join('');
        const range = `1–${rows.length} of ${rows.length} deals`;
        body = tableCard('Deals table', 'deals-table', range, ['Reference', 'Customer and trip', 'Stage', 'Owner', '<span class="sr-only">Details</span>'], tr, pagerNav('Deal pages', range));
      }
      return `<div class="font-sans text-base text-copy">${head}${filters}${body}</div>`;
    },
  });

  /* =====================================================================
     DEAL PAGE  (#/app/deals/:id) · live workspace + pending additions
     ===================================================================== */
  const TAB_LABEL = { overview: 'Overview', services: 'Services and tasks', quotations: 'Quotations', documents: 'Documents', money: 'Money', history: 'History' };
  function visibleTabs() {
    return Object.keys(TAB_LABEL).filter((t) => {
      if (t === 'money') return TN.can('seeSellingPrice');
      if (t === 'quotations') return TN.can('seeQuotations');
      return true;
    });
  }
  const dealHref = (id, tab) => `#/app/deals/${id}${tab && tab !== 'overview' ? '?tab=' + tab : ''}`;
  const bookHref = (id) => `#/app/deals/${id}/book`;
  const deptWord = { purchase: 'Purchase', flight: 'Flight', visa: 'the Visa and passport desk' };
  function arranging(d) {
    const open = new Set(fullServices(d).filter((s) => s.taskStatus !== 'cancelled' && !isDone(s)).map((s) => s.dept));
    const words = ['purchase', 'flight', 'visa'].filter((x) => open.has(x)).map((x) => deptWord[x]);
    if (!words.length) return 'The teams';
    const t = words.length === 1 ? words[0] : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  const blockingCount = (d) => (d.blocking != null ? d.blocking : d.services.length ? 1 : 3);

  /** Status word, the ONE primary action and the Next line (dealPrimaryAction). */
  function headerModel(d) {
    const svcs = fullServices(d);
    const teamTasks = { label: 'See team tasks', href: dealHref(d.id, 'services') };
    if (DEPT_OF_ROLE[TN.role]) {
      const own = svcs.filter((s) => s.assignee === TN.role && s.taskStatus !== 'cancelled').sort((a, b) => RANK[a.taskStatus] - RANK[b.taskStatus]);
      const w = own.length ? TASK_WORD[own[0].taskStatus] : ['Booking submitted', 'neutral', 'send'];
      return { word: w, primary: teamTasks, next: 'see Services and tasks' };
    }
    const word = STATE[d.bookingState];
    if (TN.is('accounts', 'checker')) {
      const nextA = { waiting_for_accounts: 'Accounts checks the booking', returned: 'Sales on this deal or the branch Manager fixes what Accounts asked for', being_arranged: `${arranging(d)} arrange the services. Nothing is booked until the supplier confirms.`, all_confirmed: 'Nothing waiting.' }[d.bookingState] || 'see Services and tasks';
      return { word, primary: submitted(d) ? { label: 'Open in Accounts', href: `#/app/accounts/deals/${d.id}` } : null, next: nextA };
    }
    const edit = canEditBooking(d);
    switch (d.bookingState) {
      case 'not_started': return edit ? { word, primary: { label: 'Start booking', act: 'sales-start-booking' }, next: 'start the booking', actor: 'You', startHint: true } : { word, primary: null, next: 'Sales on this deal or the branch Manager starts the booking' };
      case 'quotation_accepted': return edit ? { word, primary: { label: 'Start booking from quotation', href: `#/app/quotations/${d.quotation}` }, next: `start the booking from quotation ${d.quotation}`, actor: 'You' } : { word, primary: null, next: `Sales on this deal or the branch Manager starts the booking from quotation ${d.quotation}` };
      case 'in_progress': { const n = blockingCount(d); return edit ? { word, primary: { label: 'Continue booking', href: bookHref(d.id) }, next: `finish ${n === 1 ? '1 thing' : n + ' things'}`, actor: 'You' } : { word, primary: null, next: 'Sales on this deal or the branch Manager finishes the booking' }; }
      case 'ready_to_submit': return edit ? { word, primary: { label: 'Review and submit', href: bookHref(d.id) }, next: 'review and submit (step 3)', actor: 'You' } : { word, primary: null, next: 'the deal owner or branch Manager reviews and submits the booking' };
      case 'waiting_for_accounts': return { word, primary: { label: 'View booking', href: bookHref(d.id) }, next: 'Accounts checks the booking' };
      case 'returned': return edit ? { word, primary: { label: 'Fix and send again', href: bookHref(d.id) }, next: 'fix what Accounts asked for', actor: 'You' } : { word, primary: { label: 'View booking', href: bookHref(d.id) }, next: 'Sales on this deal or the branch Manager fixes what Accounts asked for' };
      case 'being_arranged': return { word, primary: teamTasks, next: `${arranging(d)} arrange the services. Nothing is booked until the supplier confirms.` };
      case 'all_confirmed': return { word, primary: { label: 'View booking', href: bookHref(d.id) }, next: 'Nothing waiting.' };
      case 'lost': return { word, primary: d.services.length ? { label: 'View booking', href: bookHref(d.id) } : null, next: 'nothing while the deal is lost or rejected in Bitrix', lost: true };
      default: return { word, primary: null, next: 'see Services and tasks' };
    }
  }
  TN.act('sales-start-booking', (el) => {
    const d = TN.deal(el.dataset.id);
    if (!d) return;
    d.bookingState = 'in_progress';
    d.blocking = 3;
    TN.go(`/app/deals/${d.id}/book`);
  });

  const TRIP_LOOK = { booked: ['success', 'calendar-clock', 'Trip booked'], travelled: ['info', 'plane', 'Travelled'], closed: ['neutral', 'lock', 'Trip closed'] };
  const CANCEL_WORD = {
    requested: ['warning', 'hourglass', 'Waiting for Purchase to enter supplier charges'],
    charges_entered: ['warning', 'hourglass', 'Waiting for the branch Manager'],
    waiting_manager: ['warning', 'hourglass', 'Waiting for the branch Manager'],
    approved: ['info', 'hand-coins', 'Approved · Accounts settles the money'],
    refund_paid: ['info', 'banknote', 'Refund paid · waiting for a second Accounts check'],
    closed: ['success', 'circle-check', 'Cancellation closed'],
    refused: ['danger', 'circle-x', 'Refused by the branch Manager'],
  };

  function dealHeader(d) {
    const m = headerModel(d);
    const [wordText, tone, icon] = m.word;
    const svcs = fullServices(d).filter((s) => s.taskStatus !== 'cancelled');
    const done = svcs.filter(isDone).length;
    const trip = tripStatus(d);
    const cancel = D.cancellations.find((c) => c.deal === d.id && c.status !== 'closed');
    let primary = '';
    if (m.primary) {
      primary = m.primary.act
        ? `<form novalidate class="flex flex-col gap-3" data-act="noop"><div role="status" aria-live="polite"></div><div>${btn(m.primary.label, { variant: 'primary', act: m.primary.act, attrs: ` data-id="${d.id}"` })}</div></form>`
        : `<a class="${btnClass('primary')}" href="${m.primary.href}">${esc(m.primary.label)}</a>`;
    }
    const leadId = LEAD_OF[d.id];
    const status = [
      badge(tone, icon, wordText, 'Booking status:'),
      trip ? badge(...TRIP_LOOK[trip], 'Trip status:') : '',
      `<span class="inline-flex items-center gap-1 text-copy"><span class="text-quiet">Stage:</span>${bitrixName(d.stage)}</span>`,
      `<span class="inline-flex max-w-full min-w-0 items-center gap-1.5 wrap-break-word text-copy">${ic('user-round', 'lucide-user-2 size-4 shrink-0 text-faint')}<span class="min-w-0">Owner: <span class="font-semibold text-ink">${esc(who(d.owner))}</span></span></span>`,
      leadId && TN.can('seeLeads') ? `<span class="min-w-0 wrap-anywhere text-copy">From lead <a class="${LINK} hover:decoration-2" href="#/app/leads/${leadId}">${leadId.replace('L-', 'BXL-')}</a></span>` : '',
      `<div class="[&_.live-indicator]:m-0">${liveIndicator}</div>`,
    ].join('');
    const notices = [];
    if (d.bookingState === 'returned' && !DEPT_OF_ROLE[TN.role]) {
      notices.push(notice('warning', `<p>Returned ${TN.fmt.dateTime(d.returnedAt || '2026-10-25 12:30')}.</p><p>Reason: <span class="wrap-break-word">${esc(d.returnReason)}</span></p>`, { icon: 'undo-2', title: 'Returned by Accounts' }));
    }
    if (m.lost) notices.push(notice('locked', `<p>${d.services.length ? 'This deal is lost or rejected in Bitrix. You can read the booking; you cannot change it.' : 'This deal is lost or rejected in Bitrix, so a booking cannot be started.'}</p>`, { icon: 'circle-x' }));
    if (cancel) {
      const [, , w] = CANCEL_WORD[cancel.status];
      notices.push(notice('warning', `<p>${esc(cancel.kind)}, asked by ${esc(who(cancel.requestedBy))} on ${TN.fmt.date(cancel.at)}. ${esc(w)}.</p><p><a class="${LINK}" href="${dealHref(d.id, 'services')}">See the cancellation</a></p>`, { icon: 'circle-x', title: 'Cancellation requested' }));
    }
    return `<header class="flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between mb-3" data-slot="page-header"><div class="min-w-0"><p class="m-0 mb-1 text-sm font-medium text-quiet"><span class="wrap-anywhere">${d.id}</span></p><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl"><span class="block wrap-anywhere">${esc(d.title)}</span></h1><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${status}</div></div>${primary ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&>*]:flex-1"><div data-slot="deal-primary">${primary}</div></div>` : ''}</header><div class="mb-4 flex flex-col gap-2.5"><p class="m-0 text-copy" data-slot="deal-next"><span class="font-semibold text-ink">Next:</span> ${esc(m.next)}${m.actor ? `<span class="text-quiet"> · ${m.actor}</span>` : ''}</p>${m.startHint ? '<p class="m-0 text-sm text-quiet">Starts the booking form. Nothing is booked or paid.</p>' : ''}${svcs.length ? `<div class="flex flex-wrap items-center gap-2 text-sm"><span class="inline-flex items-center gap-1.5 text-copy">${ic('list-checks', 'size-4 shrink-0 text-faint')}Services: ${done} of ${svcs.length} confirmed</span></div>` : ''}${notices.join('')}</div>`;
  }

  /* ---------- Overview tab (no money) + pending trip status ---------- */
  function closureChecklist(d) {
    // Lead: one checklist everywhere. Use Accounts' 5-item closure checklist (70-money.js) when it is loaded.
    if (TN.money && TN.money.checklist) return TN.money.checklist(d).map((i) => [esc(i.label), !!i.done, i.done ? 'Done.' : (i.why ? i.why.charAt(0).toUpperCase() + i.why.slice(1) + '.' : 'Not done yet.')]);
    const rec = receiptsOf(d.id);
    const insts = instOf(d.id);
    const svcs = fullServices(d).filter((s) => s.taskStatus !== 'cancelled');
    const needPay = svcs.filter((s) => s.cost && !(s.dept === 'flight' && s.cost <= 50000));
    const unpaid = needPay.filter((s) => !D.supplierPayments.some((p) => p.service === s.id && p.status === 'verified'));
    const needInv = svcs.filter((s) => s.dept === 'purchase' && s.supplier);
    const noInv = needInv.filter((s) => !D.supplierInvoices.some((i) => i.service === s.id && i.kind === 'Invoice' && i.status !== 'returned'));
    const openRefunds = D.refunds.filter((r) => r.deal === d.id && r.status !== 'verified');
    const recOpen = rec.filter((r) => r.status !== 'verified').length + insts.filter((i) => i.status !== 'paid').length;
    return [
      ['All customer receipts verified', recOpen === 0, recOpen === 0 ? 'Every instalment is paid and checked by a second Accounts person.' : `${TN.fmt.plural(recOpen, 'item')} still open (unpaid instalments or receipts not checked).`],
      ['All supplier payments verified', unpaid.length === 0, unpaid.length === 0 ? 'Every supplier is paid and the payment is checked.' : `${TN.fmt.plural(unpaid.length, 'service')} not paid or not checked yet.`],
      ['All supplier invoices in', noInv.length === 0, noInv.length === 0 ? 'Every hotel, cab and activity invoice is uploaded.' : `Missing for ${noInv.map((s) => s.title.split(',')[0]).join(', ')}.`],
      ['No open refund', openRefunds.length === 0, openRefunds.length === 0 ? 'Nothing is owed to or by the customer or a supplier.' : `${TN.fmt.plural(openRefunds.length, 'refund or recovery', 'refunds or recoveries')} not finished.`],
    ];
  }
  function tripBlock(d) {
    const trip = tripStatus(d);
    const order = ['booked', 'travelled', 'closed'];
    const at = trip ? order.indexOf(trip) : -1;
    const steps = [
      ['Booked', 'Every service is confirmed by the supplier.'],
      ['Travelled', `Set automatically on ${TN.fmt.date(addDays(d.end, 1))}, the day after the trip ends.`],
      ['Closed', 'Accounts closes the trip after the checklist below.'],
    ];
    const stepHtml = `<ol class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Trip status steps">${steps.map(([t, sub], i) => {
      const state = i <= at ? (i === at && i < 2 ? 'now' : 'done') : 'todo';
      const iconHtml = state === 'done' ? ic('circle-check', 'mt-0.5 size-4 shrink-0 text-status-success') : state === 'now' ? ic('circle-dot', 'mt-0.5 size-4 shrink-0 text-brand-strong') : ic('circle-dashed', 'mt-0.5 size-4 shrink-0 text-faint');
      const word = state === 'done' ? 'Done' : state === 'now' ? 'Now' : 'Not yet';
      return `<li class="m-0 flex gap-2"${state === 'now' ? ' aria-current="step"' : ''}>${iconHtml}<span class="min-w-0"><span class="font-semibold text-ink">${t}</span><span class="text-sm text-quiet"> · ${word}</span><span class="block text-sm text-quiet">${esc(sub)}</span></span></li>`;
    }).join('')}</ol>`;
    let checklist = '';
    if (trip) {
      const items = closureChecklist(d);
      const allDone = items.every((x) => x[1]);
      const list = `<ul class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Closure checklist">${items.map(([t, ok, sub]) => `<li class="m-0 flex flex-wrap items-start justify-between gap-2 py-2"><span class="min-w-0 flex-1"><span class="font-semibold text-ink">${t}</span><span class="block text-sm text-quiet">${esc(sub)}</span></span>${ok ? badge('success', 'circle-check', 'Done', 'Checklist item:') : badge('neutral', 'circle-dashed', 'Not yet', 'Checklist item:')}</li>`).join('')}</ul>`;
      let action = '';
      if (TN.can('accounts') && trip !== 'closed') {
        action = trip === 'travelled' && allDone
          ? `<div>${btn('Close trip', { act: 'sales-close-trip', attrs: ` data-id="${d.id}"` })}</div>`
          : `<div class="flex flex-wrap items-center gap-2">${btn('Close trip', { attrs: ' aria-disabled="true" disabled' })}<span class="text-sm text-quiet">${trip !== 'travelled' ? 'A trip can be closed after the customer has travelled.' : 'Finish every item on the checklist first.'}</span></div>`;
      } else if (trip !== 'closed') {
        action = '<p class="m-0 text-sm text-quiet">Accounts closes the trip when every item is done. You can follow the checklist here.</p>';
      }
      checklist = `<h4 class="m-0 mt-2.5 text-sm font-semibold text-ink">Closure checklist</h4>${list}${action}`;
    }
    return `<section aria-labelledby="overview-trip-status" class="flex flex-col gap-2">${subHeading('overview-trip-status', 'Trip status')}${trip ? '' : `<p class="m-0 text-copy">${submitted(d) ? 'Not booked yet: the trip is booked when every service is confirmed by the supplier.' : 'Not booked yet: the booking has not been approved by Accounts.'}</p>`}${stepHtml}${checklist}</section>`;
  }
  TN.act('sales-close-trip', (el) => {
    const d = TN.deal(el.dataset.id);
    d.tripStatus = 'closed';
    pushNotice(['sales', 'manager'], `Trip closed by Accounts: ${d.title} (${d.id}).`, d.id);
    TN.toast('Trip closed. It moves out of the open lists.');
    TN.refresh();
  });

  function overviewTab(d) {
    const svcs = fullServices(d);
    const team = [['Sales', d.owner]];
    ['purchase', 'flight', 'visa'].forEach((dep) => {
      const a = svcs.find((s) => s.dept === dep && s.assignee);
      if (a) team.push([dep === 'visa' ? 'Visa and passport desk' : dep.charAt(0).toUpperCase() + dep.slice(1), a.assignee]);
    });
    const travellers = d.adults + d.children + d.infants;
    const showTravellers = !TN.is('purchase', 'flight');
    const rel = relation(d, false);
    const rows = [
      ['Trip', `${esc(d.destination)} · ${TN.fmt.date(d.start)} to ${TN.fmt.date(d.end)}`],
      showTravellers ? ['Travellers', `${travellers} travellers`] : null,
      ['Branch', 'Jodhpur'],
      ['Team', `<ul class="m-0 flex list-none flex-col gap-1 p-0">${team.map(([k, p]) => `<li class="m-0 inline-flex items-center gap-1.5">${ic('user-round', 'lucide-user-2 size-4 shrink-0 text-faint')}${esc(k)}: ${isMe(p) ? 'You' : 'a colleague'}</li>`).join('')}</ul>`],
      ['Created', TN.fmt.date(dealCreated(d))],
    ];
    const details = `<details class="rounded-control border border-line bg-canvas px-3.5 py-2.5" data-slot="deal-details"><summary class="cursor-pointer rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 ${FOCUS}">Details and Bitrix facts</summary><div class="mt-3 flex flex-col gap-3">${summaryList([
      ['Why you can see this deal', SEEN[rel]],
      ['Bitrix deal', '#' + d.id.slice(3)],
      ['Stage', `${bitrixName(d.stage)}<span class="block text-sm text-quiet">Bitrix code: ${BITRIX_STAGE_CODE}.</span>`],
      ['Last checked with Bitrix', TN.fmt.dateTime(lastChecked)],
      ['Last change received', TN.fmt.dateTime(lastChange(d))],
    ])}${quietNote('lock', 'Title, stage and salesperson come from Bitrix. Change them there.')}</div></details>`;
    return sectionCard('deal-overview-heading', 'Overview', summaryList(rows) + tripBlock(d) + details, { bodyCls: 'flex flex-col gap-4' });
  }

  /* ---------- Services and tasks tab (live DealServicesCard) + pending go-ahead, changes, cancellation ---------- */
  const TYPE = { hotel: ['bed-double', 'Hotel'], transfer: ['car-front', 'Transfer or cab'], activity: ['compass', 'Activity'], flight: ['plane', 'Flight'], visa: ['stamp', 'Visa'], passport: ['file-text', 'Passport'], package: ['bed-double', 'Hotel'] };
  const DEPT_LABEL = { purchase: 'Purchase', flight: 'Flight team', visa: 'Visa & Passport desk' };
  const typePill = (kind) => `<span class="inline-flex max-w-full items-center gap-1.5 rounded-full border border-brand-line bg-brand-tint py-0.5 pr-2.5 pl-2 font-sans text-sm leading-5 font-semibold whitespace-nowrap text-brand-strong" data-slot="service-type-pill" data-type="${kind}">${ic(TYPE[kind][0], 'size-3.5 shrink-0')}<span class="sr-only">Service type: </span><span class="truncate">${kind === 'package' ? 'Package' : TYPE[kind][1]}</span></span>`;
  function serviceState(s) {
    if (s.taskStatus === 'cancelled') return ['neutral', 'clock', 'Cancelled'];
    if (s.dept === 'visa') return s.taskStatus === 'in_progress' ? ['info', 'circle-play', 'In progress'] : isDone(s) ? ['success', 'circle-check', 'Completed'] : ['warning', 'clock', 'Waiting to be taken'];
    if (isDone(s)) return ['success', 'circle-check', 'Confirmed by supplier'];
    if (s.taskStatus === 'in_progress') return ['info', 'circle-play', s.dept === 'flight' ? 'In progress · ticket not recorded in the CRM' : 'In progress · not booked yet'];
    return ['warning', 'clock', 'Waiting to be taken'];
  }
  const nextStep = (s) => (s.taskStatus === 'cancelled' ? 'Cancelled after booking' : isDone(s) ? 'Confirmed by supplier' : s.taskStatus === 'in_progress' ? (s.dept === 'visa' ? 'With the Visa desk' : 'Being arranged (not booked yet)') : 'Waiting for the department to take it');
  const taskLink = (s) => ({ purchase: ['purchase', 'Open Purchase task'], flight: ['flight', 'Open Flight task'], visa: ['visa', 'Open Visa & Passport task'] }[s.dept]);
  const GO_AHEAD = { waiting: ['warning', 'hourglass', 'Waiting for Accounts go-ahead'], given: ['success', 'circle-check', 'Go-ahead given'], refused: ['danger', 'circle-x', 'Go-ahead refused'] };
  function serviceRow(s) {
    const [tone, icon, word] = serviceState(s);
    const owner = s.assignee ? who(s.assignee) : `${DEPT_LABEL[s.dept]} · not taken yet`;
    const [path, linkText] = taskLink(s);
    const goAhead = s.dept === 'purchase' && 'goAhead' in s
      ? `<dt class="font-medium text-quiet">Accounts go-ahead</dt><dd class="m-0 text-copy">${s.goAhead ? badge(...GO_AHEAD[s.goAhead], 'Go-ahead:', true) : 'Not needed'}</dd>` : '';
    return `<li class="m-0 flex flex-col gap-2 px-4.5 py-3.5"><div class="flex flex-wrap items-start justify-between gap-x-3 gap-y-2"><div class="flex min-w-0 flex-wrap items-center gap-2">${typePill(s.kind)}<span class="font-semibold wrap-break-word text-ink">${esc(s.title)}</span></div>${badge(tone, icon, word, 'Service status:', true)}</div><dl class="m-0 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-0.5 text-sm max-sm:grid-cols-1"><dt class="font-medium text-quiet">Dates</dt><dd class="m-0 text-copy">${s.start === s.end ? TN.fmt.date(s.start) : `${TN.fmt.date(s.start)} to ${TN.fmt.date(s.end)}`} · ${esc(s.detail)}</dd><dt class="font-medium text-quiet">Department</dt><dd class="m-0 text-copy">${DEPT_LABEL[s.dept]}</dd><dt class="font-medium text-quiet">Owner</dt><dd class="m-0 text-copy">${esc(owner)}</dd>${goAhead}<dt class="font-medium text-quiet">Next step</dt><dd class="m-0 text-copy">${esc(nextStep(s))} <a class="${LINK_SOFT}" href="#/app/${path}/${s.id}">${linkText}</a></dd></dl>${askUpdateRow(s)}</li>`;
  }
  /* "In progress · not booked yet": Sales (deal owner) or the Manager can ask Purchase for an update. Purchase sees the request on the same row. */
  const notBookedYet = (s) => s.dept === 'purchase' && s.taskStatus === 'in_progress' && !isDone(s);
  function askUpdateRow(s) {
    if (!notBookedYet(s)) return '';
    const asked = s.updateAsk;
    const askedText = asked ? `${who(asked.by)} asked Purchase for an update on ${TN.fmt.dateTime(asked.at)}.` : '';
    if (TN.is('sales', 'manager') && canEditBooking(TN.deal(s.deal))) {
      return `<div class="flex flex-wrap items-center gap-2">${btn(asked ? 'Ask again' : 'Ask Purchase for an update', { size: 'sm', icon: 'bell', act: 'sales-ask-update', attrs: ` data-id="${s.id}"`, sr: `for ${s.title}` })}${asked ? `<span class="text-sm text-quiet" role="status">${esc(askedText)}</span>` : ''}</div>`;
    }
    if (asked && TN.is('purchase')) return `<p class="m-0 text-sm text-copy" role="status">${ic('bell', 'size-3.5 shrink-0')} ${esc(askedText)} Book it or add a note on the task.</p>`;
    return '';
  }
  TN.act('sales-ask-update', (el) => {
    const s = D.services[el.dataset.id];
    if (!s || !notBookedYet(s)) { TN.toast('This service is no longer waiting to be booked.', 'danger'); TN.refresh(); return; }
    s.updateAsk = { by: me().key, at: nowStamp() };
    pushNotice(['purchase'], `${me().name} asked for an update on ${s.title} (${s.deal}). It is in progress but not booked yet. Travel starts ${TN.fmt.date(s.start)}.`, s.deal, `#/app/purchase/${el.dataset.id}`);
    TN.toast('Purchase was asked for an update.');
    TN.refresh();
  });
  function progressPill(svcs) {
    const live = svcs.filter((s) => s.taskStatus !== 'cancelled');
    const done = live.filter(isDone).length, inP = live.filter((s) => s.taskStatus === 'in_progress').length, notS = live.filter((s) => s.taskStatus === 'new').length;
    const parts = [`${done} of ${live.length} confirmed`]; if (inP) parts.push(`${inP} in progress`); if (notS) parts.push(`${notS} not started`);
    const all = live.length && done === live.length;
    return badge(all ? 'success' : 'info', all ? 'circle-check' : 'circle-play', parts.join(' · '), 'Progress:', true);
  }

  const CHANGE_WORD = { waiting_customer: ['warning', 'hourglass', 'Waiting for the customer'], accepted: ['info', 'circle-play', 'Customer accepted · teams update the services'], done: ['success', 'circle-check', 'Change done'], withdrawn: ['neutral', 'circle-minus', 'Withdrawn'] };
  function changesCard(d) {
    const changes = D.changes.filter((c) => c.deal === d.id);
    const cancel = D.cancellations.filter((c) => c.deal === d.id);
    const sales = TN.is('sales', 'manager') && canEditBooking(d);
    const canAsk = sales && booked(d);
    if (!changes.length && !cancel.length && !canAsk) return '';
    const money = TN.can('seeCustomerPayments');
    const changeRows = changes.map((c) => {
      const [tone, icon, word] = CHANGE_WORD[c.status] || CHANGE_WORD.waiting_customer;
      const acts = sales && c.status === 'waiting_customer' ? `<div class="flex flex-wrap gap-2">${btn('Customer accepted', { size: 'sm', act: 'sales-change-accepted', attrs: ` data-id="${c.id}"` })}${btn('Withdraw', { size: 'sm', variant: 'ghost', act: 'sales-change-withdraw', attrs: ` data-id="${c.id}"` })}</div>` : '';
      const priceNote = money ? (c.note ? `<p class="m-0 text-sm text-quiet">${esc(c.note)}</p>` : '') : '<p class="m-0 text-sm text-quiet">Fresh customer acceptance needed before the teams act on it.</p>';
      return `<li class="m-0"><article class="flex flex-col gap-2 rounded-card border border-line bg-card px-4 py-3" aria-label="Change ${esc(c.id)}"><div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-base font-semibold text-ink">${esc(c.kind)}</p>${badge(tone, icon, word, 'Change status:', true)}</div><p class="m-0 text-sm text-copy">${esc(c.detail)}</p>${priceNote}<p class="m-0 text-sm text-quiet">Asked by ${esc(who(c.requestedBy))} on ${TN.fmt.date(c.at)}</p>${acts}</article></li>`;
    }).join('');
    const cancelRows = cancel.map((c) => {
      const [tone, icon, word] = CANCEL_WORD[c.status];
      const charges = (c.charges || []).map((x) => [TN.service(x.service).title, `${amount(rs(x.supplierCharge))}<span class="block text-sm text-quiet">${esc(x.note)}</span>`, { numeric: true }]);
      const supplierTotal = (c.charges || []).reduce((a, x) => a + x.supplierCharge, 0);
      const moneyRows = money && c.charges && c.charges.length ? [
        ['Customer paid (checked)', amount(rs(c.customerPaid)), { numeric: true }],
        ['Supplier charges', amount(rs(supplierTotal)), { numeric: true }],
        ['Our cancellation charge', amount(rs(c.ourCharge)), { numeric: true }],
        c.refundToCustomer ? ['Refund to the customer', amount(rs(c.refundToCustomer)), { numeric: true, total: true }] : ['Customer still owes', amount(rs(c.recoveryFromCustomer)), { numeric: true, total: true }],
      ] : [];
      const nextWho = { requested: 'Purchase enters what each supplier keeps', waiting_manager: `the branch Manager approves the charges and the refund · ${TN.person('manager').name}`, charges_entered: `the branch Manager approves the charges and the refund · ${TN.person('manager').name}`, approved: 'Accounts pays the refund or collects what is owed; a different Accounts person verifies it', refund_paid: 'a different Accounts person verifies the refund', closed: 'nothing' }[c.status] || '';
      let act = '';
      if (TN.is('purchase') && c.status === 'requested') act = btn('Enter supplier charges', { size: 'sm', act: 'sales-cancel-charges', attrs: ` data-id="${c.id}"` });
      if (TN.is('manager') && ['waiting_manager', 'charges_entered'].includes(c.status)) act = btn('Open in Approvals', { size: 'sm', href: '#/app/approvals' });
      if (TN.can('accounts') && c.status === 'approved') act = btn('Open Refunds and recoveries', { size: 'sm', href: '#/app/accounts/refunds' });
      return `<li class="m-0"><article class="flex flex-col gap-2 rounded-card border border-line bg-card px-4 py-3" aria-label="Cancellation ${esc(c.id)}" id="cancellation"><div class="flex flex-wrap items-center justify-between gap-2"><p class="m-0 text-base font-semibold text-ink">${esc(c.kind)}</p>${badge(tone, icon, word, 'Cancellation status:', true)}</div><p class="m-0 text-sm text-copy">Reason: ${esc(c.reason)}</p><p class="m-0 text-sm text-quiet">Asked by ${esc(who(c.requestedBy))} on ${TN.fmt.date(c.at)}</p>${charges.length && TN.can('seeSupplierCost') || (charges.length && money) ? summaryList([...charges, ...moneyRows]) : ''}<p class="m-0 text-copy"><span class="font-semibold text-ink">Next:</span> ${esc(nextWho)}</p>${act ? `<div>${act}</div>` : ''}</article></li>`;
    }).join('');
    const openCancel = cancel.some((c) => c.status !== 'closed');
    const buttons = canAsk ? `<div class="flex flex-wrap gap-2">${btn('Request a change', { act: 'sales-change-open', attrs: ` data-id="${d.id}"` })}${openCancel ? '' : btn('Cancel booking', { act: 'sales-cancel-open', attrs: ` data-id="${d.id}"` })}</div>` : '';
    const body = `${changes.length || cancel.length ? `<ol class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Changes and cancellations, newest first">${cancelRows}${changeRows}</ol>` : '<p class="m-0 text-quiet">No change or cancellation on this deal.</p>'}${buttons}${canAsk ? '<p class="m-0 text-sm text-quiet">A change the customer will notice needs a fresh OK from the customer before the teams act on it. A cancellation goes to Purchase for supplier charges, then to the branch Manager.</p>' : ''}`;
    return sectionCard('deal-changes-heading', 'Changes after booking', body, { bodyCls: 'flex flex-col gap-4', desc: 'Add or remove a service, change dates, or cancel.' });
  }

  function servicesTab(d) {
    const svcs = fullServices(d);
    const m = headerModel(d);
    const headerHasBooking = m.primary && !/team tasks|Open in Accounts/.test(m.primary.label);
    if (!svcs.length) {
      return headerHasBooking && m.primary ? `<p class="m-0 text-base text-copy">No services yet. Use “${esc(m.primary.label)}” at the top of this page.</p>` : card(emptyState('list-checks', 'Nothing to show here yet', 'Services and team tasks show here after a booking starts, for the roles that work on them.'), { role: 'status' });
    }
    const shown = DEPT_OF_ROLE[TN.role] ? svcs.filter((s) => s.dept === DEPT_OF_ROLE[TN.role]) : svcs;
    const editor = canEditBooking(d);
    const servicesCard = card(`<section aria-labelledby="services-heading" id="services-sold">${cardHead('services-heading', 'Services sold', { desc: submitted(d) ? 'Booking version 1 · submitted' : 'Not submitted yet', aside: progressPill(svcs) })}<ol class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Sold services">${shown.map(serviceRow).join('')}</ol>${editor ? `<div class="px-4.5 border-t border-line py-3">${btn('Open the booking', { size: 'sm', href: bookHref(d.id) })}</div>` : ''}</section>`);
    const waiting = svcs.filter((s) => s.goAhead === 'waiting').length;
    const goNote = waiting && !DEPT_OF_ROLE[TN.role] ? notice('info', `<p>${TN.fmt.plural(waiting, 'hotel')} on this deal ${waiting === 1 ? 'waits' : 'wait'} for the Accounts go-ahead. Purchase books a hotel only after Accounts gives it.</p>`, { icon: 'hourglass' }) : '';
    const goNoteDept = waiting && TN.is('purchase') ? notice('info', '<p>Wait for the Accounts go-ahead before you commit any hotel on this deal.</p>', { icon: 'hourglass' }) : '';
    return `<div class="flex min-w-0 flex-col gap-5">${goNote}${goNoteDept}${servicesCard}${changesCard(d)}</div>`;
  }

  /* Change after booking: drawer, accept, withdraw */
  function changeForm(d, v = {}, errs = {}) {
    const list = Object.entries(errs);
    const body = `<form novalidate id="sales-change-form" class="flex flex-col gap-4" data-act="sales-change-submit" data-id="${d.id}">${list.length ? errorSummary('The change was not sent.', list.map(([k, t]) => [k, t])) : ''}${selectF('chg-kind', 'kind', 'What changes', v.kind || 'Add a service', [['Add a service', 'Add a service'], ['Remove a service', 'Remove a service'], ['Change dates', 'Change dates']])}${textareaF('chg-detail', 'detail', 'What exactly changes', v.detail, { error: errs['chg-detail'], hint: 'For example: add a North Goa sightseeing tour on 16 Nov for 3 people.' })}${TN.can('seeSellingPrice') ? inputF('chg-price', 'price', 'Change to the selling price ₹', v.price, { money: true, inputmode: 'decimal', optional: true, hint: 'Use a minus sign when the price goes down.', error: errs['chg-price'] }) : ''}${notice('info', '<p>The customer must accept the change again before Purchase, Flight or Visa act on it. Nothing is changed with any supplier yet.</p>')}</form>`;
    return { title: 'Request a change', description: `${d.id} · ${d.title}`, body, footer: `<div class="flex flex-wrap gap-2">${btn('Send for customer acceptance', { variant: 'primary', type: 'submit', attrs: ' form="sales-change-form"' })}${btn('Cancel', { attrs: ' data-close' })}</div>` };
  }
  TN.act('sales-change-open', (el) => openDrawer(changeForm(TN.deal(el.dataset.id))));
  TN.act('sales-change-submit', (f) => {
    const d = TN.deal(f.dataset.id), v = formVals(f), errs = {};
    if (String(v.detail || '').trim().length < 10) errs['chg-detail'] = 'What exactly changes: write at least 10 characters';
    const price = v.price ? toNum(v.price) : 0;
    if (v.price && !Number.isFinite(price)) errs['chg-price'] = 'Change to the selling price: write an amount in rupees, for example 4500';
    if (Object.keys(errs).length) { openDrawer(changeForm(d, v, errs)); return; }
    const id = `ch-${d.id.slice(-3)}-${D.changes.filter((c) => c.deal === d.id).length + 1}`;
    D.changes.unshift({ id, deal: d.id, kind: v.kind, detail: v.detail.trim(), requestedBy: me().key, at: TN.TODAY, status: 'waiting_customer', note: price ? `Fresh customer acceptance needed: price goes ${price > 0 ? 'up' : 'down'} by ${TN.fmt.inr(Math.abs(price))}.` : 'Fresh customer acceptance needed.' });
    pushNotice(['sales', 'manager'], `Change on ${d.id} waits for the customer: ${v.kind.toLowerCase()}.`, d.id);
    TN.closeOverlay();
    TN.toast('Change saved. It waits for the customer’s acceptance.');
    TN.refresh();
  });
  TN.act('sales-change-accepted', (el) => {
    const c = D.changes.find((x) => x.id === el.dataset.id);
    c.status = 'accepted';
    c.acceptedAt = TN.TODAY;
    pushNotice(['purchase', 'flight', 'visa', 'accounts', 'checker'], `Customer accepted a change on ${c.deal}: ${c.detail}. Update the services.`, c.deal);
    TN.toast('Customer acceptance recorded. Purchase and Accounts are told.');
    TN.refresh();
  });
  TN.act('sales-change-withdraw', (el) => { const c = D.changes.find((x) => x.id === el.dataset.id); c.status = 'withdrawn'; TN.toast('Change withdrawn.'); TN.refresh(); });

  /* Cancellation request (Sales) and supplier charges (Purchase) */
  function cancelForm(d, v = {}, errs = {}) {
    const svcs = fullServices(d).filter((s) => s.taskStatus !== 'cancelled');
    const picked = v.services || svcs.map((s) => s.id);
    const list = Object.entries(errs);
    const body = `<form novalidate id="sales-cancel-form" class="flex flex-col gap-4" data-act="sales-cancel-submit" data-id="${d.id}">${list.length ? errorSummary('The cancellation was not sent.', list) : ''}<fieldset class="m-0 min-w-0 border-0 p-0" id="cxl-services" tabindex="-1"><legend class="mb-1.5 block font-sans text-base font-semibold text-ink">Services to cancel</legend><div class="flex flex-wrap gap-2">${svcs.map((s) => `<label for="cxl-${s.id}" class="${CHIP_CHECK}" data-slot="chip-check"><input id="cxl-${s.id}" type="checkbox" class="${CHECKBOX}" name="services" value="${s.id}"${picked.includes(s.id) ? ' checked' : ''}><span class="min-w-0 wrap-anywhere">${esc(s.title)}</span></label>`).join('')}</div>${errs['cxl-services'] ? fieldErr(errs['cxl-services']).replace('%ID%', 'cxl-services') : ''}</fieldset>${textareaF('cxl-reason', 'reason', 'Why the customer cancels', v.reason, { error: errs['cxl-reason'] })}${notice('info', '<p>Purchase enters what each supplier keeps. The branch Manager approves the charges and the refund. Accounts pays the refund and a different Accounts person verifies it.</p>')}</form>`;
    return { title: 'Cancel booking', description: `${d.id} · ${d.title}`, body, footer: `<div class="flex flex-wrap gap-2">${btn('Send cancellation request', { variant: 'danger', type: 'submit', attrs: ' form="sales-cancel-form"' })}${btn('Keep the booking', { attrs: ' data-close' })}</div>` };
  }
  TN.act('sales-cancel-open', (el) => openDrawer(cancelForm(TN.deal(el.dataset.id))));
  TN.act('sales-cancel-submit', (f) => {
    const d = TN.deal(f.dataset.id);
    const fd = new FormData(f);
    const v = { services: fd.getAll('services'), reason: String(fd.get('reason') || '') };
    const errs = {};
    if (!v.services.length) errs['cxl-services'] = 'Services to cancel: choose at least one service';
    if (v.reason.trim().length < 10) errs['cxl-reason'] = 'Why the customer cancels: write at least 10 characters';
    if (D.cancellations.some((c) => c.deal === d.id && c.status !== 'closed')) { openDrawer(cancelForm(d, v, {})); document.querySelector('#sales-cancel-form').insertAdjacentHTML('afterbegin', errorSummary('A cancellation is already open on this deal.', [])); return; }
    if (Object.keys(errs).length) { openDrawer(cancelForm(d, v, errs)); return; }
    const whole = v.services.length === fullServices(d).filter((s) => s.taskStatus !== 'cancelled').length;
    const id = 'c-' + d.id.slice(-3);
    D.cancellations.unshift({ id, deal: d.id, kind: whole ? 'Cancel whole trip' : `Cancel ${TN.fmt.plural(v.services.length, 'service')}`, services: v.services, reason: v.reason.trim(), requestedBy: me().key, at: TN.TODAY, status: 'requested', charges: [], customerPaid: verifiedSum(d.id), refundToCustomer: 0, ourCharge: 0, recoveryFromCustomer: 0 });
    d.cancellation = id;
    pushNotice(['purchase'], `Cancellation asked on ${d.id} (${d.title}). Enter what each supplier keeps.`, d.id);
    pushNotice(['manager'], `Cancellation asked on ${d.id}. It comes to you after Purchase enters supplier charges.`, d.id);
    TN.closeOverlay();
    TN.toast('Cancellation request sent to Purchase.');
    TN.refresh();
  });
  TN.act('sales-cancel-charges', (el) => {
    const c = D.cancellations.find((x) => x.id === el.dataset.id);
    const svcs = (c.services || TN.servicesOf(c.deal).map((s) => s.id)).map((id) => ({ id, ...TN.service(id) }));
    openDrawer({ title: 'Enter supplier charges', description: `${c.deal} · what each supplier keeps`, body: `<form novalidate id="sales-charges-form" class="flex flex-col gap-4" data-act="sales-charges-submit" data-id="${c.id}">${svcs.map((s) => inputF('chg-' + s.id, s.id, s.title, '', { money: true, inputmode: 'decimal', hint: 'Write 0 when the supplier refunds everything.' })).join('')}</form>`, footer: `<div class="flex flex-wrap gap-2">${btn('Send to the branch Manager', { variant: 'primary', type: 'submit', attrs: ' form="sales-charges-form"' })}${btn('Cancel', { attrs: ' data-close' })}</div>` });
  });
  TN.act('sales-charges-submit', (f) => {
    const c = D.cancellations.find((x) => x.id === f.dataset.id);
    const v = formVals(f);
    const bad = Object.entries(v).find(([, x]) => !Number.isFinite(toNum(x)) || String(x).trim() === '');
    if (bad) { TN.toast('Write an amount for every supplier (0 when nothing is kept).', 'danger'); return; }
    c.charges = Object.entries(v).map(([service, x]) => ({ service, supplierCharge: toNum(x), note: toNum(x) ? 'Supplier keeps this amount' : 'Full refund from the supplier' }));
    const total = c.charges.reduce((a, x) => a + x.supplierCharge, 0) + (c.ourCharge || 0);
    c.refundToCustomer = Math.max(0, c.customerPaid - total);
    c.recoveryFromCustomer = Math.max(0, total - c.customerPaid);
    c.status = 'waiting_manager';
    pushNotice(['manager'], `Cancellation on ${c.deal} waits for your approval: supplier charges entered.`, c.deal, '#/app/approvals');
    TN.closeOverlay();
    TN.toast('Supplier charges sent to the branch Manager.');
    TN.refresh();
  });

  /* ---------- Quotations tab (live SubjectQuotationsCard + ItinerariesCard) ---------- */
  function quotationsTab(d) {
    const fallback = d.quotation ? [{ id: d.quotation, ref: d.quotation, title: d.title.split(' · ').slice(1).join(' · '), version: 1, valid: '2026-11-05', status: 'accepted' }] : [];
    const q = sectionCard('quotations-heading', 'Quotations', quotationRows(quotationsFor('deal', d.id), fallback) + (canEditBooking(d) ? createQuotationForm('deal', d.id, d.title) : ''), { bodyCls: 'flex flex-col gap-4' });
    const itins = TN.quotes && TN.quotes.itinerariesForDeal ? TN.quotes.itinerariesForDeal(d.id) : (Array.isArray(D.itineraries) ? D.itineraries : Object.values(D.itineraries || {})).filter((x) => x.deal === d.id);
    const rows = itins.length ? itins.map((x) => ({ id: x.id, title: x.title || d.title, sub: x.final ? `Final PDF made ${TN.fmt.date(x.finalAt || x.updated || TN.TODAY)}` : `Started ${TN.fmt.date(x.created || TN.TODAY)} · no final document yet`, final: !!x.final }))
      : [];
    const list = rows.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Itineraries">${rows.map((r) => `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-3">${ic('map', 'size-4 shrink-0 text-brand-strong')}<span class="min-w-40 flex-1"><a class="rounded-chip text-brand-strong underline underline-offset-4 hover:text-brand-deep ${FOCUS} font-semibold" href="#/app/itineraries/${esc(r.id)}">${esc(r.title)}</a><span class="block text-sm text-quiet">${esc(r.sub)}</span></span>${r.final ? badge('success', 'circle-check', 'Final', '', true) : badge('neutral', 'clock', 'Draft', '', true)}</li>`).join('')}</ul>` : '<p class="m-0 text-quiet">No itinerary on this deal yet.</p>';
    const form = canEditBooking(d) ? `<form novalidate class="flex w-full flex-col gap-3" aria-label="Make branded itinerary" data-act="sales-new-itinerary" data-id="${d.id}"><div role="status" aria-live="polite"></div>${inputF('itin-create-title-deal', 'title', 'Itinerary title', d.title, { hint: 'Printed at the top of the itinerary.', max: 200 })}<div>${btn('Make branded itinerary', { type: 'submit' })}</div></form>` : '';
    const it = card(`<section aria-labelledby="itineraries-heading-deal">${cardHead('itineraries-heading-deal', 'Branded itineraries', { aside: '<p class="m-0 text-sm text-quiet basis-full">Day-by-day plan for the customer. Nothing is sent from here.</p>' })}<div class="px-4.5 py-4 flex flex-col gap-4">${list}${form}</div></section>`);
    return `<div class="flex min-w-0 flex-col gap-5">${q}${it}</div>`;
  }
  TN.act('sales-new-itinerary', (f) => { const v = formVals(f); if (!String(v.title || '').trim()) { TN.toast('Add an itinerary title first.', 'danger'); return; } TN.go(`/app/itineraries?deal=${f.dataset.id}&new=${encodeURIComponent(v.title.trim())}`); });

  /* ---------- Documents tab (live list) + pending Invoices and vouchers ---------- */
  function liveDocRows(d) {
    const rows = [];
    const money = TN.can('seeSellingPrice');
    if (money && d.quotation) rows.push(['quotation-acceptance-whatsapp.png', `Customer’s acceptance message · quotation ${d.quotation} version 1`, '2026-10-24 18:10']);
    if (submitted(d)) {
      for (let i = 1; i <= Math.min(d.adults, 4); i += 1) rows.push([`id-proof-traveller-${i}.jpg`, `ID proof · traveller ${i}`, (d.submittedAt || TN.TODAY) + ' 11:0' + i]);
      if (money) rows.push([`bill-to-${d.customer.replace('c-', '')}.pdf`, 'Booking version 1 · Bill To proof', (d.submittedAt || TN.TODAY) + ' 11:20']);
    }
    if (money && booked(d)) rows.push([`itinerary-${d.id}-final.pdf`, 'Itinerary PDF · Final', d.submittedAt + ' 15:40']);
    fullServices(d).forEach((s) => {
      if (DEPT_OF_ROLE[TN.role] && s.dept !== DEPT_OF_ROLE[TN.role]) return;
      if (s.confirmationNo) rows.push([`${s.confirmationNo.replace(/\//g, '-')}-confirmation.pdf`, 'Purchase file · Supplier confirmation', addDays(s.start, -12) + ' 14:15']);
      if (s.pnr) rows.push([`e-ticket-${s.pnr}.pdf`, 'Flight file · Ticket', '2026-10-26 17:40']);
    });
    return rows;
  }
  const DOC_WORD = { draft: ['neutral', 'clock', 'Draft'], waiting_accounts: ['warning', 'hourglass', 'Waiting for Accounts'], approved: ['success', 'circle-check', 'Approved by Accounts'], sent: ['success', 'send', 'Sent to the customer'] };
  function docsOf(d) {
    return D.documents.filter((x) => x.deal === d.id).filter((x) => {
      if (x.kind === 'Hotel voucher') return !DEPT_OF_ROLE[TN.role] || (TN.is('purchase') && TN.service(x.service) && TN.service(x.service).assignee === 'purchase');
      return TN.can('seeSellingPrice');
    });
  }
  function documentsTab(d) {
    const rows = liveDocRows(d);
    const live = card(`<section aria-labelledby="deal-documents-heading">${cardHead('deal-documents-heading', 'Documents')}${rows.length ? `<div class="px-4.5 py-4"><ul class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Documents you can open">${rows.map(([file, kind, at]) => `<li class="m-0 flex flex-wrap items-start gap-3 py-2.5 first:pt-0 last:pb-0">${ic('file-text', 'mt-0.5 size-4 shrink-0 text-brand-strong')}<span class="min-w-0 flex-1"><a href="#" data-act="sales-open-file" data-file="${esc(file)}" class="rounded-chip font-semibold wrap-anywhere text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep ${FOCUS}">${esc(file)}</a><span class="block text-sm text-quiet">${esc(kind)}</span></span><span class="text-sm text-quiet">Added ${TN.fmt.dateTime(at)}</span></li>`).join('')}</ul></div>` : emptyState('folder-open', 'No documents you can open yet', 'Files you can open on this deal show here after someone adds them.')}</section>`);
    const docs = docsOf(d);
    const sales = TN.is('sales', 'manager') && canEditBooking(d);
    const canAsk = sales && booked(d);
    if (!docs.length && !canAsk && !TN.can('accounts')) return `<div class="flex min-w-0 flex-col gap-5">${live}</div>`;
    const docRows = docs.map((x) => {
      const [tone, icon, word] = DOC_WORD[x.status];
      const s = x.service ? TN.service(x.service) : null;
      const sub = [x.kind, x.amount != null && TN.can('seeSellingPrice') ? rs(x.amount) : '', s ? s.title : '', TN.fmt.date(x.date)].filter(Boolean).join(' · ');
      const ready = x.status === 'approved' || x.status === 'sent';
      const acts = [btn(ready ? 'Download PDF' : 'View', { size: 'sm', icon: ready ? 'download' : null, act: 'sales-open-doc', attrs: ` data-id="${esc(x.id)}"`, sr: x.id })];
      if (sales && x.status === 'draft') acts.push(btn('Ask Accounts to approve', { size: 'sm', act: 'sales-doc-ask', attrs: ` data-id="${esc(x.id)}"` }));
      if (sales && x.status === 'approved') acts.push(btn('Mark as sent', { size: 'sm', variant: 'ghost', act: 'sales-doc-sent', attrs: ` data-id="${esc(x.id)}"` }));
      const by = x.status === 'sent' && x.sentBy ? `<span class="block text-sm text-quiet">Sent by ${esc(who(x.sentBy))}${x.approvedBy ? ` · approved by ${esc(who(x.approvedBy))}` : ''}</span>` : x.status === 'approved' && x.approvedBy ? `<span class="block text-sm text-quiet">Approved by ${esc(who(x.approvedBy))}</span>` : '';
      return `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-3">${ic(x.kind === 'Hotel voucher' ? 'hotel' : 'receipt', 'size-4 shrink-0 text-brand-strong')}<span class="min-w-40 flex-1"><span class="block font-semibold text-ink wrap-anywhere">${esc(x.kind === 'Hotel voucher' ? 'Voucher ' + x.id : x.id)}</span><span class="block text-sm text-quiet">${esc(sub)}</span>${by}</span>${badge(tone, icon, word, 'Document status:', true)}<span class="flex flex-wrap gap-2">${acts.join('')}</span></li>`;
    }).join('');
    const body = `${docs.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Invoices and vouchers">${docRows}</ul>` : '<p class="m-0 text-quiet">No invoice or voucher on this deal yet.</p>'}${canAsk ? `<div class="flex flex-wrap gap-2">${btn('Ask Accounts for an invoice', { act: 'sales-invoice-open', attrs: ` data-id="${d.id}"` })}</div>` : ''}${TN.can('accounts') ? `<div>${btn('Open Invoices and vouchers', { size: 'sm', href: '#/app/accounts/documents' })}</div>` : ''}${quietNote('info', 'Not a tax invoice. The tax invoice is issued from Tally. Accounts approves every document before it goes out; staff download it and send it to the customer themselves.', 'text-status-info')}`;
    const pending = sectionCard('deal-invoices-heading', 'Invoices and vouchers', body, { bodyCls: 'flex flex-col gap-4' });
    return `<div class="flex min-w-0 flex-col gap-5">${live}${pending}</div>`;
  }
  TN.act('sales-open-file', (el) => TN.toast(`Opening ${el.dataset.file}. The view is recorded.`));
  TN.act('sales-open-doc', (el) => { if (typeof TN.openDocument === 'function') TN.openDocument(el.dataset.id); else TN.toast(`Opening ${el.dataset.id} as a PDF.`); });
  TN.act('sales-doc-ask', (el) => {
    const x = D.documents.find((y) => y.id === el.dataset.id);
    x.status = 'waiting_accounts';
    pushNotice(['accounts', 'checker'], `${x.kind} ${x.id} for ${x.deal} waits for your approval.`, x.deal, '#/app/accounts/documents');
    TN.toast('Sent to Accounts for approval.');
    TN.refresh();
  });
  TN.act('sales-doc-sent', (el) => { const x = D.documents.find((y) => y.id === el.dataset.id); x.status = 'sent'; x.sentBy = me().key; TN.toast('Marked as sent to the customer.'); TN.refresh(); });
  function nextDocNo(advance) {
    const rx = advance ? /^HC\/JDH\/ADV\/26-27\/(\d+)$/ : /^HC\/JDH\/26-27\/(\d+)$/;
    const n = Math.max(0, ...D.documents.map((x) => (x.id.match(rx) || [0, 0])[1]).map(Number)) + 1;
    return (advance ? 'HC/JDH/ADV/26-27/' : 'HC/JDH/26-27/') + String(n).padStart(4, '0');
  }
  function invoiceForm(d, v = {}, errs = {}, top) {
    const list = Object.entries(errs);
    const paidChecked = verifiedSum(d.id);
    const body = `<form novalidate id="sales-invoice-form" class="flex flex-col gap-4" data-act="sales-invoice-submit" data-id="${d.id}">${top || (list.length ? errorSummary('The request was not sent.', list) : '')}${selectF('inv-kind', 'kind', 'Which document', v.kind || 'Invoice', [['Invoice', 'Invoice for the full trip'], ['Advance Invoice', 'Advance Invoice for money received']])}${inputF('inv-amount', 'amount', 'Amount ₹', v.amount ?? '', { money: true, inputmode: 'decimal', error: errs['inv-amount'], hint: `Invoice: the selling total ${rs(d.sellingPrice)}. Advance Invoice: money checked by Accounts so far is ${rs(paidChecked)}.` })}${textareaF('inv-note', 'note', 'Note for Accounts', v.note, { optional: true, rows: 2 })}${notice('info', '<p>Accounts checks the Bill To and the amount, then approves it. The number is given when Accounts approves (for example HC/JDH/26-27/0044).</p>')}</form>`;
    return { title: 'Ask Accounts for an invoice', description: `${d.id} · ${d.title}`, body, footer: `<div class="flex flex-wrap gap-2">${btn('Send to Accounts', { variant: 'primary', type: 'submit', attrs: ' form="sales-invoice-form"' })}${btn('Cancel', { attrs: ' data-close' })}</div>` };
  }
  TN.act('sales-invoice-open', (el) => { const d = TN.deal(el.dataset.id); openDrawer(invoiceForm(d, { amount: String(d.sellingPrice) })); });
  TN.act('sales-invoice-submit', (f) => {
    const d = TN.deal(f.dataset.id), v = formVals(f), errs = {};
    const advance = v.kind === 'Advance Invoice';
    const n = toNum(v.amount);
    if (!(n > 0)) errs['inv-amount'] = 'Amount: write the amount in rupees';
    else if (n > d.sellingPrice) errs['inv-amount'] = `Amount: it cannot be more than the selling total ${rs(d.sellingPrice)}`;
    else if (advance && n > verifiedSum(d.id)) errs['inv-amount'] = `Amount: an Advance Invoice covers money already checked by Accounts (${rs(verifiedSum(d.id))})`;
    if (Object.keys(errs).length) { openDrawer(invoiceForm(d, v, errs)); return; }
    if (D.documents.some((x) => x.deal === d.id && x.kind === v.kind && x.status === 'waiting_accounts')) {
      openDrawer(invoiceForm(d, v, {}, errorSummary(`An ${v.kind === 'Invoice' ? 'Invoice' : 'Advance Invoice'} for this deal already waits for Accounts. Ask Accounts before sending another.`, [])));
      return;
    }
    const id = nextDocNo(advance);
    D.documents.unshift({ id, deal: d.id, kind: v.kind, amount: n, date: TN.TODAY, status: 'waiting_accounts', note: v.note });
    pushNotice(['accounts', 'checker'], `${v.kind} asked for ${d.id} (${d.title}): ${TN.fmt.inr(n)}. Check and approve.`, d.id, '#/app/accounts/documents');
    TN.closeOverlay();
    TN.toast(`${v.kind} sent to Accounts for approval.`);
    TN.refresh();
  });

  /* ---------- Money tab (live sections + pending dues, receipts, report a payment) ---------- */
  const MODE = { 'Bank transfer': 'Bank transfer', UPI: 'UPI', Cash: 'Cash', Cheque: 'Cheque' };
  function claimStatus(r) {
    if (r.status === 'reported') return 'reported';
    if (r.status === 'not_received') return 'not_received';
    if (r.status === 'withdrawn') return 'withdrawn';
    const rc = D.receipts.find((x) => x.id === r.receipt);
    if (!rc) return 'recorded';
    if (rc.cheque === 'waiting_clearance') return 'pending_clearance';
    return rc.status === 'verified' ? 'verified' : rc.status === 'reversed' ? 'reversed' : 'recorded';
  }
  const CLAIM = {
    reported: ['warning', 'triangle-alert', 'Reported, not checked yet', 'Reported by Sales: record or link the receipt'],
    recorded: ['info', 'info', 'Receipt recorded, waiting for a second Accounts check', 'Receipt recorded, awaiting verification'],
    verified: ['success', 'circle-check', 'Checked by Accounts', 'Verified'],
    pending_clearance: ['info', 'info', 'Cheque waiting for bank clearance (not counted yet)', 'Cheque awaiting bank clearance'],
    reversed: ['danger', 'circle-x', 'Payment reversed by Accounts', 'Receipt reversed'],
    not_received: ['danger', 'circle-x', 'Accounts did not find this money', 'Money not found'],
    withdrawn: ['neutral', 'clock', 'Withdrawn by Sales', 'Withdrawn by Sales'],
  };
  const claimPill = (st) => { const c = CLAIM[st]; return badge(c[0], c[1], TN.can('accounts') ? c[3] : c[2], 'Payment status:', true); };
  function instWord(i) {
    if (i.status === 'paid') return ['success', 'circle-check', 'Paid'];
    if (i.status === 'overdue') { const days = -TN.fmt.daysFrom(i.due); return ['danger', 'circle-alert', `Overdue · ${TN.fmt.plural(days, 'day')}${i.paid ? ' · part paid' : ''}`]; }
    if (i.status === 'part_paid' || i.paid > 0) return ['warning', 'triangle-alert', 'Part paid'];
    const n = TN.fmt.daysFrom(i.due);
    return ['neutral', 'clock', n === 0 ? 'Due today' : `Due in ${TN.fmt.plural(n, 'day')}`];
  }
  function duesSection(d) {
    const insts = instOf(d.id);
    if (!insts.length) return '';
    const total = insts.reduce((a, i) => a + i.amount, 0), paid = insts.reduce((a, i) => a + i.paid, 0);
    const overdue = insts.filter((i) => i.status === 'overdue').reduce((a, i) => a + i.amount - i.paid, 0);
    const rows = insts.map((i) => {
      const [tone, icon, word] = instWord(i);
      return `<tr role="row" class="${TR}">${td('Instalment', `<span class="font-semibold text-ink">${esc(i.label)}</span>`)}${td('Due', TN.fmt.date(i.due), 'whitespace-nowrap')}${td('Amount', amount(rs(i.amount)), 'tabular-nums')}${td('Paid', amount(rs(i.paid)), 'tabular-nums')}${td('Status', badge(tone, icon, word, 'Instalment status:', true))}</tr>`;
    }).join('');
    const table = `<div class="rounded-card border border-line bg-card font-sans text-base text-copy" data-slot="card"><div class="group/table relative w-full overflow-x-auto ${FOCUS} rounded-card" data-stack="true" role="region" aria-label="Customer dues" tabindex="0"><table role="table" class="w-full border-collapse bg-transparent font-sans text-base text-copy group-data-[stack=true]/table:max-sm:block"><caption class="px-4.5 py-2 text-left text-sm font-normal text-quiet caption-bottom sr-only">Customer dues by instalment</caption><thead role="rowgroup" class="group-data-[stack=true]/table:max-sm:sr-only"><tr role="row" class="${TR_HEAD}">${['Instalment', 'Due', 'Amount', 'Paid', 'Status'].map((h) => `<th scope="col" role="columnheader" class="${TH}">${h}</th>`).join('')}</tr></thead><tbody role="rowgroup" class="group-data-[stack=true]/table:max-sm:block">${rows}</tbody></table></div></div>`;
    const owner = TN.person(d.owner);
    const chaser = isMe(d.owner) ? 'You chase' : `${esc(owner.name)} (Sales owner) chases`;
    return `<section aria-labelledby="money-dues" class="flex flex-col gap-2">${subHeading('money-dues', 'Customer dues')}${table}${summaryList([
      ['Paid so far', amount(rs(paid)), { numeric: true }],
      overdue ? ['Overdue now', amount(rs(overdue)), { numeric: true }] : null,
      ['Still due', amount(rs(total - paid)), { numeric: true, total: true }],
    ])}${quietNote('user-round', `<span class="font-semibold text-ink">Follow-up:</span> ${chaser} unpaid instalments. Accounts sees the same list. The branch Manager is told when an instalment is 3 days overdue.`)}</section>`;
  }
  function moneyTab(d) {
    if (d.sellingPrice == null) {
      return sectionCard('deal-money-heading', 'Money', '<p class="m-0 text-copy">No money recorded on this deal yet. The selling total shows here once the booking has a price.</p><p class="m-0 text-sm text-quiet">Receipts and cheques are handled by Accounts and are not listed here.</p>', { bodyCls: 'flex flex-col gap-6' });
    }
    const insts = instOf(d.id);
    const plan = insts.length ? `<ul class="m-0 flex list-none flex-col gap-1 p-0">${insts.map((p) => `<li class="m-0 flex flex-wrap justify-between gap-x-3"><span>${esc(p.label)}<span class="text-sm text-quiet"> · due ${TN.fmt.date(p.due)}</span></span>${amount(rs(p.amount))}</li>`).join('')}</ul>` : notEntered();
    const booking = `<section aria-labelledby="money-booking" class="flex flex-col gap-2">${subHeading('money-booking', 'Booking')}${summaryList([['Final selling total', amount(rs(d.sellingPrice)), { numeric: true }], ['Payment plan', plan]])}</section>`;
    const reports = D.paymentReports.filter((r) => r.deal === d.id && r.status !== 'withdrawn');
    const reported = reports.filter((r) => claimStatus(r) === 'reported').reduce((a, r) => a + r.amount, 0);
    const checked = verifiedSum(d.id);
    const canReport = TN.is('sales', 'manager') && canEditBooking(d) && submitted(d);
    const claims = `<section aria-labelledby="money-claims" class="flex flex-col gap-2">${subHeading('money-claims', 'Payments the customer told you about')}${summaryList([
      ['Reported, not checked (not money)', amount(rs(reported)), { numeric: true }],
      ['Checked by Accounts', amount(rs(checked)), { numeric: true }],
      ['Still to pay (based on checked money)', amount(rs(d.sellingPrice - checked)), { numeric: true, total: true }],
    ])}<h4 class="m-0 mt-2.5 text-sm font-semibold text-ink">Reported payments on this deal</h4>${reports.length ? `<ul class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Reported payments on this deal">${reports.map((r) => `<li class="m-0 flex flex-wrap items-center justify-between gap-2 py-2"><span>${amount(rs(r.amount))}<span class="text-sm text-quiet"> · ${MODE[r.mode] || r.mode} · paid ${TN.fmt.date(r.date)}</span></span>${claimPill(claimStatus(r))}</li>`).join('')}</ul>` : '<p class="m-0 text-quiet">No payment reported on this deal yet.</p>'}${canReport ? `<div>${btn('Report a payment', { act: 'sales-report-open', attrs: ` data-id="${d.id}"` })}</div>` : ''}</section>`;
    const recs = receiptsOf(d.id).filter((r) => TN.can('accounts') || r.status === 'verified');
    const receipts = `<section aria-labelledby="money-receipts" class="flex flex-col gap-2">${subHeading('money-receipts', TN.can('accounts') ? 'Receipts' : 'Receipts checked by Accounts')}${recs.length ? `<ul class="m-0 flex list-none flex-col divide-y divide-line p-0" aria-label="Receipts on this deal">${recs.map((r) => `<li class="m-0 flex flex-wrap items-center justify-between gap-2 py-2"><span>${amount(rs(r.amount))}<span class="text-sm text-quiet"> · ${esc(r.mode)} · received ${TN.fmt.date(r.date)} · ${esc(r.id)}</span>${TN.can('accounts') ? `<span class="block text-sm text-quiet">${esc(r.ref)} · into ${esc(r.to)} · recorded by ${esc(who(r.recordedBy))}${r.verifiedBy ? ', verified by ' + esc(who(r.verifiedBy)) : ''}</span>` : ''}</span>${r.status === 'verified' ? badge('success', 'circle-check', TN.can('accounts') ? 'Verified' : 'Checked by Accounts', 'Receipt status:', true) : r.cheque === 'waiting_clearance' ? badge('info', 'info', 'Cheque awaiting bank clearance', 'Receipt status:', true) : badge('info', 'info', 'Recorded, awaiting verification', 'Receipt status:', true)}</li>`).join('')}</ul>` : '<p class="m-0 text-quiet">No receipt checked by Accounts yet.</p>'}${TN.can('accounts') ? `<div>${btn('Open in Accounts', { size: 'sm', href: `#/app/accounts/deals/${d.id}` })}</div>` : ''}</section>`;
    const versions = submitted(d) ? `<section aria-labelledby="money-versions" class="flex flex-col gap-2">${subHeading('money-versions', 'Selling total by booking version')}${summaryList([['Version 1', amount(rs(d.sellingPrice)), { numeric: true }]])}</section>` : '';
    const foot = `<p class="m-0 text-sm text-quiet">${TN.can('accounts') ? 'Receipts are recorded and verified on the Accounts deal page.' : 'Only receipts checked by a second Accounts person are listed. Accounts records receipts and cheques; payment proof stays with Accounts.'}</p>`;
    return sectionCard('deal-money-heading', 'Money', booking + duesSection(d) + claims + receipts + versions + foot, { bodyCls: 'flex flex-col gap-6' });
  }
  const ACCOUNTS = [['', 'Choose the account'], ['hdfc', 'HDFC Bank •••• 4417'], ['upi', 'UPI holidaychacha@hdfcbank'], ['cash', 'Jodhpur branch cash']];
  function reportForm(d, v = {}, errs = {}, title) {
    const list = Object.entries(errs);
    const body = `<form novalidate id="sales-report-form" aria-label="Tell Accounts about a payment" class="flex flex-col gap-3" data-act="sales-report-submit" data-id="${d.id}">${list.length || title ? errorSummary(title || 'The payment was not reported.', list) : ''}${notice('info', '<p>Reported by Sales. Not money until a receipt is recorded and checked by a second Accounts person.</p><p>No advance is required. A Bitrix stage does not prove payment.</p>')}${fieldset('What the customer says they paid', `<div class="grid gap-4">${selectF('bk-claim-mode', 'mode', 'How they paid', v.mode || 'Bank transfer', [['Bank transfer', 'Bank transfer'], ['UPI', 'UPI'], ['Cash', 'Cash'], ['Cheque', 'Cheque']])}${inputF('bk-claim-amount', 'amount', 'Amount ₹', v.amount, { money: true, inputmode: 'decimal', error: errs['bk-claim-amount'] })}${inputF('bk-claim-paid-on', 'paidOn', 'Paid on', v.paidOn, { type: 'date', error: errs['bk-claim-paid-on'] })}${inputF('bk-claim-payer', 'payer', 'Paid by', v.payer ?? TN.customer(d.customer).name, { max: 200, error: errs['bk-claim-payer'] })}${inputF('bk-claim-reference', 'ref', 'Reference or UTR', v.ref, { max: 40, hint: 'Identifies the payment. It is not proof that money arrived.', error: errs['bk-claim-reference'] })}${selectF('bk-claim-destination', 'account', 'Company account that received it', v.account, ACCOUNTS, { error: errs['bk-claim-destination'] })}${textareaF('bk-claim-note', 'note', 'Note for Accounts', v.note, { optional: true, rows: 2, span: true })}</div>`)}</form>`;
    return { title: 'Report a payment', description: `${d.id} · ${d.title}`, body, footer: `<div class="flex flex-wrap gap-2">${btn('Send to Accounts', { variant: 'primary', type: 'submit', attrs: ' form="sales-report-form"' })}${btn('Cancel', { attrs: ' data-close' })}</div>` };
  }
  TN.act('sales-report-open', (el) => openDrawer(reportForm(TN.deal(el.dataset.id))));
  TN.act('sales-report-submit', (f) => {
    const d = TN.deal(f.dataset.id), v = formVals(f), errs = {};
    const n = toNum(v.amount);
    if (!(n > 0)) errs['bk-claim-amount'] = 'Amount: write the amount in rupees, for example 25000';
    if (!v.paidOn) errs['bk-claim-paid-on'] = 'Paid on: choose the date';
    else if (v.paidOn > TN.TODAY) errs['bk-claim-paid-on'] = 'Paid on: the date cannot be in the future';
    if (!String(v.payer || '').trim()) errs['bk-claim-payer'] = 'Paid by: write the payer’s name';
    if (!/^[A-Za-z0-9/ -]{6,40}$/.test(String(v.ref || '').trim())) errs['bk-claim-reference'] = 'Reference or UTR: 6 to 40 letters, digits, / or -';
    if (!v.account) errs['bk-claim-destination'] = 'Company account that received it: choose the account';
    if (Object.keys(errs).length) { openDrawer(reportForm(d, v, errs)); return; }
    const ref = v.ref.trim();
    if (D.paymentReports.some((r) => r.deal === d.id && r.ref.replace(/\D/g, '') === ref.replace(/\D/g, '') && r.status !== 'withdrawn')) {
      openDrawer(reportForm(d, v, { 'bk-claim-reference': 'Reference or UTR: already reported on this deal' }, 'This payment reference is already reported on this deal. Check the payments listed below before reporting it again.'));
      return;
    }
    const id = 'PR-' + String(Math.max(...D.paymentReports.map((r) => Number(r.id.slice(3)))) + 1).padStart(4, '0');
    D.paymentReports.unshift({ id, deal: d.id, mode: v.mode, amount: n, date: v.paidOn, ref, status: 'reported', by: me().key, payer: v.payer.trim(), account: v.account, note: v.note });
    pushNotice(['accounts', 'checker'], `Payment reported on ${d.id}: ${TN.fmt.inr(n)} by ${v.mode} (${TN.customer(d.customer).name}). Record or link the receipt.`, d.id, '#/app/accounts/claims');
    TN.closeOverlay();
    TN.toast('Sent to Accounts. It is not money until Accounts checks it.');
    TN.refresh();
  });

  /* ---------- History tab (money-free) ---------- */
  function historyTab(d) {
    const groups = [];
    const bk = [];
    const sub = d.submittedAt ? d.submittedAt + ' 15:30' : null;
    if (d.accountsReview === 'approved') bk.push({ icon: 'circle-check', title: 'Version 1: Approved by Accounts', when: TN.fmt.dateTime(addDays(d.submittedAt, 1) + ' 11:45') });
    if (d.accountsReview === 'returned') bk.push({ icon: 'undo-2', title: 'Version 1: Returned by Accounts', when: TN.fmt.dateTime(d.returnedAt || '2026-10-25 12:30'), note: DEPT_OF_ROLE[TN.role] ? '' : `Reason: ${esc(d.returnReason)}` });
    if (sub) bk.push({ icon: 'file-text', title: 'Booking version 1: Submitted', when: TN.fmt.dateTime(sub) });
    else if (d.bookingState === 'in_progress' || d.bookingState === 'ready_to_submit') bk.push({ icon: 'file-text', title: 'Booking version 1: Draft', when: 'Time not recorded' });
    if (bk.length) groups.push(['history-booking', 'Booking versions and Accounts reviews', bk]);
    if (TN.can('seeQuotations') && d.quotation) groups.push(['history-quotations', 'Quotations', [{ icon: 'send', title: `<a class="${LINK}" href="#/app/quotations/${d.quotation}">Quotation ${d.quotation} version 1: Accepted by customer</a>`, when: TN.fmt.dateTime('2026-10-24 18:10') }]]);
    const ch = [
      ...D.cancellations.filter((c) => c.deal === d.id).map((c) => ({ icon: 'circle-x', title: `${esc(c.kind)}: ${esc(CANCEL_WORD[c.status][2])}`, when: TN.fmt.date(c.at) })),
      ...D.changes.filter((c) => c.deal === d.id).map((c) => ({ icon: 'file-pen', title: `Change asked: ${esc(c.kind)} · ${esc((CHANGE_WORD[c.status] || CHANGE_WORD.waiting_customer)[2])}`, when: TN.fmt.date(c.at) })),
    ];
    if (ch.length) groups.push(['history-changes', 'Changes and cancellations', ch]);
    if (TN.can('seeCustomerPayments')) {
      const p = D.paymentReports.filter((r) => r.deal === d.id).map((r) => ({ icon: 'banknote', title: `Payment reported: ${CLAIM[claimStatus(r)][2]}`, when: TN.fmt.dateTime(r.date + ' 12:00') }));
      if (p.length) groups.push(['history-payments', 'Reported payments', p]);
    }
    const body = groups.length ? `<p class="m-0 text-sm text-quiet">Each group lists its newest event first.</p>${groups.map(([id, t, ev]) => `<section aria-labelledby="${id}" class="flex flex-col gap-3">${subHeading(id, t)}${timeline(t, ev)}</section>`).join('')}` : '<p class="m-0 text-copy">Nothing has happened on this deal yet.</p>';
    return sectionCard('deal-history-heading', 'History', body, { bodyCls: 'flex flex-col gap-5', aside: ic('rotate-ccw-clock', 'lucide-history size-4 text-faint') });
  }

  /* ---------- Route ---------- */
  function dealNotFound() {
    return `<div class="font-sans text-base text-copy"><header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl">Deal not available</h1></div></header>${card(`<div class="flex items-start gap-3 px-4.5 py-4"><span aria-hidden="true" class="grid size-9 shrink-0 place-items-center rounded-control bg-brand-tint text-brand">${ic('file-question-mark', 'size-4.5')}</span><p class="m-0 self-center text-copy">This deal does not exist, or it is not visible to you.</p></div>`, { role: 'status' })}<p class="m-0 mt-4">${btn('Back to deals', { href: '#/app/deals', icon: 'chevron-left' })}</p></div>`;
  }
  TN.page('/app/deals/:id', {
    nav: '/app/deals', title: (p) => p.id,
    canOpen: (p) => { const d = TN.deal(p.id); return !!(d && relation(d, false)); },
    render(p, q) {
      const d = TN.deal(p.id);
      if (!d || !relation(d, false)) return dealNotFound();
      const vis = visibleTabs();
      const tab = vis.includes(q.tab) ? q.tab : 'overview';
      const tabs = tabsNav('Deal sections', vis.map((t) => ({ label: TAB_LABEL[t], href: dealHref(d.id, t), current: t === tab })));
      const body = { overview: overviewTab, services: servicesTab, quotations: quotationsTab, documents: documentsTab, money: moneyTab, history: historyTab }[tab](d);
      return `<div class="font-sans text-base text-copy">${backLink('#/app/deals', 'Back to deals')}${dealHeader(d)}${tabs}${body}</div>`;
    },
  });

  /* ---------- Home "What needs you" rows (Sales and Manager) ---------- */
  const mineOrBranch = () => D.deals.filter((d) => (TN.is('manager') ? true : d.owner === me().key));
  TN.homeRow({ roles: ['sales', 'manager'], section: 'What needs you', label: 'Customer payments overdue', href: '#/app/deals?filter=overdue', count: () => mineOrBranch().filter((d) => overdueOf(d.id).length).length });
  TN.homeRow({ roles: ['sales', 'manager'], section: 'What needs you', label: 'Changes waiting for the customer', href: '#/app/deals?filter=changes', count: () => mineOrBranch().filter((d) => D.changes.some((c) => c.deal === d.id && c.status === 'waiting_customer')).length });
})();
