// Run with: node build/tests/purchase-negotiation.test.js
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../src/40-purchase.js'), 'utf8');
const section = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
const ledger = section('  const RATE_TYPES', '  // Sort history newest first');
const workflow = section('  function purchaseProgress', '  function workflowStepperCard');
const handler = section("  TN.act('pur-record-rate'", "  TN.act('pur-withdraw'");
const renderer = section('  function supplierOffersCard', '  function bookingWithHotelCard');
const memory = new Map();
let failStorage = false;
function setup() {
  const services = {t: {dept:'purchase', kind:'hotel', title:'Task hotel', deal:'d', budget:100, assignee:'purchase', taskStatus:'in_progress'}, other: {dept:'purchase', kind:'hotel', title:'Other hotel', deal:'d2'}};
  const work = () => ({offers:[],costs:[],files:[],history:[],emails:[],approvals:{}});
  let sequence = 0;
  const context = {
    D: {services, suppliers:{h:{name:'Hotel',status:'active',type:'Hotel',services:['hotel']}, dmc:{name:'DMC',status:'active',type:'Destination company',services:['hotel']}},supplierPayments:[]},
    W: {t:work(),other:work()},
    TN:{act:(key, fn)=>context.action=fn, refresh:()=>context.refreshes++, go:()=>{}, toast:(message)=>context.notifications.push(message),supplier:(id)=>context.D.suppliers[id]},
    localStorage:{getItem:(key)=>memory.get(key)||null,setItem:(key,value)=>{if(failStorage)throw Error('quota');memory.set(key,value)}},
    refreshes:0,notifications:[],error:'',allowed:true,
    getTask:(el)=>[el.dataset.id,context.D.services[el.dataset.id]],canWork:()=>context.allowed,
    refuse:(el,message)=>context.error=message,ERR:{invalid:'invalid',forbidden:'forbidden'},
    FormData:class {constructor(el){this.data=el.data}get(key){return this.data[key]}},
    NUM:(v)=>{const n=Number(String(v||'').replace(/[,\s]/g,''));return Number.isFinite(n)?n:NaN},
    shortHotel:(x)=>x,latestCost:(id)=>context.W[id].costs.at(-1),
    uid:()=>`test-${++sequence}`,now:()=> '2026-10-31 12:00',meKey:()=> 'purchase',
    pushNotice:()=>{},
    log:(id,text)=>context.W[id].history.push({text}),done:()=>context.TN.refresh(),
    isConfirmed:(s)=>['supplier_confirmed','done'].includes(s.taskStatus),
    workCostIssue:(id,s)=>{const c=context.W[id].costs.at(-1);const o=c&&context.W[id].offers.find(o=>o.id===c.offer&&o.status!=='withdrawn');return !o||o.supplier!==s.supplier||s.budget==null?'blocked':''},
    esc:(v)=>String(v??'').replaceAll('<','&lt;'),dt:(v)=>v,name:(v)=>v,
    rupees:(v)=>v==null?'-':'INR '+v,pill:(tone,icon,label)=>label,
    ic:()=>'<svg></svg>',C:{},offerView:(o)=>({hotelRate:o.price,ourOffer:o.ourOffer,finalRate:o.finalRate}),vsBudgetHtml:()=>'',
    field:(id,label,input)=>`<label>${label}</label>${input}`,slot:()=>'',card:(id,title,sub,body)=>body,
    Date,console
  };
  vm.createContext(context);
  vm.runInContext(ledger+workflow+handler+renderer+'\nthis.records=rateRecords;this.rows=negotiationRows;this.progress=purchaseProgress;this.render=supplierOffersCard;this.persist=persistPurchase;',context);
  return context;
}
function form(kind, amount, remark='', supplier='h') {
  return {dataset:{id:'t'},data:{kind,amountRupees:amount,source:supplier==='h'?'hotel':'supplier',supplierChoice:(supplier==='h'?'Hotel':'DMC')+' ['+supplier+']',hotelName:'Task hotel',remark},querySelector:()=>({disabled:false})};
}
const flags=(c)=>Array.from(c.progress('t',c.D.services.t,c.W.t),x=>x.done);
let c=setup();
assert.match(c.render('t',c.D.services.t,c.W.t,true,null,false), /No rates recorded yet/);
failStorage=true; c.action(form('hotel_said','90')); assert.equal(c.D.services.t.supplier,undefined); assert.equal(c.records('t').length,0); failStorage=false;
assert.deepEqual(flags(c),[true,false,false,false,false]);
for(const n of ['0','-1','NaN','Infinity'])c.action(form('hotel_said',n));
assert.equal(c.records('t').length,0);
for (const [key,value] of [['hotelName','Wrong hotel'],['supplierChoice','Unknown'],['kind','unknown']]) { const bad=form('hotel_said','90'); bad.data[key]=value; c.action(bad); assert.equal(c.records('t').length,0); }
c.allowed=false;c.action(form('hotel_said','90'));assert.equal(c.error,'forbidden');c.allowed=true;
let f=form('hotel_said','110');c.action(f);c.action(f);
assert.equal(c.records('t').length,1);assert.equal(c.refreshes,1);
assert.deepEqual(flags(c),[true,true,false,false,false]);
c.action(form('we_offered','95'));c.action(form('supplier_revised','94'));
assert.equal(flags(c)[2],false);
c.action(form('final_agreed','105'));assert.equal(flags(c)[2],false);
const firstFinal=c.records('t').at(-1);assert.ok(Object.isFrozen(c.W.t.offers[0].rates.at(-1)));
c.W.t.approvals[c.W.t.costs.at(-1).v]={by:'manager'};assert.equal(flags(c)[2],true);
c.action(form('final_agreed','90'));assert.match(c.error,/remark/);assert.equal(c.records('t').length,4);
c.action(form('final_agreed','90','New agreement'));assert.equal(c.records('t').length,5);assert.equal(firstFinal.amount,105);
assert.equal(c.W.t.costs.length,2);assert.equal(flags(c)[2],true);
assert.equal(c.records('other').length,0);
for(const r of c.records('t')){assert.ok(r.id&&r.by&&r.at&&r.hotelId);assert.equal(r.task,'t')}
assert.deepEqual(Array.from(c.records('t'),r=>r.round),[1,2,3,4,5]);
let html=c.render('t',c.D.services.t,c.W.t,true,null,false);
assert.doesNotMatch(html,/Rate History|Supplier offers/);assert.match(html,/Rate negotiation history/);assert.doesNotMatch(html,/rate-summary/);
// Separate supplier, same task hotel, without silently changing the chosen final supplier.
c.action(form('hotel_said','88','','dmc'));assert.equal(c.W.t.offers.length,2);assert.equal(c.D.services.t.supplier,'h');
assert.equal(c.records('t').at(-1).supplierId,'dmc');assert.equal(c.records('t').at(-1).hotelId,firstFinal.hotelId);
// Persistence failure rolls back the whole attempted rate and cost change.
failStorage=true;let retry=form('final_agreed','87','Revision');c.action(retry);assert.equal(c.records('t').length,6);assert.match(c.error,/browser storage/);assert.equal(retry.dataset.saved,'false');failStorage=false;
c.persist();c=setup();assert.equal(c.records('t').length,6);assert.equal(c.W.t.costs.length,2);assert.equal(flags(c)[2],true);
// Confirmation status alone is insufficient; proof and recorder are required.
c.D.services.t.taskStatus='supplier_confirmed';assert.equal(flags(c)[3],false);
c.W.t.confirmedAt='2026-10-31 12:01';c.W.t.confirmedBy='purchase';c.W.t.files.push({kind:'supplier_confirmation',state:'stored'});assert.equal(flags(c)[3],true);
c.D.supplierPayments.push({service:'t',supplier:'h',amount:90,status:'approved'});assert.equal(flags(c)[4],false);
c.D.supplierPayments[0].status='paid';c.D.supplierPayments[0].amount=45;assert.equal(flags(c)[4],false);
c.D.supplierPayments.push({service:'t',supplier:'h',amount:45,status:'verified'});assert.equal(flags(c)[4],true);
c.TN.refresh();c=setup();assert.equal(flags(c)[4],true);assert.equal(c.records('t').length,6);
c.action(form('final_agreed','80','Payment locked'));assert.equal(c.records('t').length,6);
console.log('PASS: canonical ledger, synchronized history/table/summary, versions, permissions, validation, duplicate prevention, storage reload/rollback, separate suppliers, approvals, booking proof, Accounts payment completion.');

