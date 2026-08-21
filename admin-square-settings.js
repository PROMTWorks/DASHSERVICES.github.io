/* DASH Services Square payment processing settings. */
(function(){
  const URL='https://roywoofgypiyoobdcrwx.supabase.co';
  const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
  let client;
  function getClient(){return client||(client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}}));}
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function panel(){
    const section=document.getElementById('settings');
    if(!section||document.getElementById('squarePaymentSettings'))return;
    const p=document.createElement('div');p.id='squarePaymentSettings';p.className='panel';
    p.innerHTML='<div class="head"><h2>Square Payment Processing</h2><span class="pill" id="squareStatusPill">Not configured</span></div><div class="body"><div class="notice"><b>Future Square setup:</b> Your Square account is not connected yet. These fields are ready for when you create one. Secret credentials are intentionally not stored in this page.</div><div class="form"><div class="field"><label>Square Account Status</label><select id="sq_status"><option value="not_configured">Not configured</option><option value="ready">Ready to connect</option><option value="connected">Connected</option><option value="disabled">Disabled</option></select></div><div class="field"><label>Square Environment</label><select id="sq_environment"><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div><div class="field"><label>Square Merchant / Account ID</label><input id="sq_account_id" placeholder="Enter when Square account is created"></div><div class="field"><label>Square Location ID</label><input id="sq_location_id" placeholder="Enter Square location ID later"></div><div class="field"><label>Square Application ID</label><input id="sq_application_id" placeholder="Enter Square application ID later"></div><div class="field"><label>Square Checkout / Payment Link</label><input id="sq_payment_link" placeholder="Enter payment link when available"></div><div class="field full"><label>Square Access Token</label><input type="password" autocomplete="off" placeholder="Not stored here — connect securely when ready" disabled></div><div class="field full"><label>Square Notes</label><textarea id="sq_notes" placeholder="Enter non-secret Square setup notes"></textarea></div></div><div class="actions"><button class="btn" type="button" id="sqSave">Save Square Settings</button><button class="btn light" type="button" id="sqConnect">Connect Square</button></div><div class="mini" id="sqMessage"></div></div>';
    section.appendChild(p);
    document.getElementById('sqSave').onclick=save;
    document.getElementById('sqConnect').onclick=()=>alert('Square is not connected yet. When you have your Square account, we can securely connect it here.');
    load();
  }
  async function load(){
    const c=getClient();if(!c)return;
    const {data,error}=await c.from('square_payment_settings').select('*').limit(1).maybeSingle();
    if(error||!data)return;
    set('status',data.account_status);set('environment',data.environment);set('account_id',data.merchant_account_id);set('location_id',data.location_id);set('application_id',data.application_id);set('payment_link',data.payment_link);set('notes',data.notes);updateStatus(data.account_status);
  }
  function set(k,v){const e=document.getElementById('sq_'+k);if(e&&v!=null)e.value=v;}
  function get(k){const e=document.getElementById('sq_'+k);return e?e.value:'';}
  function updateStatus(v){const e=document.getElementById('squareStatusPill');if(e)e.textContent=v==='connected'?'Connected':v==='ready'?'Ready to connect':v==='disabled'?'Disabled':'Not configured';}
  async function save(){
    const c=getClient();if(!c){alert('Supabase is not available.');return;}
    const {data:user}=await c.auth.getUser();
    const payload={account_status:get('status'),environment:get('environment'),merchant_account_id:get('account_id')||null,location_id:get('location_id')||null,application_id:get('application_id')||null,payment_link:get('payment_link')||null,notes:get('notes')||null,updated_by:user?.user?.id||null};
    const {data:existing}=await c.from('square_payment_settings').select('id').limit(1).maybeSingle();
    const r=existing?.id?await c.from('square_payment_settings').update(payload).eq('id',existing.id):await c.from('square_payment_settings').insert(payload);
    if(r.error){alert('Could not save Square settings: '+r.error.message);return;}
    updateStatus(payload.account_status);document.getElementById('sqMessage').textContent='Square settings saved securely.';setTimeout(()=>document.getElementById('sqMessage').textContent='',3000);
  }
  function hook(){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',panel);else panel();}
  hook();
})();