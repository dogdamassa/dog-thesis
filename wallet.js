/* DOG ARMY. KRAY Wallet connect (kray.space).
   Read-only on purpose: detects window.krayWallet, asks permission via
   requestAccounts(), then shows the visitor their own address, BTC and $DOG
   straight from the chain. The site never signs or moves anything.
   External file on purpose: script-src 'self' in vercel.json allows it
   without touching the inline-script CSP hashes. */
(function () {
  var LSKEY = 'dogArmyKrayConnected';
  var DSCKEY = 'dogArmyDsc';
  var DSC_TTL = 6 * 60 * 60 * 1000;
  var KRAY_THUMB = 'https://www.kray.space/api/rune-thumbnail/';

  function $(id) { return document.getElementById(id); }
  function kray() { return typeof window.krayWallet !== 'undefined' ? window.krayWallet : null; }
  function short(addr) { return addr ? addr.slice(0, 6) + '…' + addr.slice(-4) : '—'; }

  function addrFrom(res) {
    if (!res) return '';
    if (typeof res === 'string') return res;
    if (Array.isArray(res)) return res[0] || '';
    if (res.address) return res.address;
    if (Array.isArray(res.accounts)) return res.accounts[0] || '';
    return '';
  }

  /* KRAY returns getBalance() in satoshis; some wallet APIs return
     {confirmed,total} objects instead, so accept both. */
  function sats(value) {
    if (typeof value === 'number' && isFinite(value)) return value;
    if (value && typeof value === 'object') {
      var v = value.total != null ? value.total : value.confirmed;
      v = Number(v);
      if (isFinite(v)) return v;
    }
    return null;
  }

  function fmtBtc(satoshis) {
    if (satoshis == null) return '—';
    var btc = satoshis / 1e8;
    return btc.toLocaleString('en-US', { maximumFractionDigits: 8 }) + ' BTC';
  }

  function findDogRune(runes) {
    if (!Array.isArray(runes)) return null;
    for (var i = 0; i < runes.length; i++) {
      var r = runes[i] || {};
      /* KRAY's rune name may carry a trailing emoji (e.g. "DOG•GO•TO•THE•MOON 🐕"),
         so match on letters only. */
      var name = r.spacedRune || r.spaced_rune || r.displayName || r.name || r.rune || r.ticker || '';
      if (String(name).replace(/[^A-Za-z]/g, '').toUpperCase() === 'DOGGOTOTHEMOON') return r;
    }
    return null;
  }

  /* Amount shapes, per KRAY's own popup code (formatRuneFromObject):
     wallet list -> {rawAmount, divisibility}; UTXO runes -> {amount: {amount,
     divisibility}}; fallback -> amount/balance already in display units. */
  function runeAmount(r) {
    if (!r) return null;
    if (r.rawAmount != null) {
      var raw = Number(r.rawAmount);
      if (!isFinite(raw)) return null;
      return raw / Math.pow(10, Number(r.divisibility) || 0);
    }
    if (r.amount && typeof r.amount === 'object') {
      var nested = Number(r.amount.amount);
      if (!isFinite(nested)) return null;
      return nested / Math.pow(10, Number(r.amount.divisibility) || 0);
    }
    var amt = Number(r.amount != null ? r.amount : r.balance);
    return isFinite(amt) ? amt : null;
  }

  function fmtDog(amount) {
    if (amount == null) return '—';
    return amount.toLocaleString('en-US', { maximumFractionDigits: 2 }) + ' DOG';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var btn = $('walletBtn');
    var modal = $('walletModal');
    var scrim = $('walletScrim');
    if (!btn || !modal || !scrim) return;

    var drawerBtn = $('walletBtnDrawer');
    var closeBtn = $('walletClose');
    var connectBtn = $('walletConnect');
    var disconnectBtn = $('walletDisconnect');
    var btnText = $('walletBtnText');
    var btnAddr = $('walletBtnAddr');
    var errEl = $('walletErr');
    var lockedEl = $('walletLocked');
    var states = { none: $('walletNone'), ready: $('walletReady'), busy: $('walletBusy'), info: $('walletInfo') };
    var out = { addr: $('walletAddr'), dog: $('walletDog'), btc: $('walletBtc') };
    var pfps = [$('walletBtnPfp'), $('walletBtnPfpDrawer')];
    var dscRow = $('walletDscRow');
    var dscImg = $('walletDscImg');
    var connected = false;
    var address = '';
    var dogAmt = null;   /* last $DOG read; null = not read yet ("checking") */

    /* Home widgets (homechat.js) observe the wallet through this snapshot +
       event instead of reaching into the modal's DOM. Same pattern as the
       site's dog:lang event. */
    function emitWallet() {
      var snap = { connected: connected, address: address, dogAmount: dogAmt };
      if (window.DogWallet) window.DogWallet.state = snap;
      try { document.dispatchEvent(new CustomEvent('dog:wallet', { detail: snap })); } catch (e) {}
    }
    window.DogWallet = {
      state: { connected: false, address: '', dogAmount: null },
      open: function () { openModal(); }
    };

    function showState(name) {
      for (var k in states) { if (states[k]) states[k].hidden = k !== name; }
      if (errEl) errEl.hidden = true;
      if (lockedEl) lockedEl.hidden = true;
    }

    function openModal() {
      showState(connected ? 'info' : (kray() ? 'ready' : 'none'));
      modal.hidden = false;
      scrim.hidden = false;
      document.body.classList.add('wallet-open');
      if (connected) refreshData();
    }

    function closeModal() {
      modal.hidden = true;
      scrim.hidden = true;
      document.body.classList.remove('wallet-open');
    }

    function renderButton() {
      btn.classList.toggle('is-connected', connected);
      if (btnText) btnText.hidden = connected;
      if (btnAddr) {
        btnAddr.hidden = !connected;
        btnAddr.textContent = short(address);
      }
    }

    /* DOG SOCIAL CLUB pfp — kray.space shows a holder's DSC as their avatar;
       we do the same. The lookup runs through our own /api/dsc proxy because
       KRAY's API only answers same-origin browsers. */
    function applyDsc(id) {
      var url = id ? KRAY_THUMB + encodeURIComponent(id) : '';
      for (var i = 0; i < pfps.length; i++) {
        if (!pfps[i]) continue;
        pfps[i].hidden = !id;
        if (id) pfps[i].src = url;
        else pfps[i].removeAttribute('src');
      }
      btn.classList.toggle('has-pfp', !!id);
      if (drawerBtn) drawerBtn.classList.toggle('has-pfp', !!id);
      if (dscRow) dscRow.hidden = !id;
      if (dscImg) {
        if (id) dscImg.src = url;
        else dscImg.removeAttribute('src');
      }
    }

    function checkDsc() {
      if (!connected || !address) return;
      var addr = address;
      try {
        var cached = JSON.parse(localStorage.getItem(DSCKEY) || 'null');
        if (cached && cached.a === addr && (Date.now() - cached.t) < DSC_TTL) {
          applyDsc(cached.id || null);
          return;
        }
      } catch (e) {}
      fetch('/api/dsc?address=' + encodeURIComponent(addr)).then(function (r) {
        return r.ok ? r.json() : null;
      }).then(function (data) {
        if (!data || !data.success || addr !== address) return;
        var id = data.dsc && data.dsc.id ? data.dsc.id : null;
        try { localStorage.setItem(DSCKEY, JSON.stringify({ a: addr, id: id, t: Date.now() })); } catch (e) {}
        if (connected) applyDsc(id);
      }).catch(function () {});
    }

    function refreshData() {
      var w = kray();
      if (!w || !connected) return;
      if (out.addr) out.addr.textContent = short(address);
      if (typeof w.getFullWalletData === 'function') {
        w.getFullWalletData().then(function (data) {
          if (!data) { emitWallet(); return; }
          if (out.btc) out.btc.textContent = fmtBtc(sats(data.balance));
          var dog = runeAmount(findDogRune(data.runes));
          if (out.dog) out.dog.textContent = fmtDog(dog);
          dogAmt = dog || 0;
          emitWallet();
        }).catch(function () { emitWallet(); });
      } else if (typeof w.getBalance === 'function') {
        w.getBalance().then(function (b) {
          if (out.btc) out.btc.textContent = fmtBtc(sats(b));
        }).catch(function () {});
      }
    }

    function connect(silent) {
      var w = kray();
      if (!w) { showState('none'); return; }
      if (!silent) showState('busy');
      var call = silent && typeof w.connect === 'function' ? w.connect() : w.requestAccounts();
      call.then(function (res) {
        /* KRAY returns {success:false, needsUserAction:true} when the wallet is
           locked (requestAccounts also asks the extension to open its popup). */
        if (res && res.success === false) {
          if (silent) {
            if (!res.needsUserAction) { try { localStorage.removeItem(LSKEY); } catch (e) {} }
            return;
          }
          showState('ready');
          if (res.needsUserAction && lockedEl) lockedEl.hidden = false;
          else if (errEl) errEl.hidden = false;
          return;
        }
        var a = addrFrom(res);
        if (!a) throw new Error('no-address');
        connected = true;
        address = a;
        try { localStorage.setItem(LSKEY, '1'); } catch (e) {}
        renderButton();
        showState('info');
        dogAmt = null;    /* fresh read lands via refreshData */
        emitWallet();
        refreshData();
        checkDsc();
      }).catch(function () {
        if (silent) return;
        showState('ready');
        if (errEl) errEl.hidden = false;
      });
    }

    function disconnect() {
      connected = false;
      address = '';
      dogAmt = null;
      try { localStorage.removeItem(LSKEY); localStorage.removeItem(DSCKEY); } catch (e) {}
      renderButton();
      applyDsc(null);
      showState(kray() ? 'ready' : 'none');
      emitWallet();
    }

    btn.addEventListener('click', openModal);
    var heroBtn = $('walletBtnHero');   /* big hero CTA on the home — same modal */
    if (heroBtn) heroBtn.addEventListener('click', openModal);
    if (drawerBtn) drawerBtn.addEventListener('click', function () {
      var navscrim = $('navscrim');
      if (navscrim && !navscrim.hidden) navscrim.click();
      openModal();
    });
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    scrim.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && !modal.hidden) closeModal();
    });
    if (connectBtn) connectBtn.addEventListener('click', function () { connect(false); });
    if (disconnectBtn) disconnectBtn.addEventListener('click', disconnect);

    /* If KRAY's thumbnail ever fails to load, fall back to the plain dot. */
    var pfpEls = pfps.concat([dscImg]);
    for (var pi = 0; pi < pfpEls.length; pi++) {
      if (pfpEls[pi]) pfpEls[pi].addEventListener('error', function () { applyDsc(null); });
    }

    /* Returning visitor: reconnect silently (no popup) if they connected before.
       The extension injects window.krayWallet asynchronously, so poll briefly. */
    var wants = false;
    try { wants = localStorage.getItem(LSKEY) === '1'; } catch (e) {}
    if (wants) {
      var tries = 0;
      var timer = setInterval(function () {
        tries++;
        if (kray()) { clearInterval(timer); connect(true); }
        else if (tries > 10) { clearInterval(timer); }
      }, 250);
    }
  });
})();
