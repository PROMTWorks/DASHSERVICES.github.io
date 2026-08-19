/* DASH vehicle database entrypoint.
   Loads customer-supplied vehicle data first, then the catalog/selector layer.
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

  function installServiceLocationRules(){
    var email='davidroyemployment@gmail.com';
    var restrictions=document.getElementById('addressRestrictions');
    var proofSection=document.getElementById('restrictionProofSection');
    if(!restrictions)return;

    /* The booking page uses one shared booking form for every service, so these
       rules automatically apply to every automotive service in the list. */
    restrictions.setAttribute('required','required');

    if(proofSection){
      var file=document.getElementById('restrictionProof');
      if(file)file.remove();

      var oldLabel=proofSection.querySelector('label[for="restrictionProof"]');
      if(oldLabel)oldLabel.remove();

      var note=proofSection.querySelector('.note');
      if(note){
        note.innerHTML='<strong>Proof Required:</strong> Because you selected Yes or Unsure, you must provide documentation showing that the service address has no applicable restrictions and that DASH Services is permitted to complete the requested service at this address. <strong>Email the proof to '+email+'</strong> before DASH can approve the service request.';
      }

      if(!document.getElementById('restrictionProofEmail')){
        var wrap=document.createElement('div');
        wrap.className='field full';
        wrap.style.marginTop='10px';
        wrap.innerHTML='<label>Proof Submission <span class="required">*</span></label>'+
          '<div class="note"><strong>Email your proof to:</strong> <a href="mailto:'+email+'?subject=DASH%20Service%20Address%20Proof" style="color:#c62828;font-weight:800">'+email+'</a><br>Attach the authorization/documentation to your email. Include the service address and customer name in the email so DASH can match the proof to the booking.</div>'+
          '<button type="button" class="continue" id="emailRestrictionProof">Email Proof to DASH Services</button>'+
          '<label class="contact-check" style="margin-top:10px"><input type="checkbox" id="restrictionProofEmailed"><span>I confirm that I have emailed the required proof/authorization to DASH Services at '+email+'. <span class="required">*</span></span></label>';
        proofSection.appendChild(wrap);

        document.getElementById('emailRestrictionProof').addEventListener('click',function(){
          var street=(document.getElementById('locationStreet')||{}).value||'';
          var city=(document.getElementById('locationCity')||{}).value||'';
          var state=(document.getElementById('locationState')||{}).value||'';
          var zip=(document.getElementById('locationZip')||{}).value||'';
          var subject=encodeURIComponent('DASH Service Address Proof');
          var body=encodeURIComponent('DASH Service Address Proof\n\nService address:\n'+street+'\n'+city+', '+state+' '+zip+'\n\nPlease attach the required authorization/proof showing that DASH Services is permitted to complete the requested service at this address.');
          window.location.href='mailto:'+email+'?subject='+subject+'&body='+body;
        });
      }
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
        alert('Please answer the service-address restrictions question by selecting Yes, No, or Unsure.');
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
          alert('Please email the required proof/authorization to '+email+' and confirm that you have emailed it before continuing.');
          if(confirmed)confirmed.focus();
          return false;
        }
      }
      return true;
    }

    /* Run before the existing estimate/review flow. */
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