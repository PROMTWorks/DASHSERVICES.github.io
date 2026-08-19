/* PROMT WORKS — EXPANDED VEHICLE DATABASE
   Vehicle selector foundation for the DASH booking system.
   Year coverage supplied by the customer: 1945, 1949–2027.
   Incoming year/make/model data is normalized so repeated makes/models are
   stored once while their year relationships are preserved.
*/
(function(){
  'use strict';
  function init(){
    const year=document.getElementById('year');
    const make=document.getElementById('make');
    const model=document.getElementById('model');
    const engine=document.getElementById('engine');
    if(!year||!make||!model||!engine)return;
    if(year.dataset.dashVehicleInit==='1')return;
    year.dataset.dashVehicleInit='1';

    const api='https://vpic.nhtsa.dot.gov/api/vehicles';
    const suppliedYears=[1945,...Array.from({length:79},(_,i)=>1949+i)];
    const fallbackMakes=[
      'Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar',
      'Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu',
      'Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner',
      'Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu',
      'Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack',
      'Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI',
      'Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar',
      'Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','SEAT',
      'Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD',
      'Volkswagen','Volvo','Western Star','Willys','Workhorse'
    ];
    const uniq=a=>[...new Set(a.filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    function options(el,label,values,disabled){el.innerHTML='';el.add(new Option(label,''));uniq(values).forEach(v=>el.add(new Option(v,v)));el.disabled=!!disabled;}
    function reset(el,label){options(el,label,[],true);}
    async function get(url){const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error('request failed');return r.json();}

    options(year,'Select year',suppliedYears,false);
    options(make,'Select make',fallbackMakes,true);
    reset(model,'Select model');
    reset(engine,'Select engine');

    year.addEventListener('change',async function(){
      reset(model,'Select model');reset(engine,'Select engine');
      if(!this.value){options(make,'Select make',fallbackMakes,true);return;}
      options(make,'Loading makes...',[],true);
      try{
        const d=await get(api+'/GetMakesForVehicleType/car?format=json');
        const live=(d.Results||[]).map(x=>x.MakeName||x.Make_Name);
        options(make,'Select make',fallbackMakes.concat(live),false);
      }catch(e){options(make,'Select make',fallbackMakes,false);}
    });

    make.addEventListener('change',async function(){
      reset(model,'Select model');reset(engine,'Select engine');
      if(!year.value||!this.value)return;
      options(model,'Loading models...',[],true);
      try{
        const d=await get(api+'/GetModelsForMakeYear/make/'+encodeURIComponent(this.value)+'/modelyear/'+encodeURIComponent(year.value)+'/vehicletype/car?format=json');
        let names=(d.Results||[]).map(x=>x.Model_Name||x.ModelName);
        if(!names.length){
          const broad=await get(api+'/GetModelsForMake/make/'+encodeURIComponent(this.value)+'?format=json');
          names=(broad.Results||[]).map(x=>x.Model_Name||x.ModelName);
        }
        if(names.length){options(model,'Select model',names,false);}
        else{options(model,'Model not listed — enter below',[],false);addCustomModel();}
      }catch(e){options(model,'Model not listed — enter below',[],false);addCustomModel();}
    });

    function addCustomModel(){
      let wrap=document.getElementById('dashCustomModelWrap');
      if(!wrap){
        wrap=document.createElement('div');wrap.id='dashCustomModelWrap';wrap.className='field full';
        wrap.innerHTML='<label for="dashCustomModel">Exact model</label><input id="dashCustomModel" placeholder="Example: F-150, Civic, Silverado 1500">';
        model.closest('.field').after(wrap);
      }
      wrap.classList.remove('hidden');
    }

    model.addEventListener('change',function(){
      const custom=document.getElementById('dashCustomModelWrap');
      if(custom&&this.value)custom.classList.add('hidden');
      options(engine,'Select engine',['I know my engine — enter below','Engine not listed — enter below'],false);
      let wrap=document.getElementById('dashCustomEngineWrap');
      if(!wrap){
        wrap=document.createElement('div');wrap.id='dashCustomEngineWrap';wrap.className='field full hidden';
        wrap.innerHTML='<label for="dashCustomEngine">Exact engine</label><input id="dashCustomEngine" placeholder="Example: 2.5L 4-Cylinder">';
        engine.closest('.field').after(wrap);
      }
      engine.onchange=function(){wrap.classList.toggle('hidden',!this.value);};
    });

    window.PROMT_VEHICLE_DATABASE={
      name:'PROMT WORKS Expanded Vehicle Database',
      source:'Customer-supplied year list + NHTSA vPIC + incoming customer make/model data',
      suppliedYears:suppliedYears,
      normalization:'Repeated makes and models are deduplicated in selector options while year relationships remain distinct.'
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
