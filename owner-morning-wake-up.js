(() => {
'use strict';
if (window.__dashOwnerToolsLoaded) return;
window.__dashOwnerToolsLoaded = true;

const SUPABASE_URL = 'https://roywoofgypiyoobdcrwx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let client;
function db(){
  return client || (client = window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}));
}
function esc(v){return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v){return Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});}
function dateOf(x){return new Date(x.completed_at||x.created_at||x.updated_at||0).getTime();}
function trend(current,previous,reverse=false){
  if(previous==null)return {label:'Not enough history',icon:'⚪'};
  const d=Number(current)-Number(previous);
  if(reverse)return d < -1 ? {label:'Improving',icon:'🟢'} : d > 1 ? {label:'Declining',icon:'🔴'} : {label:'Stable',icon:'🟡'};
  return d > 1 ? {label:'Improving',icon:'🟢'} : d < -1 ? {label:'Declining',icon:'🔴'} : {label:'Stable',icon:'🟡'};
}
function addStyles(){
  if(document.getElementById('dashOwnerToolsStyles'))return;
  const s=document.createElement('style');s.id='dashOwnerToolsStyles';
  s.textContent=`
  .ot-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .ot-card{background:#fff;border:1px solid #e2e7ed;border-radius:12px;padding:18px}
  .ot-card h3{margin:0 0 7px;font-size:16px}
  .ot-form{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px}
  .ot-form .full{grid-column:1/-1}
  .ot-form label{display:block;font-size:11px;font-weight:800;color:#475569;margin-bottom:5px}
  .ot-form input,.ot-form select,.ot-form textarea{width:100%;padding:9px;border:1px solid #cbd5e1;border-radius:7px;background:#fff;font:inherit}
  .ot-form textarea{min-height:78px;resize:vertical}
  .ot-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-top:14px}
  .ot-record{border:1px solid #e2e7ed;border-radius:9px;padding:14px;margin-bottom:10px;background:#fff}
  .ot-record h3{margin:0 0 7px;font-size:14px}
  .ot-meta{font-size:12px;color:#64748b;margin:4px 0}
  .ot-note{padding:12px;border-left:4px solid #3b82f6;background:#eff6ff;border-radius:7px;font-size:12px;margin-bottom:16px}
  @media(max-width:800px){.ot-grid,.ot-form{grid-template-columns:1fr}.ot-form .full{grid-column:auto}}
  `;
  document.head.appendChild(s);
}

async function getDashboard(){
  const c=db();
  if(!c)throw new Error('Supabase is unavailable.');
  const {data,error}=await c.rpc('get_owner_management_dashboard');
  if(error)throw error;
  return data||{};
}

function mountMorning(){
  let host=document.querySelector('[data-owner-morning-wake-up]')||document.getElementById('owner-morning-wake-up');
  if(!host){
    const main=document.querySelector('main'); if(!main)return null;
    host=document.createElement('div');host.id='owner-morning-wake-up';host.dataset.ownerMorningWakeUp='1';host.style.marginBottom='18px';
    const top=main.querySelector('.top');
    if(top&&top.nextSibling)main.insertBefore(host,top.nextSibling);else main.insertBefore(host,main.firstChild);
  }
  return host;
}

