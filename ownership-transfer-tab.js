/* DASH Mobile Services — Super Admin Ownership Transfer tab integration
   Safe, additive module: does not replace the production admin portal. */
(function () {
  'use strict';

  function addOwnershipTransferTab() {
    var aside = document.querySelector('aside');
    if (!aside || document.getElementById('ownershipTransferNav')) return;

    var button = document.createElement('button');
    button.id = 'ownershipTransferNav';
    button.type = 'button';
    button.textContent = 'Ownership Transfer';
    button.title = 'Super Admin only — customer-to-DASH and DASH-to-pawn-shop records';

    button.addEventListener('click', function () {
      var target = document.getElementById('ownershipTransferSection');
      if (target) {
        document.querySelectorAll('.section').forEach(function (s) { s.classList.remove('active'); });
        target.classList.add('active');
        document.querySelectorAll('aside button').forEach(function (b) { b.classList.remove('active'); });
        button.classList.add('active');
        return;
      }
      window.location.href = 'ownership-transfer.html';
    });

    var ownerControls = Array.from(aside.querySelectorAll('button')).find(function (b) {
      return b.textContent.trim() === 'Owner Management';
    });

    if (ownerControls && ownerControls.parentElement) {
      ownerControls.parentElement.appendChild(button);
    } else {
      aside.appendChild(button);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addOwnershipTransferTab);
  } else {
    addOwnershipTransferTab();
  }
})();
