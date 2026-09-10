/* ============================================================
   plume — shared behaviour
   used by: /plume.html  and every /plume/b/xx/ batch page
   ------------------------------------------------------------
   PlumeUI.init(options) — types out the greeting line, then
   reveals the buttons, then arms the scroll-reveal cascade for
   everything below. Each page only needs to set its own typed
   text in the markup (the .type span) and call init().
   ============================================================ */

(function (window) {
  /* the smoke plays a touch slower than real time — feels calmer.
     re-applied on loadedmetadata/play too, since some browsers reset
     playbackRate right after autoplay kicks in */
  var SMOKE_SPEED = 0.55;
  function slowSmoke() {
    var vids = document.querySelectorAll('.video-bg');
    Array.prototype.forEach.call(vids, function (v) {
      var apply = function () { v.playbackRate = SMOKE_SPEED; };
      apply();
      v.addEventListener('loadedmetadata', apply);
      v.addEventListener('play', apply);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', slowSmoke);
  } else {
    slowSmoke();
  }

  function typeText(el, cursorEl, text, speed, done) {
    el.textContent = '';
    var i = 0;
    cursorEl.classList.add('live');
    var t = setInterval(function () {
      i++;
      el.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(t);
        setTimeout(function () {
          cursorEl.classList.remove('live');
          cursorEl.classList.add('done');
          done && done();
        }, 420);
      }
    }, speed || 38);
  }

  /* elements arriving together in the same viewport-entry cascade
     in, one after another, in the order they appear on the page —
     so the whole page always arrives sequentially as you scroll */
  function armReveals() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(els, function (el) { el.classList.add('visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      var batch = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        io.unobserve(el);
        el.style.transitionDelay = (batch * 0.18) + 's';
        batch++;
        el.classList.add('visible');
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
  }

  function init(opts) {
    opts = opts || {};
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var typeEl = document.querySelector(opts.typeSelector || '.type');
    var cursor = document.querySelector(opts.cursorSelector || '.cursor');
    var full = typeEl ? typeEl.textContent : '';
    var afterClass = opts.afterClass || 'typed';
    var startDelay = (opts.startDelay != null) ? opts.startDelay : 2350;
    var speed = opts.speed || 38;

    function reveal() {
      document.documentElement.classList.add(afterClass);
      setTimeout(armReveals, 400);
      opts.onReady && opts.onReady();
    }

    if (reduce || !typeEl || !cursor) { reveal(); return; }
    typeEl.textContent = '';
    setTimeout(function () { typeText(typeEl, cursor, full, speed, reveal); }, startDelay);
  }

  /* ——— clear the smoke: pauses the video + fades the tint up so the
     page reads clean and still, for anyone motion-sensitive who wants
     control beyond their OS-level reduced-motion setting ——— */
  function armSmokeToggle() {
    var btn = document.querySelector('.smoke-toggle');
    var vid = document.querySelector('.video-bg');
    if (!btn || !vid) return;
    var cleared = false;
    btn.addEventListener('click', function () {
      cleared = !cleared;
      if (cleared) {
        vid.pause();
        vid.style.opacity = '0';
        btn.textContent = 'bring back the smoke';
        btn.setAttribute('aria-pressed', 'true');
      } else {
        vid.style.opacity = '1';
        vid.play();
        btn.textContent = 'clear the smoke';
        btn.setAttribute('aria-pressed', 'false');
      }
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armSmokeToggle);
  } else {
    armSmokeToggle();
  }

  window.PlumeUI = { init: init, armReveals: armReveals };
})(window);
