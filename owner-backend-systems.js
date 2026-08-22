(() => {
'use strict';
if (window.__dashOwnerBackendSystemsLoaded) return;
window.__dashOwnerBackendSystemsLoaded = true;
const modules = [
 ['Inventory Management','Inventory levels, minimum/target/max stock, usage, damage, orders and manager timing.'],
 ['Job Profitability','Estimated vs actual revenue, direct costs, overhead and company profit per completed job.'],
 ['Employee Productivity','Work hours by job, operations and training, with labor-cost visibility for the owner.'],
 ['Customer Profitability','Revenue, direct cost and contribution by customer and service history.'],
 ['Route Efficiency','Group nearby jobs and compare travel time, mileage and fuel efficiency.'],
 ['Vehicle & Equipment Tracking','Mileage, maintenance, service dates, status and utilization for fleet and equipment.'],
 ['Equipment Utilization','Usage hours/mileage by asset to identify underused or overloaded equipment.'],
 ['Customer Quality','Complaints, compliments, callbacks and resolution history tied to jobs and crews.'],
 ['Callback Tracking','Measure the actual financial impact of return visits and quality problems.'],
 ['Training Triggers','Create owner/manager training alerts from recurring quality or operational patterns.'],
 ['Customer Retention','Compare expected service cadence with last service and flag customers who may be at risk.'],
 ['Revenue Forecasting','Combine confirmed, scheduled and expected recurring work with projected costs.'],
 ['Owner-Draw Protection','Calculate cash that can safely be considered for owner distribution after obligations and reserves.'],
 ['Manager Performance','Inventory timing, unresolved issues, complaints, schedule issues and operational trends.'],
 ['Owner Attention Required','One owner-only queue for urgent, routine and informational items that actually need your decision.']
];
function render(){
 const host=document.querySelector('[data-owner-backend-systems]')||document.getElementById('owner-backend-systems');
 if(!host||host.dataset.rendered)return; host.dataset.rendered='1';
 host.innerHTML=`<div class="dash-owner-backend"><div class="dash-owner-backend-head"><h2>Owner Backend Systems</h2><span>Owner-only controls</span></div><p>These systems are designed to let DASH operate through managers and employees while giving the owner financial, operational and exception-level visibility.</p><div class="dash-owner-backend-grid">${modules.map((m,i)=>`<article class="dash-owner-module" data-module="${i+1}"><h3>${i+1}. ${m[0]}</h3><p>${m[1]}</p><button type="button" class="dash-owner-module-btn" data-module-index="${i}">Open Module</button></article>`).join('')}</div></div>`;
 host.querySelectorAll('.dash-owner-module-btn').forEach(btn=>btn.addEventListener('click',()=>{const m=modules[Number(btn.dataset.moduleIndex)]; alert(`${m[0]}\n\n${m[1]}\n\nThis owner-only module is part of the DASH backend foundation and will be configured independently without exposing owner financial data to managers or employees.`)}));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();