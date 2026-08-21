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
      <div class="payment-panel"><div class="payment-head"><h2>Payment Records</h2><div class="payment-pills"><span class="payment-pill">Paid</span><span class="payment-pill">Pending</span><span class="payment-pill">Failed</span><span class="payment-pill">Refunded</span></div></div><div class="payment-body"><div style="overflow-x:auto"><table class="payment-table"><thead><tr><th>Customer</th><th>Booking</th><th>Service</th><th>Amount</th><th>Payment Method</th><th>Status</th><th>Date</th><th>Action</th></tr></thead><tbody><tr><td colspan="8" class="payment-empty"><strong>No payments yet</strong>Customer payments will appear here once a real payment is received and recorded.</td></tr></tbody></table></div></div></div>
      <div class="payment-panel"><div class="payment-head"><h2>Payment Details</h2></div><div class="payment-body"><div class="payment-details"><div class="payment-detail"><b>Payment ID</b><br><span>Available when a real payment is recorded.</span></div><div class="payment-detail"><b>Transaction ID</b><br><span>Provided by the connected payment processor.</span></div><div class="payment-detail"><b>Processor</b><br><span>Ready for future processor integration.</span></div><div class="payment-detail"><b>Refund Status</b><br><span>No refund activity recorded.</span></div></div></div></div>`;
  }
  function load(){
    if(!document.querySelector('link[data-payments-design]')){const l=document.createElement('link');l.rel='stylesheet';l.href='payments-design.css';l.dataset.paymentsDesign='1';document.head.appendChild(l)}
    renderPayments();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',load); else load();
  window.renderDASHPayments=renderPayments;
})();