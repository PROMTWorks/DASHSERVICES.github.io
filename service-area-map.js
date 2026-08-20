(function(){
  'use strict';
  function loadScript(src,onload){var s=document.createElement('script');s.src=src;s.async=true;s.defer=true;s.onload=onload;s.onerror=function(){console.warn('DASH map: Google Maps script could not load.');};document.head.appendChild(s);}
  function initMap(){
    var host=document.querySelector('.service-map');
    if(!host||!window.google||!google.maps)return;
    host.innerHTML='';host.className='service-map google-service-map';
    var intro=document.querySelector('.visual-intro-copy p');
    if(intro){intro.innerHTML='DASH Services is proud to serve Myrtle Beach, Conway, and communities throughout the surrounding Grand Strand area. We’re committed to providing dependable, convenient service wherever you need us.<br><br>From everyday service needs to jobs that require a little more travel, we’re here to make the process simple from start to finish.<br><br>Explore our services and find the right option for you on our <a href="book-service.html?v=20260816" style="color:#c62828;font-weight:900;text-decoration:underline">Book a Service</a> page.';}
    var mapEl=document.createElement('div');mapEl.className='google-map-canvas';host.appendChild(mapEl);
    var badge=document.createElement('div');badge.className='map-title';badge.textContent='DASH service area';host.appendChild(badge);
    var caption=document.createElement('div');caption.className='map-caption';caption.innerHTML='<strong>Grand Strand focus</strong> · Myrtle Beach, Conway & surrounding communities';host.appendChild(caption);
    var map=new google.maps.Map(mapEl,{center:{lat:33.78,lng:-79.00},zoom:10,mapTypeId:'terrain',streetViewControl:false,mapTypeControl:false,fullscreenControl:false,zoomControl:true,gestureHandling:'cooperative'});
    var serviceArea=[{lat:33.94,lng:-79.18},{lat:33.96,lng:-78.78},{lat:33.86,lng:-78.62},{lat:33.66,lng:-78.63},{lat:33.48,lng:-78.86},{lat:33.43,lng:-79.12},{lat:33.58,lng:-79.24},{lat:33.78,lng:-79.24}];
    new google.maps.Polygon({paths:serviceArea,strokeColor:'#c62828',strokeOpacity:.9,strokeWeight:2,fillColor:'#c62828',fillOpacity:.10,map:map});
    var conway=new google.maps.Marker({map:map,position:{lat:33.8360,lng:-79.0478},title:'Conway'});
    var myrtle=new google.maps.Marker({map:map,position:{lat:33.6891,lng:-78.8867},title:'DASH Services Base — Myrtle Beach',icon:{path:'M 0,-12 L 3.5,-3.5 L 12,-3.5 L 5,2 L 7.5,11 L 0,5.5 L -7.5,11 L -5,2 L -12,-3.5 L -3.5,-3.5 Z',fillColor:'#c62828',fillOpacity:1,strokeColor:'#ffffff',strokeWeight:2,scale:1.15,anchor:new google.maps.Point(0,0)}});
    var baseLabel=new google.maps.Marker({map:map,position:{lat:33.6891,lng:-78.8867},icon:{path:google.maps.SymbolPath.CIRCLE,scale:0,fillOpacity:0,strokeOpacity:0},label:{text:'DASH Services Base • Myrtle Beach',color:'#c62828',fontSize:'13px',fontWeight:'800'},clickable:false,zIndex:1});
    var info=new google.maps.InfoWindow();
    function wire(marker,html){marker.addListener('click',function(){info.setContent('<div style="font-family:Arial,sans-serif;padding:6px 8px"><strong>'+html+'</strong></div>');info.open({map:map,anchor:marker});});}
    wire(myrtle,'DASH Services Base — Myrtle Beach');wire(conway,'Conway — DASH Services area');

    var section=host.closest('section')||host.parentElement;
    var oldNote=section.querySelector('.service-area-travel-note');if(oldNote)oldNote.remove();
    var oldBooking=section.querySelector('.service-area-booking-copy');if(oldBooking)oldBooking.remove();

    // Travel notice intentionally comes first.
    var note=document.createElement('div');
    note.className='service-area-travel-note';
    note.innerHTML='<div class="service-area-travel-note-label">Outside Our Standard Service Area</div><div class="service-area-travel-note-text">DASH Services may be able to serve customers outside our standard service area. Locations requiring significant additional travel, including out-of-state or several-hours-away requests, may incur an additional travel/fuel fee. DASH Services will contact the customer to discuss any applicable fee before the service is confirmed.</div>';
    section.appendChild(note);

    // Booking prompt comes underneath the travel notice.
    var booking=document.createElement('div');
    booking.className='service-area-booking-copy';
    booking.innerHTML='<p><strong>Need a specific service?</strong> Browse the available categories and service options on the booking page.</p><p><a href="book-service.html?v=20260816" style="color:#c62828;font-weight:900;text-decoration:underline">Explore Services & Book</a></p><p class="service-area-map-update-note">Service-area map is interactive and can be updated as DASH expands its coverage.</p>';
    section.appendChild(booking);
  }
  function start(){updateHomepageCopy();var config=document.createElement('script');config.src='google-maps-config.js';config.onload=function(){var key=window.DASH_GOOGLE_MAPS_KEY;if(!key||key.indexOf('PASTE_')===0){console.warn('DASH map: add the new restricted Google Maps API key to google-maps-config.js.');return;}loadScript('https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&v=weekly',initMap);};config.onerror=function(){console.warn('DASH map: google-maps-config.js could not load.');};document.head.appendChild(config);}
  function updateHomepageCopy(){var paragraphs=document.querySelectorAll('.visual-intro-copy p');paragraphs.forEach(function(p){if(p.textContent.indexOf('DASH Services is based around the Myrtle Beach and Conway area')!==-1||p.textContent.indexOf('The homepage keeps this simple')!==-1){p.innerHTML='DASH Services is proud to serve Myrtle Beach, Conway, and communities throughout the surrounding Grand Strand area. We’re committed to providing dependable, convenient service wherever you need us.<br><br>From everyday service needs to jobs that require a little more travel, we’re here to make the process simple from start to finish.<br><br>Explore our services and find the right option for you on our <a href="book-service.html?v=20260816" style="color:#c62828;font-weight:900;text-decoration:underline">Book a Service</a> page.';}});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
