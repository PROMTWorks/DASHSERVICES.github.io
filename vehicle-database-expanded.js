/* DASH LOCAL VEHICLE SELECTOR v10
   No NHTSA/vPIC/SafetyRatings calls.
   Uses the local DASH vehicle catalog for Make -> Model -> Trim -> Engine.
*/
(function(){
'use strict';
function init(){
 const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),trim=document.getElementById('trim'),engine=document.getElementById('engine');
 if(!year||!make||!model||!trim||!engine||year.dataset.dashVehicleInit==='local-v10')return;
 year.dataset.dashVehicleInit='local-v10';
 const catalog=()=>window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG||{};
 const norm=v=>String(v||'').trim().toLowerCase().replace(/\s+/g,' ');
 const unique=a=>[...new Set((a||[]).filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const fill=(el,prompt,values=[],disabled=false)=>{el.innerHTML='';el.add(new Option(prompt,''));unique(values).forEach(v=>el.add(new Option(v,v)));el.disabled=disabled;el.hidden=false;el.style.display='';el.removeAttribute('aria-hidden');};
 const years=()=>{const a=[],max=new Date().getFullYear()+1;for(let y=max;y>=1945;y--)a.push(String(y));return a;};
 const entries=()=>Object.keys(catalog());
 const makeNames=()=>unique(entries().map(k=>k.split('|')[0]));
 const modelsForMake=m=>unique(entries().filter(k=>norm(k.split('|')[0])===norm(m)).map(k=>k.split('|').slice(1).join('|')));
 const findEntry=(m,mo)=>{const wanted=norm(m)+'|'+norm(mo);const k=entries().find(x=>{const p=x.split('|');return norm(p[0])+'|'+norm(p.slice(1).join('|'))===wanted});return k?catalog()[k]:null;};
 function resetBelowModel(){fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);}
 fill(year,'Select year',years(),false);
 fill(make,'Select make',makeNames(),false);
 resetBelowModel();
 year.addEventListener('change',()=>{fill(make,'Select make',makeNames(),false);resetBelowModel();});
 make.addEventListener('change',()=>{fill(model,'Select model',modelsForMake(make.value),false);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);});
 model.addEventListener('change',()=>{
   const e=findEntry(make.value,model.value);
   const trims=e&&Array.isArray(e.trims)?e.trims:[];
   const engines=e&&Array.isArray(e.engines)?e.engines:[];
   fill(trim,trims.length?'Select trim':'No trim data in DASH catalog',trims,false);
   fill(engine,engines.length?'Select engine':'No engine data in DASH catalog',engines,false);
 });
 const repair=()=>{
   [year,make,model,trim,engine].forEach(x=>{x.hidden=false;x.style.display='';x.removeAttribute('aria-hidden')});
   if(year.options.length<=1)fill(year,'Select year',years(),false);
   if(make.options.length<=1)fill(make,'Select make',makeNames(),false);
   if(model.value&&(trim.options.length<=1||engine.options.length<=1)){
     const e=findEntry(make.value,model.value);
     if(e){fill(trim,'Select trim',e.trims||[],false);fill(engine,'Select engine',e.engines||[],false);}
   }
 };
 new MutationObserver(repair).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden','style','aria-hidden']});
 setInterval(repair,500);
 repair();
 window.PROMT_VEHICLE_DATABASE={name:'DASH Local Vehicle Database',source:'Local DASH catalog only',externalVehicleApis:false,years:years(),makes:makeNames()};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
