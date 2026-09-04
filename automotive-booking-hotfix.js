/* DASH MOBILE SERVICES — Automotive booking hotfix only.
   Does not replace the existing booking system. It only restores the automotive
   service buttons and vehicle selector when competing legacy wrappers fail to
   initialize correctly.
*/
(function(){
  'use strict';
  var SERVICES=[
    ['oil','Oil Change'],['wipers','Wiper Replacement'],['battery','Battery Replacement'],
    ['jump','Jump-Start Service'],['tire','Tire Pressure Check & Inflation'],
    ['tire-replacement','Tire Replacement'],['air','Engine Air Filter Replacement'],
    ['cabin','Cabin Air Filter Replacement'],['headlight','Headlight Assembly Replacement'],
    ['brake-light','Brake/Tail Light Assembly Replacement'],['fluid','Fluid Top-Off Service']
  ];
  function el(id){return document.getElementById(id)}
  function automotiveService(key){return SERVICES.some(function(s){return s[0]===key})}
  function ensureServiceOptions(){
    var select=el('service');
    if(!select)return;
    SERVICES.forEach(function(s){
      if(!Array.prototype.some.call(select.options,function(o){return o.value===s[0]}))select.add(new Option(s[1],s[0]));
    });
  }
  function resetVehicleField(id,prompt){
    var e=el(id);if(!e)return;
    e.innerHTML='';e.add(new Option(prompt,''));e.disabled=true;e.hidden=false;e.style.display='';e.removeAttribute('aria-hidden');e.removeAttribute('aria-disabled');
  }
  function fallbackVehicleInit(){
    var year=el('year'),make=el('make'),model=el('model'),engine=el('engine'),trim=el('trim');
    if(!year||!make||!model||!engine||!trim)return;
    if(year.dataset.dashHotfixBound==='1')return;
    year.dataset.dashHotfixBound='1';
    var catalog=window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG||{};
    var makes=[].concat(Object.keys(catalog).map(function(k){return k.split('|')[0]}));
    makes=[].concat(new Set(makes));
    if(!make.options.length||make.options.length<2){
      make.innerHTML='';make.add(new Option('Select make',''));makes.sort().forEach(function(x){make.add(new Option(x,x))});
    }
    make.addEventListener('change',function(){
      var m=make.value;model.innerHTML='';model.add(new Option('Select model',''));resetVehicleField('engine','Select engine');resetVehicleField('trim','Select trim');
      Object.keys(catalog).filter(function(k){return k.split('|')[0]===m}).map(function(k){return k.split('|').slice(1).join('|')}).sort().forEach(function(x){model.add(new Option(x,x))});
      model.disabled=false;
    });
    model.addEventListener('change',function(){
      var key=make.value+'|'+model.value,d=catalog[key];resetVehicleField('engine','Select engine');resetVehicleField('trim','Select trim');
      if(!d)return;
      (d.engines||[]).forEach(function(x){engine.add(new Option(x,x))});
      (d.trims||[]).forEach(function(x){trim.add(new Option(x,x))});
      engine.disabled=!(d.engines||[]).length;trim.disabled=!(d.trims||[]).length;
    });
  }
  function bindAutomotiveButtons(){
    document.querySelectorAll('#automotive .service button').forEach(function(button){
      if(button.dataset.dashAutoHotfix==='1')return;
      var attr=button.getAttribute('onclick')||'';
      var match=attr.match(/openBooking\(['\"]([^'\"]+)['\"]\)/);
      if(!match||!automotiveService(match[1]))return;
      button.dataset.dashAutoHotfix='1';
      button.type='button';
      button.onclick=function(e){
        if(e){e.preventDefault();e.stopPropagation()}
        var key=match[1],booking=el('booking'),service=el('service'),auto=el('automotive');
        if(!booking||!service||!auto)return;
        auto.classList.add('open');booking.classList.add('open');service.value=key;
        ['estimate','review','contact'].forEach(function(id){var x=el(id);if(x)x.classList.remove('open')});
        for(var i=1;i<=5;i++){var p=el('p'+i);if(p)p.classList.toggle('active',i===2)}
        if(typeof window.updateSpecial==='function')window.updateSpecial();
        if(booking.scrollIntoView)booking.scrollIntoView({behavior:'smooth',block:'start'});
      };
    });
  }
  function init(){
    ensureServiceOptions();
    fallbackVehicleInit();
    bindAutomotiveButtons();
    var select=el('service');
    if(select&&select.dataset.dashAutoHotfixChange!=='1'){
      select.dataset.dashAutoHotfixChange='1';
      select.addEventListener('change',function(){
        if(!automotiveService(select.value))return;
        ['estimate','review','contact'].forEach(function(id){var x=el(id);if(x)x.classList.remove('open')});
        var auto=el('automotive');if(auto)auto.classList.add('open');
      });
    }
  }
  function ready(){init();setTimeout(init,250);setTimeout(init,1000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
