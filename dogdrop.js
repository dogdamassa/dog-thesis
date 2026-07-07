/* DOG ARMY. "DOG Drop" — a catch-the-DOG reward drop.
   At some moment the DOG puppy peeks into the page; catching it (a click)
   opens a claim that pays real $DOG from KRAY's escrow (the "DOG REWARD
   ONBOARD" Dev Scroll). The scroll_key is SECRET and lives ONLY in the
   KRAY_SCROLL_KEY env var on the server — the browser never sees it. This
   file only: (1) reads public pool status via /api/scroll, (2) asks the
   visitor's KRAY Wallet to sign the canonical claim message, (3) forwards
   that signature to /api/scroll which calls escrow.

   External file on purpose: script-src 'self' in vercel.json allows it with
   no inline-script hash; the DOG image is same-origin (img-src 'self') and
   the only fetch target is /api/scroll (connect-src 'self'). No CSP change. */
(function () {
  'use strict';

  /* ---------- config ---------- */
  var DOG_IMG      = '/public/dog-logo.png';
  var FIRST_DELAY  = 14000;   /* let the visitor engage before the DOG shows  */
  var VISIBLE_MS   = 22000;   /* time on screen to notice + click before it hides */
  var REAPPEAR_GAP = 80000;   /* gap before it peeks again if missed          */
  var MAX_SHOWS    = 4;       /* auto-appearances per session (until caught/dismissed) */
  var CAUGHT_KEY   = 'dogDropCaught';   /* this browser already caught its DOG */
  var LSKEY_CONN   = 'dogArmyKrayConnected';   /* shared with wallet.js        */

  /* ---------- i18n (self-contained; mirrors sessionStorage.dogLang) ---------- */
  var STR = {
    en: {
      bubble:  'catch me!',
      close:   'Hide the DOG',
      spriteA: 'A DOG appeared — click to catch free $DOG',
      title:   'You spotted a DOG! 🐕',
      sub:     'It is carrying {n} $DOG from the Army reward pool. Catch it with your KRAY Wallet.',
      left:    '{n} DOG left in the pool',
      connect: 'Connect & catch',
      catch:   'Catch {n} DOG',
      signing: 'Confirm in your wallet…',
      claim:   'Releasing your DOG…',
      okTitle: 'Caught! 🎉',
      okSub:   '{n} $DOG are on their way to your wallet.',
      viewTx:  'View on DogScan ↗',
      done:    'Nice catch, soldier.',
      already: 'You already caught your DOG. 🐕',
      empty:   'This drop is empty — every DOG was caught.',
      noWallet:'You need the KRAY Wallet to catch it.',
      getWallet:'Get KRAY Wallet ↗',
      locked:  'Your KRAY Wallet is locked — unlock it and try again.',
      err:     'The DOG slipped away. Try again.',
      retry:   'Try again'
    },
    pt: {
      bubble:  'me pega!',
      close:   'Esconder o DOG',
      spriteA: 'Um DOG apareceu — clique para pegar $DOG grátis',
      title:   'Você achou um DOG! 🐕',
      sub:     'Ele está trazendo {n} $DOG do prêmio da Army. Pega ele com a sua KRAY Wallet.',
      left:    '{n} DOG restantes no pote',
      connect: 'Conectar e pegar',
      catch:   'Pegar {n} DOG',
      signing: 'Confirme na sua carteira…',
      claim:   'Soltando o seu DOG…',
      okTitle: 'Pegou! 🎉',
      okSub:   '{n} $DOG a caminho da sua carteira.',
      viewTx:  'Ver na DogScan ↗',
      done:    'Belo bote, soldado.',
      already: 'Você já pegou o seu DOG. 🐕',
      empty:   'Esse drop acabou — todo DOG foi pego.',
      noWallet:'Você precisa da KRAY Wallet para pegar.',
      getWallet:'Baixar a KRAY Wallet ↗',
      locked:  'Sua KRAY Wallet está bloqueada — desbloqueie e tente de novo.',
      err:     'O DOG escapou. Tenta de novo.',
      retry:   'Tentar de novo'
    },
    es: {
      bubble:  '¡atrápame!',
      close:   'Ocultar el DOG',
      spriteA: 'Apareció un DOG — haz clic para atrapar $DOG gratis',
      title:   '¡Encontraste un DOG! 🐕',
      sub:     'Trae {n} $DOG del premio de la Army. Atrápalo con tu KRAY Wallet.',
      left:    'Quedan {n} DOG en el pozo',
      connect: 'Conectar y atrapar',
      catch:   'Atrapar {n} DOG',
      signing: 'Confirma en tu billetera…',
      claim:   'Soltando tu DOG…',
      okTitle: '¡Atrapado! 🎉',
      okSub:   '{n} $DOG van en camino a tu billetera.',
      viewTx:  'Ver en DogScan ↗',
      done:    'Buena atrapada, soldado.',
      already: 'Ya atrapaste tu DOG. 🐕',
      empty:   'Este drop está vacío — cada DOG fue atrapado.',
      noWallet:'Necesitas la KRAY Wallet para atraparlo.',
      getWallet:'Obtener KRAY Wallet ↗',
      locked:  'Tu KRAY Wallet está bloqueada — desbloquéala e inténtalo otra vez.',
      err:     'El DOG se escapó. Inténtalo de nuevo.',
      retry:   'Intentar de nuevo'
    }
  };
  function lang() {
    var l = '';
    try { l = sessionStorage.getItem('dogLang') || ''; } catch (e) {}
    return STR[l] ? l : 'en';
  }
  function t(k, n) {
    var s = (STR[lang()] || STR.en)[k] || STR.en[k] || '';
    return n == null ? s : s.replace('{n}', n);
  }

  /* ---------- helpers ---------- */
  function kray() { return typeof window.krayWallet !== 'undefined' ? window.krayWallet : null; }
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function fmt(n) {
    var v = Number(n);
    if (!isFinite(v)) return String(n == null ? '' : n);
    return (Math.round(v * 100) / 100).toLocaleString('en-US');
  }
  /* proxies need the x-only pubkey: 64 hex. Drop the 02/03 prefix byte. */
  function normPubkey(pk) {
    var s = (typeof pk === 'string') ? pk : (pk && pk.publicKey) || '';
    s = String(s).toLowerCase();
    if (/^0[23][0-9a-f]{64}$/.test(s)) s = s.slice(2);
    return /^[0-9a-f]{64}$/.test(s) ? s : '';
  }
  function caught() { try { return localStorage.getItem(CAUGHT_KEY) === '1'; } catch (e) { return false; } }
  function markCaught() { try { localStorage.setItem(CAUGHT_KEY, '1'); } catch (e) {} }

  /* ---------- style (style-src allows 'unsafe-inline') ---------- */
  var CSS =
  '.dd-wrap{position:fixed;right:16px;bottom:16px;z-index:2147483000;' +
    'right:calc(16px + env(safe-area-inset-right));bottom:calc(16px + env(safe-area-inset-bottom));}' +
  '.dd-sprite{position:relative;display:block;border:0;background:none;padding:0;cursor:pointer;' +
    'width:96px;height:96px;filter:drop-shadow(0 8px 22px rgba(255,92,0,.45));' +
    'transform:translateY(140%);opacity:0;transition:transform .55s cubic-bezier(.2,.9,.25,1.3),opacity .4s;}' +
  '.dd-wrap.is-in .dd-sprite{transform:translateY(0);opacity:1;}' +
  '.dd-sprite img{width:100%;height:100%;object-fit:contain;display:block;pointer-events:none;' +
    'animation:dd-wag 2.4s ease-in-out infinite;transform-origin:50% 90%;}' +
  '.dd-sprite::before{content:"";position:absolute;inset:-14% -14% -6% -14%;border-radius:50%;z-index:-1;' +
    'background:radial-gradient(closest-side,rgba(255,92,0,.55),transparent 72%);animation:dd-pulse 2.4s ease-in-out infinite;}' +
  '.dd-sprite:hover img{animation-duration:.9s;}' +
  '.dd-bubble{position:absolute;top:-14px;left:50%;transform:translateX(-58%);white-space:nowrap;' +
    'background:#ff5c00;color:#0a0500;font:800 12px/1 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;' +
    'letter-spacing:.02em;text-transform:uppercase;padding:6px 9px;border-radius:9px;box-shadow:0 4px 14px rgba(0,0,0,.4);}' +
  '.dd-bubble::after{content:"";position:absolute;left:52%;bottom:-5px;width:10px;height:10px;background:#ff5c00;' +
    'transform:translateX(-50%) rotate(45deg);border-radius:2px;}' +
  '.dd-x{position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;border:1px solid #333;' +
    'background:#151515;color:#bbb;font:700 13px/20px system-ui,sans-serif;cursor:pointer;padding:0;' +
    'display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;}' +
  '.dd-wrap.is-in:hover .dd-x{opacity:1;}' +
  '.dd-x:hover{color:#fff;border-color:#ff5c00;}' +
  /* modal */
  '.dd-scrim{position:fixed;inset:0;z-index:2147483001;background:rgba(3,3,3,.72);' +
    'backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;' +
    'opacity:0;transition:opacity .25s;}' +
  '.dd-scrim.is-open{opacity:1;}' +
  '.dd-card{width:100%;max-width:352px;background:#0b0b0d;border:1px solid #26170c;border-radius:18px;' +
    'box-shadow:0 24px 70px rgba(0,0,0,.6),0 0 0 1px rgba(255,92,0,.12);padding:22px 20px 20px;' +
    'text-align:center;color:#f2ede8;position:relative;transform:translateY(12px) scale(.97);' +
    'transition:transform .25s cubic-bezier(.2,.9,.3,1.2);font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;}' +
  '.dd-scrim.is-open .dd-card{transform:none;}' +
  '.dd-card-x{position:absolute;top:10px;right:12px;width:30px;height:30px;border:0;background:none;color:#8a8a8a;' +
    'font-size:22px;line-height:1;cursor:pointer;border-radius:8px;}' +
  '.dd-card-x:hover{color:#fff;background:#1a1a1a;}' +
  '.dd-hero{width:104px;height:104px;margin:0 auto 4px;object-fit:contain;' +
    'filter:drop-shadow(0 10px 22px rgba(255,92,0,.4));}' +
  '.dd-card h3{margin:6px 0 6px;font-size:20px;font-weight:800;letter-spacing:-.01em;}' +
  '.dd-card p{margin:0 auto;font-size:14px;line-height:1.5;color:#c7c1bb;max-width:30ch;}' +
  '.dd-left{margin-top:10px;font-size:12px;color:#8a8a8a;letter-spacing:.02em;}' +
  '.dd-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:16px;' +
    'padding:13px 16px;border:0;border-radius:12px;cursor:pointer;font-size:15px;font-weight:800;' +
    'color:#180a00;background:linear-gradient(180deg,#ff7a29,#ff5c00);box-shadow:0 8px 22px rgba(255,92,0,.35);' +
    'transition:transform .12s,box-shadow .2s,opacity .2s;}' +
  '.dd-btn:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(255,92,0,.45);}' +
  '.dd-btn:active{transform:translateY(0);}' +
  '.dd-btn[disabled]{opacity:.6;cursor:progress;transform:none;box-shadow:none;}' +
  '.dd-link{display:inline-block;margin-top:14px;color:#ff8a3d;font-size:13px;font-weight:700;text-decoration:none;}' +
  '.dd-link:hover{text-decoration:underline;}' +
  '.dd-note{margin-top:12px;font-size:12px;color:#8a8a8a;}' +
  '.dd-err{color:#ff8f6b !important;}' +
  '.dd-spin{width:16px;height:16px;border-radius:50%;border:2px solid rgba(24,10,0,.35);border-top-color:#180a00;' +
    'animation:dd-spin .7s linear infinite;}' +
  '@keyframes dd-spin{to{transform:rotate(360deg)}}' +
  '@keyframes dd-wag{0%,100%{transform:rotate(-4deg)}50%{transform:rotate(4deg)}}' +
  '@keyframes dd-pulse{0%,100%{opacity:.5;transform:scale(.94)}50%{opacity:.85;transform:scale(1.04)}}' +
  '@media (prefers-reduced-motion: reduce){' +
    '.dd-sprite{transition:opacity .3s;transform:none;}.dd-sprite img,.dd-sprite::before{animation:none;}' +
    '.dd-scrim,.dd-card{transition:none;}.dd-spin{animation-duration:1.2s;}}' +
  '@media (max-width:420px){.dd-sprite{width:82px;height:82px;}}';

  /* ---------- state ---------- */
  var pool = null;          /* poolInfo from /api/scroll */
  var address = '';
  var pubkey = '';
  var shows = 0;
  var busy = false;
  var claimedOnServer = false;
  var wrap, sprite, scrim, card, hideTimer, gapTimer, lastFocus;

  /* ---------- wallet handshake (own minimal flow, like web3.js/dogscan.js) ---------- */
  function addrFrom(res) {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (Array.isArray(res)) return res[0] || '';
    if (res.address) return res.address;
    if (Array.isArray(res.accounts)) return res.accounts[0] || '';
    return '';
  }
  /* silent — never pops the wallet up (returning, already-approved origin) */
  function silentAddr() {
    var w = kray();
    if (!w) return Promise.resolve('');
    var fn = w.getAccounts || w.connect;
    if (!fn) return Promise.resolve('');
    return Promise.resolve().then(function () { return fn.call(w); })
      .then(function (r) { return addrFrom(r); })
      .catch(function () { return ''; });
  }
  function getPubkey() {
    if (pubkey) return Promise.resolve(pubkey);
    var w = kray();
    if (!w || typeof w.getPublicKey !== 'function') return Promise.resolve('');
    return w.getPublicKey().then(function (pk) { pubkey = normPubkey(pk); return pubkey; })
      .catch(function () { return ''; });
  }

  /* ---------- claim ---------- */
  function claim() {
    if (busy) return;
    var w = kray();
    if (!w) { renderNoWallet(); return; }
    busy = true;

    /* 1) make sure we have an address (may popup on first approval) */
    var pAddr = address ? Promise.resolve(address) : (function () {
      renderState('signing');
      var call = (typeof w.requestAccounts === 'function') ? w.requestAccounts()
               : (typeof w.connect === 'function' ? w.connect() : Promise.reject());
      return Promise.resolve(call).then(function (res) {
        if (res && res.success === false) throw { locked: !!res.needsUserAction };
        var a = addrFrom(res);
        if (!a) throw new Error('no-address');
        address = a;
        try { localStorage.setItem(LSKEY_CONN, '1'); } catch (e) {}
        return a;
      });
    })();

    pAddr.then(function (a) {
      renderState('signing');
      var msg = 'scroll_claim:reward:' + a + ':' + Date.now();
      var sign = (typeof w.signMessageWithConfirmation === 'function')
        ? w.signMessageWithConfirmation(msg) : w.signMessage(msg);
      return Promise.all([sign, getPubkey()]).then(function (rs) {
        var sig = rs[0] && rs[0].signature, pk = rs[1];
        if (!sig) throw { locked: !!(rs[0] && rs[0].needsUserAction) };
        if (!pk) throw new Error('pubkey');
        renderState('claim');
        return fetch('/api/scroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_address: a, user_pubkey: pk, user_signature: sig, user_message: msg
          })
        });
      });
    }).then(function (r) { return r.json().catch(function () { return {}; })
        .then(function (d) { return { ok: r.ok, d: d }; }); })
    .then(function (res) {
      var d = res.d || {};
      if (res.ok && d.success) { markCaught(); renderSuccess(d); return; }
      var e = String(d.error || '').toLowerCase();
      if (/already|claimed|duplicate/.test(e)) { claimedOnServer = true; markCaught(); renderState('already'); return; }
      renderState('err');
    }).catch(function (e) {
      renderState(e && e.locked ? 'locked' : 'err');
    }).then(function () { busy = false; });
  }

  /* ---------- modal rendering ---------- */
  function build() {
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);

    wrap = el('div', 'dd-wrap');
    sprite = el('button', 'dd-sprite');
    sprite.type = 'button';
    sprite.setAttribute('aria-label', t('spriteA'));
    var img = el('img'); img.src = DOG_IMG; img.alt = ''; img.setAttribute('aria-hidden', 'true');
    var bubble = el('span', 'dd-bubble'); bubble.textContent = t('bubble');
    var x = el('button', 'dd-x'); x.type = 'button'; x.setAttribute('aria-label', t('close')); x.textContent = '×';
    sprite.appendChild(img); sprite.appendChild(bubble);
    wrap.appendChild(sprite); wrap.appendChild(x);
    document.body.appendChild(wrap);

    sprite.addEventListener('click', open);
    x.addEventListener('click', function (ev) { ev.stopPropagation(); dismiss(); });

    scrim = el('div', 'dd-scrim');
    card = el('div', 'dd-card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');
    card.setAttribute('aria-labelledby', 'dd-title');
    scrim.appendChild(card);
    scrim.addEventListener('click', function (ev) { if (ev.target === scrim) close(); });
    document.addEventListener('keydown', function (ev) {
      if ((ev.key === 'Escape' || ev.key === 'Esc') && scrim && scrim.parentNode && scrim.classList.contains('is-open')) close();
    });
  }

  function baseCard(inner) {
    card.innerHTML = '';
    var xb = el('button', 'dd-card-x'); xb.type = 'button'; xb.setAttribute('aria-label', t('close')); xb.textContent = '×';
    xb.addEventListener('click', close);
    card.appendChild(xb);
    var hero = el('img', 'dd-hero'); hero.src = DOG_IMG; hero.alt = ''; hero.setAttribute('aria-hidden', 'true');
    card.appendChild(hero);
    card.appendChild(inner);
  }

  function renderIntro() {
    var box = el('div');
    var h = el('h3'); h.id = 'dd-title'; h.textContent = t('title');
    var reward = pool ? fmt(pool.reward_per_claim) : '';
    var p = el('p'); p.textContent = t('sub', reward);
    box.appendChild(h); box.appendChild(p);
    if (pool && pool.pool_remaining != null) {
      var left = el('div', 'dd-left'); left.textContent = t('left', fmt(pool.pool_remaining));
      box.appendChild(left);
    }
    var btn = el('button', 'dd-btn'); btn.type = 'button';
    btn.textContent = address ? t('catch', reward) : t('connect');
    btn.addEventListener('click', claim);
    box.appendChild(btn);
    baseCard(box);
    focusCard(btn);
  }

  function renderState(kind) {
    var box = el('div');
    var h = el('h3'); h.id = 'dd-title';
    var p = el('p');
    var busyKind = (kind === 'signing' || kind === 'claim');
    if (kind === 'signing') { h.textContent = t('title'); p.textContent = t('signing'); }
    else if (kind === 'claim') { h.textContent = t('title'); p.textContent = t('claim'); }
    else if (kind === 'already') { h.textContent = t('okTitle'); p.textContent = t('already'); }
    else if (kind === 'locked') { h.textContent = t('title'); p.className = 'dd-err'; p.textContent = t('locked'); }
    else { h.textContent = t('title'); p.className = 'dd-err'; p.textContent = t('err'); }
    box.appendChild(h); box.appendChild(p);

    if (busyKind) {
      var b = el('button', 'dd-btn'); b.type = 'button'; b.disabled = true;
      b.appendChild(el('span', 'dd-spin'));
      box.appendChild(b);
    } else if (kind === 'err' || kind === 'locked') {
      var retry = el('button', 'dd-btn'); retry.type = 'button'; retry.textContent = t('retry');
      retry.addEventListener('click', claim);
      box.appendChild(retry);
    }
    baseCard(box);
    if (!busyKind) focusCard(card.querySelector('.dd-btn') || card.querySelector('.dd-card-x'));
  }

  function renderNoWallet() {
    var box = el('div');
    var h = el('h3'); h.id = 'dd-title'; h.textContent = t('title');
    var p = el('p'); p.textContent = t('noWallet');
    var a = el('a', 'dd-link'); a.href = 'https://www.kray.space'; a.target = '_blank'; a.rel = 'noopener';
    a.textContent = t('getWallet');
    box.appendChild(h); box.appendChild(p); box.appendChild(a);
    baseCard(box);
    focusCard(a);
  }

  function renderSuccess(d) {
    var box = el('div');
    var h = el('h3'); h.id = 'dd-title'; h.textContent = t('okTitle');
    var amt = (d.reward != null ? d.reward : (pool && pool.reward_per_claim));
    var tok = d.reward_token || (pool && pool.pool_token) || 'DOG';
    var p = el('p'); p.textContent = t('okSub', fmt(amt) + (tok && tok !== 'DOG' ? ' ' + tok : ''));
    box.appendChild(h); box.appendChild(p);
    if (d.tx_id) {
      var a = el('a', 'dd-link'); a.href = '/dogscan?q=' + encodeURIComponent(d.tx_id);
      a.target = '_blank'; a.rel = 'noopener'; a.textContent = t('viewTx');
      box.appendChild(a);
    }
    var note = el('div', 'dd-note'); note.textContent = t('done');
    box.appendChild(note);
    baseCard(box);
    focusCard(card.querySelector('.dd-link') || card.querySelector('.dd-card-x'));
    retireSprite();   /* the DOG is caught — retire it for good */
  }

  /* one catch per wallet: pull the sprite off the page so it never peeks again */
  function retireSprite() {
    stopAuto();
    if (wrap) wrap.classList.remove('is-in');
    setTimeout(function () { if (wrap && wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 600);
  }

  function focusCard(node) {
    if (node && typeof node.focus === 'function') { try { node.focus(); } catch (e) {} }
  }

  /* ---------- open/close/appear ---------- */
  function open() {
    stopAuto();
    if (wrap) wrap.classList.remove('is-in');   /* the DOG hops into the card */
    lastFocus = document.activeElement;
    document.body.appendChild(scrim);
    /* pool exhausted between load and click? show the empty state honestly */
    if (pool && pool.claims_remaining != null && Number(pool.claims_remaining) <= 0 && !claimedOnServer) {
      renderEmpty();
    } else if (claimedOnServer || caught()) {
      renderState('already');
    } else {
      renderIntro();
    }
    requestAnimationFrame(function () { scrim.classList.add('is-open'); });
  }
  function renderEmpty() {
    var box = el('div');
    var h = el('h3'); h.id = 'dd-title'; h.textContent = t('title');
    var p = el('p'); p.textContent = t('empty');
    box.appendChild(h); box.appendChild(p);
    baseCard(box);
    focusCard(card.querySelector('.dd-card-x'));
  }
  function close() {
    if (!scrim) return;
    scrim.classList.remove('is-open');
    var s = scrim;
    setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 260);
    focusCard(lastFocus);
    /* if they closed without catching and drops remain, let it peek again later */
    if (!caught() && shows < MAX_SHOWS) scheduleNext(REAPPEAR_GAP);
  }

  function appear() {
    if (caught() || !wrap) return;
    shows++;
    document.body.appendChild(wrap);   /* ensure on top of late-mounted UI */
    requestAnimationFrame(function () { wrap.classList.add('is-in'); });
    hideTimer = setTimeout(function () {
      if (wrap) wrap.classList.remove('is-in');
      if (shows < MAX_SHOWS) scheduleNext(REAPPEAR_GAP);
    }, VISIBLE_MS);
  }
  function scheduleNext(ms) {
    stopAuto();
    if (caught() || shows >= MAX_SHOWS) return;
    gapTimer = setTimeout(appear, ms);
  }
  function stopAuto() {
    if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
    if (gapTimer) { clearTimeout(gapTimer); gapTimer = null; }
  }
  function dismiss() {
    stopAuto();
    if (wrap) wrap.classList.remove('is-in');
    shows = MAX_SHOWS;   /* user waved it off — no more auto-appearances this session */
  }

  /* ---------- boot ---------- */
  function boot() {
    if (caught()) return;               /* already got their DOG on this browser */
    /* status first: only wake the DOG if the drop is live and has DOG left */
    fetch('/api/scroll').then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.active || !d.pool) return;
      if (d.pool.is_active === false) return;
      if (d.pool.claims_remaining != null && Number(d.pool.claims_remaining) <= 0) return;
      pool = d.pool;
      build();
      scheduleNext(FIRST_DELAY);
      /* let the page summon it on demand too (e.g. a "claim my DOG" button) */
      window.DogDrop = { summon: function () { stopAuto(); if (!caught()) appear(); }, open: open };
      /* one catch per wallet: if a silently-connected wallet already claimed,
         retire the DOG before it ever peeks — even on a fresh browser with no
         localStorage flag. silentAddr() only answers for already-approved
         origins (no popup), so a locked/unknown wallet still gets a chance. */
      silentAddr().then(function (a) {
        if (!a) return;
        address = a;   /* pre-warm so the claim button reads "Catch 50 DOG" */
        return fetch('/api/scroll?address=' + encodeURIComponent(a))
          .then(function (r) { return r.json(); })
          .then(function (c) {
            if (c && c.claimed) { claimedOnServer = true; markCaught(); retireSprite(); }
          });
      }).catch(function () { /* silent — worst case they see "already caught" on click */ });
    }).catch(function () { /* silent — the drop simply doesn't show */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
