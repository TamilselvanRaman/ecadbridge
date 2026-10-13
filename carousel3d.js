/* 3D-depth "Trending Across Engineering" carousel (design 6)
   - Reveal entrance animation on scroll (IntersectionObserver)
   - Seamless infinite loop with cloned card sets (zero popping or jumping)
   - Faster loop cycle (2.0s autoplay step) with crisp, fluid spring physics
   - Light spacing on top and bottom of cards
   - Fixed, centered glowing cutout frame with rounded-2xl border and bottom notch accent
   - Center active card: scale(1.05), opacity 1, blur(0), bright image with reduced shadows
   - Side cards: opacity 0.32, smooth subtle depth transition, zero harsh blur
   - Autoplay live stream with pause on hover, interactive drag/swipe & step buttons (<, >)
*/
(function () {
  'use strict';
  function init() {
    var section = document.getElementById('trending-section');
    var viewport = document.getElementById('trending-viewport3d');
    var track = document.getElementById('trending-track3d');
    if (!viewport || !track) return;

    /* ---- 1. Extract clean unique cards ---- */
    var seen = {}, uniqueCards = [];
    Array.prototype.slice.call(track.querySelectorAll('.trending-card')).forEach(function (c) {
      var h = c.querySelector('h3'), key = h ? h.textContent.trim() : String(uniqueCards.length);
      if (seen[key] || c.getAttribute('aria-hidden') === 'true') { c.remove(); return; }
      seen[key] = 1; c.classList.remove('is-center'); c.removeAttribute('aria-hidden'); uniqueCards.push(c);
    });
    if (!uniqueCards.length) return;

    /* ---- 2. Duplicate set so n >= 10 for completely seamless infinite looping off-screen ---- */
    var cards = uniqueCards.slice();
    uniqueCards.forEach(function (c) {
      var clone = c.cloneNode(true);
      clone.removeAttribute('id');
      track.appendChild(clone);
      cards.push(clone);
    });
    var n = cards.length;

    track.className = 'ct-stage';
    viewport.style.perspective = '1000px';
    viewport.classList.add('ct-viewport');

    /* Static Cutout Center Frame with bottom notch accent */
    var frame = document.querySelector('.ct-frame');
    if (!frame) {
      frame = document.createElement('div');
      frame.className = 'ct-frame';
      frame.innerHTML = '<span class="ct-frame-notch"></span>';
      viewport.appendChild(frame);
    }

    /* ---- 3. Physics & Spacing Configuration ---- */
    function getSpacing() {
      var w = window.innerWidth;
      if (w < 480) return Math.min(270, Math.round(w * 0.72));
      if (w < 768) return Math.min(290, Math.round(w * 0.76));
      return 310;
    }
    var SPACING = getSpacing();
    window.addEventListener('resize', function () {
      SPACING = getSpacing();
      render();
    }, { passive: true });
    var ACTIVE_SCALE = 1.05;
    var SIDE_SCALE = 0.88;
    var SIDE_OP = 0.32;
    var K = 260, C = 24; // snappy, silky spring physics for faster yet fluid glide transitions
    var pos = 0, vel = 0, target = 0, raf = null, last = 0;
    var dragging = false, moved = false, startX = 0, startPos = 0, lastX = 0, lastT = 0, flick = 0;

    function wrap(d) {
      d = ((d % n) + n) % n;
      return d > n / 2 ? d - n : d;
    }

    function render() {
      cards.forEach(function (c, i) {
        var d = wrap(i - pos);
        var a = Math.abs(d);

        // Cards beyond 3.4 slots are cleanly hidden off-screen so wrapping is 100% invisible
        if (a > 3.4) {
          c.style.visibility = 'hidden';
          c.style.opacity = '0';
          return;
        }

        var s = a <= 1 ? ACTIVE_SCALE + (SIDE_SCALE - ACTIVE_SCALE) * a : Math.max(0.75, SIDE_SCALE - (a - 1) * 0.04);
        var op = a <= 1 ? 1 + (SIDE_OP - 1) * a : Math.max(0, SIDE_OP - (a - 1) * 0.16);
        var ry = Math.max(-26, Math.min(26, -d * 14));
        var z = -Math.min(a, 2.5) * 50;

        c.style.visibility = 'visible';
        c.style.transform = 'translate3d(' + (d * SPACING) + 'px,0,' + z + 'px) rotateY(' + ry + 'deg) scale(' + s + ')';
        c.style.opacity = op.toFixed(3);

        // Subtle soft blur only on side cards (zero blur in center)
        var blurPx = a < 0.3 ? 0 : Math.min(0.6, (a - 0.3) * 0.6);
        c.style.filter = blurPx > 0 ? 'blur(' + blurPx.toFixed(2) + 'px)' : 'none';
        c.style.zIndex = String(200 - Math.round(a * 20));
        c.classList.toggle('ct-active', a < 0.45);
      });
    }

    function step(ts) {
      var dt = Math.min((ts - last) / 1000, 0.032);
      last = ts;
      var sub = 4, h = dt / sub;
      for (var k = 0; k < sub; k++) {
        var acc = K * (target - pos) - C * vel;
        vel += acc * h;
        pos += vel * h;
      }
      render();

      if (Math.abs(target - pos) < 0.0004 && Math.abs(vel) < 0.0008) {
        pos = target;
        vel = 0;
        pos = ((pos % n) + n) % n;
        target = pos;
        render();
        raf = null;
        return;
      }
      raf = requestAnimationFrame(step);
    }

    function kick() {
      if (!raf) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    }

    function go(t) {
      target = t;
      kick();
    }

    function next() {
      go(Math.round(target) + 1);
    }

    function prev() {
      go(Math.round(target) - 1);
    }

    /* ---- 4. Controls ---- */
    var nb = document.getElementById('trending-next-btn'), pb = document.getElementById('trending-prev-btn');
    if (nb) nb.addEventListener('click', function () { next(); restartAuto(); });
    if (pb) pb.addEventListener('click', function () { prev(); restartAuto(); });

    document.addEventListener('keydown', function (e) {
      var r = viewport.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });

    /* Click side card to glide to center */
    cards.forEach(function (c, i) {
      c.addEventListener('click', function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); return; }
        var d = wrap(i - Math.round(pos));
        if (Math.abs(d) > 0.1) {
          e.preventDefault();
          go(Math.round(pos) + d);
          restartAuto();
        }
      }, true);
    });

    /* Drag / Swipe */
    track.addEventListener('pointerdown', function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = lastX = e.clientX;
      startPos = pos;
      lastT = performance.now();
      flick = 0;
      vel = 0;
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      track.classList.add('ct-grabbing');
    });

    window.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > 6) moved = true;
      if (!moved) return;
      var now = performance.now(), dtm = Math.max(now - lastT, 1);
      flick = (e.clientX - lastX) / dtm;
      lastX = e.clientX;
      lastT = now;
      pos = startPos - dx / SPACING;
      target = pos;
      render();
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('ct-grabbing');
      if (moved) {
        var proj = pos - (flick * 200) / SPACING;
        go(Math.round(proj));
        restartAuto();
        setTimeout(function () { moved = false; }, 30);
      }
    }
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    /* ---- 5. Faster Autoplay Live Stream Loop (1.4s interval) ---- */
    var timer = null, hover = false;
    function startAuto() {
      stopAuto();
      timer = setInterval(function () {
        if (!hover && !dragging && !document.hidden) next();
      }, 1400); // brisk, energetic loop cycle: 1.4s
    }
    function stopAuto() {
      if (timer) { clearInterval(timer); timer = null; }
    }
    function restartAuto() {
      startAuto();
    }

    viewport.addEventListener('mouseenter', function () { hover = true; });
    viewport.addEventListener('mouseleave', function () { hover = false; });
    if (nb) { nb.addEventListener('mouseenter', function () { hover = true; }); nb.addEventListener('mouseleave', function () { hover = false; }); }
    if (pb) { pb.addEventListener('mouseenter', function () { hover = true; }); pb.addEventListener('mouseleave', function () { hover = false; }); }

    render();
    startAuto();

    /* ---- 6. Reveal entrance animation on scroll ---- */
    if (section && 'IntersectionObserver' in window) {
      var sObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add('ct-revealed');
            sObs.unobserve(section);
          }
        });
      }, { threshold: 0.1 });
      sObs.observe(section);
      // Immediate trigger if already in viewport on page load
      var rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        setTimeout(function () { section.classList.add('ct-revealed'); }, 60);
      }
    } else if (section) {
      section.classList.add('ct-revealed');
    }
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
