(function(){
  'use strict';
  const KEY='dash_security_provider_data_v1';
  const sections=[
    {id:'property-security',title:'📹 Property Security',fields:[['company','Security camera company'],['account','Account / customer number'],['phone','Main phone'],['emergency','Emergency / after-hours phone'],['website','Website'],['serviceAddress','Service address'],['installDate','Installation date'],['contractDate','Contract / renewal date'],['monitoring','Monitoring status'],['equipment','Equipment / system information'],['notes','Notes']]},
    {id:'alarm-monitoring',title:'🚨 Alarm / Monitoring Company',fields:[['company','Company name'],['account','Account number'],['phone','Phone'],['emergency','Emergency phone'],['website','Website'],['contractDate','Contract / renewal date'],['monitoring','Monitoring status'],['notes','Notes']]},
    {id:'access-control',title:'🔐 Access Control Provider',fields:[['company','Provider name'],['account','Account number'],['phone','Support phone'],['website','Website'],['system','System information'],['notes','Notes']]},
    {id:'vehicle-gps',title:'🚗 Company Vehicle GPS Tracking',fields:[['company','GPS tracking provider'],['account','Account / customer number'],['phone','Provider phone'],['support','Support contact'],['website','Website'],['system','Tracking system / platform'],['contractDate','Contract / renewal date'],['vehicleCount','Vehicles covered'],['notes','Notes']]},
    {id:'vehicle-dashcam',title:'📹 Company Vehicle Dash Cameras',fields:[['company','Dash-camera provider'],['account','Account / customer number'],['phone','Provider phone'],['support','Support contact'],['website','Website'],['system','Camera system / model'],['installInfo','Installation information'],['contractDate','Contract / renewal date'],['vehicleCount','Vehicles equipped'],['notes','Notes']]},
    {id:'emergency-contacts',title:'📞 Emergency & Security Contacts',fields:[['police','Police / non-emergency contact'],['fire','Fire department contact'],['property','Property security contact'],['afterHours','After-hours security contact'],['locksmith','Locksmith'],['other','Other emergency/security providers'],['notes','Notes']]}
  ];
  function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function save(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function openForm(def){
    let data=load(), cur=data[def.id]||{};
    const overlay=document.createElement('div'); overlay.style='position:fixed;inset:0;background:rgba(15,23,42,.58);display:flex;align-items:center;justify-content:center;padding:20px;z-index:100000';
    const box=document.createElement('div'); box.style='background:#fff;width:min(760px,100%);max-height:90vh;overflow:auto;border-radius:14px;padding:24px';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px"><h2 style="margin:0">Add / Edit '+esc(def.title.replace(/^\S+\s/,''))+'</h2><button id="spClose" style="border:0;background:#eef2f7;border-radius:7px;padding:8px 11px;cursor:pointer">Close</button></div><div id="spFields" style="display:grid;grid-template-columns:1fr 1fr;gap:14px"></div><div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px"><button id="spCancel" style="border:1px solid #d7dde5;background:#fff;border-radius:8px;padding:10px 14px;cursor:pointer">Cancel</button><button id="spSave" style="border:0;background:#111827;color:#fff;border-radius:8px;padding:10px 14px;font-weight:700;cursor:pointer">Save</button></div>';
    overlay.appendChild(box); document.body.appendChild(overlay);
    const fields=box.querySelector('#spFields');
    def.fields.forEach(([key,label])=>{const wrap=document.createElement('div');wrap.style='grid-column:'+(key==='notes'?'1/-1':'auto');wrap.innerHTML='<label style="display:block;font-size:12px;font-weight:700;margin-bottom:6px">'+esc(label)+'</label><input data-k="'+esc(key)+'" value="'+esc(cur[key]||'')+'" style="width:100%;padding:10px;border:1px solid #ccd4de;border-radius:7px;box-sizing:border-box">';fields.appendChild(wrap)});
    const close=()=>overlay.remove(); box.querySelector('#spClose').onclick=close; box.querySelector('#spCancel').onclick=close;
    box.querySelector('#spSave').onclick=()=>{const out={};box.querySelectorAll('[data-k]').forEach(i=>out[i.dataset.k]=i.value.trim());data[def.id]=out;save(data);close();render();};
  }
  function render(){
    const sec=document.getElementById('security'); if(!sec)return;
    if(document.getElementById('dashSecurityProviders'))return;
    const wrap=document.createElement('div');wrap.id='dashSecurityProviders';
    const style=document.createElement('style');style.textContent='.dash-sp-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}.dash-sp-card{background:#fff;border:1px solid #e2e7ed;border-radius:12px;padding:18px}.dash-sp-card h3{margin:0 0 8px;font-size:16px}.dash-sp-empty{color:#64748b;font-size:13px;margin:0 0 12px}.dash-sp-actions{display:flex;gap:8px;flex-wrap:wrap}.dash-sp-btn{border:1px solid #d7dde5;background:#fff;border-radius:8px;padding:8px 11px;cursor:pointer;font-weight:700}.dash-sp-btn.primary{background:#111827;color:#fff;border-color:#111827}@media(max-width:700px){.dash-sp-grid{grid-template-columns:1fr}}';document.head.appendChild(style);
    const title=document.createElement('div');title.innerHTML='<div class="title" style="margin-top:24px"><div><h2>Security Providers & Contacts</h2><p>Super Admin-only information for property security, vehicle tracking, dash cameras, and emergency contacts.</p></div></div>';wrap.appendChild(title);
    const grid=document.createElement('div');grid.className='dash-sp-grid';wrap.appendChild(grid);sec.appendChild(wrap);
    const refresh=()=>{grid.innerHTML='';const data=load();sections.forEach(def=>{const d=data[def.id]||{};const has=Object.values(d).some(Boolean);const card=document.createElement('div');card.className='dash-sp-card';card.innerHTML='<h3>'+esc(def.title)+'</h3>'+(has?'<p class="dash-sp-empty">Configured</p>':'<p class="dash-sp-empty">Not configured yet</p>')+'<div class="dash-sp-actions"><button class="dash-sp-btn primary">'+(has?'Edit':'Add')+'</button>'+(has?'<button class="dash-sp-btn">Clear</button>':'')+'</div>';const btns=card.querySelectorAll('button');btns[0].onclick=()=>openForm(def);if(btns[1])btns[1].onclick=()=>{const all=load();delete all[def.id];save(all);refresh()};grid.appendChild(card)})};refresh();
  }
  function init(){setTimeout(render,100);setTimeout(render,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
