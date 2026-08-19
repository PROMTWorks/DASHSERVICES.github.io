/* PROMT WORKS — EXPANDED VEHICLE DATABASE
   Year / make / model selector backed by NHTSA vPIC where the API supports
   model-year lookups, while preserving vehicle data supplied directly to DASH.
*/
(function(){'use strict';
function init(){
  const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine');
  if(!year||!make||!model||!engine||year.dataset.dashVehicleInit==='1')return;
  year.dataset.dashVehicleInit='1';
  const api='https://vpic.nhtsa.dot.gov/api/vehicles';
  const suppliedYears=Array.from({length:83},(_,i)=>1945+i);
  const suppliedVehicles=window.DASH_CUSTOMER_VEHICLES||{};
  const fallbackMakes=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','SEAT','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
  const uniq=a=>[...new Set(a.filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  const options=(el,label,values,disabled)=>{el.innerHTML='';el.add(new Option(label,''));uniq(values).forEach(v=>el.add(new Option(v,v)));el.disabled=!!disabled};
  const reset=(el,label)=>options(el,label,[],true);
  async function get(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw Error('NHTSA request failed');return r.json()}
  const sm=y=>Object.keys(suppliedVehicles[String(y)]||{});
  const sx=(y,m)=>(suppliedVehicles[String(y)]||{})[m]||[];
  const nhtsaYearSupported=y=>Number(y)>=1996;

  options(year,'Select year',suppliedYears,false);
  options(make,'Select make',fallbackMakes,true);
  reset(model,'Select model');
  reset(engine,'Select engine');

  year.addEventListener('change',async function(){
    reset(model,'Select model');
    reset(engine,'Select engine');
    if(!this.value){options(make,'Select make',fallbackMakes,true);return}
    const supplied=sm(this.value);
    options(make,'Loading makes...',[],true);
    try{
      /* NHTSA documents GetMakesForVehicleType as the complete make list;
         year-specific filtering is established by the model lookup below. */
      const d=await get(api+'/GetMakesForVehicleType/car?format=json');
      options(make,'Select make',fallbackMakes.concat((d.Results||[]).map(x=>x.MakeName||x.Make_Name),supplied),false);
    }catch(e){
      options(make,'Select make',fallbackMakes.concat(supplied),false);
    }
  });

  make.addEventListener('change',async function(){
    reset(model,'Select model');
    reset(engine,'Select engine');
    if(!year.value||!this.value)return;
    const supplied=sx(year.value,this.value);
    options(model,'Loading models...',[],true);

    if(nhtsaYearSupported(year.value)){
      try{
        const d=await get(api+'/GetModelsForMakeYear/make/'+encodeURIComponent(this.value)+'/modelyear/'+encodeURIComponent(year.value)+'/vehicletype/car?format=json');
        const names=uniq((d.Results||[]).map(x=>x.Model_Name||x.ModelName).concat(supplied));
        if(names.length){options(model,'Select model',names,false);return}
      }catch(e){}
    }

    /* NHTSA's documented year-specific model endpoint is limited to model
       years greater than 1995. Older years use the historical data supplied
       directly to DASH rather than unrelated modern model data. */
    if(supplied.length)options(model,'Select model',supplied,false);
    else{options(model,'Model not listed — enter below',[],false);addCustomModel()}
  });

  function addCustomModel(){
    let w=document.getElementById('dashCustomModelWrap');
    if(!w){w=document.createElement('div');w.id='dashCustomModelWrap';w.className='field full';w.innerHTML='<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Example: F-150, Civic, Silverado 1500">';model.closest('.field').after(w)}
    w.classList.remove('hidden');
  }

  model.addEventListener('change',function(){
    const c=document.getElementById('dashCustomModelWrap');if(c&&this.value)c.classList.add('hidden');
    options(engine,'Select engine',['I know my engine — enter below','Engine not listed — enter below'],false);
    let w=document.getElementById('dashCustomEngineWrap');
    if(!w){w=document.createElement('div');w.id='dashCustomEngineWrap';w.className='field full hidden';w.innerHTML='<label for="dashCustomEngine">Exact engine</label><input id="dashCustomEngine" placeholder="Example: 2.5L 4-Cylinder">';engine.closest('.field').after(w)}
    engine.onchange=function(){w.classList.toggle('hidden',!this.value)};
  });

  window.PROMT_VEHICLE_DATABASE={
    name:'PROMT WORKS Expanded Vehicle Database',
    source:'Customer-supplied vehicle data + NHTSA vPIC',
    nhtsaSource:'https://www.nhtsa.gov/vehicle',
    apiSource:api,
    years:suppliedYears,
    suppliedVehicles:suppliedVehicles,
    behavior:'NHTSA vPIC supplies year-specific models for 1996+; DASH-supplied historic data is retained for earlier years and any NHTSA gaps.',
    normalization:'Repeated makes and models are deduplicated in selector options while year relationships remain distinct.'
  };
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
