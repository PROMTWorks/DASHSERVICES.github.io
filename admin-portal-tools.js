/* DASH Services admin portal tools: sign out + dedicated Wait List loader + Square settings + Business Settings. */
(function(){
  const URL='https://roywoofgypiyoobdcrwx.supabase.co';
  const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
  let client;
  function getClient(){return client||(client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}}));}
  function addSignOut(){
    if(document.getElementById('dashSignOut'))return;
    const b=document.createElement('button');b.id='dashSignOut';b.type='button';b.className='btn light';b.textContent='Sign Out';
    b.style.cssText='position:fixed;right:18px;bottom:18px;z-index:10000;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.15);';
    b.onclick=async()=>{try{const c=getClient();if(c)await c.auth.signOut();}finally{window.location.replace('admin-login.html');}};
    document.body.appendChild(b);
  }
  function loadWaitlist(){
    if(window.__dashWaitlistLoaded)return;window.__dashWaitlistLoaded=true;
    const s=document.createElement('script');s.src='admin-waitlist.js?v=20260821-2';s.onload=()=>{};s.onerror=()=>console.error('DASH wait list module failed to load');document.head.appendChild(s);
  }
  function loadSquare(){
    if(window.__dashSquareLoaded)return;window.__dashSquareLoaded=true;
    const s=document.createElement('script');s.src='admin-square-settings.js?v=20260821-1';s.onload=()=>{};s.onerror=()=>console.error('DASH Square settings module failed to load');document.head.appendChild(s);
  }
  function loadBusinessSettings(){
    if(window.__dashBusinessSettingsLoaded)return;window.__dashBusinessSettingsLoaded=true;
    const s=document.createElement('script');s.src='admin-business-settings.js?v=20260821-1';s.onload=()=>{};s.onerror=()=>console.error('DASH Business Settings module failed to load');document.head.appendChild(s);
  }
  function init(){addSignOut();loadWaitlist();loadSquare();loadBusinessSettings();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
