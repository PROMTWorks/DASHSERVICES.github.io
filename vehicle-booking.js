/* DASH vehicle booking compatibility layer.
   The expanded vehicle database owns Year -> Make -> Model -> Engine.
   This file intentionally does not replace those handlers.
*/
(function(){
  'use strict';
  function init(){
    const year=document.getElementById('year');
    if(!year || year.dataset.dashVehicleInit==='1') return;
    console.warn('DASH vehicle database has not initialized yet.');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
