/* DASH vehicle database entrypoint.
   Loads customer-supplied vehicle data first, then the selector and catalog.
*/
(function(){
  'use strict';
  function load(src,done){var s=document.createElement('script');s.src=src;s.async=false;s.onload=done;s.onerror=function(){console.error('DASH vehicle database failed to load:',src);};document.head.appendChild(s);}
  function start(){
    load('./vehicle-customer-data.js?v=20260819a',function(){
      load('./vehicle-customer-data-1984.js?v=20260819d',function(){
        load('./vehicle-database-expanded.js?v=20260819c',function(){
          load('./vehicle-catalog.js?v=20260816b',function(){window.DASHVehicleDatabaseLoaded=true;});
        });
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
