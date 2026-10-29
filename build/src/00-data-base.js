/* =====================================================================
   TripNavigate full CRM preview · shared invented data (27 Oct 2026)
   Every name, phone, e-mail and Deal number here is invented. None comes
   from the live CRM. Money is whole rupees (the build stores paise).
   "Today" in the preview is Tuesday 27 October 2026, Jodhpur branch.
   Owned by the lead. Department files ADD their own collections under
   TN.DATA.<area> and may change status fields on the shared records below.
   ===================================================================== */
window.TN = window.TN || {};
TN.TODAY = '2026-10-27';

/* ---------- People (one per preview role) ---------- */
TN.PEOPLE = {
  sales:    { id: 'u-sales',    name: 'Ritika Sharma',  role: 'Sales',             branch: 'Jodhpur' },
  sales2:   { id: 'u-sales2',   name: 'Mohit Gehlot',   role: 'Sales',             branch: 'Jodhpur' },
  purchase: { id: 'u-purchase', name: 'Imran Qureshi',  role: 'Purchase',          branch: 'Jodhpur' },
  flight:   { id: 'u-flight',   name: 'Neha Bhati',     role: 'Flight',            branch: 'Jodhpur' },
  visa:     { id: 'u-visa',     name: 'Farhan Ali',     role: 'Visa and passport', branch: 'Jodhpur' },
  accounts: { id: 'u-accounts', name: 'Kavita Joshi',   role: 'Accounts',          branch: 'Jodhpur' },
  checker:  { id: 'u-checker',  name: 'Sunil Mehta',    role: 'Accounts',          branch: 'Jodhpur' },
  manager:  { id: 'u-manager',  name: 'Vikram Rathore', role: 'Branch Manager',    branch: 'Jodhpur' },
  admin:    { id: 'u-admin',    name: 'Anjali Kapoor',  role: 'Super Admin',       branch: 'Jodhpur' },
};

/* ---------- Preview roles (the role switcher) ---------- */
TN.ROLES = [
  { key: 'sales',    label: 'Sales',             person: 'sales' },
  { key: 'purchase', label: 'Purchase',          person: 'purchase' },
  { key: 'flight',   label: 'Flight',            person: 'flight' },
  { key: 'visa',     label: 'Visa and passport', person: 'visa' },
  { key: 'accounts', label: 'Accounts',          person: 'accounts' },
  { key: 'checker',  label: 'Accounts checker',  person: 'checker' },
  { key: 'manager',  label: 'Branch Manager',    person: 'manager' },
  { key: 'admin',    label: 'Super Admin',       person: 'admin' },
];

/* ---------- Money fences and abilities per role ----------
   Mirrors standing rules section 9/10 and modules/access/policy.ts.
   Screens MUST use TN.can(...) for every money field and action. */
TN.CAPS = {
  //                       sales  purch  flight visa  acc    chk    mgr    admin
  seeSellingPrice:        ['sales',                     'accounts','checker','manager'],
  seeMargin:              ['sales',                     'accounts','checker','manager'],
  seeCustomerPayments:    ['sales',                     'accounts','checker','manager'],   // receipts, dues, payment proof
  seeCustomerPaymentProof:[                             'accounts','checker'],            // the uploaded proof file itself (Sales sees own reports)
  seeSupplierCost:        ['purchase','flight','visa',  'accounts','checker','manager'],
  seeLeads:               ['sales','manager','admin'],
  seeQuotations:          ['sales','manager'],
  bookNow:                ['sales','manager'],
  purchaseDesk:           ['purchase','manager'],
  flightDesk:             ['flight'],
  visaDesk:               ['visa'],
  accounts:               ['accounts','checker'],
  approveAsManager:       ['manager'],
  settings:               ['admin'],
  reports:                ['manager','admin','accounts','checker'],
};

