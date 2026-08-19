/* DASH Services vehicle-service eligibility notices. */
(function(){
  'use strict';
  function addPolicyNotice(){
    var booking=document.getElementById('booking');
    if(!booking || document.getElementById('dashVehiclePolicyNotice')) return;
    var note=document.createElement('div');
    note.id='dashVehiclePolicyNotice';
    note.className='note notice';
    note.innerHTML='<strong>Vehicle Service Review:</strong> All vehicle submissions are reviewed by DASH Services to ensure the vehicle and requested service meet DASH Services rules and service capabilities. If a customer submits a vehicle or service request that DASH Services does not service, the request may be denied and the customer will receive an email notifying them of the service denial.<br><br><strong>RV &amp; School Bus Conversions:</strong> All RVs, motorhomes, personal school bus RV conversions, and similar specialty vehicles must be called in to DASH Services before submitting a service request. These vehicles require individual review, and DASH Services may approve or deny the request. Calling in does not guarantee that service will be provided.';
    var intro=booking.querySelector('#description');
    if(intro && intro.parentNode) intro.parentNode.insertBefore(note,intro.nextSibling);
    else booking.insertBefore(note,booking.firstChild);
  }
  function start(){
    addPolicyNotice();
    setTimeout(addPolicyNotice,250);
    setTimeout(addPolicyNotice,1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
