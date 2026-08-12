/* PROMT WORKS comprehensive vehicle selector
   Uses the public NHTSA vPIC API for US year/make/model coverage.
   Engine specifications and service materials are intentionally not guessed:
   the customer can enter/confirm the exact engine when a model has multiple variants.
*/
(function(){
  const $=id=>document.getElementById(id);
  const year=$('year'),make=$('make'),model=$('model'),engine=$('engine');
  if(!year||!make||!model||!engine)return;
  const api='https://vpic.nhtsa.dot.gov/api/vehicles';
  const years=Array.from({length:46},(_,i)=>2026-i);
  year.innerHTML='<option value="">Select year</option>';
  years.forEach(y=>year.add(new Option(y,y)));

  function reset(el,label){el.innerHTML='';el.add(new Option(label,''));el.disabled=true;}
  function loading(el){el.innerHTML='<option value="">Loading...</option>';el.disabled=true;}
  async function get(url){const r=await fetch(url);if(!r.ok)throw new Error('Vehicle database unavailable');return r.json();}

  year.onchange=async function(){
    reset(make,'Select make');reset(model,'Select model');reset(engine,'Select engine');
    if(!this.value)return; loading(make);
    try{
      const d=await get(`${api}/GetMakesForVehicleType/car?format=json`);
      const names=[...new Set((d.Results||[]).map(x=>x.MakeName).filter(Boolean))].sort();
      make.innerHTML='<option value="">Select make</option>';
      names.forEach(n=>make.add(new Option(n,n)));
      make.disabled=false;
    }catch(e){make.innerHTML='<option value="">Vehicle database unavailable</option>';}
  };

  make.onchange=async function(){
    reset(model,'Select model');reset(engine,'Select engine');
    if(!year.value||!this.value)return; loading(model);
    try{
      const d=await get(`${api}/GetModelsForMakeYear/make/${encodeURIComponent(this.value)}/modelyear/${year.value}/vehicletype/car?format=json`);
      const names=[...new Set((d.Results||[]).map(x=>x.Model_Name).filter(Boolean))].sort();
      model.innerHTML='<option value="">Select model</option>';
      names.forEach(n=>model.add(new Option(n,n)));
      model.disabled=false;
    }catch(e){model.innerHTML='<option value="">Models unavailable</option>';}
  };

  model.onchange=function(){
    reset(engine,'Select engine');
    if(!this.value)return;
    engine.innerHTML='';
    engine.add(new Option('Select / confirm engine',''));
    engine.add(new Option('I know my engine — enter below','custom'));
    engine.add(new Option('Engine not listed — enter below','custom'));
    engine.disabled=false;
    let wrap=$('customEngineWrap');
    if(!wrap){
      const parent=engine.parentElement;
      wrap=document.createElement('div');wrap.id='customEngineWrap';wrap.className='hidden';
      wrap.innerHTML='<label for="customEngine">Exact engine (required for accurate oil/parts pricing)</label><input id="customEngine" placeholder="Example: 2.5L 4-Cylinder">';
      parent.parentElement.appendChild(wrap);
    }
    const custom=$('customEngine');
    engine.onchange=function(){wrap.classList.toggle('hidden',this.value!=='custom');};
  };

  /* Replace the old static pricing behavior with a safe vehicle-aware estimate.
     Exact oil/parts pricing is only shown when a known engine is selected or entered. */
  const service=$('autoService');
  const oldResult=$('autoResult');
  if(service){
    service.addEventListener('change',()=>{if(window.PROMT_UPDATE_PRICE)window.PROMT_UPDATE_PRICE();});
  }

  window.PROMT_VEHICLE_DB={source:'NHTSA vPIC',coverage:'US passenger vehicles, model years 1981-2026',engineNote:'Engine is confirmed separately because year/make/model alone can have multiple engine configurations.'};
})();
