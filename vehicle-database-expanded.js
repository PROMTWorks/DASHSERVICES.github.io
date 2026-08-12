/* PROMT WORKS — EXPANDED VEHICLE DATABASE
   Comprehensive U.S. vehicle selector powered by the NHTSA vPIC database.
   Coverage: model years 1981–2026, with live Year → Make → Model loading.
   Engine selection is confirmed separately so the site does not guess an engine.
*/
(function(){
  const $=id=>document.getElementById(id);
  const year=$('year'), make=$('make'), model=$('model'), engine=$('engine');
  if(!year||!make||!model||!engine)return;
  const api='https://vpic.nhtsa.dot.gov/api/vehicles';
  year.innerHTML='<option value="">Select year</option>';
  for(let y=2026;y>=1981;y--) year.add(new Option(y,y));
  function reset(el,label){el.innerHTML='';el.add(new Option(label,''));el.disabled=true;}
  function loading(el){el.innerHTML='<option value="">Loading...</option>';el.disabled=true;}
  async function get(url){const r=await fetch(url);if(!r.ok)throw new Error('Vehicle database unavailable');return r.json();}
  year.onchange=async function(){
    reset(make,'Select make');reset(model,'Select model');reset(engine,'Select engine');if(!this.value)return;loading(make);
    try{const d=await get(`${api}/GetMakesForVehicleType/car?format=json`);const names=[...new Set((d.Results||[]).map(x=>x.MakeName).filter(Boolean))].sort();make.innerHTML='<option value="">Select make</option>';names.forEach(n=>make.add(new Option(n,n)));make.disabled=false;}catch(e){make.innerHTML='<option value="">Vehicle database unavailable</option>';}
  };
  make.onchange=async function(){
    reset(model,'Select model');reset(engine,'Select engine');if(!year.value||!this.value)return;loading(model);
    try{const d=await get(`${api}/GetModelsForMakeYear/make/${encodeURIComponent(this.value)}/modelyear/${year.value}/vehicletype/car?format=json`);const names=[...new Set((d.Results||[]).map(x=>x.Model_Name).filter(Boolean))].sort();model.innerHTML='<option value="">Select model</option>';names.forEach(n=>model.add(new Option(n,n)));model.disabled=false;}catch(e){model.innerHTML='<option value="">Models unavailable</option>';}
  };
  model.onchange=function(){
    reset(engine,'Select engine');if(!this.value)return;
    engine.add(new Option('I know my engine — enter below','custom'));engine.add(new Option('Engine not listed — enter below','custom'));engine.disabled=false;
    let wrap=$('customEngineWrap');
    if(wrap)wrap.classList.remove('hidden');
    engine.onchange=function(){if(wrap)wrap.classList.toggle('hidden',this.value!=='custom');};
  };
  window.PROMT_VEHICLE_DATABASE={name:'PROMT WORKS Expanded Vehicle Database',source:'NHTSA vPIC',coverage:'U.S. passenger vehicles, model years 1981–2026',selector:'Year → Make → Model → Engine'};
})();
