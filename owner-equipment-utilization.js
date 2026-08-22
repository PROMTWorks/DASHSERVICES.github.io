(() => {
'use strict';
if(window.__dashEquipmentUtilizationLoaded)return;
window.__dashEquipmentUtilizationLoaded=true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let client;
function db(){return client||(client=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
async function load(){
 const host=document.querySelector('[data-owner-equipment-utilization]')||document.getElementById('owner-equipment-utilization');if(!host)return;
 const c=db();if(!c){host.innerHTML='<p>Equipment utilization data unavailable.</p>';return;}
 const {data,error}=await c.from('equipment_usage').select('*').order('created_at',{ascending:false}).limit(500);
 if(error){host.innerHTML='<p>Unable to load equipment utilization data.</p>';return;}
 const groups={};(data||[]).forEach(x=>{const id=x.equipment_id||x.asset_id||x.equipment_name||'Unknown';const g=groups[id]??={name:x.equipment_name||x.asset_name||id,hours:0,jobs:0,miles:0};g.hours+=Number(x.hours_used??x.usage_hours??x.hours??0);g.jobs+=Number(x.jobs_supported??x.job_count??(x.job_id?1:0));g.miles+=Number(x.miles_used??0);});
 const rows=Object.values(groups);const totalHours=rows.reduce((s,x)=>s+x.hours,0),totalJobs=rows.reduce((s,x)=>s+x.jobs,0);
 host.innerHTML=`<section class="dash-equipment-util"><div><h2>Equipment Utilization</h2><p>Owner-only view of how much equipment is actually being used.</p></div><div class="dash-eu-summary"><div><b>Equipment Tracked</b><strong>${rows.length}</strong></div><div><b>Usage Hours</b><strong>${totalHours.toFixed(1)}</strong></div><div><b>Jobs Supported</b><strong>${totalJobs}</strong></div></div><table><thead><tr><th>Equipment</th><th>Usage Hours</th><th>Jobs Supported</th><th>Miles</th><th>Utilization Note</th></tr></thead><tbody>${rows.length?rows.map(x=>{const note=x.hours<=5?'Low use — review whether asset is needed':x.hours>=80?'High use — monitor wear/maintenance':'Normal use';return `<tr><td>${esc(x.name)}</td><td>${x.hours.toFixed(1)}</td><td>${x.jobs}</td><td>${x.miles.toFixed(1)}</td><td>${esc(note)}</td></tr>`}).join(''):'<tr><td colspan="5">No equipment usage records available yet.</td></tr>'}</tbody></table></section>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();