async function loadMorning(){
  const host=mountMorning();if(!host)return;
  try{
    const d=await getDashboard(),jobs=d.jobs||[],customers=d.customers||[],complaints=d.complaints||[],inventory=d.inventory||[],supply=d.supply_requests||[],performance=d.performance||[],financial=d.financials||{};
    const now=Date.now(),w=30*86400000;
    const completed=jobs.filter(x=>['completed','complete','closed'].includes(String(x.status||'').toLowerCase()));
    const recent=completed.filter(x=>{const t=dateOf(x);return t>now-w&&t<=now}).length;
    const prior=completed.filter(x=>{const t=dateOf(x);return t>now-2*w&&t<=now-w}).length;
    const cr=complaints.filter(x=>{const t=dateOf(x);return t>now-w&&t<=now}).length;
    const cp=complaints.filter(x=>{const t=dateOf(x);return t>now-2*w&&t<=now-w}).length;
    const demand=trend(recent,prior),quality=trend(cr,cp,true);
    const popularity=recent||prior?Math.max(0,Math.min(100,Math.round(50+(recent-prior)/Math.max(1,prior)*50))):null;
    const revenue=jobs.reduce((s,x)=>s+Number(x.actual_revenue??x.estimated_revenue??0),0);
    const costs=jobs.reduce((s,x)=>s+Number(x.actual_direct_cost??x.estimated_direct_cost??0)+Number(x.actual_overhead??x.estimated_overhead??0),0);
    const profit=revenue-costs;
    const low=inventory.filter(x=>Number(x.current_stock||0)<=Number(x.minimum_stock||0)).length;
    const pending=supply.filter(x=>String(x.status||'').toLowerCase()==='pending').length;
    const flagged=performance.filter(x=>Number(x.overall_rating)<=Number(d.policy?.fireable_threshold??60)).length;
    host.innerHTML=`<section class="dash-morning panel"><div class="head"><div><h2>Owner Morning Wake-Up</h2><p class="muted">One owner-level snapshot using the same shared business data as the management systems.</p></div><span class="pill">Owner only · Shared data source</span></div><div class="body"><div class="dash-morning-grid"><div class="card"><div class="label">COMPANY POPULARITY / DEMAND</div><div class="value">${popularity==null?'—':popularity+'%'}</div><div class="muted">${popularity==null?'Need more job history':demand.icon+' '+demand.label+' · '+recent+' recent vs '+prior+' prior completed jobs'}</div></div><div class="card"><div class="label">QUALITY DIRECTION</div><div class="value">${quality.icon} ${esc(quality.label)}</div><div class="muted">${cr} complaints recently vs ${cp} previously</div></div><div class="card"><div class="label">COMPANY PROFIT IN DATASET</div><div class="value">${money(profit)}</div><div class="muted">Revenue ${money(revenue)} · costs ${money(costs)}</div></div><div class="card"><div class="label">OWNER FLAGS</div><div class="value">${flagged+pending+low}</div><div class="muted">${flagged} performance · ${pending} supply · ${low} low inventory</div></div></div><div class="dash-morning-note notice"><b>Morning read:</b> ${demand.icon} Demand is <b>${esc(demand.label.toLowerCase())}</b>; quality is <b>${esc(quality.label.toLowerCase())}</b>. ${customers.length} customers, ${completed.length} completed jobs in the loaded owner dataset, and ${financial.period_year?'financial period '+esc(financial.period_year)+'-'+esc(financial.period_month):'no current financial period recorded'}.</div></div></section>`;
  }catch(e){host.innerHTML='<div class="notice"><b>Business health data unavailable.</b><br><span class="muted">'+esc(e.message)+'</span></div>';}
}

function addTransferTab(){
  const tabs=document.querySelector('.tabs');
  if(!tabs)return false;
  let button=document.querySelector('[data-owner-tab="ownershipTransfer"]');
  if(!button){
    button=document.createElement('button');button.className='tab';button.type='button';button.dataset.ownerTab='ownershipTransfer';button.textContent='Ownership Transfer';tabs.appendChild(button);
  }
  button.onclick=function(e){
    e.preventDefault();e.stopPropagation();
    document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
    const section=document.getElementById('ownershipTransfer');if(section)section.classList.add('active');
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));button.classList.add('active');
    try{history.replaceState(null,'','#ownershipTransfer')}catch(_){ }
    loadTransfers();
  };
  return true;
}

function field(id,label,type='text',full=false,placeholder=''){return `<div class="${full?'full':''}"><label>${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}"></div>`;}
function area(id,label,full=false,placeholder=''){return `<div class="${full?'full':''}"><label>${label}</label><textarea id="${id}" placeholder="${placeholder}"></textarea></div>`;}
function select(id,label,options){return `<div><label>${label}</label><select id="${id}">${options.map(x=>`<option value="${esc(x[0])}">${esc(x[1])}</option>`).join('')}</select></div>`;}
function v(id){return document.getElementById(id)?.value?.trim()||'';}

