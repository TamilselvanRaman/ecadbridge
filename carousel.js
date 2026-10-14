/* Seamless infinite trending carousel (designs 2 & 3): loop, center-focus zoom, prev/next */
(function () {
  function init() {
    var viewport = document.getElementById('trending-viewport');
    var track = document.getElementById('trending-track');
    if (!viewport || !track) return;
    viewport.style.touchAction = 'pan-y';
    track.style.touchAction = 'pan-y';
    var GAP = 20;

    // keep only real cards (drop the single hand-made duplicate), then clone full set once
    var all = Array.prototype.slice.call(track.querySelectorAll('.trending-card'));
    var originals = all.filter(function (c) { return c.getAttribute('aria-hidden') !== 'true'; });
    // the hand-made duplicate is a real extra topic: keep it as an original
    originals = all.slice();
    originals.forEach(function (c) { c.removeAttribute('aria-hidden'); c.classList.remove('is-center'); });
    var n = originals.length;
    originals.forEach(function (c) {
      var k = c.cloneNode(true);
      k.setAttribute('aria-hidden', 'true');
      track.appendChild(k);
    });
    // exact halves => translateX(-50%) loops with no jump
    track.style.paddingLeft = '0px';
    track.style.paddingRight = GAP + 'px';
    var step = originals[0].getBoundingClientRect().width + GAP;
    track.style.animationDuration = Math.max(25, n * 9) + 's';

    var cards = Array.prototype.slice.call(track.querySelectorAll('.trending-card'));
    function focusLoop() {
      var vr = viewport.getBoundingClientRect(), vc = vr.left + vr.width / 2, best = null, min = Infinity;
      cards.forEach(function (c) {
        var r = c.getBoundingClientRect();
        if (r.right < vr.left - 100 || r.left > vr.right + 100) { c.classList.remove('is-center'); return; }
        var d = Math.abs(vc - (r.left + r.width / 2));
        if (d < min) { min = d; best = c; }
      });
      cards.forEach(function (c) { c.classList.toggle('is-center', c === best && min < 180); });
      requestAnimationFrame(focusLoop);
    }
    requestAnimationFrame(focusLoop);

    // manual nav: nudge via Web Animations currentTime so the loop keeps going from the new spot
    function nudge(dir) {
      var anims = track.getAnimations ? track.getAnimations() : [];
      var a = anims[0];
      if (!a) return;
      var dur = a.effect.getComputedTiming().duration;
      var half = step * n;
      var delta = (step / half) * dur * dir;
      var t = (a.currentTime + delta) % dur;
      a.currentTime = t < 0 ? t + dur : t;
    }
    var next = document.querySelector('[aria-label="Next trending article"]');
    var prev = document.querySelector('[aria-label="Previous trending article"]');
    if (next) next.addEventListener('click', function () { nudge(1); });
    if (prev) prev.addEventListener('click', function () { nudge(-1); });
  }
  if (document.readyState !== 'loading') window.addEventListener('load', init);
  else window.addEventListener('load', init);
})();
