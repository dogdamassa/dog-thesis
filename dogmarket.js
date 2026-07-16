/* DOG ARMY. DogMarket — the DOG•GO•TO•THE•MOON rune marketplace, cloned from
   kray.space/rune/DOGGOTOTHEMOON with the DOG Army skin. Browse live packages,
   buy them, list your own and cancel — all through the original KRAY Wallet.

   Every kray.space read/write is proxied through /api/dogmarket (their CORS
   allowlist 500s foreign-Origin browsers). Signing always happens inside the
   wallet's own popup; this file never touches a seed. External file on purpose:
   script-src 'self' in vercel.json forbids inline scripts AND inline event
   handlers, so there is not a single onclick="" here — all wiring is
   addEventListener / event delegation, and image fallbacks use a capturing
   'error' listener. */
(function () {
  'use strict';

  var DOG_NAME = 'DOG•GO•TO•THE•MOON';
  /* The DOG mascot — the site's own cut-out (transparent bg), same asset
     web3.js uses for the rune. Local + on-brand; the KRAY rune-thumbnail
     endpoint serves the raw on-chain photo (couch background) which reads
     as off-brand here. */
  var DOG_THUMB = '/public/dog-logo.png';
  var MARKET_FEE = 0.02;        /* KRAY's 2% */
  var MIN_FEE_SATS = 330;
  var EST_VBYTES = 500;         /* single-buy tx estimate, matches KRAY */

  /* ── state ─────────────────────────────────────────────────────────── */
  var addr = null;
  var allListings = [];
  var filtered = [];
  var sortMode = 'price_asc';
  var current = null;           /* listing open in the buy modal */
  var fees = { slow: 5, medium: 10, fast: 15 };
  var buyRate = 10;
  var btcUsd = 0;
  var runeDiv = 5;              /* DOG divisibility, refreshed from header */
  /* sell flow */
  var myRunes = [];
  var pickedRune = null;
  var pickedPkg = null;
  var myOpenListings = [];
  var creating = false;

  /* ── tiny bilingual map for JS-rendered strings (static copy is in the
       HTML + i18n.js). Falls back to EN. ─────────────────────────────── */
  var L = {
    connected: { en: 'Connected — ready to buy or list.', pt: 'Conectado — pronto pra comprar ou vender.' },
    connect: { en: 'Connect KRAY Wallet', pt: 'Conectar KRAY Wallet' },
    disconnect: { en: 'wallet', pt: 'carteira' },
    noWallet: { en: 'KRAY Wallet not found. Install it to buy or list.', pt: 'KRAY Wallet não encontrada. Instale para comprar ou vender.' },
    locked: { en: 'Wallet is locked — open KRAY Wallet and unlock it.', pt: 'Carteira travada — abra a KRAY Wallet e destrave.' },
    pkgs: { en: 'packages', pt: 'pacotes' }, pkg: { en: 'package', pt: 'pacote' },
    none: { en: 'No packages for sale', pt: 'Nenhum pacote à venda' },
    noneSub: { en: 'Nobody is selling DOG right now. Check back soon.', pt: 'Ninguém está vendendo DOG agora. Volte em breve.' },
    forSale: { en: 'FOR SALE', pt: 'À VENDA' }, yours: { en: 'YOUR LISTING', pt: 'SEU ANÚNCIO' },
    tokensAvail: { en: 'tokens available', pt: 'tokens disponíveis' },
    buy: { en: 'Buy', pt: 'Comprar' }, cancel: { en: '✕ Cancel', pt: '✕ Cancelar' },
    fetchingUtxos: { en: 'Fetching your UTXOs…', pt: 'Buscando seus UTXOs…' },
    preparing: { en: 'Preparing transaction…', pt: 'Preparando transação…' },
    signPrompt: { en: 'Please sign in your wallet…', pt: 'Assine na sua carteira…' },
    broadcasting: { en: 'Broadcasting…', pt: 'Transmitindo…' },
    bought: { en: 'Purchase complete! 🎉', pt: 'Compra concluída! 🎉' },
    noPureBtc: { en: 'No spendable BTC in this wallet. Deposit pure BTC (no runes/inscriptions) to buy.', pt: 'Sem BTC gastável nesta carteira. Deposite BTC puro (sem runes/inscrições) para comprar.' },
    insufficient: { en: 'Insufficient BTC. Have {have} sats, need ~{need} sats.', pt: 'BTC insuficiente. Você tem {have} sats, precisa de ~{need} sats.' },
    listed: { en: 'DOG listed for sale!', pt: 'DOG anunciado à venda!' },
    cancelled: { en: 'Listing cancelled.', pt: 'Anúncio cancelado.' },
    cancelConfirm: { en: 'Cancel this listing?', pt: 'Cancelar este anúncio?' },
    noRunes: { en: 'No DOG in this wallet', pt: 'Sem DOG nesta carteira' },
    noRunesSub: { en: 'You need DOG in this wallet to list it for sale.', pt: 'Você precisa de DOG nesta carteira para anunciar.' },
    pkgN: { en: 'Package', pt: 'Pacote' }, locked2: { en: 'LISTED', pt: 'ANUNCIADO' },
    tokens: { en: 'tokens', pt: 'tokens' },
    signRejected: { en: 'Signature rejected or failed.', pt: 'Assinatura recusada ou falhou.' },
    price: { en: 'Price', pt: 'Preço' }, perToken: { en: 'Price per token', pt: 'Preço por token' },
    marketFee: { en: 'Market fee (2%)', pt: 'Taxa do mercado (2%)' }, networkFee: { en: 'Network fee', pt: 'Taxa de rede' },
    total: { en: 'Total', pt: 'Total' }, feeRate: { en: 'Network fee rate', pt: 'Taxa de rede (sat/vB)' },
    slow: { en: 'Slow', pt: 'Lento' }, normal: { en: 'Normal', pt: 'Normal' }, fast: { en: 'Fast', pt: 'Rápido' },
    buySignBtn: { en: 'Buy · sign in wallet', pt: 'Comprar · assinar na carteira' }
  };
  function lang() {
    try { return (document.documentElement.getAttribute('lang') || 'en').slice(0, 2); } catch (e) { return 'en'; }
  }
  function t(key, vars) {
    var e = L[key]; if (!e) return key;
    var s = e[lang()] || e.en;
    if (vars) Object.keys(vars).forEach(function (k) { s = s.replace('{' + k + '}', vars[k]); });
    return s;
  }

  /* ── helpers ───────────────────────────────────────────────────────── */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function kw() { return typeof window.krayWallet !== 'undefined' ? window.krayWallet : null; }
  function short(a) { return a ? a.slice(0, 6) + '…' + a.slice(-4) : '—'; }

  function apiUrl(ep, params) {
    var u = '/api/dogmarket?ep=' + encodeURIComponent(ep);
    params = params || {};
    Object.keys(params).forEach(function (k) { u += '&' + k + '=' + encodeURIComponent(params[k]); });
    return u;
  }
  function apiGet(ep, params) { return fetch(apiUrl(ep, params)).then(function (r) { return r.json(); }); }
  function apiSend(method, ep, params, body) {
    return fetch(apiUrl(ep, params), {
      method: method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {})
    }).then(function (r) { return r.json(); });
  }

  function fmtSats(s) {
    s = Number(s) || 0;
    if (s >= 1e8) return (s / 1e8).toFixed(4) + ' BTC';
    if (s >= 1e6) return '丰 ' + (s / 1e6).toFixed(2) + 'M sats';
    if (s >= 1e3) return '丰 ' + (s / 1e3).toFixed(1) + 'K sats';
    return '丰 ' + s.toLocaleString() + ' sats';
  }
  function usd(sats) {
    if (!sats || !btcUsd) return '';
    var v = (sats / 1e8) * btcUsd;
    if (v < 0.01) return '~$' + v.toFixed(4);
    if (v < 1) return '~$' + v.toFixed(3);
    if (v >= 1000) return '~$' + (v / 1000).toFixed(1) + 'K';
    return '~$' + v.toFixed(2);
  }
  function fmtNum(n) {
    n = Number(n); if (!isFinite(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (Number.isInteger(n)) return n.toLocaleString();
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }
  function fmtSupply(a, div) {
    if (a == null) return '—';
    var n = typeof a === 'string' ? parseFloat(a) : a;
    if (div > 0) return (n / Math.pow(10, div)).toLocaleString('en-US', { maximumFractionDigits: div });
    return n.toLocaleString('en-US');
  }
  function displayAmt(l) { return Number(l.sell_amount) / Math.pow(10, l.divisibility || 0); }

  function toast(msg, type) {
    var wrap = $('dmToasts'); if (!wrap) return;
    var el = document.createElement('div');
    el.className = 'dm-toast ' + (type || 'info');
    var ic = document.createElement('span'); ic.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    var tx = document.createElement('span'); tx.textContent = msg;
    el.appendChild(ic); el.appendChild(tx); wrap.appendChild(el);
    setTimeout(function () { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 300); }, type === 'error' ? 7000 : 3800);
  }

  /* BTC price for the USD hints — coingecko is allowed by our CSP connect-src */
  function loadBtcPrice() {
    fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.bitcoin && d.bitcoin.usd) { btcUsd = d.bitcoin.usd; paintUsd(); } })
      .catch(function () {});
  }
  function paintUsd() {
    document.querySelectorAll('.dm-price-usd[data-sats]').forEach(function (el) {
      var v = usd(Number(el.getAttribute('data-sats'))); if (v) el.textContent = v;
    });
  }

  /* ── wallet ────────────────────────────────────────────────────────── */
  function addrFrom(res) {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (Array.isArray(res)) return res[0] || '';
    if (res.address) return res.address;
    if (Array.isArray(res.accounts)) return res.accounts[0] || '';
    return '';
  }
  function setConnected(a) {
    addr = a;
    try { localStorage.setItem('walletAddress', a); localStorage.setItem('walletType', 'kraywallet'); } catch (e) {}
    var lbl = $('dmConnectLbl'); if (lbl) lbl.textContent = short(a);
    var st = $('dmStatus'); if (st) { st.textContent = t('connected'); st.classList.add('on'); }
    var sell = $('dmSellBtn'); if (sell) sell.style.display = 'inline-flex';
    renderGrid();  /* re-skin own listings + cancel buttons */
  }
  function connect(silent) {
    var w = kw();
    if (!w) {
      if (!silent) { toast(t('noWallet'), 'error'); var ins = $('dmInstall'); if (ins) ins.hidden = false; }
      return Promise.resolve(false);
    }
    var call = (silent && typeof w.connect === 'function') ? w.connect() : w.requestAccounts();
    return call.then(function (res) {
      if (res && res.success === false) {
        if (!silent) toast(res.needsUserAction ? t('locked') : t('signRejected'), 'error');
        return false;
      }
      var a = addrFrom(res);
      if (!a) return false;
      setConnected(a);
      return true;
    }).catch(function () { if (!silent) toast(t('locked'), 'error'); return false; });
  }
  function ensureWallet() {
    if (addr) return Promise.resolve(true);
    return connect(false);
  }

  /* ── rune header ───────────────────────────────────────────────────── */
  function loadRune() {
    apiGet('rune').then(function (d) {
      if (!d || !d.rune) return;
      runeDiv = d.rune.divisibility != null ? d.rune.divisibility : 5;
      renderRuneHeader(d);
    }).catch(function () {});
  }
  function stat(label, val, color) {
    return '<div class="dm-stat"><span>' + esc(label) + '</span><b' + (color ? ' style="color:' + color + '"' : '') + '>' + esc(val) + '</b></div>';
  }
  function renderRuneHeader(d) {
    var r = d.rune, h = d.holders || {}, links = d.links || {};
    var div = r.divisibility || 0;
    var html =
      '<div class="dm-runehead">' +
      '<div class="dm-rh-top">' +
      '<div class="dm-rh-thumb"><span>' + esc(r.symbol || '🐕') + '</span>' +
      '<img src="' + DOG_THUMB + '" alt="" data-fallback="1"></div>' +
      '<div class="dm-rh-id">' +
      '<h1 class="dm-rh-name">' + esc(r.spacedName || r.name || DOG_NAME) + ' <span class="sym">' + esc(r.symbol || '🐕') + '</span></h1>' +
      '<div class="dm-rh-badges">' +
      '<span class="dm-pill orange">Rune #' + esc(r.number != null ? r.number : '—') + '</span>' +
      '<span class="dm-pill">' + esc(div) + ' decimals</span>' +
      (r.mintable ? '<span class="dm-pill">⚡ Mintable</span>' : '<span class="dm-pill">🔒 Closed</span>') +
      '<a class="dm-pill dao" href="/web3#patente">🏛️ DAO</a>' +
      (links.ordinals ? '<a class="dm-pill" href="' + esc(links.ordinals) + '" target="_blank" rel="noopener">ordinals ↗</a>' : '') +
      '</div></div></div>' +
      '<div class="dm-rh-stats">' +
      stat('Total supply', fmtSupply(r.supply && r.supply.total, div), '#7be08a') +
      stat('Holders', h.total ? h.total.toLocaleString() : '—', '') +
      stat('Circulating', fmtSupply(r.supply && r.supply.circulating, div), '#5aa9ff') +
      stat('Burned', fmtSupply(r.supply && r.supply.burned, div), '#ff6b6b') +
      stat('Minted', fmtSupply(r.supply && r.supply.minted, div), '#ff5c00') +
      '</div></div>';
    var host = $('dmRuneHeader'); if (host) host.innerHTML = html;
  }

  /* ── listings ──────────────────────────────────────────────────────── */
  function loadListings() {
    apiGet('listings').then(function (d) {
      allListings = (d && d.listings) || [];
      renderGrid();
      loadBtcPrice();
    }).catch(function () {
      var g = $('dmGrid');
      if (g) g.innerHTML = '<div class="dm-empty"><div class="ic">⚠️</div><h3>Error loading packages</h3></div>';
    });
  }
  function perToken(l) {
    var a = displayAmt(l);
    return a > 0 ? l.price_sats / a : Infinity;
  }
  function sortNow() {
    filtered = allListings.slice();
    filtered.sort(function (a, b) {
      switch (sortMode) {
        case 'price_desc': return perToken(b) - perToken(a);
        case 'amount_desc': return Number(b.sell_amount) - Number(a.sell_amount);
        case 'amount_asc': return Number(a.sell_amount) - Number(b.sell_amount);
        case 'recent': return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        default: return perToken(a) - perToken(b);
      }
    });
  }
  function cardHtml(l) {
    var amt = displayAmt(l);
    var per = amt > 0 ? (l.price_sats / amt) : 0;
    var mine = addr && l.seller_payout_address === addr;
    var full = String(l.total_amount || l.sell_amount) === String(l.sell_amount);
    var actions;
    if (mine) {
      actions = '<button class="dm-buy cancel" data-action="cancel" data-order="' + esc(l.order_id) + '">' + esc(t('cancel')) + '</button>';
    } else {
      var cart = full ? '<button class="dm-cart-add" data-action="cart" data-order="' + esc(l.order_id) + '" title="Add to bundle">+</button>' : '';
      actions = '<div class="dm-actions">' + cart + '<button class="dm-buy" data-action="buy" data-order="' + esc(l.order_id) + '">' + esc(t('buy')) + '</button></div>';
    }
    return '<div class="dm-card' + (mine ? ' own' : '') + '" data-order="' + esc(l.order_id) + '">' +
      '<div class="dm-thumb"><span>' + esc(l.rune_symbol || '🐕') + '</span>' +
      '<img class="dm-thumb-img" src="' + DOG_THUMB + '" alt="" data-fallback="1">' +
      '<div class="dm-cardbadge' + (mine ? ' own' : '') + '">' + esc(mine ? t('yours') : t('forSale')) + '</div></div>' +
      '<div class="dm-cardbody">' +
      '<div class="dm-amt">' + fmtNum(amt) + ' ' + esc(l.rune_symbol || '') + '</div>' +
      '<div class="dm-amt-lbl">' + esc(t('tokensAvail')) + '</div>' +
      '<div class="dm-price">' + fmtSats(l.price_sats) + '</div>' +
      '<div class="dm-price-usd" data-sats="' + esc(l.price_sats) + '">' + esc(usd(l.price_sats)) + '</div>' +
      '<div class="dm-price-per">丰 ' + per.toFixed(2) + ' sats/token</div>' +
      actions + '</div></div>';
  }
  function renderGrid() {
    var g = $('dmGrid'); if (!g) return;
    var c = $('dmCount');
    if (!allListings.length) {
      g.innerHTML = '<div class="dm-empty"><div class="ic">⧈</div><h3>' + esc(t('none')) + '</h3><p>' + esc(t('noneSub')) + '</p></div>';
      if (c) c.innerHTML = '<b>0</b> ' + esc(t('pkgs'));
      return;
    }
    sortNow();
    g.innerHTML = filtered.map(cardHtml).join('');
    if (c) c.innerHTML = '<b>' + filtered.length + '</b> ' + esc(filtered.length === 1 ? t('pkg') : t('pkgs'));
    syncCartButtons();
    paintUsd();
  }

  /* ── buy modal ─────────────────────────────────────────────────────── */
  function openBuy(orderId) {
    ensureWallet().then(function (ok) {
      if (!ok) return;
      current = allListings.find(function (l) { return l.order_id === orderId; });
      if (!current) { toast('Listing not found', 'error'); return; }
      var err = $('dmBuyErr'); if (err) { err.hidden = true; err.textContent = ''; }
      apiGet('fees').then(function (d) {
        if (d && d.fees) fees = d.fees;
        buyRate = fees.medium || 10;
        renderBuyBody();
        $('dmBuyModal').hidden = false;
      });
    });
  }
  function buyTotals() {
    var market = Math.max(Math.floor(current.price_sats * MARKET_FEE), MIN_FEE_SATS);
    var network = EST_VBYTES * buyRate;
    return { market: market, network: network, total: current.price_sats + market + network };
  }
  function renderBuyBody() {
    var amt = displayAmt(current);
    var per = amt > 0 ? (current.price_sats / amt) : 0;
    var tt = buyTotals();
    var feeBtn = function (k, label) {
      return '<button type="button" class="dm-fee' + (buyRate === fees[k] ? ' on' : '') + '" data-fee="' + k + '">' +
        '<b>' + esc(label) + '</b><i>' + (fees[k] || 0) + ' sat/vB</i></button>';
    };
    $('dmBuyBody').innerHTML =
      '<div style="text-align:center;margin-bottom:6px">' +
      '<div class="dm-rh-thumb" style="margin:0 auto 12px"><span>' + esc(current.rune_symbol || '🐕') + '</span>' +
      '<img src="' + DOG_THUMB + '" alt="" data-fallback="1"></div>' +
      '<h3 style="margin:0">' + esc(current.rune_name) + '</h3>' +
      '<div style="color:#ff5c00;font-weight:700;margin-top:4px">' + fmtNum(amt) + ' ' + esc(t('tokens')) + '</div></div>' +
      '<div class="dm-rows">' +
      '<div class="dm-row"><span>' + esc(t('price')) + '</span><b>丰 ' + current.price_sats.toLocaleString() + '</b></div>' +
      '<div class="dm-row"><span>' + esc(t('perToken')) + '</span><b style="color:#ff5c00">丰 ' + per.toFixed(4) + '</b></div>' +
      '<div class="dm-row"><span>' + esc(t('marketFee')) + '</span><b>丰 ' + tt.market.toLocaleString() + '</b></div>' +
      '<div class="dm-row"><span>' + esc(t('networkFee')) + '</span><b id="dmNetFee">~丰 ' + tt.network.toLocaleString() + '</b></div>' +
      '<div class="dm-row total"><span>' + esc(t('total')) + '</span><b id="dmTotal">~丰 ' + tt.total.toLocaleString() + ' <small style="font-weight:400;color:rgba(255,255,255,.4)">' + esc(usd(tt.total)) + '</small></b></div>' +
      '</div>' +
      '<div class="dm-fee-label">' + esc(t('feeRate')) + '</div>' +
      '<div class="dm-fee-grid">' + feeBtn('slow', t('slow')) + feeBtn('medium', t('normal')) + feeBtn('fast', t('fast')) + '</div>';
    var btn = $('dmBuyConfirm'); if (btn) { btn.disabled = false; btn.textContent = t('buySignBtn'); }
  }
  function pickFee(k) {
    if (!fees[k]) return;
    buyRate = fees[k];
    document.querySelectorAll('#dmBuyBody .dm-fee').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-fee') === k); });
    var tt = buyTotals();
    var nf = $('dmNetFee'), tc = $('dmTotal');
    if (nf) nf.textContent = '~丰 ' + tt.network.toLocaleString();
    if (tc) tc.innerHTML = '~丰 ' + tt.total.toLocaleString() + ' <small style="font-weight:400;color:rgba(255,255,255,.4)">' + esc(usd(tt.total)) + '</small>';
  }

  /* select spendable (pure BTC) UTXOs covering `need` sats */
  function pickPureUtxos(list, need) {
    var pure = (list || []).filter(function (u) {
      var hi = u.inscriptions && u.inscriptions.length > 0;
      var hr = u.runes && (Array.isArray(u.runes) ? u.runes.length > 0 : Object.keys(u.runes).length > 0);
      return !hi && !hr && !u.hasInscription && !u.hasRunes;
    }).sort(function (a, b) { return b.value - a.value; });
    var sel = [], sum = 0;
    for (var i = 0; i < pure.length; i++) { if (sum >= need) break; sel.push(pure[i]); sum += pure[i].value; }
    return { sel: sel, sum: sum, pureTotal: pure.reduce(function (s, u) { return s + u.value; }, 0), pureCount: pure.length };
  }
  function mapUtxos(sel) {
    return sel.map(function (u) {
      return { txid: u.txid, vout: u.vout, value: u.value, scriptPubKey: u.scriptPubKey || u.script_pubkey };
    });
  }

  function confirmBuy() {
    if (!current || !addr) return;
    var btn = $('dmBuyConfirm'); if (btn) btn.disabled = true;
    var order = current.order_id;
    var tt = buyTotals();
    var need = current.price_sats + tt.market + tt.network + 1000;
    toast(t('fetchingUtxos'), 'info');
    apiGet('utxos', { addr: addr }).then(function (d) {
      var picked = pickPureUtxos((d && d.utxos) || [], need);
      if (picked.pureCount === 0) throw new Error(t('noPureBtc'));
      if (picked.sum < need) throw new Error(t('insufficient', { have: picked.pureTotal.toLocaleString(), need: need.toLocaleString() }));
      toast(t('preparing'), 'info');
      return apiSend('POST', 'buy', { id: order }, {
        buyer_address: addr, buyer_utxos: mapUtxos(picked.sel), fee_rate: buyRate
      });
    }).then(function (buy) {
      if (!buy || !buy.success) throw new Error((buy && buy.error) || 'Failed to prepare buy');
      toast(t('signPrompt'), 'info');
      return signBuyPsbt(buy.psbt_base64, buy.inputs_to_sign).then(function (signed) {
        toast(t('broadcasting'), 'info');
        return apiSend('POST', 'broadcast', { id: order }, {
          signed_psbt_base64: signed, buyer_address: addr, buy_token: buy.buy_token
        });
      });
    }).then(function (b) {
      if (!b || !b.success) throw new Error((b && b.error) || 'Broadcast failed');
      toast(t('bought'), 'success');
      closeBuy();
      if (b.txid) window.open('https://mempool.space/tx/' + b.txid, '_blank', 'noopener');
      loadListings();
    }).catch(function (e) {
      var err = $('dmBuyErr'); if (err) { err.textContent = '❌ ' + e.message; err.hidden = false; }
      toast(e.message, 'error');
    }).then(function () { if (btn) btn.disabled = false; });
  }
  function signBuyPsbt(psbt, inputs) {
    var w = kw(); if (!w) return Promise.reject(new Error(t('noWallet')));
    return w.signPsbt(psbt, {
      autoFinalized: false,
      toSignInputs: (inputs || []).map(function (i) { return { index: i, sighashTypes: [1] }; })
    }).then(function (r) { return (r && r.signedPsbt) || r; });
  }
  function closeBuy() {
    var m = $('dmBuyModal'); if (m) m.hidden = true;
    current = null;
    var err = $('dmBuyErr'); if (err) { err.hidden = true; err.textContent = ''; }
  }

  /* ── cancel own listing ────────────────────────────────────────────── */
  function cancelListing(orderId) {
    if (!addr) { toast(t('locked'), 'error'); return; }
    var w = kw();
    if (!w || typeof w.signMessage !== 'function') { toast(t('noWallet'), 'error'); return; }
    if (!window.confirm(t('cancelConfirm'))) return;
    var ts = Date.now();
    var nonce = ((window.crypto && window.crypto.randomUUID && window.crypto.randomUUID()) || (Math.random().toString(36).slice(2) + ts.toString(36))).replace(/-/g, '').slice(0, 16);
    var message = 'KRAY:cancel-listing:' + addr + ':' + orderId + ':' + nonce + ':' + ts;
    var signer = typeof w.signMessageWithConfirmation === 'function' ? w.signMessageWithConfirmation(message) : w.signMessage(message);
    signer.then(function (sig) {
      if (!sig || !sig.signature) throw new Error(t('signRejected'));
      var pk = sig.pubkey;
      var getPk = (!pk && typeof w.getPublicKey === 'function') ? w.getPublicKey() : Promise.resolve(pk);
      return Promise.resolve(getPk).then(function (pubkey) {
        return apiSend('DELETE', 'cancel', { id: orderId }, {
          seller_address: addr, signature: sig.signature, message: message, pubkey: pubkey, nonce: nonce, timestamp: ts
        });
      });
    }).then(function (d) {
      if (!d || !d.success) throw new Error((d && d.error) || 'Failed to cancel');
      toast(t('cancelled'), 'success');
      loadListings();
    }).catch(function (e) { toast(e.message, 'error'); });
  }

  /* ── sell / list flow ──────────────────────────────────────────────── */
  function openList() {
    ensureWallet().then(function (ok) {
      if (!ok) return;
      pickedRune = null; pickedPkg = null; creating = false;
      showStep(1);
      $('dmListModal').hidden = false;
      loadMyRunes();
    });
  }
  function showStep(n) {
    [1, 2, 3].forEach(function (i) { var el = $('dmListStep' + i); if (el) el.hidden = i !== n; });
  }
  function isDog(name) { return String(name || '').replace(/[^A-Za-z]/g, '').toUpperCase() === 'DOGGOTOTHEMOON'; }
  function loadMyRunes() {
    var box = $('dmMyRunes');
    box.innerHTML = '<div class="dm-empty"><div class="ic">⧈</div><h3>…</h3></div>';
    Promise.all([apiGet('myrunes', { addr: addr }), apiGet('listings')]).then(function (res) {
      var d = res[0] || {}, lst = res[1] || {};
      myOpenListings = (lst.listings || []).filter(function (l) {
        return String(l.status || '').toUpperCase() === 'OPEN' && l.seller_payout_address === addr;
      });
      myRunes = (d.runes || []).filter(function (r) { return isDog(r.name); });
      if (!myRunes.length) {
        box.innerHTML = '<div class="dm-empty"><div class="ic">🐕</div><h3>' + esc(t('noRunes')) + '</h3><p>' + esc(t('noRunesSub')) + '</p></div>';
        return;
      }
      box.innerHTML = myRunes.map(function (r, i) {
        return '<div class="dm-pick" data-rune="' + i + '">' +
          '<div class="ic"><span>' + esc(r.symbol || '🐕') + '</span><img src="' + DOG_THUMB + '" alt="" data-fallback="1"></div>' +
          '<div class="nm"><b>' + esc(r.name) + '</b><i>' + fmtNum(r.amount) + ' ' + esc(r.symbol || '') + '</i></div>' +
          '<span style="color:rgba(255,255,255,.35)">›</span></div>';
      }).join('');
    }).catch(function () {
      box.innerHTML = '<div class="dm-empty"><div class="ic">⚠️</div><h3>Error</h3></div>';
    });
  }
  function pickRune(i) {
    pickedRune = myRunes[i]; pickedPkg = null;
    var utxos = pickedRune.utxos || [];
    var div = pickedRune.divisibility || 0;
    var box = $('dmMyPackages');
    if (!utxos.length) {
      /* single aggregate package fallback (matches kray) */
      box.innerHTML = '<div class="dm-empty"><div class="ic">📦</div><h3>1 ' + esc(t('pkg')) + '</h3><p>' + fmtNum(pickedRune.amount) + ' ' + esc(pickedRune.symbol || '') + '</p></div>';
    } else {
      box.innerHTML = utxos.map(function (u, idx) {
        var listed = myOpenListings.find(function (l) { return (l.seller_txid + ':' + l.seller_vout) === (u.txid + ':' + u.vout); });
        var disp = fmtNum(Number(u.amount) / Math.pow(10, div));
        return '<div class="dm-pick"' + (listed ? ' style="opacity:.5;cursor:not-allowed"' : ' data-pkg="' + idx + '"') + '>' +
          '<div class="ic">📦</div>' +
          '<div class="nm"><b>' + esc(t('pkgN')) + ' ' + (idx + 1) + ' · ' + disp + ' ' + esc(t('tokens')) + '</b>' +
          '<i style="color:rgba(255,255,255,.4)">' + esc(u.txid.slice(0, 8)) + '…:' + u.vout + '</i></div>' +
          (listed ? '<span style="color:#ff6b6b;font-size:11px;font-weight:700">🔒 ' + esc(t('locked2')) + '</span>' : '<span style="color:rgba(255,255,255,.35)">›</span>') +
          '</div>';
      }).join('');
    }
    showStep(2);
  }
  function pickPackage(idx) {
    var utxos = pickedRune.utxos || [];
    var u = utxos[idx];
    if (!u) return;
    pickedPkg = u;
    var div = pickedRune.divisibility || 0;
    var amt = Number(u.amount) / Math.pow(10, div);
    pickedRune._pkgAmount = amt;
    $('dmListPkgInfo').textContent = esc(t('pkgN')) + ' · ' + fmtNum(amt) + ' ' + (pickedRune.symbol || '');
    $('dmListAmount').value = amt;
    $('dmListPrice').value = '';
    $('dmListSummary').hidden = true;
    var err = $('dmListErr'); if (err) err.hidden = true;
    $('dmCreateBtn').disabled = true;
    showStep(3);
  }
  function updateSummary() {
    var amount = parseFloat($('dmListAmount').value) || 0;
    var price = parseInt($('dmListPrice').value, 10) || 0;
    var avail = (pickedRune && pickedRune._pkgAmount) || 0;
    var btn = $('dmCreateBtn');
    if (amount > 0 && price >= MIN_FEE_SATS) {
      var per = (price / amount).toFixed(4);
      var fee = Math.max(Math.floor(price * MARKET_FEE), MIN_FEE_SATS);
      $('dmSumPer').textContent = '丰 ' + per + ' sats';
      $('dmSumFee').textContent = fmtSats(fee);
      $('dmSumReceive').textContent = fmtSats(price - fee);
      $('dmListSummary').hidden = false;
      var ok = amount > 0 && amount <= avail && price >= MIN_FEE_SATS;
      btn.disabled = !ok;
    } else {
      $('dmListSummary').hidden = true;
      btn.disabled = true;
    }
  }
  function createListing() {
    if (creating || !pickedRune || !pickedPkg) return;
    var amount = parseFloat($('dmListAmount').value);
    var price = parseInt($('dmListPrice').value, 10);
    var maxAmt = pickedRune._pkgAmount || pickedRune.amount;
    if (!amount || amount <= 0) { toast('Enter a valid amount', 'error'); return; }
    if (amount > maxAmt) { toast('Amount exceeds package', 'error'); return; }
    if (!price || price < MIN_FEE_SATS) { toast('Price must be ≥ 330 sats', 'error'); return; }
    creating = true;
    var btn = $('dmCreateBtn'); btn.disabled = true;
    var err = $('dmListErr'); if (err) err.hidden = true;
    var u = pickedPkg;
    var div = pickedRune.divisibility || 0;
    var rawSell = Math.floor(amount * Math.pow(10, div)).toString();
    var rawTotal = (Number(u.amount) || rawSell).toString();
    var outpoint = u.txid + ':' + u.vout;
    apiGet('output', { outpoint: outpoint }).then(function (o) {
      var spk, val;
      if (o && o.success && o.script_pubkey) { spk = o.script_pubkey; val = o.value; }
      else throw new Error('Could not read UTXO');
      return apiSend('POST', 'create', {}, {
        rune_id: pickedRune.runeId, rune_name: pickedRune.name, rune_symbol: pickedRune.symbol || '🐕',
        sell_amount: rawSell, total_amount: rawTotal, divisibility: div,
        seller_txid: u.txid, seller_vout: u.vout, seller_value: val,
        seller_script_pubkey: spk, price_sats: price, seller_payout_address: addr
      });
    }).then(function (c) {
      if (!c || !c.success) throw new Error((c && c.error) || 'Failed to create listing');
      toast(t('signPrompt'), 'info');
      var w = kw();
      return w.signPsbt(c.psbt_base64, { autoFinalized: false, toSignInputs: [{ index: 0, sighashTypes: [0x83] }] })
        .then(function (r) { return { order: c.order_id, signed: (r && r.signedPsbt) || r }; });
    }).then(function (s) {
      return apiSend('POST', 'sign', { id: s.order }, { signed_psbt_base64: s.signed });
    }).then(function (r) {
      if (!r || !r.success) throw new Error((r && r.error) || 'Failed to submit');
      toast(t('listed'), 'success');
      closeList();
      loadListings();
    }).catch(function (e) {
      if (err) { err.textContent = '❌ ' + e.message; err.hidden = false; }
      toast(e.message, 'error');
    }).then(function () { creating = false; var b = $('dmCreateBtn'); if (b) b.disabled = false; });
  }
  function closeList() {
    var m = $('dmListModal'); if (m) m.hidden = true;
    pickedRune = null; pickedPkg = null; creating = false;
  }

  /* ── bundle cart ───────────────────────────────────────────────────── */
  var CART_KEY = 'dogmarket_cart', CART_MAX = 20;
  function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; } }
  function saveCart(c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} updateFab(); }
  function inCart(id) { return getCart().some(function (i) { return i.order_id === id; }); }
  function toggleCart(id) {
    var l = allListings.find(function (x) { return x.order_id === id; });
    if (!l) return;
    var cart = getCart();
    var idx = cart.findIndex(function (i) { return i.order_id === id; });
    if (idx >= 0) { cart.splice(idx, 1); toast('Removed from bundle', 'info'); }
    else {
      if (cart.length >= CART_MAX) { toast('Bundle limit is ' + CART_MAX, 'error'); return; }
      cart.push({ order_id: l.order_id, rune_name: l.rune_name, rune_symbol: l.rune_symbol, price_sats: l.price_sats, sell_amount: l.sell_amount, divisibility: l.divisibility || 0 });
      toast('Added to bundle', 'success');
    }
    saveCart(cart); syncCartButtons(); renderDrawer();
  }
  function syncCartButtons() {
    document.querySelectorAll('.dm-cart-add').forEach(function (b) {
      var on = inCart(b.getAttribute('data-order'));
      b.classList.toggle('in', on); b.textContent = on ? '✓' : '+';
    });
  }
  function updateFab() {
    var fab = $('dmCartFab'); if (!fab) return;
    var n = getCart().length;
    fab.querySelector('.n').textContent = n;
    fab.classList.toggle('show', n > 0);
  }
  function openDrawer() { renderDrawer(); $('dmCartDrawer').classList.add('open'); $('dmCartScrim').classList.add('open'); }
  function closeDrawer() { $('dmCartDrawer').classList.remove('open'); $('dmCartScrim').classList.remove('open'); }
  function renderDrawer() {
    var items = $('dmCartItems'), foot = $('dmCartFoot'); if (!items) return;
    var cart = getCart();
    if (!cart.length) { items.innerHTML = '<div class="dm-cart-empty">Your bundle is empty.<br>Tap <b>+</b> on any package.</div>'; foot.innerHTML = ''; return; }
    items.innerHTML = cart.map(function (i) {
      var amt = Number(i.sell_amount) / Math.pow(10, i.divisibility || 0);
      return '<div class="dm-cart-item"><div class="nm"><b>' + esc(i.rune_symbol || '🐕') + ' ' + esc(i.rune_name) + '</b><i>' + fmtNum(amt) + ' tokens · ' + fmtSats(i.price_sats) + '</i></div>' +
        '<button class="rm" data-rm="' + esc(i.order_id) + '">🗑</button></div>';
    }).join('');
    var total = cart.reduce(function (s, i) { return s + i.price_sats; }, 0);
    var fee = cart.reduce(function (s, i) { return s + Math.max(Math.floor(i.price_sats * MARKET_FEE), MIN_FEE_SATS); }, 0);
    foot.innerHTML = '<div class="dm-row"><span>' + cart.length + ' ' + esc(t('pkgs')) + '</span><b>' + fmtSats(total) + '</b></div>' +
      '<div class="dm-row"><span>' + esc(t('marketFee')) + '</span><b>' + fmtSats(fee) + '</b></div>' +
      '<button class="btn primary" id="dmBundleBuy" style="width:100%;margin-top:12px">Buy bundle (' + cart.length + ')</button>';
  }
  function buyBundle() {
    var cart = getCart(); if (!cart.length) return;
    ensureWallet().then(function (ok) {
      if (!ok) return;
      var rate = buyRate || fees.medium || 10;
      var N = cart.length;
      var totalPrice = cart.reduce(function (s, i) { return s + i.price_sats; }, 0);
      var totalFee = cart.reduce(function (s, i) { return s + Math.max(Math.floor(i.price_sats * MARKET_FEE), MIN_FEE_SATS); }, 0);
      var estV = 11 + (N * 58) + (2 * 91) + ((2 * N + 3) * 43);
      var need = totalPrice + totalFee + (estV * rate) + (N * MIN_FEE_SATS) + 1000;
      var btn = $('dmBundleBuy'); if (btn) btn.disabled = true;
      toast(t('fetchingUtxos'), 'info');
      apiGet('utxos', { addr: addr }).then(function (d) {
        var picked = pickPureUtxos((d && d.utxos) || [], need);
        if (picked.pureCount === 0) throw new Error(t('noPureBtc'));
        if (picked.sum < need) throw new Error(t('insufficient', { have: picked.pureTotal.toLocaleString(), need: need.toLocaleString() }));
        toast(t('preparing'), 'info');
        return apiSend('POST', 'bundle-buy', {}, {
          order_ids: cart.map(function (i) { return i.order_id; }), buyer_address: addr, buyer_utxos: mapUtxos(picked.sel), fee_rate: rate
        });
      }).then(function (buy) {
        if (!buy || !buy.success) throw new Error((buy && buy.error) || 'Failed to prepare bundle');
        toast(t('signPrompt'), 'info');
        return signBuyPsbt(buy.psbt_base64, buy.inputs_to_sign).then(function (signed) {
          toast(t('broadcasting'), 'info');
          return apiSend('POST', 'bundle-broadcast', {}, {
            order_ids: cart.map(function (i) { return i.order_id; }), signed_psbt_base64: signed, buyer_address: addr, buy_token: buy.buy_token
          });
        });
      }).then(function (b) {
        if (!b || !b.success) throw new Error((b && b.error) || 'Bundle broadcast failed');
        saveCart([]); syncCartButtons(); closeDrawer();
        toast(t('bought'), 'success');
        if (b.txid) window.open('https://mempool.space/tx/' + b.txid, '_blank', 'noopener');
        loadListings();
      }).catch(function (e) { toast(e.message, 'error'); }).then(function () { renderDrawer(); });
    });
  }

  /* ── wiring (all via addEventListener / delegation — CSP-safe) ──────── */
  function wire() {
    var conn = $('dmConnect'); if (conn) conn.addEventListener('click', function () { connect(false); });
    var sell = $('dmSellBtn'); if (sell) sell.addEventListener('click', openList);

    var sorts = $('dmSorts');
    if (sorts) sorts.addEventListener('click', function (e) {
      var b = e.target.closest('.dm-sort'); if (!b) return;
      sortMode = b.getAttribute('data-sort');
      sorts.querySelectorAll('.dm-sort').forEach(function (x) { x.classList.toggle('active', x === b); });
      renderGrid();
    });

    var grid = $('dmGrid');
    if (grid) {
      grid.addEventListener('click', function (e) {
        var act = e.target.closest('[data-action]');
        if (act) {
          e.stopPropagation();
          var oid = act.getAttribute('data-order'), a = act.getAttribute('data-action');
          if (a === 'buy') openBuy(oid);
          else if (a === 'cart') toggleCart(oid);
          else if (a === 'cancel') cancelListing(oid);
          return;
        }
        var card = e.target.closest('.dm-card');
        if (card && !card.classList.contains('own')) openBuy(card.getAttribute('data-order'));
      });
      grid.addEventListener('error', imgFallback, true);
    }

    /* buy modal */
    var buyBody = $('dmBuyBody');
    if (buyBody) buyBody.addEventListener('click', function (e) {
      var f = e.target.closest('.dm-fee'); if (f) pickFee(f.getAttribute('data-fee'));
    });
    var buyConfirm = $('dmBuyConfirm'); if (buyConfirm) buyConfirm.addEventListener('click', confirmBuy);

    /* list modal */
    var myRunesBox = $('dmMyRunes');
    if (myRunesBox) myRunesBox.addEventListener('click', function (e) {
      var p = e.target.closest('[data-rune]'); if (p) pickRune(Number(p.getAttribute('data-rune')));
    });
    var pkgBox = $('dmMyPackages');
    if (pkgBox) pkgBox.addEventListener('click', function (e) {
      var p = e.target.closest('[data-pkg]'); if (p) pickPackage(Number(p.getAttribute('data-pkg')));
    });
    var la = $('dmListAmount'); if (la) la.addEventListener('input', updateSummary);
    var lp = $('dmListPrice'); if (lp) lp.addEventListener('input', updateSummary);
    var lmax = $('dmListMax'); if (lmax) lmax.addEventListener('click', function () {
      if (pickedRune) { $('dmListAmount').value = pickedRune._pkgAmount || pickedRune.amount; updateSummary(); }
    });
    var createBtn = $('dmCreateBtn'); if (createBtn) createBtn.addEventListener('click', createListing);

    /* back buttons + close (data-back / data-close) */
    document.body.addEventListener('click', function (e) {
      var back = e.target.closest('[data-back]');
      if (back) { showStep(Number(back.getAttribute('data-back'))); return; }
      var close = e.target.closest('[data-close]');
      if (close) { if (close.getAttribute('data-close') === 'buy') closeBuy(); else closeList(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (!$('dmBuyModal').hidden) closeBuy();
        else if (!$('dmListModal').hidden) closeList();
        else closeDrawer();
      }
    });

    /* image fallbacks anywhere on the page */
    document.body.addEventListener('error', imgFallback, true);
    buildCartDom();
  }
  function imgFallback(e) {
    var img = e.target;
    if (img && img.tagName === 'IMG' && img.getAttribute('data-fallback')) img.style.display = 'none';
  }
  function buildCartDom() {
    if ($('dmCartFab')) return;
    var fab = document.createElement('button');
    fab.id = 'dmCartFab'; fab.className = 'dm-cart-fab';
    fab.innerHTML = '🛒 <span data-i18n-skip>Bundle</span> <span class="n">0</span>';
    fab.addEventListener('click', openDrawer);
    document.body.appendChild(fab);
    var scrim = document.createElement('div');
    scrim.id = 'dmCartScrim'; scrim.className = 'dm-drawer-scrim';
    scrim.addEventListener('click', closeDrawer);
    document.body.appendChild(scrim);
    var drawer = document.createElement('div');
    drawer.id = 'dmCartDrawer'; drawer.className = 'dm-drawer';
    drawer.innerHTML = '<div class="dm-drawer-head"><h3>🛒 Bundle</h3><button type="button" id="dmDrawerClose" aria-label="Close">×</button></div>' +
      '<div class="dm-cart-items" id="dmCartItems"></div><div class="dm-cart-foot" id="dmCartFoot"></div>';
    document.body.appendChild(drawer);
    $('dmDrawerClose').addEventListener('click', closeDrawer);
    drawer.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-rm]');
      if (rm) { saveCart(getCart().filter(function (i) { return i.order_id !== rm.getAttribute('data-rm'); })); syncCartButtons(); renderDrawer(); return; }
      if (e.target.id === 'dmBundleBuy') buyBundle();
    });
    updateFab();
  }

  /* ── init ──────────────────────────────────────────────────────────── */
  function init() {
    wire();
    loadRune();
    loadListings();
    /* returning visitor: silent reconnect once the extension injects */
    var wants = false;
    try { wants = localStorage.getItem('walletType') === 'kraywallet' && !!localStorage.getItem('walletAddress'); } catch (e) {}
    if (wants) {
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (kw()) { clearInterval(timer); connect(true); }
        else if (tries > 12) clearInterval(timer); }, 250);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