function addTransferSection(){
  if(document.getElementById('ownershipTransfer'))return true;
  const main=document.querySelector('main');if(!main)return false;
  const sec=document.createElement('section');sec.id='ownershipTransfer';sec.className='section';
  sec.innerHTML=`<div class="panel"><div class="head"><div><h2>Ownership Transfer</h2><div class="muted">Owner / Super Admin only · Internal records for items received from customers and later transferred to a pawn shop / buyer.</div></div><span class="pill">Owner only</span></div><div class="body"><div class="ot-note"><b>Internal recordkeeping:</b> Complete the Customer → DASH document when the item is actually received from the customer. Complete the DASH → Pawn Shop / Buyer document when the buyer receives the item. Keep the pawn-shop receipt or ticket with the company record when available. These records do not replace any document required by a buyer, pawn shop, or applicable law.</div><div class="ot-grid"><div class="ot-card"><h3>Customer → DASH</h3><p class="muted">Customer transfer of possession to DASH.</p><div class="ot-form">${field('ot_cust_name','Customer Name')}${field('ot_cust_phone','Customer Phone')}${field('ot_cust_email','Customer Email','email')}${field('ot_cust_address','Customer Address','text',true)}${field('ot_item_desc','Item Description','text',true)}${field('ot_item_brand','Brand')}${field('ot_item_model','Model')}${field('ot_item_serial','Serial Number')}${field('ot_item_condition','Condition')}${field('ot_quantity','Quantity','number')} ${area('ot_cust_accessories','Accessories / Components Included',true,'Example: remote, power cord, stand, cables')}${area('ot_cust_reps','Customer Representations / Notes',true,'Record relevant ownership or item information')}${field('ot_cust_sig','Customer Signature / Printed Name')}${field('ot_dash_name','DASH Representative Name')}${field('ot_dash_sig','DASH Representative Signature')}</div><div class="ot-actions"><button class="btn" type="button" id="otSaveCustomer">Save Customer → DASH</button></div></div><div class="ot-card"><h3>DASH → Pawn Shop / Buyer</h3><p class="muted">Internal acknowledgment that the buyer received the item from DASH.</p><div class="ot-form">${field('ot_buyer_name','Pawn Shop / Buyer Name')}${field('ot_buyer_phone','Business Phone')}${field('ot_buyer_address','Business Address','text',true)}${field('ot_buyer_city','City')}${field('ot_buyer_state','State')}${field('ot_buyer_zip','ZIP')}${select('ot_tx_type','Transaction Type',[['Purchase','Purchase'],['Pawn Transaction','Pawn Transaction'],['Other','Other']])}${field('ot_tx_number','Pawn Shop Transaction / Ticket Number')}${field('ot_amount','Amount Received by DASH','number')}${select('ot_payment','Payment Method',[['Cash','Cash'],['Check','Check'],['Electronic','Electronic'],['Other','Other']])}${field('ot_receipt_number','Receipt / Memorandum Number')}${field('ot_dash_rep','DASH Representative Name')}${field('ot_dash_rep_sig','DASH Representative Signature')}${field('ot_pawn_emp','Pawn Shop Employee Name')}${field('ot_pawn_emp_sig','Pawn Shop Employee Signature')}${area('ot_notes','Internal Notes',true,'Record anything useful for the company file')}</div><div class="ot-actions"><button class="btn" type="button" id="otSavePawn">Save DASH → Pawn Shop</button></div></div></div><div class="panel" style="margin-top:18px"><div class="head"><h2>Saved Ownership Transfer Records</h2><button class="btn light" type="button" id="otRefresh">Refresh</button></div><div class="body" id="otRecords"><div class="empty"><strong>No ownership transfer records loaded</strong></div></div></div></div></section>`;
  main.appendChild(sec);
  document.getElementById('otSaveCustomer').onclick=()=>saveTransfer('customer_to_dash');
  document.getElementById('otSavePawn').onclick=()=>saveTransfer('dash_to_pawnshop');
  document.getElementById('otRefresh').onclick=loadTransfers;
  return true;
}

