/* DOG ARMY. Inline episode player for The Breakdown #750.
   X's public replay CDN rejects non-X browser origins, so the HLS playlist
   points at same-origin segments served by the existing /api/social
   function. hls.js is vendored locally for CSP-safe Chrome/Firefox playback;
   Safari uses its native HLS support. Nothing loads until the visitor presses
   play. */
(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var video = document.getElementById('episodePlayer');
    var start = document.getElementById('episodeStart');
    var status = document.getElementById('episodeStatus');
    var captionButtons = document.querySelectorAll('[data-episode-caption]');
    if (!video || !start) return;

    var source = video.getAttribute('data-src');
    var hls = null;
    var starting = false;
    var started = false;
    var captionTouched = false;

    function message(text) {
      if (!status) return;
      status.textContent = text || '';
      status.hidden = !text;
    }

    function currentSiteLanguage() {
      var lang = (document.documentElement.getAttribute('lang') || 'en').toLowerCase();
      if (lang.indexOf('pt') === 0) return 'pt';
      if (lang.indexOf('es') === 0) return 'es';
      if (lang.indexOf('it') === 0) return 'it';
      return 'en';
    }

    function selectCaptions(language, userChoice) {
      var tracks = video.textTracks || [];
      var selected = language || 'off';
      for (var i = 0; i < tracks.length; i++) {
        var trackLanguage = String(tracks[i].language || '').toLowerCase().split('-')[0];
        tracks[i].mode = selected !== 'off' && trackLanguage === selected ? 'showing' : 'disabled';
      }
      captionButtons.forEach(function (button) {
        var active = button.getAttribute('data-episode-caption') === selected;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (userChoice) captionTouched = true;
    }

    captionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        selectCaptions(button.getAttribute('data-episode-caption'), true);
      });
    });

    document.addEventListener('dog:lang', function (event) {
      if (!captionTouched) selectCaptions((event.detail && event.detail.lang) || currentSiteLanguage(), false);
    });

    function fail() {
      starting = false;
      start.classList.remove('is-loading');
      start.hidden = false;
      message('The replay could not start. Please try again.');
    }

    function playWhenReady() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(fail);
      started = true;
      starting = false;
      start.hidden = true;
      start.classList.remove('is-loading');
      message('');
      selectCaptions(currentSiteLanguage(), false);
    }

    function begin() {
      if (starting) return;
      if (started) { playWhenReady(); return; }
      starting = true;
      start.classList.add('is-loading');
      message('Loading the full replay…');

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: false,
          capLevelToPlayerSize: true,
          maxBufferLength: 48,
          maxMaxBufferLength: 96,
          backBufferLength: 30
        });
        hls.on(window.Hls.Events.MANIFEST_PARSED, playWhenReady);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
            hls = null;
            fail();
          }
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return;
      }

      /* Safari's native HLS path. Chromium also reports "maybe" here on some
         versions despite a partial demuxer, so hls.js intentionally wins when
         MediaSource is available. */
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', playWhenReady, { once: true });
        video.addEventListener('error', fail, { once: true });
        video.load();
        return;
      }

      message('This browser does not support the episode player.');
      start.classList.remove('is-loading');
    }

    start.addEventListener('click', begin);
    selectCaptions(currentSiteLanguage(), false);
  });
})();
