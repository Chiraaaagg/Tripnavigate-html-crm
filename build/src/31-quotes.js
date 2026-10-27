/* =====================================================================
   31-quotes.js · Quotations, itineraries and referral drafts (Agent C)
   Live today: quotations (list, version page, customer copy, new),
   branded itineraries (list, editor, customer copy, PDF), referral drafts
   (built and live, but the referral_drafts switch is Off today: shown here
   as they work once it is switched On).
   Markup copied from the live gallery captures b3-quotations-*, b12-quote-*,
   b3-new-quotation-*, b3-itineraries-*, b12-itin-*, b3-draft-* via TN.ui.
   Customer messages are later: staff open the customer copy or the PDF and
   send it themselves, then press "Mark as shared".
   ===================================================================== */
(function () {
  const U = TN.ui, E = TN.esc, FO = U.FOCUS;
  /* Quotations print whole rupees (live quote views), so a local formatter. */
  const INR0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
  const F = Object.assign({}, TN.fmt, { inr: (n) => (n == null || n === '' ? '—' : '₹' + INR0.format(Number(n))) });
  const A_TITLE = `rounded-chip font-semibold text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 ${FO} wrap-anywhere`;
  const A_SUBJ = `rounded-chip text-brand-strong underline decoration-1 underline-offset-4 hover:text-brand-deep hover:decoration-2 ${FO} font-medium wrap-anywhere`;
  const A_INL = `rounded-chip font-medium text-brand-strong underline underline-offset-4 hover:text-brand-deep ${FO}`;
  const SEG_ON = `inline-flex min-h-11 items-center rounded-control px-3.5 font-medium no-underline bg-card text-ink shadow-card ${FO}`;
  const SEG_OFF = `inline-flex min-h-11 items-center rounded-control px-3.5 font-medium no-underline text-copy hover:text-ink ${FO}`;
  const ROW_BTN = U.buttonClass('secondary', 'sm', 'max-sm:h-11 max-sm:px-3.5');
  const BIG_BTN = (v) => U.buttonClass(v, 'lg', 'min-h-11');
  const SAVE_BTN = U.buttonClass('secondary', 'lg', 'h-auto min-h-11 py-2 whitespace-normal');
  const now = () => { const d = new Date(); return TN.TODAY + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  const me = () => TN.me().key;
  const personName = (k) => (k === me() ? 'You' : (TN.person(k) || {}).name || '—');
  const ownerText = (k) => (k === me() ? 'you' : (TN.person(k) || {}).name || '—');
  const iso = (d, n) => { const t = new Date(d + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const nightsOf = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
  const upd = (s) => { if (!s) return '—'; const [d, t] = s.split(' '); if (d === TN.TODAY) return 'Today' + (t ? ', ' + t : ''); if (d === iso(TN.TODAY, -1)) return 'Yesterday'; return F.date(d); };
  const pl = F.plural;
  const ISO_DASH = (d) => d; // the customer copy prints ISO dates, as live

  /* ---------- Invented quotations ---------- */
  const hotel = (o) => ({ kind: 'hotel', rooms: 1, ...o });
  const Q = [
    { id: 'Q-2610-014', title: 'Bali honeymoon for Sneha and Karan', subject: { kind: 'deal', ref: 'BX-38560' }, deal: 'BX-38560', lead: null, owner: 'sales',
      customer: { name: 'Sneha Rathi', mobile: '+91 99503 21874', email: 'sneha.rathi@gmail.com', company: '' },
      trip: { dest: 'Ubud and Seminyak, Bali', scope: 'International', start: '2027-01-09', end: '2027-01-14', adults: 2, cwb: 0, cnb: 0, infants: 0, asked: 'Quiet villa in Ubud first, then the beach. One island day. Honeymoon.' },
      services: [
        hotel({ name: 'Komaneka at Bisma', city: 'Ubud', checkin: '2027-01-09', checkout: '2027-01-11', room: 'Deluxe room', meal: 'Breakfast', tier: 'quoted', star: '5 star, river valley view' }),
        hotel({ name: 'Alila Seminyak', city: 'Seminyak', checkin: '2027-01-11', checkout: '2027-01-14', room: 'Deluxe suite', meal: 'Breakfast', tier: 'quoted', star: '5 star, on the beach' }),
        hotel({ name: 'Mandapa, a Ritz-Carlton Reserve', city: 'Ubud', checkin: '2027-01-09', checkout: '2027-01-11', room: 'Reserve suite', meal: 'Breakfast', tier: 'upgrade' }),
        hotel({ name: 'The Legian Seminyak', city: 'Seminyak', checkin: '2027-01-11', checkout: '2027-01-14', room: 'Deluxe studio', meal: 'Breakfast', tier: 'upgrade' }),
        { kind: 'transfer', text: 'Bali airport (DPS) to Komaneka at Bisma', date: '2027-01-09', vehicle: 'Private car' },
        { kind: 'activity', name: 'Nusa Penida day trip with snorkelling', city: 'Seminyak', date: '2027-01-12' },
        { kind: 'visa', country: 'Indonesia', purpose: 'Tourism' },
      ],
      days: [['Arrive in Bali', 'Ubud', 'Private transfer to Ubud; evening at leisure.'], ['Rice terraces and the palace', 'Ubud', 'Tegallalang rice terraces and Ubud palace with the driver.'], ['To the coast', 'Seminyak', 'Drive to Seminyak with a stop at Tanah Lot for sunset.'], ['Nusa Penida', 'Seminyak', 'Fast boat to the island; snorkelling at Crystal Bay.'], ['Beach day', 'Seminyak', 'Time for the spa, shopping and the beach.'], ['Fly home', 'Seminyak', 'Transfer to the airport.']],
      included: ['Daily breakfast', 'Private car with driver for transfers and sightseeing', 'Nusa Penida day trip with snorkelling', 'Indonesia visa on arrival assistance'],
      excluded: ['Flights', 'Travel insurance', 'Lunches and dinners'],
      terms: ['Hotels are held only after confirmation.', 'Visa on arrival is decided by Indonesian immigration.'],
      tiers: {
        quoted: { name: 'Deluxe rooms', total: 120000, perPerson: true, plan: [['Advance', 40000, 'On confirmation'], ['Balance', 80000, '21 days before departure']], lines: [
          { d: 'Komaneka at Bisma · Deluxe room', u: 'room', q: 1, n: 2, p: 14500, c: 11800 }, { d: 'Alila Seminyak · Deluxe suite', u: 'room', q: 1, n: 3, p: 16800, c: 13600 },
          { d: 'Private car with driver, airport and 3 sightseeing days', u: 'trip', q: 1, n: 4, p: 4200, c: 3300 }, { d: 'Nusa Penida day trip with snorkelling', u: 'line', p: 14800, c: 11600 }, { d: 'Indonesia visa on arrival assistance', u: 'line', p: 9000, c: 7200 }] },
        upgrade: { name: 'Luxury suites', total: 210000, perPerson: true, plan: [], lines: [
          { d: 'Mandapa, a Ritz-Carlton Reserve · Reserve suite', u: 'room', q: 1, n: 2, p: 42000, c: 35500 }, { d: 'The Legian Seminyak · Deluxe studio', u: 'room', q: 1, n: 3, p: 28500, c: 23800 },
          { d: 'Private car with driver, airport and 3 sightseeing days', u: 'trip', q: 1, n: 4, p: 4200, c: 3300 }, { d: 'Nusa Penida day trip with snorkelling', u: 'line', p: 14800, c: 11600 }, { d: 'Indonesia visa on arrival assistance', u: 'line', p: 9000, c: 7200 }] },
      },
      versions: [{ n: 1, status: 'superseded', made: '2026-10-14', sentAt: '2026-10-14', via: 'WhatsApp', validUntil: '2026-10-21' }, { n: 2, status: 'accepted', made: '2026-10-18', sentAt: '2026-10-18', via: 'WhatsApp', validUntil: '2026-10-25', changed: 'Suites added as an upgrade option' }],
      accepted: { tier: 'quoted', file: 'Sneha-Rathi-WhatsApp-yes-v2.png', size: '186 KB', at: '2026-10-21' }, converted: false, updated: '2026-10-21 16:40',
      /* What "Start booking from this quotation" copies into the booking draft (accepted option, our cost per night). */
      items: [{ kind: 'hotel', city: 'Ubud', name: 'Komaneka at Bisma', checkin: '2027-01-09', nights: 2, room: 'Deluxe room', meal: 'Breakfast', rooms: 1, rate: 11800 },
        { kind: 'hotel', city: 'Seminyak', name: 'Alila Seminyak', checkin: '2027-01-11', nights: 3, room: 'Deluxe suite', meal: 'Breakfast', rooms: 1, rate: 13600 },
        { kind: 'transfer', carKind: 'full', vehicle: 'Sedan', route: 'Bali airport – Ubud – Seminyak – Bali airport, 3 sightseeing days', date: '2027-01-09', end: '2027-01-14', rate: 13200 },
        { kind: 'activity', name: 'Nusa Penida day trip with snorkelling', city: 'Seminyak', date: '2027-01-12' },
        { kind: 'visa', country: 'Indonesia' }],
      prices: { adult: { p: 48200, m: 11800, f: 60000 } } },

    { id: 'Q-2610-021', title: 'Andaman family trip for Christmas', subject: { kind: 'lead', ref: 'L-61187' }, deal: null, lead: 'L-61187', owner: 'sales',
      customer: { name: 'Manish Kalla', mobile: '+91 99291 40571', email: 'manish.kalla@gmail.com', company: '' },
      trip: { dest: 'Port Blair and Havelock, Andaman', scope: 'Domestic', start: '2026-12-22', end: '2026-12-27', adults: 2, cwb: 1, cnb: 1, infants: 0, asked: 'Beach for the children, one scuba try for the parents. Christmas week.' },
      services: [hotel({ name: 'Sea Shell, Port Blair', city: 'Port Blair', checkin: '2026-12-22', checkout: '2026-12-24', room: 'Family room', meal: 'Breakfast', tier: 'quoted', star: '4 star, sea view' }),
        hotel({ name: 'Barefoot at Havelock', city: 'Havelock', checkin: '2026-12-24', checkout: '2026-12-27', room: 'Garden cottage', meal: 'Breakfast', tier: 'quoted', star: 'Cottages near Radhanagar beach' }),
        { kind: 'transfer', text: 'Makruzz ferry, Port Blair to Havelock and back', date: '2026-12-24', vehicle: 'Ferry' },
        { kind: 'activity', name: 'Scuba dive at Elephant Beach', city: 'Havelock', date: '2026-12-25' }],
      days: [['Arrive in Port Blair', 'Port Blair', 'Airport pickup; Cellular Jail light and sound show in the evening.'], ['Ross Island and North Bay', 'Port Blair', 'Boat to Ross Island; glass-bottom boat at North Bay.'], ['Ferry to Havelock', 'Havelock', 'Morning ferry; afternoon at Radhanagar beach.'], ['Elephant Beach', 'Havelock', 'Speedboat to Elephant Beach; scuba try for the parents.'], ['Free day', 'Havelock', 'Kalapathar beach at sunrise; rest of the day free.'], ['Fly home', 'Port Blair', 'Ferry back and airport drop.']],
      included: ['Daily breakfast', 'Ferry tickets', 'Airport and jetty transfers', 'Scuba dive for 2 adults'], excluded: ['Flights', 'Lunches and dinners', 'Camera fees at the islands'], terms: ['Hotels are held only after confirmation.', 'Ferry timings can change with the weather.'],
      tiers: { quoted: { name: 'Family rooms', total: 105700, perPerson: true, plan: [['Advance', 30000, 'On confirmation'], ['Balance', 75700, '15 days before departure']], lines: [
        { d: 'Sea Shell, Port Blair · Family room', u: 'room', q: 1, n: 2, p: 9800, c: 8200 }, { d: 'Barefoot at Havelock · Garden cottage', u: 'room', q: 1, n: 3, p: 14200, c: 11900 },
        { d: 'Child with a bed · breakfast', u: 'night', q: 1, n: 5, p: 1800, c: 1400 }, { d: 'Makruzz ferry, Port Blair – Havelock – Port Blair', u: 'person', q: 4, p: 4600, c: 3900 },
        { d: 'Airport and jetty transfers', u: 'line', p: 6500, c: 5000 }, { d: 'Scuba dive at Elephant Beach', u: 'person', q: 2, p: 4800, c: 3800 }] }, upgrade: null },
      versions: [{ n: 1, status: 'sent', made: '2026-10-25', sentAt: '2026-10-25', via: 'WhatsApp', validUntil: '2026-11-01' }], converted: false, updated: '2026-10-25 18:05' },

    { id: 'Q-2610-009', title: 'Mount Abu school trip, St. Anne’s', subject: { kind: 'lead', ref: 'L-61140' }, deal: null, lead: 'L-61140', owner: 'sales',
      customer: { name: 'Sister Mary Fernandes', mobile: '+91 291 263 4410', email: 'principal.stannes.jdh@gmail.com', company: 'St. Anne’s Sr. Sec. School' },
      trip: { dest: 'Mount Abu', scope: 'Domestic', start: '2026-11-18', end: '2026-11-20', adults: 4, cwb: 48, cnb: 0, infants: 0, asked: 'Class 9 trip: 48 students, 4 teachers. Vegetarian meals only. Coaches from the school gate.' },
      services: [hotel({ name: 'Hotel Hillock', city: 'Mount Abu', checkin: '2026-11-18', checkout: '2026-11-20', rooms: 13, room: 'Standard room, 4 sharing', meal: 'All meals', tier: 'quoted', star: 'Near Nakki Lake' }),
        { kind: 'transfer', text: 'Jodhpur school gate to Mount Abu and back', date: '2026-11-18', vehicle: '2 × 35-seater AC coach' },
        { kind: 'activity', name: 'Dilwara Temples and Nakki Lake guided visit', city: 'Mount Abu', date: '2026-11-19' },
        { kind: 'activity', name: 'Guru Shikhar sunrise and Achalgarh fort', city: 'Mount Abu', date: '2026-11-20' }],
      days: [['Jodhpur to Mount Abu', 'Mount Abu', 'Coaches leave the school at 6:30 am; lunch on the way; Sunset Point.'], ['Temples and the lake', 'Mount Abu', 'Dilwara Temples with a guide; boating on Nakki Lake.'], ['Guru Shikhar and home', 'Mount Abu', 'Sunrise at Guru Shikhar, Achalgarh fort, back in Jodhpur by 8 pm.']],
      included: ['Coach travel from the school and back', 'Rooms on 4 sharing with all vegetarian meals', 'Guide and entry tickets', 'One coordinator from our team'], excluded: ['Personal expenses', 'Boating fees'], terms: ['Final numbers needed 7 days before travel.', 'Teachers stay free with the group.'],
      tiers: { quoted: { name: 'Standard rooms, all meals', total: 286000, perPerson: true, plan: [['Advance', 100000, 'On confirmation'], ['Balance', 186000, '7 days before departure']], lines: [
        { d: 'Hotel Hillock · Standard room, 4 sharing, all meals', u: 'room', q: 13, n: 2, p: 7200, c: 6100 }, { d: 'AC coach, 35 seater', u: 'trip', q: 2, n: 1, p: 38000, c: 32000 },
        { d: 'Guided sightseeing with entry tickets', u: 'person', q: 52, p: 350, c: 280 }, { d: 'Group coordinator from our team', u: 'line', p: 6000, c: 4500 }] }, upgrade: null },
      versions: [{ n: 1, status: 'sent', made: '2026-10-22', sentAt: '2026-10-22', via: 'E-mail', validUntil: '2026-10-29' }, { n: 2, status: 'ready', made: '2026-10-26', validUntil: '2026-11-02', changed: 'Guru Shikhar and Achalgarh added on day 3' }],
      converted: false, updated: '2026-10-26 12:15' },

    { id: 'Q-2610-025', title: 'Europe in May for Dr. Swati Lodha', subject: { kind: 'lead', ref: 'L-61170' }, deal: null, lead: 'L-61170', owner: 'sales',
      customer: { name: 'Dr. Swati Lodha', mobile: '+91 97721 08456', email: 'swati.lodha.md@gmail.com', company: '' },
      trip: { dest: 'Paris, Interlaken and Rome', scope: 'International', start: '2027-05-08', end: '2027-05-20', adults: 2, cwb: 0, cnb: 0, infants: 0, asked: '12 nights, Paris and Switzerland for sure, Italy if it fits. Trains between cities, no long coach days.' },
      services: [hotel({ name: 'Pullman Paris Tour Eiffel', city: 'Paris', checkin: '2027-05-08', checkout: '2027-05-12', room: 'Deluxe room, Eiffel view', meal: 'Breakfast', tier: 'quoted' }),
        hotel({ name: 'Hotel Interlaken', city: 'Interlaken', checkin: '2027-05-12', checkout: '2027-05-16', room: '', meal: 'Breakfast', tier: 'quoted' })],
      days: [], included: [], excluded: [], terms: [],
      tiers: { quoted: { name: '', total: null, perPerson: false, plan: [], lines: [{ d: 'Pullman Paris Tour Eiffel · Deluxe room, Eiffel view', u: 'room', q: 1, n: 4, p: 31500, c: 27400 }, { d: 'Hotel Interlaken · room', u: 'room', q: 1, n: 4, p: 22800, c: null }] }, upgrade: null },
      versions: [{ n: 1, status: 'draft', made: '2026-10-24', validUntil: '2026-10-31' }], parts: { details: 'saved', contact: 'saved', services: 'saved', narrative: 'not_started', money: 'draft', plan: 'not_started' }, converted: false, updated: '2026-10-26 17:20' },

    { id: 'Q-2610-003', title: 'Sri Lanka in February', subject: { kind: 'lead', ref: 'L-61114' }, deal: null, lead: 'L-61114', owner: 'sales',
      customer: { name: 'Shalini Bhansali', mobile: '+91 98290 74521', email: 'shalini.bhansali@gmail.com', company: '' },
      trip: { dest: 'Kandy, Nuwara Eliya and Bentota', scope: 'International', start: '2027-02-14', end: '2027-02-20', adults: 2, cwb: 0, cnb: 0, infants: 0 },
      services: [hotel({ name: 'Cinnamon Citadel Kandy', city: 'Kandy', checkin: '2027-02-14', checkout: '2027-02-16', room: 'Deluxe room', meal: 'Breakfast', tier: 'quoted' }), hotel({ name: 'Heritance Tea Factory', city: 'Nuwara Eliya', checkin: '2027-02-16', checkout: '2027-02-18', room: 'Deluxe room', meal: 'Breakfast', tier: 'quoted' }), hotel({ name: 'Cinnamon Bentota Beach', city: 'Bentota', checkin: '2027-02-18', checkout: '2027-02-20', room: 'Superior room', meal: 'Breakfast', tier: 'quoted' })],
      days: [], included: ['Daily breakfast', 'Private car with driver'], excluded: ['Flights'], terms: [],
      tiers: { quoted: { name: 'Deluxe rooms', total: 189000, perPerson: true, plan: [], lines: [{ d: 'Hotels, 6 nights', u: 'line', p: 141000, c: 120500 }, { d: 'Private car with driver, 7 days', u: 'line', p: 48000, c: 40600 }] }, upgrade: null },
      versions: [{ n: 1, status: 'declined', made: '2026-10-19', sentAt: '2026-10-19', via: 'WhatsApp', validUntil: '2026-10-26' }], declineReason: 'Price', converted: false, updated: '2026-10-23 11:30' },

    { id: 'Q-2609-118', title: 'Kerala honeymoon for Meenal and Rahul', subject: { kind: 'deal', ref: 'BX-38455' }, deal: 'BX-38455', lead: null, owner: 'sales',
      customer: { name: 'Meenal Khatri', mobile: '+91 94141 28650', email: 'meenal.khatri@outlook.com', company: '' },
      trip: { dest: 'Munnar, Thekkady and Alleppey', scope: 'Domestic', start: '2026-12-02', end: '2026-12-08', adults: 2, cwb: 0, cnb: 0, infants: 0 },
      services: [hotel({ name: 'Blanket Hotel and Spa', city: 'Munnar', checkin: '2026-12-02', checkout: '2026-12-04', room: 'Premium room', meal: 'Breakfast', tier: 'quoted' }), hotel({ name: 'Spice Village', city: 'Thekkady', checkin: '2026-12-04', checkout: '2026-12-06', room: 'Cottage', meal: 'Breakfast + dinner', tier: 'quoted' }), hotel({ name: 'Premium houseboat', city: 'Alleppey', checkin: '2026-12-06', checkout: '2026-12-08', room: '1 bedroom', meal: 'All meals', tier: 'quoted' }), { kind: 'transfer', text: 'Kochi airport round trip by car', date: '2026-12-02', vehicle: 'Dzire' }, { kind: 'flight', text: 'Jodhpur to Kochi and back, via Delhi', date: '2026-12-02' }],
      days: [], included: ['Breakfast daily, dinners in Thekkady, all meals on the houseboat', 'Car with driver for 7 days', 'Flights from Jodhpur', 'Honeymoon cake and flower bed'], excluded: ['Lunches outside the houseboat', 'Entry tickets'], terms: ['Hotels are held only after confirmation.'],
      tiers: { quoted: { name: 'Honeymoon package', total: 214000, perPerson: true, plan: [['Advance', 70000, 'On confirmation'], ['Balance', 144000, '7 days before departure']], lines: [
        { d: 'Blanket Hotel and Spa · Premium room', u: 'room', q: 1, n: 2, p: 19500, c: 16000 }, { d: 'Spice Village · Cottage', u: 'room', q: 1, n: 2, p: 22000, c: 18000 }, { d: 'Premium houseboat · 1 bedroom', u: 'room', q: 1, n: 2, p: 18500, c: 15000 },
        { d: 'Car with driver, 7 days', u: 'trip', q: 1, n: 7, p: 3600, c: 3000 }, { d: 'Flights Jodhpur – Kochi – Jodhpur', u: 'person', q: 2, p: 25400, c: 21000 }, { d: 'Honeymoon extras: cake, flower bed, candle-light dinner', u: 'line', p: 18000, c: 15400 }] }, upgrade: null },
      versions: [{ n: 1, status: 'accepted', made: '2026-09-29', sentAt: '2026-09-29', via: 'E-mail', validUntil: '2026-10-06' }], accepted: { tier: 'quoted', file: 'Meenal-Khatri-email-acceptance.pdf', size: '92 KB', at: '2026-10-03' }, converted: true, updated: '2026-10-26 15:10' },

    { id: 'Q-2610-011', title: 'Bhutan in March', subject: { kind: 'lead', ref: 'L-61126' }, deal: null, lead: 'L-61126', owner: 'sales2',
      customer: { name: 'Gaurav Singhvi', mobile: '+91 94609 27735', email: 'gaurav.singhvi@yahoo.com', company: '' },
      trip: { dest: 'Thimphu, Punakha and Paro', scope: 'International', start: '2027-03-10', end: '2027-03-15', adults: 2, cwb: 0, cnb: 0, infants: 0 },
      services: [hotel({ name: 'Hotel Norbuling', city: 'Thimphu', checkin: '2027-03-10', checkout: '2027-03-12', room: 'Deluxe room', meal: 'Breakfast + dinner', tier: 'quoted' }), hotel({ name: 'Zhingkham Resort', city: 'Punakha', checkin: '2027-03-12', checkout: '2027-03-13', room: 'Deluxe room', meal: 'Breakfast + dinner', tier: 'quoted' }), hotel({ name: 'Tashi Namgay Resort', city: 'Paro', checkin: '2027-03-13', checkout: '2027-03-15', room: 'Deluxe room', meal: 'Breakfast + dinner', tier: 'quoted' })],
      days: [], included: ['Breakfast and dinner daily', 'Car with driver and guide', 'Sustainable Development Fee'], excluded: ['Flights'], terms: [],
      tiers: { quoted: { name: 'Deluxe rooms', total: 158000, perPerson: true, plan: [], lines: [{ d: 'Hotels, 5 nights, breakfast and dinner', u: 'line', p: 96000, c: 81000 }, { d: 'Car, driver and guide, 6 days', u: 'line', p: 38000, c: 32500 }, { d: 'Sustainable Development Fee', u: 'person', q: 2, p: 12000, c: 12000 }] }, upgrade: null },
      versions: [{ n: 1, status: 'expired', made: '2026-10-13', sentAt: '2026-10-13', via: 'WhatsApp', validUntil: '2026-10-20' }], converted: false, updated: '2026-10-21 09:00' },

    { id: 'Q-2610-027', title: 'Goa long weekend for the Lohiya family', subject: { kind: 'referral', ref: 'TD-318' }, deal: null, lead: null, referral: 'TD-318', owner: 'sales',
      customer: { name: 'Pankaj Lohiya', mobile: '+91 98281 55034', email: '', company: '' },
      trip: { dest: 'North Goa', scope: 'Domestic', start: '2026-12-19', end: '2026-12-22', adults: 3, cwb: 1, cnb: 0, infants: 0, asked: 'Referred by Rajesh Soni. Pool resort near Calangute, one day cruise.' },
      services: [hotel({ name: 'Taj Holiday Village Resort and Spa', city: 'Candolim', checkin: '2026-12-19', checkout: '2026-12-22', rooms: 2, room: 'Garden view room', meal: 'Breakfast', tier: 'quoted' })],
      days: [], included: [], excluded: [], terms: [],
      tiers: { quoted: { name: '', total: null, perPerson: false, plan: [], lines: [] }, upgrade: null },
      versions: [{ n: 1, status: 'draft', made: '2026-10-26', validUntil: '2026-11-02' }], parts: { details: 'saved', contact: 'saved', services: 'draft', narrative: 'not_started', money: 'not_started', plan: 'not_started' }, converted: false, updated: '2026-10-26 13:45' },
  ];
  const cur = (q) => q.versions[q.versions.length - 1];
  Q.forEach((q) => { Object.defineProperty(q, 'status', { get: () => cur(q).status, enumerable: true }); if (!q.parts) q.parts = { details: 'saved', contact: 'saved', services: 'saved', narrative: 'saved', money: 'saved', plan: 'saved' }; });
  TN.DATA.quotations = Q;

  /* Referral drafts (customers not in Bitrix yet). */
  TN.DATA.referralDrafts = [
    { id: 'TD-318', customer: { name: 'Pankaj Lohiya', mobile: '+91 98281 55034', email: '', company: '' }, source: 'Referral', referredBy: 'Rajesh Soni (past customer)', owner: 'sales', branch: 'Jodhpur', status: 'open', link: null, last: '2026-10-26', closesOn: '2027-01-24',
      history: [{ title: 'Referral draft made', meta: '26 Oct 2026, 1:30 pm IST · Ritika Sharma' }, { title: 'Quotation Q-2610-027 started', meta: '26 Oct 2026, 1:45 pm IST · Ritika Sharma' }] },
  ];
  const RD = () => TN.DATA.referralDrafts;

  /* Branded itineraries. */
  TN.DATA.itineraries = [
    { id: 'IT-0031', title: 'Bali honeymoon, day by day', basis: { kind: 'quotation', q: 'Q-2610-014', v: 2 }, deal: 'BX-38560', owner: 'sales', status: 'draft', updated: '2026-10-26 18:10', made: '2026-10-22',
      source: { file: 'Rathi-Bali-plan-from-DMC.pdf', size: '240 KB', at: '2026-10-22' },
      facts: { dest: 'Ubud and Seminyak, Bali', start: '2027-01-09', end: '2027-01-14', adults: 2, children: 0, childAges: '', infants: 0, country: 'Indonesia', tripType: 'Honeymoon', roomBasis: '2 adults sharing', cover: 'Bali',
        stays: [{ city: 'Ubud', hotel: 'Komaneka at Bisma', room: 'Deluxe room', checkin: '2027-01-09', checkout: '2027-01-11', nights: 2, meal: 'Breakfast', rooms: 1, fromQuote: true }, { city: 'Seminyak', hotel: 'Alila Seminyak', room: 'Deluxe suite', checkin: '2027-01-11', checkout: '2027-01-14', nights: 3, meal: 'Breakfast', rooms: 1, fromQuote: true }],
        days: [{ title: 'Arrive in Bali', where: 'Ubud', text: 'Private transfer to Ubud; evening at leisure.', hl: ['Flower welcome'] }, { title: 'Rice terraces and the palace', where: 'Ubud', text: 'Tegallalang rice terraces and Ubud palace with the driver.', hl: [] }, { title: 'To the coast', where: 'Seminyak', text: 'Drive to Seminyak with a stop at Tanah Lot for sunset.', hl: ['Tanah Lot sunset'] }, { title: 'Nusa Penida', where: 'Seminyak', text: 'Fast boat to the island; snorkelling at Crystal Bay.', hl: ['Kelingking cliff'] }, { title: 'Beach day', where: 'Seminyak', text: 'Time for the spa, shopping and the beach.', hl: [] }, { title: 'Fly home', where: 'Seminyak', text: 'Transfer to the airport.', hl: [] }],
        transfers: [{ from: 'Bali airport', to: 'Komaneka at Bisma', date: '2027-01-09', how: 'Private car' }], activities: [{ name: 'Nusa Penida day trip with snorkelling', date: '2027-01-13', inPrice: 'Yes' }],
        included: ['Daily breakfast', 'Private car with driver for transfers and sightseeing', 'Nusa Penida day trip with snorkelling'], excluded: ['Flights', 'Travel insurance'],
        intro: 'Two quiet days among the rice fields, then three by the sea.', why: ['Short drives between stays', 'One island day, the rest at your pace'], care: ['Every transfer', 'Hotel check-ins'], bring: ['Passports valid for six months', 'Light cotton clothes and a rain jacket'] },
      diffs: [{ id: 'd1', label: 'Activity 1 · date', kind: 'differs', quote: '12 Jan 2027', itin: '13 Jan 2027', settled: null }],
      settled: [{ label: 'Transfer 1 · how', how: 'kept on purpose', by: 'sales', at: '2026-10-22', note: 'Customer asked for a private car, not a van.' }], docs: [] },
    { id: 'IT-0027', title: 'Kashmir: Srinagar, Pahalgam and Gulmarg', basis: { kind: 'booking', deal: 'BX-38377' }, deal: 'BX-38377', owner: 'sales2', status: 'final', updated: '2026-10-24 17:05', made: '2026-10-20', source: null,
      facts: { dest: 'Srinagar, Pahalgam and Gulmarg', start: '2026-11-08', end: '2026-11-13', adults: 4, children: 0, childAges: '', infants: 0, country: 'India', tripType: 'Friends', roomBasis: '2 rooms, 2 sharing each', cover: 'Kashmir',
        stays: [{ city: 'Srinagar', hotel: 'Hotel Grand Mumtaz', room: 'Deluxe room', checkin: '2026-11-08', checkout: '2026-11-11', nights: 3, meal: 'Breakfast + dinner', rooms: 2, fromQuote: true }, { city: 'Pahalgam', hotel: 'Pine Spring Resort', room: 'Deluxe room', checkin: '2026-11-11', checkout: '2026-11-13', nights: 2, meal: 'Breakfast + dinner', rooms: 2, fromQuote: true }],
        days: [{ title: 'Arrive in Srinagar', where: 'Srinagar', text: 'Airport pickup; shikara ride on Dal Lake at sunset.', hl: ['Shikara ride'] }, { title: 'Gulmarg day trip', where: 'Srinagar', text: 'Gondola to Kongdori; snow if the season allows.', hl: ['Gulmarg gondola'] }, { title: 'Sonamarg day trip', where: 'Srinagar', text: 'Drive along the Sindh river to Thajiwas glacier.', hl: [] }, { title: 'To Pahalgam', where: 'Pahalgam', text: 'Saffron fields and Avantipur ruins on the way.', hl: [] }, { title: 'Aru and Betaab valleys', where: 'Pahalgam', text: 'Local cab to the valleys; evening by the Lidder river.', hl: [] }, { title: 'Fly home', where: 'Srinagar', text: 'Drive to Srinagar airport.', hl: [] }],
        transfers: [{ from: 'Srinagar airport', to: 'Hotel Grand Mumtaz', date: '2026-11-08', how: 'Innova' }, { from: 'Hotel Grand Mumtaz', to: 'Pine Spring Resort', date: '2026-11-11', how: 'Innova' }, { from: 'Pine Spring Resort', to: 'Srinagar airport', date: '2026-11-13', how: 'Innova' }], activities: [],
        included: ['Breakfast and dinner daily', 'Innova with driver for 6 days', 'Shikara ride'], excluded: ['Gondola tickets', 'Pony rides', 'Flights'],
        intro: 'Six days of lakes, meadows and mountain air with friends.', why: ['Both hotels close to the sights', 'One driver for the whole trip'], care: ['Every transfer', 'Hotel check-ins'], bring: ['Warm jackets and gloves', 'Photo ID for every traveller'] },
      diffs: [], settled: [], docs: [{ kind: 'preview', at: '2026-10-23', file: 'IT-0027-preview.pdf' }, { kind: 'final', at: '2026-10-24', file: 'IT-0027-Kashmir-itinerary.pdf' }] },
  ];
  const IT = () => TN.DATA.itineraries;

  /* ---------- Shared bits ---------- */
  const WORD_LOOK = { 'Not started': ['neutral', 'circle-dashed'], Draft: ['warning', 'pen-line'], 'Ready to share': ['info', 'circle-check'], 'Shared with customer': ['info', 'send'], Accepted: ['success', 'circle-check'], 'Booking started': ['success', 'circle-check'], Declined: ['danger', 'circle-x'], Expired: ['danger', 'clock'], 'Replaced by a newer version': ['neutral', 'clock'], Discarded: ['neutral', 'clock'] };
  const badge = (word, sr = 'Quotation status: ') => { const l = WORD_LOOK[word] || ['neutral', 'file-text']; return U.badge(E(word), l[0], { icon: l[1], wrap: true, sr }); };
  const untouched = (q) => q.status === 'draft' && !q.services.length && !q.tiers.quoted.lines.length;
  function wordOf(q, v = cur(q)) {
    switch (v.status) {
      case 'draft': return v === cur(q) && untouched(q) ? 'Not started' : 'Draft';
      case 'ready': return 'Ready to share';
      case 'sent': return 'Shared with customer';
      case 'accepted': return q.converted ? 'Booking started' : 'Accepted';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      case 'superseded': return 'Replaced by a newer version';
      default: return 'Discarded';
    }
  }
  const qById = (id) => Q.find((q) => q.id.toLowerCase() === String(id).toLowerCase());
  const subjText = (q) => q.subject.kind === 'deal' ? `Deal ${q.subject.ref}` : q.subject.kind === 'lead' ? `Lead ${q.subject.ref}` : `Referral draft ${q.subject.ref}${referralLinkSuffix(q.subject.ref)}`;
  const subjHref = (q) => q.subject.kind === 'deal' ? `#/app/deals/${q.subject.ref}` : q.subject.kind === 'lead' ? `#/app/leads/${q.subject.ref}` : `#/app/quotations/drafts/${q.subject.ref}`;
  const referralLinkSuffix = (id) => { const d = RD().find((x) => x.id === id); return d && d.link ? ` · linked to ${d.link.kind} ${d.link.ref}` : ' · not linked to Bitrix yet'; };
  const travText = (t) => [pl(t.adults, 'adult'), t.cwb + t.cnb ? pl(t.cwb + t.cnb, 'child', 'children') + (t.cnb ? ` (${t.cnb} without a bed)` : '') : '', t.infants ? pl(t.infants, 'infant') : ''].filter(Boolean).join(', ');
  const tripText = (t) => `${E(t.dest)} · ${F.date(t.start)} to ${F.date(t.end)} · ${pl(nightsOf(t.start, t.end), 'night')} · ${t.scope}`;
  const UNIT = { room: ['room', 'rooms', 'night', 'nights', 'per room per night'], trip: ['vehicle', 'vehicles', 'trip', 'trips', 'per trip'], night: ['', '', 'night', 'nights', 'per night'], person: ['person', 'people', '', '', 'per person'] };
  const lineTotal = (l) => l.u === 'line' ? l.p : l.u === 'person' ? l.q * l.p : (l.q || 1) * (l.n || 1) * l.p;
  const lineCost = (l) => l.c == null ? null : l.u === 'line' ? l.c : l.u === 'person' ? l.q * l.c : (l.q || 1) * (l.n || 1) * l.c;
  function lineCalc(l) {
    if (l.u === 'line') return `${F.inr(l.p)} total for the line`;
    const u = UNIT[l.u];
    if (l.u === 'person') return `${l.q} ${l.q === 1 ? u[0] : u[1]} × ${F.inr(l.p)} ${u[4]} = ${F.inr(lineTotal(l))}`;
    const a = u[0] ? `${l.q} ${l.q === 1 ? u[0] : u[1]} × ` : `${l.q} × `;
    return `${a}${l.n} ${l.n === 1 ? u[2] : u[3]} × ${F.inr(l.p)} ${u[4]} = ${F.inr(lineTotal(l))}`;
  }
  const paying = (t) => t.adults + t.cwb + t.cnb;
  const sum = (a) => a.reduce((s, x) => s + (x || 0), 0);
  const tierLabel = (k) => (k === 'quoted' ? 'Quoted option' : 'Upgrade option');
  const printedAs = (q, tier) => { if (tier.total == null) return ''; const n = paying(q.trip); return tier.perPerson && tier.total % n === 0 ? `${F.inr(tier.total / n)} per person` : `${F.inr(tier.total)} for ${pl(n, 'traveller')}`; };
  const svcText = (s, i) => {
    const n = `Service ${i + 1}: `;
    if (s.kind === 'hotel') return `${n}Hotel · ${E(s.name)} · ${E(s.city)} · ${F.date(s.checkin)} to ${F.date(s.checkout)}${s.tier ? ' · ' + tierLabel(s.tier) + ' only' : ''}`;
    if (s.kind === 'transfer') return `${n}Transfer or cab · ${E(s.text)} · ${F.date(s.date)}`;
    if (s.kind === 'activity') return `${n}Activity · ${E(s.name)} · ${E(s.city)} · ${F.date(s.date)}`;
    if (s.kind === 'visa') return `${n}Visa · ${E(s.country)} · ${E(s.purpose)}`;
    return `${n}Flight · ${E(s.text)} · ${F.date(s.date)}`;
  };
  const segNav = (q, onCopy, note) => `<nav aria-label="Edit or customer copy" class="flex flex-wrap items-center gap-3"><div class="inline-flex gap-1 rounded-card border border-line bg-wash p-1"><a${onCopy ? '' : ' aria-current="page"'} class="${onCopy ? SEG_OFF : SEG_ON}" href="#/app/quotations/${q.id}">Edit</a><a${onCopy ? ' aria-current="page"' : ''} class="${onCopy ? SEG_ON : SEG_OFF}" href="#/app/quotations/${q.id}/preview">Customer copy</a></div><span class="text-sm text-quiet">${note}</span></nav>`;
  const sectionCard = (id, title, desc, body, o = {}) => `<div class="${U.CARD}" data-slot="card"><section${o.anchor ? ` id="${o.anchor}"` : ''} aria-labelledby="${id}" class="scroll-mt-24"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink${o.focus ? ' outline-none' : ''}" id="${id}"${o.focus ? ' tabindex="-1"' : ''}>${title}</h2>${desc ? `<p class="m-0 text-sm text-quiet${o.basis ? ' basis-full' : ''}">${desc}</p>` : ''}${o.actions || ''}</div><div class="px-4.5 py-4 flex flex-col gap-${o.gap || 4}">${body}</div></section></div>`;
  const fileRow = (name, metaText, label = 'Open') => `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-2.5">${TN.ic('file-text', 'size-4 shrink-0 text-brand-strong')}<span class="min-w-40 flex-1"><span class="block font-medium wrap-anywhere text-ink">${E(name)}</span><span class="block text-sm text-quiet">${metaText}</span></span><a href="#" data-act="q-open-file" data-name="${E(name)}" class="${A_INL} inline-flex min-h-11 items-center gap-1">${TN.ic('download', 'size-4')}${label}<span class="sr-only"> ${E(name)}</span></a></li>`;
  const note = (icon, iconCls, html, role) => `<p class="m-0 flex gap-2 text-copy"${role ? ` role="${role}"` : ''}>${TN.ic(icon, 'mt-0.5 size-4 shrink-0 ' + iconCls)}<span>${html}</span></p>`;
  const nextQRef = () => { let n = 28; while (qById(`Q-2610-0${n}`)) n++; return `Q-2610-0${n}`; };

  /* =====================================================================
     #/app/quotations · list
     ===================================================================== */
  const FILTERS = [
    ['open', 'Open', (q) => ['draft', 'ready', 'sent'].includes(q.status) || (q.status === 'accepted' && !q.converted)],
    ['drafts', 'Drafts', (q) => q.status === 'draft'],
    ['ready', 'Ready to share', (q) => q.status === 'ready'],
    ['shared', 'Shared', (q) => q.status === 'sent'],
    ['accepted', 'Accepted', (q) => q.status === 'accepted'],
    ['ready_to_book', 'Ready to book', (q) => q.status === 'accepted' && q.deal && !q.converted],
    ['accepted_not_linked', 'Accepted, not linked', (q) => q.status === 'accepted' && !q.deal],
    ['declined_or_expired', 'Declined or expired', (q) => ['declined', 'expired'].includes(q.status)],
    ['closed_drafts', 'Closed drafts', (q) => q.status === 'discarded'],
  ];
  function rowAction(q) {
    if (q.converted) return ['Continue booking', `#/app/deals/${q.deal}/book`];
    if (q.status === 'accepted' && !q.deal) return ['Link to deal', q.referral ? `#/app/quotations/drafts/${q.referral}?tab=link` : `#/app/quotations/${q.id}`];
    if (q.status === 'accepted') return ['Start booking', `#/app/quotations/${q.id}`];
    if (['draft', 'ready'].includes(q.status)) return ['Continue', `#/app/quotations/${q.id}`];
    return ['Open', `#/app/quotations/${q.id}`];
  }
  function quoteRows(list) {
    return list.map((q) => {
      const v = cur(q), [act, ahref] = rowAction(q);
      return { attrs: { 'data-search': `${q.id} ${q.title} ${q.customer.name}`.toLowerCase() }, cells: [
        `<a class="${A_TITLE}" href="#/app/quotations/${q.id}">${E(q.title)}</a><span class="mt-0.5 block text-sm text-quiet">${q.id} · version ${v.n} · Owner: ${E(ownerText(q.owner))}</span><span class="mt-0.5 block text-sm wrap-anywhere text-copy">${E(q.customer.name)} · ${E(q.trip.dest.split(',')[0])}${q.trip.start ? ' · from ' + F.date(q.trip.start) : ''}</span>`,
        `<span class="flex flex-col items-start gap-1.5">${badge(wordOf(q))}</span>`,
        `<a class="${A_SUBJ}" href="${subjHref(q)}">${E(subjText(q))}</a>`,
        { html: ['draft', 'ready'].includes(v.status) && !q.versions.some((x) => x.sentAt) ? '<span class="text-quiet">Set when shared</span>' : F.date(v.validUntil), cls: 'text-sm whitespace-nowrap' },
        { html: upd(q.updated), cls: 'text-sm text-copy' },
        { html: `<a class="${ROW_BTN}" href="${ahref}">${act}<span class="sr-only">: ${q.id} ${E(q.title)}</span></a>`, cls: 'sm:text-right', label: '' },
      ] };
    });
  }
  const closedNote = `<p class="m-0 mt-3 flex items-start gap-2 text-sm text-copy" data-slot="hidden-closed">${TN.ic('info', 'mt-0.5 size-4 shrink-0 text-status-info')}<span>Closed drafts that were never linked are not in this list. Choose “Closed drafts” or open one by its reference.</span></p>`;
  function listChrome(o) {
    const scopeAll = o.scope === 'all';
    const base = (extra) => o.path + (extra ? '?' + extra : '');
    const qs = (f, s) => [f && f !== 'open' ? 'filter=' + f : '', s === 'all' ? 'scope=all' : ''].filter(Boolean).join('&');
    const scopeSwitch = `<div role="group" aria-label="Which ${o.noun} to show" class="flex flex-wrap items-center gap-2"><span class="text-sm text-quiet">Show:</span><span class="inline-flex flex-wrap gap-0.5 rounded-control border border-line bg-wash p-0.5">${[['mine', 'Mine'], ['all', 'All you can open']].map(([k, l]) => (k === (scopeAll ? 'all' : 'mine') ? `<strong aria-current="true" class="inline-flex min-h-9 items-center rounded-chip bg-card px-2.5 py-1 text-sm font-semibold text-ink shadow-button">${l}</strong>` : `<a class="inline-flex min-h-9 items-center rounded-chip px-2.5 py-1 text-sm font-medium text-brand-strong no-underline hover:bg-card hover:text-brand-deep ${FO}" href="#${base(qs(o.filter, k))}">${l}</a>`)).join('')}</span></div>`;
    const chips = U.filterChips({ label: `Filter ${o.noun}`, chips: o.filters.map(([k, l, fn]) => ({ href: '#' + base(qs(k, o.scope)), label: l, count: o.pool.filter(fn).length, current: k === o.filter })), scope: 'Counts include all pages.' });
    const refForm = `<form role="search" aria-label="Open by reference" class="flex w-full max-w-sm flex-col gap-1 font-sans" data-act="${o.refAct}"><label for="${o.noun}-reference" class="text-sm font-semibold text-ink">Open by reference</label><div class="flex gap-2">${U.input({ id: `${o.noun}-reference`, name: 'reference', placeholder: o.refPh, autoComplete: 'off', value: o.ref || '', invalid: !!o.refMiss, cls: 'min-w-0 flex-1', attrs: { spellCheck: 'false', 'aria-describedby': `${o.noun}-reference-hint` } })}${U.button('Open', { type: 'submit', icon: 'search', cls: 'min-h-10' })}</div><p id="${o.noun}-reference-hint" class="m-0 text-xs text-quiet">Exact reference. Finds closed drafts too.</p>${o.refMiss ? `<p class="m-0 flex items-start gap-1.5 text-sm font-medium text-status-danger" role="alert">${TN.ic('circle-alert', 'mt-0.5 size-3.5 shrink-0')}<span>Nothing with that reference that you can open. Check the reference (for example ${o.refEg}).</span></p>` : ''}</form>`;
    const search = `<div class="flex w-full max-w-md flex-col gap-1 font-sans" data-slot="list-search"><label for="${o.noun}-search" class="text-sm font-semibold text-ink">Search this page</label><div class="relative">${TN.ic('search', 'pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-quiet')}<input class="${U.CONTROL} pl-9!" data-slot="input" id="${o.noun}-search" placeholder="Name, trip or reference" aria-describedby="${o.noun}-search-scope ${o.noun}-search-result" autocomplete="off" type="search" value="" data-list-search="${o.noun}"></div><p id="${o.noun}-search-scope" class="sr-only">Searches this page only.</p><p id="${o.noun}-search-result" role="status" aria-live="polite" class="m-0 text-sm text-copy"></p></div>`;
    return `<div class="mb-4 flex flex-col gap-4">${scopeSwitch}${chips}<div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">${search}${refForm}</div></div>`;
  }
  /* Live "Search this page": hides rows that do not match (client side). */
  function bindSearch(root) {
    const inp = root.querySelector('[data-list-search]'); if (!inp) return;
    const noun = inp.dataset.listSearch, res = root.querySelector('#' + noun + '-search-result');
    inp.addEventListener('input', () => {
      const v = inp.value.trim().toLowerCase(), rows = [...root.querySelectorAll('tbody tr[data-search]')];
      let n = 0; rows.forEach((r) => { const hit = !v || r.dataset.search.includes(v); r.hidden = !hit; if (hit) n++; });
      res.textContent = !v ? '' : n ? `${n} of ${rows.length} ${noun} on this page match.` : `No match on this page. Try another filter, or open ${noun === 'quotations' ? 'a quotation' : 'an itinerary'} by its reference.`;
    });
  }
  const mineOrAll = (scope, list) => (scope === 'all' ? list : list.filter((x) => x.owner === me()));
  TN.page('/app/quotations', { nav: '/app/quotations', roles: ['sales', 'manager'], title: 'Quotations',
    render(p, qy) {
      const scope = qy.scope || (TN.is('manager') ? 'all' : 'mine');
      const filter = FILTERS.some((f) => f[0] === qy.filter) ? qy.filter : 'open';
      const pool = mineOrAll(scope, Q);
      const list = pool.filter(FILTERS.find((f) => f[0] === filter)[2]).sort((a, b) => (b.updated || '').localeCompare(a.updated || ''));
      const table = list.length ? U.table({ label: 'Quotations table', id: 'quotations-table', top: true, caption: `Showing ${list.length} of ${list.length} quotations`, captionCls: 'sr-only',
        columns: ['Quotation', 'Status', 'Lead, deal or referral', 'Valid until', 'Updated', { label: 'Next step', sr: true }], rows: quoteRows(list),
        footer: `<nav aria-label="Quotations pages" class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 py-3 font-sans" data-slot="work-pager"><span aria-hidden="true"></span><span class="text-sm text-quiet tabular-nums">Showing ${list.length} of ${list.length} quotations</span><span aria-hidden="true"></span></nav>` })
        : U.card(U.emptyState({ icon: 'file-text', title: 'No quotations here', description: 'Nothing matches this filter. Try another filter, or start a new quotation.', level: 2 }));
      return U.page(U.pageHeader({ title: 'Quotations', description: scope === 'all' ? 'Quotations you can open' : 'Quotations you made or own', actions: U.button('New quotation', { href: '/app/quotations/new', variant: 'primary', size: 'lg', icon: 'plus' }) })
        + listChrome({ path: '/app/quotations', noun: 'quotations', scope, filter, pool, filters: FILTERS, refAct: 'q-ref', refPh: 'Q-2610-014 or TD-318', refEg: 'Q-2610-014 or TD-318', ref: qy.ref, refMiss: qy.miss === '1' })
        + table + closedNote);
    }, mount: (root) => bindSearch(root) });
  TN.act('q-ref', (f) => {
    const ref = new FormData(f).get('reference').trim();
    const q = qById(ref), d = RD().find((x) => x.id.toLowerCase() === ref.toLowerCase());
    if (q) return TN.go('/app/quotations/' + q.id);
    if (d) return TN.go('/app/quotations/drafts/' + d.id);
    const qs = new URLSearchParams(TN.query()); qs.set('ref', ref); qs.set('miss', '1');
    TN.go('/app/quotations?' + qs.toString());
  });

  /* =====================================================================
     #/app/quotations/new
     ===================================================================== */
  const SOURCES = ['Walk-in', 'Phone', 'WhatsApp', 'Email', 'Referral', 'Repeat customer', 'Social media', 'Other'];
  function referralForm(kind, err, vals) {
    vals = vals || {};
    const p = kind === 'itinerary' ? 'it' : 'q';
    const f = (id, label, o = {}) => U.field({ id: `${p}-new-${id}`, label, optional: o.optional, hint: o.hint, error: o.error, input: { name: id, value: vals[id] || '', type: o.type || 'text', autoComplete: 'off', inputMode: o.mode } });
    return `<form data-act="${kind === 'itinerary' ? 'it-new-referral' : 'q-new-referral'}" class="flex flex-col gap-4" aria-label="New referral ${kind}" novalidate>
      ${err ? U.errorSummary({ text: 'Nothing was made; your typed details are still here.', items: [{ href: `#${p}-new-name`, text: err }] }) : ''}
      <div class="grid gap-4 sm:grid-cols-2">${f('name', 'Customer name', { error: err })}${f('mobile', 'Mobile', { optional: true, type: 'tel', mode: 'tel' })}${f('email', 'Email', { optional: true, type: 'email', mode: 'email' })}${f('company', 'Company', { optional: true })}
      ${U.field({ id: `${p}-new-source`, label: 'How did they reach us?', optional: true, select: { name: 'source', options: SOURCES, placeholder: 'Choose', value: vals.source || '' } })}${f('referredBy', 'Who referred them?', { optional: true })}
      ${U.field({ id: `${p}-new-title`, label: 'Title', optional: true, cls: 'sm:col-span-2', hint: kind === 'itinerary' ? 'Printed at the top of the itinerary. Left empty, it reads “Trip for {customer name}”.' : 'Printed at the top of the quotation. You cannot change it later. Left empty, it reads “Trip for {customer name}”.', input: { name: 'title', value: vals.title || '' } })}</div>
      <p class="m-0 text-sm text-quiet">Nothing is sent and nothing is put in Bitrix.</p>
      <div>${U.button(kind === 'itinerary' ? 'Create referral itinerary' : 'Create referral quotation', { type: 'submit', variant: 'primary', size: 'lg', cls: 'min-h-11' })}</div></form>`;
  }
  function newPage(kind) {
    const isIt = kind === 'itinerary';
    return U.page(U.backLink(isIt ? '/app/itineraries' : '/app/quotations', isIt ? 'Back to Itineraries' : 'Back to Quotations') + U.pageHeader({ title: isIt ? 'New itinerary' : 'New quotation', description: 'Choose who it is for.' })
      + `<div class="flex flex-col gap-5">`
      + sectionCard(`${kind}-for-heading`, isIt ? 'For a quotation or deal' : 'For a lead or deal', '', `<p class="m-0 text-copy">${isIt ? 'Open the deal or the quotation, then press “Make branded itinerary” there.' : 'Open the lead or deal, then press “Create quotation” on its Quotations tab.'}</p><div class="flex flex-wrap gap-2">${isIt ? '' : U.button('Open Leads', { href: '/app/leads' })}${U.button('Open Deals', { href: '/app/deals' })}</div>`)
      + sectionCard(`${kind}-referral-heading`, 'Referral (no Bitrix record yet)', '', `<h3 class="m-0 text-base font-semibold text-ink">New referral ${kind}</h3><p class="m-0 text-quiet">For a customer who is not in Bitrix yet. Only the name is required. You can link it to a Bitrix lead or deal later.</p>${referralForm(kind, TN._qErr, TN._qVals)}`)
      + `</div>`);
  }
  TN.page('/app/quotations/new', { nav: '/app/quotations', roles: ['sales', 'manager'], title: 'New quotation', render: () => { const h = newPage('quotation'); TN._qErr = null; TN._qVals = null; return h; } });
  function makeReferral(fd) {
    const n = 318 + RD().length; const id = `TD-${n}`;
    const d = { id, customer: { name: fd.get('name').trim(), mobile: fd.get('mobile').trim(), email: fd.get('email').trim(), company: fd.get('company').trim() }, source: fd.get('source') || 'Not given', referredBy: fd.get('referredBy').trim(), owner: me(), branch: 'Jodhpur', status: 'open', link: null, last: TN.TODAY, closesOn: iso(TN.TODAY, 90), history: [{ title: 'Referral draft made', meta: F.dateTime(now()) + ' · ' + TN.me().name }] };
    RD().push(d); return d;
  }
  function newQuotation(subject, customer, title, trip) {
    const id = nextQRef();
    const q = { id, title, subject, deal: subject.kind === 'deal' ? subject.ref : null, lead: subject.kind === 'lead' ? subject.ref : null, referral: subject.kind === 'referral' ? subject.ref : null, owner: me(), customer,
      trip: Object.assign({ dest: '', scope: '', start: '', end: '', adults: 2, cwb: 0, cnb: 0, infants: 0, asked: '' }, trip || {}), services: [], days: [], included: [], excluded: [], terms: [],
      tiers: { quoted: { name: '', total: null, perPerson: false, plan: [], lines: [] }, upgrade: null }, versions: [{ n: 1, status: 'draft', made: TN.TODAY, validUntil: iso(TN.TODAY, 7) }],
      parts: { details: trip ? 'saved' : 'not_started', contact: 'saved', services: 'not_started', narrative: 'not_started', money: 'not_started', plan: 'not_started' }, converted: false, updated: now() };
    Object.defineProperty(q, 'status', { get: () => cur(q).status, enumerable: true });
    Q.unshift(q); return q;
  }
  TN.act('q-new-referral', (f) => {
    const fd = new FormData(f);
    if (!fd.get('name').trim()) { TN._qErr = 'Enter the customer name.'; TN._qVals = Object.fromEntries(fd); return TN.refresh(); }
    const d = makeReferral(fd);
    const q = newQuotation({ kind: 'referral', ref: d.id }, { ...d.customer }, fd.get('title').trim() || `Trip for ${d.customer.name}`);
    d.history.push({ title: `Quotation ${q.id} started`, meta: F.dateTime(now()) + ' · ' + TN.me().name });
    TN.toast(`Referral draft ${d.id} and quotation ${q.id} made.`, 'success', 'Nothing was sent and nothing was put in Bitrix.');
    TN.go('/app/quotations/' + q.id);
  });
  /* "Create quotation" from a Lead or Deal page (Agent B): <button data-act="q-create" data-subject="lead:L-61208">. */
  TN.act('q-create', (el) => {
    const [kind, ref] = String(el.dataset.subject || '').split(':');
    if (kind === 'lead') { const l = TN.DATA.leads.find((x) => x.id === ref); if (!l) return; const q = newQuotation({ kind: 'lead', ref }, { name: l.name, mobile: l.phone, email: '', company: '' }, l.title); TN.toast(`Quotation ${q.id} started for lead ${ref}.`); return TN.go('/app/quotations/' + q.id); }
    if (kind === 'deal') { const d = TN.deal(ref); if (!d) return; const c = TN.customer(d.customer); const q = newQuotation({ kind: 'deal', ref }, { name: c.name, mobile: c.phone, email: c.email, company: c.business ? c.name : '' }, d.title, { dest: d.destination, scope: d.tripType, start: d.start, end: d.end, adults: d.adults, cwb: d.children, infants: d.infants }); TN.toast(`Quotation ${q.id} started for deal ${ref}.`); return TN.go('/app/quotations/' + q.id); }
  });
  TN.quotes = { all: () => Q, forDeal: (id) => Q.filter((q) => q.deal === id), forLead: (id) => Q.filter((q) => q.lead === id), itinerariesForDeal: (id) => IT().filter((i) => i.deal === id), wordOf, badge };

  /* =====================================================================
     #/app/quotations/:id · version page
     ===================================================================== */
  function header(q, v, viewOld) {
    const word = wordOf(q, v);
    const linked = q.status === 'accepted' ? (q.deal ? U.badge(`Linked to deal ${E(q.deal)}`, 'success', { icon: 'link-2', wrap: true }) : U.badge('Waiting for the Bitrix deal', 'warning', { icon: 'clock', wrap: true })) : '';
    const valid = ['draft'].includes(v.status) && !v.sentAt && !q.versions.some((x) => x.sentAt) ? 'Valid for 7 days after the quotation was made' : `Valid until ${F.date(v.validUntil)}`;
    let next = '', actions = '';
    const more = (inner) => `<details class="group relative"><summary class="${BIG_BTN('secondary')} list-none [&::-webkit-details-marker]:hidden">More${TN.ic('chevron-down', 'transition-transform group-open:rotate-180 motion-reduce:transition-none')}</summary><div class="z-20 mt-1.5 flex min-w-64 flex-col gap-3 rounded-card border border-line bg-card p-3 shadow-overlay sm:absolute sm:right-0 sm:top-full sm:mt-1.5">${inner}</div></details>`;
    const newVersionBtn = `<div>${U.button(`Make a new version from version ${v.n}`, { act: 'q-new-version', data: { id: q.id }, size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}</div>`;
    if (viewOld) { next = `Next: this is an older version. Open version ${cur(q).n} to work on it.`; actions = U.button(`Open version ${cur(q).n}`, { href: `/app/quotations/${q.id}`, variant: 'primary', size: 'lg', cls: 'min-h-11' }); }
    else if (v.status === 'draft') { next = 'Next: finish the parts, then press “Check and mark ready”'; actions = U.button('Check and mark ready', { act: 'q-mark-ready', data: { id: q.id }, variant: 'primary', size: 'lg', cls: 'min-h-11' }) + more(`<div>${U.button('Discard this draft', { act: 'q-discard', data: { id: q.id }, variant: 'ghost', icon: 'trash', cls: 'min-h-11' })}</div>`); }
    else if (v.status === 'ready') { next = 'Next: check the customer copy, share it yourself, then mark it as shared'; actions = U.button('Mark as shared', { act: 'q-mark-shared', data: { id: q.id }, variant: 'primary', size: 'lg', cls: 'min-h-11', attrs: { 'aria-haspopup': 'dialog' } }) + more(`<div>${U.button('Discard this draft', { act: 'q-discard', data: { id: q.id }, variant: 'ghost', icon: 'trash', cls: 'min-h-11' })}</div>`); }
    else if (v.status === 'sent') { next = `Next: wait for the customer’s written answer (valid until ${F.date(v.validUntil)})`; actions = `<a class="${BIG_BTN('primary')}" href="#quote-answer-heading" data-act="q-jump" data-target="quote-answer-heading">Record the customer’s answer</a>` + more(newVersionBtn); }
    else if (v.status === 'accepted' && q.converted) { next = 'Next: continue the booking'; actions = U.button('Continue booking', { href: `/app/deals/${q.deal}/book`, variant: 'primary', size: 'lg', cls: 'min-h-11' }); }
    else if (v.status === 'accepted' && q.deal) { next = 'Next: start the booking from this quotation'; actions = `<form class="flex max-w-md flex-col gap-3" data-act="q-start-booking" data-id="${q.id}"><div>${U.button('Start booking from this quotation', { type: 'submit', variant: 'primary', size: 'lg', cls: 'min-h-11' })}</div><p class="m-0 text-sm text-quiet">Copies this quotation into a new booking draft, once. Nothing is booked or paid.</p></form>`; }
    else if (v.status === 'accepted') { next = 'Next: convert the lead to a deal in Bitrix, then link it here'; }
    else if (['declined', 'expired'].includes(v.status)) { next = 'Next: make a new version if the customer still wants an offer'; actions = U.button(`Make a new version from version ${v.n}`, { act: 'q-new-version', data: { id: q.id }, variant: 'primary', size: 'lg', cls: 'min-h-11' }); }
    const backTo = q.subject.kind === 'deal' ? ['Back to the Deal', `/app/deals/${q.deal}`] : q.subject.kind === 'lead' ? ['Back to the Lead', `/app/leads/${q.lead}`] : ['Back to the referral draft', `/app/quotations/drafts/${q.referral}`];
    return U.backLink(backTo[1], backTo[0]) + `<header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><p class="m-0 mb-1 text-sm font-medium text-quiet"><span class="wrap-anywhere">Quotation ${q.id} · v${v.n} · ${E(subjText(q))}</span></p><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl"><span id="quote-heading" tabindex="-1" class="block wrap-anywhere outline-none">${E(q.title)}</span></h1><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${badge(word)}${linked}<span class="inline-flex items-center gap-1.5 text-copy">${TN.ic('calendar-clock', 'size-4 text-faint')}${valid}</span><span class="inline-flex items-center gap-1.5 text-copy">${TN.ic('user-round', 'size-4 text-faint')}Owner: <span class="font-semibold text-ink">${E(personName(q.owner) === 'You' ? TN.me().name : personName(q.owner))}</span></span><p class="m-0 basis-full text-base text-copy">${next}</p></div></div>${actions ? `<div class="flex min-w-min flex-wrap items-center gap-2 max-sm:[&>*]:flex-1">${actions}</div>` : ''}</header>`;
  }
  function tierBlock(q, key) {
    const t = q.tiers[key]; if (!t) return '';
    const lines = t.lines.filter((l) => !q.accepted || true);
    const tot = sum(lines.map(lineTotal)), cost = sum(lines.map(lineCost));
    const id = `quote-tier-${key}`;
    const check = t.total != null && tot !== t.total ? `<p class="m-0 flex gap-2 text-sm text-copy" role="note">${TN.ic('triangle-alert', 'mt-0.5 size-4 shrink-0 text-status-warning')}<span><span class="sr-only">Check: </span>${tierLabel(key)}: Your components add up to ${F.inr(tot)}; the quoted total is ${F.inr(t.total)} (${F.inr(Math.abs(t.total - tot))} ${t.total > tot ? 'higher' : 'lower'}). Check before sending; nothing is corrected automatically.</span></p>` : '';
    return `<section aria-labelledby="${id}-heading" class="flex flex-col gap-3 rounded-card border border-line bg-canvas px-4 py-4"><h3 id="${id}-heading" class="m-0 text-base font-semibold text-ink">${tierLabel(key)}${t.name ? `<span class="font-normal text-quiet"> · ${E(t.name)}</span>` : ''}</h3>
      <ul class="m-0 flex list-none flex-col gap-1.5 p-0 text-sm" aria-label="${tierLabel(key)}: price lines">${lines.map((l) => `<li class="m-0"><span class="font-medium text-ink">${E(l.d)}</span><span class="block text-quiet">${lineCalc(l)}</span></li>`).join('')}</ul>
      ${U.summaryList([{ label: 'Lines add up to (for comparison)', value: F.inr(tot), numeric: true }, { label: 'Quoted total', value: t.total == null ? '' : F.inr(t.total), total: true }, { label: 'GST', value: 'GST as applicable (no amount)' }])}
      <div role="group" aria-labelledby="${id}-internal" class="flex flex-col gap-1.5 rounded-control border border-dashed border-line-strong bg-card px-3 py-2.5"><p id="${id}-internal" class="m-0 flex items-center gap-1.5 text-sm font-semibold text-ink">${TN.ic('lock', 'size-3.5 text-quiet')}Internal — never printed, not on the customer copy</p>${U.summaryList([{ label: 'Our cost (internal)', value: F.inr(cost), numeric: true }, { label: 'Estimated margin (internal)', value: t.total == null ? '' : F.inr(t.total - cost), numeric: true }])}<ul class="m-0 flex list-none flex-col gap-0.5 p-0 text-sm text-copy" aria-label="${tierLabel(key)}: our cost per line (internal)">${lines.map((l) => `<li class="m-0">${E(l.d)}: our cost ${lineCost(l) == null ? 'not entered' : F.inr(lineCost(l))}</li>`).join('')}</ul></div>
      ${t.total != null ? `<p class="m-0 text-sm text-quiet">Printed as: ${printedAs(q, t)}</p>` : ''}
      ${t.plan.length ? `<div class="text-sm"><p class="m-0 font-semibold text-ink">Payment schedule if the customer confirms</p><ul class="m-0 flex list-disc flex-col gap-0.5 pl-5">${t.plan.map(([l, a, w]) => `<li>${E(l)}: ${F.inr(a)} · ${E(w)}</li>`).join('')}</ul></div>` : ''}${check}</section>`;
  }
  function offersCard(q, v) {
    const rows = [{ label: 'Trip', value: tripText(q.trip) }, { label: 'Travellers', value: travText(q.trip) }, { label: 'Services', value: `<ul class="m-0 flex list-none flex-col gap-1 p-0">${q.services.map((s, i) => `<li>${svcText(s, i)}</li>`).join('')}</ul>` }, { label: 'Validity', value: `Valid until ${F.date(v.validUntil)}` }, v.sentAt ? { label: 'Sent', value: `${F.date(v.sentAt)} by ${E(v.via)}` } : null];
    if (v.status === 'declined' && q.declineReason) rows.push({ label: 'Declined because', value: E(q.declineReason) });
    return sectionCard('quote-summary-heading', `What version ${v.n} offers`, `A sent version never changes. To change anything, make a new version. <a class="${A_INL}" href="#/app/quotations/${q.id}/preview">Preview what the customer sees</a>`, U.summaryList(rows) + `<div class="grid gap-4 lg:grid-cols-2">${tierBlock(q, 'quoted')}${tierBlock(q, 'upgrade')}</div>`);
  }
  function versionsCard(q, shown) {
    const items = q.versions.slice().reverse().map((v) => {
      const st = v.status === 'superseded' && v.sentAt ? 'Replaced by a newer version · cannot be accepted' : wordOf(q, v);
      const meta = [v.sentAt ? `Sent ${F.date(v.sentAt)}` : '', `Valid until ${F.date(v.validUntil)}`].filter(Boolean).join(' · ');
      const lk = WORD_LOOK[wordOf(q, v)] || ['neutral', 'clock'];
      return `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-3"><span class="min-w-40 flex-1">${v.n === shown ? `<span class="font-semibold text-ink">Version ${v.n} <span class="text-sm font-normal text-quiet">· shown on this page</span></span>` : `<a class="${A_INL.replace('font-medium', '')} font-semibold" href="#/app/quotations/${q.id}?v=${v.n}">Version ${v.n}</a>`}<span class="block text-sm text-quiet">${meta}</span></span>${U.badge(E(st), lk[0], { icon: lk[0] === 'info' ? 'info' : lk[1], wrap: true, sr: 'Quotation status: ' })}</li>`;
    }).join('');
    return sectionCard('quote-versions-heading', 'Versions', 'Each version is valid until its date (7 days after it was made unless changed before sharing). Sharing a version replaces the version shared before it.', `<ol class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Versions of this quotation">${items}</ol>`, { gap: 0 });
  }
  function itinerariesCard(q) {
    const list = IT().filter((i) => i.basis.q === q.id);
    const rows = list.map((i) => `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-3"><span class="min-w-40 flex-1"><a class="${A_INL.replace('font-medium', '')} font-semibold" href="#/app/itineraries/${i.id}">${E(i.title)}</a><span class="block text-sm text-quiet">${i.id} · from version ${i.basis.v} · updated ${upd(i.updated)}</span></span>${itinBadge(i)}</li>`).join('');
    return sectionCard('quote-itins-heading', 'Branded itineraries', 'A day-by-day document for the customer, made from this quotation. Nothing is sent.', (rows ? `<ul class="m-0 flex list-none flex-col gap-2 p-0">${rows}</ul>` : '<p class="m-0 text-copy">No itinerary made from this quotation yet.</p>') + `<div>${U.button('Make branded itinerary', { act: 'it-make', data: { q: q.id }, icon: 'map', size: 'lg', cls: 'min-h-11' })}</div>`);
  }
  function answerCard(q, v) {
    const ev = TN._qEvidence && TN._qEvidence[q.id];
    const tiers = ['quoted', 'upgrade'].filter((k) => q.tiers[k]);
    const err = TN._qAnsErr;
    const fileHtml = ev ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Files of this version">${fileRow(ev, `Customer’s written acceptance · stored ${F.date(TN.TODAY)}`)}</ul>` : '<p class="m-0 text-copy">No file uploaded yet.</p>';
    return sectionCard('quote-answer-heading', 'Customer’s answer', 'Upload their written yes for this version, then mark it accepted. A phone call or Bitrix stage is not proof.', `${fileHtml}
      <form class="flex flex-col gap-3" aria-label="Upload the written acceptance" data-act="q-upload-ok" data-id="${q.id}" novalidate>${U.field({ id: 'quote-evidence-file', label: 'Customer’s written acceptance', hint: `The customer’s written “yes” to version ${v.n} (screenshot of the message, e-mail or signed copy). PDF, JPG, PNG or WebP, up to 4 MB.`, error: err === 'file' ? 'Choose the file first. Nothing was uploaded.' : '', input: { type: 'file', name: 'file', attrs: { accept: 'application/pdf,image/jpeg,image/png,image/webp' } } })}<div>${U.button(`${TN.ic('upload')} Upload file`, { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}</div></form>
      <form class="flex flex-col gap-4" aria-label="Mark accepted" data-act="q-accept" data-id="${q.id}" novalidate>${U.choices({ id: 'quote-accept-tier', legend: 'Which option did the customer accept?', type: 'radio', name: 'tier', error: err === 'tier' ? 'Choose the option the customer accepted.' : '', items: tiers.map((k) => ({ id: `quote-accept-tier-${k}`, value: k, label: `${tierLabel(k)}${q.tiers[k].name ? ' · ' + E(q.tiers[k].name) : ''}`, description: `Quoted total ${F.inr(q.tiers[k].total)}`, checked: tiers.length === 1 })) })}
        <p id="quote-accept-file" class="m-0 text-copy">${ev ? `Proof for this version: ${E(ev)}.` : 'Upload the customer’s written acceptance first; it is the proof for this version.'}</p><div>${U.button('Mark accepted', { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal', disabled: !ev })}</div><p class="m-0 text-sm text-quiet">Accepting does not book anything. Any open draft of this quotation is discarded.</p></form>
      <div class="border-t border-line pt-4"><form class="flex flex-col gap-3" aria-label="Record the decline" data-act="q-decline" data-id="${q.id}" novalidate><div class="max-w-sm">${U.field({ id: 'quote-decline-reason', label: 'Why did the customer decline?', error: err === 'reason' ? 'Choose a reason.' : '', select: { name: 'reason', placeholder: 'Choose a reason', options: ['Price', 'Dates did not suit', 'Customer changed plans', 'Chose another company', 'No response', 'Other reason'], change: 'q-decline-pick' } })}</div><div>${U.button('Mark declined', { type: 'submit', cls: 'min-h-11' })}</div></form></div>`, { anchor: 'quote-answer', focus: true, basis: true, gap: 5 });
  }
  function acceptedCard(q) {
    const a = q.accepted || {};
    const link = q.deal ? note('circle-check', 'text-status-success', `Linked to deal <a class="${A_INL}" href="#/app/deals/${q.deal}">${q.deal} · ${E((TN.deal(q.deal) || {}).title || '')}</a>.`) : `<div class="flex flex-col gap-2"><p class="m-0 font-semibold text-ink">Waiting for the Bitrix deal</p><p class="m-0 text-copy">Waiting for the deal. Convert the lead to a deal in Bitrix; it will appear here to link.</p><details class="group/more text-sm"><summary class="inline-flex min-h-8 cursor-pointer list-none items-center gap-1 rounded-chip font-medium text-brand-strong [&::-webkit-details-marker]:hidden ${FO}">${TN.ic('chevron-right', 'size-4 shrink-0 transition-transform duration-(--ui-duration-quick) group-open/more:rotate-90 motion-reduce:transition-none')}The CRM does not change Bitrix. Why?</summary><p class="m-0 mt-1.5 text-copy">The CRM never converts a lead or changes a Bitrix stage. When Bitrix sends the deal made from this lead, it appears here to link.</p></details></div>`;
    const booked = q.converted ? note('circle-check', 'text-status-success', `Booking started from this quotation. <a class="${A_INL}" href="#/app/deals/${q.deal}/book">Open the booking</a>.`) : '';
    return sectionCard('quote-accepted-heading', 'Acceptance and booking', '', link + booked + (a.file ? `<ul class="m-0 flex list-none flex-col gap-2 p-0" aria-label="Files of this version">${fileRow(a.file, `Customer’s written acceptance · ${E(a.size || '120 KB')} · stored ${F.date(a.at)}`)}</ul>` : '') + (a.tier ? `<p class="m-0 text-sm text-quiet">Accepted: ${tierLabel(a.tier)}${q.tiers[a.tier] && q.tiers[a.tier].name ? ' · ' + E(q.tiers[a.tier].name) : ''}, ${F.inr(q.tiers[a.tier].total)}.</p>` : ''));
  }
  function costsCard(q) {
    const lines = ['quoted', 'upgrade'].flatMap((k) => (q.tiers[k] ? q.tiers[k].lines : [])).filter((l, i, arr) => arr.findIndex((x) => x.d === l.d) === i);
    const unitTxt = (l) => (l.u === 'line' ? 'Total for the line' : l.u === 'room' ? 'Per room per night' : l.u === 'trip' ? 'Per trip' : l.u === 'person' ? 'Per person' : 'Per night');
    return sectionCard('quote-costs-heading', 'Our cost estimates (internal)', 'Update our costs (internal). The customer’s quotation does not change.', `<form class="flex flex-col gap-3" aria-label="Our cost estimates" data-act="q-save-costs" data-id="${q.id}" novalidate><div class="grid gap-3 sm:grid-cols-2">${lines.map((l, i) => U.field({ id: `q-cost-${i + 1}`, label: `Line ${i + 1}: ${E(l.d)}`, optional: true, hint: `${unitTxt(l)} · price ${F.inr(l.p)}`, money: { name: 'c' + i, value: l.c == null ? '' : l.c } })).join('')}</div><div class="flex flex-wrap items-center gap-3">${U.button('Save cost estimates', { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}<span class="text-sm text-quiet" aria-live="polite">All saved</span></div></form>`, { basis: true });
  }

  /* ---------- Editor (draft and ready) ---------- */
  const PART = [['details', 'Trip'], ['contact', 'Customer'], ['services', 'Services'], ['narrative', 'Day plan and terms'], ['money', 'Prices'], ['plan', 'Payment plan']];
  const PART_STATE = { saved: ['circle-check', 'text-status-success', 'Saved'], draft: ['pen-line', 'text-status-warning', 'Not finished'], not_started: ['circle-dashed', 'text-quiet', 'Not started'] };
  function partShell(q, i, key, title, intro, body, open) {
    const st = PART_STATE[q.parts[key]] || PART_STATE.saved;
    return `<div class="${U.CARD}" data-slot="card"><section id="${key}" data-part="${key}" aria-labelledby="${key}-heading" class="scroll-mt-24"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-2"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink w-full outline-none" id="${key}-heading" tabindex="-1"><button type="button" aria-expanded="${open ? 'true' : 'false'}" aria-controls="${key}-body" data-act="q-part-toggle" data-part="${key}" class="m-0 flex min-h-11 w-full items-center gap-2.5 rounded-control border-0 bg-transparent px-0 text-left text-lg font-semibold text-ink shadow-none ${FO}"><span class="min-w-0 flex-1"><span class="tabular-nums">${i}.</span> ${title}</span><span class="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-copy">${TN.ic(st[0], 'size-4 ' + st[1])}${st[2]}</span>${TN.ic('chevron-down', 'size-4.5 shrink-0 text-quiet transition-transform motion-reduce:transition-none' + (open ? ' rotate-180' : ''))}</button></h2></div><div id="${key}-body"${open ? '' : ' hidden="" class="hidden"'}><div class="px-4.5 py-4 flex flex-col gap-4"><p class="m-0 text-quiet">${intro}</p><form class="flex flex-col gap-4" data-act="q-save-part" data-id="${q.id}" data-part="${key}" aria-label="${title}" novalidate>${body}<div class="flex flex-wrap items-center gap-3">${U.button(saveLabel(key), { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}<span class="text-sm text-quiet" aria-live="polite">${q.parts[key] === 'saved' ? 'All saved' : 'Not saved yet'}</span></div></form></div></div></section></div>`;
  }
  const saveLabel = (k) => ({ details: 'Save trip and travellers', contact: 'Save contact', services: 'Save services', narrative: 'Save day-by-day and terms', money: 'Save prices', plan: 'Save payment schedule' }[k]);
  const fld = (id, label, val, o = {}) => U.field({ id, label, optional: o.optional, hint: o.hint, cls: o.cls, input: { name: o.name || id, value: val ?? '', type: o.type || 'text', autoComplete: 'off', inputMode: o.mode } });
  const area = (id, label, val, o = {}) => U.field({ id, label, optional: true, hint: o.hint, cls: o.cls, textarea: { name: o.name || id, value: val || '', rows: o.rows || 3 } });
  function editorParts(q) {
    const t = q.trip, open = TN._qOpen || {};
    const details = U.fieldset({ legend: 'Trip', body: `<div class="grid gap-4 sm:grid-cols-2">${fld('q-details-destination', 'Destination', t.dest, { name: 'dest' })}${U.field({ id: 'q-details-tripScope', label: 'Domestic or international', select: { name: 'scope', placeholder: 'Choose', options: ['Domestic', 'International'], value: t.scope } })}${fld('q-details-tripStart', 'Start date', t.start, { type: 'date', name: 'start' })}${fld('q-details-tripEnd', 'End date', t.end, { type: 'date', name: 'end' })}</div>` })
      + U.fieldset({ legend: 'Travellers', body: `<div class="mb-3 flex flex-wrap items-start justify-between gap-2"><p class="m-0 text-sm text-quiet">Adults and children are counted for the per-person price; infants are not.</p></div><div class="grid gap-4 sm:grid-cols-2">${fld('q-details-adults', 'Adults', t.adults, { type: 'number', mode: 'numeric', name: 'adults' })}${fld('q-details-childrenWithBed', 'Children with a bed', t.cwb || '', { type: 'number', optional: true, mode: 'numeric', name: 'cwb' })}${fld('q-details-childrenNoBed', 'Children without a bed', t.cnb || '', { type: 'number', optional: true, mode: 'numeric', name: 'cnb' })}${fld('q-details-infants', 'Infants', t.infants || '', { type: 'number', optional: true, mode: 'numeric', name: 'infants' })}</div>` })
      + area('q-details-requirementsNote', 'What the customer asked for', t.asked, { name: 'asked', hint: 'Internal — not printed.' })
      + `<div class="max-w-xs">${fld('q-details-validUntil', 'Valid until', cur(q).validUntil, { type: 'date', optional: true, name: 'validUntil', hint: 'Set to 7 days after the quotation was made. Change it before you share it if needed.' })}</div>`;
    const c = q.customer;
    const contact = `<div class="grid gap-4 sm:grid-cols-2">${fld('q-contact-contactName', 'Customer name', c.name, { name: 'name' })}${fld('q-contact-companyName', 'Company', c.company, { optional: true, name: 'company' })}${fld('q-contact-mobile', 'Mobile', c.mobile, { optional: true, type: 'tel', mode: 'tel', name: 'mobile' })}${fld('q-contact-email', 'E-mail', c.email, { optional: true, type: 'email', mode: 'email', name: 'email' })}</div>`;
    const svcRows = q.services.map((s, i) => `<details class="group rounded-card border border-line bg-card"><summary class="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 rounded-card px-4 py-3 [&::-webkit-details-marker]:hidden ${FO}"><span class="min-w-0 flex-1"><span class="block font-semibold text-ink">Service ${i + 1} · ${{ hotel: 'Hotel', transfer: 'Transfer or cab', activity: 'Activity', visa: 'Visa', flight: 'Flight' }[s.kind]}</span><span class="block text-sm text-quiet">${svcText(s, i).replace(/^Service \d+: [^·]+· /, '')}</span></span><span class="text-sm font-medium text-brand-strong">Edit the details of service ${i + 1}</span>${TN.ic('chevron-down', 'size-4.5 shrink-0 text-quiet transition-transform group-open:rotate-180 motion-reduce:transition-none')}</summary><div class="grid gap-4 border-t border-line px-4 py-4 sm:grid-cols-2">${s.kind === 'hotel' ? fld(`q-s${i}-hotel`, 'Requested hotel', s.name, { hint: 'The hotel Purchase actually books is recorded later by Purchase.' }) + fld(`q-s${i}-city`, 'City', s.city) + fld(`q-s${i}-in`, 'Check-in', s.checkin, { type: 'date' }) + fld(`q-s${i}-out`, 'Check-out', s.checkout, { type: 'date' }) + fld(`q-s${i}-rooms`, 'Rooms', s.rooms, { type: 'number', mode: 'numeric' }) + fld(`q-s${i}-room`, 'Room type', s.room, { optional: true }) + fld(`q-s${i}-meal`, 'Meal plan', s.meal, { optional: true }) : s.kind === 'activity' ? fld(`q-s${i}-name`, 'Activity', s.name) + fld(`q-s${i}-city`, 'City', s.city) + fld(`q-s${i}-date`, 'Date', s.date, { type: 'date' }) : s.kind === 'visa' ? fld(`q-s${i}-country`, 'Destination country', s.country) + fld(`q-s${i}-purpose`, 'Purpose', s.purpose) : fld(`q-s${i}-text`, s.kind === 'flight' ? 'Route' : 'Pickup and drop', s.text) + fld(`q-s${i}-date`, 'Date', s.date, { type: 'date' })}<div class="flex flex-wrap gap-2 sm:col-span-2">${U.button(`Remove service ${i + 1}`, { act: 'q-remove-service', data: { id: q.id, i }, variant: 'ghost', icon: 'trash', cls: 'min-h-11' })}</div></div></details>`).join('');
    const services = (svcRows ? `<div class="flex flex-col gap-3">${svcRows}</div>` : '<p class="m-0 text-copy">No services yet. Add the hotels, transfers, activities or visa the customer asked for.</p>')
      + `<div class="flex flex-wrap items-end gap-3"><div class="min-w-48">${U.field({ id: 'q-add-kind', label: 'Add a service', select: { name: 'addKind', placeholder: 'Choose', options: ['Hotel', 'Transfer or cab', 'Activity', 'Visa', 'Flight'] } })}</div>${U.button('Add service', { act: 'q-add-service', data: { id: q.id }, icon: 'plus', cls: 'min-h-11' })}</div><p class="m-0 text-sm text-quiet">Train bookings are deferred and can’t be added.</p>`;
    const days = q.days.length ? q.days : [['', '', '']];
    const narrative = days.map((d, i) => U.fieldset({ legend: `Day ${i + 1}`, body: `<div class="grid gap-4 sm:grid-cols-2">${fld(`q-day-${i}-title`, 'Title', d[0], { name: `dayTitle${i}` })}${fld(`q-day-${i}-where`, 'Where', d[1], { optional: true, name: `dayWhere${i}` })}${area(`q-day-${i}-text`, 'What happens', d[2], { cls: 'sm:col-span-2', rows: 2, name: `dayText${i}` })}</div>` })).join('')
      + `<div>${U.button(`Add day ${days.length + 1}`, { act: 'q-add-day', data: { id: q.id }, icon: 'plus', cls: 'min-h-11' })}</div>`
      + area('q-included', 'Included', q.included.join('\n'), { name: 'included', hint: 'One per line.' }) + area('q-excluded', 'Not included', q.excluded.join('\n'), { name: 'excluded', hint: 'One per line.' }) + area('q-terms', 'Terms', q.terms.join('\n'), { name: 'terms', hint: 'One per line, for example “Hotels are held only after confirmation.”' });
    const tierEd = (key) => { const tr = q.tiers[key]; if (!tr) return ''; const tot = sum(tr.lines.map(lineTotal)), cost = sum(tr.lines.map(lineCost));
      return `<section class="flex flex-col gap-3 rounded-card border border-line bg-canvas px-4 py-4" aria-labelledby="q-${key}-sum"><h3 id="q-${key}-sum" class="m-0 text-base font-semibold text-ink">${tierLabel(key)}${tr.name ? `<span class="font-normal text-quiet"> · ${E(tr.name)}</span>` : ''}</h3>
        <ul class="m-0 flex list-none flex-col gap-1.5 p-0 text-sm">${tr.lines.map((l) => `<li class="m-0"><span class="font-medium text-ink">${E(l.d)}</span><span class="block text-quiet">${lineCalc(l)}${l.c == null ? ' · our cost not entered' : ''}</span></li>`).join('') || '<li class="m-0 text-quiet">No price lines yet.</li>'}</ul>
        ${U.summaryList([{ label: 'Lines add up to (for comparison)', value: F.inr(tot), numeric: true }])}
        <div role="group" class="flex flex-col gap-1.5 rounded-control border border-dashed border-line-strong bg-card px-3 py-2.5"><p class="m-0 flex items-center gap-1.5 text-sm font-semibold text-ink">${TN.ic('lock', 'size-3.5 text-quiet')}Internal — never printed, not on the customer copy</p>${U.summaryList([{ label: 'Our cost (internal)', value: F.inr(cost), numeric: true }, { label: 'Estimated margin (internal)', value: tr.total == null ? '' : F.inr(tr.total - cost), numeric: true }])}</div>
        ${U.field({ id: `q-${key}-total`, label: 'Final quoted total ₹', hint: 'What the customer pays for this option.', money: { name: `total_${key}`, value: tr.total ?? '' } })}
        ${U.checkbox({ id: `q-${key}-pp`, name: `pp_${key}`, label: 'Print the per-person price when it is exact', checked: tr.perPerson, description: 'Prints “GST as applicable”. No GST amount.' })}
        ${tr.total != null ? `<p class="m-0 text-sm text-quiet">Printed as: ${printedAs(q, tr)} (${pl(paying(q.trip), 'paying traveller')}).</p>` : ''}</section>`; };
    const money = U.fieldset({ legend: 'Options offered', body: `<p class="m-0 mb-3 text-sm text-quiet">Your main option, and an optional upgrade. The customer picks one.</p><div class="grid gap-4 sm:grid-cols-2">${fld('q-tier-quoted-name', 'Quoted option', q.tiers.quoted.name, { name: 'name_quoted', hint: 'For example: Deluxe rooms.' })}${q.tiers.upgrade ? fld('q-tier-upgrade-name', 'Upgrade option', q.tiers.upgrade.name, { name: 'name_upgrade', hint: 'For example: Suites.' }) : ''}</div>` }) + `<div class="grid gap-4 lg:grid-cols-2">${tierEd('quoted')}${tierEd('upgrade')}</div>`;
    const planEd = ['quoted', 'upgrade'].filter((k) => q.tiers[k]).map((k) => { const tr = q.tiers[k]; const tot = sum(tr.plan.map((x) => x[1]));
      return `<section class="flex flex-col gap-3" aria-labelledby="q-plan-${k}"><h3 id="q-plan-${k}" class="m-0 text-base font-semibold text-ink">${tierLabel(k)}</h3>${tr.plan.length ? tr.plan.map((x, i) => `<div class="grid gap-3 sm:grid-cols-3">${fld(`q-plan-${k}-${i}-label`, `Payment ${i + 1}`, x[0], { name: `pl_${k}_${i}`, hint: 'For example: Advance.' })}${U.field({ id: `q-plan-${k}-${i}-amt`, label: 'Amount ₹', money: { name: `pa_${k}_${i}`, value: x[1] } })}${fld(`q-plan-${k}-${i}-due`, 'Due', x[2], { name: `pd_${k}_${i}` })}</div>`).join('') + `<p class="m-0 text-sm text-quiet">Adds up to ${F.inr(tot)}${tr.total != null ? (tot === tr.total ? ' · equals the quoted total' : ` · ${F.inr(Math.abs(tr.total - tot))} ${tot > tr.total ? 'more' : 'less'} than the quoted total`) : ''}</p>` : '<p class="m-0 text-copy">No payment plan. Sales can add it on the booking.</p>'}</section>`; }).join('');
    return [
      partShell(q, 1, 'details', 'Trip', 'Numbers only. Names go on the booking later.', details, open.details),
      partShell(q, 2, 'contact', 'Customer', `Printed as “For ${E(c.name)}”. Mobile or email needed.`, contact, open.contact),
      partShell(q, 3, 'services', 'Services', 'These details copy into the booking later.', services, open.services),
      partShell(q, 4, 'narrative', 'Day plan and terms', 'Customer sees this. Do not write costs or supplier names.', narrative, open.narrative),
      partShell(q, 5, 'money', 'Prices', 'You type each price and the final total. The CRM never changes your total and never calculates GST.', money, open.money),
      partShell(q, 6, 'plan', 'Payment plan', 'Optional. Must add up to the option total.', planEd, open.plan),
    ].join('');
  }
  function worth(q) {
    const w = [];
    ['quoted', 'upgrade'].forEach((k) => { const t = q.tiers[k]; if (t && t.total != null && sum(t.lines.map(lineTotal)) !== t.total) w.push('The line prices do not add up to the quoted total. Allowed: the customer sees categories without amounts.'); });
    if (q.services.some((s) => s.kind === 'hotel' && !s.room)) w.push('A hotel has no room type. The customer copy shows [Room type].');
    return [...new Set(w)];
  }
  const blockers = (q) => { const b = []; if (!q.services.length) b.push('Add at least one service.'); if (q.tiers.quoted.total == null) b.push('Type the final quoted total.'); if (!q.customer.mobile && !q.customer.email) b.push('Add a mobile number or email.'); if (!q.trip.dest || !q.trip.start) b.push('Add the destination and dates.'); return b; };
  function readinessCard(q) {
    const st = cur(q).status, done = PART.filter(([k]) => q.parts[k] === 'saved').length, w = worth(q), b = blockers(q);
    const title = st === 'ready' ? 'Ready to share' : untouched(q) ? 'Not started' : `${done} of ${PART.length} parts done`;
    const items = PART.map(([k, l], i) => { const s = PART_STATE[q.parts[k]] || PART_STATE.saved; return `<li class="m-0"><a href="#${k}" data-act="q-jump" data-target="${k}" class="flex min-h-11 items-center gap-2 rounded-control px-1.5 text-copy no-underline hover:bg-wash hover:text-ink ${FO}">${TN.ic(s[0], 'size-4 shrink-0 ' + s[1])}<span class="min-w-0 flex-1">${i + 1}. ${l}</span><span class="shrink-0 text-sm text-quiet">${s[2]}</span></a></li>`; }).join('');
    const warn = (list, head, icon, cls) => list.length ? `<div><p class="m-0 text-sm font-semibold text-ink">${head}</p><ul class="m-0 mt-1.5 flex list-none flex-col gap-1.5 p-0 text-sm">${list.map((x) => `<li class="m-0 flex gap-2">${TN.ic(icon, 'mt-0.5 size-4 shrink-0 ' + cls)}<span>${x}</span></li>`).join('')}</ul></div>` : '';
    return `<div class="${U.CARD} [@media(min-width:64rem)_and_(min-height:48rem)]:sticky [@media(min-width:64rem)_and_(min-height:48rem)]:top-20" data-slot="card"><section aria-labelledby="quote-readiness-heading"><div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4.5 py-3.5"><h2 class="m-0 text-lg leading-6 font-semibold tracking-[-0.005em] text-ink" id="quote-readiness-heading">${title}</h2><p class="m-0 text-sm text-quiet basis-full">${st === 'ready' ? 'Any change moves it back to draft.' : 'Finish each part, then mark it ready.'}</p></div><div class="px-4.5 py-4 flex flex-col gap-4"><ul class="m-0 flex list-none flex-col gap-1 p-0" aria-label="Parts of this quotation">${items}</ul>${st === 'draft' ? warn(b, `Still needed (${b.length})`, 'circle-alert', 'text-status-danger') : ''}${warn(w.map((x) => `<a href="#money" data-act="q-jump" data-target="money" class="${A_INL}"><span class="sr-only">Worth checking: </span>${x}</a>`), `Worth checking (${w.length}) — these do not stop sharing`, 'triangle-alert', 'text-status-warning')}</div></section></div>`;
  }

  TN.page('/app/quotations/:id', { nav: '/app/quotations', roles: ['sales', 'manager'], title: (p) => (qById(p.id) || {}).title || 'Quotation', canOpen: (p) => !!qById(p.id),
    render(p, qy) {
      const q = qById(p.id);
      if (!q) return U.notAllowed({ title: 'Quotation not found', text: 'There is no quotation with this reference that you can open.', back: { href: '#/app/quotations', label: 'Back to Quotations' } });
      const vn = Number(qy.v) || cur(q).n, v = q.versions.find((x) => x.n === vn) || cur(q), old = v !== cur(q);
      const err = TN._qAnsErr; TN._qAnsErr = null;
      let body;
      if (!old && ['draft', 'ready'].includes(v.status)) {
        body = `<div class="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]"><div class="flex min-w-0 flex-col gap-5">${editorParts(q)}</div>${readinessCard(q)}</div>` + versionsCard(q, v.n);
      } else {
        const parts = [];
        if (!old && v.status === 'sent') { TN._qAnsErr = err; parts.push(answerCard(q, v)); TN._qAnsErr = null; }
        if (!old && v.status === 'accepted') parts.push(acceptedCard(q));
        parts.push(offersCard(q, v));
        if (!old && v.status === 'accepted') parts.push(costsCard(q));
        parts.push(versionsCard(q, v.n));
        if (!old && ['sent', 'accepted'].includes(v.status)) parts.push(itinerariesCard(q));
        body = parts.join('');
      }
      return U.page(header(q, v, old) + `<div class="flex flex-col gap-5">${segNav(q, false, 'The customer copy shows how the quotation will look. Nothing is sent.')}${body}</div>`);
    } });

  /* ---------- Quotation actions ---------- */
  const touch = (q) => { q.updated = now(); };
  TN.act('q-jump', (el) => { const t = document.getElementById(el.dataset.target); if (!t) return; const body = document.getElementById(el.dataset.target + '-body'); if (body && body.hidden) { (TN._qOpen = TN._qOpen || {})[el.dataset.target] = true; TN.refresh(); setTimeout(() => { const n = document.getElementById(el.dataset.target); if (n) { n.scrollIntoView({ block: 'start' }); const h = document.getElementById(el.dataset.target + '-heading'); h && h.focus(); } }, 0); return; } t.scrollIntoView({ block: 'start' }); t.focus && t.focus(); });
  TN.act('q-part-toggle', (el) => { const k = el.dataset.part; TN._qOpen = TN._qOpen || {}; TN._qOpen[k] = !TN._qOpen[k]; const body = document.getElementById(k + '-body'); if (body) { body.hidden = !TN._qOpen[k]; body.className = TN._qOpen[k] ? '' : 'hidden'; el.setAttribute('aria-expanded', String(!!TN._qOpen[k])); const ch = el.querySelector('svg:last-child'); if (ch) ch.classList.toggle('rotate-180', !!TN._qOpen[k]); } });
  TN.act('q-save-part', (f) => {
    const q = qById(f.dataset.id), k = f.dataset.part, fd = new FormData(f), g = (n) => (fd.get(n) ?? '').toString().trim();
    if (k === 'details') { if (!g('dest') || !g('start') || !g('end')) { TN.toast('Not saved', 'danger', 'Add the destination, start date and end date. Your typed details are still here.'); return; } if (g('end') < g('start')) { TN.toast('Not saved', 'danger', 'The end date must be on or after the start date.'); return; } Object.assign(q.trip, { dest: g('dest'), scope: g('scope') || q.trip.scope, start: g('start'), end: g('end'), adults: Number(g('adults')) || 0, cwb: Number(g('cwb')) || 0, cnb: Number(g('cnb')) || 0, infants: Number(g('infants')) || 0, asked: g('asked') }); if (g('validUntil')) cur(q).validUntil = g('validUntil'); }
    if (k === 'contact') { if (!g('name')) { TN.toast('Not saved', 'danger', 'Enter the customer name.'); return; } if (!g('mobile') && !g('email')) { TN.toast('Not saved', 'danger', 'Add a mobile number or an e-mail.'); return; } Object.assign(q.customer, { name: g('name'), company: g('company'), mobile: g('mobile'), email: g('email') }); }
    if (k === 'narrative') { q.days = q.days.length ? q.days : [['', '', '']]; q.days = q.days.map((d, i) => [g('dayTitle' + i), g('dayWhere' + i), g('dayText' + i)]).filter((d) => d[0] || d[2]); q.included = g('included').split('\n').map((s) => s.trim()).filter(Boolean); q.excluded = g('excluded').split('\n').map((s) => s.trim()).filter(Boolean); q.terms = g('terms').split('\n').map((s) => s.trim()).filter(Boolean); }
    if (k === 'money') { ['quoted', 'upgrade'].forEach((t) => { if (!q.tiers[t]) return; const v = g('total_' + t).replace(/[^\d]/g, ''); q.tiers[t].total = v ? Number(v) : null; q.tiers[t].perPerson = fd.get('pp_' + t) != null; if (fd.get('name_' + t) != null) q.tiers[t].name = g('name_' + t); }); }
    if (k === 'plan') { ['quoted', 'upgrade'].forEach((t) => { if (!q.tiers[t]) return; q.tiers[t].plan = q.tiers[t].plan.map((x, i) => [g(`pl_${t}_${i}`) || x[0], Number(g(`pa_${t}_${i}`).replace(/[^\d]/g, '')) || 0, g(`pd_${t}_${i}`) || x[2]]); }); }
    q.parts[k] = 'saved'; if (cur(q).status === 'ready') cur(q).status = 'draft'; touch(q);
    TN.toast(`${PART.find((x) => x[0] === k)[1]} saved`); TN.refresh();
  });
  TN.act('q-add-service', (el) => {
    const q = qById(el.dataset.id), sel = document.getElementById('q-add-kind'), kind = sel && sel.value;
    if (!kind) { TN.toast('Choose a service first', 'warning', 'Pick Hotel, Transfer or cab, Activity, Visa or Flight.'); return; }
    const t = q.trip, map = { Hotel: { kind: 'hotel', name: '', city: '', checkin: t.start, checkout: t.end, rooms: 1, room: '', meal: '', tier: 'quoted' }, 'Transfer or cab': { kind: 'transfer', text: '', date: t.start }, Activity: { kind: 'activity', name: '', city: '', date: t.start }, Visa: { kind: 'visa', country: '', purpose: 'Tourism' }, Flight: { kind: 'flight', text: '', date: t.start } };
    q.services.push(map[kind]); q.parts.services = 'draft'; if (cur(q).status === 'ready') cur(q).status = 'draft'; touch(q);
    (TN._qOpen = TN._qOpen || {}).services = true; TN.toast(`${kind} added as service ${q.services.length}. Fill its details and save.`, 'info'); TN.refresh();
  });
  TN.act('q-remove-service', (el) => { const q = qById(el.dataset.id); q.services.splice(Number(el.dataset.i), 1); q.parts.services = 'draft'; if (cur(q).status === 'ready') cur(q).status = 'draft'; touch(q); TN.toast('Service removed'); TN.refresh(); });
  TN.act('q-add-day', (el) => { const q = qById(el.dataset.id); if (!q.days.length) q.days.push(['', '', '']); q.days.push(['', '', '']); q.parts.narrative = 'draft'; (TN._qOpen = TN._qOpen || {}).narrative = true; TN.refresh(); });
  TN.act('q-mark-ready', (el) => {
    const q = qById(el.dataset.id), b = blockers(q);
    if (b.length) { TN.toast('Not ready yet', 'danger', b.join(' ')); return; }
    PART.forEach(([k]) => { if (q.parts[k] !== 'saved') q.parts[k] = 'saved'; });
    cur(q).status = 'ready'; touch(q); TN.toast('Marked ready to share', 'success', 'Check the customer copy, share it yourself, then mark it as shared.'); TN.refresh();
  });
  TN.act('q-discard', (el) => {
    const q = qById(el.dataset.id);
    TN.dialog({ title: 'Discard this draft?', description: `${q.id} version ${cur(q).n}`, tone: 'danger', body: `<p class="m-0">${q.versions.length > 1 ? `Version ${cur(q).n} is removed. Version ${q.versions[q.versions.length - 2].n} stays as it is.` : 'The quotation moves to Closed drafts. You can still open it by its reference.'} Nothing is sent.</p>`,
      footer: U.button('Keep the draft', { attrs: { 'data-close': '' } }) + U.button('Discard this draft', { variant: 'danger', act: 'q-discard-yes', data: { id: q.id } }) });
  });
  TN.act('q-discard-yes', (el) => { const q = qById(el.dataset.id); TN.closeOverlay(); if (q.versions.length > 1) q.versions.pop(); else cur(q).status = 'discarded'; touch(q); TN.toast('Draft discarded'); TN.go(q.status === 'discarded' ? '/app/quotations' : '/app/quotations/' + q.id); });
  TN.act('q-mark-shared', (el) => {
    const q = qById(el.dataset.id), v = cur(q);
    TN.dialog({ title: `Mark version ${v.n} as shared?`, description: `${q.id} · ${q.customer.name}`, body: `<form id="q-share-form" data-act="q-share-yes" data-id="${q.id}" class="flex flex-col gap-4" novalidate><p class="m-0">The CRM does not send it. Share the customer copy yourself first (download or print it, then WhatsApp or e-mail it), then record it here.</p>${U.field({ id: 'q-share-via', label: 'How did you share it?', select: { name: 'via', options: ['WhatsApp', 'E-mail', 'In person', 'Other'], value: 'WhatsApp' } })}${U.field({ id: 'q-share-date', label: 'Shared on', input: { type: 'date', name: 'date', value: TN.TODAY } })}<p class="m-0 text-sm text-quiet">Valid until ${F.date(v.validUntil)}. ${q.versions.some((x) => x.status === 'sent') ? 'The version shared before this one is replaced and can no longer be accepted.' : ''}</p></form>`,
      footer: U.button('Cancel', { attrs: { 'data-close': '' } }) + U.button('Mark as shared', { variant: 'primary', type: 'submit', attrs: { form: 'q-share-form' } }) });
  });
  TN.act('q-share-yes', (f) => {
    const q = qById(f.dataset.id), fd = new FormData(f), v = cur(q);
    q.versions.forEach((x) => { if (x !== v && x.status === 'sent') x.status = 'superseded'; });
    Object.assign(v, { status: 'sent', sentAt: fd.get('date') || TN.TODAY, via: fd.get('via') }); touch(q);
    if (q.lead) { const l = TN.DATA.leads.find((x) => x.id === q.lead); if (l) l.quotationSent = true; }
    TN.closeOverlay(); TN.toast(`Version ${v.n} marked as shared`, 'success', 'Record the customer’s written answer when it comes.'); TN.refresh();
  });
  TN.act('q-new-version', (el) => {
    const q = qById(el.dataset.id), v = cur(q);
    if (['draft', 'ready'].includes(v.status)) return TN.go('/app/quotations/' + q.id);
    q.versions.push({ n: v.n + 1, status: 'draft', made: TN.TODAY, validUntil: iso(TN.TODAY, 7), changed: '' });
    if (['declined', 'expired'].includes(v.status)) v.status = v.status; // stays as the customer left it
    PART.forEach(([k]) => { q.parts[k] = 'saved'; }); q.accepted = null; touch(q);
    TN.toast(`Version ${v.n + 1} made from version ${v.n}`, 'success', 'Change what the customer asked for, then mark it ready and share it.'); TN.go('/app/quotations/' + q.id);
  });
  TN.act('q-upload-ok', (f) => {
    const q = qById(f.dataset.id), file = f.querySelector('input[type=file]').files[0];
    if (!file) { TN._qAnsErr = 'file'; return TN.refresh(); }
    if (file.size > 4 * 1024 * 1024) { TN.toast('Not uploaded', 'danger', `${file.name} is over 4 MB.`); return; }
    (TN._qEvidence = TN._qEvidence || {})[q.id] = file.name; TN.toast('Acceptance file stored', 'success', 'Now choose the option and mark it accepted.'); TN.refresh();
  });
  TN.act('q-accept', (f) => {
    const q = qById(f.dataset.id), tier = new FormData(f).get('tier'), ev = TN._qEvidence && TN._qEvidence[q.id];
    if (!ev) { TN._qAnsErr = 'file'; return TN.refresh(); }
    if (!tier) { TN._qAnsErr = 'tier'; return TN.refresh(); }
    cur(q).status = 'accepted'; q.accepted = { tier, file: ev, size: '140 KB', at: TN.TODAY }; touch(q);
    if (q.deal) { const d = TN.deal(q.deal); if (d && d.bookingState === 'not_started') { d.bookingState = 'quotation_accepted'; d.quotation = q.id; } }
    if (!q.items) q.items = q.services.filter((s) => !s.tier || s.tier === tier).map((s) => s.kind === 'hotel' ? { kind: 'hotel', city: s.city, name: s.name, checkin: s.checkin, nights: nightsOf(s.checkin, s.checkout), room: s.room, meal: s.meal, rooms: s.rooms } : s.kind === 'activity' ? { kind: 'activity', name: s.name, city: s.city, date: s.date } : s.kind === 'visa' ? { kind: 'visa', country: s.country } : { kind: 'transfer', carKind: 'p2p', pickup: s.text, drop: '', date: s.date });
    TN.toast('Marked accepted', 'success', q.deal ? 'Start the booking from this quotation when you are ready.' : 'Convert the lead to a deal in Bitrix; it appears here to link.'); TN.refresh();
  });
  TN.act('q-decline', (f) => {
    const q = qById(f.dataset.id), reason = new FormData(f).get('reason');
    if (!reason) { TN._qAnsErr = 'reason'; return TN.refresh(); }
    cur(q).status = 'declined'; q.declineReason = reason; touch(q); TN.toast('Marked declined', 'info', 'You can make a new version if the customer still wants an offer.'); TN.refresh();
  });
  TN.act('q-decline-pick', () => {});
  TN.act('q-save-costs', (f) => {
    const q = qById(f.dataset.id), fd = new FormData(f);
    const lines = ['quoted', 'upgrade'].flatMap((k) => (q.tiers[k] ? q.tiers[k].lines : [])); const uniq = lines.filter((l, i, arr) => arr.findIndex((x) => x.d === l.d) === i);
    uniq.forEach((l, i) => { const v = String(fd.get('c' + i) || '').replace(/[^\d]/g, ''); lines.filter((x) => x.d === l.d).forEach((x) => { x.c = v ? Number(v) : null; }); });
    touch(q); TN.toast('Cost estimates saved', 'success', 'The customer’s quotation does not change.'); TN.refresh();
  });
  TN.act('q-start-booking', (f) => {
    const q = qById(f.dataset.id), d = TN.deal(q.deal);
    if (!d) return;
    if (!['not_started', 'quotation_accepted', 'in_progress'].includes(d.bookingState)) { TN.toast('Not started', 'danger', `${d.id} already has a submitted booking. Open the Deal to see it.`); return; }
    q.converted = true; d.quotation = q.id; if (d.bookingState === 'not_started') d.bookingState = 'quotation_accepted'; touch(q);
    TN.toast('Booking draft made from this quotation', 'success', 'Services and prices are copied. Nothing is booked or paid.'); TN.go(`/app/deals/${d.id}/book`);
  });
  TN.act('q-open-file', (el) => TN.toast(`${el.dataset.name} opened`, 'info', 'Private file: only the people working on this trip can open it.'));

  /* =====================================================================
     #/app/quotations/:id/preview · customer copy
     ===================================================================== */
  const words = (n) => { const o = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'], t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']; const two = (x) => (x < 20 ? o[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + o[x % 10] : '')); const three = (x) => (x >= 100 ? o[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x)); const parts = []; const cr = Math.floor(n / 1e7), lk = Math.floor((n % 1e7) / 1e5), th = Math.floor((n % 1e5) / 1e3), rest = n % 1e3; if (cr) parts.push(two(cr) + ' Crore'); if (lk) parts.push(two(lk) + ' Lakh'); if (th) parts.push(two(th) + ' Thousand'); if (rest) parts.push(three(rest)); return parts.join(' ') + ' Rupees'; };
  const dm = (d) => F.day(d);
  function quoteDoc(q, v) {
    const t = q.trip, n = nightsOf(t.start, t.end), cities = [...new Set(q.services.filter((s) => s.kind === 'hotel').map((s) => s.city))];
    const tiers = ['quoted', 'upgrade'].filter((k) => q.tiers[k] && q.tiers[k].total != null);
    const hotelsFor = (k) => q.services.filter((s) => s.kind === 'hotel' && (!s.tier || s.tier === k));
    const price = (k, i) => { const tr = q.tiers[k], pp = printedAs(q, tr); return `<div class="doc-price${i === 0 ? ' main' : ''}"><p class="doc-price-name">${k === 'quoted' ? 'As quoted' : 'Upgrade'}${tr.name ? ' · ' + E(tr.name) : ''}</p><p class="doc-amount">${F.inr(tr.total)}</p><p class="doc-small">${pp.includes('per person') ? pp : 'total for ' + pl(paying(t), 'traveller')}</p><ul class="doc-small">${hotelsFor(k).map((h) => `<li>${E(h.name)}${k === 'upgrade' ? ', ' + E(h.city) : ''}</li>`).join('')}</ul></div>`; };
    const cover = [['Hotels', q.services.some((s) => s.kind === 'hotel') ? `Hotels, ${pl(n, 'night')}` : ''], ['Transfers', q.services.filter((s) => s.kind === 'transfer').map((s) => E(s.vehicle || 'Transfers')).join(', ')], ['Tours &amp; tickets', q.services.filter((s) => s.kind === 'activity').map((s) => E(s.name)).join(', ')], ['Visa', q.services.filter((s) => s.kind === 'visa').map((s) => `${E(s.country)} visa assistance`).join(', ')], ['Flights', q.services.filter((s) => s.kind === 'flight').map((s) => E(s.text)).join(', ')]].filter((r) => r[1]);
    const main = q.tiers[tiers[0] || 'quoted'];
    const missing = q.services.some((s) => s.kind === 'hotel' && !s.room);
    return `<article class="tn-doc" id="quote-document" aria-label="Customer quotation ${q.id}, revision ${v.n}"><header class="doc-head"><div><p class="doc-brand">Trip<b>Navigate</b></p><p class="doc-tagline">We make travel effortless.</p></div><div class="doc-meta"><p><strong>Tour quotation</strong> ${q.id} · Rev ${v.n}</p><p>Date ${ISO_DASH(v.sentAt || v.made)}</p><p>Valid until ${ISO_DASH(v.validUntil)}</p></div></header><div class="doc-bar" aria-hidden="true"></div>
      <h2 class="doc-title">${E(q.title)}</h2><p class="doc-sub">For ${E(q.customer.company || q.customer.name)} · ${dm(t.start)} to ${dm(t.end)} · ${pl(n, 'night')}, ${pl(n + 1, 'day')} · ${E(cities.join(', ') || t.dest)}</p><p class="doc-sub">${travText(t)}</p>
      ${v.changed ? `<p class="doc-note doc-section">What changed: ${E(v.changed)}</p>` : ''}
      ${tiers.length ? `<section class="doc-section" aria-label="Your price"><h3>Your price</h3><div class="doc-prices${tiers.length > 1 ? ' two' : ''}">${tiers.map(price).join('')}</div><p class="doc-small doc-section">${words(main.total)}. GST as applicable. Quotation — not a tax invoice.</p>${cover.length ? `<table class="doc-table doc-section"><caption class="doc-label">What the price covers</caption><tbody>${cover.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join('')}</tbody></table>` : ''}</section>` : ''}
      ${hotelsFor('quoted').length ? `<section class="doc-section" aria-label="Where you stay"><h3>Where you stay</h3><ul class="doc-list">${hotelsFor('quoted').map((h) => `<li><span class="doc-strong">${E(h.city)}</span> · ${E(h.name)} · ${h.room ? E(h.room) : '<span class="fill">Room type</span>'}${h.meal ? `<span class="doc-small"> (${E(h.meal)})</span>` : ''}<p class="doc-small">${dm(h.checkin)} to ${dm(h.checkout)} · ${pl(nightsOf(h.checkin, h.checkout), 'night')} · ${pl(h.rooms, 'room')}${h.star ? ' · ' + E(h.star) : ''}</p></li>`).join('')}</ul></section>` : ''}
      ${q.days.length ? `<section class="doc-section" aria-label="Day by day"><h3>Day by day</h3>${q.days.map((d, i) => `<div class="doc-day"><p class="doc-day-n">Day ${i + 1}</p><div><p class="doc-strong">${E(d[0])}${d[1] ? `<span class="doc-small"> · ${E(d[1])}</span>` : ''}</p><p>${E(d[2])}</p></div></div>`).join('')}</section>` : ''}
      ${q.included.length || q.excluded.length ? `<section class="doc-section doc-cols" aria-label="Included and not included"><div><h4 class="doc-label">Included</h4><ul>${q.included.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div><div><h4 class="doc-label">Not included</h4><ul>${q.excluded.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div></section>` : ''}
      ${main && main.plan.length ? `<section class="doc-section" aria-label="Payment schedule"><h3>Payment schedule if you confirm</h3><table class="doc-table"><tbody>${main.plan.map(([l, a, w]) => `<tr><th scope="row">${E(l)}</th><td>${E(w === 'On confirmation' ? 'On acceptance' : w)}</td><td class="num">${F.inr(a)}</td></tr>`).join('')}</tbody></table></section>` : ''}
      ${q.terms.length ? `<section class="doc-section" aria-label="Good to know"><h3>Good to know</h3><ul>${q.terms.map((x) => `<li>${E(x)}</li>`).join('')}</ul></section>` : ''}
      <section class="doc-section doc-note" aria-label="Next step"><p>To confirm, reply in writing (WhatsApp or e-mail) to ${E(TN.person(q.owner).name)} (+91 291 261 0410), saying which option you choose. Availability is checked when you confirm.</p></section>
      <footer class="doc-foot"><p class="doc-legal">Holiday Chacha Pvt Ltd · Regd. office: 59A, Babu Rajendra Marg, Masuria Colony, Baldev Nagar, Jodhpur, Rajasthan 342003 · PAN AAFCH9191M · GSTIN 08AAFCH9191M1ZV (Rajasthan)</p><span>Prepared by ${E(TN.person(q.owner).name)}, Travel consultant</span><span>Quotation — not a tax invoice</span></footer></article>${missing ? '' : ''}`;
  }
  TN.page('/app/quotations/:id/preview', { nav: '/app/quotations', roles: ['sales', 'manager'], title: 'Customer copy',
    render(p, qy) {
      const q = qById(p.id); if (!q) return U.notAllowed(false);
      const v = q.versions.find((x) => x.n === Number(qy.v)) || cur(q);
      const missing = q.services.filter((s) => s.kind === 'hotel' && !s.room).length;
      const checks = `<div class="mb-4 flex flex-col gap-3" role="status">${note('circle-check', 'text-status-success', 'Checked: no internal or pushy words.')}${missing ? note('info', 'text-status-info', '<span class="sr-only">Note for staff: </span>You can still share it. Fill the missing details first if you can.') + note('circle-alert', 'text-status-warning', `${pl(missing, 'detail')} missing (shown in [brackets]): Room type.`) : ''}</div>`;
      return U.page(U.backLink(`/app/quotations/${q.id}`, 'Back to the quotation') + U.pageHeader({ title: 'What the customer sees', description: 'This is how the quotation will look. Nothing is sent.', actions: U.button('Print or save as PDF', { act: 'q-print', icon: 'printer', size: 'lg', cls: 'min-h-11' }) })
        + `<div class="mb-4">${segNav(q, true, 'Nothing is sent from here.')}</div>` + checks + quoteDoc(q, v));
    } });
  TN.act('q-print', () => window.print());

  /* =====================================================================
     Referral drafts: #/app/quotations/drafts/:id (live; switched Off today)
     ===================================================================== */
  TN.page('/app/quotations/drafts/:id', { nav: '/app/quotations', roles: ['sales', 'manager'], title: 'Referral draft',
    render(p, qy) {
      const d = RD().find((x) => x.id === p.id);
      if (!d) return U.notAllowed({ title: 'Referral draft not found', text: 'There is no referral draft with this reference that you can open.', back: { href: '#/app/quotations', label: 'Back to Quotations' } });
      const tab = ['overview', 'quotations', 'itineraries', 'link', 'history'].includes(qy.tab) ? qy.tab : 'overview';
      const closed = d.status === 'closed';
      const linkWord = d.link ? `Referral draft ${d.id} · linked to ${d.link.kind} ${d.link.ref}` : `Referral draft ${d.id} · not linked to Bitrix yet`;
      const head = U.backLink('/app/quotations', 'Back to Quotations') + U.pageHeader({ eyebrow: d.id, title: `${E(d.customer.name)} · referral draft`,
        status: U.badge(closed ? 'Closed' : 'Open', closed ? 'neutral' : 'info', { icon: closed ? 'archive' : 'circle-dot', wrap: true, sr: 'Referral draft status: ' }) + U.meta('link-2', E(linkWord)) + U.owner(E(personName(d.owner))) + U.meta('building-2', 'Branch: ' + E(d.branch))
          + `<p class="m-0 basis-full text-base text-copy">${closed ? 'Next: nothing. Reopen the draft if the customer comes back.' : d.link ? 'Next: work on the quotation; booking starts from the Deal.' : 'Next: link this draft to the Bitrix lead or deal once it exists. Booking needs the confirmed deal.'}</p>${closed ? '' : `<p class="m-0 basis-full text-sm text-quiet">${TN.ic('calendar-clock', 'mt-0.5 size-4 shrink-0 text-faint inline')} Closes on ${F.date(d.closesOn)} if nothing changes.</p>`}`,
        actions: closed ? U.button('Reopen draft', { act: 'rd-reopen', data: { id: d.id }, variant: 'primary', size: 'lg' }) : d.link ? '' : U.button('Link to Bitrix', { href: `/app/quotations/drafts/${d.id}?tab=link`, variant: 'primary', size: 'lg' }) });
      const tabs = U.tabs({ label: 'Referral draft sections', cls: 'mb-4', items: [['overview', 'Overview'], ['quotations', 'Quotations'], ['itineraries', 'Itineraries'], ['link', 'Link to Bitrix'], ['history', 'History']].map(([k, l]) => ({ href: `/app/quotations/drafts/${d.id}${k === 'overview' ? '' : '?tab=' + k}`, label: l, current: k === tab })) });
      let body = '';
      if (tab === 'overview') {
        const c = d.customer;
        body = U.card({ title: 'Customer', body: U.summaryList([{ label: 'Customer name', value: E(c.name) }, { label: 'Mobile', value: E(c.mobile) || U.notEntered('Not given') }, { label: 'Email', value: E(c.email) || U.notEntered('Not given') }, { label: 'Company', value: E(c.company) || U.notEntered('Not given') }, { label: 'How they reached us', value: E(d.source) }, { label: 'Who referred them', value: E(d.referredBy) || U.notEntered('Not given') }, { label: 'Branch', value: E(d.branch) }, { label: 'Last activity', value: F.date(d.last) }]) + `<p class="m-0 mt-4 flex gap-2 text-sm text-copy">${TN.ic('shield-check', 'mt-0.5 size-4 shrink-0 text-brand-strong')}<span>Only the owner and the branch Manager can open this draft.</span></p>` })
          + (closed ? '' : `<div class="mt-5">${U.card({ title: 'Edit customer details', body: `<form data-act="rd-save" data-id="${d.id}" class="flex flex-col gap-4" novalidate><div class="grid gap-4 sm:grid-cols-2">${fld('rd-name', 'Customer name', c.name, { name: 'name' })}${fld('rd-mobile', 'Mobile', c.mobile, { optional: true, type: 'tel', name: 'mobile' })}${fld('rd-email', 'Email', c.email, { optional: true, type: 'email', name: 'email' })}${fld('rd-company', 'Company', c.company, { optional: true, name: 'company' })}${U.field({ id: 'rd-source', label: 'How did they reach us?', optional: true, select: { name: 'source', options: SOURCES, value: d.source } })}${fld('rd-ref', 'Who referred them?', d.referredBy, { optional: true, name: 'referredBy' })}</div><div class="flex flex-wrap gap-3">${U.button('Save customer details', { type: 'submit', size: 'lg', cls: 'min-h-11' })}${U.button('Close draft', { act: 'rd-close', data: { id: d.id }, variant: 'ghost', icon: 'archive', size: 'lg', cls: 'min-h-11' })}</div></form>` })}</div>`);
      }
      if (tab === 'quotations') {
        const list = Q.filter((q) => q.referral === d.id);
        body = (list.length ? U.table({ label: `Quotations of ${d.id}`, top: true, cardHeader: `<div class="border-b border-line px-4.5 py-3.5"><h2 class="m-0 text-lg leading-6 font-semibold text-ink">Quotations of ${d.id}</h2></div>`, columns: ['Quotation', 'Status', 'Lead, deal or referral', 'Valid until', 'Updated', { label: 'Next step', sr: true }], rows: quoteRows(list) }) : U.card(U.emptyState({ icon: 'file-text', title: 'No quotation yet', description: 'Make the first quotation for this customer below.' })))
          + (closed ? '' : `<div class="mt-5">${U.card({ title: 'New quotation for this draft', body: `<form data-act="rd-new-quote" data-id="${d.id}" class="flex flex-col gap-4" novalidate>${fld('rd-q-title', 'Quotation title', '', { name: 'title', hint: 'Shown at the top of the quotation. You cannot change it later.' })}<div>${U.button('Create quotation', { type: 'submit', variant: 'primary', size: 'lg', cls: 'min-h-11' })}</div></form>` })}</div>`);
      }
      if (tab === 'itineraries') {
        const list = IT().filter((i) => i.referral === d.id);
        body = list.length ? itinTable(list) : U.card(U.emptyState({ icon: 'map', title: 'No itinerary yet', description: 'Make a branded itinerary from this draft’s quotation once it is shared.' }));
      }
      if (tab === 'link') {
        const deals = TN.DATA.deals.filter((x) => x.owner === d.owner || TN.is('manager')).slice(0, 4);
        body = U.card({ title: 'Links', description: 'Linking changes nothing in Bitrix. Booking waits for the confirmed Bitrix deal.', body: d.link ? note('link-2', 'text-brand-strong', `Linked to ${d.link.kind} <a class="${A_INL}" href="#/app/${d.link.kind === 'deal' ? 'deals' : 'leads'}/${d.link.ref}">${d.link.ref}</a>.`) : '<p class="m-0 text-copy">Not linked to Bitrix yet.</p>' })
          + (d.link || closed ? '' : `<div class="mt-5">${U.card({ title: 'Link to Bitrix', description: 'Pick the lead or deal for this customer. The CRM never links by name, mobile or email on its own.', body: `<form data-act="rd-link" data-id="${d.id}" class="flex flex-col gap-4" novalidate>${U.choices({ id: 'rd-link-pick', legend: 'Deals in Jodhpur that you can work on', type: 'radio', name: 'deal', items: deals.map((x) => ({ id: 'rd-link-' + x.id, value: x.id, label: `${x.id} · ${E(x.title)}`, description: x.quotation ? 'That deal already has an accepted quotation.' : 'Jodhpur', disabled: !!x.quotation })) })}<p class="m-0 text-sm text-quiet">Nothing is chosen for you.</p>${area('rd-link-note', 'Note', '', { name: 'note', hint: 'Saved with your name in History.', rows: 2 })}<div>${U.button('Link to the chosen deal', { type: 'submit', variant: 'primary', size: 'lg', cls: 'min-h-11' })}</div></form>` })}</div>`);
      }
      if (tab === 'history') body = U.card({ title: 'History', body: U.timeline({ label: `History of ${d.id}`, items: d.history.slice().reverse().map((h) => ({ title: E(h.title), meta: E(h.meta) })) }) });
      return U.page(head + tabs + body);
    } });
  const rdOf = (el) => RD().find((x) => x.id === el.dataset.id);
  const hist = (d, title) => { d.history.push({ title, meta: F.dateTime(now()) + ' · ' + TN.me().name }); d.last = TN.TODAY; };
  TN.act('rd-save', (f) => { const d = rdOf(f), fd = new FormData(f); if (!fd.get('name').trim()) { TN.toast('Not saved', 'danger', 'Enter the customer name.'); return; } Object.assign(d.customer, { name: fd.get('name').trim(), mobile: fd.get('mobile').trim(), email: fd.get('email').trim(), company: fd.get('company').trim() }); d.source = fd.get('source') || d.source; d.referredBy = fd.get('referredBy').trim(); hist(d, 'Customer details changed'); TN.toast('Customer details saved'); TN.refresh(); });
  TN.act('rd-close', (el) => { const d = rdOf(el); TN.dialog({ title: `Close ${d.id}?`, body: `<form id="rd-close-form" data-act="rd-close-yes" data-id="${d.id}" class="flex flex-col gap-4" novalidate>${U.field({ id: 'rd-close-reason', label: 'Why are you closing it?', select: { name: 'reason', options: ['Duplicate', 'Customer not going ahead', 'Handled elsewhere', 'Other'], value: 'Customer not going ahead' } })}<p class="m-0 text-sm text-quiet">Its quotations stay readable. You can reopen it.</p></form>`, footer: U.button('Keep it open', { attrs: { 'data-close': '' } }) + U.button('Close draft', { variant: 'danger', type: 'submit', attrs: { form: 'rd-close-form' } }) }); });
  TN.act('rd-close-yes', (f) => { const d = rdOf(f); d.status = 'closed'; hist(d, 'Draft closed: ' + new FormData(f).get('reason')); TN.closeOverlay(); TN.toast(`${d.id} closed`); TN.refresh(); });
  TN.act('rd-reopen', (el) => { const d = rdOf(el); d.status = 'open'; d.closesOn = iso(TN.TODAY, 90); hist(d, 'Draft reopened'); TN.toast(`${d.id} reopened`); TN.refresh(); });
  TN.act('rd-new-quote', (f) => { const d = rdOf(f), title = new FormData(f).get('title').trim() || `Trip for ${d.customer.name}`; const q = newQuotation({ kind: 'referral', ref: d.id }, { ...d.customer }, title); hist(d, `Quotation ${q.id} started`); TN.toast(`Quotation ${q.id} started`); TN.go('/app/quotations/' + q.id); });
  TN.act('rd-link', (f) => { const d = rdOf(f), fd = new FormData(f), deal = fd.get('deal'); if (!deal) { TN.toast('Not linked', 'danger', 'Choose the deal first. Nothing was linked.'); return; } d.link = { kind: 'deal', ref: deal }; Q.filter((q) => q.referral === d.id).forEach((q) => { q.deal = deal; }); hist(d, `Linked to deal ${deal}${fd.get('note') ? ': ' + fd.get('note') : ''}`); TN.toast(`Linked to deal ${deal}`, 'success', 'Nothing changed in Bitrix.'); TN.go(`/app/quotations/drafts/${d.id}?tab=link`); });

  /* =====================================================================
     Itineraries
     ===================================================================== */
  const ITIN_LOOK = { draft: ['Draft', 'neutral', 'list-checks'], ready: ['Ready for final PDF', 'info', 'circle-check'], final: ['Final PDF made', 'success', 'file-check-corner'] };
  const itinBadge = (i) => { const l = ITIN_LOOK[i.status]; return U.badge(l[0], l[1], { icon: l[2], wrap: true, sr: 'Itinerary status: ' }); };
  const itinById = (id) => IT().find((x) => x.id.toLowerCase() === String(id).toLowerCase());
  const basisText = (i) => i.basis.kind === 'quotation' ? `From ${i.basis.q} v${i.basis.v}` : i.basis.kind === 'booking' ? 'From the booking' : 'Not from a quotation';
  const openDiffs = (i) => i.diffs.filter((d) => !d.settled).length;
  function itinTable(list) {
    return U.table({ label: 'Itineraries table', top: true, columns: ['Itinerary', 'Status', 'Made for', 'Open differences', 'Updated', { label: 'Final PDF', sr: true }],
      rows: list.map((i) => { const fin = i.docs.find((d) => d.kind === 'final'); const n = openDiffs(i); return { attrs: { 'data-search': `${i.id} ${i.title} ${i.deal || i.referral || ''} ${basisText(i)}`.toLowerCase() }, cells: [
        `<a class="${A_TITLE}" href="#/app/itineraries/${i.id}">${E(i.title)}</a><span class="mt-0.5 block text-sm text-quiet">${basisText(i)} · Owner: ${E(ownerText(i.owner))}</span>`,
        `<span class="flex flex-col items-start gap-1.5">${itinBadge(i)}</span>`,
        i.deal ? `<a class="${A_SUBJ}" href="#/app/deals/${i.deal}">Deal ${i.deal}</a>` : `<a class="${A_SUBJ}" href="#/app/quotations/drafts/${i.referral}">Referral draft ${i.referral}${referralLinkSuffix(i.referral)}</a>`,
        { html: n ? `<span class="inline-flex items-center gap-1.5 text-copy">${TN.ic('triangle-alert', 'size-4 shrink-0 text-status-warning')}${n} to settle</span>` : '<span class="text-quiet">None</span>', cls: 'text-sm' },
        { html: upd(i.updated), cls: 'text-sm text-copy' },
        { html: fin ? `<a href="#/app/itineraries/${i.id}/print" target="_blank" rel="noopener" class="${ROW_BTN}">${TN.ic('download')}Final PDF<span class="sr-only">: ${E(i.title)}</span></a>` : '', cls: 'sm:text-right', label: '' },
      ] }; }),
      footer: `<nav aria-label="Itineraries pages" class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4.5 py-3 font-sans" data-slot="work-pager"><span aria-hidden="true"></span><span class="text-sm text-quiet tabular-nums">Showing ${list.length} of ${list.length} itineraries</span><span aria-hidden="true"></span></nav>` });
  }
  const IFILTERS = [['open', 'Open', (i) => true], ['draft', 'Draft', (i) => i.status === 'draft'], ['ready', 'Ready for final PDF', (i) => i.status === 'ready'], ['final', 'Final PDF made', (i) => i.status === 'final'], ['closed_drafts', 'Closed drafts', () => false]];
  TN.page('/app/itineraries', { nav: '/app/itineraries', roles: ['sales', 'manager'], title: 'Itineraries',
    render(p, qy) {
      const scope = qy.scope || (TN.is('manager') ? 'all' : 'mine');
      const filter = IFILTERS.some((f) => f[0] === qy.filter) ? qy.filter : 'open';
      const pool = mineOrAll(scope, IT());
      const list = pool.filter(IFILTERS.find((f) => f[0] === filter)[2]);
      return U.page(U.pageHeader({ title: 'Itineraries', description: scope === 'all' ? 'Itineraries you can open' : 'Itineraries you made or own', actions: U.button('New itinerary', { href: '/app/itineraries/new', variant: 'primary', size: 'lg', icon: 'plus' }) })
        + listChrome({ path: '/app/itineraries', noun: 'itineraries', scope, filter, pool, filters: IFILTERS, refAct: 'it-ref', refPh: 'IT-0031', refEg: 'IT-0031', ref: qy.ref, refMiss: qy.miss === '1' })
        + (list.length ? itinTable(list) : U.card(U.emptyState({ icon: 'map', title: 'No itineraries here', description: 'Nothing matches this filter. Make one from an accepted quotation or a booking.', level: 2 })))
        + closedNote.replace('Closed drafts that were never linked are not in this list.', 'Closed itinerary drafts are not in this list.'));
    }, mount: (root) => bindSearch(root) });
  TN.act('it-ref', (f) => { const ref = new FormData(f).get('reference').trim(), i = itinById(ref); if (i) return TN.go('/app/itineraries/' + i.id); const qs = new URLSearchParams(TN.query()); qs.set('ref', ref); qs.set('miss', '1'); TN.go('/app/itineraries?' + qs.toString()); });
  TN.page('/app/itineraries/new', { nav: '/app/itineraries', roles: ['sales', 'manager'], title: 'New itinerary', render: () => { const h = newPage('itinerary'); TN._qErr = null; TN._qVals = null; return h; } });
  const nextItId = () => { let n = 32; while (itinById(`IT-00${n}`)) n++; return `IT-00${n}`; };
  function newItinerary(o) {
    const i = Object.assign({ id: nextItId(), owner: me(), status: 'draft', updated: now(), made: TN.TODAY, source: null, diffs: [], settled: [], docs: [], deal: null }, o);
    IT().unshift(i); return i;
  }
  const emptyFacts = (o = {}) => Object.assign({ dest: '', start: '', end: '', adults: 2, children: 0, childAges: '', infants: 0, country: '', tripType: '', roomBasis: '', cover: '', stays: [], days: [], transfers: [], activities: [], included: [], excluded: [], intro: '', why: [], care: [], bring: [] }, o);
  TN.act('it-new-referral', (f) => {
    const fd = new FormData(f);
    if (!fd.get('name').trim()) { TN._qErr = 'Enter the customer name.'; TN._qVals = Object.fromEntries(fd); return TN.refresh(); }
    const d = makeReferral(fd);
    const i = newItinerary({ title: fd.get('title').trim() || `Trip for ${d.customer.name}`, basis: { kind: 'none' }, referral: d.id, facts: emptyFacts() });
    hist(d, `Itinerary ${i.id} started`); TN.toast(`Referral draft ${d.id} and itinerary ${i.id} made.`, 'success', 'Nothing was sent and nothing was put in Bitrix.'); TN.go('/app/itineraries/' + i.id);
  });
  TN.act('it-make', (el) => {
    const q = qById(el.dataset.q), v = cur(q), t = q.trip, tier = (q.accepted && q.accepted.tier) || 'quoted';
    const stays = q.services.filter((s) => s.kind === 'hotel' && (!s.tier || s.tier === tier)).map((s) => ({ city: s.city, hotel: s.name, room: s.room, checkin: s.checkin, checkout: s.checkout, nights: nightsOf(s.checkin, s.checkout), meal: s.meal, rooms: s.rooms, fromQuote: true }));
    const i = newItinerary({ title: `${q.title}, day by day`, basis: { kind: 'quotation', q: q.id, v: v.n }, deal: q.deal, referral: q.referral,
      facts: emptyFacts({ dest: t.dest, start: t.start, end: t.end, adults: t.adults, children: t.cwb + t.cnb, infants: t.infants, country: t.scope === 'Domestic' ? 'India' : '', stays, days: q.days.map((d) => ({ title: d[0], where: d[1], text: d[2], hl: [] })), transfers: q.services.filter((s) => s.kind === 'transfer').map((s) => ({ from: s.text.split(' to ')[0] || s.text, to: s.text.split(' to ')[1] || '', date: s.date, how: s.vehicle || '' })), activities: q.services.filter((s) => s.kind === 'activity').map((s) => ({ name: s.name, date: s.date, inPrice: 'Yes' })), included: q.included.slice(), excluded: q.excluded.slice() }) });
    TN.toast(`Itinerary ${i.id} made from ${q.id} version ${v.n}`, 'success', 'Facts are copied and marked. Check them, then make the PDF.'); TN.go('/app/itineraries/' + i.id);
  });

  function itinDoc(i, id) {
    const f = i.facts, n = f.start && f.end ? nightsOf(f.start, f.end) : 0;
    const trav = [pl(f.adults, 'adult'), f.children ? pl(f.children, 'child', 'children') : ''].filter(Boolean).join(' and ');
    const stayOn = (k) => { const d = iso(f.start, k); return f.stays.find((s) => d >= s.checkin && d < s.checkout) || f.stays[f.stays.length - 1]; };
    const tr0 = f.transfers[0];
    return `<article class="tn-doc" id="${id}" aria-label="Customer itinerary ${i.id}"><header class="doc-head"><div><p class="doc-brand">Trip<b>Navigate</b></p><p class="doc-tagline">We make travel effortless.</p></div><div class="doc-meta"><p><strong>Itinerary</strong> ${i.id}</p><p>Prepared ${ISO_DASH(i.made)}</p></div></header><div class="doc-bar" aria-hidden="true"></div>
      <h2 class="doc-title">${E(f.dest || i.title)}</h2><p class="doc-sub">${n ? `${pl(n, 'night')}, ${pl(n + 1, 'day')}` : ''}${f.country ? ' · ' + E(f.country) : ''}${f.tripType ? ' · ' + E(f.tripType) : ''}</p>${tr0 ? `<p class="doc-sub">Pickup ${E(tr0.from)} · Drop ${E(tr0.to)} · ${trav}</p>` : `<p class="doc-sub">${trav}</p>`}
      ${f.stays.length ? `<ul class="doc-chips doc-section" aria-label="Where you base yourself">${f.stays.map((s) => `<li>${E(s.city)} · ${pl(s.nights, 'night')}</li>`).join('')}</ul>` : ''}
      ${f.intro ? `<section class="doc-section" aria-label="Introduction"><p>${E(f.intro)}</p></section>` : ''}
      ${f.stays.length ? `<section class="doc-section" aria-label="Where you stay"><h3>Where you stay</h3><ul class="doc-list">${f.stays.map((s) => `<li><span class="doc-strong">${E(s.city)}</span> · ${pl(s.nights, 'night')} · ${E(s.hotel)}${s.room ? ' · ' + E(s.room) : ''}</li>`).join('')}</ul></section>` : ''}
      ${f.days.length ? `<section class="doc-section" aria-label="Day by day"><h3>Day by day</h3>${f.days.map((d, k) => { const s = f.start ? stayOn(k) : null; const meals = k === 0 ? '' : s && s.meal ? s.meal.replace(' + ', ', ').replace(/^./, (c) => c.toUpperCase()) : ''; const last = k === f.days.length - 1; return `<div class="doc-day"><p class="doc-day-n">Day ${k + 1}</p><div><p class="doc-strong">${E(d.title)}${d.where ? `<span class="doc-small"> · ${E(d.where)}</span>` : ''}</p><p>${E(d.text)}</p>${d.hl.length ? `<ul class="doc-chips">${d.hl.map((h) => `<li>${E(h)}</li>`).join('')}</ul>` : ''}${s && !last ? `<p class="doc-small">${meals ? `Meals: ${E(meals)} · ` : ''}Stay: ${E(s.hotel)}</p>` : last && meals ? `<p class="doc-small">Meals: ${E(meals)}</p>` : ''}</div></div>`; }).join('')}</section>` : ''}
      ${f.transfers.length ? `<section class="doc-section" aria-label="Every move"><h3>Every move</h3><ul>${f.transfers.map((t) => `<li>${t.date ? F.day(t.date) + ': ' : ''}${E(t.from)} to ${E(t.to)}</li>`).join('')}</ul></section>` : ''}
      ${f.care.length || f.bring.length ? `<section class="doc-section doc-cols" aria-label="We handle and you bring"><div><h4 class="doc-label">We handle</h4><ul>${f.care.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div><div><h4 class="doc-label">You bring</h4><ul>${f.bring.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div></section>` : ''}
      ${f.included.length || f.excluded.length ? `<section class="doc-section doc-cols" aria-label="Included and not included"><div><h4 class="doc-label">Included</h4><ul>${f.included.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div><div><h4 class="doc-label">Not included</h4><ul>${f.excluded.map((x) => `<li>${E(x)}</li>`).join('')}</ul></div></section>` : ''}
      <footer class="doc-foot"><p class="doc-legal">Holiday Chacha Pvt Ltd · Regd. office: 59A, Babu Rajendra Marg, Masuria Colony, Baldev Nagar, Jodhpur, Rajasthan 342003 · PAN AAFCH9191M · GSTIN 08AAFCH9191M1ZV (Rajasthan)</p><span>Prepared by ${E(TN.person(i.owner).name)}, Travel consultant</span><span>Itinerary — prices are on your quotation</span></footer></article>`;
  }
  function factsForm(i) {
    const f = i.facts, fq = (s) => (s.fromQuote ? 'From the quotation — check it.' : '');
    const lines = (a) => (a || []).join('\n');
    return `<form data-act="it-save-facts" data-id="${i.id}" class="flex flex-col gap-4" novalidate>
      ${U.fieldset({ legend: 'Trip', body: `<div class="grid gap-4 sm:grid-cols-3">${fld('it-dest', 'Destination', f.dest, { name: 'dest', hint: i.basis.kind === 'quotation' ? 'From the quotation — check it.' : '' })}${fld('it-start', 'Start date', f.start, { type: 'date', name: 'start' })}${fld('it-end', 'End date', f.end, { type: 'date', name: 'end' })}</div>` })}
      ${U.fieldset({ legend: 'Travellers', body: `<p class="m-0 mb-3 text-sm text-quiet">Counts and child ages only; names are never printed on an itinerary.</p><div class="grid gap-4 sm:grid-cols-4">${fld('it-adults', 'Adults', f.adults, { type: 'number', name: 'adults' })}${fld('it-children', 'Children', f.children || '', { type: 'number', optional: true, name: 'children' })}${fld('it-ages', 'Child ages', f.childAges, { optional: true, name: 'childAges', hint: 'For example: 4, 9.' })}${fld('it-infants', 'Infants', f.infants || '', { type: 'number', optional: true, name: 'infants' })}</div>` })}
      <h3 class="m-0 text-base font-semibold text-ink">Stays</h3>${f.stays.map((s, k) => U.fieldset({ legend: `Stay ${k + 1}`, body: `<div class="grid gap-4 sm:grid-cols-3">${fld(`it-s${k}-city`, 'City', s.city, { name: `sCity${k}`, hint: fq(s) })}${fld(`it-s${k}-hotel`, 'Hotel', s.hotel, { name: `sHotel${k}`, hint: fq(s) })}${fld(`it-s${k}-room`, 'Room type', s.room, { optional: true, name: `sRoom${k}` })}${fld(`it-s${k}-in`, 'Check-in', s.checkin, { type: 'date', optional: true, name: `sIn${k}` })}${fld(`it-s${k}-out`, 'Check-out', s.checkout, { type: 'date', optional: true, name: `sOut${k}` })}${fld(`it-s${k}-meal`, 'Meal plan', s.meal, { optional: true, name: `sMeal${k}` })}</div>` })).join('') || '<p class="m-0 text-quiet">No stays yet.</p>'}
      <h3 class="m-0 text-base font-semibold text-ink">Day by day</h3>${f.days.map((d, k) => U.fieldset({ legend: `Day ${k + 1}`, body: `<div class="grid gap-4 sm:grid-cols-2">${fld(`it-d${k}-title`, 'Title', d.title, { name: `dTitle${k}` })}${fld(`it-d${k}-where`, 'Where', d.where, { optional: true, name: `dWhere${k}` })}${area(`it-d${k}-text`, 'What happens', d.text, { cls: 'sm:col-span-2', rows: 2, name: `dText${k}` })}${area(`it-d${k}-hl`, 'Highlights', lines(d.hl), { cls: 'sm:col-span-2', rows: 2, name: `dHl${k}`, hint: 'One per line, at most 10.' })}</div>` })).join('')}<div>${U.button(`Add day ${f.days.length + 1}`, { act: 'it-add-day', data: { id: i.id }, icon: 'plus', cls: 'min-h-11' })}</div>
      <h3 class="m-0 text-base font-semibold text-ink">Transfers</h3>${f.transfers.map((t, k) => U.fieldset({ legend: `Transfer ${k + 1}`, body: `<div class="grid gap-4 sm:grid-cols-4">${fld(`it-t${k}-from`, 'From', t.from, { name: `tFrom${k}` })}${fld(`it-t${k}-to`, 'To', t.to, { name: `tTo${k}` })}${fld(`it-t${k}-date`, 'Date', t.date, { type: 'date', optional: true, name: `tDate${k}` })}${fld(`it-t${k}-how`, 'How', t.how, { optional: true, name: `tHow${k}`, hint: 'For example: private car.' })}</div>` })).join('') || '<p class="m-0 text-quiet">No transfers.</p>'}
      <div class="grid gap-4 sm:grid-cols-2">${area('it-included', 'Included', lines(f.included), { name: 'included', hint: 'One per line.' })}${area('it-excluded', 'Not included', lines(f.excluded), { name: 'excluded', hint: 'One per line.' })}</div>
      ${U.fieldset({ legend: 'Document wording', body: `<p class="m-0 mb-3 text-sm text-quiet">What the customer reads around the facts. Customer text: no supplier names, net rates or internal notes.</p><div class="grid gap-4 sm:grid-cols-2">${fld('it-cover', 'Cover word', f.cover, { optional: true, name: 'cover', hint: 'One or two words for the cover, for example the destination.' })}${fld('it-country', 'Country', f.country, { optional: true, name: 'country' })}${fld('it-type', 'Trip type', f.tripType, { optional: true, name: 'tripType', hint: 'For example: Family, Honeymoon.' })}${fld('it-basis', 'Room basis', f.roomBasis, { optional: true, name: 'roomBasis', hint: 'For example: 2 adults and 1 child sharing.' })}${area('it-intro', 'Introduction', f.intro, { cls: 'sm:col-span-2', name: 'intro', hint: 'A short welcome paragraph. Customer text: no supplier names, net rates or internal notes.' })}${area('it-care', 'We take care of', lines(f.care), { name: 'care', hint: 'One point per line, for example airport transfers.' })}${area('it-bring', 'You bring', lines(f.bring), { name: 'bring', hint: 'One point per line, for example passport and comfortable shoes.' })}</div>` })}
      <div class="flex flex-wrap items-center gap-3">${U.button('Save facts', { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}<span class="text-sm text-quiet" aria-live="polite">All saved</span></div></form>`;
  }
  TN.page('/app/itineraries/:id', { nav: '/app/itineraries', roles: ['sales', 'manager'], title: (p) => (itinById(p.id) || {}).title || 'Itinerary', canOpen: (p) => !!itinById(p.id),
    render(p) {
      const i = itinById(p.id);
      if (!i) return U.notAllowed({ title: 'Itinerary not found', text: 'There is no itinerary with this reference that you can open.', back: { href: '#/app/itineraries', label: 'Back to Itineraries' } });
      const n = openDiffs(i);
      const eyebrow = i.basis.kind === 'quotation' ? `Branded itinerary · Compared with quotation ${i.basis.q} version ${i.basis.v}` : i.basis.kind === 'booking' ? `Branded itinerary · Compared with the booking on deal ${i.deal}` : 'Branded itinerary · Not from a quotation';
      const back = i.basis.kind === 'quotation' ? U.backLink(`/app/quotations/${i.basis.q}`, 'Back to the quotation') : i.deal ? U.backLink(`/app/deals/${i.deal}`, 'Back to the Deal') : U.backLink('/app/itineraries', 'Back to Itineraries');
      const fin = i.docs.find((d) => d.kind === 'final');
      const next = n ? ['settle the open differences', `<a href="#differences" data-act="q-jump" data-target="differences" class="${A_INL}">Settle the open differences</a>`] : i.status === 'final' ? ['send the final PDF to the customer yourself', `<a href="#/app/itineraries/${i.id}/print" target="_blank" rel="noopener" class="${A_INL}">Open the final PDF</a>`] : i.status === 'ready' ? ['request the final document', U.button('Make final PDF', { act: 'it-render', data: { id: i.id, kind: 'final' }, variant: 'primary', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })] : ['check the facts, then mark them ready', U.button('Mark facts ready', { act: 'it-ready', data: { id: i.id }, variant: 'primary', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })];
      const head = back + `<header class="mb-5 flex flex-col gap-4 font-sans sm:flex-row sm:items-end sm:justify-between" data-slot="page-header"><div class="min-w-0"><p class="m-0 mb-1 text-sm font-medium text-quiet"><span>${E(eyebrow)}</span></p><h1 class="m-0 text-2xl leading-tight font-display tracking-heading text-ink max-sm:text-xl"><span id="itin-heading" tabindex="-1" class="block wrap-anywhere outline-none">${E(i.title)}</span></h1><div class="mt-2.5 flex flex-wrap items-center gap-2 text-sm text-quiet">${itinBadge(i)}${n ? U.badge(pl(n, 'open difference'), 'warning', { icon: 'circle-alert', wrap: true }) : i.basis.kind !== 'none' ? U.badge(i.basis.kind === 'quotation' ? 'Matches the quotation' : 'Matches the booking', 'success', { icon: 'circle-check', wrap: true }) : ''}</div></div></header>`;
      const nextCard = U.card({ body: `<p class="m-0 text-copy" data-slot="itin-next"><span class="font-semibold text-ink">Next:</span> ${next[0]}<span class="text-quiet"> · ${E(personName(i.owner))}</span></p><div class="flex flex-wrap items-center gap-3">${next[1]}<a class="${A_INL}" href="#/app/itineraries/${i.id}/preview">Preview what the customer sees</a></div>`, bodyCls: 'flex flex-col gap-3' });
      const src = sectionCard('sources-heading', 'Existing itinerary (optional, private)', 'Attach it to copy facts from it. It is never sent.', (i.source ? `<ul class="m-0 flex list-none flex-col gap-2 p-0">${fileRow(i.source.file, `${E(i.source.size)} · attached ${F.date(i.source.at)} · the facts were typed from this file`)}</ul>` : '') + `<form data-act="it-attach" data-id="${i.id}" class="flex flex-col gap-3" novalidate>${U.field({ id: 'it-source-file', label: 'Existing itinerary file', optional: true, hint: 'PDF, Word (.docx), JPG, PNG or WebP, up to 4 MB. Private: only the people preparing this trip can open it; it is never sent anywhere.', input: { type: 'file', name: 'file', attrs: { accept: '.pdf,.docx,image/jpeg,image/png,image/webp' } } })}<div>${U.button(`${TN.ic('upload')} Attach file`, { type: 'submit', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}</div></form>`, { anchor: 'sources', basis: true, focus: true });
      const facts = sectionCard('facts-heading', 'Facts', 'Trip details. Details copied from the quotation are marked. No prices or internal notes here.', factsForm(i), { anchor: 'facts', basis: true });
      const DB = (label, o) => U.button(label, { size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal', ...o });
      const open = i.diffs.filter((d) => !d.settled);
      const diffs = i.basis.kind === 'none' ? '' : sectionCard('differences-heading', `Differences from the ${i.basis.kind === 'quotation' ? 'quotation' : 'booking'}`, 'Settle each one before the itinerary is ready.',
        `<div class="flex flex-wrap items-center gap-3">${DB('Check differences again', { act: 'it-recheck', data: { id: i.id } })}</div><div class="flex flex-col gap-4">`
        + (open.length ? `<ul class="m-0 flex list-none flex-col gap-3 p-0" aria-label="Open differences">${open.map((d) => `<li class="m-0 flex flex-col gap-2.5 rounded-control border border-status-warning-line bg-status-warning-tint px-3.5 py-3"><p id="itin-diff-${d.id}-label" class="m-0"><span class="font-semibold text-ink">${E(d.label)}</span><span class="block text-sm text-copy">${d.kind === 'differs' ? 'Different from the quotation or booking' : 'In the quotation or booking, not in the itinerary'}</span><span class="block text-sm text-quiet">Quotation: ${E(d.quote)} · Itinerary: ${E(d.itin)}</span></p><div class="flex flex-wrap items-start gap-2">${DB('Use the quotation value', { act: 'it-settle', data: { id: i.id, d: d.id, how: 'use' }, attrs: { 'aria-describedby': `itin-diff-${d.id}-label` } })}${DB('Keep the itinerary value', { variant: 'ghost', act: 'it-settle', data: { id: i.id, d: d.id, how: 'keep' }, attrs: { 'aria-describedby': `itin-diff-${d.id}-label` } })}${DB('Keep it and add a note', { variant: 'ghost', act: 'it-settle', data: { id: i.id, d: d.id, how: 'note' }, attrs: { 'aria-describedby': `itin-diff-${d.id}-label` } })}</div></li>`).join('')}</ul>` : note('circle-check', 'text-status-success', 'No open differences.'))
        + (i.settled.length ? `<details><summary class="inline-flex min-h-11 cursor-pointer items-center rounded-control font-medium text-brand-strong underline underline-offset-4 ${FO}">Settled differences (${i.settled.length})</summary><ul class="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">${i.settled.map((s) => `<li class="m-0 text-sm text-copy"><span class="font-semibold text-ink">${E(s.label)}</span> · ${E(s.how)} by ${E((TN.person(s.by) || {}).name || '')} on ${F.date(s.at)}${s.note ? ': ' + E(s.note) : ''}</li>`).join('')}</ul></details>` : '') + '</div>', { anchor: 'differences', basis: true });
      const docs = sectionCard('documents-heading', 'Documents', 'PDFs. Nothing is sent to the customer.', (i.docs.length ? `<ul class="m-0 flex list-none flex-col gap-2 p-0">${i.docs.slice().reverse().map((d) => `<li class="m-0 flex flex-wrap items-center gap-3 rounded-control border border-line bg-canvas px-3.5 py-2.5">${TN.ic('file-text', 'size-4 shrink-0 text-brand-strong')}<span class="min-w-40 flex-1"><span class="block font-medium wrap-anywhere text-ink">${d.kind === 'final' ? 'Final PDF' : 'Preview PDF'}</span><span class="block text-sm text-quiet">${E(d.file)} · made ${F.date(d.at)}${d.kind === 'preview' ? ' · marked “Preview”, not for the customer' : ''}</span></span><a href="#/app/itineraries/${i.id}/print" target="_blank" rel="noopener" class="${A_INL} inline-flex min-h-11 items-center gap-1">${TN.ic('download', 'size-4')}Open<span class="sr-only"> ${E(d.file)}</span></a></li>`).join('')}</ul>` : '<p class="m-0 text-copy">No document requested yet.</p>')
        + `<div class="flex flex-wrap gap-3">${U.button('Make preview PDF', { act: 'it-render', data: { id: i.id, kind: 'preview' }, size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' })}${i.status === 'ready' ? U.button('Make final PDF', { act: 'it-render', data: { id: i.id, kind: 'final' }, variant: 'primary', size: 'lg', cls: 'h-auto min-h-11 py-2 whitespace-normal' }) : ''}</div>`
        + (i.status === 'draft' ? '<p class="m-0 text-sm text-quiet">The final document can be requested once the facts are ready.</p>' : i.status === 'final' ? `<p class="m-0 text-sm text-quiet">Final PDF made ${F.date(fin.at)}. Download it and send it to the customer yourself.</p>` : ''), { anchor: 'documents', basis: true });
      return U.page(head + `<div class="flex flex-col gap-5">${nextCard}${src}${facts}${diffs}${docs}</div>`);
    } });
  const itOf = (el) => itinById(el.dataset.id);
  TN.act('it-save-facts', (f) => {
    const i = itOf(f), fd = new FormData(f), g = (n) => (fd.get(n) ?? '').toString().trim(), L = (n) => g(n).split('\n').map((s) => s.trim()).filter(Boolean), x = i.facts;
    if (!g('dest')) { TN.toast('Not saved', 'danger', 'Add the destination. Your typed details are still here.'); return; }
    Object.assign(x, { dest: g('dest'), start: g('start'), end: g('end'), adults: Number(g('adults')) || 0, children: Number(g('children')) || 0, childAges: g('childAges'), infants: Number(g('infants')) || 0, included: L('included'), excluded: L('excluded'), cover: g('cover'), country: g('country'), tripType: g('tripType'), roomBasis: g('roomBasis'), intro: g('intro'), care: L('care'), bring: L('bring') });
    x.stays.forEach((s, k) => Object.assign(s, { city: g('sCity' + k), hotel: g('sHotel' + k), room: g('sRoom' + k), checkin: g('sIn' + k), checkout: g('sOut' + k), meal: g('sMeal' + k), nights: g('sIn' + k) && g('sOut' + k) ? nightsOf(g('sIn' + k), g('sOut' + k)) : s.nights }));
    x.days.forEach((d, k) => Object.assign(d, { title: g('dTitle' + k), where: g('dWhere' + k), text: g('dText' + k), hl: L('dHl' + k).slice(0, 10) }));
    x.transfers.forEach((t, k) => Object.assign(t, { from: g('tFrom' + k), to: g('tTo' + k), date: g('tDate' + k), how: g('tHow' + k) }));
    if (i.status === 'final') i.status = 'ready';
    i.updated = now(); TN.toast('Facts saved', 'success', i.status === 'ready' ? 'The final PDF must be made again for these changes.' : ''); TN.refresh();
  });
  TN.act('it-add-day', (el) => { const i = itOf(el); i.facts.days.push({ title: '', where: '', text: '', hl: [] }); TN.refresh(); });
  TN.act('it-attach', (f) => { const i = itOf(f), file = f.querySelector('input[type=file]').files[0]; if (!file) { TN.toast('Choose the file first', 'warning', 'Nothing was attached.'); return; } i.source = { file: file.name, size: Math.max(1, Math.round(file.size / 1024)) + ' KB', at: TN.TODAY }; TN.toast('File attached', 'success', 'Private: it is never sent.'); TN.refresh(); });
  TN.act('it-settle', (el) => {
    const i = itOf(el), d = i.diffs.find((x) => x.id === el.dataset.d), how = el.dataset.how;
    const done = (txt, noteText) => { d.settled = true; if (how === 'use') { const a = i.facts.activities[0]; if (a && /date/.test(d.label)) a.date = '2027-01-12'; } i.settled.push({ label: d.label, how: txt, by: me(), at: TN.TODAY, note: noteText || '' }); i.updated = now(); TN.closeOverlay(); TN.toast('Difference settled'); TN.refresh(); };
    if (how === 'note') { TN.dialog({ title: `Keep the itinerary value for ${d.label}?`, body: `<form id="it-note-form" data-act="it-note-yes" data-id="${i.id}" data-d="${d.id}" class="flex flex-col gap-4" novalidate>${area('it-diff-note', 'Note', '', { name: 'note', hint: 'Why it differs. Saved with your name; never printed.', rows: 3 })}</form>`, footer: U.button('Cancel', { attrs: { 'data-close': '' } }) + U.button('Keep it and add the note', { variant: 'primary', type: 'submit', attrs: { form: 'it-note-form' } }) }); return; }
    done(how === 'use' ? 'quotation value used' : 'kept on purpose');
  });
  TN.act('it-note-yes', (f) => { const i = itOf(f), d = i.diffs.find((x) => x.id === f.dataset.d), n = new FormData(f).get('note').trim(); if (!n) { TN.toast('Add the note first', 'warning', 'Nothing was settled.'); return; } d.settled = true; i.settled.push({ label: d.label, how: 'kept on purpose', by: me(), at: TN.TODAY, note: n }); i.updated = now(); TN.closeOverlay(); TN.toast('Difference settled'); TN.refresh(); });
  TN.act('it-recheck', (el) => { const i = itOf(el); TN.toast(openDiffs(i) ? pl(openDiffs(i), 'open difference') + ' still to settle' : 'Matches the ' + (i.basis.kind === 'quotation' ? 'quotation' : 'booking'), openDiffs(i) ? 'warning' : 'success'); });
  TN.act('it-ready', (el) => { const i = itOf(el); if (openDiffs(i)) { TN.toast('Not ready yet', 'danger', 'Settle the open differences first.'); return; } if (!i.facts.dest || !i.facts.days.length) { TN.toast('Not ready yet', 'danger', 'Add the destination and at least one day.'); return; } i.status = 'ready'; i.updated = now(); TN.toast('Facts ready', 'success', 'You can make the final PDF now.'); TN.refresh(); });
  TN.act('it-render', (el) => {
    const i = itOf(el), kind = el.dataset.kind;
    if (kind === 'final' && (openDiffs(i) || i.status === 'draft')) { TN.toast('Not made', 'danger', 'Settle the differences and mark the facts ready first.'); return; }
    i.docs.push({ kind, at: TN.TODAY, file: `${i.id}-${kind === 'final' ? (i.facts.cover || 'itinerary').replace(/\s+/g, '-') + '-itinerary' : 'preview'}.pdf` });
    if (kind === 'final') i.status = 'final'; i.updated = now();
    TN.toast(kind === 'final' ? 'Final PDF made' : 'Preview PDF made', 'success', 'Nothing is sent to the customer. Open it from Documents.'); TN.refresh();
  });
  TN.page('/app/itineraries/:id/preview', { nav: '/app/itineraries', roles: ['sales', 'manager'], title: 'Customer copy',
    render(p) {
      const i = itinById(p.id); if (!i) return U.notAllowed(false);
      return U.page(U.backLink(`/app/itineraries/${i.id}`, 'Back to the itinerary') + U.pageHeader({ title: 'What the customer sees', description: 'This is how the itinerary will look. Nothing is sent.' })
        + `<div class="mb-4 flex flex-col gap-3" role="status">${note('circle-check', 'text-status-success', 'Checked: no internal or pushy words.')}</div>` + itinDoc(i, 'itin-document'));
    } });
  /* The PDF itself (what "Open" on a document shows): the print layout, no CRM shell. */
  TN.page('/app/itineraries/:id/print', { nav: '__bare', roles: ['sales', 'manager'], title: 'Itinerary PDF',
    render(p) { const i = itinById(p.id); if (!i) return U.notAllowed(false); return `<div class="tn-print-root"><main id="main" class="tn-print">${itinDoc(i, 'print-document')}</main></div>`; } });
})();
