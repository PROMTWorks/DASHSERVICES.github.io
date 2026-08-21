/* DASH Services role-based admin UI guard. Backend/RLS remains the security boundary. */
(function(){
  const SUPABASE_URL='https://roywoofgypiyoobdcrwx.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
  const permissionsBySection={
    dashboard:null,
    bookings:'bookings',
    payments:'payments',
    schedule:'schedules',
    waitlist:'bookings',
    complaints:'customers',
    customers:'customers',
    employees:'employees',
    fleet:'fleet',
    revenue:'reports',
    finances:'business_settings',
    optimization:'reports',
    communications:'customers',
    policies:'policies',
    access:'admin_accessibility',
    security:'security',
    settings:'business_settings'
  };
  const textPermissions={
    'Dashboard':null,
    'Bookings':'bookings','Payments':'payments','Schedule':'schedules','Wait List':'bookings','Complaints & Evidence':'customers',
    'Customers':'customers','Employee Records':'employee_accounts','Fleet & Equipment':'fleet',
    'Revenue Analytics':'reports','Company Finances':'business_settings','Tax & Owner Draw':'business_settings','Business Optimization':'reports',
    'Communications':'customers','Policies':'policies','Admin Accessibility':'admin_accessibility','Security & Activity':'security','Business Settings':'business_settings',
    'Employee Time & Attendance':'employee_hours','Payroll History':'business_settings','U-Haul Interest':'business_settings'
  };
  function loadClient(){
    return new Promise((resolve,reject)=>{
      if(window.supabase) return resolve(window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}));
      const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
      s.onload=()=>resolve(window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true}}));
      s.onerror=reject; document.head.appendChild(s);
    });
  }
  function setTag(role){const tag=document.querySelector('.tag'); if(tag) tag.textContent=role.replace('_',' ');}
  function hideUnauthorized(permissions,role){
    const allowed=new Set(permissions||[]); const isSuper=role==='SUPER_ADMIN';
    document.querySelectorAll('aside button').forEach(btn=>{
      const label=(btn.textContent||'').trim(); const needed=textPermissions[label];
      if(needed && !isSuper && !allowed.has(needed)) btn.classList.add('role-hidden');
      if(label==='Employee Records' && !isSuper && !allowed.has('employee_accounts')) btn.classList.add('role-hidden');
    });
    document.querySelectorAll('.group').forEach(group=>{
      let el=group.nextElementSibling,visible=false;
      while(el && !el.classList.contains('group')){ if(el.matches('button') && !el.classList.contains('role-hidden')) visible=true; el=el.nextElementSibling; }
      if(!visible) group.classList.add('role-hidden');
    });
    const style=document.createElement('style'); style.textContent='.role-hidden{display:none!important}'; document.head.appendChild(style);
  }
  function renderManagerCommunications(){
    const section=document.getElementById('communications');
    if(!section || section.dataset.managerCommunications==='1') return;
    section.dataset.managerCommunications='1';
    section.innerHTML=`<div class="title"><div><h1>Communications</h1><p>Customer and internal communication center.</p></div></div>
      <div class="panel"><div class="head"><h2>Company Email Addresses</h2><span class="pill">Read Only</span></div><div class="body"><div class="rows">
        <div class="row"><div><strong>Customer-facing support</strong><span class="mini">The public address customers can use to contact DASH Services.</span></div><span class="pill">support@dashservices.net</span></div>
        <div class="row"><div><strong>Business Gmail</strong><span class="mini">Internal company Gmail account. Managers cannot connect, replace, disconnect, or edit it.</span></div><span class="pill">supportdashservices@gmail.com</span></div>
      </div></div></div>
      <div class="panel"><div class="body empty"><strong>Communication history</strong>Communication history will appear here when real customer or employee communications are connected.</div></div>`;
  }
  function protectShow(permissions,role){
    if(typeof window.show!=='function') return;
    const original=window.show; const allowed=new Set(permissions||[]); const isSuper=role==='SUPER_ADMIN';
    window.show=function(section,button){
      const needed=permissionsBySection[section];
      if(!isSuper && needed && !allowed.has(needed)){
        alert('Your DASH Services role does not have permission to access this area.'); return;
      }
      const result=original.apply(this,arguments);
      if(!isSuper && section==='communications') setTimeout(renderManagerCommunications,0);
      return result;
    };
  }
  async function init(){
    try{
      const client=await loadClient();
      const {data:{session}}=await client.auth.getSession();
      if(!session){window.location.replace('admin-login.html');return;}
      const {data,error}=await client.rpc('get_my_admin_access');
      if(error || !data || !data.active){window.location.replace('admin-login.html');return;}
      const role=String(data.role||'').toUpperCase(); const permissions=Array.isArray(data.permissions)?data.permissions:[];
      window.DASH_ADMIN_ACCESS={role,permissions}; setTag(role); hideUnauthorized(permissions,role);
      if(role!=='SUPER_ADMIN') setTimeout(renderManagerCommunications,0);
      const wait=()=>{ if(typeof window.show==='function') protectShow(permissions,role); else setTimeout(wait,100); }; wait();
    }catch(e){console.error('DASH role guard failed',e); window.location.replace('admin-login.html');}
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
