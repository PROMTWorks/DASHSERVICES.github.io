/* DASH vehicle database entrypoint.
   Loads customer-supplied vehicle data first, then the selector and catalog.
*/
(function(){
  'use strict';
  function load(src,done){var s=document.createElement('script');s.src=src;s.async=false;s.onload=done;s.onerror=function(){console.error('DASH vehicle database failed to load:',src);};document.head.appendChild(s);}
  function start(){
    load('./vehicle-customer-data.js?v=20260819a',function(){
      load('./vehicle-customer-data-1984.js?v=20260819d',function(){
        load('./vehicle-customer-data-1988.js?v=20260819e',function(){
          load('./vehicle-database-expanded.js?v=20260819c',function(){
            load('./vehicle-catalog.js?v=20260816b',function(){
              window.DASHVehicleDatabaseLoaded=true;
              load('./vehicle-service-policy.js?v=20260819a',function(){
                // Start the live year/make/model selector after the database
                // data and catalog have finished loading.
                load('./vehicle-booking.js?v=20260819f',function(){
                  window.DASHVehicleBookingLoaded=true;
                });
              });
            });
          });
        });
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
