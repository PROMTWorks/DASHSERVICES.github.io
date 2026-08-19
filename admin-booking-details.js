(function(){
'use strict';
const API='https://roywoofgypiyoobdcrwx.supabase.co/functions/v1/dash-admin-portal';
const KEY='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';
function token(){
  const keys=Object.keys(localStorage).filter(k=>k.includes('auth-token'));
  for(const k of keys){try{const v=JSON.parse(localStorage.getItem(k)||'null');if(v&&v.access_token)return v.access_token;}catch{}}
  return sessionStorage.getItem('supabase_access_token')||'';
}
async function getBookings(){
  const t=token();
  if(!t) throw Error('Your admin session has expired. Please sign in again.');
  const r=await fetch(API,{method:'POST',headers:{apikey:KEY,Authorization:'Bearer '+t,'Content-Type':'application/json'},body:JSON.stringify({action:'bookings'}),cache:'no-store'});
  const j=await r.json().catch(()=>({}));
  if(!r.ok||j.error)throw Error(j.error||'Unable to load booking details.');
  return Array.isArray(j.data)?j.data:[];
}
function esc(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function field(label,value){return '<div class="history-item"><h3>'+esc(label)+'</h3><p>'+esc(value||'Not recorded')+'</p></div>';}
function ensureModal(){
  let m=document.getElementById('liveBookingDetailsModal');
  if(m)return m;
  m=document.createElement('div');m.id='liveBookingDetailsModal';m.className='modal';
  m.innerHTML='<div class="modalbox"><div class="modalhead"><h2 id="liveBookingTitle">Booking Details</h2><button class="close" id="liveBookingClose">Close</button></div><div id="liveBookingBody"></div></div>';
  document.body.appendChild(m);m.querySelector('#liveBookingClose').onclick=()=>m.classList.remove('show');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});return m;
}
async function openLiveBooking(requestNumber){
  const m=ensureModal(),body=m.querySelector('#liveBookingBody');
  m.classList.add('show');body.innerHTML='<div class="empty"><strong>Loading booking details...</strong></div>';
  try{
    const rows=await getBookings();
    const b=rows.find(x=>String(x.request_number||x.client_request_number)===String(requestNumber));
    if(!b)throw Error('Booking details could not be found.');
    m.querySelector('#liveBookingTitle').textContent='Booking Details — '+(b.request_number||b.client_request_number||'DASH Request');
    body.innerHTML='<div class="statusline"><span class="pill">'+esc(b.request_status||'submitted')+'</span><span class="pill">Proof: '+esc(b.proof_status||'not_required')+'</span></div><div class="history-grid">'+field('Customer',[b.first_name,b.last_name].filter(Boolean).join(' '))+field('Phone',b.phone)+field('Email',b.email)+field('Service',b.service_name||b.service_key)+field('Vehicle Year',b.vehicle_year)+field('Vehicle Make',b.vehicle_make)+field('Vehicle Model',b.vehicle_model)+field('Engine',b.vehicle_engine)+field('Trim',b.vehicle_trim)+field('Preferred Date',b.preferred_date)+field('Preferred Time',b.preferred_time)+field('Address',b.full_address||[b.city,b.state,b.postal_code].filter(Boolean).join(', '))+field('Restrictions',b.restriction_answer)+field('Restriction Details',b.restriction_details)+field('Customer Notes',b.customer_notes)+field('Created',b.created_at)+field('Updated',b.updated_at)+'</div>';
  }catch(e){body.innerHTML='<div class="empty"><strong>Could not load booking</strong><p>'+esc(e.message)+'</p></div>';}
}
function wire(){
  const list=document.getElementById('bookingList');if(!list)return;
  list.querySelectorAll('.row').forEach(row=>{
    if(row.dataset.bookingWired)return;row.dataset.bookingWired='1';row.style.cursor='pointer';row.title='Click to view booking details';
    const strong=row.querySelector('strong');const n=strong?strong.textContent.trim():'';
    row.addEventListener('click',e=>{if(e.target.closest('button,a'))return;openLiveBooking(n)});
    const bar=row.querySelector('.toolbar');if(bar&&!bar.querySelector('[data-live-booking]')){const b=document.createElement('button');b.className='btn light';b.type='button';b.dataset.liveBooking='1';b.textContent='View Details';b.onclick=e=>{e.stopPropagation();openLiveBooking(n)};bar.insertBefore(b,bar.firstChild);}
  });
}
function boot(){wire();setTimeout(wire,300);setTimeout(wire,1000);setTimeout(wire,2000);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
window.openLiveBooking=openLiveBooking;
})();
