(() => {
'use strict';
if (window.__dashJobProfitabilityLoaded) return;
window.__dashJobProfitabilityLoaded = true;
const state = { jobs: [], loaded:false };
const SUPABASE_URL='https://roywoofgypiyoobdcrwx.supabase.co';
const SUPABASE_KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let client=null;
function getClient(){ if(client) return client; if(!window.supabase?.createClient) return null; client=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}); return client; }
function money(v){ return Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'}); }
function status(job){ if(job.actual_profit==null) return 'Pending actuals'; const p=Number(job.actual_profit); return p>=0?'Profitable':'Loss'; }
async function load(){
 const c=getClient(); if(!c) return;
 const {data,error}=await c.from('jobs').select('*').order('created_at',{ascending:false}).limit(100);
 if(error||!data){ state.jobs=[]; return; }
 state.jobs=data.map(j=>{const revenue=Number(j.actual_revenue ?? j.price ?? j.total_price ?? j.estimated_revenue ?? 0);const direct=Number(j.actual_direct_cost ?? j.direct_cost ?? j.actual_cost ?? 0);const labor=Number(j.actual_labor_cost ?? j.labor_cost ?? 0);const fuel=Number(j.actual_fuel_cost ?? j.fuel_cost ?? 0);const material=Number(j.actual_material_cost ?? j.material_cost ?? 0);const overhead=Number(j.allocated_overhead ?? 0);const actualCost=direct||labor+fuel+material;const profit=revenue-(actualCost+overhead);return {...j,actual_revenue:revenue,actual_cost:actualCost,allocated_overhead:overhead,actual_profit:profit,margin:revenue?profit/revenue*100:0};}); state.loaded=true; render();
}
function render(){
 const host=document.querySelector('[data-owner-job-profitability]')||document.getElementById('owner-job-profitability'); if(!host||host.dataset.rendered)return;host.dataset.rendered='1';
 host.innerHTML=`<section class="dash-job-profit"><div class="dash-jp-head"><div><h2>Job Profitability</h2><p>Owner-only actual financial performance. Estimates are never treated as final profit.</p></div><button type="button" id="dashJpRefresh">Refresh</button></div><div class="dash-jp-summary" id="dashJpSummary"></div><div class="dash-jp-table-wrap"><table><thead><tr><th>Job</th><th>Revenue</th><th>Direct Cost</th><th>Overhead</th><th>Actual Profit</th><th>Margin</th><th>Status</th></tr></thead><tbody id="dashJpRows"><tr><td colspan="7">Loading job financial data…</td></tr></tbody></table></div></section>`;
 host.querySelector('#dashJpRefresh').onclick=load; renderRows();
}
function renderRows(){const rows=document.getElementById('dashJpRows'),summary=document.getElementById('dashJpSummary');if(!rows)return;let totalR=0,totalC=0,totalP=0;rows.innerHTML=state.jobs.length?state.jobs.map(j=>{totalR+=j.actual_revenue;totalC+=j.actual_cost+j.allocated_overhead;totalP+=j.actual_profit;const label=j.job_number||j.id||'Job';return `<tr><td>${label}</td><td>${money(j.actual_revenue)}</td><td>${money(j.actual_cost)}</td><td>${money(j.allocated_overhead)}</td><td>${money(j.actual_profit)}</td><td>${j.margin.toFixed(1)}%</td><td>${status(j)}</td></tr>`}).join(''):`<tr><td colspan="7">No job financial records are available yet.</td></tr>`;summary.innerHTML=`<div><b>Total Revenue</b><strong>${money(totalR)}</strong></div><div><b>Total Costs</b><strong>${money(totalC)}</strong></div><div><b>Company Profit</b><strong>${money(totalP)}</strong></div><div><b>Overall Margin</b><strong>${totalR?(totalP/totalR*100).toFixed(1):'0.0'}%</strong></div>`;}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{render();load();},{once:true});else{render();load();}
})();
