/* ECAD Bridge — shared enhancements for all 5 designs
   - scroll reveal animations (sections, cards, grids, hero stagger)
   - live count-up numbers
   - broken image fallback (remote images may expire)
   - cursor-glow card tilt
   - scroll progress bar, dead "#" link fix, "All Designs" back pill  */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var inFrame = window.self !== window.top;

  /* ---------- styles ---------- */
  var css = [
    '.rv{opacity:0;translate:0 38px;scale:.98;transition:opacity .9s cubic-bezier(.16,1,.3,1),translate .9s cubic-bezier(.16,1,.3,1),scale .9s cubic-bezier(.16,1,.3,1);transition-delay:var(--rv-d,0ms)}',
    '.rv.rv-left{translate:-46px 0}.rv.rv-right{translate:46px 0}.rv.rv-zoom{translate:0 0;scale:.88}',
    '.rv.rv-in{opacity:1;translate:0 0;scale:1}',
    '.ec-img-fallback{display:flex;align-items:center;justify-content:center;width:100%;height:100%;min-height:120px;',
    'background:linear-gradient(135deg,rgba(24,214,176,.18),rgba(33,52,194,.25),rgba(139,92,246,.18));background-size:200% 200%;',
    'animation:ecShift 6s ease infinite;color:rgba(255,255,255,.75);font:600 12px/1.3 Inter,sans-serif;text-align:center;padding:12px;letter-spacing:.04em}',
    '.ec-img-fallback span{font-family:"Material Symbols Outlined";font-size:34px;display:block;margin-bottom:6px}',
    '@keyframes ecShift{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}',
    '#ec-progress{position:fixed;top:0;left:0;height:3px;width:0;z-index:9999;background:linear-gradient(90deg,#18D6B0,#8B5CF6,#F97316);box-shadow:0 0 10px rgba(24,214,176,.7);transition:width .1s linear}',
    '#ec-back{position:fixed;left:18px;bottom:18px;z-index:9998;display:inline-flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;',
    'background:rgba(10,14,22,.82);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,.18);color:#fff;font:600 12px Inter,sans-serif;text-decoration:none;',
    'box-shadow:0 8px 28px rgba(0,0,0,.45);transition:transform .25s,border-color .25s,box-shadow .25s}',
    '#ec-back:hover{transform:translateY(-3px);border-color:#18D6B0;box-shadow:0 12px 30px rgba(24,214,176,.25)}',
    '#ec-toast{position:fixed;left:50%;bottom:28px;translate:-50% 20px;opacity:0;z-index:9999;padding:10px 18px;border-radius:10px;background:#111D2B;border:1px solid rgba(24,214,176,.5);',
    'color:#fff;font:500 13px Inter,sans-serif;transition:all .35s;pointer-events:none}',
    '#ec-toast.show{opacity:1;translate:-50% 0}',
    '.ec-glow{position:relative}',
    '.ec-glow::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .3s;',
    'background:radial-gradient(260px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.10),transparent 60%)}',
    '.ec-glow:hover::after{opacity:1}',
    '@keyframes ecHero{from{opacity:0;translate:0 46px;scale:.96;filter:blur(12px)}to{opacity:1;translate:0 0;scale:1;filter:blur(0)}}',
    '.ec-hero{animation:ecHero 1.1s cubic-bezier(.16,1,.3,1) both;animation-delay:var(--rv-d,0ms)}',
    '@media (prefers-reduced-motion:reduce){.ec-hero{animation:none}.rv{transition:none;opacity:1;translate:0 0;scale:1}}',
    'html{max-width:100vw;overflow-x:hidden;overflow-y:auto;scroll-behavior:smooth}',
    'body{max-width:100vw;overflow-x:hidden;overflow-y:visible;overscroll-behavior-y:auto}',
    '::-webkit-scrollbar{width:10px;height:10px}',
    '::-webkit-scrollbar-track{background:rgba(8,13,22,.85)}',
    '::-webkit-scrollbar-thumb{background:rgba(255,255,255,.24);border-radius:999px;border:2px solid rgba(8,13,22,.85)}',
    '::-webkit-scrollbar-thumb:hover{background:rgba(24,214,176,.85)}',
    '* {scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.24) rgba(8,13,22,.85)}',
    '.ec-mobile-toggle{display:none;align-items:center;justify-content:center;width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#fff;cursor:pointer;transition:all .25s}',
    '.ec-mobile-toggle:hover{background:rgba(255,255,255,.12);border-color:rgba(24,214,176,.5);color:#18D6B0}',
    '@media (max-width:1023px){.ec-mobile-toggle{display:inline-flex!important}}',
    '.ec-mobile-drawer{position:absolute;top:100%;left:0;right:0;background:rgba(9,14,22,.96);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.12);padding:18px 24px 24px;display:none;flex-direction:column;gap:12px;box-shadow:0 24px 48px rgba(0,0,0,.6);z-index:90;animation:ecDrawer .28s cubic-bezier(.16,1,.3,1)}',
    '.ec-mobile-drawer.open{display:flex!important}',
    '@keyframes ecDrawer{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}',
    '.ec-mobile-drawer a{display:flex;align-items:center;justify-content:between;padding:12px 14px;border-radius:8px;color:#c3d1dc;font:600 14px Inter,sans-serif;text-decoration:none;transition:all .2s;border-bottom:1px solid rgba(255,255,255,.04)}',
    '.ec-mobile-drawer a:hover,.ec-mobile-drawer a.active{background:rgba(24,214,176,.08);color:#18D6B0;padding-left:18px}',
    '.ec-mobile-drawer a span.arr{font-family:"Material Symbols Outlined";font-size:16px;opacity:.5}',
    '.ec-mobile-drawer-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:12px;border-radius:10px;background:rgba(33,52,194,.22);border:1px solid rgba(33,52,194,.5);color:#bcc2ff;font:600 12px "JetBrains Mono",monospace;text-decoration:none;transition:all .25s;margin-top:6px}',
    '.ec-mobile-drawer-btn:hover{background:rgba(33,52,194,.38);color:#fff}',
    '@media (max-width:640px){.cat-filter-row{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:6px}.cat-filter-row::-webkit-scrollbar{display:none}}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function ready(fn) {
    if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var main = document.querySelector('main') || document.body;

    /* ---------- progress bar ---------- */
    var bar = document.createElement('div');
    bar.id = 'ec-progress';
    document.body.appendChild(bar);
    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---------- back to hub ---------- */
    if (!inFrame) {
      var back = document.createElement('a');
      back.id = 'ec-back';
      back.href = 'index.html';
      back.innerHTML = '<span class="material-symbols-outlined" style="font-size:16px">apps</span>All Designs';
      document.body.appendChild(back);
    }

    /* ---------- toast + dead links ---------- */
    var toast = document.createElement('div');
    toast.id = 'ec-toast';
    document.body.appendChild(toast);
    var tt;
    function showToast(msg) {
      toast.textContent = msg;
      toast.classList.add('show');
      clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove('show'); }, 1800);
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href="#"]');
      if (!a) return;
      e.preventDefault();
      var label = (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40);
      if (/^home$/i.test(label)) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
      showToast((label || 'Link') + ' — page coming soon');
    });

    /* ---------- image fallback ---------- */
    function fixImg(img) {
      if (img.dataset.ecFixed) return;
      function swap() {
        if (img.dataset.ecFixed) return;
        img.dataset.ecFixed = '1';
        var d = document.createElement('div');
        d.className = 'ec-img-fallback';
        d.innerHTML = '<div><span>memory</span>' + (img.alt || 'ECAD Bridge') + '</div>';
        img.replaceWith(d);
      }
      img.addEventListener('error', swap);
      if (img.complete && img.naturalWidth === 0 && img.src) swap();
    }
    document.querySelectorAll('img').forEach(fixImg);

    /* ---------- reveal ---------- */
    var io = null;
    if (!reduce && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          io.unobserve(el);
          el.classList.add('rv-in');
          // restore original transitions/transform after the animation
          setTimeout(function () {
            el.classList.remove('rv', 'rv-in', 'rv-left', 'rv-right', 'rv-zoom');
            el.style.removeProperty('--rv-d');
          }, 1300 + (parseInt(el.style.getPropertyValue('--rv-d')) || 0));
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    function reveal(el, delay, kind) {
      if (!io || el.classList.contains('rv') || el.closest('.animate-marquee') || el.closest('header')) return;
      el.classList.add('rv');
      if (kind) el.classList.add('rv-' + kind);
      el.style.setProperty('--rv-d', delay + 'ms');
      io.observe(el);
    }

    var sections = Array.prototype.slice.call(main.querySelectorAll(':scope > section, :scope > div > section'));
    sections.forEach(function (sec, si) {
      if (si === 0) {
        if (sec.hasAttribute('data-custom-hero')) return;
        if (document.documentElement.hasAttribute('data-intro')) return;
        // hero: staggered entrance on load
        var wrap = sec.querySelector('h1');
        wrap = wrap ? wrap.parentElement : sec;
        Array.prototype.forEach.call(wrap.children, function (c, i) {
          if (reduce) return;
          c.style.setProperty('--rv-d', (200 + i * 170) + 'ms');
          c.classList.add('ec-hero');
        });
        return;
      }
      // section heading block + grid children
      Array.prototype.forEach.call(sec.querySelectorAll('h2'), function (h) {
        reveal(h.parentElement === sec ? h : h.parentElement, 0, null);
      });
      var grids = sec.querySelectorAll('[class*="grid-cols"], [class*="grid "], .grid');
      var done = new Set();
      grids.forEach(function (g) {
        Array.prototype.forEach.call(g.children, function (c, i) {
          if (done.has(c)) return;
          done.add(c);
          reveal(c, (i % 6) * 110, i % 2 ? 'zoom' : null);
        });
      });
      if (!grids.length) reveal(sec, 0, null);
    });
    // standalone article lists (blogs etc.)
    main.querySelectorAll('article').forEach(function (a, i) { reveal(a, (i % 4) * 90, null); });
    // footer
    var footer = document.querySelector('footer');
    if (footer) Array.prototype.forEach.call(footer.querySelectorAll('footer > div > *, footer > div > div > *'), function (c, i) { reveal(c, (i % 5) * 90, null); });

    /* ---------- count-up numbers ---------- */
    if (!reduce && 'IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          cio.unobserve(en.target);
          countUp(en.target);
        });
      }, { threshold: 0.6 });
      var rx = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/;
      main.querySelectorAll('h2,h3,h4,p,span,div').forEach(function (el) {
        if (el.children.length || el.closest('.animate-marquee')) return;
        var t = el.textContent.trim();
        if (t.length > 9 || /^\d{4}$/.test(t)) return;
        var m = rx.exec(t);
        if (m && /(\d[\d,.]*)\s*[kKmM+%]?$/.test(t) && parseFloat(m[2].replace(/,/g, '')) >= 10 && /[+kKmM%,]/.test(t)) {
          el.dataset.ecCount = t;
          cio.observe(el);
        }
      });
    }
    function countUp(el) {
      var t = el.dataset.ecCount, m = /^(\D*)(\d[\d,]*(?:\.\d+)?)(.*)$/.exec(t);
      if (!m) return;
      var end = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length, comma = m[2].indexOf(',') > -1;
      var t0 = null, dur = 1400;
      function step(ts) {
        if (!t0) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3), v = end * e;
        var s = v.toFixed(dec);
        if (comma) s = Number(s).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
        el.textContent = m[1] + s + m[3];
        if (p < 1) requestAnimationFrame(step); else el.textContent = t;
      }
      requestAnimationFrame(step);
    }

    /* ---------- cursor glow on cards ---------- */
    main.querySelectorAll('article, .trending-card').forEach(function (c) {
      c.classList.add('ec-glow');
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    /* ---------- Universal Responsive Mobile Navigation ---------- */
    (function initMobileNav() {
      var header = document.querySelector('header');
      if (!header) return;
      var nav = header.querySelector('nav');
      if (!nav) return;

      var existingBtn = header.querySelector('.ec-mobile-toggle, #mobile-menu-toggle');
      if (existingBtn) return;

      var btn = document.createElement('button');
      btn.className = 'ec-mobile-toggle';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Toggle navigation menu');
      btn.innerHTML = '<span class="material-symbols-outlined" style="font-size:24px">menu</span>';

      var rightGroup = header.querySelector('.flex.items-center.gap-4.shrink-0') ||
                       header.querySelector('[class*="flex"][class*="items-center"]:last-child') ||
                       header.firstElementChild;
      if (rightGroup) {
        rightGroup.insertBefore(btn, rightGroup.firstChild);
      } else {
        header.appendChild(btn);
      }

      var drawer = document.createElement('div');
      drawer.className = 'ec-mobile-drawer';

      var linksHtml = Array.prototype.slice.call(nav.querySelectorAll('a')).map(function (a) {
        var href = a.getAttribute('href') || '#';
        var text = (a.textContent || '').trim();
        var isAct = a.classList.contains('text-primary') || a.classList.contains('font-semibold');
        return '<a href="' + href + '" class="' + (isAct ? 'active' : '') + '"><span>' + text + '</span><span class="arr">chevron_right</span></a>';
      }).join('');

      drawer.innerHTML = '<nav style="display:flex;flex-direction:column;gap:4px">' + linksHtml + '</nav>' +
        '<a href="#" class="ec-mobile-drawer-btn"><span class="material-symbols-outlined" style="font-size:16px">memory</span><span>Skill Workstation</span></a>';

      header.appendChild(drawer);

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = drawer.classList.contains('open');
        drawer.classList.toggle('open');
        var ic = btn.querySelector('.material-symbols-outlined');
        if (ic) ic.textContent = isOpen ? 'menu' : 'close';
      });

      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          drawer.classList.remove('open');
          var ic = btn.querySelector('.material-symbols-outlined');
          if (ic) ic.textContent = 'menu';
        });
      });

      document.addEventListener('click', function (e) {
        if (!header.contains(e.target)) {
          drawer.classList.remove('open');
          var ic = btn.querySelector('.material-symbols-outlined');
          if (ic) ic.textContent = 'menu';
        }
      });
    })();
  });
})();
