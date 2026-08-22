(() => {
'use strict';
if (window.__dashRouteEfficiencyLoaded) return;
window.__dashRouteEfficiencyLoaded = true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let client;
function c(){return client||(client=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function money(v){return Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});}
async function load(){
 const host=document.querySelector('[data-owner-route-efficiency]')||document.getElementById('owner-route-efficiency'); if(!host)return;
 const db=c(); if(!db){host.innerHTML='<p>Route data unavailable.</p>';return;}
 const {data,error}=await db.from('jobs').select('*').order('scheduled_start',{ascending:true}).limit(200);
 if(error){host.innerHTML='<p>Unable to load route data.</p>';return;}
 const jobs=(data||[]).filter(j=>j.status!=='cancelled');
 const byDay={}; jobs.forEach(j=>{const d=(j.scheduled_start||j.scheduled_date||j.created_at||'').slice(0,10)||'Unscheduled';(byDay[d]??=[]).push(j);});
 const days=Object.entries(byDay);
 let mileage=0,drive=0;
 days.forEach(([,list])=>list.forEach(j=>{mileage+=Number(j.route_miles??j.mileage??0);drive+=Number(j.drive_minutes??j.travel_minutes??0);}));
 host.innerHTML=`<section class="dash-route-eff"><div><h2>Route Efficiency</h2><p>Owner view of scheduled work and recorded travel. No route is silently changed.</p></div><div class="dash-route-summary"><div><b>Jobs</b><strong>${jobs.length}</strong></div><div><b>Recorded Miles</b><strong>${mileage.toFixed(1)}</strong></div><div><b>Recorded Drive Time</b><strong>${Math.round(drive)} min</strong></div></div><div><h3>Jobs by Day</h3><table><thead><tr><th>Date</th><th>Jobs</th><th>Recorded Miles</th><th>Recorded Drive</th><th>Revenue</th></tr></thead><tbody>${days.length?days.map(([d,list])=>{const mi=list.reduce((s,j)=>s+Number(j.route_miles??j.mileage??0),0),dr=list.reduce((s,j)=>s+Number(j.drive_minutes??j.travel_minutes??0),0),rev=list.reduce((s,j)=>s+Number(j.actual_revenue??j.price??j.total_price??0),0);return `<tr><td>${esc(d)}</td><td>${list.length}</td><td>${mi.toFixed(1)}</td><td>${Math.round(dr)} min</td><td>${money(rev)}</td></tr>`}).join(''):'<tr><td colspan="5">No scheduled jobs available.</td></tr>'}</tbody></table></div></section>`;
}
function start(){load();}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();