function transferRecord(type){
  const base={transfer_type:type,document_number:'OT-'+Date.now(),transfer_date:new Date().toISOString().slice(0,10),item_description:v('ot_item_desc')||'Item transferred',quantity:Number(document.getElementById('ot_quantity')?.value||1)};
  if(type==='customer_to_dash')return {...base,customer_name:v('ot_cust_name'),customer_phone:v('ot_cust_phone'),customer_email:v('ot_cust_email'),customer_address:v('ot_cust_address'),item_brand:v('ot_item_brand'),item_model:v('ot_item_model'),item_serial_number:v('ot_item_serial'),item_condition:v('ot_item_condition'),accessories_included:v('ot_cust_accessories'),customer_representations:v('ot_cust_reps'),customer_signature:v('ot_cust_sig'),dash_representative_name:v('ot_dash_name'),dash_representative_signature:v('ot_dash_sig')};
  return {...base,pawn_shop_buyer_name:v('ot_buyer_name'),pawn_shop_phone:v('ot_buyer_phone'),pawn_shop_business_address:v('ot_buyer_address'),pawn_shop_city:v('ot_buyer_city'),pawn_shop_state:v('ot_buyer_state'),pawn_shop_zip:v('ot_buyer_zip'),transaction_type:v('ot_tx_type'),pawn_shop_transaction_number:v('ot_tx_number'),amount_received:v('ot_amount'),payment_method:v('ot_payment'),receipt_attached:!!v('ot_receipt_number'),receipt_number:v('ot_receipt_number'),dash_representative_name:v('ot_dash_rep'),dash_representative_signature:v('ot_dash_rep_sig'),pawn_shop_employee_name:v('ot_pawn_emp'),pawn_shop_employee_signature:v('ot_pawn_emp_sig'),notes:v('ot_notes')};
}

async function saveTransfer(type){
  const c=db();if(!c)return alert('Supabase is unavailable.');
  if(!v('ot_item_desc'))return alert('Enter the item description.');
  if(type==='customer_to_dash'&&!v('ot_cust_name'))return alert('Enter the customer name.');
  if(type==='dash_to_pawnshop'&&!v('ot_buyer_name'))return alert('Enter the pawn shop / buyer name.');
  if(type==='dash_to_pawnshop'&&!v('ot_pawn_emp'))return alert('Enter the pawn shop employee name.');
  const {error}=await c.rpc('owner_create_ownership_transfer',{p_record:transferRecord(type)});
  if(error)return alert(error.message);
  alert('Ownership transfer record saved.');
  document.querySelectorAll('#ownershipTransfer input,#ownershipTransfer textarea').forEach(e=>e.value='');
  const q=document.getElementById('ot_quantity');if(q)q.value='1';
  loadTransfers();
}

async function loadTransfers(){
  const box=document.getElementById('otRecords');if(!box)return;
  const c=db();if(!c){box.innerHTML='<div class="empty">Supabase unavailable.</div>';return;}
  box.innerHTML='<div class="empty"><strong>Loading ownership transfer records...</strong></div>';
  const {data,error}=await c.rpc('owner_list_ownership_transfers');
  if(error){box.innerHTML='<div class="empty"><strong>Records could not be loaded</strong><p>'+esc(error.message)+'</p></div>';return;}
  const records=Array.isArray(data)?data:[];window.__dashTransferRecords=records;
  if(!records.length){box.innerHTML='<div class="empty"><strong>No ownership transfer records yet</strong>Saved records will appear here.</div>';return;}
  box.innerHTML=records.map(r=>{const label=r.transfer_type==='customer_to_dash'?'Customer → DASH':'DASH → Pawn Shop / Buyer';const party=r.transfer_type==='customer_to_dash'?r.customer_name:r.pawn_shop_buyer_name;const amount=r.amount_received==null?'':' · Amount received by DASH: '+money(r.amount_received);return `<div class="ot-record"><h3>${esc(label)}</h3><div class="ot-meta"><b>Document:</b> ${esc(r.document_number)} · <b>Date:</b> ${esc(r.transfer_date)}</div><div class="ot-meta"><b>Party:</b> ${esc(party||'Not recorded')} · <b>Item:</b> ${esc(r.item_description)}${amount}</div><div class="ot-meta"><b>Signature:</b> ${esc(r.customer_signature||r.pawn_shop_employee_signature||'Not recorded')}</div><div class="ot-actions"><button class="btn light" type="button" data-print-transfer="${esc(r.id)}">Print / Save PDF</button></div></div>`;}).join('');
  box.querySelectorAll('[data-print-transfer]').forEach(b=>b.onclick=()=>printTransfer(b.getAttribute('data-print-transfer')));
}

