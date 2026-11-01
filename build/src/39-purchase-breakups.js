/* =====================================================================
   39-purchase-breakups.js · Purchase data extension (1 Nov 2026)
   What Sales entered in Book now for each hotel, line by line: room type,
   number of rooms × our cost per room per night, extra beds × rate and
   guests without a bed × rate. Nights come from the service dates.
   These rates are Sales' cost estimate (the budget), never the selling
   price, so Purchase may see them. All figures are invented.
   Total = nights × (rooms × room rate + extra beds × rate + no-bed × rate),
   exactly as Book now adds it up; every total below equals the budget.
   Services without an entry (the Singapore package) show
   "Sales did not give a room breakup".
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const line = (room, rooms, roomRate, extra = 0, extraRate = null, nobed = 0, nobedRate = null) => ({ room, rooms, roomRate, extra, extraRate, nobed, nobedRate });
  D.hotelBreakups = D.hotelBreakups || {
    // 2 nights × (8 × ₹13,000 + 1 × ₹14,000) = ₹2,36,000
    's-547-h': [line('Deluxe twin room', 8, 13000), line('Suite, twin sharing', 1, 14000)],
    // 4 nights × (₹16,500 + child without a bed ₹1,500) = ₹72,000
    's-412-h': [line('Deluxe garden view room', 1, 16500, 0, null, 1, 1500)],
    's-455-h1': [line('Premium room', 1, 16000)],
    's-455-h2': [line('Cottage', 1, 18000)],
    's-455-h3': [line('1 bedroom premium houseboat', 1, 15000)],
    // 5 nights × (family room ₹20,600 + extra bed ₹3,000) = ₹1,18,000
    's-390-h': [line('Family room', 1, 20600, 1, 3000)],
    's-377-h1': [line('Deluxe room', 2, 9000)],
    's-377-h2': [line('Deluxe room', 2, 9500)],
    's-264-h1': [line('Ganga view room', 3, 8000)],
    's-264-h2': [line('Deluxe room', 2, 8500), line('Deluxe valley view room', 1, 9000)],
    's-520-h': [line('Lake view room', 1, 19600)],
    // 3 nights × (2 × ₹6,800 + extra bed for the child ₹1,500) = ₹45,300
    's-198-h1': [line('Deluxe room', 2, 6800, 1, 1500)],
    // 3 nights × (2 × ₹9,000 + extra bed for the child ₹1,300) = ₹57,900
    's-198-h2': [line('Cottage', 2, 9000, 1, 1300)],
  };
  // Two budgets were not whole rupees per night; Sales' budget is the breakup total.
  if (D.services['s-198-h1'] && D.services['s-198-h1'].budget === 46000) D.services['s-198-h1'].budget = 45300;
  if (D.services['s-198-h2'] && D.services['s-198-h2'].budget === 58000) D.services['s-198-h2'].budget = 57900;

  const nightsOf = (s) => Math.max(1, Math.round((Date.parse(s.end) - Date.parse(s.start)) / 86400000));
  /** The breakup of a hotel service, with totals; null when Sales gave none. */
  TN.hotelBreakup = (id) => {
    const s = D.services[id];
    const lines = D.hotelBreakups[id];
    if (!s || !lines || !lines.length) return null;
    const nights = nightsOf(s);
    const rows = [];
    lines.forEach((l) => {
      if (l.rooms > 0) rows.push({ kind: 'room', label: l.room, qty: l.rooms, rate: l.roomRate, nights, total: l.rooms * l.roomRate * nights });
      if (l.extra > 0) rows.push({ kind: 'extra', label: `Extra bed (${l.room})`, qty: l.extra, rate: l.extraRate, nights, total: l.extra * l.extraRate * nights });
      if (l.nobed > 0) rows.push({ kind: 'nobed', label: `Guest without a bed (${l.room})`, qty: l.nobed, rate: l.nobedRate, nights, total: l.nobed * l.nobedRate * nights });
    });
    return {
      nights, rows, lines,
      rooms: lines.reduce((n, l) => n + (l.rooms || 0), 0),
      extra: lines.reduce((n, l) => n + (l.extra || 0), 0),
      nobed: lines.reduce((n, l) => n + (l.nobed || 0), 0),
      perNight: rows.reduce((n, r) => n + r.qty * r.rate, 0),
      total: rows.reduce((n, r) => n + r.total, 0),
    };
  };
})();
