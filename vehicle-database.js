/* PROMT WORKS vehicle database integration
   Year/make/model coverage is loaded from the public NHTSA vPIC database.
   Engine is confirmed separately because a model can have multiple engines.
*/
(function(){
  /* DASH Services ADMIN header link.
     Prototype only: authentication will be added before the site accepts real customers. */
  const nav=document.querySelector('header nav');
  if(nav && !nav.querySelector('[data-dash-admin-link]')){
    const link=document.createElement('a');
    link.href='admin.html';
    link.textContent='ADMIN';
    link.setAttribute('data-dash-admin-link','true');
    link.setAttribute('aria-label','DASH Services Admin Portal');
    nav.appendChild(link);
  }

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
    if(!this.value)return;loading(make);
    try{
      const d=await get(`${api}/GetMakesForVehicleType/car?format=json`);
      const names=[...new Set((d.Results||[]).map(x=>x.MakeName).filter(Boolean))].sort();
      make.innerHTML='<option value="">Select make</option>';names.forEach(n=>make.add(new Option(n,n)));make.disabled=false;
    }catch(e){make.innerHTML='<option value="">Vehicle database unavailable</option>';}
  };
  make.onchange=async function(){
    reset(model,'Select model');reset(engine,'Select engine');if(!year.value||!this.value)return;loading(model);
    try{
      const d=await get(`${api}/GetModelsForMakeYear/make/${encodeURIComponent(this.value)}/modelyear/${year.value}/vehicletype/car?format=json`);
      const names=[...new Set((d.Results||[]).map(x=>x.Model_Name).filter(Boolean))].sort();
      model.innerHTML='<option value="">Select model</option>';names.forEach(n=>model.add(new Option(n,n)));model.disabled=false;
    }catch(e){model.innerHTML='<option value="">Models unavailable</option>';}
  };
  model.onchange=function(){
    reset(engine,'Select engine');if(!this.value)return;
    engine.innerHTML='<option value="">Select / confirm engine</option><option value="custom">I know my engine — enter below</option><option value="custom2">Engine not listed — enter below</option>';
    engine.disabled=false;
    let wrap=$('customEngineWrap');
    if(!wrap){
      const parent=engine.parentElement;
      wrap=document.createElement('div');wrap.id='customEngineWrap';wrap.className='hidden';
      wrap.innerHTML='<label for="customEngine">Exact engine</label><input id="customEngine" placeholder="Example: 2.5L 4-Cylinder">';
      parent.parentElement.appendChild(wrap);
    }
    engine.onchange=function(){wrap.classList.toggle('hidden',this.value!=='custom'&&this.value!=='custom2');if(window.PROMT_UPDATE_PRICE)window.PROMT_UPDATE_PRICE();};
  };
  window.PROMT_VEHICLE_DB={source:'NHTSA vPIC',coverage:'US passenger vehicles, model years 1981-2026',engineNote:'Engine must be confirmed separately before exact oil/parts fitment is promised.'};

  /* Generic pricing fallback for vehicles not in the small hand-verified table. */
  window.PROMT_UPDATE_PRICE=function(){
    const service=$('autoService')?.value,box=$('autoResult');
    if(!service||!box)return;
    const makeV=$('make')?.value,modelV=$('model')?.value,engineV=$('engine')?.value;
    if(!makeV||!modelV||!engineV||engineV==='custom'||engineV==='custom2'){box.classList.add('hidden');return;}
    let parts=0,labor=14,margin=15,details='';
    if(service==='oil'){parts=55;margin=25;details='Estimated full-synthetic oil, filter and basic materials. Exact oil specification and capacity must be verified before purchase.';}
    else if(service==='wipers'){parts=42;details='Estimated pair of quality replacement wiper blades.';}
    else if(service==='air'){parts=28;details='Estimated engine air filter.';}
    else if(service==='cabin'){parts=25;details='Estimated cabin air filter.';}
    else if(service==='battery'){parts=145;margin=20;details='Estimated standard replacement battery; exact fitment may change price.';}
    else if(service==='bulb'){parts=20;margin=10;details='Estimated basic replacement bulb; specialty bulbs may cost more.';}
    else if(service==='fluid'){parts=12;margin=10;details='Estimated basic fluid materials.';}
    else if(service==='tire'){margin=10;details='Basic tire air check and inflation.';}
    else if(service==='jump'){margin=15;details='Basic battery jump-start.';}
    const total=parts+labor+margin;
    box.innerHTML='<h3>Estimated Price</h3><p>'+details+'</p><div class="price-line"><span>Parts/materials</span><strong>$'+parts.toFixed(2)+'</strong></div><div class="price-line"><span>Labor</span><strong>$'+labor.toFixed(2)+'</strong></div><div class="price-line"><span>Travel</span><strong>$0.00</strong></div><div class="price-line"><span>Service & business margin</span><strong>$'+margin.toFixed(2)+'</strong></div><div class="total">Estimated total: $'+total.toFixed(2)+'</div>';
    box.classList.remove('hidden');
  };
  ['autoService','carColor'].forEach(id=>$(id)?.addEventListener('change',window.PROMT_UPDATE_PRICE));
})();
