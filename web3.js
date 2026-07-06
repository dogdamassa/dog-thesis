/* DOG ARMY. Web3 HQ (kray.space Origin Layer).
   Read-only by default: connects window.krayWallet, reads $DOG / Runestone /
   DOG•SOCIAL•CLUB straight from the chain (via our own /api proxies, because
   KRAY's API only answers same-origin browsers) and derives the visitor's
   rank. Signing is opt-in: the oath is a free Schnorr signature; mission
   claims and tips always go through the wallet's own confirmation UX.
   External file on purpose: script-src 'self' (CSP), same as wallet.js. */
(function () {
  var THUMB = '/api/thumb?id=';

  /* ---------- i18n for JS-generated strings ---------- */
  var T = {
    en: {
      stNoWallet: 'KRAY Wallet not found in this browser. Install it and reload — it takes a minute.',
      stBusy: 'Waiting for KRAY Wallet… check the extension popup.',
      stErr: 'The wallet did not respond or the connection was refused. Try again.',
      stLocked: 'Your KRAY Wallet is locked. Click the KRAY icon in your browser toolbar to unlock it, then try again.',
      stConnected: 'Connected: {addr} — reading the chain…',
      stDone: 'Connected: {addr} — chain read complete.',
      bChecking: 'reading the chain…',
      bNone: 'not found in this wallet',
      bErr: 'could not read the chain — reload to retry',
      bDog: '{amt} DOG in self-custody',
      bHolder: 'holder verified on chain',
      rkRecruit: 'Recruit', rkSoldier: 'Soldier', rkVeteran: 'Veteran', rkOfficer: 'Officer', rkGeneral: 'General',
      rkNoteRecruit: 'The wallet is yours — now put DOG in self-custody and rise, soldier.',
      rkNoteSoldier: 'You hold the line: $DOG in self-custody, exactly what the army preaches.',
      rkNoteVeteran: 'A Runestone veteran — you were in the trenches before DOG existed.',
      rkNoteOfficer: 'Dog Social Club on chain. The club recognizes its officers.',
      rkNoteGeneral: 'DOG + Runestone + Dog Social Club. Full metal. The army salutes you.',
      oathBusy: 'Signing… check your wallet.',
      oathErr: 'Signature refused or failed. Try again.',
      cardShareText: 'I hold the line. Rank: {rank} — verified on Bitcoin. Join the DOG ARMY: https://dogarmy.space/web3 $DOG',
      msConnect: 'Connect your wallet above to claim.',
      msClaimed: 'This wallet already claimed the reward. Mission accomplished. o7',
      msReady: 'Mission live. Claim releases the reward from escrow to your wallet.',
      msBusy: 'Claiming… confirm in your KrayWallet popup.',
      msDone: 'Reward paid by the escrow: {reward} {token}. TX {tx}',
      msErr: 'Claim failed: {err}',
      msExhausted: 'Reward pool exhausted. Mission accomplished, army. o7',
      tpConnect: 'Connect your wallet above to send supplies.',
      tpLow: 'Not enough KRAY on L2 for this amount (+1 gas). Your L2 balance: {bal} KRAY.',
      tpBusy: 'Waiting for your signature… the popup shows exactly what you send.',
      tpDone: 'Supplies received — thank you, soldier. TX {tx}',
      tpErr: 'Transfer failed: {err}'
    },
    pt: {
      stNoWallet: 'KRAY Wallet não encontrada neste navegador. Instale e recarregue — leva um minuto.',
      stBusy: 'Esperando a KRAY Wallet… confira o popup da extensão.',
      stErr: 'A carteira não respondeu ou a conexão foi recusada. Tente de novo.',
      stLocked: 'Sua KRAY Wallet está bloqueada. Clique no ícone da KRAY na barra do navegador para desbloquear e tente de novo.',
      stConnected: 'Conectado: {addr} — lendo a blockchain…',
      stDone: 'Conectado: {addr} — leitura da chain completa.',
      bChecking: 'lendo a blockchain…',
      bNone: 'não encontrado nesta carteira',
      bErr: 'não deu pra ler a chain — recarregue pra tentar de novo',
      bDog: '{amt} DOG em autocustódia',
      bHolder: 'holder verificado on-chain',
      rkRecruit: 'Recruta', rkSoldier: 'Soldado', rkVeteran: 'Veterano', rkOfficer: 'Oficial', rkGeneral: 'General',
      rkNoteRecruit: 'A carteira é sua — agora coloque DOG em autocustódia e suba de patente, soldado.',
      rkNoteSoldier: 'Você segura a linha: $DOG em autocustódia, exatamente o que o exército prega.',
      rkNoteVeteran: 'Um veterano da Runestone — você estava nas trincheiras antes da DOG existir.',
      rkNoteOfficer: 'Dog Social Club on-chain. O clube reconhece seus oficiais.',
      rkNoteGeneral: 'DOG + Runestone + Dog Social Club. Arsenal completo. O exército te saúda.',
      oathBusy: 'Assinando… confira sua carteira.',
      oathErr: 'Assinatura recusada ou falhou. Tente de novo.',
      cardShareText: 'Eu seguro a linha. Patente: {rank} — verificada no Bitcoin. Aliste-se na DOG ARMY: https://dogarmy.space/web3 $DOG',
      msConnect: 'Conecte sua carteira lá em cima para resgatar.',
      msClaimed: 'Esta carteira já resgatou a recompensa. Missão cumprida. o7',
      msReady: 'Missão ativa. O resgate libera a recompensa do escrow direto pra sua carteira.',
      msBusy: 'Resgatando… confirme no popup da KrayWallet.',
      msDone: 'Recompensa paga pelo escrow: {reward} {token}. TX {tx}',
      msErr: 'Resgate falhou: {err}',
      msExhausted: 'Pool de recompensas esgotado. Missão cumprida, exército. o7',
      tpConnect: 'Conecte sua carteira lá em cima para enviar suprimentos.',
      tpLow: 'KRAY insuficiente no L2 pra esse valor (+1 de gás). Seu saldo L2: {bal} KRAY.',
      tpBusy: 'Esperando sua assinatura… o popup mostra exatamente o que você envia.',
      tpDone: 'Suprimentos recebidos — obrigado, soldado. TX {tx}',
      tpErr: 'Transferência falhou: {err}'
    },
    es: {
      stNoWallet: 'KRAY Wallet no encontrada en este navegador. Instálala y recarga — toma un minuto.',
      stBusy: 'Esperando a KRAY Wallet… revisa el popup de la extensión.',
      stErr: 'La cartera no respondió o la conexión fue rechazada. Inténtalo de nuevo.',
      stLocked: 'Tu KRAY Wallet está bloqueada. Haz clic en el icono de KRAY en la barra del navegador para desbloquearla e inténtalo de nuevo.',
      stConnected: 'Conectado: {addr} — leyendo la blockchain…',
      stDone: 'Conectado: {addr} — lectura de la chain completa.',
      bChecking: 'leyendo la blockchain…',
      bNone: 'no encontrado en esta cartera',
      bErr: 'no se pudo leer la chain — recarga para reintentar',
      bDog: '{amt} DOG en autocustodia',
      bHolder: 'holder verificado on-chain',
      rkRecruit: 'Recluta', rkSoldier: 'Soldado', rkVeteran: 'Veterano', rkOfficer: 'Oficial', rkGeneral: 'General',
      rkNoteRecruit: 'La cartera es tuya — ahora pon DOG en autocustodia y sube de rango, soldado.',
      rkNoteSoldier: 'Sostienes la línea: $DOG en autocustodia, exactamente lo que predica el ejército.',
      rkNoteVeteran: 'Un veterano de la Runestone — estabas en las trincheras antes de que DOG existiera.',
      rkNoteOfficer: 'Dog Social Club on-chain. El club reconoce a sus oficiales.',
      rkNoteGeneral: 'DOG + Runestone + Dog Social Club. Arsenal completo. El ejército te saluda.',
      oathBusy: 'Firmando… revisa tu cartera.',
      oathErr: 'Firma rechazada o fallida. Inténtalo de nuevo.',
      cardShareText: 'Sostengo la línea. Rango: {rank} — verificado en Bitcoin. Únete al DOG ARMY: https://dogarmy.space/web3 $DOG',
      msConnect: 'Conecta tu cartera arriba para reclamar.',
      msClaimed: 'Esta cartera ya reclamó la recompensa. Misión cumplida. o7',
      msReady: 'Misión activa. El reclamo libera la recompensa del escrow directo a tu cartera.',
      msBusy: 'Reclamando… confirma en el popup de KrayWallet.',
      msDone: 'Recompensa pagada por el escrow: {reward} {token}. TX {tx}',
      msErr: 'Reclamo falló: {err}',
      msExhausted: 'Pool de recompensas agotado. Misión cumplida, ejército. o7',
      tpConnect: 'Conecta tu cartera arriba para enviar suministros.',
      tpLow: 'KRAY insuficiente en L2 para ese monto (+1 de gas). Tu saldo L2: {bal} KRAY.',
      tpBusy: 'Esperando tu firma… el popup muestra exactamente lo que envías.',
      tpDone: 'Suministros recibidos — gracias, soldado. TX {tx}',
      tpErr: 'Transferencia falló: {err}'
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
  function shortTx(x) { return x ? String(x).slice(0, 10) + '…' : ''; }
  function fmt(n) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }); }

  function findDogRune(runes) {
    if (!Array.isArray(runes)) return null;
    for (var i = 0; i < runes.length; i++) {
      var r = runes[i] || {};
      var name = r.spacedRune || r.spaced_rune || r.displayName || r.name || r.rune || r.ticker || '';
      if (String(name).replace(/[^A-Za-z]/g, '').toUpperCase() === 'DOGGOTOTHEMOON') return r;
    }
    return null;
  }
  function runeAmount(r) {
    if (!r) return null;
    if (r.rawAmount != null) {
      var raw = Number(r.rawAmount);
      return isFinite(raw) ? raw / Math.pow(10, Number(r.divisibility) || 0) : null;
    }
    if (r.amount && typeof r.amount === 'object') {
      var nested = Number(r.amount.amount);
      return isFinite(nested) ? nested / Math.pow(10, Number(r.amount.divisibility) || 0) : null;
    }
    var amt = Number(r.amount != null ? r.amount : r.balance);
    return isFinite(amt) ? amt : null;
  }

  /* ---------- state ---------- */
  var address = '';
  var pubkey = '';
  var dogAmount = null;     /* null = unknown, number = read */
  var badges = null;        /* {dsc, runestone} once read */
  var dogRead = null;       /* null | 'pending' | 'done' | 'error' */
  var badgesRead = null;    /* null | 'pending' | 'done' | 'error' */
  var rank = null;          /* {key, nameKey, noteKey} */
  var oathSig = '';
  var scrollState = null;   /* /api/scroll GET payload */
  var claimReceipt = '';    /* success message, survives re-renders */
  var tipInfo = null;       /* /api/tip GET payload */
  var tipAmount = 50;

  var RANKS = {
    general: { nameKey: 'rkGeneral', noteKey: 'rkNoteGeneral' },
    officer: { nameKey: 'rkOfficer', noteKey: 'rkNoteOfficer' },
    veteran: { nameKey: 'rkVeteran', noteKey: 'rkNoteVeteran' },
    soldier: { nameKey: 'rkSoldier', noteKey: 'rkNoteSoldier' },
    recruit: { nameKey: 'rkRecruit', noteKey: 'rkNoteRecruit' }
  };

  function computeRank() {
    var dog = (dogAmount || 0) > 0;
    var rs = !!(badges && badges.runestone);
    var dsc = !!(badges && badges.dsc);
    var key = (dog && rs && dsc) ? 'general' : dsc ? 'officer' : rs ? 'veteran' : dog ? 'soldier' : 'recruit';
    return { key: key, nameKey: RANKS[key].nameKey, noteKey: RANKS[key].noteKey };
  }

  /* ---------- rank UI ---------- */
  function setBadge(id, ok, text) {
    var box = $(id);
    var val = $(id + 'Val');
    if (!box || !val) return;
    /* JS owns this text from now on — stop the i18n switcher clobbering it */
    val.removeAttribute('data-i18n');
    box.classList.remove('is-ok', 'is-no');
    if (ok === true) box.classList.add('is-ok');
    if (ok === false) box.classList.add('is-no');
    val.textContent = text;
  }

  /* derive all three tiles from state — callable after language switches too */
  function renderBadges() {
    if (!address) return;
    if (dogRead === 'pending') setBadge('w3BadgeDog', null, t('bChecking'));
    else if (dogRead === 'error') setBadge('w3BadgeDog', null, t('bErr'));
    else if (dogRead === 'done') {
      var has = (dogAmount || 0) > 0;
      setBadge('w3BadgeDog', has, has ? t('bDog', { amt: fmt(dogAmount) }) : t('bNone'));
    }
    if (badgesRead === 'pending') {
      setBadge('w3BadgeRunestone', null, t('bChecking'));
      setBadge('w3BadgeDsc', null, t('bChecking'));
    } else if (badgesRead === 'error') {
      setBadge('w3BadgeRunestone', null, t('bErr'));
      setBadge('w3BadgeDsc', null, t('bErr'));
    } else if (badgesRead === 'done') {
      setBadge('w3BadgeRunestone', !!(badges && badges.runestone), badges && badges.runestone ? t('bHolder') : t('bNone'));
      setBadge('w3BadgeDsc', !!(badges && badges.dsc), badges && badges.dsc ? t('bHolder') : t('bNone'));
    }
  }

  function renderRank() {
    rank = computeRank();
    var box = $('w3RankBox');
    if (!box) return;
    box.hidden = false;
    $('w3RankName').textContent = t(rank.nameKey);
    $('w3RankNote').textContent = t(rank.noteKey);
  }

  /* ---------- rank card (canvas) ---------- */
  function loadImage(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = function () { resolve(null); };
      img.src = src;
    });
  }

  function drawCard() {
    var canvas = $('w3Canvas');
    if (!canvas || !rank) return Promise.resolve(null);
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;

    var loaders = [loadImage('/public/dog-army-mark.png')];
    loaders.push(badges && badges.dsc ? loadImage(THUMB + encodeURIComponent(badges.dsc.id)) : Promise.resolve(null));

    return Promise.all(loaders).then(function (imgs) {
      var logo = imgs[0], pfp = imgs[1];

      /* backdrop */
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, '#0a0c0f');
      g.addColorStop(1, '#141008');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#ff7300';
      ctx.lineWidth = 6;
      ctx.strokeRect(14, 14, W - 28, H - 28);
      ctx.strokeStyle = 'rgba(255,199,130,.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(26, 26, W - 52, H - 52);

      /* header */
      if (logo) ctx.drawImage(logo, 56, 52, 84, 84);
      ctx.fillStyle = '#fff8ec';
      ctx.font = '700 40px Geist, system-ui, sans-serif';
      ctx.fillText('DOG ARMY', 160, 96);
      ctx.fillStyle = '#ff7300';
      ctx.font = '700 22px Geist, system-ui, sans-serif';
      ctx.fillText('WEB3 HQ · RANK VERIFIED ON BITCOIN', 160, 126);

      /* rank */
      ctx.fillStyle = 'rgba(255,248,236,.55)';
      ctx.font = '600 26px Geist, system-ui, sans-serif';
      ctx.fillText(lang() === 'pt' ? 'PATENTE' : lang() === 'es' ? 'RANGO' : 'RANK', 60, 250);
      ctx.fillStyle = '#fff8ec';
      ctx.font = '800 110px Geist, system-ui, sans-serif';
      ctx.fillText(t(rank.nameKey).toUpperCase(), 54, 356);

      /* badges line */
      var parts = [];
      if ((dogAmount || 0) > 0) parts.push('✓ $DOG');
      if (badges && badges.runestone) parts.push('✓ RUNESTONE');
      if (badges && badges.dsc) parts.push('✓ DOG•SOCIAL•CLUB');
      if (!parts.length) parts.push('⏳ ' + (lang() === 'pt' ? 'SEM INSÍGNIAS AINDA' : lang() === 'es' ? 'SIN INSIGNIAS AÚN' : 'NO BADGES YET'));
      ctx.fillStyle = '#43c59e';
      ctx.font = '700 30px Geist, system-ui, sans-serif';
      ctx.fillText(parts.join('   '), 60, 430);

      /* identity + oath */
      ctx.fillStyle = 'rgba(255,248,236,.75)';
      ctx.font = '500 26px ui-monospace, Menlo, monospace';
      ctx.fillText(short(address), 60, 500);
      if (oathSig) {
        ctx.fillStyle = 'rgba(255,248,236,.4)';
        ctx.font = '500 18px ui-monospace, Menlo, monospace';
        ctx.fillText('oath sig ' + oathSig.slice(0, 32) + '… (BIP-340)', 60, 534);
      }
      ctx.fillStyle = '#ff7300';
      ctx.font = '700 26px Geist, system-ui, sans-serif';
      ctx.fillText('dogarmy.space/web3', 60, 580);

      /* DSC pfp */
      if (pfp) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.beginPath();
        ctx.arc(1010, 315, 120, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(pfp, 890, 195, 240, 240);
        ctx.restore();
        ctx.strokeStyle = '#ff7300';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(1010, 315, 122, 0, Math.PI * 2);
        ctx.stroke();
      }

      try { return canvas.toDataURL('image/png'); }
      catch (e) { return null; }
    });
  }

  function showCard(dataUrl) {
    if (!dataUrl) return;
    var img = $('w3CardImg');
    if (img) { img.src = dataUrl; img.hidden = false; }
    var dl = $('w3CardDownload');
    if (dl) {
      dl.hidden = false;
      dl.onclick = function () {
        var a = document.createElement('a');
        a.href = dataUrl;
        a.download = 'dog-army-rank-' + (rank ? rank.key : 'card') + '.png';
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
    }
    var share = $('w3CardShare');
    if (share) {
      share.hidden = false;
      share.href = 'https://twitter.com/intent/tweet?text=' +
        encodeURIComponent(t('cardShareText', { rank: t(rank.nameKey) }));
    }
  }

  /* ---------- connect + chain read ---------- */
  function setStatus(msg, kind) {
    var el = $('w3Status');
    if (!el) return;
    el.removeAttribute('data-i18n');
    el.textContent = msg;
    el.classList.remove('is-err', 'is-ok');
    if (kind) el.classList.add(kind);
  }

  function readChain() {
    var w = kray();
    if (!w) return;
    dogRead = 'pending';
    badgesRead = 'pending';
    renderBadges();

    var pDog = (typeof w.getFullWalletData === 'function' ? w.getFullWalletData() : Promise.resolve(null))
      .then(function (data) {
        dogAmount = data ? (runeAmount(findDogRune(data.runes)) || 0) : 0;
        dogRead = 'done';
        renderBadges();
      }).catch(function () { dogAmount = 0; dogRead = 'error'; renderBadges(); });

    var pBadges = fetch('/api/badges?address=' + encodeURIComponent(address))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.success) {
          badges = data.badges;
          badgesRead = 'done';
        } else {
          badges = { dsc: null, runestone: null };
          badgesRead = 'error';
        }
        renderBadges();
      }).catch(function () {
        badges = { dsc: null, runestone: null };
        badgesRead = 'error';
        renderBadges();
      });

    Promise.all([pDog, pBadges]).then(function () {
      setStatus(t('stDone', { addr: short(address) }), 'is-ok');
      renderRank();
      loadScroll();
      loadTip();
    });
  }

  function connect() {
    var w = kray();
    if (!w) {
      setStatus(t('stNoWallet'), 'is-err');
      var install = $('w3Install');
      if (install) install.hidden = false;
      return;
    }
    setStatus(t('stBusy'));
    w.requestAccounts().then(function (res) {
      if (res && res.success === false) {
        /* KRAY resolves {success:false, needsUserAction:true} when locked */
        setStatus(t(res.needsUserAction ? 'stLocked' : 'stErr'), 'is-err');
        return;
      }
      var a = (typeof res === 'string') ? res
        : Array.isArray(res) ? res[0]
        : (res && res.address) || (res && Array.isArray(res.accounts) && res.accounts[0]) || '';
      if (!a) { setStatus(t('stErr'), 'is-err'); return; }
      address = a;
      pubkey = normalizePubkey(res && res.publicKey);
      setStatus(t('stConnected', { addr: short(address) }), 'is-ok');
      var btn = $('w3Connect');
      if (btn) { btn.removeAttribute('data-i18n'); btn.textContent = short(address); }
      readChain();
    }).catch(function () { setStatus(t('stErr'), 'is-err'); });
  }

  /* proxies need the x-only form: 64 hex chars. A 66-char compressed key
     (02/03 prefix) is the same point — drop the prefix byte. */
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

  /* ---------- oath ---------- */
  function signOath() {
    var w = kray();
    if (!w || !address || !rank) return;
    var note = $('w3RankNote');
    var prev = note ? note.textContent : '';
    if (note) note.textContent = t('oathBusy');
    var msg = 'dogarmy:oath:' + address + ':' + Date.now();
    w.signMessage(msg).then(function (res) {
      var sig = res && res.signature;
      if (!sig) {
        /* locked wallet resolves {success:false} — that is NOT an oath */
        if (note) note.textContent = t(res && res.needsUserAction ? 'stLocked' : 'oathErr');
        return;
      }
      oathSig = sig;
      if (note) note.textContent = prev;
      return drawCard().then(showCard);
    }).catch(function () {
      if (note) note.textContent = t('oathErr');
    });
  }

  /* ---------- missions (Dev Scroll) ---------- */
  function renderScroll() {
    var arming = $('w3MsArming');
    var live = $('w3MsLive');
    if (!arming || !live) return;
    var on = !!(scrollState && scrollState.active && scrollState.pool && scrollState.pool.is_active);
    arming.hidden = on;
    live.hidden = !on;
    if (!on) return;
    var p = scrollState.pool;
    $('w3MsTitle').textContent = p.title || 'DOG ARMY';
    $('w3MsReward').textContent = fmt(p.reward_per_claim) + ' ' + p.pool_token;
    $('w3MsLeft').textContent = fmt(p.claims_remaining);
    $('w3MsPool').textContent = fmt(p.pool_remaining) + ' / ' + fmt(p.total_pool) + ' ' + p.pool_token;
    var bar = $('w3MsBar');
    if (bar && Number(p.total_pool) > 0) {
      bar.style.width = Math.max(2, Math.round(100 * Number(p.pool_remaining) / Number(p.total_pool))) + '%';
    }
    var btn = $('w3Claim');
    var status = $('w3MsStatus');
    if (status) status.removeAttribute('data-i18n');
    var exhausted = Number(p.claims_remaining) <= 0 || Number(p.pool_remaining) <= 0;
    if (bar && Number(p.pool_remaining) <= 0) bar.style.width = '0';
    if (claimReceipt) {
      /* the user's receipt beats every re-render; re-claim only in open mode */
      if (btn) btn.disabled = exhausted || p.claim_mode === 'single';
      if (status) { status.textContent = claimReceipt; status.classList.add('is-ok'); }
    } else if (exhausted) {
      if (btn) btn.disabled = true;
      if (status) status.textContent = t('msExhausted');
    } else if (!address) {
      if (btn) btn.disabled = true;
      if (status) status.textContent = t('msConnect');
    } else if (scrollState.claimed && p.claim_mode === 'single') {
      if (btn) btn.disabled = true;
      if (status) status.textContent = t('msClaimed');
    } else {
      if (btn) btn.disabled = false;
      if (status) status.textContent = t('msReady');
    }
  }

  function loadScroll() {
    var url = '/api/scroll' + (address ? '?address=' + encodeURIComponent(address) : '');
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      /* transient errors must not flip a live module back to "arming" */
      if (data) { scrollState = data; renderScroll(); }
    }).catch(function () {});
  }

  function claim() {
    var w = kray();
    var status = $('w3MsStatus');
    if (!w || !address) { if (status) status.textContent = t('msConnect'); return; }
    var btn = $('w3Claim');
    if (btn) btn.disabled = true;
    if (status) status.textContent = t('msBusy');
    var msg = 'scroll_claim:reward:' + address + ':' + Date.now();
    var sign = typeof w.signMessageWithConfirmation === 'function'
      ? w.signMessageWithConfirmation(msg) : w.signMessage(msg);
    Promise.all([sign, getPubkey()]).then(function (rs) {
      var sig = rs[0] && rs[0].signature;
      if (!sig || !rs[1]) throw new Error('no-signature');
      return fetch('/api/scroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: address,
          user_pubkey: rs[1],
          user_signature: sig,
          user_message: msg
        })
      });
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (data && data.success) {
        claimReceipt = t('msDone', {
          reward: fmt(data.reward),
          token: data.reward_token || (scrollState && scrollState.pool && scrollState.pool.pool_token) || 'KRAY',
          tx: shortTx(data.tx_id)
        });
        if (status) {
          status.textContent = claimReceipt;
          status.classList.add('is-ok');
        }
        loadScroll();
      } else {
        if (status) status.textContent = t('msErr', { err: (data && data.error) || '—' });
        if (btn) btn.disabled = false;
      }
    }).catch(function () {
      if (status) status.textContent = t('msErr', { err: 'wallet' });
      if (btn) btn.disabled = false;
    });
  }

  /* ---------- tips ---------- */
  function renderTip() {
    var arming = $('w3TipArming');
    var live = $('w3TipLive');
    if (!arming || !live) return;
    var on = !!(tipInfo && tipInfo.active);
    arming.hidden = on;
    live.hidden = !on;
    if (!on) return;
    var status = $('w3TipStatus');
    var btn = $('w3Tip');
    if (!address) {
      if (btn) btn.disabled = true;
      if (status) status.textContent = t('tpConnect');
    } else {
      if (btn) btn.disabled = false;
      if (status && !status.classList.contains('is-ok') && !status.classList.contains('is-err')) {
        status.textContent = '';
      }
    }
  }

  function loadTip() {
    var url = '/api/tip' + (address ? '?address=' + encodeURIComponent(address) : '');
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      /* transient errors must not flip a live module back to "arming" */
      if (data) { tipInfo = data; renderTip(); }
    }).catch(function () {});
  }

  function tip() {
    var w = kray();
    var status = $('w3TipStatus');
    if (!w || !address) { if (status) status.textContent = t('tpConnect'); return; }
    var btn = $('w3Tip');
    if (btn) btn.disabled = true;
    if (status) { status.classList.remove('is-ok', 'is-err'); status.textContent = t('tpBusy'); }
    /* fresh nonce right before signing */
    fetch('/api/tip?address=' + encodeURIComponent(address))
      .then(function (r) { return r.json(); })
      .then(function (info) {
        if (!info || !info.active || !info.to || info.nonce == null) throw new Error('prepare');
        /* don't invite a signature that is guaranteed to bounce: amount + 1 gas */
        var bal = Number(info.balance_kray);
        if (isFinite(bal) && bal < tipAmount + 1) {
          var e = new Error('low-balance');
          e.lowBalance = bal;
          throw e;
        }
        var msg = [address, info.to, String(tipAmount), String(info.nonce), 'transfer'].join(':');
        /* L2 transfer message → KrayWallet ALWAYS opens the confirmation popup */
        return Promise.all([w.signMessage(msg), getPubkey(), Promise.resolve(info)]);
      })
      .then(function (rs) {
        var sig = rs[0] && rs[0].signature;
        if (!sig || !rs[1]) throw new Error('no-signature');
        return fetch('/api/tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from_address: address,
            amount: tipAmount,
            nonce: rs[2].nonce,
            signature: sig,
            pubkey: rs[1]
          })
        });
      })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success) {
          if (status) { status.textContent = t('tpDone', { tx: shortTx(data.tx_hash) }); status.classList.add('is-ok'); }
        } else {
          if (status) { status.textContent = t('tpErr', { err: (data && data.error) || '—' }); status.classList.add('is-err'); }
        }
        if (btn) btn.disabled = false;
      })
      .catch(function (e) {
        if (status) {
          status.textContent = (e && e.message === 'low-balance')
            ? t('tpLow', { bal: fmt(e.lowBalance) })
            : t('tpErr', { err: 'wallet' });
          status.classList.add('is-err');
        }
        if (btn) btn.disabled = false;
      });
  }

  /* ---------- boot ---------- */
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  ready(function () {
    var connectBtn = $('w3Connect');
    if (connectBtn) connectBtn.addEventListener('click', function () { if (!address) connect(); });
    var oathBtn = $('w3Oath');
    if (oathBtn) oathBtn.addEventListener('click', signOath);
    var claimBtn = $('w3Claim');
    if (claimBtn) claimBtn.addEventListener('click', claim);
    var tipBtn = $('w3Tip');
    if (tipBtn) tipBtn.addEventListener('click', tip);

    document.querySelectorAll('.w3-amt').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.w3-amt').forEach(function (x) { x.classList.remove('is-sel'); });
        b.classList.add('is-sel');
        tipAmount = parseInt(b.getAttribute('data-amt'), 10) || 50;
      });
    });

    /* re-render dynamic strings when the visitor switches language
       (i18n apply() rewrites every [data-i18n] element, so everything the
       JS owns must be restored from state right after) */
    var sw = $('langsw');
    if (sw) sw.addEventListener('click', function () {
      setTimeout(function () {
        if (address) {
          setStatus(t('stDone', { addr: short(address) }), 'is-ok');
          renderBadges();
        }
        if (rank) renderRank();
        renderScroll();
        renderTip();
      }, 0);
    });

    loadScroll();
    loadTip();

    /* show install CTA early when there is clearly no wallet */
    var tries = 0;
    var timer = setInterval(function () {
      tries++;
      if (kray()) { clearInterval(timer); }
      else if (tries > 12) {
        clearInterval(timer);
        var install = $('w3Install');
        if (install) install.hidden = false;
      }
    }, 250);
  });
})();
