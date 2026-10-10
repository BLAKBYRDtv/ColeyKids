// Coley Kids — site behavior
// No animation library, no scroll-driven effects. The site is static by
// design: everything you see is in its final position the moment the page
// paints. This file only handles two bits of real (non-decorative) logic.

(function () {
  // Sticky header gets a shadow once the page is scrolled — a plain class
  // toggle, no transition/animation attached to it.
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();

// ---------------------------------------------------------------------
// Little Legends Fund — donate widget. Real functionality (picking an
// amount), not decoration.
//
// NOT WIRED TO A REAL DESTINATION ON PURPOSE. "paypal.me/ColeyKids" is
// someone else's real, unrelated PayPal account — not ours — so this must
// never link there. The amount picker stays fully interactive; the button
// just shows a "not connected yet" note instead of navigating anywhere.
//
// TODO once you have your own real PayPal.me handle (or a Stripe Payment
// Link): set DONATE_URL_BASE below (e.g. 'https://paypal.me/YourRealHandle')
// and this will start sending people there instead of showing the note.
// ---------------------------------------------------------------------
(function () {
  var DONATE_URL_BASE = ''; // <-- set to your real donation link once you have one; leave blank until then
  var amtButtons = document.querySelectorAll('.amt-btn');
  var customInput = document.getElementById('customAmt');
  var donateBtn = document.getElementById('donateBtn');
  var donateNote = document.getElementById('donateNote');
  if (!donateBtn || !amtButtons.length) return;

  var current = 25;

  function setActive(activeBtn) {
    amtButtons.forEach(function (b) {
      b.classList.toggle('active', b === activeBtn);
    });
  }

  function updateButton() {
    var amt = Math.max(1, Math.round(current));
    donateBtn.textContent = 'Donate $' + amt;
  }

  donateBtn.addEventListener('click', function (e) {
    if (!DONATE_URL_BASE) {
      e.preventDefault();
      if (donateNote) donateNote.textContent = 'Online giving is being set up — check back soon.';
      return;
    }
    donateBtn.href = DONATE_URL_BASE + '/' + Math.max(1, Math.round(current));
  });

  amtButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      current = parseFloat(btn.dataset.amt);
      if (customInput) customInput.value = '';
      setActive(btn);
      updateButton();
    });
  });

  if (customInput) {
    customInput.addEventListener('input', function () {
      if (customInput.value) {
        current = parseFloat(customInput.value) || 1;
        setActive(null);
        updateButton();
      }
    });
  }

  setActive(document.querySelector('.amt-btn[data-amt="25"]'));
  updateButton();
})();
