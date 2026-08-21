/* DASH Services role guard for the live admin-shell iframe. */
(function(){
  const URL='https://roywoofgypiyoobdcrwx.supabase.co';
  const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
  const labels={'Bookings':'bookings','Payments':'payments','Schedule':'schedules','Wait List':'bookings','Complaints & Evidence':'customers','Customers':'customers','Employee Records':'employee_accounts','Fleet & Equipment':'fleet','Revenue Analytics':'reports','Company Finances':'business_settings','Tax & Owner Draw':'business_settings','Business Optimization':'reports','Communications':'customers','Policies':'policies','Admin Accessibility':'admin_accessibility','Security & Activity':'security','Business Settings':'business_settings','Employee Time & Attendance':'employee_hours','Payroll History':'business_settings','U-Haul Interest':'business_settings'};
  const sections={dashboard:null,bookings:'bookings',payments:'payments',schedule:'schedules',waitlist:'bookings',complaints:'customers',customers:'customers',employees:'employee_accounts',fleet:'fleet',revenue:'reports',finances:'business_settings',optimization:'reports',communications:'customers',policies:'policies',access:'admin_accessibility',security:'security',settings:'business_settings'};
  let access=null;
  const style='[data-dash-role-hidden="1"]{display:none!important}';
  async function getAccess(){
    try{
      if(!window.supabase)return null;
      const c=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
      const {data:{session}}=await c.auth.getSession();
      if(!session)return null;
      const {data,error}=await c.rpc('get_my_admin_access');
      if(error||!data||!data.active)return null;
      return {role:String(data.role||'').toUpperCase(),permissions:new Set(Array.isArray(data.permissions)?data.permissions:[])};
    }catch(e){console.error('DASH access lookup failed',e);return null;}
  }
  function apply(doc){
    if(!doc||!access)return;
    const superAdmin=access.role==='SUPER_ADMIN';
    if(!doc.getElementById('dashRoleGuardStyle')){const s=doc.createElement('style');s.id='dashRoleGuardStyle';s.textContent=style;doc.head.appendChild(s)}
    doc.querySelectorAll('aside button').forEach(b=>{const text=(b.textContent||'').trim().replace(/\s*\(\d+\)$/,'');const needed=labels[text];const hide=!superAdmin&&needed&&!access.permissions.has(needed);if(hide)b.setAttribute('data-dash-role-hidden','1');else b.removeAttribute('data-dash-role-hidden');});
    doc.querySelectorAll('.group').forEach(g=>{let el=g.nextElementSibling,visible=false;while(el&&!el.classList.contains('group')){if(el.matches('button')&&!el.hasAttribute('data-dash-role-hidden'))visible=true;el=el.nextElementSibling}if(!visible)g.setAttribute('data-dash-role-hidden','1');else g.removeAttribute('data-dash-role-hidden');});
    if(typeof doc.defaultView.show==='function'&&!doc.defaultView.__dashRoleWrapped){const original=doc.defaultView.show;doc.defaultView.show=function(section,button){const needed=sections[section];if(!superAdmin&&needed&&!access.permissions.has(needed)){alert('Your DASH Services role does not have permission to access this area.');return}return original.apply(this,arguments)};doc.defaultView.__dashRoleWrapped=true;}
    const tag=doc.querySelector('.tag');if(tag)tag.textContent=access.role.replace('_',' ');
    const comm=doc.getElementById('communications');
    if(comm && !superAdmin && !comm.hasAttribute('data-manager-communications-rendered')){
      comm.setAttribute('data-manager-communications-rendered','1');
      comm.innerHTML='<div class="title"><div><h1>Communications</h1><p>Customer and internal communication center.</p></div></div><div class="panel"><div class="head"><h2>Company Email Addresses</h2><span class="pill">Read Only</span></div><div class="body"><div class="rows"><div class="row"><div><strong>Customer-facing support</strong><span class="mini">The public address customers can use to contact DASH Services.</span></div><span class="pill">support@dashservices.net</span></div><div class="row"><div><strong>Business Gmail</strong><span class="mini">Internal company Gmail account. Managers cannot connect, replace, disconnect, or edit it.</span></div><span class="pill">supportdashservices@gmail.com</span></div></div></div></div><div class="panel"><div class="body empty"><strong>Communication history</strong>Communication history will appear here when real customer or employee communications are connected.</div></div>';
    }
  }
  async function init(){
    try{
      access=await getAccess();
      if(!access){console.error('DASH role guard: no valid session/access; leaving existing portal authentication in control');return;}
      window.DASH_ADMIN_ACCESS=access;
      const frame=document.getElementById('portal');if(!frame)return;
      const run=()=>{const doc=frame.contentDocument;if(!doc)return;apply(doc);if(!doc.__dashRoleObserver&&doc.body){const obs=new MutationObserver(()=>apply(doc));obs.observe(doc.body,{childList:true,subtree:true});doc.__dashRoleObserver=true}};
      frame.addEventListener('load',run);setInterval(run,1000);run();
    }catch(e){console.error('DASH role guard failed',e)}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
