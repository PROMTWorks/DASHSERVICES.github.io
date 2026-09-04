/* DASH targeted Get Estimate repair. Loaded last so earlier booking scripts cannot override the button. */
(function(){
  'use strict';
  function el(id){return document.getElementById(id);}
  function value(id){var e=el(id);return e?String(e.value||'').trim():'';}
  function choices(){return Array.from(document.querySelectorAll('input[name="specialChoice"]:checked')).map(function(x){return String(x.value||'');});}
  function showEstimate(){
    var service=value('service');
    if(!service){alert('Please select a service first.');return;}
    var isLawn=['lawn-mowing','weed-removal','mulch-installation','decorative-rock','yard-cleanup','trimming-edging','seasonal-yard-cleanup','property-maintenance'].indexOf(service)>=0;
    var isCleaning=service==='house-cleaning';
    if(!isLawn&&!isCleaning){
      var required=['year','make','model','engine','trim'];
      for(var i=0;i<required.length;i++){if(!value(required[i])){alert('Please complete the vehicle information before getting an estimate.');el(required[i])?.focus();return;}}
    }
    try{
      var result=window.DASH_PRICING&&typeof window.DASH_PRICING.estimate==='function'?window.DASH_PRICING.estimate(service):null;
      if(!result){
        var base={oil:[39,0,45],wipers:[25,35,20],battery:[45,140,35],jump:[45,0,20],tire:[25,0,20],'tire-replacement':[35,125,45],air:[25,35,25],cabin:[25,35,25],headlight:[65,150,60],'brake-light':[45,80,40],fluid:[25,15,20]};
        if(!base[service]){alert('The estimate system is still loading. Please try again in a moment.');return;}
        var b=base[service], c=choices(), labor=b[0],parts=b[1],minutes=b[2];
        if(service==='wipers'){var n=c.includes('All wipers')?4:Math.max(c.length,1);labor=25*n;parts=35*n;minutes=20*n;}
        if(service==='tire-replacement'){var q=Math.max(parseInt(c[0]||'1',10)||1,1);labor=35*q;parts=125*q;minutes=45*q;}
        if(service==='headlight'||service==='brake-light'){var qty=(c[0]==='Both'||c[0]==='Two'||c[0]==='2 headlights'||c[0]==='2 lights')?2:1;labor=b[0]*qty;parts=b[1]*qty;minutes=b[2]*qty;}
        if(service==='fluid')parts=15*Math.max(c.length,1);
        var hours=Math.max(minutes/60,.25),cost=10*1.15*hours+parts+4*hours+3+10,total=Math.max(cost+10,cost/.75);
        result={labor:Math.max(10,total-parts-10),parts:parts,total:total,startingAt:0};
      }
      if(el('laborPrice'))el('laborPrice').textContent='$'+Number(result.labor||result.total||0).toFixed(2);
      if(el('partsPrice'))el('partsPrice').textContent='$'+Number(result.parts||0).toFixed(2);
      if(el('totalPrice'))el('totalPrice').textContent='$'+Number(result.total||0).toFixed(2);
      var estimate=el('estimate');
      if(estimate){estimate.classList.add('open');var badge=el('startingAtPrice');if(badge)badge.textContent=result.startingAt?'Starting at $'+Number(result.startingAt).toFixed(2)+' • Final estimate based on your selections':'Estimate based on your selections';estimate.scrollIntoView({behavior:'smooth',block:'start'});}
      if(typeof window.setStep==='function')window.setStep(3);else for(var p=1;p<=5;p++){var step=el('p'+p);if(step)step.classList.toggle('active',p===3);}
    }catch(err){console.error('DASH Get Estimate error:',err);alert('We could not calculate the estimate. Please refresh the page and try again.');}
  }
  function install(){
    var button=document.querySelector('#booking > button.continue');
    if(!button)return false;
    button.type='button';
    button.removeAttribute('onclick');
    button.onclick=function(e){if(e){e.preventDefault();e.stopPropagation();}showEstimate();};
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(install,0);});else setTimeout(install,0);
  window.DASH_FINAL_GET_ESTIMATE=showEstimate;
})();