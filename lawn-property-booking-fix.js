/* DASH MOBILE SERVICES — Lawn & Property Care booking selection repair */
(function(){
'use strict';
const lawnServices=[
 ['lawn-mowing','Lawn Mowing'],
 ['lawn-edging','Lawn Edging'],
 ['weed-control','Weed Control'],
 ['hedge-trimming','Hedge Trimming'],
 ['leaf-cleanup','Leaf Cleanup'],
 ['yard-cleanup','Yard Cleanup']
];
function $(id){return document.getElementById(id)}
function getService(){return $('service')}
function ensureOptions(){
 const sel=getService(); if(!sel)return;
 lawnServices.forEach(function(item){
  if(!Array.from(sel.options).some(function(o){return o.value===item[0]})) sel.add(new Option(item[1],item[0]));
 });
}
function showBooking(id,name){
 ensureOptions();
 const sel=getService(); if(!sel)return;
 sel.value=id;
 if(sel.value!==id){
  const opt=new Option(name,id); sel.add(opt); sel.value=id;
 }
 const auto=$('automotive'); if(auto)auto.classList.remove('open');
 const booking=$('booking'); if(booking)booking.classList.add('open');
 const title=$('title'); if(title)title.textContent=name+' Booking';
 const desc=$('description'); if(desc)desc.textContent='Complete the information below for your '+name.toLowerCase()+' request.';
 ['year','make','model','engine','trim'].forEach(function(x){const e=$(x);if(e&&e.parentElement)e.parentElement.classList.add('hidden')});
 ['estimate','review','contact'].forEach(function(x){const e=$(x);if(e)e.classList.remove('open')});
 if(typeof window.setStep==='function')window.setStep(2);
 if(booking)booking.scrollIntoView({behavior:'smooth'});
}
function findLawnCategory(){
 return Array.from(document.querySelectorAll('.category')).find(function(sec){
  const text=(sec.textContent||'').toLowerCase();
  return text.includes('lawn') && text.includes('property');
 });
}
function bind(){
 const cat=findLawnCategory(); if(!cat)return;
 cat.querySelectorAll('button').forEach(function(btn){
  if(btn.dataset.lawnPropertyBound)return;
  const text=(btn.textContent||'').trim().toLowerCase();
  if(!text.includes('lawn'))return;
  btn.dataset.lawnPropertyBound='1';
  btn.addEventListener('click',function(e){
   e.preventDefault(); e.stopImmediatePropagation();
   const raw=btn.dataset.service||btn.dataset.lawnService||btn.getAttribute('data-service-id')||btn.getAttribute('data-lawn-service');
   const id=raw||'lawn-mowing';
   const opt=Array.from(getService()?.options||[]).find(function(o){return o.value===id});
   showBooking(id,opt?opt.text:btn.textContent.trim());
  },true);
 });
}
function init(){ensureOptions();bind();setTimeout(function(){ensureOptions();bind()},300);setTimeout(function(){ensureOptions();bind()},1000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();