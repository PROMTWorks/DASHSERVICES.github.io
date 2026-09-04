/* DASH MOBILE SERVICES — definitive Lawn & Property Care booking integration */
(function(){
'use strict';
var SERVICES=[
 ['lawn-mowing','Lawn Mowing','Routine mobile lawn mowing service.'],
 ['lawn-edging','Lawn Edging','Clean edging around lawn borders and hard surfaces.'],
 ['weed-control','Weed Control','Basic weed-control service for eligible areas.'],
 ['hedge-trimming','Hedge Trimming','Basic hedge and shrub trimming service.'],
 ['leaf-cleanup','Leaf Cleanup','Leaf removal and cleanup from eligible yard areas.'],
 ['yard-cleanup','Yard Cleanup','General yard debris and property cleanup.']
];
function $(id){return document.getElementById(id)}
function addServiceOptions(){
 var sel=$('service'); if(!sel)return;
 SERVICES.forEach(function(x){
  if(!Array.prototype.some.call(sel.options,function(o){return o.value===x[0]})) sel.add(new Option(x[1],x[0]));
 });
}
function openLawn(id,name){
 addServiceOptions();
 var sel=$('service'); if(sel)sel.value=id;
 var auto=$('automotive'); if(auto)auto.classList.remove('open');
 var add=$('additional-booking-services'); if(add)add.classList.remove('open');
 var booking=$('booking'); if(booking)booking.classList.add('open');
 var title=$('title'); if(title)title.textContent=name+' Booking';
 var desc=$('description'); if(desc)desc.textContent='Complete the information below for your '+name.toLowerCase()+' request.';
 ['year','make','model','engine','trim'].forEach(function(id){var e=$(id);if(e&&e.parentElement)e.parentElement.classList.add('hidden')});
 ['estimate','review','contact'].forEach(function(id){var e=$(id);if(e)e.classList.remove('open')});
 if(typeof window.setStep==='function')window.setStep(2);
 if(booking)booking.scrollIntoView({behavior:'smooth'});
}
function createCategory(){
 if($('lawn-property-booking'))return $('lawn-property-booking');
 var anchor=$('automotive'); if(!anchor||!anchor.parentElement)return null;
 var sec=document.createElement('section');
 sec.className='category'; sec.id='lawn-property-booking';
 var head=document.createElement('div'); head.className='category-head';
 head.innerHTML='<h2>Lawn &amp; Property Care</h2><p>Mobile lawn and property care services available for online booking.</p>';
 var services=document.createElement('div'); services.className='services';
 SERVICES.forEach(function(x){
  var card=document.createElement('div'); card.className='service';
  card.innerHTML='<strong>'+x[1]+'</strong><span>'+x[2]+'</span><button type="button">Book Online</button>';
  card.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();openLawn(x[0],x[1])});
  services.appendChild(card);
 });
 sec.appendChild(head); sec.appendChild(services); anchor.insertAdjacentElement('afterend',sec);
 head.addEventListener('click',function(){sec.classList.toggle('open')});
 return sec;
}
function init(){
 addServiceOptions();
 createCategory();
 setTimeout(function(){addServiceOptions();createCategory()},250);
 setTimeout(function(){addServiceOptions();createCategory()},1000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();