/* DASH booking runtime: broad local vehicle database + service-location authorization. */
(function(){
'use strict';
function load(src,done){var s=document.createElement('script');s.src=src;s.async=false;s.onload=done;s.onerror=function(){console.error('DASH script failed:',src);done&&done()};document.head.appendChild(s)}
function req(){var d=new Date();return 'DASH-'+d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')+'-'+Math.floor(1000+Math.random()*9000)}
function key(){return ['locationStreet','locationCity','locationState','locationZip'].map(function(id){var e=document.getElementById(id);return e&&e.value?e.value.trim().toLowerCase().replace(/[^a-z0-9]/g,''):''}).join('|')}
function restrictions(){var r=document.getElementById('addressRestrictions'),p=document.getElementById('restrictionProofSection');if(!r)return;var email='supportdashservices@gmail.com',number=req();window.DASHServiceRequestNumber=number;
function records(){try{return JSON.parse(localStorage.getItem('dashRestrictedServiceAddresses')||'{}')||{}}catch(e){return {}}}
function lock(){var k=key(),x=records(),o=Array.prototype.find.call(r.options,function(a){return a.value==='no'});if(o)o.disabled=!!k&&!!x[k]&&x[k].status==='proof-required';if(o&&o.disabled&&r.value==='no'){r.value='unsure';alert('This service address previously triggered a Yes/Unsure restriction review. You cannot select No to bypass the required proof.')}}
function proof(){if(!p)return;var old=document.getElementById('restrictionProofEmail');if(old)old.remove();var wrap=document.createElement('div');wrap.id='restrictionProofEmail';wrap.className='field full';wrap.style.marginTop='10px';wrap.innerHTML='<label>Proof Submission <span class="required">*</span></label><div class="note"><strong>Service Request #:</strong> '+number+'<br><strong>Email proof to:</strong> <a href="mailto:'+email+'">'+email+'</a><br>The button opens an email with the required recipient and subject. Attach your proof before sending.</div><button type="button" class="continue" id="emailRestrictionProof">Email Proof of Service Location Allowed</button><label class="contact-check"><input type="checkbox" id="restrictionProofEmailed"><span>I confirm I emailed the required proof to '+email+'. <span class="required">*</span></span></label>';p.appendChild(wrap);document.getElementById('emailRestrictionProof').onclick=function(){var subject='Proof of Service Location Allowed - '+number,body='Service Request #: '+number+'\nService: '+(document.getElementById('service')?.selectedOptions?.[0]?.text||'')+'\nService Location: '+['locationStreet','locationCity','locationState','locationZip'].map(function(id){return document.getElementById(id)?.value||''}).join(', ')+'\n\nProof/authorization that DASH Services is permitted to complete service at this address is attached.';location.href='mailto:'+email+'?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body)}}
function validate(){var ids=['locationStreet','locationCity','locationState','locationZip'];for(var i=0;i<ids.length;i++){var e=document.getElementById(ids[i]);if(!e||!e.value.trim()){alert('Please enter the complete service location address, including street address, city, state, and ZIP code.');if(e)e.focus();return false}}var c=r.value,k=key(),x=records();if(k&&x[k]&&x[k].status==='proof-required'&&c==='no'){r.value='unsure';alert('This address requires proof based on a previous Yes/Unsure response. A new service request cannot bypass that requirement.');return false}if(!c){alert('Please answer the service-location restrictions question with Yes, No, or Unsure.');r.focus();return false}if(c==='yes'||c==='unsure'){x[k]={status:'proof-required',requestNumber:number,createdAt:new Date().toISOString()};localStorage.setItem('dashRestrictedServiceAddresses',JSON.stringify(x));var d=document.getElementById('restrictionDetails'),q=document.getElementById('restrictionProofEmailed');if(!d||!d.value.trim()){alert('Please explain the restriction or why you are unsure.');if(d)d.focus();return false}if(!q||!q.checked){alert('Click Email Proof of Service Location Allowed, send the proof to '+email+', and confirm that you sent it.');if(q)q.focus();return false}}return true}
if(p){var f=document.getElementById('restrictionProof');if(f)f.remove();var l=p.querySelector('label[for="restrictionProof"]');if(l)l.remove();var n=p.querySelector('.note');if(n)n.innerHTML='<strong>Proof Required:</strong> Because you selected Yes or Unsure, documentation is required showing that the service location has no applicable restrictions and that DASH Services is permitted to complete service there. <strong>Email proof to '+email+'</strong>.';proof()}
r.addEventListener('change',function(){lock();if(r.value==='yes'||r.value==='unsure'){var x=records();x[key()]={status:'proof-required',requestNumber:number,createdAt:new Date().toISOString()};localStorage.setItem('dashRestrictedServiceAddresses',JSON.stringify(x))}if(p)p.classList.toggle('hidden',r.value!=='yes'&&r.value!=='unsure')});['locationStreet','locationCity','locationState','locationZip'].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener('input',lock)});lock();
var ce=window.calculateEstimate;if(typeof ce==='function'&&!ce.__dashSafe){var w=function(){return validate()?ce.apply(this,arguments):undefined};w.__dashSafe=true;window.calculateEstimate=w}var rb=window.reviewBooking;if(typeof rb==='function'&&!rb.__dashSafe){var w2=function(){return validate()?rb.apply(this,arguments):undefined};w2.__dashSafe=true;window.reviewBooking=w2}}
function setupServiceAreaMap(){
  var mapEl=document.querySelector('.service-map');
  if(!mapEl || !window.DASH_GOOGLE_MAPS_KEY || window.DASH_GOOGLE_MAPS_KEY.indexOf('PASTE_YOUR_')===0) return;
  function init(){
    if(typeof google==='undefined'||!google.maps||!google.maps.Map) return;
    mapEl.innerHTML='';
    mapEl.classList.add('dash-google-map');
    var map=new google.maps.Map(mapEl,{center:{lat:33.72,lng:-78.90},zoom:10,mapTypeId:'terrain',disableDefaultUI:true,zoomControl:true,fullscreenControl:true,gestureHandling:'cooperative',styles:[{featureType:'poi.business',stylers:[{visibility:'off'}]},{featureType:'transit',stylers:[{visibility:'off'}]}]});
    var area=[{lat:33.96,lng:-79.12},{lat:33.90,lng:-78.72},{lat:33.62,lng:-78.54},{lat:33.43,lng:-78.70},{lat:33.40,lng:-79.02},{lat:33.56,lng:-79.20},{lat:33.78,lng:-79.25}];
    new google.maps.Polygon({paths:area,strokeColor:'#c62828',strokeOpacity:.9,strokeWeight:2,fillColor:'#c62828',fillOpacity:.12,map:map});
    [{position:{lat:33.6891,lng:-78.8867},title:'Myrtle Beach'},{position:{lat:33.836,lng:-79.0478},title:'Conway'}].forEach(function(item){new google.maps.Marker({position:item.position,map:map,title:item.title,label:{text:item.title,color:'#0f172a',fontWeight:'700',fontSize:'12px'}})});
  }
  var script=document.createElement('script');script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(window.DASH_GOOGLE_MAPS_KEY)+'&callback=dashInitServiceAreaMap';script.async=true;script.defer=true;window.dashInitServiceAreaMap=init;document.head.appendChild(script);
}
function start(){
  load('./vehicle-catalog.js?v=20260819v6',function(){
    load('./vehicle-database-expanded.js?v=20260819v12',function(){
      restrictions();
      if(location.pathname.endsWith('/index.html')||location.pathname==='/'){
        var c=document.createElement('script');c.src='./google-maps-config.js?v=20260820';c.onload=setupServiceAreaMap;document.head.appendChild(c);
      }
      window.DASHVehicleDatabaseLoaded=true;
      document.dispatchEvent(new CustomEvent('dash:vehicle-database-ready'));
    });
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
