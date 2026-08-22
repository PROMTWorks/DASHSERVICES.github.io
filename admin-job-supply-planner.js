(() => {
  'use strict';
  if (window.__dashSupplyPlannerLoaded) return;
  window.__dashSupplyPlannerLoaded = true;
  const sectionId='job-operations';
  const style=document.createElement('style');
  style.textContent='#dashSupplyPlanner{margin-top:20px}.dashSupplyGrid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.dashSupplyCard{border:1px solid #e2e7ed;border-radius:10px;padding:14px;background:#fff}.dashSupplyCard h3{margin:0 0 10px}.dashSupplyCard label{display:block;font-size:12px;font-weight:700;margin:9px 0 5px}.dashSupplyCard input,.dashSupplyCard select{width:100%;box-sizing:border-box;padding:9px;border:1px solid #ccd4de;border-radius:7px}.dashSupplyResult{display:grid;gap:8px}.dashSupplyBuy{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:9px;padding:13px;font-size:17px;font-weight:800}.dashSupplyProfit{font-size:22px;font-weight:800}@media(max-width:800px){.dashSupplyGrid{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const defs={
    mowing:{title:'Lawn Mowing',fields:[['area','Grass area (sq. ft.)','number','5000'],['fuel','Fuel / equipment cost','$','15'],['price','Customer price','$','60']],calc:v=>({buy:`Prepare mower, trimmer, edger and blower; estimated fuel: ${Math.max(1,Math.ceil(v.area/10000*2))} gal.`,cost:v.fuel})},
    cleanup:{title:'Property Cleanup',fields:[['bags','Contractor bags needed','number','10'],['bagCost','Price per contractor bag','$','1.00'],['disposal','Disposal / dump cost','$','0'],['price','Customer price','$','300']],calc:v=>({buy:`Buy ${Math.ceil(v.bags)} contractor bags.`,cost:v.bags*v.bagCost+v.disposal})},
    hauling:{title:'Hauling',fields:[['load','Estimated load (cu. yd.)','number','6'],['bags','Contractor bags','number','10'],['disposal','Disposal / dump cost','$','0'],['fuel','Fuel / vehicle cost','$','25'],['price','Customer price','$','350']],calc:v=>({buy:`Plan truck/trailer capacity for ${v.load.toFixed(1)} cu. yd. and carry ${Math.ceil(v.bags)} contractor bags.`,cost:v.disposal+v.fuel})},
    custom:{title:'Custom Job',fields:[['supplies','Supplies to buy','text','Enter supply list'],['material','Material cost','$','0'],['price','Customer price','$','0']],calc:v=>({buy:v.supplies||'Enter the supplies needed.',cost:v.material})}
  };
  const money=n=>'$'+(Number(n)||0).toFixed(2);
  function init(){
    const section=document.getElementById(sectionId); const service=document.getElementById('dashJobService');
    if(!section||!service||document.getElementById('dashSupplyPlanner'))return;
    const panel=document.createElement('div'); panel.id='dashSupplyPlanner'; panel.className='panel';
    panel.innerHTML='<div class="head"><h2>Supply Planner</h2><span class="mini">Owner-only</span></div><div class="body"><div class="dashSupplyGrid"><div class="dashSupplyCard"><h3>What is needed?</h3><div id="dashSupplyFields"></div><label>Overall business-expense allocation</label><input id="dashSupplyOverhead" type="number" min="0" step=".01" value="50"><button class="btn" id="dashSupplyCalc" style="margin-top:12px">Calculate Supplies & Profit</button></div><div class="dashSupplyCard"><h3>Job Result</h3><div id="dashSupplyResult" class="dashSupplyResult"><div class="mini">Enter the job information and calculate.</div></div></div></div></div>';
    section.appendChild(panel);
    const fields=document.getElementById('dashSupplyFields');
    function renderFields(){const d=defs[service.value]||defs.custom;fields.innerHTML=d.fields.map(f=>`<label>${f[1]}</label><input id="supply_${f[0]}" type="${f[2]==='text'?'text':'number'}" ${f[2]==='number'||f[2]==='$'?'min="0" step=".01"':''} value="${f[3]}">`).join('');}
    function calc(){const d=defs[service.value]||defs.custom;const v={};d.fields.forEach(f=>v[f[0]]=f[2]==='text'?String(document.getElementById('supply_'+f[0]).value||''):Number(document.getElementById('supply_'+f[0]).value)||0);const r=d.calc(v);const price=Number(document.getElementById('supply_price')?.value)||Number(document.getElementById('dashCustomerPrice')?.value)||0;const overhead=Number(document.getElementById('dashSupplyOverhead').value)||0;const profit=Math.max(0,price-r.cost-overhead);document.getElementById('dashSupplyResult').innerHTML=`<div class="dashSupplyBuy">BUY / PREPARE<br><span>${r.buy}</span></div><div>Customer pays: <b>${money(price)}</b></div><div>Job/supply costs: <b>${money(r.cost)}</b></div><div>Overall business expenses: <b>${money(overhead)}</b></div><div>Company profit: <b class="dashSupplyProfit">${money(profit)}</b></div>`;}
    service.addEventListener('change',renderFields); document.getElementById('dashSupplyCalc').onclick=calc; renderFields();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();