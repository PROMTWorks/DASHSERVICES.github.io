/* DASH MOBILE SERVICES — Employee Training Validation UI */
(function(){
'use strict';
var vRecords=[],db=null;
function refreshRecords(){
  if(!db&&window.supabase)db=window.supabase.createClient('https://roywoofgypiyoobdcrwx.supabase.co','sb_publishable_5SKEbO1wFS4LVZ6IcpWfnA_UQffaKX_',{auth:{persistSession:true,autoRefreshToken:true}});
  if(!db)return Promise.resolve();
  return db.rpc('get_my_employee_training').then(function(res){if(!res.error)vRecords=res.data||[];}).catch(function(){});
}
function apply(){
  if(typeof window.list!=='function'||typeof window.render!=='function'||typeof window.openModule!=='function')return;
  window.trainingRecord=function(name){return vRecords.find(function(x){return x.training_name===name;});};
  window.passedName=function(name){var r=window.trainingRecord(name);return !!(r&&['passed','completed'].includes(String(r.status||'').toLowerCase())&&String(r.owner_validation_status||'').toUpperCase()==='VALIDATED');};
  if(!window.__DASH_TRAINING_VALIDATION_RENDER){
    window.__DASH_TRAINING_VALIDATION_RENDER=true;
    window.render=function(){
      var ms=window.list(),all=ms.length,validated=ms.filter(function(m){return window.passedName(m.title);}).length,awaiting=ms.filter(function(m){var r=window.trainingRecord(m.title);return r&&['passed','completed'].includes(String(r.status||'').toLowerCase())&&String(r.owner_validation_status||'').toUpperCase()!=='VALIDATED';}).length;
      var next=ms.findIndex(function(m){return !window.passedName(m.title);})+1||all;
      document.getElementById('passed').textContent=validated;
      document.getElementById('current').textContent=validated===all?'Complete':next;
      document.getElementById('status').textContent=validated===all?'OWNER VALIDATED':awaiting?'AWAITING OWNER VALIDATION':'IN TRAINING';
      document.getElementById('modules').innerHTML=ms.map(function(m,i){
        var r=window.trainingRecord(m.title),testPassed=r&&['passed','completed'].includes(String(r.status||'').toLowerCase()),ok=window.passedName(m.title),prev=i===0||window.passedName(ms[i-1].title),state=ok?'OWNER VALIDATED':testPassed?'AWAITING OWNER VALIDATION':prev?'READY':'LOCKED',cls=ok?'ok':testPassed?'warn':'',button=ok?'Review':testPassed?'Awaiting Owner':'Start Training';
        return '<div class="row"><div class="rowtop"><div><strong>Module '+(i+1)+': '+window.esc(m.title)+'</strong><div class="muted">'+(ok?'Training approved by Owner':testPassed?'Test passed — waiting for Owner validation':prev?'Ready to begin':'Locked until previous module is Owner-validated')+'</div></div><span class="pill '+cls+'">'+state+'</span></div><div style="margin-top:12px"><button class="btn '+(ok||testPassed?'light':'')+'" '+(!prev?'disabled':'')+' onclick="openModule('+i+')">'+button+'</button></div></div>';
      }).join('');
    };
  }
  if(!window.__DASH_TRAINING_VALIDATION_OPEN){
    window.__DASH_TRAINING_VALIDATION_OPEN=true;
    var oldOpen=window.openModule;
    window.openModule=function(i){
      var ms=window.list(),m=ms[i],r=window.trainingRecord(m&&m.title),testPassed=r&&['passed','completed'].includes(String(r.status||'').toLowerCase()),retraining=String(r&&r.owner_validation_status||'').toUpperCase()==='RETRAINING_REQUIRED';
      if(!m)return;if(i>0&&!window.passedName(ms[i-1].title))return;
      oldOpen(i);
      document.getElementById('submit').style.display=(testPassed&&!retraining)?'none':'inline-block';
    };
  }
  window.render();
}
var tries=0,timer=setInterval(function(){tries++;apply();if(tries>100)clearInterval(timer);},100);
setInterval(function(){refreshRecords().then(function(){if(window.__DASH_TRAINING_VALIDATION_RENDER)window.render();});},3000);
refreshRecords();
})();
