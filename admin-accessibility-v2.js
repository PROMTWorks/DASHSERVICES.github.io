/* DASH MOBILE SERVICES Admin Accessibility redesign v2. Role definitions and permission roadmap. */
(function(){
  function renderAccess(){
    const section=document.getElementById('access');
    if(!section || section.dataset.accessRedesign==='2') return;
    section.dataset.accessRedesign='2';
    section.innerHTML=`
      <div class="title"><div><h1>Admin Accessibility</h1><p>Role-based access and permission management for the DASH MOBILE SERVICES admin portal.</p></div></div>
      <div class="notice"><b>Access control:</b> Each role should only have access to the information and actions required for its responsibilities. Super Admin controls role assignments and permission changes.</div>
      <div class="cards" style="grid-template-columns:repeat(3,1fr)">
        <div class="card"><div class="label">SUPER ADMIN</div><div class="value" style="font-size:22px">Full</div><div class="muted">Complete business access, including settings, financial records, employee management, policies, assets, and security.</div></div>
        <div class="card"><div class="label">MANAGER</div><div class="value" style="font-size:22px">Limited</div><div class="muted">Operational access only. Managers can work with assigned operational areas without unrestricted owner-level controls.</div></div>
        <div class="card"><div class="label">EMPLOYEE</div><div class="value" style="font-size:22px">Assigned</div><div class="muted">Access limited to the employee's own information, schedule, hours, assigned work, and other approved employee functions.</div></div>
      </div>
      <div class="panel"><div class="head"><h2>Role Permissions</h2><span class="pill">Permission matrix</span></div><div class="body" style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr><th style="text-align:left;padding:11px;border-bottom:1px solid #e2e7ed">Admin Area</th><th style="padding:11px;border-bottom:1px solid #e2e7ed">Super Admin</th><th style="padding:11px;border-bottom:1px solid #e2e7ed">Manager</th><th style="padding:11px;border-bottom:1px solid #e2e7ed">Employee</th></tr></thead><tbody>
      ${[['Dashboard','Full','View','Assigned/limited'],['Bookings','Full','Operational','Assigned work'],['Payments','Full','View/manage as authorized','No financial administration'],['Customers','Full','Operational','Assigned customers only'],['Fleet & Equipment','Full','View/assign/maintenance docs','Assigned assets only'],['Revenue & Company Finances','Full','Limited operational view','No access'],['Policies','Full edit/publish','View','View applicable policies'],['Employee Records','Full','Assigned staff only','Own record only'],['Security & Activity','Full','Limited','No access'],['Business Settings','Full','No access','No access']].map(r=>`<tr><td style="padding:12px;border-bottom:1px solid #eef2f7;font-weight:700">${r[0]}</td><td style="padding:12px;text-align:center;border-bottom:1px solid #eef2f7">${r[1]}</td><td style="padding:12px;text-align:center;border-bottom:1px solid #eef2f7">${r[2]}</td><td style="padding:12px;text-align:center;border-bottom:1px solid #eef2f7">${r[3]}</td></tr>`).join('')}
      </tbody></table></div></div>
      <div class="panel"><div class="head"><h2>Future Permission Management</h2></div><div class="body"><div class="rows"><div class="row"><div><strong>Role assignment</strong><span class="mini">Assign Super Admin, Manager, or Employee access to an authenticated account.</span></div><span class="pill">Super Admin only</span></div><div class="row"><div><strong>Module permissions</strong><span class="mini">Allow or restrict individual areas such as Payments, Fleet, Policies, or Finances.</span></div><span class="pill">Configurable</span></div><div class="row"><div><strong>Employee self-service</strong><span class="mini">Employees can see their own schedule, hours, assigned work, and approved personal records without seeing other employees' information.</span></div><span class="pill">Planned</span></div><div class="row"><div><strong>Permission audit trail</strong><span class="mini">Record who changed a role or permission, what changed, and when.</span></div><span class="pill">Planned</span></div></div></div></div>
      <div class="security"><b>Security principle:</b> This page describes the intended permission model. Actual enforcement should be handled by authenticated server-side/database authorization rules, not only by hiding buttons in the browser.</div>`;
  }
  function load(){renderAccess();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
  window.renderDASHAdminAccessibility=renderAccess;
})();
