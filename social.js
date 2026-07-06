/* DOG ARMY Social page. Read-only KRAY Social timeline rendered through
   /api/social, so user-generated text is inserted with textContent only. */
(function () {
  var FALLBACK = '/public/dog-army-mark.png';
  var current = 'trending';

  /* i18n-lite for JS-built status text (page baseline is EN; the data-i18n
     dictionary can't reach nodes created after apply() runs) */
  var lang = null;
  try { lang = sessionStorage.getItem('dogLang'); } catch (e) {}
  if (!lang && /[?&]lang=(pt|es)/.test(location.search)) lang = RegExp.$1;
  var STR = {
    pt: { loading: 'Carregando posts…', empty: 'Nenhum post por aqui ainda.', fail: 'Não deu pra carregar o KRAY Social agora. Tenta de novo já já.' },
    es: { loading: 'Cargando posts…', empty: 'Ningún post por aquí todavía.', fail: 'No se pudo cargar KRAY Social ahora. Inténtalo de nuevo pronto.' },
    en: { loading: 'Loading posts...', empty: 'No posts available right now.', fail: 'Could not load KRAY Social right now.' }
  };
  var T = STR[lang] || STR.en;

  function $(id) { return document.getElementById(id); }

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function fmtDate(v) {
    if (!v) return '';
    var d = new Date(v);
    if (isNaN(d)) return '';
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function renderPost(p) {
    var a = el('a', 'sp-post');
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener';

    var imgWrap = el('span', 'sp-post-media');
    var img = document.createElement('img');
    img.src = p.img || FALLBACK;
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', function () { img.src = FALLBACK; }, { once: true });
    imgWrap.appendChild(img);

    var body = el('span', 'sp-post-body');
    var meta = el('span', 'sp-post-meta');
    if (p.l2) meta.appendChild(el('b', 'sp-l2', 'L2'));
    var when = fmtDate(p.at) || 'KRAY Social';
    meta.appendChild(document.createTextNode(p.name ? p.name + ' · ' + when : when));

    var text = el('span', 'sp-post-text', p.text || '');

    var stats = el('span', 'sp-post-stats');
    stats.appendChild(el('span', '', '❤️ ' + (p.likes || 0)));
    stats.appendChild(el('span', '', '💬 ' + (p.comments || 0)));
    if (p.reward) {
      stats.appendChild(el('span', 'sp-reward',
        '💰 ' + p.reward.amount.toLocaleString('en-US', { maximumFractionDigits: 5 }) + ' ' + p.reward.token + ' · ' + p.reward.left + ' left'));
    }

    body.appendChild(meta);
    body.appendChild(text);
    body.appendChild(stats);
    a.appendChild(imgWrap);
    a.appendChild(body);
    return a;
  }

  function setActive(feed) {
    Array.prototype.forEach.call(document.querySelectorAll('.soc-chip'), function (b) {
      b.classList.toggle('active', b.getAttribute('data-feed') === feed);
    });
  }

  function load(feed) {
    current = feed;
    setActive(feed);
    var box = $('spTimeline');
    if (!box) return;
    box.innerHTML = '';
    box.appendChild(el('p', 'sp-msg', T.loading));

    fetch('/api/social?feed=' + encodeURIComponent(feed) + '&limit=24')
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (feed !== current) return;
        if (!d || !d.success) throw new Error('upstream');
        var posts = d.posts || [];
        box.innerHTML = '';
        if (!posts.length) {
          box.appendChild(el('p', 'sp-msg', T.empty));
          return;
        }
        posts.forEach(function (p) { box.appendChild(renderPost(p)); });
      })
      .catch(function () {
        if (feed !== current) return;
        box.innerHTML = '';
        box.appendChild(el('p', 'sp-msg', T.fail));
      });
  }

  ready(function () {
    Array.prototype.forEach.call(document.querySelectorAll('.soc-chip'), function (btn) {
      btn.addEventListener('click', function () {
        load(btn.getAttribute('data-feed') || 'trending');
      });
    });
    load(current);
  });
})();
