(() => {
'use strict';
if(window.__dashOwnerBackendBusLoaded)return;window.__dashOwnerBackendBusLoaded=true;
window.DASH_OWNER_BUS={
 version:'1.0',
 events:{inventory:'inventory.updated',job:'job.updated',employee:'employee.updated',customer:'customer.updated',complaint:'complaint.updated',callback:'callback.updated',equipment:'equipment.updated',report:'employee.reported'},
 emit(name,detail){window.dispatchEvent(new CustomEvent(`dash:${name}`,{detail:detail||{}}));},
 subscribe(name,handler){const fn=e=>handler(e.detail||{});window.addEventListener(`dash:${name}`,fn);return()=>window.removeEventListener(`dash:${name}`,fn);},
 refresh(){window.dispatchEvent(new CustomEvent('dash:owner-backend-refresh'));}
};
})();