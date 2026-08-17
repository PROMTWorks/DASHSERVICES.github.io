/* DASH vehicle database entrypoint.
   The legacy integration is preserved separately; this entrypoint loads it and
   the robust public booking selector for pages that use the shared vehicle fields.
*/
(function(){
  function load(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }
  load('vehicle-database-legacy.js')
    .catch(function(){})
    .finally(function(){ return load('vehicle-booking.js').catch(function(){}); });
})();