// Editing and confirming retain one visible row and update its amount columns.
memory.clear(); c=setup();
c.action(form('hotel_said','100'));
const initialId=c.records('t')[0].id;
let edit=form('hotel_said','98');edit.dataset.parentRate=initialId;c.action(edit);
assert.equal(c.rows('t').length,1);assert.equal(c.rows('t')[0].amounts.hotel,98);
edit=form('we_offered','95');edit.dataset.parentRate=c.records('t').at(-1).id;c.action(edit);
assert.equal(c.rows('t').length,1);assert.equal(c.rows('t')[0].amounts.counter,95);
edit=form('final_agreed','90');edit.dataset.parentRate=c.records('t').at(-1).id;c.action(edit);
assert.equal(c.rows('t').length,1);assert.equal(c.rows('t')[0].amounts.final,90);assert.equal(c.rows('t')[0].round,1);
assert.equal(c.records('t')[0].amount,100);assert.equal(c.records('t').length,4);
c.persist();c=setup();assert.equal(c.rows('t').length,1);assert.equal(c.rows('t')[0].amounts.hotel,98);assert.equal(c.rows('t')[0].amounts.counter,95);assert.equal(c.rows('t')[0].amounts.final,90);
console.log('PASS: edits update hotel/counter/final columns on the same row, survive reload and preserve original audit values.');
module.exports = { setup, memory, form };
