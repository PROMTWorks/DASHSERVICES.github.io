/* DASH Services Payments redesign. This replaces only the existing Payments section at runtime. */
(function(){
  function renderPayments(){
    const section=document.getElementById('payments');
    if(!section || section.dataset.paymentsRedesign==='1') return;
    section.dataset.paymentsRedesign='1';
    section.classList.add('payments-redesign');
    section.innerHTML=`
      <div class="title"><div><h1>Payments</h1><p>View, verify, track, and manage customer payments.</p></div><div class="toolbar"><button class="btn light" type="button" onclick="window.print()">Export Payments</button></div></div>
      <div class="payments-notice"><b>Payment processing:</b> Payment records are ready for real customer transactions. A future payment processor can populate this area automatically without changing the admin layout.</div>
      <div class="payment-cards">
        <div class="payment-card"><div class="payment-label">TOTAL RECEIVED</div><div class="payment-value">$0.00</div><div class="payment-muted">No completed payments</div></div>
        <div class="payment-card"><div class="payment-label">PENDING PAYMENTS</div><div class="payment-value">$0.00</div><div class="payment-muted">No payments awaiting confirmation</div></div>
        <div class="payment-card"><div class="payment-label">REFUNDS</div><div class="payment-value">$0.00</div><div class="payment-muted">No refunds recorded</div></div>
        <div class="payment-card"><div class="payment-label">FAILED PAYMENTS</div><div class="payment-value">$0.00</div><div class="payment-muted">No failed payments</div></div>
      </div>
      <div class="payment-panel"><div class="payment-head"><h2>Payment Records</h2><div class="payment-pills"><span class="payment-pill">Paid</span><span class="payment-pill">Pending</span><span class="payment-pill">Failed</span><span class="payment-pill">Refunded</span></div></div><div class="payment-body">
        <div class="payment-filters" style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px;align-items:end">
          <label style="font-size:12px;color:#475569;font-weight:700">Payment Source<br><select id="payment-source-filter" style="margin-top:5px;padding:9px 11px;border:1px solid #d7dde5;border-radius:8px;background:#fff"><option value="all">All</option><option value="online">Online</option><option value="in-person">In Person</option></select></label>
          <label style="font-size:12px;color:#475569;font-weight:700">Payment Method<br><select id="payment-method-filter" style="margin-top:5px;padding:9px 11px;border:1px solid #d7dde5;border-radius:8px;background:#fff"><option value="all">All</option><option value="card">Credit/Debit Card</option><option value="cash">Cash</option><option value="check">Check</option><option value="ach">ACH</option><option value="other">Other</option></select></label>
        </div>
        <div style="overflow-x:auto"><table class="payment-table"><thead><tr><th>Customer</th><th>Booking</th><th>Service</th><th>Amount</th><th>Payment Source</th><th>Payment Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody><tr><td colspan="9" class="payment-empty"><strong>No payments yet</strong>Customer payments will appear here once a real payment is received and recorded.</td></tr></tbody></table></div>
      </div></div>
      <div class="payment-panel"><div class="payment-head"><h2>Payment Details</h2></div><div class="payment-body"><div class="payment-details"><div class="payment-detail"><b>Payment ID</b><br><span>Available when a real payment is recorded.</span></div><div class="payment-detail"><b>Transaction ID</b><br><span>Provided by the connected payment processor.</span></div><div class="payment-detail"><b>Processor</b><br><span>Ready for future processor integration.</span></div><div class="payment-detail"><b>Payment Source</b><br><span>Online or In Person — tracked separately for business analysis.</span></div><div class="payment-detail"><b>Payment Method</b><br><span>Credit/Debit Card, Cash, Check, ACH, or Other.</span></div><div class="payment-detail"><b>Refund Status</b><br><span>No refund activity recorded.</span></div></div></div></div>
      <div class="payment-panel"><div class="payment-head"><h2>In-Person vs. Online Activity</h2></div><div class="payment-body"><div class="payment-cards" style="margin:0"><div class="payment-card"><div class="payment-label">ONLINE PAYMENTS</div><div class="payment-value">0</div><div class="payment-muted">$0.00 received online</div></div><div class="payment-card"><div class="payment-label">IN-PERSON PAYMENTS</div><div class="payment-value">0</div><div class="payment-muted">$0.00 received in person</div></div></div><div class="payment-muted" style="margin-top:14px">Use this comparison over time to understand how much customer activity happens at DASH Services in person. It can provide useful business-demand data when evaluating future services such as a U-Haul dealership.</div></div></div>`;
  }
  function load(){
    if(!document.querySelector('link[data-payments-design]')){const l=document.createElement('link');l.rel='stylesheet';l.href='payments-design.css';l.dataset.paymentsDesign='1';document.head.appendChild(l)}
    renderPayments();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
  window.renderDASHPayments=renderPayments;
})();