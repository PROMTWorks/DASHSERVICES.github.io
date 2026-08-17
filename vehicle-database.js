/* DASH vehicle database entrypoint.
   Self-contained loader: the booking selector is the single source of truth.
   No dependency on vehicle-database-legacy.js.
*/
(function(){
  'use strict';
  if (window.DASHVehicleDatabaseLoader) return;
  window.DASHVehicleDatabaseLoader = true;

  function load(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  // Load the actual booking selector directly. The selector contains its own
  // fallback make list and live model lookup, so a missing legacy file cannot
  // prevent vehicle selection from initializing.
  load('./vehicle-booking.js').catch(function(err){
    console.error('DASH vehicle selector failed to load', err);
  });
})();
