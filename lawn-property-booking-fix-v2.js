/* DASH MOBILE SERVICES — complete Lawn & Property Care booking integration */
(function(){
'use strict';
const services=[
 ['lawn-mowing','Lawn Mowing','Routine lawn mowing service.'],
 ['lawn-edging','Lawn Edging','Clean edging along lawn borders and hard surfaces.'],
 ['weed-control','Weed Control','Basic weed-control service request.'],
 ['hedge-trimming','Hedge Trimming','Hedge and shrub trimming service.'],
 ['leaf-cleanup','Leaf Cleanup','Leaf collection and cleanup service.'],
 ['yard-cleanup','Yard Cleanup','General yard debris and property cleanup.']
];
const $=id=>document.getElementById(id);
function ensureSelectOptions(){const s=$('service');if(!s)return;services.forEach(x=>{if(![...s.options].some(o=>o.value===x[0]))s.add(new Option(x[1],x[0]))});}
function openService(id){ensureSelectOptions();const s=$('service');if(!s)return;s.value=id;const item=services.find(x=>x[0]===id);const booking=$('booking');if(!booking)return;if($('automotive'))$('automotive').classList.remove('open');if($('additional-booking-services'))$('additional-booking-services').classList.remove('open');booking.classList.add('open');if($('title'))$('title').textContent=(item?item[1]:id)+' Booking';if($('description'))$('description').textContent='Complete the information below for your '+(item?item[1].toLowerCase():'lawn & property care')+' request.';['year','make','model','engine','trim'].forEach(id=>{$(id)?.parentElement?.classList.add('hidden')});['estimate','review','contact'].forEach(id=>$(id)?.classList.remove('open'));if(typeof window.setStep==='function')window.setStep(2);booking.scrollIntoView({behavior:'smooth'});}
function addCategory(){if($('lawn-property-booking-services'))return;const anchor=$('automotive');if(!anchor)return;const sec=document.createElement('section');sec.className='category';sec.id='lawn-property-booking-services';sec.innerHTML='<div class="category-head"><h2>Lawn &amp; Property Care</h2><p>Mobile lawn and property care services available for online booking.</p></div><div class="services">'+services.map(x=>'<div class="service"><strong>'+x[1]+'</strong><span>'+x[2]+'</span><button type="button" data-dash-lawn="'+x[0]+'">Book Online</button></div>').join('')+'</div>';anchor.insertAdjacentElement('afterend',sec);sec.querySelector('.category-head').addEventListener('click',()=>sec.classList.toggle('open'));sec.querySelectorAll('[data-dash-lawn]').forEach(btn=>btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openService(btn.getAttribute('data-dash-lawn'));},true));}
function bind(){document.querySelectorAll('[data-dash-lawn]').forEach(btn=>{if(btn.dataset.dashLawnBound)return;btn.dataset.dashLawnBound='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();openService(btn.getAttribute('data-dash-lawn'));},true)});}
function init(){ensureSelectOptions();addCategory();bind();setTimeout(()=>{ensureSelectOptions();addCategory();bind()},300);setTimeout(()=>{ensureSelectOptions();addCategory();bind()},1000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();