function printTransfer(id){
  const r=(window.__dashTransferRecords||[]).find(x=>String(x.id)===String(id));if(!r)return;
  const label=r.transfer_type==='customer_to_dash'?'CUSTOMER → DASH MOBILE SERVICES TRANSFER OF POSSESSION':'DASH MOBILE SERVICES → PAWN SHOP / BUYER TRANSFER RECORD';
  const lines=[label,'Document Number: '+(r.document_number||''),'Transfer Date: '+(r.transfer_date||''),'','ITEM','Description: '+(r.item_description||''),'Brand: '+(r.item_brand||''),'Model: '+(r.item_model||''),'Serial Number: '+(r.item_serial_number||''),'Condition: '+(r.item_condition||''),'Quantity: '+(r.quantity||1),''];
  if(r.transfer_type==='customer_to_dash')lines.push('CUSTOMER','Name: '+(r.customer_name||''),'Phone: '+(r.customer_phone||''),'Address: '+(r.customer_address||''),'Accessories / Components Included: '+(r.accessories_included||''),'Customer Representations / Notes: '+(r.customer_representations||''),'Customer Signature / Printed Name: '+(r.customer_signature||''),'DASH Representative: '+(r.dash_representative_name||''),'DASH Representative Signature: '+(r.dash_representative_signature||'');
  else lines.push('PAWN SHOP / BUYER','Name: '+(r.pawn_shop_buyer_name||''),'Business Address: '+(r.pawn_shop_business_address||''),'City/State/ZIP: '+(r.pawn_shop_city||'')+', '+(r.pawn_shop_state||'')+' '+(r.pawn_shop_zip||''),'Phone: '+(r.pawn_shop_phone||''),'Transaction Type: '+(r.transaction_type||''),'Transaction / Ticket Number: '+(r.pawn_shop_transaction_number||''),'Amount Received by DASH: '+money(r.amount_received),'Payment Method: '+(r.payment_method||''),'Receipt / Memorandum Number: '+(r.receipt_number||''),'DASH Representative: '+(r.dash_representative_name||''),'DASH Representative Signature: '+(r.dash_representative_signature||''),'Pawn Shop Employee: '+(r.pawn_shop_employee_name||''),'Pawn Shop Employee Signature: '+(r.pawn_shop_employee_signature||''),'Internal Notes: '+(r.notes||'');
  const w=window.open('','_blank');if(!w)return;
  w.document.write('<!doctype html><title>'+esc(label)+'</title><style>body{font-family:Arial,sans-serif;padding:40px;white-space:pre-wrap;line-height:1.6}h1{font-size:20px}@media print{button{display:none}}</style><h1>'+esc(label)+'</h1><pre>'+esc(lines.join('\n'))+'</pre><button onclick="window.print()">Print / Save PDF</button>');w.document.close();
}

function setup(){
  addStyles();
  if(!addTransferTab())return false;
  if(!addTransferSection())return false;
  const hash=location.hash.replace('#','');
  if(hash==='ownershipTransfer')document.querySelector('[data-owner-tab="ownershipTransfer"]')?.click();
  return true;
}

function boot(){
  setup();
  loadMorning();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.DASH_OWNER_MORNING_REFRESH=loadMorning;
})();