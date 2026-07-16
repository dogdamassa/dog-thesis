/* DOG ARMY. DogMarket proxy — the runes atomic-swap marketplace, server-side.
   Mirrors kray.space's /rune/DOG•GO•TO•THE•MOON marketplace so the DOG Army
   can browse DOG listings and buy/sell straight through KrayWallet. Same CORS
   rationale as the sibling functions: kray.space blocks foreign-Origin browser
   calls (HTTP 500), so every read/write is proxied here. Signing always
   happens inside the user's wallet — this function never sees a key or seed.

   DOG-scoped on purpose (like api/dao.js): this is the DOG army's market, so
   listings are filtered to DOG and new listings are refused for other runes.
   A fixed ?ep= whitelist keeps the function from becoming an open relay.

   GET   ?ep=listings                     -> open DOG packages (filtered)
   GET   ?ep=order&id=<order_id>          -> one listing
   GET   ?ep=rune                         -> DOG rune header (supply/holders)
   GET   ?ep=utxos&addr=<bc1p…>           -> a wallet's spendable UTXOs
   GET   ?ep=myrunes&addr=<bc1p…>         -> a wallet's rune balances (to list)
   GET   ?ep=output&outpoint=<txid:vout>  -> one UTXO's script + value
   GET   ?ep=fees                         -> mempool fee estimates
   POST  ?ep=buy&id=<order_id>            -> build the buyer's atomic-swap PSBT
   POST  ?ep=broadcast&id=<order_id>      -> broadcast the signed swap
   POST  ?ep=bundle-buy | bundle-broadcast-> multi-pack cart flow
   POST  ?ep=create                       -> list a DOG package for sale
   POST  ?ep=sign&id=<order_id>           -> submit the seller-signed listing
   DELETE?ep=cancel&id=<order_id>         -> cancel your own listing            */

var kray = require('./_kray.js');

var SWAP = kray.KRAY + '/api/runes-atomic-swap';
var DOG = 'DOG•GO•TO•THE•MOON';           /* etched spaced name */
var MEMPOOL_FEES = 'https://mempool.space/api/v1/fees/recommended';

var ORDER_RX = /^[a-z0-9_]{8,80}$/i;                 /* rune_swap_<hex> / swap_<hex> */
var OUTPOINT_RX = /^[0-9a-f]{64}:[0-9]{1,6}$/i;

/* letters-only rune identity — kray names may carry a trailing symbol */
function normRune(name) { return String(name || '').replace(/[^A-Za-z]/g, '').toUpperCase(); }
function isDog(name) { return normRune(name) === 'DOGGOTOTHEMOON'; }

/* Relay an upstream JSON response verbatim (status + body) so the browser sees
   real marketplace errors ("Insufficient pure BTC", "Session expired", …)
   instead of a flattened 502. `fresh` optionally sets an edge-cache header. */
function relay(url, init, res, fresh) {
  var opts = init || {};
  opts.signal = AbortSignal.timeout(opts.timeoutMs || 25000);
  delete opts.timeoutMs;
  return fetch(url, opts).then(function (r) {
    return r.json().catch(function () { return { success: false, error: 'bad-upstream' }; })
      .then(function (data) {
        var code = (r.status >= 200 && r.status <= 599) ? r.status : 502;
        if (fresh && r.ok) res.setHeader('Cache-Control', fresh);
        res.status(code).json(data);
      });
  }).catch(function () {
    res.status(502).json({ success: false, error: 'upstream' });
  });
}

function postInit(body) {
  return { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) };
}

