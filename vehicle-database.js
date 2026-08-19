/* DASH vehicle database entrypoint.
   Loads vehicle data/catalogs and installs the shared service-location
   authorization workflow used by every booking service.
*/
(function(){
  'use strict';
  function load(src,done){var s=document.createElement('script');s.src=src;s.async=false;s.onload=done;s.onerror=function(){console.error('DASH vehicle database failed to load:',src);};document.head.appendChild(s);}
  function makeRequestNumber(){var now=new Date();var stamp=now.getFullYear().toString()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0');return 'DASH-'+stamp+'-'+Math.floor(1000+Math.random()*9000);}
  function normalizeAddress(){return ['locationStreet','locationCity','locationState','locationZip'].map(function(id){var el=document.getElementById(id);return el&&el.value?el.value.trim().toLowerCase().replace(/[^a-z0-9]/g,''):'';}).join('|');}
  function getRestrictedAddresses(){try{return JSON.parse(localStorage.getItem('dashRestrictedServiceAddresses')||'{}')||{};}catch(e){return {};}}
  function saveRestrictedAddress(addressKey,requestNumber){if(!addressKey)return;var records=getRestrictedAddresses();records[addressKey]={status:'proof-required',requestNumber:requestNumber,createdAt:new Date().toISOString()};try{localStorage.setItem('dashRestrictedServiceAddresses',JSON.stringify(records));}catch(e){console.warn('DASH could not save address restriction record.',e);}}

  function installServiceLocationRules(){
    var email='supportdashservices@gmail.com',restrictions=document.getElementById('addressRestrictions'),proofSection=document.getElementById('restrictionProofSection');if(!restrictions)return;
    var requestNumber=makeRequestNumber();window.DASHServiceRequestNumber=requestNumber;restrictions.setAttribute('required','required');
    if(proofSection){
      var oldFile=document.getElementById('restrictionProof');if(oldFile)oldFile.remove();
      var oldLabel=proofSection.querySelector('label[for="restrictionProof"]');if(oldLabel)oldLabel.remove();
      var note=proofSection.querySelector('.note');if(note)note.innerHTML='<strong>Proof Required:</strong> Because you selected Yes or Unsure, you must provide documentation showing that the service location has no applicable restrictions and that DASH Services is permitted to complete the requested service at this address. <strong>Email the proof to '+email+'</strong> before DASH can approve the service request.';
      var oldEmailBox=document.getElementById('restrictionProofEmail');if(oldEmailBox)oldEmailBox.remove();
      var wrap=document.createElement('div');wrap.className='field full';wrap.id='restrictionProofEmail';wrap.style.marginTop='10px';
      wrap.innerHTML='<label>Proof Submission <span class="required">*</span></label><div class="note"><strong>Service Request #:</strong> '+requestNumber+'<br><strong>Email proof to:</strong> <a href="mailto:'+email+'" style="color:#c62828;font-weight:800">'+email+'</a><br>Click the button below to open your email. The recipient, required subject, request number, service, and service address are filled in automatically. Attach your proof/authorization before sending.</div><button type="button" class="continue" id="emailRestrictionProof">Email Proof of Service Location Allowed</button><label class="contact-check" style="margin-top:10px"><input type="checkbox" id="restrictionProofEmailed"><span>I confirm that I have emailed the required proof/authorization to DASH Services at '+email+'. <span class="required">*</span></span></label>';
      proofSection.appendChild(wrap);
      var proofButton=document.getElementById('emailRestrictionProof');
      if(proofButton)proofButton.addEventListener('click',function(){var subject='Proof of Service Location Allowed - '+requestNumber;var body='Service Request #: '+requestNumber+'\nService: '+(document.getElementById('service')?.selectedOptions?.[0]?.text||'')+'\nService Location: '+['locationStreet','locationCity','locationState','locationZip'].map(function(id){return document.getElementById(id)?.value||'';}).join(', ')+'\n\nI am providing proof/authorization that DASH Services is permitted to complete service at this address.\n\nPlease attach the proof/authorization to this email before sending.';window.location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);});
    }
    function updateAddressRestrictionState(){var key=normalizeAddress(),records=getRestrictedAddresses(),locked=!!key&&!!records[key]&&records[key].status==='proof-required',noOption=Array.prototype.find.call(restrictions.options,function(o){return o.value==='no';});if(noOption)noOption.disabled=locked;if(locked&&restrictions.value==='no'){restrictions.value='unsure';alert('This service address previously triggered a Yes/Unsure restriction review. You cannot change this address to No to bypass the required proof. Please provide the required proof/authorization for this address.');}return locked;}
    function updateProofVisibility(){var choice=restrictions.value,locked=updateAddressRestrictionState();if(locked&&choice==='no')choice='unsure';if(proofSection)proofSection.classList.toggle('hidden',choice!=='yes'&&choice!=='unsure');}
    function validateServiceLocation(){
      var ids=['locationStreet','locationCity','locationState','locationZip'];for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(!el||!el.value.trim()){alert('Please enter the complete service location address, including street address, city, state, and ZIP code.');if(el)el.focus();return false;}}
      var addressKey=normalizeAddress(),records=getRestrictedAddresses(),locked=!!records[addressKey]&&records[addressKey].status==='proof-required',choice=restrictions.value;
      if(locked&&choice==='no'){restrictions.value='unsure';updateProofVisibility();alert('This address requires proof based on a previous Yes/Unsure restriction response. A new service request cannot be used to bypass that requirement.');return false;}
      if(!choice){alert('Please answer the service-location restrictions question by selecting Yes, No, or Unsure.');restrictions.focus();return false;}
      if(choice==='yes'||choice==='unsure'){saveRestrictedAddress(addressKey,requestNumber);var details=document.getElementById('restrictionDetails'),confirmed=document.getElementById('restrictionProofEmailed');if(!details||!details.value.trim()){alert('Please explain the restriction or why you are unsure.');if(details)details.focus();return false;}if(!confirmed||!confirmed.checked){alert('Please click Email Proof of Service Location Allowed, send the required proof/authorization to '+email+', and confirm that you sent it before continuing.');if(confirmed)confirmed.focus();return false;}}
      return true;
    }
    ['locationStreet','locationCity','locationState','locationZip'].forEach(function(id){var el=document.getElementById(id);if(el)el.addEventListener('input',updateAddressRestrictionState);});
    restrictions.addEventListener('change',function(){var key=normalizeAddress();if(restrictions.value==='yes'||restrictions.value==='unsure')saveRestrictedAddress(key,requestNumber);updateProofVisibility();});updateProofVisibility();
    var originalCalculate=window.calculateEstimate;if(typeof originalCalculate==='function'&&!originalCalculate.__dashAddressWrapped){function wrappedCalculate(){if(!validateServiceLocation())return;return originalCalculate.apply(this,arguments);}wrappedCalculate.__dashAddressWrapped=true;window.calculateEstimate=wrappedCalculate;}
    var originalReview=window.reviewBooking;if(typeof originalReview==='function'&&!originalReview.__dashAddressWrapped){function wrappedReview(){if(!validateServiceLocation())return;return originalReview.apply(this,arguments);}wrappedReview.__dashAddressWrapped=true;window.reviewBooking=wrappedReview;}
  }

  function installVehicleSelectorWatchdog(){
    var year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
    if(!year||!make||!model||!engine||!trim)return;
    function repair(){
      if(year.value){year.dispatchEvent(new Event('change',{bubbles:true}));}
      make.style.display='';model.style.display='';engine.style.display='';trim.style.display='';
      make.removeAttribute('aria-hidden');model.removeAttribute('aria-hidden');engine.removeAttribute('aria-hidden');trim.removeAttribute('aria-hidden');
    }
    document.addEventListener('dash:vehicle-database-ready',function(){setTimeout(repair,50);});
    setTimeout(repair,250);
    setTimeout(repair,1000);
    setTimeout(repair,2500);
  }

  function installFinalVehicleSelector(){
    var year=document.getElementById('year'),make=document.getElementById('make'),model=document.getElementById('model'),engine=document.getElementById('engine'),trim=document.getElementById('trim');
    if(!year||!make||!model||!engine||!trim)return false;
    var MAKES=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
    function fill(sel,label,values,disabled){sel.innerHTML='';sel.appendChild(new Option(label,''));(values||[]).filter(Boolean).map(String).filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a.localeCompare(b);}).forEach(function(v){sel.appendChild(new Option(v,v));});sel.disabled=!!disabled;sel.hidden=false;sel.style.display='';sel.removeAttribute('aria-hidden');}
    function models(makeValue,yearValue){return fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/'+encodeURIComponent(makeValue)+'/modelyear/'+encodeURIComponent(yearValue)+'?format=json',{cache:'no-store'}).then(function(r){return r.ok?r.json():Promise.reject(new Error('lookup'));}).then(function(d){return(d.Results||[]).map(function(x){return x.Model_Name||x.ModelName;}).filter(Boolean);}).catch(function(){return[];});}
    // Rebuild the controls and use event listeners in capture phase so legacy handlers cannot block them.
    fill(make,'Select make',[],true);fill(model,'Select model',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);
    year.addEventListener('change',function(){if(!year.value){fill(make,'Select make',[],true);fill(model,'Select model',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);return;}fill(make,'Select make',MAKES,false);fill(model,'Select model',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);},true);
    make.addEventListener('change',function(){var y=year.value,m=make.value;if(!y||!m)return;fill(model,'Loading models...',[],true);fill(engine,'Select engine',[],true);fill(trim,'Select trim',[],true);models(m,y).then(function(list){if(year.value!==y||make.value!==m)return;fill(model,list.length?'Select model':'Select model / manual entry',list,false);model.appendChild(new Option('Manual model entry','__manual__'));});setTimeout(function(){if(year.value===y&&make.value===m&&model.disabled){fill(model,'Select model / manual entry',[],false);model.appendChild(new Option('Manual model entry','__manual__'));}},1000);},true);
    model.addEventListener('change',function(){if(!model.value)return;fill(engine,'Select engine / manual entry',[],false);engine.appendChild(new Option('Manual engine entry','__manual__'));fill(trim,'Select trim / manual entry',[],false);trim.appendChild(new Option('Manual trim entry','__manual__'));},true);
    if(year.value)year.dispatchEvent(new Event('change',{bubbles:true}));
    var keep=function(){[make,model,engine,trim].forEach(function(x){x.hidden=false;x.style.display='';x.removeAttribute('aria-hidden');});if(year.value&&make.options.length<=1)fill(make,'Select make',MAKES,false);};
    setInterval(keep,300);
    return true;
  }

  function start(){load('./vehicle-customer-data.js?v=20260819a',function(){load('./vehicle-customer-data-1984.js?v=20260819d',function(){load('./vehicle-customer-data-1988.js?v=20260819e',function(){load('./vehicle-catalog.js?v=20260819p',function(){load('./vehicle-database-expanded.js?v=20260819p',function(){load('./vehicle-engine-fix.js?v=20260819p',function(){load('./booking-server-security.js?v=20260819b',function(){window.DASHVehicleDatabaseLoaded=true;document.dispatchEvent(new CustomEvent('dash:vehicle-database-ready'));installServiceLocationRules();installVehicleSelectorWatchdog();setTimeout(installFinalVehicleSelector,50);setTimeout(installFinalVehicleSelector,500);setTimeout(installFinalVehicleSelector,1500);});});});});});});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
