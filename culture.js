/* DOG ARMY. Acervo da matilha: rotating filmstrip of the DOG PIC library
   (public/culture/pics/, manifest.json written by the conversion script).
   Every piece is CC0 community art — clicking opens the file so anyone can
   save and reuse it. Lazy: nothing is fetched until the section approaches
   the viewport. External file on purpose (script-src 'self', CSP). */
(function () {
  'use strict';
  var BASE = 'public/culture/pics/';
  var MAX = 60;   /* pieces per visit (random sample) — keeps the DOM lean */

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var rowA = document.getElementById('picsRowA');
    var rowB = document.getElementById('picsRowB');
    if (!rowA || !rowB) return;

    var mounted = false;
    function mount() {
      if (mounted) return;
      mounted = true;
      fetch(BASE + 'manifest.json')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (list) {
          if (!list || !list.length) return;
          for (var i = list.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = list[i]; list[i] = list[j]; list[j] = t;
          }
          var take = list.slice(0, MAX);
          var half = Math.ceil(take.length / 2);
          build(rowA, take.slice(0, half));
          build(rowB, take.slice(half));
        })
        .catch(function () {});
    }

    function build(row, items) {
      if (!items.length) return;
      var track = document.createElement('div');
      track.className = 'pics-track';
      /* content duplicated once so the CSS -50% translate loops seamlessly */
      for (var rep = 0; rep < 2; rep++) {
        items.forEach(function (it) {
          var a = document.createElement('a');
          a.className = 'pics-item';
          a.href = BASE + it.f;
          a.target = '_blank';
          a.rel = 'noopener';
          a.title = it.t + ' · CC0';
          if (rep === 1) a.setAttribute('aria-hidden', 'true');
          var img = document.createElement('img');
          img.loading = 'lazy';
          img.decoding = 'async';
          img.src = BASE + it.f;
          img.alt = 'DOG Army community art: ' + it.t;
          a.appendChild(img);
          track.appendChild(a);
        });
      }
      row.textContent = '';
      row.appendChild(track);
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); mount(); }
      }, { rootMargin: '600px' });
      io.observe(rowA);
    } else {
      mount();
    }
  });
})();
