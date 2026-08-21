/* Targeted fix for the Automotive booking step. Does not modify Lawn & Property. */
(function(){
  'use strict';
  function el(id){ return document.getElementById(id); }
  function openAutomotive(serviceKey){
    var automotive=el('automotive'), booking=el('booking'), service=el('service');
    if(!automotive || !booking || !service) return;
    automotive.classList.add('open');
    booking.classList.add('open');
    service.value=serviceKey || service.value || '';
    var estimate=el('estimate'), review=el('review'), contact=el('contact');
    if(estimate) estimate.classList.remove('open');
    if(review) review.classList.remove('open');
    if(contact) contact.classList.remove('open');
    for(var i=1;i<=5;i++){ var p=el('p'+i); if(p) p.classList.toggle('active',i===2); }
    if(typeof window.updateSpecial==='function') window.updateSpecial();
    if(booking.scrollIntoView) booking.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function install(){
    if(!el('automotive') || !el('booking')) return;
    window.openAutomotiveBooking=openAutomotive;
    window.openBooking=function(key){ openAutomotive(key); };
    document.querySelectorAll('#automotive .service button').forEach(function(button){
      var attr=button.getAttribute('onclick')||'';
      var match=attr.match(/openBooking\(['\"]([^'\"]+)['\"]\)/);
      if(!match) return;
      button.type='button';
      button.addEventListener('click',function(e){
        e.preventDefault();
        e.stopImmediatePropagation();
        openAutomotive(match[1]);
      },true);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(install,50);});
  else setTimeout(install,50);
})();