/* ---------- Customers (invented) ---------- */
TN.DATA = {
  customers: {
    'c-agarwal':  { name: 'Rohan Agarwal',     phone: '+91 98290 41736', email: 'rohan.agarwal84@gmail.com',  city: 'Jodhpur' },
    'c-khatri':   { name: 'Meenal Khatri',     phone: '+91 94141 28650', email: 'meenal.khatri@outlook.com',  city: 'Jodhpur' },
    'c-bhandari': { name: 'Suresh Bhandari',   phone: '+91 99280 17403', email: 'sbhandari.jdh@gmail.com',    city: 'Jodhpur' },
    'c-purohit':  { name: 'Deepak Purohit',    phone: '+91 97842 56019', email: 'deepak.purohit@yahoo.co.in', city: 'Pali' },
    'c-mathur':   { name: 'Nidhi Mathur',      phone: '+91 98877 30254', email: 'nidhi.mathur91@gmail.com',   city: 'Jodhpur' },
    'c-soni':     { name: 'Rajesh Soni',       phone: '+91 94606 72318', email: 'rajeshsoni.jewellers@gmail.com', city: 'Jodhpur' },
    'c-vyas':     { name: 'Pooja Vyas',        phone: '+91 96365 48107', email: 'pooja.vyas.ca@gmail.com',    city: 'Jodhpur' },
    'c-choudhary':{ name: 'Kunal Choudhary',   phone: '+91 98292 63841', email: 'kunal.choudhary@rediffmail.com', city: 'Balotra' },
    'c-tak':      { name: 'Harish Tak',        phone: '+91 94133 50276', email: 'harishtak1978@gmail.com',    city: 'Jodhpur' },
    'c-marudhar': { name: 'Marudhar Agro Foods Pvt Ltd', phone: '+91 291 274 6630', email: 'admin@marudharagrofoods.in', city: 'Jodhpur', business: true, gstin: '08AAJCM4721K1Z6', contact: 'Ankit Jain' },
    'c-rathi':    { name: 'Sneha Rathi',       phone: '+91 99503 21874', email: 'sneha.rathi@gmail.com',      city: 'Jodhpur' },
    'c-bishnoi':  { name: 'Prakash Bishnoi',   phone: '+91 97830 14592', email: 'prakashbishnoi.pb@gmail.com', city: 'Jodhpur' },
  },

  /* ---------- Deals (Bitrix owns title, stage, owner) ----------
     bookingState uses the live words (modules/deals/workspace.ts):
     not_started | quotation_accepted | in_progress | ready_to_submit |
     waiting_for_accounts | returned | being_arranged | all_confirmed | lost
     tripStatus (PENDING): 'booked' | 'travelled' | 'closed' | null
     serviceIds point at TN.DATA.services. Prices are what Sales entered. */
  deals: [
    { id: 'BX-38412', title: 'Agarwal family · Goa · 4N', customer: 'c-agarwal', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Goa', start: '2026-11-14', end: '2026-11-18', nights: 4, adults: 2, children: 1, infants: 0, tripType: 'Domestic',
      bookingState: 'being_arranged', tripStatus: null, accountsReview: 'approved', submittedAt: '2026-10-19',
      sellingPrice: 186500, costEstimate: 158200, services: ['s-412-h', 's-412-t', 's-412-f'] },
    { id: 'BX-38455', title: 'Khatri honeymoon · Kerala · 6N', customer: 'c-khatri', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Kerala', start: '2026-12-02', end: '2026-12-08', nights: 6, adults: 2, children: 0, infants: 0, tripType: 'Domestic',
      bookingState: 'waiting_for_accounts', tripStatus: null, accountsReview: 'waiting', submittedAt: '2026-10-26',
      sellingPrice: 214000, costEstimate: 176400, services: ['s-455-h1', 's-455-h2', 's-455-h3', 's-455-t', 's-455-f'] },
    { id: 'BX-38390', title: 'Bhandari family · Dubai · 5N', customer: 'c-bhandari', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Dubai', start: '2026-11-20', end: '2026-11-25', nights: 5, adults: 2, children: 2, infants: 0, tripType: 'International',
      bookingState: 'being_arranged', tripStatus: null, accountsReview: 'approved', submittedAt: '2026-10-14',
      sellingPrice: 468000, costEstimate: 401500, services: ['s-390-f', 's-390-v', 's-390-h', 's-390-a'] },
    { id: 'BX-38377', title: 'Purohit friends · Kashmir · 5N', customer: 'c-purohit', owner: 'sales2', stage: 'Won - Payment Received',
      destination: 'Srinagar, Pahalgam, Gulmarg', start: '2026-11-08', end: '2026-11-13', nights: 5, adults: 4, children: 0, infants: 0, tripType: 'Domestic',
      bookingState: 'all_confirmed', tripStatus: 'booked', accountsReview: 'approved', submittedAt: '2026-10-09',
      sellingPrice: 172800, costEstimate: 141900, services: ['s-377-h1', 's-377-h2', 's-377-t'] },
    { id: 'BX-38301', title: 'Mathur couple · Singapore · 4N', customer: 'c-mathur', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Singapore', start: '2026-11-01', end: '2026-11-05', nights: 4, adults: 2, children: 0, infants: 0, tripType: 'International',
      bookingState: 'all_confirmed', tripStatus: 'booked', accountsReview: 'approved', submittedAt: '2026-10-03',
      sellingPrice: 248600, costEstimate: 214300, services: ['s-301-p', 's-301-f'] },
    { id: 'BX-38264', title: 'Soni group · Rishikesh and Mussoorie · 4N', customer: 'c-soni', owner: 'sales2', stage: 'Won - Payment Received',
      destination: 'Rishikesh, Mussoorie', start: '2026-10-10', end: '2026-10-14', nights: 4, adults: 6, children: 0, infants: 0, tripType: 'Domestic',
      bookingState: 'all_confirmed', tripStatus: 'travelled', accountsReview: 'approved', submittedAt: '2026-09-28',
      sellingPrice: 138000, costEstimate: 116700, services: ['s-264-h1', 's-264-h2', 's-264-t'] },
    { id: 'BX-38520', title: 'Vyas couple · Udaipur · 2N', customer: 'c-vyas', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Udaipur', start: '2026-11-21', end: '2026-11-23', nights: 2, adults: 2, children: 0, infants: 0, tripType: 'Domestic',
      bookingState: 'returned', tripStatus: null, accountsReview: 'returned', submittedAt: '2026-10-24',
      returnReason: 'The Bill To GSTIN does not match the company name. Please check the GSTIN with the customer and send again.',
      sellingPrice: 46800, costEstimate: 39200, services: ['s-520-h'] },
    { id: 'BX-38533', title: 'Choudhary couple · Thailand · 5N', customer: 'c-choudhary', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Phuket, Krabi', start: '2026-12-12', end: '2026-12-17', nights: 5, adults: 2, children: 0, infants: 0, tripType: 'International',
      bookingState: 'in_progress', tripStatus: null, accountsReview: null, submittedAt: null,
      sellingPrice: null, costEstimate: null, services: [] },
    { id: 'BX-38198', title: 'Tak family · Shimla and Manali · 6N', customer: 'c-tak', owner: 'sales2', stage: 'Won - Payment Received',
      destination: 'Shimla, Manali', start: '2026-11-03', end: '2026-11-09', nights: 6, adults: 3, children: 1, infants: 0, tripType: 'Domestic',
      bookingState: 'all_confirmed', tripStatus: 'booked', accountsReview: 'approved', submittedAt: '2026-10-06',
      cancellation: 'c-198', sellingPrice: 154000, costEstimate: 128600, services: ['s-198-h1', 's-198-h2', 's-198-t'] },
    { id: 'BX-38547', title: 'Marudhar Agro offsite · Jaisalmer · 2N', customer: 'c-marudhar', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Jaisalmer', start: '2026-11-06', end: '2026-11-08', nights: 2, adults: 18, children: 0, infants: 0, tripType: 'Domestic',
      bookingState: 'being_arranged', tripStatus: null, accountsReview: 'approved', submittedAt: '2026-10-22',
      sellingPrice: 342000, costEstimate: 287500, services: ['s-547-h', 's-547-t', 's-547-a'] },
    { id: 'BX-38560', title: 'Rathi couple · Bali · 5N', customer: 'c-rathi', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Bali', start: '2027-01-09', end: '2027-01-14', nights: 5, adults: 2, children: 0, infants: 0, tripType: 'International',
      bookingState: 'quotation_accepted', tripStatus: null, accountsReview: null, submittedAt: null, quotation: 'Q-2610-014',
      sellingPrice: null, costEstimate: null, services: [] },
    { id: 'BX-38571', title: 'Bishnoi family · Jaipur · 2N', customer: 'c-bishnoi', owner: 'sales', stage: 'Won - Payment Received',
      destination: 'Jaipur', start: '2026-11-28', end: '2026-11-30', nights: 2, adults: 2, children: 2, infants: 0, tripType: 'Domestic',
      bookingState: 'not_started', tripStatus: null, accountsReview: null, submittedAt: null,
      sellingPrice: null, costEstimate: null, services: [] },
  ],

  /* ---------- Services (one department task each) ----------
     kind: hotel | transfer | activity | flight | visa | passport | package
     dept: purchase | flight | visa
     taskStatus (live words): new | in_progress | supplier_confirmed | done | cancelled
     goAhead (PENDING Stage 3): null (not needed) | 'waiting' | 'given' | 'refused'
     budget = Sales' cost estimate (Purchase sees it), cost = Purchase/Flight cost entered. */
  services: {
    's-412-h':  { deal: 'BX-38412', kind: 'hotel', dept: 'purchase', title: 'Taj Holiday Village Resort and Spa, Candolim', detail: '4 nights · 1 Deluxe garden view room · breakfast', start: '2026-11-14', end: '2026-11-18', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-taj', budget: 72000, cost: 68400, confirmationNo: 'TJGOA-55193' },
    's-412-t':  { deal: 'BX-38412', kind: 'transfer', dept: 'purchase', title: 'Airport transfers, Goa', detail: 'GOX to hotel and back · Innova Crysta', start: '2026-11-14', end: '2026-11-18', assignee: 'purchase', taskStatus: 'in_progress', goAhead: null, supplier: 'sp-goacabs', budget: 6500, cost: 5800 },
    's-412-f':  { deal: 'BX-38412', kind: 'flight', dept: 'flight', title: 'JDH to GOX and back', detail: 'IndiGo 6E 6142 / 6E 6143 · 3 passengers', start: '2026-11-14', end: '2026-11-18', assignee: 'flight', taskStatus: 'in_progress', supplier: 'sp-indigo', budget: 48000, cost: 45960, pnr: 'K7RW2P' },
    's-455-h1': { deal: 'BX-38455', kind: 'hotel', dept: 'purchase', title: 'Blanket Hotel and Spa, Munnar', detail: '2 nights · Premium room · breakfast', start: '2026-12-02', end: '2026-12-04', assignee: null, taskStatus: 'new', goAhead: 'waiting', budget: 32000 },
    's-455-h2': { deal: 'BX-38455', kind: 'hotel', dept: 'purchase', title: 'Spice Village, Thekkady', detail: '2 nights · Cottage · breakfast and dinner', start: '2026-12-04', end: '2026-12-06', assignee: null, taskStatus: 'new', goAhead: 'waiting', budget: 36000 },
    's-455-h3': { deal: 'BX-38455', kind: 'hotel', dept: 'purchase', title: 'Premium houseboat, Alleppey', detail: '2 nights · 1 bedroom · all meals', start: '2026-12-06', end: '2026-12-08', assignee: null, taskStatus: 'new', goAhead: 'waiting', budget: 30000 },
    's-455-t':  { deal: 'BX-38455', kind: 'transfer', dept: 'purchase', title: 'Kerala round trip by car', detail: 'COK pickup to Munnar, Thekkady, Alleppey, COK drop · Dzire', start: '2026-12-02', end: '2026-12-08', assignee: null, taskStatus: 'new', goAhead: null, budget: 21000 },
    's-455-f':  { deal: 'BX-38455', kind: 'flight', dept: 'flight', title: 'JDH to COK and back', detail: 'Via DEL · 2 passengers', start: '2026-12-02', end: '2026-12-08', assignee: null, taskStatus: 'new', budget: 42000 },
    's-390-f':  { deal: 'BX-38390', kind: 'flight', dept: 'flight', title: 'AMD to DXB and back', detail: 'Emirates EK 539 / EK 538 · 4 passengers', start: '2026-11-20', end: '2026-11-25', assignee: 'flight', taskStatus: 'in_progress', supplier: 'sp-emirates', budget: 128000, cost: 121640, pnr: 'QX4M8T' },
    's-390-v':  { deal: 'BX-38390', kind: 'visa', dept: 'visa', title: 'UAE tourist visa, 30 days', detail: '4 travellers', start: '2026-11-20', end: '2026-11-25', assignee: 'visa', taskStatus: 'in_progress', budget: 26000, cost: 25200 },
    's-390-h':  { deal: 'BX-38390', kind: 'hotel', dept: 'purchase', title: 'Rove Downtown, Dubai', detail: '5 nights · 1 Family room · breakfast', start: '2026-11-20', end: '2026-11-25', assignee: 'purchase', taskStatus: 'in_progress', goAhead: 'given', supplier: 'sp-arabian', budget: 118000, cost: 112500 },
    's-390-a':  { deal: 'BX-38390', kind: 'activity', dept: 'purchase', title: 'Desert safari with BBQ dinner', detail: '4 people · shared 4x4 · 22 Nov', start: '2026-11-22', end: '2026-11-22', assignee: 'purchase', taskStatus: 'in_progress', goAhead: null, supplier: 'sp-arabian', budget: 14000, cost: 13200 },
    's-377-h1': { deal: 'BX-38377', kind: 'hotel', dept: 'purchase', title: 'Hotel Grand Mumtaz, Srinagar', detail: '3 nights · 2 Deluxe rooms · breakfast and dinner', start: '2026-11-08', end: '2026-11-11', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-mumtaz', budget: 54000, cost: 51600, confirmationNo: 'GMS/2611/218' },
    's-377-h2': { deal: 'BX-38377', kind: 'hotel', dept: 'purchase', title: 'Pine Spring Resort, Pahalgam', detail: '2 nights · 2 rooms · breakfast and dinner', start: '2026-11-11', end: '2026-11-13', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-pinespring', budget: 38000, cost: 36800, confirmationNo: 'PSR-90417' },
    's-377-t':  { deal: 'BX-38377', kind: 'transfer', dept: 'purchase', title: 'Kashmir cab for 6 days', detail: 'SXR pickup and drop · Innova', start: '2026-11-08', end: '2026-11-13', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: null, supplier: 'sp-kashmircabs', budget: 33000, cost: 31500 },
    's-301-p':  { deal: 'BX-38301', kind: 'package', dept: 'purchase', title: 'Singapore land package', detail: 'Hotel Boss, 4 nights, Sentosa and city tour', start: '2026-11-01', end: '2026-11-05', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-asiaholidays', budget: 142000, cost: 138900, confirmationNo: 'AH-SG-77310' },
    's-301-f':  { deal: 'BX-38301', kind: 'flight', dept: 'flight', title: 'DEL to SIN and back', detail: 'Singapore Airlines SQ 403 / SQ 406 · 2 passengers', start: '2026-11-01', end: '2026-11-05', assignee: 'flight', taskStatus: 'done', supplier: 'sp-sia', budget: 78000, cost: 75400, pnr: 'SQ9T4L' },
    's-264-h1': { deal: 'BX-38264', kind: 'hotel', dept: 'purchase', title: 'Aloha on the Ganges, Rishikesh', detail: '2 nights · 3 rooms · breakfast', start: '2026-10-10', end: '2026-10-12', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-aloha', budget: 48000, cost: 45600, confirmationNo: 'ALH-31882' },
    's-264-h2': { deal: 'BX-38264', kind: 'hotel', dept: 'purchase', title: 'JW Marriott Walnut Grove, Mussoorie', detail: '2 nights · 3 rooms · breakfast', start: '2026-10-12', end: '2026-10-14', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-marriott', budget: 52000, cost: 49800, confirmationNo: 'JWM-6620419' },
    's-264-t':  { deal: 'BX-38264', kind: 'transfer', dept: 'purchase', title: 'Tempo Traveller from Dehradun', detail: '5 days · 12 seater', start: '2026-10-10', end: '2026-10-14', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: null, supplier: 'sp-doontravels', budget: 22000, cost: 21300 },
    's-520-h':  { deal: 'BX-38520', kind: 'hotel', dept: 'purchase', title: 'Trident, Udaipur', detail: '2 nights · Lake view room · breakfast', start: '2026-11-21', end: '2026-11-23', assignee: null, taskStatus: 'new', goAhead: 'waiting', budget: 39200 },
    's-198-h1': { deal: 'BX-38198', kind: 'hotel', dept: 'purchase', title: 'Snow Valley Resorts, Shimla', detail: '3 nights · 2 rooms · breakfast and dinner', start: '2026-11-03', end: '2026-11-06', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-snowvalley', budget: 46000, cost: 43800, confirmationNo: 'SVR-11934' },
    's-198-h2': { deal: 'BX-38198', kind: 'hotel', dept: 'purchase', title: 'Span Resort and Spa, Manali', detail: '3 nights · 2 cottages · breakfast and dinner', start: '2026-11-06', end: '2026-11-09', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: 'given', supplier: 'sp-span', budget: 58000, cost: 55900, confirmationNo: 'SPAN-4471' },
    's-198-t':  { deal: 'BX-38198', kind: 'transfer', dept: 'purchase', title: 'Chandigarh to Shimla, Manali and back', detail: '7 days · Innova Crysta', start: '2026-11-03', end: '2026-11-09', assignee: 'purchase', taskStatus: 'supplier_confirmed', goAhead: null, supplier: 'sp-himcabs', budget: 29000, cost: 28900 },
    's-547-h':  { deal: 'BX-38547', kind: 'hotel', dept: 'purchase', title: 'Suryagarh, Jaisalmer', detail: '2 nights · 9 rooms (twin sharing) · all meals', start: '2026-11-06', end: '2026-11-08', assignee: 'purchase', taskStatus: 'in_progress', goAhead: 'given', supplier: 'sp-suryagarh', budget: 236000, cost: 228000 },
    's-547-t':  { deal: 'BX-38547', kind: 'transfer', dept: 'purchase', title: 'Jodhpur to Jaisalmer coach', detail: '2 x 20 seater Volvo · return', start: '2026-11-06', end: '2026-11-08', assignee: 'purchase', taskStatus: 'in_progress', goAhead: null, supplier: 'sp-marwarcoach', budget: 38000, cost: 36000 },
    's-547-a':  { deal: 'BX-38547', kind: 'activity', dept: 'purchase', title: 'Sam sand dunes camel safari and cultural evening', detail: '18 people · 7 Nov', start: '2026-11-07', end: '2026-11-07', assignee: 'purchase', taskStatus: 'new', goAhead: null, budget: 13500 },
  },

  /* ---------- Suppliers (Purchase register) ---------- */
  suppliers: {
    'sp-taj':          { name: 'Taj Holiday Village Resort and Spa', city: 'Goa', type: 'Hotel', verified: true, bank: 'approved', email: 'reservations.goa@tajhotels.example' },
    'sp-goacabs':      { name: 'Goa Coastal Cabs', city: 'Goa', type: 'Transfers', verified: true, bank: 'approved' },
    'sp-indigo':       { name: 'IndiGo (via airline portal)', city: '', type: 'Airline', verified: true, bank: 'not_needed' },
    'sp-emirates':     { name: 'Emirates (via Akbar Travels portal)', city: '', type: 'Airline', verified: true, bank: 'approved' },
    'sp-sia':          { name: 'Singapore Airlines (via portal)', city: '', type: 'Airline', verified: true, bank: 'not_needed' },
    'sp-arabian':      { name: 'Arabian Nights DMC', city: 'Dubai', type: 'Destination company', verified: true, bank: 'approved' },
    'sp-mumtaz':       { name: 'Hotel Grand Mumtaz', city: 'Srinagar', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-pinespring':   { name: 'Pine Spring Resort', city: 'Pahalgam', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-kashmircabs':  { name: 'Dal View Tours and Travels', city: 'Srinagar', type: 'Transfers', verified: true, bank: 'approved' },
    'sp-asiaholidays': { name: 'Asia Holidays Pte Ltd', city: 'Singapore', type: 'Destination company', verified: true, bank: 'approved' },
    'sp-aloha':        { name: 'Aloha on the Ganges', city: 'Rishikesh', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-marriott':     { name: 'JW Marriott Mussoorie Walnut Grove', city: 'Mussoorie', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-doontravels':  { name: 'Doon Valley Travels', city: 'Dehradun', type: 'Transfers', verified: true, bank: 'approved' },
    'sp-snowvalley':   { name: 'Snow Valley Resorts', city: 'Shimla', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-span':         { name: 'Span Resort and Spa', city: 'Manali', type: 'Hotel', verified: true, bank: 'changed' },   // bank details changed: waiting for Manager
    'sp-himcabs':      { name: 'Himachal Hill Cabs', city: 'Chandigarh', type: 'Transfers', verified: true, bank: 'approved' },
    'sp-suryagarh':    { name: 'Suryagarh Jaisalmer', city: 'Jaisalmer', type: 'Hotel', verified: true, bank: 'approved' },
    'sp-marwarcoach':  { name: 'Marwar Coach Services', city: 'Jodhpur', type: 'Transfers', verified: false, bank: 'waiting' },
  },

  /* ---------- PENDING shared money records ---------- */

  /* Customer payment plan and dues (Stage 4). status: paid | due | overdue | part_paid */
  instalments: [
    { deal: 'BX-38412', label: 'Advance', due: '2026-10-19', amount: 60000, paid: 60000, status: 'paid' },
    { deal: 'BX-38412', label: 'Balance', due: '2026-11-07', amount: 126500, paid: 0, status: 'due' },
    { deal: 'BX-38390', label: 'Advance', due: '2026-10-14', amount: 150000, paid: 150000, status: 'paid' },
    { deal: 'BX-38390', label: 'Second instalment', due: '2026-10-25', amount: 150000, paid: 90000, status: 'overdue' },
    { deal: 'BX-38390', label: 'Balance', due: '2026-11-13', amount: 168000, paid: 0, status: 'due' },
    { deal: 'BX-38377', label: 'Advance', due: '2026-10-09', amount: 50000, paid: 50000, status: 'paid' },
    { deal: 'BX-38377', label: 'Balance', due: '2026-10-24', amount: 122800, paid: 0, status: 'overdue' },
    { deal: 'BX-38301', label: 'Full payment', due: '2026-10-03', amount: 248600, paid: 248600, status: 'paid' },
    { deal: 'BX-38264', label: 'Advance', due: '2026-09-28', amount: 40000, paid: 40000, status: 'paid' },
    { deal: 'BX-38264', label: 'Balance', due: '2026-10-08', amount: 98000, paid: 98000, status: 'paid' },
    { deal: 'BX-38198', label: 'Advance', due: '2026-10-06', amount: 60000, paid: 60000, status: 'paid' },
    { deal: 'BX-38198', label: 'Balance', due: '2026-10-27', amount: 94000, paid: 0, status: 'due' },
    { deal: 'BX-38547', label: 'Advance', due: '2026-10-30', amount: 100000, paid: 0, status: 'due' },
    { deal: 'BX-38547', label: 'Balance', due: '2026-11-04', amount: 242000, paid: 0, status: 'due' },
    { deal: 'BX-38455', label: 'Advance', due: '2026-10-28', amount: 70000, paid: 0, status: 'due' },
    { deal: 'BX-38455', label: 'Balance', due: '2026-11-25', amount: 144000, paid: 0, status: 'due' },
  ],

  /* Customer receipts (LIVE feature, invented rows). status: recorded | verified | reversed
     recordedBy / verifiedBy are TN.PEOPLE keys; the checker never verifies their own. */
  receipts: [
    { id: 'RC-26-0107', deal: 'BX-38412', mode: 'Bank transfer', ref: 'UTR HDFCN52026101941187', amount: 60000, date: '2026-10-19', status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'HDFC Bank current account ··4417' },
    { id: 'RC-26-0109', deal: 'BX-38390', mode: 'UPI', ref: 'UPI 629841735520', amount: 150000, date: '2026-10-14', status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'holidaychacha@hdfcbank' },
    { id: 'RC-26-0112', deal: 'BX-38390', mode: 'Cheque', ref: 'Cheque 004182 · SBI Ratanada', amount: 90000, date: '2026-10-24', status: 'recorded', recordedBy: 'accounts', verifiedBy: null, to: 'HDFC Bank current account ··4417', cheque: 'waiting_clearance' },
    { id: 'RC-26-0104', deal: 'BX-38377', mode: 'Cash', ref: 'Cash at Jodhpur branch', amount: 50000, date: '2026-10-09', status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'Jodhpur branch cash' },
    { id: 'RC-26-0101', deal: 'BX-38301', mode: 'Bank transfer', ref: 'UTR ICICR42026100388216', amount: 248600, date: '2026-10-03', status: 'verified', recordedBy: 'checker', verifiedBy: 'accounts', to: 'HDFC Bank current account ··4417' },
    { id: 'RC-26-0098', deal: 'BX-38264', mode: 'UPI', ref: 'UPI 627115094336', amount: 40000, date: '2026-09-28', status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'holidaychacha@hdfcbank' },
    { id: 'RC-26-0103', deal: 'BX-38264', mode: 'Bank transfer', ref: 'UTR SBINR12026100729974', amount: 98000, date: '2026-10-07', status: 'verified', recordedBy: 'checker', verifiedBy: 'accounts', to: 'HDFC Bank current account ··4417' },
    { id: 'RC-26-0105', deal: 'BX-38198', mode: 'UPI', ref: 'UPI 628310447762', amount: 60000, date: '2026-10-06', status: 'verified', recordedBy: 'accounts', verifiedBy: 'checker', to: 'holidaychacha@hdfcbank' },
    { id: 'RC-26-0114', deal: 'BX-38412', mode: 'UPI', ref: 'UPI 630055218704', amount: 40000, date: '2026-10-27', status: 'recorded', recordedBy: 'accounts', verifiedBy: null, to: 'holidaychacha@hdfcbank' },
  ],

  /* Payments reported by Sales (LIVE "Reported payments"). status: reported | linked | not_received */
  paymentReports: [
    { id: 'PR-0042', deal: 'BX-38455', mode: 'Bank transfer', amount: 70000, date: '2026-10-26', ref: 'UTR KKBKH62026102660413', status: 'reported', by: 'sales', proof: 'NEFT-screenshot-26Oct.jpg' },
    { id: 'PR-0041', deal: 'BX-38412', mode: 'UPI', amount: 40000, date: '2026-10-27', ref: 'UPI 630055218704', status: 'linked', by: 'sales', proof: 'gpay-receipt.png', receipt: 'RC-26-0114' },
  ],

  /* Supplier payment requests (Stage 6, PENDING).
     status: requested | waiting_manager | approved | paid | verified | returned | on_hold
     Routing: amount counted across the Deal and supplier. <= 50,000 Accounts approves; above, the branch Manager.
     raisedBy: purchase | flight. paidBy / verifiedBy: two different Accounts people. */
  supplierPayments: [
    { id: 'SP-26-0031', deal: 'BX-38412', service: 's-412-h', supplier: 'sp-taj', amount: 68400, part: 'Full payment', dueBy: '2026-10-30', raisedBy: 'purchase', raisedAt: '2026-10-26', status: 'waiting_manager', invoice: 'TJGOA-PI-8814.pdf' },
    { id: 'SP-26-0030', deal: 'BX-38390', service: 's-390-h', supplier: 'sp-arabian', amount: 56250, part: '50% deposit', dueBy: '2026-10-29', raisedBy: 'purchase', raisedAt: '2026-10-25', status: 'waiting_manager', invoice: 'AND-PI-2026-1187.pdf', note: 'Counted with the safari request: ₹69,450 to Arabian Nights DMC on this Deal, so the Manager approves.' },
    { id: 'SP-26-0029', deal: 'BX-38390', service: 's-390-a', supplier: 'sp-arabian', amount: 13200, part: 'Full payment', dueBy: '2026-11-15', raisedBy: 'purchase', raisedAt: '2026-10-25', status: 'waiting_manager' },
    { id: 'SP-26-0028', deal: 'BX-38377', service: 's-377-t', supplier: 'sp-kashmircabs', amount: 31500, part: 'Full payment', dueBy: '2026-11-01', raisedBy: 'purchase', raisedAt: '2026-10-24', status: 'requested' },
    { id: 'SP-26-0027', deal: 'BX-38377', service: 's-377-h2', supplier: 'sp-pinespring', amount: 36800, part: 'Full payment', dueBy: '2026-10-28', raisedBy: 'purchase', raisedAt: '2026-10-23', status: 'approved', approvedBy: 'accounts' },
    { id: 'SP-26-0026', deal: 'BX-38377', service: 's-377-h1', supplier: 'sp-mumtaz', amount: 51600, part: 'Full payment', dueBy: '2026-10-27', raisedBy: 'purchase', raisedAt: '2026-10-22', status: 'paid', approvedBy: 'manager', paidBy: 'accounts', paidAt: '2026-10-26', bankRef: 'HDFC NEFT N299260415527', invoice: 'GMS-INV-2611-218.pdf' },
    { id: 'SP-26-0025', deal: 'BX-38301', service: 's-301-p', supplier: 'sp-asiaholidays', amount: 138900, part: 'Full payment', dueBy: '2026-10-20', raisedBy: 'purchase', raisedAt: '2026-10-15', status: 'verified', approvedBy: 'manager', paidBy: 'accounts', paidAt: '2026-10-18', verifiedBy: 'checker', bankRef: 'HDFC SWIFT 18OCT26-0072' },
    { id: 'SP-26-0024', deal: 'BX-38390', service: 's-390-f', supplier: 'sp-emirates', amount: 121640, part: 'Full payment', dueBy: '2026-10-28', raisedBy: 'flight', raisedAt: '2026-10-26', status: 'waiting_manager', note: 'Ticket above ₹50,000: Flight cannot pay directly, so it is a payment request.' },
    { id: 'SP-26-0023', deal: 'BX-38198', service: 's-198-h2', supplier: 'sp-span', amount: 55900, part: 'Full payment', dueBy: '2026-10-25', raisedBy: 'purchase', raisedAt: '2026-10-18', status: 'on_hold', approvedBy: 'manager', note: 'Supplier bank details changed on 24 Oct. Paused until the Manager approves the new details.' },
    { id: 'SP-26-0022', deal: 'BX-38547', service: 's-547-h', supplier: 'sp-suryagarh', amount: 114000, part: '50% advance', dueBy: '2026-10-29', raisedBy: 'purchase', raisedAt: '2026-10-26', status: 'waiting_manager', funding: 'F-26-007' },
  ],

  /* Supplier original invoices and credit notes (PENDING). status: uploaded | accepted | returned */
  supplierInvoices: [
    { id: 'SI-0019', deal: 'BX-38377', service: 's-377-h1', supplier: 'sp-mumtaz', kind: 'Invoice', number: 'GMS/INV/2611/218', amount: 51600, gst: 2457, date: '2026-10-25', file: 'GMS-INV-2611-218.pdf', status: 'accepted', by: 'purchase', checkedBy: 'checker' },
    { id: 'SI-0020', deal: 'BX-38301', service: 's-301-p', supplier: 'sp-asiaholidays', kind: 'Invoice', number: 'AHS-26-04417', amount: 138900, gst: 0, date: '2026-10-17', file: 'AHS-26-04417.pdf', status: 'uploaded', by: 'purchase' },
    { id: 'SI-0021', deal: 'BX-38264', service: 's-264-h2', supplier: 'sp-marriott', kind: 'Invoice', number: 'JWM/MSR/26/88120', amount: 49800, gst: 5976, date: '2026-10-14', file: 'JWM-88120.pdf', status: 'uploaded', by: 'purchase' },
    { id: 'SI-0022', deal: 'BX-38198', service: 's-198-h1', supplier: 'sp-snowvalley', kind: 'Credit note', number: 'SVR/CN/0093', amount: 21900, gst: 1043, date: '2026-10-26', file: 'SVR-CN-0093.pdf', status: 'uploaded', by: 'purchase', note: 'Cancellation: 50% of the stay refunded by the hotel.' },
  ],

  /* Customer documents (Invoice / Advance Invoice / voucher, PENDING). Not a tax invoice; Tally issues the tax invoice.
     status: draft | waiting_accounts | approved | sent */
  documents: [
    { id: 'HC/JDH/26-27/0041', deal: 'BX-38377', kind: 'Invoice', amount: 172800, date: '2026-10-24', status: 'sent', approvedBy: 'accounts', sentBy: 'sales2' },
    { id: 'HC/JDH/ADV/26-27/0058', deal: 'BX-38412', kind: 'Advance Invoice', amount: 60000, date: '2026-10-19', status: 'sent', approvedBy: 'checker', sentBy: 'sales' },
    { id: 'HC/JDH/26-27/0043', deal: 'BX-38412', kind: 'Invoice', amount: 186500, date: '2026-10-27', status: 'waiting_accounts' },
    { id: 'VCH-38412-01', deal: 'BX-38412', kind: 'Hotel voucher', service: 's-412-h', date: '2026-10-27', status: 'draft' },
    { id: 'HC/JDH/26-27/0039', deal: 'BX-38301', kind: 'Invoice', amount: 248600, date: '2026-10-05', status: 'sent', approvedBy: 'accounts', sentBy: 'sales' },
    { id: 'VCH-38301-01', deal: 'BX-38301', kind: 'Hotel voucher', service: 's-301-p', date: '2026-10-20', status: 'sent', approvedBy: 'accounts', sentBy: 'sales' },
    { id: 'HC/JDH/26-27/0036', deal: 'BX-38264', kind: 'Invoice', amount: 138000, date: '2026-10-01', status: 'sent', approvedBy: 'checker', sentBy: 'sales2' },
    { id: 'HC/JDH/ADV/26-27/0061', deal: 'BX-38390', kind: 'Advance Invoice', amount: 150000, date: '2026-10-14', status: 'sent', approvedBy: 'accounts', sentBy: 'sales' },
  ],

  /* Company funding (Stage 5, PENDING): the hotel must be paid before the customer's money arrives.
     <= 50,000 Accounts approves; above, the branch Manager. status: requested | waiting_manager | approved | refused | recovered */
  funding: [
    { id: 'F-26-007', deal: 'BX-38547', service: 's-547-h', amount: 114000, reason: 'Suryagarh needs a 50% advance by 29 Oct to hold 9 rooms. The customer’s money has not arrived yet.', requestedBy: 'purchase', at: '2026-10-26', status: 'waiting_manager', recoverFrom: 'Next customer receipt on this Deal' },
    { id: 'F-26-006', deal: 'BX-38412', service: 's-412-t', amount: 5800, reason: 'Cab owner wants payment on booking.', requestedBy: 'purchase', at: '2026-10-21', status: 'recovered', approvedBy: 'accounts', recoverFrom: 'Advance RC-26-0107' },
  ],

  /* Cancellations and changes after booking (Stage 9, PENDING).
     status: requested | charges_entered | waiting_manager | approved | refund_paid | closed */
  cancellations: [
    { id: 'c-198', deal: 'BX-38198', kind: 'Cancel whole trip', reason: 'Customer’s father admitted to hospital. Family cannot travel.', requestedBy: 'sales2', at: '2026-10-25', status: 'waiting_manager',
      charges: [ { service: 's-198-h1', supplierCharge: 21900, note: 'Snow Valley keeps 50%' }, { service: 's-198-h2', supplierCharge: 55900, note: 'Span: non-refundable inside 15 days' }, { service: 's-198-t', supplierCharge: 5000, note: 'Cab keeps ₹5,000' } ],
      customerPaid: 60000, refundToCustomer: 0, ourCharge: 2500, recoveryFromCustomer: 25300 },
  ],
  changes: [
    { id: 'ch-412-1', deal: 'BX-38412', kind: 'Add a service', detail: 'Add North Goa sightseeing tour on 16 Nov for 3 people', requestedBy: 'sales', at: '2026-10-26', status: 'waiting_customer', note: 'Fresh customer acceptance needed: price goes up by ₹4,500.' },
  ],

  /* Refunds and supplier recoveries (Stage 9, PENDING). status: requested | approved | paid | verified */
  refunds: [
    { id: 'RF-26-004', deal: 'BX-38198', kind: 'Supplier recovery', party: 'sp-snowvalley', amount: 21900, status: 'approved', note: 'Credit note SVR/CN/0093: hotel returns 50%.' },
    { id: 'RF-26-003', deal: 'BX-38264', kind: 'Customer refund', party: 'c-soni', amount: 3500, status: 'paid', note: 'One room shifted to a smaller category in Mussoorie.', paidBy: 'accounts', bankRef: 'HDFC IMPS 629900183274' },
  ],

  /* Staff reminders and notices (PENDING). Staff only; customer messages come later.
     to: role keys. kind: reminder | notice | escalation */
  notices: [
    { id: 'n1', to: ['sales','accounts','checker','manager'], kind: 'reminder', text: 'Kashmir balance ₹1,22,800 is 3 days overdue (Deepak Purohit). Trip starts 8 Nov.', deal: 'BX-38377', at: '2026-10-27 09:00' },
    { id: 'n2', to: ['sales','accounts','checker'], kind: 'reminder', text: 'Dubai second instalment: ₹60,000 still due (Suresh Bhandari). Due 25 Oct.', deal: 'BX-38390', at: '2026-10-27 09:00' },
    { id: 'n3', to: ['manager'], kind: 'notice', text: '5 supplier payments above ₹50,000 wait for your approval.', href: '#/app/approvals', at: '2026-10-27 09:00' },
    { id: 'n4', to: ['sales','accounts'], kind: 'notice', text: 'Flight ticket issued for Bhandari family: Emirates PNR QX4M8T.', deal: 'BX-38390', at: '2026-10-26 17:42' },
    { id: 'n5', to: ['sales'], kind: 'notice', text: 'Visa result: 2 of 4 UAE visas issued for Bhandari family. 2 still with the embassy.', deal: 'BX-38390', at: '2026-10-27 11:15' },
    { id: 'n6', to: ['purchase'], kind: 'reminder', text: 'Original invoice missing for Aloha on the Ganges (trip ended 14 Oct).', deal: 'BX-38264', at: '2026-10-27 09:00' },
    { id: 'n7', to: ['manager'], kind: 'escalation', text: 'Kerala booking BX-38455 has waited 1 day for Accounts review. Hotel tasks cannot start.', deal: 'BX-38455', at: '2026-10-27 10:00' },
    { id: 'n8', to: ['accounts','checker'], kind: 'notice', text: 'Supplier payment SP-26-0026 paid by Kavita Joshi. A different person must verify it.', href: '#/app/accounts/supplier-payments', at: '2026-10-26 16:20' },
    { id: 'n9', to: ['sales','manager'], kind: 'notice', text: 'Accounts returned Udaipur booking BX-38520: Bill To GSTIN does not match.', deal: 'BX-38520', at: '2026-10-25 12:30' },
  ],

  /* Leads (Bitrix owns them; the CRM reads). */
  leads: [
    { id: 'L-61208', title: 'Maldives honeymoon, February', name: 'Aditya Rajpurohit', phone: '+91 98280 66314', status: 'In progress', source: 'Instagram', owner: 'sales', created: '2026-10-26', budget: '₹3.5 lakh', travellers: '2 adults' },
    { id: 'L-61199', title: 'Char Dham Yatra, May', name: 'Kamla Devi Sankhla', phone: '+91 94143 70829', status: 'New', source: 'Walk-in', owner: 'sales2', created: '2026-10-26', budget: '₹1.8 lakh', travellers: '4 adults' },
    { id: 'L-61187', title: 'Andaman family trip, Christmas', name: 'Manish Kalla', phone: '+91 99291 40571', status: 'Quotation sent', source: 'Website chat', owner: 'sales', created: '2026-10-25', budget: '₹2.4 lakh', travellers: '2 adults, 2 children' },
    { id: 'L-61170', title: 'Europe 12 nights, May 2027', name: 'Dr. Swati Lodha', phone: '+91 97721 08456', status: 'In progress', source: 'Referral', owner: 'sales', created: '2026-10-24', budget: '₹9 lakh', travellers: '2 adults' },
    { id: 'L-61163', title: 'Vietnam 6N', name: 'Yash Mehta', phone: '+91 98877 52013', status: 'New', source: 'Facebook', owner: null, created: '2026-10-24', budget: '—', travellers: '3 adults' },
    { id: 'L-61151', title: 'Ladakh bike trip, June', name: 'Rahul Dewasi', phone: '+91 96029 31847', status: 'Follow-up', source: 'Instagram', owner: 'sales2', created: '2026-10-23', budget: '₹70,000', travellers: '6 adults' },
    { id: 'L-61140', title: 'School trip, Mount Abu', name: 'St. Anne’s Sr. Sec. School', phone: '+91 291 263 4410', status: 'Quotation sent', source: 'Phone', owner: 'sales', created: '2026-10-22', budget: '₹4.2 lakh', travellers: '48 students, 4 teachers' },
    { id: 'L-61126', title: 'Bhutan 5N, March', name: 'Gaurav Singhvi', phone: '+91 94609 27735', status: 'In progress', source: 'Google', owner: 'sales2', created: '2026-10-21', budget: '₹1.6 lakh', travellers: '2 adults' },
    { id: 'L-61114', title: 'Sri Lanka 6N', name: 'Shalini Bhansali', phone: '+91 98290 74521', status: 'Lost', source: 'Instagram', owner: 'sales', created: '2026-10-19', budget: '₹1.9 lakh', travellers: '2 adults' },
    { id: 'L-61102', title: 'Kedarnath helicopter, May', name: 'Om Prakash Joshi', phone: '+91 94141 63098', status: 'Follow-up', source: 'Walk-in', owner: 'sales', created: '2026-10-18', budget: '₹1.1 lakh', travellers: '2 adults, 1 senior' },
  ],
};

/* ---------- Small shared lookups ---------- */
TN.deal = (id) => TN.DATA.deals.find((d) => d.id === id);
TN.customer = (id) => TN.DATA.customers[id];
TN.service = (id) => TN.DATA.services[id];
TN.supplier = (id) => TN.DATA.suppliers[id];
TN.person = (key) => TN.PEOPLE[key];
TN.servicesOf = (dealId) => Object.entries(TN.DATA.services).filter(([, s]) => s.deal === dealId).map(([id, s]) => ({ id, ...s }));

/* ---------- Travellers per Deal (Book now "Passengers") ----------
   Name as on the ID, adult or child, date of birth, ID proof [kind, size].
   kind: 'aadhaar' | 'passport' | null (not attached yet). The file is attached on the Deal's ID date. */
TN.DATA.travellers = (() => {
  const T = {
    'BX-38412': ['2026-10-18', [['Rohan Agarwal', 'adult', '1984-03-12', 'aadhaar'], ['Anita Agarwal', 'adult', '1987-07-25', 'aadhaar'], ['Vihaan Agarwal', 'child', '2019-05-14', null]]],
    'BX-38455': ['2026-10-25', [['Meenal Khatri', 'adult', '1996-04-09', 'aadhaar'], ['Arjun Khatri', 'adult', '1994-11-30', null]]],
    'BX-38390': ['2026-10-13', [['Suresh Bhandari', 'adult', '1980-03-03', 'passport'], ['Anita Bhandari', 'adult', '1983-08-17', 'passport'], ['Kabir Bhandari', 'child', '2014-01-09', 'passport'], ['Myra Bhandari', 'child', '2018-06-21', 'passport']]],
    'BX-38377': ['2026-10-08', [['Deepak Purohit', 'adult', '1991-02-14', 'aadhaar'], ['Vikas Bhati', 'adult', '1990-09-05', 'aadhaar'], ['Rahul Joshi', 'adult', '1992-12-19', 'aadhaar'], ['Sandeep Parihar', 'adult', '1991-06-28', 'aadhaar']]],
    'BX-38301': ['2026-10-02', [['Nidhi Mathur', 'adult', '1992-02-11', 'passport'], ['Karan Mathur', 'adult', '1990-09-27', 'passport']]],
    'BX-38264': ['2026-09-27', [['Rajesh Soni', 'adult', '1971-08-22', 'aadhaar'], ['Sarla Soni', 'adult', '1974-01-30', 'aadhaar'], ['Mahesh Soni', 'adult', '1968-11-03', 'aadhaar'], ['Kanta Soni', 'adult', '1970-05-16', 'aadhaar'], ['Dinesh Soni', 'adult', '1976-02-08', 'aadhaar'], ['Rekha Soni', 'adult', '1979-10-12', 'aadhaar']]],
    'BX-38520': ['2026-10-23', [['Pooja Vyas', 'adult', '1993-07-04', 'aadhaar'], ['Nikhil Vyas', 'adult', '1991-03-18', 'aadhaar']]],
    'BX-38198': ['2026-10-05', [['Harish Tak', 'adult', '1978-04-26', 'aadhaar'], ['Sunita Tak', 'adult', '1981-09-09', 'aadhaar'], ['Kamla Devi Tak', 'adult', '1953-12-01', 'aadhaar'], ['Aarav Tak', 'child', '2016-08-15', null]]],
    'BX-38547': ['2026-10-21', [['Ankit Jain', 'adult', '1985-06-11', 'aadhaar'], ['Ramesh Choudhary', 'adult', '1979-02-23', 'aadhaar'], ['Suman Bothra', 'adult', '1988-10-07', 'aadhaar'], ['Vijay Singh Rathore', 'adult', '1975-12-15', 'aadhaar'], ['Neelam Mehta', 'adult', '1990-04-29', 'aadhaar'], ['Prakash Sharma', 'adult', '1983-07-19', 'aadhaar'], ['Kavita Gehlot', 'adult', '1992-01-05', 'aadhaar'], ['Sunil Bhati', 'adult', '1986-09-13', 'aadhaar'], ['Manoj Purohit', 'adult', '1981-03-27', 'aadhaar'], ['Priya Kachhawaha', 'adult', '1994-08-02', 'aadhaar'], ['Hemant Bohra', 'adult', '1987-11-21', 'aadhaar'], ['Lokesh Jangid', 'adult', '1989-05-10', 'aadhaar'], ['Ritu Mathur', 'adult', '1993-02-17', 'aadhaar'], ['Gajendra Singh', 'adult', '1977-06-30', 'aadhaar'], ['Shweta Lodha', 'adult', '1991-10-24', 'aadhaar'], ['Naresh Prajapat', 'adult', '1984-01-08', null], ['Anil Tanwar', 'adult', '1982-12-03', 'aadhaar'], ['Deepika Sankhla', 'adult', '1995-09-16', null]]],
  };
  const slug = (s) => s.toLowerCase().replace(/[^a-z]+/g, '-');
  const SIZE = { 'Rohan Agarwal': 220, 'Anita Agarwal': 214, 'Suresh Bhandari': 410, 'Anita Bhandari': 398, 'Kabir Bhandari': 402, 'Myra Bhandari': 395, 'Nidhi Mathur': 388, 'Karan Mathur': 391 };
  const out = {};
  Object.entries(T).forEach(([deal, [at, list]]) => {
    out[deal] = list.map(([name, type, dob, kind]) => ({ name, type, dob, id: kind ? { file: `${kind}-${slug(name)}.pdf`, kind: kind === 'aadhaar' ? 'Aadhaar' : 'Passport', size: `${SIZE[name] || (kind === 'passport' ? 380 : 200) + (name.length * 7) % 40} KB`, at } : null }));
  });
  return out;
})();
TN.travellersOf = (dealId) => TN.DATA.travellers[dealId] || [];
/** Age in full years on a date (both 'YYYY-MM-DD'). */
TN.ageOn = (dob, on) => { const [y, m, d] = dob.split('-').map(Number); const [Y, M, D] = on.split('-').map(Number); return Y - y - (M < m || (M === m && D < d) ? 1 : 0); };
/** The client (who booked): a person, or a company with its contact. */
TN.clientName = (cust) => (cust.business ? `${cust.name} (contact: ${cust.contact})` : cust.name);
