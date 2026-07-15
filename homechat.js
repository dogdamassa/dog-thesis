/* DOG ARMY. The pack's war room on the home page — a compact mirror of the
   DOG DAO Room chat (kray.space, proxied by /api/dao). Compact mirror of the
   DAO room in web3.js:566-892: protocol changes (verify/message) must be
   applied in BOTH files.

   States (driven by wallet.js via the dog:wallet event + window.DogWallet):
     idle      not connected            -> teaser: last messages + connect CTA
     checking  connected, $DOG unknown  -> read-only + "reading your rank"
     guest     connected, 0 $DOG        -> read-only + get-$DOG CTA
     holder    connected, has $DOG      -> full chat with signed composer

   External file on purpose: script-src 'self' allows it without touching the
   inline-script CSP hashes. Must load AFTER wallet.js (both defer). */
(function () {
  'use strict';

  var POLL = 30000;          /* same cadence as /web3; edge cache s-maxage=15 */
  var COOLDOWN = 5000;       /* client-side anti-spam between barks */
  var TEASER_N = 3;          /* messages shown to a disconnected visitor */
  var FULL_N = 12;           /* messages shown in the full widget */
  var THUMB = '/api/thumb?id=';

  /* ---------- strings (JS-rendered content; static markup uses data-i18n) */
  var T = {
    en: {
      hcOnline: '{n} in the room',
      hcEmpty: 'The room is quiet. First bark takes the floor.',
      hcErr: "Couldn't read the room — it retries on its own.",
      hcPh: 'Say it to the pack — 280 chars, signed by your wallet.',
      hcSigning: 'Signing… confirm in your wallet',
      hcPosting: 'Barking to the room…',
      hcPosted: 'Barked ✓',
      hcRenew: 'Room session renewed — sign once more',
      hcPostErr: "The bark didn't land ({err}). Try again.",
      hcNeedDog: 'You need $DOG in this wallet to post.',
      hcYou: 'You',
      hcCooldown: 'Easy, soldier — one bark every few seconds.'
    },
    pt: {
      hcOnline: '{n} na sala',
      hcEmpty: 'A sala está quieta. O primeiro latido toma a palavra.',
      hcErr: 'Não deu pra ler a sala — tenta de novo sozinho.',
      hcPh: 'Fala pra matilha — 280 caracteres, assinado pela sua carteira.',
      hcSigning: 'Assinando… confirme na carteira',
      hcPosting: 'Latindo pra sala…',
      hcPosted: 'Latido publicado ✓',
      hcRenew: 'Sessão da sala renovada — assine mais uma vez',
      hcPostErr: 'O latido não saiu ({err}). Tenta de novo.',
      hcNeedDog: 'Você precisa de $DOG nesta carteira pra postar.',
      hcYou: 'Você',
      hcCooldown: 'Calma, soldado — um latido a cada poucos segundos.'
    },
    es: {
      hcOnline: '{n} en la sala',
      hcEmpty: 'La sala está en silencio. El primer ladrido toma la palabra.',
      hcErr: 'No se pudo leer la sala — reintenta solo.',
      hcPh: 'Díselo a la manada — 280 caracteres, firmado por tu cartera.',
      hcSigning: 'Firmando… confirma en tu cartera',
      hcPosting: 'Ladrando a la sala…',
      hcPosted: 'Ladrido publicado ✓',
      hcRenew: 'Sesión de la sala renovada — firma una vez más',
      hcPostErr: 'El ladrido no salió ({err}). Inténtalo de nuevo.',
      hcNeedDog: 'Necesitas $DOG en esta cartera para publicar.',
      hcYou: 'Tú',
      hcCooldown: 'Calma, soldado — un ladrido cada pocos segundos.'
    }
  };
  function lang() {
    try {
      var s = sessionStorage.getItem('dogLang');
      if (s && T[s]) return s;
    } catch (e) {}
    var l = (document.documentElement.lang || 'en').slice(0, 2);
    return T[l] ? l : 'en';
  }
  function t(key, vars) {
    var s = (T[lang()] && T[lang()][key]) || T.en[key] || '';
    Object.keys(vars || {}).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function kray() { return typeof window.krayWallet !== 'undefined' ? window.krayWallet : null; }
  function short(a) { return a ? a.slice(0, 6) + '…' + a.slice(-4) : '—'; }
  function msgTime(ts) {
    var d = ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return '';
    /* quiet weeks: an old message with a bare clock time would read as today */
    return (Date.now() - d.getTime() < 20 * 3600 * 1000)
      ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  /* ---------- avatars (same chain as web3.js: pfp -> nft thumb -> initials) */
  var avatarCache = {};
  function avaInitials(msg) {
    var el = document.createElement('span');
    el.className = 'hqchat-ava hqchat-ava-txt';
    var a = String((msg && msg.sender) || '');
    el.textContent = (a.slice(4, 6) || '??').toUpperCase();
    return el;
  }
  function avaImg(src, msg) {
    var el = document.createElement('img');
    el.className = 'hqchat-ava';
    el.alt = '';
    el.loading = 'lazy';
    el.src = src;
    el.onerror = function () {
      el.onerror = null;
      if (el.parentNode) el.parentNode.replaceChild(avaInitials(msg), el);
    };
    return el;
  }
  function avatar(msg) {
    var id = avatarCache[msg && msg.sender];
    if (typeof id === 'string' && id) return avaImg(THUMB + encodeURIComponent(id), msg);
    var thumb = msg && msg.nftThumbnail;
    if (typeof thumb === 'string' && /^https:\/\//.test(thumb)) {
      /* kray.space is allowed by img-src; anything else rides the proxy */
      return avaImg(thumb.indexOf('https://www.kray.space/') === 0
        ? thumb : '/api/thumb?u=' + encodeURIComponent(thumb), msg);
    }
    return avaInitials(msg);
  }
  function resolveAvatars(msgs) {
    var fresh = [];
    msgs.forEach(function (m) {
      var a = m && m.sender;
      if (a && !(a in avatarCache)) { avatarCache[a] = null; fresh.push(a); }
    });
    if (!fresh.length) return;
    Promise.all(fresh.map(function (a) {
      return fetch('/api/avatar?address=' + encodeURIComponent(a))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.id) { avatarCache[a] = d.id; return true; } return false; })
        ['catch'](function () { return false; });
    })).then(function (hits) {
      if (hits.indexOf(true) !== -1) { chatSig = ''; render(); }
    });
  }

  /* ---------- state ---------- */
  var root = null;
  var wallet = { connected: false, address: '', dogAmount: null };
  var data = null;         /* merged {chat, proposals, members} */
  var tried = false;       /* "never fetched" vs "fetch failed" */
  var loading = false;
  var chatSig = '';        /* rebuild the feed only when content changes */
  var inView = false;
  var lastLoad = 0;
  var verified = false;    /* room handshake done this session */
  var roomWeight = null;   /* the room's view of our weight (percent) */
  var pubkey = '';
  var sending = false;
  var lastSend = 0;

  function mode() {
    if (!wallet.connected) return 'idle';
    if (wallet.dogAmount == null) return 'checking';
    return wallet.dogAmount > 0 ? 'holder' : 'guest';
  }

  /* ---------- render (user content: textContent only, never innerHTML) ---- */
  function render() {
    var feed = $('hqchatFeed');
    if (!root || !feed) return;
    var m = mode();
    var teaser = $('hqchatTeaser');
    var gate = $('hqchatGate');
    var compose = $('hqchatCompose');
    var checking = $('hqchatChecking');
    if (teaser) teaser.hidden = m !== 'idle';
    if (gate) gate.hidden = m !== 'guest';
    if (compose) compose.hidden = m !== 'holder';
    if (checking) checking.hidden = m !== 'checking';
    root.classList.toggle('is-teaser', m === 'idle');

    var onlineEl = $('hqchatOnline');
    if (onlineEl) {
      var mem = data && data.members;
      onlineEl.textContent = (mem && mem.onlineCount != null) ? t('hcOnline', { n: mem.onlineCount }) : '';
    }

    var msgs = (data && data.chat) ? (data.chat.messages || []) : null;
    if (msgs && msgs.length) resolveAvatars(msgs);
    if (msgs === null && !tried) return;  /* keep the static placeholder */

    var sig = lang() + ':' + wallet.address + ':' + m + ':' + (msgs === null ? 'err'
      : msgs.length + ':' + (msgs.length
        ? String(msgs[msgs.length - 1].id || msgs[msgs.length - 1].timestamp || '') : ''));
    if (sig === chatSig) return;
    /* a reader scrolled up must not be yanked down by the 30s poll */
    var firstPaint = !chatSig;
    var nearBottom = firstPaint ||
      (feed.scrollHeight - feed.scrollTop - feed.clientHeight) < 48;
    var prevTop = feed.scrollTop;
    chatSig = sig;
    feed.textContent = '';
    if (msgs === null || !msgs.length) {
      var e1 = document.createElement('div');
      e1.className = 'hqchat-empty';
      e1.textContent = t(msgs === null ? 'hcErr' : 'hcEmpty');
      feed.appendChild(e1);
      return;
    }
    msgs.slice(m === 'idle' ? -TEASER_N : -FULL_N).forEach(function (msg) {
      var row = document.createElement('div');
      row.className = 'hqchat-msg';
      row.appendChild(avatar(msg));
      var body = document.createElement('div');
      body.className = 'hqchat-body';
      var head = document.createElement('div');
      head.className = 'hqchat-meta';
      var who = document.createElement('b');
      var mine = wallet.address && msg.sender === wallet.address;
      who.textContent = mine ? t('hcYou') : (msg.senderShort || short(msg.sender));
      if (mine) who.classList.add('is-you');
      head.appendChild(who);
      if (msg.weightRank === 1) {
        var rk = document.createElement('i');
        rk.className = 'hqchat-rank1';
        rk.textContent = '#1';
        head.appendChild(rk);
      }
      if (msg.weightFormatted) {
        var wt = document.createElement('i');
        wt.className = 'hqchat-wt';
        wt.textContent = msg.weightFormatted;
        head.appendChild(wt);
      }
      var tm = document.createElement('time');
      tm.textContent = msgTime(msg.timestamp);
      head.appendChild(tm);
      var txt = document.createElement('p');
      txt.textContent = String(msg.content || '');
      body.appendChild(head);
      body.appendChild(txt);
      row.appendChild(body);
      feed.appendChild(row);
    });
    feed.scrollTop = nearBottom ? feed.scrollHeight : prevTop;
  }

  /* ---------- transport ---------- */
  function loadChat() {
    if (loading) return;
    loading = true;
    lastLoad = Date.now();
    /* same URL as /web3 so both share one edge-cache entry */
    fetch('/api/dao?what=all&limit=30')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        loading = false;
        tried = true;
        if (d && d.success) {
          /* per-part merge: an upstream part that failed must not wipe the
             last good read of that part */
          if (!data) data = {};
          ['chat', 'proposals', 'members'].forEach(function (k) {
            if (d[k]) data[k] = d[k];
          });
        }
        render();
      })
      .catch(function () { loading = false; tried = true; render(); });
  }

  /* ---------- posting (holder-gated, wallet-signed; mirrors web3.js) ------ */
  function setStatus(msg, kind) {
    var s = $('hqchatStatus');
    if (!s) return;
    s.textContent = msg || '';
    s.classList.remove('is-err', 'is-ok');
    if (kind) s.classList.add(kind);
  }
  function normalizePubkey(pk) {
    var s = (typeof pk === 'string') ? pk : (pk && pk.publicKey) || '';
    s = String(s).toLowerCase();
    if (/^0[23][0-9a-f]{64}$/.test(s)) s = s.slice(2);
    return /^[0-9a-f]{64}$/.test(s) ? s : '';
  }
  function getPubkey() {
    if (pubkey) return Promise.resolve(pubkey);
    var w = kray();
    if (!w || typeof w.getPublicKey !== 'function') return Promise.resolve('');
    return w.getPublicKey().then(function (pk) {
      pubkey = normalizePubkey(pk);
      return pubkey;
    }).catch(function () { return ''; });
  }
  function verify() {
    var w = kray();
    if (!w || !wallet.address) return Promise.reject(new Error('wallet'));
    if (verified) return Promise.resolve(roomWeight);
    var ts = Date.now();
    var msg = 'DAO:DOGGOTOTHEMOON:' + ts;
    var sign = typeof w.signMessageWithConfirmation === 'function'
      ? w.signMessageWithConfirmation(msg) : w.signMessage(msg);
    return Promise.all([sign, getPubkey()]).then(function (rs) {
      var sig = rs[0] && rs[0].signature;
      if (!sig || !rs[1]) throw new Error('signature');
      return fetch('/api/dao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what: 'verify', address: wallet.address, pubkey: rs[1], signature: sig, timestamp: ts })
      });
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.success) throw new Error((d && d.error) || 'verify');
      verified = true;
      roomWeight = (d.weight && d.weight.percent != null) ? Number(d.weight.percent) : null;
      return roomWeight;
    });
  }
  function send(retried) {
    if (sending) return;
    var inp = $('hqchatInput');
    var text = inp ? String(inp.value || '').trim() : '';
    if (!text) return;
    if (mode() !== 'holder') { setStatus(t('hcNeedDog'), 'is-err'); return; }
    if (!retried && Date.now() - lastSend < COOLDOWN) { setStatus(t('hcCooldown'), 'is-err'); return; }
    sending = true;
    var btn = $('hqchatSend');
    if (btn) btn.disabled = true;
    setStatus(t(verified ? 'hcPosting' : 'hcSigning'));
    verify().then(function (weight) {
      setStatus(t('hcPosting'));
      return fetch('/api/dao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          what: 'message', address: wallet.address, content: text,
          /* fallback weight = % of the 100B supply (dogAmount / 1e9) */
          weight: (weight != null ? weight : (wallet.dogAmount || 0) / 1e9)
        })
      });
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.success) throw new Error((d && d.error) || 'post');
      sending = false;
      if (btn) btn.disabled = false;
      if (inp) { inp.value = ''; updateCount(); }
      lastSend = Date.now();
      setStatus(t('hcPosted'), 'is-ok');
      chatSig = '';   /* force the feed to rebuild with the new message */
      loadChat();
      setTimeout(function () { setStatus(''); }, 2500);
    })['catch'](function (e) {
      verified = false;   /* re-handshake on the next attempt */
      sending = false;
      if (btn) btn.disabled = false;
      var msg = (e && e.message) || 'wallet';
      if (!retried && msg === 'upstream') {
        /* KRAY's room session went cold while idle — renew it once inside
           the same gesture (one extra signature popup), never in a loop */
        setStatus(t('hcRenew'));
        send(true);
        return;
      }
      setStatus(t('hcPostErr', { err: msg }), 'is-err');
    });
  }

  /* ---------- wiring ---------- */
  function updateCount() {
    var inp = $('hqchatInput');
    var c = $('hqchatCount');
    if (inp && c) c.textContent = String(inp.value || '').length + '/280';
  }
  function applyPlaceholder() {
    var inp = $('hqchatInput');
    if (inp) inp.placeholder = t('hcPh');
  }
  function bind() {
    var form = $('hqchatCompose');
    if (form) form.addEventListener('submit', function (e) { e.preventDefault(); send(false); });
    var inp = $('hqchatInput');
    if (inp) {
      inp.addEventListener('input', updateCount);
      inp.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); send(false); }
      });
    }
    var cta = $('hqchatConnect');
    if (cta) cta.addEventListener('click', function () {
      if (window.DogWallet && typeof window.DogWallet.open === 'function') window.DogWallet.open();
    });
    applyPlaceholder();
    updateCount();
  }
  function watch() {
    /* lazy: no fetch until the block nears the viewport; poll pauses when
       the tab is hidden or the block is scrolled away */
    function due() { return Date.now() - lastLoad > POLL; }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        inView = es.some(function (e) { return e.isIntersecting; });
        if (inView && due()) loadChat();
      }, { rootMargin: '200px' });
      io.observe(root);
    } else {
      inView = true;
      setTimeout(loadChat, 4000);
    }
    setInterval(function () {
      if (inView && !document.hidden && due()) loadChat();
    }, POLL);
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden && inView && due()) loadChat();
    });
  }

  document.addEventListener('dog:wallet', function (e) {
    if (e.detail) wallet = e.detail;
    render();
  });
  document.addEventListener('dog:lang', function () {
    chatSig = '';
    applyPlaceholder();
    render();
  });

  function init() {
    root = $('hqchat');
    if (!root) return;
    /* wallet.js registered its DOMContentLoaded first (script order), so the
       snapshot already exists — covers a connection made before we booted */
    if (window.DogWallet && window.DogWallet.state) wallet = window.DogWallet.state;
    bind();
    render();
    watch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
