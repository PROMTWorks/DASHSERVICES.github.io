(() => {
'use strict';
if(window.__dashMorningWakeUpLoaded)return;
window.__dashMorningWakeUpLoaded=true;
const U='https://roywoofgypiyoobdcrwx.supabase.co',K='sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_';let client;
function db(){return client||(client=window.supabase?.createClient(U,K,{auth:{persistSession:true,autoRefreshToken:true}}));}
function pct(v){return `${Math.round(Number(v)||0)}%`;}
function esc(v){return String(v??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));}
function trend(current,previous){if(previous==null)return {label:'Not enough history',icon:'⚪'};const d=Number(current)-Number(previous);return d>2?{label:'Improving',icon:'🟢'}:d<-2?{label:'Declining',icon:'🔴'}:{label:'Stable',icon:'🟡'};}
async function load(){
 const host=document.querySelector('[data-owner-morning-wake-up]')||document.getElementById('owner-morning-wake-up');if(!host)return;const c=db();if(!c){host.innerHTML='<p>Business health data unavailable.</p>';return;}
 const [jobs,customers,complaints,feedback]=await Promise.all([c.from('jobs').select('*').limit(1000),c.from('customers').select('*').limit(1000),c.from('customer_complaints').select('*').limit(1000),c.from('customer_feedback').select('*').limit(1000)]);
 const j=jobs.data||[],cu=customers.data||[],co=complaints.data||[],fb=feedback.data||[];
 const completed=j.filter(x=>['completed','complete','closed'].includes(String(x.status||'').toLowerCase()));
 const ratings=fb.map(x=>Number(x.rating??x.score)).filter(x=>Number.isFinite(x));const satisfaction=ratings.length?ratings.reduce((a,b)=>a+b,0)/ratings.length/5*100:null;
 const now=Date.now(),windowMs=30*86400000;const recent=j.filter(x=>{const t=new Date(x.completed_at||x.updated_at||x.created_at||0).getTime();return now-t<=windowMs&&t>0;}).length;const prior=j.filter(x=>{const t=new Date(x.completed_at||x.updated_at||x.created_at||0).getTime();return now-t>windowMs&&now-t<=windowMs*2;}).length;
 const compRecent=co.filter(x=>{const t=new Date(x.created_at||x.date||0).getTime();return now-t<=windowMs&&t>0;}).length;const compPrior=co.filter(x=>{const t=new Date(x.created_at||x.date||0).getTime();return now-t>windowMs&&now-t<=windowMs*2;}).length;
 const jobTrend=trend(recent,prior);const complaintTrend=trend(compPrior,compRecent);const popularity=completed.length?Math.min(100,Math.round((recent/(Math.max(1,prior)))*50+50)):null;
 host.innerHTML=`<section class="dash-morning"><div><h2>Owner Morning Wake-Up</h2><p>A quick read on whether DASH is growing, staying steady, or showing warning signs.</p></div><div class="dash-morning-grid"><div><b>Company Popularity</b><strong>${popularity==null?'Not enough history':pct(popularity)}</strong><span>${popularity==null?'Need more completed-job history':popularity>=60?'🟢 Still popular / demand is healthy':'🔴 Demand needs attention'}</span></div><div><b>Overall Direction</b><strong>${jobTrend.icon} ${esc(jobTrend.label)}</strong><span>${recent} recent completed jobs vs. ${prior} prior-period jobs</span></div><div><b>Customer Satisfaction</b><strong>${satisfaction==null?'Not enough ratings':pct(satisfaction)}</strong><span>Based on recorded customer ratings</span></div><div><b>Complaint Direction</b><strong>${complaintTrend.icon} ${esc(complaintTrend.label)}</strong><span>${compRecent} complaints recently vs. ${compPrior} previously</span></div></div><div class="dash-morning-note"><b>What this means:</b> Popularity is a business-health indicator based on recorded demand and customer feedback; it is not a claim about public awareness or market share.</div></section>`;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();