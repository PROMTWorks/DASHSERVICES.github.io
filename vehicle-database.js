/* DASH vehicle database entrypoint.
   Loads vehicle data/catalogs and installs the shared service-location
   authorization workflow used by every booking service.
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

  function makeRequestNumber(){
    var now=new Date();
    var stamp=now.getFullYear().toString()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');
    var random=Math.floor(1000+Math.random()*9000);
    return 'DASH-'+stamp+'-'+random;
  }

  function normalizeAddress(){
    var ids=['locationStreet','locationCity','locationState','locationZip'];
    return ids.map(function(id){
      var el=document.getElementById(id);
      return el&&el.value?el.value.trim().toLowerCase().replace(/[^a-z0-9]/g,''):'';
    }).join('|');
  }

  function getRestrictedAddresses(){
    try{return JSON.parse(localStorage.getItem('dashRestrictedServiceAddresses')||'{}')||{};}catch(e){return {};}
  }

  function saveRestrictedAddress(addressKey,requestNumber){
    if(!addressKey)return;
    var records=getRestrictedAddresses();
    records[addressKey]={status:'proof-required',requestNumber:requestNumber,createdAt:new Date().toISOString()};
    try{localStorage.setItem('dashRestrictedServiceAddresses',JSON.stringify(records));}catch(e){console.warn('DASH could not save address restriction record.',e);}
  }

  function installServiceLocationRules(){
    var email='supportdashservices@gmail.com';
    var restrictions=document.getElementById('addressRestrictions');
    var proofSection=document.getElementById('restrictionProofSection');
    if(!restrictions)return;

    var requestNumber=makeRequestNumber();
    window.DASHServiceRequestNumber=requestNumber;
    restrictions.setAttribute('required','required');

    if(proofSection){
      var oldFile=document.getElementById('restrictionProof');
      if(oldFile)oldFile.remove();
      var oldLabel=proofSection.querySelector('label[for="restrictionProof"]');
      if(oldLabel)oldLabel.remove();

      var note=proofSection.querySelector('.note');
      if(note){
        note.innerHTML='<strong>Proof Required:</strong> Because you selected Yes or Unsure, you must provide documentation showing that the service location has no applicable restrictions and that DASH Services is permitted to complete the requested service at this address. <strong>Email the proof to '+email+'</strong> before DASH can approve the service request.';
      }

      var oldEmailBox=document.getElementById('restrictionProofEmail');
      if(oldEmailBox)oldEmailBox.remove();

      var wrap=document.createElement('div');
      wrap.className='field full';
      wrap.id='restrictionProofEmail';
      wrap.style.marginTop='10px';
      wrap.innerHTML='<label>Proof Submission <span class="required">*</span></label>'+
        '<div class="note"><strong>Service Request #:</strong> '+requestNumber+'<br><strong>Email proof to:</strong> <a href="mailto:'+email+'" style="color:#c62828;font-weight:800">'+email+'</a><br>Click the button below to open your email. The recipient, required subject, request number, service, and service address are filled in automatically. Attach your proof/authorization before sending.</div>'+
        '<button type="button" class="continue" id="emailRestrictionProof">Email Proof of Service Location Allowed</button>'+
        '<label class="contact-check" style="margin-top:10px"><input type="checkbox" id="restrictionProofEmailed"><span>I confirm that I have emailed the required proof/authorization to DASH Services at '+email+'. <span class="required">*</span></span></label>';
      proofSection.appendChild(wrap);

      document.getElementById('emailRestrictionProof').addEventListener('click',function(){
        var street=(document.getElementById('locationStreet')||{}).value||'';
        var city=(document.getElementById('locationCity')||{}).value||'';
        var state=(document.getElementById('locationState')||{}).value||'';
        var zip=(document.getElementById('locationZip')||{}).value||'';
        var serviceEl=document.getElementById('service');
        var serviceName=serviceEl&&serviceEl.options[serviceEl.selectedIndex]?serviceEl.options[serviceEl.selectedIndex].text:'Requested Service';
        var subject=encodeURIComponent('Proof of Service Location Allowed, Service Request #'+requestNumber);
        var body=encodeURIComponent('DASH Services - Proof of Service Location Allowed\n\nService Request #: '+requestNumber+'\nService: '+serviceName+'\n\nService Location:\n'+street+'\n'+city+', '+state+' '+zip+'\n\nPlease attach the documentation/proof showing that DASH Services is permitted to complete the requested service at this location.');
        window.location.href='mailto:'+email+'?subject='+subject+'&body='+body;
      });
    }

    function updateAddressRestrictionState(){
      var key=normalizeAddress();
      var records=getRestrictedAddresses();
      var locked=!!key && !!records[key] && records[key].status==='proof-required';
      var noOption=Array.prototype.find.call(restrictions.options,function(o){return o.value==='no';});
      if(noOption)noOption.disabled=locked;
      if(locked && restrictions.value==='no'){
        restrictions.value='unsure';
        alert('This service address previously triggered a Yes/Unsure restriction review. You cannot change this address to No to bypass the required proof. Please provide the required proof/authorization for this address.');
      }
      return locked;
    }

    function updateProofVisibility(){
      var choice=restrictions.value;
      var locked=updateAddressRestrictionState();
      if(locked && choice==='no')choice='unsure';
      if(proofSection)proofSection.classList.toggle('hidden',choice!=='yes' && choice!=='unsure');
    }

    function validateServiceLocation(){
      var ids=['locationStreet','locationCity','locationState','locationZip'];
      for(var i=0;i<ids.length;i++){
        var el=document.getElementById(ids[i]);
        if(!el || !el.value.trim()){
          alert('Please enter the complete service location address, including street address, city, state, and ZIP code.');
          if(el)el.focus();
          return false;
        }
      }
      var addressKey=normalizeAddress();
      var records=getRestrictedAddresses();
      var locked=!!records[addressKey] && records[addressKey].status==='proof-required';
      var choice=restrictions.value;
      if(locked && choice==='no'){
        restrictions.value='unsure';
        updateProofVisibility();
        alert('This address requires proof based on a previous Yes/Unsure restriction response. A new service request cannot be used to bypass that requirement.');
        return false;
      }
      if(!choice){alert('Please answer the service-location restrictions question by selecting Yes, No, or Unsure.');restrictions.focus();return false;}
      if(choice==='yes' || choice==='unsure'){
        saveRestrictedAddress(addressKey,requestNumber);
        var details=document.getElementById('restrictionDetails');
        var confirmed=document.getElementById('restrictionProofEmailed');
        if(!details || !details.value.trim()){alert('Please explain the restriction or why you are unsure.');if(details)details.focus();return false;}
        if(!confirmed || !confirmed.checked){alert('Please click Email Proof of Service Location Allowed, send the required proof/authorization to '+email+', and confirm that you sent it before continuing.');if(confirmed)confirmed.focus();return false;}
      }
      return true;
    }

    ['locationStreet','locationCity','locationState','locationZip'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',updateAddressRestrictionState);});
    restrictions.addEventListener('change',function(){var key=normalizeAddress();if(restrictions.value==='yes'||restrictions.value==='unsure')saveRestrictedAddress(key,requestNumber);updateProofVisibility();});
    updateProofVisibility();

    var originalCalculate=window.calculateEstimate;
    if(typeof originalCalculate==='function'&&!originalCalculate.__dashAddressWrapped){
      function wrappedCalculate(){if(!validateServiceLocation())return;return originalCalculate.apply(this,arguments);}
      wrappedCalculate.__dashAddressWrapped=true;window.calculateEstimate=wrappedCalculate;
    }
    var originalReview=window.reviewBooking;
    if(typeof originalReview==='function'&&!originalReview.__dashAddressWrapped){
      function wrappedReview(){if(!validateServiceLocation())return;return originalReview.apply(this,arguments);}
      wrappedReview.__dashAddressWrapped=true;window.reviewBooking=wrappedReview;
    }
  }

  function start(){
    load('./vehicle-customer-data.js?v=20260819a',function(){
      load('./vehicle-customer-data-1984.js?v=20260819d',function(){
        load('./vehicle-customer-data-1988.js?v=20260819e',function(){
          load('./vehicle-catalog.js?v=20260819p',function(){
            load('./vehicle-database-expanded.js?v=20260819p',function(){
              load('./vehicle-engine-fix.js?v=20260819p',function(){
                load('./booking-server-security.js?v=20260819a',function(){
                  window.DASHVehicleDatabaseLoaded=true;
                  document.dispatchEvent(new CustomEvent('dash:vehicle-database-ready'));
                  installServiceLocationRules();
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