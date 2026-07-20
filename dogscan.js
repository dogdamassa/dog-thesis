/* DOG ARMY. DogScan — on-site block explorer running on the full KrayScan
   API (kray.space, used with KRAY's authorization). Searches L1 txs,
   addresses, inscriptions, runes and KRAY L2 (Origin Layer) txs;
   everything renders here, nothing leaves the site. Data comes from
   /api/scan (our proxy — KRAY blocks foreign-Origin CORS). External file
   on purpose: script-src 'self'. No inline handlers for the same reason. */
(function () {
  var KRAY_IMG = 'https://www.kray.space'; /* allowed by img-src */
  var TOKEN_DIV = { KRAY: 0, DOG: 5, DSC: 0, RADIOLA: 2 };
  var MAX_GRID = 60;   /* inscriptions shown per grid */
  var MAX_LIST = 25;   /* tx / utxo rows */

  /* Wallet labels shown next to top holders — only the type:"official" entries
     of the public registry dogdata.xyz/data/verified_addresses.json (curated,
     paid-verification). No guessed/heuristic labels here. */
  var KNOWN_ADDR = {
    'bc1p50n9sksy5gwe6fgrxxsqfcp6ndsfjhykjqef64m8067hfadd9efqrhpp9k': 'Bitget',
    'bc1pk8g4rztfkxs2q9c40g6keeknjw6aadx3kzu4suzlll0remfw7xxs5x9ctv': 'Gate.io',
    'bc1qj7dam98j6ktjcp320qu77y2vrylv49c2k2hkmu': 'MEXC',
    'bc1p38d6mfutw5h6gx46c7334uxtsf5ey5l7xqfeg36gyc4q83plmwwqsf9wxd': 'Merlin Chain',
    'bc1qcmj5lkumeycyn35lxc3yr32k3fzue87yrjrna6': 'Merlin Chain',
    'bc1pz66497g7mj8cq0ncj2hjjfxcxuzv44yxnlach5puypf39ghejmaq20zgne': 'Dog of Bitcoin treasury',
    'bc1pwper8wpfssxl4pd5grudsvcwxc8pecerxm46flmupj9n8l675rtsehu659': 'DotSwap',
    'bc1pxk7aw9ug55jkkz02z7ayhlkxxq92ya0ctegcwm5j8jumgaavjlkqdylk2p': 'DogData Treasury'
  };
  /* segment colors for the distribution bar — pair validated for CVD + contrast
     on the #030303 surface; "others" wears the de-emphasis gray on purpose */
  var SEG_TOP10 = '#ea5303', SEG_MID = '#6577f3', SEG_OTHERS = 'rgba(255,255,255,.22)';
  var BURN_RED = '#e5484d';

  function $(id) { return document.getElementById(id); }
  var PANES = ['tx-content', 'address-content', 'inscription-content', 'rune-content', 'l2tx-content'];

  /* ---------- tiny utils ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function short(h, n) {
    h = String(h || '');
    n = n || 8;
    return h.length > n * 2 + 3 ? h.slice(0, n) + '…' + h.slice(-n) : h;
  }
  function fmtNum(v, maxFrac) {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toLocaleString('en-US', { maximumFractionDigits: maxFrac == null ? 0 : maxFrac });
  }
  function fmtBtc(sats) {
    if (sats == null || isNaN(sats)) return '—';
    return (Number(sats) / 1e8).toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' BTC';
  }
  /* 99,975,593,202 → "99.98B" — stat tiles show the compact figure, the exact
     value rides in the tile's title/sub line */
  function fmtCompact(n) {
    if (n == null || isNaN(n)) return '—';
    n = Number(n);
    var abs = Math.abs(n);
    if (abs >= 1e12) return fmtNum(n / 1e12, 2) + 'T';
    if (abs >= 1e9) return fmtNum(n / 1e9, 2) + 'B';
    if (abs >= 1e6) return fmtNum(n / 1e6, 2) + 'M';
    return fmtNum(n, 2);
  }
  function fmtSats(sats) { return fmtNum(sats) + ' sats'; }
  function fmtTime(ts) {
    if (!ts) return '—';
    var d = typeof ts === 'number' ? new Date(ts * (ts < 1e12 ? 1000 : 1)) : new Date(ts);
    return isNaN(d) ? '—' : d.toUTCString().replace('GMT', 'UTC');
  }
  function tokenAmt(raw, sym) {
    var div = TOKEN_DIV[sym];
    var n = Number(raw);
    if (isNaN(n)) return esc(raw);
    if (div == null || div === 0) return fmtNum(n);
    return fmtNum(n / Math.pow(10, div), div);
  }
  /* internal search link — stays on this page */
  function linkQ(q, label, cls) {
    return '<a class="' + (cls || 'ks-link') + '" data-q="' + esc(q) + '" href="/dogscan?q=' + encodeURIComponent(q) + '">' + (label || esc(q)) + '</a>';
  }
  function row(k, vHtml) {
    return '<div class="info-row"><span class="info-key">' + k + '</span><span class="info-value">' + vHtml + '</span></div>';
  }
  function thumbUrl(pathOrId) {
    var p = String(pathOrId || '');
    if (/^[0-9a-f]{64}i[0-9]+$/i.test(p)) p = '/api/rune-thumbnail/' + p;
    return KRAY_IMG + (p.charAt(0) === '/' ? p : '/' + p);
  }

  /* ---------- state machine ---------- */
  function hideAll() {
    $('loading').style.display = 'none';
    $('error').style.display = 'none';
    for (var i = 0; i < PANES.length; i++) $(PANES[i]).style.display = 'none';
  }
  /* bring the result region into view past the sticky header — without this a
     phone-sized viewport keeps the search card on screen and the result renders
     below the fold, so a search looks like it did nothing */
  function revealTo(el, instant) {
    try {
      var header = document.querySelector('header');
      var offset = (header ? header.getBoundingClientRect().height : 0) + 16;
      var y = el.getBoundingClientRect().top + (window.pageYOffset || 0) - offset;
      window.scrollTo({ top: y > 0 ? y : 0, behavior: instant ? 'auto' : 'smooth' });
    } catch (e) { /* older browsers / no smooth scroll — harmless */ }
  }
  function showLoading() { hideAll(); $('loading').style.display = 'flex'; revealTo($('loading')); }
  function showError(msg) {
    hideAll();
    $('error-message').textContent = msg;
    $('error').style.display = 'block';
    revealTo($('error'));
  }
  /* CSP: no inline onerror — wire image fallbacks after innerHTML */
  function wireFallbacks(el) {
    var imgs = el.querySelectorAll('img[data-fallback]');
    for (var i = 0; i < imgs.length; i++) {
      imgs[i].addEventListener('error', function () {
        var fb = document.createElement('div');
        fb.className = this.getAttribute('data-fbclass') || 'ks-fallback';
        fb.textContent = this.getAttribute('data-fallback') || '◉';
        this.parentNode.replaceChild(fb, this);
      });
    }
  }
  function showPane(id, html) {
    hideAll();
    var el = $(id);
    el.innerHTML = html;
    wireFallbacks(el);
    el.style.display = 'block';
    /* re-anchor on the freshly rendered result — the showLoading() scroll raced
       the fetch, so where the viewport ended up depended on response timing;
       instant so a half-finished smooth scroll can't strand the viewport */
    revealTo(el, true);
  }

  /* ---------- input detection (same rules as kray.space's explorer) ---------- */
  function detect(input) {
    var q = String(input || '').trim();
    if (!q) return null;
    if (/^[0-9a-f]{64}i[0-9]+$/i.test(q)) return q;
    if (/^[0-9a-f]{64}$/i.test(q)) return q;
    if (/^l2:[0-9a-z_-]{6,80}$/i.test(q)) return q;
    if (/^[0-9]{1,12}$/.test(q)) return q;               /* inscription number */
    if (/^[0-9]{1,9}:[0-9]{1,6}$/.test(q)) return q;      /* rune id */
    if (/^bc1[a-z0-9]{20,90}$/i.test(q)) return q;
    if (/^[13][a-km-zA-HJ-NP-Z1-9]{20,40}$/.test(q)) return q;
    var name = q.replace(/^\$/, ''); /* "$DOG" → "DOG"; the proxy maps tickers */
    if (/^[A-Za-z.• -]{1,50}$/.test(name)) return name.toUpperCase(); /* rune name */
    return null;
  }

  /* ---------- search ---------- */
  var searching = false;
  function search(input, push) {
    var q = detect(input);
    if (!q) {
      showError('Invalid input. Please enter a valid transaction ID, address, inscription ID, or rune name');
      return;
    }
    if (searching) return;
    searching = true;
    $('searchInput').value = q;
    if (push !== false) {
      try { history.pushState({ q: q }, '', '/dogscan?q=' + encodeURIComponent(q)); } catch (e) { /* file:// etc. */ }
    }
    showLoading();
    fetch('/api/scan?q=' + encodeURIComponent(q))
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        searching = false;
        if (!res.ok || !res.j.success) {
          showError(res.j && res.j.error === 'not-found'
            ? 'Nothing found for this query — not on Bitcoin L1 nor on the KRAY L2.'
            : 'Error loading data. Please try again.');
          return;
        }
        var t = res.j.type, d = res.j.data;
        if (t === 'tx') renderTx(d);
        else if (t === 'address') renderAddress(d);
        else if (t === 'inscription') renderInscription(d);
        else if (t === 'rune') renderRune(d);
        else if (t === 'l2tx') renderL2Tx(d);
        else showError('Unknown result type.');
      })
      .catch(function () {
        searching = false;
        showError('Network error. Please try again.');
      });
  }

  /* ---------- renderers ---------- */
  function renderTx(d) {
    var tx = d.tx || {}, an = d.analysis || {}, blk = d.block || {};
    var confirmed = an.confirmed || (tx.confirmations || 0) > 0;
    var badges =
      '<span class="status-badge ' + (confirmed ? 'status-confirmed' : 'status-pending') + '">' +
        (confirmed ? '✓ Confirmed · ' + fmtNum(an.confirmations || tx.confirmations) + ' confirmations' : '⏳ Pending') +
      '</span>' +
      (an.fee != null ? '<span class="status-badge">Fee ' + fmtSats(an.fee) + (an.feeRate ? ' · ' + esc(an.feeRate) + ' sat/vB' : '') + '</span>' : '') +
      (blk.height ? '<span class="status-badge status-accent">Block ' + fmtNum(blk.height) + '</span>' : '') +
      '<a class="status-badge" href="https://mempool.space/tx/' + esc(tx.txid) + '" target="_blank" rel="noopener">mempool.space ↗</a>';

    var overview =
      '<div class="info-card"><h3 class="card-title">📋 Overview</h3>' +
      row('Block', blk.height ? fmtNum(blk.height) + (blk.hash ? ' · <span title="' + esc(blk.hash) + '">' + esc(short(blk.hash, 6)) + '</span>' : '') : 'mempool') +
      row('Time', esc(fmtTime(tx.time || an.timestamp))) +
      row('Size / vSize', fmtNum(tx.size) + ' B / ' + fmtNum(an.vsize) + ' vB') +
      row('Weight', fmtNum(tx.weight) + ' WU') +
      row('Version', esc(tx.version)) +
      row('Locktime', esc(tx.locktime)) +
      '</div>';

    var vins = tx.vin || [];
    var inHtml = '';
    var inTotal = 0;
    for (var i = 0; i < Math.min(vins.length, MAX_LIST); i++) {
      var vin = vins[i];
      if (vin.coinbase) {
        inHtml += '<div class="list-item"><div class="item-index">Coinbase</div><div class="item-content">New coins (block reward)</div></div>';
        continue;
      }
      var pv = vin.prevout || {};
      inTotal += pv.value || 0;
      inHtml +=
        '<div class="list-item"><div class="item-index">#' + i + ' · ' + esc(short(vin.txid, 6)) + ':' + esc(vin.vout) + '</div>' +
        '<div class="item-content">' + (pv.scriptpubkey_address ? linkQ(pv.scriptpubkey_address) : '<em>' + esc(pv.scriptpubkey_type || 'unknown') + '</em>') + '</div>' +
        (pv.value != null ? '<div class="item-value">' + fmtBtc(pv.value) + '</div><div class="item-meta">' + fmtSats(pv.value) + '</div>' : '') +
        '</div>';
    }
    if (vins.length > MAX_LIST) inHtml += '<div class="item-meta">…and ' + (vins.length - MAX_LIST) + ' more inputs</div>';

    var vouts = tx.vout || [];
    var outHtml = '';
    var outTotal = 0;
    for (var j = 0; j < Math.min(vouts.length, MAX_LIST); j++) {
      var vo = vouts[j], spk = vo.scriptPubKey || {};
      var satsOut = Math.round((vo.value || 0) < 1 && !Number.isInteger(vo.value) ? vo.value * 1e8 : vo.value);
      outTotal += satsOut;
      outHtml +=
        '<div class="list-item"><div class="item-index">Output #' + esc(vo.n != null ? vo.n : j) + '</div>' +
        '<div class="item-content">' + (spk.address ? linkQ(spk.address) : '<em>' + esc(spk.type || 'nonstandard') + '</em>') + '</div>' +
        '<div class="item-value">' + fmtBtc(satsOut) + '</div><div class="item-meta">' + fmtSats(satsOut) + '</div>' +
        '</div>';
    }
    if (vouts.length > MAX_LIST) outHtml += '<div class="item-meta">…and ' + (vouts.length - MAX_LIST) + ' more outputs</div>';

    var io =
      '<div class="info-card"><h3 class="card-title">⬇️ Inputs (' + vins.length + ')</h3><div class="list-items">' + inHtml + '</div></div>' +
      '<div class="info-card"><h3 class="card-title">⬆️ Outputs (' + vouts.length + ')</h3><div class="list-items">' + outHtml + '</div></div>';

    var extra = '';
    if (d.inscriptions && d.inscriptions.length) {
      extra += '<div class="list-section"><h2 class="section-title">◉ Inscriptions in this transaction</h2><div class="inscriptions-grid">' +
        d.inscriptions.slice(0, MAX_GRID).map(inscCardHtml).join('') + '</div></div>';
    }
    if (d.runes && d.runes.length) {
      extra += '<div class="list-section"><h2 class="section-title">⧈ Runes activity</h2><div class="runes-grid">' +
        d.runes.map(function (r) { return runeCardHtml(r); }).join('') + '</div></div>';
    }

    showPane('tx-content',
      '<div class="content-header"><div class="content-label">Transaction</div>' +
      '<div class="content-hash">' + esc(tx.txid) + '</div>' +
      '<div class="content-badges">' + badges + '</div></div>' +
      '<div class="info-grid">' + overview + io + '</div>' + extra);
  }

  function renderAddress(d) {
    var btc = d.bitcoin || {};
    var runes = d.runes || [], inscs = d.inscriptions || [], txs = d.transactions || [], utxos = d.utxos || [];
    var l2bals = (d.l2 && d.l2.balances) || [];
    var badges =
      '<span class="status-badge">' + fmtNum(utxos.length) + ' UTXOs</span>' +
      '<span class="status-badge">' + fmtNum(txs.length) + ' transactions</span>' +
      (inscs.length ? '<span class="status-badge status-accent">◉ ' + fmtNum(inscs.length) + ' inscriptions</span>' : '') +
      (runes.length ? '<span class="status-badge status-accent">⧈ ' + fmtNum(runes.length) + ' runes</span>' : '') +
      (l2bals.length ? '<span class="status-badge status-accent">⚡ ' + fmtNum(l2bals.length) + ' L2 ' + (l2bals.length === 1 ? 'token' : 'tokens') + '</span>' : '') +
      '<a class="status-badge" href="https://mempool.space/address/' + esc(d.address) + '" target="_blank" rel="noopener">mempool.space ↗</a>';

    var html =
      '<div class="content-header"><div class="content-label">Address</div>' +
      '<div class="content-hash">' + esc(d.address) + '</div>' +
      '<div class="content-badges">' + badges + '</div></div>' +
      '<div class="balance-card"><div class="balance-amount">' + fmtBtc(btc.total) + '</div>' +
      '<div class="balance-label">' + fmtSats(btc.confirmed) + ' confirmed' +
      (btc.unconfirmed ? ' · ' + fmtSats(btc.unconfirmed) + ' unconfirmed' : '') + '</div></div>';

    /* L2 · Origin Layer balances (KRAY's L2). The /balances endpoint self-describes
       each token's divisibility, so we format straight off it — no local table. Only
       non-zero balances come back, and the whole block only shows for taproot accounts
       that hold something on the L2. */
    if (l2bals.length) {
      html += '<div class="list-section"><h2 class="section-title">⚡ Origin Layer balances ' +
        '<span class="status-badge status-accent">KRAY L2</span></h2><div class="runes-grid">' +
        l2bals.map(function (b) {
          var div = Number(b.divisibility) || 0;
          var raw = Number(b.balance);
          var amt = div ? raw / Math.pow(10, div) : raw;
          var sym = b.token_symbol || '';
          var nm = b.token_name || sym;
          return '<div class="rune-card"><div class="rune-header">' +
            '<div class="rune-symbol-fallback">' + esc(b.emoji || '⚡') + '</div>' +
            '<div class="rune-info"><div class="rune-name">' + linkQ(nm, esc(nm)) + '</div>' +
            '<div class="item-meta">' + esc(sym) + ' · Origin Layer</div></div></div>' +
            '<div class="rune-amount">' + (isNaN(amt) ? esc(b.balance) : fmtNum(amt, div)) + '</div></div>';
        }).join('') + '</div></div>';
    }

    if (runes.length) {
      html += '<div class="list-section"><h2 class="section-title">⧈ Runes (' + runes.length + ')</h2><div class="runes-grid">' +
        runes.map(function (r) {
          var amt = r.divisibility ? Number(r.amount) / Math.pow(10, r.divisibility) : Number(r.amount);
          return '<div class="rune-card"><div class="rune-header">' +
            '<div class="rune-symbol-fallback">' + esc(r.symbol || '⧈') + '</div>' +
            '<div class="rune-info"><div class="rune-name">' + linkQ(r.name, esc(r.name)) + '</div></div></div>' +
            '<div class="rune-amount">' + fmtNum(amt, 2) + '</div></div>';
        }).join('') + '</div></div>';
    }

    if (inscs.length) {
      html += '<div class="list-section"><h2 class="section-title">◉ Inscriptions (' + inscs.length + ')</h2><div class="inscriptions-grid">' +
        inscs.slice(0, MAX_GRID).map(inscCardHtml).join('') + '</div>' +
        (inscs.length > MAX_GRID ? '<div class="item-meta" style="margin-top:12px">Showing ' + MAX_GRID + ' of ' + inscs.length + '</div>' : '') +
        '</div>';
    }

    if (txs.length) {
      html += '<div class="list-section"><h2 class="section-title">📜 Transactions (' + txs.length + ')</h2><div class="list-items">' +
        txs.slice(0, MAX_LIST).map(function (t) {
          return '<div class="list-item"><div class="item-index">' +
            (t.confirmed ? '✓ Block ' + fmtNum(t.blockHeight) : '⏳ Pending') + ' · ' + esc(fmtTime(t.blockTime)) + '</div>' +
            '<div class="item-content">' + linkQ(t.txid) + '</div>' +
            (t.fee != null ? '<div class="item-meta">Fee ' + fmtSats(t.fee) + '</div>' : '') + '</div>';
        }).join('') +
        (txs.length > MAX_LIST ? '<div class="item-meta">Showing ' + MAX_LIST + ' of ' + txs.length + '</div>' : '') +
        '</div></div>';
    }

    showPane('address-content', html);
  }

  function inscCardHtml(it) {
    var id = it.inscriptionId || it.id || '';
    var num = it.inscriptionNumber != null ? it.inscriptionNumber : it.number;
    var src = it.contentUrl ? thumbUrl(it.contentUrl) : thumbUrl(id);
    return '<a class="inscription-card" data-q="' + esc(id) + '" href="/dogscan?q=' + encodeURIComponent(id) + '">' +
      '<div class="inscription-preview"><img src="' + esc(src) + '" alt="" loading="lazy" data-fallback="◉"></div>' +
      '<div class="inscription-info"><div class="inscription-number">' + (num != null ? '#' + fmtNum(num) : esc(short(id, 6))) + '</div></div></a>';
  }

  function runeCardHtml(r) {
    var name = r.spacedName || r.spaced_rune || r.name || r.rune || 'Rune';
    var amt = r.amount != null ? (r.divisibility ? Number(r.amount) / Math.pow(10, r.divisibility) : Number(r.amount)) : null;
    return '<div class="rune-card"><div class="rune-header">' +
      '<div class="rune-symbol-fallback">' + esc(r.symbol || '⧈') + '</div>' +
      '<div class="rune-info"><div class="rune-name">' + linkQ(name, esc(name)) + '</div></div></div>' +
      (amt != null && !isNaN(amt) ? '<div class="rune-amount">' + fmtNum(amt, 2) + '</div>' : '') + '</div>';
  }

  function renderInscription(insc) {
    var id = insc.inscriptionId || '';
    var charms = (insc.charms || []).map(function (c) {
      return '<span class="status-badge status-accent">' + esc(c) + '</span>';
    }).join('');
    var badges =
      (insc.inscriptionNumber != null ? '<span class="status-badge status-confirmed">◉ #' + fmtNum(insc.inscriptionNumber) + '</span>' : '') +
      (insc.contentType ? '<span class="status-badge">' + esc(insc.contentType) + '</span>' : '') +
      charms +
      '<a class="status-badge" href="https://ordinals.com/inscription/' + esc(id) + '" target="_blank" rel="noopener">ordinals.com ↗</a>';

    var details =
      '<div class="info-card"><h3 class="card-title">📋 Details</h3>' +
      row('Number', insc.inscriptionNumber != null ? '#' + fmtNum(insc.inscriptionNumber) : '—') +
      row('Owner', insc.address ? linkQ(insc.address, esc(short(insc.address, 10))) : '—') +
      row('Content type', esc(insc.contentType || '—')) +
      row('Content length', insc.contentLength != null ? fmtNum(insc.contentLength) + ' bytes' : '—') +
      row('Output value', insc.outputValue != null ? fmtSats(insc.outputValue) : '—') +
      row('Sat', insc.sat != null ? fmtNum(insc.sat) : '—') +
      row('Created', esc(fmtTime(insc.timestamp))) +
      row('Genesis height', insc.genesisHeight != null ? fmtNum(insc.genesisHeight) : '—') +
      row('Genesis fee', insc.genesisFee != null ? fmtSats(insc.genesisFee) : '—') +
      row('Location', insc.location ? '<span title="' + esc(insc.location) + '">' + esc(short(insc.location, 10)) + '</span>' : '—') +
      '</div>';

    var hero =
      '<div class="info-card"><div class="insc-hero">' +
      '<img src="' + esc(thumbUrl(id)) + '" alt="Inscription ' + esc(short(id, 6)) + '" data-fallback="◉" data-fbclass="ks-fallback">' +
      '</div></div>';

    var extra = '';
    if (insc.parents && insc.parents.length) {
      extra += '<div class="list-section"><h2 class="section-title">⬆️ Parents (' + insc.parents.length + ')</h2><div class="list-items">' +
        insc.parents.slice(0, 8).map(function (p) {
          return '<div class="list-item"><div class="item-content">' + linkQ(p) + '</div></div>';
        }).join('') + '</div></div>';
    }
    if (insc.children && insc.children.length) {
      extra += '<div class="list-section"><h2 class="section-title">⬇️ Children (' + fmtNum(insc.children.length) + ')</h2><div class="inscriptions-grid">' +
        insc.children.slice(0, 12).map(function (c) { return inscCardHtml({ inscriptionId: c }); }).join('') + '</div>' +
        (insc.children.length > 12 ? '<div class="item-meta" style="margin-top:12px">Showing 12 of ' + fmtNum(insc.children.length) + '</div>' : '') +
        '</div>';
    }

    showPane('inscription-content',
      '<div class="content-header"><div class="content-label">Inscription</div>' +
      '<div class="content-hash">' + esc(id) + '</div>' +
      '<div class="content-badges">' + badges + '</div></div>' +
      '<div class="info-grid">' + hero + details + '</div>' + extra);
  }

  /* one icon stat tile for the supply / distribution grids */
  function statTile(ico, label, value, sub, exact) {
    return '<div class="stat-tile"' + (exact ? ' title="' + esc(exact) + '"' : '') + '>' +
      '<div class="stat-label">' + ico + ' ' + label + '</div>' +
      '<div class="stat-value">' + value + '</div>' +
      (sub ? '<div class="stat-sub">' + sub + '</div>' : '') +
      '</div>';
  }

  /* 4-axis radar with the decentralization score in the middle. Inline SVG,
     no libs (CSP script-src 'self'). Values are 0–100 per axis. */
  function radarSvg(m, score) {
    var cx = 160, cy = 122, R = 84;
    var axes = [
      { label: 'DISTRIBUTION', v: m.distribution, a: -90 },
      { label: 'HOLDERS', v: m.holders, a: 0 },
      { label: 'SPREAD', v: m.spread, a: 90 },
      { label: 'DECENTR.', v: m.concentration, a: 180 }
    ];
    function pt(deg, r) {
      var rad = deg * Math.PI / 180;
      return (cx + r * Math.cos(rad)).toFixed(1) + ',' + (cy + r * Math.sin(rad)).toFixed(1);
    }
    var grid = '';
    for (var g = 1; g <= 4; g++) {
      grid += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R * g / 4) + '" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="1"/>';
    }
    grid += '<line x1="' + cx + '" y1="' + (cy - R) + '" x2="' + cx + '" y2="' + (cy + R) + '" stroke="rgba(255,255,255,.07)" stroke-width="1"/>' +
      '<line x1="' + (cx - R) + '" y1="' + cy + '" x2="' + (cx + R) + '" y2="' + cy + '" stroke="rgba(255,255,255,.07)" stroke-width="1"/>';
    var pts = [], dots = '', labels = '';
    for (var i = 0; i < axes.length; i++) {
      var ax = axes[i];
      var v = Math.max(0, Math.min(100, Number(ax.v) || 0));
      var p = pt(ax.a, R * v / 100);
      pts.push(p);
      dots += '<circle cx="' + p.split(',')[0] + '" cy="' + p.split(',')[1] + '" r="4.5" fill="#ff7a1a" stroke="#030303" stroke-width="2"/>';
      var anchor = ax.a === 0 ? 'start' : (ax.a === 180 ? 'end' : 'middle');
      var lp = pt(ax.a, R + 14).split(',');
      var ly = ax.a === -90 ? Number(lp[1]) - 2 : (ax.a === 90 ? Number(lp[1]) + 8 : Number(lp[1]) + 3);
      labels += '<text x="' + lp[0] + '" y="' + ly + '" text-anchor="' + anchor + '" class="radar-axis">' + ax.label + '</text>';
    }
    return '<svg viewBox="0 0 320 250" role="img" aria-label="Decentralization score ' + score + ' of 100">' +
      grid +
      '<polygon points="' + pts.join(' ') + '" fill="rgba(255,92,0,.16)" stroke="#ff7a1a" stroke-width="2" stroke-linejoin="round"/>' +
      dots +
      '<text x="' + cx + '" y="' + (cy + 8) + '" text-anchor="middle" class="radar-score">' + score + '</text>' +
      '<text x="' + cx + '" y="' + (cy + 26) + '" text-anchor="middle" class="radar-axis">SCORE</text>' +
      labels + '</svg>';
  }

  function renderRune(r) {
    var div = r.divisibility || 0;
    var sup = r.supply || {};
    var links = r.links || {};
    function u(v) { return v != null ? Number(v) / Math.pow(10, div) : null; } /* raw → display units */
    var total = u(sup.total), premine = u(sup.premine), minted = u(sup.minted),
        burned = u(sup.burned), circ = u(sup.circulating);
    function pctOf(part) { return total && part != null ? part / total * 100 : null; }
    /* "0.024%" for slivers, "99.98%" elsewhere, clean "100%" at the top */
    function pctStr(p) {
      if (p == null) return '—';
      if (p >= 99.995) return '100%';
      return p.toFixed(p > 0 && p < 0.1 ? 3 : 2) + '%';
    }

    var badges =
      '<span class="status-badge status-accent">⧈ ' + esc(r.id || '') + '</span>' +
      (r.number != null ? '<span class="status-badge">Rune #' + fmtNum(r.number) + '</span>' : '') +
      '<span class="status-badge">Divisibility ' + esc(div) + '</span>' +
      '<span class="status-badge ' + (r.mintable ? 'status-confirmed' : '') + '">' + (r.mintable ? '🟢 Mintable' : '🔒 Mint closed') + '</span>' +
      (/^https:\/\/ordinals\.com\//.test(links.ordinals || '') ? '<a class="status-badge" href="' + esc(links.ordinals) + '" target="_blank" rel="noopener">ordinals.com ↗</a>' : '');

    /* holders / distribution (folded in by the proxy from the same payload) */
    var hs = r.holders || {};
    var distr = hs.distribution || {};
    var top10 = parseFloat(distr.top10) || 0;
    var top50 = parseFloat(distr.top50) || 0;
    var others = parseFloat(distr.others) || (top50 ? 100 - top50 : 0);
    var totalHolders = Number(distr.totalHolders || hs.total || 0);

    /* ── hero header: avatar + badges + KPI strip ── */
    var avatar = r.thumbnail
      ? '<img class="rune-avatar" src="' + esc(thumbUrl(r.thumbnail)) + '" alt="" data-fallback="' + esc(r.symbol || '⧈') + '" data-fbclass="rune-avatar-fallback">'
      : '<div class="rune-avatar-fallback">' + esc(r.symbol || '⧈') + '</div>';
    var head =
      '<div class="content-header">' +
      '<div class="rune-hero">' + avatar +
      '<div style="min-width:0;flex:1">' +
      '<div class="content-label">Rune</div>' +
      '<div class="rune-title">' + esc(r.spacedName || r.name || '') +
      (r.symbol ? '<span class="rune-sym">' + esc(r.symbol) + '</span>' : '') + '</div>' +
      '<div class="content-badges">' + badges + '</div>' +
      '</div></div>' +
      '<div class="kpi-strip">' +
      '<div class="kpi"><div class="kpi-label">🪙 Total supply</div><div class="kpi-value is-accent"' +
        (total != null ? ' title="' + fmtNum(total, 2) + '"' : '') + '>' + fmtCompact(total) + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">👥 Holders</div><div class="kpi-value">' + (totalHolders ? fmtNum(totalHolders) : '—') + '</div></div>' +
      '<div class="kpi"><div class="kpi-label">🔥 Burned</div><div class="kpi-value is-burn"' +
        (burned ? ' title="' + fmtNum(burned, 2) + '"' : '') + '>' + (burned ? fmtCompact(burned) : '0') + '</div>' +
        (burned && pctOf(burned) != null ? '<div class="kpi-sub">' + pctStr(pctOf(burned)) + ' of supply</div>' : '') + '</div>' +
      '</div></div>';

    /* ── distribution: radar + score + share bar + tiles ── */
    var distHtml = '';
    if (top10 > 0 || top50 > 0) {
      /* same scoring formula as KrayScan's explorer, rendered our way */
      var top10Score = Math.max(0, 100 - top10);
      var othersScore = Math.min(100, others * 2);
      var holdersScore = Math.min(100, Math.log10(totalHolders + 1) * 25);
      var score = Math.round(top10Score * 0.4 + othersScore * 0.3 + holdersScore * 0.3);
      var metrics = {
        distribution: Math.min(100, others * 1.5),
        holders: holdersScore,
        concentration: top10Score,
        spread: Math.min(100, (100 - top10) + others / 2)
      };
      var decColor = score >= 70 ? '#34c759' : (score >= 40 ? '#ffb224' : BURN_RED);
      var decLabel = score >= 70 ? 'HIGH' : (score >= 40 ? 'MEDIUM' : 'LOW');
      var mid = Math.max(0, top50 - top10);
      var seg = function (val, color, label) {
        if (!(val > 0.05)) return '';
        return '<div class="share-seg" style="width:' + val + '%;background:' + color + '" title="' + label + ' · ' + pctStr(val) + '"></div>';
      };
      distHtml =
        '<div class="list-section"><h2 class="section-title">🥧 Distribution</h2>' +
        '<div class="dist-grid">' +
        '<div class="dist-radar">' + radarSvg(metrics, score) + '</div>' +
        '<div>' +
        '<div class="content-label">Decentralization</div>' +
        '<div class="decent-chip"><span class="decent-dot" style="background:' + decColor + '"></span>' + decLabel + '</div>' +
        '<div class="share-bar">' +
        seg(top10, SEG_TOP10, 'Top 10') + seg(mid, SEG_MID, 'Top 11–100') + seg(others, SEG_OTHERS, 'Others') +
        '</div>' +
        '<div class="stat-tiles dist-tiles">' +
        statTile('<span class="legend-dot" style="background:' + SEG_TOP10 + '"></span>', 'Top 10', pctStr(top10), 'of supply') +
        statTile('<span class="legend-dot" style="background:' + SEG_MID + '"></span>', 'Top 11–100', pctStr(mid), 'of supply') +
        statTile('<span class="legend-dot" style="background:' + SEG_OTHERS + '"></span>', 'Others', pctStr(others), 'of supply') +
        statTile('👥', 'Holders', totalHolders ? fmtNum(totalHolders) : '—', 'addresses') +
        '</div>' +
        '</div></div></div>';
    }

    /* ── supply: meter + icon tiles instead of key/value rows ── */
    var meter = '';
    if (total && circ != null) {
      meter =
        '<div class="meter-head"><span>Circulating</span><b>' + pctStr(pctOf(circ)) + '</b></div>' +
        '<div class="share-bar">' +
        '<div class="share-seg" style="width:' + Math.max(0.5, pctOf(circ)) + '%;background:' + SEG_TOP10 + '" title="Circulating · ' + pctStr(pctOf(circ)) + '"></div>' +
        (burned ? '<div class="share-seg" style="width:' + pctOf(burned) + '%;background:' + BURN_RED + '" title="Burned · ' + pctStr(pctOf(burned)) + '"></div>' : '') +
        '</div>' +
        (burned ? '<div class="stat-sub"><span class="legend-dot" style="background:' + SEG_TOP10 + '"></span>Circulating ' + pctStr(pctOf(circ)) +
          ' · <span class="legend-dot" style="background:' + BURN_RED + '"></span>Burned ' + pctStr(pctOf(burned)) + '</div>' : '');
    }
    var supply =
      '<div class="info-card"><h3 class="card-title">📊 Supply</h3>' + meter +
      '<div class="stat-tiles">' +
      statTile('🪙', 'Total', fmtCompact(total), null, total != null ? fmtNum(total, 2) : null) +
      statTile('⛏️', 'Premine', fmtCompact(premine), premine != null && total ? pctStr(pctOf(premine)) + ' of supply' : null, premine != null ? fmtNum(premine, 2) : null) +
      (minted ? statTile('✨', 'Minted', fmtCompact(minted), pctStr(pctOf(minted)) + ' of supply', fmtNum(minted, 2)) : '') +
      statTile('🔥', 'Burned', burned ? fmtCompact(burned) : '0', burned ? pctStr(pctOf(burned)) + ' of supply' : 'nothing burned', burned ? fmtNum(burned, 2) : null) +
      statTile('💧', 'Circulating', fmtCompact(circ), circ != null && total ? pctStr(pctOf(circ)) + ' of supply' : null, circ != null ? fmtNum(circ, 2) : null) +
      '</div></div>';

    var et = r.etching || {};
    var mt = r.mintTerms || {};
    var etching =
      '<div class="info-card"><h3 class="card-title">🪨 Etching</h3>' +
      row('Transaction', et.txid ? linkQ(et.txid, esc(short(et.txid, 10))) : '—') +
      row('Block', et.block != null ? fmtNum(et.block) : '—') +
      row('Time', esc(fmtTime(et.timestamp))) +
      row('Parent inscription', r.parent ? linkQ(r.parent, esc(short(r.parent, 8))) : '—') +
      (mt.cap != null ? row('Mint cap', fmtNum(mt.cap)) : '') +
      (mt.amount != null ? row('Per mint', fmtNum(u(mt.amount), 2)) : '') +
      '</div>';

    var holders = '';
    if (hs.top && hs.top.length) {
      var maxPct = parseFloat(hs.top[0].percentage) || 1;
      holders = '<div class="list-section"><h2 class="section-title">👥 Top holders' +
        (totalHolders ? ' <span class="status-badge">' + fmtNum(totalHolders) + ' total</span>' : '') + '</h2>' +
        '<div class="holders-scroll"><table class="holders-table"><thead><tr><th>#</th><th>Address</th><th>Balance</th><th style="min-width:140px">Share</th></tr></thead><tbody>' +
        hs.top.slice(0, 15).map(function (h, i) {
          var pct = parseFloat(h.percentage) || 0;
          var tag = KNOWN_ADDR[h.address] ? '<span class="holder-tag">' + esc(KNOWN_ADDR[h.address]) + '</span>' : '';
          return '<tr><td>' + (i + 1) + '</td>' +
            '<td>' + linkQ(h.address, esc(short(h.address, 8))) + tag + '</td>' +
            '<td>' + fmtNum(h.balance, 0) + '</td>' +
            '<td><div style="display:flex;align-items:center;gap:8px"><div class="holder-bar" style="width:' + Math.max(2, Math.round(pct / maxPct * 140)) + 'px"></div>' + esc(h.percentage) + '%</div></td></tr>';
        }).join('') + '</tbody></table></div>' +
        '<div class="item-meta" style="margin-top:12px">Top 15 of the indexed holder list · exchange labels come from the public <a class="ks-link" href="https://www.dogdata.xyz/data/verified_addresses.json" target="_blank" rel="noopener">dogdata.xyz verified registry</a></div>' +
        '</div>';
    }

    showPane('rune-content', head + distHtml + holders + '<div class="info-grid">' + supply + etching + '</div>');
  }

  function renderL2Tx(tx) {
    var sym = tx.token_symbol || 'KRAY';
    var badges =
      '<span class="status-badge ' + (tx.status === 'confirmed' ? 'status-confirmed' : 'status-pending') + '">' +
        (tx.status === 'confirmed' ? '✓ Confirmed' : '⏳ ' + esc(tx.status || 'pending')) + '</span>' +
      '<span class="status-badge status-accent">L2 · Origin Layer</span>' +
      '<span class="status-badge">' + esc((tx.tx_type || 'transfer').replace(/_/g, ' ')) + '</span>';

    var details =
      '<div class="info-card"><h3 class="card-title">📋 Details</h3>' +
      row('From', tx.from_account ? linkQ(tx.from_account, esc(short(tx.from_account, 10))) : '—') +
      row('To', tx.to_account ? linkQ(tx.to_account, esc(short(tx.to_account, 10))) : '—') +
      row('Amount', tokenAmt(tx.amount, sym) + ' ' + esc(sym)) +
      row('Gas fee', esc(tx.gas_fee || '1') + ' KRAY') +
      row('Time', esc(fmtTime(tx.created_at))) +
      (tx.batch_id ? row('Batch', esc(tx.batch_id)) : '') +
      (tx.memo ? row('Memo', esc(tx.memo)) : '') +
      '</div>';

    var raw = tx.tx_data || tx.data || tx.metadata;
    var dataCard = '';
    if (raw) {
      var pretty;
      try { pretty = JSON.stringify(typeof raw === 'string' ? JSON.parse(raw) : raw, null, 2); }
      catch (e) { pretty = String(raw); }
      dataCard = '<div class="info-card"><h3 class="card-title">🧾 Data</h3><pre class="item-script">' + esc(pretty) + '</pre></div>';
    }

    showPane('l2tx-content',
      '<div class="content-header"><div class="content-label">L2 Transaction · KRAY Origin Layer</div>' +
      '<div class="content-hash">' + esc(tx.id || '') + '</div>' +
      '<div class="content-badges">' + badges + '</div></div>' +
      '<div class="info-grid">' + details + dataCard + '</div>');
  }

  /* ---------- optional wallet connect (unlocks the DSC panel) ----------
     Search is public — the gate was removed. Connecting a KrayWallet only
     adds the "Your DOG•SOCIAL•CLUB" panel; it never blocks the explorer. */
  var DSC_PARENT = '8a18494da6e0d1902243220c397cdecf4de9d64020cf0fa9fa16adfc6e29e4eci0';
  var entered = false;

  function shortAddr(a) { a = String(a || ''); return a.slice(0, 8) + '…' + a.slice(-6); }
  function connStatus(html) { var s = $('ksConnectStatus'); if (s) s.innerHTML = html; }

  /* the wallet may hand back a string, an array, {address} or {accounts:[…]} */
  function pickAddr(r) {
    if (!r) return '';
    if (typeof r === 'string') return r;
    if (Array.isArray(r)) return r[0] || '';
    if (r.success === false) return '';
    return r.address || (Array.isArray(r.accounts) && r.accounts[0]) || '';
  }

  function enter(addr) {
    if (entered || !addr) return;
    entered = true;
    try { sessionStorage.setItem('ksAddr', addr); } catch (e) {}
    var chip = $('ksConnect'); if (chip) chip.hidden = true;
    connStatus('');
    var who = $('ksWho');
    who.innerHTML = 'Connected: <b>' + esc(shortAddr(addr)) + '</b> · ' + linkQ(addr, 'view wallet') + ' · <a href="/dogscan" id="ksLogout">disconnect</a>';
    who.hidden = false;
    $('ksLogout').addEventListener('click', function (e) {
      e.preventDefault();
      try { sessionStorage.removeItem('ksAddr'); } catch (er) {}
      location.href = '/dogscan';
    });
    loadDsc(addr);
  }

  function connectClick() {
    var w = window.krayWallet;
    if (!w) {
      connStatus('KRAY Wallet not found — <a href="https://kray.space/install-extension" target="_blank" rel="noopener">get it ↗</a> and reload.');
      return;
    }
    connStatus('Waiting for KRAY Wallet… check the extension popup.');
    Promise.resolve().then(function () { return w.requestAccounts(); }).then(function (r) {
      var addr = pickAddr(r);
      if (addr) enter(addr);
      else connStatus('Connection refused or wallet locked. Unlock the KRAY extension and try again.');
    }).catch(function () {
      connStatus('The wallet did not respond. Try again.');
    });
  }

  /* the extension may inject window.krayWallet after DOMContentLoaded — try a
     silent, non-prompting read so returning holders get their DSC panel back */
  function trySilent(attempt) {
    var w = window.krayWallet;
    if (!w) {
      if (attempt < 4) { setTimeout(function () { trySilent(attempt + 1); }, 350); return; }
      return; /* no wallet — search still works, chip stays for manual connect */
    }
    var silent = w.getAccounts || w.connect;
    if (!silent) return; /* only requestAccounts (prompts) — leave it to the chip */
    Promise.resolve().then(function () { return silent.call(w); }).then(function (r) {
      var addr = pickAddr(r);
      if (addr) enter(addr);
    }).catch(function () { /* silent — user can still click connect */ });
  }

  /* ---------- your DOG SOCIAL CLUB ordinals ---------- */
  function dscShell(inner) {
    return '<div class="list-section"><h2 class="section-title">🐾 Your DOG•SOCIAL•CLUB</h2>' + inner + '</div>';
  }
  function loadDsc(addr) {
    var box = $('ks-dsc');
    box.style.display = 'block';
    box.innerHTML = dscShell('<div class="ks-dsc-empty">Reading the chain for club ordinals…</div>');
    fetch('/api/dsc?address=' + encodeURIComponent(addr) + '&all=1')
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.success) throw new Error('upstream');
        var items = j.items || (j.dsc ? [j.dsc] : []);
        if (!items.length) {
          box.innerHTML = dscShell('<div class="ks-dsc-empty">No Dog Social Club ordinal in this wallet yet — the club has 306 pieces living on Bitcoin. ' +
            linkQ(DSC_PARENT, 'Explore the collection') + '.</div>');
          return;
        }
        box.innerHTML =
          '<div class="list-section"><h2 class="section-title">🐾 Your DOG•SOCIAL•CLUB ' +
          '<span class="status-badge status-confirmed">✓ ' + items.length + ' on chain</span></h2>' +
          '<div class="inscriptions-grid">' +
          items.map(function (it) { return inscCardHtml({ inscriptionId: it.id, inscriptionNumber: it.number }); }).join('') +
          '</div></div>';
        wireFallbacks(box);
      })
      .catch(function () {
        box.innerHTML = dscShell('<div class="ks-dsc-empty">Could not read the chain right now — reload to retry.</div>');
      });
  }

  /* ---------- wiring ---------- */
  function fromUrl() {
    var p = new URLSearchParams(location.search);
    return p.get('q') || p.get('txid') || p.get('address') || p.get('inscription') || p.get('rune') ||
      (p.get('l2tx') ? 'L2:' + p.get('l2tx') : '');
  }

  document.addEventListener('DOMContentLoaded', function () {
    $('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var v = $('searchInput').value.trim();
      if (!v) { showError('Please enter a transaction ID, address, or inscription ID'); return; }
      search(v);
    });

    var chip = $('ksConnect');
    if (chip) chip.addEventListener('click', connectClick);

    /* internal result links search in place */
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-q]') : null;
      if (!a) return;
      e.preventDefault();
      search(a.getAttribute('data-q')); /* revealTo() scrolls to the new result */
    });

    window.addEventListener('popstate', function () {
      var q = fromUrl();
      if (q) search(q, false); else hideAll();
    });

    /* search is public — run any q in the URL right away */
    var initial = fromUrl();
    if (initial) search(initial, false);

    /* optional: restore or silently reconnect the wallet for the DSC panel */
    var saved = null;
    try { saved = sessionStorage.getItem('ksAddr'); } catch (e) {}
    if (saved && /^bc1[a-z0-9]{20,90}$/i.test(saved)) enter(saved);
    else trySilent(0);
  });
})();
