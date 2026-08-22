/* DASH MOBILE SERVICES Business Settings module. */
(function(){
  const URL='https://roywoofgypiyoobdcrwx.supabase.co';
  const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
  let client;
  function getClient(){return client||(client=window.supabase?.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}}));}
  const ids=['legal_name','customer_name','phone','email','private_address','mailing_address','hours','cashapp','venmo','payment_instructions','payment_qr','square_status','square_environment','square_account_id','square_location_id','square_application_id','square_payment_link','square_notes','services','pricing','service_areas','scheduling','customer_email','auto_email','booking_confirm','payment_notify','manager_start','call_attempts','emergency_rule','owner_number_policy','admin_email','public_address'];
  function val(id){const e=document.getElementById('bs_'+id);return e?e.value:''}
  function set(id,v){const e=document.getElementById('bs_'+id);if(e&&v!==undefined&&v!==null)e.value=v}
  function render(){
    const section=document.getElementById('settings'); if(!section)return;
    section.innerHTML=`
      <div class="title"><div><h1>Business Settings</h1><p>Manage DASH MOBILE SERVICES business information, payments, services, communications, and owner contact rules.</p></div><button class="btn" type="button" id="saveBusinessSettingsTop">Save Business Settings</button></div>
      <div id="businessSettingsNotice" class="notice"><b>Super Admin only:</b> These settings are private administrative configuration. The private business address will not be displayed publicly unless you explicitly choose to use it for customer-facing content.</div>
      <div class="panel"><div class="head"><h2>Business Information</h2></div><div class="body"><div class="form">
        <div class="field"><label>Legal / Registered Business Name</label><input id="bs_legal_name" placeholder="Enter legal business name"></div>
        <div class="field"><label>Customer-Facing Business Name</label><input id="bs_customer_name" placeholder="DASH MOBILE SERVICES"></div>
        <div class="field"><label>Business Phone</label><input id="bs_phone" placeholder="Enter business phone"></div>
        <div class="field"><label>Business Email</label><input id="bs_email" type="email" placeholder="Enter business email"></div>
        <div class="field full"><label>Private Business Address <span class="mini">Admin use only — not public</span></label><input id="bs_private_address" placeholder="Enter private business address"></div>
        <div class="field full"><label>Mailing Address</label><input id="bs_mailing_address" placeholder="Enter mailing address"></div>
        <div class="field full"><label>Business Hours</label><textarea id="bs_hours" placeholder="Enter normal business hours"></textarea></div>
      </div></div></div>
      <div class="panel"><div class="head"><h2>Payment Settings</h2></div><div class="body"><div class="form">
        <div class="field"><label>Cash App</label><input id="bs_cashapp" placeholder="Enter Cash App handle or payment link"></div>
        <div class="field"><label>Venmo</label><input id="bs_venmo" placeholder="Enter Venmo handle or payment link"></div>
        <div class="field full"><label>Payment Instructions</label><textarea id="bs_payment_instructions" placeholder="Enter customer payment instructions"></textarea></div>
        <div class="field full"><label>Payment QR Code Image Address</label><input id="bs_payment_qr" placeholder="Enter image address when available"></div>
      </div></div></div>
      <div class="panel"><div class="head"><h2>Square Payment Processing</h2><span class="pill">Not configured</span></div><div class="body">
        <div class="notice"><b>Future Square setup:</b> You do not have a Square account connected yet. These fields are ready for when you create one. Secret credentials should be stored securely and should not be placed directly in this HTML page.</div>
        <div class="form">
          <div class="field"><label>Square Account Status</label><select id="bs_square_status"><option value="not_configured">Not configured</option><option value="ready">Ready to connect</option><option value="connected">Connected</option><option value="disabled">Disabled</option></select></div>
          <div class="field"><label>Square Environment</label><select id="bs_square_environment"><option value="sandbox">Sandbox</option><option value="production">Production</option></select></div>
          <div class="field"><label>Square Merchant / Account ID</label><input id="bs_square_account_id" placeholder="Enter when Square account is created"></div>
          <div class="field"><label>Square Location ID</label><input id="bs_square_location_id" placeholder="Enter Square location ID later"></div>
          <div class="field"><label>Square Application ID</label><input id="bs_square_application_id" placeholder="Enter Square application ID later"></div>
          <div class="field"><label>Square Checkout / Payment Link</label><input id="bs_square_payment_link" placeholder="Enter payment link when available"></div>
          <div class="field full"><label>Square Access Token</label><input id="bs_square_access_token" type="password" autocomplete="off" placeholder="Do not enter secret token here — connect securely when ready"></div>
          <div class="field full"><label>Square Notes</label><textarea id="bs_square_notes" placeholder="Enter Square setup notes, terminal information, or other non-secret details"></textarea></div>
        </div>
        <div class="actions"><button class="btn light" type="button" id="connectSquareSettings">Connect Square</button></div>
      </div></div>
      <div class="panel"><div class="head"><h2>Service Settings</h2></div><div class="body"><div class="form">
        <div class="field full"><label>Services Offered</label><textarea id="bs_services" placeholder="Enter services offered by DASH MOBILE SERVICES"></textarea></div>
        <div class="field"><label>Pricing / Estimate Rules</label><textarea id="bs_pricing" placeholder="Enter pricing or estimate rules"></textarea></div>
        <div class="field"><label>Service Areas</label><textarea id="bs_service_areas" placeholder="Enter cities, ZIP codes, or service areas"></textarea></div>
        <div class="field full"><label>Scheduling Rules</label><textarea id="bs_scheduling" placeholder="Enter scheduling rules and service-window rules"></textarea></div>
      </div></div></div>
      <div class="panel"><div class="head"><h2>Communication Settings</h2></div><div class="body"><div class="form">
        <div class="field"><label>Customer Communication Email</label><input id="bs_customer_email" type="email" placeholder="Enter customer-facing email"></div>
        <div class="field"><label>Automated Emails</label><select id="bs_auto_email"><option value="">Not configured</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></div>
        <div class="field"><label>Booking Confirmations</label><select id="bs_booking_confirm"><option value="">Not configured</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></div>
        <div class="field"><label>Payment Notifications</label><select id="bs_payment_notify"><option value="">Not configured</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option></select></div>
      </div></div></div>
      <div class="panel"><div class="head"><h2>Owner & Manager Communication Policy</h2></div><div class="body">
        <div class="notice"><b>Policy:</b> Routine manager contact begins after 12:00 PM. A genuine emergency may be escalated before 12:00 PM. Managers should make no more than two owner phone-call attempts; if there is no answer, they must follow the company's emergency escalation procedure. Employees may not receive or share the owner's personal phone number without authorization.</div>
        <div class="form">
          <div class="field"><label>Routine Manager Contact Start</label><input id="bs_manager_start" type="time" value="12:00"></div>
          <div class="field"><label>Maximum Owner Call Attempts</label><input id="bs_call_attempts" type="number" min="1" max="10" value="2"></div>
          <div class="field full"><label>Emergency Escalation Rule</label><textarea id="bs_emergency_rule">For a genuine emergency, a manager may contact the owner before the routine contact time. Make no more than two owner call attempts. If the owner does not answer, follow the applicable emergency escalation procedure. For immediate threats to life, safety, fire, or police response, contact the appropriate emergency service first.</textarea></div>
          <div class="field full"><label>Owner Personal Number Policy</label><textarea id="bs_owner_number_policy">The owner's personal phone number is confidential. Managers and employees may not share, distribute, post, or provide the owner's personal phone number to employees, customers, vendors, or other third parties without the owner's authorization.</textarea></div>
        </div>
      </div></div>
      <div class="panel"><div class="head"><h2>Admin & Security Settings</h2></div><div class="body"><div class="form">
        <div class="field"><label>Admin / Owner Email</label><input id="bs_admin_email" type="email" placeholder="Enter admin email"></div>
        <div class="field"><label>Public Business Address</label><select id="bs_public_address"><option value="private">Keep private</option><option value="public">Allow customer-facing use</option></select></div>
      </div></div></div>
      <div class="actions"><button class="btn" type="button" id="saveBusinessSettingsBottom">Save Business Settings</button></div>`;
    document.getElementById('saveBusinessSettingsTop').onclick=save;
    document.getElementById('saveBusinessSettingsBottom').onclick=save;
    document.getElementById('connectSquareSettings').onclick=()=>alert('Square is not connected yet. When you have your Square account, we can securely connect it here.');
    load();
  }
  async function save(){
    const c=getClient(); if(!c){alert('Business settings could not connect to Supabase.');return;}
    const value={}; ids.forEach(id=>value[id]=val(id));
    const {data:user}=await c.auth.getUser();
    const {error}=await c.from('business_settings').upsert({setting_key:'general',setting_value:value,updated_by:user?.user?.id||null},{onConflict:'setting_key'});
    if(error){alert('Could not save Business Settings: '+error.message);return;}
    const n=document.getElementById('businessSettingsNotice'); if(n){n.innerHTML='<b>Saved.</b> Business Settings were saved securely for Super Admin use.';setTimeout(()=>{n.innerHTML='<b>Super Admin only:</b> These settings are private administrative configuration. The private business address will not be displayed publicly unless you explicitly choose to use it for customer-facing content.'},3000);}
  }
  async function load(){
    const c=getClient(); if(!c)return;
    const {data,error}=await c.from('business_settings').select('setting_value').eq('setting_key','general').maybeSingle();
    if(error||!data)return;
    const v=data.setting_value||{}; ids.forEach(id=>set(id,v[id]));
  }
  function init(){render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();