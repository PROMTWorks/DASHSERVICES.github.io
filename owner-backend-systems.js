(() => {
'use strict';
if (window.__dashOwnerBackendSystemsLoaded) return;
window.__dashOwnerBackendSystemsLoaded = true;
const modules = [
 ['Owner Attention','overview','One owner-only queue for urgent, routine and informational items that actually need your decision.'],
 ['Inventory','inventory','Inventory levels, minimum/target/max stock, usage, damage, orders and manager timing.'],
 ['Job Profitability','jobs','Estimated vs actual revenue, direct costs, overhead and company profit per completed job.'],
 ['Employee Performance','people','Work hours, job performance, attendance, quality, productivity and owner-only performance visibility.'],
 ['Complaints & Reports','complaints','Complaints, employee reports, callbacks and resolution history tied to jobs and crews.'],
 ['Vehicles & Equipment','fleet','Mileage, maintenance, service dates, status and utilization for fleet and equipment.'],
 ['Customers','customers','Revenue, service history, retention and customer-level profitability information.'],
 ['Revenue & Owner Draw','finance','Revenue, company obligations, reserves and owner-draw protection.']
];
function openModule(section){
  const target=document.getElementById(section);
  if(target){
    document.querySelectorAll('.section').forEach(x=>x.classList.remove('active'));
    target.classList.add('active');
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    const tabButton=[...document.querySelectorAll('.tab')].find(x=>x.getAttribute('onclick')?.includes(`'${section}'`));
    if(tabButton)tabButton.classList.add('active');
    target.scrollIntoView({behavior:'smooth',block:'start'});
    return;
  }
  if(typeof window.tab==='function'){
    const tabButton=[...document.querySelectorAll('.tab')].find(x=>x.getAttribute('onclick')?.includes(`'${section}'`));
    window.tab(section,tabButton||null);
    return;
  }
  const hash='#'+section;
  if(location.hash!==hash)location.hash=hash;
}
function render(){
 const host=document.querySelector('[data-owner-backend-systems]')||document.getElementById('owner-backend-systems');
 if(!host||host.dataset.rendered)return; host.dataset.rendered='1';
 host.innerHTML=`<div class="dash-owner-backend"><div class="dash-owner-backend-head"><h2>Owner Backend Systems</h2><span>Owner-only controls</span></div><p>These systems are designed to let DASH operate through managers and employees while giving the owner financial, operational and exception-level visibility.</p><div class="dash-owner-backend-grid">${modules.map((m,i)=>`<article class="dash-owner-module" data-module="${i+1}" tabindex="0" role="button" aria-label="Open ${m[0]}"><h3>${i+1}. ${m[0]}</h3><p>${m[2]}</p><button type="button" class="dash-owner-module-btn" data-section="${m[1]}">Open Module</button></article>`).join('')}</div></div>`;
 host.querySelectorAll('.dash-owner-module-btn').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openModule(btn.dataset.section)}));
 host.querySelectorAll('.dash-owner-module').forEach(card=>{card.addEventListener('click',e=>{if(e.target.closest('button'))return;openModule(card.querySelector('.dash-owner-module-btn').dataset.section)});card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openModule(card.querySelector('.dash-owner-module-btn').dataset.section)}})});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();