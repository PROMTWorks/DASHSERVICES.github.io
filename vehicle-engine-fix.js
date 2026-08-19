/* DASH VEHICLE SELECTOR FIX v5
   Final, network-independent selector controller.
   The booking page must always expose Make after Year and Model after Make.
*/
(function(){
'use strict';
const MAKES=['Acura','Alfa Romeo','American Motors','Aston Martin','Audi','Avanti','Austin','Autocar','Bentley','BMW','Buick','Cadillac','Checker','Chevrolet','Chrysler','Daewoo','Daihatsu','Datsun','DeLorean','Dodge','Eagle','Edsel','Ferrari','FIAT','Fisker','Ford','Freightliner','Genesis','Geo','GMC','Honda','Hummer','Hyundai','INEOS','INFINITI','International','Isuzu','Jaguar','Jeep','Karma','Kia','Lamborghini','Land Rover','Lexus','Lincoln','Lucid','Mack','Maserati','Maybach','Mazda','McLaren','Mercedes-Benz','Mercury','Merkur','MG','MINI','Mitsubishi','Nissan','Oldsmobile','Opel','Packard','Panoz','Peterbilt','Plymouth','Polestar','Pontiac','Porsche','RAM','Rivian','Rolls-Royce','Rover','Saab','Saturn','Scion','Shelby','Smart','Sterling','Studebaker','Subaru','Suzuki','Tesla','Thomas','Toyota','UD','Volkswagen','Volvo','Western Star','Willys','Workhorse'];
function get(id){return document.getElementById(id)}
function unique(values){return [...new Set((values||[]).filter(Boolean).map(String))].sort((a,b)=>a.localeCompare(b))}
function fill(select,placeholder,values,disabled){if(!select)return;select.innerHTML='';select.appendChild(new Option(placeholder,''));unique(values).forEach(v=>select.appendChild(new Option(v,v)));select.disabled=!!disabled;select.hidden=false;select.style.display='';select.removeAttribute('aria-hidden');select.removeAttribute('aria-disabled')}
async function nhtsaModels(make,year){try{const r=await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/'+encodeURIComponent(make)+'/modelyear/'+encodeURIComponent(year)+'?format=json',{cache:'no-store'});if(!r.ok)return[];const d=await r.json();return(d.Results||[]).map(x=>x.Model_Name||x.ModelName).filter(Boolean)}catch(e){return[]}}
function setup(){
 const year=get('year'),make=get('make'),model=get('model'),engine=get('engine'),trim=get('trim');
 if(!year||!make||!model||!engine||!trim)return false;
 year.disabled=false;
 // Make is deliberately available immediately, so a failed API cannot make the customer stuck.
 fill(make,'Select make',MAKES,false);
 fill(model,'Select model / choose manual entry',[],false);
 model.appendChild(new Option('Manual model entry','__manual__'));
 fill(engine,'Select engine / choose manual entry',[],false);
 engine.appendChild(new Option('Manual engine entry','__manual__'));
 fill(trim,'Select trim / choose manual entry',[],false);
 trim.appendChild(new Option('Manual trim entry','__manual__'));
 function onYear(){
   if(!year.value){fill(make,'Select make',MAKES,false);fill(model,'Select model / choose manual entry',[],false);model.appendChild(new Option('Manual model entry','__manual__'));return;}
   // Never wait for NHTSA to populate Make.
   fill(make,'Select make',MAKES,false);
   fill(model,'Select model / choose manual entry',[],false);model.appendChild(new Option('Manual model entry','__manual__'));
   fill(engine,'Select engine / choose manual entry',[],false);engine.appendChild(new Option('Manual engine entry','__manual__'));
   fill(trim,'Select trim / choose manual entry',[],false);trim.appendChild(new Option('Manual trim entry','__manual__'));
 }
 function onMake(){
   if(!year.value||!make.value)return;
   const y=year.value,m=make.value;
   fill(model,'Loading models...',[],true);
   nhtsaModels(m,y).then(list=>{if(year.value!==y||make.value!==m)return;fill(model,list.length?'Select model':'Select model / manual entry',list,false);model.appendChild(new Option('Manual model entry','__manual__'));});
   setTimeout(()=>{if(year.value===y&&make.value===m&&model.disabled){fill(model,'Select model / manual entry',[],false);model.appendChild(new Option('Manual model entry','__manual__'));}},800);
 }
 function onModel(){if(!model.value)return;fill(engine,'Select engine / manual entry',[],false);engine.appendChild(new Option('Manual engine entry','__manual__'));fill(trim,'Select trim / manual entry',[],false);trim.appendChild(new Option('Manual trim entry','__manual__'));}
 // Capture listeners run before legacy bubble listeners.
 year.addEventListener('change',onYear,true);
 make.addEventListener('change',onMake,true);
 model.addEventListener('change',onModel,true);
 // Protect against legacy scripts changing disabled/hidden state after our handlers run.
 const repair=()=>{
   [make,model,engine,trim].forEach(s=>{s.hidden=false;s.style.display='';s.removeAttribute('aria-hidden')});
   if(year.value){make.disabled=false;if(make.options.length<=1)fill(make,'Select make',MAKES,false)}
   if(make.value){model.disabled=false;if(model.options.length<=1){fill(model,'Select model / manual entry',[],false);model.appendChild(new Option('Manual model entry','__manual__'))}}
 };
 new MutationObserver(repair).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden','style','aria-hidden']});
 setInterval(repair,250);
 repair();
 if(year.value)onYear();
 return true;
}
function boot(){if(!setup())setTimeout(boot,100)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
