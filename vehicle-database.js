/* DASH vehicle database entrypoint.
   Loads customer-supplied vehicle data first, then the catalog/selector layer.
   The catalog must load BEFORE the expanded selector so the trim field exists
   when the expanded Year -> Make -> Model -> Trim -> Engine handlers initialize.
*/
(function(){
  'use strict';
  function load(src,done){
    var s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=done;
    s.onerror=function(){console.error('DASH vehicle database failed to load:',src);};
    document.head.appendChild(s);
  }
  function start(){
    load('./vehicle-customer-data.js?v=20260819a',function(){
      load('./vehicle-customer-data-1984.js?v=20260819d',function(){
        load('./vehicle-customer-data-1988.js?v=20260819e',function(){
          /* Create the trim selector and expose the local catalog first. */
          load('./vehicle-catalog.js?v=20260819j',function(){
            /* Then initialize the expanded year/make/model/trim/engine layer. */
            load('./vehicle-database-expanded.js?v=20260819j',function(){
              window.DASHVehicleDatabaseLoaded=true;
              load('./vehicle-service-policy.js?v=20260819b',function(){
                load('./vehicle-booking.js?v=20260819h',function(){
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
