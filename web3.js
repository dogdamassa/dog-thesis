/* DOG ARMY. Web3 HQ (kray.space Origin Layer).
   Read-only by default: connects window.krayWallet, reads $DOG / Runestone /
   DOG•SOCIAL•CLUB straight from the chain (via our own /api proxies, because
   KRAY's API only answers same-origin browsers) and derives the visitor's
   rank. Signing is opt-in: the oath is a free Schnorr signature; posting to
   the DAO room signs a holder handshake through the wallet's confirmation UX.
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
      pfCopied: '✓ copied',
      daoOnline: '{n} online',
      daoYou: 'You',
      daoEmptyChat: 'No messages yet — the room is quiet. Be the first bark.',
      daoEmptyProps: 'No active proposals. Create one in the room on KRAY.',
      daoErr: 'Could not read the DAO room — it retries automatically.',
      daoPh: 'Say something to the DOG room…',
      daoSending: 'Signing… confirm in your wallet',
      daoPosting: 'Posting to the room…',
      daoPosted: 'Posted ✓',
      daoPostErr: 'Could not post ({err})',
      daoNeedDog: 'You need $DOG in this wallet to post.',
      oathBusy: 'Signing… check your wallet.',
      oathErr: 'Signature refused or failed. Try again.',
      cardShareText: 'I hold the line. Rank: {rank} — verified on Bitcoin. Join the DOG ARMY: https://dogarmy.space/web3 $DOG',
      fdLoading: 'Reading the feed from the Origin Layer…',
      fdErr: 'Could not read the feed — it retries on its own.',
      fdEmpty: 'The feed is quiet right now. Check back soon.',
      fdFollowing: 'From the inscriptions and L2 NFTs you follow on KRAY.',
      fdTrending: 'Trending across the Origin Layer right now.',
      fdEmptyFollowing: "You don't follow anyone on KRAY yet — here's what the whole Army is posting.",
      fdDiscover: 'Find soldiers to follow ↗',
      fdFollowers: '{n} followers',
      fdL2: 'L2',
      fdInscription: 'Inscription'
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
      pfCopied: '✓ copiado',
      daoOnline: '{n} online',
      daoYou: 'Você',
      daoEmptyChat: 'Nenhuma mensagem ainda — a sala está quieta. Dê o primeiro latido.',
      daoEmptyProps: 'Nenhuma proposta ativa. Crie uma na sala, na KRAY.',
      daoErr: 'Não deu pra ler a sala do DAO — tenta de novo sozinho.',
      daoPh: 'Fale algo pra sala da DOG…',
      daoSending: 'Assinando… confirme na carteira',
      daoPosting: 'Postando na sala…',
      daoPosted: 'Publicado ✓',
      daoPostErr: 'Não deu pra postar ({err})',
      daoNeedDog: 'Você precisa de $DOG nesta carteira pra postar.',
      oathBusy: 'Assinando… confira sua carteira.',
      oathErr: 'Assinatura recusada ou falhou. Tente de novo.',
      cardShareText: 'Eu seguro a linha. Patente: {rank} — verificada no Bitcoin. Aliste-se na DOG ARMY: https://dogarmy.space/web3 $DOG',
      fdLoading: 'Lendo o feed no Origin Layer…',
      fdErr: 'Não deu pra ler o feed — ele tenta de novo sozinho.',
      fdEmpty: 'O feed está quieto agora. Volte daqui a pouco.',
      fdFollowing: 'Das inscrições e NFTs L2 que você segue na KRAY.',
      fdTrending: 'Em alta no Origin Layer agora.',
      fdEmptyFollowing: 'Você ainda não segue ninguém na KRAY — veja o que o exército todo está postando.',
      fdDiscover: 'Ache soldados pra seguir ↗',
      fdFollowers: '{n} seguidores',
      fdL2: 'L2',
      fdInscription: 'Inscrição'
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
      pfCopied: '✓ copiado',
      daoOnline: '{n} online',
      daoYou: 'Tú',
      daoEmptyChat: 'Sin mensajes aún — la sala está tranquila. Da el primer ladrido.',
      daoEmptyProps: 'Sin propuestas activas. Crea una en la sala, en KRAY.',
      daoErr: 'No se pudo leer la sala del DAO — reintenta solo.',
      daoPh: 'Dile algo a la sala de DOG…',
      daoSending: 'Firmando… confirma en la cartera',
      daoPosting: 'Publicando en la sala…',
      daoPosted: 'Publicado ✓',
      daoPostErr: 'No se pudo postar ({err})',
      daoNeedDog: 'Necesitas $DOG en esta cartera para postar.',
      oathBusy: 'Firmando… revisa tu cartera.',
      oathErr: 'Firma rechazada o fallida. Inténtalo de nuevo.',
      cardShareText: 'Sostengo la línea. Rango: {rank} — verificado en Bitcoin. Únete al DOG ARMY: https://dogarmy.space/web3 $DOG',
      fdLoading: 'Leyendo el feed en el Origin Layer…',
      fdErr: 'No se pudo leer el feed — reintenta solo.',
      fdEmpty: 'El feed está tranquilo ahora. Vuelve en un rato.',
      fdFollowing: 'De las inscripciones y NFTs L2 que sigues en KRAY.',
      fdTrending: 'En tendencia en el Origin Layer ahora.',
      fdEmptyFollowing: 'Aún no sigues a nadie en KRAY — mira lo que está posteando todo el ejército.',
      fdDiscover: 'Encuentra soldados para seguir ↗',
      fdFollowers: '{n} seguidores',
      fdL2: 'L2',
      fdInscription: 'Inscripción'
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
  var walletData = null;    /* getFullWalletData(): balance sats + inscriptions + runes */
  var chainSats = null;     /* on-chain balance via /api/scan — fallback when the extension omits it */

  /* the extension has shipped balance as a number, a numeric string and an
     object — try every shape before giving up */
  function extractSats(d) {
    if (!d) return null;
    var cands = [d.balance, d.btcBalance, d.sats];
    if (d.balance && typeof d.balance === 'object') {
      cands = [d.balance.total, d.balance.confirmed].concat(cands);
    }
    for (var i = 0; i < cands.length; i++) {
      var c = cands[i];
      if (c == null || typeof c === 'object') continue;
      var n = Number(c);
      if (isFinite(n)) return n;
    }
    return null;
  }
  var krayBal = null;       /* L2 KRAY balance (rides on /api/badges) */
  var btcUsd = null;        /* BTC price for the sats→USD line */
  var dogAmount = null;     /* null = unknown, number = read */
  var badges = null;        /* {dsc, runestone} once read */
  var dogRead = null;       /* null | 'pending' | 'done' | 'error' */
  var badgesRead = null;    /* null | 'pending' | 'done' | 'error' */
  var rank = null;          /* {key, nameKey, noteKey} */
  var oathSig = '';
  var feedGeneral = null;   /* trending posts — fallback when the wallet follows nobody */
  var feedPersonal = null;  /* posts from the inscriptions the wallet follows on KRAY */
  var feedStats = null;     /* {following, likesGiven, krayEarned, reposts, comments} */
  var feedLoading = false;
  var feedTried = false;    /* distinguishes "never fetched" from a genuinely empty feed */

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
    /* gold rank chip in the profile header (KraySpace's "#8 STAR" spot) */
    var chip = $('w3ProfRank');
    var chipName = $('w3ProfRankName');
    if (chip && chipName) {
      chip.hidden = false;
      chipName.textContent = t(rank.nameKey).toUpperCase();
    }
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

  /* ---------- KraySpace-style profile (read-only mirror of the wallet) ---------- */
  var INS_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160">' +
    '<rect width="100%" height="100%" fill="#15151b"/>' +
    '<text x="50%" y="55%" fill="#4d4d5a" font-size="30" text-anchor="middle" font-family="monospace">◉</text></svg>');
  var INS_SHOWN = 24;
  /* CSP img-src allows www.kray.space, so thumbnails hotlink directly */
  var KRAY_THUMB = 'https://www.kray.space/api/rune-thumbnail/';
  var gridsFor = null; /* rebuild the asset grids only when wallet data changes */

  function insId(x) { return String((x && (x.id || x.inscription_id || x.inscriptionId)) || ''); }
  function insNumber(x) {
    var n = x && (x.number != null ? x.number
      : x.inscription_number != null ? x.inscription_number
      : x.num != null ? x.num : null);
    return (n != null && isFinite(Number(n))) ? Number(n) : null;
  }
  function runeName(r) {
    return String((r && (r.spacedRune || r.spaced_rune || r.displayName || r.name || r.rune || r.ticker)) || '');
  }

  function fetchBtcUsd() {
    if (btcUsd) return;
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var p = j && j.bitcoin && Number(j.bitcoin.usd);
        if (isFinite(p) && p > 0) { btcUsd = p; renderProfile(); }
      }).catch(function () {});
  }

  function renderInsGrid(list) {
    var grid = $('w3InsGrid');
    if (!grid) return;
    grid.textContent = '';
    list.slice(0, INS_SHOWN).forEach(function (x) {
      var id = insId(x);
      if (!id) return;
      var a = document.createElement('a');
      a.className = 'w3-ins';
      a.href = 'https://www.kray.space/inscription-profile?id=' + encodeURIComponent(id);
      a.target = '_blank';
      a.rel = 'noopener';
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.alt = '';
      img.src = KRAY_THUMB + encodeURIComponent(id);
      img.onerror = function () { img.onerror = null; img.src = INS_FALLBACK; };
      var num = insNumber(x);
      var b = document.createElement('b');
      b.textContent = num != null ? '#' + num.toLocaleString('en-US') : id.slice(0, 10) + '…';
      var s = document.createElement('span');
      s.textContent = id.slice(0, 12) + '…';
      a.appendChild(img);
      a.appendChild(b);
      a.appendChild(s);
      grid.appendChild(a);
    });
    if (list.length > INS_SHOWN) {
      var more = document.createElement('div');
      more.className = 'w3-ins w3-ins-more';
      more.textContent = '+' + (list.length - INS_SHOWN);
      grid.appendChild(more);
    }
  }

  function runeIconSrc(lettersOnly) {
    if (lettersOnly === 'DOGGOTOTHEMOON') return '/public/dog-logo.png';
    if (lettersOnly === 'KRAYSPACE') return '/public/kray-space-icon.png';
    return '';
  }

  function renderRunesGrid(list) {
    var grid = $('w3RunesGrid');
    if (!grid) return;
    grid.textContent = '';
    list.forEach(function (r) {
      var name = runeName(r);
      if (!name) return;
      var letters = name.replace(/[^A-Za-z]/g, '').toUpperCase();
      var a = document.createElement('a');
      a.className = 'w3-rune';
      a.href = '/dogscan?q=' + encodeURIComponent(letters || name);
      var iconSrc = runeIconSrc(letters);
      if (iconSrc) {
        var img = document.createElement('img');
        img.className = 'w3-rune-ic';
        img.alt = '';
        img.loading = 'lazy';
        img.src = iconSrc;
        a.appendChild(img);
      } else {
        var mono = document.createElement('span');
        mono.className = 'w3-rune-ic w3-rune-mono';
        mono.textContent = letters.charAt(0) || '◆';
        a.appendChild(mono);
      }
      var body = document.createElement('span');
      body.className = 'w3-rune-body';
      var b = document.createElement('b');
      b.textContent = name;
      var amt = runeAmount(r);
      var i = document.createElement('i');
      i.textContent = (amt != null ? fmt(amt) : '—') + (r && r.symbol ? ' ' + r.symbol : '');
      body.appendChild(b);
      body.appendChild(i);
      a.appendChild(body);
      grid.appendChild(a);
    });
  }

  function renderProfile() {
    if (!address) return;
    var empty = $('w3ProfEmpty');
    var box = $('w3Profile');
    if (empty) empty.hidden = true;
    if (box) box.hidden = false;
    var addrEl = $('w3ProfAddr');
    if (addrEl) addrEl.textContent = address.slice(0, 12) + '…' + address.slice(-8);
    var d = walletData || {};
    var sats = extractSats(walletData);
    if (sats == null) sats = chainSats; /* extension didn't say — the chain does */
    var stSats = $('w3StSats');
    if (stSats) stSats.textContent = sats != null ? fmt(sats) : '…';
    var stUsd = $('w3StUsd');
    if (stUsd) {
      stUsd.textContent = (sats != null && btcUsd)
        ? '$' + (sats / 1e8 * btcUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '';
    }
    var ins = Array.isArray(d.inscriptions) ? d.inscriptions : [];
    var rn = Array.isArray(d.runes) ? d.runes : [];
    var stIns = $('w3StIns');
    if (stIns) stIns.textContent = walletData ? String(ins.length) : '…';
    var stRunes = $('w3StRunes');
    if (stRunes) stRunes.textContent = walletData ? String(rn.length) : '…';
    var stKray = $('w3StKray');
    if (stKray) stKray.textContent = (krayBal != null && isFinite(Number(krayBal))) ? fmt(Number(krayBal)) : '—';
    var insCount = $('w3InsCount');
    if (insCount) insCount.textContent = String(ins.length);
    var rnCount = $('w3RunesCount');
    if (rnCount) rnCount.textContent = String(rn.length);
    if (badges && badges.dsc) {
      var pfp = $('w3ProfPfp');
      if (pfp) pfp.src = THUMB + encodeURIComponent(badges.dsc.id);
    }
    if (gridsFor !== walletData) {
      gridsFor = walletData;
      renderInsGrid(ins);
      renderRunesGrid(rn);
    }
  }

  /* ---------- DAO Room (read-only mirror of kray.space/dao-room) ---------- */
  var daoData = null;
  var daoTried = false;   /* distinguishes "never fetched" from "fetch failed" */
  var daoChatSig = '';    /* rebuild the chat DOM only when its content changes */
  var daoTimer = 0;
  var daoLoading = false;

  function daoWeightPct(amt) {
    /* DOG supply = 100B; a voice's weight in the room = % of supply held */
    var pct = (Number(amt) || 0) / 1e9;
    if (!pct) return '0%';
    if (pct < 0.000001) return '<0.000001%';
    return pct.toLocaleString('en-US', { maximumFractionDigits: 6 }) + '%';
  }
  function daoTime(ts) {
    var d = ts ? new Date(ts) : null;
    if (!d || isNaN(d.getTime())) return '';
    /* the room is quiet for weeks at a time — a bare clock time would pin
       months-old messages to "today", so older ones show the date instead */
    return (Date.now() - d.getTime() < 20 * 3600 * 1000)
      ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function daoInitials(msg) {
    var el = document.createElement('span');
    el.className = 'w3-dao-ava w3-dao-ava-txt';
    var a = String((msg && msg.sender) || '');
    el.textContent = (a.slice(4, 6) || '??').toUpperCase();
    return el;
  }
  /* sender address -> chosen Ordinal avatar (inscription id) | null (none yet).
     Resolved lazily from /api/avatar; the initials chip shows until it lands. */
  var daoAvatarCache = {};
  function daoImg(src, msg) {
    var el = document.createElement('img');
    el.className = 'w3-dao-ava';
    el.alt = '';
    el.loading = 'lazy';
    el.src = src;
    el.onerror = function () {
      el.onerror = null;
      if (el.parentNode) el.parentNode.replaceChild(daoInitials(msg), el);
    };
    return el;
  }
  function daoAvatar(msg) {
    /* 1) the poster's own Ordinal pfp (resolved by address) */
    var id = daoAvatarCache[msg && msg.sender];
    if (typeof id === 'string' && id) return daoImg(THUMB + encodeURIComponent(id), msg);
    /* 2) an avatar the DAO message already carries (L2 NFT posts) */
    var thumb = msg && msg.nftThumbnail;
    if (typeof thumb === 'string' && /^https:\/\//.test(thumb)) {
      /* kray.space is allowed by img-src; anything else rides the proxy */
      return daoImg(thumb.indexOf('https://www.kray.space/') === 0
        ? thumb : '/api/thumb?u=' + encodeURIComponent(thumb), msg);
    }
    /* 3) fallback: initials chip */
    return daoInitials(msg);
  }
  function daoResolveAvatars(msgs) {
    var fresh = [];
    msgs.forEach(function (m) {
      var a = m && m.sender;
      if (a && !(a in daoAvatarCache)) { daoAvatarCache[a] = null; fresh.push(a); }
    });
    if (!fresh.length) return;
    Promise.all(fresh.map(function (a) {
      return fetch('/api/avatar?address=' + encodeURIComponent(a))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.id) { daoAvatarCache[a] = d.id; return true; } return false; })
        ['catch'](function () { return false; });
    })).then(function (hits) {
      /* repaint only if at least one real pfp landed (avoids a render loop) */
      if (hits.indexOf(true) !== -1) { daoChatSig = ''; renderDao(); }
    });
  }

  function renderDao() {
    var chatEl = $('w3DaoChat');
    var propsEl = $('w3DaoProps');
    var onlineEl = $('w3DaoOnline');
    if (!chatEl || !propsEl) return;
    if (!daoData) {
      /* never fetched → leave the neutral placeholders alone; only a real
         failed attempt may paint the error state */
      if (!daoTried) return;
      daoChatSig = '';
      [chatEl, propsEl].forEach(function (el) {
        el.textContent = '';
        var e = document.createElement('div');
        e.className = 'w3-dao-empty';
        e.textContent = t('daoErr');
        el.appendChild(e);
      });
      return;
    }
    var mem = daoData.members;
    if (onlineEl) {
      onlineEl.textContent = (mem && mem.onlineCount != null) ? t('daoOnline', { n: mem.onlineCount }) : '—';
    }
    /* the visitor's own weight chip (mirrors the room's sidebar card) */
    var you = $('w3DaoYou');
    if (you) {
      if ((dogAmount || 0) > 0) {
        you.hidden = false;
        you.textContent = '';
        var yb = document.createElement('b');
        yb.textContent = t('daoYou');
        var y1 = document.createElement('span');
        y1.textContent = fmt(dogAmount) + ' DOG';
        var y2 = document.createElement('span');
        y2.textContent = daoWeightPct(dogAmount);
        var y3 = document.createElement('span');
        y3.className = 'w3-dao-role';
        y3.textContent = 'HOLDER';
        you.appendChild(yb); you.appendChild(y1); you.appendChild(y2); you.appendChild(y3);
      } else {
        you.hidden = true;
      }
    }
    /* composer visibility: only a connected DOG holder can post to the room */
    var canPost = (dogAmount || 0) > 0 && !!address;
    var composeEl = $('w3DaoCompose'), gateEl = $('w3DaoGate');
    if (composeEl) composeEl.hidden = !canPost;
    if (gateEl) gateEl.hidden = canPost;
    /* chat — user-generated content, textContent only, never innerHTML.
       msgs === null means this part failed upstream (≠ genuinely empty). */
    var msgs = daoData.chat ? (daoData.chat.messages || []) : null;
    if (msgs && msgs.length) daoResolveAvatars(msgs);
    var sig = lang() + ':' + address + ':' + (msgs === null ? 'err'
      : msgs.length + ':' + (msgs.length
        ? String(msgs[msgs.length - 1].id || msgs[msgs.length - 1].timestamp || '') : ''));
    if (sig !== daoChatSig) {
      /* rebuilding wipes the scroll position — a reader scrolled up must not
         be yanked to the bottom by the 30s poll */
      var firstPaint = !daoChatSig;
      var nearBottom = firstPaint ||
        (chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight) < 48;
      var prevTop = chatEl.scrollTop;
      daoChatSig = sig;
      chatEl.textContent = '';
      if (msgs === null || !msgs.length) {
        var e1 = document.createElement('div');
        e1.className = 'w3-dao-empty';
        e1.textContent = t(msgs === null ? 'daoErr' : 'daoEmptyChat');
        chatEl.appendChild(e1);
      } else {
        msgs.forEach(function (m) {
          var row = document.createElement('div');
          row.className = 'w3-dao-msg';
          row.appendChild(daoAvatar(m));
          var body = document.createElement('div');
          body.className = 'w3-dao-body';
          var head = document.createElement('div');
          head.className = 'w3-dao-meta';
          var who = document.createElement('b');
          var mine = address && m.sender === address;
          who.textContent = mine ? t('daoYou') : (m.senderShort || short(m.sender));
          if (mine) who.classList.add('is-you');
          head.appendChild(who);
          if (m.weightRank === 1) {
            var rk = document.createElement('i');
            rk.className = 'w3-dao-rank1';
            rk.textContent = '#1';
            head.appendChild(rk);
          }
          if (m.weightFormatted) {
            var wt = document.createElement('i');
            wt.className = 'w3-dao-wt';
            wt.textContent = m.weightFormatted;
            head.appendChild(wt);
          }
          var tm = document.createElement('time');
          tm.textContent = daoTime(m.timestamp);
          head.appendChild(tm);
          var txt = document.createElement('p');
          txt.textContent = String(m.content || '');
          body.appendChild(head);
          body.appendChild(txt);
          row.appendChild(body);
          chatEl.appendChild(row);
        });
        chatEl.scrollTop = nearBottom ? chatEl.scrollHeight : prevTop;
      }
    }
    /* proposals — null means the part failed upstream */
    var props = daoData.proposals ? (daoData.proposals.proposals || []) : null;
    propsEl.textContent = '';
    if (props === null || !props.length) {
      var e2 = document.createElement('div');
      e2.className = 'w3-dao-empty';
      e2.textContent = t(props === null ? 'daoErr' : 'daoEmptyProps');
      propsEl.appendChild(e2);
    } else {
      props.slice(0, 8).forEach(function (p) {
        var card = document.createElement('div');
        card.className = 'w3-dao-prop';
        var h = document.createElement('b');
        h.textContent = String(p.title || p.name || 'Proposal');
        card.appendChild(h);
        if (p.status) {
          var st = document.createElement('i');
          st.className = 'w3-dao-st';
          st.textContent = String(p.status);
          card.appendChild(st);
        }
        if (p.description) {
          var pd = document.createElement('p');
          pd.textContent = String(p.description).slice(0, 140);
          card.appendChild(pd);
        }
        propsEl.appendChild(card);
      });
    }
  }

  /* ---- native posting to the DOG DAO Room (holder-gated, wallet-signed) ----
     Handshake once per session: the wallet signs `DAO:DOGGOTOTHEMOON:<ts>`
     (KRAY's own room format) → /api/dao verify → we cache the room's weight.
     Then each message is a plain {content, weight} POST; the address is
     already proven a holder by the verify. */
  var daoVerified = false, daoWeight = null, daoSending = false;
  function daoSetStatus(msg, kind) {
    var s = $('w3DaoStatus');
    if (!s) return;
    s.textContent = msg || '';
    s.classList.remove('is-err', 'is-ok');
    if (kind) s.classList.add(kind);
  }
  function daoVerify() {
    var w = kray();
    if (!w || !address) return Promise.reject(new Error('wallet'));
    if (daoVerified) return Promise.resolve(daoWeight);
    var ts = Date.now();
    var msg = 'DAO:DOGGOTOTHEMOON:' + ts;
    var sign = typeof w.signMessageWithConfirmation === 'function'
      ? w.signMessageWithConfirmation(msg) : w.signMessage(msg);
    return Promise.all([sign, getPubkey()]).then(function (rs) {
      var sig = rs[0] && rs[0].signature;
      if (!sig || !rs[1]) throw new Error('signature');
      return fetch('/api/dao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ what: 'verify', address: address, pubkey: rs[1], signature: sig, timestamp: ts })
      });
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.success) throw new Error((d && d.error) || 'verify');
      daoVerified = true;
      daoWeight = (d.weight && d.weight.percent != null) ? Number(d.weight.percent) : null;
      return daoWeight;
    });
  }
  function daoSend() {
    if (daoSending) return;
    var inp = $('w3DaoInput');
    var text = inp ? String(inp.value || '').trim() : '';
    if (!text) return;
    if ((dogAmount || 0) <= 0 || !address) { daoSetStatus(t('daoNeedDog'), 'is-err'); return; }
    daoSending = true;
    var btn = $('w3DaoSend');
    if (btn) btn.disabled = true;
    daoSetStatus(t(daoVerified ? 'daoPosting' : 'daoSending'));
    daoVerify().then(function (weight) {
      daoSetStatus(t('daoPosting'));
      return fetch('/api/dao', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          what: 'message', address: address, content: text,
          weight: (weight != null ? weight : (dogAmount || 0) / 1e11)
        })
      });
    }).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.success) throw new Error((d && d.error) || 'post');
      if (inp) inp.value = '';
      daoSetStatus(t('daoPosted'), 'is-ok');
      daoChatSig = '';   /* force the chat to rebuild with the new message */
      loadDao();
      setTimeout(function () { daoSetStatus(''); }, 2500);
    })['catch'](function (e) {
      daoVerified = false;   /* re-handshake on the next attempt */
      daoSetStatus(t('daoPostErr', { err: (e && e.message) || 'wallet' }), 'is-err');
    }).then(function () {
      daoSending = false;
      if (btn) btn.disabled = false;
    });
  }
  function bindDaoCompose() {
    var btn = $('w3DaoSend'), inp = $('w3DaoInput');
    if (btn && !btn.dataset.bound) { btn.dataset.bound = '1'; btn.addEventListener('click', daoSend); }
    if (inp && !inp.dataset.bound) {
      inp.dataset.bound = '1';
      inp.placeholder = t('daoPh');
      inp.addEventListener('keydown', function (e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); daoSend(); }
      });
    }
  }

  function loadDao() {
    if (daoLoading) return;
    daoLoading = true;
    fetch('/api/dao?what=all&limit=30')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        daoLoading = false;
        daoTried = true;
        if (d && d.success) {
          /* per-part merge: the proxy nulls a part whose upstream failed —
             that must not wipe the last good read of that part */
          if (!daoData) daoData = {};
          ['chat', 'proposals', 'members'].forEach(function (k) {
            if (d[k]) daoData[k] = d[k];
          });
        }
        renderDao();
      })
      .catch(function () { daoLoading = false; daoTried = true; renderDao(); });
  }
  function startDao() {
    bindDaoCompose();
    loadDao();
    if (!daoTimer) {
      daoTimer = setInterval(function () {
        var p = $('w3PanelDao');
        if (p && !p.hidden && !document.hidden) loadDao();
      }, 30000);
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
    if (!w) return Promise.resolve();
    dogRead = 'pending';
    badgesRead = 'pending';
    chainSats = null;
    renderBadges();

    /* BTC balance straight from the chain (fire-and-forget: fills the
       satoshis stat whenever it lands; the address lookup can be slow) */
    fetch('/api/scan?q=' + encodeURIComponent(address))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        var btc = j && j.data && j.data.bitcoin;
        var total = btc && Number(btc.total);
        if (isFinite(total)) { chainSats = total; renderProfile(); }
      })
      .catch(function () {});

    var pDog = (typeof w.getFullWalletData === 'function' ? w.getFullWalletData() : Promise.resolve(null))
      .then(function (data) {
        walletData = data || null;
        dogAmount = data ? (runeAmount(findDogRune(data.runes)) || 0) : 0;
        dogRead = 'done';
        renderBadges();
        renderProfile();
      }).catch(function () { dogAmount = 0; dogRead = 'error'; renderBadges(); renderProfile(); });

    var pBadges = fetch('/api/badges?address=' + encodeURIComponent(address))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.success) {
          badges = data.badges;
          badgesRead = 'done';
          if (data.kray_balance != null) krayBal = data.kray_balance;
        } else {
          badges = { dsc: null, runestone: null };
          badgesRead = 'error';
        }
        renderBadges();
        renderProfile();
      }).catch(function () {
        badges = { dsc: null, runestone: null };
        badgesRead = 'error';
        renderBadges();
        renderProfile();
      });

    return Promise.all([pDog, pBadges]).then(function () {
      setStatus(t('stDone', { addr: short(address) }), 'is-ok');
      renderRank();
      renderDao(); /* the "you" weight chip depends on dogAmount */
      /* pull the personalized feed if the tab is already open on connect */
      var fp = $('w3PanelFeed');
      if (fp && !fp.hidden) loadFeed();
    });
  }

  function pickAddr(res) {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (Array.isArray(res)) return res[0] || '';
    if (res.success === false) return '';
    return res.address || (Array.isArray(res.accounts) && res.accounts[0]) || '';
  }

  function enter(a, pk) {
    address = a;
    pubkey = normalizePubkey(pk);
    setStatus(t('stConnected', { addr: short(address) }), 'is-ok');
    var lbl = $('w3ConnectLbl');
    if (lbl) { lbl.removeAttribute('data-i18n'); lbl.textContent = short(address); }
    var btn = $('w3Connect');
    if (btn) btn.classList.add('is-connected');
    renderProfile();     /* the panel opens right away; stats fill as reads land */
    fetchBtcUsd();
    readChain();
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
      var a = pickAddr(res);
      if (!a) { setStatus(t('stErr'), 'is-err'); return; }
      enter(a, res && res.publicKey);
    }).catch(function () { setStatus(t('stErr'), 'is-err'); });
  }

  /* Returning holders: reconnect silently on load so a refresh never asks for
     another click. getAccounts()/connect() never popup — they only answer for
     origins the user already approved via requestAccounts(), so a first-time
     visitor still connects through the button. The extension may inject
     window.krayWallet after DOMContentLoaded — retry briefly (same pattern
     as dogscan.js). */
  function trySilent(attempt) {
    if (address) return;
    var w = kray();
    if (!w) {
      if (attempt < 5) setTimeout(function () { trySilent(attempt + 1); }, 350);
      return; /* no wallet — the install CTA watcher below handles it */
    }
    var silent = w.getAccounts || w.connect;
    if (!silent) return; /* only requestAccounts (prompts) — leave it to the button */
    Promise.resolve().then(function () { return silent.call(w); }).then(function (res) {
      var a = pickAddr(res);
      if (a && !address) enter(a, res && res.publicKey);
    }).catch(function () { /* silent — the user can still click connect */ });
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

  /* ---------- Feed (kray.space/profile/feed mirror) ----------
     The connected wallet's Origin Layer feed: social stats + posts from the
     inscriptions/L2 NFTs it follows, each with its live repost reward. Most
     army wallets follow nobody on KRAY, so an empty personal feed falls back
     to the general trending feed — there is always news to read. */
  var FEED_EMOJI = { KRAY: '▽', DOG: '🐕', DSC: '🐾', RADIOLA: '📻' };

  function feedAgo(iso) {
    var d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return '';
    var s = Math.floor((Date.now() - d.getTime()) / 1000);
    if (s < 60) return s + 's';
    if (s < 3600) return Math.floor(s / 60) + 'm';
    if (s < 86400) return Math.floor(s / 3600) + 'h';
    if (s < 604800) return Math.floor(s / 86400) + 'd';
    return d.toLocaleDateString(lang() === 'en' ? 'en-US' : lang(), { month: 'short', day: 'numeric' });
  }
  function feedName(p) {
    if (p.name) return p.name;
    if (p.ins) return '#' + String(p.ins).slice(0, 8) + '…';
    return p.l2 ? t('fdL2') : t('fdInscription');
  }

  function renderFeedItem(p) {
    var a = document.createElement('a');
    a.className = 'w3-feed-item';
    a.href = p.url;
    a.target = '_blank';
    a.rel = 'noopener';

    var thumb;
    if (p.img) {
      thumb = document.createElement('img');
      thumb.className = 'w3-feed-thumb';
      thumb.loading = 'lazy';
      thumb.alt = '';
      thumb.src = p.img;
      thumb.onerror = function () { thumb.onerror = null; thumb.src = INS_FALLBACK; };
    } else {
      thumb = document.createElement('span');
      thumb.className = 'w3-feed-thumb w3-feed-thumb-mono';
      thumb.textContent = p.l2 ? '▽' : '◉';
    }
    a.appendChild(thumb);

    var body = document.createElement('div');
    body.className = 'w3-feed-body';

    var meta = document.createElement('div');
    meta.className = 'w3-feed-meta';
    var who = document.createElement('b');
    who.textContent = feedName(p);
    meta.appendChild(who);
    if (p.l2) {
      var l2 = document.createElement('span');
      l2.className = 'w3-feed-l2';
      l2.textContent = t('fdL2');
      meta.appendChild(l2);
    }
    if (p.followers > 0) {
      var fol = document.createElement('i');
      fol.className = 'w3-feed-fol';
      fol.textContent = t('fdFollowers', { n: fmt(p.followers) });
      meta.appendChild(fol);
    }
    var tm = document.createElement('time');
    tm.textContent = feedAgo(p.at);
    meta.appendChild(tm);
    body.appendChild(meta);

    /* user-generated content — textContent only, never innerHTML */
    var txt = document.createElement('p');
    txt.className = 'w3-feed-text';
    txt.textContent = String(p.text || '');
    body.appendChild(txt);

    var acts = document.createElement('div');
    acts.className = 'w3-feed-acts';
    var c = document.createElement('span'); c.textContent = '💬 ' + (p.comments | 0); acts.appendChild(c);
    var rp = document.createElement('span'); rp.textContent = '🔄 ' + (p.reposts | 0); acts.appendChild(rp);
    var lk = document.createElement('span'); lk.textContent = '❤️ ' + fmt(p.likes | 0) + ' ▽'; acts.appendChild(lk);
    if (p.reward && p.reward.left > 0) {
      var rw = document.createElement('span');
      rw.className = 'w3-feed-reward';
      rw.textContent = '💰 ' + fmt(p.reward.amount) + ' ' + (FEED_EMOJI[p.reward.token] || '▽') + ' × ' + fmt(p.reward.left);
      acts.appendChild(rw);
    }
    body.appendChild(acts);

    a.appendChild(body);
    return a;
  }

  function renderFeed() {
    var list = $('w3FeedList');
    if (!list) return;

    /* stats row is only meaningful once a wallet is connected */
    var statsBox = $('w3FeedStats');
    if (statsBox) {
      if (address && feedStats) {
        statsBox.hidden = false;
        $('w3FeedFollowing').textContent = fmt(feedStats.following || 0);
        $('w3FeedLikes').textContent = fmt(feedStats.likesGiven || 0);
        $('w3FeedEarned').textContent = fmt(feedStats.krayEarned || 0);
      } else {
        statsBox.hidden = true;
      }
    }

    var mode = $('w3FeedMode');
    if (!feedTried) {
      if (mode) mode.hidden = true;
      return; /* nothing fetched yet — leave the boot/loading note in place */
    }

    /* the personalized feed wins when it has posts; otherwise the general one */
    var following = !!(feedPersonal && feedPersonal.length);
    var posts = following ? feedPersonal : (feedGeneral || []);

    if (mode) {
      mode.textContent = '';
      var note, link = null;
      if (following) { note = t('fdFollowing'); }
      else if (address) { note = t('fdEmptyFollowing'); link = { href: '/social', label: t('fdDiscover') }; }
      else { note = t('fdTrending'); }
      mode.hidden = false;
      mode.appendChild(document.createTextNode(note + (link ? ' ' : '')));
      if (link) {
        var la = document.createElement('a');
        la.href = link.href;
        la.textContent = link.label;
        mode.appendChild(la);
      }
    }

    list.textContent = '';
    if (!posts.length) {
      var e = document.createElement('div');
      e.className = 'w3-feed-empty';
      /* general feed never arrived → treat as an error, else it is genuinely quiet */
      e.textContent = t(feedGeneral === null ? 'fdErr' : 'fdEmpty');
      list.appendChild(e);
      return;
    }
    posts.forEach(function (p) { list.appendChild(renderFeedItem(p)); });
  }

  function loadFeed() {
    if (feedLoading) return;
    feedLoading = true;
    if (!feedTried) {
      var list = $('w3FeedList');
      if (list) {
        list.textContent = '';
        var ld = document.createElement('div');
        ld.className = 'w3-feed-empty';
        ld.textContent = t('fdLoading');
        list.appendChild(ld);
      }
    }
    var tasks = [
      fetch('/api/social?feed=trending&limit=21')
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.success) feedGeneral = d.posts || []; })
        .catch(function () {})
    ];
    if (address) {
      tasks.push(fetch('/api/feed?addr=' + encodeURIComponent(address))
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { if (d && d.success) { feedStats = d.stats || null; feedPersonal = d.posts || []; } })
        .catch(function () {}));
    }
    Promise.all(tasks).then(function () {
      feedLoading = false;
      feedTried = true;
      renderFeed();
    });
  }

  function startFeed() {
    /* lazy first load; reload once the wallet connects after an anon read */
    if (feedLoading) return;
    if (!feedTried || (address && !feedStats)) loadFeed();
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

    /* DogScan embed: the site CSP is form-action 'none', so a native GET submit
       is blocked by the browser. Intercept it and navigate to the explorer
       ourselves — /dogscan?q=… auto-runs the search on arrival. */
    var ksForm = document.querySelector('.ks-embed-form');
    if (ksForm) ksForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = ksForm.querySelector('.ks-embed-input');
      var q = inp && inp.value ? inp.value.trim() : '';
      if (q) location.href = '/dogscan?q=' + encodeURIComponent(q);
    });

    /* profile: copy address, refresh reads, tab switch */
    var copyBtn = $('w3Copy');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      if (!address || !navigator.clipboard) return;
      navigator.clipboard.writeText(address).then(function () {
        var sp = copyBtn.querySelector('span');
        if (!sp || copyBtn.classList.contains('is-ok')) return;
        var prev = sp.textContent;
        copyBtn.classList.add('is-ok');
        sp.textContent = t('pfCopied');
        setTimeout(function () {
          copyBtn.classList.remove('is-ok');
          sp.textContent = prev;
        }, 1400);
      }).catch(function () {});
    });
    var refBtn = $('w3Refresh');
    if (refBtn) refBtn.addEventListener('click', function () {
      if (!address || refBtn.classList.contains('is-busy')) return;
      refBtn.classList.add('is-busy');
      var done = function () { refBtn.classList.remove('is-busy'); };
      var p = readChain();
      if (p && p.then) p.then(done, done); else done();
    });
    var TABS = {
      assets: { btn: $('w3TabBtnAssets'), panel: $('w3PanelAssets') },
      rank: { btn: $('w3TabBtnRank'), panel: $('w3PanelRank') },
      dao: { btn: $('w3TabBtnDao'), panel: $('w3PanelDao') },
      feed: { btn: $('w3TabBtnFeed'), panel: $('w3PanelFeed') }
    };
    function selectTab(which) {
      Object.keys(TABS).forEach(function (k) {
        if (TABS[k].panel) TABS[k].panel.hidden = (k !== which);
        if (TABS[k].btn) TABS[k].btn.classList.toggle('is-on', k === which);
      });
      if (which === 'dao') startDao();
      if (which === 'feed') startFeed();
    }
    Object.keys(TABS).forEach(function (k) {
      if (TABS[k].btn) TABS[k].btn.addEventListener('click', function () { selectTab(k); });
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
          renderProfile();
          var lbl = $('w3ConnectLbl');
          if (lbl) { lbl.removeAttribute('data-i18n'); lbl.textContent = short(address); }
        }
        if (rank) renderRank();
        renderDao(); /* no-op before the first fetch; re-translates the error state too */
        renderFeed(); /* re-translates stats labels, mode note and empty states */
      }, 0);
    });

    /* returning holder? recognize the wallet without another click */
    trySilent(0);

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
