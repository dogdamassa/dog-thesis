/* DOG ARMY. L2 KRAY tip jar — "municie o QG".
   The visitor signs the canonical L2 transfer message with their KrayWallet
   (from:to:amount:nonce:transfer — the wallet ALWAYS opens the confirmation
   popup for L2 transactions) and we forward it to KRAY's L2. The recipient
   is fixed server-side (ARMY_TIP_ADDRESS env), so a tampered client cannot
   redirect funds — the signature wouldn't match anyway.
   GET ?address= -> {active, to, nonce} (nonce of the SIGNER's L2 account)
   POST          -> forwards the signed transfer, returns {tx_hash}. */

var kray = require('./_kray.js');

var MAX_TIP = 100000; /* KRAY, sanity bound */

module.exports = async function handler(req, res) {
  var to = process.env.ARMY_TIP_ADDRESS || '';

  if (req.method === 'GET') {
    if (!kray.isTaproot(to)) {
      res.setHeader('Cache-Control', 's-maxage=300');
      res.status(200).json({ success: true, active: false });
      return;
    }
    var address = String((req.query && req.query.address) || '');
    if (!kray.isTaproot(address)) {
      /* no signer yet: just report that the module is live */
      res.status(200).json({ success: true, active: true });
      return;
    }
    try {
      var acct = await kray.getJson(kray.KRAY + '/l2/account/' + address + '/balance');
      res.status(200).json({
        success: true,
        active: true,
        to: to,
        nonce: Number(acct.nonce) || 0,
        balance_kray: acct.balance_kray != null ? String(acct.balance_kray) : '0'
      });
    } catch (e) {
      res.status(502).json({ success: false, error: 'upstream' });
    }
    return;
  }

  if (req.method === 'POST') {
    if (!kray.isTaproot(to)) { res.status(503).json({ success: false, error: 'inactive' }); return; }
    var b = req.body || {};
    var from = String(b.from_address || '');
    var amount = Number(b.amount);
    var nonce = Number(b.nonce);
    if (!kray.isTaproot(from) || from === to ||
        !Number.isInteger(amount) || amount < 1 || amount > MAX_TIP ||
        !Number.isInteger(nonce) || nonce < 0 ||
        !kray.isHex(String(b.pubkey || ''), 64) || !kray.isHex(String(b.signature || ''), 128)) {
      res.status(400).json({ success: false, error: 'bad-request' });
      return;
    }
    try {
      var r = await fetch(kray.KRAY + '/l2/transaction/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(20000),
        body: JSON.stringify({
          from_account: from,
          to_account: to,
          amount: String(amount),
          tx_type: 'transfer',
          token_symbol: 'KRAY',
          signature: b.signature,
          pubkey: b.pubkey,
          nonce: nonce,
          memo: 'DOG ARMY HQ tip',
          data: JSON.stringify({ app: 'dogarmy', action: 'tip' })
        })
      });
      var data = await r.json();
      var ok = r.ok && (data.tx_hash || data.success === true);
      res.status(ok ? 200 : 502).json({
        success: !!ok,
        tx_hash: data.tx_hash || data.tx_id,
        error: ok ? undefined : String(data.error || 'tx-failed')
      });
    } catch (e) {
      res.status(502).json({ success: false, error: 'upstream' });
    }
    return;
  }

  res.status(405).json({ success: false, error: 'method' });
};
