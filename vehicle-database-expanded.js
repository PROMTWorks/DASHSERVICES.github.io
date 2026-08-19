/* PROMT WORKS — EXPANDED VEHICLE DATABASE
   Year / make / model / trim / engine selector.

   Data strategy:
   1. Customer-supplied historic vehicle data remains authoritative for the
      years/models that were manually supplied to DASH.
   2. NHTSA vPIC supplies year-specific makes/models for 1996+.
   3. NHTSA SafetyRatings vehicle variants are used as a public trim/variant
      fallback for 1996+ when a dedicated trim source is unavailable.
   4. The local DASH catalog is merged as a fallback, with year-specific
      entries taking priority over generic model entries.

   IMPORTANT: Catalog lookups are case-insensitive because NHTSA/vPIC may
   return DODGE/CARAVAN while local catalog keys are Dodge/Caravan. This keeps
   the entire existing vehicle list connected to the trim/engine catalog.
*/
(function(){
'use strict';

function init(){
  const year=document.getElementById('year');
  const make=document.getElementById('make');
  const model=document.getElementById('model');
  const engine=document.getElementById('engine');
  const trim=document.getElementById('trim');
  if(!year||!make||!model||!engine||!trim||year.dataset.dashVehicleInit==='1')return;
  year.dataset.dashVehicleInit='1';

  const vpic='https://vpic.nhtsa.dot.gov/api/vehicles';
  const safety='https://api.nhtsa.gov/SafetyRatings';
  const suppliedVehicles=window.DASH_CUSTOMER_VEHICLES||{};
  const suppliedYears=Array.from({length:83},(_,i)=>1945+i);
  const fallbackMakes=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];

  const uniq=a=>[...new Set((a||[]).filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const norm=v=>String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');
  const options=(el,label,values,disabled)=>{
    el.innerHTML='';
    el.add(new Option(label,''));
    uniq(values).forEach(v=>el.add(new Option(v,v)));
    el.disabled=!!disabled;
  };
  const reset=(el,label)=>options(el,label,[],true);
  const get=async url=>{
    const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!r.ok)throw new Error('HTTP '+r.status);
    return r.json();
  };

  const suppliedMakes=y=>Object.keys(suppliedVehicles[String(y)]||{});
  const suppliedModels=(y,m)=>{
    const bucket=suppliedVehicles[String(y)]||{};
    const key=Object.keys(bucket).find(k=>norm(k)===norm(m));
    return key?bucket[key]:[];
  };
  const nhtsaYearSupported=y=>Number(y)>=1996;

  // Resolve local catalog entries case-insensitively and support both the
  // year-specific and generic make/model keys already present in DASH.
  function findCatalogObject(catalog,key){
    if(!catalog||typeof catalog!=='object')return null;
    const wanted=norm(key);
    const exact=Object.keys(catalog).find(k=>norm(k)===wanted);
    return exact?catalog[exact]:null;
  }

  function catalogEntry(y,m,mo){
    const catalog=(window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG)||{};
    const yearKey=[String(y),m,mo].join('|');
    const makeModel=[m,mo].join('|');
    const direct=findCatalogObject(catalog,yearKey);
    if(direct)return direct;
    const generic=findCatalogObject(catalog,makeModel);
    if(generic)return generic;

    const yearBucket=findCatalogObject(catalog,String(y));
    if(yearBucket){
      const makeBucket=findCatalogObject(yearBucket,m);
      if(makeBucket){
        const modelEntry=findCatalogObject(makeBucket,mo);
        if(modelEntry)return modelEntry;
      }
    }

    const makeBucket=findCatalogObject(catalog,m);
    if(makeBucket){
      const modelEntry=findCatalogObject(makeBucket,mo);
      if(modelEntry)return modelEntry;
    }
    return null;
  }

  function addCustomModel(){
    let w=document.getElementById('dashCustomModelWrap');
    if(!w){
      w=document.createElement('div');
      w.id='dashCustomModelWrap';
      w.className='field full';
      w.innerHTML='<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Example: F-150, Civic, Silverado 1500">';
      model.closest('.field').after(w);
    }
    w.classList.remove('hidden');
  }

  function addCustomTrim(){
    let w=document.getElementById('dashCustomTrimWrap');
    if(!w){
      w=document.createElement('div');
      w.id='dashCustomTrimWrap';
      w.className='field full';
      w.innerHTML='<label for="dashCustomTrim">Exact factory trim</label><input id="dashCustomTrim" placeholder="Example: SE, SXT, EX, XLT, Limited">';
      trim.closest('.field').after(w);
    }
    w.classList.remove('hidden');
    return w;
  }

  function addCustomEngine(){
    let w=document.getElementById('dashCustomEngineWrap');
    if(!w){
      w=document.createElement('div');
      w.id='dashCustomEngineWrap';
      w.className='field full hidden';
      w.innerHTML='<label for="dashCustomEngine">Exact factory engine</label><input id="dashCustomEngine" placeholder="Example: 2.5L 4-Cylinder">';
      engine.closest('.field').after(w);
    }
    return w;
  }

  function resetAllAfterModel(){
    reset(trim,'Select trim');
    reset(engine,'Select engine');
    const tw=document.getElementById('dashCustomTrimWrap');if(tw)tw.classList.add('hidden');
    const ew=document.getElementById('dashCustomEngineWrap');if(ew)ew.classList.add('hidden');
  }

  function extractTrimVariants(data){
    const rows=Array.isArray(data?.Results)?data.Results:[];
    return rows.map(x=>x.VehicleDescription||x.VehicleDescriptionName||x.Description||x.Trim||x.SubModel||'').filter(Boolean);
  }

  async function loadNhtsaVariants(y,m,mo){
    if(!nhtsaYearSupported(y))return [];
    const url=safety+'/modelyear/'+encodeURIComponent(y)+'/make/'+encodeURIComponent(m)+'/model/'+encodeURIComponent(mo);
    try{
      return extractTrimVariants(await get(url));
    }catch(e){return []}
  }

  async function loadTrims(){
    if(!year.value||!make.value||!model.value)return;
    const y=year.value,m=make.value,mo=model.value;
    const entry=catalogEntry(y,m,mo);
    const localTrims=entry&&Array.isArray(entry.trims)?entry.trims:[];
    const variantValues=await loadNhtsaVariants(y,m,mo);
    const values=uniq(localTrims.concat(variantValues));

    if(values.length){
      options(trim,'Select trim',values,false);
    }else{
      options(trim,nhtsaYearSupported(y)?'No trim data found — enter exact trim':'Historic trim not available — enter exact trim',[],false);
      addCustomTrim();
    }

    reset(engine,'Select engine');
    const ew=document.getElementById('dashCustomEngineWrap');if(ew)ew.classList.add('hidden');
  }

  options(year,'Select year',suppliedYears,false);
  options(make,'Select make',fallbackMakes,true);
  reset(model,'Select model');
  reset(trim,'Select trim');
  reset(engine,'Select engine');

  year.addEventListener('change',async function(){
    reset(model,'Select model');
    reset(trim,'Select trim');
    reset(engine,'Select engine');
    if(!this.value){options(make,'Select make',fallbackMakes,true);return;}
    const supplied=suppliedMakes(this.value);
    options(make,'Loading makes...',[],true);
    try{
      const d=await get(vpic+'/GetMakesForVehicleType/car?format=json');
      options(make,'Select make',fallbackMakes.concat((d.Results||[]).map(x=>x.MakeName||x.Make_Name),supplied),false);
    }catch(e){
      options(make,'Select make',fallbackMakes.concat(supplied),false);
    }
  });

  make.addEventListener('change',async function(){
    reset(model,'Select model');
    reset(trim,'Select trim');
    reset(engine,'Select engine');
    if(!year.value||!this.value)return;
    const y=year.value,m=this.value,supplied=suppliedModels(y,m);
    options(model,'Loading models...',[],true);
    let names=[];
    if(nhtsaYearSupported(y)){
      try{
        const u=vpic+'/GetModelsForMakeYear/make/'+encodeURIComponent(m)+'/modelyear/'+encodeURIComponent(y)+'?format=json';
        const d=await get(u);
        names=(d.Results||[]).map(x=>x.Model_Name||x.ModelName);
      }catch(e){}
    }
    names=uniq(names.concat(supplied));
    if(names.length){
      options(model,'Select model',names,false);
    }else{
      options(model,'Model not listed — enter below',[],false);
      addCustomModel();
    }
  });

  model.addEventListener('change',function(){
    const c=document.getElementById('dashCustomModelWrap');if(c)this.value?c.classList.add('hidden'):c.classList.remove('hidden');
    resetAllAfterModel();
    loadTrims();
  });

  trim.addEventListener('change',function(){
    const c=document.getElementById('dashCustomTrimWrap');if(c&&this.value)c.classList.add('hidden');
    reset(engine,'Select engine');
    const ew=document.getElementById('dashCustomEngineWrap');if(ew)ew.classList.add('hidden');
    if(!year.value||!make.value||!model.value||!this.value)return;
    const entry=catalogEntry(year.value,make.value,model.value);
    const engines=entry&&Array.isArray(entry.engines)?entry.engines:[];
    if(engines.length){
      options(engine,'Select engine',engines,false);
      engine.add(new Option('I know my engine — enter below','__custom__'));
    }else{
      options(engine,'Engine data not available — enter below',[],false);
      addCustomEngine().classList.remove('hidden');
    }
  });

  engine.addEventListener('change',function(){
    const w=addCustomEngine();
    w.classList.toggle('hidden',this.value!=='__custom__');
  });

  window.PROMT_VEHICLE_DATABASE={
    name:'PROMT WORKS Expanded Vehicle Database',
    source:'Customer-supplied historic data + NHTSA vPIC + NHTSA SafetyRatings vehicle variants + local DASH catalog',
    nhtsaVehicleSource:'https://www.nhtsa.gov/vehicle',
    vpicSource:vpic,
    safetyRatingsSource:safety,
    years:suppliedYears,
    suppliedVehicles:suppliedVehicles,
    trimBehavior:'Year-specific local trims are merged with NHTSA SafetyRatings vehicle variants for 1996+. Historic customer-supplied years use the supplied vehicle list and local catalog where available.',
    engineBehavior:'Year/model-specific local engine data is used when available; otherwise the customer can enter the exact factory engine.',
    lookupBehavior:'Make/model/catalog matching is case-insensitive so NHTSA values such as DODGE/CARAVAN resolve to the existing Dodge/Caravan catalog entry.',
    deduplication:'Trim and engine values are deduplicated while the selected model year remains part of the lookup context.'
  };
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
