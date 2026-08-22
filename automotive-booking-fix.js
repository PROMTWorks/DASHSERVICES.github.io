/* Targeted customer booking compatibility fix. Keeps the existing automotive flow intact and restores Lawn & Property booking on the same booking page. */
(function(){
  'use strict';
  function el(id){ return document.getElementById(id); }
  function getServiceKey(button){
    var attr=button && button.getAttribute('onclick') || '';
    var match=attr.match(/openBooking\(['\"]([^'\"]+)['\"]\)/);
    return match ? match[1] : '';
  }
  function loadPricing(){
    if(window.DASH_PRICING || document.querySelector('script[data-dash-pricing]')) return;
    var script=document.createElement('script');
    script.src='dash-pricing.js?v=20260822pricing2';
    script.async=false;
    script.setAttribute('data-dash-pricing','true');
    document.head.appendChild(script);
  }
  function isLawn(key){ return !!(window.DASH_PRICING && window.DASH_PRICING.LAWN && window.DASH_PRICING.LAWN[key]); }
  var LAWN_SERVICES=[
    ['lawn-mowing','Lawn Mowing','Routine mowing to keep grass neat, manageable, and well maintained.'],
    ['weed-removal','Weed Removal','Removal of weeds from suitable lawn and landscape areas.'],
    ['mulch-installation','Mulch Installation','Installation and spreading of mulch in existing landscape beds.'],
    ['decorative-rock','Decorative Rock Installation','Installation and spreading of decorative landscape rock.'],
    ['yard-cleanup','Yard Cleanup','General cleanup of leaves, debris, and manageable yard waste.'],
    ['trimming-edging','Trimming & Edging','Basic trimming and edging around accessible lawn areas.'],
    ['seasonal-yard-cleanup','Seasonal Yard Cleanup','Larger seasonal cleanup of suitable lawn and property areas.'],
    ['property-maintenance','Property Maintenance','Routine lawn and property-care service for suitable areas.']
  ];
  function lawnCardHtml(s){
    return '<div class="service"><strong>'+s[1]+'</strong><span>'+s[2]+'</span><button type="button" onclick="openBooking(\''+s[0]+'\')">Continue</button></div>';
  }
  function installLawnCategory(){
    var automotive=el('automotive');
    if(!automotive || el('lawnProperty')) return;
    var section=document.createElement('section');
    section.className='category';
    section.id='lawnProperty';
    section.innerHTML='<div class="category-head"><h2>Lawn &amp; Property Services</h2><p>Mobile lawn and property-care services offered by DASH MOBILE SERVICES.</p></div><div class="services" id="lawnServices">'+LAWN_SERVICES.map(lawnCardHtml).join('')+'</div>';
    section.querySelector('.category-head').addEventListener('click',function(){section.classList.toggle('open');});
    automotive.parentNode.insertBefore(section,automotive.nextSibling);
    var select=el('service');
    if(select){
      LAWN_SERVICES.forEach(function(s){
        if(![...select.options].some(function(o){return o.value===s[0];})) select.add(new Option(s[1],s[0]));
      });
    }
  }
  function setPropertyMode(active,key){
    var ids=['year','make','model','engine','trim'];
    ids.forEach(function(id){var field=el(id)?.closest('.field');if(field)field.classList.toggle('hidden',active);var input=el(id);if(input){input.disabled=active;}});
    var title=el('title'),description=el('description');
    if(active){
      if(title)title.textContent='Lawn & Property Service Booking';
      if(description)description.textContent='Enter the service location and scheduling information for your lawn or property-care request. Vehicle information is not required for this service.';
    }else{
      if(title)title.textContent='Automotive Booking';
      if(description)description.textContent='Select your vehicle and service. Your vehicle information will be used to determine service requirements and the estimated service cost.';
    }
  }
  function openBookingSafe(serviceKey){
    var automotive=el('automotive'),booking=el('booking'),service=el('service');
    if(!automotive || !booking || !service) return false;
    var lawn=isLawn(serviceKey);
    if(lawn){
      var lp=el('lawnProperty');if(lp)lp.classList.add('open');
      automotive.classList.remove('open');
    }else{
      automotive.classList.add('open');
      var lp2=el('lawnProperty');if(lp2)lp2.classList.remove('open');
    }
    booking.classList.add('open');
    service.value=serviceKey;
    setPropertyMode(lawn,serviceKey);
    var estimate=el('estimate'),review=el('review'),contact=el('contact');
    if(estimate)estimate.classList.remove('open');
    if(review)review.classList.remove('open');
    if(contact)contact.classList.remove('open');
    for(var i=1;i<=5;i++){var p=el('p'+i);if(p)p.classList.toggle('active',i===2);}
    if(typeof window.updateSpecial==='function')window.updateSpecial();
    if(booking.scrollIntoView)booking.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  }
  function install(){
    if(window.__dashBookingCompatibilityFixInstalled)return;
    window.__dashBookingCompatibilityFixInstalled=true;
    loadPricing();
    installLawnCategory();
    window.openAutomotiveBooking=openBookingSafe;
    var originalValidate=window.validateBase;
    window.validateBase=function(){
      var service=el('service')?.value||'';
      if(isLawn(service)){
        if(!service){alert('Please select a service first.');return false;}
        if(typeof window.validateAddress==='function')return window.validateAddress();
        return true;
      }
      return typeof originalValidate==='function'?originalValidate():true;
    };
    var originalCalculate=window.calculateEstimate;
    window.calculateEstimate=function(){
      var service=el('service')?.value||'';
      if(!isLawn(service))return typeof originalCalculate==='function'?originalCalculate():undefined;
      if(!window.validateBase())return;
      if(!window.DASH_PRICING||!window.DASH_PRICING.estimate){alert('The pricing system is still loading. Please try again.');return;}
      var e=window.DASH_PRICING.estimate(service);
      if(!e){alert('Pricing is not available for this service yet.');return;}
      if(el('laborPrice'))el('laborPrice').textContent='$'+e.labor.toFixed(2);
      if(el('partsPrice'))el('partsPrice').textContent='$'+e.parts.toFixed(2);
      if(el('totalPrice'))el('totalPrice').textContent='$'+e.total.toFixed(2);
      var estimate=el('estimate');
      if(estimate){
        var badge=el('startingAtPrice');
        if(!badge){badge=document.createElement('div');badge.id='startingAtPrice';badge.style='font-size:13px;color:#475569;margin:-4px 0 12px;font-weight:700';var h=estimate.querySelector('h2');if(h)h.insertAdjacentElement('afterend',badge);}
        badge.textContent='Starting at $'+e.startingAt.toFixed(2)+' • Final estimate based on service details';
        estimate.classList.add('open');
      }
      if(typeof setStep==='function')setStep(3);
      if(estimate&&estimate.scrollIntoView)estimate.scrollIntoView({behavior:'smooth'});
    };
    var originalOpen=window.openBooking;
    window.openBooking=function(key){return openBookingSafe(key);};
    window.openBooking.__dashAutomotiveFix=true;
    document.addEventListener('click',function(e){
      var button=e.target&&e.target.closest?e.target.closest('#automotive .service button, #lawnProperty .service button'):null;
      if(!button)return;
      var key=getServiceKey(button);if(!key)return;
      e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();openBookingSafe(key);
    },true);
    document.addEventListener('change',function(e){
      if(e.target&&e.target.id==='service')setPropertyMode(isLawn(e.target.value),e.target.value);
    },true);
    setInterval(function(){
      if(typeof window.openBooking!=='function'||window.openBooking.__dashAutomotiveFix!==true){
        var fn=function(key){return openBookingSafe(key);};fn.__dashAutomotiveFix=true;window.openBooking=fn;
      }
    },500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
