/* DOG ARMY. Dev Scroll proxy — mission rewards paid from KRAY's escrow.
   The scroll_key is SECRET and lives only in the KRAY_SCROLL_KEY env var
   (never in the frontend, per kray.space/developers).
   GET  -> public pool status (+ claimed flag when ?address= is given)
   POST -> forwards the user's signed claim to KRAY with the scroll_key.
   While KRAY_SCROLL_KEY is unset the module reports {active:false} and the
   page shows the "arming" state. */

var kray = require('./_kray.js');

function poolInfo(info) {
  /* whitelist the public fields; never echo the key or internals */
  return {
    title: info.title || '',
    description: info.description || '',
    reward_per_claim: info.reward_per_claim,
    claims_completed: info.claims_completed,
    claims_remaining: info.claims_remaining,
    pool_remaining: info.pool_remaining,
    total_pool: info.total_pool,
    claim_mode: info.claim_mode || 'open',
    pool_token: info.pool_token || 'KRAY',
    is_active: info.is_active !== false
  };
}

module.exports = async function handler(req, res) {
  var key = process.env.KRAY_SCROLL_KEY || '';

  if (req.method === 'GET') {
    if (!key) {
      res.setHeader('Cache-Control', 's-maxage=300');
      res.status(200).json({ success: true, active: false });
      return;
    }
    try {
      var info = await kray.getJson(kray.KRAY + '/api/dev-scroll/info/' + key);
      var out = { success: true, active: true, pool: poolInfo(info) };
      var address = String((req.query && req.query.address) || '');
      if (kray.isTaproot(address)) {
        try {
          var c = await kray.getJson(kray.KRAY + '/api/dev-scroll/check-claim/' + key + '/' + address);
          out.claimed = c.claimed === true;
        } catch (e) {}
      }
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
      res.status(200).json(out);
    } catch (e) {
      res.status(502).json({ success: false, error: 'upstream' });
    }
    return;
  }

  if (req.method === 'POST') {
    if (!key) { res.status(503).json({ success: false, error: 'inactive' }); return; }
    var b = req.body || {};
    var addr = String(b.user_address || '');
    var msg = String(b.user_message || '');
    /* the message the wallet signed must be exactly the canonical claim */
    var m = /^scroll_claim:reward:(bc1p[ac-hj-np-z02-9]{20,90}):(\d{13})$/i.exec(msg);
    if (!kray.isTaproot(addr) || !kray.isHex(String(b.user_pubkey || ''), 64) ||
        !kray.isHex(String(b.user_signature || ''), 128) || !m || m[1] !== addr) {
      res.status(400).json({ success: false, error: 'bad-request' });
      return;
    }
    /* 15 min: the timestamp is minted BEFORE the wallet popup, and users can
       sit on the confirmation. KRAY enforces its own replay rules upstream. */
    if (Math.abs(Date.now() - Number(m[2])) > 15 * 60 * 1000) {
      res.status(400).json({ success: false, error: 'stale' });
      return;
    }
    try {
      var r = await fetch(kray.KRAY + '/api/dev-scroll/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          scroll_key: key,
          user_address: addr,
          user_pubkey: b.user_pubkey,
          user_signature: b.user_signature,
          user_message: msg
        })
      });
      var data = await r.json();
      res.status(r.ok ? 200 : 502).json({
        success: data.success === true,
        tx_id: data.tx_id,
        reward: data.reward,
        reward_token: data.reward_token,
        claims_remaining: data.claims_remaining,
        error: data.success === true ? undefined : String(data.error || 'claim-failed')
      });
    } catch (e) {
      res.status(502).json({ success: false, error: 'upstream' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'method' });
};
