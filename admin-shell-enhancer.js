/* Loads the live admin portal modules into the iframe shell and guarantees Sign Out is available. */
(function(){
  const frame=document.getElementById('portal');
  if(!frame)return;
  frame.addEventListener('load',function(){
    const doc=frame.contentDocument;
    if(!doc||doc.getElementById('dashShellEnhancer'))return;
    const marker=doc.createElement('script');marker.id='dashShellEnhancer';
    marker.src='admin-portal-tools.js?v=20260821-4';
    doc.head.appendChild(marker);
    const wait=doc.createElement('script');wait.src='admin-waitlist.js?v=20260821-4';doc.head.appendChild(wait);
  });
})();
