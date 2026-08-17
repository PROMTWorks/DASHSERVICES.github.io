/* DASH vehicle database entrypoint.
   Loads the expanded selector used by the public booking page.
*/
(function(){
  'use strict';
  function load(){
    var s=document.createElement('script');
    s.src='./vehicle-database-expanded.js?v=20260816';
    s.async=false;
    s.onload=function(){window.DASHVehicleDatabaseLoaded=true;};
    s.onerror=function(){console.error('DASH vehicle database failed to load');};
    document.head.appendChild(s);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
