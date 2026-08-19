/* DASH customer booking persistence bridge.
   Intentionally separate from vehicle selector logic. */
(function(){
  'use strict';
  var ENDPOINT='https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/create-service-request';
  function v(id){var e=document.getElementById(id);return e?String(e.value||'').trim():'';}
  function checked(){return Array.from(document.querySelectorAll('input[name="specialChoice"]:checked')).map(function(x){return x.value;});}
  function requestNumber(){
    var n=window.DASHServiceRequestNumber||sessionStorage.getItem('dashServerRequestNumber');
    if(!n){var d=new Date();n='DASH-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.floor(100000+Math.random()*900000);}
    sessionStorage.setItem('dashServerRequestNumber',n);window.DASHServiceRequestNumber=n;return n;
  }
  function buildRequest(){
    var s=document.getElementById('service');
    return {
      client_request_number:requestNumber(),service_key:v('service'),service_name:s&&s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'Requested Service',
      vehicle_year:v('year'),vehicle_make:v('make'),vehicle_model:v('model'),vehicle_engine:v('engine'),vehicle_trim:v('trim'),
      preferred_date:v('date'),preferred_time:v('time'),street_address:v('locationStreet'),city:v('locationCity'),state:v('locationState').toUpperCase(),postal_code:v('locationZip'),
      restriction_answer:v('addressRestrictions'),restriction_details:v('restrictionDetails'),customer_notes:v('notes'),special_options:checked(),
      estimated_labor:(document.getElementById('laborPrice')||{}).textContent||'',estimated_parts:(document.getElementById('partsPrice')||{}).textContent||'',estimated_total:(document.getElementById('totalPrice')||{}).textContent||'',
      first_name:v('firstName'),last_name:v('lastName'),phone:v('phone'),email:v('email'),contact_preference:v('contactPreference'),consent:!!(document.getElementById('consent')&&document.getElementById('consent').checked)
    };
  }
  async function persist(){var response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request:buildRequest()})});var text=await response.text(),data;try{data=JSON.parse(text);}catch(e){data={message:text};}if(!response.ok)throw new Error((data&&data.message)||'DASH could not save the service request.');return data;}
  function attach(){if(typeof window.submitRequest!=='function'||window.submitRequest.__dashPersistenceWrapped)return false;window.submitRequest=async function(){var result;try{result=await persist();}catch(e){alert(e.message);return false;}if(result&&result.request_number){sessionStorage.setItem('dashServerRequestNumber',result.request_number);window.DASHServiceRequestNumber=result.request_number;}if(result&&result.request_status==='pending_proof'){var section=document.getElementById('restrictionProofSection');if(section)section.classList.remove('hidden');alert('Your service request has been submitted as '+(result.request_number||'a DASH request')+'. This location requires proof/authorization before approval.');return false;}alert('Your service request has been submitted successfully'+(result&&result.request_number?' as '+result.request_number:'')+'. DASH will review the request and send the appropriate confirmation email.');return false;};window.submitRequest.__dashPersistenceWrapped=true;return true;}
  function boot(){if(!attach())setTimeout(boot,100);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
/* v1 trigger */
