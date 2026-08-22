(() => {
'use strict';
if (window.__dashCustomerProfitabilityLoaded) return;
window.__dashCustomerProfitabilityLoaded = true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let c=null;
const get=()=>c||(c=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));
const money=v=>Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});
async function load(){
 const client=get(); if(!client)return;
 const {data:jobs,error}=await client.from('jobs').select('*').limit(1000);
 if(error||!jobs)return;
 const map=new Map();
 jobs.forEach(j=>{
  const key=j.customer_id||j.customer_email||j.customer_name||'Unassigned';
  const name=j.customer_name||j.customer_email||j.customer_id||'Unassigned';
  const revenue=Number(j.actual_revenue??j.price??j.total_price??j.estimated_revenue??0);
  const cost=Number(j.actual_cost??j.direct_cost??j.labor_cost??0)+Number(j.allocated_overhead??0);
  const x=map.get(key)||{name,jobs:0,revenue:0,cost:0}; x.jobs++;x.revenue+=revenue;x.cost+=cost;map.set(key,x);
 });
 render([...map.values()].map(x=>({...x,profit:x.revenue-x.cost,margin:x.revenue?(x.revenue-x.cost)/x.revenue*100:0})).sort((a,b)=>b.profit-a.profit));
}
function render(rows){
 const host=document.querySelector('[data-owner-customer-profitability]')||document.getElementById('owner-customer-profitability'); if(!host||host.dataset.rendered)return;host.dataset.rendered='1';
 host.innerHTML='<section><div style="display:flex;justify-content:space-between;align-items:center"><div><h2>Customer Profitability</h2><p>Owner-only view of revenue, costs and contribution by customer.</p></div><button id="dashCpRefresh">Refresh</button></div><div id="dashCpSummary"></div><div style="overflow:auto"><table><thead><tr><th>Customer</th><th>Jobs</th><th>Revenue</th><th>Costs</th><th>Contribution</th><th>Margin</th></tr></thead><tbody id="dashCpRows"></tbody></table></div></section>';
 document.getElementById('dashCpRefresh').onclick=()=>{host.dataset.rendered='';host.innerHTML='';load()};
 const total=rows.reduce((a,x)=>({r:a.r+x.revenue,c:a.c+x.cost,p:a.p+x.profit}),{r:0,c:0,p:0});
 document.getElementById('dashCpSummary').innerHTML=`<p><b>Total Revenue:</b> ${money(total.r)} &nbsp; <b>Total Costs:</b> ${money(total.c)} &nbsp; <b>Total Contribution:</b> ${money(total.p)}</p>`;
 document.getElementById('dashCpRows').innerHTML=rows.length?rows.map(x=>`<tr><td>${x.name}</td><td>${x.jobs}</td><td>${money(x.revenue)}</td><td>${money(x.cost)}</td><td>${money(x.profit)}</td><td>${x.margin.toFixed(1)}%</td></tr>`).join(''):'<tr><td colspan="6">No customer profitability records are available yet.</td></tr>';
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
