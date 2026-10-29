/* =====================================================================
   30-booknow.js · Book now: #/app/deals/:id/book (Agent C)
   The approved booking form (book-now-2026-10-26/booking-form-preview.html,
   owner-approved 26 Oct 2026), its markup and JS unchanged except:
   - its own shell (sidebar, top bar), the preview tag, the "Preview: Bitrix values"
     panel and toggle, the "Show changes" toggle and every data-fix marker removed;
   - its containers renamed (#bf-root wraps #bf-app, #bf-layer, #bf-dlg, #bf-toast) and
     every DOM lookup kept inside #bf-root, so nothing clashes with the shell;
   - the Bitrix values come from the Deal in TN.DATA (automatic filling is On);
   - submit, "Refresh from Bitrix now", the reported-payment send and the Bill To search
     do what the live CRM does (in memory), see the integration part at the end.
   Generated from the approved file; keep it that way when copying into the build.
   ===================================================================== */
(function () {

/* =====================================================================
   Icons (lucide paths)
   ===================================================================== */
const ICONS={
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  chevL:'<path d="m15 18-6-6 6-6"/>',
  chevD:'<path d="m6 9 6 6 6-6"/>',
  arrowL:'<path d="m12 19-7-7 7-7M19 12H5"/>',
  arrowR:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  check:'<path d="M20 6 9 17l-5-5"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  minus:'<path d="M5 12h14"/>',
  pencil:'<path d="M21.17 6.81a2.82 2.82 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5zM15 5l4 4"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  copy:'<rect x="8" y="8" width="14" height="14" rx="2"/><path d="M4 16a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/>',
  user:'<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  userPlus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  pin:'<path d="M20 10c0 5-5.54 10.19-7.4 11.8a1 1 0 0 1-1.2 0C9.54 20.19 4 15 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  plane:'<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  bed:'<path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4M12 4v6M2 18h20"/>',
  car:'<path d="m21 8-2 2-1.5-3.7A2 2 0 0 0 15.65 5H8.4a2 2 0 0 0-1.9 1.26L5 10 3 8M7 14h.01M17 14h.01"/><rect x="3" y="10" width="18" height="8" rx="2"/><path d="M5 18v2M19 18v2"/>',
  compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.8 5.41a2 2 0 0 1-1.27 1.27L7.76 16.24l1.8-5.41a2 2 0 0 1 1.27-1.27z"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M16 13H8M16 17H8M10 9H8"/>',
  shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
  alert:'<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
  ok:'<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  circle:'<circle cx="12" cy="12" r="10"/>',
  warn:'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01"/>',
  lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  image:'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
  clip:'<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
  more:'<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  refresh:'<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16M8 16H3v5"/>',
  next:'<path d="m15 10 5 5-5 5M4 4v7a4 4 0 0 0 4 4h12"/>',
  swap:'<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  upload:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  ext:'<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  house:'<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  inbox:'<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
  brief:'<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect x="2" y="6" width="20" height="14" rx="2"/>',
  map:'<path d="M14.1 5.55a2 2 0 0 0 1.79 0l3.66-1.83A1 1 0 0 1 21 4.62v12.76a1 1 0 0 1-.55.9l-4.55 2.27a2 2 0 0 1-1.79 0l-4.21-2.1a2 2 0 0 0-1.79 0l-3.66 1.83A1 1 0 0 1 3 19.38V6.62a1 1 0 0 1 .55-.9l4.55-2.27a2 2 0 0 1 1.79 0zM15 5.76v15M9 3.24v15"/>',
  list:'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  building:'<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01"/>',
  stamp:'<path d="M5 22h14M19.27 13.73A2.5 2.5 0 0 0 17.5 13h-11A2.5 2.5 0 0 0 4 15.5V17a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1.5c0-.66-.26-1.3-.73-1.77M14 13V8.5C14 7 15 7 15 5a3 3 0 0 0-6 0c0 2 1 2 1 3.5V13"/>',
  coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
  gear:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  eye:'<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>'
};
const ic=(n,cls='')=>`<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[n]||''}</svg>`;
function paintIcons(root=R()){if(!root)return;root.querySelectorAll('svg[data-i]').forEach(s=>{s.setAttribute('viewBox','0 0 24 24');s.innerHTML=ICONS[s.dataset.i];s.removeAttribute('data-i')})}

/* =====================================================================
   Real airports (IATA). Fix #3. The build uses the full airport list.
   ===================================================================== */
const AIRPORTS=`DEL|Delhi|Indira Gandhi International
BOM|Mumbai|Chhatrapati Shivaji Maharaj International
BLR|Bengaluru|Kempegowda International
MAA|Chennai|Chennai International
CCU|Kolkata|Netaji Subhas Chandra Bose International
HYD|Hyderabad|Rajiv Gandhi International
AMD|Ahmedabad|Sardar Vallabhbhai Patel International
COK|Kochi|Cochin International
GOI|Goa|Dabolim
GOX|Goa|Manohar International (Mopa)
JAI|Jaipur|Jaipur International
JDH|Jodhpur|Jodhpur
UDR|Udaipur|Maharana Pratap
PNQ|Pune|Pune
LKO|Lucknow|Chaudhary Charan Singh International
ATQ|Amritsar|Sri Guru Ram Dass Jee International
IXC|Chandigarh|Chandigarh International
SXR|Srinagar|Srinagar
IXL|Leh|Kushok Bakula Rimpochee
IXB|Bagdogra|Bagdogra
GAU|Guwahati|Lokpriya Gopinath Bordoloi International
IXZ|Port Blair|Veer Savarkar International
TRV|Thiruvananthapuram|Thiruvananthapuram International
IXE|Mangaluru|Mangaluru International
VNS|Varanasi|Lal Bahadur Shastri International
PAT|Patna|Jay Prakash Narayan
BBI|Bhubaneswar|Biju Patnaik International
IDR|Indore|Devi Ahilyabai Holkar
BDQ|Vadodara|Vadodara
STV|Surat|Surat
NAG|Nagpur|Dr. Babasaheb Ambedkar International
DED|Dehradun|Jolly Grant
IXJ|Jammu|Jammu
KUU|Kullu|Bhuntar
DHM|Dharamshala|Gaggal
BHO|Bhopal|Raja Bhoj
RPR|Raipur|Swami Vivekananda
VTZ|Visakhapatnam|Visakhapatnam
CJB|Coimbatore|Coimbatore International
IXM|Madurai|Madurai
IXR|Ranchi|Birsa Munda
RAJ|Rajkot|Rajkot International
DXB|Dubai|Dubai International
AUH|Abu Dhabi|Zayed International
SHJ|Sharjah|Sharjah International
DOH|Doha|Hamad International
MCT|Muscat|Muscat International
BAH|Bahrain|Bahrain International
KWI|Kuwait|Kuwait International
RUH|Riyadh|King Khalid International
JED|Jeddah|King Abdulaziz International
BKK|Bangkok|Suvarnabhumi
DMK|Bangkok|Don Mueang
HKT|Phuket|Phuket International
KBV|Krabi|Krabi International
USM|Koh Samui|Samui
CNX|Chiang Mai|Chiang Mai International
SIN|Singapore|Changi
KUL|Kuala Lumpur|Kuala Lumpur International
PEN|Penang|Penang International
LGK|Langkawi|Langkawi International
DPS|Bali (Denpasar)|Ngurah Rai International
CGK|Jakarta|Soekarno–Hatta International
MLE|Malé|Velana International
CMB|Colombo|Bandaranaike International
KTM|Kathmandu|Tribhuvan International
PBH|Paro|Paro International
DAC|Dhaka|Hazrat Shahjalal International
HKG|Hong Kong|Hong Kong International
SGN|Ho Chi Minh City|Tan Son Nhat International
HAN|Hanoi|Noi Bai International
DAD|Da Nang|Da Nang International
MNL|Manila|Ninoy Aquino International
NRT|Tokyo|Narita International
HND|Tokyo|Haneda
ICN|Seoul|Incheon International
PEK|Beijing|Capital International
PVG|Shanghai|Pudong International
SYD|Sydney|Kingsford Smith
MEL|Melbourne|Melbourne
BNE|Brisbane|Brisbane
PER|Perth|Perth
AKL|Auckland|Auckland
MRU|Mauritius|Sir Seewoosagur Ramgoolam International
SEZ|Seychelles (Mahé)|Seychelles International
NBO|Nairobi|Jomo Kenyatta International
JNB|Johannesburg|O. R. Tambo International
CPT|Cape Town|Cape Town International
CAI|Cairo|Cairo International
IST|Istanbul|Istanbul
SAW|Istanbul|Sabiha Gökçen International
GYD|Baku|Heydar Aliyev International
TBS|Tbilisi|Shota Rustaveli Tbilisi International
ALA|Almaty|Almaty International
EVN|Yerevan|Zvartnots International
LHR|London|Heathrow
LGW|London|Gatwick
CDG|Paris|Charles de Gaulle
FRA|Frankfurt|Frankfurt
MUC|Munich|Munich
ZRH|Zurich|Zurich
GVA|Geneva|Geneva
AMS|Amsterdam|Schiphol
FCO|Rome|Fiumicino
MXP|Milan|Malpensa
VCE|Venice|Marco Polo
BCN|Barcelona|El Prat
MAD|Madrid|Barajas
VIE|Vienna|Vienna International
PRG|Prague|Václav Havel
ATH|Athens|Athens International
LIS|Lisbon|Humberto Delgado
DUB|Dublin|Dublin
EDI|Edinburgh|Edinburgh
BRU|Brussels|Brussels
CPH|Copenhagen|Copenhagen
HEL|Helsinki|Helsinki-Vantaa
OSL|Oslo|Gardermoen
ARN|Stockholm|Arlanda
KEF|Reykjavík|Keflavík International
JFK|New York|John F. Kennedy International
EWR|New York (Newark)|Newark Liberty International
SFO|San Francisco|San Francisco International
LAX|Los Angeles|Los Angeles International
ORD|Chicago|O'Hare International
YYZ|Toronto|Pearson International
YVR|Vancouver|Vancouver International`.split('\n').map(l=>{const[c,city,name]=l.split('|');return{c,city,name}});
const airport=c=>AIRPORTS.find(a=>a.c===c);
function searchAirports(q){
  q=q.trim().toLowerCase(); if(!q) return [];
  const inBrackets=q.match(/\(([a-z]{3})\)/);            // "Jodhpur (JDH)" finds JDH
  if(inBrackets&&airport(inBrackets[1].toUpperCase())) return [airport(inBrackets[1].toUpperCase())];
  q=q.replace(/[()]/g,' ').replace(/\s+/g,' ').trim();
  const exact=AIRPORTS.filter(a=>a.c.toLowerCase()===q);
  const rest=AIRPORTS.filter(a=>a.c.toLowerCase()!==q&&(a.c.toLowerCase().startsWith(q)||a.city.toLowerCase().includes(q)||a.name.toLowerCase().includes(q)));
  return [...exact,...rest].slice(0,8);
}

/* =====================================================================
   Helpers
   ===================================================================== */
const R=()=>document.getElementById('bf-root');
const $=s=>{const r=R();return r?r.querySelector(s):null};
const $$=s=>{const r=R();return r?r.querySelectorAll(s):[]};
const byId=id=>$('#'+id);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmtD=d=>{if(!d)return'';const[y,m,dd]=d.split('-').map(Number);return`${dd} ${MON[m-1]} ${y}`};
const addDays=(d,n)=>{if(!d)return'';const t=new Date(d+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+Number(n));return t.toISOString().slice(0,10)};
const nightsBetween=(a,b)=>(!a||!b)?null:Math.round((new Date(b+'T00:00:00Z')-new Date(a+'T00:00:00Z'))/864e5);
const num=v=>v===''||v==null?null:Number(v);
const inr=n=>n==null||isNaN(n)?'':'₹'+Math.round(n).toLocaleString('en-IN');
const plural=(n,a,b)=>`${n} ${n===1?a:(b||a+'s')}`;

/* =====================================================================
   State (in memory only)
   ===================================================================== */
const freshState=()=>({
  step:1,
  bx:{on:false,name:'',phone:'',email:'',destination:'',start:'',end:'',trip:'',adults:'',children:'',infants:'',read:''},
  cust:{name:'',phone:'',email:'',destination:'',start:'',end:'',trip:'',adults:'',children:'',infants:'',confirmed:false},
  pax:[],                 // {id,type,name,files:[],copy}
  chosen:new Set(),       // selected service types
  svc:{hotel:[],car:[],flight:[],activity:[],visa:[],passport:[]},
  prices:{adult:{p:'',m:'',f:''},cbed:{q:'',p:'',m:'',f:''},cnob:{q:'',p:'',m:'',f:''},infant:{p:'',m:'',f:''}},
  bill:{mode:'none',type:'personal',name:'',contact:'',phone:'',email:'',addr:'',city:'',state:'',pin:'',gst:'',gstin:'',reason:''},
  plan:[],
  acceptance:null,
  claimOpen:false,
  save:{cust:'idle',pax:'idle',price:'idle',bill:'idle',plan:'idle'},
  why:{},
  fare:{A:'',C:'',I:''},  // fix #18: total fare per person (adult, child, infant), typed only when the flights have no fares
  version:1,returned:'',from:''
});
let S=freshState();
/* Effective counts: Bitrix value wins when it sends one (owner answer 1 b). */
function counts(){
  const pick=k=>S.bx.on&&S.bx[k]!==''?Number(S.bx[k]):(S.cust[k]===''?null:Number(S.cust[k]));
  const a=pick('adults'),c=pick('children')||0,i=pick('infants')||0;
  return{a,c,i,total:a==null?null:a+c+i,locked:S.bx.on&&S.bx.adults!==''};
}
const trip=()=>({dest:(S.bx.on&&S.bx.destination)||S.cust.destination,start:(S.bx.on&&S.bx.start)||S.cust.start,end:(S.bx.on&&S.bx.end)||S.cust.end,type:(S.bx.on&&S.bx.trip)||S.cust.trip});
const tripNights=()=>{const t=trip();return nightsBetween(t.start,t.end)};
const namedPax=()=>S.pax.filter(p=>p.name.trim());

/* Keep one passenger row per counted traveller (adults, then children, then infants). Named rows are never dropped. */
function syncPaxSlots(){
  const c=counts(); if(c.a==null) return;
  const want={Adult:c.a,Child:c.c,Infant:c.i};
  for(const t of ['Adult','Child','Infant']){
    let have=S.pax.filter(p=>p.type===t);
    while(have.length<want[t]){S.pax.push({id:uid(),type:t,name:'',files:[],copy:''});have=S.pax.filter(p=>p.type===t)}
    for(const p of have.slice(want[t]).reverse()) if(!p.name.trim()) S.pax.splice(S.pax.indexOf(p),1);
  }
  S.pax.sort((x,y)=>['Adult','Child','Infant'].indexOf(x.type)-['Adult','Child','Infant'].indexOf(y.type));
}

/* =====================================================================
   Checks (live CRM wording)
   ===================================================================== */
function custIssues(){
  const out=[],c=S.cust,t=trip(),n=counts();
  if(!c.name.trim()) out.push('Enter the customer name.');
  if(c.phone&&!/^[6-9]\d{9}$/.test(c.phone.replace(/\D/g,'').slice(-10))) out.push('Mobile number: 10 digits starting with 6 to 9.');
  if(c.email&&!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) out.push('Check the email address.');
  if(!c.phone&&!c.email) out.push('Enter a mobile number or email.');
  if(!t.dest) out.push('Enter the destination.');
  if(!t.start) out.push('Choose a valid travel date.');
  if(t.start&&t.end&&t.end<t.start) out.push('Return date must be on or after the travel date.');
  if(!t.type) out.push('Choose domestic or international.');
  if(n.a==null) out.push('Enter the number of adults.');
  else if(n.a<1) out.push('At least one adult travels.');
  if(!c.confirmed) out.push('Check the mobile or email with the customer, then tick the box.');
  return out;
}
function paxIssues(){
  const out=[];
  S.pax.forEach((p,i)=>{if(!p.name.trim()) out.push(`Passenger ${i+1}: full name as on the ID.`)});
  return out;
}
const FLIGHT_REQ=f=>f.mode==='shot'?(!f.files.length?'Attach at least one screenshot, or choose “Type the details”.':!f.pax.length?'Choose who flies.':''):!f.from?'Pick the departure airport from the list.':!f.to?'Pick the arrival airport from the list.':f.from===f.to?'Departure and arrival airports must differ.':!f.date?'Add the departure date.':(f.adate&&f.adate<f.date)?'Arrival date cannot be before departure.':!f.pax.length?'Choose who flies.':'';
const HOTEL_REQ=h=>!h.city.trim()?'Add the city.':!h.hotel.trim()?'Add the hotel name.':!h.checkin?'Add the check-in date.':!(Number(h.nights)>=1)?'Nights: 1 to 365.':!(Number(h.rooms)>=1)?'Add at least one room.':'';
const CAR_REQ=c=>!c.vehicle?'Choose the vehicle.':(c.kind==='full'&&!c.route.trim())?'Add the route.':(c.kind!=='full'&&(!c.pickup.trim()||!c.drop.trim()))?'Add pickup and drop.':!c.date?'Add the date.':'';
function svcIssues(){
  const out=[];
  if(!S.chosen.size) out.push('Add at least one service.');
  for(const k of S.chosen) if(!S.svc[k].length) out.push(`${LABEL[k].plural}: add one, or untick it.`);
  S.svc.flight.forEach((f,i)=>{if(f.mode!=='shot'&&(!f.no||!f.dep)) out.push(`Flight ${i+1}: add flight number and times (optional now, needed by the Flight team).`)});
  const cov=hotelCoverage(); if(S.chosen.has('hotel')&&cov&&cov.missing>0) out.push(`${cov.covered} of ${cov.nights} trip nights have a hotel. Add a hotel for the missing nights.`);
  return out;
}
function hotelCoverage(){
  const t=trip(),n=tripNights(); if(!t.start||!n) return null;
  const nightsSet=new Set();
  S.svc.hotel.forEach(h=>{for(let k=0;k<Number(h.nights||0);k++){const d=addDays(h.checkin,k); if(d>=t.start&&d<t.end) nightsSet.add(d)}});
  return{nights:n,covered:nightsSet.size,missing:n-nightsSet.size};
}
function priceLines(){
  const n=counts();
  const L=[{k:'adult',label:'Adult',q:n.a||0,ro:true}];
  if(n.c>0){L.push({k:'cbed',label:'Child with bed',q:num(S.prices.cbed.q)??0});L.push({k:'cnob',label:'Child without bed',q:num(S.prices.cnob.q)??0})}
  if(n.i>0) L.push({k:'infant',label:'Infant',q:n.i,ro:true});
  return L;
}
function priceState(){
  const n=counts(),L=priceLines();
  if(S.save.cust!=='saved') return{block:'Save step 1 first. Prices follow the saved traveller counts.',total:null};
  if(n.c>0&&(num(S.prices.cbed.q)||0)+(num(S.prices.cnob.q)||0)!==n.c) return{block:`Split all ${plural(n.c,'child','children')} into with bed or without bed.`,total:null};
  let total=0,missing=0;
  for(const l of L){ if(!l.q) continue; const f=num(S.prices[l.k].f); if(f==null) missing++; else total+=f*l.q; }
  return{block:'',total:missing?null:total,missing};
}

/* Auto-save (owner answer 2: yes). Each card saves itself a moment after typing stops. */
const timers={};
function autosave(key,issuesFn){
  markStarted();
  S.save[key]='saving'; S.why[key]=''; refreshLive();
  clearTimeout(timers[key]);
  timers[key]=setTimeout(()=>{
    const iss=issuesFn();
    S.save[key]=iss.length?'fix':'saved'; S.why[key]=iss[0]||'';
    if(key==='cust'&&!iss.length) syncPaxSlots();
    refreshLive(); if(key==='cust'&&!iss.length&&!document.activeElement?.closest('#bf-app')) render();
  },700);
}
function savePill(key,label){
  const st=S.save[key],why=S.why[key];
  const txt={idle:'Not started',saving:'Saving…',saved:'Saved',fix:'Not saved · needs a fix'}[st];
  return `<span class="save ${st}" id="pill-${key}" title="${esc(why)}"><span class="dot"></span>${txt}</span>`;
}

/* =====================================================================
   Page
   ===================================================================== */
const LABEL={
  hotel:{plural:'Hotels',one:'Hotel',icon:'bed',add:'Add hotel'},
  car:{plural:'Cars',one:'Car',icon:'car',add:'Add car'},
  flight:{plural:'Flights',one:'Flight',icon:'plane',add:'Add flight'},
  activity:{plural:'Activities',one:'Activity',icon:'compass',add:'Add activity'},
  visa:{plural:'Visa',one:'Visa',icon:'file',add:'Add visa details'},
  passport:{plural:'Passport',one:'Passport',icon:'shield',add:'Add passport details'}
};
function stepState(n){
  if(n===1){const a=custIssues().length+paxIssues().length; return a?'bad':'ok'}
  if(n===2){return svcIssues().filter(x=>!x.startsWith('Flight')).length?'bad':(svcIssues().length?'warn':'ok')}
  return readyItems().every(r=>r.done)?'ok':'bad';
}
function render(){
  const t=trip(),name=S.cust.name.trim();
  const left=readyItems().filter(r=>!r.done).length;
  const app=$('#bf-app');if(!app)return;
  app.innerHTML=`
    <a class="back" href="#/app/deals/${esc(S.dealId)}">${ic('chevL')}Back to the deal</a>
    <h1>Book now${name?' · '+esc(name):''}</h1>
    <div class="status-line">${statusLine()}</div>
    <div class="next-line">${left?`Next: finish ${plural(left,'thing')} (marked in the steps)`:'Next: review and submit (step 3)'}</div>
    ${returnedNote()}
    <nav class="steps" aria-label="Booking steps">
      ${['Customer & passengers','Trip & services','Price & Bill To'].map((l,i)=>{const st=stepState(i+1);return`<button class="step" type="button" data-go="${i+1}" ${S.step===i+1?'aria-current="step"':''}><span class="num">${i+1}</span>${l}<span class="st">${st==='bad'?ic('alert','c-bad'):st==='warn'?ic('warn','c-warn'):ic('ok','c-ok')}</span></button>`}).join('')}
    </nav>
    <div class="layout">
      <div class="stack">${S.step===1?step1():S.step===2?step2():step3()}</div>
      ${aside()}
    </div>
    ${footer()}`;
  bindPage();
}
function aside(){
  const t=trip(),n=counts(),ps=priceState();
  const cnt=Object.entries(S.svc).filter(([,v])=>v.length).map(([k,v])=>plural(v.length,LABEL[k].one.toLowerCase(),k==='activity'?'activities':undefined)).join(' · ');
  return`<aside class="card aside" id="aside"><h2>Booking summary</h2>
   <div class="s-item">${ic('pin')}<div>Destination<div class="s-val">${esc(t.dest)||'Not entered'}</div></div></div>
   <div class="s-item">${ic('cal')}<div>Travel date<div class="s-val">${t.start?fmtD(t.start)+(tripNights()!=null?' · '+plural(tripNights(),'night'):''):'Not entered'}</div></div></div>
   <div class="s-item">${ic('users')}<div>Passengers<div class="s-val">${n.total!=null?paxText(n):'Not entered'}</div></div></div>
   ${cnt?`<div class="s-item">${ic('compass')}<div>Services<div class="s-val">${cnt}</div></div></div>`:''}
   ${S.step===3?`<div class="s-item">${ic('receipt')}<div>Package selling total<div class="s-val">${ps.total!=null?inr(ps.total):'Not worked out yet'}</div></div></div>`:''}
  </aside>`;
}
const paxText=n=>`${plural(n.total,'traveller')} (${plural(n.a,'adult')}${n.c?', '+plural(n.c,'child','children'):''}${n.i?', '+plural(n.i,'infant'):''})`;

/* ---------- Step 1 ---------- */
function step1(){
  const c=S.cust,t=trip(),n=counts(),b=S.bx;
  const bxMark=k=>b.on&&b[k]?`<span class="from-bx">${ic('download')}From Bitrix</span>`:'';
  const lockedTrip=b.on&&(b.destination||b.start||b.adults!=='');
  const facts=lockedTrip?`
    <div class="facts">${ic('lock')}
      <div class="facts-main">
        <div class="facts-t">Trip facts from the Bitrix Deal</div>
        <div class="facts-chips">
          ${b.destination?`<span class="fchip">${ic('pin')}${esc(b.destination)}</span>`:''}
          ${b.start?`<span class="fchip">${ic('cal')}${fmtD(b.start)}${b.end?' – '+fmtD(b.end):''}${tripNights()!=null?' · '+plural(tripNights(),'night'):''}</span>`:''}
          ${b.adults!==''?`<span class="fchip">${ic('users')}${paxText(n)}</span>`:''}
          ${b.trip?`<span class="fchip">${b.trip}</span>`:''}
        </div>
        <div class="hint" style="margin-top:6px">Read from Bitrix ${esc(b.read)}. These are locked here so the booking always matches the Deal.</div>
      </div>
      <button class="btn link" type="button" id="openCorrect">${ic('pencil')}Correct</button>
    </div>`:'';
  const need=k=>!(b.on&&b[k]);
  const stepperRow=(k,l)=>b.on&&b[k]!==''?`<div class="f"><span class="lbl">${l}</span><div style="min-height:40px;display:flex;align-items:center;gap:6px"><b style="font-size:16px">${b[k]}</b><span class="hint">from the Deal</span></div></div>`:
   `<div class="f"><span class="lbl">${l}</span><div class="stepper"><button type="button" data-step="${k}" data-d="-1" aria-label="One fewer">${ic('minus')}</button><input class="in" inputmode="numeric" data-cust="${k}" value="${esc(c[k])}" aria-label="${l}"><button type="button" data-step="${k}" data-d="1" aria-label="One more">${ic('plus')}</button></div></div>`;
  return`
  <section class="card" id="sec-cust">
    <div class="card-h"><h3>${ic('user')}Customer & trip</h3><span class="grow"></span>${savePill('cust')}</div>
    <div class="card-b">
      ${facts}
      <div class="g3">
        <div class="f"><label for="c-name">Name ${bxMark('name')}</label><input class="in" id="c-name" data-cust="name" value="${esc(c.name)}" autocomplete="off"></div>
        <div class="f"><label for="c-phone">Phone ${bxMark('phone')}</label><input class="in" id="c-phone" type="tel" data-cust="phone" value="${esc(c.phone)}"></div>
        <div class="f"><label for="c-email">Email ${bxMark('email')}</label><input class="in" id="c-email" type="email" data-cust="email" value="${esc(c.email)}"></div>
      </div>
      ${(need('destination')||need('start')||need('end')||need('trip'))?`<div class="g4" style="margin-top:16px">
        ${need('destination')?`<div class="f"><label for="c-dest">Destination</label><input class="in" id="c-dest" data-cust="destination" value="${esc(c.destination)}"></div>`:''}
        ${need('start')?`<div class="f"><label for="c-start">Travel date</label><input class="in" id="c-start" type="date" data-cust="start" value="${esc(c.start)}"></div>`:''}
        ${need('end')?`<div class="f"><label for="c-end">Return date</label><input class="in" id="c-end" type="date" data-cust="end" value="${esc(c.end)}" min="${esc(t.start)}"></div>`:''}
        ${need('trip')?`<div class="f"><label for="c-trip">Trip</label><select class="in" id="c-trip" data-cust="trip"><option value="">Choose</option><option ${c.trip==='Domestic'?'selected':''}>Domestic</option><option ${c.trip==='International'?'selected':''}>International</option></select></div>`:''}
      </div>`:''}
      ${n.locked?'':`<div role="group" aria-labelledby="travLbl" style="margin:18px 0 0;border-top:1px solid var(--line);padding-top:16px">
        <div class="lbl" id="travLbl" style="margin-bottom:10px">Travellers</div>
        <div class="g3">${stepperRow('adults','Adults')}${stepperRow('children','Children')}${stepperRow('infants','Infants')}</div>
        <div class="hint" style="margin-top:8px">${n.total!=null?`Total: ${n.total}. A passenger row appears for each one below.`:'Set how many travel. A passenger row appears for each one below.'}</div>
      </div>`}
      <label class="check" style="margin-top:18px"><input type="checkbox" data-cust="confirmed" ${c.confirmed?'checked':''}><span><b style="color:var(--ink)">I confirmed the contact details with the customer</b><span class="hint" style="display:block">${b.on?'Ticking this also marks the mobile number and email from Bitrix as checked.':'Changing the phone or email asks again.'}</span></span></label>
      <div class="err" id="why-cust" style="margin-top:12px;${S.save.cust==='fix'?'':'display:none'}">${ic('alert')}<span>${esc(S.why.cust)}</span></div>
    </div>
  </section>
  ${paxCard()}`;
}
function paxCard(){
  const n=counts();
  if(n.a==null) return`<section class="card" id="sec-pax"><div class="card-h"><h3>${ic('users')}Passengers</h3></div><div class="empty">Set how many adults, children and infants travel. A row appears for each one.</div></section>`;
  const named=namedPax().length,needId=S.pax.filter(p=>p.type==='Adult'&&!p.files.length);
  return`<section class="card" id="sec-pax">
   <div class="card-h"><h3>${ic('users')}Passengers <span class="pill-count">${S.pax.length}</span></h3><span class="grow"></span><span class="hint" id="paxNamed">${named} of ${S.pax.length} named</span>${savePill('pax')}</div>
   ${S.pax.map((p,i)=>`<div class="pax">
      <span class="n">${i+1}</span>
      <div><input class="in" data-pax="${p.id}" placeholder="${p.type} · full name" value="${esc(p.name)}" aria-label="Passenger ${i+1} full name">
        <div class="idst">${p.files.length?`${ic('ok','c-ok')}<span>ID proof: ${plural(p.files.length,'file')}</span> ${copyState(p)}`:p.type==='Adult'?`${ic('alert','c-bad')}<span class="c-bad">ID proof needed</span>`:'<span class="c-q">No ID proof yet</span>'}</div></div>
      <span class="type hint">${p.type}</span>
      <div class="pax-actions"><button class="btn sec sm" type="button" data-id="${p.id}" ${p.name.trim()?'':'aria-disabled="true" title="Enter the name first"'}>${ic('clip')}Attach ID proof</button><button class="btn ghost sm" type="button" data-pd="${p.id}">${ic('more')}<span class="sr">Details</span></button></div>
   </div>`).join('')}
   <div class="pax-foot"><span>${needId.length?'ID proof still needed: '+needId.map(p=>esc(p.name)||'unnamed adult').join(', '):'All adults have ID proof.'}</span>
     ${n.locked?`<button class="btn link" type="button" id="morePax">Need another traveller?</button>`:''}</div>
  </section>`;
}
const copyState=p=>p.copy==='copying'?`<span class="copy-st c-q">${ic('clock')}Copying to Bitrix…</span>`:p.copy==='copied'?`<span class="copy-st c-ok">${ic('check')}Copied to the Bitrix Deal</span>`:p.copy==='failed'?`<span class="copy-st c-bad">${ic('alert')}Copy to Bitrix failed · <button class="btn link" type="button" data-retry="${p.id}">Retry</button></span>`:'';

/* ---------- Step 2 ---------- */
function step2(){
  const cov=hotelCoverage();
  return`
  <section class="card"><div class="card-b">
    <div class="lbl" style="margin-bottom:10px">Choose services</div>
    <div class="chips" role="group" aria-label="Choose services">
      ${Object.keys(LABEL).map(k=>`<button class="chip" type="button" data-chip="${k}" aria-pressed="${S.chosen.has(k)}">${ic(LABEL[k].icon)}${LABEL[k].plural}${S.chosen.has(k)?ic('check'):''}</button>`).join('')}
    </div>
    ${S.chosen.has('hotel')&&cov?`<div class="cover">${ic('bed')}${cov.covered} / ${cov.nights} trip nights have a hotel${cov.missing>0?` · <b class="c-warn">${cov.missing} missing</b>`:` · ${ic('check','c-ok')}all covered`}</div>`:''}
  </div></section>
  ${S.chosen.size?[...Object.keys(LABEL)].filter(k=>S.chosen.has(k)).map(svcCard).join(''):`<section class="card"><div class="empty" style="justify-content:center;flex-direction:column;min-height:140px">${ic('compass')}Choose the services this booking needs.</div></section>`}`;
}
function svcCard(k){
  const L=LABEL[k],rows=S.svc[k];
  const extra=k==='flight'&&rows.length?`<div class="svc-actions">
      <button class="btn sec sm" type="button" id="nextFlight">${ic('next')}Add next flight</button>
      ${rows.some(r=>r.isReturn)?'':`<button class="btn sec sm" type="button" id="returnFlights">${ic('swap')}Add return flights</button>`}
      <span class="hint" style="align-self:center">Next flight starts where the last one lands. Return flights reverse the outward ones.</span></div>
    ${fareBox()}`:'';
  return`<section class="card" id="sec-${k}">
   <div class="card-h"><h3>${ic(L.icon)}${L.plural} <span class="pill-count">${rows.length}</span></h3><span class="grow"></span>
     <button class="btn sec sm" type="button" data-add="${k}">${ic('plus')}${L.add}</button></div>
   ${rows.length?rows.map((r,i)=>rowHtml(k,r,i)).join(''):`<div class="empty">No ${L.plural.toLowerCase()} added yet.</div>`}
   ${extra}
  </section>`;
}
function rowHtml(k,r,i){
  const L=LABEL[k];let t='',m=[],flag='';
  if(k==='hotel'){t=`${esc(r.hotel)||'Hotel not named'} · ${esc(r.city)}`;m=[`${fmtD(r.checkin)} – ${fmtD(addDays(r.checkin,r.nights))}`,plural(Number(r.nights),'night'),[r.room,r.meal].filter(Boolean).join(' · ')||'Room details not set',roomsText(r),travText(r.pax),reqText(r.reqs,r.reqsFor)];const e=hotelCost(r);if(e!=null)m.push('Our cost '+inr(e))}
  if(k==='car'){t=`${r.qty} × ${esc(r.vehicle)} · ${CAR_KINDS[r.kind]}`;m=[r.kind==='full'?esc(r.route):`${esc(r.pickup)} to ${esc(r.drop)}`,fmtD(r.date)+(r.time?' · '+r.time:''),travText(r.pax)];if(r.rate)m.push('Our cost '+inr(r.rate*r.qty))}
  if(k==='flight'){
    if(r.mode==='shot'){t=`${ic('image')} From screenshot${r.note?' · '+esc(r.note):''}`;m=[plural(r.files.length,'screenshot'),travText(r.pax),reqText(r.prefs,r.prefsFor)]}
    else{const a=airport(r.from),b=airport(r.to);t=`${r.from} – ${r.to}`;m=[`${a?.city||''} to ${b?.city||''}`,fmtD(r.date),[r.airline,r.no,r.cabin!=='No preference'?r.cabin:''].filter(Boolean).join(' · '),r.dep?`${r.dep} – ${r.arr||'?'} (local)`:'',travText(r.pax),reqText(r.prefs,r.prefsFor)];if(!r.no||!r.dep)flag=`<div class="flag">${ic('warn')}Add flight number and times</div>`}
    const fp=fareTypes().filter(([k])=>r['fare'+k]).map(([k,l])=>`${l} ${inr(Number(r['fare'+k]))}`);if(fp.length)m.push('Fare per person: '+fp.join(' · '))}
  if(k==='activity'){t=esc(r.name);m=[esc(r.city),fmtD(r.date),travText(r.pax)]}
  if(k==='visa'){t=`${esc(r.country)} · ${esc(r.vtype)}`;m=['Planned travel '+fmtD(r.date),travText(r.pax)]}
  if(k==='passport'){t=`${esc(r.atype)} · ${esc(r.city)}`;m=[travText(r.pax)]}
  return`<div class="row"><div><div class="row-t"><span class="idx">${L.one} ${i+1}</span>${t}</div><div class="row-m">${m.filter(Boolean).map(x=>`<span>${x}</span>`).join('')}</div>${flag}</div>
   <div class="row-a"><button class="btn ghost icon" type="button" data-edit="${k}:${r.id}" aria-label="Edit">${ic('pencil')}</button>
   ${['hotel','flight','car'].includes(k)?`<button class="btn ghost icon" type="button" data-dup="${k}:${r.id}" aria-label="Copy">${ic('copy')}</button>`:''}
   <button class="btn ghost icon" type="button" data-del="${k}:${r.id}" aria-label="Remove">${ic('trash')}</button></div></div>`;
}
/* Requests show who they are for: "Vegetarian meal (Traveller A)". No name means everyone. */
const paxName=p=>p.name||`${p.type} (no name yet)`;
const reqText=(list,forMap)=>(list||[]).map(v=>{const w=forMap&&forMap[v],p=w&&w!=='all'&&S.pax.find(x=>x.id===w);return p?`${esc(v)} (${esc(paxName(p))})`:esc(v)}).join(', ');
/* Fix #18: fare per person on each flight (child and infant only when the trip has them); the total adds itself up. */
const fareTypes=()=>{const c=counts();return[['A','Adult'],...(c.c>0?[['C','Child']]:[]),...(c.i>0?[['I','Infant']]:[])]};
const TYPE_OF={A:'Adult',C:'Child',I:'Infant'};
const typeOn=(f,k)=>f.pax.some(id=>S.pax.find(p=>p.id===id)?.type===TYPE_OF[k]);
function fareTotal(k){
  const fl=S.svc.flight.filter(f=>typeOn(f,k)),has=f=>f['fare'+k]!==''&&f['fare'+k]!=null,priced=fl.filter(has);
  if(fl.length&&priced.length===fl.length)return{auto:true,v:priced.reduce((s,f)=>s+Number(f['fare'+k]),0)};
  return{auto:false,v:S.fare[k]===''?null:Number(S.fare[k]),missing:priced.length?fl.filter(f=>!has(f)).map(f=>S.svc.flight.indexOf(f)+1):[]};
}
const flyersOf=k=>new Set(S.svc.flight.flatMap(f=>f.pax).filter(id=>S.pax.find(p=>p.id===id)?.type===TYPE_OF[k])).size;
function fareLine(){
  const ps=fareTypes().map(([k,l])=>{const t=fareTotal(k),n=flyersOf(k);return t.v==null||!n?null:{l,n,v:t.v,sum:t.v*n}}).filter(Boolean);
  if(!ps.length)return'';
  return ps.map(p=>`${p.l}: ${inr(p.v)} × ${p.n} = ${inr(p.sum)}`).join('<br>')+`<br>All flights: <strong>${inr(ps.reduce((a,p)=>a+p.sum,0))}</strong>`;
}
function fareBox(){
  const ts=fareTypes().map(([k,l])=>[k,l,fareTotal(k)]),allAuto=ts.every(([,,t])=>t.auto),miss=ts.filter(([,,t])=>t.missing?.length);
  return`<div class="fare"><span class="lbl" style="flex-basis:100%">Total fare per person, all flights</span>
    ${ts.map(([k,l,t])=>`<div class="f"><label for="flFare${k}" style="font-weight:500">${l}</label>${t.auto?`<div class="in" id="flFare${k}" style="display:flex;align-items:center;background:#fff" aria-readonly="true">${inr(t.v)}</div>`:`<div class="money"><span>₹</span><input class="in" id="flFare${k}" data-fare="${k}" inputmode="decimal" value="${esc(S.fare[k])}"></div>`}</div>`).join('')}
    <div class="sum" id="flFareSum">${fareLine()}</div>
    <span class="hint">${allAuto?'Added up from the fare on each flight. Change a flight’s fare to change it.':'Fills itself once every flight has a fare. One ticket with a layover? Type its total here instead.'} Our cost estimate, not the customer price.</span>
    ${miss.length?`<span class="hint c-warn" style="flex-basis:100%">${miss.map(([,l,t])=>`${l}: flight ${t.missing.join(', ')} has no fare yet`).join(' · ')}.</span>`:''}</div>`;
}
const travText=ids=>{if(!ids)return'';const all=S.pax.length;return ids.length===all&&all?`All ${all} travellers`:plural(ids.length,'traveller')};
const roomsText=r=>[plural(Number(r.rooms||0),'room'),Number(r.extra)?plural(Number(r.extra),'extra bed'):'',Number(r.nobed)?Number(r.nobed)+' no bed':''].filter(Boolean).join(' · ');
const hotelCost=r=>{const parts=[[r.rooms,r.roomRate],[r.extra,r.extraRate],[r.nobed,r.nobedRate]].filter(([q])=>Number(q)>0);if(!parts.length||parts.some(([,p])=>p===''||p==null))return null;return Number(r.nights)*parts.reduce((s,[q,p])=>s+Number(q)*Number(p),0)};

/* ---------- Step 3 ---------- */
function readyItems(){
  const ps=priceState(),planTot=S.plan.reduce((s,x)=>s+(num(x.amount)||0),0);
  return[
    {k:'s1',label:'Customer & passengers',done:!custIssues().length&&!paxIssues().length,why:custIssues()[0]||paxIssues()[0]||'',go:1},
    {k:'id',label:'ID proof for adults',done:S.pax.length>0&&S.pax.filter(p=>p.type==='Adult').every(p=>p.files.length),why:'Attach ID proof on step 1',go:1},
    {k:'s2',label:'Trip & services',done:!svcIssues().filter(x=>!x.startsWith('Flight')).length,why:svcIssues()[0]||'',go:2},
    {k:'price',label:'Package price',done:S.save.price==='saved'&&ps.total!=null,why:ps.block||'Fill the final sale per person',target:'sec-price'},
    {k:'bill',label:'Bill To',done:S.save.bill==='saved',why:'Choose or add the customer to bill',target:'sec-bill'},
    {k:'plan',label:'Payment plan',done:S.plan.length>0&&ps.total!=null&&planTot===ps.total,why:'Instalments must add up to the total',target:'sec-plan'},
    {k:'ok',label:'Customer’s written OK',done:!!S.acceptance,why:'Upload the customer’s yes',target:'sec-ok'}
  ];
}
function step3(){
  const items=readyItems(),done=items.filter(x=>x.done).length;
  return`
  <section class="card ready" id="ready">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:10px"><b style="color:var(--ink);font-size:15px">${done===items.length?'Ready to submit':'Before you submit'}</b><span class="hint">${done} of ${items.length} done</span></div>
    <div class="bar"><i style="width:${Math.round(done/items.length*100)}%"></i></div>
    <div class="ready-list">${items.map(it=>`<button class="ready-item" type="button" data-ready="${it.go||''}" data-target="${it.target||''}">${it.done?ic('ok','c-ok'):ic('circle','c-q')}<span><span class="lbl2">${it.label}</span>${it.done?'':`<span class="why"> · ${esc(it.why)}</span>`}</span></button>`).join('')}</div>
  </section>
  ${priceCard()}${billCard()}${planCard()}${okCard()}${claimCard()}${reviewCard()}${submitCard(items)}`;
}
function priceCard(){
  const L=priceLines(),ps=priceState(),n=counts();
  const cell=(k,f,l)=>`<td data-m="${l}"><div class="money"><span>₹</span><input class="in" inputmode="decimal" data-price="${k}.${f}" value="${esc(S.prices[k][f])}" aria-label="${l}" ${ps.block&&S.save.cust!=='saved'?'disabled':''}></div></td>`;
  return`<section class="card" id="sec-price">
   <div class="card-h"><h3>${ic('receipt')}Package price</h3><span class="grow"></span>${savePill('price')}</div>
   <div class="card-b">
    ${ps.block?`<div class="note bad" style="margin-bottom:14px">${ic('alert')}<div><b>Prices are not saved.</b> ${esc(ps.block)} <button class="btn link" type="button" data-go="1">Fix in step 1</button></div></div>`:''}
    <table class="ptable"><thead><tr><th>Passenger</th><th>People</th><th>Purchase / person</th><th>Markup / person</th><th>Final sale / person</th></tr></thead><tbody>
    ${L.map(l=>`<tr><td>${l.label}</td><td data-m="People">${l.ro?`<input class="in" readonly value="${l.q}" style="width:64px" aria-label="People">`:`<input class="in" inputmode="numeric" data-price="${l.k}.q" value="${esc(S.prices[l.k].q)}" style="width:64px" aria-label="People">`}</td>${cell(l.k,'p','Purchase')}${cell(l.k,'m','Markup')}${cell(l.k,'f','Final sale')}</tr>`).join('')}
    </tbody></table>
    <div class="ptot"><span class="hint">${n.total!=null?`${n.total} / ${n.total} passengers`:''}</span><div><span class="hint">Package selling total</span><strong id="pTotal">${ps.total!=null?inr(ps.total):'Not worked out yet'}</strong><div class="draft" id="pDraft">${S.save.price==='saved'||ps.total==null?'':'Working out, not saved yet'}</div></div></div>
    <p class="hint" style="margin:12px 0 0">Purchase, Flight and the Visa desk never see these prices. No tax is calculated here.</p>
   </div></section>`;
}
function billCard(){
  const b=S.bill;
  const fields=b.mode==='form'?`
    <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:14px 0">
      <div class="seg" role="radiogroup" aria-label="Customer type">${['personal','business'].map(t=>`<button type="button" role="radio" aria-checked="${b.type===t}" data-btype="${t}">${t==='personal'?'Personal':'Business'}</button>`).join('')}</div>
      ${b.type==='personal'?`<button class="btn link" type="button" id="useContact">Use booking contact</button>`:''}</div>
    <div class="g2">
      <div class="f"><label>${b.type==='personal'?'Full name':'Company name'}</label><input class="in" data-bill="name" value="${esc(b.name)}"></div>
      ${b.type==='business'?`<div class="f"><label>Contact name</label><input class="in" data-bill="contact" value="${esc(b.contact)}"></div>`:''}
      <div class="f"><label>Phone</label><input class="in" type="tel" data-bill="phone" value="${esc(b.phone)}"></div>
      <div class="f"><label>Email <span class="opt">(optional)</span></label><input class="in" type="email" data-bill="email" value="${esc(b.email)}"></div>
      <div class="f full"><label>Address</label><input class="in" data-bill="addr" value="${esc(b.addr)}"></div>
      <div class="f"><label>City</label><input class="in" data-bill="city" value="${esc(b.city)}"></div>
      <div class="f"><label>State</label><input class="in" data-bill="state" value="${esc(b.state)}" placeholder="Choose the state"></div>
      <div class="f"><label>PIN code</label><input class="in" inputmode="numeric" data-bill="pin" value="${esc(b.pin)}"></div>
      ${b.type==='business'?`<div class="f"><label>GST registration</label><select class="in" data-bill="gst"><option value="">Choose</option><option ${b.gst==='GST registered'?'selected':''}>GST registered</option><option ${b.gst==='Not GST registered'?'selected':''}>Not GST registered</option></select></div>
      ${b.gst==='GST registered'?`<div class="f"><label>GSTIN</label><input class="in" data-bill="gstin" value="${esc(b.gstin)}"><span class="hint">Accounts checks it. The CRM checks the format only.</span></div>`:''}
      ${b.gst==='Not GST registered'?`<div class="f full"><label>Reason for no GSTIN</label><input class="in" data-bill="reason" value="${esc(b.reason)}"></div>`:''}`:''}
    </div>`:'';
  return`<section class="card" id="sec-bill">
   <div class="card-h"><h3>${ic('user')}Bill To</h3><span class="hint">· Waits for Accounts check</span><span class="grow"></span>${savePill('bill')}</div>
   <div class="card-b">
    <div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
      <div class="f" style="flex:1;min-width:220px"><label for="billFind">Find customer</label><div class="money"><span>${ic('search')}</span><input class="in" id="billFind" placeholder="Name, company, phone or GSTIN" autocomplete="off"></div>
      <span class="hint" id="billFindHint">Type 2 letters.</span></div>
      <button class="btn sec" type="button" id="billAdd">${ic('userPlus')}Add customer</button>
    </div>
    ${b.mode==='none'?`<p class="hint" style="margin:12px 0 0">No customer chosen yet. <button class="btn link" type="button" id="billType">Type the details instead</button></p>`:fields}
    <p class="hint" style="margin:12px 0 0">Accounts checks billing details before use.</p>
    <div class="err" id="why-bill" style="margin-top:8px;${S.save.bill==='fix'?'':'display:none'}">${ic('alert')}<span>${esc(S.why.bill)}</span></div>
   </div></section>`;
}
function planCard(){
  const ps=priceState(),tot=S.plan.reduce((s,x)=>s+(num(x.amount)||0),0);
  const diff=ps.total!=null?tot-ps.total:null;
  return`<section class="card" id="sec-plan">
   <div class="card-h"><h3>${ic('cal')}Payment plan</h3><span class="grow"></span>${savePill('plan')}</div>
   <div class="card-b">
    <p class="hint" style="margin:0 0 14px">When the customer will pay. Instalments must add up to the final total. No advance is required. A plan is not money received.</p>
    ${S.plan.map((x,i)=>`<div class="inst"><div class="f"><label>Instalment ${i+1}</label><input class="in" data-plan="${i}.label" value="${esc(x.label)}"></div>
      <div class="f"><label>Amount ₹</label><div class="money"><span>₹</span><input class="in" inputmode="decimal" data-plan="${i}.amount" value="${esc(x.amount)}"></div></div>
      <div class="f"><label>Due date</label><input class="in" type="date" data-plan="${i}.due" value="${esc(x.due)}"></div>
      <button class="btn ghost icon rm" type="button" data-planrm="${i}" aria-label="Remove instalment ${i+1}">${ic('trash')}</button></div>`).join('')}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="btn sec sm" type="button" id="planAdd">${ic('plus')}Add instalment</button>
      ${ps.total!=null?`<button class="btn sec sm" type="button" id="planFull">Use the full total as one instalment</button>`:''}</div>
    <div class="sumrow" id="planSum"><span>Plan total</span><b>${inr(tot)||'₹0'} ${ps.total==null?'of a total not worked out yet':diff===0?`of ${inr(ps.total)} · matches the total`:`of ${inr(ps.total)} · ${diff>0?'more':'less'} than the total by ${inr(Math.abs(diff))}`}</b></div>
   </div></section>`;
}
function okCard(){
  return`<section class="card" id="sec-ok">
   <div class="card-h"><h3>${ic('file')}Customer’s written OK for this version</h3><span class="grow"></span>${S.acceptance?`<span class="save saved"><span class="dot"></span>Stored</span>`:''}</div>
   <div class="card-b">
    <p class="hint" style="margin:0 0 12px">A Bitrix stage is not proof. If you change anything after uploading, upload a new OK.</p>
    ${S.acceptance?`<div class="file"><span>${ic('file')} ${esc(S.acceptance)} · Stored</span><button class="btn link" type="button" id="okRm">Remove</button></div>`:
    `<div class="upload"><label class="lbl" for="okFile">Acceptance file</label><input type="file" id="okFile" accept=".pdf,.jpg,.jpeg,.png,.webp"><span class="hint">Screenshot or PDF of the customer saying yes. PDF, JPG, PNG or WebP, up to 4 MB.</span></div>`}
   </div></section>`;
}
function claimCard(){
  return`<details class="card" id="sec-claim" ${S.claimOpen?'open':''} style="padding:0">
   <summary style="padding:16px 20px;cursor:pointer;font-weight:600;color:var(--ink)">Payment already received? <span class="opt">(optional)</span></summary>
   <div class="card-b" style="border-top:1px solid var(--line)">
    <div class="note info" style="margin-bottom:14px">${ic('alert')}<div>Reported by Sales. Not money until a receipt is recorded and checked by a second Accounts person. A Bitrix stage does not prove payment.</div></div>
    <div class="g3"><div class="f"><label>How they paid</label><select class="in"><option>Bank transfer</option><option>UPI</option><option>Cash</option><option>Cheque</option></select></div>
    <div class="f"><label>Amount ₹</label><div class="money"><span>₹</span><input class="in" inputmode="decimal"></div></div><div class="f"><label>Paid on</label><input class="in" type="date"></div>
    <div class="f"><label>Paid by</label><input class="in"></div><div class="f"><label>Reference or UTR</label><input class="in"><span class="hint">Identifies the payment. It is not proof that money arrived.</span></div>
    <div class="f"><label>Company account that received it</label><input class="in"></div></div>
    <button class="btn sec" type="button" style="margin-top:14px" id="claimSend">Send to Accounts</button>
   </div></details>`;
}
function reviewCard(){
  const t=trip(),n=counts();
  const svc=Object.entries(S.svc).filter(([,v])=>v.length).map(([k,v])=>`<li>${LABEL[k].plural}: ${v.length}</li>`).join('');
  return`<details class="card" style="padding:0"><summary style="padding:16px 20px;cursor:pointer;font-weight:600;color:var(--ink)">Review trip and services</summary>
   <div class="card-b" style="border-top:1px solid var(--line)"><div class="g2">
    <div><b>Customer</b><div class="hint">${esc(S.cust.name)||'—'} · ${esc(S.cust.phone||S.cust.email)||'—'}</div><div class="hint">${esc(t.dest)||'—'} · ${t.start?fmtD(t.start):'—'}${t.end?' – '+fmtD(t.end):''}</div><div class="hint">${n.total!=null?paxText(n):'—'}</div><button class="btn link" type="button" data-go="1" style="margin-top:6px">${ic('pencil')}Edit</button></div>
    <div><b>Services</b><ul class="hint" style="margin:4px 0;padding-left:18px">${svc||'<li>No services added.</li>'}</ul><button class="btn link" type="button" data-go="2">${ic('pencil')}Edit</button></div>
   </div></div></details>`;
}
function submitCard(items){
  const left=items.filter(x=>!x.done).length;
  return`<section class="card submit-box">
   <div class="note info">${ic('alert')}<div>Submitting locks this version and creates one task per service.</div></div>
   <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><button class="btn pri lg" type="button" id="submitBtn" ${left?'aria-disabled="true"':''}>Submit booking and create tasks</button>
   ${left?`<span class="hint">Finish ${plural(left,'thing')} first (see the list at the top).</span>`:''}</div>
  </section>`;
}

/* ---------- Footer ---------- */
function footer(){
  const unsaved=Object.entries(S.save).filter(([,v])=>v==='saving'||v==='fix');
  const names={cust:'Customer & trip',pax:'Passengers',price:'Package price',bill:'Bill To',plan:'Payment plan'};
  const fixes=Object.entries(S.save).filter(([,v])=>v==='fix');
  const msg=fixes.length?`Not saved: ${fixes.map(([k])=>names[k]).join(', ')} · <a data-gofix="${fixes[0][0]}">Go to fix</a>`:unsaved.length?'Saving…':'All changes saved';
  return`<div class="foot" id="foot"><div class="msg" id="footMsg">Step ${S.step} of 3 · ${msg}</div><div class="foot-b">
   ${S.step>1?`<button class="btn sec lg" type="button" data-go="${S.step-1}">${ic('arrowL')}Back</button>`:''}
   ${S.step<3?`<button class="btn pri lg" type="button" data-go="${S.step+1}">Go to step ${S.step+1}${ic('arrowR')}</button>`:`<button class="btn pri lg" type="button" id="footSubmit">Review and submit</button>`}
  </div></div>`;
}

/* Update only the live bits, so typing never loses focus. */
function refreshLive(){
  for(const k of Object.keys(S.save)){const el=byId('pill-'+k);if(el){el.outerHTML=savePill(k)}}
  for(const k of ['cust','bill']){const el=byId('why-'+k);if(el){el.style.display=S.save[k]==='fix'?'':'none';el.querySelector('span').textContent=S.why[k]||''}}
  const f=byId('foot');if(f){f.outerHTML=footer();bindFooter()}
  const a=byId('aside');if(a){a.outerHTML=aside()}
  if(S.step===3){
    const ps=priceState(),tt=byId('pTotal');if(tt)tt.textContent=ps.total!=null?inr(ps.total):'Not worked out yet';
    const d=byId('pDraft');if(d)d.textContent=S.save.price==='saved'||ps.total==null?'':'Working out, not saved yet';
  }
  const rd=byId('ready');
  if(rd){const tmp=document.createElement('div');tmp.innerHTML=step3();rd.replaceWith(tmp.querySelector('#ready'));bindReady()}
  syncSubmit();
  const nl=$('.next-line');if(nl){const left=readyItems().filter(r=>!r.done).length;nl.textContent=left?`Next: finish ${plural(left,'thing')} (marked in the steps)`:'Next: review and submit (step 3)'}
  $$('.step').forEach((b,i)=>{const st=stepState(i+1);b.querySelector('.st').innerHTML=st==='bad'?ic('alert','c-bad'):st==='warn'?ic('warn','c-warn'):ic('ok','c-ok')});
}

/* =====================================================================
   Page events
   ===================================================================== */
function bindFooter(){
  $$('#foot [data-go]').forEach(b=>b.onclick=()=>go(Number(b.dataset.go)));
  const g=$('#foot [data-gofix]');if(g)g.onclick=()=>{const k=g.dataset.gofix;const step=k==='cust'||k==='pax'?1:3;go(step,'sec-'+k)};
  const fs=byId('footSubmit');if(fs)fs.onclick=()=>byId('ready').scrollIntoView({behavior:'smooth'});
}
function go(n,target){S.step=n;render();window.scrollTo(0,0);if(target)setTimeout(()=>byId(target)?.scrollIntoView({behavior:'smooth',block:'start'}),50)}
function bindPage(){
  $$('#bf-app [data-go]').forEach(b=>b.onclick=()=>go(Number(b.dataset.go)));
  bindFooter();
  // step 1 customer
  $$('[data-cust]').forEach(i=>{
    const k=i.dataset.cust;
    const ev=i.type==='checkbox'||i.tagName==='SELECT'||i.type==='date'?'onchange':'oninput';
    i[ev]=()=>{S.cust[k]=i.type==='checkbox'?i.checked:i.value;
      if((k==='phone'||k==='email')&&S.cust.confirmed&&i.type!=='checkbox'){S.cust.confirmed=false;const cb=$('[data-cust=confirmed]');if(cb)cb.checked=false}
      autosave('cust',custIssues);
      if(['adults','children','infants','start','end','trip','destination'].includes(k)||i.type==='checkbox'){clearTimeout(timers.r);timers.r=setTimeout(()=>{if(S.save.cust!=='saving'){syncPaxSlots();render()}},900)}
    };
  });
  $$('[data-step]').forEach(b=>b.onclick=()=>{const k=b.dataset.step;const v=Math.max(0,Math.min(100,(Number(S.cust[k])||0)+Number(b.dataset.d)));S.cust[k]=String(v);syncPaxSlots();autosave('cust',custIssues);render()});
  $$('[data-pax]').forEach(i=>i.oninput=()=>{const p=S.pax.find(x=>x.id===i.dataset.pax);p.name=i.value;
    const b=$(`[data-id="${p.id}"]`);if(p.name.trim())b.removeAttribute('aria-disabled');else b.setAttribute('aria-disabled','true');
    const n=byId('paxNamed');if(n)n.textContent=`${namedPax().length} of ${S.pax.length} named`;
    autosave('pax',paxIssues)});
  $$('[data-id]').forEach(b=>b.onclick=()=>{if(b.getAttribute('aria-disabled')==='true'){toast('Enter the name first, then attach the ID proof.');return}openIdProof(b.dataset.id)});
  $$('[data-pd]').forEach(b=>b.onclick=()=>openPaxDrawer(b.dataset.pd));
  $$('[data-retry]').forEach(b=>b.onclick=()=>{const p=S.pax.find(x=>x.id===b.dataset.retry);fakeCopy(p)});
  const oc=$('#openCorrect');if(oc)oc.onclick=openCorrect;
  const mp=$('#morePax');if(mp)mp.onclick=openCorrect;
  // step 2
  $$('[data-chip]').forEach(b=>b.onclick=()=>{const k=b.dataset.chip;if(S.chosen.has(k)){if(S.svc[k].length){toast('Remove saved rows before hiding this service.');return}S.chosen.delete(k)}else S.chosen.add(k);render()});
  $$('[data-add]').forEach(b=>b.onclick=()=>openEditor(b.dataset.add));
  $$('[data-edit]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.edit.split(':');openEditor(k,S.svc[k].find(r=>r.id===id))});
  $$('[data-dup]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.dup.split(':');const r=S.svc[k].find(x=>x.id===id);openEditor(k,{...structuredClone(r),id:null},true)});
  $$('[data-del]').forEach(b=>b.onclick=()=>{const[k,id]=b.dataset.del.split(':');confirmDlg(`Remove this ${LABEL[k].one.toLowerCase()}?`,'It is removed from this booking draft now. Nothing is booked or cancelled with a supplier.','Remove',()=>{S.svc[k]=S.svc[k].filter(r=>r.id!==id);render();toast('Service removed.')},'Keep it')});
  const nf=$('#nextFlight');if(nf)nf.onclick=()=>{const last=S.svc.flight[S.svc.flight.length-1];if(last.mode==='shot'){openEditor('flight',{...emptyFlight(),isReturn:last.isReturn,pax:[...last.pax]});return}openEditor('flight',{...emptyFlight(),from:last.to,date:last.adate||last.date,airline:last.airline,cabin:last.cabin,pax:[...last.pax],isReturn:last.isReturn},true,'Next flight: starts where flight '+S.svc.flight.length+' lands. Check the date.')};
  const rf=$('#returnFlights');if(rf)rf.onclick=addReturnFlights;
  $$('[data-fare]').forEach(ff=>ff.oninput=()=>{S.fare[ff.dataset.fare]=ff.value.replace(/[^\d.]/g,'');$('#flFareSum').innerHTML=fareLine()});
  // step 3
  bindReady();
  $$('[data-price]').forEach(i=>i.oninput=()=>{const[k,f]=i.dataset.price.split('.');S.prices[k][f]=i.value;
    const P=S.prices[k];  // purchase + markup = final sale (live rules)
    if(f==='p'||f==='m'){if(P.p!==''&&P.m!==''){P.f=String(Number(P.p)+Number(P.m));const o=$(`[data-price="${k}.f"]`);if(o)o.value=P.f}}
    if(f==='f'&&P.p!==''){P.m=String(Number(P.f)-Number(P.p));const o=$(`[data-price="${k}.m"]`);if(o)o.value=P.m}
    autosave('price',()=>{const ps=priceState();return ps.block?[ps.block]:[]});
  });
  $$('[data-btype]').forEach(b=>b.onclick=()=>{S.bill.type=b.dataset.btype;render()});
  const bt=$('#billType');if(bt)bt.onclick=()=>{S.bill.mode='form';render()};
  const ba=$('#billAdd');if(ba)ba.onclick=()=>{S.bill.mode='form';render();toast('Add the customer here. It is saved to the customer list as Not checked.')};
  const bf=$('#billFind');if(bf)bindBillFind(bf);
  const cs=$('#claimSend');if(cs)cs.onclick=sendClaim;
  const uc=$('#useContact');if(uc)uc.onclick=()=>{Object.assign(S.bill,{name:S.cust.name,phone:S.cust.phone,email:S.cust.email});render();autosave('bill',billIssues)};
  $$('[data-bill]').forEach(i=>i[i.tagName==='SELECT'?'onchange':'oninput']=()=>{S.bill[i.dataset.bill]=i.value;if(i.tagName==='SELECT')render();autosave('bill',billIssues)});
  $$('[data-plan]').forEach(i=>i.oninput=()=>{const[x,f]=i.dataset.plan.split('.');S.plan[x][f]=i.value;autosave('plan',()=>[]);const s=$('#planSum');if(s){const tmp=document.createElement('div');tmp.innerHTML=planCard();s.replaceWith(tmp.querySelector('#planSum'))}});
  $$('[data-planrm]').forEach(b=>b.onclick=()=>{S.plan.splice(Number(b.dataset.planrm),1);autosave('plan',()=>[]);render()});
  const pa=$('#planAdd');if(pa)pa.onclick=()=>{S.plan.push({label:S.plan.length?'Balance':'Advance',amount:'',due:''});render()};
  const pf=$('#planFull');if(pf)pf.onclick=()=>{S.plan=[{label:'Full payment',amount:String(priceState().total),due:''}];autosave('plan',()=>[]);render()};
  const of=$('#okFile');if(of)of.onchange=()=>{if(of.files[0]){S.acceptance=of.files[0].name;render();toast('Acceptance proof stored for this version.')}};
  const orm=$('#okRm');if(orm)orm.onclick=()=>{S.acceptance=null;render()};
  const sb=$('#submitBtn');if(sb)sb.onclick=()=>{if(sb.getAttribute('aria-disabled')==='true'){byId('ready').scrollIntoView({behavior:'smooth'});return}
    confirmDlg('Submit this booking and create tasks?','This freezes version '+S.version+' as the accepted version. It creates one internal task per sold service. It does not book anything, pay anyone, contact the customer, raise an invoice or change Bitrix.','Submit booking and create tasks',submitBooking,'Go back')};
  paintIcons(R());
}
function bindReady(){$$('[data-ready]').forEach(b=>b.onclick=()=>{if(b.dataset.ready)go(Number(b.dataset.ready));else byId(b.dataset.target)?.scrollIntoView({behavior:'smooth',block:'start'})})}
function billIssues(){
  const b=S.bill,o=[];
  if(!b.name.trim())o.push('Enter the Bill To name.');
  if(b.type==='business'&&!b.contact.trim())o.push('Add the contact name at the business.');
  if(!b.phone.trim())o.push('Check the billing phone number.');
  if(!b.addr.trim())o.push('Add the billing address.');
  if(!b.city.trim())o.push('Add the city.');
  if(!b.state.trim())o.push('Choose the state.');
  if(!/^[1-9]\d{5}$/.test(b.pin))o.push('Enter a six-digit PIN code that does not start with 0.');
  if(b.type==='business'&&!b.gst)o.push('Choose whether the business is GST registered.');
  return o;
}

/* =====================================================================
   Dialogs
   ===================================================================== */
function dlg(html,bind){$('#bf-dlg').innerHTML=`<div class="dlg-scrim"><div class="dlg" role="dialog" aria-modal="true">${html}</div></div>`;paintIcons($('#bf-dlg'));const s=$('#bf-dlg .dlg-scrim');s.onclick=e=>{if(e.target===s)closeDlg()};bind&&bind();$('#bf-dlg .dlg button')?.focus()}
const closeDlg=()=>$('#bf-dlg').innerHTML='';
function confirmDlg(title,body,ok,fn,cancel='Cancel'){dlg(`<h2>${esc(title)}</h2><p class="hint" style="margin:0">${esc(body)}</p><div class="dlg-f"><button class="btn sec" type="button" id="dNo">${esc(cancel)}</button><button class="btn ${ok==='Remove'?'danger':'pri'}" type="button" id="dYes">${esc(ok)}</button></div>`,()=>{$('#dNo').onclick=closeDlg;$('#dYes').onclick=()=>{closeDlg();fn()}})}
/* Fix #1 (owner answer 1 b): counts change only in Bitrix; staff can pull the new values at once. */
function openCorrect(){
  dlg(`<h2>Correct trip details in Bitrix</h2>
   <p style="margin:0">Dates, destination and the number of travellers come from the Bitrix Deal. They change only there, so the booking and the Deal never disagree.</p>
   <ol style="margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px">
     <li>Open the Deal in Bitrix and change the wrong value (for example, travellers from 1 to 2).</li>
     <li>Come back here and press <b>Refresh from Bitrix now</b>. The new values show at once; no waiting for the next update.</li>
   </ol>
   <div class="note lock">${ic('lock')}<div>Names you already typed stay. A new passenger row appears for each extra traveller.</div></div>
   <div class="dlg-f"><a class="btn sec" href="#" onclick="return false">${ic('ext')}Open the Deal in Bitrix</a><button class="btn pri" type="button" id="dRefresh">${ic('refresh')}Refresh from Bitrix now</button></div>`,
  ()=>{$('#dRefresh').onclick=()=>{closeDlg();refreshFromBitrix()}});
}
/* Fix #10: say where the ID goes before upload; show the copy state after. */
function openIdProof(id){
  const p=S.pax.find(x=>x.id===id);
  dlg(`<h2>ID proof · ${esc(p.name)}</h2>
   <div class="note lock">${ic('lock')}<div>Private. Opened only by staff working on this booking; each view is recorded.</div></div>
   <div class="note info">${ic('upload')}<div><b>This file is also copied to the Bitrix Deal</b>, in the Deal’s ID proof field. Bitrix keeps its own copy.</div></div>
   ${p.files.map((f,i)=>`<div class="file"><span>${ic('file')} ${esc(f)}</span><button class="btn link" type="button" data-frm="${i}">Remove</button></div>`).join('')}
   <div class="upload"><label class="lbl" for="idFile">ID proof file</label><input type="file" id="idFile" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple>
     <span class="hint">PDF, JPG, PNG or WebP, up to 4 MB each. ${4-p.files.length} of 4 files left. Front and back can be separate files.</span>
     <label class="check"><input type="checkbox" id="idAgree"><span>Customer agreed to share this ID for this booking</span></label>
     <div class="err" id="idErr" style="display:none">${ic('alert')}<span></span></div></div>
   <div class="dlg-f"><button class="btn sec" type="button" id="dNo">Done</button><button class="btn pri" type="button" id="idGo">${ic('clip')}Attach ID proof for ${esc(p.name)}</button></div>`,
  ()=>{$('#dNo').onclick=closeDlg;
    $$('[data-frm]').forEach(b=>b.onclick=()=>{p.files.splice(Number(b.dataset.frm),1);openIdProof(id);render()});
    $('#idGo').onclick=()=>{const f=$('#idFile').files,e=$('#idErr');
      if(!$('#idAgree').checked){e.style.display='';e.querySelector('span').textContent='Tick the customer’s agreement first. Nothing was uploaded.';return}
      if(!f.length){e.style.display='';e.querySelector('span').textContent='Choose the ID proof file first. Nothing was uploaded.';return}
      for(const x of f) p.files.push(x.name);closeDlg();fakeCopy(p);render();toast('Identity proof attached. Only the people who need it can open it.')}});
}
function fakeCopy(p){p.copy='copying';render();setTimeout(()=>{p.copy='copied';if(S.step===1)render()},1600)}
function openPaxDrawer(id){
  const p=S.pax.find(x=>x.id===id),reqs=[...(p.reqs||[])];
  drawer(`Passenger details`,'',`
    <div class="g2"><div class="f"><label>Full name</label><input class="in" id="pdName" value="${esc(p.name)}"></div>
    <div class="f"><label>Passenger type</label><input class="in" readonly value="${p.type}"><span class="hint">Set by the traveller counts.</span></div></div>
    ${p.type!=='Adult'?`<div class="f"><label>Age at travel</label><input class="in" inputmode="numeric" style="max-width:120px"></div>`:''}
    ${mselField('pdReqs','Special requests',reqs,'')}
    <div class="f"><label>Other requirements <span class="opt">(optional)</span></label><textarea class="in" rows="2"></textarea></div>
    <div class="grp"><h3>Private details</h3><div class="note lock">${ic('lock')}<div>Phone, email and date of marriage: only the deal owner, the branch Manager and the Flight or Visa &amp; Passport colleague who needs them. Date of birth is also shown to Purchase on its task, with the ID proof.</div></div>
      <div class="g2"><div class="f"><label>Date of birth <span class="opt">(optional)</span></label><input class="in" type="date"></div><div class="f"><label>Date of marriage <span class="opt">(optional)</span></label><input class="in" type="date"></div>
      <div class="f"><label>Phone <span class="opt">(optional)</span></label><input class="in" type="tel"></div><div class="f"><label>Email <span class="opt">(optional)</span></label><input class="in" type="email"></div></div></div>`,
   'Save passenger',()=>{p.name=$('#pdName').value;p.reqs=reqs;return true},'Passenger details saved. They are visible only to the people who need them.',()=>bindMsel('pdReqs',PAX_REQS,reqs));
}
function toast(t){$('#bf-toast').innerHTML=`<div class="toast" role="status">${esc(t)}</div>`;clearTimeout(timers.t);timers.t=setTimeout(()=>$('#bf-toast').innerHTML='',3200)}

/* =====================================================================
   Drawers (service editors)
   ===================================================================== */
let busy=false;
function drawer(title,desc,body,saveLabel,onSave,okMsg,afterBind){
  $('#bf-layer').innerHTML=`<div class="scrim"><form class="drawer" role="dialog" aria-modal="true" aria-label="${esc(title)}" novalidate>
   <div class="dr-h"><h2>${esc(title)}</h2>${desc?`<p>${desc}</p>`:''}<button class="btn ghost icon dr-x" type="button" id="drX" aria-label="Close without saving">${ic('x')}</button></div>
   <div class="dr-b">${body}<div class="note bad" id="drErr" style="display:none">${ic('alert')}<span></span></div></div>
   <div class="dr-f"><span class="grow" id="drLive"></span><button class="btn sec" type="button" id="drCancel">Cancel</button><button class="btn pri" type="submit" id="drSave">${esc(saveLabel)}</button></div>
  </form></div>`;
  paintIcons($('#bf-layer'));
  const close=()=>{$('#bf-layer').innerHTML='';busy=false};
  $('#drX').onclick=close;$('#drCancel').onclick=close;
  const form=$('#bf-layer form');
  /* Fix #4: Enter inside a field never saves; one save at a time. */
  form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='submit'){e.preventDefault()}});
  form.onsubmit=e=>{e.preventDefault();if(busy)return;
    const r=onSave();if(r!==true){const el=$('#drErr');el.style.display='';el.querySelector('span').textContent=r;el.scrollIntoView({block:'nearest'});return}
    busy=true;const b=$('#drSave');b.disabled=true;b.textContent='Saving…';
    setTimeout(()=>{close();render();toast(okMsg)},650)};
  afterBind&&afterBind();
  [...form.querySelectorAll('input:not([readonly]),select,textarea')].find(el=>el.offsetParent)?.focus();
}
/* Traveller chips (fix #6): everyone starts chosen; tap to leave someone out. */
function travChips(sel,label='Who is travelling'){
  if(!S.pax.length) return`<div class="f"><span class="lbl">${label}</span><span class="hint">Name the passengers in step 1 to choose them here.</span></div>`;
  const all=sel.length===S.pax.length;
  return`<div class="f"><span class="lbl">${label}</span><div class="tchips" id="tchips">
   <button type="button" class="tchip all" aria-pressed="${all}" data-tall>${all?ic('check'):''}All ${S.pax.length}</button>
   ${S.pax.map(p=>`<button type="button" class="tchip" aria-pressed="${sel.includes(p.id)}" data-tid="${p.id}">${sel.includes(p.id)?ic('check'):''}${esc(p.name)||p.type+' (no name yet)'}</button>`).join('')}</div>
   <div class="tline" id="tline">${sel.length} of ${S.pax.length} chosen</div></div>`;
}
function bindChips(sel,onChange){
  const repaint=()=>{const box=$('#tchips').parentElement,tmp=document.createElement('div');tmp.innerHTML=travChips(sel);box.replaceWith(tmp.firstElementChild);paintIcons($('#bf-layer'));bindChips(sel,onChange);onChange&&onChange()};
  const a=$('[data-tall]');if(!a)return;
  a.onclick=()=>{if(sel.length===S.pax.length)sel.length=0;else{sel.length=0;S.pax.forEach(p=>sel.push(p.id))}repaint()};
  $$('[data-tid]').forEach(b=>b.onclick=()=>{const i=sel.indexOf(b.dataset.tid);if(i>=0)sel.splice(i,1);else sel.push(b.dataset.tid);repaint()});
}
const everyone=()=>S.pax.map(p=>p.id);
const emptyFlight=()=>({id:null,from:'',to:'',date:trip().start||'',adate:'',airline:'',no:'',dep:'',arr:'',cabin:'Economy',fareA:'',fareC:'',fareI:'',pax:everyone(),prefs:[],prefsFor:{},mode:'typed',files:[],note:'',isReturn:false});
/* Suggestion lists (fix #17). Staff can also type their own item. */
const FLIGHT_PREFS=['Window seat','Aisle seat','Seats together','Extra legroom','Extra baggage','Vegetarian meal','Jain meal','Child meal','Wheelchair help','Infant bassinet','Senior citizen help'];
const HOTEL_REQS=['Early check-in','Late check-out','Honeymoon decoration','Birthday or anniversary cake','Adjoining rooms','Ground-floor room','High floor','Non-smoking room','Twin beds','Double bed','Baby cot','Wheelchair access','Vegetarian meals','Jain meals'];
const PAX_REQS=['Vegetarian meals','Jain meals','Wheelchair help','Honeymoon decoration','Early check-in','Late check-out','Adjoining rooms','Ground-floor room','Baby cot','Senior citizen help'];
/* Multi-select with a suggestion list (21st.dev "Selector Chips" + "Country Combobox", restyled). */
const MS={};
function mselField(id,label,sel,hint,fix,who,people){
  MS[id]={label,sel,hint,fix,who,people};
  const ppl=who&&people?people.map(pid=>S.pax.find(p=>p.id===pid)).filter(Boolean):[];
  const forSel=v=>{if(ppl.length<2)return'';const cur=ppl.some(p=>p.id===who[v])?who[v]:'all';if(cur==='all')delete who[v];
    return`<select class="mwho" data-mw="${esc(v)}" aria-label="${esc(v)} is for">${[['all','for everyone'],...ppl.map(p=>[p.id,'for '+paxName(p)])].map(([x,l])=>`<option value="${x}" ${x===cur?'selected':''}>${esc(l)}</option>`).join('')}</select>`};
  return`<div class="f" ><span class="lbl" id="msl-${id}">${label} <span class="opt">(optional)</span></span>
    <div class="combo"><div class="msel-box" id="msb-${id}">${sel.map((v,i)=>`<span class="mchip">${esc(v)}${forSel(v)}<button type="button" data-mrm="${i}" aria-label="Remove ${esc(v)}">${ic('x')}</button></span>`).join('')}
      <input id="${id}" role="combobox" aria-labelledby="msl-${id}" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="${sel.length?'Add more…':'Choose or type…'}"></div>
    <div class="combo-list" id="msl2-${id}" role="listbox" hidden></div></div>${hint?`<span class="hint">${hint}</span>`:''}</div>`;
}
const MSOPT={};
function mselRedraw(id,focus){const c=MS[id],box=$('#msb-'+id);if(!c||!box)return;const tmp=document.createElement('div');tmp.innerHTML=mselField(id,c.label,c.sel,c.hint,c.fix,c.who,c.people);box.closest('.f').replaceWith(tmp.firstElementChild);paintIcons($('#bf-layer'));bindMsel(id,MSOPT[id].options,c.sel,MSOPT[id].onChange);if(focus)$('#'+id).focus()}
function bindMsel(id,options,sel,onChange){
  MSOPT[id]={options,onChange};
  const inp=$('#'+id),list=$('#msl2-'+id),box=$('#msb-'+id);let res=[],act=0;
  const repaint=()=>{mselRedraw(id,true);onChange&&onChange()};
  box.querySelectorAll('[data-mw]').forEach(x=>{x.onclick=e=>e.stopPropagation();x.onchange=()=>{const w=MS[id].who;if(x.value==='all')delete w[x.dataset.mw];else w[x.dataset.mw]=x.value}});
  const add=v=>{v=v.trim();if(v&&!sel.some(x=>x.toLowerCase()===v.toLowerCase()))sel.push(v);repaint();setTimeout(()=>open(),0)};
  const open=()=>{const q=$('#'+id);if(!q)return;const t=q.value.trim().toLowerCase();
    res=options.filter(o=>!sel.includes(o)&&o.toLowerCase().includes(t));
    const custom=t&&!options.some(o=>o.toLowerCase()===t)?q.value.trim():'';
    const l=$('#msl2-'+id);act=Math.min(act,Math.max(0,res.length-(custom?0:1)));
    l.innerHTML=res.map((o,i)=>`<div class="combo-opt" role="option" aria-selected="${i===act}" data-mo="${esc(o)}">${esc(o)}</div>`).join('')+(custom?`<div class="combo-opt add" role="option" aria-selected="${act===res.length}" data-mo="${esc(custom)}">${ic('plus')} Add “${esc(custom)}”</div>`:'')||`<div class="combo-empty">All suggestions chosen. Type your own.</div>`;
    paintIcons(l);l.hidden=false;q.setAttribute('aria-expanded','true');
    /* Open upwards when the drawer footer would hide the list. */
    const sc=q.closest('.dr-b');if(sc){const bx=q.closest('.msel-box').getBoundingClientRect(),r=sc.getBoundingClientRect(),below=r.bottom-bx.bottom-8,above=bx.top-r.top-8,up=below<200&&above>below;
      l.style.top=up?'auto':'';l.style.bottom=up?'calc(100% + 4px)':'';l.style.maxHeight=Math.max(120,Math.min(260,up?above:below))+'px'}
    l.querySelectorAll('[data-mo]').forEach(o=>o.onmousedown=e=>{e.preventDefault();add(o.dataset.mo)})};
  box.onclick=e=>{if(!e.target.closest('[data-mrm],[data-mw]'))inp.focus()};
  box.querySelectorAll('[data-mrm]').forEach(b=>b.onclick=()=>{const v=sel.splice(Number(b.dataset.mrm),1)[0];if(MS[id].who)delete MS[id].who[v];repaint()});
  inp.onfocus=open;inp.oninput=()=>{act=0;open()};
  inp.onkeydown=e=>{const n=list.querySelectorAll('[data-mo]').length;
    if(e.key==='ArrowDown'){act=Math.min(n-1,act+1);open();e.preventDefault()}
    else if(e.key==='ArrowUp'){act=Math.max(0,act-1);open();e.preventDefault()}
    else if(e.key==='Enter'){const o=list.querySelectorAll('[data-mo]')[act];if(o)add(o.dataset.mo);else if(inp.value.trim())add(inp.value);e.preventDefault()}
    else if(e.key==='Backspace'&&!inp.value&&sel.length){const v=sel.pop();if(MS[id].who)delete MS[id].who[v];repaint()}
    else if(e.key==='Escape'){list.hidden=true;e.stopPropagation()}};
  inp.onblur=()=>setTimeout(()=>{list.hidden=true;inp.setAttribute('aria-expanded','false')},120);
}
const CAR_KINDS={pickup:'Airport pickup',drop:'Airport drop',full:'Full trip',p2p:'Point to point'};

function openEditor(k,existing,isCopy,banner){
  const isNew=!existing||existing.id==null;
  const save=(obj,msg)=>{if(obj.id==null){obj.id=uid();S.svc[k].push(obj)}else{const i=S.svc[k].findIndex(r=>r.id===obj.id);S.svc[k][i]=obj}return true};
  const ttl=(isNew?'Add ':'Edit ')+LABEL[k].one.toLowerCase();

  if(k==='flight'){
    const f=Object.assign(emptyFlight(),structuredClone(existing||{}));
    const fareSlot=()=>`<div class="f"><span class="lbl">Fare per person <span class="opt">(optional)</span></span>
      <div class="g3">${fareTypes().map(([k,l])=>`<div class="f"><label for="fFare${k}" style="font-weight:500">${l}</label><div class="money"><span>₹</span><input class="in" inputmode="decimal" id="fFare${k}" value="${esc(f['fare'+k])}"></div></div>`).join('')}</div>
      <span class="hint">Our cost estimate, not the customer price. One ticket covering several flights? Leave this blank and type the total under the flights list.</span></div>`;
    const shotFiles=()=>f.files.map((n,i)=>`<div class="file"><span>${ic('image')} ${esc(n)}</span><button class="btn link" type="button" data-sfrm="${i}">Remove</button></div>`).join('');
    drawer(isNew?'Add flight':'Edit flight','Requested flight, not an issued ticket.',`
      ${banner?`<div class="note info">${ic('next')}<div>${esc(banner)}</div></div>`:''}
      <div class="f"><span class="lbl">How do you want to add it?</span><div class="seg" role="radiogroup" aria-label="How do you want to add it?">${[['typed','Type the details'],['shot','Attach a screenshot']].map(([v,l])=>`<button type="button" role="radio" aria-checked="${f.mode===v}" data-fm="${v}">${l}</button>`).join('')}</div></div>
      <div id="fShot" ${f.mode==='shot'?'':'hidden'} style="display:${f.mode==='shot'?'flex':'none'};flex-direction:column;gap:16px">
        <div class="upload"><label class="lbl" for="fShotFile">Flight screenshot</label>
          <span class="hint" style="margin-top:-6px">A screenshot of the chosen flight or fare quote is enough. The Flight team books from it, so you do not type the details.</span>
          <div id="fShotList" style="display:flex;flex-direction:column;gap:6px">${shotFiles()}</div>
          <input type="file" id="fShotFile" accept=".pdf,.jpg,.jpeg,.png,.webp" multiple>
          <span class="hint">PDF, JPG, PNG or WebP, up to 4 MB each, up to 5 files. Opened only by Sales on this deal, the branch Manager and the Flight colleague on this task.</span>
          <div class="err" id="fShotErr" style="display:none">${ic('alert')}<span></span></div></div>
        <div class="f"><label for="fNote">Note for the Flight team <span class="opt">(optional)</span></label><input class="in" id="fNote" value="${esc(f.note)}" placeholder="For example: book the 08:00 IndiGo option"></div></div>
      <div id="fTyped" style="display:${f.mode==='shot'?'none':'flex'};flex-direction:column;gap:16px">
      <div class="g2">${airportField('from','From',f.from)}${airportField('to','To',f.to)}</div>
      <div class="g2"><div class="f"><label>Departure date</label><input class="in" type="date" id="fDate" value="${esc(f.date)}"></div>
       <div class="f"><label>Arrival date <span class="opt">(optional, if next day)</span></label><input class="in" type="date" id="fAdate" value="${esc(f.adate)}"></div>
       <div class="f"><label>Airline <span class="opt">(optional)</span></label><input class="in" id="fAir" value="${esc(f.airline)}"></div>
       <div class="f"><label>Flight number <span class="opt">(optional)</span></label><input class="in" id="fNo" value="${esc(f.no)}"></div>
       <div class="f"><label>Departure time (local) <span class="opt">(optional)</span></label><input class="in" type="time" id="fDep" value="${esc(f.dep)}"></div>
       <div class="f"><label>Arrival time (local) <span class="opt">(optional)</span></label><input class="in" type="time" id="fArr" value="${esc(f.arr)}"></div>
       <div class="f"><label>Cabin</label><select class="in" id="fCab">${['No preference','Economy','Premium economy','Business','First'].map(c=>`<option ${f.cabin===c?'selected':''}>${c}</option>`).join('')}</select></div></div></div>
      ${fareSlot()}
      ${mselField('fPrefs','Baggage, seat or meal preferences',f.prefs,'Choose from the list or type your own and press Enter. Change “for everyone” to pick one person.','17',f.prefsFor,f.pax)}
      ${travChips(f.pax,'Passengers flying')}
      <p class="hint" style="margin:0">Flight reads this. PNR and tickets are added later by the Flight team. Do not type the customer price.</p>`,
    'Save flight',()=>{
      fareTypes().forEach(([k])=>f['fare'+k]=$('#fFare'+k).value.replace(/[^\d.]/g,''));f.note=$('#fNote').value.trim();
      if(f.mode==='typed'){Object.assign(f,{date:$('#fDate').value,adate:$('#fAdate').value,airline:$('#fAir').value.trim(),no:$('#fNo').value.trim(),dep:$('#fDep').value,arr:$('#fArr').value,cabin:$('#fCab').value});
        f.from=$('#ap-from').dataset.code||'';f.to=$('#ap-to').dataset.code||''}
      const e=FLIGHT_REQ(f);return e||save(f)},'Flight saved.',()=>{
        bindAirport('from');bindAirport('to');bindMsel('fPrefs',FLIGHT_PREFS,f.prefs);
        const cur=()=>({...f,from:$('#ap-from').dataset.code,to:$('#ap-to').dataset.code,date:$('#fDate').value});
        const live=()=>{const e=$('#drErr');if(e.style.display!=='none'){const x=FLIGHT_REQ(cur());if(!x)e.style.display='none';else e.querySelector('span').textContent=x}};  // fix #5
        bindChips(f.pax,()=>{live();mselRedraw('fPrefs')});$('#bf-layer form').addEventListener('input',live);$('#bf-layer form').addEventListener('airport',live);
        /* Fix #19: a screenshot is enough; the typed fields hide. */
        $$('[data-fm]').forEach(b=>b.onclick=()=>{f.mode=b.dataset.fm;$$('[data-fm]').forEach(x=>x.setAttribute('aria-checked',x===b));
          $('#fShot').hidden=f.mode!=='shot';$('#fShot').style.display=f.mode==='shot'?'flex':'none';$('#fTyped').style.display=f.mode==='shot'?'none':'flex';live()});
        const bindShots=()=>{$('#fShotList').innerHTML=shotFiles();paintIcons($('#fShotList'));$$('[data-sfrm]').forEach(b=>b.onclick=()=>{f.files.splice(Number(b.dataset.sfrm),1);bindShots();live()})};
        bindShots();
        $('#fShotFile').onchange=e=>{const err=$('#fShotErr');err.style.display='none';
          for(const x of e.target.files){const bad=x.size>4*1024*1024?`${x.name} is over 4 MB. It was not added.`:!/\.(pdf|jpe?g|png|webp)$/i.test(x.name)?`${x.name}: use a PDF, JPG, PNG or WebP file.`:f.files.length>=5?'A flight can have at most 5 screenshots. Remove one first.':'';
            if(bad){err.style.display='';err.querySelector('span').textContent=bad;continue}f.files.push(x.name)}
          e.target.value='';bindShots();live()};
      });
    return;
  }
  if(k==='hotel'){
    const prev=S.svc.hotel[S.svc.hotel.length-1],t=trip();
    const startIn=prev?addDays(prev.checkin,prev.nights):t.start;
    const left=t.end&&startIn?nightsBetween(startIn,t.end):'';
    const h=structuredClone(existing||{id:null,city:'',hotel:'',checkin:startIn||'',nights:left>0?String(left):'',room:'',meal:'',rooms:'1',roomRate:'',extra:'0',extraRate:'',nobed:'0',nobedRate:'',pax:everyone(),reqs:[],reqsFor:{},notes:''});
    /* Fix #16: where, when, who, rooms and cost, then requests. Nothing hidden under More details. */
    drawer(isNew?'Add hotel stay':'Edit hotel stay','',`
      ${isCopy?`<div class="note info">${ic('copy')}<div>Copy of a stay. Check the dates.</div></div>`:''}
      <div class="g2"><div class="f"><label for="hCity">City</label><input class="in" id="hCity" value="${esc(h.city)}"></div>
        <div class="f"><label for="hName">Hotel</label><input class="in" id="hName" value="${esc(h.hotel)}" placeholder="Type 2 letters to search"><span class="hint">Not in the hotel list? Keep typing the name; Purchase checks it.</span></div></div>
      <div class="g3"><div class="f"><label for="hIn">Check-in</label><input class="in" type="date" id="hIn" value="${esc(h.checkin)}"></div>
        <div class="f"><label for="hN">Nights</label><input class="in" inputmode="numeric" id="hN" value="${esc(h.nights)}"></div>
        <div class="f"><span class="lbl">Check-out</span><div style="min-height:40px;display:flex;align-items:center;gap:6px" id="hOut">${ic('cal','c-q')}${h.checkin&&h.nights?fmtD(addDays(h.checkin,h.nights)):'Set check-in and nights'}</div></div></div>
      ${prev&&isNew&&!isCopy?`<p class="hint" style="margin:-6px 0 0">Check-in starts at the last hotel’s check-out. Nights fill the rest of the trip.</p>`:''}
      ${travChips(h.pax,'Who stays here')}
      <div class="grp"><h3>Room and meals</h3>
        <div class="g2"><div class="f"><label for="hRoom">Room category <span class="opt">(optional)</span></label><input class="in" id="hRoom" value="${esc(h.room)}" placeholder="For example: Deluxe"></div>
        <div class="f"><label for="hMeal">Meal plan <span class="opt">(optional)</span></label><select class="in" id="hMeal">${['','Room only','Breakfast','Breakfast + dinner','All meals','Other'].map(m=>`<option value="${m}" ${h.meal===m?'selected':''}>${m||'Choose'}</option>`).join('')}</select></div></div>
        <div style="display:flex;justify-content:space-between"><span class="lbl">Rooms and nightly rates</span><span class="hint">INR · per night</span></div>
        <div class="rates"><span></span><span class="h">Qty</span><span class="h">Our cost</span>
          ${[['rooms','roomRate','Rooms'],['extra','extraRate','Extra beds'],['nobed','nobedRate','No bed']].map(([q,r,l])=>`<span style="font-size:13px;font-weight:500">${l}</span><input class="in" inputmode="numeric" data-h="${q}" value="${esc(h[q])}" aria-label="${l}: quantity"><div class="money"><span>₹</span><input class="in" inputmode="decimal" data-h="${r}" value="${esc(h[r])}" aria-label="${l}: our cost per night"></div>`).join('')}</div>
        <div class="tline" id="hOcc" style="margin-top:0"></div>
        <div class="est" id="hEst"></div></div>
      <div class="grp"><h3>Requests</h3>
        ${mselField('hReqs','Special requests',h.reqs,'Choose from the list or type your own and press Enter. Change “for everyone” to pick one person.','16',h.reqsFor,h.pax)}
        <div class="f"><label for="hNotes">Inclusions, exclusions or other notes <span class="opt">(optional)</span></label><textarea class="in" id="hNotes" rows="2">${esc(h.notes)}</textarea><span class="hint">Purchase reads this. Do not type the customer price.</span></div></div>`,
    'Save hotel',()=>{
      Object.assign(h,{city:$('#hCity').value.trim(),hotel:$('#hName').value.trim(),checkin:$('#hIn').value,nights:$('#hN').value,room:$('#hRoom').value,meal:$('#hMeal').value,notes:$('#hNotes').value});
      $$('[data-h]').forEach(i=>h[i.dataset.h]=i.value);
      const e=HOTEL_REQ(h);return e||save(h)},'Hotel saved.',()=>{
        const live=()=>{$$('[data-h]').forEach(i=>h[i.dataset.h]=i.value);h.checkin=$('#hIn').value;h.nights=$('#hN').value;
          $('#hOut').innerHTML=ic('cal','c-q')+(h.checkin&&Number(h.nights)?fmtD(addDays(h.checkin,h.nights)):'Set check-in and nights');
          /* Fix #11: only rows with a quantity appear in the working. */
          const parts=[[h.rooms,h.roomRate,'room'],[h.extra,h.extraRate,'extra bed'],[h.nobed,h.nobedRate,'no-bed guest']].filter(([q])=>Number(q)>0);
          const c=hotelCost(h);
          $('#hEst').innerHTML=`<span class="hint">Estimated supplier cost</span><strong>${c!=null?inr(c):'Not priced'}</strong>${c!=null?`<span class="hint">${h.nights} nights × (${parts.map(([q,p,l])=>`${q} ${l}${q>1?'s':''} × ${inr(p)}`).join(' + ')})</span>`:''}<div class="hint">An estimate only. It is not a price, a budget or a booking.</div>`;
          const ad=h.pax.map(id=>S.pax.find(p=>p.id===id)).filter(Boolean);const people=ad.length,rooms=Number(h.rooms)||0;
          $('#hOcc').innerHTML=people?`${plural(people,'person','people')} · ${plural(rooms,'room')}${rooms&&people/rooms>3?` · <span class="c-warn">${ic('warn')} more than 3 per room, check beds</span>`:''}`:'';
          paintIcons($('#bf-layer'));const e=$('#drErr');if(e.style.display!=='none'){const x=HOTEL_REQ({...h,city:$('#hCity').value,hotel:$('#hName').value});x?e.querySelector('span').textContent=x:e.style.display='none'}};
        $('#bf-layer form').addEventListener('input',live);bindChips(h.pax,()=>{live();mselRedraw('hReqs')});bindMsel('hReqs',HOTEL_REQS,h.reqs);live();
      });
    return;
  }
  if(k==='car'){
    const t=trip();
    const c=structuredClone(existing||{id:null,kind:'pickup',flight:'',vehicle:'',qty:1,pickup:'',drop:'',date:t.start||'',time:'',route:'',start:t.start||'',end:t.end||'',rate:'',pax:everyone(),notes:''});
    const flights=S.svc.flight;
    drawer(isNew?'Add car':'Edit car','',`
      <div class="f"><span class="lbl">Type of car booking</span><div class="seg" role="radiogroup" aria-label="Type of car booking">${Object.entries(CAR_KINDS).map(([v,l])=>`<button type="button" role="radio" aria-checked="${c.kind===v}" data-ck="${v}">${l}</button>`).join('')}</div></div>
      <div id="carBody"></div>
      <div class="g2"><div class="f"><label>Vehicle</label><select class="in" id="cVeh">${['','Innova','Innova Crysta','Sedan','Tempo Traveller','Other'].map(v=>`<option value="${v}" ${c.vehicle===v?'selected':''}>${v||'Choose'}</option>`).join('')}</select></div>
        <div class="f"><span class="lbl">Number of vehicles</span><div class="stepper"><button type="button" id="cMinus" aria-label="One vehicle fewer">${ic('minus')}</button><input class="in" id="cQty" value="${c.qty}" inputmode="numeric"><button type="button" id="cPlus" aria-label="One vehicle more">${ic('plus')}</button></div></div>
        <div class="f"><label>${c.kind==='full'?'Rate per vehicle (whole trip)':'Rate per vehicle'} ₹ <span class="opt">(optional)</span></label><div class="money"><span>₹</span><input class="in" id="cRate" inputmode="decimal" value="${esc(c.rate)}"></div></div></div>
      ${travChips(c.pax,'Who rides')}
      <div class="f"><label>Remarks <span class="opt">(optional)</span></label><input class="in" id="cNotes" value="${esc(c.notes)}"><span class="hint">Purchase reads this. Do not type the customer price.</span></div>`,
    'Save car',()=>{readCar(c);const e=CAR_REQ(c);return e||save(c)},'Car saved.',()=>{
      const body=()=>{
        const fOpts=flights.map((f,i)=>`<option value="${f.id}" ${c.flight===f.id?'selected':''}>Flight ${i+1} · ${f.mode==='shot'?'from screenshot':`${f.from} – ${f.to} · ${fmtD(f.date)}`}${c.kind==='pickup'&&f.arr?' · lands '+f.arr:c.kind==='drop'&&f.dep?' · leaves '+f.dep:''}</option>`).join('');
        const flightPick=(c.kind==='pickup'||c.kind==='drop')?`<div class="f full"><label>${c.kind==='pickup'?'Meets which flight':'For which flight'} <span class="opt">(fills the rest)</span></label>${flights.length?`<select class="in" id="cFlight"><option value="">Choose a flight</option>${fOpts}</select>`:`<span class="hint">Add the flights first and this fills itself. Or type below.</span>`}</div>`:'';
        $('#carBody').innerHTML=c.kind==='full'?`<div class="g2"><div class="f"><label>Tour start</label><input class="in" type="date" id="cStart" value="${esc(c.start)}"></div><div class="f"><label>Tour end</label><input class="in" type="date" id="cEnd" value="${esc(c.end)}"></div>
          <div class="f full"><label>Route</label><input class="in" id="cRoute" value="${esc(c.route)}" placeholder="For example: Jodhpur – Jaisalmer – Jodhpur"></div></div>`:
          `<div class="g2">${flightPick}<div class="f"><label>Pickup</label><input class="in" id="cPick" value="${esc(c.pickup)}"></div><div class="f"><label>Drop</label><input class="in" id="cDrop" value="${esc(c.drop)}"></div>
          <div class="f"><label>Date</label><input class="in" type="date" id="cDate" value="${esc(c.date)}"></div><div class="f"><label>Pickup time</label><input class="in" type="time" id="cTime" value="${esc(c.time)}"></div></div>
          ${c.kind==='drop'?`<p class="hint" style="margin:0">Pickup time is set 3 hours before the flight. Change it if needed.</p>`:''}`;
        paintIcons($('#bf-layer'));
        const fs=$('#cFlight');if(fs)fs.onchange=()=>{readCar(c);c.flight=fs.value;const f=flights.find(x=>x.id===fs.value);if(!f){body();return}
          if(f.mode==='shot'){body();toast('This flight is a screenshot. Type the pickup, drop, date and time.');return}
          const hotelOn=d=>S.svc.hotel.find(h=>d>=h.checkin&&d<addDays(h.checkin,h.nights))||S.svc.hotel.find(h=>addDays(h.checkin,h.nights)===d);
          if(c.kind==='pickup'){const a=airport(f.to),d=f.adate||f.date,h=hotelOn(d);c.pickup=`${a?a.city+' airport':''} (${f.to})${f.no?', flight '+f.no:''}`;c.date=d;c.time=f.arr||'';c.drop=h?h.hotel+', '+h.city:c.drop}
          else{const a=airport(f.from),h=hotelOn(f.date);c.drop=`${a?a.city+' airport':''} (${f.from})${f.no?', flight '+f.no:''}`;c.date=f.date;if(f.dep){const[hh,mm]=f.dep.split(':').map(Number);const m=(hh*60+mm-180+1440)%1440;c.time=`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`}c.pickup=h?h.hotel+', '+h.city:c.pickup}
          body();toast('Filled from the flight and hotel. Check and change if needed.')};
      };
      body();
      $$('[data-ck]').forEach(b=>b.onclick=()=>{readCar(c);c.kind=b.dataset.ck;$$('[data-ck]').forEach(x=>x.setAttribute('aria-checked',x===b));body()});
      $('#cMinus').onclick=()=>{$('#cQty').value=Math.max(1,Number($('#cQty').value)-1)};$('#cPlus').onclick=()=>{$('#cQty').value=Math.min(100,Number($('#cQty').value)+1)};
      bindChips(c.pax);
    });
    return;
  }
  /* Activity, visa, passport: same fields as live, traveller chips added. */
  const o=structuredClone(existing||{id:null,name:'',city:'',date:'',country:'',vtype:'Tourism',atype:'Fresh',fee:'Not decided yet',req:'',pax:k==='passport'?[]:everyone()});
  const bodies={
    activity:`<div class="g2"><div class="f"><label>Activity</label><input class="in" id="oName" value="${esc(o.name)}"></div><div class="f"><label>City / location</label><input class="in" id="oCity" value="${esc(o.city)}"></div><div class="f"><label>Required date</label><input class="in" type="date" id="oDate" value="${esc(o.date)}"></div></div>`,
    visa:`<div class="g2"><div class="f"><label>Visa type</label><select class="in" id="oVtype">${['Tourism','Business','Visiting family','Transit'].map(v=>`<option ${o.vtype===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="f"><label>Country</label><input class="in" id="oCountry" value="${esc(o.country)}"></div><div class="f"><label>Planned travel date</label><input class="in" type="date" id="oDate" value="${esc(o.date||trip().start)}"></div><div class="f"><label>Government fee paid by</label><select class="in"><option>Not decided yet</option><option>Customer pays directly</option><option>Company pays (recorded for Accounts review)</option></select></div></div>`,
    passport:`<div class="g2"><div class="f"><label>Application type</label><select class="in" id="oAtype">${['Fresh','Renewal','Tatkaal','Minor'].map(v=>`<option ${o.atype===v?'selected':''}>${v}</option>`).join('')}</select></div><div class="f"><label>City / location</label><input class="in" id="oCity" value="${esc(o.city)}"><span class="hint">The passport office city.</span></div></div>`
  };
  drawer(k==='activity'?(isNew?'Add activity':'Edit activity'):k==='visa'?'Visa requirements':'Passport requirements','',
    bodies[k]+travChips(o.pax,k==='passport'?'Applicant':k==='activity'?'Who takes part':'Who needs a visa')+`<div class="f"><label>Requirements <span class="opt">(optional)</span></label><textarea class="in" id="oReq">${esc(o.req)}</textarea></div>`,
    k==='activity'?'Save activity':'Save requirements',()=>{
      o.name=$('#oName')?.value.trim()??o.name;o.city=$('#oCity')?.value.trim()??o.city;o.date=$('#oDate')?.value??o.date;o.country=$('#oCountry')?.value.trim()??o.country;o.vtype=$('#oVtype')?.value??o.vtype;o.atype=$('#oAtype')?.value??o.atype;o.req=$('#oReq').value;
      const e=k==='activity'&&(!o.name||!o.city||!o.date)?'Add the activity, city and date.':k==='visa'&&(!o.country||!o.date)?'Add the country and the planned travel date.':k==='passport'&&!o.city?'Add the passport office city.':'';
      return e||save(o)},k==='activity'?'Activity saved.':'Requirements saved.',()=>bindChips(o.pax));
}
function readCar(c){
  const v=id=>byId(id);
  c.vehicle=v('cVeh').value;c.qty=Number(v('cQty').value)||1;c.rate=v('cRate').value;c.notes=v('cNotes').value;
  if(v('cRoute')){c.route=v('cRoute').value.trim();c.start=v('cStart').value;c.end=v('cEnd').value;c.date=c.start}
  if(v('cPick')){c.pickup=v('cPick').value.trim();c.drop=v('cDrop').value.trim();c.date=v('cDate').value;c.time=v('cTime').value}
}
/* Fix #7: one click builds the way home. */
function addReturnFlights(){
  const t=trip(),out=S.svc.flight.filter(f=>!f.isReturn&&f.mode!=='shot');
  if(!out.length){openEditor('flight',{...emptyFlight(),mode:'shot',isReturn:true,date:t.end||''},false,'Return journey. Attach the return flight screenshot, or type the details.');return}
  const back=[...out].reverse().map(f=>({...structuredClone(f),id:uid(),from:f.to,to:f.from,date:t.end||f.date,adate:'',no:'',dep:'',arr:'',fareA:'',fareC:'',fareI:'',isReturn:true}));
  S.svc.flight.push(...back);render();
  toast(`${plural(back.length,'return flight')} added for ${t.end?fmtD(t.end):'the return date'}. Add flight numbers and times.`);
}

/* Airport combobox (fix #3). Stores the code; the typed text stays if nothing matches. */
function airportField(id,label,code){
  const a=airport(code);
  return`<div class="f combo"><label for="ap-${id}">${label}</label><input class="in" id="ap-${id}" role="combobox" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="City or code, e.g. Delhi or DEL" data-code="${esc(code)}" value="${a?esc(`${a.city} (${a.c})`):''}"><span class="hint" id="aph-${id}">${a?esc(a.name):'Type a city, airport name or 3-letter code.'}</span><div class="combo-list" id="apl-${id}" role="listbox" hidden></div></div>`;
}
function bindAirport(id){
  const inp=$('#ap-'+id),list=$('#apl-'+id),hint=$('#aph-'+id);let res=[],act=0;
  const pick=a=>{inp.value=`${a.city} (${a.c})`;inp.dataset.code=a.c;hint.textContent=a.name;hint.className='hint';list.hidden=true;inp.setAttribute('aria-expanded','false');inp.dispatchEvent(new Event('airport',{bubbles:true}))};
  const draw=()=>{list.innerHTML=res.length?res.map((a,i)=>`<div class="combo-opt" role="option" aria-selected="${i===act}" data-c="${a.c}"><span class="code">${a.c}</span><span>${esc(a.city)}<small>${esc(a.name)}</small></span></div>`).join(''):`<div class="combo-empty">No airport found. Try the city name or the 3-letter code.</div>`;
    list.querySelectorAll('[data-c]').forEach(o=>o.onmousedown=e=>{e.preventDefault();pick(airport(o.dataset.c))})};
  inp.oninput=()=>{inp.dataset.code='';res=searchAirports(inp.value);act=0;list.hidden=!inp.value.trim();inp.setAttribute('aria-expanded',String(!list.hidden));draw()};
  inp.onkeydown=e=>{if(list.hidden)return;if(e.key==='ArrowDown'){act=Math.min(res.length-1,act+1);draw();e.preventDefault()}if(e.key==='ArrowUp'){act=Math.max(0,act-1);draw();e.preventDefault()}if(e.key==='Enter'&&res[act]){pick(res[act]);e.preventDefault()}if(e.key==='Escape'){list.hidden=true}};
  inp.onblur=()=>{setTimeout(()=>{list.hidden=true;if(!inp.dataset.code&&inp.value.trim()){const r=searchAirports(inp.value);if(r.length===1)pick(r[0]);else{hint.textContent='Pick an airport from the list, e.g. DEL. What you typed is still here.';hint.className='err'}}},120)};
}

window.addEventListener('keydown',e=>{if(!R())return;if(e.key==='Escape'){if($('#bf-dlg').innerHTML)closeDlg();else if($('#bf-layer').innerHTML&&!busy)$('#bf-layer').innerHTML=''}});

/* =====================================================================
   CRM integration (Agent C). Everything above is the approved form code.
   Below: per-Deal state filled from the Bitrix Deal (TN.DATA), the page
   registration, submit, the reported-payment send and the Bill To search.
   ===================================================================== */
const STATES={};
const nowHM=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
const meKey=()=>TN.me().key;
const OPEN_STATES=['not_started','quotation_accepted','in_progress','ready_to_submit','returned'];

/* Billing addresses for the invented customers (used by the Bill To search). */
const ADDR={
  'c-agarwal':['14, Sardarpura 3rd B Road','Jodhpur','342003'],'c-khatri':['22, Shastri Nagar Sector D','Jodhpur','342003'],
  'c-bhandari':['7, Paota B Road','Jodhpur','342006'],'c-purohit':['Purohit Bhawan, Station Road','Pali','306401'],
  'c-mathur':['41, Ratanada Polo Road','Jodhpur','342011'],'c-soni':['Soni Jewellers, Tripolia Bazaar','Jodhpur','342002'],
  'c-vyas':['2nd floor, Shree Complex, 9th Chopasni Road','Jodhpur','342003'],'c-choudhary':['Ward 12, Main Market','Balotra','344022'],
  'c-tak':['63, Pratap Nagar','Jodhpur','342003'],'c-marudhar':['G-118, Heavy Industrial Area, Basni','Jodhpur','342005'],
  'c-rathi':['5, Kamla Nehru Nagar','Jodhpur','342009'],'c-bishnoi':['118, Chopasni Housing Board','Jodhpur','342008']
};
Object.entries(ADDR).forEach(([id,[addr,city,pin]])=>{const c=TN.DATA.customers[id];if(c&&!c.address)Object.assign(c,{address:addr,pin,state:'Rajasthan'})});

/* What the Bitrix Deal sends (automatic filling from Bitrix is On). */
function bxFromDeal(d){
  const c=TN.customer(d.customer)||{};
  return{on:true,name:c.business?(c.contact||c.name):c.name,phone:c.phone||'',email:c.email||'',destination:d.destination||'',start:d.start||'',end:d.end||'',
    trip:d.tripType||'',adults:d.adults==null?'':String(d.adults),children:d.children==null?'':String(d.children),infants:d.infants==null?'':String(d.infants),read:fmtD(TN.TODAY)};
}
function stateFor(id){
  if(STATES[id])return STATES[id];
  const d=TN.deal(id);
  S=freshState();S.dealId=id;S.bx=bxFromDeal(d);
  for(const k of ['name','phone','email']) if(S.bx[k]&&!S.cust[k]) S.cust[k]=S.bx[k];   // auto-fill, no "Use Bitrix value" clicks
  syncPaxSlots();
  if(SEED[id])SEED[id](d);
  else if(d.quotation)fromQuotation(d);
  STATES[id]=S;return S;
}
const named=(...names)=>names.forEach((n,i)=>{if(S.pax[i])S.pax[i].name=n});
const hotelRow=o=>Object.assign({id:uid(),city:'',hotel:'',checkin:'',nights:'',room:'',meal:'',rooms:'1',roomRate:'',extra:'0',extraRate:'',nobed:'0',nobedRate:'',pax:everyone(),reqs:[],reqsFor:{},notes:''},o);
const carRow=o=>Object.assign({id:uid(),kind:'pickup',flight:'',vehicle:'',qty:1,pickup:'',drop:'',date:'',time:'',route:'',start:'',end:'',rate:'',pax:everyone(),notes:''},o);
const otherRow=o=>Object.assign({id:uid(),name:'',city:'',date:'',country:'',vtype:'Tourism',atype:'Fresh',fee:'Not decided yet',req:'',pax:everyone()},o);
const flightRow=o=>Object.assign(emptyFlight(),{id:uid()},o);

/* Deal-specific drafts (invented). */
const SEED={
  /* Thailand: booking in progress, step 2 half done. */
  'BX-38533':()=>{
    S.cust.confirmed=true;S.save.cust='saved';
    named('Kunal Choudhary','Ritu Choudhary');S.save.pax='saved';
    S.pax[0].files=['Kunal-Choudhary-passport.pdf'];S.pax[0].copy='copied';
    S.chosen=new Set(['hotel','car','flight','activity']);
    S.svc.hotel=[hotelRow({city:'Phuket',hotel:'Novotel Phuket Kamala Beach',checkin:'2026-12-12',nights:'3',room:'Superior sea view',meal:'Breakfast',roomRate:'7800',reqs:['Honeymoon decoration','Double bed']}),
                 hotelRow({city:'Krabi',hotel:'Holiday Inn Resort Krabi Ao Nang Beach',checkin:'2026-12-15',nights:'2',room:'Deluxe pool view',meal:'Breakfast',roomRate:'6900'})];
    const f1=flightRow({from:'DEL',to:'HKT',date:'2026-12-12',adate:'2026-12-12',airline:'IndiGo',no:'6E 1063',dep:'06:10',arr:'12:05',fareA:'16800'});
    const f2=flightRow({from:'KBV',to:'DEL',date:'2026-12-17',airline:'IndiGo',fareA:'17400',isReturn:true});
    S.svc.flight=[f1,f2];
    S.svc.car=[carRow({kind:'pickup',flight:f1.id,vehicle:'Sedan',pickup:'Phuket airport (HKT), flight 6E 1063',drop:'Novotel Phuket Kamala Beach, Phuket',date:'2026-12-12',time:'12:05',rate:'1900'})];
    S.svc.activity=[otherRow({name:'Phi Phi Islands day tour by speedboat',city:'Phuket',date:'2026-12-14'})];
    S.step=2;
  },
  /* Udaipur: returned by Accounts; open on the fix. */
  'BX-38520':(d)=>{
    S.version=2;S.returned=d.returnReason||'';
    S.cust.confirmed=true;named('Pooja Vyas','Amit Vyas');
    S.pax.forEach((p,i)=>{p.files=[['Pooja-Vyas-aadhaar.pdf','Amit-Vyas-aadhaar.pdf'][i]];p.copy='copied'});
    S.chosen=new Set(['hotel']);
    S.svc.hotel=[hotelRow({srcId:'s-520-h',city:'Udaipur',hotel:'Trident, Udaipur',checkin:'2026-11-21',nights:'2',room:'Lake view room',meal:'Breakfast',roomRate:'9800',reqs:['Early check-in']})];
    S.prices.adult={p:'19600',m:'3800',f:'23400'};
    const c=TN.customer('c-vyas');
    S.bill={mode:'form',type:'business',name:'Vyas and Associates, Chartered Accountants',contact:'Pooja Vyas',phone:c.phone,email:c.email,addr:c.address,city:'Jodhpur',state:'Rajasthan',pin:c.pin,gst:'GST registered',gstin:'08AAKFV3184M1ZT',reason:''};
    S.plan=[{label:'Advance',amount:'20000',due:'2026-10-24'},{label:'Balance',amount:'26800',due:'2026-11-14'}];
    S.acceptance='WhatsApp-OK-Pooja-Vyas-23-Oct.png';
    Object.assign(S.save,{cust:'saved',pax:'saved',price:'saved',bill:'fix',plan:'saved'});
    S.why.bill='Accounts returned this: the GSTIN does not match the company name.';
    S.step=3;
  },
};
/* Bali: the accepted quotation's services and prices become the draft (live B1.2 "Book from quotation"). */
function fromQuotation(d){
  const q=(TN.DATA.quotations||[]).find(x=>x.id===d.quotation);if(!q)return;
  S.from=q.id;
  for(const it of q.items||[]){
    if(it.kind==='hotel'){S.chosen.add('hotel');S.svc.hotel.push(hotelRow({city:it.city,hotel:it.name,checkin:it.checkin,nights:String(it.nights),room:it.room||'',meal:it.meal||'',rooms:String(it.rooms||1),roomRate:it.rate!=null?String(it.rate):''}))}
    if(it.kind==='transfer'){S.chosen.add('car');S.svc.car.push(carRow({kind:it.carKind||'p2p',vehicle:it.vehicle||'',pickup:it.pickup||'',drop:it.drop||'',route:it.route||'',date:it.date||'',start:it.date||d.start,end:it.end||d.end,rate:it.rate!=null?String(it.rate):''}))}
    if(it.kind==='activity'){S.chosen.add('activity');S.svc.activity.push(otherRow({name:it.name,city:it.city,date:it.date||''}))}
    if(it.kind==='flight'){S.chosen.add('flight');S.svc.flight.push(flightRow({from:it.from,to:it.to,date:it.date,airline:it.airline||'',fareA:it.fareA!=null?String(it.fareA):'',isReturn:!!it.isReturn}))}
    if(it.kind==='visa'){S.chosen.add('visa');S.svc.visa.push(otherRow({country:it.country,vtype:'Tourism',date:d.start}))}
  }
  for(const k of ['adult','cbed','cnob','infant']) if(q.prices&&q.prices[k]) Object.assign(S.prices[k],Object.fromEntries(Object.entries(q.prices[k]).map(([a,b])=>[a,String(b)])));
}

function statusLine(){
  const d=TN.deal(S.dealId),own=d&&d.owner===meKey()?'You':(d&&TN.person(d.owner)?TN.person(d.owner).name:'—');
  const st=S.returned?`Fixing version ${S.version-1} · draft`:S.from?`Draft from quotation ${esc(S.from)} · version ${S.version}`:`Draft · version ${S.version}`;
  return`Deal from Bitrix · ${st} · Owner: ${esc(own)}`;
}
function returnedNote(){
  if(!S.returned)return'';
  return`<div class="note bad" style="margin-top:16px">${ic('alert')}<div><b>Accounts returned this booking.</b> Accounts wrote: ${esc(S.returned)} Fix it and send again; departments keep their tasks. <button class="btn link" type="button" data-gobill>Go to Bill To</button></div></div>`;
}
/* Keep "Submit booking and create tasks" in step with "Before you submit" (it only changed on a full render). */
function syncSubmit(){
  const sb=$('#submitBtn');if(!sb)return;const left=readyItems().filter(x=>!x.done).length;
  if(left)sb.setAttribute('aria-disabled','true');else sb.removeAttribute('aria-disabled');
  let h=sb.parentElement.querySelector('.hint');
  if(left&&!h){h=document.createElement('span');h.className='hint';sb.after(h)}
  if(h){if(left)h.textContent=`Finish ${plural(left,'thing')} first (see the list at the top).`;else h.remove()}
}
function markStarted(){const d=TN.deal(S.dealId);if(d&&d.bookingState==='not_started')d.bookingState='in_progress'}
function refreshFromBitrix(){
  const d=TN.deal(S.dealId);S.bx=bxFromDeal(d);syncPaxSlots();render();
  toast('Read the Bitrix Deal just now. The trip facts here match Bitrix.');
}

/* Bill To: find a customer in the customer list. */
function bindBillFind(inp){
  const fld=inp.closest('.f');fld.classList.add('combo');
  let list=$('#billList');if(!list){list=document.createElement('div');list.className='combo-list';list.id='billList';list.setAttribute('role','listbox');list.hidden=true;fld.appendChild(list)}
  const hint=$('#billFindHint');
  const pick=id=>{const c=TN.customer(id);
    Object.assign(S.bill,{mode:'form',type:c.business?'business':'personal',name:c.name,contact:c.contact||'',phone:c.phone,email:c.email||'',addr:c.address||'',city:c.city||'',state:c.state||'',pin:c.pin||'',gst:c.business?(c.gstin?'GST registered':''):'',gstin:c.gstin||''});
    render();autosave('bill',billIssues);toast('Bill To filled from the customer list. Accounts checks it before use.')};
  inp.oninput=()=>{
    const q=inp.value.trim().toLowerCase();
    if(q.length<2){hint.textContent='Type 2 letters.';list.hidden=true;return}
    const digits=q.replace(/\D/g,'');
    const res=Object.entries(TN.DATA.customers).filter(([,c])=>c.name.toLowerCase().includes(q)||(c.contact||'').toLowerCase().includes(q)||(c.gstin||'').toLowerCase().includes(q)||(digits.length>=4&&c.phone.replace(/\D/g,'').includes(digits))).slice(0,6);
    if(!res.length){hint.textContent='No customer found. Use "Add customer".';list.hidden=true;return}
    hint.textContent=plural(res.length,'customer')+' found.';
    list.innerHTML=res.map(([id,c])=>`<div class="combo-opt" role="option" aria-selected="false" data-cid="${id}"><span>${esc(c.name)}<small>${esc(c.phone)} · ${esc(c.city)}${c.gstin?' · GSTIN '+esc(c.gstin):''}</small></span></div>`).join('');
    list.hidden=false;
    list.querySelectorAll('[data-cid]').forEach(o=>o.onmousedown=e=>{e.preventDefault();pick(o.dataset.cid)});
  };
  inp.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();const o=list.querySelector('[data-cid]');if(o&&!list.hidden)pick(o.dataset.cid)}if(e.key==='Escape')list.hidden=true};
  inp.onblur=()=>setTimeout(()=>{list.hidden=true},120);
}

/* "Payment already received?": Sales reports it; it is not money until Accounts records and checks a receipt. */
function sendClaim(){
  const box=$('#sec-claim'),sel=box.querySelector('select'),ins=[...box.querySelectorAll('input')];
  const [amt,date,by,ref,acct]=ins.map(i=>i.value.trim());
  const a=Number(String(amt).replace(/[^\d.]/g,''));
  if(!(a>0)||!date){toast(!(a>0)?'Enter the amount the customer paid. Nothing was sent.':'Add the date it was paid. Nothing was sent.');return}
  const id='PR-'+String(43+TN.DATA.paymentReports.length).padStart(4,'0');
  TN.DATA.paymentReports.unshift({id,deal:S.dealId,mode:sel.value,amount:a,date,ref,paidBy:by,to:acct,status:'reported',by:meKey(),proof:null});
  TN.DATA.notices.unshift({id:'n-'+id,to:['accounts','checker'],kind:'notice',text:`Payment reported for ${TN.deal(S.dealId).title}: ${inr(a)} by ${sel.value}. Record and check a receipt before it counts.`,deal:S.dealId,at:TN.TODAY+' '+nowHM()});
  ins.forEach(i=>i.value='');S.claimOpen=false;render();
  toast(`Sent to Accounts as ${id}. It is not money until a receipt is recorded and checked.`);
}

/* Submit: one task per sold service, Deal waits for Accounts. Budget = Sales' cost estimate. */
function flightBudget(f){
  const n=k=>f.pax.filter(id=>S.pax.find(p=>p.id===id)?.type===TYPE_OF[k]).length;
  const parts=[['A','fareA'],['C','fareC'],['I','fareI']].filter(([k,fk])=>n(k)&&f[fk]!==''&&f[fk]!=null);
  return parts.length?parts.reduce((s,[k,fk])=>s+Number(f[fk])*n(k),0):null;
}
function submitBooking(){
  const d=TN.deal(S.dealId),ps=priceState(),me=TN.me(),num3=d.id.slice(-3);
  const rows=[];
  const add=(r,svc)=>rows.push({srcId:r.srcId,svc});
  S.svc.hotel.forEach(r=>add(r,{kind:'hotel',dept:'purchase',title:`${r.hotel}, ${r.city}`,detail:[plural(Number(r.nights),'night'),roomsText(r),r.room,r.meal].filter(Boolean).join(' · '),start:r.checkin,end:addDays(r.checkin,r.nights),goAhead:'waiting',budget:hotelCost(r)}));
  S.svc.car.forEach(r=>add(r,{kind:'transfer',dept:'purchase',title:`${CAR_KINDS[r.kind]}: ${r.kind==='full'?r.route:r.pickup+' to '+r.drop}`,detail:`${r.qty} × ${r.vehicle}${r.time?' · '+r.time:''}`,start:r.kind==='full'?r.start:r.date,end:r.kind==='full'?r.end:r.date,goAhead:null,budget:r.rate?Number(r.rate)*Number(r.qty):null}));
  const typedFare=['A','C','I'].reduce((s,k)=>s+(S.fare[k]?Number(S.fare[k])*flyersOf(k):0),0);
  S.svc.flight.forEach((r,i)=>add(r,{kind:'flight',dept:'flight',title:r.mode==='shot'?`Flight from screenshot${r.note?': '+r.note:''}`:`${r.from} to ${r.to}`,detail:[[r.airline,r.no].filter(Boolean).join(' '),plural(r.pax.length,'passenger')].filter(Boolean).join(' · '),start:r.date,end:r.adate||r.date,budget:flightBudget(r)??(i===0&&typedFare?typedFare:null)}));
  S.svc.activity.forEach(r=>add(r,{kind:'activity',dept:'purchase',title:r.name,detail:`${r.city} · ${plural(r.pax.length,'person','people')}`,start:r.date,end:r.date,goAhead:null,budget:null}));
  S.svc.visa.forEach(r=>add(r,{kind:'visa',dept:'visa',title:`${r.country} ${r.vtype.toLowerCase()} visa`,detail:plural(r.pax.length,'traveller'),start:r.date,end:r.date,budget:null}));
  S.svc.passport.forEach(r=>add(r,{kind:'passport',dept:'visa',title:`Passport, ${r.atype.toLowerCase()} application`,detail:`${r.city} passport office`,start:'',end:'',budget:null}));
  const ids=[];let n=0;
  for(const {srcId,svc} of rows){
    if(srcId&&TN.DATA.services[srcId]){Object.assign(TN.DATA.services[srcId],svc,{deal:d.id});ids.push(srcId);continue}
    let id;do{n++;id=`s-${num3}-${svc.kind[0]}${n}`}while(TN.DATA.services[id]);
    TN.DATA.services[id]={deal:d.id,assignee:null,taskStatus:'new',...svc};ids.push(id);
  }
  const cost=rows.reduce((s,r)=>s+(r.svc.budget||0),0);
  Object.assign(d,{bookingState:'waiting_for_accounts',accountsReview:'waiting',submittedAt:TN.TODAY,sellingPrice:ps.total,costEstimate:cost||null,services:ids,bookingVersion:S.version,billTo:{...S.bill},returnReason:null});
  TN.DATA.instalments=TN.DATA.instalments.filter(x=>x.deal!==d.id);
  S.plan.forEach(x=>TN.DATA.instalments.push({deal:d.id,label:x.label,due:x.due,amount:Number(x.amount)||0,paid:0,status:'due'}));
  TN.DATA.notices.unshift({id:'n-bk-'+d.id+'-'+S.version,to:['accounts','checker'],kind:'notice',
    text:S.returned?`${me.name} fixed and sent again ${d.title} (version ${S.version}). Check the Bill To again.`:`New booking to check: ${d.title}, submitted by ${me.name}. ${plural(ids.length,'service')}, ${inr(ps.total)}.`,
    deal:d.id,at:TN.TODAY+' '+nowHM()});
  delete STATES[d.id];
  TN.toast(S.returned?`Booking sent again (version ${S.version}). Departments keep their tasks. Accounts checks it next.`:`Booking submitted (version ${S.version}). ${plural(ids.length,'task')} created. Accounts checks it next.`);
  TN.go('/app/deals/'+d.id);
}

/* ---------- Page ---------- */
TN.page('/app/deals/:id/book',{nav:'/app/deals',roles:['sales','manager'],title:'Book now',
  render(p){
    const d=TN.deal(p.id);
    if(!d)return`<div class="note danger" role="alert"><p><strong>Deal not found.</strong> Check the Deal number, or open it from the Deals list.</p><p><a href="#/app/deals">Back to deals</a></p></div>`;
    if(!OPEN_STATES.includes(d.bookingState))return'';
    return`<div class="bf" id="bf-root"><div class="bf-app" id="bf-app"></div><div id="bf-layer"></div><div id="bf-dlg"></div><div id="bf-toast"></div></div>`;
  },
  mount(root,p){
    const d=TN.deal(p.id);if(!d)return;
    if(!OPEN_STATES.includes(d.bookingState)){
      setTimeout(()=>{history.replaceState(null,'','#/app/deals/'+d.id);TN.render();TN.toast(d.bookingState==='lost'?'This Deal is lost in Bitrix, so Book now is closed.':'This booking is submitted. Submitted details are locked; Accounts returns it if something must change.')},0);
      return;
    }
    S=stateFor(p.id);render();
    R().addEventListener('click',e=>{if(e.target.closest('[data-gobill]'))go(3,'sec-bill')});
  }
});
TN.bookNow={stateFor:id=>STATES[id]||null};

})();
