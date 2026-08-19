/* DASH vehicle selector: LOCAL catalog only v9 — no NHTSA */
(function(){
'use strict';
function init(){
 const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
 if(!year||!make||!model||!engine||!trim||year.dataset.dashVehicleInit==='local-data-v9')return;
 year.dataset.dashVehicleInit='local-data-v9';
 const norm=v=>String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');
 const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String).map(v=>v.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const catalog=()=>window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG||{};
 function keys(){return Object.keys(catalog())}
 function find(key){const c=catalog(),n=norm(key),k=Object.keys(c).find(x=>norm(x)===n);return k?c[k]:null}
 function entry(){return find(make.value+'|'+model.value)||find(year.value+'|'+make.value+'|'+model.value)||null}
 function fill(el,prompt,values,disabled=false){el.innerHTML='';el.add(new Option(prompt,''));uniq(values).forEach(v=>el.add(new Option(v,v)));el.disabled=disabled;el.hidden=false;el.style.display=''}
 function years(){let a=[],max=new Date().getFullYear()+1;for(let y=max;y>=1945;y--)a.push(String(y));return a}
 function resetDownstream(){fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true)}
 function populateMakes(){const makes=uniq(keys().map(k=>k.split('|')[0]));fill(make,'Select make',makes,false)}
 function populateModels(){const selected=norm(make.value),names=[];keys().forEach(k=>{const p=k.split('|');if(norm(p[0])===selected&&p[1])names.push(p[1])});fill(model,'Select model',uniq(names),false)}
 function populateRealData(){
   if(!year.value||!make.value||!model.value)return;
   const e=entry();
   const trims=e&&Array.isArray(e.trims)?e.trims:[];
   const engines=e&&Array.isArray(e.engines)?e.engines:[];
   fill(trim,trims.length?'Select trim':'No catalog trim data for this vehicle',trims,false);
   fill(engine,engines.length?'Select engine':'No catalog engine data for this vehicle',engines,false);
 }
 fill(year,'Select year',years(),false);populateMakes();resetDownstream();
 year.onchange=()=>{populateMakes();resetDownstream()};
 make.onchange=()=>{populateModels();fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true)};
 model.onchange=populateRealData;
 new MutationObserver(()=>{[year,make,model,trim,engine].forEach(x=>{x.hidden=false;x.style.display=''});if(model.value&&(trim.options.length<=1||engine.options.length<=1))populateRealData()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
