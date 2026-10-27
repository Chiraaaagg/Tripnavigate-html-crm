
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
