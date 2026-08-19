/* DASH vehicle database entrypoint.
   Loads customer-supplied vehicle data first, then the catalog/selector layer.
   Also installs the shared service-location authorization workflow used by
   every service booking on the shared booking form.
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
    var existing=sessionStorage.getItem('dashServiceRequestNumber');
    if(existing)return existing;
    var now=new Date();
    var stamp=now.getFullYear().toString()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');
    var random=Math.floor(1000+Math.random()*9000);
    var id='DASH-'+stamp+'-'+random;
    sessionStorage.setItem('dashServiceRequestNumber',id);
    return id;
  }

  function installServiceLocationRules(){
    var email='supportdashservices@gmail.com';
    var restrictions=document.getElementById('addressRestrictions');
    var proofSection=document.getElementById('restrictionProofSection');
    if(!restrictions)return;

    var requestNumber=makeRequestNumber();
    restrictions.setAttribute('required','required');

    /* Shared booking requirement: applies to automotive and non-automotive
       services that use the site's booking form. */
    if(proofSection){
      var file=document.getElementById('restrictionProof');
      if(file)file.remove();
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
        '<div class="note"><strong>Service Request #:</strong> '+requestNumber+'<br><strong>Email proof to:</strong> <a href="mailto:'+email+'" style="color:#c62828;font-weight:800">'+email+'</a><br>Use the button below to open your email with the required subject line and service request number already filled in. Attach your proof/authorization to the email before sending it.</div>'+
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

      var choice=restrictions.value;
      if(!choice){
        alert('Please answer the service-location restrictions question by selecting Yes, No, or Unsure.');
        restrictions.focus();
        return false;
      }

      if(choice==='yes' || choice==='unsure'){
        var details=document.getElementById('restrictionDetails');
        var confirmed=document.getElementById('restrictionProofEmailed');
        if(!details || !details.value.trim()){
          alert('Please explain the restriction or why you are unsure.');
          if(details)details.focus();
          return false;
        }
        if(!confirmed || !confirmed.checked){
          alert('Please email the required proof/authorization using the Email Proof of Service Location Allowed button and confirm that you have sent it before continuing.');
          if(confirmed)confirmed.focus();
          return false;
        }
      }
      return true;
    }

    var originalCalculate=window.calculateEstimate;
    if(typeof originalCalculate==='function' && !originalCalculate.__dashAddressWrapped){
      function wrappedCalculate(){
        if(!validateServiceLocation())return;
        return originalCalculate.apply(this,arguments);
      }
      wrappedCalculate.__dashAddressWrapped=true;
      window.calculateEstimate=wrappedCalculate;
    }

    var originalReview=window.reviewBooking;
    if(typeof originalReview==='function' && !originalReview.__dashAddressWrapped){
      function wrappedReview(){
        if(!validateServiceLocation())return;
        return originalReview.apply(this,arguments);
      }
      wrappedReview.__dashAddressWrapped=true;
      window.reviewBooking=wrappedReview;
    }

    function updateProofVisibility(){
      var choice=restrictions.value;
      if(proofSection)proofSection.classList.toggle('hidden',choice!=='yes' && choice!=='unsure');
    }
    restrictions.addEventListener('change',updateProofVisibility);
    updateProofVisibility();
  }

  function start(){
    load('./vehicle-customer-data.js?v=20260819a',function(){
      load('./vehicle-customer-data-1984.js?v=20260819d',function(){
        load('./vehicle-customer-data-1988.js?v=20260819e',function(){
          load('./vehicle-catalog.js?v=20260819p',function(){
            load('./vehicle-database-expanded.js?v=20260819p',function(){
              load('./vehicle-engine-fix.js?v=20260819p',function(){
                window.DASHVehicleDatabaseLoaded=true;
                document.dispatchEvent(new CustomEvent('dash:vehicle-database-ready'));
                installServiceLocationRules();
              });
            });
          });
        });
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();