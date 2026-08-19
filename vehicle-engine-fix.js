/* DASH VEHICLE SELECTOR FIX v4
   Self-contained selector. Make is populated locally immediately; model can use NHTSA
   when available, with a manual fallback. Engine and trim are always selectable after model.
*/
(function(){
'use strict';
const MAKES=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
function el(id){return document.getElementById(id)}
function opts(node,placeholder,values,disabled){if(!node)return;node.innerHTML='';node.add(new Option(placeholder,''));[...new Set((values||[]).filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b)).forEach(v=>node.add(new Option(v,v)));node.disabled=!!disabled;node.removeAttribute('aria-disabled');node.style.display='';}
async function getModels(make,year){try{const u='https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/'+encodeURIComponent(make)+'/modelyear/'+encodeURIComponent(year)+'?format=json';const r=await fetch(u,{cache:'no-store'});if(!r.ok)throw new Error('model lookup failed');const d=await r.json();return (d.Results||[]).map(x=>x.Model_Name||x.ModelName).filter(Boolean)}catch(e){return []}}
function setup(){
 const y=el('year'),m=el('make'),mo=el('model'),eng=el('engine'),tr=el('trim');
 if(!y||!m||!mo||!eng||!tr)return false;
 // Remove any stale disabled state left by previous selector scripts.
 y.disabled=false;
 opts(m,'Select make',[],true);opts(mo,'Select model',[],true);opts(eng,'Select engine',[],true);opts(tr,'Select trim',[],true);
 // Use one controlled set of handlers. onchange replaces prior property handlers but leaves other listeners harmless.
 y.onchange=function(){
   if(!y.value){opts(m,'Select make',[],true);opts(mo,'Select model',[],true);opts(eng,'Select engine',[],true);opts(tr,'Select trim',[],true);return;}
   // IMPORTANT: populate Make immediately. Do not wait for a network call.
   opts(m,'Select make',MAKES,false);
   opts(mo,'Select model',[],true);opts(eng,'Select engine',[],true);opts(tr,'Select trim',[],true);
 };
 m.onchange=function(){
   if(!m.value){opts(mo,'Select model',[],true);opts(eng,'Select engine',[],true);opts(tr,'Select trim',[],true);return;}
   const selectedYear=y.value;
   opts(mo,'Loading models...',[],true);opts(eng,'Select engine',[],true);opts(tr,'Select trim',[],true);
   getModels(m.value,selectedYear).then(function(models){
     opts(mo,models.length?'Select model':'Model not listed — select manual entry',models,false);
     mo.add(new Option('Manual model entry','__manual__'));
   });
   // Network-independent fallback: allow the customer to select manual model immediately.
   setTimeout(function(){if(mo.disabled){opts(mo,'Select model',[],false);mo.add(new Option('Manual model entry','__manual__'));}},1200);
 };
 mo.onchange=function(){
   if(!mo.value)return;
   opts(eng,'Select engine',[],false);eng.add(new Option('I know my engine — manual entry','__manual__'));
   opts(tr,'Select trim',[],false);tr.add(new Option('I know my trim — manual entry','__manual__'));
 };
 // Keep the selectors visible/enabled if another legacy script changes their state.
 const keep=function(){
   [m,mo,eng,tr].forEach(function(x){if(x)x.style.display='';});
   if(y.value && m.options.length<=1)opts(m,'Select make',MAKES,false);
 };
 setInterval(keep,500);
 return true;
}
function boot(){if(!setup())return setTimeout(boot,100);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
