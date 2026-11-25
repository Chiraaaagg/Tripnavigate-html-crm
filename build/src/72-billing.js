/* =====================================================================
   72-billing.js · Bills per service (billing build plan, 24 Nov 2026)
   Screens (plan section 3, owner answers Q1–Q10 and 8.1):
     #/app/accounts/bills            Bills list, one row per bill, grouped by Deal; side panel ?doc=<key>
     #/app/accounts/bills/pilot      Pilot check (matching against the official invoices)
     #/app/deals/:id/bills           Bills of one Deal + Deal bill summary (paid and balance once, Q7 a)
     Deal cancellation drawer        "Charge kept per bill" (plan 1.5), opened from Deal › Services › Cancel booking
     Credit Note view                internal "Credit Note" document, opened from the side panel
   Book now step 3 "Services billed separately" (plan 3.1) lives in 30-booknow.js.
   Rules kept: the CRM bill is internal (the billing tools keep making the customer's GST invoice);
   no GST sums; package bill = Deal total minus the typed prices; a flight-only Deal is billed on the
   Flight desk's ticket total; Purchase, Flight and Visa never see a bill, a selling price or a difference
   (the one exception: the Flight desk's own total on a flight-only Deal, as live today).
   Every name, number and amount here is invented.
   ===================================================================== */
