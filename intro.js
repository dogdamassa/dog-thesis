/* DOG ARMY. Intro gate: the presentation video (YouTube nocookie) that greets
   visitors on the home. Shows again after 3 days (localStorage TTL); a refresh
   never repeats it. External file on purpose: script-src 'self' allows it
   without touching the inline-script hashes in vercel.json. Loaded in <head>
   WITHOUT defer so the decision lands before first paint (zero flash). */
(function () {
  'use strict';
  var KEY = 'dogArmyIntroSeen';
  var TTL = 3 * 24 * 60 * 60 * 1000;
  var VIDEO_ID = 'LYAMy07heZc';
  var YT = 'https://www.youtube-nocookie.com';

  /* home only (the dev server also serves it as /index.html) */
  if (location.pathname !== '/' && location.pathname !== '/index.html') return;

  /* test/link escape hatches: ?intro=0 skips, ?intro=1 forces */
  var force = '';
  try { force = new URLSearchParams(location.search).get('intro') || ''; } catch (e) {}
  if (force === '0') return;

  function lastSeen() {
    try {
      var r = localStorage.getItem(KEY);
      if (r) return Number(JSON.parse(r).t) || 0;
    } catch (e) {}
    try {
      var s = sessionStorage.getItem(KEY);
      if (s) return Number(JSON.parse(s).t) || 0;
    } catch (e) {}
    return 0;
  }
  function markSeen() {
    var v = JSON.stringify({ t: Date.now() });
    try { localStorage.setItem(KEY, v); return; } catch (e) {}
    try { sessionStorage.setItem(KEY, v); } catch (e) {} /* private-mode fallback */
  }

  if (force !== '1' && Date.now() - lastSeen() <= TTL) return;

  /* ---- phase A: before first paint (this file is render-blocking).
     "Seen" is stamped when the gate decides to open, so a refresh —
     wallet connected or not — never repeats the video within the TTL. ---- */
  document.documentElement.classList.add('introPending');
  markSeen();

  /* ---- phase B: mount the player + show once the DOM exists ---- */
  function open() {
    var root = document.documentElement;
    var scrim = document.getElementById('introScrim');
    var modal = document.getElementById('introModal');
    var box = document.getElementById('introFrame');
    var soundBtn = document.getElementById('introSound');
    var enterBtn = document.getElementById('introEnter');
    var closeBtn = document.getElementById('introClose');
    if (!scrim || !modal || !box || !enterBtn) { root.classList.remove('introPending'); return; }

    var reduce = false;
    try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

    var frame = document.createElement('iframe');
    frame.src = YT + '/embed/' + VIDEO_ID +
      '?autoplay=' + (reduce ? 0 : 1) +
      '&mute=1&playsinline=1&rel=0&enablejsapi=1' +
      '&origin=' + encodeURIComponent(location.origin);
    frame.title = 'DOG ARMY';
    frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    frame.setAttribute('allowfullscreen', '');
    frame.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    frame.addEventListener('load', function () {
      /* raw widget-protocol handshake: registers us for player events */
      post({ event: 'listening', id: 'introPlayer', channel: 'widget' });
    });
    box.appendChild(frame);

    function post(msg) {
      try { frame.contentWindow.postMessage(JSON.stringify(msg), YT); } catch (e) {}
    }

    var heroVideo = document.querySelector('video[data-hero-video]');
    function pauseHero() { if (heroVideo) { try { heroVideo.pause(); } catch (e) {} } }

    scrim.hidden = false;
    modal.hidden = false;
    root.classList.remove('introPending');
    document.body.style.overflow = 'hidden';
    pauseHero();
    /* i18n.js mounts + plays the hero bg video on window.load, which can fire
       after we opened — pause it again when that happens. */
    window.addEventListener('load', function () { if (!modal.hidden) pauseHero(); });
    try { enterBtn.focus(); } catch (e) {}

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      modal.hidden = true;
      scrim.hidden = true;
      try { frame.remove(); } catch (e) {} /* kills the audio instantly */
      document.body.style.overflow = '';
      root.classList.remove('introPending');
      if (heroVideo) { try { heroVideo.play().catch(function () {}); } catch (e) {} }
    }

    enterBtn.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !modal.hidden) close();
    });

    if (soundBtn) soundBtn.addEventListener('click', function () {
      /* the click is the user gesture browsers require to unmute */
      post({ event: 'command', func: 'unMute', args: [] });
      post({ event: 'command', func: 'setVolume', args: [100] });
      post({ event: 'command', func: 'playVideo', args: [] });
      soundBtn.hidden = true;
    });

    /* Best-effort auto-close when the video ends. postMessage between frames
       is not governed by connect-src; loading YouTube's iframe_api script
       would be blocked by script-src 'self', so we speak the raw protocol.
       If the handshake fails, manual close still covers everything. */
    window.addEventListener('message', function (e) {
      if (e.origin !== YT) return;
      var d;
      try { d = JSON.parse(e.data); } catch (err) { return; }
      if (!d) return;
      if (d.event === 'onStateChange' && d.info === 0) close();
      else if (d.event === 'infoDelivery' && d.info && d.info.playerState === 0) close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
  else open();
})();
