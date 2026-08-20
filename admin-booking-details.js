(function(){
'use strict';
const API='https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/dash-admin-bookings';
const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
function token(){for(const k of Object.keys(localStorage)){if(!k.includes('auth-token'))continue;try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v?.access_token)return v.access_token}catch{}}return sessionStorage.getItem('supabase_access_token')||''}
async function getBookings(){const t=token();if(!t)throw Error('Your admin session has expired. Please sign in again.');const r=await fetch(API,{method:'GET',headers:{apikey:KEY,Authorization:'Bearer '+t},cache:'no-store'});const j=await r.json().catch(()=>({}));if(!r.ok||j.error)throw Error(j.error||'Unable to load booking details.');return Array.isArray(j.bookings)?j.bookings:[]}
function esc(x){return String(x??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]))}
function field(label,value){return '<div class="history-item"><h3>'+esc(label)+'</h3><p>'+esc(value===null||value===undefined||String(value).trim()===''?'Not recorded':value)+'</p></div>'}
function ensureModal(){let m=document.getElementById('liveBookingDetailsModal');if(m)return m;m=document.createElement('div');m.id='liveBookingDetailsModal';m.className='modal';m.innerHTML='<div class="modalbox"><div class="modalhead"><h2 id="liveBookingTitle">Booking Details</h2><button class="close" id="liveBookingClose" type="button">Close</button></div><div id="liveBookingBody"></div></div>';document.body.appendChild(m);m.querySelector('#liveBookingClose').onclick=()=>m.classList.remove('show');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});return m}
async function openLiveBooking(requestNumber){const m=ensureModal(),body=m.querySelector('#liveBookingBody');m.classList.add('show');body.innerHTML='<div class="empty"><strong>Loading booking details...</strong></div>';try{const rows=await getBookings(),b=rows.find(x=>String(x.request_number||x.client_request_number)===String(requestNumber));if(!b)throw Error('Booking details could not be found.');m.querySelector('#liveBookingTitle').textContent='Booking Details — '+(b.request_number||b.client_request_number||'DASH Request');body.innerHTML='<div class="statusline"><span class="pill">'+esc(b.request_status||'submitted')+'</span><span class="pill">Proof: '+esc(b.proof_status||'not_required')+'</span></div><div class="history-grid">'+field('Customer',[b.first_name,b.last_name].filter(Boolean).join(' '))+field('Phone',b.phone)+field('Email',b.email)+field('Service',b.service_name||b.service_key)+field('Vehicle Year',b.vehicle_year)+field('Vehicle Make',b.vehicle_make)+field('Vehicle Model',b.vehicle_model)+field('Engine',b.vehicle_engine)+field('Trim',b.vehicle_trim)+field('Preferred Date',b.preferred_date)+field('Preferred Time',b.preferred_time)+field('Address',b.full_address||[b.city,b.state,b.postal_code].filter(Boolean).join(', '))+field('Restrictions',b.restriction_answer)+field('Restriction Details',b.restriction_details)+field('Customer Notes',b.customer_notes)+field('Created',b.created_at)+field('Updated',b.updated_at)+'</div>'}catch(e){body.innerHTML='<div class="empty"><strong>Could not load booking</strong><p>'+esc(e.message)+'</p></div>'}}
function requestNumberFromRow(row){const el=row.querySelector('strong');return el?el.textContent.trim():''}
function addButton(row){if(!row||row.dataset.bookingButton==='1')return;const n=requestNumberFromRow(row);if(!n)return;row.dataset.bookingButton='1';row.style.cursor='pointer';row.title='Click to view booking details';const bar=row.querySelector('.toolbar')||row.appendChild(Object.assign(document.createElement('div'),{className:'toolbar'}));const b=document.createElement('button');b.className='btn light';b.type='button';b.dataset.liveBooking='1';b.textContent='View Details';bar.insertBefore(b,bar.firstChild)}
function scan(){document.querySelectorAll('#bookingList .row').forEach(addButton)}
function boot(){scan();document.addEventListener('click',function(e){const b=e.target.closest('[data-live-booking]');if(b){e.preventDefault();e.stopPropagation();const row=b.closest('.row');if(row)openLiveBooking(requestNumberFromRow(row));return}const row=e.target.closest('#bookingList .row');if(row&&!e.target.closest('button,a')){e.preventDefault();openLiveBooking(requestNumberFromRow(row))}},true);const list=document.getElementById('bookingList');if(list){new MutationObserver(scan).observe(list,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();window.openLiveBooking=openLiveBooking;

/* DASH BUSINESS OPTIMIZATION FRONTEND */
const BO_URL='https://roywoofgypiyoobdcrwx.supabase.co';
const BO_KEY=KEY;
const money=n=>Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
function optimizationMarkup(){
 const y=new Date().getFullYear();
 return `<div class="title"><div><h1>Business Optimization</h1><p>Use your DASH financial and operating targets to identify ways to improve revenue, profit, labor efficiency, and cash flow.</p></div></div>
 <div class="panel"><div class="head"><h2>📊 Live Financial Data — ${y}</h2><span class="pill" id="boLiveStatus">Loading...</span></div><div class="body">
 <div class="cards">
  <div class="card"><div class="label">GROSS REVENUE</div><div class="value" id="boGross">$0.00</div><div class="muted">Current calendar year</div></div>
  <div class="card"><div class="label">BUSINESS EXPENSES</div><div class="value" id="boExpenses">$0.00</div><div class="muted">Current calendar year</div></div>
  <div class="card"><div class="label">NET BUSINESS PROFIT</div><div class="value" id="boProfit">$0.00</div><div class="muted">Revenue minus expenses</div></div>
  <div class="card"><div class="label">CURRENT BUSINESS CASH</div><div class="value" id="boCash">$0.00</div><div class="muted">Latest current-year entry</div></div>
 </div>
 <div class="grid3">
  <div class="history-item"><h3>Tax reserve</h3><p id="boTax">$0.00</p></div>
  <div class="history-item"><h3>Unpaid business obligations</h3><p id="boObligations">$0.00</p></div>
  <div class="history-item"><h3>Owner draws</h3><p id="boDraws">$0.00</p></div>
  <div class="history-item"><h3>Business cash reserve</h3><p id="boReserve">$0.00</p></div>
 </div>
 <p class="mini" id="boDataStatus">Loading live financial data…</p>
 </div></div>
 <div class="panel"><div class="head"><h2>Business Goals & Assumptions</h2></div><div class="body"><div class="form">
  <div class="field"><label>Desired monthly revenue ($)</label><input id="boRevenue" type="number" min="0" step="0.01" value="10000"></div>
  <div class="field"><label>Average booking price ($)</label><input id="boTicket" type="number" min="0" step="0.01" value="150"></div>
  <div class="field"><label>Owner labor hours/month</label><input id="boHours" type="number" min="0" step="0.01" value="100"></div>
  <div class="field"><label>Owner hourly target ($)</label><input id="boOwner" type="number" min="0" step="0.01" value="30"></div>
  <div class="field"><label>Employee count</label><input id="boEmployees" type="number" min="0" step="1" value="0"></div>
  <div class="field"><label>Employee hourly wage ($)</label><input id="boWage" type="number" min="0" step="0.01" value="10"></div>
  <div class="field"><label>Average employee hours/month</label><input id="boEHours" type="number" min="0" step="0.01" value="0"></div>
  <div class="field"><label>Estimated monthly overhead ($)</label><input id="boOverhead" type="number" min="0" step="0.01" value="0"></div>
 </div><div class="actions"><button class="btn" id="boUpdate">Update Optimization</button></div></div></div>
 <div class="panel"><div class="head"><h2>💰 Profit Optimization</h2></div><div class="body" id="boProfitPanel"></div></div>
 <div class="panel"><div class="head"><h2>👷 Workforce Optimization</h2></div><div class="body" id="boWorkforce"></div></div>
 <div class="panel"><div class="head"><h2>🎯 Recommended Actions</h2></div><div class="body" id="boActions"></div></div>
 <div class="panel"><div class="head"><h2>DASH Business Health</h2></div><div class="body" id="boHealth"></div></div>`;
}
function renderOptimization(){
 const s=document.getElementById('optimization'); if(!s)return;
 s.innerHTML=optimizationMarkup();
 document.getElementById('boUpdate').onclick=window.boCalc;
 window.boCalc=function(){
  const r=+document.getElementById('boRevenue').value||0,t=+document.getElementById('boTicket').value||0,h=+document.getElementById('boHours').value||0,o=+document.getElementById('boOwner').value||0,e=+document.getElementById('boEmployees').value||0,w=+document.getElementById('boWage').value||0,eh=+document.getElementById('boEHours').value||0,ov=+document.getElementById('boOverhead').value||0;
  const jobs=t?Math.ceil(r/t):0, ownerCost=h*o, wages=e*eh*w, fica=wages*.0765, operating=r-ownerCost-wages-fica-ov;
  document.getElementById('boProfitPanel').innerHTML=`<p><b>Target monthly revenue</b> ${money(r)}</p><p><b>Monthly job target</b> ${jobs}</p><p><b>Owner labor target</b> ${money(ownerCost)}</p><p><b>Employee wages</b> ${money(wages)}</p><p><b>Employer FICA estimate</b> ${money(fica)}</p><p><b>Monthly overhead</b> ${money(ov)}</p><p><b>Estimated operating amount after these costs</b> ${money(operating)}</p>`;
  document.getElementById('boWorkforce').innerHTML=`<p><b>Current employees</b> ${e}</p><p><b>Projected employee hours</b> ${(e*eh).toLocaleString()} hours/month</p><p><b>Estimated employee wages</b> ${money(wages)}</p>${e===0?'<p><b>No employees assumed.</b> Employee payroll is currently $0.</p>':''}`;
  let action=operating<0?'Current assumptions produce a negative operating amount. Increase revenue/pricing or reduce costs before expansion.':'Protect your target owner compensation before treating remaining operating profit as available growth cash.';
  if(e===0)action+='<p>Do not add employees until projected workload and revenue can support wages, employer payroll costs, and workers’ compensation.</p>';
  document.getElementById('boActions').innerHTML='<p>'+action+'</p>';
  document.getElementById('boHealth').innerHTML='<p><b>Overall planning position: '+(operating>0?'Positive':'Needs improvement')+'</b></p><p>Based on the assumptions entered above.</p>';
 };
 window.boCalc();
}
async function loadOptimizationFinancials(){
 const status=document.getElementById('boDataStatus'), live=document.getElementById('boLiveStatus'); if(!status)return;
 try{
  const y=new Date().getFullYear();
  const r=await fetch(BO_URL+'/rest/v1/business_optimization_financial_summary?select=*',{headers:{apikey:BO_KEY,Authorization:'Bearer '+BO_KEY},cache:'no-store'});
  const rows=await r.json().catch(()=>[]);
  if(!r.ok)throw new Error('Financial summary request failed ('+r.status+')');
  const x=Array.isArray(rows)?(rows[0]||{}):{};
  document.getElementById('boGross').textContent='$'+money(x.gross_revenue);
  document.getElementById('boExpenses').textContent='$'+money(x.deductible_business_expenses);
  document.getElementById('boProfit').textContent='$'+money(x.net_business_profit);
  document.getElementById('boCash').textContent='$'+money(x.current_cash);
  document.getElementById('boTax').textContent='$'+money(x.tax_reserve);
  document.getElementById('boObligations').textContent='$'+money(x.unpaid_business_obligations);
  document.getElementById('boDraws').textContent='$'+money(x.owner_draws);
  document.getElementById('boReserve').textContent='$'+money(x.business_cash_reserve);
  status.textContent='Live financial summary loaded for '+y+'. Historical years remain stored separately.';
  live.textContent='LIVE';
 }catch(e){status.textContent='Live financial data is temporarily unavailable. Planning estimates remain available below.';live.textContent='UNAVAILABLE';}
}
function patchOptimization(){
 const s=document.getElementById('optimization');
 if(!s)return;
 if(!s.dataset.boPatched){s.dataset.boPatched='1';renderOptimization();loadOptimizationFinancials();}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchOptimization);else patchOptimization();
window.addEventListener('load',patchOptimization);
})();
