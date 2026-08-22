(() => {
'use strict';
if(window.__dashMorningWakeUpLoaded)return;
window.__dashMorningWakeUpLoaded=true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';let client;
function db(){return client||(client=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));}
function pct(v){return `${Math.round(Number(v)||0)}%`;}
function money(v){return Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function mount(){let host=document.querySelector('[data-owner-morning-wake-up]')||document.getElementById('owner-morning-wake-up');if(!host){const main=document.querySelector('main');if(!main)return;host=document.createElement('div');host.id='owner-morning-wake-up';host.dataset.ownerMorningWakeUp='1';host.style.marginBottom='18px';const top=main.querySelector('.top');if(top&&top.nextSibling)main.insertBefore(host,top.nextSibling);else main.insertBefore(host,main.firstChild);}return host;}
function trend(current,previous,reverse=false){if(previous==null)return{label:'Not enough history',icon:'⚪'};const d=Number(current)-Number(previous);if(reverse)return d<-1?{label:'Improving',icon:'🟢'}:d>1?{label:'Declining',icon:'🔴'}:{label:'Stable',icon:'🟡'};return d>1?{label:'Improving',icon:'🟢'}:d<-1?{label:'Declining',icon:'🔴'}:{label:'Stable',icon:'🟡'};}
function dateOf(x){return new Date(x.completed_at||x.created_at||x.updated_at||0).getTime();}
async function load(){
 const host=mount();if(!host)return;const c=db();if(!c){host.innerHTML='<div class="notice"><b>Business health data unavailable.</b></div>';return;}
 const {data,error}=await c.rpc('get_owner_management_dashboard');
 if(error){host.innerHTML='<div class="notice"><b>Business health data unavailable.</b><br><span class="muted">'+esc(error.message)+'</span></div>';return;}
 const d=data||{},jobs=d.jobs||[],customers=d.customers||[],complaints=d.complaints||[],inventory=d.inventory||[],supply=d.supply_requests||[],performance=d.performance||[],financial=d.financials||{};
 const now=Date.now(),w=30*86400000;const completed=jobs.filter(x=>['completed','complete','closed'].includes(String(x.status||'').toLowerCase()));
 const recent=completed.filter(x=>{const t=dateOf(x);return t>now-w&&t<=now;}).length,prior=completed.filter(x=>{const t=dateOf(x);return t>now-2*w&&t<=now-w;}).length;
 const compRecent=complaints.filter(x=>{const t=dateOf(x);return t>now-w&&t<=now;}).length,compPrior=complaints.filter(x=>{const t=dateOf(x);return t>now-2*w&&t<=now-w;}).length;
 const demand=trend(recent,prior),quality=trend(compRecent,compPrior,true);const popularity=recent||prior?Math.max(0,Math.min(100,Math.round(50+(recent-prior)/Math.max(1,prior)*50))):null;
 const revenue=jobs.reduce((s,x)=>s+Number(x.actual_revenue??x.estimated_revenue??0),0);const direct=jobs.reduce((s,x)=>s+Number(x.actual_direct_cost??x.estimated_direct_cost??0)+Number(x.actual_overhead??x.estimated_overhead??0),0);const profit=revenue-direct;
 const lowInventory=inventory.filter(x=>Number(x.current_stock||0)<=Number(x.minimum_stock||0)).length;const pending=supply.filter(x=>String(x.status||'').toLowerCase()==='pending').length;const flagged=performance.filter(x=>Number(x.overall_rating)<=Number(d.policy?.fireable_threshold??60)).length;
 host.innerHTML=`<section class="dash-morning panel"><div class="head"><div><h2>Owner Morning Wake-Up</h2><p class="muted">One owner-level snapshot using the same shared business data as the management systems.</p></div><span class="pill">Owner only · Shared data source</span></div><div class="body"><div class="dash-morning-grid"><div class="card"><div class="label">COMPANY POPULARITY / DEMAND</div><div class="value">${popularity==null?'—':pct(popularity)}</div><div class="muted">${popularity==null?'Need more job history':demand.icon+' '+demand.label+' · '+recent+' recent vs '+prior+' prior completed jobs'}</div></div><div class="card"><div class="label">QUALITY DIRECTION</div><div class="value">${quality.icon} ${esc(quality.label)}</div><div class="muted">${compRecent} complaints recently vs ${compPrior} previously</div></div><div class="card"><div class="label">COMPANY PROFIT IN DATASET</div><div class="value">${money(profit)}</div><div class="muted">Revenue ${money(revenue)} · costs ${money(direct)}</div></div><div class="card"><div class="label">OWNER FLAGS</div><div class="value">${flagged+pending+lowInventory}</div><div class="muted">${flagged} performance · ${pending} supply · ${lowInventory} low inventory</div></div></div><div class="dash-morning-note notice"><b>Morning read:</b> ${demand.icon} Demand is <b>${esc(demand.label.toLowerCase())}</b>; quality is <b>${esc(quality.label.toLowerCase())}</b>. ${customers.length} customers, ${completed.length} completed jobs in the loaded owner dataset, and ${financial.period_year?`financial period ${esc(financial.period_year)}-${esc(financial.period_month)}`:'no current financial period recorded'}.</div></div></section>`;
}
window.DASH_OWNER_MORNING_REFRESH=load;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();