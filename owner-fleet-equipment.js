(() => {
'use strict';
if(window.__dashFleetEquipmentLoaded)return;
window.__dashFleetEquipmentLoaded=true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
let client;
function db(){return client||(client=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));}
function money(v){return Number(v||0).toLocaleString('en-US',{style:'currency',currency:'USD'});}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function date(v){if(!v)return 'Not recorded';const d=new Date(v);return Number.isNaN(d.getTime())?'Not recorded':d.toLocaleDateString('en-US');}
async function load(){
 const host=document.querySelector('[data-owner-fleet-equipment]')||document.getElementById('owner-fleet-equipment');if(!host)return;
 const c=db();if(!c){host.innerHTML='<p>Fleet data unavailable.</p>';return;}
 const result=await Promise.all([c.from('fleet_assets').select('*').order('created_at',{ascending:false}).limit(200),c.from('equipment_assets').select('*').order('created_at',{ascending:false}).limit(200)]);
 const fleet=result[0].data||[],equipment=result[1].data||[];
 const rows=[...fleet.map(x=>({...x,kind:'Vehicle'})),...equipment.map(x=>({...x,kind:'Equipment'}))];
 host.innerHTML=`<section class="dash-fleet"><div><h2>Vehicle & Equipment Tracking</h2><p>Owner-only asset status, maintenance and assignment overview.</p></div><div class="dash-fleet-summary"><div><b>Vehicles</b><strong>${fleet.length}</strong></div><div><b>Equipment</b><strong>${equipment.length}</strong></div><div><b>Needs Attention</b><strong>${rows.filter(x=>String(x.status||'').toLowerCase().includes('due')||String(x.maintenance_status||'').toLowerCase().includes('due')).length}</strong></div></div><table><thead><tr><th>Asset</th><th>Type</th><th>Status</th><th>Mileage/Hours</th><th>Next Maintenance</th><th>Assigned</th><th>Insurance/Registration</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td>${esc(x.name||x.asset_name||x.vehicle_name||x.make_model||x.id)}</td><td>${esc(x.kind)}</td><td>${esc(x.status||x.maintenance_status||'Active')}</td><td>${esc(x.current_mileage??x.hours_used??x.mileage??'Not recorded')}</td><td>${date(x.next_maintenance_date||x.maintenance_due_at)}</td><td>${esc(x.assigned_to||x.assigned_employee||'Unassigned')}</td><td>${date(x.insurance_expiry)} / ${date(x.registration_expiry)}</td></tr>`).join(''):'<tr><td colspan="7">No vehicle or equipment records available.</td></tr>'}</tbody></table></section>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();