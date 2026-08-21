/* Targeted Automotive booking fix. Lawn & Property is intentionally untouched. */
(function(){
  'use strict';
  function el(id){ return document.getElementById(id); }
  function getServiceKey(button){
    var attr=button && button.getAttribute('onclick') || '';
    var match=attr.match(/openBooking\(['\"]([^'\"]+)['\"]\)/);
    return match ? match[1] : '';
  }
  function openAutomotive(serviceKey){
    var automotive=el('automotive'), booking=el('booking'), service=el('service');
    if(!automotive || !booking || !service) return false;
    automotive.classList.add('open');
    booking.classList.add('open');
    if(serviceKey) service.value=serviceKey;
    var estimate=el('estimate'), review=el('review'), contact=el('contact');
    if(estimate) estimate.classList.remove('open');
    if(review) review.classList.remove('open');
    if(contact) contact.classList.remove('open');
    for(var i=1;i<=5;i++){ var p=el('p'+i); if(p) p.classList.toggle('active',i===2); }
    if(typeof window.updateSpecial==='function') window.updateSpecial();
    if(booking.scrollIntoView) booking.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }
  function intercept(e){
    var button=e.target && e.target.closest ? e.target.closest('#automotive .service button') : null;
    if(!button) return;
    var key=getServiceKey(button);
    if(!key) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    openAutomotive(key);
  }
  function install(){
    if(window.__dashAutomotiveBookingFixInstalled) return;
    window.__dashAutomotiveBookingFixInstalled=true;
    window.openAutomotiveBooking=openAutomotive;
    document.addEventListener('click',intercept,true);
    document.addEventListener('pointerup',function(e){
      var button=e.target && e.target.closest ? e.target.closest('#automotive .service button') : null;
      if(button) e.preventDefault();
    },true);
    /* Keep the fix alive if another script replaces window.openBooking. */
    setInterval(function(){
      if(typeof window.openBooking!=='function' || window.openBooking.__dashAutomotiveFix!==true){
        var fn=function(key){return openAutomotive(key);};
        fn.__dashAutomotiveFix=true;
        window.openBooking=fn;
      }
    },500);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install);
  else install();
})();