module.exports = async function handler(req, res) {
  var q = req.query || {};
  var ep = String(q.ep || '');
  var id = String(q.id || '');
  var method = req.method;

  /* ── DELETE: cancel your own listing ─────────────────────────────── */
  if (method === 'DELETE') {
    if (ep !== 'cancel' || !ORDER_RX.test(id)) { res.status(400).json({ success: false, error: 'bad-request' }); return; }
    await relay(SWAP + '/' + encodeURIComponent(id), { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body || {}) }, res);
    return;
  }

  /* ── POST: value-moving flows (wallet already signed client-side) ─── */
  if (method === 'POST') {
    var body = req.body || {};
    if (ep === 'buy') {
      if (!ORDER_RX.test(id)) { res.status(400).json({ success: false, error: 'bad-order' }); return; }
      await relay(SWAP + '/' + encodeURIComponent(id) + '/buy', postInit(body), res);
      return;
    }
    if (ep === 'broadcast') {
      if (!ORDER_RX.test(id)) { res.status(400).json({ success: false, error: 'bad-order' }); return; }
      await relay(SWAP + '/' + encodeURIComponent(id) + '/broadcast', postInit(body), res);
      return;
    }
    if (ep === 'sign') {
      if (!ORDER_RX.test(id)) { res.status(400).json({ success: false, error: 'bad-order' }); return; }
      await relay(SWAP + '/' + encodeURIComponent(id) + '/sign', postInit(body), res);
      return;
    }
    if (ep === 'create') {
      /* keep DogMarket a DOG market: refuse listings of any other rune */
      if (!isDog(body.rune_name)) { res.status(400).json({ success: false, error: 'dog-only' }); return; }
      if (!kray.isTaproot(String(body.seller_payout_address || ''))) { res.status(400).json({ success: false, error: 'bad-address' }); return; }
      await relay(SWAP + '/', postInit(body), res);
      return;
    }
    if (ep === 'bundle-buy') {
      await relay(SWAP + '/bundle/buy', postInit(body), res);
      return;
    }
    if (ep === 'bundle-broadcast') {
      await relay(SWAP + '/bundle/broadcast', postInit(body), res);
      return;
    }
    res.status(400).json({ success: false, error: 'bad-ep' });
    return;
  }

  if (method !== 'GET') { res.status(405).json({ success: false, error: 'method' }); return; }

  var fresh = 'public, s-maxage=15, stale-while-revalidate=120';
  var stable = 'public, s-maxage=120, stale-while-revalidate=600';

  try {
    /* ── open DOG packages ────────────────────────────────────────── */
    if (ep === 'listings') {
      var all = await kray.getJson(SWAP + '/?limit=250');
      var listings = (all.listings || []).filter(function (l) {
        return isDog(l.rune_name) && String(l.status || '').toUpperCase() === 'OPEN';
      });
      res.setHeader('Cache-Control', fresh);
      res.status(200).json({ success: true, count: listings.length, listings: listings });
      return;
    }

    /* ── one listing ──────────────────────────────────────────────── */
    if (ep === 'order') {
      if (!ORDER_RX.test(id)) { res.status(400).json({ success: false, error: 'bad-order' }); return; }
      await relay(SWAP + '/' + encodeURIComponent(id), {}, res, fresh);
      return;
    }

    /* ── DOG rune header (hardcoded; this is the DOG market) ───────── */
    if (ep === 'rune') {
      await relay(kray.KRAY + '/api/explorer/rune/' + encodeURIComponent(DOG), {}, res, stable);
      return;
    }

    /* ── wallet-specific reads (never cached) ─────────────────────── */
    if (ep === 'utxos' || ep === 'myrunes') {
      var addr = String(q.addr || '');
      if (!kray.isTaproot(addr)) { res.status(400).json({ success: false, error: 'bad-address' }); return; }
      var path = ep === 'utxos' ? '/api/wallet/utxos/' : '/api/runes/fast/';
      res.setHeader('Cache-Control', 'no-store');
      await relay(kray.KRAY + path + encodeURIComponent(addr), { timeoutMs: 25000 }, res);
      return;
    }

    if (ep === 'output') {
      var outpoint = String(q.outpoint || '');
      if (!OUTPOINT_RX.test(outpoint)) { res.status(400).json({ success: false, error: 'bad-outpoint' }); return; }
      await relay(kray.KRAY + '/api/output/' + encodeURIComponent(outpoint), {}, res, fresh);
      return;
    }

    /* ── mempool fee estimates (proxied so we keep connect-src tight) ─ */
    if (ep === 'fees') {
      var f = await kray.getJson(MEMPOOL_FEES, { timeoutMs: 8000 });
      res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=120');
      res.status(200).json({
        success: true,
        fees: {
          slow: f.hourFee || 5,
          medium: f.halfHourFee || 10,
          fast: f.fastestFee || 15
        }
      });
      return;
    }

    res.status(400).json({ success: false, error: 'bad-ep' });
  } catch (e) {
    var m = String(e && e.message);
    if (/upstream-(400|404|422|500)/.test(m)) res.status(404).json({ success: false, error: 'not-found' });
    else res.status(502).json({ success: false, error: 'upstream' });
  }
};
