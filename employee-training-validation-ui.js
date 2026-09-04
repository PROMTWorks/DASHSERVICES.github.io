/* DASH MOBILE SERVICES — Employee Training Validation UI */
(function(){
'use strict';
function apply(){
  if(typeof window.records==='undefined' || typeof window.list!=='function' || typeof window.passedName!=='function') return;
  var originalPassed=window.passedName;
  window.passedName=function(name){
    var r=(window.records||[]).find(function(x){return x.training_name===name;});
    return r && ['passed','completed'].includes(String(r.status||'').toLowerCase()) && String(r.owner_validation_status||'').toUpperCase()==='VALIDATED';
  };
  window.trainingRecord=function(name){
    return (window.records||[]).find(function(x){return x.training_name===name;});
  };
  var oldRender=window.render;
  window.render=function(){
    var ms=window.list(), all=ms.length, validated=ms.filter(function(m){return window.passedName(m.title);}).length;
    var passedTests=ms.filter(function(m){var r=window.trainingRecord(m.title);return r&&['passed','completed'].includes(String(r.status||'').toLowerCase());}).length;
    var awaiting=ms.filter(function(m){var r=window.trainingRecord(m.title);return r&&['passed','completed'].includes(String(r.status||'').toLowerCase())&&String(r.owner_validation_status||'').toUpperCase()!=='VALIDATED';}).length;
    var next=ms.findIndex(function(m){return !window.passedName(m.title);})+1||all;
    document.getElementById('passed').textContent=validated;
    document.getElementById('current').textContent=validated===all?'Complete':next;
    document.getElementById('status').textContent=validated===all?'OWNER VALIDATED':awaiting?'AWAITING OWNER VALIDATION':'IN TRAINING';
    document.getElementById('modules').innerHTML=ms.map(function(m,i){
      var r=window.trainingRecord(m.title), testPassed=r&&['passed','completed'].includes(String(r.status||'').toLowerCase()), ok=window.passedName(m.title), prev=i===0||window.passedName(ms[i-1].title);
      var state=ok?'OWNER VALIDATED':testPassed?'AWAITING OWNER VALIDATION':(prev?'READY':'LOCKED');
      var cls=ok?'ok':testPassed?'warn':'';
      var button=ok?'Review':testPassed?'Review Training':'Start Training';
      return '<div class="row"><div class="rowtop"><div><strong>Module '+(i+1)+': '+window.esc(m.title)+'</strong><div class="muted">'+(ok?'Training approved by Owner':testPassed?'Test passed — waiting for Owner validation':prev?'Ready to begin':'Locked until previous module is Owner-validated')+'</div></div><span class="pill '+cls+'">'+state+'</span></div><div style="margin-top:12px"><button class="btn '+(ok||testPassed?'light':'')+'" '+(!prev?'disabled':'')+' onclick="openModule('+i+')">'+button+'</button></div></div>';
    }).join('');
  };
  var oldOpen=window.openModule;
  window.openModule=function(i){
    var ms=window.list(),m=ms[i],r=window.trainingRecord(m&&m.title),testPassed=r&&['passed','completed'].includes(String(r.status||'').toLowerCase());
    if(!m)return;
    if(i>0&&!window.passedName(ms[i-1].title))return;
    window.__trainingReviewOnly=!!testPassed && String(r.owner_validation_status||'').toUpperCase()!=='RETRAINING_REQUIRED';
    oldOpen(i);
    if(window.__trainingReviewOnly){document.getElementById('submit').style.display='none';}
  };
  if(!window.__DASH_TRAINING_VALIDATION_UI){window.__DASH_TRAINING_VALIDATION_UI=true;window.render();}
}
var tries=0, timer=setInterval(function(){tries++;apply();if(window.records&&typeof window.list==='function'||tries>100)clearInterval(timer);},100);
})();
