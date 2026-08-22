(() => {
  'use strict';
  if (window.__dashJobOpsLoaded) return;
  window.__dashJobOpsLoaded = true;

  const STYLE_ID = 'dash-job-ops-style';
  const SECTION_ID = 'job-operations';

  function esc(value) {
    return String(value ?? '').replace(/[&<>\"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[ch]));
  }
  function money(value) { return '$' + (Number(value) || 0).toFixed(2); }
  function num(value) { return Math.max(0, Number(value) || 0); }
  function roundUp(value, step) { return step > 0 ? Math.ceil(value / step) * step : Math.ceil(value); }

  function injectStyles(doc) {
    if (doc.getElementById(STYLE_ID)) return;
    const style = doc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${SECTION_ID} .jobops-grid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}
      #${SECTION_ID} .jobops-card{background:#fff;border:1px solid #e2e7ed;border-radius:12px;padding:18px}
      #${SECTION_ID} .jobops-card h3{margin:0 0 14px;font-size:16px}
      #${SECTION_ID} .jobops-form{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      #${SECTION_ID} .jobops-full{grid-column:1/-1}
      #${SECTION_ID} label{display:block;font-size:12px;font-weight:700;margin-bottom:6px}
      #${SECTION_ID} input,#${SECTION_ID} select,#${SECTION_ID} textarea{width:100%;padding:10px;border:1px solid #ccd4de;border-radius:7px;background:#fff;box-sizing:border-box}
      #${SECTION_ID} textarea{min-height:78px;resize:vertical}
      #${SECTION_ID} .jobops-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
      #${SECTION_ID} .jobops-result{display:grid;gap:10px}
      #${SECTION_ID} .jobops-line{display:flex;justify-content:space-between;gap:12px;border-bottom:1px solid #eef2f6;padding:8px 0;font-size:13px}
      #${SECTION_ID} .jobops-line:last-child{border-bottom:0}
      #${SECTION_ID} .jobops-profit{font-size:22px;font-weight:800}
      #${SECTION_ID} .jobops-buy{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;margin-bottom:14px}
      #${SECTION_ID} .jobops-warning{background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:12px;font-size:12px;margin-bottom:14px}
      #${SECTION_ID} .jobops-list{display:grid;gap:9px}
      #${SECTION_ID} .jobops-job{border:1px solid #e2e7ed;border-radius:9px;padding:13px;display:flex;justify-content:space-between;gap:12px;align-items:center}
      #${SECTION_ID} .jobops-job strong{display:block;margin-bottom:4px}
      @media(max-width:900px){#${SECTION_ID} .jobops-grid{grid-template-columns:1fr}.jobops-form{grid-template-columns:1fr!important}}
    `;
    doc.head.appendChild(style);
  }

  function createSection(doc) {
    if (doc.getElementById(SECTION_ID)) return doc.getElementById(SECTION_ID);
    const main = doc.querySelector('main');
    if (!main) return null;
    const section = doc.createElement('section');
    section.id = SECTION_ID;
    section.className = 'section';
    section.innerHTML = `
      <div class="title"><div><h1>Job Operations</h1><p>Owner-only job details, supply planning, and job profitability.</p></div></div>
      <div class="notice"><b>Solo-owner workflow:</b> Enter or review a job once. DASH calculates the shopping list, service-location details, business-expense allocation, and estimated company profit. This section is added only to the Super Admin portal.</div>
      <div class="jobops-grid">
        <div class="jobops-card">
          <h3>Job Details</h3>
          <div class="jobops-form">
            <div><label>Job / Customer</label><input id="dashJobName" placeholder="e.g. Smith residence"></div>
            <div><label>Service</label><select id="dashJobService"><option value="mulch">Mulch Installation</option><option value="mowing">Lawn Mowing</option><option value="cleanup">Property Cleanup</option><option value="hauling">Hauling</option><option value="custom">Custom Job</option></select></div>
            <div><label>Service address</label><input id="dashJobAddress" placeholder="Street address, city, SC ZIP"></div>
            <div><label>Customer phone</label><input id="dashJobPhone" placeholder="Phone number"></div>
            <div><label>Service date</label><input id="dashJobDate" type="date"></div>
            <div><label>Access / location notes</label><input id="dashJobAccess" placeholder="Gate, driveway, side yard, etc."></div>
            <div id="dashMulchFields" class="jobops-full">
              <div class="jobops-form">
                <div><label>Bed area (sq. ft.)</label><input id="dashMulchArea" type="number" min="0" step="1" placeholder="600"></div>
                <div><label>Mulch depth (inches)</label><input id="dashMulchDepth" type="number" min="0" step="0.5" value="2"></div>
                <div><label>Mulch type</label><select id="dashMulchType"><option>Pine Bark</option><option>Hardwood</option><option>Brown</option><option>Black</option><option>Red</option><option>Other</option></select></div>
                <div><label>Bag size (cu. ft.)</label><input id="dashBagSize" type="number" min="0.1" step="0.1" value="2"></div>
                <div><label>Price per bag</label><input id="dashBagCost" type="number" min="0" step="0.01" value="5.50"></div>
                <div><label>Customer price</label><input id="dashCustomerPrice" type="number" min="0" step="0.01" value="425"></div>
              </div>
            </div>
            <div><label>Other job costs</label><input id="dashOtherCosts" type="number" min="0" step="0.01" value="0"></div>
            <div><label>Labor / owner time cost</label><input id="dashLaborCost" type="number" min="0" step="0.01" value="0"></div>
            <div><label>Fuel / vehicle cost</label><input id="dashFuelCost" type="number" min="0" step="0.01" value="0"></div>
            <div><label>Overall business-expense allocation</label><input id="dashOverhead" type="number" min="0" step="0.01" value="50"></div>
            <div class="jobops-full"><label>Job notes / customer instructions</label><textarea id="dashJobNotes" placeholder="Anything you need to remember at the property."></textarea></div>
          </div>
          <div class="jobops-actions"><button class="btn" id="dashCalculateJob">Calculate Job</button><button class="btn light" id="dashSaveJob">Save Job</button></div>
        </div>

        <div class="jobops-card">
          <h3>Go To The Job</h3>
          <div id="dashJobSummary" class="jobops-result"><div class="empty"><strong>No job calculated</strong>Enter the job details and click Calculate Job.</div></div>
        </div>
      </div>
      <div class="panel" style="margin-top:20px"><div class="head"><h2>Saved Jobs</h2><span class="mini">Owner-only</span></div><div class="body"><div id="dashSavedJobs" class="jobops-list"></div></div></div>
    `;
    main.appendChild(section);
    return section;
  }

  function getEl(doc,id){ return doc.getElementById(id); }
  function calculate(doc) {
    const service = getEl(doc,'dashJobService').value;
    const area = num(getEl(doc,'dashMulchArea').value);
    const depth = num(getEl(doc,'dashMulchDepth').value) || 2;
    const bagSize = num(getEl(doc,'dashBagSize').value) || 2;
    const bagCost = num(getEl(doc,'dashBagCost').value);
    const price = num(getEl(doc,'dashCustomerPrice').value);
    const other = num(getEl(doc,'dashOtherCosts').value);
    const labor = num(getEl(doc,'dashLaborCost').value);
    const fuel = num(getEl(doc,'dashFuelCost').value);
    const overhead = num(getEl(doc,'dashOverhead').value);
    let supplies = 'No automatic supply calculation for this service yet.';
    let materialCost = 0;
    let bagCount = 0;
    let mulchYards = 0;
    if(service === 'mulch') {
      mulchYards = area * (depth / 12) / 27;
      const cubicFeet = area * (depth / 12);
      bagCount = roundUp(cubicFeet / bagSize, 1);
      materialCost = bagCount * bagCost;
      supplies = `Buy <b>${bagCount}</b> bags of <b>${esc(getEl(doc,'dashMulchType').value)}</b> mulch (${bagSize} cu. ft. bags). Estimated requirement: ${mulchYards.toFixed(2)} cubic yards.`;
    }
    const jobCosts = materialCost + labor + fuel + other;
    const companyProfit = Math.max(0, price - jobCosts - overhead);
    const margin = price > 0 ? (companyProfit / price) * 100 : 0;
    return {service,area,depth,bagSize,bagCost,price,other,labor,fuel,overhead,materialCost,jobCosts,companyProfit,margin,bagCount,mulchYards,supplies};
  }

  function renderSummary(doc, calc) {
    const address = getEl(doc,'dashJobAddress').value.trim();
    const name = getEl(doc,'dashJobName').value.trim() || 'Unnamed job';
    const phone = getEl(doc,'dashJobPhone').value.trim();
    const notes = getEl(doc,'dashJobNotes').value.trim();
    const access = getEl(doc,'dashJobAccess').value.trim();
    const date = getEl(doc,'dashJobDate').value;
    const maps = address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : '#';
    getEl(doc,'dashJobSummary').innerHTML = `
      <div class="jobops-buy"><b>BUY</b><div style="font-size:18px;font-weight:800;margin-top:6px">${calc.supplies}</div></div>
      <div class="jobops-line"><span>Customer pays</span><b>${money(calc.price)}</b></div>
      <div class="jobops-line"><span>Job costs</span><b>${money(calc.jobCosts)}</b></div>
      <div class="jobops-line"><span>Overall business expenses</span><b>${money(calc.overhead)}</b></div>
      <div class="jobops-line"><span>Company profit</span><b class="jobops-profit">${money(calc.companyProfit)}</b></div>
      <div class="jobops-line"><span>Estimated company margin</span><b>${calc.margin.toFixed(1)}%</b></div>
      <div class="jobops-card" style="padding:12px;background:#f8fafc"><b>Service location</b><div style="margin-top:6px">${esc(address || 'No address entered')}</div>${phone?`<div style="margin-top:4px">Phone: ${esc(phone)}</div>`:''}${date?`<div style="margin-top:4px">Date: ${esc(date)}</div>`:''}${access?`<div style="margin-top:4px">Access: ${esc(access)}</div>`:''}${notes?`<div style="margin-top:4px">Notes: ${esc(notes)}</div>`:''}${address?`<div class="jobops-actions"><a class="btn" href="${maps}" target="_blank" rel="noopener">Open in Google Maps</a></div>`:''}</div>
    `;
    return calc;
  }

  function saveJob(doc) {
    const calc = renderSummary(doc, calculate(doc));
    const jobs = JSON.parse(localStorage.getItem('dash_admin_jobs') || '[]');
    const job = {
      id:'JOB-' + Date.now(),
      name:getEl(doc,'dashJobName').value.trim() || 'Unnamed job',
      service:getEl(doc,'dashJobService').value,
      address:getEl(doc,'dashJobAddress').value.trim(),
      phone:getEl(doc,'dashJobPhone').value.trim(),
      date:getEl(doc,'dashJobDate').value,
      access:getEl(doc,'dashJobAccess').value.trim(),
      notes:getEl(doc,'dashJobNotes').value.trim(),
      supplies:calc.supplies.replace(/<[^>]+>/g,''),
      customerPrice:calc.price,
      jobCosts:calc.jobCosts,
      overhead:calc.overhead,
      companyProfit:calc.companyProfit,
      createdAt:new Date().toISOString()
    };
    jobs.unshift(job);
    localStorage.setItem('dash_admin_jobs', JSON.stringify(jobs));
    renderSaved(doc);
  }

  function renderSaved(doc) {
    const box=getEl(doc,'dashSavedJobs');
    const jobs=JSON.parse(localStorage.getItem('dash_admin_jobs') || '[]');
    if(!jobs.length){box.innerHTML='<div class="empty"><strong>No saved jobs</strong>Saved owner job plans will appear here.</div>';return;}
    box.innerHTML=jobs.map(j=>`<div class="jobops-job"><div><strong>${esc(j.name)}</strong><span class="mini">${esc(j.date||'Date not set')} · ${esc(j.address||'Address not set')}</span><div class="mini">${esc(j.supplies)}</div></div><div style="text-align:right"><b>${money(j.companyProfit)}</b><div class="mini">company profit</div></div></div>`).join('');
  }

  function wire(doc) {
    getEl(doc,'dashCalculateJob').onclick=()=>renderSummary(doc,calculate(doc));
    getEl(doc,'dashSaveJob').onclick=()=>saveJob(doc);
    getEl(doc,'dashJobService').onchange=()=>{getEl(doc,'dashMulchFields').style.display=getEl(doc,'dashJobService').value==='mulch'?'block':'none';};
    renderSaved(doc);
  }

  function addNavButton(doc) {
    const aside=doc.querySelector('aside');
    if(!aside || doc.getElementById('dashJobOperationsNav')) return;
    const group=Array.from(aside.querySelectorAll('.group')).find(el=>el.textContent.trim()==='Operations');
    const btn=doc.createElement('button');
    btn.id='dashJobOperationsNav';
    btn.textContent='Job Operations';
    btn.onclick=()=>{ if(typeof doc.defaultView.show==='function') doc.defaultView.show(SECTION_ID,btn); };
    if(group) group.insertAdjacentElement('afterend',btn); else aside.prepend(btn);
  }

  function init() {
    const frameDoc=document;
    injectStyles(frameDoc);
    const section=createSection(frameDoc);
    if(!section) return;
    addNavButton(frameDoc);
    wire(frameDoc);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();
