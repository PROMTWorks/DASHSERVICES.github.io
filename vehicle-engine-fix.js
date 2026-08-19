/* DASH ENGINE SELECTOR FIX
   Keeps Engine enabled for every selectable vehicle model instead of waiting
   for a trim-specific catalog entry. Uses the existing local catalog when it
   has engine data and otherwise leaves a usable manual-entry option.
*/
(function(){
  'use strict';

  function norm(v){
    return String(v||'').trim().toLowerCase().replace(/[\s_]+/g,' ');
  }

  function catalogEntry(year,make,model){
    const catalog=(window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG)||{};
    const keys=[
      [year,make,model].join('|'),
      [make,model].join('|')
    ];
    for(const wanted of keys){
      const key=Object.keys(catalog).find(k=>norm(k)===norm(wanted));
      if(key)return catalog[key];
    }
    return null;
  }

  function ensureCustomInput(engine){
    let w=document.getElementById('dashEngineManualWrap');
    if(!w){
      w=document.createElement('div');
      w.id='dashEngineManualWrap';
      w.className='field full';
      w.innerHTML='<label for="dashEngineManual">Exact factory engine</label><input id="dashEngineManual" placeholder="Example: 3.3L V6, 5.0L V8, 2.0L Turbo I4">';
      engine.closest('.field').after(w);
    }
    return w;
  }

  function refresh(){
    const year=document.getElementById('year');
    const make=document.getElementById('make');
    const model=document.getElementById('model');
    const trim=document.getElementById('trim');
    const engine=document.getElementById('engine');
    if(!year||!make||!model||!trim||!engine||!year.value||!make.value||!model.value)return;

    const entry=catalogEntry(year.value,make.value,model.value);
    const engines=entry&&Array.isArray(entry.engines)?entry.engines.filter(Boolean):[];
    const current=engine.value;

    engine.disabled=false;
    engine.innerHTML='';
    engine.add(new Option('Select engine',''));
    engines.forEach(v=>engine.add(new Option(v,v)));
    engine.add(new Option('I know my engine — enter below','__manual__'));

    if(current && [...engine.options].some(o=>o.value===current))engine.value=current;

    const manual=ensureCustomInput(engine);
    manual.classList.toggle('hidden',engine.value!=='__manual__');
  }

  function init(){
    const model=document.getElementById('model');
    const trim=document.getElementById('trim');
    const engine=document.getElementById('engine');
    if(!model||!trim||!engine)return;

    model.addEventListener('change',refresh);
    trim.addEventListener('change',refresh);
    engine.addEventListener('change',function(){
      ensureCustomInput(engine).classList.toggle('hidden',engine.value!=='__manual__');
    });

    const observer=new MutationObserver(function(){
      if(model.value && document.activeElement!==engine)refresh();
    });
    observer.observe(engine,{attributes:true,childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
