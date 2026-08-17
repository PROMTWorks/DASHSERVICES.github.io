/* DASH vehicle database entrypoint.
   Loads the public vehicle selector first, then the Year -> Make -> Model ->
   Engine -> Trim -> Service catalog layer.
*/
(function(){
  'use strict';
  function load(src, done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=done;
    s.onerror=function(){console.error('DASH vehicle database failed to load:',src);};
    document.head.appendChild(s);
  }
  function start(){
    load('./vehicle-database-expanded.js?v=20260816b',function(){
      load('./vehicle-catalog.js?v=20260816b',function(){
        window.DASHVehicleDatabaseLoaded=true;
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
