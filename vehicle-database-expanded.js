/* DASH VEHICLE SELECTOR v12
   Keeps the existing broad makes/engine/trim system.
   Model expansion is now additive: every model in the selected make's
   versioned vehicle dataset is shown, rather than dropping older/newer
   models because of the currently selected year. Year remains available
   for the booking record and Engine/Trim data still use year-aware records.
   No NHTSA/vPIC/SafetyRatings dependency.
*/
(function(){
'use strict';
const BRAND_INDEX='https://raw.githubusercontent.com/Dazmac-PTY-LTD/car-data-specifications/main/data/brands_index.json';
const BRAND_BASE='https://raw.githubusercontent.com/Dazmac-PTY-LTD/car-data-specifications/main/data/brands/';
const STYLE_CSV='https://raw.githubusercontent.com/plowman/open-vehicle-db/master/data/styles.csv';
const LOCAL=()=>window.DASH_VEHICLE_CATALOG&&window.DASH_VEHICLE_CATALOG.CATALOG||{};
const cache={brands:null,brandFiles:new Map(),styles:null,stylePromise:null};
const norm=v=>String(v||'').trim().toLowerCase().replace(/[._-]+/g,' ').replace(/\s+/g,' ');
const unique=a=>[...new Set((a||[]).filter(Boolean).map(v=>String(v).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
const get=id=>document.getElementById(id);
function fill(el,prompt,values=[],disabled=false){if(!el)return;el.innerHTML='';el.add(new Option(prompt,''));unique(values).forEach(v=>el.add(new Option(v,v)));el.disabled=disabled;el.hidden=false;el.style.display='';el.removeAttribute('aria-hidden');el.removeAttribute('aria-disabled');}
function years(){let a=[],max=new Date().getFullYear()+1;for(let y=max;y>=1900;y--)a.push(String(y));return a;}
function localModels(make){return unique(Object.keys(LOCAL()).filter(k=>norm(k.split('|')[0])===norm(make)).map(k=>k.split('|').slice(1).join('|')))}
function localEntry(make,model){const key=norm(make)+'|'+norm(model);const k=Object.keys(LOCAL()).find(x=>norm(x.split('|')[0])+'|'+norm(x.split('|').slice(1).join('|'))===key);return k?LOCAL()[k]:null}
async function loadBrands(){if(cache.brands)return cache.brands;try{const r=await fetch(BRAND_INDEX,{cache:'force-cache'});if(!r.ok)throw Error('brand index '+r.status);cache.brands=await r.json();return cache.brands}catch(e){console.warn('DASH broad vehicle index unavailable; using local catalog.',e);cache.brands=[];return cache.brands}}
function brandFileName(name){return String(name).replace(/\//g,'-').replace(/ /g,'_')+'.json'}
async function loadBrand(name){if(cache.brandFiles.has(name))return cache.brandFiles.get(name);const p=fetch(BRAND_BASE+encodeURIComponent(brandFileName(name)),{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);cache.brandFiles.set(name,p);return p}
function inYear(mod,gen,year){const y=Number(year);const a=Number(mod&&mod.yearstart)||Number(gen&&gen.modelYear)||0;const b=Number(mod&&mod.yearstop)||9999;return !y||((!a||y>=a)&&y<=b)}
function extractAllModels(brand){return unique((((brand||{}).models||{}).model||[]).map(m=>m.name))}
function extractVehicleData(brand,model,year){const engines=[],generations=[];for(const m of (((brand||{}).models||{}).model||[])){if(norm(m.name)!==norm(model))continue;for(const g of (((m.generations||{}).generation)||[])){let genUsed=false;for(const mod of (((g.modifications||{}).modification)||[])){if(!inYear(mod,g,year))continue;if(mod.engine)engines.push(mod.engine);genUsed=true}if(genUsed&&g.name)generations.push(g.name)}}return {engines:unique(engines),generations:unique(generations)}}
function parseCSV(text){const rows=[];let row=[],field='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i],n=text[i+1];if(c==='"'){if(quoted&&n==='"'){field+='"';i++}else quoted=!quoted}else if(c===','&&!quoted){row.push(field);field=''}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&n==='\n')i++;row.push(field);if(row.some(Boolean))rows.push(row);row=[];field=''}else field+=c}if(field||row.length){row.push(field);rows.push(row)}return rows}
async function loadStyles(){if(cache.styles)return cache.styles;if(cache.stylePromise)return cache.stylePromise;cache.stylePromise=fetch(STYLE_CSV,{cache:'force-cache'}).then(r=>r.ok?r.text():'').then(t=>{const rows=parseCSV(t),h=rows.shift()||[],ix=Object.fromEntries(h.map((x,i)=>[x,i]));cache.styles=rows.map(r=>({make:r[ix.make_slug]||'',model:r[ix.model_slug]||'',name:r[ix.style_name]||'',years:r[ix.years]||''}));return cache.styles}).catch(()=>{cache.styles=[];return cache.styles});return cache.stylePromise}
function slug(v){return norm(v).replace(/\s+/g,'_')}
function styleActive(text,year){if(!year)return true;return String(text||'').split(',').some(part=>{const s=part.trim();if(!s)return false;if(s.includes('-')){const [a,b]=s.split('-').map(Number);return year>=a&&year<=b}return Number(s)===year})}
async function realData(make,model,year){const local=localEntry(make,model)||{};const brand=await loadBrand(make);const d=extractVehicleData(brand,model,year);const styles=await loadStyles();const sm=slug(make),smo=slug(model);const trims=styles.filter(x=>x.make===sm&&x.model===smo&&styleActive(x.years,Number(year))).map(x=>x.name);return {trims:unique([...(local.trims||[]),...trims,...d.generations]),engines:unique([...(local.engines||[]),...d.engines])}}
async function init(){const year=get('year'),make=get('make'),model=get('model'),trim=get('trim'),engine=get('engine');if(!year||!make||!model||!trim||!engine||year.dataset.dashVehicleInit==='broad-v12')return;if(window.__DASH_BROAD_V12_INIT)return;window.__DASH_BROAD_V12_INIT=true;year.dataset.dashVehicleInit='broad-v12';
const brands=await loadBrands();const makeNames=unique([...brands.map(b=>b.name),...Object.keys(LOCAL()).map(k=>k.split('|')[0])]);
fill(year,'Select year',years(),false);fill(make,'Select make',makeNames,false);fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true);
year.addEventListener('change',()=>{fill(make,'Select make',makeNames,false);fill(model,'Select model',[],true);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true)});
make.addEventListener('change',async()=>{const b=await loadBrand(make.value);let ms=extractAllModels(b);if(!ms.length)ms=localModels(make.value);fill(model,'Select model',ms,false);fill(trim,'Select trim',[],true);fill(engine,'Select engine',[],true)});
model.addEventListener('change',async()=>{if(!model.value)return;fill(trim,'Loading trims/styles...',[],true);fill(engine,'Loading engines...',[],true);const d=await realData(make.value,model.value,year.value);fill(trim,d.trims.length?'Select trim':'No trim/style data available',d.trims,false);fill(engine,d.engines.length?'Select engine':'No engine data available',d.engines,false)});
const repair=()=>{[year,make,model,trim,engine].forEach(x=>{x.hidden=false;x.style.display='';x.removeAttribute('aria-hidden')})};new MutationObserver(repair).observe(document.body,{subtree:true,attributes:true,attributeFilter:['disabled','hidden','style','aria-hidden']});setInterval(repair,1000);repair();window.PROMT_VEHICLE_DATABASE={name:'DASH Broad Vehicle Database',source:'GitHub public datasets + DASH local catalog',externalVehicleApis:false,modelCoverage:'All models supplied by the selected make dataset; model list is not year-filtered',coverage:{brands:brands.length,models:'3,885+ catalog models',specifications:'56,885+ engine/spec records',styles:'9,960+ style/trim records'}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
