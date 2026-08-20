(function(){
  'use strict';

  function loadScript(src, onload){
    var s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.defer=true;
    s.onload=onload;
    s.onerror=function(){ console.warn('DASH map: Google Maps script could not load.'); };
    document.head.appendChild(s);
  }

  function initMap(){
    var host=document.querySelector('.service-map');
    if(!host || !window.google || !google.maps) return;

    host.innerHTML='';
    host.className='service-map google-service-map';

    var mapEl=document.createElement('div');
    mapEl.className='google-map-canvas';
    host.appendChild(mapEl);

    var badge=document.createElement('div');
    badge.className='map-title';
    badge.textContent='DASH service area';
    host.appendChild(badge);

    var caption=document.createElement('div');
    caption.className='map-caption';
    caption.innerHTML='<strong>Grand Strand focus</strong> · Myrtle Beach, Conway & surrounding communities';
    host.appendChild(caption);

    var center={lat:33.78,lng:-79.00};
    var map=new google.maps.Map(mapEl,{
      center:center,
      zoom:10,
      mapTypeId:'terrain',
      streetViewControl:false,
      mapTypeControl:false,
      fullscreenControl:false,
      zoomControl:true,
      gestureHandling:'cooperative'
    });

    var serviceArea=[
      {lat:33.94,lng:-79.18},
      {lat:33.96,lng:-78.78},
      {lat:33.86,lng:-78.62},
      {lat:33.66,lng:-78.63},
      {lat:33.48,lng:-78.86},
      {lat:33.43,lng:-79.12},
      {lat:33.58,lng:-79.24},
      {lat:33.78,lng:-79.24}
    ];

    new google.maps.Polygon({
      paths:serviceArea,
      strokeColor:'#c62828',
      strokeOpacity:.9,
      strokeWeight:2,
      fillColor:'#c62828',
      fillOpacity:.10,
      map:map
    });

    var markerOptions={
      map:map,
      icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:'#c62828',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}
    };

    var myrtle=new google.maps.Marker(Object.assign({},markerOptions,{position:{lat:33.6891,lng:-78.8867},title:'Myrtle Beach'}));
    var conway=new google.maps.Marker(Object.assign({},markerOptions,{position:{lat:33.8360,lng:-79.0478},title:'Conway'}));

    var info=new google.maps.InfoWindow();
    function wire(marker,name){
      marker.addListener('click',function(){
        info.setContent('<div style="font-family:Arial,sans-serif;font-weight:800;padding:4px 6px">'+name+'<br><span style="font-size:11px;font-weight:600;color:#526174">DASH Services area</span></div>');
        info.open({map:map,anchor:marker});
      });
    }
    wire(myrtle,'Myrtle Beach');
    wire(conway,'Conway');

    var note=document.createElement('div');
    note.style.cssText='margin:26px auto 0;max-width:900px;padding:22px 24px;border:1px solid #ead6d2;border-radius:16px;background:linear-gradient(135deg,#fff8f6,#ffffff);color:#526174;font-family:Arial,Helvetica,sans-serif;line-height:1.6;box-shadow:0 10px 28px rgba(15,23,42,.05);';
    note.innerHTML='<div style="font-size:12px;font-weight:900;letter-spacing:1.6px;text-transform:uppercase;color:#c62828;margin-bottom:7px">Outside Our Standard Service Area</div><div style="font-size:14px;font-weight:600">DASH Services may be able to serve customers outside our standard service area. Locations requiring significant additional travel, including out-of-state or several-hours-away requests, may incur an additional travel/fuel fee. DASH Services will contact the customer to discuss any applicable fee before the service is confirmed.</div>';

    host.parentElement.appendChild(note);
  }

  function start(){
    var config=document.createElement('script');
    config.src='google-maps-config.js';
    config.onload=function(){
      var key=window.DASH_GOOGLE_MAPS_KEY;
      if(!key || key.indexOf('PASTE_')===0){
        console.warn('DASH map: add the new restricted Google Maps API key to google-maps-config.js.');
        return;
      }
      loadScript('https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(key)+'&v=weekly',initMap);
    };
    config.onerror=function(){console.warn('DASH map: google-maps-config.js could not load.');};
    document.head.appendChild(config);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
