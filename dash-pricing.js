/* DASH MOBILE SERVICES internal pricing engine. Customer sees only the final estimate. */
(function(){
'use strict';
const CONFIG={
  ownerHourly:30.00,
  employeeHourly:10.00,
  employerBurdenRate:0.15,
  fuelCostPerMile:0.70,
  equipmentOverheadPerLaborHour:4.00,
  businessOverheadPerJob:3.00,
  targetProfitMargin:0.25,
  includedOilQuarts:5,
  extraOilPerQuart:8.00,
  salesTaxRate:0,
  travelBaseMiles:10,
  travelIncludedFee:10.00,
  travelPerMileAfterBase:0.75
};
const AUTOMOTIVE={
 oil:{labor:30,parts:32,minutes:45},
 wipers:{labor:20,parts:35,minutes:20},
 battery:{labor:35,parts:160,minutes:35},
 jump:{labor:35,parts:0,minutes:20},
 tire:{labor:25,parts:0,minutes:20},
 'tire-replacement':{labor:35,parts:125,minutes:45},
 air:{labor:25,parts:35,minutes:25},
 cabin:{labor:25,parts:35,minutes:25},
 headlight:{labor:65,parts:150,minutes:60},
 'brake-light':{labor:45,parts:80,minutes:40},
 fluid:{labor:25,parts:15,minutes:20}
};
const LAWN={
 'lawn-mowing':{labor:45,minutes:60,materials:2},
 'weed-removal':{labor:50,minutes:60,materials:3},
 'mulch-installation':{labor:55,minutes:60,materials:55},
 'decorative-rock':{labor:60,minutes:60,materials:65},
 'yard-cleanup':{labor:75,minutes:90,materials:5},
 'trimming-edging':{labor:35,minutes:45,materials:1},
 'seasonal-yard-cleanup':{labor:150,minutes:180,materials:8},
 'property-maintenance':{labor:60,minutes:60,materials:3}
};
const $=id=>document.getElementById(id);
const val=id=>$(id)?String($(id).value||'').trim():'';
function isLawn(s){return !!LAWN[s]}
function choices(){return [...document.querySelectorAll('input[name="specialChoice"]:checked')].map(x=>x.value)}
function travelCost(){return CONFIG.travelIncludedFee}
function internalCost(service,mode,parts,minutes){
 const hours=Math.max(minutes/60,0.25);
 const wage=mode==='employee'?CONFIG.employeeHourly*(1+CONFIG.employerBurdenRate):CONFIG.ownerHourly;
 return wage*hours+parts+CONFIG.equipmentOverheadPerLaborHour*hours+CONFIG.businessOverheadPerJob+travelCost();
}
function priceFromCost(cost){return Math.max(cost+10, cost/(1-CONFIG.targetProfitMargin));}
function automotiveEstimate(s){
 let base=AUTOMOTIVE[s]||{labor:30,parts:0,minutes:30}, labor=base.labor, parts=base.parts, minutes=base.minutes;
 const c=choices();
 if(s==='wipers'){const n=c.includes('All wipers')?4:Math.max(c.length,1);labor=20*n;parts=35*n;minutes=20*n;}
 if(s==='tire-replacement'){const n=parseInt(c[0]||'1',10);labor=35*n;parts=125*n;minutes=45*n;}
 if(s==='headlight'||s==='brake-light'){const n=(c[0]==='Both'||c[0]==='Two')?2:1;labor=base.labor*n;parts=base.parts*n;minutes=base.minutes*n;}
 if(s==='fluid'){parts=15*Math.max(c.length,1);}
 const currentParts=parts;
 const cost=internalCost(s,'employee',currentParts,minutes);
 const total=priceFromCost(cost);
 return {labor,parts,total,minutes,cost,profit:total-cost};
}
function lawnEstimate(s){
 const b=LAWN[s];
 if(!b)return null;
 const cost=internalCost(s,'employee',b.materials,b.minutes);
 const total=priceFromCost(cost);
 const labor=Math.max(b.labor,total-b.materials-travelCost());
 return {labor,parts:b.materials,total,minutes:b.minutes,cost,profit:total-cost};
}
function override(){
 const old=window.calculateEstimate;
 window.calculateEstimate=function(){
  const s=val('service');
  if(!s){alert('Please select a service first.');return;}
  let e=isLawn(s)?lawnEstimate(s):automotiveEstimate(s);
  if(!e){if(old)return old();return;}
  if($('laborPrice'))$('laborPrice').textContent='$'+e.labor.toFixed(2);
  if($('partsPrice'))$('partsPrice').textContent='$'+e.parts.toFixed(2);
  if($('totalPrice'))$('totalPrice').textContent='$'+e.total.toFixed(2);
  $('estimate')?.classList.add('open');
  if(typeof setStep==='function')setStep(3);
  $('estimate')?.scrollIntoView({behavior:'smooth'});
 };
 window.DASH_PRICING={CONFIG,AUTOMOTIVE,LAWN,estimate:s=>isLawn(s)?lawnEstimate(s):automotiveEstimate(s)};
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',override);else override();
})();
