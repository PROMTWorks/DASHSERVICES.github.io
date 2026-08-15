/* PROMT WORKS vehicle database integration
   Year/make/model coverage is loaded from the public NHTSA vPIC database.
   Engine is confirmed separately because a model can have multiple engines.
*/
(function(){
  const nav=document.querySelector('header nav');
  if(nav && !nav.querySelector('[data-dash-admin-link]')){
    const link=document.createElement('a');
    link.href='admin-v2.html';
    link.textContent='ADMIN';
    link.setAttribute('data-dash-admin-link','true');
    link.setAttribute('aria-label','DASH Services Admin Portal');
    nav.appendChild(link);
  }
  const $=id=>document.getElementById(id);
  const year=$('year'),make=$('make'),model=$('model'),engine=$('engine');
  if(year&&make&&model&&engine){
    const api='https://vpic.nhtsa.dot.gov/api/vehicles';
    const years=Array.from({length:46},(_,i)=>2026-i);
    year.innerHTML='<option value="">Select year</option>'; years.forEach(y=>year.add(new Option(y,y)));
    function reset(el,label){el.innerHTML='';el.add(new Option(label,''));el.disabled=true}
    function loading(el){el.innerHTML='<option value="">Loading...</option>';el.disabled=true}
    async function get(url){const r=await fetch(url);if(!r.ok)throw new Error('Vehicle database unavailable');return r.json()}
    year.onchange=async function(){reset(make,'Select make');reset(model,'Select model');reset(engine,'Select engine');if(!this.value)return;loading(make);try{const d=await get(`${api}/GetMakesForVehicleType/car?format=json`);const names=[...new Set((d.Results||[]).map(x=>x.MakeName).filter(Boolean))].sort();make.innerHTML='<option value="">Select make</option>';names.forEach(n=>make.add(new Option(n,n)));make.disabled=false}catch(e){make.innerHTML='<option value="">Vehicle database unavailable</option>'}};
    make.onchange=async function(){reset(model,'Select model');reset(engine,'Select engine');if(!year.value||!this.value)return;loading(model);try{const d=await get(`${api}/GetModelsForMakeYear/make/${encodeURIComponent(this.value)}/modelyear/${year.value}/vehicletype/car?format=json`);const names=[...new Set((d.Results||[]).map(x=>x.Model_Name).filter(Boolean))].sort();model.innerHTML='<option value="">Select model</option>';names.forEach(n=>model.add(new Option(n,n)));model.disabled=false}catch(e){model.innerHTML='<option value="">Models unavailable</option>'}};
    model.onchange=function(){reset(engine,'Select engine');if(!this.value)return;engine.innerHTML='<option value="">Select / confirm engine</option><option value="custom">I know my engine — enter below</option><option value="custom2">Engine not listed — enter below</option>';engine.disabled=false;let wrap=$('customEngineWrap');if(!wrap){const parent=engine.parentElement;wrap=document.createElement('div');wrap.id='customEngineWrap';wrap.className='hidden';wrap.innerHTML='<label for="customEngine">Exact engine</label><input id="customEngine" placeholder="Example: 2.5L 4-Cylinder">';parent.parentElement.appendChild(wrap)}engine.onchange=function(){wrap.classList.toggle('hidden',this.value!=='custom'&&this.value!=='custom2');if(window.PROMT_UPDATE_PRICE)window.PROMT_UPDATE_PRICE()}};
    window.PROMT_VEHICLE_DB={source:'NHTSA vPIC',coverage:'US passenger vehicles, model years 1981-2026',engineNote:'Engine must be confirmed separately before exact oil/parts fitment is promised.'};
    window.PROMT_UPDATE_PRICE=function(){const service=$('autoService')?.value,box=$('autoResult');if(!service||!box)return;const makeV=$('make')?.value,modelV=$('model')?.value,engineV=$('engine')?.value;if(!makeV||!modelV||!engineV||engineV==='custom'||engineV==='custom2'){box.classList.add('hidden');return}let parts=0,labor=14,margin=15,details='';if(service==='oil'){parts=55;margin=25;details='Estimated full-synthetic oil, filter and basic materials. Exact oil specification and capacity must be verified before purchase.'}else if(service==='wipers'){parts=42;details='Estimated pair of quality replacement wiper blades.'}else if(service==='air'){parts=28;details='Estimated engine air filter.'}else if(service==='cabin'){parts=25;details='Estimated cabin air filter.'}else if(service==='battery'){parts=145;margin=20;details='Estimated standard replacement battery; exact fitment may change price.'}else if(service==='bulb'){parts=20;margin=10;details='Estimated basic replacement bulb; specialty bulbs may cost more.'}else if(service==='fluid'){parts=12;margin=10;details='Estimated basic fluid materials.'}else if(service==='tire'){margin=10;details='Basic tire air check and inflation.'}else if(service==='jump'){margin=15;details='Basic battery jump-start.'}const total=parts+labor+margin;box.innerHTML='<h3>Estimated Price</h3><p>'+details+'</p><div class="price-line"><span>Parts/materials</span><strong>$'+parts.toFixed(2)+'</strong></div><div class="price-line"><span>Labor</span><strong>$'+labor.toFixed(2)+'</strong></div><div class="price-line"><span>Travel</span><strong>$0.00</strong></div><div class="price-line"><span>Service & business margin</span><strong>$'+margin.toFixed(2)+'</strong></div><div class="total">Estimated total: $'+total.toFixed(2)+'</div>';box.classList.remove('hidden')};
    ['autoService','carColor'].forEach(id=>$(id)?.addEventListener('change',window.PROMT_UPDATE_PRICE));
  }

  /* DASH Services Policies integration for admin-v2.html.
     This is intentionally gated to the admin portal so the public site is unchanged by this block. */
  if(location.pathname.endsWith('/admin-v2.html') || location.pathname.endsWith('admin-v2.html')){
    const injectPolicies=()=>{
      const section=document.getElementById('policies');
      if(!section || section.dataset.policyIntegration==='ready')return;
      section.dataset.policyIntegration='ready';
      const superAdmin=new URLSearchParams(location.search).get('role')!=='manager';
      section.innerHTML=`<div class="title"><div><h1>Policies</h1><p>Central policy library for DASH Services. Customer policies are public-facing; employee policies are internal operating procedures.</p></div><div class="toolbar"><a class="btn light" href="policies.html" target="_blank">View Customer Policies</a><button class="btn" id="policyQuickEdit">Quick Edit</button></div></div>
      <div class="security"><b>Policy authority:</b> Super Admin is the only role that can edit or publish official policy language. Managers and HR may submit policy-change requests for Super Admin review. Employees may view applicable internal procedures but cannot edit official policies.</div>
      <div class="grid2">
        <div class="panel"><div class="head"><h2>Customer Policies</h2><span class="pill green">Public</span></div><div class="body"><p class="muted">These are the policies customers are expected to review before booking or receiving service.</p><a class="btn" href="policies.html" target="_blank">Open Customer Policies</a></div></div>
        <div class="panel"><div class="head"><h2>Employee Policies</h2><span class="pill orange">Internal</span></div><div class="body"><p class="muted">Internal procedures explain how employees handle customer-policy situations, what they may communicate, and when an issue must be escalated.</p><button class="btn" id="openEmployeePolicies">Open Employee Policies</button></div></div>
      </div>
      <div class="panel"><div class="head"><div><h2>Employee Policies</h2><div class="mini">Search by policy name, topic, or a short description.</div></div><span class="pill">Internal</span></div><div class="body">
        <div class="form" style="margin-bottom:18px"><div class="field"><label for="employeePolicySearch">Search policies</label><input id="employeePolicySearch" placeholder="Example: refund, payment, property access, customer complaint"></div><div class="field"><label for="employeePolicyCategory">Policy category</label><select id="employeePolicyCategory"><option value="all">All Employee Policies</option><option value="booking">Booking & Payment</option><option value="complaints">Complaints & Refunds</option><option value="property">Property & Access</option><option value="safety">Safety & Emergencies</option><option value="communication">Communication & Authority</option><option value="limitations">Employee Limitations</option></select></div></div>
        <div id="employeePolicyResults" class="rows"><div class="empty"><strong>Loading Employee Policies</strong>The internal policy library is being loaded.</div></div>
      </div></div>
      <div class="panel"><div class="head"><h2>Policy Requests</h2><span class="mini">Requests do not change official policy automatically.</span></div><div class="body"><div class="row"><div><strong>Request a policy change</strong><span class="muted">Managers and HR may submit a policy name, category, and description of the requested change for Super Admin review.</span></div>${superAdmin?'<span class="pill green">Super Admin Review</span>':'<button class="btn light" id="policyRequestButton">Submit Request</button>'}</div></div></div>`;
      const quick=document.getElementById('policyQuickEdit');
      quick.onclick=()=>{if(!superAdmin){alert('Policy editing is restricted to Super Admin. Managers and HR may submit change requests.');return}alert('Super Admin policy editing is enabled as the policy-authority workflow. Edit the selected official policy, then publish the approved version.');};
      document.getElementById('openEmployeePolicies').onclick=()=>document.getElementById('employeePolicyResults').scrollIntoView({behavior:'smooth'});
      const request=document.getElementById('policyRequestButton');
      if(request)request.onclick=()=>alert('Policy change requests are routed to Super Admin for review. The request should identify the policy, category, and requested change.');
      const data=[
        ['booking','Booking & Payment Handling','Payment verification, booking confirmation, late payment, and Payment Pending procedures.'],
        ['booking','Payment Pending & Late Payment','How employees handle late or missing booking payments and Wait List status.'],
        ['complaints','Service Complaint & Evidence','How employees document customer complaints and submit evidence for administrative review.'],
        ['complaints','Refund Handling','How employees receive, document, and escalate refund requests without promising an outcome.'],
        ['complaints','Re-Service Handling','How employees handle requests for complimentary re-service after a service complaint.'],
        ['property','Service Address & Property Access','How employees handle locked properties, gates, access information, and unavailable locations.'],
        ['property','Customer Property & Personal Belongings','Employee expectations for handling customer belongings and service obstructions.'],
        ['property','Damage & Existing Conditions','How employees document pre-existing conditions and handle damage allegations.'],
        ['property','Service Permission & Access Authorization','How employees respond when service permission may be unclear or unavailable.'],
        ['safety','Employee Safety & Workplace Conditions','Employee safety authority and procedures for unsafe service locations.'],
        ['safety','Weather & Emergency','How employees respond to weather, emergencies, road conditions, and other disruptions.'],
        ['communication','Customer Communication & Employee Authority','Communication standards and limits on employee authority to make administrative decisions.'],
        ['communication','Promotions, Discounts & Coupons','Employee rules for approved promotions, discounts, and coupons.'],
        ['limitations','Employee Limitations & Escalation','Situations that employees must escalate instead of creating their own exception or company rule.'],
        ['limitations','Policy Change Requests','How employees identify policy problems and submit concerns without editing official policies.']
      ];
      const results=document.getElementById('employeePolicyResults'),search=document.getElementById('employeePolicySearch'),cat=document.getElementById('employeePolicyCategory');
      const render=()=>{const q=search.value.toLowerCase().trim(),c=cat.value;const rows=data.filter(x=>(c==='all'||x[0]===c)&&(!q||(x[1]+' '+x[2]).toLowerCase().includes(q)));results.innerHTML=rows.length?rows.map(x=>`<div class="row"><div><strong>${x[1]}</strong><span class="muted">${x[2]}</span></div><span class="pill orange">Employee Policy</span></div>`).join(''):'<div class="empty"><strong>No matching employee policies</strong>Try a different policy name, topic, or category.</div>'};
      search.addEventListener('input',render);cat.addEventListener('change',render);render();
    };
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',injectPolicies);else injectPolicies();
  }
})();
