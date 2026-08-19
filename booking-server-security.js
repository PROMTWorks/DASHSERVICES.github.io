/* DASH booking security client. Supabase is authoritative; this file never
   decides whether an address may bypass a stored proof requirement. */
(function(){
  'use strict';
  var ENDPOINT='https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/create-service-request';
  var SUPPORT_EMAIL='supportdashservices@gmail.com';
  var originalSubmit=null;
  var attached=false;

  function value(id){var e=document.getElementById(id);return e?String(e.value||'').trim():'';}
  function requestNumber(){
    var n=window.DASHServiceRequestNumber||sessionStorage.getItem('dashServerRequestNumber');
    if(!n){var d=new Date();n='DASH-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.floor(100000+Math.random()*900000);}
    sessionStorage.setItem('dashServerRequestNumber',n);return n;
  }
  function payload(){
    var s=document.getElementById('service');
    return {client_request_number:requestNumber(),service_key:value('service'),service_name:s&&s.options[s.selectedIndex]?s.options[s.selectedIndex].text:'Requested Service',street_address:value('locationStreet'),city:value('locationCity'),state:value('locationState'),postal_code:value('locationZip'),restriction_answer:value('addressRestrictions'),restriction_details:value('restrictionDetails'),preferred_date:value('date'),preferred_time:value('time'),first_name:value('firstName'),last_name:value('lastName'),phone:value('phone'),email:value('email')};
  }
  async function serverCreate(){
    var response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request:payload()})});
    var text=await response.text(),data;try{data=JSON.parse(text)}catch(e){data={message:text}};
    if(!response.ok)throw new Error((data&&data.message)||'The server rejected this service request.');return data;
  }
  function status(message,warning){var parent=document.getElementById('restrictionProofSection')||document.getElementById('booking');if(!parent)return;var n=document.getElementById('serverRestrictionStatus');if(!n){n=document.createElement('div');n.id='serverRestrictionStatus';n.className='note '+(warning?'warning':'');parent.appendChild(n)}n.innerHTML=message;}
  function emailProof(result){
    var p=payload(),subject=encodeURIComponent('Proof of Service Location Allowed, Service Request #'+result.request_number),body=encodeURIComponent('DASH Services - Proof of Service Location Allowed\n\nService Request #: '+result.request_number+'\nService: '+p.service_name+'\n\nService Location:\n'+p.street_address+'\n'+p.city+', '+p.state+' '+p.postal_code+'\n\nPlease attach the documentation/proof showing that DASH Services is permitted to complete the requested service at this location.');
    window.location.href='mailto:'+SUPPORT_EMAIL+'?subject='+subject+'&body='+body;
  }
  async function proofButton(){
    if(value('addressRestrictions')!=='yes'&&value('addressRestrictions')!=='unsure')return;
    try{var result=await serverCreate();sessionStorage.setItem('dashServerRequestNumber',result.request_number);window.DASHServiceRequestNumber=result.request_number;status('<strong>Server-side proof requirement active.</strong> Service Request #'+result.request_number+' is recorded as <strong>'+result.request_status+'</strong>. Proof must be reviewed by DASH before service is approved.',true);emailProof(result)}catch(e){alert(e.message)}
  }
  function attach(){
    var b=document.getElementById('emailRestrictionProof');if(b&&!b.__dashServerBound){b.onclick=proofButton;b.__dashServerBound=true;attached=true}
    originalSubmit=window.submitRequest;
    if(typeof originalSubmit==='function'&&!originalSubmit.__dashServerWrapped){
      var fn=originalSubmit;
      window.submitRequest=async function(){
        try{var result=await serverCreate();sessionStorage.setItem('dashServerRequestNumber',result.request_number);window.DASHServiceRequestNumber=result.request_number;
          if(result.request_status==='pending_proof'){status('<strong>Request recorded, but not approved.</strong> Service Request #'+result.request_number+' is waiting for proof/authorization to be emailed to <strong>'+SUPPORT_EMAIL+'</strong> and reviewed by DASH. A new request for this address cannot bypass this requirement by selecting No.',true);alert('This service location requires proof/authorization. Use the Email Proof button and wait for DASH to review the documentation.');var proof=document.getElementById('restrictionProofSection');if(proof)proof.classList.remove('hidden');return;}
          status('<strong>Server validation passed.</strong> Service Request #'+result.request_number+' was accepted by the booking security layer.');return fn.apply(this,arguments);
        }catch(e){alert(e.message);return}
      };window.submitRequest.__dashServerWrapped=true;
    }
    var r=document.getElementById('addressRestrictions');if(r&&!r.__dashServerBound){r.addEventListener('change',function(){attached=false;setTimeout(attach,50);if(value('addressRestrictions')==='yes'||value('addressRestrictions')==='unsure')status('<strong>Server-side enforcement:</strong> Yes/Unsure requires proof. The requirement is stored against the service location in Supabase and a new request cannot bypass it by selecting No.',true)});r.__dashServerBound=true}
  }
  function boot(){attach();if(!attached)setTimeout(boot,250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();