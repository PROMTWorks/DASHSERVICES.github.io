/* DASH MOBILE SERVICES — House Cleaning booking integration */
(function(){
  'use strict';
  const CLEANING='house-cleaning';
  const rates={1:125,2:155,3:195,4:235,5:285};
  const deepRates={1:75,2:90,3:110,4:130,5:150};
  const addonRates={refrigerator:35,oven:35,baseboards:40};
  const $=id=>document.getElementById(id);
  const val=id=>{const e=$(id);return e?String(e.value||'').trim():''};
  const money=n=>'$'+Number(n||0).toFixed(2);
  function isCleaning(){return val('service')===CLEANING || String($('service')?.selectedOptions?.[0]?.text||'').toLowerCase()==='house cleaning';}
  function addServiceOption(){const s=$('service');if(!s)return;if(![...s.options].some(o=>o.value===CLEANING))s.add(new Option('House Cleaning',CLEANING));}
  function addCleaningCategory(){
    const existing=$('house-cleaning-category');
    if(existing)return existing;
    const automotive=$('automotive');
    if(!automotive)return null;
    const section=document.createElement('section');
    section.className='category';
    section.id='house-cleaning-category';
    section.innerHTML='<div class="category-head"><h2>House Cleaning</h2><p>Professional residential cleaning with simple flat-rate pricing. No hourly billing.</p></div><div class="services" id="houseCleaningServices"></div>';
    automotive.insertAdjacentElement('afterend',section);
    section.querySelector('.category-head').addEventListener('click',()=>section.classList.toggle('open'));
    return section;
  }
  function addCleaningCard(){
    const box=addCleaningCategory()?.querySelector('#houseCleaningServices');
    if(!box||box.querySelector('[data-house-cleaning]'))return;
    const d=document.createElement('div');
    d.className='service';
    d.dataset.houseCleaning='1';
    d.innerHTML='<strong>Standard House Cleaning</strong><span>1 bedroom $125 • 2 bedrooms $155 • 3 bedrooms $195 • 4 bedrooms $235 • 5+ bedrooms $285</span><button type="button" id="houseCleaningContinue">Book Online</button>';
    box.appendChild(d);
    d.querySelector('button').addEventListener('click',()=>openCleaning());
  }
  function field(id,label,html){const d=document.createElement('div');d.className='field full hc-field hidden';d.id=id;d.innerHTML='<label>'+label+'</label>'+html;return d;}
  function buildFields(){const grid=document.querySelector('#booking .grid');if(!grid||$('hcHomeSize'))return;const date=$('date')?.parentElement;if(!date)return;
    const home=field('hcHomeSize','Home Size — Flat Rate <span class="required">*</span>','<select id="hcSize"><option value="">Select home size</option><option value="1">1 Bedroom — $125</option><option value="2">2 Bedrooms — $155</option><option value="3">3 Bedrooms — $195</option><option value="4">4 Bedrooms — $235</option><option value="5">5+ Bedrooms — $285</option></select>');
    const deep=field('hcDeep','Optional Deep Clean <span class="required">*</span>','<select id="hcDeepChoice"><option value="no">No — Standard Cleaning Only</option><option value="yes">Yes — Add Deep Clean</option></select><div class="note"><strong>Deep Clean add-on:</strong> +$75 for 1 bedroom, +$90 for 2 bedrooms, +$110 for 3 bedrooms, +$130 for 4 bedrooms, +$150 for 5+ bedrooms.</div>');
    const addons=field('hcAddons','Optional Cleaning Add-Ons','<div class="options"><label><input type="checkbox" id="hcRefrigerator"> Inside Refrigerator — +$35</label><label><input type="checkbox" id="hcOven"> Inside Oven — +$35</label><label><input type="checkbox" id="hcBaseboards"> Baseboards — +$40</label></div>');
    grid.insertBefore(home,date);grid.insertBefore(deep,date);grid.insertBefore(addons,date);
    $('hcSize').addEventListener('change',()=>{if(isCleaning())renderEstimatePreview(false)});
    $('hcDeepChoice').addEventListener('change',()=>{if(isCleaning())renderEstimatePreview(false)});
    ['hcRefrigerator','hcOven','hcBaseboards'].forEach(id=>$(id).addEventListener('change',()=>{if(isCleaning())renderEstimatePreview(false)}));
  }
  function setCleaningVisibility(on){buildFields();document.querySelectorAll('.hc-field').forEach(e=>e.classList.toggle('hidden',!on));['year','make','model','engine','trim'].forEach(id=>$(id)?.parentElement?.classList.toggle('hidden',on));if(on){$('title').textContent='House Cleaning Booking';$('description').textContent='Choose your home size, optional Deep Clean, cleaning add-ons, preferred date and time, then enter the cleaning location and contact information.';}else{$('title').textContent='Automotive Booking';$('description').textContent='Select your vehicle and service. Your vehicle information will be used to determine service requirements and the estimated service cost.';}}
  function openCleaning(){addServiceOption();$('service').value=CLEANING;setCleaningVisibility(true);$('booking').classList.add('open');$('estimate')?.classList.remove('open');$('review')?.classList.remove('open');$('contact')?.classList.remove('open');$('booking').scrollIntoView({behavior:'smooth'});}
  function selectedAddons(){let n=0;if($('hcRefrigerator')?.checked)n+=addonRates.refrigerator;if($('hcOven')?.checked)n+=addonRates.oven;if($('hcBaseboards')?.checked)n+=addonRates.baseboards;return n;}
  function calculate(){const size=Number(val('hcSize'));if(!rates[size]){alert('Please select a home size.');return null;}const base=rates[size];const deep=$('hcDeepChoice')?.value==='yes'?deepRates[size]:0;const addons=selectedAddons();return {size,base,deep,addons,total:base+deep+addons};}
  function renderEstimatePreview(open){const r=calculate();if(!r)return;const estimate=$('estimate');if(!estimate)return;let breakdown=$('cleaningEstimateBreakdown');if(!breakdown){breakdown=document.createElement('div');breakdown.id='cleaningEstimateBreakdown';estimate.querySelector('h2')?.after(breakdown);}breakdown.innerHTML='<div class="price-row"><span>Standard Cleaning — '+r.size+(r.size===5?'+':'')+' Bedroom'+(r.size===1?'':'s')+'</span><strong>'+money(r.base)+'</strong></div>'+(r.deep?'<div class="price-row"><span>Deep Clean</span><strong>+'+money(r.deep)+'</strong></div>':'')+(r.addons?'<div class="price-row"><span>Cleaning Add-Ons</span><strong>+'+money(r.addons)+'</strong></div>':'');$('laborPrice').textContent=money(r.base);$('partsPrice').textContent=money(r.deep+r.addons);$('totalPrice').textContent=money(r.total);const note=estimate.querySelector('.estimate-note');if(note)note.textContent='Flat-rate House Cleaning estimate. No hourly billing. Deep Clean and selected cleaning add-ons are optional extras. Your request is not a confirmed appointment and no payment is taken through this form.';if(open){estimate.classList.add('open');estimate.scrollIntoView({behavior:'smooth'});}}
  function interceptEstimate(e){if(!isCleaning())return;e.preventDefault();e.stopImmediatePropagation();renderEstimatePreview(true);}
  function init(){addServiceOption();addCleaningCard();buildFields();$('service')?.addEventListener('change',()=>setCleaningVisibility(isCleaning()));const btn=document.querySelector('#booking button.continue');if(btn)btn.addEventListener('click',interceptEstimate,true);if(isCleaning())setCleaningVisibility(true);}
  window.initHouseCleaningBooking=init;
  window.calculateHouseCleaningEstimate=()=>renderEstimatePreview(true);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
