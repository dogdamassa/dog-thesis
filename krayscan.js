/* DOG ARMY. KrayScan — on-site block explorer, frontend cloned from
   kray.space/krayscan. Searches L1 txs, addresses, inscriptions, runes
   and KRAY L2 (Origin Layer) txs; everything renders here, nothing
   leaves the site. Data comes from /api/scan (our proxy — KRAY blocks
   foreign-Origin CORS). External file on purpose: script-src 'self'.
   No inline handlers for the same reason (onerror etc. are inline JS). */
(function () {
  var KRAY_IMG = 'https://www.kray.space'; /* allowed by img-src */
  var TOKEN_DIV = { KRAY: 0, DOG: 5, DSC: 0, RADIOLA: 2 };
  var MAX_GRID = 60;   /* inscriptions shown per grid */
  var MAX_LIST = 25;   /* tx / utxo rows */

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
    return '<a class="' + (cls || 'ks-link') + '" data-q="' + esc(q) + '" href="/krayscan?q=' + encodeURIComponent(q) + '">' + (label || esc(q)) + '</a>';
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
  function showLoading() { hideAll(); $('loading').style.display = 'flex'; }
  function showError(msg) {
    hideAll();
    $('error-message').textContent = msg;
    $('error').style.display = 'block';
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
  }

  /* ---------- input detection (cloned from krayscan) ---------- */
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
      try { history.pushState({ q: q }, '', '/krayscan?q=' + encodeURIComponent(q)); } catch (e) { /* file:// etc. */ }
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
    var badges =
      '<span class="status-badge">' + fmtNum(utxos.length) + ' UTXOs</span>' +
      '<span class="status-badge">' + fmtNum(txs.length) + ' transactions</span>' +
      (inscs.length ? '<span class="status-badge status-accent">◉ ' + fmtNum(inscs.length) + ' inscriptions</span>' : '') +
      (runes.length ? '<span class="status-badge status-accent">⧈ ' + fmtNum(runes.length) + ' runes</span>' : '') +
      '<a class="status-badge" href="https://mempool.space/address/' + esc(d.address) + '" target="_blank" rel="noopener">mempool.space ↗</a>';

    var html =
      '<div class="content-header"><div class="content-label">Address</div>' +
      '<div class="content-hash">' + esc(d.address) + '</div>' +
      '<div class="content-badges">' + badges + '</div></div>' +
      '<div class="balance-card"><div class="balance-amount">' + fmtBtc(btc.total) + '</div>' +
      '<div class="balance-label">' + fmtSats(btc.confirmed) + ' confirmed' +
      (btc.unconfirmed ? ' · ' + fmtSats(btc.unconfirmed) + ' unconfirmed' : '') + '</div></div>';

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
    return '<a class="inscription-card" data-q="' + esc(id) + '" href="/krayscan?q=' + encodeURIComponent(id) + '">' +
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

  function renderRune(r) {
    var div = r.divisibility || 0;
    var sup = r.supply || {};
    function s(v) { return v != null ? fmtNum(Number(v) / Math.pow(10, div), 2) : '—'; }
    var badges =
      '<span class="status-badge status-accent">⧈ ' + esc(r.id || '') + '</span>' +
      (r.number != null ? '<span class="status-badge">Rune #' + fmtNum(r.number) + '</span>' : '') +
      '<span class="status-badge">Divisibility ' + esc(div) + '</span>' +
      '<span class="status-badge ' + (r.mintable ? 'status-confirmed' : '') + '">' + (r.mintable ? 'Mintable' : 'Mint closed') + '</span>';

    var head =
      '<div class="content-header"><div class="content-label">Rune</div>' +
      '<div class="content-hash">' +
      (r.thumbnail ? '<img src="' + esc(thumbUrl(r.thumbnail)) + '" alt="" style="width:44px;height:44px;border-radius:10px;vertical-align:middle;margin-right:12px" data-fallback="⧈" data-fbclass="rune-symbol-fallback">' : '') +
      esc(r.spacedName || r.name || '') + (r.symbol ? ' <span style="font-family:inherit">' + esc(r.symbol) + '</span>' : '') +
      '</div><div class="content-badges">' + badges + '</div></div>';

    var supply =
      '<div class="info-card"><h3 class="card-title">📊 Supply</h3>' +
      row('Circulating', s(sup.circulating)) +
      row('Total', s(sup.total)) +
      row('Premine', s(sup.premine)) +
      row('Minted', s(sup.minted)) +
      row('Burned', s(sup.burned)) +
      '</div>';

    var et = r.etching || {};
    var etching =
      '<div class="info-card"><h3 class="card-title">🪨 Etching</h3>' +
      row('Transaction', et.txid ? linkQ(et.txid, esc(short(et.txid, 10))) : '—') +
      row('Block', et.block != null ? fmtNum(et.block) : '—') +
      row('Time', esc(fmtTime(et.timestamp))) +
      row('Parent inscription', r.parent ? linkQ(r.parent, esc(short(r.parent, 8))) : '—') +
      '</div>';

    var holders = '';
    var hs = r.holders || {};
    if (hs.top && hs.top.length) {
      holders = '<div class="list-section"><h2 class="section-title">👥 Top holders' +
        (hs.total ? ' <span class="status-badge">' + fmtNum(hs.total) + ' total</span>' : '') + '</h2>' +
        '<div class="holders-scroll"><table class="holders-table"><thead><tr><th>#</th><th>Address</th><th>Balance</th><th style="min-width:140px">Share</th></tr></thead><tbody>' +
        hs.top.slice(0, 15).map(function (h, i) {
          var pct = parseFloat(h.percentage) || 0;
          return '<tr><td>' + (i + 1) + '</td>' +
            '<td>' + linkQ(h.address, esc(short(h.address, 8))) + '</td>' +
            '<td>' + fmtNum(h.balance, 0) + '</td>' +
            '<td><div style="display:flex;align-items:center;gap:8px"><div class="holder-bar" style="width:' + Math.min(100, pct * 6) + 'px"></div>' + esc(h.percentage) + '%</div></td></tr>';
        }).join('') + '</tbody></table></div></div>';
    }

    showPane('rune-content', head + '<div class="info-grid">' + supply + etching + '</div>' + holders);
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

  /* ---------- wallet gate: KrayWallet holders only ---------- */
  var DSC_PARENT = '8a18494da6e0d1902243220c397cdecf4de9d64020cf0fa9fa16adfc6e29e4eci0';
  var entered = false;

  function shortAddr(a) { a = String(a || ''); return a.slice(0, 8) + '…' + a.slice(-6); }

  function showGate(noWallet) {
    $('ks-gate').style.display = 'block';
    $('ks-app').style.display = 'none';
    if (noWallet) {
      $('ksInstall').hidden = false;
      $('ksGateStatus').textContent = 'KRAY Wallet not found in this browser. Install it and reload — it takes a minute.';
    }
  }

  function enter(addr) {
    if (entered) return;
    entered = true;
    try { sessionStorage.setItem('ksAddr', addr); } catch (e) {}
    $('ks-gate').style.display = 'none';
    $('ks-app').style.display = 'block';
    var who = $('ksWho');
    who.innerHTML = 'Connected: <b>' + esc(shortAddr(addr)) + '</b> · ' + linkQ(addr, 'view wallet') + ' · <a href="/krayscan" id="ksLogout">disconnect</a>';
    who.hidden = false;
    $('ksLogout').addEventListener('click', function (e) {
      e.preventDefault();
      try { sessionStorage.removeItem('ksAddr'); } catch (er) {}
      location.href = '/krayscan';
    });
    loadDsc(addr);
    var initial = fromUrl();
    if (initial) search(initial, false);
  }

  function connectClick() {
    var w = window.krayWallet;
    if (!w) { showGate(true); return; }
    $('ksGateStatus').textContent = 'Waiting for KRAY Wallet… check the extension popup.';
    Promise.resolve().then(function () { return w.requestAccounts(); }).then(function (r) {
      if (r && r.address) { $('ksGateStatus').textContent = ''; enter(r.address); }
      else $('ksGateStatus').textContent = 'Connection refused or wallet locked. Click the KRAY icon in your browser toolbar to unlock it, then try again.';
    }).catch(function () {
      $('ksGateStatus').textContent = 'The wallet did not respond or the connection was refused. Try again.';
    });
  }

  /* the extension may inject window.krayWallet after DOMContentLoaded */
  function trySilent(attempt) {
    var w = window.krayWallet;
    if (!w) {
      if (attempt < 4) { setTimeout(function () { trySilent(attempt + 1); }, 350); return; }
      showGate(true);
      return;
    }
    showGate(false);
    Promise.resolve().then(function () { return w.connect ? w.connect() : w.getAccounts(); }).then(function (r) {
      var addr = (r && r.address) || (Array.isArray(r) && r[0]);
      if (addr) enter(addr);
    }).catch(function () { /* stay on the gate; user connects by click */ });
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

    $('ksConnect').addEventListener('click', connectClick);

    /* internal result links search in place */
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[data-q]') : null;
      if (!a) return;
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      search(a.getAttribute('data-q'));
    });

    window.addEventListener('popstate', function () {
      if (!entered) return;
      var q = fromUrl();
      if (q) search(q, false); else hideAll();
    });

    /* gate first; the search only opens for a connected wallet */
    var saved = null;
    try { saved = sessionStorage.getItem('ksAddr'); } catch (e) {}
    if (saved && /^bc1[a-z0-9]{20,90}$/i.test(saved)) enter(saved);
    else trySilent(0);
  });
})();
