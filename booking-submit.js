/* DASH booking submission client + internal pricing engine. */
(function(){
'use strict';
if(window.__DASH_BOOKING_SUBMIT_LOADED)return;
window.__DASH_BOOKING_SUBMIT_LOADED=true;
const ENDPOINT='https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/create-service-request';
const COSTS={ownerHourly:30.00,employeeHourly:10.00,employerBurdenRate:0.15,fuelCostPerMile:0.70,equipmentOverheadPerLaborHour:4.00,businessOverheadPerJob:3.00,targetProfitMargin:0.25,travelBaseFee:10.00};
const LAWN={'lawn-mowing':{name:'Lawn Mowing',minutes:60,materials:2},'weed-removal':{name:'Weed Removal',minutes:60,materials:3},'mulch-installation':{name:'Mulch Installation',minutes:60,materials:55},'decorative-rock':{name:'Decorative Rock Installation',minutes:60,materials:65},'yard-cleanup':{name:'Yard Cleanup',minutes:90,materials:5},'trimming-edging':{name:'Trimming & Edging',minutes:45,materials:1},'seasonal-yard-cleanup':{name:'Seasonal Yard Cleanup',minutes:180,materials:8},'property-maintenance':{name:'Property Maintenance',minutes:60,materials:3}};
const AUTO={oil:{minutes:45,parts:32},wipers:{minutes:20,parts:35},battery:{minutes:35,parts:160},jump:{minutes:20,parts:0},tire:{minutes:20,parts:0},'tire-replacement':{minutes:45,parts:125},air:{minutes:25,parts:35},cabin:{minutes:25,parts:35},headlight:{minutes:60,parts:150},'brake-light':{minutes:40,parts:80},fluid:{minutes:20,parts:15}};
const $=id=>document.getElementById(id);const val=id=>$(id)?String($(id).value||'').trim():'';
function choices(){return [...document.querySelectorAll('input[name="specialChoice"]:checked')].map(x=>x.value)}
function lawn(s){return !!LAWN[s]}
function travel(){return COSTS.travelBaseFee}
function internalCost(parts,minutes){const hours=Math.max(minutes/60,.25);const labor=COSTS.employeeHourly*(1+COSTS.employerBurdenRate)*hours;return labor+parts+COSTS.equipmentOverheadPerLaborHour*hours+COSTS.businessOverheadPerJob+travel()}
function customerPrice(cost){return Math.max(cost+10,cost/(1-COSTS.targetProfitMargin))}
function estimate(s){let b,parts,minutes;if(lawn(s)){b=LAWN[s];parts=b.materials;minutes=b.minutes}else{b=AUTO[s];if(!b)return null;parts=b.parts;minutes=b.minutes;const c=choices();if(s==='wipers'){const n=c.includes('All wipers')?4:Math.max(c.length,1);parts=35*n;minutes=20*n}if(s==='tire-replacement'){const n=parseInt(c[0]||'1',10);parts=125*n;minutes=45*n}if(s==='headlight'||s==='brake-light'){const n=(c[0]==='Both'||c[0]==='Two')?2:1;parts=b.parts*n;minutes=b.minutes*n}if(s==='fluid')parts=15*Math.max(c.length,1)}const cost=internalCost(parts,minutes);const total=customerPrice(cost);const laborCost=COSTS.employeeHourly*(1+COSTS.employerBurdenRate)*(minutes/60);const displayedLabor=Math.max(10,total-parts-travel());return{labor:displayedLabor,parts,total,cost,profit:total-cost,laborCost,minutes}}
function setLawnMode(on){['year','make','model','engine','trim'].forEach(id=>{const e=$(id),f=e?.closest('.field');if(f)f.classList.toggle('dash-lawn-hidden',on)});if($('title'))$('title').textContent=on?'Lawn & Property Care Booking':'Automotive Booking';if($('description'))$('description').textContent=on?'Tell DASH where the work is needed and when you would like it performed. A final estimate is based on the property, service, travel, materials, labor, and operating costs.':'Select your vehicle and service. Your vehicle information will be used to determine service requirements and the estimated service cost.'}
function openLawnBooking(key){const cat=$('lawn-property-booking');if(cat){cat.classList.add('open');const list=cat.querySelector('.lawn-service-list');if(list)list.hidden=false}const automotive=$('automotive');if(automotive)automotive.classList.remove('open');const booking=$('booking');if(!booking)return;booking.classList.add('open');$('service').value=key;setLawnMode(true);$('estimate')?.classList.remove('open');$('review')?.classList.remove('open');$('contact')?.classList.remove('open');document.getElementById('p1')?.classList.remove('active');document.getElementById('p2')?.classList.add('active');booking.scrollIntoView({behavior:'smooth'})}
function addLawnServices(){if($('lawn-property-booking'))return;const lawn=document.createElement('section');lawn.className='category';lawn.id='lawn-property-booking';lawn.innerHTML='<button type="button" class="category-head lawn-toggle" aria-expanded="false"><h2>Lawn & Property Care</h2><p>Mobile lawn and property-care services currently available for booking.</p></button><div class="services lawn-service-list" hidden>'+Object.entries(LAWN).map(([k,s])=>`<div class="service"><strong>${s.name}</strong><span>Mobile ${s.name.toLowerCase()} service.</span><button type="button" data-lawn="${k}">Continue</button></div>`).join('')+'</div>';
const automotive=document.getElementById('automotive');if(automotive&&automotive.parentNode)automotive.parentNode.insertBefore(lawn,automotive.nextSibling);else(document.querySelector('main')||document.body).appendChild(lawn);
const toggle=lawn.querySelector('.lawn-toggle'),list=lawn.querySelector('.lawn-service-list');toggle.addEventListener('click',()=>{const open=!lawn.classList.contains('open');lawn.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));list.hidden=!open});lawn.querySelectorAll('[data-lawn]').forEach(b=>b.addEventListener('click',()=>openLawnBooking(b.dataset.lawn)));
const style=document.createElement('style');style.textContent='#lawn-property-booking{display:block!important;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:28px;box-shadow:0 8px 25px rgba(15,23,42,.05)}#lawn-property-booking .lawn-toggle{width:100%;border:0;background:#fff;text-align:left;padding:24px;cursor:pointer;color:#17202a;font:inherit}#lawn-property-booking .lawn-toggle h2{margin:0;font-size:27px}#lawn-property-booking .lawn-toggle p{color:#475569;margin:5px 0 0}.dash-lawn-hidden{display:none!important}#lawn-property-booking .lawn-service-list[hidden]{display:none!important}#lawn-property-booking .lawn-service-list{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:18px 24px 24px;border-top:1px solid #e2e8f0}@media(max-width:650px){#lawn-property-booking .lawn-service-list{grid-template-columns:1fr}}';document.head.appendChild(style);
const originalOpen=window.openBooking;window.openBooking=function(s){if(lawn(s))openLawnBooking(s);else{setLawnMode(false);originalOpen?.(s)}};
const originalCalc=window.calculateEstimate;window.calculateEstimate=function(){const s=val('service');if(lawn(s)){const e=estimate(s);if(!e)return;setLawnMode(true);$('laborPrice').textContent='$'+e.labor.toFixed(2);$('partsPrice').textContent='$'+e.parts.toFixed(2);$('totalPrice').textContent='$'+e.total.toFixed(2);$('estimate')?.classList.add('open');$('review')?.classList.remove('open');$('contact')?.classList.remove('open');document.getElementById('p2')?.classList.remove('active');document.getElementById('p3')?.classList.add('active');$('estimate')?.scrollIntoView({behavior:'smooth'});return}setLawnMode(false);const result=estimate(s);if(result){$('laborPrice').textContent='$'+result.labor.toFixed(2);$('partsPrice').textContent='$'+result.parts.toFixed(2);$('totalPrice').textContent='$'+result.total.toFixed(2);$('estimate')?.classList.add('open');document.getElementById('p3')?.classList.add('active');$('estimate')?.scrollIntoView({behavior:'smooth'});return}if(originalCalc)originalCalc()};
window.DASH_PRICING={COSTS,LAWN,AUTO,estimate};
}
function install(){addLawnServices()}
function applyPrelaunchRequestMode(){
  const h1=document.querySelector('main h1');
  if(h1)h1.textContent='Request a Service';
  const intro=document.querySelector('.intro');
  if(intro)intro.textContent='Choose a service and submit a request. DASH is currently in pre-launch, so requests are collected for planning and demand tracking. No payment is required and no appointment is confirmed at this stage.';
  const autoText=document.querySelector('#automotive .category-head p');
  if(autoText)autoText.textContent='Mobile automotive services planned for the DASH launch.';
  if(!document.querySelector('.prelaunch-note')){
    const progress=document.querySelector('.progress');
    if(progress){
      const note=document.createElement('div');
      note.className='note prelaunch-note';
      note.innerHTML='<strong>Pre-launch:</strong> Requests are being collected to measure interest and help DASH prepare for launch. No payment is required and submitting a request does not reserve a date.';
      progress.parentNode.insertBefore(note,progress);
    }
  }
  document.querySelectorAll('.note').forEach(note=>{
    if(note.textContent.includes('Your preferred date and arrival time are requests, not guarantees.')){
      note.innerHTML='<strong>Pre-launch scheduling:</strong> Your preferred date and arrival time are requests only. DASH is not currently opening appointments. Your request helps us measure demand and prepare our initial schedule.';
    }
    if(note.textContent.includes('Your appointment is not confirmed until DASH completes the required confirmation process')){
      note.innerHTML='<strong>Pre-launch notice:</strong> Submitting this request does not create a confirmed appointment, and you will not be charged. DASH will contact you when appointment scheduling officially opens.';
    }
  });
  const contactHeading=document.querySelector('#contact h2');
  if(contactHeading)contactHeading.textContent='Contact Information';
  const contactIntro=document.querySelector('#contact .contact-intro');
  if(contactIntro)contactIntro.textContent='We need your contact information so DASH can follow up about your service request and notify you when scheduling officially opens.';
  const consent=document.querySelector('#consent');
  if(consent){const span=consent.parentElement?.querySelector('span');if(span)span.innerHTML='I confirm that the contact information above is accurate and I authorize DASH MOBILE SERVICES to contact me about this pre-launch service request and future scheduling. <span class="required">*</span>'}
  const submit=document.querySelector('#contact button[onclick="submitRequest()"]');
  if(submit)submit.textContent='Submit Interest';
  const reviewButton=document.querySelector('#review button[onclick="reviewBooking()"]');
  if(reviewButton){reviewButton.textContent="I'm Interested";reviewButton.setAttribute('onclick','showContact()');}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{install();applyPrelaunchRequestMode()});else{install();applyPrelaunchRequestMode()}
})();