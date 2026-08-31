/* DASH Dispatch Center navigation. The full dispatch UI lives in dispatch-center.html. */
(function(){'use strict';
function boot(){
  if(!document.body||document.getElementById('dashDispatchButton')) return;
  const aside=document.querySelector('aside'); if(!aside) return;
  const group=document.createElement('div'); group.className='group'; group.textContent='Dispatch';
  const btn=document.createElement('button'); btn.id='dashDispatchButton'; btn.type='button'; btn.textContent='Dispatch Center'; btn.title='Open DASH Dispatch Center';
  btn.onclick=function(){window.top.location.href='dispatch-center.html'};
  const groups=aside.querySelectorAll('.group');
  if(groups.length) aside.insertBefore(group,groups[0].nextSibling),aside.insertBefore(btn,group.nextSibling); else aside.append(group,btn);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,300));else setTimeout(boot,300);
setTimeout(boot,1200);setTimeout(boot,2500);
})();