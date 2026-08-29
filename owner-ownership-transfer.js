/* DASH Mobile Services — Owner Management Ownership Transfer tab
   Safe, additive module. It does not replace or modify the existing owner dashboard systems. */
(function () {
  'use strict';

  function addStyles() {
    if (document.getElementById('dashOwnerOwnershipStyles')) return;
    var style = document.createElement('style');
    style.id = 'dashOwnerOwnershipStyles';
    style.textContent = '.owner-ot-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.owner-ot-card{background:#fff;border:1px solid #e2e7ed;border-radius:12px;padding:18px}.owner-ot-card h3{margin:0 0 8px}.owner-ot-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.owner-ot-link{display:inline-block;text-decoration:none}.owner-ot-note{padding:13px;border-left:4px solid #3b82f6;background:#eff6ff;border-radius:7px;font-size:13px;margin-bottom:18px}@media(max-width:700px){.owner-ot-grid{grid-template-columns:1fr}}';
    document.head.appendChild(style);
  }

  function activate(button, section) {
    document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
    section.classList.add('active');
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
    button.classList.add('active');
    try { history.replaceState(null, '', '#ownershipTransfer'); } catch (_) {}
  }

  function addTabAndSection() {
    var tabs = document.querySelector('.tabs');
    var main = document.querySelector('main');
    if (!tabs || !main) return false;

    addStyles();

    var button = document.querySelector('[data-owner-tab="ownershipTransfer"]');
    if (!button) {
      button = document.createElement('button');
      button.className = 'tab';
      button.type = 'button';
      button.setAttribute('data-owner-tab', 'ownershipTransfer');
      button.textContent = 'Ownership Transfer';
      tabs.appendChild(button);
    }

    var section = document.getElementById('ownershipTransfer');
    if (!section) {
      section = document.createElement('section');
      section.id = 'ownershipTransfer';
      section.className = 'section';
      section.innerHTML = '<div class="panel"><div class="head"><div><h2>Ownership Transfer</h2><div class="muted">Owner / Super Admin only · Internal records for property received from customers and later transferred to a buyer or pawn shop.</div></div><span class="pill">Owner only</span></div><div class="body"><div class="owner-ot-note"><b>Use this area for the two records:</b> complete the Customer → DASH transfer when DASH actually takes possession of an item, and complete the DASH → Pawn Shop / Buyer record when the receiving business accepts the item. Keep the related receipt or transaction paperwork with the company record.</div><div class="owner-ot-grid"><div class="owner-ot-card"><h3>Customer → DASH</h3><p class="muted">Transfer of possession and ownership from the customer to DASH MOBILE SERVICES.</p><div class="owner-ot-actions"><a class="btn owner-ot-link" href="admin-transfer-documents.html#customer-to-dash">Open Customer → DASH Document</a></div></div><div class="owner-ot-card"><h3>DASH → Pawn Shop / Buyer</h3><p class="muted">Internal company record confirming the item's transfer to the pawn shop or other buyer.</p><div class="owner-ot-actions"><a class="btn owner-ot-link" href="admin-transfer-documents.html#dash-to-pawn-shop">Open DASH → Pawn Shop Document</a></div></div></div><div class="owner-ot-actions"><a class="btn light owner-ot-link" href="admin-transfer-documents.html">Open Both Ownership Transfer Documents</a></div></div></div>';
      main.appendChild(section);
    }

    if (button.dataset.ownerOtBound !== '1') {
      button.dataset.ownerOtBound = '1';
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        activate(button, section);
      });
    }

    if (location.hash === '#ownershipTransfer') activate(button, section);
    return true;
  }

  function start() {
    if (addTabAndSection()) return;
    var attempts = 0;
    var timer = setInterval(function () {
      attempts += 1;
      if (addTabAndSection() || attempts >= 20) clearInterval(timer);
    }, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
