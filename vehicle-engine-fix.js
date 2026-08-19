/* DASH VEHICLE SELECTOR FIX
   Authoritative fallback for the booking vehicle chain.
   Keeps Year -> Make -> Model -> Engine -> Trim usable even when a remote
   vehicle API or an optional catalog script is unavailable.
*/
(function(){
  'use strict';

  function norm(v){return String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');}
  function uniq(values){return [...new Set((values||[]).filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));}
  function fill(el,placeholder,values,disabled){
    if(!el)return;
    el.innerHTML='';
    el.add(new Option(placeholder,''));
    uniq(values).forEach(v=>el.add(new Option(v,v)));
    el.disabled=!!disabled;
  }
  function catalog(){return (window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG)||{};}
  function find(obj,key){
    if(!obj||typeof obj!=='object')return null;
    const wanted=norm(key),actual=Object.keys(obj).find(k=>norm(k)===wanted);
    return actual?obj[actual]:null;
  }
  function entry(year,make,model){
    const c=catalog();
    return find(c,[year,make,model].join('|'))||find(c,[make,model].join('|'))||
      (find(find(find(c,String(year)),make),model))||find(find(c,make),model)||null;
  }
  function supplied(){return window.DASH_CUSTOMER_VEHICLES||{};}
  const fallbackMakes=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
  const years=Array.from({length:83},(_,i)=>1945+i);

  async function vpic(url){
    try{const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});if(!r.ok)throw 0;return await r.json();}catch(e){return null;}
  }

  function getLocalMakes(year){return Object.keys(supplied()[String(year)]||{});}
  function getLocalModels(year,make){
    const bucket=supplied()[String(year)]||{};
    const key=Object.keys(bucket).find(k=>norm(k)===norm(make));
    const value=key?bucket[key]:[];
    return Array.isArray(value)?value.map(x=>typeof x==='string'?x:(x.model||x.Model||x.name||'')):[];
  }
  function getLocalEntryModels(year,make){
    const c=catalog();
    const y=find(c,String(year));
    const m=find(y,make);
    return m&&typeof m==='object'?Object.keys(m):[];
  }

  async function init(){
    const year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
    if(!year||!make||!model||!engine||!trim)return;

    fill(year,'Select year',years,false);
    fill(make,'Select make',fallbackMakes,false);
    fill(model,'Select model',[],true);
    fill(engine,'Select engine',[],true);
    fill(trim,'Select trim',[],true);

    year.addEventListener('change',async function(){
      const y=this.value;
      fill(make,'Loading makes...',[],true);fill(model,'Select model',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);
      if(!y){fill(make,'Select make',fallbackMakes,false);return;}
      let makes=fallbackMakes.concat(getLocalMakes(y));
      const d=await vpic('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
      if(d&&Array.isArray(d.Results))makes=makes.concat(d.Results.map(x=>x.MakeName||x.Make_Name));
      fill(make,'Select make',makes,false);
    });

    make.addEventListener('change',async function(){
      const y=year.value,m=this.value;
      fill(model,'Loading models...',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);
      if(!y||!m){fill(model,'Select model',[],true);return;}
      let models=getLocalModels(y,m).concat(getLocalEntryModels(y,m));
      if(Number(y)>=1996){
        const d=await vpic('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/'+encodeURIComponent(m)+'/modelyear/'+encodeURIComponent(y)+'?format=json');
        if(d&&Array.isArray(d.Results))models=models.concat(d.Results.map(x=>x.Model_Name||x.ModelName));
      }
      models=uniq(models);
      fill(model,models.length?'Select model':'Model not listed — enter exact model',models,false);
      if(!models.length){
        let w=document.getElementById('dashCustomModelWrap');
        if(!w){w=document.createElement('div');w.id='dashCustomModelWrap';w.className='field full';w.innerHTML='<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Enter exact vehicle model">';model.closest('.field').after(w);}
        w.classList.remove('hidden');
      }
    });

    model.addEventListener('change',function(){
      const y=year.value,m=make.value,mo=this.value;
      fill(trim,'Loading trims...',[],true);fill(engine,'Loading engines...',[],false);
      if(!y||!m||!mo){fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);return;}
      const e=entry(y,m,mo);
      const engines=uniq(e&&Array.isArray(e.engines)?e.engines:[]);
      const trims=uniq(e&&Array.isArray(e.trims)?e.trims:[]);
      fill(engine,engines.length?'Select engine':'Engine not listed — enter exact engine',engines,false);
      engine.add(new Option('I know my engine — enter below','__manual__'));
      fill(trim,trims.length?'Select trim':'Trim not listed — enter exact trim',trims,false);
      if(!trims.length){
        let w=document.getElementById('dashCustomTrimWrap');
        if(!w){w=document.createElement('div');w.id='dashCustomTrimWrap';w.className='field full';w.innerHTML='<label for="dashCustomTrim">Exact factory trim</label><input id="dashCustomTrim" placeholder="Enter exact factory trim">';trim.closest('.field').after(w);}
        w.classList.remove('hidden');
      }
    });

    engine.addEventListener('change',function(){
      let w=document.getElementById('dashEngineManualWrap');
      if(!w){w=document.createElement('div');w.id='dashEngineManualWrap';w.className='field full';w.innerHTML='<label for="dashEngineManual">Exact factory engine</label><input id="dashEngineManual" placeholder="Example: 3.5L V6, 5.0L V8, 2.0L Turbo I4">';engine.closest('.field').after(w);}
      w.classList.toggle('hidden',this.value!=='__manual__');
      engine.disabled=false;
    });

    trim.addEventListener('change',()=>{engine.disabled=false;});
    window.DASHVehicleSelectorReady=true;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
