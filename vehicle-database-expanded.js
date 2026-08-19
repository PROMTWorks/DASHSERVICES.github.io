/* DASH vehicle selector: real trim/engine data */
(function(){
'use strict';
function init(){
 const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
 if(!year||!make||!model||!engine||!trim||year.dataset.dashVehicleInit==='real-data')return;
 year.dataset.dashVehicleInit='real-data';
 const norm=v=>String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');
 const uniq=a=>[...new Set((a||[]).filter(Boolean).map(String).map(v=>v.trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
 const catalog=()=>window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG||{};
 function find(key){const c=catalog(),n=norm(key),k=Object.keys(c).find(x=>norm(x)===n);return k?c[k]:null}
 function entry(){return find(make.value+'|'+model.value)||find(year.value+'|'+make.value+'|'+model.value)||null}
 function fill(el,prompt,values,disabled=false){el.innerHTML='';el.add(new Option(prompt,''));uniq(values).forEach(v=>el.add(new Option(v,v)));el.disabled=disabled;el.hidden=false;el.style.display=''}
 function years(){let a=[],max=new Date().getFullYear()+1;for(let y=max;y>=1945;y--)a.push(String(y));return a}
 function custom(id,label,placeholder,after){let w=document.getElementById(id);if(!w){w=document.createElement('div');w.id=id;w.className='field full';w.innerHTML='<label>'+label+'</label><input placeholder="'+placeholder+'">';after.parentNode.insertBefore(w,after.nextSibling)}return w}
 async function nhtsaTrims(){if(Number(year.value)<1996)return[];try{const u='https://api.nhtsa.gov/SafetyRatings/modelyear/'+encodeURIComponent(year.value)+'/make/'+encodeURIComponent(make.value)+'/model/'+encodeURIComponent(model.value);const r=await fetch(u,{cache:'no-store'});if(!r.ok)return[];const d=await r.json();return(d.Results||[]).map(x=>x.VehicleDescription||x.Description||x.SubModel||x.Trim||'').filter(Boolean)}catch{return[]}}
 function resetAfterModel(){fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);const a=document.getElementById('dashCustomTrimWrap'),b=document.getElementById('dashCustomEngineWrap');if(a)a.classList.add('hidden');if(b)b.classList.add('hidden')}
 function loadRealData(){if(!year.value||!make.value||!model.value)return;resetAfterModel();const e=entry();const localTrims=e&&Array.isArray(e.trims)?e.trims:[];const localEngines=e&&Array.isArray(e.engines)?e.engines:[];Promise.resolve(nhtsaTrims()).then(v=>{const trims=uniq(localTrims.concat(v));if(trims.length){fill(trim,'Select trim',trims,false)}else{fill(trim,'Trim not available — enter exact trim',[],false);custom('dashCustomTrimWrap','Exact factory trim','Example: XLT, EX, SE, Limited',trim).classList.remove('hidden')}if(localEngines.length){fill(engine,'Select engine',localEngines,false)}else{fill(engine,'Engine not available for this model — enter exact engine',[],false);custom('dashCustomEngineWrap','Exact factory engine','Example: 3.5L EcoBoost V6',engine).classList.remove('hidden')}})}
 fill(year,'Select year',years(),false);fill(make,'Select make',[],true);fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);
 year.onchange=()=>{fill(make,'Select make',[],false);fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);const makes=Object.keys(catalog()).map(k=>k.split('|')[0]);uniq(makes).forEach(v=>make.add(new Option(v,v)));};
 make.onchange=async()=>{fill(model,'Loading models...',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);let names=[];try{if(Number(year.value)>=1996){const r=await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/'+encodeURIComponent(make.value)+'/modelyear/'+encodeURIComponent(year.value)+'?format=json',{cache:'no-store'});if(r.ok){const d=await r.json();names=(d.Results||[]).map(x=>x.Model_Name||x.ModelName)}}}catch{}Object.keys(catalog()).forEach(k=>{const p=k.split('|');if(norm(p[0])===norm(make.value))names.push(p[1])});fill(model,'Select model',uniq(names),false)};
 model.onchange=loadRealData;
 new MutationObserver(()=>{[year,make,model,trim,engine].forEach(x=>{x.hidden=false;x.style.display=''});if(model.value&&trim.options.length<=1)loadRealData()}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden','style']});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();