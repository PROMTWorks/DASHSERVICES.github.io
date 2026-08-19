/* PROMT WORKS — EXPANDED VEHICLE DATABASE
   Year / make / model / trim / engine selector.
   Uses customer-supplied historic data + NHTSA vPIC for Y/M/M + CarListAPI
   demo/live trim and engine endpoints when available, with local fallback.
*/
(function(){'use strict';
function init(){
  const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
  if(!year||!make||!model||!engine||year.dataset.dashVehicleInit==='1')return;
  year.dataset.dashVehicleInit='1';
  const api='https://vpic.nhtsa.dot.gov/api/vehicles';
  const trimApi='https://carlistapi.com/api/v1/car-data';
  const trimDemoApi='https://carlistapi.com/api/v1/car-data-demo';
  const suppliedYears=Array.from({length:83},(_,i)=>1945+i);
  const suppliedVehicles=window.DASH_CUSTOMER_VEHICLES||{};
  const fallbackMakes=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
  const uniq=a=>[...new Set(a.filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const options=(el,label,values,disabled)=>{el.innerHTML='';el.add(new Option(label,''));uniq(values).forEach(v=>el.add(new Option(v,v)));el.disabled=!!disabled};
  const reset=(el,label)=>options(el,label,[],true);
  async function get(url,extra={}){const r=await fetch(url,{headers:{Accept:'application/json',...(extra.headers||{})},cache:'no-store'});if(!r.ok)throw Object.assign(Error('Request failed'),{status:r.status});return r.json()}
  const sm=y=>Object.keys(suppliedVehicles[String(y)]||{});
  const sx=(y,m)=>(suppliedVehicles[String(y)]||{})[m]||[];
  const nhtsaYearSupported=y=>Number(y)>=1996;
  const resetTrim=()=>{if(trim)options(trim,'Select trim',[],true)};
  const resetEngine=()=>{options(engine,'Select engine',[],true);const w=document.getElementById('dashCustomEngineWrap');if(w)w.classList.add('hidden')};
  options(year,'Select year',suppliedYears,false);options(make,'Select make',fallbackMakes,true);reset(model,'Select model');resetEngine();resetTrim();
  year.addEventListener('change',async function(){
    reset(model,'Select model');resetEngine();resetTrim();if(!this.value){options(make,'Select make',fallbackMakes,true);return}
    const supplied=sm(this.value);options(make,'Loading makes...',[],true);
    try{const d=await get(api+'/GetMakesForVehicleType/car?format=json');options(make,'Select make',fallbackMakes.concat((d.Results||[]).map(x=>x.MakeName||x.Make_Name),supplied),false)}catch(e){options(make,'Select make',fallbackMakes.concat(supplied),false)}
  });
  make.addEventListener('change',async function(){
    reset(model,'Select model');resetEngine();resetTrim();if(!year.value||!this.value)return;
    const y=year.value,m=this.value,supplied=sx(y,m);options(model,'Loading models...',[],true);
    if(nhtsaYearSupported(y)){
      try{
        const urls=[api+'/GetModelsForMakeYear/make/'+encodeURIComponent(m)+'/modelyear/'+encodeURIComponent(y)+'?format=json',api+'/GetModelsForMakeYear/make/'+encodeURIComponent(m)+'/modelyear/'+encodeURIComponent(y)+'/vehicletype/car?format=json'];
        const responses=await Promise.allSettled(urls.map(get));let names=[];responses.forEach(r=>{if(r.status==='fulfilled')names=names.concat((r.value.Results||[]).map(x=>x.Model_Name||x.ModelName))});
        names=uniq(names.concat(supplied));if(names.length){options(model,'Select model',names,false);return}
      }catch(e){}
    }
    if(supplied.length)options(model,'Select model',supplied,false);else{options(model,'Model not listed — enter below',[],false);addCustomModel()}
  });
  function addCustomModel(){let w=document.getElementById('dashCustomModelWrap');if(!w){w=document.createElement('div');w.id='dashCustomModelWrap';w.className='field full';w.innerHTML='<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Example: F-150, Civic, Silverado 1500">';model.closest('.field').after(w)}w.classList.remove('hidden')}
  function addCustomTrim(){let w=document.getElementById('dashCustomTrimWrap');if(!w&&trim){w=document.createElement('div');w.id='dashCustomTrimWrap';w.className='field full';w.innerHTML='<label for="dashCustomTrim">Exact trim</label><input id="dashCustomTrim" placeholder="Example: SE, SXT, EX, XLT, Limited">';trim.closest('.field').after(w)}if(w)w.classList.remove('hidden')}
  function addCustomEngine(){let w=document.getElementById('dashCustomEngineWrap');if(!w){w=document.createElement('div');w.id='dashCustomEngineWrap';w.className='field full hidden';w.innerHTML='<label for="dashCustomEngine">Exact engine</label><input id="dashCustomEngine" placeholder="Example: 2.5L 4-Cylinder">';engine.closest('.field').after(w)}return w}
  function extract(raw,kind){
    const d=raw&&typeof raw==='object'?(raw.data||raw.results||raw.Results||raw.trims||raw.engines||raw):raw;
    if(!Array.isArray(d))return [];
    return d.map(x=>typeof x==='string'?x:(kind==='trim'?(x.trim||x.Trim||x.name||x.Name||x.submodel||x.Submodel):(x.engine||x.Engine||x.name||x.Name||x.description||x.Description))).filter(Boolean);
  }
  async function carListGet(path){
    try{return await get(trimApi+path)}catch(primary){
      try{return await get(trimDemoApi+path.replace('/get-trims/','/get-trims-demo/').replace('/get-engines/','/get-engines-demo/'))}catch(demo){throw primary}
    }
  }
  function localCatalogEntry(y,m,mo){
    const catalog=window.DASH_VEHICLE_CATALOG||window.DASH_VEHICLE_TRIMS||{};
    return catalog[[y,m,mo].join('|')]||catalog[y]?.[m]?.[mo]||catalog[m+'|'+mo]||catalog[m]?.[mo]||null;
  }
  async function loadTrims(){
    if(!trim||!year.value||!make.value||!model.value)return;
    const y=year.value,m=make.value,mo=model.value;
    resetTrim();trim.disabled=true;trim.options[0].text='Loading trims...';
    let values=[];
    try{values=extract(await carListGet('/get-trims/'+encodeURIComponent(y)+'/'+encodeURIComponent(m)+'/'+encodeURIComponent(mo)+'/asc'),'trim')}catch(e){}
    try{const entry=localCatalogEntry(y,m,mo);if(Array.isArray(entry))values=values.concat(entry);else if(entry&&Array.isArray(entry.trims))values=values.concat(entry.trims);else if(entry&&Array.isArray(entry.Trim))values=values.concat(entry.Trim)}catch(e){}
    values=uniq(values);
    if(values.length){options(trim,'Select trim',values,false)}
    else{options(trim,'No trim data found — enter below',[],false);addCustomTrim()}
    resetEngine();
  }
  model.addEventListener('change',function(){
    const c=document.getElementById('dashCustomModelWrap');if(c&&this.value)c.classList.add('hidden');
    resetEngine();resetTrim();loadTrims();
  });
  trim&&trim.addEventListener('change',async function(){
    const c=document.getElementById('dashCustomTrimWrap');if(c&&this.value)c.classList.add('hidden');
    resetEngine();if(!year.value||!make.value||!model.value||!this.value)return;
    const y=year.value,m=make.value,mo=model.value,t=this.value;
    options(engine,'Loading engines...',[],true);
    let values=[];
    try{values=extract(await carListGet('/get-engines/'+encodeURIComponent(y)+'/'+encodeURIComponent(m)+'/'+encodeURIComponent(mo)+'/'+encodeURIComponent(t)+'/asc'),'engine')}catch(e){}
    try{const entry=localCatalogEntry(y,m,mo);if(entry&&Array.isArray(entry.engines))values=values.concat(entry.engines);else if(entry&&Array.isArray(entry.engine))values=values.concat(entry.engine)}catch(e){}
    values=uniq(values);
    const custom=addCustomEngine();
    if(values.length){options(engine,'Select engine',values,false);engine.add(new Option('I know my engine — enter below','__custom__'))}
    else{options(engine,'No engine data found — enter below',[],false);custom.classList.remove('hidden')}
  });
  engine.addEventListener('change',function(){const w=addCustomEngine();w.classList.toggle('hidden',this.value!=='__custom__')});
  window.PROMT_VEHICLE_DATABASE={name:'PROMT WORKS Expanded Vehicle Database',source:'Customer-supplied vehicle data + NHTSA vPIC + CarListAPI trim/engine data',nhtsaSource:'https://www.nhtsa.gov/vehicle',apiSource:api,trimEngineSource:trimApi,trimDemoSource:trimDemoApi,years:suppliedYears,suppliedVehicles:suppliedVehicles,behavior:'NHTSA vPIC year-specific model data for 1996+ is merged with DASH-supplied historic data. Trim and engine choices are requested for the selected year/make/model at selection time. CarListAPI production endpoints are attempted first; its documented demo endpoints are used as a fallback when production authentication is unavailable. Local catalog data is also merged and all selector values are deduplicated.',normalization:'Repeated makes, models, trims and engines are deduplicated while year relationships remain distinct'}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
