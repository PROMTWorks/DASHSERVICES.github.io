/* DASH vehicle engine selector fix.
   Keeps Engine usable for every vehicle in the existing catalog. The engine
   field must never remain disabled simply because a particular make/model
   does not yet have a local engine list.
*/
(function(){
  'use strict';
  function start(){
    const year=document.getElementById('year');
    const make=document.getElementById('make');
    const model=document.getElementById('model');
    const trim=document.getElementById('trim');
    const engine=document.getElementById('engine');
    if(!year||!make||!model||!trim||!engine)return;

    const norm=v=>String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');
    const uniq=a=>[...new Set((a||[]).filter(Boolean).map(v=>String(v).trim()).filter(Boolean))];

    function catalogEntry(){
      const c=(window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG)||{};
      const keys=Object.keys(c);
      const find=k=>{const n=norm(k);const x=keys.find(q=>norm(q)===n);return x?c[x]:null;};
      return find(make.value+'|'+model.value)||find(year.value+'|'+make.value+'|'+model.value)||null;
    }

    function customWrap(){
      let w=document.getElementById('dashCustomEngineWrap');
      if(!w){
        w=document.createElement('div');
        w.id='dashCustomEngineWrap';
        w.className='field full';
        w.innerHTML='<label for="dashCustomEngine">Exact factory engine</label><input id="dashCustomEngine" placeholder="Example: 3.6L V6, 5.3L V8, 2.0L Turbo I4">';
        const field=engine.closest('.field');
        if(field&&field.parentNode)field.parentNode.insertBefore(w,field.nextSibling);
      }
      return w;
    }

    function enableEngine(){
      const entry=catalogEntry();
      const engines=entry&&Array.isArray(entry.engines)?uniq(entry.engines):[];
      engine.disabled=false;
      engine.innerHTML='';
      engine.add(new Option(engines.length?'Select engine':'Engine not listed — enter exact engine',''));
      engines.forEach(e=>engine.add(new Option(e,e)));
      engine.add(new Option('I know my engine — enter below','__custom__'));
      customWrap().classList.toggle('hidden',engines.length>0 && engine.value!=='__custom__');
    }

    function onModel(){
      if(model.value) enableEngine();
    }
    function onTrim(){
      if(model.value) enableEngine();
    }

    model.addEventListener('change',onModel);
    trim.addEventListener('change',onTrim);
    engine.addEventListener('change',function(){
      customWrap().classList.toggle('hidden',engine.value!=='__custom__');
    });

    const observer=new MutationObserver(function(){
      if(model.value){
        const disabled=engine.disabled;
        if(disabled)enableEngine();
      }
    });
    observer.observe(engine,{attributes:true,attributeFilter:['disabled']});

    if(model.value)enableEngine();
    window.DASHVehicleEngineSelectorFixed=true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
