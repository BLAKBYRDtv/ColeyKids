/* Coley Kids — site behaviour + motion. Vanilla JS, no libraries.
   Everything degrades gracefully: content is visible without this file. */
(function () {
  'use strict';
  window.__coley = true;
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ------------------------------------------------------------------
     Catalog (shared by shop, quick view, bag and the crate builder)
     ------------------------------------------------------------------ */
  var CATALOG = {
    tee:        { name: 'Cool Kids Graphic Tee', cat: 'Apparel', price: 24, img: 'img/p-tee.jpg', sizes: true, desc: 'A soft graphic tee with a vintage-washed look. Cut a little roomy, the way a classic tee should be.' },
    varsity:    { name: "Lil' Varsity Sweatsuit Set", cat: 'Apparel', price: 48, img: 'img/p-varsity.jpg', sizes: true, desc: 'Crewneck and jogger set with striped varsity rib trim. Made for naps, playgrounds and photo day.' },
    track:      { name: 'Old School Track Set', cat: 'Apparel', price: 52, img: 'img/p-tracksuit.jpg', sizes: true, desc: 'Zip-front track jacket and matching pants with side stripes. Straight out of the park jam, sized for little legs.' },
    overalls:   { name: 'Denim Overall Set', cat: 'Apparel', price: 42, img: 'img/p-overalls.jpg', sizes: true, desc: 'Washed denim overalls with a striped long-sleeve tee. A forever classic.' },
    moto:       { name: 'Rockstar Moto Jacket', cat: 'Apparel', price: 58, img: 'img/p-rockstar.jpg', sizes: true, desc: 'A moto-style jacket for the loudest one in the house. Pairs with anything, especially attitude.' },
    shades:     { name: 'Baby Shades', cat: 'Accessories', price: 16, img: 'img/p-shades.jpg', desc: 'Tiny frames, big attitude. The finishing touch on any fit.' },
    headphones: { name: 'Mini Headphones', cat: 'Accessories', price: 28, img: 'img/p-headphones.jpg', desc: 'Cushioned headphones sized for small heads, for the littlest listeners in the house.' },
    sneakers:   { name: 'Glitter High-Tops', cat: 'Accessories', price: 34, img: 'img/p-sneakers.jpg', sizes: true, desc: 'Sparkle high-tops for first steps and fresh steps.' },
    cassette:   { name: 'Cassette-Tape Teether', cat: 'Toys', price: 14, img: 'img/p-cassette.jpg', desc: 'A chewable take on the mixtape. Impossible to tangle.' },
    boombox:    { name: 'Mini Boombox Rattle', cat: 'Toys', price: 22, img: 'img/p-boombox.jpg', desc: 'A boombox-shaped rattle with a carry handle for little hands.' },
    cassettes:  { name: 'Plush Cassette Buddy', cat: 'Toys', price: 26, img: 'img/p-cassettes.jpg', desc: 'A huggable plush tape with embroidered reels. The first mixtape they will never lose.' },
    cowboy:     { name: 'Cowboy Hat Rattle', cat: 'Toys', price: 18, img: 'img/p-cowboy.jpg', desc: 'A soft-sided cowboy hat rattle for the littlest line dancers.' },
    'book-hiphop': { name: 'Music Legends Board Book: Hip Hop', cat: 'Gifts', price: 15, book: { tone: 'b-red', name: 'Hip Hop Legends' }, desc: 'A first board book about the artists who built the sound. Final title chosen at launch.' },
    'book-rock': { name: 'Music Legends Board Book: Rock', cat: 'Gifts', price: 15, book: { tone: 'b-ink', name: 'Rock Legends' }, desc: 'A first board book about the artists who built the sound. Final title chosen at launch.' },
    'book-country': { name: 'Music Legends Board Book: Country', cat: 'Gifts', price: 15, book: { tone: 'b-sage', name: 'Country Legends' }, desc: 'A first board book about the artists who built the sound. Final title chosen at launch.' },
    giftbox: { name: 'Signature Gift Box', cat: 'Gifts', price: 10, img: 'img/crate-build.jpg', desc: 'Our kraft gift box, tied and ready. Add one to any order that is headed straight to a party.' }
  };
  var THEMES = {
    hiphop:  { name: 'Old School Hip Hop', items: ['tee', 'varsity', 'boombox', 'cassette', 'shades', 'track', 'book-hiphop'] },
    rock:    { name: "Rock N' Roll", items: ['moto', 'headphones', 'cassettes', 'sneakers', 'shades', 'cassette', 'book-rock'] },
    country: { name: 'Country', items: ['cowboy', 'overalls', 'sneakers', 'headphones', 'cassettes', 'cassette', 'book-country'] }
  };
  var SIZES = { 3: { name: 'Starter Crate', price: 38 }, 5: { name: 'Classic Crate', price: 58 }, 7: { name: 'Deluxe Crate', price: 82 } };

  function thumbHTML(id) {
    var p = CATALOG[id];
    if (!p) return '';
    if (p.book) return '<div class="book ' + p.book.tone + '" style="position:absolute;inset:0;padding:8px"><span class="mini-book">' + p.book.name + '</span></div>';
    return '<img src="' + p.img + '" alt="" loading="lazy">';
  }

  /* ------------------------------------------------------------------
     Page curtain transition
     ------------------------------------------------------------------ */
  var curtain = $('.curtain');
  function liftCurtain() {
    if (!curtain || reduce) return;
    curtain.className = 'curtain cover';
    void curtain.offsetWidth;
    curtain.className = 'curtain leave';
  }
  if (curtain) {
    if (reduce) curtain.style.display = 'none';
    else { curtain.classList.add('cover'); requestAnimationFrame(function () { setTimeout(liftCurtain, 120); }); }
    window.addEventListener('pageshow', function (e) { if (e.persisted) liftCurtain(); });
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || reduce) return;
      var href = a.getAttribute('href');
      if (!href || href.charAt(0) === '#' || a.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!/\.html(#.*)?$/.test(href) || /^https?:/.test(href)) return;
      var targetPage = href.split('#')[0], herePage = (location.pathname.split('/').pop() || 'index.html');
      if (targetPage === herePage || (targetPage === 'index.html' && herePage === '')) return;
      e.preventDefault();
      curtain.className = 'curtain';
      void curtain.offsetWidth;
      curtain.className = 'curtain enter';
      setTimeout(function () { window.location.href = href; }, 520);
    });
  }

  /* ------------------------------------------------------------------
     Header + mobile menu
     ------------------------------------------------------------------ */
  var header = $('.site-header');
  function onScrollHeader() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  var menu = $('.menu-overlay');
  $$('[data-menu-open]').forEach(function (b) { b.addEventListener('click', function () { menu.classList.add('open'); menu.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }); });
  $$('[data-menu-close]').forEach(function (b) { b.addEventListener('click', closeMenu); });
  function closeMenu() { if (!menu) return; menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }

  /* ------------------------------------------------------------------
     Hero slideshow (home)
     ------------------------------------------------------------------ */
  var hero = $('.hero');
  if (hero) {
    var texts = $$('.hero-text', hero), imgs = $$('.hero-img', hero), bars = $$('.hero-progress > button', hero);
    var countEl = $('.hero-count b', hero);
    var SLIDE_MS = 6500, cur = 0, timer = null, n = imgs.length;
    hero.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
    texts.forEach(function (t) { $$('.ln > span', t).forEach(function (s, i) { s.style.setProperty('--i', i); }); });
    function go(to) {
      to = (to + n) % n;
      if (to === cur && imgs[cur].classList.contains('is-active')) return;
      var from = cur;
      imgs.forEach(function (im, i) { im.classList.remove('is-prev'); if (i !== to && i !== from) im.classList.remove('is-active'); });
      imgs[from].classList.remove('is-active'); imgs[from].classList.add('is-prev');
      void imgs[to].offsetWidth;
      imgs[to].classList.add('is-active');
      texts[from].classList.remove('is-active'); texts[from].classList.add('is-leaving');
      setTimeout(function () { texts[from].classList.remove('is-leaving'); }, 700);
      texts[to].classList.add('is-active');
      bars.forEach(function (b, i) { b.classList.remove('is-active'); b.classList.toggle('is-done', i < to); });
      void bars[to].offsetWidth; bars[to].classList.add('is-active');
      if (countEl) countEl.textContent = ('0' + (to + 1)).slice(-2);
      cur = to; restart();
    }
    function restart() { clearTimeout(timer); if (!reduce) timer = setTimeout(function () { go(cur + 1); }, SLIDE_MS); }
    bars.forEach(function (b, i) { b.addEventListener('click', function () { go(i); }); });
    var prevB = $('[data-hero-prev]', hero), nextB = $('[data-hero-next]', hero);
    if (prevB) prevB.addEventListener('click', function () { go(cur - 1); });
    if (nextB) nextB.addEventListener('click', function () { go(cur + 1); });
    // swipe
    var sx = null;
    hero.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', function (e) { if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1)); sx = null; });
    // pause while tab hidden
    document.addEventListener('visibilitychange', function () { if (document.hidden) clearTimeout(timer); else restart(); });
    // first slide in
    imgs[0].classList.add('is-active'); bars[0].classList.add('is-active');
    setTimeout(function () { texts[0].classList.add('is-active'); }, reduce ? 0 : 450);
    restart();
  }

  /* ------------------------------------------------------------------
     Marquees speed up with scroll velocity
     ------------------------------------------------------------------ */
  var marqAnims = [];
  if (!reduce && Element.prototype.getAnimations) {
    setTimeout(function () {
      $$('.marquee-row').forEach(function (r) { marqAnims = marqAnims.concat(r.getAnimations()); });
    }, 200);
    var lastY = window.scrollY, boost = 0;
    window.addEventListener('scroll', function () { var dy = Math.abs(window.scrollY - lastY); lastY = window.scrollY; boost = Math.min(5, boost + dy / 40); }, { passive: true });
    (function tick() {
      boost *= 0.92;
      var rate = 1 + boost;
      for (var i = 0; i < marqAnims.length; i++) marqAnims[i].playbackRate = rate;
      requestAnimationFrame(tick);
    })();
  }

  /* ------------------------------------------------------------------
     Scroll reveals
     ------------------------------------------------------------------ */
  $$('[data-lines]').forEach(function (el) { $$('.ln > span', el).forEach(function (s, i) { s.style.setProperty('--i', i); }); });
  var revealEls = $$('[data-reveal], [data-lines], .step');
  if ('IntersectionObserver' in window && !reduce) {
    // A fully clipped element never reports as intersecting, so clip
    // reveals are observed through their parent and the class lands on the child.
    var proxyMap = new Map();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var targets = proxyMap.get(en.target) || [en.target];
        targets.forEach(function (t) { t.classList.add('in'); });
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    revealEls.forEach(function (el) {
      var watch = el.getAttribute('data-reveal') === 'clip' && el.parentElement ? el.parentElement : el;
      if (watch !== el) { var arr = proxyMap.get(watch) || []; arr.push(el); proxyMap.set(watch, arr); }
      io.observe(watch);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ------------------------------------------------------------------
     Parallax + word-by-word light-up (one rAF loop)
     ------------------------------------------------------------------ */
  var parallax = $$('[data-parallax]');
  var wordBlocks = $$('[data-words]');
  wordBlocks.forEach(function (el) {
    var html = el.innerHTML.trim().split(/\s+/).map(function (w) {
      var hot = /\*$/.test(w) || /^\*/.test(w);
      w = w.replace(/\*/g, '');
      return '<span class="w' + (hot ? ' hot' : '') + '">' + w + '</span>';
    }).join(' ');
    el.innerHTML = html;
  });
  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    if (!reduce) {
      for (var i = 0; i < parallax.length; i++) {
        var el = parallax[i], r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) continue;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var off = (r.top + r.height / 2 - vh / 2) * -speed;
        el.style.transform = 'translate3d(0,' + off.toFixed(1) + 'px,0)';
      }
    }
    for (var j = 0; j < wordBlocks.length; j++) {
      var wb = wordBlocks[j], rr = wb.getBoundingClientRect();
      var p = (vh * 0.85 - rr.top) / (rr.height + vh * 0.35);
      p = Math.max(0, Math.min(1, p));
      var ws = wb.querySelectorAll('.w'), lit = reduce ? ws.length : Math.round(p * ws.length * 1.15);
      for (var k = 0; k < ws.length; k++) ws[k].classList.toggle('lit', k < lit);
    }
  }
  function requestFrame() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  frame();

  /* ------------------------------------------------------------------
     Crate accordion — panels expand / contract
     ------------------------------------------------------------------ */
  $$('.crates-acc').forEach(function (acc) {
    var panels = $$('.acc-panel', acc);
    function open(p) { panels.forEach(function (x) { var on = x === p; x.classList.toggle('is-open', on); x.setAttribute('aria-expanded', on ? 'true' : 'false'); }); }
    panels.forEach(function (p) {
      if (finePointer) p.addEventListener('mouseenter', function () { open(p); });
      p.addEventListener('click', function (e) { if (!p.classList.contains('is-open')) { e.preventDefault(); open(p); } });
      p.addEventListener('focus', function () { open(p); });
      p.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(p); } });
    });
  });

  /* ------------------------------------------------------------------
     Product rail: drag to scroll, arrows, progress bar
     ------------------------------------------------------------------ */
  $$('.rail-wrap').forEach(function (w) {
    var rail = $('.rail', w), bar = $('.rail-bar i', w);
    var prev = $('[data-rail-prev]', w.parentElement), next = $('[data-rail-next]', w.parentElement);
    function step() { var c = rail.querySelector('.p-card'); return c ? c.getBoundingClientRect().width + 24 : 300; }
    if (prev) prev.addEventListener('click', function () { rail.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { rail.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
    function upd() {
      var max = rail.scrollWidth - rail.clientWidth, vis = rail.clientWidth / rail.scrollWidth;
      if (bar) { bar.style.width = (vis * 100) + '%'; bar.style.transform = 'translateX(' + (max > 0 ? (rail.scrollLeft / max) * ((1 / vis) - 1) * 100 : 0) + '%)'; }
    }
    rail.addEventListener('scroll', upd, { passive: true }); window.addEventListener('resize', upd); upd();
    if (finePointer) {
      var down = false, startX = 0, startL = 0, moved = false;
      rail.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; startX = e.clientX; startL = rail.scrollLeft; });
      window.addEventListener('pointermove', function (e) { if (!down) return; var dx = e.clientX - startX; if (Math.abs(dx) > 6) { moved = true; rail.classList.add('dragging'); } rail.scrollLeft = startL - dx; });
      window.addEventListener('pointerup', function () { if (!down) return; down = false; setTimeout(function () { rail.classList.remove('dragging'); }, 0); });
      rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    }
  });

  /* ------------------------------------------------------------------
     Bag (drawer, toast, counts). Stored per-browser; never required.
     ------------------------------------------------------------------ */
  var BAG_KEY = 'coley-bag-v2';
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem(BAG_KEY) || '[]') || []; } catch (e) { bag = []; }
  function saveBag() { try { localStorage.setItem(BAG_KEY, JSON.stringify(bag)); } catch (e) {} }
  var drawer = $('.drawer'), scrim = $('.scrim'), toast = $('.toast');
  function money(n) { return '$' + n.toFixed(0); }
  function bagCount() { return bag.reduce(function (a, b) { return a + b.qty; }, 0); }
  function renderBag(bump) {
    var c = bagCount();
    $$('.bag-count').forEach(function (el) {
      el.textContent = c; el.classList.toggle('has', c > 0);
      if (bump) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    if (!drawer) return;
    var body = $('.drawer-body', drawer), totEl = $('.tot b', drawer);
    if (!bag.length) {
      body.innerHTML = '<div class="drawer-empty"><b>Your bag is<br>quiet.</b><p>Nothing in here yet. Let\'s fix that.</p><a class="btn btn-ink" href="shop.html">Shop the drop <span class="arrow">→</span></a></div>';
    } else {
      body.innerHTML = bag.map(function (it, idx) {
        var thumb = it.crate ? '<div class="thumb crate">' + it.size + '</div>' : '<div class="thumb" style="position:relative">' + thumbHTML(it.id) + '</div>';
        return '<div class="line-item">' + thumb + '<div><b>' + it.name + '</b><small>' + (it.note || '') + '</small><div class="qty"><button data-q="-1" data-idx="' + idx + '" aria-label="Decrease">−</button><span>' + it.qty + '</span><button data-q="1" data-idx="' + idx + '" aria-label="Increase">+</button></div></div><span class="lp">' + money(it.price * it.qty) + '</span></div>';
      }).join('');
    }
    var total = bag.reduce(function (a, b) { return a + b.price * b.qty; }, 0);
    if (totEl) totEl.textContent = money(total);
  }
  function addToBag(item) {
    var key = item.crate ? item.key : item.id + (item.note ? '|' + item.note : '');
    var found = bag.filter(function (b) { return b.key === key; })[0];
    if (found) found.qty += 1; else { item.key = key; item.qty = 1; bag.push(item); }
    saveBag(); renderBag(true); showToast(item);
  }
  var toastT = null;
  function showToast(item) {
    if (!toast) return;
    var img = item.crate ? '' : (CATALOG[item.id] && CATALOG[item.id].img ? '<img src="' + CATALOG[item.id].img + '" alt="">' : '');
    toast.innerHTML = img + '<span>Added: ' + item.name + '</span><button type="button" data-open-bag>View bag</button>';
    toast.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(function () { toast.classList.remove('show'); }, 3200);
  }
  var lastFocus = null, trapEl = null;
  function focusables(el) { return $$('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])', el).filter(function (x) { return x.offsetParent !== null; }); }
  function trap(el) { lastFocus = document.activeElement; trapEl = el; var f = focusables(el); if (f.length) setTimeout(function () { f[0].focus({ preventScroll: true }); }, 60); }
  function untrap() { trapEl = null; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); lastFocus = null; }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !trapEl) return;
    var f = focusables(trapEl); if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!trapEl.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });
  function openDrawer() { if (!drawer) return; closeModal(); drawer.classList.add('open'); scrim.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); trap(drawer); }
  function closeDrawer() { if (!drawer || !drawer.classList.contains('open')) return; drawer.classList.remove('open'); if (!$('.modal.open')) scrim.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); untrap(); }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('[data-open-bag]')) { e.preventDefault(); toast && toast.classList.remove('show'); openDrawer(); return; }
    if (t.closest('[data-close-bag]')) { closeDrawer(); return; }
    if (scrim && t === scrim) { closeDrawer(); closeModal(); return; }
    var q = t.closest('[data-q]');
    if (q) { var i = +q.getAttribute('data-idx'); bag[i].qty += +q.getAttribute('data-q'); if (bag[i].qty <= 0) bag.splice(i, 1); saveBag(); renderBag(false); return; }
    var add = t.closest('[data-add]');
    if (add) {
      e.preventDefault(); e.stopPropagation();
      var id = add.getAttribute('data-add'), p = CATALOG[id];
      if (!p) return;
      addToBag({ id: id, name: p.name, price: p.price, note: p.cat });
      if (add.classList.contains('p-add')) { var old = add.textContent; add.textContent = 'Added ✓'; add.classList.add('added'); setTimeout(function () { add.textContent = old; add.classList.remove('added'); }, 1600); }
      return;
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeDrawer(); closeModal(); closeMenu(); } });
  renderBag(false);

  /* ------------------------------------------------------------------
     Quick view modal — the card "expands" into a full view
     ------------------------------------------------------------------ */
  var modal = $('.modal');
  var mState = { id: null, size: null };
  function openModal(id) {
    var p = CATALOG[id]; if (!p || !modal) return;
    mState.id = id; mState.size = p.sizes ? '12M' : null;
    var media = $('.modal-media', modal);
    media.innerHTML = p.book ? '<div class="book ' + p.book.tone + '"><span class="bk-top">Board Book · Coley Kids</span><span class="bk-name">' + p.book.name + '</span><span class="bk-disc"></span></div>' : '<img src="' + p.img + '" alt="' + p.name + '">';
    $('.modal-body .p-cat', modal).textContent = p.cat;
    $('.modal-body h2', modal).textContent = p.name;
    $('.modal-body .mp', modal).textContent = money(p.price);
    $('.modal-body .md', modal).textContent = p.desc;
    var sizeWrap = $('.modal-sizes', modal);
    sizeWrap.hidden = !p.sizes;
    $$('.opt', sizeWrap).forEach(function (o) { o.classList.toggle('is-on', o.textContent === mState.size); });
    modal.classList.add('open'); scrim.classList.add('show'); modal.setAttribute('aria-hidden', 'false');
    trap(modal);
  }
  function closeModal() { if (!modal || !modal.classList.contains('open')) return; modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); if (!(drawer && drawer.classList.contains('open'))) scrim.classList.remove('show'); untrap(); }
  if (modal) {
    $('.modal-close', modal).addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    $$('.modal-sizes .opt', modal).forEach(function (o) { o.addEventListener('click', function () { mState.size = o.textContent; $$('.modal-sizes .opt', modal).forEach(function (x) { x.classList.toggle('is-on', x === o); }); }); });
    $('[data-modal-add]', modal).addEventListener('click', function () {
      var p = CATALOG[mState.id]; if (!p) return;
      addToBag({ id: mState.id, name: p.name, price: p.price, note: mState.size ? 'Size ' + mState.size : p.cat });
      closeModal();
    });
  }
  document.addEventListener('click', function (e) {
    var v = e.target.closest('[data-quickview]');
    if (!v || e.target.closest('[data-add]')) return;
    var card = v.closest('[data-id]'); if (!card) return;
    if (!finePointer && !card.classList.contains('is-open') && !e.target.closest('.p-view')) {
      $$('.p-card.is-open').forEach(function (c) { c.classList.remove('is-open'); });
      card.classList.add('is-open'); return;
    }
    openModal(card.getAttribute('data-id'));
  });

  /* touch: tap a crew card to reveal its caption */
  $$('.crew-card').forEach(function (c) { c.addEventListener('click', function () { if (!finePointer) c.classList.toggle('is-open'); }); });

  /* ------------------------------------------------------------------
     Shop: filters + sort with a staggered re-entry
     ------------------------------------------------------------------ */
  var grid = $('.shop-grid');
  if (grid) {
    var cards = $$('.p-card', grid), feature = $('.shop-feature', grid);
    var curFilter = 'all';
    function apply(sort) {
      var shown = cards.filter(function (c) { return curFilter === 'all' || c.getAttribute('data-cat') === curFilter; });
      cards.forEach(function (c) { c.classList.toggle('is-hidden', shown.indexOf(c) === -1); });
      if (feature) feature.style.display = curFilter === 'all' ? '' : 'none';
      if (sort && sort !== 'featured') {
        shown.sort(function (a, b) { var pa = +a.getAttribute('data-price'), pb = +b.getAttribute('data-price'); return sort === 'low' ? pa - pb : pb - pa; });
      } else {
        shown.sort(function (a, b) { return +a.getAttribute('data-order') - +b.getAttribute('data-order'); });
      }
      shown.forEach(function (c, i) {
        grid.appendChild(c);
        if (!reduce) { c.classList.add('is-entering'); c.style.transitionDelay = (i * 45) + 'ms'; }
      });
      if (feature && curFilter === 'all' && (!sort || sort === 'featured')) { var fifth = shown[4]; grid.insertBefore(feature, fifth || null); }
      requestAnimationFrame(function () { requestAnimationFrame(function () { shown.forEach(function (c) { c.classList.remove('is-entering'); }); }); });
      setTimeout(function () { shown.forEach(function (c) { c.style.transitionDelay = ''; }); }, 1200);
      var cnt = $('[data-count]'); if (cnt) cnt.textContent = shown.length + (shown.length === 1 ? ' piece' : ' pieces');
    }
    var sel = $('.sort select');
    $$('.filter').forEach(function (f) {
      f.addEventListener('click', function () {
        curFilter = f.getAttribute('data-filter');
        $$('.filter').forEach(function (x) { x.classList.toggle('is-on', x === f); x.setAttribute('aria-pressed', x === f ? 'true' : 'false'); });
        apply(sel ? sel.value : 'featured');
      });
    });
    if (sel) sel.addEventListener('change', function () { apply(sel.value); });
    function fromHash() { var h = (location.hash || '').replace('#', ''); var f0 = h && $('.filter[data-filter="' + h + '"]'); if (f0) { f0.click(); window.scrollTo({ top: grid.getBoundingClientRect().top + window.scrollY - 160, behavior: reduce ? 'auto' : 'smooth' }); } }
    window.addEventListener('hashchange', fromHash);
    if (location.hash) fromHash();
  }

  /* ------------------------------------------------------------------
     Crate builder
     ------------------------------------------------------------------ */
  var builder = $('.builder');
  if (builder) {
    var st = { theme: 'hiphop', size: 5 };
    var hash = (location.hash || '').replace('#', '');
    if (THEMES[hash]) st.theme = hash;
    var themeBtns = $$('.theme[data-theme]', builder), sizeBtns = $$('.size', builder);
    function renderPreview() {
      var th = THEMES[st.theme], sz = SIZES[st.size];
      themeBtns.forEach(function (b) { var on = b.getAttribute('data-theme') === st.theme; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      sizeBtns.forEach(function (b) { var on = +b.getAttribute('data-size') === st.size; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
      $('[data-pv-theme]').textContent = th.name;
      $('[data-pv-size]').textContent = sz.name + ' · ' + st.size + ' pieces';
      var ids = th.items.slice(0, st.size);
      var boxes = '';
      for (var i = 0; i < 8; i++) {
        if (i < ids.length) boxes += '<div class="crate-item" style="--i:' + i + '">' + thumbHTML(ids[i]) + '</div>';
        else boxes += '<div class="crate-item empty"></div>';
      }
      $('.crate-items').innerHTML = boxes;
      $('.preview-list').innerHTML = ids.map(function (id) { return '<li><span>' + CATALOG[id].name + '</span><span>' + CATALOG[id].cat + '</span></li>'; }).join('');
      $('[data-pv-total]').textContent = money(sz.price);
    }
    themeBtns.forEach(function (b) { b.addEventListener('click', function () { if (b.disabled) return; st.theme = b.getAttribute('data-theme'); renderPreview(); }); });
    sizeBtns.forEach(function (b) { b.addEventListener('click', function () { st.size = +b.getAttribute('data-size'); renderPreview(); }); });
    $('[data-add-crate]').addEventListener('click', function () {
      var th = THEMES[st.theme], sz = SIZES[st.size];
      addToBag({ crate: true, key: 'crate|' + st.theme + '|' + st.size, size: st.size, name: th.name + ' — ' + sz.name, price: sz.price, note: st.size + ' curated pieces' });
    });
    window.addEventListener('hashchange', function () { var h = (location.hash || '').replace('#', ''); if (THEMES[h]) { st.theme = h; renderPreview(); var bEl = $('#builder'); if (bEl) bEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); } });
    renderPreview();
  }

  /* ------------------------------------------------------------------
     Little Legends Fund — donate widget.
     NOT WIRED TO A REAL DESTINATION ON PURPOSE. "paypal.me/ColeyKids" is
     someone else's unrelated account — never link there. Once there is a
     real PayPal.me handle or Stripe Payment Link, set DONATE_URL_BASE.
     ------------------------------------------------------------------ */
  (function () {
    var DONATE_URL_BASE = ''; // e.g. 'https://paypal.me/YourRealHandle' — leave blank until real
    var amtButtons = $$('.amt-btn'), customInput = $('#customAmt'), donateBtn = $('#donateBtn'), donateNote = $('#donateNote');
    if (!donateBtn || !amtButtons.length) return;
    var current = 25;
    function setActive(btn) { amtButtons.forEach(function (b) { b.classList.toggle('active', b === btn); }); }
    function upd() { donateBtn.querySelector('[data-amt-label]').textContent = 'Donate $' + Math.max(1, Math.round(current)); }
    donateBtn.addEventListener('click', function (e) {
      if (!DONATE_URL_BASE) { e.preventDefault(); if (donateNote) donateNote.textContent = 'Online giving is being set up — check back soon.'; return; }
      donateBtn.href = DONATE_URL_BASE + '/' + Math.max(1, Math.round(current));
    });
    amtButtons.forEach(function (btn) { btn.addEventListener('click', function () { current = parseFloat(btn.getAttribute('data-amt')); if (customInput) customInput.value = ''; setActive(btn); upd(); }); });
    var lastPreset = $('.amt-btn[data-amt="25"]');
    amtButtons.forEach(function (btn) { btn.addEventListener('click', function () { lastPreset = btn; }); });
    if (customInput) customInput.addEventListener('input', function () {
      var v = parseFloat(customInput.value);
      if (v >= 1) { current = v; setActive(null); }
      else if (lastPreset) { current = parseFloat(lastPreset.getAttribute('data-amt')); setActive(lastPreset); }
      upd();
    });
    setActive($('.amt-btn[data-amt="25"]')); upd();
  })();

  /* newsletter: honest placeholder until a real list exists */
  $$('.news').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); var note = f.parentElement.querySelector('.news-note'); if (note) note.textContent = 'Email sign-up opens at launch — thanks for the love.'; });
  });
  /* copy email */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.getAttribute('data-copy'), done = function () { var o = b.textContent; b.textContent = 'Copied'; setTimeout(function () { b.textContent = o; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { selectText(b.previousElementSibling); });
      else selectText(b.previousElementSibling);
    });
  });
  function selectText(el) { if (!el) return; var r = document.createRange(); r.selectNodeContents(el); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }

  /* ------------------------------------------------------------------
     Desktop extras: custom cursor + magnetic buttons
     ------------------------------------------------------------------ */
  if (finePointer && !reduce) {
    var cursorEl = $('.cursor');
    if (cursorEl) {
      var label = $('span', cursorEl), mx = -100, my = -100, cx = -100, cy = -100;
      window.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; cursorEl.classList.add('on'); }, { passive: true });
      document.addEventListener('mouseleave', function () { cursorEl.classList.remove('on'); });
      (function loop() { cx += (mx - cx) * 0.2; cy += (my - cy) * 0.2; cursorEl.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; requestAnimationFrame(loop); })();
      document.addEventListener('mouseover', function (e) {
        var t = e.target.closest('[data-cursor]');
        if (t) { label.textContent = t.getAttribute('data-cursor'); cursorEl.classList.add('big'); }
        else cursorEl.classList.remove('big');
      });
    }
    $$('.btn').forEach(function (b) {
      b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); var x = (e.clientX - r.left - r.width / 2) * 0.18, y = (e.clientY - r.top - r.height / 2) * 0.3; b.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)'; });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }
})();
