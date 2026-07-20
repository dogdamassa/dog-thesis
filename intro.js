/* DOG ARMY. Intro gate: the local presentation video that greets visitors on
   the home. Shows again after 3 days (localStorage TTL); a refresh never
   repeats it. Captions are separate WebVTT tracks and start OFF. External file
   on purpose: script-src 'self' allows it without touching CSP hashes. */
(function () {
  'use strict';
  var KEY = 'dogArmyIntroSeen';
  var TTL = 3 * 24 * 60 * 60 * 1000;
  var VIDEO_SRC = '/public/videos/dog-history-global-v2.mp4';
  var POSTER_SRC = '/public/videos/dog-history-poster-v2.jpg';
  var TRACKS = [
    { code: 'en', flag: '🇺🇸', label: 'English', src: '/public/subtitles/dog-history.en.vtt' },
    { code: 'pt-BR', flag: '🇧🇷', label: 'Português (Brasil)', src: '/public/subtitles/dog-history.pt-BR.vtt' },
    { code: 'es', flag: '🇪🇸', label: 'Español', src: '/public/subtitles/dog-history.es.vtt' },
    { code: 'fr', flag: '🇫🇷', label: 'Français', src: '/public/subtitles/dog-history.fr.vtt' },
    { code: 'de', flag: '🇩🇪', label: 'Deutsch', src: '/public/subtitles/dog-history.de.vtt' },
    { code: 'it', flag: '🇮🇹', label: 'Italiano', src: '/public/subtitles/dog-history.it.vtt' },
    { code: 'tr', flag: '🇹🇷', label: 'Türkçe', src: '/public/subtitles/dog-history.tr.vtt' },
    { code: 'ru', flag: '🇷🇺', label: 'Русский', src: '/public/subtitles/dog-history.ru.vtt' },
    { code: 'ar', flag: '🇸🇦', label: 'العربية', src: '/public/subtitles/dog-history.ar.vtt' },
    { code: 'hi', flag: '🇮🇳', label: 'हिन्दी', src: '/public/subtitles/dog-history.hi.vtt' },
    { code: 'ja', flag: '🇯🇵', label: '日本語', src: '/public/subtitles/dog-history.ja.vtt' },
    { code: 'ko', flag: '🇰🇷', label: '한국어', src: '/public/subtitles/dog-history.ko.vtt' },
    { code: 'zh-Hans', flag: '🇨🇳', label: '简体中文', src: '/public/subtitles/dog-history.zh-Hans.vtt' }
  ];

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

  /* Before first paint. "Seen" is stamped when the gate decides to open, so a
     refresh never repeats the video within the TTL. */
  document.documentElement.classList.add('introPending');
  markSeen();

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

    var video = document.createElement('video');
    video.className = 'intro-video';
    video.src = VIDEO_SRC;
    video.poster = POSTER_SRC;
    video.preload = 'metadata';
    video.autoplay = !reduce;
    video.muted = true;
    video.controls = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('controlslist', 'nodownload noplaybackrate');
    video.setAttribute('aria-label', 'DOG ARMY presentation video');

    TRACKS.forEach(function (item) {
      var track = document.createElement('track');
      track.kind = 'subtitles';
      track.srclang = item.code;
      track.label = item.flag + ' ' + item.label;
      track.src = item.src;
      video.appendChild(track);
    });
    box.appendChild(video);

    /* A visible global-language control complements the browser's native CC
       menu. The source remains clean: every track starts disabled. */
    var actions = modal.querySelector('.intro-actions');
    var languageWrap = document.createElement('label');
    languageWrap.className = 'intro-language';
    languageWrap.innerHTML = '<span>🌍 Subtitles · 13 languages</span>';
    var languageSelect = document.createElement('select');
    languageSelect.id = 'introCaptions';
    languageSelect.setAttribute('aria-label', 'Choose subtitle language');

    var off = document.createElement('option');
    off.value = '';
    off.textContent = 'CC off · no subtitles';
    languageSelect.appendChild(off);

    var browserLang = '';
    try { browserLang = String((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase(); } catch (e) {}
    TRACKS.forEach(function (item) {
      var option = document.createElement('option');
      option.value = item.code;
      option.textContent = item.flag + ' ' + item.label;
      if (browserLang && (browserLang === item.code.toLowerCase() || browserLang.indexOf(item.code.toLowerCase() + '-') === 0 || item.code.toLowerCase().indexOf(browserLang + '-') === 0)) {
        option.textContent += ' ★';
        option.title = 'Suggested for your browser';
      }
      languageSelect.appendChild(option);
    });
    languageWrap.appendChild(languageSelect);
    if (actions) actions.insertBefore(languageWrap, soundBtn || enterBtn);

    function setCaptions(code) {
      for (var i = 0; i < video.textTracks.length; i += 1) {
        video.textTracks[i].mode = (code && TRACKS[i] && TRACKS[i].code === code) ? 'showing' : 'disabled';
      }
      languageWrap.classList.toggle('is-on', !!code);
    }
    languageSelect.addEventListener('change', function () { setCaptions(languageSelect.value); });
    video.addEventListener('loadedmetadata', function () { setCaptions(''); });

    var heroVideo = document.querySelector('video[data-hero-video]');
    function pauseHero() { if (heroVideo) { try { heroVideo.pause(); } catch (e) {} } }

    scrim.hidden = false;
    modal.hidden = false;
    root.classList.remove('introPending');
    document.body.style.overflow = 'hidden';
    pauseHero();
    window.addEventListener('load', function () { if (!modal.hidden) pauseHero(); });
    try { enterBtn.focus(); } catch (e) {}
    if (!reduce) {
      try { video.play().catch(function () {}); } catch (e) {}
    }

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      modal.hidden = true;
      scrim.hidden = true;
      try { video.pause(); } catch (e) {}
      try { video.removeAttribute('src'); video.load(); } catch (e) {}
      try { box.textContent = ''; } catch (e) {}
      document.body.style.overflow = '';
      root.classList.remove('introPending');
      try { document.dispatchEvent(new CustomEvent('dog:intro:closed')); } catch (e) {}
      if (heroVideo) { try { heroVideo.play().catch(function () {}); } catch (e) {} }
    }

    enterBtn.addEventListener('click', close);
    if (closeBtn) closeBtn.addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !modal.hidden) close();
    });
    video.addEventListener('ended', close);

    if (soundBtn) soundBtn.addEventListener('click', function () {
      video.muted = false;
      video.volume = 1;
      try { video.play().catch(function () {}); } catch (e) {}
      soundBtn.hidden = true;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', open);
  else open();
})();