(function () {
  const TN = window.TN;
  const D = TN.DATA;
  const E = TN.esc;
  const F = TN.fmt;
  const ui = TN.ui;
  const BILLS = '/app/accounts/bills';
  const PILOT = '/app/accounts/bills/pilot';
  const ACC = ['accounts', 'checker'];
  const isAcc = () => TN.is(...ACC);
  const inr = (n) => (n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }));
  const money = (n) => `<span class="bl-num">${inr(n)}</span>`;
  const day = (iso) => `<span class="whitespace-nowrap">${E(F.date(iso))}</span>`;
  const ic = (n, c = 'size-4 shrink-0 text-quiet') => TN.ic(n, c);
  const pname = (k) => (k === 'crm' ? 'the CRM' : (TN.person(k) || {}).name || '—');
  const nowStamp = () => { const d = new Date(); return `${TN.TODAY} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
  const pushNotice = (to, text, deal, href) => D.notices.unshift({ id: 'n-bill-' + Date.now() + Math.random().toString(36).slice(2, 5), to, kind: 'notice', text, deal, href, at: nowStamp() });
  const COMPANY = TN.COMPANY || { legal: 'Holiday Chacha Pvt Ltd', office: '59A, Babu Rajendra Marg, Masuria Colony, Baldev Nagar, Jodhpur, Rajasthan 342003', pan: 'AAFCH9191M', gstin: '08AAFCH9191M1ZV', state: 'Rajasthan' };
  TN.BILLING = Object.assign({ servicePricesEnabled: true, pilotBranch: 'Jodhpur' }, TN.BILLING || {});

  /* ==================================================================
     1. Invented data: customers, Deals, services, receipts, bills
     ================================================================== */
  Object.assign(D.customers, {
    'c-kothari': { name: 'Harsh Kothari', phone: '+91 98290 55102', email: 'harsh.kothari77@gmail.com', city: 'Jodhpur' },
    'c-paliwal': { name: 'Vivek Paliwal', phone: '+91 94142 80316', email: 'vivek.paliwal@outlook.com', city: 'Jodhpur' },
    'c-daga': { name: 'Sharda Daga', phone: '+91 97830 61244', email: 'sharda.daga@gmail.com', city: 'Jodhpur' },
    'c-bohra': { name: 'Anil Bohra', phone: '+91 99280 43517', email: 'anil.bohra.jdh@gmail.com', city: 'Jodhpur' },
    'c-ranka': { name: 'Nitin Ranka', phone: '+91 96360 27458', email: 'nitin.ranka@yahoo.co.in', city: 'Jodhpur' },
    'c-tanwar': { name: 'Manish Tanwar', phone: '+91 98877 41960', email: 'manish.tanwar82@gmail.com', city: 'Jodhpur' },
    'c-rawat': { name: 'Arvind Rawat', phone: '+91 94606 18273', email: 'arvind.rawat@gmail.com', city: 'Jodhpur' },
  });
  const deal = (o) => Object.assign({ owner: 'sales', stage: 'Won - Payment Received', children: 0, infants: 0, tripStatus: null, costEstimate: null }, o);
  [
    deal({ id: 'BX-10101', title: 'Kothari family · Dubai · 5N', customer: 'c-kothari', destination: 'Dubai', start: '2026-11-26', end: '2026-12-01', nights: 5, adults: 4, tripType: 'International', bookingState: 'being_arranged', accountsReview: 'approved', submittedAt: '2026-10-20', approvedAt: '2026-10-21', sellingPrice: 468000, costEstimate: 402600, services: ['s-10101-h1', 's-10101-h2', 's-10101-t', 's-10101-a', 's-10101-f', 's-10101-v'] }),
    deal({ id: 'BX-10102', title: 'Vivek Paliwal · Flight · JDH to BOM and back', customer: 'c-paliwal', destination: 'Mumbai', start: '2026-11-12', end: '2026-11-15', nights: 3, adults: 2, tripType: 'Domestic', bookingState: 'all_confirmed', tripStatus: 'booked', accountsReview: 'approved', submittedAt: '2026-10-20', approvedAt: '2026-10-21', sellingPrice: 18400, flightOnly: true, services: ['s-10102-f'] }),
    deal({ id: 'BX-10103', title: 'Daga family · Mount Abu and Udaipur · 4N', customer: 'c-daga', owner: 'sales2', destination: 'Mount Abu, Udaipur', start: '2026-11-18', end: '2026-11-22', nights: 4, adults: 3, tripType: 'Domestic', bookingState: 'being_arranged', accountsReview: 'approved', submittedAt: '2026-10-19', approvedAt: '2026-10-20', sellingPrice: 48000, services: ['s-10103-h1', 's-10103-h2'] }),
    deal({ id: 'BX-10104', title: 'Bohra family · Schengen visa and passports', customer: 'c-bohra', destination: 'France', start: '2027-01-15', end: '2027-01-25', nights: 10, adults: 3, tripType: 'International', bookingState: 'being_arranged', accountsReview: 'approved', submittedAt: '2026-10-22', approvedAt: '2026-10-23', sellingPrice: 36000, services: ['s-10104-v', 's-10104-p'] }),
    deal({ id: 'BX-10107', title: 'Ranka couple · Bali · 5N', customer: 'c-ranka', destination: 'Bali', start: '2026-12-10', end: '2026-12-15', nights: 5, adults: 2, tripType: 'International', bookingState: 'being_arranged', accountsReview: 'approved', submittedAt: '2026-10-19', approvedAt: '2026-10-20', sellingPrice: 342000, services: ['s-10107-h', 's-10107-t', 's-10107-f'] }),
    deal({ id: 'BX-10105', title: 'Tanwar family · Dubai · 5N', customer: 'c-tanwar', destination: 'Dubai', start: '2026-12-18', end: '2026-12-23', nights: 5, adults: 4, tripType: 'International', bookingState: 'in_progress', accountsReview: null, submittedAt: null, sellingPrice: null, services: [] }),
    deal({ id: 'BX-10106', title: 'Rawat couple · Mount Abu and Udaipur · 4N', customer: 'c-rawat', destination: 'Mount Abu, Udaipur', start: '2026-12-05', end: '2026-12-09', nights: 4, adults: 2, tripType: 'Domestic', bookingState: 'in_progress', accountsReview: null, submittedAt: null, sellingPrice: null, services: [] }),
  ].forEach((d) => { if (!TN.deal(d.id)) D.deals.push(d); });

  const pax = (names, type = 'adult') => names.map((name) => ({ name, type }));
  const KOTHARI = ['Harsh Kothari', 'Pallavi Kothari', 'Yash Kothari', 'Riya Kothari'];
  const svc = (id, o) => { if (!D.services[id]) D.services[id] = Object.assign({ assignee: null, taskStatus: 'in_progress', goAhead: null }, o); };
  svc('s-10101-h1', { deal: 'BX-10101', kind: 'hotel', dept: 'purchase', title: 'Rove Downtown, Dubai', detail: '3 nights · 2 Rove rooms · breakfast', start: '2026-11-26', end: '2026-11-29', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-arabian', budget: 56400, cost: 55800 });
  svc('s-10101-h2', { deal: 'BX-10101', kind: 'hotel', dept: 'purchase', title: 'JA Ocean View Hotel, Dubai', detail: '2 nights · 2 Sea view rooms · breakfast', start: '2026-11-29', end: '2026-12-01', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-arabian', budget: 51200, cost: 50600 });
  svc('s-10101-t', { deal: 'BX-10101', kind: 'transfer', dept: 'purchase', title: 'Dubai airport and hotel transfers', detail: '3 transfers · Toyota HiAce', start: '2026-11-26', end: '2026-12-01', assignee: 'purchase', supplier: 'sp-arabian', budget: 12000, cost: 11400 });
  svc('s-10101-a', { deal: 'BX-10101', kind: 'activity', dept: 'purchase', title: 'Desert safari with BBQ dinner', detail: '4 people · shared 4x4', start: '2026-11-28', end: '2026-11-28', assignee: 'purchase', supplier: 'sp-arabian', budget: 14000, cost: 13200 });
  svc('s-10101-f', { deal: 'BX-10101', kind: 'flight', dept: 'flight', title: 'AMD to DXB and back', detail: 'Emirates EK 539 / EK 538 · 4 passengers', start: '2026-11-26', end: '2026-12-01', assignee: 'flight', taskStatus: 'done', supplier: 'sp-emirates', budget: 90000, cost: 88460, pnr: 'R7KD2M',
    segments: [{ from: 'AMD', to: 'DXB', date: '2026-11-26', flight: 'Emirates EK 539', time: '04:25' }, { from: 'DXB', to: 'AMD', date: '2026-12-01', flight: 'Emirates EK 538', time: '22:05' }],
    preferredTime: 'Any', cabin: 'Economy', notes: 'None', passengers: pax(KOTHARI), versionNo: 1, savedAt: '2026-10-20 12:10', createdAt: '2026-10-21 12:00', takenAt: '2026-10-21 14:05', doneAt: '2026-10-24 16:10', doneBy: 'flight' });
  svc('s-10101-v', { deal: 'BX-10101', kind: 'visa', dept: 'visa', title: 'United Arab Emirates · Tourism', detail: '4 travellers', start: '2026-11-26', end: '2026-12-01', assignee: 'visa', budget: 12800,
    visa: { country: 'United Arab Emirates', purpose: 'Tourism', travelDate: '2026-11-26', applyBy: '2026-11-12', feePaidBy: 'company' }, versionNo: 1, savedAt: '2026-10-20', createdAt: '2026-10-21 12:00', takenAt: '2026-10-22 10:30',
    applicants: KOTHARI.map((name, i) => ({ seq: i + 1, name, type: 'adult', age: [48, 45, 19, 17][i], born: ['1978-02-11', '1981-06-30', '2007-03-14', '2009-08-02'][i], nationality: 'Indian', passport: ['••••3381', '••••7024', '••••5190', '••••6612'][i], state: 'docs_pending', documents: [] })) });
  svc('s-10102-f', { deal: 'BX-10102', kind: 'flight', dept: 'flight', title: 'JDH to BOM and back', detail: 'IndiGo 6E 5236 / 6E 5237 · 2 passengers', start: '2026-11-12', end: '2026-11-15', assignee: 'flight', taskStatus: 'done', supplier: 'sp-indigo', budget: 17200, cost: 16980, pnr: 'H2QX9L',
    segments: [{ from: 'JDH', to: 'BOM', date: '2026-11-12', flight: 'IndiGo 6E 5236', time: '08:40' }, { from: 'BOM', to: 'JDH', date: '2026-11-15', flight: 'IndiGo 6E 5237', time: '19:55' }],
    preferredTime: 'Morning departure', cabin: 'Economy', notes: 'None', passengers: pax(['Vivek Paliwal', 'Shalini Paliwal']), versionNo: 1, savedAt: '2026-10-20 11:30', createdAt: '2026-10-21 11:00', takenAt: '2026-10-21 11:20', doneAt: '2026-10-21 17:45', doneBy: 'flight',
    customerTotal: 18400, customerTotalBy: 'flight', customerTotalAt: '2026-10-21 17:40' });
  svc('s-10103-h1', { deal: 'BX-10103', kind: 'hotel', dept: 'purchase', title: 'Hilltone, Mount Abu', detail: '2 nights · 1 Deluxe room + extra bed · breakfast', start: '2026-11-18', end: '2026-11-20', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-arabian', budget: 18200, cost: 18600 });
  svc('s-10103-h2', { deal: 'BX-10103', kind: 'hotel', dept: 'purchase', title: 'Trident, Udaipur', detail: '2 nights · 1 Lake view room + extra bed · breakfast', start: '2026-11-20', end: '2026-11-22', assignee: 'purchase', goAhead: 'given', budget: 22400 });
  const BOHRA = ['Anil Bohra', 'Kavita Bohra', 'Tanish Bohra'];
  svc('s-10104-v', { deal: 'BX-10104', kind: 'visa', dept: 'visa', title: 'France · Tourism', detail: '3 travellers', start: '2027-01-15', end: '2027-01-25', assignee: 'visa', budget: 23400, cost: 23400,
    visa: { country: 'France', purpose: 'Tourism', travelDate: '2027-01-15', applyBy: '2026-12-01', feePaidBy: 'company' }, versionNo: 1, savedAt: '2026-10-22', createdAt: '2026-10-23 12:00', takenAt: '2026-10-23 15:10',
    applicants: BOHRA.map((name, i) => ({ seq: i + 1, name, type: 'adult', age: [51, 47, 22][i], born: ['1975-05-19', '1979-01-07', '2004-10-28'][i], nationality: 'Indian', passport: ['••••2045', '••••8817', '••••4302'][i], state: 'docs_pending', documents: [] })) });
  svc('s-10104-p', { deal: 'BX-10104', kind: 'passport', dept: 'visa', title: 'Passport, renewal (Tatkal)', detail: 'Jodhpur passport office · 2 applicants', start: '2026-11-03', end: '2026-11-03', assignee: 'visa', budget: 6300, cost: 6300,
    visa: { country: 'India', purpose: 'Passport renewal (Tatkal)', travelDate: '2026-11-03', applyBy: '2026-11-03', feePaidBy: 'company' }, versionNo: 1, savedAt: '2026-10-22', createdAt: '2026-10-23 12:00', takenAt: '2026-10-23 15:12',
    applicants: ['Kavita Bohra', 'Tanish Bohra'].map((name, i) => ({ seq: i + 1, name, type: 'adult', age: [47, 22][i], born: ['1979-01-07', '2004-10-28'][i], nationality: 'Indian', passport: ['••••8817', '••••4302'][i], state: 'docs_pending', documents: [] })) });
  svc('s-10107-h', { deal: 'BX-10107', kind: 'hotel', dept: 'purchase', title: 'Alaya Resort Ubud, Bali', detail: '5 nights · 1 Deluxe room · breakfast', start: '2026-12-10', end: '2026-12-15', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', budget: 182000, cost: 179500 });
  svc('s-10107-t', { deal: 'BX-10107', kind: 'transfer', dept: 'purchase', title: 'Bali airport transfers and day tours', detail: '1 private car with driver', start: '2026-12-10', end: '2026-12-15', assignee: 'purchase', budget: 24000, cost: 23000 });
  svc('s-10107-f', { deal: 'BX-10107', kind: 'flight', dept: 'flight', title: 'DEL to DPS and back', detail: 'Singapore Airlines SQ 403 / SQ 942 · 2 passengers · removed', start: '2026-12-10', end: '2026-12-15', assignee: 'flight', taskStatus: 'cancelled', supplier: 'sp-sia', budget: 88000, cost: 87200, pnr: 'SQ7M4K',
    segments: [{ from: 'DEL', to: 'SIN', date: '2026-12-10', flight: 'Singapore Airlines SQ 403', time: '23:45' }, { from: 'SIN', to: 'DPS', date: '2026-12-11', flight: 'Singapore Airlines SQ 942', time: '09:10' }],
    preferredTime: 'Night flight', cabin: 'Economy', notes: 'Removed on 26 Oct: the couple fly on their own miles.', passengers: pax(['Nitin Ranka', 'Megha Ranka']), versionNo: 2, savedAt: '2026-10-19 12:40', createdAt: '2026-10-20 12:00', takenAt: '2026-10-20 14:00', doneAt: '2026-10-22 13:00', doneBy: 'flight' });

  const trav = (dealId, list) => { if (!D.travellers[dealId]) D.travellers[dealId] = list.map(([name, dob, kind]) => ({ name, type: 'adult', dob, id: { file: `${kind}-${name.toLowerCase().replace(/ /g, '-')}.pdf`, kind: kind === 'passport' ? 'Passport' : 'Aadhaar', size: '320 KB', at: '2026-10-19' } })); };
  trav('BX-10101', KOTHARI.map((n, i) => [n, ['1978-02-11', '1981-06-30', '2007-03-14', '2009-08-02'][i], 'passport']));
  trav('BX-10102', [['Vivek Paliwal', '1988-04-21', 'aadhaar'], ['Shalini Paliwal', '1990-12-02', 'aadhaar']]);
  trav('BX-10103', [['Sharda Daga', '1966-09-14', 'aadhaar'], ['Mukesh Daga', '1962-03-08', 'aadhaar'], ['Pooja Daga', '1994-07-27', 'aadhaar']]);
  trav('BX-10104', BOHRA.map((n, i) => [n, ['1975-05-19', '1979-01-07', '2004-10-28'][i], 'passport']));
  trav('BX-10107', [['Nitin Ranka', '1989-11-03', 'passport'], ['Megha Ranka', '1991-02-16', 'passport']]);

  const rc = (id, dealId, amount, date, mode, ref) => { if (!D.receipts.some((r) => r.id === id)) D.receipts.push({ id, deal: dealId, mode, ref, amount, date, status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'HDFC Bank current account ··4417' }); };
  rc('RC-26-0131', 'BX-10101', 200000, '2026-10-21', 'Bank transfer', 'UTR HDFCN52026102155310');
  rc('RC-26-0133', 'BX-10102', 18400, '2026-10-21', 'UPI', 'UPI 629917402281');
  rc('RC-26-0134', 'BX-10103', 20000, '2026-10-20', 'UPI', 'UPI 629880153364');
  rc('RC-26-0136', 'BX-10104', 36000, '2026-10-23', 'Bank transfer', 'UTR ICICR42026102349917');
  rc('RC-26-0137', 'BX-10107', 150000, '2026-10-20', 'Bank transfer', 'UTR SBINR12026102061258');
  const inst = (dealId, label, due, amount, paid) => { if (!D.instalments.some((x) => x.deal === dealId && x.label === label)) D.instalments.push({ deal: dealId, label, due, amount, paid, status: paid >= amount ? 'paid' : 'due' }); };
  inst('BX-10101', 'Advance', '2026-10-21', 200000, 200000); inst('BX-10101', 'Balance', '2026-11-16', 268000, 0);
  inst('BX-10102', 'Full payment', '2026-10-21', 18400, 18400);
  inst('BX-10103', 'Advance', '2026-10-20', 20000, 20000); inst('BX-10103', 'Balance', '2026-11-10', 28000, 0);
  inst('BX-10104', 'Full payment', '2026-10-23', 36000, 36000);
  inst('BX-10107', 'Advance', '2026-10-20', 150000, 150000); inst('BX-10107', 'Balance', '2026-11-30', 192000, 0);

  // The removed flight of the Bali Deal (an approved change request: a separately billed service removed).
  if (!D.changes.some((c) => c.id === 'ch-10107-1')) D.changes.push({ id: 'ch-10107-1', deal: 'BX-10107', kind: 'Remove a service', detail: 'Remove the DEL to DPS flights: the couple fly on their own airline miles.', requestedBy: 'sales', at: '2026-10-25', status: 'done', note: 'Approved by the branch Manager on 26 Oct. The airline keeps ₹6,000.', approvedBy: 'manager', approvedAt: '2026-10-26' });

  /* Bills (one per bill group). cost: { state: known | not_known | not_shown, atRelease, now }. */
  const H = (at, who, what) => ({ at, who, what });
  const bill = (o) => Object.assign({ kind: 'invoice', status: 'released', madeBy: 'crm', releasedBy: 'crm', official: [], noOfficial: null, credits: null, lines: [], hotels: [], history: [] }, o);
  const relH = (date) => [H(`${date} 11:02`, 'crm', 'Drafted when Accounts approved the booking'), H(`${date} 11:02`, 'crm', 'Released (automatic release)'), H(`${date} 11:03`, 'crm', 'PDF made')];
  const ofc = (no, date, total, by = 'accounts', reason = '') => ({ no, date, total, by, at: `${date} 16:20`, reason, withdrawn: null });
  const kLines = (route, date, pnr) => KOTHARI.map((n) => ({ passenger: n, route, date, pnr }));
  D.groupBills = D.groupBills || [
    bill({ key: 'b-10101-pkg-1', no: '10101-PKG-INV-1', deal: 'BX-10101', svc: 'PKG', forText: 'Package · Dubai 5N · 4 services', svcs: ['s-10101-h1', 's-10101-h2', 's-10101-t', 's-10101-a'], total: 358000, date: '2026-10-21', cost: { state: 'not_shown' },
      lines: [{ what: 'Holiday package · Dubai', amount: 358000 }], hotels: ['Rove Downtown, Dubai · 26 Nov to 29 Nov 2026 · 3 nights · 2 Rove rooms · breakfast', 'JA Ocean View Hotel, Dubai · 29 Nov to 1 Dec 2026 · 2 nights · 2 Sea view rooms · breakfast'],
      official: [ofc('PKI/2627/0214', '2026-10-23', 358000)], history: [...relH('2026-10-21'), H('2026-10-23 16:20', 'accounts', 'Official invoice PKI/2627/0214 linked · total matches')] }),
    bill({ key: 'b-10101-flt-1', no: '10101-FLT-INV-1', deal: 'BX-10101', svc: 'FLT', forText: 'Flights · AMD – DXB, DXB – AMD · 4 passengers', svcs: ['s-10101-f'], total: 96000, date: '2026-10-21', cost: { state: 'known', atRelease: 88460, now: 88460, from: 'Flight desk ticket cost' },
      lines: kLines('AMD – DXB, DXB – AMD', '2026-11-26', 'R7KD2M'), official: [ofc('ITI/2627/0388', '2026-10-23', 96000)], history: [...relH('2026-10-21'), H('2026-10-23 16:24', 'accounts', 'Official invoice ITI/2627/0388 linked · total matches')] }),
    bill({ key: 'b-10101-vis-1', no: '10101-VIS-INV-1', deal: 'BX-10101', svc: 'VIS', forText: 'Visa · United Arab Emirates · 4 applicants', svcs: ['s-10101-v'], total: 14000, date: '2026-10-21', cost: { state: 'not_known', from: 'Visa fee entries' },
      lines: KOTHARI.map((n) => ({ applicant: n, country: 'United Arab Emirates', vtype: 'Tourism, 30 days' })), history: relH('2026-10-21') }),
    bill({ key: 'b-10102-flt-1', no: '10102-FLT-INV-1', deal: 'BX-10102', svc: 'FLT', forText: 'Flights · JDH – BOM, BOM – JDH · 2 passengers', svcs: ['s-10102-f'], total: 18400, flightDeskTotal: true, date: '2026-10-21', cost: { state: 'known', atRelease: 16980, now: 16980, from: 'Flight desk ticket cost' },
      lines: ['Vivek Paliwal', 'Shalini Paliwal'].map((n) => ({ passenger: n, route: 'JDH – BOM, BOM – JDH', date: '2026-11-12', pnr: 'H2QX9L' })),
      official: [ofc('DTI/2627/0412', '2026-10-23', 18520, 'checker', 'The billing tool added a ₹120 seat charge that the CRM booking does not have.')], history: [...relH('2026-10-21'), H('2026-10-23 17:05', 'checker', 'Official invoice DTI/2627/0412 linked · differs by ₹120')] }),
    bill({ key: 'b-10103-htl-1', no: '10103-HTL-INV-1', deal: 'BX-10103', svc: 'HTL', forText: 'Hotel 1 · Hilltone, Mount Abu · 2 nights', svcs: ['s-10103-h1'], total: 22000, date: '2026-10-20', cost: { state: 'known', atRelease: 18200, now: 18600, from: 'Confirmed supplier cost' },
      lines: [{ hotel: 'Hilltone', city: 'Mount Abu', dates: '18 Nov to 20 Nov 2026', nights: 2, rooms: '1 room + extra bed', room: 'Deluxe room', meal: 'Breakfast' }], official: [ofc('HTI/2627/0087', '2026-10-22', 48000)], history: [...relH('2026-10-20'), H('2026-10-22 15:40', 'accounts', 'Official invoice HTI/2627/0087 linked (one invoice for both hotel bills)'), H('2026-10-24 12:10', 'purchase', 'Supplier cost changed from ₹18,200 to ₹18,600')] }),
    bill({ key: 'b-10103-htl-2', no: '10103-HTL-INV-2', deal: 'BX-10103', svc: 'HTL', forText: 'Hotel 2 · Trident, Udaipur · 2 nights', svcs: ['s-10103-h2'], total: 26000, date: '2026-10-20', cost: { state: 'not_known', from: 'Confirmed supplier cost' },
      lines: [{ hotel: 'Trident', city: 'Udaipur', dates: '20 Nov to 22 Nov 2026', nights: 2, rooms: '1 room + extra bed', room: 'Lake view room', meal: 'Breakfast' }], official: [ofc('HTI/2627/0087', '2026-10-22', 48000)], history: [...relH('2026-10-20'), H('2026-10-22 15:40', 'accounts', 'Official invoice HTI/2627/0087 linked (one invoice for both hotel bills)')] }),
    bill({ key: 'b-10104-vis-1', no: '10104-VIS-INV-1', deal: 'BX-10104', svc: 'VIS', forText: 'Visa · France · 3 applicants', svcs: ['s-10104-v'], total: 27000, date: '2026-10-23', cost: { state: 'known', atRelease: 23400, now: 23400, from: 'Visa fee entries' },
      lines: BOHRA.map((n) => ({ applicant: n, country: 'France (Schengen)', vtype: 'Short stay, tourism' })), official: [ofc('MVI/2627/0051', '2026-10-24', 27000)], history: [...relH('2026-10-23'), H('2026-10-24 12:30', 'accounts', 'Official invoice MVI/2627/0051 linked · total matches')] }),
    bill({ key: 'b-10104-ppt-1', no: '10104-PPT-INV-1', deal: 'BX-10104', svc: 'PPT', forText: 'Passport · renewal (Tatkal) · 2 applicants', svcs: ['s-10104-p'], total: 9000, date: '2026-10-23', cost: { state: 'known', atRelease: 6300, now: 6300, from: 'Passport fee entries' },
      lines: ['Kavita Bohra', 'Tanish Bohra'].map((n) => ({ applicant: n, atype: 'Renewal, Tatkal' })), history: relH('2026-10-23') }),
    bill({ key: 'b-10107-pkg-1', no: '10107-PKG-INV-1', deal: 'BX-10107', svc: 'PKG', forText: 'Package · Bali 5N · 2 services', svcs: ['s-10107-h', 's-10107-t'], total: 246000, date: '2026-10-20', cost: { state: 'not_shown' },
      lines: [{ what: 'Holiday package · Bali', amount: 246000 }], hotels: ['Alaya Resort Ubud, Bali · 10 Dec to 15 Dec 2026 · 5 nights · 1 Deluxe room · breakfast'], official: [ofc('PKI/2627/0219', '2026-10-22', 246000)], history: [...relH('2026-10-20'), H('2026-10-22 11:15', 'accounts', 'Official invoice PKI/2627/0219 linked · total matches')] }),
    bill({ key: 'b-10107-flt-1', no: '10107-FLT-INV-1', deal: 'BX-10107', svc: 'FLT', forText: 'Flights · DEL – SIN, SIN – DPS · 2 passengers', svcs: ['s-10107-f'], total: 96000, date: '2026-10-20', cost: { state: 'known', atRelease: 87200, now: 87200, from: 'Flight desk ticket cost' },
      lines: [['Nitin Ranka', 'DEL – SIN', '2026-12-10', 'SQ 403'], ['Nitin Ranka', 'SIN – DPS', '2026-12-11', 'SQ 942'], ['Megha Ranka', 'DEL – SIN', '2026-12-10', 'SQ 403'], ['Megha Ranka', 'SIN – DPS', '2026-12-11', 'SQ 942']].map(([p, r, d, fno]) => ({ passenger: p, route: r, date: d, flight: fno, pnr: 'SQ7M4K' })),
      official: [ofc('ITI/2627/0391', '2026-10-22', 96000)], history: [...relH('2026-10-20'), H('2026-10-22 11:18', 'accounts', 'Official invoice ITI/2627/0391 linked · total matches'), H('2026-10-26 15:30', 'manager', 'Flight removed (change ch-10107-1 approved). A credit note is due.')] }),
  ];
  /* Events that call for a credit note on one bill (plan 1.5): a separately billed service removed. */
  D.billEvents = D.billEvents || [
    { id: 'ch-10107-1', bill: 'b-10107-flt-1', kind: 'service_removed', text: 'The flights were removed by change ch-10107-1, approved by the branch Manager on 26 Oct 2026.', charge: 6000, costCredited: 81200, costFrom: 'airline refund recorded by the Flight desk', done: null },
  ];
  D.officialWithoutBill = D.officialWithoutBill || [
    { no: 'RTI/2627/0033', date: '2026-10-21', total: 2860, reason: 'Train, bus, insurance or miscellaneous', note: 'Rail tickets for a walk-in customer. Trains are not in the CRM.', by: 'accounts', at: '2026-10-21 18:05' },
  ];

  /* Status words (one word, one tone everywhere) */
  [['no bill yet', 'neutral', 'clock'], ['matched', 'success', 'circle-check'], ['not paired yet', 'neutral', 'hourglass'], ['grouped differently', 'info', 'info'], ['no official invoice', 'neutral', 'circle-minus'], ['credit note due', 'warning', 'triangle-alert'], ['credited', 'neutral', 'undo-2'], ['total not typed', 'neutral', 'circle-help']]
    .forEach(([w, t, i]) => ui.statusTone && ui.statusTone.add(w, t, i));

  /* ==================================================================
     2. Reads
     ================================================================== */
  const B = {
    of: (key) => D.groupBills.find((b) => b.key === key),
    ofDeal: (id) => D.groupBills.filter((b) => b.deal === id),
    invoices: (id) => D.groupBills.filter((b) => b.deal === id && b.kind === 'invoice' && b.status === 'released'),
    creditsOf: (b) => D.groupBills.filter((x) => x.kind === 'credit_note' && x.credits === b.key),
    eventOf: (b) => D.billEvents.find((e) => e.bill === b.key && !e.done),
    deals: () => D.deals.filter((d) => D.groupBills.some((b) => b.deal === d.id) || (d.billPlan && d.accountsReview !== 'approved')),
    received: (id) => D.receipts.filter((r) => r.deal === id && r.status === 'verified').reduce((s, r) => s + r.amount, 0),
    billed: (id) => B.invoices(id).reduce((s, b) => s + b.total, 0) - D.groupBills.filter((b) => b.deal === id && b.kind === 'credit_note').reduce((s, b) => s + b.total, 0),
  };
  TN.bills = B;
  const kindWord = (b) => (b.kind === 'credit_note' ? 'Credit Note' : 'Invoice');
  const liveOfficial = (b) => (b.official || []).filter((o) => !o.withdrawn);
  const diffOf = (b) => (b.cost.state === 'known' ? b.total - b.cost.now : null);
  /** Pilot result of one released Invoice: { word, second, key } (words and icon, never colour alone). */
  function result(b) {
    if (b.noOfficial) return { key: 'none', word: 'No official invoice', second: E(b.noOfficial.reason) };
    const offs = liveOfficial(b);
    if (!offs.length) { const n = Math.max(0, -F.daysFrom(b.date)); return { key: 'unpaired', word: 'Not paired yet', second: `${F.plural(n, 'day')}` }; }
    const shared = offs.some((o) => D.groupBills.some((x) => x !== b && x.kind === 'invoice' && liveOfficial(x).some((y) => y.no === o.no)));
    if (offs.length > 1 || shared) return { key: 'grouped', word: 'Grouped differently', second: offs.length > 1 ? `${offs.length} official invoices for this bill` : 'One official invoice covers more than one CRM bill' };
    const o = offs[0];
    if (o.total == null) return { key: 'nototal', word: 'Total not typed', second: 'Paired with ' + E(o.no) };
    if (o.total === b.total) return { key: 'matched', word: 'Matched', second: 'Totals equal' };
    return { key: 'differs', word: `Total differs by ${inr(Math.abs(o.total - b.total))}`, second: E(o.reason || 'No reason typed yet') };
  }
  /** What needs Accounts on a bill, or null. */
  function attention(b) {
    if (b.kind !== 'invoice' || b.status !== 'released') return null;
    if (B.eventOf(b)) return { text: 'Make the credit note for the removed service.', button: 'Make credit note', act: 'bill-cn-open' };
    if (!liveOfficial(b).length && !b.noOfficial) return { text: 'Type the official invoice number once the billing tool has made the customer’s invoice.', button: 'Add invoice number from billing tool', jump: 'bill-off-no' };
    if (b.cost.state === 'known' && b.cost.atRelease != null && b.cost.now !== b.cost.atRelease) return { text: 'Check the cost: it changed after this bill was made.', button: null };
    return null;
  }
  const needsAttention = () => D.groupBills.filter((b) => attention(b)).length;

  /* ==================================================================
     3. Menu, section tabs, Home row
     ================================================================== */
  const tabCount = () => needsAttention();
  if (TN.ACC_SECTIONS && !TN.ACC_SECTIONS.some((s) => s.key === 'bills')) {
    TN.ACC_SECTIONS.splice(1, 0, { key: 'bills', label: 'Bills', icon: 'file-text', tabs: [{ href: BILLS, label: 'Bills', count: tabCount }, { href: PILOT, label: 'Pilot check', count: () => D.groupBills.filter((b) => b.kind === 'invoice' && b.status === 'released' && !liveOfficial(b).length && !b.noOfficial).length }] });
  }
  // The branch Manager reads Bills and the Pilot check (read-only); the Manager has no Accounts menu group.
  const navBase = TN.navItems;
  if (navBase) TN.navItems = () => { const items = navBase(); if (TN.is('manager')) items.splice(Math.max(1, items.findIndex((i) => i.href === '/app/reports') + 1), 0, { href: BILLS, label: 'Bills', group: 'top', icon: 'file-text', prefixes: [PILOT] }); return items; };
  TN.homeRow({ roles: ACC, section: 'What needs you', label: 'Bills needing attention', href: `#${BILLS}?show=attention`, count: needsAttention, button: (n) => `Check ${F.plural(n, 'bill')}` });

  /* ==================================================================
     4. Shared markup
     ================================================================== */
  const btn = (label, o = {}) => ui.button(label, o);
  const linkBtn = (b) => `<button type="button" class="${ui.buttonClass('link', 'sm', 'h-auto min-h-0 p-0 text-left font-semibold whitespace-normal')}" data-act="bill-open" data-id="${E(b.key)}" aria-label="Open ${E(kindWord(b))} ${E(b.no)}">${E(kindWord(b))} ${E(b.no)}</button>`;
  const svcIcon = { PKG: 'luggage', FLT: 'plane', HTL: 'hotel', VIS: 'stamp', PPT: 'file-text', TRF: 'car', ACT: 'ticket' };
  const forCell = (b) => `<span class="inline-flex items-start gap-2 bl-wrap">${ic(svcIcon[b.svc] || 'file-text', 'mt-0.5 size-4 shrink-0 text-quiet')}<span>${E(b.forText)}</span></span>`;
  function statusCell(b) {
    if (TN.is('sales')) return ui.status('Released', { second: b.kind === 'credit_note' ? `Credits ${E(B.of(b.credits).no)}` : '' });
    if (b.kind === 'credit_note') return ui.status('Released', { second: `Credits ${E(B.of(b.credits).no)}` });
    if (B.eventOf(b)) return ui.status('Credit note due', { second: 'Service removed' });
    const r = result(b);
    return ui.status('Released', { second: `${r.word}${liveOfficial(b).length && r.key !== 'grouped' ? ' · ' + E(liveOfficial(b)[0].no) : ''}` });
  }
  function nextCell(b) {
    const a = attention(b);
    if (!a) return '<span class="text-sm text-quiet">Nothing to do</span>';
    const who = `<span class="text-sm text-copy">Accounts: ${E(a.text)}</span>`;
    if (!isAcc() || !a.button) return who;
    return `<span class="flex flex-col items-start gap-1.5">${who}${btn(a.button, { size: 'sm', act: 'bill-open', data: { id: b.key, focus: a.jump || a.act } })}</span>`;
  }
  const costFacts = (b) => {
    if (b.kind === 'credit_note') return [];
    if (b.cost.state === 'not_shown') return [{ label: 'Total', value: money(b.total) }, { label: 'Cost and difference', value: '<span class="text-quiet">Not shown on a package bill: the package bill shows the total only.</span>' }];
    if (b.cost.state === 'not_known') return [{ label: 'Customer total', value: money(b.total) }, { label: 'Cost', value: '<span class="italic text-quiet">Cost not recorded yet</span>' }, { label: 'Difference (our fee, including its GST)', value: '<span class="text-quiet">Shown when the desk records the cost</span>' }];
    return [{ label: 'Customer total', value: money(b.total) }, { label: 'Cost', value: `${money(b.cost.now)}<span class="block text-sm text-quiet">${E(b.cost.from)}</span>` }, { label: 'Difference (our fee, including its GST)', value: money(diffOf(b)) }];
  };
  function linesHtml(b) {
    const L = b.lines || [];
    if (b.svc === 'PKG') return `<ul class="bl-lines">${L.map((l) => `<li class="flex flex-wrap justify-between gap-2"><span class="font-semibold text-ink">${E(l.what)}</span>${money(l.amount)}</li>`).join('')}${(b.hotels || []).map((h) => `<li class="text-sm text-quiet">${ic('hotel', 'mr-1 inline size-3.5 text-faint')}${E(h)}</li>`).join('')}</ul><p class="m-0 mt-2 text-sm text-quiet">Hotels are listed without prices.</p>`;
    if (b.svc === 'FLT') return `<ul class="bl-lines">${L.map((l) => `<li><span class="block font-semibold text-ink">${E(l.passenger)}</span><span class="block text-sm text-quiet">${E(l.route)}${l.flight ? ' · ' + E(l.flight) : ''} · ${E(F.date(l.date))} · PNR ${l.pnr ? E(l.pnr) : 'printed once the Flight desk records it'}</span></li>`).join('')}</ul>`;
    if (b.svc === 'HTL') return `<ul class="bl-lines">${L.map((l) => `<li><span class="block font-semibold text-ink">${E(l.hotel)}, ${E(l.city)}</span><span class="block text-sm text-quiet">${E(l.dates)} · ${F.plural(l.nights, 'night')} · ${E(l.rooms)} · ${E(l.room)} · ${E(l.meal)}</span></li>`).join('')}</ul>`;
    if (b.svc === 'VIS') return `<ul class="bl-lines">${L.map((l) => `<li><span class="block font-semibold text-ink">${E(l.applicant)}</span><span class="block text-sm text-quiet">${E(l.country)} · ${E(l.vtype)}</span></li>`).join('')}</ul><p class="m-0 mt-2 text-sm text-quiet">Passport numbers are not printed on bills.</p>`;
    if (b.svc === 'PPT') return `<ul class="bl-lines">${L.map((l) => `<li><span class="block font-semibold text-ink">${E(l.applicant)}</span><span class="block text-sm text-quiet">${E(l.atype)}</span></li>`).join('')}</ul>`;
    return '';
  }
  const dealSummaryRows = (d) => {
    const inv = B.invoices(d.id), cns = D.groupBills.filter((b) => b.deal === d.id && b.kind === 'credit_note');
    const got = B.received(d.id), billed = B.billed(d.id);
    return [
      ...inv.map((b) => ({ label: `${E(b.no)} <span class="block text-sm font-normal text-quiet">${E(b.forText)}</span>`, value: money(b.total), numeric: true })),
      ...cns.map((b) => ({ label: `${E(b.no)} <span class="block text-sm font-normal text-quiet">Credit Note against ${E(B.of(b.credits).no)}</span>`, value: `<span class="bl-num">−${inr(b.total)}</span>`, numeric: true })),
      { label: 'Billed total', value: money(billed), numeric: true, total: true },
      { label: 'Verified money received on this Deal', value: money(got), numeric: true },
      { label: 'Balance', value: money(Math.max(0, billed - got)), numeric: true, total: true },
    ];
  };
  function dealSummaryCard(d) {
    const plan = D.instalments.filter((x) => x.deal === d.id);
    const planHtml = plan.length ? `<ul class="bl-lines mt-1">${plan.map((x) => `<li class="flex flex-wrap justify-between gap-2"><span>${E(x.label)} · due ${E(F.date(x.due))}</span><span class="text-sm">${money(x.amount)} · ${x.paid >= x.amount ? 'paid' : x.paid ? 'part paid' : 'not paid yet'}</span></li>`).join('')}</ul>` : '<p class="m-0 text-quiet">No payment plan.</p>';
    return ui.card({ title: 'Deal bill summary', description: 'Paid and balance are shown once, for the whole Deal. A bill shows only its own amount.', body: `${ui.summaryList(dealSummaryRows(d))}<h3 class="m-0 mt-4 text-base font-semibold text-ink">Payment plan</h3>${planHtml}`, bodyCls: 'px-4.5 py-4' });
  }

  /* ==================================================================
     5. Bills list (plan 3.2)
     ================================================================== */
  const CHIPS = [['all', 'All bills'], ['attention', 'Needs attention'], ['unpaired', 'Not paired yet'], ['nocost', 'Cost not recorded']];
  const chipTest = { all: () => true, attention: (b) => !!attention(b), unpaired: (b) => b.kind === 'invoice' && !liveOfficial(b).length && !b.noOfficial, nocost: (b) => b.cost && b.cost.state === 'not_known' };
  const matchQ = (b, d, q) => { if (!q) return true; const c = TN.customer(d.customer) || {}; return [b.no, b.forText, d.id, d.id.replace('BX-', ''), d.title, c.name, ...liveOfficial(b).map((o) => o.no)].join(' ').toLowerCase().includes(q.toLowerCase().trim()); };
  function billsPage(p, q) {
    const show = chipTest[q.show] ? q.show : 'all';
    const groups = B.deals().map((d) => ({ d, bills: B.ofDeal(d.id).filter((b) => chipTest[show](b) && matchQ(b, d, q.q || '')) })).filter((g) => g.bills.length || (show === 'all' && !q.q && g.d.billPlan && g.d.accountsReview !== 'approved'));
    const all = D.groupBills;
    const chips = CHIPS.map(([k, l]) => ({ href: `${BILLS}?show=${k}${q.q ? '&q=' + encodeURIComponent(q.q) : ''}`, label: l, count: all.filter(chipTest[k]).length, current: k === show }));
    const head = ui.pageHeader({ title: 'Bills', description: 'One row per bill, grouped by Deal. The customer’s GST invoice still comes from the billing tools.' });
    const ro = TN.is('manager') ? `<div class="mb-4">${ui.state({ kind: 'readOnly', text: 'You can view this. Accounts can change it.' })}</div>` : '';
    const toolbar = ui.queueToolbar({ id: 'bills-toolbar', search: { name: 'q', value: q.q || '', placeholder: 'Bill number, official number, Deal or customer', label: 'Find a bill' }, chips });
    const list = groups.length ? groups.map(({ d, bills }) => dealGroup(d, bills, Boolean(q.q) || (q.show && q.show !== 'all') || bills.some((b) => b.key === q.doc))).join('') : ui.state({ kind: 'empty', title: q.q ? 'No bill matches' : 'Nothing needs you', text: q.q ? `Nothing matches “${E(q.q)}”.` : 'No bill waits for Accounts in this view.', action: btn(q.q ? 'Clear search' : 'Show all bills', { href: `${BILLS}?show=all`, size: 'sm' }) });
    return ui.page(`${head}${ui.sectionTabs ? ui.sectionTabs('bills', BILLS) : ''}${ro}${toolbar}<div class="flex flex-col gap-4" id="bills-list" aria-live="polite">${list}</div>`);
  }
  function dealGroup(d, bills, openNow = false) {
    // Owner 24 Nov 2026: groups start closed; opened only for a search, a filter or an opened bill.
    const c = TN.customer(d.customer) || {};
    const billed = B.billed(d.id), got = B.received(d.id);
    const rows = bills.map((b) => ({ attrs: { id: 'row-' + b.key }, cells: [forCell(b), linkBtn(b), day(b.date), { html: money(b.kind === 'credit_note' ? -b.total : b.total), numeric: true }, statusCell(b), nextCell(b)] }));
    const notDue = !bills.length && d.billPlan ? `<p class="m-0 px-4.5 py-3 text-copy">${ui.status('No bill yet', { second: 'The bill is made when Accounts approves the booking.' })}</p><ul class="bl-lines px-4.5 pb-3">${d.billPlan.groups.map((g) => `<li class="flex flex-wrap justify-between gap-2"><span>${E(g.label)}</span>${money(g.price)}</li>`).join('')}</ul>` : '';
    const table = rows.length ? ui.table({ label: `Bills of ${d.id}`, top: true, inCard: false, columns: [{ label: 'For', cellCls: 'min-w-44' }, { label: 'Bill', cellCls: 'min-w-36' }, 'Dated', { label: 'Amount', numeric: true }, { label: 'Status', cellCls: 'min-w-40' }, { label: 'Next step', cellCls: 'min-w-44' }], rows }) : notDue;
    const facts = `<div class="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line px-4.5 py-3 text-sm text-quiet"><span>${E(c.name || '')}</span><span>${E(F.date(d.start))} to ${E(F.date(d.end))}</span><span>Sales owner ${E(pname(d.owner))}</span>${bills.length || !d.billPlan ? `<span>Billed ${inr(billed)} · paid ${inr(got)} (verified) · balance ${inr(Math.max(0, billed - got))}</span>` : ''}<a class="${ui.buttonClass('link', 'sm', 'h-auto min-h-0 p-0')}" href="#/app/deals/${E(d.id)}/bills">Open Deal bills</a></div>`;
    return ui.fold({ id: 'deal-' + d.id, open: openNow, summary: `<span class="font-semibold">${E(d.id)}</span> · ${E(d.title)}`, meta: bills.length ? `${F.plural(B.invoices(d.id).length, 'bill')} · ${inr(billed)}` : 'No bill yet', body: `${facts}<div class="border-t border-line">${table}</div>`, bodyCls: 'p-0' });
  }

  /* ---------- Side panel (?doc=<key>) ---------- */
  function officialBlock(b) {
    if (b.kind !== 'invoice' || b.status !== 'released') return '';
    const offs = liveOfficial(b);
    const line = (o) => { const r = o.total == null ? 'total not typed' : o.total === b.total ? 'total matches' : `differs by ${inr(Math.abs(o.total - b.total))}`; return `<li class="flex flex-wrap items-start justify-between gap-2"><span class="min-w-0 bl-wrap"><span class="block font-semibold text-ink">Official invoice ${E(o.no)} · ${E(F.date(o.date))} · ${r}</span>${o.reason ? `<span class="block text-sm text-quiet">Reason: ${E(o.reason)}</span>` : ''}<span class="block text-sm text-quiet">Linked by ${E(pname(o.by))}, ${E(F.dateTime(o.at))}</span></span>${isAcc() ? btn('Withdraw link', { size: 'sm', variant: 'ghost', act: 'bill-off-withdraw', data: { id: b.key, no: o.no } }) : ''}</li>`; };
    const linked = offs.length ? `<ul class="bl-lines">${offs.map(line).join('')}</ul>` : b.noOfficial ? `<p class="m-0 text-copy">${ui.status('No official invoice', { second: E(b.noOfficial.reason) })}</p>` : '<p class="m-0 text-quiet">No official invoice linked yet.</p>';
    const form = isAcc() && !b.noOfficial ? `<form novalidate id="bill-off-form" class="mt-4 flex flex-col gap-3" data-act="bill-off-save" data-id="${E(b.key)}">
        <div id="bill-off-err"></div>
        ${ui.field({ id: 'bill-off-no', label: 'Official invoice number', hint: 'The number printed on the invoice given to the customer, for example DTI/2627/06.', input: { name: 'no', autoComplete: 'off' } })}
        <div class="grid gap-3 sm:grid-cols-2">${ui.field({ id: 'bill-off-date', label: 'Invoice date', input: { name: 'date', type: 'date' } })}${ui.field({ id: 'bill-off-total', label: 'Total on that invoice ₹', optional: true, hint: 'Used only to compare with this bill.', money: { name: 'total' } })}</div>
        <div class="flex flex-wrap gap-2">${btn('Save invoice number', { type: 'submit', variant: 'secondary' })}${!offs.length ? btn('No official invoice for this bill', { variant: 'ghost', act: 'bill-off-none', data: { id: b.key } }) : ''}</div>
      </form>` : '';
    const ro = !isAcc() ? '<p class="m-0 mt-3 text-sm text-quiet">Accounts types the official number.</p>' : '';
    return ui.card({ title: 'Official invoice', titleId: 'bill-off-heading', body: linked + form + ro, bodyCls: 'px-4.5 py-4' });
  }
  function creditBlock(b) {
    if (b.kind !== 'invoice') return '';
    const cns = B.creditsOf(b), ev = B.eventOf(b);
    const list = cns.length ? `<ul class="bl-lines">${cns.map((c) => `<li class="flex flex-wrap items-center justify-between gap-2"><span>${linkBtn(c)}<span class="block text-sm text-quiet">${E(F.date(c.date))} · credited ${inr(c.total)}</span></span>${btn('View Credit Note', { size: 'sm', act: 'bill-doc', data: { id: c.key } })}</li>`).join('')}</ul>` : '';
    let act = '';
    if (isAcc() && ev) act = `<p class="m-0 text-copy">${E(ev.text)} Charge kept: ${inr(ev.charge)}.</p><div class="mt-2">${btn('Make credit note', { variant: 'secondary', act: 'bill-cn-open', data: { id: b.key }, id: 'bill-cn-btn' })}</div>`;
    else if (isAcc() && !cns.length) {
      const why = b.svc === 'PKG' ? 'A change inside the package makes a replacement package bill, not a credit note. A whole-Deal cancellation gives each bill its own credit note.' : 'A credit note needs a removal of this service or a Deal cancellation approved by the branch Manager.';
      act = `<div class="flex flex-col items-start gap-1.5">${btn('Make credit note', { variant: 'secondary', disabled: true, attrs: { 'aria-describedby': 'bill-cn-why' } })}<p class="m-0 flex items-start gap-1.5 text-sm text-quiet" id="bill-cn-why">${ic('lock', 'mt-0.5 size-3.5 shrink-0 text-quiet')}${E(why)}</p></div>`;
    } else if (!cns.length) act = '<p class="m-0 text-quiet">No credit note against this bill.</p>';
    return ui.card({ title: 'Credit notes', body: list + act, bodyCls: 'px-4.5 py-4 flex flex-col gap-3' });
  }
  function panelBody(b) {
    const d = TN.deal(b.deal), c = TN.customer(d.customer) || {};
    const a = attention(b);
    const next = a ? `<p class="m-0 text-copy"><span class="font-semibold text-ink">Next:</span> ${isAcc() ? '' : 'Accounts: '}${E(a.text)}</p>${isAcc() && a.button ? `<div class="mt-2">${a.act ? btn(a.button, { variant: 'primary', act: a.act, data: { id: b.key } }) : btn(a.button, { variant: 'primary', act: 'tn-jump', data: { target: a.jump } })}</div>` : ''}` : '<p class="m-0 text-copy"><span class="font-semibold text-ink">Next:</span> nothing to do.</p>';
    const flags = [];
    if (b.flightDeskTotal) flags.push(ui.notice('<p>Flight-only Deal: the bill total is the Flight desk’s ticket total, typed when the tickets were confirmed.</p>', { tone: 'info', icon: 'plane' }));
    if (b.cost.state === 'known' && b.cost.atRelease != null && b.cost.now !== b.cost.atRelease) flags.push(ui.notice(`<p>Cost changed since this bill was made: ${inr(b.cost.atRelease)} when it was made, ${inr(b.cost.now)} now. The bill total does not change.</p>`, { tone: 'warning' }));
    if (b.cost.state === 'not_known') flags.push(ui.notice('<p>Cost not recorded yet. The bill was released with its total; cost and difference show here when the desk records the cost. The PDF says “Cost: not recorded when this bill was made”.</p>', { tone: 'info' }));
    const facts = ui.summaryList([
      { label: 'Deal', value: `<a class="${ui.buttonClass('link', 'sm', 'h-auto min-h-0 p-0')}" href="#/app/deals/${E(d.id)}/bills">${E(d.id)} · ${E(d.title)}</a>` },
      { label: 'For', value: E(b.kind === 'credit_note' ? 'Credit Note against ' + B.of(b.credits).no : b.forText) },
      { label: 'Bill To', value: E(c.name || '') },
      { label: 'Dated', value: day(b.date) },
      { label: 'Made by', value: b.madeBy === 'crm' ? 'The CRM, when Accounts approved the booking' : E(pname(b.madeBy)) },
      { label: 'Released by', value: E(b.releasedBy === 'crm' ? 'The CRM (automatic release)' : pname(b.releasedBy)) },
      ...costFacts(b),
    ]);
    const others = B.ofDeal(d.id).filter((x) => x !== b);
    const linked = ui.card({ title: 'Other bills of this Deal', body: others.length ? `<ul class="bl-lines">${others.map((x) => `<li class="flex flex-wrap justify-between gap-2"><span>${linkBtn(x)}<span class="block text-sm text-quiet">${E(x.kind === 'credit_note' ? 'Credits ' + B.of(x.credits).no : x.forText)}</span></span>${money(x.total)}</li>`).join('')}</ul>` : '<p class="m-0 text-quiet">This is the only bill of this Deal.</p>', bodyCls: 'px-4.5 py-4' });
    const hist = ui.fold({ summary: 'History', body: `<ul class="bl-lines px-4.5 pb-3">${[...b.history].reverse().map((h) => `<li><span class="block text-copy">${E(h.what)}</span><span class="block text-sm text-quiet">${E(pname(h.who))} · ${E(F.dateTime(h.at))}</span></li>`).join('')}</ul>` });
    return `<div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">${b.kind === 'credit_note' ? ui.status('Released', { second: 'Credits ' + E(B.of(b.credits).no) }) : statusCell(b)}${next}</div>
      ${flags.join('')}
      ${ui.card({ title: b.kind === 'credit_note' ? 'Credit Note' : 'Bill', body: facts, bodyCls: 'px-4.5 py-2' })}
      ${ui.card({ title: b.kind === 'credit_note' ? 'Cancelled service lines' : 'Lines', body: linesHtml(b.kind === 'credit_note' ? Object.assign({}, B.of(b.credits), { lines: b.lines }) : b), bodyCls: 'px-4.5 py-4' })}
      ${officialBlock(b)}${creditBlock(b)}${linked}${hist}</div>`;
  }
  function openPanel(key, focusSel) {
    const b = B.of(key);
    const d = b && TN.deal(b.deal);
    if (!b || !d || !canSeeBill(b)) { TN.dialog({ title: 'This document is not available.', body: '<p class="m-0">Check the bill number, or open it from the Bills list.</p>', footer: btn('Close', { attrs: { 'data-close': '' } }) }); return; }
    TN.drawer({ wide: true, title: `${E(kindWord(b))} · ${E(b.no)}`, description: `${E(d.id)} · ${E(d.title)}`, body: panelBody(b),
      footer: `<div class="flex flex-wrap gap-2">${btn('Print view', { variant: 'secondary', icon: 'printer', act: 'bill-doc', data: { id: b.key } })}${btn('Close', { attrs: { 'data-close': '' } })}</div>` });
    if (focusSel) setTimeout(() => { if (focusSel === 'bill-cn-open') { const x = document.getElementById('bill-cn-btn'); if (x) x.focus(); } else TN.jumpTo(focusSel); }, 0);
  }
  const canSeeBill = (b) => { const d = TN.deal(b.deal); if (isAcc() || TN.is('manager')) return true; return TN.is('sales') && d.owner === TN.me().key && b.status === 'released'; };
  const setDoc = (key) => { const [path, qs = ''] = location.hash.replace(/^#/, '').split('?'); const sp = new URLSearchParams(qs); if (key) sp.set('doc', key); else sp.delete('doc'); const s = sp.toString(); history.replaceState(null, '', '#' + path + (s ? '?' + s : '')); };
  TN.act('bill-open', (el) => { setDoc(el.dataset.id); openPanel(el.dataset.id, el.dataset.focus); });
  const closeBase = TN.closeOverlay;
  TN.closeOverlay = () => { const open = !!document.querySelector('#tn-overlay > *'); closeBase(); if (open && /[?&]doc=/.test(location.hash) && !TN._billKeepDoc) setDoc(null); };

  /* ---------- Official invoice number (plan 3.3) ---------- */
  const fyOf = (iso) => { const [y, m] = iso.split('-').map(Number); return m >= 4 ? y : y - 1; };
  function offErr(items) { const box = document.getElementById('bill-off-err'); if (box) { box.innerHTML = ui.errorSummary({ title: 'The official number was not saved.', text: 'Your typed values are still in the form.', items }); const h = box.querySelector('[tabindex], h2, h3, [role="alert"]'); if (h && h.focus) h.focus(); } }
  TN.act('bill-off-save', (f) => {
    const b = B.of(f.dataset.id), fd = new FormData(f);
    const no = String(fd.get('no') || '').trim().toUpperCase(), date = String(fd.get('date') || ''), rawT = String(fd.get('total') || '').trim().replace(/,/g, '');
    const items = [];
    if (!no) items.push({ href: '#bill-off-no', text: 'Type the official invoice number.' });
    if (!date) items.push({ href: '#bill-off-date', text: 'Choose the invoice date.' });
    if (rawT && !/^\d+(\.\d{1,2})?$/.test(rawT)) items.push({ href: '#bill-off-total', text: 'Use rupees, 0 or more, with up to 2 decimals.' });
    if (!items.length) {
      const clash = D.groupBills.find((x) => x.deal !== b.deal && liveOfficial(x).some((o) => o.no === no && fyOf(o.date) === fyOf(date)));
      if (clash) items.push({ href: '#bill-off-no', text: `${no} is already linked to a bill of another Deal (${clash.deal}). An official number belongs to one Deal.` });
      if (liveOfficial(b).some((o) => o.no === no)) items.push({ href: '#bill-off-no', text: `${no} is already linked to this bill.` });
    }
    if (items.length) { offErr(items); return; }
    const total = rawT ? Number(rawT) : null;
    const save = (reason) => {
      b.official.push({ no, date, total, by: TN.me().key, at: nowStamp(), reason: reason || '', withdrawn: null });
      const r = total == null ? 'total not typed' : total === b.total ? 'total matches' : `differs by ${inr(Math.abs(total - b.total))}`;
      b.history.push(H(nowStamp(), TN.me().key, `Official invoice ${no} linked · ${r}`));
      TN.toast(`Official invoice ${no} · ${F.date(date)} · ${r}`);
      setDoc(b.key); TN.refresh();
    };
    if (total != null && total !== b.total) {
      TN._billKeepDoc = true;
      TN.confirmChange({ title: `The totals differ by ${inr(Math.abs(total - b.total))}`, effect: `${b.no} is ${inr(b.total)}; official invoice ${E(no)} is ${inr(total)}. The link is saved with your reason and counted as “Total differs” in the Pilot check.`, affected: 'Accounts and the branch Manager see the reason.', confirmLabel: 'Save official number', reason: 'required', reasonLabel: 'Why the totals differ', onConfirm: (reason) => { TN._billKeepDoc = false; save(reason); } });
      TN._billKeepDoc = false;
      return;
    }
    save('');
  });
  TN.act('bill-off-none', (el) => {
    const b = B.of(el.dataset.id);
    TN._billKeepDoc = true;
    TN.confirmChange({ title: 'No official invoice for this bill?', effect: `${E(b.no)} is marked as having no official invoice. The Pilot check lists it with your reason.`, affected: 'Accounts and the branch Manager.', confirmLabel: 'Mark as no official invoice', reason: 'required', reasonLabel: 'Reason', onConfirm: (reason) => { b.noOfficial = { reason, by: TN.me().key, at: nowStamp() }; b.history.push(H(nowStamp(), TN.me().key, 'Marked as no official invoice: ' + reason)); TN.toast('Marked as no official invoice.'); setDoc(b.key); TN.refresh(); } });
    TN._billKeepDoc = false;
  });
  TN.act('bill-off-withdraw', (el) => {
    const b = B.of(el.dataset.id), no = el.dataset.no;
    TN._billKeepDoc = true;
    TN.confirmChange({ title: `Withdraw the link to ${E(no)}?`, effect: 'The link is kept in the history with your reason; it is never erased.', affected: 'The Pilot check counts this bill as not paired again.', confirmLabel: 'Withdraw link', tone: 'danger', reason: 'required', reasonLabel: 'Reason', onConfirm: (reason) => { liveOfficial(b).filter((o) => o.no === no).forEach((o) => { o.withdrawn = { reason, by: TN.me().key, at: nowStamp() }; }); b.history.push(H(nowStamp(), TN.me().key, `Link to official invoice ${no} withdrawn: ${reason}`)); TN.toast(`Link to ${no} withdrawn.`); setDoc(b.key); TN.refresh(); } });
    TN._billKeepDoc = false;
  });

  /* ---------- Credit note per bill (plan 1.5, Q8 a) ---------- */
  const nextNo = (b, kind) => { const n = D.groupBills.filter((x) => x.deal === b.deal && x.svc === b.svc && x.kind === kind).length + 1; return `${b.deal.replace('BX-', '')}-${b.svc}-${kind === 'credit_note' ? 'CN' : 'INV'}-${n}`; };
  TN.act('bill-cn-open', (el) => {
    const b = B.of(el.dataset.id), ev = B.eventOf(b);
    if (!ev) return;
    const no = nextNo(b, 'credit_note'), amt = b.total - ev.charge;
    TN.dialog({ title: `Make credit note ${E(no)}?`, description: `Against ${E(b.no)} · ${E(b.forText)}`,
      body: `<div class="flex flex-col gap-3"><p class="m-0 text-copy">${E(ev.text)}</p>${ui.summaryList([{ label: 'Bill total', value: money(b.total), numeric: true }, { label: 'Charge kept on this bill', value: money(ev.charge), numeric: true }, { label: 'Amount credited', value: money(amt), numeric: true, total: true }, { label: 'Cost credited back', value: `${money(ev.costCredited)}<span class="block text-sm text-quiet">${E(ev.costFrom)}</span>`, numeric: true }, { label: 'Difference (our fee, including its GST)', value: money(amt - ev.costCredited), numeric: true }])}<p class="m-0 text-sm text-quiet">The bill stays released and is not replaced. The Deal’s other bills are not touched. Any refund still goes through Refunds with its approvals.</p></div>`,
      footer: `${btn('Cancel', { attrs: { 'data-close': '' } })}${btn('Make credit note', { variant: 'primary', act: 'bill-cn-make', data: { id: b.key } })}` });
  });
  TN.act('bill-cn-make', (el) => {
    const b = B.of(el.dataset.id), ev = B.eventOf(b);
    if (!ev) return;
    const no = nextNo(b, 'credit_note'), key = 'cn-' + no.toLowerCase();
    const cancelled = (b.lines || []).map((l) => Object.assign({}, l));
    D.groupBills.push({ key, no, deal: b.deal, svc: b.svc, kind: 'credit_note', status: 'released', credits: b.key, total: b.total - ev.charge, billTotal: b.total, charge: ev.charge, costCredited: ev.costCredited, costFrom: ev.costFrom, event: ev.id, eventText: ev.text, date: TN.TODAY, madeBy: TN.me().key, releasedBy: TN.me().key, forText: b.forText, lines: cancelled, cost: { state: 'known', now: ev.costCredited }, official: [], history: [H(nowStamp(), TN.me().key, `Made and released against ${b.no}`)] });
    ev.done = { by: TN.me().key, at: nowStamp(), cn: key };
    b.history.push(H(nowStamp(), TN.me().key, `Credit note ${no} made for ${inr(b.total - ev.charge)}`));
    const d = TN.deal(b.deal);
    pushNotice(['sales', 'manager'], `Credit note ${no} made on ${d.id} for the removed flights: ${inr(b.total - ev.charge)}.`, d.id);
    TN.closeOverlay();
    TN.toast(`Credit note ${no} made.`);
    setDoc(key); TN.refresh();
    setTimeout(() => openDoc(key), 0);
  });

  /* ---------- cdoc-2 documents: Invoice and Credit Note (internal; title "Invoice" / "Credit Note", Q9 b) ---------- */
  const words = (n) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const t = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const two = (x) => (x < 20 ? a[x] : t[Math.floor(x / 10)] + (x % 10 ? ' ' + a[x % 10] : ''));
    const three = (x) => (x >= 100 ? a[Math.floor(x / 100)] + ' Hundred' + (x % 100 ? ' ' + two(x % 100) : '') : two(x));
    const lk = Math.floor(n / 1e5), th = Math.floor((n % 1e5) / 1e3), rest = n % 1e3;
    return 'Rupees ' + [lk ? two(lk) + ' Lakh' : '', th ? two(th) + ' Thousand' : '', rest ? three(rest) : ''].filter(Boolean).join(' ') + ' only';
  };
  function docLinesTable(b, lines, isCN) {
    const cap = isCN ? 'Cancelled service lines' : 'Lines';
    if (b.svc === 'FLT') return `<table class="doc-table doc-section"><caption class="doc-label">${cap}</caption><thead><tr><th scope="col">Passenger</th><th scope="col">Sector</th><th scope="col">Flight</th><th scope="col">Travel on</th><th scope="col">PNR</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${E(l.passenger)}</td><td>${E(l.route)}</td><td>${E(l.flight || '—')}</td><td>${E(F.date(l.date))}</td><td>${E(l.pnr || 'To follow')}</td></tr>`).join('')}</tbody></table>`;
    if (b.svc === 'VIS' || b.svc === 'PPT') return `<table class="doc-table doc-section"><caption class="doc-label">${cap}</caption><thead><tr><th scope="col">Applicant</th><th scope="col">${b.svc === 'VIS' ? 'Country and visa type' : 'Application'}</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${E(l.applicant)}</td><td>${E(b.svc === 'VIS' ? `${l.country} · ${l.vtype}` : l.atype)}</td></tr>`).join('')}</tbody></table>`;
    if (b.svc === 'HTL') return `<table class="doc-table doc-section"><caption class="doc-label">${cap}</caption><thead><tr><th scope="col">Hotel</th><th scope="col">Stay</th><th scope="col">Rooms and meals</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${E(l.hotel)}, ${E(l.city)}</td><td>${E(l.dates)} · ${F.plural(l.nights, 'night')}</td><td>${E(l.rooms)} · ${E(l.room)} · ${E(l.meal)}</td></tr>`).join('')}</tbody></table>`;
    return `<table class="doc-table doc-section"><caption class="doc-label">${cap}</caption><thead><tr><th scope="col">Service</th><th scope="col" class="num">Amount</th></tr></thead><tbody>${lines.map((l) => `<tr><td>${E(l.what)}</td><td class="num">${inr(l.amount)}</td></tr>`).join('')}${(b.hotels || []).map((h) => `<tr><td colspan="2"><span class="doc-small">${E(h)}</span></td></tr>`).join('')}</tbody></table>`;
  }
  function docHtml(key) {
    const x = B.of(key), isCN = x.kind === 'credit_note', inv = isCN ? B.of(x.credits) : x;
    const d = TN.deal(x.deal), c = TN.customer(d.customer) || {};
    const offs = liveOfficial(inv);
    const title = isCN ? 'Credit Note' : 'Invoice';
    const head = `<header class="doc-head"><div><p class="doc-brand">Trip<b>Navigate</b></p><p class="bl-doc-co">${E(COMPANY.legal)}<br>${E(COMPANY.office)}<br>PAN ${E(COMPANY.pan)} · GSTIN ${E(COMPANY.gstin)}</p></div><div class="doc-meta"><p><strong>${title}</strong> ${E(x.no)}</p><p>Date ${E(F.date(x.date))}</p><p>Deal ${E(d.id)}</p></div></header><div class="doc-bar" aria-hidden="true"></div>`;
    const refs = isCN
      ? `<dl class="bl-doc-ref doc-section"><dt>Invoice reference</dt><dd>${E(inv.no)} · ${E(F.date(inv.date))}</dd><dt>Official invoice</dt><dd>${offs.length ? offs.map((o) => `${E(o.no)} · ${E(F.date(o.date))}`).join('; ') : 'Not linked'}</dd><dt>Reason</dt><dd>${E(x.eventText || '')}</dd></dl>`
      : `<dl class="bl-doc-ref doc-section"><dt>For</dt><dd>${E(x.forText)}</dd>${offs.length ? `<dt>Official invoice</dt><dd>${offs.map((o) => `${E(o.no)} · ${E(F.date(o.date))}`).join('; ')}</dd>` : ''}</dl>`;
    const billTo = `<section class="doc-section doc-cols" aria-label="Bill To"><div><h4 class="doc-label">Bill To</h4><p class="doc-strong">${E(c.name || '')}</p><p class="doc-small">${E(c.city || '')}, Rajasthan</p></div><div><h4 class="doc-label">Trip</h4><p class="doc-strong">${E(d.destination)}</p><p class="doc-small">${E(F.date(d.start))} to ${E(F.date(d.end))}</p></div></section>`;
    let moneyT;
    if (isCN) {
      moneyT = `<table class="doc-table doc-section"><tbody><tr><th scope="row">Bill total (${E(inv.no)})</th><td class="num">${inr(x.billTotal)}</td></tr><tr><th scope="row">Charge kept</th><td class="num">${inr(x.charge)}</td></tr><tr><th scope="row">Amount credited</th><td class="num doc-strong">${inr(x.total)}</td></tr></tbody></table><p class="doc-small doc-section">${E(words(x.total))}.</p>
        <table class="doc-table doc-section"><caption class="doc-label">Cost and difference</caption><tbody><tr><th scope="row">Cost credited back</th><td class="num">${inr(x.costCredited)}</td></tr><tr><th scope="row">Difference (our fee, including its GST)</th><td class="num">${inr(x.total - x.costCredited)}</td></tr></tbody></table>`;
    } else {
      const cost = x.cost.state === 'known' ? `<table class="doc-table doc-section"><caption class="doc-label">Cost and difference</caption><tbody><tr><th scope="row">Cost</th><td class="num">${inr(x.cost.atRelease)}</td></tr><tr><th scope="row">Difference (our fee, including its GST)</th><td class="num">${inr(x.total - x.cost.atRelease)}</td></tr></tbody></table>` : x.cost.state === 'not_known' ? '<p class="doc-small doc-section">Cost: not recorded when this bill was made.</p>' : '';
      moneyT = `<table class="doc-table doc-section"><tbody><tr><th scope="row">Total</th><td class="num doc-strong">${inr(x.total)}</td></tr></tbody></table><p class="doc-small doc-section">${E(words(x.total))}.</p>${cost}`;
    }
    return `<article class="tn-doc" id="bill-document" aria-label="${title} ${E(x.no)}">${head}<h2 class="doc-title">${title}</h2>${refs}${billTo}${docLinesTable(inv, x.lines, isCN)}${moneyT}<footer class="doc-foot"><p class="doc-legal">${E(COMPANY.legal)} · GSTIN ${E(COMPANY.gstin)} (${E(COMPANY.state)})</p><span>Made by ${E(x.madeBy === 'crm' ? 'the CRM' : pname(x.madeBy))}</span><span>${title} ${E(x.no)}</span></footer></article>`;
  }
  function openDoc(key) {
    const x = B.of(key);
    if (!x || !canSeeBill(x)) { TN.toast('You do not have access to this document.', 'danger'); return; }
    TN._billKeepDoc = true;
    TN.dialog({ title: `${E(kindWord(x))} ${E(x.no)}`, body: `<p class="m-0 mb-3 text-base text-quiet outline-none" tabindex="-1" data-bill-doc-top>Internal document for Accounts, the branch Manager and the Sales owner. It is not given to the customer.</p><div class="money-doc-frame">${docHtml(key)}</div>`,
      footer: `${btn('Back to the bill', { variant: 'secondary', act: 'bill-open', data: { id: key } })}${btn('Print', { variant: 'secondary', icon: 'printer', act: 'bill-print', data: { id: key } })}${btn('Download PDF', { variant: 'primary', icon: 'download', act: 'bill-pdf', data: { id: key } })}` });
    TN._billKeepDoc = false;
    const dlg = document.querySelector('#tn-overlay [role="dialog"]');
    if (dlg) { dlg.classList.add('money-doc-dialog'); const t = dlg.querySelector('[data-bill-doc-top]'); if (t) t.focus(); }
  }
  TN.openBillDoc = openDoc;
  TN.act('bill-doc', (el) => { setDoc(el.dataset.id); openDoc(el.dataset.id); });
  TN.act('bill-print', (el) => {
    const root = document.createElement('div'); root.className = 'tn-print-root money-print-root'; root.innerHTML = docHtml(el.dataset.id);
    document.body.appendChild(root); document.body.classList.add('money-printing');
    const done = () => { root.remove(); document.body.classList.remove('money-printing'); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(() => { try { window.print(); } catch (e) { /* print blocked */ } setTimeout(done, 1000); }, 50);
  });
  TN.act('bill-pdf', (el) => { const x = B.of(el.dataset.id); x.history.push(H(nowStamp(), TN.me().key, 'PDF downloaded')); TN.toast(`${x.no}.pdf downloaded. The download is recorded.`); });

  /* ==================================================================
     6. Pilot check (plan 3.4)
     ================================================================== */
  const MONTHS = [['2026-10', 'October 2026'], ['2026-11', 'November 2026']];
  const RESULT_ORDER = [['matched', 'Matched', 'circle-check'], ['differs', 'Total differs', 'triangle-alert'], ['unpaired', 'Not paired yet', 'hourglass'], ['grouped', 'Grouped differently', 'info'], ['none', 'No official invoice', 'circle-minus'], ['nototal', 'Total not typed', 'circle-help']];
  const pilotRows = (month) => D.groupBills.filter((b) => b.kind === 'invoice' && b.status === 'released' && b.date.startsWith(month) && (TN.deal(b.deal) || {}).id);
  function pilotPage(p, q) {
    const month = MONTHS.some(([m]) => m === q.month) ? q.month : '2026-10';
    const rows = pilotRows(month), res = rows.map((b) => [b, result(b)]);
    const count = (k) => res.filter(([, r]) => r.key === k).length;
    const paired = res.filter(([, r]) => r.key !== 'unpaired').length;
    const pct = rows.length ? Math.round((paired / rows.length) * 100) : null;
    const head = ui.pageHeader({ title: 'Pilot check', description: `${E(TN.BILLING.pilotBranch)} branch · every released CRM bill of the month beside the official invoice it pairs with.`, actions: btn('Download CSV', { icon: 'download', act: 'bill-pilot-csv', data: { id: month } }) });
    const monthSel = `<form class="mb-4 flex flex-wrap items-end gap-3" data-act="bill-pilot-month">${ui.field({ id: 'pilot-month', label: 'Month', select: { name: 'month', value: month, options: MONTHS.map(([value, label]) => ({ value, label })), change: 'bill-pilot-month' } })}</form>`;
    const stats = `<div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">${ui.statCard({ label: 'Paired or marked', value: pct == null ? '—' : `${pct}%`, note: `${paired} of ${F.plural(rows.length, 'released bill')}`, icon: 'circle-check' })}${RESULT_ORDER.filter(([k]) => k !== 'nototal' || count(k)).map(([k, l, i]) => ui.statCard({ label: l, value: String(count(k)), icon: i })).join('')}</div>`;
    const table = rows.length ? ui.table({ label: 'Released bills and their official invoices', top: true, columns: [{ label: 'CRM bill number', cellCls: 'min-w-36' }, { label: 'For', cellCls: 'min-w-44' }, { label: 'CRM total', numeric: true }, 'Official number(s)', { label: 'Official total', numeric: true }, 'Result'], rows: res.map(([b, r]) => {
      const offs = liveOfficial(b);
      return { cells: [linkBtn(b), `<span class="bl-wrap">${E(b.forText)}</span><span class="block text-sm text-quiet">${E(b.deal)}</span>`, { html: money(b.total), numeric: true }, offs.length ? offs.map((o) => `<span class="block">${E(o.no)}</span><span class="block text-sm text-quiet">${E(F.date(o.date))}</span>`).join('') : '<span class="text-quiet">—</span>', { html: offs.length && offs[0].total != null ? money(offs[0].total) : '<span class="text-quiet">—</span>', numeric: true }, ui.status(r.word, { second: r.second })] };
    }) }) : ui.state({ kind: 'empty', title: 'No released bill this month', text: 'Released bills of the pilot branch appear here.' });
    const without = D.officialWithoutBill.filter((o) => o.date.startsWith(month));
    const wTable = ui.table({ label: 'Official invoices without a CRM bill', top: true, inCard: false, columns: ['Official number', 'Date', { label: 'Total', numeric: true }, 'Reason'], rows: without.map((o) => ({ cells: [E(o.no), day(o.date), { html: money(o.total), numeric: true }, `${E(o.reason)}${o.note ? `<span class="block text-sm text-quiet">${E(o.note)}</span>` : ''}`] })), empty: 'None this month.' });
    const REASONS = ['Train, bus, insurance or miscellaneous', 'Deal not in the CRM', 'Booked before the pilot', 'Other'];
    const addForm = isAcc() ? `<form novalidate id="pilot-add" class="flex flex-col gap-3 border-t border-line px-4.5 py-4" data-act="bill-pilot-add" data-id="${month}"><h3 class="m-0 text-base font-semibold text-ink">Add an official invoice that has no CRM bill</h3><div id="pilot-add-err"></div>
        <div class="grid gap-3 sm:grid-cols-3">${ui.field({ id: 'pa-no', label: 'Official invoice number', input: { name: 'no', autoComplete: 'off' } })}${ui.field({ id: 'pa-date', label: 'Invoice date', input: { name: 'date', type: 'date' } })}${ui.field({ id: 'pa-total', label: 'Total on that invoice ₹', money: { name: 'total' } })}</div>
        <div class="grid gap-3 sm:grid-cols-2">${ui.field({ id: 'pa-reason', label: 'Reason', select: { name: 'reason', placeholder: 'Choose a reason', options: REASONS } })}${ui.field({ id: 'pa-note', label: 'Note', optional: true, input: { name: 'note' } })}</div>
        <div>${btn('Add to the list', { type: 'submit', variant: 'secondary' })}</div></form>` : '';
    const wCard = ui.card({ title: 'Official invoices without a CRM bill', description: 'Old-tool invoices of the pilot branch that no CRM bill covers.', body: `${wTable}${addForm}`, flush: true });
    const ro = TN.is('manager') ? `<div class="mb-4">${ui.state({ kind: 'readOnly', text: 'You can view this. Accounts can change it.' })}</div>` : '';
    return ui.page(`${head}${ui.sectionTabs ? ui.sectionTabs('bills', PILOT) : ''}${ro}${monthSel}${stats}<div class="flex flex-col gap-5">${table}${wCard}</div>`);
  }
  TN.act('bill-pilot-month', (el) => { const f = el.form || el; const m = new FormData(f).get('month') || el.value; TN.go(`${PILOT}?month=${m}`); });
  TN.act('bill-pilot-add', (f) => {
    const fd = new FormData(f), v = Object.fromEntries(fd.entries()), items = [];
    if (!String(v.no || '').trim()) items.push({ href: '#pa-no', text: 'Type the official invoice number.' });
    if (!v.date) items.push({ href: '#pa-date', text: 'Choose the invoice date.' });
    if (!/^\d+(\.\d{1,2})?$/.test(String(v.total || '').replace(/,/g, '').trim())) items.push({ href: '#pa-total', text: 'Use rupees, 0 or more, with up to 2 decimals.' });
    if (!v.reason) items.push({ href: '#pa-reason', text: 'Choose a reason.' });
    if (items.length) { const box = document.getElementById('pilot-add-err'); box.innerHTML = ui.errorSummary({ title: 'Nothing was added.', text: 'Your typed values are still in the form.', items }); return; }
    D.officialWithoutBill.push({ no: v.no.trim().toUpperCase(), date: v.date, total: Number(String(v.total).replace(/,/g, '')), reason: v.reason, note: v.note || '', by: TN.me().key, at: nowStamp() });
    TN.toast(`${v.no.trim().toUpperCase()} added to the list.`);
    TN.refresh();
  });
  TN.act('bill-pilot-csv', (el) => {
    const month = el.dataset.id;
    const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
    const lines = [['CRM bill number', 'Deal', 'For', 'CRM total', 'Official number(s)', 'Official total', 'Result', 'Reason or note'].map(q).join(',')];
    pilotRows(month).forEach((b) => { const r = result(b), offs = liveOfficial(b); lines.push([b.no, b.deal, b.forText, b.total, offs.map((o) => o.no).join('; '), offs.length ? offs[0].total : '', r.word, (offs[0] && offs[0].reason) || (b.noOfficial && b.noOfficial.reason) || ''].map(q).join(',')); });
    D.officialWithoutBill.filter((o) => o.date.startsWith(month)).forEach((o) => lines.push(['', '', '', '', o.no, o.total, 'Official invoice without a CRM bill', o.reason + (o.note ? ' · ' + o.note : '')].map(q).join(',')));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `pilot-check-${month}.csv`; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
    TN.toast(`pilot-check-${month}.csv downloaded.`);
  });

  /* ==================================================================
     7. Deal bills page and the Deal page links
     ================================================================== */
  const dealBillsAllowed = (d) => !!d && (isAcc() || TN.is('manager') || (TN.is('sales') && d.owner === TN.me().key));
  function dealBillsPage(p) {
    const d = TN.deal(p.id);
    if (!dealBillsAllowed(d)) return ui.notAllowed ? ui.notAllowed(false) : '<p>Page not available.</p>';
    const sales = TN.is('sales');
    const bills = B.ofDeal(d.id).filter((b) => !sales || b.status === 'released');
    const cancel = D.cancellations.find((c) => c.deal === d.id && c.billCharges);
    const rows = bills.map((b) => ({ cells: [forCell(b), linkBtn(b), day(b.date), { html: money(b.kind === 'credit_note' ? -b.total : b.total), numeric: true }, statusCell(b), sales ? btn('Download PDF', { size: 'sm', variant: 'secondary', icon: 'download', act: 'bill-pdf', data: { id: b.key } }) : nextCell(b)] }));
    const notYet = !bills.length ? (d.billPlan ? ui.card({ title: 'Bills', body: `<p class="m-0">${ui.status('No bill yet', { second: 'The bill is made when Accounts approves the booking.' })}</p><ul class="bl-lines mt-3">${d.billPlan.groups.map((g) => `<li class="flex flex-wrap justify-between gap-2"><span>${E(g.label)}</span>${money(g.price)}</li>`).join('')}</ul>`, bodyCls: 'px-4.5 py-4' }) : ui.state({ kind: 'empty', title: 'No bills yet', text: 'Bills appear here when Accounts approves the booking.' })) : '';
    const table = bills.length ? ui.table({ label: `Bills of ${d.id}`, top: true, columns: [{ label: 'For', cellCls: 'min-w-44' }, { label: 'Bill', cellCls: 'min-w-36' }, 'Dated', { label: 'Amount', numeric: true }, { label: 'Status', cellCls: 'min-w-40' }, sales ? 'Document' : { label: 'Next step', cellCls: 'min-w-44' }], rows }) : notYet;
    const cxl = cancel ? ui.card({ title: 'Cancellation: charge kept per bill', description: `${E(cancel.kind)}, asked on ${E(F.date(cancel.at))}. Each bill gets one credit note for the rest after the branch Manager approves.`, body: ui.summaryList(cancel.billCharges.map((x) => { const b = B.of(x.bill); return { label: `${E(b.no)}<span class="block text-sm font-normal text-quiet">Bill ${inr(b.total)} · credit note ${inr(b.total - x.charge)}</span>`, value: money(x.charge), numeric: true }; }).concat([{ label: 'Charge kept on this Deal', value: money(cancel.billCharges.reduce((s, x) => s + x.charge, 0)), numeric: true, total: true }])), bodyCls: 'px-4.5 py-2' }) : '';
    const back = isAcc() ? { href: `/app/accounts/deals/${d.id}`, label: 'Back to the Deal' } : { href: `/app/deals/${d.id}`, label: 'Back to the Deal' };
    const ab = bills.find((b) => attention(b)); const a = ab ? attention(ab) : null;
    const header = ui.recordHeader({ back, recordId: `${E(d.id)} · Bills`, title: E(d.title), owner: E(pname(d.owner)),
      next: isAcc() && a ? { text: E(a.text), button: { label: a.button || 'Open the bill', act: 'bill-open', data: { id: ab.key, focus: a.jump || a.act } } } : null,
      nextWho: sales ? 'Nothing waits on you.' : a && !isAcc() ? `Accounts: ${E(a.text)}` : 'Nothing waiting.',
      readOnly: TN.is('manager') ? 'You can view this. Accounts can change it.' : sales ? 'You see released bills only. Accounts makes and changes bills.' : '' });
    return ui.page(`${header}<div class="flex flex-col gap-5">${table}${cxl}${bills.length ? dealSummaryCard(d) : ''}</div>`);
  }

  /* Links on the existing Deal pages (Sales view and Accounts view), the cancellation drawer, and the Flight desk's own total. */
  const billLine = (d, href) => {
    const inv = B.invoices(d.id); const sales = TN.is('sales');
    const nums = B.ofDeal(d.id).filter((b) => !sales || b.status === 'released').map((b) => E(b.no)).join(' · ');
    return `<div class="mb-4" data-bill-line>${ui.notice(`<p class="m-0">Bills: ${nums || 'no bill yet'}${inv.length ? ` · billed ${inr(B.billed(d.id))}` : ''}. <a class="${ui.buttonClass('link', 'sm', 'h-auto min-h-0 p-0 align-baseline')}" href="#${href}">Open bills</a></p>`, { tone: 'info', icon: 'file-text' })}</div>`;
  };
  const afterBase = TN.afterRender;
  TN.afterRender = (root) => {
    if (afterBase) afterBase(root);
    const path = TN.path().split('?')[0];
    let m = path.match(/^\/app\/deals\/([^/]+)$/);
    if (m) {
      const d = TN.deal(decodeURIComponent(m[1]));
      if (d && (B.ofDeal(d.id).length || d.billPlan) && dealBillsAllowed(d) && TN.can('seeSellingPrice')) {
        const nav = root.querySelector('nav[aria-label="Deal sections"]');
        if (nav && !root.querySelector('[data-bill-line]')) nav.insertAdjacentHTML('afterend', billLine(d, `/app/deals/${d.id}/bills`));
      }
      if (d && B.invoices(d.id).length) root.querySelectorAll(`[data-act="sales-cancel-open"][data-id="${d.id}"]`).forEach((b) => { b.dataset.act = 'bill-cancel-open'; });
    }
    m = path.match(/^\/app\/accounts\/deals\/([^/]+)$/);
    if (m && isAcc()) {
      const d = TN.deal(decodeURIComponent(m[1]));
      const nav = root.querySelector('nav[aria-label="Accounts deal sections"]');
      if (d && nav && B.ofDeal(d.id).length && !root.querySelector('[data-bill-line]')) nav.insertAdjacentHTML('afterend', billLine(d, `/app/deals/${d.id}/bills`));
    }
    m = path.match(/^\/app\/flight\/([^/]+)$/);
    if (m && TN.is('flight')) {
      const s = TN.service(decodeURIComponent(m[1])); const d = s && TN.deal(s.deal);
      if (s && d && d.flightOnly && s.customerTotal != null && !root.querySelector('[data-flight-total]')) {
        const main = root.querySelector('#main > div') || root.querySelector('#main');
        const nav = main && main.querySelector('nav[data-slot="tabs"]');
        const html = `<div class="mb-4" data-flight-total>${ui.notice(`<p class="m-0"><strong>Customer total for this flight-only Deal: ${inr(s.customerTotal)}</strong></p><p class="m-0">You typed it when you confirmed the tickets (${E(F.dateTime(s.customerTotalAt))}). On a flight-only Deal it is the bill total. Accounts makes the bill.</p>`, { tone: 'info', icon: 'plane' })}</div>`;
        if (nav) nav.insertAdjacentHTML('afterend', html); else if (main) main.insertAdjacentHTML('afterbegin', html);
      }
    }
  };

  /* ---------- Deal cancellation: charge kept per bill (plan 1.5, R11) ---------- */
  const liveSvcs = (d) => TN.servicesOf(d.id).filter((s) => s.taskStatus !== 'cancelled');
  function cancelBillsForm(d, v = {}, errs = {}) {
    const svcs = liveSvcs(d), picked = v.services || svcs.map((s) => s.id);
    const whole = picked.length === svcs.length;
    const bills = B.invoices(d.id).filter((b) => !B.eventOf(b) && !B.creditsOf(b).length && (b.svc === 'PKG' ? whole : b.svcs.every((id) => picked.includes(id))));
    const charges = v.charges || {};
    const errList = Object.entries(errs).map(([k, t]) => ({ href: '#' + k, text: t }));
    const row = (b) => { const raw = charges[b.key] ?? ''; const ok = /^\d+(\.\d{1,2})?$/.test(String(raw).trim()); const cn = ok ? b.total - Number(raw) : null; const id = 'cxl-ch-' + b.key;
      return `<div class="bl-split"><div class="min-w-0"><span class="block font-semibold text-ink">${E(b.no)}</span><span class="block text-sm text-quiet bl-wrap">${E(b.forText)} · bill ${inr(b.total)}</span></div>${ui.field({ id, label: 'Charge kept ₹', error: errs[id], money: { name: 'ch:' + b.key, value: raw, attrs: { 'aria-label': `${b.no}, charge kept, rupees`, 'data-change': 'bill-cancel-recalc' } } })}<div class="text-sm"><span class="block text-quiet">Credit note</span><span class="bl-num font-semibold text-ink" data-cn-for="${E(b.key)}">${cn == null || cn < 0 ? '—' : inr(cn)}</span></div></div>`; };
    const sum = bills.reduce((s, b) => s + (Number(charges[b.key]) || 0), 0);
    const billsHtml = bills.length ? `<fieldset class="m-0 min-w-0 border-0 p-0" id="cxl-bills"><legend class="mb-1.5 block font-sans text-base font-semibold text-ink">Charge kept per bill</legend><p class="m-0 mb-2 text-sm text-quiet">What the customer is not refunded on each bill. The branch Manager approves the charges. Each bill then gets one credit note for the rest.</p>${bills.map(row).join('')}<p class="m-0 mt-2 flex flex-wrap justify-between gap-2 border-t border-line pt-2"><span class="font-semibold text-ink">Charge kept on this Deal</span><span class="bl-num font-semibold text-ink" id="cxl-sum">${inr(sum)}</span></p></fieldset>`
      : `<p class="m-0 text-sm text-quiet">No bill is fully cancelled by this choice. A removed separately billed service gets a credit note on its own bill; a change inside the package makes a replacement package bill.</p>`;
    const chips = `<fieldset class="m-0 min-w-0 border-0 p-0" id="cxl-services" tabindex="-1"><legend class="mb-1.5 block font-sans text-base font-semibold text-ink">Services to cancel</legend><div class="flex flex-wrap gap-2">${svcs.map((s) => ui.chipCheck({ id: 'bcx-' + s.id, name: 'services', value: s.id, label: E(s.title), checked: picked.includes(s.id), change: 'bill-cancel-recalc' })).join('')}</div>${errs['cxl-services'] ? `<p class="m-0 mt-1 text-sm font-medium text-status-danger">${E(errs['cxl-services'])}</p>` : ''}</fieldset>`;
    const body = `<form novalidate id="bill-cancel-form" class="flex flex-col gap-4" data-act="bill-cancel-submit" data-id="${E(d.id)}">${errList.length ? ui.errorSummary({ title: 'The cancellation was not sent.', text: 'Your typed values are still in the form.', items: errList }) : ''}${chips}${ui.field({ id: 'cxl-reason', label: 'Why the customer cancels', error: errs['cxl-reason'], textarea: { name: 'reason', value: v.reason || '' } })}${billsHtml}${ui.notice('<p>Purchase enters what each supplier keeps. The branch Manager approves the charges and the refund. Accounts pays the refund and a different Accounts person verifies it.</p>', { tone: 'info' })}</form>`;
    return { title: 'Cancel booking', description: `${E(d.id)} · ${E(d.title)}`, body, wide: true, footer: `<div class="flex flex-wrap gap-2">${btn('Send cancellation request', { variant: 'danger', type: 'submit', attrs: { form: 'bill-cancel-form' } })}${btn('Keep the booking', { attrs: { 'data-close': '' } })}</div>` };
  }
  const readCancel = (f) => { const fd = new FormData(f); const charges = {}; for (const [k, val] of fd.entries()) if (k.startsWith('ch:')) charges[k.slice(3)] = String(val).replace(/,/g, '').trim(); return { services: fd.getAll('services'), reason: String(fd.get('reason') || ''), charges }; };
  TN.act('bill-cancel-open', (el) => { const d = TN.deal(el.dataset.id); if (D.cancellations.some((c) => c.deal === d.id && c.status !== 'closed')) { TN.toast('A cancellation is already open on this deal.', 'warning'); return; } TN.drawer(cancelBillsForm(d)); });
  TN.act('bill-cancel-recalc', (el) => {
    const f = el.closest('form'); if (!f) return;
    const d = TN.deal(f.dataset.id), v = readCancel(f);
    if (el.name === 'services') { const keep = el.id; TN.drawer(cancelBillsForm(d, v)); const x = document.getElementById(keep); if (x) x.focus(); return; }
    Object.entries(v.charges).forEach(([k, raw]) => { const b = B.of(k), out = document.querySelector(`[data-cn-for="${k}"]`); const ok = /^\d+(\.\d{1,2})?$/.test(raw); if (out) out.textContent = ok && Number(raw) <= b.total ? inr(b.total - Number(raw)) : '—'; });
    const s = document.getElementById('cxl-sum'); if (s) s.textContent = inr(Object.values(v.charges).reduce((a, x) => a + (Number(x) || 0), 0));
  });
  document.addEventListener('input', (ev) => { const t = ev.target; if (t && t.name && t.name.startsWith('ch:') && t.closest('#bill-cancel-form')) { const b = B.of(t.name.slice(3)), out = document.querySelector(`[data-cn-for="${t.name.slice(3)}"]`), raw = t.value.replace(/,/g, '').trim(), ok = /^\d+(\.\d{1,2})?$/.test(raw); if (out) out.textContent = ok && Number(raw) <= b.total ? inr(b.total - Number(raw)) : '—'; const f = t.closest('form'); const s = document.getElementById('cxl-sum'); if (s) s.textContent = inr(Object.values(readCancel(f).charges).reduce((a, x) => a + (Number(x) || 0), 0)); } });
  TN.act('bill-cancel-submit', (f) => {
    const d = TN.deal(f.dataset.id), v = readCancel(f), errs = {};
    if (!v.services.length) errs['cxl-services'] = 'Services to cancel: choose at least one service';
    if (v.reason.trim().length < 10) errs['cxl-reason'] = 'Why the customer cancels: write at least 10 characters';
    Object.entries(v.charges).forEach(([k, raw]) => { const b = B.of(k); if (!/^\d+(\.\d{1,2})?$/.test(raw) || Number(raw) > b.total) errs['cxl-ch-' + k] = `Charge kept on ${b.no}: type an amount from ₹0 to ${inr(b.total)}`; });
    if (Object.keys(errs).length) { TN.drawer(cancelBillsForm(d, v, errs)); return; }
    const svcs = liveSvcs(d), whole = v.services.length === svcs.length, id = 'c-' + d.id.slice(-3);
    const billCharges = Object.entries(v.charges).map(([bill, raw]) => ({ bill, charge: Number(raw) }));
    D.cancellations.unshift({ id, deal: d.id, kind: whole ? 'Cancel whole trip' : `Cancel ${F.plural(v.services.length, 'service')}`, services: v.services, reason: v.reason.trim(), requestedBy: TN.me().key, at: TN.TODAY, status: 'requested', charges: [], customerPaid: B.received(d.id), refundToCustomer: 0, ourCharge: 0, recoveryFromCustomer: 0, billCharges });
    d.cancellation = id;
    pushNotice(['purchase'], `Cancellation asked on ${d.id} (${d.title}). Enter what each supplier keeps.`, d.id);
    pushNotice(['manager'], `Cancellation asked on ${d.id}. Charge kept per bill: ${inr(billCharges.reduce((s, x) => s + x.charge, 0))}. It comes to you after Purchase enters supplier charges.`, d.id);
    TN.closeOverlay();
    TN.toast('Cancellation request sent to Purchase. The charge kept per bill goes with it.');
    TN.refresh();
  });

  /* ==================================================================
     8. Routes
     ================================================================== */
  const withPanel = (root, p, q) => { if (q.doc && B.of(q.doc)) openPanel(q.doc); };
  TN.page(BILLS, { nav: BILLS, roles: ['accounts', 'checker', 'manager'], title: 'Bills', render: billsPage, mount: withPanel });
  TN.page(PILOT, { nav: BILLS, roles: ['accounts', 'checker', 'manager'], title: 'Pilot check', render: pilotPage, mount: withPanel });
  TN.page('/app/deals/:id/bills', { nav: '/app/deals', roles: ['sales', 'accounts', 'checker', 'manager'], title: (p) => `${p.id} bills`, canOpen: (p) => dealBillsAllowed(TN.deal(p.id)), render: dealBillsPage, mount: withPanel });
})();
